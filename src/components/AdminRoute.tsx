import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Center, Spinner, Text, VStack, Button } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';

interface AdminRouteProps {
	children: React.ReactNode;
}

const AdminRoute: React.FC<AdminRouteProps> = ({ children }) => {
	const { user, loading } = useAuth();
	const navigate = useNavigate();
	const [checking, setChecking] = React.useState(true);
	const [isAdmin, setIsAdmin] = React.useState(false);
	const [error, setError] = React.useState<string | null>(null);

	React.useEffect(() => {
		const verify = async () => {
			if (loading) return;
			if (!user?.email) {
				setChecking(false);
				setIsAdmin(false);
				return;
			}
			setChecking(true);
			setError(null);
			try {
				const backoffs = [0, 300, 600];
				for (let i = 0; i < backoffs.length; i++) {
					if (backoffs[i]) await new Promise(r => setTimeout(r, backoffs[i]));
					const res = await Promise.race([
						supabase
							.from('admin_users')
							.select('id')
							.eq('email', user.email)
							.eq('role', 'admin')
							.single(),
						new Promise<any>((_, reject) => setTimeout(() => reject(new Error('admin_users check timeout')), 8000))
					]);
					if (!res.error && res.data) {
						setIsAdmin(true);
						break;
					}
					if (i === backoffs.length - 1) {
						setIsAdmin(false);
						setError(res.error?.message || 'Not authorized');
					}
				}
			} catch (e: any) {
				setIsAdmin(false);
				setError(e?.message || 'Authorization failed');
			} finally {
				setChecking(false);
			}
		};
		verify();
	}, [user?.email, loading]);

	if (loading || checking) {
		return (
			<Center minH="60vh">
				<VStack>
					<Spinner size="lg" />
					<Text color="gray.600">Verifying admin access…</Text>
				</VStack>
			</Center>
		);
	}

	if (!isAdmin) {
		return (
			<Center minH="60vh">
				<VStack spacing={4}>
					<Text fontWeight="bold">Admin access required</Text>
					{error && <Text color="gray.600" fontSize="sm">{error}</Text>}
					<Button onClick={() => navigate('/admin-login')} colorScheme="blue" variant="solid">Go to Admin Login</Button>
				</VStack>
			</Center>
		);
	}

	return <>{children}</>;
};

export default AdminRoute;



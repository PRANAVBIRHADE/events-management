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
			console.log('🔍 AdminRoute: Starting admin verification');
			console.log('👤 User:', user);
			console.log('⏳ Loading:', loading);
			
			if (loading) {
				console.log('⏳ AdminRoute: Still loading, waiting...');
				return;
			}
			if (!user?.email) {
				console.log('❌ AdminRoute: No user email, not admin');
				setChecking(false);
				setIsAdmin(false);
				return;
			}
			
			console.log('🔍 AdminRoute: Verifying admin access for:', user.email);
			setChecking(true);
			setError(null);
			try {
				// First, test basic connection without timeout
				console.log('🔍 AdminRoute: Testing basic connection...');
				const basicTest = await supabase
					.from('admin_users')
					.select('count')
					.limit(1);
				console.log('📊 AdminRoute: Basic connection test:', basicTest);
				
				const backoffs = [0, 300, 600];
				for (let i = 0; i < backoffs.length; i++) {
					if (backoffs[i]) {
						console.log(`⏳ AdminRoute: Retry ${i + 1}, waiting ${backoffs[i]}ms`);
						await new Promise(r => setTimeout(r, backoffs[i]));
					}
					console.log('🔍 AdminRoute: Querying admin_users table...');
					console.log('🔍 AdminRoute: Attempting query with 30-second timeout...');
					const res = await Promise.race([
						supabase
							.from('admin_users')
							.select('id')
							.eq('email', user.email)
							.eq('role', 'admin')
							.single(),
						new Promise<any>((_, reject) => setTimeout(() => reject(new Error('admin_users check timeout after 30 seconds')), 30000))
					]);
					console.log('📊 AdminRoute: Query result:', res);
					if (!res.error && res.data) {
						console.log('✅ AdminRoute: Admin access confirmed');
						setIsAdmin(true);
						break;
					}
					if (i === backoffs.length - 1) {
						console.log('❌ AdminRoute: Admin access denied:', res.error);
						setIsAdmin(false);
						setError(res.error?.message || 'Not authorized');
					}
				}
			} catch (e: any) {
				console.error('❌ AdminRoute: Verification error:', e);
				setIsAdmin(false);
				setError(e?.message || 'Authorization failed');
			} finally {
				console.log('🏁 AdminRoute: Verification complete');
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



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
				// Try database query first with short timeout
				console.log('🔍 AdminRoute: Attempting database query with 5-second timeout...');
				const dbQuery = Promise.race([
					supabase
						.from('admin_users')
						.select('id')
						.eq('email', user.email)
						.single(),
					new Promise<any>((_, reject) => setTimeout(() => reject(new Error('Database query timeout')), 5000))
				]);
				
				try {
					const res = await dbQuery;
					console.log('📊 AdminRoute: Database query successful:', res);
					if (!res.error && res.data) {
						console.log('✅ AdminRoute: Admin access confirmed via database');
						setIsAdmin(true);
					} else {
						throw new Error('Database query failed: ' + (res.error?.message || 'No data'));
					}
				} catch (dbError: any) {
					console.log('⚠️ AdminRoute: Database query failed, falling back to email check:', dbError?.message || 'Unknown error');
					
					// Fallback to email-based check
					const adminEmails = [
						'admin@spark2k25.com',
						'admin@freshersparty.com'
					];
					
					const isAdminEmail = adminEmails.includes(user.email);
					console.log('📧 AdminRoute: Email check for:', user.email, 'is admin:', isAdminEmail);
					
					if (isAdminEmail) {
						console.log('✅ AdminRoute: Admin access confirmed via email fallback');
						setIsAdmin(true);
					} else {
						console.log('❌ AdminRoute: Not an admin email');
						setIsAdmin(false);
						setError('Not an authorized administrator');
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



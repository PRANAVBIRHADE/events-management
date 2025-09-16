import React from 'react';
import { Box, Container, Center } from '@chakra-ui/react';
import AdminLogin from '../components/AdminLogin';

const AdminLoginPage: React.FC = () => {
	return (
		<Box minH="100vh" bg="gray.50">
			<Container maxW="container.sm" py={10}>
				<Center>
					<AdminLogin onLoginSuccess={() => (window.location.href = '/admin-dashboard')} />
				</Center>
			</Container>
		</Box>
	);
};

export default AdminLoginPage;

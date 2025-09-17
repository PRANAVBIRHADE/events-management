import React from 'react';
import { Box, Flex, Button, Spacer } from '@chakra-ui/react';
import { Link, useNavigate } from 'react-router-dom';

const Navbar: React.FC = () => {
  const navigate = useNavigate();
  return (
    <Box bg="teal.500" px={4} py={2} color="white">
      <Flex align="center">
        <Button variant="link" color="white" mr={4} onClick={() => navigate('/')}>Home</Button>
        <Button variant="link" color="white" mr={4} onClick={() => navigate('/profile')}>Profile</Button>
        <Spacer />
        <Button variant="link" color="white" onClick={() => navigate('/admin-dashboard')}>Admin Dashboard</Button>
      </Flex>
    </Box>
  );
};

export default Navbar;

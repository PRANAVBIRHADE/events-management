import React from 'react';
import { Box, Heading, Button, VStack } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  return (
    <Box p={8} textAlign="center">
      <Heading mb={8}>Welcome to the Freshers Party!</Heading>
      <VStack spacing={4}>
        <Button colorScheme="teal" onClick={() => navigate('/event/1')}>Register for Event</Button>
        <Button onClick={() => navigate('/admin-login')}>Admin Login</Button>
      </VStack>
    </Box>
  );
};

export default LandingPage;

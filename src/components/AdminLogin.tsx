import React, { useState } from 'react';
import {
  Box,
  Container,
  Heading,
  Text,
  Input,
  Button,
  Icon,
  Flex,
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { FaLock, FaUser, FaSignInAlt } from 'react-icons/fa';
import { supabase } from '../lib/supabase';

const MotionBox = motion(Box);

interface AdminLoginProps {
  onLoginSuccess: () => void;
}

const AdminLogin: React.FC<AdminLoginProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      setError('Please fill all fields');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      setSuccess('Login successful! Welcome to the admin dashboard');
      onLoginSuccess();
    } catch (error: any) {
      console.error('Login error:', error);
      setError(error.message || 'Invalid credentials');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box minH="100vh" bg="linear-gradient(135deg, #667eea 0%, #764ba2 100%)" py={8}>
      <Container maxW="container.sm">
        <MotionBox
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Flex direction="column" align="center" gap={8}>
            {/* Header */}
            <Flex direction="column" align="center" gap={4} textAlign="center">
              <Heading
                as="h1"
                size="2xl"
                color="white"
                textShadow="0 2px 4px rgba(0,0,0,0.3)"
              >
                Admin Login
              </Heading>
              <Text
                color="white"
                fontSize="lg"
                textShadow="0 1px 2px rgba(0,0,0,0.3)"
              >
                Access the Fresher's Party 2K25 Admin Dashboard
              </Text>
            </Flex>

            {/* Login Form */}
            <MotionBox
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              bg="white"
              p={8}
              borderRadius="xl"
              boxShadow="0 20px 40px rgba(0,0,0,0.1)"
              w="100%"
              maxW="400px"
            >
              <form onSubmit={handleLogin}>
                <Flex direction="column" gap={6}>
                  <Box>
                    <Text fontSize="lg" fontWeight="bold" color="gray.700" mb={2}>
                      <Icon as={FaUser} mr={2} />
                      Email Address
                    </Text>
                    <Input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter admin email"
                      size="lg"
                      borderColor="gray.300"
                      _focus={{
                        borderColor: 'pink.400',
                        boxShadow: '0 0 0 1px rgba(255, 0, 128, 0.2)',
                      }}
                    />
                  </Box>

                  <Box>
                    <Text fontSize="lg" fontWeight="bold" color="gray.700" mb={2}>
                      <Icon as={FaLock} mr={2} />
                      Password
                    </Text>
                    <Input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter password"
                      size="lg"
                      borderColor="gray.300"
                      _focus={{
                        borderColor: 'blue.400',
                        boxShadow: '0 0 0 1px rgba(0, 255, 255, 0.2)',
                      }}
                    />
                  </Box>

                  {error && (
                    <Box p={3} bg="red.50" borderRadius="md" border="1px solid" borderColor="red.200">
                      <Text color="red.600" fontSize="sm">{error}</Text>
                    </Box>
                  )}

                  {success && (
                    <Box p={3} bg="green.50" borderRadius="md" border="1px solid" borderColor="green.200">
                      <Text color="green.600" fontSize="sm">{success}</Text>
                    </Box>
                  )}

                  <Button
                    type="submit"
                    variant="solid"
                    size="lg"
                    w="full"
                    h="50px"
                    fontSize="lg"
                    fontWeight="bold"
                    isLoading={isLoading}
                    loadingText="Signing in..."
                    disabled={isLoading}
                    bg="linear-gradient(135deg, #ff0080, #00ffff)"
                    color="white"
                    _hover={{
                      bg: "linear-gradient(135deg, #00ffff, #ff0080)",
                      transform: "scale(1.02)",
                    }}
                    _active={{
                      transform: "scale(0.98)",
                    }}
                    transition="all 0.3s ease"
                  >
                    <Icon as={FaSignInAlt} mr={2} />
                    Sign In
                  </Button>
                </Flex>
              </form>
            </MotionBox>

            {/* Demo Credentials Info */}
            <Box p={4} bg="blue.50" borderRadius="lg" maxW="400px" border="1px solid" borderColor="blue.200">
              <Text fontWeight="bold" fontSize="sm" color="blue.800" mb={2}>
                Demo Credentials:
              </Text>
              <Text fontSize="sm" color="blue.700">
                Email: admin@freshersparty.com<br />
                Password: admin123
              </Text>
            </Box>
          </Flex>
        </MotionBox>
      </Container>
    </Box>
  );
};

export default AdminLogin;
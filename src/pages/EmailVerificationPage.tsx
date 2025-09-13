import React, { useEffect, useState } from 'react';
import {
  Box,
  VStack,
  Text,
  Spinner,
  Icon,
  Button,
  useToast,
} from '@chakra-ui/react';
import { FaEnvelope, FaCheckCircle } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabase';

const MotionBox = motion(Box);

const EmailVerificationPage: React.FC = () => {
  const [status, setStatus] = useState<'pending' | 'verifying' | 'success' | 'error'>('pending');
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();

  useEffect(() => {
    // Check for verification token in URL
    const params = new URLSearchParams(location.search);
    const type = params.get('type');
    const access_token = params.get('access_token');
    const refresh_token = params.get('refresh_token');

    if (type === 'signup' && access_token && refresh_token) {
      setStatus('verifying');
      // Set session with tokens
      supabase.auth.setSession({
        access_token,
        refresh_token,
      }).then(({ error }) => {
        if (error) {
          setStatus('error');
          setErrorMessage(error.message);
        } else {
          setStatus('success');
          toast({
            title: 'Email verified!',
            description: 'Your account has been verified. You can now log in.',
            status: 'success',
            duration: 5000,
            isClosable: true,
          });
          setTimeout(() => navigate('/login'), 2000);
        }
      });
    }
  }, [location, navigate, toast]);

  if (status === 'verifying') {
    return (
      <Box minH="100vh" bg="linear-gradient(135deg, #667eea 0%, #764ba2 100%)" display="flex" alignItems="center" justifyContent="center">
        <MotionBox
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          bg="white"
          p={8}
          borderRadius="xl"
          shadow="2xl"
          maxW="md"
          w="full"
          mx={4}
          textAlign="center"
        >
          <VStack spacing={6}>
            <Spinner color="blue.500" size="xl" />
            <Text fontSize="xl" color="gray.700">Verifying your email...</Text>
          </VStack>
        </MotionBox>
      </Box>
    );
  }

  if (status === 'success') {
    return (
      <Box minH="100vh" bg="linear-gradient(135deg, #667eea 0%, #764ba2 100%)" display="flex" alignItems="center" justifyContent="center">
        <MotionBox
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          bg="white"
          p={8}
          borderRadius="xl"
          shadow="2xl"
          maxW="md"
          w="full"
          mx={4}
          textAlign="center"
        >
          <VStack spacing={6}>
            <Icon as={FaCheckCircle} boxSize={16} color="green.500" />
            <Text fontSize="2xl" fontWeight="bold" color="green.500">
              Email Verified! 🎉
            </Text>
            <Text color="gray.600">
              Your account has been successfully verified.<br />Redirecting to login page...
            </Text>
            <Spinner color="green.500" />
          </VStack>
        </MotionBox>
      </Box>
    );
  }

  if (status === 'error') {
    return (
      <Box minH="100vh" bg="linear-gradient(135deg, #667eea 0%, #764ba2 100%)" display="flex" alignItems="center" justifyContent="center">
        <MotionBox
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          bg="white"
          p={8}
          borderRadius="xl"
          shadow="2xl"
          maxW="md"
          w="full"
          mx={4}
          textAlign="center"
        >
          <VStack spacing={6}>
            <Text fontSize="2xl" fontWeight="bold" color="red.500">
              Verification Failed
            </Text>
            <Text color="gray.600">{errorMessage}</Text>
            <Button colorScheme="blue" onClick={() => navigate('/login')}>Go to Login</Button>
          </VStack>
        </MotionBox>
      </Box>
    );
  }

  // Default: show instructions
  return (
    <Box minH="100vh" bg="linear-gradient(135deg, #667eea 0%, #764ba2 100%)" display="flex" alignItems="center" justifyContent="center">
      <MotionBox
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        bg="white"
        p={8}
        borderRadius="xl"
        shadow="2xl"
        maxW="md"
        w="full"
        mx={4}
        textAlign="center"
      >
        <VStack spacing={6}>
          <Icon as={FaEnvelope} boxSize={16} color="blue.500" />
          <Text fontSize="2xl" fontWeight="bold" color="gray.800">
            Verify Your Email
          </Text>
          <Text color="gray.600">
            We've sent a verification link to your email address.<br />
            Please check your inbox and click the link to activate your account.
          </Text>
        </VStack>
      </MotionBox>
    </Box>
  );
};

export default EmailVerificationPage;

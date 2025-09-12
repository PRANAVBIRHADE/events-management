import React, { useState, useEffect } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Input,
  Button,
  Alert,
  AlertIcon,
  Spinner,
  useToast,
  Icon,
  Divider,
  Link as ChakraLink
} from '@chakra-ui/react';
import { FaEnvelope, FaCheckCircle, FaArrowLeft, FaRedo } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabase';

const MotionBox = motion(Box);

interface LocationState {
  email: string;
  userId: string;
}

const EmailVerificationPage: React.FC = () => {
  const [otp, setOtp] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<'pending' | 'success' | 'error'>('pending');
  const [errorMessage, setErrorMessage] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);
  
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();
  
  const state = location.state as LocationState;
  const email = state?.email;
  const userId = state?.userId;

  useEffect(() => {
    if (!email || !userId) {
      navigate('/signup');
      return;
    }

    // Start resend cooldown timer
    setResendCooldown(60);
    const timer = setInterval(() => {
      setResendCooldown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [email, userId, navigate]);

  const handleVerifyOTP = async () => {
    if (!otp.trim()) {
      setErrorMessage('Please enter the OTP');
      return;
    }

    if (otp.length !== 6) {
      setErrorMessage('OTP must be 6 digits');
      return;
    }

    setIsVerifying(true);
    setErrorMessage('');

    try {
      const { error } = await supabase.auth.verifyOtp({
        token: otp,
        type: 'signup',
        email: email
      });

      if (error) {
        setErrorMessage(error.message);
        setVerificationStatus('error');
      } else {
        setVerificationStatus('success');
        toast({
          title: 'Email verified successfully!',
          description: 'Your account has been created and verified.',
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
        
        // Redirect to login page after 2 seconds
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      }
    } catch (error) {
      setErrorMessage('An unexpected error occurred. Please try again.');
      setVerificationStatus('error');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendOTP = async () => {
    if (resendCooldown > 0) return;

    setIsResending(true);
    setErrorMessage('');

    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email
      });

      if (error) {
        setErrorMessage(error.message);
      } else {
        toast({
          title: 'OTP sent!',
          description: 'A new verification code has been sent to your email.',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
        setResendCooldown(60);
      }
    } catch (error) {
      setErrorMessage('Failed to resend OTP. Please try again.');
    } finally {
      setIsResending(false);
    }
  };

  const handleBackToSignup = () => {
    navigate('/signup');
  };

  if (verificationStatus === 'success') {
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
              Your account has been successfully created and verified.
            </Text>
            <Text color="gray.500" fontSize="sm">
              Redirecting to login page...
            </Text>
            <Spinner color="green.500" />
          </VStack>
        </MotionBox>
      </Box>
    );
  }

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
      >
        <VStack spacing={6}>
          <Icon as={FaEnvelope} boxSize={12} color="blue.500" />
          
          <VStack spacing={2} textAlign="center">
            <Text fontSize="2xl" fontWeight="bold" color="gray.800">
              Verify Your Email
            </Text>
            <Text color="gray.600">
              We've sent a 6-digit verification code to
            </Text>
            <Text fontWeight="semibold" color="blue.600">
              {email}
            </Text>
          </VStack>

          <VStack spacing={4} w="full">
            <Input
              placeholder="Enter 6-digit OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
              size="lg"
              textAlign="center"
              fontSize="xl"
              letterSpacing="0.2em"
              maxLength={6}
              isDisabled={isVerifying}
            />

            {errorMessage && (
              <Alert status="error" borderRadius="md">
                <AlertIcon />
                {errorMessage}
              </Alert>
            )}

            <Button
              onClick={handleVerifyOTP}
              colorScheme="blue"
              size="lg"
              w="full"
              isLoading={isVerifying}
              loadingText="Verifying..."
              isDisabled={!otp || otp.length !== 6}
            >
              Verify Email
            </Button>
          </VStack>

          <Divider />

          <VStack spacing={3} w="full">
            <Text color="gray.600" fontSize="sm" textAlign="center">
              Didn't receive the code?
            </Text>
            
            <Button
              onClick={handleResendOTP}
              variant="outline"
              size="sm"
              isLoading={isResending}
              loadingText="Sending..."
              isDisabled={resendCooldown > 0}
              leftIcon={<FaRedo />}
            >
              {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend OTP'}
            </Button>

            <Button
              onClick={handleBackToSignup}
              variant="ghost"
              size="sm"
              leftIcon={<FaArrowLeft />}
            >
              Back to Sign Up
            </Button>
          </VStack>
        </VStack>
      </MotionBox>
    </Box>
  );
};

export default EmailVerificationPage;

import React, { useState } from 'react';
import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  HStack,
  Button,
  Input,
  InputGroup,
  InputLeftElement,
  Icon,
  Alert,
  AlertIcon,
  useBreakpointValue,
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { FaEnvelope, FaLock, FaArrowLeft, FaEye, FaEyeSlash } from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';

const MotionBox = motion(Box);
const MotionButton = motion(Button);

interface UserLoginProps {
  onLoginSuccess: () => void;
}

const UserLogin: React.FC<UserLoginProps> = ({ onLoginSuccess }) => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const isMobile = useBreakpointValue({ base: true, md: false });
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      setError('Please fill all fields');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const { error } = await login(email, password);

      if (error) {
        // Handle email verification error
        if (error.message.includes('email_not_confirmed') || error.message.includes('Email not confirmed')) {
          setError('Please verify your email before logging in. Check your inbox for the verification link.');
        } else {
          throw error;
        }
        return;
      }

      setSuccess('Login successful! Redirecting to your dashboard...');
      setTimeout(() => {
        onLoginSuccess();
      }, 1500);
    } catch (error: any) {
      console.error('Login error:', error);
      setError(error.message || 'Invalid credentials');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = () => {
    navigate('/user-signup');
  };

  const handleBackToHome = () => {
    navigate('/');
  };

  return (
    <Box 
      minH="100vh" 
      bg="linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)"
      position="relative"
      overflow="hidden"
    >
      {/* Animated Background Elements */}
      {[...Array(10)].map((_, i) => (
        <MotionBox
          key={i}
          position="absolute"
          borderRadius="full"
          bg={`hsl(${Math.random() * 360}, 70%, 60%)`}
          opacity={0.1}
          animate={{
            x: [0, Math.random() * 100 - 50],
            y: [0, Math.random() * 100 - 50],
            scale: [1, 1.2, 1],
            rotate: [0, 360],
          }}
          transition={{
            duration: Math.random() * 10 + 10,
            repeat: Infinity,
            ease: "linear"
          }}
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            width: `${Math.random() * 50 + 20}px`,
            height: `${Math.random() * 50 + 20}px`,
          }}
        />
      ))}

      <Container maxW="container.sm" py={8}>
        <VStack spacing={8} minH="100vh" justify="center">
          {/* Back Button */}
          <MotionBox
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            alignSelf="flex-start"
          >
            <Button
              variant="ghost"
              color="white"
              leftIcon={<Icon as={FaArrowLeft} />}
              onClick={handleBackToHome}
              _hover={{ bg: "rgba(255,255,255,0.1)" }}
            >
              Back to Home
            </Button>
          </MotionBox>

          {/* Login Card */}
          <MotionBox
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            bg="rgba(255, 255, 255, 0.1)"
            backdropFilter="blur(20px)"
            borderRadius="3xl"
            border="1px solid rgba(255, 255, 255, 0.2)"
            p={8}
            w="100%"
            maxW="500px"
            boxShadow="0 25px 50px rgba(0, 0, 0, 0.25)"
            position="relative"
            overflow="hidden"
          >
            {/* Card Glow Effect */}
            <Box
              position="absolute"
              top="0"
              left="0"
              right="0"
              bottom="0"
              bg="linear-gradient(45deg, rgba(255,0,128,0.1), rgba(0,255,255,0.1))"
              borderRadius="3xl"
              opacity={0.5}
            />
            
            <VStack spacing={6} position="relative" zIndex={1}>
              {/* Header */}
              <VStack spacing={2}>
                <Text fontSize="4xl">⚡</Text>
                <Heading
                  size={isMobile ? "lg" : "xl"}
                  color="white"
                  textAlign="center"
                  textShadow="0 0 20px rgba(255, 255, 255, 0.3)"
                >
                  Welcome Back!
                </Heading>
                <Text
                  color="rgba(255,255,255,0.8)"
                  textAlign="center"
                  fontSize="md"
                >
                  Sign in to access your event tickets
                </Text>
              </VStack>

              {/* Error/Success Messages */}
              {error && (
                <Alert status="error" borderRadius="lg" bg="rgba(255, 0, 0, 0.1)" backdropFilter="blur(10px)">
                  <AlertIcon color="red.300" />
                  <Text color="white" fontSize="sm">{error}</Text>
                </Alert>
              )}

              {success && (
                <Alert status="success" borderRadius="lg" bg="rgba(0, 255, 0, 0.1)" backdropFilter="blur(10px)">
                  <AlertIcon color="green.300" />
                  <Text color="white" fontSize="sm">{success}</Text>
                </Alert>
              )}

              {/* Login Form */}
              <Box as="form" onSubmit={handleLogin} w="100%">
                <VStack spacing={4}>
                  <InputGroup>
                    <InputLeftElement>
                      <Icon as={FaEnvelope} color="rgba(255,255,255,0.7)" />
                    </InputLeftElement>
                    <Input
                      placeholder="Email address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      bg="rgba(255, 255, 255, 0.1)"
                      border="1px solid rgba(255, 255, 255, 0.2)"
                      color="white"
                      _placeholder={{ color: "rgba(255,255,255,0.6)" }}
                      _focus={{
                        borderColor: "#00ffff",
                        boxShadow: "0 0 0 1px #00ffff"
                      }}
                    />
                  </InputGroup>

                  <InputGroup>
                    <InputLeftElement>
                      <Icon as={FaLock} color="rgba(255,255,255,0.7)" />
                    </InputLeftElement>
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="Password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      bg="rgba(255, 255, 255, 0.1)"
                      border="1px solid rgba(255, 255, 255, 0.2)"
                      color="white"
                      _placeholder={{ color: "rgba(255,255,255,0.6)" }}
                      _focus={{
                        borderColor: "#00ffff",
                        boxShadow: "0 0 0 1px #00ffff"
                      }}
                    />
                    <Button
                      position="absolute"
                      right="0"
                      top="0"
                      h="100%"
                      bg="transparent"
                      _hover={{ bg: "rgba(255,255,255,0.1)" }}
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      <Icon as={showPassword ? FaEyeSlash : FaEye} color="rgba(255,255,255,0.7)" />
                    </Button>
                  </InputGroup>

                  <MotionButton
                    type="submit"
                    w="100%"
                    h="50px"
                    bg="linear-gradient(135deg, #ff0080 0%, #ff4081 50%, #ff79b0 100%)"
                    color="white"
                    fontSize="lg"
                    fontWeight="bold"
                    borderRadius="xl"
                    boxShadow="0 15px 35px rgba(255, 0, 128, 0.4)"
                    isLoading={isLoading}
                    loadingText="Signing In..."
                    whileHover={{ 
                      scale: 1.02,
                      boxShadow: "0 20px 40px rgba(255, 0, 128, 0.6)"
                    }}
                    whileTap={{ scale: 0.98 }}
                    _hover={{
                      bg: "linear-gradient(135deg, #ff4081 0%, #ff0080 50%, #ff79b0 100%)",
                    }}
                  >
                    Sign In
                  </MotionButton>
                </VStack>
              </Box>

              {/* Sign Up Link */}
              <HStack spacing={2}>
                <Text color="rgba(255,255,255,0.7)" fontSize="sm">
                  Don't have an account?
                </Text>
                <Button
                  variant="link"
                  color="#00ffff"
                  fontSize="sm"
                  fontWeight="bold"
                  onClick={handleSignUp}
                  _hover={{ textDecoration: "underline" }}
                >
                  Sign Up
                </Button>
              </HStack>
            </VStack>
          </MotionBox>
        </VStack>
      </Container>
    </Box>
  );
};

export default UserLogin;

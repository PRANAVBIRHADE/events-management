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
  Flex,
  useBreakpointValue,
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { FaEnvelope, FaLock, FaArrowLeft, FaUser, FaEye, FaEyeSlash, FaPhone } from 'react-icons/fa';
import { supabase } from '../lib/supabase';

const MotionBox = motion(Box);
const MotionButton = motion(Button);

const UserSignup: React.FC = () => {
  const navigate = useNavigate();
  const isMobile = useBreakpointValue({ base: true, md: false });
  
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    mobileNumber: '',
    password: '',
    confirmPassword: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.fullName || !formData.email || !formData.mobileNumber || !formData.password) {
      setError('Please fill all fields');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // Create user account
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.fullName,
            mobile_number: formData.mobileNumber
          }
        }
      });

      if (authError) throw authError;

      setSuccess('Account created successfully! Please check your email to verify your account.');
      
      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate('/user-login');
      }, 3000);

    } catch (error: any) {
      console.error('Signup error:', error);
      setError(error.message || 'Failed to create account');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToLogin = () => {
    navigate('/user-login');
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

          {/* Signup Card */}
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
                  Create Account
                </Heading>
                <Text
                  color="rgba(255,255,255,0.8)"
                  textAlign="center"
                  fontSize="md"
                >
                  Join Spark 2K25 and manage your tickets
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

              {/* Signup Form */}
              <Box as="form" onSubmit={handleSignup} w="100%">
                <VStack spacing={4}>
                  <InputGroup>
                    <InputLeftElement>
                      <Icon as={FaUser} color="rgba(255,255,255,0.7)" />
                    </InputLeftElement>
                    <Input
                      placeholder="Full Name"
                      value={formData.fullName}
                      onChange={(e) => handleInputChange('fullName', e.target.value)}
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
                      <Icon as={FaEnvelope} color="rgba(255,255,255,0.7)" />
                    </InputLeftElement>
                    <Input
                      type="email"
                      placeholder="Email address"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
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
                      <Icon as={FaPhone} color="rgba(255,255,255,0.7)" />
                    </InputLeftElement>
                    <Input
                      type="tel"
                      placeholder="Mobile Number"
                      value={formData.mobileNumber}
                      onChange={(e) => handleInputChange('mobileNumber', e.target.value)}
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
                      value={formData.password}
                      onChange={(e) => handleInputChange('password', e.target.value)}
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

                  <InputGroup>
                    <InputLeftElement>
                      <Icon as={FaLock} color="rgba(255,255,255,0.7)" />
                    </InputLeftElement>
                    <Input
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirm Password"
                      value={formData.confirmPassword}
                      onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
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
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      <Icon as={showConfirmPassword ? FaEyeSlash : FaEye} color="rgba(255,255,255,0.7)" />
                    </Button>
                  </InputGroup>

                  <MotionButton
                    type="submit"
                    w="100%"
                    h="50px"
                    bg="linear-gradient(135deg, #00ffff 0%, #0080ff 50%, #8000ff 100%)"
                    color="white"
                    fontSize="lg"
                    fontWeight="bold"
                    borderRadius="xl"
                    boxShadow="0 15px 35px rgba(0, 255, 255, 0.4)"
                    isLoading={isLoading}
                    loadingText="Creating Account..."
                    whileHover={{ 
                      scale: 1.02,
                      boxShadow: "0 20px 40px rgba(0, 255, 255, 0.6)"
                    }}
                    whileTap={{ scale: 0.98 }}
                    _hover={{
                      bg: "linear-gradient(135deg, #0080ff 0%, #00ffff 50%, #8000ff 100%)",
                    }}
                  >
                    Create Account
                  </MotionButton>
                </VStack>
              </Box>

              {/* Login Link */}
              <HStack spacing={2}>
                <Text color="rgba(255,255,255,0.7)" fontSize="sm">
                  Already have an account?
                </Text>
                <Button
                  variant="link"
                  color="#ff0080"
                  fontSize="sm"
                  fontWeight="bold"
                  onClick={handleBackToLogin}
                  _hover={{ textDecoration: "underline" }}
                >
                  Sign In
                </Button>
              </HStack>
            </VStack>
          </MotionBox>
        </VStack>
      </Container>
    </Box>
  );
};

export default UserSignup;

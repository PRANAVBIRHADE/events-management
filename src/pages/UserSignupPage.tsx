import React, { useState } from 'react';
import {
  Box,
  Container,
  VStack,
  HStack,
  Heading,
  Text,
  Input,
  Button,
  FormControl,
  FormLabel,
  FormErrorMessage,
  Select,
  Icon,
  useToast,
  Flex,
  Badge,
  Divider,
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { FaUser, FaEnvelope, FaPhone, FaLock, FaGraduationCap, FaArrowLeft } from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';

const MotionBox = motion(Box);
const MotionButton = motion(Button);

interface FormData {
  fullName: string;
  email: string;
  mobileNumber: string;
  password: string;
  confirmPassword: string;
  studyingYear: number;
}

const UserSignupPage: React.FC = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const { signup } = useAuth();
  
  const [formData, setFormData] = useState<FormData>({
    fullName: '',
    email: '',
    mobileNumber: '',
    password: '',
    confirmPassword: '',
    studyingYear: 1,
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Partial<FormData>>({});

  const handleInputChange = (field: keyof FormData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<FormData> = {};
    
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!formData.mobileNumber.trim()) {
      newErrors.mobileNumber = 'Mobile number is required';
    } else if (!/^\d{10}$/.test(formData.mobileNumber)) {
      newErrors.mobileNumber = 'Mobile number must be 10 digits';
    }

    if (!formData.password.trim()) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (!formData.confirmPassword.trim()) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const getRegistrationType = (year: number) => {
    return year === 1 ? 'fresher' : 'senior';
  };

  const getRegistrationPrice = (year: number) => {
    return year === 1 ? 'FREE' : '₹99';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast({
        title: 'Please fix the errors',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setIsLoading(true);
    
    try {
      // Create user account with email verification
      const { data, error } = await signup(formData.email, formData.password, {
        full_name: formData.fullName,
        mobile_number: formData.mobileNumber,
        studying_year: formData.studyingYear
      });

      if (error) {
        throw error;
      }

      // Navigate to email verification page
      navigate('/verify-email', {
        state: {
          email: formData.email,
          userId: data?.user?.id
        }
      });

      toast({
        title: 'Account created!',
        description: 'Please check your email for verification code.',
        status: 'info',
        duration: 5000,
        isClosable: true,
      });

    } catch (error: any) {
      console.error('Signup error:', error);
      toast({
        title: 'Signup failed',
        description: error.message || 'Something went wrong. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const isFresher = formData.studyingYear === 1;

  return (
    <Box 
      minH="100vh" 
      bg="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
      position="relative"
      overflow="hidden"
    >
      {/* Background Effects */}
      <Box
        position="absolute"
        top="0"
        left="0"
        right="0"
        bottom="0"
        bg="rgba(255,255,255,0.05)"
        opacity="0.3"
      />
      
      <Container maxW="md" py={12} position="relative" zIndex={1}>
        <MotionBox
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          {/* Header */}
          <VStack spacing={6} mb={8}>
            <HStack>
              <Button
                variant="ghost"
                color="white"
                leftIcon={<Icon as={FaArrowLeft} />}
                onClick={() => navigate('/')}
                _hover={{ bg: 'rgba(255,255,255,0.1)' }}
              >
                Back
              </Button>
            </HStack>
            
            <VStack spacing={2}>
              <Heading
                size="2xl"
                color="white"
                textAlign="center"
                textShadow="0 2px 4px rgba(0,0,0,0.3)"
              >
                Join Spark 2K25 ⚡
              </Heading>
              <Text
                color="rgba(255,255,255,0.9)"
                fontSize="lg"
                textAlign="center"
                textShadow="0 1px 2px rgba(0,0,0,0.3)"
              >
                Create your account and get ready for the party!
              </Text>
            </VStack>
          </VStack>

          {/* Signup Form */}
          <MotionBox
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            bg="white"
            p={8}
            borderRadius="xl"
            boxShadow="0 20px 40px rgba(0,0,0,0.1)"
          >
            <form onSubmit={handleSubmit}>
              <VStack spacing={6}>
                {/* Full Name */}
                <FormControl isInvalid={!!errors.fullName}>
                  <FormLabel fontSize="lg" fontWeight="bold" color="gray.700">
                    <Icon as={FaUser} mr={2} />
                    Full Name
                  </FormLabel>
                  <Input
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => handleInputChange('fullName', e.target.value)}
                    placeholder="Enter your full name"
                    size="lg"
                    borderColor="gray.300"
                    _focus={{
                      borderColor: 'pink.400',
                      boxShadow: '0 0 0 1px rgba(255, 0, 128, 0.2)',
                    }}
                  />
                  <FormErrorMessage>{errors.fullName}</FormErrorMessage>
                </FormControl>

                {/* Email */}
                <FormControl isInvalid={!!errors.email}>
                  <FormLabel fontSize="lg" fontWeight="bold" color="gray.700">
                    <Icon as={FaEnvelope} mr={2} />
                    Email Address
                  </FormLabel>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="Enter your email address"
                    size="lg"
                    borderColor="gray.300"
                    _focus={{
                      borderColor: 'blue.400',
                      boxShadow: '0 0 0 1px rgba(0, 255, 255, 0.2)',
                    }}
                  />
                  <FormErrorMessage>{errors.email}</FormErrorMessage>
                </FormControl>

                {/* Mobile Number */}
                <FormControl isInvalid={!!errors.mobileNumber}>
                  <FormLabel fontSize="lg" fontWeight="bold" color="gray.700">
                    <Icon as={FaPhone} mr={2} />
                    Mobile Number
                  </FormLabel>
                  <Input
                    type="tel"
                    value={formData.mobileNumber}
                    onChange={(e) => handleInputChange('mobileNumber', e.target.value)}
                    placeholder="Enter your 10-digit mobile number"
                    size="lg"
                    borderColor="gray.300"
                    _focus={{
                      borderColor: 'green.400',
                      boxShadow: '0 0 0 1px rgba(0, 255, 0, 0.2)',
                    }}
                  />
                  <FormErrorMessage>{errors.mobileNumber}</FormErrorMessage>
                </FormControl>

                {/* Studying Year */}
                <FormControl>
                  <FormLabel fontSize="lg" fontWeight="bold" color="gray.700">
                    <Icon as={FaGraduationCap} mr={2} />
                    Studying Year
                  </FormLabel>
                  <Select
                    value={formData.studyingYear}
                    onChange={(e) => handleInputChange('studyingYear', parseInt(e.target.value))}
                    size="lg"
                    borderColor="gray.300"
                    _focus={{
                      borderColor: 'purple.400',
                      boxShadow: '0 0 0 1px rgba(128, 0, 255, 0.2)',
                    }}
                  >
                    <option value={1}>1st Year (Fresher)</option>
                    <option value={2}>2nd Year (Senior)</option>
                    <option value={3}>3rd Year (Senior)</option>
                    <option value={4}>4th Year (Senior)</option>
                  </Select>
                </FormControl>

                {/* Password */}
                <FormControl isInvalid={!!errors.password}>
                  <FormLabel fontSize="lg" fontWeight="bold" color="gray.700">
                    <Icon as={FaLock} mr={2} />
                    Password
                  </FormLabel>
                  <Input
                    type="password"
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    placeholder="Create a password (min 6 characters)"
                    size="lg"
                    borderColor="gray.300"
                    _focus={{
                      borderColor: 'orange.400',
                      boxShadow: '0 0 0 1px rgba(255, 165, 0, 0.2)',
                    }}
                  />
                  <FormErrorMessage>{errors.password}</FormErrorMessage>
                </FormControl>

                {/* Confirm Password */}
                <FormControl isInvalid={!!errors.confirmPassword}>
                  <FormLabel fontSize="lg" fontWeight="bold" color="gray.700">
                    <Icon as={FaLock} mr={2} />
                    Confirm Password
                  </FormLabel>
                  <Input
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                    placeholder="Confirm your password"
                    size="lg"
                    borderColor="gray.300"
                    _focus={{
                      borderColor: 'orange.400',
                      boxShadow: '0 0 0 1px rgba(255, 165, 0, 0.2)',
                    }}
                  />
                  <FormErrorMessage>{errors.confirmPassword}</FormErrorMessage>
                </FormControl>

                <Divider />

                {/* Account Info */}
                <Box 
                  p={4} 
                  bg="blue.50" 
                  borderRadius="lg" 
                  border="1px solid" 
                  borderColor="blue.200"
                  w="full"
                >
                  <VStack spacing={2}>
                    <HStack>
                      <Text fontWeight="bold" color="blue.800">
                        🎉 Account Creation
                      </Text>
                      <Badge 
                        colorScheme="blue"
                        fontSize="sm"
                      >
                        FREE
                      </Badge>
                    </HStack>
                    <Text fontSize="sm" color="blue.700">
                      Create your account to access events and register for parties!
                    </Text>
                  </VStack>
                </Box>

                {/* Submit Button */}
                <MotionButton
                  type="submit"
                  size="lg"
                  w="full"
                  h="60px"
                  fontSize="xl"
                  fontWeight="bold"
                  isLoading={isLoading}
                  loadingText={isFresher ? 'Creating Account...' : 'Processing...'}
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
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  🎉 Create Account
                </MotionButton>
              </VStack>
            </form>
          </MotionBox>
        </MotionBox>
      </Container>
    </Box>
  );
};

export default UserSignupPage;

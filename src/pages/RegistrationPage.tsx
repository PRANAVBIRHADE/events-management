import React, { useState } from 'react';
import {
  Box,
  Container,
  Heading,
  Text,
  HStack,
  Input,
  Button,
  Icon,
  Flex,
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { FaArrowLeft, FaUser, FaEnvelope, FaPhone, FaGraduationCap, FaLock } from 'react-icons/fa';
import { supabase } from '../lib/supabase';

const MotionBox = motion(Box);
const MotionButton = motion(Button);

interface FormData {
  fullName: string;
  email: string;
  mobileNumber: string;
  studyingYear: number;
  password: string;
  confirmPassword: string;
}

const RegistrationPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const registrationType = searchParams.get('type') || 'senior';
  const isFresher = registrationType === 'fresher';
  
  const [formData, setFormData] = useState<FormData>({
    fullName: '',
    email: '',
    mobileNumber: '',
    studyingYear: isFresher ? 1 : 2,
    password: '',
    confirmPassword: '',
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Partial<FormData>>({});
  const [message, setMessage] = useState({ type: '', text: '' });

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

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 3000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      showMessage('error', 'Please fix the errors');
      return;
    }

    setIsLoading(true);
    
    try {
      // First, create user account
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

      if (authError) {
        throw authError;
      }

      // Then create registration linked to the user
      const { data, error } = await supabase
        .from('registrations')
        .insert([
          {
            user_id: authData.user?.id,
            full_name: formData.fullName,
            email: formData.email,
            mobile_number: formData.mobileNumber,
            studying_year: formData.studyingYear,
            registration_type: isFresher ? 'fresher' : 'senior',
            payment_status: isFresher ? 'paid' : 'pending',
            checked_in: false,
          },
        ])
        .select()
        .single();

      if (error) {
        throw error;
      }

      // Store registration data in localStorage for next steps
      localStorage.setItem('registrationData', JSON.stringify(data));

      if (isFresher) {
        // Redirect to fresher hype page
        navigate('/fresher-hype');
      } else {
        // Redirect to payment page
        navigate('/payment');
      }

      showMessage('success', isFresher 
        ? 'Welcome to the fresher family!' 
        : 'Please proceed to payment.'
      );

    } catch (error: any) {
      console.error('Registration error:', error);
      showMessage('error', error.message || 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: keyof FormData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <Box minH="100vh" bg="linear-gradient(135deg, #667eea 0%, #764ba2 100%)" py={8}>
      <Container maxW="container.md">
        <MotionBox
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Header */}
          <Flex direction="column" align="center" gap={6} mb={8}>
            <HStack align="center" gap={4}>
              <Button
                variant="ghost"
                color="white"
                onClick={() => navigate('/')}
                _hover={{ transform: "scale(1.1)" }}
                _active={{ transform: "scale(0.9)" }}
              >
                <Icon as={FaArrowLeft} boxSize={5} />
              </Button>
              <Heading
                as="h1"
                size="2xl"
                color="white"
                textAlign="center"
                textShadow="0 2px 4px rgba(0,0,0,0.3)"
              >
                {isFresher ? 'Fresher Sign Up' : 'Senior Sign Up'}
              </Heading>
            </HStack>
            
            <Text
              color="white"
              fontSize="lg"
              textAlign="center"
              textShadow="0 1px 2px rgba(0,0,0,0.3)"
            >
              {isFresher 
                ? 'Join the fresher family and get ready for an amazing party! 🎉'
                : 'Complete your registration to secure your spot at the party! 🎊'
              }
            </Text>
          </Flex>

          {/* Message Display */}
          {message.text && (
            <Box
              p={4}
              mb={4}
              bg={message.type === 'success' ? 'green.50' : 'red.50'}
              borderRadius="lg"
              border="1px solid"
              borderColor={message.type === 'success' ? 'green.200' : 'red.200'}
            >
              <Text color={message.type === 'success' ? 'green.600' : 'red.600'} fontSize="sm">
                {message.text}
              </Text>
            </Box>
          )}

          {/* Registration Form */}
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
              <Flex direction="column" gap={6}>
                {/* Full Name */}
                <Box>
                  <Text fontSize="lg" fontWeight="bold" color="gray.700" mb={2}>
                    <Icon as={FaUser} mr={2} />
                    Full Name
                  </Text>
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
                  {errors.fullName && (
                    <Text color="red.500" fontSize="sm" mt={1}>
                      {errors.fullName}
                    </Text>
                  )}
                </Box>

                {/* Email */}
                <Box>
                  <Text fontSize="lg" fontWeight="bold" color="gray.700" mb={2}>
                    <Icon as={FaEnvelope} mr={2} />
                    Email Address
                  </Text>
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
                  {errors.email && (
                    <Text color="red.500" fontSize="sm" mt={1}>
                      {errors.email}
                    </Text>
                  )}
                </Box>

                {/* Mobile Number */}
                <Box>
                  <Text fontSize="lg" fontWeight="bold" color="gray.700" mb={2}>
                    <Icon as={FaPhone} mr={2} />
                    Mobile Number
                  </Text>
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
                  {errors.mobileNumber && (
                    <Text color="red.500" fontSize="sm" mt={1}>
                      {errors.mobileNumber}
                    </Text>
                  )}
                </Box>

                {/* Studying Year */}
                <Box>
                  <Text fontSize="lg" fontWeight="bold" color="gray.700" mb={2}>
                    <Icon as={FaGraduationCap} mr={2} />
                    Studying Year
                  </Text>
                  <Input
                    as="select"
                    value={formData.studyingYear}
                    onChange={(e) => handleInputChange('studyingYear', parseInt(e.target.value))}
                    size="lg"
                    borderColor="gray.300"
                    _focus={{
                      borderColor: 'purple.400',
                      boxShadow: '0 0 0 1px rgba(128, 0, 255, 0.2)',
                    }}
                  >
                    <option value={1}>1st Year</option>
                    <option value={2}>2nd Year</option>
                    <option value={3}>3rd Year</option>
                    <option value={4}>4th Year</option>
                  </Input>
                </Box>

                {/* Password */}
                <Box>
                  <Text fontSize="lg" fontWeight="bold" color="gray.700" mb={2}>
                    <Icon as={FaLock} mr={2} />
                    Password
                  </Text>
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
                  {errors.password && (
                    <Text color="red.500" fontSize="sm" mt={1}>
                      {errors.password}
                    </Text>
                  )}
                </Box>

                {/* Confirm Password */}
                <Box>
                  <Text fontSize="lg" fontWeight="bold" color="gray.700" mb={2}>
                    <Icon as={FaLock} mr={2} />
                    Confirm Password
                  </Text>
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
                  {errors.confirmPassword && (
                    <Text color="red.500" fontSize="sm" mt={1}>
                      {errors.confirmPassword}
                    </Text>
                  )}
                </Box>

                <Box h="1px" bg="gray.200" w="full" />

                {/* Registration Type Info */}
                <Box p={4} bg={isFresher ? 'green.50' : 'blue.50'} borderRadius="lg" border="1px solid" borderColor={isFresher ? 'green.200' : 'blue.200'}>
                  <Text fontWeight="bold" color={isFresher ? 'green.800' : 'blue.800'}>
                    {isFresher ? 'Free Registration!' : 'Registration Fee: ₹99'}
                  </Text>
                  <Text fontSize="sm" color={isFresher ? 'green.700' : 'blue.700'}>
                    {isFresher 
                      ? 'As a fresher, your registration is completely free!'
                      : 'Payment will be required after form submission.'
                    }
                  </Text>
                </Box>

                {/* Submit Button */}
                <Button
                  type="submit"
                  variant="solid"
                  size="lg"
                  w="full"
                  h="60px"
                  fontSize="xl"
                  fontWeight="bold"
                  isLoading={isLoading}
                  loadingText={isFresher ? 'Registering...' : 'Processing...'}
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
                  {isFresher ? '🎉 Sign Up as Fresher' : '💳 Sign Up as Senior'}
                </Button>
              </Flex>
            </form>
          </MotionBox>
        </MotionBox>
      </Container>
    </Box>
  );
};

export default RegistrationPage;
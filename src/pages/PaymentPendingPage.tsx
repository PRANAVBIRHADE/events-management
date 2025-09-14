import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  VStack,
  HStack,
  Heading,
  Text,
  Button,
  Card,
  CardBody,
  CardHeader,
  Icon,
  Badge,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  useToast,
  Spinner,
  Center,
  Divider,
  Progress,
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  FaArrowLeft,
  FaCheck,
  FaClock,
  FaExclamationTriangle,
  FaHome,
  FaGraduationCap,
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaMobile,
  FaRupeeSign,
  FaQrcode,
} from 'react-icons/fa';
import { supabase } from '../lib/supabase';

const MotionBox = motion(Box);
const MotionButton = motion(Button);

interface PaymentPendingData {
  paymentVerificationId: string;
  registration: any;
  event: any;
}

const PaymentPendingPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();
  
  const [paymentData, setPaymentData] = useState<PaymentPendingData | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<string>('pending');
  const [isLoading, setIsLoading] = useState(true);
  const [checkingStatus, setCheckingStatus] = useState(false);

  useEffect(() => {
    loadPaymentData();
    startStatusPolling();
  }, []);

  const loadPaymentData = async () => {
    try {
      if (location.state) {
        const { paymentVerificationId, registration, event } = location.state;
        setPaymentData({ paymentVerificationId, registration, event });
        await checkPaymentStatus(paymentVerificationId);
      } else {
        navigate('/my-tickets');
        return;
      }
    } catch (error) {
      console.error('Error loading payment data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load payment information',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const checkPaymentStatus = async (paymentId: string) => {
    try {
      setCheckingStatus(true);
      
      const { data, error } = await supabase
        .from('payment_verifications')
        .select('payment_status, admin_notes, verified_at')
        .eq('id', paymentId)
        .single();

      if (error) {
        console.error('Error checking payment status:', error);
        return;
      }

      setPaymentStatus(data.payment_status);

      if (data.payment_status === 'verified') {
        toast({
          title: 'Payment Verified!',
          description: 'Your payment has been verified. You can now download your ticket.',
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
      } else if (data.payment_status === 'rejected') {
        toast({
          title: 'Payment Rejected',
          description: data.admin_notes || 'Your payment was rejected. Please contact support.',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error('Error checking payment status:', error);
    } finally {
      setCheckingStatus(false);
    }
  };

  const startStatusPolling = () => {
    const interval = setInterval(async () => {
      if (paymentData?.paymentVerificationId) {
        await checkPaymentStatus(paymentData.paymentVerificationId);
      }
    }, 10000); // Check every 10 seconds

    return () => clearInterval(interval);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'verified':
        return 'green';
      case 'rejected':
        return 'red';
      case 'expired':
        return 'orange';
      default:
        return 'blue';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'verified':
        return FaCheck;
      case 'rejected':
        return FaExclamationTriangle;
      case 'expired':
        return FaExclamationTriangle;
      default:
        return FaClock;
    }
  };

  const getStatusMessage = (status: string) => {
    switch (status) {
      case 'verified':
        return 'Your payment has been verified successfully!';
      case 'rejected':
        return 'Your payment was rejected. Please contact support.';
      case 'expired':
        return 'Payment session expired. Please start a new registration.';
      default:
        return 'Your payment is being verified by our admin team.';
    }
  };

  if (isLoading) {
    return (
      <Box minH="100vh" bg="linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)" display="flex" alignItems="center" justifyContent="center">
        <VStack spacing={4}>
          <Spinner size="xl" color="white" />
          <Text color="white" fontSize="lg">Loading payment status...</Text>
        </VStack>
      </Box>
    );
  }

  if (!paymentData) {
    return (
      <Box minH="100vh" bg="linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)" display="flex" alignItems="center" justifyContent="center">
        <VStack spacing={4}>
          <Text color="white" fontSize="lg">No payment data found</Text>
          <Button onClick={() => navigate('/my-tickets')}>Back to Tickets</Button>
        </VStack>
      </Box>
    );
  }

  return (
    <Box minH="100vh" bg="linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)" position="relative" overflow="hidden">
      {/* Animated Background Elements */}
      {[...Array(6)].map((_, i) => (
        <MotionBox
          key={i}
          position="absolute"
          borderRadius="full"
          bg={`hsl(${Math.random() * 360}, 70%, 60%)`}
          opacity={0.08}
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
            width: `${Math.random() * 80 + 40}px`,
            height: `${Math.random() * 80 + 40}px`,
            zIndex: 0,
          }}
        />
      ))}

      <Container maxW="4xl" py={12} position="relative" zIndex={2}>
        {/* Header */}
        <MotionBox
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          mb={8}
        >
          <Flex justify="space-between" align="center" mb={6}>
            <HStack spacing={3}>
              <Icon as={FaGraduationCap} color="#4ade80" boxSize={8} />
              <Text color="white" fontSize="xl" fontWeight="bold">
                MPGI SOE
              </Text>
            </HStack>
            
            <Button
              variant="outline"
              color="white"
              borderColor="white"
              _hover={{ bg: 'rgba(255,255,255,0.1)' }}
              onClick={() => navigate('/my-tickets')}
              leftIcon={<Icon as={FaArrowLeft} />}
            >
              Back to Tickets
            </Button>
          </Flex>

          <VStack spacing={4} align="center" textAlign="center">
            <Heading
              as="h1"
              size="2xl"
              color="white"
              fontWeight="900"
            >
              Payment Status
            </Heading>
            <Text
              fontSize="lg"
              color="rgba(255,255,255,0.8)"
              maxW="600px"
            >
              Track your payment verification status
            </Text>
          </VStack>
        </MotionBox>

        {/* Payment Status Card */}
        <MotionBox
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          bg="white"
          borderRadius="2xl"
          boxShadow="0 20px 40px rgba(0,0,0,0.1)"
          overflow="hidden"
          mb={6}
        >
          <CardHeader bg="linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)" color="white">
            <VStack spacing={2} align="center">
              <Heading size="lg">Payment Verification</Heading>
              <Text opacity={0.9}>Status Update</Text>
            </VStack>
          </CardHeader>

          <CardBody p={8}>
            <VStack spacing={6} align="stretch">
              {/* Status Display */}
              <VStack spacing={4} align="center">
                <Icon 
                  as={getStatusIcon(paymentStatus)} 
                  boxSize={16} 
                  color={`${getStatusColor(paymentStatus)}.500`}
                />
                
                <Badge 
                  colorScheme={getStatusColor(paymentStatus)}
                  fontSize="lg"
                  px={4}
                  py={2}
                  borderRadius="full"
                >
                  {paymentStatus.toUpperCase()}
                </Badge>
                
                <Text 
                  fontSize="lg" 
                  color="gray.700" 
                  textAlign="center"
                  fontWeight="medium"
                >
                  {getStatusMessage(paymentStatus)}
                </Text>
              </VStack>

              {/* Progress Bar for Pending Status */}
              {paymentStatus === 'pending' && (
                <VStack spacing={4}>
                  <Text fontSize="sm" color="gray.600" textAlign="center">
                    Verification in progress...
                  </Text>
                  <Progress 
                    size="lg" 
                    isIndeterminate 
                    colorScheme="blue" 
                    w="full"
                    borderRadius="full"
                  />
                  <Text fontSize="xs" color="gray.500" textAlign="center">
                    Our admin team will verify your payment within 24 hours
                  </Text>
                </VStack>
              )}

              <Divider />

              {/* Event Information */}
              <VStack spacing={4} align="stretch">
                <Heading size="md" color="gray.700">Event Information</Heading>
                
                <HStack justify="space-between" w="full">
                  <HStack spacing={2}>
                    <Icon as={FaCalendarAlt} color="blue.500" />
                    <Text fontWeight="bold" color="gray.600">Event:</Text>
                  </HStack>
                  <Text color="gray.800" textAlign="right">{paymentData.event.name}</Text>
                </HStack>
                
                <HStack justify="space-between" w="full">
                  <HStack spacing={2}>
                    <Icon as={FaMapMarkerAlt} color="green.500" />
                    <Text fontWeight="bold" color="gray.600">Location:</Text>
                  </HStack>
                  <Text color="gray.800" textAlign="right">{paymentData.event.location}</Text>
                </HStack>
                
                <HStack justify="space-between" w="full">
                  <HStack spacing={2}>
                    <Icon as={FaMobile} color="purple.500" />
                    <Text fontWeight="bold" color="gray.600">Registration Type:</Text>
                  </HStack>
                  <Badge colorScheme={paymentData.registration.registration_type === 'fresher' ? 'green' : 'blue'}>
                    {paymentData.registration.registration_type === 'fresher' ? 'Fresher' : 'Senior'}
                  </Badge>
                </HStack>
              </VStack>

              <Divider />

              {/* Registration Details */}
              <VStack spacing={4} align="stretch">
                <Heading size="md" color="gray.700">Registration Details</Heading>
                
                <HStack justify="space-between" w="full">
                  <Text fontWeight="bold" color="gray.600">Name:</Text>
                  <Text color="gray.800">{paymentData.registration.full_name}</Text>
                </HStack>
                
                <HStack justify="space-between" w="full">
                  <Text fontWeight="bold" color="gray.600">Email:</Text>
                  <Text color="gray.800" fontSize="sm">{paymentData.registration.email}</Text>
                </HStack>
                
                <HStack justify="space-between" w="full">
                  <Text fontWeight="bold" color="gray.600">Mobile:</Text>
                  <Text color="gray.800">{paymentData.registration.mobile_number}</Text>
                </HStack>
                
                <HStack justify="space-between" w="full">
                  <Text fontWeight="bold" color="gray.600">Year:</Text>
                  <Text color="gray.800">Year {paymentData.registration.studying_year}</Text>
                </HStack>
              </VStack>

              {/* Action Buttons */}
              <VStack spacing={4} align="stretch">
                {paymentStatus === 'verified' && (
                  <Button
                    colorScheme="green"
                    size="lg"
                    leftIcon={<Icon as={FaQrcode} />}
                    onClick={() => {
                      // Navigate to ticket page
                      navigate('/ticket', {
                        state: {
                          registration: paymentData.registration,
                          event: paymentData.event,
                          isFresher: paymentData.registration.registration_type === 'fresher'
                        }
                      });
                    }}
                    w="full"
                  >
                    View Your Ticket
                  </Button>
                )}
                
                {paymentStatus === 'rejected' && (
                  <Button
                    colorScheme="red"
                    size="lg"
                    onClick={() => navigate('/events')}
                    w="full"
                  >
                    Register Again
                  </Button>
                )}
                
                {paymentStatus === 'pending' && (
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() => navigate('/my-tickets')}
                    leftIcon={<Icon as={FaHome} />}
                    w="full"
                  >
                    Back to My Tickets
                  </Button>
                )}
              </VStack>

              {/* Additional Information */}
              {paymentStatus === 'pending' && (
                <Alert status="info" borderRadius="lg">
                  <AlertIcon />
                  <AlertDescription>
                    <Text fontWeight="bold" mb={2}>What happens next?</Text>
                    <Text>• Our admin team will verify your payment screenshot</Text>
                    <Text>• You'll receive an email notification once verified</Text>
                    <Text>• Your ticket will be available in "My Tickets" section</Text>
                    <Text>• You can check the status here anytime</Text>
                  </AlertDescription>
                </Alert>
              )}
            </VStack>
          </CardBody>
        </MotionBox>
      </Container>
    </Box>
  );
};

export default PaymentPendingPage;

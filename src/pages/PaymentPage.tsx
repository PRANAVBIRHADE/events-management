import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Heading,
  Text,
  HStack,
  VStack,
  Button,
  Flex,
  Icon,
  Spinner,
  Card,
  CardBody,
  CardHeader,
  Divider,
  Badge,
  useToast,
  Alert,
  AlertIcon,
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  FaArrowLeft, 
  FaCreditCard, 
  FaCheckCircle, 
  FaTimesCircle,
  FaGraduationCap,
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaClock,
  FaDollarSign,
  FaUsers,
} from 'react-icons/fa';
import { supabase, SeniorTicketRegistration, Event } from '../lib/supabase';

const MotionBox = motion(Box);
const MotionButton = motion(Button);

const PaymentPage: React.FC = () => {
  const navigate = useNavigate();
  const toast = useToast();
  
  const [registrationData, setRegistrationData] = useState<SeniorTicketRegistration | null>(null);
  const [eventData, setEventData] = useState<Event | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'processing' | 'success' | 'failed'>('pending');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Get registration and event data from localStorage
    const storedRegistration = localStorage.getItem('registrationData');
    const storedEvent = localStorage.getItem('eventData');
    
    if (storedRegistration) {
      setRegistrationData(JSON.parse(storedRegistration));
    }
    
    if (storedEvent) {
      setEventData(JSON.parse(storedEvent));
    }
    
    if (!storedRegistration) {
      // Redirect to user dashboard if no data
      navigate('/user-dashboard');
    }
  }, [navigate]);

  const handlePhonePePayment = async () => {
    if (!registrationData) return;

    setIsLoading(true);
    setPaymentStatus('processing');

    try {
      // In a real implementation, you would:
      // 1. Create a payment request to your backend
      // 2. Get PhonePe payment URL
      // 3. Redirect to PhonePe payment page
      // 4. Handle payment callback

      // For demo purposes, we'll simulate a successful payment
      setTimeout(async () => {
        try {
          // Update payment status in Supabase
          const { error } = await supabase
            .from('senior_ticket_registrations')
            .update({
              payment_status: 'completed',
              payment_id: `phonep_${Date.now()}`,
              payment_method: 'PhonePe',
              qr_code: `QR_${registrationData.id}_${Date.now()}`,
            })
            .eq('id', registrationData.id);

          if (error) throw error;

          setPaymentStatus('success');
          toast({
            title: 'Payment Successful!',
            description: 'Your registration is confirmed. Generating your ticket...',
            status: 'success',
            duration: 5000,
            isClosable: true,
          });

          // Redirect to ticket page after a short delay
          setTimeout(() => {
            navigate('/ticket');
          }, 2000);

        } catch (error: any) {
          console.error('Payment update error:', error);
          setPaymentStatus('failed');
          toast({
            title: 'Payment Update Failed',
            description: 'Please contact support if payment was deducted.',
            status: 'error',
            duration: 5000,
            isClosable: true,
          });
        } finally {
          setIsLoading(false);
        }
      }, 3000); // Simulate payment processing time

    } catch (error: any) {
      console.error('Payment error:', error);
      setPaymentStatus('failed');
      setIsLoading(false);
      toast({
        title: 'Payment Failed',
        description: error.message || 'Something went wrong. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleBackToRegistration = () => {
    navigate('/user-dashboard');
  };

  const formatEventDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatEventTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  if (!registrationData) {
    return (
      <Box minH="100vh" bg="linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)" display="flex" alignItems="center" justifyContent="center">
        <VStack spacing={4}>
          <Spinner size="xl" color="white" thickness="4px" />
          <Text color="white" fontSize="lg">Loading payment details...</Text>
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
              onClick={handleBackToRegistration}
              leftIcon={<Icon as={FaArrowLeft} />}
            >
              Back to Dashboard
            </Button>
          </Flex>

          <VStack spacing={4} align="center" textAlign="center">
            <Heading
              as="h1"
              size="2xl"
              color="white"
              fontWeight="900"
            >
              Complete Payment
            </Heading>
            <Text
              fontSize="lg"
              color="rgba(255,255,255,0.8)"
              maxW="600px"
            >
              Secure your spot for this exciting event
            </Text>
          </VStack>
        </MotionBox>

        {/* Event Details Card */}
        {eventData && (
          <MotionBox
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            mb={8}
          >
            <Card
              bg="rgba(255,255,255,0.15)"
              backdropFilter="blur(16px)"
              borderRadius="2xl"
              border="1px solid rgba(255,255,255,0.25)"
              boxShadow="0 8px 32px 0 rgba(31, 38, 135, 0.15)"
              variant="outline"
            >
              <CardHeader>
                <Heading size="md" color="white">
                  Event Details
                </Heading>
              </CardHeader>
              <CardBody>
                <VStack spacing={4} align="stretch">
                  <Heading size="lg" color="white">
                    {eventData.name}
                  </Heading>
                  
                  <HStack spacing={6} fontSize="md" color="rgba(255,255,255,0.7)">
                    <HStack spacing={2}>
                      <Icon as={FaCalendarAlt} />
                      <Text>{formatEventDate(eventData.event_date)}</Text>
                    </HStack>
                    <HStack spacing={2}>
                      <Icon as={FaClock} />
                      <Text>{formatEventTime(eventData.event_date)}</Text>
                    </HStack>
                  </HStack>

                  {eventData.location && (
                    <HStack spacing={2} fontSize="md" color="rgba(255,255,255,0.7)">
                      <Icon as={FaMapMarkerAlt} />
                      <Text>{eventData.location}</Text>
                    </HStack>
                  )}

                  <HStack justify="space-between" fontSize="md">
                    <HStack spacing={2} color="rgba(255,255,255,0.7)">
                      <Icon as={FaUsers} />
                      <Text>{eventData.current_registrations}/{eventData.max_capacity || '∞'} registered</Text>
                    </HStack>
                    
                    <HStack spacing={1} color="#fbbf24">
                      <Icon as={FaDollarSign} />
                      <Text fontWeight="bold">₹{eventData.price || 99}</Text>
                    </HStack>
                  </HStack>
                </VStack>
              </CardBody>
            </Card>
          </MotionBox>
        )}

        {/* Registration Details Card */}
        <MotionBox
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          mb={8}
        >
          <Card
            bg="rgba(255,255,255,0.15)"
            backdropFilter="blur(16px)"
            borderRadius="2xl"
            border="1px solid rgba(255,255,255,0.25)"
            boxShadow="0 8px 32px 0 rgba(31, 38, 135, 0.15)"
            variant="outline"
          >
            <CardHeader>
              <Heading size="md" color="white">
                Registration Details
              </Heading>
            </CardHeader>
            <CardBody>
              <VStack spacing={4} align="stretch">
                <HStack justify="space-between" fontSize="sm" color="rgba(255,255,255,0.8)">
                  <Text>Name:</Text>
                  <Text fontWeight="bold">{registrationData.full_name}</Text>
                </HStack>
                <HStack justify="space-between" fontSize="sm" color="rgba(255,255,255,0.8)">
                  <Text>Email:</Text>
                  <Text fontWeight="bold">{registrationData.email}</Text>
                </HStack>
                <HStack justify="space-between" fontSize="sm" color="rgba(255,255,255,0.8)">
                  <Text>Mobile:</Text>
                  <Text fontWeight="bold">{registrationData.mobile_number}</Text>
                </HStack>
                <HStack justify="space-between" fontSize="sm" color="rgba(255,255,255,0.8)">
                  <Text>Year:</Text>
                  <HStack spacing={2}>
                    <Text fontWeight="bold">Year {registrationData.studying_year}</Text>
                    <Badge colorScheme="blue" fontSize="xs">Senior</Badge>
                  </HStack>
                </HStack>
                
                <Divider borderColor="rgba(255,255,255,0.2)" />
                
                <HStack justify="space-between" fontSize="lg">
                  <Text color="rgba(255,255,255,0.8)">Amount to Pay:</Text>
                  <Text color="#fbbf24" fontWeight="bold" fontSize="xl">
                    ₹{registrationData.amount_paid || 99}
                  </Text>
                </HStack>
              </VStack>
            </CardBody>
          </Card>
        </MotionBox>

        {/* Payment Options */}
        <MotionBox
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <Card
            bg="rgba(255,255,255,0.15)"
            backdropFilter="blur(16px)"
            borderRadius="2xl"
            border="1px solid rgba(255,255,255,0.25)"
            boxShadow="0 8px 32px 0 rgba(31, 38, 135, 0.15)"
            variant="outline"
          >
            <CardHeader>
              <Heading size="md" color="white" textAlign="center">
                Choose Payment Method
              </Heading>
            </CardHeader>
            <CardBody>
              <VStack spacing={6} align="stretch">
                {/* Payment Status */}
                {paymentStatus === 'processing' && (
                  <Alert status="info" borderRadius="lg" bg="rgba(59, 130, 246, 0.1)" border="1px solid rgba(59, 130, 246, 0.3)">
                    <AlertIcon color="blue.400" />
                    <VStack align="start" spacing={1}>
                      <Text color="white" fontWeight="bold" fontSize="sm">
                        Processing Payment...
                      </Text>
                      <Text color="rgba(255,255,255,0.8)" fontSize="xs">
                        Please wait while we process your payment.
                      </Text>
                    </VStack>
                  </Alert>
                )}

                {paymentStatus === 'success' && (
                  <Alert status="success" borderRadius="lg" bg="rgba(34, 197, 94, 0.1)" border="1px solid rgba(34, 197, 94, 0.3)">
                    <AlertIcon color="green.400" />
                    <VStack align="start" spacing={1}>
                      <Text color="white" fontWeight="bold" fontSize="sm">
                        Payment Successful!
                      </Text>
                      <Text color="rgba(255,255,255,0.8)" fontSize="xs">
                        Your registration is confirmed. Redirecting to ticket...
                      </Text>
                    </VStack>
                  </Alert>
                )}

                {paymentStatus === 'failed' && (
                  <Alert status="error" borderRadius="lg" bg="rgba(239, 68, 68, 0.1)" border="1px solid rgba(239, 68, 68, 0.3)">
                    <AlertIcon color="red.400" />
                    <VStack align="start" spacing={1}>
                      <Text color="white" fontWeight="bold" fontSize="sm">
                        Payment Failed
                      </Text>
                      <Text color="rgba(255,255,255,0.8)" fontSize="xs">
                        Please try again or contact support.
                      </Text>
                    </VStack>
                  </Alert>
                )}

                {/* PhonePe Payment Button */}
                <Button
                  size="lg"
                  bg="#fbbf24"
                  color="white"
                  _hover={{ 
                    bg: "#f59e0b",
                    transform: "translateY(-2px)",
                    boxShadow: "0 8px 25px rgba(0,0,0,0.15)"
                  }}
                  leftIcon={<Icon as={FaCreditCard} />}
                  onClick={handlePhonePePayment}
                  isLoading={isLoading}
                  loadingText="Processing..."
                  disabled={isLoading || paymentStatus === 'processing' || paymentStatus === 'success'}
                  width="full"
                  py={6}
                  fontSize="lg"
                  fontWeight="bold"
                >
                  Pay with PhonePe - ₹{registrationData.amount_paid || 99}
                </Button>

                {/* Payment Info */}
                <Text
                  fontSize="sm"
                  color="rgba(255,255,255,0.7)"
                  textAlign="center"
                  maxW="400px"
                  mx="auto"
                >
                  Your payment is secured with PhonePe's industry-standard encryption. 
                  You'll be redirected to PhonePe for secure payment processing.
                </Text>

                <Divider borderColor="rgba(255,255,255,0.2)" />
                
                <Text fontSize="sm" color="rgba(255,255,255,0.6)" textAlign="center">
                  Having trouble with payment? Contact us at pranavbirhade100@gmail.com
                </Text>
              </VStack>
            </CardBody>
          </Card>
        </MotionBox>
      </Container>
    </Box>
  );
};

export default PaymentPage;
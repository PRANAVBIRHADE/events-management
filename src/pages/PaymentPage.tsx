import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Heading,
  Text,
  HStack,
  Button,
  Flex,
  Icon,
  Spinner,
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaCreditCard, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import { supabase, SeniorTicketRegistration } from '../lib/supabase';

const MotionBox = motion(Box);
const MotionButton = motion(Button);

const PaymentPage: React.FC = () => {
  const navigate = useNavigate();
  
  const [registrationData, setRegistrationData] = useState<SeniorTicketRegistration | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'processing' | 'success' | 'failed'>('pending');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    // Get registration data from localStorage
    const storedData = localStorage.getItem('registrationData');
    if (storedData) {
      setRegistrationData(JSON.parse(storedData));
    } else {
      // Redirect to user dashboard if no data
      navigate('/user-dashboard');
    }
  }, [navigate]);

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 3000);
  };

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
          showMessage('success', 'Your registration is confirmed. Generating your ticket...');

          // Redirect to ticket page after a short delay
          setTimeout(() => {
            navigate('/ticket');
          }, 2000);

        } catch (error: any) {
          console.error('Payment update error:', error);
          setPaymentStatus('failed');
          showMessage('error', 'Please contact support if payment was deducted.');
        } finally {
          setIsLoading(false);
        }
      }, 3000); // Simulate payment processing time

    } catch (error: any) {
      console.error('Payment error:', error);
      setPaymentStatus('failed');
      setIsLoading(false);
      showMessage('error', error.message || 'Something went wrong. Please try again.');
    }
  };

  const handleBackToRegistration = () => {
    navigate('/user-dashboard');
  };

  if (!registrationData) {
    return (
      <Box minH="100vh" bg="linear-gradient(135deg, #667eea 0%, #764ba2 100%)" display="flex" alignItems="center" justifyContent="center">
        <Spinner size="xl" color="white" />
      </Box>
    );
  }

  return (
    <Box minH="100vh" bg="linear-gradient(135deg, #667eea 0%, #764ba2 100%)" py={8}>
      <Container maxW="container.md">
        <MotionBox
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
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

          {/* Header */}
          <Flex direction="column" align="center" gap={6} mb={8}>
            <HStack align="center" gap={4}>
              <Button
                variant="ghost"
                color="white"
                onClick={handleBackToRegistration}
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
                Complete Payment
              </Heading>
            </HStack>
            
            <Text
              color="white"
              fontSize="lg"
              textAlign="center"
              textShadow="0 1px 2px rgba(0,0,0,0.3)"
            >
              Secure your spot at the Fresher's Party 2K25
            </Text>
          </Flex>

          {/* Payment Details Card */}
          <MotionBox
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            bg="white"
            p={8}
            borderRadius="xl"
            boxShadow="0 20px 40px rgba(0,0,0,0.1)"
            mb={6}
          >
            <Flex direction="column" gap={6}>
              <Heading size="lg" color="gray.700" textAlign="center">
                Registration Details
              </Heading>
              
              <Box w="full" p={4} border="1px solid" borderColor="gray.200" borderRadius="lg">
                <Flex direction="column" gap={4}>
                  <HStack justify="space-between">
                    <Text fontWeight="bold" color="gray.600">Name:</Text>
                    <Text color="gray.800">{registrationData.full_name}</Text>
                  </HStack>
                  <HStack justify="space-between">
                    <Text fontWeight="bold" color="gray.600">Email:</Text>
                    <Text color="gray.800">{registrationData.email}</Text>
                  </HStack>
                  <HStack justify="space-between">
                    <Text fontWeight="bold" color="gray.600">Mobile:</Text>
                    <Text color="gray.800">{registrationData.mobile_number}</Text>
                  </HStack>
                  <HStack justify="space-between">
                    <Text fontWeight="bold" color="gray.600">Year:</Text>
                    <Text color="gray.800">{registrationData.studying_year} Year</Text>
                  </HStack>
                  <Box h="1px" bg="gray.200" w="full" />
                  <HStack justify="space-between">
                    <Text fontWeight="bold" color="gray.600" fontSize="lg">Amount:</Text>
                    <Text fontSize="lg" fontWeight="bold" color="green.600">
                      ₹99
                    </Text>
                  </HStack>
                </Flex>
              </Box>
            </Flex>
          </MotionBox>

          {/* Payment Options */}
          <MotionBox
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            bg="white"
            p={8}
            borderRadius="xl"
            boxShadow="0 20px 40px rgba(0,0,0,0.1)"
          >
            <Flex direction="column" gap={6}>
              <Heading size="lg" color="gray.700" textAlign="center">
                Choose Payment Method
              </Heading>

              {/* Payment Status */}
              {paymentStatus === 'processing' && (
                <Box p={4} bg="blue.50" borderRadius="lg" border="1px solid" borderColor="blue.200">
                  <HStack>
                    <Spinner size="sm" color="blue.500" />
                    <Box>
                      <Text fontWeight="bold" color="blue.800">Processing Payment...</Text>
                      <Text fontSize="sm" color="blue.700">Please wait while we process your payment.</Text>
                    </Box>
                  </HStack>
                </Box>
              )}

              {paymentStatus === 'success' && (
                <Box p={4} bg="green.50" borderRadius="lg" border="1px solid" borderColor="green.200">
                  <HStack>
                    <Icon as={FaCheckCircle} color="green.500" boxSize={5} />
                    <Box>
                      <Text fontWeight="bold" color="green.800">Payment Successful!</Text>
                      <Text fontSize="sm" color="green.700">Your registration is confirmed. Redirecting to ticket...</Text>
                    </Box>
                  </HStack>
                </Box>
              )}

              {paymentStatus === 'failed' && (
                <Box p={4} bg="red.50" borderRadius="lg" border="1px solid" borderColor="red.200">
                  <HStack>
                    <Icon as={FaTimesCircle} color="red.500" boxSize={5} />
                    <Box>
                      <Text fontWeight="bold" color="red.800">Payment Failed</Text>
                      <Text fontSize="sm" color="red.700">Please try again or contact support.</Text>
                    </Box>
                  </HStack>
                </Box>
              )}

              {/* PhonePe Payment Button */}
              <Button
                variant="solid"
                size="lg"
                w="full"
                h="60px"
                fontSize="xl"
                fontWeight="bold"
                onClick={handlePhonePePayment}
                isLoading={isLoading}
                loadingText="Processing..."
                disabled={isLoading || paymentStatus === 'processing' || paymentStatus === 'success'}
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
                <Icon as={FaCreditCard} mr={3} />
                Pay with PhonePe - ₹99
              </Button>

              {/* Payment Info */}
              <Text
                fontSize="sm"
                color="gray.600"
                textAlign="center"
                maxW="400px"
                mx="auto"
              >
                Your payment is secured with PhonePe's industry-standard encryption. 
                You'll be redirected to PhonePe for secure payment processing.
              </Text>

              {/* Alternative Payment (if needed) */}
              <Box h="1px" bg="gray.200" w="full" />
              
              <Text fontSize="sm" color="gray.500" textAlign="center">
                Having trouble with payment? Contact us at support@freshersparty.com
              </Text>
            </Flex>
          </MotionBox>
        </MotionBox>
      </Container>
    </Box>
  );
};

export default PaymentPage;
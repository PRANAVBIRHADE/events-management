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
  Input,
  FormControl,
  FormLabel,
  FormErrorMessage,
  useToast,
  Spinner,
  Center,
  Divider,
  Image,
  Progress,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  FaArrowLeft,
  FaQrcode,
  FaCopy,
  FaUpload,
  FaCheck,
  FaTimes,
  FaRupeeSign,
  FaClock,
  FaExclamationTriangle,
  FaInfoCircle,
  FaMobile,
  FaGraduationCap,
  FaCalendarAlt,
  FaMapMarkerAlt,
} from 'react-icons/fa';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

const MotionBox = motion(Box);
const MotionButton = motion(Button);

interface PaymentData {
  registration: any;
  event: any;
  amount: number;
  upiId: string;
}

const UPIPaymentPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const toast = useToast();
  
  const [paymentData, setPaymentData] = useState<PaymentData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [screenshotFile, setScreenshotFile] = useState<File | null>(null);
  const [paymentReference, setPaymentReference] = useState('');
  const [paymentVerificationId, setPaymentVerificationId] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [timeLeft, setTimeLeft] = useState(15 * 60); // 15 minutes
  const [isExpired, setIsExpired] = useState(false);
  
  const { isOpen: isQRModalOpen, onOpen: onQRModalOpen, onClose: onQRModalClose } = useDisclosure();

  useEffect(() => {
    loadPaymentData();
    startTimer();
  }, []);

  const loadPaymentData = async () => {
    try {
      const storedRegistration = localStorage.getItem('registrationData');
      const storedEvent = localStorage.getItem('eventData');
      
      if (location.state) {
        const { registration, event, amount } = location.state;
        setPaymentData({
          registration,
          event,
          amount,
          upiId: '7038763252@ybl'
        });
        await createPaymentVerification(registration, event, amount);
      } else if (storedRegistration && storedEvent) {
        const registration = JSON.parse(storedRegistration);
        const event = JSON.parse(storedEvent);
        const amount = calculateAmount(registration, event);
        
        setPaymentData({
          registration,
          event,
          amount,
          upiId: '7038763252@ybl'
        });
        await createPaymentVerification(registration, event, amount);
      } else {
        navigate('/events');
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

  const calculateAmount = (registration: any, event: any) => {
    if (registration.registration_type === 'fresher') {
      return 0; // Freshers are free
    }
    
    // For seniors, calculate based on year and event pricing
    const year = registration.studying_year;
    
    if (event.pricing_type === 'year_specific') {
      const yearPricing = event.year_specific_pricing;
      if (yearPricing && yearPricing[year]) {
        return yearPricing[year];
      }
    }
    
    if (event.free_for_years && event.free_for_years.includes(year)) {
      return 0;
    }
    
    if (event.paid_for_years && event.paid_for_years.includes(year)) {
      return event.base_price || 0;
    }
    
    return event.base_price || 0;
  };

  const createPaymentVerification = async (registration: any, event: any, amount: number) => {
    try {
      const { data, error } = await supabase
        .from('payment_verifications')
        .insert({
          registration_id: registration.id,
          registration_type: registration.registration_type,
          event_id: event.id,
          user_id: user?.id,
          amount: amount,
          upi_id: '7038763252@ybl',
          payment_status: 'pending'
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating payment verification:', error);
        throw error;
      }

      setPaymentVerificationId(data.id);
    } catch (error) {
      console.error('Error creating payment verification:', error);
      toast({
        title: 'Error',
        description: 'Failed to create payment verification',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const startTimer = () => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setIsExpired(true);
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: 'Copied!',
      description: 'UPI ID copied to clipboard',
      status: 'success',
      duration: 2000,
      isClosable: true,
    });
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast({
          title: 'Invalid File',
          description: 'Please upload an image file (PNG, JPG, etc.)',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: 'File Too Large',
          description: 'Please upload an image smaller than 5MB',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
        return;
      }

      setScreenshotFile(file);
    }
  };

  const uploadScreenshot = async () => {
    if (!screenshotFile || !paymentVerificationId) return;

    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Create unique filename
      const fileExt = screenshotFile.name.split('.').pop();
      const fileName = `${paymentVerificationId}_${Date.now()}.${fileExt}`;
      const filePath = `payment-screenshots/${fileName}`;

      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('payment-screenshots')
        .upload(filePath, screenshotFile, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        throw uploadError;
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('payment-screenshots')
        .getPublicUrl(filePath);

      // Update payment verification with screenshot URL
      const { error: updateError } = await supabase
        .from('payment_verifications')
        .update({
          screenshot_url: urlData.publicUrl,
          payment_reference: paymentReference || null
        })
        .eq('id', paymentVerificationId);

      if (updateError) {
        console.error('Update error:', updateError);
        throw updateError;
      }

      toast({
        title: 'Screenshot Uploaded!',
        description: 'Your payment screenshot has been uploaded successfully. Admin will verify it shortly.',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });

      // Navigate to pending verification page
      navigate('/payment-pending', {
        state: {
          paymentVerificationId,
          registration: paymentData?.registration,
          event: paymentData?.event
        }
      });

    } catch (error) {
      console.error('Error uploading screenshot:', error);
      toast({
        title: 'Upload Failed',
        description: 'Failed to upload screenshot. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const generateUPIString = () => {
    if (!paymentData) return '';
    return `upi://pay?pa=${paymentData.upiId}&pn=MPGI%20SOE&am=${paymentData.amount}&cu=INR&tn=Event%20Registration`;
  };

  if (isLoading) {
    return (
      <Box minH="100vh" bg="linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)" display="flex" alignItems="center" justifyContent="center">
        <VStack spacing={4}>
          <Spinner size="xl" color="white" />
          <Text color="white" fontSize="lg">Loading payment details...</Text>
        </VStack>
      </Box>
    );
  }

  if (!paymentData) {
    return (
      <Box minH="100vh" bg="linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)" display="flex" alignItems="center" justifyContent="center">
        <VStack spacing={4}>
          <Text color="white" fontSize="lg">No payment data found</Text>
          <Button onClick={() => navigate('/events')}>Back to Events</Button>
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
              onClick={() => navigate('/events')}
              leftIcon={<Icon as={FaArrowLeft} />}
            >
              Back to Events
            </Button>
          </Flex>

          <VStack spacing={4} align="center" textAlign="center">
            <Heading
              as="h1"
              size="2xl"
              color="white"
              fontWeight="900"
            >
              Complete Your Payment
            </Heading>
            <Text
              fontSize="lg"
              color="rgba(255,255,255,0.8)"
              maxW="600px"
            >
              Pay securely via UPI to complete your event registration
            </Text>
          </VStack>
        </MotionBox>

        {/* Payment Details Card */}
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
              <Heading size="lg">Payment Details</Heading>
              <Text opacity={0.9}>Event Registration Payment</Text>
            </VStack>
          </CardHeader>

          <CardBody p={8}>
            <VStack spacing={6} align="stretch">
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

              {/* Payment Amount */}
              <VStack spacing={4} align="center">
                <Heading size="md" color="gray.700">Payment Amount</Heading>
                
                <HStack spacing={2} fontSize="3xl" fontWeight="bold" color="green.600">
                  <Icon as={FaRupeeSign} />
                  <Text>{paymentData.amount}</Text>
                </HStack>
                
                {paymentData.amount === 0 && (
                  <Alert status="info" borderRadius="lg">
                    <AlertIcon />
                    <AlertDescription>
                      This event is free for your year! No payment required.
                    </AlertDescription>
                  </Alert>
                )}
              </VStack>

              {paymentData.amount > 0 && (
                <>
                  <Divider />

                  {/* UPI Payment Instructions */}
                  <VStack spacing={4} align="stretch">
                    <Heading size="md" color="gray.700">UPI Payment Instructions</Heading>
                    
                    <Alert status="warning" borderRadius="lg">
                      <AlertIcon />
                      <AlertDescription>
                        <Text fontWeight="bold" mb={2}>Important:</Text>
                        <Text>• Make payment to the UPI ID below</Text>
                        <Text>• Include your registration ID in the payment note</Text>
                        <Text>• Take a screenshot of the payment confirmation</Text>
                        <Text>• Upload the screenshot below for verification</Text>
                      </AlertDescription>
                    </Alert>

                    {/* UPI ID Display */}
                    <Card variant="outline" borderColor="green.200" bg="green.50">
                      <CardBody>
                        <VStack spacing={4}>
                          <HStack spacing={2}>
                            <Icon as={FaQrcode} color="green.600" />
                            <Text fontWeight="bold" color="green.800">UPI ID</Text>
                          </HStack>
                          
                          <HStack spacing={4} w="full">
                            <Text 
                              fontFamily="mono" 
                              fontSize="lg" 
                              fontWeight="bold" 
                              color="green.700"
                              flex="1"
                              textAlign="center"
                              p={3}
                              bg="white"
                              borderRadius="md"
                              border="1px solid"
                              borderColor="green.300"
                            >
                              {paymentData.upiId}
                            </Text>
                            <Button
                              colorScheme="green"
                              variant="outline"
                              leftIcon={<Icon as={FaCopy} />}
                              onClick={() => copyToClipboard(paymentData.upiId)}
                            >
                              Copy
                            </Button>
                          </HStack>
                          
                          <Button
                            colorScheme="green"
                            variant="outline"
                            leftIcon={<Icon as={FaQrcode} />}
                            onClick={onQRModalOpen}
                          >
                            Show QR Code
                          </Button>
                        </VStack>
                      </CardBody>
                    </Card>

                    {/* Payment Reference */}
                    <FormControl>
                      <FormLabel>Payment Reference (Optional)</FormLabel>
                      <Input
                        placeholder="Enter payment reference or transaction ID"
                        value={paymentReference}
                        onChange={(e) => setPaymentReference(e.target.value)}
                      />
                    </FormControl>

                    {/* Screenshot Upload */}
                    <FormControl>
                      <FormLabel>Payment Screenshot</FormLabel>
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={handleFileUpload}
                        p={1}
                      />
                      <Text fontSize="sm" color="gray.500" mt={1}>
                        Upload a screenshot of your payment confirmation
                      </Text>
                    </FormControl>

                    {screenshotFile && (
                      <VStack spacing={4}>
                        <Text fontWeight="bold" color="green.600">
                          Selected File: {screenshotFile.name}
                        </Text>
                        
                        {isUploading && (
                          <VStack spacing={2} w="full">
                            <Text fontSize="sm" color="gray.600">Uploading...</Text>
                            <Progress value={uploadProgress} w="full" colorScheme="green" />
                          </VStack>
                        )}
                        
                        <Button
                          colorScheme="green"
                          size="lg"
                          leftIcon={<Icon as={FaUpload} />}
                          onClick={uploadScreenshot}
                          isLoading={isUploading}
                          loadingText="Uploading..."
                          w="full"
                        >
                          Upload Screenshot & Submit
                        </Button>
                      </VStack>
                    )}
                  </VStack>
                </>
              )}

              {/* Timer */}
              {paymentData.amount > 0 && !isExpired && (
                <Alert status="info" borderRadius="lg">
                  <AlertIcon />
                  <AlertDescription>
                    <HStack spacing={2}>
                      <Icon as={FaClock} />
                      <Text>
                        Time remaining: <Text as="span" fontWeight="bold">{formatTime(timeLeft)}</Text>
                      </Text>
                    </HStack>
                  </AlertDescription>
                </Alert>
              )}

              {isExpired && (
                <Alert status="error" borderRadius="lg">
                  <AlertIcon />
                  <AlertDescription>
                    Payment session expired. Please start a new registration.
                  </AlertDescription>
                </Alert>
              )}
            </VStack>
          </CardBody>
        </MotionBox>
      </Container>

      {/* QR Code Modal */}
      <Modal isOpen={isQRModalOpen} onClose={onQRModalClose} size="md">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>UPI QR Code</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <VStack spacing={4} align="center">
              <Text fontSize="sm" color="gray.600" textAlign="center">
                Scan this QR code with any UPI app to make payment
              </Text>
              
              <Box
                p={4}
                border="2px solid"
                borderColor="gray.200"
                borderRadius="lg"
                bg="white"
                display="flex"
                justifyContent="center"
                alignItems="center"
              >
                <QRCode 
                  value={generateUPIString()}
                  size={200}
                />
              </Box>
              
              <VStack spacing={2} align="center">
                <Text fontSize="sm" color="gray.500">
                  UPI ID: {paymentData.upiId}
                </Text>
                <Text fontSize="sm" color="gray.500">
                  Amount: ₹{paymentData.amount}
                </Text>
              </VStack>
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default UPIPaymentPage;

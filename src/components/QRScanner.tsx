import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Button,
  VStack,
  HStack,
  Text,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Badge,
  Card,
  CardBody,
  CardHeader,
  Heading,
  Icon,
  useToast,
} from '@chakra-ui/react';
import { FaQrcode, FaCheck, FaTimes, FaUser, FaEnvelope, FaPhone, FaCalendar } from 'react-icons/fa';
import { supabase } from '../lib/supabase';

interface QRScannerProps {
  isOpen: boolean;
  onClose: () => void;
}

interface RegistrationData {
  id: string;
  full_name: string;
  email: string;
  mobile_number: string;
  studying_year: number;
  registration_type: string;
  event_name: string;
  event_date: string;
  payment_status?: string;
  amount_paid?: number;
}

const QRScanner: React.FC<QRScannerProps> = ({ isOpen, onClose }) => {
  const [isScanning, setIsScanning] = useState(false);
  const [scannedData, setScannedData] = useState<string | null>(null);
  const [registrationData, setRegistrationData] = useState<RegistrationData | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const toast = useToast();

  // Simple QR code detection (in a real app, you'd use a proper QR library)
  const startScanning = async () => {
    try {
      setError(null);
      setIsScanning(true);
      
      // Request camera access
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
      }
    } catch (err) {
      console.error('Error accessing camera:', err);
      setError('Unable to access camera. Please check permissions.');
      setIsScanning(false);
    }
  };

  const stopScanning = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsScanning(false);
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  const handleManualInput = () => {
    const manualCode = prompt('Enter registration ID manually:');
    if (manualCode) {
      setScannedData(manualCode);
      verifyRegistration(manualCode);
    }
  };

  const verifyRegistration = async (registrationId: string) => {
    setIsVerifying(true);
    setError(null);
    
    try {
      console.log('Verifying registration:', registrationId);
      
      // Parse QR code data if it's in the format "REG:id:email:eventId"
      let actualId = registrationId;
      if (registrationId.startsWith('REG:')) {
        const parts = registrationId.split(':');
        actualId = parts[1]; // Extract the registration ID
      }
      
      // Query both freshers_registrations and senior_ticket_registrations
      const [freshersResult, seniorsResult] = await Promise.all([
        supabase
          .from('freshers_registrations')
          .select(`
            id,
            full_name,
            email,
            mobile_number,
            studying_year,
            registration_type,
            created_at,
            events!inner(name, event_date)
          `)
          .eq('id', actualId)
          .single(),
        
        supabase
          .from('senior_ticket_registrations')
          .select(`
            id,
            full_name,
            email,
            mobile_number,
            studying_year,
            registration_type,
            payment_status,
            amount_paid,
            created_at,
            events!inner(name, event_date)
          `)
          .eq('id', actualId)
          .single()
      ]);

      let registration = null;
      let isFresher = false;

      if (freshersResult.data && !freshersResult.error) {
        registration = freshersResult.data;
        isFresher = true;
      } else if (seniorsResult.data && !seniorsResult.error) {
        registration = seniorsResult.data;
        isFresher = false;
      }

      if (registration) {
        setRegistrationData({
          id: registration.id,
          full_name: registration.full_name,
          email: registration.email,
          mobile_number: registration.mobile_number,
          studying_year: registration.studying_year,
          registration_type: registration.registration_type,
          event_name: Array.isArray(registration.events) && registration.events.length > 0 ? registration.events[0].name : '',
          event_date: Array.isArray(registration.events) && registration.events.length > 0 ? registration.events[0].event_date : '',
          payment_status: isFresher ? 'free' : registration.payment_status,
          amount_paid: isFresher ? 0 : registration.amount_paid,
        });

        toast({
          title: 'Registration Verified!',
          description: `${registration.full_name} is registered for ${Array.isArray(registration.events) && registration.events.length > 0 ? registration.events[0].name : ''}`,
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
      } else {
        setError('Registration not found. Please check the QR code or registration ID.');
        toast({
          title: 'Registration Not Found',
          description: 'No registration found with this ID',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      }
    } catch (err) {
      console.error('Error verifying registration:', err);
      setError('Error verifying registration. Please try again.');
      toast({
        title: 'Verification Error',
        description: 'Failed to verify registration',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const resetScanner = () => {
    setScannedData(null);
    setRegistrationData(null);
    setError(null);
    stopScanning();
  };

  useEffect(() => {
    if (!isOpen) {
      resetScanner();
    }
  }, [isOpen]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          <HStack spacing={3}>
            <Icon as={FaQrcode} color="blue.500" />
            <Text>QR Code Scanner</Text>
          </HStack>
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={6}>
          <VStack spacing={6} align="stretch">
            {/* Scanner Controls */}
            <VStack spacing={4}>
              {!isScanning ? (
                <Button
                  colorScheme="blue"
                  size="lg"
                  leftIcon={<Icon as={FaQrcode} />}
                  onClick={startScanning}
                  w="full"
                >
                  Start Camera Scanner
                </Button>
              ) : (
                <Button
                  colorScheme="red"
                  size="lg"
                  onClick={stopScanning}
                  w="full"
                >
                  Stop Scanner
                </Button>
              )}
              
              <Button
                variant="outline"
                size="lg"
                onClick={handleManualInput}
                w="full"
              >
                Enter Registration ID Manually
              </Button>
            </VStack>

            {/* Camera Preview */}
            {isScanning && (
              <Box
                border="2px solid"
                borderColor="blue.300"
                borderRadius="lg"
                overflow="hidden"
                bg="gray.100"
                minH="300px"
                display="flex"
                alignItems="center"
                justifyContent="center"
              >
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </Box>
            )}

            {/* Error Display */}
            {error && (
              <Alert status="error">
                <AlertIcon />
                <AlertTitle>Error!</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Verification Status */}
            {isVerifying && (
              <Alert status="info">
                <AlertIcon />
                <AlertDescription>Verifying registration...</AlertDescription>
              </Alert>
            )}

            {/* Registration Details */}
            {registrationData && (
              <Card>
                <CardHeader>
                  <HStack spacing={3}>
                    <Icon as={FaCheck} color="green.500" />
                    <Heading size="md">Registration Verified</Heading>
                  </HStack>
                </CardHeader>
                <CardBody>
                  <VStack spacing={4} align="stretch">
                    <HStack justify="space-between">
                      <HStack spacing={2}>
                        <Icon as={FaUser} color="blue.500" />
                        <Text fontWeight="bold">Name:</Text>
                      </HStack>
                      <Text>{registrationData.full_name}</Text>
                    </HStack>
                    
                    <HStack justify="space-between">
                      <HStack spacing={2}>
                        <Icon as={FaEnvelope} color="green.500" />
                        <Text fontWeight="bold">Email:</Text>
                      </HStack>
                      <Text fontSize="sm">{registrationData.email}</Text>
                    </HStack>
                    
                    <HStack justify="space-between">
                      <HStack spacing={2}>
                        <Icon as={FaPhone} color="purple.500" />
                        <Text fontWeight="bold">Mobile:</Text>
                      </HStack>
                      <Text>{registrationData.mobile_number}</Text>
                    </HStack>
                    
                    <HStack justify="space-between">
                      <Text fontWeight="bold">Year:</Text>
                      <Badge colorScheme="blue">Year {registrationData.studying_year}</Badge>
                    </HStack>
                    
                    <HStack justify="space-between">
                      <Text fontWeight="bold">Type:</Text>
                      <Badge 
                        colorScheme={registrationData.registration_type === 'fresher' ? 'green' : 'blue'}
                      >
                        {registrationData.registration_type === 'fresher' ? 'Fresher' : 'Senior'}
                      </Badge>
                    </HStack>
                    
                    <HStack justify="space-between">
                      <HStack spacing={2}>
                        <Icon as={FaCalendar} color="orange.500" />
                        <Text fontWeight="bold">Event:</Text>
                      </HStack>
                      <Text fontSize="sm" textAlign="right">{registrationData.event_name}</Text>
                    </HStack>
                    
                    {registrationData.registration_type === 'senior' && (
                      <HStack justify="space-between">
                        <Text fontWeight="bold">Payment:</Text>
                        <Badge 
                          colorScheme={registrationData.payment_status === 'completed' ? 'green' : 'red'}
                        >
                          {registrationData.payment_status === 'completed' ? 'Paid' : 'Pending'}
                        </Badge>
                      </HStack>
                    )}
                    
                    <HStack justify="space-between">
                      <Text fontWeight="bold">Registration ID:</Text>
                      <Text fontSize="sm" fontFamily="mono">{registrationData.id}</Text>
                    </HStack>
                  </VStack>
                </CardBody>
              </Card>
            )}

            {/* Action Buttons */}
            <HStack spacing={4}>
              <Button
                flex="1"
                colorScheme="green"
                onClick={() => {
                  if (registrationData) {
                    toast({
                      title: 'Entry Approved!',
                      description: `${registrationData.full_name} has been granted entry`,
                      status: 'success',
                      duration: 3000,
                      isClosable: true,
                    });
                    resetScanner();
                  }
                }}
                isDisabled={!registrationData}
              >
                Approve Entry
              </Button>
              
              <Button
                flex="1"
                variant="outline"
                onClick={resetScanner}
              >
                Scan Another
              </Button>
            </HStack>
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default QRScanner;

import React, { useState, useEffect } from 'react';
import {
  Box,
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
  Image,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  ModalFooter,
  Textarea,
  useDisclosure,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import {
  FaCheck,
  FaTimes,
  FaEye,
  FaClock,
  FaRupeeSign,
  FaUser,
  FaEnvelope,
  FaPhone,
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaGraduationCap,
  FaQrcode,
  FaExclamationTriangle,
  FaImage,
} from 'react-icons/fa';
import { supabase } from '../lib/supabase';

const MotionCard = motion(Card);

interface PaymentVerification {
  id: string;
  registration_id: string;
  registration_type: string;
  event_id: string;
  user_id: string;
  amount: number;
  upi_id: string;
  payment_status: string;
  screenshot_url?: string;
  payment_reference?: string;
  admin_notes?: string;
  verified_by?: string;
  verified_at?: string;
  created_at: string;
  updated_at: string;
  user_details: {
    full_name: string;
    email: string;
    mobile_number: string;
    studying_year: number;
  };
  event_details: {
    name: string;
    event_date: string;
    location: string;
  };
}

const PaymentVerification: React.FC = () => {
  const [payments, setPayments] = useState<PaymentVerification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPayment, setSelectedPayment] = useState<PaymentVerification | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [adminNotes, setAdminNotes] = useState('');
  const [paymentReference, setPaymentReference] = useState('');
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    verified: 0,
    rejected: 0
  });
  
  const { isOpen: isModalOpen, onOpen: onModalOpen, onClose: onModalClose } = useDisclosure();
  const toast = useToast();

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from('payment_verifications')
        .select(`
          *,
          user_profiles!inner(full_name, email, mobile_number, studying_year),
          events!payment_verifications_event_id_fkey(name, event_date, location)
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching payments:', error);
        throw error;
      }

      // Transform the data to match our interface
      const transformedPayments = data.map((payment: any) => ({
        ...payment,
        user_details: {
          full_name: payment.user_profiles.full_name,
          email: payment.user_profiles.email,
          mobile_number: payment.user_profiles.mobile_number,
          studying_year: payment.user_profiles.studying_year,
        },
        event_details: {
          name: Array.isArray(payment.events) && payment.events.length > 0 ? payment.events[0].name : '',
          event_date: Array.isArray(payment.events) && payment.events.length > 0 ? payment.events[0].event_date : '',
          location: Array.isArray(payment.events) && payment.events.length > 0 ? payment.events[0].location : '',
        }
      }));

      setPayments(transformedPayments);
      
      // Calculate stats
      const total = transformedPayments.length;
      const pending = transformedPayments.filter(p => p.payment_status === 'pending').length;
      const verified = transformedPayments.filter(p => p.payment_status === 'verified').length;
      const rejected = transformedPayments.filter(p => p.payment_status === 'rejected').length;
      
      setStats({ total, pending, verified, rejected });
    } catch (error) {
      console.error('Error fetching payments:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch payment verifications',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyPayment = async (paymentId: string, action: 'verify' | 'reject') => {
    try {
      setIsVerifying(true);
      
      let result;
      if (action === 'verify') {
        result = await supabase.rpc('verify_payment_and_update_registration', {
          p_payment_id: paymentId,
          p_admin_notes: adminNotes || null,
          p_payment_reference: paymentReference || null
        });
      } else {
        result = await supabase.rpc('reject_payment_verification', {
          p_payment_id: paymentId,
          p_admin_notes: adminNotes || null
        });
      }

      if (result.error) {
        console.error('Error processing payment:', result.error);
        throw result.error;
      }

      toast({
        title: action === 'verify' ? 'Payment Verified!' : 'Payment Rejected',
        description: result.data?.message || `Payment ${action === 'verify' ? 'verified' : 'rejected'} successfully`,
        status: action === 'verify' ? 'success' : 'warning',
        duration: 5000,
        isClosable: true,
      });

      // Refresh the payments list
      await fetchPayments();
      onModalClose();
      setAdminNotes('');
      setPaymentReference('');
    } catch (error) {
      console.error('Error processing payment:', error);
      toast({
        title: 'Error',
        description: 'Failed to process payment verification',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const openPaymentModal = (payment: PaymentVerification) => {
    setSelectedPayment(payment);
    setAdminNotes(payment.admin_notes || '');
    setPaymentReference(payment.payment_reference || '');
    onModalOpen();
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
        return FaTimes;
      case 'expired':
        return FaExclamationTriangle;
      default:
        return FaClock;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <Center py={8}>
        <VStack spacing={4}>
          <Spinner size="xl" color="blue.500" />
          <Text color="gray.600">Loading payment verifications...</Text>
        </VStack>
      </Center>
    );
  }

  return (
    <VStack spacing={6} align="stretch">
      <Heading size="lg" color="gray.800">
        💳 Payment Verifications
      </Heading>

      {/* Stats Cards */}
      <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4}>
        <Card>
          <CardBody>
            <Stat>
              <StatLabel>Total Payments</StatLabel>
              <StatNumber color="blue.500">{stats.total}</StatNumber>
            </Stat>
          </CardBody>
        </Card>
        
        <Card>
          <CardBody>
            <Stat>
              <StatLabel>Pending</StatLabel>
              <StatNumber color="orange.500">{stats.pending}</StatNumber>
              <StatHelpText>
                <StatArrow type="increase" />
                Awaiting verification
              </StatHelpText>
            </Stat>
          </CardBody>
        </Card>
        
        <Card>
          <CardBody>
            <Stat>
              <StatLabel>Verified</StatLabel>
              <StatNumber color="green.500">{stats.verified}</StatNumber>
            </Stat>
          </CardBody>
        </Card>
        
        <Card>
          <CardBody>
            <Stat>
              <StatLabel>Rejected</StatLabel>
              <StatNumber color="red.500">{stats.rejected}</StatNumber>
            </Stat>
          </CardBody>
        </Card>
      </SimpleGrid>

      {/* Payment List */}
      {payments.length === 0 ? (
        <Alert status="info" borderRadius="lg">
          <AlertIcon />
          <AlertDescription>
            No payment verifications found.
          </AlertDescription>
        </Alert>
      ) : (
        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
          {payments.map((payment, index) => (
            <MotionCard
              key={payment.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              variant="outline"
              borderColor={
                payment.payment_status === 'verified' ? 'green.200' :
                payment.payment_status === 'rejected' ? 'red.200' :
                'orange.200'
              }
              bg={
                payment.payment_status === 'verified' ? 'green.50' :
                payment.payment_status === 'rejected' ? 'red.50' :
                'orange.50'
              }
            >
              <CardHeader>
                <VStack spacing={2} align="start">
                  <HStack justify="space-between" w="full">
                    <Heading size="md" color="gray.800">
                      {payment.event_details.name}
                    </Heading>
                    <Badge
                      colorScheme={getStatusColor(payment.payment_status)}
                      fontSize="sm"
                    >
                      {payment.payment_status.toUpperCase()}
                    </Badge>
                  </HStack>
                  
                  <HStack spacing={2}>
                    <Icon as={getStatusIcon(payment.payment_status)} color={`${getStatusColor(payment.payment_status)}.500`} />
                    <Text fontSize="sm" color="gray.600">
                      {formatDate(payment.created_at)}
                    </Text>
                  </HStack>
                </VStack>
              </CardHeader>
              
              <CardBody pt={0}>
                <VStack spacing={4} align="stretch">
                  {/* User Details */}
                  <VStack spacing={2} align="stretch">
                    <HStack spacing={2} color="gray.500" fontSize="sm">
                      <Icon as={FaUser} />
                      <Text>{payment.user_details.full_name}</Text>
                    </HStack>
                    <HStack spacing={2} color="gray.500" fontSize="sm">
                      <Icon as={FaEnvelope} />
                      <Text>{payment.user_details.email}</Text>
                    </HStack>
                    <HStack spacing={2} color="gray.500" fontSize="sm">
                      <Icon as={FaPhone} />
                      <Text>{payment.user_details.mobile_number}</Text>
                    </HStack>
                    <HStack spacing={2} color="gray.500" fontSize="sm">
                      <Icon as={FaGraduationCap} />
                      <Text>Year {payment.user_details.studying_year}</Text>
                    </HStack>
                  </VStack>

                  <Divider />

                  {/* Payment Details */}
                  <VStack spacing={2} align="stretch">
                    <HStack justify="space-between">
                      <Text fontWeight="bold" color="gray.600">Amount:</Text>
                      <HStack spacing={1} color="green.600">
                        <Icon as={FaRupeeSign} />
                        <Text fontWeight="bold">{payment.amount}</Text>
                      </HStack>
                    </HStack>
                    
                    <HStack justify="space-between">
                      <Text fontWeight="bold" color="gray.600">Type:</Text>
                      <Badge colorScheme={payment.registration_type === 'fresher' ? 'green' : 'blue'}>
                        {payment.registration_type === 'fresher' ? 'Fresher' : 'Senior'}
                      </Badge>
                    </HStack>
                    
                    <HStack justify="space-between">
                      <Text fontWeight="bold" color="gray.600">UPI ID:</Text>
                      <Text fontSize="sm" fontFamily="mono">{payment.upi_id}</Text>
                    </HStack>
                  </VStack>

                  {/* Action Buttons */}
                  <HStack spacing={2}>
                    <Button
                      size="sm"
                      variant="outline"
                      leftIcon={<Icon as={FaEye} />}
                      onClick={() => openPaymentModal(payment)}
                      flex="1"
                    >
                      View Details
                    </Button>
                    
                    {payment.payment_status === 'pending' && (
                      <>
                        <Button
                          size="sm"
                          colorScheme="green"
                          leftIcon={<Icon as={FaCheck} />}
                          onClick={() => {
                            setSelectedPayment(payment);
                            setAdminNotes('');
                            setPaymentReference('');
                            onModalOpen();
                          }}
                          flex="1"
                        >
                          Verify
                        </Button>
                        <Button
                          size="sm"
                          colorScheme="red"
                          leftIcon={<Icon as={FaTimes} />}
                          onClick={() => {
                            setSelectedPayment(payment);
                            setAdminNotes('');
                            setPaymentReference('');
                            onModalOpen();
                          }}
                          flex="1"
                        >
                          Reject
                        </Button>
                      </>
                    )}
                  </HStack>
                </VStack>
              </CardBody>
            </MotionCard>
          ))}
        </SimpleGrid>
      )}

      {/* Payment Details Modal */}
      <Modal isOpen={isModalOpen} onClose={onModalClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            <HStack spacing={3}>
              <Icon as={FaEye} color="blue.500" />
              <Text>Payment Verification Details</Text>
            </HStack>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            {selectedPayment && (
              <VStack spacing={6} align="stretch">
                {/* Payment Status */}
                <HStack justify="center">
                  <Icon 
                    as={getStatusIcon(selectedPayment.payment_status)} 
                    boxSize={8} 
                    color={`${getStatusColor(selectedPayment.payment_status)}.500`}
                  />
                  <Badge 
                    colorScheme={getStatusColor(selectedPayment.payment_status)}
                    fontSize="lg"
                    px={4}
                    py={2}
                    borderRadius="full"
                  >
                    {selectedPayment.payment_status.toUpperCase()}
                  </Badge>
                </HStack>

                {/* User Information */}
                <Card>
                  <CardHeader>
                    <Heading size="sm">User Information</Heading>
                  </CardHeader>
                  <CardBody pt={0}>
                    <VStack spacing={2} align="stretch">
                      <HStack justify="space-between">
                        <Text fontWeight="bold">Name:</Text>
                        <Text>{selectedPayment.user_details.full_name}</Text>
                      </HStack>
                      <HStack justify="space-between">
                        <Text fontWeight="bold">Email:</Text>
                        <Text fontSize="sm">{selectedPayment.user_details.email}</Text>
                      </HStack>
                      <HStack justify="space-between">
                        <Text fontWeight="bold">Mobile:</Text>
                        <Text>{selectedPayment.user_details.mobile_number}</Text>
                      </HStack>
                      <HStack justify="space-between">
                        <Text fontWeight="bold">Year:</Text>
                        <Text>Year {selectedPayment.user_details.studying_year}</Text>
                      </HStack>
                    </VStack>
                  </CardBody>
                </Card>

                {/* Event Information */}
                <Card>
                  <CardHeader>
                    <Heading size="sm">Event Information</Heading>
                  </CardHeader>
                  <CardBody pt={0}>
                    <VStack spacing={2} align="stretch">
                      <HStack justify="space-between">
                        <Text fontWeight="bold">Event:</Text>
                        <Text>{selectedPayment.event_details.name}</Text>
                      </HStack>
                      <HStack justify="space-between">
                        <Text fontWeight="bold">Date:</Text>
                        <Text>{formatDate(selectedPayment.event_details.event_date)}</Text>
                      </HStack>
                      <HStack justify="space-between">
                        <Text fontWeight="bold">Location:</Text>
                        <Text>{selectedPayment.event_details.location}</Text>
                      </HStack>
                    </VStack>
                  </CardBody>
                </Card>

                {/* Payment Information */}
                <Card>
                  <CardHeader>
                    <Heading size="sm">Payment Information</Heading>
                  </CardHeader>
                  <CardBody pt={0}>
                    <VStack spacing={2} align="stretch">
                      <HStack justify="space-between">
                        <Text fontWeight="bold">Amount:</Text>
                        <HStack spacing={1} color="green.600">
                          <Icon as={FaRupeeSign} />
                          <Text fontWeight="bold">{selectedPayment.amount}</Text>
                        </HStack>
                      </HStack>
                      <HStack justify="space-between">
                        <Text fontWeight="bold">UPI ID:</Text>
                        <Text fontFamily="mono">{selectedPayment.upi_id}</Text>
                      </HStack>
                      <HStack justify="space-between">
                        <Text fontWeight="bold">Registration Type:</Text>
                        <Badge colorScheme={selectedPayment.registration_type === 'fresher' ? 'green' : 'blue'}>
                          {selectedPayment.registration_type === 'fresher' ? 'Fresher' : 'Senior'}
                        </Badge>
                      </HStack>
                      {selectedPayment.payment_reference && (
                        <HStack justify="space-between">
                          <Text fontWeight="bold">Reference:</Text>
                          <Text fontSize="sm">{selectedPayment.payment_reference}</Text>
                        </HStack>
                      )}
                    </VStack>
                  </CardBody>
                </Card>

                {/* Screenshot */}
                {selectedPayment.screenshot_url && (
                  <Card>
                    <CardHeader>
                      <Heading size="sm">Payment Screenshot</Heading>
                    </CardHeader>
                    <CardBody pt={0}>
                      <Box
                        border="2px solid"
                        borderColor="gray.200"
                        borderRadius="lg"
                        overflow="hidden"
                        maxH="400px"
                      >
                        <Image
                          src={selectedPayment.screenshot_url}
                          alt="Payment Screenshot"
                          w="full"
                          h="auto"
                          objectFit="contain"
                        />
                      </Box>
                    </CardBody>
                  </Card>
                )}

                {/* Admin Notes */}
                <VStack spacing={2} align="stretch">
                  <Text fontWeight="bold">Admin Notes:</Text>
                  <Textarea
                    placeholder="Add notes about this payment verification..."
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    rows={3}
                  />
                </VStack>

                {/* Payment Reference */}
                <VStack spacing={2} align="stretch">
                  <Text fontWeight="bold">Payment Reference:</Text>
                  <Textarea
                    placeholder="Enter payment reference or transaction ID..."
                    value={paymentReference}
                    onChange={(e) => setPaymentReference(e.target.value)}
                    rows={2}
                  />
                </VStack>
              </VStack>
            )}
          </ModalBody>
          <ModalFooter>
            <HStack spacing={4}>
              <Button variant="outline" onClick={onModalClose}>
                Close
              </Button>
              {selectedPayment?.payment_status === 'pending' && (
                <>
                  <Button
                    colorScheme="green"
                    leftIcon={<Icon as={FaCheck} />}
                    onClick={() => handleVerifyPayment(selectedPayment.id, 'verify')}
                    isLoading={isVerifying}
                    loadingText="Verifying..."
                  >
                    Verify Payment
                  </Button>
                  <Button
                    colorScheme="red"
                    leftIcon={<Icon as={FaTimes} />}
                    onClick={() => handleVerifyPayment(selectedPayment.id, 'reject')}
                    isLoading={isVerifying}
                    loadingText="Rejecting..."
                  >
                    Reject Payment
                  </Button>
                </>
              )}
            </HStack>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </VStack>
  );
};

export default PaymentVerification;

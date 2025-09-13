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
  Badge,
  Icon,
  Flex,
  useToast,
  Spinner,
  Center,
  Divider,
  SimpleGrid,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Alert,
  AlertIcon,
  Image,
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  FaTicketAlt, 
  FaDownload, 
  FaQrcode, 
  FaUser, 
  FaEnvelope, 
  FaPhone, 
  FaCalendar, 
  FaMapMarkerAlt, 
  FaMoneyBillWave, 
  FaPlus, 
  FaEye,
  FaSignOutAlt,
  FaArrowLeft,
  FaGraduationCap
} from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';
import { supabase, Event, FresherRegistration, SeniorTicketRegistration, Registration } from '../lib/supabase';
import QRCode from 'qrcode.react';
import EventCard from '../components/EventCard';

const MotionBox = motion(Box);
const MotionCard = motion(Card);
const MotionButton = motion(Button);

// Event and Registration interfaces are now imported from supabase.ts

const UserDashboardNew: React.FC = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const { user, logout } = useAuth();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [events, setEvents] = useState<Event[]>([]);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRegistering, setIsRegistering] = useState(false);
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    checkUser();
    fetchEvents();
    fetchRegistrations();
  }, []);

  const checkUser = async () => {
    if (!user) {
      navigate('/user-login');
      return;
    }
  };

  const fetchEvents = async () => {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('event_date', { ascending: true });

      if (error) throw error;
      setEvents(data || []);
    } catch (error) {
      console.error('Error fetching events:', error);
    }
  };

  const fetchRegistrations = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // First, ensure user profile exists
      const { data: profileData, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      // If profile doesn't exist, create it
      if (profileError && profileError.code === 'PGRST116') {
        const { error: createError } = await supabase
          .from('user_profiles')
          .insert([
            {
              user_id: user.id,
              full_name: user.user_metadata?.full_name || '',
              mobile_number: user.user_metadata?.mobile_number || '',
              studying_year: user.user_metadata?.studying_year || 1
            }
          ]);

        if (createError) {
          console.error('Error creating user profile:', createError);
        }
      } else {
        setProfile(profileData);
      }

      // Fetch fresher registrations
      const { data: fresherData, error: fresherError } = await supabase
        .from('freshers_registrations')
        .select(`
          *,
          event:events(*)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (fresherError) throw fresherError;

      // Fetch senior registrations
      const { data: seniorData, error: seniorError } = await supabase
        .from('senior_ticket_registrations')
        .select(`
          *,
          event:events(*)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (seniorError) throw seniorError;

      // Combine both types of registrations
      const allRegistrations = [
        ...(fresherData || []),
        ...(seniorData || [])
      ];

      setRegistrations(allRegistrations);
    } catch (error) {
      console.error('Error fetching registrations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handler for registration button (opens modal)
  const handleRegister = (event: Event) => {
    setSelectedEvent(event);
    onOpen();
  };

  const confirmRegistration = async () => {
    if (!selectedEvent || !user) return;

    setIsRegistering(true);
    
    try {
      // Get user profile to determine registration type
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('studying_year, full_name, mobile_number')
        .eq('user_id', user.id)
        .single();

      if (profileError) {
        throw new Error('User profile not found. Please try logging in again.');
      }

      const isFresher = profile.studying_year === 1;
      const registrationType = isFresher ? 'fresher' : 'senior';
      const paymentStatus = isFresher ? 'paid' : 'pending';

      // Create registration based on user type
      let registrationData;
      
      if (isFresher) {
        // Create fresher registration (free)
        const { data, error } = await supabase
          .from('freshers_registrations')
          .insert([
            {
              event_id: selectedEvent.id,
              user_id: user.id,
              full_name: profile.full_name,
              email: user.email,
              mobile_number: profile.mobile_number,
              studying_year: profile.studying_year,
              registration_type: 'fresher',
              is_checked_in: false,
              qr_code: `SPARK2K25-${selectedEvent.id}-${user.id}-${Date.now()}`,
            },
          ])
          .select()
          .single();

        if (error) throw error;
        registrationData = data;
      } else {
        // Create senior registration (paid)
        const { data, error } = await supabase
          .from('senior_ticket_registrations')
          .insert([
            {
              event_id: selectedEvent.id,
              user_id: user.id,
              full_name: profile.full_name,
              email: user.email,
              mobile_number: profile.mobile_number,
              studying_year: profile.studying_year,
              registration_type: 'senior',
              amount_paid: 99.00,
              payment_status: 'pending',
              is_checked_in: false,
              qr_code: `SPARK2K25-${selectedEvent.id}-${user.id}-${Date.now()}`,
            },
          ])
          .select()
          .single();

        if (error) throw error;
        registrationData = data;
        
        // Redirect to payment for seniors
        localStorage.setItem('registrationData', JSON.stringify(registrationData));
        navigate('/payment');
        return;
      }

      // If fresher, show success and refresh
      toast({
        title: 'Registration successful!',
        description: 'Your ticket has been generated. Check your tickets below.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      onClose();
      fetchRegistrations();

    } catch (error: any) {
      console.error('Registration error:', error);
      toast({
        title: 'Registration failed',
        description: error.message || 'Something went wrong. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsRegistering(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const downloadTicket = (registration: Registration) => {
    // This would implement ticket download functionality
    console.log('Download ticket for:', registration.id);
  };

  if (isLoading) {
    return (
      <Center minH="100vh">
        <VStack spacing={4}>
          <Spinner size="xl" color="blue.500" />
          <Text>Loading your dashboard...</Text>
        </VStack>
      </Center>
    );
  }

  return (
    <Box minH="100vh" bg="gray.50">
      {/* Header */}
      <Box bg="white" shadow="sm" borderBottom="1px" borderColor="gray.200">
        <Container maxW="6xl" py={4}>
          <Flex justify="space-between" align="center">
            <HStack>
              <Button
                variant="ghost"
                leftIcon={<Icon as={FaArrowLeft} />}
                onClick={() => navigate('/')}
              >
                Back to Home
              </Button>
            </HStack>
            
            <HStack spacing={4}>
              <Text fontSize="sm" color="gray.600">
                Welcome, {user?.user_metadata?.full_name || user?.email}
              </Text>
              <Button
                size="sm"
                variant="outline"
                leftIcon={<Icon as={FaSignOutAlt} />}
                onClick={handleLogout}
              >
                Logout
              </Button>
            </HStack>
          </Flex>
        </Container>
      </Box>

      <Container maxW="6xl" py={8}>
        <VStack spacing={8} align="stretch">
          {/* Welcome Section */}
          <MotionBox
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <VStack spacing={4} textAlign="center">
              <Heading size="xl" color="gray.800">
                Welcome to Spark 2K25 ⚡
              </Heading>
              <Text fontSize="lg" color="gray.600" maxW="2xl">
                Browse available events and register for the parties you want to attend!
              </Text>
            </VStack>
          </MotionBox>

          {/* Available Events */}
          <MotionBox
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <VStack spacing={6} align="stretch">
              <Heading size="lg" color="gray.800">
                🎉 Available Events
              </Heading>
              
              {events.length === 0 ? (
                <Alert status="info" borderRadius="lg">
                  <AlertIcon />
                  No events are currently available. Check back later!
                </Alert>
              ) : (
                <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
                  {events.map((event, index) => (
                    <EventCard
                      key={event.id}
                      event={event}
                      userProfile={profile}
                      onRegister={handleRegister}
                      showRegisterButton={true}
                    />
                  ))}
                </SimpleGrid>
              )}
            </VStack>
          </MotionBox>

          {/* My Tickets */}
          <MotionBox
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <VStack spacing={6} align="stretch">
              <Heading size="lg" color="gray.800">
                🎫 My Tickets
              </Heading>
              
              {registrations.length === 0 ? (
                <Alert status="info" borderRadius="lg">
                  <AlertIcon />
                  You haven't registered for any events yet. Browse events above to get started!
                </Alert>
              ) : (
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                  {registrations.map((registration, index) => (
                    <MotionCard
                      key={registration.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: index * 0.1 }}
                      variant="outline"
                      bg={
                        registration.registration_type === 'fresher' 
                          ? 'green.50' 
                          : (registration as any).payment_status === 'completed' 
                            ? 'green.50' 
                            : 'yellow.50'
                      }
                      borderColor={
                        registration.registration_type === 'fresher' 
                          ? 'green.200' 
                          : (registration as any).payment_status === 'completed' 
                            ? 'green.200' 
                            : 'yellow.200'
                      }
                    >
                      <CardHeader>
                        <VStack spacing={2} align="start">
                          <Heading size="md" color="gray.800">
                            {registration.event?.name || 'Event'}
                          </Heading>
                          <HStack>
                            <Badge 
                              colorScheme={
                                registration.registration_type === 'fresher' 
                                  ? 'green' 
                                  : (registration as any).payment_status === 'completed' 
                                    ? 'green' 
                                    : 'yellow'
                              }
                              fontSize="sm"
                            >
                              {registration.registration_type === 'fresher' 
                                ? 'Confirmed' 
                                : (registration as any).payment_status === 'completed' 
                                  ? 'Confirmed' 
                                  : 'Pending Payment'
                              }
                            </Badge>
                            <Badge colorScheme="blue" fontSize="sm">
                              {registration.registration_type === 'fresher' ? 'Fresher' : 'Senior'}
                            </Badge>
                          </HStack>
                        </VStack>
                      </CardHeader>
                      
                      <CardBody pt={0}>
                        <VStack spacing={4} align="stretch">
                          <HStack spacing={2} color="gray.500" fontSize="sm">
                            <Icon as={FaUser} />
                            <Text>{registration.full_name}</Text>
                          </HStack>
                          
                          <HStack spacing={2} color="gray.500" fontSize="sm">
                            <Icon as={FaEnvelope} />
                            <Text>{registration.email}</Text>
                          </HStack>
                          
                          <HStack spacing={2} color="gray.500" fontSize="sm">
                            <Icon as={FaPhone} />
                            <Text>{registration.mobile_number}</Text>
                          </HStack>
                          
                          <HStack spacing={2} color="gray.500" fontSize="sm">
                            <Icon as={FaGraduationCap} />
                            <Text>Year {registration.studying_year}</Text>
                          </HStack>
                          
                          {(registration.registration_type === 'fresher' || (registration as any).payment_status === 'completed') && (
                            <HStack spacing={2}>
                              <Button
                                size="sm"
                                variant="outline"
                                leftIcon={<Icon as={FaQrcode} />}
                                onClick={() => {/* Show QR code */}}
                              >
                                View QR
                              </Button>
                              <Button
                                size="sm"
                                colorScheme="blue"
                                leftIcon={<Icon as={FaDownload} />}
                                onClick={() => downloadTicket(registration)}
                              >
                                Download
                              </Button>
                            </HStack>
                          )}
                          
                          {registration.registration_type === 'senior' && (registration as any).payment_status !== 'completed' && (
                            <Button
                              size="sm"
                              colorScheme="green"
                              onClick={() => {
                                localStorage.setItem('registrationData', JSON.stringify(registration));
                                navigate('/payment');
                              }}
                            >
                              Complete Payment
                            </Button>
                          )}
                        </VStack>
                      </CardBody>
                    </MotionCard>
                  ))}
                </SimpleGrid>
              )}
            </VStack>
          </MotionBox>
        </VStack>
      </Container>

      {/* Registration Confirmation Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="md">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Confirm Registration</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            {selectedEvent && (
              <VStack spacing={4} align="stretch">
                <Text>
                  Are you sure you want to register for <strong>{selectedEvent.name}</strong>?
                </Text>
                
                <Box p={4} bg="gray.50" borderRadius="md">
                  <VStack spacing={2} align="start">
                    <Text fontSize="sm" color="gray.600">
                      <strong>Date:</strong> {new Date(selectedEvent.event_date).toLocaleDateString()}
                    </Text>
                    <Text fontSize="sm" color="gray.600">
                      <strong>Venue:</strong> {selectedEvent.location}
                    </Text>
                    <Text fontSize="sm" color="gray.600">
                      <strong>Price:</strong> {profile?.studying_year === 1 ? 'FREE' : '₹99'}
                    </Text>
                  </VStack>
                </Box>
                
                <HStack spacing={4}>
                  <Button
                    flex={1}
                    onClick={onClose}
                    variant="outline"
                  >
                    Cancel
                  </Button>
                  <Button
                    flex={1}
                    colorScheme="blue"
                    onClick={confirmRegistration}
                    isLoading={isRegistering}
                    loadingText="Registering..."
                  >
                    Confirm Registration
                  </Button>
                </HStack>
              </VStack>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default UserDashboardNew;

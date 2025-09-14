import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  HStack,
  Button,
  Card,
  CardBody,
  CardHeader,
  Badge,
  Icon,
  useToast,
  Spinner,
  Alert,
  AlertIcon,
  Divider,
  Flex,
  useBreakpointValue,
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  FaCalendarAlt, 
  FaMapMarkerAlt, 
  FaClock, 
  FaDollarSign,
  FaUsers,
  FaGraduationCap,
  FaTicketAlt,
  FaArrowLeft,
  FaCheck,
  FaExclamationTriangle,
} from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';
import { supabase, Event } from '../lib/supabase';

const MotionBox = motion(Box);
const MotionCard = motion(Card);

const EventRegistrationPage: React.FC = () => {
  const navigate = useNavigate();
  const { eventId } = useParams<{ eventId: string }>();
  const { user } = useAuth();
  const toast = useToast();
  const isMobile = useBreakpointValue({ base: true, md: false });
  
  const [event, setEvent] = useState<Event | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRegistering, setIsRegistering] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAlreadyRegistered, setIsAlreadyRegistered] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/user-login');
      return;
    }
    
    if (eventId) {
      fetchEvent();
      fetchUserProfile();
      checkRegistrationStatus();
    }
  }, [eventId, user, navigate]);

  const fetchUserProfile = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) {
        console.error('Error fetching user profile:', error);
        // If profile doesn't exist, create a basic one from user metadata
        setProfile({
          full_name: user.user_metadata?.full_name || user.email?.split('@')[0],
          mobile_number: user.user_metadata?.mobile_number || '',
          studying_year: user.user_metadata?.studying_year || 1,
        });
      } else {
        setProfile(data);
      }
    } catch (error) {
      console.error('Error in fetchUserProfile:', error);
      // Fallback to user metadata
      setProfile({
        full_name: user.user_metadata?.full_name || user.email?.split('@')[0],
        mobile_number: user.user_metadata?.mobile_number || '',
        studying_year: user.user_metadata?.studying_year || 1,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchEvent = async () => {
    try {
      setError(null);

      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('id', eventId)
        .eq('is_active', true)
        .single();

      if (error) {
        throw error;
      }

      if (!data) {
        throw new Error('Event not found');
      }

      setEvent(data);
    } catch (error: any) {
      console.error('Error fetching event:', error);
      setError(error.message || 'Failed to load event');
    }
  };

  const checkRegistrationStatus = async () => {
    if (!user || !eventId) return;

    try {
      // Check fresher registrations
      const { data: fresherReg } = await supabase
        .from('freshers_registrations')
        .select('id')
        .eq('event_id', eventId)
        .eq('user_id', user.id)
        .single();

      // Check senior registrations
      const { data: seniorReg } = await supabase
        .from('senior_ticket_registrations')
        .select('id')
        .eq('event_id', eventId)
        .eq('user_id', user.id)
        .single();

      setIsAlreadyRegistered(!!(fresherReg || seniorReg));
    } catch (error) {
      // No registration found, which is fine
      setIsAlreadyRegistered(false);
    }
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

  const getCategoryColor = (category: string) => {
    const colors = {
      sports: 'blue',
      cultural: 'purple',
      technical: 'green',
      academic: 'orange',
      social: 'pink',
      general: 'gray'
    };
    return colors[category as keyof typeof colors] || 'gray';
  };

  const getCategoryIcon = (category: string) => {
    const icons = {
      sports: '⚽',
      cultural: '🎭',
      technical: '💻',
      academic: '📚',
      social: '🎉',
      general: '📅'
    };
    return icons[category as keyof typeof icons] || '📅';
  };

  const handleRegistration = async () => {
    if (!event || !user || !profile) return;

    setIsRegistering(true);

    try {
      const isFresher = profile.studying_year === 1;
      
      if (isFresher) {
        // Create fresher registration (free)
        const { data, error } = await supabase
          .from('freshers_registrations')
          .insert([
            {
              event_id: event.id,
              user_id: user.id,
              full_name: profile.full_name,
              email: user.email,
              mobile_number: profile.mobile_number,
              studying_year: profile.studying_year,
              registration_type: 'fresher',
              is_checked_in: false,
              qr_code: `MPGI-${event.id}-${user.id}-${Date.now()}`,
            },
          ])
          .select()
          .single();

        if (error) throw error;

        toast({
          title: 'Registration Successful!',
          description: 'You have been registered for this event. Your ticket is ready!',
          status: 'success',
          duration: 5000,
          isClosable: true,
        });

        // Redirect to ticket page
        navigate('/ticket', { 
          state: { 
            registration: data,
            event: event,
            isFresher: true
          }
        });
      } else {
        // Create senior registration (paid)
        const { data, error } = await supabase
          .from('senior_ticket_registrations')
          .insert([
            {
              event_id: event.id,
              user_id: user.id,
              full_name: profile.full_name,
              email: user.email,
              mobile_number: profile.mobile_number,
              studying_year: profile.studying_year,
              registration_type: 'senior',
              amount_paid: registrationPrice,
              payment_status: 'pending',
              is_checked_in: false,
              qr_code: `MPGI-${event.id}-${user.id}-${Date.now()}`,
            },
          ])
          .select()
          .single();

        if (error) throw error;

        // Store registration data for payment
        localStorage.setItem('registrationData', JSON.stringify(data));
        localStorage.setItem('eventData', JSON.stringify(event));

        toast({
          title: 'Registration Created!',
          description: 'Please proceed to payment to complete your registration.',
          status: 'info',
          duration: 5000,
          isClosable: true,
        });

        // Redirect to UPI payment page
        navigate('/upi-payment', {
          state: {
            registration: registrationData,
            event: eventData,
            amount: calculatedAmount
          }
        });
      }
    } catch (error: any) {
      console.error('Registration error:', error);
      toast({
        title: 'Registration Failed',
        description: error.message || 'Something went wrong. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsRegistering(false);
    }
  };

  if (isLoading || !event || !profile) {
    return (
      <Box minH="100vh" bg="linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)" display="flex" alignItems="center" justifyContent="center">
        <VStack spacing={4}>
          <Spinner size="xl" color="white" thickness="4px" />
          <Text color="white" fontSize="lg">Loading event details...</Text>
        </VStack>
      </Box>
    );
  }

  if (error || !event) {
    return (
      <Box minH="100vh" bg="linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)">
        <Container maxW="4xl" py={12}>
          <Alert status="error" borderRadius="xl" bg="rgba(255, 0, 0, 0.1)" border="1px solid rgba(255, 0, 0, 0.3)">
            <AlertIcon color="red.400" />
            <VStack align="start" spacing={2}>
              <Text color="white" fontWeight="bold">
                Event Not Found
              </Text>
              <Text color="rgba(255,255,255,0.8)" fontSize="sm">
                {error || 'The event you are looking for does not exist or is no longer available.'}
              </Text>
            </VStack>
          </Alert>
          <Button
            mt={6}
            leftIcon={<Icon as={FaArrowLeft} />}
            onClick={() => navigate('/events')}
            colorScheme="blue"
            variant="outline"
            color="white"
            borderColor="white"
            _hover={{ bg: 'rgba(255,255,255,0.1)' }}
          >
            Back to Events
          </Button>
        </Container>
      </Box>
    );
  }

  const isFresher = profile?.studying_year === 1;
  const isEventFree = event.event_type === 'free';
  
  // Calculate registration price based on new pricing system
  const getRegistrationPrice = () => {
    if (isEventFree) return 0;
    
    const userYear = profile?.studying_year || 1;
    
    // Check if user year is in free years
    if (event.free_for_years && event.free_for_years.includes(userYear)) {
      return 0;
    }
    
    // Check if user year is in paid years
    if (event.paid_for_years && event.paid_for_years.includes(userYear)) {
      // If year-based pricing, check for specific year price
      if (event.pricing_type === 'year_based' && event.year_specific_pricing) {
        const yearPrice = event.year_specific_pricing[userYear];
        return yearPrice || event.base_price || 99;
      } else {
        // Use base price for fixed pricing
        return event.base_price || event.price || 99;
      }
    }
    
    // Default to base price
    return event.base_price || event.price || 99;
  };
  
  const registrationPrice = getRegistrationPrice();

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
              size={isMobile ? "xl" : "2xl"}
              color="white"
              fontWeight="900"
            >
              Event Registration
            </Heading>
            <Text
              fontSize={isMobile ? "md" : "lg"}
              color="rgba(255,255,255,0.8)"
              maxW="600px"
            >
              Complete your registration for this exciting event
            </Text>
          </VStack>
        </MotionBox>

        {/* Event Details Card */}
        <MotionCard
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          bg="rgba(255,255,255,0.15)"
          backdropFilter="blur(16px)"
          borderRadius="2xl"
          border="1px solid rgba(255,255,255,0.25)"
          boxShadow="0 8px 32px 0 rgba(31, 38, 135, 0.15)"
          variant="outline"
          mb={8}
        >
          <CardHeader>
            <VStack spacing={4} align="start">
              <HStack spacing={2}>
                <Badge
                  colorScheme={getCategoryColor(event.category)}
                  variant="solid"
                  fontSize="sm"
                  px={3}
                  py={1}
                  borderRadius="full"
                >
                  {getCategoryIcon(event.category)} {event.category.toUpperCase()}
                </Badge>
                <Badge
                  colorScheme={event.event_type === 'free' ? 'green' : event.event_type === 'paid' ? 'blue' : 'purple'}
                  variant="outline"
                  fontSize="xs"
                >
                  {event.event_type.toUpperCase()}
                </Badge>
              </HStack>
              
              <Heading size="lg" color="white">
                {event.name}
              </Heading>
              
              {event.description && (
                <Text color="rgba(255,255,255,0.8)" fontSize="md">
                  {event.description}
                </Text>
              )}
            </VStack>
          </CardHeader>

          <CardBody pt={0}>
            <VStack spacing={4} align="stretch">
              <HStack spacing={6} fontSize="md" color="rgba(255,255,255,0.7)">
                <HStack spacing={2}>
                  <Icon as={FaCalendarAlt} />
                  <Text>{formatEventDate(event.event_date)}</Text>
                </HStack>
                <HStack spacing={2}>
                  <Icon as={FaClock} />
                  <Text>{formatEventTime(event.event_date)}</Text>
                </HStack>
              </HStack>

              {event.location && (
                <HStack spacing={2} fontSize="md" color="rgba(255,255,255,0.7)">
                  <Icon as={FaMapMarkerAlt} />
                  <Text>{event.location}</Text>
                </HStack>
              )}

              <HStack justify="space-between" fontSize="md">
                <HStack spacing={2} color="rgba(255,255,255,0.7)">
                  <Icon as={FaUsers} />
                  <Text>{event.current_registrations}/{event.max_capacity || '∞'} registered</Text>
                </HStack>
                
                {registrationPrice > 0 && (
                  <HStack spacing={1} color="#4ade80">
                    <Icon as={FaDollarSign} />
                    <Text fontWeight="bold">₹{registrationPrice}</Text>
                  </HStack>
                )}
              </HStack>
            </VStack>
          </CardBody>
        </MotionCard>

        {/* Registration Details Card */}
        <MotionCard
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
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
            <VStack spacing={6} align="stretch">
              {/* User Info */}
              <VStack spacing={3} align="stretch">
                <Text color="white" fontWeight="bold" fontSize="sm">
                  Your Information:
                </Text>
                <HStack justify="space-between" fontSize="sm" color="rgba(255,255,255,0.8)">
                  <Text>Name:</Text>
                  <Text fontWeight="bold">{profile?.full_name}</Text>
                </HStack>
                <HStack justify="space-between" fontSize="sm" color="rgba(255,255,255,0.8)">
                  <Text>Email:</Text>
                  <Text fontWeight="bold">{user?.email}</Text>
                </HStack>
                <HStack justify="space-between" fontSize="sm" color="rgba(255,255,255,0.8)">
                  <Text>Year:</Text>
                  <HStack spacing={2}>
                    <Text fontWeight="bold">Year {profile?.studying_year}</Text>
                    <Badge 
                      colorScheme={isFresher ? 'green' : 'blue'}
                      fontSize="xs"
                    >
                      {isFresher ? 'Fresher' : 'Senior'}
                    </Badge>
                  </HStack>
                </HStack>
              </VStack>

              <Divider borderColor="rgba(255,255,255,0.2)" />

              {/* Pricing Info */}
              <VStack spacing={3} align="stretch">
                <Text color="white" fontWeight="bold" fontSize="sm">
                  Registration Fee:
                </Text>
                <HStack justify="space-between" fontSize="lg">
                  <Text color="rgba(255,255,255,0.8)">
                    {isFresher ? 'Fresher Registration' : 'Senior Registration'}
                  </Text>
                  <Text 
                    color={registrationPrice === 0 ? '#4ade80' : '#fbbf24'} 
                    fontWeight="bold"
                    fontSize="xl"
                  >
                    {registrationPrice === 0 ? 'FREE' : `₹${registrationPrice}`}
                  </Text>
                </HStack>
                
                {isFresher && (
                  <HStack spacing={2} color="#4ade80" fontSize="sm">
                    <Icon as={FaCheck} />
                    <Text>Freshers get free entry to all events!</Text>
                  </HStack>
                )}
              </VStack>

              <Divider borderColor="rgba(255,255,255,0.2)" />

              {/* Registration Button */}
              {isAlreadyRegistered ? (
                <Alert status="info" borderRadius="lg" bg="rgba(59, 130, 246, 0.1)" border="1px solid rgba(59, 130, 246, 0.3)">
                  <AlertIcon color="blue.400" />
                  <VStack align="start" spacing={1}>
                    <Text color="white" fontWeight="bold" fontSize="sm">
                      Already Registered
                    </Text>
                    <Text color="rgba(255,255,255,0.8)" fontSize="xs">
                      You have already registered for this event. Check your tickets in the dashboard.
                    </Text>
                  </VStack>
                </Alert>
              ) : (
                <VStack spacing={4}>
                  <Button
                    size="lg"
                    bg={registrationPrice === 0 ? "#4ade80" : "#fbbf24"}
                    color="white"
                    _hover={{ 
                      bg: registrationPrice === 0 ? "#22c55e" : "#f59e0b",
                      transform: "translateY(-2px)",
                      boxShadow: "0 8px 25px rgba(0,0,0,0.15)"
                    }}
                    leftIcon={<Icon as={FaTicketAlt} />}
                    onClick={handleRegistration}
                    isLoading={isRegistering}
                    loadingText="Registering..."
                    width="full"
                    py={6}
                    fontSize="lg"
                    fontWeight="bold"
                  >
                    {registrationPrice === 0 
                      ? 'Register Free' 
                      : `Register & Pay ₹${registrationPrice}`
                    }
                  </Button>
                  
                  {registrationPrice > 0 && (
                    <Text color="rgba(255,255,255,0.7)" fontSize="xs" textAlign="center">
                      You will be redirected to payment after registration
                    </Text>
                  )}
                </VStack>
              )}

              {/* Back to Dashboard */}
              <Button
                variant="outline"
                color="white"
                borderColor="white"
                _hover={{ bg: 'rgba(255,255,255,0.1)' }}
                onClick={() => navigate('/my-tickets')}
                leftIcon={<Icon as={FaArrowLeft} />}
              >
                Back to Dashboard
              </Button>
            </VStack>
          </CardBody>
        </MotionCard>
      </Container>
    </Box>
  );
};

export default EventRegistrationPage;

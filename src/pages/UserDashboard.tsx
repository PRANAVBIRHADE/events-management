import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  HStack,
  Button,
  Icon,
  Spinner,
  Flex,
  Badge,
  useBreakpointValue,
  Alert,
  AlertIcon,
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  FaSignOutAlt, 
  FaDownload, 
  FaQrcode, 
  FaCalendarAlt, 
  FaMapMarkerAlt, 
  FaDollarSign,
  FaUser,
  FaTicketAlt,
  FaArrowLeft,
  FaPhone
} from 'react-icons/fa';
import { supabase, Registration } from '../lib/supabase';
import UserLogin from '../components/UserLogin';

const MotionBox = motion(Box);
const MotionButton = motion(Button);

const UserDashboard: React.FC = () => {
  const navigate = useNavigate();
  const isMobile = useBreakpointValue({ base: true, md: false });
  
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (isAuthenticated && user) {
      fetchUserRegistrations();
    }
  }, [isAuthenticated, user]);

  const checkAuth = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setIsAuthenticated(true);
        setUser(session.user);
      }
    } catch (error) {
      console.error('Auth check error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUserRegistrations = async () => {
    if (!user?.email) return;

    try {
      const { data, error } = await supabase
        .from('registrations')
        .select('*')
        .eq('email', user.email)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRegistrations(data || []);
    } catch (error) {
      console.error('Error fetching registrations:', error);
      setError('Failed to load your registrations');
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsAuthenticated(false);
    setUser(null);
    setRegistrations([]);
  };

  const handleViewTicket = (registration: Registration) => {
    navigate(`/ticket?registrationId=${registration.id}`);
  };

  const handleBackToHome = () => {
    navigate('/');
  };

  if (isLoading) {
    return (
      <Box minH="100vh" bg="linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)" display="flex" alignItems="center" justifyContent="center">
        <VStack spacing={4}>
          <Spinner size="xl" color="white" thickness="4px" />
          <Text color="white" fontSize="lg">Loading your dashboard...</Text>
        </VStack>
      </Box>
    );
  }

  if (!isAuthenticated) {
    return <UserLogin onLoginSuccess={() => setIsAuthenticated(true)} />;
  }

  return (
    <Box 
      minH="100vh" 
      bg="linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)"
      position="relative"
      overflow="hidden"
    >
      {/* Animated Background Elements */}
      {[...Array(8)].map((_, i) => (
        <MotionBox
          key={i}
          position="absolute"
          borderRadius="full"
          bg={`hsl(${Math.random() * 360}, 70%, 60%)`}
          opacity={0.1}
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
            width: `${Math.random() * 50 + 20}px`,
            height: `${Math.random() * 50 + 20}px`,
          }}
        />
      ))}

      <Container maxW="container.xl" py={8}>
        <VStack spacing={8}>
          {/* Header */}
          <MotionBox
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            w="100%"
          >
            <Flex justify="space-between" align="center" wrap="wrap" gap={4}>
              <HStack spacing={4}>
                <Button
                  variant="ghost"
                  color="white"
                  leftIcon={<Icon as={FaArrowLeft} />}
                  onClick={handleBackToHome}
                  _hover={{ bg: "rgba(255,255,255,0.1)" }}
                >
                  Back to Home
                </Button>
                <VStack align="start" spacing={0}>
                  <Heading size="lg" color="white" textShadow="0 0 20px rgba(255, 255, 255, 0.3)">
                    My Dashboard
                  </Heading>
                  <Text color="rgba(255,255,255,0.8)" fontSize="sm">
                    Welcome back, {user?.user_metadata?.full_name || user?.email}!
                  </Text>
                </VStack>
              </HStack>
              
              <Button
                variant="outline"
                color="white"
                borderColor="rgba(255,255,255,0.3)"
                leftIcon={<Icon as={FaSignOutAlt} />}
                onClick={handleLogout}
                _hover={{ bg: "rgba(255,255,255,0.1)" }}
              >
                Logout
              </Button>
            </Flex>
          </MotionBox>

          {/* Error Message */}
          {error && (
            <Alert status="error" borderRadius="lg" bg="rgba(255, 0, 0, 0.1)" backdropFilter="blur(10px)" maxW="600px">
              <AlertIcon color="red.300" />
              <Text color="white" fontSize="sm">{error}</Text>
            </Alert>
          )}

          {/* Registrations */}
          <MotionBox
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            w="100%"
            maxW="800px"
          >
            {registrations.length === 0 ? (
              <Box
                bg="rgba(255, 255, 255, 0.1)"
                backdropFilter="blur(20px)"
                borderRadius="3xl"
                border="1px solid rgba(255, 255, 255, 0.2)"
                p={8}
                textAlign="center"
              >
                <VStack spacing={4}>
                  <Text fontSize="4xl">🎫</Text>
                  <Heading size="lg" color="white">
                    No Registrations Yet
                  </Heading>
                  <Text color="rgba(255,255,255,0.8)" fontSize="lg">
                    You haven't registered for any events yet.
                  </Text>
                  <Button
                    colorScheme="blue"
                    onClick={() => navigate('/')}
                    leftIcon={<Icon as={FaTicketAlt} />}
                  >
                    Browse Events
                  </Button>
                </VStack>
              </Box>
            ) : (
              <VStack spacing={6} w="100%">
                <Heading size="md" color="white" textAlign="center">
                  Your Event Registrations ({registrations.length})
                </Heading>
                
                {registrations.map((registration, index) => (
                  <MotionBox
                    key={registration.id}
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    bg="rgba(255, 255, 255, 0.1)"
                    backdropFilter="blur(20px)"
                    borderRadius="2xl"
                    border="1px solid rgba(255, 255, 255, 0.2)"
                    p={6}
                    w="100%"
                    boxShadow="0 15px 35px rgba(0, 0, 0, 0.1)"
                  >
                    <VStack spacing={4} align="stretch">
                      {/* Registration Header */}
                      <Flex justify="space-between" align="center" wrap="wrap" gap={4}>
                        <VStack align="start" spacing={1}>
                          <Text fontSize="xl" fontWeight="bold" color="white">
                            {registration.full_name}
                          </Text>
                          <Text fontSize="sm" color="rgba(255,255,255,0.7)">
                            {registration.email}
                          </Text>
                        </VStack>
                        
                        <HStack gap={2}>
                          <Badge
                            colorScheme={registration.studying_year === 1 ? "green" : "purple"}
                            variant="solid"
                            px={3}
                            py={1}
                            borderRadius="full"
                          >
                            {registration.studying_year === 1 ? "Fresher" : "Senior"}
                          </Badge>
                          <Badge
                            colorScheme={
                              registration.registration_type === 'fresher' 
                                ? "green" 
                                : (registration as any).payment_status === 'completed' 
                                  ? "green" 
                                  : "yellow"
                            }
                            variant="solid"
                            px={3}
                            py={1}
                            borderRadius="full"
                          >
                            {registration.registration_type === 'fresher' 
                              ? "CONFIRMED" 
                              : (registration as any).payment_status === 'completed' 
                                ? "PAID" 
                                : "PENDING"
                            }
                          </Badge>
                          {registration.is_checked_in && (
                            <Badge colorScheme="blue" variant="solid" px={3} py={1} borderRadius="full">
                              CHECKED IN
                            </Badge>
                          )}
                        </HStack>
                      </Flex>

                      {/* Registration Details */}
                      <HStack spacing={6} wrap="wrap">
                        <HStack>
                          <Icon as={FaCalendarAlt} color="#ff0080" boxSize={4} />
                          <Text color="white" fontSize="sm">
                            {new Date(registration.created_at).toLocaleDateString()}
                          </Text>
                        </HStack>
                        <HStack>
                          <Icon as={FaPhone} color="#00ffff" boxSize={4} />
                          <Text color="white" fontSize="sm">
                            {registration.mobile_number}
                          </Text>
                        </HStack>
                        <HStack>
                          <Icon as={FaUser} color="#00ff88" boxSize={4} />
                          <Text color="white" fontSize="sm">
                            Year {registration.studying_year}
                          </Text>
                        </HStack>
                      </HStack>

                      {/* Action Buttons */}
                      <HStack justify="flex-end" spacing={3}>
                        <Button
                          size="sm"
                          colorScheme="blue"
                          variant="outline"
                          leftIcon={<Icon as={FaQrcode} />}
                          onClick={() => handleViewTicket(registration)}
                          _hover={{ bg: "rgba(0, 255, 255, 0.1)" }}
                        >
                          View Ticket
                        </Button>
                        {registration.qr_code && (
                          <Button
                            size="sm"
                            colorScheme="green"
                            variant="outline"
                            leftIcon={<Icon as={FaDownload} />}
                            onClick={() => handleViewTicket(registration)}
                            _hover={{ bg: "rgba(0, 255, 0, 0.1)" }}
                          >
                            Download
                          </Button>
                        )}
                      </HStack>
                    </VStack>
                  </MotionBox>
                ))}
              </VStack>
            )}
          </MotionBox>
        </VStack>
      </Container>
    </Box>
  );
};

export default UserDashboard;

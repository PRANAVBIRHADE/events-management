import React, { useEffect, useState } from 'react';
import {
  Box,
  Icon,
  Container,
  Heading,
  Text,
  HStack,
  VStack,
  Button,
  Flex,
  SimpleGrid,
  Badge,
  useBreakpointValue,
  Spinner,
  Alert,
  AlertIcon,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Avatar,
  Image,
} from '@chakra-ui/react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { FaCalendarAlt, FaMapMarkerAlt, FaMusic, FaStar, FaRocket, FaHeart, FaUser, FaSignOutAlt, FaTicketAlt, FaChevronDown, FaGraduationCap, FaArrowRight } from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';
import { supabase, Event } from '../lib/supabase';

const MotionBox = motion(Box);
const MotionFlex = motion(Flex);
const MotionButton = motion(Button);

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [currentEmoji, setCurrentEmoji] = useState(0);
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoadingEvents, setIsLoadingEvents] = useState(true);
  const [eventsError, setEventsError] = useState<string | null>(null);
  const partyEmojis = ['🎉', '🎊', '🎈', '🎁', '🎭', '🎪', '🎨', '🎯'];
  
  const isMobile = useBreakpointValue({ base: true, md: false });
  
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentEmoji((prev) => (prev + 1) % partyEmojis.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  // Fetch events from database
  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setIsLoadingEvents(true);
      setEventsError(null);

      const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('date', { ascending: true });

      if (error) {
        throw error;
      }

      setEvents(data || []);
    } catch (error: any) {
      console.error('Error fetching events:', error);
      setEventsError(error.message || 'Failed to load events');
    } finally {
      setIsLoadingEvents(false);
    }
  };

  // Helper function to format date
  const formatEventDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Helper function to format time
  const formatEventTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const handleUserLogin = () => {
    navigate('/user-login');
  };

  const handleUserSignup = () => {
    navigate('/user-signup');
  };

  return (
    <Box 
      minH="100vh" 
      position="relative" 
      overflow="hidden"
      bg="linear-gradient(90deg, #1a365d 0%, #2d3748 50%, #553c9a 100%)"
    >
      <Container maxW="container.xl" py={4}>
        {/* Header Navigation */}
        <MotionBox
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          mb={8}
        >
          <Flex justify="space-between" align="center" py={4}>
            {/* Logo */}
            <HStack spacing={3}>
              <Icon as={FaGraduationCap} color="#4ade80" boxSize={8} />
              <Text color="white" fontSize="xl" fontWeight="bold">
                College Event Portal
              </Text>
            </HStack>

            {/* Navigation Menu */}
            <HStack spacing={8} display={{ base: "none", md: "flex" }}>
              <Button 
                variant="ghost" 
                color="white" 
                _hover={{ bg: "#4ade80", color: "white" }}
                onClick={() => navigate('/')}
              >
                Home
              </Button>
              <Button 
                variant="ghost" 
                color="white" 
                _hover={{ bg: "rgba(255,255,255,0.1)" }}
                onClick={() => navigate('/events')}
              >
                Events
              </Button>
              <Button 
                variant="ghost" 
                color="white" 
                _hover={{ bg: "rgba(255,255,255,0.1)" }}
                onClick={() => navigate('/events?category=sports')}
              >
                Sports
              </Button>
              <Button 
                variant="ghost" 
                color="white" 
                _hover={{ bg: "rgba(255,255,255,0.1)" }}
                onClick={() => navigate('/events?category=cultural')}
              >
                Cultural
              </Button>
              <Button 
                variant="ghost" 
                color="white" 
                _hover={{ bg: "rgba(255,255,255,0.1)" }}
                onClick={() => navigate('/events?category=technical')}
              >
                Technical
              </Button>
              <Button 
                variant="ghost" 
                color="white" 
                _hover={{ bg: "rgba(255,255,255,0.1)" }}
                onClick={() => navigate('/contact')}
              >
                Contact
              </Button>
            </HStack>

            {/* Auth Buttons */}
            <HStack spacing={4}>
              {user ? (
                <Menu>
                  <MenuButton
                    as={Button}
                    variant="outline"
                    color="white"
                    borderColor="white"
                    _hover={{ bg: "rgba(255,255,255,0.1)" }}
                    rightIcon={<Icon as={FaChevronDown} />}
                  >
                    <HStack spacing={2}>
                      <Avatar size="sm" name={user.user_metadata?.full_name || user.email} />
                      <Text>{user.user_metadata?.full_name || 'User'}</Text>
                    </HStack>
                  </MenuButton>
                  <MenuList>
                    <MenuItem icon={<Icon as={FaUser} />} onClick={() => navigate('/user-profile')}>
                      My Profile
                    </MenuItem>
                    <MenuItem icon={<Icon as={FaTicketAlt} />} onClick={() => navigate('/user-dashboard')}>
                      My Tickets
                    </MenuItem>
                    <MenuItem icon={<Icon as={FaSignOutAlt} />} onClick={logout} color="red.500">
                      Sign Out
                    </MenuItem>
                  </MenuList>
                </Menu>
              ) : (
                <Button
                  bg="#4ade80"
                  color="white"
                  _hover={{ bg: "#22c55e" }}
                  onClick={handleUserSignup}
                >
                  Register
                </Button>
              )}
            </HStack>
          </Flex>
        </MotionBox>

        {/* Main Content */}
        <VStack spacing={16} align="center" minH="80vh" justify="center">
          
          {/* Hero Section */}
          <MotionBox
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, type: "spring", bounce: 0.4 }}
            textAlign="center"
            maxW="800px"
          >
            {/* Main Title */}
            <Heading
              as="h1"
              size={isMobile ? "3xl" : "5xl"}
              color="white"
              fontWeight="900"
              mb={4}
              lineHeight="1.1"
            >
              Welcome to Our College
            </Heading>
            
            <Heading
              as="h2"
              size={isMobile ? "2xl" : "4xl"}
              color="#4ade80"
              fontWeight="800"
              mb={8}
              lineHeight="1.1"
            >
              Event Portal
            </Heading>

            <Text
              fontSize={isMobile ? "lg" : "xl"}
              color="white"
              fontWeight="400"
              textAlign="center"
              maxW="600px"
              lineHeight="1.6"
              mb={8}
            >
              Register & Participate in College Events Easily. Discover sports tournaments, cultural festivals, and technical workshops happening around campus.
            </Text>

            {/* Call to Action Button */}
            <MotionButton
              size="lg"
              h="60px"
              px={8}
              bg="#4ade80"
              color="white"
              fontSize="xl"
              fontWeight="bold"
              borderRadius="md"
              rightIcon={<Icon as={FaArrowRight} />}
              onClick={user ? () => navigate('/user-dashboard') : handleUserSignup}
              whileHover={{ 
                scale: 1.05,
                bg: "#22c55e"
              }}
              whileTap={{ scale: 0.95 }}
            >
              View Events
            </MotionButton>
          </MotionBox>

          {/* Events Preview Section */}
          {events.length > 0 && (
            <MotionBox
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              w="100%"
              maxW="1000px"
            >
              <VStack spacing={8}>
                <Heading
                  size="xl"
                  color="white"
                  textAlign="center"
                >
                  Upcoming Events
                </Heading>
                
                <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6} w="100%">
                  {events.slice(0, 6).map((event, index) => (
                    <MotionBox
                      key={event.id}
                      initial={{ opacity: 0, y: 50 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: 0.7 + index * 0.1 }}
                      bg="rgba(255, 255, 255, 0.1)"
                      backdropFilter="blur(10px)"
                      borderRadius="xl"
                      p={6}
                      border="1px solid rgba(255, 255, 255, 0.2)"
                      cursor="pointer"
                      whileHover={{ 
                        scale: 1.02,
                        bg: "rgba(255, 255, 255, 0.15)"
                      }}
                    >
                      <VStack spacing={4} align="start">
                        <Text color="#4ade80" fontWeight="bold" fontSize="lg">
                          {event.name}
                        </Text>
                        
                        {event.description && (
                          <Text color="rgba(255,255,255,0.8)" fontSize="sm" noOfLines={2}>
                            {event.description}
                          </Text>
                        )}
                        
                        <HStack spacing={4} fontSize="sm" color="rgba(255,255,255,0.7)">
                          <HStack spacing={1}>
                            <Icon as={FaCalendarAlt} />
                            <Text>{formatEventDate(event.event_date)}</Text>
                          </HStack>
                          {event.location && (
                            <HStack spacing={1}>
                              <Icon as={FaMapMarkerAlt} />
                              <Text>{event.location}</Text>
                            </HStack>
                          )}
                        </HStack>
                      </VStack>
                    </MotionBox>
                  ))}
                </SimpleGrid>
              </VStack>
            </MotionBox>
          )}
        </VStack>
      </Container>
    </Box>
  );
};

export default LandingPage;
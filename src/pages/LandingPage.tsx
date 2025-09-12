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
} from '@chakra-ui/react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { FaCalendarAlt, FaMapMarkerAlt, FaMusic, FaStar, FaRocket, FaHeart, FaUser, FaSignOutAlt, FaTicketAlt, FaChevronDown } from 'react-icons/fa';
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
      bg="linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)"
    >
      {/* Animated Background Particles */}
      {[...Array(20)].map((_, i) => (
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
            width: `${Math.random() * 100 + 20}px`,
            height: `${Math.random() * 100 + 20}px`,
          }}
        />
      ))}

      {/* Glowing Orbs */}
      <MotionBox
        position="absolute"
        top="10%"
        left="10%"
        w="200px"
        h="200px"
        borderRadius="full"
        bg="radial-gradient(circle, rgba(255,0,128,0.3) 0%, transparent 70%)"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.6, 0.3],
        }}
        transition={{ duration: 4, repeat: Infinity }}
      />
      
      <MotionBox
        position="absolute"
        top="60%"
        right="5%"
        w="150px"
        h="150px"
        borderRadius="full"
        bg="radial-gradient(circle, rgba(0,255,255,0.3) 0%, transparent 70%)"
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.2, 0.5, 0.2],
        }}
        transition={{ duration: 3, repeat: Infinity, delay: 1 }}
      />

      <Container maxW="container.xl" py={8}>
        {/* Header with Login/Signup */}
        <MotionBox
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          position="absolute"
          top={8}
          right={8}
          zIndex={10}
        >
          {user ? (
            <Menu>
              <MenuButton
                as={Button}
                variant="outline"
                color="white"
                borderColor="rgba(255,255,255,0.3)"
                _hover={{ bg: "rgba(255,255,255,0.1)" }}
                _active={{ bg: "rgba(255,255,255,0.2)" }}
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
            <HStack spacing={4}>
              <Button
                variant="outline"
                color="white"
                borderColor="rgba(255,255,255,0.3)"
                onClick={handleUserLogin}
                _hover={{ bg: "rgba(255,255,255,0.1)" }}
              >
                Login
              </Button>
              <Button
                colorScheme="blue"
                bg="rgba(0, 255, 255, 0.2)"
                color="white"
                onClick={handleUserSignup}
                _hover={{ bg: "rgba(0, 255, 255, 0.3)" }}
              >
                Sign Up
              </Button>
            </HStack>
          )}
        </MotionBox>

        <VStack spacing={12} align="center" minH="100vh" justify="center">
          
          {/* Hero Section */}
          <MotionBox
            initial={{ opacity: 0, y: -100 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, type: "spring", bounce: 0.4 }}
            textAlign="center"
            position="relative"
          >
            {/* Animated Party Emoji */}
            <MotionBox
              position="absolute"
              top="-80px"
              left="50%"
              transform="translateX(-50%)"
              fontSize="6xl"
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <AnimatePresence exitBeforeEnter>
                <MotionBox
                  key={currentEmoji}
                  initial={{ scale: 0, rotateY: 90 }}
                  animate={{ scale: 1, rotateY: 0 }}
                  exit={{ scale: 0, rotateY: -90 }}
                  transition={{ duration: 0.5 }}
                >
                  {partyEmojis[currentEmoji]}
                </MotionBox>
              </AnimatePresence>
            </MotionBox>

            {/* Main Title */}
            <Heading
              as="h1"
              size={isMobile ? "2xl" : "4xl"}
              bgGradient="linear(to-r, #ff0080, #00ffff, #ff0080)"
              bgClip="text"
              fontWeight="900"
              mb={4}
              textShadow="0 0 30px rgba(255, 0, 128, 0.5)"
              lineHeight="1.1"
            >
              SPARK 2K25 ⚡
            </Heading>
            
            <MotionBox
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <Heading
                as="h2"
                size={isMobile ? "xl" : "3xl"}
                color="white"
                fontWeight="800"
                mb={6}
                textShadow="0 0 20px rgba(0, 255, 255, 0.3)"
              >
                2K25
              </Heading>
            </MotionBox>

            <MotionBox
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              <Text
                fontSize={isMobile ? "lg" : "2xl"}
                color="white"
                fontWeight="600"
                textShadow="0 2px 10px rgba(0,0,0,0.3)"
                maxW="600px"
                lineHeight="1.4"
              >
                ⚡ Ignite Your Journey ⚡
                <br />
                Where Energy Meets Excellence!
              </Text>
            </MotionBox>
          </MotionBox>

          {/* Dynamic Events Section */}
          {isLoadingEvents ? (
            <MotionBox
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              textAlign="center"
            >
              <Spinner size="xl" color="#ff0080" thickness="4px" />
              <Text color="white" mt={4} fontSize="lg">
                Loading events...
              </Text>
            </MotionBox>
          ) : eventsError ? (
            <MotionBox
              initial={{ opacity: 0, scale: 0.8, y: 50 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
              w="100%"
              maxW="700px"
            >
              <Alert status="warning" borderRadius="2xl" bg="rgba(255, 193, 7, 0.1)" backdropFilter="blur(20px)">
                <AlertIcon color="#ffc107" />
                <VStack align="start" spacing={2}>
                  <Text color="white" fontWeight="bold">
                    Unable to load events
                  </Text>
                  <Text color="rgba(255,255,255,0.8)" fontSize="sm">
                    {eventsError}
                  </Text>
                  <Text color="rgba(255,255,255,0.7)" fontSize="sm">
                    Please add events through the admin dashboard or check your connection.
                  </Text>
                </VStack>
              </Alert>
            </MotionBox>
          ) : events.length === 0 ? (
            <MotionBox
              initial={{ opacity: 0, scale: 0.8, y: 50 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
              textAlign="center"
              p={8}
            >
              <Text
                fontSize={isMobile ? "xl" : "2xl"}
                color="white"
                fontWeight="600"
                textShadow="0 2px 10px rgba(0,0,0,0.5)"
                lineHeight="1.6"
              >
                ⚡ Events will be available soon ⚡
              </Text>
            </MotionBox>
          ) : (
            <VStack spacing={6} w="100%" maxW="700px">
              {events.map((event, index) => (
                <MotionBox
                  key={event.id}
                  initial={{ opacity: 0, scale: 0.8, y: 50 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.8 + index * 0.2 }}
                  bg="rgba(255, 255, 255, 0.1)"
                  backdropFilter="blur(20px)"
                  borderRadius="3xl"
                  border="1px solid rgba(255, 255, 255, 0.2)"
                  p={8}
                  w="100%"
                  boxShadow="0 25px 50px rgba(0, 0, 0, 0.25)"
                  position="relative"
                  overflow="hidden"
                >
                  {/* Card Glow Effect */}
                  <Box
                    position="absolute"
                    top="0"
                    left="0"
                    right="0"
                    bottom="0"
                    bg="linear-gradient(45deg, rgba(255,0,128,0.1), rgba(0,255,255,0.1))"
                    borderRadius="3xl"
                    opacity={0.5}
                  />
                  
                  <VStack spacing={6} position="relative" zIndex={1}>
                    <VStack spacing={2}>
                      <Badge
                        colorScheme="pink"
                        variant="solid"
                        fontSize="lg"
                        px={4}
                        py={2}
                        borderRadius="full"
                        bg="linear-gradient(45deg, #ff0080, #ff4081)"
                      >
                        ✨ {event.name} ✨
                      </Badge>
                      
                      {event.description && (
                        <Text
                          color="rgba(255,255,255,0.9)"
                          fontSize="md"
                          textAlign="center"
                          lineHeight="1.6"
                          maxW="500px"
                        >
                          {event.description}
                        </Text>
                      )}
                    </VStack>

                    <SimpleGrid columns={1} spacing={4} w="100%">
                      <HStack
                        bg="rgba(255, 255, 255, 0.1)"
                        p={4}
                        borderRadius="xl"
                        border="1px solid rgba(255, 255, 255, 0.1)"
                      >
                        <Icon as={FaCalendarAlt} color="#ff0080" boxSize={6} />
                        <VStack align="start" spacing={0}>
                          <Text color="white" fontWeight="bold" fontSize="lg">
                            {formatEventDate(event.event_date)}
                          </Text>
                          <Text color="rgba(255,255,255,0.7)" fontSize="sm">
                            Save the date!
                          </Text>
                        </VStack>
                      </HStack>

                      <HStack
                        bg="rgba(255, 255, 255, 0.1)"
                        p={4}
                        borderRadius="xl"
                        border="1px solid rgba(255, 255, 255, 0.1)"
                      >
                        <Icon as={FaMapMarkerAlt} color="#00ffff" boxSize={6} />
                        <VStack align="start" spacing={0}>
                          <Text color="white" fontWeight="bold" fontSize="lg">
                            {event.location}
                          </Text>
                          <Text color="rgba(255,255,255,0.7)" fontSize="sm">
                            Event venue
                          </Text>
                        </VStack>
                      </HStack>

                      <HStack
                        bg="rgba(255, 255, 255, 0.1)"
                        p={4}
                        borderRadius="xl"
                        border="1px solid rgba(255, 255, 255, 0.1)"
                      >
                        <Icon as={FaMusic} color="#00ff88" boxSize={6} />
                        <VStack align="start" spacing={0}>
                          <Text color="white" fontWeight="bold" fontSize="lg">
                            {formatEventTime(event.event_date)}
                          </Text>
                          <Text color="rgba(255,255,255,0.7)" fontSize="sm">
                            Event time
                          </Text>
                        </VStack>
                      </HStack>

                      {true && (
                        <HStack
                          bg="rgba(255, 255, 255, 0.1)"
                          p={4}
                          borderRadius="xl"
                          border="1px solid rgba(255, 255, 255, 0.1)"
                        >
                          <Icon as={FaStar} color="#ffd700" boxSize={6} />
                          <VStack align="start" spacing={0}>
                            <Text color="white" fontWeight="bold" fontSize="lg">
                              ₹99 (Seniors)
                            </Text>
                            <Text color="rgba(255,255,255,0.7)" fontSize="sm">
                              Event pricing
                            </Text>
                          </VStack>
                        </HStack>
                      )}
                    </SimpleGrid>
                  </VStack>
                </MotionBox>
              ))}
            </VStack>
          )}

          {/* Call to Action */}
          <MotionBox
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.2 }}
            textAlign="center"
            w="100%"
            maxW="600px"
          >
            <VStack spacing={6}>
              <Heading
                size="lg"
                color="white"
                textShadow="0 2px 4px rgba(0,0,0,0.3)"
              >
                Ready to Join the Party? 🎉
              </Heading>
              <Text
                color="rgba(255,255,255,0.9)"
                fontSize="lg"
                textAlign="center"
                textShadow="0 1px 2px rgba(0,0,0,0.3)"
              >
                Sign up now and get ready for an unforgettable experience!
              </Text>
              <MotionButton
                size="lg"
                h="60px"
                px={12}
                bg="linear-gradient(135deg, #ff0080, #00ffff)"
                color="white"
                fontSize="xl"
                fontWeight="bold"
                borderRadius="full"
                boxShadow="0 10px 30px rgba(255, 0, 128, 0.3)"
                onClick={user ? () => navigate('/user-dashboard') : handleUserSignup}
                whileHover={{ 
                  scale: 1.05,
                  boxShadow: "0 15px 40px rgba(255, 0, 128, 0.5)"
                }}
                whileTap={{ scale: 0.95 }}
              >
                {user ? 'Go to Dashboard 🎫' : 'Get Started Now! 🚀'}
              </MotionButton>
            </VStack>
          </MotionBox>

          {/* Features Grid */}
          <MotionBox
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 1.6 }}
            w="100%"
            maxW="1000px"
          >
            <VStack spacing={8}>
              <Heading
                size="xl"
                color="white"
                textAlign="center"
                textShadow="0 0 20px rgba(255, 255, 255, 0.3)"
              >
                🌟 What Awaits You 🌟
              </Heading>
              
              <SimpleGrid columns={isMobile ? 2 : 3} spacing={6} w="100%">
                {[
                  { icon: '🎵', title: 'Live Music', desc: 'Top DJs & Bands' },
                  { icon: '💃', title: 'Dance Floor', desc: 'Show Your Moves' },
                  { icon: '🍕', title: 'Food Fest', desc: 'Unlimited Snacks' },
                  { icon: '🎁', title: 'Mega Prizes', desc: 'Win Amazing Gifts' },
                  { icon: '📸', title: 'Photo Booth', desc: 'Capture Memories' },
                  { icon: '🎮', title: 'Fun Games', desc: 'Interactive Fun' },
                ].map((feature, index) => (
                  <MotionBox
                    key={index}
                    initial={{ opacity: 0, y: 50, scale: 0.8 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.6, delay: 1.8 + index * 0.1 }}
                    bg="rgba(255, 255, 255, 0.1)"
                    backdropFilter="blur(15px)"
                    borderRadius="2xl"
                    p={6}
                    textAlign="center"
                    border="1px solid rgba(255, 255, 255, 0.2)"
                    cursor="pointer"
                    whileHover={{ 
                      scale: 1.05,
                      bg: "rgba(255, 255, 255, 0.15)"
                    }}
                  >
                    <Text fontSize="3xl" mb={3}>
                      {feature.icon}
                    </Text>
                    <Text 
                      color="white" 
                      fontWeight="bold" 
                      fontSize="lg"
                      mb={1}
                    >
                      {feature.title}
                    </Text>
                    <Text 
                      color="rgba(255,255,255,0.7)" 
                      fontSize="sm"
                    >
                      {feature.desc}
                    </Text>
                  </MotionBox>
                ))}
              </SimpleGrid>
            </VStack>
          </MotionBox>

          {/* Call to Action */}
          <MotionBox
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 2.4 }}
            textAlign="center"
            p={6}
          >
            <Text
              fontSize={isMobile ? "lg" : "xl"}
              color="white"
              fontWeight="600"
              textShadow="0 2px 10px rgba(0,0,0,0.5)"
              lineHeight="1.6"
            >
              ⚡ Don't Miss Out! Limited Seats Available ⚡
              <br />
              Register Now and Be Part of the Most Electrifying Event Ever!
            </Text>
          </MotionBox>
        </VStack>
      </Container>
    </Box>
  );
};

export default LandingPage;
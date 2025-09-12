import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Heading,
  Text,
  HStack,
  Button,
  Icon,
  Flex,
} from '@chakra-ui/react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { FaHome, FaMusic, FaGift, FaRocket, FaStar, FaHeart } from 'react-icons/fa';
import { Registration } from '../lib/supabase';

const MotionBox = motion(Box);
const MotionButton = motion(Button);

const FresherHypePage: React.FC = () => {
  const navigate = useNavigate();
  const [registrationData, setRegistrationData] = useState<Registration | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    // Get registration data from localStorage
    const storedData = localStorage.getItem('registrationData');
    if (storedData) {
      setRegistrationData(JSON.parse(storedData));
      // Trigger confetti animation
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3000);
    } else {
      // Redirect to registration if no data
      navigate('/register?type=fresher');
    }
  }, [navigate]);

  const handleViewTicket = () => {
    navigate('/ticket');
  };

  const handleBackToHome = () => {
    navigate('/');
  };

  if (!registrationData) {
    return (
      <Box minH="100vh" bg="linear-gradient(135deg, #ff0080, #00ffff)" display="flex" alignItems="center" justifyContent="center">
        <Text color="white" fontSize="xl">Loading...</Text>
      </Box>
    );
  }

  return (
    <Box minH="100vh" bg="linear-gradient(135deg, #ff0080, #00ffff)" position="relative" overflow="hidden">
      {/* Confetti Animation */}
      <AnimatePresence>
        {showConfetti && (
          <Box position="absolute" top={0} left={0} w="100%" h="100%" pointerEvents="none" zIndex={5}>
            {[...Array(50)].map((_, i) => (
              <MotionBox
                key={i}
                position="absolute"
                top="10%"
                left={`${Math.random() * 100}%`}
                w="10px"
                h="10px"
                bg={['#ff0080', '#00ffff', '#ffff00', '#ff00ff', '#00ff00'][Math.floor(Math.random() * 5)]}
                borderRadius="50%"
                initial={{ opacity: 1, y: -100, rotate: 0 }}
                animate={{ 
                  opacity: 0, 
                  y: window.innerHeight + 100, 
                  rotate: 360,
                  x: (Math.random() - 0.5) * 200
                }}
                transition={{ 
                  duration: 3, 
                  delay: Math.random() * 2,
                  ease: "easeOut"
                }}
              />
            ))}
          </Box>
        )}
      </AnimatePresence>

      {/* Animated background elements */}
      <MotionBox
        position="absolute"
        top="5%"
        left="5%"
        w="120px"
        h="120px"
        bg="rgba(255,255,255,0.1)"
        borderRadius="50%"
        animate={{
          y: [0, -30, 0],
          rotate: [0, 180, 360],
          scale: [1, 1.2, 1],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      <MotionBox
        position="absolute"
        top="15%"
        right="10%"
        w="80px"
        h="80px"
        bg="rgba(255,255,255,0.1)"
        borderRadius="50%"
        animate={{
          y: [0, 25, 0],
          rotate: [360, 180, 0],
          scale: [1, 0.8, 1],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      <MotionBox
        position="absolute"
        bottom="25%"
        left="15%"
        w="60px"
        h="60px"
        bg="rgba(255,255,255,0.1)"
        borderRadius="50%"
        animate={{
          y: [0, -20, 0],
          x: [0, 15, 0],
          scale: [1, 1.3, 1],
        }}
        transition={{
          duration: 2.5,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />

      <Container maxW="container.xl" py={20} position="relative" zIndex={10}>
        <Flex direction="column" align="center" gap={12}>
          {/* Main Welcome Message */}
          <MotionBox
            initial={{ opacity: 0, y: -50, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            textAlign="center"
          >
            <Heading
              as="h1"
              size="4xl"
              color="white"
              fontWeight="bold"
              mb={4}
              textShadow="0 0 30px rgba(255,255,255,0.5)"
            >
              🎉 Welcome to the Family! 🎉
            </Heading>
            <Text
              fontSize="2xl"
              color="white"
              fontWeight="medium"
              textShadow="0 2px 4px rgba(0,0,0,0.3)"
              mb={2}
            >
              Hey {registrationData.full_name}! 👋
            </Text>
            <Text
              fontSize="xl"
              color="white"
              textShadow="0 2px 4px rgba(0,0,0,0.3)"
            >
              You're officially part of the Fresher's Party 2K25! 🚀
            </Text>
          </MotionBox>

          {/* Registration Confirmation Card */}
          <MotionBox
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            bg="rgba(255,255,255,0.95)"
            p={8}
            borderRadius="xl"
            boxShadow="0 20px 40px rgba(0,0,0,0.2)"
            w="100%"
            maxW="600px"
            backdropFilter="blur(10px)"
          >
            <Flex direction="column" gap={6}>
              <Heading size="xl" color="gray.700" textAlign="center">
                🎊 Registration Confirmed! 🎊
              </Heading>
              
              <Text fontSize="lg" color="gray.600" textAlign="center">
                Congratulations! You're all set for the most epic welcome party of the year!
              </Text>

              {/* Party Details */}
              <Box w="full" p={4} bg="gray.50" borderRadius="lg">
                <Flex direction="column" gap={3}>
                  <HStack align="center" gap={3}>
                    <Icon as={FaMusic} color="pink.400" boxSize={5} />
                    <Text fontWeight="bold" color="gray.700">Saturday, 15th March 2025</Text>
                  </HStack>
                  
                  <HStack align="center" gap={3}>
                    <Icon as={FaGift} color="blue.400" boxSize={5} />
                    <Text fontWeight="bold" color="gray.700">University Auditorium</Text>
                  </HStack>
                  
                  <HStack align="center" gap={3}>
                    <Icon as={FaRocket} color="green.400" boxSize={5} />
                    <Text fontWeight="bold" color="gray.700">7:00 PM - 11:00 PM</Text>
                  </HStack>
                </Flex>
              </Box>

              {/* Special Fresher Benefits */}
              <Box w="full" p={4} bg="linear-gradient(135deg, #ff0080, #00ffff)" borderRadius="lg">     
                <Flex direction="column" gap={3}>
                  <Text fontWeight="bold" color="white" fontSize="lg">
                    🎁 Special Fresher Benefits:
                  </Text>
                  <Flex direction="column" gap={2} align="start" w="full">
                    <HStack gap={2}>
                      <Icon as={FaStar} color="white" boxSize={4} />
                      <Text color="white" fontSize="sm">Free entry (no payment required!)</Text>        
                    </HStack>
                    <HStack gap={2}>
                      <Icon as={FaGift} color="white" boxSize={4} />
                      <Text color="white" fontSize="sm">Exclusive fresher welcome kit</Text>
                    </HStack>
                    <HStack gap={2}>
                      <Icon as={FaHeart} color="white" boxSize={4} />
                      <Text color="white" fontSize="sm">Priority seating and special activities</Text>  
                    </HStack>
                    <HStack gap={2}>
                      <Icon as={FaRocket} color="white" boxSize={4} />
                      <Text color="white" fontSize="sm">Meet your batchmates and seniors</Text>
                    </HStack>
                  </Flex>
                </Flex>
              </Box>
            </Flex>
          </MotionBox>

          {/* What's Waiting Section */}
          <MotionBox
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            w="100%"
            maxW="800px"
          >
            <Flex direction="column" align="center" gap={6}>
              <Heading size="lg" color="white" textAlign="center" textShadow="0 2px 4px rgba(0,0,0,0.3)">                                                                                                                 
                What's Waiting for You? 🎉
              </Heading>

              <HStack wrap="wrap" justify="center" gap={6}>
                {[
                  { icon: '🎵', text: 'Live Music', color: 'pink.400' },
                  { icon: '💃', text: 'Dance Battle', color: 'blue.400' },
                  { icon: '🍕', text: 'Free Food', color: 'green.400' },
                  { icon: '🎁', text: 'Surprise Gifts', color: 'purple.400' },
                  { icon: '📸', text: 'Photo Booth', color: 'orange.400' },
                  { icon: '🎮', text: 'Fun Games', color: 'teal.400' },
                  { icon: '🏆', text: 'Contests', color: 'yellow.400' },
                  { icon: '🎊', text: 'Party Favors', color: 'red.400' },
                ].map((activity, index) => (
                  <MotionBox
                    key={index}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.8 + index * 0.1 }}
                    textAlign="center"
                    p={4}
                    bg="rgba(255,255,255,0.1)"
                    borderRadius="lg"
                    backdropFilter="blur(10px)"
                    border="1px solid rgba(255,255,255,0.2)"
                    _hover={{
                      transform: "scale(1.05)",
                      bg: "rgba(255,255,255,0.2)",
                    }}
                  >
                    <Text fontSize="2xl" mb={2}>
                      {activity.icon}
                    </Text>
                    <Text color="white" fontWeight="medium" fontSize="sm">
                      {activity.text}
                    </Text>
                  </MotionBox>
                ))}
              </HStack>
            </Flex>
          </MotionBox>

          {/* Action Buttons */}
          <MotionBox
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 2.5 }}
          >
            <Flex direction="column" gap={4}>
              <HStack gap={4}>
                <Button
                  variant="solid"
                  size="lg"
                  h="60px"
                  px={8}
                  fontSize="xl"
                  fontWeight="bold"
                  onClick={handleViewTicket}
                  bg="linear-gradient(135deg, #ff0080, #00ffff)"
                  color="white"
                  _hover={{
                    bg: "linear-gradient(135deg, #00ffff, #ff0080)",
                    transform: "scale(1.05)",
                  }}
                  _active={{
                    transform: "scale(0.95)",
                  }}
                  transition="all 0.3s ease"
                >
                  <Icon as={FaGift} mr={3} />
                  View My Ticket
                </Button>

                <Button
                  variant="outline"
                  size="lg"
                  h="60px"
                  px={8}
                  fontSize="xl"
                  fontWeight="bold"
                  onClick={handleBackToHome}
                  borderColor="white"
                  color="white"
                  _hover={{
                    bg: "white",
                    color: "pink.500",
                    transform: "scale(1.05)",
                  }}
                  _active={{
                    transform: "scale(0.95)",
                  }}
                  transition="all 0.3s ease"
                >
                  <Icon as={FaHome} mr={3} />
                  Back to Home
                </Button>
              </HStack>
            </Flex>
          </MotionBox>
        </Flex>
      </Container>
    </Box>
  );
};

export default FresherHypePage;
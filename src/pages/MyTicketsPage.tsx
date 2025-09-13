import React, { useEffect, useState } from 'react';
import {
  Box,
  Container,
  VStack,
  HStack,
  Heading,
  Text,
  Button,
  Icon,
  Flex,
  useToast,
  Spinner,
  Center,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Avatar,
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  FaGraduationCap,
  FaChevronDown,
  FaUser,
  FaTicketAlt,
  FaSignOutAlt,
} from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import MyTickets from '../components/MyTickets';

const MotionBox = motion(Box);

const MyTicketsPage: React.FC = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const { user, logout } = useAuth();
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/user-login');
      return;
    }
    fetchRegistrations();
  }, [user, navigate]);

  // Fetch user registrations (tickets)
  const fetchRegistrations = async () => {
    if (!user) return;
    try {
      // Fetch fresher registrations
      const { data: fresherData, error: fresherError } = await supabase
        .from('freshers_registrations')
        .select(`*, event:events(*)`)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      if (fresherError) throw fresherError;
      // Fetch senior registrations
      const { data: seniorData, error: seniorError } = await supabase
        .from('senior_ticket_registrations')
        .select(`*, event:events(*)`)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      if (seniorError) throw seniorError;
      // Combine both types
      setRegistrations([...(fresherData || []), ...(seniorData || [])]);
    } catch (error) {
      console.error('Error fetching registrations:', error);
      toast({
        title: 'Error loading tickets',
        description: 'Failed to load your tickets.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Download ticket handler (placeholder)
  const downloadTicket = (registration: any) => {
    // Implement ticket download logic here
    console.log('Download ticket for:', registration.id);
  };

  // Navbar user menu
  const UserMenu = () => (
    <Menu>
      <MenuButton as={Button} variant="outline" color="white" borderColor="white" _hover={{ bg: 'rgba(255,255,255,0.1)' }} rightIcon={<Icon as={FaChevronDown} />}>
        <HStack spacing={2}>
          <Avatar size="sm" name={user?.user_metadata?.full_name || user?.email} />
          <Text>{user?.user_metadata?.full_name || 'User'}</Text>
        </HStack>
      </MenuButton>
      <MenuList>
        <MenuItem icon={<Icon as={FaUser} />} onClick={() => navigate('/user-profile')}>My Profile</MenuItem>
        <MenuItem icon={<Icon as={FaTicketAlt} />} onClick={() => navigate('/my-tickets')}>My Tickets</MenuItem>
        <MenuItem icon={<Icon as={FaSignOutAlt} />} onClick={logout} color="red.500">Sign Out</MenuItem>
      </MenuList>
    </Menu>
  );

  if (isLoading) {
    return (
      <Center minH="100vh">
        <VStack spacing={4}>
          <Spinner size="xl" color="blue.500" />
          <Text>Loading your tickets...</Text>
        </VStack>
      </Center>
    );
  }

  return (
    <Box minH="100vh" bg="linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)" position="relative" overflow="hidden">
      {/* Animated Background Elements */}
      {[...Array(10)].map((_, i) => (
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
            ease: 'linear',
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
      {/* Header Navigation */}
      <Box bg="rgba(255,255,255,0.05)" backdropFilter="blur(10px)" borderBottom="1px solid rgba(255,255,255,0.2)" zIndex={2}>
        <Container maxW="6xl" py={4}>
          <Flex justify="space-between" align="center">
            {/* Logo */}
            <HStack spacing={3}>
              <Icon as={FaGraduationCap} color="#4ade80" boxSize={8} />
              <Text color="white" fontSize="xl" fontWeight="bold">MPGI SOE</Text>
            </HStack>
            {/* Navigation Menu */}
            <HStack spacing={8} display={{ base: 'none', md: 'flex' }}>
              <Button variant="ghost" color="white" _hover={{ bg: '#4ade80', color: 'white' }} onClick={() => navigate('/')}>Home</Button>
              <Button variant="ghost" color="white" _hover={{ bg: 'rgba(255,255,255,0.1)' }} onClick={() => navigate('/events')}>Events</Button>
              <Button variant="ghost" color="white" _hover={{ bg: 'rgba(255,255,255,0.1)' }} onClick={() => navigate('/contact')}>Contact</Button>
            </HStack>
            {/* User Menu */}
            <HStack spacing={4}>
              <UserMenu />
            </HStack>
          </Flex>
        </Container>
      </Box>
      {/* My Tickets Content */}
      <Container maxW="4xl" py={12} position="relative" zIndex={2}>
        <VStack spacing={10} align="stretch">
          <MyTickets
            registrations={registrations}
            downloadTicket={downloadTicket}
            navigate={navigate}
          />
        </VStack>
      </Container>
    </Box>
  );
};

export default MyTicketsPage;

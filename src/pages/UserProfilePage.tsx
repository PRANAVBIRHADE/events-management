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
  Alert,
  AlertIcon,
  Input,
  FormControl,
  FormLabel,
  FormErrorMessage,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  ModalFooter,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Avatar,
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  FaUser,
  FaEnvelope,
  FaPhone,
  FaGraduationCap,
  FaCalendar,
  FaEdit,
  FaSave,
  FaTimes,
  FaSignOutAlt,
  FaTicketAlt,
  FaChevronDown,
  FaHome,
  FaCalendarAlt,
  FaArrowLeft,
} from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import MyTickets from '../components/MyTickets';
import { fetchWithCache, revalidateOnFocus } from '../lib/cache';

const MotionBox = motion(Box);
const MotionCard = motion(Card);
const MotionButton = motion(Button);

interface UserProfile {
  id: string;
  user_id: string;
  full_name: string;
  mobile_number: string;
  studying_year: number;
  created_at: string;
  updated_at: string;
}

const UserProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const { user, logout } = useAuth();
  const { isOpen, onOpen, onClose } = useDisclosure();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editData, setEditData] = useState({
    full_name: '',
    mobile_number: '',
    studying_year: 1,
  });
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/user-login');
      return;
    }
    fetchProfile();
    fetchRegistrations();
    checkIsAdmin();
    const detach = revalidateOnFocus(() => {
      fetchProfile();
      fetchRegistrations();
    });
    return detach;
  }, [user, navigate]);

  const fetchProfile = async () => {
    if (!user) return;
    try {
      console.log('Fetching profile for user:', user.id);
      console.log('Making Supabase request for profile...');
      
      const getWithTimeout = Promise.race([
        supabase
          .from('user_profiles')
          .select('*')
          .eq('user_id', user.id)
          .single(),
        new Promise<any>((_, reject) => setTimeout(() => reject(new Error('profile fetch timeout')), 7000))
      ]);
      const { data, error } = await getWithTimeout;
      
      console.log('Profile fetch result:', { 
        hasData: !!data, 
        data: data,
        hasError: !!error,
        error: error 
      });
      
      if (error) {
        console.log('Profile fetch error details:', {
          message: error.message,
          code: (error as any)?.code
        });
        
        if (error.code === 'PGRST116') {
          console.log('No profile found, creating new profile...');
          await createProfile();
        } else {
          throw error;
        }
      } else {
        console.log('Profile loaded successfully:', data);
        setProfile(data);
        setEditData({
          full_name: data.full_name,
          mobile_number: data.mobile_number,
          studying_year: data.studying_year,
        });
      }
    } catch (error) {
      console.error('Error fetching profile - full error:', error);
      console.error('Error type:', typeof error);
      if (error instanceof Error) {
        console.error('Error message:', error.message);
      } else if (typeof error === 'object' && error !== null && 'message' in (error as any)) {
        console.error('Error message:', (error as any).message);
      } else {
        console.error('Error message:', String(error));
      }

      const description = 'Failed to load your profile information: ' + (
        error instanceof Error
          ? error.message
          : (typeof error === 'object' && error !== null && 'message' in (error as any))
            ? String((error as any).message)
            : 'Unknown error'
      );

      toast({
        title: 'Error loading profile',
        description,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      console.log('Setting profile loading to false');
      setIsLoading(false);
    }
  };

  const checkIsAdmin = async () => {
    if (!user?.email) return;
    try {
      const { data, error } = await supabase
        .from('admin_users')
        .select('id')
        .eq('email', user.email)
        .eq('role', 'admin')
        .maybeSingle();
      if (error) return;
      setIsAdmin(!!data);
    } catch (_e) {
      // ignore
    }
  };

  const createProfile = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .insert([
          {
            user_id: user.id,
            full_name: user.user_metadata?.full_name || '',
            mobile_number: user.user_metadata?.mobile_number || '',
            studying_year: user.user_metadata?.studying_year || 1,
          },
        ])
        .select()
        .single();
      if (error) throw error;
      setProfile(data);
      setEditData({
        full_name: data.full_name,
        mobile_number: data.mobile_number,
        studying_year: data.studying_year,
      });
    } catch (error) {
      console.error('Error creating profile:', error);
    }
  };

  const handleEdit = () => setIsEditing(true);
  const handleCancel = () => {
    setIsEditing(false);
    setEditData({
      full_name: profile?.full_name || '',
      mobile_number: profile?.mobile_number || '',
      studying_year: profile?.studying_year || 1,
    });
  };

  const handleSave = async () => {
    if (!user || !profile) return;
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({
          full_name: editData.full_name,
          mobile_number: editData.mobile_number,
          studying_year: editData.studying_year,
        })
        .eq('user_id', user.id);
      if (error) throw error;
      setProfile({
        ...profile,
        full_name: editData.full_name,
        mobile_number: editData.mobile_number,
        studying_year: editData.studying_year,
      });
      setIsEditing(false);
      toast({
        title: 'Profile updated successfully!',
        description: 'Your profile information has been saved.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast({
        title: 'Update failed',
        description: error.message || 'Failed to update your profile.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = async () => onOpen();
  const confirmLogout = async () => {
    await logout();
    navigate('/');
    onClose();
  };

  // Fetch user registrations (tickets)
  const fetchRegistrations = async () => {
    if (!user) return;
    try {
      // Fetch fresher registrations (cached)
      const fresherData = await fetchWithCache<any[]>(
        `freshers_${user.id}`,
        60000,
        async () => {
          const { data, error } = await supabase
            .from('freshers_registrations')
            .select('id,user_id,event_id,registration_type,full_name,mobile_number,email,studying_year,qr_code,ticket_number,is_checked_in,created_at, event:events(id,name,event_date)')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });
          if (error) throw error;
          return data || [];
        }
      );

      // Fetch senior registrations (cached)
      const seniorData = await fetchWithCache<any[]>(
        `seniors_${user.id}`,
        60000,
        async () => {
          const { data, error } = await supabase
            .from('senior_ticket_registrations')
            .select('id,user_id,event_id,registration_type,full_name,mobile_number,email,studying_year,amount_paid,payment_status,qr_code,ticket_number,is_checked_in,created_at, event:events(id,name,event_date)')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });
          if (error) throw error;
          return data || [];
        }
      );

      // Combine both types
      setRegistrations([...(fresherData || []), ...(seniorData || [])]);
    } catch (error) {
      console.error('Error fetching registrations:', error);
    }
  };

  // Download ticket handler (placeholder)
  const downloadTicket = (registration: any) => {
    // Implement ticket download logic here
    console.log('Download ticket for:', registration.id);
  };

  if (isLoading) {
    return (
      <Center minH="100vh">
        <VStack spacing={4}>
          <Spinner size="xl" color="blue.500" />
          <Text>Loading your profile...</Text>
        </VStack>
      </Center>
    );
  }
  if (!profile) {
    return (
      <Center minH="100vh">
        <Alert status="error" maxW="md">
          <AlertIcon />
          Failed to load your profile. Please try again.
        </Alert>
      </Center>
    );
  }

  // Navbar user menu
  const UserMenu = () => (
    <Menu>
      <MenuButton as={Button} variant="outline" color="white" borderColor="white" _hover={{ bg: 'rgba(255,255,255,0.1)' }} rightIcon={<Icon as={FaChevronDown} />}>
        <HStack spacing={2}>
          <Avatar size="sm" name={profile.full_name} />
          <Text>{profile.full_name}</Text>
        </HStack>
      </MenuButton>
      <MenuList>
        <MenuItem icon={<Icon as={FaUser} />} onClick={() => navigate('/user-profile')}>My Profile</MenuItem>
        <MenuItem icon={<Icon as={FaTicketAlt} />} onClick={() => navigate('/my-tickets')}>My Tickets</MenuItem>
        <MenuItem icon={<Icon as={FaSignOutAlt} />} onClick={handleLogout} color="red.500">Sign Out</MenuItem>
      </MenuList>
    </Menu>
  );

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
      {/* Profile Content */}
      <Container maxW="4xl" py={12} position="relative" zIndex={2}>
        <VStack spacing={10} align="stretch">
          {/* Profile Header */}
          <MotionBox initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <VStack spacing={4} textAlign="center">
              <Heading size="xl" color="white" textShadow="0 2px 8px rgba(0,0,0,0.15)">My Profile</Heading>
              <Text fontSize="lg" color="rgba(255,255,255,0.85)">Manage your account information and preferences</Text>
            </VStack>
          </MotionBox>
          {/* Profile Information */}
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
          >
            <CardHeader>
              <Flex justify="space-between" align="center">
                <Heading size="md" color="white">Account Information</Heading>
                {!isEditing && (
                  <Button size="sm" leftIcon={<Icon as={FaEdit} />} onClick={handleEdit} colorScheme="blue" variant="outline" borderColor="white" color="white" _hover={{ bg: 'rgba(255,255,255,0.1)' }}>Edit Profile</Button>
                )}
              </Flex>
            </CardHeader>
            <CardBody>
              <VStack spacing={6} align="stretch">
                {/* Email (Read-only) */}
                <FormControl>
                  <FormLabel fontSize="sm" fontWeight="bold" color="white"><Icon as={FaEnvelope} mr={2} />Email Address</FormLabel>
                  <Input value={user?.email || ''} isReadOnly bg="rgba(255,255,255,0.08)" borderColor="rgba(255,255,255,0.2)" color="white" />
                  <Text fontSize="xs" color="rgba(255,255,255,0.7)" mt={1}>Email cannot be changed</Text>
                </FormControl>
                {/* Full Name */}
                <FormControl>
                  <FormLabel fontSize="sm" fontWeight="bold" color="white"><Icon as={FaUser} mr={2} />Full Name</FormLabel>
                  {isEditing ? (
                    <Input value={editData.full_name} onChange={(e) => setEditData(prev => ({ ...prev, full_name: e.target.value }))} placeholder="Enter your full name" bg="rgba(255,255,255,0.08)" borderColor="rgba(255,255,255,0.2)" color="white" />
                  ) : (
                    <Text fontSize="md" color="white" py={2}>{profile.full_name}</Text>
                  )}
                </FormControl>
                {/* Mobile Number */}
                <FormControl>
                  <FormLabel fontSize="sm" fontWeight="bold" color="white"><Icon as={FaPhone} mr={2} />Mobile Number</FormLabel>
                  {isEditing ? (
                    <Input value={editData.mobile_number} onChange={(e) => setEditData(prev => ({ ...prev, mobile_number: e.target.value }))} placeholder="Enter your mobile number" bg="rgba(255,255,255,0.08)" borderColor="rgba(255,255,255,0.2)" color="white" />
                  ) : (
                    <Text fontSize="md" color="white" py={2}>{profile.mobile_number}</Text>
                  )}
                </FormControl>
                {/* Studying Year */}
                <FormControl>
                  <FormLabel fontSize="sm" fontWeight="bold" color="white"><Icon as={FaGraduationCap} mr={2} />Studying Year</FormLabel>
                  {isEditing ? (
                    <Input as="select" value={editData.studying_year} onChange={(e) => setEditData(prev => ({ ...prev, studying_year: parseInt(e.target.value) }))} bg="rgba(255,255,255,0.08)" borderColor="rgba(255,255,255,0.2)" color="white">
                      <option value={1}>1st Year (Fresher)</option>
                      <option value={2}>2nd Year (Senior)</option>
                      <option value={3}>3rd Year (Senior)</option>
                      <option value={4}>4th Year (Senior)</option>
                    </Input>
                  ) : (
                    <HStack>
                      <Text fontSize="md" color="white" py={2}>Year {profile.studying_year}</Text>
                      <Badge colorScheme={profile.studying_year === 1 ? 'green' : 'blue'} fontSize="sm">{profile.studying_year === 1 ? 'Fresher' : 'Senior'}</Badge>
                    </HStack>
                  )}
                </FormControl>
                {/* Account Created */}
                <FormControl>
                  <FormLabel fontSize="sm" fontWeight="bold" color="white"><Icon as={FaCalendar} mr={2} />Account Created</FormLabel>
                  <Text fontSize="md" color="white" py={2}>{new Date(profile.created_at).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</Text>
                </FormControl>
                {/* Edit Actions */}
                {isEditing && (
                  <HStack spacing={4} pt={4}>
                    <Button colorScheme="green" leftIcon={<Icon as={FaSave} />} onClick={handleSave} isLoading={isSaving} loadingText="Saving...">Save Changes</Button>
                    <Button variant="outline" leftIcon={<Icon as={FaTimes} />} onClick={handleCancel} isDisabled={isSaving} color="white" borderColor="white" _hover={{ bg: 'rgba(255,255,255,0.1)' }}>Cancel</Button>
                  </HStack>
                )}
              </VStack>
            </CardBody>
          </MotionCard>
          {/* Quick Actions */}
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
              <Heading size="md" color="white">Quick Actions</Heading>
            </CardHeader>
            <CardBody>
              <VStack spacing={4} align="stretch">
                <Button leftIcon={<Icon as={FaTicketAlt} />} onClick={() => navigate('/my-tickets')} colorScheme="blue" variant="solid" bg="#4ade80" color="white" _hover={{ bg: '#22c55e' }}>View My Tickets</Button>
                {isAdmin && (
                  <Button onClick={() => navigate('/admin')} colorScheme="purple" variant="outline" color="white" borderColor="white" _hover={{ bg: 'rgba(255,255,255,0.1)' }}>Go to Admin Dashboard</Button>
                )}
                <Button leftIcon={<Icon as={FaSignOutAlt} />} onClick={handleLogout} colorScheme="red" variant="outline" color="white" borderColor="white" _hover={{ bg: 'rgba(255,255,255,0.1)' }}>Sign Out</Button>
              </VStack>
            </CardBody>
          </MotionCard>
          {/* My Tickets Section */}
          <MotionBox initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.6 }}>
            <MyTickets
              registrations={registrations}
              downloadTicket={downloadTicket}
              navigate={navigate}
            />
          </MotionBox>
        </VStack>
      </Container>
      {/* Logout Confirmation Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="md">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Confirm Logout</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text>Are you sure you want to sign out? You'll need to log in again to access your account.</Text>
          </ModalBody>
          <ModalFooter>
            <Button variant="outline" mr={3} onClick={onClose}>Cancel</Button>
            <Button colorScheme="red" onClick={confirmLogout}>Sign Out</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default UserProfilePage;

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
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  FaUser, 
  FaEnvelope, 
  FaPhone, 
  FaGraduationCap, 
  FaCalendar,
  FaArrowLeft,
  FaEdit,
  FaSave,
  FaTimes,
  FaSignOutAlt,
  FaTicketAlt
} from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

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

  useEffect(() => {
    if (!user) {
      navigate('/user-login');
      return;
    }
    fetchProfile();
  }, [user, navigate]);

  const fetchProfile = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // Profile doesn't exist, create it
          await createProfile();
        } else {
          throw error;
        }
      } else {
        setProfile(data);
        setEditData({
          full_name: data.full_name,
          mobile_number: data.mobile_number,
          studying_year: data.studying_year,
        });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast({
        title: 'Error loading profile',
        description: 'Failed to load your profile information.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
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

  const handleEdit = () => {
    setIsEditing(true);
  };

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

      // Update local state
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

  const handleLogout = async () => {
    onOpen();
  };

  const confirmLogout = async () => {
    await logout();
    navigate('/');
    onClose();
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

  return (
    <Box minH="100vh" bg="gray.50">
      {/* Header */}
      <Box bg="white" shadow="sm" borderBottom="1px" borderColor="gray.200">
        <Container maxW="4xl" py={4}>
          <Flex justify="space-between" align="center">
            <HStack>
              <Button
                variant="ghost"
                leftIcon={<Icon as={FaArrowLeft} />}
                onClick={() => navigate('/user-dashboard')}
              >
                Back to Dashboard
              </Button>
            </HStack>
            
            <HStack spacing={4}>
              <Button
                size="sm"
                variant="outline"
                leftIcon={<Icon as={FaSignOutAlt} />}
                onClick={handleLogout}
                colorScheme="red"
              >
                Logout
              </Button>
            </HStack>
          </Flex>
        </Container>
      </Box>

      <Container maxW="4xl" py={8}>
        <VStack spacing={8} align="stretch">
          {/* Profile Header */}
          <MotionBox
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <VStack spacing={4} textAlign="center">
              <Heading size="xl" color="gray.800">
                My Profile
              </Heading>
              <Text fontSize="lg" color="gray.600">
                Manage your account information and preferences
              </Text>
            </VStack>
          </MotionBox>

          {/* Profile Information */}
          <MotionCard
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            variant="outline"
          >
            <CardHeader>
              <Flex justify="space-between" align="center">
                <Heading size="md" color="gray.800">
                  Account Information
                </Heading>
                {!isEditing && (
                  <Button
                    size="sm"
                    leftIcon={<Icon as={FaEdit} />}
                    onClick={handleEdit}
                    colorScheme="blue"
                    variant="outline"
                  >
                    Edit Profile
                  </Button>
                )}
              </Flex>
            </CardHeader>
            
            <CardBody>
              <VStack spacing={6} align="stretch">
                {/* Email (Read-only) */}
                <FormControl>
                  <FormLabel fontSize="sm" fontWeight="bold" color="gray.700">
                    <Icon as={FaEnvelope} mr={2} />
                    Email Address
                  </FormLabel>
                  <Input
                    value={user?.email || ''}
                    isReadOnly
                    bg="gray.50"
                    borderColor="gray.200"
                  />
                  <Text fontSize="xs" color="gray.500" mt={1}>
                    Email cannot be changed
                  </Text>
                </FormControl>

                {/* Full Name */}
                <FormControl>
                  <FormLabel fontSize="sm" fontWeight="bold" color="gray.700">
                    <Icon as={FaUser} mr={2} />
                    Full Name
                  </FormLabel>
                  {isEditing ? (
                    <Input
                      value={editData.full_name}
                      onChange={(e) => setEditData(prev => ({ ...prev, full_name: e.target.value }))}
                      placeholder="Enter your full name"
                    />
                  ) : (
                    <Text fontSize="md" color="gray.800" py={2}>
                      {profile.full_name}
                    </Text>
                  )}
                </FormControl>

                {/* Mobile Number */}
                <FormControl>
                  <FormLabel fontSize="sm" fontWeight="bold" color="gray.700">
                    <Icon as={FaPhone} mr={2} />
                    Mobile Number
                  </FormLabel>
                  {isEditing ? (
                    <Input
                      value={editData.mobile_number}
                      onChange={(e) => setEditData(prev => ({ ...prev, mobile_number: e.target.value }))}
                      placeholder="Enter your mobile number"
                    />
                  ) : (
                    <Text fontSize="md" color="gray.800" py={2}>
                      {profile.mobile_number}
                    </Text>
                  )}
                </FormControl>

                {/* Studying Year */}
                <FormControl>
                  <FormLabel fontSize="sm" fontWeight="bold" color="gray.700">
                    <Icon as={FaGraduationCap} mr={2} />
                    Studying Year
                  </FormLabel>
                  {isEditing ? (
                    <Input
                      as="select"
                      value={editData.studying_year}
                      onChange={(e) => setEditData(prev => ({ ...prev, studying_year: parseInt(e.target.value) }))}
                    >
                      <option value={1}>1st Year (Fresher)</option>
                      <option value={2}>2nd Year (Senior)</option>
                      <option value={3}>3rd Year (Senior)</option>
                      <option value={4}>4th Year (Senior)</option>
                    </Input>
                  ) : (
                    <HStack>
                      <Text fontSize="md" color="gray.800" py={2}>
                        Year {profile.studying_year}
                      </Text>
                      <Badge 
                        colorScheme={profile.studying_year === 1 ? 'green' : 'blue'}
                        fontSize="sm"
                      >
                        {profile.studying_year === 1 ? 'Fresher' : 'Senior'}
                      </Badge>
                    </HStack>
                  )}
                </FormControl>

                {/* Account Created */}
                <FormControl>
                  <FormLabel fontSize="sm" fontWeight="bold" color="gray.700">
                    <Icon as={FaCalendar} mr={2} />
                    Account Created
                  </FormLabel>
                  <Text fontSize="md" color="gray.800" py={2}>
                    {new Date(profile.created_at).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </Text>
                </FormControl>

                {/* Edit Actions */}
                {isEditing && (
                  <HStack spacing={4} pt={4}>
                    <Button
                      colorScheme="green"
                      leftIcon={<Icon as={FaSave} />}
                      onClick={handleSave}
                      isLoading={isSaving}
                      loadingText="Saving..."
                    >
                      Save Changes
                    </Button>
                    <Button
                      variant="outline"
                      leftIcon={<Icon as={FaTimes} />}
                      onClick={handleCancel}
                      isDisabled={isSaving}
                    >
                      Cancel
                    </Button>
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
            variant="outline"
          >
            <CardHeader>
              <Heading size="md" color="gray.800">
                Quick Actions
              </Heading>
            </CardHeader>
            
            <CardBody>
              <VStack spacing={4} align="stretch">
                <Button
                  leftIcon={<Icon as={FaTicketAlt} />}
                  onClick={() => navigate('/user-dashboard')}
                  colorScheme="blue"
                  variant="outline"
                >
                  View My Tickets
                </Button>
                
                <Button
                  leftIcon={<Icon as={FaSignOutAlt} />}
                  onClick={handleLogout}
                  colorScheme="red"
                  variant="outline"
                >
                  Sign Out
                </Button>
              </VStack>
            </CardBody>
          </MotionCard>
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
            <Button variant="outline" mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button colorScheme="red" onClick={confirmLogout}>
              Sign Out
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default UserProfilePage;

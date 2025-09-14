import React, { useState, useEffect } from 'react';
import {
  Box,
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
  Input,
  InputGroup,
  InputLeftElement,
  Select,
  Icon,
  Image,
  Card,
  CardBody,
  CardHeader,
  Divider,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Avatar,
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  FaSearch, 
  FaCalendarAlt, 
  FaMapMarkerAlt, 
  FaClock, 
  FaDollarSign,
  FaUsers,
  FaFilter,
  FaGraduationCap,
  FaArrowLeft,
  FaTicketAlt,
  FaStar,
  FaTag,
  FaChevronDown,
  FaUser,
  FaSignOutAlt,
} from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';
import { supabase, Event } from '../lib/supabase';
import EventCard from '../components/EventCard';

const MotionBox = motion(Box);
const MotionCard = motion(Card);

const EventsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [searchParams] = useSearchParams();
  const [events, setEvents] = useState<Event[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  
  const isMobile = useBreakpointValue({ base: true, md: false });

  useEffect(() => {
    fetchEvents();
    
    // Set initial category from URL params
    const category = searchParams.get('category');
    if (category) {
      setSelectedCategory(category);
    }
  }, [searchParams]);

  useEffect(() => {
    filterEvents();
  }, [events, searchTerm, selectedCategory, selectedType]);

  const fetchEvents = async () => {
    try {
      console.log('Fetching events...');
      setIsLoading(true);
      setError(null);

      console.log('Making Supabase request...');
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('is_active', true)
        .order('event_date', { ascending: true });

      console.log('Supabase response received:', { 
        hasData: !!data, 
        dataLength: data?.length, 
        hasError: !!error,
        error: error 
      });

      if (error) {
        console.error('Events fetch error details:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        throw error;
      }

      console.log('Events loaded successfully:', data?.length || 0, 'events');
      setEvents(data || []);
    } catch (error: any) {
      console.error('Error fetching events - full error:', error);
      console.error('Error type:', typeof error);
      console.error('Error message:', error?.message);
      setError(error?.message || 'Failed to load events');
    } finally {
      console.log('Setting loading to false');
      setIsLoading(false);
    }
  };

  const filterEvents = () => {
    let filtered = events;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(event =>
        event.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.location?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(event => event.category === selectedCategory);
    }

    // Filter by event type
    if (selectedType !== 'all') {
      filtered = filtered.filter(event => event.event_type === selectedType);
    }

    setFilteredEvents(filtered);
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

  // Handler for registration button
  const handleRegister = (event: Event) => {
    if (user) {
      navigate(`/register/${event.id}`);
    } else {
      navigate('/user-signup');
    }
  };

  return (
    <Box 
      minH="100vh" 
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
                MPGI SOE
              </Text>
            </HStack>
            {/* Navigation Menu */}
            <HStack spacing={8} display={{ base: "none", md: "flex" }}>
              <Button 
                variant="ghost" 
                color="white" 
                _hover={{ bg: "#4ade80", color: "white" }}
                onClick={() => navigate('/')}>
                Home
              </Button>
              <Button 
                variant="ghost" 
                color="white" 
                _hover={{ bg: "rgba(255,255,255,0.1)" }}
                onClick={() => navigate('/events')}>
                Events
              </Button>
              <Button 
                variant="ghost" 
                color="white" 
                _hover={{ bg: "rgba(255,255,255,0.1)" }}
                onClick={() => navigate('/contact')}>
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
                    <MenuItem icon={<Icon as={FaTicketAlt} />} onClick={() => navigate('/my-tickets')}>
                      My Tickets
                    </MenuItem>
                    <MenuItem icon={<Icon as={FaSignOutAlt} />} onClick={logout} color="red.500">
                      Sign Out
                    </MenuItem>
                  </MenuList>
                </Menu>
              ) : (
                <>
                  <Button
                    bg="#4ade80"
                    color="white"
                    _hover={{ bg: "#22c55e" }}
                    onClick={() => navigate('/user-signup')}
                  >
                    Register
                  </Button>
                  <Button
                    variant="outline"
                    color="white"
                    borderColor="white"
                    _hover={{ bg: "rgba(255,255,255,0.1)" }}
                    onClick={() => navigate('/user-login')}
                  >
                    Login
                  </Button>
                </>
              )}
            </HStack>
          </Flex>
        </MotionBox>

        {/* Header */}
        <MotionBox
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
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
              _hover={{ bg: "rgba(255,255,255,0.1)" }}
              onClick={() => navigate('/')}
              leftIcon={<Icon as={FaArrowLeft} />}
            >
              Back to Home
            </Button>
          </Flex>

          <VStack spacing={4} align="center" textAlign="center">
            <Heading
              as="h1"
              size={isMobile ? "2xl" : "4xl"}
              color="white"
              fontWeight="900"
            >
              College Events
            </Heading>
            <Text
              fontSize={isMobile ? "md" : "lg"}
              color="rgba(255,255,255,0.8)"
              maxW="600px"
            >
              Discover and participate in exciting events happening around campus. 
              From sports tournaments to cultural festivals, there's something for everyone!
            </Text>
          </VStack>
        </MotionBox>

        {/* Filters */}
        <MotionBox
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          mb={8}
        >
          <Card bg="rgba(255, 255, 255, 0.1)" backdropFilter="blur(10px)" border="1px solid rgba(255, 255, 255, 0.2)">
            <CardBody>
              <SimpleGrid columns={{ base: 1, md: 4 }} spacing={4}>
                <InputGroup>
                  <InputLeftElement>
                    <Icon as={FaSearch} color="gray.400" />
                  </InputLeftElement>
                  <Input
                    placeholder="Search events..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    bg="white"
                    color="gray.800"
                  />
                </InputGroup>

                <Select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  bg="white"
                  color="gray.800"
                >
                  <option value="all">All Categories</option>
                  <option value="sports">Sports</option>
                  <option value="cultural">Cultural</option>
                  <option value="technical">Technical</option>
                  <option value="academic">Academic</option>
                  <option value="social">Social</option>
                  <option value="general">General</option>
                </Select>

                <Select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  bg="white"
                  color="gray.800"
                >
                  <option value="all">All Types</option>
                  <option value="free">Free Events</option>
                  <option value="paid">Paid Events</option>
                  <option value="invitation_only">Invitation Only</option>
                </Select>

                <Button
                  bg="#4ade80"
                  color="white"
                  _hover={{ bg: "#22c55e" }}
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedCategory('all');
                    setSelectedType('all');
                  }}
                >
                  Clear Filters
                </Button>
              </SimpleGrid>
            </CardBody>
          </Card>
        </MotionBox>

        {/* Events Grid */}
        {isLoading ? (
          <MotionBox
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            textAlign="center"
            py={20}
          >
            <Spinner size="xl" color="#4ade80" thickness="4px" />
            <Text color="white" mt={4} fontSize="lg">
              Loading events...
            </Text>
          </MotionBox>
        ) : error ? (
          <MotionBox
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
          >
            <Alert status="error" borderRadius="xl" bg="rgba(255, 0, 0, 0.1)" border="1px solid rgba(255, 0, 0, 0.3)">
              <AlertIcon color="red.400" />
              <VStack align="start" spacing={2}>
                <Text color="white" fontWeight="bold">
                  Unable to load events
                </Text>
                <Text color="rgba(255,255,255,0.8)" fontSize="sm">
                  {error}
                </Text>
              </VStack>
            </Alert>
          </MotionBox>
        ) : filteredEvents.length === 0 ? (
          <MotionBox
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            textAlign="center"
            py={20}
          >
            <Text
              fontSize={isMobile ? "xl" : "2xl"}
              color="white"
              fontWeight="600"
            >
              No events found matching your criteria
            </Text>
            <Text color="rgba(255,255,255,0.7)" mt={2}>
              Try adjusting your search or filters
            </Text>
          </MotionBox>
        ) : (
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
            {filteredEvents.map((event, index) => (
              <EventCard
                key={event.id}
                event={event}
                userProfile={user ? { studying_year: user.user_metadata?.studying_year || 1 } : undefined}
                onRegister={handleRegister}
                showRegisterButton={true}
              />
            ))}
          </SimpleGrid>
        )}
      </Container>
    </Box>
  );
};

export default EventsPage;

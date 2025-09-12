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
  Badge,
  Icon,
  Spinner,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Input,
  InputGroup,
  InputLeftElement,
  Select,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  FaSignOutAlt, 
  FaDownload, 
  FaSearch, 
  FaQrcode, 
  FaCheckCircle,
  FaUser,
  FaEnvelope,
  FaPhone,
  FaCalendarAlt,
  FaEye,
  FaTrash,
  FaPlus,
  FaEdit,
  FaMapMarkerAlt,
  FaClock,
  FaDollarSign
} from 'react-icons/fa';
import { supabase, AllRegistration, Event } from '../lib/supabase';
import AdminLogin from '../components/AdminLogin';

const MotionBox = motion(Box);

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [registrations, setRegistrations] = useState<AllRegistration[]>([]);
  const [filteredRegistrations, setFilteredRegistrations] = useState<AllRegistration[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'fresher' | 'senior'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'paid' | 'pending'>('all');
  const [selectedRegistration, setSelectedRegistration] = useState<AllRegistration | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [isEditingEvent, setIsEditingEvent] = useState(false);
  
  // Event form state
  const [eventForm, setEventForm] = useState({
    title: '',
    description: '',
    date: '',
    venue: '',
    price: 0
  });
  
  const { isOpen: isQRScannerOpen, onOpen: onQRScannerOpen, onClose: onQRScannerClose } = useDisclosure();
  const { isOpen: isDetailsOpen, onOpen: onDetailsOpen, onClose: onDetailsClose } = useDisclosure();
  const { isOpen: isEventModalOpen, onOpen: onEventModalOpen, onClose: onEventModalClose } = useDisclosure();

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchRegistrations();
      fetchEvents();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    filterRegistrations();
  }, [registrations, searchTerm, filterType, filterStatus]);

  const checkAuth = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      setIsAuthenticated(!!session);
    } catch (error) {
      console.error('Auth check error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchRegistrations = async () => {
    try {
      const { data, error } = await supabase
        .from('all_registrations')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRegistrations(data || []);
    } catch (error) {
      console.error('Error fetching registrations:', error);
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

  const filterRegistrations = () => {
    let filtered = registrations;

    // Filter by type
    if (filterType !== 'all') {
      filtered = filtered.filter(reg => 
        filterType === 'fresher' ? reg.studying_year === 1 : reg.studying_year > 1
      );
    }

    // Filter by status
    if (filterStatus !== 'all') {
      filtered = filtered.filter(reg => reg.payment_status === filterStatus);
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(reg =>
        reg.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        reg.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        reg.mobile_number.includes(searchTerm)
      );
    }

    setFilteredRegistrations(filtered);
  };

  const handleCheckIn = async (registration: AllRegistration) => {
    try {
      const tableName = registration.registration_type === 'fresher' 
        ? 'freshers_registrations' 
        : 'senior_ticket_registrations';

      const { error } = await supabase
        .from(tableName)
        .update({ is_checked_in: true, is_checked_in_at: new Date().toISOString() })
        .eq('id', registration.id);

      if (error) throw error;
      
      // Update local state
      setRegistrations(prev =>
        prev.map(reg => reg.id === registration.id ? { ...reg, is_checked_in: true, is_checked_in_at: new Date().toISOString() } : reg)
      );
    } catch (error) {
      console.error('Error checking in:', error);
    }
  };

  const handleDeleteRegistration = async (registration: AllRegistration) => {
    if (!window.confirm('Are you sure you want to delete this registration?')) return;

    try {
      const tableName = registration.registration_type === 'fresher' 
        ? 'freshers_registrations' 
        : 'senior_ticket_registrations';

      const { error } = await supabase
        .from(tableName)
        .delete()
        .eq('id', registration.id);

      if (error) throw error;
      
      // Update local state
      setRegistrations(prev => prev.filter(reg => reg.id !== registration.id));
    } catch (error) {
      console.error('Error deleting registration:', error);
    }
  };

  const handleExportCSV = (type: 'all' | 'freshers' | 'seniors') => {
    let dataToExport: AllRegistration[] = [];
    let filename = '';

    switch (type) {
      case 'freshers':
        dataToExport = registrations.filter(reg => reg.registration_type === 'fresher');
        filename = `spark-2k25-freshers-${new Date().toISOString().split('T')[0]}.csv`;
        break;
      case 'seniors':
        dataToExport = registrations.filter(reg => reg.registration_type === 'senior');
        filename = `spark-2k25-seniors-${new Date().toISOString().split('T')[0]}.csv`;
        break;
      case 'all':
      default:
        dataToExport = registrations;
        filename = `spark-2k25-all-registrations-${new Date().toISOString().split('T')[0]}.csv`;
        break;
    }

    const csvContent = [
      ['Name', 'Email', 'Mobile', 'Year', 'Type', 'Payment Status', 'Amount Paid', 'Checked In', 'Registration Date'],
      ...dataToExport.map(reg => [
        reg.full_name,
        reg.email,
        reg.mobile_number,
        reg.studying_year.toString(),
        reg.registration_type === 'fresher' ? 'Fresher' : 'Senior',
        reg.payment_status || 'N/A',
        reg.amount_paid ? `₹${reg.amount_paid}` : 'FREE',
        reg.is_checked_in ? 'Yes' : 'No',
        new Date(reg.created_at).toLocaleDateString()
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsAuthenticated(false);
    navigate('/');
  };

  const openDetails = (registration: AllRegistration) => {
    setSelectedRegistration(registration);
    onDetailsOpen();
  };

  // Event management functions
  const resetEventForm = () => {
    setEventForm({
      title: '',
      description: '',
      date: '',
      venue: '',
      price: 0
    });
    setIsEditingEvent(false);
    setSelectedEvent(null);
  };

  const handleCreateEvent = () => {
    resetEventForm();
    onEventModalOpen();
  };

  const handleEditEvent = (event: Event) => {
    setEventForm({
      title: event.name,
      description: event.description || '',
      date: new Date(event.event_date).toISOString().slice(0, 16), // Format for datetime-local input
      venue: event.location || '',
      price: 99 // Fixed price for seniors
    });
    setSelectedEvent(event);
    setIsEditingEvent(true);
    onEventModalOpen();
  };

  const handleSaveEvent = async () => {
    if (!eventForm.title || !eventForm.date || !eventForm.venue) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      if (isEditingEvent && selectedEvent) {
        // Update existing event
        const { error } = await supabase
          .from('events')
          .update({
            name: eventForm.title,
            description: eventForm.description,
            event_date: eventForm.date,
            location: eventForm.venue,
            max_capacity: 500 // Default capacity
          })
          .eq('id', selectedEvent.id);

        if (error) throw error;
      } else {
        // Create new event
        const { error } = await supabase
          .from('events')
          .insert([{
            name: eventForm.title,
            description: eventForm.description,
            event_date: eventForm.date,
            location: eventForm.venue,
            max_capacity: 500, // Default capacity
            is_active: true
          }]);

        if (error) throw error;
      }

      // Refresh events list
      await fetchEvents();
      onEventModalClose();
      resetEventForm();
    } catch (error) {
      console.error('Error saving event:', error);
      alert('Error saving event. Please try again.');
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    if (!window.confirm('Are you sure you want to delete this event?')) return;

    try {
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', eventId);

      if (error) throw error;
      
      // Refresh events list
      await fetchEvents();
    } catch (error) {
      console.error('Error deleting event:', error);
      alert('Error deleting event. Please try again.');
    }
  };

  if (isLoading) {
    return (
      <Box minH="100vh" bg="gray.50" display="flex" alignItems="center" justifyContent="center">
        <Spinner size="xl" color="blue.500" />
      </Box>
    );
  }

  if (!isAuthenticated) {
    return <AdminLogin onLoginSuccess={() => setIsAuthenticated(true)} />;
  }

  const fresherRegistrations = filteredRegistrations.filter(reg => reg.studying_year === 1);
  const seniorRegistrations = filteredRegistrations.filter(reg => reg.studying_year > 1);
  const totalRegistrations = registrations.length;
  const paidRegistrations = registrations.filter(reg => reg.payment_status === 'paid').length;
  const checkedInRegistrations = registrations.filter(reg => reg.is_checked_in).length;

  return (
    <Box minH="100vh" bg="gray.50">
      {/* Header */}
      <Box bg="white" shadow="sm" borderBottom="1px solid" borderColor="gray.200">
        <Container maxW="container.xl" py={4}>
          <Flex justify="space-between" align="center">
            <Heading size="lg" color="gray.800">
              Admin Dashboard
            </Heading>
            <HStack gap={4}>
              <Button
                colorScheme="blue"
                size="sm"
                onClick={handleCreateEvent}
                leftIcon={<Icon as={FaPlus} />}
              >
                Add Event
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={onQRScannerOpen}
                leftIcon={<Icon as={FaQrcode} />}
              >
                QR Scanner
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleExportCSV('freshers')}
                leftIcon={<Icon as={FaDownload} />}
                colorScheme="green"
              >
                Export Freshers
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleExportCSV('seniors')}
                leftIcon={<Icon as={FaDownload} />}
                colorScheme="purple"
              >
                Export Seniors
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleExportCSV('all')}
                leftIcon={<Icon as={FaDownload} />}
                colorScheme="gray"
              >
                Export All
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                leftIcon={<Icon as={FaSignOutAlt} />}
              >
                Logout
              </Button>
            </HStack>
          </Flex>
        </Container>
      </Box>

      <Container maxW="container.xl" py={8}>
        {/* Statistics Cards */}
        <Flex gap={6} mb={8} wrap="wrap">
          <MotionBox
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            bg="white"
            p={6}
            borderRadius="lg"
            shadow="md"
            flex="1"
            minW="200px"
          >
            <Text fontSize="sm" color="gray.600" mb={2}>Total Registrations</Text>
            <Text fontSize="3xl" fontWeight="bold" color="blue.600">
              {totalRegistrations}
            </Text>
          </MotionBox>
          
          <MotionBox
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            bg="white"
            p={6}
            borderRadius="lg"
            shadow="md"
            flex="1"
            minW="200px"
          >
            <Text fontSize="sm" color="gray.600" mb={2}>Paid Registrations</Text>
            <Text fontSize="3xl" fontWeight="bold" color="green.600">
              {paidRegistrations}
            </Text>
          </MotionBox>
          
          <MotionBox
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            bg="white"
            p={6}
            borderRadius="lg"
            shadow="md"
            flex="1"
            minW="200px"
          >
            <Text fontSize="sm" color="gray.600" mb={2}>Checked In</Text>
            <Text fontSize="3xl" fontWeight="bold" color="purple.600">
              {checkedInRegistrations}
            </Text>
          </MotionBox>
        </Flex>

        {/* Filters */}
        <Box bg="white" p={6} borderRadius="lg" shadow="md" mb={6}>
          <Flex gap={4} wrap="wrap" align="center">
            <InputGroup maxW="300px">
              <InputLeftElement>
                <Icon as={FaSearch} color="gray.500" />
              </InputLeftElement>
              <Input
                placeholder="Search registrations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </InputGroup>
            <Select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as any)}
              maxW="150px"
            >
              <option value="all">All Types</option>
              <option value="fresher">Freshers</option>
              <option value="senior">Seniors</option>
            </Select>
            <Select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              maxW="150px"
            >
              <option value="all">All Status</option>
              <option value="paid">Paid</option>
              <option value="pending">Pending</option>
            </Select>
          </Flex>
        </Box>

        {/* Main Tabs */}
        <Tabs>
          <TabList>
            <Tab>Events ({events.length})</Tab>
            <Tab>Paid Seniors ({seniorRegistrations.length})</Tab>
            <Tab>Freshers ({fresherRegistrations.length})</Tab>
          </TabList>

          <TabPanels>
            {/* Events Tab */}
            <TabPanel p={0} mt={6}>
              <Box bg="white" borderRadius="lg" shadow="md" overflow="hidden">
                {events.length === 0 ? (
                  <Box p={8} textAlign="center">
                    <Text color="gray.500" fontSize="lg" mb={4}>
                      No events created yet
                    </Text>
                    <Button
                      colorScheme="blue"
                      onClick={handleCreateEvent}
                      leftIcon={<Icon as={FaPlus} />}
                    >
                      Create Your First Event
                    </Button>
                  </Box>
                ) : (
                  <Box overflowX="auto">
                    <Box as="table" w="full">
                      <Box as="thead" bg="gray.50">
                        <Box as="tr">
                          <Box as="th" p={4} textAlign="left" fontWeight="bold" color="gray.700">Event Title</Box>
                          <Box as="th" p={4} textAlign="left" fontWeight="bold" color="gray.700">Date & Time</Box>
                          <Box as="th" p={4} textAlign="left" fontWeight="bold" color="gray.700">Venue</Box>
                          <Box as="th" p={4} textAlign="left" fontWeight="bold" color="gray.700">Price</Box>
                          <Box as="th" p={4} textAlign="left" fontWeight="bold" color="gray.700">Actions</Box>
                        </Box>
                      </Box>
                      <Box as="tbody">
                        {events.map((event) => (
                          <Box as="tr" key={event.id} borderBottom="1px solid" borderColor="gray.100" _hover={{ bg: "gray.50" }}>
                            <Box as="td" p={4}>
                              <VStack align="start" spacing={1}>
                                <Text fontWeight="medium" fontSize="lg">{event.name}</Text>
                                {event.description && (
                                  <Text fontSize="sm" color="gray.600" noOfLines={2}>
                                    {event.description}
                                  </Text>
                                )}
                              </VStack>
                            </Box>
                            <Box as="td" p={4}>
                              <VStack align="start" spacing={1}>
                                <HStack>
                                  <Icon as={FaCalendarAlt} color="blue.500" boxSize={3} />
                                  <Text fontSize="sm">
                                    {new Date(event.event_date).toLocaleDateString()}
                                  </Text>
                                </HStack>
                                <HStack>
                                  <Icon as={FaClock} color="green.500" boxSize={3} />
                                  <Text fontSize="sm">
                                    {new Date(event.event_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                  </Text>
                                </HStack>
                              </VStack>
                            </Box>
                            <Box as="td" p={4}>
                              <HStack>
                                <Icon as={FaMapMarkerAlt} color="red.500" boxSize={3} />
                                <Text fontSize="sm">{event.location}</Text>
                              </HStack>
                            </Box>
                            <Box as="td" p={4}>
                              <HStack>
                                <Icon as={FaDollarSign} color="green.500" boxSize={3} />
                                <Text fontSize="sm" fontWeight="medium">
                                  Seniors: ₹99 | Freshers: Free
                                </Text>
                              </HStack>
                            </Box>
                            <Box as="td" p={4}>
                              <HStack gap={2}>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  colorScheme="blue"
                                  onClick={() => handleEditEvent(event)}
                                  leftIcon={<Icon as={FaEdit} />}
                                >
                                  Edit
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  colorScheme="red"
                                  onClick={() => handleDeleteEvent(event.id)}
                                  leftIcon={<Icon as={FaTrash} />}
                                >
                                  Delete
                                </Button>
                              </HStack>
                            </Box>
                          </Box>
                        ))}
                      </Box>
                    </Box>
                  </Box>
                )}
              </Box>
            </TabPanel>

            {/* Paid Seniors Tab */}
            <TabPanel p={0} mt={6}>
              <Box bg="white" borderRadius="lg" shadow="md" overflow="hidden">
                <Box p={4} borderBottom="1px solid" borderColor="gray.200" bg="gray.50">
                  <Flex justify="space-between" align="center">
                    <Text fontWeight="medium" color="gray.700">
                      Paid Seniors ({seniorRegistrations.length} registrations)
                    </Text>
                    <Button
                      size="sm"
                      colorScheme="purple"
                      variant="outline"
                      onClick={() => handleExportCSV('seniors')}
                      leftIcon={<Icon as={FaDownload} />}
                    >
                      Export Seniors CSV
                    </Button>
                  </Flex>
                </Box>
                <Box overflowX="auto">
                  <Box as="table" w="full">
                    <Box as="thead" bg="gray.50">
                      <Box as="tr">
                        <Box as="th" p={4} textAlign="left" fontWeight="bold" color="gray.700">Name</Box>
                        <Box as="th" p={4} textAlign="left" fontWeight="bold" color="gray.700">Email</Box>
                        <Box as="th" p={4} textAlign="left" fontWeight="bold" color="gray.700">Mobile</Box>
                        <Box as="th" p={4} textAlign="left" fontWeight="bold" color="gray.700">Year</Box>
                        <Box as="th" p={4} textAlign="left" fontWeight="bold" color="gray.700">Status</Box>
                        <Box as="th" p={4} textAlign="left" fontWeight="bold" color="gray.700">Actions</Box>
                      </Box>
                    </Box>
                    <Box as="tbody">
                      {seniorRegistrations.map((registration) => (
                        <Box as="tr" key={registration.id} borderBottom="1px solid" borderColor="gray.100" _hover={{ bg: "gray.50" }}>
                          <Box as="td" p={4}>
                            <Text fontWeight="medium">{registration.full_name}</Text>
                          </Box>
                          <Box as="td" p={4}>
                            <Text fontSize="sm" color="gray.600">{registration.email}</Text>
                          </Box>
                          <Box as="td" p={4}>
                            <Text fontSize="sm">{registration.mobile_number}</Text>
                          </Box>
                          <Box as="td" p={4}>
                            <Text fontSize="sm">{registration.studying_year} Year</Text>
                          </Box>
                          <Box as="td" p={4}>
                            <HStack gap={2}>
                              <Badge colorScheme={registration.payment_status === 'paid' ? 'green' : 'yellow'}>
                                {registration.payment_status}
                              </Badge>
                              {registration.is_checked_in && (
                                <Badge colorScheme="blue">Checked In</Badge>
                              )}
                            </HStack>
                          </Box>
                          <Box as="td" p={4}>
                            <HStack gap={2}>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => openDetails(registration)}
                                leftIcon={<Icon as={FaEye} />}
                              >
                                View
                              </Button>
                              {!registration.is_checked_in && (
                                <Button
                                  size="sm"
                                  colorScheme="green"
                                  onClick={() => handleCheckIn(registration)}
                                  leftIcon={<Icon as={FaCheckCircle} />}
                                >
                                  Check In
                                </Button>
                              )}
                              <Button
                                size="sm"
                                colorScheme="red"
                                variant="outline"
                                onClick={() => handleDeleteRegistration(registration)}
                                leftIcon={<Icon as={FaTrash} />}
                              >
                                Delete
                              </Button>
                            </HStack>
                          </Box>
                        </Box>
                      ))}
                    </Box>
                  </Box>
                </Box>
              </Box>
            </TabPanel>

            {/* Freshers Tab */}
            <TabPanel p={0} mt={6}>
              <Box bg="white" borderRadius="lg" shadow="md" overflow="hidden">
                <Box p={4} borderBottom="1px solid" borderColor="gray.200" bg="gray.50">
                  <Flex justify="space-between" align="center">
                    <Text fontWeight="medium" color="gray.700">
                      Freshers ({fresherRegistrations.length} registrations)
                    </Text>
                    <Button
                      size="sm"
                      colorScheme="green"
                      variant="outline"
                      onClick={() => handleExportCSV('freshers')}
                      leftIcon={<Icon as={FaDownload} />}
                    >
                      Export Freshers CSV
                    </Button>
                  </Flex>
                </Box>
                <Box overflowX="auto">
                  <Box as="table" w="full">
                    <Box as="thead" bg="gray.50">
                      <Box as="tr">
                        <Box as="th" p={4} textAlign="left" fontWeight="bold" color="gray.700">Name</Box>
                        <Box as="th" p={4} textAlign="left" fontWeight="bold" color="gray.700">Email</Box>
                        <Box as="th" p={4} textAlign="left" fontWeight="bold" color="gray.700">Mobile</Box>
                        <Box as="th" p={4} textAlign="left" fontWeight="bold" color="gray.700">Status</Box>
                        <Box as="th" p={4} textAlign="left" fontWeight="bold" color="gray.700">Actions</Box>
                      </Box>
                    </Box>
                    <Box as="tbody">
                      {fresherRegistrations.map((registration) => (
                        <Box as="tr" key={registration.id} borderBottom="1px solid" borderColor="gray.100" _hover={{ bg: "gray.50" }}>
                          <Box as="td" p={4}>
                            <Text fontWeight="medium">{registration.full_name}</Text>
                          </Box>
                          <Box as="td" p={4}>
                            <Text fontSize="sm" color="gray.600">{registration.email}</Text>
                          </Box>
                          <Box as="td" p={4}>
                            <Text fontSize="sm">{registration.mobile_number}</Text>
                          </Box>
                          <Box as="td" p={4}>
                            <HStack gap={2}>
                              <Badge colorScheme="green">Free Entry</Badge>
                              {registration.is_checked_in && (
                                <Badge colorScheme="blue">Checked In</Badge>
                              )}
                            </HStack>
                          </Box>
                          <Box as="td" p={4}>
                            <HStack gap={2}>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => openDetails(registration)}
                                leftIcon={<Icon as={FaEye} />}
                              >
                                View
                              </Button>
                              {!registration.is_checked_in && (
                                <Button
                                  size="sm"
                                  colorScheme="green"
                                  onClick={() => handleCheckIn(registration)}
                                  leftIcon={<Icon as={FaCheckCircle} />}
                                >
                                  Check In
                                </Button>
                              )}
                              <Button
                                size="sm"
                                colorScheme="red"
                                variant="outline"
                                onClick={() => handleDeleteRegistration(registration)}
                                leftIcon={<Icon as={FaTrash} />}
                              >
                                Delete
                              </Button>
                            </HStack>
                          </Box>
                        </Box>
                      ))}
                    </Box>
                  </Box>
                </Box>
              </Box>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Container>

      {/* Registration Details Modal */}
      <Modal isOpen={isDetailsOpen} onClose={onDetailsClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Registration Details</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            {selectedRegistration && (
              <Flex direction="column" gap={4}>
                <HStack>
                  <Icon as={FaUser} color="blue.500" />
                  <Text fontWeight="bold">Name:</Text>
                  <Text>{selectedRegistration.full_name}</Text>
                </HStack>
                <HStack>
                  <Icon as={FaEnvelope} color="blue.500" />
                  <Text fontWeight="bold">Email:</Text>
                  <Text>{selectedRegistration.email}</Text>
                </HStack>
                <HStack>
                  <Icon as={FaPhone} color="blue.500" />
                  <Text fontWeight="bold">Mobile:</Text>
                  <Text>{selectedRegistration.mobile_number}</Text>
                </HStack>
                <HStack>
                  <Icon as={FaCalendarAlt} color="blue.500" />
                  <Text fontWeight="bold">Year:</Text>
                  <Text>{selectedRegistration.studying_year} Year</Text>
                </HStack>
                <HStack>
                  <Text fontWeight="bold">Payment Status:</Text>
                  <Badge colorScheme={selectedRegistration.payment_status === 'paid' ? 'green' : 'yellow'}>
                    {selectedRegistration.payment_status}
                  </Badge>
                </HStack>
                <HStack>
                  <Text fontWeight="bold">Checked In:</Text>
                  <Badge colorScheme={selectedRegistration.is_checked_in ? 'blue' : 'gray'}>
                    {selectedRegistration.is_checked_in ? 'Yes' : 'No'}
                  </Badge>
                </HStack>
                {selectedRegistration.qr_code && (
                  <HStack>
                    <Text fontWeight="bold">QR Code:</Text>
                    <Text fontFamily="mono" fontSize="sm">{selectedRegistration.qr_code}</Text>
                  </HStack>
                )}
              </Flex>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>

      {/* Event Modal */}
      <Modal isOpen={isEventModalOpen} onClose={onEventModalClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            {isEditingEvent ? 'Edit Event' : 'Create New Event'}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <VStack spacing={4}>
              <Box w="full">
                <Text mb={2} fontWeight="medium">Event Title *</Text>
                <Input
                  placeholder="Enter event title"
                  value={eventForm.title}
                  onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })}
                />
              </Box>
              
              <Box w="full">
                <Text mb={2} fontWeight="medium">Description</Text>
                <Input
                  placeholder="Enter event description (optional)"
                  value={eventForm.description}
                  onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })}
                />
              </Box>
              
              <HStack w="full" spacing={4}>
                <Box flex="1">
                  <Text mb={2} fontWeight="medium">Date & Time *</Text>
                  <Input
                    type="datetime-local"
                    value={eventForm.date}
                    onChange={(e) => setEventForm({ ...eventForm, date: e.target.value })}
                  />
                </Box>
                <Box flex="1">
                  <Text mb={2} fontWeight="medium">Price (₹)</Text>
                  <Input
                    type="number"
                    placeholder="0"
                    value={eventForm.price}
                    onChange={(e) => setEventForm({ ...eventForm, price: parseFloat(e.target.value) || 0 })}
                  />
                </Box>
              </HStack>
              
              <Box w="full">
                <Text mb={2} fontWeight="medium">Venue *</Text>
                <Input
                  placeholder="Enter venue name"
                  value={eventForm.venue}
                  onChange={(e) => setEventForm({ ...eventForm, venue: e.target.value })}
                />
              </Box>
              
              <HStack w="full" justify="flex-end" spacing={3} pt={4}>
                <Button
                  variant="outline"
                  onClick={() => {
                    onEventModalClose();
                    resetEventForm();
                  }}
                >
                  Cancel
                </Button>
                <Button
                  colorScheme="blue"
                  onClick={handleSaveEvent}
                >
                  {isEditingEvent ? 'Update Event' : 'Create Event'}
                </Button>
              </HStack>
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>

      {/* QR Scanner Modal */}
      <Modal isOpen={isQRScannerOpen} onClose={onQRScannerClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>QR Code Scanner</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <Box p={8} textAlign="center">
              <Icon as={FaQrcode} boxSize={16} color="gray.400" mb={4} />
              <Text color="gray.600" mb={4}>
                QR Scanner functionality would be implemented here using a camera library.
              </Text>
              <Text fontSize="sm" color="gray.500">
                This would scan QR codes from tickets to verify and check in attendees.
              </Text>
            </Box>
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default AdminDashboard;
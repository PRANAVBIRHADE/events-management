// Trigger redeploy: dummy comment
import React, { useState, useEffect } from 'react';
import EnvDebug from '../components/EnvDebug';
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
  Divider,
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
import { supabase, AllRegistration, Event, UserProfile } from '../lib/supabase';
import { revalidateOnFocus } from '../lib/cache';
import { useAuth } from '../contexts/AuthContext';
import AdminLogin from '../components/AdminLogin';
import QRScanner from '../components/QRScanner';
import PaymentVerification from '../components/PaymentVerification';

const MotionBox = motion(Box);

  // Update EventFormData interface - Year-wise pricing (v2)
interface EventFormData {
  name: string;
  description: string;
  event_date: string;
  location: string;
  max_capacity: number;
  category: string;
  event_type: string;
  price: number;
  pricing_type: string;
  year_pricing: { [year: number]: { type: 'free' | 'paid', amount: number } };
  registration_deadline: string;
  organizer: string;
  contact_email: string;
  contact_phone: string;
  requirements: string;
  tags: string;
}

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading, logout } = useAuth();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [registrations, setRegistrations] = useState<AllRegistration[]>([]);
  const [filteredRegistrations, setFilteredRegistrations] = useState<AllRegistration[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [rawSearchTerm, setRawSearchTerm] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'fresher' | 'senior'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'paid' | 'pending'>('all');
  const [selectedRegistration, setSelectedRegistration] = useState<AllRegistration | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [isEditingEvent, setIsEditingEvent] = useState(false);
  const [users, setUsers] = useState<UserProfile[]>([]);
  // Pagination state
  const [regPage, setRegPage] = useState(1);
  const [regPageSize] = useState(25);
  const [usersPage, setUsersPage] = useState(1);
  const [usersPageSize] = useState(25);
  
  const sessionRetries = React.useRef(0);
  // Update eventForm state
  const [eventForm, setEventForm] = useState<EventFormData>({
    name: '',
    description: '',
    event_date: '',
    location: '',
    max_capacity: 100,
    category: 'general',
    event_type: 'free',
    price: 0,
    pricing_type: 'year_based',
    year_pricing: {
      1: { type: 'free', amount: 0 },
      2: { type: 'free', amount: 0 },
      3: { type: 'free', amount: 0 },
      4: { type: 'free', amount: 0 },
    },
    registration_deadline: '',
    organizer: '',
    contact_email: '',
    contact_phone: '',
    requirements: '',
    tags: ''
  });
  
  const { isOpen: isQRScannerOpen, onOpen: onQRScannerOpen, onClose: onQRScannerClose } = useDisclosure();
  const { isOpen: isDetailsOpen, onOpen: onDetailsOpen, onClose: onDetailsClose } = useDisclosure();
  const { isOpen: isEventModalOpen, onOpen: onEventModalOpen, onClose: onEventModalClose } = useDisclosure();

  useEffect(() => {
    // Wait for AuthContext to finish resolving session on refresh
    if (authLoading) return;

    // Optimistic access: if we previously confirmed this email is admin, allow immediately and verify in background
    if (user?.email) {
      const adminKey = `admin_ok:${user.email}`;
      if (localStorage.getItem(adminKey) === 'true') {
        setIsAuthenticated(true);
        // Verify silently without disrupting UI
        checkAuth(true);
      } else {
        checkAuth();
      }
    } else {
      setIsAuthenticated(false);
    }

    const detach = revalidateOnFocus(() => {
      if (isAuthenticated) {
        fetchRegistrations();
        fetchEvents();
        fetchUsers();
      }
    });
    return detach;
  }, [authLoading, user?.email]);

  useEffect(() => {
    if (isAuthenticated) {
      // Set loading to true when starting data fetch
      setIsLoading(true);
      
      // Fetch all data in parallel with overall timeout
      const dataFetchPromise = Promise.allSettled([
        fetchRegistrations(),
        fetchEvents(),
        fetchUsers()
      ]);
      
      const overallTimeout = new Promise((resolve) => 
        setTimeout(() => {
          console.log('Overall data fetch timeout reached, setting loading to false');
          resolve('timeout');
        }, 15000) // 15 second overall timeout
      );
      
      Promise.race([dataFetchPromise, overallTimeout]).then(() => {
        // Set loading to false after all data fetching attempts complete or timeout
        console.log('All data fetching attempts completed, setting loading to false');
        setIsLoading(false);
      });
    }
  }, [isAuthenticated]);

  useEffect(() => {
    filterRegistrations();
    setRegPage(1);
  }, [registrations, searchTerm, filterType, filterStatus]);

  // Debounce search input
  useEffect(() => {
    const id = setTimeout(() => setSearchTerm(rawSearchTerm), 350);
    return () => clearTimeout(id);
  }, [rawSearchTerm]);

  const checkAuth = async (silent: boolean = false): Promise<void> => {
    try {
      // Use AuthContext user instead of fetching session to avoid refresh race/timeouts
      if (user?.email) {
        console.log('[AdminDashboard] Starting admin check for user:', user.email, 'user object:', user);
        
        // Try database query first with short timeout
        console.log('[AdminDashboard] Attempting database query with 5-second timeout...');
        const dbQuery = Promise.race([
          supabase
            .from('admin_users')
            .select('id, email')
            .eq('email', user.email)
            .single(),
          new Promise<any>((_, reject) => setTimeout(() => reject(new Error('Database query timeout')), 5000))
        ]);
        
        try {
          const result = await dbQuery;
          console.log('[AdminDashboard] Database query successful:', result);
          if (!result.error && result.data) {
            console.log('[AdminDashboard] Admin access granted via database for:', user.email, 'adminUser:', result.data);
            setIsAuthenticated(true);
            try { localStorage.setItem(`admin_ok:${user.email}`, 'true'); } catch {}
          } else {
            throw new Error('Database query failed: ' + (result.error?.message || 'No data'));
          }
        } catch (dbError: any) {
          console.log('⚠️ [AdminDashboard] Database query failed, falling back to email check:', dbError?.message || 'Unknown error');
          
          // Fallback to email-based check
          const adminEmails = [
            'admin@spark2k25.com',
            'admin@freshersparty.com'
          ];
          
          const isAdminEmail = adminEmails.includes(user.email);
          console.log('[AdminDashboard] Email check for:', user.email, 'is admin:', isAdminEmail);
          
          if (isAdminEmail) {
            console.log('[AdminDashboard] Admin access granted via email fallback for:', user.email);
            setIsAuthenticated(true);
            try { localStorage.setItem(`admin_ok:${user.email}`, 'true'); } catch {}
          } else {
            console.error('[AdminDashboard] User is not an authorized admin email, access denied');
            setIsAuthenticated(false);
            try { localStorage.removeItem(`admin_ok:${user.email}`); } catch {}
            return;
          }
        }
      } else {
        // If AuthContext resolved and there is no user, not authenticated
        if (!authLoading) setIsAuthenticated(false);
      }
    } catch (error) {
      if (!silent) console.error('[AdminDashboard] Auth check error:', error);
      // Retry on transient timeout without flipping auth state immediately
      if (error instanceof Error && error.message.includes('timeout')) {
        if (sessionRetries.current < 2) {
          sessionRetries.current += 1;
          await new Promise(res => setTimeout(res, 600));
          return checkAuth();
        }
      }
      // On hard failure, do not force sign-out here; leave last state to avoid bounce
      if (!isAuthenticated) setIsAuthenticated(false);
    } finally {
      if (!silent) setIsLoading(false);
    }
  };

  const fetchRegistrations = async () => {
    try {
      console.log('Fetching registrations from registrations table...');
      
      // Add timeout to prevent hanging
      const queryPromise = supabase
        .from('registrations')
        .select(`
          id,
          user_id,
          event_id,
          payment_status,
          checked_in,
          created_at,
          user_profiles!inner(full_name, email),
          events!inner(name, event_date, location)
        `)
        .order('created_at', { ascending: false });
      
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Registrations query timeout')), 10000)
      );
      
      const { data, error } = await Promise.race([queryPromise, timeoutPromise]) as any;

      if (error) {
        console.error('Error fetching registrations:', error);
        throw error;
      }
      
      console.log('Fetched registrations:', data?.length || 0, 'records');
      setRegistrations(data || []);
    } catch (error: any) {
      console.error('Error fetching registrations:', error?.message || 'Unknown error');
      // Set empty array on error to prevent loading state
      setRegistrations([]);
    }
  };

  const fetchEvents = async () => {
    try {
      console.log('Fetching events...');
      
      // Add timeout to prevent hanging
      const queryPromise = supabase
        .from('events')
        .select('id,name,description,event_date,location,category,event_type,price,max_capacity,current_registrations,tags,is_active,created_at,updated_at')
        .order('event_date', { ascending: true });
      
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Events query timeout')), 10000)
      );
      
      const { data, error } = await Promise.race([queryPromise, timeoutPromise]) as any;

      if (error) {
        console.error('Supabase fetch error:', error);
        throw error;
      }
      
      console.log('Events fetched successfully:', data);
      setEvents(data || []);
    } catch (error: any) {
      console.error('Error fetching events:', error?.message || 'Unknown error');
      // Set empty array on error to prevent loading state
      setEvents([]);
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

      console.log('Deleting registration:', registration.id, 'from table:', tableName);
      console.log('Registration details:', registration);

      // First, let's verify the registration exists in the table
      const { data: existingData, error: fetchError } = await supabase
        .from(tableName)
        .select('id')
        .eq('id', registration.id);

      if (fetchError) {
        console.error('Error fetching registration:', fetchError);
        alert(`Error fetching registration: ${fetchError.message}`);
        return;
      }

      if (!existingData || existingData.length === 0) {
        console.log('Registration not found in table, removing from UI anyway');
        setRegistrations(prev => prev.filter(reg => reg.id !== registration.id));
        setFilteredRegistrations(prev => prev.filter(reg => reg.id !== registration.id));
        alert('Registration not found in database, removed from UI');
        return;
      }

      console.log('Registration found in table, proceeding with deletion');

      const { error } = await supabase
        .from(tableName)
        .delete()
        .eq('id', registration.id);

      if (error) {
        console.error('Supabase delete error:', error);
        alert(`Error deleting registration: ${error.message}`);
        return;
      }

      console.log('Registration deleted successfully from database');
      
      // Update local state immediately
      setRegistrations(prev => prev.filter(reg => reg.id !== registration.id));
      setFilteredRegistrations(prev => prev.filter(reg => reg.id !== registration.id));
      
      // Wait a moment then refresh from server
      setTimeout(async () => {
        console.log('Refreshing data from server...');
        await fetchRegistrations();
        console.log('Data refreshed from server');
      }, 1000);
      
      alert('Registration deleted successfully!');
    } catch (error) {
      console.error('Error deleting registration:', error);
      const errorMessage = error instanceof Error ? error.message : 'Please try again.';
      alert(`Error deleting registration: ${errorMessage}`);
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
    try {
      // Prefer centralized logout to keep behavior consistent across app
      await logout();
    } catch (e) {
      // Fallback to direct Supabase signout
      try { await supabase.auth.signOut(); } catch {}
    } finally {
      setIsAuthenticated(false);
      // Hard navigation fallback to avoid stuck state
      try { navigate('/'); } catch {}
      if (typeof window !== 'undefined') {
        window.location.replace('/');
      }
    }
  };

  const openDetails = (registration: AllRegistration) => {
    setSelectedRegistration(registration);
    onDetailsOpen();
  };

  // Event management functions
  const resetEventForm = () => {
    setEventForm({
      name: '',
      description: '',
      event_date: '',
      location: '',
      max_capacity: 100,
      category: 'general',
      event_type: 'free',
      price: 0,
      pricing_type: 'year_based',
      year_pricing: {
        1: { type: 'free', amount: 0 },
        2: { type: 'free', amount: 0 },
        3: { type: 'free', amount: 0 },
        4: { type: 'free', amount: 0 },
      },
      registration_deadline: '',
      organizer: '',
      contact_email: '',
      contact_phone: '',
      requirements: '',
      tags: ''
    });
    setIsEditingEvent(false);
    setSelectedEvent(null);
  };

  const handleCreateEvent = () => {
    resetEventForm();
    onEventModalOpen();
  };

  const handleEditEvent = (event: Event) => {
    console.log('Edit event clicked:', event);
    
    try {
      // Convert DB fields to form state
      const year_pricing: { [year: number]: { type: 'free' | 'paid', amount: number } } = {};
      
      // Initialize all years as free by default
      [1, 2, 3, 4].forEach(year => {
        year_pricing[year] = { type: 'free', amount: 0 };
      });
      
      // Set free years
      if (event.free_for_years) {
        event.free_for_years.forEach(year => {
          year_pricing[year] = { type: 'free', amount: 0 };
        });
      }
      
      // Set paid years
      if (event.paid_for_years) {
        event.paid_for_years.forEach(year => {
          year_pricing[year] = { 
            type: 'paid', 
            amount: event.year_specific_pricing?.[year] || event.base_price || 99 
          };
        });
      }

      const formData = {
        name: event.name,
        description: event.description || '',
        event_date: new Date(event.event_date).toISOString().slice(0, 16), // Format for datetime-local input
        location: event.location || '',
        max_capacity: event.max_capacity || 100,
        category: event.category || 'general',
        event_type: event.event_type || 'free',
        price: event.price || 0,
        pricing_type: 'year_based', // This will be overridden by the new UI
        year_pricing,
        registration_deadline: event.registration_deadline ? new Date(event.registration_deadline).toISOString().slice(0, 16) : '',
        organizer: event.organizer || '',
        contact_email: event.contact_email || '',
        contact_phone: event.contact_phone || '',
        requirements: event.requirements || '',
        tags: event.tags ? event.tags.join(', ') : ''
      };

      console.log('Setting form data:', formData);
      setEventForm(formData);
      setSelectedEvent(event);
      setIsEditingEvent(true);
      onEventModalOpen();
    } catch (error) {
      console.error('Error in handleEditEvent:', error);
      alert('Error opening edit form. Please try again.');
    }
  };

  const handleSaveEvent = async () => {
    if (!eventForm.name || !eventForm.event_date || !eventForm.location) {
      alert('Please fill in all required fields (Name, Date, Location)');
      return;
    }
    // Convert year_pricing to DB fields
    const free_for_years = Object.keys(eventForm.year_pricing)
      .map(Number)
      .filter(year => eventForm.year_pricing[year].type === 'free');
    const paid_for_years = Object.keys(eventForm.year_pricing)
      .map(Number)
      .filter(year => eventForm.year_pricing[year].type === 'paid');
    const year_specific_pricing: { [key: number]: number } = {};
    paid_for_years.forEach(year => {
      year_specific_pricing[year] = eventForm.year_pricing[year].amount;
    });

    try {
      const eventData = {
        name: eventForm.name,
        description: eventForm.description,
        event_date: eventForm.event_date,
        location: eventForm.location,
        max_capacity: eventForm.max_capacity,
        category: eventForm.category,
        event_type: eventForm.event_type,
        price: eventForm.price,
        pricing_type: 'year_based', // This will be overridden by the new UI
        free_for_years,
        paid_for_years,
        base_price: eventForm.price,
        year_specific_pricing,
        registration_deadline: eventForm.registration_deadline || null,
        organizer: eventForm.organizer,
        contact_email: eventForm.contact_email,
        contact_phone: eventForm.contact_phone,
        requirements: eventForm.requirements,
        tags: eventForm.tags ? eventForm.tags.split(',').map(tag => tag.trim()) : [],
        is_active: true
      };

      if (isEditingEvent && selectedEvent) {
        // Update existing event
        const { data, error } = await supabase
          .from('events')
          .update(eventData)
          .eq('id', selectedEvent.id)
          .select()
          .single();

        if (error) throw error;
        
        // Update local state immediately
        setEvents(prevEvents => 
          prevEvents.map(event => 
            event.id === selectedEvent.id ? { ...event, ...data } : event
          )
        );
      } else {
        // Create new event
        const { data, error } = await supabase
          .from('events')
          .insert([eventData])
          .select()
          .single();

        if (error) throw error;
        
        // Update local state immediately
        setEvents(prevEvents => [...prevEvents, data]);
      }

      // Also refresh from server to ensure consistency
      await fetchEvents();
      onEventModalClose();
      resetEventForm();
    } catch (error) {
      console.error('Error saving event:', error);
      alert('Error saving event. Please try again.');
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    console.log('Delete event clicked:', eventId);
    
    if (!window.confirm('Are you sure you want to delete this event?')) {
      console.log('Delete cancelled by user');
      return;
    }

    try {
      console.log('Attempting to delete event:', eventId);
      
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', eventId);

      if (error) {
        console.error('Supabase delete error:', error);
        throw error;
      }
      
      console.log('Event deleted successfully');
      
      // Update local state immediately for better UX
      setEvents(prevEvents => prevEvents.filter(event => event.id !== eventId));
      
      // Also refresh from server to ensure consistency
      await fetchEvents();
      console.log('Events list refreshed');
      
      // Show success message
      alert('Event deleted successfully!');
    } catch (error) {
      console.error('Error deleting event:', error);
      const errorMessage = error instanceof Error ? error.message : 'Please try again.';
      alert(`Error deleting event: ${errorMessage}`);
    }
  };

  // Fetch users
  const fetchUsers = async () => {
    try {
      console.log('Fetching users...');
      
      // Add timeout to prevent hanging
      const queryPromise = supabase
        .from('user_profiles')
        .select('id,full_name,email,created_at')
        .order('created_at', { ascending: false });
      
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Users query timeout')), 10000)
      );
      
      const { data, error } = await Promise.race([queryPromise, timeoutPromise]) as any;
      
      if (error) throw error;
      console.log('Users fetched successfully:', data?.length || 0, 'users');
      setUsers(data || []);
    } catch (error: any) {
      console.error('Error fetching users:', error?.message || 'Unknown error');
      // Set empty array on error to prevent loading state
      setUsers([]);
    }
  };

  // Add this function inside AdminDashboard component
  const handleDeleteUser = async (user: UserProfile) => {
    if (!window.confirm(`Are you sure you want to COMPLETELY DELETE the account for ${user.full_name} (${user.email})? This will remove them from auth.users and they will NOT be able to log in anymore. This cannot be undone.`)) return;
    try {
      // Call the Edge Function to completely delete user from auth.users
      const res = await fetch('https://feewkjawsvuxuvymqslw.functions.supabase.co/delete-user-complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: user.user_id }),
      });

      if (!res.ok) {
        const error = await res.text();
        console.error('Failed to delete user:', error);
        alert('Failed to delete user: ' + error);
        return;
      }

      const result = await res.json();
      if (result.success) {
        // Update UI immediately
        setUsers(prev => prev.filter(u => u.id !== user.id));
        
        // If the deleted user is currently logged in, sign them out
        const { data: { session } } = await supabase.auth.getSession();
        if (session && session.user.id === user.user_id) {
          console.log('Deleted user is currently logged in, signing them out...');
          await supabase.auth.signOut();
          alert('User account COMPLETELY deleted! You have been signed out because this was your account.');
          window.location.reload();
          return;
        }
        
        alert('User account COMPLETELY deleted! They can no longer log in.');
      } else {
        alert('Failed to delete user: ' + (result.error || 'Unknown error'));
      }
    } catch (err) {
      console.error('Error deleting user:', err);
      alert('Error deleting user: ' + (err instanceof Error ? err.message : err));
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
      {/* Environment Debug - Remove this after fixing */}
      <Box p={4} bg="yellow.100" borderBottom="2px solid" borderColor="yellow.300">
        <Container maxW="container.xl">
          <EnvDebug />
        </Container>
      </Box>
      
      {/* Header */}
      <Box bg="white" shadow="sm" borderBottom="1px solid" borderColor="gray.200">
        <Container maxW="container.xl" py={4}>
          <Flex justify="space-between" align="center">
            <HStack gap={4}>
              <Heading size="lg" color="gray.800">
                Admin Dashboard
              </Heading>
              <Badge colorScheme="purple" variant="subtle">Admin</Badge>
            </HStack>
            <HStack gap={3}>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/')}
              >
                View Site
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/events')}
              >
                Events Page
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/user-profile')}
              >
                My Profile
              </Button>
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
                value={rawSearchTerm}
                onChange={(e) => setRawSearchTerm(e.target.value)}
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
        <Tabs variant="enclosed" colorScheme="blue" isFitted>
          <TabList mb={4}>
            <Tab>Registrations</Tab>
            <Tab>Events</Tab>
            <Tab>Users</Tab>
            <Tab>Payments</Tab>
          </TabList>
          <TabPanels>
            {/* REGISTRATIONS TAB */}
            <TabPanel>
              <Heading size="lg" color="blue.600" mb={4}>Registrations Tab</Heading>
              <Box bg="white" borderRadius="lg" shadow="md" overflow="hidden">
                <Box p={4} borderBottom="1px solid" borderColor="gray.200" bg="gray.50">
                  <Flex justify="space-between" align="center">
                    <Text fontWeight="medium" color="gray.700">
                      Registrations ({totalRegistrations})
                    </Text>
                    <Button
                      size="sm"
                      colorScheme="green"
                      variant="outline"
                      onClick={() => handleExportCSV('all')}
                      leftIcon={<Icon as={FaDownload} />}
                    >
                      Export All CSV
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
                        <Box as="th" p={4} textAlign="left" fontWeight="bold" color="gray.700">Type</Box>
                        <Box as="th" p={4} textAlign="left" fontWeight="bold" color="gray.700">Status</Box>
                        <Box as="th" p={4} textAlign="left" fontWeight="bold" color="gray.700">Actions</Box>
                      </Box>
                    </Box>
                    <Box as="tbody">
                      {filteredRegistrations
                        .slice((regPage - 1) * regPageSize, regPage * regPageSize)
                        .map((registration) => (
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
                            <Badge colorScheme={registration.registration_type === 'fresher' ? 'green' : 'purple'}>
                              {registration.registration_type?.toUpperCase() || 'N/A'}
                            </Badge>
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
                {/* Pagination Controls */}
                <HStack justify="space-between" p={4}>
                  <Text color="gray.600" fontSize="sm">
                    Page {regPage} of {Math.max(1, Math.ceil(filteredRegistrations.length / regPageSize))}
                  </Text>
                  <HStack>
                    <Button size="sm" onClick={() => setRegPage(p => Math.max(1, p - 1))} isDisabled={regPage === 1}>Prev</Button>
                    <Button size="sm" onClick={() => setRegPage(p => (p * regPageSize >= filteredRegistrations.length ? p : p + 1))} isDisabled={regPage * regPageSize >= filteredRegistrations.length}>Next</Button>
                  </HStack>
                </HStack>
              </Box>
            </TabPanel>
            {/* EVENTS TAB */}
            <TabPanel>
              <Heading size="lg" color="blue.600" mb={4}>Events Tab</Heading>
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
                                <HStack spacing={2}>
                                  <Badge colorScheme="blue" variant="solid" fontSize="xs">
                                    {event.category?.toUpperCase() || 'GENERAL'}
                                  </Badge>
                                  <Badge 
                                    colorScheme={event.event_type === 'free' ? 'green' : event.event_type === 'paid' ? 'blue' : 'purple'} 
                                    variant="outline" 
                                    fontSize="xs"
                                  >
                                    {event.event_type?.toUpperCase() || 'FREE'}
                                  </Badge>
                                </HStack>
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
                              <VStack align="start" spacing={1}>
                                <HStack>
                                  <Icon as={FaDollarSign} color="green.500" boxSize={3} />
                                  <Text fontSize="sm" fontWeight="medium">
                                    {event.event_type === 'free' ? 'Free' : `₹${event.price || 0}`}
                                  </Text>
                                </HStack>
                                <Text fontSize="xs" color="gray.500">
                                  Capacity: {event.current_registrations}/{event.max_capacity || '∞'}
                                </Text>
                              </VStack>
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
            {/* USERS TAB: Only user_profiles data, no registrations */}
            <TabPanel>
              <Heading size="lg" color="blue.600" mb={4}>Users Tab</Heading>
              <Box bg="white" p={6} borderRadius="lg" shadow="md">
                <Heading size="md" mb={4}>All Registered Users</Heading>
                <Box overflowX="auto">
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ background: '#f7fafc' }}>
                        <th style={{ padding: '8px', border: '1px solid #e2e8f0' }}>Name</th>
                        <th style={{ padding: '8px', border: '1px solid #e2e8f0' }}>Email</th>
                        <th style={{ padding: '8px', border: '1px solid #e2e8f0' }}>Studying Year</th>
                        <th style={{ padding: '8px', border: '1px solid #e2e8f0' }}>Mobile Number</th>
                        <th style={{ padding: '8px', border: '1px solid #e2e8f0' }}>Created At</th>
                        <th style={{ padding: '8px', border: '1px solid #e2e8f0' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.length === 0 ? (
                        <tr>
                          <td colSpan={6} style={{ textAlign: 'center', padding: '16px' }}>
                            <Text color="gray.500">No users found.</Text>
                          </td>
                        </tr>
                      ) : (
                        users
                          .slice((usersPage - 1) * usersPageSize, usersPage * usersPageSize)
                          .map(user => (
                          <tr key={user.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                            <td style={{ padding: '8px', border: '1px solid #e2e8f0' }}>{user.full_name}</td>
                            <td style={{ padding: '8px', border: '1px solid #e2e8f0' }}>{user.email}</td>
                            <td style={{ padding: '8px', border: '1px solid #e2e8f0' }}>{user.studying_year}</td>
                            <td style={{ padding: '8px', border: '1px solid #e2e8f0' }}>{user.mobile_number || '-'}</td>
                            <td style={{ padding: '8px', border: '1px solid #e2e8f0' }}>{new Date(user.created_at).toLocaleString()}</td>
                            <td style={{ padding: '8px', border: '1px solid #e2e8f0' }}>
                              <Button size="sm" colorScheme="red" leftIcon={<Icon as={FaTrash} />} onClick={() => handleDeleteUser(user)}>
                                Delete Account
                              </Button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </Box>
                {/* Users pagination */}
                <HStack justifyContent="space-between" p={4}>
                  <Text color="gray.600" fontSize="sm">
                    Page {usersPage} of {Math.max(1, Math.ceil(users.length / usersPageSize))}
                  </Text>
                  <HStack>
                    <Button size="sm" onClick={() => setUsersPage(p => Math.max(1, p - 1))} isDisabled={usersPage === 1}>Prev</Button>
                    <Button size="sm" onClick={() => setUsersPage(p => (p * usersPageSize >= users.length ? p : p + 1))} isDisabled={usersPage * usersPageSize >= users.length}>Next</Button>
                  </HStack>
                </HStack>
              </Box>
            </TabPanel>
            
            {/* PAYMENTS TAB */}
            <TabPanel>
              <PaymentVerification />
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
                <Text mb={2} fontWeight="medium">Event Name *</Text>
                <Input
                  placeholder="Enter event name"
                  value={eventForm.name}
                  onChange={(e) => setEventForm({ ...eventForm, name: e.target.value })}
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
                  <Text mb={2} fontWeight="medium">Category *</Text>
                  <Select
                    value={eventForm.category}
                    onChange={(e) => setEventForm({ ...eventForm, category: e.target.value })}
                  >
                    <option value="sports">Sports</option>
                    <option value="cultural">Cultural</option>
                    <option value="technical">Technical</option>
                    <option value="academic">Academic</option>
                    <option value="social">Social</option>
                    <option value="general">General</option>
                  </Select>
                </Box>
                <Box flex="1">
                  <Text mb={2} fontWeight="medium">Event Type *</Text>
                  <Select
                    value={eventForm.event_type}
                    onChange={(e) => setEventForm({ ...eventForm, event_type: e.target.value })}
                  >
                    <option value="free">Free</option>
                    <option value="paid">Paid</option>
                    <option value="invitation_only">Invitation Only</option>
                  </Select>
                </Box>
              </HStack>
              
              <HStack w="full" spacing={4}>
                <Box flex="1">
                  <Text mb={2} fontWeight="medium">Date & Time *</Text>
                  <Input
                    type="datetime-local"
                    value={eventForm.event_date}
                    onChange={(e) => setEventForm({ ...eventForm, event_date: e.target.value })}
                  />
                </Box>
                <Box flex="1">
                  <Text mb={2} fontWeight="medium">Registration Deadline</Text>
                  <Input
                    type="datetime-local"
                    value={eventForm.registration_deadline}
                    onChange={(e) => setEventForm({ ...eventForm, registration_deadline: e.target.value })}
                  />
                </Box>
              </HStack>
              
              <HStack w="full" spacing={4}>
                <Box flex="1">
                  <Text mb={2} fontWeight="medium">Location *</Text>
                  <Input
                    placeholder="Enter venue name"
                    value={eventForm.location}
                    onChange={(e) => setEventForm({ ...eventForm, location: e.target.value })}
                  />
                </Box>
                <Box flex="1">
                  <Text mb={2} fontWeight="medium">Max Capacity</Text>
                  <Input
                    type="number"
                    placeholder="100"
                    value={eventForm.max_capacity}
                    onChange={(e) => setEventForm({ ...eventForm, max_capacity: parseInt(e.target.value) || 100 })}
                  />
                </Box>
              </HStack>
              
              <HStack w="full" spacing={4}>
                <Box flex="1">
                  <Text mb={2} fontWeight="medium">Price (₹)</Text>
                  <Input
                    type="number"
                    placeholder="0"
                    value={eventForm.price}
                    onChange={(e) => setEventForm({ ...eventForm, price: parseFloat(e.target.value) || 0 })}
                    disabled={eventForm.event_type === 'free'}
                  />
                </Box>
                <Box flex="1">
                  <Text mb={2} fontWeight="medium">Organizer</Text>
                  <Input
                    placeholder="Event organizer"
                    value={eventForm.organizer}
                    onChange={(e) => setEventForm({ ...eventForm, organizer: e.target.value })}
                  />
                </Box>
              </HStack>

              {/* Year-wise Pricing Options - Always show for all event types */}
              <VStack w="full" spacing={4} align="stretch">
                <Divider />
                <Text fontSize="lg" fontWeight="bold" color="gray.700">Year-wise Pricing Configuration</Text>
                <Text fontSize="sm" color="gray.600" mb={2}>
                  Configure which years get free entry and which years need to pay
                </Text>
                {[1, 2, 3, 4].map(year => (
                  <Box key={year} p={4} border="1px solid" borderColor="gray.200" borderRadius="md">
                    <HStack spacing={4} align="center">
                      <Text w="120px" fontWeight="medium" fontSize="md">
                        {year === 1 ? '1st Year' : year === 2 ? '2nd Year' : year === 3 ? '3rd Year' : 'Final Year'}
                      </Text>
                      <HStack spacing={4}>
                        <HStack spacing={2}>
                          <input
                            type="radio"
                            name={`year_pricing_${year}`}
                            checked={eventForm.year_pricing[year]?.type === 'free'}
                            onChange={() => setEventForm({
                              ...eventForm,
                              year_pricing: {
                                ...eventForm.year_pricing,
                                [year]: { type: 'free', amount: 0 }
                              }
                            })}
                          />
                          <Text fontSize="sm" fontWeight="medium" color="green.600">Free Entry</Text>
                        </HStack>
                        <HStack spacing={2}>
                          <input
                            type="radio"
                            name={`year_pricing_${year}`}
                            checked={eventForm.year_pricing[year]?.type === 'paid'}
                            onChange={() => setEventForm({
                              ...eventForm,
                              year_pricing: {
                                ...eventForm.year_pricing,
                                [year]: { type: 'paid', amount: eventForm.year_pricing[year]?.amount || 99 }
                              }
                            })}
                          />
                          <Text fontSize="sm" fontWeight="medium" color="blue.600">Paid Entry</Text>
                        </HStack>
                        {eventForm.year_pricing[year]?.type === 'paid' && (
                          <HStack spacing={2}>
                            <Text fontSize="sm" color="gray.600">Amount:</Text>
                            <Input
                              type="number"
                              placeholder="99"
                              value={eventForm.year_pricing[year]?.amount || ''}
                              onChange={e => setEventForm({
                                ...eventForm,
                                year_pricing: {
                                  ...eventForm.year_pricing,
                                  [year]: {
                                    ...eventForm.year_pricing[year],
                                    amount: parseFloat(e.target.value) || 0
                                  }
                                }
                              })}
                              width="100px"
                              size="sm"
                            />
                            <Text fontSize="sm" color="gray.600">₹</Text>
                          </HStack>
                        )}
                      </HStack>
                    </HStack>
                  </Box>
                ))}
              </VStack>
              
              <HStack w="full" spacing={4}>
                <Box flex="1">
                  <Text mb={2} fontWeight="medium">Contact Email</Text>
                  <Input
                    type="email"
                    placeholder="contact@college.edu"
                    value={eventForm.contact_email}
                    onChange={(e) => setEventForm({ ...eventForm, contact_email: e.target.value })}
                  />
                </Box>
                <Box flex="1">
                  <Text mb={2} fontWeight="medium">Contact Phone</Text>
                  <Input
                    placeholder="+91 98765 43210"
                    value={eventForm.contact_phone}
                    onChange={(e) => setEventForm({ ...eventForm, contact_phone: e.target.value })}
                  />
                </Box>
              </HStack>
              
              <Box w="full">
                <Text mb={2} fontWeight="medium">Requirements</Text>
                <Input
                  placeholder="Special requirements or instructions"
                  value={eventForm.requirements}
                  onChange={(e) => setEventForm({ ...eventForm, requirements: e.target.value })}
                />
              </Box>
              
              <Box w="full">
                <Text mb={2} fontWeight="medium">Tags</Text>
                <Input
                  placeholder="Enter tags separated by commas (e.g., workshop, beginner, coding)"
                  value={eventForm.tags}
                  onChange={(e) => setEventForm({ ...eventForm, tags: e.target.value })}
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
      <QRScanner isOpen={isQRScannerOpen} onClose={onQRScannerClose} />
    </Box>
  );
};

export default AdminDashboard;
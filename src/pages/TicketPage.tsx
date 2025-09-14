import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Container,
  Heading,
  Text,
  HStack,
  VStack,
  Button,
  Flex,
  Icon,
  Badge,
  Card,
  CardBody,
  CardHeader,
  Divider,
  useToast,
  Alert,
  AlertIcon,
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  FaDownload, 
  FaCalendarAlt, 
  FaMapMarkerAlt, 
  FaClock, 
  FaHome,
  FaGraduationCap,
  FaTicketAlt,
  FaUsers,
  FaDollarSign,
  FaArrowLeft,
} from 'react-icons/fa';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { Registration, Event } from '../lib/supabase';
import QRCode from '../components/QRCode';

const MotionBox = motion(Box);
const MotionButton = motion(Button);

const TicketPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const ticketRef = useRef<HTMLDivElement>(null);
  const toast = useToast();
  
  const [registrationData, setRegistrationData] = useState<Registration | null>(null);
  const [eventData, setEventData] = useState<Event | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Get registration and event data from localStorage or location state
    const storedRegistration = localStorage.getItem('registrationData');
    const storedEvent = localStorage.getItem('eventData');
    
    // Check if data is passed via location state (from EventRegistrationPage)
    if (location.state) {
      const { registration, event, isFresher } = location.state;
      setRegistrationData(registration);
      setEventData(event);
      setIsLoading(false);
    } else if (storedRegistration) {
      // Fallback to localStorage data
      setRegistrationData(JSON.parse(storedRegistration));
      if (storedEvent) {
        setEventData(JSON.parse(storedEvent));
      }
      setIsLoading(false);
    } else {
      navigate('/my-tickets');
    }
  }, [navigate, location.state]);

  const downloadAsPNG = async () => {
    if (!ticketRef.current) return;

    try {
      const canvas = await html2canvas(ticketRef.current, {
        backgroundColor: '#ffffff',
        scale: 2,
        useCORS: true,
      });
      
      const link = document.createElement('a');
      link.download = `freshers-party-ticket-${registrationData?.id}.png`;
      link.href = canvas.toDataURL();
      link.click();
      
      toast({
        title: 'Download Successful!',
        description: 'Your ticket has been downloaded as PNG',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Error downloading PNG:', error);
      toast({
        title: 'Download Failed',
        description: 'Failed to download ticket. Please try again.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const downloadAsPDF = async () => {
    if (!ticketRef.current) return;

    try {
      const canvas = await html2canvas(ticketRef.current, {
        backgroundColor: '#ffffff',
        scale: 2,
        useCORS: true,
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      const imgWidth = 210;
      const pageHeight = 295;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      
      let position = 0;
      
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
      
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }
      
      pdf.save(`freshers-party-ticket-${registrationData?.id}.pdf`);
      
      toast({
        title: 'Download Successful!',
        description: 'Your ticket has been downloaded as PDF',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Error downloading PDF:', error);
      toast({
        title: 'Download Failed',
        description: 'Failed to download ticket. Please try again.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
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

  if (isLoading) {
    return (
      <Box minH="100vh" bg="linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)" display="flex" alignItems="center" justifyContent="center">
        <VStack spacing={4}>
          <Text color="white" fontSize="lg">Loading your ticket...</Text>
        </VStack>
      </Box>
    );
  }

  if (!registrationData) {
    return (
      <Box minH="100vh" bg="linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)" display="flex" alignItems="center" justifyContent="center">
        <VStack spacing={4}>
          <Text color="white" fontSize="lg">No ticket data found</Text>
          <Button onClick={() => navigate('/my-tickets')}>Back to Dashboard</Button>
        </VStack>
      </Box>
    );
  }

  return (
    <Box minH="100vh" bg="linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)" position="relative" overflow="hidden">
      {/* Animated Background Elements */}
      {[...Array(6)].map((_, i) => (
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
            ease: "linear"
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

      <Container maxW="4xl" py={12} position="relative" zIndex={2}>
        {/* Header */}
        <MotionBox
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
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
              _hover={{ bg: 'rgba(255,255,255,0.1)' }}
              onClick={() => navigate('/my-tickets')}
              leftIcon={<Icon as={FaArrowLeft} />}
            >
              Back to Dashboard
            </Button>
          </Flex>

          <VStack spacing={4} align="center" textAlign="center">
            <Heading
              as="h1"
              size="2xl"
              color="white"
              fontWeight="900"
            >
              Your Event Ticket
            </Heading>
            <Text
              fontSize="lg"
              color="rgba(255,255,255,0.8)"
              maxW="600px"
            >
              Show this ticket at the entrance to enter the event! 🎉
            </Text>
          </VStack>
        </MotionBox>

        {/* Ticket Card */}
        <MotionBox
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          ref={ticketRef}
          bg="white"
          borderRadius="2xl"
          boxShadow="0 20px 40px rgba(0,0,0,0.1)"
          overflow="hidden"
          mb={6}
        >
          {/* Ticket Header */}
          <Box
            bg="linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)"
            p={6}
            textAlign="center"
          >
            <Heading size="xl" color="white" mb={2}>
              {eventData?.name || 'College Event'}
            </Heading>
            <Text color="white" fontSize="lg" opacity={0.9}>
              {eventData?.description || 'Welcome to our exciting event!'}
            </Text>
          </Box>

          {/* Ticket Content */}
          <Box p={8}>
            <VStack spacing={6} align="stretch">
              {/* Event Details */}
              {eventData && (
                <VStack spacing={4} align="stretch">
                  <HStack align="center" w="full" justify="space-between" gap={4}>
                    <Icon as={FaCalendarAlt} color="pink.400" boxSize={5} />
                    <Text fontSize="lg" fontWeight="bold" color="gray.700">
                      {formatEventDate(eventData.event_date)}
                    </Text>
                  </HStack>
                  
                  <HStack align="center" w="full" justify="space-between" gap={4}>
                    <Icon as={FaClock} color="blue.400" boxSize={5} />
                    <Text fontSize="lg" fontWeight="bold" color="gray.700">
                      {formatEventTime(eventData.event_date)}
                    </Text>
                  </HStack>
                  
                  {eventData.location && (
                    <HStack align="center" w="full" justify="space-between" gap={4}>
                      <Icon as={FaMapMarkerAlt} color="green.400" boxSize={5} />
                      <Text fontSize="lg" fontWeight="bold" color="gray.700">
                        {eventData.location}
                      </Text>
                    </HStack>
                  )}

                  <HStack align="center" w="full" justify="space-between" gap={4}>
                    <Icon as={FaUsers} color="purple.400" boxSize={5} />
                    <Text fontSize="lg" fontWeight="bold" color="gray.700">
                      {eventData.current_registrations}/{eventData.max_capacity || '∞'} registered
                    </Text>
                  </HStack>
                </VStack>
              )}

              <Divider borderColor="gray.200" />

              {/* Registration Details */}
              <VStack spacing={4} align="stretch">
                <Heading size="md" color="gray.700" textAlign="center">
                  Registration Details
                </Heading>
                
                <HStack justify="space-between" w="full">
                  <Text fontWeight="bold" color="gray.600">Name:</Text>
                  <Text color="gray.800" textAlign="right" maxW="200px" overflow="hidden" textOverflow="ellipsis" whiteSpace="nowrap">
                    {registrationData.full_name}
                  </Text>
                </HStack>
                
                <HStack justify="space-between" w="full">
                  <Text fontWeight="bold" color="gray.600">Email:</Text>
                  <Text color="gray.800" textAlign="right" maxW="200px" overflow="hidden" textOverflow="ellipsis" whiteSpace="nowrap">
                    {registrationData.email}
                  </Text>
                </HStack>
                
                <HStack justify="space-between" w="full">
                  <Text fontWeight="bold" color="gray.600">Mobile:</Text>
                  <Text color="gray.800">{registrationData.mobile_number}</Text>
                </HStack>
                
                <HStack justify="space-between" w="full">
                  <Text fontWeight="bold" color="gray.600">Year:</Text>
                  <HStack spacing={2}>
                    <Text color="gray.800">Year {registrationData.studying_year}</Text>
                    <Badge 
                      colorScheme={registrationData.registration_type === 'fresher' ? 'green' : 'blue'}
                      fontSize="xs"
                    >
                      {registrationData.registration_type === 'fresher' ? 'Fresher' : 'Senior'}
                    </Badge>
                  </HStack>
                </HStack>
                
                <HStack justify="space-between" w="full">
                  <Text fontWeight="bold" color="gray.600">Status:</Text>
                  <Badge 
                    colorScheme={
                      registrationData.registration_type === 'fresher' 
                        ? 'green' 
                        : (registrationData as any).payment_status === 'completed' 
                          ? 'green' 
                          : 'red'
                    }
                    fontSize="sm"
                  >
                    {registrationData.registration_type === 'fresher' 
                      ? 'Confirmed' 
                      : (registrationData as any).payment_status === 'completed' 
                        ? 'Paid' 
                        : 'Pending Payment'
                    }
                  </Badge>
                </HStack>

                {/* Payment Amount for Seniors */}
                {registrationData.registration_type === 'senior' && (registrationData as any).amount_paid && (
                  <HStack justify="space-between" w="full">
                    <Text fontWeight="bold" color="gray.600">Amount Paid:</Text>
                    <HStack spacing={1} color="green.600">
                      <Icon as={FaDollarSign} />
                      <Text fontWeight="bold">₹{(registrationData as any).amount_paid}</Text>
                    </HStack>
                  </HStack>
                )}
              </VStack>

              <Divider borderColor="gray.200" />

              {/* QR Code */}
              <VStack spacing={4} align="center">
                <Heading size="md" color="gray.700" textAlign="center">
                  Entry QR Code
                </Heading>
                
                <Box
                  p={4}
                  border="2px solid"
                  borderColor="gray.200"
                  borderRadius="lg"
                  bg="white"
                  display="flex"
                  justifyContent="center"
                  alignItems="center"
                  w="200px"
                  h="200px"
                >
                  <QRCode 
                    value={`REG:${registrationData.id}:${registrationData.email}:${eventData?.id || 'unknown'}`}
                    size={180}
                  />
                </Box>
                
                <Text fontSize="sm" color="gray.500" textAlign="center">
                  Scan this QR code at the entrance
                </Text>
                <Text fontSize="xs" color="gray.400" textAlign="center">
                  Registration ID: {registrationData.id}
                </Text>
              </VStack>

              {/* Important Notes */}
              <Box p={4} bg="blue.50" borderRadius="lg" w="full" border="1px solid" borderColor="blue.200">
                <Text fontWeight="bold" fontSize="sm" color="blue.800" mb={2}>
                  Important Instructions:
                </Text>
                <Text fontSize="sm" color="blue.700">
                  • Bring a valid ID along with this ticket<br />
                  • Arrive 15 minutes before the event starts<br />
                  • Keep this ticket safe - no re-entry without it
                </Text>
              </Box>
            </VStack>
          </Box>
        </MotionBox>

        {/* Action Buttons */}
        <MotionBox
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <VStack spacing={6} align="stretch">
            <HStack w="full" maxW="500px" mx="auto" gap={4}>
              <Button
                size="lg"
                flex="1"
                bg="#4ade80"
                color="white"
                _hover={{ 
                  bg: "#22c55e",
                  transform: "translateY(-2px)",
                  boxShadow: "0 8px 25px rgba(0,0,0,0.15)"
                }}
                leftIcon={<Icon as={FaDownload} />}
                onClick={downloadAsPNG}
                py={6}
                fontSize="lg"
                fontWeight="bold"
              >
                Download PNG
              </Button>
              
              <Button
                variant="outline"
                size="lg"
                flex="1"
                color="white"
                borderColor="white"
                _hover={{ 
                  bg: "rgba(255,255,255,0.1)",
                  transform: "translateY(-2px)",
                  boxShadow: "0 8px 25px rgba(0,0,0,0.15)"
                }}
                leftIcon={<Icon as={FaDownload} />}
                onClick={downloadAsPDF}
                py={6}
                fontSize="lg"
                fontWeight="bold"
              >
                Download PDF
              </Button>
            </HStack>
            
            <Button
              variant="outline"
              color="white"
              borderColor="white"
              _hover={{ bg: 'rgba(255,255,255,0.1)' }}
              onClick={() => navigate('/my-tickets')}
              leftIcon={<Icon as={FaHome} />}
              maxW="300px"
              mx="auto"
            >
              Back to Dashboard
            </Button>
          </VStack>
        </MotionBox>
      </Container>
    </Box>
  );
};

export default TicketPage;
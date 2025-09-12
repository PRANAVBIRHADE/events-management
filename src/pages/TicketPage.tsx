import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Container,
  Heading,
  Text,
  HStack,
  Button,
  Flex,
  Icon,
  Badge,
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { FaDownload, FaCalendarAlt, FaMapMarkerAlt, FaMusic, FaHome } from 'react-icons/fa';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { Registration } from '../lib/supabase';

const MotionBox = motion(Box);
const MotionButton = motion(Button);

const TicketPage: React.FC = () => {
  const navigate = useNavigate();
  const ticketRef = useRef<HTMLDivElement>(null);
  
  const [registrationData, setRegistrationData] = useState<Registration | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    // Get registration data from localStorage
    const storedData = localStorage.getItem('registrationData');
    if (storedData) {
      const data = JSON.parse(storedData);
      setRegistrationData(data);
      setIsLoading(false);
    } else {
      navigate('/');
    }
  }, [navigate]);

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 3000);
  };

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
      
      showMessage('success', 'Your ticket has been downloaded as PNG');
    } catch (error) {
      console.error('Error downloading PNG:', error);
      showMessage('error', 'Failed to download ticket. Please try again.');
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
      
      showMessage('success', 'Your ticket has been downloaded as PDF');
    } catch (error) {
      console.error('Error downloading PDF:', error);
      showMessage('error', 'Failed to download ticket. Please try again.');
    }
  };

  const handleGoHome = () => {
    navigate('/');
  };

  if (isLoading) {
    return (
      <Box minH="100vh" bg="linear-gradient(135deg, #667eea 0%, #764ba2 100%)" display="flex" alignItems="center" justifyContent="center">
        <Flex direction="column" align="center" gap={4}>
          <Text color="white" fontSize="lg">Loading your ticket...</Text>
        </Flex>
      </Box>
    );
  }

  if (!registrationData) {
    return (
      <Box minH="100vh" bg="linear-gradient(135deg, #667eea 0%, #764ba2 100%)" display="flex" alignItems="center" justifyContent="center">
        <Flex direction="column" align="center" gap={4}>
          <Text color="white" fontSize="lg">No ticket data found</Text>
          <Button onClick={handleGoHome}>Go Home</Button>
        </Flex>
      </Box>
    );
  }

  return (
    <Box minH="100vh" bg="linear-gradient(135deg, #667eea 0%, #764ba2 100%)" py={8}>
      <Container maxW="container.lg">
        <MotionBox
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Message Display */}
          {message.text && (
            <Box
              p={4}
              mb={4}
              bg={message.type === 'success' ? 'green.50' : 'red.50'}
              borderRadius="lg"
              border="1px solid"
              borderColor={message.type === 'success' ? 'green.200' : 'red.200'}
            >
              <Text color={message.type === 'success' ? 'green.600' : 'red.600'} fontSize="sm">
                {message.text}
              </Text>
            </Box>
          )}

          {/* Header */}
          <Flex direction="column" align="center" gap={6} mb={8}>
            <Heading
              as="h1"
              size="2xl"
              color="white"
              textAlign="center"
              textShadow="0 2px 4px rgba(0,0,0,0.3)"
            >
              Your Party Ticket
            </Heading>
            
            <Text
              color="white"
              fontSize="lg"
              textAlign="center"
              textShadow="0 1px 2px rgba(0,0,0,0.3)"
            >
              Show this ticket at the entrance to enter the party! 🎉
            </Text>
          </Flex>

          {/* Ticket Card */}
          <MotionBox
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            ref={ticketRef}
            bg="white"
            borderRadius="xl"
            boxShadow="0 20px 40px rgba(0,0,0,0.1)"
            overflow="hidden"
            mb={6}
          >
            {/* Ticket Header */}
            <Box
              bg="linear-gradient(135deg, #ff0080, #00ffff, #00ff00)"
              p={6}
              textAlign="center"
            >
              <Heading size="xl" color="white" mb={2}>
                Fresher's Party 2K25
              </Heading>
              <Text color="white" fontSize="lg" opacity={0.9}>
                Welcome to the Ultimate Welcome Party!
              </Text>
            </Box>

            {/* Ticket Content */}
            <Box p={8}>
              <Flex direction="column" gap={6}>
                {/* Event Details */}
                <Flex direction="column" gap={4} w="full">
                  <HStack align="center" w="full" justify="space-between" gap={4}>
                    <Icon as={FaCalendarAlt} color="pink.400" boxSize={5} />
                    <Text fontSize="lg" fontWeight="bold" color="gray.700">
                      Saturday, 15th March 2025
                    </Text>
                  </HStack>
                  
                  <HStack align="center" w="full" justify="space-between" gap={4}>
                    <Icon as={FaMapMarkerAlt} color="blue.400" boxSize={5} />
                    <Text fontSize="lg" fontWeight="bold" color="gray.700">
                      University Auditorium
                    </Text>
                  </HStack>
                  
                  <HStack align="center" w="full" justify="space-between" gap={4}>
                    <Icon as={FaMusic} color="green.400" boxSize={5} />
                    <Text fontSize="lg" fontWeight="bold" color="gray.700">
                      7:00 PM - 11:00 PM
                    </Text>
                  </HStack>
                </Flex>

                <Box h="1px" bg="gray.200" w="full" />

                {/* Registration Details */}
                <Flex direction="column" gap={4} w="full">
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
                    <Text color="gray.800">{registrationData.studying_year} Year</Text>
                  </HStack>
                  
                  <HStack justify="space-between" w="full">
                    <Text fontWeight="bold" color="gray.600">Type:</Text>
                    <Badge 
                      colorScheme={registrationData.registration_type === 'fresher' ? 'green' : 'blue'}
                      fontSize="sm"
                    >
                      {registrationData.registration_type === 'fresher' ? 'Fresher' : 'Visitor'}
                    </Badge>
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
                </Flex>

                <Box h="1px" bg="gray.200" w="full" />

                {/* QR Code */}
                <Flex direction="column" align="center" gap={4}>
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
                    <Text fontSize="sm" color="gray.500" textAlign="center">
                      QR Code<br />
                      {registrationData.qr_code || registrationData.id}
                    </Text>
                  </Box>
                  
                  <Text fontSize="sm" color="gray.500" textAlign="center">
                    Scan this QR code at the entrance
                  </Text>
                </Flex>

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
              </Flex>
            </Box>
          </MotionBox>

          {/* Action Buttons */}
          <MotionBox
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <Flex direction="column" align="center" gap={4}>
              <HStack w="full" maxW="500px" gap={4}>
                <Button
                  variant="solid"
                  size="lg"
                  flex="1"
                  onClick={downloadAsPNG}
                  bg="linear-gradient(135deg, #ff0080, #00ffff)"
                  color="white"
                  _hover={{
                    bg: "linear-gradient(135deg, #00ffff, #ff0080)",
                    transform: "scale(1.02)",
                  }}
                  _active={{
                    transform: "scale(0.98)",
                  }}
                  transition="all 0.3s ease"
                >
                  <Icon as={FaDownload} mr={2} />
                  Download PNG
                </Button>
                
                <Button
                  variant="outline"
                  size="lg"
                  flex="1"
                  onClick={downloadAsPDF}
                  borderColor="blue.400"
                  color="blue.400"
                  _hover={{
                    bg: "blue.400",
                    color: "white",
                    transform: "scale(1.02)",
                  }}
                  _active={{
                    transform: "scale(0.98)",
                  }}
                  transition="all 0.3s ease"
                >
                  <Icon as={FaDownload} mr={2} />
                  Download PDF
                </Button>
              </HStack>
              
              <Button
                variant="ghost"
                color="white"
                onClick={handleGoHome}
                _hover={{
                  transform: "scale(1.05)",
                }}
                _active={{
                  transform: "scale(0.95)",
                }}
                transition="all 0.3s ease"
              >
                <Icon as={FaHome} mr={2} />
                Back to Home
              </Button>
            </Flex>
          </MotionBox>
        </MotionBox>
      </Container>
    </Box>
  );
};

export default TicketPage;
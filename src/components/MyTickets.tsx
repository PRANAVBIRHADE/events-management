import React from 'react';
import {
  VStack,
  HStack,
  Heading,
  Text,
  Badge,
  Icon,
  Button,
  Card,
  CardBody,
  CardHeader,
  SimpleGrid,
  Alert,
  AlertIcon,
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import {
  FaUser,
  FaEnvelope,
  FaPhone,
  FaGraduationCap,
  FaQrcode,
  FaDownload,
  FaTicketAlt,
} from 'react-icons/fa';

const MotionCard = motion(Card);

// Props type for MyTickets
interface MyTicketsProps {
  registrations: any[];
  downloadTicket: (registration: any) => void;
  navigate: (path: string) => void;
}

const MyTickets: React.FC<MyTicketsProps> = ({ registrations, downloadTicket, navigate }) => {
  return (
    <VStack spacing={6} align="stretch">
      <Heading size="lg" color="gray.800">
        🎫 My Tickets
      </Heading>
      {registrations.length === 0 ? (
        <Alert status="info" borderRadius="lg">
          <AlertIcon />
          You haven't registered for any events yet. Browse events above to get started!
        </Alert>
      ) : (
        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
          {registrations.map((registration, index) => (
            <MotionCard
              key={registration.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              variant="outline"
              bg={
                registration.registration_type === 'fresher'
                  ? 'green.50'
                  : (registration as any).payment_status === 'completed'
                    ? 'green.50'
                    : 'yellow.50'
              }
              borderColor={
                registration.registration_type === 'fresher'
                  ? 'green.200'
                  : (registration as any).payment_status === 'completed'
                    ? 'green.200'
                    : 'yellow.200'
              }
            >
              <CardHeader>
                <VStack spacing={2} align="start">
                  <Heading size="md" color="gray.800">
                    {registration.event?.name || 'Event'}
                  </Heading>
                  <HStack>
                    <Badge
                      colorScheme={
                        registration.registration_type === 'fresher'
                          ? 'green'
                          : (registration as any).payment_status === 'completed'
                            ? 'green'
                            : 'yellow'
                      }
                      fontSize="sm"
                    >
                      {registration.registration_type === 'fresher'
                        ? 'Confirmed'
                        : (registration as any).payment_status === 'completed'
                          ? 'Confirmed'
                          : 'Pending Payment'
                      }
                    </Badge>
                    <Badge colorScheme="blue" fontSize="sm">
                      {registration.registration_type === 'fresher' ? 'Fresher' : 'Senior'}
                    </Badge>
                  </HStack>
                </VStack>
              </CardHeader>
              <CardBody pt={0}>
                <VStack spacing={4} align="stretch">
                  <HStack spacing={2} color="gray.500" fontSize="sm">
                    <Icon as={FaUser} />
                    <Text>{registration.full_name}</Text>
                  </HStack>
                  <HStack spacing={2} color="gray.500" fontSize="sm">
                    <Icon as={FaEnvelope} />
                    <Text>{registration.email}</Text>
                  </HStack>
                  <HStack spacing={2} color="gray.500" fontSize="sm">
                    <Icon as={FaPhone} />
                    <Text>{registration.mobile_number}</Text>
                  </HStack>
                  <HStack spacing={2} color="gray.500" fontSize="sm">
                    <Icon as={FaGraduationCap} />
                    <Text>Year {registration.studying_year}</Text>
                  </HStack>
                  {(registration.registration_type === 'fresher' || (registration as any).payment_status === 'completed') && (
                    <HStack spacing={2}>
                      <Button
                        size="sm"
                        variant="outline"
                        leftIcon={<Icon as={FaQrcode} />}
                        onClick={() => {/* Show QR code */}}
                      >
                        View QR
                      </Button>
                      <Button
                        size="sm"
                        colorScheme="blue"
                        leftIcon={<Icon as={FaDownload} />}
                        onClick={() => downloadTicket(registration)}
                      >
                        Download
                      </Button>
                    </HStack>
                  )}
                  {registration.registration_type === 'senior' && (registration as any).payment_status !== 'completed' && (
                    <Button
                      size="sm"
                      colorScheme="green"
                      onClick={() => {
                        localStorage.setItem('registrationData', JSON.stringify(registration));
                        navigate('/payment');
                      }}
                    >
                      Complete Payment
                    </Button>
                  )}
                </VStack>
              </CardBody>
            </MotionCard>
          ))}
        </SimpleGrid>
      )}
    </VStack>
  );
};

export default MyTickets;

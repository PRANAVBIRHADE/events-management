import React from 'react';
import {
  Card,
  CardBody,
  CardHeader,
  VStack,
  HStack,
  Heading,
  Text,
  Badge,
  Icon,
  Button,
  Divider,
  useBreakpointValue,
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import {
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaClock,
  FaDollarSign,
  FaUsers,
  FaTicketAlt,
  FaGraduationCap,
} from 'react-icons/fa';
import { Event } from '../lib/supabase';

// Props type for EventCard
interface EventCardProps {
  event: Event;
  userProfile?: { studying_year: number } | null;
  onRegister?: (event: Event) => void;
  isRegistering?: boolean;
  showRegisterButton?: boolean;
}

const MotionCard = motion(Card);

// Helper to calculate price based on event and user year
function getEventPrice(event: Event, userProfile?: { studying_year: number } | null) {
  if (!userProfile) return event.price || 0;
  const year = userProfile.studying_year;
  if (event.free_for_years && event.free_for_years.includes(year)) return 0;
  if (event.paid_for_years && event.paid_for_years.includes(year)) {
    if (event.pricing_type === 'year_based' && event.year_specific_pricing) {
      return event.year_specific_pricing[year] || event.base_price || event.price || 0;
    }
    return event.base_price || event.price || 0;
  }
  return event.price || 0;
}

const EventCard: React.FC<EventCardProps> = ({
  event,
  userProfile,
  onRegister,
  isRegistering = false,
  showRegisterButton = true,
}) => {
  const isMobile = useBreakpointValue({ base: true, md: false });
  const price = getEventPrice(event, userProfile);

  return (
    <MotionCard
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      variant="outline"
      bg="rgba(255,255,255,0.1)"
      backdropFilter="blur(10px)"
      border="1px solid rgba(255,255,255,0.2)"
      _hover={{ shadow: 'lg', transform: 'translateY(-2px)', bg: 'rgba(255,255,255,0.15)' }}
      cursor={showRegisterButton && onRegister ? 'pointer' : 'default'}
    >
      <CardHeader>
        <VStack spacing={2} align="start">
          <HStack>
            <Badge colorScheme="blue" fontSize="sm">
              {new Date(event.event_date).toLocaleDateString()}
            </Badge>
            <Badge colorScheme={event.event_type === 'free' ? 'green' : 'blue'} fontSize="sm">
              {event.event_type.toUpperCase()}
            </Badge>
            {userProfile && (
              <Badge colorScheme={price === 0 ? 'green' : 'yellow'} fontSize="sm">
                {price === 0 ? 'FREE' : `₹${price}`}
              </Badge>
            )}
          </HStack>
          <Heading size="md" color="white" noOfLines={2}>
            {event.name}
          </Heading>
          {event.description && (
            <Text color="rgba(255,255,255,0.8)" fontSize="sm" noOfLines={3}>
              {event.description}
            </Text>
          )}
        </VStack>
      </CardHeader>
      <CardBody pt={0}>
        <VStack spacing={4} align="stretch">
          <HStack spacing={2} color="rgba(255,255,255,0.7)" fontSize="sm">
            <Icon as={FaMapMarkerAlt} />
            <Text>{event.location}</Text>
          </HStack>
          <HStack spacing={2} color="rgba(255,255,255,0.7)" fontSize="sm">
            <Icon as={FaCalendarAlt} />
            <Text>{new Date(event.event_date).toLocaleString('en-US', {
              weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
            })}</Text>
          </HStack>
          <HStack spacing={2} color="rgba(255,255,255,0.7)" fontSize="sm">
            <Icon as={FaUsers} />
            <Text>{event.current_registrations}/{event.max_capacity || '∞'} registered</Text>
          </HStack>
          <Divider borderColor="rgba(255,255,255,0.2)" />
          {showRegisterButton && onRegister && (
            <Button
              colorScheme="blue"
              leftIcon={<Icon as={FaTicketAlt} />}
              onClick={() => onRegister(event)}
              isLoading={isRegistering}
              loadingText="Registering..."
              size="sm"
              aria-label={`Register for ${event.name}`}
            >
              {price === 0 ? 'Register Free' : `Register - ₹${price}`}
            </Button>
          )}
        </VStack>
      </CardBody>
    </MotionCard>
  );
};

export default EventCard;

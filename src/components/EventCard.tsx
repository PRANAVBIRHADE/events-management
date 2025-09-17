import React from 'react';
import { Box, Heading, Text } from '@chakra-ui/react';

const EventCard: React.FC<{ name: string; description: string }> = ({ name, description }) => (
  <Box borderWidth={1} borderRadius="lg" p={4} mb={4}>
    <Heading size="md">{name}</Heading>
    <Text mt={2}>{description}</Text>
  </Box>
);

export default EventCard;

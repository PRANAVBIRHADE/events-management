import React from 'react';
import { Box, Heading, Text } from '@chakra-ui/react';

const UserProfileCard: React.FC<{ name: string; email: string }> = ({ name, email }) => (
  <Box borderWidth={1} borderRadius="lg" p={4}>
    <Heading size="md">{name}</Heading>
    <Text mt={2}>{email}</Text>
  </Box>
);

export default UserProfileCard;

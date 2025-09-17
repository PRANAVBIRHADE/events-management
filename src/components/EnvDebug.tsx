import React from 'react';
import { Box, Text, VStack, HStack, Badge } from '@chakra-ui/react';

const EnvDebug: React.FC = () => {
  const envVars = {
    NODE_ENV: process.env.NODE_ENV,
    REACT_APP_SUPABASE_URL: process.env.REACT_APP_SUPABASE_URL,
    REACT_APP_SUPABASE_ANON_KEY: process.env.REACT_APP_SUPABASE_ANON_KEY ? 
      `Set (${process.env.REACT_APP_SUPABASE_ANON_KEY.length} chars)` : 'Not set',
    REACT_APP_PHONEPE_MERCHANT_ID: process.env.REACT_APP_PHONEPE_MERCHANT_ID ? 'Set' : 'Not set',
  };

  return (
    <Box p={4} bg="gray.100" borderRadius="md" maxW="600px">
      <Text fontWeight="bold" mb={3}>🔍 Environment Variables Debug</Text>
      <VStack align="stretch" spacing={2}>
        {Object.entries(envVars).map(([key, value]) => (
          <HStack key={key} justify="space-between">
            <Text fontSize="sm" fontFamily="mono">{key}:</Text>
            <Badge colorScheme={value === 'Not set' ? 'red' : 'green'}>
              {value}
            </Badge>
          </HStack>
        ))}
      </VStack>
    </Box>
  );
};

export default EnvDebug;

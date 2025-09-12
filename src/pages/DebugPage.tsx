import React from 'react';
import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  Code,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  List,
  ListItem,
  ListIcon,
} from '@chakra-ui/react';
import { CheckCircleIcon, WarningIcon } from '@chakra-ui/icons';
import { getEnvConfig, validateEnvironment } from '../config/environment';

const DebugPage: React.FC = () => {
  // Use the safe environment config
  const envConfig = getEnvConfig();
  const validation = validateEnvironment();
  const processAvailable = typeof process !== 'undefined';
  
  const envVars: Record<string, string | undefined> = {
    'REACT_APP_SUPABASE_URL': envConfig.supabaseUrl || undefined,
    'REACT_APP_SUPABASE_ANON_KEY': envConfig.supabaseAnonKey || undefined,
    'REACT_APP_PHONEPE_MERCHANT_ID': envConfig.phonepeConfig.merchantId || undefined,
    'REACT_APP_PHONEPE_SALT_KEY': envConfig.phonepeConfig.saltKey || undefined,
    'REACT_APP_PHONEPE_SALT_INDEX': envConfig.phonepeConfig.saltIndex || undefined,
  };

  const requiredVars = ['REACT_APP_SUPABASE_URL', 'REACT_APP_SUPABASE_ANON_KEY'];
  const missingRequired = validation.missing;
  const hasAllRequired = validation.isValid;

  return (
    <Container maxW="container.lg" py={8}>
      <VStack spacing={6} align="stretch">
        <Heading>🐛 Environment Debug Page</Heading>
        
        {!processAvailable ? (
          <Alert status="error">
            <AlertIcon />
            <AlertTitle>Process Not Available!</AlertTitle>
            <AlertDescription>
              The 'process' object is not defined. This indicates a build configuration issue with Create React App.
              Try restarting the development server completely.
            </AlertDescription>
          </Alert>
        ) : hasAllRequired ? (
          <Alert status="success">
            <AlertIcon />
            <AlertTitle>Environment Configuration OK!</AlertTitle>
            <AlertDescription>
              All required environment variables are set.
            </AlertDescription>
          </Alert>
        ) : (
          <Alert status="error">
            <AlertIcon />
            <AlertTitle>Missing Environment Variables!</AlertTitle>
            <AlertDescription>
              Some required environment variables are missing. Check the details below.
            </AlertDescription>
          </Alert>
        )}

        <Box bg="gray.50" p={6} borderRadius="lg">
          <Heading size="md" mb={4}>Environment Variables Status</Heading>
          <List spacing={3}>
            {Object.entries(envVars).map(([key, value]) => {
              const isRequired = requiredVars.includes(key);
              const isSet = !!value;
              
              return (
                <ListItem key={key}>
                  <ListIcon 
                    as={isSet ? CheckCircleIcon : WarningIcon} 
                    color={isSet ? 'green.500' : 'red.500'} 
                  />
                  <Text as="span" fontWeight={isRequired ? 'bold' : 'normal'}>
                    {key}: 
                  </Text>
                  <Code ml={2} colorScheme={isSet ? 'green' : 'red'}>
                    {isSet ? (
                      key.includes('KEY') ? '***HIDDEN***' : value
                    ) : 'NOT SET'}
                  </Code>
                  {isRequired && !isSet && (
                    <Text color="red.500" fontSize="sm" ml={6}>
                      ⚠️ Required for app to work
                    </Text>
                  )}
                </ListItem>
              );
            })}
          </List>
        </Box>

        <Box bg="blue.50" p={6} borderRadius="lg">
          <Heading size="md" mb={4}>Debug Information</Heading>
          <VStack align="stretch" spacing={2}>
            <Text><strong>NODE_ENV:</strong> <Code>
              {envConfig.isDevelopment ? 'development' : envConfig.isProduction ? 'production' : 'unknown'}
            </Code></Text>
            <Text><strong>Current URL:</strong> <Code>{window.location.href}</Code></Text>
            <Text><strong>Process Available:</strong> <Code>{processAvailable ? 'Yes' : 'No'}</Code></Text>
            <Text><strong>Environment Config:</strong> <Code>
              {validation.isValid ? 'Valid' : 'Invalid'}
            </Code></Text>
          </VStack>
        </Box>

        {!hasAllRequired && (
          <Box bg="red.50" p={6} borderRadius="lg" border="1px solid" borderColor="red.200">
            <Heading size="md" mb={4} color="red.800">How to Fix</Heading>
            <VStack align="stretch" spacing={3}>
              <Text color="red.700">
                1. Create a file called <Code>.env.local</Code> in the <Code>freshers-party-2k25/</Code> directory
              </Text>
              <Text color="red.700">
                2. Add the missing environment variables:
              </Text>
              <Box bg="white" p={3} borderRadius="md">
                <Code display="block" whiteSpace="pre-wrap">
{`# Add these lines to your .env.local file:
${missingRequired.map(varName => `${varName}=your_value_here`).join('\n')}`}
                </Code>
              </Box>
              <Text color="red.700">
                3. Restart the development server: <Code>npm start</Code>
              </Text>
              <Text color="red.700">
                4. Check <Code>CREDENTIALS_SETUP.md</Code> for help getting your Supabase credentials
              </Text>
            </VStack>
          </Box>
        )}
      </VStack>
    </Container>
  );
};

export default DebugPage;

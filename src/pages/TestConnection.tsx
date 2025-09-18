import React, { useState } from 'react';
import { Box, Button, Text, VStack, HStack } from '@chakra-ui/react';
import { supabase } from '../lib/supabase';

const TestConnection: React.FC = () => {
  const [results, setResults] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const addResult = (message: string, isError = false) => {
    setResults(prev => [...prev, `${isError ? '❌' : '✅'} ${message}`]);
  };

  const testConnection = async () => {
    setIsLoading(true);
    setResults([]);
    
    try {
      addResult('Starting connection test...');
      
      // Test 1: Basic connection
      addResult('Testing basic connection...');
      const { data, error } = await supabase.from('user_profiles').select('count').limit(1);
      
      if (error) {
        addResult(`Connection failed: ${error.message}`, true);
        return;
      }
      
      addResult('Basic connection successful');
      
      // Test 2: Simple count query
      addResult('Testing count query...');
      const startTime = Date.now();
      const { data: countData, error: countError } = await supabase
        .from('user_profiles')
        .select('*', { count: 'exact', head: true });
      
      const endTime = Date.now();
      addResult(`Count query completed in ${endTime - startTime}ms`);
      
      if (countError) {
        addResult(`Count query failed: ${countError.message}`, true);
      } else {
        addResult(`Count result: ${JSON.stringify(countData)}`);
      }
      
      // Test 3: Simple select query
      addResult('Testing select query...');
      const selectStartTime = Date.now();
      const { data: selectData, error: selectError } = await supabase
        .from('user_profiles')
        .select('id, full_name, email')
        .limit(5);
      
      const selectEndTime = Date.now();
      addResult(`Select query completed in ${selectEndTime - selectStartTime}ms`);
      
      if (selectError) {
        addResult(`Select query failed: ${selectError.message}`, true);
      } else {
        addResult(`Select result: ${JSON.stringify(selectData)}`);
      }
      
      // Test 4: Test admin_users table
      addResult('Testing admin_users query...');
      const adminStartTime = Date.now();
      const { data: adminData, error: adminError } = await supabase
        .from('admin_users')
        .select('id, email')
        .limit(1);
      
      const adminEndTime = Date.now();
      addResult(`Admin query completed in ${adminEndTime - adminStartTime}ms`);
      
      if (adminError) {
        addResult(`Admin query failed: ${adminError.message}`, true);
      } else {
        addResult(`Admin result: ${JSON.stringify(adminData)}`);
      }
      
    } catch (err: any) {
      addResult(`Test failed: ${err.message}`, true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box p={8}>
      <VStack spacing={4} align="stretch">
        <Text fontSize="2xl" fontWeight="bold">Supabase Connection Test</Text>
        
        <Button 
          onClick={testConnection} 
          isLoading={isLoading}
          colorScheme="blue"
          size="lg"
        >
          Test Connection
        </Button>
        
        <Box bg="gray.100" p={4} borderRadius="md">
          <Text fontWeight="bold" mb={2}>Test Results:</Text>
          <VStack align="stretch" spacing={1}>
            {results.map((result, index) => (
              <Text key={index} fontSize="sm" fontFamily="mono">
                {result}
              </Text>
            ))}
          </VStack>
        </Box>
      </VStack>
    </Box>
  );
};

export default TestConnection;

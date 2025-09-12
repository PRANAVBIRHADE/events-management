import React from 'react';
import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  HStack,
  Button,
  Flex,
  SimpleGrid,
  Icon,
  Card,
  CardBody,
  Input,
  Textarea,
  FormControl,
  FormLabel,
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  FaGraduationCap,
  FaArrowLeft,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaClock,
  FaFacebook,
  FaTwitter,
  FaInstagram,
  FaLinkedin
} from 'react-icons/fa';

const MotionBox = motion(Box);
const MotionCard = motion(Card);

const ContactPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Box 
      minH="100vh" 
      bg="linear-gradient(90deg, #1a365d 0%, #2d3748 50%, #553c9a 100%)"
    >
      <Container maxW="container.xl" py={8}>
        {/* Header */}
        <MotionBox
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          mb={8}
        >
          <Flex justify="space-between" align="center" mb={6}>
            <HStack spacing={3}>
              <Icon as={FaGraduationCap} color="#4ade80" boxSize={8} />
              <Text color="white" fontSize="xl" fontWeight="bold">
                St. Xavier's College
              </Text>
            </HStack>
            
            <Button
              variant="outline"
              color="white"
              borderColor="white"
              _hover={{ bg: "rgba(255,255,255,0.1)" }}
              onClick={() => navigate('/')}
              leftIcon={<Icon as={FaArrowLeft} />}
            >
              Back to Home
            </Button>
          </Flex>

          <VStack spacing={4} align="center" textAlign="center">
            <Heading
              as="h1"
              size="2xl"
              color="white"
              fontWeight="900"
            >
              Contact Us
            </Heading>
            <Text
              fontSize="lg"
              color="rgba(255,255,255,0.8)"
              maxW="600px"
            >
              Get in touch with us for any questions, support, or feedback about our events and services.
            </Text>
          </VStack>
        </MotionBox>

        <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={8}>
          {/* Contact Information */}
          <MotionBox
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <VStack spacing={6} align="stretch">
              <Heading size="lg" color="white" mb={4}>
                Get in Touch
              </Heading>

              <Card bg="rgba(255, 255, 255, 0.1)" backdropFilter="blur(10px)" border="1px solid rgba(255, 255, 255, 0.2)">
                <CardBody>
                  <VStack spacing={4} align="stretch">
                    <HStack spacing={4}>
                      <Icon as={FaEnvelope} color="#4ade80" boxSize={5} />
                      <VStack align="start" spacing={0}>
                        <Text color="white" fontWeight="bold">Email</Text>
                        <Text color="rgba(255,255,255,0.7)" fontSize="sm">
                          events@stxaviers.edu
                        </Text>
                      </VStack>
                    </HStack>

                    <HStack spacing={4}>
                      <Icon as={FaPhone} color="#4ade80" boxSize={5} />
                      <VStack align="start" spacing={0}>
                        <Text color="white" fontWeight="bold">Phone</Text>
                        <Text color="rgba(255,255,255,0.7)" fontSize="sm">
                          +91 98765 43210
                        </Text>
                      </VStack>
                    </HStack>

                    <HStack spacing={4}>
                      <Icon as={FaMapMarkerAlt} color="#4ade80" boxSize={5} />
                      <VStack align="start" spacing={0}>
                        <Text color="white" fontWeight="bold">Address</Text>
                        <Text color="rgba(255,255,255,0.7)" fontSize="sm">
                          St. Xavier's College<br />
                          College Road, City Center<br />
                          Mumbai, Maharashtra 400001
                        </Text>
                      </VStack>
                    </HStack>

                    <HStack spacing={4}>
                      <Icon as={FaClock} color="#4ade80" boxSize={5} />
                      <VStack align="start" spacing={0}>
                        <Text color="white" fontWeight="bold">Office Hours</Text>
                        <Text color="rgba(255,255,255,0.7)" fontSize="sm">
                          Monday - Friday: 9:00 AM - 5:00 PM<br />
                          Saturday: 9:00 AM - 1:00 PM<br />
                          Sunday: Closed
                        </Text>
                      </VStack>
                    </HStack>
                  </VStack>
                </CardBody>
              </Card>

              {/* Social Media */}
              <Card bg="rgba(255, 255, 255, 0.1)" backdropFilter="blur(10px)" border="1px solid rgba(255, 255, 255, 0.2)">
                <CardBody>
                  <VStack spacing={4}>
                    <Heading size="md" color="white">
                      Follow Us
                    </Heading>
                    <HStack spacing={4}>
                      <Button
                        variant="outline"
                        color="white"
                        borderColor="white"
                        _hover={{ bg: "rgba(255,255,255,0.1)" }}
                        leftIcon={<Icon as={FaFacebook} />}
                      >
                        Facebook
                      </Button>
                      <Button
                        variant="outline"
                        color="white"
                        borderColor="white"
                        _hover={{ bg: "rgba(255,255,255,0.1)" }}
                        leftIcon={<Icon as={FaTwitter} />}
                      >
                        Twitter
                      </Button>
                      <Button
                        variant="outline"
                        color="white"
                        borderColor="white"
                        _hover={{ bg: "rgba(255,255,255,0.1)" }}
                        leftIcon={<Icon as={FaInstagram} />}
                      >
                        Instagram
                      </Button>
                      <Button
                        variant="outline"
                        color="white"
                        borderColor="white"
                        _hover={{ bg: "rgba(255,255,255,0.1)" }}
                        leftIcon={<Icon as={FaLinkedin} />}
                      >
                        LinkedIn
                      </Button>
                    </HStack>
                  </VStack>
                </CardBody>
              </Card>
            </VStack>
          </MotionBox>

          {/* Contact Form */}
          <MotionBox
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <Card bg="rgba(255, 255, 255, 0.1)" backdropFilter="blur(10px)" border="1px solid rgba(255, 255, 255, 0.2)">
              <CardBody>
                <VStack spacing={6} align="stretch">
                  <Heading size="lg" color="white">
                    Send us a Message
                  </Heading>

                  <FormControl>
                    <FormLabel color="white">Name</FormLabel>
                    <Input
                      placeholder="Your full name"
                      bg="white"
                      color="gray.800"
                    />
                  </FormControl>

                  <FormControl>
                    <FormLabel color="white">Email</FormLabel>
                    <Input
                      type="email"
                      placeholder="your.email@example.com"
                      bg="white"
                      color="gray.800"
                    />
                  </FormControl>

                  <FormControl>
                    <FormLabel color="white">Subject</FormLabel>
                    <Input
                      placeholder="What's this about?"
                      bg="white"
                      color="gray.800"
                    />
                  </FormControl>

                  <FormControl>
                    <FormLabel color="white">Message</FormLabel>
                    <Textarea
                      placeholder="Tell us more about your inquiry..."
                      rows={5}
                      bg="white"
                      color="gray.800"
                    />
                  </FormControl>

                  <Button
                    bg="#4ade80"
                    color="white"
                    _hover={{ bg: "#22c55e" }}
                    size="lg"
                    leftIcon={<Icon as={FaEnvelope} />}
                  >
                    Send Message
                  </Button>
                </VStack>
              </CardBody>
            </Card>
          </MotionBox>
        </SimpleGrid>
      </Container>
    </Box>
  );
};

export default ContactPage;

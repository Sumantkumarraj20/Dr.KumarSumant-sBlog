// pages/contact.tsx
"use client";

import { useState, useEffect } from "react";
import Layout from "../components/Layout";
import { supabase } from "../lib/supabaseClient";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { GetStaticProps } from "next";
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Heading,
  Text,
  VStack,
  HStack,
  useToast,
  Icon,
  Alert,
  AlertIcon,
  Card,
  CardBody,
  Flex,
  Avatar,
  Badge,
  useColorModeValue,
  ScaleFade,
  Collapse,
} from "@chakra-ui/react";
import {
  UserIcon,
  EnvelopeIcon,
  ChatBubbleLeftEllipsisIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import { useAuth } from "@/context/authContext";

interface ContactFormData {
  name: string;
  email: string;
  message: string;
  user_id?: string;
}

export default function Contact() {
  const { user, profile, loading: authLoading } = useAuth();
  const [formData, setFormData] = useState<ContactFormData>({
    name: "",
    email: "",
    message: "",
    user_id: undefined,
  });
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [showUserInfo, setShowUserInfo] = useState(false);

  const toast = useToast();

  // Auto-fill form for authenticated users
  useEffect(() => {
    if (user && profile && !authLoading) {
      setFormData(prev => ({
        ...prev,
        name: profile.full_name || user.user_metadata?.full_name || user.email?.split('@')[0] || "",
        email: user.email || "",
        user_id: user.id,
      }));
      setShowUserInfo(true);
    }
  }, [user, profile, authLoading]);

  const handleInputChange = (field: keyof ContactFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const validateForm = (): boolean => {
    if (!formData.name.trim()) {
      toast({
        title: "Name required",
        description: "Please enter your name",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return false;
    }

    if (!formData.email.trim()) {
      toast({
        title: "Email required",
        description: "Please enter your email address",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast({
        title: "Invalid email",
        description: "Please enter a valid email address",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return false;
    }

    if (!formData.message.trim()) {
      toast({
        title: "Message required",
        description: "Please enter your message",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return false;
    }

    if (formData.message.trim().length < 10) {
      toast({
        title: "Message too short",
        description: "Please provide more details in your message (minimum 10 characters)",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return false;
    }

    return true;
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setStatus("sending");
    
    try {
      const { error } = await supabase
        .from("contacts")
        .insert([{
          name: formData.name.trim(),
          email: formData.email.trim().toLowerCase(),
          message: formData.message.trim(),
          user_id: formData.user_id || null, // Include user_id if available
        }]);

      if (error) throw error;

      setStatus("sent");
      
      // Reset form but keep user info for authenticated users
      setFormData(prev => ({
        ...prev,
        message: "", // Only clear the message
      }));

      toast({
        title: "Message sent successfully! 🎉",
        description: user 
          ? "We'll get back to you soon using your registered email."
          : "We'll review your message and get back to you soon.",
        status: "success",
        duration: 5000,
        isClosable: true,
        position: "top-right",
      });
    } catch (err) {
      console.error("Error sending message:", err);
      setStatus("error");
      
      toast({
        title: "Failed to send message",
        description: "Please try again later or contact us directly.",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "top-right",
      });
    }
  }

  const cardBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const accentColor = useColorModeValue("blue.500", "blue.300");
  const successColor = useColorModeValue("green.500", "green.300");

  // Show loading state while checking authentication
  if (authLoading) {
    return (
      <Layout>
        <Box maxW="3xl" mx="auto" px={6} py={16}>
          <Card bg={cardBg} shadow="2xl" rounded="2xl" borderWidth="1px" borderColor={borderColor}>
            <CardBody p={10}>
              <Flex justify="center" align="center" minH="400px">
                <VStack spacing={4}>
                  <Box className="animate-spin">
                    <Icon as={EnvelopeIcon} w={8} h={8} color={accentColor} />
                  </Box>
                  <Text color="gray.600">Loading contact form...</Text>
                </VStack>
              </Flex>
            </CardBody>
          </Card>
        </Box>
      </Layout>
    );
  }

  return (
    <Layout>
      <Box maxW="3xl" mx="auto" px={6} py={16}>
        <ScaleFade in initialScale={0.95}>
          <Card 
            bg={cardBg} 
            shadow="2xl" 
            rounded="2xl" 
            borderWidth="1px" 
            borderColor={borderColor}
            position="relative"
            overflow="hidden"
          >
            {/* Decorative accent */}
            <Box
              position="absolute"
              top="0"
              left="0"
              right="0"
              h="4px"
              bgGradient="linear(to-r, blue.500, purple.500)"
            />
            
            <CardBody p={10}>
              {/* Header Section */}
              <VStack spacing={4} align="start" mb={8}>
                <Heading as="h2" size="2xl" fontWeight="bold">
                  Contact Us
                </Heading>
                <Text fontSize="lg" color="gray.600" lineHeight="tall">
                  {user 
                    ? "Welcome back! Your details are pre-filled. How can we help you today?"
                    : "Got a question, idea, or feedback? Drop us a message and we'll get back to you soon."
                  }
                </Text>
              </VStack>

              {/* User Info Badge for Authenticated Users */}
              <Collapse in={showUserInfo}>
                {user && (
                  <Alert status="info" mb={6} rounded="lg" variant="left-accent">
                    <AlertIcon />
                    <VStack align="start" spacing={1}>
                      <HStack>
                        <Avatar 
                          size="sm" 
                          name={formData.name} 
                          src={profile?.avatar_url || user.user_metadata?.avatar_url} 
                        />
                        <Text fontWeight="medium">Signed in as {formData.name}</Text>
                        <Badge colorScheme="green" fontSize="xs">
                          Verified
                        </Badge>
                      </HStack>
                      <Text fontSize="sm" color="gray.600">
                        We'll use your registered email: {formData.email}
                      </Text>
                    </VStack>
                  </Alert>
                )}
              </Collapse>

              <form onSubmit={handleSubmit}>
                <VStack spacing={6} align="stretch">
                  {/* Name Field - Conditionally Editable */}
                  <FormControl isRequired>
                    <FormLabel fontSize="sm" fontWeight="medium" color="gray.700">
                      Full Name
                    </FormLabel>
                    <HStack>
                      <Icon as={UserIcon} w={5} h={5} color="gray.400" />
                      <Input
                        value={formData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        placeholder="Your full name"
                        isDisabled={!!user} // Disable for authenticated users
                        bg={user ? "gray.50" : "white"}
                        _disabled={{ 
                          bg: "gray.50", 
                          color: "gray.700",
                          cursor: "not-allowed" 
                        }}
                      />
                    </HStack>
                    {user && (
                      <Text fontSize="xs" color="gray.500" mt={1}>
                        Name is taken from your profile
                      </Text>
                    )}
                  </FormControl>

                  {/* Email Field - Conditionally Editable */}
                  <FormControl isRequired>
                    <FormLabel fontSize="sm" fontWeight="medium" color="gray.700">
                      Email Address
                    </FormLabel>
                    <HStack>
                      <Icon as={EnvelopeIcon} w={5} h={5} color="gray.400" />
                      <Input
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        placeholder="your.email@example.com"
                        isDisabled={!!user} // Disable for authenticated users
                        bg={user ? "gray.50" : "white"}
                        _disabled={{ 
                          bg: "gray.50", 
                          color: "gray.700",
                          cursor: "not-allowed" 
                        }}
                      />
                    </HStack>
                    {user && (
                      <Text fontSize="xs" color="gray.500" mt={1}>
                        Using your registered email address
                      </Text>
                    )}
                  </FormControl>

                  {/* Message Field - Always Editable */}
                  <FormControl isRequired>
                    <FormLabel fontSize="sm" fontWeight="medium" color="gray.700">
                      Your Message
                    </FormLabel>
                    <HStack align="start">
                      <Icon as={ChatBubbleLeftEllipsisIcon} w={5} h={5} color="gray.400" mt={2} />
                      <VStack align="stretch" flex={1}>
                        <Textarea
                          value={formData.message}
                          onChange={(e) => handleInputChange('message', e.target.value)}
                          placeholder={
                            user 
                              ? "How can we help you today? Please provide detailed information about your inquiry..."
                              : "Tell us about your question, feedback, or idea. Please be as detailed as possible..."
                          }
                          rows={8}
                          resize="none"
                          minH="200px"
                          focusBorderColor={accentColor}
                        />
                        <HStack justify="space-between" fontSize="xs" color="gray.500">
                          <Text>
                            {formData.message.length < 10 ? (
                              <HStack spacing={1}>
                                <ExclamationTriangleIcon className="w-3 h-3" />
                                <span>Minimum 10 characters required</span>
                              </HStack>
                            ) : (
                              <HStack spacing={1}>
                                <CheckCircleIcon className="w-3 h-3" />
                                <span>Good length</span>
                              </HStack>
                            )}
                          </Text>
                          <Text>
                            {formData.message.length}/5000 characters
                          </Text>
                        </HStack>
                      </VStack>
                    </HStack>
                  </FormControl>

                  {/* Submit Button */}
                  <VStack spacing={4} align="stretch" pt={4}>
                    <Button
                      type="submit"
                      isLoading={status === "sending"}
                      loadingText={user ? "Sending Message..." : "Sending Your Message..."}
                      colorScheme="blue"
                      size="lg"
                      height="56px"
                      fontSize="md"
                      fontWeight="semibold"
                      leftIcon={status === "sent" ? <CheckCircleIcon className="w-5 h-5" /> : undefined}
                      isDisabled={status === "sent"}
                      bgGradient={status !== "sent" ? "linear(to-r, blue.500, purple.500)" : undefined}
                      _hover={{
                        transform: status !== "sent" ? "translateY(-2px)" : "none",
                        shadow: status !== "sent" ? "lg" : "md",
                      }}
                      transition="all 0.2s"
                    >
                      {status === "sent" ? "Message Sent Successfully!" : "Send Message"}
                    </Button>

                    {/* Additional Info */}
                    <Text fontSize="sm" color="gray.600" textAlign="center">
                      {user 
                        ? "We'll respond to your registered email within 24 hours."
                        : "We typically respond within 24-48 hours. Make sure to check your spam folder."
                      }
                    </Text>
                  </VStack>

                  {/* Inline status fallback */}
                  <Collapse in={status === "sent" || status === "error"}>
                    {status === "sent" && (
                      <Alert status="success" rounded="lg" variant="subtle">
                        <AlertIcon />
                        <Box>
                          <Text fontWeight="medium">Message sent successfully!</Text>
                          <Text fontSize="sm">
                            {user 
                              ? "We've received your message and will respond to your registered email."
                              : "Thank you for your message. We'll get back to you soon."
                            }
                          </Text>
                        </Box>
                      </Alert>
                    )}
                    {status === "error" && (
                      <Alert status="error" rounded="lg" variant="subtle">
                        <AlertIcon />
                        <Box>
                          <Text fontWeight="medium">Failed to send message</Text>
                          <Text fontSize="sm">
                            Please try again later or contact us directly via email.
                          </Text>
                        </Box>
                      </Alert>
                    )}
                  </Collapse>
                </VStack>
              </form>

              {/* Additional Contact Information */}
              <Collapse in={!user}>
                <Box mt={8} pt={6} borderTop="1px solid" borderColor={borderColor}>
                  <VStack spacing={3} align="start">
                    <Text fontSize="sm" fontWeight="medium" color="gray.700">
                      Prefer other ways to reach us?
                    </Text>
                    <Text fontSize="sm" color="gray.600">
                      • Email us directly at support@yourapp.com<br/>
                      • Join our community forum<br/>
                      • Check our FAQ section for quick answers
                    </Text>
                  </VStack>
                </Box>
              </Collapse>
            </CardBody>
          </Card>
        </ScaleFade>
      </Box>
    </Layout>
  );
}

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale || "en", ["nav", "common"])),
    },
    revalidate: 60,
  };
};
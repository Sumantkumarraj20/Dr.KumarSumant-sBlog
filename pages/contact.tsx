import { useState } from "react";
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
} from "@chakra-ui/react";
import {
  UserIcon,
  EnvelopeIcon,
  ChatBubbleLeftEllipsisIcon,
} from "@heroicons/react/24/outline";

export default function Contact() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">(
    "idle"
  );

  const toast = useToast();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("sending");
    try {
      const { error } = await supabase
        .from("contacts")
        .insert([{ name, email, message }]);
      if (error) throw error;
      setStatus("sent");
      setName("");
      setEmail("");
      setMessage("");

      toast({
        title: "Message sent!",
        description: "I’ll get back to you soon.",
        status: "success",
        duration: 4000,
        isClosable: true,
      });
    } catch (err) {
      setStatus("error");
      toast({
        title: "Error sending message.",
        description: "Please try again later.",
        status: "error",
        duration: 4000,
        isClosable: true,
      });
    }
  }

  return (
    <Layout>
      <Box maxW="3xl" mx="auto" px={6} py={16}>
        <Box
          bg="white"
          shadow="2xl"
          rounded="2xl"
          borderWidth="1px"
          borderColor="gray.200"
          _dark={{ bg: "gray.900", borderColor: "gray.700" }}
          p={10}
        >
          <Heading as="h2" size="2xl" mb={3}>
            Contact Me
          </Heading>
          <Text mb={10} fontSize="lg" color="gray.600" _dark={{ color: "gray.300" }}>
            Got a question, idea, or feedback? Drop me a message and I’ll get back to
            you soon.
          </Text>

          <form onSubmit={handleSubmit}>
            <VStack spacing={6} align="stretch">
              {/* Name */}
              <FormControl isRequired>
                <FormLabel>Name</FormLabel>
                <HStack>
                  <Icon as={UserIcon} w={5} h={5} color="gray.400" />
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your Name"
                  />
                </HStack>
              </FormControl>

              {/* Email */}
              <FormControl isRequired>
                <FormLabel>Email</FormLabel>
                <HStack>
                  <Icon as={EnvelopeIcon} w={5} h={5} color="gray.400" />
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Your Email"
                  />
                </HStack>
              </FormControl>

              {/* Message */}
              <FormControl isRequired>
                <FormLabel>Message</FormLabel>
                <HStack align="start">
                  <Icon as={ChatBubbleLeftEllipsisIcon} w={5} h={5} color="gray.400" mt={2} />
                  <Textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Your Message"
                    rows={6}
                    resize="none"
                  />
                </HStack>
              </FormControl>

              {/* Submit */}
              <Button
                type="submit"
                isLoading={status === "sending"}
                loadingText="Sending"
                colorScheme="blue"
                size="lg"
                alignSelf="flex-start"
              >
                Send Message
              </Button>

              {/* Inline status fallback if toast fails */}
              {status === "sent" && (
                <Alert status="success" rounded="md">
                  <AlertIcon />
                  Message sent successfully!
                </Alert>
              )}
              {status === "error" && (
                <Alert status="error" rounded="md">
                  <AlertIcon />
                  Something went wrong. Try again.
                </Alert>
              )}
            </VStack>
          </form>
        </Box>
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

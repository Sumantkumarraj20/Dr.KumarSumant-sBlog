// pages/auth.tsx
import { useState } from "react";
import { signIn, signUp } from "../lib/auth";
import { supabase } from "../lib/supabaseClient";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { GetStaticProps } from "next";
import Layout from "../components/Layout";
import {
  Box,
  VStack,
  Heading,
  Text,
  Input,
  Button,
  Divider,
  HStack,
  Image as ChakraImage,
  useColorModeValue,
} from "@chakra-ui/react";

export default function AuthPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "signup") await signUp(email, password);
      else await signIn(email, password);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    setLoading(true);
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/learn` },
    });
  };

  const panelBg = useColorModeValue("white", "gray.800");
  const panelText = useColorModeValue("gray.800", "gray.50");
  const mutedText = useColorModeValue("gray.500", "gray.400");
  const inputBg = useColorModeValue("gray.50", "gray.700");

  return (
    <Layout>
        <Box
          minH="calc(100vh - 80px)"
          display="flex"
          alignItems="center"
          justifyContent="center"
          px={4}
        >
          <Box
            maxW="lg"
            w="full"
            bg={panelBg}
            rounded="3xl"
            shadow="xl"
            p={10}
            transition="all 0.3s"
          >
            <VStack spacing={6} align="stretch">
              {/* Header */}
              <VStack spacing={1} textAlign="center">
                <Heading size="xl">{mode === "signup" ? "Create Account" : "Welcome Back"}</Heading>
                <Text fontSize="sm" color={mutedText}>
                  {mode === "signup"
                    ? "Join our medical community and get started"
                    : "Sign in to continue to your account"}
                </Text>
              </VStack>

              {/* Form */}
              <VStack as="form" spacing={4} onSubmit={handleSubmit}>
                <Input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  size="lg"
                  focusBorderColor="blue.500"
                  bg={inputBg}
                  color={panelText}
                />
                <Input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  size="lg"
                  focusBorderColor="blue.500"
                  bg={inputBg}
                  color={panelText}
                />
                <Button
                  type="submit"
                  colorScheme="blue"
                  size="lg"
                  w="full"
                  isLoading={loading}
                >
                  {mode === "signup" ? "Create Account" : "Sign In"}
                </Button>
              </VStack>

              {/* Divider */}
              <HStack>
                <Divider />
                <Text fontSize="sm" color="gray.400">OR</Text>
                <Divider />
              </HStack>

              {/* Google Sign-In */}
              <Button
                onClick={signInWithGoogle}
                w="full"
                variant="outline"
                size="lg"
                display="flex"
                alignItems="center"
                gap={3}
                isLoading={loading}
              >
                <ChakraImage src="https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/Google_%22G%22_logo.svg/2048px-Google_%22G%22_logo.svg.png" alt="Google" w={5} h={5} />
                Sign in with Google
              </Button>

              {/* Toggle Sign In / Sign Up */}
              <Text textAlign="center" fontSize="sm" color="gray.500">
                {mode === "signup" ? "Already have an account?" : "Need an account?"}{" "}
                <Box
                  as="span"
                  color="blue.500"
                  fontWeight="semibold"
                  cursor="pointer"
                  onClick={() => setMode(mode === "signup" ? "signin" : "signup")}
                >
                  {mode === "signup" ? "Sign in" : "Sign up"}
                </Box>
              </Text>
            </VStack>
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

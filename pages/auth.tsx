"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import AuthService, { signInWithGoogle } from "@/lib/auth";
import { supabase } from "@/lib/supabaseClient";
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
  useToast,
  FormControl,
  FormLabel,
  FormErrorMessage,
  InputGroup,
  InputRightElement,
  IconButton,
  Alert,
  AlertIcon,
  ScaleFade,
  Collapse,
  Progress,
  Card,
  CardBody,
} from "@chakra-ui/react";
import { BiShow, BiHide } from "react-icons/bi";
import { FiMail, FiLock, FiUser, FiArrowRight } from "react-icons/fi";
import { useRouter } from "next/router";
import SEO from "@/components/Seo";
import { AuthFormData } from "@/types/auth";

type AuthMode = "signin" | "signup";

interface FormErrors {
  email?: string;
  password?: string;
  fullName?: string;
  confirmPassword?: string;
}

export default function AuthPage() {
  const router = useRouter();
  const toast = useToast();
  
  // Form state
  const [formData, setFormData] = useState<AuthFormData>({
    email: "",
    password: "",
    full_name: "",
    confirmPassword: "",
  });
  const [mode, setMode] = useState<AuthMode>("signin");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [redirectPath, setRedirectPath] = useState("/learn");

  // Memoized color values
  const panelBg = useColorModeValue("white", "gray.800");
  const panelBorder = useColorModeValue("gray.200", "gray.600");
  const panelShadow = useColorModeValue("xl", "dark-lg");
  const inputBg = useColorModeValue("gray.50", "gray.700");
  const accentColor = useColorModeValue("blue.500", "blue.300");
  const mutedText = useColorModeValue("gray.600", "gray.400");
  const bgGradient = useColorModeValue(
    "linear(to-br, blue.50, purple.50)",
    "linear(to-br, gray.900, blue.900)"
  );

  // Redirect path management
  useEffect(() => {
    const urlRedirect = router.query.redirect;
    if (urlRedirect && typeof urlRedirect === 'string') {
      setRedirectPath(urlRedirect);
      return;
    }

    const storedRedirect = sessionStorage.getItem('auth_redirect');
    if (storedRedirect) {
      setRedirectPath(storedRedirect);
    }
  }, [router.query.redirect]);

  useEffect(() => {
    if (!router.query.redirect && router.asPath !== '/auth') {
      if (!router.asPath.includes('/auth')) {
        sessionStorage.setItem('auth_redirect', router.asPath);
      }
    }
  }, [router.asPath, router.query.redirect]);

  // Password strength calculator
  const calculatePasswordStrength = useCallback((password: string): number => {
    let strength = 0;
    if (password.length >= 8) strength += 25;
    if (/[A-Z]/.test(password)) strength += 25;
    if (/[a-z]/.test(password)) strength += 25;
    if (/[0-9]/.test(password)) strength += 25;
    if (/[^A-Za-z0-9]/.test(password)) strength += 25;
    return Math.min(strength, 100);
  }, []);

  const handlePasswordChange = useCallback((value: string) => {
    setFormData(prev => ({ ...prev, password: value }));
    setPasswordStrength(calculatePasswordStrength(value));
  }, [calculatePasswordStrength]);

  const getPasswordStrengthColor = useCallback(() => {
    if (passwordStrength < 25) return "red";
    if (passwordStrength < 50) return "orange";
    if (passwordStrength < 75) return "yellow";
    return "green";
  }, [passwordStrength]);

  // Form validation
  const validateForm = useCallback((): boolean => {
    const newErrors: FormErrors = {};

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    // Sign up specific validations
    if (mode === "signup") {
      if (!formData.full_name?.trim()) {
        newErrors.fullName = "Full name is required";
      }

      if (!formData.confirmPassword) {
        newErrors.confirmPassword = "Please confirm your password";
      } else if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = "Passwords do not match";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData, mode]);

  // Form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      if (mode === "signup") {
        const result = await AuthService.signUp(
          formData.email,
          formData.password,
          formData.full_name
        );

        if (result?.needsEmailVerification) {
          toast({
            title: "Account created successfully! 🎉",
            description: "Please check your email to verify your account before signing in.",
            status: "success",
            duration: 8000,
            isClosable: true,
            position: "top-right",
          });
          
          // Stay on auth page for email verification
          setMode("signin");
          setFormData(prev => ({ ...prev, password: "", confirmPassword: "" }));
        } else {
          toast({
            title: "Welcome! 🎉",
            description: "Your account has been created and you're signed in.",
            status: "success",
            duration: 5000,
            isClosable: true,
            position: "top-right",
          });
          
          const targetPath = redirectPath !== '/auth' ? redirectPath : '/learn';
          router.push(targetPath);
        }
      } else {
        await AuthService.signIn(formData.email, formData.password);
        
        toast({
          title: "Welcome back! 👋",
          description: "Successfully signed in to your account",
          status: "success",
          duration: 3000,
          isClosable: true,
          position: "top-right",
        });
        
        const targetPath = redirectPath !== '/auth' ? redirectPath : '/learn';
        router.push(targetPath);
      }
      
      sessionStorage.removeItem('auth_redirect');
    } catch (err: any) {
      console.error("Auth error:", err);
      // Error is already handled by AuthService
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      await signInWithGoogle(redirectPath);
      // No need for toast here - user is being redirected
    } catch (err: any) {
      console.error("Google auth error:", err);
      // Error is already handled by AuthService
      setLoading(false);
    }
  };

  const switchMode = useCallback((newMode: AuthMode) => {
    setMode(newMode);
    setErrors({});
    setPasswordStrength(0);
    // Clear password fields when switching modes
    setFormData(prev => ({
      ...prev,
      password: "",
      confirmPassword: "",
    }));
  }, []);

  const updateFormField = useCallback((field: keyof AuthFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  // Memoized form sections
  const fullNameField = useMemo(() => (
    <Collapse in={mode === "signup"} animateOpacity>
      <FormControl isInvalid={!!errors.fullName}>
        <FormLabel fontSize="sm" fontWeight="medium" color="gray.700">
          Full Name
        </FormLabel>
        <InputGroup>
          <Input
            type="text"
            placeholder="Enter your full name"
            value={formData.full_name || ""}
            onChange={(e) => updateFormField("full_name", e.target.value)}
            size="lg"
            focusBorderColor={accentColor}
            bg={inputBg}
            pl={10}
          />
          <InputRightElement pointerEvents="none" h="full">
            <FiUser color="gray.400" />
          </InputRightElement>
        </InputGroup>
        <FormErrorMessage>{errors.fullName}</FormErrorMessage>
      </FormControl>
    </Collapse>
  ), [mode, errors.fullName, formData.full_name, accentColor, inputBg, updateFormField]);

  const confirmPasswordField = useMemo(() => (
    <Collapse in={mode === "signup"} animateOpacity>
      <FormControl isInvalid={!!errors.confirmPassword}>
        <FormLabel fontSize="sm" fontWeight="medium" color="gray.700">
          Confirm Password
        </FormLabel>
        <InputGroup>
          <Input
            type={showConfirmPassword ? "text" : "password"}
            placeholder="Confirm your password"
            value={formData.confirmPassword || ""}
            onChange={(e) => updateFormField("confirmPassword", e.target.value)}
            size="lg"
            focusBorderColor={accentColor}
            bg={inputBg}
            pl={10}
          />
          <InputRightElement h="full">
            <IconButton
              aria-label={showConfirmPassword ? "Hide password" : "Show password"}
              icon={showConfirmPassword ? <BiHide /> : <BiShow />}
              variant="ghost"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            />
          </InputRightElement>
        </InputGroup>
        <FormErrorMessage>{errors.confirmPassword}</FormErrorMessage>
      </FormControl>
    </Collapse>
  ), [mode, errors.confirmPassword, formData.confirmPassword, showConfirmPassword, accentColor, inputBg, updateFormField]);

  const passwordStrengthIndicator = useMemo(() => (
    <Collapse in={mode === "signup" && formData.password.length > 0} animateOpacity>
      <VStack spacing={1} mt={2}>
        <Progress
          value={passwordStrength}
          size="sm"
          w="full"
          colorScheme={getPasswordStrengthColor()}
          rounded="full"
        />
        <Text fontSize="xs" color="gray.500" w="full" textAlign="left">
          Password strength:{" "}
          {passwordStrength < 25 ? "Weak" :
           passwordStrength < 50 ? "Fair" :
           passwordStrength < 75 ? "Good" : "Strong"}
        </Text>
      </VStack>
    </Collapse>
  ), [mode, formData.password, passwordStrength, getPasswordStrengthColor]);

  return (
    <>
      <SEO title={mode === "signup" ? "Sign Up" : "Sign In"} />
      <Layout>
        <Box
          minH="calc(100vh - 80px)"
          display="flex"
          alignItems="center"
          justifyContent="center"
          px={4}
          py={8}
          bgGradient={bgGradient}
        >
          <ScaleFade in initialScale={0.9}>
            <Card
              maxW="md"
              w="full"
              bg={panelBg}
              rounded="3xl"
              shadow={panelShadow}
              border="1px solid"
              borderColor={panelBorder}
              position="relative"
              overflow="hidden"
            >
              <Box
                position="absolute"
                top="0"
                left="0"
                right="0"
                h="1"
                bgGradient="linear(to-r, blue.500, purple.500, pink.500)"
              />

              <CardBody p={8}>
                <VStack spacing={6} align="stretch">
                  {/* Header */}
                  <VStack spacing={3} textAlign="center">
                    <Box
                      w="16"
                      h="16"
                      bgGradient="linear(to-br, blue.500, purple.500)"
                      rounded="2xl"
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                      color="white"
                      fontSize="2xl"
                      fontWeight="bold"
                    >
                      {mode === "signup" ? "👋" : "🔐"}
                    </Box>
                    <VStack spacing={1}>
                      <Heading size="lg" fontWeight="bold">
                        {mode === "signup" ? "Create Your Account" : "Welcome Back"}
                      </Heading>
                      <Text fontSize="md" color={mutedText}>
                        {mode === "signup" 
                          ? "Join our learning community and start your journey" 
                          : "Sign in to continue your learning progress"}
                      </Text>
                    </VStack>
                  </VStack>

                  {/* Form */}
                  <VStack as="form" spacing={4} onSubmit={handleSubmit}>
                    {fullNameField}

                    {/* Email */}
                    <FormControl isInvalid={!!errors.email}>
                      <FormLabel fontSize="sm" fontWeight="medium" color="gray.700">
                        Email Address
                      </FormLabel>
                      <InputGroup>
                        <Input
                          type="email"
                          placeholder="your.email@example.com"
                          value={formData.email}
                          onChange={(e) => updateFormField("email", e.target.value)}
                          size="lg"
                          focusBorderColor={accentColor}
                          bg={inputBg}
                          pl={10}
                        />
                        <InputRightElement pointerEvents="none" h="full">
                          <FiMail color="gray.400" />
                        </InputRightElement>
                      </InputGroup>
                      <FormErrorMessage>{errors.email}</FormErrorMessage>
                    </FormControl>

                    {/* Password */}
                    <FormControl isInvalid={!!errors.password}>
                      <FormLabel fontSize="sm" fontWeight="medium" color="gray.700">
                        Password
                      </FormLabel>
                      <InputGroup>
                        <Input
                          type={showPassword ? "text" : "password"}
                          placeholder="Enter your password"
                          value={formData.password}
                          onChange={(e) => handlePasswordChange(e.target.value)}
                          size="lg"
                          focusBorderColor={accentColor}
                          bg={inputBg}
                          pl={10}
                        />
                        <InputRightElement h="full">
                          <IconButton
                            aria-label={showPassword ? "Hide password" : "Show password"}
                            icon={showPassword ? <BiHide /> : <BiShow />}
                            variant="ghost"
                            onClick={() => setShowPassword(!showPassword)}
                          />
                        </InputRightElement>
                      </InputGroup>
                      <FormErrorMessage>{errors.password}</FormErrorMessage>
                      {passwordStrengthIndicator}
                    </FormControl>

                    {confirmPasswordField}

                    {/* Submit Button */}
                    <Button
                      type="submit"
                      colorScheme="blue"
                      size="lg"
                      w="full"
                      isLoading={loading}
                      loadingText={mode === "signup" ? "Creating Account..." : "Signing In..."}
                      rightIcon={<FiArrowRight />}
                      bgGradient="linear(to-r, blue.500, purple.500)"
                      _hover={{
                        transform: "translateY(-2px)",
                        shadow: "lg",
                        bgGradient: "linear(to-r, blue.600, purple.600)",
                      }}
                      _active={{ transform: "translateY(0)" }}
                      transition="all 0.2s"
                      mt={2}
                    >
                      {mode === "signup" ? "Create Account" : "Sign In"}
                    </Button>
                  </VStack>

                  {/* Divider */}
                  <HStack>
                    <Divider />
                    <Text fontSize="sm" color="gray.400" px={2}>
                      OR
                    </Text>
                    <Divider />
                  </HStack>

                  {/* Google Sign-In */}
                  <Button
                    onClick={handleGoogleSignIn}
                    w="full"
                    variant="outline"
                    size="lg"
                    display="flex"
                    alignItems="center"
                    gap={3}
                    isLoading={loading}
                    _hover={{ transform: "translateY(-1px)", shadow: "md" }}
                    transition="all 0.2s"
                  >
                    <ChakraImage
                      src="https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/Google_%22G%22_logo.svg/2048px-Google_%22G%22_logo.svg.png"
                      alt="Google"
                      w={5}
                      h={5}
                    />
                    Continue with Google
                  </Button>

                  {/* Mode Toggle */}
                  <Text textAlign="center" fontSize="sm" color={mutedText}>
                    {mode === "signup" ? "Already have an account?" : "Don't have an account?"}{" "}
                    <Box
                      as="span"
                      color={accentColor}
                      fontWeight="semibold"
                      cursor="pointer"
                      onClick={() => switchMode(mode === "signup" ? "signin" : "signup")}
                      _hover={{ textDecoration: "underline" }}
                    >
                      {mode === "signup" ? "Sign in" : "Create account"}
                    </Box>
                  </Text>

                  {/* Additional Info */}
                  <Alert status="info" rounded="lg" fontSize="sm">
                    <AlertIcon />
                    <Box>
                      <Text fontWeight="medium">
                        {mode === "signup" ? "Start learning today" : "Continue your journey"}
                      </Text>
                      <Text fontSize="xs">
                        {mode === "signup"
                          ? "Access all courses, track progress, and join our community"
                          : "Pick up where you left off and achieve your learning goals"}
                      </Text>
                    </Box>
                  </Alert>
                </VStack>
              </CardBody>
            </Card>
          </ScaleFade>
        </Box>
      </Layout>
    </>
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
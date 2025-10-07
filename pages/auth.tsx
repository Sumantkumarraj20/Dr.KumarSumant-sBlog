// pages/auth.tsx
"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import AuthService, { signInWithGoogle } from "@/lib/auth";
import { supabase } from "@/lib/supabaseClient";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import type { GetStaticProps } from "next";
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
  AlertTitle,
  AlertDescription,
  ButtonGroup,
  Spacer,
} from "@chakra-ui/react";
import { BiShow, BiHide } from "react-icons/bi";
import { FiMail, FiLock, FiUser, FiArrowRight } from "react-icons/fi";
import { useRouter } from "next/router";
import SEO from "@/components/Seo";
import type { AuthFormData } from "@/types/auth";

type AuthMode = "signin" | "signup";

interface FormErrors {
  email?: string;
  password?: string;
  fullName?: string;
  confirmPassword?: string;
}

/* Manage auth UI state for inline errors and retry actions */
export default function AuthPage() {
  const router = useRouter();
  const toast = useToast();

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

  // Inline auth error state for persistent UI actions
  const [authError, setAuthError] = useState<{ message: string; code?: string } | null>(null);
  const [resendDisabled, setResendDisabled] = useState(false);

  // Colors
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

  useEffect(() => {
    const urlRedirect = router.query.redirect;
    if (urlRedirect && typeof urlRedirect === "string") {
      setRedirectPath(urlRedirect);
      return;
    }
    const storedRedirect = sessionStorage.getItem("auth_redirect");
    if (storedRedirect) setRedirectPath(storedRedirect);
  }, [router.query.redirect]);

  useEffect(() => {
    if (!router.query.redirect && router.asPath !== "/auth") {
      if (!router.asPath.includes("/auth")) sessionStorage.setItem("auth_redirect", router.asPath);
    }
  }, [router.asPath, router.query.redirect]);

  const calculatePasswordStrength = useCallback((password: string): number => {
    let strength = 0;
    if (password.length >= 8) strength += 25;
    if (/[A-Z]/.test(password)) strength += 25;
    if (/[a-z]/.test(password)) strength += 25;
    if (/[0-9]/.test(password)) strength += 25;
    if (/[^A-Za-z0-9]/.test(password)) strength += 25;
    return Math.min(strength, 100);
  }, []);

  const handlePasswordChange = useCallback(
    (value: string) => {
      setFormData((prev) => ({ ...prev, password: value }));
      setPasswordStrength(calculatePasswordStrength(value));
    },
    [calculatePasswordStrength]
  );

  const getPasswordStrengthColor = useCallback(() => {
    if (passwordStrength < 25) return "red";
    if (passwordStrength < 50) return "orange";
    if (passwordStrength < 75) return "yellow";
    return "green";
  }, [passwordStrength]);

  const validateForm = useCallback((): boolean => {
    const newErrors: FormErrors = {};
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    if (mode === "signup") {
      if (!formData.full_name?.trim()) newErrors.fullName = "Full name is required";
      if (!formData.confirmPassword) newErrors.confirmPassword = "Please confirm your password";
      else if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData, mode]);

  const handleResendVerification = useCallback(async () => {
    if (!formData.email) {
      toast({ title: "Please enter your email first", status: "warning", duration: 3000 });
      return;
    }
    try {
      setResendDisabled(true);
      await AuthService.resendVerificationEmail(formData.email);
      toast({
        title: "Verification email resent",
        description: "Check your inbox (and spam). Link expires soon.",
        status: "success",
        duration: 6000,
      });
      // cooldown to avoid rate-limits
      setTimeout(() => setResendDisabled(false), 60_000);
    } catch (err: any) {
      console.error("Resend error:", err);
      toast({
        title: "Could not resend verification",
        description: err?.message || "Please try again later.",
        status: "error",
        duration: 5000,
      });
      setResendDisabled(false);
    }
  }, [formData.email, toast]);

  const handleResetPassword = useCallback(async () => {
    if (!formData.email) {
      toast({ title: "Please enter your email first", status: "warning", duration: 3000 });
      return;
    }
    try {
      await AuthService.resetPassword(formData.email);
      toast({
        title: "Reset email sent",
        description: "Check your inbox for a password reset link.",
        status: "success",
        duration: 6000,
      });
    } catch (err: any) {
      console.error("Reset password error:", err);
      toast({ title: "Reset failed", description: err?.message || "Please try later", status: "error", duration: 4000 });
    }
  }, [formData.email, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);

    if (!validateForm()) return;

    setLoading(true);
    try {
      if (mode === "signup") {
        const result = await AuthService.signUp(formData.email, formData.password, formData.full_name);
        if (result?.needsEmailVerification) {
          setAuthError({ message: "Account created — please verify your email address.", code: "EMAIL_NOT_VERIFIED" });
          toast({
            title: "Verify your email 📧",
            description: "We sent a confirmation link — check your inbox before signing in.",
            status: "info",
            duration: 8000,
            isClosable: true,
            position: "top-right",
          });
          setMode("signin");
          setFormData((prev) => ({ ...prev, password: "", confirmPassword: "" }));
        } else {
          toast({
            title: "Welcome! 🎉",
            description: "You're signed in.",
            status: "success",
            duration: 5000,
            isClosable: true,
            position: "top-right",
          });
          router.push(redirectPath !== "/auth" ? redirectPath : "/learn");
        }
      } else {
        const signInResult = await AuthService.signIn(formData.email, formData.password);

        // If sign-in succeeded but email is not verified, surface inline message
        if (signInResult && signInResult.emailVerified === false) {
          setAuthError({ message: "Signed in but email not verified. Please verify to continue.", code: "EMAIL_NOT_VERIFIED" });
          toast({
            title: "Email not verified",
            description: "Please verify your email. You can resend the verification link below.",
            status: "warning",
            duration: 6000,
          });
          setLoading(false);
          return;
        }

        toast({
          title: "Welcome back! 👋",
          description: "Successfully signed in to your account",
          status: "success",
          duration: 3000,
          isClosable: true,
          position: "top-right",
        });
        router.push(redirectPath !== "/auth" ? redirectPath : "/learn");
      }

      sessionStorage.removeItem("auth_redirect");
    } catch (err: any) {
      console.error("Auth error:", err);
      // show inline persistent message + toast
      const message = err?.message || "Authentication failed. Please try again.";
      const code = err?.code || undefined;
      setAuthError({ message, code });
      toast({
        title: "Authentication failed",
        description: message,
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "top-right",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      await signInWithGoogle(redirectPath);
    } catch (err: any) {
      console.error("Google auth error:", err);
      setAuthError({ message: err?.message || "Google sign-in failed", code: err?.code });
      toast({ title: "Google sign-in failed", description: err?.message || "Please try again.", status: "error", duration: 4000 });
    } finally {
      setLoading(false);
    }
  };

  const switchMode = useCallback((newMode: AuthMode) => {
    setMode(newMode);
    setErrors({});
    setPasswordStrength(0);
    setFormData((prev) => ({ ...prev, password: "", confirmPassword: "" }));
    setAuthError(null);
  }, []);

  const updateFormField = useCallback((field: keyof AuthFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (field === "email") setAuthError(null); // clear persistent error when user edits email
  }, []);

  const fullNameField = useMemo(() => (
    <Collapse in={mode === "signup"} animateOpacity>
      <FormControl isInvalid={!!errors.fullName}>
        <FormLabel fontSize="sm" fontWeight="medium" color="gray.700">Full Name</FormLabel>
        <InputGroup>
          <Input type="text" placeholder="Enter your full name" value={formData.full_name || ""} onChange={(e) => updateFormField("full_name", e.target.value)} size="lg" focusBorderColor={accentColor} bg={inputBg} pl={10} />
          <InputRightElement pointerEvents="none" h="full"><FiUser color="gray.400" /></InputRightElement>
        </InputGroup>
        <FormErrorMessage>{errors.fullName}</FormErrorMessage>
      </FormControl>
    </Collapse>
  ), [mode, errors.fullName, formData.full_name, accentColor, inputBg, updateFormField]);

  const confirmPasswordField = useMemo(() => (
    <Collapse in={mode === "signup"} animateOpacity>
      <FormControl isInvalid={!!errors.confirmPassword}>
        <FormLabel fontSize="sm" fontWeight="medium" color="gray.700">Confirm Password</FormLabel>
        <InputGroup>
          <Input type={showConfirmPassword ? "text" : "password"} placeholder="Confirm your password" value={formData.confirmPassword || ""} onChange={(e) => updateFormField("confirmPassword", e.target.value)} size="lg" focusBorderColor={accentColor} bg={inputBg} pl={10} />
          <InputRightElement h="full">
            <IconButton aria-label={showConfirmPassword ? "Hide password" : "Show password"} icon={showConfirmPassword ? <BiHide /> : <BiShow />} variant="ghost" onClick={() => setShowConfirmPassword(!showConfirmPassword)} />
          </InputRightElement>
        </InputGroup>
        <FormErrorMessage>{errors.confirmPassword}</FormErrorMessage>
      </FormControl>
    </Collapse>
  ), [mode, errors.confirmPassword, formData.confirmPassword, showConfirmPassword, accentColor, inputBg, updateFormField]);

  const passwordStrengthIndicator = useMemo(() => (
    <Collapse in={mode === "signup" && formData.password.length > 0} animateOpacity>
      <VStack spacing={1} mt={2}>
        <Progress value={passwordStrength} size="sm" w="full" colorScheme={getPasswordStrengthColor()} rounded="full" />
        <Text fontSize="xs" color="gray.500" w="full" textAlign="left">
          Password strength: {passwordStrength < 25 ? "Weak" : passwordStrength < 50 ? "Fair" : passwordStrength < 75 ? "Good" : "Strong"}
        </Text>
      </VStack>
    </Collapse>
  ), [mode, formData.password, passwordStrength, getPasswordStrengthColor]);

  return (
    <>
      <SEO title={mode === "signup" ? "Sign Up" : "Sign In"} />
      <Layout>
        <Box minH="calc(100vh - 80px)" display="flex" alignItems="center" justifyContent="center" px={4} py={8} bgGradient={bgGradient}>
          <ScaleFade in initialScale={0.9}>
            <Card maxW="md" w="full" bg={panelBg} rounded="3xl" shadow={panelShadow} border="1px solid" borderColor={panelBorder} position="relative" overflow="hidden">
              <Box position="absolute" top="0" left="0" right="0" h="1" bgGradient="linear(to-r, blue.500, purple.500, pink.500)" />
              <CardBody p={8}>
                <VStack spacing={6} align="stretch">
                  <VStack spacing={3} textAlign="center">
                    <Box w="16" h="16" bgGradient="linear(to-br, blue.500, purple.500)" rounded="2xl" display="flex" alignItems="center" justifyContent="center" color="white" fontSize="2xl" fontWeight="bold">
                      {mode === "signup" ? "👋" : "🔐"}
                    </Box>
                    <VStack spacing={1}>
                      <Heading size="lg" fontWeight="bold">{mode === "signup" ? "Create Your Account" : "Welcome Back"}</Heading>
                      <Text fontSize="md" color={mutedText}>{mode === "signup" ? "Join our learning community and start your journey" : "Sign in to continue your learning progress"}</Text>
                    </VStack>
                  </VStack>

                  {/* Persistent inline auth error (provides actions) */}
                  {authError && (
                    <Alert status={authError.code === "EMAIL_NOT_VERIFIED" ? "warning" : authError.code === "INVALID_CREDENTIALS" ? "error" : "error"} rounded="lg" fontSize="sm">
                      <AlertIcon />
                      <Box flex="1">
                        <AlertTitle>{authError.code === "EMAIL_NOT_VERIFIED" ? "Email verification required" : authError.code === "INVALID_CREDENTIALS" ? "Sign-in failed" : "Error"}</AlertTitle>
                        <AlertDescription display="block">{authError.message}</AlertDescription>
                        <ButtonGroup mt={3} size="sm">
                          {authError.code === "EMAIL_NOT_VERIFIED" && (
                            <>
                              <Button colorScheme="blue" onClick={handleResendVerification} isDisabled={resendDisabled}>Resend verification</Button>
                              <Button variant="outline" onClick={() => { setMode("signup"); toast({ title: "Edit email", description: "You can change the email and try again.", status: "info" }); }}>Edit email</Button>
                              <Spacer />
                            </>
                          )}
                          {authError.code === "INVALID_CREDENTIALS" && (
                            <>
                              <Button colorScheme="red" onClick={handleResetPassword}>Reset password</Button>
                              <Button variant="ghost" onClick={() => setAuthError(null)}>Dismiss</Button>
                            </>
                          )}
                          {!["EMAIL_NOT_VERIFIED", "INVALID_CREDENTIALS"].includes(authError.code || "") && (
                            <>
                              <Button onClick={() => setAuthError(null)}>Dismiss</Button>
                            </>
                          )}
                        </ButtonGroup>
                      </Box>
                    </Alert>
                  )}

                  {/* Form */}
                  <VStack as="form" spacing={4} onSubmit={handleSubmit}>
                    {fullNameField}

                    <FormControl isInvalid={!!errors.email}>
                      <FormLabel fontSize="sm" fontWeight="medium" color="gray.700">Email Address</FormLabel>
                      <InputGroup>
                        <Input type="email" placeholder="you@your-domain.com" value={formData.email} onChange={(e) => updateFormField("email", e.target.value)} size="lg" focusBorderColor={accentColor} bg={inputBg} pl={10} />
                        <InputRightElement pointerEvents="none" h="full"><FiMail color="gray.400" /></InputRightElement>
                      </InputGroup>
                      <FormErrorMessage>{errors.email}</FormErrorMessage>
                    </FormControl>

                    <FormControl isInvalid={!!errors.password}>
                      <FormLabel fontSize="sm" fontWeight="medium" color="gray.700">Password</FormLabel>
                      <InputGroup>
                        <Input type={showPassword ? "text" : "password"} placeholder="Enter your password" value={formData.password} onChange={(e) => handlePasswordChange(e.target.value)} size="lg" focusBorderColor={accentColor} bg={inputBg} pl={10} />
                        <InputRightElement h="full">
                          <IconButton aria-label={showPassword ? "Hide password" : "Show password"} icon={showPassword ? <BiHide /> : <BiShow />} variant="ghost" onClick={() => setShowPassword(!showPassword)} />
                        </InputRightElement>
                      </InputGroup>
                      <FormErrorMessage>{errors.password}</FormErrorMessage>
                      {passwordStrengthIndicator}
                    </FormControl>

                    {confirmPasswordField}

                    <Button type="submit" colorScheme="blue" size="lg" w="full" isLoading={loading} loadingText={mode === "signup" ? "Creating Account..." : "Signing In..."} rightIcon={<FiArrowRight />} bgGradient="linear(to-r, blue.500, purple.500)" _hover={{ transform: "translateY(-2px)", shadow: "lg", bgGradient: "linear(to-r, blue.600, purple.600)" }} _active={{ transform: "translateY(0)" }} transition="all 0.2s" mt={2}>
                      {mode === "signup" ? "Create Account" : "Sign In"}
                    </Button>
                  </VStack>

                  <HStack>
                    <Divider />
                    <Text fontSize="sm" color="gray.400" px={2}>OR</Text>
                    <Divider />
                  </HStack>

                  <Button onClick={handleGoogleSignIn} w="full" variant="outline" size="lg" display="flex" alignItems="center" gap={3} isLoading={loading} _hover={{ transform: "translateY(-1px)", shadow: "md" }} transition="all 0.2s">
                    <ChakraImage src="https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/Google_%22G%22_logo.svg/2048px-Google_%22G%22_logo.svg.png" alt="Google" w={5} h={5} />
                    Continue with Google
                  </Button>

                  <Text textAlign="center" fontSize="sm" color={mutedText}>
                    {mode === "signup" ? "Already have an account?" : "Don't have an account?"}{" "}
                    <Box as="span" color={accentColor} fontWeight="semibold" cursor="pointer" onClick={() => switchMode(mode === "signup" ? "signin" : "signup")} _hover={{ textDecoration: "underline" }}>
                      {mode === "signup" ? "Sign in" : "Create account"}
                    </Box>
                  </Text>

                  <Alert status="info" rounded="lg" fontSize="sm">
                    <AlertIcon />
                    <Box>
                      <Text fontWeight="medium">{mode === "signup" ? "Start learning today" : "Continue your journey"}</Text>
                      <Text fontSize="xs">{mode === "signup" ? "Access all courses, track progress, and join our community" : "Pick up where you left off and achieve your learning goals"}</Text>
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

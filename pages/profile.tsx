"use client";

import React, { useEffect, useState, useCallback, useRef, useMemo } from "react";
import Layout from "../components/Layout";
import { useAuth } from "../context/authContext";
import { supabase } from "../lib/supabaseClient";
import {
  Box,
  VStack,
  Heading,
  Text,
  Input,
  Button,
  HStack,
  useToast,
  Spinner,
  Avatar,
  FormControl,
  FormLabel,
  Card,
  CardBody,
  Divider,
  IconButton,
  Alert,
  AlertIcon,
  Grid,
  GridItem,
  useColorModeValue,
  Badge,
} from "@chakra-ui/react";
import { useRouter } from "next/router";
import {
  CameraIcon,
  CheckIcon,
  XMarkIcon,
  UserCircleIcon,
} from "@heroicons/react/24/outline";
import {
  uploadProfileImage,
  deleteOldProfileImage,
  validateImageFile,
} from "@/lib/cloudinary";
import SEO from "@/components/Seo";
import { UserProfile } from "@/types/auth";

interface ProfileFormData {
  full_name: string;
  email: string;
}

export default function ProfilePage() {
  const {
    user,
    loading: authLoading,
    profile,
    refreshProfile,
    signOut,
  } = useAuth();
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const toast = useToast();
  const router = useRouter();

  // Memoized color values
  const cardBg = useColorModeValue("white", "gray.700");
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const mutedText = useColorModeValue("gray.600", "gray.400");

  // Form state
  const [formData, setFormData] = useState<ProfileFormData>({
    full_name: "",
    email: "",
  });

  // Initialize form data from profile
  useEffect(() => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || "",
        email: profile.email || user?.email || "",
      });
    }
  }, [profile, user]);

  // Handle input changes
  const handleInputChange = useCallback((field: keyof ProfileFormData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  }, []);

  // Image upload handler
  const handleImageUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    // Validate file
    const validation = validateImageFile(file);
    if (!validation.valid) {
      toast({
        title: "Invalid image",
        description: validation.error,
        status: "error",
        duration: 3000,
      });
      return;
    }

    try {
      setUploading(true);

      // Delete old image if exists
      if (profile?.avatar_url) {
        await deleteOldProfileImage(profile.avatar_url);
      }

      // Upload new image
      const imageUrl = await uploadProfileImage(file, user.id);

      // Update profile with new avatar URL
      const { error } = await supabase
        .from("profiles")
        .update({
          avatar_url: imageUrl,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);

      if (error) throw error;

      // Refresh profile data
      await refreshProfile();

      toast({
        title: "Profile image updated",
        status: "success",
        duration: 2000,
      });
    } catch (error: any) {
      console.error("Error uploading image:", error);
      toast({
        title: "Error uploading image",
        description: error.message,
        status: "error",
        duration: 3000,
      });
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }, [user, profile, refreshProfile, toast]);

  // Save profile changes
  const handleSave = useCallback(async () => {
    if (!user) return;

    setSaving(true);
    try {
      const updates = {
        id: user.id,
        full_name: formData.full_name.trim(),
        email: formData.email.trim(),
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from("profiles")
        .upsert(updates, { onConflict: "id" });

      if (error) throw error;

      // Refresh auth context
      await refreshProfile();

      toast({
        title: "Profile updated successfully",
        status: "success",
        duration: 2000,
      });

      setIsEditing(false);
    } catch (error: any) {
      console.error("Error saving profile:", error);
      toast({
        title: "Error updating profile",
        description: error.message,
        status: "error",
        duration: 3000,
      });
    } finally {
      setSaving(false);
    }
  }, [user, formData, refreshProfile, toast]);

  // Cancel editing
  const handleCancel = useCallback(() => {
    setFormData({
      full_name: profile?.full_name || "",
      email: profile?.email || user?.email || "",
    });
    setIsEditing(false);
  }, [profile, user]);

  // Handle sign out
  const handleSignOut = useCallback(async () => {
    setSigningOut(true);
    try {
      await signOut();
      router.push("/");
    } catch (error: any) {
      console.error("Error signing out:", error);
      toast({
        title: "Error signing out",
        description: error.message,
        status: "error",
        duration: 3000,
      });
      setSigningOut(false);
    }
  }, [signOut, router, toast]);

  // Memoized computed values
  const showEmailConfirmationAlert = useMemo(() => 
    user && !user.email_confirmed_at, [user]);

  const memberSince = useMemo(() => 
    profile?.created_at
      ? new Date(profile.created_at).toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })
      : "Unknown", [profile]);

  const avatarName = useMemo(() => 
    formData.full_name || user?.email || "User", [formData.full_name, user]);

  // Loading state
  if (authLoading) {
    return (
      <>
        <SEO title="Profile" />
        <Layout>
          <Box
            p={10}
            display="flex"
            justifyContent="center"
            alignItems="center"
          >
            <Spinner size="xl" />
          </Box>
        </Layout>
      </>
    );
  }

  // Auth check
  if (!user) {
    return (
      <>
        <SEO title="Profile" />
        <Layout>
          <Box maxW="md" mx="auto" px={4} py={12}>
            <Alert status="warning">
              <AlertIcon />
              Please sign in to view your profile.
            </Alert>
          </Box>
        </Layout>
      </>
    );
  }

  return (
    <>
      <SEO title="Profile" />
      <Layout>
        <Box maxW="4xl" mx="auto" px={4} py={8}>
          <VStack spacing={8} align="stretch">
            {/* Email Confirmation Alert */}
            {showEmailConfirmationAlert && (
              <Alert status="warning" borderRadius="md">
                <AlertIcon />
                <Box>
                  <Text fontWeight="bold">Email confirmation required</Text>
                  <Text fontSize="sm">
                    Please check your email to confirm your account. Some
                    features may be limited until your email is verified.
                  </Text>
                </Box>
              </Alert>
            )}

            {/* Header */}
            <Box>
              <Heading size="lg">Profile Settings</Heading>
              <Text color={mutedText} mt={2}>
                Manage your account information and preferences
              </Text>
            </Box>

            <Grid templateColumns={{ base: "1fr", lg: "1fr 2fr" }} gap={8}>
              {/* Profile Image Section */}
              <GridItem>
                <Card bg={cardBg} border="1px solid" borderColor={borderColor}>
                  <CardBody>
                    <VStack spacing={4}>
                      <Box position="relative">
                        <Avatar
                          size="2xl"
                          src={profile?.avatar_url}
                          name={avatarName}
                          icon={<UserCircleIcon className="w-16 h-16" />}
                        />
                        <IconButton
                          aria-label="Change profile picture"
                          icon={<CameraIcon className="w-4 h-4" />}
                          size="sm"
                          position="absolute"
                          bottom={2}
                          right={2}
                          borderRadius="full"
                          colorScheme="blue"
                          isLoading={uploading}
                          onClick={() => fileInputRef.current?.click()}
                        />
                        <input
                          type="file"
                          ref={fileInputRef}
                          onChange={handleImageUpload}
                          accept="image/*"
                          style={{ display: "none" }}
                        />
                      </Box>

                      <VStack spacing={1}>
                        <Text
                          fontWeight="semibold"
                          fontSize="lg"
                          textAlign="center"
                        >
                          {formData.full_name || "No name set"}
                        </Text>
                        <Text
                          color={mutedText}
                          fontSize="sm"
                          textAlign="center"
                        >
                          {user.email}
                        </Text>
                        {profile?.is_admin && (
                          <Badge colorScheme="purple" mt={1}>
                            Administrator
                          </Badge>
                        )}
                        {!user.email_confirmed_at && (
                          <Badge colorScheme="yellow" mt={1}>
                            Email Not Verified
                          </Badge>
                        )}
                      </VStack>

                      <Divider />

                      <VStack spacing={1} align="stretch" w="full">
                        <HStack justify="space-between">
                          <Text fontSize="sm" color={mutedText}>
                            Member since
                          </Text>
                          <Text fontSize="sm" fontWeight="medium">
                            {memberSince}
                          </Text>
                        </HStack>
                        <HStack justify="space-between">
                          <Text fontSize="sm" color={mutedText}>
                            Account status
                          </Text>
                          <Badge
                            colorScheme={
                              user.email_confirmed_at ? "green" : "yellow"
                            }
                            fontSize="xs"
                          >
                            {user.email_confirmed_at
                              ? "Active"
                              : "Pending Verification"}
                          </Badge>
                        </HStack>
                      </VStack>
                    </VStack>
                  </CardBody>
                </Card>
              </GridItem>

              {/* Profile Details Section */}
              <GridItem>
                <Card bg={cardBg} border="1px solid" borderColor={borderColor}>
                  <CardBody>
                    <VStack spacing={6} align="stretch">
                      <HStack justify="space-between">
                        <Heading size="md">Personal Information</Heading>
                        {!isEditing ? (
                          <Button
                            colorScheme="blue"
                            variant="outline"
                            size="sm"
                            onClick={() => setIsEditing(true)}
                          >
                            Edit Profile
                          </Button>
                        ) : (
                          <HStack>
                            <Button
                              colorScheme="green"
                              size="sm"
                              leftIcon={<CheckIcon className="w-4 h-4" />}
                              isLoading={saving}
                              onClick={handleSave}
                            >
                              Save
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              leftIcon={<XMarkIcon className="w-4 h-4" />}
                              onClick={handleCancel}
                              isDisabled={saving}
                            >
                              Cancel
                            </Button>
                          </HStack>
                        )}
                      </HStack>

                      <Grid templateColumns="1fr" gap={4}>
                        <FormControl>
                          <FormLabel fontSize="sm" fontWeight="medium">
                            Full Name
                          </FormLabel>
                          <Input
                            value={formData.full_name}
                            onChange={(e) =>
                              handleInputChange("full_name", e.target.value)
                            }
                            placeholder="Enter your full name"
                            isReadOnly={!isEditing}
                          />
                        </FormControl>

                        <FormControl>
                          <FormLabel fontSize="sm" fontWeight="medium">
                            Email Address
                          </FormLabel>
                          <Input
                            type="email"
                            value={formData.email}
                            onChange={(e) =>
                              handleInputChange("email", e.target.value)
                            }
                            placeholder="Enter your email"
                            isReadOnly={!isEditing}
                          />
                          {!user.email_confirmed_at && (
                            <Text fontSize="xs" color="orange.500" mt={1}>
                              Please verify your email address
                            </Text>
                          )}
                        </FormControl>

                        <FormControl>
                          <FormLabel fontSize="sm" fontWeight="medium">
                            User ID
                          </FormLabel>
                          <Input
                            value={user.id}
                            isReadOnly
                            fontFamily="mono"
                            fontSize="sm"
                          />
                          <Text fontSize="xs" color={mutedText} mt={1}>
                            Your unique identifier in the system
                          </Text>
                        </FormControl>
                      </Grid>

                      <Divider />

                      {/* Danger Zone */}
                      <Box>
                        <Heading size="sm" color="red.600" mb={4}>
                          Danger Zone
                        </Heading>
                        <Button
                          colorScheme="red"
                          variant="outline"
                          onClick={handleSignOut}
                          isLoading={signingOut}
                          w={{ base: "full", sm: "auto" }}
                        >
                          Sign Out
                        </Button>
                      </Box>
                    </VStack>
                  </CardBody>
                </Card>
              </GridItem>
            </Grid>
          </VStack>
        </Box>
      </Layout>
    </>
  );
}
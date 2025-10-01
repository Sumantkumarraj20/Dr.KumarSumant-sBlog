"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
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
  Switch,
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
  UserCircleIcon 
} from "@heroicons/react/24/outline";

interface ProfileData {
  id: string;
  email: string;
  full_name: string;
  avatar_url: string;
  is_admin: boolean;
  created_at: string;
}

export default function ProfilePage() {
  const { user, loading: authLoading, profile, refreshProfile } = useAuth();
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const toast = useToast();
  const router = useRouter();

  // Color values
  const cardBg = useColorModeValue("white", "gray.700");
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const mutedText = useColorModeValue("gray.600", "gray.400");

  // Form state
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
  });

  // Fetch profile data
  const fetchProfile = useCallback(async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (error) throw error;

      setProfileData(data);
      setFormData({
        full_name: data?.full_name || "",
        email: data?.email || user.email || "",
      });
    } catch (error) {
      console.error("Error fetching profile:", error);
      toast({
        title: "Error loading profile",
        status: "error",
        duration: 3000,
      });
    } finally {
      setLoading(false);
    }
  }, [user, toast]);

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user, fetchProfile]);

  // Handle input changes
  const handleInputChange = useCallback((field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

  // Upload image to Cloudinary
  const uploadToCloudinary = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "your_upload_preset_here"); // Replace with your upload preset
    
    try {
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/your_cloud_name/image/upload`, // Replace with your cloud name
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await response.json();
      if (!response.ok) throw new Error(data.error?.message || "Upload failed");
      
      return data.secure_url;
    } catch (error) {
      console.error("Cloudinary upload error:", error);
      throw new Error("Failed to upload image");
    }
  };

  // Handle profile image upload
  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    // Validate file type and size
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid file type",
        description: "Please select an image file",
        status: "error",
        duration: 3000,
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      toast({
        title: "File too large",
        description: "Please select an image smaller than 5MB",
        status: "error",
        duration: 3000,
      });
      return;
    }

    try {
      setUploading(true);
      
      // Upload to Cloudinary
      const imageUrl = await uploadToCloudinary(file);
      
      // Update profile with new avatar URL
      const { error } = await supabase
        .from("profiles")
        .update({ avatar_url: imageUrl })
        .eq("id", user.id);

      if (error) throw error;

      // Refresh profile data
      await fetchProfile();
      if (refreshProfile) await refreshProfile();

      toast({
        title: "Profile image updated",
        status: "success",
        duration: 2000,
      });
    } catch (error) {
      console.error("Error uploading image:", error);
      toast({
        title: "Error uploading image",
        status: "error",
        duration: 3000,
      });
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  // Save profile changes
  const handleSave = async () => {
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
        .upsert(updates, { onConflict: 'id' });

      if (error) throw error;

      // Refresh auth context
      if (refreshProfile) await refreshProfile();

      toast({
        title: "Profile updated successfully",
        status: "success",
        duration: 2000,
      });
      
      setIsEditing(false);
      await fetchProfile(); // Refresh local data
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
  };

  // Cancel editing
  const handleCancel = () => {
    setFormData({
      full_name: profileData?.full_name || "",
      email: profileData?.email || user?.email || "",
    });
    setIsEditing(false);
  };

  // Handle sign out
  const handleSignOut = async () => {
    setSigningOut(true);
    try {
      await supabase.auth.signOut();
      router.push("/");
    } catch (error) {
      console.error("Error signing out:", error);
      toast({
        title: "Error signing out",
        status: "error",
        duration: 3000,
      });
    } finally {
      setSigningOut(false);
    }
  };

  // Loading state
  if (authLoading || loading) {
    return (
      <Layout>
        <Box p={10} display="flex" justifyContent="center" alignItems="center">
          <Spinner size="xl" />
        </Box>
      </Layout>
    );
  }

  // Auth check
  if (!user) {
    return (
      <Layout>
        <Box maxW="md" mx="auto" px={4} py={12}>
          <Alert status="warning">
            <AlertIcon />
            Please sign in to view your profile.
          </Alert>
        </Box>
      </Layout>
    );
  }

  const memberSince = profileData?.created_at 
    ? new Date(profileData.created_at).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    : 'Unknown';

  return (
    <Layout>
      <Box maxW="4xl" mx="auto" px={4} py={8}>
        <VStack spacing={8} align="stretch">
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
                        src={profileData?.avatar_url}
                        name={formData.full_name || user.email}
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
                      <Text fontWeight="semibold" fontSize="lg" textAlign="center">
                        {formData.full_name || "No name set"}
                      </Text>
                      <Text color={mutedText} fontSize="sm" textAlign="center">
                        {user.email}
                      </Text>
                      {profileData?.is_admin && (
                        <Badge colorScheme="purple" mt={1}>
                          Administrator
                        </Badge>
                      )}
                    </VStack>

                    <Divider />

                    <VStack spacing={1} align="stretch" w="full">
                      <HStack justify="space-between">
                        <Text fontSize="sm" color={mutedText}>Member since</Text>
                        <Text fontSize="sm" fontWeight="medium">{memberSince}</Text>
                      </HStack>
                      <HStack justify="space-between">
                        <Text fontSize="sm" color={mutedText}>Account status</Text>
                        <Badge colorScheme="green" fontSize="xs">Active</Badge>
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
                          onChange={(e) => handleInputChange("full_name", e.target.value)}
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
                          onChange={(e) => handleInputChange("email", e.target.value)}
                          placeholder="Enter your email"
                          isReadOnly={!isEditing}
                        />
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
  );
}
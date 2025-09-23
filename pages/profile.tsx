"use client";

import React, { useEffect, useState } from "react";
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
} from "@chakra-ui/react";
import { useRouter } from "next/router";

export default function ProfilePage() {
  const { user, loading: authLoading } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [saving, setSaving] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const toast = useToast();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      setEmail(user.email || "");
      setName(user.user_metadata?.full_name || user.user_metadata?.name || "");
    }
  }, [user]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const updates = {
        id: user.id,
        user_metadata: { ...user.user_metadata, full_name: name },
      } as any;
      const { data, error } = await supabase.from("profiles").upsert(updates);
      if (error) throw error;
      toast({ title: "Profile saved", status: "success", duration: 2000 });
    } catch (e) {
      console.error(e);
      toast({ title: "Error saving", status: "error", duration: 3000 });
    } finally {
      setSaving(false);
    }
  };

  const handleSignOut = async () => {
    setSigningOut(true);
    try {
      await supabase.auth.signOut();
      router.push("/");
    } catch (e) {
      console.error(e);
      toast({ title: "Error signing out", status: "error" });
    } finally {
      setSigningOut(false);
    }
  };

  if (authLoading) return <Layout><Box p={10}><Spinner /></Box></Layout>;

  if (!user) return <Layout><Box p={10}><Text>Please sign in to view your profile.</Text></Box></Layout>;

  return (
    <Layout>
      <Box maxW="3xl" mx="auto" px={4} py={12}>
        <VStack spacing={6} align="stretch">
          <Heading>Profile</Heading>
          <Text color="gray.600">Update your profile details below.</Text>

          <Box>
            <Text fontSize="sm" mb={2}>Email</Text>
            <Input value={email} isReadOnly />
          </Box>

          <Box>
            <Text fontSize="sm" mb={2}>Full name</Text>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </Box>

          <HStack>
            <Button colorScheme="blue" onClick={handleSave} isLoading={saving}>Save</Button>
            <Button variant="outline" onClick={() => router.push("/")}>Cancel</Button>
            <Button ml="auto" colorScheme="red" onClick={handleSignOut} isLoading={signingOut}>Sign out</Button>
          </HStack>
        </VStack>
      </Box>
    </Layout>
  );
}

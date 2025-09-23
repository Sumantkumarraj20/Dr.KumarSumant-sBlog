"use client";

import React from "react";
import Layout from "../components/Layout";
import { useAuth } from "../context/authContext";
import { Box, Heading, Text, Button, VStack } from "@chakra-ui/react";
import { useRouter } from "next/router";

export default function AdminPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  if (loading) return (
    <Layout>
      <Box p={12}>Loading…</Box>
    </Layout>
  );

  if (!user || user.user_metadata?.role !== 'admin') {
    return (
      <Layout>
        <Box maxW="3xl" mx="auto" p={10}>
          <VStack spacing={4} align="start">
            <Heading size="lg">Admin</Heading>
            <Text>You do not have permission to view this page.</Text>
            <Button onClick={() => router.push('/')} variant="outline">Return home</Button>
          </VStack>
        </Box>
      </Layout>
    );
  }

  return (
    <Layout>
      <Box maxW="6xl" mx="auto" px={6} py={12}>
        <Heading>Admin Dashboard</Heading>
        <Text mt={4}>Welcome, admin. Add monitoring tools, user lists, or site controls here.</Text>
      </Box>
    </Layout>
  );
}

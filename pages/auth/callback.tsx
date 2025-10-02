// pages/auth/callback.tsx
"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../../lib/supabaseClient';
import { Box, Spinner, VStack, Text, useToast } from '@chakra-ui/react';
import Layout from '../../components/Layout';

export default function AuthCallback() {
  const router = useRouter();
  const toast = useToast();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Get the session from the URL hash
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          throw error;
        }

        if (session) {
          // Get redirect path from URL state parameter or default to learn page
          let redirectTo = '/learn';
          
          // Check for state parameter from OAuth
          const urlParams = new URLSearchParams(window.location.search);
          const stateParam = urlParams.get('state');
          
          if (stateParam) {
            try {
              const state = JSON.parse(atob(stateParam));
              if (state.redirectTo) {
                redirectTo = state.redirectTo;
              }
            } catch (e) {
              console.log('No valid state parameter found, using default');
            }
          }

          // Check for stored redirect path as fallback
          const storedRedirect = sessionStorage.getItem('auth_redirect');
          if (storedRedirect && storedRedirect !== '/auth') {
            redirectTo = storedRedirect;
          }

          // Clear stored redirect
          sessionStorage.removeItem('auth_redirect');

          toast({
            title: "Successfully signed in!",
            status: "success",
            duration: 3000,
            isClosable: true,
          });

          router.push(redirectTo);
        } else {
          throw new Error('No session found');
        }
      } catch (error: any) {
        console.error('Auth callback error:', error);
        toast({
          title: "Authentication failed",
          description: "Please try signing in again",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
        router.push('/auth');
      }
    };

    handleAuthCallback();
  }, [router, toast]);

  return (
    <Layout>
      <Box 
        minH="calc(100vh - 80px)" 
        display="flex" 
        alignItems="center" 
        justifyContent="center"
      >
        <VStack spacing={4}>
          <Spinner size="xl" color="blue.500" />
          <Text fontSize="lg" color="gray.600">
            Completing authentication...
          </Text>
        </VStack>
      </Box>
    </Layout>
  );
}
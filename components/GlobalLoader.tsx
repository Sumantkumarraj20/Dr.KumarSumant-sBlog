"use client";

import React, { useEffect, useState, useRef, useMemo } from "react";
import { useRouter } from "next/router";
import { Box, Spinner, Text, VStack, useColorModeValue, Progress, HStack } from "@chakra-ui/react";

/**
 * Hook that returns whether a route navigation is in progress.
 * It also debounces repeated routeChangeStart for the same url.
 */
export function useRouteLoading() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const lastUrlRef = useRef<string | null>(null);
  const lastStartRef = useRef<number>(0);

  useEffect(() => {
    let mounted = true;

    const handleStart = (url: string) => {
      const now = Date.now();
      if (lastUrlRef.current === url && now - lastStartRef.current < 800) {
        return;
      }
      lastUrlRef.current = url;
      lastStartRef.current = now;
      if (mounted) setLoading(true);
    };

    const handleStop = () => {
      setTimeout(() => {
        if (mounted) setLoading(false);
      }, 220);
    };

    router.events.on("routeChangeStart", handleStart);
    router.events.on("routeChangeComplete", handleStop);
    router.events.on("routeChangeError", handleStop);

    return () => {
      mounted = false;
      router.events.off("routeChangeStart", handleStart);
      router.events.off("routeChangeComplete", handleStop);
      router.events.off("routeChangeError", handleStop);
    };
  }, [router.events]);

  return loading;
}

export default function GlobalLoader() {
  const loading = useRouteLoading(); // This MUST be at the top level
  const [visible, setVisible] = useState(false);
  const [progress, setProgress] = useState(0);
  const startRef = useRef<number | null>(null);
  const timerRef = useRef<number | null>(null);
  const bg = useColorModeValue("rgba(255,255,255,0.78)", "rgba(8,10,15,0.7)");

  // start simulated progress
  const startProgress = () => {
    if (timerRef.current) window.clearInterval(timerRef.current);
    startRef.current = Date.now();
    setProgress(5);
    setVisible(true);
    // deterministic eased increment to avoid randomness and improve predictability
    timerRef.current = window.setInterval(() => {
      setProgress((p) => {
        if (p >= 95) return p;
        const decay = 1 - p / 100;
        // ease-out cubic step scaled to remain small
        const step = Math.max(0.2, Math.pow(decay, 2) * 3);
        return Math.min(95, Math.round((p + step) * 10) / 10);
      });
    }, 220);
  };

  // finish progress and hide
  const finishProgress = () => {
    if (timerRef.current) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setProgress(100);
    // small delay so progress bar reaches 100 visibly
    setTimeout(() => {
      setVisible(false);
      setProgress(0);
      startRef.current = null;
    }, 420);
  };

  useEffect(() => {
    if (loading) startProgress();
    else if (!loading && visible) finishProgress();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading]);

  // estimate remaining time in seconds using elapsed / progress
  const eta = useMemo(() => {
    if (!visible || progress <= 0 || progress >= 100 || !startRef.current) return null;
    const elapsed = Date.now() - startRef.current; // ms
    if (progress < 0.5) return null; // avoid noisy estimate
    const msPerPercent = elapsed / progress; // ms per percent
    const remainingMs = msPerPercent * (100 - progress);
    // clamp between 0.2s and 20s for UI sanity
    const sec = Math.max(0.2, Math.min(20, Math.round((remainingMs / 100) * 10) / 10));
    return sec;
  }, [visible, progress]);

  if (!visible) return null;

  const contentBg = useColorModeValue("white", "gray.800");
  const contentTextColor = useColorModeValue("gray.600", "gray.300");

  return (
    <Box position="fixed" inset={0} zIndex={60} pointerEvents="none">
      {/* translucent backdrop */}
      <Box position="absolute" inset={0} bg={bg} style={{ backdropFilter: "blur(6px)" }} transition="opacity 180ms ease-out" />

      {/* top progress bar */}
      <Box position="fixed" top={3} left={0} right={0} zIndex={70} px={{ base: 4, md: 8 }} pointerEvents="none">
        <Box bg="transparent" h="6px" borderRadius="full" overflow="hidden">
          <Box
            bg="blue.500"
            h="6px"
            w={`${progress}%`}
            transition="width 180ms linear"
            boxShadow="md"
            borderRadius="full"
          />
        </Box>
      </Box>

      {/* centered content */}
      <VStack zIndex={70} position="fixed" inset={0} alignItems="center" justifyContent="center" pointerEvents="auto">
        <HStack spacing={4} alignItems="center" bg={contentBg} px={6} py={4} borderRadius="lg" boxShadow="lg">
          <Spinner size="lg" thickness="4px" color="blue.500" />
          <Box textAlign="left">
            <Text fontWeight="semibold">Loading…</Text>
            <Text fontSize="sm" color={contentTextColor}>
              {eta ? `≈ ${eta}s remaining` : "Preparing content…"}
            </Text>
          </Box>
        </HStack>
      </VStack>
    </Box>
  );
}
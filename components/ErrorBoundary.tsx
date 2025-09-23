"use client";

import React from "react";
import { Box, Button, VStack, Text } from "@chakra-ui/react";

type Props = { children: React.ReactNode };

type State = { hasError: boolean; error?: Error };

export default class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: any) {
    // Log the error to console and optionally to an external service
    // Keep this minimal and safe for dev/prod use
    // eslint-disable-next-line no-console
    console.error("ErrorBoundary caught:", error, info);
  }

  reset = () => this.setState({ hasError: false, error: undefined });

  render() {
    if (this.state.hasError) {
      return (
        <Box p={6} maxW="3xl" mx="auto">
          <VStack spacing={4} align="stretch" bg="red.50" p={6} rounded="md" boxShadow="md">
            <Text fontWeight="bold">Something went wrong</Text>
            <Text fontSize="sm">An unexpected error occurred while rendering this page.</Text>
            <Box as="pre" whiteSpace="pre-wrap" fontSize="xs" color="gray.800">
              {String(this.state.error)}
            </Box>
            <Button onClick={this.reset} colorScheme="red" size="sm">Try again</Button>
          </VStack>
        </Box>
      );
    }

    return this.props.children as React.ReactElement;
  }
}

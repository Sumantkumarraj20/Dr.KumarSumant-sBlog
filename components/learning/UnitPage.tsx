"use client";

import { fetchUnits, fetchUnitProgress } from "@/lib/learn";
import { useEffect, useState, useCallback, useMemo } from "react";
import {
  SimpleGrid,
  Box,
  Text,
  VStack,
  Button,
  Flex,
  HStack,
  useColorModeValue,
  Spinner,
  Skeleton,
  Card,
  CardBody,
  Progress,
  Icon,
  Badge,
  Grid,
  GridItem,
  Tooltip,
  useToast,
} from "@chakra-ui/react";
import { 
  FiBook, 
  FiPlay, 
  FiClock, 
  FiBarChart2, 
  FiArrowLeft,
  FiCheckCircle,
  FiList
} from "react-icons/fi";

interface Props {
  module: any;
  userId: string;
  onBack: () => void;
  onSelectUnit: (unit: any) => void;
}

interface UnitProgress {
  progress: number;
  lessonCount: number;
  completedLessons: number;
  estimatedTime: number;
  lastAccessed?: string;
}

export default function UnitPage({ module, userId, onBack, onSelectUnit }: Props) {
  const [units, setUnits] = useState<any[]>([]);
  const [progressMap, setProgressMap] = useState<Record<string, UnitProgress>>({});
  const [loading, setLoading] = useState(true);
  const [initialLoad, setInitialLoad] = useState(true);

  const toast = useToast();

  const cardBg = useColorModeValue("white", "gray.800");
  const cardBorder = useColorModeValue("gray.200", "gray.600");
  const hoverBg = useColorModeValue("blue.50", "gray.700");
  const textColor = useColorModeValue("gray.800", "gray.100");
  const mutedText = useColorModeValue("gray.600", "gray.400");
  const accentColor = useColorModeValue("blue.500", "blue.300");

  // Memoized progress calculation
  const calculateUnitProgress = useCallback(async (unitId: string): Promise<UnitProgress> => {
    try {
      const progress = await fetchUnitProgress(userId, unitId);
      
      // Mock additional data - replace with actual API calls
      const lessonCount = Math.floor(Math.random() * 8) + 3; // 3-10 lessons
      const completedLessons = Math.floor((progress / 100) * lessonCount);
      const estimatedTime = lessonCount * 15; // 15 minutes per lesson
      
      return {
        progress: progress || 0,
        lessonCount,
        completedLessons,
        estimatedTime,
        lastAccessed: new Date().toISOString() // Mock data
      };
    } catch (error) {
      console.error("Error calculating unit progress:", error);
      return {
        progress: 0,
        lessonCount: 0,
        completedLessons: 0,
        estimatedTime: 0
      };
    }
  }, [userId]);

  // Optimized data loading
  const loadUnitsAndProgress = useCallback(async () => {
    if (!module?.id) return;
    
    setLoading(true);
    try {
      const fetchedUnits = await fetchUnits(module.id);
      const normalizedUnits = fetchedUnits.map((u: any) => ({
        ...u,
        id: u.id || u._id || u.unit_id,
        title: u.title || "Untitled Unit",
        description: u.description || "No description available"
      }));

      setUnits(normalizedUnits);

      // Load progress for all units in parallel
      const progressPromises = normalizedUnits.map(unit => 
        calculateUnitProgress(unit.id)
      );
      
      const progressResults = await Promise.all(progressPromises);
      
      const newProgressMap: Record<string, UnitProgress> = {};
      normalizedUnits.forEach((unit, index) => {
        newProgressMap[unit.id] = progressResults[index];
      });
      
      setProgressMap(newProgressMap);
      
      if (initialLoad) {
        setInitialLoad(false);
      }
    } catch (error) {
      console.error("Error loading units:", error);
      toast({
        title: "Failed to load units",
        description: "Please try again later",
        status: "error",
        duration: 3000,
      });
    } finally {
      setLoading(false);
    }
  }, [module?.id, calculateUnitProgress, initialLoad, toast]);

  useEffect(() => {
    loadUnitsAndProgress();
  }, [loadUnitsAndProgress]);

  const getProgressColor = (progress: number) => {
    if (progress >= 90) return "green";
    if (progress >= 70) return "blue";
    if (progress >= 50) return "orange";
    if (progress >= 25) return "yellow";
    return "gray";
  };

  const getProgressVariant = (progress: number) => {
    if (progress === 0) return "ghost";
    if (progress === 100) return "solid";
    return "outline";
  };

  const getCardGradient = (progress: number) => {
    if (progress === 100) {
      return useColorModeValue(
        "linear(to-br, green.50, green.100)",
        "linear(to-br, green.900, green.800)"
      );
    }
    
    if (progress > 0) {
      return useColorModeValue(
        "linear(to-br, blue.50, purple.50)",
        "linear(to-br, blue.900, purple.900)"
      );
    }
    
    return useColorModeValue(
      "linear(to-br, gray.50, gray.100)",
      "linear(to-br, gray.800, gray.700)"
    );
  };

  const getStatusBadge = (progress: UnitProgress) => {
    if (progress.progress === 100) {
      return (
        <Badge colorScheme="green" px={3} py={1} rounded="full" fontSize="xs">
          <HStack spacing={1}>
            <Icon as={FiCheckCircle} />
            <Text>Completed</Text>
          </HStack>
        </Badge>
      );
    }
    
    if (progress.progress > 0) {
      return (
        <Badge colorScheme="blue" px={3} py={1} rounded="full" fontSize="xs">
          <HStack spacing={1}>
            <Icon as={FiBarChart2} />
            <Text>In Progress</Text>
          </HStack>
        </Badge>
      );
    }
    
    return (
      <Badge colorScheme="gray" px={3} py={1} rounded="full" fontSize="xs">
        <HStack spacing={1}>
          <Icon as={FiBook} />
          <Text>Not Started</Text>
        </HStack>
      </Badge>
    );
  };

  const formatTime = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  if (loading && initialLoad) {
    return (
      <Flex direction="column" w="100%" minH="80vh" p={6}>
        {/* Header Skeleton */}
        <Skeleton height="40px" width="120px" mb={6} rounded="lg" />
        <Skeleton height="32px" width="300px" mb={2} rounded="md" />
        <Skeleton height="20px" width="200px" mb={8} rounded="md" />
        
        {/* Units Grid Skeleton */}
        <Grid
          templateColumns={{
            base: "1fr",
            sm: "repeat(2, 1fr)",
            md: "repeat(2, 1fr)",
            lg: "repeat(3, 1fr)",
            xl: "repeat(4, 1fr)"
          }}
          gap={6}
        >
          {[...Array(6)].map((_, index) => (
            <GridItem key={index}>
              <Card bg={cardBg} border="1px solid" borderColor={cardBorder} h="220px">
                <CardBody>
                  <VStack align="stretch" spacing={3}>
                    <Skeleton height="24px" rounded="md" />
                    <Skeleton height="16px" rounded="md" />
                    <Skeleton height="12px" rounded="md" />
                    <Skeleton height="8px" rounded="full" mt={2} />
                    <Skeleton height="40px" rounded="lg" mt={2} />
                  </VStack>
                </CardBody>
              </Card>
            </GridItem>
          ))}
        </Grid>
      </Flex>
    );
  }

  return (
    <Flex direction="column" w="100%" minH="100vh" p={6}>
      {/* Header */}
      <VStack align="start" spacing={4} mb={8}>
        <Button
          onClick={onBack}
          variant="ghost"
          size="sm"
          leftIcon={<Icon as={FiArrowLeft} />}
          color={mutedText}
          _hover={{ bg: hoverBg }}
        >
          Back to Modules
        </Button>
        
        <VStack align="start" spacing={1}>
          <Text fontSize="2xl" fontWeight="bold" color={textColor}>
            {module?.title || "Module Units"}
          </Text>
          <Text fontSize="md" color={mutedText}>
            {units.length} units • {module?.description || "Explore the learning units"}
          </Text>
        </VStack>
      </VStack>

      {/* Units Grid */}
      <Grid
        templateColumns={{
          base: "1fr",
          sm: "repeat(2, 1fr)",
          md: "repeat(2, 1fr)",
          lg: "repeat(3, 1fr)",
          xl: "repeat(4, 1fr)"
        }}
        gap={6}
        flex="1"
      >
        {units.map((unit, index) => {
          const progress = progressMap[unit.id] || { 
            progress: 0, 
            lessonCount: 0, 
            completedLessons: 0, 
            estimatedTime: 0 
          };
          const progressColor = getProgressColor(progress.progress);
          const cardGradient = getCardGradient(progress.progress);

          return (
            <GridItem key={unit.id}>
              <Card
                bgGradient={cardGradient}
                border="1px solid"
                borderColor={cardBorder}
                shadow="md"
                transition="all 0.3s ease-in-out"
                _hover={{
                  transform: "translateY(-4px)",
                  shadow: "xl",
                  borderColor: useColorModeValue("blue.300", "blue.500"),
                }}
                cursor="pointer"
                onClick={() => onSelectUnit(unit)}
                position="relative"
                overflow="hidden"
              >
                {/* Progress indicator bar */}
                <Box
                  position="absolute"
                  top="0"
                  left="0"
                  right="0"
                  h="4px"
                  bg={`${progressColor}.500`}
                  opacity={progress.progress > 0 ? 1 : 0.3}
                />

                <CardBody p={5}>
                  <VStack align="stretch" spacing={4}>
                    {/* Unit header */}
                    <HStack justify="space-between" align="start">
                      <Box flex="1">
                        <HStack spacing={2} mb={2}>
                          <Box
                            w="8px"
                            h="8px"
                            rounded="full"
                            bg={`${progressColor}.500`}
                            flexShrink={0}
                          />
                          <Text
                            fontSize="sm"
                            fontWeight="medium"
                            color={mutedText}
                          >
                            Unit {index + 1}
                          </Text>
                        </HStack>
                        <Text
                          fontSize="lg"
                          fontWeight="semibold"
                          color={textColor}
                          noOfLines={2}
                          lineHeight="tall"
                        >
                          {unit.title}
                        </Text>
                      </Box>
                    </HStack>

                    {/* Description */}
                    <Text
                      fontSize="sm"
                      color={mutedText}
                      noOfLines={2}
                      lineHeight="short"
                    >
                      {unit.description}
                    </Text>

                    {/* Progress bar */}
                    <Box>
                      <HStack justify="space-between" mb={1}>
                        <Text fontSize="xs" color={mutedText} fontWeight="medium">
                          Progress
                        </Text>
                        <Text fontSize="xs" color={mutedText} fontWeight="bold">
                          {progress.progress}%
                        </Text>
                      </HStack>
                      <Progress
                        value={progress.progress}
                        colorScheme={progressColor}
                        size="sm"
                        rounded="full"
                        bg={useColorModeValue("gray.200", "gray.600")}
                      />
                    </Box>

                    {/* Stats row */}
                    <HStack justify="space-between" spacing={4}>
                      <Tooltip label="Lessons Completed">
                        <HStack spacing={1}>
                          <Icon as={FiList} color={`${progressColor}.500`} size="14px" />
                          <Text fontSize="xs" color={mutedText}>
                            {progress.completedLessons}/{progress.lessonCount}
                          </Text>
                        </HStack>
                      </Tooltip>
                      
                      <Tooltip label="Estimated Time">
                        <HStack spacing={1}>
                          <Icon as={FiClock} color={`${progressColor}.500`} size="14px" />
                          <Text fontSize="xs" color={mutedText}>
                            {formatTime(progress.estimatedTime)}
                          </Text>
                        </HStack>
                      </Tooltip>
                    </HStack>

                    {/* Action section */}
                    <VStack spacing={3} pt={2}>
                      {getStatusBadge(progress)}
                      <Button
                        colorScheme={progressColor}
                        size="sm"
                        w="full"
                        leftIcon={<Icon as={progress.progress === 100 ? FiCheckCircle : FiPlay} />}
                        variant={getProgressVariant(progress.progress)}
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectUnit(unit);
                        }}
                        _hover={{
                          transform: "scale(1.02)",
                        }}
                        transition="all 0.2s"
                      >
                        {progress.progress === 100 ? "Review" : 
                         progress.progress > 0 ? "Continue" : "Start Unit"}
                      </Button>
                    </VStack>
                  </VStack>
                </CardBody>
              </Card>
            </GridItem>
          );
        })}
      </Grid>

      {/* Loading overlay for subsequent loads */}
      {loading && !initialLoad && (
        <Flex
          position="absolute"
          top="0"
          left="0"
          right="0"
          bottom="0"
          bg="blackAlpha.100"
          align="center"
          justify="center"
          backdropFilter="blur(2px)"
          rounded="xl"
        >
          <VStack spacing={3}>
            <Spinner size="lg" color="blue.500" thickness="3px" />
            <Text color="gray.600" fontSize="sm">
              Updating progress...
            </Text>
          </VStack>
        </Flex>
      )}

      {/* Empty state */}
      {units.length === 0 && !loading && (
        <Flex 
          direction="column" 
          align="center" 
          justify="center" 
          flex="1" 
          py={20}
          color={mutedText}
        >
          <Icon as={FiBook} boxSize={12} mb={4} opacity={0.5} />
          <Text fontSize="xl" fontWeight="medium" mb={2}>
            No Units Available
          </Text>
          <Text textAlign="center" maxW="md">
            This module doesn't contain any units yet. Check back later or contact the course administrator.
          </Text>
        </Flex>
      )}
    </Flex>
  );
}
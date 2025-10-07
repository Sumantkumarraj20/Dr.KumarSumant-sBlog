"use client";

import { fetchModules, fetchModuleProgress, fetchUnits } from "@/lib/learn";
import { supabase } from "@/lib/supabaseClient";
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
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
} from "@chakra-ui/react";
import { 
  FiBook, 
  FiPlay, 
  FiClock, 
  FiBarChart2, 
  FiArrowLeft,
  FiCheckCircle,
  FiList,
  FiFolder
} from "react-icons/fi";

interface Props {
  course: any;
  userId: string;
  onBack: () => void;
  onSelectModule: (module: any) => void;
}

interface ModuleProgress {
  progress: number;
  unitCount: number;
  completedUnits: number;
  estimatedTime: number;
  lastAccessed?: string;
}

export default function ModulePage({ course, userId, onBack, onSelectModule }: Props) {
  const [modules, setModules] = useState<any[]>([]);
  const [progressMap, setProgressMap] = useState<Record<string, ModuleProgress>>({});
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
  const calculateModuleProgress = useCallback(async (moduleId: string): Promise<ModuleProgress> => {
    try {
      const progress = await fetchModuleProgress(userId, moduleId);
      // Fetch real unit count
      let unitCount = 0;
      let lastAccessed: string | undefined = undefined;
      try {
        const units = await fetchUnits(moduleId);
        unitCount = units?.length || 0;
      } catch (e) {
        console.warn("Failed to fetch units for module", moduleId, e);
      }

      const completedUnits = Math.round(((progress || 0) / 100) * unitCount);
      const estimatedTime = unitCount * 45; // conservative estimate: 45 minutes per unit

      // Try to fetch last_accessed aggregated for the module from user_course_progress
      try {
        const { data, error } = await supabase
          .from("user_course_progress")
          .select("last_accessed")
          .eq("user_id", userId)
          .eq("current_module_id", moduleId)
          .maybeSingle();

        if (!error && data) lastAccessed = data.last_accessed;
      } catch (e) {
        console.warn("Failed to fetch last_accessed for module", moduleId, e);
      }

      return {
        progress: progress || 0,
        unitCount,
        completedUnits,
        estimatedTime,
        lastAccessed,
      };
    } catch (error) {
      console.error("Error calculating module progress:", error);
      return {
        progress: 0,
        unitCount: 0,
        completedUnits: 0,
        estimatedTime: 0
      };
    }
  }, [userId]);

  // Optimized data loading
  const loadModulesAndProgress = useCallback(async () => {
    if (!course?.id) return;
    
    setLoading(true);
    try {
      const fetchedModules = await fetchModules(course.id);
      const normalizedModules = fetchedModules.map((m: any) => ({
        ...m,
        id: m.id || m._id || m.module_id,
        title: m.title || "Untitled Module",
        description: m.description || "No description available",
        order_index: m.order_index || 0
      }));

      // Sort modules by order_index
      const sortedModules = normalizedModules.sort((a: any, b: any) => 
        (a.order_index || 0) - (b.order_index || 0)
      );

      setModules(sortedModules);

      // Load progress for all modules in parallel
      const progressPromises = sortedModules.map(module => 
        calculateModuleProgress(module.id)
      );
      
      const progressResults = await Promise.all(progressPromises);
      
      const newProgressMap: Record<string, ModuleProgress> = {};
      sortedModules.forEach((module, index) => {
        newProgressMap[module.id] = progressResults[index];
      });
      
      setProgressMap(newProgressMap);
      
      if (initialLoad) {
        setInitialLoad(false);
      }
    } catch (error) {
      console.error("Error loading modules:", error);
      toast({
        title: "Failed to load modules",
        description: "Please try again later",
        status: "error",
        duration: 3000,
        isClosable: true,
        position: "top-right",
      });
    } finally {
      setLoading(false);
    }
  }, [course?.id, calculateModuleProgress, initialLoad, toast]);

  useEffect(() => {
    loadModulesAndProgress();
  }, [loadModulesAndProgress]);

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

  const getStatusBadge = (progress: ModuleProgress) => {
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

  // Calculate overall course progress
  const overallProgress = useMemo(() => {
    if (modules.length === 0) return 0;
    const totalProgress = Object.values(progressMap).reduce(
      (sum, progress) => sum + progress.progress, 0
    );
    return Math.round(totalProgress / modules.length);
  }, [modules, progressMap]);

  if (loading && initialLoad) {
    return (
      <Flex direction="column" w="100%" minH="80vh" p={6}>
        {/* Header Skeleton */}
        <Skeleton height="40px" width="120px" mb={6} rounded="lg" />
        <Skeleton height="32px" width="300px" mb={2} rounded="md" />
        <Skeleton height="20px" width="200px" mb={8} rounded="md" />
        
        {/* Modules Grid Skeleton */}
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
              <Card bg={cardBg} border="1px solid" borderColor={cardBorder} h="240px">
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
          Back to Courses
        </Button>
        
        <VStack align="start" spacing={2} w="full">
          <Text fontSize="2xl" fontWeight="bold" color={textColor}>
            {course?.title || "Course Modules"}
          </Text>
          <Text fontSize="md" color={mutedText}>
            {modules.length} modules • {course?.description || "Explore the learning modules"}
          </Text>
          
          {/* Overall Progress */}
          {modules.length > 0 && (
            <Box w="full" maxW="400px" mt={2}>
              <HStack justify="space-between" mb={1}>
                <Text fontSize="sm" color={mutedText} fontWeight="medium">
                  Overall Course Progress
                </Text>
                <Text fontSize="sm" color={mutedText} fontWeight="bold">
                  {overallProgress}%
                </Text>
              </HStack>
              <Progress
                value={overallProgress}
                colorScheme={getProgressColor(overallProgress)}
                size="sm"
                rounded="full"
                bg={useColorModeValue("gray.200", "gray.600")}
              />
            </Box>
          )}
        </VStack>
      </VStack>

      {/* Modules Grid */}
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
        {modules.map((module, index) => {
          const progress = progressMap[module.id] || { 
            progress: 0, 
            unitCount: 0, 
            completedUnits: 0, 
            estimatedTime: 0 
          };
          const progressColor = getProgressColor(progress.progress);
          const cardGradient = getCardGradient(progress.progress);

          return (
            <GridItem key={module.id}>
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
                onClick={() => onSelectModule(module)}
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
                    {/* Module header */}
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
                            Module {index + 1}
                          </Text>
                        </HStack>
                        <Text
                          fontSize="lg"
                          fontWeight="semibold"
                          color={textColor}
                          noOfLines={2}
                          lineHeight="tall"
                        >
                          {module.title}
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
                      {module.description}
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
                      <Tooltip label="Units Completed">
                        <HStack spacing={1}>
                          <Icon as={FiFolder} color={`${progressColor}.500`} size="14px" />
                          <Text fontSize="xs" color={mutedText}>
                            {progress.completedUnits}/{progress.unitCount}
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
                          onSelectModule(module);
                        }}
                        _hover={{
                          transform: "scale(1.02)",
                        }}
                        transition="all 0.2s"
                      >
                        {progress.progress === 100 ? "Review" : 
                         progress.progress > 0 ? "Continue" : "Start Module"}
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
      {modules.length === 0 && !loading && (
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
            No Modules Available
          </Text>
          <Text textAlign="center" maxW="md">
            This course doesn't contain any modules yet. Check back later or contact the course administrator.
          </Text>
        </Flex>
      )}
    </Flex>
  );
}
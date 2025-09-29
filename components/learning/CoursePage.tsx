import {
  SimpleGrid,
  Box,
  Text,
  VStack,
  HStack,
  Button,
  Flex,
  useColorModeValue,
  Skeleton,
  Badge,
  Icon,
  Tooltip,
} from "@chakra-ui/react";
import { 
  ComputerDesktopIcon, 
  ClockIcon,
  BookOpenIcon,
  CheckCircleIcon 
} from "@heroicons/react/24/outline";
import { useState, useEffect, useMemo } from "react";

interface Props {
  courses: any[];
  progressMap: Record<string, number>; // { courseId: percent }
  onSelectCourse: (course: any) => void;
}

// Custom circular progress component to avoid external dependency
const CircularProgress = ({ value, size = 60 }: { value: number; size?: number }) => {
  const strokeWidth = 8;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (value / 100) * circumference;

  const progressColor = useColorModeValue("blue.500", "blue.300");
  const trackColor = useColorModeValue("gray.200", "gray.600");
  const textColor = useColorModeValue("gray.700", "gray.200");

  return (
    <Box position="relative" width={`${size}px`} height={`${size}px`}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        {/* Background track */}
        <circle
          stroke={trackColor}
          strokeWidth={strokeWidth}
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
        {/* Progress bar */}
        <circle
          stroke={progressColor}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
          style={{
            transition: 'stroke-dashoffset 0.5s ease-in-out',
          }}
        />
      </svg>
      {/* Percentage text */}
      <Flex
        position="absolute"
        top="0"
        left="0"
        width="100%"
        height="100%"
        alignItems="center"
        justifyContent="center"
      >
        <Text
          fontSize="xs"
          fontWeight="bold"
          color={textColor}
        >
          {value}%
        </Text>
      </Flex>
    </Box>
  );
};

// Enhanced progress indicator with multiple states
const ProgressIndicator = ({ progress, totalModules }: { progress: number; totalModules?: number }) => {
  const [animatedProgress, setAnimatedProgress] = useState(0);

  useEffect(() => {
    // Animate progress on mount
    const timer = setTimeout(() => {
      setAnimatedProgress(progress);
    }, 100);
    return () => clearTimeout(timer);
  }, [progress]);

  const getProgressColor = (progress: number) => {
    if (progress === 0) return useColorModeValue("gray.400", "gray.500");
    if (progress < 50) return useColorModeValue("blue.400", "blue.300");
    if (progress < 100) return useColorModeValue("blue.500", "blue.400");
    return useColorModeValue("green.500", "green.400");
  };

  const getProgressStatus = (progress: number) => {
    if (progress === 0) return "Not Started";
    if (progress < 100) return "In Progress";
    return "Completed";
  };

  return (
    <VStack spacing={1} align="center">
      <CircularProgress value={animatedProgress} />
      <Badge 
        colorScheme={
          progress === 0 ? "gray" : 
          progress < 100 ? "blue" : "green"
        }
        fontSize="2xs"
        px={2}
        py={1}
        borderRadius="full"
      >
        {getProgressStatus(progress)}
      </Badge>
      {totalModules && (
        <Text fontSize="2xs" color={useColorModeValue("gray.600", "gray.400")}>
          {Math.round((progress / 100) * totalModules)}/{totalModules} modules
        </Text>
      )}
    </VStack>
  );
};

const CourseCardSkeleton = () => (
  <Box
    bg={useColorModeValue("white", "gray.700")}
    rounded="2xl"
    p={6}
    shadow="sm"
    border="1px solid"
    borderColor={useColorModeValue("gray.100", "gray.600")}
  >
    <VStack align="start" spacing={4}>
      <HStack justify="space-between" w="100%">
        <Skeleton height="24px" width="70%" />
        <Skeleton height="60px" width="60px" borderRadius="full" />
      </HStack>
      <Skeleton height="16px" width="100%" />
      <Skeleton height="16px" width="80%" />
      <Skeleton height="40px" width="100%" borderRadius="lg" />
    </VStack>
  </Box>
);

const CoursePage = ({ courses, progressMap, onSelectCourse }: Props) => {
  const [isLoading, setIsLoading] = useState(true);

  // Simulate loading state for better UX
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 300);
    return () => clearTimeout(timer);
  }, []);

  const cardBg = useColorModeValue("white", "gray.700");
  const cardHoverBg = useColorModeValue("blue.50", "blue.900");
  const borderColor = useColorModeValue("gray.100", "gray.600");
  const descriptionColor = useColorModeValue("gray.600", "gray.300");
  const gridBg = useColorModeValue("gray.50", "gray.900");

  // Memoize processed courses for performance
  const processedCourses = useMemo(() => {
    return courses.map(course => ({
      ...course,
      progress: progressMap[course.id] || 0,
      moduleCount: course.modules?.length || 0
    }));
  }, [courses, progressMap]);

  if (isLoading) {
    return (
      <Flex direction="column" w="100%" minH="100vh" p={6} bg={gridBg}>
        <SimpleGrid columns={{ base: 1, sm: 2, md: 3, lg: 4 }} spacing={6}>
          {[...Array(8)].map((_, index) => (
            <CourseCardSkeleton key={index} />
          ))}
        </SimpleGrid>
      </Flex>
    );
  }

  return (
    <Flex direction="column" w="100%" minH="100vh" p={6} bg={gridBg}>
      {/* Header */}
      <VStack spacing={4} mb={8} align="start">
        <Text fontSize="3xl" fontWeight="bold" bgGradient={useColorModeValue(
          "linear(to-r, blue.600, purple.600)",
          "linear(to-r, blue.300, purple.300)"
        )} bgClip="text">
          Learning Courses
        </Text>
        <Text color={descriptionColor} fontSize="lg">
          {processedCourses.length} course{processedCourses.length !== 1 ? 's' : ''} available
        </Text>
      </VStack>

      {/* Courses Grid */}
      <SimpleGrid 
        columns={{ base: 1, sm: 2, md: 3, lg: 4 }} 
        spacing={6}
        w="100%"
      >
        {processedCourses.map((course) => (
          <Box
            key={course.id}
            bg={cardBg}
            rounded="2xl"
            p={6}
            shadow="sm"
            border="1px solid"
            borderColor={borderColor}
            transition="all 0.3s ease-in-out"
            _hover={{ 
              shadow: "xl", 
              transform: "translateY(-4px)",
              bg: cardHoverBg,
              borderColor: useColorModeValue("blue.200", "blue.600")
            }}
            cursor="pointer"
            position="relative"
            onClick={() => onSelectCourse(course)}
            role="group"
          >
            {/* Completion Badge */}
            {course.progress === 100 && (
              <Box
                position="absolute"
                top={3}
                right={3}
                zIndex={1}
              >
                <Tooltip label="Course Completed">
                  <Icon as={CheckCircleIcon} color="green.500" boxSize={5} />
                </Tooltip>
              </Box>
            )}

            <VStack align="start" spacing={4}>
              {/* Header with progress */}
              <HStack justify="space-between" w="100%" align="start">
                <VStack align="start" spacing={1} flex={1}>
                  <Text 
                    fontSize="lg" 
                    fontWeight="bold" 
                    noOfLines={2}
                    lineHeight="short"
                  >
                    {course.title}
                  </Text>
                  {course.moduleCount > 0 && (
                    <HStack spacing={1} color={descriptionColor}>
                      <Icon as={BookOpenIcon} boxSize={3} />
                      <Text fontSize="xs">
                        {course.moduleCount} module{course.moduleCount !== 1 ? 's' : ''}
                      </Text>
                    </HStack>
                  )}
                </VStack>
                <ProgressIndicator 
                  progress={course.progress} 
                  totalModules={course.moduleCount}
                />
              </HStack>

              {/* Description */}
              {course.description && (
                <Text 
                  fontSize="sm" 
                  color={descriptionColor}
                  noOfLines={3}
                  lineHeight="short"
                >
                  {course.description}
                </Text>
              )}

              {/* Action Button */}
              <Button
                colorScheme="blue"
                variant={course.progress === 0 ? "solid" : "outline"}
                size="md"
                w="100%"
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectCourse(course);
                }}
                leftIcon={<ComputerDesktopIcon className="h-5 w-5" />}
                _groupHover={{
                  transform: "scale(1.02)",
                }}
                transition="all 0.2s"
              >
                {course.progress === 0 ? "Start Learning" : 
                 course.progress === 100 ? "Review" : "Continue"}
              </Button>

              {/* Progress bar for quick visual */}
              {course.progress > 0 && course.progress < 100 && (
                <Box w="100%" pt={2}>
                  <Box
                    w="100%"
                    h="4px"
                    bg={useColorModeValue("gray.200", "gray.600")}
                    borderRadius="full"
                    overflow="hidden"
                  >
                    <Box
                      h="100%"
                      bg={useColorModeValue("blue.500", "blue.300")}
                      borderRadius="full"
                      transition="width 0.5s ease-in-out"
                      width={`${course.progress}%`}
                    />
                  </Box>
                </Box>
              )}
            </VStack>
          </Box>
        ))}
      </SimpleGrid>

      {/* Empty State */}
      {processedCourses.length === 0 && (
        <Flex 
          direction="column" 
          align="center" 
          justify="center" 
          py={20} 
          color={descriptionColor}
        >
          <Icon as={BookOpenIcon} boxSize={16} mb={4} opacity={0.5} />
          <Text fontSize="xl" fontWeight="semibold" mb={2}>
            No Courses Available
          </Text>
          <Text textAlign="center">
            Check back later for new learning materials.
          </Text>
        </Flex>
      )}
    </Flex>
  );
};

export default CoursePage;
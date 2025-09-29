// components/learning/AnalyticsDashboard.tsx
"use client";
import React, { useEffect, useState } from "react";
import {
  VStack,
  Box,
  Text,
  Button,
  HStack,
  useToast,
  Spinner,
  Collapse,
  SimpleGrid,
  Card,
  CardHeader,
  CardBody,
  Progress,
  Badge,
  Flex,
  Heading,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  IconButton,
} from "@chakra-ui/react";
import { fetchDueCards, recordReview, SRSRow } from "@/lib/srs";
import { supabase } from "@/lib/supabaseClient";
import type { QuizQuestion } from "@/lib/adminApi";
import { JSONContent } from "@tiptap/react";
import { RichTextView } from "@/components/RichTextView";
import { FaChevronRight, FaRepeat} from "react-icons/fa6";
import {WiTime1} from "react-icons/wi";

interface AnalyticsDashboardProps {
  userId: string;
  language?: string;
}

interface AnalyticsData {
  dueCards: SRSRow[];
  courseProgress: any[];
  quizPerformance: any[];
  srsStats: {
    totalCards: number;
    dueNow: number;
    averageEase: number;
    retentionRate: number;
    totalReviews: number;
  };
  learningStreak: number;
  recentActivity: any[];
}

export default function Spaced_Repition({
  userId,
  language = "en",
}: AnalyticsDashboardProps) {
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [deck, setDeck] = useState<SRSRow[]>([]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [reviewLoading, setReviewLoading] = useState(false);

  const emptyDoc: JSONContent = {
    type: "doc",
    content: [{ type: "paragraph", content: [] }],
  };

  const loadAnalyticsData = async () => {
    if (!userId) return;
    setLoading(true);
    try {
      // Load due cards for SRS review
      const { data: dueCards, error: cardsError } = await fetchDueCards(userId, 50);
      if (cardsError) throw cardsError;

      // Load course progress
      const { data: courseProgress, error: progressError } = await supabase
        .from("user_course_progress")
        .select(`
          *,
          courses(title),
          modules(title),
          units(title),
          lessons(title)
        `)
        .eq("user_id", userId);

      if (progressError) throw progressError;

      // Load quiz performance
      const { data: quizAttempts, error: quizError } = await supabase
        .from("user_quiz_attempts")
        .select(`
          *,
          lessons(title),
          quizzes(passing_score)
        `)
        .eq("user_id", userId)
        .order("attempted_at", { ascending: false })
        .limit(20);

      if (quizError) throw quizError;

      // Load SRS statistics
      const { data: srsProgress, error: srsError } = await supabase
        .from("user_srs_progress")
        .select("*")
        .eq("user_id", userId);

      if (srsError) throw srsError;

      // Calculate SRS stats
      const totalCards = srsProgress?.length || 0;
      const dueNow = dueCards?.length || 0;
      const averageEase = srsProgress?.reduce((acc, curr) => acc + (curr.ease_factor || 2.5), 0) / totalCards || 2.5;
      const totalReviews = srsProgress?.reduce((acc, curr) => acc + (curr.correct_attempts || 0) + (curr.wrong_attempts || 0), 0) || 0;
      const correctReviews = srsProgress?.reduce((acc, curr) => acc + (curr.correct_attempts || 0), 0) || 0;
      const retentionRate = totalReviews > 0 ? (correctReviews / totalReviews) * 100 : 0;

      // Calculate learning streak (simplified - last 7 days with activity)
      const { data: recentReviews } = await supabase
        .from("user_srs_progress")
        .select("last_reviewed")
        .eq("user_id", userId)
        .gte("last_reviewed", new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
        .order("last_reviewed", { ascending: false });

      const learningStreak = recentReviews?.length > 0 ? 1 : 0; // Simplified streak calculation

      const analytics: AnalyticsData = {
        dueCards: dueCards || [],
        courseProgress: courseProgress || [],
        quizPerformance: quizAttempts || [],
        srsStats: {
          totalCards,
          dueNow,
          averageEase: Number(averageEase.toFixed(2)),
          retentionRate: Number(retentionRate.toFixed(1)),
          totalReviews,
        },
        learningStreak,
        recentActivity: [
          ...(quizAttempts?.slice(0, 5) || []),
          ...(recentReviews?.slice(0, 5) || [])
        ].sort((a, b) => new Date(b.attempted_at || b.last_reviewed).getTime() - new Date(a.attempted_at || a.last_reviewed).getTime())
      };

      setAnalyticsData(analytics);
      setDeck(dueCards || []);
    } catch (error) {
      console.error("Error loading analytics:", error);
      toast({ title: "Error loading analytics", status: "error" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnalyticsData();
  }, [userId]);

  const startReviewSession = () => {
    if (analyticsData?.dueCards.length === 0) {
      toast({ title: "No cards due for review! 🎉", status: "info" });
      return;
    }
    setCurrentCardIndex(0);
    setShowAnswer(false);
    onOpen();
  };

  const applyQuality = async (quality: 0 | 3 | 4 | 5 | number) => {
    if (!deck[currentCardIndex]) return;
    setReviewLoading(true);
    try {
      await recordReview(userId, deck[currentCardIndex].question_id, quality);

      // Move to next card or close modal if finished
      if (currentCardIndex < deck.length - 1) {
        setCurrentCardIndex(prev => prev + 1);
        setShowAnswer(false);
      } else {
        onClose();
        toast({ title: "Review session completed! 🎉", status: "success" });
        loadAnalyticsData(); // Refresh data
      }
    } catch (err) {
      console.error("recordReview error", err);
      toast({ title: "Error saving review", status: "error" });
    } finally {
      setReviewLoading(false);
    }
  };

  const currentCard = deck[currentCardIndex];
  const currentQuestion = currentCard?.quiz_questions as QuizQuestion | undefined;

  if (loading) {
    return (
      <Flex justify="center" align="center" minH="400px">
        <Spinner size="xl" />
      </Flex>
    );
  }

  if (!analyticsData) {
    return (
      <Box textAlign="center" p={8}>
        <Text>Failed to load analytics data</Text>
        <Button onClick={loadAnalyticsData} mt={4}>
          Retry
        </Button>
      </Box>
    );
  }

  return (
    <Box p={6}>
      {/* Header */}
      <Flex justify="space-between" align="center" mb={8}>
        <VStack align="start" spacing={1}>
          <Heading size="lg">Learning Analytics</Heading>
          <Text color="gray.600">Track your progress and performance</Text>
        </VStack>
        <Button
          colorScheme="blue"
          size="lg"
          onClick={startReviewSession}
          leftIcon={<FaRepeat />}
          isDisabled={analyticsData.dueCards.length === 0}
        >
          Review Due Cards ({analyticsData.dueCards.length})
        </Button>
      </Flex>

      {/* Stats Grid */}
      <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6} mb={8}>
        <Card>
          <CardBody>
            <Stat>
              <StatLabel>Cards Due</StatLabel>
              <StatNumber>{analyticsData.srsStats.dueNow}</StatNumber>
              <StatHelpText>Ready for review</StatHelpText>
            </Stat>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <Stat>
              <StatLabel>Retention Rate</StatLabel>
              <StatNumber>{analyticsData.srsStats.retentionRate}%</StatNumber>
              <StatHelpText>Correct answers</StatHelpText>
            </Stat>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <Stat>
              <StatLabel>Total Reviews</StatLabel>
              <StatNumber>{analyticsData.srsStats.totalReviews}</StatNumber>
              <StatHelpText>All time</StatHelpText>
            </Stat>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <Stat>
              <StatLabel>Average Ease</StatLabel>
              <StatNumber>{analyticsData.srsStats.averageEase}</StatNumber>
              <StatHelpText>Higher is easier</StatHelpText>
            </Stat>
          </CardBody>
        </Card>
      </SimpleGrid>

      {/* Course Progress */}
      <Card mb={6}>
        <CardHeader>
          <Heading size="md">Course Progress</Heading>
        </CardHeader>
        <CardBody>
          {analyticsData.courseProgress.length === 0 ? (
            <Text color="gray.500">No course progress data available</Text>
          ) : (
            <VStack align="stretch" spacing={4}>
              {analyticsData.courseProgress.map((progress) => (
                <Box key={progress.id}>
                  <Flex justify="space-between" mb={2}>
                    <Text fontWeight="medium">{progress.courses?.title || 'Unknown Course'}</Text>
                    <Text>
                      {progress.completed_lessons}/{progress.total_lessons} lessons
                    </Text>
                  </Flex>
                  <Progress
                    value={(progress.completed_lessons / progress.total_lessons) * 100}
                    colorScheme="blue"
                    size="lg"
                    borderRadius="full"
                  />
                </Box>
              ))}
            </VStack>
          )}
        </CardBody>
      </Card>

      {/* Recent Quiz Performance */}
      <Card mb={6}>
        <CardHeader>
          <Heading size="md">Recent Quiz Performance</Heading>
        </CardHeader>
        <CardBody>
          {analyticsData.quizPerformance.length === 0 ? (
            <Text color="gray.500">No quiz attempts yet</Text>
          ) : (
            <Table variant="simple">
              <Thead>
                <Tr>
                  <Th>Lesson</Th>
                  <Th>Score</Th>
                  <Th>Status</Th>
                  <Th>Date</Th>
                </Tr>
              </Thead>
              <Tbody>
                {analyticsData.quizPerformance.map((attempt) => (
                  <Tr key={attempt.id}>
                    <Td>{attempt.lessons?.title || 'Unknown Lesson'}</Td>
                    <Td>
                      <Badge
                        colorScheme={attempt.score >= 70 ? 'green' : 'red'}
                        fontSize="sm"
                      >
                        {attempt.score}%
                      </Badge>
                    </Td>
                    <Td>
                      <Badge
                        colorScheme={attempt.passed ? 'green' : 'red'}
                      >
                        {attempt.passed ? 'Passed' : 'Failed'}
                      </Badge>
                    </Td>
                    <Td>
                      {new Date(attempt.attempted_at).toLocaleDateString()}
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          )}
        </CardBody>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <Heading size="md">Recent Activity</Heading>
        </CardHeader>
        <CardBody>
          {analyticsData.recentActivity.length === 0 ? (
            <Text color="gray.500">No recent activity</Text>
          ) : (
            <VStack align="stretch" spacing={3}>
              {analyticsData.recentActivity.slice(0, 10).map((activity, index) => (
                <Flex key={index} justify="space-between" align="center" p={3} bg="gray.50" borderRadius="md">
                  <HStack>
                    <WiTime1 color="gray.500" />
                    <Text fontSize="sm">
                      {activity.score !== undefined ? `Quiz: ${activity.score}%` : 'SRS Review'}
                    </Text>
                  </HStack>
                  <Text fontSize="sm" color="gray.500">
                    {new Date(activity.attempted_at || activity.last_reviewed).toLocaleDateString()}
                  </Text>
                </Flex>
              ))}
            </VStack>
          )}
        </CardBody>
      </Card>

      {/* SRS Review Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="xl" isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            <HStack justify="space-between">
              <Text>SRS Review</Text>
              <Text fontSize="sm" color="gray.500">
                Card {currentCardIndex + 1} of {deck.length}
              </Text>
            </HStack>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            {currentCard && (
              <VStack align="stretch" spacing={4}>
                {/* Question */}
                <Box p={4} borderWidth="1px" borderRadius="md">
                  <RichTextView 
                    content={
                      typeof currentQuestion?.question_text === "string"
                        ? { type: "doc", content: [{ type: "paragraph", text: currentQuestion.question_text }] }
                        : currentQuestion?.question_text || emptyDoc
                    } 
                  />
                </Box>

                {/* Answer */}
                <Collapse in={showAnswer}>
                  <Box p={4} borderWidth="1px" borderRadius="md" bg="gray.50">
                    <Text fontWeight="semibold" mb={3}>Answer</Text>
                    
                    {/* Options */}
                    {Array.isArray(currentQuestion?.options) && (
                      <VStack align="start" spacing={2} mb={3}>
                        {currentQuestion.options.map((opt: any, i: number) => (
                          <Text key={i} pl={2}>
                            • {typeof opt === "string" ? opt : JSON.stringify(opt)}
                          </Text>
                        ))}
                      </VStack>
                    )}

                    {/* Explanation */}
                    {currentQuestion?.explanation && (
                      <Box mt={3}>
                        <Text fontWeight="medium" mb={2}>Explanation:</Text>
                        <RichTextView 
                          content={
                            typeof currentQuestion.explanation === "string"
                              ? { type: "doc", content: [{ type: "paragraph", text: currentQuestion.explanation }] }
                              : currentQuestion.explanation || emptyDoc
                          } 
                        />
                      </Box>
                    )}
                  </Box>
                </Collapse>

                {/* Actions */}
                {!showAnswer ? (
                  <Button
                    colorScheme="blue"
                    onClick={() => setShowAnswer(true)}
                    size="lg"
                  >
                    Reveal Answer
                  </Button>
                ) : (
                  <VStack spacing={3}>
                    <Text fontSize="sm" color="gray.600" textAlign="center">
                      How well did you remember this?
                    </Text>
                    <HStack spacing={3} justify="center">
                      <Button
                        colorScheme="red"
                        onClick={() => applyQuality(0)}
                        isLoading={reviewLoading}
                        size="sm"
                      >
                        Again
                      </Button>
                      <Button
                        colorScheme="orange"
                        onClick={() => applyQuality(3)}
                        isLoading={reviewLoading}
                        size="sm"
                      >
                        Hard
                      </Button>
                      <Button
                        colorScheme="green"
                        onClick={() => applyQuality(4)}
                        isLoading={reviewLoading}
                        size="sm"
                      >
                        Good
                      </Button>
                      <Button
                        colorScheme="teal"
                        onClick={() => applyQuality(5)}
                        isLoading={reviewLoading}
                        size="sm"
                      >
                        Easy
                      </Button>
                    </HStack>
                  </VStack>
                )}
              </VStack>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
}
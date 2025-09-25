import { useState, useEffect } from "react";
import {
  Box,
  Flex,
  Heading,
  Button,
  Spinner,
  Input,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Collapse,
  IconButton,
  Text,
  useToast,
} from "@chakra-ui/react";
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  ChevronDownIcon,
  ChevronUpIcon,
} from "@heroicons/react/24/solid";
import {
  fetchCourses,
  deleteCourse,
  fetchModules,
  deleteModule,
  fetchUnits,
  deleteUnit,
  fetchLessons,
  deleteLesson,
  fetchQuizzes,
  deleteQuiz,
  fetchQuizQuestions,
  deleteQuizQuestion,
} from "@/lib/adminApi";
import CourseModal from "./modals/CourseModal";
import ModuleModal from "./modals/ModuleModal";
import UnitModal from "./modals/UnitModal";
import LessonModal from "./modals/LessonModal";
import QuizModal from "./modals/QuizModal";
import QuizQuestionModal from "./modals/QuizQuestionModal";
import {
  Course,
  Module,
  Unit,
  Lesson,
  Quiz,
  QuizQuestion,
} from "@/lib/adminApi";

export default function CoursesSection() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const toast = useToast();

  // State for modals
  const [courseModal, setCourseModal] = useState<{
    open: boolean;
    course?: Course | null;
  }>({ open: false });
  const [moduleModal, setModuleModal] = useState<{
    open: boolean;
    module?: Module | null;
    courseId?: string;
  }>({ open: false });
  const [unitModal, setUnitModal] = useState<{
    open: boolean;
    unit?: Unit | null;
    moduleId?: string;
  }>({ open: false });
  const [lessonModal, setLessonModal] = useState<{
    open: boolean;
    lesson?: Lesson | null;
    unitId?: string;
  }>({ open: false });
  const [quizModal, setQuizModal] = useState<{
    open: boolean;
    quiz?: Quiz | null;
    lessonId?: string;
  }>({ open: false });
  const [quizQuestionModal, setQuizQuestionModal] = useState<{
    open: boolean;
    question?: QuizQuestion | null;
    quizId?: string;
  }>({ open: false });

  // Expanded state for collapsible rows
  const [expandedCourse, setExpandedCourse] = useState<string | null>(null);
  const [expandedModule, setExpandedModule] = useState<string | null>(null);
  const [expandedUnit, setExpandedUnit] = useState<string | null>(null);
  const [expandedLesson, setExpandedLesson] = useState<string | null>(null);

  const loadCourses = async () => {
    setLoading(true);
    try {
      const res = await fetchCourses(); // { data: Course[]; error: any }
      if (res.error) throw res.error;
      setCourses(res.data || []);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCourses();
  }, []);

  const filteredCourses = courses.filter((c) =>
    c.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Box w="100%" h="100%">
      <Flex justify="space-between" mb={4} align="center">
        <Heading size="md">Courses</Heading>
        <Button
          leftIcon={<PlusIcon />}
          colorScheme="blue"
          onClick={() => setCourseModal({ open: true, course: null })}
        >
          Add Course
        </Button>
      </Flex>

      <Input
        placeholder="Search courses..."
        mb={4}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {loading ? (
        <Spinner />
      ) : (
        <Table variant="simple" size="sm">
          <Thead>
            <Tr>
              <Th>Title</Th>
              <Th>Type</Th>
              <Th>Actions</Th>
            </Tr>
          </Thead>
          <Tbody>
            {filteredCourses.map((course) => (
              <Box key={course.id}>
                <Tr>
                  <Td>
                    <Flex align="center">
                      <IconButton
                        aria-label="expand"
                        icon={
                          expandedCourse === course.id ? (
                            <ChevronUpIcon />
                          ) : (
                            <ChevronDownIcon />
                          )
                        }
                        size="xs"
                        variant="ghost"
                        onClick={() =>
                          setExpandedCourse(
                            expandedCourse === course.id ? null : course.id
                          )
                        }
                        mr={2}
                      />
                      {course.title}
                    </Flex>
                  </Td>
                  <Td>Course</Td>
                  <Td>
                    <IconButton
                      icon={<PencilIcon />}
                      aria-label="edit"
                      size="xs"
                      mr={2}
                      onClick={() => setCourseModal({ open: true, course })}
                    />
                    <IconButton
                      icon={<TrashIcon />}
                      aria-label="delete"
                      size="xs"
                      onClick={async () => {
                        await deleteCourse(course.id);
                        loadCourses();
                      }}
                    />
                  </Td>
                </Tr>

                <Collapse in={expandedCourse === course.id} animateOpacity>
                  {course.modules?.map((module) => (
                    <Box key={module.id} pl={8}>
                      <Tr>
                        <Td>
                          <Flex align="center">
                            <IconButton
                              aria-label="expand"
                              icon={
                                expandedModule === module.id ? (
                                  <ChevronUpIcon />
                                ) : (
                                  <ChevronDownIcon />
                                )
                              }
                              size="xs"
                              variant="ghost"
                              onClick={() =>
                                setExpandedModule(
                                  expandedModule === module.id
                                    ? null
                                    : module.id
                                )
                              }
                              mr={2}
                            />
                            {module.title}
                          </Flex>
                        </Td>
                        <Td>Module</Td>
                        <Td>
                          <IconButton
                            icon={<PencilIcon />}
                            aria-label="edit"
                            size="xs"
                            mr={2}
                            onClick={() =>
                              setModuleModal({
                                open: true,
                                module,
                                courseId: course.id,
                              })
                            }
                          />
                          <IconButton
                            icon={<TrashIcon />}
                            aria-label="delete"
                            size="xs"
                            onClick={async () => {
                              await deleteModule(module.id);
                              loadCourses();
                            }}
                          />
                        </Td>
                      </Tr>

                      <Collapse
                        in={expandedModule === module.id}
                        animateOpacity
                      >
                        {module.units?.map((unit) => (
                          <Box key={unit.id} pl={8}>
                            <Tr>
                              <Td>
                                <Flex align="center">
                                  <IconButton
                                    aria-label="expand"
                                    icon={
                                      expandedUnit === unit.id ? (
                                        <ChevronUpIcon />
                                      ) : (
                                        <ChevronDownIcon />
                                      )
                                    }
                                    size="xs"
                                    variant="ghost"
                                    onClick={() =>
                                      setExpandedUnit(
                                        expandedUnit === unit.id
                                          ? null
                                          : unit.id
                                      )
                                    }
                                    mr={2}
                                  />
                                  {unit.title}
                                </Flex>
                              </Td>
                              <Td>Unit</Td>
                              <Td>
                                <IconButton
                                  icon={<PencilIcon />}
                                  aria-label="edit"
                                  size="xs"
                                  mr={2}
                                  onClick={() =>
                                    setUnitModal({
                                      open: true,
                                      unit,
                                      moduleId: module.id,
                                    })
                                  }
                                />
                                <IconButton
                                  icon={<TrashIcon />}
                                  aria-label="delete"
                                  size="xs"
                                  onClick={async () => {
                                    await deleteUnit(unit.id);
                                    loadCourses();
                                  }}
                                />
                              </Td>
                            </Tr>

                            <Collapse
                              in={expandedUnit === unit.id}
                              animateOpacity
                            >
                              {unit.lessons?.map((lesson) => (
                                <Box key={lesson.id} pl={8}>
                                  <Tr>
                                    <Td>
                                      <Flex align="center">
                                        <IconButton
                                          aria-label="expand"
                                          icon={
                                            expandedLesson === lesson.id ? (
                                              <ChevronUpIcon />
                                            ) : (
                                              <ChevronDownIcon />
                                            )
                                          }
                                          size="xs"
                                          variant="ghost"
                                          onClick={() =>
                                            setExpandedLesson(
                                              expandedLesson === lesson.id
                                                ? null
                                                : lesson.id
                                            )
                                          }
                                          mr={2}
                                        />
                                        {lesson.title}
                                      </Flex>
                                    </Td>
                                    <Td>Lesson</Td>
                                    <Td>
                                      <IconButton
                                        icon={<PencilIcon />}
                                        aria-label="edit"
                                        size="xs"
                                        mr={2}
                                        onClick={() =>
                                          setLessonModal({
                                            open: true,
                                            lesson,
                                            unitId: unit.id,
                                          })
                                        }
                                      />
                                      <IconButton
                                        icon={<TrashIcon />}
                                        aria-label="delete"
                                        size="xs"
                                        onClick={async () => {
                                          await deleteLesson(lesson.id);
                                          loadCourses();
                                        }}
                                      />
                                    </Td>
                                  </Tr>

                                  <Collapse
                                    in={expandedLesson === lesson.id}
                                    animateOpacity
                                  >
                                    {lesson.quizzes?.map((quiz) => (
                                      <Box key={quiz.id} pl={8}>
                                        <Tr>
                                          <Td>{quiz.id}</Td>
                                          <Td>Quiz</Td>
                                          <Td>
                                            <IconButton
                                              icon={<PencilIcon />}
                                              aria-label="edit"
                                              size="xs"
                                              mr={2}
                                              onClick={() =>
                                                setQuizModal({
                                                  open: true,
                                                  quiz,
                                                  lessonId: lesson.id,
                                                })
                                              }
                                            />
                                            <IconButton
                                              icon={<TrashIcon />}
                                              aria-label="delete"
                                              size="xs"
                                              onClick={async () => {
                                                await deleteQuiz(quiz.id);
                                                loadCourses();
                                              }}
                                            />
                                          </Td>
                                        </Tr>

                                        {/* Quiz Questions */}
                                        {quiz.questions?.map((q) => (
                                          <Box key={q.id} pl={8}>
                                            <Tr>
                                              <Td>{q.question_text}</Td>
                                              <Td>Question</Td>
                                              <Td>
                                                <IconButton
                                                  icon={<PencilIcon />}
                                                  aria-label="edit"
                                                  size="xs"
                                                  mr={2}
                                                  onClick={() =>
                                                    setQuizQuestionModal({
                                                      open: true,
                                                      question: q,
                                                      quizId: quiz.id,
                                                    })
                                                  }
                                                />
                                                <IconButton
                                                  icon={<TrashIcon />}
                                                  aria-label="delete"
                                                  size="xs"
                                                  onClick={async () => {
                                                    await deleteQuizQuestion(
                                                      q.id
                                                    );
                                                    loadCourses();
                                                  }}
                                                />
                                              </Td>
                                            </Tr>
                                          </Box>
                                        ))}
                                        <Button
                                          size="xs"
                                          mt={1}
                                          ml={8}
                                          onClick={() =>
                                            setQuizQuestionModal({
                                              open: true,
                                              quizId: quiz.id,
                                            })
                                          }
                                        >
                                          Add Question
                                        </Button>
                                      </Box>
                                    ))}
                                    <Button
                                      size="xs"
                                      mt={1}
                                      ml={8}
                                      onClick={() =>
                                        setQuizModal({
                                          open: true,
                                          lessonId: lesson.id,
                                        })
                                      }
                                    >
                                      Add Quiz
                                    </Button>
                                  </Collapse>
                                </Box>
                              ))}
                              <Button
                                size="xs"
                                mt={1}
                                ml={8}
                                onClick={() =>
                                  setLessonModal({
                                    open: true,
                                    unitId: unit.id,
                                  })
                                }
                              >
                                Add Lesson
                              </Button>
                            </Collapse>
                          </Box>
                        ))}
                        <Button
                          size="xs"
                          mt={1}
                          ml={8}
                          onClick={() =>
                            setUnitModal({ open: true, moduleId: module.id })
                          }
                        >
                          Add Unit
                        </Button>
                      </Collapse>
                    </Box>
                  ))}
                  <Button
                    size="xs"
                    mt={1}
                    ml={8}
                    onClick={() =>
                      setModuleModal({ open: true, courseId: course.id })
                    }
                  >
                    Add Module
                  </Button>
                </Collapse>
              </Box>
            ))}
          </Tbody>
        </Table>
      )}

      {/* Modals */}
      {courseModal.open && (
        <CourseModal
          isOpen={courseModal.open}
          course={courseModal.course}
          onClose={() => setCourseModal({ open: false })}
          refresh={loadCourses}
        />
      )}
      {moduleModal.open && (
        <ModuleModal
          isOpen={moduleModal.open}
          module={moduleModal.module}
          courseId={moduleModal.courseId!}
          onClose={() => setModuleModal({ open: false })}
          refresh={loadCourses}
        />
      )}
      {unitModal.open && (
        <UnitModal
          isOpen={unitModal.open}
          unit={unitModal.unit}
          moduleId={unitModal.moduleId!}
          onClose={() => setUnitModal({ open: false })}
          refresh={loadCourses}
        />
      )}
      {lessonModal.open && (
        <LessonModal
          isOpen={lessonModal.open}
          lesson={lessonModal.lesson}
          unitId={lessonModal.unitId!}
          onClose={() => setLessonModal({ open: false })}
          refresh={loadCourses}
        />
      )}
      {quizModal.open && (
        <QuizModal
          isOpen={quizModal.open}
          quiz={quizModal.quiz}
          lessonId={quizModal.lessonId!}
          onClose={() => setQuizModal({ open: false })}
          refresh={loadCourses}
        />
      )}
      {quizQuestionModal.open && (
        <QuizQuestionModal
          isOpen={quizQuestionModal.open}
          question={quizQuestionModal.question}
          quizId={quizQuestionModal.quizId!}
          onClose={() => setQuizQuestionModal({ open: false })}
          refresh={loadCourses}
        />
      )}
    </Box>
  );
}

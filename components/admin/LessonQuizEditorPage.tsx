// components/admin/CoursesAdmin.tsx
"use client";

import React, { useEffect, useState, useCallback, useMemo } from "react";
import {
  Box,
  Flex,
  Heading,
  Button,
  Spinner,
  Input,
  IconButton,
  Text,
  FormControl,
  FormLabel,
  Input as ChakraInput,
  Textarea,
  NumberInput,
  NumberInputField,
  useToast,
  Divider,
  VStack,
  HStack,
  Stack,
  Collapse,
} from "@chakra-ui/react";

import { useEditor, EditorContent, JSONContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import RichTextEditor from "@/components/RichTextEditor";
import { RichTextView } from "@/components/RichTextView";

import {
  createCourse,
  updateCourse,
  deleteCourse,
  createModule,
  updateModule,
  deleteModule,
  createUnit,
  updateUnit,
  deleteUnit,
  createLesson,
  updateLesson,
  deleteLesson,
  // quiz & question
  createQuiz,
  deleteQuiz,
  createQuizQuestion,
  deleteQuizQuestion,
} from "@/lib/adminApi";
import { fetchCourseWithContent } from "@/lib/learn";

import {
  ChevronDownIcon,
  ChevronUpIcon,
  PencilIcon,
  TrashIcon,
  PlusIcon,
} from "@heroicons/react/24/solid";
import { Box as ChakraBox } from "@chakra-ui/react";
import {
  QuizQuestion,
  Quiz,
  Lesson,
  Unit,
  Module,
  Course,
} from "@/lib/adminApi";
import { useAuth } from "@/context/authContext";
/* ---------------------------
  Helper: small HeroIcon wrapper for Chakra sizing
  --------------------------- */
const Icon = (IconComp: any, props: any = {}) => (
  <ChakraBox as={IconComp} {...props} />
);

/* ---------------------------
  The Component
  --------------------------- */
export default function CoursesAdmin() {
  const toast = useToast();
  const { user } = useAuth();

  // main data
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>("");

  // UI state: which tree nodes are expanded
  const [expandedById, setExpandedById] = useState<Record<string, boolean>>({});

  // Selected node: type + id
  type Selected =
    | { type: "course"; id: string }
    | { type: "module"; id: string }
    | { type: "unit"; id: string }
    | { type: "lesson"; id: string }
    | null;

  const [selected, setSelected] = useState<Selected>(null);

  // prefetch quizzes for a lesson
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);

  //   useEffect(() => {
  //   if (!lesson?.id) return;

  //   const fetchQuizzes = async () => {
  //     try {
  //       const { data, error } = await supabase
  //         .from('quizzes')
  //         .select('*')
  //         .eq('lesson_id', lesson.id);

  //       if (error) throw error;

  //       setQuizzes(data || []);
  //     } catch (err) {
  //       console.error('Error fetching quizzes:', err);
  //     }
  //   };

  //   fetchQuizzes();
  // }, [lesson?.id]);

  // Right-pane editing forms
  // Course form
  const [courseTitle, setCourseTitle] = useState("");
  const [courseDescription, setCourseDescription] = useState("");

  // Module form
  const [moduleTitle, setModuleTitle] = useState("");

  // Unit form
  const [unitTitle, setUnitTitle] = useState("");

  // Lesson form / editor
  const [lessonTitle, setLessonTitle] = useState("");
  const [lessonOrder, setLessonOrder] = useState<number>(0);
  const [lessonContent, setLessonContent] = useState<any>(null);
  const [questionText, setQuestionText] = useState<any>(null);

  // TipTap editor setup (SSR-safe)
  const editor = useEditor({
    extensions: [StarterKit, Image, Link],
    content: "",
    editorProps: { attributes: { class: "prose max-w-none" } },
    immediatelyRender: false,
  });

  // Quiz form (for new question creation)
  const [newQuestionText, setNewQuestionText] = useState<JSONContent | null>(
    null
  );
  const [newOptions, setNewOptions] = useState<string[]>(["", "", "", ""]);
  const [newCorrect, setNewCorrect] = useState<number[]>([]);
  const [newExplanation, setNewExplanation] = useState("");

  // Load data
  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchCourseWithContent();
      // Ensure consistent shape: make arrays exist
      const normalized = (data || []).map((c: any) => ({
        ...c,
        modules: (c.modules || []).map((m: any) => ({
          ...m,
          units: (m.units || []).map((u: any) => ({
            ...u,
            lessons: (u.lessons || []).map((l: any) => ({
              ...l,
              quizzes: (l.quizzes || []).map((q: any) => ({
                ...q,
                questions: q.quiz_questions || [], // ✅ normalize questions array
              })),
            })),
          })),
        })),
      })) as Course[];
      setCourses(normalized);
    } catch (err: any) {
      console.error(err);
      toast({ title: "Failed to load courses", status: "error" });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    load();
  }, [load]);

  // Toggle expand by id
  const toggleExpand = (id: string) => {
    setExpandedById((s) => ({ ...s, [id]: !s[id] }));
  };

  // Unwrap pattern if your adminApi returns { data, error }
  const unwrap = async <T,>(p: Promise<{ data: T; error: any }>) => {
    const r = await p;
    if (r.error) throw r.error;
    return r.data;
  };

  /* ---------------------------
    Helpers to find & update nested course data immutably
     - updateCourseTree: takes a callback that receives a shallow copy and returns updated copy
    --------------------------- */
  const updateCourseTree = (updater: (s: Course[]) => Course[]) => {
    setCourses((prev) => updater(prev.map((c) => ({ ...c }))));
  };

  // find helpers
  const findCourse = (id: string) => courses.find((c) => c.id === id) || null;
  const findModule = (id: string) => {
    for (const c of courses) {
      const m = (c.modules || []).find((mm) => mm.id === id);
      if (m) return { course: c, module: m };
    }
    return null;
  };
  const findUnit = (id: string) => {
    for (const c of courses) {
      for (const m of c.modules || []) {
        const u = (m.units || []).find((uu) => uu.id === id);
        if (u) return { course: c, module: m, unit: u };
      }
    }
    return null;
  };
  const findLesson = (id: string) => {
    for (const c of courses) {
      for (const m of c.modules || []) {
        for (const u of m.units || []) {
          const l = (u.lessons || []).find((ll) => ll.id === id);
          if (l) return { course: c, module: m, unit: u, lesson: l };
        }
      }
    }
    return null;
  };

  /* ---------------------------
    Selection: when user clicks a node, populate right-side form
    --------------------------- */

  const emptyDoc: JSONContent = {
    type: "doc",
    content: [
      {
        type: "paragraph",
        content: [],
      },
    ],
  };
  const selectNode = (node: Selected) => {
    setSelected(node);
    // reset form fields then populate depending on type
    setCourseTitle("");
    setCourseDescription("");
    setModuleTitle("");
    setUnitTitle("");
    setLessonTitle("");
    setLessonOrder(0);
    editor?.commands.setContent("");
    setNewQuestionText(emptyDoc);
    setNewOptions(["", "", "", ""]);
    setNewCorrect([]);
    setNewExplanation("");

    if (!node) return;

    if (node.type === "course") {
      const c = findCourse(node.id);
      if (c) {
        setCourseTitle(c.title || "");
        setCourseDescription(c.description || "");
      }
    } else if (node.type === "module") {
      const found = findModule(node.id);
      if (found) setModuleTitle(found.module.title || "");
    } else if (node.type === "unit") {
      const found = findUnit(node.id);
      if (found) setUnitTitle(found.unit.title || "");
    } else if (node.type === "lesson") {
      const found = findLesson(node.id);
      if (found && found.lesson) {
        setLessonTitle(found.lesson.title || "");
        setLessonOrder(found.lesson.order_index || 0);
        // TipTap content guard: accept string (HTML) or ProseMirror JSON doc
        const content = found.lesson.content;
        if (editor) {
          if (typeof content === "string") {
            try {
              editor.commands.setContent(content);
            } catch (err) {
              // fallback: clear or attempt to put html
              editor.commands.clearContent();
            }
          } else if (content && typeof content === "object") {
            // Try as JSON doc first, fallback to clear
            try {
              editor.commands.setContent(content);
            } catch (err) {
              // If JSON fails (unknown nodes), fallback to clear
              editor.commands.clearContent();
            }
          } else {
            editor.commands.clearContent();
          }
        }
      }
    }
  };

  /* ---------------------------
    CRUD handlers
    - Course / Module / Unit / Lesson create/update/delete
    - Quiz & QuizQuestion inline CRUD under Lesson
    --------------------------- */

  // COURSE
  const handleCreateCourse = async () => {
    const title = prompt("New course title");
    if (!title) return;
    try {
      const created = await unwrap(
        createCourse({ title, created_by: user.id })
      );
      // add to state
      updateCourseTree((prev) => [
        ...prev,
        { ...(created as any), modules: created.modules || [] },
      ]);
      toast({ title: "Course created", status: "success" });
    } catch (err: any) {
      toast({
        title: "Error creating course",
        description: String(err),
        status: "error",
      });
    }
  };

  const handleSaveCourse = async () => {
    if (!selected || selected.type !== "course") return;
    try {
      const updated = await unwrap(
        updateCourse(selected.id, {
          title: courseTitle,
          description: courseDescription,
        })
      );
      updateCourseTree((prev) =>
        prev.map((c) =>
          c.id === updated.id
            ? { ...updated, modules: updated.modules || [] }
            : c
        )
      );
      toast({ title: "Course updated", status: "success" });
    } catch (err: any) {
      toast({
        title: "Error updating course",
        description: String(err),
        status: "error",
      });
    }
  };

  const handleDeleteCourseLocal = async (id: string) => {
    if (!confirm("Delete course permanently?")) return;
    try {
      await deleteCourse(id);
      updateCourseTree((prev) => prev.filter((c) => c.id !== id));
      if (selected?.type === "course" && selected.id === id) setSelected(null);
      toast({ title: "Course deleted", status: "info" });
    } catch (err: any) {
      toast({
        title: "Error deleting course",
        description: String(err),
        status: "error",
      });
    }
  };

  // MODULE
  const handleCreateModule = async (courseId: string) => {
    const title = prompt("New module title");
    if (!title) return;
    try {
      // Find the parent module in the current course tree
      let maxOrder = 0;
      updateCourseTree((prev) => {
        prev.forEach((course) => {
          if (course) {
            maxOrder =
              course.modules?.reduce(
                (max, m) => Math.max(max, m.order_index ?? 0),
                0
              ) ?? 0;
          }
        });
        return prev;
      });

      // Set order_index to max + 1
      const order_index = maxOrder + 1;
      const created = await unwrap(
        createModule({ title, course_id: courseId, order_index })
      );
      // push into course.modules
      updateCourseTree((prev) =>
        prev.map((c) =>
          c.id === courseId
            ? {
                ...c,
                modules: [
                  ...(c.modules || []),
                  { ...(created as any), units: created.units || [] },
                ],
              }
            : c
        )
      );
      toast({ title: "Module created", status: "success" });
    } catch (err: any) {
      toast({
        title: "Error creating module",
        description: String(err),
        status: "error",
      });
    }
  };

  const handleSaveModule = async () => {
    if (!selected || selected.type !== "module") return;
    try {
      const updated = await unwrap(
        updateModule(selected.id, { title: moduleTitle })
      );
      // put into tree
      updateCourseTree((prev) =>
        prev.map((c) => ({
          ...c,
          modules: c.modules.map((m) =>
            m.id === updated.id ? { ...updated, units: updated.units || [] } : m
          ),
        }))
      );
      toast({ title: "Module updated", status: "success" });
    } catch (err: any) {
      toast({
        title: "Error updating module",
        description: String(err),
        status: "error",
      });
    }
  };

  const handleDeleteModuleLocal = async (id: string) => {
    if (!confirm("Delete module?")) return;
    try {
      await deleteModule(id);
      // remove from tree
      updateCourseTree((prev) =>
        prev.map((c) => ({
          ...c,
          modules: (c.modules || []).filter((m) => m.id !== id),
        }))
      );
      if (selected?.type === "module" && selected.id === id) setSelected(null);
      toast({ title: "Module deleted", status: "info" });
    } catch (err: any) {
      toast({
        title: "Error deleting module",
        description: String(err),
        status: "error",
      });
    }
  };

  // UNIT
  const handleCreateUnit = async (moduleId: string) => {
    const title = prompt("New unit title");
    if (!title) return;

    try {
      // Find the parent module in the current course tree
      let maxOrder = 0;
      updateCourseTree((prev) => {
        prev.forEach((course) => {
          const mod = course.modules?.find((m) => m.id === moduleId);
          if (mod) {
            maxOrder =
              mod.units?.reduce(
                (max, u) => Math.max(max, u.order_index ?? 0),
                0
              ) ?? 0;
          }
        });
        return prev;
      });

      // Set order_index to max + 1
      const order_index = maxOrder + 1;

      const created = await unwrap(
        createUnit({ title, module_id: moduleId, order_index })
      );

      // Update local tree
      updateCourseTree((prev) =>
        prev.map((c) => ({
          ...c,
          modules: (c.modules || []).map((m) =>
            m.id === moduleId
              ? {
                  ...m,
                  units: [
                    ...(m.units || []),
                    { ...(created as any), lessons: created.lessons || [] },
                  ],
                }
              : m
          ),
        }))
      );

      toast({ title: "Unit created", status: "success" });
    } catch (err: any) {
      toast({
        title: "Error creating unit",
        description: String(err),
        status: "error",
      });
    }
  };

  const handleSaveUnit = async () => {
    if (!selected || selected.type !== "unit") return;
    try {
      const updated = await unwrap(
        updateUnit(selected.id, { title: unitTitle })
      );
      updateCourseTree((prev) =>
        prev.map((c) => ({
          ...c,
          modules: c.modules.map((m) => ({
            ...m,
            units: m.units.map((u) =>
              u.id === updated.id
                ? { ...updated, lessons: updated.lessons || [] }
                : u
            ),
          })),
        }))
      );
      toast({ title: "Unit updated", status: "success" });
    } catch (err: any) {
      toast({
        title: "Error updating unit",
        description: String(err),
        status: "error",
      });
    }
  };

  const handleDeleteUnitLocal = async (id: string) => {
    if (!confirm("Delete unit?")) return;
    try {
      await deleteUnit(id);
      updateCourseTree((prev) =>
        prev.map((c) => ({
          ...c,
          modules: c.modules.map((m) => ({
            ...m,
            units: (m.units || []).filter((u) => u.id !== id),
          })),
        }))
      );
      if (selected?.type === "unit" && selected.id === id) setSelected(null);
      toast({ title: "Unit deleted", status: "info" });
    } catch (err: any) {
      toast({
        title: "Error deleting unit",
        description: String(err),
        status: "error",
      });
    }
  };

  // LESSON
  const handleCreateLesson = async (unitId: string) => {
    const title = prompt("New lesson title");
    if (!title) return;

    try {
      // Calculate max order_index in the unit
      let maxOrder = 0;
      courses.forEach((course) => {
        course.modules?.forEach((mod) => {
          mod.units?.forEach((unit) => {
            if (unit.id === unitId) {
              maxOrder =
                unit.lessons?.reduce(
                  (max, lesson) => Math.max(max, lesson.order_index ?? 0),
                  0
                ) ?? 0;
            }
          });
        });
      });

      const order_index = maxOrder + 1;

      const emptyContent: JSONContent = {
        type: "doc",
        content: [],
      };

      const created = await unwrap(
        createLesson({
          unit_id: unitId,
          title,
          content: emptyContent,
          order_index,
        })
      );

      // Update local course tree
      updateCourseTree((prev) =>
        prev.map((c) => ({
          ...c,
          modules: (c.modules || []).map((m) => ({
            ...m,
            units: (m.units || []).map((u) =>
              u.id === unitId
                ? { ...u, lessons: [...(u.lessons || []), created] }
                : u
            ),
          })),
        }))
      );

      toast({ title: "Lesson created", status: "success" });
    } catch (err: any) {
      toast({
        title: "Error creating lesson",
        description: String(err),
        status: "error",
      });
    }
  };

  const handleSaveLesson = async () => {
    if (!selected || selected.type !== "lesson") return;
    try {
      const content: JSONContent = editor?.getJSON() ?? {
        type: "doc",
        content: [],
      };

      const payload: Partial<Lesson> = {
        title: lessonTitle,
        content,
        order_index: lessonOrder,
      };

      const updated = await unwrap(updateLesson(selected.id, payload));
      // update in tree
      updateCourseTree((prev) =>
        prev.map((c) => ({
          ...c,
          modules: (c.modules || []).map((m) => ({
            ...m,
            units: (m.units || []).map((u) => ({
              ...u,
              lessons: (u.lessons || []).map((l) =>
                l.id === updated.id ? updated : l
              ),
            })),
          })),
        }))
      );
      toast({ title: "Lesson saved", status: "success" });
    } catch (err: any) {
      toast({
        title: "Error saving lesson",
        description: String(err),
        status: "error",
      });
    }
  };

  const handleDeleteLessonLocal = async (id: string) => {
    if (!confirm("Delete lesson?")) return;
    try {
      await deleteLesson(id);
      updateCourseTree((prev) =>
        prev.map((c) => ({
          ...c,
          modules: c.modules.map((m) => ({
            ...m,
            units: m.units.map((u) => ({
              ...u,
              lessons: (u.lessons || []).filter((l) => l.id !== id),
            })),
          })),
        }))
      );
      if (selected?.type === "lesson" && selected.id === id) setSelected(null);
      toast({ title: "Lesson deleted", status: "info" });
    } catch (err: any) {
      toast({
        title: "Error deleting lesson",
        description: String(err),
        status: "error",
      });
    }
  };

  // QUIZ & QUESTION (inline)
  const handleAddQuizInline = async (lessonId: string) => {
    try {
      const created = await unwrap(
        createQuiz({ lesson_id: lessonId, passing_score: 70 })
      );
      // attach to lesson in tree
      updateCourseTree((prev) =>
        prev.map((c) => ({
          ...c,
          modules: c.modules.map((m) => ({
            ...m,
            units: m.units.map((u) => ({
              ...u,
              lessons: u.lessons.map((l) =>
                l.id === lessonId
                  ? { ...l, quizzes: [...(l.quizzes || []), created] }
                  : l
              ),
            })),
          })),
        }))
      );
      toast({ title: "Quiz added", status: "success" });
    } catch (err: any) {
      toast({
        title: "Error adding quiz",
        description: String(err),
        status: "error",
      });
    }
  };

  // QUIZ & QUESTION (inline)
  const handleDeleteQuizInline = async (quizId: string, lessonId: string) => {
    if (!confirm("Delete quiz?")) return;
    try {
      await deleteQuiz(quizId);
      updateCourseTree((prev) =>
        prev.map((c) => ({
          ...c,
          modules: c.modules.map((m) => ({
            ...m,
            units: m.units.map((u) => ({
              ...u,
              lessons: u.lessons.map((l) =>
                l.id === lessonId
                  ? {
                      ...l,
                      quizzes: (l.quizzes || []).filter((q) => q.id !== quizId),
                    }
                  : l
              ),
            })),
          })),
        }))
      );
      toast({ title: "Quiz removed", status: "info" });
    } catch (err: any) {
      toast({
        title: "Error deleting quiz",
        description: String(err),
        status: "error",
      });
    }
  };

  const handleAddQuestionInline = async (quizId: string, lessonId: string) => {
    // Validate that question text has actual content
    const hasText = newQuestionText?.content?.some(
      (node) =>
        node.type === "paragraph" && node.content?.some((t) => t.text?.trim())
    );

    if (!hasText || newCorrect.length === 0) {
      toast({ title: "Incomplete question", status: "warning" });
      return;
    }

    try {
      const payload: Partial<QuizQuestion> = {
        lesson_id: lessonId,
        quiz_id: quizId,
        question_text: newQuestionText, // store as JSON
        options: newOptions,
        correct_answer: newCorrect.map((i) => newOptions[i]),
        explanation: { text: newExplanation },
      };

      const created = await unwrap(createQuizQuestion(payload));

      // Attach to course tree
      updateCourseTree((prev) =>
        prev.map((c) => ({
          ...c,
          modules: c.modules.map((m) => ({
            ...m,
            units: m.units.map((u) => ({
              ...u,
              lessons: u.lessons.map((l) =>
                l.id === lessonId
                  ? {
                      ...l,
                      quizzes: l.quizzes?.map((q) =>
                        q.id === quizId
                          ? {
                              ...q,
                              questions: [...(q.questions || []), created],
                            }
                          : q
                      ),
                    }
                  : l
              ),
            })),
          })),
        }))
      );

      // Reset draft
      setNewQuestionText(emptyDoc);
      setNewOptions(["", "", "", ""]);
      setNewCorrect([]);
      setNewExplanation("");

      toast({ title: "Question added", status: "success" });
    } catch (err: any) {
      toast({
        title: "Error adding question",
        description: String(err),
        status: "error",
      });
    }
  };

  const handleDeleteQuestionInline = async (
    quizId: string,
    questionId: string,
    lessonId: string
  ) => {
    if (!confirm("Delete question?")) return;
    try {
      await deleteQuizQuestion(questionId);
      updateCourseTree((prev) =>
        prev.map((c) => ({
          ...c,
          modules: c.modules.map((m) => ({
            ...m,
            units: m.units.map((u) => ({
              ...u,
              lessons: u.lessons.map((l) =>
                l.id === lessonId
                  ? {
                      ...l,
                      quizzes: l.quizzes?.map((q) =>
                        q.id === quizId
                          ? {
                              ...q,
                              questions: (q.questions || []).filter(
                                (qq) => qq.id !== questionId
                              ),
                            }
                          : q
                      ),
                    }
                  : l
              ),
            })),
          })),
        }))
      );
      toast({ title: "Question deleted", status: "info" });
    } catch (err: any) {
      toast({
        title: "Error deleting question",
        description: String(err),
        status: "error",
      });
    }
  };

  /* ---------------------------
    Derived helpers for rendering and selection
    --------------------------- */
  const visibleCourses = useMemo(() => {
    if (!search.trim()) return courses;
    const q = search.toLowerCase();
    return courses.filter((c) => (c.title || "").toLowerCase().includes(q));
  }, [courses, search]);

  const selectedLessonObj = useMemo(() => {
    if (!selected || selected.type !== "lesson") return null;
    const found = findLesson(selected.id);
    return found?.lesson || null;
  }, [selected, courses]);

  /* ---------------------------
    Render helpers (recursive-ish tree but controlled)
    --------------------------- */
  const renderTree = () => {
    return visibleCourses.map((course) => (
      <Box
        key={course.id}
        borderWidth={1}
        borderRadius="md"
        mb={3}
        overflow="visible"
      >
        <Flex align="center" justify="space-between" p={2}>
          <HStack spacing={2} align="center">
            <IconButton
              aria-label={`expand-course-${course.id}`}
              icon={Icon(
                expandedById[course.id] ? ChevronUpIcon : ChevronDownIcon,
                { width: 6, height: 6 }
              )}
              size="xs"
              onClick={() => toggleExpand(course.id)}
              variant="ghost"
            />
            <Text
              fontWeight="bold"
              cursor="pointer"
              onClick={() => selectNode({ type: "course", id: course.id })}
            >
              {course.title}
            </Text>
          </HStack>

          <HStack spacing={1}>
            <IconButton
              aria-label="edit-course"
              size="sm"
              icon={Icon(PencilIcon, { width: 6, height: 6 })}
              onClick={() => selectNode({ type: "course", id: course.id })}
            />
            <IconButton
              aria-label="add-module"
              size="sm"
              icon={Icon(PlusIcon, { width: 6, height: 6 })}
              onClick={() => handleCreateModule(course.id)}
            />
            <IconButton
              aria-label="delete-course"
              size="sm"
              icon={Icon(TrashIcon, { width: 6, height: 6 })}
              onClick={() => handleDeleteCourseLocal(course.id)}
            />
          </HStack>
        </Flex>

        <Collapse in={!!expandedById[course.id]} animateOpacity>
          <Box pl={6} py={2}>
            {(course.modules || []).map((mod) => (
              <Box key={mod.id} borderWidth={1} borderRadius="md" mb={2}>
                <Flex align="center" justify="space-between" p={2}>
                  <HStack spacing={2}>
                    <IconButton
                      aria-label={`expand-module-${mod.id}`}
                      size="xs"
                      variant="ghost"
                      icon={Icon(
                        expandedById[mod.id] ? ChevronUpIcon : ChevronDownIcon,
                        { width: 6, height: 6 }
                      )}
                      onClick={() => toggleExpand(mod.id)}
                    />
                    <Text
                      cursor="pointer"
                      onClick={() => selectNode({ type: "module", id: mod.id })}
                    >
                      {mod.title}
                    </Text>
                  </HStack>

                  <HStack spacing={1}>
                    <IconButton
                      aria-label="edit-module"
                      size="sm"
                      icon={Icon(PencilIcon, { width: 6, height: 6 })}
                      onClick={() => selectNode({ type: "module", id: mod.id })}
                    />
                    <IconButton
                      aria-label="add-unit"
                      size="sm"
                      icon={Icon(PlusIcon, { width: 4, height: 4 })}
                      onClick={() => handleCreateUnit(mod.id)}
                    />
                    <IconButton
                      aria-label="delete-module"
                      size="sm"
                      icon={Icon(TrashIcon, { width: 4, height: 4 })}
                      onClick={() => handleDeleteModuleLocal(mod.id)}
                    />
                  </HStack>
                </Flex>

                <Collapse in={!!expandedById[mod.id]} animateOpacity>
                  <Box pl={6} py={1}>
                    {(mod.units || []).map((unit) => (
                      <Box key={unit.id} mb={1}>
                        <Flex align="center" justify="space-between" p={1}>
                          <HStack spacing={2}>
                            <IconButton
                              aria-label={`expand-unit-${unit.id}`}
                              size="xs"
                              variant="ghost"
                              icon={Icon(
                                expandedById[unit.id]
                                  ? ChevronUpIcon
                                  : ChevronDownIcon,
                                { width: 4, height: 4 }
                              )}
                              onClick={() => toggleExpand(unit.id)}
                            />
                            <Text
                              cursor="pointer"
                              onClick={() =>
                                selectNode({ type: "unit", id: unit.id })
                              }
                            >
                              {unit.title}
                            </Text>
                          </HStack>

                          <HStack spacing={1}>
                            <IconButton
                              aria-label="edit-unit"
                              size="sm"
                              icon={Icon(PencilIcon, { width: 6, height: 6 })}
                              onClick={() =>
                                selectNode({ type: "unit", id: unit.id })
                              }
                            />
                            <IconButton
                              aria-label="add-lesson"
                              size="sm"
                              icon={Icon(PlusIcon, { width: 4, height: 4 })}
                              onClick={() => handleCreateLesson(unit.id)}
                            />
                            <IconButton
                              aria-label="delete-unit"
                              size="sm"
                              icon={Icon(TrashIcon, { width: 4, height: 4 })}
                              onClick={() => handleDeleteUnitLocal(unit.id)}
                            />
                          </HStack>
                        </Flex>

                        <Collapse in={!!expandedById[unit.id]} animateOpacity>
                          <Box pl={6} py={1}>
                            {(unit.lessons || []).map((lesson) => (
                              <Flex
                                key={lesson.id}
                                align="center"
                                justify="space-between"
                                p={1}
                              >
                                <Text
                                  cursor="pointer"
                                  onClick={() =>
                                    selectNode({
                                      type: "lesson",
                                      id: lesson.id,
                                    })
                                  }
                                >
                                  {lesson.title}
                                </Text>
                                <HStack spacing={1}>
                                  <IconButton
                                    aria-label="edit-lesson"
                                    size="sm"
                                    icon={Icon(PencilIcon, {
                                      width: 4,
                                      height: 4,
                                    })}
                                    onClick={() =>
                                      selectNode({
                                        type: "lesson",
                                        id: lesson.id,
                                      })
                                    }
                                  />
                                  <IconButton
                                    aria-label="delete-lesson"
                                    size="sm"
                                    icon={Icon(TrashIcon, {
                                      width: 4,
                                      height: 4,
                                    })}
                                    onClick={() =>
                                      handleDeleteLessonLocal(lesson.id)
                                    }
                                  />
                                </HStack>
                              </Flex>
                            ))}
                          </Box>
                        </Collapse>
                      </Box>
                    ))}
                  </Box>
                </Collapse>
              </Box>
            ))}
          </Box>
        </Collapse>
      </Box>
    ));
  };

  /* ---------------------------
    Right side editor detail forms
    --------------------------- */
  const renderDetailPane = () => {
    if (!selected) {
      return (
        <Box>
          <Text fontWeight="semibold">No item selected</Text>
          <Text mt={2}>
            Select a course/module/unit/lesson to view or edit it. Use the +
            icons in the tree to create new items.
          </Text>
        </Box>
      );
    }

    if (selected.type === "course") {
      const c = findCourse(selected.id);
      return (
        <Box>
          <Heading size="sm" mb={2}>
            Edit Course
          </Heading>
          <FormControl mb={2}>
            <FormLabel>Title</FormLabel>
            <ChakraInput
              value={courseTitle}
              onChange={(e) => setCourseTitle(e.target.value)}
            />
          </FormControl>
          <FormControl mb={2}>
            <FormLabel>Description</FormLabel>
            <Textarea
              value={courseDescription}
              onChange={(e) => setCourseDescription(e.target.value)}
            />
          </FormControl>
          <HStack mt={3}>
            <Button colorScheme="blue" onClick={handleSaveCourse}>
              Save
            </Button>
            <Button
              colorScheme="red"
              onClick={() => handleDeleteCourseLocal(selected.id)}
            >
              Delete
            </Button>
          </HStack>
          <Divider my={4} />
          <Text fontWeight="semibold">Modules ({c?.modules?.length || 0})</Text>
        </Box>
      );
    }

    if (selected.type === "module") {
      const mFound = findModule(selected.id);
      return (
        <Box>
          <Heading size="sm" mb={2}>
            Edit Module
          </Heading>
          <FormControl mb={2}>
            <FormLabel>Title</FormLabel>
            <ChakraInput
              value={moduleTitle}
              onChange={(e) => setModuleTitle(e.target.value)}
            />
          </FormControl>
          <HStack mt={3}>
            <Button colorScheme="blue" onClick={handleSaveModule}>
              Save
            </Button>
            <Button
              colorScheme="red"
              onClick={() => handleDeleteModuleLocal(selected.id)}
            >
              Delete
            </Button>
          </HStack>
          <Divider my={4} />
          <Text fontWeight="semibold">
            Units ({mFound?.module?.units?.length || 0})
          </Text>
        </Box>
      );
    }

    if (selected.type === "unit") {
      const uFound = findUnit(selected.id);
      return (
        <Box>
          <Heading size="sm" mb={2}>
            Edit Unit
          </Heading>
          <FormControl mb={2}>
            <FormLabel>Title</FormLabel>
            <ChakraInput
              value={unitTitle}
              onChange={(e) => setUnitTitle(e.target.value)}
            />
          </FormControl>
          <HStack mt={3}>
            <Button colorScheme="blue" onClick={handleSaveUnit}>
              Save
            </Button>
            <Button
              colorScheme="red"
              onClick={() => handleDeleteUnitLocal(selected.id)}
            >
              Delete
            </Button>
          </HStack>
          <Divider my={4} />
          <Text fontWeight="semibold">
            Lessons ({uFound?.unit?.lessons?.length || 0})
          </Text>
        </Box>
      );
    }

    // lesson editor & quizzes
    if (selected.type === "lesson") {
      const lesson = selectedLessonObj;
      if (!lesson) return <Text>Lesson not found</Text>;

      return (
        <Box>
          <Heading size="sm" mb={2}>
            Edit Lesson
          </Heading>

          <FormControl mb={2}>
            <FormLabel>Title</FormLabel>
            <ChakraInput
              value={lessonTitle}
              onChange={(e) => setLessonTitle(e.target.value)}
            />
          </FormControl>

          <FormControl mb={2}>
            <FormLabel>Order Index</FormLabel>
            <NumberInput
              value={lessonOrder}
              onChange={(v) => setLessonOrder(Number(v))}
            >
              <NumberInputField />
            </NumberInput>
          </FormControl>

          <FormControl mb={2}>
            <FormLabel>Content</FormLabel>
            <RichTextEditor
              value={lessonContent} // should be JSON
              onChange={(c) => setLessonContent(c)}
            />
          </FormControl>

          <HStack mt={3}>
            <Button colorScheme="blue" onClick={handleSaveLesson}>
              Save Lesson
            </Button>
            <Button
              colorScheme="red"
              onClick={() => handleDeleteLessonLocal(selected.id)}
            >
              Delete Lesson
            </Button>
          </HStack>

          <Divider my={6} />

          {/* Quizzes */}
          <Box>
            <HStack justify="space-between">
              <Text fontWeight="semibold">Quizzes</Text>
              <Button
                size="sm"
                leftIcon={Icon(PlusIcon, { width: 6, height: 6 })}
                onClick={() => handleAddQuizInline(lesson.id)}
              >
                Add Quiz
              </Button>
            </HStack>

            <VStack spacing={3} mt={3} align="stretch">
              {(lesson.quizzes || []).map((q) => (
                <Box key={q.id} borderWidth={1} borderRadius="md" p={3}>
                  <Flex justify="space-between" align="center">
                    <Text>
                      Quiz: {q.id} — Passing: {q.passing_score}
                    </Text>
                    <HStack>
                      <Button
                        size="xs"
                        colorScheme="red"
                        onClick={() => handleDeleteQuizInline(q.id, lesson.id)}
                      >
                        Delete Quiz
                      </Button>
                    </HStack>
                  </Flex>

                  {/* Questions */}
                  <VStack spacing={2} mt={3} align="stretch">
                    {(q.questions || []).map((qq, idx) => (
                      <Flex
                        key={qq.id}
                        justify="space-between"
                        align="center"
                        borderWidth={1}
                        p={2}
                        borderRadius="md"
                      >
                        <Box>
                          <Text fontWeight="semibold">Q{idx + 1}</Text>
                          <RichTextView
                            content={qq.question_text || emptyDoc}
                          />
                          <Text fontSize="sm">
                            Correct: {qq.correct_answer.join(", ")}
                          </Text>
                        </Box>
                        <Button
                          size="xs"
                          colorScheme="red"
                          onClick={() =>
                            handleDeleteQuestionInline(q.id, qq.id, lesson.id)
                          }
                        >
                          Delete
                        </Button>
                      </Flex>
                    ))}
                  </VStack>

                  {/* Add a new question form (per-quiz) */}
                  <Box mt={3} borderTopWidth={1} pt={3}>
                    <FormControl mb={2}>
                      <FormLabel>Question Text</FormLabel>
                      <RichTextEditor
                        value={newQuestionText} // should be JSON or empty string
                        onChange={(c) => setNewQuestionText(c)} // store editor JSON in state
                      />
                    </FormControl>
                    {newOptions.map((opt, i) => (
                      <FormControl key={i} mb={2}>
                        <FormLabel>Option {i + 1}</FormLabel>
                        <ChakraInput
                          value={opt}
                          onChange={(e) => {
                            const copy = [...newOptions];
                            copy[i] = e.target.value;
                            setNewOptions(copy);
                          }}
                        />
                        <Button
                          size="xs"
                          mt={1}
                          onClick={() =>
                            setNewCorrect((prev) =>
                              prev.includes(i)
                                ? prev.filter((x) => x !== i)
                                : [...prev, i]
                            )
                          }
                        >
                          {newCorrect.includes(i)
                            ? "Correct ✓"
                            : "Mark Correct"}
                        </Button>
                      </FormControl>
                    ))}
                    <FormControl mb={2}>
                      <FormLabel>Explanation</FormLabel>
                      <Textarea
                        value={newExplanation}
                        onChange={(e) => setNewExplanation(e.target.value)}
                      />
                    </FormControl>

                    <Button
                      size="sm"
                      colorScheme="green"
                      onClick={() => handleAddQuestionInline(q.id, lesson.id)}
                    >
                      Add Question
                    </Button>
                  </Box>
                </Box>
              ))}
            </VStack>
          </Box>
        </Box>
      );
    }

    return null;
  };

  /* ---------------------------
    UI layout
    --------------------------- */
  return (
    <Flex gap={4} align="stretch" p={4}>
      {/* Left column: tree */}
      <Box width="38%" maxH="80vh" overflowY="auto" borderRightWidth={1} pr={3}>
        <Flex justify="space-between" align="center" mb={3}>
          <Heading size="sm">Content Tree</Heading>
          <HStack>
            <Button
              size="sm"
              onClick={handleCreateCourse}
              leftIcon={Icon(PlusIcon, { width: 6, height: 6 })}
            >
              Add Course
            </Button>
          </HStack>
        </Flex>

        <Input
          placeholder="Search courses..."
          mb={3}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        {loading ? <Spinner /> : <Stack spacing={2}>{renderTree()}</Stack>}
      </Box>

      {/* Right column: details */}
      <Box flex="1" maxH="80vh" overflowY="auto" pl={4}>
        {renderDetailPane()}
      </Box>
    </Flex>
  );
}

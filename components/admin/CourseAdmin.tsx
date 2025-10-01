"use client";

import React, { useEffect, useState, useCallback, useMemo, useRef } from "react";
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
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
} from "@chakra-ui/react";

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
import { JSONContent } from "@tiptap/react";
import { useAuth } from "@/context/authContext";

// Types
type SelectedNode =
  | { type: "course"; id: string }
  | { type: "module"; id: string }
  | { type: "unit"; id: string }
  | { type: "lesson"; id: string }
  | null;

interface TreeFinders {
  course: Course | null;
  module: { course: Course; module: Module } | null;
  unit: { course: Course; module: Module; unit: Unit } | null;
  lesson: { course: Course; module: Module; unit: Unit; lesson: Lesson } | null;
}

// Constants
const EMPTY_DOC: JSONContent = {
  type: "doc",
  content: [{ type: "paragraph", content: [] }],
};

const DEFAULT_OPTIONS = ["", "", "", ""];

// Helper: small HeroIcon wrapper for Chakra sizing
const Icon = (IconComp: any, props: any = {}) => (
  <ChakraBox as={IconComp} {...props} />
);

// Custom hook for state persistence
function usePersistedState<T>(key: string, defaultValue: T) {
  const [state, setState] = useState<T>(() => {
    if (typeof window === 'undefined') return defaultValue;
    
    try {
      const stored = localStorage.getItem(key);
      return stored ? JSON.parse(stored) : defaultValue;
    } catch (error) {
      console.warn(`Error loading persisted state for ${key}:`, error);
      return defaultValue;
    }
  });

  const setPersistedState = useCallback((value: T | ((prev: T) => T)) => {
    setState(prev => {
      const newValue = typeof value === 'function' ? (value as Function)(prev) : value;
      
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem(key, JSON.stringify(newValue));
        } catch (error) {
          console.warn(`Error persisting state for ${key}:`, error);
        }
      }
      
      return newValue;
    });
  }, [key]);

  return [state, setPersistedState] as const;
}

// Custom hook for unsaved changes protection
function useUnsavedChanges(hasUnsavedChanges: boolean) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);

  useEffect(() => {
    if (!hasUnsavedChanges) return;

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "You have unsaved changes. Are you sure you want to leave?";
      return "You have unsaved changes. Are you sure you want to leave?";
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  const confirmAction = useCallback(() => {
    setShowConfirm(false);
    pendingAction?.();
    setPendingAction(null);
  }, [pendingAction]);

  const cancelAction = useCallback(() => {
    setShowConfirm(false);
    setPendingAction(null);
  }, []);

  return {
    showConfirm,
    confirmAction,
    cancelAction,
    setPendingAction,
    setShowConfirm,
  };
}

// Safe RichTextEditor component
const SafeRichTextEditor = React.memo(({
  value,
  onChange,
  placeholder = "Start typing...",
  trackChanges,
}: {
  value: JSONContent;
  onChange: (content: JSONContent) => void;
  placeholder?: string;
  trackChanges: (hasChanges: boolean) => void;
}) => {
  const safeValue = useMemo(() => {
    try {
      return value && typeof value === "object" ? value : EMPTY_DOC;
    } catch {
      return EMPTY_DOC;
    }
  }, [value]);

  const handleChange = useCallback((content: JSONContent) => {
    onChange(content);
    trackChanges(true);
  }, [onChange, trackChanges]);

  return (
    <RichTextEditor
      value={safeValue}
      onChange={handleChange}
      placeholder={placeholder}
    />
  );
});

SafeRichTextEditor.displayName = 'SafeRichTextEditor';

// Main component
export default function CoursesAdmin() {
  const toast = useToast();
  const { user } = useAuth();
  const cancelRef = useRef<HTMLButtonElement>(null);

  // Main data with persistence
  const [courses, setCourses] = usePersistedState<Course[]>("admin-courses", []);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>("");

  // UI state
  const [expandedById, setExpandedById] = usePersistedState<Record<string, boolean>>("admin-expanded", {});
  const [selected, setSelected] = usePersistedState<SelectedNode>("admin-selected", null);

  // Form states
  const [courseTitle, setCourseTitle] = usePersistedState("admin-course-title", "");
  const [courseDescription, setCourseDescription] = usePersistedState("admin-course-desc", "");
  const [moduleTitle, setModuleTitle] = usePersistedState("admin-module-title", "");
  const [unitTitle, setUnitTitle] = usePersistedState("admin-unit-title", "");
  const [lessonTitle, setLessonTitle] = usePersistedState("admin-lesson-title", "");
  const [lessonOrder, setLessonOrder] = usePersistedState("admin-lesson-order", 0);

  // Rich text content states
  const [lessonContent, setLessonContent] = usePersistedState<JSONContent>("admin-lesson-content", EMPTY_DOC);
  const [newQuestionText, setNewQuestionText] = usePersistedState<JSONContent>("admin-question-text", EMPTY_DOC);
  const [newExplanation, setNewExplanation] = usePersistedState<JSONContent>("admin-explanation", EMPTY_DOC);

  // Quiz form states
  const [newOptions, setNewOptions] = usePersistedState<string[]>("admin-options", DEFAULT_OPTIONS);
  const [newCorrect, setNewCorrect] = usePersistedState<number[]>("admin-correct", []);

  // Unsaved changes state
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const { showConfirm, confirmAction, cancelAction, setPendingAction, setShowConfirm } = useUnsavedChanges(hasUnsavedChanges);

  // Track form changes
  const trackChanges = useCallback((hasChanges: boolean) => {
    setHasUnsavedChanges(hasChanges);
  }, []);

  // Reset all form states
  const resetFormStates = useCallback(() => {
    setCourseTitle("");
    setCourseDescription("");
    setModuleTitle("");
    setUnitTitle("");
    setLessonTitle("");
    setLessonOrder(0);
    setLessonContent(EMPTY_DOC);
    setNewQuestionText(EMPTY_DOC);
    setNewOptions(DEFAULT_OPTIONS);
    setNewCorrect([]);
    setNewExplanation(EMPTY_DOC);
    setHasUnsavedChanges(false);
  }, [
    setCourseTitle, setCourseDescription, setModuleTitle, setUnitTitle,
    setLessonTitle, setLessonOrder, setLessonContent, setNewQuestionText,
    setNewOptions, setNewCorrect, setNewExplanation
  ]);

  // Helper to safely parse content
  const parseContent = useCallback((content: any): JSONContent => {
    if (!content) return EMPTY_DOC;

    if (typeof content === "string") {
      try {
        return JSON.parse(content);
      } catch {
        return {
          type: "doc",
          content: [{ type: "paragraph", content: [{ type: "text", text: content }] }],
        };
      }
    }

    if (typeof content === "object") {
      if (content.type === "doc" && Array.isArray(content.content)) {
        return content;
      }
      if (content.text) {
        return parseContent(content.text);
      }
    }

    return EMPTY_DOC;
  }, []);

  // Find helpers (optimized)
  const treeFinders = useMemo((): TreeFinders => {
    const findCourse = (id: string): Course | null => 
      courses.find((c) => c.id === id) || null;

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

    return {
      course: selected?.type === "course" ? findCourse(selected.id) : null,
      module: selected?.type === "module" ? findModule(selected.id) : null,
      unit: selected?.type === "unit" ? findUnit(selected.id) : null,
      lesson: selected?.type === "lesson" ? findLesson(selected.id) : null,
    };
  }, [courses, selected]);

  // Update course tree helper
  const updateCourseTree = useCallback((updater: (courses: Course[]) => Course[]) => {
    setCourses(prev => updater(prev.map(course => ({ ...course }))));
  }, [setCourses]);

  // Unwrap pattern for API calls
  const unwrap = useCallback(async <T,>(promise: Promise<{ data: T; error: any }>): Promise<T> => {
    const result = await promise;
    if (result.error) throw result.error;
    return result.data;
  }, []);

  // Load data
  const loadCourses = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchCourseWithContent();
      const normalizedCourses = (data || []).map((c: any) => ({
        ...c,
        modules: (c.modules || []).map((m: any) => ({
          ...m,
          units: (m.units || []).map((u: any) => ({
            ...u,
            lessons: (u.lessons || []).map((l: any) => ({
              ...l,
              quizzes: (l.quizzes || []).map((q: any) => ({
                ...q,
                questions: (q.quiz_questions || []).map((qq: any) => ({
                  ...qq,
                  explanation: qq.explanation || { text: EMPTY_DOC },
                })),
              })),
            })),
          })),
        })),
      })) as Course[];
      
      setCourses(normalizedCourses);
    } catch (err: any) {
      console.error("Failed to load courses:", err);
      toast({ title: "Failed to load courses", status: "error" });
    } finally {
      setLoading(false);
    }
  }, [toast, setCourses]);

  useEffect(() => {
    loadCourses();
  }, [loadCourses]);

  // Selection handler
  const selectNode = useCallback((node: SelectedNode) => {
    if (hasUnsavedChanges) {
      setShowConfirm(true);
      setPendingAction(() => () => {
        resetFormStates();
        setSelected(node);
        loadNodeContent(node);
      });
      return;
    }

    resetFormStates();
    setSelected(node);
    loadNodeContent(node);
  }, [hasUnsavedChanges, resetFormStates, setSelected, setShowConfirm, setPendingAction]);

  const loadNodeContent = useCallback((node: SelectedNode) => {
    if (!node) return;

    try {
      switch (node.type) {
        case "course": {
          const course = treeFinders.course;
          if (course) {
            setCourseTitle(course.title || "");
            setCourseDescription(course.description || "");
          }
          break;
        }
        case "module": {
          const module = treeFinders.module;
          if (module) setModuleTitle(module.module.title || "");
          break;
        }
        case "unit": {
          const unit = treeFinders.unit;
          if (unit) setUnitTitle(unit.unit.title || "");
          break;
        }
        case "lesson": {
          const lesson = treeFinders.lesson;
          if (lesson?.lesson) {
            setLessonTitle(lesson.lesson.title || "");
            setLessonOrder(lesson.lesson.order_index || 0);
            const content = parseContent(lesson.lesson.content);
            setLessonContent(content);
          }
          break;
        }
      }
    } catch (error) {
      console.error("Error loading selected node:", error);
      toast({ title: "Error loading content", status: "error" });
    }
  }, [treeFinders, setCourseTitle, setCourseDescription, setModuleTitle, setUnitTitle, setLessonTitle, setLessonOrder, setLessonContent, parseContent, toast]);

  // UI handlers
  const toggleExpand = useCallback((id: string) => {
    setExpandedById(prev => ({ ...prev, [id]: !prev[id] }));
  }, [setExpandedById]);

  // Form change handlers
  const createChangeHandler = useCallback((setter: (value: any) => void) => {
    return (value: any) => {
      setter(value);
      trackChanges(true);
    };
  }, [trackChanges]);

  const handleCourseTitleChange = createChangeHandler(setCourseTitle);
  const handleCourseDescriptionChange = createChangeHandler(setCourseDescription);
  const handleModuleTitleChange = createChangeHandler(setModuleTitle);
  const handleUnitTitleChange = createChangeHandler(setUnitTitle);
  const handleLessonTitleChange = createChangeHandler(setLessonTitle);
  const handleLessonOrderChange = createChangeHandler(setLessonOrder);
  const handleLessonContentChange = createChangeHandler(setLessonContent);

  // CRUD Operations
  const handleCreateCourse = useCallback(async () => {
    const title = prompt("New course title");
    if (!title) return;
    
    try {
      const created = await unwrap(createCourse({ title, created_by: user.id }));
      updateCourseTree(prev => [...prev, { ...created, modules: created.modules || [] }]);
      toast({ title: "Course created", status: "success" });
    } catch (err: any) {
      toast({ title: "Error creating course", description: String(err), status: "error" });
    }
  }, [user.id, unwrap, updateCourseTree, toast]);

  const handleSaveCourse = useCallback(async () => {
    if (!selected || selected.type !== "course") return;
    
    try {
      const updated = await unwrap(updateCourse(selected.id, { title: courseTitle, description: courseDescription }));
      updateCourseTree(prev => prev.map(c => c.id === updated.id ? { ...updated, modules: updated.modules || [] } : c));
      trackChanges(false);
      toast({ title: "Course updated", status: "success" });
    } catch (err: any) {
      toast({ title: "Error updating course", description: String(err), status: "error" });
    }
  }, [selected, courseTitle, courseDescription, unwrap, updateCourseTree, trackChanges, toast]);

  const handleDeleteCourse = useCallback(async (id: string) => {
    if (!confirm("Delete course permanently?")) return;
    
    try {
      await deleteCourse(id);
      updateCourseTree(prev => prev.filter(c => c.id !== id));
      if (selected?.type === "course" && selected.id === id) {
        setSelected(null);
        resetFormStates();
      }
      toast({ title: "Course deleted", status: "info" });
    } catch (err: any) {
      toast({ title: "Error deleting course", description: String(err), status: "error" });
    }
  }, [selected, setSelected, resetFormStates, updateCourseTree, toast]);

  // Module CRUD
  const handleCreateModule = useCallback(async (courseId: string) => {
    const title = prompt("New module title");
    if (!title) return;

    try {
      let maxOrder = 0;
      updateCourseTree(prev => {
        const course = prev.find(c => c.id === courseId);
        if (course) {
          maxOrder = course.modules?.reduce((max, m) => Math.max(max, m.order_index ?? 0), 0) ?? 0;
        }
        return prev;
      });

      const order_index = maxOrder + 1;
      const created = await unwrap(createModule({ title, course_id: courseId, order_index }));
      
      updateCourseTree(prev => prev.map(c => 
        c.id === courseId 
          ? { ...c, modules: [...(c.modules || []), { ...created, units: created.units || [] }] }
          : c
      ));
      toast({ title: "Module created", status: "success" });
    } catch (err: any) {
      toast({ title: "Error creating module", description: String(err), status: "error" });
    }
  }, [unwrap, updateCourseTree, toast]);

  const handleSaveModule = useCallback(async () => {
    if (!selected || selected.type !== "module") return;
    
    try {
      const updated = await unwrap(updateModule(selected.id, { title: moduleTitle }));
      updateCourseTree(prev => prev.map(c => ({
        ...c,
        modules: c.modules.map(m => m.id === updated.id ? { ...updated, units: updated.units || [] } : m)
      })));
      trackChanges(false);
      toast({ title: "Module updated", status: "success" });
    } catch (err: any) {
      toast({ title: "Error updating module", description: String(err), status: "error" });
    }
  }, [selected, moduleTitle, unwrap, updateCourseTree, trackChanges, toast]);

  const handleDeleteModule = useCallback(async (id: string) => {
    if (!confirm("Delete module?")) return;
    
    try {
      await deleteModule(id);
      updateCourseTree(prev => prev.map(c => ({
        ...c,
        modules: (c.modules || []).filter(m => m.id !== id)
      })));
      if (selected?.type === "module" && selected.id === id) setSelected(null);
      toast({ title: "Module deleted", status: "info" });
    } catch (err: any) {
      toast({ title: "Error deleting module", description: String(err), status: "error" });
    }
  }, [selected, setSelected, updateCourseTree, toast]);

  // Unit CRUD
  const handleCreateUnit = useCallback(async (moduleId: string) => {
    const title = prompt("New unit title");
    if (!title) return;

    try {
      let maxOrder = 0;
      updateCourseTree(prev => {
        for (const course of prev) {
          const module = course.modules?.find(m => m.id === moduleId);
          if (module) {
            maxOrder = module.units?.reduce((max, u) => Math.max(max, u.order_index ?? 0), 0) ?? 0;
            break;
          }
        }
        return prev;
      });

      const order_index = maxOrder + 1;
      const created = await unwrap(createUnit({ title, module_id: moduleId, order_index }));

      updateCourseTree(prev => prev.map(c => ({
        ...c,
        modules: (c.modules || []).map(m =>
          m.id === moduleId
            ? {
                ...m,
                units: [
                  ...(m.units || []),
                  { ...created, lessons: created.lessons || [] },
                ],
              }
            : m
        ),
      })));

      toast({ title: "Unit created", status: "success" });
    } catch (err: any) {
      toast({ title: "Error creating unit", description: String(err), status: "error" });
    }
  }, [unwrap, updateCourseTree, toast]);

  const handleSaveUnit = useCallback(async () => {
    if (!selected || selected.type !== "unit") return;
    
    try {
      const updated = await unwrap(updateUnit(selected.id, { title: unitTitle }));
      updateCourseTree(prev => prev.map(c => ({
        ...c,
        modules: c.modules.map(m => ({
          ...m,
          units: m.units.map(u =>
            u.id === updated.id
              ? { ...updated, lessons: updated.lessons || [] }
              : u
          ),
        })),
      })));
      trackChanges(false);
      toast({ title: "Unit updated", status: "success" });
    } catch (err: any) {
      toast({ title: "Error updating unit", description: String(err), status: "error" });
    }
  }, [selected, unitTitle, unwrap, updateCourseTree, trackChanges, toast]);

  const handleDeleteUnit = useCallback(async (id: string) => {
    if (!confirm("Delete unit?")) return;
    
    try {
      await deleteUnit(id);
      updateCourseTree(prev => prev.map(c => ({
        ...c,
        modules: c.modules.map(m => ({
          ...m,
          units: (m.units || []).filter(u => u.id !== id),
        })),
      })));
      if (selected?.type === "unit" && selected.id === id) setSelected(null);
      toast({ title: "Unit deleted", status: "info" });
    } catch (err: any) {
      toast({ title: "Error deleting unit", description: String(err), status: "error" });
    }
  }, [selected, setSelected, updateCourseTree, toast]);

  // Lesson CRUD
  const handleCreateLesson = useCallback(async (unitId: string) => {
    const title = prompt("New lesson title");
    if (!title) return;

    try {
      let maxOrder = 0;
      courses.forEach((course) => {
        course.modules?.forEach((mod) => {
          mod.units?.forEach((unit) => {
            if (unit.id === unitId) {
              maxOrder = unit.lessons?.reduce((max, lesson) => Math.max(max, lesson.order_index ?? 0), 0) ?? 0;
            }
          });
        });
      });

      const order_index = maxOrder + 1;
      const created = await unwrap(createLesson({ unit_id: unitId, title, content: EMPTY_DOC, order_index }));

      updateCourseTree(prev => prev.map(c => ({
        ...c,
        modules: (c.modules || []).map(m => ({
          ...m,
          units: (m.units || []).map(u =>
            u.id === unitId
              ? { ...u, lessons: [...(u.lessons || []), created] }
              : u
          ),
        })),
      })));

      toast({ title: "Lesson created", status: "success" });
    } catch (err: any) {
      toast({ title: "Error creating lesson", description: String(err), status: "error" });
    }
  }, [courses, unwrap, updateCourseTree, toast]);

  const handleSaveLesson = useCallback(async () => {
    if (!selected || selected.type !== "lesson") return;
    
    try {
      const foundLesson = treeFinders.lesson;
      if (!foundLesson) {
        toast({ title: "Lesson not found", status: "error" });
        return;
      }

      const payload: Partial<Lesson> = {
        title: lessonTitle,
        content: lessonContent,
        order_index: lessonOrder,
      };

      const updated = await unwrap(updateLesson(selected.id, payload));
      const updatedLessonWithQuizzes = { ...updated, quizzes: foundLesson.lesson.quizzes || [] };

      updateCourseTree(prev => prev.map(c => ({
        ...c,
        modules: c.modules.map(m => ({
          ...m,
          units: m.units.map(u => ({
            ...u,
            lessons: u.lessons.map(l => l.id === updated.id ? updatedLessonWithQuizzes : l)
          }))
        }))
      })));

      trackChanges(false);
      toast({ title: "Lesson saved", status: "success" });
    } catch (err: any) {
      console.error("Error saving lesson:", err);
      toast({ title: "Error saving lesson", description: String(err), status: "error" });
    }
  }, [selected, lessonTitle, lessonContent, lessonOrder, treeFinders, unwrap, updateCourseTree, trackChanges, toast]);

  const handleDeleteLesson = useCallback(async (id: string) => {
    if (!confirm("Delete lesson?")) return;
    
    try {
      await deleteLesson(id);
      updateCourseTree(prev => prev.map(c => ({
        ...c,
        modules: c.modules.map(m => ({
          ...m,
          units: m.units.map(u => ({
            ...u,
            lessons: (u.lessons || []).filter(l => l.id !== id),
          })),
        })),
      })));
      if (selected?.type === "lesson" && selected.id === id) setSelected(null);
      toast({ title: "Lesson deleted", status: "info" });
    } catch (err: any) {
      toast({ title: "Error deleting lesson", description: String(err), status: "error" });
    }
  }, [selected, setSelected, updateCourseTree, toast]);

  // Quiz CRUD
  const handleAddQuiz = useCallback(async (lessonId: string) => {
    try {
      const created = await unwrap(createQuiz({ lesson_id: lessonId, passing_score: 70 }));
      updateCourseTree(prev => prev.map(c => ({
        ...c,
        modules: c.modules.map(m => ({
          ...m,
          units: m.units.map(u => ({
            ...u,
            lessons: u.lessons.map(l =>
              l.id === lessonId
                ? { ...l, quizzes: [...(l.quizzes || []), created] }
                : l
            ),
          })),
        })),
      })));
      toast({ title: "Quiz added", status: "success" });
    } catch (err: any) {
      toast({ title: "Error adding quiz", description: String(err), status: "error" });
    }
  }, [unwrap, updateCourseTree, toast]);

  const handleDeleteQuiz = useCallback(async (quizId: string, lessonId: string) => {
    if (!confirm("Delete quiz?")) return;
    
    try {
      await deleteQuiz(quizId);
      updateCourseTree(prev => prev.map(c => ({
        ...c,
        modules: c.modules.map(m => ({
          ...m,
          units: m.units.map(u => ({
            ...u,
            lessons: u.lessons.map(l =>
              l.id === lessonId
                ? {
                    ...l,
                    quizzes: (l.quizzes || []).filter(q => q.id !== quizId),
                  }
                : l
            ),
          })),
        })),
      })));
      toast({ title: "Quiz removed", status: "info" });
    } catch (err: any) {
      toast({ title: "Error deleting quiz", description: String(err), status: "error" });
    }
  }, [updateCourseTree, toast]);

  // Question CRUD
  const handleAddQuestion = useCallback(async (quizId: string, lessonId: string) => {
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
        question_text: newQuestionText,
        options: newOptions,
        correct_answer: newCorrect.map((i) => newOptions[i]),
        explanation: { JSONContent: newExplanation },
      };

      const created = await unwrap(createQuizQuestion(payload));

      updateCourseTree(prev => prev.map(c => ({
        ...c,
        modules: c.modules.map(m => ({
          ...m,
          units: m.units.map(u => ({
            ...u,
            lessons: u.lessons.map(l =>
              l.id === lessonId
                ? {
                    ...l,
                    quizzes: l.quizzes?.map(q =>
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
      })));

      // Reset form
      setNewQuestionText(EMPTY_DOC);
      setNewOptions(DEFAULT_OPTIONS);
      setNewCorrect([]);
      setNewExplanation(EMPTY_DOC);

      toast({ title: "Question added", status: "success" });
    } catch (err: any) {
      toast({ title: "Error adding question", description: String(err), status: "error" });
    }
  }, [newQuestionText, newCorrect, newOptions, newExplanation, unwrap, updateCourseTree, setNewQuestionText, setNewOptions, setNewCorrect, setNewExplanation, toast]);

  const handleDeleteQuestion = useCallback(async (quizId: string, questionId: string, lessonId: string) => {
    if (!confirm("Delete question?")) return;
    
    try {
      await deleteQuizQuestion(questionId);
      updateCourseTree(prev => prev.map(c => ({
        ...c,
        modules: c.modules.map(m => ({
          ...m,
          units: m.units.map(u => ({
            ...u,
            lessons: u.lessons.map(l =>
              l.id === lessonId
                ? {
                    ...l,
                    quizzes: l.quizzes?.map(q =>
                      q.id === quizId
                        ? {
                            ...q,
                            questions: (q.questions || []).filter(qq => qq.id !== questionId),
                          }
                        : q
                    ),
                  }
                : l
            ),
          })),
        })),
      })));
      toast({ title: "Question deleted", status: "info" });
    } catch (err: any) {
      toast({ title: "Error deleting question", description: String(err), status: "error" });
    }
  }, [updateCourseTree, toast]);

  // Derived data
  const visibleCourses = useMemo(() => {
    if (!search.trim()) return courses;
    const query = search.toLowerCase();
    return courses.filter(c => (c.title || "").toLowerCase().includes(query));
  }, [courses, search]);

  // Render tree (optimized)
  const renderTree = useMemo(() => {
    const renderLesson = (lesson: Lesson) => (
      <Flex key={lesson.id} align="center" justify="space-between" p={1}>
        <Text
          cursor="pointer"
          onClick={() => selectNode({ type: "lesson", id: lesson.id })}
        >
          {lesson.title}
        </Text>
        <HStack spacing={1}>
          <IconButton
            aria-label="edit-lesson"
            size="sm"
            icon={Icon(PencilIcon, { width: 4, height: 4 })}
            onClick={() => selectNode({ type: "lesson", id: lesson.id })}
          />
          <IconButton
            aria-label="delete-lesson"
            size="sm"
            icon={Icon(TrashIcon, { width: 4, height: 4 })}
            onClick={() => handleDeleteLesson(lesson.id)}
          />
        </HStack>
      </Flex>
    );

    const renderUnit = (unit: Unit) => (
      <Box key={unit.id} mb={1}>
        <Flex align="center" justify="space-between" p={1}>
          <HStack spacing={2}>
            <IconButton
              aria-label={`expand-unit-${unit.id}`}
              size="xs"
              variant="ghost"
              icon={Icon(expandedById[unit.id] ? ChevronUpIcon : ChevronDownIcon, { width: 4, height: 4 })}
              onClick={() => toggleExpand(unit.id)}
            />
            <Text
              cursor="pointer"
              onClick={() => selectNode({ type: "unit", id: unit.id })}
            >
              {unit.title}
            </Text>
          </HStack>
          <HStack spacing={1}>
            <IconButton
              aria-label="edit-unit"
              size="sm"
              icon={Icon(PencilIcon, { width: 6, height: 6 })}
              onClick={() => selectNode({ type: "unit", id: unit.id })}
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
              onClick={() => handleDeleteUnit(unit.id)}
            />
          </HStack>
        </Flex>
        <Collapse in={!!expandedById[unit.id]} animateOpacity>
          <Box pl={6} py={1}>
            {(unit.lessons || []).map(renderLesson)}
          </Box>
        </Collapse>
      </Box>
    );

    const renderModule = (module: Module) => (
      <Box key={module.id} borderWidth={1} borderRadius="md" mb={2}>
        <Flex align="center" justify="space-between" p={2}>
          <HStack spacing={2}>
            <IconButton
              aria-label={`expand-module-${module.id}`}
              size="xs"
              variant="ghost"
              icon={Icon(expandedById[module.id] ? ChevronUpIcon : ChevronDownIcon, { width: 6, height: 6 })}
              onClick={() => toggleExpand(module.id)}
            />
            <Text
              cursor="pointer"
              onClick={() => selectNode({ type: "module", id: module.id })}
            >
              {module.title}
            </Text>
          </HStack>
          <HStack spacing={1}>
            <IconButton
              aria-label="edit-module"
              size="sm"
              icon={Icon(PencilIcon, { width: 6, height: 6 })}
              onClick={() => selectNode({ type: "module", id: module.id })}
            />
            <IconButton
              aria-label="add-unit"
              size="sm"
              icon={Icon(PlusIcon, { width: 4, height: 4 })}
              onClick={() => handleCreateUnit(module.id)}
            />
            <IconButton
              aria-label="delete-module"
              size="sm"
              icon={Icon(TrashIcon, { width: 4, height: 4 })}
              onClick={() => handleDeleteModule(module.id)}
            />
          </HStack>
        </Flex>
        <Collapse in={!!expandedById[module.id]} animateOpacity>
          <Box pl={6} py={1}>
            {(module.units || []).map(renderUnit)}
          </Box>
        </Collapse>
      </Box>
    );

    const renderCourse = (course: Course) => (
      <Box key={course.id} borderWidth={1} borderRadius="md" mb={3} overflow="visible">
        <Flex align="center" justify="space-between" p={2}>
          <HStack spacing={2} align="center">
            <IconButton
              aria-label={`expand-course-${course.id}`}
              icon={Icon(expandedById[course.id] ? ChevronUpIcon : ChevronDownIcon, { width: 6, height: 6 })}
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
              onClick={() => handleDeleteCourse(course.id)}
            />
          </HStack>
        </Flex>
        <Collapse in={!!expandedById[course.id]} animateOpacity>
          <Box pl={6} py={2}>
            {(course.modules || []).map(renderModule)}
          </Box>
        </Collapse>
      </Box>
    );

    return visibleCourses.map(renderCourse);
  }, [
    visibleCourses, expandedById, toggleExpand, selectNode, 
    handleCreateModule, handleDeleteCourse, handleCreateUnit, 
    handleDeleteModule, handleCreateLesson, handleDeleteUnit, 
    handleDeleteLesson
  ]);

  // Detail pane renderer
  const renderDetailPane = useCallback(() => {
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

    switch (selected.type) {
      case "course": {
        const course = treeFinders.course;
        return (
          <Box>
            <Heading size="sm" mb={2}>Edit Course</Heading>
            <FormControl mb={2}>
              <FormLabel>Title</FormLabel>
              <ChakraInput value={courseTitle} onChange={(e) => handleCourseTitleChange(e.target.value)} />
            </FormControl>
            <FormControl mb={2}>
              <FormLabel>Description</FormLabel>
              <Textarea value={courseDescription} onChange={(e) => handleCourseDescriptionChange(e.target.value)} />
            </FormControl>
            <HStack mt={3}>
              <Button colorScheme="blue" onClick={handleSaveCourse}>Save</Button>
              <Button colorScheme="red" onClick={() => handleDeleteCourse(selected.id)}>Delete</Button>
            </HStack>
            <Divider my={4} />
            <Text fontWeight="semibold">Modules ({course?.modules?.length || 0})</Text>
          </Box>
        );
      }

      case "module": {
        const module = treeFinders.module;
        return (
          <Box>
            <Heading size="sm" mb={2}>Edit Module</Heading>
            <FormControl mb={2}>
              <FormLabel>Title</FormLabel>
              <ChakraInput value={moduleTitle} onChange={(e) => handleModuleTitleChange(e.target.value)} />
            </FormControl>
            <HStack mt={3}>
              <Button colorScheme="blue" onClick={handleSaveModule}>Save</Button>
              <Button colorScheme="red" onClick={() => handleDeleteModule(selected.id)}>Delete</Button>
            </HStack>
            <Divider my={4} />
            <Text fontWeight="semibold">Units ({module?.module?.units?.length || 0})</Text>
          </Box>
        );
      }

      case "unit": {
        const unit = treeFinders.unit;
        return (
          <Box>
            <Heading size="sm" mb={2}>Edit Unit</Heading>
            <FormControl mb={2}>
              <FormLabel>Title</FormLabel>
              <ChakraInput value={unitTitle} onChange={(e) => handleUnitTitleChange(e.target.value)} />
            </FormControl>
            <HStack mt={3}>
              <Button colorScheme="blue" onClick={handleSaveUnit}>Save</Button>
              <Button colorScheme="red" onClick={() => handleDeleteUnit(selected.id)}>Delete</Button>
            </HStack>
            <Divider my={4} />
            <Text fontWeight="semibold">Lessons ({unit?.unit?.lessons?.length || 0})</Text>
          </Box>
        );
      }

      case "lesson": {
        const lesson = treeFinders.lesson?.lesson;
        if (!lesson) return <Text>Lesson not found</Text>;

        return (
          <Box>
            <Heading size="sm" mb={2}>Edit Lesson</Heading>
            <FormControl mb={2}>
              <FormLabel>Title</FormLabel>
              <ChakraInput value={lessonTitle} onChange={(e) => handleLessonTitleChange(e.target.value)} />
            </FormControl>
            <FormControl mb={2}>
              <FormLabel>Order Index</FormLabel>
              <NumberInput value={lessonOrder} onChange={(v) => handleLessonOrderChange(Number(v))}>
                <NumberInputField />
              </NumberInput>
            </FormControl>
            <FormControl mb={2}>
              <FormLabel>Content</FormLabel>
              <SafeRichTextEditor
                value={lessonContent}
                onChange={setLessonContent}
                trackChanges={trackChanges}
                placeholder="Write your lesson content here..."
              />
            </FormControl>
            <HStack mt={3}>
              <Button colorScheme="blue" onClick={handleSaveLesson}>Save Lesson</Button>
              <Button colorScheme="red" onClick={() => handleDeleteLesson(selected.id)}>Delete Lesson</Button>
            </HStack>

            {/* Quizzes Section */}
            <Divider my={6} />
            <Box>
              <HStack justify="space-between">
                <Text fontWeight="semibold">Quizzes</Text>
                <Button
                  size="sm"
                  leftIcon={Icon(PlusIcon, { width: 6, height: 6 })}
                  onClick={() => handleAddQuiz(lesson.id)}
                >
                  Add Quiz
                </Button>
              </HStack>

              <VStack spacing={3} mt={3} align="stretch">
                {(lesson.quizzes || []).map((q) => (
                  <Box key={q.id} borderWidth={1} borderRadius="md" p={3}>
                    <Flex justify="space-between" align="center">
                      <Text>Quiz: {q.id} — Passing: {q.passing_score}</Text>
                      <HStack>
                        <Button
                          size="xs"
                          colorScheme="red"
                          onClick={() => handleDeleteQuiz(q.id, lesson.id)}
                        >
                          Delete Quiz
                        </Button>
                      </HStack>
                    </Flex>

                    {/* Questions list */}
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
                          <Box flex="1">
                            <Text fontWeight="semibold">Q{idx + 1}</Text>
                            <RichTextView content={parseContent(qq.question_text)} />
                            <Text fontSize="sm" mt={1}>Options: {qq.options?.join(", ")}</Text>
                            <Text fontSize="sm">Correct: {qq.correct_answer?.join(", ")}</Text>
                            {qq.explanation?.text && (
                              <Box mt={1}>
                                <Text fontSize="sm" fontWeight="semibold">Explanation:</Text>
                                <RichTextView content={parseContent(qq.explanation.text)} />
                              </Box>
                            )}
                          </Box>
                          <Button
                            size="xs"
                            colorScheme="red"
                            onClick={() => handleDeleteQuestion(q.id, qq.id, lesson.id)}
                          >
                            Delete
                          </Button>
                        </Flex>
                      ))}
                    </VStack>

                    {/* Add new question form */}
                    <Box mt={3} borderTopWidth={1} pt={3}>
                      <FormControl mb={2}>
                        <FormLabel>Question Text</FormLabel>
                        <SafeRichTextEditor
                          value={newQuestionText}
                          onChange={setNewQuestionText}
                          trackChanges={trackChanges}
                          placeholder="Enter the question text..."
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
                            {newCorrect.includes(i) ? "Correct ✓" : "Mark Correct"}
                          </Button>
                        </FormControl>
                      ))}

                      <FormControl mb={2}>
                        <FormLabel>Explanation</FormLabel>
                        <SafeRichTextEditor
                          value={newExplanation}
                          onChange={setNewExplanation}
                          trackChanges={trackChanges}
                          placeholder="Enter explanation for the correct answer..."
                        />
                      </FormControl>

                      <Button
                        size="sm"
                        colorScheme="green"
                        onClick={() => handleAddQuestion(q.id, lesson.id)}
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

      default:
        return null;
    }
  }, [
    selected, treeFinders, courseTitle, courseDescription, moduleTitle, unitTitle, 
    lessonTitle, lessonOrder, lessonContent, newQuestionText, newOptions, newCorrect, 
    newExplanation, handleCourseTitleChange, handleCourseDescriptionChange, 
    handleModuleTitleChange, handleUnitTitleChange, handleLessonTitleChange, 
    handleLessonOrderChange, handleSaveCourse, handleDeleteCourse, handleSaveModule, 
    handleDeleteModule, handleSaveUnit, handleDeleteUnit, handleSaveLesson, 
    handleDeleteLesson, handleAddQuiz, handleDeleteQuiz, handleDeleteQuestion, 
    handleAddQuestion, trackChanges, parseContent
  ]);

  return (
    <>
      <AlertDialog isOpen={showConfirm} leastDestructiveRef={cancelRef} onClose={cancelAction} isCentered>
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">Unsaved Changes</AlertDialogHeader>
            <AlertDialogBody>You have unsaved changes. Are you sure you want to leave? All unsaved changes will be lost.</AlertDialogBody>
            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={cancelAction}>Stay on Page</Button>
              <Button colorScheme="red" onClick={confirmAction} ml={3}>Leave Anyway</Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>

      <Flex gap={4} align="stretch" p={4}>
        <Box width="38%" maxH="80vh" overflowY="auto" borderRightWidth={1} pr={3}>
          <Flex justify="space-between" align="center" mb={3}>
            <Heading size="sm">Content Tree</Heading>
            <Button size="sm" onClick={handleCreateCourse} leftIcon={Icon(PlusIcon, { width: 6, height: 6 })}>
              Add Course
            </Button>
          </Flex>
          <Input placeholder="Search courses..." mb={3} value={search} onChange={(e) => setSearch(e.target.value)} />
          {loading ? <Spinner /> : <Stack spacing={2}>{renderTree}</Stack>}
        </Box>

        <Box flex="1" maxH="80vh" overflowY="auto" pl={4}>
          {renderDetailPane()}
        </Box>
      </Flex>
    </>
  );
}
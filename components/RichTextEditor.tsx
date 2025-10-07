// components/RichTextEditor.tsx
"use client";

import { useEditor, EditorContent, JSONContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import { Table } from "@tiptap/extension-table";
import TableRow from "@tiptap/extension-table-row";
import TableCell from "@tiptap/extension-table-cell";
import TableHeader from "@tiptap/extension-table-header";
import Placeholder from "@tiptap/extension-placeholder";
import TextAlign from "@tiptap/extension-text-align";
import Underline from "@tiptap/extension-underline";
import Focus from "@tiptap/extension-focus";
import Typography from "@tiptap/extension-typography";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import Highlight from "@tiptap/extension-highlight";
import Color from "@tiptap/extension-color";
import { TextStyle } from "@tiptap/extension-text-style";
import BulletList from "@tiptap/extension-bullet-list";
import OrderedList from "@tiptap/extension-ordered-list";
import ListItem from "@tiptap/extension-list-item";
import Dropcursor from "@tiptap/extension-dropcursor";
import Gapcursor from "@tiptap/extension-gapcursor";

import {
  Box,
  VStack,
  HStack,
  IconButton,
  Tooltip,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverBody,
  Input,
  Text,
  useToast,
  Portal,
  Button,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Flex,
  useColorModeValue,
  Divider,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
} from "@chakra-ui/react";

import { useEffect, useState, useRef, useCallback } from "react";
import { uploadToCloudinary } from "@/lib/cloudinary";
import { deleteFromCloudinary, getPublicIdFromUrl } from "@/lib/cloudinary";

import {
  FaBold,
  FaItalic,
  FaUnderline,
  FaLink,
  FaTable,
  FaChevronDown,
  FaImage,
  FaListUl,
  FaListOl,
  FaAlignLeft,
  FaAlignCenter,
  FaAlignRight,
  FaAlignJustify,
  FaCode,
  FaQuoteLeft,
  FaPalette,
  FaStrikethrough,
  FaRedo,
  FaUndo,
  FaParagraph,
  FaHeading,
  FaExpand,
  FaCompress,
  FaHighlighter,
  FaTasks,
  FaEraser,
  FaCopy,
  FaTrash,
  FaOutdent,
  FaIndent,
} from "react-icons/fa";

interface RichTextEditorProps {
  value: string | JSONContent | null;
  onChange: (val: JSONContent) => void;
  placeholder?: string;
  autoFocus?: boolean;
  minHeight?: string;
  readOnly?: boolean;
}

export default function RichTextEditor({
  value,
  onChange,
  placeholder = "Start writing your content...",
  autoFocus = false,
  minHeight = "400px",
  readOnly = false,
}: RichTextEditorProps) {
  const [mounted, setMounted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const {
    isOpen: isLinkModalOpen,
    onOpen: onLinkModalOpen,
    onClose: onLinkModalClose,
  } = useDisclosure();
  const {
    isOpen: isTableModalOpen,
    onOpen: onTableModalOpen,
    onClose: onTableModalClose,
  } = useDisclosure();
  const [linkData, setLinkData] = useState<{ url: string; text?: string }>({
    url: "",
    text: "",
  });
  const [tableData, setTableData] = useState({ rows: 3, cols: 3 });
  const [uploadedImages, setUploadedImages] = useState<Set<string>>(new Set());
  const fileInputRef = useRef<HTMLInputElement>(null);
  const toast = useToast();

  // Chakra UI color values for consistent theming
  const bgCard = useColorModeValue("white", "gray.800");
  const bgToolbar = useColorModeValue("gray.50", "gray.700");
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const focusBorderColor = useColorModeValue("blue.500", "blue.300");
  const textSecondary = useColorModeValue("gray.600", "gray.400");
  const tableBorderColor = useColorModeValue("gray.300", "gray.500");

  // Custom Image extension with responsive sizing and custom attributes
  const CustomImage = Image.extend({
    addAttributes() {
      return {
        ...this.parent?.(),
        alt: {
          default: null,
        },
        title: {
          default: null,
        },
        loading: {
          default: "lazy",
        },
        // Custom attributes for upload state
        "data-uploading": {
          default: null,
          parseHTML: (element: any) => element.getAttribute("data-uploading"),
          renderHTML: (attributes: any) => {
            if (!attributes["data-uploading"]) return {};
            return { "data-uploading": attributes["data-uploading"] };
          },
        },
        "data-id": {
          default: null,
          parseHTML: (element: any) => element.getAttribute("data-id"),
          renderHTML: (attributes: any) => {
            if (!attributes["data-id"]) return {};
            return { "data-id": attributes["data-id"] };
          },
        },
      };
    },
  });

  // Enhanced table extensions with better styling
  const CustomTable = Table.configure({
    HTMLAttributes: {
      class: "rich-text-table",
    },
    resizable: true,
  });

  const CustomTableCell = TableCell.configure({
    HTMLAttributes: {
      class: "rich-text-table-cell",
      style: "border: 1px solid; padding: 8px 12px; min-width: 100px;",
    },
  });

  const CustomTableHeader = TableHeader.configure({
    HTMLAttributes: {
      class: "rich-text-table-header",
      style:
        "border: 1px solid; padding: 8px 12px; background: #f8f9fa; font-weight: bold;",
    },
  });

  // Enhanced list configuration for multi-level support
  const CustomBulletList = BulletList.configure({
    HTMLAttributes: {
      class: "rich-text-bullet-list",
    },
  });

  const CustomOrderedList = OrderedList.configure({
    HTMLAttributes: {
      class: "rich-text-ordered-list",
    },
  });

  const CustomListItem = ListItem.configure({
    HTMLAttributes: {
      class: "rich-text-list-item",
    },
  });

  // Editor configuration
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] as const },
        codeBlock: {
          HTMLAttributes: {
            class:
              "font-mono bg-gray-100 dark:bg-gray-800 p-4 rounded border border-gray-300 dark:border-gray-600 my-4",
          },
        },
        blockquote: {
          HTMLAttributes: {
            class:
              "border-l-4 border-blue-500 pl-4 italic bg-blue-50 dark:bg-blue-900/20 py-2 my-4",
          },
        },
        bulletList: false, // Disable default to use our custom one
        orderedList: false, // Disable default to use our custom one
        listItem: false, // Disable default to use our custom one
        // Disable these built-in StarterKit extensions because we register
        // them separately below (Dropcursor, Gapcursor, Link, Underline).
        dropcursor: false,
        gapcursor: false,
        link: false,
        underline: false,
      }),
      Dropcursor.configure({ width: 2, color: "#3B82F6" }),
      Gapcursor,
      CustomBulletList,
      CustomOrderedList,
      CustomListItem,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class:
            "text-blue-600 dark:text-blue-400 underline hover:text-blue-800 dark:hover:text-blue-300 transition-colors",
          target: "_blank",
          rel: "noopener noreferrer",
        },
      }),
      CustomImage.configure({
        HTMLAttributes: {
          class:
            "rich-text-image rounded-lg my-4 cursor-pointer max-w-full h-auto",
        },
      }),
      CustomTable,
      TableRow,
      CustomTableHeader,
      CustomTableCell,
      TextAlign.configure({
        types: ["heading", "paragraph", "image"],
        alignments: ["left", "center", "right", "justify"],
      }),
      Underline,
      Highlight.configure({ multicolor: true }),
      Color.configure({ types: ["textStyle"] }),
      TextStyle,
      Typography,
      TaskList,
      TaskItem.configure({
        nested: true,
        HTMLAttributes: {
          class: "rich-text-task-item",
        },
      }),
      Focus.configure({
        mode: "deepest",
        className: "has-focus ring-2 ring-blue-500 rounded px-1",
      }),
      Placeholder.configure({ placeholder }),
    ],
    content: value || { type: "doc", content: [{ type: "paragraph" }] },
    editorProps: {
      attributes: {
        class: `prose prose-lg max-w-none outline-none p-4 rounded-md focus:outline-none bg-white dark:bg-gray-800 ${
          isFullscreen ? "min-h-screen" : "min-h-[400px]"
        } dark:prose-invert prose-headings:font-bold prose-p:leading-relaxed prose-img:max-w-full prose-img:h-auto prose-img:rounded-lg prose-img:my-4 prose-table:w-full prose-td:border prose-th:border prose-td:p-2 prose-th:p-2 prose-td:border-gray-300 prose-th:border-gray-300 dark:prose-td:border-gray-500 dark:prose-th:border-gray-500 prose-th:bg-gray-100 dark:prose-th:bg-gray-700`,
        spellCheck: "true",
        "data-gramm": "false",
      },
      handlePaste: (view, event) => {
        const items = event.clipboardData?.items;

        // Handle image paste
        if (items) {
          for (let i = 0; i < items.length; i++) {
            if (items[i].type.startsWith("image/")) {
              event.preventDefault();
              const file = items[i].getAsFile();
              if (file) {
                handleImageUpload(file);
              }
              return true;
            }
          }
        }

        // Handle HTML paste with cleaning
        const html = event.clipboardData?.getData("text/html");
        if (html) {
          event.preventDefault();
          const tmp = document.createElement("div");
          tmp.innerHTML = html;

          // Clean up pasted content
          tmp.querySelectorAll("*").forEach((el) => {
            (el as HTMLElement).removeAttribute("style");
            (el as HTMLElement).removeAttribute("class");
            (el as HTMLElement).removeAttribute("id");
          });

          const cleanedText = tmp.textContent || "";
          view.dispatch(
            view.state.tr.insertText(
              cleanedText,
              view.state.selection.from,
              view.state.selection.to
            )
          );
          return true;
        }

        return false;
      },
      handleDrop: (view, event, slice, moved) => {
        if (event.dataTransfer?.files && event.dataTransfer.files.length > 0) {
          event.preventDefault();
          const files = Array.from(event.dataTransfer.files);
          files.forEach(async (file) => {
            if (file.type.startsWith("image/")) {
              await handleImageUpload(file);
            }
          });
          return true;
        }
        return false;
      },
    },
    autofocus: autoFocus,
    editable: !readOnly,
    injectCSS: false,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      const content = editor.getJSON();
      onChange(content);
    },
  });

  // Mount guard for SSR
  useEffect(() => setMounted(true), []);

  // Sync content
  useEffect(() => {
    if (!editor || !mounted) return;
    const current = JSON.stringify(editor.getJSON());
    const incoming = JSON.stringify(value);
    if (current !== incoming && incoming !== "null" && incoming !== '""') {
      try {
        editor.commands.setContent(
          value || { type: "doc", content: [{ type: "paragraph" }] },
          {
            emitUpdate: false,
          } as any
        );
      } catch {
        editor.commands.setContent(
          value || { type: "doc", content: [{ type: "paragraph" }] }
        );
      }
    }
  }, [editor, mounted, value]);

  // Image upload handler with automatic responsive sizing
  const handleImageUpload = useCallback(
    async (file: File): Promise<void> => {
      if (!editor) return;

      try {
        const placeholderId = `upload-${Date.now()}`;

        // Insert temporary placeholder
        editor.commands.setImage({
          src: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='200'%3E%3Crect width='100%25' height='100%25' fill='%23f3f4f6'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='Arial' font-size='14' fill='%236b7280'%3EUploading...%3C/text%3E%3C/svg%3E",
          alt: "Uploading...",
        });

        setTimeout(() => {
          const { state, dispatch } = editor.view;
          const { doc } = state;

          doc.descendants((node, pos) => {
            if (
              node.type.name === "image" &&
              node.attrs.src.includes("data:image/svg+xml")
            ) {
              const tr = state.tr.setNodeMarkup(pos, undefined, {
                ...node.attrs,
                "data-uploading": "true",
                "data-id": placeholderId,
              });
              dispatch(tr);
            }
          });
        }, 100);

        const url = await uploadToCloudinary(file, "images");
        if (!url) throw new Error("Upload failed");

        // Track uploaded image
        setUploadedImages((prev) => new Set(prev).add(url));

        // Replace placeholder with actual image
        const { state, dispatch } = editor.view;
        const { doc } = state;
        let found = false;

        doc.descendants((node, pos) => {
          if (found) return;
          if (
            node.type.name === "image" &&
            node.attrs["data-id"] === placeholderId
          ) {
            const tr = state.tr.setNodeMarkup(pos, undefined, {
              src: url,
              alt: file.name,
              title: file.name,
              "data-uploading": null,
              "data-id": null,
              "data-src": url, // Store original URL for deletion
            });
            dispatch(tr);
            found = true;
          }
        });

        toast({
          title: "Image uploaded successfully",
          status: "success",
          duration: 2000,
          isClosable: true,
        });
      } catch (err) {
        console.error("Upload error", err);

        // Remove failed upload placeholder
        if (editor) {
          const { state, dispatch } = editor.view;
          const { doc } = state;

          doc.descendants((node, pos) => {
            if (
              node.type.name === "image" &&
              node.attrs["data-uploading"] === "true"
            ) {
              dispatch(state.tr.delete(pos, pos + node.nodeSize));
            }
          });
        }

        toast({
          title: "Upload failed",
          description:
            "Please try again with a smaller image or different format.",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      }
    },
    [editor, toast]
  );

  // Enhanced image deletion with Cloudinary cleanup
  const deleteImage = useCallback(
    async (imageUrl: string) => {
      if (!editor) return;

      try {
        // Extract public_id from Cloudinary URL for deletion
        const publicId = getPublicIdFromUrl(imageUrl);

        if (publicId) {
          // Delete from Cloudinary (optional - you might want to keep images for backup)
          try {
            await deleteFromCloudinary(publicId);
            console.log("Image deleted from Cloudinary:", publicId);
          } catch (deleteError) {
            console.warn(
              "Failed to delete from Cloudinary, but continuing with editor cleanup:",
              deleteError
            );
            // Continue even if Cloudinary deletion fails
          }
        }

        // Remove from tracked images
        setUploadedImages((prev) => {
          const newSet = new Set(prev);
          newSet.delete(imageUrl);
          return newSet;
        });

        // Remove from editor using transaction
        const { state, dispatch } = editor.view;
        const { doc } = state;
        let imageRemoved = false;

        doc.descendants((node, pos) => {
          if (imageRemoved) return;
          if (node.type.name === "image" && node.attrs.src === imageUrl) {
            // Select the image node first, then delete
            const tr = state.tr.setSelection(state.selection);
            tr.setSelection(state.selection);
            tr.delete(pos, pos + node.nodeSize);
            dispatch(tr);
            imageRemoved = true;
          }
        });

        // Fallback: if we couldn't find the specific image, delete selection
        if (!imageRemoved && editor.state.selection.empty === false) {
          editor.chain().focus().deleteSelection().run();
        }

        toast({
          title: "Image deleted",
          status: "success",
          duration: 2000,
          isClosable: true,
        });
      } catch (err) {
        console.error("Delete error", err);
        toast({
          title: "Failed to delete image",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      }
    },
    [editor, toast]
  );

  // Enhanced backspace/delete key handler for images
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!editor) return;

      const { state } = editor.view;
      const { selection } = state;

      // Check if we're about to delete an image
      if (event.key === "Backspace" || event.key === "Delete") {
        const { $from, $to } = selection;

        // Check if selection contains an image
        state.doc.nodesBetween($from.pos, $to.pos, (node, pos) => {
          if (node.type.name === "image") {
            const imageUrl = node.attrs.src;
            if (imageUrl && !imageUrl.includes("data:image/svg+xml")) {
              // Prevent default deletion and use our custom delete
              event.preventDefault();
              deleteImage(imageUrl);
              return false; // Stop traversing
            }
          }
        });

        // Check if cursor is right after an image
        if (selection.empty) {
          const $pos = selection.$from;
          const nodeBefore = $pos.nodeBefore;

          if (nodeBefore?.type.name === "image") {
            const imageUrl = nodeBefore.attrs.src;
            if (imageUrl && !imageUrl.includes("data:image/svg+xml")) {
              event.preventDefault();
              deleteImage(imageUrl);
            }
          }
        }
      }
    },
    [editor, deleteImage]
  );

  // Add click handler for image deletion
  const handleImageClick = useCallback(
    (event: MouseEvent) => {
      if (!editor) return;

      const target = event.target as HTMLElement;
      if (
        target.tagName === "IMG" &&
        target.classList.contains("rich-text-image")
      ) {
        const imageUrl = target.getAttribute("src");
        if (imageUrl && !imageUrl.includes("data:image/svg+xml")) {
          // Select the image when clicked
          const { state, dispatch } = editor.view;
          const { doc } = state;

          doc.descendants((node, pos) => {
            if (node.type.name === "image" && node.attrs.src === imageUrl) {
              const tr = state.tr.setSelection(state.selection);
              tr.setSelection(state.selection);
              dispatch(tr);
            }
          });
        }
      }
    },
    [editor]
  );

  // Add table delete function
  const deleteTable = useCallback(() => {
    if (!editor) return;

    if (editor.isActive("table")) {
      editor.chain().focus().deleteTable().run();
      toast({
        title: "Table deleted",
        status: "success",
        duration: 2000,
        isClosable: true,
      });
    }
  }, [editor, toast]);

  // Add indent/outdent functions for multi-level lists
  const indentList = useCallback(() => {
    if (!editor) return;
    editor.chain().focus().sinkListItem("listItem").run();
  }, [editor]);

  const outdentList = useCallback(() => {
    if (!editor) return;
    editor.chain().focus().liftListItem("listItem").run();
  }, [editor]);

  // Helper functions
  const triggerImageUpload = () => fileInputRef.current?.click();

  const handleInsertLink = () => {
    if (!editor) return;
    const sel = editor.state.selection;
    const text = editor.state.doc.textBetween(sel.from, sel.to, " ");
    setLinkData({ url: "", text: text || "" });
    onLinkModalOpen();
  };

  const confirmLinkInsertion = () => {
    if (!linkData.url || !editor) return;
    if (linkData.text) {
      editor
        .chain()
        .focus()
        .insertContent(linkData.text)
        .setLink({ href: linkData.url })
        .run();
    } else {
      editor.chain().focus().setLink({ href: linkData.url }).run();
    }
    setLinkData({ url: "", text: "" });
    onLinkModalClose();
  };

  const removeLink = () => {
    editor?.chain().focus().unsetLink().run();
    onLinkModalClose();
  };

  const handleInsertTable = () => {
    if (!editor) return;
    editor
      .chain()
      .focus()
      .insertTable({
        rows: tableData.rows,
        cols: tableData.cols,
        withHeaderRow: true,
      })
      .run();
    onTableModalClose();
  };

  const clearFormatting = () =>
    editor?.chain().focus().clearNodes().unsetAllMarks().run();

  const copyAsHTML = async () => {
    if (!editor) return;
    await navigator.clipboard.writeText(editor.getHTML());
    toast({
      title: "HTML copied to clipboard",
      status: "success",
      duration: 1500,
      position: "top-right",
    });
  };

  // Enhanced keyboard shortcuts with image deletion
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && editor && !readOnly) {
        switch (e.key.toLowerCase()) {
          case "b":
            e.preventDefault();
            editor.chain().focus().toggleBold().run();
            break;
          case "i":
            e.preventDefault();
            editor.chain().focus().toggleItalic().run();
            break;
          case "k":
            e.preventDefault();
            handleInsertLink();
            break;
          case "z":
            e.preventDefault();
            if (e.shiftKey) editor.chain().focus().redo().run();
            else editor.chain().focus().undo().run();
            break;
          case "d":
            // Ctrl+D to delete selected image
            if (editor.isActive("image")) {
              e.preventDefault();
              const imageUrl = editor.getAttributes("image").src;
              if (imageUrl && !imageUrl.includes("data:image/svg+xml")) {
                deleteImage(imageUrl);
              }
            }
            break;
          case "]":
            // Ctrl+] to indent
            e.preventDefault();
            indentList();
            break;
          case "[":
            // Ctrl+[ to outdent
            e.preventDefault();
            outdentList();
            break;
        }
      }

      // Handle backspace/delete for images
      handleKeyDown(e);
    };

    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [editor, readOnly, handleKeyDown, deleteImage, indentList, outdentList]);

  // Add click listener for image selection
  useEffect(() => {
    if (!editor || readOnly) return;

    const view = editor.view;
    const handleClick = (event: Event) => handleImageClick(event as MouseEvent);

    view.dom.addEventListener("click", handleClick);
    return () => view.dom.removeEventListener("click", handleClick);
  }, [editor, readOnly, handleImageClick]);
  
  // Type safety for heading levels
  type HeadingLevel = 1 | 2 | 3;
  const toHeadingLevel = (n: number): HeadingLevel => {
    if (n < 1) return 1;
    if (n > 3) return 3;
    return n as HeadingLevel;
  };

  // Loading states
  if (!mounted) {
    return (
      <Box
        borderWidth={1}
        borderRadius="lg"
        p={4}
        minH={minHeight}
        bg={bgCard}
        borderColor={borderColor}
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        <Text color={textSecondary}>Loading editor...</Text>
      </Box>
    );
  }

  if (!editor) {
    return (
      <Box
        borderWidth={1}
        borderRadius="lg"
        p={4}
        minH={minHeight}
        bg="red.50"
        borderColor="red.200"
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        <Text color="red.600">
          Failed to load editor. Please refresh the page.
        </Text>
      </Box>
    );
  }

  return (
    <Box
      borderWidth={1}
      borderRadius="lg"
      p={4}
      w="100%"
      bg={bgCard}
      borderColor={borderColor}
      shadow="sm"
      className={isFullscreen ? "fixed inset-0 z-50 p-6" : "relative"}
      position={isFullscreen ? "fixed" : "relative"}
    >
      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        accept="image/*"
        style={{ display: "none" }}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleImageUpload(file);
          e.currentTarget.value = "";
        }}
      />

      {/* Header with actions */}
      <VStack spacing={3} align="stretch" mb={4}>
        <Flex justify="space-between" align="center" wrap="wrap" gap={2}>
          <Text fontSize="sm" color={textSecondary}>
            Rich Text Editor
          </Text>

          <HStack spacing={1}>
            <Tooltip label="Copy as HTML">
              <IconButton
                size="sm"
                icon={<FaCopy />}
                onClick={copyAsHTML}
                aria-label="Copy as HTML"
                variant="ghost"
                colorScheme="blue"
              />
            </Tooltip>
            <Tooltip
              label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
            >
              <IconButton
                size="sm"
                icon={isFullscreen ? <FaCompress /> : <FaExpand />}
                onClick={() => setIsFullscreen(!isFullscreen)}
                aria-label="Toggle fullscreen"
                variant="ghost"
                colorScheme="blue"
              />
            </Tooltip>
          </HStack>
        </Flex>

        {/* Main Toolbar */}
        {!readOnly && (
          <Box
            borderWidth={1}
            borderRadius="md"
            p={3}
            bg={bgToolbar}
            borderColor={borderColor}
          >
            {/* Text formatting row */}
            <HStack spacing={1} wrap="wrap" mb={3}>
              <Tooltip label="Bold (Ctrl+B)">
                <IconButton
                  size="sm"
                  icon={<FaBold />}
                  onClick={() => editor.chain().focus().toggleBold().run()}
                  isActive={editor.isActive("bold")}
                  aria-label="Bold"
                  colorScheme={editor.isActive("bold") ? "blue" : "gray"}
                  variant={editor.isActive("bold") ? "solid" : "ghost"}
                />
              </Tooltip>

              <Tooltip label="Italic (Ctrl+I)">
                <IconButton
                  size="sm"
                  icon={<FaItalic />}
                  onClick={() => editor.chain().focus().toggleItalic().run()}
                  isActive={editor.isActive("italic")}
                  aria-label="Italic"
                  colorScheme={editor.isActive("italic") ? "blue" : "gray"}
                  variant={editor.isActive("italic") ? "solid" : "ghost"}
                />
              </Tooltip>

              <Tooltip label="Underline">
                <IconButton
                  size="sm"
                  icon={<FaUnderline />}
                  onClick={() => editor.chain().focus().toggleUnderline().run()}
                  isActive={editor.isActive("underline")}
                  aria-label="Underline"
                  colorScheme={editor.isActive("underline") ? "blue" : "gray"}
                  variant={editor.isActive("underline") ? "solid" : "ghost"}
                />
              </Tooltip>

              <Tooltip label="Strikethrough">
                <IconButton
                  size="sm"
                  icon={<FaStrikethrough />}
                  onClick={() => editor.chain().focus().toggleStrike().run()}
                  isActive={editor.isActive("strike")}
                  aria-label="Strikethrough"
                  colorScheme={editor.isActive("strike") ? "blue" : "gray"}
                  variant={editor.isActive("strike") ? "solid" : "ghost"}
                />
              </Tooltip>

              <Tooltip label="Highlight">
                <IconButton
                  size="sm"
                  icon={<FaHighlighter />}
                  onClick={() => editor.chain().focus().toggleHighlight().run()}
                  isActive={editor.isActive("highlight")}
                  aria-label="Highlight"
                  colorScheme={editor.isActive("highlight") ? "blue" : "gray"}
                  variant={editor.isActive("highlight") ? "solid" : "ghost"}
                />
              </Tooltip>

              <Divider orientation="vertical" height="20px" />

              <Tooltip label="Undo (Ctrl+Z)">
                <IconButton
                  size="sm"
                  icon={<FaUndo />}
                  onClick={() => editor.chain().focus().undo().run()}
                  aria-label="Undo"
                  variant="ghost"
                  colorScheme="gray"
                />
              </Tooltip>

              <Tooltip label="Redo (Ctrl+Shift+Z)">
                <IconButton
                  size="sm"
                  icon={<FaRedo />}
                  onClick={() => editor.chain().focus().redo().run()}
                  aria-label="Redo"
                  variant="ghost"
                  colorScheme="gray"
                />
              </Tooltip>
            </HStack>

            <Divider my={2} />

            {/* Blocks and lists row */}
            <HStack spacing={1} wrap="wrap" mb={3}>
              <Menu>
                <MenuButton
                  as={Button}
                  size="sm"
                  rightIcon={<FaChevronDown />}
                  variant="ghost"
                  colorScheme="gray"
                >
                  Blocks
                </MenuButton>
                <MenuList>
                  <MenuItem
                    icon={<FaParagraph />}
                    onClick={() => editor.chain().focus().setParagraph().run()}
                  >
                    Paragraph
                  </MenuItem>
                  {[1, 2, 3].map((level) => (
                    <MenuItem
                      key={level}
                      icon={<FaHeading />}
                      onClick={() =>
                        editor
                          .chain()
                          .focus()
                          .toggleHeading({ level: toHeadingLevel(level) })
                          .run()
                      }
                    >
                      Heading {level}
                    </MenuItem>
                  ))}
                  <MenuItem
                    icon={<FaCode />}
                    onClick={() =>
                      editor.chain().focus().toggleCodeBlock().run()
                    }
                  >
                    Code Block
                  </MenuItem>
                  <MenuItem
                    icon={<FaQuoteLeft />}
                    onClick={() =>
                      editor.chain().focus().toggleBlockquote().run()
                    }
                  >
                    Blockquote
                  </MenuItem>
                </MenuList>
              </Menu>

              <Tooltip label="Bullet List">
                <IconButton
                  size="sm"
                  icon={<FaListUl />}
                  onClick={() =>
                    editor.chain().focus().toggleBulletList().run()
                  }
                  isActive={editor.isActive("bulletList")}
                  aria-label="Bullet List"
                  colorScheme={editor.isActive("bulletList") ? "blue" : "gray"}
                  variant={editor.isActive("bulletList") ? "solid" : "ghost"}
                />
              </Tooltip>

              <Tooltip label="Numbered List">
                <IconButton
                  size="sm"
                  icon={<FaListOl />}
                  onClick={() =>
                    editor.chain().focus().toggleOrderedList().run()
                  }
                  isActive={editor.isActive("orderedList")}
                  aria-label="Numbered List"
                  colorScheme={editor.isActive("orderedList") ? "blue" : "gray"}
                  variant={editor.isActive("orderedList") ? "solid" : "ghost"}
                />
              </Tooltip>

              <Tooltip label="Task List">
                <IconButton
                  size="sm"
                  icon={<FaTasks />}
                  onClick={() => editor.chain().focus().toggleTaskList().run()}
                  isActive={editor.isActive("taskList")}
                  aria-label="Task List"
                  colorScheme={editor.isActive("taskList") ? "blue" : "gray"}
                  variant={editor.isActive("taskList") ? "solid" : "ghost"}
                />
              </Tooltip>

              <Tooltip label="Indent list (Ctrl+])">
                <IconButton
                  size="sm"
                  icon={<FaIndent />}
                  onClick={indentList}
                  aria-label="Indent list"
                  variant="ghost"
                  colorScheme="gray"
                  isDisabled={!editor?.can().sinkListItem("listItem")}
                />
              </Tooltip>

              <Tooltip label="Outdent list (Ctrl+[)">
                <IconButton
                  size="sm"
                  icon={<FaOutdent />}
                  onClick={outdentList}
                  aria-label="Outdent list"
                  variant="ghost"
                  colorScheme="gray"
                  isDisabled={!editor?.can().liftListItem("listItem")}
                />
              </Tooltip>

              <Tooltip label="Delete table">
                <IconButton
                  size="sm"
                  icon={<FaTrash />}
                  onClick={deleteTable}
                  aria-label="Delete table"
                  variant="ghost"
                  colorScheme="red"
                  isDisabled={!editor?.isActive("table")}
                />
              </Tooltip>

              <Tooltip label="Clear formatting">
                <IconButton
                  size="sm"
                  icon={<FaEraser />}
                  onClick={clearFormatting}
                  aria-label="Clear formatting"
                  variant="ghost"
                  colorScheme="gray"
                />
              </Tooltip>
            </HStack>

            <Divider my={2} />

            {/* Alignment and media row */}
            <HStack spacing={1} wrap="wrap">
              <Tooltip label="Align left">
                <IconButton
                  size="sm"
                  icon={<FaAlignLeft />}
                  onClick={() =>
                    editor.chain().focus().setTextAlign("left").run()
                  }
                  aria-label="Align left"
                  variant="ghost"
                  colorScheme="gray"
                />
              </Tooltip>
              <Tooltip label="Align center">
                <IconButton
                  size="sm"
                  icon={<FaAlignCenter />}
                  onClick={() =>
                    editor.chain().focus().setTextAlign("center").run()
                  }
                  aria-label="Align center"
                  variant="ghost"
                  colorScheme="gray"
                />
              </Tooltip>
              <Tooltip label="Align right">
                <IconButton
                  size="sm"
                  icon={<FaAlignRight />}
                  onClick={() =>
                    editor.chain().focus().setTextAlign("right").run()
                  }
                  aria-label="Align right"
                  variant="ghost"
                  colorScheme="gray"
                />
              </Tooltip>
              <Tooltip label="Insert image">
                <IconButton
                  size="sm"
                  icon={<FaImage />}
                  onClick={triggerImageUpload}
                  aria-label="Insert image"
                  variant="ghost"
                  colorScheme="gray"
                />
              </Tooltip>
              <Tooltip label="Insert link (Ctrl+K)">
                <IconButton
                  size="sm"
                  icon={<FaLink />}
                  onClick={handleInsertLink}
                  aria-label="Insert link"
                  variant="ghost"
                  colorScheme="gray"
                />
              </Tooltip>
              <Tooltip label="Insert table">
                <IconButton
                  size="sm"
                  icon={<FaTable />}
                  onClick={onTableModalOpen}
                  aria-label="Insert table"
                  variant="ghost"
                  colorScheme="gray"
                />
              </Tooltip>
              {editor?.isActive("image") && (
                <Tooltip label="Delete image (Ctrl+D)">
                  <IconButton
                    size="sm"
                    icon={<FaTrash />}
                    onClick={() => {
                      const imageUrl = editor.getAttributes("image").src;
                      if (
                        imageUrl &&
                        !imageUrl.includes("data:image/svg+xml")
                      ) {
                        deleteImage(imageUrl);
                      }
                    }}
                    aria-label="Delete image"
                    variant="ghost"
                    colorScheme="red"
                  />
                </Tooltip>
              )}
            </HStack>
          </Box>
        )}
      </VStack>

      {/* Editor content area */}
      <Box
        borderWidth={1}
        borderRadius="md"
        minH={minHeight}
        overflow="auto"
        p={4}
        borderColor={borderColor}
        _focusWithin={{
          borderColor: focusBorderColor,
          boxShadow: `0 0 0 1px ${focusBorderColor}`,
        }}
        transition="all 0.2s"
        className="rich-text-editor-content"
        sx={{
          // Remove background to use parent's background
          "& .ProseMirror": {
            backgroundColor: "transparent !important",
          },
          // Enhanced table styling
          "& .rich-text-table": {
            width: "100% !important",
            borderCollapse: "collapse !important",
            border: `1px solid ${tableBorderColor} !important`,
            margin: "1rem 0",
          },
          "& .rich-text-table-cell": {
            border: `1px solid ${tableBorderColor} !important`,
            padding: "12px !important",
            minWidth: "100px",
          },
          "& .rich-text-table-header": {
            border: `1px solid ${tableBorderColor} !important`,
            padding: "12px !important",
            backgroundColor:
              useColorModeValue("gray.50", "gray.700") + " !important",
            fontWeight: "bold !important",
            minWidth: "100px",
          },
          // Enhanced multi-level list styling
          "& .rich-text-bullet-list": {
            listStyleType: "disc",
            paddingLeft: "1.5rem",
            margin: "0.5rem 0",
            "& .rich-text-bullet-list": {
              listStyleType: "circle",
              margin: "0.25rem 0",
              "& .rich-text-bullet-list": {
                listStyleType: "square",
                margin: "0.25rem 0",
              },
            },
          },
          "& .rich-text-ordered-list": {
            listStyleType: "decimal",
            paddingLeft: "1.5rem",
            margin: "0.5rem 0",
            "& .rich-text-ordered-list": {
              listStyleType: "lower-alpha",
              margin: "0.25rem 0",
              "& .rich-text-ordered-list": {
                listStyleType: "lower-roman",
                margin: "0.25rem 0",
              },
            },
          },
          "& .rich-text-list-item": {
            margin: "0.25rem 0",
            lineHeight: "1.6",
            "& p": {
              margin: "0",
            },
          },
          // Image styling
          "& .rich-text-image": {
            maxWidth: "100% !important",
            height: "auto !important",
            borderRadius: "0.5rem",
            margin: "1rem 0",
            cursor: "pointer",
          },
          "& [data-uploading='true']": {
            opacity: 0.6,
            border: `2px dashed ${borderColor} !important`,
          },
          // Ensure proper spacing for nested lists
          "& .ProseMirror ul, & .ProseMirror ol": {
            margin: "0.5rem 0",
          },
          "& .ProseMirror li": {
            margin: "0.25rem 0",
          },
          "& .ProseMirror li > ul, & .ProseMirror li > ol": {
            margin: "0.25rem 0 0.25rem 1.5rem",
          },
        }}
      >
        <EditorContent editor={editor} />
      </Box>

      {/* Link insertion modal */}
      <Modal isOpen={isLinkModalOpen} onClose={onLinkModalClose} size="md">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Insert Link</ModalHeader>
          <ModalBody>
            <VStack spacing={4}>
              <Input
                placeholder="https://example.com"
                value={linkData.url}
                onChange={(e) =>
                  setLinkData({ ...linkData, url: e.target.value })
                }
                type="url"
              />
              <Input
                placeholder="Link text (optional)"
                value={linkData.text}
                onChange={(e) =>
                  setLinkData({ ...linkData, text: e.target.value })
                }
              />
            </VStack>
          </ModalBody>
          <ModalFooter>
            <HStack>
              {editor?.isActive("link") && (
                <Button colorScheme="red" variant="ghost" onClick={removeLink}>
                  Remove Link
                </Button>
              )}
              <Button variant="ghost" onClick={onLinkModalClose}>
                Cancel
              </Button>
              <Button
                colorScheme="blue"
                onClick={confirmLinkInsertion}
                isDisabled={!linkData.url}
              >
                Insert Link
              </Button>
            </HStack>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Table insertion modal */}
      <Modal isOpen={isTableModalOpen} onClose={onTableModalClose} size="sm">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Insert Table</ModalHeader>
          <ModalBody>
            <VStack spacing={4}>
              <HStack spacing={4} w="full">
                <VStack spacing={2} align="start" flex={1}>
                  <Text fontSize="sm">Rows:</Text>
                  <NumberInput
                    value={tableData.rows}
                    onChange={(_, value) =>
                      setTableData({ ...tableData, rows: value })
                    }
                    min={1}
                    max={10}
                  >
                    <NumberInputField />
                    <NumberInputStepper>
                      <NumberIncrementStepper />
                      <NumberDecrementStepper />
                    </NumberInputStepper>
                  </NumberInput>
                </VStack>
                <VStack spacing={2} align="start" flex={1}>
                  <Text fontSize="sm">Columns:</Text>
                  <NumberInput
                    value={tableData.cols}
                    onChange={(_, value) =>
                      setTableData({ ...tableData, cols: value })
                    }
                    min={1}
                    max={10}
                  >
                    <NumberInputField />
                    <NumberInputStepper>
                      <NumberIncrementStepper />
                      <NumberDecrementStepper />
                    </NumberInputStepper>
                  </NumberInput>
                </VStack>
              </HStack>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <HStack>
              <Button variant="ghost" onClick={onTableModalClose}>
                Cancel
              </Button>
              <Button colorScheme="blue" onClick={handleInsertTable}>
                Insert Table
              </Button>
            </HStack>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}
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
import CharacterCount from "@tiptap/extension-character-count";
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
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Badge,
  Flex,
  useColorModeValue,
  Divider,
  useBreakpointValue,
} from "@chakra-ui/react";

import { useEffect, useState, useRef, useCallback } from "react";
import { uploadToCloudinary } from "@/lib/cloudinary";

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
  FaSave,
} from "react-icons/fa";

interface RichTextEditorProps {
  value: string | JSONContent | null;
  onChange: (val: JSONContent) => void;
  placeholder?: string;
  autoFocus?: boolean;
  minHeight?: string;
  maxHeight?: string;
  readOnly?: boolean;
}

export default function RichTextEditor({
  value,
  onChange,
  placeholder = "Start writing your content...",
  autoFocus = false,
  minHeight = "400px",
  maxHeight = "none",
  readOnly = false,
}: RichTextEditorProps) {
  const [mounted, setMounted] = useState(false);
  const [textColor, setTextColor] = useState("#000000");
  const [highlightColor, setHighlightColor] = useState("#FFEB3B");
  const [imageSize, setImageSize] = useState(100);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [wordCount, setWordCount] = useState(0);
  const { isOpen: isLinkModalOpen, onOpen: onLinkModalOpen, onClose: onLinkModalClose } = useDisclosure();
  const [linkData, setLinkData] = useState<{ url: string; text?: string }>({ url: "", text: "" });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const toast = useToast();

  // Chakra UI color values for consistent theming
  const bgCard = useColorModeValue("white", "gray.800");
  const bgToolbar = useColorModeValue("gray.50", "gray.700");
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const focusBorderColor = useColorModeValue("blue.500", "blue.300");
  const textPrimary = useColorModeValue("gray.900", "white");
  const textSecondary = useColorModeValue("gray.600", "gray.400");
  const hoverBg = useColorModeValue("gray.100", "gray.600");
  const activeBg = useColorModeValue("blue.50", "blue.900");
  const activeColor = useColorModeValue("blue.600", "blue.300");

  // Responsive toolbar
  const toolbarDirection = useBreakpointValue<"row" | "column">({ base: "column", md: "row" });
  const toolbarSpacing = useBreakpointValue({ base: 2, md: 1 });

  // Custom Image extension with enhanced attributes
  const CustomImage = Image.extend({
    addAttributes() {
      return {
        ...this.parent?.(),
        class: {
          default: null,
          parseHTML: (el: any) => el.getAttribute("class"),
          renderHTML: (attrs: any) => (attrs.class ? { class: attrs.class } : {}),
        },
        style: {
          default: null,
          parseHTML: (el: any) => el.getAttribute("style"),
          renderHTML: (attrs: any) => (attrs.style ? { style: attrs.style } : {}),
        },
        "data-uploading": {
          default: null,
          parseHTML: (el: any) => el.getAttribute("data-uploading"),
          renderHTML: (attrs: any) => (attrs["data-uploading"] ? { "data-uploading": attrs["data-uploading"] } : {}),
        },
        "data-id": {
          default: null,
          parseHTML: (el: any) => el.getAttribute("data-id"),
          renderHTML: (attrs: any) => (attrs["data-id"] ? { "data-id": attrs["data-id"] } : {}),
        },
      };
    },
  });

  // Editor configuration
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] as const },
        codeBlock: {
          HTMLAttributes: {
            class: "font-mono bg-gray-100 dark:bg-gray-800 p-4 rounded border border-gray-300 dark:border-gray-600 my-4",
          },
        },
        blockquote: {
          HTMLAttributes: {
            class: "border-l-4 border-blue-500 pl-4 italic bg-blue-50 dark:bg-blue-900/20 py-2 my-4",
          },
        },
      }),
      Dropcursor.configure({ width: 2, color: "#3B82F6" }),
      Gapcursor,
      BulletList.configure({
        HTMLAttributes: { class: "list-disc pl-6 my-4 space-y-2" },
      }),
      OrderedList.configure({
        HTMLAttributes: { class: "list-decimal pl-6 my-4 space-y-2" },
      }),
      ListItem.configure({ HTMLAttributes: { class: "leading-relaxed" } }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-blue-600 dark:text-blue-400 underline hover:text-blue-800 dark:hover:text-blue-300 transition-colors",
          target: "_blank",
          rel: "noopener noreferrer",
        },
      }),
      CustomImage.configure({
        HTMLAttributes: {
          class: "rich-text-image rounded-lg shadow-md mx-auto my-4 transition-all duration-200 cursor-pointer",
          draggable: false,
        },
      }),
      Table.configure({ resizable: true }),
      TableRow,
      TableHeader,
      TableCell,
      TextAlign.configure({ 
        types: ["heading", "paragraph", "image"], 
        alignments: ["left", "center", "right", "justify"] 
      }),
      Underline,
      Highlight.configure({ multicolor: true }),
      Color.configure({ types: ["textStyle"] }),
      TextStyle,
      Typography,
      TaskList,
      TaskItem.configure({ nested: true }),
      Focus.configure({ 
        mode: "deepest", 
        className: "has-focus ring-2 ring-blue-500 rounded px-1" 
      }),
      CharacterCount,
      Placeholder.configure({ placeholder }),
    ],
    content: value || { type: "doc", content: [{ type: "paragraph" }] },
    editorProps: {
      attributes: {
        class: `prose prose-lg max-w-none outline-none p-6 rounded-md focus:outline-none bg-white dark:bg-gray-800 ${
          isFullscreen ? "min-h-screen" : "min-h-[400px]"
        } dark:prose-invert prose-headings:font-bold prose-p:leading-relaxed`,
        spellCheck: "true",
        autoCorrect: "on",
        autoCapitalize: "on",
        "data-gramm": "false",
      },
      handlePaste: (view, event) => {
        const html = event.clipboardData?.getData("text/html");
        const text = event.clipboardData?.getData("text/plain");

        if (html) {
          event.preventDefault();
          const tmp = document.createElement("div");
          tmp.innerHTML = html;
          tmp.querySelectorAll("*").forEach((el) => {
            (el as HTMLElement).removeAttribute("style");
            (el as HTMLElement).removeAttribute("class");
            (el as HTMLElement).removeAttribute("id");
          });
          const cleanedText = tmp.textContent || "";
          view.dispatch(view.state.tr.insertText(cleanedText, view.state.selection.from, view.state.selection.to));
          return true;
        }

        if (text) {
          event.preventDefault();
          view.dispatch(view.state.tr.insertText(text, view.state.selection.from, view.state.selection.to));
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
      const text = editor.getText();
      setWordCount(text.trim() ? text.trim().split(/\s+/).length : 0);
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
        editor.commands.setContent(value || { type: "doc", content: [{ type: "paragraph" }] }, { 
          emitUpdate: false 
        } as any);
      } catch {
        editor.commands.setContent(value || { type: "doc", content: [{ type: "paragraph" }] });
      }
    }
  }, [editor, mounted, value]);

  // Image upload handler
  const handleImageUpload = useCallback(async (file: File): Promise<void> => {
    if (!editor) return;
    
    try {
      const placeholderId = `ph-${Date.now()}`;

      // Insert placeholder
      (editor.chain().focus() as any).setImage({
        src: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='200'%3E%3Crect width='100%25' height='100%25' fill='%23f3f4f6'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='Arial' font-size='14' fill='%236b7280'%3EUploading...%3C/text%3E%3C/svg%3E",
        "data-uploading": "true",
        "data-id": placeholderId,
        class: `rounded-lg border-2 border-dashed border-gray-300 mx-auto my-4 max-w-[${imageSize}%] h-auto opacity-60`,
      } as any).run();

      const url = await uploadToCloudinary(file, "images");
      if (!url) throw new Error("Upload failed");

      // Replace placeholder
      const tr = editor.state.tr;
      editor.state.doc.descendants((node, pos) => {
        if (node.type.name === "image" && node.attrs["data-id"] === placeholderId) {
          const newAttrs = {
            ...node.attrs,
            src: url,
            "data-uploading": null,
            "data-id": null,
            class: `rounded-lg shadow-md mx-auto my-4 max-w-[${imageSize}%] h-auto transition-all duration-200 hover:shadow-lg`,
          };
          tr.setNodeMarkup(pos, undefined, newAttrs);
        }
      });
      editor.view.dispatch(tr);

      toast({
        title: "Image uploaded successfully",
        status: "success",
        duration: 2000,
        isClosable: true,
      });
    } catch (err) {
      console.error("Upload error", err);
      // Remove failed upload placeholders
      const tr = editor.state.tr;
      editor.state.doc.descendants((node, pos) => {
        if (node.type.name === "image" && node.attrs["data-uploading"] === "true") {
          tr.delete(pos, pos + node.nodeSize);
        }
      });
      editor.view.dispatch(tr);

      toast({
        title: "Upload failed",
        description: "Please try again with a smaller image or different format.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  }, [editor, imageSize, toast]);

  // Helper functions
  const triggerImageUpload = () => fileInputRef.current?.click();
  
  const handleImageSizeChange = useCallback((size: number) => {
    setImageSize(size);
    if (!editor) return;
    const tr = editor.state.tr;
    editor.state.doc.descendants((node, pos) => {
      if (node.type.name === "image") {
        tr.setNodeMarkup(pos, undefined, { 
          ...node.attrs, 
          class: `rounded-lg shadow-md mx-auto my-4 max-w-[${size}%] h-auto` 
        });
      }
    });
    editor.view.dispatch(tr);
  }, [editor]);

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
      editor.chain().focus().insertContent(linkData.text).setLink({ href: linkData.url }).run();
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

  const clearFormatting = () => editor?.chain().focus().clearNodes().unsetAllMarks().run();
  
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

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && editor && !readOnly) {
        switch (e.key.toLowerCase()) {
          case 'b':
            e.preventDefault();
            editor.chain().focus().toggleBold().run();
            break;
          case 'i':
            e.preventDefault();
            editor.chain().focus().toggleItalic().run();
            break;
          case 'k':
            e.preventDefault();
            handleInsertLink();
            break;
          case 'z':
            e.preventDefault();
            if (e.shiftKey) editor.chain().focus().redo().run();
            else editor.chain().focus().undo().run();
            break;
          case 's':
            e.preventDefault();
            copyAsHTML();
            break;
        }
      }
    };
    
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [editor, readOnly]);

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
        <Text color="red.600">Failed to load editor. Please refresh the page.</Text>
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

      {/* Header with stats and actions */}
      <VStack spacing={3} align="stretch" mb={4}>
        <Flex justify="space-between" align="center" wrap="wrap" gap={2}>
          <HStack spacing={2}>
            <Badge colorScheme="blue" variant="subtle">
              {wordCount} words
            </Badge>
            <Badge colorScheme="green" variant="subtle">
              {editor.storage.characterCount?.characters() || 0} chars
            </Badge>
            {readOnly && (
              <Badge colorScheme="gray" variant="subtle">
                Read Only
              </Badge>
            )}
          </HStack>
          
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
            <Tooltip label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}>
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
            <HStack spacing={toolbarSpacing} wrap="wrap" mb={3}>
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

              {/* Text Color */}
              <Popover>
                <PopoverTrigger>
                  <IconButton
                    size="sm"
                    icon={<FaPalette />}
                    aria-label="Text Color"
                    variant="ghost"
                    colorScheme="gray"
                  />
                </PopoverTrigger>
                <Portal>
                  <PopoverContent>
                    <PopoverBody>
                      <VStack spacing={3}>
                        <Text fontSize="sm" fontWeight="medium">Text Color</Text>
                        <Input 
                          type="color" 
                          value={textColor} 
                          onChange={(e) => { 
                            setTextColor(e.target.value); 
                            editor.chain().focus().setColor(e.target.value).run(); 
                          }} 
                        />
                        <Button 
                          size="sm" 
                          onClick={() => { 
                            setTextColor("#000000"); 
                            editor.chain().focus().setColor("#000000").run(); 
                          }}
                          colorScheme="blue"
                          variant="outline"
                        >
                          Reset to Black
                        </Button>
                      </VStack>
                    </PopoverBody>
                  </PopoverContent>
                </Portal>
              </Popover>
            </HStack>

            <Divider my={2} />

            {/* Blocks and lists row */}
            <HStack spacing={toolbarSpacing} wrap="wrap" mb={3}>
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
                      onClick={() => editor.chain().focus().toggleHeading({ level: toHeadingLevel(level) }).run()}
                    >
                      Heading {level}
                    </MenuItem>
                  ))}
                  <MenuItem 
                    icon={<FaCode />} 
                    onClick={() => editor.chain().focus().toggleCodeBlock().run()}
                  >
                    Code Block
                  </MenuItem>
                  <MenuItem 
                    icon={<FaQuoteLeft />} 
                    onClick={() => editor.chain().focus().toggleBlockquote().run()}
                  >
                    Blockquote
                  </MenuItem>
                </MenuList>
              </Menu>

              <Tooltip label="Bullet List">
                <IconButton
                  size="sm"
                  icon={<FaListUl />}
                  onClick={() => editor.chain().focus().toggleBulletList().run()}
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
                  onClick={() => editor.chain().focus().toggleOrderedList().run()}
                  isActive={editor.isActive("orderedList")}
                  aria-label="Numbered List"
                  colorScheme={editor.isActive("orderedList") ? "blue" : "gray"}
                  variant={editor.isActive("orderedList") ? "solid" : "ghost"}
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
            <HStack spacing={toolbarSpacing} wrap="wrap">
              <Tooltip label="Align left">
                <IconButton
                  size="sm"
                  icon={<FaAlignLeft />}
                  onClick={() => editor.chain().focus().setTextAlign("left").run()}
                  aria-label="Align left"
                  variant="ghost"
                  colorScheme="gray"
                />
              </Tooltip>
              
              <Tooltip label="Align center">
                <IconButton
                  size="sm"
                  icon={<FaAlignCenter />}
                  onClick={() => editor.chain().focus().setTextAlign("center").run()}
                  aria-label="Align center"
                  variant="ghost"
                  colorScheme="gray"
                />
              </Tooltip>
              
              <Tooltip label="Align right">
                <IconButton
                  size="sm"
                  icon={<FaAlignRight />}
                  onClick={() => editor.chain().focus().setTextAlign("right").run()}
                  aria-label="Align right"
                  variant="ghost"
                  colorScheme="gray"
                />
              </Tooltip>

              {/* Image upload */}
              <Popover>
                <PopoverTrigger>
                  <IconButton
                    size="sm"
                    icon={<FaImage />}
                    aria-label="Insert image"
                    variant="ghost"
                    colorScheme="gray"
                  />
                </PopoverTrigger>
                <Portal>
                  <PopoverContent>
                    <PopoverBody>
                      <VStack spacing={3}>
                        <Text fontSize="sm" fontWeight="medium">Image Settings</Text>
                        <Text fontSize="sm">Size: {imageSize}%</Text>
                        <Slider 
                          value={imageSize} 
                          onChange={handleImageSizeChange} 
                          min={25} 
                          max={100} 
                          step={5}
                        >
                          <SliderTrack>
                            <SliderFilledTrack />
                          </SliderTrack>
                          <SliderThumb />
                        </Slider>
                        <Button 
                          size="sm" 
                          onClick={triggerImageUpload} 
                          w="full"
                          colorScheme="blue"
                        >
                          Upload Image
                        </Button>
                      </VStack>
                    </PopoverBody>
                  </PopoverContent>
                </Portal>
              </Popover>

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

              <Menu>
                <MenuButton 
                  as={Button} 
                  size="sm" 
                  rightIcon={<FaChevronDown />}
                  variant="ghost"
                  colorScheme="gray"
                >
                  Table
                </MenuButton>
                <MenuList>
                  <MenuItem 
                    icon={<FaTable />} 
                    onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}
                  >
                    Insert Table
                  </MenuItem>
                </MenuList>
              </Menu>
            </HStack>
          </Box>
        )}
      </VStack>

      {/* Editor content area */}
      <Box 
        borderWidth={1} 
        borderRadius="md" 
        minH={minHeight}
        maxH={isFullscreen ? "none" : maxHeight}
        overflow="auto"
        p={4} 
        bg={bgCard}
        borderColor={borderColor}
        _focusWithin={{ 
          borderColor: focusBorderColor, 
          boxShadow: `0 0 0 1px ${focusBorderColor}` 
        }}
        transition="all 0.2s"
        className="rich-text-editor-content"
      >
        <EditorContent editor={editor} />
      </Box>

      {/* Footer with additional stats */}
      <Flex mt={3} justify="space-between" align="center" fontSize="sm" color={textSecondary} wrap="wrap" gap={2}>
        <HStack spacing={4}>
          <Text>{editor.storage.characterCount?.characters() || 0} characters</Text>
          <Text>{wordCount} words</Text>
          <Text>{editor.storage.characterCount?.words() || 0} words (editor)</Text>
        </HStack>
        
        <HStack spacing={2}>
          <Badge 
            variant="subtle" 
            colorScheme="purple" 
            cursor="help"
            title="Use Ctrl+B for bold, Ctrl+I for italic, Ctrl+K for links"
          >
            Keyboard Shortcuts
          </Badge>
        </HStack>
      </Flex>

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
                onChange={(e) => setLinkData({ ...linkData, url: e.target.value })}
                type="url"
              />
              <Input 
                placeholder="Link text (optional)" 
                value={linkData.text}
                onChange={(e) => setLinkData({ ...linkData, text: e.target.value })}
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
    </Box>
  );
}
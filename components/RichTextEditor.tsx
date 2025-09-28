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
import {
  Box,
  Button,
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
  NumberInput,
  NumberInputField,
  FormControl,
  FormLabel,
  Select,
  VStack,
  Text,
  useToast,
  Portal,
} from "@chakra-ui/react";
import { useEffect, useState, useCallback } from "react";
import { VideoUpload, AudioUpload } from "../extensions/media";
import { uploadToCloudinary } from "../lib/cloudinary";

// React Icons imports
import {
  FaBold,
  FaItalic,
  FaUnderline,
  FaLink,
  FaTable,
  FaChevronDown,
  FaImage,
  FaVideo,
  FaMusic,
  FaListUl,
  FaListOl,
  FaAlignLeft,
  FaAlignCenter,
  FaAlignRight,
  FaCode,
  FaQuoteLeft,
  FaPalette,
  FaHighlighter,
  FaStrikethrough,
  FaSuperscript,
  FaSubscript,
  FaRedo,
  FaUndo,
  FaParagraph,
  FaHeading,
} from "react-icons/fa";

type Props = {
  value: string | JSONContent | null;
  onChange: (val: JSONContent) => void;
  placeholder?: string;
};

export default function RichTextEditor({
  value,
  onChange,
  placeholder = "Start typing...",
}: Props) {
  const [tableConfig, setTableConfig] = useState({ rows: 3, cols: 3 });
  const [imageConfig, setImageConfig] = useState({
    alignment: "left" as "left" | "center" | "right",
    width: "100%",
    caption: "",
    customClass: "rounded-lg shadow-md max-w-full h-auto",
  });
  const [textColor, setTextColor] = useState("#000000");
  const [highlightColor, setHighlightColor] = useState("#FFFF00");
  const toast = useToast();

  // HTML to TipTap converter for better paste handling
  const htmlToTipTap = (element: Element): any => {
    if (element.nodeType === Node.TEXT_NODE) {
      return { type: 'text', text: element.textContent };
    }

    const children = Array.from(element.childNodes)
      .map(htmlToTipTap)
      .filter(Boolean);

    switch (element.nodeName.toLowerCase()) {
      case 'p':
        return { type: 'paragraph', content: children };
      case 'h1':
      case 'h2':
      case 'h3':
        return { 
          type: 'heading', 
          attrs: { level: parseInt(element.nodeName.slice(1)) },
          content: children 
        };
      case 'strong':
      case 'b':
        return { type: 'text', marks: [{ type: 'bold' }], text: element.textContent };
      case 'em':
      case 'i':
        return { type: 'text', marks: [{ type: 'italic' }], text: element.textContent };
      case 'u':
        return { type: 'text', marks: [{ type: 'underline' }], text: element.textContent };
      case 'a':
        return { 
          type: 'text', 
          marks: [{ type: 'link', attrs: { href: element.getAttribute('href') } }], 
          text: element.textContent 
        };
      case 'ul':
        return { type: 'bulletList', content: children };
      case 'ol':
        return { type: 'orderedList', content: children };
      case 'li':
        return { type: 'listItem', content: children };
      case 'blockquote':
        return { type: 'blockquote', content: children };
      default:
        return children.length > 0 ? children : null;
    }
  };

  // Stable editor configuration
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
        codeBlock: {
          HTMLAttributes: {
            class: "font-mono bg-gray-100 p-4 rounded",
          },
        },
        blockquote: {
          HTMLAttributes: {
            class: "border-l-4 border-gray-300 pl-4 italic my-4",
          },
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-blue-600 underline cursor-pointer",
          target: "_blank",
          rel: "noopener noreferrer",
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: "max-w-full h-auto rounded",
          draggable: false,
        },
        inline: true,
      }),
      Table.configure({
        resizable: true,
        HTMLAttributes: {
          class: "border-collapse border border-gray-300 min-w-full my-4",
        },
      }),
      TableRow,
      TableHeader.configure({
        HTMLAttributes: {
          class: "bg-gray-100 font-semibold",
        },
      }),
      TableCell.configure({
        HTMLAttributes: {
          class: "border border-gray-300 p-3",
        },
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph', 'image'],
        alignments: ['left', 'center', 'right', 'justify'],
      }),
      Underline.configure({
        HTMLAttributes: {
          class: "underline",
        },
      }),
      Highlight.configure({
        multicolor: true,
      }),
      Color.configure({
        types: ['textStyle'],
      }),
      TextStyle,
      Typography,
      TaskList.configure({
        HTMLAttributes: {
          class: "pl-0 list-none my-2",
        },
      }),
      TaskItem.configure({
        HTMLAttributes: {
          class: "flex items-start my-1",
        },
        nested: true,
      }),
      Focus.configure({
        mode: 'deepest',
        className: 'has-focus',
      }),
      CharacterCount,
      VideoUpload,
      AudioUpload,
      Placeholder.configure({
        placeholder: ({ node }) => {
          if (node.type.name === 'heading') {
            return 'Heading...';
          }
          return placeholder;
        },
      }),
    ],
    editorProps: {
      attributes: {
        class: "prose prose-lg max-w-none outline-none min-h-[300px] p-6 rounded-md prose-headings:font-bold prose-p:my-3 prose-ul:my-3 prose-ol:my-3 prose-blockquote:border-l-4 prose-blockquote:border-gray-300 prose-blockquote:pl-4 prose-blockquote:italic prose-table:min-w-full prose-td:border prose-td:border-gray-300 prose-td:p-3 prose-th:bg-gray-100 prose-th:font-semibold prose-th:p-3 prose-img:rounded-lg prose-img:shadow-md prose-a:text-blue-600 prose-code:bg-gray-100 prose-code:rounded prose-code:px-2 prose-code:py-1 prose-pre:bg-gray-900 prose-pre:text-white prose-pre:p-4 prose-pre:rounded",
        spellCheck: "true",
        autoCorrect: "on",
        autoCapitalize: "on",
      },
      handleKeyDown: (view, event) => {
        // Better keyboard navigation
        if (event.key === 'Tab') {
          event.preventDefault();
          if (event.shiftKey) {
            return view.dispatch(view.state.tr.deleteSelection());
          }
          const { state, dispatch } = view;
          const { tr } = state;
          tr.insertText('  ');
          dispatch(tr);
          return true;
        }
        
        // Better enter key behavior
        if (event.key === 'Enter' && !event.shiftKey) {
          const { state, dispatch } = view;
          const { $from, $to } = state.selection;
          
          // If selection is empty and at end of block, create new paragraph
          if ($from.pos === $to.pos && $from.parentOffset === $from.parent.content.size) {
            event.preventDefault();
            const tr = state.tr.insert($from.pos, state.schema.nodes.paragraph.create());
            dispatch(tr);
            return true;
          }
        }
        return false;
      },
      handlePaste: (view, event) => {
        // Enhanced paste handling for Google Docs content
        const html = event.clipboardData?.getData('text/html');
        if (html) {
          // Basic cleanup of Google Docs HTML
          const cleanedHtml = html
            .replace(/<o:p>.*?<\/o:p>/g, '') // Remove Office namespace
            .replace(/<span[^>]*>(.*?)<\/span>/g, '$1') // Remove unnecessary spans
            .replace(/<meta[^>]*>/g, '') // Remove meta tags
            .replace(/<style[^>]*>.*?<\/style>/g, '') // Remove styles
            .replace(/class="[^"]*"/g, '') // Remove classes
            .replace(/\s+/g, ' ') // Normalize whitespace
            .trim();

          // Parse HTML and insert as structured content
          const parser = new DOMParser();
          const doc = parser.parseFromString(cleanedHtml, 'text/html');
          
          // Convert to TipTap content
          const content = htmlToTipTap(doc.body);
          if (content) {
            event.preventDefault();
            view.dispatch(view.state.tr.replaceSelectionWith(content));
            return true;
          }
        }
        return false;
      },
      transformPastedHTML(html) {
        // Additional HTML cleanup
        return html
          .replace(/<br\s*\/?>/gi, '\n')
          .replace(/<div[^>]*>/gi, '<p>')
          .replace(/<\/div>/gi, '</p>')
          .replace(/<p><\/p>/gi, '')
          .replace(/\n{3,}/gi, '\n\n');
      },
    },
    content: value || "",
    immediatelyRender: true,
    enableInputRules: true,
    enablePasteRules: true,
    autofocus: false,
    editable: true,
  });

  // Stable content loading - FIXED: Use proper options object instead of false
  useEffect(() => {
    if (!editor || !value) return;

    // Only update if content is actually different
    const currentContent = JSON.stringify(editor.getJSON());
    const newContent = JSON.stringify(value);
    
    if (currentContent !== newContent) {
      try {
        editor.commands.setContent(value, { 
          emitUpdate: false,
          errorOnInvalidContent: false 
        });
      } catch (error) {
        console.error('Error setting content:', error);
      }
    }
  }, [editor, value]);

  // Stable change handler
  const handleChange = useCallback(() => {
    if (!editor) return;
    onChange(editor.getJSON());
  }, [editor, onChange]);

  useEffect(() => {
    if (!editor) return;

    editor.on('update', handleChange);
    editor.on('selectionUpdate', handleChange);

    return () => {
      editor.off('update', handleChange);
      editor.off('selectionUpdate', handleChange);
    };
  }, [editor, handleChange]);

  // Custom image upload handler - FIXED: Use proper image attributes
  const handleImageUploadWithConfig = async (file: File) => {
    if (!editor) return;

    try {
      const imageUrl = await uploadToCloudinary(file, "images");
      if (!imageUrl) throw new Error("Upload failed");

      // Build proper image attributes
      const imageAttributes = {
        src: imageUrl,
        alt: imageConfig.caption || file.name,
        title: imageConfig.caption || file.name,
        "data-alignment": imageConfig.alignment,
      };

      editor.chain().focus().setImage(imageAttributes).run();

      // Apply classes via updateAttributes after insertion
      setTimeout(() => {
        if (editor.isActive('image')) {
          const alignmentClass = `float-${imageConfig.alignment} mx-2`;
          const customClasses = [
            alignmentClass,
            imageConfig.customClass,
            "transition-all duration-300",
          ].filter(Boolean).join(" ");

          editor.chain().focus().updateAttributes('image', {
            class: customClasses,
          }).run();
        }
      }, 100);

      toast({
        title: "Image uploaded successfully",
        status: "success",
        duration: 2000,
      });
    } catch (error) {
      console.error("Image upload failed:", error);
      toast({
        title: "Upload failed",
        status: "error",
        duration: 3000,
      });
    }
  };

  // Enhanced media upload handler
  const handleMediaUpload = (type: "image" | "video" | "audio") => {
    if (!editor) return;

    const input = document.createElement("input");
    input.type = "file";
    input.accept = `${type}/*`;
    input.multiple = type === "image";

    input.onchange = async (e: Event) => {
      const files = Array.from((e.target as HTMLInputElement).files || []);
      if (!files.length) return;

      for (const file of files) {
        try {
          switch (type) {
            case "image":
              await handleImageUploadWithConfig(file);
              break;
            case "video":
            case "audio":
              // Handle other media types
              break;
          }
        } catch (error) {
          console.error(`Error uploading ${type}:`, error);
        }
      }
    };
    input.click();
  };

  // Table operations
  const handleInsertTable = () => {
    editor?.chain().focus().insertTable({
      rows: tableConfig.rows,
      cols: tableConfig.cols,
      withHeaderRow: true,
    }).run();
  };

  const handleAddColumn = () => editor?.chain().focus().addColumnAfter().run();
  const handleAddRow = () => editor?.chain().focus().addRowAfter().run();
  const handleDeleteTable = () => editor?.chain().focus().deleteTable().run();

  // Text formatting handlers
  const setTextColorHandler = (color: string) => {
    setTextColor(color);
    editor?.chain().focus().setColor(color).run();
  };

  const setHighlightColorHandler = (color: string) => {
    setHighlightColor(color);
    editor?.chain().focus().setHighlight({ color }).run();
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!editor || !e.ctrlKey) return;

      switch (e.key) {
        case 'b':
          e.preventDefault();
          editor.chain().focus().toggleBold().run();
          break;
        case 'i':
          e.preventDefault();
          editor.chain().focus().toggleItalic().run();
          break;
        case 'u':
          e.preventDefault();
          editor.chain().focus().toggleUnderline().run();
          break;
        case 'z':
          e.preventDefault();
          if (e.shiftKey) {
            editor.chain().focus().redo().run();
          } else {
            editor.chain().focus().undo().run();
          }
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [editor]);

  if (!editor) {
    return (
      <Box borderWidth={1} borderRadius="md" p={4} minH="300px" bg="gray.50">
        <Text>Loading editor...</Text>
      </Box>
    );
  }

  return (
    <Box borderWidth={1} borderRadius="md" p={4} w="100%">
      {/* Enhanced Toolbar */}
      <VStack spacing={3} align="stretch" mb={4}>
        {/* Row 1: Basic formatting */}
        <HStack spacing={1} wrap="wrap">
          <Tooltip label="Bold (Ctrl+B)">
            <IconButton
              aria-label="Bold"
              size="sm"
              icon={<FaBold />}
              onClick={() => editor.chain().focus().toggleBold().run()}
              isActive={editor.isActive("bold")}
              colorScheme={editor.isActive("bold") ? "blue" : "gray"}
            />
          </Tooltip>

          <Tooltip label="Italic (Ctrl+I)">
            <IconButton
              aria-label="Italic"
              size="sm"
              icon={<FaItalic />}
              onClick={() => editor.chain().focus().toggleItalic().run()}
              isActive={editor.isActive("italic")}
              colorScheme={editor.isActive("italic") ? "blue" : "gray"}
            />
          </Tooltip>

          <Tooltip label="Underline (Ctrl+U)">
            <IconButton
              aria-label="Underline"
              size="sm"
              icon={<FaUnderline />}
              onClick={() => editor.chain().focus().toggleUnderline().run()}
              isActive={editor.isActive("underline")}
              colorScheme={editor.isActive("underline") ? "blue" : "gray"}
            />
          </Tooltip>

          <Tooltip label="Strikethrough">
            <IconButton
              aria-label="Strikethrough"
              size="sm"
              icon={<FaStrikethrough />}
              onClick={() => editor.chain().focus().toggleStrike().run()}
              isActive={editor.isActive("strike")}
              colorScheme={editor.isActive("strike") ? "blue" : "gray"}
            />
          </Tooltip>

          <Tooltip label="Highlight">
            <Popover>
              <PopoverTrigger>
                <IconButton
                  aria-label="Highlight"
                  size="sm"
                  icon={<FaHighlighter />}
                  isActive={editor.isActive("highlight")}
                  colorScheme={editor.isActive("highlight") ? "blue" : "gray"}
                />
              </PopoverTrigger>
              <Portal>
                <PopoverContent>
                  <PopoverBody>
                    <VStack>
                      <Input
                        type="color"
                        value={highlightColor}
                        onChange={(e) => setHighlightColorHandler(e.target.value)}
                      />
                      <Button size="sm" onClick={() => editor.chain().focus().toggleHighlight().run()}>
                        Toggle Highlight
                      </Button>
                    </VStack>
                  </PopoverBody>
                </PopoverContent>
              </Portal>
            </Popover>
          </Tooltip>

          <Tooltip label="Text Color">
            <Popover>
              <PopoverTrigger>
                <IconButton 
                  aria-label="Text Color"
                  size="sm" 
                  icon={<FaPalette />} 
                />
              </PopoverTrigger>
              <Portal>
                <PopoverContent>
                  <PopoverBody>
                    <Input
                      type="color"
                      value={textColor}
                      onChange={(e) => setTextColorHandler(e.target.value)}
                    />
                  </PopoverBody>
                </PopoverContent>
              </Portal>
            </Popover>
          </Tooltip>
        </HStack>

        {/* Row 2: Alignment and lists */}
        <HStack spacing={1} wrap="wrap">
          <Menu>
            <MenuButton as={Button} size="sm" rightIcon={<FaChevronDown />}>
              Format
            </MenuButton>
            <MenuList>
              <MenuItem icon={<FaParagraph />} onClick={() => editor.chain().focus().setParagraph().run()}>
                Paragraph
              </MenuItem>
              <MenuItem icon={<FaHeading />} onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}>
                Heading 1
              </MenuItem>
              <MenuItem icon={<FaHeading />} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>
                Heading 2
              </MenuItem>
              <MenuItem icon={<FaHeading />} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}>
                Heading 3
              </MenuItem>
              <MenuItem icon={<FaCode />} onClick={() => editor.chain().focus().toggleCodeBlock().run()}>
                Code Block
              </MenuItem>
              <MenuItem icon={<FaQuoteLeft />} onClick={() => editor.chain().focus().toggleBlockquote().run()}>
                Blockquote
              </MenuItem>
            </MenuList>
          </Menu>

          <Tooltip label="Bullet List">
            <IconButton
              aria-label="Bullet List"
              size="sm"
              icon={<FaListUl />}
              onClick={() => editor.chain().focus().toggleBulletList().run()}
              isActive={editor.isActive("bulletList")}
              colorScheme={editor.isActive("bulletList") ? "blue" : "gray"}
            />
          </Tooltip>

          <Tooltip label="Numbered List">
            <IconButton
              aria-label="Numbered List"
              size="sm"
              icon={<FaListOl />}
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
              isActive={editor.isActive("orderedList")}
              colorScheme={editor.isActive("orderedList") ? "blue" : "gray"}
            />
          </Tooltip>

          <Tooltip label="Align Left">
            <IconButton
              aria-label="Align Left"
              size="sm"
              icon={<FaAlignLeft />}
              onClick={() => editor.chain().focus().setTextAlign('left').run()}
              isActive={editor.isActive({ textAlign: 'left' })}
              colorScheme={editor.isActive({ textAlign: 'left' }) ? "blue" : "gray"}
            />
          </Tooltip>

          <Tooltip label="Align Center">
            <IconButton
              aria-label="Align Center"
              size="sm"
              icon={<FaAlignCenter />}
              onClick={() => editor.chain().focus().setTextAlign('center').run()}
              isActive={editor.isActive({ textAlign: 'center' })}
              colorScheme={editor.isActive({ textAlign: 'center' }) ? "blue" : "gray"}
            />
          </Tooltip>

          <Tooltip label="Align Right">
            <IconButton
              aria-label="Align Right"
              size="sm"
              icon={<FaAlignRight />}
              onClick={() => editor.chain().focus().setTextAlign('right').run()}
              isActive={editor.isActive({ textAlign: 'right' })}
              colorScheme={editor.isActive({ textAlign: 'right' }) ? "blue" : "gray"}
            />
          </Tooltip>

          <Tooltip label="Undo (Ctrl+Z)">
            <IconButton
              aria-label="Undo"
              size="sm"
              icon={<FaUndo />}
              onClick={() => editor.chain().focus().undo().run()}
              isDisabled={!editor.can().undo()}
            />
          </Tooltip>

          <Tooltip label="Redo (Ctrl+Shift+Z)">
            <IconButton
              aria-label="Redo"
              size="sm"
              icon={<FaRedo />}
              onClick={() => editor.chain().focus().redo().run()}
              isDisabled={!editor.can().redo()}
            />
          </Tooltip>
        </HStack>

        {/* Row 3: Media and tables */}
        <HStack spacing={1} wrap="wrap">
          <Menu>
            <MenuButton as={Button} size="sm" rightIcon={<FaChevronDown />}>
              Insert
            </MenuButton>
            <MenuList>
              <MenuItem icon={<FaImage />} onClick={() => handleMediaUpload("image")}>
                Image
              </MenuItem>
              <MenuItem icon={<FaVideo />} onClick={() => handleMediaUpload("video")}>
                Video
              </MenuItem>
              <MenuItem icon={<FaMusic />} onClick={() => handleMediaUpload("audio")}>
                Audio
              </MenuItem>
              <MenuItem icon={<FaTable />} onClick={handleInsertTable}>
                Table
              </MenuItem>
              <MenuItem icon={<FaLink />} onClick={() => {
                const url = prompt("Enter URL");
                if (url) editor.chain().focus().setLink({ href: url }).run();
              }}>
                Link
              </MenuItem>
            </MenuList>
          </Menu>
        </HStack>
      </VStack>

      {/* Editor Area */}
      <Box
        borderWidth={1}
        borderRadius="md"
        minH="400px"
        p={4}
        _focusWithin={{ borderColor: "blue.500", shadow: "md" }}
        bg="white"
        transition="all 0.2s"
      >
        <EditorContent editor={editor} />
      </Box>

      {/* Character count */}
      <Box mt={2} textAlign="right" color="gray.600" fontSize="sm">
        {editor.storage.characterCount?.characters()} characters
      </Box>
    </Box>
  );
}
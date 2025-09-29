// components/RichTextView.tsx
"use client";

import { useEditor, EditorContent, JSONContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import { Table } from "@tiptap/extension-table";
import TableRow from "@tiptap/extension-table-row";
import TableCell from "@tiptap/extension-table-cell";
import TableHeader from "@tiptap/extension-table-header";
import TextAlign from "@tiptap/extension-text-align";
import Underline from "@tiptap/extension-underline";
import Highlight from "@tiptap/extension-highlight";
import Color from "@tiptap/extension-color";
import { TextStyle } from "@tiptap/extension-text-style";
import Typography from "@tiptap/extension-typography";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import BulletList from "@tiptap/extension-bullet-list";
import OrderedList from "@tiptap/extension-ordered-list";
import ListItem from "@tiptap/extension-list-item";

import { Box } from "@chakra-ui/react";
import { useEffect, useRef } from "react";

interface RichTextViewProps {
  content: JSONContent | string | null;
  className?: string;
  maxHeight?: string;
  showBorder?: boolean;
  backgroundColor?: string;
}

export function RichTextView({
  content,
  className = "",
  maxHeight,
  showBorder = true,
  backgroundColor = "transparent",
}: RichTextViewProps) {
  const editorContainerRef = useRef<HTMLDivElement>(null);
  
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { 
          levels: [1, 2, 3] as const
        },
        codeBlock: {
          HTMLAttributes: {
            class: "font-mono bg-gray-100 p-4 rounded border border-gray-300 my-4 text-sm",
          },
        },
        blockquote: {
          HTMLAttributes: {
            class: "border-l-4 border-blue-500 pl-4 italic bg-blue-50 py-2 my-4 text-gray-700",
          },
        },
        bulletList: false,
        orderedList: false,
        listItem: false,
      }),
      BulletList.configure({
        HTMLAttributes: {
          class: "list-disc pl-6 my-4 space-y-2 text-gray-700",
        },
      }),
      OrderedList.configure({
        HTMLAttributes: {
          class: "list-decimal pl-6 my-4 space-y-2 text-gray-700",
        },
      }),
      ListItem.configure({
        HTMLAttributes: {
          class: "leading-relaxed",
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-blue-600 underline hover:text-blue-800 transition-colors duration-200",
          target: "_blank",
          rel: "noopener noreferrer",
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: "rounded-lg shadow-md mx-auto my-4 transition-all duration-200 hover:shadow-lg",
          draggable: false,
          loading: "lazy",
        },
      }),
      Table.configure({
        resizable: false,
        HTMLAttributes: {
          class: "border-collapse border border-gray-300 min-w-full my-6 bg-white shadow-sm rounded-lg overflow-hidden",
        },
      }),
      TableRow.configure({
        HTMLAttributes: {
          class: "hover:bg-gray-50 transition-colors",
        },
      }),
      TableHeader.configure({
        HTMLAttributes: {
          class: "bg-blue-50 font-semibold text-gray-800 border-b-2 border-blue-200",
        },
      }),
      TableCell.configure({
        HTMLAttributes: {
          class: "border border-gray-200 p-4 text-gray-700",
        },
      }),
      TextAlign.configure({
        types: ["heading", "paragraph", "image"],
        alignments: ["left", "center", "right", "justify"],
      }),
      Underline.configure({
        HTMLAttributes: {
          class: "underline",
        },
      }),
      Highlight.configure({
        multicolor: true,
        HTMLAttributes: {
          class: "bg-yellow-200 px-1 rounded",
        },
      }),
      Color.configure({
        types: ["textStyle"]
      }),
      TextStyle,
      Typography,
      TaskList.configure({
        HTMLAttributes: {
          class: "pl-0 list-none my-4 space-y-2",
        },
      }),
      TaskItem.configure({
        nested: true,
        HTMLAttributes: {
          class: "flex items-start my-1",
        },
      }),
    ],
    editorProps: {
      attributes: {
        class:
          "prose prose-lg max-w-none focus:outline-none p-6 rounded-md bg-transparent " +
          // Headings
          "prose-h1:font-bold prose-h1:text-3xl prose-h1:text-gray-900 prose-h1:mt-8 prose-h1:mb-4 " +
          "prose-h2:font-bold prose-h2:text-2xl prose-h2:text-gray-900 prose-h2:mt-6 prose-h2:mb-3 " +
          "prose-h3:font-semibold prose-h3:text-xl prose-h3:text-gray-900 prose-h3:mt-4 prose-h3:mb-2 " +
          // Paragraphs
          "prose-p:my-3 prose-p:text-gray-700 prose-p:leading-relaxed " +
          // Lists
          "prose-ul:my-4 prose-ol:my-4 prose-li:my-1 prose-li:text-gray-700 " +
          // Blockquotes
          "prose-blockquote:border-l-4 prose-blockquote:border-blue-500 prose-blockquote:pl-4 prose-blockquote:italic prose-blockquote:bg-blue-50 prose-blockquote:py-2 prose-blockquote:text-gray-700 " +
          // Tables
          "prose-table:min-w-full prose-table:my-6 prose-table:bg-white prose-table:shadow-sm prose-table:rounded-lg prose-table:overflow-hidden " +
          "prose-td:border prose-td:border-gray-200 prose-td:p-4 prose-td:text-gray-700 " +
          "prose-th:bg-blue-50 prose-th:font-semibold prose-th:p-4 prose-th:text-gray-800 prose-th:border prose-th:border-gray-200 " +
          // Images
          "prose-img:rounded-lg prose-img:shadow-md prose-img:my-4 prose-img:mx-auto prose-img:max-w-full prose-img:h-auto " +
          // Links
          "prose-a:text-blue-600 prose-a:no-underline hover:prose-a:text-blue-800 hover:prose-a:underline prose-a:transition-colors prose-a:duration-200 " +
          // Text formatting
          "prose-strong:text-gray-800 prose-strong:font-bold " +
          "prose-em:italic prose-em:text-gray-700 " +
          // Code
          "prose-code:bg-gray-100 prose-code:rounded prose-code:px-1 prose-code:py-0.5 prose-code:text-gray-800 prose-code:font-mono prose-code:text-sm " +
          "prose-pre:bg-gray-900 prose-pre:text-gray-100 prose-pre:rounded-lg prose-pre:p-4 prose-pre:overflow-x-auto prose-pre:my-4 " +
          // Horizontal rules
          "prose-hr:border-gray-300 prose-hr:my-8 " +
          // Task lists
          "prose-ul:list-disc prose-ol:list-decimal",
      },
    },
    content: "",
    editable: false,
    immediatelyRender: false,
  });

  // Enhanced content loading with better error handling
  useEffect(() => {
    if (!editor) return;

    try {
      const normalizeContent = (raw: any): JSONContent => {
        if (!raw) return { type: "doc", content: [] };

        // Handle string content
        if (typeof raw === "string") {
          try {
            const parsed = JSON.parse(raw);
            return normalizeContent(parsed);
          } catch {
            // If it's plain text, wrap it in a paragraph
            return {
              type: "doc",
              content: [
                {
                  type: "paragraph",
                  content: [{ type: "text", text: raw }],
                },
              ],
            };
          }
        }

        // Handle array content (legacy format)
        if (Array.isArray(raw)) {
          return {
            type: "doc",
            content: raw
          };
        }

        // Handle proper JSONContent
        if (typeof raw === "object" && raw.type === "doc") {
          return raw as JSONContent;
        }

        // Handle single content object
        if (typeof raw === "object" && raw.type) {
          return {
            type: "doc",
            content: [raw]
          };
        }

        // Fallback
        return { type: "doc", content: [] };
      };

      const normalizedContent = normalizeContent(content);
      editor.commands.setContent(normalizedContent, { 
        emitUpdate: false, 
        errorOnInvalidContent: false 
      });

    } catch (error) {
      console.error("Error loading content in RichTextView:", error);
      editor.commands.setContent({
        type: "doc",
        content: [
          { 
            type: "paragraph", 
            content: [{ type: "text", text: "Content could not be loaded." }] 
          }
        ],
      });
    }
  }, [editor, content]);

  // Enhanced image and table styling
  useEffect(() => {
    if (!editor || !editorContainerRef.current) return;

    const applyEnhancedStyles = () => {
      const container = editorContainerRef.current;
      if (!container) return;

      // Style images
      const images = container.querySelectorAll("img");
      images.forEach((img) => {
        // Ensure responsive images
        img.classList.add("max-w-full", "h-auto", "rounded-lg", "shadow-md");
        
        // Handle image alignment from editor
        const alignment = img.style.float || img.getAttribute("data-align");
        if (alignment === "left") {
          img.classList.add("float-left", "mr-4", "mb-4", "mt-2");
        } else if (alignment === "right") {
          img.classList.add("float-right", "ml-4", "mb-4", "mt-2");
        } else {
          img.classList.add("mx-auto", "block");
        }

        // Handle custom image sizes
        const width = img.getAttribute("width") || img.style.width;
        if (width) {
          img.style.maxWidth = width;
          img.style.width = "auto";
        }
      });

      // Style tables for better responsiveness
      const tables = container.querySelectorAll("table");
      tables.forEach((table) => {
        table.classList.add("w-full", "table-auto");
        
        // Ensure table headers have proper styling
        const headers = table.querySelectorAll("th");
        headers.forEach((th) => {
          th.classList.add("text-left", "font-semibold");
        });
      });

      // Style code blocks
      const codeBlocks = container.querySelectorAll("pre");
      codeBlocks.forEach((pre) => {
        pre.classList.add("overflow-x-auto");
      });

      // Clear floats after content
      const contentElements = container.querySelectorAll(".prose > *");
      contentElements.forEach((element) => {
        if (element.querySelector("img[class*='float-']")) {
          element.classList.add("clearfix");
        }
      });
    };

    const observer = new MutationObserver(applyEnhancedStyles);
    observer.observe(editorContainerRef.current, { 
      childList: true, 
      subtree: true, 
      attributes: true,
      attributeFilter: ["class", "style", "src", "width", "height"]
    });

    // Apply styles immediately and after content changes
    const timeoutId = setTimeout(applyEnhancedStyles, 150);
    const resizeObserver = new ResizeObserver(applyEnhancedStyles);
    if (editorContainerRef.current) {
      resizeObserver.observe(editorContainerRef.current);
    }

    return () => {
      observer.disconnect();
      resizeObserver.disconnect();
      clearTimeout(timeoutId);
    };
  }, [editor]);

  if (!editor) {
    return (
      <Box
        ref={editorContainerRef}
        className={`prose max-w-none p-6 rounded-md ${showBorder ? "border border-gray-200" : ""} ${className}`}
        maxHeight={maxHeight}
        overflowY={maxHeight ? "auto" : "visible"}
        bg={backgroundColor}
      >
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
        </div>
      </Box>
    );
  }

  return (
    <Box
      ref={editorContainerRef}
      className={`rich-text-view ${showBorder ? "border border-gray-200" : ""} ${className}`}
      maxHeight={maxHeight}
      overflowY={maxHeight ? "auto" : "visible"}
      bg={backgroundColor}
      sx={{
        // Enhanced image styling
        "& img": {
          maxWidth: "100%",
          height: "auto",
          transition: "all 0.3s ease-in-out",
          display: "block",
        },
        "& img:hover": {
          transform: "scale(1.01)",
          boxShadow: "0 8px 25px rgba(0, 0, 0, 0.15)",
        },
        "& img.float-left": {
          float: "left",
          marginRight: "1rem",
          marginBottom: "1rem",
          marginTop: "0.5rem",
        },
        "& img.float-right": {
          float: "right",
          marginLeft: "1rem",
          marginBottom: "1rem",
          marginTop: "0.5rem",
        },
        "& img.float-center": {
          display: "block",
          marginLeft: "auto",
          marginRight: "auto",
        },
        // Enhanced table styling
        "& table": {
          width: "100% !important",
          tableLayout: "auto",
        },
        "& th, & td": {
          wordWrap: "break-word",
          overflowWrap: "break-word",
        },
        // Clear floats
        "& .clearfix::after": {
          content: '""',
          display: "table",
          clear: "both",
        },
        "& .prose > *": {
          clear: "both",
        },
        // Responsive design
        "& .prose": {
          maxWidth: "none",
        },
        // Mobile responsiveness
        "@media (max-width: 768px)": {
          "& .prose": {
            fontSize: "0.875rem",
            lineHeight: "1.5",
          },
          "& .prose h1": {
            fontSize: "1.5rem",
          },
          "& .prose h2": {
            fontSize: "1.25rem",
          },
          "& .prose h3": {
            fontSize: "1.125rem",
          },
          "& table": {
            fontSize: "0.75rem",
          },
          "& th, & td": {
            padding: "0.5rem",
          },
          "& img.float-left, & img.float-right": {
            float: "none",
            margin: "1rem auto",
            display: "block",
          },
        },
        // Dark mode support
        "& .prose-invert": {
          "& h1, & h2, & h3": {
            color: "white",
          },
          "& p, & li": {
            color: "#d1d5db",
          },
          "& blockquote": {
            backgroundColor: "#374151",
            borderColor: "#60a5fa",
          },
          "& code": {
            backgroundColor: "#4b5563",
            color: "#e5e7eb",
          },
          "& pre": {
            backgroundColor: "#1f2937",
            color: "#f3f4f6",
          },
        },
      }}
    >
      <EditorContent editor={editor} />
    </Box>
  );
}
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
import { ImageUpload, VideoUpload, AudioUpload } from "../extensions/media";
import { Box } from "@chakra-ui/react";
import { useEffect } from "react";

interface RichTextViewProps {
  content: JSONContent | string | null;
  className?: string;
  maxHeight?: string;
  showBorder?: boolean;
}

export function RichTextView({ 
  content, 
  className = "",
  maxHeight,
  showBorder = true 
}: RichTextViewProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Link.configure({
        openOnClick: false, // Disable click in view mode
        HTMLAttributes: {
          class: 'text-blue-500 hover:text-blue-700 underline',
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: 'rounded-lg shadow-md max-w-full h-auto mx-auto',
        },
      }),
      Table.configure({
        resizable: false, // Disable resizing in view mode
        HTMLAttributes: {
          class: 'border-collapse border border-gray-300 min-w-full bg-white',
        },
      }),
      TableRow,
      TableHeader.configure({
        HTMLAttributes: {
          class: 'bg-gray-100 font-semibold',
        },
      }),
      TableCell.configure({
        HTMLAttributes: {
          class: 'border border-gray-300 p-3',
        },
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph', 'image'],
      }),
      Underline,
      ImageUpload,
      VideoUpload,
      AudioUpload,
    ],
    editorProps: {
      attributes: {
        class: "prose prose-lg max-w-none focus:outline-none p-4 rounded-md " +
               "prose-headings:font-bold prose-headings:text-gray-800 " +
               "prose-p:my-3 prose-p:text-gray-700 " +
               "prose-ul:my-3 prose-ol:my-3 " +
               "prose-li:my-1 prose-li:text-gray-700 " +
               "prose-blockquote:border-l-4 prose-blockquote:border-blue-400 " +
               "prose-blockquote:pl-4 prose-blockquote:italic prose-blockquote:bg-gray-50 " +
               "prose-blockquote:py-1 prose-blockquote:text-gray-600 " +
               "prose-table:min-w-full prose-table:my-4 " +
               "prose-td:border prose-td:border-gray-300 prose-td:p-3 prose-td:text-gray-700 " +
               "prose-th:bg-gray-100 prose-th:font-semibold prose-th:p-3 prose-th:text-gray-800 " +
               "prose-th:border prose-th:border-gray-300 " +
               "prose-img:rounded-lg prose-img:shadow-md prose-img:my-4 prose-img:mx-auto " +
               "prose-a:text-blue-500 prose-a:no-underline hover:prose-a:underline " +
               "prose-strong:text-gray-800 prose-strong:font-bold " +
               "prose-em:italic prose-em:text-gray-700 " +
               "prose-code:bg-gray-100 prose-code:rounded prose-code:px-1 prose-code:py-0.5 " +
               "prose-code:text-gray-800 prose-code:font-mono " +
               "prose-pre:bg-gray-900 prose-pre:text-gray-100 prose-pre:rounded-lg " +
               "prose-pre:p-4 prose-pre:overflow-x-auto " +
               "prose-hr:border-gray-300 prose-hr:my-6"
      },
    },
    content: "",
    editable: false,
    immediatelyRender: false,
  });

  // Update content when it changes
  useEffect(() => {
    if (!editor) return;

    try {
      if (typeof content === "string") {
        // Handle HTML string content
        editor.commands.setContent(content, { 
          emitUpdate: false,
          errorOnInvalidContent: false 
        });
      } else if (content && typeof content === "object" && content.type === "doc") {
        // Handle JSON content
        editor.commands.setContent(content, { 
          emitUpdate: false,
          errorOnInvalidContent: false 
        });
      } else if (content === null || content === undefined) {
        // Handle null or undefined content
        editor.commands.clearContent();
      } else {
        // Handle invalid content
        console.warn("Invalid content type provided to RichTextView:", typeof content);
        editor.commands.setContent({
          type: "doc",
          content: [
            {
              type: "paragraph",
              content: [{ type: "text", text: "Content is provided properly." }]
            }
          ]
        }, { emitUpdate: false });
      }
    } catch (error) {
      console.error("Error setting content in RichTextView:", error);
      editor.commands.setContent({
        type: "doc",
        content: [
          {
            type: "paragraph",
            content: [{ type: "text", text: "Error loading content" }]
          }
        ]
      }, { emitUpdate: false });
    }
  }, [editor, content]);

  // Handle custom image attributes from the editor
  useEffect(() => {
    if (!editor) return;

    const updateImageStyles = () => {
      // Add event listeners to images and apply custom styles
      const images = editor.view.dom.querySelectorAll('img');
      images.forEach(img => {
        // Apply custom styles from data attributes
        const alignment = img.getAttribute('data-alignment');
        const customClass = img.getAttribute('data-custom-class');
        const width = img.getAttribute('style') || '';
        
        // Apply alignment classes
        if (alignment) {
          img.classList.add(`float-${alignment}`);
          img.classList.add('mx-2');
          img.classList.add('mb-4');
        }
        
        // Apply custom CSS classes
        if (customClass) {
          customClass.split(' ').forEach(cls => {
            if (cls.trim()) img.classList.add(cls.trim());
          });
        }
        
        // Ensure proper styling
        img.classList.add('rounded-lg', 'shadow-md', 'max-w-full', 'h-auto');
        
        // Set cursor style for linked images
        if (img.parentElement?.tagName === 'A') {
          img.style.cursor = 'pointer';
        }
      });
    };

    // Use MutationObserver to watch for DOM changes
    const observer = new MutationObserver(updateImageStyles);
    
    if (editor.view.dom) {
      observer.observe(editor.view.dom, {
        childList: true,
        subtree: true,
        attributes: true
      });
      
      // Initial styling
      setTimeout(updateImageStyles, 100);
    }

    return () => {
      observer.disconnect();
    };
  }, [editor, content]);

  if (!editor) {
    return (
      <Box 
        className={`prose max-w-none p-4 rounded-md ${showBorder ? 'border border-gray-200' : ''} ${className}`}
        maxHeight={maxHeight}
        overflowY={maxHeight ? "auto" : "visible"}
      >
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-5/6"></div>
        </div>
      </Box>
    );
  }

  return (
    <Box 
      className={`rich-text-view ${showBorder ? 'border border-gray-200' : ''} ${className}`}
      maxHeight={maxHeight}
      overflowY={maxHeight ? "auto" : "visible"}
      sx={{
        // Custom styles for media elements
        '& img': {
          maxWidth: '100%',
          height: 'auto',
          transition: 'all 0.2s ease-in-out',
        },
        '& img:hover': {
          transform: 'scale(1.02)',
        },
        '& video, & audio': {
          maxWidth: '100%',
          borderRadius: '8px',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          margin: '16px 0',
        },
        '& .float-left': {
          float: 'left',
          marginRight: '16px',
          marginBottom: '16px',
          marginTop: '4px',
        },
        '& .float-right': {
          float: 'right',
          marginLeft: '16px',
          marginBottom: '16px',
          marginTop: '4px',
        },
        '& .float-center': {
          display: 'block',
          marginLeft: 'auto',
          marginRight: 'auto',
          marginBottom: '16px',
        },
        // Clear floats after content
        '& .prose > *': {
          clear: 'both'
        },
        '& .prose > p:after': {
          content: '""',
          display: 'table',
          clear: 'both',
        }
      }}
    >
      <EditorContent editor={editor} />
    </Box>
  );
}

// Additional helper component for inline rich text display
export function InlineRichTextView({ content, maxLines }: { 
  content: JSONContent | string | null; 
  maxLines?: number;
}) {
  return (
    <Box
      sx={{
        display: '-webkit-box',
        WebkitLineClamp: maxLines || 'unset',
        WebkitBoxOrient: 'vertical',
        overflow: 'hidden',
        lineHeight: '1.5',
        '& .prose': {
          margin: '0',
          padding: '0',
          '& p': {
            margin: '0'
          },
          '& img': {
            display: 'none' // Hide images in inline view
          },
          '& table': {
            display: 'none' // Hide tables in inline view
          },
          '& video, & audio': {
            display: 'none' // Hide media in inline view
          }
        }
      }}
    >
      <RichTextView 
        content={content} 
        showBorder={false}
        className="inline-view"
      />
    </Box>
  );
}

// Simple text-only version for quick previews
export function TextPreview({ content, maxLength }: {
  content: JSONContent | string | null;
  maxLength?: number;
}) {
  const extractText = (content: JSONContent | string | null): string => {
    if (!content) return '';
    
    if (typeof content === 'string') {
      return content.replace(/<[^>]*>/g, ''); // Strip HTML tags
    }
    
    if (content.type === 'doc' && Array.isArray(content.content)) {
      const extractFromNodes = (nodes: any[]): string => {
        return nodes.map(node => {
          if (node.content) return extractFromNodes(node.content);
          if (node.text) return node.text;
          return '';
        }).join(' ').trim();
      };
      
      let text = extractFromNodes(content.content);
      if (maxLength && text.length > maxLength) {
        text = text.substring(0, maxLength) + '...';
      }
      return text;
    }
    
    return '';
  };

  return (
    <Box 
      className="text-preview"
      title={extractText(content)}
      sx={{
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
      }}
    >
      {extractText(content)}
    </Box>
  );
}
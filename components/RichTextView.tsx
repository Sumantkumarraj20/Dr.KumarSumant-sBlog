// components/RichTextView.tsx
"use client";

import { useMemo, useRef, useEffect, useState } from "react";
import { 
  Box, 
  useColorModeValue,
  Spinner,
  Alert,
  AlertIcon,
  Text,
  VStack
} from "@chakra-ui/react";
import { JSONContent } from "@tiptap/react";

interface RichTextViewProps {
  content: JSONContent | string | null;
  className?: string;
  maxHeight?: string;
  showBorder?: boolean;
  backgroundColor?: string;
  isLoading?: boolean;
  showEmptyState?: boolean;
  emptyStateText?: string;
}

// Enhanced sanitization function with better error handling
const sanitizeContent = (content: JSONContent): JSONContent => {
  if (!content || typeof content !== 'object') {
    return { type: "doc", content: [] };
  }

  try {
    const sanitized: JSONContent = {
      type: content.type || "doc",
      content: Array.isArray(content.content) 
        ? content.content.filter(item => item && typeof item === 'object')
        : [],
    };

    if (content.attrs && typeof content.attrs === 'object') {
      sanitized.attrs = { ...content.attrs };
    }
    
    if (content.marks && Array.isArray(content.marks)) {
      sanitized.marks = content.marks.filter(mark => mark && typeof mark === 'object');
    }
    
    return sanitized;
  } catch (error) {
    console.error("Sanitization error:", error);
    return { type: "doc", content: [] };
  }
};

// Enhanced HTML renderer with complete RichTextEditor compatibility
const renderContentToHTML = (content: JSONContent): string => {
  if (!content) return '';

  const { type, attrs, content: childContent, marks, text } = content;

  // Handle text nodes with all mark types supported by RichTextEditor
  if (type === 'text' && text) {
    let htmlText = text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');

    // Apply marks in reverse order to maintain proper nesting
    if (marks && Array.isArray(marks)) {
      const sortedMarks = [...marks].reverse();
      
      sortedMarks.forEach(mark => {
        if (!mark || typeof mark !== 'object') return;
        
        switch (mark.type) {
          case 'bold':
            htmlText = `<strong class="font-semibold">${htmlText}</strong>`;
            break;
          case 'italic':
            htmlText = `<em class="italic">${htmlText}</em>`;
            break;
          case 'underline':
            htmlText = `<u class="underline">${htmlText}</u>`;
            break;
          case 'strike':
            htmlText = `<s class="line-through">${htmlText}</s>`;
            break;
          case 'link':
            const href = mark.attrs?.href || '#';
            const target = mark.attrs?.target || '_blank';
            const rel = mark.attrs?.rel || 'noopener noreferrer';
            htmlText = `<a href="${href}" target="${target}" rel="${rel}" class="text-blue-600 dark:text-blue-400 underline hover:text-blue-800 dark:hover:text-blue-300 transition-colors">${htmlText}</a>`;
            break;
          case 'highlight':
            const color = mark.attrs?.color || '#FFEB3B';
            htmlText = `<mark style="background-color: ${color}" class="px-1 rounded bg-yellow-200 dark:bg-yellow-600">${htmlText}</mark>`;
            break;
          case 'textStyle':
            if (mark.attrs?.color) {
              htmlText = `<span style="color: ${mark.attrs.color}" class="inline">${htmlText}</span>`;
            }
            break;
          case 'code':
            htmlText = `<code class="bg-gray-100 dark:bg-gray-800 rounded px-1 py-0.5 text-gray-800 dark:text-gray-200 font-mono text-sm">${htmlText}</code>`;
            break;
          default:
            break;
        }
      });
    }
    
    return htmlText;
  }

  // Handle element nodes
  let html = '';
  let childrenHTML = '';

  if (childContent && Array.isArray(childContent)) {
    childrenHTML = childContent
      .map(child => renderContentToHTML(child))
      .filter(Boolean)
      .join('');
  }

  const classAttr = attrs?.class ? ` class="${attrs.class}"` : '';
  const styleAttr = attrs?.style ? ` style="${attrs.style}"` : '';
  const alignAttr = attrs?.textAlign ? ` style="text-align: ${attrs.textAlign}"` : '';
  const idAttr = attrs?.id ? ` id="${attrs.id}"` : '';

  switch (type) {
    case 'doc':
      html = `<div class="prose prose-lg dark:prose-invert max-w-none min-w-0">${childrenHTML}</div>`;
      break;
    
    case 'paragraph':
      html = `<p${classAttr}${alignAttr}${styleAttr}${idAttr} class="leading-relaxed text-gray-700 dark:text-gray-300 my-3">${childrenHTML}</p>`;
      break;
    
    case 'heading':
      const level = Math.min(Math.max(attrs?.level || 1, 1), 6);
      const headingClass = `font-bold text-gray-900 dark:text-white my-4 ${
        level === 1 ? 'text-3xl' : 
        level === 2 ? 'text-2xl' : 
        level === 3 ? 'text-xl' : 
        'text-lg'
      }`;
      html = `<h${level}${classAttr}${alignAttr}${styleAttr}${idAttr} class="${headingClass}">${childrenHTML}</h${level}>`;
      break;
    
    case 'bulletList':
      html = `<ul class="list-disc pl-6 my-4 space-y-2 text-gray-700 dark:text-gray-300${classAttr ? ' ' + attrs.class : ''}">${childrenHTML}</ul>`;
      break;
    
    case 'orderedList':
      html = `<ol class="list-decimal pl-6 my-4 space-y-2 text-gray-700 dark:text-gray-300${classAttr ? ' ' + attrs.class : ''}">${childrenHTML}</ol>`;
      break;
    
    case 'listItem':
      html = `<li class="leading-relaxed my-1${classAttr ? ' ' + attrs.class : ''}">${childrenHTML}</li>`;
      break;
    
    case 'blockquote':
      html = `<blockquote class="border-l-4 border-blue-500 dark:border-blue-400 pl-4 italic bg-blue-50 dark:bg-blue-900/20 py-2 my-4 text-gray-700 dark:text-gray-300${classAttr ? ' ' + attrs.class : ''}">${childrenHTML}</blockquote>`;
      break;
    
    case 'codeBlock':
      const language = attrs?.language ? ` data-language="${attrs.language}"` : '';
      html = `<pre class="font-mono bg-gray-100 dark:bg-gray-800 p-4 rounded-lg border border-gray-300 dark:border-gray-600 my-4 text-sm overflow-x-auto${classAttr ? ' ' + attrs.class : ''}"${language}><code class="block">${childrenHTML}</code></pre>`;
      break;
    
    case 'horizontalRule':
      html = `<hr class="border-gray-300 dark:border-gray-600 my-8${classAttr ? ' ' + attrs.class : ''}" />`;
      break;
    
    case 'hardBreak':
      html = '<br />';
      break;
    
    case 'image':
      const src = attrs?.src || '';
      const alt = attrs?.alt || '';
      const title = attrs?.title || '';
      const imageClass = `rounded-lg shadow-md mx-auto my-4 max-w-full h-auto object-contain${
        classAttr ? ' ' + attrs.class : ''
      }`;
      html = `<img src="${src}" alt="${alt}" title="${title}" class="${imageClass}" loading="lazy" />`;
      break;
    
    case 'table':
      html = `<div class="overflow-x-auto my-6"><table class="border-collapse border border-gray-300 dark:border-gray-600 min-w-full bg-white dark:bg-gray-800 shadow-sm rounded-lg overflow-hidden${classAttr ? ' ' + attrs.class : ''}">${childrenHTML}</table></div>`;
      break;
    
    case 'tableRow':
      html = `<tr class="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors${classAttr ? ' ' + attrs.class : ''}">${childrenHTML}</tr>`;
      break;
    
    case 'tableHeader':
      html = `<th class="bg-blue-50 dark:bg-blue-900/30 font-semibold text-gray-800 dark:text-gray-200 border-b-2 border-blue-200 dark:border-blue-600 p-4 text-left${classAttr ? ' ' + attrs.class : ''}">${childrenHTML}</th>`;
      break;
    
    case 'tableCell':
      html = `<td class="border border-gray-200 dark:border-gray-600 p-4 text-gray-700 dark:text-gray-300${classAttr ? ' ' + attrs.class : ''}">${childrenHTML}</td>`;
      break;
    
    case 'taskList':
      html = `<ul class="pl-0 list-none my-4 space-y-2${classAttr ? ' ' + attrs.class : ''}">${childrenHTML}</ul>`;
      break;
    
    case 'taskItem':
      const checked = attrs?.checked ? 'checked' : '';
      const taskClass = `flex items-start my-2${classAttr ? ' ' + attrs.class : ''}`;
      html = `<li class="${taskClass}"><input type="checkbox" ${checked} disabled class="mr-3 mt-1 w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600" /><span class="flex-1 text-gray-700 dark:text-gray-300">${childrenHTML}</span></li>`;
      break;

    case 'text':
      // Already handled above
      break;
    
    default:
      // For unknown node types, try to render children
      html = childrenHTML;
      break;
  }

  return html;
};

export function RichTextView({
  content,
  className = "",
  maxHeight,
  showBorder = true,
  backgroundColor,
  isLoading = false,
  showEmptyState = true,
  emptyStateText = "No content to display.",
}: RichTextViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hasRendered, setHasRendered] = useState(false);

  // Chakra UI color values for consistent theming
  const bgColor = useColorModeValue(
    backgroundColor || "white", 
    backgroundColor || "gray.800"
  );
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const textColor = useColorModeValue("gray.500", "gray.400");
  const proseBg = useColorModeValue("white", "gray.800");

  // Enhanced content normalization with better error recovery
  const normalizedContent = useMemo((): JSONContent => {
    if (isLoading) {
      return { type: "doc", content: [] };
    }

    if (!content) {
      return { type: "doc", content: [] };
    }

    try {
      let parsedContent: any = content;

      // Handle string content (could be JSON string or plain text)
      if (typeof content === "string") {
        // Try to parse as JSON first
        try {
          parsedContent = JSON.parse(content);
        } catch (parseError) {
          // If it's plain text, wrap it in a paragraph
          return {
            type: "doc",
            content: [
              {
                type: "paragraph",
                content: [{ type: "text", text: content }],
              },
            ],
          };
        }
      }

      // Handle different content structures from RichTextEditor
      if (typeof parsedContent === 'object' && parsedContent !== null) {
        // If it's already a valid doc with content array
        if (parsedContent.type === 'doc' && Array.isArray(parsedContent.content)) {
          return sanitizeContent(parsedContent);
        }
        
        // If it's a single content array (common output from some editors)
        if (Array.isArray(parsedContent)) {
          return {
            type: "doc",
            content: parsedContent.map(node => sanitizeContent(node)).filter(Boolean)
          };
        }
        
        // If it's a single node with content
        if (parsedContent.type && (parsedContent.content || parsedContent.text)) {
          return {
            type: "doc",
            content: [sanitizeContent(parsedContent)]
          };
        }
        
        // If it's an object with a content property
        if (parsedContent.content) {
          return sanitizeContent({
            type: "doc",
            content: Array.isArray(parsedContent.content) ? parsedContent.content : []
          });
        }
      }

      // Fallback for completely unknown structure
      console.warn("Unknown content structure:", parsedContent);
      return { type: "doc", content: [] };
    } catch (error) {
      console.error("Error normalizing RichText content:", error);
      return {
        type: "doc",
        content: [
          { 
            type: "paragraph", 
            content: [{ 
              type: "text", 
              text: "Unable to display content due to formatting issues." 
            }] 
          }
        ],
      };
    }
  }, [content, isLoading]);

  // Generate HTML with comprehensive error handling
  const htmlContent = useMemo(() => {
    if (isLoading) {
      return "";
    }

    try {
      // Check if we have valid content to render
      if (!normalizedContent.content || normalizedContent.content.length === 0) {
        if (showEmptyState) {
          return `<div class="text-center py-8"><p class="text-gray-500 dark:text-gray-400 italic">${emptyStateText}</p></div>`;
        }
        return "";
      }

      const html = renderContentToHTML(normalizedContent);
      
      // Validate that we actually generated some content
      if (!html || html === '<div class="prose prose-lg dark:prose-invert max-w-none min-w-0"></div>') {
        if (showEmptyState) {
          return `<div class="text-center py-8"><p class="text-gray-500 dark:text-gray-400 italic">${emptyStateText}</p></div>`;
        }
        return "";
      }

      return html;
    } catch (error) {
      console.error("Error generating HTML from RichText content:", error);
      
      // Enhanced fallback: extract any available text content
      try {
        const extractText = (content: JSONContent): string => {
          if (!content) return '';
          
          let text = '';
          
          if (content.type === 'text' && content.text) {
            text += content.text;
          }
          
          if (content.content && Array.isArray(content.content)) {
            text += content.content.map(node => extractText(node)).join(' ');
          }
          
          return text.trim();
        };
        
        const textContent = extractText(normalizedContent);
        if (textContent) {
          return `<div class="prose prose-lg dark:prose-invert max-w-none"><p class="text-gray-700 dark:text-gray-300">${textContent}</p></div>`;
        }
      } catch (fallbackError) {
        console.error("Fallback content extraction failed:", fallbackError);
      }
      
      return `<div class="text-center py-8"><p class="text-red-500 dark:text-red-400">Error displaying content. Please try refreshing the page.</p></div>`;
    }
  }, [normalizedContent, isLoading, showEmptyState, emptyStateText]);

  // Enhanced post-render effects for optimal display
// Enhanced post-render effects for optimal display
useEffect(() => {
  if (!containerRef.current || !htmlContent) return;

  const enhanceRenderedContent = () => {
    const container = containerRef.current;
    if (!container) return;

    try {
      // Ensure images are properly handled
      const images = container.querySelectorAll("img");
      images.forEach((imgElement) => {
        const img = imgElement as HTMLImageElement;
        // Add loading and error handlers
        img.loading = "lazy";
        
        img.onerror = () => {
          img.alt = "Image not available";
          img.classList.add("border", "border-red-300", "dark:border-red-600", "p-4", "bg-red-50", "dark:bg-red-900/20");
          const fallbackText = document.createElement('div');
          fallbackText.className = "text-red-500 dark:text-red-400 text-sm text-center mt-2";
          fallbackText.textContent = "Image failed to load";
          img.parentNode?.insertBefore(fallbackText, img.nextSibling);
        };

        img.onload = () => {
          img.classList.add("loaded");
        };
      });

      // Ensure tables are scrollable on mobile
      const tables = container.querySelectorAll("table");
      tables.forEach((tableElement) => {
        const table = tableElement as HTMLTableElement;
        if (!table.parentElement?.classList.contains('overflow-x-auto')) {
          const wrapper = document.createElement('div');
          wrapper.className = 'overflow-x-auto my-4 -mx-2 px-2';
          table.parentNode?.insertBefore(wrapper, table);
          wrapper.appendChild(table);
        }
      });

      // Enhance code blocks with copy functionality
      const codeBlocks = container.querySelectorAll("pre");
      codeBlocks.forEach((preElement) => {
        const pre = preElement as HTMLPreElement;
        if (!pre.querySelector('.copy-button')) {
          const button = document.createElement('button');
          button.className = 'copy-button absolute top-2 right-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 text-xs px-2 py-1 rounded transition-colors';
          button.textContent = 'Copy';
          button.onclick = async () => {
            const code = pre.querySelector('code')?.textContent || '';
            try {
              await navigator.clipboard.writeText(code);
              button.textContent = 'Copied!';
              setTimeout(() => {
                button.textContent = 'Copy';
              }, 2000);
            } catch (err) {
              console.error('Failed to copy code:', err);
            }
          };
          
          // Cast to HTMLElement to access style property
          const preHtml = pre as HTMLElement;
          if (getComputedStyle(preHtml).position === 'static') {
            preHtml.style.position = 'relative';
          }
          pre.appendChild(button);
        }
      });

      // Add smooth transitions for images - FIXED TYPE ERROR
      const loadedImages = container.querySelectorAll('img.loaded');
      loadedImages.forEach((imgElement) => {
        const img = imgElement as HTMLImageElement;
        img.style.transition = 'opacity 0.3s ease-in-out';
        img.style.opacity = '1';
      });

      setHasRendered(true);
    } catch (error) {
      console.error("Error enhancing rendered content:", error);
    }
  };

  // Use requestAnimationFrame for smoother rendering
  const frameId = requestAnimationFrame(() => {
    enhanceRenderedContent();
  });

  return () => {
    cancelAnimationFrame(frameId);
  };
}, [htmlContent]);

  // Show loading state
  if (isLoading) {
    return (
      <Box
        display="flex"
        alignItems="center"
        justifyContent="center"
        minH="200px"
        borderWidth={showBorder ? 1 : 0}
        borderColor={borderColor}
        borderRadius="lg"
        bg={bgColor}
        p={6}
      >
        <VStack spacing={4}>
          <Spinner size="lg" color="blue.500" />
          <Text color={textColor}>Loading content...</Text>
        </VStack>
      </Box>
    );
  }

  // Show error state if content is completely invalid
  if (!htmlContent && showEmptyState) {
    return (
      <Box
        borderWidth={showBorder ? 1 : 0}
        borderColor={borderColor}
        borderRadius="lg"
        bg={bgColor}
        p={6}
      >
        <Alert status="info" borderRadius="md">
          <AlertIcon />
          {emptyStateText}
        </Alert>
      </Box>
    );
  }

  return (
    <Box
      ref={containerRef}
      className={`
        rich-text-view transition-opacity duration-300
        ${hasRendered ? 'opacity-100' : 'opacity-0'}
        ${className}
      `}
      maxHeight={maxHeight}
      overflowY={maxHeight ? "auto" : "visible"}
      bg={bgColor}
      borderWidth={showBorder ? 1 : 0}
      borderColor={borderColor}
      borderRadius="lg"
      p={4}
      sx={{
        // Base prose styles with dark mode support
        "& .prose": {
          maxWidth: "none",
          color: "inherit",
        },
        "& .prose p": {
          marginTop: "0.75rem",
          marginBottom: "0.75rem",
          lineHeight: "1.625",
        },
        // Headings with proper spacing
        "& h1, & h2, & h3, & h4, & h5, & h6": {
          fontWeight: "bold",
          marginTop: "1.5rem",
          marginBottom: "0.75rem",
        },
        "& h1": { fontSize: ["2rem", "2.5rem"] },
        "& h2": { fontSize: ["1.75rem", "2rem"] },
        "& h3": { fontSize: ["1.5rem", "1.75rem"] },
        // Lists
        "& ul, & ol": {
          marginTop: "1rem",
          marginBottom: "1rem",
        },
        "& li": {
          marginTop: "0.375rem",
          marginBottom: "0.375rem",
        },
        // Images
        "& img": {
          maxWidth: "100%",
          height: "auto",
          borderRadius: "0.5rem",
          boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
          opacity: "0",
          transition: "opacity 0.3s ease-in-out",
        },
        "& img.loaded": {
          opacity: "1",
        },
        // Code blocks
        "& pre": {
          position: "relative",
          marginTop: "1rem",
          marginBottom: "1rem",
        },
        // Tables
        "& table": {
          width: "100%",
          borderCollapse: "collapse",
        },
        // Links
        "& a": {
          transition: "color 0.2s ease-in-out",
        },
        // Mobile responsiveness
        "@media (max-width: 768px)": {
          fontSize: "0.875rem",
          lineHeight: "1.5",
          padding: "1rem",
          "& h1": { fontSize: "1.75rem" },
          "& h2": { fontSize: "1.5rem" },
          "& h3": { fontSize: "1.25rem" },
          "& pre": {
            fontSize: "0.75rem",
            padding: "0.75rem",
          },
        },
        // Dark mode styles
        "& .dark\\:prose-invert": {
          "--tw-prose-body": "var(--chakra-colors-gray-300)",
          "--tw-prose-headings": "var(--chakra-colors-white)",
          "--tw-prose-lead": "var(--chakra-colors-gray-400)",
          "--tw-prose-links": "var(--chakra-colors-blue-400)",
          "--tw-prose-bold": "var(--chakra-colors-white)",
          "--tw-prose-counters": "var(--chakra-colors-gray-400)",
          "--tw-prose-bullets": "var(--chakra-colors-gray-600)",
          "--tw-prose-hr": "var(--chakra-colors-gray-700)",
          "--tw-prose-quotes": "var(--chakra-colors-gray-300)",
          "--tw-prose-quote-borders": "var(--chakra-colors-gray-700)",
          "--tw-prose-captions": "var(--chakra-colors-gray-500)",
          "--tw-prose-code": "var(--chakra-colors-white)",
          "--tw-prose-pre-code": "var(--chakra-colors-gray-300)",
          "--tw-prose-pre-bg": "var(--chakra-colors-gray-900)",
          "--tw-prose-th-borders": "var(--chakra-colors-gray-600)",
          "--tw-prose-td-borders": "var(--chakra-colors-gray-700)",
        },
      }}
      dangerouslySetInnerHTML={{ __html: htmlContent }}
    />
  );
}
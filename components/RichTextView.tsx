// components/RichTextView.tsx
"use client";

import { useMemo, useRef, useEffect } from "react";
import { Box } from "@chakra-ui/react";
import { JSONContent } from "@tiptap/react";

interface RichTextViewProps {
  content: JSONContent | string | null;
  className?: string;
  maxHeight?: string;
  showBorder?: boolean;
  backgroundColor?: string;
}

// Safe content sanitization function
const sanitizeContent = (content: JSONContent): JSONContent => {
  if (!content || typeof content !== 'object') {
    return { type: "doc", content: [] };
  }

  const sanitized: JSONContent = {
    type: content.type || "doc",
    content: Array.isArray(content.content) ? content.content : [],
  };

  if (content.attrs) sanitized.attrs = { ...content.attrs };
  if (content.marks) sanitized.marks = Array.isArray(content.marks) ? [...content.marks] : [];
  
  return sanitized;
};

// Recursive function to render JSON content to HTML
const renderContentToHTML = (content: JSONContent): string => {
  if (!content) return '';

  const { type, attrs, content: childContent, marks, text } = content;

  // Handle text nodes
  if (type === 'text' && text) {
    let htmlText = text;
    
    // Apply marks to text
    if (marks && Array.isArray(marks)) {
      marks.forEach(mark => {
        switch (mark.type) {
          case 'bold':
            htmlText = `<strong>${htmlText}</strong>`;
            break;
          case 'italic':
            htmlText = `<em>${htmlText}</em>`;
            break;
          case 'underline':
            htmlText = `<u>${htmlText}</u>`;
            break;
          case 'strike':
            htmlText = `<s>${htmlText}</s>`;
            break;
          case 'link':
            htmlText = `<a href="${mark.attrs?.href || '#'}" target="_blank" rel="noopener noreferrer" class="text-blue-600 underline hover:text-blue-800 transition-colors">${htmlText}</a>`;
            break;
          case 'highlight':
            htmlText = `<mark class="bg-yellow-200 px-1 rounded">${htmlText}</mark>`;
            break;
          case 'textStyle':
            if (mark.attrs?.color) {
              htmlText = `<span style="color: ${mark.attrs.color}">${htmlText}</span>`;
            }
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
    childrenHTML = childContent.map(child => renderContentToHTML(child)).join('');
  }

  const classAttr = attrs?.class ? ` class="${attrs.class}"` : '';
  const styleAttr = attrs?.style ? ` style="${attrs.style}"` : '';
  const alignAttr = attrs?.textAlign ? ` style="text-align: ${attrs.textAlign}"` : '';

  switch (type) {
    case 'doc':
      html = `<div class="prose prose-lg max-w-none">${childrenHTML}</div>`;
      break;
    
    case 'paragraph':
      html = `<p${classAttr}${alignAttr}${styleAttr}>${childrenHTML}</p>`;
      break;
    
    case 'heading':
      const level = attrs?.level || 1;
      html = `<h${level}${classAttr}${alignAttr}${styleAttr}>${childrenHTML}</h${level}>`;
      break;
    
    case 'text':
      // Handled above
      break;
    
    case 'bulletList':
      html = `<ul class="list-disc pl-6 my-4 space-y-2 text-gray-700${classAttr ? ' ' + attrs.class : ''}">${childrenHTML}</ul>`;
      break;
    
    case 'orderedList':
      html = `<ol class="list-decimal pl-6 my-4 space-y-2 text-gray-700${classAttr ? ' ' + attrs.class : ''}">${childrenHTML}</ol>`;
      break;
    
    case 'listItem':
      html = `<li class="leading-relaxed${classAttr ? ' ' + attrs.class : ''}">${childrenHTML}</li>`;
      break;
    
    case 'blockquote':
      html = `<blockquote class="border-l-4 border-blue-500 pl-4 italic bg-blue-50 py-2 my-4 text-gray-700${classAttr ? ' ' + attrs.class : ''}">${childrenHTML}</blockquote>`;
      break;
    
    case 'codeBlock':
      html = `<pre class="font-mono bg-gray-100 p-4 rounded border border-gray-300 my-4 text-sm overflow-x-auto${classAttr ? ' ' + attrs.class : ''}">${childrenHTML}</pre>`;
      break;
    
    case 'code':
      html = `<code class="bg-gray-100 rounded px-1 py-0.5 text-gray-800 font-mono text-sm${classAttr ? ' ' + attrs.class : ''}">${childrenHTML}</code>`;
      break;
    
    case 'horizontalRule':
      html = `<hr class="border-gray-300 my-8${classAttr ? ' ' + attrs.class : ''}" />`;
      break;
    
    case 'hardBreak':
      html = '<br />';
      break;
    
    case 'image':
      const src = attrs?.src || '';
      const alt = attrs?.alt || '';
      const title = attrs?.title || '';
      html = `<img src="${src}" alt="${alt}" title="${title}" class="rounded-lg shadow-md mx-auto my-4 max-w-full h-auto${classAttr ? ' ' + attrs.class : ''}" loading="lazy" />`;
      break;
    
    case 'table':
      html = `<table class="border-collapse border border-gray-300 min-w-full my-6 bg-white shadow-sm rounded-lg overflow-hidden${classAttr ? ' ' + attrs.class : ''}">${childrenHTML}</table>`;
      break;
    
    case 'tableRow':
      html = `<tr class="hover:bg-gray-50 transition-colors${classAttr ? ' ' + attrs.class : ''}">${childrenHTML}</tr>`;
      break;
    
    case 'tableHeader':
      html = `<th class="bg-blue-50 font-semibold text-gray-800 border-b-2 border-blue-200 p-4${classAttr ? ' ' + attrs.class : ''}">${childrenHTML}</th>`;
      break;
    
    case 'tableCell':
      html = `<td class="border border-gray-200 p-4 text-gray-700${classAttr ? ' ' + attrs.class : ''}">${childrenHTML}</td>`;
      break;
    
    case 'taskList':
      html = `<ul class="pl-0 list-none my-4 space-y-2${classAttr ? ' ' + attrs.class : ''}">${childrenHTML}</ul>`;
      break;
    
    case 'taskItem':
      const checked = attrs?.checked ? 'checked' : '';
      html = `<li class="flex items-start my-1${classAttr ? ' ' + attrs.class : ''}"><input type="checkbox" ${checked} disabled class="mr-2 mt-1" />${childrenHTML}</li>`;
      break;
    
    default:
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
  backgroundColor = "transparent",
}: RichTextViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Normalize content safely
  const normalizedContent = useMemo((): JSONContent => {
    if (!content) {
      return { type: "doc", content: [] };
    }

    try {
      let parsedContent: any = content;

      // Handle string content
      if (typeof content === "string") {
        try {
          parsedContent = JSON.parse(content);
        } catch {
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

      // Handle different content structures
      if (typeof parsedContent === 'object') {
        // If it's already a doc, return it
        if (parsedContent.type === 'doc') {
          return sanitizeContent(parsedContent);
        }
        
        // If it's a single node, wrap it in a doc
        if (parsedContent.type) {
          return {
            type: "doc",
            content: [sanitizeContent(parsedContent)]
          };
        }
        
        // If it's an array of nodes, wrap them in a doc
        if (Array.isArray(parsedContent)) {
          return {
            type: "doc",
            content: parsedContent.map(node => sanitizeContent(node))
          };
        }
      }

      // Fallback empty content
      return { type: "doc", content: [] };
    } catch (error) {
      console.error("Error normalizing content:", error);
      return {
        type: "doc",
        content: [
          { 
            type: "paragraph", 
            content: [{ type: "text", text: "Content could not be loaded." }] 
          }
        ],
      };
    }
  }, [content]);

  // Generate HTML from content using our custom renderer
  const htmlContent = useMemo(() => {
    try {
      // Check if we have valid content to render
      if (!normalizedContent.content || normalizedContent.content.length === 0) {
        return "<p class='text-gray-500 italic'>No content available.</p>";
      }

      const html = renderContentToHTML(normalizedContent);
      return html || "<p class='text-gray-500 italic'>No content to display.</p>";
    } catch (error) {
      console.error("Error generating HTML:", error);
      
      // Fallback: try to extract plain text
      try {
        const extractText = (content: JSONContent): string => {
          if (!content.content) return '';
          
          return content.content.map(node => {
            if (node.type === 'text' && node.text) {
              return node.text;
            }
            if (node.content) {
              return extractText(node);
            }
            return '';
          }).filter(Boolean).join(' ');
        };
        
        const textContent = extractText(normalizedContent);
        if (textContent.trim()) {
          return `<p class="text-gray-700">${textContent.slice(0, 500)}${textContent.length > 500 ? '...' : ''}</p>`;
        }
      } catch (fallbackError) {
        console.error("Fallback also failed:", fallbackError);
      }
      
      return "<p class='text-red-500'>Error displaying content.</p>";
    }
  }, [normalizedContent]);

  // Apply enhanced styles after render
  useEffect(() => {
    if (!containerRef.current) return;

    const applyEnhancedStyles = () => {
      const container = containerRef.current;
      if (!container) return;

      // Style images for better display
      const images = container.querySelectorAll("img");
      images.forEach((img) => {
        // Ensure responsive images
        img.classList.add("max-w-full", "h-auto");
        
        // Handle broken images
        img.onerror = () => {
          img.alt = "Image failed to load";
          img.classList.add("border", "border-red-300", "p-4");
        };
      });

      // Ensure tables are responsive
      const tables = container.querySelectorAll("table");
      tables.forEach((table) => {
        if (!table.parentElement?.classList.contains('overflow-x-auto')) {
          const wrapper = document.createElement('div');
          wrapper.className = 'overflow-x-auto my-4';
          table.parentNode?.insertBefore(wrapper, table);
          wrapper.appendChild(table);
        }
      });

      // Style links
      const links = container.querySelectorAll("a");
      links.forEach(link => {
        if (!link.target) {
          link.target = "_blank";
        }
        if (!link.rel) {
          link.rel = "noopener noreferrer";
        }
      });
    };

    const timeoutId = setTimeout(applyEnhancedStyles, 100);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [htmlContent]);

  return (
    <Box
      ref={containerRef}
      className={`
        rich-text-content p-6 rounded-md
        ${showBorder ? "border border-gray-200" : ""}
        ${className}
      `}
      maxHeight={maxHeight}
      overflowY={maxHeight ? "auto" : "visible"}
      bg={backgroundColor}
      sx={{
        // Base prose styles
        "& .prose": {
          maxWidth: "none",
          color: "#374151",
        },
        // Headings
        "& h1": {
          fontWeight: "bold",
          fontSize: "1.875rem",
          color: "#111827",
          marginTop: "2rem",
          marginBottom: "1rem",
        },
        "& h2": {
          fontWeight: "bold",
          fontSize: "1.5rem",
          color: "#111827",
          marginTop: "1.5rem",
          marginBottom: "0.75rem",
        },
        "& h3": {
          fontWeight: "600",
          fontSize: "1.25rem",
          color: "#111827",
          marginTop: "1rem",
          marginBottom: "0.5rem",
        },
        // Paragraphs
        "& p": {
          marginTop: "0.75rem",
          marginBottom: "0.75rem",
          color: "#374151",
          lineHeight: "1.625",
        },
        // Lists
        "& ul, & ol": {
          marginTop: "1rem",
          marginBottom: "1rem",
        },
        "& li": {
          marginTop: "0.25rem",
          marginBottom: "0.25rem",
          color: "#374151",
        },
        // Links
        "& a": {
          color: "#2563eb",
          textDecoration: "none",
        },
        "& a:hover": {
          color: "#1e40af",
          textDecoration: "underline",
        },
        // Images
        "& img": {
          maxWidth: "100%",
          height: "auto",
          borderRadius: "0.5rem",
          boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
        },
        // Tables
        "& table": {
          width: "100%",
        },
        // Mobile responsiveness
        "@media (max-width: 768px)": {
          fontSize: "0.875rem",
          lineHeight: "1.5",
          "& h1": { fontSize: "1.5rem" },
          "& h2": { fontSize: "1.25rem" },
          "& h3": { fontSize: "1.125rem" },
          "& table": { fontSize: "0.75rem" },
          "& th, & td": { padding: "0.5rem" },
        },
      }}
      dangerouslySetInnerHTML={{ __html: htmlContent }}
    />
  );
}
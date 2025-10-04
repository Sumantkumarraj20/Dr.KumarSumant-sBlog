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
  VStack,
  IconButton,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalBody,
  ModalCloseButton,
  ModalHeader,
  ModalFooter,
  Flex,
  Image as ChakraImage,
  Tooltip,
  Badge,
  HStack,
} from "@chakra-ui/react";
import { JSONContent } from "@tiptap/react";
import { FaExpand, FaCompress, FaDownload, FaExternalLinkAlt } from "react-icons/fa";

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

// Enhanced sanitization function
const sanitizeContent = (content: JSONContent): JSONContent => {
  if (!content || typeof content !== "object") {
    return { type: "doc", content: [] };
  }

  try {
    const sanitized: JSONContent = {
      type: content.type || "doc",
      content: Array.isArray(content.content)
        ? content.content.filter((item) => item && typeof item === "object")
        : [],
    };

    if (content.attrs && typeof content.attrs === "object") {
      sanitized.attrs = { ...content.attrs };
    }

    if (content.marks && Array.isArray(content.marks)) {
      sanitized.marks = content.marks.filter(
        (mark) => mark && typeof mark === "object"
      );
    }

    return sanitized;
  } catch (error) {
    console.error("Sanitization error:", error);
    return { type: "doc", content: [] };
  }
};

// Enhanced HTML renderer with full RichTextEditor compatibility
const renderContentToHTML = (content: JSONContent): string => {
  if (!content) return "";

  const { type, attrs, content: childContent, marks, text } = content;

  // Handle text nodes with marks
  if (type === "text" && text) {
    let htmlText = text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");

    // Apply marks in reverse order for proper nesting
    if (marks && Array.isArray(marks)) {
      const sortedMarks = [...marks].reverse();

      sortedMarks.forEach((mark) => {
        if (!mark || typeof mark !== "object") return;

        switch (mark.type) {
          case "bold":
            htmlText = `<strong class="font-semibold text-gray-900 dark:text-white">${htmlText}</strong>`;
            break;
          case "italic":
            htmlText = `<em class="italic">${htmlText}</em>`;
            break;
          case "underline":
            htmlText = `<u class="underline">${htmlText}</u>`;
            break;
          case "strike":
            htmlText = `<s class="line-through text-gray-500">${htmlText}</s>`;
            break;
          case "link":
            const href = mark.attrs?.href || "#";
            const target = mark.attrs?.target || "_blank";
            const rel = mark.attrs?.rel || "noopener noreferrer";
            htmlText = `<a href="${href}" target="${target}" rel="${rel}" class="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 underline transition-colors duration-200 inline-flex items-center gap-1">${htmlText} <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 6a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V7a1 1 0 011-1z" clip-rule="evenodd"></path></svg></a>`;
            break;
          case "highlight":
            const color = mark.attrs?.color || "#FFEB3B";
            htmlText = `<mark style="background-color: ${color}" class="px-1 rounded bg-yellow-200 dark:bg-yellow-600">${htmlText}</mark>`;
            break;
          case "textStyle":
            if (mark.attrs?.color) {
              htmlText = `<span style="color: ${mark.attrs.color}" class="inline">${htmlText}</span>`;
            }
            break;
          case "code":
            htmlText = `<code class="bg-gray-100 dark:bg-gray-700 rounded px-1.5 py-0.5 font-mono text-sm border border-gray-300 dark:border-gray-600">${htmlText}</code>`;
            break;
          default:
            break;
        }
      });
    }

    return htmlText;
  }

  // Handle element nodes
  let html = "";
  let childrenHTML = "";

  if (childContent && Array.isArray(childContent)) {
    childrenHTML = childContent
      .map((child) => renderContentToHTML(child))
      .filter(Boolean)
      .join("");
  }

  const classAttr = attrs?.class ? ` class="${attrs.class}"` : "";
  const alignAttr = attrs?.textAlign ? ` data-align="${attrs.textAlign}"` : "";

  switch (type) {
    case "doc":
      html = `<div class="rich-text-content">${childrenHTML}</div>`;
      break;

    case "paragraph":
      html = `<p${classAttr}${alignAttr} class="paragraph mb-6 leading-relaxed">${childrenHTML}</p>`;
      break;

    case "heading":
      const level = Math.min(Math.max(attrs?.level || 1, 1), 6);
      const headingClass = `heading heading-${level} font-bold text-gray-900 dark:text-white mb-4 mt-8 first:mt-0`;
      html = `<h${level}${classAttr}${alignAttr} class="${headingClass}">${childrenHTML}</h${level}>`;
      break;

    case "bulletList":
      html = `<ul${classAttr} class="bullet-list mb-6">${childrenHTML}</ul>`;
      break;

    case "orderedList":
      html = `<ol${classAttr} class="ordered-list mb-6">${childrenHTML}</ol>`;
      break;

    case "listItem":
      html = `<li${classAttr} class="list-item mb-3 leading-relaxed">${childrenHTML}</li>`;
      break;

    case "blockquote":
      html = `<blockquote${classAttr} class="blockquote border-l-4 border-blue-500 pl-6 py-4 my-6 bg-blue-50 dark:bg-blue-900/20 italic text-gray-700 dark:text-gray-300">${childrenHTML}</blockquote>`;
      break;

    case "codeBlock":
      const language = attrs?.language
        ? ` data-language="${attrs.language}"`
        : "";
      html = `<div class="code-block-wrapper my-6"><pre${classAttr}${language} class="code-block bg-gray-900 text-gray-100 p-6 rounded-lg overflow-x-auto text-sm font-mono relative"><code>${childrenHTML}</code></pre></div>`;
      break;

    case "horizontalRule":
      html = `<hr${classAttr} class="horizontal-rule my-8 border-t border-gray-300 dark:border-gray-600" />`;
      break;

    case "hardBreak":
      html = "<br />";
      break;

    case "image":
      const src = attrs?.src || "";
      const alt = attrs?.alt || "";
      const title = attrs?.title || "";
      const imageClass = "rich-text-image cursor-zoom-in transition-all duration-300";
      const imageHtml = `<img src="${src}" alt="${alt}" title="${title}" crossOrigin="anonymous" class="${imageClass}" loading="lazy" data-src="${src}" data-alt="${alt}" data-title="${title}" />`;
      
      // Wrap image with caption if title exists
      if (title) {
        html = `<figure class="image-container my-8 text-center">${imageHtml}<figcaption class="mt-3 text-sm text-gray-600 dark:text-gray-400 italic">${title}</figcaption></figure>`;
      } else {
        html = `<div class="image-container my-8 text-center">${imageHtml}</div>`;
      }
      break;

    case "table":
      html = `<div class="table-container my-6 overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">${childrenHTML}</div>`;
      break;

    case "tableRow":
      html = `<tr${classAttr} class="table-row border-b border-gray-200 dark:border-gray-700 last:border-b-0">${childrenHTML}</tr>`;
      break;

    case "tableHeader":
      html = `<th${classAttr} class="table-header bg-gray-50 dark:bg-gray-800 font-semibold text-left p-4 border-b border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white">${childrenHTML}</th>`;
      break;

    case "tableCell":
      html = `<td${classAttr} class="table-cell p-4 border-r border-gray-200 dark:border-gray-700 last:border-r-0 align-top">${childrenHTML}</td>`;
      break;

    case "taskList":
      html = `<ul${classAttr} class="task-list mb-6 space-y-2">${childrenHTML}</ul>`;
      break;

    case "taskItem":
      const checked = attrs?.checked ? "checked" : "";
      const checkedClass = attrs?.checked ? "line-through text-gray-500" : "";
      html = `<li${classAttr} class="task-item flex items-start gap-3"><input type="checkbox" ${checked} disabled class="task-checkbox mt-1 w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600" /><span class="task-content ${checkedClass} flex-1">${childrenHTML}</span></li>`;
      break;

    case "text":
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
  backgroundColor,
  isLoading = false,
  showEmptyState = true,
  emptyStateText = "No content to display.",
}: RichTextViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hasRendered, setHasRendered] = useState(false);
  const [selectedImage, setSelectedImage] = useState<{ src: string; alt: string; title: string } | null>(null);
  const { isOpen, onOpen, onClose } = useDisclosure();

  // Chakra UI color values
  const bgColor = useColorModeValue(
    backgroundColor || "white",
    backgroundColor || "gray.800"
  );
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const textColor = useColorModeValue("gray.500", "gray.400");

  // Content normalization
  const normalizedContent = useMemo((): JSONContent => {
    if (isLoading) return { type: "doc", content: [] };
    if (!content) return { type: "doc", content: [] };

    try {
      let parsedContent: any = content;

      if (typeof content === "string") {
        try {
          parsedContent = JSON.parse(content);
        } catch {
          return {
            type: "doc",
            content: [
              { type: "paragraph", content: [{ type: "text", text: content }] },
            ],
          };
        }
      }

      if (typeof parsedContent === "object" && parsedContent !== null) {
        if (
          parsedContent.type === "doc" &&
          Array.isArray(parsedContent.content)
        ) {
          return sanitizeContent(parsedContent);
        }

        if (Array.isArray(parsedContent)) {
          return {
            type: "doc",
            content: parsedContent
              .map((node) => sanitizeContent(node))
              .filter(Boolean),
          };
        }

        if (
          parsedContent.type &&
          (parsedContent.content || parsedContent.text)
        ) {
          return { type: "doc", content: [sanitizeContent(parsedContent)] };
        }

        if (parsedContent.content) {
          return sanitizeContent({
            type: "doc",
            content: Array.isArray(parsedContent.content)
              ? parsedContent.content
              : [],
          });
        }
      }

      return { type: "doc", content: [] };
    } catch (error) {
      console.error("Error normalizing content:", error);
      return { type: "doc", content: [] };
    }
  }, [content, isLoading]);

  // Generate HTML
  const htmlContent = useMemo(() => {
    if (isLoading) return "";

    try {
      if (
        !normalizedContent.content ||
        normalizedContent.content.length === 0
      ) {
        if (showEmptyState) {
          return `<div class="empty-state">${emptyStateText}</div>`;
        }
        return "";
      }

      const html = renderContentToHTML(normalizedContent);

      if (!html || html === '<div class="rich-text-content"></div>') {
        if (showEmptyState) {
          return `<div class="empty-state">${emptyStateText}</div>`;
        }
        return "";
      }

      return html;
    } catch (error) {
      console.error("Error generating HTML:", error);
      return `<div class="error-state">Error displaying content. Please try refreshing the page.</div>`;
    }
  }, [normalizedContent, isLoading, showEmptyState, emptyStateText]);

  // Enhanced post-render effects
  useEffect(() => {
    if (!containerRef.current || !htmlContent) return;

    const enhanceRenderedContent = () => {
      const container = containerRef.current;
      if (!container) return;

      try {
        // Add click handlers for images
        const images = container.querySelectorAll(".rich-text-image");
        images.forEach((imgElement) => {
          const img = imgElement as HTMLImageElement;
          const src = img.getAttribute("data-src") || img.src;
          const alt = img.getAttribute("data-alt") || img.alt;
          const title = img.getAttribute("data-title") || "";

          img.onclick = () => {
            setSelectedImage({ src, alt, title });
            onOpen();
          };

          img.style.cursor = "pointer";
          img.onerror = () => {
            img.alt = "Image not available";
            img.classList.add("image-error");
          };
        });

        // Add copy functionality to code blocks
        const codeBlocks = container.querySelectorAll(".code-block");
        codeBlocks.forEach((preElement) => {
          const pre = preElement as HTMLPreElement;
          if (!pre.querySelector(".copy-button")) {
            const button = document.createElement("button");
            button.className = "copy-button absolute top-2 right-2 bg-gray-700 hover:bg-gray-600 text-white px-3 py-1 rounded text-xs font-medium transition-colors duration-200";
            button.innerHTML = `
              <svg class="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
              </svg>
              Copy
            `;
            button.onclick = async () => {
              const code = pre.querySelector("code")?.textContent || "";
              try {
                await navigator.clipboard.writeText(code);
                button.innerHTML = `
                  <svg class="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  Copied!
                `;
                setTimeout(() => {
                  button.innerHTML = `
                    <svg class="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
                    </svg>
                    Copy
                  `;
                }, 2000);
              } catch (err) {
                console.error("Failed to copy code:", err);
              }
            };
            pre.style.position = "relative";
            pre.appendChild(button);
          }
        });

        setHasRendered(true);
      } catch (error) {
        console.error("Error enhancing content:", error);
      }
    };

    const frameId = requestAnimationFrame(enhanceRenderedContent);
    return () => cancelAnimationFrame(frameId);
  }, [htmlContent, onOpen]);

  // Handle image download
  const handleDownloadImage = () => {
    if (!selectedImage) return;
    
    const link = document.createElement('a');
    link.href = selectedImage.src;
    link.download = selectedImage.alt || 'image';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Handle open image in new tab
  const handleOpenImage = () => {
    if (!selectedImage) return;
    window.open(selectedImage.src, '_blank');
  };

  // Loading state
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

  // Error state
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
    <>
      <Box
        position="relative"
        borderWidth={showBorder ? 1 : 0}
        borderColor={borderColor}
        borderRadius="lg"
        bg={bgColor}
        p={6}
        shadow={showBorder ? "sm" : "none"}
      >
        {/* Content */}
        <Box
          ref={containerRef}
          className={`rich-text-view transition-opacity duration-300 ${
            hasRendered ? "opacity-100" : "opacity-0"
          } ${className}`}
          maxHeight={maxHeight}
          overflowY={maxHeight ? "auto" : "visible"}
          sx={{
            // Base styles for professional e-learning appearance
            color: "gray.700",
            _dark: { color: "gray.200" },
            lineHeight: "1.75",
            fontSize: "1.125rem",
            fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",

            // Content wrapper
            "& .rich-text-content": {
              width: "100%",
              maxWidth: "none",
            },

            // Enhanced Paragraphs with better spacing
            "& .paragraph": {
              marginBottom: "1.5rem",
              lineHeight: "1.8",
              fontSize: "1.125rem",
              color: "gray.700",
              _dark: { color: "gray.200" },
              "&[data-align='center']": { 
                textAlign: "center",
              },
              "&[data-align='right']": { 
                textAlign: "right",
              },
              "&[data-align='justify']": { 
                textAlign: "justify",
              },
            },

            // Professional Headings
            "& .heading": {
              fontWeight: "700",
              color: "gray.900",
              _dark: { color: "white" },
              marginTop: "2.5rem",
              marginBottom: "1.5rem",
              lineHeight: "1.3",
              "&[data-align='center']": { textAlign: "center" },
              "&[data-align='right']": { textAlign: "right" },
            },
            "& .heading-1": { 
              fontSize: ["2.25rem", "2.5rem"], 
              marginTop: "0",
              borderBottom: "2px solid",
              borderColor: "blue.500",
              paddingBottom: "0.5rem",
            },
            "& .heading-2": { 
              fontSize: ["1.875rem", "2rem"],
              borderBottom: "1px solid",
              borderColor: "gray.200",
              _dark: { borderColor: "gray.600" },
              paddingBottom: "0.375rem",
            },
            "& .heading-3": { 
              fontSize: ["1.5rem", "1.75rem"],
              color: "blue.600",
              _dark: { color: "blue.400" },
            },

            // Enhanced Multi-level Lists
            "& .bullet-list": {
              listStyleType: "disc",
              paddingLeft: "2rem",
              marginBottom: "1.5rem",
              "& .bullet-list": {
                listStyleType: "circle",
                marginTop: "0.75rem",
                marginBottom: "0.5rem",
              },
              "& .bullet-list .bullet-list": { 
                listStyleType: "square",
              },
            },
            "& .ordered-list": {
              listStyleType: "decimal",
              paddingLeft: "2rem",
              marginBottom: "1.5rem",
              "& .ordered-list": {
                listStyleType: "lower-alpha",
                marginTop: "0.75rem",
                marginBottom: "0.5rem",
              },
              "& .ordered-list .ordered-list": { 
                listStyleType: "lower-roman",
              },
            },
            "& .list-item": {
              marginBottom: "0.75rem",
              lineHeight: "1.7",
              fontSize: "1.125rem",
            },

            // Professional Blockquotes
            "& .blockquote": {
              borderLeftWidth: "4px",
              borderLeftColor: "blue.500",
              paddingLeft: "1.5rem",
              paddingTop: "1rem",
              paddingBottom: "1rem",
              margin: "2rem 0",
              backgroundColor: "blue.50",
              _dark: { backgroundColor: "blue.900/20" },
              fontStyle: "italic",
              borderRadius: "0 8px 8px 0",
              fontSize: "1.125rem",
            },

            // Enhanced Code Blocks
            "& .code-block-wrapper": {
              margin: "2rem 0",
            },
            "& .code-block": {
              position: "relative",
              backgroundColor: "gray.900",
              color: "gray.100",
              padding: "1.5rem",
              borderRadius: "12px",
              overflowX: "auto",
              fontSize: "0.875rem",
              fontFamily: "'Fira Code', 'Monaco', 'Cascadia Code', monospace",
              border: "1px solid",
              borderColor: "gray.700",
              boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
            },

            // Professional Images
            "& .image-container": {
              textAlign: "center",
              margin: "3rem 0",
            },
            "& .rich-text-image": {
              maxWidth: "100%",
              height: "auto",
              borderRadius: "12px",
              boxShadow: "0 10px 25px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
              transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
              cursor: "zoom-in",
              border: "1px solid",
              borderColor: "gray.200",
              _dark: { borderColor: "gray.600" },
              "&:hover": {
                transform: "translateY(-2px)",
                boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
              },
            },

            // Enhanced Tables
            "& .table-container": {
              overflowX: "auto",
              margin: "2.5rem 0",
              borderRadius: "12px",
              border: "1px solid",
              borderColor: "gray.200",
              _dark: { borderColor: "gray.600" },
              boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
            },
            "& .rich-text-table": {
              width: "100%",
              borderCollapse: "collapse",
              backgroundColor: "white",
              _dark: { backgroundColor: "gray.800" },
            },
            "& .table-header": {
              backgroundColor: "gray.50",
              _dark: { backgroundColor: "gray.700", borderColor: "gray.600", color: "gray.300"  },
              fontWeight: "600",
              padding: "1rem 1.25rem",
              borderBottom: "2px solid",
              borderColor: "gray.200",
              textAlign: "left",
              fontSize: "0.875rem",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              color: "gray.600",
            },
            "& .table-cell": {
              padding: "1rem 1.25rem",
              borderBottom: "1px solid",
              borderColor: "gray.200",
              _dark: { borderColor: "gray.600" },
              "&:not(:last-child)": { 
                borderRight: "1px solid",
                borderColor: "gray.200",
                _dark: { borderColor: "gray.600" },
              },
            },
            "& .table-row": {
              transition: "background-color 0.2s",
              "&:hover": { 
                backgroundColor: "gray.50",
                _dark: { backgroundColor: "gray.700" },
              },
              "&:last-child .table-cell": { borderBottom: "none" },
            },

            // Task lists
            "& .task-list": {
              listStyle: "none",
              paddingLeft: "0",
              marginBottom: "1.5rem",
              spaceY: "0.5rem",
            },
            "& .task-item": {
              display: "flex",
              alignItems: "flex-start",
              marginBottom: "0.75rem",
              padding: "0.5rem",
              borderRadius: "6px",
              transition: "background-color 0.2s",
              "&:hover": {
                backgroundColor: "gray.50",
                _dark: { backgroundColor: "gray.700" },
              },
            },

            // Horizontal rule
            "& .horizontal-rule": {
              border: "none",
              borderTop: "2px solid",
              borderColor: "gray.300",
              _dark: { borderColor: "gray.600" },
              margin: "3rem 0",
            },

            // Empty and error states
            "& .empty-state, & .error-state": {
              textAlign: "center",
              padding: "4rem 2rem",
              color: "gray.500",
              _dark: { color: "gray.400" },
              fontStyle: "italic",
              fontSize: "1.125rem",
            },

            // Mobile responsiveness
            "@media (max-width: 768px)": {
              fontSize: "1rem",
              padding: "0",
              "& .heading-1": { 
                fontSize: "1.875rem",
                paddingBottom: "0.375rem",
              },
              "& .heading-2": { 
                fontSize: "1.5rem",
                paddingBottom: "0.25rem",
              },
              "& .heading-3": { fontSize: "1.25rem" },
              "& .paragraph": {
                fontSize: "1rem",
                marginBottom: "1.25rem",
              },
              "& .code-block": {
                padding: "1rem",
                fontSize: "0.75rem",
              },
              "& .table-header, & .table-cell": {
                padding: "0.75rem 1rem",
              },
              "& .bullet-list, & .ordered-list": {
                paddingLeft: "1.5rem",
              },
            },
          }}
          dangerouslySetInnerHTML={{ __html: htmlContent }}
        />
      </Box>

      {/* Enhanced Image Modal for fullscreen view */}
      <Modal isOpen={isOpen} onClose={onClose} size="full" isCentered motionPreset="scale">
        <ModalOverlay bg="blackAlpha.800" />
        <ModalContent 
          bg="transparent" 
          boxShadow="none" 
          maxW="95vw" 
          maxH="95vh"
          margin="0"
        >
          <ModalHeader 
            bg="blackAlpha.600" 
            color="white" 
            borderTopRadius="lg"
            display="flex"
            alignItems="center"
            justifyContent="space-between"
          >
            <Box flex="1">
              <Text fontSize="lg" fontWeight="600">
                {selectedImage?.title || selectedImage?.alt || "Image Preview"}
              </Text>
              {selectedImage?.alt && selectedImage.alt !== selectedImage?.title && (
                <Text fontSize="sm" color="gray.300" mt={1}>
                  {selectedImage.alt}
                </Text>
              )}
            </Box>
            <HStack spacing={2}>
              <Tooltip label="Download image">
                <IconButton
                  icon={<FaDownload />}
                  aria-label="Download image"
                  variant="ghost"
                  color="white"
                  _hover={{ bg: "whiteAlpha.200" }}
                  onClick={handleDownloadImage}
                />
              </Tooltip>
              <Tooltip label="Open in new tab">
                <IconButton
                  icon={<FaExternalLinkAlt />}
                  aria-label="Open in new tab"
                  variant="ghost"
                  color="white"
                  _hover={{ bg: "whiteAlpha.200" }}
                  onClick={handleOpenImage}
                />
              </Tooltip>
              <ModalCloseButton 
                position="relative" 
                top={0} 
                right={0} 
                color="white"
                _hover={{ bg: "whiteAlpha.200" }}
              />
            </HStack>
          </ModalHeader>
          <ModalBody 
            display="flex" 
            alignItems="center" 
            justifyContent="center" 
            p={0}
            bg="blackAlpha.600"
          >
            {selectedImage && (
              <ChakraImage
                src={selectedImage.src}
                alt={selectedImage.alt}
                maxH="calc(95vh - 80px)"
                maxW="calc(95vw - 40px)"
                objectFit="contain"
                onClick={onClose}
                cursor="pointer"
                borderRadius="lg"
              />
            )}
          </ModalBody>
          <ModalFooter 
            bg="blackAlpha.600" 
            borderBottomRadius="lg"
            justifyContent="center"
          >
            <Text color="gray.300" fontSize="sm">
              Click anywhere to close • Scroll to zoom
            </Text>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}
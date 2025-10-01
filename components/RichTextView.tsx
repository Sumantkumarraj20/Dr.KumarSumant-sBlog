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
  Flex,
  Image as ChakraImage,
} from "@chakra-ui/react";
import { JSONContent } from "@tiptap/react";
import { FaExpand, FaCompress } from "react-icons/fa";

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
            htmlText = `<strong class="font-semibold">${htmlText}</strong>`;
            break;
          case "italic":
            htmlText = `<em class="italic">${htmlText}</em>`;
            break;
          case "underline":
            htmlText = `<u class="underline">${htmlText}</u>`;
            break;
          case "strike":
            htmlText = `<s class="line-through">${htmlText}</s>`;
            break;
          case "link":
            const href = mark.attrs?.href || "#";
            const target = mark.attrs?.target || "_blank";
            const rel = mark.attrs?.rel || "noopener noreferrer";
            htmlText = `<a href="${href}" target="${target}" rel="${rel}" class="text-link hover:text-link-hover underline transition-colors duration-200">${htmlText}</a>`;
            break;
          case "highlight":
            const color = mark.attrs?.color || "#FFEB3B";
            htmlText = `<mark style="background-color: ${color}" class="px-1 rounded bg-highlight">${htmlText}</mark>`;
            break;
          case "textStyle":
            if (mark.attrs?.color) {
              htmlText = `<span style="color: ${mark.attrs.color}" class="inline">${htmlText}</span>`;
            }
            break;
          case "code":
            htmlText = `<code class="bg-code rounded px-1 py-0.5 font-mono text-sm">${htmlText}</code>`;
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
      html = `<p${classAttr}${alignAttr} class="paragraph">${childrenHTML}</p>`;
      break;

    case "heading":
      const level = Math.min(Math.max(attrs?.level || 1, 1), 6);
      html = `<h${level}${classAttr}${alignAttr} class="heading heading-${level}">${childrenHTML}</h${level}>`;
      break;

    case "bulletList":
      html = `<ul${classAttr} class="bullet-list">${childrenHTML}</ul>`;
      break;

    case "orderedList":
      html = `<ol${classAttr} class="ordered-list">${childrenHTML}</ol>`;
      break;

    case "listItem":
      html = `<li${classAttr} class="list-item">${childrenHTML}</li>`;
      break;

    case "blockquote":
      html = `<blockquote${classAttr} class="blockquote">${childrenHTML}</blockquote>`;
      break;

    case "codeBlock":
      const language = attrs?.language
        ? ` data-language="${attrs.language}"`
        : "";
      html = `<pre${classAttr}${language} class="code-block"><code>${childrenHTML}</code></pre>`;
      break;

    case "horizontalRule":
      html = `<hr${classAttr} class="horizontal-rule" />`;
      break;

    case "hardBreak":
      html = "<br />";
      break;

    case "image":
      const src = attrs?.src || "";
      const alt = attrs?.alt || "";
      const title = attrs?.title || "";
      html = `<div class="image-container"><img src="${src}" alt="${alt}" title="${title}" class="rich-text-image" loading="lazy" data-src="${src}" /></div>`;
      break;

    case "table":
      html = `<div class="table-container"><table${classAttr} class="rich-text-table">${childrenHTML}</table></div>`;
      break;

    case "tableRow":
      html = `<tr${classAttr} class="table-row">${childrenHTML}</tr>`;
      break;

    case "tableHeader":
      html = `<th${classAttr} class="table-header">${childrenHTML}</th>`;
      break;

    case "tableCell":
      html = `<td${classAttr} class="table-cell">${childrenHTML}</td>`;
      break;

    case "taskList":
      html = `<ul${classAttr} class="task-list">${childrenHTML}</ul>`;
      break;

    case "taskItem":
      const checked = attrs?.checked ? "checked" : "";
      html = `<li${classAttr} class="task-item"><input type="checkbox" ${checked} disabled class="task-checkbox" /><span class="task-content">${childrenHTML}</span></li>`;
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
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const { isOpen, onOpen, onClose } = useDisclosure();

  // Chakra UI color values
  const bgColor = useColorModeValue(
    backgroundColor || "white",
    backgroundColor || "gray.800"
  );
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const textColor = useColorModeValue("gray.500", "gray.400");
  const proseText = useColorModeValue("gray.800", "gray.200");
  const proseHeading = useColorModeValue("gray.900", "white");
  const codeBg = useColorModeValue("gray.100", "gray.700");
  const tableBorder = useColorModeValue("gray.300", "gray.500");
  const tableHeaderBg = useColorModeValue("gray.50", "gray.700");
  const linkColor = useColorModeValue("blue.600", "blue.400");
  const linkHover = useColorModeValue("blue.700", "blue.300");
  const highlightBg = useColorModeValue("yellow.200", "yellow.600");
  const blockquoteBg = useColorModeValue("blue.50", "blue.900");
  const blockquoteBorder = useColorModeValue("blue.500", "blue.400");

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

          img.onclick = () => {
            setSelectedImage(src);
            onOpen();
          };

          img.style.cursor = "pointer";
          img.onerror = () => {
            img.alt = "Image not available";
            img.classList.add("image-error");
          };
        });

        // Enhance tables
        const tables = container.querySelectorAll(".rich-text-table");
        tables.forEach((tableElement) => {
          const table = tableElement as HTMLTableElement;
          if (!table.parentElement?.classList.contains("table-container")) {
            const wrapper = document.createElement("div");
            wrapper.className = "table-container";
            table.parentNode?.insertBefore(wrapper, table);
            wrapper.appendChild(table);
          }
        });

        // Add copy functionality to code blocks
        const codeBlocks = container.querySelectorAll(".code-block");
        codeBlocks.forEach((preElement) => {
          const pre = preElement as HTMLPreElement;
          if (!pre.querySelector(".copy-button")) {
            const button = document.createElement("button");
            button.className = "copy-button";
            button.textContent = "Copy";
            button.onclick = async () => {
              const code = pre.querySelector("code")?.textContent || "";
              try {
                await navigator.clipboard.writeText(code);
                button.textContent = "Copied!";
                setTimeout(() => (button.textContent = "Copy"), 2000);
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
        className={isFullscreen ? "fixed inset-0 z-50 p-6" : "relative"}
        position={isFullscreen ? "fixed" : "relative"}
        borderWidth={showBorder ? 1 : 0}
        borderColor={borderColor}
        borderRadius="lg"
        bg={bgColor}
        p={4}
        shadow={showBorder ? "sm" : "none"}
      >
        {/* Fullscreen toggle */}
        <Flex justify="flex-end" mb={3}>
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
        </Flex>

        {/* Content */}
        <Box
          ref={containerRef}
          className={`rich-text-view transition-opacity duration-300 ${
            hasRendered ? "opacity-100" : "opacity-0"
          } ${className}`}
          maxHeight={maxHeight}
          overflowY={maxHeight ? "auto" : "visible"}
          sx={{
            // Base styles
            color: proseText,
            lineHeight: "1.75",
            fontSize: "1rem",

            // Content wrapper
            "& .rich-text-content": {
              width: "100%",
            },

            // Paragraphs
            "& .paragraph": {
              marginBottom: "1.25rem",
              lineHeight: "1.75",
              "&[data-align='center']": { textAlign: "center" },
              "&[data-align='right']": { textAlign: "right" },
              "&[data-align='justify']": { textAlign: "justify" },
            },

            // Headings
            "& .heading": {
              fontWeight: "bold",
              color: proseHeading,
              marginTop: "2rem",
              marginBottom: "1rem",
              lineHeight: "1.3",
              "&[data-align='center']": { textAlign: "center" },
              "&[data-align='right']": { textAlign: "right" },
            },
            "& .heading-1": { fontSize: ["2rem", "2.5rem"], marginTop: "0" },
            "& .heading-2": { fontSize: ["1.75rem", "2rem"] },
            "& .heading-3": { fontSize: ["1.5rem", "1.75rem"] },

            // Lists
            "& .bullet-list": {
              listStyleType: "disc",
              paddingLeft: "1.5rem",
              marginBottom: "1.25rem",
              "& .bullet-list": {
                listStyleType: "circle",
                marginTop: "0.5rem",
              },
              "& .bullet-list .bullet-list": { listStyleType: "square" },
            },
            "& .ordered-list": {
              listStyleType: "decimal",
              paddingLeft: "1.5rem",
              marginBottom: "1.25rem",
              "& .ordered-list": {
                listStyleType: "lower-alpha",
                marginTop: "0.5rem",
              },
              "& .ordered-list .ordered-list": { listStyleType: "lower-roman" },
            },
            "& .list-item": {
              marginBottom: "0.5rem",
              lineHeight: "1.75",
            },
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
                  "& .rich-text-bullet-list": {
                    listStyleType: "disc",
                    margin: "0.25rem 0",
                  },
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
                  "& .rich-text-ordered-list": {
                    listStyleType: "decimal",
                    margin: "0.25rem 0",
                  },
                },
              },
            },

            // Blockquotes
            "& .blockquote": {
              borderLeft: `4px solid ${blockquoteBorder}`,
              paddingLeft: "1rem",
              fontStyle: "italic",
              backgroundColor: blockquoteBg,
              padding: "1rem",
              margin: "1.5rem 0",
              borderRadius: "0 0.5rem 0.5rem 0",
            },

            // Code blocks
            "& .code-block": {
              position: "relative",
              backgroundColor: codeBg,
              padding: "1.5rem",
              borderRadius: "0.5rem",
              margin: "1.5rem 0",
              overflow: "auto",
              fontSize: "0.875rem",
              fontFamily: "monospace",
              "& .copy-button": {
                position: "absolute",
                top: "0.5rem",
                right: "0.5rem",
                backgroundColor: "rgba(0,0,0,0.1)",
                border: "none",
                padding: "0.25rem 0.5rem",
                borderRadius: "0.25rem",
                fontSize: "0.75rem",
                cursor: "pointer",
                transition: "background-color 0.2s",
                "&:hover": { backgroundColor: "rgba(0,0,0,0.2)" },
              },
            },

            // Images
            "& .image-container": {
              textAlign: "center",
              margin: "2rem 0",
            },
            "& .rich-text-image": {
              maxWidth: "100%",
              height: "auto",
              borderRadius: "0.75rem",
              boxShadow:
                "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
              transition: "all 0.3s ease",
              cursor: "pointer",
              "&:hover": {
                transform: "scale(1.02)",
                boxShadow:
                  "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
              },
              "&.image-error": {
                border: `2px dashed ${borderColor}`,
                padding: "2rem",
                backgroundColor: "rgba(0,0,0,0.05)",
              },
            },

            // Tables
            "& .table-container": {
              overflowX: "auto",
              margin: "2rem 0",
              borderRadius: "0.75rem",
              border: `1px solid ${tableBorder}`,
              boxShadow:
                "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
            },
            "& .rich-text-table": {
              width: "100%",
              borderCollapse: "collapse",
              backgroundColor: bgColor,
            },
            "& .table-header": {
              backgroundColor: tableHeaderBg,
              fontWeight: "bold",
              padding: "1rem",
              borderBottom: `2px solid ${tableBorder}`,
              textAlign: "left",
            },
            "& .table-cell": {
              padding: "1rem",
              borderBottom: `1px solid ${tableBorder}`,
              "&:not(:last-child)": { borderRight: `1px solid ${tableBorder}` },
            },
            "& .table-row": {
              transition: "background-color 0.2s",
              "&:hover": { backgroundColor: "rgba(0,0,0,0.02)" },
              "&:last-child .table-cell": { borderBottom: "none" },
            },

            // Task lists
            "& .task-list": {
              listStyle: "none",
              paddingLeft: "0",
              marginBottom: "1.25rem",
            },
            "& .task-item": {
              display: "flex",
              alignItems: "flex-start",
              marginBottom: "0.5rem",
              "& .task-checkbox": {
                marginRight: "0.75rem",
                marginTop: "0.25rem",
              },
              "& .task-content": { flex: 1 },
            },

            // Links
            "& .text-link": { color: linkColor },
            "& .text-link-hover": { color: linkHover },

            // Highlight
            "& .bg-highlight": { backgroundColor: highlightBg },

            // Code inline
            "& .bg-code": { backgroundColor: codeBg },

            // Empty and error states
            "& .empty-state, & .error-state": {
              textAlign: "center",
              padding: "3rem 2rem",
              color: textColor,
              fontStyle: "italic",
            },
            "& .error-state": { color: "red.500" },

            // Horizontal rule
            "& .horizontal-rule": {
              border: "none",
              borderTop: `1px solid ${borderColor}`,
              margin: "2rem 0",
            },

            // Mobile responsiveness
            "@media (max-width: 768px)": {
              fontSize: "0.875rem",
              padding: "0.5rem",
              "& .heading-1": { fontSize: "1.75rem" },
              "& .heading-2": { fontSize: "1.5rem" },
              "& .heading-3": { fontSize: "1.25rem" },
              "& .code-block": {
                padding: "1rem",
                fontSize: "0.75rem",
              },
              "& .table-header, & .table-cell": {
                padding: "0.75rem 0.5rem",
              },
            },
          }}
          dangerouslySetInnerHTML={{ __html: htmlContent }}
        />
      </Box>

      {/* Image modal for fullscreen view */}
      <Modal isOpen={isOpen} onClose={onClose} size="full" isCentered>
        <ModalOverlay />
        <ModalContent bg="blackAlpha.800">
          <ModalCloseButton color="white" zIndex={10} />
          <ModalBody
            display="flex"
            alignItems="center"
            justifyContent="center"
            p={0}
          >
            {selectedImage && (
              <ChakraImage
                src={selectedImage}
                alt="Fullscreen view"
                maxH="90vh"
                maxW="90vw"
                objectFit="contain"
                onClick={onClose}
                cursor="pointer"
              />
            )}
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
}

// Add Tooltip import and component
import { Tooltip } from "@chakra-ui/react";

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
  HStack,
  Divider,
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

// Enhanced HTML renderer that preserves RichTextEditor styling
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
            htmlText = `<strong>${htmlText}</strong>`;
            break;
          case "italic":
            htmlText = `<em>${htmlText}</em>`;
            break;
          case "underline":
            htmlText = `<u>${htmlText}</u>`;
            break;
          case "strike":
            htmlText = `<s>${htmlText}</s>`;
            break;
          case "link":
            const href = mark.attrs?.href || "#";
            const target = mark.attrs?.target || "_blank";
            const rel = mark.attrs?.rel || "noopener noreferrer";
            htmlText = `<a href="${href}" target="${target}" rel="${rel}">${htmlText}</a>`;
            break;
          case "highlight":
            const color = mark.attrs?.color || "#FFEB3B";
            htmlText = `<mark style="background-color: ${color}">${htmlText}</mark>`;
            break;
          case "textStyle":
            if (mark.attrs?.color) {
              htmlText = `<span style="color: ${mark.attrs.color}">${htmlText}</span>`;
            }
            break;
          case "code":
            htmlText = `<code>${htmlText}</code>`;
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
      html = `<p${classAttr}${alignAttr}>${childrenHTML}</p>`;
      break;

    case "heading":
      const level = Math.min(Math.max(attrs?.level || 1, 1), 6);
      html = `<h${level}${classAttr}${alignAttr}>${childrenHTML}</h${level}>`;
      break;

    case "bulletList":
      html = `<ul${classAttr}>${childrenHTML}</ul>`;
      break;

    case "orderedList":
      html = `<ol${classAttr}>${childrenHTML}</ol>`;
      break;

    case "listItem":
      html = `<li${classAttr}>${childrenHTML}</li>`;
      break;

    case "blockquote":
      html = `<blockquote${classAttr}>${childrenHTML}</blockquote>`;
      break;

    case "codeBlock":
      const language = attrs?.language
        ? ` data-language="${attrs.language}"`
        : "";
      html = `<pre${classAttr}${language}><code>${childrenHTML}</code></pre>`;
      break;

    case "horizontalRule":
      html = `<hr${classAttr} />`;
      break;

    case "hardBreak":
      html = "<br />";
      break;

    case "image":
      const src = attrs?.src || "";
      const alt = attrs?.alt || "";
      const title = attrs?.title || "";
      const imageHtml = `<img src="${src}" alt="${alt}" title="${title}" crossOrigin="anonymous" loading="lazy" data-src="${src}" data-alt="${alt}" data-title="${title}" />`;
      
      // Wrap image with caption if title exists
      if (title) {
        html = `<figure class="image-container">${imageHtml}<figcaption>${title}</figcaption></figure>`;
      } else {
        html = `<div class="image-container">${imageHtml}</div>`;
      }
      break;

    case "table":
      html = `<div class="table-container"><table${classAttr}>${childrenHTML}</table></div>`;
      break;

    case "tableRow":
      html = `<tr${classAttr}>${childrenHTML}</tr>`;
      break;

    case "tableHeader":
      html = `<th${classAttr}>${childrenHTML}</th>`;
      break;

    case "tableCell":
      html = `<td${classAttr}>${childrenHTML}</td>`;
      break;

    case "taskList":
      html = `<ul${classAttr}>${childrenHTML}</ul>`;
      break;

    case "taskItem":
      const checked = attrs?.checked ? "checked" : "";
      html = `<li${classAttr}><input type="checkbox" ${checked} disabled /><span>${childrenHTML}</span></li>`;
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

  // Use parent's background to avoid styling conflicts
  const bgColor = backgroundColor || 'transparent';
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
        const images = container.querySelectorAll("img");
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
          };
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
        p={4}
        shadow={showBorder ? "sm" : "none"}
      >
        {/* Content */}
        <Box
          ref={containerRef}
          className={`prose prose-lg max-w-none dark:prose-invert 
            prose-headings:font-bold prose-p:leading-relaxed 
            prose-img:max-w-full prose-img:h-auto prose-img:rounded-lg prose-img:my-4 
            prose-table:w-full prose-td:border prose-th:border prose-td:p-2 prose-th:p-2 
            prose-td:border-gray-300 prose-th:border-gray-300 dark:prose-td:border-gray-500 
            dark:prose-th:border-gray-500 prose-th:bg-gray-100 dark:prose-th:bg-gray-700
            prose-strong:font-bold prose-em:italic prose-ul:my-4 prose-ol:my-4
            prose-li:my-1 prose-blockquote:border-l-4 prose-blockquote:border-blue-500 
            prose-blockquote:pl-4 prose-blockquote:italic prose-blockquote:bg-blue-50 
            dark:prose-blockquote:bg-blue-900/20 prose-blockquote:py-2 prose-blockquote:my-4
            prose-pre:bg-gray-100 dark:prose-pre:bg-gray-800 prose-pre:p-4 prose-pre:rounded 
            prose-pre:border prose-pre:border-gray-300 dark:prose-pre:border-gray-600 
            prose-pre:my-4 prose-code:bg-gray-100 dark:prose-code:bg-gray-800 
            prose-code:rounded prose-code:px-1 prose-code:py-0.5 prose-code:font-mono 
            prose-code:text-sm transition-opacity duration-300 ${
            hasRendered ? "opacity-100" : "opacity-0"
          } ${className}`}
          maxHeight={maxHeight}
          overflowY={maxHeight ? "auto" : "visible"}
          sx={{
            // Remove any background to use parent's background
            backgroundColor: "transparent !important",
            
            // Image enhancements
            "& .image-container": {
              textAlign: "center",
              margin: "2rem 0",
              "& img": {
                cursor: "zoom-in",
                transition: "all 0.3s ease",
                "&:hover": {
                  transform: "scale(1.02)",
                },
              },
              "& figcaption": {
                marginTop: "0.5rem",
                fontSize: "0.875rem",
                color: "gray.600",
                fontStyle: "italic",
              },
            },

            // Table enhancements
            "& .table-container": {
              overflowX: "auto",
              margin: "2rem 0",
            },

            // List enhancements for multi-level
            "& ul ul, & ol ol, & ul ol, & ol ul": {
              marginTop: "0.5rem",
              marginBottom: "0.5rem",
            },

            // Empty and error states
            "& .empty-state, & .error-state": {
              textAlign: "center",
              padding: "3rem 2rem",
              color: textColor,
              fontStyle: "italic",
            },
          }}
          dangerouslySetInnerHTML={{ __html: htmlContent }}
        />
      </Box>

      {/* Enhanced Image Modal with sidebar layout */}
      <Modal isOpen={isOpen} onClose={onClose} size="6xl" isCentered motionPreset="scale">
        <ModalOverlay bg="blackAlpha.800" />
        <ModalContent 
          bg="white"
          _dark={{ bg: "gray.800" }}
          maxW="90vw"
          maxH="90vh"
          margin="0"
          borderRadius="xl"
          overflow="hidden"
        >
          <ModalHeader 
            display="flex"
            alignItems="center"
            justifyContent="space-between"
            pb={3}
          >
            <Text fontSize="xl" fontWeight="bold">
              Image Preview
            </Text>
            <HStack spacing={2}>
              <Tooltip label="Download image">
                <IconButton
                  icon={<FaDownload />}
                  aria-label="Download image"
                  variant="ghost"
                  size="sm"
                  onClick={handleDownloadImage}
                />
              </Tooltip>
              <Tooltip label="Open in new tab">
                <IconButton
                  icon={<FaExternalLinkAlt />}
                  aria-label="Open in new tab"
                  variant="ghost"
                  size="sm"
                  onClick={handleOpenImage}
                />
              </Tooltip>
              <ModalCloseButton position="relative" top={0} right={0} />
            </HStack>
          </ModalHeader>
          <Divider />
          <ModalBody p={0} display="flex" flexDirection={{ base: "column", lg: "row" }}>
            {/* Image Panel */}
            <Box 
              flex="1" 
              display="flex" 
              alignItems="center" 
              justifyContent="center"
              p={6}
              bg="gray.50"
              _dark={{ bg: "gray.900" }}
            >
              {selectedImage && (
                <ChakraImage
                  src={selectedImage.src}
                  alt={selectedImage.alt}
                  maxH="70vh"
                  maxW="100%"
                  objectFit="contain"
                  borderRadius="lg"
                  shadow="xl"
                />
              )}
            </Box>

            {/* Description Sidebar */}
            <Box 
              width={{ base: "100%", lg: "400px" }}
              p={6}
              bg="white"
              _dark={{ bg: "gray.800", borderColor: "gray.600" }}
              borderLeft={{ base: "none", lg: "1px solid" }}
              borderColor="gray.200"

            >
              <VStack align="start" spacing={6} height="100%">
                <Box width="100%">
                  <Text fontSize="lg" fontWeight="semibold" mb={3} color="gray.700" _dark={{ color: "gray.200" }}>
                    Image Details
                  </Text>
                  
                  {/* Alt Text */}
                  {selectedImage?.alt && (
                    <Box mb={4}>
                      <Text fontSize="sm" fontWeight="medium" color="gray.600" _dark={{ color: "gray.400" }} mb={1}>
                        Description
                      </Text>
                      <Text color="gray.800" _dark={{ color: "gray.200" }}>
                        {selectedImage.alt}
                      </Text>
                    </Box>
                  )}

                  {/* Title */}
                  {selectedImage?.title && (
                    <Box mb={4}>
                      <Text fontSize="sm" fontWeight="medium" color="gray.600" _dark={{ color: "gray.400" }} mb={1}>
                        Title
                      </Text>
                      <Text color="gray.800" _dark={{ color: "gray.200" }}>
                        {selectedImage.title}
                      </Text>
                    </Box>
                  )}

                  {/* Image Info */}
                  <Box>
                    <Text fontSize="sm" fontWeight="medium" color="gray.600" _dark={{ color: "gray.400" }} mb={1}>
                      Image Information
                    </Text>
                    <VStack align="start" spacing={1}>
                      <Text fontSize="sm" color="gray.600" _dark={{ color: "gray.400" }}>
                        • Click and drag to pan
                      </Text>
                      <Text fontSize="sm" color="gray.600" _dark={{ color: "gray.400" }}>
                        • Scroll to zoom in/out
                      </Text>
                      <Text fontSize="sm" color="gray.600" _dark={{ color: "gray.400" }}>
                        • Click outside to close
                      </Text>
                    </VStack>
                  </Box>
                </Box>

                {/* Action Buttons */}
                <Box width="100%" mt="auto">
                  <VStack spacing={3}>
                    <Tooltip label="Download this image">
                      <Box width="100%">
                        <IconButton
                          icon={<FaDownload />}
                          aria-label="Download image"
                          width="100%"
                          onClick={handleDownloadImage}
                          colorScheme="blue"
                        >
                          Download Image
                        </IconButton>
                      </Box>
                    </Tooltip>
                    <Tooltip label="Open image in new tab">
                      <Box width="100%">
                        <IconButton
                          icon={<FaExternalLinkAlt />}
                          aria-label="Open in new tab"
                          width="100%"
                          onClick={handleOpenImage}
                          variant="outline"
                        >
                          Open in New Tab
                        </IconButton>
                      </Box>
                    </Tooltip>
                  </VStack>
                </Box>
              </VStack>
            </Box>
          </ModalBody>
          <ModalFooter>
            <Text fontSize="sm" color="gray.500">
              Use mouse wheel to zoom • Click and drag to pan
            </Text>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}
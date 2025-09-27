"use client";

import { useEditor, EditorContent, JSONContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import { Table } from "@tiptap/extension-table";
import TableRow from "@tiptap/extension-table-row";
import TableCell from "@tiptap/extension-table-cell";
import TableHeader from "@tiptap/extension-table-header";
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
} from "@chakra-ui/react";
import {
  BoldIcon,
  ItalicIcon,
  UnderlineIcon,
  LinkIcon,
  TableCellsIcon,
  ChevronDownIcon,
} from "@heroicons/react/24/outline";
import { useEffect } from "react";
import { ImageUpload, VideoUpload, AudioUpload } from "../extensions/media";

type Props = {
  value: string | JSONContent | null;
  onChange: (val: JSONContent) => void;
};

export default function RichTextEditor({ value, onChange }: Props) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({ openOnClick: true }),
      Image,
      Table.configure({ resizable: true }),
      TableRow,
      TableHeader,
      TableCell,
      ImageUpload,
      VideoUpload,
      AudioUpload,
    ],
    editorProps: {
      attributes: {
        class:
          "prose max-w-none focus:outline-none min-h-[150px] p-2 rounded-md",
      },
    },
    content: "",
    immediatelyRender: false,
  });

  // Load initial content safely
  useEffect(() => {
    if (!editor) return;
    try {
      if (typeof value === "string") {
        editor.commands.setContent(value, { emitUpdate: false });
      } else if (value && (value as any).type === "doc") {
        editor.commands.setContent(value, { emitUpdate: false });
      } else {
        editor.commands.clearContent();
      }
    } catch {
      editor.commands.clearContent();
    }
  }, [editor, value]);

  // Push editor updates
  useEffect(() => {
    if (!editor) return;
    const handler = () => onChange(editor.getJSON());
    editor.on("update", handler);

    return () => {
      editor.off("update", handler); // cleanup
    };
  }, [editor, onChange]);

  // Unified media upload dropdown handler
  const handleMediaUpload = (type: "image" | "video" | "audio") => {
    if (!editor) return;

    const input = document.createElement("input");
    input.type = "file";
    input.accept = `${type}/*`;
    input.onchange = async (e: Event) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      switch (type) {
        case "image":
          editor.commands.uploadImage({ file });
          break;
        case "video":
          editor.commands.uploadVideo({ file });
          break;
        case "audio":
          editor.commands.uploadAudio({ file });
          break;
      }
    };
    input.click();
  };

  return (
    <Box borderWidth={1} borderRadius="md" p={2} w="100%">
      {/* Toolbar */}
      {editor && (
        <HStack spacing={2} mb={2}>
          <Tooltip label="Bold">
            <IconButton
              aria-label="Bold"
              size="sm"
              icon={<BoldIcon />}
              onClick={() => editor.chain().focus().toggleBold().run()}
              isActive={editor.isActive("bold")}
            />
          </Tooltip>

          <Tooltip label="Italic">
            <IconButton
              aria-label="Italic"
              size="sm"
              icon={<ItalicIcon />}
              onClick={() => editor.chain().focus().toggleItalic().run()}
              isActive={editor.isActive("italic")}
            />
          </Tooltip>

          <Tooltip label="Underline">
            <IconButton
              aria-label="Underline"
              size="sm"
              icon={<UnderlineIcon />}
              onClick={() =>
                editor.chain().focus().toggleMark("underline").run()
              }
              isActive={editor.isActive("underline")}
            />
          </Tooltip>

          <Tooltip label="Insert Link">
            <IconButton
              aria-label="Link"
              size="sm"
              icon={<LinkIcon />}
              onClick={() => {
                const url = prompt("Enter URL");
                if (url) editor.chain().focus().setLink({ href: url }).run();
              }}
            />
          </Tooltip>

          <Tooltip label="Insert Table">
            <IconButton
              aria-label="Table"
              size="sm"
              icon={<TableCellsIcon />}
              onClick={() =>
                editor
                  .chain()
                  .focus()
                  .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
                  .run()
              }
            />
          </Tooltip>

          {/* Insert Media Dropdown */}
          <Menu>
            <MenuButton as={Button} rightIcon={<ChevronDownIcon />}>
              Insert Media
            </MenuButton>
            <MenuList>
              <MenuItem onClick={() => handleMediaUpload("image")}>
                Image
              </MenuItem>
              <MenuItem onClick={() => handleMediaUpload("video")}>
                Video
              </MenuItem>
              <MenuItem onClick={() => handleMediaUpload("audio")}>
                Audio
              </MenuItem>
            </MenuList>
          </Menu>
        </HStack>
      )}

      {/* Editor */}
      <Box
        borderWidth={1}
        borderRadius="md"
        minH="200px"
        p={2}
        _focusWithin={{ borderColor: "blue.400", shadow: "outline" }}
      >
        <EditorContent editor={editor} />
      </Box>
    </Box>
  );
}

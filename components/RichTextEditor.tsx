// components/RichTextEditor.tsx
"use client";

import { useEditor, EditorContent, JSONContent, Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import {Table} from "@tiptap/extension-table";
import TableRow from "@tiptap/extension-table-row";
import TableCell from "@tiptap/extension-table-cell";
import TableHeader from "@tiptap/extension-table-header";
import { Box } from "@chakra-ui/react";
import { useEffect } from "react";

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
    ],
    editorProps: { attributes: { class: "prose max-w-none focus:outline-none" } },
    content: "",
    immediatelyRender: false
  });

  // Load content into editor
  useEffect(() => {
    if (!editor) return;
    try {
      if (typeof value === "string") {
        editor.commands.setContent(value, { emitUpdate: false });
      } else if (value && typeof value === "object" && (value as any).type === "doc") {
        editor.commands.setContent(value, { emitUpdate: false });
      } else {
        editor.commands.clearContent();
      }
    } catch (err) {
      console.warn("Invalid TipTap content", err);
      editor.commands.clearContent();
    }
  }, [editor, value]);

  // Save on updates
  useEffect(() => {
    if (!editor) return;
    const handler = () => {
      onChange(editor.getJSON());
    };
    editor.on("update", handler);
    return () => {
      editor.off("update", handler);
    };
  }, [editor, onChange]);

  return (
    <Box borderWidth={1} borderRadius="md" p={2} w="100%">
      <EditorContent editor={editor} />
    </Box>
  );
}

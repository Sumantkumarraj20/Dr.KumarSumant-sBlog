"use client";

import { useEditor, EditorContent, JSONContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import { Table } from "@tiptap/extension-table";
import TableRow from "@tiptap/extension-table-row";
import TableCell from "@tiptap/extension-table-cell";
import TableHeader from "@tiptap/extension-table-header";
import { ImageUpload, VideoUpload, AudioUpload } from "../extensions/media";

export function RichTextView({ content }: { content: JSONContent | string | null }) {
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
    content: typeof content === "object" && content ? content : "",
    editable: false,
    immediatelyRender: false,
  });

  return (
    <div className="prose max-w-none p-2 rounded-md border border-gray-200">
      <EditorContent editor={editor} />
    </div>
  );
}

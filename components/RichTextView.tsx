import { useEditor, EditorContent, JSONContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";

export function RichTextView({ content }: { content: JSONContent }) {
  const editor = useEditor({
    extensions: [StarterKit],
    content,
    editable: false, 
    immediatelyRender: false
  });

  return <EditorContent editor={editor} />;
}

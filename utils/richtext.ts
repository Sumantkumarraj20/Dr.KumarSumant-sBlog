// utils/richtext.ts
import { generateHTML } from "@tiptap/html";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import { Table } from "@tiptap/extension-table";
import TableRow from "@tiptap/extension-table-row";
import TableCell from "@tiptap/extension-table-cell";
import TableHeader from "@tiptap/extension-table-header";
import { JSONContent } from "@tiptap/react";

const commonExtensions = [
  StarterKit,
  Link,
  Image,
  Table,
  TableRow,
  TableHeader,
  TableCell,
];

export function richTextToHTML(content: JSONContent): string {
  return generateHTML(content, commonExtensions);
}

// Optional Markdown export (requires prosemirror-markdown)
import { defaultMarkdownSerializer } from "prosemirror-markdown";
import { Node as ProseMirrorNode, Schema } from "prosemirror-model";

export function richTextToMarkdown(content: JSONContent, schema: Schema): string {
  const doc = ProseMirrorNode.fromJSON(schema, content);
  return defaultMarkdownSerializer.serialize(doc);
}

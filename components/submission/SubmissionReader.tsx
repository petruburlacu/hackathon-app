"use client";

import { EditorContent, useEditor, type JSONContent } from "@tiptap/react";
import { useEffect, useMemo } from "react";
import { editorExtensions } from "./editorExtensions";

export function SubmissionReader({ content }: { content: JSONContent }) {
  const extensions = useMemo(() => editorExtensions({ editable: false }), []);
  const editor = useEditor({
    extensions,
    content,
    editable: false,
    immediatelyRender: false,
  });

  useEffect(() => {
    if (editor && !editor.isDestroyed) {
      editor.commands.setContent(content, { emitUpdate: false });
    }
  }, [editor, content]);

  return <EditorContent editor={editor} className="submission-content" />;
}

"use client";

import {
  EditorContent,
  useEditor,
  useEditorState,
  type Editor,
  type JSONContent,
} from "@tiptap/react";
import { useCallback, useEffect, useMemo, useRef } from "react";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/errorMessage";
import { normaliseHref } from "@/lib/safeHref";
import { editorExtensions } from "./editorExtensions";
import { ImagePicker } from "./ImagePicker";
import { useImageUpload } from "./useImageUpload";
import { promptVideoUrl } from "./VideoNode";

type SubmissionEditorProps = {
  initialContent: JSONContent;
  onChange: (content: JSONContent) => void;
};

export function SubmissionEditor({
  initialContent,
  onChange,
}: SubmissionEditorProps) {
  const extensions = useMemo(() => editorExtensions({ editable: true }), []);
  const upload = useImageUpload();
  // editorProps are captured when the editor is created; the ref keeps the handlers current.
  const insertImages = useRef<(files: File[], at?: number) => void>(() => {});
  const editor = useEditor({
    extensions,
    content: initialContent,
    immediatelyRender: false,
    onUpdate: ({ editor }) => onChange(editor.getJSON()),
    editorProps: {
      handlePaste: (_view, event) => {
        const files = imageFiles(event.clipboardData);
        if (files.length === 0) return false;
        insertImages.current(files);
        return true;
      },
      handleDrop: (view, event, _slice, moved) => {
        if (moved) return false;
        const files = imageFiles(event.dataTransfer);
        if (files.length === 0) return false;
        const at = view.posAtCoords({
          left: event.clientX,
          top: event.clientY,
        })?.pos;
        insertImages.current(files, at);
        return true;
      },
    },
  });

  const insert = useCallback(
    (files: File[], at?: number) => {
      if (!editor) return;
      void (async () => {
        for (const file of files) {
          const toastId = toast.loading("Uploading image…");
          try {
            const storageId = await upload(file);
            // The trailing paragraph moves the cursor off the image; left selected, the next keystroke
            // or upload would replace it.
            const nodes = [
              { type: "image", attrs: { storageId, alt: "" } },
              { type: "paragraph" },
            ];
            const chain = editor.chain().focus();
            (at === undefined
              ? chain.insertContent(nodes)
              : chain.insertContentAt(at, nodes)
            ).run();
            toast.dismiss(toastId);
          } catch (error) {
            toast.error(
              getErrorMessage(
                error,
                "Could not upload the image. Please try again.",
              ),
              { id: toastId },
            );
          }
        }
      })();
    },
    [editor, upload],
  );
  useEffect(() => {
    insertImages.current = insert;
  }, [insert]);

  return (
    <div className="rounded-lg border border-cyan-400/30 bg-black/30">
      {editor && (
        <Toolbar editor={editor} onPickImage={(file) => insert([file])} />
      )}
      <EditorContent
        editor={editor}
        className="submission-content submission-content--editable px-4 py-3"
      />
    </div>
  );
}

function imageFiles(data: DataTransfer | null): File[] {
  return Array.from(data?.files ?? []).filter((file) =>
    file.type.startsWith("image/"),
  );
}

function editLink(editor: Editor) {
  const previous =
    (editor.getAttributes("link").href as string | undefined) ?? "";
  const input = window.prompt(
    "Paste the link address. Leave it empty to remove the link.",
    previous,
  );
  if (input === null) return;
  if (input.trim() === "") {
    editor.chain().focus().extendMarkRange("link").unsetLink().run();
    return;
  }
  const href = normaliseHref(input);
  if (!href) {
    toast.error("Links must start with http:// or https://");
    return;
  }
  if (editor.state.selection.empty && !editor.isActive("link")) {
    editor
      .chain()
      .focus()
      .insertContent({
        type: "text",
        text: href,
        marks: [{ type: "link", attrs: { href } }],
      })
      .run();
  } else {
    editor.chain().focus().extendMarkRange("link").setLink({ href }).run();
  }
}

function Toolbar({
  editor,
  onPickImage,
}: {
  editor: Editor;
  onPickImage: (file: File) => void;
}) {
  const state = useEditorState({
    editor,
    selector: ({ editor }) => ({
      bold: editor.isActive("bold"),
      italic: editor.isActive("italic"),
      h2: editor.isActive("heading", { level: 2 }),
      h3: editor.isActive("heading", { level: 3 }),
      bullets: editor.isActive("bulletList"),
      numbers: editor.isActive("orderedList"),
      link: editor.isActive("link"),
      canUndo: editor.can().undo(),
      canRedo: editor.can().redo(),
    }),
  });

  const buttons: Array<{
    label: string;
    title: string;
    active?: boolean;
    disabled?: boolean;
    run: () => void;
  }> = [
    {
      label: "B",
      title: "Bold",
      active: state.bold,
      run: () => editor.chain().focus().toggleBold().run(),
    },
    {
      label: "I",
      title: "Italic",
      active: state.italic,
      run: () => editor.chain().focus().toggleItalic().run(),
    },
    {
      label: "Heading",
      title: "Section heading",
      active: state.h2,
      run: () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
    },
    {
      label: "Subheading",
      title: "Smaller heading",
      active: state.h3,
      run: () => editor.chain().focus().toggleHeading({ level: 3 }).run(),
    },
    {
      label: "• List",
      title: "Bulleted list",
      active: state.bullets,
      run: () => editor.chain().focus().toggleBulletList().run(),
    },
    {
      label: "1. List",
      title: "Numbered list",
      active: state.numbers,
      run: () => editor.chain().focus().toggleOrderedList().run(),
    },
    {
      label: "Link",
      title: "Add or change a link",
      active: state.link,
      run: () => editLink(editor),
    },
    {
      label: "Add video",
      title: "Add a demo video link",
      run: () => {
        const url = promptVideoUrl();
        if (url) {
          const { $from } = editor.state.selection;
          // Insert after the current top-level block so headings and paragraphs aren't split.
          const at = $from.depth >= 1 ? $from.after(1) : editor.state.selection.to;
          editor
            .chain()
            .focus()
            // The trailing paragraph moves the cursor past the video, so the next insert doesn't replace it.
            .insertContentAt(at, [
              { type: "video", attrs: { url } },
              { type: "paragraph" },
            ])
            .run();
        }
      },
    },
    {
      label: "Undo",
      title: "Undo",
      disabled: !state.canUndo,
      run: () => editor.chain().focus().undo().run(),
    },
    {
      label: "Redo",
      title: "Redo",
      disabled: !state.canRedo,
      run: () => editor.chain().focus().redo().run(),
    },
  ];

  return (
    <div
      role="toolbar"
      aria-label="Formatting"
      className="flex flex-wrap gap-1 border-b border-cyan-400/20 p-2"
    >
      {buttons.map((button) => (
        <button
          key={button.label}
          type="button"
          title={button.title}
          aria-pressed={button.active}
          disabled={button.disabled}
          onClick={button.run}
          className={`rounded px-2.5 py-1 text-sm transition-colors disabled:opacity-40 ${
            button.active
              ? "bg-yellow-400 text-black"
              : "text-gray-100 hover:bg-white/10"
          } ${button.label === "B" ? "font-bold" : ""} ${button.label === "I" ? "italic" : ""}`}
        >
          {button.label}
        </button>
      ))}
      <ImagePicker
        label="Image"
        onPick={onPickImage}
        className="h-auto border-0 bg-transparent px-2.5 py-1 text-sm font-normal text-gray-100 hover:bg-white/10 hover:text-gray-100"
      />
    </div>
  );
}

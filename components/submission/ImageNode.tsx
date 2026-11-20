"use client";

import {
  mergeAttributes,
  Node,
  NodeViewWrapper,
  ReactNodeViewRenderer,
  type NodeViewProps,
} from "@tiptap/react";
import type { Id } from "../../convex/_generated/dataModel";
import { StoredImage } from "./StoredImage";

// Stores only the storage ID: URLs are resolved at render time, so the document never holds a Convex URL.
export const ImageNode = Node.create({
  name: "image",
  group: "block",
  atom: true,
  draggable: true,

  addAttributes() {
    return {
      storageId: {
        default: null,
        parseHTML: (element) => element.getAttribute("data-storage-id"),
        renderHTML: (attributes) => ({
          "data-storage-id": attributes.storageId as string | null,
        }),
      },
      alt: {
        default: "",
        parseHTML: (element) => element.getAttribute("alt") ?? "",
      },
    };
  },

  parseHTML() {
    return [{ tag: "img[data-storage-id]" }];
  },

  renderHTML({ HTMLAttributes }) {
    return ["img", mergeAttributes(HTMLAttributes)];
  },

  addNodeView() {
    return ReactNodeViewRenderer(ImageView);
  },
});

function ImageView({
  node,
  editor,
  selected,
  updateAttributes,
}: NodeViewProps) {
  const storageId = node.attrs.storageId as Id<"_storage"> | null;
  const alt = node.attrs.alt as string;

  return (
    <NodeViewWrapper
      className={`my-4 ${selected && editor.isEditable ? "rounded-md ring-2 ring-yellow-400" : ""}`}
    >
      {storageId ? (
        <StoredImage
          storageId={storageId}
          alt={alt}
          sizes="(max-width: 768px) 100vw, 768px"
        />
      ) : null}
      {editor.isEditable && (
        <input
          type="text"
          value={alt}
          maxLength={200}
          placeholder="Describe this image for screen readers"
          aria-label="Image description"
          onChange={(event) => updateAttributes({ alt: event.target.value })}
          className="mt-2 w-full rounded border border-cyan-400/30 bg-black/30 px-2 py-1 text-sm text-gray-100"
        />
      )}
    </NodeViewWrapper>
  );
}

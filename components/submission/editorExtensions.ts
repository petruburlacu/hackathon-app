import type { Extensions } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Placeholder } from "@tiptap/extensions";
import { isSafeHref } from "../../lib/safeHref";
import { TEMPLATE_SECTIONS } from "./template";
import { Video } from "./VideoNode";

const HINTS = new Map<string, string>(
  TEMPLATE_SECTIONS.map(({ heading, hint }) => [heading, hint]),
);

// One list for both the editor and the read-only view, so stored content always renders the same way.
export function editorExtensions({
  editable,
}: {
  editable: boolean;
}): Extensions {
  return [
    StarterKit.configure({
      heading: { levels: [2, 3] },
      link: {
        openOnClick: !editable,
        autolink: true,
        defaultProtocol: "https",
        // Replaces Tiptap's default allowlist (which also admits mailto:, tel: and relative URLs).
        // Link's renderHTML calls this too, so stored hrefs are re-checked on every render.
        isAllowedUri: (url) => isSafeHref(url),
        shouldAutoLink: (url) => isSafeHref(url),
      },
    }),
    Placeholder.configure({
      showOnlyCurrent: false,
      placeholder: ({ editor, node, pos }) => {
        if (node.type.name === "heading") return "Section heading";
        const { doc } = editor.state;
        const $pos = doc.resolve(pos);
        if ($pos.depth !== 0) return "";
        const index = $pos.index();
        const previous = index > 0 ? doc.child(index - 1) : null;
        if (previous?.type.name !== "heading") return "";
        return HINTS.get(previous.textContent.trim()) ?? "Write here…";
      },
    }),
    // Image (PR 4) and video (PR 5) nodes register here.
    Video,
  ];
}

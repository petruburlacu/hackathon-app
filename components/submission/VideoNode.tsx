"use client";

import {
  mergeAttributes,
  Node,
  NodeViewWrapper,
  ReactNodeViewRenderer,
  type NodeViewProps,
} from "@tiptap/react";
import type { DOMOutputSpec } from "@tiptap/pm/model";
import { toast } from "sonner";
import { normaliseHref } from "../../lib/safeHref";
import { parseVideoUrl, type ParsedVideo } from "../../lib/parseVideoUrl";

const IFRAME_SANDBOX =
  "allow-scripts allow-same-origin allow-presentation allow-popups allow-popups-to-escape-sandbox";
const UNSUPPORTED = "Unsupported video link";
const MAX_LENGTH = "Demo videos: 5 minutes max.";
const SHARING_REMINDER = "Check sharing is set to People in Opus 2.";

// Asks for a link and turns what was typed into a supported video URL, or explains why not.
export function promptVideoUrl(previous = ""): string | null {
  const input = window.prompt(
    "Paste a YouTube, Loom, Vimeo, SharePoint or Stream video link.",
    previous,
  );
  if (input === null || input.trim() === "") return null;
  const url = normaliseHref(input);
  if (!url || !parseVideoUrl(url)) {
    toast.error(UNSUPPORTED);
    return null;
  }
  return url;
}

export const Video = Node.create({
  name: "video",
  group: "block",
  atom: true,

  addAttributes() {
    return {
      url: {
        default: null,
        parseHTML: (element) => element.getAttribute("data-url"),
        renderHTML: (attributes) => ({ "data-url": attributes.url }),
      },
    };
  },

  parseHTML() {
    return [{ tag: "div[data-video]" }];
  },

  // Used for copy and paste and static rendering. As in the NodeView, every src and href comes from parseVideoUrl.
  renderHTML({ node, HTMLAttributes }) {
    const attrs = mergeAttributes(HTMLAttributes, { "data-video": "" });
    const video = parseVideoUrl(String(node.attrs.url ?? ""));
    let inner: DOMOutputSpec;
    if (video?.kind === "embed") {
      inner = [
        "iframe",
        { src: video.src, sandbox: IFRAME_SANDBOX, title: "Demo video" },
      ];
    } else if (video?.kind === "link") {
      inner = [
        "a",
        { href: video.href, target: "_blank", rel: "noopener noreferrer" },
        "Watch the demo",
      ];
    } else {
      inner = ["p", {}, UNSUPPORTED];
    }
    return ["div", attrs, inner];
  },

  addNodeView() {
    return ReactNodeViewRenderer(VideoView);
  },
});

function VideoView({
  node,
  editor,
  updateAttributes,
  deleteNode,
}: NodeViewProps) {
  const url = String(node.attrs.url ?? "");
  const video = parseVideoUrl(url);
  const editable = editor.isEditable;

  const changeLink = () => {
    const next = promptVideoUrl(url);
    if (next) updateAttributes({ url: next });
  };

  return (
    <NodeViewWrapper className="my-4" data-video="">
      <VideoOutput video={video} />
      {editable && (
        <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-gray-300">
          {video?.kind === "link" && (
            <p className="w-full font-semibold text-yellow-300">
              {SHARING_REMINDER}
            </p>
          )}
          <span className="min-w-0 flex-1 truncate" title={url}>
            {url}
          </span>
          <button
            type="button"
            onClick={changeLink}
            className="rounded px-2 py-1 text-cyan-300 hover:bg-white/10"
          >
            Change link
          </button>
          <button
            type="button"
            onClick={deleteNode}
            className="rounded px-2 py-1 text-red-300 hover:bg-white/10"
          >
            Remove video
          </button>
        </div>
      )}
    </NodeViewWrapper>
  );
}

function VideoOutput({ video }: { video: ParsedVideo | null }) {
  if (video?.kind === "embed") {
    return (
      <div className="aspect-video w-full overflow-hidden rounded-lg bg-black">
        <iframe
          src={video.src}
          sandbox={IFRAME_SANDBOX}
          title="Demo video"
          loading="lazy"
          allow="fullscreen; picture-in-picture; encrypted-media"
          allowFullScreen
          className="h-full w-full border-0"
        />
      </div>
    );
  }
  if (video?.kind === "link") {
    return (
      <a
        href={video.href}
        target="_blank"
        rel="noopener noreferrer"
        className="video-card block rounded-lg border border-cyan-400/40 bg-cyan-400/10 p-6 transition-colors hover:bg-cyan-400/20"
      >
        <span className="block text-xl font-semibold text-yellow-400">
          ▶ Watch the demo
        </span>
        <span className="mt-1 block text-sm text-gray-300">
          Opens in a new tab. {MAX_LENGTH}
        </span>
      </a>
    );
  }
  return (
    <p
      role="alert"
      className="rounded-lg border border-red-400/40 bg-red-500/10 p-3 text-sm text-red-200"
    >
      {UNSUPPORTED}
    </p>
  );
}

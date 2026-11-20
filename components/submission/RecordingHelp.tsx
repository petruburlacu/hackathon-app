"use client";

import * as Popover from "@radix-ui/react-popover";

const TOP_TOOLS = [
  {
    name: "Microsoft Stream screen recorder",
    tip: (
      <>
        Go to{" "}
        <a
          href="https://stream.office.com"
          target="_blank"
          rel="noopener noreferrer"
          className="text-cyan-300 underline"
        >
          stream.office.com
        </a>
        , choose <strong>Create new</strong>, then{" "}
        <strong>Screen recording</strong>. It records your screen, camera and
        mic, and saves to your OneDrive.
      </>
    ),
  },
  {
    name: "Teams",
    tip: "Start a meeting with just your team, share your screen and record. The recording is saved to OneDrive or SharePoint.",
  },
  {
    name: "PowerPoint",
    tip: "Use the Record tab to talk over your slides and a live demo, then export it as a video.",
  },
];

const MORE_TOOLS = [
  {
    name: "Built into your computer",
    tip: "Mac: press Cmd+Shift+5. Windows: open Snipping Tool and press Win+Shift+R. Then upload the file to OneDrive and share the link.",
  },
  {
    name: "Loom (free plan)",
    tip: "The free plan stops at 5 minutes, which matches our rule. Your video is stored with Loom, outside Opus 2.",
  },
  {
    name: "OBS Studio",
    tip: "Free and powerful, but harder to learn. Best if you already know it.",
  },
];

export function RecordingHelp() {
  return (
    <Popover.Root>
      <Popover.Trigger className="inline-flex items-center gap-1 rounded-md px-1 text-cyan-300 underline underline-offset-2 hover:text-yellow-400">
        <span aria-hidden="true">?</span> How to record your demo
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          sideOffset={8}
          collisionPadding={16}
          className="z-50 w-[min(26rem,calc(100vw-2rem))] rounded-xl border border-cyan-400/30 bg-slate-900 p-5 text-sm text-gray-100 shadow-xl"
        >
          <h3 className="text-base font-semibold text-yellow-400">
            How to record your demo
          </h3>
          <ol className="mt-3 list-decimal space-y-3 pl-5">
            {TOP_TOOLS.map((tool) => (
              <li key={tool.name}>
                <span className="font-semibold">{tool.name}.</span> {tool.tip}
              </li>
            ))}
          </ol>
          <p className="mt-4 font-semibold text-yellow-300">
            Check sharing is set to People in Opus 2.
          </p>
          <p className="mt-1">Demo videos: 5 minutes max.</p>
          <p className="mt-1 text-gray-300">
            When it&apos;s ready, paste the link in the Demo section.
          </p>
          <details className="mt-4">
            <summary className="cursor-pointer text-cyan-300 hover:text-yellow-400">
              More options
            </summary>
            <ul className="mt-3 space-y-3">
              {MORE_TOOLS.map((tool) => (
                <li key={tool.name}>
                  <span className="font-semibold">{tool.name}.</span> {tool.tip}
                </li>
              ))}
            </ul>
          </details>
          <Popover.Arrow className="fill-slate-900" />
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}

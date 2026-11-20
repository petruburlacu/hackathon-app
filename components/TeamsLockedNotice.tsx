import { LockClosedIcon } from "@radix-ui/react-icons";
import { TEAMS_LOCKED_MESSAGE } from "@/lib/eventPhase";

export function TeamsLockedNotice({ className = "" }: { className?: string }) {
  return (
    <p
      className={`flex items-center gap-2 rounded-lg border border-yellow-400/30 bg-yellow-500/10 px-3 py-2 text-sm text-yellow-200 ${className}`}
    >
      <LockClosedIcon className="h-4 w-4 shrink-0" />
      {TEAMS_LOCKED_MESSAGE}.
    </p>
  );
}

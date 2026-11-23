import { splitLinks } from "@/lib/linkify";

export function AnnouncementBody({
  body,
  className = "",
}: {
  body: string;
  className?: string;
}) {
  return (
    <p className={`whitespace-pre-line break-words ${className}`}>
      {splitLinks(body).map((part, index) =>
        part.kind === "link" ? (
          <a
            key={index}
            href={part.value}
            target="_blank"
            rel="noopener noreferrer"
            className="text-yellow-300 underline underline-offset-2 hover:text-yellow-400"
          >
            {part.value}
          </a>
        ) : (
          <span key={index}>{part.value}</span>
        ),
      )}
    </p>
  );
}

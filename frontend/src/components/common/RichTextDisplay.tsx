import { cn } from "@/lib/utils";

interface RichTextDisplayProps {
  content: string;
  className?: string;
}

function decodeHtmlEntities(text: string): string {
  const textarea = document.createElement("textarea");
  textarea.innerHTML = text;
  return textarea.value;
}

export function RichTextDisplay({ content, className }: RichTextDisplayProps) {
  if (!content) {
    return null;
  }

  return (
    <div
      className={cn("rich-text-content", className)}
      dangerouslySetInnerHTML={{ __html: decodeHtmlEntities(content) }}
    />
  );
}

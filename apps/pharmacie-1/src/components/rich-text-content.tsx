import sanitizeHtml from "sanitize-html";

interface RichTextContentProps {
  content: string;
  className?: string;
}

const ALLOWED_TAGS = [
  "p",
  "br",
  "strong",
  "em",
  "u",
  "a",
  "h2",
  "h3",
  "ul",
  "ol",
  "li",
  "blockquote",
];

const CONTENT_CLASSNAME =
  "space-y-4 text-sm leading-relaxed text-slate-600 " +
  "[&_a]:font-medium [&_a]:text-brand-700 [&_a]:underline [&_a]:underline-offset-2 " +
  "[&_blockquote]:border-l-2 [&_blockquote]:border-line [&_blockquote]:pl-4 [&_blockquote]:italic " +
  "[&_h2]:text-xl [&_h2]:font-bold [&_h2]:text-foreground " +
  "[&_h3]:text-lg [&_h3]:font-semibold [&_h3]:text-foreground " +
  "[&_li]:ml-5 [&_li]:pl-1 [&_ul_li]:list-disc [&_ol_li]:list-decimal " +
  "[&_strong]:font-semibold [&_strong]:text-foreground";

export function RichTextContent({ content, className }: RichTextContentProps) {
  const clean = sanitizeHtml(content, {
    allowedTags: ALLOWED_TAGS,
    allowedAttributes: {
      a: ["href", "target", "rel"],
    },
  });

  return (
    <div
      className={className ? `${CONTENT_CLASSNAME} ${className}` : CONTENT_CLASSNAME}
      dangerouslySetInnerHTML={{ __html: clean }}
    />
  );
}

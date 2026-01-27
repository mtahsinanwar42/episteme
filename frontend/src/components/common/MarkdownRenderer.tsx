import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface MarkdownRendererProps {
  content: string;
}

export function MarkdownRenderer({ content }: MarkdownRendererProps) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      //   className="prose prose-slate max-w-none"
      components={{
        h2: ({ children }) => (
          <h2 className="font-semibold text-foreground mt-8 mb-4 first:mt-0">
            {children}
          </h2>
        ),
        h3: ({ children }) => (
          <h3 className="font-semibold text-foreground mt-6 mb-3">
            {children}
          </h3>
        ),
        h4: ({ children }) => (
          <h4 className="font-semibold text-foreground mt-4 mb-2">
            {children}
          </h4>
        ),
        p: ({ children }) => (
          <p className="text-slate-700 leading-relaxed mb-4">{children}</p>
        ),
        strong: ({ children }) => (
          <strong className="font-semibold text-foreground">{children}</strong>
        ),
        ul: ({ children }) => (
          <ul className="list-disc list-inside space-y-2 mb-4 text-foreground">
            {children}
          </ul>
        ),
        ol: ({ children }) => (
          <ol className="list-decimal list-inside space-y-2 mb-4 text-foreground">
            {children}
          </ol>
        ),
        li: ({ children }) => (
          <li className="ml-4 leading-relaxed">{children}</li>
        ),
        blockquote: ({ children }) => (
          <blockquote className="border-l-4 border-accent bg-slate-50 pl-4 py-2 my-4 italic text-slate-700">
            {children}
          </blockquote>
        ),
        code: ({ className, children, ...props }) => {
          const isInline = !className;
          if (isInline) {
            return (
              <code
                className="bg-slate-100 text-accent px-1.5 py-0.5 rounded text-sm font-mono"
                {...props}
              >
                {children}
              </code>
            );
          }
          return (
            <code
              className={`${className} block bg-slate-900 text-slate-100 p-4 rounded-lg overflow-x-auto text-sm font-mono my-4`}
              {...props}
            >
              {children}
            </code>
          );
        },
        pre: ({ children }) => <pre className="my-4">{children}</pre>,
        a: ({ children, href }) => (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent hover:underline font-medium"
          >
            {children}
          </a>
        ),
      }}
    >
      {content}
    </ReactMarkdown>
  );
}

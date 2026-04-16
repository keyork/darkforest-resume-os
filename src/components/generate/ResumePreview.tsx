'use client';

import type { Components } from 'react-markdown';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { ScrollArea } from '@/components/ui/scroll-area';

interface ResumePreviewProps {
  content: string;
}

const markdownComponents: Components = {
  h1: ({ children }) => <h1>{children}</h1>,
  h2: ({ children }) => <h2>{children}</h2>,
  h3: ({ children }) => <h3>{children}</h3>,
  p: ({ children }) => <p>{children}</p>,
  ul: ({ children }) => <ul>{children}</ul>,
  ol: ({ children }) => <ol>{children}</ol>,
  li: ({ children }) => <li>{children}</li>,
  blockquote: ({ children }) => <blockquote>{children}</blockquote>,
  hr: () => <hr />,
  a: ({ href, children }) => (
    <a href={href} target="_blank" rel="noreferrer">
      {children}
    </a>
  ),
  code: ({ className, children }) => {
    const isInline = !className;

    if (isInline) {
      return <code>{children}</code>;
    }

    return (
      <pre>
        <code className={className}>{children}</code>
      </pre>
    );
  },
  table: ({ children }) => (
    <div className="resume-markdown-table-wrap">
      <table>{children}</table>
    </div>
  ),
};

export function ResumePreview({ content }: ResumePreviewProps) {
  return (
    <ScrollArea className="h-full">
      <div className="p-4 sm:p-6">
        <article className="resume-markdown rounded-[28px] border border-border/70 bg-[linear-gradient(180deg,hsl(var(--surface-strong)/0.96),hsl(var(--card)/0.92))] p-5 shadow-[0_24px_70px_hsl(var(--shadow-color)/0.14)] sm:p-8">
          <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
            {content}
          </ReactMarkdown>
        </article>
      </div>
    </ScrollArea>
  );
}

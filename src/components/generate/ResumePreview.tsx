'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { ScrollArea } from '@/components/ui/scroll-area';

interface ResumePreviewProps {
  content: string;
}

export function ResumePreview({ content }: ResumePreviewProps) {
  return (
    <ScrollArea className="h-full">
      <div className="prose prose-sm max-w-none p-6 dark:prose-invert prose-headings:font-bold prose-h1:text-xl prose-h2:text-base prose-h2:border-b prose-h2:pb-1 prose-h2:mb-2 prose-ul:my-1 prose-li:my-0.5">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
      </div>
    </ScrollArea>
  );
}

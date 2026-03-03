'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Copy, Download, Check } from 'lucide-react';

interface ExportButtonsProps {
  content: string;
  filename?: string;
}

export function ExportButtons({ content, filename = 'resume' }: ExportButtonsProps) {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    navigator.clipboard.writeText(content).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  function handleDownloadMd() {
    const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}.md`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="flex gap-2">
      <Button variant="outline" size="sm" onClick={handleCopy}>
        {copied ? (
          <>
            <Check className="h-4 w-4 mr-1.5 text-green-600" />
            已复制
          </>
        ) : (
          <>
            <Copy className="h-4 w-4 mr-1.5" />
            复制 Markdown
          </>
        )}
      </Button>
      <Button variant="outline" size="sm" onClick={handleDownloadMd}>
        <Download className="h-4 w-4 mr-1.5" />
        下载 .md
      </Button>
    </div>
  );
}

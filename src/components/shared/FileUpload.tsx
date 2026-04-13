'use client';

import { useRef, useState, DragEvent, ChangeEvent } from 'react';
import { cn } from '@/lib/utils';
import { Upload, FileText, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface FileUploadProps {
  onFile: (file: File) => void;
  accept?: string;
  className?: string;
  disabled?: boolean;
}

const DEFAULT_ACCEPT = '.pdf,.docx,.txt';

export function FileUpload({
  onFile,
  accept = DEFAULT_ACCEPT,
  className,
  disabled = false,
}: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  function handleFile(file: File) {
    setSelectedFile(file);
    onFile(file);
  }

  function handleDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  }

  return (
    <div
      className={cn(
        'relative border-2 border-dashed rounded-lg transition-colors',
        isDragging ? 'border-primary bg-primary/5' : 'border-border',
        disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-primary/50',
        className
      )}
      onDragOver={(e) => { e.preventDefault(); if (!disabled) setIsDragging(true); }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={disabled ? undefined : handleDrop}
      onClick={() => !disabled && inputRef.current?.click()}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={handleChange}
        disabled={disabled}
      />

      <div className="flex flex-col items-center justify-center gap-3 py-10 px-6 text-center">
        {selectedFile ? (
          <>
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <FileText className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="font-medium text-sm">{selectedFile.name}</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {(selectedFile.size / 1024).toFixed(1)} KB
              </p>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedFile(null);
              }}
              className="text-xs"
            >
              <X className="h-3 w-3 mr-1" />
              重新选择
            </Button>
          </>
        ) : (
          <>
            <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
              <Upload className="h-5 w-5 text-muted-foreground" />
            </div>
            <div>
              <p className="font-medium text-sm">拖拽文件到此处，或点击选择</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                支持 PDF、DOCX、TXT 格式
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

import { createRequire } from 'node:module';
import mammoth from 'mammoth';

const require = createRequire(import.meta.url);

export type SupportedMimeType =
  | 'application/pdf'
  | 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  | 'text/plain'
  | 'text/markdown';

export async function parseFileToText(
  buffer: Buffer,
  mimeType: string
): Promise<string> {
  const mime = mimeType.toLowerCase();

  if (mime === 'application/pdf') {
    const { PDFParse } = require('pdf-parse') as {
      PDFParse: new (options: { data: Buffer }) => {
        getText: () => Promise<{ text?: string }>;
        destroy: () => Promise<void>;
      };
    };
    const parser = new PDFParse({ data: buffer });

    try {
      const result = await parser.getText();
      return result.text ?? '';
    } finally {
      await parser.destroy();
    }
  }

  if (mime === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
    const result = await mammoth.extractRawText({ buffer });
    return result.value ?? '';
  }

  if (mime === 'application/msword') {
    throw new Error('Legacy .doc files are not supported. Please convert the file to .docx, .pdf, .txt, or .md first.');
  }

  if (mime === 'text/plain' || mime.startsWith('text/')) {
    return buffer.toString('utf-8');
  }

  throw new Error(`Unsupported file type: ${mimeType}`);
}

export function getFileMimeType(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase() ?? '';
  const mimeMap: Record<string, string> = {
    pdf: 'application/pdf',
    docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    doc: 'application/msword',
    txt: 'text/plain',
    md: 'text/markdown',
    markdown: 'text/markdown',
  };
  return mimeMap[ext] ?? 'text/plain';
}

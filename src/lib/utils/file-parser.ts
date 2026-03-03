import mammoth from 'mammoth';

export type SupportedMimeType =
  | 'application/pdf'
  | 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  | 'application/msword'
  | 'text/plain';

export async function parseFileToText(
  buffer: Buffer,
  mimeType: string
): Promise<string> {
  const mime = mimeType.toLowerCase();

  if (mime === 'application/pdf') {
    // Dynamic import to avoid SSR issues with pdf-parse (ESM package)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const pdfParseModule = await import('pdf-parse') as any;
    const pdfParse = pdfParseModule.default ?? pdfParseModule;
    const result = await pdfParse(buffer);
    return result.text ?? '';
  }

  if (
    mime === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
    mime === 'application/msword'
  ) {
    const result = await mammoth.extractRawText({ buffer });
    return result.value ?? '';
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
  };
  return mimeMap[ext] ?? 'text/plain';
}

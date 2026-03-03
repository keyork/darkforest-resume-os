export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { parseProfileFromText } from '@/lib/ai/agents/profile-agent';
import { parseFileToText, getFileMimeType } from '@/lib/utils/file-parser';

export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get('content-type') ?? '';
    let rawText = '';

    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      const file = formData.get('file') as File | null;
      const text = formData.get('text') as string | null;

      if (file) {
        const buffer = Buffer.from(await file.arrayBuffer());
        const mimeType = file.type || getFileMimeType(file.name);
        rawText = await parseFileToText(buffer, mimeType);
      } else if (text) {
        rawText = text;
      } else {
        return NextResponse.json({ error: 'No file or text provided' }, { status: 400 });
      }
    } else {
      // JSON body with { text }
      const body = await request.json();
      rawText = body.text ?? '';
    }

    if (!rawText.trim()) {
      return NextResponse.json({ error: 'Empty content' }, { status: 400 });
    }

    // Call Profile Agent
    const parsed = await parseProfileFromText(rawText);

    return NextResponse.json({ rawText, parsed });
  } catch (error) {
    console.error('[POST /api/profile/import]', error);
    return NextResponse.json(
      { error: 'Failed to parse resume', details: String(error) },
      { status: 500 }
    );
  }
}

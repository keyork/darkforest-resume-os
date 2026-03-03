'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Upload } from 'lucide-react';
import { ImportModal } from './ImportModal';

export function ImportModalTrigger() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button variant="outline" onClick={() => setOpen(true)}>
        <Upload className="h-4 w-4 mr-2" />
        从简历导入
      </Button>
      <ImportModal open={open} onOpenChange={setOpen} />
    </>
  );
}

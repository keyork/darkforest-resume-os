export const dynamic = 'force-dynamic';

import { ProfileHeader } from '@/components/profile/ProfileHeader';
import { ItemTabs } from '@/components/profile/ItemTabs';
import { ImportModalTrigger } from '@/components/profile/ImportModalTrigger';
import { Upload } from 'lucide-react';

export default function ProfilePage() {
  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">我的档案</h1>
          <p className="text-sm text-muted-foreground mt-1">
            管理你的技能、经历、项目、教育和证书
          </p>
        </div>
        <ImportModalTrigger />
      </div>

      <ProfileHeader />

      <div className="border rounded-lg p-4">
        <ItemTabs />
      </div>
    </div>
  );
}

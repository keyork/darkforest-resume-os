import type { Metadata } from 'next';
import { Space_Grotesk } from 'next/font/google';
import './globals.css';
import { AgentTaskRail } from '@/components/agent/AgentTaskRail';
import { Sidebar } from '@/components/layout/Sidebar';
import { Providers } from '@/components/Providers';
import { Toaster } from '@/components/ui/sonner';

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space-grotesk',
});

export const metadata: Metadata = {
  title: 'darkforest resume os',
  description: '可计算、可匹配、可优化的智能简历 Agent 系统',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh" suppressHydrationWarning>
      <body className={`${spaceGrotesk.variable} h-screen overflow-hidden font-sans antialiased`}>
        <Providers>
          <div className="flex h-screen flex-col overflow-hidden lg:flex-row">
            <Sidebar />
            <main className="flex min-h-0 min-w-0 flex-1 overflow-y-auto overscroll-contain">
              {children}
            </main>
            <AgentTaskRail />
          </div>
          <Toaster richColors position="top-right" />
        </Providers>
      </body>
    </html>
  );
}

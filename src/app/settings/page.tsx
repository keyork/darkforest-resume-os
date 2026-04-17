'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { AlertTriangle, CheckCircle2, ExternalLink, KeyRound, Loader2, Orbit, ServerCog, ShieldAlert, Sparkles, Wifi, XCircle } from 'lucide-react';
import { testAIConnection } from '@/lib/ai/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  clearAISettings,
  DEFAULT_AI_MODEL,
  getAIClientConfigFromSettings,
  getStoredAISettings,
  hasStoredAISettings,
  saveAISettings,
} from '@/lib/client/ai-settings';
import { enterDemoMode } from '@/lib/client/demo-mode';
import { useDemoMode } from '@/lib/hooks/useDemoMode';
import { useExitDemoModeToOverview } from '@/lib/hooks/useExitDemoModeToOverview';

const PROVIDER_GUIDES = [
  {
    name: 'Moonshot / Kimi',
    url: 'https://platform.moonshot.cn/',
    apiKeyHint: '登录 Moonshot 开放平台后，在控制台创建 API Key。',
    baseUrlHint: '常见 Base URL 示例：`https://api.moonshot.cn/v1`',
    modelHint: '常见模型名示例：`kimi-k2.5`、`moonshot-v1-8k`。以你控制台实际可用模型为准。',
  },
  {
    name: 'OpenAI',
    url: 'https://platform.openai.com/',
    apiKeyHint: '登录 OpenAI Platform 后，在 API Keys 页面创建密钥。',
    baseUrlHint: '常见 Base URL 示例：`https://api.openai.com/v1`',
    modelHint: '常见模型名示例：`gpt-4.1`、`gpt-4o-mini`。请使用你账号下可调用的模型。',
  },
  {
    name: '其他 OpenAI 兼容服务',
    url: '',
    apiKeyHint: '前往对应服务商控制台创建密钥。',
    baseUrlHint: '请填写该服务文档提供的兼容接口地址，通常以 `/v1` 结尾。',
    modelHint: '模型名通常在服务商文档的“Models”或“示例请求”页面里可以找到。',
  },
];

export default function SettingsPage() {
  const [apiKey, setApiKey] = useState('');
  const [baseURL, setBaseURL] = useState('');
  const [modelName, setModelName] = useState(DEFAULT_AI_MODEL);
  const [mounted, setMounted] = useState(false);

  type TestState = 'idle' | 'loading' | 'ok' | 'error';
  const [testState, setTestState] = useState<TestState>('idle');
  const [testDialogOpen, setTestDialogOpen] = useState(false);
  const [testModel, setTestModel] = useState('');
  const [testMessage, setTestMessage] = useState('');
  const { isDemoMode, hasBackup } = useDemoMode();
  const exitDemoModeToOverview = useExitDemoModeToOverview();

  useEffect(() => {
    const settings = getStoredAISettings();
    setApiKey(settings.apiKey);
    setBaseURL(settings.baseURL);
    setModelName(settings.modelName);
    setMounted(true);
  }, []);

  const isConfigured = mounted && hasStoredAISettings({ apiKey, baseURL, modelName });

  function handleSave() {
    if (!apiKey.trim() || !baseURL.trim()) {
      toast.error('请同时填写 API Key 和 Base URL');
      return;
    }

    saveAISettings({
      apiKey: apiKey.trim(),
      baseURL: baseURL.trim(),
      modelName: modelName.trim() || DEFAULT_AI_MODEL,
    });
    toast.success('AI 设置已保存到当前浏览器');
  }

  async function handleTest() {
    if (!apiKey.trim() || !baseURL.trim()) {
      toast.error('请先填写 API Key 和 Base URL');
      return;
    }
    setTestState('loading');
    setTestDialogOpen(true);
    setTestMessage('');
    setTestModel('');
    try {
      const result = await testAIConnection(
        getAIClientConfigFromSettings({
          apiKey,
          baseURL,
          modelName,
        }),
      );

      setTestState('ok');
      setTestModel(result.model);
      setTestMessage(result.reply || 'OK');
    } catch (e) {
      setTestState('error');
      setTestMessage((e as Error).message);
    }
  }

  function handleClear() {
    clearAISettings();
    setApiKey('');
    setBaseURL('');
    setModelName(DEFAULT_AI_MODEL);
    toast.success('已清空当前浏览器中的 AI 设置');
  }

  function handleEnterDemoMode() {
    enterDemoMode();
    toast.success('已进入示例环境');
  }

  function handleExitDemoMode() {
    exitDemoModeToOverview();
    toast.success(hasBackup ? '已退出示例环境，并恢复你原来的本地工作区' : '已退出示例环境，并清空示例数据');
  }

  return (
    <div className="page-shell page-stack">
      <section className="surface-panel page-hero">
        <div className="absolute -right-10 top-2 h-36 w-36 rounded-full bg-[radial-gradient(circle,hsl(var(--glow-solar)/0.18)_0%,transparent_72%)] blur-2xl" />
        <div className="page-hero-body">
          <div className="page-hero-copy">
            <div className="page-hero-kicker">
              <Orbit className="h-3.5 w-3.5 text-[hsl(var(--signal-solar))]" />
              AI 设置
            </div>
            <h1 className="page-hero-title mt-4 text-3xl font-semibold sm:text-4xl">
              <span className="inline-block text-gradient-cyber">连接你的模型服务</span>
            </h1>
            <p className="page-hero-summary">
              填好 API Key、接口地址和模型名后，你就可以直接开始解析简历、匹配 JD 和生成简历。
            </p>
          </div>
          <div className="page-hero-pill text-sm">
            当前状态：{isConfigured ? '已配置' : '未配置'}
          </div>
        </div>
      </section>

      <div className="page-grid-main" data-layout="split">
        <Card className="overflow-hidden">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <ServerCog className="h-5 w-5 text-primary" />
              填写连接信息
            </CardTitle>
            <CardDescription>
              建议直接从服务商控制台或文档复制，避免手动输入出错。
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="api-key">API Key</Label>
              <Input
                id="api-key"
                type="password"
                placeholder="sk-..."
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                这是你在模型服务商控制台创建的密钥。
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="base-url">Base URL</Label>
              <Input
                id="base-url"
                type="url"
                placeholder="https://api.example.com/v1"
                value={baseURL}
                onChange={(e) => setBaseURL(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                一般是 OpenAI 兼容接口的基础地址，通常以 `/v1` 结尾。
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="model-name">模型名</Label>
              <Input
                id="model-name"
                placeholder={DEFAULT_AI_MODEL}
                value={modelName}
                onChange={(e) => setModelName(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                就填写你准备实际使用的模型名；如果不确定，可以先保留默认值再测试。
              </p>
            </div>

            <Alert>
              <ShieldAlert className="h-4 w-4" />
              <AlertTitle>隐私与运行方式</AlertTitle>
              <AlertDescription>
                API Key 只保存在当前浏览器。LLM 请求由前端直接发往你填写的 OpenAI 兼容接口，服务器不代理、不存储你的 API Key、简历、JD 或生成结果。
              </AlertDescription>
            </Alert>

            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>使用提醒</AlertTitle>
              <AlertDescription>
                这些设置只对当前设备生效。如果你更换浏览器、使用无痕窗口，或清理站点数据，需要重新填写。
              </AlertDescription>
            </Alert>

            <div className="flex flex-wrap gap-3">
              <Button onClick={handleSave} className="gap-2">
                <KeyRound className="h-4 w-4" />
                保存设置
              </Button>
              <Button
                variant="outline"
                onClick={handleTest}
                disabled={testState === 'loading'}
                className="gap-2"
              >
                {testState === 'loading' ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Wifi className="h-4 w-4" />
                )}
                测试连接
              </Button>
              <Button variant="outline" onClick={handleClear}>
                清空设置
              </Button>
              <Button variant="ghost" asChild>
                <Link href="/match">去 JD 匹配页</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Sparkles className="h-4 w-4 text-[hsl(var(--signal-solar))]" />
                不想先填 Key？
              </CardTitle>
              <CardDescription>
                可以直接进入一个免 API Key 的示例环境，先浏览完整工作流，再决定是否接入你自己的模型服务。
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-[22px] border border-border/70 bg-background/30 p-4 text-sm leading-6 text-muted-foreground">
                示例环境会预置档案、JD、匹配结果和简历。真正需要发起模型请求时，再回来填写 API Key 即可。
              </div>
              <div className="flex flex-wrap gap-3">
                {isDemoMode ? (
                  <Button onClick={handleExitDemoMode}>退出示例环境</Button>
                ) : (
                  <Button onClick={handleEnterDemoMode}>进入示例环境</Button>
                )}
                <Button variant="outline" asChild>
                  <Link href="/">回到总览</Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Sparkles className="h-4 w-4 text-[hsl(var(--signal-gold))]" />
                去哪里拿 API Key、Base URL 和模型名
              </CardTitle>
              <CardDescription>
                下面是最常见的几种服务。三项配置都建议直接从服务商后台或文档复制。
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {PROVIDER_GUIDES.map((provider) => (
                <div key={provider.name} className="rounded-[22px] border border-border/70 bg-background/30 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="font-medium">{provider.name}</div>
                    {provider.url ? (
                      <a
                        href={provider.url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                      >
                        打开官网
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    ) : null}
                  </div>
                  <p className="mt-3 text-sm leading-6 text-muted-foreground">
                    {provider.apiKeyHint}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    {provider.baseUrlHint}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    {provider.modelHint}
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>

          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>填写建议</AlertTitle>
            <AlertDescription>
              如果连接失败，优先检查三件事：API Key 是否有效、接口地址是否正确、模型名是否可用。
            </AlertDescription>
          </Alert>
        </div>
      </div>

      <Dialog open={testDialogOpen} onOpenChange={setTestDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Wifi className="h-4 w-4 text-primary" />
              连接测试
            </DialogTitle>
          </DialogHeader>

          <div className="pt-2">
            {testState === 'loading' && (
              <div className="flex items-center gap-3 text-muted-foreground py-4">
                <Loader2 className="h-5 w-5 animate-spin flex-shrink-0" />
                <span className="text-sm">正在发送测试请求，请稍候…</span>
              </div>
            )}

            {testState === 'ok' && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-[hsl(var(--signal-jade))]">
                  <CheckCircle2 className="h-5 w-5 flex-shrink-0" />
                  <span className="font-medium">连接成功</span>
                </div>
                {testModel && (
                  <div className="rounded-lg border border-border/60 bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
                    <span className="font-mono">model: {testModel}</span>
                  </div>
                )}
                <div className="rounded-lg border border-[hsl(var(--signal-jade)/0.3)] bg-[hsl(var(--signal-jade)/0.06)] px-3 py-2 text-sm">
                  <span className="text-muted-foreground">模型回复：</span>
                  <span className="font-medium">{testMessage}</span>
                </div>
              </div>
            )}

            {testState === 'error' && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-[hsl(var(--signal-rose))]">
                  <XCircle className="h-5 w-5 flex-shrink-0" />
                  <span className="font-medium">连接失败</span>
                </div>
                <div className="rounded-lg border border-[hsl(var(--signal-rose)/0.3)] bg-[hsl(var(--signal-rose)/0.06)] px-3 py-2 text-sm break-all text-muted-foreground">
                  {testMessage}
                </div>
                <p className="text-xs text-muted-foreground">
                  请检查 API Key、接口地址和模型名是否填写正确。
                </p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

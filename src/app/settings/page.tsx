'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { AlertTriangle, ExternalLink, KeyRound, Orbit, ServerCog, ShieldAlert, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { clearAISettings, DEFAULT_AI_MODEL, getStoredAISettings, hasStoredAISettings, saveAISettings } from '@/lib/client/ai-settings';

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

  function handleClear() {
    clearAISettings();
    setApiKey('');
    setBaseURL('');
    setModelName(DEFAULT_AI_MODEL);
    toast.success('已清空当前浏览器中的 AI 设置');
  }

  return (
    <div className="mx-auto flex h-full w-full max-w-6xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-10">
      <section className="surface-panel relative overflow-hidden rounded-[32px] px-6 py-7 sm:px-8">
        <div className="absolute -right-10 top-2 h-36 w-36 rounded-full bg-[radial-gradient(circle,hsl(var(--glow-solar)/0.18)_0%,transparent_72%)] blur-2xl" />
        <div className="relative flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-background/50 px-3 py-1 text-[11px] uppercase tracking-[0.34em] text-muted-foreground">
              <Orbit className="h-3.5 w-3.5 text-[hsl(var(--signal-solar))]" />
              AI 设置
            </div>
            <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
              <span className="text-gradient-cyber">连接你的模型服务</span>
            </h1>
            <p className="mt-3 text-sm leading-7 text-muted-foreground sm:text-base">
              这个项目现在只从前端页面读取 API Key、Base URL 和模型名，不再依赖 `.env` 文件。
              你保存的内容只会存放在当前浏览器的 localStorage 中，并在发起 AI 请求时随请求一起发送到服务端。
            </p>
          </div>
          <div className="rounded-full border border-border/70 bg-background/40 px-4 py-2 text-sm text-muted-foreground">
            当前状态：{isConfigured ? '已配置' : '未配置'}
          </div>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)]">
        <Card className="overflow-hidden">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <ServerCog className="h-5 w-5 text-primary" />
              填写连接信息
            </CardTitle>
            <CardDescription>
              建议直接复制服务商后台里的值，避免手动输入时漏掉协议头或 `/v1` 路径。
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
                这是实际发起请求时使用的 model 字段。如果你不确定，可先保留默认值。
              </p>
            </div>

            <Alert>
              <ShieldAlert className="h-4 w-4" />
              <AlertTitle>存储方式说明</AlertTitle>
              <AlertDescription>
                为了满足“只从网页前端读取”的要求，这些值会保存在当前浏览器里，而不是项目的 `.env` 文件中。
                如果你更换浏览器、开无痕窗口或清空站点数据，需要重新填写。
              </AlertDescription>
            </Alert>

            <div className="flex flex-wrap gap-3">
              <Button onClick={handleSave} className="gap-2">
                <KeyRound className="h-4 w-4" />
                保存设置
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
                <Sparkles className="h-4 w-4 text-[hsl(var(--signal-gold))]" />
                去哪里拿 API Key、Base URL 和模型名
              </CardTitle>
              <CardDescription>
                下面是最常见的几种方式。这个项目支持 OpenAI 兼容接口，三项配置都建议直接从服务商文档或控制台复制。
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
              如果请求报错，先检查三件事：一是 Base URL 是否完整，二是模型名是否可用，三是该服务是否真的兼容 OpenAI Chat Completions 接口。
            </AlertDescription>
          </Alert>
        </div>
      </div>
    </div>
  );
}

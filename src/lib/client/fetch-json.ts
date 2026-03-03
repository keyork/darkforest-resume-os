'use client';

import { buildAISettingsHeaders } from '@/lib/client/ai-settings';

export async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
  const headers = buildAISettingsHeaders(init?.headers);

  if (!(init?.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const res = await fetch(url, {
    ...init,
    headers,
  });

  if (!res.ok) {
    const body = await res.text().catch(() => res.statusText);
    throw new Error(`${init?.method ?? 'GET'} ${url} failed (${res.status}): ${body}`);
  }

  return res.json() as Promise<T>;
}

export async function fetchWithAISettings(url: string, init?: RequestInit): Promise<Response> {
  const headers = buildAISettingsHeaders(init?.headers);

  return fetch(url, {
    ...init,
    headers,
  });
}

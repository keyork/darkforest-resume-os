'use client';

import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { JobDescription } from '@/lib/types/jd';
import { format } from 'date-fns';

interface JDDetailProps {
  jd: JobDescription;
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {title}
      </h3>
      {children}
    </div>
  );
}

function TagList({ items, variant = 'secondary' }: { items: string[]; variant?: 'secondary' | 'outline' | 'destructive' }) {
  if (!items.length) return <p className="text-xs text-muted-foreground">—</p>;
  return (
    <div className="flex flex-wrap gap-1.5">
      {items.map((item, i) => (
        <Badge key={i} variant={variant} className="text-xs font-normal">
          {item}
        </Badge>
      ))}
    </div>
  );
}

export function JDDetail({ jd }: JDDetailProps) {
  const p = jd.parsed;

  return (
    <ScrollArea className="h-full">
      <div className="p-5 space-y-5">
        {/* Header */}
        <div className="space-y-1">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold leading-tight">
                {p?.position ?? '未命名岗位'}
              </h2>
              {p?.company && (
                <p className="text-sm text-muted-foreground mt-0.5">{p.company}</p>
              )}
            </div>
            <span className="text-xs text-muted-foreground flex-shrink-0 mt-1">
              {format(new Date(jd.createdAt), 'yyyy-MM-dd HH:mm')}
            </span>
          </div>
          <div className="flex flex-wrap gap-2 pt-1">
            {p?.level && <Badge variant="outline">{p.level}</Badge>}
            {p?.location && <Badge variant="outline">{p.location}</Badge>}
            {p?.yearsOfExperience && <Badge variant="outline">{p.yearsOfExperience}</Badge>}
            {p?.salaryRange && <Badge variant="outline">{p.salaryRange}</Badge>}
          </div>
        </div>

        {/* Ideal candidate */}
        {p?.idealCandidateProfile && (
          <Section title="理想候选人画像">
            <p className="text-sm text-muted-foreground leading-relaxed bg-muted/40 rounded-md p-3">
              {p.idealCandidateProfile}
            </p>
          </Section>
        )}

        {/* Core competencies */}
        {p?.coreCompetencies?.length ? (
          <Section title="核心能力要求">
            <TagList items={p.coreCompetencies} />
          </Section>
        ) : null}

        {/* Must have */}
        {p?.mustHave?.length ? (
          <Section title="必备条件">
            <ul className="space-y-1">
              {p.mustHave.map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-rose-400 flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </Section>
        ) : null}

        {/* Nice to have */}
        {p?.niceToHave?.length ? (
          <Section title="加分项">
            <ul className="space-y-1">
              {p.niceToHave.map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[hsl(var(--signal-jade))]" />
                  {item}
                </li>
              ))}
            </ul>
          </Section>
        ) : null}

        {/* Implicit requirements */}
        {p?.implicitRequirements?.length ? (
          <Section title="隐性要求（AI 推断）">
            <div className="space-y-2">
              {p.implicitRequirements.map((item, i) => (
                <div key={i} className="text-sm border rounded-md p-2.5 space-y-0.5">
                  <div className="font-medium">{item.requirement}</div>
                  <div className="text-xs text-muted-foreground">{item.reasoning}</div>
                </div>
              ))}
            </div>
          </Section>
        ) : null}

        {/* Keywords */}
        <div className="grid grid-cols-1 gap-4">
          {p?.techKeywords?.length ? (
            <Section title="技术关键词">
              <TagList items={p.techKeywords} />
            </Section>
          ) : null}
          {p?.businessKeywords?.length ? (
            <Section title="业务关键词">
              <TagList items={p.businessKeywords} variant="outline" />
            </Section>
          ) : null}
          {p?.cultureKeywords?.length ? (
            <Section title="文化关键词">
              <TagList items={p.cultureKeywords} variant="outline" />
            </Section>
          ) : null}
        </div>

        {/* Raw text */}
        <Section title="原始 JD 全文">
          <pre className="text-xs text-muted-foreground whitespace-pre-wrap leading-relaxed bg-muted/30 rounded-md p-3 max-h-64 overflow-y-auto">
            {jd.rawText}
          </pre>
        </Section>
      </div>
    </ScrollArea>
  );
}

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Sparkles, TrendingUp, TrendingDown } from 'lucide-react';

export const metadata = {
  title: 'Design System — Precision Intelligence',
};

const typeTokens = [
  { name: 'display-xl', className: 'text-display-xl', sample: '92' },
  { name: 'headline-lg', className: 'text-headline-lg', sample: 'Commercial intelligence' },
  { name: 'headline-md', className: 'text-headline-md', sample: 'Fit score breakdown' },
  { name: 'body-base', className: 'text-body-base', sample: 'The body copy is set at 14px / 1.6 to balance density and calm.' },
  { name: 'label-caps', className: 'text-label-caps uppercase', sample: 'FIT SCORE' },
  { name: 'mono-data', className: 'text-mono-data', sample: '1,248,302.00' },
];

const colorTokens = [
  { name: 'background', var: '--background' },
  { name: 'foreground', var: '--foreground' },
  { name: 'card', var: '--card' },
  { name: 'primary', var: '--primary' },
  { name: 'primary-foreground', var: '--primary-foreground' },
  { name: 'secondary', var: '--secondary' },
  { name: 'muted', var: '--muted' },
  { name: 'muted-foreground', var: '--muted-foreground' },
  { name: 'accent (indigo)', var: '--accent' },
  { name: 'destructive', var: '--destructive' },
  { name: 'border', var: '--border' },
  { name: 'input', var: '--input' },
  { name: 'ring', var: '--ring' },
];

const spacingTokens = [
  { name: 'xs (1)', value: '4px', px: 'p-1' },
  { name: 'sm (2)', value: '8px', px: 'p-2' },
  { name: 'md (4)', value: '16px', px: 'p-4' },
  { name: 'lg (8)', value: '32px', px: 'p-8' },
  { name: 'gutter', value: '24px', px: 'p-gutter' },
  { name: 'container-margin', value: '48px', px: 'p-container-margin' },
  { name: 'xl (16)', value: '64px', px: 'p-16' },
];

export default function DesignSystemPage() {
  return (
    <main className="min-h-screen bg-page px-container-margin py-container-margin">
      <div className="mx-auto max-w-6xl space-y-16">
        <header className="space-y-2">
          <p className="text-label-caps uppercase text-muted-foreground">Precision Intelligence</p>
          <h1 className="text-display-xl">Design system</h1>
          <p className="max-w-2xl text-body-base text-muted-foreground">
            Silent Intelligence aesthetic — ultra-minimalist tokens for executive-grade data
            surfaces. Whitespace is a functional tool, not empty room.
          </p>
        </header>

        <Section title="Typography" caption="Inter · geometric, architectural">
          <div className="divide-y divide-border rounded-md border bg-card">
            {typeTokens.map((t) => (
              <div key={t.name} className="grid grid-cols-[200px_1fr] items-baseline gap-8 px-6 py-5">
                <code className="text-mono-data text-muted-foreground">{t.name}</code>
                <div className={t.className}>{t.sample}</div>
              </div>
            ))}
          </div>
        </Section>

        <Section title="Colors" caption="HSL CSS vars · black + indigo surgical accent">
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
            {colorTokens.map((c) => (
              <div key={c.name} className="rounded-md border bg-card p-3">
                <div
                  className="mb-3 h-16 w-full rounded border border-border"
                  style={{ background: `hsl(var(${c.var}))` }}
                />
                <div className="text-label-caps uppercase text-muted-foreground">{c.name}</div>
                <code className="text-mono-data">{c.var}</code>
              </div>
            ))}
          </div>
        </Section>

        <Section title="Spacing" caption="4px baseline grid · named aliases">
          <div className="space-y-2">
            {spacingTokens.map((s) => (
              <div key={s.name} className="flex items-center gap-6">
                <code className="w-40 text-mono-data text-muted-foreground">{s.name}</code>
                <code className="w-16 text-mono-data">{s.value}</code>
                <div className={`${s.px} bg-accent/10 ring-1 ring-inset ring-accent/30`}>
                  <div className="h-3 bg-accent/60" />
                </div>
              </div>
            ))}
          </div>
        </Section>

        <Section title="Radius" caption="4px default · 2px badges · full circles only for Fit Score">
          <div className="flex flex-wrap gap-6">
            {[
              { name: 'badge · 2px', cls: 'rounded-badge' },
              { name: 'sm · 2px', cls: 'rounded-sm' },
              { name: 'md · 4px', cls: 'rounded-md' },
              { name: 'lg · 4px', cls: 'rounded-lg' },
              { name: 'full', cls: 'rounded-full' },
            ].map((r) => (
              <div key={r.name} className="flex flex-col items-center gap-2">
                <div className={`h-20 w-20 bg-primary ${r.cls}`} />
                <code className="text-mono-data text-muted-foreground">{r.name}</code>
              </div>
            ))}
          </div>
        </Section>

        <Section title="Buttons" caption="Primary · Secondary · Ghost · Accent (surgical use)">
          <div className="flex flex-wrap items-center gap-3">
            <Button>Primary action</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="accent">Accent / CTA</Button>
            <Button variant="destructive">Destructive</Button>
            <Button variant="link">Link</Button>
          </div>
          <div className="flex flex-wrap items-center gap-3 pt-4">
            <Button size="sm">Small</Button>
            <Button>Default</Button>
            <Button size="lg">Large</Button>
            <Button size="icon" aria-label="Sparkle">
              <Sparkles className="h-4 w-4" />
            </Button>
            <Button disabled>Disabled</Button>
          </div>
        </Section>

        <Section title="Inputs" caption="Minimalist · focus ring uses accent indigo">
          <div className="grid max-w-md gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="you@company.com" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="disabled">Disabled</Label>
              <Input id="disabled" disabled placeholder="Read-only" />
            </div>
          </div>
        </Section>

        <Section title="Badges" caption="Sharp 2px radius · data-driven look">
          <div className="flex flex-wrap gap-2">
            <Badge>Active</Badge>
            <Badge variant="secondary">Tier 1</Badge>
            <Badge variant="outline">Draft</Badge>
            <Badge variant="success">Verified</Badge>
            <Badge variant="warning">Review</Badge>
            <Badge variant="destructive">Failed</Badge>
          </div>
        </Section>

        <Section title="Fit Score" caption="Geometric circle · accent color only above 90">
          <div className="flex items-center gap-10">
            <FitScore value={92} />
            <FitScore value={74} />
            <FitScore value={48} />
          </div>
        </Section>

        <Section title="AI Insight banner" caption="Notification style · tint of accent · text is the focus">
          <div className="flex items-start gap-3 rounded-md bg-insight p-4">
            <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
            <div className="space-y-1">
              <p className="text-label-caps uppercase text-accent">AI Insight</p>
              <p className="text-body-base text-foreground">
                Influencers in the <strong>Skincare / 25–34</strong> cohort converted 2.4× better
                when paired with unscented product SKUs last month.
              </p>
            </div>
          </div>
        </Section>

        <Section title="Data table" caption="No vertical lines · horizontal 1px border · label-caps header">
          <div className="overflow-hidden rounded-md border bg-card">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <Th>Influencer</Th>
                  <Th>Fit</Th>
                  <Th align="right">Followers</Th>
                  <Th align="right">CVR</Th>
                  <Th align="right">GMV</Th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {[
                  { n: 'Camila R.', fit: 94, f: 128_400, cvr: 0.042, gmv: 18_920 },
                  { n: 'Joaco L.', fit: 81, f: 56_200, cvr: 0.031, gmv: 9_110 },
                  { n: 'Luna M.', fit: 68, f: 312_000, cvr: 0.019, gmv: 22_050 },
                ].map((r) => (
                  <tr key={r.n} className="hover:bg-surface-ghost">
                    <Td>{r.n}</Td>
                    <Td>
                      <span className={r.fit >= 90 ? 'text-accent font-medium' : ''}>{r.fit}</span>
                    </Td>
                    <Td align="right">{r.f.toLocaleString('en-US')}</Td>
                    <Td align="right">{(r.cvr * 100).toFixed(1)}%</Td>
                    <Td align="right">${r.gmv.toLocaleString('en-US')}</Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>

        <Section title="Floating surface" caption="Ultra-diffused shadow · Command Menu / Dropdown">
          <div className="max-w-sm rounded-md border bg-card p-4 shadow-float">
            <p className="text-label-caps uppercase text-muted-foreground">Command</p>
            <p className="pt-1 text-body-base">Search, filter, or jump to any view…</p>
            <div className="mt-3 flex items-center gap-2 text-mono-data text-muted-foreground">
              <kbd className="rounded-badge border bg-surface-ghost px-1.5 py-0.5">⌘</kbd>
              <kbd className="rounded-badge border bg-surface-ghost px-1.5 py-0.5">K</kbd>
            </div>
          </div>
        </Section>

        <Section title="Trend indicator" caption="Small paired glyph · data-first">
          <div className="flex items-center gap-8">
            <TrendStat label="CVR" value="4.2%" direction="up" delta="+0.6pp" />
            <TrendStat label="CAC" value="$18" direction="down" delta="-$3" />
          </div>
        </Section>
      </div>
    </main>
  );
}

function Section({
  title,
  caption,
  children,
}: {
  title: string;
  caption?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-6">
      <div>
        <h2 className="text-headline-lg">{title}</h2>
        {caption ? <p className="pt-1 text-body-base text-muted-foreground">{caption}</p> : null}
      </div>
      {children}
    </section>
  );
}

function Th({ children, align = 'left' }: { children: React.ReactNode; align?: 'left' | 'right' }) {
  return (
    <th
      className={`px-6 py-3 text-label-caps uppercase text-muted-foreground ${
        align === 'right' ? 'text-right' : 'text-left'
      }`}
    >
      {children}
    </th>
  );
}

function Td({ children, align = 'left' }: { children: React.ReactNode; align?: 'left' | 'right' }) {
  return (
    <td
      className={`px-6 py-4 text-body-base ${
        align === 'right' ? 'text-right text-mono-data' : 'text-left'
      }`}
    >
      {children}
    </td>
  );
}

function FitScore({ value }: { value: number }) {
  const isPeak = value >= 90;
  return (
    <div className="flex flex-col items-center gap-2">
      <div
        className={`flex h-24 w-24 items-center justify-center rounded-full border-2 text-headline-lg ${
          isPeak ? 'border-accent text-accent' : 'border-border text-foreground'
        }`}
      >
        {value}
      </div>
      <span className="text-label-caps uppercase text-muted-foreground">Fit score</span>
    </div>
  );
}

function TrendStat({
  label,
  value,
  direction,
  delta,
}: {
  label: string;
  value: string;
  direction: 'up' | 'down';
  delta: string;
}) {
  const Icon = direction === 'up' ? TrendingUp : TrendingDown;
  return (
    <div className="space-y-1">
      <span className="text-label-caps uppercase text-muted-foreground">{label}</span>
      <div className="flex items-baseline gap-2">
        <span className="text-headline-lg">{value}</span>
        <span className="inline-flex items-center gap-1 text-mono-data text-muted-foreground">
          <Icon className="h-3 w-3" />
          {delta}
        </span>
      </div>
    </div>
  );
}

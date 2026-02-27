'use client';

import useSWR from 'swr';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { getCompany, SECTOR_LABELS } from '@/lib/companies';
import type { StockQuote } from '@/lib/types';

interface ComparisonTableProps {
  tickers: string[];
}

const ESG_RATING_COLORS: Record<string, string> = {
  AAA: 'bg-emerald-600 text-white',
  AA: 'bg-emerald-500 text-white',
  A: 'bg-green-500 text-white',
  BBB: 'bg-yellow-500 text-black',
  BB: 'bg-orange-500 text-white',
  B: 'bg-red-500 text-white',
  CCC: 'bg-red-700 text-white',
};

const CDP_COLORS: Record<string, string> = {
  A: 'text-emerald-400',
  'A-': 'text-emerald-400',
  B: 'text-green-400',
  'B-': 'text-yellow-400',
  C: 'text-orange-400',
  D: 'text-red-400',
};

function Cell({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <td className={`px-4 py-3 text-sm border-b border-border ${className}`}>{children}</td>
  );
}

function HeaderRow({ label }: { label: string }) {
  return (
    <tr>
      <th
        colSpan={99}
        className="px-4 py-2 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider bg-muted/30"
      >
        {label}
      </th>
    </tr>
  );
}

function MetricRow({
  label,
  values,
  highlight = 'none',
}: {
  label: string;
  values: (string | number | null | undefined)[];
  highlight?: 'max' | 'min' | 'none';
}) {
  const nums = values.map((v) => (typeof v === 'number' ? v : null));
  const validNums = nums.filter((n): n is number => n !== null);
  const best = highlight === 'max' ? Math.max(...validNums) : Math.min(...validNums);

  return (
    <tr className="hover:bg-muted/20">
      <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground whitespace-nowrap">
        {label}
      </th>
      {values.map((v, i) => {
        const isBest = highlight !== 'none' && validNums.length > 1 && nums[i] === best;
        return (
          <Cell key={i} className={isBest ? 'text-green-400 font-semibold' : ''}>
            {v ?? '—'}
          </Cell>
        );
      })}
    </tr>
  );
}

export function ComparisonTable({ tickers }: ComparisonTableProps) {
  const companies = tickers.map((t) => getCompany(t)).filter(Boolean) as ReturnType<
    typeof getCompany
  >[];

  const { data: quotes } = useSWR<StockQuote[]>(
    tickers.length > 0 ? `/api/quotes?tickers=${tickers.join(',')}` : null
  );

  const quoteMap = new Map(quotes?.map((q) => [q.ticker, q]) ?? []);

  if (companies.length === 0) {
    return (
      <div className="rounded-lg border border-border p-8 text-center text-muted-foreground">
        Select companies above to compare them side by side.
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-border overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-muted/30">
              <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider w-40">
                Metric
              </th>
              {companies.map((c) => (
                <th key={c!.ticker} className="px-4 py-3 text-left min-w-[160px]">
                  <Link
                    href={`/company/${c!.ticker}`}
                    className="flex flex-col hover:text-primary transition-colors"
                  >
                    <span className="font-mono text-xs text-muted-foreground">{c!.ticker}</span>
                    <span className="font-semibold text-sm">{c!.name}</span>
                  </Link>
                  <Badge variant="secondary" className="mt-1 text-xs">
                    {SECTOR_LABELS[c!.sector]}
                  </Badge>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <HeaderRow label="Stock" />
            <MetricRow
              label="Price"
              values={companies.map((c) => {
                const q = quoteMap.get(c!.ticker);
                return q ? `$${q.price.toFixed(2)}` : '—';
              })}
            />
            <MetricRow
              label="Change"
              values={companies.map((c) => {
                const q = quoteMap.get(c!.ticker);
                if (!q) return '—';
                const sign = q.changePercent >= 0 ? '+' : '';
                return `${sign}${q.changePercent.toFixed(2)}%`;
              })}
            />
            <MetricRow
              label="Market Cap"
              values={companies.map((c) => {
                const q = quoteMap.get(c!.ticker);
                if (!q) return '—';
                return q.marketCap >= 1e12
                  ? `$${(q.marketCap / 1e12).toFixed(1)}T`
                  : `$${(q.marketCap / 1e9).toFixed(1)}B`;
              })}
            />
            <MetricRow
              label="52W High"
              values={companies.map((c) => {
                const q = quoteMap.get(c!.ticker);
                return q ? `$${q.fiftyTwoWeekHigh.toFixed(2)}` : '—';
              })}
            />
            <MetricRow
              label="52W Low"
              values={companies.map((c) => {
                const q = quoteMap.get(c!.ticker);
                return q ? `$${q.fiftyTwoWeekLow.toFixed(2)}` : '—';
              })}
            />

            <HeaderRow label="ESG Scores" />
            <MetricRow
              label="Overall"
              values={companies.map((c) => c!.esg.overall)}
              highlight="max"
            />
            <MetricRow
              label="Environmental"
              values={companies.map((c) => c!.esg.environmental)}
              highlight="max"
            />
            <MetricRow
              label="Social"
              values={companies.map((c) => c!.esg.social)}
              highlight="max"
            />
            <MetricRow
              label="Governance"
              values={companies.map((c) => c!.esg.governance)}
              highlight="max"
            />
            <tr className="hover:bg-muted/20">
              <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                MSCI Rating
              </th>
              {companies.map((c) => (
                <Cell key={c!.ticker}>
                  <span
                    className={`rounded px-2 py-0.5 text-xs font-bold ${
                      ESG_RATING_COLORS[c!.esg.rating]
                    }`}
                  >
                    {c!.esg.rating}
                  </span>
                </Cell>
              ))}
            </tr>

            <HeaderRow label="Climate" />
            <MetricRow
              label="Scope 1 (MT CO₂e)"
              values={companies.map((c) => c!.climate.scope1)}
              highlight="min"
            />
            <MetricRow
              label="Scope 2 (MT CO₂e)"
              values={companies.map((c) => c!.climate.scope2)}
              highlight="min"
            />
            <MetricRow
              label="Scope 3 (MT CO₂e)"
              values={companies.map((c) => c!.climate.scope3)}
              highlight="min"
            />
            <MetricRow
              label="Carbon Intensity"
              values={companies.map((c) => `${c!.climate.carbonIntensity} tCO₂e/$M`)}
            />
            <MetricRow
              label="Renewables %"
              values={companies.map((c) => `${c!.climate.renewableEnergy}%`)}
            />
            <MetricRow
              label="Net Zero Target"
              values={companies.map((c) => c!.climate.netZeroTarget ?? 'Not set')}
            />
            <tr className="hover:bg-muted/20">
              <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                CDP Score
              </th>
              {companies.map((c) => (
                <Cell key={c!.ticker}>
                  <span className={`font-semibold ${CDP_COLORS[c!.climate.cdpScore]}`}>
                    {c!.climate.cdpScore}
                  </span>
                </Cell>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

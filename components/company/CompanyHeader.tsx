'use client';

import { Badge } from '@/components/ui/badge';
import type { Company, StockQuote } from '@/lib/types';
import { SECTOR_LABELS } from '@/lib/companies';

interface CompanyHeaderProps {
  company: Company;
  quote?: StockQuote;
  loading?: boolean;
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

export function CompanyHeader({ company, quote, loading }: CompanyHeaderProps) {
  const isPositive = (quote?.changePercent ?? 0) >= 0;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">{company.name}</h1>
            <span
              className={`rounded px-2 py-0.5 text-sm font-bold ${ESG_RATING_COLORS[company.esg.rating]}`}
            >
              {company.esg.rating}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-sm font-semibold text-muted-foreground">
              {company.ticker}
            </span>
            <span className="text-muted-foreground">·</span>
            <Badge variant="secondary">{SECTOR_LABELS[company.sector]}</Badge>
            <span className="text-muted-foreground">·</span>
            <span className="text-sm text-muted-foreground">{company.country}</span>
          </div>
        </div>

        {loading ? (
          <div className="animate-pulse space-y-2">
            <div className="h-9 w-28 rounded bg-muted" />
            <div className="h-5 w-20 rounded bg-muted" />
          </div>
        ) : quote ? (
          <div className="text-right">
            <p className="text-3xl font-bold">
              {quote.currency !== 'USD' ? quote.currency + ' ' : '$'}
              {quote.price.toFixed(2)}
            </p>
            <p className={`text-base font-medium ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
              {isPositive ? '▲' : '▼'} {Math.abs(quote.change).toFixed(2)} (
              {Math.abs(quote.changePercent).toFixed(2)}%)
            </p>
          </div>
        ) : null}
      </div>

      <p className="text-sm text-muted-foreground leading-relaxed max-w-3xl">
        {company.description}
      </p>

      {quote && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 rounded-lg border border-border p-4 bg-muted/20">
          <div>
            <p className="text-xs text-muted-foreground">52W High</p>
            <p className="font-semibold">${quote.fiftyTwoWeekHigh.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">52W Low</p>
            <p className="font-semibold">${quote.fiftyTwoWeekLow.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Volume</p>
            <p className="font-semibold">{(quote.volume / 1e6).toFixed(2)}M</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Market Cap</p>
            <p className="font-semibold">
              {quote.marketCap >= 1e12
                ? `$${(quote.marketCap / 1e12).toFixed(1)}T`
                : `$${(quote.marketCap / 1e9).toFixed(1)}B`}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

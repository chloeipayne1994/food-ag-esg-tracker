'use client';

import Link from 'next/link';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Company, StockQuote } from '@/lib/types';
import { SECTOR_LABELS } from '@/lib/companies';

interface CompanyCardProps {
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

function formatMarketCap(value: number): string {
  if (value >= 1e12) return `$${(value / 1e12).toFixed(1)}T`;
  if (value >= 1e9) return `$${(value / 1e9).toFixed(1)}B`;
  if (value >= 1e6) return `$${(value / 1e6).toFixed(1)}M`;
  return `$${value.toFixed(0)}`;
}

export function CompanyCard({ company, quote, loading }: CompanyCardProps) {
  const isPositive = (quote?.changePercent ?? 0) >= 0;

  return (
    <Link href={`/company/${company.ticker}`}>
      <Card className="h-full cursor-pointer transition-all hover:shadow-md hover:border-primary/50">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="text-xs font-mono font-semibold text-muted-foreground uppercase tracking-wider">
                {company.ticker}
              </p>
              <h3 className="font-semibold leading-tight truncate">{company.name}</h3>
            </div>
            <span
              className={`shrink-0 rounded px-2 py-0.5 text-xs font-bold ${
                ESG_RATING_COLORS[company.esg.rating]
              }`}
            >
              {company.esg.rating}
            </span>
          </div>
          <Badge variant="secondary" className="w-fit text-xs mt-1">
            {SECTOR_LABELS[company.sector]}
          </Badge>
        </CardHeader>
        <CardContent className="space-y-3">
          {loading ? (
            <div className="space-y-2 animate-pulse">
              <div className="h-7 w-24 rounded bg-muted" />
              <div className="h-4 w-16 rounded bg-muted" />
            </div>
          ) : quote ? (
            <div>
              <p className="text-2xl font-bold">
                {quote.currency !== 'USD' ? quote.currency + ' ' : '$'}
                {quote.price.toFixed(2)}
              </p>
              <p className={`text-sm font-medium ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
                {isPositive ? '▲' : '▼'} {Math.abs(quote.change).toFixed(2)} (
                {Math.abs(quote.changePercent).toFixed(2)}%)
              </p>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Price unavailable</p>
          )}

          <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
            <div>
              <p className="font-medium text-foreground">ESG Score</p>
              <p>{company.esg.overall}/100</p>
            </div>
            <div>
              <p className="font-medium text-foreground">Net Zero</p>
              <p>{company.climate.netZeroTarget ?? 'Not set'}</p>
            </div>
            {quote && (
              <>
                <div>
                  <p className="font-medium text-foreground">Mkt Cap</p>
                  <p>{formatMarketCap(quote.marketCap)}</p>
                </div>
                <div>
                  <p className="font-medium text-foreground">CDP</p>
                  <p>{company.climate.cdpScore}</p>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

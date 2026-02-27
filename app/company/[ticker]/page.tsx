'use client';

import { notFound } from 'next/navigation';
import { use } from 'react';
import useSWR from 'swr';
import Link from 'next/link';
import { getCompany } from '@/lib/companies';
import type { StockQuote } from '@/lib/types';
import { CompanyHeader } from '@/components/company/CompanyHeader';
import { StockChart } from '@/components/company/StockChart';
import { ESGScoreCard } from '@/components/company/ESGScoreCard';
import { ClimateMetrics } from '@/components/company/ClimateMetrics';

export default function CompanyPage({
  params,
}: {
  params: Promise<{ ticker: string }>;
}) {
  const { ticker } = use(params);
  const company = getCompany(ticker.toUpperCase());

  if (!company) {
    notFound();
  }

  const { data: quote, isLoading } = useSWR<StockQuote>(
    `/api/quote/${company.ticker}`
  );

  return (
    <div className="space-y-6">
      <Link
        href="/"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        ← Back to Dashboard
      </Link>

      <CompanyHeader company={company} quote={quote} loading={isLoading} />

      <div className="grid gap-6 lg:grid-cols-2">
        <StockChart ticker={company.ticker} />
        <ESGScoreCard company={company} />
      </div>

      <ClimateMetrics company={company} />
    </div>
  );
}

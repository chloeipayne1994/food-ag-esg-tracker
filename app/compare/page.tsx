'use client';

import { useState } from 'react';
import Link from 'next/link';
import { CompanySelector } from '@/components/compare/CompanySelector';
import { ComparisonTable } from '@/components/compare/ComparisonTable';

export default function ComparePage() {
  const [selected, setSelected] = useState<string[]>([]);

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
        >
          ← Back to Dashboard
        </Link>
        <h1 className="text-3xl font-bold tracking-tight">Compare Companies</h1>
        <p className="mt-1 text-muted-foreground">
          Select up to 3 companies to compare stock performance, ESG scores, and climate metrics
          side by side.
        </p>
      </div>

      <div className="rounded-lg border border-border p-4">
        <CompanySelector selected={selected} onChange={setSelected} max={3} />
      </div>

      <ComparisonTable tickers={selected} />
    </div>
  );
}

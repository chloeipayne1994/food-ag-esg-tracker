'use client';

import { useState } from 'react';
import Link from 'next/link';
import useSWR from 'swr';
import { COMPANIES, TICKERS, SECTOR_LABELS } from '@/lib/companies';
import type { StockQuote, CompanyFinancials, CompanyCommentary, Sector } from '@/lib/types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { SectorFilter } from './SectorFilter';

type FilterValue = 'all' | Sector;
type SortField = 'marketCap' | 'ttmRevenue' | 'ttmProfitMargin';
type SortDir = 'asc' | 'desc';

function formatRevenue(value: number): string {
  if (value >= 1e12) return `$${(value / 1e12).toFixed(2)}T`;
  if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`;
  if (value >= 1e6) return `$${(value / 1e6).toFixed(2)}M`;
  return `$${value.toFixed(0)}`;
}

function formatMarketCap(value: number): string {
  if (value >= 1e12) return `$${(value / 1e12).toFixed(1)}T`;
  if (value >= 1e9) return `$${(value / 1e9).toFixed(1)}B`;
  if (value >= 1e6) return `$${(value / 1e6).toFixed(1)}M`;
  return `$${value.toFixed(0)}`;
}

function SkeletonRow() {
  return (
    <TableRow className="animate-pulse">
      {Array.from({ length: 7 }).map((_, i) => (
        <TableCell key={i}>
          <div className="h-4 rounded bg-muted w-16" />
        </TableCell>
      ))}
    </TableRow>
  );
}

function CommentarySkeleton() {
  return <div className="h-4 rounded bg-muted animate-pulse w-48" />;
}

function SortIcon({ field, sortField, sortDir }: { field: SortField; sortField: SortField | null; sortDir: SortDir }) {
  if (sortField !== field) return <span className="ml-1 text-muted-foreground/40">↕</span>;
  return <span className="ml-1">{sortDir === 'asc' ? '↑' : '↓'}</span>;
}

export function CompanyGrid() {
  const [sector, setSector] = useState<FilterValue>('all');
  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortDir, setSortDir] = useState<SortDir>('desc');

  const { data: quotes, isLoading: quotesLoading } = useSWR<StockQuote[]>(
    `/api/quotes?tickers=${TICKERS.join(',')}`
  );

  const { data: financials, isLoading: financialsLoading } = useSWR<CompanyFinancials[]>(
    `/api/financials?tickers=${TICKERS.join(',')}`
  );

  const { data: commentaries, isLoading: commentaryLoading } = useSWR<CompanyCommentary[]>(
    `/api/commentary?tickers=${TICKERS.join(',')}`
  );

  const isLoading = quotesLoading || financialsLoading;

  const quoteMap = new Map(quotes?.map((q) => [q.ticker, q]) ?? []);
  const financialsMap = new Map(financials?.map((f) => [f.ticker, f]) ?? []);
  const commentaryMap = new Map(commentaries?.map((c) => [c.ticker, c]) ?? []);

  function handleSort(field: SortField) {
    if (sortField === field) {
      setSortDir((d) => (d === 'desc' ? 'asc' : 'desc'));
    } else {
      setSortField(field);
      setSortDir('desc');
    }
  }

  const base = sector === 'all' ? COMPANIES : COMPANIES.filter((c) => c.sector === sector);

  const filtered = sortField
    ? [...base].sort((a, b) => {
        let aVal: number | null | undefined;
        let bVal: number | null | undefined;
        if (sortField === 'marketCap') {
          aVal = quoteMap.get(a.ticker)?.marketCap;
          bVal = quoteMap.get(b.ticker)?.marketCap;
        } else if (sortField === 'ttmRevenue') {
          aVal = financialsMap.get(a.ticker)?.ttmRevenue;
          bVal = financialsMap.get(b.ticker)?.ttmRevenue;
        } else {
          aVal = financialsMap.get(a.ticker)?.ttmProfitMargin;
          bVal = financialsMap.get(b.ticker)?.ttmProfitMargin;
        }
        // nulls always sink to bottom
        if (aVal == null && bVal == null) return 0;
        if (aVal == null) return 1;
        if (bVal == null) return -1;
        return sortDir === 'asc' ? aVal - bVal : bVal - aVal;
      })
    : base;

  return (
    <div className="space-y-4">
      <SectorFilter value={sector} onChange={setSector} />

      <div className="rounded-lg border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-36">Company</TableHead>
                <TableHead>Sector</TableHead>
                <TableHead className="text-right cursor-pointer select-none hover:text-foreground" onClick={() => handleSort('marketCap')}>
                  Market Cap<SortIcon field="marketCap" sortField={sortField} sortDir={sortDir} />
                </TableHead>
                <TableHead className="text-right cursor-pointer select-none hover:text-foreground" onClick={() => handleSort('ttmRevenue')}>
                  TTM Revenue<SortIcon field="ttmRevenue" sortField={sortField} sortDir={sortDir} />
                </TableHead>
                <TableHead className="text-right cursor-pointer select-none hover:text-foreground" onClick={() => handleSort('ttmProfitMargin')}>
                  TTM Profit Margin<SortIcon field="ttmProfitMargin" sortField={sortField} sortDir={sortDir} />
                </TableHead>
                <TableHead>Commentary</TableHead>
                <TableHead>Climate Impact on TTM Performance</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading
                ? Array.from({ length: filtered.length }).map((_, i) => (
                    <SkeletonRow key={i} />
                  ))
                : filtered.map((company) => {
                    const q = quoteMap.get(company.ticker);
                    const f = financialsMap.get(company.ticker);
                    const c = commentaryMap.get(company.ticker);
                    const margin = f?.ttmProfitMargin;
                    const marginPositive = margin !== null && margin !== undefined && margin >= 0;
                    return (
                      <TableRow key={company.ticker} className="hover:bg-muted/30 cursor-pointer">
                        <TableCell>
                          <Link
                            href={`/company/${company.ticker}`}
                            className="flex flex-col hover:text-primary transition-colors"
                          >
                            <span className="font-mono text-xs text-muted-foreground">
                              {company.ticker}
                            </span>
                            <span className="font-medium text-sm leading-tight">
                              {company.name}
                            </span>
                          </Link>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="text-xs whitespace-nowrap">
                            {SECTOR_LABELS[company.sector]}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right tabular-nums text-sm text-muted-foreground">
                          {q ? formatMarketCap(q.marketCap) : '—'}
                        </TableCell>
                        <TableCell className="text-right tabular-nums text-sm text-muted-foreground">
                          {f?.ttmRevenue != null ? formatRevenue(f.ttmRevenue) : '—'}
                        </TableCell>
                        <TableCell
                          className={`text-right tabular-nums text-sm font-medium ${
                            margin != null
                              ? marginPositive
                                ? 'text-green-500'
                                : 'text-red-500'
                              : 'text-muted-foreground'
                          }`}
                        >
                          {margin != null ? `${(margin * 100).toFixed(2)}%` : '—'}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground min-w-[280px] max-w-sm whitespace-normal leading-relaxed">
                          {commentaryLoading ? (
                            <CommentarySkeleton />
                          ) : c ? (
                            c.commentary
                          ) : (
                            '—'
                          )}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground min-w-[280px] max-w-sm whitespace-normal leading-relaxed">
                          {commentaryLoading ? (
                            <CommentarySkeleton />
                          ) : c ? (
                            c.climateImpact
                          ) : (
                            '—'
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}

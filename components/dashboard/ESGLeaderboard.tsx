'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { COMPANIES, SECTOR_LABELS } from '@/lib/companies';
import type { Company } from '@/lib/types';

type SortField = 'overall' | 'environmental' | 'social' | 'governance' | 'carbonIntensity' | 'renewableEnergy';

const ESG_RATING_COLORS: Record<string, string> = {
  AAA: 'text-emerald-400 font-bold',
  AA: 'text-emerald-400 font-bold',
  A: 'text-green-400 font-bold',
  BBB: 'text-yellow-400 font-semibold',
  BB: 'text-orange-400 font-semibold',
  B: 'text-red-400 font-semibold',
  CCC: 'text-red-600 font-bold',
};

const CDP_COLORS: Record<string, string> = {
  A: 'text-emerald-400',
  'A-': 'text-emerald-400',
  B: 'text-green-400',
  'B-': 'text-yellow-400',
  C: 'text-orange-400',
  D: 'text-red-400',
};

function ScoreBar({ value, max = 100 }: { value: number; max?: number }) {
  const pct = (value / max) * 100;
  const color = pct >= 70 ? 'bg-green-500' : pct >= 50 ? 'bg-yellow-500' : 'bg-red-500';
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 w-16 rounded-full bg-muted overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-sm tabular-nums">{value}</span>
    </div>
  );
}

export function ESGLeaderboard() {
  const [sortField, setSortField] = useState<SortField>('overall');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  function handleSort(field: SortField) {
    if (field === sortField) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDir(field === 'carbonIntensity' ? 'asc' : 'desc');
    }
  }

  const sorted = [...COMPANIES].sort((a, b) => {
    let aVal: number, bVal: number;
    if (sortField === 'carbonIntensity') {
      aVal = a.climate.carbonIntensity;
      bVal = b.climate.carbonIntensity;
    } else if (sortField === 'renewableEnergy') {
      aVal = a.climate.renewableEnergy;
      bVal = b.climate.renewableEnergy;
    } else {
      aVal = a.esg[sortField];
      bVal = b.esg[sortField];
    }
    return sortDir === 'desc' ? bVal - aVal : aVal - bVal;
  });

  function SortHeader({ field, label }: { field: SortField; label: string }) {
    return (
      <TableHead
        className="cursor-pointer select-none hover:text-foreground whitespace-nowrap"
        onClick={() => handleSort(field)}
      >
        {label}{' '}
        {sortField === field ? (sortDir === 'desc' ? '▼' : '▲') : <span className="opacity-30">↕</span>}
      </TableHead>
    );
  }

  return (
    <div className="rounded-lg border border-border overflow-hidden">
      <div className="px-4 py-3 border-b border-border bg-muted/30">
        <h2 className="font-semibold text-sm">ESG Leaderboard</h2>
        <p className="text-xs text-muted-foreground">Click column headers to sort</p>
      </div>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-8">#</TableHead>
              <TableHead>Company</TableHead>
              <TableHead>Sector</TableHead>
              <SortHeader field="overall" label="Overall" />
              <SortHeader field="environmental" label="E" />
              <SortHeader field="social" label="S" />
              <SortHeader field="governance" label="G" />
              <TableHead>Rating</TableHead>
              <TableHead>CDP</TableHead>
              <SortHeader field="carbonIntensity" label="Carbon Intensity" />
              <SortHeader field="renewableEnergy" label="Renewables %" />
              <TableHead>Net Zero</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sorted.map((company, i) => (
              <TableRow key={company.ticker} className="hover:bg-muted/30">
                <TableCell className="text-muted-foreground text-sm">{i + 1}</TableCell>
                <TableCell>
                  <Link
                    href={`/company/${company.ticker}`}
                    className="flex flex-col hover:text-primary transition-colors"
                  >
                    <span className="font-mono text-xs text-muted-foreground">{company.ticker}</span>
                    <span className="font-medium text-sm">{company.name}</span>
                  </Link>
                </TableCell>
                <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                  {SECTOR_LABELS[company.sector]}
                </TableCell>
                <TableCell>
                  <ScoreBar value={company.esg.overall} />
                </TableCell>
                <TableCell>
                  <ScoreBar value={company.esg.environmental} />
                </TableCell>
                <TableCell>
                  <ScoreBar value={company.esg.social} />
                </TableCell>
                <TableCell>
                  <ScoreBar value={company.esg.governance} />
                </TableCell>
                <TableCell>
                  <span className={ESG_RATING_COLORS[company.esg.rating]}>
                    {company.esg.rating}
                  </span>
                </TableCell>
                <TableCell>
                  <span className={CDP_COLORS[company.climate.cdpScore]}>
                    {company.climate.cdpScore}
                  </span>
                </TableCell>
                <TableCell className="text-sm tabular-nums">
                  {company.climate.carbonIntensity}
                </TableCell>
                <TableCell className="text-sm tabular-nums">
                  {company.climate.renewableEnergy}%
                </TableCell>
                <TableCell className="text-sm tabular-nums text-muted-foreground">
                  {company.climate.netZeroTarget ?? '—'}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

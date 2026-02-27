'use client';

import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import type { Company } from '@/lib/types';

interface ESGScoreCardProps {
  company: Company;
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

function ScoreRow({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-semibold">{value}</span>
      </div>
      <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${color}`}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}

export function ESGScoreCard({ company }: ESGScoreCardProps) {
  const radarData = [
    { subject: 'Environmental', A: company.esg.environmental, fullMark: 100 },
    { subject: 'Social', A: company.esg.social, fullMark: 100 },
    { subject: 'Governance', A: company.esg.governance, fullMark: 100 },
  ];

  const overallColor =
    company.esg.overall >= 70
      ? 'text-green-500'
      : company.esg.overall >= 50
      ? 'text-yellow-500'
      : 'text-red-500';

  return (
    <div className="rounded-lg border border-border p-4 space-y-4">
      <div className="flex items-start justify-between">
        <h2 className="font-semibold">ESG Score</h2>
        <span
          className={`rounded px-2 py-0.5 text-sm font-bold ${ESG_RATING_COLORS[company.esg.rating]}`}
        >
          {company.esg.rating}
        </span>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-6">
        <div className="flex flex-col items-center">
          <span className={`text-5xl font-bold ${overallColor}`}>{company.esg.overall}</span>
          <span className="text-xs text-muted-foreground mt-1">Overall Score</span>
        </div>

        <ResponsiveContainer width="100%" height={180}>
          <RadarChart data={radarData}>
            <PolarGrid stroke="hsl(var(--border))" />
            <PolarAngleAxis
              dataKey="subject"
              tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--popover))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
                fontSize: 12,
              }}
            />
            <Radar
              name="ESG"
              dataKey="A"
              stroke="#22c55e"
              fill="#22c55e"
              fillOpacity={0.25}
              strokeWidth={2}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      <div className="space-y-3">
        <ScoreRow label="Environmental" value={company.esg.environmental} color="bg-green-500" />
        <ScoreRow label="Social" value={company.esg.social} color="bg-blue-500" />
        <ScoreRow label="Governance" value={company.esg.governance} color="bg-purple-500" />
      </div>

      <p className="text-xs text-muted-foreground">
        MSCI-style rating · Last updated {company.esg.lastUpdated}
      </p>
    </div>
  );
}

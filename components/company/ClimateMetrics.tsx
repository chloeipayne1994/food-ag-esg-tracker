'use client';

import {
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import type { Company } from '@/lib/types';

interface ClimateMetricsProps {
  company: Company;
}

const CDP_COLORS: Record<string, string> = {
  A: 'text-emerald-400 font-bold',
  'A-': 'text-emerald-400 font-bold',
  B: 'text-green-400 font-semibold',
  'B-': 'text-yellow-400 font-semibold',
  C: 'text-orange-400 font-semibold',
  D: 'text-red-400 font-semibold',
};

function MetricTile({
  label,
  value,
  unit,
  note,
}: {
  label: string;
  value: string;
  unit?: string;
  note?: string;
}) {
  return (
    <div className="rounded-md border border-border p-3 space-y-0.5">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-lg font-bold">
        {value}
        {unit && <span className="text-xs font-normal text-muted-foreground ml-1">{unit}</span>}
      </p>
      {note && <p className="text-xs text-muted-foreground">{note}</p>}
    </div>
  );
}

export function ClimateMetrics({ company }: ClimateMetricsProps) {
  const { climate } = company;

  const emissionsData = [
    { name: 'Scope 1', value: climate.scope1, fill: '#ef4444' },
    { name: 'Scope 2', value: climate.scope2, fill: '#f97316' },
    { name: 'Scope 3', value: climate.scope3, fill: '#eab308' },
  ];

  return (
    <div className="rounded-lg border border-border p-4 space-y-5">
      <h2 className="font-semibold">Climate Metrics</h2>

      <div>
        <h3 className="text-sm text-muted-foreground mb-3">GHG Emissions (MT CO₂e)</h3>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={emissionsData} margin={{ top: 4, right: 8, bottom: 4, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
            <XAxis
              dataKey="name"
              tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => `${v}`}
              width={35}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--popover))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
                fontSize: 12,
              }}
              formatter={(value: number | undefined) => value !== undefined ? [`${value} MT CO₂e`, ''] : ['—', '']}
            />
            <Bar dataKey="value" radius={[4, 4, 0, 0]}>
              {emissionsData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        <div className="flex gap-4 justify-center mt-2">
          {emissionsData.map((item) => (
            <div key={item.name} className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: item.fill }} />
              <span className="text-xs text-muted-foreground">{item.name}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <MetricTile
          label="Carbon Intensity"
          value={climate.carbonIntensity.toString()}
          unit="tCO₂e/$M rev"
        />
        <MetricTile
          label="Renewable Energy"
          value={`${climate.renewableEnergy}%`}
          note="of total energy use"
        />
        <MetricTile
          label="Net Zero Target"
          value={climate.netZeroTarget?.toString() ?? 'Not set'}
          note={climate.netZeroTarget ? 'target year' : undefined}
        />
        <MetricTile
          label="Scope 1 Emissions"
          value={climate.scope1.toString()}
          unit="MT CO₂e"
        />
        <MetricTile
          label="Scope 2 Emissions"
          value={climate.scope2.toString()}
          unit="MT CO₂e"
        />
        <MetricTile
          label="Scope 3 Emissions"
          value={climate.scope3.toString()}
          unit="MT CO₂e"
        />
      </div>

      <div className="flex items-center justify-between rounded-md border border-border p-3">
        <div>
          <p className="text-xs text-muted-foreground">CDP Climate Score</p>
          <p className="text-sm font-medium mt-0.5">Carbon Disclosure Project</p>
        </div>
        <span className={`text-2xl ${CDP_COLORS[climate.cdpScore]}`}>{climate.cdpScore}</span>
      </div>
    </div>
  );
}

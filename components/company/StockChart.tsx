'use client';

import { useState } from 'react';
import useSWR from 'swr';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Button } from '@/components/ui/button';
import type { ChartDataPoint } from '@/lib/types';

type Period = '1W' | '1M' | '3M' | '1Y';
const PERIODS: Period[] = ['1W', '1M', '3M', '1Y'];

interface StockChartProps {
  ticker: string;
}

export function StockChart({ ticker }: StockChartProps) {
  const [period, setPeriod] = useState<Period>('1M');

  const { data, isLoading, error } = useSWR<ChartDataPoint[]>(
    `/api/chart/${ticker}?period=${period}`
  );

  const isUp =
    data && data.length >= 2
      ? data[data.length - 1].close >= data[0].close
      : true;

  const lineColor = isUp ? '#22c55e' : '#ef4444';

  return (
    <div className="rounded-lg border border-border p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold">Price History</h2>
        <div className="flex gap-1">
          {PERIODS.map((p) => (
            <Button
              key={p}
              variant={period === p ? 'default' : 'ghost'}
              size="sm"
              className="h-7 px-3 text-xs"
              onClick={() => setPeriod(p)}
            >
              {p}
            </Button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="h-64 flex items-center justify-center">
          <div className="animate-pulse text-muted-foreground text-sm">Loading chart...</div>
        </div>
      ) : error || !data ? (
        <div className="h-64 flex items-center justify-center">
          <p className="text-muted-foreground text-sm">Chart data unavailable</p>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={data} margin={{ top: 4, right: 4, bottom: 4, left: 4 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v: string) => {
                const d = new Date(v);
                return period === '1Y'
                  ? d.toLocaleDateString('en-US', { month: 'short' })
                  : d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
              }}
              interval="preserveStartEnd"
            />
            <YAxis
              tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
              tickLine={false}
              axisLine={false}
              domain={['auto', 'auto']}
              tickFormatter={(v: number) => `$${v.toFixed(0)}`}
              width={50}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--popover))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
                fontSize: 12,
              }}
              labelStyle={{ color: 'hsl(var(--muted-foreground))' }}
              formatter={(value: number | undefined) => value !== undefined ? [`$${value.toFixed(2)}`, 'Close'] : ['—', 'Close']}
            />
            <Line
              type="monotone"
              dataKey="close"
              stroke={lineColor}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}

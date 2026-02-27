'use client';

import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { Sector } from '@/lib/types';

type FilterValue = 'all' | Sector;

interface SectorFilterProps {
  value: FilterValue;
  onChange: (value: FilterValue) => void;
}

const TABS: { value: FilterValue; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'food-manufacturer', label: 'Food Manufacturers' },
  { value: 'ag-chemical', label: 'Ag Chemicals' },
  { value: 'commodity-trader', label: 'Commodity Traders' },
];

export function SectorFilter({ value, onChange }: SectorFilterProps) {
  return (
    <Tabs value={value} onValueChange={(v) => onChange(v as FilterValue)}>
      <TabsList className="mb-6">
        {TABS.map((tab) => (
          <TabsTrigger key={tab.value} value={tab.value}>
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}

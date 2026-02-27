'use client';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { COMPANIES, SECTOR_LABELS } from '@/lib/companies';
import type { Company } from '@/lib/types';

interface CompanySelectorProps {
  selected: string[];
  onChange: (tickers: string[]) => void;
  max?: number;
}

export function CompanySelector({ selected, onChange, max = 3 }: CompanySelectorProps) {
  const slots = Array.from({ length: max }, (_, i) => i);

  function handleChange(index: number, ticker: string) {
    const next = [...selected];
    if (ticker === '__clear__') {
      next.splice(index, 1);
    } else {
      next[index] = ticker;
    }
    onChange(next.filter(Boolean));
  }

  const groupedCompanies: Record<string, Company[]> = {
    'food-manufacturer': COMPANIES.filter((c) => c.sector === 'food-manufacturer'),
    'ag-chemical': COMPANIES.filter((c) => c.sector === 'ag-chemical'),
    'commodity-trader': COMPANIES.filter((c) => c.sector === 'commodity-trader'),
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold">Select Companies</h2>
        <span className="text-xs text-muted-foreground">
          {selected.length}/{max} selected
        </span>
      </div>
      <div className="flex flex-wrap gap-3">
        {slots.map((i) => (
          <div key={i} className="flex items-center gap-2">
            <Select
              value={selected[i] ?? ''}
              onValueChange={(v) => handleChange(i, v)}
            >
              <SelectTrigger className="w-48">
                <SelectValue placeholder={`Company ${i + 1}`} />
              </SelectTrigger>
              <SelectContent>
                {selected[i] && (
                  <SelectItem value="__clear__">
                    <span className="text-muted-foreground">— Clear selection —</span>
                  </SelectItem>
                )}
                {(Object.keys(groupedCompanies) as Company['sector'][]).map((sector) => (
                  <div key={sector}>
                    <div className="px-2 py-1 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      {SECTOR_LABELS[sector]}
                    </div>
                    {groupedCompanies[sector].map((company) => (
                      <SelectItem
                        key={company.ticker}
                        value={company.ticker}
                        disabled={
                          selected.includes(company.ticker) &&
                          selected[i] !== company.ticker
                        }
                      >
                        <span className="font-mono text-xs text-muted-foreground mr-2">
                          {company.ticker}
                        </span>
                        {company.name}
                      </SelectItem>
                    ))}
                  </div>
                ))}
              </SelectContent>
            </Select>
          </div>
        ))}
      </div>
      {selected.length > 0 && (
        <Button
          variant="ghost"
          size="sm"
          className="text-muted-foreground"
          onClick={() => onChange([])}
        >
          Clear all
        </Button>
      )}
    </div>
  );
}

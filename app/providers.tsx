'use client';

import { SWRConfig } from 'swr';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SWRConfig
      value={{
        fetcher: (url: string) => fetch(url).then((r) => r.json()),
        refreshInterval: 300000, // refresh every 5 minutes
        revalidateOnFocus: false,
      }}
    >
      {children}
    </SWRConfig>
  );
}

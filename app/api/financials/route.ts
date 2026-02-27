import { NextRequest, NextResponse } from 'next/server';
import createYahooFinance from 'yahoo-finance2/createYahooFinance';
import * as modules from 'yahoo-finance2/modules';
import { TICKERS } from '@/lib/companies';

const YahooFinanceClass = createYahooFinance({ modules });
const yf = new YahooFinanceClass({ suppressNotices: ['yahooSurvey'] });

export interface CompanyFinancials {
  ticker: string;
  ttmRevenue: number | null;
  ttmProfitMargin: number | null;
}

export const revalidate = 3600; // 1-hour cache (financials change less often)

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const tickersParam = searchParams.get('tickers');
  const tickers = tickersParam ? tickersParam.split(',').map((t) => t.trim()) : TICKERS;

  const results = await Promise.allSettled(
    tickers.map(async (ticker): Promise<CompanyFinancials> => {
      const summary = await yf.quoteSummary(ticker, { modules: ['financialData'] });
      return {
        ticker: ticker.toUpperCase(),
        ttmRevenue: summary.financialData?.totalRevenue ?? null,
        ttmProfitMargin: summary.financialData?.profitMargins ?? null,
      };
    })
  );

  const data = results
    .filter((r): r is PromiseFulfilledResult<CompanyFinancials> => r.status === 'fulfilled')
    .map((r) => r.value);

  return NextResponse.json(data, {
    headers: { 'Cache-Control': 's-maxage=3600, stale-while-revalidate=300' },
  });
}

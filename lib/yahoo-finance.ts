import createYahooFinance from 'yahoo-finance2/createYahooFinance';
import * as modules from 'yahoo-finance2/modules';
import type { StockQuote, ChartDataPoint } from './types';

const YahooFinanceClass = createYahooFinance({ modules });
const yf = new YahooFinanceClass({
  suppressNotices: ['yahooSurvey', 'ripHistorical'],
});

export async function fetchQuote(ticker: string): Promise<StockQuote> {
  const result = await yf.quote(ticker);

  return {
    ticker: ticker.toUpperCase(),
    price: result.regularMarketPrice ?? 0,
    change: result.regularMarketChange ?? 0,
    changePercent: result.regularMarketChangePercent ?? 0,
    marketCap: result.marketCap ?? 0,
    volume: result.regularMarketVolume ?? 0,
    fiftyTwoWeekHigh: result.fiftyTwoWeekHigh ?? 0,
    fiftyTwoWeekLow: result.fiftyTwoWeekLow ?? 0,
    currency: result.currency ?? 'USD',
  };
}

export async function fetchQuotes(tickers: string[]): Promise<StockQuote[]> {
  const results = await Promise.allSettled(tickers.map(fetchQuote));
  return results
    .filter((r): r is PromiseFulfilledResult<StockQuote> => r.status === 'fulfilled')
    .map((r) => r.value);
}

type Period = '1W' | '1M' | '3M' | '1Y';

function periodToDates(period: Period): {
  period1: string;
  period2: string;
  interval: '1d' | '1wk';
} {
  const now = new Date();
  const fmt = (d: Date) => d.toISOString().split('T')[0];
  switch (period) {
    case '1W': {
      const start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      return { period1: fmt(start), period2: fmt(now), interval: '1d' };
    }
    case '1M': {
      const start = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      return { period1: fmt(start), period2: fmt(now), interval: '1d' };
    }
    case '3M': {
      const start = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
      return { period1: fmt(start), period2: fmt(now), interval: '1d' };
    }
    case '1Y': {
      const start = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
      return { period1: fmt(start), period2: fmt(now), interval: '1wk' };
    }
  }
}

export async function fetchChartData(
  ticker: string,
  period: Period = '1M'
): Promise<ChartDataPoint[]> {
  const { period1, period2, interval } = periodToDates(period);
  const result = await yf.chart(ticker, { period1, period2, interval });

  return (result.quotes ?? []).map((row) => ({
    date: row.date instanceof Date
      ? row.date.toISOString().split('T')[0]
      : String(row.date).split('T')[0],
    close: row.close ?? 0,
    volume: row.volume ?? 0,
  }));
}

import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import createYahooFinance from 'yahoo-finance2/createYahooFinance';
import * as modules from 'yahoo-finance2/modules';
import { COMPANIES, TICKERS } from '@/lib/companies';

const YahooFinanceClass = createYahooFinance({ modules });
const yf = new YahooFinanceClass({ suppressNotices: ['yahooSurvey'] });

export interface CompanyCommentary {
  ticker: string;
  commentary: string;
  climateImpact: string;
}

interface CompanyData {
  ticker: string;
  name: string;
  sector: string;
  price: number | null | undefined;
  changePercent: number | null | undefined;
  marketCap: number | null | undefined;
  ttmRevenue: number | null | undefined;
  ttmProfitMargin: number | null | undefined;
}

export const revalidate = 3600; // 1-hour cache

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const tickersParam = searchParams.get('tickers');
  const tickers = tickersParam ? tickersParam.split(',').map((t) => t.trim()) : TICKERS;

  // Fetch financial data for all requested tickers
  const financialResults = await Promise.allSettled(
    tickers.map(async (ticker): Promise<CompanyData> => {
      const company = COMPANIES.find((c) => c.ticker === ticker.toUpperCase());
      const [quote, summary] = await Promise.allSettled([
        yf.quote(ticker),
        yf.quoteSummary(ticker, { modules: ['financialData'] }),
      ]);
      return {
        ticker: ticker.toUpperCase(),
        name: company?.name ?? ticker,
        sector: company?.sector ?? 'unknown',
        price: quote.status === 'fulfilled' ? quote.value.regularMarketPrice : null,
        changePercent: quote.status === 'fulfilled' ? quote.value.regularMarketChangePercent : null,
        marketCap: quote.status === 'fulfilled' ? quote.value.marketCap : null,
        ttmRevenue: summary.status === 'fulfilled' ? summary.value.financialData?.totalRevenue : null,
        ttmProfitMargin: summary.status === 'fulfilled' ? summary.value.financialData?.profitMargins : null,
      };
    })
  );

  const companies = financialResults
    .filter((r): r is PromiseFulfilledResult<CompanyData> => r.status === 'fulfilled')
    .map((r) => r.value);

  // Build a single prompt for all companies
  const companySummaries = companies.map((c) => {
    const capStr = c.marketCap ? `$${(c.marketCap / 1e9).toFixed(1)}B market cap` : '';
    const revStr = c.ttmRevenue ? `$${(c.ttmRevenue / 1e9).toFixed(1)}B TTM revenue` : '';
    const marginStr = c.ttmProfitMargin != null ? `${(c.ttmProfitMargin * 100).toFixed(1)}% TTM profit margin` : '';
    const changeStr = c.changePercent != null ? `${c.changePercent >= 0 ? '+' : ''}${c.changePercent.toFixed(2)}% today` : '';
    const parts = [capStr, revStr, marginStr, changeStr].filter(Boolean).join(', ');
    return `- ${c.ticker} (${c.name}, ${c.sector}): ${parts}`;
  }).join('\n');

  const client = new Anthropic();

  const message = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 6000,
    messages: [
      {
        role: 'user',
        content: `You are a financial analyst. For each company below, produce two pieces of analysis:
1. "commentary": Exactly 1 sentence covering the most notable aspect of stock performance and the likely reason behind it.
2. "climateImpact": Exactly 1 sentence on how climate change has specifically impacted this company's TTM financial performance — consider physical risks (weather, supply chain), transition risks (carbon costs, regulation), commodity price volatility driven by climate, and any revenue opportunities from sustainability trends.

Reply with JSON only, as an array: [{"ticker":"...","commentary":"...","climateImpact":"..."}]

${companySummaries}`,
      },
    ],
  });

  const raw = message.content[0].type === 'text' ? message.content[0].text : '[]';

  function toOneSentence(text: string): string {
    // Split only on punctuation followed by whitespace + capital letter (true sentence boundaries)
    const match = text.match(/^.+?[.!?](?=\s+[A-Z]|$)/);
    return (match ? match[0] : text).trim();
  }

  let parsed: CompanyCommentary[];
  try {
    // Strip potential markdown code fences
    const clean = raw.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```\s*$/i, '').trim();
    const raw_parsed = JSON.parse(clean);
    parsed = raw_parsed.map((item: CompanyCommentary) => ({
      ...item,
      commentary: toOneSentence(item.commentary),
      climateImpact: toOneSentence(item.climateImpact),
    }));
  } catch (e) {
    console.error('[commentary] JSON parse failed. Stop_reason:', message.stop_reason, 'Raw (last 200):', raw.slice(-200), 'Error:', e);
    parsed = companies.map((c) => ({ ticker: c.ticker, commentary: 'Commentary unavailable.', climateImpact: 'Data unavailable.' }));
  }

  return NextResponse.json(parsed, {
    headers: { 'Cache-Control': 's-maxage=3600, stale-while-revalidate=300' },
  });
}

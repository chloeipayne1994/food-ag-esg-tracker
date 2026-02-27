import { NextRequest, NextResponse } from 'next/server';
import { fetchQuotes } from '@/lib/yahoo-finance';
import { TICKERS } from '@/lib/companies';

export const revalidate = 300; // 5-minute cache

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const tickersParam = searchParams.get('tickers');
  const tickers = tickersParam ? tickersParam.split(',').map((t) => t.trim()) : TICKERS;

  try {
    const quotes = await fetchQuotes(tickers);
    return NextResponse.json(quotes, {
      headers: { 'Cache-Control': 's-maxage=300, stale-while-revalidate=60' },
    });
  } catch (error) {
    console.error('Error fetching quotes:', error);
    return NextResponse.json({ error: 'Failed to fetch quotes' }, { status: 500 });
  }
}

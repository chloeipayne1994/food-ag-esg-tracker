import { NextRequest, NextResponse } from 'next/server';
import { fetchQuote } from '@/lib/yahoo-finance';

export const revalidate = 300;

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ ticker: string }> }
) {
  const { ticker } = await params;
  try {
    const quote = await fetchQuote(ticker.toUpperCase());
    return NextResponse.json(quote, {
      headers: { 'Cache-Control': 's-maxage=300, stale-while-revalidate=60' },
    });
  } catch (error) {
    console.error(`Error fetching quote for ${ticker}:`, error);
    return NextResponse.json({ error: `Failed to fetch quote for ${ticker}` }, { status: 500 });
  }
}

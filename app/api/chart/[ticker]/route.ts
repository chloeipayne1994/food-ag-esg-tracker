import { NextRequest, NextResponse } from 'next/server';
import { fetchChartData } from '@/lib/yahoo-finance';

export const revalidate = 300;

type Period = '1W' | '1M' | '3M' | '1Y';
const VALID_PERIODS: Period[] = ['1W', '1M', '3M', '1Y'];

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ ticker: string }> }
) {
  const { ticker } = await params;
  const { searchParams } = new URL(request.url);
  const rawPeriod = (searchParams.get('period') ?? '1M').toUpperCase();
  const period: Period = VALID_PERIODS.includes(rawPeriod as Period)
    ? (rawPeriod as Period)
    : '1M';

  try {
    const data = await fetchChartData(ticker.toUpperCase(), period);
    return NextResponse.json(data, {
      headers: { 'Cache-Control': 's-maxage=300, stale-while-revalidate=60' },
    });
  } catch (error) {
    console.error(`Error fetching chart data for ${ticker}:`, error);
    return NextResponse.json({ error: `Failed to fetch chart data for ${ticker}` }, { status: 500 });
  }
}

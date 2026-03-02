export type Sector = 'food-manufacturer' | 'ag-chemical' | 'commodity-trader' | 'seeds-genetics' | 'animal-feed';
export type ESGRating = 'AAA' | 'AA' | 'A' | 'BBB' | 'BB' | 'B' | 'CCC';
export type CDPScore = 'A' | 'A-' | 'B' | 'B-' | 'C' | 'D';

export interface ESGData {
  overall: number;        // 0–100
  environmental: number;
  social: number;
  governance: number;
  rating: ESGRating;      // MSCI-style
  lastUpdated: string;
}

export interface ClimateData {
  scope1: number;         // MT CO2e
  scope2: number;
  scope3: number;
  carbonIntensity: number; // tCO2e per $M revenue
  renewableEnergy: number; // percent
  netZeroTarget: number | null; // year, e.g. 2050
  cdpScore: CDPScore;
}

export interface Company {
  ticker: string;
  name: string;
  sector: Sector;
  country: string;
  description: string;
  esg: ESGData;
  climate: ClimateData;
}

export interface StockQuote {
  ticker: string;
  price: number;
  change: number;
  changePercent: number;
  marketCap: number;
  volume: number;
  fiftyTwoWeekHigh: number;
  fiftyTwoWeekLow: number;
  currency: string;
}

export interface ChartDataPoint {
  date: string;
  close: number;
  volume: number;
}

export interface CompanyFinancials {
  ticker: string;
  ttmRevenue: number | null;
  ttmProfitMargin: number | null;
}

export interface CompanyCommentary {
  ticker: string;
  commentary: string;
  climateImpact: string;
}

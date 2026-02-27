import { CompanyGrid } from '@/components/dashboard/CompanyGrid';
import { ESGLeaderboard } from '@/components/dashboard/ESGLeaderboard';

export default function DashboardPage() {
  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Food & Ag ESG Tracker</h1>
        <p className="mt-1 text-muted-foreground">
          Real-time stock performance and sustainability data for 14 leading food, agriculture, and
          commodity companies.
        </p>
      </div>

      <CompanyGrid />

      <ESGLeaderboard />
    </div>
  );
}

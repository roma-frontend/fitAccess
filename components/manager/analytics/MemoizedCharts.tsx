// components/manager/analytics/MemoizedCharts.tsx
import { memo } from 'react';
import RevenueChart from './RevenueChart';
import BookingsChart from './BookingsChart';

interface MonthlyData {
  month: string;
  revenue: number;
  bookings: number;
  clients: number;
}

interface MemoizedChartsProps {
  monthlyData: MonthlyData[];
}

const MemoizedRevenueChart = memo(RevenueChart);
const MemoizedBookingsChart = memo(BookingsChart);

export const MemoizedCharts = memo(function MemoizedCharts({ monthlyData }: MemoizedChartsProps) {
  return (
    <div className="lg:col-span-2 space-y-6">
      <MemoizedRevenueChart data={monthlyData} />
      <MemoizedBookingsChart data={monthlyData} />
    </div>
  );
});

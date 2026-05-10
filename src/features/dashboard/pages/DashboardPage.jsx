import { useState } from "react";
import { Link } from "react-router-dom";
import { PageHeader } from "@/components/shared/PageHeader/PageHeader";
import { Card, CardTitle } from "@/components/ui/Card/Card";
import {
  PeriodSelector,
  DEFAULT_PERIOD,
} from "@/features/dashboard/components/PeriodSelector";
import { StatsRow } from "@/features/dashboard/components/StatsRow";
import { RevenueChart } from "@/features/dashboard/components/RevenueChart";
import { StatusBreakdown } from "@/features/dashboard/components/StatusBreakdown";
import { TopServicesList } from "@/features/dashboard/components/TopServicesList";
import { RecentOrdersTable } from "@/features/dashboard/components/RecentOrdersTable";
import {
  useOverview,
  useRevenueChart,
  useTopServices,
  useRecentOrders,
} from "@/features/dashboard/hooks/useDashboard";
import { ru } from "@/locales/ru";
import styles from "./DashboardPage.module.css";

export function DashboardPage() {
  const [period, setPeriod] = useState(DEFAULT_PERIOD);

  const overviewQuery = useOverview(period);
  const revenueQuery = useRevenueChart(period, "day");
  const topServicesQuery = useTopServices(period, 5);
  const recentOrdersQuery = useRecentOrders(10);

  const overview = overviewQuery.data;

  return (
    <>
      <PageHeader
        title={ru.dashboard.title}
        action={<PeriodSelector value={period} onChange={setPeriod} />}
      />

      <StatsRow overview={overview} isLoading={overviewQuery.isLoading} />

      <div className={styles.row2}>
        <Card
          variant="elevated"
          header={<CardTitle>{ru.dashboard.sections.revenueChart}</CardTitle>}
        >
          <RevenueChart
            data={revenueQuery.data?.items ?? revenueQuery.data}
            isLoading={revenueQuery.isLoading}
          />
        </Card>

        <Card
          variant="elevated"
          header={<CardTitle>{ru.dashboard.sections.statusBreakdown}</CardTitle>}
        >
          <StatusBreakdown
            byStatus={overview?.by_status}
            isLoading={overviewQuery.isLoading}
          />
        </Card>
      </div>

      <div className={styles.row2}>
        <Card
          variant="elevated"
          header={<CardTitle>{ru.dashboard.sections.topServices}</CardTitle>}
        >
          <TopServicesList
            items={topServicesQuery.data?.items ?? topServicesQuery.data}
            isLoading={topServicesQuery.isLoading}
          />
        </Card>

        <Card
          variant="elevated"
          header={
            <div className={styles.cardHeaderRow}>
              <CardTitle>{ru.dashboard.sections.recentOrders}</CardTitle>
              <Link to="/orders" className={styles.viewAll}>
                {ru.dashboard.recentOrders.viewAll}
              </Link>
            </div>
          }
        >
          <RecentOrdersTable
            items={recentOrdersQuery.data?.items ?? recentOrdersQuery.data}
            isLoading={recentOrdersQuery.isLoading}
          />
        </Card>
      </div>
    </>
  );
}

import { ShoppingCart, DollarSign, TrendingUp, Users } from "lucide-react";
import { StatsCard } from "@/components/shared/StatsCard/StatsCard";
import { LoadingSkeleton } from "@/components/shared/LoadingSkeleton/LoadingSkeleton";
import { MoneyAmount } from "@/components/shared/MoneyAmount/MoneyAmount";
import { ru } from "@/locales/ru";
import styles from "./StatsRow.module.css";

function NumberValue({ value, isLoading }) {
  if (isLoading) return <LoadingSkeleton width={64} height={20} />;
  return <span>{Number(value ?? 0).toLocaleString("ru-RU")}</span>;
}

function MoneyValue({ value, isLoading }) {
  if (isLoading) return <LoadingSkeleton width={96} height={20} />;
  return <MoneyAmount amountUsd={value ?? 0} size="lg" />;
}

export function StatsRow({ overview, isLoading }) {
  return (
    <div className={styles.row}>
      <StatsCard
        icon={<ShoppingCart size={20} />}
        label={ru.dashboard.stats.totalOrders}
        value={<NumberValue value={overview?.total_orders} isLoading={isLoading} />}
      />
      <StatsCard
        icon={<DollarSign size={20} />}
        label={ru.dashboard.stats.totalRevenue}
        value={<MoneyValue value={overview?.total_revenue_usd} isLoading={isLoading} />}
        color="success"
      />
      <StatsCard
        icon={<TrendingUp size={20} />}
        label={ru.dashboard.stats.averageOrderValue}
        value={<MoneyValue value={overview?.average_order_value_usd} isLoading={isLoading} />}
        color="info"
      />
      <StatsCard
        icon={<Users size={20} />}
        label={ru.dashboard.stats.newClients}
        value={<NumberValue value={overview?.new_clients} isLoading={isLoading} />}
        color="warning"
      />
    </div>
  );
}

import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Table } from "@/components/ui/Table/Table";
import { Badge } from "@/components/ui/Badge/Badge";
import { StatusBadge } from "@/components/shared/StatusBadge/StatusBadge";
import { MoneyAmount } from "@/components/shared/MoneyAmount/MoneyAmount";
import { EmptyState } from "@/components/shared/EmptyState/EmptyState";
import { PAYMENT_METHOD_VARIANT } from "@/features/orders/constants";
import { formatRelativeDate } from "@/lib/utils";
import { ru } from "@/locales/ru";
import styles from "./RecentOrdersTable.module.css";

export function RecentOrdersTable({ items, isLoading }) {
  const navigate = useNavigate();

  const columns = useMemo(
    () => [
      {
        id: "order_number",
        header: ru.orders.columns.orderNumber,
        size: 180,
        cell: ({ row }) => (
          <span className={styles.orderNumber}>{row.original.order_number}</span>
        ),
      },
      {
        id: "client",
        header: ru.orders.columns.client,
        cell: ({ row }) => {
          const order = row.original;
          const email = order.client?.email ?? order.client_email ?? "—";
          return <span className={styles.client}>{email}</span>;
        },
      },
      {
        id: "status",
        header: ru.orders.columns.status,
        size: 130,
        cell: ({ row }) => <StatusBadge type="order" status={row.original.status} />,
      },
      {
        id: "payment",
        header: ru.orders.columns.payment,
        size: 140,
        cell: ({ row }) => {
          const method = row.original.payment_method;
          return (
            <Badge variant={PAYMENT_METHOD_VARIANT[method] ?? "neutral"}>
              {ru.orders.paymentMethod[method] ?? method}
            </Badge>
          );
        },
      },
      {
        id: "total",
        header: ru.orders.columns.total,
        size: 110,
        align: "right",
        cell: ({ row }) => (
          <MoneyAmount amountUsd={row.original.final_total_usd} size="sm" />
        ),
      },
      {
        id: "date",
        header: ru.orders.columns.date,
        size: 140,
        cell: ({ row }) => formatRelativeDate(row.original.created_at),
      },
    ],
    [],
  );

  if (!isLoading && (!Array.isArray(items) || items.length === 0)) {
    return <EmptyState title={ru.dashboard.recentOrders.empty} />;
  }

  return (
    <Table
      columns={columns}
      data={items ?? []}
      isLoading={isLoading}
      onRowClick={(order) => order?.id && navigate(`/orders/${order.id}`)}
    />
  );
}

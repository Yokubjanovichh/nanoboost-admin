import { useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Eye } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader/PageHeader";
import { Table } from "@/components/ui/Table/Table";
import { Pagination } from "@/components/ui/Pagination/Pagination";
import { SearchInput } from "@/components/ui/SearchInput/SearchInput";
import { FilterBar } from "@/components/ui/FilterBar/FilterBar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select/Select";
import { Badge } from "@/components/ui/Badge/Badge";
import { StatusBadge } from "@/components/shared/StatusBadge/StatusBadge";
import { EmptyState } from "@/components/shared/EmptyState/EmptyState";
import { Button } from "@/components/ui/Button/Button";
import { MoneyAmount } from "@/components/shared/MoneyAmount/MoneyAmount";
import { DateRangeFilter } from "@/components/forms/DateRangeFilter/DateRangeFilter";
import { useOrdersList } from "@/features/orders/hooks/useOrders";
import { ORDER_STATUSES, PAYMENT_METHODS, PAYMENT_METHOD_VARIANT } from "@/features/orders/constants";
import { formatDate } from "@/lib/utils";
import { ru } from "@/locales/ru";
import styles from "./OrdersListPage.module.css";

function parseSearchParams(sp) {
  return {
    page: Number(sp.get("page")) || 1,
    pageSize: Number(sp.get("page_size")) || 20,
    search: sp.get("search") ?? "",
    status: sp.get("status") ?? "",
    paymentMethod: sp.get("payment_method") ?? "",
    dateFrom: sp.get("date_from") ?? "",
    dateTo: sp.get("date_to") ?? "",
    sort: sp.get("sort") ?? "-created_at",
  };
}

function buildApiParams(filters) {
  const params = { page: filters.page, page_size: filters.pageSize, sort: filters.sort };
  if (filters.search) params.search = filters.search;
  if (filters.status) params.status = filters.status;
  if (filters.paymentMethod) params.payment_method = filters.paymentMethod;
  if (filters.dateFrom) params.date_from = filters.dateFrom;
  if (filters.dateTo) params.date_to = filters.dateTo;
  return params;
}

export function OrdersListPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const filters = parseSearchParams(searchParams);
  const { data, isLoading, isError, error, refetch } = useOrdersList(buildApiParams(filters));
  const items = data?.items ?? [];
  const total = data?.total ?? 0;

  const updateParams = (next) => {
    const merged = { ...filters, ...next };
    const sp = new URLSearchParams();
    if (merged.page > 1) sp.set("page", String(merged.page));
    if (merged.pageSize !== 20) sp.set("page_size", String(merged.pageSize));
    if (merged.search) sp.set("search", merged.search);
    if (merged.status) sp.set("status", merged.status);
    if (merged.paymentMethod) sp.set("payment_method", merged.paymentMethod);
    if (merged.dateFrom) sp.set("date_from", merged.dateFrom);
    if (merged.dateTo) sp.set("date_to", merged.dateTo);
    if (merged.sort && merged.sort !== "-created_at") sp.set("sort", merged.sort);
    setSearchParams(sp);
  };

  const hasActiveFilters = Boolean(
    filters.search ||
      filters.status ||
      filters.paymentMethod ||
      filters.dateFrom ||
      filters.dateTo,
  );

  const resetFilters = () => {
    const sp = new URLSearchParams();
    if (filters.sort && filters.sort !== "-created_at") sp.set("sort", filters.sort);
    setSearchParams(sp);
  };

  const columns = useMemo(
    () => [
      {
        id: "order_number",
        header: ru.orders.columns.orderNumber,
        size: 180,
        cell: ({ row }) => (
          <Link to={`/orders/${row.original.id}`} className={styles.orderNumber}>
            {row.original.order_number}
          </Link>
        ),
      },
      {
        id: "client",
        header: ru.orders.columns.client,
        cell: ({ row }) => {
          const order = row.original;
          // Defensive: try nested ClientSummary first, then flat fields
          // (some list endpoints lazy-omit nested objects to keep payload small).
          const email = order.client?.email ?? order.client_email ?? order.email;
          const discord = order.client?.discord ?? order.client_discord;
          const telegram = order.client?.telegram ?? order.client_telegram;
          const whatsapp = order.client?.whatsapp ?? order.client_whatsapp;
          const secondary = discord || telegram || whatsapp;
          if (!email && !secondary) {
            return <span className={styles.muted}>—</span>;
          }
          return (
            <div className={styles.clientCell}>
              {email && <span className={styles.clientEmail}>{email}</span>}
              {secondary && <span className={styles.clientSecondary}>{secondary}</span>}
            </div>
          );
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
        size: 160,
        cell: ({ row }) => {
          const method = row.original.payment_method;
          const currency = row.original.display_currency;
          return (
            <div className={styles.paymentCell}>
              <Badge variant={PAYMENT_METHOD_VARIANT[method] ?? "neutral"}>
                {ru.orders.paymentMethod[method] ?? method}
              </Badge>
              {currency && <span className={styles.currencyTag}>{currency}</span>}
            </div>
          );
        },
      },
      {
        id: "total",
        header: ru.orders.columns.total,
        size: 120,
        align: "right",
        // List always shows USD value (Backend doesn't provide final_total_eur).
        // Currency hint is shown separately in the Payment column.
        cell: ({ row }) => (
          <MoneyAmount amountUsd={row.original.final_total_usd} size="sm" />
        ),
      },
      {
        id: "date",
        header: ru.orders.columns.date,
        size: 160,
        cell: ({ row }) => formatDate(row.original.created_at),
      },
      {
        id: "actions",
        header: "",
        size: 60,
        align: "right",
        cell: ({ row }) => (
          <Link to={`/orders/${row.original.id}`} className={styles.eyeBtn} aria-label="Открыть">
            <Eye size={16} />
          </Link>
        ),
      },
    ],
    [],
  );

  if (isError) {
    return (
      <>
        <PageHeader title={ru.orders.title} />
        <EmptyState
          title={ru.common.error}
          description={error?.message ?? ru.auth.unknownError}
          action={
            <Button variant="primary" onClick={() => refetch()}>
              {ru.common.retry}
            </Button>
          }
        />
      </>
    );
  }

  return (
    <>
      <PageHeader title={ru.orders.title} />

      <FilterBar
        leading={
          <SearchInput
            fullWidth
            value={filters.search}
            onChange={(v) => updateParams({ search: v, page: 1 })}
            placeholder={ru.orders.search}
          />
        }
        onReset={resetFilters}
        canReset={hasActiveFilters}
      >
        <Select
          value={filters.status || "__all__"}
          onValueChange={(v) => updateParams({ status: v === "__all__" ? "" : v, page: 1 })}
        >
          <SelectTrigger style={{ width: 180 }}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__all__">{ru.orders.filters.allStatuses}</SelectItem>
            {ORDER_STATUSES.map((s) => (
              <SelectItem key={s} value={s}>
                {ru.orders.status[s]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filters.paymentMethod || "__all__"}
          onValueChange={(v) =>
            updateParams({ paymentMethod: v === "__all__" ? "" : v, page: 1 })
          }
        >
          <SelectTrigger style={{ width: 180 }}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__all__">{ru.orders.filters.allMethods}</SelectItem>
            {PAYMENT_METHODS.map((m) => (
              <SelectItem key={m} value={m}>
                {ru.orders.paymentMethod[m]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <DateRangeFilter
          from={filters.dateFrom}
          to={filters.dateTo}
          onChange={({ from, to }) =>
            updateParams({ dateFrom: from, dateTo: to, page: 1 })
          }
        />
      </FilterBar>

      {!isLoading && items.length === 0 && !filters.search && !filters.status && !filters.paymentMethod && !filters.dateFrom && !filters.dateTo ? (
        <EmptyState title={ru.orders.empty} />
      ) : (
        <>
          <Table columns={columns} data={items} isLoading={isLoading} />
          {total > 0 && (
            <Pagination
              page={filters.page}
              pageSize={filters.pageSize}
              total={total}
              onPageChange={(page) => updateParams({ page })}
              onPageSizeChange={(pageSize) => updateParams({ pageSize, page: 1 })}
            />
          )}
        </>
      )}
    </>
  );
}

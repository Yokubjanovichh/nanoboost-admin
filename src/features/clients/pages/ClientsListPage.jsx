import { useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Eye, MessageCircle, Send, Phone } from "lucide-react";
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
import { Button } from "@/components/ui/Button/Button";
import { EmptyState } from "@/components/shared/EmptyState/EmptyState";
import { MoneyAmount } from "@/components/shared/MoneyAmount/MoneyAmount";
import { useClientsList } from "@/features/clients/hooks/useClients";
import { formatRelativeDate } from "@/lib/utils";
import { ru } from "@/locales/ru";
import styles from "./ClientsListPage.module.css";

const SORT_OPTIONS = [
  { value: "-created_at", label: ru.clients.sort.newestFirst },
  { value: "-total_spent_usd", label: ru.clients.sort.bySpent },
  { value: "-total_orders", label: ru.clients.sort.byOrders },
];

function parseSearchParams(sp) {
  return {
    page: Number(sp.get("page")) || 1,
    pageSize: Number(sp.get("page_size")) || 20,
    search: sp.get("search") ?? "",
    sort: sp.get("sort") ?? "-created_at",
  };
}

function buildApiParams(filters) {
  const params = { page: filters.page, page_size: filters.pageSize, sort: filters.sort };
  if (filters.search) params.search = filters.search;
  return params;
}

export function ClientsListPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const filters = parseSearchParams(searchParams);
  const { data, isLoading, isError, error, refetch } = useClientsList(buildApiParams(filters));
  const items = data?.items ?? [];
  const total = data?.total ?? 0;

  const updateParams = (next) => {
    const merged = { ...filters, ...next };
    const sp = new URLSearchParams();
    if (merged.page > 1) sp.set("page", String(merged.page));
    if (merged.pageSize !== 20) sp.set("page_size", String(merged.pageSize));
    if (merged.search) sp.set("search", merged.search);
    if (merged.sort && merged.sort !== "-created_at") sp.set("sort", merged.sort);
    setSearchParams(sp);
  };

  // Sort is preserved (it's a user preference, not a filter).
  const hasActiveFilters = Boolean(filters.search);

  const resetFilters = () => {
    const sp = new URLSearchParams();
    if (filters.sort && filters.sort !== "-created_at") sp.set("sort", filters.sort);
    setSearchParams(sp);
  };

  const columns = useMemo(
    () => [
      {
        id: "email",
        header: ru.clients.columns.email,
        cell: ({ row }) => (
          <Link to={`/clients/${row.original.id}`} className={styles.email}>
            {row.original.email}
          </Link>
        ),
      },
      {
        id: "contacts",
        header: ru.clients.columns.contacts,
        size: 220,
        cell: ({ row }) => {
          const c = row.original;
          return (
            <div className={styles.contacts}>
              {c.discord && (
                <span className={styles.contactItem} title={`Discord: ${c.discord}`}>
                  <MessageCircle size={12} />
                  <span>{c.discord}</span>
                </span>
              )}
              {c.telegram && (
                <span className={styles.contactItem} title={`Telegram: ${c.telegram}`}>
                  <Send size={12} />
                  <span>{c.telegram}</span>
                </span>
              )}
              {c.whatsapp && (
                <span className={styles.contactItem} title={`WhatsApp: ${c.whatsapp}`}>
                  <Phone size={12} />
                  <span>{c.whatsapp}</span>
                </span>
              )}
              {!c.discord && !c.telegram && !c.whatsapp && <span className={styles.muted}>—</span>}
            </div>
          );
        },
      },
      {
        id: "total_orders",
        header: ru.clients.columns.totalOrders,
        size: 100,
        align: "center",
        cell: ({ row }) => row.original.total_orders ?? 0,
      },
      {
        id: "total_spent",
        header: ru.clients.columns.totalSpent,
        size: 140,
        align: "right",
        cell: ({ row }) => (
          <MoneyAmount amountUsd={row.original.total_spent_usd ?? 0} size="sm" />
        ),
      },
      {
        id: "last_order",
        header: ru.clients.columns.lastOrder,
        size: 160,
        cell: ({ row }) =>
          row.original.last_order_at
            ? formatRelativeDate(row.original.last_order_at)
            : ru.clients.never,
      },
      {
        id: "actions",
        header: "",
        size: 60,
        align: "right",
        cell: ({ row }) => (
          <Link to={`/clients/${row.original.id}`} className={styles.eyeBtn} aria-label="Открыть">
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
        <PageHeader title={ru.clients.title} />
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
      <PageHeader title={ru.clients.title} />

      <FilterBar
        leading={
          <SearchInput
            fullWidth
            value={filters.search}
            onChange={(v) => updateParams({ search: v, page: 1 })}
            placeholder={ru.clients.search}
          />
        }
        trailing={
          <Select value={filters.sort} onValueChange={(v) => updateParams({ sort: v, page: 1 })}>
            <SelectTrigger style={{ width: 220 }}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SORT_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        }
        onReset={resetFilters}
        canReset={hasActiveFilters}
      />

      {!isLoading && items.length === 0 && !filters.search ? (
        <EmptyState title={ru.clients.empty} />
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

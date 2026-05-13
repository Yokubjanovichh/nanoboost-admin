import { useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Plus, ImageIcon } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader/PageHeader";
import { Button } from "@/components/ui/Button/Button";
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
import { StatusBadge } from "@/components/shared/StatusBadge/StatusBadge";
import { EmptyState } from "@/components/shared/EmptyState/EmptyState";
import { GameActions } from "@/features/games/components/GameActions";
import { useGamesList } from "@/features/games/hooks/useGames";
import { useCanManageGames } from "@/features/auth/hooks/useAuth";
import { formatDateOnly } from "@/lib/utils";
import { ru } from "@/locales/ru";
import styles from "./GamesListPage.module.css";

const API_ORIGIN = (() => {
  try {
    return new URL(import.meta.env.VITE_API_URL || "http://localhost:8000/api/v1").origin;
  } catch {
    return "http://localhost:8000";
  }
})();

function resolveImageUrl(url) {
  if (!url) return null;
  if (/^https?:\/\//i.test(url)) return url;
  return `${API_ORIGIN}${url}`;
}

const STATUS_FILTERS = [
  { value: "all", label: ru.games.filterAll },
  { value: "active", label: ru.games.filterActive },
  { value: "inactive", label: ru.games.filterInactive },
];

function parseSearchParams(sp) {
  const page = Number(sp.get("page")) || 1;
  const pageSize = Number(sp.get("page_size")) || 20;
  const search = sp.get("search") ?? "";
  const isActive = sp.get("is_active");
  const sort = sp.get("sort") ?? "-created_at";
  return { page, pageSize, search, isActive, sort };
}

function buildApiParams({ page, pageSize, search, isActive, sort }) {
  const params = { page, page_size: pageSize, sort };
  if (search) params.search = search;
  if (isActive === "true") params.is_active = true;
  if (isActive === "false") params.is_active = false;
  return params;
}

export function GamesListPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const filters = parseSearchParams(searchParams);
  const canManage = useCanManageGames();

  const apiParams = buildApiParams(filters);
  const { data, isLoading, isError, error, refetch } = useGamesList(apiParams);

  const items = data?.items ?? [];
  const total = data?.total ?? 0;

  const updateParams = (next) => {
    const merged = { ...filters, ...next };
    const sp = new URLSearchParams();
    if (merged.page > 1) sp.set("page", String(merged.page));
    if (merged.pageSize !== 20) sp.set("page_size", String(merged.pageSize));
    if (merged.search) sp.set("search", merged.search);
    if (merged.isActive) sp.set("is_active", merged.isActive);
    if (merged.sort && merged.sort !== "-created_at") sp.set("sort", merged.sort);
    setSearchParams(sp);
  };

  const hasActiveFilters = Boolean(filters.search || filters.isActive);

  const resetFilters = () => {
    const sp = new URLSearchParams();
    if (filters.sort && filters.sort !== "-created_at") sp.set("sort", filters.sort);
    setSearchParams(sp);
  };

  const statusValue =
    filters.isActive === "true" ? "active" : filters.isActive === "false" ? "inactive" : "all";

  const columns = useMemo(
    () => [
      {
        id: "image",
        header: ru.games.columns.image,
        size: 64,
        cell: ({ row }) => {
          const src = resolveImageUrl(row.original.image_desktop_url ?? row.original.image_url);
          return src ? (
            <img src={src} alt="" className={styles.thumb} />
          ) : (
            <span className={styles.thumbPlaceholder} aria-hidden="true">
              <ImageIcon size={16} />
            </span>
          );
        },
      },
      {
        id: "name",
        header: ru.games.columns.name,
        accessorKey: "name",
        cell: ({ row }) => <span className={styles.name}>{row.original.name}</span>,
      },
      {
        id: "slug",
        header: ru.games.columns.slug,
        accessorKey: "slug",
        cell: ({ row }) => <code className={styles.slug}>{row.original.slug}</code>,
      },
      {
        id: "status",
        header: ru.games.columns.status,
        size: 120,
        cell: ({ row }) => <StatusBadge isActive={row.original.is_active} />,
      },
      {
        id: "sort_order",
        header: ru.games.columns.sortOrder,
        size: 100,
        align: "center",
        cell: ({ row }) => row.original.sort_order ?? 0,
      },
      {
        id: "created_at",
        header: ru.games.columns.createdAt,
        size: 140,
        cell: ({ row }) => formatDateOnly(row.original.created_at),
      },
      {
        id: "actions",
        header: "",
        size: 60,
        align: "right",
        cell: ({ row }) => <GameActions game={row.original} />,
      },
    ],
    [],
  );

  if (isError) {
    return (
      <>
        <PageHeader title={ru.games.title} />
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

  const hasFilters = Boolean(filters.search || filters.isActive);
  const showEmpty = !isLoading && items.length === 0 && !hasFilters;

  return (
    <>
      <PageHeader
        title={ru.games.title}
        action={
          canManage && (
            <Link to="/games/new">
              <Button variant="primary" icon={<Plus size={16} />}>
                {ru.games.create}
              </Button>
            </Link>
          )
        }
      />

      <FilterBar
        leading={
          <SearchInput
            fullWidth
            value={filters.search}
            onChange={(v) => updateParams({ search: v, page: 1 })}
            placeholder={ru.games.search}
          />
        }
        trailing={
          <Select
            value={statusValue}
            onValueChange={(v) =>
              updateParams({
                isActive: v === "active" ? "true" : v === "inactive" ? "false" : "",
                page: 1,
              })
            }
          >
            <SelectTrigger style={{ width: 180 }}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {STATUS_FILTERS.map((f) => (
                <SelectItem key={f.value} value={f.value}>
                  {f.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        }
        onReset={resetFilters}
        canReset={hasActiveFilters}
      />

      {showEmpty ? (
        <EmptyState
          title={ru.games.empty}
          action={
            canManage && (
              <Link to="/games/new">
                <Button variant="primary" icon={<Plus size={16} />}>
                  {ru.games.emptyAction}
                </Button>
              </Link>
            )
          }
        />
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

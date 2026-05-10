import { useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Plus, ImageIcon, Star } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader/PageHeader";
import { Button } from "@/components/ui/Button/Button";
import { Table } from "@/components/ui/Table/Table";
import { Pagination } from "@/components/ui/Pagination/Pagination";
import { SearchInput } from "@/components/ui/SearchInput/SearchInput";
import { FilterBar } from "@/components/ui/FilterBar/FilterBar";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/Tabs/Tabs";
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
import { GameSelect } from "@/components/forms/GameSelect/GameSelect";
import { ServiceActions } from "@/features/services/components/ServiceActions";
import { useServicesList } from "@/features/services/hooks/useServices";
import { useCanManageGames } from "@/features/auth/hooks/useAuth";
import { formatCurrency } from "@/lib/utils";
import { ru } from "@/locales/ru";
import styles from "./ServicesListPage.module.css";

const API_ORIGIN = (() => {
  try {
    return new URL(import.meta.env.VITE_API_URL || "http://localhost:8000/api/v1").origin;
  } catch {
    return "http://localhost:8000";
  }
})();

const resolveImageUrl = (url) => {
  if (!url) return null;
  if (/^https?:\/\//i.test(url)) return url;
  return `${API_ORIGIN}${url}`;
};

const PLATFORM_TABS = [
  { value: "all", label: ru.services.filters.allPlatforms },
  { value: "ps", label: "PS" },
  { value: "xbox", label: "Xbox" },
  { value: "pc", label: "PC" },
];

const FEATURED_OPTIONS = [
  { value: "all", label: ru.services.filters.allFeatured },
  { value: "true", label: ru.services.filters.onlyFeatured },
  { value: "false", label: ru.services.filters.onlyRegular },
];

function parseSearchParams(sp) {
  return {
    page: Number(sp.get("page")) || 1,
    pageSize: Number(sp.get("page_size")) || 20,
    search: sp.get("search") ?? "",
    gameId: sp.get("game_id") ?? "",
    platform: sp.get("platform") ?? "",
    isActive: sp.get("is_active") ?? "",
    isFeatured: sp.get("is_featured") ?? "",
    sort: sp.get("sort") ?? "-created_at",
  };
}

function buildApiParams(filters) {
  const params = { page: filters.page, page_size: filters.pageSize, sort: filters.sort };
  if (filters.search) params.search = filters.search;
  if (filters.gameId) params.game_id = filters.gameId;
  if (filters.platform) params.platform = filters.platform;
  if (filters.isActive === "true") params.is_active = true;
  if (filters.isActive === "false") params.is_active = false;
  if (filters.isFeatured === "true") params.is_featured = true;
  if (filters.isFeatured === "false") params.is_featured = false;
  return params;
}

export function ServicesListPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const filters = parseSearchParams(searchParams);
  const canManage = useCanManageGames();

  const { data, isLoading, isError, error, refetch } = useServicesList(buildApiParams(filters));
  const items = data?.items ?? [];
  const total = data?.total ?? 0;

  const updateParams = (next) => {
    const merged = { ...filters, ...next };
    const sp = new URLSearchParams();
    if (merged.page > 1) sp.set("page", String(merged.page));
    if (merged.pageSize !== 20) sp.set("page_size", String(merged.pageSize));
    if (merged.search) sp.set("search", merged.search);
    if (merged.gameId) sp.set("game_id", merged.gameId);
    if (merged.platform) sp.set("platform", merged.platform);
    if (merged.isActive) sp.set("is_active", merged.isActive);
    if (merged.isFeatured) sp.set("is_featured", merged.isFeatured);
    if (merged.sort && merged.sort !== "-created_at") sp.set("sort", merged.sort);
    setSearchParams(sp);
  };

  const platformValue = filters.platform || "all";
  const featuredValue = filters.isFeatured || "all";

  const hasActiveFilters = Boolean(
    filters.search ||
      filters.gameId ||
      filters.platform ||
      filters.isActive ||
      filters.isFeatured,
  );

  const resetFilters = () => {
    const sp = new URLSearchParams();
    if (filters.sort && filters.sort !== "-created_at") sp.set("sort", filters.sort);
    setSearchParams(sp);
  };

  const columns = useMemo(
    () => [
      {
        id: "image",
        header: ru.services.columns.image,
        size: 64,
        cell: ({ row }) => {
          const src = resolveImageUrl(row.original.image_url);
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
        id: "title",
        header: ru.services.columns.title,
        accessorKey: "title",
        cell: ({ row }) => <span className={styles.title}>{row.original.title}</span>,
      },
      {
        id: "platform",
        header: ru.services.columns.platform,
        size: 140,
        cell: ({ row }) => {
          const p = row.original.platform;
          return <Badge variant="info">{ru.services.platforms[p] ?? p}</Badge>;
        },
      },
      {
        id: "game",
        header: ru.services.columns.game,
        size: 160,
        cell: ({ row }) => row.original.game?.name ?? "—",
      },
      {
        id: "price",
        header: ru.services.columns.fromPrice,
        size: 140,
        align: "right",
        cell: ({ row }) => {
          const usd = row.original.default_option_price_usd;
          const eur = row.original.default_option_price_eur;
          if (usd == null) return "—";
          return (
            <span className={styles.priceCell}>
              <span>{formatCurrency(usd, "USD")}</span>
              {eur != null && (
                <small className={styles.priceEur}>{formatCurrency(eur, "EUR")}</small>
              )}
            </span>
          );
        },
      },
      {
        id: "status",
        header: ru.services.columns.status,
        size: 110,
        cell: ({ row }) => <StatusBadge isActive={row.original.is_active} />,
      },
      {
        id: "featured",
        header: ru.services.columns.featured,
        size: 100,
        align: "center",
        cell: ({ row }) => (
          <span className={styles.featuredCell}>
            {row.original.is_featured ? (
              <span
                className={styles.featuredIcon}
                title={ru.services.options.defaultBadge}
              >
                <Star size={16} fill="currentColor" />
              </span>
            ) : (
              <span className={styles.featuredOff} aria-hidden="true">
                —
              </span>
            )}
          </span>
        ),
      },
      {
        id: "actions",
        header: "",
        size: 60,
        align: "right",
        cell: ({ row }) => <ServiceActions service={row.original} />,
      },
    ],
    [],
  );

  if (isError) {
    return (
      <>
        <PageHeader title={ru.services.title} />
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

  const showEmpty = !isLoading && items.length === 0 && !hasActiveFilters;

  return (
    <>
      <PageHeader
        title={ru.services.title}
        action={
          canManage && (
            <Link to="/services/new">
              <Button variant="primary" icon={<Plus size={16} />}>
                {ru.services.create}
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
            placeholder={ru.services.search}
          />
        }
        onReset={resetFilters}
        canReset={hasActiveFilters}
      >
        <div style={{ minWidth: 200 }}>
          <GameSelect
            includeAll
            value={filters.gameId || "__all__"}
            onChange={(v) => updateParams({ gameId: v, page: 1 })}
          />
        </div>
        <Select
          value={featuredValue}
          onValueChange={(v) =>
            updateParams({ isFeatured: v === "all" ? "" : v, page: 1 })
          }
        >
          <SelectTrigger style={{ width: 160 }}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {FEATURED_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </FilterBar>

      <Tabs
        value={platformValue}
        onValueChange={(v) => updateParams({ platform: v === "all" ? "" : v, page: 1 })}
      >
        <TabsList>
          {PLATFORM_TABS.map((tab) => (
            <TabsTrigger key={tab.value} value={tab.value}>
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <div style={{ marginTop: "var(--space-4)" }}>
        {showEmpty ? (
          <EmptyState
            title={ru.services.empty}
            action={
              canManage && (
                <Link to="/services/new">
                  <Button variant="primary" icon={<Plus size={16} />}>
                    {ru.services.emptyAction}
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
      </div>
    </>
  );
}

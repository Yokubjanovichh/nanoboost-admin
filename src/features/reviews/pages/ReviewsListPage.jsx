import { useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Plus, Star } from "lucide-react";
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
import { RatingStars } from "@/components/shared/RatingStars/RatingStars";
import { ServiceSelect } from "@/components/forms/ServiceSelect/ServiceSelect";
import { ReviewActions } from "@/features/reviews/components/ReviewActions";
import { useReviewsList } from "@/features/reviews/hooks/useReviews";
import { useCanManageReviews } from "@/features/auth/hooks/useAuth";
import { formatDateOnly } from "@/lib/utils";
import { ru } from "@/locales/ru";
import styles from "./ReviewsListPage.module.css";

const ACTIVE_OPTIONS = [
  { value: "all", label: ru.reviews.filters.allActive },
  { value: "true", label: ru.reviews.filters.onlyActive },
  { value: "false", label: ru.reviews.filters.onlyInactive },
];

const FEATURED_OPTIONS = [
  { value: "all", label: ru.reviews.filters.allFeatured },
  { value: "true", label: ru.reviews.filters.onlyFeatured },
  { value: "false", label: ru.reviews.filters.onlyRegular },
];

function parseSearchParams(sp) {
  return {
    page: Number(sp.get("page")) || 1,
    pageSize: Number(sp.get("page_size")) || 20,
    search: sp.get("search") ?? "",
    serviceId: sp.get("service_id") ?? "",
    isActive: sp.get("is_active") ?? "",
    isFeatured: sp.get("is_featured") ?? "",
    sort: sp.get("sort") ?? "-created_at",
  };
}

function buildApiParams(filters) {
  const params = { page: filters.page, page_size: filters.pageSize, sort: filters.sort };
  if (filters.search) params.search = filters.search;
  if (filters.serviceId) params.service_id = filters.serviceId;
  if (filters.isActive === "true") params.is_active = true;
  if (filters.isActive === "false") params.is_active = false;
  if (filters.isFeatured === "true") params.is_featured = true;
  if (filters.isFeatured === "false") params.is_featured = false;
  return params;
}

export function ReviewsListPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const filters = parseSearchParams(searchParams);
  const canManage = useCanManageReviews();

  const { data, isLoading, isError, error, refetch } = useReviewsList(buildApiParams(filters));
  const items = data?.items ?? [];
  const total = data?.total ?? 0;

  const updateParams = (next) => {
    const merged = { ...filters, ...next };
    const sp = new URLSearchParams();
    if (merged.page > 1) sp.set("page", String(merged.page));
    if (merged.pageSize !== 20) sp.set("page_size", String(merged.pageSize));
    if (merged.search) sp.set("search", merged.search);
    if (merged.serviceId) sp.set("service_id", merged.serviceId);
    if (merged.isActive) sp.set("is_active", merged.isActive);
    if (merged.isFeatured) sp.set("is_featured", merged.isFeatured);
    if (merged.sort && merged.sort !== "-created_at") sp.set("sort", merged.sort);
    setSearchParams(sp);
  };

  const activeValue = filters.isActive || "all";
  const featuredValue = filters.isFeatured || "all";

  const hasActiveFilters = Boolean(
    filters.search || filters.serviceId || filters.isActive || filters.isFeatured,
  );

  const resetFilters = () => {
    const sp = new URLSearchParams();
    if (filters.sort && filters.sort !== "-created_at") sp.set("sort", filters.sort);
    setSearchParams(sp);
  };

  const columns = useMemo(
    () => [
      {
        id: "author",
        header: ru.reviews.columns.author,
        size: 180,
        cell: ({ row }) => (
          <span className={styles.author}>{row.original.author_name}</span>
        ),
      },
      {
        id: "service",
        header: ru.reviews.columns.service,
        size: 200,
        cell: ({ row }) =>
          row.original.service?.title ? (
            <span className={styles.serviceTitle}>{row.original.service.title}</span>
          ) : (
            <span className={styles.muted}>{ru.reviews.noService}</span>
          ),
      },
      {
        id: "rating",
        header: ru.reviews.columns.rating,
        size: 140,
        cell: ({ row }) => <RatingStars rating={row.original.rating} size="sm" />,
      },
      {
        id: "text",
        header: ru.reviews.columns.text,
        cell: ({ row }) => <span className={styles.text}>{row.original.text}</span>,
      },
      {
        id: "status",
        header: ru.reviews.columns.status,
        size: 110,
        cell: ({ row }) => <StatusBadge isActive={row.original.is_active} />,
      },
      {
        id: "featured",
        header: ru.reviews.columns.featured,
        size: 100,
        align: "center",
        cell: ({ row }) => (
          <span className={styles.featuredCell}>
            {row.original.is_featured ? (
              <Star size={16} fill="currentColor" className={styles.featuredIcon} />
            ) : (
              <span className={styles.muted}>—</span>
            )}
          </span>
        ),
      },
      {
        id: "date",
        header: ru.reviews.columns.date,
        size: 120,
        cell: ({ row }) => formatDateOnly(row.original.created_at),
      },
      {
        id: "actions",
        header: "",
        size: 60,
        align: "right",
        cell: ({ row }) => <ReviewActions review={row.original} />,
      },
    ],
    [],
  );

  if (isError) {
    return (
      <>
        <PageHeader title={ru.reviews.title} />
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

  const hasFilters = Boolean(
    filters.search || filters.serviceId || filters.isActive || filters.isFeatured,
  );
  const showEmpty = !isLoading && items.length === 0 && !hasFilters;

  return (
    <>
      <PageHeader
        title={ru.reviews.title}
        action={
          canManage && (
            <Link to="/reviews/new">
              <Button variant="primary" icon={<Plus size={16} />}>
                {ru.reviews.create}
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
            placeholder={ru.reviews.search}
          />
        }
        onReset={resetFilters}
        canReset={hasActiveFilters}
      >
        <div style={{ minWidth: 200 }}>
          <ServiceSelect
            includeNone
            noneLabel={ru.reviews.filters.allServices}
            value={filters.serviceId || null}
            onChange={(v) => updateParams({ serviceId: v ?? "", page: 1 })}
          />
        </div>
        <Select
          value={activeValue}
          onValueChange={(v) =>
            updateParams({ isActive: v === "all" ? "" : v, page: 1 })
          }
        >
          <SelectTrigger style={{ width: 160 }}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {ACTIVE_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
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

      {showEmpty ? (
        <EmptyState
          title={ru.reviews.empty}
          action={
            canManage && (
              <Link to="/reviews/new">
                <Button variant="primary" icon={<Plus size={16} />}>
                  {ru.reviews.emptyAction}
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

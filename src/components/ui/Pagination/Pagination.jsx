import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/Select/Select";
import { ru } from "@/locales/ru";
import { cn } from "@/lib/utils";
import styles from "./Pagination.module.css";

const DEFAULT_PAGE_SIZES = [10, 20, 50, 100];

function getPageRange(currentPage, totalPages) {
  const pages = [];
  const range = 2;
  const showLeft = currentPage > range + 2;
  const showRight = currentPage < totalPages - range - 1;

  pages.push(1);
  if (showLeft) pages.push("…");

  const start = Math.max(2, currentPage - range);
  const end = Math.min(totalPages - 1, currentPage + range);
  for (let i = start; i <= end; i++) pages.push(i);

  if (showRight) pages.push("…");
  if (totalPages > 1) pages.push(totalPages);

  return [...new Set(pages)];
}

export function Pagination({
  page,
  pageSize,
  total,
  pageSizeOptions = DEFAULT_PAGE_SIZES,
  onPageChange,
  onPageSizeChange,
  className,
}) {
  const totalPages = Math.max(1, Math.ceil((total ?? 0) / pageSize));
  const pages = getPageRange(page, totalPages);

  const goTo = (target) => {
    const next = Math.min(Math.max(1, target), totalPages);
    if (next !== page) onPageChange?.(next);
  };

  if (total === 0) return null;

  return (
    <div className={cn(styles.container, className)}>
      <div className={styles.left}>
        <span className={styles.summary}>
          {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, total)} {ru.pagination.of} {total}
        </span>
      </div>
      <nav className={styles.nav} aria-label="Постраничная навигация">
        <button
          type="button"
          className={styles.navBtn}
          onClick={() => goTo(1)}
          disabled={page === 1}
          aria-label="К первой странице"
        >
          <ChevronsLeft size={16} />
        </button>
        <button
          type="button"
          className={styles.navBtn}
          onClick={() => goTo(page - 1)}
          disabled={page === 1}
          aria-label={ru.pagination.prev}
        >
          <ChevronLeft size={16} />
        </button>
        <ul className={styles.pageList}>
          {pages.map((p, idx) =>
            p === "…" ? (
              <li key={`ellipsis-${idx}`} className={styles.ellipsis}>
                …
              </li>
            ) : (
              <li key={p}>
                <button
                  type="button"
                  className={cn(styles.pageBtn, page === p && styles.pageBtnActive)}
                  onClick={() => goTo(p)}
                  aria-current={page === p ? "page" : undefined}
                >
                  {p}
                </button>
              </li>
            ),
          )}
        </ul>
        <button
          type="button"
          className={styles.navBtn}
          onClick={() => goTo(page + 1)}
          disabled={page >= totalPages}
          aria-label={ru.pagination.next}
        >
          <ChevronRight size={16} />
        </button>
        <button
          type="button"
          className={styles.navBtn}
          onClick={() => goTo(totalPages)}
          disabled={page >= totalPages}
          aria-label="К последней странице"
        >
          <ChevronsRight size={16} />
        </button>
      </nav>

      {onPageSizeChange && (
        <div className={styles.right}>
          <span className={styles.label}>{ru.pagination.perPage}:</span>
          <Select value={String(pageSize)} onValueChange={(v) => onPageSizeChange(Number(v))}>
            <SelectTrigger className={styles.sizeTrigger}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {pageSizeOptions.map((s) => (
                <SelectItem key={s} value={String(s)}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
    </div>
  );
}

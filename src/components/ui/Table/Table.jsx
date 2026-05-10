import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { ChevronUp, ChevronDown, ChevronsUpDown } from "lucide-react";
import { Spinner } from "@/components/ui/Spinner/Spinner";
import { EmptyState } from "@/components/shared/EmptyState/EmptyState";
import { cn } from "@/lib/utils";
import styles from "./Table.module.css";

export function Table({
  columns,
  data,
  isLoading = false,
  emptyState,
  onRowClick,
  sorting,
  onSortingChange,
  className,
}) {
  const table = useReactTable({
    data: data ?? [],
    columns,
    state: { sorting },
    onSortingChange,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    manualSorting: Boolean(onSortingChange),
  });

  const rows = table.getRowModel().rows;

  return (
    <div className={cn(styles.wrap, className)}>
      <div className={styles.scroll}>
        <table className={styles.table}>
          <thead className={styles.thead}>
            {table.getHeaderGroups().map((group) => (
              <tr key={group.id}>
                {group.headers.map((header) => {
                  const canSort = header.column.getCanSort();
                  const sortDir = header.column.getIsSorted();
                  return (
                    <th
                      key={header.id}
                      style={{ width: header.column.columnDef.size, textAlign: header.column.columnDef.align }}
                      className={styles.th}
                    >
                      {header.isPlaceholder ? null : canSort ? (
                        <button
                          type="button"
                          className={styles.sortButton}
                          onClick={header.column.getToggleSortingHandler()}
                        >
                          {flexRender(header.column.columnDef.header, header.getContext())}
                          <span className={styles.sortIcon} aria-hidden="true">
                            {sortDir === "asc" ? (
                              <ChevronUp size={14} />
                            ) : sortDir === "desc" ? (
                              <ChevronDown size={14} />
                            ) : (
                              <ChevronsUpDown size={14} />
                            )}
                          </span>
                        </button>
                      ) : (
                        flexRender(header.column.columnDef.header, header.getContext())
                      )}
                    </th>
                  );
                })}
              </tr>
            ))}
          </thead>
          <tbody className={styles.tbody}>
            {isLoading ? (
              <tr>
                <td colSpan={columns.length} className={styles.loadingCell}>
                  <Spinner />
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className={styles.emptyCell}>
                  {emptyState ?? <EmptyState title="Нет данных" />}
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr
                  key={row.id}
                  className={cn(styles.row, onRowClick && styles.rowClickable)}
                  onClick={onRowClick ? () => onRowClick(row.original) : undefined}
                >
                  {row.getVisibleCells().map((cell) => (
                    <td
                      key={cell.id}
                      className={styles.td}
                      style={{ textAlign: cell.column.columnDef.align }}
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

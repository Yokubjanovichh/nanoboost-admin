import { Link } from "react-router-dom";
import { Spinner } from "@/components/ui/Spinner/Spinner";
import { EmptyState } from "@/components/shared/EmptyState/EmptyState";
import { MoneyAmount } from "@/components/shared/MoneyAmount/MoneyAmount";
import { ru } from "@/locales/ru";
import styles from "./TopServicesList.module.css";

export function TopServicesList({ items, isLoading }) {
  if (isLoading) {
    return (
      <div className={styles.center}>
        <Spinner />
      </div>
    );
  }

  if (!Array.isArray(items) || items.length === 0) {
    return <EmptyState title={ru.dashboard.topServices.empty} />;
  }

  return (
    <ol className={styles.list}>
      {items.map((service, index) => {
        const id = service.service_id ?? service.id;
        const title = service.title ?? service.service_title ?? "—";
        const ordersCount = service.orders_count ?? 0;
        const revenue = service.revenue_usd ?? 0;

        const content = (
          <>
            <span className={styles.rank}>{index + 1}</span>
            <span className={styles.info}>
              <span className={styles.title}>{title}</span>
              <span className={styles.meta}>
                {ordersCount} {ru.dashboard.topServices.ordersLabel}
              </span>
            </span>
            <span className={styles.revenue}>
              <MoneyAmount amountUsd={revenue} size="sm" />
            </span>
          </>
        );

        return (
          <li key={id ?? `${title}-${index}`} className={styles.item}>
            {id ? (
              <Link to={`/services/${id}/edit`} className={styles.row}>
                {content}
              </Link>
            ) : (
              <span className={styles.row}>{content}</span>
            )}
          </li>
        );
      })}
    </ol>
  );
}

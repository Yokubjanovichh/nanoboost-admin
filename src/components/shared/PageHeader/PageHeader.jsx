import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import styles from "./PageHeader.module.css";

export function PageHeader({ title, breadcrumb, action, className }) {
  return (
    <header className={cn(styles.header, className)}>
      <div className={styles.left}>
        {breadcrumb?.length > 0 && (
          <nav className={styles.breadcrumb} aria-label="Хлебные крошки">
            {breadcrumb.map((item, index) => {
              const isLast = index === breadcrumb.length - 1;
              return (
                <span key={index} className={styles.crumb}>
                  {item.to && !isLast ? (
                    <Link to={item.to} className={styles.crumbLink}>
                      {item.label}
                    </Link>
                  ) : (
                    <span className={styles.crumbText} aria-current={isLast ? "page" : undefined}>
                      {item.label}
                    </span>
                  )}
                  {!isLast && <ChevronRight size={12} className={styles.separator} aria-hidden="true" />}
                </span>
              );
            })}
          </nav>
        )}
        <h1 className={styles.title}>{title}</h1>
      </div>
      {action && <div className={styles.action}>{action}</div>}
    </header>
  );
}

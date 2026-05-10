import { Link } from "react-router-dom";
import { Button } from "@/components/ui/Button/Button";
import { ru } from "@/locales/ru";
import styles from "./NotFoundPage.module.css";

export function NotFoundPage() {
  return (
    <div className={styles.page}>
      <div className={styles.code}>404</div>
      <h1 className={styles.title}>{ru.pages.notFound.title}</h1>
      <p className={styles.description}>{ru.pages.notFound.description}</p>
      <Link to="/dashboard">
        <Button variant="primary">{ru.pages.notFound.home}</Button>
      </Link>
    </div>
  );
}

import { useEffect, useRef, useState } from "react";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/Input/Input";
import styles from "./SearchInput.module.css";

export function SearchInput({
  value,
  onChange,
  placeholder,
  debounceMs = 300,
  fullWidth = false,
  className,
  ...rest
}) {
  const [local, setLocal] = useState(value ?? "");
  const timerRef = useRef(null);
  const lastEmittedRef = useRef(value ?? "");

  useEffect(() => {
    if ((value ?? "") !== lastEmittedRef.current) {
      setLocal(value ?? "");
      lastEmittedRef.current = value ?? "";
    }
  }, [value]);

  useEffect(() => () => clearTimeout(timerRef.current), []);

  const handleChange = (e) => {
    const next = e.target.value;
    setLocal(next);
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      lastEmittedRef.current = next;
      onChange?.(next);
    }, debounceMs);
  };

  const handleClear = () => {
    clearTimeout(timerRef.current);
    setLocal("");
    lastEmittedRef.current = "";
    onChange?.("");
  };

  return (
    <Input
      className={className}
      fullWidth={fullWidth}
      type="text"
      role="search"
      value={local}
      onChange={handleChange}
      placeholder={placeholder}
      prefix={<Search size={16} />}
      suffix={
        local ? (
          <button
            type="button"
            className={styles.clearBtn}
            onClick={handleClear}
            aria-label="Очистить поиск"
          >
            <X size={14} />
          </button>
        ) : null
      }
      {...rest}
    />
  );
}

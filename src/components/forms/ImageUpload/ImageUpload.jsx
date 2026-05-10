import { useRef, useState } from "react";
import { Upload, ImageIcon, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button/Button";
import { useUploadImage } from "@/features/games/hooks/useGames";
import { useToast } from "@/components/ui/Toast/Toast";
import { ru } from "@/locales/ru";
import { cn } from "@/lib/utils";
import styles from "./ImageUpload.module.css";

const ALLOWED_TYPES = ["image/png", "image/jpeg", "image/jpg", "image/webp"];
const MAX_SIZE_BYTES = 5 * 1024 * 1024;

const API_ORIGIN = (() => {
  try {
    return new URL(import.meta.env.VITE_API_URL || "http://localhost:8000/api/v1").origin;
  } catch {
    return "http://localhost:8000";
  }
})();

function resolveImageUrl(url) {
  if (!url) return "";
  if (/^https?:\/\//i.test(url)) return url;
  return `${API_ORIGIN}${url}`;
}

export function ImageUpload({ value, onChange, folder = "misc", error, disabled = false }) {
  const inputRef = useRef(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [validationError, setValidationError] = useState("");
  const upload = useUploadImage();
  const toast = useToast();

  const validateFile = (file) => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      return ru.upload.errors.invalidType;
    }
    if (file.size > MAX_SIZE_BYTES) {
      return ru.upload.errors.tooLarge;
    }
    return null;
  };

  const handleFile = async (file) => {
    setValidationError("");
    const validationMsg = validateFile(file);
    if (validationMsg) {
      setValidationError(validationMsg);
      toast.error(ru.common.error, validationMsg);
      return;
    }
    try {
      const result = await upload.mutateAsync({ file, folder });
      onChange?.(result.url);
    } catch {
      const msg = ru.upload.errors.failed;
      setValidationError(msg);
      toast.error(ru.common.error, msg);
    }
  };

  const onInputChange = (e) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    e.target.value = "";
  };

  const onDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    if (disabled || upload.isPending) return;
    const file = e.dataTransfer?.files?.[0];
    if (file) handleFile(file);
  };

  const onDragOver = (e) => {
    e.preventDefault();
    if (!disabled && !upload.isPending) setIsDragOver(true);
  };

  const handleRemove = () => {
    onChange?.(null);
    setValidationError("");
  };

  const triggerFileSelect = () => {
    if (!disabled && !upload.isPending) inputRef.current?.click();
  };

  const showError = error || validationError;
  const isLoading = upload.isPending;

  return (
    <div className={styles.wrap}>
      <input
        ref={inputRef}
        type="file"
        accept={ALLOWED_TYPES.join(",")}
        className={styles.hiddenInput}
        onChange={onInputChange}
        disabled={disabled}
      />

      {value ? (
        <div className={styles.preview}>
          <img src={resolveImageUrl(value)} alt="" className={styles.previewImg} />
          <div className={styles.previewActions}>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              icon={<Upload size={14} />}
              onClick={triggerFileSelect}
              loading={isLoading}
              disabled={disabled}
            >
              {ru.upload.replace}
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              icon={<Trash2 size={14} />}
              onClick={handleRemove}
              disabled={disabled || isLoading}
            >
              {ru.upload.remove}
            </Button>
          </div>
        </div>
      ) : (
        <div
          className={cn(
            styles.dropzone,
            isDragOver && styles.dropzoneActive,
            showError && styles.dropzoneError,
            (disabled || isLoading) && styles.dropzoneDisabled,
          )}
          onClick={triggerFileSelect}
          onDragOver={onDragOver}
          onDragLeave={() => setIsDragOver(false)}
          onDrop={onDrop}
          role="button"
          tabIndex={disabled ? -1 : 0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              triggerFileSelect();
            }
          }}
        >
          <span className={styles.dropIcon} aria-hidden="true">
            {isLoading ? <Loader2 size={28} className={styles.spinner} /> : <ImageIcon size={28} />}
          </span>
          <span className={styles.dropTitle}>
            {isLoading ? ru.upload.uploading : ru.upload.dropHere}
          </span>
          <span className={styles.dropHint}>{ru.upload.maxSize}</span>
        </div>
      )}

      {showError && (
        <p className={styles.error} role="alert">
          {showError}
        </p>
      )}
    </div>
  );
}

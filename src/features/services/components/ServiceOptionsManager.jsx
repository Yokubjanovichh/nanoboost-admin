import { useMemo, useState } from "react";
import { Plus, Edit3, Star, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button/Button";
import { Table } from "@/components/ui/Table/Table";
import { Badge } from "@/components/ui/Badge/Badge";
import { Spinner } from "@/components/ui/Spinner/Spinner";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog/ConfirmDialog";
import { EmptyState } from "@/components/shared/EmptyState/EmptyState";
import { useToast } from "@/components/ui/Toast/Toast";
import {
  useServiceOptions,
  useCreateServiceOption,
  useUpdateServiceOption,
  useDeleteServiceOption,
  useSetDefaultOption,
} from "@/features/services/hooks/useServiceOptions";
import { ServiceOptionDialog } from "@/features/services/components/ServiceOptionDialog";
import { formatCurrency } from "@/lib/utils";
import { ru } from "@/locales/ru";
import styles from "./ServiceOptionsManager.module.css";

export function ServiceOptionsManager({ serviceId }) {
  const { data, isLoading } = useServiceOptions(serviceId);
  const options = useMemo(() => (Array.isArray(data) ? data : []), [data]);
  const toast = useToast();

  const createMutation = useCreateServiceOption(serviceId);
  const updateMutation = useUpdateServiceOption(serviceId);
  const deleteMutation = useDeleteServiceOption(serviceId);
  const setDefaultMutation = useSetDefaultOption(serviceId);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingOption, setEditingOption] = useState(null);
  const [confirmOption, setConfirmOption] = useState(null);

  const openCreate = () => {
    setEditingOption(null);
    setDialogOpen(true);
  };

  const openEdit = (option) => {
    setEditingOption(option);
    setDialogOpen(true);
  };

  const handleSubmit = (payload) => {
    if (editingOption) {
      updateMutation.mutate(
        { optionId: editingOption.id, payload },
        {
          onSuccess: () => {
            toast.success(ru.services.toasts.optionUpdated);
            setDialogOpen(false);
          },
          onError: () => toast.error(ru.common.error, ru.services.toasts.error),
        },
      );
    } else {
      createMutation.mutate(payload, {
        onSuccess: () => {
          toast.success(ru.services.toasts.optionCreated);
          setDialogOpen(false);
        },
        onError: () => toast.error(ru.common.error, ru.services.toasts.error),
      });
    }
  };

  const handleSetDefault = (optionId) => {
    setDefaultMutation.mutate(optionId, {
      onSuccess: () => toast.success(ru.services.toasts.defaultSet),
      onError: () => toast.error(ru.common.error, ru.services.toasts.error),
    });
  };

  const handleDelete = () => {
    if (!confirmOption) return;
    deleteMutation.mutate(confirmOption.id, {
      onSuccess: () => {
        toast.success(ru.services.toasts.optionDeleted);
        setConfirmOption(null);
      },
      onError: () => toast.error(ru.common.error, ru.services.toasts.error),
    });
  };

  const columns = useMemo(
    () => [
      {
        id: "label",
        header: ru.services.options.columns.label,
        cell: ({ row }) => (
          <div className={styles.labelCell}>
            <span className={styles.labelText}>{row.original.label}</span>
            {row.original.is_default && (
              <Badge variant="info">{ru.services.options.defaultBadge}</Badge>
            )}
          </div>
        ),
      },
      {
        id: "price_usd",
        header: ru.services.options.columns.priceUsd,
        size: 120,
        align: "right",
        cell: ({ row }) => formatCurrency(row.original.price_usd, "USD"),
      },
      {
        id: "price_eur",
        header: ru.services.options.columns.priceEur,
        size: 120,
        align: "right",
        cell: ({ row }) => formatCurrency(row.original.price_eur, "EUR"),
      },
      {
        id: "discount",
        header: ru.services.options.columns.discount,
        size: 160,
        align: "right",
        cell: ({ row }) => {
          const o = row.original;
          if (o.discount_type === "percent" && o.discount_percent != null) {
            return <Badge variant="danger">{`-${Number(o.discount_percent)}%`}</Badge>;
          }
          if (
            o.discount_type === "amount" &&
            (o.discount_amount_usd != null || o.discount_amount_eur != null)
          ) {
            const usd = `-${formatCurrency(o.discount_amount_usd ?? 0, "USD")}`;
            const eur = `-${formatCurrency(o.discount_amount_eur ?? 0, "EUR")}`;
            return <Badge variant="danger">{`${usd} / ${eur}`}</Badge>;
          }
          return <span className={styles.discountEmpty}>—</span>;
        },
      },
      {
        id: "sort_order",
        header: ru.services.options.columns.sortOrder,
        size: 100,
        align: "center",
        cell: ({ row }) => row.original.sort_order ?? 0,
      },
      {
        id: "actions",
        header: "",
        size: 160,
        align: "right",
        cell: ({ row }) => (
          <div className={styles.actions}>
            {!row.original.is_default && (
              <button
                type="button"
                className={styles.iconBtn}
                onClick={() => handleSetDefault(row.original.id)}
                aria-label={ru.services.options.actions.makeDefault}
                title={ru.services.options.actions.makeDefault}
                disabled={setDefaultMutation.isPending}
              >
                <Star size={14} />
              </button>
            )}
            <button
              type="button"
              className={styles.iconBtn}
              onClick={() => openEdit(row.original)}
              aria-label={ru.services.options.actions.edit}
              title={ru.services.options.actions.edit}
            >
              <Edit3 size={14} />
            </button>
            <button
              type="button"
              className={`${styles.iconBtn} ${styles.iconBtnDanger}`}
              onClick={() => setConfirmOption(row.original)}
              aria-label={ru.services.options.actions.delete}
              title={ru.services.options.actions.delete}
            >
              <Trash2 size={14} />
            </button>
          </div>
        ),
      },
    ],
    [setDefaultMutation.isPending],
  );

  return (
    <div className={styles.wrap}>
      <div className={styles.header}>
        <h3 className={styles.title}>{ru.services.options.title}</h3>
        <Button
          type="button"
          variant="primary"
          size="sm"
          icon={<Plus size={14} />}
          onClick={openCreate}
        >
          {ru.services.options.add}
        </Button>
      </div>

      {isLoading ? (
        <div className={styles.loading}>
          <Spinner />
        </div>
      ) : options.length === 0 ? (
        <EmptyState
          title={ru.services.options.empty}
          action={
            <Button
              type="button"
              variant="primary"
              size="sm"
              icon={<Plus size={14} />}
              onClick={openCreate}
            >
              {ru.services.options.add}
            </Button>
          }
        />
      ) : (
        <Table columns={columns} data={options} />
      )}

      <ServiceOptionDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        option={editingOption}
        onSubmit={handleSubmit}
        loading={createMutation.isPending || updateMutation.isPending}
      />

      <ConfirmDialog
        open={Boolean(confirmOption)}
        onOpenChange={(o) => !o && setConfirmOption(null)}
        title={ru.services.optionDeleteConfirm.title}
        description={
          confirmOption
            ? ru.services.optionDeleteConfirm.description.replace("{label}", confirmOption.label)
            : ""
        }
        onConfirm={handleDelete}
        loading={deleteMutation.isPending}
      />
    </div>
  );
}

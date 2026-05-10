import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/Dialog/Dialog";
import { Button } from "@/components/ui/Button/Button";
import { Input } from "@/components/ui/Input/Input";
import { NumberInput } from "@/components/ui/NumberInput/NumberInput";
import { Switch } from "@/components/ui/Switch/Switch";
import { Label } from "@/components/ui/Label/Label";
import { PriceInput } from "@/components/forms/PriceInput/PriceInput";
import { ru } from "@/locales/ru";
import styles from "./ServiceOptionDialog.module.css";

const schema = yup.object({
  label: yup
    .string()
    .trim()
    .required(ru.services.validation.labelRequired)
    .max(200, ru.services.validation.labelMax),
  price_usd: yup
    .number()
    .typeError(ru.services.validation.priceRequired)
    .min(0, ru.services.validation.priceMin)
    .required(ru.services.validation.priceRequired),
  price_eur: yup
    .number()
    .typeError(ru.services.validation.priceRequired)
    .min(0, ru.services.validation.priceMin)
    .required(ru.services.validation.priceRequired),
  is_default: yup.boolean().default(false),
  sort_order: yup.number().typeError("Введите число").integer().min(0).default(0),
});

const defaultValues = {
  label: "",
  price_usd: 0,
  price_eur: 0,
  is_default: false,
  sort_order: 0,
};

export function ServiceOptionDialog({ open, onOpenChange, option, onSubmit, loading = false }) {
  const isEdit = Boolean(option?.id);

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues,
  });

  useEffect(() => {
    if (open) {
      reset(
        option
          ? {
              label: option.label ?? "",
              price_usd: Number(option.price_usd) || 0,
              price_eur: Number(option.price_eur) || 0,
              is_default: Boolean(option.is_default),
              sort_order: Number(option.sort_order) || 0,
            }
          : defaultValues,
      );
    }
  }, [open, option, reset]);

  const submit = (values) => {
    onSubmit?.({
      label: values.label.trim(),
      price_usd: Number(values.price_usd),
      price_eur: Number(values.price_eur),
      is_default: Boolean(values.is_default),
      sort_order: Number(values.sort_order) || 0,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isEdit ? ru.services.options.dialog.editTitle : ru.services.options.dialog.addTitle}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(submit)} noValidate className={styles.form}>
          <Input
            label={ru.services.options.fields.label}
            placeholder={ru.services.options.fields.labelPlaceholder}
            error={errors.label?.message}
            {...register("label")}
          />

          <Controller
            name="price_usd"
            control={control}
            render={({ field: usdField, fieldState: usdState }) => (
              <Controller
                name="price_eur"
                control={control}
                render={({ field: eurField, fieldState: eurState }) => (
                  <PriceInput
                    label={ru.services.options.fields.price}
                    usdValue={usdField.value}
                    eurValue={eurField.value}
                    onUsdChange={(v) => usdField.onChange(v === "" ? "" : Number(v))}
                    onEurChange={(v) => eurField.onChange(v === "" ? "" : Number(v))}
                    usdError={usdState.error?.message}
                    eurError={eurState.error?.message}
                  />
                )}
              />
            )}
          />

          <NumberInput
            label={ru.services.options.fields.sortOrder}
            min={0}
            error={errors.sort_order?.message}
            {...register("sort_order", { valueAsNumber: true })}
          />

          <Controller
            name="is_default"
            control={control}
            render={({ field }) => (
              <div className={styles.switchRow}>
                <Label htmlFor="option-is-default">{ru.services.options.fields.isDefault}</Label>
                <Switch
                  id="option-is-default"
                  checked={Boolean(field.value)}
                  onCheckedChange={field.onChange}
                />
              </div>
            )}
          />

          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange?.(false)}
              disabled={loading}
            >
              {ru.common.cancel}
            </Button>
            <Button type="submit" variant="primary" loading={loading}>
              {ru.common.save}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

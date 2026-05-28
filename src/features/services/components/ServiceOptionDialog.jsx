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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select/Select";
import { PriceInput } from "@/components/forms/PriceInput/PriceInput";
import { ru } from "@/locales/ru";
import styles from "./ServiceOptionDialog.module.css";

// Empty string / null / undefined collapse to null so the conditional
// `when(...)` branches don't trip Yup's typeError on a blank input while the
// type is still "none".
const nullableNumber = (v, orig) =>
  orig === "" || orig == null ? null : v;

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
  discount_type: yup
    .string()
    .oneOf(["none", "percent", "amount"])
    .required(ru.services.validation.discountTypeRequired)
    .default("none"),
  discount_percent: yup
    .number()
    .transform(nullableNumber)
    .nullable()
    .when("discount_type", {
      is: "percent",
      then: (s) =>
        s
          .typeError(ru.services.validation.discountAmountRequired)
          .required(ru.services.validation.discountAmountRequired)
          .min(1, ru.services.validation.discountPercentRange)
          .max(100, ru.services.validation.discountPercentRange),
      otherwise: (s) => s.nullable(),
    }),
  discount_amount_usd: yup
    .number()
    .transform(nullableNumber)
    .nullable()
    .when("discount_type", {
      is: "amount",
      then: (s) =>
        s
          .typeError(ru.services.validation.discountAmountRequired)
          .required(ru.services.validation.discountAmountRequired)
          .moreThan(0, ru.services.validation.discountAmountPositive),
      otherwise: (s) => s.nullable(),
    }),
  discount_amount_eur: yup
    .number()
    .transform(nullableNumber)
    .nullable()
    .when("discount_type", {
      is: "amount",
      then: (s) =>
        s
          .typeError(ru.services.validation.discountAmountRequired)
          .required(ru.services.validation.discountAmountRequired)
          .moreThan(0, ru.services.validation.discountAmountPositive),
      otherwise: (s) => s.nullable(),
    }),
});

const defaultValues = {
  label: "",
  price_usd: 0,
  price_eur: 0,
  is_default: false,
  sort_order: 0,
  discount_type: "none",
  discount_percent: null,
  discount_amount_usd: null,
  discount_amount_eur: null,
};

// Backend infers discount_type from existing options; we treat any missing /
// "none" type as "no discount" and null out the unused price branches.
function resolveExistingDiscountType(option) {
  if (!option) return "none";
  if (option.discount_type === "percent" || option.discount_type === "amount") {
    return option.discount_type;
  }
  return "none";
}

export function ServiceOptionDialog({ open, onOpenChange, option, onSubmit, loading = false }) {
  const isEdit = Boolean(option?.id);

  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues,
  });

  const discountType = watch("discount_type");

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
              discount_type: resolveExistingDiscountType(option),
              discount_percent:
                option.discount_percent != null ? Number(option.discount_percent) : null,
              discount_amount_usd:
                option.discount_amount_usd != null ? Number(option.discount_amount_usd) : null,
              discount_amount_eur:
                option.discount_amount_eur != null ? Number(option.discount_amount_eur) : null,
            }
          : defaultValues,
      );
    }
  }, [open, option, reset]);

  const submit = (values) => {
    const type = values.discount_type;
    onSubmit?.({
      label: values.label.trim(),
      price_usd: Number(values.price_usd),
      price_eur: Number(values.price_eur),
      is_default: Boolean(values.is_default),
      sort_order: Number(values.sort_order) || 0,
      discount_type: type,
      discount_percent: type === "percent" ? Number(values.discount_percent) : null,
      discount_amount_usd: type === "amount" ? Number(values.discount_amount_usd) : null,
      discount_amount_eur: type === "amount" ? Number(values.discount_amount_eur) : null,
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

          <Controller
            name="discount_type"
            control={control}
            render={({ field, fieldState }) => (
              <div className={styles.fieldStack}>
                <Label htmlFor="option-discount-type">
                  {ru.services.options.fields.discountType}
                </Label>
                <Select value={field.value || "none"} onValueChange={field.onChange}>
                  <SelectTrigger id="option-discount-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">
                      {ru.services.options.fields.discountNone}
                    </SelectItem>
                    <SelectItem value="percent">
                      {ru.services.options.fields.discountPercent}
                    </SelectItem>
                    <SelectItem value="amount">
                      {ru.services.options.fields.discountAmount}
                    </SelectItem>
                  </SelectContent>
                </Select>
                {fieldState.error?.message && (
                  <p role="alert" className={styles.fieldError}>
                    {fieldState.error.message}
                  </p>
                )}
              </div>
            )}
          />

          {discountType === "percent" && (
            <NumberInput
              label={ru.services.options.fields.discountPercentLabel}
              min={1}
              max={100}
              error={errors.discount_percent?.message}
              {...register("discount_percent", {
                setValueAs: (v) => (v === "" || v == null ? null : Number(v)),
              })}
            />
          )}

          {discountType === "amount" && (
            <Controller
              name="discount_amount_usd"
              control={control}
              render={({ field: usdField, fieldState: usdState }) => (
                <Controller
                  name="discount_amount_eur"
                  control={control}
                  render={({ field: eurField, fieldState: eurState }) => (
                    <PriceInput
                      label={ru.services.options.fields.discount}
                      usdValue={usdField.value ?? ""}
                      eurValue={eurField.value ?? ""}
                      onUsdChange={(v) =>
                        usdField.onChange(v === "" ? null : Number(v))
                      }
                      onEurChange={(v) =>
                        eurField.onChange(v === "" ? null : Number(v))
                      }
                      usdError={usdState.error?.message}
                      eurError={eurState.error?.message}
                    />
                  )}
                />
              )}
            />
          )}

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

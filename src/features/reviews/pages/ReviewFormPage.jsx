import { useMemo } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { PageHeader } from "@/components/shared/PageHeader/PageHeader";
import { Card } from "@/components/ui/Card/Card";
import { Button } from "@/components/ui/Button/Button";
import { Input } from "@/components/ui/Input/Input";
import { Textarea } from "@/components/ui/Textarea/Textarea";
import { NumberInput } from "@/components/ui/NumberInput/NumberInput";
import { Switch } from "@/components/ui/Switch/Switch";
import { Label } from "@/components/ui/Label/Label";
import { Spinner } from "@/components/ui/Spinner/Spinner";
import { ServiceSelect } from "@/components/forms/ServiceSelect/ServiceSelect";
import { RatingStarsInput } from "@/components/forms/RatingStarsInput/RatingStarsInput";
import { useReview, useCreateReview, useUpdateReview } from "@/features/reviews/hooks/useReviews";
import { useToast } from "@/components/ui/Toast/Toast";
import { ru } from "@/locales/ru";
import styles from "./ReviewFormPage.module.css";

const schema = yup.object({
  author_name: yup
    .string()
    .trim()
    .required(ru.reviews.validation.authorRequired)
    .max(100, ru.reviews.validation.authorMax),
  service_id: yup.string().nullable(),
  rating: yup
    .number()
    .typeError(ru.reviews.validation.ratingRequired)
    .integer()
    .min(1, ru.reviews.validation.ratingRequired)
    .max(5, ru.reviews.validation.ratingRange)
    .required(ru.reviews.validation.ratingRequired),
  text: yup
    .string()
    .trim()
    .required(ru.reviews.validation.textRequired)
    .min(10, ru.reviews.validation.textMin)
    .max(2000, ru.reviews.validation.textMax),
  is_featured: yup.boolean().default(false),
  is_active: yup.boolean().default(true),
  sort_order: yup
    .number()
    .transform((v, orig) =>
      orig === "" || orig == null || Number.isNaN(v) ? 0 : v,
    )
    .integer()
    .min(0)
    .default(0),
});

const STATIC_DEFAULTS = {
  author_name: "",
  service_id: null,
  rating: 0,
  text: "",
  is_featured: false,
  is_active: true,
  sort_order: 0,
};

function buildInitialValues(review, isEdit) {
  if (!isEdit || !review) return STATIC_DEFAULTS;
  return {
    author_name: review.author_name ?? "",
    service_id: review.service_id ?? review.service?.id ?? null,
    rating: Number(review.rating) || 0,
    text: review.text ?? "",
    is_featured: Boolean(review.is_featured),
    is_active: review.is_active ?? true,
    sort_order: Number(review.sort_order) || 0,
  };
}

export function ReviewFormPage() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const { data: review, isLoading } = useReview(id);

  if (isEdit && isLoading) {
    return (
      <div className={styles.loading}>
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <ReviewFormPageInner
      key={isEdit ? id : "new"}
      review={isEdit ? review : null}
      isEdit={isEdit}
      id={id}
    />
  );
}

function ReviewFormPageInner({ review, isEdit, id }) {
  const navigate = useNavigate();
  const toast = useToast();

  const createMutation = useCreateReview();
  const updateMutation = useUpdateReview();

  const initialValues = useMemo(() => buildInitialValues(review, isEdit), [review, isEdit]);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: initialValues,
  });

  const onSubmit = (values) => {
    const payload = {
      author_name: values.author_name.trim(),
      service_id: values.service_id || null,
      rating: Number(values.rating),
      text: values.text.trim(),
      is_featured: Boolean(values.is_featured),
      is_active: Boolean(values.is_active),
      sort_order: Number(values.sort_order) || 0,
    };

    const onApiError = (err) => {
      const detail = err?.response?.data?.detail;
      toast.error(ru.common.error, detail || ru.reviews.toasts.error);
    };

    if (isEdit) {
      updateMutation.mutate(
        { id, payload },
        {
          onSuccess: () => {
            toast.success(ru.reviews.toasts.updated);
            navigate("/reviews");
          },
          onError: onApiError,
        },
      );
    } else {
      createMutation.mutate(payload, {
        onSuccess: () => {
          toast.success(ru.reviews.toasts.created);
          navigate("/reviews");
        },
        onError: onApiError,
      });
    }
  };

  const onValidationError = (formErrors) => {
    if (import.meta.env.DEV) {
      console.warn("[ReviewForm] validation failed:", formErrors);
    }
    const firstField = Object.keys(formErrors)[0];
    const firstMessage = formErrors[firstField]?.message;
    toast.error(ru.common.error, firstMessage || "Проверьте заполнение полей формы");
  };

  const isSaving = createMutation.isPending || updateMutation.isPending || isSubmitting;
  const title = isEdit ? ru.reviews.edit : ru.reviews.create;

  return (
    <>
      <PageHeader
        title={title}
        breadcrumb={[
          { label: ru.reviews.title, to: "/reviews" },
          { label: title },
        ]}
      />

      <form onSubmit={handleSubmit(onSubmit, onValidationError)} noValidate>
        <Card
          variant="elevated"
          footer={
            <div className={styles.footer}>
              <Link to="/reviews">
                <Button type="button" variant="ghost" disabled={isSaving}>
                  {ru.common.cancel}
                </Button>
              </Link>
              <Button type="submit" variant="primary" loading={isSaving}>
                {isSaving ? ru.common.saving : ru.common.save}
              </Button>
            </div>
          }
        >
          <div className={styles.fields}>
            <Input
              label={ru.reviews.fields.authorName}
              placeholder={ru.reviews.fields.authorPlaceholder}
              error={errors.author_name?.message}
              {...register("author_name")}
            />

            <Controller
              name="service_id"
              control={control}
              render={({ field, fieldState }) => (
                <ServiceSelect
                  label={ru.reviews.fields.service}
                  includeNone
                  noneLabel={ru.reviews.noService}
                  value={field.value}
                  onChange={field.onChange}
                  error={fieldState.error?.message}
                />
              )}
            />

            <Controller
              name="rating"
              control={control}
              render={({ field, fieldState }) => (
                <RatingStarsInput
                  label={ru.reviews.fields.rating}
                  value={field.value}
                  onChange={field.onChange}
                  error={fieldState.error?.message}
                />
              )}
            />

            <Textarea
              label={ru.reviews.fields.text}
              placeholder={ru.reviews.fields.textPlaceholder}
              rows={5}
              error={errors.text?.message}
              {...register("text")}
            />

            <NumberInput
              label={ru.reviews.fields.sortOrder}
              min={0}
              error={errors.sort_order?.message}
              {...register("sort_order", {
                setValueAs: (v) => (v === "" || v == null ? 0 : Number(v)),
              })}
            />

            <Controller
              name="is_active"
              control={control}
              render={({ field }) => (
                <div className={styles.switchRow}>
                  <Label htmlFor="review-is-active">{ru.reviews.fields.isActive}</Label>
                  <Switch
                    id="review-is-active"
                    checked={Boolean(field.value)}
                    onCheckedChange={field.onChange}
                  />
                </div>
              )}
            />

            <Controller
              name="is_featured"
              control={control}
              render={({ field }) => (
                <div className={styles.switchRow}>
                  <Label htmlFor="review-is-featured">{ru.reviews.fields.isFeatured}</Label>
                  <Switch
                    id="review-is-featured"
                    checked={Boolean(field.value)}
                    onCheckedChange={field.onChange}
                  />
                </div>
              )}
            />
          </div>
        </Card>
      </form>
    </>
  );
}

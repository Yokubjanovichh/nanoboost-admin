import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { ChevronDown, ChevronRight } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader/PageHeader";
import { Card } from "@/components/ui/Card/Card";
import { Button } from "@/components/ui/Button/Button";
import { Input } from "@/components/ui/Input/Input";
import { Textarea } from "@/components/ui/Textarea/Textarea";
import { NumberInput } from "@/components/ui/NumberInput/NumberInput";
import { Switch } from "@/components/ui/Switch/Switch";
import { Label } from "@/components/ui/Label/Label";
import { Spinner } from "@/components/ui/Spinner/Spinner";
import { ImageUpload } from "@/components/forms/ImageUpload/ImageUpload";
import { GameSelect } from "@/components/forms/GameSelect/GameSelect";
import { PlatformSelect } from "@/components/forms/PlatformSelect/PlatformSelect";
import { ArrayStringField } from "@/components/forms/ArrayStringField/ArrayStringField";
import { WhatYouGetEditor } from "@/components/forms/WhatYouGetEditor/WhatYouGetEditor";
import { SectionsEditor } from "@/components/forms/SectionsEditor/SectionsEditor";
import { ServiceOptionsManager } from "@/features/services/components/ServiceOptionsManager";
import {
  useService,
  useCreateService,
  useUpdateService,
} from "@/features/services/hooks/useServices";
import { useToast } from "@/components/ui/Toast/Toast";
import { slugify } from "@/lib/utils";
import { ru } from "@/locales/ru";
import styles from "./ServiceFormPage.module.css";

const emptyToNull = (v) => (v === "" || v == null ? null : v);
const ensureArray = (v) => (Array.isArray(v) ? v : []);

const schema = yup.object({
  game_id: yup.string().required(ru.services.validation.gameRequired),
  platform: yup
    .string()
    .oneOf(["ps", "xbox", "pc"], ru.services.validation.platformRequired)
    .required(ru.services.validation.platformRequired),
  slug: yup
    .string()
    .trim()
    .required(ru.services.validation.slugRequired)
    .matches(/^[a-z0-9]+(-[a-z0-9]+)*$/, ru.services.validation.slugFormat),
  title: yup
    .string()
    .trim()
    .required(ru.services.validation.titleRequired)
    .min(2, ru.services.validation.titleMin)
    .max(300, ru.services.validation.titleMax),
  image_desktop_url: yup.string().nullable().transform(emptyToNull),
  image_mobile_url: yup.string().nullable().transform(emptyToNull),
  image_alt: yup.string().nullable().transform(emptyToNull).max(300, ru.services.validation.altMax),
  description: yup.array().nullable().transform(ensureArray).default([]),
  what_you_get: yup.array().nullable().transform(ensureArray).default([]),
  sections: yup.array().nullable().transform(ensureArray).default([]),
  seo_title: yup
    .string()
    .nullable()
    .transform(emptyToNull)
    .max(300, ru.services.validation.seoTitleMax),
  seo_description: yup
    .string()
    .nullable()
    .transform(emptyToNull)
    .max(500, ru.services.validation.seoDescriptionMax),
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
  game_id: "",
  platform: "",
  slug: "",
  title: "",
  image_desktop_url: null,
  image_mobile_url: null,
  image_alt: "",
  description: [],
  what_you_get: [],
  sections: [],
  seo_title: "",
  seo_description: "",
  is_featured: false,
  is_active: true,
  sort_order: 0,
};

function buildInitialValues(service, isEdit) {
  if (!isEdit || !service) return STATIC_DEFAULTS;
  return {
    game_id: service.game_id ?? service.game?.id ?? "",
    platform: String(service.platform ?? "").toLowerCase(),
    slug: service.slug ?? "",
    title: service.title ?? "",
    image_desktop_url: service.image_desktop_url ?? service.image_url ?? null,
    image_mobile_url: service.image_mobile_url ?? null,
    image_alt: service.image_alt ?? "",
    description: ensureArray(service.description),
    what_you_get: ensureArray(service.what_you_get),
    sections: ensureArray(service.sections),
    seo_title: service.seo_title ?? "",
    seo_description: service.seo_description ?? "",
    is_featured: Boolean(service.is_featured),
    is_active: service.is_active ?? true,
    sort_order: Number(service.sort_order) || 0,
  };
}

export function ServiceFormPage() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const { data: service, isLoading } = useService(id);

  if (isEdit && isLoading) {
    return (
      <div className={styles.loading}>
        <Spinner size="lg" />
      </div>
    );
  }

  // Inner component is keyed so it fully remounts when navigating between
  // /services/new and /services/:id/edit. Form receives service synchronously
  // via prop, so RHF defaultValues are correct from first render — no async
  // reset race with Radix Select preselection.
  return (
    <ServiceFormPageInner
      key={isEdit ? id : "new"}
      service={isEdit ? service : null}
      isEdit={isEdit}
      id={id}
    />
  );
}

function ServiceFormPageInner({ service, isEdit, id }) {
  const navigate = useNavigate();
  const toast = useToast();
  const [seoOpen, setSeoOpen] = useState(false);

  const createMutation = useCreateService();
  const updateMutation = useUpdateService();

  const initialValues = useMemo(
    () => buildInitialValues(service, isEdit),
    [service, isEdit],
  );

  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: initialValues,
  });

  // Edit mode: slug came preloaded → don't auto-overwrite from title.
  const slugManuallyEditedRef = useRef(isEdit);
  const watchedTitle = watch("title");

  useEffect(() => {
    if (isEdit) return;
    if (slugManuallyEditedRef.current) return;
    setValue("slug", slugify(watchedTitle ?? ""), { shouldValidate: false });
  }, [watchedTitle, isEdit, setValue]);

  const onSubmit = (values) => {
    const payload = {
      game_id: values.game_id,
      platform: values.platform,
      slug: values.slug.trim(),
      title: values.title.trim(),
      image_desktop_url: values.image_desktop_url || null,
      image_mobile_url: values.image_mobile_url || null,
      image_alt: values.image_alt?.trim() || null,
      description: ensureArray(values.description),
      what_you_get: ensureArray(values.what_you_get),
      sections: ensureArray(values.sections),
      seo_title: values.seo_title?.trim() || null,
      seo_description: values.seo_description?.trim() || null,
      is_featured: Boolean(values.is_featured),
      is_active: Boolean(values.is_active),
      sort_order: Number(values.sort_order) || 0,
    };

    const onApiError = (err) => {
      const status = err?.response?.status;
      const detail = err?.response?.data?.detail;
      if (status === 409) {
        setError("slug", { type: "server", message: ru.services.validation.slugTaken });
        return;
      }
      toast.error(ru.common.error, detail || ru.services.toasts.error);
    };

    if (isEdit) {
      updateMutation.mutate(
        { id, payload },
        {
          onSuccess: () => toast.success(ru.services.toasts.updated),
          onError: onApiError,
        },
      );
    } else {
      createMutation.mutate(payload, {
        onSuccess: (created) => {
          toast.success(ru.services.toasts.created);
          if (created?.id) {
            navigate(`/services/${created.id}/edit`, { replace: true });
          } else {
            navigate("/services");
          }
        },
        onError: onApiError,
      });
    }
  };

  const onValidationError = (formErrors) => {
    if (import.meta.env.DEV) {
      console.warn("[ServiceForm] validation failed:", formErrors);
    }
    const firstField = Object.keys(formErrors)[0];
    const firstMessage = formErrors[firstField]?.message;
    toast.error(
      ru.common.error,
      firstMessage || "Проверьте заполнение полей формы",
    );
  };

  const isSaving = createMutation.isPending || updateMutation.isPending || isSubmitting;
  const title = isEdit ? ru.services.edit : ru.services.create;

  return (
    <>
      <PageHeader
        title={title}
        breadcrumb={[
          { label: ru.services.title, to: "/services" },
          { label: title },
        ]}
        action={
          <div className={styles.headerActions}>
            <Link to="/services">
              <Button type="button" variant="ghost" disabled={isSaving}>
                {ru.common.cancel}
              </Button>
            </Link>
            <Button type="submit" form="service-form" variant="primary" loading={isSaving}>
              {isSaving ? ru.common.saving : ru.common.save}
            </Button>
          </div>
        }
      />

      <form
        id="service-form"
        onSubmit={handleSubmit(onSubmit, onValidationError)}
        noValidate
        className={styles.form}
      >
        <Card
          variant="elevated"
          header={<h2 className={styles.cardTitle}>{ru.services.sections.basic}</h2>}
        >
          <div className={styles.fields}>
            <div className={styles.row2}>
              <Controller
                name="game_id"
                control={control}
                render={({ field, fieldState }) => (
                  <GameSelect
                    label={ru.services.fields.game}
                    value={field.value}
                    onChange={field.onChange}
                    error={fieldState.error?.message}
                  />
                )}
              />
              <Controller
                name="platform"
                control={control}
                render={({ field, fieldState }) => (
                  <PlatformSelect
                    label={ru.services.fields.platform}
                    value={field.value}
                    onChange={field.onChange}
                    error={fieldState.error?.message}
                  />
                )}
              />
            </div>

            <Input
              label={ru.services.fields.title}
              placeholder="GTA Online Cash Boost PS4/PS5"
              error={errors.title?.message}
              {...register("title")}
            />

            <Input
              label={ru.services.fields.slug}
              placeholder="gta-cash-ps"
              helperText={ru.services.fields.slugHelper}
              error={errors.slug?.message}
              {...register("slug", {
                onChange: () => {
                  slugManuallyEditedRef.current = true;
                },
              })}
            />

            <div className={styles.imageGrid}>
              <div className={styles.field}>
                <Label>{ru.services.fields.imageDesktop}</Label>
                <Controller
                  name="image_desktop_url"
                  control={control}
                  render={({ field, fieldState }) => (
                    <ImageUpload
                      value={field.value}
                      onChange={field.onChange}
                      folder="services"
                      error={fieldState.error?.message}
                    />
                  )}
                />
                <p className={styles.fieldHint}>{ru.services.fields.imageDesktopHint}</p>
              </div>

              <div className={styles.field}>
                <Label>{ru.services.fields.imageMobile}</Label>
                <Controller
                  name="image_mobile_url"
                  control={control}
                  render={({ field, fieldState }) => (
                    <ImageUpload
                      value={field.value}
                      onChange={field.onChange}
                      folder="services"
                      error={fieldState.error?.message}
                    />
                  )}
                />
                <p className={styles.fieldHint}>{ru.services.fields.imageMobileHint}</p>
              </div>
            </div>

            <Input
              label={ru.services.fields.imageAlt}
              error={errors.image_alt?.message}
              {...register("image_alt")}
            />
          </div>
        </Card>

        <Card
          variant="elevated"
          header={<h2 className={styles.cardTitle}>{ru.services.sections.content}</h2>}
        >
          <div className={styles.fields}>
            <Controller
              name="description"
              control={control}
              render={({ field }) => (
                <ArrayStringField
                  label={ru.services.fields.description}
                  value={field.value}
                  onChange={field.onChange}
                  rows={3}
                  placeholder="Введите параграф описания..."
                />
              )}
            />

            <Controller
              name="what_you_get"
              control={control}
              render={({ field }) => (
                <WhatYouGetEditor
                  label={ru.services.fields.whatYouGet}
                  value={field.value}
                  onChange={field.onChange}
                />
              )}
            />

            <Controller
              name="sections"
              control={control}
              render={({ field }) => (
                <SectionsEditor
                  label={ru.services.fields.sectionsList}
                  value={field.value}
                  onChange={field.onChange}
                />
              )}
            />
          </div>
        </Card>

        <Card
          variant="elevated"
          header={
            <button
              type="button"
              className={styles.collapsibleTrigger}
              onClick={() => setSeoOpen((s) => !s)}
              aria-expanded={seoOpen}
            >
              {seoOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
              <h2 className={styles.cardTitle}>{ru.services.sections.seo}</h2>
            </button>
          }
        >
          {seoOpen && (
            <div className={styles.fields}>
              <Input
                label={ru.services.fields.seoTitle}
                error={errors.seo_title?.message}
                {...register("seo_title")}
              />
              <Textarea
                label={ru.services.fields.seoDescription}
                rows={3}
                error={errors.seo_description?.message}
                {...register("seo_description")}
              />
            </div>
          )}
        </Card>

        <Card
          variant="elevated"
          header={<h2 className={styles.cardTitle}>{ru.services.sections.settings}</h2>}
        >
          <div className={styles.fields}>
            <NumberInput
              label={ru.services.fields.sortOrder}
              min={0}
              error={errors.sort_order?.message}
              {...register("sort_order", {
                setValueAs: (v) =>
                  v === "" || v == null ? 0 : Number(v),
              })}
            />

            <Controller
              name="is_active"
              control={control}
              render={({ field }) => (
                <div className={styles.switchRow}>
                  <Label htmlFor="service-is-active">{ru.services.fields.isActive}</Label>
                  <Switch
                    id="service-is-active"
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
                  <Label htmlFor="service-is-featured">{ru.services.fields.isFeatured}</Label>
                  <Switch
                    id="service-is-featured"
                    checked={Boolean(field.value)}
                    onCheckedChange={field.onChange}
                  />
                </div>
              )}
            />
          </div>
        </Card>

        <Card
          variant="elevated"
          header={<h2 className={styles.cardTitle}>{ru.services.sections.options}</h2>}
        >
          {isEdit ? (
            <ServiceOptionsManager serviceId={id} />
          ) : (
            <p className={styles.placeholder}>{ru.services.optionsPlaceholder}</p>
          )}
        </Card>

        <div className={styles.footerActions}>
          <Link to="/services">
            <Button type="button" variant="ghost" disabled={isSaving}>
              {ru.common.cancel}
            </Button>
          </Link>
          <Button type="submit" variant="primary" loading={isSaving}>
            {isSaving ? ru.common.saving : ru.common.save}
          </Button>
        </div>
      </form>
    </>
  );
}

import { useEffect, useRef } from "react";
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
import { ImageUpload } from "@/components/forms/ImageUpload/ImageUpload";
import { useGame, useCreateGame, useUpdateGame } from "@/features/games/hooks/useGames";
import { useToast } from "@/components/ui/Toast/Toast";
import { slugify } from "@/lib/utils";
import { ru } from "@/locales/ru";
import styles from "./GameFormPage.module.css";

const schema = yup.object({
  name: yup
    .string()
    .trim()
    .required(ru.games.validation.nameRequired)
    .min(2, ru.games.validation.nameMin)
    .max(200, ru.games.validation.nameMax),
  slug: yup
    .string()
    .trim()
    .required(ru.games.validation.slugRequired)
    .matches(/^[a-z0-9]+(-[a-z0-9]+)*$/, ru.games.validation.slugFormat),
  description: yup.string().nullable(),
  sort_order: yup.number().typeError("Введите число").integer().min(0).default(0),
  is_active: yup.boolean().default(true),
  image_url: yup.string().nullable(),
});

export function GameFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  const toast = useToast();

  const { data: game, isLoading: isLoadingGame } = useGame(id);
  const createMutation = useCreateGame();
  const updateMutation = useUpdateGame();

  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      name: "",
      slug: "",
      description: "",
      sort_order: 0,
      is_active: true,
      image_url: null,
    },
  });

  const slugManuallyEditedRef = useRef(false);
  const watchedName = watch("name");

  useEffect(() => {
    if (game && isEdit) {
      reset({
        name: game.name ?? "",
        slug: game.slug ?? "",
        description: game.description ?? "",
        sort_order: game.sort_order ?? 0,
        is_active: game.is_active ?? true,
        image_url: game.image_url ?? null,
      });
      slugManuallyEditedRef.current = true;
    }
  }, [game, isEdit, reset]);

  useEffect(() => {
    if (isEdit) return;
    if (slugManuallyEditedRef.current) return;
    setValue("slug", slugify(watchedName ?? ""), { shouldValidate: false });
  }, [watchedName, isEdit, setValue]);

  const onSubmit = (values) => {
    const payload = {
      name: values.name.trim(),
      slug: values.slug.trim(),
      description: values.description?.trim() || null,
      sort_order: Number(values.sort_order) || 0,
      is_active: values.is_active,
      image_url: values.image_url || null,
    };

    const onApiError = (err) => {
      const status = err?.response?.status;
      const detail = err?.response?.data?.detail;
      if (status === 409) {
        setError("slug", { type: "server", message: ru.games.validation.slugTaken });
        return;
      }
      toast.error(ru.common.error, detail || ru.games.toasts.error);
    };

    if (isEdit) {
      updateMutation.mutate(
        { id, payload },
        {
          onSuccess: () => {
            toast.success(ru.games.toasts.updated);
            navigate("/games");
          },
          onError: onApiError,
        },
      );
    } else {
      createMutation.mutate(payload, {
        onSuccess: () => {
          toast.success(ru.games.toasts.created);
          navigate("/games");
        },
        onError: onApiError,
      });
    }
  };

  const onValidationError = (formErrors) => {
    if (import.meta.env.DEV) {
      console.warn("[GameForm] validation failed:", formErrors);
    }
    const firstField = Object.keys(formErrors)[0];
    const firstMessage = formErrors[firstField]?.message;
    toast.error(ru.common.error, firstMessage || "Проверьте заполнение полей формы");
  };

  if (isEdit && isLoadingGame) {
    return (
      <div className={styles.loading}>
        <Spinner size="lg" />
      </div>
    );
  }

  const isSaving = createMutation.isPending || updateMutation.isPending || isSubmitting;
  const title = isEdit ? ru.games.edit : ru.games.create;

  return (
    <>
      <PageHeader
        title={title}
        breadcrumb={[
          { label: ru.games.title, to: "/games" },
          { label: isEdit ? ru.games.edit : ru.games.create },
        ]}
      />

      <form onSubmit={handleSubmit(onSubmit, onValidationError)} noValidate>
        <Card
          variant="elevated"
          footer={
            <div className={styles.footer}>
              <Link to="/games">
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
            <div className={styles.field}>
              <Label>{ru.games.fields.image}</Label>
              <Controller
                name="image_url"
                control={control}
                render={({ field, fieldState }) => (
                  <ImageUpload
                    value={field.value}
                    onChange={field.onChange}
                    folder="games"
                    error={fieldState.error?.message}
                  />
                )}
              />
            </div>

            <Input
              label={ru.games.fields.name}
              placeholder="GTA 5 Online"
              error={errors.name?.message}
              {...register("name")}
            />

            <Input
              label={ru.games.fields.slug}
              placeholder="gta5"
              helperText={ru.games.fields.slugHelper}
              error={errors.slug?.message}
              {...register("slug", {
                onChange: () => {
                  slugManuallyEditedRef.current = true;
                },
              })}
            />

            <Textarea
              label={ru.games.fields.description}
              rows={4}
              error={errors.description?.message}
              {...register("description")}
            />

            <NumberInput
              label={ru.games.fields.sortOrder}
              min={0}
              error={errors.sort_order?.message}
              {...register("sort_order", { valueAsNumber: true })}
            />

            <Controller
              name="is_active"
              control={control}
              render={({ field }) => (
                <div className={styles.switchRow}>
                  <Label htmlFor="game-is-active">{ru.games.fields.isActive}</Label>
                  <Switch
                    id="game-is-active"
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

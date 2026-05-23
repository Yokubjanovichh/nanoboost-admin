import { useEffect, useState } from "react";
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
import { Textarea } from "@/components/ui/Textarea/Textarea";
import { Switch } from "@/components/ui/Switch/Switch";
import { Label } from "@/components/ui/Label/Label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/Tabs/Tabs";
import { MarkdownPreview } from "@/features/faq/components/MarkdownPreview";
import { ru } from "@/locales/ru";
import styles from "./FaqDialog.module.css";

const QUESTION_MAX = 500;
const ANSWER_MAX = 10000;

const schema = yup.object({
  question: yup
    .string()
    .trim()
    .required(ru.faqs.validation.questionRequired)
    .max(QUESTION_MAX, ru.faqs.validation.questionMax),
  answer: yup
    .string()
    .trim()
    .required(ru.faqs.validation.answerRequired)
    .max(ANSWER_MAX, ru.faqs.validation.answerMax),
  is_active: yup.boolean().default(true),
});

const defaultValues = {
  question: "",
  answer: "",
  is_active: true,
};

export function FaqDialog({ open, onOpenChange, faq, onSubmit, loading = false }) {
  const isEdit = Boolean(faq?.id);
  const [tab, setTab] = useState("edit");

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

  const questionValue = watch("question") || "";
  const answerValue = watch("answer") || "";

  useEffect(() => {
    if (open) {
      reset(
        faq
          ? {
              question: faq.question ?? "",
              answer: faq.answer ?? "",
              is_active: faq.is_active !== false,
            }
          : defaultValues,
      );
      setTab("edit");
    }
  }, [open, faq, reset]);

  // Cmd/Ctrl+Enter submits — matches the keyboard shortcut behaviour the TZ
  // calls out so admins can save without reaching for the mouse.
  const onKeyDown = (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
      e.preventDefault();
      handleSubmit(submit)();
    }
  };

  const submit = (values) => {
    onSubmit?.({
      question: values.question.trim(),
      answer: values.answer.trim(),
      is_active: Boolean(values.is_active),
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isEdit ? ru.faqs.edit : ru.faqs.create}
          </DialogTitle>
        </DialogHeader>

        <form
          onSubmit={handleSubmit(submit)}
          noValidate
          onKeyDown={onKeyDown}
          className={styles.form}
        >
          <Input
            label={ru.faqs.fields.question}
            placeholder={ru.faqs.fields.questionPlaceholder}
            maxLength={QUESTION_MAX}
            error={errors.question?.message}
            helperText={`${questionValue.length}/${QUESTION_MAX}`}
            {...register("question")}
          />

          <div className={styles.answerBlock}>
            <Label>{ru.faqs.fields.answer}</Label>
            <Tabs value={tab} onValueChange={setTab} className={styles.tabs}>
              <TabsList>
                <TabsTrigger value="edit">{ru.faqs.editMode}</TabsTrigger>
                <TabsTrigger value="preview">{ru.faqs.preview}</TabsTrigger>
              </TabsList>
              <TabsContent value="edit" className={styles.tabPanel}>
                <Textarea
                  rows={10}
                  placeholder={ru.faqs.fields.answerPlaceholder}
                  maxLength={ANSWER_MAX}
                  error={errors.answer?.message}
                  className={styles.answerTextarea}
                  {...register("answer")}
                />
                <p className={styles.hint}>
                  {ru.faqs.markdownHint}{" "}
                  <span className={styles.counter}>
                    {answerValue.length}/{ANSWER_MAX}
                  </span>
                </p>
              </TabsContent>
              <TabsContent value="preview" className={styles.tabPanel}>
                <MarkdownPreview
                  source={answerValue}
                  empty={ru.faqs.previewEmpty}
                />
              </TabsContent>
            </Tabs>
          </div>

          <Controller
            name="is_active"
            control={control}
            render={({ field }) => (
              <div className={styles.switchRow}>
                <Label htmlFor="faq-is-active">{ru.faqs.fields.isActive}</Label>
                <Switch
                  id="faq-is-active"
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

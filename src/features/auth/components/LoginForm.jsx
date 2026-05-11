import { useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { Mail, Lock, Eye, EyeOff, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/Button/Button";
import { Input } from "@/components/ui/Input/Input";
import { useLogin } from "@/features/auth/hooks/useAuth";
import { useToast } from "@/components/ui/Toast/Toast";
import { ru } from "@/locales/ru";
import styles from "./LoginForm.module.css";

const schema = yup.object({
  email: yup.string().required(ru.auth.emailRequired).email(ru.auth.emailInvalid),
  password: yup.string().required(ru.auth.passwordRequired),
});

function getApiErrorMessage(error) {
  if (!error.response) return ru.auth.networkError;
  const status = error.response.status;
  if (status === 401) return ru.auth.invalidCredentials;
  if (status === 403) return ru.auth.userInactive;
  return error.response.data?.detail || error.response.data?.message || ru.auth.unknownError;
}

export function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const toast = useToast();
  const loginMutation = useLogin();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: { email: "", password: "" },
    mode: "onBlur",
  });

  const onSubmit = (values) => {
    setSubmitError("");
    loginMutation.mutate(values, {
      onError: (error) => {
        const message = getApiErrorMessage(error);
        setSubmitError(message);
        toast.error(ru.common.error, message);
      },
    });
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit(onSubmit)} noValidate>
      {submitError && (
        <div className={styles.alert} role="alert" data-testid="login-error">
          <AlertCircle size={16} aria-hidden="true" />
          <span>{submitError}</span>
        </div>
      )}
      <Input
        type="email"
        label={ru.auth.email}
        placeholder={ru.auth.emailPlaceholder}
        autoComplete="email"
        prefix={<Mail size={16} />}
        error={errors.email?.message}
        {...register("email")}
      />

      <Input
        type={showPassword ? "text" : "password"}
        label={ru.auth.password}
        placeholder={ru.auth.passwordPlaceholder}
        autoComplete="current-password"
        prefix={<Lock size={16} />}
        suffix={
          <button
            type="button"
            className={styles.eyeBtn}
            onClick={() => setShowPassword((s) => !s)}
            aria-label={showPassword ? "Скрыть пароль" : "Показать пароль"}
            tabIndex={-1}
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        }
        error={errors.password?.message}
        {...register("password")}
      />

      <div className={styles.forgotRow}>
        <button type="button" className={styles.forgotLink} disabled>
          {ru.auth.forgotPassword}
        </button>
      </div>

      <Button type="submit" size="lg" loading={loginMutation.isPending} fullWidth>
        {loginMutation.isPending ? ru.auth.loginLoading : ru.auth.loginButton}
      </Button>
    </form>
  );
}

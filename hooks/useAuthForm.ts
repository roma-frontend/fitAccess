// hooks/useAuthForm.ts
"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { validateEmailFormat, validateName, validatePassword } from "@/utils/authValidation";

interface ValidationState {
  isValid: boolean;
  errors: string[];
  warnings?: string[];
}

interface FormData {
  email: string;
  password: string;
  name: string;
  phone: string;
}

export function useAuthForm() {
  const [isLogin, setIsLogin] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [emailValid, setEmailValid] = useState<boolean>(false);
  const [formData, setFormData] = useState<FormData>({
    email: "",
    password: "",
    name: "",
    phone: "",
  });
  // Возвращаемся к исходному типу ValidationState
  const [validationStates, setValidationStates] = useState<
    Record<string, ValidationState>
  >({});
  const [isValidating, setIsValidating] = useState<boolean>(false);

  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get("redirect");

  // Инициализация формы при смене режима
  useEffect(() => {
    if (isLogin) {
      setFormData((prev) => ({
        email: prev.email,
        password: prev.password,
        name: "",
        phone: "",
      }));
    } else {
      setFormData((prev) => ({
        email: prev.email,
        password: "",
        name: "",
        phone: "",
      }));
    }
    setError("");
  }, [isLogin]);

  // Проверяем авторизацию только при загрузке страницы
  useEffect(() => {
    let isMounted = true;

    const checkAuth = async () => {
      try {
        const response = await fetch("/api/auth/check");
        const data = await response.json();

        if (isMounted && data.authenticated && data.user?.role === "member") {
          console.log("Пользователь уже авторизован, перенаправляем на дашборд");
          router.replace("/member-dashboard");
        }
      } catch (error) {
        console.log("Проверка авторизации не удалась:", error);
      }
    };

    checkAuth();

    return () => {
      isMounted = false;
    };
  }, [router]);

  // Валидация email с debounce
  useEffect(() => {
    if (!formData.email) {
      setEmailValid(false);
      setValidationStates((prev) => {
        const newState = { ...prev };
        delete newState.email;
        return newState;
      });
      return;
    }

    const timeoutId = setTimeout(() => {
      try {
        setIsValidating(true);
        const validation = validateEmailFormat(formData.email);
        setEmailValid(validation.isValid);

        setValidationStates((prev) => ({
          ...prev,
          email: validation,
        }));
      } catch (error) {
        console.error("Ошибка валидации email:", error);
        setEmailValid(false);
        setValidationStates((prev) => ({
          ...prev,
          email: {
            isValid: false,
            errors: ["Ошибка проверки email"],
          },
        }));
      } finally {
        setIsValidating(false);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [formData.email]);

  // Валидация имени
  useEffect(() => {
    if (!isLogin && formData.name) {
      const timeoutId = setTimeout(() => {
        const validation = validateName(formData.name);
        setValidationStates((prev) => ({
          ...prev,
          name: validation,
        }));
      }, 300);

      return () => clearTimeout(timeoutId);
    } else if (isLogin) {
      setValidationStates((prev) => {
        const newState = { ...prev };
        delete newState.name;
        return newState;
      });
    }
  }, [formData.name, isLogin]);

  // Валидация пароля
  useEffect(() => {
    if (formData.password) {
      const timeoutId = setTimeout(() => {
        const validation = validatePassword(formData.password, isLogin);
        setValidationStates((prev) => ({
          ...prev,
          password: validation,
        }));
      }, 300);

      return () => clearTimeout(timeoutId);
    } else {
      setValidationStates((prev) => {
        const newState = { ...prev };
        delete newState.password;
        return newState;
      });
    }
  }, [formData.password, isLogin]);

  // Мемоизированная проверка готовности формы
  const isFormReady = useMemo<boolean>(() => {
    if (isLogin) {
      return Boolean(formData.email && formData.password && emailValid);
    }

    const nameValid = Boolean(formData.name && formData.name.length >= 2);
    const passwordValid = Boolean(formData.password && formData.password.length >= 6);
    return Boolean(nameValid && formData.email && passwordValid && emailValid);
  }, [isLogin, formData, emailValid]);

  // Обработчик изменения полей
  const handleFieldChange = useCallback(
    (fieldName: keyof FormData, value: string) => {
      setFormData((prev) => ({ ...prev, [fieldName]: value }));
      if (error) setError("");
    },
    [error]
  );

  // Обработчик отправки формы
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isFormReady || loading || isValidating) return;

    setLoading(true);
    setError("");

    try {
      const emailValidation = validateEmailFormat(formData.email);
      if (!emailValidation.isValid) {
        setError(`Ошибка email: ${emailValidation.errors.join(", ")}`);
        setLoading(false);
        return;
      }

      const endpoint = isLogin
        ? "/api/auth/member-login"
        : "/api/auth/member-register";

      const payload = isLogin
        ? {
            email: formData.email.trim().toLowerCase(),
            password: formData.password,
          }
        : {
            name: formData.name.trim(),
            email: formData.email.trim().toLowerCase(),
            password: formData.password,
            phone: formData.phone.trim() || undefined,
          };

      console.log("🚀 Отправка запроса на:", endpoint, {
        ...payload,
        password: "***",
      });

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      console.log("📨 Ответ сервера:", {
        ...data,
        user: data.user ? { ...data.user, password: undefined } : undefined,
      });

      if (response.ok && data.success) {
        if (isLogin) {
          console.log("✅ Успешный вход");

          toast({
            title: "Добро пожаловать! 🎉",
            description: `Здравствуйте, ${data.user?.name || "участник"}!`,
          });

          const destination =
            data.redirectTo || redirectPath || "/member-dashboard";
          console.log("🔄 Перенаправление на:", destination);

          setTimeout(() => {
            window.location.href = destination;
          }, 500);
        } else {
          console.log("✅ Успешная регистрация");
          toast({
            title: "Регистрация завершена! 🎉",
            description: "Теперь вы можете войти в систему",
          });

          setIsLogin(true);
        }
      } else {
        throw new Error(data.error || `Ошибка ${response.status}`);
      }
    } catch (error) {
      console.error("💥 Ошибка:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Не удалось выполнить операцию";
      setError(errorMessage);
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = useCallback(() => {
    setIsLogin((prev) => !prev);
    setError("");
  }, []);

  const fillFormData = useCallback((data: FormData) => {
    setFormData(data);
  }, []);

  const clearForm = useCallback(() => {
    setFormData({
      email: "",
      password: "",
      name: "",
      phone: "",
    });
    setEmailValid(false);
    setValidationStates({});
  }, []);

  return {
    // Состояние
    isLogin: Boolean(isLogin),
    loading: Boolean(loading),
    error,
    emailValid: Boolean(emailValid),
    formData,
    validationStates,
    isValidating: Boolean(isValidating),
    isFormReady: Boolean(isFormReady),

    // Действия
    handleFieldChange,
    handleSubmit,
    toggleMode,
    fillFormData,
    clearForm,
  };
}

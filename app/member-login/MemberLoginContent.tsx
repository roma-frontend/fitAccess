// app/member-login/MemberLoginContent.tsx
"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  User,
  AlertCircle,
  Loader2,
  Shield,
  UserPlus,
  CheckCircle,
} from "lucide-react";
import { ValidatedInput } from "@/components/ValidatedInput";
import { PasswordStrengthIndicator } from "@/components/PasswordStrengthIndicator";
import { validatePasswordStrength } from "@/utils/validation";

// Определяем интерфейсы для типизации
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

// Улучшенная функция валидации email
const validateEmailFormat = (
  email: string
): { isValid: boolean; errors: string[]; warnings?: string[] } => {
  if (!email) {
    return { isValid: false, errors: ["Email обязателен"] };
  }

  // Базовая проверка формата
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { isValid: false, errors: ["Неверный формат email адреса"] };
  }

  // Дополнительные проверки
  const warnings: string[] = [];

  // Проверка на двойные точки
  if (email.includes("..")) {
    return {
      isValid: false,
      errors: ["Email не может содержать двойные точки"],
    };
  }

  // Проверка длины
  if (email.length > 254) {
    return { isValid: false, errors: ["Email слишком длинный"] };
  }

  // Проверка локальной части
  const [localPart, domain] = email.split("@");
  if (localPart.length > 64) {
    return {
      isValid: false,
      errors: ["Локальная часть email слишком длинная"],
    };
  }

  // Проверка домена
  if (!domain || domain.length < 3) {
    return { isValid: false, errors: ["Неверный домен"] };
  }

  // Проверка TLD
  const tld = domain.split(".").pop();
  if (!tld || tld.length < 2 || tld.length > 6) {
    return { isValid: false, errors: ["Неверное доменное расширение"] };
  }

  // Предупреждения для тестовых доменов
  const testDomains = ["test.com", "example.com", "localhost"];
  if (
    testDomains.some((testDomain) => domain.toLowerCase().includes(testDomain))
  ) {
    warnings.push("Используется тестовый домен");
  }

  return { isValid: true, errors: [], warnings };
};

export default function MemberLoginContent() {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [emailValid, setEmailValid] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    email: "",
    password: "",
    name: "",
    phone: "",
  });
  const [validationStates, setValidationStates] = useState<
    Record<string, ValidationState>
  >({});
  const [isValidating, setIsValidating] = useState(false);

  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get("redirect");

  // Инициализация формы при смене режима
  useEffect(() => {
    if (isLogin) {
      // Для входа сохраняем email и пароль, очищаем остальное
      setFormData((prev) => ({
        email: prev.email,
        password: prev.password,
        name: "",
        phone: "",
      }));
    } else {
      // Для регистрации сохраняем email, очищаем пароль
      setFormData((prev) => ({
        email: prev.email,
        password: "",
        name: "",
        phone: "",
      }));
    }
    setError("");
    // НЕ сбрасываем emailValid и validationStates для email при переключении режима
  }, [isLogin]);

  // Проверяем авторизацию только при загрузке страницы
  useEffect(() => {
    let isMounted = true;

    const checkAuth = async () => {
      try {
        const response = await fetch("/api/auth/check");
        const data = await response.json();

        if (isMounted && data.authenticated && data.user?.role === "member") {
          console.log(
            "Пользователь уже авторизован, перенаправляем на дашборд"
          );
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
    }, 300); // Уменьшили debounce для лучшего UX

    return () => clearTimeout(timeoutId);
  }, [formData.email]);

  // Валидация имени
  useEffect(() => {
    if (!isLogin && formData.name) {
      const timeoutId = setTimeout(() => {
        const isValid =
          formData.name.length >= 2 &&
          /^[a-zA-Zа-яА-ЯёЁ\s]+$/.test(formData.name);
        setValidationStates((prev) => ({
          ...prev,
          name: {
            isValid,
            errors: isValid
              ? []
              : ["Имя должно содержать минимум 2 символа и только буквы"],
          },
        }));
      }, 300);

      return () => clearTimeout(timeoutId);
    } else if (isLogin) {
      // Убираем валидацию имени для режима входа
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
        const minLength = isLogin ? 1 : 6;
        const isValid = formData.password.length >= minLength;
        setValidationStates((prev) => ({
          ...prev,
          password: {
            isValid,
            errors: isValid
              ? []
              : [`Пароль должен содержать минимум ${minLength} символов`],
          },
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
  const isFormReady = useMemo(() => {
    // Для входа требуем только email и пароль
    if (isLogin) {
      return formData.email && formData.password && emailValid;
    }

    // Для регистрации требуем все обязательные поля
    const nameValid = formData.name && formData.name.length >= 2;
    const passwordValid = formData.password && formData.password.length >= 6;
    return nameValid && formData.email && passwordValid && emailValid;
  }, [isLogin, formData, emailValid]);

  // Обработчик изменения полей
  const handleFieldChange = useCallback(
    (fieldName: keyof FormData, value: string) => {
      setFormData((prev) => ({ ...prev, [fieldName]: value }));
      // Очищаем общую ошибку при изменении полей
      if (error) setError("");
    },
    [error]
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isFormReady || loading || isValidating) return;

    setLoading(true);
    setError("");

    try {
      // Финальная проверка email перед отправкой
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

          // Сохраняем email и переключаемся на вход
          const registeredEmail = formData.email;
          setIsLogin(true);
          // Email сохранится через useEffect
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

  const fillTestData = useCallback(
    (isValid: boolean = true) => {
      if (isValid) {
        setFormData({
          email: "test@example.com",
          password: isLogin ? "password123" : "SecurePass123!",
          name: isLogin ? "" : "Тестовый Пользователь",
          phone: isLogin ? "" : "+7 (999) 123-45-67",
        });
        toast({
          title: "Тестовые данные заполнены",
          description: "Проверьте валидацию и отправьте форму",
        });
      } else {
        setFormData({
          email: "invalid-email",
          password: "123",
          name: isLogin ? "" : "А",
          phone: "",
        });
        toast({
          title: "Некорректные данные заполнены",
                    description: "Посмотрите на работу валидации",
        });
      }
    },
    [isLogin, toast]
  );

  const renderField = (
    fieldName: keyof FormData,
    label: string,
    placeholder: string,
    type: string = "text",
    required: boolean = true
  ) => {
    const fieldState = validationStates[fieldName];

    return (
      <div key={fieldName}>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label} {required && "*"}
          {fieldName === "password" && !isLogin && (
            <span className="text-xs text-gray-500 ml-1">
              (минимум 6 символов)
            </span>
          )}
        </label>
        <ValidatedInput
          type={type as any}
          name={fieldName}
          value={formData[fieldName]}
          onChange={(e) => handleFieldChange(fieldName, e.target.value)}
          placeholder={placeholder}
          required={required}
          showPasswordToggle={type === "password"}
          className="h-11 w-full"
        />

        {/* Email валидация */}
        {fieldName === "email" && formData.email && (
          <div className="mt-2">
            {isValidating ? (
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Проверка email...</span>
              </div>
            ) : fieldState ? (
              <div className="space-y-1">
                {fieldState.isValid ? (
                  <div className="flex items-center space-x-2 text-sm text-green-600">
                    <CheckCircle className="h-4 w-4" />
                    <span>Email корректный</span>
                  </div>
                ) : (
                  <div className="space-y-1">
                    {fieldState.errors.map((error, index) => (
                      <div
                        key={index}
                        className="flex items-center space-x-2 text-sm text-red-600"
                      >
                        <AlertCircle className="h-4 w-4" />
                        <span>{error}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Предупреждения */}
                {fieldState.warnings && fieldState.warnings.length > 0 && (
                  <div className="space-y-1">
                    {fieldState.warnings.map((warning, index) => (
                      <div
                        key={index}
                        className="flex items-center space-x-2 text-sm text-orange-600"
                      >
                        <AlertCircle className="h-4 w-4" />
                        <span>{warning}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : null}
          </div>
        )}

        {/* Индикатор силы пароля для регистрации */}
        {fieldName === "password" && !isLogin && formData.password && (
          <PasswordStrengthIndicator
            strength={validatePasswordStrength(formData.password)}
            password={formData.password}
          />
        )}

        {/* Отображение ошибок других полей */}
        {fieldName !== "email" &&
          fieldState &&
          fieldState.errors.length > 0 && (
            <div className="mt-1 space-y-1">
              {fieldState.errors.map((error: string, index: number) => (
                <p
                  key={index}
                  className="text-sm text-red-600 flex items-center"
                >
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {error}
                </p>
              ))}
            </div>
          )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <Card className="shadow-xl">
          <CardHeader className="text-center pb-6">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
              {isLogin ? (
                <User className="h-8 w-8 text-white" />
              ) : (
                <UserPlus className="h-8 w-8 text-white" />
              )}
            </div>
            <CardTitle className="text-2xl font-bold">
              {isLogin ? "Вход в FitAccess" : "Регистрация в FitAccess"}
            </CardTitle>
            <CardDescription className="text-base">
              {isLogin
                ? "Войдите в свой аккаунт участника"
                : "Создайте новый аккаунт участника"}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-red-600 flex-shrink-0" />
                <span className="text-sm text-red-700">{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin &&
                renderField(
                  "name",
                  "Полное имя",
                  "Ваше полное имя",
                  "text",
                  true
                )}

              {renderField(
                "email",
                "Email адрес",
                "your@email.com",
                "email",
                true
              )}

              {renderField(
                "password",
                "Пароль",
                "Введите пароль",
                "password",
                true
              )}

              {!isLogin &&
                renderField(
                  "phone",
                  "Номер телефона",
                  "+7 (999) 123-45-67",
                  "tel",
                  false
                )}

              <Button
                type="submit"
                disabled={loading || !isFormReady || isValidating}
                className={`w-full h-11 transition-all duration-300 ${
                  isFormReady && !isValidating
                    ? "bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 shadow-lg"
                    : "bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"
                }`}
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    {isLogin ? "Входим..." : "Регистрируем..."}
                  </>
                ) : isValidating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Проверка данных...
                  </>
                ) : isLogin ? (
                  "Войти в систему"
                ) : (
                  "Создать аккаунт"
                )}
              </Button>
            </form>

            <div className="text-center">
              <button
                type="button"
                onClick={toggleMode}
                disabled={loading || isValidating}
                className="text-blue-600 hover:text-blue-500 text-sm font-medium transition-colors disabled:opacity-50"
              >
                {isLogin
                  ? "Нет аккаунта? Зарегистрируйтесь"
                  : "Уже есть аккаунт? Войдите"}
              </button>
            </div>

            <div className="pt-6 border-t border-gray-200">
              <div className="text-center space-y-3">
                <p className="text-xs text-gray-500">Другие варианты входа</p>
                <div className="space-y-2">
                  <Button
                    variant="outline"
                    onClick={() => (window.location.href = "/staff-login")}
                    className="w-full h-10"
                    disabled={loading}
                  >
                    🛡️ Вход для персонала
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => (window.location.href = "/")}
                    className="w-full h-8 text-xs"
                    disabled={loading}
                  >
                    ← На главную страницу
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Индикатор готовности формы */}
        <Card
          className={`border-2 transition-colors ${
            isFormReady
              ? "bg-green-50 border-green-200"
              : "bg-blue-50 border-blue-200"
          }`}
        >
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium">
                {isFormReady ? "✅ Готов к отправке" : "⏳ Заполните форму"}
              </span>
              <div className="flex items-center space-x-2">
                {isValidating && (
                  <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                )}
                {isFormReady && !isValidating && (
                  <Shield className="h-4 w-4 text-green-600" />
                )}
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex items-center">
                <span
                  className={`w-2 h-2 rounded-full mr-2 ${
                    formData.email && emailValid
                      ? "bg-green-500"
                      : "bg-gray-300"
                  }`}
                />
                <span>Email проверен и валиден</span>
              </div>
              <div className="flex items-center">
                <span
                  className={`w-2 h-2 rounded-full mr-2 ${
                    formData.password ? "bg-green-500" : "bg-gray-300"
                  }`}
                />
                <span>Пароль введен</span>
              </div>
              {!isLogin && (
                <>
                  <div className="flex items-center">
                    <span
                      className={`w-2 h-2 rounded-full mr-2 ${
                        formData.name && formData.name.length >= 2
                          ? "bg-green-500"
                          : "bg-gray-300"
                      }`}
                    />
                    <span>Имя указано</span>
                  </div>
                  <div className="flex items-center">
                    <span
                      className={`w-2 h-2 rounded-full mr-2 ${
                        Object.values(validationStates).every(
                          (state) => state.isValid !== false
                        )
                          ? "bg-green-500"
                          : "bg-red-500"
                      }`}
                    />
                    <span>Все проверки пройдены</span>
                  </div>
                </>
              )}
            </div>

            {/* Прогресс-бар */}
            <div className="mt-3">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all duration-300 ${
                    isFormReady ? "bg-green-500" : "bg-blue-500"
                  }`}
                  style={{
                    width: `${
                      isFormReady
                        ? 100
                        : Math.max(
                            20,
                            ([
                              formData.email,
                              formData.password,
                              ...(isLogin ? [] : [formData.name]),
                            ].filter(Boolean).length /
                              (isLogin ? 2 : 3)) *
                              100
                          )
                    }%`,
                  }}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Информация о безопасности */}
        <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-green-900 flex items-center">
              <Shield className="h-4 w-4 mr-2" />
              {isLogin ? "Безопасный вход" : "Защищенная регистрация"}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-xs text-green-800 space-y-2">
              <div className="grid grid-cols-1 gap-2">
                <div className="flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-2" />
                  <span>Улучшенная проверка email адресов</span>
                </div>
                <div className="flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-2" />
                  <span>Анализ безопасности паролей</span>
                </div>
                <div className="flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-2" />
                  <span>Защищенная передача данных</span>
                </div>
                {!isLogin && (
                  <div className="flex items-center">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-2" />
                    <span>Валидация в реальном времени</span>
                  </div>
                )}
              </div>
              <div className="mt-3 p-2 bg-white/50 rounded-md">
                <p className="text-center font-medium">
                  {isLogin
                    ? "🔐 Ваши данные защищены"
                    : "✨ Создайте надежный аккаунт"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Подсказки для быстрого тестирования (только в режиме разработки) */}
        {process.env.NODE_ENV === "development" && (
          <Card className="bg-yellow-50 border-yellow-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-yellow-900">
                🧪 Быстрое тестирование
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0 space-y-2">
              <Button
                onClick={() => fillTestData(true)}
                variant="outline"
                size="sm"
                className="w-full text-xs"
                                disabled={loading || isValidating}
              >
                🚀 Заполнить корректные данные
              </Button>

              <Button
                onClick={() => {
                  setFormData({
                    email: "user@gmail.com",
                    password: isLogin ? "password123" : "SecurePass123!",
                    name: isLogin ? "" : "Реальный Пользователь",
                    phone: isLogin ? "" : "+7 (999) 123-45-67",
                  });
                  toast({
                    title: "Реальные данные заполнены",
                    description: "Gmail адрес для тестирования",
                  });
                }}
                variant="outline"
                size="sm"
                className="w-full text-xs"
                disabled={loading || isValidating}
              >
                📧 Заполнить реальный email
              </Button>

              <Button
                onClick={() => fillTestData(false)}
                variant="outline"
                size="sm"
                className="w-full text-xs"
                disabled={loading || isValidating}
              >
                ⚠️ Заполнить некорректные данные
              </Button>

              <Button
                onClick={() => {
                  setFormData({
                    email: "",
                    password: "",
                    name: "",
                    phone: "",
                  });
                  setEmailValid(false);
                  setValidationStates({});
                  toast({
                    title: "Форма очищена",
                    description: "Все поля и валидация сброшены",
                  });
                }}
                variant="outline"
                size="sm"
                className="w-full text-xs"
                disabled={loading || isValidating}
              >
                🗑️ Очистить форму
              </Button>

              {/* Кнопка для принудительной валидации */}
              <Button
                onClick={() => {
                  if (formData.email) {
                    const validation = validateEmailFormat(formData.email);
                    setEmailValid(validation.isValid);
                    setValidationStates((prev) => ({
                      ...prev,
                      email: validation,
                    }));
                    toast({
                      title: "Валидация выполнена",
                      description: `Email ${validation.isValid ? "валиден" : "невалиден"}`,
                      variant: validation.isValid ? "default" : "destructive",
                    });
                  } else {
                    toast({
                      title: "Введите email",
                      description: "Сначала введите email адрес",
                      variant: "destructive",
                    });
                  }
                }}
                variant="outline"
                size="sm"
                className="w-full text-xs"
                disabled={loading || isValidating || !formData.email}
              >
                🔍 Принудительная валидация email
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}



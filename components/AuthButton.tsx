import { useRouter } from "next/router";
import { useEffect, useState } from "react";

// Компонент для проверки авторизации
const AuthButton = ({
  onBooking,
  redirectPath,
}: {
  onBooking: () => void;
  redirectPath: string;
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch("/api/auth/check");
        const data = await response.json();
        setIsAuthenticated(data.authenticated && data.user?.role === "member");
      } catch (error) {
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  if (loading) {
    return (
      <button className="w-full bg-gray-300 text-gray-500 py-3 px-4 rounded-lg cursor-not-allowed">
        Загрузка...
      </button>
    );
  }

  if (isAuthenticated) {
    return (
      <button
        onClick={onBooking}
        className="w-full bg-gradient-to-r from-blue-500 to-green-600 text-white py-3 px-4 rounded-lg hover:from-blue-600 hover:to-green-700 transition-all duration-300 transform hover:scale-105 hover:shadow-lg font-medium"
      >
        Записаться
      </button>
    );
  }

  return (
    <button
      onClick={() =>
        router.push(
          `/member-login?redirect=${encodeURIComponent(redirectPath)}`
        )
      }
      className="w-full bg-gradient-to-r from-blue-500 to-green-600 text-white py-3 px-4 rounded-lg hover:from-blue-600 hover:to-green-700 transition-all duration-300 transform hover:scale-105 hover:shadow-lg font-medium"
    >
      Войти для записи
    </button>
  );
};

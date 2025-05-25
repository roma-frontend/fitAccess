"use client";

import { useState, FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

interface User {
  _id: string;
  name: string;
  email?: string;
  role?: string;
  photoUrl: string;
  faceDescriptor: number[];
  createdAt: number;
}

export function AdminLoginForm() {
  const { toast } = useToast();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const users = useQuery(api.users.getAll) || [];

  const validateForm = () => {
    let isValid = true;
    
    if (!email) {
      setEmailError("Email обязателен");
      isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setEmailError("Введите корректный email");
      isValid = false;
    } else {
      setEmailError("");
    }
    
    if (!password) {
      setPasswordError("Пароль обязателен");
      isValid = false;
    } else if (password.length < 6) {
      setPasswordError("Пароль должен содержать минимум 6 символов");
      isValid = false;
    } else {
      setPasswordError("");
    }
    
    return isValid;
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      console.log("Попытка входа с email:", email);
      
      // В реальном приложении здесь должна быть проверка пароля на сервере
      // Для демонстрации мы просто проверяем, есть ли пользователь с таким email и ролью admin
      const adminUser = users.find((user: User) => 
        user.email === email && 
        user.role === "admin"
      );
      
      console.log("Найден пользователь:", adminUser);
      
      if (adminUser) {
        // Выполняем вход через API
        console.log("Отправка запроса на вход:", {
          userId: adminUser._id,
          name: adminUser.name,
          email: adminUser.email,
          role: adminUser.role || 'admin',
        });
        
        const response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId: adminUser._id,
            name: adminUser.name,
            email: adminUser.email,
            role: adminUser.role || 'admin',
          }),
        });
        
        const data = await response.json();
        console.log("Ответ API:", data);
        
        if (response.ok) {
          toast({
            title: "Вход выполнен успешно",
            description: "Добро пожаловать в панель администратора",
          });
          
          // Перенаправляем на панель администратора
          console.log("Перенаправление на /admin");
          router.push('/admin');
        } else {
          toast({
            variant: "destructive",
            title: "Ошибка входа",
            description: "Не удалось выполнить вход в систему",
          });
        }
      } else {
        toast({
          variant: "destructive",
          title: "Ошибка входа",
          description: "Неверный email или пароль, или у вас нет прав администратора",
        });
      }
    } catch (error) {
      console.error("Ошибка входа:", error);
      toast({
        variant: "destructive",
        title: "Ошибка входа",
        description: "Произошла ошибка при попытке входа",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input 
          id="email" 
          type="email" 
          placeholder="admin@example.com" 
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={emailError ? "border-red-500" : ""}
        />
        {emailError && <p className="text-sm text-red-500">{emailError}</p>}
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="password">Пароль</Label>
        <Input 
          id="password" 
          type="password" 
          placeholder="******" 
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={passwordError ? "border-red-500" : ""}
        />
        {passwordError && <p className="text-sm text-red-500">{passwordError}</p>}
      </div>
      
      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? "Вход..." : "Войти как администратор"}
      </Button>
    </form>
  );
}

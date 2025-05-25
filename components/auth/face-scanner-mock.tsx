// components/auth/face-scanner-mock.tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Doc } from "@/convex/_generated/dataModel";

type User = Doc<"users">;

export function FaceScannerMock() {
  const { toast } = useToast();
  const router = useRouter();
  const [selectedUser, setSelectedUser] = useState<string>("");
  
  const users = useQuery(api.users.getAll) || [];

  const handleMockLogin = async () => {
    if (!selectedUser) {
      toast({
        variant: "destructive",
        title: "Выберите пользователя",
        description: "Необходимо выбрать пользователя для входа",
      });
      return;
    }

    const user = users.find((u: User) => u._id === selectedUser);
    if (!user) return;

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user._id,
          name: user.name,
          role: user.role || "user",
        }),
      });

      if (response.ok) {
        toast({
          title: "Вход выполнен успешно",
          description: `Добро пожаловать, ${user.name}!`,
        });
        router.push("/dashboard");
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Ошибка входа",
        description: "Не удалось выполнить вход",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden border-2 border-dashed border-gray-300">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center p-4">
            <div className="text-6xl mb-4">📷</div>
            <h3 className="text-lg font-semibold mb-2">Режим разработки</h3>
            <p className="text-gray-600">Выберите пользователя для входа</p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <select
          value={selectedUser}
          onChange={(e) => setSelectedUser(e.target.value)}
          className="w-full p-2 border rounded-md"
        >
          <option value="">Выберите пользователя</option>
          {users.map((user: User) => (
            <option key={user._id} value={user._id}>
              {user.name}
            </option>
          ))}
        </select>

        <Button
          onClick={handleMockLogin}
          disabled={!selectedUser}
          className="w-full"
        >
          Войти как выбранный пользователь
        </Button>
      </div>
    </div>
  );
}

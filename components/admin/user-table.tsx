"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { formatDistanceToNow } from "date-fns";
import { ru } from "date-fns/locale";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

// Типы для пользователя
interface User {
  _id: string;
  name: string;
  email?: string;
  photoUrl?: string;
  createdAt: number | Date;
  _creationTime?: number;
}

export function UserTable() {
  const users = useQuery(api.users.getAll) as User[] | undefined;
  const [searchTerm, setSearchTerm] = useState("");

  const filteredUsers = users?.filter((user: User) => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (user.email && user.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Функция для безопасного форматирования даты
  const formatUserDate = (date: number | Date | undefined): string => {
    try {
      if (!date) return "—";
      const dateObj = typeof date === 'number' ? new Date(date) : date;
      return formatDistanceToNow(dateObj, { 
        addSuffix: true,
        locale: ru
      });
    } catch (error) {
      console.error("Ошибка форматирования даты:", error);
      return "—";
    }
  };

  // Функция для получения инициалов
  const getInitials = (name: string): string => {
    if (!name) return "??";
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Поиск пользователей..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Фото</TableHead>
              <TableHead>Имя</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Дата регистрации</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers?.length ? (
              filteredUsers.map((user: User) => (
                <TableRow key={user._id}>
                  <TableCell>
                    <Avatar>
                      <AvatarImage src={user.photoUrl} alt={user.name} />
                      <AvatarFallback>
                        {getInitials(user.name)}
                      </AvatarFallback>
                    </Avatar>
                  </TableCell>
                  <TableCell className="font-medium">
                    {user.name || "Без имени"}
                  </TableCell>
                  <TableCell>{user.email || "—"}</TableCell>
                  <TableCell>
                    {formatUserDate(user.createdAt || user._creationTime)}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center">
                  {users === undefined ? "Загрузка..." : 
                   users.length === 0 ? "Нет пользователей" : 
                   "Пользователи не найдены"}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

// app/(dashboard)/admin/logs/page.tsx
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "convex/react";
import { format, formatDistanceToNow } from "date-fns";
import { ru } from "date-fns/locale";
import { CheckCircle, XCircle, Search } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import type { Id } from "@/convex/_generated/dataModel";

interface User {
  _id: Id<"users">;
  name: string;
  email?: string;
  role?: string;
  photoUrl?: string;
  faceDescriptor?: number[];
  createdAt: number;
}

interface AccessLog {
  _id: Id<"accessLogs">;
  userId?: Id<"users">;
  success: boolean;
  timestamp: number;
  deviceInfo?: string;
  ipAddress?: string;
  photoUrl?: string;
}

export default function AdminLogsPage() {
  // Используем строковые пути вместо api объектов
  const logs = (useQuery("accessLogs:getAll" as any) as AccessLog[] | undefined) || [];
  const users = (useQuery("users:getAll" as any) as User[] | undefined) || [];
  const [searchQuery, setSearchQuery] = useState("");
  
  const getUserName = (userId: Id<"users">) => {
    const user = users.find((u: User) => u._id === userId);
    return user ? user.name : "Неизвестный пользователь";
  };
  
  // Фильтрация логов по поисковому запросу
  const filteredLogs = logs.filter((log: AccessLog) => {
    if (!searchQuery) return true;
    
    const userName = log.userId ? getUserName(log.userId) : "Неизвестный пользователь";
    const deviceInfo = log.deviceInfo || "";
    const searchLower = searchQuery.toLowerCase();
    
    return userName.toLowerCase().includes(searchLower) || 
           deviceInfo.toLowerCase().includes(searchLower);
  });
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Журнал доступа</h1>
        <p className="text-muted-foreground mt-2">
          Всего записей: {logs.length} | Отфильтровано: {filteredLogs.length}
        </p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>История доступа</CardTitle>
          <CardDescription>
            Полная история попыток доступа к системе
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Поиск по имени пользователя или устройству..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          
          {logs.length === 0 ? (
            <div className="text-center py-10">
              <div className="text-6xl mb-4">📝</div>
              <p className="text-muted-foreground text-lg">Журнал доступа пуст</p>
              <p className="text-sm text-muted-foreground mt-2">
                Здесь будут отображаться все попытки входа в систему
              </p>
            </div>
          ) : filteredLogs.length === 0 ? (
            <div className="text-center py-10">
              <div className="text-6xl mb-4">🔍</div>
              <p className="text-muted-foreground text-lg">Записи не найдены</p>
              <p className="text-sm text-muted-foreground mt-2">
                Попробуйте изменить поисковый запрос
              </p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Статус</TableHead>
                    <TableHead>Пользователь</TableHead>
                    <TableHead>Дата и время</TableHead>
                    <TableHead>Устройство</TableHead>
                    <TableHead>IP адрес</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLogs.map((log: AccessLog) => (
                    <TableRow key={log._id}>
                      <TableCell>
                        {log.success ? (
                          <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
                            <CheckCircle className="h-4 w-4 mr-1" /> Доступ разрешен
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200">
                            <XCircle className="h-4 w-4 mr-1" /> Доступ запрещен
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {log.userId ? getUserName(log.userId) : "—"}
                      </TableCell>
                      <TableCell>
                        <div>
                          {format(new Date(log.timestamp), "dd.MM.yyyy HH:mm:ss")}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(log.timestamp), { 
                            addSuffix: true,
                            locale: ru
                          })}
                        </div>
                      </TableCell>
                      <TableCell className="max-w-xs">
                        <div className="truncate" title={log.deviceInfo}>
                          {log.deviceInfo || "—"}
                        </div>
                      </TableCell>
                      <TableCell>
                        {log.ipAddress || "—"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Статистика */}
      {logs.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Всего записей</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{logs.length}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Успешных входов</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {logs.filter((log: AccessLog) => log.success).length}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Неудачных попыток</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {logs.filter((log: AccessLog) => !log.success).length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Уникальных пользователей</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {new Set(logs.filter((log: AccessLog) => log.userId).map((log: AccessLog) => log.userId)).size}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

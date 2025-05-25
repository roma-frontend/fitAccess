"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { formatDistanceToNow, format } from "date-fns";
import { ru } from "date-fns/locale";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle } from "lucide-react";
import { Id } from "@/convex/_generated/dataModel";

// Типы для данных
interface LogEntry {
  _id: Id<"logs">;
  _creationTime: number;
  success: boolean;
  userId?: Id<"users">;
  timestamp: number;
  deviceInfo?: string;
}

interface User {
  _id: Id<"users">;
  name: string;
  email: string;
  role?: string;
}

export function LogTable() {
  const logs = useQuery(api.logs.getAll) as LogEntry[] | undefined;
  const users = useQuery(api.users.getAll) as User[] | undefined;

  const getUserName = (userId: Id<"users">): string => {
    const user = users?.find((u: User) => u._id === userId);
    return user ? user.name : "Неизвестный пользователь";
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Статус</TableHead>
            <TableHead>Пользователь</TableHead>
            <TableHead>Дата и время</TableHead>
            <TableHead>Устройство</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {logs?.length ? (
            logs.map((log: LogEntry) => (
              <TableRow key={log._id.toString()}>
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
                  {format(new Date(log.timestamp), "dd.MM.yyyy HH:mm:ss")}
                  <div className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(log.timestamp), { 
                      addSuffix: true,
                      locale: ru
                    })}
                  </div>
                </TableCell>
                <TableCell className="max-w-xs truncate">
                  {log.deviceInfo || "—"}
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={4} className="h-24 text-center">
                {logs === undefined ? "Загрузка..." : "Журнал пуст"}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}

"use client";

import { useState } from "react";
import { useQuery } from "convex/react"; // Убрали useMutation
import { api } from "@/convex/_generated/api";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { MoreHorizontal, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

// Типы для пользователя
interface User {
  _id: string;
  name: string;
  email?: string;
  role?: "admin" | "user" | "member";
  photoUrl?: string;
  createdAt: number | Date;
  _creationTime?: number;
}

export function UserList() {
  const { toast } = useToast();
  const users = (useQuery(api.users.getAll) as User[] | undefined) || [];
  // Временно убрали вызов deleteUser
  // const deleteUser = useMutation(api.users.deleteUser);
  
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  
  const handleDelete = async (): Promise<void> => {
    if (!selectedUserId) return;
    
    try {
      // Временно заменили вызов функции на уведомление
      // await deleteUser({ id: selectedUserId });
      toast({
        title: "Функция не реализована",
        description: "Удаление пользователей временно недоступно",
      });
    } catch (error) {
      console.error("Ошибка удаления пользователя:", error);
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: "Не удалось удалить пользователя",
      });
    } finally {
      setShowDeleteDialog(false);
      setSelectedUserId(null);
    }
  };
  
  const confirmDelete = (userId: string): void => {
    setSelectedUserId(userId);
    setShowDeleteDialog(true);
  };

  // Функция для безопасного форматирования даты
  const formatDate = (date: number | Date): string => {
    try {
      const dateObj = typeof date === 'number' ? new Date(date) : date;
      return format(dateObj, "dd.MM.yyyy", { locale: ru });
    } catch (error) {
      console.error("Ошибка форматирования даты:", error);
      return "—";
    }
  };

  // Функция для получения роли пользователя
  const getUserRole = (role?: string): { label: string; variant: "default" | "outline" } => {
    switch (role) {
      case "admin":
        return { label: "Администратор", variant: "default" };
      case "member":
        return { label: "Участник", variant: "outline" };
      default:
        return { label: "Пользователь", variant: "outline" };
    }
  };

  return (
    <div>
      {users.length === 0 ? (
        <div className="text-center py-10 text-muted-foreground">
          <p>Нет зарегистрированных пользователей</p>
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Пользователь</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Роль</TableHead>
                <TableHead>Дата регистрации</TableHead>
                <TableHead className="w-[80px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user: User) => {
                const roleInfo = getUserRole(user.role);
                
                return (
                  <TableRow key={user._id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center space-x-3">
                        <Avatar>
                          <AvatarImage src={user.photoUrl} alt={user.name} />
                          <AvatarFallback>
                            {user.name?.charAt(0)?.toUpperCase() || "?"}
                          </AvatarFallback>
                        </Avatar>
                        <span>{user.name || "Без имени"}</span>
                      </div>
                    </TableCell>
                    <TableCell>{user.email || "—"}</TableCell>
                    <TableCell>
                      <Badge variant={roleInfo.variant}>
                        {roleInfo.label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {formatDate(user.createdAt || user._creationTime || Date.now())}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Меню</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem 
                            onClick={() => confirmDelete(user._id)}
                            className="text-destructive focus:text-destructive"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            <span>Удалить</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
      
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Вы уверены?</AlertDialogTitle>
            <AlertDialogDescription>
              Это действие нельзя отменить. Пользователь будет удален из системы вместе со всеми связанными данными.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Отмена</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete} 
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Удалить
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// components/trainer/header/NotificationDropdown.tsx
"use client";

import { useState } from "react";
import { Bell, Users, Calendar, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";

interface NotificationDropdownProps {
  unreadMessages: number;
  todayWorkouts: number;
  totalMembers: number;
  activeMembers: number;
}

export default function NotificationDropdown({
  unreadMessages,
  todayWorkouts,
  totalMembers,
  activeMembers
}: NotificationDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  
  const totalNotifications = unreadMessages + (todayWorkouts === 0 ? 1 : 0);
  
  const notifications = [
    {
      icon: MessageSquare,
      title: "Непрочитанные сообщения",
      description: `У вас ${unreadMessages} непрочитанных сообщений`,
      count: unreadMessages,
      color: "text-blue-600",
      show: unreadMessages > 0
    },
    {
      icon: Calendar,
      title: "Тренировки сегодня",
      description: todayWorkouts > 0 
        ? `Запланировано ${todayWorkouts} тренировок на сегодня`
        : "На сегодня тренировки не запланированы",
      count: todayWorkouts,
      color: "text-green-600",
      show: true
    },
    {
      icon: Users,
      title: "Статистика участников",
      description: `${activeMembers} из ${totalMembers} участников активны`,
      count: activeMembers,
      color: "text-purple-600",
      show: true
    }
  ];

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="relative">
          <Bell className="h-5 w-5" />
          {totalNotifications > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs"
            >
              {totalNotifications}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel>Уведомления</DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {notifications
          .filter(notification => notification.show)
          .map((notification, index) => (
            <DropdownMenuItem key={index} className="flex items-start gap-3 p-3">
              <notification.icon className={`h-5 w-5 mt-0.5 ${notification.color}`} />
              <div className="flex-1 space-y-1">
                <p className="text-sm font-medium">{notification.title}</p>
                <p className="text-xs text-gray-500">{notification.description}</p>
              </div>
              {notification.count > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {notification.count}
                </Badge>
              )}
            </DropdownMenuItem>
          ))}
        
        {totalNotifications === 0 && (
          <DropdownMenuItem disabled>
            <div className="text-center py-4 text-gray-500">
              Нет новых уведомлений
            </div>
          </DropdownMenuItem>
        )}
        
        <DropdownMenuSeparator />
        <DropdownMenuItem className="text-center">
          <Button variant="ghost" size="sm" className="w-full">
            Посмотреть все
          </Button>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

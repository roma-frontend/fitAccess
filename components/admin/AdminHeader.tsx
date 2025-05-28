"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { LogOut, Bell } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useEffect, useState } from "react";

interface User {
  id: string;
  name: string;
  email?: string;
  role: string;
}

export function AdminHeader() {
  const router = useRouter();
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch('/api/auth/check');
        const data = await response.json();
        
        if (data.authenticated) {
          setUser(data.user);
        }
      } catch (error) {
        console.error("Ошибка получения данных пользователя:", error);
      }
    };
    
    fetchUser();
  }, []);
  
  const handleLogout = async () => {
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
      });
      
      if (response.ok) {
        router.push('/');
      } else {
        toast({
          variant: "destructive",
          title: "Ошибка",
          description: "Не удалось выйти из системы",
        });
      }
    } catch (error) {
      console.error("Ошибка выхода:", error);
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: "Произошла ошибка при попытке выхода",
      });
    }
  };
  
  return (
    <header className="bg-white border-b">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <h1 className="text-xl font-bold">Панель администратора</h1>
        </div>
        
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="icon">
            <Bell className="h-5 w-5" />
          </Button>
          
          <div className="text-sm text-right mr-4">
            <p className="font-medium">{user?.name}</p>
            <p className="text-muted-foreground">{user?.email}</p>
          </div>
          
          <Button variant="outline" size="sm" onClick={handleLogout} className="gap-2">
            <LogOut className="h-4 w-4" />
            Выйти
          </Button>
        </div>
      </div>
    </header>
  );
}

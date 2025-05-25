"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";

export function Header() {
  const pathname = usePathname();
  
  return (
    <header className="border-b">
      <div className="container mx-auto flex h-16 items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/" className="font-semibold text-lg">
            Система контроля доступа
          </Link>
          
          <nav className="hidden md:flex gap-6">
            <Link 
              href="/admin" 
              className={`text-sm font-medium transition-colors ${
                pathname === "/admin" 
                  ? "text-primary" 
                  : "text-muted-foreground hover:text-primary"
              }`}
            >
              Пользователи
            </Link>
            <Link 
              href="/admin/logs" 
              className={`text-sm font-medium transition-colors ${
                pathname === "/admin/logs" 
                  ? "text-primary" 
                  : "text-muted-foreground hover:text-primary"
              }`}
            >
              Журнал доступа
            </Link>
          </nav>
        </div>
        
        <div className="flex items-center gap-4">
          <Link href="/login">
            <Button variant="outline">Вход в систему</Button>
          </Link>
        </div>
      </div>
    </header>
  );
}

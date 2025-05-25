"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Home, FileText, Settings, Users, PlusCircle } from "lucide-react";

interface SidebarItem {
  title: string;
  href: string;
  icon: React.ReactNode;
}

export function AdminSidebar() {
  const pathname = usePathname();
  
  const items: SidebarItem[] = [
    {
      title: "Главная",
      href: "/admin",
      icon: <Home className="h-5 w-5" />,
    },
    {
      title: "Пользователи",
      href: "/admin/users",
      icon: <Users className="h-5 w-5" />,
    },
    {
      title: "Добавить пользователя",
      href: "/admin/users/add",
      icon: <PlusCircle className="h-5 w-5" />,
    },
    {
      title: "Журнал доступа",
      href: "/admin/logs",
      icon: <FileText className="h-5 w-5" />,
    },
    {
      title: "Настройки",
      href: "/admin/settings",
      icon: <Settings className="h-5 w-5" />,
    },
  ];
  
  return (
    <aside className="w-64 bg-white border-r min-h-[calc(100vh-64px)]">
      <nav className="p-4">
        <ul className="space-y-2">
          {items.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:bg-gray-100",
                  pathname === item.href ? "bg-gray-100 font-medium" : "text-muted-foreground"
                )}
              >
                {item.icon}
                {item.title}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}

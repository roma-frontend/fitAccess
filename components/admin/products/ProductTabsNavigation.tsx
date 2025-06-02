// components/admin/products/ProductTabsNavigation.tsx
import React, { memo } from 'react';
import { TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Package, Archive, BarChart3, Zap } from "lucide-react";

interface ProductTabsNavigationProps {
  filteredCount: number;
}

export const ProductTabsNavigation = memo(function ProductTabsNavigation({
  filteredCount
}: ProductTabsNavigationProps) {
  const tabs = [
    {
      value: "products",
      icon: Package,
      label: `Активные (${filteredCount})`
    },
    {
      value: "deleted",
      icon: Archive,
      label: "Удаленные"
    },
    {
      value: "analytics",
      icon: BarChart3,
      label: "Аналитика"
    },
    {
      value: "actions",
      icon: Zap,
      label: "Действия"
    }
  ];

  return (
    <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:grid-cols-4">
      {tabs.map((tab) => (
        <TabsTrigger key={tab.value} value={tab.value} className="flex items-center gap-2">
          <tab.icon className="h-4 w-4" />
          {tab.label}
        </TabsTrigger>
      ))}
    </TabsList>
  );
});

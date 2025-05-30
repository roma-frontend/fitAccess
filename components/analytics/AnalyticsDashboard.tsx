// components/analytics/AnalyticsDashboard.tsx (пример использования)
"use client";

import { ExportDialog } from "./ExportDialog";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

export function AnalyticsDashboard() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Аналитика</h1>
        
        <ExportDialog>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Экспорт данных
          </Button>
        </ExportDialog>
      </div>
      
      {/* Остальной контент дашборда */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Карточки метрик */}
      </div>
    </div>
  );
}

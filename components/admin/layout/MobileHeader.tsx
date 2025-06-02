"use client";

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Menu, BarChart3 } from "lucide-react";
import { PersonalizedNotifications } from '@/components/admin/PersonalizedNotifications';
import { PersonalizedStats } from '@/components/admin/PersonalizedStats';

interface MobileHeaderProps {
  roleTexts: any;
  onMenuOpen: () => void;
}

export function MobileHeader({ roleTexts, onMenuOpen }: MobileHeaderProps) {
  const [showMobileStats, setShowMobileStats] = useState(false);

  return (
    <div className="lg:hidden bg-white shadow-sm border-b px-4 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={onMenuOpen}>
            <Menu className="h-5 w-5" />
          </Button>
          <h1 className="font-semibold text-gray-900">
            {roleTexts.dashboardTitle || 'Панель управления'}
          </h1>
        </div>
        
        <div className="flex items-center gap-2">
          <PersonalizedNotifications />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowMobileStats(!showMobileStats)}
          >
            <BarChart3 className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {showMobileStats && (
        <div className="mt-4 border-t pt-4">
          <PersonalizedStats />
        </div>
      )}
    </div>
  );
}

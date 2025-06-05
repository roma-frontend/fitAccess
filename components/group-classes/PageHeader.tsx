// components/group-classes/PageHeader.tsx
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

interface PageHeaderProps {
  onBack: () => void;
}

export const PageHeader = ({ onBack }: PageHeaderProps) => {
  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" onClick={onBack}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Назад
            </Button>
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                Групповые занятия
              </h1>
              <p className="text-sm text-gray-500">
                Выберите дату и запишитесь на занятие
              </p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

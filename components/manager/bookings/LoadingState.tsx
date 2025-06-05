// components/manager/bookings/LoadingState.tsx
import { memo } from "react";
import ManagerHeader from "@/components/manager/ManagerHeader";
import { Loader2 } from "lucide-react";

const LoadingState = memo(() => {
  return (
    <div className="min-h-screen bg-gray-50">
      <ManagerHeader />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-blue-600" />
            <p className="text-gray-600">Загрузка записей...</p>
          </div>
        </div>
      </div>
    </div>
  );
});

LoadingState.displayName = "LoadingState";

export default LoadingState;

// components/manager/trainers/TrainerSearch.tsx (улучшенный поиск с дебаунсом)
"use client";

import { Input } from "@/components/ui/input";
import { Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDebounce } from "@/hooks/useDebounce";
import { useEffect } from "react";

interface TrainerSearchProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  debounceMs?: number;
}

export default function TrainerSearch({
  value,
  onChange,
  placeholder = "Поиск по имени или email...",
  debounceMs = 300,
}: TrainerSearchProps) {
  const debouncedValue = useDebounce(value, debounceMs);

  useEffect(() => {
    // Здесь можно добавить логику для API поиска
    if (debouncedValue !== value) {
      // Поиск выполняется только после дебаунса
    }
  }, [debouncedValue, value]);

  const handleClear = () => {
    onChange("");
  };

  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
      <Input
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="pl-10 pr-10"
      />
      {value && (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleClear}
          className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
        >
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}

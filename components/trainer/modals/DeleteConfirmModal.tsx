// components/trainer/modals/DeleteConfirmModal.tsx
"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

interface DeleteConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onClose: () => void;
}

export default function DeleteConfirmModal({ 
  isOpen, 
  title, 
  message, 
  onConfirm, 
  onClose 
}: DeleteConfirmModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            {title}
          </DialogTitle>
        </DialogHeader>

        <div className="py-4">
          <p className="text-gray-600">{message}</p>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Отмена
          </Button>
          <Button variant="destructive" onClick={onConfirm} className="flex-1">
            Удалить
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// components/messages/DraftsManager.tsx
import React, { memo, useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  FileText, 
  Search, 
  MoreHorizontal, 
  Edit3, 
  Trash2, 
  Send,
  Clock,
  Users
} from "lucide-react";

interface Draft {
  _id: string;
  type: "direct" | "group" | "announcement";
  subject: string;
  content: string;
  recipientIds: string[];
  groupId?: string;
  priority: "low" | "normal" | "high" | "urgent";
  createdAt: string;
  updatedAt: string;
  scheduledAt?: string;
}

interface DraftsManagerProps {
  isOpen: boolean;
  onClose: () => void;
  onEditDraft: (draft: Draft) => void;
  onDeleteDraft: (draftId: string) => void;
  onSendDraft: (draft: Draft) => void;
}

export const DraftsManager = memo(({
  isOpen,
  onClose,
  onEditDraft,
  onDeleteDraft,
  onSendDraft
}: DraftsManagerProps) => {
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      loadDrafts();
    }
  }, [isOpen]);

  const loadDrafts = async () => {
    setLoading(true);
    try {
      // В реальном приложении загружать из Convex
      // const data = await api.drafts.list();
      
      // Мок данные
      const mockDrafts: Draft[] = [
        {
          _id: "1",
          type: "direct",
          subject: "Вопрос по расписанию",
          content: "Здравствуйте! Хотел уточнить по поводу изменений в расписании...",
          recipientIds: ["trainer1"],
          priority: "normal",
          createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
        },
        {
          _id: "2",
          type: "announcement",
          subject: "Важное объявление",
          content: "Уважаемые участники! Сообщаем вам о предстоящих изменениях...",
          recipientIds: [],
          priority: "high",
          createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date(Date.now() - 23 * 60 * 60 * 1000).toISOString(),
          scheduledAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        },
      ];
      
      setDrafts(mockDrafts);
    } catch (error) {
      console.error("Ошибка загрузки черновиков:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredDrafts = drafts.filter(draft =>
    draft.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
    draft.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getTypeLabel = (type: Draft["type"]) => {
    const labels = {
      direct: "Личное",
      group: "Группа",
      announcement: "Объявление"
    };
    return labels[type];
  };

  const getPriorityColor = (priority: Draft["priority"]) => {
    const colors = {
      low: "bg-gray-100 text-gray-800",
      normal: "bg-blue-100 text-blue-800",
      high: "bg-orange-100 text-orange-800",
      urgent: "bg-red-100 text-red-800",
    };
    return colors[priority];
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-full max-w-4xl mx-4 max-h-[90vh] overflow-hidden">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Черновики ({filteredDrafts.length})
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              ×
            </Button>
          </div>
          
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Поиск черновиков..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardHeader>

        <CardContent className="max-h-[60vh] overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : filteredDrafts.length > 0 ? (
            <div className="space-y-3">
              {filteredDrafts.map((draft) => (
                <div
                  key={draft._id}
                  className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-medium">
                          {draft.subject || "Без темы"}
                        </h3>
                        <Badge variant="outline">
                          {getTypeLabel(draft.type)}
                        </Badge>
                        <Badge className={getPriorityColor(draft.priority)}>
                          {draft.priority}
                        </Badge>
                        {draft.scheduledAt && (
                          <Badge variant="outline" className="text-xs">
                            <Clock className="h-3 w-3 mr-1" />
                            Запланировано
                          </Badge>
                        )}
                      </div>
                      
                      <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                        {draft.content}
                      </p>
                      
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span>
                          Создан: {new Date(draft.createdAt).toLocaleString("ru")}
                        </span>
                        <span>
                          Изменен: {new Date(draft.updatedAt).toLocaleString("ru")}
                        </span>
                        {draft.recipientIds.length > 0 && (
                          <span className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {draft.recipientIds.length} получателей
                          </span>
                        )}
                      </div>
                    </div>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onEditDraft(draft)}>
                          <Edit3 className="h-4 w-4 mr-2" />
                          Редактировать
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onSendDraft(draft)}>
                          <Send className="h-4 w-4 mr-2" />
                          Отправить
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => onDeleteDraft(draft._id)}
                          className="text-red-600"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Удалить
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  {draft.scheduledAt && (
                    <div className="p-2 bg-blue-50 rounded border border-blue-200">
                      <div className="text-sm text-blue-800">
                        <Clock className="h-4 w-4 inline mr-1" />
                        Запланировано на: {new Date(draft.scheduledAt).toLocaleString("ru")}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <FileText className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p>Черновики не найдены</p>
              {searchTerm && (
                <p className="text-sm mt-2">
                  Попробуйте изменить поисковый запрос
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
});

DraftsManager.displayName = "DraftsManager";

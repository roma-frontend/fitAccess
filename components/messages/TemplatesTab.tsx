// components/messages/TemplatesTab.tsx
import React, { memo } from "react";
import { NotificationTemplate } from "@/types/messages";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bell, Plus } from "lucide-react";

interface TemplatesTabProps {
  templates: NotificationTemplate[];
  onCreateTemplate: () => void;
  onEditTemplate: (templateId: string) => void;
  onTestTemplate: (templateId: string) => void;
  onToggleTemplate: (templateId: string) => void;
}

export const TemplatesTab = memo(({
  templates,
  onCreateTemplate,
  onEditTemplate,
  onTestTemplate,
  onToggleTemplate
}: TemplatesTabProps) => {
  return (
    <div className="space-y-4">
      {templates.map((template) => (
        <TemplateCard
          key={template._id}
          template={template}
          onEdit={() => onEditTemplate(template._id)}
          onTest={() => onTestTemplate(template._id)}
          onToggle={() => onToggleTemplate(template._id)}
        />
      ))}

      <Card className="border-dashed">
        <CardContent className="flex items-center justify-center h-32">
          <Button variant="outline" onClick={onCreateTemplate} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Создать шаблон
          </Button>
        </CardContent>
      </Card>
    </div>
  );
});

const TemplateCard = memo(({
  template,
  onEdit,
  onTest,
  onToggle
}: {
  template: NotificationTemplate;
  onEdit: () => void;
  onTest: () => void;
  onToggle: () => void;
}) => {
  const getTriggerText = (trigger: NotificationTemplate["trigger"]) => {
    const triggers = {
      event_reminder: "Напоминание о событии",
      payment_due: "Напоминание об оплате",
      membership_expiry: "Истечение абонемента",
      new_member: "Новый участник",
      manual: "Ручная отправка"
    };
    return triggers[trigger];
  };

  const getTypeIcon = (type: NotificationTemplate["type"]) => {
    const icons = {
      email: "📧 Email",
      sms: "📱 SMS",
      push: "🔔 Push",
      "in-app": "💬 В приложении"
    };
    return icons[type];
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            {template.name}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant={template.isActive ? "default" : "secondary"}>
              {template.isActive ? "Активен" : "Неактивен"}
            </Badge>
            <Badge variant="outline">
              {getTypeIcon(template.type)}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="text-sm font-medium mb-2">Тема:</h4>
            <p className="text-sm text-gray-600 p-2 bg-gray-50 rounded">
              {template.subject}
            </p>
          </div>
          <div>
            <h4 className="text-sm font-medium mb-2">Триггер:</h4>
            <p className="text-sm text-gray-600">
              {getTriggerText(template.trigger)}
            </p>
          </div>
        </div>

        <div className="mt-4">
          <h4 className="text-sm font-medium mb-2">Содержимое:</h4>
          <div className="p-3 bg-gray-50 rounded text-sm">
            {template.content}
          </div>
        </div>

        {template.variables.length > 0 && (
          <div className="mt-4">
            <h4 className="text-sm font-medium mb-2">Переменные:</h4>
            <div className="flex flex-wrap gap-2">
              {template.variables.map((variable) => (
                <Badge key={variable} variant="outline" className="text-xs">
                  {`{{${variable}}}`}
                </Badge>
              ))}
            </div>
          </div>
        )}

        <div className="flex items-center gap-2 mt-4">
          <Button size="sm" variant="outline" onClick={onEdit}>
            Редактировать
          </Button>
          <Button size="sm" variant="outline" onClick={onTest}>
            Тестировать
          </Button>
          <Button
            size="sm"
            variant={template.isActive ? "destructive" : "default"}
            onClick={onToggle}
          >
            {template.isActive ? "Деактивировать" : "Активировать"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
});

TemplatesTab.displayName = "TemplatesTab";

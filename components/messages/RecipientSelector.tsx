// components/messages/RecipientSelector.tsx
import React, { memo, useState, useMemo } from "react";
import { Message, MessageGroup } from "@/types/messages";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Check, ChevronsUpDown, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
}

interface RecipientSelectorProps {
  messageType: Message["type"];
  groupId: string;
  groups: MessageGroup[];
  selectedRecipients: string[];
  onGroupChange: (groupId: string) => void;
  onRecipientsChange: (recipientIds: string[]) => void;
}

export const RecipientSelector = memo(({
  messageType,
  groupId,
  groups,
  selectedRecipients,
  onGroupChange,
  onRecipientsChange
}: RecipientSelectorProps) => {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Мок данные пользователей (в реальном приложении загружать из API)
  const users: User[] = [
    { _id: "1", name: "Иван Петров", email: "ivan@example.com", role: "trainer" },
    { _id: "2", name: "Мария Иванова", email: "maria@example.com", role: "trainer" },
    { _id: "3", name: "Анна Смирнова", email: "anna@example.com", role: "member" },
    { _id: "4", name: "Петр Козлов", email: "petr@example.com", role: "member" },
    { _id: "5", name: "Елена Васильева", email: "elena@example.com", role: "member" },
  ];

  const filteredUsers = useMemo(() => {
    return users.filter(user => 
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [users, searchTerm]);

  const selectedUsers = users.filter(user => selectedRecipients.includes(user._id));

  const handleSelectUser = (userId: string) => {
    if (selectedRecipients.includes(userId)) {
      onRecipientsChange(selectedRecipients.filter(id => id !== userId));
    } else {
      onRecipientsChange([...selectedRecipients, userId]);
    }
  };

  const removeRecipient = (userId: string) => {
    onRecipientsChange(selectedRecipients.filter(id => id !== userId));
  };

  if (messageType === "group") {
    return (
      <div>
        <label className="text-sm font-medium">Группа</label>
        <Select value={groupId} onValueChange={onGroupChange}>
          <SelectTrigger className="mt-1">
            <SelectValue placeholder="Выберите группу" />
          </SelectTrigger>
          <SelectContent>
            {groups.map((group) => (
              <SelectItem key={group._id} value={group._id}>
                {group.name} ({group.memberIds.length} участников)
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    );
  }

  if (messageType === "announcement") {
    return (
      <div>
        <label className="text-sm font-medium">Получатели</label>
        <div className="mt-1 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-center gap-2 text-blue-800">
            <span className="text-sm font-medium">
              Объявление будет отправлено всем пользователям
            </span>
            <Badge variant="outline" className="text-blue-600">
              Все пользователи
            </Badge>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <label className="text-sm font-medium">Получатели</label>
      
      {/* Выбранные получатели */}
      {selectedUsers.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-2">
          {selectedUsers.map((user) => (
            <Badge
              key={user._id}
              variant="secondary"
              className="flex items-center gap-1"
            >
              {user.name}
              <Button
                variant="ghost"
                size="sm"
                className="h-4 w-4 p-0 hover:bg-transparent"
                onClick={() => removeRecipient(user._id)}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          ))}
        </div>
      )}

      {/* Поиск и выбор получателей */}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between mt-2"
          >
            {selectedUsers.length > 0
              ? `Выбрано: ${selectedUsers.length}`
              : "Выберите получателей..."}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0">
          <Command>
            <CommandInput 
              placeholder="Поиск пользователей..." 
              value={searchTerm}
              onValueChange={setSearchTerm}
            />
            <CommandEmpty>Пользователи не найдены.</CommandEmpty>
            <CommandGroup className="max-h-64 overflow-y-auto">
              {filteredUsers.map((user) => (
                <CommandItem
                  key={user._id}
                  value={user._id}
                  onSelect={() => handleSelectUser(user._id)}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      selectedRecipients.includes(user._id) ? "opacity-100" : "opacity-0"
                    )}
                  />
                  <div className="flex flex-col">
                    <span className="font-medium">{user.name}</span>
                    <span className="text-xs text-gray-500">{user.email}</span>
                  </div>
                  <Badge variant="outline" className="ml-auto text-xs">
                    {user.role === "trainer" && "Тренер"}
                    {user.role === "member" && "Участник"}
                    {user.role === "admin" && "Админ"}
                  </Badge>
                </CommandItem>
              ))}
            </CommandGroup>
          </Command>
        </PopoverContent>
      </Popover>

      <p className="text-xs text-gray-500 mt-1">
        Выберите одного или нескольких получателей
      </p>
    </div>
  );
});

RecipientSelector.displayName = "RecipientSelector";

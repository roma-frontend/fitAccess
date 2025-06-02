// types/messages.ts (обновленная версия)
import { Id } from "@/convex/_generated/dataModel";

export interface Message {
  _id: Id<"messages">;
  _creationTime: number;
  type: "direct" | "group" | "announcement" | "notification";
  subject?: string;
  content: string;
  senderId: Id<"users">;
  senderName: string;
  recipientIds: Id<"users">[];
  recipientNames: string[];
  groupId?: Id<"messageGroups">;
  priority: "low" | "normal" | "high" | "urgent";
  status: "draft" | "sent" | "delivered" | "read";
  readAt?: Record<string, string>;
  isArchived: boolean;
  scheduledAt?: number;
  attachments?: {
    name: string;
    url: string;
    size: number;
    type: string;
  }[];
  metadata?: {
    templateId?: Id<"notificationTemplates">;
    campaignId?: string;
    tags?: string[];
  };
  
  // Вычисляемые поля для UI (добавляются в компонентах)
  isRead?: boolean;
  createdAt?: string;
}

export interface MessageGroup {
  _id: Id<"messageGroups">;
  _creationTime: number;
  name: string;
  description?: string;
  memberIds: Id<"users">[];
  memberNames: string[];
  createdBy: Id<"users">;
  isActive: boolean;
  groupType: "manual" | "auto" | "role-based";
  rules?: {
    roles?: string[];
    departments?: string[];
    conditions?: string[];
  };
}

export interface NotificationTemplate {
  _id: Id<"notificationTemplates">;
  _creationTime: number;
  name: string;
  description?: string;
  type: "email" | "sms" | "push" | "in-app";
  subject: string;
  content: string;
  variables: string[];
  isActive: boolean;
  createdBy: Id<"users">;
  category?: string;
  priority: "low" | "normal" | "high" | "urgent";
  settings?: {
    allowScheduling?: boolean;
    requireApproval?: boolean;
    maxRecipients?: number;
  };
}

export interface Draft {
  _id: Id<"drafts">;
  _creationTime: number;
  type: "direct" | "group" | "announcement";
  subject?: string;
  content: string;
  recipientIds: Id<"users">[];
  groupId?: Id<"messageGroups">;
  priority: "low" | "normal" | "high" | "urgent";
  createdBy: Id<"users">;
  scheduledAt?: number;
  templateId?: Id<"notificationTemplates">;
}

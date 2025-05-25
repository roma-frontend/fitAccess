// convex/notifications.ts (новый файл)
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const getByRecipient = query({
  args: { 
    recipientId: v.string(),
    recipientType: v.string()
  },
  handler: async (ctx, args) => {
    return await ctx.db.query("notifications")
      .filter((q) => q.and(
        q.eq(q.field("recipientId"), args.recipientId),
        q.eq(q.field("recipientType"), args.recipientType)
      ))
      .order("desc")
      .collect();
  },
});

export const create = mutation({
  args: {
    recipientId: v.string(),
    recipientType: v.string(),
    title: v.string(),
    message: v.string(),
    type: v.string(),
    isImportant: v.optional(v.boolean()),
    relatedId: v.optional(v.string()),
    actionUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("notifications", {
      ...args,
      isRead: false,
      createdAt: Date.now(),
    });
  },
});

export const markAsRead = mutation({
  args: { notificationId: v.id("notifications") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.notificationId, {
      isRead: true,
      readAt: Date.now(),
    });
    return args.notificationId;
  },
});

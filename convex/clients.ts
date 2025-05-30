// convex/clients.ts
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Получить всех клиентов
export const getAll = query({
  handler: async (ctx) => {
    console.log('🔍 Convex clients: получаем всех клиентов...');
    
    try {
      const clients = await ctx.db.query("clients").collect();
      console.log(`✅ Convex clients: найдено ${clients.length} клиентов`);
      return clients;
    } catch (error) {
      console.error('❌ Convex clients: ошибка получения клиентов:', error);
      return [];
    }
  },
});

// Получить клиентов по тренеру
export const getByTrainer = query({
  args: { trainerId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("clients")
      .withIndex("by_trainer", (q) => q.eq("trainerId", args.trainerId))
      .collect();
  },
});

// Получить клиентов по статусу
export const getByStatus = query({
  args: { status: v.union(v.literal("active"), v.literal("trial"), v.literal("inactive")) },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("clients")
      .withIndex("by_status", (q) => q.eq("status", args.status))
      .collect();
  },
});

// Получить статистику клиентов
export const getStats = query({
  handler: async (ctx) => {
    const clients = await ctx.db.query("clients").collect();
    
    const total = clients.length;
    const active = clients.filter(c => c.status === "active").length;
    const trial = clients.filter(c => c.status === "trial").length;
    const inactive = clients.filter(c => c.status === "inactive").length;
    
    // Новые клиенты за месяц
    const thisMonth = new Date();
    thisMonth.setDate(1);
    thisMonth.setHours(0, 0, 0, 0);
    
    const newThisMonth = clients.filter(c => {
      const joinDate = new Date(c.joinDate);
      return joinDate >= thisMonth;
    }).length;
    
    return {
      total,
      active,
      trial,
      inactive,
      newThisMonth,
      retention: total > 0 ? Math.round((active / total) * 100) : 0
    };
  },
});

// Создать клиента
export const create = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    phone: v.string(),
    status: v.union(v.literal("active"), v.literal("trial"), v.literal("inactive")),
    joinDate: v.string(),
    trainerId: v.optional(v.string()),
    trainerName: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const clientId = await ctx.db.insert("clients", {
      name: args.name,
      email: args.email,
      phone: args.phone,
      status: args.status,
      joinDate: args.joinDate,
      trainerId: args.trainerId,
      trainerName: args.trainerName,
      createdAt: Date.now(),
    });
    
    return clientId;
  },
});

// Обновить клиента
export const update = mutation({
  args: {
    id: v.id("clients"),
    name: v.optional(v.string()),
    email: v.optional(v.string()),
    phone: v.optional(v.string()),
    status: v.optional(v.union(v.literal("active"), v.literal("trial"), v.literal("inactive"))),
    trainerId: v.optional(v.string()),
    trainerName: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    
    // Фильтруем undefined значения
    const filteredUpdates: any = {};
    Object.entries(updates).forEach(([key, value]) => {
      if (value !== undefined) {
        filteredUpdates[key] = value;
      }
    });
    
    if (Object.keys(filteredUpdates).length > 0) {
      filteredUpdates.updatedAt = Date.now();
      await ctx.db.patch(id, filteredUpdates);
    }
    
    return id;
  },
});

// Удалить клиента
export const deleteClient = mutation({
  args: { id: v.id("clients") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
    return args.id;
  },
});

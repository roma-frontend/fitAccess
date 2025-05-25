// convex/events.ts (новый файл)
import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const getAll = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("events").collect();
  },
});

export const getById = query({
  args: { id: v.id("events") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const getByTrainer = query({
  args: { trainerId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("events")
      .withIndex("by_trainer", (q) => q.eq("trainerId", args.trainerId))
      .collect();
  },
});

export const getByDateRange = query({
  args: { 
    startDate: v.string(),
    endDate: v.string()
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("events")
      .withIndex("by_start_time")
      .filter((q) => 
        q.and(
          q.gte(q.field("startTime"), args.startDate),
          q.lte(q.field("startTime"), args.endDate)
        )
      )
      .collect();
  },
});

export const getByStatus = query({
  args: { status: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("events")
      .withIndex("by_status", (q) => q.eq("status", args.status))
      .collect();
  },
});

export const create = mutation({
  args: {
    title: v.string(),
    description: v.optional(v.string()),
    type: v.string(),
    startTime: v.string(),
    endTime: v.string(),
    trainerId: v.string(),
    trainerName: v.string(),
    clientId: v.optional(v.string()),
    clientName: v.optional(v.string()),
    status: v.optional(v.string()),
    location: v.optional(v.string()),
    createdBy: v.string()
  },
  handler: async (ctx, args) => {
    const eventId = await ctx.db.insert("events", {
      ...args,
      status: args.status || "scheduled"
    });
    
    // Обновляем активность тренера
    const trainer = await ctx.db
      .query("trainers")
      .filter((q) => q.eq(q.field("_id"), args.trainerId))
      .first();
    
    if (trainer) {
      await ctx.db.patch(trainer._id, {
        lastActivity: new Date().toISOString()
      });
    }
    
    return eventId;
  },
});

export const update = mutation({
  args: {
    id: v.id("events"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    type: v.optional(v.string()),
    startTime: v.optional(v.string()),
    endTime: v.optional(v.string()),
    trainerId: v.optional(v.string()),
    trainerName: v.optional(v.string()),
    clientId: v.optional(v.string()),
    clientName: v.optional(v.string()),
    status: v.optional(v.string()),
    location: v.optional(v.string())
  },
  handler: async (ctx, args) => {
    const { id, ...updateData } = args;
    
    await ctx.db.patch(id, updateData);
    
    // Обновляем активность тренера, если событие изменилось
    if (updateData.trainerId) {
      const trainer = await ctx.db
        .query("trainers")
        .filter((q) => q.eq(q.field("_id"), updateData.trainerId))
        .first();
      
      if (trainer) {
        await ctx.db.patch(trainer._id, {
          lastActivity: new Date().toISOString()
        });
      }
    }
    
    return id;
  },
});

export const updateStatus = mutation({
  args: {
    id: v.id("events"),
    status: v.string()
  },
  handler: async (ctx, args) => {
    const event = await ctx.db.get(args.id);
    if (!event) {
      throw new Error("Event not found");
    }
    
    await ctx.db.patch(args.id, { status: args.status });
    
    // Обновляем статистику тренера при завершении/отмене
    if (args.status === "completed" || args.status === "cancelled") {
      const trainer = await ctx.db
        .query("trainers")
        .filter((q) => q.eq(q.field("_id"), event.trainerId))
        .first();
      
      if (trainer) {
        const trainerEvents = await ctx.db
          .query("events")
          .withIndex("by_trainer", (q) => q.eq("trainerId", event.trainerId))
          .collect();
        
        const completedEvents = trainerEvents.filter(e => e.status === "completed");
        
        await ctx.db.patch(trainer._id, {
          totalWorkouts: completedEvents.length,
          lastActivity: new Date().toISOString()
        });
      }
    }
    
    return args.id;
  },
});

export const delete_ = mutation({
  args: { id: v.id("events") },
  handler: async (ctx, args) => {
    const event = await ctx.db.get(args.id);
    if (!event) {
      throw new Error("Event not found");
    }
    
    await ctx.db.delete(args.id);
    
    // Обновляем активность тренера
    const trainer = await ctx.db
      .query("trainers")
      .filter((q) => q.eq(q.field("_id"), event.trainerId))
      .first();
    
    if (trainer) {
      await ctx.db.patch(trainer._id, {
        lastActivity: new Date().toISOString()
      });
    }
    
    return args.id;
  },
});

export const getUpcoming = query({
  args: { trainerId: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const now = new Date().toISOString();
    
    let query = ctx.db
      .query("events")
      .withIndex("by_start_time")
      .filter((q) => q.gte(q.field("startTime"), now));
    
    if (args.trainerId) {
      const allEvents = await query.collect();
      return allEvents.filter(event => event.trainerId === args.trainerId);
    }
    
    return await query.collect();
  },
});

export const getTrainerStats = query({
  args: { trainerId: v.string() },
  handler: async (ctx, args) => {
    const events = await ctx.db
      .query("events")
      .withIndex("by_trainer", (q) => q.eq("trainerId", args.trainerId))
      .collect();
    
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay() + 1);
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    const todayEvents = events.filter(e => {
      const eventDate = new Date(e.startTime);
      return eventDate >= startOfToday && eventDate < new Date(startOfToday.getTime() + 24 * 60 * 60 * 1000);
    });
    
    const weekEvents = events.filter(e => new Date(e.startTime) >= startOfWeek);
    const monthEvents = events.filter(e => new Date(e.startTime) >= startOfMonth);
    const completedEvents = events.filter(e => e.status === 'completed');
    const cancelledEvents = events.filter(e => e.status === 'cancelled');
    
    return {
      total: events.length,
      today: todayEvents.length,
      thisWeek: weekEvents.length,
      thisMonth: monthEvents.length,
      completed: completedEvents.length,
      cancelled: cancelledEvents.length,
      completionRate: events.length > 0 ? (completedEvents.length / events.length) * 100 : 0,
      cancellationRate: events.length > 0 ? (cancelledEvents.length / events.length) * 100 : 0
    };
  },
});

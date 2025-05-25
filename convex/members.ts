// convex/members.ts (новый файл)
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const getAll = query({
  handler: async (ctx) => {
    return await ctx.db.query("members").collect();
  },
});

export const getById = query({
  args: { id: v.id("members") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const updateLastVisit = mutation({
  args: { 
    memberId: v.id("members"),
    timestamp: v.number()
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.memberId, {
      lastVisit: args.timestamp
    });
    return args.memberId;
  },
});

export const getByEmail = query({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    console.log('Convex: ищем участника по email:', args.email);
    const member = await ctx.db.query("members")
      .filter((q) => q.eq(q.field("email"), args.email))
      .first();
    console.log('Convex: участник найден:', member ? 'да' : 'нет');
    return member;
  },
});

export const getByPhone = query({
  args: { phone: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db.query("members")
      .filter((q) => q.eq(q.field("phone"), args.phone))
      .first();
  },
});

export const updateRole = mutation({
  args: { 
    memberId: v.id("members"),
    role: v.string()
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.memberId, {
      role: args.role
    });
    return args.memberId;
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    email: v.optional(v.string()),
    phone: v.string(),
    password: v.string(),
    role: v.optional(v.string()),
    membershipType: v.string(),
    membershipStart: v.number(),
    membershipExpiry: v.number(),
    emergencyContact: v.optional(v.string()),
    emergencyPhone: v.optional(v.string()),
    status: v.string(),
    fitnessGoals: v.optional(v.array(v.string())),
    joinDate: v.number(),
    createdAt: v.number(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("members", args);
  },
});


export const updateMembership = mutation({
  args: {
    memberId: v.id("members"),
    membership: v.object({
      type: v.string(),
      purchaseId: v.string(),
      startDate: v.number(),
      endDate: v.number(),
      sessionsRemaining: v.number(),
      status: v.string(),
    }),
  },
  handler: async (ctx, args) => {
    console.log('Convex: обновляем абонемент участника:', args.memberId);
    
    await ctx.db.patch(args.memberId, {
      membership: args.membership,
      updatedAt: Date.now(),
    });
    
    console.log('Convex: абонемент участника обновлен');
    return args.memberId;
  },
});
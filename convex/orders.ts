// convex/orders.ts (обновленная версия)
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const create = mutation({
  args: {
    memberId: v.string(), // ID участника
    items: v.array(v.object({
      productId: v.optional(v.string()), // Изменено с v.id("products") на v.string()
      productName: v.string(),
      quantity: v.number(),
      price: v.number(),
      totalPrice: v.number(),
    })),
    totalAmount: v.number(),
    status: v.string(), // pending, confirmed, preparing, ready, completed, cancelled
    pickupType: v.string(), // counter, locker, table
    paymentMethod: v.string(), // card, cash, membership
    notes: v.optional(v.string()),
    orderTime: v.number(),
    estimatedReadyTime: v.optional(v.number()),
    paymentIntentId: v.optional(v.string()),
    paymentId: v.optional(v.string()),
    paymentStatus: v.optional(v.string()), // pending, paid, failed
  },
  handler: async (ctx, args) => {
    console.log('🔧 Convex orders:create вызван');
    
    try {
      const orderId = await ctx.db.insert("orders", {
        memberId: args.memberId,
        items: args.items,
        totalAmount: args.totalAmount,
        status: args.status,
        pickupType: args.pickupType,
        paymentMethod: args.paymentMethod,
        notes: args.notes,
        orderTime: args.orderTime,
        estimatedReadyTime: args.estimatedReadyTime,
        completedTime: undefined,
        paymentIntentId: args.paymentIntentId,
        paymentId: args.paymentId,
        paymentStatus: args.paymentStatus || 'pending',
      });
      
      console.log('✅ Заказ создан в БД с ID:', orderId);
      return orderId;
    } catch (error) {
      console.error('❌ Ошибка создания заказа в БД:', error);
      throw error;
    }
  },
});

export const getById = query({
  args: { orderId: v.id("orders") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.orderId);
  },
});

export const getByMember = query({
  args: { memberId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("orders")
      .filter((q) => q.eq(q.field("memberId"), args.memberId))
      .order("desc")
      .collect();
  },
});

export const updateStatus = mutation({
  args: { 
    orderId: v.id("orders"),
    status: v.string(),
    paymentStatus: v.optional(v.string()),
    paidAt: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const updateData: any = {
      status: args.status,
    };
    
    if (args.paymentStatus) {
      updateData.paymentStatus = args.paymentStatus;
    }
    
    if (args.paidAt) {
      updateData.paidAt = args.paidAt;
    }
    
    if (args.status === 'completed') {
      updateData.completedTime = Date.now();
    }
    
    await ctx.db.patch(args.orderId, updateData);
    return args.orderId;
  },
});

export const updateByPaymentId = mutation({
  args: { 
    paymentId: v.string(),
    status: v.string(),
    paymentStatus: v.string(),
    paidAt: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // Ищем заказ по paymentIntentId или paymentId
    const order = await ctx.db
      .query("orders")
      .filter((q) => 
        q.or(
          q.eq(q.field("paymentIntentId"), args.paymentId),
          q.eq(q.field("paymentId"), args.paymentId)
        )
      )
      .first();
    
    if (!order) {
      throw new Error("Заказ не найден");
    }
    
    const updateData: any = {
      status: args.status,
      paymentStatus: args.paymentStatus,
    };
    
    if (args.paidAt) {
      updateData.paidAt = args.paidAt;
    }
    
    if (args.status === 'completed') {
      updateData.completedTime = Date.now();
    }
    
    await ctx.db.patch(order._id, updateData);
    return order._id;
  },
});

export const getAll = query({
  handler: async (ctx) => {
    return await ctx.db
      .query("orders")
      .order("desc")
      .collect();
  },
});

export const getByStatus = query({
  args: { status: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("orders")
      .filter((q) => q.eq(q.field("status"), args.status))
      .order("desc")
      .collect();
  },
});

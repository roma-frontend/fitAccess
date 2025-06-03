// convex/orders.ts (исправленная версия)
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Создать новый заказ
export const create = mutation({
  args: {
    userId: v.optional(v.string()),
    memberId: v.optional(v.string()),
    items: v.array(v.object({
      productId: v.union(v.id("products"), v.string()),
      productName: v.string(),
      quantity: v.number(),
      price: v.number(),
      totalPrice: v.number(),
    })),
    totalAmount: v.number(),
    pickupType: v.string(),
    notes: v.optional(v.string()),
    paymentIntentId: v.optional(v.string()),
    paymentMethod: v.optional(v.string()),
    // Добавляем недостающие поля
    estimatedReadyTime: v.optional(v.number()),
    orderTime: v.optional(v.number()),
    status: v.optional(v.union(
      v.literal("pending"),
      v.literal("confirmed"),
      v.literal("processing"),
      v.literal("ready"),
      v.literal("completed"),
      v.literal("cancelled")
    )),
    paymentStatus: v.optional(v.union(
      v.literal("pending"),
      v.literal("paid"),
      v.literal("failed"),
      v.literal("refunded")
    )),
  },
  handler: async (ctx, args) => {
    console.log('🔧 Convex orders:create вызван с аргументами:', args);
    
    try {
      const orderId = await ctx.db.insert("orders", {
        userId: args.userId,
        memberId: args.memberId,
        items: args.items,
        totalAmount: args.totalAmount,
        pickupType: args.pickupType,
        notes: args.notes,
        status: args.status || "pending",
        paymentStatus: args.paymentStatus || "pending",
        paymentIntentId: args.paymentIntentId,
        paymentMethod: args.paymentMethod || 'stripe',
        orderTime: args.orderTime || Date.now(),
        estimatedReadyTime: args.estimatedReadyTime,
      });
      
      console.log('✅ Заказ создан в БД с ID:', orderId);
      return orderId;
    } catch (error) {
      console.error('❌ Ошибка создания заказа в БД:', error);
      throw error;
    }
  },
});

// Получить заказ по ID
export const get = query({
  args: { id: v.id("orders") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

// Получить заказы пользователя
export const getUserOrders = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("orders")
      .filter((q) => q.eq(q.field("userId"), args.userId))
      .order("desc")
      .collect();
  },
});

// Получить заказы участника
export const getMemberOrders = query({
  args: { memberId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("orders")
      .filter((q) => q.eq(q.field("memberId"), args.memberId))
      .order("desc")
      .collect();
  },
});

// Обновить статус заказа
export const updateStatus = mutation({
  args: {
    id: v.id("orders"),
    status: v.union(
      v.literal("pending"),
      v.literal("confirmed"),
      v.literal("processing"),
      v.literal("ready"),
      v.literal("completed"),
      v.literal("cancelled")
    ),
    estimatedReadyTime: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    console.log('🔄 Обновление статуса заказа:', args.id, 'на', args.status);
    
    const updateData: any = {
      status: args.status,
    };
    
    if (args.estimatedReadyTime) {
      updateData.estimatedReadyTime = args.estimatedReadyTime;
    }
    
    if (args.status === 'completed') {
      updateData.completedTime = Date.now();
    }
    
    await ctx.db.patch(args.id, updateData);
    console.log('✅ Статус заказа обновлен');
    return args.id;
  },
});

// Обновить статус платежа
export const updatePaymentStatus = mutation({
  args: {
    id: v.id("orders"),
    paymentStatus: v.union(
      v.literal("pending"),
      v.literal("paid"),
      v.literal("failed"),
      v.literal("refunded")
    ),
    paymentId: v.optional(v.string()),
    paidAt: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    console.log('💳 Обновление статуса платежа:', args.id, 'на', args.paymentStatus);
    
    const { id, ...updates } = args;
    await ctx.db.patch(id, updates);
    
    console.log('✅ Статус платежа обновлен');
    return id;
  },
});

// Найти заказ по Payment Intent ID
export const getByPaymentIntentId = query({
  args: { paymentIntentId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("orders")
      .filter((q) => q.eq(q.field("paymentIntentId"), args.paymentIntentId))
      .first();
  },
});

// Обновить заказ по Payment Intent ID
export const updateByPaymentIntentId = mutation({
  args: {
    paymentIntentId: v.string(),
    status: v.optional(v.union(
      v.literal("pending"),
      v.literal("confirmed"),
      v.literal("processing"),
      v.literal("ready"),
      v.literal("completed"),
      v.literal("cancelled")
    )),
    paymentStatus: v.optional(v.union(
      v.literal("pending"),
      v.literal("paid"),
      v.literal("failed"),
      v.literal("refunded")
    )),
    paymentId: v.optional(v.string()),
    paidAt: v.optional(v.number()),
    estimatedReadyTime: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    console.log('🔍 Поиск заказа по paymentIntentId:', args.paymentIntentId);
    
    const order = await ctx.db
      .query("orders")
      .filter((q) => q.eq(q.field("paymentIntentId"), args.paymentIntentId))
      .first();
    
    if (!order) {
      console.error('❌ Заказ не найден по paymentIntentId:', args.paymentIntentId);
      throw new Error("Заказ не найден");
    }
    
    console.log('📦 Найден заказ:', order._id);
    
    const updateData: any = {};
    
    if (args.status) {
      updateData.status = args.status;
    }
    
    if (args.paymentStatus) {
      updateData.paymentStatus = args.paymentStatus;
    }
    
    if (args.paymentId) {
      updateData.paymentId = args.paymentId;
    }
    
    if (args.paidAt) {
      updateData.paidAt = args.paidAt;
    }
    
    if (args.estimatedReadyTime) {
      updateData.estimatedReadyTime = args.estimatedReadyTime;
    }
    
    if (args.status === 'completed') {
      updateData.completedTime = Date.now();
    }
    
    await ctx.db.patch(order._id, updateData);
    console.log('✅ Заказ обновлен по paymentIntentId');
    
    return order._id;
  },
});

// Получить все заказы (для админки)
export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("orders").order("desc").collect();
  },
});

// Получить заказы по статусу
export const getByStatus = query({
  args: { 
    status: v.union(
      v.literal("pending"),
      v.literal("confirmed"),
      v.literal("processing"),
      v.literal("ready"),
      v.literal("completed"),
      v.literal("cancelled")
    )
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("orders")
      .filter((q) => q.eq(q.field("status"), args.status))
      .order("desc")
      .collect();
  },
});

// Получить заказы по статусу платежа
export const getByPaymentStatus = query({
  args: { 
    paymentStatus: v.union(
      v.literal("pending"),
      v.literal("paid"),
      v.literal("failed"),
      v.literal("refunded")
    )
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("orders")
      .filter((q) => q.eq(q.field("paymentStatus"), args.paymentStatus))
      .order("desc")
      .collect();
  },
});

// Получить статистику заказов
export const getStats = query({
  args: {},
  handler: async (ctx) => {
    const allOrders = await ctx.db.query("orders").collect();
    
    const stats = {
      total: allOrders.length,
      pending: allOrders.filter(o => o.status === 'pending').length,
      confirmed: allOrders.filter(o => o.status === 'confirmed').length,
      processing: allOrders.filter(o => o.status === 'processing').length,
      ready: allOrders.filter(o => o.status === 'ready').length,
      completed: allOrders.filter(o => o.status === 'completed').length,
      cancelled: allOrders.filter(o => o.status === 'cancelled').length,
      totalRevenue: allOrders
        .filter(o => o.paymentStatus === 'paid')
        .reduce((sum, o) => sum + o.totalAmount, 0),
      averageOrderValue: allOrders.length > 0 
        ? allOrders.reduce((sum, o) => sum + o.totalAmount, 0) / allOrders.length 
        : 0,
    };
    
    return stats;
  },
});

// Удалить заказ (мягкое удаление)
export const remove = mutation({
  args: { id: v.id("orders") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { 
      status: "cancelled",
      completedTime: Date.now()
    });
    return args.id;
  },
});

// Установить время готовности заказа
export const setEstimatedReadyTime = mutation({
  args: {
    id: v.id("orders"),
    estimatedReadyTime: v.number(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      estimatedReadyTime: args.estimatedReadyTime,
    });
    return args.id;
  },
});

// Функция для очистки проблемных заказов
export const cleanupInvalidOrders = mutation({
  args: {},
  handler: async (ctx) => {
    console.log('🧹 Очистка невалидных заказов...');
    
    const orders = await ctx.db.query("orders").collect();
    let deletedCount = 0;
    
    for (const order of orders) {
      // Проверяем, есть ли проблемы с productId
      const hasInvalidProductIds = order.items?.some(item => 
        typeof item.productId === 'string' && 
        !item.productId.startsWith('k') && 
        item.productId.length < 10
      );
      
      if (hasInvalidProductIds) {
        await ctx.db.delete(order._id);
        deletedCount++;
        console.log('🗑️ Удален невалидный заказ:', order._id);
      }
    }
    
    console.log(`✅ Удалено невалидных заказов: ${deletedCount}`);
    return deletedCount;
  },
});

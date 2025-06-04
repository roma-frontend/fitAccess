// convex/orders.ts (исправленная версия)
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

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
    
    // ✅ Добавляем недостающие поля
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
    orderTime: v.optional(v.number()),
    estimatedReadyTime: v.optional(v.number()),
    completedTime: v.optional(v.number()),
    paidAt: v.optional(v.number()),
    paymentId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    console.log("🛒 Создание заказа:", args);
    
    // Устанавливаем значения по умолчанию, если не переданы
    const orderData = {
      ...args,
      status: args.status || "pending",
      paymentStatus: args.paymentStatus || "pending",
      orderTime: args.orderTime || Date.now(),
    };
    
    const orderId = await ctx.db.insert("orders", orderData);
    
    console.log("✅ Заказ создан:", orderId);
    
    // Создаем уведомление о заказе
    const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
    
    try {
      await ctx.db.insert("notifications", {
        title: "Заказ принят",
        message: `Ваш заказ №${orderNumber} на сумму ${args.totalAmount} ₽ принят в обработку`,
        type: "order",
        recipientId: args.memberId || args.userId || "anonymous",
        recipientType: args.memberId ? "member" : "user",
        relatedId: orderId,
        priority: "normal",
        isRead: false,
        createdAt: Date.now(),
        metadata: {
          sourceType: "order",
          sourceId: orderId,
          data: {
            orderNumber,
            totalAmount: args.totalAmount,
          }
        }
      });
      
      console.log("✅ Уведомление о заказе создано");
    } catch (notificationError) {
      console.error("❌ Ошибка создания уведомления:", notificationError);
      // Не прерываем создание заказа из-за ошибки уведомления
    }
    
    return orderId;
  },
});

export const getById = query({
  args: { id: v.id("orders") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const getByUser = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db.query("orders")
      .filter((q) => q.eq(q.field("userId"), args.userId))
      .order("desc")
      .collect();
  },
});

export const getByMember = query({
  args: { memberId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db.query("orders")
      .filter((q) => q.eq(q.field("memberId"), args.memberId))
      .order("desc")
      .collect();
  },
});

export const updateStatus = mutation({
  args: {
    orderId: v.id("orders"),
    status: v.union(
      v.literal("pending"),
      v.literal("confirmed"),
      v.literal("processing"),
      v.literal("ready"),
      v.literal("completed"),
      v.literal("cancelled")
    ),
    estimatedReadyTime: v.optional(v.number()),
    completedTime: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    console.log("📝 Обновление статуса заказа:", args);
    
    const updateData: any = {
      status: args.status,
    };
    
    if (args.estimatedReadyTime) {
      updateData.estimatedReadyTime = args.estimatedReadyTime;
    }
    
    if (args.completedTime) {
      updateData.completedTime = args.completedTime;
    }
    
    await ctx.db.patch(args.orderId, updateData);
    
    console.log("✅ Статус заказа обновлен");
    return args.orderId;
  },
});

export const updatePaymentStatus = mutation({
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
    console.log("💳 Обновление статуса платежа:", args);
    
    // Находим заказ по paymentIntentId
    const order = await ctx.db
      .query("orders")
      .filter((q) => q.eq(q.field("paymentIntentId"), args.paymentIntentId))
      .first();
    
    if (!order) {
      throw new Error("Заказ не найден");
    }
    
    // Подготавливаем данные для обновления
    const updateData: any = {
      paymentStatus: args.paymentStatus,
    };
    
    if (args.status) {
      updateData.status = args.status;
    }
    
    if (args.paymentId) {
      updateData.paymentId = args.paymentId;
    }
    
    if (args.paidAt) {
      updateData.paidAt = args.paidAt;
    }
    
    // Обновляем заказ
    await ctx.db.patch(order._id, updateData);
    
    console.log("✅ Статус заказа обновлен");
    
    // Возвращаем обновленный заказ
    const updatedOrder = await ctx.db.get(order._id);
    return updatedOrder;
  },
});

// Получить все заказы (для админки)
export const getAll = query({
  args: {
    limit: v.optional(v.number()),
    status: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let query = ctx.db.query("orders");
    
    if (args.status) {
      query = query.filter((q) => q.eq(q.field("status"), args.status));
    }
    
    const orders = await query
      .order("desc")
      .take(args.limit || 100);
    
    return orders;
  },
});

// Получить статистику заказов
export const getStats = query({
  handler: async (ctx) => {
    const allOrders = await ctx.db.query("orders").collect();
    
    const stats = {
      total: allOrders.length,
      pending: allOrders.filter(o => o.status === "pending").length,
      confirmed: allOrders.filter(o => o.status === "confirmed").length,
      processing: allOrders.filter(o => o.status === "processing").length,
      ready: allOrders.filter(o => o.status === "ready").length,
      completed: allOrders.filter(o => o.status === "completed").length,
      cancelled: allOrders.filter(o => o.status === "cancelled").length,
      totalRevenue: allOrders
        .filter(o => o.paymentStatus === "paid")
        .reduce((sum, o) => sum + o.totalAmount, 0),
    };
    
    return stats;
  },
});

// convex/users.ts (исправленная версия)
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Существующие функции...

export const getAll = query({
  handler: async (ctx) => {
    console.log('Convex users: получаем всех пользователей');
    const users = await ctx.db.query("users").collect();
    console.log('Convex users: найдено пользователей:', users.length);
    return users;
  },
});

export const create = mutation({
  args: {
    email: v.string(),
    password: v.string(),
    name: v.string(),
    role: v.string(),
    isActive: v.boolean(),
    createdAt: v.number(),
    createdBy: v.optional(v.id("users")),
    photoUrl: v.optional(v.string()),
    faceDescriptor: v.optional(v.array(v.number())),
  },
  handler: async (ctx, args) => {
    console.log('🔧 Convex users:create вызван с данными:', {
      email: args.email,
      name: args.name,
      role: args.role,
      isActive: args.isActive
    });
    
    try {
      const userId = await ctx.db.insert("users", {
        email: args.email,
        password: args.password,
        name: args.name,
        role: args.role,
        isActive: args.isActive,
        createdAt: args.createdAt,
        createdBy: args.createdBy,
        photoUrl: args.photoUrl,
        faceDescriptor: args.faceDescriptor || [],
      });
      
      console.log('✅ Пользователь создан в БД с ID:', userId);
      return userId;
    } catch (error) {
      console.error('❌ Ошибка вставки в БД:', error);
      throw error;
    }
  },
});


export const getAllFaceDescriptors = query({
  handler: async (ctx) => {
    const users = await ctx.db.query("users").collect();
    return users
      .filter(user => user.faceDescriptor && user.faceDescriptor.length > 0)
      .map(user => ({
        id: user._id,
        name: user.name,
        faceDescriptor: user.faceDescriptor
      }));
  },
});

// Исправляем функцию удаления пользователя
export const deleteUser = mutation({
  args: { id: v.id("users") }, // Используем правильный тип ID
  handler: async (ctx, args) => {
    try {
      const user = await ctx.db.get(args.id);
      
      if (!user) {
        throw new Error("Пользователь не найден");
      }
      
      await ctx.db.delete(args.id);
      
      return { success: true, deletedUser: user };
    } catch (error) {
      console.error("Ошибка удаления пользователя:", error);
      throw error;
    }
  },
});

// Исправляем функцию создания администратора
export const createAdmin = mutation({
  args: {
    name: v.string(),
    email: v.string(), // Убираем optional
    password: v.string(), // Добавляем пароль
    photoUrl: v.optional(v.string()), // Делаем optional
    faceDescriptor: v.optional(v.array(v.number())), // Делаем optional
  },
  handler: async (ctx, args) => {
    // Проверяем, что пользователь с таким email не существует
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();

    if (existingUser) {
      throw new Error("Пользователь с таким email уже существует");
    }

    const userId = await ctx.db.insert("users", {
      email: args.email,
      password: args.password,
      name: args.name,
      role: "admin",
      isActive: true,
      createdAt: Date.now(),
      photoUrl: args.photoUrl,
      faceDescriptor: args.faceDescriptor || [],
    });
    return userId;
  },
});


export const getByEmail = query({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    console.log('Convex users: ищем пользователя по email:', args.email);
    const user = await ctx.db.query("users")
      .filter((q) => q.eq(q.field("email"), args.email))
      .first();
    console.log('Convex users: пользователь найден:', user ? 'да' : 'нет');
    return user;
  },
});

export const saveFaceDescriptor = mutation({
  args: { 
    userId: v.id("users"), 
    faceDescriptor: v.array(v.number()) 
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.userId, {
      faceDescriptor: args.faceDescriptor
    });
  },
});

export const getAllWithFaceDescriptors = query({
  args: {},
  handler: async (ctx) => {
    const users = await ctx.db
      .query("users")
      .filter((q) => q.neq(q.field("faceDescriptor"), undefined))
      .collect();
    
    return users.filter(user => user.faceDescriptor && user.faceDescriptor.length > 0);
  },
});

export const getById = query({
  args: { id: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const updateLastLogin = mutation({
  args: { 
    userId: v.id("users"),
    timestamp: v.number()
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.userId, {
      lastLogin: args.timestamp
    });
    return args.userId;
  },
});

export const updateRole = mutation({
  args: { 
    userId: v.id("users"),
    role: v.string()
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.userId, {
      role: args.role
    });
    return args.userId;
  },
});

export const toggleStatus = mutation({
  args: { 
    userId: v.id("users"),
    isActive: v.boolean()
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.userId, {
      isActive: args.isActive
    });
    return args.userId;
  },
});

export const updatePassword = mutation({
  args: { 
    userId: v.id("users"),
    password: v.string()
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.userId, {
      password: args.password
    });
    return args.userId;
  },
});
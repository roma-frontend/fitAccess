// convex/products.ts (новый файл)
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const getAll = query({
  handler: async (ctx) => {
    return await ctx.db.query("products")
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();
  },
});

export const getByCategory = query({
  args: { category: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db.query("products")
      .filter((q) => q.and(
        q.eq(q.field("category"), args.category),
        q.eq(q.field("isActive"), true)
      ))
      .collect();
  },
});

export const getPopular = query({
  handler: async (ctx) => {
    return await ctx.db.query("products")
      .filter((q) => q.and(
        q.eq(q.field("isPopular"), true),
        q.eq(q.field("isActive"), true)
      ))
      .collect();
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    category: v.string(),
    price: v.number(),
    imageUrl: v.optional(v.string()),
    inStock: v.number(),
    minStock: v.number(),
    nutrition: v.optional(v.object({
      calories: v.optional(v.number()),
      protein: v.optional(v.number()),
      carbs: v.optional(v.number()),
      fat: v.optional(v.number()),
      sugar: v.optional(v.number()),
    })),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("products", {
      ...args,
      isActive: true,
      isPopular: false,
      createdAt: Date.now(),
    });
  },
});

export const updateStock = mutation({
  args: { 
    productId: v.id("products"),
    newStock: v.number()
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.productId, {
      inStock: args.newStock
    });
    return args.productId;
  },
});

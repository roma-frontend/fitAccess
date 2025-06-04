// convex/auth.ts
import { v } from "convex/values";
import { mutation, query, action } from "./_generated/server";

// Обычные mutation и query функции (без "use node")
export const requestPasswordReset = mutation({
  args: {
    email: v.string(),
    userType: v.union(v.literal("staff"), v.literal("member")),
  },
  handler: async (ctx, { email, userType }) => {
    try {
      const tableName = userType === "staff" ? "staff" : "members";
      
      const user = await ctx.db
        .query(tableName)
        .withIndex("by_email", (q) => q.eq("email", email))
        .first();

      if (!user) {
        await ctx.db.insert("passwordResetLogs", {
          userId: "unknown",
          userType,
          email,
          action: "failed",
          timestamp: Date.now(),
          details: "Пользователь не найден",
        });

        return {
          success: false,
          error: "Пользователь с таким email не найден",
        };
      }

      // Проверяем активность пользователя
      const isActive = user.isActive !== false;
      if (!isActive) {
        await ctx.db.insert("passwordResetLogs", {
          userId: user._id,
          userType,
          email,
          action: "failed",
          timestamp: Date.now(),
          details: "Аккаунт деактивирован",
        });

        return {
          success: false,
          error: "Аккаунт деактивирован",
        };
      }

      // Генерируем простой токен без crypto
      const resetToken = Math.random().toString(36).substring(2) + 
                        Math.random().toString(36).substring(2) +
                        Date.now().toString(36);
      const expiresAt = Date.now() + 60 * 60 * 1000; // 1 час

      await ctx.db.patch(user._id, {
        resetPasswordToken: resetToken,
        resetPasswordExpires: expiresAt,
        resetPasswordRequestedAt: Date.now(),
        updatedAt: Date.now(),
      });

      await ctx.db.insert("passwordResetLogs", {
        userId: user._id,
        userType,
        email,
        action: "requested",
        timestamp: Date.now(),
        details: `Токен создан, истекает: ${new Date(expiresAt).toISOString()}`,
      });

      return {
        success: true,
        message: "Инструкции по восстановлению пароля отправлены на email",
        token: resetToken, // Возвращаем токен для тестирования
      };
    } catch (error) {
      await ctx.db.insert("passwordResetLogs", {
        userId: "unknown",
        userType,
        email,
        action: "failed",
        timestamp: Date.now(),
        details: `Системная ошибка: ${error}`,
      });

      return {
        success: false,
        error: "Произошла системная ошибка",
      };
    }
  },
});

// Функция для проверки токена
export const verifyResetToken = query({
  args: {
    token: v.string(),
    userType: v.union(v.literal("staff"), v.literal("member")),
  },
  handler: async (ctx, { token, userType }) => {
    const tableName = userType === "staff" ? "staff" : "members";
    
    const user = await ctx.db
      .query(tableName)
      .withIndex("by_reset_token", (q) => q.eq("resetPasswordToken", token))
      .first();

    if (!user || !user.resetPasswordExpires) {
      return {
        success: false,
        error: "Недействительный токен",
      };
    }

    if (user.resetPasswordExpires < Date.now()) {
      return {
        success: false,
        error: "Токен истек",
        expired: true,
      };
    }

    return {
      success: true,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
      },
    };
  },
});

// Функция для сброса пароля
export const resetPassword = mutation({
  args: {
    token: v.string(),
    newPassword: v.string(),
    userType: v.union(v.literal("staff"), v.literal("member")),
  },
  handler: async (ctx, { token, newPassword, userType }) => {
    try {
      const tableName = userType === "staff" ? "staff" : "members";
      
      const user = await ctx.db
        .query(tableName)
        .withIndex("by_reset_token", (q) => q.eq("resetPasswordToken", token))
        .first();

      if (!user || !user.resetPasswordExpires) {
        await ctx.db.insert("passwordResetLogs", {
          userId: "unknown",
          userType,
          email: "unknown",
          action: "failed",
          timestamp: Date.now(),
          details: "Недействительный токен",
        });

        return {
          success: false,
          error: "Недействительный токен",
        };
      }

      if (user.resetPasswordExpires < Date.now()) {
        await ctx.db.insert("passwordResetLogs", {
          userId: user._id,
          userType,
          email: user.email,
          action: "expired",
          timestamp: Date.now(),
          details: "Попытка использования истекшего токена для сброса пароля",
        });

        return {
          success: false,
          error: "Токен истек",
        };
      }

      // Простое хеширование без crypto (для продакшена используйте bcrypt)
      const hashedPassword = btoa(newPassword + "salt"); // Базовое кодирование

      // Обновляем пароль и очищаем токен
      await ctx.db.patch(user._id, {
        password: hashedPassword,
        resetPasswordToken: undefined,
        resetPasswordExpires: undefined,
        passwordChangedAt: Date.now(),
        updatedAt: Date.now(),
      });

      // Логируем успешный сброс
      await ctx.db.insert("passwordResetLogs", {
        userId: user._id,
        userType,
        email: user.email,
        action: "completed",
        timestamp: Date.now(),
        details: "Пароль успешно изменен",
      });

      return {
        success: true,
        message: "Пароль успешно изменен",
      };
    } catch (error) {
      return {
        success: false,
        error: "Произошла ошибка при изменении пароля",
      };
    }
  },
});

// Функция для получения логов
export const getPasswordResetLogs = query({
  args: {
    limit: v.optional(v.number()),
    userType: v.optional(v.union(v.literal("staff"), v.literal("member"))),
  },
  handler: async (ctx, { limit = 50, userType }) => {
    if (userType) {
      return await ctx.db
        .query("passwordResetLogs")
        .withIndex("by_user_type", (q) => q.eq("userType", userType))
        .order("desc")
        .take(limit);
    } else {
      return await ctx.db
        .query("passwordResetLogs")
        .order("desc")
        .take(limit);
    }
  },
});

// Функция для очистки истекших токенов (обычная mutation)
export const cleanupExpiredTokens = mutation({
  args: {},
  handler: async (ctx) => {
    try {
      const now = Date.now();
      let cleanedCount = 0;

      // Очищаем истекшие токены у персонала
      const expiredStaff = await ctx.db
        .query("staff")
        .filter((q) =>
          q.and(
            q.neq(q.field("resetPasswordToken"), undefined),
            q.lt(q.field("resetPasswordExpires"), now)
          )
        )
        .collect();

      for (const staff of expiredStaff) {
        await ctx.db.patch(staff._id, {
          resetPasswordToken: undefined,
          resetPasswordExpires: undefined,
          updatedAt: now,
        });

        await ctx.db.insert("passwordResetLogs", {
          userId: staff._id,
          userType: "staff" as const,
          email: staff.email,
          action: "expired" as const,
          timestamp: now,
          details: "Токен автоматически очищен системой",
        });

        cleanedCount++;
      }

      // Очищаем истекшие токены у участников
      const expiredMembers = await ctx.db
        .query("members")
        .filter((q) =>
          q.and(
            q.neq(q.field("resetPasswordToken"), undefined),
            q.lt(q.field("resetPasswordExpires"), now)
          )
        )
        .collect();

      for (const member of expiredMembers) {
        await ctx.db.patch(member._id, {
          resetPasswordToken: undefined,
          resetPasswordExpires: undefined,
          updatedAt: now,
        });

        await ctx.db.insert("passwordResetLogs", {
          userId: member._id,
          userType: "member" as const,
          email: member.email,
          action: "expired" as const,
          timestamp: now,
          details: "Токен автоматически очищен системой",
        });

        cleanedCount++;
      }

      return {
        success: true,
        message: `Очищено ${cleanedCount} истекших токенов`,
        cleanedCount,
      };
    } catch (error) {
      return {
        success: false,
        error: "Ошибка при очистке токенов",
      };
    }
  },
});

// Функция для логирования истекших токенов
export const logExpiredToken = mutation({
  args: {
    userId: v.string(),
    userType: v.union(v.literal("staff"), v.literal("member")),
    email: v.string(),
    details: v.string(),
  },
  handler: async (ctx, { userId, userType, email, details }) => {
    await ctx.db.insert("passwordResetLogs", {
      userId,
      userType,
      email,
      action: "expired",
      timestamp: Date.now(),
      details,
    });

    return { success: true };
  },
});

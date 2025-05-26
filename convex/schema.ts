// convex/schema.ts (обновленная версия)
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({

  users: defineTable({
    email: v.string(),
    password: v.string(),
    name: v.string(),
    role: v.string(),
    isActive: v.boolean(),
    lastLogin: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.optional(v.number()),
    createdBy: v.optional(v.string()),
    photoUrl: v.optional(v.string()),
    faceDescriptor: v.optional(v.array(v.number())),
    faceRecognitionEnabled: v.optional(v.boolean()),
    faceDescriptorUpdatedAt: v.optional(v.number()),
  })
    .index("by_email", ["email"])
    .index("by_role", ["role"])
    .index("by_face_recognition", ["faceRecognitionEnabled"]),

  accessLogs: defineTable({
    userId: v.optional(v.id("users")),
    success: v.boolean(),
    timestamp: v.number(),
    photoUrl: v.optional(v.string()),
    deviceInfo: v.optional(v.string()),
    ipAddress: v.optional(v.string()),
  })
    .index("by_timestamp", ["timestamp"])
    .index("by_success", ["success"]),
  
  logs: defineTable({
    userId: v.string(),
    success: v.boolean(),
    deviceInfo: v.optional(v.string()),
    timestamp: v.number(),
  }),

  members: defineTable({
    name: v.string(),
    email: v.optional(v.string()),
    phone: v.string(),
    password: v.optional(v.string()),
    role: v.optional(v.string()),
    photoUrl: v.optional(v.string()),
    faceDescriptor: v.optional(v.array(v.number())),

    // Фитнес-специфичные поля
    membershipType: v.string(),
    membershipStart: v.number(),
    membershipExpiry: v.number(),
    emergencyContact: v.optional(v.string()),
    emergencyPhone: v.optional(v.string()),
    medicalNotes: v.optional(v.string()),
    birthDate: v.optional(v.number()),
    status: v.string(),

    // Предпочтения
    preferredTrainers: v.optional(v.array(v.id("trainers"))),
    fitnessGoals: v.optional(v.array(v.string())),
    workoutPreferences: v.optional(v.array(v.string())),

    // Даты
    joinDate: v.number(),
    createdAt: v.number(),
    lastVisit: v.optional(v.number()),
    updatedAt: v.optional(v.number()),
    
    // Добавляем поле membership
    membership: v.optional(v.object({
      type: v.string(),
      purchaseId: v.string(),
      startDate: v.number(),
      endDate: v.number(),
      sessionsRemaining: v.number(),
      status: v.string(),
    })),
  })
    .index("by_email", ["email"])
    .index("by_phone", ["phone"])
    .index("by_status", ["status"]),

  // Тренеры (обновленная версия для админ панели)
  trainers: defineTable({
    name: v.string(),
    email: v.string(),
    phone: v.string(),
    password: v.optional(v.string()), // Делаем опциональным для совместимости
    photoUrl: v.optional(v.string()),
    bio: v.optional(v.string()),

    // Профессиональная информация
    specializations: v.array(v.string()), // ["Силовые тренировки", "Йога", "Кардио"]
    experience: v.optional(v.number()), // Лет опыта (делаем опциональным)
    certifications: v.optional(v.array(v.string())),
    languages: v.optional(v.array(v.string())),

    // Рейтинг и отзывы
    rating: v.optional(v.number()),
    totalReviews: v.optional(v.number()),

    // Расписание (обновленное для совместимости с админ панелью)
    workingHours: v.union(
      // Новый формат (дни недели)
      v.object({
        monday: v.optional(v.object({ start: v.string(), end: v.string() })),
        tuesday: v.optional(v.object({ start: v.string(), end: v.string() })),
        wednesday: v.optional(v.object({ start: v.string(), end: v.string() })),
        thursday: v.optional(v.object({ start: v.string(), end: v.string() })),
        friday: v.optional(v.object({ start: v.string(), end: v.string() })),
        saturday: v.optional(v.object({ start: v.string(), end: v.string() })),
        sunday: v.optional(v.object({ start: v.string(), end: v.string() })),
      }),
      // Старый формат (для админ панели)
      v.object({
        start: v.string(),
        end: v.string(),
        days: v.array(v.number())
      })
    ),

    // Цены и статистика
    hourlyRate: v.optional(v.number()),
    isActive: v.optional(v.boolean()),
    
    // Поля для админ панели
    role: v.optional(v.string()),
    avatar: v.optional(v.string()),
    joinDate: v.optional(v.string()),
    status: v.optional(v.union(v.literal("active"), v.literal("inactive"), v.literal("suspended"))),
    totalClients: v.optional(v.number()),
    activeClients: v.optional(v.number()),
    totalWorkouts: v.optional(v.number()),
    monthlyRevenue: v.optional(v.number()),
    lastActivity: v.optional(v.string()),
    
    createdAt: v.number(),
  })
    .index("by_email", ["email"])
    .index("by_specialization", ["specializations"])
    .index("by_rating", ["rating"])
    .index("by_status", ["status"]),

  // События/тренировки для расписания
  events: defineTable({
    title: v.string(),
    description: v.optional(v.string()),
    type: v.string(), // "training", "consultation", "group", etc.
    startTime: v.string(), // ISO string
    endTime: v.string(), // ISO string
    trainerId: v.string(), // ID тренера
    trainerName: v.string(), // Имя тренера для быстрого доступа
    clientId: v.optional(v.string()), // ID клиента
    clientName: v.optional(v.string()), // Имя клиента для быстрого доступа
    status: v.string(), // "scheduled", "confirmed", "completed", "cancelled", "no-show"
    location: v.optional(v.string()), // Место проведения
    createdBy: v.string(), // Кто создал событие
    
    // Дополнительные поля
    price: v.optional(v.number()),
    duration: v.optional(v.number()), // в минутах
    notes: v.optional(v.string()),
    goals: v.optional(v.array(v.string())),
    
    // Отзыв после тренировки
    clientRating: v.optional(v.number()),
    clientReview: v.optional(v.string()),
    trainerNotes: v.optional(v.string()),
  })
    .index("by_trainer", ["trainerId"])
    .index("by_client", ["clientId"])
    .index("by_status", ["status"])
    .index("by_start_time", ["startTime"])
    .index("by_created_by", ["createdBy"]),

  // Клиенты для админ панели
  clients: defineTable({
    name: v.string(),
    email: v.string(),
    phone: v.string(),
    trainerId: v.optional(v.string()), // Назначенный тренер
    trainerName: v.optional(v.string()),
    status: v.union(v.literal("active"), v.literal("trial"), v.literal("inactive")),
    joinDate: v.string(),
    currentProgram: v.optional(v.string()),
    totalWorkouts: v.optional(v.number()),
    progress: v.optional(v.number()), // Процент прогресса
    lastWorkout: v.optional(v.string()),
    goals: v.optional(v.array(v.string())),
    notes: v.optional(v.string()),
    
    // Дополнительные поля
    avatar: v.optional(v.string()),
    birthDate: v.optional(v.string()),
    emergencyContact: v.optional(v.string()),
    emergencyPhone: v.optional(v.string()),
    medicalNotes: v.optional(v.string()),
    
    createdAt: v.number(),
    updatedAt: v.optional(v.number()),
  })
    .index("by_email", ["email"])
    .index("by_trainer", ["trainerId"])
    .index("by_status", ["status"]),

  // Бронирования тренировок
  bookings: defineTable({
    memberId: v.id("members"),
    trainerId: v.id("trainers"),

    // Время и дата
    startTime: v.number(),
    endTime: v.number(),
    duration: v.number(), // в минутах

    // Детали тренировки
    workoutType: v.string(), // "Персональная", "Групповая", "Консультация"
    notes: v.optional(v.string()),
    goals: v.optional(v.array(v.string())),

    // Статус
    status: v.string(), // "pending", "confirmed", "completed", "cancelled", "no-show"
    price: v.number(),

    // Отзыв после тренировки
    memberRating: v.optional(v.number()),
    memberReview: v.optional(v.string()),
    trainerNotes: v.optional(v.string()),

    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_member", ["memberId"])
    .index("by_trainer", ["trainerId"])
    .index("by_start_time", ["startTime"])
    .index("by_status", ["status"]),

  // Логи посещений (обновленные)
  visits: defineTable({
    memberId: v.id("members"),
    timestamp: v.number(),
    success: v.boolean(),
    deviceInfo: v.optional(v.string()),
    ipAddress: v.optional(v.string()),
    photoUrl: v.optional(v.string()),
    visitType: v.string(), // "entry", "exit", "denied"
    reason: v.optional(v.string()),

    // Дополнительная информация
    duration: v.optional(v.number()), // Продолжительность пребывания в минутах
    areas: v.optional(v.array(v.string())), // Зоны которые посетил ["gym", "pool", "sauna"]
  })
    .index("by_member", ["memberId"])
    .index("by_timestamp", ["timestamp"]),

  // Продукты и напитки
  products: defineTable({
    name: v.string(),
    description: v.optional(v.string()),
    category: v.string(), // "drinks", "supplements", "snacks", "merchandise"
    price: v.number(),
    imageUrl: v.optional(v.string()),

    // Инвентарь
    inStock: v.number(),
    minStock: v.number(), // Минимальный остаток для уведомления

    // Питательная ценность (для напитков и еды)
    nutrition: v.optional(v.object({
      calories: v.optional(v.number()),
      protein: v.optional(v.number()),
      carbs: v.optional(v.number()),
      fat: v.optional(v.number()),
      sugar: v.optional(v.number()),
    })),

    isActive: v.boolean(),
    isPopular: v.optional(v.boolean()),
    createdAt: v.number(),
  })
    .index("by_category", ["category"])
    .index("by_popularity", ["isPopular"]),

  // Заказы
  orders: defineTable({
    memberId: v.string(),
    items: v.array(v.object({
      productId: v.optional(v.string()), // Изменено с v.id("products")
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
    completedTime: v.optional(v.number()),
    paymentIntentId: v.optional(v.string()),
    paymentId: v.optional(v.string()),
    paymentStatus: v.optional(v.string()), // pending, paid, failed, cancelled
    paidAt: v.optional(v.number()),
  })
    .index("by_member", ["memberId"])
    .index("by_status", ["status"])
    .index("by_payment_intent", ["paymentIntentId"])
    .index("by_payment_id", ["paymentId"])
    .index("by_payment_status", ["paymentStatus"]),

  // Групповые занятия
  classes: defineTable({
    name: v.string(),
    description: v.optional(v.string()),
    instructorId: v.id("trainers"),

    // Время и место
    startTime: v.number(),
    endTime: v.number(),
    location: v.string(), // "Зал 1", "Бассейн", "Студия йоги"

    // Участники
    capacity: v.number(),
    enrolled: v.array(v.id("members")),
    waitlist: v.optional(v.array(v.id("members"))),

    // Детали
    difficulty: v.string(), // "Начинающий", "Средний", "Продвинутый"
    equipment: v.optional(v.array(v.string())),
    price: v.number(),

    // Повторяющиеся занятия
    isRecurring: v.boolean(),
    recurringPattern: v.optional(v.string()), // "weekly", "daily"

    status: v.string(), // "scheduled", "in-progress", "completed", "cancelled"
    createdAt: v.number(),
  })
    .index("by_instructor", ["instructorId"])
    .index("by_start_time", ["startTime"])
    .index("by_status", ["status"]),

    programBookings: defineTable({
    memberId: v.id("members"),
    programId: v.string(), // ID программы (yoga, strength, cardio, etc.)
    programTitle: v.string(),
    sessionIndex: v.number(),
    sessionType: v.string(),
    instructor: v.string(),
    startTime: v.number(),
    endTime: v.number(),
    duration: v.number(),
    price: v.number(),
    status: v.string(), // confirmed, cancelled, completed
    notes: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_member", ["memberId"])
    .index("by_program", ["programId"])
    .index("by_start_time", ["startTime"])
    .index("by_status", ["status"]),

  purchases: defineTable({
    memberId: v.id("members"),
    memberEmail: v.string(),
    type: v.string(),
    title: v.string(),
    price: v.number(),
    currency: v.string(),
    status: v.string(),
    paymentMethod: v.string(),
    description: v.optional(v.string()),
    metadata: v.optional(v.any()),
    purchaseDate: v.number(),
    createdAt: v.number(),
    // Убираем membership отсюда, так как оно должно быть в members
  }),

  userBookings: defineTable({
    userId: v.id("users"), // Ссылка на users вместо members
    trainerId: v.id("trainers"),
    startTime: v.number(),
    endTime: v.number(),
    duration: v.number(),
    workoutType: v.string(),
    notes: v.optional(v.string()),
    status: v.string(),
    price: v.number(),
    createdAt: v.number(),
    updatedAt: v.number(),

    // Отзыв после тренировки
    memberRating: v.optional(v.number()),
    memberReview: v.optional(v.string()),
    trainerNotes: v.optional(v.string()),
  })
    .index("by_user", ["userId"])
    .index("by_trainer", ["trainerId"])
    .index("by_start_time", ["startTime"])
    .index("by_status", ["status"]),

  // Уведомления
  notifications: defineTable({
    recipientId: v.string(), // ID участника или тренера
    recipientType: v.string(), // "member", "trainer", "staff"

    title: v.string(),
    message: v.string(),
    type: v.string(), // "booking", "payment", "class", "membership", "order"

    isRead: v.boolean(),
    isImportant: v.optional(v.boolean()),

    // Дополнительные данные
    relatedId: v.optional(v.string()), // ID связанного объекта
    actionUrl: v.optional(v.string()),

    createdAt: v.number(),
    readAt: v.optional(v.number()),
  })
    .index("by_recipient", ["recipientId"])
    .index("by_type", ["type"])
    .index("by_created", ["createdAt"]),

  // Абонементы и тарифы
  membershipPlans: defineTable({
    name: v.string(),
    type: v.string(),
    duration: v.number(),
    price: v.number(),
    description: v.optional(v.string()),
    features: v.array(v.string()),
    isActive: v.boolean(),
    createdAt: v.number(),
  }),

  // Сообщения для админ панели
  messages: defineTable({
    senderId: v.string(),
    senderName: v.string(),
    senderRole: v.string(), // "admin", "trainer", "client"
    
    recipientId: v.optional(v.string()),
    recipientName: v.optional(v.string()),
    recipientRole: v.optional(v.string()),
    
    subject: v.string(),
    content: v.string(),
    type: v.string(), // "direct", "broadcast", "notification"
    priority: v.optional(v.string()), // "low", "normal", "high", "urgent"
    
    // Связанные объекты
    relatedTo: v.optional(v.object({
      type: v.string(), // "event", "booking", "client", "trainer"
      id: v.string(),
      title: v.optional(v.string())
    })),
    
    // Статус
    status: v.string(), // "sent", "delivered", "read", "archived"
    isRead: v.optional(v.boolean()),
    readAt: v.optional(v.number()),
    
    // Вложения
    attachments: v.optional(v.array(v.object({
      name: v.string(),
      url: v.string(),
      type: v.string(),
      size: v.optional(v.number())
    }))),
    
    createdAt: v.number(),
    updatedAt: v.optional(v.number()),
  })
    .index("by_sender", ["senderId"])
    .index("by_recipient", ["recipientId"])
    .index("by_type", ["type"])
    .index("by_status", ["status"])
    .index("by_created", ["createdAt"]),

  // Настройки системы
  systemSettings: defineTable({
    key: v.string(), // уникальный ключ настройки
    value: v.any(), // значение настройки
    type: v.string(), // "string", "number", "boolean", "object", "array"
    category: v.string(), // "general", "notifications", "payments", "schedule"
    description: v.optional(v.string()),
    isPublic: v.optional(v.boolean()), // доступна ли настройка клиентам
    updatedBy: v.optional(v.string()),
    updatedAt: v.number(),
    createdAt: v.number(),
  })
    .index("by_key", ["key"])
    .index("by_category", ["category"]),

  // Аудит лог для админ панели
  auditLogs: defineTable({
    userId: v.string(),
    userName: v.string(),
    userRole: v.string(),
    
    action: v.string(), // "create", "update", "delete", "view"
    resource: v.string(), // "trainer", "client", "event", "message"
    resourceId: v.optional(v.string()),
    
    details: v.optional(v.object({
      before: v.optional(v.any()),
      after: v.optional(v.any()),
      changes: v.optional(v.array(v.string()))
    })),
    
    ipAddress: v.optional(v.string()),
    userAgent: v.optional(v.string()),
    
    timestamp: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_action", ["action"])
    .index("by_resource", ["resource"])
    .index("by_timestamp", ["timestamp"]),

});


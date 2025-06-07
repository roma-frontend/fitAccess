// convex/schema.ts (исправленная версия с синхронизацией)
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    email: v.string(),
    password: v.string(),
    name: v.string(),
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
    role: v.optional(v.string()),
    isActive: v.boolean(),
    lastLogin: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.optional(v.number()),
    createdBy: v.optional(v.string()),
    photoUrl: v.optional(v.string()),
    faceDescriptor: v.optional(v.array(v.number())),
    faceRecognitionEnabled: v.optional(v.boolean()),
    faceDescriptorUpdatedAt: v.optional(v.number()),
    preferences: v.optional(v.object({
      notifications: v.optional(v.object({
        email: v.optional(v.boolean()),
        push: v.optional(v.boolean()),
        sms: v.optional(v.boolean()),
      })),
      language: v.optional(v.string()),
      timezone: v.optional(v.string()),
    })),
    avatar: v.optional(v.string()),
    phone: v.optional(v.string()),
    department: v.optional(v.string()),
    // Поля для синхронизации
    _version: v.optional(v.number()),
    _lastSync: v.optional(v.number()),
    _isDirty: v.optional(v.boolean()),
  })
    .index("by_email", ["email"])
    .index("by_role", ["role"])
    .index("by_active", ["isActive"])
    .index("by_face_recognition", ["faceRecognitionEnabled"])
    .index("email_active", ["email", "isActive"])
    .index("role_active", ["role", "isActive"]),
  messages: defineTable({
    type: v.union(
      v.literal("direct"),
      v.literal("group"), 
      v.literal("announcement"),
      v.literal("notification")
    ),
    subject: v.optional(v.string()),
    content: v.string(),
    senderId: v.id("users"),
    senderName: v.string(),
    recipientIds: v.array(v.id("users")),
    recipientNames: v.array(v.string()),
    groupId: v.optional(v.id("messageGroups")),
    priority: v.union(
      v.literal("low"),
      v.literal("normal"),
      v.literal("high"),
      v.literal("urgent")
    ),
    status: v.union(
      v.literal("draft"),
      v.literal("sent"),
      v.literal("delivered"),
      v.literal("read")
    ),
    readAt: v.record(v.string(), v.string()),
    isArchived: v.boolean(),
    scheduledAt: v.optional(v.number()), // Добавляем это поле
    metadata: v.optional(v.object({
      tags: v.optional(v.array(v.string())),
      relatedTo: v.optional(v.object({
        type: v.string(),
        id: v.string(),
        title: v.string(),
      })),
      templateInfo: v.optional(v.object({
        templateId: v.string(),
        templateName: v.string(),
        variables: v.record(v.string(), v.string()),
        batchId: v.string(),
      })),
      digestInfo: v.optional(v.object({
        type: v.string(),
        period: v.object({
          start: v.number(),
          end: v.number(),
        }),
        includedMessages: v.array(v.string()),
        stats: v.any(),
      })),
    })),
    _version: v.optional(v.number()),
    _lastSync: v.optional(v.number()),
    _isDirty: v.optional(v.boolean()),
  })
    .index("by_sender", ["senderId"])
    .index("by_type", ["type"])
    .index("by_status", ["status"])
    .index("by_group", ["groupId"])
    .index("by_archived", ["isArchived"])
    .index("by_priority", ["priority"])
    .index("sender_type", ["senderId", "type"])
    .index("type_status", ["type", "status"])
    .index("archived_status", ["isArchived", "status"])
    .index("priority_status", ["priority", "status"]),

  messageGroups: defineTable({
    name: v.string(),
    description: v.optional(v.string()),
    memberIds: v.array(v.id("users")),
    memberNames: v.array(v.string()),
    createdBy: v.id("users"),
    isActive: v.boolean(),
    groupType: v.union(
      v.literal("manual"),
      v.literal("auto"),
      v.literal("role-based")
    ),
    rules: v.optional(v.object({
      roles: v.optional(v.array(v.string())),
      departments: v.optional(v.array(v.string())),
      conditions: v.optional(v.array(v.string())),
    })),
    settings: v.optional(v.object({
      allowSelfJoin: v.optional(v.boolean()),
      requireApproval: v.optional(v.boolean()),
      maxMembers: v.optional(v.number()),
    })),
    // Поля для синхронизации
    _version: v.optional(v.number()),
    _lastSync: v.optional(v.number()),
    _isDirty: v.optional(v.boolean()),
  })
    .index("by_creator", ["createdBy"])
    .index("by_type", ["groupType"])
    .index("by_active", ["isActive"])
    .index("creator_active", ["createdBy", "isActive"])
    .index("type_active", ["groupType", "isActive"])
  ,

  notificationTemplates: defineTable({
    name: v.string(),
    description: v.optional(v.string()),
    type: v.union(
      v.literal("email"),
      v.literal("sms"),
      v.literal("push"),
      v.literal("in-app")
    ),
    subject: v.string(),
    content: v.string(),
    variables: v.array(v.string()),
    isActive: v.boolean(),
    createdBy: v.id("users"),
    category: v.optional(v.string()),
    priority: v.union(
      v.literal("low"),
      v.literal("normal"),
      v.literal("high"),
      v.literal("urgent")
    ),
    settings: v.optional(v.object({
      allowScheduling: v.optional(v.boolean()),
      requireApproval: v.optional(v.boolean()),
      maxRecipients: v.optional(v.number()),
    })),
    // Поля для синхронизации
    _version: v.optional(v.number()),
    _lastSync: v.optional(v.number()),
    _isDirty: v.optional(v.boolean()),
  })
    .index("by_creator", ["createdBy"])
    .index("by_type", ["type"])
    .index("by_active", ["isActive"])
    .index("by_category", ["category"])
    .index("creator_active", ["createdBy", "isActive"])
    .index("type_active", ["type", "isActive"])
    .index("category_active", ["category", "isActive"])
  ,

  drafts: defineTable({
    type: v.union(
      v.literal("direct"),
      v.literal("group"),
      v.literal("announcement")
    ),
    subject: v.optional(v.string()),
    content: v.string(),
    recipientIds: v.array(v.id("users")),
    groupId: v.optional(v.id("messageGroups")),
    priority: v.union(
      v.literal("low"),
      v.literal("normal"),
      v.literal("high"),
      v.literal("urgent")
    ),
    createdBy: v.id("users"),
    scheduledAt: v.optional(v.number()),
    templateId: v.optional(v.id("notificationTemplates")),
    lastModified: v.optional(v.number()),
    // Поля для синхронизации
    _version: v.optional(v.number()),
    _lastSync: v.optional(v.number()),
    _isDirty: v.optional(v.boolean()),
  })
    .index("by_creator", ["createdBy"])
    .index("by_type", ["type"])
    .index("creator_type", ["createdBy", "type"])
  ,

  notifications: defineTable({
    title: v.string(),
    message: v.string(),
    type: v.union(
      v.literal("info"),
      v.literal("warning"),
      v.literal("error"),
      v.literal("success"),
      v.literal("order"),
      v.literal("payment"),
      v.literal("membership"),
      v.literal("training"),
      v.literal("system")
    ),
    recipientId: v.string(),
    recipientType: v.union(
      v.literal("user"),
      v.literal("super-admin"),
      v.literal("admin"),
      v.literal("manager"),
      v.literal("trainer"),
      v.literal("member")
    ),
    relatedId: v.optional(v.string()),
    priority: v.union(
      v.literal("low"),
      v.literal("normal"),
      v.literal("high"),
      v.literal("urgent")
    ),
    isRead: v.boolean(),
    createdAt: v.number(),
    readAt: v.optional(v.number()),
    metadata: v.optional(v.object({
      sourceType: v.optional(v.string()),
      sourceId: v.optional(v.string()),
      data: v.optional(v.any()),
    })),
    // Поля для синхронизации
    _version: v.optional(v.number()),
    _lastSync: v.optional(v.number()),
    _isDirty: v.optional(v.boolean()),
  })
    .index("by_recipient", ["recipientId"])
    .index("by_type", ["type"])
    .index("by_priority", ["priority"])
    .index("by_read_status", ["isRead"])
    .index("by_created_at", ["createdAt"])
    .index("recipient_unread", ["recipientId", "isRead"])
    .index("recipient_type", ["recipientType"])
    .index("type_created", ["type", "createdAt"])
  ,

  products: defineTable({
    name: v.string(),
    description: v.string(),
    category: v.union(
      v.literal("supplements"),
      v.literal("drinks"),
      v.literal("snacks"),
      v.literal("merchandise")
    ),
    price: v.number(),
    imageUrl: v.optional(v.string()),
    inStock: v.number(),
    minStock: v.number(),
    isActive: v.optional(v.boolean()),
    isPopular: v.boolean(),
    isDeleted: v.optional(v.boolean()),
    nutrition: v.optional(v.object({
      calories: v.optional(v.number()),
      protein: v.optional(v.number()),
      carbs: v.optional(v.number()),
      fat: v.optional(v.number()),
      sugar: v.optional(v.number()),
    })),
    createdAt: v.number(),
    updatedAt: v.optional(v.number()),
    // Поля для синхронизации
    _version: v.optional(v.number()),
    _lastSync: v.optional(v.number()),
    _isDirty: v.optional(v.boolean()),
  })
    .index("by_category", ["category"])
    .index("by_popularity", ["isPopular"])
    .index("by_active", ["isActive"])
    .index("by_deleted", ["isDeleted"])
    .index("category_active", ["category", "isActive"])
    .index("active_popular", ["isActive", "isPopular"])
  ,

  orders: defineTable({
    userId: v.optional(v.string()),
    memberId: v.optional(v.string()),
    customerEmail: v.optional(v.string()),
    memberEmail: v.optional(v.string()),
    customerName: v.optional(v.string()),
    memberName: v.optional(v.string()),
    customerPhone: v.optional(v.string()),
    userRole: v.optional(v.string()),
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
    status: v.union(
      v.literal("pending"),
      v.literal("confirmed"),
      v.literal("processing"),
      v.literal("ready"),
      v.literal("completed"),
      v.literal("cancelled")
    ),
    paymentStatus: v.union(
      v.literal("pending"),
      v.literal("paid"),
      v.literal("failed"),
      v.literal("refunded")
    ),
    paymentIntentId: v.optional(v.string()),
    paymentId: v.optional(v.string()),
    paymentMethod: v.optional(v.string()),
    orderTime: v.number(),
    estimatedReadyTime: v.optional(v.number()),
    completedTime: v.optional(v.number()),
    paidAt: v.optional(v.number()),
    // Поля для синхронизации
    _version: v.optional(v.number()),
    _lastSync: v.optional(v.number()),
    _isDirty: v.optional(v.boolean()),
  })
    .index("by_user", ["userId"])
    .index("by_member", ["memberId"])
    .index("by_status", ["status"])
    .index("by_order_time", ["orderTime"])
    .index("by_payment_status", ["paymentStatus"])
    .index("user_status", ["userId", "status"])
    .index("member_status", ["memberId", "status"])
    .index("payment_status_order", ["paymentStatus", "orderTime"])
    .index("by_payment_intent", ["paymentIntentId"])
  ,

  schedule_events: defineTable({
    title: v.string(),
    description: v.optional(v.string()),
    type: v.union(
      v.literal("training"),
      v.literal("consultation"),
      v.literal("group"),
      v.literal("meeting"),
      v.literal("break"),
      v.literal("other")
    ),
    startTime: v.string(),
    endTime: v.string(),
    trainerId: v.id("users"),
    clientId: v.optional(v.id("users")),
    location: v.optional(v.string()),
    notes: v.optional(v.string()),
    status: v.union(
      v.literal("scheduled"),
      v.literal("confirmed"),
      v.literal("completed"),
      v.literal("cancelled"),
      v.literal("no-show")
    ),
    recurring: v.optional(v.object({
      pattern: v.union(v.literal("daily"), v.literal("weekly"), v.literal("monthly")),
      interval: v.number(),
      endDate: v.optional(v.string()),
      daysOfWeek: v.optional(v.array(v.number())),
    })),
    createdAt: v.string(),
    createdBy: v.string(),
    updatedAt: v.optional(v.string()),
    // Поля для синхронизации
    _version: v.optional(v.number()),
    _lastSync: v.optional(v.number()),
    _isDirty: v.optional(v.boolean()),
  })
    .index("by_trainer", ["trainerId"])
    .index("by_client", ["clientId"])
    .index("by_status", ["status"])
    .index("by_start_time", ["startTime"])
    .index("by_type", ["type"])
    .index("trainer_start", ["trainerId", "startTime"])
    .index("trainer_status", ["trainerId", "status"])
  ,

  sessions: defineTable({
    userId: v.optional(v.id("users")),
    duration: v.optional(v.number()),
    pageViews: v.optional(v.number()),
    pages: v.optional(v.array(v.string())),
    userAgent: v.optional(v.string()),
    ipAddress: v.optional(v.string()),
    // Поля для синхронизации
    _version: v.optional(v.number()),
    _lastSync: v.optional(v.number()),
    _isDirty: v.optional(v.boolean()),
  })
    .index("by_user", ["userId"])
  ,

  trainers: defineTable({
    name: v.string(),
    email: v.string(),
    phone: v.string(),
    password: v.optional(v.string()),
    photoUrl: v.optional(v.string()),
    avatar: v.optional(v.string()),
    bio: v.optional(v.string()),
    specializations: v.array(v.string()),
    experience: v.optional(v.number()),
    certifications: v.optional(v.array(v.string())),
    languages: v.optional(v.array(v.string())),
    rating: v.optional(v.number()),
    totalReviews: v.optional(v.number()),
    workingHours: v.optional(v.union(
      v.object({
        monday: v.optional(v.object({ start: v.string(), end: v.string() })),
        tuesday: v.optional(v.object({ start: v.string(), end: v.string() })),
        wednesday: v.optional(v.object({ start: v.string(), end: v.string() })),
        thursday: v.optional(v.object({ start: v.string(), end: v.string() })),
        friday: v.optional(v.object({ start: v.string(), end: v.string() })),
        saturday: v.optional(v.object({ start: v.string(), end: v.string() })),
        sunday: v.optional(v.object({ start: v.string(), end: v.string() })),
      }),
      v.object({
        start: v.string(),
        end: v.string(),
        days: v.array(v.number())
      })
    )),
    hourlyRate: v.optional(v.number()),
    isActive: v.optional(v.boolean()),
    status: v.optional(v.string()),
    role: v.optional(v.string()),
    joinDate: v.optional(v.string()),
    totalClients: v.optional(v.number()),
    activeClients: v.optional(v.number()),
    totalWorkouts: v.optional(v.number()),
    monthlyRevenue: v.optional(v.number()),
    lastActivity: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.optional(v.number()),
    // Поля для синхронизации
    _version: v.optional(v.number()),
    _lastSync: v.optional(v.number()),
    _isDirty: v.optional(v.boolean()),
  })
    .index("by_email", ["email"])
    .index("by_active", ["isActive"])
    .index("by_status", ["status"])
    .index("email_active", ["email", "isActive"])
  ,

  workouts: defineTable({
    trainerId: v.id("trainers"),
    userId: v.id("users"),
    type: v.string(),
    duration: v.optional(v.number()),
    price: v.optional(v.number()),
    status: v.optional(v.string()),
    // Поля для синхронизации
    _version: v.optional(v.number()),
    _lastSync: v.optional(v.number()),
    _isDirty: v.optional(v.boolean()),
  })
    .index("by_trainer", ["trainerId"])
    .index("by_user", ["userId"])
    .index("by_status", ["status"])
    .index("trainer_user", ["trainerId", "userId"])
    .index("trainer_status", ["trainerId", "status"])
  ,

  memberships: defineTable({
    userId: v.id("users"),
    trainerId: v.optional(v.id("trainers")),
    type: v.string(),
    price: v.number(),
    startDate: v.number(),
    expiresAt: v.number(),
    isActive: v.boolean(),
    // Поля для синхронизации
    _version: v.optional(v.number()),
    _lastSync: v.optional(v.number()),
    _isDirty: v.optional(v.boolean()),
  })
    .index("by_user", ["userId"])
    .index("by_trainer", ["trainerId"])
    .index("by_active", ["isActive"])
    .index("by_type", ["type"])
    .index("user_active", ["userId", "isActive"])
    .index("trainer_active", ["trainerId", "isActive"])
  ,

  accessLogs: defineTable({
    userId: v.optional(v.id("users")),
    success: v.boolean(),
    timestamp: v.number(),
    photoUrl: v.optional(v.string()),
    deviceInfo: v.optional(v.string()),
    ipAddress: v.optional(v.string()),
    // Поля для синхронизации
    _version: v.optional(v.number()),
    _lastSync: v.optional(v.number()),
    _isDirty: v.optional(v.boolean()),
  })
    .index("by_timestamp", ["timestamp"])
    .index("by_success", ["success"])
    .index("by_user", ["userId"])
    .index("user_success", ["userId", "success"])
  ,

  logs: defineTable({
    userId: v.string(),
    success: v.boolean(),
    deviceInfo: v.optional(v.string()),
    timestamp: v.number(),
    // Поля для синхронизации
    _version: v.optional(v.number()),
    _lastSync: v.optional(v.number()),
    _isDirty: v.optional(v.boolean()),
  })
    .index("by_user", ["userId"])
    .index("by_timestamp", ["timestamp"])
    .index("by_success", ["success"])
    .index("user_success", ["userId", "success"])
  ,

  events: defineTable({
    title: v.string(),
    description: v.optional(v.string()),
    type: v.string(),
    startTime: v.string(),
    endTime: v.string(),
    trainerId: v.string(),
    trainerName: v.string(),
    clientId: v.optional(v.string()),
    clientName: v.optional(v.string()),
    status: v.string(),
    location: v.optional(v.string()),
    createdBy: v.string(),
    price: v.optional(v.number()),
    duration: v.optional(v.number()),
    notes: v.optional(v.string()),
    goals: v.optional(v.array(v.string())),
    clientRating: v.optional(v.number()),
    clientReview: v.optional(v.string()),
    trainerNotes: v.optional(v.string()),
    clientPhone: v.optional(v.string()),
    clientEmail: v.optional(v.string()),
    // Поля для синхронизации
    _version: v.optional(v.number()),
    _lastSync: v.optional(v.number()),
    _isDirty: v.optional(v.boolean()),
  })
    .index("by_trainer", ["trainerId"])
    .index("by_client", ["clientId"])
    .index("by_status", ["status"])
    .index("by_start_time", ["startTime"])
    .index("by_created_by", ["createdBy"])
    .index("by_type", ["type"])
    .index("trainer_status", ["trainerId", "status"])
    .index("trainer_start", ["trainerId", "startTime"])
  ,

  clients: defineTable({
    name: v.string(),
    email: v.string(),
    phone: v.string(),
    trainerId: v.optional(v.string()),
    trainerName: v.optional(v.string()),
    status: v.union(v.literal("active"), v.literal("trial"), v.literal("inactive")),
    joinDate: v.string(),
    currentProgram: v.optional(v.string()),
    totalWorkouts: v.optional(v.number()),
    progress: v.optional(v.number()),
    lastWorkout: v.optional(v.string()),
    goals: v.optional(v.array(v.string())),
    notes: v.optional(v.string()),
    avatar: v.optional(v.string()),
    birthDate: v.optional(v.string()),
    emergencyContact: v.optional(v.string()),
    emergencyPhone: v.optional(v.string()),
    medicalNotes: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.optional(v.number()),
    // Поля для синхронизации
    _version: v.optional(v.number()),
    _lastSync: v.optional(v.number()),
    _isDirty: v.optional(v.boolean()),
  })
    .index("by_email", ["email"])
    .index("by_trainer", ["trainerId"])
    .index("by_status", ["status"])
    .index("by_phone", ["phone"])
    .index("trainer_status", ["trainerId", "status"])
  ,

  bookings: defineTable({
    memberId: v.id("members"),
    trainerId: v.id("trainers"),
    startTime: v.number(),
    endTime: v.number(),
    duration: v.number(),
    workoutType: v.string(),
    notes: v.optional(v.string()),
    goals: v.optional(v.array(v.string())),
    status: v.string(),
    price: v.number(),
    memberRating: v.optional(v.number()),
    memberReview: v.optional(v.string()),
    trainerNotes: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
    // Поля для синхронизации
    _version: v.optional(v.number()),
    _lastSync: v.optional(v.number()),
    _isDirty: v.optional(v.boolean()),
  })
    .index("by_member", ["memberId"])
    .index("by_trainer", ["trainerId"])
    .index("by_start_time", ["startTime"])
    .index("by_status", ["status"])
    .index("by_workout_type", ["workoutType"])
    .index("member_status", ["memberId", "status"])
    .index("trainer_status", ["trainerId", "status"])
    .index("trainer_start", ["trainerId", "startTime"])
  ,

  visits: defineTable({
    memberId: v.id("members"),
    timestamp: v.number(),
    success: v.boolean(),
    deviceInfo: v.optional(v.string()),
    ipAddress: v.optional(v.string()),
    photoUrl: v.optional(v.string()),
    visitType: v.string(),
    reason: v.optional(v.string()),
    duration: v.optional(v.number()),
    areas: v.optional(v.array(v.string())),
    // Поля для синхронизации
    _version: v.optional(v.number()),
    _lastSync: v.optional(v.number()),
    _isDirty: v.optional(v.boolean()),
  })
    .index("by_member", ["memberId"])
    .index("by_timestamp", ["timestamp"])
    .index("by_success", ["success"])
    .index("by_visit_type", ["visitType"])
    .index("member_success", ["memberId", "success"])
    .index("member_type", ["memberId", "visitType"])
  ,

  classes: defineTable({
    name: v.string(),
    description: v.optional(v.string()),
    instructorId: v.id("trainers"),
    startTime: v.number(),
    endTime: v.number(),
    location: v.string(),
    capacity: v.number(),
    enrolled: v.array(v.id("members")),
    waitlist: v.optional(v.array(v.id("members"))),
    difficulty: v.string(),
    equipment: v.optional(v.array(v.string())),
    price: v.number(),
    isRecurring: v.boolean(),
    recurringPattern: v.optional(v.string()),
    status: v.string(),
    createdAt: v.number(),
    // Поля для синхронизации
    _version: v.optional(v.number()),
    _lastSync: v.optional(v.number()),
    _isDirty: v.optional(v.boolean()),
  })
    .index("by_instructor", ["instructorId"])
    .index("by_start_time", ["startTime"])
    .index("by_status", ["status"])
    .index("by_difficulty", ["difficulty"])
    .index("by_recurring", ["isRecurring"])
    .index("instructor_status", ["instructorId", "status"])
    .index("instructor_start", ["instructorId", "startTime"])
  ,

  programBookings: defineTable({
    memberId: v.id("members"),
    programId: v.string(),
    programTitle: v.string(),
    sessionIndex: v.number(),
    sessionType: v.string(),
    instructor: v.string(),
    startTime: v.number(),
    endTime: v.number(),
    duration: v.number(),
    price: v.number(),
    status: v.string(),
    notes: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
    // Поля для синхронизации
    _version: v.optional(v.number()),
    _lastSync: v.optional(v.number()),
    _isDirty: v.optional(v.boolean()),
  })
    .index("by_member", ["memberId"])
    .index("by_program", ["programId"])
    .index("by_start_time", ["startTime"])
    .index("by_status", ["status"])
    .index("by_session_type", ["sessionType"])
    .index("member_status", ["memberId", "status"])
    .index("program_status", ["programId", "status"])
  ,

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
    // Поля для синхронизации
    _version: v.optional(v.number()),
    _lastSync: v.optional(v.number()),
    _isDirty: v.optional(v.boolean()),
  })
    .index("by_member", ["memberId"])
    .index("by_status", ["status"])
    .index("by_purchase_date", ["purchaseDate"])
    .index("by_type", ["type"])
    .index("by_payment_method", ["paymentMethod"])
    .index("member_status", ["memberId", "status"])
    .index("type_status", ["type", "status"])
  ,

  userBookings: defineTable({
    userId: v.id("users"),
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
    memberRating: v.optional(v.number()),
    memberReview: v.optional(v.string()),
    trainerNotes: v.optional(v.string()),
    // Поля для синхронизации
    _version: v.optional(v.number()),
    _lastSync: v.optional(v.number()),
    _isDirty: v.optional(v.boolean()),
  })
    .index("by_user", ["userId"])
    .index("by_trainer", ["trainerId"])
    .index("by_start_time", ["startTime"])
    .index("by_status", ["status"])
    .index("by_workout_type", ["workoutType"])
    .index("user_status", ["userId", "status"])
    .index("trainer_status", ["trainerId", "status"])
    .index("user_start", ["userId", "startTime"])
  ,

  membershipPlans: defineTable({
    name: v.string(),
    type: v.string(),
    duration: v.number(),
    price: v.number(),
    description: v.optional(v.string()),
    features: v.array(v.string()),
    isActive: v.boolean(),
    createdAt: v.number(),
    // Поля для синхронизации
    _version: v.optional(v.number()),
    _lastSync: v.optional(v.number()),
    _isDirty: v.optional(v.boolean()),
  })
    .index("by_type", ["type"])
    .index("by_active", ["isActive"])
    .index("type_active", ["type", "isActive"])
  ,

  staff: defineTable({
    name: v.string(),
    email: v.string(),
    password: v.string(),
    role: v.union(
      v.literal("admin"),
      v.literal("super-admin"),
      v.literal("manager"),
      v.literal("trainer")
    ),
    phone: v.optional(v.string()),
    isActive: v.optional(v.boolean()),
    createdAt: v.number(),
    updatedAt: v.optional(v.number()),
    lastLoginAt: v.optional(v.number()),
    resetPasswordToken: v.optional(v.string()),
    resetPasswordExpires: v.optional(v.number()),
    resetPasswordRequestedAt: v.optional(v.number()),
    passwordChangedAt: v.optional(v.number()),
    // Поля для синхронизации
    _version: v.optional(v.number()),
    _lastSync: v.optional(v.number()),
    _isDirty: v.optional(v.boolean()),
  })
    .index("by_email", ["email"])
    .index("by_reset_token", ["resetPasswordToken"])
    .index("by_role", ["role"])
    .index("by_active", ["isActive"])
    .index("role_active", ["role", "isActive"])
  ,

  members: defineTable({
    name: v.string(),
    email: v.string(),
    password: v.string(),
    phone: v.optional(v.string()),
    isActive: v.optional(v.boolean()),
    createdAt: v.number(),
    updatedAt: v.optional(v.number()),
    lastLoginAt: v.optional(v.number()),
    resetPasswordToken: v.optional(v.string()),
    resetPasswordExpires: v.optional(v.number()),
    resetPasswordRequestedAt: v.optional(v.number()),
    passwordChangedAt: v.optional(v.number()),
    membershipType: v.optional(v.string()),
    membershipStart: v.optional(v.number()),
    membershipExpiry: v.optional(v.number()),
    emergencyContact: v.optional(v.string()),
    emergencyPhone: v.optional(v.string()),
    medicalNotes: v.optional(v.string()),
    birthDate: v.optional(v.number()),
    status: v.optional(v.string()),
    preferredTrainers: v.optional(v.array(v.id("trainers"))),
    fitnessGoals: v.optional(v.array(v.string())),
    workoutPreferences: v.optional(v.array(v.string())),
    joinDate: v.optional(v.number()),
    lastVisit: v.optional(v.number()),
    photoUrl: v.optional(v.string()),
    faceDescriptor: v.optional(v.array(v.number())),
    role: v.optional(v.string()),
    membership: v.optional(v.object({
      type: v.string(),
      purchaseId: v.string(),
      startDate: v.number(),
      endDate: v.number(),
      sessionsRemaining: v.number(),
      status: v.string(),
    })),
    // Поля для синхронизации
    _version: v.optional(v.number()),
    _lastSync: v.optional(v.number()),
    _isDirty: v.optional(v.boolean()),
  })
    .index("by_email", ["email"])
    .index("by_phone", ["phone"])
    .index("by_status", ["status"])
    .index("by_membership_type", ["membershipType"])
    .index("by_reset_token", ["resetPasswordToken"])
    .index("status_membership", ["status", "membershipType"])
    .index("by_active", ["isActive"])
  ,

  passwordResetLogs: defineTable({
    userId: v.string(),
    userType: v.union(v.literal("staff"), v.literal("member")),
    email: v.string(),
    action: v.union(
      v.literal("requested"),
      v.literal("completed"),
      v.literal("failed"),
      v.literal("expired")
    ),
    ipAddress: v.optional(v.string()),
    userAgent: v.optional(v.string()),
    timestamp: v.number(),
    details: v.optional(v.string()),
    // Поля для синхронизации
    _version: v.optional(v.number()),
    _lastSync: v.optional(v.number()),
    _isDirty: v.optional(v.boolean()),
  })
    .index("by_user", ["userId"])
    .index("by_email", ["email"])
    .index("by_timestamp", ["timestamp"])
    .index("by_user_type", ["userType"])
    .index("by_action", ["action"])
    .index("user_type_action", ["userId", "userType", "action"])
    .index("email_action", ["email", "action"])
    .index("timestamp_action", ["timestamp", "action"])
  ,

  systemSettings: defineTable({
    key: v.string(),
    value: v.any(),
    type: v.string(),
    category: v.string(),
    description: v.optional(v.string()),
    isPublic: v.optional(v.boolean()),
    updatedBy: v.optional(v.string()),
    updatedAt: v.number(),
    createdAt: v.number(),
    // Поля для синхронизации
    _version: v.optional(v.number()),
    _lastSync: v.optional(v.number()),
    _isDirty: v.optional(v.boolean()),
  })
    .index("by_key", ["key"])
    .index("by_category", ["category"])
    .index("by_type", ["type"])
    .index("by_public", ["isPublic"])
    .index("category_type", ["category", "type"])
  ,

  auditLogs: defineTable({
    userId: v.string(),
    userName: v.string(),
    userRole: v.string(),
    action: v.string(),
    resource: v.string(),
    resourceId: v.optional(v.string()),
    details: v.optional(v.object({
      before: v.optional(v.any()),
      after: v.optional(v.any()),
      changes: v.optional(v.array(v.string()))
    })),
    ipAddress: v.optional(v.string()),
    userAgent: v.optional(v.string()),
    timestamp: v.number(),
    // Поля для синхронизации
    _version: v.optional(v.number()),
    _lastSync: v.optional(v.number()),
    _isDirty: v.optional(v.boolean()),
  })
    .index("by_user", ["userId"])
    .index("by_action", ["action"])
    .index("by_resource", ["resource"])
    .index("by_timestamp", ["timestamp"])
    .index("by_user_role", ["userRole"])
    .index("user_action", ["userId", "action"])
    .index("resource_action", ["resource", "action"])
    .index("user_resource", ["userId", "resource"])
  ,

  // Новые таблицы для синхронизации
  syncLog: defineTable({
    entityType: v.union(
      v.literal("messages"),
      v.literal("users"),
      v.literal("trainers"),
      v.literal("clients"),
      v.literal("events"),
      v.literal("schedule_events"),
      v.literal("products"),
      v.literal("orders"),
      v.literal("bookings"),
      v.literal("members"),
      v.literal("staff"),
      v.literal("notifications"),
      v.literal("classes"),
      v.literal("visits"),
      v.literal("purchases"),
      v.literal("workouts"),
      v.literal("memberships"),
      v.literal("global")
    ),
    entityId: v.string(),
    action: v.union(
      v.literal("create"),
      v.literal("update"),
      v.literal("delete"),
      v.literal("conflict"),
      v.literal("sync")
    ),
    userId: v.string(), // Изменено с v.id("users") для гибкости
    timestamp: v.number(),
    oldData: v.optional(v.any()),
    newData: v.optional(v.any()),
    conflictResolution: v.optional(v.union(
      v.literal("server"),
      v.literal("client"),
      v.literal("manual")
    )),
    metadata: v.optional(v.record(v.string(), v.any())),
    syncSource: v.optional(v.union(
      v.literal("convex"),
      v.literal("api"),
      v.literal("client")
    )),
    batchId: v.optional(v.string()),
    retryCount: v.optional(v.number()),
    errorMessage: v.optional(v.string()),
  })
    .index("by_entity", ["entityType", "entityId"])
    .index("by_user", ["userId"])
    .index("by_timestamp", ["timestamp"])
    .index("by_action", ["action"])
    .index("by_batch", ["batchId"])
    .index("entity_timestamp", ["entityType", "timestamp"])
    .index("user_timestamp", ["userId", "timestamp"])
    .index("action_timestamp", ["action", "timestamp"])
    .index("entity_action", ["entityType", "action"])
    .index("user_action", ["userId", "action"]),

  syncStatus: defineTable({
    entityType: v.union(
      v.literal("messages"),
      v.literal("users"),
      v.literal("trainers"),
      v.literal("clients"),
      v.literal("events"),
      v.literal("schedule_events"),
      v.literal("products"),
      v.literal("orders"),
      v.literal("bookings"),
      v.literal("members"),
      v.literal("staff"),
      v.literal("notifications"),
      v.literal("classes"),
      v.literal("visits"),
      v.literal("purchases"),
      v.literal("workouts"),
      v.literal("memberships"),
      v.literal("global")
    ),
    lastSyncTime: v.number(),
    totalRecords: v.number(),
    syncedRecords: v.number(),
    pendingRecords: v.number(),
    conflictedRecords: v.number(),
    errorCount: v.number(),
    isHealthy: v.boolean(),
    lastError: v.optional(v.string()),
    avgSyncTime: v.optional(v.number()),
    metadata: v.optional(v.record(v.string(), v.any())),
  })
    .index("by_entity", ["entityType"])
    .index("by_health", ["isHealthy"])
    .index("by_last_sync", ["lastSyncTime"])
    .index("entity_health", ["entityType", "isHealthy"]),

  conflictResolution: defineTable({
    entityType: v.union(
      v.literal("messages"),
      v.literal("users"),
      v.literal("trainers"),
      v.literal("clients"),
      v.literal("events"),
      v.literal("schedule_events"),
      v.literal("products"),
      v.literal("orders"),
      v.literal("bookings"),
      v.literal("members"),
      v.literal("staff"),
      v.literal("notifications"),
      v.literal("classes"),
      v.literal("visits"),
      v.literal("purchases"),
      v.literal("workouts"),
      v.literal("memberships"),
      v.literal("global")
    ),
    entityId: v.string(),
    conflictType: v.union(
      v.literal("version_mismatch"),
      v.literal("concurrent_update"),
      v.literal("data_inconsistency"),
      v.literal("field_conflict"),
      v.literal("deletion_conflict"),  // Добавить
      v.literal("creation_conflict"),  // Добавить
      v.literal("permission_conflict") // Добавить
    ),
    serverData: v.any(),
    clientData: v.any(),
    conflictFields: v.array(v.string()),
    priority: v.union(
      v.literal("low"),
      v.literal("medium"),
      v.literal("high"),
      v.literal("critical")
    ),
    resolution: v.optional(v.union(
      v.literal("manual"),
      v.literal("server_wins"),
      v.literal("client_wins"),
      v.literal("merge"),
      v.literal("server"),  // Добавить для совместимости
      v.literal("client")   // Добавить для совместимости
    )),
    resolvedData: v.optional(v.any()),
    resolvedBy: v.optional(v.string()),
    resolvedAt: v.optional(v.number()),
    notes: v.optional(v.string()),
    createdAt: v.number(),
    isResolved: v.boolean(),
    metadata: v.optional(v.record(v.string(), v.any()))
  })
    .index("by_entity", ["entityType"])
    .index("by_resolved", ["isResolved"])
    .index("by_priority", ["priority"])
    .index("by_created", ["createdAt"])
    .index("entity_resolved", ["entityType", "isResolved"])
    .index("priority_resolved", ["priority", "isResolved"]),

  syncBatches: defineTable({
    batchId: v.string(),
    entityType: v.union(
      v.literal("messages"),
      v.literal("users"),
      v.literal("trainers"),
      v.literal("clients"),
      v.literal("events"),
      v.literal("schedule_events"),
      v.literal("products"),
      v.literal("orders"),
      v.literal("bookings"),
      v.literal("members"),
      v.literal("staff"),
      v.literal("notifications"),
      v.literal("classes"),
      v.literal("visits"),
      v.literal("purchases"),
      v.literal("workouts"),
      v.literal("memberships"),
      v.literal("global")
    ),
    operation: v.union(
      v.literal("full_sync"),
      v.literal("incremental_sync"),
      v.literal("conflict_resolution"),
      v.literal("cleanup")
    ),
    status: v.union(
      v.literal("pending"),
      v.literal("running"),
      v.literal("completed"),
      v.literal("failed"),
      v.literal("cancelled")
    ),
    startedAt: v.number(),
    completedAt: v.optional(v.number()),
    totalRecords: v.number(),
    processedRecords: v.number(),
    successfulRecords: v.number(),
    failedRecords: v.number(),
    conflictedRecords: v.number(),
    errors: v.optional(v.array(v.object({
      recordId: v.string(),
      error: v.string(),
      timestamp: v.number()
    }))),
    initiatedBy: v.string(),
    metadata: v.optional(v.record(v.string(), v.any())),
  })
    .index("by_batch_id", ["batchId"])
    .index("by_entity", ["entityType"])
    .index("by_status", ["status"])
    .index("by_operation", ["operation"])
    .index("by_started", ["startedAt"])
    .index("entity_status", ["entityType", "status"])
    .index("operation_status", ["operation", "status"])
    .index("initiated_by", ["initiatedBy"]),

  // Таблица для кэширования и оптимизации
  dataCache: defineTable({
    cacheKey: v.string(),
    entityType: v.optional(v.union(
      v.literal("messages"),
      v.literal("users"),
      v.literal("trainers"),
      v.literal("clients"),
      v.literal("events"),
      v.literal("schedule_events"),
      v.literal("products"),
      v.literal("orders"),
      v.literal("bookings"),
      v.literal("members"),
      v.literal("staff"),
      v.literal("notifications"),
      v.literal("classes"),
      v.literal("visits"),
      v.literal("purchases"),
      v.literal("workouts"),
      v.literal("memberships"),
      v.literal("global")
    )),
    data: v.any(),
    expiresAt: v.number(),
    createdAt: v.number(),
    accessCount: v.number(),
    lastAccessed: v.number(),
    tags: v.optional(v.array(v.string())),
    metadata: v.optional(v.record(v.string(), v.any())),
  })
    .index("by_key", ["cacheKey"])
    .index("by_entity", ["entityType"])
    .index("by_expires", ["expiresAt"])
    .index("by_created", ["createdAt"])
    .index("by_last_accessed", ["lastAccessed"])
    .index("entity_expires", ["entityType", "expiresAt"]),

  // Таблица для метрик и аналитики синхронизации
  syncMetrics: defineTable({
    entityType: v.union(
      v.literal("messages"),
      v.literal("users"),
      v.literal("trainers"),
      v.literal("clients"),
      v.literal("events"),
      v.literal("schedule_events"),
      v.literal("products"),
      v.literal("orders"),
      v.literal("bookings"),
      v.literal("members"),
      v.literal("staff"),
      v.literal("notifications"),
      v.literal("classes"),
      v.literal("visits"),
      v.literal("purchases"),
      v.literal("workouts"),
      v.literal("memberships"),
      v.literal("global")
    ),
    metricType: v.union(
      v.literal("sync_duration"),
      v.literal("record_count"),
      v.literal("error_rate"),
      v.literal("conflict_rate"),
      v.literal("throughput"),
      v.literal("latency")
    ),
    value: v.number(),
    timestamp: v.number(),
    timeWindow: v.union(
      v.literal("minute"),
      v.literal("hour"),
      v.literal("day"),
      v.literal("week"),
      v.literal("month")
    ),
    metadata: v.optional(v.record(v.string(), v.any())),
  })
    .index("by_entity", ["entityType"])
    .index("by_metric", ["metricType"])
    .index("by_timestamp", ["timestamp"])
    .index("by_time_window", ["timeWindow"])
    .index("entity_metric", ["entityType", "metricType"])
    .index("metric_timestamp", ["metricType", "timestamp"])
    .index("entity_timestamp", ["entityType", "timestamp"]),

  // Таблица для конфигурации синхронизации
  syncConfiguration: defineTable({
    entityType: v.union(
      v.literal("messages"),
      v.literal("users"),
      v.literal("trainers"),
      v.literal("clients"),
      v.literal("events"),
      v.literal("schedule_events"),
      v.literal("products"),
      v.literal("orders"),
      v.literal("bookings"),
      v.literal("members"),
      v.literal("staff"),
      v.literal("notifications"),
      v.literal("classes"),
      v.literal("visits"),
      v.literal("purchases"),
      v.literal("workouts"),
      v.literal("memberships"),
      v.literal("global")
    ),
    syncEnabled: v.boolean(),
    syncInterval: v.number(), // в миллисекундах
    batchSize: v.number(),
    maxRetries: v.number(),
    retryDelay: v.number(),
    conflictResolutionStrategy: v.union(
      v.literal("server_wins"),
      v.literal("client_wins"),
      v.literal("last_write_wins"),
      v.literal("manual")
    ),
    priority: v.union(
      v.literal("low"),
      v.literal("normal"),
      v.literal("high"),
      v.literal("critical")
    ),
    enableRealTimeSync: v.boolean(),
    enableConflictDetection: v.boolean(),
    enableMetrics: v.boolean(),
    customRules: v.optional(v.array(v.object({
      field: v.string(),
      rule: v.string(),
      value: v.any()
    }))),
    updatedBy: v.string(),
    updatedAt: v.number(),
    metadata: v.optional(v.record(v.string(), v.any())),
  })
    .index("by_entity", ["entityType"])
    .index("by_enabled", ["syncEnabled"])
    .index("by_priority", ["priority"])
    .index("by_updated", ["updatedAt"])
    .index("enabled_priority", ["syncEnabled", "priority"]),

  // Таблица для отслеживания активных соединений и сессий
  activeSessions: defineTable({
    sessionId: v.string(),
    userId: v.string(),
    userType: v.union(
      v.literal("staff"),
      v.literal("member"),
      v.literal("trainer"),
      v.literal("admin")
    ),
    deviceInfo: v.optional(v.string()),
    ipAddress: v.optional(v.string()),
    userAgent: v.optional(v.string()),
    startedAt: v.number(),
    endedAt: v.optional(v.number()),
    lastActivity: v.number(),
    isActive: v.boolean(),
    syncStatus: v.object({
      isConnected: v.boolean(),
      lastSync: v.number(),
      pendingOperations: v.number(),
      errorCount: v.number()
    }),
    capabilities: v.optional(v.array(v.string())),
    metadata: v.optional(v.record(v.string(), v.any()))
  })
    .index("by_session_id", ["sessionId"])
    .index("by_user_id", ["userId"])
    .index("by_active", ["isActive"])
    .index("user_active", ["userId", "isActive"])
    .index("type_active", ["userType", "isActive"])
    .index("by_last_activity", ["lastActivity"]),

  // Таблица для планировщика задач синхронизации
  syncSchedule: defineTable({
    taskId: v.string(),
    taskType: v.union(
      v.literal("full_sync"),
      v.literal("incremental_sync"),
      v.literal("cleanup"),
      v.literal("metrics_collection"),
      v.literal("conflict_resolution"),
      v.literal("health_check")
    ),
    entityType: v.optional(v.union(
      v.literal("messages"),
      v.literal("users"),
      v.literal("trainers"),
      v.literal("clients"),
      v.literal("events"),
      v.literal("schedule_events"),
      v.literal("products"),
      v.literal("orders"),
      v.literal("bookings"),
      v.literal("members"),
      v.literal("staff"),
      v.literal("notifications"),
      v.literal("classes"),
      v.literal("visits"),
      v.literal("purchases"),
      v.literal("workouts"),
      v.literal("memberships"),
      v.literal("global")
    )),
    scheduledAt: v.number(),
    status: v.union(
      v.literal("pending"),
      v.literal("running"),
      v.literal("completed"),
      v.literal("failed"),
      v.literal("cancelled"),
      v.literal("skipped")
    ),
    priority: v.union(
      v.literal("low"),
      v.literal("normal"),
      v.literal("high"),
      v.literal("urgent")
    ),
    recurring: v.optional(v.object({
      pattern: v.union(
        v.literal("once"),
        v.literal("hourly"),
        v.literal("daily"),
        v.literal("weekly"),
        v.literal("monthly")
      ),
      interval: v.number(),
      endDate: v.optional(v.number())
    })),
    parameters: v.optional(v.record(v.string(), v.any())),
    createdBy: v.string(),
    createdAt: v.number(),
    executedAt: v.optional(v.number()),
    completedAt: v.optional(v.number()),
    result: v.optional(v.object({
      success: v.boolean(),
      recordsProcessed: v.number(),
      errors: v.optional(v.array(v.string())),
      duration: v.number(),
      metadata: v.optional(v.record(v.string(), v.any()))
    }))
  })
    .index("by_task_id", ["taskId"])
    .index("by_task_type", ["taskType"])
    .index("by_status", ["status"])
    .index("by_priority", ["priority"])
    .index("by_entity", ["entityType"])
    .index("type_status", ["taskType", "status"])
    .index("entity_status", ["entityType", "status"])
    .index("status_scheduled", ["status", "scheduledAt"])
    .index("by_scheduled", ["scheduledAt"])
    .index("by_created", ["createdAt"])
});



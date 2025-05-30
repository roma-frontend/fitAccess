// convex/schema.ts (окончательная исправленная версия)
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    email: v.string(),
    password: v.string(),
    name: v.string(),
    firstName: v.optional(v.string()), // Добавляем для совместимости
    lastName: v.optional(v.string()), // Добавляем для совместимости
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
  })
    .index("by_email", ["email"])
    .index("by_role", ["role"])
    .index("by_active", ["isActive"])
    .index("by_face_recognition", ["faceRecognitionEnabled"]),

  // Продукты - полная совместимость
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
  })
    .index("by_category", ["category"])
    .index("by_popularity", ["isPopular"])
    .index("by_active", ["isActive"]),

  // Заказы - полная схема с всеми полями
  orders: defineTable({
    userId: v.optional(v.id("users")),
    memberId: v.optional(v.string()),
    items: v.optional(v.array(v.object({
      productId: v.union(v.id("products"), v.string()),
      productName: v.optional(v.string()),
      name: v.optional(v.string()),
      quantity: v.optional(v.number()),
      price: v.optional(v.number()),
      totalPrice: v.optional(v.number()), // Добавляем totalPrice в items
    }))),
    totalPrice: v.optional(v.number()),
    totalAmount: v.optional(v.number()),
    total: v.optional(v.number()),
    amount: v.optional(v.number()),
    status: v.optional(v.string()),
    pickupType: v.optional(v.string()),
    paymentMethod: v.optional(v.string()),
    notes: v.optional(v.string()),
    orderTime: v.number(),
    estimatedReadyTime: v.optional(v.number()),
    completedTime: v.optional(v.number()),
    paymentIntentId: v.optional(v.string()),
    paymentId: v.optional(v.string()),
    paymentStatus: v.optional(v.string()),
    paidAt: v.optional(v.number()),
  })
    .index("by_user", ["userId"])
    .index("by_member", ["memberId"])
    .index("by_status", ["status"])
    .index("by_order_time", ["orderTime"]),

  // Сессии для analytics
  sessions: defineTable({
    userId: v.optional(v.id("users")),
    duration: v.optional(v.number()),
    pageViews: v.optional(v.number()),
    pages: v.optional(v.array(v.string())),
    userAgent: v.optional(v.string()),
    ipAddress: v.optional(v.string()),
  })
    .index("by_user", ["userId"]),

  // Остальные таблицы...
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
  })
    .index("by_email", ["email"])
    .index("by_active", ["isActive"]),

  workouts: defineTable({
    trainerId: v.id("trainers"),
    userId: v.id("users"),
    type: v.string(),
    duration: v.optional(v.number()),
    price: v.optional(v.number()),
    status: v.optional(v.string()),
  })
    .index("by_trainer", ["trainerId"])
    .index("by_user", ["userId"]),

  memberships: defineTable({
    userId: v.id("users"),
    trainerId: v.optional(v.id("trainers")),
    type: v.string(),
    price: v.number(),
    startDate: v.number(),
    expiresAt: v.number(),
    isActive: v.boolean(),
  })
    .index("by_user", ["userId"])
    .index("by_trainer", ["trainerId"])
    .index("by_active", ["isActive"]),

  members: defineTable({
    name: v.string(),
    email: v.optional(v.string()),
    phone: v.string(),
    password: v.optional(v.string()),
    role: v.optional(v.string()),
    photoUrl: v.optional(v.string()),
    faceDescriptor: v.optional(v.array(v.number())),
    membershipType: v.string(),
    membershipStart: v.number(),
    membershipExpiry: v.number(),
    emergencyContact: v.optional(v.string()),
    emergencyPhone: v.optional(v.string()),
    medicalNotes: v.optional(v.string()),
    birthDate: v.optional(v.number()),
    status: v.string(),
    preferredTrainers: v.optional(v.array(v.id("trainers"))),
    fitnessGoals: v.optional(v.array(v.string())),
    workoutPreferences: v.optional(v.array(v.string())),
    joinDate: v.number(),
    createdAt: v.number(),
    lastVisit: v.optional(v.number()),
    updatedAt: v.optional(v.number()),
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
})
  .index("by_trainer", ["trainerId"])
  .index("by_client", ["clientId"])
  .index("by_status", ["status"])
  .index("by_start_time", ["startTime"])
  .index("by_created_by", ["createdBy"]),

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
})
  .index("by_email", ["email"])
  .index("by_trainer", ["trainerId"])
  .index("by_status", ["status"]),

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
})
  .index("by_member", ["memberId"])
  .index("by_trainer", ["trainerId"])
  .index("by_start_time", ["startTime"])
  .index("by_status", ["status"]),

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
})
  .index("by_member", ["memberId"])
  .index("by_timestamp", ["timestamp"]),

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
})
  .index("by_instructor", ["instructorId"])
  .index("by_start_time", ["startTime"])
  .index("by_status", ["status"]),

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
}),

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
})
  .index("by_user", ["userId"])
  .index("by_trainer", ["trainerId"])
  .index("by_start_time", ["startTime"])
  .index("by_status", ["status"]),

notifications: defineTable({
  recipientId: v.string(),
  recipientType: v.string(),
  title: v.string(),
  message: v.string(),
  type: v.string(),
  isRead: v.boolean(),
  isImportant: v.optional(v.boolean()),
  relatedId: v.optional(v.string()),
  actionUrl: v.optional(v.string()),
  createdAt: v.number(),
  readAt: v.optional(v.number()),
})
  .index("by_recipient", ["recipientId"])
  .index("by_type", ["type"])
  .index("by_created", ["createdAt"]),

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

messages: defineTable({
  senderId: v.string(),
  senderName: v.string(),
  senderRole: v.string(),
  recipientId: v.optional(v.string()),
  recipientName: v.optional(v.string()),
  recipientRole: v.optional(v.string()),
  subject: v.string(),
  content: v.string(),
  type: v.string(),
  priority: v.optional(v.string()),
  relatedTo: v.optional(v.object({
    type: v.string(),
    id: v.string(),
    title: v.optional(v.string())
  })),
  status: v.string(),
  isRead: v.optional(v.boolean()),
  readAt: v.optional(v.number()),
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
})
  .index("by_key", ["key"])
  .index("by_category", ["category"]),

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
})
  .index("by_user", ["userId"])
  .index("by_action", ["action"])
  .index("by_resource", ["resource"])
  .index("by_timestamp", ["timestamp"]),
});

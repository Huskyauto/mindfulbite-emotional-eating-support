import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, boolean, json, decimal } from "drizzle-orm/mysql-core";

// Core user table backing auth flow
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
  // Gamification fields
  points: int("points").default(0).notNull(),
  level: int("level").default(1).notNull(),
  currentStreak: int("currentStreak").default(0).notNull(),
  longestStreak: int("longestStreak").default(0).notNull(),
  lastCheckInDate: timestamp("lastCheckInDate"),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// Daily mood and hunger check-ins
export const checkIns = mysqlTable("check_ins", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  mood: mysqlEnum("mood", ["great", "good", "okay", "low", "struggling"]).notNull(),
  moodEmoji: varchar("moodEmoji", { length: 10 }),
  hungerLevel: int("hungerLevel").notNull(), // 1-10 scale
  emotions: json("emotions").$type<string[]>(), // Array of selected emotions
  triggers: json("triggers").$type<string[]>(), // Array of identified triggers
  notes: text("notes"),
  isEmotionalEating: boolean("isEmotionalEating").default(false),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type CheckIn = typeof checkIns.$inferSelect;
export type InsertCheckIn = typeof checkIns.$inferInsert;

// AI Chat conversations
export const chatConversations = mysqlTable("chat_conversations", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  title: varchar("title", { length: 255 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ChatConversation = typeof chatConversations.$inferSelect;
export type InsertChatConversation = typeof chatConversations.$inferInsert;

// Chat messages
export const chatMessages = mysqlTable("chat_messages", {
  id: int("id").autoincrement().primaryKey(),
  conversationId: int("conversationId").notNull(),
  role: mysqlEnum("role", ["user", "assistant"]).notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ChatMessage = typeof chatMessages.$inferSelect;
export type InsertChatMessage = typeof chatMessages.$inferInsert;

// Journal entries
export const journalEntries = mysqlTable("journal_entries", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  title: varchar("title", { length: 255 }),
  content: text("content").notNull(),
  mood: mysqlEnum("mood", ["great", "good", "okay", "low", "struggling"]),
  emotions: json("emotions").$type<string[]>(),
  triggers: json("triggers").$type<string[]>(),
  reflectionPrompt: text("reflectionPrompt"),
  insights: text("insights"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type JournalEntry = typeof journalEntries.$inferSelect;
export type InsertJournalEntry = typeof journalEntries.$inferInsert;

// Meditation sessions completed
export const meditationSessions = mysqlTable("meditation_sessions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  meditationType: varchar("meditationType", { length: 100 }).notNull(),
  durationMinutes: int("durationMinutes").notNull(),
  completed: boolean("completed").default(true).notNull(),
  stressBefore: int("stressBefore"), // 1-10
  stressAfter: int("stressAfter"), // 1-10
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type MeditationSession = typeof meditationSessions.$inferSelect;
export type InsertMeditationSession = typeof meditationSessions.$inferInsert;

// User achievements/badges
export const achievements = mysqlTable("achievements", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  achievementType: varchar("achievementType", { length: 100 }).notNull(),
  achievementName: varchar("achievementName", { length: 255 }).notNull(),
  description: text("description"),
  iconName: varchar("iconName", { length: 100 }),
  earnedAt: timestamp("earnedAt").defaultNow().notNull(),
});

export type Achievement = typeof achievements.$inferSelect;
export type InsertAchievement = typeof achievements.$inferInsert;

// User habits/goals
export const habits = mysqlTable("habits", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  frequency: mysqlEnum("frequency", ["daily", "weekly", "custom"]).default("daily").notNull(),
  targetCount: int("targetCount").default(1).notNull(),
  currentCount: int("currentCount").default(0).notNull(),
  reminderTime: varchar("reminderTime", { length: 10 }), // HH:MM format
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Habit = typeof habits.$inferSelect;
export type InsertHabit = typeof habits.$inferInsert;

// Habit completion logs
export const habitLogs = mysqlTable("habit_logs", {
  id: int("id").autoincrement().primaryKey(),
  habitId: int("habitId").notNull(),
  userId: int("userId").notNull(),
  completedAt: timestamp("completedAt").defaultNow().notNull(),
  notes: text("notes"),
});

export type HabitLog = typeof habitLogs.$inferSelect;
export type InsertHabitLog = typeof habitLogs.$inferInsert;

// Community posts
export const communityPosts = mysqlTable("community_posts", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  content: text("content").notNull(),
  isAnonymous: boolean("isAnonymous").default(false).notNull(),
  likesCount: int("likesCount").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type CommunityPost = typeof communityPosts.$inferSelect;
export type InsertCommunityPost = typeof communityPosts.$inferInsert;

// Post likes
export const postLikes = mysqlTable("post_likes", {
  id: int("id").autoincrement().primaryKey(),
  postId: int("postId").notNull(),
  userId: int("userId").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type PostLike = typeof postLikes.$inferSelect;
export type InsertPostLike = typeof postLikes.$inferInsert;

// Weekly challenges
export const challenges = mysqlTable("challenges", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description").notNull(),
  challengeType: varchar("challengeType", { length: 100 }).notNull(),
  targetCount: int("targetCount").notNull(),
  pointsReward: int("pointsReward").notNull(),
  startDate: timestamp("startDate").notNull(),
  endDate: timestamp("endDate").notNull(),
  isActive: boolean("isActive").default(true).notNull(),
});

export type Challenge = typeof challenges.$inferSelect;
export type InsertChallenge = typeof challenges.$inferInsert;

// User challenge progress
export const userChallenges = mysqlTable("user_challenges", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  challengeId: int("challengeId").notNull(),
  currentProgress: int("currentProgress").default(0).notNull(),
  completed: boolean("completed").default(false).notNull(),
  completedAt: timestamp("completedAt"),
  joinedAt: timestamp("joinedAt").defaultNow().notNull(),
});

export type UserChallenge = typeof userChallenges.$inferSelect;
export type InsertUserChallenge = typeof userChallenges.$inferInsert;

// Emergency toolkit usage tracking
export const toolkitUsage = mysqlTable("toolkit_usage", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  toolType: varchar("toolType", { length: 100 }).notNull(),
  urgencyLevel: int("urgencyLevel"), // 1-10
  helpfulnessRating: int("helpfulnessRating"), // 1-5
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ToolkitUsage = typeof toolkitUsage.$inferSelect;
export type InsertToolkitUsage = typeof toolkitUsage.$inferInsert;


// Exercise and workout tracking
export const workouts = mysqlTable("workouts", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  workoutType: mysqlEnum("workoutType", ["strength", "walking", "incline", "rucking", "nordic", "other"]).notNull(),
  name: varchar("name", { length: 255 }),
  durationMinutes: int("durationMinutes").notNull(),
  // Walking specific
  distanceMiles: decimal("distanceMiles", { precision: 4, scale: 2 }),
  inclinePercent: int("inclinePercent"),
  ruckWeightLbs: int("ruckWeightLbs"),
  avgHeartRate: int("avgHeartRate"),
  // Strength specific
  exercises: json("exercises").$type<{name: string, sets: number, reps: number, weight: number}[]>(),
  // General
  caloriesBurned: int("caloriesBurned"),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Workout = typeof workouts.$inferSelect;
export type InsertWorkout = typeof workouts.$inferInsert;

// Supplement tracking
export const supplements = mysqlTable("supplements", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  dosage: varchar("dosage", { length: 100 }),
  tier: mysqlEnum("tier", ["tier1", "tier2", "tier3"]).default("tier1"),
  frequency: mysqlEnum("frequency", ["daily", "twice_daily", "weekly", "as_needed"]).default("daily"),
  timeOfDay: mysqlEnum("timeOfDay", ["morning", "afternoon", "evening", "bedtime", "with_meals"]),
  isActive: boolean("isActive").default(true).notNull(),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Supplement = typeof supplements.$inferSelect;
export type InsertSupplement = typeof supplements.$inferInsert;

// Daily supplement intake log
export const supplementLogs = mysqlTable("supplement_logs", {
  id: int("id").autoincrement().primaryKey(),
  supplementId: int("supplementId").notNull(),
  userId: int("userId").notNull(),
  taken: boolean("taken").default(true).notNull(),
  takenAt: timestamp("takenAt").defaultNow().notNull(),
});

export type SupplementLog = typeof supplementLogs.$inferSelect;
export type InsertSupplementLog = typeof supplementLogs.$inferInsert;

// Sleep tracking
export const sleepLogs = mysqlTable("sleep_logs", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  bedTime: timestamp("bedTime").notNull(),
  wakeTime: timestamp("wakeTime").notNull(),
  totalHours: decimal("totalHours", { precision: 4, scale: 2 }).notNull(),
  quality: mysqlEnum("quality", ["excellent", "good", "fair", "poor"]),
  // Factors
  caffeineLate: boolean("caffeineLate").default(false),
  screensBefore: boolean("screensBefore").default(false),
  roomTemp: int("roomTemp"), // Fahrenheit
  magnesiumTaken: boolean("magnesiumTaken").default(false),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type SleepLog = typeof sleepLogs.$inferSelect;
export type InsertSleepLog = typeof sleepLogs.$inferInsert;

// Biohacking activities
export const biohackingLogs = mysqlTable("biohacking_logs", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  activityType: mysqlEnum("activityType", ["morning_sunlight", "cold_exposure", "sauna", "red_light", "neat_steps", "grounding"]).notNull(),
  durationMinutes: int("durationMinutes"),
  // Cold exposure specific
  coldTemp: int("coldTemp"),
  // Sauna specific
  saunaTemp: int("saunaTemp"),
  // NEAT specific
  stepCount: int("stepCount"),
  standingMinutes: int("standingMinutes"),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type BiohackingLog = typeof biohackingLogs.$inferSelect;
export type InsertBiohackingLog = typeof biohackingLogs.$inferInsert;

// Nutrition tracking (protein, carbs, electrolytes)
export const nutritionLogs = mysqlTable("nutrition_logs", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  date: timestamp("date").defaultNow().notNull(),
  proteinGrams: int("proteinGrams"),
  carbsGrams: int("carbsGrams"),
  fatGrams: int("fatGrams"),
  calories: int("calories"),
  // Electrolytes
  sodiumMg: int("sodiumMg"),
  potassiumMg: int("potassiumMg"),
  magnesiumMg: int("magnesiumMg"),
  // Carb cycling
  isRefeedDay: boolean("isRefeedDay").default(false),
  waterOz: int("waterOz"),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type NutritionLog = typeof nutritionLogs.$inferSelect;
export type InsertNutritionLog = typeof nutritionLogs.$inferInsert;

// Body composition and milestones
export const bodyMetrics = mysqlTable("body_metrics", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  date: timestamp("date").defaultNow().notNull(),
  weightLbs: decimal("weightLbs", { precision: 5, scale: 1 }),
  bodyFatPercent: decimal("bodyFatPercent", { precision: 4, scale: 1 }),
  leanMassLbs: decimal("leanMassLbs", { precision: 5, scale: 1 }),
  visceralFat: int("visceralFat"),
  // Measurements
  waistInches: decimal("waistInches", { precision: 4, scale: 1 }),
  hipsInches: decimal("hipsInches", { precision: 4, scale: 1 }),
  chestInches: decimal("chestInches", { precision: 4, scale: 1 }),
  // Source
  measurementType: mysqlEnum("measurementType", ["scale", "dexa", "bodpod", "tape"]),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type BodyMetric = typeof bodyMetrics.$inferSelect;
export type InsertBodyMetric = typeof bodyMetrics.$inferInsert;

// Milestones and rewards
export const milestones = mysqlTable("milestones", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  milestoneName: varchar("milestoneName", { length: 255 }).notNull(),
  targetValue: decimal("targetValue", { precision: 5, scale: 1 }),
  currentValue: decimal("currentValue", { precision: 5, scale: 1 }),
  reward: text("reward"),
  completed: boolean("completed").default(false).notNull(),
  completedAt: timestamp("completedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Milestone = typeof milestones.$inferSelect;
export type InsertMilestone = typeof milestones.$inferInsert;

// AI Research history (auto-saved)
export const aiResearchHistory = mysqlTable("ai_research_history", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  query: text("query").notNull(),
  response: text("response").notNull(),
  category: varchar("category", { length: 100 }),
  sources: json("sources").$type<string[]>(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type AiResearchHistory = typeof aiResearchHistory.$inferSelect;
export type InsertAiResearchHistory = typeof aiResearchHistory.$inferInsert;

// Functional Imagery Training (FIT) sessions
export const fitSessions = mysqlTable("fit_sessions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  category: mysqlEnum("category", ["goal_weight", "energy", "confidence", "health", "lifestyle"]).notNull(),
  goalDescription: text("goalDescription").notNull(),
  visualSee: text("visualSee").notNull(),
  visualHear: text("visualHear"),
  visualFeel: text("visualFeel"),
  visualSmellTaste: text("visualSmellTaste"),
  emotions: text("emotions"),
  vividness: int("vividness").notNull(), // 1-10
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type FitSession = typeof fitSessions.$inferSelect;
export type InsertFitSession = typeof fitSessions.$inferInsert;

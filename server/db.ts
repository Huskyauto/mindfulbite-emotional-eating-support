import { eq, desc, and, gte, lte, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { 
  InsertUser, users, 
  checkIns, InsertCheckIn, CheckIn,
  chatConversations, InsertChatConversation, ChatConversation,
  chatMessages, InsertChatMessage, ChatMessage,
  journalEntries, InsertJournalEntry, JournalEntry,
  meditationSessions, InsertMeditationSession, MeditationSession,
  achievements, InsertAchievement, Achievement,
  habits, InsertHabit, Habit,
  habitLogs, InsertHabitLog, HabitLog,
  communityPosts, InsertCommunityPost, CommunityPost,
  postLikes, InsertPostLike, PostLike,
  challenges, InsertChallenge, Challenge,
  userChallenges, InsertUserChallenge, UserChallenge,
  toolkitUsage, InsertToolkitUsage, ToolkitUsage
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

// ============ USER FUNCTIONS ============
export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = { openId: user.openId };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getUserById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updateUserPoints(userId: number, pointsToAdd: number) {
  const db = await getDb();
  if (!db) return;
  await db.update(users)
    .set({ points: sql`${users.points} + ${pointsToAdd}` })
    .where(eq(users.id, userId));
}

export async function updateUserStreak(userId: number, streak: number, isNewRecord: boolean) {
  const db = await getDb();
  if (!db) return;
  const updateData: Partial<InsertUser> = {
    currentStreak: streak,
    lastCheckInDate: new Date()
  };
  if (isNewRecord) {
    updateData.longestStreak = streak;
  }
  await db.update(users).set(updateData).where(eq(users.id, userId));
}

export async function updateUserLevel(userId: number, level: number) {
  const db = await getDb();
  if (!db) return;
  await db.update(users).set({ level }).where(eq(users.id, userId));
}

// ============ CHECK-IN FUNCTIONS ============
export async function createCheckIn(data: InsertCheckIn): Promise<CheckIn | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.insert(checkIns).values(data);
  const insertId = result[0].insertId;
  const created = await db.select().from(checkIns).where(eq(checkIns.id, insertId)).limit(1);
  return created[0];
}

export async function getCheckInsByUserId(userId: number, limit = 30): Promise<CheckIn[]> {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(checkIns)
    .where(eq(checkIns.userId, userId))
    .orderBy(desc(checkIns.createdAt))
    .limit(limit);
}

export async function getTodayCheckIn(userId: number): Promise<CheckIn | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const result = await db.select().from(checkIns)
    .where(and(eq(checkIns.userId, userId), gte(checkIns.createdAt, today)))
    .orderBy(desc(checkIns.createdAt))
    .limit(1);
  return result[0];
}

// ============ CHAT FUNCTIONS ============
export async function createConversation(data: InsertChatConversation): Promise<ChatConversation | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.insert(chatConversations).values(data);
  const insertId = result[0].insertId;
  const created = await db.select().from(chatConversations).where(eq(chatConversations.id, insertId)).limit(1);
  return created[0];
}

export async function getConversationsByUserId(userId: number, limit = 20): Promise<ChatConversation[]> {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(chatConversations)
    .where(eq(chatConversations.userId, userId))
    .orderBy(desc(chatConversations.updatedAt))
    .limit(limit);
}

export async function getConversationById(id: number): Promise<ChatConversation | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(chatConversations).where(eq(chatConversations.id, id)).limit(1);
  return result[0];
}

export async function addChatMessage(data: InsertChatMessage): Promise<ChatMessage | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.insert(chatMessages).values(data);
  const insertId = result[0].insertId;
  // Update conversation timestamp
  await db.update(chatConversations)
    .set({ updatedAt: new Date() })
    .where(eq(chatConversations.id, data.conversationId));
  const created = await db.select().from(chatMessages).where(eq(chatMessages.id, insertId)).limit(1);
  return created[0];
}

export async function getMessagesByConversationId(conversationId: number): Promise<ChatMessage[]> {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(chatMessages)
    .where(eq(chatMessages.conversationId, conversationId))
    .orderBy(chatMessages.createdAt);
}

// ============ JOURNAL FUNCTIONS ============
export async function createJournalEntry(data: InsertJournalEntry): Promise<JournalEntry | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.insert(journalEntries).values(data);
  const insertId = result[0].insertId;
  const created = await db.select().from(journalEntries).where(eq(journalEntries.id, insertId)).limit(1);
  return created[0];
}

export async function getJournalEntriesByUserId(userId: number, limit = 30): Promise<JournalEntry[]> {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(journalEntries)
    .where(eq(journalEntries.userId, userId))
    .orderBy(desc(journalEntries.createdAt))
    .limit(limit);
}

export async function getJournalEntryById(id: number): Promise<JournalEntry | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(journalEntries).where(eq(journalEntries.id, id)).limit(1);
  return result[0];
}

export async function updateJournalEntry(id: number, data: Partial<InsertJournalEntry>): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.update(journalEntries).set(data).where(eq(journalEntries.id, id));
}

// ============ MEDITATION FUNCTIONS ============
export async function createMeditationSession(data: InsertMeditationSession): Promise<MeditationSession | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.insert(meditationSessions).values(data);
  const insertId = result[0].insertId;
  const created = await db.select().from(meditationSessions).where(eq(meditationSessions.id, insertId)).limit(1);
  return created[0];
}

export async function getMeditationSessionsByUserId(userId: number, limit = 30): Promise<MeditationSession[]> {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(meditationSessions)
    .where(eq(meditationSessions.userId, userId))
    .orderBy(desc(meditationSessions.createdAt))
    .limit(limit);
}

export async function getMeditationStats(userId: number) {
  const db = await getDb();
  if (!db) return { totalSessions: 0, totalMinutes: 0 };
  const result = await db.select({
    totalSessions: sql<number>`COUNT(*)`,
    totalMinutes: sql<number>`COALESCE(SUM(${meditationSessions.durationMinutes}), 0)`
  }).from(meditationSessions).where(eq(meditationSessions.userId, userId));
  return result[0] || { totalSessions: 0, totalMinutes: 0 };
}

// ============ ACHIEVEMENT FUNCTIONS ============
export async function createAchievement(data: InsertAchievement): Promise<Achievement | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.insert(achievements).values(data);
  const insertId = result[0].insertId;
  const created = await db.select().from(achievements).where(eq(achievements.id, insertId)).limit(1);
  return created[0];
}

export async function getAchievementsByUserId(userId: number): Promise<Achievement[]> {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(achievements)
    .where(eq(achievements.userId, userId))
    .orderBy(desc(achievements.earnedAt));
}

export async function hasAchievement(userId: number, achievementType: string): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;
  const result = await db.select().from(achievements)
    .where(and(eq(achievements.userId, userId), eq(achievements.achievementType, achievementType)))
    .limit(1);
  return result.length > 0;
}

// ============ HABIT FUNCTIONS ============
export async function createHabit(data: InsertHabit): Promise<Habit | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.insert(habits).values(data);
  const insertId = result[0].insertId;
  const created = await db.select().from(habits).where(eq(habits.id, insertId)).limit(1);
  return created[0];
}

export async function getHabitsByUserId(userId: number): Promise<Habit[]> {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(habits)
    .where(and(eq(habits.userId, userId), eq(habits.isActive, true)))
    .orderBy(desc(habits.createdAt));
}

export async function updateHabit(id: number, data: Partial<InsertHabit>): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.update(habits).set(data).where(eq(habits.id, id));
}

export async function logHabitCompletion(data: InsertHabitLog): Promise<HabitLog | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.insert(habitLogs).values(data);
  const insertId = result[0].insertId;
  // Update habit current count
  await db.update(habits)
    .set({ currentCount: sql`${habits.currentCount} + 1` })
    .where(eq(habits.id, data.habitId));
  const created = await db.select().from(habitLogs).where(eq(habitLogs.id, insertId)).limit(1);
  return created[0];
}

export async function getHabitLogsByHabitId(habitId: number, limit = 30): Promise<HabitLog[]> {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(habitLogs)
    .where(eq(habitLogs.habitId, habitId))
    .orderBy(desc(habitLogs.completedAt))
    .limit(limit);
}

// ============ COMMUNITY FUNCTIONS ============
export async function createCommunityPost(data: InsertCommunityPost): Promise<CommunityPost | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.insert(communityPosts).values(data);
  const insertId = result[0].insertId;
  const created = await db.select().from(communityPosts).where(eq(communityPosts.id, insertId)).limit(1);
  return created[0];
}

export async function getCommunityPosts(limit = 50): Promise<(CommunityPost & { authorName: string | null })[]> {
  const db = await getDb();
  if (!db) return [];
  const posts = await db.select({
    id: communityPosts.id,
    userId: communityPosts.userId,
    content: communityPosts.content,
    isAnonymous: communityPosts.isAnonymous,
    likesCount: communityPosts.likesCount,
    createdAt: communityPosts.createdAt,
    updatedAt: communityPosts.updatedAt,
    authorName: users.name
  })
  .from(communityPosts)
  .leftJoin(users, eq(communityPosts.userId, users.id))
  .orderBy(desc(communityPosts.createdAt))
  .limit(limit);
  return posts;
}

export async function togglePostLike(postId: number, userId: number): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;
  
  const existing = await db.select().from(postLikes)
    .where(and(eq(postLikes.postId, postId), eq(postLikes.userId, userId)))
    .limit(1);
  
  if (existing.length > 0) {
    await db.delete(postLikes).where(eq(postLikes.id, existing[0].id));
    await db.update(communityPosts)
      .set({ likesCount: sql`${communityPosts.likesCount} - 1` })
      .where(eq(communityPosts.id, postId));
    return false;
  } else {
    await db.insert(postLikes).values({ postId, userId });
    await db.update(communityPosts)
      .set({ likesCount: sql`${communityPosts.likesCount} + 1` })
      .where(eq(communityPosts.id, postId));
    return true;
  }
}

export async function getUserLikedPosts(userId: number): Promise<number[]> {
  const db = await getDb();
  if (!db) return [];
  const likes = await db.select({ postId: postLikes.postId })
    .from(postLikes)
    .where(eq(postLikes.userId, userId));
  return likes.map(l => l.postId);
}

// ============ CHALLENGE FUNCTIONS ============
export async function getActiveChallenges(): Promise<Challenge[]> {
  const db = await getDb();
  if (!db) return [];
  const now = new Date();
  return await db.select().from(challenges)
    .where(and(eq(challenges.isActive, true), lte(challenges.startDate, now), gte(challenges.endDate, now)));
}

export async function joinChallenge(userId: number, challengeId: number): Promise<UserChallenge | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.insert(userChallenges).values({ userId, challengeId });
  const insertId = result[0].insertId;
  const created = await db.select().from(userChallenges).where(eq(userChallenges.id, insertId)).limit(1);
  return created[0];
}

export async function getUserChallenges(userId: number): Promise<(UserChallenge & { challenge: Challenge })[]> {
  const db = await getDb();
  if (!db) return [];
  const result = await db.select()
    .from(userChallenges)
    .innerJoin(challenges, eq(userChallenges.challengeId, challenges.id))
    .where(eq(userChallenges.userId, userId));
  return result.map(r => ({ ...r.user_challenges, challenge: r.challenges }));
}

export async function updateChallengeProgress(userId: number, challengeId: number, progress: number): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.update(userChallenges)
    .set({ currentProgress: progress })
    .where(and(eq(userChallenges.userId, userId), eq(userChallenges.challengeId, challengeId)));
}

// ============ TOOLKIT USAGE FUNCTIONS ============
export async function logToolkitUsage(data: InsertToolkitUsage): Promise<ToolkitUsage | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.insert(toolkitUsage).values(data);
  const insertId = result[0].insertId;
  const created = await db.select().from(toolkitUsage).where(eq(toolkitUsage.id, insertId)).limit(1);
  return created[0];
}

export async function getToolkitUsageByUserId(userId: number, limit = 30): Promise<ToolkitUsage[]> {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(toolkitUsage)
    .where(eq(toolkitUsage.userId, userId))
    .orderBy(desc(toolkitUsage.createdAt))
    .limit(limit);
}

import { describe, expect, it, vi, beforeEach } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

// Mock database functions with correct names from db.ts
vi.mock("./db", () => ({
  getDb: vi.fn(() => Promise.resolve(null)),
  upsertUser: vi.fn(() => Promise.resolve()),
  getUserByOpenId: vi.fn(() => Promise.resolve(null)),
  getUserById: vi.fn(() => Promise.resolve({
    id: 1,
    points: 100,
    level: 2,
    currentStreak: 5,
    longestStreak: 10,
  })),
  updateUserPoints: vi.fn(() => Promise.resolve()),
  updateUserStreak: vi.fn(() => Promise.resolve()),
  updateUserLevel: vi.fn(() => Promise.resolve()),
  createCheckIn: vi.fn(() => Promise.resolve({ id: 1 })),
  getCheckInsByUserId: vi.fn(() => Promise.resolve([])),
  getTodayCheckIn: vi.fn(() => Promise.resolve(null)),
  createConversation: vi.fn(() => Promise.resolve({ id: 1 })),
  getConversationsByUserId: vi.fn(() => Promise.resolve([])),
  getConversationById: vi.fn(() => Promise.resolve(null)),
  addChatMessage: vi.fn(() => Promise.resolve({ id: 1 })),
  getMessagesByConversationId: vi.fn(() => Promise.resolve([])),
  createJournalEntry: vi.fn(() => Promise.resolve({ id: 1 })),
  getJournalEntriesByUserId: vi.fn(() => Promise.resolve([])),
  getJournalEntryById: vi.fn(() => Promise.resolve(null)),
  updateJournalEntry: vi.fn(() => Promise.resolve()),
  createMeditationSession: vi.fn(() => Promise.resolve({ id: 1 })),
  getMeditationSessionsByUserId: vi.fn(() => Promise.resolve([])),
  getMeditationStats: vi.fn(() => Promise.resolve({ totalSessions: 5, totalMinutes: 50 })),
  createAchievement: vi.fn(() => Promise.resolve({ id: 1 })),
  getAchievementsByUserId: vi.fn(() => Promise.resolve([])),
  hasAchievement: vi.fn(() => Promise.resolve(false)),
  createHabit: vi.fn(() => Promise.resolve({ id: 1 })),
  getHabitsByUserId: vi.fn(() => Promise.resolve([])),
  updateHabit: vi.fn(() => Promise.resolve()),
  logHabitCompletion: vi.fn(() => Promise.resolve({ id: 1 })),
  getHabitLogsByHabitId: vi.fn(() => Promise.resolve([])),
  createCommunityPost: vi.fn(() => Promise.resolve({ id: 1 })),
  getCommunityPosts: vi.fn(() => Promise.resolve([])),
  togglePostLike: vi.fn(() => Promise.resolve(true)),
  getUserLikedPosts: vi.fn(() => Promise.resolve([])),
  getActiveChallenges: vi.fn(() => Promise.resolve([])),
  joinChallenge: vi.fn(() => Promise.resolve({ id: 1 })),
  getUserChallenges: vi.fn(() => Promise.resolve([])),
  updateChallengeProgress: vi.fn(() => Promise.resolve()),
  logToolkitUsage: vi.fn(() => Promise.resolve({ id: 1 })),
}));

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAuthContext(): { ctx: TrpcContext } {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "test-user-123",
    email: "test@example.com",
    name: "Test User",
    loginMethod: "manus",
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  const ctx: TrpcContext = {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: vi.fn(),
    } as unknown as TrpcContext["res"],
  };

  return { ctx };
}

function createUnauthContext(): { ctx: TrpcContext } {
  const ctx: TrpcContext = {
    user: null,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: vi.fn(),
    } as unknown as TrpcContext["res"],
  };

  return { ctx };
}

describe("Check-in procedures", () => {
  it("should require authentication for creating check-ins", async () => {
    const { ctx } = createUnauthContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.checkIn.create({
        mood: "good",
        hungerLevel: 5,
        emotions: ["happy"],
        triggers: [],
      })
    ).rejects.toThrow("Please login");
  });

  it("should allow authenticated users to list check-ins", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.checkIn.list({ limit: 10 });
    expect(Array.isArray(result)).toBe(true);
  });
});

describe("Journal procedures", () => {
  it("should require authentication for creating journal entries", async () => {
    const { ctx } = createUnauthContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.journal.create({
        content: "Test journal entry",
      })
    ).rejects.toThrow("Please login");
  });

  it("should allow authenticated users to list journal entries", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.journal.list();
    expect(Array.isArray(result)).toBe(true);
  });
});

describe("Progress procedures", () => {
  it("should allow authenticated users to view dashboard", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.progress.dashboard();
    expect(result).toHaveProperty("user");
    expect(result).toHaveProperty("achievements");
  });

  it("should require authentication for dashboard", async () => {
    const { ctx } = createUnauthContext();
    const caller = appRouter.createCaller(ctx);

    await expect(caller.progress.dashboard()).rejects.toThrow("Please login");
  });
});

describe("Habits procedures", () => {
  it("should require authentication for creating habits", async () => {
    const { ctx } = createUnauthContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.habits.create({
        name: "Test habit",
        frequency: "daily",
      })
    ).rejects.toThrow("Please login");
  });

  it("should allow authenticated users to list habits", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.habits.list();
    expect(Array.isArray(result)).toBe(true);
  });
});

describe("Meditation procedures", () => {
  it("should require authentication for completing meditation", async () => {
    const { ctx } = createUnauthContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.meditation.complete({
        meditationType: "breathing",
        durationMinutes: 5,
      })
    ).rejects.toThrow("Please login");
  });

  it("should allow authenticated users to get meditation stats", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.meditation.stats();
    expect(result).toHaveProperty("totalSessions");
    expect(result).toHaveProperty("totalMinutes");
  });
});

describe("Community procedures", () => {
  it("should require authentication for listing community posts", async () => {
    const { ctx } = createUnauthContext();
    const caller = appRouter.createCaller(ctx);

    // Community list requires auth in our implementation
    await expect(caller.community.list()).rejects.toThrow("Please login");
  });

  it("should require authentication for creating posts", async () => {
    const { ctx } = createUnauthContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.community.createPost({
        content: "Test post",
        isAnonymous: false,
      })
    ).rejects.toThrow("Please login");
  });

  it("should allow authenticated users to list community posts", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.community.list();
    expect(Array.isArray(result)).toBe(true);
  });
});

describe("Toolkit procedures", () => {
  it("should require authentication for logging toolkit usage", async () => {
    const { ctx } = createUnauthContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.toolkit.logUsage({
        toolType: "urge_surfing",
        urgencyLevel: 5,
      })
    ).rejects.toThrow("Please login");
  });
});

describe("Auth procedures", () => {
  it("should return null for unauthenticated users on me query", async () => {
    const { ctx } = createUnauthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.auth.me();
    expect(result).toBeNull();
  });

  it("should return user for authenticated users on me query", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.auth.me();
    expect(result).not.toBeNull();
    expect(result?.openId).toBe("test-user-123");
  });
});

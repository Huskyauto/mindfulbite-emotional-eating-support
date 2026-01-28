import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { invokeLLM } from "./_core/llm";
import * as db from "./db";

// Emotion and trigger options
const EMOTIONS = [
  "anxious", "stressed", "sad", "lonely", "bored", "frustrated", 
  "angry", "overwhelmed", "tired", "happy", "calm", "excited",
  "guilty", "ashamed", "hopeful", "grateful"
] as const;

const TRIGGERS = [
  "work_stress", "relationship_issues", "loneliness", "boredom",
  "celebration", "social_pressure", "tiredness", "habit",
  "tv_watching", "late_night", "skipped_meal", "negative_thoughts"
] as const;

const MOODS = ["great", "good", "okay", "low", "struggling"] as const;

// Meditation types
const MEDITATION_TYPES = [
  "raisin", "body_scan", "loving_kindness", "breathing", 
  "three_minute_space", "urge_surfing", "compassion"
] as const;

// Toolkit types
const TOOLKIT_TYPES = [
  "urge_surfing", "deep_breathing", "tipp", "distraction",
  "grounding", "opposite_action", "wise_mind"
] as const;

export const appRouter = router({
  system: systemRouter,
  
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  // ============ CHECK-IN ROUTER ============
  checkIn: router({
    create: protectedProcedure
      .input(z.object({
        mood: z.enum(MOODS),
        moodEmoji: z.string().optional(),
        hungerLevel: z.number().min(1).max(10),
        emotions: z.array(z.string()).optional(),
        triggers: z.array(z.string()).optional(),
        notes: z.string().optional(),
        isEmotionalEating: z.boolean().optional()
      }))
      .mutation(async ({ ctx, input }) => {
        const checkIn = await db.createCheckIn({
          userId: ctx.user.id,
          ...input
        });
        
        // Update streak
        const user = await db.getUserById(ctx.user.id);
        if (user) {
          const lastCheckIn = user.lastCheckInDate;
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          
          let newStreak = 1;
          if (lastCheckIn) {
            const lastDate = new Date(lastCheckIn);
            lastDate.setHours(0, 0, 0, 0);
            const diffDays = Math.floor((today.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
            
            if (diffDays === 1) {
              newStreak = user.currentStreak + 1;
            } else if (diffDays === 0) {
              newStreak = user.currentStreak;
            }
          }
          
          const isNewRecord = newStreak > user.longestStreak;
          await db.updateUserStreak(ctx.user.id, newStreak, isNewRecord);
          
          // Award points
          await db.updateUserPoints(ctx.user.id, 10);
          
          // Check for streak achievements
          if (newStreak === 7 && !(await db.hasAchievement(ctx.user.id, "streak_7"))) {
            await db.createAchievement({
              userId: ctx.user.id,
              achievementType: "streak_7",
              achievementName: "Week Warrior",
              description: "Completed 7 days in a row!",
              iconName: "flame"
            });
          }
          if (newStreak === 30 && !(await db.hasAchievement(ctx.user.id, "streak_30"))) {
            await db.createAchievement({
              userId: ctx.user.id,
              achievementType: "streak_30",
              achievementName: "Monthly Master",
              description: "Completed 30 days in a row!",
              iconName: "trophy"
            });
          }
        }
        
        return checkIn;
      }),
    
    list: protectedProcedure
      .input(z.object({ limit: z.number().optional() }).optional())
      .query(async ({ ctx, input }) => {
        return await db.getCheckInsByUserId(ctx.user.id, input?.limit || 30);
      }),
    
    today: protectedProcedure.query(async ({ ctx }) => {
      return await db.getTodayCheckIn(ctx.user.id);
    }),
  }),

  // ============ CHAT ROUTER ============
  chat: router({
    createConversation: protectedProcedure
      .input(z.object({ title: z.string().optional() }))
      .mutation(async ({ ctx, input }) => {
        return await db.createConversation({
          userId: ctx.user.id,
          title: input.title || "New Conversation"
        });
      }),
    
    listConversations: protectedProcedure.query(async ({ ctx }) => {
      return await db.getConversationsByUserId(ctx.user.id);
    }),
    
    getMessages: protectedProcedure
      .input(z.object({ conversationId: z.number() }))
      .query(async ({ input }) => {
        return await db.getMessagesByConversationId(input.conversationId);
      }),
    
    sendMessage: protectedProcedure
      .input(z.object({
        conversationId: z.number(),
        content: z.string()
      }))
      .mutation(async ({ ctx, input }) => {
        // Save user message
        await db.addChatMessage({
          conversationId: input.conversationId,
          role: "user",
          content: input.content
        });
        
        // Get conversation history for context
        const messages = await db.getMessagesByConversationId(input.conversationId);
        const recentCheckIns = await db.getCheckInsByUserId(ctx.user.id, 5);
        
        // Build context for AI
        const userContext = recentCheckIns.length > 0 
          ? `Recent mood patterns: ${recentCheckIns.map(c => c.mood).join(", ")}. Recent emotions: ${recentCheckIns.flatMap(c => c.emotions || []).slice(0, 5).join(", ")}.`
          : "";
        
        const systemPrompt = `You are a compassionate, supportive emotional eating coach named MindfulBite. Your role is to help users understand and manage emotional eating patterns through evidence-based techniques including:
- Mindful eating practices
- Intuitive eating principles
- CBT (Cognitive Behavioral Therapy) techniques
- DBT (Dialectical Behavior Therapy) skills like urge surfing and opposite action
- ACT (Acceptance and Commitment Therapy) approaches
- Self-compassion and loving-kindness

Guidelines:
- Be warm, non-judgmental, and supportive
- Never shame or criticize eating behaviors
- Focus on awareness, not restriction
- Offer practical, actionable suggestions
- Validate emotions before offering solutions
- Use "I notice" and "I wonder" language
- Encourage self-compassion
- If someone is in crisis, gently suggest professional help

${userContext}

Keep responses concise but helpful (2-3 paragraphs max). End with a supportive question or gentle suggestion when appropriate.`;

        const chatHistory = messages.slice(-10).map(m => ({
          role: m.role as "user" | "assistant",
          content: m.content
        }));
        
        try {
          const response = await invokeLLM({
            messages: [
              { role: "system", content: systemPrompt },
              ...chatHistory,
              { role: "user", content: input.content }
            ]
          });
          
          const rawContent = response.choices[0]?.message?.content;
          const assistantContent = typeof rawContent === 'string' ? rawContent : "I'm here to support you. Could you tell me more about what you're experiencing?";
          
          // Save assistant message
          const assistantMessage = await db.addChatMessage({
            conversationId: input.conversationId,
            role: "assistant",
            content: assistantContent
          });
          
          // Award points for engagement
          await db.updateUserPoints(ctx.user.id, 5);
          
          return assistantMessage;
        } catch (error) {
          console.error("LLM error:", error);
          const fallbackMessage = await db.addChatMessage({
            conversationId: input.conversationId,
            role: "assistant",
            content: "I'm here to support you. It sounds like you're going through something challenging. Would you like to try a quick breathing exercise, or would you prefer to talk more about what's on your mind?"
          });
          return fallbackMessage;
        }
      }),
  }),

  // ============ JOURNAL ROUTER ============
  journal: router({
    create: protectedProcedure
      .input(z.object({
        title: z.string().optional(),
        content: z.string(),
        mood: z.enum(MOODS).optional(),
        emotions: z.array(z.string()).optional(),
        triggers: z.array(z.string()).optional(),
        reflectionPrompt: z.string().optional()
      }))
      .mutation(async ({ ctx, input }) => {
        const entry = await db.createJournalEntry({
          userId: ctx.user.id,
          ...input
        });
        
        // Award points
        await db.updateUserPoints(ctx.user.id, 15);
        
        // Check for first journal achievement
        const entries = await db.getJournalEntriesByUserId(ctx.user.id, 1);
        if (entries.length === 1 && !(await db.hasAchievement(ctx.user.id, "first_journal"))) {
          await db.createAchievement({
            userId: ctx.user.id,
            achievementType: "first_journal",
            achievementName: "Reflective Writer",
            description: "Wrote your first journal entry!",
            iconName: "pencil"
          });
        }
        
        return entry;
      }),
    
    list: protectedProcedure
      .input(z.object({ limit: z.number().optional() }).optional())
      .query(async ({ ctx, input }) => {
        return await db.getJournalEntriesByUserId(ctx.user.id, input?.limit || 30);
      }),
    
    get: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return await db.getJournalEntryById(input.id);
      }),
    
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        title: z.string().optional(),
        content: z.string().optional(),
        insights: z.string().optional()
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        await db.updateJournalEntry(id, data);
        return { success: true };
      }),
  }),

  // ============ MEDITATION ROUTER ============
  meditation: router({
    complete: protectedProcedure
      .input(z.object({
        meditationType: z.string(),
        durationMinutes: z.number(),
        stressBefore: z.number().min(1).max(10).optional(),
        stressAfter: z.number().min(1).max(10).optional(),
        notes: z.string().optional()
      }))
      .mutation(async ({ ctx, input }) => {
        const session = await db.createMeditationSession({
          userId: ctx.user.id,
          ...input
        });
        
        // Award points based on duration
        const points = Math.min(input.durationMinutes * 2, 30);
        await db.updateUserPoints(ctx.user.id, points);
        
        // Check for meditation achievements
        const stats = await db.getMeditationStats(ctx.user.id);
        if (stats.totalSessions === 1 && !(await db.hasAchievement(ctx.user.id, "first_meditation"))) {
          await db.createAchievement({
            userId: ctx.user.id,
            achievementType: "first_meditation",
            achievementName: "Mindful Beginner",
            description: "Completed your first meditation!",
            iconName: "sparkles"
          });
        }
        if (stats.totalMinutes >= 60 && !(await db.hasAchievement(ctx.user.id, "meditation_hour"))) {
          await db.createAchievement({
            userId: ctx.user.id,
            achievementType: "meditation_hour",
            achievementName: "Hour of Peace",
            description: "Meditated for a total of 60 minutes!",
            iconName: "clock"
          });
        }
        
        return session;
      }),
    
    list: protectedProcedure
      .input(z.object({ limit: z.number().optional() }).optional())
      .query(async ({ ctx, input }) => {
        return await db.getMeditationSessionsByUserId(ctx.user.id, input?.limit || 30);
      }),
    
    stats: protectedProcedure.query(async ({ ctx }) => {
      return await db.getMeditationStats(ctx.user.id);
    }),
  }),

  // ============ PROGRESS ROUTER ============
  progress: router({
    dashboard: protectedProcedure.query(async ({ ctx }) => {
      const user = await db.getUserById(ctx.user.id);
      const checkIns = await db.getCheckInsByUserId(ctx.user.id, 30);
      const achievements = await db.getAchievementsByUserId(ctx.user.id);
      const meditationStats = await db.getMeditationStats(ctx.user.id);
      const journalEntries = await db.getJournalEntriesByUserId(ctx.user.id, 30);
      
      // Calculate mood distribution
      const moodCounts = checkIns.reduce((acc, c) => {
        acc[c.mood] = (acc[c.mood] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      
      // Calculate emotion frequency
      const emotionCounts = checkIns.reduce((acc, c) => {
        (c.emotions || []).forEach(e => {
          acc[e] = (acc[e] || 0) + 1;
        });
        return acc;
      }, {} as Record<string, number>);
      
      // Calculate trigger frequency
      const triggerCounts = checkIns.reduce((acc, c) => {
        (c.triggers || []).forEach(t => {
          acc[t] = (acc[t] || 0) + 1;
        });
        return acc;
      }, {} as Record<string, number>);
      
      return {
        user: {
          points: user?.points || 0,
          level: user?.level || 1,
          currentStreak: user?.currentStreak || 0,
          longestStreak: user?.longestStreak || 0
        },
        checkInCount: checkIns.length,
        journalCount: journalEntries.length,
        meditationStats,
        achievements,
        moodDistribution: moodCounts,
        topEmotions: Object.entries(emotionCounts)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 5),
        topTriggers: Object.entries(triggerCounts)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 5)
      };
    }),
    
    achievements: protectedProcedure.query(async ({ ctx }) => {
      return await db.getAchievementsByUserId(ctx.user.id);
    }),
  }),

  // ============ HABITS ROUTER ============
  habits: router({
    create: protectedProcedure
      .input(z.object({
        name: z.string(),
        description: z.string().optional(),
        frequency: z.enum(["daily", "weekly", "custom"]).optional(),
        targetCount: z.number().optional(),
        reminderTime: z.string().optional()
      }))
      .mutation(async ({ ctx, input }) => {
        return await db.createHabit({
          userId: ctx.user.id,
          ...input
        });
      }),
    
    list: protectedProcedure.query(async ({ ctx }) => {
      return await db.getHabitsByUserId(ctx.user.id);
    }),
    
    complete: protectedProcedure
      .input(z.object({
        habitId: z.number(),
        notes: z.string().optional()
      }))
      .mutation(async ({ ctx, input }) => {
        const log = await db.logHabitCompletion({
          habitId: input.habitId,
          userId: ctx.user.id,
          notes: input.notes
        });
        
        // Award points
        await db.updateUserPoints(ctx.user.id, 5);
        
        return log;
      }),
    
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        name: z.string().optional(),
        description: z.string().optional(),
        isActive: z.boolean().optional()
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        await db.updateHabit(id, data);
        return { success: true };
      }),
  }),

  // ============ COMMUNITY ROUTER ============
  community: router({
    createPost: protectedProcedure
      .input(z.object({
        content: z.string(),
        isAnonymous: z.boolean().optional()
      }))
      .mutation(async ({ ctx, input }) => {
        const post = await db.createCommunityPost({
          userId: ctx.user.id,
          ...input
        });
        
        // Award points
        await db.updateUserPoints(ctx.user.id, 10);
        
        return post;
      }),
    
    list: protectedProcedure.query(async () => {
      return await db.getCommunityPosts();
    }),
    
    toggleLike: protectedProcedure
      .input(z.object({ postId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const liked = await db.togglePostLike(input.postId, ctx.user.id);
        return { liked };
      }),
    
    myLikes: protectedProcedure.query(async ({ ctx }) => {
      return await db.getUserLikedPosts(ctx.user.id);
    }),
  }),

  // ============ TOOLKIT ROUTER ============
  toolkit: router({
    logUsage: protectedProcedure
      .input(z.object({
        toolType: z.string(),
        urgencyLevel: z.number().min(1).max(10).optional(),
        helpfulnessRating: z.number().min(1).max(5).optional(),
        notes: z.string().optional()
      }))
      .mutation(async ({ ctx, input }) => {
        const usage = await db.logToolkitUsage({
          userId: ctx.user.id,
          ...input
        });
        
        // Award points for using toolkit
        await db.updateUserPoints(ctx.user.id, 5);
        
        // Check for toolkit achievement
        const usageHistory = await db.getToolkitUsageByUserId(ctx.user.id);
        if (usageHistory.length === 1 && !(await db.hasAchievement(ctx.user.id, "first_toolkit"))) {
          await db.createAchievement({
            userId: ctx.user.id,
            achievementType: "first_toolkit",
            achievementName: "Crisis Navigator",
            description: "Used the emergency toolkit for the first time!",
            iconName: "shield"
          });
        }
        
        return usage;
      }),
    
    history: protectedProcedure.query(async ({ ctx }) => {
      return await db.getToolkitUsageByUserId(ctx.user.id);
    }),
  }),

  // ============ CHALLENGES ROUTER ============
  challenges: router({
    active: protectedProcedure.query(async () => {
      return await db.getActiveChallenges();
    }),
    
    join: protectedProcedure
      .input(z.object({ challengeId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        return await db.joinChallenge(ctx.user.id, input.challengeId);
      }),
    
    myProgress: protectedProcedure.query(async ({ ctx }) => {
      return await db.getUserChallenges(ctx.user.id);
    }),
  }),
});

export type AppRouter = typeof appRouter;

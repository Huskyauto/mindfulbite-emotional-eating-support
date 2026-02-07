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

  // ============ WORKOUT ROUTER ============
  workout: router({
    create: protectedProcedure
      .input(z.object({
        workoutType: z.enum(["strength", "walking", "incline", "rucking", "nordic", "other"]),
        name: z.string().optional(),
        durationMinutes: z.number(),
        distanceMiles: z.string().optional(),
        inclinePercent: z.number().optional(),
        ruckWeightLbs: z.number().optional(),
        avgHeartRate: z.number().optional(),
        exercises: z.array(z.object({
          name: z.string(),
          sets: z.number(),
          reps: z.number(),
          weight: z.number()
        })).optional(),
        caloriesBurned: z.number().optional(),
        notes: z.string().optional()
      }))
      .mutation(async ({ ctx, input }) => {
        const workout = await db.createWorkout({
          userId: ctx.user.id,
          ...input
        });
        
        // Award points based on workout type and duration
        const basePoints = input.workoutType === 'strength' ? 25 : 15;
        const durationBonus = Math.floor(input.durationMinutes / 10) * 5;
        await db.updateUserPoints(ctx.user.id, basePoints + durationBonus);
        
        // Check for workout achievements
        const weeklyCount = await db.getWeeklyWorkoutCount(ctx.user.id);
        if (weeklyCount >= 3 && !(await db.hasAchievement(ctx.user.id, "workout_3x_week"))) {
          await db.createAchievement({
            userId: ctx.user.id,
            achievementType: "workout_3x_week",
            achievementName: "Consistent Mover",
            description: "Completed 3 workouts in one week!",
            iconName: "dumbbell"
          });
        }
        
        return workout;
      }),
    
    list: protectedProcedure
      .input(z.object({ limit: z.number().optional() }).optional())
      .query(async ({ ctx, input }) => {
        return await db.getWorkoutsByUserId(ctx.user.id, input?.limit || 30);
      }),
    
    stats: protectedProcedure.query(async ({ ctx }) => {
      return await db.getWorkoutStats(ctx.user.id);
    }),
    
    weeklyCount: protectedProcedure.query(async ({ ctx }) => {
      return await db.getWeeklyWorkoutCount(ctx.user.id);
    }),
  }),

  // ============ SUPPLEMENT ROUTER ============
  supplement: router({
    create: protectedProcedure
      .input(z.object({
        name: z.string(),
        dosage: z.string().optional(),
        tier: z.enum(["tier1", "tier2", "tier3"]).optional(),
        frequency: z.enum(["daily", "twice_daily", "weekly", "as_needed"]).optional(),
        timeOfDay: z.enum(["morning", "afternoon", "evening", "bedtime", "with_meals"]).optional(),
        notes: z.string().optional()
      }))
      .mutation(async ({ ctx, input }) => {
        return await db.createSupplement({
          userId: ctx.user.id,
          ...input
        });
      }),
    
    list: protectedProcedure.query(async ({ ctx }) => {
      return await db.getSupplementsByUserId(ctx.user.id);
    }),
    
    logIntake: protectedProcedure
      .input(z.object({ supplementId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const log = await db.logSupplementIntake({
          supplementId: input.supplementId,
          userId: ctx.user.id
        });
        await db.updateUserPoints(ctx.user.id, 2);
        return log;
      }),
    
    todayLogs: protectedProcedure.query(async ({ ctx }) => {
      return await db.getTodaySupplementLogs(ctx.user.id);
    }),
    
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        name: z.string().optional(),
        dosage: z.string().optional(),
        isActive: z.boolean().optional()
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        await db.updateSupplement(id, data);
        return { success: true };
      }),
  }),

  // ============ SLEEP ROUTER ============
  sleep: router({
    create: protectedProcedure
      .input(z.object({
        bedTime: z.string(),
        wakeTime: z.string(),
        totalHours: z.string(),
        quality: z.enum(["excellent", "good", "fair", "poor"]).optional(),
        caffeineLate: z.boolean().optional(),
        screensBefore: z.boolean().optional(),
        roomTemp: z.number().optional(),
        magnesiumTaken: z.boolean().optional(),
        notes: z.string().optional()
      }))
      .mutation(async ({ ctx, input }) => {
        const sleepLog = await db.createSleepLog({
          userId: ctx.user.id,
          bedTime: new Date(input.bedTime),
          wakeTime: new Date(input.wakeTime),
          totalHours: input.totalHours,
          quality: input.quality,
          caffeineLate: input.caffeineLate,
          screensBefore: input.screensBefore,
          roomTemp: input.roomTemp,
          magnesiumTaken: input.magnesiumTaken,
          notes: input.notes
        });
        
        // Award points for logging sleep
        await db.updateUserPoints(ctx.user.id, 10);
        
        // Check for sleep achievement (7+ hours)
        const hours = parseFloat(input.totalHours);
        if (hours >= 7 && !(await db.hasAchievement(ctx.user.id, "good_sleep"))) {
          await db.createAchievement({
            userId: ctx.user.id,
            achievementType: "good_sleep",
            achievementName: "Well Rested",
            description: "Got 7+ hours of sleep!",
            iconName: "moon"
          });
        }
        
        return sleepLog;
      }),
    
    list: protectedProcedure
      .input(z.object({ limit: z.number().optional() }).optional())
      .query(async ({ ctx, input }) => {
        return await db.getSleepLogsByUserId(ctx.user.id, input?.limit || 30);
      }),
    
    stats: protectedProcedure.query(async ({ ctx }) => {
      return await db.getSleepStats(ctx.user.id);
    }),
  }),

  // ============ BIOHACKING ROUTER ============
  biohacking: router({
    create: protectedProcedure
      .input(z.object({
        activityType: z.enum(["morning_sunlight", "cold_exposure", "sauna", "red_light", "neat_steps", "grounding"]),
        durationMinutes: z.number().optional(),
        coldTemp: z.number().optional(),
        saunaTemp: z.number().optional(),
        stepCount: z.number().optional(),
        standingMinutes: z.number().optional(),
        notes: z.string().optional()
      }))
      .mutation(async ({ ctx, input }) => {
        const log = await db.createBiohackingLog({
          userId: ctx.user.id,
          ...input
        });
        
        // Award points based on activity
        const pointsMap: Record<string, number> = {
          morning_sunlight: 10,
          cold_exposure: 15,
          sauna: 15,
          red_light: 10,
          neat_steps: 5,
          grounding: 5
        };
        await db.updateUserPoints(ctx.user.id, pointsMap[input.activityType] || 5);
        
        return log;
      }),
    
    list: protectedProcedure
      .input(z.object({ limit: z.number().optional() }).optional())
      .query(async ({ ctx, input }) => {
        return await db.getBiohackingLogsByUserId(ctx.user.id, input?.limit || 30);
      }),
    
    today: protectedProcedure.query(async ({ ctx }) => {
      return await db.getTodayBiohackingLogs(ctx.user.id);
    }),
  }),

  // ============ NUTRITION ROUTER ============
  nutrition: router({
    create: protectedProcedure
      .input(z.object({
        proteinGrams: z.number().optional(),
        carbsGrams: z.number().optional(),
        fatGrams: z.number().optional(),
        calories: z.number().optional(),
        sodiumMg: z.number().optional(),
        potassiumMg: z.number().optional(),
        magnesiumMg: z.number().optional(),
        isRefeedDay: z.boolean().optional(),
        waterOz: z.number().optional(),
        notes: z.string().optional()
      }))
      .mutation(async ({ ctx, input }) => {
        const log = await db.createNutritionLog({
          userId: ctx.user.id,
          ...input
        });
        
        // Award points
        await db.updateUserPoints(ctx.user.id, 10);
        
        // Check for protein goal achievement
        if (input.proteinGrams && input.proteinGrams >= 130 && !(await db.hasAchievement(ctx.user.id, "protein_goal"))) {
          await db.createAchievement({
            userId: ctx.user.id,
            achievementType: "protein_goal",
            achievementName: "Protein Champion",
            description: "Hit 130g+ protein in a day!",
            iconName: "beef"
          });
        }
        
        return log;
      }),
    
    list: protectedProcedure
      .input(z.object({ limit: z.number().optional() }).optional())
      .query(async ({ ctx, input }) => {
        return await db.getNutritionLogsByUserId(ctx.user.id, input?.limit || 30);
      }),
    
    today: protectedProcedure.query(async ({ ctx }) => {
      return await db.getTodayNutritionLog(ctx.user.id);
    }),
  }),

  // ============ BODY METRICS ROUTER ============
  bodyMetrics: router({
    create: protectedProcedure
      .input(z.object({
        weightLbs: z.string().optional(),
        bodyFatPercent: z.string().optional(),
        leanMassLbs: z.string().optional(),
        visceralFat: z.number().optional(),
        waistInches: z.string().optional(),
        hipsInches: z.string().optional(),
        chestInches: z.string().optional(),
        measurementType: z.enum(["scale", "dexa", "bodpod", "tape"]).optional(),
        notes: z.string().optional()
      }))
      .mutation(async ({ ctx, input }) => {
        const metric = await db.createBodyMetric({
          userId: ctx.user.id,
          ...input
        });
        
        await db.updateUserPoints(ctx.user.id, 15);
        return metric;
      }),
    
    list: protectedProcedure
      .input(z.object({ limit: z.number().optional() }).optional())
      .query(async ({ ctx, input }) => {
        return await db.getBodyMetricsByUserId(ctx.user.id, input?.limit || 30);
      }),
    
    latest: protectedProcedure.query(async ({ ctx }) => {
      return await db.getLatestBodyMetric(ctx.user.id);
    }),
  }),

  // ============ MILESTONES ROUTER ============
  milestones: router({
    create: protectedProcedure
      .input(z.object({
        milestoneName: z.string(),
        targetValue: z.string().optional(),
        currentValue: z.string().optional(),
        reward: z.string().optional()
      }))
      .mutation(async ({ ctx, input }) => {
        return await db.createMilestone({
          userId: ctx.user.id,
          ...input
        });
      }),
    
    list: protectedProcedure.query(async ({ ctx }) => {
      return await db.getMilestonesByUserId(ctx.user.id);
    }),
    
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        currentValue: z.string().optional(),
        completed: z.boolean().optional()
      }))
      .mutation(async ({ ctx, input }) => {
        const { id, ...data } = input;
        if (data.completed) {
          await db.updateMilestone(id, { ...data, completedAt: new Date() });
          await db.updateUserPoints(ctx.user.id, 50);
        } else {
          await db.updateMilestone(id, data);
        }
        return { success: true };
      }),
  }),

  // ============ AI RESEARCH ROUTER ============
  aiResearch: router({
    query: protectedProcedure
      .input(z.object({
        query: z.string(),
        category: z.string().optional()
      }))
      .mutation(async ({ ctx, input }) => {
        // Use LLM for research
        const systemPrompt = `You are a knowledgeable health and wellness research assistant. Provide evidence-based information about weight loss, nutrition, exercise, supplements, and healthy habits. Always cite research when possible and note when something is anecdotal vs scientifically proven. Be helpful but remind users to consult healthcare providers for medical decisions.`;
        
        try {
          const response = await invokeLLM({
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: input.query }
            ]
          });
          
          const rawContent = response.choices[0]?.message?.content;
          const responseText = typeof rawContent === 'string' ? rawContent : "I couldn't find specific information on that topic. Please try rephrasing your question.";
          
          // Auto-save to database
          const saved = await db.saveAiResearch({
            userId: ctx.user.id,
            query: input.query,
            response: responseText,
            category: input.category
          });
          
          return saved;
        } catch (error) {
          console.error("AI Research error:", error);
          throw new Error("Failed to process research query");
        }
      }),
    
    history: protectedProcedure
      .input(z.object({ limit: z.number().optional() }).optional())
      .query(async ({ ctx, input }) => {
        return await db.getAiResearchHistory(ctx.user.id, input?.limit || 10);
      }),
  }),

  // ============ FIT (Functional Imagery Training) ROUTER ============
  fit: router({
    create: protectedProcedure
      .input(z.object({
        category: z.enum(["goal_weight", "energy", "confidence", "health", "lifestyle"]),
        goalDescription: z.string(),
        visualSee: z.string(),
        visualHear: z.string().optional(),
        visualFeel: z.string().optional(),
        visualSmellTaste: z.string().optional(),
        emotions: z.string().optional(),
        vividness: z.number().min(1).max(10),
        notes: z.string().optional()
      }))
      .mutation(async ({ ctx, input }) => {
        const session = await db.createFitSession({
          userId: ctx.user.id,
          ...input
        });
        
        await db.updateUserPoints(ctx.user.id, 15);
        
        // Check for FIT achievement
        const sessions = await db.getFitSessionsByUserId(ctx.user.id, 5);
        if (sessions.length >= 5 && !(await db.hasAchievement(ctx.user.id, "fit_practitioner"))) {
          await db.createAchievement({
            userId: ctx.user.id,
            achievementType: "fit_practitioner",
            achievementName: "Visualization Master",
            description: "Completed 5 FIT visualization sessions!",
            iconName: "eye"
          });
        }
        
        return session;
      }),
    
    list: protectedProcedure
      .input(z.object({ limit: z.number().optional() }).optional())
      .query(async ({ ctx, input }) => {
        return await db.getFitSessionsByUserId(ctx.user.id, input?.limit || 30);
      }),
  }),
});

export type AppRouter = typeof appRouter;

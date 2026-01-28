import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  BookOpen, Brain, Heart, Lightbulb, Sparkles, 
  ChevronRight, X, Leaf, Target, Shield
} from "lucide-react";
import { Streamdown } from "streamdown";

interface Article {
  id: string;
  title: string;
  description: string;
  category: string;
  icon: typeof BookOpen;
  color: string;
  content: string;
}

const ARTICLES: Article[] = [
  {
    id: "mindful-eating-basics",
    title: "What is Mindful Eating?",
    description: "Learn the fundamentals of eating with awareness and intention",
    category: "mindful-eating",
    icon: Leaf,
    color: "text-green-500",
    content: `# What is Mindful Eating?

Mindful eating is the practice of paying full attention to the experience of eating and drinking, both inside and outside the body. It involves:

## Core Principles

**1. Eating with Awareness**
- Notice the colors, smells, textures, and flavors of your food
- Pay attention to how your body feels before, during, and after eating
- Recognize hunger and fullness cues

**2. Non-Judgmental Observation**
- Observe your thoughts and feelings about food without criticism
- Let go of "good food" and "bad food" labels
- Practice self-compassion when you eat in ways you didn't intend

**3. Intentional Choices**
- Choose foods that are both pleasing and nourishing
- Eat when you're physically hungry, not just emotionally hungry
- Stop eating when you're comfortably satisfied, not stuffed

## Benefits of Mindful Eating

Research shows that mindful eating can help:
- Reduce binge eating and emotional eating episodes
- Improve digestion and satisfaction from meals
- Decrease anxiety around food
- Support a healthier relationship with your body
- Increase enjoyment of food

## Getting Started

Start with just one mindful meal per day. Put away distractions, sit down, and really taste your food. Notice how different this feels from eating on autopilot.

Remember: Mindful eating is a practice, not perfection. Every meal is a new opportunity to be present.`
  },
  {
    id: "intuitive-eating",
    title: "The 10 Principles of Intuitive Eating",
    description: "Discover the framework for making peace with food",
    category: "mindful-eating",
    icon: Heart,
    color: "text-pink-500",
    content: `# The 10 Principles of Intuitive Eating

Intuitive Eating, developed by dietitians Evelyn Tribole and Elyse Resch, is an evidence-based approach to eating that helps you develop a healthy relationship with food.

## The 10 Principles

### 1. Reject the Diet Mentality
Throw out diet books and articles that promise quick weight loss. Get angry at diet culture that promotes the false hope of losing weight quickly and permanently.

### 2. Honor Your Hunger
Keep your body fed with adequate energy and carbohydrates. Once you reach excessive hunger, all intentions of moderate eating go out the window.

### 3. Make Peace with Food
Give yourself unconditional permission to eat. When you tell yourself you can't have a certain food, it leads to intense feelings of deprivation and uncontrollable cravings.

### 4. Challenge the Food Police
Say no to thoughts that declare you're "good" for eating minimal calories or "bad" for eating chocolate cake. The food police monitor the unreasonable rules that diet culture has created.

### 5. Discover the Satisfaction Factor
When you eat what you really want, in an environment that is inviting, the pleasure you derive will help you feel satisfied and content.

### 6. Feel Your Fullness
Listen for body signals that tell you that you're no longer hungry. Pause in the middle of eating and ask yourself how the food tastes and what your current hunger level is.

### 7. Cope with Your Emotions with Kindness
Find ways to comfort, nurture, distract, and resolve your issues without using food. Anxiety, loneliness, boredom, and anger are emotions we all experience.

### 8. Respect Your Body
Accept your genetic blueprint. Just as a person with a shoe size of 8 wouldn't expect to squeeze into a size 6, it's futile to have similar expectations about body size.

### 9. Movement—Feel the Difference
Shift your focus to how it feels to move your body, rather than the calorie-burning effect of exercise. Focus on how energized you feel.

### 10. Honor Your Health with Gentle Nutrition
Make food choices that honor your health and taste buds while making you feel good. You don't have to eat perfectly to be healthy.

## Remember
Progress, not perfection. One snack, one meal, or one day of eating doesn't define your health or worth.`
  },
  {
    id: "emotional-eating-triggers",
    title: "Understanding Emotional Eating Triggers",
    description: "Identify what drives you to eat when you're not hungry",
    category: "emotional-eating",
    icon: Brain,
    color: "text-purple-500",
    content: `# Understanding Emotional Eating Triggers

Emotional eating is using food to make yourself feel better—eating to satisfy emotional needs rather than physical hunger.

## Common Triggers

### Stress
When stress is chronic, your body produces high levels of cortisol, which triggers cravings for salty, sweet, and fried foods.

### Difficult Emotions
- **Sadness**: Food can be a way to fill an emotional void
- **Anxiety**: Eating can temporarily calm nervous feelings
- **Anger**: Food can stuff down feelings you don't want to express
- **Loneliness**: Food can be a companion
- **Boredom**: Eating gives you something to do

### Childhood Habits
If your parents rewarded good behavior with ice cream or gave you sweets when you were sad, you may continue this pattern.

### Social Influences
- Eating with others can lead to overeating
- Food is often the center of social gatherings
- Pressure to eat from family or friends

### Situational Triggers
- Watching TV
- Coming home from work
- Late nights
- Certain locations or events

## Physical vs. Emotional Hunger

| Physical Hunger | Emotional Hunger |
|----------------|------------------|
| Comes on gradually | Comes on suddenly |
| Open to different foods | Craves specific foods |
| Located in stomach | Located in mouth/mind |
| Can wait | Feels urgent |
| Stops when full | Doesn't stop when full |
| No guilt afterward | Often followed by guilt |

## Breaking the Cycle

1. **Pause before eating**: Ask yourself, "Am I physically hungry?"
2. **Keep a food-mood journal**: Track what you eat and how you feel
3. **Find alternatives**: Make a list of activities that address your emotions
4. **Practice self-compassion**: Don't beat yourself up if you slip

Remember: Awareness is the first step to change.`
  },
  {
    id: "cbt-techniques",
    title: "CBT Techniques for Emotional Eating",
    description: "Use cognitive behavioral strategies to change eating patterns",
    category: "techniques",
    icon: Target,
    color: "text-blue-500",
    content: `# CBT Techniques for Emotional Eating

Cognitive Behavioral Therapy (CBT) is one of the most effective treatments for emotional eating. It focuses on identifying and changing unhelpful thought patterns and behaviors.

## Core CBT Concepts

### 1. The Thought-Feeling-Behavior Connection
Our thoughts influence our feelings, which influence our behaviors. By changing our thoughts, we can change our behaviors.

**Example:**
- Thought: "I had a terrible day, I deserve a treat"
- Feeling: Entitled, stressed
- Behavior: Eating a whole bag of chips

### 2. Cognitive Distortions
Common thinking errors that lead to emotional eating:

- **All-or-nothing thinking**: "I ate one cookie, so I might as well eat the whole box"
- **Emotional reasoning**: "I feel like eating, so I must be hungry"
- **Should statements**: "I should never eat sweets"
- **Catastrophizing**: "If I gain weight, my life will be ruined"

## CBT Techniques

### Thought Records
When you have an urge to emotionally eat:
1. Identify the situation
2. Notice your automatic thoughts
3. Identify the emotion and rate its intensity
4. Challenge the thought with evidence
5. Create a balanced alternative thought
6. Re-rate the emotion

### Behavioral Experiments
Test your beliefs about food:
- "If I allow myself to eat chocolate, I'll never stop" → Try keeping chocolate in the house and observe what actually happens

### Stimulus Control
- Remove trigger foods from easy access
- Create a designated eating space
- Establish regular meal times

### Response Prevention
- Delay acting on urges (start with 10 minutes)
- Use the time to practice coping skills
- Notice that urges pass without acting on them

## Daily Practice

1. Notice one automatic thought about food today
2. Ask yourself: "Is this thought helpful? Is it true?"
3. Generate an alternative, more balanced thought

Remember: Changing thought patterns takes practice. Be patient with yourself.`
  },
  {
    id: "dbt-skills",
    title: "DBT Skills for Managing Urges",
    description: "Learn distress tolerance and emotion regulation skills",
    category: "techniques",
    icon: Shield,
    color: "text-indigo-500",
    content: `# DBT Skills for Managing Urges

Dialectical Behavior Therapy (DBT) was originally developed for borderline personality disorder but has proven highly effective for emotional eating and binge eating.

## Core DBT Concepts

### Dialectics
Holding two seemingly opposite truths at once:
- "I accept myself as I am AND I want to change"
- "I'm doing my best AND I can do better"

### Wise Mind
The integration of:
- **Emotion Mind**: Decisions based purely on feelings
- **Reasonable Mind**: Decisions based purely on logic
- **Wise Mind**: The balance of both, plus intuition

## Key DBT Skills

### 1. Urge Surfing
Instead of fighting urges, observe them like waves:
- Notice where you feel the urge in your body
- Describe the sensation without judgment
- Watch it rise, peak, and fall
- Remember: Urges typically last 15-20 minutes

### 2. TIPP Skills (for intense emotions)
- **T**emperature: Cold water on face activates dive reflex
- **I**ntense exercise: Burns off stress hormones
- **P**aced breathing: Exhale longer than inhale
- **P**rogressive relaxation: Tense and release muscles

### 3. Opposite Action
When an emotion doesn't fit the facts or isn't effective:
- Identify the emotion and its action urge
- Do the opposite of what the emotion tells you to do
- Do it all the way, with your whole self

**Examples:**
- Sadness urges isolation → Reach out to someone
- Anxiety urges avoidance → Approach what you fear
- Anger urges attack → Be gentle, step back

### 4. STOP Skill
- **S**top: Don't react immediately
- **T**ake a step back: Breathe, don't act
- **O**bserve: What's happening inside and outside?
- **P**roceed mindfully: Act with awareness

### 5. Radical Acceptance
Accepting reality as it is, without judgment:
- "This is what happened. Fighting reality only increases suffering."
- Acceptance doesn't mean approval
- It frees energy for effective action

## Practice This Week

Choose one skill to practice daily. Notice what works for you.`
  },
  {
    id: "act-approach",
    title: "ACT: Acceptance and Commitment Therapy",
    description: "Learn to accept difficult thoughts and commit to values-based action",
    category: "techniques",
    icon: Sparkles,
    color: "text-amber-500",
    content: `# ACT: Acceptance and Commitment Therapy

Acceptance and Commitment Therapy (ACT) helps you accept what is out of your control and commit to actions that enrich your life.

## The Six Core Processes

### 1. Acceptance
- Allowing thoughts and feelings to come and go without struggling with them
- Not the same as liking or wanting difficult experiences
- "I'm having the thought that I need to eat right now"

### 2. Cognitive Defusion
- Creating distance from your thoughts
- Seeing thoughts as just thoughts, not facts
- Techniques:
  - "I notice I'm having the thought that..."
  - Sing the thought to a silly tune
  - Say the thought in a cartoon voice

### 3. Being Present
- Contacting the present moment fully
- Observing your experience without judgment
- Using your five senses to anchor in the now

### 4. Self-as-Context
- You are not your thoughts, feelings, or urges
- You are the awareness that observes these experiences
- The "observing self" remains constant while experiences change

### 5. Values
- Clarifying what truly matters to you
- Values are directions, not destinations
- Examples: health, connection, growth, compassion

### 6. Committed Action
- Taking effective action guided by your values
- Setting goals aligned with what matters
- Persisting despite obstacles

## ACT for Emotional Eating

### Step 1: Notice and Name
"I'm noticing an urge to eat. I'm feeling anxious."

### Step 2: Accept
"This feeling is uncomfortable, but I can make room for it."

### Step 3: Defuse
"I'm having the thought that food will make me feel better. That's just a thought."

### Step 4: Connect with Values
"What matters to me right now? Health? Self-care? Being present?"

### Step 5: Take Committed Action
"What small step can I take right now that aligns with my values?"

## The Choice Point

In any moment, you can choose:
- **Away moves**: Actions that take you away from your values (emotional eating)
- **Toward moves**: Actions that move you toward your values (self-care, presence)

Both are available. Which will you choose?

## Daily Practice

1. Notice one urge today without acting on it
2. Ask: "What would I do if this urge wasn't here?"
3. Take that action anyway`
  },
  {
    id: "self-compassion",
    title: "Self-Compassion and Emotional Eating",
    description: "Learn to treat yourself with kindness instead of criticism",
    category: "mindset",
    icon: Heart,
    color: "text-rose-500",
    content: `# Self-Compassion and Emotional Eating

Research by Dr. Kristin Neff shows that self-compassion is more effective than self-criticism for changing behavior.

## What is Self-Compassion?

Self-compassion has three components:

### 1. Self-Kindness
- Treating yourself with warmth and understanding
- Speaking to yourself as you would a good friend
- Offering comfort instead of criticism

### 2. Common Humanity
- Recognizing that suffering is part of the human experience
- Understanding that you're not alone in your struggles
- Connecting with others who face similar challenges

### 3. Mindfulness
- Being aware of your pain without over-identifying with it
- Neither suppressing nor exaggerating your feelings
- Holding your experience with balanced awareness

## Why Self-Criticism Backfires

When you criticize yourself for emotional eating:
- Stress hormones increase
- You feel worse about yourself
- You're more likely to seek comfort... in food
- The cycle continues

## Self-Compassion Breaks the Cycle

When you respond with compassion:
- You feel supported and understood
- Stress hormones decrease
- You can think more clearly
- You're better able to make healthy choices

## The Self-Compassion Break

When you're struggling, try this:

**1. Acknowledge the difficulty**
"This is a moment of suffering" or "This is really hard right now"

**2. Remember common humanity**
"Suffering is part of life" or "Other people feel this way too"

**3. Offer yourself kindness**
"May I be kind to myself" or "May I give myself the compassion I need"

## Compassionate Self-Talk

Instead of: "I'm so weak. I can't believe I ate that."
Try: "I'm struggling right now. This is hard. What do I need?"

Instead of: "I have no willpower. I'm disgusting."
Try: "I'm human. I'm doing my best. How can I support myself?"

## Practice: Letter to Yourself

Write a letter to yourself from the perspective of a compassionate friend who:
- Sees your struggles clearly
- Accepts you unconditionally
- Wants the best for you
- Offers gentle guidance

Read this letter when you're being hard on yourself.

## Remember

You deserve the same kindness you would give to someone you love.`
  },
  {
    id: "hunger-fullness",
    title: "The Hunger-Fullness Scale",
    description: "Learn to recognize and respond to your body's signals",
    category: "mindful-eating",
    icon: Lightbulb,
    color: "text-yellow-500",
    content: `# The Hunger-Fullness Scale

Learning to recognize hunger and fullness cues is fundamental to mindful eating. This scale helps you tune into your body's signals.

## The 1-10 Scale

### 1 - Starving
- Extremely hungry, weak, dizzy
- May feel irritable or unable to concentrate
- Danger zone: likely to overeat

### 2 - Ravenous
- Very hungry, stomach growling loudly
- Thinking about food constantly
- Need to eat soon

### 3 - Hungry
- Clear hunger signals
- Stomach feels empty
- Good time to eat

### 4 - Slightly Hungry
- Beginning to think about food
- Could eat, but not urgent
- Might be a good time to plan a meal

### 5 - Neutral
- Neither hungry nor full
- Comfortable
- No thoughts about food

### 6 - Satisfied
- Pleasantly satisfied
- Could eat more but don't need to
- Ideal stopping point

### 7 - Full
- Slightly uncomfortable
- Ate a bit too much
- Stomach feels stretched

### 8 - Very Full
- Uncomfortable
- Definitely ate too much
- May feel sluggish

### 9 - Stuffed
- Very uncomfortable
- Stomach hurts
- May feel nauseous

### 10 - Painfully Full
- Extremely uncomfortable
- May feel sick
- Regret eating so much

## Guidelines

### Ideal Eating Range: 3-6
- Start eating around 3 (hungry)
- Stop eating around 6 (satisfied)
- This prevents both extreme hunger and overeating

### Check In Regularly
- Before eating: "Where am I on the scale?"
- During eating: Pause halfway through to reassess
- After eating: "Where am I now?"

## Common Challenges

### "I can't tell if I'm hungry"
- Practice checking in at regular intervals
- Notice physical sensations (stomach, energy, mood)
- Keep a hunger journal

### "I always eat past fullness"
- Eat more slowly
- Put your fork down between bites
- Remove distractions
- Serve smaller portions

### "I'm never at a 3 - I'm always starving or not hungry"
- Eat regular meals to stabilize hunger
- Don't skip meals
- Include protein and fiber for sustained energy

## Practice This Week

Before each meal, rate your hunger. Halfway through, check in again. After eating, note where you ended up. Look for patterns.

Remember: This is information, not judgment. You're learning about your body.`
  }
];

const CATEGORIES = [
  { id: "all", label: "All Topics" },
  { id: "mindful-eating", label: "Mindful Eating" },
  { id: "emotional-eating", label: "Emotional Eating" },
  { id: "techniques", label: "Techniques" },
  { id: "mindset", label: "Mindset" },
];

export default function Learn() {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);

  const filteredArticles = selectedCategory === "all" 
    ? ARTICLES 
    : ARTICLES.filter(a => a.category === selectedCategory);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">Learn</h1>
          <p className="text-muted-foreground mt-1">
            Evidence-based education to support your mindful eating journey
          </p>
        </div>

        {/* Category Tabs */}
        <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
          <TabsList className="flex-wrap h-auto gap-2">
            {CATEGORIES.map(cat => (
              <TabsTrigger key={cat.id} value={cat.id} className="text-sm">
                {cat.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        {/* Articles Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredArticles.map(article => (
            <Card 
              key={article.id}
              className="cursor-pointer hover:shadow-lg transition-all hover:-translate-y-1"
              onClick={() => setSelectedArticle(article)}
            >
              <CardHeader className="pb-3">
                <div className={`w-10 h-10 rounded-lg bg-muted flex items-center justify-center ${article.color} mb-2`}>
                  <article.icon className="h-5 w-5" />
                </div>
                <CardTitle className="text-lg">{article.title}</CardTitle>
                <CardDescription>{article.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="ghost" className="w-full justify-between">
                  Read Article
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Daily Tip */}
        <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-xl bg-primary/20">
                <Lightbulb className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-2">Daily Tip</h3>
                <p className="text-muted-foreground">
                  Before your next meal, take three deep breaths and ask yourself: 
                  "Am I physically hungry, or am I eating for another reason?" 
                  There's no wrong answer—just awareness.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Article Dialog */}
      <Dialog open={!!selectedArticle} onOpenChange={(open) => !open && setSelectedArticle(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh]">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle className="flex items-center gap-2">
                {selectedArticle && (
                  <>
                    <selectedArticle.icon className={`h-5 w-5 ${selectedArticle.color}`} />
                    {selectedArticle.title}
                  </>
                )}
              </DialogTitle>
              <Button variant="ghost" size="icon" onClick={() => setSelectedArticle(null)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </DialogHeader>
          <ScrollArea className="max-h-[70vh] pr-4">
            {selectedArticle && (
              <div className="prose prose-sm max-w-none dark:prose-invert">
                <Streamdown>{selectedArticle.content}</Streamdown>
              </div>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}

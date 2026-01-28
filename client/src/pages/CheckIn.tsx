import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { useLocation } from "wouter";
import { Heart, Sparkles, Check } from "lucide-react";

const MOODS = [
  { value: "great", emoji: "😊", label: "Great" },
  { value: "good", emoji: "🙂", label: "Good" },
  { value: "okay", emoji: "😐", label: "Okay" },
  { value: "low", emoji: "😔", label: "Low" },
  { value: "struggling", emoji: "😢", label: "Struggling" },
] as const;

const EMOTIONS = [
  "anxious", "stressed", "sad", "lonely", "bored", "frustrated",
  "angry", "overwhelmed", "tired", "happy", "calm", "excited",
  "guilty", "ashamed", "hopeful", "grateful"
];

const TRIGGERS = [
  { value: "work_stress", label: "Work Stress" },
  { value: "relationship_issues", label: "Relationship Issues" },
  { value: "loneliness", label: "Loneliness" },
  { value: "boredom", label: "Boredom" },
  { value: "celebration", label: "Celebration" },
  { value: "social_pressure", label: "Social Pressure" },
  { value: "tiredness", label: "Tiredness" },
  { value: "habit", label: "Habit" },
  { value: "tv_watching", label: "TV/Screen Time" },
  { value: "late_night", label: "Late Night" },
  { value: "skipped_meal", label: "Skipped Meal" },
  { value: "negative_thoughts", label: "Negative Thoughts" },
];

export default function CheckIn() {
  const [, navigate] = useLocation();
  const { data: todayCheckIn, isLoading: checkingToday } = trpc.checkIn.today.useQuery();
  
  const [step, setStep] = useState(1);
  const [mood, setMood] = useState<typeof MOODS[number]["value"]>("okay");
  const [hungerLevel, setHungerLevel] = useState(5);
  const [selectedEmotions, setSelectedEmotions] = useState<string[]>([]);
  const [selectedTriggers, setSelectedTriggers] = useState<string[]>([]);
  const [notes, setNotes] = useState("");
  const [isEmotionalEating, setIsEmotionalEating] = useState(false);

  const utils = trpc.useUtils();
  const createCheckIn = trpc.checkIn.create.useMutation({
    onSuccess: () => {
      toast.success("Check-in complete! Great job taking care of yourself.", {
        icon: <Sparkles className="h-4 w-4" />
      });
      utils.checkIn.today.invalidate();
      utils.checkIn.list.invalidate();
      utils.progress.dashboard.invalidate();
      navigate("/dashboard");
    },
    onError: () => {
      toast.error("Something went wrong. Please try again.");
    }
  });

  const toggleEmotion = (emotion: string) => {
    setSelectedEmotions(prev => 
      prev.includes(emotion) 
        ? prev.filter(e => e !== emotion)
        : [...prev, emotion]
    );
  };

  const toggleTrigger = (trigger: string) => {
    setSelectedTriggers(prev => 
      prev.includes(trigger) 
        ? prev.filter(t => t !== trigger)
        : [...prev, trigger]
    );
  };

  const handleSubmit = () => {
    createCheckIn.mutate({
      mood,
      moodEmoji: MOODS.find(m => m.value === mood)?.emoji,
      hungerLevel,
      emotions: selectedEmotions,
      triggers: selectedTriggers,
      notes: notes || undefined,
      isEmotionalEating
    });
  };

  const getHungerLabel = (level: number) => {
    if (level <= 2) return "Very Hungry";
    if (level <= 4) return "Hungry";
    if (level <= 6) return "Neutral";
    if (level <= 8) return "Satisfied";
    return "Very Full";
  };

  if (checkingToday) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-pulse text-muted-foreground">Loading...</div>
        </div>
      </DashboardLayout>
    );
  }

  if (todayCheckIn) {
    return (
      <DashboardLayout>
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-4">
                <Check className="h-8 w-8 text-green-500" />
              </div>
              <h2 className="text-2xl font-bold text-foreground mb-2">Already Checked In Today!</h2>
              <p className="text-muted-foreground mb-6">
                You logged your mood as {todayCheckIn.mood} {MOODS.find(m => m.value === todayCheckIn.mood)?.emoji}
              </p>
              <Button onClick={() => navigate("/dashboard")}>
                Back to Dashboard
              </Button>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto">
        {/* Progress indicator */}
        <div className="flex items-center gap-2 mb-6">
          {[1, 2, 3, 4].map(s => (
            <div 
              key={s}
              className={`h-2 flex-1 rounded-full transition-colors ${
                s <= step ? 'bg-primary' : 'bg-muted'
              }`}
            />
          ))}
        </div>

        {step === 1 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="h-5 w-5 text-primary" />
                How are you feeling right now?
              </CardTitle>
              <CardDescription>
                Take a moment to check in with yourself
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-5 gap-2">
                {MOODS.map(m => (
                  <button
                    key={m.value}
                    onClick={() => setMood(m.value)}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      mood === m.value 
                        ? 'border-primary bg-primary/10' 
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <div className="text-3xl mb-1">{m.emoji}</div>
                    <div className="text-xs text-muted-foreground">{m.label}</div>
                  </button>
                ))}
              </div>
              <Button className="w-full" onClick={() => setStep(2)}>
                Continue
              </Button>
            </CardContent>
          </Card>
        )}

        {step === 2 && (
          <Card>
            <CardHeader>
              <CardTitle>How hungry are you?</CardTitle>
              <CardDescription>
                Rate your physical hunger on a scale of 1-10
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Very Hungry</span>
                  <span>Very Full</span>
                </div>
                <Slider
                  value={[hungerLevel]}
                  onValueChange={([val]) => setHungerLevel(val)}
                  min={1}
                  max={10}
                  step={1}
                  className="py-4"
                />
                <div className="text-center">
                  <span className="text-3xl font-bold text-primary">{hungerLevel}</span>
                  <p className="text-sm text-muted-foreground mt-1">{getHungerLabel(hungerLevel)}</p>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                <div>
                  <Label htmlFor="emotional-eating" className="font-medium">
                    Emotional Eating?
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Are you eating for emotional reasons rather than hunger?
                  </p>
                </div>
                <Switch
                  id="emotional-eating"
                  checked={isEmotionalEating}
                  onCheckedChange={setIsEmotionalEating}
                />
              </div>

              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setStep(1)} className="flex-1">
                  Back
                </Button>
                <Button onClick={() => setStep(3)} className="flex-1">
                  Continue
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {step === 3 && (
          <Card>
            <CardHeader>
              <CardTitle>What emotions are present?</CardTitle>
              <CardDescription>
                Select all that apply (optional)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-wrap gap-2">
                {EMOTIONS.map(emotion => (
                  <button
                    key={emotion}
                    onClick={() => toggleEmotion(emotion)}
                    className={`px-3 py-1.5 rounded-full text-sm transition-all ${
                      selectedEmotions.includes(emotion)
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted hover:bg-muted/80 text-foreground'
                    }`}
                  >
                    {emotion}
                  </button>
                ))}
              </div>

              <div>
                <Label className="text-base font-medium mb-3 block">Any triggers today?</Label>
                <div className="flex flex-wrap gap-2">
                  {TRIGGERS.map(trigger => (
                    <button
                      key={trigger.value}
                      onClick={() => toggleTrigger(trigger.value)}
                      className={`px-3 py-1.5 rounded-full text-sm transition-all ${
                        selectedTriggers.includes(trigger.value)
                          ? 'bg-destructive/20 text-destructive border border-destructive/30'
                          : 'bg-muted hover:bg-muted/80 text-foreground'
                      }`}
                    >
                      {trigger.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setStep(2)} className="flex-1">
                  Back
                </Button>
                <Button onClick={() => setStep(4)} className="flex-1">
                  Continue
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {step === 4 && (
          <Card>
            <CardHeader>
              <CardTitle>Any additional notes?</CardTitle>
              <CardDescription>
                Reflect on your current state (optional)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Textarea
                placeholder="What's on your mind? How is your body feeling? Any patterns you're noticing?"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={4}
              />

              <div className="p-4 rounded-lg bg-muted/50">
                <h4 className="font-medium mb-2">Your Check-in Summary</h4>
                <div className="space-y-1 text-sm text-muted-foreground">
                  <p>Mood: {MOODS.find(m => m.value === mood)?.emoji} {mood}</p>
                  <p>Hunger Level: {hungerLevel}/10 ({getHungerLabel(hungerLevel)})</p>
                  {selectedEmotions.length > 0 && (
                    <p>Emotions: {selectedEmotions.join(", ")}</p>
                  )}
                  {selectedTriggers.length > 0 && (
                    <p>Triggers: {selectedTriggers.map(t => TRIGGERS.find(tr => tr.value === t)?.label).join(", ")}</p>
                  )}
                  {isEmotionalEating && <p>Emotional eating: Yes</p>}
                </div>
              </div>

              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setStep(3)} className="flex-1">
                  Back
                </Button>
                <Button 
                  onClick={handleSubmit} 
                  className="flex-1"
                  disabled={createCheckIn.isPending}
                >
                  {createCheckIn.isPending ? "Saving..." : "Complete Check-in"}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}

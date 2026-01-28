import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Target, Plus, Check, Sparkles, Calendar, TrendingUp } from "lucide-react";

const SUGGESTED_HABITS = [
  { name: "Daily Check-in", description: "Log your mood and hunger levels each morning" },
  { name: "Mindful Meal", description: "Eat one meal mindfully without distractions" },
  { name: "Pause Before Eating", description: "Take 3 breaths before each meal or snack" },
  { name: "Gratitude Practice", description: "Write 3 things you're grateful for" },
  { name: "Body Scan", description: "Do a quick body scan to check in with physical sensations" },
  { name: "Urge Surfing", description: "Practice riding out one craving without acting on it" },
  { name: "Self-Compassion", description: "Speak kindly to yourself when you slip up" },
  { name: "Hydration", description: "Drink 8 glasses of water throughout the day" },
];

export default function Habits() {
  const [isCreating, setIsCreating] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [frequency, setFrequency] = useState<"daily" | "weekly" | "custom">("daily");

  const { data: habits, isLoading } = trpc.habits.list.useQuery();

  const utils = trpc.useUtils();
  
  const createHabit = trpc.habits.create.useMutation({
    onSuccess: () => {
      toast.success("Habit created! Start building your new routine.");
      utils.habits.list.invalidate();
      setIsCreating(false);
      setName("");
      setDescription("");
      setFrequency("daily");
    },
    onError: () => {
      toast.error("Failed to create habit. Please try again.");
    }
  });

  const completeHabit = trpc.habits.complete.useMutation({
    onSuccess: () => {
      toast.success("Great job! Keep up the good work!", {
        icon: <Sparkles className="h-4 w-4" />
      });
      utils.habits.list.invalidate();
      utils.progress.dashboard.invalidate();
    }
  });

  const handleCreate = () => {
    if (!name.trim()) {
      toast.error("Please enter a habit name.");
      return;
    }
    createHabit.mutate({
      name,
      description: description || undefined,
      frequency
    });
  };

  const handleComplete = (habitId: number) => {
    completeHabit.mutate({ habitId });
  };

  const selectSuggested = (habit: typeof SUGGESTED_HABITS[0]) => {
    setName(habit.name);
    setDescription(habit.description);
    setIsCreating(true);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">Habit Builder</h1>
            <p className="text-muted-foreground mt-1">
              Build sustainable mindful eating habits one step at a time
            </p>
          </div>
          <Dialog open={isCreating} onOpenChange={setIsCreating}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                New Habit
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Habit</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Habit Name</label>
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g., Mindful breakfast"
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Description (optional)</label>
                  <Textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="What does this habit involve?"
                    rows={2}
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Frequency</label>
                  <Select value={frequency} onValueChange={(v: any) => setFrequency(v)}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="custom">Custom</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex gap-3">
                  <Button 
                    variant="outline" 
                    onClick={() => setIsCreating(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleCreate}
                    disabled={createHabit.isPending}
                    className="flex-1"
                  >
                    {createHabit.isPending ? "Creating..." : "Create Habit"}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Active Habits */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Your Habits</h2>
          {isLoading ? (
            <div className="grid md:grid-cols-2 gap-4">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-32 bg-muted animate-pulse rounded-xl" />
              ))}
            </div>
          ) : habits && habits.length > 0 ? (
            <div className="grid md:grid-cols-2 gap-4">
              {habits.map(habit => (
                <Card key={habit.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Target className="h-4 w-4 text-primary" />
                          <h3 className="font-medium text-foreground truncate">{habit.name}</h3>
                        </div>
                        {habit.description && (
                          <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                            {habit.description}
                          </p>
                        )}
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {habit.frequency}
                          </span>
                          <span className="flex items-center gap-1">
                            <TrendingUp className="h-3 w-3" />
                            {habit.currentCount} completed
                          </span>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant={completeHabit.isPending ? "outline" : "default"}
                        onClick={() => handleComplete(habit.id)}
                        disabled={completeHabit.isPending}
                        className="flex-shrink-0"
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <Target className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                <h3 className="font-medium text-foreground mb-2">No habits yet</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Start building mindful eating habits today
                </p>
                <Button onClick={() => setIsCreating(true)}>
                  Create Your First Habit
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Suggested Habits */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Suggested Habits</CardTitle>
            <CardDescription>
              Evidence-based habits to support your mindful eating journey
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {SUGGESTED_HABITS.map((habit, i) => (
                <button
                  key={i}
                  onClick={() => selectSuggested(habit)}
                  className="p-3 text-left rounded-lg border border-border hover:border-primary hover:bg-primary/5 transition-colors"
                >
                  <h4 className="font-medium text-foreground text-sm mb-1">{habit.name}</h4>
                  <p className="text-xs text-muted-foreground line-clamp-2">{habit.description}</p>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Tips */}
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="p-6">
            <h3 className="font-semibold text-foreground mb-3">Tips for Building Habits</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold">1.</span>
                <span><strong>Start small:</strong> Begin with one habit and master it before adding more.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold">2.</span>
                <span><strong>Stack habits:</strong> Attach new habits to existing routines (e.g., "After I pour my coffee, I'll take 3 deep breaths").</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold">3.</span>
                <span><strong>Be specific:</strong> "Eat mindfully at lunch" is better than "eat better."</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold">4.</span>
                <span><strong>Celebrate wins:</strong> Acknowledge every time you complete a habit, no matter how small.</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { toast } from "sonner";
import { Eye, Plus, Star, Heart, Zap, Target } from "lucide-react";

const FIT_GUIDE = {
  title: "Functional Imagery Training (FIT)",
  description: "FIT uses vivid mental imagery to strengthen motivation and make goals feel real and achievable.",
  steps: [
    {
      step: 1,
      title: "Define Your Goal",
      description: "Be specific about what you want to achieve",
      example: "Reach 220 lbs by June 1st feeling strong and energized"
    },
    {
      step: 2,
      title: "Create a Vivid Mental Image",
      description: "Imagine yourself having achieved the goal in rich sensory detail",
      prompts: [
        "What do you see? (Mirror reflection, clothes fitting, scale number)",
        "What do you hear? (Compliments, confidence in your voice)",
        "What do you feel? (Energy, strength, lightness, pride)",
        "What do you smell/taste? (Fresh air, healthy food you enjoy)",
        "What emotions arise? (Joy, pride, relief, excitement)"
      ]
    },
    {
      step: 3,
      title: "Practice Daily",
      description: "Spend 5-10 minutes visualizing your success",
      timing: "Best times: morning (sets intention), before meals (strengthens resolve), before bed (primes subconscious)"
    },
    {
      step: 4,
      title: "Link to Action",
      description: "Connect the imagery to specific behaviors",
      example: "When tempted by junk food, recall the image of yourself at goal weight feeling amazing"
    }
  ],
  evidence: "Research shows FIT participants lose 5x more weight than control groups and maintain it long-term. It works by making future rewards feel more immediate and real, overriding short-term impulses."
};

const VISUALIZATION_CATEGORIES = [
  { value: "goal_weight", label: "Goal Weight Achievement", icon: Target },
  { value: "energy", label: "High Energy & Vitality", icon: Zap },
  { value: "confidence", label: "Confidence & Self-Image", icon: Star },
  { value: "health", label: "Health & Wellness", icon: Heart },
  { value: "lifestyle", label: "Lifestyle & Activities", icon: Eye }
];

export default function FIT() {
  const { user } = useAuth();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [category, setCategory] = useState<string>("goal_weight");
  const [goalDescription, setGoalDescription] = useState("");
  const [visualSee, setVisualSee] = useState("");
  const [visualHear, setVisualHear] = useState("");
  const [visualFeel, setVisualFeel] = useState("");
  const [visualSmellTaste, setVisualSmellTaste] = useState("");
  const [emotions, setEmotions] = useState("");
  const [vividness, setVividness] = useState([7]);
  const [notes, setNotes] = useState("");

  const { data: sessions, refetch } = trpc.fit.list.useQuery();
  const createSession = trpc.fit.create.useMutation({
    onSuccess: () => {
      toast.success("Visualization saved!");
      setIsDialogOpen(false);
      refetch();
      resetForm();
    },
    onError: () => toast.error("Failed to save visualization")
  });

  const resetForm = () => {
    setCategory("goal_weight");
    setGoalDescription("");
    setVisualSee("");
    setVisualHear("");
    setVisualFeel("");
    setVisualSmellTaste("");
    setEmotions("");
    setVividness([7]);
    setNotes("");
  };

  const handleSubmit = () => {
    if (!goalDescription || !visualSee) {
      toast.error("Please fill in at least goal description and what you see");
      return;
    }
    createSession.mutate({
      category: category as any,
      goalDescription,
      visualSee,
      visualHear: visualHear || undefined,
      visualFeel: visualFeel || undefined,
      visualSmellTaste: visualSmellTaste || undefined,
      emotions: emotions || undefined,
      vividness: vividness[0],
      notes: notes || undefined
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">FIT - Functional Imagery Training</h1>
          <p className="text-muted-foreground mt-1">
            Visualize your success to strengthen motivation and achieve your goals
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90">
              <Plus className="w-4 h-4 mr-2" />
              New Visualization
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create Visualization Session</DialogTitle>
              <DialogDescription>
                Build a vivid mental image of your success using all five senses
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label>Category</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {VISUALIZATION_CATEGORIES.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Goal Description</Label>
                <Textarea
                  value={goalDescription}
                  onChange={(e) => setGoalDescription(e.target.value)}
                  placeholder="e.g., I weigh 220 lbs, feel energized, and fit comfortably in my favorite clothes"
                  className="min-h-[80px]"
                />
              </div>

              <div className="border-t pt-4">
                <p className="font-medium mb-3">Sensory Details</p>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>What do you SEE?</Label>
                    <Textarea
                      value={visualSee}
                      onChange={(e) => setVisualSee(e.target.value)}
                      placeholder="Mirror reflection, scale number, clothes fitting, your body moving with ease..."
                      className="min-h-[60px]"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>What do you HEAR?</Label>
                    <Textarea
                      value={visualHear}
                      onChange={(e) => setVisualHear(e.target.value)}
                      placeholder="Compliments, confidence in your voice, sounds of activities you enjoy..."
                      className="min-h-[60px]"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>What do you FEEL physically?</Label>
                    <Textarea
                      value={visualFeel}
                      onChange={(e) => setVisualFeel(e.target.value)}
                      placeholder="Energy, strength, lightness, clothes fitting comfortably, ease of movement..."
                      className="min-h-[60px]"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>What do you SMELL/TASTE?</Label>
                    <Textarea
                      value={visualSmellTaste}
                      onChange={(e) => setVisualSmellTaste(e.target.value)}
                      placeholder="Fresh air, healthy foods you enjoy, scents associated with your success..."
                      className="min-h-[60px]"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>What EMOTIONS arise?</Label>
                    <Textarea
                      value={emotions}
                      onChange={(e) => setEmotions(e.target.value)}
                      placeholder="Joy, pride, relief, excitement, confidence, peace..."
                      className="min-h-[60px]"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Vividness (1-10)</Label>
                <div className="flex items-center gap-4">
                  <Slider
                    value={vividness}
                    onValueChange={setVividness}
                    min={1}
                    max={10}
                    step={1}
                    className="flex-1"
                  />
                  <span className="text-lg font-bold text-primary w-8">{vividness[0]}</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  How vivid and real does this visualization feel?
                </p>
              </div>

              <div className="space-y-2">
                <Label>Notes (optional)</Label>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Any additional thoughts or insights..."
                />
              </div>

              <Button onClick={handleSubmit} className="w-full" disabled={createSession.isPending}>
                {createSession.isPending ? "Saving..." : "Save Visualization"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* FIT Guide */}
      <Card className="border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="w-5 h-5 text-primary" />
            {FIT_GUIDE.title}
          </CardTitle>
          <CardDescription>{FIT_GUIDE.description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {FIT_GUIDE.steps.map((step) => (
            <div key={step.step} className="p-4 bg-muted/50 rounded-lg">
              <div className="flex items-start gap-3 mb-2">
                <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold flex-shrink-0">
                  {step.step}
                </div>
                <div className="flex-1">
                  <p className="font-medium mb-1">{step.title}</p>
                  <p className="text-sm text-muted-foreground mb-2">{step.description}</p>
                  {step.example && (
                    <p className="text-sm text-primary italic">Example: {step.example}</p>
                  )}
                  {step.prompts && (
                    <ul className="mt-2 space-y-1">
                      {step.prompts.map((prompt, i) => (
                        <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                          {prompt}
                        </li>
                      ))}
                    </ul>
                  )}
                  {step.timing && (
                    <p className="text-sm text-muted-foreground mt-2">
                      <strong>Timing:</strong> {step.timing}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-sm font-medium text-green-800 mb-1">Evidence</p>
            <p className="text-sm text-green-700">{FIT_GUIDE.evidence}</p>
          </div>
        </CardContent>
      </Card>

      {/* Visualization Categories */}
      <Card>
        <CardHeader>
          <CardTitle>Visualization Categories</CardTitle>
          <CardDescription>Different aspects of your transformation to focus on</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-3">
            {VISUALIZATION_CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              return (
                <div key={cat.value} className="p-4 bg-muted/50 rounded-lg flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  <span className="font-medium text-sm">{cat.label}</span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Saved Visualizations */}
      <Card>
        <CardHeader>
          <CardTitle>Your Visualizations</CardTitle>
          <CardDescription>Review and practice your imagery sessions</CardDescription>
        </CardHeader>
        <CardContent>
          {sessions && sessions.length > 0 ? (
            <div className="space-y-4">
              {sessions.map((session) => {
                const cat = VISUALIZATION_CATEGORIES.find(c => c.value === session.category);
                const Icon = cat?.icon || Eye;
                return (
                  <div key={session.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-lg">
                          <Icon className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">{cat?.label}</p>
                          <p className="text-sm text-muted-foreground">
                            Vividness: {session.vividness}/10 • {new Date(session.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div>
                        <p className="font-medium text-primary mb-1">Goal:</p>
                        <p className="text-muted-foreground">{session.goalDescription}</p>
                      </div>
                      <div>
                        <p className="font-medium mb-1">What I See:</p>
                        <p className="text-muted-foreground">{session.visualSee}</p>
                      </div>
                      {session.emotions && (
                        <div>
                          <p className="font-medium mb-1">Emotions:</p>
                          <p className="text-muted-foreground">{session.emotions}</p>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Eye className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No visualizations yet</p>
              <p className="text-sm">Create your first mental imagery session!</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Practice Tips */}
      <Card>
        <CardHeader>
          <CardTitle>Practice Tips</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>• Practice 5-10 minutes daily for best results</p>
            <p>• Morning sessions set positive intention for the day</p>
            <p>• Before meals: strengthens resolve against emotional eating</p>
            <p>• Before bed: primes your subconscious mind overnight</p>
            <p>• The more vivid and detailed, the more powerful the effect</p>
            <p>• Engage all five senses to make it feel real</p>
            <p>• Connect the imagery to specific actions (e.g., choosing healthy food)</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

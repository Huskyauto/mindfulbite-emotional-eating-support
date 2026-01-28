import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Slider } from "@/components/ui/slider";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { 
  Shield, Wind, Thermometer, Zap, Eye, Brain, 
  Heart, ArrowRight, CheckCircle, X, Waves
} from "lucide-react";

interface Tool {
  id: string;
  title: string;
  description: string;
  icon: typeof Shield;
  color: string;
  steps: string[];
  quickTip: string;
}

const TOOLS: Tool[] = [
  {
    id: "urge_surfing",
    title: "Urge Surfing",
    description: "Ride out cravings like waves - they rise, peak, and fall",
    icon: Waves,
    color: "text-blue-500 bg-blue-100 dark:bg-blue-900/30",
    quickTip: "Urges typically last 15-20 minutes. You can ride this wave!",
    steps: [
      "PAUSE - Don't act on the urge immediately. Take a breath.",
      "LOCATE - Where do you feel the urge in your body? Stomach? Chest? Throat?",
      "DESCRIBE - What does it feel like? Tight? Warm? Pulsing? Heavy?",
      "OBSERVE - Watch the sensation without trying to change it. It's just a feeling.",
      "BREATHE - Take slow, deep breaths into the area where you feel the urge.",
      "NOTICE - The intensity changes moment to moment. It won't stay at peak forever.",
      "REMIND - 'This is temporary. I can ride this wave without acting on it.'",
      "WAIT - Continue observing. Most urges subside within 15-20 minutes.",
      "CELEBRATE - You did it! Each time you surf an urge, you build strength."
    ]
  },
  {
    id: "deep_breathing",
    title: "4-7-8 Breathing",
    description: "Activate your parasympathetic nervous system to calm down",
    icon: Wind,
    color: "text-teal-500 bg-teal-100 dark:bg-teal-900/30",
    quickTip: "This technique can reduce anxiety in just 4 breath cycles.",
    steps: [
      "Find a comfortable position. You can sit, stand, or lie down.",
      "Place the tip of your tongue against the ridge behind your upper front teeth.",
      "Exhale completely through your mouth, making a whoosh sound.",
      "Close your mouth and inhale quietly through your nose for 4 counts.",
      "Hold your breath for 7 counts.",
      "Exhale completely through your mouth for 8 counts, making a whoosh sound.",
      "This is one breath cycle. Repeat for at least 4 cycles.",
      "Notice how your body feels. You may feel lightheaded - this is normal.",
      "Practice this twice daily and whenever you feel stressed or triggered."
    ]
  },
  {
    id: "tipp",
    title: "TIPP Technique",
    description: "Temperature, Intense exercise, Paced breathing, Progressive relaxation",
    icon: Thermometer,
    color: "text-red-500 bg-red-100 dark:bg-red-900/30",
    quickTip: "Cold water on your face can reduce heart rate in 30 seconds.",
    steps: [
      "T - TEMPERATURE: Hold ice cubes, splash cold water on your face, or take a cold shower.",
      "Cold activates the dive reflex, which slows your heart rate and calms you down.",
      "I - INTENSE EXERCISE: Do jumping jacks, run in place, or do burpees for 5-10 minutes.",
      "Physical activity burns off stress hormones and releases endorphins.",
      "P - PACED BREATHING: Breathe out longer than you breathe in (e.g., in for 4, out for 6).",
      "This activates your parasympathetic nervous system (rest and digest).",
      "P - PROGRESSIVE RELAXATION: Tense each muscle group for 5 seconds, then release.",
      "Start with your feet and work up to your face. Notice the contrast between tension and relaxation.",
      "Use any combination of these techniques based on what you have available."
    ]
  },
  {
    id: "grounding",
    title: "5-4-3-2-1 Grounding",
    description: "Use your senses to anchor yourself in the present moment",
    icon: Eye,
    color: "text-purple-500 bg-purple-100 dark:bg-purple-900/30",
    quickTip: "This technique interrupts anxious thoughts by engaging your senses.",
    steps: [
      "Take a deep breath and look around you.",
      "5 THINGS YOU CAN SEE: Name 5 things you can see right now. Look for small details.",
      "4 THINGS YOU CAN TOUCH: Notice 4 things you can feel - your feet on the floor, clothes on your skin.",
      "3 THINGS YOU CAN HEAR: Listen for 3 sounds - maybe traffic, birds, or your own breathing.",
      "2 THINGS YOU CAN SMELL: Notice 2 scents. If you can't smell anything, think of 2 favorite smells.",
      "1 THING YOU CAN TASTE: Notice 1 taste in your mouth, or think of your favorite taste.",
      "Take another deep breath.",
      "Notice how you feel now compared to when you started.",
      "You are here, in this moment. You are safe."
    ]
  },
  {
    id: "opposite_action",
    title: "Opposite Action",
    description: "Act opposite to your emotional urge to change how you feel",
    icon: Zap,
    color: "text-yellow-500 bg-yellow-100 dark:bg-yellow-900/30",
    quickTip: "Acting opposite to an emotion can actually change the emotion itself.",
    steps: [
      "IDENTIFY the emotion you're feeling (sad, anxious, angry, bored, etc.)",
      "NOTICE the action urge that comes with this emotion.",
      "For sadness: urge to isolate, stay in bed, avoid activities.",
      "For anxiety: urge to avoid, escape, seek reassurance.",
      "For anger: urge to attack, criticize, shut down.",
      "DO THE OPPOSITE of your urge, even if you don't feel like it.",
      "For sadness: get active, reach out to someone, engage in activities.",
      "For anxiety: approach what you're avoiding (gradually), stay present.",
      "For anger: be gentle, take space, speak softly, show empathy."
    ]
  },
  {
    id: "wise_mind",
    title: "Wise Mind",
    description: "Find the balance between emotion and logic",
    icon: Brain,
    color: "text-indigo-500 bg-indigo-100 dark:bg-indigo-900/30",
    quickTip: "Wise Mind is where emotion and reason overlap - your inner wisdom.",
    steps: [
      "Recognize you're in Emotion Mind (feelings are in control) or Reasonable Mind (pure logic).",
      "Neither extreme is wrong, but Wise Mind integrates both.",
      "Take a few deep breaths to center yourself.",
      "Ask: 'What does my emotional mind say about this situation?'",
      "Ask: 'What does my reasonable mind say about this situation?'",
      "Now ask: 'What does my wise mind say? What do I know deep down?'",
      "Wise Mind often speaks quietly. It feels like intuition or inner knowing.",
      "Trust that you have wisdom within you. You've navigated difficult situations before.",
      "Act from this place of balance and inner knowing."
    ]
  },
  {
    id: "distraction",
    title: "Healthy Distractions",
    description: "Redirect your attention until the urge passes",
    icon: Heart,
    color: "text-pink-500 bg-pink-100 dark:bg-pink-900/30",
    quickTip: "Distraction isn't avoidance - it's a tool to use until the urge passes.",
    steps: [
      "Remember: Distraction is a temporary tool, not a long-term solution.",
      "PHYSICAL: Take a walk, do stretches, dance, clean something.",
      "MENTAL: Do a puzzle, play a game, read, learn something new.",
      "SOCIAL: Call a friend, text someone, visit a neighbor.",
      "CREATIVE: Draw, write, craft, play music, cook something healthy.",
      "SENSORY: Take a shower, light a candle, listen to music, pet an animal.",
      "CONTRIBUTING: Help someone, volunteer, do something kind.",
      "Choose activities that engage you fully and match your energy level.",
      "After 15-20 minutes, check in: How strong is the urge now?"
    ]
  }
];

export default function Toolkit() {
  const [selectedTool, setSelectedTool] = useState<Tool | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [urgencyLevel, setUrgencyLevel] = useState(5);
  const [showRating, setShowRating] = useState(false);
  const [helpfulness, setHelpfulness] = useState(3);

  const utils = trpc.useUtils();
  const logUsage = trpc.toolkit.logUsage.useMutation({
    onSuccess: () => {
      toast.success("Great job using your coping tools!");
      utils.progress.dashboard.invalidate();
      setShowRating(false);
      setSelectedTool(null);
      setCurrentStep(0);
    }
  });

  const startTool = (tool: Tool) => {
    setSelectedTool(tool);
    setCurrentStep(0);
    setUrgencyLevel(5);
  };

  const nextStep = () => {
    if (selectedTool && currentStep < selectedTool.steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      setShowRating(true);
    }
  };

  const handleComplete = () => {
    if (selectedTool) {
      logUsage.mutate({
        toolType: selectedTool.id,
        urgencyLevel,
        helpfulnessRating: helpfulness
      });
    }
  };

  const closeTool = () => {
    setSelectedTool(null);
    setCurrentStep(0);
    setShowRating(false);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-destructive/10 text-destructive mb-4">
            <Shield className="h-4 w-4" />
            <span className="text-sm font-medium">Emergency Toolkit</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
            Feeling an Urge?
          </h1>
          <p className="text-muted-foreground">
            These evidence-based techniques can help you ride out cravings and manage difficult emotions.
            Choose the tool that feels right for you right now.
          </p>
        </div>

        {/* Quick Access Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {TOOLS.map(tool => (
            <Card 
              key={tool.id}
              className="cursor-pointer hover:shadow-lg transition-all hover:-translate-y-1"
              onClick={() => startTool(tool)}
            >
              <CardContent className="p-5">
                <div className={`w-12 h-12 rounded-xl ${tool.color} flex items-center justify-center mb-3`}>
                  <tool.icon className="h-6 w-6" />
                </div>
                <h3 className="font-semibold text-foreground mb-1">{tool.title}</h3>
                <p className="text-sm text-muted-foreground mb-3">{tool.description}</p>
                <Button className="w-full gap-2" size="sm">
                  Use Now <ArrowRight className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Tips Card */}
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="p-6">
            <h3 className="font-semibold text-foreground mb-3">Remember:</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                <span>Urges are temporary. They typically peak and subside within 15-20 minutes.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                <span>Each time you ride out an urge, you build strength and new neural pathways.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                <span>It's okay if you slip. Be compassionate with yourself and try again.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                <span>If urges are overwhelming, reach out to a professional for support.</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Tool Dialog */}
      <Dialog open={!!selectedTool && !showRating} onOpenChange={(open) => !open && closeTool()}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle className="flex items-center gap-2">
                {selectedTool && (
                  <>
                    <div className={`p-2 rounded-lg ${selectedTool.color}`}>
                      <selectedTool.icon className="h-5 w-5" />
                    </div>
                    {selectedTool.title}
                  </>
                )}
              </DialogTitle>
              <Button variant="ghost" size="icon" onClick={closeTool}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </DialogHeader>
          
          {selectedTool && (
            <div className="space-y-6">
              {/* Urgency Level */}
              {currentStep === 0 && (
                <div className="p-4 bg-muted/50 rounded-lg">
                  <label className="text-sm font-medium">How strong is your urge right now? (1-10)</label>
                  <Slider
                    value={[urgencyLevel]}
                    onValueChange={([val]) => setUrgencyLevel(val)}
                    min={1}
                    max={10}
                    step={1}
                    className="mt-3"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>Mild</span>
                    <span className="font-medium">{urgencyLevel}</span>
                    <span>Intense</span>
                  </div>
                </div>
              )}

              {/* Progress */}
              <div className="flex items-center gap-2">
                {selectedTool.steps.map((_, i) => (
                  <div 
                    key={i}
                    className={`h-1.5 flex-1 rounded-full transition-colors ${
                      i <= currentStep ? 'bg-primary' : 'bg-muted'
                    }`}
                  />
                ))}
              </div>

              {/* Quick Tip */}
              {currentStep === 0 && (
                <div className="p-3 bg-primary/10 rounded-lg text-sm text-primary">
                  <strong>Quick tip:</strong> {selectedTool.quickTip}
                </div>
              )}

              {/* Step Content */}
              <div className="min-h-[150px] flex items-center justify-center p-6 bg-muted/30 rounded-xl">
                <p className="text-lg text-center text-foreground leading-relaxed">
                  {selectedTool.steps[currentStep]}
                </p>
              </div>

              {/* Navigation */}
              <div className="flex items-center justify-between">
                <Button 
                  variant="outline" 
                  onClick={() => setCurrentStep(prev => Math.max(0, prev - 1))}
                  disabled={currentStep === 0}
                >
                  Previous
                </Button>
                <span className="text-sm text-muted-foreground">
                  Step {currentStep + 1} of {selectedTool.steps.length}
                </span>
                <Button onClick={nextStep}>
                  {currentStep === selectedTool.steps.length - 1 ? 'Complete' : 'Next'}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Rating Dialog */}
      <Dialog open={showRating} onOpenChange={setShowRating}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              Great Job!
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            <p className="text-muted-foreground">
              You used your coping tools! How helpful was this technique?
            </p>

            <div>
              <label className="text-sm font-medium">Helpfulness (1-5)</label>
              <Slider
                value={[helpfulness]}
                onValueChange={([val]) => setHelpfulness(val)}
                min={1}
                max={5}
                step={1}
                className="mt-3"
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>Not helpful</span>
                <span className="font-medium">{helpfulness}</span>
                <span>Very helpful</span>
              </div>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" onClick={closeTool} className="flex-1">
                Skip
              </Button>
              <Button 
                onClick={handleComplete}
                disabled={logUsage.isPending}
                className="flex-1"
              >
                {logUsage.isPending ? "Saving..." : "Save & Finish"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}

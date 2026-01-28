import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Slider } from "@/components/ui/slider";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { 
  Brain, Wind, Heart, Sparkles, Clock, Play, 
  CheckCircle, X, Leaf, Sun, Moon
} from "lucide-react";

interface Meditation {
  id: string;
  title: string;
  description: string;
  duration: number;
  icon: typeof Brain;
  color: string;
  steps: string[];
}

const MEDITATIONS: Meditation[] = [
  {
    id: "raisin",
    title: "Raisin Meditation",
    description: "A classic mindful eating exercise using a single raisin to develop awareness",
    duration: 10,
    icon: Leaf,
    color: "text-amber-500",
    steps: [
      "Hold the raisin in your palm. Look at it as if you've never seen one before.",
      "Notice its color, texture, ridges, and any unique features. Turn it over and explore every angle.",
      "Close your eyes and feel the raisin between your fingers. Notice its weight and texture.",
      "Bring the raisin to your nose. What do you smell? Take several slow breaths.",
      "Slowly bring the raisin to your lips. Notice any anticipation or sensations.",
      "Place the raisin in your mouth without chewing. Explore it with your tongue.",
      "Take one bite and notice the burst of flavor. Chew very slowly, savoring each sensation.",
      "Notice the urge to swallow. When ready, follow the raisin down your throat.",
      "Sit quietly and notice any lingering tastes or sensations. Reflect on this experience."
    ]
  },
  {
    id: "body_scan",
    title: "Body Scan",
    description: "A full-body awareness practice to identify physical sensations and tension",
    duration: 15,
    icon: Brain,
    color: "text-purple-500",
    steps: [
      "Find a comfortable position lying down or sitting. Close your eyes and take three deep breaths.",
      "Bring your attention to the top of your head. Notice any sensations without judgment.",
      "Slowly move your attention down to your forehead, eyes, cheeks, and jaw. Release any tension.",
      "Notice your neck and shoulders. These often hold stress. Breathe into any tightness.",
      "Move down through your arms, hands, and fingers. Feel the weight and temperature.",
      "Bring awareness to your chest and heart area. Notice your heartbeat and breath.",
      "Scan your stomach and abdomen. This is where we often feel emotions. What do you notice?",
      "Continue down through your hips, thighs, knees, calves, and feet.",
      "Finally, sense your entire body as a whole. Take three deep breaths and slowly open your eyes."
    ]
  },
  {
    id: "loving_kindness",
    title: "Loving-Kindness",
    description: "Cultivate compassion for yourself and others through gentle phrases",
    duration: 10,
    icon: Heart,
    color: "text-pink-500",
    steps: [
      "Sit comfortably and close your eyes. Take a few deep breaths to settle.",
      "Begin by directing loving-kindness to yourself. Repeat: 'May I be happy. May I be healthy. May I be at peace.'",
      "Picture yourself surrounded by warm, golden light as you repeat these phrases.",
      "Now think of someone you love. Direct the phrases to them: 'May you be happy. May you be healthy. May you be at peace.'",
      "Expand to include a neutral person - perhaps someone you see regularly but don't know well.",
      "If you feel ready, include someone you find difficult. This is challenging but powerful.",
      "Finally, expand to all beings everywhere: 'May all beings be happy. May all beings be healthy. May all beings be at peace.'",
      "Rest in this feeling of universal compassion for a few moments.",
      "Slowly bring your attention back to your breath and open your eyes when ready."
    ]
  },
  {
    id: "breathing",
    title: "Deep Breathing",
    description: "Simple breath-focused practice to calm the nervous system",
    duration: 5,
    icon: Wind,
    color: "text-blue-500",
    steps: [
      "Sit or stand comfortably. Place one hand on your chest and one on your belly.",
      "Breathe in slowly through your nose for 4 counts. Feel your belly rise.",
      "Hold your breath gently for 4 counts.",
      "Exhale slowly through your mouth for 6 counts. Feel your belly fall.",
      "Repeat this cycle. Focus only on the sensation of breathing.",
      "If your mind wanders, gently return attention to your breath. This is normal.",
      "Continue for 5-10 cycles or until you feel calmer.",
      "Notice how your body feels now compared to when you started.",
      "Carry this calm with you as you return to your day."
    ]
  },
  {
    id: "three_minute_space",
    title: "3-Minute Breathing Space",
    description: "A quick reset you can do anywhere, anytime",
    duration: 3,
    icon: Clock,
    color: "text-teal-500",
    steps: [
      "MINUTE 1 - AWARENESS: Ask yourself, 'What am I experiencing right now?' Notice thoughts, feelings, and body sensations.",
      "Simply acknowledge what's present without trying to change anything. Name what you notice.",
      "MINUTE 2 - GATHERING: Narrow your attention to your breath. Feel the breath moving in and out.",
      "If your mind wanders, gently guide it back. Use the breath as an anchor.",
      "MINUTE 3 - EXPANDING: Expand awareness to your whole body. Feel your body breathing.",
      "Include any sense of discomfort or difficulty. Breathe into those areas with acceptance.",
      "Prepare to return to your day with this wider, more spacious awareness.",
      "Open your eyes and take this sense of presence with you.",
      "You can return to this practice anytime you need a reset."
    ]
  },
  {
    id: "urge_surfing",
    title: "Urge Surfing",
    description: "Ride out cravings without acting on them",
    duration: 8,
    icon: Sun,
    color: "text-orange-500",
    steps: [
      "When you notice a craving, pause. Don't try to fight it or give in immediately.",
      "Find a comfortable position and close your eyes. Take a deep breath.",
      "Locate where you feel the urge in your body. Is it in your stomach? Chest? Throat?",
      "Describe the sensation to yourself. Is it tight? Warm? Pulsing? Heavy?",
      "Imagine the urge as a wave in the ocean. It will rise, peak, and eventually fall.",
      "Breathe into the sensation. You don't need to make it go away - just observe it.",
      "Notice how the intensity changes moment to moment. Urges rarely stay at peak intensity.",
      "Remind yourself: 'This is temporary. I can ride this wave without acting on it.'",
      "Continue breathing and observing until the urge naturally subsides. Congratulate yourself."
    ]
  },
  {
    id: "compassion",
    title: "Self-Compassion Break",
    description: "A gentle practice for moments of struggle",
    duration: 5,
    icon: Moon,
    color: "text-indigo-500",
    steps: [
      "When you're struggling, pause and acknowledge: 'This is a moment of difficulty.'",
      "Place your hand over your heart. Feel its warmth and gentle pressure.",
      "Remind yourself: 'Suffering is part of being human. I'm not alone in this.'",
      "Think of all the people who have struggled with similar challenges. You're connected to them.",
      "Offer yourself kindness: 'May I be kind to myself. May I give myself the compassion I need.'",
      "What would you say to a good friend in this situation? Offer those same words to yourself.",
      "Breathe in self-compassion. Breathe out self-criticism.",
      "Remember: You deserve the same kindness you would give to others.",
      "When ready, open your eyes and carry this compassion with you."
    ]
  }
];

export default function Meditations() {
  const [selectedMeditation, setSelectedMeditation] = useState<Meditation | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [stressBefore, setStressBefore] = useState(5);
  const [stressAfter, setStressAfter] = useState(5);
  const [showComplete, setShowComplete] = useState(false);

  const utils = trpc.useUtils();
  const completeMeditation = trpc.meditation.complete.useMutation({
    onSuccess: () => {
      toast.success("Meditation completed! Great job taking care of yourself.");
      utils.meditation.stats.invalidate();
      utils.progress.dashboard.invalidate();
      setShowComplete(false);
      setSelectedMeditation(null);
      setCurrentStep(0);
      setIsActive(false);
    }
  });

  const { data: stats } = trpc.meditation.stats.useQuery();

  const startMeditation = (meditation: Meditation) => {
    setSelectedMeditation(meditation);
    setCurrentStep(0);
    setIsActive(true);
    setStressBefore(5);
    setStressAfter(5);
  };

  const nextStep = () => {
    if (selectedMeditation && currentStep < selectedMeditation.steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      setIsActive(false);
      setShowComplete(true);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleComplete = () => {
    if (selectedMeditation) {
      completeMeditation.mutate({
        meditationType: selectedMeditation.id,
        durationMinutes: selectedMeditation.duration,
        stressBefore,
        stressAfter
      });
    }
  };

  const closeMeditation = () => {
    setSelectedMeditation(null);
    setCurrentStep(0);
    setIsActive(false);
    setShowComplete(false);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">Guided Meditations</h1>
          <p className="text-muted-foreground mt-1">
            Practice mindfulness with these guided exercises
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4">
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Brain className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats?.totalSessions || 0}</p>
                <p className="text-xs text-muted-foreground">Sessions Completed</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Clock className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats?.totalMinutes || 0}</p>
                <p className="text-xs text-muted-foreground">Minutes Practiced</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Meditation Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {MEDITATIONS.map(meditation => (
            <Card 
              key={meditation.id}
              className="hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => startMeditation(meditation)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className={`p-2 rounded-lg bg-muted ${meditation.color}`}>
                    <meditation.icon className="h-5 w-5" />
                  </div>
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {meditation.duration} min
                  </span>
                </div>
                <CardTitle className="text-lg mt-3">{meditation.title}</CardTitle>
                <CardDescription>{meditation.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full gap-2">
                  <Play className="h-4 w-4" />
                  Start Practice
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Meditation Dialog */}
      <Dialog open={!!selectedMeditation && isActive} onOpenChange={(open) => !open && closeMeditation()}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle className="flex items-center gap-2">
                {selectedMeditation && (
                  <>
                    <selectedMeditation.icon className={`h-5 w-5 ${selectedMeditation.color}`} />
                    {selectedMeditation.title}
                  </>
                )}
              </DialogTitle>
              <Button variant="ghost" size="icon" onClick={closeMeditation}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </DialogHeader>
          
          {selectedMeditation && (
            <div className="space-y-6">
              {/* Progress */}
              <div className="flex items-center gap-2">
                {selectedMeditation.steps.map((_, i) => (
                  <div 
                    key={i}
                    className={`h-1.5 flex-1 rounded-full transition-colors ${
                      i <= currentStep ? 'bg-primary' : 'bg-muted'
                    }`}
                  />
                ))}
              </div>

              {/* Step Content */}
              <div className="min-h-[200px] flex items-center justify-center p-6 bg-muted/30 rounded-xl">
                <p className="text-lg text-center text-foreground leading-relaxed">
                  {selectedMeditation.steps[currentStep]}
                </p>
              </div>

              {/* Navigation */}
              <div className="flex items-center justify-between">
                <Button 
                  variant="outline" 
                  onClick={prevStep}
                  disabled={currentStep === 0}
                >
                  Previous
                </Button>
                <span className="text-sm text-muted-foreground">
                  Step {currentStep + 1} of {selectedMeditation.steps.length}
                </span>
                <Button onClick={nextStep}>
                  {currentStep === selectedMeditation.steps.length - 1 ? 'Complete' : 'Next'}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Completion Dialog */}
      <Dialog open={showComplete} onOpenChange={setShowComplete}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              Meditation Complete!
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            <p className="text-muted-foreground">
              Great job completing your {selectedMeditation?.title} practice!
            </p>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Stress level before (1-10)</label>
                <Slider
                  value={[stressBefore]}
                  onValueChange={([val]) => setStressBefore(val)}
                  min={1}
                  max={10}
                  step={1}
                  className="mt-2"
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>Low</span>
                  <span>{stressBefore}</span>
                  <span>High</span>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Stress level after (1-10)</label>
                <Slider
                  value={[stressAfter]}
                  onValueChange={([val]) => setStressAfter(val)}
                  min={1}
                  max={10}
                  step={1}
                  className="mt-2"
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>Low</span>
                  <span>{stressAfter}</span>
                  <span>High</span>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" onClick={closeMeditation} className="flex-1">
                Skip
              </Button>
              <Button 
                onClick={handleComplete} 
                className="flex-1"
                disabled={completeMeditation.isPending}
              >
                {completeMeditation.isPending ? "Saving..." : "Save & Finish"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}

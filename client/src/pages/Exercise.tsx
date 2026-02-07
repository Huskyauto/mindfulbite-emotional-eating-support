import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Dumbbell, Footprints, Mountain, Backpack, Activity, Plus, Target, TrendingUp, Clock, Flame } from "lucide-react";

// Strength training program from playbook
const STRENGTH_PROGRAM = {
  months1to3: {
    title: "Foundation Phase (Months 1-3)",
    frequency: "2x/week (e.g., Tuesday/Friday)",
    exercises: [
      { name: "Goblet Squats or Leg Press", sets: 3, reps: "10-12" },
      { name: "Lat Pulldowns", sets: 3, reps: "10-12" },
      { name: "Dumbbell Bench Press", sets: 3, reps: "10-12" },
      { name: "Seated Cable Rows", sets: 3, reps: "10-12" },
      { name: "Romanian Deadlifts", sets: 3, reps: "10-12" },
      { name: "Core Work (Planks)", sets: 3, reps: "30-60 sec" }
    ],
    notes: "Last 2-3 reps should be genuinely challenging"
  },
  months4to8: {
    title: "Build Phase (Months 4-8)",
    frequency: "3x/week full-body",
    progression: "First add reps (8→10→12), then weight in 2.5-5 lb increments",
    exercises: [
      { name: "Barbell Squats", sets: 4, reps: "8-12" },
      { name: "Pull-ups or Assisted Pull-ups", sets: 4, reps: "8-12" },
      { name: "Barbell Bench Press", sets: 4, reps: "8-12" },
      { name: "Barbell Rows", sets: 4, reps: "8-12" },
      { name: "Deadlifts", sets: 3, reps: "6-8" },
      { name: "Overhead Press", sets: 3, reps: "8-12" },
      { name: "Core Circuit", sets: 3, reps: "varies" }
    ]
  }
};

// Walking protocol from playbook
const WALKING_PROTOCOL = [
  {
    phase: "Months 1-3: Foundation",
    activities: [
      "1.5-2 miles flat walking daily",
      "Post-dinner walks (10-15 min)",
      "Introduce incline treadmill 2x/week"
    ],
    heartRateZone: "99-116 bpm (Zone 2)"
  },
  {
    phase: "Months 4-6: Build",
    activities: [
      "2-2.5 miles daily",
      "Add rucking 10-15 lbs 2x/week",
      "Introduce Nordic poles"
    ]
  },
  {
    phase: "Months 7-9: Advance",
    activities: [
      "2.5-3 miles daily",
      "Rotate rucking (20-25 lbs), incline, Nordic walking"
    ]
  },
  {
    phase: "Months 10-12: Optimize",
    activities: [
      "3 miles daily",
      "Varied weekly rotation of all modalities"
    ]
  }
];

export default function Exercise() {
  const { user } = useAuth();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [workoutType, setWorkoutType] = useState<string>("strength");
  const [duration, setDuration] = useState("");
  const [distance, setDistance] = useState("");
  const [incline, setIncline] = useState("");
  const [ruckWeight, setRuckWeight] = useState("");
  const [heartRate, setHeartRate] = useState("");
  const [calories, setCalories] = useState("");
  const [notes, setNotes] = useState("");

  const { data: workouts, refetch } = trpc.workout.list.useQuery();
  const { data: stats } = trpc.workout.stats.useQuery();
  const { data: weeklyCount } = trpc.workout.weeklyCount.useQuery();
  const createWorkout = trpc.workout.create.useMutation({
    onSuccess: () => {
      toast.success("Workout logged successfully!");
      setIsDialogOpen(false);
      refetch();
      resetForm();
    },
    onError: () => toast.error("Failed to log workout")
  });

  const resetForm = () => {
    setWorkoutType("strength");
    setDuration("");
    setDistance("");
    setIncline("");
    setRuckWeight("");
    setHeartRate("");
    setCalories("");
    setNotes("");
  };

  const handleSubmit = () => {
    if (!duration) {
      toast.error("Please enter duration");
      return;
    }
    createWorkout.mutate({
      workoutType: workoutType as any,
      durationMinutes: parseInt(duration),
      distanceMiles: distance || undefined,
      inclinePercent: incline ? parseInt(incline) : undefined,
      ruckWeightLbs: ruckWeight ? parseInt(ruckWeight) : undefined,
      avgHeartRate: heartRate ? parseInt(heartRate) : undefined,
      caloriesBurned: calories ? parseInt(calories) : undefined,
      notes: notes || undefined
    });
  };

  const workoutTypeIcons: Record<string, any> = {
    strength: Dumbbell,
    walking: Footprints,
    incline: Mountain,
    rucking: Backpack,
    nordic: Activity,
    other: Activity
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Exercise</h1>
          <p className="text-muted-foreground mt-1">
            Track workouts and follow evidence-based training protocols
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90">
              <Plus className="w-4 h-4 mr-2" />
              Log Workout
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Log Workout</DialogTitle>
              <DialogDescription>Record your exercise session</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label>Workout Type</Label>
                <Select value={workoutType} onValueChange={setWorkoutType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="strength">Strength Training</SelectItem>
                    <SelectItem value="walking">Walking (Flat)</SelectItem>
                    <SelectItem value="incline">Incline Walking</SelectItem>
                    <SelectItem value="rucking">Rucking</SelectItem>
                    <SelectItem value="nordic">Nordic Walking</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>Duration (minutes)</Label>
                <Input
                  type="number"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  placeholder="30"
                />
              </div>

              {["walking", "incline", "rucking", "nordic"].includes(workoutType) && (
                <>
                  <div className="space-y-2">
                    <Label>Distance (miles)</Label>
                    <Input
                      type="number"
                      step="0.1"
                      value={distance}
                      onChange={(e) => setDistance(e.target.value)}
                      placeholder="1.5"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Average Heart Rate (bpm)</Label>
                    <Input
                      type="number"
                      value={heartRate}
                      onChange={(e) => setHeartRate(e.target.value)}
                      placeholder="110"
                    />
                    <p className="text-xs text-muted-foreground">Zone 2 target: 99-116 bpm</p>
                  </div>
                </>
              )}

              {workoutType === "incline" && (
                <div className="space-y-2">
                  <Label>Incline (%)</Label>
                  <Input
                    type="number"
                    value={incline}
                    onChange={(e) => setIncline(e.target.value)}
                    placeholder="10"
                  />
                </div>
              )}

              {workoutType === "rucking" && (
                <div className="space-y-2">
                  <Label>Ruck Weight (lbs)</Label>
                  <Input
                    type="number"
                    value={ruckWeight}
                    onChange={(e) => setRuckWeight(e.target.value)}
                    placeholder="15"
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label>Calories Burned (optional)</Label>
                <Input
                  type="number"
                  value={calories}
                  onChange={(e) => setCalories(e.target.value)}
                  placeholder="200"
                />
              </div>

              <div className="space-y-2">
                <Label>Notes (optional)</Label>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="How did it feel?"
                />
              </div>

              <Button onClick={handleSubmit} className="w-full" disabled={createWorkout.isPending}>
                {createWorkout.isPending ? "Saving..." : "Log Workout"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Dumbbell className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats?.totalWorkouts || 0}</p>
                <p className="text-sm text-muted-foreground">Total Workouts</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Clock className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats?.totalMinutes || 0}</p>
                <p className="text-sm text-muted-foreground">Total Minutes</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Target className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{weeklyCount || 0}/3</p>
                <p className="text-sm text-muted-foreground">This Week</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <TrendingUp className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats?.strengthSessions || 0}</p>
                <p className="text-sm text-muted-foreground">Strength Sessions</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Training Programs */}
      <Tabs defaultValue="strength" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="strength">Strength Training</TabsTrigger>
          <TabsTrigger value="walking">Walking Protocol</TabsTrigger>
          <TabsTrigger value="history">Workout History</TabsTrigger>
        </TabsList>

        <TabsContent value="strength" className="space-y-4 mt-4">
          <Card className="border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Dumbbell className="w-5 h-5 text-primary" />
                Why 2-3x/Week Strength Training is Critical
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                Research shows that up to <strong>25% of weight lost on GLP-1 drugs comes from lean mass</strong>. 
                Training once per week is insufficient to counteract this. Studies of 1,725 adults found that 
                both 2x and 3x weekly produced equivalent results (adding 3.1 lbs of lean weight), while 1x weekly was insufficient.
              </p>
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <p className="text-amber-800 font-medium">
                  The Three-Pronged Muscle Preservation Strategy:
                </p>
                <ul className="mt-2 space-y-1 text-amber-700">
                  <li>1. Resistance training 2-3x/week</li>
                  <li>2. Protein at 130-160g daily</li>
                  <li>3. Creatine at 3-5g daily</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <div className="grid md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>{STRENGTH_PROGRAM.months1to3.title}</CardTitle>
                <CardDescription>{STRENGTH_PROGRAM.months1to3.frequency}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {STRENGTH_PROGRAM.months1to3.exercises.map((ex, i) => (
                    <div key={i} className="flex justify-between items-center py-2 border-b last:border-0">
                      <span className="font-medium">{ex.name}</span>
                      <span className="text-muted-foreground">{ex.sets} × {ex.reps}</span>
                    </div>
                  ))}
                </div>
                <p className="text-sm text-muted-foreground mt-4 italic">
                  {STRENGTH_PROGRAM.months1to3.notes}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{STRENGTH_PROGRAM.months4to8.title}</CardTitle>
                <CardDescription>{STRENGTH_PROGRAM.months4to8.frequency}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {STRENGTH_PROGRAM.months4to8.exercises.map((ex, i) => (
                    <div key={i} className="flex justify-between items-center py-2 border-b last:border-0">
                      <span className="font-medium">{ex.name}</span>
                      <span className="text-muted-foreground">{ex.sets} × {ex.reps}</span>
                    </div>
                  ))}
                </div>
                <p className="text-sm text-muted-foreground mt-4 italic">
                  {STRENGTH_PROGRAM.months4to8.progression}
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="walking" className="space-y-4 mt-4">
          <Card className="border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Footprints className="w-5 h-5 text-primary" />
                Zone 2 Heart Rate Training
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Zone 2 is where the body primarily burns fat rather than carbohydrates — particularly potent on keto.
                Your target heart rate zone for maximum fat burning is approximately <strong>99-116 bpm</strong>.
              </p>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="font-medium text-blue-800">Post-Meal Walking</p>
                  <p className="text-sm text-blue-700 mt-1">
                    A 10-minute walk after eating reduces peak blood glucose from 182 to 164 mg/dL. 
                    Walk 10-15 minutes after dinner every night.
                  </p>
                </div>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="font-medium text-green-800">Incline Walking</p>
                  <p className="text-sm text-green-700 mt-1">
                    Uses 41% fat as fuel versus 33% for running. A 10% incline increases metabolic cost by 113%.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid md:grid-cols-2 gap-4">
            {WALKING_PROTOCOL.map((phase, i) => (
              <Card key={i}>
                <CardHeader>
                  <CardTitle className="text-lg">{phase.phase}</CardTitle>
                  {phase.heartRateZone && (
                    <CardDescription>Target: {phase.heartRateZone}</CardDescription>
                  )}
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {phase.activities.map((activity, j) => (
                      <li key={j} className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2" />
                        <span className="text-muted-foreground">{activity}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Backpack className="w-5 h-5 text-primary" />
                Rucking Protocol
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Start with 10 lbs in a proper rucking vest, 2-3x/week. Burns up to 3x more calories than unweighted walking.
                Add 2-5 lbs every two weeks, reaching 25-30 lbs by months 7-9.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Workouts</CardTitle>
            </CardHeader>
            <CardContent>
              {workouts && workouts.length > 0 ? (
                <div className="space-y-3">
                  {workouts.map((workout) => {
                    const Icon = workoutTypeIcons[workout.workoutType] || Activity;
                    return (
                      <div key={workout.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-primary/10 rounded-lg">
                            <Icon className="w-4 h-4 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium capitalize">{workout.workoutType.replace("_", " ")}</p>
                            <p className="text-sm text-muted-foreground">
                              {workout.durationMinutes} min
                              {workout.distanceMiles && ` • ${workout.distanceMiles} mi`}
                              {workout.ruckWeightLbs && ` • ${workout.ruckWeightLbs} lbs`}
                            </p>
                          </div>
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {new Date(workout.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Dumbbell className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No workouts logged yet</p>
                  <p className="text-sm">Start tracking your exercise!</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

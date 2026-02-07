import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { Moon, Plus, Sun, Thermometer, Pill, Eye, TrendingUp } from "lucide-react";

const SLEEP_PROTOCOL = {
  environmental: [
    {
      factor: "Room Temperature",
      target: "65-68°F (18-20°C)",
      evidence: "Cooler temps facilitate natural body temperature drop needed for deep sleep",
      icon: Thermometer
    },
    {
      factor: "Darkness",
      target: "Complete blackout",
      evidence: "Even small amounts of light suppress melatonin production",
      icon: Moon
    },
    {
      factor: "Noise Control",
      target: "Quiet or white noise",
      evidence: "Consistent ambient sound masks disruptive noises",
      icon: Eye
    }
  ],
  behavioral: [
    {
      practice: "Consistent Sleep Schedule",
      description: "Same bedtime and wake time daily (±30 min)",
      impact: "Strengthens circadian rhythm, improves sleep quality by 23%"
    },
    {
      practice: "No Caffeine After 2 PM",
      description: "Caffeine half-life is 5-6 hours",
      impact: "Prevents sleep disruption and reduces time to fall asleep"
    },
    {
      practice: "Avoid Screens 1 Hour Before Bed",
      description: "Blue light suppresses melatonin",
      impact: "Improves sleep onset by 30 minutes on average"
    },
    {
      practice: "Light Evening Walk",
      description: "10-15 minute walk after dinner",
      impact: "Aids digestion, reduces blood sugar, promotes relaxation"
    }
  ],
  supplementation: [
    {
      supplement: "Magnesium Glycinate",
      dosage: "200-400mg",
      timing: "30-60 min before bed",
      evidence: "Improves sleep quality, reduces time to fall asleep, supports muscle relaxation"
    },
    {
      supplement: "L-Theanine (optional)",
      dosage: "200-400mg",
      timing: "Before bed",
      evidence: "Promotes relaxation without sedation, improves sleep quality"
    },
    {
      supplement: "Melatonin (if needed)",
      dosage: "0.5-3mg",
      timing: "30-60 min before bed",
      evidence: "Helps reset circadian rhythm. Use lowest effective dose, not for long-term daily use"
    }
  ]
};

export default function Sleep() {
  const { user } = useAuth();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [bedTime, setBedTime] = useState("");
  const [wakeTime, setWakeTime] = useState("");
  const [totalHours, setTotalHours] = useState("");
  const [quality, setQuality] = useState<string>("good");
  const [caffeineLate, setCaffeineLate] = useState(false);
  const [screensBefore, setScreensBefore] = useState(false);
  const [roomTemp, setRoomTemp] = useState("");
  const [magnesiumTaken, setMagnesiumTaken] = useState(false);
  const [notes, setNotes] = useState("");

  const { data: sleepLogs, refetch } = trpc.sleep.list.useQuery();
  const { data: stats } = trpc.sleep.stats.useQuery();
  const createLog = trpc.sleep.create.useMutation({
    onSuccess: () => {
      toast.success("Sleep logged successfully!");
      setIsDialogOpen(false);
      refetch();
      resetForm();
    },
    onError: () => toast.error("Failed to log sleep")
  });

  const resetForm = () => {
    setBedTime("");
    setWakeTime("");
    setTotalHours("");
    setQuality("good");
    setCaffeineLate(false);
    setScreensBefore(false);
    setRoomTemp("");
    setMagnesiumTaken(false);
    setNotes("");
  };

  const handleSubmit = () => {
    if (!bedTime || !wakeTime || !totalHours) {
      toast.error("Please fill in all required fields");
      return;
    }
    
    const bedDateTime = new Date();
    const [bedHour, bedMin] = bedTime.split(":").map(Number);
    bedDateTime.setHours(bedHour, bedMin, 0, 0);
    
    const wakeDateTime = new Date();
    const [wakeHour, wakeMin] = wakeTime.split(":").map(Number);
    wakeDateTime.setHours(wakeHour, wakeMin, 0, 0);
    if (wakeDateTime < bedDateTime) {
      wakeDateTime.setDate(wakeDateTime.getDate() + 1);
    }

    createLog.mutate({
      bedTime: bedDateTime.toISOString(),
      wakeTime: wakeDateTime.toISOString(),
      totalHours,
      quality: quality as any,
      caffeineLate,
      screensBefore,
      roomTemp: roomTemp ? parseInt(roomTemp) : undefined,
      magnesiumTaken,
      notes: notes || undefined
    });
  };

  const getQualityColor = (qual: string) => {
    switch (qual) {
      case "excellent": return "text-green-600 bg-green-100";
      case "good": return "text-blue-600 bg-blue-100";
      case "fair": return "text-yellow-600 bg-yellow-100";
      case "poor": return "text-red-600 bg-red-100";
      default: return "text-gray-600 bg-gray-100";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Sleep Optimization</h1>
          <p className="text-muted-foreground mt-1">
            Track and optimize your sleep for better recovery and weight loss
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90">
              <Plus className="w-4 h-4 mr-2" />
              Log Sleep
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Log Sleep</DialogTitle>
              <DialogDescription>Record your sleep data</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Bed Time</Label>
                  <Input
                    type="time"
                    value={bedTime}
                    onChange={(e) => setBedTime(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Wake Time</Label>
                  <Input
                    type="time"
                    value={wakeTime}
                    onChange={(e) => setWakeTime(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Total Hours</Label>
                <Input
                  type="number"
                  step="0.5"
                  value={totalHours}
                  onChange={(e) => setTotalHours(e.target.value)}
                  placeholder="7.5"
                />
              </div>

              <div className="space-y-2">
                <Label>Sleep Quality</Label>
                <Select value={quality} onValueChange={setQuality}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="excellent">Excellent</SelectItem>
                    <SelectItem value="good">Good</SelectItem>
                    <SelectItem value="fair">Fair</SelectItem>
                    <SelectItem value="poor">Poor</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Room Temperature (°F)</Label>
                <Input
                  type="number"
                  value={roomTemp}
                  onChange={(e) => setRoomTemp(e.target.value)}
                  placeholder="68"
                />
                <p className="text-xs text-muted-foreground">Optimal: 65-68°F</p>
              </div>

              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="caffeine"
                    checked={caffeineLate}
                    onCheckedChange={(checked) => setCaffeineLate(checked as boolean)}
                  />
                  <label htmlFor="caffeine" className="text-sm cursor-pointer">
                    Had caffeine after 2 PM
                  </label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="screens"
                    checked={screensBefore}
                    onCheckedChange={(checked) => setScreensBefore(checked as boolean)}
                  />
                  <label htmlFor="screens" className="text-sm cursor-pointer">
                    Used screens 1 hour before bed
                  </label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="magnesium"
                    checked={magnesiumTaken}
                    onCheckedChange={(checked) => setMagnesiumTaken(checked as boolean)}
                  />
                  <label htmlFor="magnesium" className="text-sm cursor-pointer">
                    Took magnesium before bed
                  </label>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Notes (optional)</Label>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="How did you feel? Any disturbances?"
                />
              </div>

              <Button onClick={handleSubmit} className="w-full" disabled={createLog.isPending}>
                {createLog.isPending ? "Saving..." : "Log Sleep"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Moon className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats?.avgHours.toFixed(1) || "0.0"}</p>
                <p className="text-sm text-muted-foreground">Avg Hours/Night</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <TrendingUp className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats?.totalLogs || 0}</p>
                <p className="text-sm text-muted-foreground">Nights Logged</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Sun className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">7-9</p>
                <p className="text-sm text-muted-foreground">Target Hours</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sleep Protocol */}
      <Card className="border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Moon className="w-5 h-5 text-primary" />
            Why Sleep Matters for Weight Loss
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Poor sleep increases ghrelin (hunger hormone) and decreases leptin (satiety hormone). 
            Studies show that sleeping less than 7 hours increases next-day calorie intake by 300-500 calories. 
            Sleep deprivation also reduces insulin sensitivity and increases cortisol, both of which impair fat loss.
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="font-medium text-blue-800 mb-2">Sleep Quality = Weight Loss Success</p>
            <p className="text-sm text-blue-700">
              Aim for 7-9 hours of quality sleep nightly. Consistency matters more than occasional "catch-up" sleep.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Environmental Factors */}
      <Card>
        <CardHeader>
          <CardTitle>Environmental Optimization</CardTitle>
          <CardDescription>Create the ideal sleep environment</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            {SLEEP_PROTOCOL.environmental.map((factor, i) => {
              const Icon = factor.icon;
              return (
                <div key={i} className="p-4 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Icon className="w-5 h-5 text-primary" />
                    <p className="font-medium">{factor.factor}</p>
                  </div>
                  <p className="text-sm text-primary font-medium mb-2">{factor.target}</p>
                  <p className="text-xs text-muted-foreground">{factor.evidence}</p>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Behavioral Practices */}
      <Card>
        <CardHeader>
          <CardTitle>Sleep Hygiene Practices</CardTitle>
          <CardDescription>Evidence-based habits for better sleep</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {SLEEP_PROTOCOL.behavioral.map((practice, i) => (
              <div key={i} className="p-4 bg-muted/50 rounded-lg">
                <p className="font-medium mb-1">{practice.practice}</p>
                <p className="text-sm text-muted-foreground mb-2">{practice.description}</p>
                <p className="text-xs text-primary">{practice.impact}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Supplementation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Pill className="w-5 h-5 text-primary" />
            Sleep Supplementation
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {SLEEP_PROTOCOL.supplementation.map((supp, i) => (
              <div key={i} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-medium">{supp.supplement}</p>
                  <span className="text-sm text-primary font-medium">{supp.dosage}</span>
                </div>
                <p className="text-sm text-muted-foreground mb-2">
                  <strong>Timing:</strong> {supp.timing}
                </p>
                <p className="text-xs text-muted-foreground">{supp.evidence}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Sleep History */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Sleep Logs</CardTitle>
        </CardHeader>
        <CardContent>
          {sleepLogs && sleepLogs.length > 0 ? (
            <div className="space-y-3">
              {sleepLogs.slice(0, 10).map((log) => (
                <div key={log.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Moon className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{log.totalHours} hours</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(log.bedTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} → {new Date(log.wakeTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-2 py-1 rounded-full ${getQualityColor(log.quality || "good")}`}>
                      {log.quality}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {new Date(log.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Moon className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No sleep logs yet</p>
              <p className="text-sm">Start tracking your sleep tonight!</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

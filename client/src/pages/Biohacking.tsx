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
import { toast } from "sonner";
import { Zap, Plus, Sun, Snowflake, Flame, Footprints, Sunrise, Activity } from "lucide-react";

const BIOHACKING_PROTOCOLS = [
  {
    name: "Morning Sunlight",
    icon: Sun,
    description: "Get 10-15 minutes of direct sunlight within 30 minutes of waking",
    benefits: [
      "Anchors circadian rhythm",
      "Boosts cortisol awakening response",
      "Improves mood and alertness",
      "Supports vitamin D production"
    ],
    protocol: "Face the sun (no sunglasses) for 10-15 minutes. Cloudy days require 20-30 minutes.",
    evidence: "Studies show morning light exposure advances circadian phase and improves sleep quality."
  },
  {
    name: "Cold Exposure",
    icon: Snowflake,
    description: "Cold showers or ice baths to boost metabolism and resilience",
    benefits: [
      "Increases brown fat activation",
      "Boosts norepinephrine (focus & mood)",
      "Improves insulin sensitivity",
      "Enhances recovery"
    ],
    protocol: "Start with 30 seconds cold at end of shower. Build to 2-3 minutes. Or 11 minutes total per week in cold plunge (50-59°F).",
    evidence: "Cold exposure increases metabolic rate by 350% and activates brown adipose tissue for thermogenesis."
  },
  {
    name: "Sauna",
    icon: Flame,
    description: "Heat exposure for cardiovascular and longevity benefits",
    benefits: [
      "Improves cardiovascular health",
      "Increases growth hormone",
      "Enhances detoxification",
      "Reduces all-cause mortality"
    ],
    protocol: "15-20 minutes at 170-180°F, 2-4x per week. Stay hydrated and replace electrolytes.",
    evidence: "Finnish study: 4-7 sauna sessions per week reduced cardiovascular death risk by 50%."
  },
  {
    name: "NEAT (Non-Exercise Activity)",
    icon: Footprints,
    description: "Increase daily movement outside of formal exercise",
    benefits: [
      "Burns 300-800 extra calories daily",
      "Improves insulin sensitivity",
      "Reduces sedentary time",
      "Supports weight maintenance"
    ],
    protocol: "Stand while working, take stairs, park farther away, walk during calls, do household chores actively.",
    evidence: "NEAT accounts for 15-30% of total daily energy expenditure in active individuals."
  },
  {
    name: "Red Light Therapy",
    icon: Sunrise,
    description: "Near-infrared light for cellular energy and recovery",
    benefits: [
      "Enhances mitochondrial function",
      "Reduces inflammation",
      "Improves skin health",
      "Accelerates muscle recovery"
    ],
    protocol: "10-20 minutes daily, 6-12 inches from red/NIR light panel (660nm + 850nm wavelengths).",
    evidence: "Increases ATP production in mitochondria and reduces oxidative stress."
  },
  {
    name: "Grounding (Earthing)",
    icon: Activity,
    description: "Direct skin contact with earth for electrical balance",
    benefits: [
      "Reduces inflammation",
      "Improves sleep quality",
      "Decreases cortisol",
      "Enhances recovery"
    ],
    protocol: "Walk barefoot on grass, sand, or soil for 20-30 minutes daily.",
    evidence: "Grounding reduces blood viscosity and inflammation markers."
  }
];

export default function Biohacking() {
  const { user } = useAuth();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [activityType, setActivityType] = useState<string>("morning_sunlight");
  const [duration, setDuration] = useState("");
  const [coldTemp, setColdTemp] = useState("");
  const [saunaTemp, setSaunaTemp] = useState("");
  const [stepCount, setStepCount] = useState("");
  const [standingMinutes, setStandingMinutes] = useState("");
  const [notes, setNotes] = useState("");

  const { data: logs, refetch } = trpc.biohacking.list.useQuery();
  const { data: todayLogs } = trpc.biohacking.today.useQuery();
  const createLog = trpc.biohacking.create.useMutation({
    onSuccess: () => {
      toast.success("Activity logged!");
      setIsDialogOpen(false);
      refetch();
      resetForm();
    },
    onError: () => toast.error("Failed to log activity")
  });

  const resetForm = () => {
    setActivityType("morning_sunlight");
    setDuration("");
    setColdTemp("");
    setSaunaTemp("");
    setStepCount("");
    setStandingMinutes("");
    setNotes("");
  };

  const handleSubmit = () => {
    createLog.mutate({
      activityType: activityType as any,
      durationMinutes: duration ? parseInt(duration) : undefined,
      coldTemp: coldTemp ? parseInt(coldTemp) : undefined,
      saunaTemp: saunaTemp ? parseInt(saunaTemp) : undefined,
      stepCount: stepCount ? parseInt(stepCount) : undefined,
      standingMinutes: standingMinutes ? parseInt(standingMinutes) : undefined,
      notes: notes || undefined
    });
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "morning_sunlight": return Sun;
      case "cold_exposure": return Snowflake;
      case "sauna": return Flame;
      case "neat_steps": return Footprints;
      case "red_light": return Sunrise;
      case "grounding": return Activity;
      default: return Zap;
    }
  };

  const hasDoneToday = (type: string) => {
    return todayLogs?.some(log => log.activityType === type);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Biohacking</h1>
          <p className="text-muted-foreground mt-1">
            Advanced strategies for metabolic optimization and longevity
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90">
              <Plus className="w-4 h-4 mr-2" />
              Log Activity
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Log Biohacking Activity</DialogTitle>
              <DialogDescription>Track your optimization practices</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label>Activity Type</Label>
                <Select value={activityType} onValueChange={setActivityType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="morning_sunlight">Morning Sunlight</SelectItem>
                    <SelectItem value="cold_exposure">Cold Exposure</SelectItem>
                    <SelectItem value="sauna">Sauna</SelectItem>
                    <SelectItem value="red_light">Red Light Therapy</SelectItem>
                    <SelectItem value="neat_steps">NEAT Steps</SelectItem>
                    <SelectItem value="grounding">Grounding/Earthing</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {["morning_sunlight", "cold_exposure", "sauna", "red_light", "grounding"].includes(activityType) && (
                <div className="space-y-2">
                  <Label>Duration (minutes)</Label>
                  <Input
                    type="number"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    placeholder="15"
                  />
                </div>
              )}

              {activityType === "cold_exposure" && (
                <div className="space-y-2">
                  <Label>Water Temperature (°F)</Label>
                  <Input
                    type="number"
                    value={coldTemp}
                    onChange={(e) => setColdTemp(e.target.value)}
                    placeholder="55"
                  />
                  <p className="text-xs text-muted-foreground">Target: 50-59°F</p>
                </div>
              )}

              {activityType === "sauna" && (
                <div className="space-y-2">
                  <Label>Sauna Temperature (°F)</Label>
                  <Input
                    type="number"
                    value={saunaTemp}
                    onChange={(e) => setSaunaTemp(e.target.value)}
                    placeholder="175"
                  />
                  <p className="text-xs text-muted-foreground">Target: 170-180°F</p>
                </div>
              )}

              {activityType === "neat_steps" && (
                <>
                  <div className="space-y-2">
                    <Label>Step Count</Label>
                    <Input
                      type="number"
                      value={stepCount}
                      onChange={(e) => setStepCount(e.target.value)}
                      placeholder="8000"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Standing Minutes</Label>
                    <Input
                      type="number"
                      value={standingMinutes}
                      onChange={(e) => setStandingMinutes(e.target.value)}
                      placeholder="120"
                    />
                  </div>
                </>
              )}

              <div className="space-y-2">
                <Label>Notes (optional)</Label>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="How did it feel?"
                />
              </div>

              <Button onClick={handleSubmit} className="w-full" disabled={createLog.isPending}>
                {createLog.isPending ? "Saving..." : "Log Activity"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-primary" />
            What is Biohacking?
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Biohacking involves using science-backed interventions to optimize your biology for better health, 
            performance, and longevity. These practices work synergistically with your weight loss program to 
            enhance metabolic function, improve recovery, and support overall well-being.
          </p>
        </CardContent>
      </Card>

      {/* Today's Checklist */}
      <Card>
        <CardHeader>
          <CardTitle>Today's Biohacking Checklist</CardTitle>
          <CardDescription>Track your daily optimization practices</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-3">
            {["morning_sunlight", "cold_exposure", "sauna", "neat_steps", "red_light", "grounding"].map((type) => {
              const Icon = getActivityIcon(type);
              const done = hasDoneToday(type);
              return (
                <div
                  key={type}
                  className={`flex items-center justify-between p-3 rounded-lg border-2 ${
                    done ? "border-green-500 bg-green-50" : "border-gray-200 bg-muted/30"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Icon className={`w-5 h-5 ${done ? "text-green-600" : "text-muted-foreground"}`} />
                    <span className={`font-medium capitalize ${done ? "text-green-700" : "text-foreground"}`}>
                      {type.replace("_", " ")}
                    </span>
                  </div>
                  {done && <span className="text-green-600 text-sm font-medium">✓ Done</span>}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Protocols */}
      <div className="grid md:grid-cols-2 gap-4">
        {BIOHACKING_PROTOCOLS.map((protocol, i) => {
          const Icon = protocol.icon;
          return (
            <Card key={i}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icon className="w-5 h-5 text-primary" />
                  {protocol.name}
                </CardTitle>
                <CardDescription>{protocol.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm font-medium mb-2">Benefits:</p>
                  <ul className="space-y-1">
                    {protocol.benefits.map((benefit, j) => (
                      <li key={j} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                        {benefit}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-sm font-medium text-blue-800 mb-1">Protocol</p>
                  <p className="text-sm text-blue-700">{protocol.protocol}</p>
                </div>
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <p className="text-xs text-green-700">{protocol.evidence}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Activity History */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activities</CardTitle>
        </CardHeader>
        <CardContent>
          {logs && logs.length > 0 ? (
            <div className="space-y-3">
              {logs.slice(0, 10).map((log) => {
                const Icon = getActivityIcon(log.activityType);
                return (
                  <div key={log.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <Icon className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium capitalize">{log.activityType.replace("_", " ")}</p>
                        <p className="text-sm text-muted-foreground">
                          {log.durationMinutes && `${log.durationMinutes} min`}
                          {log.coldTemp && ` • ${log.coldTemp}°F`}
                          {log.saunaTemp && ` • ${log.saunaTemp}°F`}
                          {log.stepCount && ` • ${log.stepCount} steps`}
                        </p>
                      </div>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {new Date(log.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Zap className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No activities logged yet</p>
              <p className="text-sm">Start optimizing today!</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

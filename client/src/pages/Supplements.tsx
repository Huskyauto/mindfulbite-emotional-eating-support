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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Pill, Plus, Check, AlertCircle, Info } from "lucide-react";

// Supplement protocol from playbook
const SUPPLEMENT_TIERS = {
  tier1: {
    title: "Tier 1: Essential Foundation",
    description: "Non-negotiable for muscle preservation and metabolic health",
    supplements: [
      {
        name: "Creatine Monohydrate",
        dosage: "3-5g daily",
        timing: "Any time (with or without food)",
        evidence: "Preserves lean mass during weight loss. Meta-analysis shows 3.1 lbs more lean mass retention.",
        notes: "Causes 2-4 lbs water retention in muscles (not fat)"
      },
      {
        name: "Vitamin D3",
        dosage: "2,000-4,000 IU daily",
        timing: "Morning with fat-containing meal",
        evidence: "Supports mood, immunity, bone health. Deficiency common in weight loss.",
        notes: "Get blood test to confirm levels (target: 40-60 ng/mL)"
      },
      {
        name: "Magnesium Glycinate",
        dosage: "200-400mg",
        timing: "Before bed",
        evidence: "Improves sleep quality, reduces muscle cramps, supports 300+ enzymatic processes.",
        notes: "Glycinate form is better absorbed and gentler on stomach"
      },
      {
        name: "Omega-3 (EPA/DHA)",
        dosage: "1,000-2,000mg combined EPA+DHA",
        timing: "With meals",
        evidence: "Reduces inflammation, supports heart and brain health during weight loss.",
        notes: "Look for triglyceride form, not ethyl ester"
      }
    ]
  },
  tier2: {
    title: "Tier 2: Optimization Layer",
    description: "Add after Tier 1 is consistent for 4+ weeks",
    supplements: [
      {
        name: "Electrolyte Blend",
        dosage: "1-2 servings daily",
        timing: "Morning and/or during exercise",
        evidence: "Critical on keto. Prevents fatigue, headaches, muscle cramps.",
        notes: "Look for sodium 500-1000mg, potassium 200-400mg, magnesium 100-200mg per serving"
      },
      {
        name: "Protein Powder (Whey or Collagen)",
        dosage: "20-40g per serving",
        timing: "Post-workout or between meals",
        evidence: "Helps hit 130-160g protein target. Whey has leucine for muscle synthesis.",
        notes: "Collagen supports skin elasticity during weight loss"
      },
      {
        name: "Fiber Supplement (Psyllium Husk)",
        dosage: "5-10g daily",
        timing: "With water, away from other supplements",
        evidence: "Supports gut health, satiety, blood sugar control.",
        notes: "Start low and increase gradually to avoid bloating"
      }
    ]
  },
  tier3: {
    title: "Tier 3: Advanced Biohacking",
    description: "For those seeking maximum optimization",
    supplements: [
      {
        name: "Berberine",
        dosage: "500mg, 2-3x daily",
        timing: "With meals",
        evidence: "Improves insulin sensitivity, supports blood sugar control.",
        notes: "May interact with medications - consult doctor"
      },
      {
        name: "Alpha-Lipoic Acid (ALA)",
        dosage: "300-600mg daily",
        timing: "With meals",
        evidence: "Antioxidant, supports glucose metabolism and nerve health.",
        notes: "R-ALA form is more bioavailable"
      },
      {
        name: "Ashwagandha",
        dosage: "300-600mg",
        timing: "Evening",
        evidence: "Reduces cortisol, improves stress resilience and sleep.",
        notes: "KSM-66 or Sensoril extracts are most studied"
      },
      {
        name: "L-Theanine",
        dosage: "100-200mg",
        timing: "Morning or with caffeine",
        evidence: "Promotes calm focus without sedation. Pairs well with coffee.",
        notes: "Synergistic with caffeine (2:1 ratio theanine:caffeine)"
      }
    ]
  }
};

export default function Supplements() {
  const { user } = useAuth();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [name, setName] = useState("");
  const [dosage, setDosage] = useState("");
  const [tier, setTier] = useState<string>("tier1");
  const [frequency, setFrequency] = useState<string>("daily");
  const [timeOfDay, setTimeOfDay] = useState<string>("morning");
  const [notes, setNotes] = useState("");

  const { data: supplements, refetch } = trpc.supplement.list.useQuery();
  const { data: todayLogs, refetch: refetchLogs } = trpc.supplement.todayLogs.useQuery();
  const createSupplement = trpc.supplement.create.useMutation({
    onSuccess: () => {
      toast.success("Supplement added!");
      setIsDialogOpen(false);
      refetch();
      resetForm();
    },
    onError: () => toast.error("Failed to add supplement")
  });

  const logIntake = trpc.supplement.logIntake.useMutation({
    onSuccess: () => {
      toast.success("Intake logged!");
      refetchLogs();
    },
    onError: () => toast.error("Failed to log intake")
  });

  const resetForm = () => {
    setName("");
    setDosage("");
    setTier("tier1");
    setFrequency("daily");
    setTimeOfDay("morning");
    setNotes("");
  };

  const handleSubmit = () => {
    if (!name) {
      toast.error("Please enter supplement name");
      return;
    }
    createSupplement.mutate({
      name,
      dosage: dosage || undefined,
      tier: tier as any,
      frequency: frequency as any,
      timeOfDay: timeOfDay as any,
      notes: notes || undefined
    });
  };

  const isTakenToday = (suppId: number) => {
    return todayLogs?.some(log => log.supplementId === suppId);
  };

  const getTierBadgeColor = (tierValue: string) => {
    switch (tierValue) {
      case "tier1": return "bg-red-100 text-red-700 border-red-300";
      case "tier2": return "bg-blue-100 text-blue-700 border-blue-300";
      case "tier3": return "bg-purple-100 text-purple-700 border-purple-300";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Supplements</h1>
          <p className="text-muted-foreground mt-1">
            Evidence-based supplementation for muscle preservation and optimization
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90">
              <Plus className="w-4 h-4 mr-2" />
              Add Supplement
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Add Supplement</DialogTitle>
              <DialogDescription>Add a supplement to your daily routine</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label>Supplement Name</Label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., Creatine Monohydrate"
                />
              </div>
              
              <div className="space-y-2">
                <Label>Dosage</Label>
                <Input
                  value={dosage}
                  onChange={(e) => setDosage(e.target.value)}
                  placeholder="e.g., 5g daily"
                />
              </div>

              <div className="space-y-2">
                <Label>Tier</Label>
                <Select value={tier} onValueChange={setTier}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="tier1">Tier 1 - Essential</SelectItem>
                    <SelectItem value="tier2">Tier 2 - Optimization</SelectItem>
                    <SelectItem value="tier3">Tier 3 - Advanced</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Frequency</Label>
                <Select value={frequency} onValueChange={setFrequency}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="twice_daily">Twice Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="as_needed">As Needed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Time of Day</Label>
                <Select value={timeOfDay} onValueChange={setTimeOfDay}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="morning">Morning</SelectItem>
                    <SelectItem value="afternoon">Afternoon</SelectItem>
                    <SelectItem value="evening">Evening</SelectItem>
                    <SelectItem value="bedtime">Bedtime</SelectItem>
                    <SelectItem value="with_meals">With Meals</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Notes (optional)</Label>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Any special instructions..."
                />
              </div>

              <Button onClick={handleSubmit} className="w-full" disabled={createSupplement.isPending}>
                {createSupplement.isPending ? "Adding..." : "Add Supplement"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="my-stack" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="my-stack">My Stack</TabsTrigger>
          <TabsTrigger value="tier1">Tier 1</TabsTrigger>
          <TabsTrigger value="tier2">Tier 2</TabsTrigger>
          <TabsTrigger value="tier3">Tier 3</TabsTrigger>
        </TabsList>

        <TabsContent value="my-stack" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>My Daily Supplements</CardTitle>
              <CardDescription>Track your supplement intake</CardDescription>
            </CardHeader>
            <CardContent>
              {supplements && supplements.length > 0 ? (
                <div className="space-y-3">
                  {supplements.map((supp) => (
                    <div key={supp.id} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-3 flex-1">
                        <div className="p-2 bg-primary/10 rounded-lg">
                          <Pill className="w-4 h-4 text-primary" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className="font-medium">{supp.name}</p>
                            <Badge className={getTierBadgeColor(supp.tier || "tier1")}>
                              {supp.tier?.toUpperCase()}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {supp.dosage} • {supp.timeOfDay?.replace("_", " ")}
                          </p>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant={isTakenToday(supp.id) ? "secondary" : "default"}
                        onClick={() => !isTakenToday(supp.id) && logIntake.mutate({ supplementId: supp.id })}
                        disabled={isTakenToday(supp.id) || logIntake.isPending}
                      >
                        {isTakenToday(supp.id) ? (
                          <>
                            <Check className="w-4 h-4 mr-1" />
                            Taken
                          </>
                        ) : (
                          "Log Intake"
                        )}
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Pill className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No supplements added yet</p>
                  <p className="text-sm">Start with Tier 1 essentials!</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {Object.entries(SUPPLEMENT_TIERS).map(([key, tierData]) => (
          <TabsContent key={key} value={key} className="mt-4">
            <Card className="border-primary/20 mb-4">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-primary" />
                  {tierData.title}
                </CardTitle>
                <CardDescription>{tierData.description}</CardDescription>
              </CardHeader>
            </Card>

            <div className="grid gap-4">
              {tierData.supplements.map((supp, i) => (
                <Card key={i}>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center justify-between">
                      <span>{supp.name}</span>
                      <Badge variant="outline">{supp.dosage}</Badge>
                    </CardTitle>
                    <CardDescription>
                      <strong>Timing:</strong> {supp.timing}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <p className="text-sm font-medium text-blue-800 mb-1">Evidence</p>
                      <p className="text-sm text-blue-700">{supp.evidence}</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <Info className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-muted-foreground">{supp.notes}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>

      <Card className="bg-amber-50 border-amber-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-amber-800">
            <AlertCircle className="w-5 h-5" />
            Important Reminders
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-amber-700">
          <p>• Supplements are not a substitute for whole foods and proper nutrition</p>
          <p>• Always consult with a healthcare provider before starting new supplements</p>
          <p>• Start with Tier 1 and be consistent for 4+ weeks before adding Tier 2</p>
          <p>• Quality matters - look for third-party tested brands (NSF, USP, ConsumerLab)</p>
          <p>• Creatine causes 2-4 lbs water retention in muscles (this is normal and beneficial)</p>
        </CardContent>
      </Card>
    </div>
  );
}

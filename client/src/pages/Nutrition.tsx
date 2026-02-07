import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { Apple, Plus, Target, TrendingUp, Droplet, Zap } from "lucide-react";

const NUTRITION_TARGETS = {
  protein: { min: 130, max: 160, unit: "g" },
  carbs: { max: 50, unit: "g", note: "For keto" },
  fat: { min: 70, max: 120, unit: "g" },
  calories: { min: 1200, max: 1800, unit: "kcal" },
  sodium: { min: 3000, max: 5000, unit: "mg", note: "Critical on keto" },
  potassium: { min: 3000, max: 4700, unit: "mg" },
  magnesium: { min: 400, max: 500, unit: "mg" },
  water: { min: 80, max: 120, unit: "oz" }
};

const KETO_PRINCIPLES = [
  {
    title: "Protein Priority",
    description: "130-160g daily to preserve muscle mass during weight loss",
    rationale: "Up to 25% of weight lost on GLP-1 drugs can be lean mass. Adequate protein prevents this."
  },
  {
    title: "Carb Restriction",
    description: "Under 50g net carbs to maintain ketosis",
    rationale: "Ketosis enhances fat oxidation and provides stable energy without blood sugar spikes."
  },
  {
    title: "Healthy Fats",
    description: "70-120g from quality sources (avocado, olive oil, nuts, fatty fish)",
    rationale: "Fats provide satiety, support hormone production, and are the primary fuel source in ketosis."
  },
  {
    title: "Electrolyte Management",
    description: "Sodium 3-5g, Potassium 3-4.7g, Magnesium 400-500mg daily",
    rationale: "Keto causes increased urinary loss of electrolytes. Deficiency leads to fatigue, cramps, headaches."
  }
];

export default function Nutrition() {
  const { user } = useAuth();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [protein, setProtein] = useState("");
  const [carbs, setCarbs] = useState("");
  const [fat, setFat] = useState("");
  const [calories, setCalories] = useState("");
  const [sodium, setSodium] = useState("");
  const [potassium, setPotassium] = useState("");
  const [magnesium, setMagnesium] = useState("");
  const [isRefeedDay, setIsRefeedDay] = useState(false);
  const [water, setWater] = useState("");
  const [notes, setNotes] = useState("");

  const { data: logs, refetch } = trpc.nutrition.list.useQuery();
  const { data: todayLog, refetch: refetchToday } = trpc.nutrition.today.useQuery();
  const createLog = trpc.nutrition.create.useMutation({
    onSuccess: () => {
      toast.success("Nutrition logged!");
      setIsDialogOpen(false);
      refetch();
      refetchToday();
      resetForm();
    },
    onError: () => toast.error("Failed to log nutrition")
  });

  const resetForm = () => {
    setProtein("");
    setCarbs("");
    setFat("");
    setCalories("");
    setSodium("");
    setPotassium("");
    setMagnesium("");
    setIsRefeedDay(false);
    setWater("");
    setNotes("");
  };

  const handleSubmit = () => {
    createLog.mutate({
      proteinGrams: protein ? parseInt(protein) : undefined,
      carbsGrams: carbs ? parseInt(carbs) : undefined,
      fatGrams: fat ? parseInt(fat) : undefined,
      calories: calories ? parseInt(calories) : undefined,
      sodiumMg: sodium ? parseInt(sodium) : undefined,
      potassiumMg: potassium ? parseInt(potassium) : undefined,
      magnesiumMg: magnesium ? parseInt(magnesium) : undefined,
      isRefeedDay,
      waterOz: water ? parseInt(water) : undefined,
      notes: notes || undefined
    });
  };

  const getProgressColor = (value: number, target: { min?: number; max?: number }) => {
    if (target.min && value < target.min) return "bg-yellow-500";
    if (target.max && value > target.max) return "bg-red-500";
    return "bg-green-500";
  };

  const getProgressPercent = (value: number, target: { min?: number; max?: number }) => {
    if (target.min && target.max) {
      return Math.min((value / target.max) * 100, 100);
    }
    if (target.max) {
      return Math.min((value / target.max) * 100, 100);
    }
    return 0;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Nutrition</h1>
          <p className="text-muted-foreground mt-1">
            Track macros and electrolytes for optimal keto performance
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90">
              <Plus className="w-4 h-4 mr-2" />
              Log Nutrition
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Log Daily Nutrition</DialogTitle>
              <DialogDescription>Track your macros and electrolytes</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Protein (g)</Label>
                  <Input
                    type="number"
                    value={protein}
                    onChange={(e) => setProtein(e.target.value)}
                    placeholder="145"
                  />
                  <p className="text-xs text-muted-foreground">Target: 130-160g</p>
                </div>
                <div className="space-y-2">
                  <Label>Carbs (g)</Label>
                  <Input
                    type="number"
                    value={carbs}
                    onChange={(e) => setCarbs(e.target.value)}
                    placeholder="30"
                  />
                  <p className="text-xs text-muted-foreground">Target: &lt;50g</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Fat (g)</Label>
                  <Input
                    type="number"
                    value={fat}
                    onChange={(e) => setFat(e.target.value)}
                    placeholder="95"
                  />
                  <p className="text-xs text-muted-foreground">Target: 70-120g</p>
                </div>
                <div className="space-y-2">
                  <Label>Calories</Label>
                  <Input
                    type="number"
                    value={calories}
                    onChange={(e) => setCalories(e.target.value)}
                    placeholder="1500"
                  />
                  <p className="text-xs text-muted-foreground">Target: 1200-1800</p>
                </div>
              </div>

              <div className="border-t pt-4">
                <p className="font-medium mb-3">Electrolytes (Critical on Keto)</p>
                <div className="space-y-3">
                  <div className="space-y-2">
                    <Label>Sodium (mg)</Label>
                    <Input
                      type="number"
                      value={sodium}
                      onChange={(e) => setSodium(e.target.value)}
                      placeholder="4000"
                    />
                    <p className="text-xs text-muted-foreground">Target: 3000-5000mg</p>
                  </div>
                  <div className="space-y-2">
                    <Label>Potassium (mg)</Label>
                    <Input
                      type="number"
                      value={potassium}
                      onChange={(e) => setPotassium(e.target.value)}
                      placeholder="3500"
                    />
                    <p className="text-xs text-muted-foreground">Target: 3000-4700mg</p>
                  </div>
                  <div className="space-y-2">
                    <Label>Magnesium (mg)</Label>
                    <Input
                      type="number"
                      value={magnesium}
                      onChange={(e) => setMagnesium(e.target.value)}
                      placeholder="450"
                    />
                    <p className="text-xs text-muted-foreground">Target: 400-500mg</p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Water (oz)</Label>
                <Input
                  type="number"
                  value={water}
                  onChange={(e) => setWater(e.target.value)}
                  placeholder="100"
                />
                <p className="text-xs text-muted-foreground">Target: 80-120oz</p>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="refeed"
                  checked={isRefeedDay}
                  onCheckedChange={(checked) => setIsRefeedDay(checked as boolean)}
                />
                <label htmlFor="refeed" className="text-sm cursor-pointer">
                  This is a refeed day (higher carbs)
                </label>
              </div>

              <div className="space-y-2">
                <Label>Notes (optional)</Label>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Meals, energy levels, etc."
                />
              </div>

              <Button onClick={handleSubmit} className="w-full" disabled={createLog.isPending}>
                {createLog.isPending ? "Saving..." : "Log Nutrition"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Today's Progress */}
      {todayLog && (
        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5 text-primary" />
              Today's Progress
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {todayLog.proteinGrams && (
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium">Protein</span>
                  <span className="text-sm text-muted-foreground">
                    {todayLog.proteinGrams}g / {NUTRITION_TARGETS.protein.max}g
                  </span>
                </div>
                <Progress
                  value={getProgressPercent(todayLog.proteinGrams, NUTRITION_TARGETS.protein)}
                  className={getProgressColor(todayLog.proteinGrams, NUTRITION_TARGETS.protein)}
                />
              </div>
            )}
            {todayLog.carbsGrams !== null && (
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium">Carbs</span>
                  <span className="text-sm text-muted-foreground">
                    {todayLog.carbsGrams}g / {NUTRITION_TARGETS.carbs.max}g
                  </span>
                </div>
                <Progress
                  value={getProgressPercent(todayLog.carbsGrams, NUTRITION_TARGETS.carbs)}
                  className={getProgressColor(todayLog.carbsGrams, NUTRITION_TARGETS.carbs)}
                />
              </div>
            )}
            {todayLog.waterOz && (
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium flex items-center gap-1">
                    <Droplet className="w-4 h-4" />
                    Water
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {todayLog.waterOz}oz / {NUTRITION_TARGETS.water.max}oz
                  </span>
                </div>
                <Progress
                  value={getProgressPercent(todayLog.waterOz, NUTRITION_TARGETS.water)}
                  className="bg-blue-500"
                />
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Keto Principles */}
      <Card className="border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-primary" />
            Ketogenic Diet Principles
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            {KETO_PRINCIPLES.map((principle, i) => (
              <div key={i} className="p-4 bg-muted/50 rounded-lg">
                <p className="font-medium mb-2">{principle.title}</p>
                <p className="text-sm text-primary mb-2">{principle.description}</p>
                <p className="text-xs text-muted-foreground">{principle.rationale}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Macro Targets */}
      <div className="grid md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Macro Targets</CardTitle>
            <CardDescription>Daily macronutrient goals</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
              <span className="font-medium">Protein</span>
              <span className="text-primary font-medium">
                {NUTRITION_TARGETS.protein.min}-{NUTRITION_TARGETS.protein.max}g
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
              <span className="font-medium">Carbs</span>
              <span className="text-primary font-medium">&lt;{NUTRITION_TARGETS.carbs.max}g</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
              <span className="font-medium">Fat</span>
              <span className="text-primary font-medium">
                {NUTRITION_TARGETS.fat.min}-{NUTRITION_TARGETS.fat.max}g
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
              <span className="font-medium">Calories</span>
              <span className="text-primary font-medium">
                {NUTRITION_TARGETS.calories.min}-{NUTRITION_TARGETS.calories.max}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Electrolyte Targets</CardTitle>
            <CardDescription>Critical for keto success</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
              <span className="font-medium">Sodium</span>
              <span className="text-primary font-medium">
                {NUTRITION_TARGETS.sodium.min}-{NUTRITION_TARGETS.sodium.max}mg
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
              <span className="font-medium">Potassium</span>
              <span className="text-primary font-medium">
                {NUTRITION_TARGETS.potassium.min}-{NUTRITION_TARGETS.potassium.max}mg
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
              <span className="font-medium">Magnesium</span>
              <span className="text-primary font-medium">
                {NUTRITION_TARGETS.magnesium.min}-{NUTRITION_TARGETS.magnesium.max}mg
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
              <span className="font-medium">Water</span>
              <span className="text-primary font-medium">
                {NUTRITION_TARGETS.water.min}-{NUTRITION_TARGETS.water.max}oz
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Nutrition History */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Logs</CardTitle>
        </CardHeader>
        <CardContent>
          {logs && logs.length > 0 ? (
            <div className="space-y-3">
              {logs.slice(0, 10).map((log) => (
                <div key={log.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Apple className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">
                        P: {log.proteinGrams}g • C: {log.carbsGrams}g • F: {log.fatGrams}g
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {log.calories} cal • {log.waterOz}oz water
                        {log.isRefeedDay && " • Refeed Day"}
                      </p>
                    </div>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {new Date(log.date).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Apple className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No nutrition logs yet</p>
              <p className="text-sm">Start tracking your macros!</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

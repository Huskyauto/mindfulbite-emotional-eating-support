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
import { Scale, Plus, TrendingDown, Activity, Ruler, LineChart as LineChartIcon } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

export default function BodyMetrics() {
  const { user } = useAuth();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [weight, setWeight] = useState("");
  const [bodyFat, setBodyFat] = useState("");
  const [leanMass, setLeanMass] = useState("");
  const [visceralFat, setVisceralFat] = useState("");
  const [waist, setWaist] = useState("");
  const [hips, setHips] = useState("");
  const [chest, setChest] = useState("");
  const [measurementType, setMeasurementType] = useState<string>("scale");
  const [notes, setNotes] = useState("");

  const { data: metrics, refetch } = trpc.bodyMetrics.list.useQuery();
  const { data: latest } = trpc.bodyMetrics.latest.useQuery();
  const createMetric = trpc.bodyMetrics.create.useMutation({
    onSuccess: () => {
      toast.success("Metrics logged!");
      setIsDialogOpen(false);
      refetch();
      resetForm();
    },
    onError: () => toast.error("Failed to log metrics")
  });

  const resetForm = () => {
    setWeight("");
    setBodyFat("");
    setLeanMass("");
    setVisceralFat("");
    setWaist("");
    setHips("");
    setChest("");
    setMeasurementType("scale");
    setNotes("");
  };

  const handleSubmit = () => {
    createMetric.mutate({
      weightLbs: weight || undefined,
      bodyFatPercent: bodyFat || undefined,
      leanMassLbs: leanMass || undefined,
      visceralFat: visceralFat ? parseInt(visceralFat) : undefined,
      waistInches: waist || undefined,
      hipsInches: hips || undefined,
      chestInches: chest || undefined,
      measurementType: measurementType as any,
      notes: notes || undefined
    });
  };

  const calculateProgress = () => {
    if (!metrics || metrics.length < 2) return null;
    const first = metrics[metrics.length - 1];
    const current = metrics[0];
    
    const weightChange = first.weightLbs && current.weightLbs 
      ? parseFloat(current.weightLbs) - parseFloat(first.weightLbs)
      : null;
    
    const bodyFatChange = first.bodyFatPercent && current.bodyFatPercent
      ? parseFloat(current.bodyFatPercent) - parseFloat(first.bodyFatPercent)
      : null;

    return { weightChange, bodyFatChange };
  };

  const progress = calculateProgress();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Body Metrics</h1>
          <p className="text-muted-foreground mt-1">
            Track weight, body composition, and measurements
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90">
              <Plus className="w-4 h-4 mr-2" />
              Log Metrics
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Log Body Metrics</DialogTitle>
              <DialogDescription>Record your measurements</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label>Measurement Type</Label>
                <Select value={measurementType} onValueChange={setMeasurementType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="scale">Home Scale</SelectItem>
                    <SelectItem value="dexa">DEXA Scan</SelectItem>
                    <SelectItem value="bodpod">BodPod</SelectItem>
                    <SelectItem value="tape">Tape Measure</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Weight (lbs)</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  placeholder="220.5"
                />
              </div>

              {["dexa", "bodpod", "scale"].includes(measurementType) && (
                <>
                  <div className="space-y-2">
                    <Label>Body Fat %</Label>
                    <Input
                      type="number"
                      step="0.1"
                      value={bodyFat}
                      onChange={(e) => setBodyFat(e.target.value)}
                      placeholder="25.5"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Lean Mass (lbs)</Label>
                    <Input
                      type="number"
                      step="0.1"
                      value={leanMass}
                      onChange={(e) => setLeanMass(e.target.value)}
                      placeholder="165.0"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Visceral Fat Level</Label>
                    <Input
                      type="number"
                      value={visceralFat}
                      onChange={(e) => setVisceralFat(e.target.value)}
                      placeholder="8"
                    />
                    <p className="text-xs text-muted-foreground">Healthy range: 1-12</p>
                  </div>
                </>
              )}

              <div className="border-t pt-4">
                <p className="font-medium mb-3">Measurements (inches)</p>
                <div className="space-y-3">
                  <div className="space-y-2">
                    <Label>Waist</Label>
                    <Input
                      type="number"
                      step="0.25"
                      value={waist}
                      onChange={(e) => setWaist(e.target.value)}
                      placeholder="38.5"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Hips</Label>
                    <Input
                      type="number"
                      step="0.25"
                      value={hips}
                      onChange={(e) => setHips(e.target.value)}
                      placeholder="42.0"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Chest</Label>
                    <Input
                      type="number"
                      step="0.25"
                      value={chest}
                      onChange={(e) => setChest(e.target.value)}
                      placeholder="44.0"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Notes (optional)</Label>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Time of day, conditions, etc."
                />
              </div>

              <Button onClick={handleSubmit} className="w-full" disabled={createMetric.isPending}>
                {createMetric.isPending ? "Saving..." : "Log Metrics"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Current Stats */}
      {latest && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {latest.weightLbs && (
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Scale className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{latest.weightLbs}</p>
                    <p className="text-sm text-muted-foreground">lbs</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
          {latest.bodyFatPercent && (
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <Activity className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{latest.bodyFatPercent}%</p>
                    <p className="text-sm text-muted-foreground">Body Fat</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
          {latest.leanMassLbs && (
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <TrendingDown className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{latest.leanMassLbs}</p>
                    <p className="text-sm text-muted-foreground">Lean Mass</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
          {latest.waistInches && (
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Ruler className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{latest.waistInches}"</p>
                    <p className="text-sm text-muted-foreground">Waist</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Progress Summary */}
      {progress && (progress.weightChange !== null || progress.bodyFatChange !== null) && (
        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingDown className="w-5 h-5 text-primary" />
              Progress Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              {progress.weightChange !== null && (
                <div className="p-4 bg-muted/50 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Weight Change</p>
                  <p className={`text-2xl font-bold ${progress.weightChange < 0 ? 'text-green-600' : 'text-orange-600'}`}>
                    {progress.weightChange > 0 ? '+' : ''}{progress.weightChange.toFixed(1)} lbs
                  </p>
                </div>
              )}
              {progress.bodyFatChange !== null && (
                <div className="p-4 bg-muted/50 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Body Fat Change</p>
                  <p className={`text-2xl font-bold ${progress.bodyFatChange < 0 ? 'text-green-600' : 'text-orange-600'}`}>
                    {progress.bodyFatChange > 0 ? '+' : ''}{progress.bodyFatChange.toFixed(1)}%
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Progress Charts */}
      {metrics && metrics.length >= 2 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LineChartIcon className="w-5 h-5 text-primary" />
              Progress Trends
            </CardTitle>
            <CardDescription>Visual tracking of your body composition changes over time</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-8">
              {/* Weight Trend Chart */}
              {metrics.some(m => m.weightLbs) && (
                <div>
                  <h3 className="font-medium mb-4">Weight Trend (lbs)</h3>
                  <ResponsiveContainer width="100%" height={250}>
                    <LineChart data={[...metrics].reverse().map(m => ({
                      date: new Date(m.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                      weight: m.weightLbs ? parseFloat(m.weightLbs) : null
                    })).filter(d => d.weight !== null)}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="date" className="text-xs" />
                      <YAxis className="text-xs" domain={['dataMin - 5', 'dataMax + 5']} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }}
                        labelStyle={{ color: 'hsl(var(--foreground))' }}
                      />
                      <Legend />
                      <Line type="monotone" dataKey="weight" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 4 }} name="Weight" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}

              {/* Body Fat Percentage Chart */}
              {metrics.some(m => m.bodyFatPercent) && (
                <div>
                  <h3 className="font-medium mb-4">Body Fat Percentage (%)</h3>
                  <ResponsiveContainer width="100%" height={250}>
                    <LineChart data={[...metrics].reverse().map(m => ({
                      date: new Date(m.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                      bodyFat: m.bodyFatPercent ? parseFloat(m.bodyFatPercent) : null
                    })).filter(d => d.bodyFat !== null)}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="date" className="text-xs" />
                      <YAxis className="text-xs" domain={['dataMin - 2', 'dataMax + 2']} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }}
                        labelStyle={{ color: 'hsl(var(--foreground))' }}
                      />
                      <Legend />
                      <Line type="monotone" dataKey="bodyFat" stroke="#f97316" strokeWidth={2} dot={{ r: 4 }} name="Body Fat %" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}

              {/* Waist Measurement Chart */}
              {metrics.some(m => m.waistInches) && (
                <div>
                  <h3 className="font-medium mb-4">Waist Measurement (inches)</h3>
                  <ResponsiveContainer width="100%" height={250}>
                    <LineChart data={[...metrics].reverse().map(m => ({
                      date: new Date(m.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                      waist: m.waistInches ? parseFloat(m.waistInches) : null
                    })).filter(d => d.waist !== null)}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="date" className="text-xs" />
                      <YAxis className="text-xs" domain={['dataMin - 2', 'dataMax + 2']} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }}
                        labelStyle={{ color: 'hsl(var(--foreground))' }}
                      />
                      <Legend />
                      <Line type="monotone" dataKey="waist" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} name="Waist" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Measurement Guidelines */}
      <Card>
        <CardHeader>
          <CardTitle>Measurement Best Practices</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="p-3 bg-muted/50 rounded-lg">
              <p className="font-medium mb-1">Weigh at the Same Time</p>
              <p className="text-sm text-muted-foreground">
                First thing in the morning, after using the bathroom, before eating or drinking
              </p>
            </div>
            <div className="p-3 bg-muted/50 rounded-lg">
              <p className="font-medium mb-1">Weekly, Not Daily</p>
              <p className="text-sm text-muted-foreground">
                Weight fluctuates 2-5 lbs daily due to water, food, hormones. Weekly averages are more meaningful.
              </p>
            </div>
            <div className="p-3 bg-muted/50 rounded-lg">
              <p className="font-medium mb-1">Body Composition Matters More</p>
              <p className="text-sm text-muted-foreground">
                Focus on losing fat while preserving muscle. DEXA scans every 8-12 weeks provide the gold standard.
              </p>
            </div>
            <div className="p-3 bg-muted/50 rounded-lg">
              <p className="font-medium mb-1">Take Progress Photos</p>
              <p className="text-sm text-muted-foreground">
                Visual changes often appear before scale changes. Same lighting, same poses, every 2-4 weeks.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Metrics History */}
      <Card>
        <CardHeader>
          <CardTitle>Measurement History</CardTitle>
        </CardHeader>
        <CardContent>
          {metrics && metrics.length > 0 ? (
            <div className="space-y-3">
              {metrics.map((metric) => (
                <div key={metric.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Scale className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">
                        {metric.weightLbs && `${metric.weightLbs} lbs`}
                        {metric.bodyFatPercent && ` • ${metric.bodyFatPercent}% BF`}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {metric.waistInches && `Waist: ${metric.waistInches}"`}
                        {metric.measurementType && ` • ${metric.measurementType}`}
                      </p>
                    </div>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {new Date(metric.date).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Scale className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No metrics logged yet</p>
              <p className="text-sm">Start tracking your progress!</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

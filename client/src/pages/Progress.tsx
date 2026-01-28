import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { 
  Flame, Trophy, Sparkles, Brain, BookOpen, Heart,
  TrendingUp, Calendar, Target, Award
} from "lucide-react";
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from "recharts";
import { format, subDays } from "date-fns";

const MOOD_COLORS: Record<string, string> = {
  great: "#22c55e",
  good: "#84cc16",
  okay: "#eab308",
  low: "#f97316",
  struggling: "#ef4444"
};

const MOOD_EMOJIS: Record<string, string> = {
  great: "😊",
  good: "🙂",
  okay: "😐",
  low: "😔",
  struggling: "😢"
};

export default function Progress() {
  const { data: dashboard, isLoading } = trpc.progress.dashboard.useQuery();
  const { data: checkIns } = trpc.checkIn.list.useQuery({ limit: 30 });

  // Prepare chart data
  const moodChartData = checkIns?.slice().reverse().map(c => ({
    date: format(new Date(c.createdAt), "MMM d"),
    mood: ["struggling", "low", "okay", "good", "great"].indexOf(c.mood) + 1,
    hunger: c.hungerLevel
  })) || [];

  const moodDistributionData = dashboard?.moodDistribution 
    ? Object.entries(dashboard.moodDistribution).map(([mood, count]) => ({
        name: mood,
        value: count,
        color: MOOD_COLORS[mood]
      }))
    : [];

  const getLevelTitle = (level: number) => {
    const titles = [
      "Beginner",
      "Learner",
      "Practitioner",
      "Mindful Eater",
      "Awareness Builder",
      "Pattern Breaker",
      "Emotion Navigator",
      "Wise Mind",
      "Master",
      "Enlightened"
    ];
    return titles[Math.min(level - 1, titles.length - 1)];
  };

  const getNextLevelPoints = (level: number) => {
    return level * 100;
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">Your Progress</h1>
          <p className="text-muted-foreground mt-1">
            Track your journey and celebrate your achievements
          </p>
        </div>

        {/* Main Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 border-orange-200 dark:border-orange-800">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-orange-500/20">
                  <Flame className="h-6 w-6 text-orange-500" />
                </div>
                <div>
                  <p className="text-3xl font-bold text-foreground">
                    {isLoading ? "..." : dashboard?.user.currentStreak || 0}
                  </p>
                  <p className="text-sm text-muted-foreground">Day Streak</p>
                </div>
              </div>
              {dashboard && dashboard.user.longestStreak > 0 && (
                <p className="text-xs text-muted-foreground mt-2">
                  Best: {dashboard.user.longestStreak} days
                </p>
              )}
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20 border-yellow-200 dark:border-yellow-800">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-yellow-500/20">
                  <Sparkles className="h-6 w-6 text-yellow-500" />
                </div>
                <div>
                  <p className="text-3xl font-bold text-foreground">
                    {isLoading ? "..." : dashboard?.user.points || 0}
                  </p>
                  <p className="text-sm text-muted-foreground">Points</p>
                </div>
              </div>
              {dashboard && (
                <p className="text-xs text-muted-foreground mt-2">
                  {getNextLevelPoints(dashboard.user.level) - dashboard.user.points} to next level
                </p>
              )}
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border-purple-200 dark:border-purple-800">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-purple-500/20">
                  <Target className="h-6 w-6 text-purple-500" />
                </div>
                <div>
                  <p className="text-3xl font-bold text-foreground">
                    {isLoading ? "..." : dashboard?.user.level || 1}
                  </p>
                  <p className="text-sm text-muted-foreground">Level</p>
                </div>
              </div>
              {dashboard && (
                <p className="text-xs text-muted-foreground mt-2">
                  {getLevelTitle(dashboard.user.level)}
                </p>
              )}
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-green-200 dark:border-green-800">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-green-500/20">
                  <Trophy className="h-6 w-6 text-green-500" />
                </div>
                <div>
                  <p className="text-3xl font-bold text-foreground">
                    {isLoading ? "..." : dashboard?.achievements.length || 0}
                  </p>
                  <p className="text-sm text-muted-foreground">Achievements</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Activity Stats */}
        <div className="grid md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-pink-100 dark:bg-pink-900/30">
                <Heart className="h-5 w-5 text-pink-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{dashboard?.checkInCount || 0}</p>
                <p className="text-xs text-muted-foreground">Check-ins</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900/30">
                <BookOpen className="h-5 w-5 text-amber-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{dashboard?.journalCount || 0}</p>
                <p className="text-xs text-muted-foreground">Journal Entries</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-indigo-100 dark:bg-indigo-900/30">
                <Brain className="h-5 w-5 text-indigo-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{dashboard?.meditationStats.totalMinutes || 0}</p>
                <p className="text-xs text-muted-foreground">Minutes Meditated</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Mood Trend Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Mood Trend
              </CardTitle>
            </CardHeader>
            <CardContent>
              {moodChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={moodChartData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis 
                      dataKey="date" 
                      tick={{ fontSize: 12 }}
                      className="text-muted-foreground"
                    />
                    <YAxis 
                      domain={[1, 5]}
                      ticks={[1, 2, 3, 4, 5]}
                      tickFormatter={(val) => ["😢", "😔", "😐", "🙂", "😊"][val - 1]}
                      tick={{ fontSize: 14 }}
                    />
                    <Tooltip 
                      formatter={(value: number) => [
                        ["Struggling", "Low", "Okay", "Good", "Great"][value - 1],
                        "Mood"
                      ]}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="mood" 
                      stroke="hsl(var(--primary))"
                      strokeWidth={2}
                      dot={{ fill: "hsl(var(--primary))" }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[250px] flex items-center justify-center text-muted-foreground">
                  <div className="text-center">
                    <Calendar className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>No check-in data yet</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Mood Distribution */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Mood Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              {moodDistributionData.length > 0 ? (
                <div className="flex items-center gap-6">
                  <ResponsiveContainer width="50%" height={200}>
                    <PieChart>
                      <Pie
                        data={moodDistributionData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={80}
                      >
                        {moodDistributionData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="space-y-2">
                    {moodDistributionData.map((entry) => (
                      <div key={entry.name} className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: entry.color }}
                        />
                        <span className="text-sm capitalize">{MOOD_EMOJIS[entry.name]} {entry.name}</span>
                        <span className="text-sm text-muted-foreground">({entry.value})</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="h-[200px] flex items-center justify-center text-muted-foreground">
                  <div className="text-center">
                    <Heart className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>Complete check-ins to see your mood patterns</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Achievements */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Award className="h-5 w-5 text-yellow-500" />
              Achievements
            </CardTitle>
          </CardHeader>
          <CardContent>
            {dashboard?.achievements && dashboard.achievements.length > 0 ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {dashboard.achievements.map((achievement) => (
                  <div 
                    key={achievement.id}
                    className="flex items-center gap-3 p-3 rounded-lg bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20 border border-yellow-200 dark:border-yellow-800"
                  >
                    <div className="p-2 rounded-lg bg-yellow-500/20">
                      <Trophy className="h-5 w-5 text-yellow-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground truncate">{achievement.achievementName}</p>
                      <p className="text-xs text-muted-foreground truncate">{achievement.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Trophy className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No achievements yet</p>
                <p className="text-sm mt-1">Complete activities to earn badges!</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Insights */}
        {dashboard?.topTriggers && dashboard.topTriggers.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Your Patterns</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-3">Most Common Triggers</h4>
                  <div className="space-y-2">
                    {dashboard.topTriggers.map(([trigger, count], i) => (
                      <div key={trigger} className="flex items-center gap-3">
                        <span className="text-sm font-medium w-4">{i + 1}.</span>
                        <div className="flex-1">
                          <div className="flex justify-between text-sm mb-1">
                            <span className="capitalize">{trigger.replace(/_/g, ' ')}</span>
                            <span className="text-muted-foreground">{count} times</span>
                          </div>
                          <div className="h-2 bg-muted rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-destructive/60 rounded-full"
                              style={{ width: `${(count / dashboard.topTriggers[0][1]) * 100}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-3">Most Common Emotions</h4>
                  <div className="space-y-2">
                    {dashboard.topEmotions.map(([emotion, count], i) => (
                      <div key={emotion} className="flex items-center gap-3">
                        <span className="text-sm font-medium w-4">{i + 1}.</span>
                        <div className="flex-1">
                          <div className="flex justify-between text-sm mb-1">
                            <span className="capitalize">{emotion}</span>
                            <span className="text-muted-foreground">{count} times</span>
                          </div>
                          <div className="h-2 bg-muted rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-primary/60 rounded-full"
                              style={{ width: `${(count / dashboard.topEmotions[0][1]) * 100}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}

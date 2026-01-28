import { useAuth } from "@/_core/hooks/useAuth";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { Link } from "wouter";
import { 
  Flame, Trophy, Heart, Brain, BookOpen, MessageCircle,
  Target, ArrowRight, Sparkles, TrendingUp, Calendar
} from "lucide-react";

export default function Dashboard() {
  const { user } = useAuth();
  const { data: dashboardData, isLoading } = trpc.progress.dashboard.useQuery();
  const { data: todayCheckIn } = trpc.checkIn.today.useQuery();

  const quickActions = [
    { icon: Heart, label: "Check In", href: "/check-in", color: "text-pink-500" },
    { icon: MessageCircle, label: "AI Coach", href: "/coach", color: "text-blue-500" },
    { icon: Brain, label: "Meditate", href: "/meditations", color: "text-purple-500" },
    { icon: BookOpen, label: "Journal", href: "/journal", color: "text-amber-500" },
  ];

  const getMoodEmoji = (mood: string) => {
    const emojis: Record<string, string> = {
      great: "😊",
      good: "🙂",
      okay: "😐",
      low: "😔",
      struggling: "😢"
    };
    return emojis[mood] || "🙂";
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Welcome Section */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">
              Welcome back{user?.name ? `, ${user.name.split(' ')[0]}` : ''}! 👋
            </h1>
            <p className="text-muted-foreground mt-1">
              {todayCheckIn 
                ? `You've already checked in today. Keep up the great work!`
                : `Start your day with a quick check-in to track your progress.`
              }
            </p>
          </div>
          {!todayCheckIn && (
            <Link href="/check-in">
              <Button className="gap-2">
                <Heart className="h-4 w-4" />
                Daily Check-in
              </Button>
            </Link>
          )}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-orange-100 dark:bg-orange-900/30">
                  <Flame className="h-5 w-5 text-orange-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">
                    {isLoading ? "..." : dashboardData?.user.currentStreak || 0}
                  </p>
                  <p className="text-xs text-muted-foreground">Day Streak</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-yellow-100 dark:bg-yellow-900/30">
                  <Sparkles className="h-5 w-5 text-yellow-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">
                    {isLoading ? "..." : dashboardData?.user.points || 0}
                  </p>
                  <p className="text-xs text-muted-foreground">Points</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30">
                  <Brain className="h-5 w-5 text-purple-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">
                    {isLoading ? "..." : dashboardData?.meditationStats.totalSessions || 0}
                  </p>
                  <p className="text-xs text-muted-foreground">Meditations</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30">
                  <Trophy className="h-5 w-5 text-green-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">
                    {isLoading ? "..." : dashboardData?.achievements.length || 0}
                  </p>
                  <p className="text-xs text-muted-foreground">Achievements</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {quickActions.map((action, i) => (
                <Link key={i} href={action.href}>
                  <Button 
                    variant="outline" 
                    className="w-full h-auto py-4 flex flex-col gap-2 hover:bg-muted/50"
                  >
                    <action.icon className={`h-6 w-6 ${action.color}`} />
                    <span className="text-sm font-medium">{action.label}</span>
                  </Button>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Recent Mood Trends */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Mood Trends</CardTitle>
              <Link href="/progress">
                <Button variant="ghost" size="sm" className="gap-1">
                  View All <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="h-8 bg-muted animate-pulse rounded" />
                  ))}
                </div>
              ) : dashboardData?.moodDistribution && Object.keys(dashboardData.moodDistribution).length > 0 ? (
                <div className="space-y-3">
                  {Object.entries(dashboardData.moodDistribution).map(([mood, count]) => (
                    <div key={mood} className="flex items-center gap-3">
                      <span className="text-xl">{getMoodEmoji(mood)}</span>
                      <div className="flex-1">
                        <div className="flex justify-between text-sm mb-1">
                          <span className="capitalize text-foreground">{mood}</span>
                          <span className="text-muted-foreground">{count}</span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-primary rounded-full transition-all"
                            style={{ 
                              width: `${(count / dashboardData.checkInCount) * 100}%` 
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Calendar className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No check-ins yet</p>
                  <Link href="/check-in">
                    <Button variant="link" className="mt-2">Start tracking</Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Achievements */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Recent Achievements</CardTitle>
              <Link href="/progress">
                <Button variant="ghost" size="sm" className="gap-1">
                  View All <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="h-12 bg-muted animate-pulse rounded" />
                  ))}
                </div>
              ) : dashboardData?.achievements && dashboardData.achievements.length > 0 ? (
                <div className="space-y-3">
                  {dashboardData.achievements.slice(0, 4).map((achievement) => (
                    <div key={achievement.id} className="flex items-center gap-3 p-2 rounded-lg bg-muted/50">
                      <div className="p-2 rounded-lg bg-yellow-100 dark:bg-yellow-900/30">
                        <Trophy className="h-4 w-4 text-yellow-500" />
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
        </div>

        {/* Insights */}
        {dashboardData?.topTriggers && dashboardData.topTriggers.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Your Insights
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-3">Top Triggers</h4>
                  <div className="flex flex-wrap gap-2">
                    {dashboardData.topTriggers.map(([trigger, count]) => (
                      <span 
                        key={trigger}
                        className="px-3 py-1 rounded-full bg-destructive/10 text-destructive text-sm"
                      >
                        {trigger.replace(/_/g, ' ')} ({count})
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-3">Top Emotions</h4>
                  <div className="flex flex-wrap gap-2">
                    {dashboardData.topEmotions.map(([emotion, count]) => (
                      <span 
                        key={emotion}
                        className="px-3 py-1 rounded-full bg-primary/10 text-primary text-sm"
                      >
                        {emotion} ({count})
                      </span>
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

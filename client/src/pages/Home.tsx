import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getLoginUrl } from "@/const";
import { Link } from "wouter";
import { 
  Heart, Brain, Sparkles, BookOpen, MessageCircle, 
  Target, Users, Trophy, Leaf, ArrowRight, Shield,
  Clock, TrendingUp
} from "lucide-react";

export default function Home() {
  const { user, loading, isAuthenticated } = useAuth();

  const features = [
    {
      icon: Heart,
      title: "Daily Check-ins",
      description: "Track your mood, hunger levels, and emotional triggers to build awareness of your patterns."
    },
    {
      icon: MessageCircle,
      title: "AI Coach",
      description: "Get personalized support from your compassionate AI coach whenever you need guidance."
    },
    {
      icon: Brain,
      title: "Guided Meditations",
      description: "Access mindfulness exercises including body scans, loving-kindness, and breathing techniques."
    },
    {
      icon: Shield,
      title: "Emergency Toolkit",
      description: "Quick access to urge-surfing techniques and coping strategies when cravings hit."
    },
    {
      icon: BookOpen,
      title: "Learn & Grow",
      description: "Explore CBT, DBT, and mindful eating principles through our educational library."
    },
    {
      icon: Trophy,
      title: "Track Progress",
      description: "Celebrate your journey with streaks, achievements, and visual insights."
    }
  ];

  const testimonials = [
    {
      quote: "This app helped me understand why I was eating, not just what. The daily check-ins changed everything.",
      author: "Sarah M."
    },
    {
      quote: "The AI coach feels like having a supportive friend available 24/7. No judgment, just understanding.",
      author: "Michael R."
    },
    {
      quote: "The emergency toolkit has saved me so many times. When urges hit, I know exactly what to do.",
      author: "Jennifer L."
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="container flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <Leaf className="h-7 w-7 text-primary" />
            <span className="text-xl font-semibold text-foreground">MindfulBite</span>
          </div>
          <div className="flex items-center gap-4">
            {loading ? (
              <div className="h-9 w-24 bg-muted animate-pulse rounded-lg" />
            ) : isAuthenticated ? (
              <Link href="/dashboard">
                <Button>Go to Dashboard</Button>
              </Link>
            ) : (
              <a href={getLoginUrl()}>
                <Button>Get Started</Button>
              </a>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-6">
              <Sparkles className="h-4 w-4" />
              <span className="text-sm font-medium">Your journey to mindful eating starts here</span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-tight">
              Break Free from{" "}
              <span className="text-primary">Emotional Eating</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Build a healthier relationship with food through awareness, compassion, and 
              evidence-based techniques. No diets, no shame—just understanding and support.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {isAuthenticated ? (
                <Link href="/dashboard">
                  <Button size="lg" className="gap-2">
                    Go to Dashboard
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              ) : (
                <a href={getLoginUrl()}>
                  <Button size="lg" className="gap-2">
                    Start Your Journey
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </a>
              )}
              <Link href="/learn">
                <Button size="lg" variant="outline">
                  Learn More
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-muted/30">
        <div className="container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { icon: Clock, value: "5 min", label: "Daily check-in" },
              { icon: Brain, value: "10+", label: "Meditation types" },
              { icon: TrendingUp, value: "40%", label: "Reduced cravings" },
              { icon: Users, value: "24/7", label: "AI support" }
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <stat.icon className="h-8 w-8 mx-auto mb-2 text-primary" />
                <div className="text-2xl md:text-3xl font-bold text-foreground">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Everything You Need to Succeed
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Comprehensive tools and support designed to help you understand and 
              transform your relationship with food.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <Card key={i} className="border-border/50 hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              How MindfulBite Works
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              A simple daily practice that builds lasting change
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              {
                step: "1",
                title: "Check In Daily",
                description: "Start each day by logging your mood, hunger levels, and any emotional triggers you're experiencing."
              },
              {
                step: "2",
                title: "Get Support",
                description: "Use the AI coach, guided meditations, or emergency toolkit whenever you need help managing urges."
              },
              {
                step: "3",
                title: "Track & Grow",
                description: "Watch your progress, earn achievements, and discover patterns that help you make lasting changes."
              }
            ].map((item, i) => (
              <div key={i} className="text-center">
                <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xl font-bold mx-auto mb-4">
                  {item.step}
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">{item.title}</h3>
                <p className="text-muted-foreground">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-4">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Stories of Transformation
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {testimonials.map((testimonial, i) => (
              <Card key={i} className="border-border/50">
                <CardContent className="p-6">
                  <p className="text-foreground mb-4 italic">"{testimonial.quote}"</p>
                  <p className="text-sm text-muted-foreground font-medium">— {testimonial.author}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-primary/5">
        <div className="container">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Ready to Transform Your Relationship with Food?
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Join thousands of others who have found freedom from emotional eating. 
              Your journey to mindful eating starts with a single step.
            </p>
            {isAuthenticated ? (
              <Link href="/dashboard">
                <Button size="lg" className="gap-2">
                  Go to Dashboard
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            ) : (
              <a href={getLoginUrl()}>
                <Button size="lg" className="gap-2">
                  Start Free Today
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </a>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 border-t border-border">
        <div className="container">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Leaf className="h-6 w-6 text-primary" />
              <span className="text-lg font-semibold text-foreground">MindfulBite</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Supporting your journey to mindful eating with compassion and science.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

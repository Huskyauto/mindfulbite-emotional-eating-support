import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { Search, Sparkles, History, AlertCircle } from "lucide-react";
import { Streamdown } from "streamdown";

const SUGGESTED_TOPICS = [
  "How does creatine help preserve muscle during weight loss?",
  "What's the optimal protein intake for GLP-1 users?",
  "Benefits of Zone 2 cardio for fat loss",
  "How does cold exposure boost metabolism?",
  "Best supplements for sleep quality",
  "Keto flu symptoms and how to prevent them",
  "Difference between DEXA scan and BodPod",
  "How to break a weight loss plateau"
];

export default function AIResearch() {
  const { user } = useAuth();
  const [query, setQuery] = useState("");
  const [currentResponse, setCurrentResponse] = useState<string>("");

  const { data: history, refetch } = trpc.aiResearch.history.useQuery({ limit: 10 });
  const researchMutation = trpc.aiResearch.query.useMutation({
    onSuccess: (data) => {
      if (data) setCurrentResponse(data.response);
      setQuery("");
      refetch();
      toast.success("Research complete!");
    },
    onError: () => {
      toast.error("Failed to process research query");
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) {
      toast.error("Please enter a question");
      return;
    }
    setCurrentResponse("");
    researchMutation.mutate({ query: query.trim() });
  };

  const handleSuggestedTopic = (topic: string) => {
    setQuery(topic);
    setCurrentResponse("");
    researchMutation.mutate({ query: topic });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">AI Research Assistant</h1>
        <p className="text-muted-foreground mt-1">
          Get evidence-based answers about weight loss, nutrition, exercise, and health
        </p>
      </div>

      <Card className="border-amber-200 bg-amber-50">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-amber-800">
              <p className="font-medium mb-1">Important Disclaimer</p>
              <p>
                This AI assistant provides general health information based on research. It is not a substitute 
                for professional medical advice, diagnosis, or treatment. Always consult your healthcare provider 
                before making changes to your diet, exercise, or supplement regimen.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Search Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="w-5 h-5 text-primary" />
            Ask a Question
          </CardTitle>
          <CardDescription>
            Research health topics, supplements, exercise protocols, and more
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Textarea
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="e.g., How much protein should I eat to preserve muscle on a GLP-1?"
                className="min-h-[100px]"
                disabled={researchMutation.isPending}
              />
            </div>
            <Button
              type="submit"
              className="w-full"
              disabled={researchMutation.isPending || !query.trim()}
            >
              {researchMutation.isPending ? (
                <>
                  <Sparkles className="w-4 h-4 mr-2 animate-spin" />
                  Researching...
                </>
              ) : (
                <>
                  <Search className="w-4 h-4 mr-2" />
                  Research
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Suggested Topics */}
      <Card>
        <CardHeader>
          <CardTitle>Suggested Topics</CardTitle>
          <CardDescription>Quick access to common questions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-2">
            {SUGGESTED_TOPICS.map((topic, i) => (
              <Button
                key={i}
                variant="outline"
                className="justify-start text-left h-auto py-3 px-4"
                onClick={() => handleSuggestedTopic(topic)}
                disabled={researchMutation.isPending}
              >
                <Sparkles className="w-4 h-4 mr-2 flex-shrink-0 text-primary" />
                <span className="text-sm">{topic}</span>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Current Response */}
      {currentResponse && (
        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              Research Results
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm max-w-none">
              <Streamdown>{currentResponse}</Streamdown>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Research History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="w-5 h-5 text-primary" />
            Research History
          </CardTitle>
          <CardDescription>Your past 10 research queries</CardDescription>
        </CardHeader>
        <CardContent>
          {history && history.length > 0 ? (
            <ScrollArea className="h-[500px] pr-4">
              <div className="space-y-4">
                {history.map((item) => (
                  <div key={item.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <p className="font-medium text-primary mb-1">{item.query}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(item.createdAt).toLocaleString()}
                        </p>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setQuery(item.query);
                          setCurrentResponse(item.response);
                        }}
                      >
                        View
                      </Button>
                    </div>
                    <div className="prose prose-sm max-w-none text-muted-foreground">
                      <Streamdown>{item.response.substring(0, 200) + "..."}</Streamdown>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Search className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No research history yet</p>
              <p className="text-sm">Start by asking a question!</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Research Tips */}
      <Card>
        <CardHeader>
          <CardTitle>Research Tips</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>• Be specific in your questions for more targeted answers</p>
            <p>• Ask about mechanisms, dosages, timing, and evidence</p>
            <p>• Use this to understand the "why" behind your protocols</p>
            <p>• All research is automatically saved to your history</p>
            <p>• Cross-reference with your healthcare provider for personalized advice</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

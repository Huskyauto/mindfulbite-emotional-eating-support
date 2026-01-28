import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { BookOpen, Plus, Calendar, ChevronRight, Sparkles } from "lucide-react";
import { format } from "date-fns";

const REFLECTION_PROMPTS = [
  "What emotions was I feeling before I wanted to eat?",
  "What triggered this urge? Was it a thought, situation, or feeling?",
  "On a scale of 1-10, how physically hungry was I?",
  "What would I tell a friend who was feeling this way?",
  "What else could I do to address this feeling besides eating?",
  "What patterns am I noticing in my emotional eating?",
  "What am I grateful for today?",
  "How can I show myself compassion right now?",
  "What small win can I celebrate today?",
  "What would my wisest self say about this situation?"
];

const MOODS = [
  { value: "great", emoji: "😊", label: "Great" },
  { value: "good", emoji: "🙂", label: "Good" },
  { value: "okay", emoji: "😐", label: "Okay" },
  { value: "low", emoji: "😔", label: "Low" },
  { value: "struggling", emoji: "😢", label: "Struggling" },
] as const;

export default function Journal() {
  const [isCreating, setIsCreating] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [selectedMood, setSelectedMood] = useState<string>("");
  const [selectedPrompt, setSelectedPrompt] = useState("");
  const [viewingEntry, setViewingEntry] = useState<number | null>(null);

  const { data: entries, isLoading } = trpc.journal.list.useQuery();
  const { data: viewedEntry } = trpc.journal.get.useQuery(
    { id: viewingEntry! },
    { enabled: !!viewingEntry }
  );

  const utils = trpc.useUtils();
  const createEntry = trpc.journal.create.useMutation({
    onSuccess: () => {
      toast.success("Journal entry saved!");
      utils.journal.list.invalidate();
      utils.progress.dashboard.invalidate();
      setIsCreating(false);
      setTitle("");
      setContent("");
      setSelectedMood("");
      setSelectedPrompt("");
    },
    onError: () => {
      toast.error("Failed to save entry. Please try again.");
    }
  });

  const handleCreate = () => {
    if (!content.trim()) {
      toast.error("Please write something in your journal entry.");
      return;
    }
    createEntry.mutate({
      title: title || undefined,
      content,
      mood: selectedMood as any || undefined,
      reflectionPrompt: selectedPrompt || undefined
    });
  };

  const getRandomPrompt = () => {
    const prompt = REFLECTION_PROMPTS[Math.floor(Math.random() * REFLECTION_PROMPTS.length)];
    setSelectedPrompt(prompt);
    setContent(prev => prev ? `${prev}\n\n${prompt}\n` : `${prompt}\n`);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">Journal</h1>
            <p className="text-muted-foreground mt-1">
              Reflect on your emotions and eating patterns
            </p>
          </div>
          <Dialog open={isCreating} onOpenChange={setIsCreating}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                New Entry
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>New Journal Entry</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Title (optional)</label>
                  <Input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Give your entry a title..."
                    className="mt-1"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">How are you feeling?</label>
                  <div className="flex gap-2 mt-2">
                    {MOODS.map(mood => (
                      <button
                        key={mood.value}
                        onClick={() => setSelectedMood(mood.value)}
                        className={`p-2 rounded-lg border-2 transition-all ${
                          selectedMood === mood.value
                            ? 'border-primary bg-primary/10'
                            : 'border-border hover:border-primary/50'
                        }`}
                      >
                        <span className="text-xl">{mood.emoji}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium">Your thoughts</label>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={getRandomPrompt}
                      className="gap-1 text-xs"
                    >
                      <Sparkles className="h-3 w-3" />
                      Add prompt
                    </Button>
                  </div>
                  <Textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Write about what you're experiencing, feeling, or noticing..."
                    rows={8}
                  />
                </div>

                <div className="flex gap-3">
                  <Button 
                    variant="outline" 
                    onClick={() => setIsCreating(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleCreate}
                    disabled={createEntry.isPending}
                    className="flex-1"
                  >
                    {createEntry.isPending ? "Saving..." : "Save Entry"}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Reflection Prompts */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Reflection Prompts</CardTitle>
            <CardDescription>Need inspiration? Try one of these prompts</CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="w-full">
              <div className="flex gap-2 pb-2">
                {REFLECTION_PROMPTS.slice(0, 5).map((prompt, i) => (
                  <Button
                    key={i}
                    variant="outline"
                    size="sm"
                    className="whitespace-nowrap"
                    onClick={() => {
                      setSelectedPrompt(prompt);
                      setContent(prompt + "\n\n");
                      setIsCreating(true);
                    }}
                  >
                    {prompt.slice(0, 40)}...
                  </Button>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Entries List */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Your Entries</h2>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-24 bg-muted animate-pulse rounded-xl" />
              ))}
            </div>
          ) : entries && entries.length > 0 ? (
            <div className="space-y-3">
              {entries.map(entry => (
                <Card 
                  key={entry.id}
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => setViewingEntry(entry.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          {entry.mood && (
                            <span className="text-lg">
                              {MOODS.find(m => m.value === entry.mood)?.emoji}
                            </span>
                          )}
                          <h3 className="font-medium text-foreground truncate">
                            {entry.title || "Untitled Entry"}
                          </h3>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {entry.content}
                        </p>
                        <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          {format(new Date(entry.createdAt), "MMM d, yyyy 'at' h:mm a")}
                        </div>
                      </div>
                      <ChevronRight className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <BookOpen className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                <h3 className="font-medium text-foreground mb-2">No journal entries yet</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Start reflecting on your emotional eating journey
                </p>
                <Button onClick={() => setIsCreating(true)}>
                  Write Your First Entry
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* View Entry Dialog */}
      <Dialog open={!!viewingEntry} onOpenChange={(open) => !open && setViewingEntry(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {viewedEntry?.mood && (
                <span className="text-xl">
                  {MOODS.find(m => m.value === viewedEntry.mood)?.emoji}
                </span>
              )}
              {viewedEntry?.title || "Journal Entry"}
            </DialogTitle>
          </DialogHeader>
          {viewedEntry && (
            <div className="space-y-4">
              <div className="text-xs text-muted-foreground">
                {format(new Date(viewedEntry.createdAt), "EEEE, MMMM d, yyyy 'at' h:mm a")}
              </div>
              
              {viewedEntry.reflectionPrompt && (
                <div className="p-3 bg-muted/50 rounded-lg">
                  <p className="text-sm font-medium text-muted-foreground">Prompt:</p>
                  <p className="text-sm">{viewedEntry.reflectionPrompt}</p>
                </div>
              )}
              
              <div className="prose prose-sm max-w-none">
                <p className="whitespace-pre-wrap text-foreground">{viewedEntry.content}</p>
              </div>

              {viewedEntry.emotions && viewedEntry.emotions.length > 0 && (
                <div>
                  <p className="text-sm font-medium mb-2">Emotions:</p>
                  <div className="flex flex-wrap gap-2">
                    {viewedEntry.emotions.map((emotion, i) => (
                      <span key={i} className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">
                        {emotion}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {viewedEntry.triggers && viewedEntry.triggers.length > 0 && (
                <div>
                  <p className="text-sm font-medium mb-2">Triggers:</p>
                  <div className="flex flex-wrap gap-2">
                    {viewedEntry.triggers.map((trigger, i) => (
                      <span key={i} className="px-2 py-1 bg-destructive/10 text-destructive text-xs rounded-full">
                        {trigger}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}

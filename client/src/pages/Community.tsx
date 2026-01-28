import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Users, Heart, Plus, MessageCircle, Shield } from "lucide-react";
import { format } from "date-fns";

export default function Community() {
  const { user } = useAuth();
  const [isCreating, setIsCreating] = useState(false);
  const [content, setContent] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);

  const { data: posts, isLoading } = trpc.community.list.useQuery();
  const { data: myLikes } = trpc.community.myLikes.useQuery();

  const utils = trpc.useUtils();

  const createPost = trpc.community.createPost.useMutation({
    onSuccess: () => {
      toast.success("Post shared with the community!");
      utils.community.list.invalidate();
      setIsCreating(false);
      setContent("");
      setIsAnonymous(false);
    },
    onError: () => {
      toast.error("Failed to create post. Please try again.");
    }
  });

  const toggleLike = trpc.community.toggleLike.useMutation({
    onMutate: async ({ postId }) => {
      await utils.community.list.cancel();
      await utils.community.myLikes.cancel();
      
      const previousPosts = utils.community.list.getData();
      const previousLikes = utils.community.myLikes.getData();
      
      const isLiked = previousLikes?.includes(postId);
      
      utils.community.list.setData(undefined, (old) => 
        old?.map(post => 
          post.id === postId 
            ? { ...post, likesCount: post.likesCount + (isLiked ? -1 : 1) }
            : post
        )
      );
      
      utils.community.myLikes.setData(undefined, (old) => 
        isLiked 
          ? old?.filter(id => id !== postId)
          : [...(old || []), postId]
      );
      
      return { previousPosts, previousLikes };
    },
    onError: (err, variables, context) => {
      if (context?.previousPosts) {
        utils.community.list.setData(undefined, context.previousPosts);
      }
      if (context?.previousLikes) {
        utils.community.myLikes.setData(undefined, context.previousLikes);
      }
      toast.error("Failed to update. Please try again.");
    },
    onSettled: () => {
      utils.community.list.invalidate();
      utils.community.myLikes.invalidate();
    }
  });

  const handleCreate = () => {
    if (!content.trim()) {
      toast.error("Please write something to share.");
      return;
    }
    createPost.mutate({ content, isAnonymous });
  };

  const handleLike = (postId: number) => {
    toggleLike.mutate({ postId });
  };

  const isLiked = (postId: number) => myLikes?.includes(postId) || false;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">Community</h1>
            <p className="text-muted-foreground mt-1">
              Share experiences and support each other on this journey
            </p>
          </div>
          <Dialog open={isCreating} onOpenChange={setIsCreating}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Share Something
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Share with the Community</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <Textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Share a win, ask for support, or offer encouragement to others..."
                  rows={4}
                />
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-muted-foreground" />
                    <Label htmlFor="anonymous" className="text-sm">Post anonymously</Label>
                  </div>
                  <Switch
                    id="anonymous"
                    checked={isAnonymous}
                    onCheckedChange={setIsAnonymous}
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
                    disabled={createPost.isPending}
                    className="flex-1"
                  >
                    {createPost.isPending ? "Posting..." : "Share"}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Community Guidelines */}
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Users className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <h3 className="font-medium text-foreground mb-1">Community Guidelines</h3>
                <p className="text-sm text-muted-foreground">
                  This is a supportive, judgment-free space. Be kind, respect privacy, 
                  and remember that everyone is on their own journey. No diet talk or 
                  weight-focused discussions.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Posts */}
        <div className="space-y-4">
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-32 bg-muted animate-pulse rounded-xl" />
              ))}
            </div>
          ) : posts && posts.length > 0 ? (
            posts.map(post => (
              <Card key={post.id}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      {post.isAnonymous ? (
                        <Shield className="h-5 w-5 text-primary" />
                      ) : (
                        <span className="text-lg font-medium text-primary">
                          {(post.authorName || "U")[0].toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-foreground">
                          {post.isAnonymous ? "Anonymous" : post.authorName || "User"}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(post.createdAt), "MMM d 'at' h:mm a")}
                        </span>
                      </div>
                      <p className="text-foreground whitespace-pre-wrap mb-3">{post.content}</p>
                      <div className="flex items-center gap-4">
                        <button
                          onClick={() => handleLike(post.id)}
                          className={`flex items-center gap-1.5 text-sm transition-colors ${
                            isLiked(post.id) 
                              ? 'text-pink-500' 
                              : 'text-muted-foreground hover:text-pink-500'
                          }`}
                        >
                          <Heart 
                            className={`h-4 w-4 ${isLiked(post.id) ? 'fill-current' : ''}`} 
                          />
                          <span>{post.likesCount}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <MessageCircle className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                <h3 className="font-medium text-foreground mb-2">No posts yet</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Be the first to share something with the community
                </p>
                <Button onClick={() => setIsCreating(true)}>
                  Share Something
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Prompts */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Need inspiration?</CardTitle>
            <CardDescription>Try sharing about one of these topics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {[
                "A small win I had today...",
                "Something I learned about myself...",
                "A technique that helped me...",
                "I'm struggling with...",
                "Words of encouragement for others...",
                "A mindful moment I experienced..."
              ].map((prompt, i) => (
                <Button
                  key={i}
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setContent(prompt);
                    setIsCreating(true);
                  }}
                >
                  {prompt}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

import { useState, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Image, Hash, BarChart3, X, Send, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { readPostImage } from "@/lib/postImage";
import { useToast } from "@/hooks/use-toast";

interface ComposePostWidgetProps {
  user: { id: string; email?: string } | null;
  profile: { avatar_url?: string | null; full_name?: string | null } | null;
  onPost: (content: string, imageUrl?: string) => Promise<{ error?: any }>;
}

export function ComposePostWidget({ user, profile, onPost }: ComposePostWidgetProps) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [newPost, setNewPost] = useState("");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isPosting, setIsPosting] = useState(false);

  const getInitials = (name: string | null | undefined) => {
    if (!name) return "U";
    return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
  };

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const { dataUrl, error } = await readPostImage(file);
    if (error) {
      toast({ title: "Image too large", description: error, variant: "destructive" });
      e.target.value = "";
      return;
    }
    setSelectedImage(dataUrl!);
  };

  const handlePost = async () => {
    if (!newPost.trim() && !selectedImage) return;
    if (!user) {
      navigate('/auth');
      return;
    }
    
    setIsPosting(true);
    const { error } = await onPost(newPost, selectedImage || undefined);
    
    if (!error) {
      setNewPost("");
      setSelectedImage(null);
    }
    setIsPosting(false);
  };

  if (!user) {
    return (
      <Card className="mx-3 sm:mx-4 bg-gradient-to-br from-card to-muted/20 border-primary/10">
        <CardContent className="p-4 sm:p-6 text-center">
          <Users className="h-10 w-10 sm:h-12 sm:w-12 mx-auto mb-3 text-muted-foreground" />
          <h3 className="font-semibold mb-2 text-sm sm:text-base">Join the Community</h3>
          <p className="text-xs sm:text-sm text-muted-foreground mb-4">Sign in to share insights and connect with traders</p>
          <Button className="btn-primary" onClick={() => navigate('/auth')}>
            Sign In
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mx-3 sm:mx-4 bg-gradient-to-br from-card to-muted/20 border-primary/10">
      <CardContent className="p-3 sm:p-4">
        <div className="flex gap-3">
          <Avatar 
            className="h-9 w-9 sm:h-10 sm:w-10 shrink-0 cursor-pointer ring-2 ring-primary/20" 
            onClick={() => navigate(`/profile/${user.id}`)}
          >
            <AvatarImage src={profile?.avatar_url || ""} />
            <AvatarFallback className="bg-gradient-primary text-primary-foreground text-sm">
              {getInitials(profile?.full_name || user.email)}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 min-w-0">
            <Textarea 
              placeholder="Share your market insights... Use $SYMBOL for stocks, #hashtag for topics"
              value={newPost}
              onChange={(e) => setNewPost(e.target.value)}
              className="min-h-[70px] sm:min-h-[80px] resize-none border-0 bg-transparent p-0 focus-visible:ring-0 text-sm placeholder:text-muted-foreground/60"
            />
            
            {selectedImage && (
              <div className="relative mt-2 rounded-xl overflow-hidden border border-border">
                <img src={selectedImage} alt="Selected" className="w-full max-h-48 sm:max-h-60 object-cover" />
                <Button 
                  variant="secondary" 
                  size="icon" 
                  className="absolute top-2 right-2 h-7 w-7 sm:h-8 sm:w-8 rounded-full bg-black/50 hover:bg-black/70 border-0"
                  onClick={() => setSelectedImage(null)}
                >
                  <X className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-white" />
                </Button>
              </div>
            )}
            
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/50">
              <div className="flex gap-0.5">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageSelect}
                  accept="image/*"
                  className="hidden"
                />
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 sm:h-9 sm:w-9"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Image className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 sm:h-9 sm:w-9">
                  <BarChart3 className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 sm:h-9 sm:w-9">
                  <Hash className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                </Button>
              </div>
              <Button 
                size="sm" 
                className="btn-primary h-8 sm:h-9 px-3 sm:px-4 text-xs sm:text-sm" 
                disabled={(!newPost.trim() && !selectedImage) || isPosting}
                onClick={handlePost}
              >
                {isPosting ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Send className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1" />
                    Post
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
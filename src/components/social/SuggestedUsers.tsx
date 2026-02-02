import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { UserPlus, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useFollows } from "@/hooks/useFollows";
import { useToast } from "@/hooks/use-toast";

interface SuggestedUser {
  id: string;
  user_id: string;
  full_name: string | null;
  avatar_url: string | null;
  bio: string | null;
}

export function SuggestedUsers() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isFollowing, toggleFollow } = useFollows();
  const { toast } = useToast();
  const [suggestions, setSuggestions] = useState<SuggestedUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSuggestions();
  }, [user]);

  const fetchSuggestions = async () => {
    // Fetch users using public view (excludes sensitive data like email)
    const { data: profiles } = await supabase
      .from('profiles_public')
      .select('id, user_id, full_name, avatar_url, bio')
      .limit(10);

    if (profiles) {
      // Filter out current user and already following
      const filtered = profiles.filter(p => p.user_id !== user?.id);
      setSuggestions(filtered.slice(0, 5));
    }
    setLoading(false);
  };

  const handleFollow = async (targetUserId: string) => {
    if (!user) {
      navigate('/auth');
      return;
    }

    const { error } = await toggleFollow(targetUserId);
    if (!error) {
      toast({ title: isFollowing(targetUserId) ? "Unfollowed" : "Following!" });
    }
  };

  const getInitials = (name: string | null) => {
    if (!name) return "U";
    return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
  };

  if (loading || suggestions.length === 0) {
    return null;
  }

  return (
    <Card className="card-gradient">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <Users className="h-4 w-4 text-primary" />
          Who to Follow
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {suggestions.map((profile) => (
          <div key={profile.id} className="flex items-center justify-between">
            <div 
              className="flex items-center gap-2 flex-1 cursor-pointer min-w-0"
              onClick={() => navigate(`/profile/${profile.user_id}`)}
            >
              <Avatar className="h-8 w-8 flex-shrink-0">
                <AvatarImage src={profile.avatar_url || ""} />
                <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                  {getInitials(profile.full_name)}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="font-medium text-sm truncate">{profile.full_name || "User"}</p>
                {profile.bio && (
                  <p className="text-xs text-muted-foreground truncate">{profile.bio}</p>
                )}
              </div>
            </div>
            <Button
              variant={isFollowing(profile.user_id) ? "outline" : "default"}
              size="sm"
              onClick={() => handleFollow(profile.user_id)}
              className="flex-shrink-0 ml-2"
            >
              {isFollowing(profile.user_id) ? "Following" : (
                <>
                  <UserPlus className="h-3 w-3 mr-1" />
                  Follow
                </>
              )}
            </Button>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

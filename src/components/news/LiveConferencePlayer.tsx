import { useState } from "react";
import { 
  Play, Pause, Volume2, VolumeX, Maximize2, Minimize2, 
  X, Users, MessageCircle, Heart, Share2, Settings,
  Radio, ChevronDown
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";

interface LiveConference {
  title: string;
  source: string;
  viewers: number;
  isLive: boolean;
}

interface LiveConferencePlayerProps {
  conference: LiveConference;
  open: boolean;
  onClose: () => void;
}

const mockComments = [
  { id: 1, user: "James M.", message: "Great insights on the monetary policy!", time: "2m ago" },
  { id: 2, user: "Sarah K.", message: "What about inflation rates?", time: "1m ago" },
  { id: 3, user: "Alex N.", message: "Looking forward to the Q&A", time: "30s ago" },
  { id: 4, user: "Mary W.", message: "Very informative session", time: "15s ago" },
];

export function LiveConferencePlayer({ conference, open, onClose }: LiveConferencePlayerProps) {
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showChat, setShowChat] = useState(true);
  const [volume, setVolume] = useState([75]);
  const [liked, setLiked] = useState(false);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl w-full p-0 gap-0 bg-black overflow-hidden max-h-[90vh]">
        <div className={`flex flex-col ${isFullscreen ? 'h-screen' : 'h-auto'}`}>
          {/* Video Player Area */}
          <div className="relative bg-black aspect-video w-full">
            {/* Video Placeholder - In a real app, this would be a video element */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-black to-accent/10 flex items-center justify-center">
              <div className="text-center">
                <Radio className="h-16 w-16 text-primary mx-auto mb-4 animate-pulse" />
                <h3 className="text-white font-semibold text-lg mb-2">{conference.title}</h3>
                <p className="text-white/60 text-sm">{conference.source}</p>
              </div>
            </div>

            {/* Live Badge & Viewers */}
            <div className="absolute top-4 left-4 flex items-center gap-3">
              <Badge className="bg-red-500 text-white text-xs font-bold px-3 py-1">
                <span className="w-2 h-2 bg-white rounded-full mr-2 animate-pulse" />
                LIVE
              </Badge>
              <Badge variant="secondary" className="bg-black/50 text-white text-xs">
                <Users className="h-3 w-3 mr-1" />
                {conference.viewers.toLocaleString()} watching
              </Badge>
            </div>

            {/* Close Button */}
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4 text-white hover:bg-white/20"
              onClick={onClose}
            >
              <X className="h-5 w-5" />
            </Button>

            {/* Video Controls Overlay */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
              {/* Progress Bar (for live, shows buffer) */}
              <div className="w-full h-1 bg-white/20 rounded-full mb-4">
                <div className="h-full bg-red-500 rounded-full w-full animate-pulse" />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {/* Play/Pause */}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-white hover:bg-white/20"
                    onClick={() => setIsPlaying(!isPlaying)}
                  >
                    {isPlaying ? (
                      <Pause className="h-5 w-5" />
                    ) : (
                      <Play className="h-5 w-5" />
                    )}
                  </Button>

                  {/* Volume */}
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-white hover:bg-white/20"
                      onClick={() => setIsMuted(!isMuted)}
                    >
                      {isMuted ? (
                        <VolumeX className="h-5 w-5" />
                      ) : (
                        <Volume2 className="h-5 w-5" />
                      )}
                    </Button>
                    <Slider
                      value={isMuted ? [0] : volume}
                      onValueChange={setVolume}
                      max={100}
                      step={1}
                      className="w-20"
                    />
                  </div>

                  {/* Live indicator */}
                  <span className="text-white text-sm font-medium flex items-center gap-1">
                    <span className="w-2 h-2 bg-red-500 rounded-full" />
                    LIVE
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {/* Chat Toggle */}
                  <Button
                    variant="ghost"
                    size="icon"
                    className={`text-white hover:bg-white/20 ${showChat ? 'bg-white/20' : ''}`}
                    onClick={() => setShowChat(!showChat)}
                  >
                    <MessageCircle className="h-5 w-5" />
                  </Button>

                  {/* Settings */}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-white hover:bg-white/20"
                  >
                    <Settings className="h-5 w-5" />
                  </Button>

                  {/* Fullscreen */}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-white hover:bg-white/20"
                    onClick={() => setIsFullscreen(!isFullscreen)}
                  >
                    {isFullscreen ? (
                      <Minimize2 className="h-5 w-5" />
                    ) : (
                      <Maximize2 className="h-5 w-5" />
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Section: Info + Chat */}
          <div className="bg-background flex flex-col md:flex-row">
            {/* Stream Info */}
            <div className="flex-1 p-4 border-b md:border-b-0 md:border-r border-border">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="font-bold text-lg mb-1">{conference.title}</h2>
                  <p className="text-sm text-muted-foreground">{conference.source}</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <Button 
                  variant={liked ? "default" : "outline"} 
                  size="sm"
                  onClick={() => setLiked(!liked)}
                  className={liked ? "bg-red-500 hover:bg-red-600" : ""}
                >
                  <Heart className={`h-4 w-4 mr-1 ${liked ? 'fill-current' : ''}`} />
                  {liked ? 'Liked' : 'Like'}
                </Button>
                <Button variant="outline" size="sm">
                  <Share2 className="h-4 w-4 mr-1" />
                  Share
                </Button>
              </div>

              <div className="mt-4 p-3 bg-muted/50 rounded-lg">
                <p className="text-sm text-muted-foreground">
                  Join us for the live press conference on monetary policy. 
                  The Central Bank will be discussing key economic indicators, 
                  interest rate decisions, and the outlook for the coming quarter.
                </p>
              </div>
            </div>

            {/* Live Chat */}
            {showChat && (
              <div className="w-full md:w-80 flex flex-col bg-muted/30 max-h-64 md:max-h-80">
                <div className="p-3 border-b border-border flex items-center justify-between">
                  <h3 className="font-semibold text-sm flex items-center gap-2">
                    <MessageCircle className="h-4 w-4" />
                    Live Chat
                  </h3>
                  <Badge variant="secondary" className="text-xs">
                    {conference.viewers} viewers
                  </Badge>
                </div>

                <ScrollArea className="flex-1 p-3">
                  <div className="space-y-3">
                    {mockComments.map((comment) => (
                      <div key={comment.id} className="flex gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarFallback className="text-xs bg-primary/20">
                            {comment.user.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-medium">{comment.user}</span>
                            <span className="text-[10px] text-muted-foreground">{comment.time}</span>
                          </div>
                          <p className="text-xs text-muted-foreground">{comment.message}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>

                <div className="p-3 border-t border-border">
                  <div className="flex gap-2">
                    <Input 
                      placeholder="Send a message..." 
                      className="text-xs h-8"
                    />
                    <Button size="sm" className="h-8 px-3">
                      Send
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

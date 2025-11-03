import { ArrowLeft, BookOpen, Play, Coffee, Award, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TopBar } from "@/components/shared/TopBar";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { Progress } from "@/components/ui/progress";

export default function Learn() {
  const navigate = useNavigate();

  const courses = [
    { 
      title: "Stock Market Basics", 
      progress: 0, 
      lessons: 12, 
      duration: "2 hours",
      level: "Beginner",
      type: "video",
      icon: Play
    },
    { 
      title: "Technical Analysis Masterclass", 
      progress: 40, 
      lessons: 8, 
      duration: "3 hours",
      level: "Intermediate",
      type: "video",
      icon: Play
    },
    { 
      title: "Portfolio Management", 
      progress: 100, 
      lessons: 10, 
      duration: "2.5 hours",
      level: "Advanced",
      type: "text",
      icon: BookOpen
    },
    { 
      title: "Risk Management Strategies", 
      progress: 25, 
      lessons: 15, 
      duration: "4 hours",
      level: "Intermediate",
      type: "audio",
      icon: Coffee
    },
    { 
      title: "NSE Trading Guide", 
      progress: 0, 
      lessons: 6, 
      duration: "1.5 hours",
      level: "Beginner",
      type: "video",
      icon: Play
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-hero">
      <TopBar 
        title="Learn" 
        subtitle="Investment courses & guides"
        showSearch={true}
        showAI={false}
        showNotifications={true}
      />

      <div className="p-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(-1)}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        {/* Learning Stats */}
        <Card className="card-gradient mb-6">
          <CardContent className="p-4">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-primary mb-1">5</div>
                <div className="text-xs text-muted-foreground">Courses</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-accent mb-1">33%</div>
                <div className="text-xs text-muted-foreground">Progress</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-bull mb-1">2</div>
                <div className="text-xs text-muted-foreground">Completed</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Filter Buttons */}
        <div className="flex space-x-2 mb-4 overflow-x-auto pb-2">
          <Button variant="default" size="sm" className="text-xs whitespace-nowrap">All Courses</Button>
          <Button variant="ghost" size="sm" className="text-xs whitespace-nowrap">Beginner</Button>
          <Button variant="ghost" size="sm" className="text-xs whitespace-nowrap">Intermediate</Button>
          <Button variant="ghost" size="sm" className="text-xs whitespace-nowrap">Advanced</Button>
          <Button variant="ghost" size="sm" className="text-xs whitespace-nowrap">In Progress</Button>
        </div>

        {/* Courses List */}
        <div className="space-y-4">
          {courses.map((course, index) => {
            const Icon = course.icon;
            return (
              <Card key={index} className="card-gradient hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-sm mb-2">{course.title}</CardTitle>
                      <div className="flex flex-wrap items-center gap-2 mb-3">
                        <Badge variant="outline" className="text-xs">
                          {course.level}
                        </Badge>
                        <div className="flex items-center text-xs text-muted-foreground">
                          <Icon className="h-3 w-3 mr-1" />
                          <span>{course.type}</span>
                        </div>
                        <div className="flex items-center text-xs text-muted-foreground">
                          <Clock className="h-3 w-3 mr-1" />
                          <span>{course.duration}</span>
                        </div>
                      </div>
                    </div>
                    {course.progress === 100 && (
                      <Award className="h-6 w-6 text-accent ml-2" />
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">{course.lessons} lessons</span>
                      <span className="text-primary font-medium">{course.progress}%</span>
                    </div>
                    <Progress value={course.progress} className="h-2" />
                    <Button 
                      className="w-full mt-3" 
                      variant={course.progress === 0 ? "default" : "outline"}
                      size="sm"
                    >
                      {course.progress === 0 ? "Start Course" : course.progress === 100 ? "Review" : "Continue"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}

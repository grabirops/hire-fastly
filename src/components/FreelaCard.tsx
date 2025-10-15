import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Star, MapPin, DollarSign } from "lucide-react";

interface FreelaCardProps {
  name: string;
  headline?: string;
  skills: string[];
  seniority?: string;
  rateHour?: number;
  location?: string;
  trustScore?: number;
  rank: number;
  scoreExplanation?: Record<string, any>;
}

export const FreelaCard = ({ 
  name, 
  headline, 
  skills, 
  seniority, 
  rateHour, 
  location, 
  trustScore,
  rank,
  scoreExplanation
}: FreelaCardProps) => {
  const initials = name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex items-start gap-4">
          <Avatar className="h-12 w-12">
            <AvatarFallback className="bg-primary text-primary-foreground">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">{name}</CardTitle>
              <Badge variant="secondary">#{rank}</Badge>
            </div>
            {headline && (
              <p className="text-sm text-muted-foreground mt-1">{headline}</p>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-2">
          {skills.slice(0, 6).map((skill) => (
            <Badge key={skill} variant="outline" className="text-xs">
              {skill}
            </Badge>
          ))}
        </div>

        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          {seniority && (
            <Badge variant="secondary">{seniority}</Badge>
          )}
          {rateHour && (
            <div className="flex items-center gap-1">
              <DollarSign className="h-3 w-3" />
              <span>R$ {rateHour}/h</span>
            </div>
          )}
          {location && (
            <div className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              <span>{location}</span>
            </div>
          )}
          {trustScore !== undefined && (
            <div className="flex items-center gap-1">
              <Star className="h-3 w-3 fill-warning text-warning" />
              <span>{trustScore.toFixed(1)}</span>
            </div>
          )}
        </div>

        {scoreExplanation && (
          <div className="text-xs text-muted-foreground bg-accent p-2 rounded">
            <p className="font-medium mb-1">Match Score:</p>
            <div className="space-y-1">
              {Object.entries(scoreExplanation).map(([key, value]) => (
                <div key={key} className="flex justify-between">
                  <span>{key}:</span>
                  <span className="font-medium">{value}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

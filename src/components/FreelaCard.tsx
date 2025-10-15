import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Star, MapPin, DollarSign } from "lucide-react";
import VerificationBadge from "./VerificationBadge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

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
  verifLevel?: number;
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
  scoreExplanation,
  verifLevel,
}: FreelaCardProps) => {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

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
            <div className="flex items-center gap-2 mt-2">
              <VerificationBadge level={verifLevel} />
              <Badge variant="secondary">Score: {trustScore?.toFixed(1)}</Badge>
            </div>
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
          {seniority && <Badge variant="secondary">{seniority}</Badge>}
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
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center gap-1 text-sm font-semibold text-primary cursor-pointer">
                <Star className="h-4 w-4" />
                <span>{`Rank #${rank} (Score: ${(trustScore * 100).toFixed(
                  0
                )})`}</span>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <div className="p-2 text-sm">
                <p className="font-bold mb-2">Detalhes do Score:</p>
                <ul className="list-disc list-inside space-y-1">
                  {scoreExplanation?.semanticSimilarity && (
                    <li>
                      Similaridade Semântica:{" "}
                      {(
                        scoreExplanation.semanticSimilarity.value * 100
                      ).toFixed(0)}
                      %
                    </li>
                  )}
                  {scoreExplanation?.skillMatch && (
                    <li>
                      Match de Skills:{" "}
                      {(scoreExplanation.skillMatch.value * 100).toFixed(0)}%
                    </li>
                  )}
                  {/* ... outros fatores */}
                </ul>
              </div>
            </TooltipContent>
          </Tooltip>
        )}
      </CardContent>
    </Card>
  );
};

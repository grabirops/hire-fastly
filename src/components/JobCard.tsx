import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, DollarSign, Briefcase } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface JobCardProps {
  id: string;
  title: string;
  description: string;
  skills: string[];
  model: "FIXO" | "HORA";
  budget?: number;
  deadline?: string;
  companyName?: string;
  status: string;
}

export const JobCard = ({ id, title, description, skills, model, budget, deadline, companyName, status }: JobCardProps) => {
  const navigate = useNavigate();

  return (
    <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate(`/vaga/${id}`)}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-xl mb-2">{title}</CardTitle>
            {companyName && (
              <CardDescription className="flex items-center gap-2">
                <Briefcase className="h-4 w-4" />
                {companyName}
              </CardDescription>
            )}
          </div>
          <Badge variant={status === "ATIVO" ? "default" : "secondary"}>
            {status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
          {description}
        </p>

        <div className="flex flex-wrap gap-2 mb-4">
          {skills.slice(0, 5).map((skill) => (
            <Badge key={skill} variant="outline">
              {skill}
            </Badge>
          ))}
          {skills.length > 5 && (
            <Badge variant="outline">+{skills.length - 5}</Badge>
          )}
        </div>

        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-4">
            {budget && (
              <div className="flex items-center gap-1">
                <DollarSign className="h-4 w-4" />
                <span>R$ {budget.toLocaleString()}</span>
                {model === "HORA" && <span>/hora</span>}
              </div>
            )}
            {deadline && (
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>{new Date(deadline).toLocaleDateString()}</span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

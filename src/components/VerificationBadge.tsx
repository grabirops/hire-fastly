import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { CheckCircle, Shield, Star } from "lucide-react";

interface VerificationBadgeProps {
  level: number | null | undefined;
}

const verificationLevels = {
  0: {
    label: "Email Verificado",
    icon: <CheckCircle className="h-4 w-4" />,
    style: "bg-blue-100 text-blue-800",
  },
  1: {
    label: "Documento Verificado",
    icon: <Shield className="h-4 w-4" />,
    style: "bg-green-100 text-green-800",
  },
  2: {
    label: "Teste Técnico Aprovado",
    icon: <Star className="h-4 w-4" />,
    style: "bg-purple-100 text-purple-800",
  },
};

export default function VerificationBadge({ level }: VerificationBadgeProps) {
  const verif =
    level !== null && level !== undefined && verificationLevels[level]
      ? verificationLevels[level]
      : null;

  if (!verif) {
    return null;
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge className={`flex items-center gap-1 ${verif.style}`}>
            {verif.icon}
            <span>{verif.label}</span>
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <p>Este é o nível de verificação do usuário na plataforma.</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

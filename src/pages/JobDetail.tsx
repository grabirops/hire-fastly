import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import {
  Briefcase,
  Calendar,
  DollarSign,
  ArrowLeft,
  Send,
  Users,
  MessageSquare,
} from "lucide-react";
import ModalContrato from "@/components/ModalContrato";
import DOMPurify from "dompurify";

const JobDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [job, setJob] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [hasProposal, setHasProposal] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProposalId, setSelectedProposalId] = useState("");

  useEffect(() => {
    checkUser();
    fetchJob();
  }, [id]);

  const checkUser = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    setUser(session?.user ?? null);
    if (session?.user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", session.user.id)
        .single();

      setUserRole(profile?.role || null);

      // Check if user already sent a proposal
      if (profile?.role === "FREELA") {
        const { data } = await supabase
          .from("proposals")
          .select("id")
          .eq("job_id", id)
          .eq("freela_id", session.user.id)
          .single();

        setHasProposal(!!data);
      }
    }
  };

  const fetchJob = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("jobs")
      .select(
        `
        *,
        company:company_id(
          name,
          company_profiles(display_name, verified)
        )
      `
      )
      .eq("id", id)
      .single();

    if (error) {
      toast({
        title: "Erro ao carregar vaga",
        description: error.message,
        variant: "destructive",
      });
      navigate("/");
    } else {
      setJob(data);
    }
    setLoading(false);
  };

  const handleAcceptProposal = (proposalId: string) => {
    setSelectedProposalId(proposalId);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedProposalId("");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Carregando...</p>
      </div>
    );
  }

  if (!job) return null;

  const isOwner = user?.id === job.company_id;
  const canPropose = userRole === "FREELA" && !isOwner && !hasProposal;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <Button
            variant="ghost"
            onClick={() => navigate("/")}
            className="mb-2"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="space-y-6">
          {/* Header */}
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Briefcase className="h-6 w-6 text-primary" />
                    <Badge
                      variant={job.status === "ATIVO" ? "default" : "secondary"}
                    >
                      {job.status}
                    </Badge>
                  </div>
                  <CardTitle className="text-3xl mb-3">{job.title}</CardTitle>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <span>
                      {job.company?.company_profiles?.[0]?.display_name ||
                        job.company?.name}
                    </span>
                    {job.company?.company_profiles?.[0]?.verified && (
                      <Badge variant="outline" className="text-xs">
                        Verificada
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {job.budget && (
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <DollarSign className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Orçamento</p>
                      <p className="font-semibold">
                        R$ {job.budget.toLocaleString()}
                        {job.model === "HORA" && "/hora"}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {job.deadline && (
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-secondary/10 rounded-lg">
                      <Calendar className="h-5 w-5 text-secondary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Prazo</p>
                      <p className="font-semibold">
                        {new Date(job.deadline).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-accent rounded-lg">
                    <Briefcase className="h-5 w-5 text-accent-foreground" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Modelo</p>
                    <p className="font-semibold">
                      {job.model === "FIXO" ? "Preço Fixo" : "Por Hora"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Description */}
          <Card>
            <CardHeader>
              <CardTitle>Descrição da Vaga</CardTitle>
            </CardHeader>
            <CardContent>
              <div
                className="prose dark:prose-invert max-w-none"
                dangerouslySetInnerHTML={{
                  __html: DOMPurify.sanitize(job.description),
                }}
              />
            </CardContent>
          </Card>

          {/* Skills */}
          <Card>
            <CardHeader>
              <CardTitle>Skills Requeridas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {(Array.isArray(job.skills) ? job.skills : []).map(
                  (skill: string) => (
                    <Badge key={skill} variant="secondary">
                      {skill}
                    </Badge>
                  )
                )}
              </div>
              {job.seniority && (
                <div className="mt-4">
                  <p className="text-sm text-muted-foreground mb-2">
                    Nível de Senioridade:
                  </p>
                  <Badge>{job.seniority}</Badge>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Actions */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-wrap gap-3">
                {isOwner && (
                  <>
                    <Button onClick={() => navigate(`/vaga/${id}/shortlist`)}>
                      <Users className="h-4 w-4 mr-2" />
                      Ver Shortlist
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => navigate(`/chat/${id}`)}
                    >
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Chat
                    </Button>
                  </>
                )}
                {canPropose && (
                  <Button onClick={() => navigate(`/vaga/${id}/proposta`)}>
                    <Send className="h-4 w-4 mr-2" />
                    Enviar Proposta
                  </Button>
                )}
                {hasProposal && userRole === "FREELA" && (
                  <Badge variant="secondary" className="px-4 py-2">
                    Proposta já enviada
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      {selectedProposalId && (
        <ModalContrato
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          proposalId={selectedProposalId}
        />
      )}
    </div>
  );
};

export default JobDetail;

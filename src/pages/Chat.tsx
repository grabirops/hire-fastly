import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import ChatBox from "@/components/ChatBox";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft } from "lucide-react";

const Chat = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<any>(null);
  const [job, setJob] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAccess();
  }, [jobId]);

  const checkAccess = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) {
      toast({
        title: "Acesso negado",
        description: "Você precisa estar logado.",
        variant: "destructive",
      });
      navigate("/auth");
      return;
    }

    setUser(session.user);

    // Fetch job to verify access
    const { data: jobData } = await supabase
      .from("jobs")
      .select("*")
      .eq("id", jobId)
      .single();

    if (!jobData) {
      toast({
        title: "Vaga não encontrada",
        variant: "destructive",
      });
      navigate("/");
      return;
    }

    setJob(jobData);

    // Check if user has access (is owner or has sent proposal)
    const isOwner = jobData.company_id === session.user.id;

    if (!isOwner) {
      const { data: proposal } = await supabase
        .from("proposals")
        .select("id")
        .eq("job_id", jobId)
        .eq("freela_id", session.user.id)
        .single();

      if (!proposal) {
        toast({
          title: "Acesso negado",
          description: "Você precisa enviar uma proposta para acessar o chat.",
          variant: "destructive",
        });
        navigate(`/vaga/${jobId}`);
        return;
      }
    }

    setLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Carregando chat...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <Button
            variant="ghost"
            onClick={() => navigate(`/vaga/${jobId}`)}
            className="mb-2"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <h1 className="text-2xl font-bold">{job?.title}</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <ChatBox jobId={jobId!} />
      </main>
    </div>
  );
};

export default Chat;

import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FreelaCard } from "@/components/FreelaCard";
import { EmptyState } from "@/components/EmptyState";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Users } from "lucide-react";

const Shortlist = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [job, setJob] = useState<any>(null);
  const [shortlist, setShortlist] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAccess();
    fetchData();
  }, [id]);

  const checkAccess = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      toast({
        title: "Acesso negado",
        description: "Você precisa estar logado.",
        variant: "destructive"
      });
      navigate("/auth");
      return;
    }

    const { data: job } = await supabase
      .from("jobs")
      .select("company_id")
      .eq("id", id)
      .single();

    if (job?.company_id !== session.user.id) {
      toast({
        title: "Acesso negado",
        description: "Apenas o dono da vaga pode ver a shortlist.",
        variant: "destructive"
      });
      navigate("/");
    }
  };

  const fetchData = async () => {
    setLoading(true);

    // Fetch job
    const { data: jobData } = await supabase
      .from("jobs")
      .select("*")
      .eq("id", id)
      .single();

    setJob(jobData);

    // Fetch shortlist
    const { data: shortlistData, error } = await supabase
      .from("shortlist")
      .select(`
        *,
        freelancer:freela_id(
          name,
          freelancer_profiles(*)
        )
      `)
      .eq("job_id", id)
      .order("rank", { ascending: true });

    if (error) {
      toast({
        title: "Erro ao carregar shortlist",
        description: error.message,
        variant: "destructive"
      });
    } else {
      setShortlist(shortlistData || []);
    }

    setLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Carregando shortlist...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <Button variant="ghost" onClick={() => navigate(`/vaga/${id}`)} className="mb-2">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar para Vaga
          </Button>
          <div className="flex items-center gap-2">
            <Users className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold">Shortlist</h1>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-5xl">
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>{job?.title}</CardTitle>
            <CardDescription>
              Top candidatos selecionados automaticamente baseado em skills, senioridade e disponibilidade
            </CardDescription>
          </CardHeader>
        </Card>

        {shortlist.length === 0 ? (
          <EmptyState
            icon={Users}
            title="Shortlist em Progresso"
            description="A shortlist está sendo gerada. Aguarde alguns instantes e recarregue a página."
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {shortlist.map((item) => {
              const profile = item.freelancer?.freelancer_profiles?.[0];
              return (
                <FreelaCard
                  key={item.id}
                  name={item.freelancer?.name || "Freelancer"}
                  headline={profile?.headline}
                  skills={Array.isArray(profile?.skills) ? profile.skills : []}
                  seniority={profile?.seniority}
                  rateHour={profile?.rate_hour}
                  location={profile?.location}
                  trustScore={item.freelancer?.trust_score}
                  rank={item.rank}
                  scoreExplanation={item.score_json || {}}
                />
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};

export default Shortlist;

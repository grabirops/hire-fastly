import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Send } from "lucide-react";

const Proposal = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [job, setJob] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [message, setMessage] = useState("");
  const [price, setPrice] = useState("");
  const [duration, setDuration] = useState("");

  useEffect(() => {
    checkAccess();
    fetchJob();
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

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", session.user.id)
      .single();

    if (profile?.role !== "FREELA") {
      toast({
        title: "Acesso negado",
        description: "Apenas freelancers podem enviar propostas.",
        variant: "destructive"
      });
      navigate("/");
      return;
    }

    // Check if already has proposal
    const { data: existingProposal } = await supabase
      .from("proposals")
      .select("id")
      .eq("job_id", id)
      .eq("freela_id", session.user.id)
      .single();

    if (existingProposal) {
      toast({
        title: "Proposta já enviada",
        description: "Você já enviou uma proposta para esta vaga.",
        variant: "destructive"
      });
      navigate(`/vaga/${id}`);
      return;
    }

    setUser(session.user);
  };

  const fetchJob = async () => {
    const { data } = await supabase
      .from("jobs")
      .select("*")
      .eq("id", id)
      .single();

    setJob(data);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!message.trim()) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, escreva uma mensagem.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    const proposalData: any = {
      job_id: id,
      freela_id: user.id,
      message: message.trim()
    };

    if (price) proposalData.price = parseFloat(price);
    if (duration) proposalData.duration = duration;

    const { error } = await supabase
      .from("proposals")
      .insert(proposalData);

    setLoading(false);

    if (error) {
      if (error.code === "23505") {
        toast({
          title: "Proposta duplicada",
          description: "Você já enviou uma proposta para esta vaga.",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Erro ao enviar proposta",
          description: error.message,
          variant: "destructive"
        });
      }
    } else {
      toast({
        title: "Proposta enviada!",
        description: "Sua proposta foi enviada com sucesso."
      });
      navigate(`/vaga/${id}`);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <Button variant="ghost" onClick={() => navigate(`/vaga/${id}`)} className="mb-2">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <h1 className="text-2xl font-bold">Enviar Proposta</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-3xl">
        {job && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>{job.title}</CardTitle>
              <CardDescription>
                Modelos: {job.model === "FIXO" ? "Preço Fixo" : "Por Hora"}
                {job.budget && ` | Orçamento: R$ ${job.budget.toLocaleString()}`}
              </CardDescription>
            </CardHeader>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Sua Proposta</CardTitle>
            <CardDescription>
              Você só pode enviar uma proposta por vaga. Certifique-se de incluir todas as informações.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="message">Mensagem *</Label>
                <Textarea
                  id="message"
                  placeholder="Descreva sua experiência relevante e como você pode ajudar neste projeto..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={8}
                  required
                />
                <p className="text-sm text-muted-foreground">
                  Mínimo 10 caracteres
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">
                    Valor Proposto (R$) {job?.model === "HORA" && "por hora"}
                  </Label>
                  <Input
                    id="price"
                    type="number"
                    placeholder="5000"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    min="0"
                    step="0.01"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="duration">Tempo de Entrega</Label>
                  <Input
                    id="duration"
                    placeholder="Ex: 2 semanas"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                  />
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                <Send className="h-4 w-4 mr-2" />
                {loading ? "Enviando..." : "Enviar Proposta"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Proposal;

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Briefcase, X, ArrowLeft } from "lucide-react";

const SKILLS_OPTIONS = [
  "JavaScript", "TypeScript", "React", "Node.js", "Python", "SQL", 
  "PostgreSQL", "MongoDB", "AWS", "Docker", "UI/UX", "Figma",
  "Next.js", "Vue.js", "Angular", "PHP", "Ruby", "Go"
];

const NewJob = () => {
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState("");
  const [seniority, setSeniority] = useState<string>("");
  const [model, setModel] = useState<"FIXO" | "HORA">("FIXO");
  const [budget, setBudget] = useState("");
  const [deadline, setDeadline] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      toast({
        title: "Acesso negado",
        description: "Você precisa estar logado para criar vagas.",
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

    if (profile?.role !== "EMPRESA") {
      toast({
        title: "Acesso negado",
        description: "Apenas empresas podem criar vagas.",
        variant: "destructive"
      });
      navigate("/");
      return;
    }

    setUser(session.user);
  };

  const addSkill = (skill: string) => {
    const trimmedSkill = skill.trim();
    if (trimmedSkill && !skills.includes(trimmedSkill)) {
      setSkills([...skills, trimmedSkill]);
      setSkillInput("");
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setSkills(skills.filter(s => s !== skillToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title || !description || skills.length === 0) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha título, descrição e adicione pelo menos uma skill.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    const jobData: any = {
      company_id: user.id,
      title,
      description,
      skills,
      model,
      status: "ATIVO"
    };

    if (seniority) jobData.seniority = seniority;
    if (budget) jobData.budget = parseFloat(budget);
    if (deadline) jobData.deadline = new Date(deadline).toISOString();

    const { data, error } = await supabase
      .from("jobs")
      .insert(jobData)
      .select()
      .single();

    if (error) {
      toast({
        title: "Erro ao criar vaga",
        description: error.message,
        variant: "destructive"
      });
      setLoading(false);
      return;
    }

    // Trigger shortlist generation
    if (data) {
      supabase.functions.invoke('generate-shortlist', {
        body: { jobId: data.id }
      }).catch(err => console.error('Shortlist generation error:', err));
    }

    toast({
      title: "Vaga criada!",
      description: "Sua vaga foi publicada com sucesso."
    });

    setLoading(false);
    navigate(`/vaga/${data.id}/shortlist`);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <Button variant="ghost" onClick={() => navigate("/")} className="mb-2">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <div className="flex items-center gap-2">
            <Briefcase className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold">Nova Vaga</h1>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-3xl">
        <Card>
          <CardHeader>
            <CardTitle>Criar Nova Vaga</CardTitle>
            <CardDescription>
              Preencha as informações da vaga para atrair os melhores freelancers
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">Título da Vaga *</Label>
                <Input
                  id="title"
                  placeholder="Ex: Desenvolvedor React Sênior"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descrição *</Label>
                <Textarea
                  id="description"
                  placeholder="Descreva os requisitos, responsabilidades e expectativas..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={6}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Skills Requeridas *</Label>
                <div className="flex gap-2">
                  <Select value={skillInput} onValueChange={addSkill}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma skill" />
                    </SelectTrigger>
                    <SelectContent>
                      {SKILLS_OPTIONS.filter(s => !skills.includes(s)).map(skill => (
                        <SelectItem key={skill} value={skill}>{skill}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {skills.map(skill => (
                    <Badge key={skill} variant="secondary" className="gap-1">
                      {skill}
                      <button
                        type="button"
                        onClick={() => removeSkill(skill)}
                        className="ml-1 hover:text-destructive"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="seniority">Nível de Senioridade</Label>
                  <Select value={seniority} onValueChange={setSeniority}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="JUNIOR">Júnior</SelectItem>
                      <SelectItem value="PLENO">Pleno</SelectItem>
                      <SelectItem value="SENIOR">Sênior</SelectItem>
                      <SelectItem value="ESPECIALISTA">Especialista</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="model">Modelo de Contratação *</Label>
                  <Select value={model} onValueChange={(v) => setModel(v as "FIXO" | "HORA")}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="FIXO">Preço Fixo</SelectItem>
                      <SelectItem value="HORA">Por Hora</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="budget">
                    Orçamento (R$) {model === "HORA" && "por hora"}
                  </Label>
                  <Input
                    id="budget"
                    type="number"
                    placeholder="5000"
                    value={budget}
                    onChange={(e) => setBudget(e.target.value)}
                    min="0"
                    step="0.01"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="deadline">Prazo de Entrega</Label>
                  <Input
                    id="deadline"
                    type="date"
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                  />
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Criando..." : "Criar Vaga"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default NewJob;

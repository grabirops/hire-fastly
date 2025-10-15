import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  CheckCircle,
  Zap,
  ShieldCheck,
  BrainCircuit,
  Users,
  Award,
} from "lucide-react";
import { Link } from "react-router-dom";

const features = [
  {
    icon: <BrainCircuit className="h-10 w-10 text-primary" />,
    title: "Shortlist Inteligente com IA",
    description:
      "Nossa IA analisa as necessidades do seu projeto e o perfil de cada freelancer para criar uma lista de candidatos com a maior probabilidade de sucesso, baseada em semântica e dados.",
  },
  {
    icon: <ShieldCheck className="h-10 w-10 text-primary" />,
    title: "Contratação e Pagamento Seguros",
    description:
      "Execute contratos, defina marcos de entrega (milestones) e realize pagamentos com segurança via Pix, tudo dentro da plataforma, garantindo transparência e confiança para todos.",
  },
  {
    icon: <Award className="h-10 w-10 text-primary" />,
    title: "Talentos Verificados",
    description:
      "Construa confiança com nosso sistema de verificação em múltiplos níveis e um Score de Confiança que reflete o histórico e a reputação de cada profissional na plataforma.",
  },
  {
    icon: <Zap className="h-10 w-10 text-primary" />,
    title: "Processo Ágil e Direto",
    description:
      "Sem intermediários, sem burocracia. Publique sua vaga, receba uma shortlist otimizada em pouco tempo e inicie a conversa com os melhores talentos do mercado.",
  },
];

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Hero Section */}
      <section className="container mx-auto flex flex-col items-center justify-center text-center py-20 md:py-32">
        <h1 className="text-4xl md:text-6xl font-bold tracking-tighter mb-4">
          A nova era do trabalho freelance.
        </h1>
        <p className="max-w-3xl text-lg md:text-xl text-muted-foreground mb-8">
          Conectamos empresas aos freelancers mais qualificados do mercado
          através de uma plataforma inteligente, ágil e segura. Encontre o
          talento certo ou o projeto ideal, sem esforço.
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <Button asChild size="lg">
            <Link to="/vagas">Encontrar Talentos</Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link to="/auth">Buscar Projetos</Link>
          </Button>
        </div>
      </section>

      {/* Features Section */}
      <section id="diferenciais" className="bg-muted py-20">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold">
              Por que a Hire-Fastly é a sua melhor escolha?
            </h2>
            <p className="max-w-2xl mx-auto mt-4 text-muted-foreground">
              Focamos em tecnologia e segurança para criar a experiência de
              contratação mais eficiente que você já viu.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {features.map((feature) => (
              <div key={feature.title} className="flex items-start gap-6">
                <div>{feature.icon}</div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-12">
            Simples, Rápido e Eficaz
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex flex-col items-center">
              <div className="flex items-center justify-center h-16 w-16 rounded-full bg-primary text-primary-foreground font-bold text-2xl mb-4">
                1
              </div>
              <h3 className="text-xl font-semibold mb-2">Publique sua Vaga</h3>
              <p className="text-muted-foreground">
                Descreva seu projeto e as habilidades que você precisa. É grátis
                e leva poucos minutos.
              </p>
            </div>
            <div className="flex flex-col items-center">
              <div className="flex items-center justify-center h-16 w-16 rounded-full bg-primary text-primary-foreground font-bold text-2xl mb-4">
                2
              </div>
              <h3 className="text-xl font-semibold mb-2">
                Receba sua Shortlist
              </h3>
              <p className="text-muted-foreground">
                Nossa IA analisa os candidatos e entrega uma lista otimizada com
                os perfis mais compatíveis.
              </p>
            </div>
            <div className="flex flex-col items-center">
              <div className="flex items-center justify-center h-16 w-16 rounded-full bg-primary text-primary-foreground font-bold text-2xl mb-4">
                3
              </div>
              <h3 className="text-xl font-semibold mb-2">
                Contrate com Segurança
              </h3>
              <p className="text-muted-foreground">
                Converse, negocie e feche o contrato com pagamento seguro por
                marcos de entrega.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="bg-primary text-primary-foreground">
        <div className="container mx-auto text-center py-20">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Pronto para começar?
          </h2>
          <p className="max-w-2xl mx-auto mb-8">
            Junte-se a centenas de empresas e freelancers que estão construindo
            o futuro do trabalho.
          </p>
          <Button asChild size="lg" variant="secondary">
            <Link to="/auth">Cadastre-se Gratuitamente</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}

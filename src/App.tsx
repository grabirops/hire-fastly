import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  BrowserRouter,
  Routes,
  Route,
  Link,
  useLocation,
} from "react-router-dom";
import Auth from "./pages/Auth";
import NewJob from "./pages/NewJob";
import JobDetail from "./pages/JobDetail";
import Shortlist from "./pages/Shortlist";
import Proposal from "./pages/Proposal";
import Chat from "./pages/Chat";
import NotFound from "./pages/NotFound";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import ContractDetail from "./pages/ContractDetail";
import { ThemeToggle } from "./components/ThemeToggle";
import { Button } from "./components/ui/button";
import { useEffect, useState } from "react";
import { supabase } from "./integrations/supabase/client";
import LandingPage from "./pages/LandingPage";
import Jobs from "./pages/Jobs";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <main className="flex flex-col min-h-screen">
        <BrowserRouter>
          <Header />
          <div className="flex-grow">
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/vagas" element={<Jobs />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/nova-vaga" element={<NewJob />} />
                <Route path="/vaga/:id" element={<JobDetail />} />
                <Route path="/vaga/:id/shortlist" element={<Shortlist />} />
                <Route path="/vaga/:id/proposta" element={<Proposal />} />
                <Route path="/chat/:jobId" element={<Chat />} />
                <Route
                  path="/empresa/contratos/:id"
                  element={<ContractDetail />}
                />
                <Route path="/termos" element={<Terms />} />
                <Route path="/privacidade" element={<Privacy />} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </TooltipProvider>
          </div>
          <Footer />
        </BrowserRouter>
      </main>
    </QueryClientProvider>
  );
}

const Header = () => {
  const location = useLocation();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const isLandingPage = location.pathname === "/";

  return (
    <header className="border-b sticky top-0 bg-background/95 backdrop-blur z-10">
      <div className="container mx-auto p-4 flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold text-primary">
          Hire-Fastly
        </Link>
        <div className="flex items-center gap-4">
          <ThemeToggle />
          {user ? (
            <>
              <Button asChild variant="ghost">
                <Link to="/vagas">Vagas</Link>
              </Button>
              <Button onClick={handleLogout} variant="outline">
                Sair
              </Button>
            </>
          ) : (
            <>
              <Button asChild variant="ghost">
                <Link to="/auth">Entrar</Link>
              </Button>
              <Button asChild>
                <Link to="/auth">Cadastrar</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

const Footer = () => (
  <footer className="bg-gray-100 border-t mt-auto">
    <div className="container mx-auto p-4 flex justify-between items-center text-sm text-gray-600">
      <p>
        &copy; {new Date().getFullYear()} Hire-Fastly. Todos os direitos
        reservados.
      </p>
      <div className="flex gap-4">
        <Link to="/termos" className="hover:underline">
          Termos de Serviço
        </Link>
        <Link to="/privacidade" className="hover:underline">
          Política de Privacidade
        </Link>
      </div>
    </div>
  </footer>
);

export default App;

import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import NewJob from "./pages/NewJob";
import JobDetail from "./pages/JobDetail";
import Shortlist from "./pages/Shortlist";
import Proposal from "./pages/Proposal";
import Chat from "./pages/Chat";
import NotFound from "./pages/NotFound";
import ContractDetail from "./pages/ContractDetail";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/nova-vaga" element={<NewJob />} />
          <Route path="/vaga/:id" element={<JobDetail />} />
          <Route path="/vaga/:id/shortlist" element={<Shortlist />} />
          <Route path="/vaga/:id/proposta" element={<Proposal />} />
          <Route path="/chat/:jobId" element={<Chat />} />
          <Route path="/empresa/contratos/:id" element={<ContractDetail />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

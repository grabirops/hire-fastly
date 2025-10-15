-- Create enum types
CREATE TYPE contract_status AS ENUM ('ATIVO', 'CONCLUIDO', 'CANCELADO');
CREATE TYPE milestone_status AS ENUM ('PENDENTE', 'PAGO', 'ENTREGUE', 'APROVADO');
CREATE TYPE payment_status AS ENUM ('PENDENTE', 'PAGO', 'FALHOU');
CREATE TYPE payment_provider AS ENUM ('ASAAS', 'PAGARME', 'MERCADOPAGO');

-- Create contracts table
CREATE TABLE public.contracts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  proposal_id UUID NOT NULL REFERENCES public.proposals(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  freela_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  scope TEXT NOT NULL,
  model job_model NOT NULL,
  total_value DECIMAL(10,2) NOT NULL,
  start_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE,
  status contract_status DEFAULT 'ATIVO',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(job_id, proposal_id)
);

-- Create milestones table
CREATE TABLE public.milestones (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  contract_id UUID NOT NULL REFERENCES public.contracts(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  due_date TIMESTAMP WITH TIME ZONE,
  value DECIMAL(10,2) NOT NULL,
  order INTEGER NOT NULL,
  status milestone_status DEFAULT 'PENDENTE',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create payments table
CREATE TABLE public.payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  milestone_id UUID NOT NULL REFERENCES public.milestones(id) ON DELETE CASCADE,
  gross_value DECIMAL(10,2) NOT NULL,
  platform_fee DECIMAL(10,2) NOT NULL,
  net_value DECIMAL(10,2) NOT NULL,
  provider payment_provider NOT NULL,
  provider_payment_id TEXT,
  qr_code TEXT,
  status payment_status DEFAULT 'PENDENTE',
  webhook_payload JSONB,
  paid_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_contracts_company ON public.contracts(company_id);
CREATE INDEX idx_contracts_freela ON public.contracts(freela_id);
CREATE INDEX idx_milestones_contract ON public.milestones(contract_id);
CREATE INDEX idx_payments_milestone ON public.payments(milestone_id);

-- Enable RLS
ALTER TABLE public.contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for contracts
CREATE POLICY "Contracts viewable by company and freela" ON public.contracts FOR SELECT 
  USING (auth.uid() = company_id OR auth.uid() = freela_id);
CREATE POLICY "Companies can create contracts" ON public.contracts FOR INSERT 
  WITH CHECK (auth.uid() = company_id);

-- RLS Policies for milestones
CREATE POLICY "Milestones viewable by contract participants" ON public.milestones FOR SELECT 
  USING (auth.uid() IN (SELECT company_id FROM public.contracts WHERE id = contract_id) OR auth.uid() IN (SELECT freela_id FROM public.contracts WHERE id = contract_id));
CREATE POLICY "Companies can create milestones for own contracts" ON public.milestones FOR INSERT 
  WITH CHECK (auth.uid() IN (SELECT company_id FROM public.contracts WHERE id = contract_id));

-- RLS Policies for payments
CREATE POLICY "Payments viewable by milestone participants" ON public.payments FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.milestones m
      JOIN public.contracts c ON m.contract_id = c.id
      WHERE m.id = milestone_id AND (auth.uid() = c.company_id OR auth.uid() = c.freela_id)
    )
  );

-- Create triggers for updated_at
CREATE TRIGGER update_contracts_updated_at BEFORE UPDATE ON public.contracts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_milestones_updated_at BEFORE UPDATE ON public.milestones
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON public.payments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

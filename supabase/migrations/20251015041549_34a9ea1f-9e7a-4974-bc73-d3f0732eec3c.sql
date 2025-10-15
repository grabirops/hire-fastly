-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enum types
CREATE TYPE user_role AS ENUM ('FREELA', 'EMPRESA', 'ADMIN');
CREATE TYPE job_status AS ENUM ('ATIVO', 'FECHADO', 'PAUSADO');
CREATE TYPE job_model AS ENUM ('FIXO', 'HORA');
CREATE TYPE seniority_level AS ENUM ('JUNIOR', 'PLENO', 'SENIOR', 'ESPECIALISTA');
CREATE TYPE proposal_status AS ENUM ('ENVIADA', 'ACEITA', 'REJEITADA');

-- Create profiles table (extends auth.users)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  name TEXT NOT NULL,
  role user_role NOT NULL DEFAULT 'FREELA',
  verif_level INTEGER DEFAULT 0,
  trust_score DECIMAL(3,2) DEFAULT 0.0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create freelancer_profiles table
CREATE TABLE public.freelancer_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
  headline TEXT,
  bio TEXT,
  skills JSONB DEFAULT '[]'::jsonb,
  seniority seniority_level,
  rate_hour DECIMAL(10,2),
  availability TEXT,
  links JSONB DEFAULT '{}'::jsonb,
  languages JSONB DEFAULT '[]'::jsonb,
  location TEXT,
  verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create company_profiles table
CREATE TABLE public.company_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL,
  cnpj TEXT,
  website TEXT,
  industry TEXT,
  verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create jobs table
CREATE TABLE public.jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  skills JSONB DEFAULT '[]'::jsonb,
  seniority seniority_level,
  model job_model NOT NULL,
  budget DECIMAL(10,2),
  deadline TIMESTAMP WITH TIME ZONE,
  tags JSONB DEFAULT '[]'::jsonb,
  status job_status DEFAULT 'ATIVO',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create proposals table
CREATE TABLE public.proposals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  freela_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  price DECIMAL(10,2),
  duration TEXT,
  attachment_url TEXT,
  status proposal_status DEFAULT 'ENVIADA',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(job_id, freela_id)
);

-- Create shortlist table
CREATE TABLE public.shortlist (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  freela_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  rank INTEGER NOT NULL,
  score_json JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(job_id, freela_id)
);

-- Create messages table
CREATE TABLE public.messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  thread_id TEXT NOT NULL,
  sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  attachment_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_jobs_company ON public.jobs(company_id);
CREATE INDEX idx_jobs_status ON public.jobs(status);
CREATE INDEX idx_proposals_job ON public.proposals(job_id);
CREATE INDEX idx_proposals_freela ON public.proposals(freela_id);
CREATE INDEX idx_shortlist_job ON public.shortlist(job_id);
CREATE INDEX idx_messages_thread ON public.messages(thread_id);
CREATE INDEX idx_messages_created ON public.messages(created_at);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.freelancer_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.proposals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shortlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- RLS Policies for freelancer_profiles
CREATE POLICY "Freelancer profiles viewable by all" ON public.freelancer_profiles FOR SELECT USING (true);
CREATE POLICY "Freelancers can update own profile" ON public.freelancer_profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Freelancers can insert own profile" ON public.freelancer_profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for company_profiles
CREATE POLICY "Company profiles viewable by all" ON public.company_profiles FOR SELECT USING (true);
CREATE POLICY "Companies can update own profile" ON public.company_profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Companies can insert own profile" ON public.company_profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for jobs
CREATE POLICY "Jobs are viewable by everyone" ON public.jobs FOR SELECT USING (true);
CREATE POLICY "Companies can create jobs" ON public.jobs FOR INSERT WITH CHECK (auth.uid() = company_id);
CREATE POLICY "Companies can update own jobs" ON public.jobs FOR UPDATE USING (auth.uid() = company_id);
CREATE POLICY "Companies can delete own jobs" ON public.jobs FOR DELETE USING (auth.uid() = company_id);

-- RLS Policies for proposals
CREATE POLICY "Proposals viewable by job owner and proposer" ON public.proposals FOR SELECT 
  USING (auth.uid() = freela_id OR auth.uid() IN (SELECT company_id FROM public.jobs WHERE id = job_id));
CREATE POLICY "Freelancers can create proposals" ON public.proposals FOR INSERT 
  WITH CHECK (auth.uid() = freela_id);
CREATE POLICY "Freelancers can update own proposals" ON public.proposals FOR UPDATE 
  USING (auth.uid() = freela_id);

-- RLS Policies for shortlist
CREATE POLICY "Shortlist viewable by job owner" ON public.shortlist FOR SELECT 
  USING (auth.uid() IN (SELECT company_id FROM public.jobs WHERE id = job_id));
CREATE POLICY "System can insert shortlist" ON public.shortlist FOR INSERT 
  WITH CHECK (true);

-- RLS Policies for messages
CREATE POLICY "Messages viewable by participants" ON public.messages FOR SELECT 
  USING (auth.uid() = sender_id OR auth.uid() IN (
    SELECT company_id FROM public.jobs WHERE id::text = thread_id
    UNION
    SELECT freela_id FROM public.proposals WHERE job_id::text = thread_id
  ));
CREATE POLICY "Authenticated users can send messages" ON public.messages FOR INSERT 
  WITH CHECK (auth.uid() = sender_id);

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', 'Usuário'),
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'FREELA')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger for new users
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to update updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_freelancer_profiles_updated_at BEFORE UPDATE ON public.freelancer_profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_company_profiles_updated_at BEFORE UPDATE ON public.company_profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_jobs_updated_at BEFORE UPDATE ON public.jobs
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_proposals_updated_at BEFORE UPDATE ON public.proposals
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
# FastFreela - Marketplace de Freelancers

FastFreela é um marketplace moderno que conecta empresas e freelancers qualificados para projetos de tecnologia.

## 🚀 Funcionalidades Implementadas (Sprint 1)

### Autenticação
- ✅ Cadastro de usuários (Freelancer ou Empresa)
- ✅ Login com email/senha
- ✅ Gerenciamento de sessão
- ✅ Auto-confirmação de email habilitada (ambiente de desenvolvimento)

### Vagas
- ✅ Listagem pública de vagas ativas
- ✅ Busca por título, descrição ou skills
- ✅ Detalhes de cada vaga
- ✅ Status e modelo de contratação (Fixo ou Por Hora)

### Database Schema
- ✅ Profiles (usuários com roles: FREELA, EMPRESA, ADMIN)
- ✅ FreelancerProfiles (perfis de freelancers)
- ✅ CompanyProfiles (perfis de empresas)
- ✅ Jobs (vagas publicadas)
- ✅ Proposals (propostas de freelancers)
- ✅ Shortlist (candidatos shortlistados)
- ✅ Messages (chat básico)
- ✅ RLS policies configuradas
- ✅ Triggers para timestamps

## 🎨 Design System

- **Cores primárias**: Azul profissional (#2563EB) + Verde confiança (#16A34A)
- **Tipografia**: System fonts com hierarquia clara
- **Componentes**: Shadcn UI com customizações
- **Responsivo**: Mobile-first approach

## 🛠️ Stack Tecnológica

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS + Shadcn UI
- **Backend**: Lovable Cloud (Supabase)
- **Database**: PostgreSQL com RLS
- **Auth**: Supabase Auth
- **Forms**: React Hook Form + Zod (ready for next sprint)

## 📋 Próximos Passos

### Para completar a Sprint 1:
1. **Criar página de Nova Vaga** (empresas)
2. **Página de Detalhes da Vaga** com botão de enviar proposta
3. **Sistema de Shortlist** (geração fake com score)
4. **Formulário de Proposta** (1 por freelancer/vaga)
5. **Chat básico** com polling
6. **Seed de dados** para testes

### Como Contribuir
O projeto está preparado para receber as funcionalidades restantes. A arquitetura de banco, autenticação e design system já estão prontos.

## 🔐 Segurança

- Row Level Security (RLS) habilitado em todas as tabelas
- Policies configuradas por role
- Validação de entrada (próxima sprint com Zod)
- Auth seguro via Supabase

## 📦 Como Usar

1. Faça cadastro como Freelancer ou Empresa
2. Explore as vagas disponíveis
3. Use a busca para filtrar por skills
4. (Em breve) Empresas poderão postar vagas
5. (Em breve) Freelancers poderão enviar propostas

## 🌐 Deploy

Este projeto está configurado para deploy automático no Lovable.

---

**Status**: Sprint 1 - Core estrutura completa. Pronto para implementar funcionalidades de negócio.

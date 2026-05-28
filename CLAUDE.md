# CLAUDE.md — Diretrizes do Projeto ArchFlow

## Stack
- Frontend: Next.js 14+ (App Router), React 18, TypeScript
- Estilização: Tailwind CSS + shadcn/ui
- Banco: Prisma + SQLite (local)
- Gráficos: Recharts
- Desktop: Electron (pasta electron/ na raiz, embarca next start)
- Testes: Vitest (foco em lógica e API routes)

## Arquitetura
- Estrutura flat (sem monorepo)
- Server Components por padrão, Client Components só quando necessário
- API routes (app/api/) como camada entre Client Components e Prisma
- Timer state: localStorage + sync ao banco via API quando para
- Electron em produção roda next start embedded

## Convenções
- Componentes em PascalCase, arquivos em kebab-case
- Todas as queries via Prisma (tipagem automática)
- Commits em inglês, mensagens curtas e descritivas
- Sem dependências de cloud/SaaS (tudo local)

## Estrutura de pastas
- app/ → rotas e páginas (Next.js App Router)
- app/api/ → API routes (CRUD)
- components/ → componentes reutilizáveis
- components/ui/ → shadcn/ui primitives
- lib/ → utils, helpers, prisma client
- prisma/ → schema e seed
- electron/ → Electron main/preload
- __tests__/ → testes Vitest

## Regras de Negócio
- Um usuário pode ter múltiplos projetos
- Cada projeto tem subdivisões (parts)
- Time entries registram: data, hora início, hora fim, projeto, part, descrição
- Relatórios agrupam por: semana, projeto, part
- Invoices totalizam horas por período e exportam PDF
- Invoice status workflow: draft → sent → approved → paid

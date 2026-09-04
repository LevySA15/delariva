# DELARIVA - SAJ

Sistema de controle operacional da academia de Jiu-Jitsu DELARIVA: perfis
(Aluno, Professor, Dono, Aluno Menor, Responsável), módulos de Aulas,
Graduação, Financeiro, Chat e Configurações — cada um mostrando só o que o
papel da pessoa permite.

- **Web**: Next.js (App Router) + Tailwind
- **Backend**: Supabase (Postgres + Auth + Storage + Realtime), com RLS
  garantindo as permissões por papel no próprio banco
- **Android**: Capacitor, carregando o site publicado dentro de um WebView
  nativo (ver seção abaixo)

## Setup do Supabase

1. Crie um projeto em [supabase.com](https://supabase.com).
2. Rode as migrations em `supabase/migrations/` **na ordem numérica**, pelo
   SQL Editor do painel do Supabase ou pela CLI (`supabase db push`).
3. Copie `.env.local.example` para `.env.local` e preencha com a URL e a
   anon key do seu projeto (Project Settings → API).

```bash
cp .env.local.example .env.local
```

## Desenvolvimento web

```bash
npm install
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000). A primeira tela vai
pedir login — crie uma conta em `/cadastro` escolhendo o perfil (Dono,
Professor, Aluno, Aluno Menor ou Responsável). O primeiro usuário Dono deve
ser criado assim mesmo; depois disso, o próprio Dono pode alterar o papel de
qualquer usuário em **Configurações → Usuários**.

## Deploy (produção)

Faça o deploy do app Next.js normalmente (ex: [Vercel](https://vercel.com)),
configurando as mesmas variáveis de ambiente do `.env.local` no ambiente de
produção.

## App Android (Capacitor)

O app usa Server Components, Server Actions e middleware de autenticação do
Next.js — por isso **não é possível gerar um build estático** (`next
export`) para embutir no APK. Em vez disso, o Capacitor abre a versão já
publicada do site dentro de um WebView nativo do Android.

1. Depois de publicar o site em produção, edite `capacitor.config.ts` e
   troque `PRODUCTION_URL` pela URL real (ex: `https://delariva.vercel.app`).
2. Sincronize e abra o projeto Android:

   ```bash
   npm run cap:sync
   npm run cap:open
   ```

3. O Android Studio abre o projeto em `android/`. Gere o APK por lá
   (Build → Build Bundle(s) / APK(s) → Build APK(s)), ou publique na Play
   Store normalmente.

Ícone, splash screen e nome do app podem ser personalizados em
`android/app/src/main/res/` (ver
[docs do Capacitor](https://capacitorjs.com/docs/android/configuration)).

### iOS

Ainda não configurado. Quando chegar a hora, basta rodar
`npx cap add ios` (requer macOS + Xcode) — o mesmo `capacitor.config.ts` já
serve, sem mudanças no código do app.

## Estrutura

- `app/(auth)` — login e cadastro
- `app/(app)` — área logada, com o menu lateral filtrado por papel
  (`components/sidebar.tsx`) e um módulo por pasta: `aulas`, `graduacao`,
  `financeiro`, `chat`, `configuracoes`, `perfil`
- `lib/domain.ts` — regras de negócio (papéis, módulos por papel, faixas
  IBJJF, critérios de avaliação)
- `lib/supabase/` — clients Supabase (browser/server/middleware) e os tipos
  do banco
- `lib/queries/` — leituras do banco reaproveitadas entre páginas
- `supabase/migrations/` — schema completo (tabelas, enums, RLS)

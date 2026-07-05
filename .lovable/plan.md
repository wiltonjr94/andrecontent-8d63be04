## Portfólio do André — site público + painel admin

Stack real da plataforma: **TanStack Start (React) + Tailwind CSS v4 + Lovable Cloud** (Postgres, autenticação e storage de imagens). Funciona exatamente como o que você pediu com Next.js + banco — o conteúdo editado no admin reflete no site sem tocar em código.

### Paleta (design system)
Tokens semânticos definidos em `src/styles.css`, editáveis depois pelo admin:
- Deep Denim `#1E2540` → fundo/base escura
- Butter Yellow `#FFF0A6` → destaque de texto sobre escuro
- Tomato Red `#FF4D2D` + Runway Blue `#2D6CDF` → ações/acentos (botões, links, hover)

Visual: tipografia grande e ousada, muito espaço, navegação fixa nos cantos, microanimações suaves (inspiração mrvincentong + azumbrunnen), porém vibrante com sua paleta.

---

### Fase 1 — Fundação + Site público (esta entrega)
**Backend (Lovable Cloud)**
- Tabelas: `theme_settings` (cores, fontes), `site_settings` (hero: texto, WhatsApp, Instagram, LinkedIn, avatar), `pages` (páginas dinâmicas, slug, ordem), `content_items` (itens por categoria: título, descrição, mídia, data, link, ordem), `highlights` (slider da home).
- Storage bucket para imagens/vídeos, com RLS.
- Seed com a paleta e conteúdo de exemplo.

**Site público**
- Cabeçalho: avatar + nome (esq.), Instagram + LinkedIn (dir.), fixo.
- Hero: "Oi, eu sou o André" + parágrafo + botão "Diga oi" → WhatsApp.
- Três cards: Live Content, Cases, Frames → páginas internas.
- Slider de destaques (imagem + título + link).
- Rodapé: sociais, e-mail, copyright.
- Páginas internas dinâmicas (`/p/$slug`) em grid, geradas a partir do banco.
- Responsivo mobile-first, lazy loading, animações de hover/seção.

### Fase 2 — Admin (área privada)
- Login protegido (auth do Lovable Cloud, só você).
- CRUD de itens em cada categoria (upload imagem/vídeo, texto, link).
- Criar/editar/excluir páginas ilimitadas (não só as 3 fixas).
- Editar dados do hero + sociais + avatar.
- Gerenciar slider de destaques.
- Personalização visual: trocar cores (cada uma) e fontes (conjunto pré-definido).

### Fase 3 — Refino avançado
- Reordenação drag-and-drop de itens e páginas.
- Blocos de conteúdo livres (texto, imagem, botão, slider) para montar páginas — o "page builder".
- Otimização de imagens e polimento de animações.

---

### Detalhes técnicos
- Auth: um único usuário admin; rotas admin sob `/_authenticated` com gate de sessão.
- Server functions (`createServerFn`) para leituras/escritas; leitura pública via políticas RLS `anon SELECT`.
- Fontes carregadas via `<link>` no `__root.tsx`; cores como tokens `oklch` em `styles.css`, sobrescritas em runtime pelas configurações do banco.
- Código organizado: `src/components`, `src/routes`, `src/lib/*.functions.ts`.

Vou começar pela **Fase 1** assim que aprovar. As fases 2 e 3 seguem em turnos seguintes para manter qualidade.
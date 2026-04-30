# Alex Monorepo (estrutura inicial)

Estrutura atual separada para trabalho em equipe:

- `front-end/` → landing page (React + Vite)
- `back-end/` → API (a implementar)
- `services/` → workers e integrações assíncronas (a implementar)

## Rodando o front-end localmente

1. Entre na pasta:
   `cd front-end`
2. Instale dependências:
   `npm install`
3. Rode o projeto:
   `npm run dev`

## Deploy SPA (BrowserRouter)

O front-end agora usa `BrowserRouter` (URLs sem `#`).  
Para funcionar com refresh em rotas internas (`/dashboard`, `/processos`, etc), o projeto já inclui:

- `front-end/vercel.json` (rewrite para `/index.html`)
- `front-end/public/_redirects` (Netlify SPA fallback)

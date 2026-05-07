# 📦 Lex — Guia de Dependências e Setup

> Use este arquivo sempre que for rodar o projeto em uma máquina nova ou após formatar o computador.

---

## ⚙️ Pré-requisitos Globais

Instale **antes de tudo** na máquina:

| Ferramenta | Versão recomendada | Download |
|---|---|---|
| **Python** | 3.11.x (não use 3.12+) | https://www.python.org/downloads/release/python-3119/ |
| **Node.js** | 18.x ou 20.x LTS | https://nodejs.org/en/download |
| **Git** | Qualquer versão atual | https://git-scm.com/downloads |
| **PostgreSQL** | 15.x (produção) | https://www.postgresql.org/download/ |

> ⚠️ **IMPORTANTE — Python 3.11:** Ao instalar, marque a opção **"Add Python 3.11 to PATH"**.
> O Python 3.13+ tem incompatibilidade com `pydantic-core` e `psycopg2-binary` no Windows.

---

## 🔵 Back-end (FastAPI + Python)

### Tecnologias

| Pacote | Versão | Para que serve |
|---|---|---|
| `fastapi` | 0.111.0 | Framework web principal |
| `uvicorn` | 0.29.0 | Servidor ASGI (roda o FastAPI) |
| `pydantic` | 2.6.4 | Validação de dados e schemas |
| `pydantic-settings` | 2.2.1 | Leitura de variáveis de ambiente (.env) |
| `python-jose` | 3.3.0 | Geração e validação de JWT |
| `passlib[bcrypt]` | 1.7.4 | Hash de senhas |
| `python-multipart` | 0.0.9 | Upload de arquivos (formulários) |
| `sqlalchemy` | 2.0.30 | ORM — comunicação com o banco |
| `alembic` | 1.13.1 | Migrações do banco de dados |
| `psycopg2-binary` | 2.9.9 | Driver do PostgreSQL |
| `httpx` | 0.27.0 | Cliente HTTP (integração Escavador) |
| `python-dotenv` | 1.0.1 | Carrega o arquivo .env |

### Como rodar (primeira vez)

```bash
# 1. Entre na pasta
cd back-end

# 2. Crie o ambiente virtual com Python 3.11 especificamente
py -3.11 -m venv .venv

# 3. Ative o ambiente virtual
.venv\Scripts\activate        # Windows
# source .venv/bin/activate   # Mac/Linux

# 4. Instale as dependências
pip install -r requirements.txt

# 5. Configure as variáveis de ambiente
copy .env.example .env
# Edite o .env com seus valores reais

# 6. Suba o servidor
uvicorn app.main:app --reload
```

### Como rodar (após primeira vez)

```bash
cd back-end
.venv\Scripts\activate
uvicorn app.main:app --reload
```

### Verificar se está rodando

- API: http://127.0.0.1:8000/health
- Documentação interativa: http://127.0.0.1:8000/docs
- Documentação alternativa: http://127.0.0.1:8000/redoc

---

## 🟢 Front-end (React + TypeScript + Vite)

### Tecnologias

| Pacote | Para que serve |
|---|---|
| `react` + `react-dom` | Biblioteca de UI |
| `typescript` | Tipagem estática |
| `vite` | Bundler/servidor de desenvolvimento |
| `react-router-dom` | Roteamento de páginas |
| `tailwindcss` | Estilização CSS utilitária |
| `eslint` + `prettier` | Qualidade e formatação de código |

> As versões exatas estão no `front-end/package.json`.

### Como rodar (primeira vez)

```bash
# 1. Entre na pasta
cd front-end

# 2. Instale as dependências
npm install

# 3. Configure as variáveis de ambiente
copy .env.example .env
# Edite o .env:
# VITE_API_URL=http://localhost:8000

# 4. Suba o servidor de desenvolvimento
npm run dev
```

### Como rodar (após primeira vez)

```bash
cd front-end
npm run dev
```

### Verificar se está rodando

- Front-end: http://localhost:5173

---

## 🚀 Rodando o projeto completo

Abra **dois terminais** ao mesmo tempo:

**Terminal 1 — Back-end:**
```bash
cd back-end
.venv\Scripts\activate
uvicorn app.main:app --reload
```

**Terminal 2 — Front-end:**
```bash
cd front-end
npm run dev
```

Acesse http://localhost:5173 no navegador. ✅

---

## 🗂️ Variáveis de Ambiente

### Back-end (`back-end/.env`)

```env
APP_ENV=development
SECRET_KEY=troque-por-uma-chave-segura-de-64-chars
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60
DATABASE_URL=postgresql://lex_user:senha@localhost:5432/lex_db
ESCAVADOR_API_KEY=sua-chave-aqui
ESCAVADOR_BASE_URL=https://api.escavador.com/api/v2
FRONT_URL=http://localhost:5173
```

### Front-end (`front-end/.env`)

```env
VITE_API_URL=http://localhost:8000
```

---

## ❓ Problemas comuns

### `psycopg2-binary` ou `pydantic-core` falham ao instalar
**Causa:** Python 3.12 ou 3.13 — não têm wheel pré-compilado para Windows.
**Solução:** Use `py -3.11 -m venv .venv` para criar o ambiente com Python 3.11.

### `python -m venv` trava com `KeyboardInterrupt`
**Causa:** Problema de rede ao baixar o pip na criação do venv.
**Solução:** `py -3.11 -m venv .venv --upgrade-deps` ou instale direto sem venv.

### Porta 8000 já em uso
**Solução:** `uvicorn app.main:app --reload --port 8001`

### Porta 5173 já em uso
**Solução:** `npm run dev -- --port 5174`

### `.venv\Scripts\activate` não funciona no PowerShell
**Solução:** Execute antes: `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned`

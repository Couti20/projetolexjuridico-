# Lex — Back-end (FastAPI)

API REST do Lex, construída com **FastAPI + Python 3.12**.

## Pré-requisitos

- Python 3.12+
- MySQL 8+ (XAMPP compatível)

## Configuração local

```bash
# 1. Entre na pasta
cd back-end

# 2. Crie o ambiente virtual
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate

# 3. Instale as dependências
pip install -r requirements.txt

# 4. Configure as variáveis de ambiente
cp .env.example .env
# Edite o .env com seus valores reais

# 5. Rode as migrações
alembic upgrade head

# 6. Suba o servidor
uvicorn app.main:app --reload
```

Acesse: http://localhost:8000/docs

## Estrutura

```
back-end/
├── app/
│   ├── main.py          # Entrada da aplicação
│   ├── config.py        # Variáveis de ambiente
│   ├── database.py      # Conexão com o banco
│   ├── models/          # Modelos SQLAlchemy
│   ├── schemas/         # Schemas Pydantic
│   ├── routers/         # Endpoints (auth, processes, etc.)
│   ├── services/        # Regras de negócio
│   └── dependencies.py  # Injeção de dependências (JWT)
├── alembic/             # Migrações do banco
├── .env.example
├── requirements.txt
└── README.md
```

## Endpoints principais

| Método | Rota | Descrição |
|--------|------|-----------|
| POST | /auth/login | Login com e-mail e senha |
| POST | /auth/logout | Logout |
| GET | /processes | Lista processos do usuário |
| GET | /processes/movements | Movimentações por processo |
| GET | /processes/checklist | Checklist por processo |
| GET | /dashboard | Resumo do painel |
| GET | /tasks/daily | Tarefas do dia |

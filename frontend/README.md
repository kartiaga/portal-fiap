# Portal FIAP — Frontend

Frontend do **Portal FIAP** (Tech Challenge), construído com [Next.js](https://nextjs.org/) 16 e [React](https://react.dev/) 19.

## Pré-requisitos

- Node.js 20+
- npm

## Desenvolvimento local

Na raiz do monorepo:

```bash
npm install
npm run dev:frontend
```

Ou dentro desta pasta:

```bash
npm install
npm run dev
```

A aplicação ficará disponível em **http://localhost:3000**.

A API roda em **http://localhost:3001** — configure `NEXT_PUBLIC_API_URL` conforme necessário ao integrar chamadas HTTP.

## Build e produção local

```bash
npm run build
npm run start
```

O comando `start` sobe o servidor na porta `3000`.

## Docker

O frontend é orquestrado pelo `docker-compose.yaml` na raiz do repositório. Dentro do container e no host ele fica exposto em **http://localhost:3000**.

```bash
# Na raiz do monorepo
docker compose up -d --build
```

Variáveis relevantes no Compose:

| Variável | Valor | Uso |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | `http://localhost:3001` | URL da API para o browser |
| `API_URL` | `http://api:3000` | URL da API para SSR dentro da rede Docker |

## Estrutura

```
frontend/
├── src/app/          # App Router (páginas e layout)
├── public/           # Arquivos estáticos
├── Dockerfile        # Imagem de produção (standalone)
└── next.config.ts    # Configuração do Next.js
```

## Saiba mais

- [Documentação do Next.js](https://nextjs.org/docs)
- [README principal do projeto](../README.md)

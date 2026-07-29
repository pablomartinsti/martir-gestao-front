# Martir Gestao Frontend

Frontend separado e organizado em camadas para consumir a API de NFS-e.

## Rodar localmente

Instale as dependencias uma vez:

```bash
npm install
```

Depois rode:

```bash
npm run dev
```

Por padrao, o painel usa `http://localhost:3333` em desenvolvimento e
`https://nota-fiscal.martircontabil.com.br` fora do localhost.

Para habilitar o botao de login com Google, crie um `.env.local`:

```bash
VITE_GOOGLE_CLIENT_ID="client-id-do-google"
```

## Estrutura

```text
src/
  app/        estado, render principal e controle de eventos
  domain/     tipos do dominio da API
  features/   telas e acoes por modulo
  shared/     HTTP, storage, formatadores e utilitarios
  styles/     CSS separado por responsabilidade
```

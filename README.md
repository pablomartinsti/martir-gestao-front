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

Por padrao, o painel abre em `http://localhost:3000` e tenta consumir a API em
`http://localhost:3333`. A URL da API pode ser alterada dentro do painel, no
campo de conexão da tela de login.

## Estrutura

```text
src/
  app/        estado, render principal e controle de eventos
  domain/     tipos do dominio da API
  features/   telas e ações por modulo
  shared/     HTTP, storage, formatadores e utilitarios
  styles/     CSS separado por responsabilidade
```

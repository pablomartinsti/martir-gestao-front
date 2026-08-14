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

Para sobrescrever a API, crie um `.env.local`:

```bash
VITE_API_URL="http://localhost:3333"
```

## Estrutura

```text
src/
  components/ componentes reutilizaveis
  config/     configuracoes de ambiente
  hooks/      estado e acoes reutilizaveis das telas
  navigation/ itens de navegacao
  pages/      telas do painel
  routes/     composicao de rotas e telas
  services/   clientes HTTP e integracoes externas
  styles/     estilos globais
  types/      tipos do dominio da API
  utils/      formatadores, seletores e helpers de formulario
```

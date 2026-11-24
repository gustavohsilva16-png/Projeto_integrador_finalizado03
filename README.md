# BioCosmetics - Frontend e Backend

Este projeto integra uma interface web de cosméticos naturais com uma API em Node.js e um banco de dados MariaDB. O frontend apresenta produtos e controla navegação, carrinho e formulários. O backend recebe as requisições, valida os dados, aplica as regras de sessão e consulta o banco.

## Arquitetura

```text
Navegador
  -> HTML: estrutura das paginas
  -> CSS: layout e aparencia
  -> JavaScript: eventos, validacoes e chamadas fetch
  -> API Express em /api
  -> Models: consultas parametrizadas no MariaDB
  -> Banco de dados
```

O frontend não acessa o banco diretamente. Ele envia dados por HTTP usando `fetch` e recebe respostas JSON. O backend separa rotas, middlewares, controllers e models.

## Estrutura

```text
Conex-o-Back-front/trabalho-integrador/trabalho-integrador/
  Front/
    public/              Paginas HTML
    src/scripts/         Comportamento e chamadas HTTP
    src/styles/          Layout e animacoes
  Backend/
    src/routes/          Endpoints
    src/middlewares/     Validacao e autenticacao
    src/controllers/     Regras e respostas HTTP
    src/models/          Consultas e transacoes
    src/config/          Conexao com o banco
```

## Fluxo de cadastro

1. O usuário preenche o cadastro no frontend.
2. `cadastro.js` valida as senhas e monta o JSON.
3. `auth.js` envia `POST /api/cadastro`.
4. `clienteMiddleware` valida os dados.
5. `authController.cadastrar` cria o hash da senha.
6. `authModel.criarConta` usa uma transação para criar cliente e login.
7. O frontend redireciona para o login após o sucesso.

## Fluxo de login

1. `login.js` captura e-mail e senha.
2. `auth.js` envia `POST /api/login`.
3. O backend busca o usuário e verifica se a conta está ativa.
4. A senha é comparada com o hash armazenado.
5. Em caso de sucesso, o backend cria o cookie de sessão.
6. O frontend salva nome e `id_cliente` no `localStorage` apenas para mostrar a interface.

A autenticação das operações protegidas é feita pelo cookie no backend, não pelo `localStorage`.

## Fluxo do carrinho

O carrinho usa um array JavaScript no navegador e guarda nome, preço, ícone, opção e quantidade de cada item. Ao adicionar um produto já existente, a quantidade é somada. A interface recalcula o subtotal e o número total de itens.

Os endpoints protegidos impedem que um usuário consulte ou altere itens de outro cliente.

## Principais endpoints

| Método | Endpoint | Finalidade |
|---|---|---|
| `GET` | `/api/health` | Confirma que o servidor está ativo |
| `GET` | `/api/health/database` | Testa a conexão com o banco |
| `POST` | `/api/cadastro` | Cria cliente e login |
| `POST` | `/api/login` | Autentica e cria o cookie |
| `POST` | `/api/logout` | Remove o cookie |
| `GET` | `/api/produtos` | Lista o catálogo |
| `GET` | `/api/carrinho/:id_cliente` | Consulta o carrinho |
| `POST` | `/api/carrinho` | Adiciona item |
| `DELETE` | `/api/carrinho/:id_carrinho` | Remove item |
| `POST` | `/api/finalizar-compra` | Finaliza compra e gera nota fiscal |

## Configuração

Entre na pasta do backend:

```bash
cd Conex-o-Back-front/trabalho-integrador/trabalho-integrador/Backend
npm install
```

Crie `Backend/.env`:

```env
PORT=3000
DB_HOST=localhost
DB_PORT=3306
DB_USER=seu_usuario
DB_PASSWORD=sua_senha
DB_NAME=nome_do_banco
```

Inicie o servidor:

```bash
npm start
```

Acesse `http://localhost:3000/`. O backend entrega também as páginas do frontend. No Live Server, que usa a porta `5501`, o frontend identifica essa porta e envia chamadas para `http://localhost:3000/api`.

## Testes

Na pasta `Backend`, execute:

```bash
npm test
```
"# Projeto_integrador_finalizado03" 

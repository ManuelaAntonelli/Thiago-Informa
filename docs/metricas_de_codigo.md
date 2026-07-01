# Métricas de Código — Thiago Informa

> **Data de geração:** 30/06/2026
> **Versão do projeto:** 1.0.0
> **Stack:** Node.js · Express · MongoDB (Mongoose) · Vanilla JS (SPA)

---

## 1. Visão Geral do Projeto

| Indicador | Valor |
|---|---|
| Total de arquivos JavaScript | 24 |
| Total de arquivos HTML | 1 |
| Total de arquivos CSS | 1 |
| Total de linhas de código JS | **3.162 linhas** |
| Total de linhas do `index.html` | 838 linhas |
| Dependências de produção | 7 pacotes |

---

## 2. Métricas por Arquivo (JavaScript)

### 2.1 Frontend — Interface e Controladoras

| Arquivo | Linhas Totais | Linhas Efetivas | Comentários | Complexidade Ciclomática (estimada) |
|---|---|---|---|---|
| Interface.js | 1.131 | 954 | 145 | ~91 |
| ControladoraInformativo.js | 518 | 444 | 35 | ~46 |
| ControladoraAutenticacao.js | 358 | 304 | 45 | ~26 |
| ControladoraProjetos.js | 244 | 215 | 18 | ~24 |

### 2.2 Backend — Controllers, Middleware e Configuração

| Arquivo | Linhas Totais | Linhas Efetivas | Comentários | Complexidade Ciclomática (estimada) |
|---|---|---|---|---|
| authController.js | 231 | 200 | 32 | ~16 |
| informativeController.js | 109 | 95 | 15 | ~10 |
| projectController.js | 90 | 78 | — | ~8 |
| eventController.js | 61 | 53 | — | ~5 |
| authMiddleware.js | 41 | 35 | — | ~6 |
| server.js | 65 | 55 | — | ~3 |
| db.js | 27 | 23 | — | ~2 |

### 2.3 Backend — Modelos (Schemas Mongoose)

| Arquivo | Linhas Totais | Campos do Schema |
|---|---|---|
| User.js | 35 | 6 (`nome`, `usuario`, `senha`, `perfil`, `turmas`, `avatar`) |
| Informative.js | 28 | 5 (`titulo`, `descricao`, `data`, `imagem`, `fixado`) |
| Project.js | 28 | 5 (`nome_projeto`, `descricao`, `turma`, `imagem`, `data_criacao`) |
| Event.js | 20 | 3 (`titulo`, `descricao`, `data`) |

### 2.4 Frontend — Modelos e Fábrica

| Arquivo | Linhas Totais | Métodos |
|---|---|---|
| Informativo.js | 21 | `validar_dados()` |
| Projeto.js | 24 | `validar_dados()` |
| Usuario.js | 13 | — |
| Fabrica.js | 40 | `criarProjeto()`, `criarInformativo()`, `criarUsuario()` |

---

## 3. Distribuição por Camada

```
Frontend (JS)   ████████████████████████████████████ 71,8% — 2.272 linhas
Backend (JS)    ████████████████████  19,0% —   603 linhas
Config/Infra    ████                   3,0% —    92 linhas (db.js + server.js)
Modelos Back    ████                   3,5% —   110 linhas
```

| Camada | Arquivos | Linhas de Código |
|---|---|---|
| Frontend — Interface + Controllers | 4 | 2.251 |
| Frontend — Models + Factory | 4 | 98 |
| Backend — Controllers | 4 | 491 |
| Backend — Routes | 4 | 66 |
| Backend — Models | 4 | 110 |
| Backend — Middleware | 1 | 41 |
| Infraestrutura | 2 | 92 |
| **TOTAL** | **23** | **3.149** |

---

## 4. Complexidade Ciclomática

> **O que é:** Mede o número de caminhos linearmente independentes no código. Uma CC alta indica maior dificuldade de teste e manutenção.
>
> **Escala de referência:**
> - CC 1–10: **Simples** — fácil de manter e testar
> - CC 11–20: **Moderada** — ainda aceitável
> - CC 21–50: **Alta** — necessita atenção
> - CC > 50: **Muito alta** — refatoração recomendada

| Arquivo | CC Estimada | Avaliação |
|---|---|---|
| Interface.js | ~91 | ⚠️ Muito alta — arquivo Façade concentra toda a lógica de orquestração |
| ControladoraInformativo.js | ~46 | ⚠️ Alta — gerencia CRUD completo + carrossel de UI |
| ControladoraAutenticacao.js | ~26 | ⚠️ Alta — inclui fluxos de autenticação e painel admin |
| ControladoraProjetos.js | ~24 | ⚠️ Alta — gerencia CRUD de projetos com upload de imagens |
| authController.js | ~16 | ✅ Moderada — múltiplos endpoints e validações de acesso |
| authMiddleware.js | ~6 | ✅ Simples |
| informativeController.js | ~10 | ✅ Simples |
| projectController.js | ~8 | ✅ Simples |
| eventController.js | ~5 | ✅ Simples |
| server.js | ~3 | ✅ Simples |
| db.js | ~2 | ✅ Simples |

> **Nota:** A CC elevada do `Interface.js` é **esperada e aceitável** pelo design arquitetural, pois essa classe implementa o padrão **Façade** — ela é, por definição, o ponto central de orquestração de todo o frontend.

---

## 5. Inventário de Endpoints da API REST

| Método | Rota | Autenticação | Perfil | Função Handler |
|---|---|---|---|---|
| `POST` | `/api/auth/login` | Público | — | `login` |
| `GET` | `/api/auth/me` | JWT Cookie | Qualquer | `getMe` |
| `POST` | `/api/auth/logout` | JWT Cookie | Qualquer | `logout` |
| `POST` | `/api/auth/register` | JWT Cookie | Admin | `register` |
| `GET` | `/api/auth/responsibles` | JWT Cookie | Admin | `getResponsibles` |
| `PUT` | `/api/auth/profile` | JWT Cookie | Qualquer | `updateProfile` |
| `PUT` | `/api/auth/users/:id/password` | JWT Cookie | Admin | `adminChangePassword` |
| `DELETE` | `/api/auth/users/:id` | JWT Cookie | Admin/Próprio | `deleteUser` |
| `GET` | `/api/projects` | JWT Cookie | Qualquer | `getProjects` |
| `POST` | `/api/projects` | JWT Cookie | Admin | `createProject` |
| `PUT` | `/api/projects/:id` | JWT Cookie | Admin | `updateProject` |
| `DELETE` | `/api/projects/:id` | JWT Cookie | Admin | `deleteProject` |
| `GET` | `/api/informatives` | JWT Cookie | Qualquer | `getInformatives` |
| `POST` | `/api/informatives` | JWT Cookie | Admin | `createInformative` |
| `PUT` | `/api/informatives/:id` | JWT Cookie | Admin | `updateInformative` |
| `PUT` | `/api/informatives/:id/pin` | JWT Cookie | Admin | `togglePinInformative` |
| `DELETE` | `/api/informatives/:id` | JWT Cookie | Admin | `deleteInformative` |
| `GET` | `/api/events` | JWT Cookie | Qualquer | `getEvents` |
| `POST` | `/api/events` | JWT Cookie | Admin | `createEvent` |
| `DELETE` | `/api/events/:id` | JWT Cookie | Admin | `deleteEvent` |

**Total: 20 endpoints** distribuídos em 4 grupos de recursos.

---

## 6. Inventário de Classes e Métodos

### 6.1 Backend

| Classe / Função | Arquivo | Tipo |
|---|---|---|
| `DatabaseConnection` | backend/config/db.js | Singleton |
| `protect` | backend/middleware/authMiddleware.js | Middleware — valida JWT |
| `adminOnly` | backend/middleware/authMiddleware.js | Middleware — verifica perfil Admin |
| `generateToken` | backend/controllers/authController.js | Helper — gera JWT |
| `setTokenCookie` | backend/controllers/authController.js | Helper — define cookie HttpOnly |
| `login`, `getMe`, `logout`, `register`, `getResponsibles`, `deleteUser`, `adminChangePassword`, `updateProfile` | backend/controllers/authController.js | 8 handlers de autenticação |
| `getProjects`, `createProject`, `updateProject`, `deleteProject` | backend/controllers/projectController.js | 4 handlers CRUD |
| `getInformatives`, `createInformative`, `updateInformative`, `togglePinInformative`, `deleteInformative` | backend/controllers/informativeController.js | 5 handlers CRUD |
| `getEvents`, `createEvent`, `deleteEvent` | backend/controllers/eventController.js | 3 handlers CRUD |

### 6.2 Frontend

| Classe | Arquivo | Padrão | Qtd. Métodos |
|---|---|---|---|
| `Interface` | public/scripts/Interface.js | **Façade** | Principal ponto de entrada do frontend |
| `ControladoraAutenticacao` | public/scripts/controllers/ControladoraAutenticacao.js | **Singleton** | 12 métodos |
| `ControladoraInformativo` | public/scripts/controllers/ControladoraInformativo.js | — | 12 métodos |
| `ControladoraProjetos` | public/scripts/controllers/ControladoraProjetos.js | — | 6 métodos |
| `Fabrica` | public/scripts/factories/Fabrica.js | **Factory** | 3 métodos estáticos |
| `Informativo` | public/scripts/models/Informativo.js | Model | 1 método |
| `Projeto` | public/scripts/models/Projeto.js | Model | 1 método |
| `Usuario` | public/scripts/models/Usuario.js | Model | — |

#### Métodos de ControladoraAutenticacao
`verificarSessao`, `getAuthHeaders`, `verificaLogin`, `verificarAdm`, `criarResponsavel`, `abrirModalEditarUsuario`, `salvarEdicaoUsuario`, `excluirConta`, `logout`, `obterResponsaveis`, `registrarResponsavel`, `alterarSenhaResponsavel`, `excluirResponsavel`

#### Métodos de ControladoraInformativo
`carregarInformativos`, `carregarFixados`, `criarInformativo`, `abrirModalEditarInfo`, `editarInformativo`, `excluirInfo`, `alternarFixado`, `gerarPreviewImagem`, `removerPreviewImagem`, `iniciarCarrossel`, `scrollCarrossel`, `abrirModalVisualizarInfo`

#### Métodos de ControladoraProjetos
`criarProjeto`, `abrirModalEditar`, `editarProjeto`, `filtrarProjetos`, `exibirProjetos`, `excluirProjeto`

---

## 7. Dependências de Produção

| Pacote | Versão | Função |
|---|---|---|
| `express` | ^4.19.2 | Framework HTTP do servidor |
| `mongoose` | ^8.3.1 | ODM para MongoDB |
| `bcryptjs` | ^2.4.3 | Hash de senhas com salt |
| `jsonwebtoken` | ^9.0.2 | Geração e validação de tokens JWT |
| `cookie-parser` | ^1.4.7 | Leitura de cookies HttpOnly |
| `cors` | ^2.8.5 | Configuração de política CORS |
| `dotenv` | ^16.4.5 | Carregamento de variáveis de ambiente |

> **Nenhuma dependência de desenvolvimento foi registrada** no `package.json` (ex.: sem testes automatizados ou linter configurado).

---

## 8. Observações e Recomendações

### Pontos Positivos

- **Separação de responsabilidades clara:** Arquitetura MVC bem definida com separação entre camadas de model, controller e view tanto no backend quanto no frontend.
- **Padrões de projeto aplicados corretamente:** Singleton (`DatabaseConnection`, `ControladoraAutenticacao`), Façade (`Interface`), e Factory (`Fabrica`) estão bem implementados e documentados.
- **Segurança da autenticação:** Uso de cookies HttpOnly com `SameSite=Strict` e `bcryptjs` para hashing de senhas — boas práticas implementadas.
- **Código bem comentado nas camadas críticas:** Todas as funções dos controllers de backend e das controladoras do frontend possuem comentários JSDoc.
- **Backend enxuto e previsível:** Os controllers do backend têm baixa complexidade ciclomática (CC menor ou igual a 16), facilitando manutenção e futura cobertura por testes.

### Pontos de Atenção

- **`Interface.js` com alta complexidade (CC ~91):** Esperado pelo padrão Façade, mas o arquivo com 1.131 linhas pode dificultar a leitura. Considerar subdividir em múltiplos arquivos de façade por domínio (ex.: `InterfaceAdmin.js`, `InterfaceFeed.js`).
- **Ausência de testes automatizados:** Não há testes unitários ou de integração. Recomenda-se adicionar ao menos testes nos controllers do backend com Jest ou Mocha.
- **Imagens armazenadas como Base64 no banco:** Os campos `imagem` dos modelos aceitam strings Base64, o que pode inflar o tamanho do banco de dados. Considerar armazenamento externo (ex.: Cloudinary, AWS S3) para produção.
- **`console.log` de debug em produção:** A `ControladoraAutenticacao.js` possui múltiplos `console.log` nas funções admin que deveriam ser removidos antes do deploy em produção.
- **Sem paginação nos endpoints `GET`:** Os endpoints que listam informativos, projetos e eventos retornam todos os registros sem paginação, o que pode causar problemas de performance com grande volume de dados.

---

*Documento gerado com base na análise estática do código-fonte do projeto Thiago Informa em 30/06/2026.*

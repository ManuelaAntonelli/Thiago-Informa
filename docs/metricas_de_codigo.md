# Métricas de Código — Thiago Informa

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




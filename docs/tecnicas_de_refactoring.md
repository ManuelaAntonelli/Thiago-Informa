# Técnicas de Refactoring Aplicadas — Thiago Informa

> **Data de geração:** 30/06/2026
> **Versão do projeto:** 1.0.0
> **Referência base:** Martin Fowler — *Refactoring: Improving the Design of Existing Code* (2ª ed.)

---

## Introdução

Refactoring é o processo de reestruturar código existente sem alterar seu comportamento externo, com o objetivo de melhorar legibilidade, manutenibilidade e extensibilidade. Este documento cataloga as técnicas de refactoring identificadas no projeto **Thiago Informa**, com as respectivas localizações no código-fonte.

---

## 1. Extract Method (Extrair Método)

**Definição:** Transforma um trecho de código em um método separado com nome descritivo, eliminando duplicação e melhorando a leitura do código principal.

### 1.1 — `generateToken` extraído do handler `login`

Em vez de embutir a lógica de geração do JWT diretamente dentro da função `login`, ela foi extraída para uma função reutilizável:

**Antes (problemático — lógica inline):**
```javascript
const login = async (req, res) => {
    // ...validações...
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '30d' });
    // ...
};
```

**Depois (refatorado):**
```javascript
// Método extraído — reutilizável por qualquer handler que precise de token
const generateToken = (id) => {
    return jwt.sign({ id }, JWT_SECRET, { expiresIn: '30d' });
};

const login = async (req, res) => {
    // ...validações...
    const token = generateToken(user._id);  // chamada limpa
    // ...
};
```

**Onde encontrar:** `backend/controllers/authController.js` — linhas 10–12 (generateToken) e linha 39 (uso no login). O mesmo token é reutilizado na função `updateProfile` na linha 203, demonstrando o benefício da extração.

---

### 1.2 — `setTokenCookie` extraído do handler `login`

A lógica de configuração segura do cookie (com flags `httpOnly`, `secure`, `sameSite`) foi extraída para evitar duplicação entre `login` e `updateProfile`:

**Antes (problemático — código duplicado em dois handlers):**
```javascript
// Duplicado em login e updateProfile:
res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 30 * 24 * 60 * 60 * 1000
});
```

**Depois (refatorado):**
```javascript
// Um único método extraído, chamado em dois lugares
const setTokenCookie = (res, token) => {
    const isProduction = process.env.NODE_ENV === 'production';
    res.cookie('token', token, {
        httpOnly: true,
        secure: isProduction,
        sameSite: 'strict',
        maxAge: 30 * 24 * 60 * 60 * 1000
    });
};
```

**Onde encontrar:** `backend/controllers/authController.js` — linhas 19–27 (definição), linha 40 (uso em `login`), linha 204 (uso em `updateProfile`).

---

### 1.3 — `enviarParaAPI` e `enviarPUT` extraídos como closures

Nas controladoras do frontend, a lógica de envio HTTP foi extraída em funções internas (`enviarParaAPI`, `enviarPUT`) para separar o processamento de imagem (assíncrono via FileReader) do envio dos dados:

**Onde encontrar:**
- `public/scripts/controllers/ControladoraInformativo.js` — linhas 197–225 (`criarInformativo`) e 283–309 (`editarInformativo`)
- `public/scripts/controllers/ControladoraProjetos.js` — linhas 27–54 (`criarProjeto`) e 106–129 (`editarProjeto`)

---

## 2. Extract Class (Extrair Classe)

**Definição:** Quando uma classe faz o trabalho de duas, cria-se uma nova classe e move-se os campos e métodos relevantes para ela.

### 2.1 — Separação das Controladoras do Frontend

A lógica de negócio do frontend foi extraída da classe monolítica `Interface` para três controladoras especializadas com responsabilidades únicas:

| Classe Extraída | Responsabilidade |
|---|---|
| `ControladoraAutenticacao` | Autenticação, cadastro e perfil de usuários |
| `ControladoraInformativo` | CRUD de informativos e carrossel de fixados |
| `ControladoraProjetos` | CRUD de projetos com suporte a imagens |

**Onde encontrar:**
- `public/scripts/controllers/ControladoraAutenticacao.js`
- `public/scripts/controllers/ControladoraInformativo.js`
- `public/scripts/controllers/ControladoraProjetos.js`

A `Interface` agora atua como Façade — delega para as controladoras sem conter lógica de negócio:

```javascript
// Interface.js — método de fachada, sem lógica própria
async criarInformativo() {
    await this.controladoraInformativo.criarInformativo();
}
```

---

### 2.2 — Separação dos Controllers do Backend

A lógica de cada recurso da API foi extraída para arquivos controllers dedicados, em vez de centralizar tudo em `server.js`:

| Arquivo Extraído | Recurso |
|---|---|
| `backend/controllers/authController.js` | Usuários e autenticação |
| `backend/controllers/informativeController.js` | Informativos/posts |
| `backend/controllers/projectController.js` | Projetos |
| `backend/controllers/eventController.js` | Eventos da agenda |

O `server.js` tornou-se exclusivamente responsável por configuração e inicialização:

```javascript
// server.js — apenas importa e registra; zero lógica de negócio
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/informatives', informativeRoutes);
app.use('/api/events', eventRoutes);
```

---

### 2.3 — Extração da Classe `DatabaseConnection`

A lógica de conexão com o MongoDB foi extraída do `server.js` para uma classe dedicada com padrão Singleton:

**Onde encontrar:** `backend/config/db.js`

```javascript
class DatabaseConnection {
    constructor() {
        if (!DatabaseConnection.instance) {
            this.connectPromise = this.connect();
            DatabaseConnection.instance = this;
        }
        return DatabaseConnection.instance;
    }
    // ...
}
```

---

## 3. Extract Function / Separate Query from Modifier

**Definição:** Separa funções que consultam dados de funções que modificam estado, seguindo o princípio Command-Query Separation (CQS).

### 3.1 — Separação de `getMe` e `login`

O endpoint `GET /api/auth/me` (consulta pura) foi separado do `POST /api/auth/login` (modificação de estado via cookie):

```javascript
// QUERY — apenas lê o usuário via req.user (populado pelo middleware)
const getMe = async (req, res) => {
    res.json({ _id: req.user._id, nome: req.user.nome, ... });
};

// COMMAND — valida credenciais E define o cookie de sessão
const login = async (req, res) => {
    // ...
    setTokenCookie(res, token); // efeito colateral explícito
    res.json({ ... });
};
```

**Onde encontrar:** `backend/controllers/authController.js` — linhas 32–71.

---

## 4. Replace Magic Number with Named Constant (Substituir Número Mágico por Constante)

**Definição:** Substitui literais de valor por constantes nomeadas que comunicam a intenção do valor.

### 4.1 — Constante `JWT_SECRET`

Em vez de repetir a string literal do segredo JWT em múltiplos pontos, ela é definida como constante no topo do arquivo:

**Antes (problemático):**
```javascript
jwt.sign({ id }, 'thiago_secret_key_2026_super_secure', { expiresIn: '30d' });
jwt.verify(token, 'thiago_secret_key_2026_super_secure');
```

**Depois (refatorado):**
```javascript
// Uma única fonte de verdade
const JWT_SECRET = process.env.JWT_SECRET || 'thiago_secret_key_2026_super_secure';

// Usado em generateToken e no middleware
jwt.sign({ id }, JWT_SECRET, { expiresIn: '30d' });
jwt.verify(token, JWT_SECRET);
```

**Onde encontrar:**
- `backend/controllers/authController.js` — linha 5 (definição), linha 11 (uso)
- `backend/middleware/authMiddleware.js` — linha 21 (uso paralelo com a mesma estratégia)

---

### 4.2 — Constantes de Tempo no Cookie

A duração do cookie é expressa como cálculo explícito em vez de um número mágico:

```javascript
// Legível: 30 dias em milissegundos
maxAge: 30 * 24 * 60 * 60 * 1000
```

**Onde encontrar:** `backend/controllers/authController.js` — linha 25.

---

### 4.3 — Constante de Tempo do Carrossel

```javascript
// Intervalo do carrossel nomeado como propriedade
this.tempoRolagem = 3500; // 3.5 segundos, reutilizado em iniciarCarrossel()
```

**Onde encontrar:** `public/scripts/controllers/ControladoraInformativo.js` — linha 14 (definição), linha 418 (uso).

---

## 5. Encapsulate Field / Hide Data (Encapsular Campo)

**Definição:** Protege campos sensíveis de acesso externo direto, expondo-os apenas através de interfaces controladas.

### 5.1 — Exclusão do campo `senha` nas respostas da API

O campo `senha` (hash bcrypt) é explicitamente excluído de todas as consultas que retornam dados ao cliente:

```javascript
// select('-senha') garante que o hash nunca trafegue pela rede
req.user = await User.findById(decoded.id).select('-senha');

// Em getResponsibles:
const users = await User.find({}).select('-senha');
```

**Onde encontrar:**
- `backend/middleware/authMiddleware.js` — linha 22
- `backend/controllers/authController.js` — linha 127

---

### 5.2 — Encapsulamento do Estado de Sessão em `ControladoraAutenticacao`

O estado da sessão (`conta_logada`, `usuarioLogado`) é privado à controladora. O HTML nunca acessa esses campos diretamente — apenas métodos públicos da controladora:

```javascript
class ControladoraAutenticacao {
    constructor() {
        // Estado interno encapsulado
        this.conta_logada = false;
        this.usuarioLogado = null;
        this.usuarioLogadoUsername = null;
    }

    // Acesso controlado via método público
    verificarAdm() {
        return this.conta_logada && this.usuarioLogado?.perfil === "Administrador";
    }
}
```

**Onde encontrar:** `public/scripts/controllers/ControladoraAutenticacao.js` — linhas 10–19 (estado) e linha 106 (acesso controlado).

---

## 6. Replace Inline Code with Function Call (Substituir Código Inline por Chamada de Função)

**Definição:** Substitui código inline repetitivo por chamadas a funções já existentes ou utilitárias.

### 6.1 — `getAuthHeaders()` centraliza os cabeçalhos HTTP

Em vez de repetir `{ 'Content-Type': 'application/json' }` em cada `fetch`, um método centraliza a definição:

**Antes (problemático — repetição em cada chamada fetch):**
```javascript
fetch('/api/projects', {
    headers: { 'Content-Type': 'application/json' }
});
fetch('/api/informatives', {
    headers: { 'Content-Type': 'application/json' }
});
```

**Depois (refatorado):**
```javascript
// Definição única
getAuthHeaders() {
    return { 'Content-Type': 'application/json' };
}

// Todas as chamadas usam o método
fetch('/api/projects', {
    headers: this.controladoraAuth.getAuthHeaders()
});
```

**Onde encontrar:**
- `public/scripts/controllers/ControladoraAutenticacao.js` — linhas 56–60 (definição)
- Usado em `ControladoraInformativo.js`, `ControladoraProjetos.js` e em toda a `ControladoraAutenticacao.js`

---

## 7. Consolidate Duplicate Conditional Fragments (Consolidar Fragmentos Condicionais Duplicados)

**Definição:** Move código que aparece em todos os ramos de uma condicional para fora dela, eliminando duplicação.

### 7.1 — Padrão try/catch padronizado nos controllers

Todos os handlers do backend seguem o mesmo padrão consolidado de tratamento de erros:

```javascript
const handler = async (req, res) => {
    try {
        // lógica de negócio
        const result = await Model.operation();
        res.json(result);
    } catch (error) {
        // Fragmento consolidado — tratamento uniforme de erro de servidor
        res.status(500).json({ message: 'Mensagem descritiva', error: error.message });
    }
};
```

Este padrão é aplicado consistentemente em todos os 17 handlers assíncronos dos 4 controllers do backend.

**Onde encontrar:** `backend/controllers/authController.js`, `informativeController.js`, `projectController.js`, `eventController.js`

---

### 7.2 — Verificação de recurso não encontrado padronizada

O padrão de verificação de existência de recurso antes de operar sobre ele foi consolidado:

```javascript
// Padrão consolidado: busca → verifica existência → opera → responde
const informative = await Informative.findById(req.params.id);

if (informative) {
    // operação de sucesso
} else {
    res.status(404).json({ message: 'Informativo não encontrado' });
}
```

Aplicado nos handlers de update, delete e toggle de todos os recursos.

---

## 8. Introduce Parameter Object (Introduzir Objeto Parâmetro)

**Definição:** Quando vários parâmetros sempre aparecem juntos, agrupa-os em um objeto.

### 8.1 — Desestruturação de `req.body` como agrupamento

Os dados de entrada da API são recebidos e agrupados como objetos antes de serem passados para operações:

```javascript
// Parâmetros agrupados via desestruturação
const { titulo, descricao, imagem } = req.body;

// Passados como objeto para o Model
const informative = new Informative({ titulo, descricao, imagem, fixado: false });
```

**Onde encontrar:** Em todos os handlers de criação dos controllers do backend.

---

## 9. Separate Middleware Layer (Separar Camada de Middleware)

**Definição:** Extrai preocupações transversais (autenticação, autorização) do código de negócio para uma camada intermediária reutilizável.

### 9.1 — Extração de `protect` e `adminOnly`

A validação de JWT e a verificação de perfil foram extraídas para middlewares reutilizáveis, removendo essa responsabilidade dos handlers de negócio:

**Antes (problemático — lógica de auth misturada ao negócio):**
```javascript
const getProjects = async (req, res) => {
    // Verificação de auth misturada ao negócio
    const token = req.cookies.token;
    if (!token) return res.status(401).json(...);
    const decoded = jwt.verify(token, JWT_SECRET);
    // ...lógica de negócio
    const projects = await Project.find({});
    res.json(projects);
};
```

**Depois (refatorado):**
```javascript
// Middlewares extraídos — reutilizáveis em qualquer rota
const { protect, adminOnly } = require('../middleware/authMiddleware');

// Rota limpa: auth declarativa, handler focado em negócio
router.get('/', protect, getProjects);
router.post('/', protect, adminOnly, createProject);
```

**Onde encontrar:**
- `backend/middleware/authMiddleware.js` — definição dos middlewares `protect` e `adminOnly`
- `backend/routes/authRoutes.js`, `projectRoutes.js`, `informativeRoutes.js`, `eventRoutes.js` — aplicação

---

## 10. Replace Constructor with Factory Method (Substituir Construtor por Factory)

**Definição:** Substitui chamadas diretas ao construtor por um método factory que encapsula e centraliza a criação de objetos.

### 10.1 — Classe `Fabrica` centraliza instanciação

Em vez de chamar `new Projeto(...)`, `new Informativo(...)`, `new Usuario(...)` espalhados pelo código, a classe `Fabrica` centraliza toda a criação de instâncias:

**Antes (problemático — new espalhado pelo código):**
```javascript
// Em diferentes pontos do sistema:
const projeto = new Projeto(nome, desc, turma, imagem);
const info = new Informativo(titulo, desc, data, imagem);
const user = new Usuario(nome, email, senha);
```

**Depois (refatorado):**
```javascript
// Um único ponto de criação
const projeto = Fabrica.criarProjeto(nome, desc, turma, imagem);
const info = Fabrica.criarInformativo(titulo, desc, data, imagem);
const user = Fabrica.criarUsuario(nome, email, senha);
```

**Onde encontrar:** `public/scripts/factories/Fabrica.js` — linhas 14–39.

---

## 11. Guard Clause (Cláusula de Guarda)

**Definição:** Substitui condicionais aninhadas por retornos antecipados (early returns) para validações, tornando o fluxo principal mais evidente.

### 11.1 — Validação antecipada nos controllers do backend

```javascript
const createInformative = async (req, res) => {
    const { titulo, descricao, imagem } = req.body;

    try {
        // Guard clause: retorno antecipado se dados inválidos
        if (!titulo || !descricao) {
            return res.status(400).json({ message: 'Título e descrição são obrigatórios' });
        }

        // Fluxo principal — só chega aqui se dados forem válidos
        const informative = new Informative({ titulo, descricao, imagem: imagem || '', fixado: false });
        const created = await informative.save();
        res.status(201).json(created);
    } catch (error) { ... }
};
```

**Onde encontrar:**
- `backend/controllers/informativeController.js` — linha 22 (guard clause de validação)
- `backend/controllers/projectController.js` — linha 22 (mesmo padrão)
- `backend/controllers/eventController.js` — linha 22 (mesmo padrão)
- `backend/middleware/authMiddleware.js` — linha 16 (guard clause sem token)

---

### 11.2 — Guard clause nos containers DOM do frontend

```javascript
async exibirProjetos(filtroTurma = 'Todos') {
    const container = document.getElementById('lista-projetos');
    // Guard clause: retorno antecipado se elemento não existe no DOM
    if (!container) return;

    // Fluxo principal...
}
```

**Onde encontrar:**
- `public/scripts/controllers/ControladoraProjetos.js` — linha 154
- `public/scripts/controllers/ControladoraInformativo.js` — linhas 24, 124

---

## 12. Replace Hardcoded Default with Configurable Default

**Definição:** Substitui valores fixos no código por padrões configuráveis via ambiente ou parâmetros, aumentando a flexibilidade de deploy.

### 12.1 — Configuração por variáveis de ambiente

Todos os valores sensíveis ou configuráveis foram extraídos para variáveis de ambiente com fallbacks seguros para desenvolvimento:

```javascript
// server.js — porta configurável
const PORT = process.env.PORT || 5000;

// db.js — URI do banco configurável
const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/thiago-informa';

// authController.js — segredo JWT configurável
const JWT_SECRET = process.env.JWT_SECRET || 'thiago_secret_key_2026_super_secure';

// authController.js — cookie seguro apenas em produção
const isProduction = process.env.NODE_ENV === 'production';
res.cookie('token', token, { secure: isProduction, ... });
```

**Onde encontrar:**
- `server.js` — linha 39
- `backend/config/db.js` — linha 13
- `backend/controllers/authController.js` — linhas 5 e 20
- `.env.example` — template de variáveis

---

## 13. Self-Seeding / Initialization Guard (Guarda de Inicialização)

**Definição:** Garante que dados essenciais existam antes de iniciar a aplicação, sem criar duplicatas.

### 13.1 — Semeio do usuário Admin com verificação de existência

O `server.js` verifica se o admin já existe antes de criá-lo, evitando duplicação a cada reinicialização:

```javascript
dbInstance.connectPromise.then(async () => {
    // Guard clause de inicialização: só cria se não existir
    const adminExists = await User.findOne({ usuario: 'admin' });
    if (!adminExists) {
        // Cria com senha já hasheada
        const hashedPassword = await bcrypt.hash('admin123', salt);
        await User.create({ nome: 'Administrador', usuario: 'admin', senha: hashedPassword, perfil: 'Administrador' });
    }

    app.listen(PORT, ...);
});
```

**Onde encontrar:** `server.js` — linhas 42–62.

---

## Resumo das Técnicas Aplicadas

| # | Técnica de Refactoring | Categoria | Onde foi Aplicada |
|---|---|---|---|
| 1 | Extract Method | Composição | `generateToken`, `setTokenCookie`, `enviarParaAPI` |
| 2 | Extract Class | Organização | Controllers do backend e frontend separados |
| 3 | Separate Query from Modifier | CQS | `getMe` vs `login` |
| 4 | Replace Magic Number with Named Constant | Clareza | `JWT_SECRET`, `tempoRolagem`, duração do cookie |
| 5 | Encapsulate Field | Proteção de dados | `select('-senha')`, estado interno das controladoras |
| 6 | Replace Inline Code with Function Call | Eliminação de duplicação | `getAuthHeaders()` |
| 7 | Consolidate Duplicate Conditional Fragments | Padronização | Padrão try/catch e verificação 404 |
| 8 | Introduce Parameter Object | Agrupamento | Desestruturação de `req.body` |
| 9 | Separate Middleware Layer | Separação de concerns | `protect` e `adminOnly` como middlewares |
| 10 | Replace Constructor with Factory Method | Criação | Classe `Fabrica` |
| 11 | Guard Clause | Fluxo de controle | Early returns em validações e DOM checks |
| 12 | Replace Hardcoded Default with Configurable | Configurabilidade | `process.env` com fallbacks |
| 13 | Initialization Guard | Idempotência | Semeio do admin no boot |

---

*Documento gerado com base na análise estática do código-fonte do projeto Thiago Informa em 30/06/2026.*

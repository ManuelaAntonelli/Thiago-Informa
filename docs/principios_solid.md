# Princípios SOLID Aplicados — Thiago Informa

---

## Introdução

Os princípios SOLID são cinco diretrizes de design orientado a objetos que visam tornar o software mais fácil de manter, estender e testar. Este documento demonstra como cada princípio (com exceção do LSP — Liskov Substitution Principle, não aplicável ao JavaScript sem tipagem formal) foi implementado no projeto **Thiago Informa**, com trechos reais do código-fonte.

| Princípio | Nome Completo | Status no projeto |
|---|---|---|
| **S** | Single Responsibility Principle | ✅ Aplicado |
| **O** | Open/Closed Principle | ✅ Aplicado |
| **L** | Liskov Substitution Principle | ⏭️ Não se aplica (JS sem tipagem) |
| **I** | Interface Segregation Principle | ✅ Aplicado |
| **D** | Dependency Inversion Principle | ✅ Aplicado |

---

## S — Single Responsibility Principle (Princípio da Responsabilidade Única)

> *"Uma classe deve ter um, e apenas um, motivo para mudar."*
> — Robert C. Martin

### Definição

Uma classe ou módulo deve ter apenas **uma responsabilidade**. Se ela precisar mudar, deve ser por apenas uma razão. A violação mais comum é quando um único arquivo mistura lógica de negócio, acesso a dados e manipulação de interface.

---

### Aplicação no Backend

#### SRP aplicado


Cada arquivo possui agora uma única razão para mudar:

**`backend/controllers/authController.js`** → *somente* lógica de autenticação de usuários

```javascript
class AuthController {
    constructor(UserModel, bcrypt, jwt) { ... }

    async login(req, res) {
        const { usuario, senha } = req.body;
        const user = await this.User.findOne({ usuario });
        if (user && (await this.bcrypt.compare(senha, user.senha))) {
            const token = this._generateToken(user._id);
            this._setTokenCookie(res, token);
            res.json({ _id: user._id, nome: user.nome, ... });
        } else {
            res.status(401).json({ message: 'Usuário ou senha incorretos' });
        }
    }
}
```

**`backend/middleware/authMiddleware.js`** → *somente* validação de autenticação HTTP

```javascript
const protect = async (req, res, next) => {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ message: 'Sem autorização' });
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = await User.findById(decoded.id).select('-senha');
    next();
};
```

**`backend/config/db.js`** → *somente* gerenciamento da conexão com o banco

```javascript
class DatabaseConnection {
    constructor() {
        if (!DatabaseConnection.instance) {
            this.connectPromise = this.connect();
            DatabaseConnection.instance = this;
        }
        return DatabaseConnection.instance;
    }
    async connect() {
        await mongoose.connect(mongoURI);
        console.log('MongoDB conectado');
    }
}
```

---

### Aplicação no Frontend

#### SRP aplicado — separação entre Service e Controller


**`public/scripts/services/InformativoService.js`** → *somente* comunicação HTTP

```javascript
class InformativoService {
    constructor(httpClient) {
        this.http = httpClient;
    }

    async getAll()         { return this.http.get('/api/informatives'); }
    async create(dados)    { return this.http.post('/api/informatives', dados); }
    async update(id, dados){ return this.http.put(`/api/informatives/${id}`, dados); }
    async togglePin(id)    { return this.http.put(`/api/informatives/${id}/pin`); }
    async remove(id)       { return this.http.delete(`/api/informatives/${id}`); }
}
```

**`public/scripts/controllers/ControladoraInformativo.js`** → *somente* orquestração da View

```javascript
class ControladoraInformativo {
    async criarInformativo() {
        const titulo = document.getElementById('inputTituloInfo').value;

        const resposta = await this.informativoService.create({ titulo, descricao, imagem });

        if (resposta.ok) {
            document.getElementById('formInformativo').reset();
            this.carregarInformativos();
        }
    }
}
```

**Tabela de responsabilidades após o SRP:**

| Arquivo | Única Responsabilidade |
|---|---|
| `HttpClient.js` | Configurar e executar requisições HTTP |
| `AuthService.js` | Chamadas HTTP de autenticação |
| `InformativoService.js` | Chamadas HTTP de informativos |
| `ProjetoService.js` | Chamadas HTTP de projetos |
| `EventoService.js` | Chamadas HTTP de eventos |
| `ControladoraAutenticacao.js` | Orquestrar a UI de autenticação |
| `ControladoraInformativo.js` | Orquestrar a UI de informativos e carrossel |
| `ControladoraProjetos.js` | Orquestrar a UI de projetos |
| `Interface.js` | Composição da aplicação e navegação |

---

## O — Open/Closed Principle (Princípio do Aberto/Fechado)

> *"Entidades de software devem estar abertas para extensão, mas fechadas para modificação."*
> — Bertrand Meyer / Robert C. Martin

### Definição

Um módulo deve ser **extensível** (podemos adicionar novos comportamentos) sem precisar **modificar** o código existente. Isso é alcançado principalmente por meio de composição, herança e polimorfismo.

---

### Aplicação: `HttpClient.js` como base extensível

A classe `HttpClient` centraliza toda a configuração de requisições HTTP. O método `_buildOptions()` é o **ponto de extensão** — pode ser sobrescrito ou composto sem modificar os services que dependem dele.

```javascript
class HttpClient {

    _buildOptions(method, body = null) {
        const options = {
            method,
            headers: { 'Content-Type': 'application/json' },
            credentials: 'same-origin'
        };
        if (body !== null) options.body = JSON.stringify(body);
        return options;
    }

    async get(endpoint)       { return fetch(this.baseUrl + endpoint, this._buildOptions('GET')); }
    async post(endpoint, body){ return fetch(this.baseUrl + endpoint, this._buildOptions('POST', body)); }
    async put(endpoint, body) { return fetch(this.baseUrl + endpoint, this._buildOptions('PUT', body)); }
    async delete(endpoint)    { return fetch(this.baseUrl + endpoint, this._buildOptions('DELETE')); }
}
```

#### Extensão sem modificação — exemplo prático

Se o sistema precisasse mudar para autenticação por Bearer Token (em vez de cookie), **nenhum service** precisaria ser tocado:

```javascript
class AuthenticatedHttpClient extends HttpClient {
    constructor(tokenProvider) {
        super();
        this.tokenProvider = tokenProvider;
    }

    _buildOptions(method, body = null) {
        const options = super._buildOptions(method, body);
        options.headers['Authorization'] = `Bearer ${this.tokenProvider.getToken()}`;
        return options;
    }
}

```

---

### Aplicação: Novos recursos sem modificar código existente

A arquitetura de services permite adicionar um novo domínio (ex.: `AvisoService`) sem modificar nenhuma classe existente:

```javascript
class AvisoService {
    constructor(httpClient) { this.http = httpClient; }
    async getAll() { return this.http.get('/api/avisos'); }
    async create(dados) { return this.http.post('/api/avisos', dados); }
}
```

Na `Interface.js` (Composition Root), apenas se adiciona a nova linha de composição:

```javascript
const avisoService = new AvisoService(httpClient); 
this.controladoraAvisos = new ControladoraAvisos(avisoService);
```

---

## I — Interface Segregation Principle (Princípio da Segregação de Interface)

> *"Clientes não devem ser forçados a depender de interfaces que não utilizam."*
> — Robert C. Martin

### Definição

Em vez de ter uma interface (ou classe) grande e genérica, devemos criar interfaces menores e específicas. Em JavaScript, isso se traduz em criar **services segregados por domínio**, garantindo que cada cliente dependa apenas dos métodos que realmente usa.

---

### Aplicação: Services segregados por domínio

Após aplicar o ISP, cada controladora recebe **apenas o service de que necessita**:

```javascript
class AuthService {
    async login(usuario, senha) { ... }
    async getMe() { ... }
    async logout() { ... }
    async register(nome, usuario, senha, perfil) { ... }
    async getResponsibles() { ... }
    async updateProfile(dados) { ... }
    async changePassword(id, novaSenha) { ... }
    async deleteUser(id) { ... }
}

class ProjetoService {
    async getAll() { ... }
    async create(dados) { ... }
    async update(id, dados) { ... }
    async remove(id) { ... }
}

class InformativoService {
    async getAll() { ... }
    async create(dados) { ... }
    async update(id, dados) { ... }
    async togglePin(id) { ... }
    async remove(id) { ... }
}

class EventoService {
    async getAll() { ... }
    async create(dados) { ... }
    async remove(id) { ... }
}
```

---

### Mapa de dependências (ISP)

O diagrama abaixo demonstra que cada cliente conhece **apenas** os métodos que utiliza:

```
ControladoraAutenticacao  ──depende de──► AuthService       (8 métodos)
ControladoraInformativo   ──depende de──► InformativoService (5 métodos)
ControladoraProjetos      ──depende de──► ProjetoService     (4 métodos)
Interface (Agenda)        ──depende de──► EventoService      (3 métodos)

Nenhum cliente conhece métodos de outro domínio.
```

**Com ISP aplicado:**
- `ControladoraProjetos` depende de `ProjetoService` que tem exatamente 4 métodos — nada mais, nada menos.


---

## D — Dependency Inversion Principle (Princípio da Inversão de Dependência)

> *"Módulos de alto nível não devem depender de módulos de baixo nível. Ambos devem depender de abstrações."*
> — Robert C. Martin

### Definição

Classes de alto nível (como controllers de negócio) não devem criar ou importar diretamente suas dependências de baixo nível (como `fetch`, `mongoose`, `bcrypt`). Em vez disso, as dependências devem ser **injetadas de fora** — isso inverte o fluxo de controle e é chamado de **Injeção de Dependência (DI)**.

---

### Aplicação no Backend — Controllers como Classes Injetáveis

#### DIP aplicado — injeção via construtor


```javascript
class AuthController {
    constructor(UserModel, bcrypt, jwt) {
        this.User = UserModel;
        this.bcrypt = bcrypt;
        this.jwt = jwt;
    }

    async login(req, res) {
        const user = await this.User.findOne({ usuario: req.body.usuario });
        if (user && (await this.bcrypt.compare(req.body.senha, user.senha))) {
            const token = this._generateToken(user._id);
        }
    }
}
module.exports = AuthController;
```

---

### Composition Root do Backend — `authRoutes.js`

O arquivo de rotas é o **único lugar** onde as dependências concretas são criadas e injetadas:

```javascript
const AuthController = require('../controllers/authController');
const User = require('../models/User'); 
const bcrypt = require('bcryptjs');     
const jwt = require('jsonwebtoken');    

const authController = new AuthController(User, bcrypt, jwt);

router.post('/login', authController.login);
router.get('/me', protect, authController.getMe);
```

**Benefício prático:** Para testar `AuthController` em isolamento, basta injetar mocks:

```javascript
const UserMock = { findOne: async () => ({ _id: '123', senha: 'hash' }) };
const bcryptMock = { compare: async () => true };
const jwtMock = { sign: () => 'fake-token' };

const controller = new AuthController(UserMock, bcryptMock, jwtMock);
```

---

### Aplicação no Frontend — Interface.js como Composition Root

A `Interface.js` é o **único lugar no frontend** onde dependências concretas são instanciadas e conectadas:

```javascript
class Interface {
    constructor() {
        const httpClient = new HttpClient();

        const authService        = new AuthService(httpClient);
        const informativoService = new InformativoService(httpClient);
        const projetoService     = new ProjetoService(httpClient);
        this.eventoService       = new EventoService(httpClient);

        this.controladoraAuth    = new ControladoraAutenticacao(authService);
        this.controladoraInfo    = new ControladoraInformativo(informativoService);
        this.controladoraProjetos = new ControladoraProjetos(projetoService);
    }
}
```

---

### Diagrama do fluxo de dependências (DIP)

```
                     COMPOSITION ROOT
                     ┌─────────────┐
                     │ Interface.js│  (Frontend)
                     │ *Routes.js  │  (Backend)
                     └──────┬──────┘
                            │ instancia e injeta
          ┌─────────────────┼─────────────────┐
          ▼                 ▼                 ▼
   ┌─────────────┐   ┌────────────┐   ┌──────────────┐
   │ AuthService │   │ProjetoServ.│   │ InformServ.  │
   │(HttpClient) │   │(HttpClient)│   │(HttpClient)  │
   └──────┬──────┘   └─────┬──────┘   └──────┬───────┘
          │ injeta         │ injeta           │ injeta
          ▼               ▼                  ▼
   ┌──────────────┐  ┌───────────────┐  ┌───────────────┐
   │Controladora  │  │Controladora   │  │Controladora   │
   │Autenticacao  │  │Projetos       │  │Informativo    │
   └──────────────┘  └───────────────┘  └───────────────┘
   (alto nível)      (alto nível)       (alto nível)

   Módulos de alto nível NÃO importam módulos de baixo nível.
   Ambos dependem de abstrações (HttpClient, service interfaces).
```

---

## Resumo Visual dos Princípios

```
┌────────────────────────────────────────────────────────────────────┐
│                  PRINCÍPIOS SOLID NO THIAGO INFORMA               │
├──────┬─────────────────────────────────┬──────────────────────────┤
│  S   │ Single Responsibility           │ Um arquivo, uma razão    │
│      │ HttpClient → só configura HTTP  │ para mudar               │
│      │ AuthService → só chama /api/auth│                          │
│      │ ControladoraProjetos → só DOM   │                          │
├──────┼─────────────────────────────────┼──────────────────────────┤
│  O   │ Open/Closed                     │ HttpClient._buildOptions  │
│      │ Extensível via herança          │ é o ponto de extensão;   │
│      │ Fechado para modificação        │ services não precisam    │
│      │ nos services existentes         │ ser alterados            │
├──────┼─────────────────────────────────┼──────────────────────────┤
│  L   │ Liskov Substitution             │ ⏭️ Não aplicado          │
│      │ (não aplicável sem              │ (JavaScript sem tipagem  │
│      │  tipagem formal)                │  formal)                 │
├──────┼─────────────────────────────────┼──────────────────────────┤
│  I   │ Interface Segregation           │ 4 services segregados    │
│      │ ControladoraProjetos conhece    │ por domínio; cada cliente│
│      │ apenas ProjetoService (4 métods)│ usa só o que precisa     │
├──────┼─────────────────────────────────┼──────────────────────────┤
│  D   │ Dependency Inversion            │ Interface.js e *Routes.js│
│      │ Controllers recebem             │ são as Composition Roots │
│      │ dependências via construtor     │ únicos lugares com `new` │
└──────┴─────────────────────────────────┴──────────────────────────┘
```

---

## Impacto das mudanças

| Métrica | Antes do SOLID | Depois do SOLID |
|---|---|---|
| Arquivos JS no frontend | 7 | 12 (+5 services) |
| Fetch diretos fora do HttpClient | 15+ (espalhados) | **0** |
| Controllers que importam `require` de baixo nível | 4 | **0** |
| Camadas de abstração entre UI e rede | 0 | **2** (Controller → Service → HttpClient) |
| Testabilidade dos controllers (backend) | Precisa de MongoDB real | **Testável com mocks** |
| Ponto de troca do cliente HTTP | Múltiplos arquivos | **1 linha no Composition Root** |

---
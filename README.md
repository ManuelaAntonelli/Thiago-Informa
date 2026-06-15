# Thiago Informa

## Plataforma Web de Informativos e Projetos Escolares da Educação Infantil

---

# Sobre o Projeto

O **Thiago Informa** é uma plataforma web desenvolvida para centralizar a comunicação entre a escola e as famílias dos alunos da Educação Infantil da **EMEI Thiago Silva Santos**.

O sistema foi idealizado para facilitar o acesso a informativos, projetos pedagógicos, comunicados, eventos e notícias da escola, promovendo maior transparência e participação dos responsáveis no processo educacional.

A plataforma permite que pais e responsáveis acompanhem as atividades da instituição por meio de um ambiente digital moderno, enquanto a equipe gestora possui ferramentas administrativas para gerenciar todo o conteúdo publicado.

---

# Objetivo

Desenvolver uma plataforma web responsiva para gerenciamento e divulgação de:

* Informativos escolares;
* Projetos pedagógicos;
* Comunicados institucionais;
* Notícias e eventos da escola.

Promovendo uma comunicação mais eficiente entre escola e família.

---

# Funcionalidades

## Pais e Responsáveis

* Login no sistema;
* Visualização de informativos;
* Acompanhamento de projetos pedagógicos;
* Consulta de notícias e comunicados;
* Visualização de imagens e documentos;
* Acesso ao histórico de publicações.

---

## Administradores (Equipe Gestora)

* Login administrativo;
* Cadastro de informativos;
* Edição de publicações;
* Exclusão de publicações;
* Cadastro de projetos pedagógicos;
* Atualização de conteúdos dos projetos;
* Upload de imagens e documentos;
* Gerenciamento completo do sistema.

---

# Arquitetura do Sistema

## Fluxo de Acesso

### Login dos Pais

1. Acessar a página inicial;
2. Informar credenciais;
3. Sistema valida os dados;
4. Redirecionamento para página principal;
5. Exibição dos informativos e projetos.

### Login dos Administradores

1. Acessar a página inicial;
2. Informar credenciais administrativas;
3. Sistema valida os dados;
4. Redirecionamento para painel administrativo;
5. Exibição das funcionalidades de gerenciamento.

---

# Módulos do Sistema

## Informativos

Permite:

* Publicação de notícias;
* Divulgação de eventos;
* Compartilhamento de comunicados;
* Inserção de imagens;
* Inclusão de documentos;
* Organização cronológica das postagens.

---

## Projetos Pedagógicos

Permite:

* Cadastro de projetos;
* Organização em categorias;
* Atualizações periódicas;
* Upload de fotos;
* Upload de vídeos;
* Compartilhamento de documentos;
* Histórico de desenvolvimento.

---

# Tecnologias Utilizadas

Em discussão

---

# Responsividade

A plataforma foi projetada para funcionar em:

* Computadores
* Tablets
* Smartphones

Garantindo acessibilidade para todos os usuários.

---

# Segurança

O sistema considera:

* Controle de acesso por perfil;
* Autenticação de usuários;
* Proteção de dados;
* Backup das informações;
* Armazenamento seguro de arquivos;
* Conformidade com a LGPD (Lei Geral de Proteção de Dados).

---

# Diferenciais

* Comunicação centralizada;
* Interface simples e intuitiva;
* Acompanhamento de projetos em tempo real;
* Redução do uso de comunicados impressos;
* Transparência das ações pedagógicas;
* Valorização do trabalho da equipe escolar;
* Compatibilidade com dispositivos móveis.

---

# Impacto Esperado

A implementação do Thiago Informa contribuirá para:

* Fortalecimento da relação escola-família;
* Maior participação dos responsáveis na vida escolar;
* Divulgação eficiente dos projetos pedagógicos;
* Melhor organização das informações institucionais;
* Modernização dos canais de comunicação da escola.

---

# Requisitos do Sistema

## Funcionais

* Autenticação de usuários;
* Controle de acesso por perfil;
* CRUD de informativos;
* CRUD de projetos;
* Upload de arquivos e imagens;
* Visualização de conteúdos.

## Não Funcionais

* Segurança;
* Responsividade;
* Usabilidade;
* Escalabilidade;
* Disponibilidade;
* Conformidade com LGPD.

---

# Como Rodar o Projeto

## 1. Clonar o Repositório

```bash
git clone https://github.com/ManuelaAntonelli/Thiago-Informa.git
cd Thiago-Informa
```

---

## 2. Instalar Dependências

Na raiz do projeto execute:

```bash
npm install
```

---

## 3. Configurar Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto:

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/thiago-informa
JWT_SECRET=thiago_informa_2026
```

---

## 4. Iniciar o MongoDB

### MongoDB Local

Execute:

```bash
mongod
```

Caso o comando não seja reconhecido:

* Instale o MongoDB Community Server
* Adicione o MongoDB ao PATH do Windows

---

### MongoDB Atlas (Nuvem)

Caso utilize MongoDB Atlas, altere a variável:

```env
MONGO_URI=sua_string_de_conexao_atlas
```

Exemplo:

```env
MONGO_URI=mongodb+srv://usuario:senha@cluster.mongodb.net/thiago-informa
```

---

## 5. Rodar o Projeto

Execute:

```bash
npm run dev
```

O comando iniciará simultaneamente:

### Backend

```text
http://localhost:5000
```

### Frontend

```text
http://localhost:5173
```

---

## Scripts Disponíveis

### Iniciar

```bash
npm run dev
```
---

### Iniciar apenas o Backend

```bash
npm run backend
```

---

### Iniciar apenas o Frontend

```bash
npm run frontend
```

---

# Status do Projeto

Em desenvolvimento

---

### Integrantes do Projeto

* **[Alice]** - [Alice Santos M. de Barros](https://github.com/AliceBiju)
* Manuela Antonelli
* José Antonio de Carvalho Neto
* Ranny Fabela Carvalho Leal
* **[Matheus]** - [Matheus Henrique Lira](https://github.com/MatheusHenriqueLira)

---

# Licença

Este projeto possui finalidade acadêmica e educacional, sendo desenvolvido como atividade prática para aplicação dos conceitos de Engenharia de Software, Desenvolvimento Web e Banco de Dados.

---

# Instituição

**EMEI Thiago Silva Santos**

Plataforma desenvolvida para apoio à comunicação escolar e divulgação de projetos pedagógicos da Educação Infantil.

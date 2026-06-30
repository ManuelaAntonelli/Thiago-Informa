# Arquitetura e Padrões de Projeto do Sistema

Este documento descreve detalhadamente as **arquiteturas de software** e os **padrões de projeto (Design Patterns)** adotados no sistema **Thiago Informa**, com as respectivas localizações de cada arquivo no código-fonte.

---

## 1. Arquiteturas de Software

### SPA (Single Page Application)
A interface com o usuário funciona em uma única página HTML, onde as telas são carregadas e alternadas sem a necessidade de recarregar o navegador.
* **Como funciona**: A navegação entre as telas (Feed, Projetos, Calendário, Perfil e Painel Admin) é controlada dinamicamente pelo arquivo JavaScript de visualização, alternando a classe `d-none` (Bootstrap) dos contêineres HTML. A comunicação de dados é feita de forma assíncrona usando requisições à API REST do backend via `fetch`.
* **Localização principal**:
  * [public/index.html](file:///c:/Users/andre/Downloads/Thiago-Informa-Web-main/Thiago-Informa-Web-main/public/index.html): Estrutura unificada com todas as abas.
  * [public/scripts/Interface.js](file:///c:/Users/andre/Downloads/Thiago-Informa-Web-main/Thiago-Informa-Web-main/public/scripts/Interface.js#L430-L481) (Método `navegarAba`): Responsável por alternar as visualizações dinamicamente.

### MVC (Model-View-Controller)

O projeto segue o padrão estrutural MVC para separar as responsabilidades do sistema de forma limpa e modular:
* **Model (Modelo)**: Contém a definição das estruturas de dados e regras de persistência.
  * *No Backend*: Define os Schemas e Modelos do Mongoose salvos no MongoDB:
    * [backend/models/User.js](file:///c:/Users/andre/Downloads/Thiago-Informa-Web-main/Thiago-Informa-Web-main/backend/models/User.js)
    * [backend/models/Project.js](file:///c:/Users/andre/Downloads/Thiago-Informa-Web-main/Thiago-Informa-Web-main/backend/models/Project.js)
    * [backend/models/Informative.js](file:///c:/Users/andre/Downloads/Thiago-Informa-Web-main/Thiago-Informa-Web-main/backend/models/Informative.js)
    * [backend/models/Event.js](file:///c:/Users/andre/Downloads/Thiago-Informa-Web-main/Thiago-Informa-Web-main/backend/models/Event.js)
  * *No Frontend*: Contém as classes que mapeiam os objetos de negócio no navegador:
    * [public/scripts/models/Usuario.js](file:///c:/Users/andre/Downloads/Thiago-Informa-Web-main/Thiago-Informa-Web-main/public/scripts/models/Usuario.js)
    * [public/scripts/models/Projeto.js](file:///c:/Users/andre/Downloads/Thiago-Informa-Web-main/Thiago-Informa-Web-main/public/scripts/models/Projeto.js)
    * [public/scripts/models/Informativo.js](file:///c:/Users/andre/Downloads/Thiago-Informa-Web-main/Thiago-Informa-Web-main/public/scripts/models/Informativo.js)
* **View (Visualização)**: Camada de interface apresentada ao usuário.
  * [public/index.html](file:///c:/Users/andre/Downloads/Thiago-Informa-Web-main/Thiago-Informa-Web-main/public/index.html)
  * [public/css/style.css](file:///c:/Users/andre/Downloads/Thiago-Informa-Web-main/Thiago-Informa-Web-main/public/css/style.css)
* **Controller (Controlador)**: Gerencia o fluxo de controle, processa os inputs, manipula os modelos e solicita atualizações da View.
  * *No Backend (Express)*: Recebe requisições HTTP e executa lógica do banco de dados:
    * [backend/controllers/authController.js](file:///c:/Users/andre/Downloads/Thiago-Informa-Web-main/Thiago-Informa-Web-main/backend/controllers/authController.js)
    * [backend/controllers/projectController.js](file:///c:/Users/andre/Downloads/Thiago-Informa-Web-main/Thiago-Informa-Web-main/backend/controllers/projectController.js)
    * [backend/controllers/informativeController.js](file:///c:/Users/andre/Downloads/Thiago-Informa-Web-main/Thiago-Informa-Web-main/backend/controllers/informativeController.js)
    * [backend/controllers/eventController.js](file:///c:/Users/andre/Downloads/Thiago-Informa-Web-main/Thiago-Informa-Web-main/backend/controllers/eventController.js)
  * *No Frontend (Cliente)*: Escuta eventos do DOM, dispara chamadas AJAX/API e atualiza a interface:
    * [public/scripts/controllers/ControladoraAutenticacao.js](file:///c:/Users/andre/Downloads/Thiago-Informa-Web-main/Thiago-Informa-Web-main/public/scripts/controllers/ControladoraAutenticacao.js)
    * [public/scripts/controllers/ControladoraInformativo.js](file:///c:/Users/andre/Downloads/Thiago-Informa-Web-main/Thiago-Informa-Web-main/public/scripts/controllers/ControladoraInformativo.js)
    * [public/scripts/controllers/ControladoraProjetos.js](file:///c:/Users/andre/Downloads/Thiago-Informa-Web-main/Thiago-Informa-Web-main/public/scripts/controllers/ControladoraProjetos.js)

---

## 2. Design Patterns (Padrões de Projeto)

### Singleton
Garante que uma classe possua apenas uma única instância em toda a execução da aplicação e fornece um ponto de acesso global a ela.
* **Onde é aplicado**:
  * **Banco de Dados (Backend)**: A classe de conexão do banco de dados Mongoose garante uma única instância aberta da conexão com o MongoDB.
    * [backend/config/db.js](file:///c:/Users/andre/Downloads/Thiago-Informa-Web-main/Thiago-Informa-Web-main/backend/config/db.js): Instância única exposta via exportação do Singleton.
  * **Controladoras (Frontend)**: As classes controladoras do cliente utilizam uma trava no construtor para impossibilitar a criação de duplicatas:
    * [public/scripts/controllers/ControladoraAutenticacao.js](file:///c:/Users/andre/Downloads/Thiago-Informa-Web-main/Thiago-Informa-Web-main/public/scripts/controllers/ControladoraAutenticacao.js#L8-L27) (verificar o construtor `ControladoraAutenticacao.instancia`).

### Facade (Fachada)

Fornece uma interface unificada e simplificada para um subsistema de classes mais complexo.
* **Onde é aplicado**:
  * **Interface de Entrada (Frontend)**: A classe `Interface` centraliza e expõe todos os pontos de entrada do frontend. O HTML interage exclusivamente com a Fachada global `app`. A fachada recebe a instrução e delega para as controladoras corretas por trás dos panos.
  * [public/scripts/Interface.js](file:///c:/Users/andre/Downloads/Thiago-Informa-Web-main/Thiago-Informa-Web-main/public/scripts/Interface.js): Por exemplo, os métodos `executarLogin()`, `criarInformativo()` ou `filtrarProjetos()` apenas delegam a chamada para suas respectivas controladoras especializadas, encapsulando a complexidade.

### Factory (Fábrica)

Define uma interface para criar um objeto, encapsulando o processo de instanciação.
* **Onde é aplicado**:
  * **Fabrica de Modelos (Frontend)**: A classe `Fabrica` gerencia a criação dinâmica de novas instâncias de classes de modelos (`Usuario`, `Projeto`, `Informativo`) no cliente a partir de dados em JSON recebidos das requisições AJAX.
  * [public/scripts/factories/Fabrica.js](file:///c:/Users/andre/Downloads/Thiago-Informa-Web-main/Thiago-Informa-Web-main/public/scripts/factories/Fabrica.js): Concentra a lógica de instanciação em um único ponto, facilitando manutenção e expansões futuras.


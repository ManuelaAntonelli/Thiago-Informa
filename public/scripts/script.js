/**
 * Ponto de entrada da aplicação.
 * Inicializa a Fachada (Interface) e expõe como variável global.
 * 
 * Estrutura SOLID:
 *   Models:      Usuario, Projeto, Informativo
 *   Factory:     Fabrica
 *   Controllers: ControladoraAutenticacao, ControladoraInformativo, ControladoraProjetos
 *   Facade:      Interface
 */

const app = new Interface();
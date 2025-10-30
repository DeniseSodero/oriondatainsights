/* ===============================
   SCRIPT DO BRINDE - HISTÓRIAS
   =============================== */
document.addEventListener('DOMContentLoaded', () => {

  // 1. Encontra os elementos do HTML
  const textoElemento = document.getElementById('historia-texto');
  const opcoesElemento = document.getElementById('historia-opcoes');

  // 2. Define a estrutura da nossa história
  const historia = {
    inicio: {
      texto: "Você está na entrada de uma caverna escura. Um cheiro de fumaça e enxofre vem de dentro. Você ouve um ronco profundo. O que você faz?",
      opcoes: [
        { texto: "Entrar na ponta dos pés", destino: "entrar" },
        { texto: "Dar meia volta e ir embora", destino: "fim_covarde" }
      ]
    },
    entrar: {
      texto: "Você entra. A caverna é enorme. No centro, sobre uma pilha de ouro, um imenso dragão vermelho dorme. Perto da saída, você vê um baú de madeira. O que você faz?",
      opcoes: [
        { texto: "Tentar pegar o tesouro do baú", destino: "bau" },
        { texto: "Ir embora em silêncio", destino: "fim_seguro" }
      ]
    },
    bau: {
      texto: "Você se aproxima silenciosamente do baú... mas pisa em um osso! O barulho ecoa. O dragão abre um olho gigante e encara você. Fim de jogo.",
      opcoes: [
        { texto: "Recomeçar", destino: "inicio" }
      ]
    },
    fim_seguro: {
      texto: "Sábia decisão. Você sai da caverna em silêncio. Você não ficou rico, mas pelo menos está vivo para outra aventura. Fim.",
      opcoes: [
        { texto: "Recomeçar", destino: "inicio" }
      ]
    },
    fim_covarde: {
      texto: "Você decide que a aventura pode esperar. Você volta para a segurança da floresta. Fim.",
      opcoes: [
        { texto: "Recomeçar", destino: "inicio" }
      ]
    }
  };

  /**
   * Função que atualiza a tela com o nó atual da história
   * @param {string} noID - A 'chave' do nó da história (ex: 'inicio')
   */
  function mostrarNo(noID) {
    // Pega o nó da história
    const no = historia[noID];

    // Atualiza o texto principal
    textoElemento.textContent = no.texto;

    // Limpa os botões de opção antigos
    opcoesElemento.innerHTML = '';

    // Cria os novos botões de opção
    no.opcoes.forEach(opcao => {
      const botao = document.createElement('button');
      botao.className = 'btn-escolha'; //
      botao.textContent = opcao.texto;
      
      // Adiciona o 'escutador' de clique
      botao.addEventListener('click', () => {
        mostrarNo(opcao.destino);
      });
      
      opcoesElemento.appendChild(botao);
    });
  }

  // 3. Começa a história
  mostrarNo('inicio');

});
/* ===============================
   SCRIPT DO BRINDE - HISTÓRIAS (VERSÃO ALEATÓRIA)
   =============================== */
document.addEventListener('DOMContentLoaded', () => {

  // 1. Encontra os elementos do HTML
  const textoElemento = document.getElementById('historia-texto');
  const opcoesElemento = document.getElementById('historia-opcoes');
  // Bônus: Encontra o elemento do título da demo
  const tituloElemento = document.querySelector('.feature-box h4');

  // 2. DEFINE A LISTA DE DEMOS
  // (Sua história original, agora como 'demoCaverna')
  const demoCaverna = {
    titulo: "A Caverna do Dragão Adormecido",
    noInicial: 'inicio',
    nos: {
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
    }
  };

  // (Nossa segunda demo de exemplo)
  const demoBeco = {
    titulo: "O Mistério do Beco Escuro",
    noInicial: 'inicio',
    nos: {
      'inicio': {
        texto: 'Chuva. Um beco escuro. Uma figura misteriosa em uma capa oferece um pacote.',
        opcoes: [
          { texto: 'Aceitar o pacote', destino: 'beco_pacote' },
          { texto: 'Recusar educadamente', destino: 'beco_recusar' }
        ]
      },
      'beco_pacote': {
        texto: 'O pacote é pesado e mia. Você abre e encontra... um gatinho preto. Fim.',
        opcoes: [{ texto: 'Recomeçar', destino: 'inicio' }]
      },
      'beco_recusar': {
        texto: 'A figura dá de ombros e desaparece nas sombras. Você segue seu caminho, seco e sem gatos. Fim.',
        opcoes: [{ texto: 'Recomeçar', destino: 'inicio' }]
      }
    }
  };

  // ADICIONE SUAS 18+ OUTRAS DEMOS AQUI
  // const demoEspaco = { ... };
  // const demoPirata = { ... };

  const listaDeDemos = [
    demoCaverna,
    demoBeco
    // , demoEspaco, demoPirata
  ];

  // 3. SORTEIA A HISTÓRIA
  const indiceAleatorio = Math.floor(Math.random() * listaDeDemos.length);
  const historia = listaDeDemos[indiceAleatorio]; // 'historia' agora é a demo sorteada

  /**
   * Função que atualiza a tela com o nó atual da história
   * @param {string} noID - A 'chave' do nó da história (ex: 'inicio')
   */
  function mostrarNo(noID) {
    // Pega o nó da história
    // MUDANÇA: Agora lemos de 'historia.nos'
    const no = historia.nos[noID];

    // Atualiza o texto principal
    textoElemento.textContent = no.texto;

    // Limpa os botões de opção antigos
    opcoesElemento.innerHTML = '';

    // Cria os novos botões de opção
    no.opcoes.forEach(opcao => {
      const botao = document.createElement('button');
      botao.className = 'btn-escolha'; 
      botao.textContent = opcao.texto;
      
      // Adiciona o 'escutador' de clique
      botao.addEventListener('click', () => {
        // MUDANÇA: A recursão agora passa o ID do nó inicial da *história atual*
        if (opcao.destino === 'inicio') {
            mostrarNo(historia.noInicial);
        } else {
            mostrarNo(opcao.destino);
        }
      });
      
      opcoesElemento.appendChild(botao);
    });
  }

  // 4. Começa a história
  
  // Bônus: Atualiza o título na página
  if (tituloElemento) {
    tituloElemento.textContent = historia.titulo;
  }
  
  // Inicia a história sorteada
  mostrarNo(historia.noInicial);

});
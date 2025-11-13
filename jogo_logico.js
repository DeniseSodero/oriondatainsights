/* ===================================
   jogo_logico.js (VERSÃO ALEATÓRIA)
   - Lógica de Verificação de Solução
   =================================== */

// --- Variáveis Globais ---
let ferramentaAtiva = 'sim'; // 'sim' (✓) ou 'nao' (X)
let solucaoCorreta = [];     // Vai guardar o gabarito
let categoriasPuzzle = {};   // Vai guardar as categorias
let modalResultado = null;   // Referência para o modal do Bootstrap

// --- Inicialização ---
document.addEventListener('DOMContentLoaded', () => {
  // MUDANÇA: Chamamos a nova função de inicialização
  iniciarJogoAleatorio();
  
  configurarPaleta();
  
  document.getElementById('btn-verificar').addEventListener('click', verificarSolucao);
  
  modalResultado = new bootstrap.Modal(document.getElementById('modal-resultado'));
});

/**
 * Configura os botões da paleta de ferramentas
 */
function configurarPaleta() {
  const btnSim = document.getElementById('btn-tool-sim');
  const btnNao = document.getElementById('btn-tool-nao');

  btnSim.addEventListener('click', () => {
    ferramentaAtiva = 'sim';
    btnSim.classList.add('active');
    btnNao.classList.remove('active');
  });

  btnNao.addEventListener('click', () => {
    ferramentaAtiva = 'nao';
    btnNao.classList.add('active');
    btnSim.classList.remove('active');
  });
}

/**
 * MUDANÇA: Carrega a LISTA de puzzles, sorteia UM, e o processa.
 */
async function iniciarJogoAleatorio() {
  // Caminho para o NOVO arquivo JSON
  const caminhoDaLista = 'puzzles/lista_de_puzzles.json'; 

  try {
    const response = await fetch(caminhoDaLista);
    if (!response.ok) {
      throw new Error(`Erro ao carregar a lista de puzzles: ${response.statusText}`);
    }
    const listaDePuzzles = await response.json();

    // Sorteia um puzzle da lista
    const indiceAleatorio = Math.floor(Math.random() * listaDePuzzles.length);
    const puzzleSorteado = listaDePuzzles[indiceAleatorio];

    // Processa o puzzle que foi sorteado
    processarPuzzleSorteado(puzzleSorteado);

  } catch (error) {
    console.error("Não foi possível carregar a lista de puzzles:", error);
    document.getElementById('pistas-container').innerHTML = 
      '<li class="list-group-item list-group-item-danger">Erro ao carregar a lista de puzzles. Verifique se o arquivo "puzzles/lista_de_puzzles.json" existe.</li>';
  }
}

/**
 * MUDANÇA: Esta função contém a lógica que estava em 'carregarPuzzle'.
 * Ela é chamada DEPOIS que um puzzle é sorteado.
 */
function processarPuzzleSorteado(puzzle) {
  // Guarda a solução e categorias globalmente
  solucaoCorreta = puzzle.solucao;
  categoriasPuzzle = puzzle.categorias;

  // Constrói a interface
  construirPistas(puzzle.pistas);
  construirGrade(puzzle.categorias);
}


// ======================================================
// NENHUMA MUDANÇA NECESSÁRIA DAQUI PARA BAIXO
// (O restante do seu código original)
// ======================================================

function construirPistas(pistas) {
  const container = document.getElementById('pistas-container');
  container.innerHTML = ''; 
  pistas.forEach((pista, index) => {
    const li = document.createElement('li');
    li.className = 'list-group-item';
    li.textContent = `${index + 1}. ${pista}`;
    container.appendChild(li);
  });
}

function construirGrade(categorias) {
  const container = document.getElementById('grid-container');
  container.innerHTML = ''; 

  const nomesCategorias = Object.keys(categorias); 
  const combinacoes = [];
  for (let i = 0; i < nomesCategorias.length; i++) {
    for (let j = i + 1; j < nomesCategorias.length; j++) {
      const cat1 = nomesCategorias[i];
      const cat2 = nomesCategorias[j];
      combinacoes.push({
        nomeVertical: cat1,
        nomeHorizontal: cat2,
        itensVertical: categorias[cat1],
        itensHorizontal: categorias[cat2]
      });
    }
  }

  combinacoes.forEach(par => {
    const tabela = criarUmaTabela(
      par.nomeVertical, 
      par.nomeHorizontal, 
      par.itensVertical, 
      par.itensHorizontal
    );
    container.appendChild(tabela);
  });

  container.addEventListener('click', aoClicarNaCelula); 
}

function criarUmaTabela(nomeCatVertical, nomeCatHorizontal, itensCatVertical, itensCatHorizontal) {
  const table = document.createElement('table');
  table.className = 'table table-bordered mb-4'; 

  const thead = document.createElement('thead');
  const headerRow = document.createElement('tr');
  
  const thCanto = document.createElement('th');
  thCanto.innerHTML = `<span class="cat-vert">${nomeCatVertical}</span> / <span class="cat-horiz">${nomeCatHorizontal}</span>`; 
  headerRow.appendChild(thCanto); 
  
  itensCatHorizontal.forEach(item => {
    const th = document.createElement('th');
    th.textContent = item;
    headerRow.appendChild(th);
  });
  thead.appendChild(headerRow);
  table.appendChild(thead);

  const tbody = document.createElement('tbody');
  
  itensCatVertical.forEach(itemVertical => {
    const tr = document.createElement('tr');
    
    const thVertical = document.createElement('th');
    thVertical.textContent = itemVertical;
    tr.appendChild(thVertical);

    itensCatHorizontal.forEach(itemHorizontal => {
      const td = document.createElement('td');
      td.className = 'clicavel'; 
      td.textContent = '';
      
      td.dataset.catVert = nomeCatVertical;
      td.dataset.itemVert = itemVertical;
      td.dataset.catHoriz = nomeCatHorizontal;
      td.dataset.itemHoriz = itemHorizontal;

      tr.appendChild(td);
    });
    
    tbody.appendChild(tr);
  });
  table.appendChild(tbody);
  
  return table; 
}

function aoClicarNaCelula(event) {
  const celula = event.target;

  if (celula.tagName !== 'TD' || !celula.classList.contains('clicavel')) {
    return;
  }

  if (ferramentaAtiva === 'sim') {
    if (celula.textContent === '✓') {
      celula.textContent = '';
      celula.classList.remove('estado-sim');
    } else {
      celula.textContent = '✓';
      celula.classList.add('estado-sim');
      celula.classList.remove('estado-nao');
    }
  } 
  else if (ferramentaAtiva === 'nao') {
     if (celula.textContent === 'X') {
      celula.textContent = '';
      celula.classList.remove('estado-nao');
    } else {
      celula.textContent = 'X';
      celula.classList.add('estado-nao');
      celula.classList.remove('estado-sim');
    }
  }
}

// ======================================================
// FUNÇÃO DE VERIFICAÇÃO (INALTERADA)
// ======================================================

function verificarSolucao() {
  const paresCorretos = new Set();
  const nomesCategorias = Object.keys(categoriasPuzzle);

  solucaoCorreta.forEach(solucao => {
    for (let i = 0; i < nomesCategorias.length; i++) {
      for (let j = i + 1; j < nomesCategorias.length; j++) {
        const cat1 = nomesCategorias[i];
        const cat2 = nomesCategorias[j];
        
        const item1 = solucao[cat1];
        const item2 = solucao[cat2];
        const chave = [item1, item2].sort().join('-');
        paresCorretos.add(chave);
      }
    }
  });

  const todasAsCelulas = document.querySelectorAll('#grid-container td.clicavel');
  let estaCorreto = true;

  for (const celula of todasAsCelulas) {
    const item1 = celula.dataset.itemVert;
    const item2 = celula.dataset.itemHoriz;
    const chave = [item1, item2].sort().join('-');

    const usuarioMarcouSim = celula.textContent === '✓';
    const ehUmParCorreto = paresCorretos.has(chave);

    if (usuarioMarcouSim && !ehUmParCorreto) {
      estaCorreto = false;
      break; 
    }
    
    if (!usuarioMarcouSim && ehUmParCorreto) {
      estaCorreto = false;
      break; 
    }
  }

  mostrarResultado(estaCorreto);
}

function mostrarResultado(sucesso) {
  const icone = document.getElementById('modal-icone');
  const mensagem = document.getElementById('modal-mensagem');

  if (sucesso) {
    icone.className = 'fas fa-check-circle fa-5x text-success mb-3'; 
    mensagem.textContent = 'Parabéns! Você resolveu o puzzle!';
  } else {
    icone.className = 'fas fa-times-circle fa-5x text-danger mb-3'; 
    mensagem.textContent = 'Quase lá! Parece que há um erro. Revise suas respostas.';
  }

  modalResultado.show();
}
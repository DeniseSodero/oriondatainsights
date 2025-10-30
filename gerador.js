/* ===================================
   gerador.js (O Gerador de Puzzles)
   VERSÃO 1.0
   =================================== */

// --- 1. IMPORTAÇÕES ---
const fs = require('fs');
// Usaremos 'path' para garantir que os arquivos sejam salvos na pasta correta
const path = require('path');

// Importamos nosso banco de ingredientes
const { ingredientes } = require('./dados.js');


// --- 2. CONFIGURAÇÃO DAS "RECEITAS" DE DIFICULDADE ---
const receitasDeDificuldade = {
  "facil": {
    tamanho: 3, 
    mixPistas: { "tipo1_negacao_direta": 0.8, "tipo2_afirmacao_relacional": 0.2, "tipo3_negacao_relacional": 0.0 }
  },
  "medio": {
    tamanho: 3, 
    mixPistas: { "tipo1_negacao_direta": 0.0, "tipo2_afirmacao_relacional": 0.6, "tipo3_negacao_relacional": 0.4 }
  },
  "dificil": {
    tamanho: 4, 
    mixPistas: { "tipo1_negacao_direta": 0.0, "tipo2_afirmacao_relacional": 0.5, "tipo3_negacao_relacional": 0.5 }
  }
};


// --- 3. MAPA DE TEMAS ---
const mapaDeTemas = {
  "Almoço em Família": ["pessoas", "parentesco", "comidas.sucos"],
  "Mistério na Escola": ["profissoes", "pessoas", "locais.escola"],
  "Passeio com Amigos": ["pessoas", "brincadeiras", "locais.passeio"],
  "Brincadeiras de Crianças": ["pessoas", "brincadeiras", "locais.casa"],
  "Programas de TV": ["pessoas", "programas_tv", "comidas.salgados"],
  "Escolha de Carreira": ["pessoas", "profissoes", "locais.cidade"]
};


// --- 4. FUNÇÃO PRINCIPAL (O "COZINHEIRO") ---

function gerarPuzzle(tema, dificuldade) {
  console.log(`Gerando puzzle: ${tema} (${dificuldade})...`);

  // 1. Pegar a receita e os ingredientes
  const receita = receitasDeDificuldade[dificuldade];
  const caminhosDasCategorias = mapaDeTemas[tema];
  const nomesDasCategorias = caminhosDasCategorias.map(c => c.split('.').pop());

  // 2. Montar as listas de itens
  const categoriasDoPuzzle = {};
  const listasDeItens = [];

  for (let i = 0; i < caminhosDasCategorias.length; i++) {
    const caminho = caminhosDasCategorias[i];
    const nomeCategoria = nomesDasCategorias[i];
    const listaDeIngredientes = getItensFromPath(ingredientes, caminho);
    
    if (!listaDeIngredientes || listaDeIngredientes.length < receita.tamanho) {
      console.error(`Erro: Ingredientes insuficientes para a categoria "${caminho}".`);
      return null;
    }
    
    const itensAleatorios = getRandomItems(listaDeIngredientes, receita.tamanho);
    categoriasDoPuzzle[nomeCategoria] = itensAleatorios;
    listasDeItens.push(itensAleatorios);
  }

  // 3. Gerar a Solução Secreta (Gabarito)
  const solucao = gerarSolucao(listasDeItens);

  // 4. Gerar as Pistas
  const pistasGeradas = [];
  let puzzleSolucionavel = false;
  let tentativas = 0; // Trava de segurança

  while (!puzzleSolucionavel && tentativas < 100) {
    const tipoDePista = escolherTipoDePista(receita.mixPistas);
    const novaPista = gerarFraseDaPista(tipoDePista, solucao, categoriasDoPuzzle);

    if (novaPista && !pistasGeradas.includes(novaPista)) {
      pistasGeradas.push(novaPista);
      puzzleSolucionavel = verificarSolucionavel(pistasGeradas, solucao, categoriasDoPuzzle, receita);
    }
    tentativas++;
  }

  // 5. Formatar o JSON final
  const puzzleJSON = {
    id: `puzzle_${tema.replace(/ /g, '_')}_${new Date().getTime()}`,
    tema: tema,
    nivel: dificuldade,
    categorias: categoriasDoPuzzle,
    pistas: pistasGeradas
    // NUNCA incluir a 'solucao' no JSON final
  };

  return puzzleJSON;
}


// --- 5. FUNÇÕES AUXILIARES (IMPLEMENTAÇÃO DOS TODOs) ---

/** Embaralha uma lista (Algoritmo Fisher-Yates) */
function shuffle(array) {
  let newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}

/** Pega um item de um objeto usando um caminho (ex: "comidas.sucos") */
function getItensFromPath(obj, path) {
  return path.split('.').reduce((acc, part) => acc && acc[part], obj);
}

/** Pega N itens aleatórios de uma lista */
function getRandomItems(lista, n) {
  return shuffle(lista).slice(0, n);
}

/** [GERADO O TODO 1] Cria a Solução Secreta (o gabarito) */
function gerarSolucao(listasDeItens) {
  const solucao = {};
  const listaPivo = listasDeItens[0]; // ex: Pessoas
  const listasSecundarias = listasDeItens.slice(1);
  
  // Embaralha as listas secundárias
  const listasEmbaralhadas = listasSecundarias.map(lista => shuffle(lista));

  // Conecta os itens
  for (let i = 0; i < listaPivo.length; i++) {
    const itemPivo = listaPivo[i]; // ex: "Clara"
    const conexoes = [];
    
    // Pega o item correspondente de cada lista embaralhada
    for (const lista of listasEmbaralhadas) {
      conexoes.push(lista[i]); // ex: "Laranja", "Coxinha"
    }
    solucao[itemPivo] = conexoes;
  }
  
  // solucao = { Clara: ["Laranja", "Coxinha"], Daniel: ["Uva", "Pastel"], ... }
  return solucao;
}

/** [GERADO O TODO 2] Escolhe qual tipo de pista gerar com base nas probabilidades */
function escolherTipoDePista(mixPistas) {
  const rand = Math.random();
  let limite = 0;

  for (const tipo in mixPistas) {
    limite += mixPistas[tipo];
    if (rand < limite) {
      return tipo;
    }
  }
  return Object.keys(mixPistas)[0]; // Fallback
}

/** [GERADO O TODO 3] O cérebro que escreve as frases (os "moldes") */
function gerarFraseDaPista(tipoDePista, solucao, categorias) {
  const [catPivo, cat1, cat2] = Object.keys(categorias);
  const [itensPivo, itensCat1, itensCat2] = Object.values(categorias);

  // Pega um item pivô aleatório (ex: "Clara")
  const itemPivo = getRandomItems(itensPivo, 1)[0];
  // Pega as soluções corretas para o pivô (ex: "Laranja", "Coxinha")
  const [solucaoCat1, solucaoCat2] = solucao[itemPivo];

  switch (tipoDePista) {
    
    case "tipo1_negacao_direta": {
      // "A Clara não pediu Uva."
      // Pega um item aleatório da cat1 que NÃO seja a solução
      const itemIncorreto = getRandomItems(itensCat1.filter(item => item !== solucaoCat1), 1)[0];
      if (!itemIncorreto) return null; // Caso não haja item incorreto
      return `${itemPivo} não está com ${itemIncorreto}.`;
    }

    case "tipo2_afirmacao_relacional": {
      // "Quem pediu Laranja também comeu Coxinha."
      // Simplesmente afirma a verdade da solução
      return `Quem está com ${solucaoCat1} também está com ${solucaoCat2}.`;
    }

    case "tipo3_negacao_relacional": {
      // "Quem pediu Laranja NÃO comeu Pastel."
      // Pega a solução correta (Laranja, Coxinha)
      // Pega um item incorreto da cat2 (ex: "Pastel")
      const itemIncorretoCat2 = getRandomItems(itensCat2.filter(item => item !== solucaoCat2), 1)[0];
      if (!itemIncorretoCat2) return null;
      return `Quem está com ${solucaoCat1} não está com ${itemIncorretoCat2}.`;
    }
    
    default:
      return null;
  }
}

/** [PLACEHOLDER] O SOLUCIONADOR */
function verificarSolucionavel(pistas, solucao, categorias, receita) {
  // TODO: Esta é a parte mais complexa.
  // Por enquanto, vamos usar um placeholder simples.
  // Um puzzle 3x3 precisa de pelo menos 2 pistas relacionais.
  if (receita.tamanho === 3) {
    return pistas.length >= 3;
  }
  if (receita.tamanho === 4) {
    return pistas.length >= 5;
  }
  return false;
}


// --- 6. PONTO DE ENTRADA (IGNIÇÃO) ---
function main() {
  console.log("Iniciando Gerador de Puzzles...");

  // 1. Definir o que queremos gerar
  const temaEscolhido = "Passeio com Amigos"; // Mude aqui para testar
  const dificuldadeEscolhida = "medio";   // Mude aqui para testar
  const numeroDePuzzles = 1;            // Mude aqui para gerar mais

  // Define onde salvar os puzzles (na pasta /Site/puzzles/)
  const diretorioSaida = path.join(__dirname, '..', 'orion_aplicativos', 'puzzles');

  // Cria a pasta /puzzles/ se ela não existir
  if (!fs.existsSync(diretorioSaida)) {
    fs.mkdirSync(diretorioSaida, { recursive: true });
  }

  for (let i = 0; i < numeroDePuzzles; i++) {
    const novoPuzzle = gerarPuzzle(temaEscolhido, dificuldadeEscolhida);
    
    if (novoPuzzle) {
      const nomeArquivo = `puzzle_${novoPuzzle.id}.json`;
      const caminhoCompleto = path.join(diretorioSaida, nomeArquivo);
      
      fs.writeFileSync(caminhoCompleto, JSON.stringify(novoPuzzle, null, 2));
      console.log(`- Sucesso! Puzzle salvo em: /Site/puzzles/${nomeArquivo}`);
    } else {
      console.log(`- Falha ao gerar puzzle para o tema: ${temaEscolhido}`);
    }
  }

  console.log("Geração concluída.");
}

// Roda a função principal
main();
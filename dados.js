/* ===================================
   dados.js (Banco de Ingredientes)
   VERSÃO 2.0 - ATUALIZADA
   =================================== */

const ingredientes = {

  // === 1. CATEGORIAS GENÉRICAS ===
  // (Podem ser usadas em quase qualquer tema)

  pessoas: [
    "Clara", "Daniel", "Sofia", "Lucas", "Beatriz", "Denise", "Solange",
    "Cecilia", "Rodrigo", "Juliana", "Juliene", "Jack", "Derek", "Maria",
    "Ester", "Reinaldo", "Ana", "Paula", "Bernardo", "Enzo", "Gabriel", "Artur"
  ],

  cores: [
    "Vermelho", "Azul", "Verde", "Amarelo", "Roxo", "Ciano",
    "Preto", "Cinza", "Branco", "Laranja"
  ],

  profissoes: [
    "Médico", "Professor", "Detetive", "Músico", "Cozinheiro", "Enfermeiro",
    "Programador", "Dançarino", "Vendedor", "Motorista", "Cientista",
    "Astronauta", "Empreendedor", "Empresário"
  ],

  // === 2. CATEGORIAS TEMÁTICAS ===
  // (Usadas para temas específicos)

  locais: {
    // Para temas como "Arrumando a Casa", "Almoço em Família"
    casa: ["Cozinha", "Garagem", "Quarto", "Jardim"],

    // Para temas como "Mistério na Escola"
    escola: ["Diretoria", "Sala de Aula", "Banheiro", "Lanchonete", "Biblioteca"],

    // Para temas como "Escolha de Carreira"
    cidade: ["Parque", "Consultório", "Escritório", "Estacionamento"],

    // NOVO: Para temas como "Passeio com Amigos"
    passeio: ["Praia", "Museu", "Praça", "Shopping Center", "Restaurante", "Montanha", "Show", "Horto", "Jardim", "Cinema"]
  },

  comidas: {
    salgados: ["Coxinha", "Empada", "Pão de Queijo", "Pastel", "Kibe", "Enrolado", "Esfiha"],
    sucos: ["Laranja", "Uva", "Morango", "Limão", "Abacaxi", "Graviola", "Cupuaçi", "Cacau"],
    doces: ["brigadeiro", "quindim", "muffim", "cupcake", "beijinho", "bolo", "pudim", "torta"]
  },

  // === 3. CATEGORIAS ADICIONAIS (AGORA PREENCHIDAS) ===

  // Para temas como "Almoço em Família"
  parentesco: [
    "Pai", "Mãe", "Tio", "Prima", "Avô", "Filho", "Filha", "Avó",
    "Primo", "Tia", "Sobrinho", "Sobrinha", "Neto", "Neta"
  ],

  // Para temas como "Brincadeiras de Crianças"
  brincadeiras: [
    "Pega-pega", "Esconde-esconde", "Videogame", "Quebra-cabeça",
    "Jogar bola", "Pular corda", "Jogar Cartas", "Jogo de Tabuleiro"
  ],

  // Para temas como "Programas de TV"
  programas_tv: [
    "Novela", "Jornal", "Documentário", "Filme de Ficção", "Filme Romântico",
    "Filme de Aventura", "Filme de Drama", "Filme Épico", "Desenho Animado",
    "Filme", "Reality Show"
  ]
};

// Adicione esta linha no final do arquivo dados.js
module.exports = { ingredientes };
// Espera o documento carregar antes de rodar o script
document.addEventListener('DOMContentLoaded', () => {

  // Referências para o jsPDF e html2canvas (para facilitar)
  const { jsPDF } = window.jspdf;
  const h2c = window.html2canvas;

  // --- Parte 1: Selecionar os Elementos do Formulário ---
  const form = document.getElementById('form-calendario-web');
  const listaAniversariantesDiv = document.getElementById('lista-aniversariantes-web');
  const btnAddPessoa = document.getElementById('btn-add-aniversariante-web');
  const mesSelect = document.getElementById('mes-calendario');
  const anoInput = document.getElementById('ano-calendario');
  const submitButton = form.querySelector('button[type="submit"]');

  // Nomes dos meses e dias da semana para o grid
  const MESES = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
  const DIAS_SEMANA = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

  // --- Parte 2: Lógica do Botão "Adicionar Pessoa" ---
  if (btnAddPessoa) {
    btnAddPessoa.addEventListener('click', () => {
      // Clona o primeiro item (ou o último)
      const primeiroItem = listaAniversariantesDiv.querySelector('.aniversariante-item');
      const novoItem = primeiroItem.cloneNode(true);

      // Limpa os valores do item clonado
      novoItem.querySelectorAll('input').forEach(input => {
        input.value = '';
      });

      // Adiciona um botão de remover (opcional, mas bom)
      const btnRemover = document.createElement('button');
      btnRemover.type = 'button';
      btnRemover.className = 'btn btn-danger btn-sm col-auto'; // Estilo Bootstrap
      btnRemover.innerHTML = '<i class="fas fa-trash"></i>';
      btnRemover.style.height = 'fit-content';
      btnRemover.style.alignSelf = 'center';
      btnRemover.onclick = () => novoItem.remove();

      // Ajusta o layout para incluir o botão de remover
      const fileInput = novoItem.querySelector('.col-6');
      fileInput.classList.remove('col-6');
      fileInput.classList.add('col-5'); // Reduz para caber o botão
      
      novoItem.appendChild(btnRemover);
      novoItem.classList.add('g-2'); // Ajusta o espaçamento

      listaAniversariantesDiv.appendChild(novoItem);
    });
  }

  // --- Parte 3: Lógica do "Gerar PDF" (Submit do Formulário) ---
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault(); // Impede o recarregamento da página
      if (submitButton) {
        submitButton.disabled = true;
        submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Gerando...';
      }

      try {
        const mes = parseInt(mesSelect.value, 10);
        const ano = parseInt(anoInput.value, 10);
        const mesNome = MESES[mes];

        // 1. Ler os dados dos aniversariantes (incluindo imagens)
        const aniversariantes = await lerDadosAniversariantes();

        // 2. Construir o HTML do grid do calendário
        const calendarioHtml = construirGridCalendario(mes, ano, aniversariantes);

        // 3. Criar e injetar o HTML temporário no DOM
        const container = document.createElement('div');
        container.className = 'calendario-pdf-container';
        container.innerHTML = calendarioHtml;
        document.body.appendChild(container);

        // 4. Gerar o PDF usando html2canvas
        const canvas = await h2c(container, {
            useCORS: true, // Permite carregar imagens
            scale: 2      // Melhora a resolução
        });
        const imgData = canvas.toDataURL('image/png');

        const pdf = new jsPDF({
          orientation: 'portrait', // Retrato
          unit: 'px',
          format: 'a4' // Formato A4
        });

        // Adiciona a imagem (canvas) ao PDF
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);

        // 5. Salvar o PDF
        pdf.save(`Calendario_${mesNome}_${ano}.pdf`);

        // 6. Limpar o container temporário
        document.body.removeChild(container);

      } catch (error) {
        console.error('Erro ao gerar PDF:', error);
        alert('Ocorreu um erro ao gerar o PDF. Verifique o console para mais detalhes.');
      } finally {
        // Restaura o botão
        if (submitButton) {
          submitButton.disabled = false;
          submitButton.innerHTML = '<i class="fas fa-file-pdf"></i> Gerar PDF';
        }
      }
    });
  }

  /**
   * Lê os dados do formulário, incluindo a conversão de imagens para Base64.
   * Usa Promises para aguardar todas as imagens carregarem.
   */
  async function lerDadosAniversariantes() {
    const itens = listaAniversariantesDiv.querySelectorAll('.aniversariante-item');
    const promessas = Array.from(itens).map(item => {
      const nomeInput = item.querySelector('input[aria-label="Nome"]');
      const diaInput = item.querySelector('input[aria-label="Dia"]');
      const fotoInput = item.querySelector('input[aria-label="Foto"]');

      // Se não tiver nome ou dia, pula
      if (!nomeInput.value || !diaInput.value) {
        return Promise.resolve(null);
      }

      const nome = nomeInput.value;
      const dia = parseInt(diaInput.value, 10);
      const fotoFile = fotoInput.files[0];

      if (fotoFile) {
        // Se tiver foto, lê como DataURL (Base64)
        return lerArquivoComoDataURL(fotoFile).then(fotoDataUrl => ({
          dia,
          nome,
          foto: fotoDataUrl
        }));
      } else {
        // Se não tiver foto, resolve imediatamente
        return Promise.resolve({ dia, nome, foto: null });
      }
    });

    // Espera todas as leituras de arquivo terminarem
    const resultados = await Promise.all(promessas);
    // Filtra os nulos (campos não preenchidos)
    return resultados.filter(r => r !== null);
  }

  /**
   * Helper que transforma um File (de um input) em DataURL (Base64)
   * usando uma Promise.
   */
  function lerArquivoComoDataURL(arquivo) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(arquivo);
    });
  }

  /**
   * Cria a string HTML do grid do calendário.
   */
  function construirGridCalendario(mes, ano, aniversariantes) {
    const primeiroDiaMes = new Date(ano, mes, 1).getDay(); // 0 (Dom) - 6 (Sáb)
    const diasNoMes = new Date(ano, mes + 1, 0).getDate(); // Pega o último dia do mês
    const mesNome = MESES[mes];

    let html = `<h2>${mesNome} ${ano}</h2>`;
    html += '<div class="calendario-grid">';

    // 1. Cabeçalho (Dias da Semana)
    DIAS_SEMANA.forEach(dia => {
      html += `<div class="dia-semana">${dia}</div>`;
    });

    // 2. Células de preenchimento (dias do mês anterior)
    for (let i = 0; i < primeiroDiaMes; i++) {
      html += '<div class="dia-celula outro-mes"></div>';
    }

    // 3. Células dos Dias do Mês
    for (let dia = 1; dia <= diasNoMes; dia++) {
      html += `<div class="dia-celula" data-dia="${dia}">`;
      html += `<div class="dia-numero">${dia}</div>`;

      // Verifica se há aniversariantes para este dia
      const aniversariantesDoDia = aniversariantes.filter(a => a.dia === dia);
      aniversariantesDoDia.forEach(pessoa => {
        html += '<div class="aniversariante-pdf">';
        if (pessoa.foto) {
          html += `<img src="${pessoa.foto}" alt="${pessoa.nome}">`;
        }
        html += `<span>${pessoa.nome}</span>`;
        html += '</div>';
      });

      html += '</div>';
    }

    // 4. Células de preenchimento (dias do próximo mês)
    const totalCelulas = primeiroDiaMes + diasNoMes;
    const celulasFaltantes = (totalCelulas % 7 === 0) ? 0 : 7 - (totalCelulas % 7);
    for (let i = 0; i < celulasFaltantes; i++) {
        html += '<div class="dia-celula outro-mes"></div>';
    }

    html += '</div>'; // Fecha .calendario-grid
    return html;
  }
});
// Espera o documento carregar antes de rodar o script
document.addEventListener('DOMContentLoaded', () => {

  // Referências para as bibliotecas
  const { jsPDF } = window.jspdf;
  const h2c = window.html2canvas;
  const Cropper = window.Cropper;

  // --- Seletores do Formulário ---
  const form = document.getElementById('form-calendario-web');
  const listaAniversariantesDiv = document.getElementById('lista-aniversariantes-web');
  const btnAddPessoa = document.getElementById('btn-add-aniversariante-web');
  const mesSelect = document.getElementById('mes-calendario');
  const anoInput = document.getElementById('ano-calendario');

  // --- Seletores do Preview ---
  const btnPreview = document.getElementById('btn-gerar-preview');
  const previewSection = document.getElementById('preview-section');
  const previewArea = document.getElementById('calendario-preview-area');
  const btnBaixarPDF = document.getElementById('btn-baixar-pdf');

  // --- NOVOS Seletores para o Cropper (Modal) ---
  const cropperModalElement = document.getElementById('cropper-modal');
  const cropperModal = new bootstrap.Modal(cropperModalElement);
  const cropperImage = document.getElementById('cropper-image');
  const btnSalvarRecorte = document.getElementById('btn-salvar-recorte');
  let cropperInstance = null;
  let currentFileInput = null; // Guarda qual input de arquivo está sendo editado

  // Nomes dos meses e dias (sem alteração)
  const MESES = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
  const DIAS_SEMANA = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

  /**
   * INICIA OS LISTENERS DE ARQUIVO
   * Anexa o listener de 'change' a todos os inputs de foto.
   */
  function initFileInputListeners(container) {
    const inputs = container.querySelectorAll('input[type="file"][aria-label="Foto"]');
    inputs.forEach(input => {
      // Remove listener antigo para evitar duplicatas (caso exista)
      input.removeEventListener('change', handleImageUpload);
      // Adiciona o novo listener
      input.addEventListener('change', handleImageUpload);
    });
  }
  
  // Inicia os listeners para os inputs que já existem na página
  initFileInputListeners(listaAniversariantesDiv);

  /**
   * (NOVO) LÓGICA DE UPLOAD E ABERTURA DO CROPPER
   * Chamado quando qualquer input de foto é alterado.
   */
  async function handleImageUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    // Guarda qual input estamos editando
    currentFileInput = event.target; 

    // 1. Lê o arquivo para mostrar no modal
    try {
      const imageDataUrl = await lerArquivoComoDataURL(file);
      
      // 2. Abre o Modal
      cropperImage.src = imageDataUrl;
      cropperModal.show();

      // 3. Inicializa o Cropper.js (destrói o antigo se existir)
      if (cropperInstance) {
        cropperInstance.destroy();
      }

      cropperInstance = new Cropper(cropperImage, {
        aspectRatio: 1 / 1, // Força um recorte quadrado (bom para círculos)
        viewMode: 2,        // Permite zoom mas não deixa sair da área
        background: false,  // Remove o grid de fundo
        autoCropArea: 0.9   // Começa com 90% da área selecionada
      });

    } catch (e) {
      console.error("Erro ao ler arquivo para o cropper:", e);
      alert("Não foi possível carregar a imagem para recortar.");
    }
  }

  /**
   * (NOVO) LÓGICA PARA SALVAR O RECORTE
   * Chamado quando o botão "Salvar Recorte" no modal é clicado.
   */
  if (btnSalvarRecorte) {
    btnSalvarRecorte.addEventListener('click', () => {
      if (!cropperInstance || !currentFileInput) return;

      // 1. Pega o canvas recortado (com 300x300px, bom para qualidade)
      const croppedCanvas = cropperInstance.getCroppedCanvas({
        width: 300,
        height: 300,
      });

      // 2. Converte para Base64 (JPG para economizar espaço)
      const croppedBase64 = croppedCanvas.toDataURL('image/jpeg', 0.9);

      // 3. (IMPORTANTE) Armazena o Base64 recortado no 'dataset'
      //    do input de arquivo original.
      currentFileInput.dataset.croppedImage = croppedBase64;
      
      // 4. (Opcional) Mostra um pequeno preview ao lado do input
      //    Vamos procurar por um preview no item-pai
      const parentItem = currentFileInput.closest('.aniversariante-item');
      let previewImg = parentItem.querySelector('.foto-preview');
      if (!previewImg) {
          // Se não existir, cria um
          previewImg = document.createElement('img');
          previewImg.className = 'foto-preview';
          previewImg.style = "width: 40px; height: 40px; border-radius: 50%; object-fit: cover; margin-left: 5px;";
          currentFileInput.parentElement.appendChild(previewImg);
      }
      previewImg.src = croppedBase64;

      // 5. Fecha o modal
      cropperModal.hide();
      cropperInstance.destroy();
      currentFileInput = null;
    });
  }

  /**
   * LÓGICA DO "ADICIONAR PESSOA" (Atualizada)
   * Agora, ele também precisa iniciar o listener de arquivo no novo item.
   */
  if (btnAddPessoa) {
    btnAddPessoa.addEventListener('click', () => {
      const primeiroItem = listaAniversariantesDiv.querySelector('.aniversariante-item');
      const novoItem = primeiroItem.cloneNode(true);

      // Limpa os valores
      novoItem.querySelectorAll('input').forEach(input => {
        input.value = '';
        delete input.dataset.croppedImage; // Limpa o crop salvo
      });
      // Remove o preview da foto clonada
      novoItem.querySelector('.foto-preview')?.remove();
      
      const btnRemover = document.createElement('button');
      btnRemover.type = 'button';
      btnRemover.className = 'btn btn-danger btn-sm col-auto';
      btnRemover.innerHTML = '<i class="fas fa-trash"></i>';
      btnRemover.style.height = 'fit-content';
      btnRemover.style.alignSelf = 'center';
      btnRemover.onclick = () => novoItem.remove();

      const fileInputContainer = novoItem.querySelector('.col-6');
      if (fileInputContainer) {
          fileInputContainer.classList.remove('col-6');
          fileInputContainer.classList.add('col-5'); // Ajusta espaço
      }
      
      novoItem.appendChild(btnRemover);
      novoItem.classList.add('g-2'); 

      listaAniversariantesDiv.appendChild(novoItem);

      // *** INICIA O LISTENER NO NOVO ITEM ***
      initFileInputListeners(novoItem);
    });
  }

  /**
   * LER DADOS (Atualizado)
   * Agora lê o 'dataset.croppedImage' em vez do arquivo.
   */
  async function lerDadosAniversariantes() {
    const itens = listaAniversariantesDiv.querySelectorAll('.aniversariante-item');
    // Não precisamos mais de 'async/await' aqui, pois os dados já estão prontos.
    const resultados = Array.from(itens).map(item => {
      const nomeInput = item.querySelector('input[aria-label="Nome"]');
      const diaInput = item.querySelector('input[aria-label="Dia"]');
      const fotoInput = item.querySelector('input[aria-label="Foto"]');

      if (!nomeInput.value || !diaInput.value) {
        return null;
      }

      const nome = nomeInput.value;
      const dia = parseInt(diaInput.value, 10);
      
      // *** MUDANÇA PRINCIPAL ***
      // Pega a imagem recortada que salvamos no 'dataset'.
      // Se não existir, (pessoa não enviou foto), fica nulo.
      const fotoDataUrl = fotoInput.dataset.croppedImage || null;

      return { dia, nome, foto: fotoDataUrl };
    });

    return resultados.filter(r => r !== null);
  }

  /* * ==========================================================
   * O RESTANTE DO CÓDIGO (PREVIEW, DOWNLOAD, GRID)
   * Permanece exatamente igual à Fase 1, pois ele 
   * apenas consome os dados que 'lerDadosAniversariantes' entrega.
   * ==========================================================
   */

  // --- Lógica: "Pré-visualizar Calendário" ---
  if (btnPreview) {
    btnPreview.addEventListener('click', async () => {
      btnPreview.disabled = true;
      btnPreview.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Gerando...';
      try {
        const mes = parseInt(mesSelect.value, 10);
        const ano = parseInt(anoInput.value, 10);
        
        // Esta função agora é síncrona, mas mantemos o 'await' caso mude no futuro
        const aniversariantes = await lerDadosAniversariantes(); 
        
        const calendarioHtml = construirGridCalendario(mes, ano, aniversariantes);
        const container = document.createElement('div');
        container.className = 'calendario-pdf-container';
        container.style.position = 'relative';
        container.style.left = 'auto'; 
        container.innerHTML = calendarioHtml;

        previewArea.innerHTML = ''; 
        previewArea.appendChild(container);
        previewSection.style.display = 'block';
        previewSection.scrollIntoView({ behavior: 'smooth' });

      } catch (error) {
        console.error('Erro ao gerar preview:', error);
        alert('Ocorreu um erro ao gerar a pré-visualização.');
      } finally {
        btnPreview.disabled = false;
        btnPreview.innerHTML = '<i class="fas fa-eye"></i> Pré-visualizar Calendário';
      }
    });
  }

  // --- Lógica: "Baixar PDF" ---
  if (btnBaixarPDF) {
    btnBaixarPDF.addEventListener('click', async () => {
      btnBaixarPDF.disabled = true;
      btnBaixarPDF.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Baixando...';
      try {
        const containerParaPDF = previewArea.querySelector('.calendario-pdf-container');
        if (!containerParaPDF) {
          throw new Error('Não foi possível encontrar o grid do calendário para gerar o PDF.');
        }
        const canvas = await h2c(containerParaPDF, {
            useCORS: true, 
            scale: 2      
        });
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF({
          orientation: 'portrait',
          unit: 'px',
          format: 'a4'
        });
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
        const mes = parseInt(mesSelect.value, 10);
        const ano = parseInt(anoInput.value, 10);
        const mesNome = MESES[mes];
        pdf.save(`Calendario_${mesNome}_${ano}.pdf`);
      } catch (error) {
        console.error('Erro ao baixar PDF:', error);
        alert('Ocorreu um erro ao baixar o PDF.');
      } finally {
        btnBaixarPDF.disabled = false;
        btnBaixarPDF.innerHTML = '<i class="fas fa-file-pdf"></i> Baixar PDF';
        previewSection.style.display = 'none'; // Limpa o preview
      }
    });
  }

  /**
   * Helper que transforma um File (de um input) em DataURL (Base64)
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

    DIAS_SEMANA.forEach(dia => {
      html += `<div class="dia-semana">${dia}</div>`;
    });

    for (let i = 0; i < primeiroDiaMes; i++) {
      html += '<div class="dia-celula outro-mes"></div>';
    }

    for (let dia = 1; dia <= diasNoMes; dia++) {
      html += `<div class="dia-celula" data-dia="${dia}">`;
      html += `<div class="dia-numero">${dia}</div>`;

      const aniversariantesDoDia = aniversariantes.filter(a => a.dia === dia);
      aniversariantesDoDia.forEach(pessoa => {
        html += '<div class="aniversariante-pdf">';
        if (pessoa.foto) {
          // A 'pessoa.foto' AGORA é o Base64 recortado
          html += `<img src="${pessoa.foto}" alt="${pessoa.nome}">`;
        }
        html += `<span>${pessoa.nome}</span>`;
        html += '</div>';
      });

      html += '</div>';
    }

    const totalCelulas = primeiroDiaMes + diasNoMes;
    const celulasFaltantes = (totalCelulas % 7 === 0) ? 0 : 7 - (totalCelulas % 7);
    for (let i = 0; i < celulasFaltantes; i++) {
        html += '<div class="dia-celula outro-mes"></div>';
    }

    html += '</div>'; // Fecha .calendario-grid
    return html;
  }
});
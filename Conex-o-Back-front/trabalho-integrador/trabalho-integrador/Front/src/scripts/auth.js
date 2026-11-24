// Funcoes compartilhadas pelas telas de login e cadastro (e pela loja).

// Quando o front roda pelo Live Server (porta 5501), a API fica na porta 3000.
// Quando roda pelo proprio backend (npm start), a API fica no mesmo endereco.
const apiBaseUrl = window.location.port === '5501'
    ? `${window.location.protocol}//${window.location.hostname}:3000/api`
    : '/api';

const CHAVE_SESSAO = 'ecoskin_usuario';

// Guarda id e nome do cliente logado no navegador.
function salvarSessao(usuario) {
    localStorage.setItem(CHAVE_SESSAO, JSON.stringify({
        id_cliente: usuario.id_cliente,
        nome: usuario.nome
    }));
}

function obterSessao() {
    try {
        return JSON.parse(localStorage.getItem(CHAVE_SESSAO));
    } catch {
        return null;
    }
}

function encerrarSessao() {
    localStorage.removeItem(CHAVE_SESSAO);
}

// Envia JSON para a API e devolve { ok, status, dados }.
async function enviarParaApi(rota, corpo) {
    const resposta = await fetch(`${apiBaseUrl}${rota}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(corpo)
    });

    let dados = {};
    try {
        dados = await resposta.json();
    } catch {
        // Resposta sem JSON: mantem objeto vazio.
    }

    return { ok: resposta.ok, status: resposta.status, dados };
}

// Mostra mensagem de erro/sucesso abaixo do formulario.
function mostrarMensagem(elemento, texto, tipo) {
    elemento.textContent = texto;
    elemento.dataset.tipo = tipo;
}

// Carrossel do lado esquerdo (so roda se a pagina tiver um).
function iniciarCarrossel() {
    const slidesContainer = document.getElementById('slides');
    if (!slidesContainer) return;

    const pontos = document.querySelectorAll('.ponto');
    const btnPrev = document.getElementById('prev');
    const btnNext = document.getElementById('next');
    const totalSlides = pontos.length;
    let indiceAtual = 0;

    function atualizarCarrossel(indice) {
        indiceAtual = (indice + totalSlides) % totalSlides;
        slidesContainer.style.transform = `translateX(-${indiceAtual * 100}%)`;
        pontos.forEach((ponto) => ponto.classList.remove('ativo'));
        pontos[indiceAtual].classList.add('ativo');
    }

    btnNext.addEventListener('click', () => atualizarCarrossel(indiceAtual + 1));
    btnPrev.addEventListener('click', () => atualizarCarrossel(indiceAtual - 1));
    pontos.forEach((ponto) => {
        ponto.addEventListener('click', () => {
            atualizarCarrossel(Number(ponto.dataset.index));
        });
    });

    setInterval(() => atualizarCarrossel(indiceAtual + 1), 4000);
}

iniciarCarrossel();

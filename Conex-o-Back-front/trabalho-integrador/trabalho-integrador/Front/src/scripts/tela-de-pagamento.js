const apiBaseUrl = window.location.port === '5501'
  ? `${window.location.protocol}//${window.location.hostname}:3000/api`
  : '/api';

let itensCarrinho = [];
let usuarioSessao = null;

try {
  usuarioSessao = JSON.parse(localStorage.getItem('ecoskin_usuario'));
} catch {
  usuarioSessao = null;
}

function formatarMoeda(valor) {
  return Number(valor).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  });
}

async function carregarCarrinho() {
  const resumo = document.getElementById('resumo-pagamento');

  if (!usuarioSessao || !usuarioSessao.id_cliente) {
    resumo.innerHTML = `
      <p class="mensagem-pagamento">Faça login para finalizar a compra.</p>
      <button type="button" class="btn-confirmar" onclick="location.href='/pages/login/'">Ir para Login</button>
    `;
    return;
  }

  try {
    const response = await fetch(
      `${apiBaseUrl}/carrinho/${usuarioSessao.id_cliente}`,
      { credentials: 'include' }
    );

    if (response.status === 401) {
      throw new Error('Sua sessão expirou. Faça login novamente.');
    }
    if (!response.ok) {
      throw new Error(`Não foi possível consultar o carrinho (HTTP ${response.status}).`);
    }

    itensCarrinho = await response.json();
    renderizarResumo();
  } catch (error) {
    resumo.innerHTML = `<p class="mensagem-pagamento">${error.message}</p>`;
  }
}

function renderizarResumo() {
  const resumo = document.getElementById('resumo-pagamento');

  if (itensCarrinho.length === 0) {
    resumo.innerHTML = `
      <p class="mensagem-pagamento">Seu carrinho está vazio.</p>
      <button type="button" class="btn-secundario" onclick="location.href='/'">Voltar à loja</button>
    `;
    return;
  }

  const total = itensCarrinho.reduce(
    (soma, item) => soma + Number(item.subtotal),
    0
  );

  resumo.innerHTML = `
    <strong>Itens da compra</strong>
    <ul>
      ${itensCarrinho.map(item => `
        <li>${item.quantidade}x ${item.nome} - ${formatarMoeda(item.subtotal)}</li>
      `).join('')}
    </ul>
    <div class="resumo-total">
      <span>Total</span>
      <strong>${formatarMoeda(total)}</strong>
    </div>
  `;
}

function selecionarPagamento(tipo, botaoClicado) {
  const botoes = document.querySelectorAll('.btn-opcao');
  botoes.forEach(btn => btn.classList.remove('ativo'));
  if (botaoClicado) botaoClicado.classList.add('ativo');

  const areaPagamento = document.getElementById('area-pagamento');
  areaPagamento.style.display = 'block';

  if (tipo === 'pix') {
    areaPagamento.innerHTML = `
      <div class="pix-box">
        <h3>Pagamento via Pix</h3>
        <p>Ao confirmar, o pedido será registrado no servidor.</p>
        <button type="button" class="btn-confirmar" onclick="confirmarCompra('PIX', 'Pix')">
          Confirmar pagamento Pix
        </button>
      </div>
    `;
  } else if (tipo === 'debito' || tipo === 'credito') {
    const titulo = tipo === 'debito' ? 'Cartão de Débito' : 'Cartão de Crédito';
    const campoParcelas = tipo === 'credito' ? `
      <div class="form-grupo">
        <label>Parcelas</label>
        <select id="select-parcelas">
          <option value="1x sem juros">1x sem juros</option>
          <option value="2x sem juros">2x sem juros</option>
          <option value="3x sem juros">3x sem juros</option>
        </select>
      </div>
    ` : '';

    areaPagamento.innerHTML = `
      <form onsubmit="finalizarCartao(event, '${titulo}')">
        <h3>${titulo}</h3>
        <div class="form-grupo">
          <label>Número do Cartão</label>
          <input type="text" id="num-cartao" placeholder="0000 0000 0000 0000" maxlength="19" required>
        </div>
        <div class="form-grupo">
          <label>Nome impresso no cartão</label>
          <input type="text" id="nome-cartao" placeholder="NOME COMPLETO" required>
        </div>
        <div class="linha-dupla">
          <div class="form-grupo">
            <label>Validade</label>
            <input type="text" placeholder="MM/AA" maxlength="5" required>
          </div>
          <div class="form-grupo">
            <label>CVV</label>
            <input type="text" placeholder="123" maxlength="4" required>
          </div>
        </div>
        ${campoParcelas}
        <button type="submit" class="btn-confirmar">Pagar no ${titulo}</button>
      </form>
    `;
  }
}

async function finalizarCartao(event, tipo) {
  event.preventDefault();
  const nome = document.getElementById('nome-cartao').value.toUpperCase();
  const numero = document.getElementById('num-cartao').value.replace(/\D/g, '');
  const selectParcelas = document.getElementById('select-parcelas');
  const condicao = selectParcelas ? selectParcelas.value : 'À vista';

  if (numero.length < 13) {
    alert('Informe um número de cartão válido.');
    return;
  }

  await confirmarCompra('CARTAO', `${tipo} (Final ${numero.slice(-4)})`, condicao, nome);
}

async function confirmarCompra(metodoPagamento, formaPagamento, condicao = 'À vista', pagador = 'Consumidor Final') {
  if (!usuarioSessao || !usuarioSessao.id_cliente) {
    alert('Faça login para finalizar a compra.');
    location.href = '/pages/login/';
    return;
  }
  if (itensCarrinho.length === 0) {
    alert('Seu carrinho está vazio.');
    return;
  }

  try {
    const response = await fetch(`${apiBaseUrl}/finalizar-compra`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ metodo_pagamento: metodoPagamento })
    });
    const dados = await response.json();

    if (!response.ok) {
      throw new Error(dados.error || dados.message || 'Não foi possível finalizar a compra.');
    }

    gerarNotaFiscal(
      formaPagamento,
      condicao,
      pagador,
      dados
    );
  } catch (error) {
    alert(error.message);
  }
}

function gerarNotaFiscal(formaPagamento, condicao, pagador, dados) {
  const container = document.querySelector('.pagamento-container');
  const agora = new Date();
  const dataHora = agora.toLocaleDateString('pt-BR') + ' às ' + agora.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  const total = Number(dados.valor_total);

  container.innerHTML = `
    <div class="nota-fiscal">
      <div class="nf-cabecalho">
        <span class="nf-selo">✔ Compra Confirmada</span>
        <h3>COMPROVANTE / NOTA FISCAL</h3>
        <p class="nf-numero">Compra Nº ${dados.id_compra}</p>
      </div>
      <div class="nf-linha"><span>Data/Hora:</span><strong>${dataHora}</strong></div>
      <div class="nf-linha"><span>Pagador:</span><strong>${pagador}</strong></div>
      <div class="nf-linha"><span>Forma de Pagamento:</span><strong>${formaPagamento}</strong></div>
      <div class="nf-linha"><span>Condição:</span><strong>${condicao}</strong></div>
      <div class="nf-linha"><span>Chave de acesso:</span><strong>${dados.chave_acesso}</strong></div>
      <div class="nf-linha"><span>Imposto estimado:</span><strong>${formatarMoeda(dados.valor_imposto)}</strong></div>
      <div class="nf-total">
        <span>VALOR TOTAL</span>
        <strong>${formatarMoeda(total)}</strong>
      </div>
      <div class="nf-acoes">
        <button type="button" class="btn-secundario" onclick="window.print()">Imprimir / Salvar PDF</button>
        <button type="button" class="btn-confirmar" onclick="location.href='/'">Voltar à loja</button>
      </div>
    </div>
  `;
}

document.addEventListener('DOMContentLoaded', carregarCarrinho);

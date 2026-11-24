// Envia os dados para POST /api/cadastro, que grava nas tabelas cliente e login.
const formCadastro = document.getElementById('form-cadastro');
const mensagemCadastro = document.getElementById('mensagem-cadastro');
const botaoCadastrar = document.getElementById('botao-cadastrar');
const campoSenha = document.getElementById('senha');
const campoConfirmar = document.getElementById('confirmar');

// Avisa no proprio campo quando as senhas nao batem.
function validarSenha() {
    if (campoSenha.value !== campoConfirmar.value) {
        campoConfirmar.setCustomValidity('As senhas não são iguais!');
    } else {
        campoConfirmar.setCustomValidity('');
    }
}

campoSenha.addEventListener('input', validarSenha);
campoConfirmar.addEventListener('input', validarSenha);

formCadastro.addEventListener('submit', async (evento) => {
    evento.preventDefault();
    validarSenha();
    if (!formCadastro.reportValidity()) return;

    const dados = {
        nome: document.getElementById('nome').value.trim(),
        email: document.getElementById('email').value.trim(),
        cpf_cnpj: document.getElementById('cpf').value.trim(),
        telefone: document.getElementById('telefone').value.trim(),
        senha: campoSenha.value
    };

    botaoCadastrar.disabled = true;
    mostrarMensagem(mensagemCadastro, 'Criando sua conta...', 'info');

    try {
        const { ok, dados: resposta } = await enviarParaApi('/cadastro', dados);

        if (!ok) {
            mostrarMensagem(mensagemCadastro, resposta.error || 'Não foi possível criar a conta.', 'erro');
            return;
        }

        const email = encodeURIComponent(dados.email);
        window.location.href = `../login/index.html?cadastro=ok&email=${email}`;
    } catch (erro) {
        mostrarMensagem(mensagemCadastro, 'Servidor indisponível. O backend está rodando?', 'erro');
    } finally {
        botaoCadastrar.disabled = false;
    }
});

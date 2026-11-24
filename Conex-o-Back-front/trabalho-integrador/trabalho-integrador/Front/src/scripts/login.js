// Envia e-mail e senha para POST /api/login e leva o usuario para a loja.
const formLogin = document.getElementById('form-login');
const mensagemLogin = document.getElementById('mensagem-login');
const botaoEntrar = document.getElementById('botao-entrar');

// Se acabou de se cadastrar, mostra o aviso e preenche o e-mail.
const parametros = new URLSearchParams(window.location.search);
if (parametros.get('cadastro') === 'ok') {
    mostrarMensagem(mensagemLogin, 'Conta criada! Agora é só entrar.', 'sucesso');
}
if (parametros.get('email')) {
    document.getElementById('email').value = parametros.get('email');
}

formLogin.addEventListener('submit', async (evento) => {
    evento.preventDefault();

    const email = document.getElementById('email').value.trim();
    const senha = document.getElementById('senha').value;

    botaoEntrar.disabled = true;
    mostrarMensagem(mensagemLogin, 'Entrando...', 'info');

    try {
        const { ok, dados } = await enviarParaApi('/login', { email, senha });

        if (!ok) {
            mostrarMensagem(mensagemLogin, dados.message || dados.error || 'Não foi possível entrar.', 'erro');
            return;
        }

        salvarSessao(dados);
        window.location.href = '../../index.html';
    } catch (erro) {
        mostrarMensagem(mensagemLogin, 'Servidor indisponível. O backend está rodando?', 'erro');
    } finally {
        botaoEntrar.disabled = false;
    }
});

module.exports = {
    validarDadosCliente: (req, res, next) => {
        const { nome, cpf_cnpj } = req.body;

        if (!nome || !cpf_cnpj) {
            return res.status(400).json({ 
                error: 'Nome e CPF/CNPJ são campos obrigatórios.' 
            });
        }

        next();
    },

    // Valida e normaliza os dados da tela de cadastro antes de tocar no banco.
    validarCadastro: (req, res, next) => {
        const texto = (valor) => (typeof valor === 'string' ? valor.trim() : '');
        const nome = texto(req.body.nome);
        const email = texto(req.body.email).toLowerCase();
        const cpfCnpj = texto(req.body.cpf_cnpj).replace(/\D/g, '');
        const telefone = texto(req.body.telefone).replace(/\D/g, '');
        const senha = typeof req.body.senha === 'string' ? req.body.senha : '';

        if (!nome || !email || !cpfCnpj || !senha) {
            return res.status(400).json({
                error: 'Nome, e-mail, CPF/CNPJ e senha sao obrigatorios.'
            });
        }

        if (nome.length > 150) {
            return res.status(400).json({ error: 'Nome muito longo.' });
        }

        if (email.length > 150 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return res.status(400).json({ error: 'E-mail invalido.' });
        }

        if (cpfCnpj.length !== 11 && cpfCnpj.length !== 14) {
            return res.status(400).json({ error: 'CPF deve ter 11 digitos ou CNPJ 14 digitos.' });
        }

        if (telefone && (telefone.length < 10 || telefone.length > 13)) {
            return res.status(400).json({ error: 'Telefone invalido.' });
        }

        if (senha.length < 8 || senha.length > 200) {
            return res.status(400).json({ error: 'A senha deve ter pelo menos 8 caracteres.' });
        }

        req.body = { nome, email, cpf_cnpj: cpfCnpj, telefone, senha };
        next();
    },

    validarEndereco: (req, res, next) => {
        const { endereco, numero, bairro, cidade, estado, cep } = req.body;

        if (!endereco || !numero || !bairro || !cidade || !estado || !cep) {
            return res.status(400).json({ 
                error: 'Campos de endereço incompletos. Verifique os dados enviados.' 
            });
        }

        next();
    }
};
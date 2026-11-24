// Gera e confere hashes de senha com scrypt (nativo do Node, sem dependencias extras).
const { randomBytes, scryptSync, timingSafeEqual } = require('node:crypto');

const PREFIXO = 'scrypt';
const TAMANHO_CHAVE = 64;

// Retorna "scrypt$<salt>$<hash>" para guardar na coluna login.senha (VARCHAR 255).
function gerarHash(senha) {
    const salt = randomBytes(16).toString('hex');
    const hash = scryptSync(senha, salt, TAMANHO_CHAVE).toString('hex');
    return `${PREFIXO}$${salt}$${hash}`;
}

// Compara a senha digitada com o valor salvo no banco.
// Senhas antigas sem hash (como a conta de demonstracao do schema.sql) ainda funcionam.
function conferirSenha(senhaDigitada, senhaSalva) {
    const salva = String(senhaSalva || '');
    const partes = salva.split('$');

    if (partes.length !== 3 || partes[0] !== PREFIXO) {
        return salva === senhaDigitada;
    }

    const [, salt, hashSalvo] = partes;
    const esperado = Buffer.from(hashSalvo, 'hex');
    const calculado = scryptSync(senhaDigitada, salt, esperado.length);
    return esperado.length === calculado.length && timingSafeEqual(esperado, calculado);
}

module.exports = { gerarHash, conferirSenha };

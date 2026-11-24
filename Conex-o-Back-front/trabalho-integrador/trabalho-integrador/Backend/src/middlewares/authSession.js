const { createHmac, timingSafeEqual } = require('node:crypto');

const COOKIE_NAME = 'ecoskin_session';
const SESSION_DURATION_SECONDS = 8 * 60 * 60;
const VALID_ROLES = new Set(['CLIENTE', 'ADMIN']);
const secret = process.env.SESSION_SECRET;

if (!secret || Buffer.byteLength(secret) < 32 || secret.includes('replace_with')) {
    throw new Error('Configure SESSION_SECRET com pelo menos 32 caracteres aleatorios.');
}

function assinar(payload) {
    const encodedPayload = Buffer.from(JSON.stringify(payload)).toString('base64url');
    const signature = createHmac('sha256', secret)
        .update(encodedPayload)
        .digest('base64url');
    return `${encodedPayload}.${signature}`;
}

function verificar(token) {
    if (typeof token !== 'string') return null;

    const partes = token.split('.');
    if (partes.length !== 2) return null;

    const [encodedPayload, signature] = partes;
    const assinaturaRecebida = Buffer.from(signature, 'base64url');
    const assinaturaEsperada = createHmac('sha256', secret)
        .update(encodedPayload)
        .digest();

    if (
        assinaturaRecebida.length !== assinaturaEsperada.length
        || !timingSafeEqual(assinaturaRecebida, assinaturaEsperada)
    ) {
        return null;
    }

    let payload;
    try {
        payload = JSON.parse(Buffer.from(encodedPayload, 'base64url').toString('utf8'));
    } catch {
        return null;
    }

    if (
        !payload || typeof payload !== 'object'
        || !Number.isSafeInteger(payload.id_cliente) || payload.id_cliente < 1
        || !Number.isSafeInteger(payload.id_login) || payload.id_login < 1
        || !VALID_ROLES.has(payload.papel)
        || !Number.isSafeInteger(payload.exp) || payload.exp <= Math.floor(Date.now() / 1000)
    ) {
        return null;
    }

    return {
        id_cliente: payload.id_cliente,
        id_login: payload.id_login,
        papel: payload.papel
    };
}

function criarCookie(usuario, secure) {
    const token = assinar({
        id_cliente: Number(usuario.id_cliente),
        id_login: Number(usuario.id_login),
        papel: usuario.papel,
        exp: Math.floor(Date.now() / 1000) + SESSION_DURATION_SECONDS
    });
    const secureFlag = secure ? '; Secure' : '';

    return `${COOKIE_NAME}=${token}; HttpOnly; SameSite=Strict; Path=/; Max-Age=${SESSION_DURATION_SECONDS}${secureFlag}`;
}

function limparCookie(secure) {
    const secureFlag = secure ? '; Secure' : '';
    return `${COOKIE_NAME}=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0${secureFlag}`;
}

function lerCookie(header) {
    if (!header) return null;

    const cookie = header.split(';').map((item) => item.trim())
        .find((item) => item.startsWith(`${COOKIE_NAME}=`));

    return cookie ? cookie.slice(COOKIE_NAME.length + 1) : null;
}

function exigirAutenticacao(req, res, next) {
    const sessao = verificar(lerCookie(req.headers.cookie));
    if (!sessao) {
        return res.status(401).json({ error: 'Autenticacao necessaria.' });
    }

    req.auth = sessao;
    return next();
}

function exigirAdministrador(req, res, next) {
    if (req.auth.papel !== 'ADMIN') {
        return res.status(403).json({ error: 'Acesso restrito a administradores.' });
    }

    return next();
}

module.exports = {
    criarCookie,
    exigirAdministrador,
    exigirAutenticacao,
    limparCookie,
    verificar
};

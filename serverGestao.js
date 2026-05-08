const http = require('http');
const fs   = require('fs');
const path = require('path');

const PORT       = 3000;
const PUBLIC_DIR = __dirname; // todos os arquivos estão na raiz do projeto

const MIME_TYPES = {
    '.html': 'text/html; charset=utf-8',
    '.css':  'text/css; charset=utf-8',
    '.js':   'application/javascript; charset=utf-8',
    '.ico':  'image/x-icon',
    '.png':  'image/png',
    '.jpg':  'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.svg':  'image/svg+xml',
    '.json': 'application/json',
    '.woff': 'font/woff',
    '.woff2':'font/woff2',
};

const server = http.createServer((req, res) => {
    // Remove query strings e decodifica URI
    let urlPath = decodeURIComponent(req.url.split('?')[0]);

    // Redireciona raiz para a loja (página pública)
    if (urlPath === '/' || urlPath === '') {
        res.writeHead(302, { Location: '/index.html' });
        return res.end();
    }

    const filePath = path.join(PUBLIC_DIR, urlPath);

    // Bloqueia tentativas de path traversal
    if (!filePath.startsWith(PUBLIC_DIR)) {
        res.writeHead(403);
        return res.end('403 Acesso negado');
    }

    fs.readFile(filePath, (err, data) => {
        if (err) {
            if (err.code === 'ENOENT') {
                res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
                res.end('<h2>404 — Página não encontrada</h2>');
            } else {
                res.writeHead(500);
                res.end('Erro interno do servidor');
            }
            return;
        }

        const ext      = path.extname(filePath).toLowerCase();
        const mimeType = MIME_TYPES[ext] || 'application/octet-stream';

        res.writeHead(200, { 'Content-Type': mimeType });
        res.end(data);
    });
});

server.listen(PORT, () => {
    console.log('');
    console.log('  🧵  Vovó Dinha Ateliê — Servidor iniciado!');
    console.log('');
    console.log(`  ➜  Loja:   http://localhost:${PORT}/index.html`);
    console.log(`  ➜  Admin:  http://localhost:${PORT}/login.html`);
    console.log('');
    console.log('  Pressione Ctrl+C para encerrar.');
    console.log('');
});

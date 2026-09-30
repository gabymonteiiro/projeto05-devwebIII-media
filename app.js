import http from 'http';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


const publicDir = path.join(__dirname, 'public');

// Content-Types:
const contentTypes = {
    '.html': 'text/html; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.js': 'text/javascript; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.jpeg': 'image/jpeg',
    '.jpg': 'image/jpeg',
    '.png': 'image/png'
};

function readFile(response, file) {
    fs.readFile(file, function(err, data) {
        if (err) {
            return erro404(response);
        }

        const extension = path.extname(file).toLowerCase();
        const contentType = contentTypes[extension] || 'application/octet-stream';

        response.writeHead(200, { 'Content-Type': contentType });
        response.end(data);
    });
}

// Erro 404:
function erro404(response) {
    const file = path.join(publicDir, 'erro404.html');

    fs.readFile(file, function(err, data) {
        if (err) {
            response.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
            return response.end('404 - Pagina Nao encontrada');
        }

        response.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
        response.end(data);
    });
}

// Calcular Média:
function calcularMedia(p1, p2) {
    return (p1 + p2) / 2;
}

// Classificar Aluno:
function classificarAluno(media) {
    if (media >= 6.0) {
        return {
            situacao: 'APROVADO',
            pagina: 'aprovado.html'
        };
    }
    return {
        situacao: 'REPROVADO',
        pagina: 'reprovado.html'
    };
}


function mostrarResultado(response, pagina, p1, p2, media, situacao) {
    const file = path.join(publicDir, pagina);

    fs.readFile(file, 'utf-8', function(err, data) {
        if (err) {
            return erro404(response);
        }

        
        data = data.replaceAll('{p1}', p1.toFixed(1));
        data = data.replaceAll('{p2}', p2.toFixed(1));
        data = data.replaceAll('{media}', media.toFixed(2));
        data = data.replaceAll('{situacao}', situacao);

        response.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        response.end(data);
    });
}


function callback(request, response) {
    const url = new URL(request.url, `http://${request.headers.host}`);
    const pathname = decodeURIComponent(url.pathname);

    // Rota Principal
    if (pathname === '/') {
        return readFile(response, path.join(publicDir, 'index.html'));
    }

    // Rota Média:
    if (pathname === '/media') {
        const p1Str = url.searchParams.get('p1');
        const p2Str = url.searchParams.get('p2');

        const p1 = parseFloat(p1Str);
        const p2 = parseFloat(p2Str);

       
        if (p1Str === null || p2Str === null || isNaN(p1) || isNaN(p2)) {
            response.writeHead(400, { 'Content-Type': 'text/plain; charset=utf-8' });
            return response.end('Erro 400: Informe os parametros p1 e p2 corretamente na URL (Ex: /media?p1=7.5&p2=5.0)');
        }

        const media = calcularMedia(p1, p2);
        const resultado = classificarAluno(media);

        return mostrarResultado(
            response,
            resultado.pagina,
            p1,
            p2,
            media,
            resultado.situacao
        );
    }


    const safePath = path.resolve(publicDir, '.' + pathname);

    if (!safePath.startsWith(publicDir)) {
        return erro404(response);
    }

    readFile(response, safePath);
}

// Criar e Configurar o Servidor:
const server = http.createServer(callback);
const PORT = 3000;

server.listen(PORT, function() {
    console.log(`Servidor iniciado em http://localhost:${PORT}/`);
});
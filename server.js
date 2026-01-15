const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');

const API_KEY = 'b400192aff764fe4914794cea3d0d846';
const PORT = 3000;

const server = http.createServer((req, res) => {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }

    // Ana sayfa
    if (req.url === '/' || req.url === '/index.html') {
        const htmlPath = path.join(__dirname, 'New Text Document.html');
        fs.readFile(htmlPath, (err, data) => {
            if (err) {
                res.writeHead(500);
                res.end('Dosya okunamadi');
                return;
            }
            res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
            res.end(data);
        });
        return;
    }

    // API Proxy
    if (req.url.startsWith('/api/')) {
        const apiPath = req.url.replace('/api', '');
        const options = {
            hostname: 'api.football-data.org',
            path: '/v4' + apiPath,
            method: 'GET',
            headers: {
                'X-Auth-Token': API_KEY
            }
        };

        const proxyReq = https.request(options, (proxyRes) => {
            let data = '';
            proxyRes.on('data', chunk => data += chunk);
            proxyRes.on('end', () => {
                res.writeHead(proxyRes.statusCode, { 'Content-Type': 'application/json' });
                res.end(data);
            });
        });

        proxyReq.on('error', (e) => {
            res.writeHead(500);
            res.end(JSON.stringify({ error: e.message }));
        });

        proxyReq.end();
        return;
    }

    res.writeHead(404);
    res.end('Sayfa bulunamadi');
});

server.listen(PORT, () => {
    console.log(`Sunucu calisiyor: http://localhost:${PORT}`);
});

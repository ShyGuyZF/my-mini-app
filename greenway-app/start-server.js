// Файл: start-server.js
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;
const MIME_TYPES = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'application/javascript',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.ico': 'image/x-icon'
};

const server = http.createServer((req, res) => {
    console.log(`${new Date().toISOString()} ${req.method} ${req.url}`);

    // Убираем параметры запроса
    let filePath = req.url.split('?')[0];
    if (filePath === '/') filePath = '/index.html';

    const fullPath = path.join(__dirname, filePath);
    const ext = path.extname(fullPath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    fs.readFile(fullPath, (err, content) => {
        if (err) {
            if (err.code === 'ENOENT') {
                // Файл не найден
                res.writeHead(404, { 'Content-Type': 'text/html' });
                res.end('<h1>404 - Страница не найдена</h1><p>Вернуться на <a href="/">главную</a></p>', 'utf8');
            } else {
                // Другая ошибка сервера
                res.writeHead(500);
                res.end(`Ошибка сервера: ${err.code}`);
            }
        } else {
            // Успешно
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content, 'utf8');
        }
    });
});

server.listen(PORT, () => {
    console.log(`✅ Сервер запущен на http://localhost:${PORT}`);
    console.log(`📂 Папка проекта: ${__dirname}`);
    console.log('\n📋 Действия:');
    console.log(`1. Откройте браузер по адресу: http://localhost:${PORT}`);
    console.log('2. Нажмите Ctrl+C для остановки сервера');

    // Автоматически открываем браузер (Windows)
    const { exec } = require('child_process');
    exec(`start http://localhost:${PORT}`);
});
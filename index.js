import express from 'express';
import http from 'http';
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import WSServer from './src/ws-server.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
const server = http.createServer(app);

// Serve webpages and resource files
const resources = {
    '/dist/bundle.js': '/dist/bundle.js',
    '/static/github.png': '/static/github.png',
    '/*': '/templates/home.html'
}

// Set up routes
for (const path in resources) {
    app.get(path, (req, res) => {
        res.sendFile(__dirname + resources[path]);
    });
}

// Start listening
const port = process.env.PORT || 8080;
server.listen(port, () => console.log(`[+] Listening on port ${port}...`));
const wsApp = new WSServer(server);
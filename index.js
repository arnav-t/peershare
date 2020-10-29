const express = require('express');
const http = require('http');

const app = express();
const server = http.createServer(app);

// Serve webpages and resource files
const resources = {
    '/': '/templates/home.html',
    '/static/styles.css': '/static/styles.css',
    '/static/client.js': '/static/client.js'
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
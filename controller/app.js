class App {
    constructor (server) {
        // Stores
        this.roomStore = {};
        this.tokenStore = {};

        // Initialize websocket server
        console.log('[+] Initializing WS server...');
        this.io = require('socket.io')(server);
        this.io.on('connect', sock => {
            const addr = sock.request.connection.remoteAddress;
            console.log(`[+] Received connection from ${addr}`);
            sock.on('syn', room => this.onSyn(sock, room));
        });
    }

    /** Create or add client to room in response syn  */
    async onSyn(sock, room) {
        if (typeof room !== 'string') return;
        const token = Math.random().toString(36).substr(2);
        let data;
        if (room in this.roomStore) {
            // Connect as peer
            console.log(`[+] Adding ${token} to ${room} as peer`);
            this.tokenStore[token] = {
                sock: sock,
                room: room,
                master: false
            }
            this.roomStore[room].peers.push(token);
            data = {
                token: token,
                master: false,
            }
        } else {
            // Connect as master
            console.log(`[+] Adding ${token} to ${room} as master`);
            this.tokenStore[token] = {
                sock: sock,
                room: room,
                master: true
            }
            this.roomStore[room] = {
                master: token,
                peers: []
            }
            data = {
                token: token,
                master: true,
            }
        }
        sock.emit('ack', data);
    }
}

module.exports = App;
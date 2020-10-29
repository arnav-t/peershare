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
            sock.on('disconnect', () => this.onDisconnect(sock));
        });
    }

    /** Create or add client to room in response syn  */
    async onSyn(sock, room) {
        if (typeof room !== 'string') return;
        const token = Math.random().toString(36).substr(2);
        let master;
        if (room in this.roomStore) {
            // Connect as peer
            console.log(`[+] Adding ${token} to ${room} as peer`);
            this.tokenStore[token] = {
                sock: sock,
                room: room,
                master: false
            }
            this.roomStore[room].peers.add(token);
            master = false;
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
                peers: new Set()
            }
            master = true;
        }
        sock.token = token;
        sock.emit('ack', master);
    }

    /** Tear down connection */
    async onDisconnect(sock) {
        const token = sock.token;
        if (!token) return;
        if (token in this.tokenStore) {
            const room = this.tokenStore[token].room;
            if (this.tokenStore[token].master) {
                // Delete room, own and all peer connections,
                console.log(`[-] Deleting master connection ${token} and room ${room}`);
                this.roomStore[room].peers.forEach(peerToken => {
                    let peerSock = this.tokenStore[peerToken].sock;
                    peerSock.disconnect(true);
                    delete this.tokenStore[peerToken];
                });
                delete this.roomStore[room];
            } else {
                // Delete own connection
                console.log(`[-] Deleting peer connection ${token} from room ${room}`);
                this.roomStore[room].peers.delete(token);
            }
            delete this.tokenStore[token];
        }
    }
}

module.exports = App;
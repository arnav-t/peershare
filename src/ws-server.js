import io from 'socket.io';

export default class WSServer {
    constructor (server) {
        // Bind this
        this.onSyn = this.onSyn.bind(this);
        this.onDisconnect = this.onDisconnect.bind(this);
        this.onMasterIce = this.onMasterIce.bind(this);
        this.onPeerIce = this.onPeerIce.bind(this);
        this.onMasterOffer = this.onMasterOffer.bind(this);
        this.onPeerAnswer = this.onPeerAnswer.bind(this);

        // Stores
        this.roomStore = {};
        this.tokenStore = {};

        // Initialize websocket server
        console.log('[+] Initializing WS server...');
        this.io = io(server);
        this.io.on('connect', sock => {
            const addr = sock.request.connection.remoteAddress;
            console.log(`[+] Received connection from ${addr}`);
            sock.on('syn', room => this.onSyn(sock, room));
            sock.on('disconnect', () => this.onDisconnect(sock));
            sock.on('masterICE', (ice, token) => this.onMasterIce(ice, token));
            sock.on('peerICE', ice => this.onPeerIce(sock, ice));
            sock.on('masterOffer', (desc, token) => this.onMasterOffer(desc, token));
            sock.on('peerAnswer', desc => this.onPeerAnswer(sock, desc));
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
            const masterToken = this.roomStore[room].master;
            const masterSock = this.tokenStore[masterToken].sock;
            masterSock.emit('peer', token);
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

    /** Received a master ICE candidate */
    async onMasterIce(ice, token) {
        const peerSock = this.tokenStore[token].sock;
        peerSock.emit('masterICE', ice);
    }

    /** Received a peer ICE candidate */
    async onPeerIce(sock, ice) {
        const token = sock.token;
        const room = this.tokenStore[token].room;
        const masterToken = this.roomStore[room].master;
        const masterSock = this.tokenStore[masterToken].sock;
        masterSock.emit('peerICE', ice, token);
    }

    /** Received offer from master */
    async onMasterOffer(desc, token) {
        const peerSock = this.tokenStore[token].sock;
        peerSock.emit('masterOffer', desc);
    }

    /** Received offer from peer */
    async onPeerAnswer(sock, desc) {
        const token = sock.token;
        const room = this.tokenStore[token].room;
        const masterToken = this.roomStore[room].master;
        const masterSock = this.tokenStore[masterToken].sock;
        masterSock.emit('peerAnswer', desc, token);
    }
}
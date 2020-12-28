import React, { Component } from 'react';
import { LoaderPanel } from './loader-panel.jsx';
import { UploadPanel } from './upload-panel.jsx';
import { DownloadPanel } from './download-panel.jsx';
import { StatusPanel } from './status-panel.jsx';
import io from 'socket.io-client';

const config = {
    iceServers: [{url: 'stun:stun.1.google.com:19302'}]
};

export default class Dashboard extends Component {
    constructor(props) {
        super(props);

        // Bind this
        this.onConnect = this.onConnect.bind(this);
        this.onAck = this.onAck.bind(this);
        this.onAddFile = this.onAddFile.bind(this);
        this.initUploader = this.initUploader.bind(this);
        this.initDownloader = this.initDownloader.bind(this);
        
        // Get room
        this.room = window.location.pathname.substr(1);
        
        if (this.room) {
            // Set up handlers
            this.sock = io('ws://' + window.location.host);
            this.sock.on('connect', this.onConnect);
            this.sock.on('ack', master => this.onAck(master));
        }

        this.state = {
            mode: this.room ? 'loader' : 'home',
            status: false
        }
    }

    /** Respond to intial connection server */
    onConnect() {
        console.log('[+] Connected to signaling server.');
        this.sock.emit('syn', this.room);
    }

    /** Handle server acknowledgement */
    onAck(master) {
        if (master) {
            // Set up uploader handlers
            console.log('[+] Client is in uploading mode.');
            this.peers = {};
            this.sock.on('peer', this.initUploader);
            this.sock.on('peerICE', (ice, token) => {
                if (token in this.peers) {
                    console.log(`[+] Received peer ICE candidate (${token}).`, ice);
                    this.peers[token].endpoint.addIceCandidate(ice);
                }
            });
            this.sock.on('peerAnswer', (desc, token) => {
                if (token in this.peers) {
                    console.log(`[+] Received peer answer (${token}).`, desc);
                    this.peers[token].endpoint.setRemoteDescription(desc);
                }
            });
            this.setState({ mode: 'upload' });
        } else {
            // Set up downloader handlers
            console.log('[+] Client is in downloading mode.');
            this.initDownloader();
            this.setState({ mode: 'download' });
        }
    }

    /** Handle added files to file uploader */
    onAddFile(file) {
        this.file = file;
        this.setState({ status: true });
        console.log(file);
    }

    /** Add uploader endpoint */
    initUploader(token) {
        console.log(`[+] Received peer connection (${token}).`);

        const upEndpoint = new RTCPeerConnection(config);
        const upChannel = upEndpoint.createDataChannel('file', {reliable: true});
        this.peers[token] = {
            endpoint: upEndpoint,
            channel: upChannel
        }

        upChannel.binaryType = 'arraybuffer';
        upChannel.onopen = () => console.log(`[+] DC Open (${token}).`);
        upChannel.onclose = () => console.log(`[+] DC Closed (${token}).`);

        // On ICE candidate
        upEndpoint.addEventListener('icecandidate', event => {
            console.log(`[+] Sending master ICE candidate (${token})`);
            this.sock.emit('masterICE', event.candidate, token);
        });

        // Make offer
        upEndpoint.createOffer(desc => {
            console.log(`[+] Generated offer (${token}).`);
            upEndpoint.setLocalDescription(desc);
            this.sock.emit('masterOffer', desc, token);
        },
        e => console.log(`[!] Error generating offer (${token}): ${e}`));
    }

    /** Create downloader endpoint */
    initDownloader() {
        this.downEndpoint = new RTCPeerConnection(config);

        this.sock.on('masterICE', ice => {
            console.log('[+] Received master ICE candidate.', ice);
            this.downEndpoint.addIceCandidate(ice);
        });

        this.sock.on('masterOffer', desc => {
            console.log('[+] Received master offer.', desc);
            this.downEndpoint.setRemoteDescription(desc);
            this.downEndpoint.createAnswer(answer => {
                this.downEndpoint.setLocalDescription(answer);
                this.sock.emit('peerAnswer', answer);
            },
            e => console.log(`[!] Error generating answer: ${e}`));
        });
        
        // On ICE candidate
        this.downEndpoint.addEventListener('icecandidate', event => {
            console.log('[+] Sending peer ICE candidate.');
            this.sock.emit('peerICE', event.candidate);
        });

        // On receiving data channel
        this.downEndpoint.addEventListener('datachannel', event => {
            console.log('[+] Received data channel.');
            this.downChannel = event.channel;
            this.downChannel.binaryType = 'arraybuffer';
            this.downChannel.onopen = () => console.log('[+] DC Open.');
            this.downChannel.onclose = () => console.log('[+] DC Closed.');
        });
    }

    render() {
        let panel;
        switch (this.state.mode) {
        case 'loader':
            panel = <LoaderPanel />
            break;
        case 'upload':
            panel = <UploadPanel onAddFile={this.onAddFile} />
            break;
        case 'download':
            panel = <DownloadPanel />
            break;
        default:
            panel = <b>Homepage coming soon...</b>
        }

        return (
            <div className='main'>
                {panel} {this.state.status && 
                    <StatusPanel fileName={this.file.name} />} 
            </div>
        );
    }
}
import React, { Component } from 'react';
import LoaderPanel from './loader-panel.jsx';
import UploadPanel from './upload-panel.jsx';
import DownloadPanel from './download-panel.jsx';
import io from 'socket.io-client';

export default class Dashboard extends Component {
    constructor(props) {
        super(props);

        // Bind this
        this.onConnect = this.onConnect.bind(this);
        this.onAck = this.onAck.bind(this);
        this.onAddFile = this.onAddFile.bind(this);
        
        // Get room
        this.room = window.location.pathname.substr(1);
        
        if (this.room) {
            // Set up handlers
            this.sock = io('ws://' + window.location.host);
            this.sock.on('connect', this.onConnect);
            this.sock.on('ack', master => this.onAck(master));
        }

        this.state = {
            mode: this.room ? 'loader' : 'home'
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
            console.log('[+] Client is in uploading mode.');
            this.setState({ mode: 'upload' });
        } else {
            console.log('[+] Client is in downloading mode.');
            this.setState({ mode: 'download' });
        }
    }

    /** Handle added files to file uploader */
    onAddFile(file) {
        console.log(file);
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
                {panel}
            </div>
        );
    }
}
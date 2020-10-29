// Global vars
const uri = 'ws://' + window.location.host;
const room = window.location.pathname.substr(1);
let sock = null;
let token = null;
let master = null;

// Elements
const fileUploader = document.querySelector('#upload');
const loaderPanel = document.querySelector('#loader-panel');
const uploadPanel = document.querySelector('#upload-panel');
const downloadPanel = document.querySelector('#download-panel');

// Attach listeners
fileUploader.addEventListener('change', onFile, false);

/** On change handler for file uploader */
async function onFile() {
    const file = fileUploader.files[0];
    if (file) {
        console.log(file);
    }
}

/** Initializes the socket.io client */
async function init() {
    sock = io(uri);
    sock.on('connect', () => {
        console.log('[+] Connected to signaling server');
        sock.emit('syn', room);
        setup();
    });
}

/** Set up socket */
async function setup() {
    sock.on('ack', isMaster => {
        master = isMaster;
        loaderPanel.style.display = 'none';
        if (master) uploadPanel.style.display = 'flex';
        else downloadPanel.style.display = 'flex';
    });
}

// For testing
init();
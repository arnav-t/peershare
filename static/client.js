// Global vars
const uri = 'ws://' + window.location.host;
const room = window.location.pathname.substr(1);
let sock = null;
let token = null;

// Elements
const fileUploader = document.querySelector('#upload');

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
    sock.on('ack', data => console.log(data));
}

// For testing
init();
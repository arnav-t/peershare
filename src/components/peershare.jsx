import React from 'react';
import Dashboard from './dashboard.jsx';

export const PeerShare = () => {
    return (
        <>
            <h1 className="title">PeerShare</h1>
            <i className="subtitle">Peer-to-peer file sharing</i>
            <Dashboard />
            <footer>
                <a href="https://github.com/arnav-t/peershare" target="_blank" rel="noopener noreferrer">
                    <img src="static/github.png" className="gh-button" />
                </a>
                <i className="subtitle">Github</i>
            </footer>
        </>
    );
};
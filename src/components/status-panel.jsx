import React from 'react';

export const StatusPanel = ({ fileName }) => {
    return (
        <div className="panel">
            <b>{fileName}</b>
        </div>
    );
};
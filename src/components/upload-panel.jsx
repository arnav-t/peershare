import React, { useEffect } from 'react';

export const UploadPanel = ({ onAddFile }) => {
    useEffect(() => {
        const fileUploader = document.querySelector('#upload');
        const onChange = () => {
            const file = fileUploader.files[0];
            if (file) onAddFile(file);
        };

        fileUploader.addEventListener('change', onChange);
        return () => {
            fileUploader.removeEventListener('change', onChange);
        };
    }, []);

    return (
        <div className="upload panel">
            <div className="upload-wrapper">
                <i>{'Drop a file \u21d1'}</i>
                <input type="file" id="upload" />
            </div>
        </div>
    );
};
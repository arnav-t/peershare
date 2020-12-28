import React, { Component } from 'react';

export default class UploadPanel extends Component {
    componentDidMount() {
        this.fileUploader = document.getElementById('upload');
        this.fileUploader.addEventListener('change', () => {
            const file = this.fileUploader.files[0];
            if (file) {
                this.props.onAddFile(file);
            }
        });
    }

    render() {
        return (
            <div className="upload panel">
                <div className="upload-wrapper">
                    <i>{'Drop a file \u21d1'}</i>
                    <input type="file" id="upload" />
                </div>
            </div>
        );
    }
}
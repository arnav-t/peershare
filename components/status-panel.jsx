import React, { Component } from 'react';

export default class StatusPanel extends Component {
    render() {
        return (
            <div className="panel">
                <b>{this.props.fileName}</b>
            </div>
        );
    }
}
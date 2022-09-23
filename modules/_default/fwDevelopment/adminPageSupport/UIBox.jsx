import React from 'react';

export default class UIBox extends React.Component {
    render() {
        return (
            <div style={{
                width: '100%', padding: '3px', height: '450px', overFlow: 'hidden',
                borderWidth: '2px', borderStyle: 'inset', borderColor: 'initial', borderImage: 'initial'
            }}>
                <div style={{ backgroundColor: '#E5E5E5', height: '100%', position: 'relative', overflowY: 'scroll' }}>
                    {this.props.children}
                </div>
            </div>
        );
    }
}
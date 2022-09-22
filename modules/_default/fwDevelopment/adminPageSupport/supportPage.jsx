import React from 'react';
import { AdminPage } from 'view/component/AdminPage';
import { Link } from 'react-router-dom';
import UIBox from './UIBox';

export default class SupportPage extends AdminPage {
    state = {
        icon: '', title: '', subTitle: '', header: null, breadcrumb: [], advanceSearch: null,
        content: null, backRoute: null, onCreate: null, onSave: null, onExport: null, onImport: null
    }
    
    setup = data => this.setState({ ...this.state, ...data })
    
    render() {
        const { icon, title, subTitle, header, breadcrumb, advanceSearch, content, backRoute, onCreate, onSave, onExport, onImport } = this.state;
    
        let right = 10, createButton, saveButton, exportButton, importButton;
        if (onCreate) {
            createButton = (
                <button className='btn btn-success btn-circle' style={{ position: 'absolute', bottom: '10px', zIndex: 500, right }}>
                    <i className='fa fa-lg fa-plus' />
                </button>
            );
            right += 60;
        }
        if (onSave) {
            saveButton = (
                <button className='btn btn-primary btn-circle' style={{ position: 'absolute', bottom: '10px', zIndex: 500, right }}>
                    <i className='fa fa-lg fa-save' />
                </button>
            );
            right += 60;
        }
        if (onExport) {
            exportButton = (
                <button className='btn btn-success btn-circle' style={{ position: 'absolute', bottom: '10px', zIndex: 500, right }}>
                    <i className='fa fa-lg fa-cloud-download' />
                </button>
            );
            right += 60;
        }
        if (onImport) {
            importButton = (
                <button className='btn btn-success btn-circle' style={{ position: 'absolute', bottom: '10px', zIndex: 500, right }}>
                    <i className='fa fa-lg fa-cloud-upload' />
                </button>
            );
        }
        
        return (
            <UIBox>
                <div className='app-title' style={{ margin: 0 }}>
                    <div>
                        <h1><i className={icon} /> {title}</h1>
                        <p>{subTitle}</p>
                    </div>
                    <ul className='app-breadcrumb breadcrumb'>
                        {header}
                        <Link to='/user'><i className='fa fa-home fa-lg' /></Link>
                        {breadcrumb.map((item, index) => <span key={index}>&nbsp;/&nbsp;{item}</span>)}
                    </ul>
                </div>
                <div className='app-advance-search'>
                    <h5>Tìm kiếm nâng cao</h5>
                    <div style={{ width: '100%' }}>{advanceSearch}</div>
                </div>
                <div style={{ padding: '30px' }}>
                    {content}
                </div>
                {backRoute && (
                    <a href='#' onClick={e => e.preventDefault()} className='btn btn-secondary btn-circle' style={{ position: 'absolute', bottom: '10px', zIndex: 500, left: '10px' }}>
                        <i className='fa fa-lg fa-reply' />
                    </a>
                )}
                {importButton} {exportButton} {saveButton} {createButton}
            </UIBox>
        );
    }
}
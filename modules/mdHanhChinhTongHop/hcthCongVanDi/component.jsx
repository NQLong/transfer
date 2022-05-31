import React from 'react';

export class FileComponent extends React.Component {
    render() {
        const { file, className = '', style = {}, onRemove, onClick } = this.props;

        return (
            <div className={'btn btn-primary d-flex justify-content-between align-items-center ' + className} onClick={onClick} style={{ border: '1px solid #ced4da', gap: '5px', ...style }}>
                <i className='fa fa-file' />
                <span style={{}}>{file.name}</span>
                {onRemove && <i className='btn btn-danger fa fa-times' onClick={onRemove} />}
            </div>
        );
    }
}
export class FormFileTextBox extends React.Component {
    state = { text: '', file: null };

    value = (data) => {
        if (data) {
            this.setState({ text: data.text, file: data.file });
        } else {
            return {
                text: this.state.text,
                file: this.state.file
            };
        }
    }

    focus = () => this.textInput.focus();

    clear = () => this.textInput.clear();

    clearFile = (e) => {
        e.preventDefault();
        this.setState({ file: null });
    }

    onSelectedFileChange = (e) => {
        e.preventDefault();
        if (e.target.files.length) {
            this.setState({ file: e.target.files[0] });
        }
    }

    render() {
        const { style = {}, rows = 3, label = '', placeholder = '', className = '', readOnly = false, onChange = null, required = false } = this.props;
        let displayElement = '';
        if (label) {
            displayElement = <><label onClick={() => this.input.focus()}>{label}{!readOnly && required ? <span style={{ color: 'red' }}> *</span> : ''}</label></>;
        } else {
            displayElement = readOnly ? <b>{this.state.value}</b> : '';
        }
        return (
            <div className={'form-group ' + (className ? className : '')} style={style} >
                {displayElement}
                <div className='form-control form-file-text-box' ref={e => this.box = e}>
                    <textarea ref={e => this.textInput = e} className='rich-text-box' style={{ display: readOnly ? 'none' : 'block', position: 'relative' }} placeholder={placeholder ? placeholder : label} value={this.state.text} rows={rows} onChange={e => this.setState({ text: e.target.value }, () => onChange && onChange(e))} onFocus={e => { e.preventDefault(); this.box?.focus(); }} />
                    <input type='file' style={{ display: 'none' }} ref={e => this.fileInput = e} onChange={this.onSelectedFileChange} />
                    <div className='d-flex justify-content-between'>
                        <div>
                            {this.state.file && <FileComponent file={this.state.file} onRemove={this.clearFile} />}
                        </div>
                        <i className='btn fa fa-file' onClick={e => { e.preventDefault(); this.fileInput?.click(); }} />
                    </div>
                </div>
            </div>);
    }
}
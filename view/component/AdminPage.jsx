import React from 'react';
import { Link } from 'react-router-dom';
import ImageBox from 'view/component/ImageBox';
import FileBox from 'view/component/FileBox';
import Editor from 'view/component/CkEditor4';
import Datetime from 'react-datetime';
import InputMask from 'react-input-mask';
import 'react-datetime/css/react-datetime.css';
// import AdminSearchBox from 'view/component/AdminSearchBox';

// Table components ---------------------------------------------------------------------------------------------------
export class TableCell extends React.Component { // type = number | date | link | image | checkbox | buttons | text (default)
    render() {
        let { type = 'text', content = '', permission = {}, className = '', style = {}, contentStyle = {}, alt = '', display = true, rowSpan = 1 } = this.props;
        if (style == null) style = {};

        if (display != true) {
            return null;
        } else if (type == 'number') {
            return <td className={className} style={{ textAlign: 'right', ...style }} rowSpan={rowSpan}>{content && !isNaN(content) ? T.numberDisplay(content) : content}</td>;
        } else if (type == 'date') {
            return <td className={className} style={{ ...style }} rowSpan={rowSpan}>{new Date(content).getText()}</td>;
        } else if (type == 'link') {
            let url = this.props.url ? this.props.url.trim() : '',
                onClick = this.props.onClick;
            if (onClick) {
                return <td className={className} style={{ ...style }} rowSpan={rowSpan}><a href='#' onClick={onClick}>{content}</a></td>;
            } else {
                return url.startsWith('http://') || url.startsWith('https://') ?
                    <td className={className} style={{ textAlign: 'left', ...style }} rowSpan={rowSpan}><a href={url} target='_blank' rel='noreferrer' style={contentStyle}>{content}</a></td> :
                    <td className={className} style={{ textAlign: 'left', ...style }} rowSpan={rowSpan}><Link to={url} style={contentStyle}>{content}</Link></td>;
            }
        } else if (type == 'image') {
            return content ?
                <td style={{ textAlign: 'center', ...style }} className={className} rowSpan={rowSpan}><img src={content} alt={alt} style={{ height: '32px' }} /></td> :
                <td style={{ textAlign: 'center', ...style }} className={className} rowSpan={rowSpan}>{alt}</td>;
        } else if (type == 'checkbox') {
            return (
                <td style={{ textAlign: 'center', ...style }} className={'toggle ' + className} rowSpan={rowSpan}>
                    <label>
                        <input type='checkbox' checked={content} onChange={() => permission.write && this.props.onChanged(content ? 0 : 1)} />
                        <span className='button-indecator' />
                    </label>
                </td>);
        } else if (type == 'buttons') {
            const { onSwap, onEdit, onDelete, children } = this.props;
            return (
                <td className={className} style={{ ...style }} rowSpan={rowSpan}>
                    <div className='btn-group'>
                        {children}
                        {permission.write && onSwap ?
                            <a className='btn btn-warning' href='#' onClick={e => onSwap(e, content, true)}><i className='fa fa-lg fa-arrow-up' /></a> : null}
                        {permission.write && onSwap ?
                            <a className='btn btn-warning' href='#' onClick={e => onSwap(e, content, false)}><i className='fa fa-lg fa-arrow-down' /></a> : null}
                        {onEdit && typeof onEdit == 'function' ?
                            <a className='btn btn-primary' href='#' onClick={e => onEdit(e, content)}><i className='fa fa-lg fa-edit' /></a> : null}
                        {onEdit && typeof onEdit == 'string' ?
                            <Link to={onEdit} className='btn btn-primary'><i className='fa fa-lg fa-edit' /></Link> : null}
                        {permission.delete && onDelete ?
                            <a className='btn btn-danger' href='#' onClick={e => onDelete(e, content)}><i className='fa fa-lg fa-trash' /></a> : null}
                    </div>
                </td>);
        } else {
            return <td className={className} style={{ ...style }} rowSpan={rowSpan}>{content}</td>;
        }
    }
}

export function renderTable({ style = {}, className = '', getDataSource = () => null, loadingText = 'Đang tải...', emptyTable = 'Chưa có dữ liệu!', stickyHead = false,
    renderHead = () => null, renderRow = () => null }) {
    const list = getDataSource();
    if (list == null) {
        return (
            <div className='overlay' style={{ minHeight: '120px' }}>
                <div className='m-loader mr-4'>
                    <svg className='m-circular' viewBox='25 25 50 50'>
                        <circle className='path' cx='50' cy='50' r='20' fill='none' strokeWidth='4' strokeMiterlimit='10' />
                    </svg>
                </div>
                <h3 className='l-text'>{loadingText}</h3>
            </div>);
    } else if (list.length) {
        const table = (
            <table className={'table table-hover table-bordered table-responsive ' + className} style={{ margin: 0, ...style }}>
                <thead>{renderHead()}</thead>
                <tbody>{list.map(renderRow)}</tbody>
            </table>
        );

        const properties = {};
        if (stickyHead) {
            properties.className = 'tile-table-fix-head';
        } else {
            properties.style = { marginBottom: 8 };
        }
        return <div {...properties}>{table}</div>;
    } else {
        return emptyTable;
    }
}

// Form components ----------------------------------------------------------------------------------------------------
export class FormTabs extends React.Component {
    state = { tabIndex: 0 };

    componentDidMount() {
        $(document).ready(() => {
            let tabIndex = parseInt(T.cookie(this.props.id || 'tab'));
            if (isNaN(tabIndex) || tabIndex < 0 || tabIndex >= $(this.tabs).children().length) tabIndex = 0;
            this.setState({ tabIndex }, () => {
                setTimeout(() => {
                    this.props.onChange && this.props.onChange({ tabIndex });
                }, 250);
            });
        });
    }

    onSelectTab = (e, tabIndex) => {
        e.preventDefault();
        T.cookie(this.props.id || 'tab', tabIndex);
        this.setState({ tabIndex }, () => this.props.onChange && this.props.onChange({ tabIndex }));
    };

    selectedTabIndex = () => this.state.tabIndex;

    render() {
        const { tabClassName = '', contentClassName = '', tabs = [] } = this.props,
            id = this.props.id || 'tab',
            tabLinks = [], tabPanes = [];
        tabs.forEach((item, index) => {
            const tabId = id + '_' + T.randomPassword(8),
                className = (index == this.state.tabIndex ? ' active show' : '');
            tabLinks.push(<li key={index} className={'nav-item' + className}><a className='nav-link' data-toggle='tab' href={'#' + tabId} onClick={e => this.onSelectTab(e, index)}>{item.title}</a></li>);
            tabPanes.push(<div key={index} className={'tab-pane fade' + className} id={tabId}>{item.component}</div>);
        });

        return <>
            <ul ref={e => this.tabs = e} className={'nav nav-tabs ' + tabClassName}>{tabLinks}</ul>
            <div className={'tab-content ' + contentClassName}>{tabPanes}</div>
        </>;
    }
}

export class FormCheckbox extends React.Component {
    state = { checked: false };

    value = (checked) => {
        if (checked != null) {
            this.setState({ checked });
        } else {
            return this.state.checked;
        }
    }

    onCheck = () => this.props.readOnly || this.setState({ checked: !this.state.checked }) || this.props.onChange(!this.state.checked);

    render() {
        let { className, label, style, isSwitch = false, trueClassName = 'text-primary', falseClassName = 'text-secondary' } = this.props;
        if (style == null) style = {};
        return isSwitch ? (
            <div className={className} style={{ ...style, display: 'inline-flex' }}>
                <label style={{ cursor: 'pointer' }} onClick={this.onCheck}>{label}:&nbsp;</label>
                <div className='toggle'>
                    <label style={{ marginBottom: 0 }}>
                        <input type='checkbox' checked={this.state.checked} onChange={this.onCheck} /><span className='button-indecator' />
                    </label>
                </div>
            </div>) : (
                <div className={'animated-checkbox ' + className} style={style}>
                    <label>
                        <input type='checkbox' checked={this.state.checked} onChange={this.onCheck} />
                        <span className={'label-text ' + (this.state.checked ? trueClassName : falseClassName)}>{label}</span>
                    </label>
                </div>
            );
    }
}

export class FormTextBox extends React.Component {
    state = { value: '' };

    value = function (text) {
        if (arguments.length) {
            this.setState({ value: text });
        } else {
            return this.state.value;
        }
    }

    focus = () => this.input.focus();

    render() {
        let { type = 'text', smallText = '', label = '', className = '', readOnly = false, onChange = null } = this.props,
            readOnlyText = this.state.value;
        type = type.toLowerCase(); // type = text | number | email | password | phone
        const properties = {
            type,
            className: 'form-control',
            placeholder: label,
            value: this.state.value,
            onChange: e => this.setState({ value: e.target.value }) || (onChange && onChange(e)),
        };
        if (type == 'password') properties.autoComplete = 'new-password';
        if (type == 'phone') {
            if (readOnlyText) readOnlyText = T.mobileDisplay(readOnlyText);
            properties.onKeyPress = e => ((!/[0-9]/.test(e.key)) && e.preventDefault());
        }
        if (type == 'number') {
            readOnlyText = readOnlyText ? T.numberDisplay(readOnlyText) : 0;
            properties.onKeyPress = e => ((!/[0-9]/.test(e.key)) && e.preventDefault());
        }
        return (
            <div className={'form-group ' + (className || '')}>
                <label onClick={() => this.input.focus()}>{label}</label>{readOnly ? <>: <b>{readOnlyText}</b></> : ''}
                <input ref={e => this.input = e} style={{ display: readOnly ? 'none' : 'block' }}{...properties} />
                {smallText ? <small>{smallText}</small> : null}
            </div>);
    }
}

export class FormRichTextBox extends React.Component {
    state = { value: '' };

    value = (text) => {
        if (text === '' || text) {
            this.setState({ value: text });
        } else {
            return this.state.value;
        }
    }

    focus = () => this.input.focus();

    render() {
        const { style = {}, rows = 3, label = '', className = '', readOnly = false, onChange = null } = this.props;
        return (
            <div className={'form-group ' + (className ? className : '')} style={style}>
                <label onClick={() => this.input.focus()}>{label}</label>{readOnly && this.state.value ? <><br /><b>{this.state.value}</b></> : ''}
                <textarea ref={e => this.input = e} className='form-control' style={{ display: readOnly ? 'none' : 'block' }} placeholder={label} value={this.state.value} rows={rows}
                    onChange={e => this.setState({ value: e.target.value }) || onChange && onChange(e)} />
            </div>);
    }
}

export class FormEditor extends React.Component {
    state = { value: '' };

    html = (text) => {
        if (text === '' || text) {
            this.input.html(text);
            this.setState({ value: text });
        } else {
            return this.input.html();
        }
    }

    value = this.html;

    text = () => this.input.text();

    focus = () => this.input.focus();

    render() {
        let { height = '400px', label = '', className = '', readOnly = false, uploadUrl = '', smallText = '' } = this.props;
        className = 'form-group' + (className ? ' ' + className : '');
        return (
            <div className={className}>
                <label>{label}</label>{readOnly && this.state.value ? <br /> : ''}
                <p style={{ width: '100%', fontWeight: 'bold', display: readOnly ? 'block' : 'none' }} dangerouslySetInnerHTML={{ __html: this.state.value }} />
                {!readOnly && smallText ? <small className='form-text text-muted'>{smallText}</small> : null}
                <div style={{ display: readOnly ? 'none' : 'block' }}>
                    <Editor ref={e => this.input = e} height={height} placeholder={label} uploadUrl={uploadUrl} />
                </div>
            </div>);
    }
}

export class FormSelect extends React.Component {
    state = { valueText: '', hasInit: false };
    hasInit = false;
    componentDidMount() {
        $(this.input).select2();
        $(this.input).on('select2:select', e => this.props.onChange && this.props.onChange(e.params.data));
        $(this.input).on('select2:unselect', e => this.props.onChange && this.props.onChange(e.params.data));
        $(this.input).on('select2:open', () => {
            !this.hasInit && setTimeout(() => {
                this.value(null);
                setTimeout(this.focus, 50);
            }, 50);
        });
    }

    componentWillUnmount() {
        $(this.input).off('select2:select');
        $(this.input).off('select2:unselect');
        $(this.input).off('select2:open');
    }

    focus = () => $(this.input).select2('open');

    clear = () => $(this.input).val('').trigger('change') && $(this.input).html('');

    value = function (value) {
        const dropdownParent = this.props.dropdownParent || $('.modal-body').has(this.input)[0] || $('.tile-body').has(this.input)[0];
        if (arguments.length) {
            this.clear();
            let hasInit = this.hasInit;
            if (!hasInit) this.hasInit = true;

            const { data, label, placeholder, minimumResultsForSearch = 1, allowClear = false } = this.props,
                options = { placeholder: placeholder || label, dropdownParent, minimumResultsForSearch, allowClear };

            if (Array.isArray(data)) {
                options.data = data;
                $(this.input).select2(options).val(value).trigger('change');
            } else {
                options.ajax = { ...data, delay: 500 };
                $(this.input).select2(options);
                if (value) {
                    if (this.props.multiple) {
                        if (!Array.isArray(value)) {
                            value = [value];
                        }

                        const promiseList = value.map(item => {
                            return new Promise(resolve => {
                                if (item.hasOwnProperty('id') && item.hasOwnProperty('text')) {
                                    const option = new Option(item.text, item.id, true, true);
                                    $(this.input).append(option).trigger('change');
                                    resolve(item.text);
                                } else if ((typeof item == 'string' || typeof item == 'number') && data.fetchOne) {
                                    data.fetchOne(item, _item => {
                                        const option = new Option(_item.text, _item.id, true, true);
                                        $(this.input).append(option).trigger('change');
                                        resolve(_item.text);
                                    });
                                } else {
                                    const option = new Option(item, item, true, true);
                                    $(this.input).append(option).trigger('change');
                                    resolve(item);
                                }
                            });
                        });
                        Promise.all(promiseList).then(valueTexts => {
                            // Async set readOnlyText
                            this.setState({ valueText: valueTexts.join(', ') });
                        });
                    } else {
                        if ((typeof value == 'string' || typeof value == 'number') && data.fetchOne) {
                            data.fetchOne(value, _item => {
                                $(this.input).select2('trigger', 'select', { data: _item });
                                // Async set readOnlyText
                                this.setState({ valueText: _item.text });
                            });
                        } else if (value.hasOwnProperty('id') && value.hasOwnProperty('text')) {
                            $(this.input).select2('trigger', 'select', { data: value });
                        } else {
                            $(this.input).select2('trigger', 'select', { data: { id: value, text: value } });
                        }
                    }
                } else {
                    $(this.input).val(null).trigger('change');
                }
            }

            // Set readOnly text
            if (!this.props.multiple) {
                if (!data || !data.fetchOne) {
                    this.setState({ valueText: $(this.input).find(':selected').text() });
                }
            }
        } else {
            return $(this.input).val();
        }
    }

    render = () => {
        const { className = '', style = {}, labelStyle = {}, label = '', multiple = false, readOnly = false } = this.props;
        // const clearButton = <a href='#' style={{ lineHeight: '38px', marginLeft: '4px' }} onClick={e => e.preventDefault() || this.value(null)}><i className='fa fa-fw fa-lg fa-times text-danger' /></a>;
        return (
            <div className={'form-group ' + className} style={style}>
                {label ? <label style={labelStyle} onClick={this.focus}>{label}{readOnly ? ':' : ''}</label> : null} {readOnly ? <b>{this.state.valueText}</b> : ''}
                <div style={{ width: '100%', display: readOnly ? 'none' : 'inline-flex' }}>
                    <select ref={e => this.input = e} multiple={multiple} disabled={readOnly} />
                    {/* {this.props.allowClear && $(this.input).val() ? clearButton : null} */}
                </div>
            </div>
        );
    }
}

export class FormDatePicker extends React.Component {
    static defaultProps = { type: 'date' };

    mask = {
        'time-mask': '39/19/2099 h9:59',
        'date-mask': '39/19/2099'
    };

    state = { value: '', readOnlyText: '' };

    value = function (date) {
        const type = this.props.type;
        if (arguments.length) {
            if (type.endsWith('-mask')) {
                const value = date ? T.dateToText(new Date(date), type == 'date-mask' ? 'dd/mm/yyyy' : 'dd/mm/yyyy HH:MM') : '';
                this.setState({ value, readOnlyText: value });
            } else {
                this.setState({
                    value: date ? new Date(date) : '',
                    readOnlyText: date ? T.dateToText(new Date(date), type == 'date' ? 'dd/mm/yyyy' : 'dd/mm/yyyy HH:MM') : ''
                });
            }
        } else {
            if (type.endsWith('-mask')) {
                const date = T.formatDate(this.state.value);
                if (date == null || Number.isNaN(date.getTime())) return '';
                return date;
            } else {
                return this.state.value;
            }
        }
    }

    focus = () => {
        const type = this.props.type;
        if (type.endsWith('-mask')) {
            this.input.getInputDOMNode().focus();
        } else {
            $(this.inputRef).focus();
        }
    }

    handleChange = event => {
        const type = this.props.type;
        event.preventDefault && event.preventDefault();
        this.setState({ value: type.endsWith('-mask') ? event.target.value : new Date(event) }, () => {
            this.props.onChange && this.props.onChange(this.value());
        });
    }

    render() {
        let { label = '', type = 'date', className = '', readOnly = false } = this.props; // type = date || time || date-mask || time-mask
        return (
            <div className={'form-group ' + (className || '')}>
                <label onClick={() => this.focus()}>{label}</label>{readOnly && this.state.value ? <>: <b>{this.state.readOnlyText}</b></> : ''}
                {type.endsWith('-mask') ? (
                    <InputMask ref={e => this.input = e} className='form-control' mask={this.mask[type]} onChange={this.handleChange} style={{ display: readOnly ? 'none' : '' }}
                        formatChars={{ '2': '[12]', '0': '[09]', '1': '[01]', '3': '[0-3]', '9': '[0-9]', '5': '[0-5]', 'h': '[0-2]' }}
                        value={this.state.value} readOnly={readOnly} placeholder={label} />
                ) : (
                        <Datetime ref={e => this.input = e} timeFormat={type == 'time' ? 'HH:mm' : false} dateFormat='DD/MM/YYYY'
                            inputProps={{ placeholder: label, ref: e => this.inputRef = e, readOnly, style: { display: readOnly ? 'none' : '' } }}
                            value={this.state.value} onChange={e => this.setState({ value: new Date(e) })} closeOnSelect={true} />
                    )}
            </div>);
    }
}

export class FormImageBox extends React.Component {
    setData = data => this.imageBox.setData(data);

    render() {
        let { label = '', className = '', style = {}, readOnly = false, postUrl = '/user/upload', uploadType = '', image = null, onDelete = null, onSuccess = null } = this.props;
        return (
            <div className={'form-group ' + className} style={style}>
                <label>{label}&nbsp;</label>
                {!readOnly && image && onDelete ?
                    <a href='#' className='text-danger' onClick={onDelete}><i className='fa fa-fw fa-lg fa-trash' /></a> : null}
                <ImageBox ref={e => this.imageBox = e} postUrl={postUrl} uploadType={uploadType} image={image} readOnly={readOnly} success={data => onSuccess && onSuccess(data)} />
            </div>);
    }
}

export class FormFileBox extends React.Component {
    setData = data => this.fileBox.setData(data);

    render() {
        let { label = '', className = '', style = {}, readOnly = false, postUrl = '/user/upload', uploadType = '', onDelete = null, onSuccess = null } = this.props;
        return (
            <div className={'form-group ' + className} style={style}>
                <label>{label}&nbsp;</label>
                {!readOnly && onDelete ?
                    <a href='#' className='text-danger' onClick={onDelete}><i className='fa fa-fw fa-lg fa-trash' /></a> : null}
                <FileBox ref={e => this.fileBox = e} postUrl={postUrl} uploadType={uploadType} readOnly={readOnly} success={data => onSuccess && onSuccess(data)} />
            </div>);
    }
}

// Page components ----------------------------------------------------------------------------------------------------
export class CirclePageButton extends React.Component {
    render() {
        const { type = 'back', style = {}, to = '', tooltip = '', customIcon = '', customClassName = 'btn-warning', onClick = () => { } } = this.props; // type = back | save | create | delete | export | import | custom
        const properties = {
            type: 'button',
            style: { position: 'fixed', right: '10px', bottom: '10px', zIndex: 500, ...style },
            'data-toggle': 'tooltip', title: tooltip,
            onClick,
        };
        let result = null;
        if (type == 'save') {
            result = <button {...properties} className='btn btn-primary btn-circle'><i className='fa fa-lg fa-save' /></button>;
        } else if (type == 'search') {
            result = <button {...properties} className='btn btn-primary btn-circle'><i className='fa fa-lg fa-search' /></button>;
        } else if (type == 'create') {
            result = <button {...properties} className='btn btn-success btn-circle'><i className='fa fa-lg fa-plus' /></button>;
        } else if (type == 'export') {
            result = <button {...properties} className='btn btn-success btn-circle'><i className='fa fa-lg fa-cloud-download' /></button>;
        } else if (type == 'import') {
            result = <button {...properties} className='btn btn-success btn-circle'><i className='fa fa-lg fa-cloud-upload' /></button>;
        } else if (type == 'delete') {
            result = <button {...properties} className='btn btn-danger btn-circle'><i className='fa fa-lg fa-trash' /></button>;
        } else if (type == 'custom') {
            result = <button {...properties} className={'btn btn-circle ' + customClassName}><i className={'fa fa-lg ' + customIcon} /></button>;
        } else {
            result = (
                <Link to={to} className='btn btn-secondary btn-circle' style={{ position: 'fixed', bottom: '10px', zIndex: 500, ...style }}>
                    <i className='fa fa-lg fa-reply' />
                </Link>);
        }
        return result;
    }
}

export class AdminModal extends React.Component {
    state = { display: '' };
    _data = {};

    onShown = (modalShown) => {
        $(this.modal).on('shown.bs.modal', () => modalShown());
    }

    show = (item, arg) => {
        this.onShow && this.onShow(item, arg);
        $(this.modal).modal('show');
    }

    hide = () => {
        this.onHide && this.onHide();
        $(this.modal).modal('hide');
    }

    data = (key, value) => {
        if (value === '' || value) {
            this._data[key] = value;
        } else {
            return this._data[key];
        }
    }

    renderModal = ({ title, body, size, buttons, isLoading = false }) => {
        const { readOnly = false } = this.props;
        return (
            <div className='modal fade' tabIndex='-1' role='dialog' ref={e => this.modal = e}>
                <form className={'modal-dialog' + (size == 'large' ? ' modal-lg' : '')} role='document' onSubmit={e => { e.preventDefault() || this.onSubmit && this.onSubmit(e); }}>
                    <div className='modal-content'>
                        <div className='modal-header'>
                            <h5 className='modal-title'>{title}</h5>
                            <button type='button' className='close' data-dismiss='modal' aria-label='Close'>
                                <span aria-hidden='true'>&times;</span>
                            </button>
                        </div>
                        <div className='modal-body'>{body}</div>
                        <div className='modal-footer'>
                            <button type='button' className='btn btn-secondary' data-dismiss='modal'>
                                <i className='fa fa-fw fa-lg fa-times' />Đóng
                            </button>
                            {readOnly == true ? null :
                                <button type='submit' className='btn btn-primary' disabled={isLoading}>
                                    {isLoading ? <i className='fa fa-spin fa-lg fa-spinner' /> : <i className='fa fa-fw fa-lg fa-save' />} Lưu
                                </button>}
                            {buttons}
                        </div>
                    </div>
                </form>
            </div>);
    }

    render = () => null;
}

export class AdminPage extends React.Component {
    componentWillUnmount() {
        T.onSearch = null;
        T.onAdvanceSearchHide = null;

        this.willUnmount();
    }

    willUnmount = () => { };

    getCurrentPermissions = () => this.props.system && this.props.system.user && this.props.system.user.permissions ? this.props.system.user.permissions : [];

    getUserPermission = (prefix, listPermissions = ['read', 'write', 'delete']) => {
        const permission = {},
            currentPermissions = this.props.system && this.props.system.user && this.props.system.user.permissions ? this.props.system.user.permissions : [];
        listPermissions.forEach(item => permission[item] = currentPermissions.includes(`${prefix}:${item}`));
        return permission;
    }

    renderPage = ({ icon, title, subTitle, header, breadcrumb, advanceSearch, content, backRoute, onCreate, onSave, onExport, onImport }) => {
        if (breadcrumb == null) breadcrumb = [];

        let right = 10, createButton, saveButton, exportButton, importButton;
        if (onCreate) {
            createButton = <CirclePageButton type='create' onClick={onCreate} style={{ right }} />;
            right += 60;
        }
        if (onSave) {
            saveButton = <CirclePageButton type='save' onClick={onSave} style={{ right }} />;
            right += 60;
        }
        if (onExport) {
            exportButton = <CirclePageButton type='export' onClick={onExport} style={{ right }} />;
            right += 60;
        }
        if (onImport) {
            importButton = <CirclePageButton type='import' onClick={onImport} style={{ right }} />;
            right += 60;
        }

        return (
            <main className='app-content'>
                <div className='app-title'>
                    <div>
                        {/* {searchBox ? <AdminSearchBox /> : null} */}
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
                {content}
                {backRoute ? <CirclePageButton type='back' to={backRoute} /> : null}
                {importButton} {exportButton} {saveButton} {createButton}
            </main>);
    }

    render() { return null; }
}
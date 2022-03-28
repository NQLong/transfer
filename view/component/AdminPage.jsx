import React from 'react';
import { Link } from 'react-router-dom';
import ImageBox from 'view/component/ImageBox';
import FileBox from 'view/component/FileBox';
import Editor from 'view/component/CkEditor4';
import Datetime from 'react-datetime';
import InputMask from 'react-input-mask';
import NumberFormat from 'react-number-format';
import 'react-datetime/css/react-datetime.css';

// Table components ---------------------------------------------------------------------------------------------------
export class TableCell extends React.Component { // type = number | date | link | image | checkbox | buttons | text (default)
    render() {
        let { type = 'text', content = '', permission = {}, className = '', style = {}, contentStyle = {}, alt = '', display = true, rowSpan = 1, colSpan = 1, dateFormat, contentClassName = '' } = this.props;
        if (style == null) style = {};

        if (display != true) {
            return null;
        } else if (type == 'number') {
            return <td className={className} style={{ textAlign: 'right', ...style }} rowSpan={rowSpan} colSpan={colSpan}>{content && !isNaN(content) ? T.numberDisplay(content) : content}</td>;
        } else if (type == 'date') {
            return <td className={className} style={{ ...style }} rowSpan={rowSpan} colSpan={colSpan}>{dateFormat ? T.dateToText(content, dateFormat) : new Date(content).getText()}</td>;
        } else if (type == 'link') {
            let url = this.props.url ? this.props.url.trim() : '',
                onClick = this.props.onClick;
            if (onClick) {
                return <td className={className} style={{ ...style }} rowSpan={rowSpan} colSpan={colSpan}><a href='#' style={contentStyle} onClick={e => e.preventDefault() || onClick(e)}>{content}</a></td>;
            } else {
                return url.startsWith('http://') || url.startsWith('https://') ?
                    <td className={className} style={{ textAlign: 'left', ...style }} rowSpan={rowSpan} colSpan={colSpan}><a href={url} target='_blank' rel='noreferrer' style={contentStyle}>{content}</a></td> :
                    <td className={className} style={{ textAlign: 'left', ...style }} rowSpan={rowSpan} colSpan={colSpan}><Link to={url} style={contentStyle}>{content}</Link></td>;
            }
        } else if (type == 'image') {
            return content ?
                <td style={{ textAlign: 'center', ...style }} className={className} rowSpan={rowSpan} colSpan={colSpan}><img src={content} alt={alt} style={{ height: '32px' }} /></td> :
                <td style={{ textAlign: 'center', ...style }} className={className} rowSpan={rowSpan} colSpan={colSpan}>{alt}</td>;
        } else if (type == 'checkbox') {
            return (
                <td style={{ textAlign: 'center', ...style }} className={'toggle ' + className} rowSpan={rowSpan} colSpan={colSpan}>
                    <label>
                        <input type='checkbox' checked={content} onChange={() => permission.write && this.props.onChanged(content ? 0 : 1)} />
                        <span className='button-indecator' />
                    </label>
                </td>);
        } else if (type == 'buttons') {
            const { onSwap, onEdit, onDelete, children } = this.props;
            return (
                <td className={className} style={{ ...style }} rowSpan={rowSpan} colSpan={colSpan}>
                    <div className='btn-group'>
                        {children}
                        {permission.write && onSwap ?
                            <a className='btn btn-warning' href='#' onClick={e => e.preventDefault() || onSwap(e, content, true)}><i className='fa fa-lg fa-arrow-up' /></a> : null}
                        {permission.write && onSwap ?
                            <a className='btn btn-warning' href='#' onClick={e => e.preventDefault() || onSwap(e, content, false)}><i className='fa fa-lg fa-arrow-down' /></a> : null}
                        {onEdit && typeof onEdit == 'function' ?
                            <a className='btn btn-primary' href='#' title='Chỉnh sửa' onClick={e => e.preventDefault() || onEdit(e, content)}><i className={'fa fa-lg ' + (permission.write ? 'fa-edit' : 'fa-eye')} /></a> : null}
                        {onEdit && typeof onEdit == 'string' ?
                            <Link to={onEdit} className='btn btn-primary'><i className='fa fa-lg fa-edit' /></Link> : null}
                        {permission.delete && onDelete ?
                            <a className='btn btn-danger' href='#' title='Xóa' onClick={e => e.preventDefault() || onDelete(e, content)}><i className='fa fa-lg fa-trash' /></a> : null}
                    </div>
                </td>);
        } else {
            return <td className={className} style={{ ...style }} rowSpan={rowSpan} colSpan={colSpan}><div style={contentStyle} className={contentClassName}>{content}</div></td>;
        }
    }
}

export function renderTable({
    style = {}, className = '', getDataSource = () => null, loadingText = 'Đang tải...', emptyTable = 'Chưa có dữ liệu!', stickyHead = false,
    renderHead = () => null, renderRow = () => null, header = 'thead-dark'
}) {
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
                <thead className={header}>{renderHead()}</thead>
                <tbody>{typeof renderRow == 'function' ? list.map(renderRow) : renderRow}</tbody>
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
        return <b>{emptyTable}</b>;
    }
}

// Form components ----------------------------------------------------------------------------------------------------
export class FormTabs extends React.Component {
    randomKey = T.randomPassword(8)
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

    tabClick = (e, index) => {
        e && e.preventDefault();
        $(`a[href='#${(this.props.id || 'tab')}_${index}${this.randomKey}']`).click();
    }
    render() {
        const { tabClassName = '', contentClassName = '', tabs = [] } = this.props,
            id = this.props.id || 'tab',
            tabLinks = [], tabPanes = [];
        tabs.forEach((item, index) => {
            const tabId = id + '_' + index + this.randomKey,
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
    static defaultProps = { formType: 'checkBox' };
    state = { checked: false };

    value = (checked) => {
        if (checked != null) {
            this.setState({ checked });
        } else {
            return this.state.checked;
        }
    }

    onCheck = () => this.props.readOnly || this.setState({ checked: !this.state.checked }, () => this.props.onChange && this.props.onChange(this.state.checked));

    render() {
        let { className = '', label, style, isSwitch = false, trueClassName = 'text-primary', falseClassName = 'text', inline = true } = this.props;
        if (style == null) style = {};
        return isSwitch ? (
            <div className={className} style={{ ...style, display: inline ? 'inline-flex' : '' }}>
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
                    <span className={'label-text ' + (this.props.readOnly ? 'text-secondary' : (this.state.checked ? trueClassName : falseClassName))}>{label}</span>
                </label>
            </div>
        );
    }
}

class FormNumberBox extends React.Component {
    exactValue = null;
    state = { value: '' };

    value = function (text) {
        if (arguments.length) {
            this.exactValue = null;
            this.setState({ value: text }, () => {
                if (this.exactValue == null) this.exactValue = this.state.value;
            });
        } else {
            return this.exactValue;
        }
    }

    focus = () => this.input.focus();

    checkMinMax = (val) => {
        const { min = '', max = '' } = this.props;
        if (!isNaN(parseFloat(min)) || !isNaN(parseFloat(max))) { // Có properties min hoặc max
            if (!isNaN(parseFloat(min)) && val < parseFloat(min)) { // Có properties min và val < min
                return min.toString();
            }
            if (!isNaN(parseFloat(max)) && val > parseFloat(max)) { // Có properties max và val > max
                return max.toString();
            }
            return false;
        } else {
            return false;
        }
    }

    render() {
        let { smallText = '', label = '', placeholder = '', className = '', style = {}, readOnly = false, onChange = null, required = false, step = false } = this.props,
            readOnlyText = this.exactValue ? this.exactValue : this.state.value;
        const properties = {
            className: 'form-control',
            placeholder: label || placeholder,
            value: this.exactValue ? this.exactValue : this.state.value,
            thousandSeparator: ',',
            decimalSeparator: step ? '.' : false,
            onValueChange: val => {
                const newValue = this.checkMinMax(val.floatValue);
                if (newValue != false) {
                    this.setState({ value: newValue });
                } else {
                    this.exactValue = val.floatValue;
                    onChange && onChange(val.floatValue);
                }
            },
            getInputRef: e => this.input = e
        };
        readOnlyText = readOnlyText ? T.numberDisplay(readOnlyText, ',') : '';
        let displayElement = '';
        if (label) {
            displayElement = <><label onClick={() => this.input.focus()}>{label}{!readOnly && required ? <span style={{ color: 'red' }}> *</span> : ''}</label>{readOnly ? <>: <b>{readOnlyText}</b></> : ''}</>;
        } else {
            displayElement = readOnly ? <b>{readOnlyText}</b> : '';
        }

        return (
            <div className={'form-group ' + (className || '')} style={style}>
                {displayElement}
                <NumberFormat style={{ display: readOnly ? 'none' : 'block' }} {...properties} />
                {smallText ? <small>{smallText}</small> : null}
            </div>);
    }
}

class FormYearBox extends React.Component {
    state = { value: '' };

    value = function (value) {
        if (arguments.length) {
            this.setState({ value: value.toString() });
        } else {
            return this.state.value.includes('_') ? '' : this.state.value;
        }
    }

    focus = () => this.input.getInputDOMNode().focus()

    handleChange = event => {
        event.preventDefault && event.preventDefault();
        this.setState({ value: event.target.value }, () => {
            this.props.onChange && this.props.onChange(this.state.value);
        });
    }

    render() {
        let { smallText = '', label = '', placeholder = '', className = '', style = {}, readOnly = false, required = false } = this.props,
            readOnlyText = this.state.value;
        let displayElement = '';
        if (label) {
            displayElement = <><label onClick={() => this.focus()}>{label}{!readOnly && required ? <span style={{ color: 'red' }}> *</span> : ''}</label>{readOnly ? <>: <b>{readOnlyText}</b></> : ''}</>;
        } else {
            displayElement = readOnly ? <b>{readOnlyText}</b> : '';
        }

        return (
            <div className={'form-group ' + (className || '')} style={style}>
                {displayElement}
                <InputMask ref={e => this.input = e} className='form-control' mask={'2099'} onChange={this.handleChange} style={{ display: readOnly ? 'none' : '' }} formatChars={{ '2': '[12]', '0': '[09]', '1': '[01]', '3': '[0-3]', '9': '[0-9]', '5': '[0-5]', 'h': '[0-2]' }} value={this.state.value} readOnly={readOnly} placeholder={placeholder || label} />
                {smallText ? <small>{smallText}</small> : null}
            </div>);
    }
}

export class FormTextBox extends React.Component {
    static defaultProps = { formType: 'textBox' }
    state = { value: '' };

    value = function (text) {
        if (arguments.length) {
            if (this.props.type == 'number' || this.props.type == 'year') {
                this.input.value(text);
            } else {
                this.setState({ value: text });
            }
        } else {
            if (this.props.type == 'number' || this.props.type == 'year') {
                return this.input.value();
            }
            return this.state.value;
        }
    }

    focus = () => this.input.focus();
    clear = () => this.input.clear();

    render() {
        let { type = 'text', smallText = '', label = '', placeholder = '', className = '', style = {}, readOnly = false, onChange = null, required = false } = this.props,
            readOnlyText = this.state.value;
        type = type.toLowerCase(); // type = text | number | email | password | phone | year
        if (type == 'number') {
            return <FormNumberBox ref={e => this.input = e} {...this.props} />;
        } else if (type == 'year') {
            return <FormYearBox ref={e => this.input = e} {...this.props} />;
        } else {
            const properties = {
                type,
                className: 'form-control',
                placeholder: placeholder || label,
                value: this.state.value,
                onChange: e => this.setState({ value: e.target.value }) || (onChange && onChange(e))
            };
            if (type == 'password') properties.autoComplete = 'new-password';
            if (type == 'phone') {
                if (readOnlyText) readOnlyText = T.mobileDisplay(readOnlyText);
                properties.onKeyPress = e => ((!/[0-9]/.test(e.key)) && e.preventDefault());
            }
            let displayElement = '';
            if (label) {
                displayElement = <><label onClick={() => this.input.focus()}>{label}{!readOnly && required ? <span style={{ color: 'red' }}> *</span> : ''}</label>{readOnly ? <>: <b>{readOnlyText}</b></> : ''}</>;
            } else {
                displayElement = readOnly ? <b>{readOnlyText}</b> : '';
            }

            return (
                <div className={'form-group ' + (className || '')} style={style}>
                    {displayElement}
                    <input ref={e => this.input = e} style={{ display: readOnly ? 'none' : 'block' }}{...properties} />
                    {smallText ? <small>{smallText}</small> : null}
                </div>);
        }
    }
}

export class FormRichTextBox extends React.Component {
    static defaultProps = { formType: 'richTextBox' }
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
        const { style = {}, rows = 3, label = '', placeholder = '', className = '', readOnly = false, onChange = null, required = false } = this.props;
        let displayElement = '';
        if (label) {
            displayElement = <><label onClick={() => this.input.focus()}>{label}{!readOnly && required ? <span style={{ color: 'red' }}> *</span> : ''}</label>{readOnly && this.state.value ? <>: <br /> <b>{this.state.value}</b></> : ''}</>;
        } else {
            displayElement = readOnly ? <b>{this.state.value}</b> : '';
        }
        return (
            <div className={'form-group ' + (className ? className : '')} style={style}>
                {displayElement}
                <textarea ref={e => this.input = e} className='form-control' style={{ display: readOnly ? 'none' : 'block' }} placeholder={placeholder ? placeholder : label} value={this.state.value} rows={rows} onChange={e => this.setState({ value: e.target.value }) || onChange && onChange(e)} />
            </div>);
    }
}

export class FormEditor extends React.Component {
    static defaultProps = { formType: 'editor' }
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
        let { height = '400px', label = '', className = '', readOnly = false, uploadUrl = '', smallText = '', required = false } = this.props;
        className = 'form-group' + (className ? ' ' + className : '');
        return (
            <div className={className}>
                <label>{label}{!readOnly && required ? <span style={{ color: 'red' }}> *</span> : ''}</label>{readOnly && this.state.value ? <br /> : ''}
                <p style={{ width: '100%', fontWeight: 'bold', display: readOnly ? 'block' : 'none' }} dangerouslySetInnerHTML={{ __html: this.state.value }} />
                {!readOnly && smallText ? <small className='form-text text-muted'>{smallText}</small> : null}
                <div style={{ display: readOnly ? 'none' : 'block' }}>
                    <Editor ref={e => this.input = e} height={height} placeholder={label} uploadUrl={uploadUrl} />
                </div>
            </div>);
    }
}

export class FormSelect extends React.Component {
    static defaultProps = { formType: 'selectBox' }
    state = { valueText: '', hasInit: false };
    hasInit = false;

    componentDidMount() {
        const { label, placeholder } = this.props;
        $(this.input).select2({ placeholder: placeholder || label });
        $(this.input).on('select2:select', e => this.props.onChange && this.props.onChange(e.params.data));
        $(this.input).on('select2:unselect', e => this.props.onChange && this.props.onChange(this.props.multiple ? e.params.data : null));
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

    focus = () => !this.props.readOnly && $(this.input).select2('open');

    clear = () => $(this.input).val('').trigger('change') && $(this.input).html('');

    value = function (value, done = null) {
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
                done && done();
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
                            done && done();
                            this.setState({ valueText: valueTexts.join(', ') });
                        });
                    } else {
                        if ((typeof value == 'string' || typeof value == 'number') && data.fetchOne) {
                            data.fetchOne(value, _item => {
                                const option = new Option(_item.text, _item.id, true, true);
                                $(this.input).append(option).trigger('change');
                                done && done();
                                // Async set readOnlyText
                                this.setState({ valueText: _item.text });
                            });
                        } else if (value.hasOwnProperty('id') && value.hasOwnProperty('text')) {
                            $(this.input).select2('trigger', 'select', { data: value });
                            done && done();
                        } else {
                            $(this.input).select2('trigger', 'select', { data: { id: value, text: value } });
                            done && done();
                        }
                    }
                } else {
                    $(this.input).val(null).trigger('change');
                    done && done();
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

    data = () => {
        const inputData = $(this.input).select2('data');
        if (this.props.multiple) {
            return inputData.map(item => ({ id: item.id, text: item.text }));
        } else {
            return { id: inputData[0].id, text: inputData[0].text };
        }
    };

    render = () => {
        const { className = '', style = {}, labelStyle = {}, label = '', multiple = false, readOnly = false, required = false } = this.props;
        return (
            <div className={'form-group admin-form-select ' + className} style={style}>
                {label ? <label style={labelStyle} onClick={this.focus}>{label}{!readOnly && required ? <span style={{ color: 'red' }}> *</span> : ''}{readOnly ? ':' : ''}</label> : null} {readOnly ? <b>{this.state.valueText}</b> : ''}
                <div style={{ width: '100%', display: readOnly ? 'none' : 'inline-flex' }}>
                    <select ref={e => this.input = e} multiple={multiple} disabled={readOnly} />
                </div>
            </div>
        );
    }
}

export class FormDatePicker extends React.Component {
    static defaultProps = { formType: 'datePicker', type: 'date' };

    mask = {
        'time-mask': '39/19/2099 h9:59',
        'date-mask': '39/19/2099',
        'month-mask': '19/2099',
        'year-mask': '2099',
        'date-month': '39/19'
    };

    format = {
        'time-mask': 'dd/mm/yyyy HH:MM',
        'date-mask': 'dd/mm/yyyy',
        'month-mask': 'mm/yyyy',
        'year-mask': 'yyyy',
        'date-month': 'dd/mm'
    };

    state = { value: '', readOnlyText: '' };

    value = function (date) {
        const type = this.props.type;
        if (arguments.length) {
            if (type == 'date-month') {
                const value = date ? T.dateToText(new Date(date), this.format[type]) : '';
                this.setState({ value, readOnlyText: value });
            } else if (type.endsWith('-mask')) {
                const value = date ? T.dateToText(new Date(date), this.format[type]) : '';
                this.setState({ value, readOnlyText: value });
            } else {
                this.setState({
                    value: date ? new Date(date) : '',
                    readOnlyText: date ? T.dateToText(new Date(date), type == 'date' ? 'dd/mm/yyyy' : type == 'dd/mm' ? 'dd/mm' : 'dd/mm/yyyy HH:MM') : ''
                });
            }
        } else {
            if (type == 'date-month') {
                const date = T.formatDate(this.state.value + '/' + this.props.year);
                if (date == null || Number.isNaN(date.getTime())) return '';
                return date;
            } else if (type.endsWith('-mask')) {
                const date = T.formatDate((type == 'month-mask' ? '01/' : (type == 'year-mask' ? '01/01/' : '')) + this.state.value);
                if (date == null || Number.isNaN(date.getTime())) return '';
                return date;
            } else {
                return this.state.value;
            }
        }
    }

    focus = () => {
        const type = this.props.type;
        if (type == 'date-month') {
            this.input.getInputDOMNode().focus();
        } else if (type.endsWith('-mask')) {
            this.input.getInputDOMNode().focus();
        } else {
            $(this.inputRef).focus();
        }
    }

    handleChange = event => {
        const type = this.props.type;
        event.preventDefault && event.preventDefault();
        this.setState({ value: (type.endsWith('-mask') || type == 'date-month') ? event.target.value : new Date(event) }, () => {
            this.props.onChange && this.props.onChange(this.value());
        });
    }

    render() {
        let { label = '', type = 'date', className = '', readOnly = false, required = false, style = {} } = this.props; // type = date || time || date-mask || time-mask || month-mask
        return (
            <div className={'form-group ' + (className || '')} style={style}>
                <label onClick={() => this.focus()}>{label}{!readOnly && required ? <span style={{ color: 'red' }}> *</span> : ''}</label>{readOnly && this.state.value ? <>: <b>{this.state.readOnlyText}</b></> : ''}
                {(type.endsWith('-mask') || type == 'date-month') ? (
                    <InputMask ref={e => this.input = e} className='form-control' mask={this.mask[type]} onChange={this.handleChange} style={{ display: readOnly ? 'none' : '' }} formatChars={{ '2': '[12]', '0': '[09]', '1': '[01]', '3': '[0-3]', '9': '[0-9]', '5': '[0-5]', 'h': '[0-2]' }} value={this.state.value} readOnly={readOnly} placeholder={label} />
                ) : (
                    <Datetime ref={e => this.input = e} timeFormat={type == 'time' ? 'HH:mm' : false} dateFormat={type == 'dd/mm' ? 'DD/MM' : 'DD/MM/YYYY'} inputProps={{ placeholder: label, ref: e => this.inputRef = e, readOnly, style: { display: readOnly ? 'none' : '' } }} value={this.state.value} onChange={e => this.handleChange(e)} closeOnSelect={true} />
                )}
            </div>);
    }
}

export class FormImageBox extends React.Component {
    setData = (data, image) => this.imageBox.setData(data, image);

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
        let { label = '', className = '', pending = false, style = {}, readOnly = false, postUrl = '/user/upload', uploadType = '', onDelete = null, onSuccess = null } = this.props;
        return (
            <div className={'form-group ' + className} style={style}>
                {label && <label>{label}&nbsp;</label>}
                {!readOnly && onDelete ? <a href='#' className='text-danger' onClick={onDelete}><i className='fa fa-fw fa-lg fa-trash' /></a> : null}
                <FileBox ref={e => this.fileBox = e} pending={pending} postUrl={postUrl} uploadType={uploadType} readOnly={readOnly} success={data => onSuccess && onSuccess(data)} />
            </div>);
    }
}

export function getValue(input) {
    const data = input.value();
    if (!input.props || !input.props.required) return data;
    const formType = input.props.formType;
    switch (formType) {
        case 'textBox': {
            if ((data && data !== '') || data === 0) return data;
            throw input;
        }

        case 'richTextBox':
        case 'editor':
        case 'datePicker': {
            if (data && data !== '') return data;
            throw input;
        }

        case 'selectBox': {
            const multiple = input.props.multiple || false;
            if (!!multiple && data && Array.isArray(data) && data.length) return data;
            if (!multiple && data) return data;
            throw input;
        }

        default:
            return data;
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
            onClick
        };
        let result = null;
        if (type == 'save') {
            result = <button {...properties} className='btn btn-primary btn-circle'><i className='fa fa-lg fa-save' /></button>;
        } else if (type == 'search') {
            result = <button {...properties} className='btn btn-primary btn-circle'><i className='fa fa-lg fa-search' /></button>;
        } else if (type == 'create') {
            result = <button {...properties} className='btn btn-info btn-circle'><i className='fa fa-lg fa-plus' /></button>;
        } else if (type == 'export') {
            result = <button {...properties} className='btn btn-success btn-circle'><i className='fa fa-lg fa-file-excel-o' /></button>;
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

    componentWillUnmount() {
        this.hide();
    }

    onShown = (modalShown) => {
        $(this.modal).on('shown.bs.modal', () => modalShown());
    }

    onHidden = (modalHidden) => {
        $(this.modal).on('hidden.bs.modal', () => modalHidden());
    }

    show = (item, multiple = null) => {
        if (this.onShow) {
            if (multiple != null) this.onShow(item, multiple);
            else this.onShow(item);
        }
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

    submit = (e) => {
        try {
            this.onSubmit(e);
        } catch (input) {
            if (input && input.props) {
                T.notify((input.props.label || 'Dữ liệu') + ' bị trống!', 'danger');
                input.focus();
            }
        }
    }

    renderModal = ({ title, body, size, buttons, isLoading = false, submitText = 'Lưu', isShowSubmit = true, style = {} }) => {
        const { readOnly = false } = this.props;
        return (
            <div className='modal fade' role='dialog' ref={e => this.modal = e} style={style}>
                <form className={'modal-dialog' + (size == 'large' ? ' modal-lg' : (size == 'elarge' ? ' modal-xl' : ''))} role='document' onSubmit={e => { e.preventDefault() || this.onSubmit && this.submit(e); }}>
                    <div className='modal-content'>
                        <div className='modal-header'>
                            <h5 className='modal-title'>{title}</h5>
                            <button type='button' className='close' data-dismiss='modal' aria-label='Close'>
                                <span aria-hidden='true'>&times;</span>
                            </button>
                        </div>
                        <div className='modal-body'>{body}</div>
                        <div className='modal-footer'>
                            {buttons}
                            <button type='button' className='btn btn-secondary' data-dismiss='modal'>
                                <i className='fa fa-fw fa-lg fa-times' />Đóng
                            </button>
                            {!isShowSubmit || readOnly == true || !this.onSubmit ? null :
                                <button type='submit' className='btn btn-primary' disabled={isLoading}>
                                    {isLoading ? <i className='fa fa-spin fa-lg fa-spinner' /> : <i className='fa fa-fw fa-lg fa-save' />} {submitText}
                                </button>}
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
        const permission = {}, currentPermissions = this.getCurrentPermissions();
        listPermissions.forEach(item => permission[item] = currentPermissions.includes(`${prefix}:${item}`));
        return permission;
    }

    showAdvanceSearch = () => $(this.advanceSearchBox).addClass('show');

    renderPage = ({ icon, title, subTitle, header, breadcrumb, advanceSearch, content, backRoute, onCreate, onSave, onExport, onImport }) => {

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
                        <h1><i className={icon} /> {title}</h1>
                        <p>{subTitle}</p>
                    </div>
                    <ul className='app-breadcrumb breadcrumb'>
                        {header}
                        {breadcrumb != null ? <Link to='/user'><i className='fa fa-home fa-lg' /></Link> : ''}
                        {breadcrumb != null ? breadcrumb.map((item, index) => <span key={index}>&nbsp;/&nbsp;{item}</span>) : ''}
                    </ul>
                </div>
                <div className='app-advance-search' ref={e => this.advanceSearchBox = e}>
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

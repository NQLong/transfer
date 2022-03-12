import React from 'react';
import PropTypes from 'prop-types';
import InputMask from 'react-input-mask';
import './Input.css';
import T from '../../view/js/common.js';

// TODO:
// - support CKEditor
// - filter on Select ajax
//    eg: select canBo that belong to PTCHC: filter={ maDonVi: '02' }
// support custom vaidity
//    eg: email, phone


// OFFICIAL EXAMPLE:
// ../../module/qtNuocNgoai/form


export class InputBase extends React.Component {
    constructor (props) {
        if (new.target === InputBase) throw new TypeError('Cannot construct InputBase instances directly');
        super(props);
        this.input = React.createRef();
        let _$input = null;
        this.$input = () => _$input && _$input[0] ? _$input : (_$input = $(this.input.current));
    }

    static defaultProps = {
        label: '',
        placeholder: '',
        defaultValue: null,
        disabled: false,
        readOnly: false,
        required: false,
        onEnter: () => { },
        onChange: () => { },
        validity: () => true,
        displayLabel: true,
    };

    getValidityObject = () => ({
        required: { test: () => this.isDisabled() || !this.props.required || !this.isEmpty(), message: 'Hãy nhập vào trường này' },
    });

    val = value => {
        if (value) this.setVal(value);
        else return this.getVal();
    };

    setVal = (value, done) => this.input.current.setVal(value, done);

    getVal = () => this.input.current.getVal();

    getFormVal = () => {
        // value input                      { data: 2 }, { data: [1, 2] }, { data: '' }, { data: false }, { data: 0 }
        // disabled input                   { disabled: true, data: 2 }
        // this.isEmpty() + not required    { data: '' }
        // this.isEmpty() + required        { error: { notFilled: true, input: <InputBase> } }
        // invalid                          { error: { invalid: true, input: <InputBase> } }
        this.$input().removeClass(['valid', 'invalid']);
        let error = null;
        Object.entries(this.getValidityObject()).some(([key, rule]) => {
            if (!rule.test()) {
                error = { [key]: true, message: rule.message, input: this.$input()[0] };
                this.$input()[0].setCustomValidity(rule.message);
                return true;
            }
        });
        if (error) {
            this.$input().addClass('invalid');
            return { error };
        } else {
            const data = this.getVal();
            if (this.isDisabled()) return { data, disabled: true };
            if (this.isEmpty()) return { data: '' };
            this.$input().addClass('valid');
            this.$input()[0].setCustomValidity('');
            return { data };
        }
    }

    onBlur = () => this.getFormVal();

    clear = () => this.input.current.clear();

    disable = isDisable => this.input.current.disable(isDisable);

    disable = isDisable => this.$input().prop('disabled', isDisable);

    isDisabled = () => this.$input().prop('disabled');

    isEmpty = () => this.$input().val() === '';

    focus = () => this.$input().focus();

    keyPressed = e => {
        if (e.keyCode === 13 && !e.shiftKey) {
            this.onEnter && this.onEnter(e);
        }
    }

    wrapLabel = (input, style) => {
        const labelStyle = Object.assign({}, { width: '100%', marginBottom: '0' }, style || {});
        return (<label style={labelStyle}>
            {this.props.displayLabel ? <div style={{ marginBottom: '0.5rem' }}>{this.props.label}{this.props.required && <span style={{ color: 'red' }}> *</span>}</div> : null}
            {input}
        </label>);
    }

    render = () => null;
}

export class DateInput extends InputBase {
    static defaultProps = {
        ...InputBase.defaultProps,
        defaultValue: NaN,
        type: 'date',
        // min: new Date(0).getTime(),
        // max: Date.nextYear().roundDate().getTime(),
        min: -999999999999999,
        max: 999999999999999,
    }

    state = { value: this.props.defaultValue };

    static #mask = {
        minute: '39/19/2099 h9:59',
        date: '39/19/2099',
        month: '19/2099',
        year: '2099'
    };

    #getDateFormat = () => DateInput.#mask[this.props.type].length <= 10 ?
        'dd/mm/yyyy'.slice(-DateInput.#mask[this.props.type].length) :
        'dd/mm/yyyy HH:MM:ss'.slice(0, DateInput.#mask[this.props.type].length);

    $input = () => this._$input || (this._$input = $(this.input.current.getInputDOMNode()));

    getValidityObject = () => ({
        required: { test: () => this.isDisabled() || !this.props.required || !this.isEmpty(), message: 'Hãy nhập thời gian.' },
        incomplete: { test: () => ((this.isDisabled() || !this.props.required) && this.isEmpty()) || this.getVal() !== '', message: 'Hãy nhập thời gian đúng định dạng.' },
        valid: { test: () => ((this.isDisabled() || !this.props.required) && this.isEmpty()) || this.state.value === T.dateToText(this.getVal(), this.#getDateFormat()), message: 'Hãy nhập thời gian hợp lệ' },
        min: { test: () => ((this.isDisabled() || !this.props.required) && this.isEmpty()) || this.getVal() >= this.props.min, message: 'Hãy nhập thời gian sau ' + T.dateToText(new Date(this.props.min), this.#getDateFormat()) },
        max: { test: () => ((this.isDisabled() || !this.props.required) && this.isEmpty()) || this.getVal() <= this.props.max, message: 'Hãy nhập thời gian trước ' + T.dateToText(new Date(this.props.max), this.#getDateFormat()) },
    });

    isEmpty = () => !this.state.value || !/\d/.test(this.state.value);

    disable = isDisable => this.$input().prop('disabled', isDisable === undefined || !!isDisable);

    clear = () => this.setState({ value: '' });

    setVal = timestamp => {
        this.setState({ value: timestamp ? T.dateToText(timestamp, this.#getDateFormat()) : '' }, () => this.props.onChange && this.props.onChange(this.getVal()));
    }

    getVal = () => {
        if (this.isEmpty()) return '';
        let dateValue = this.state.value;
        if (!dateValue) return '';
        if (this.props.type === 'month') dateValue = '01/' + dateValue;
        else if (this.props.type === 'year') dateValue = '01/01/' + dateValue;

        const date = T.formatDate(dateValue);

        if (Number.isNaN(date.getTime())) return '';
        return date.getTime();
    }

    focus = () => this.input.current.getInputDOMNode().focus();

    #handleOnChange = event => {
        event.preventDefault();
        this.setState({ value: event.target.value }, () => {
            this.getFormVal();
            this.props.onChange && this.props.onChange(this.getVal());
        });
    };

    render = () => this.wrapLabel(
        <InputMask
            ref={this.input} className='form-control' formatChars={{ '2': '[12]', '0': '[09]', '1': '[01]', '3': '[0-3]', '9': '[0-9]', '5': '[0-5]', 'h': '[0-2]' }} value={this.state.value}
            disabled={this.props.disabled} readOnly={this.props.readOnly} mask={DateInput.#mask[this.props.type] || DateInput.#mask.date} placeholder={this.props.placeholder || 'Nhập ' + this.props.label.lowFirstChar()}
            onChange={this.#handleOnChange} onKeyDown={this.keyPressed} onBlur={this.onBlur} />
    );
}

export default class TextInput extends InputBase {
    static defaultProps = {
        ...InputBase.defaultProps,
        defaultValue: '',
        type: 'text',
        maxLength: 2000
    }

    state = { value: this.props.defaultValue };

    disable = isDisable => this.$input().prop('disabled', isDisable === undefined || !!isDisable);

    clear = () => this.setVal('');

    setVal = value => this.setState({ value: value == null ? '' : value }, this.props.onChange && this.props.onChange(this.getVal()));

    getVal = () => this.state.value;

    #handleOnChange = event => {
        event.preventDefault();
        this.setState({ value: event.target.value }, () => {
            this.getFormVal();
            this.props.onChange && this.props.onChange(this.getVal());
        });
    }

    render = () => this.wrapLabel(
        <input ref={this.input} className='form-control' value={this.state.value} onKeyPress={this.props.onKeyPress ? this.props.onKeyPress : null}
            disabled={this.props.disabled} readOnly={this.props.readOnly} type={this.props.type} placeholder={this.props.placeholder || 'Nhập ' + this.props.label.lowFirstChar()} maxLength={this.props.maxLength}
            onKeyUp={this.props.onKeyUp ? this.props.onKeyUp : this.keyPressed} onBlur={this.onBlur} onChange={this.#handleOnChange} />
    );
}

export class NumberInput extends InputBase {
    static defaultProps = {
        ...InputBase.defaultProps,
        min: -Infinity,
        max: Infinity,
        step: 1,
        defaultValue: '',
        isFloat: true,
    }

    getValidityObject = () => ({
        required: { test: () => this.isDisabled() || !this.props.required || !this.isEmpty(), message: 'Hãy nhập một số' },
        valid: { test: () => this.isDisabled() || !this.props.required || !Number.isNaN(this.getVal()), message: 'Hãy nhập một số hợp lệ' },
        min: { test: () => this.getVal() >= this.props.min, message: 'Hãy nhập số lớn hơn ' + this.props.min },
        max: { test: () => this.getVal() <= this.props.max, message: 'Hãy nhập số nhỏ hơn ' + this.props.max },
        float: { test: () => this.props.isFloat || Number.isInteger(this.getVal()), message: 'Hãy nhập số nguyên' },
    });

    state = { value: this.props.defaultValue };

    disable = isDisable => this.$input().prop('disabled', isDisable === undefined || !!isDisable);

    clear = () => this.setVal('');

    setVal = value => this.setState({ value: value == null ? '' : value }, this.props.onChange && this.props.onChange(this.getVal()));

    getVal = () => Number(this.state.value);

    #handleOnChange = event => {
        event.preventDefault();
        this.setState({ value: event.target.value }, () => {
            this.getFormVal();
            this.props.onChange && this.props.onChange(this.getVal());
        });
    }

    render = () => this.wrapLabel(
        <input ref={this.input} type='number' className='form-control' value={this.state.value}
            disabled={this.props.disabled} readOnly={this.props.readOnly} placeholder={this.props.placeholder || 'Nhập ' + this.props.label.lowFirstChar()} max={this.props.max} min={this.props.min} step={this.props.step}
            onKeyDown={this.keyPressed} onBlur={this.onBlur} onChange={this.#handleOnChange} />
    );

}
//DateInput 2 cho KHCN
export class DateInput2 extends InputBase {
    static defaultProps = {
        ...InputBase.defaultProps,
        defaultValue: NaN,
        type: 'date',
        // min: new Date(0).getTime(),
        // max: Date.nextYear().roundDate().getTime(),
        min: -2209012924000,//01/01/1900 00:00
        max: 7289542800000,//31/12/2200 00:00
    }

    state = { value: this.props.defaultValue };

    static #mask = {
        minute: '39/19/2099 h9:59',
        date: '39/19/2099',
        month: '19/2099',
        year: '2099'
    };

    #getDateFormat = () => DateInput2.#mask[this.props.type].length <= 10 ?
        'dd/mm/yyyy'.slice(-DateInput2.#mask[this.props.type].length) :
        'dd/mm/yyyy HH:MM:ss'.slice(0, DateInput2.#mask[this.props.type].length);

    $input = () => this._$input || (this._$input = $(this.input.current.getInputDOMNode()));

    getValidityObject = () => ({
        required: { test: () => this.isDisabled() || !this.props.required || !this.isEmpty(), message: 'Hãy nhập thời gian.' },
        incomplete: { test: () => ((this.isDisabled() || !this.props.required) && this.isEmpty()) || this.getVal() !== '', message: 'Hãy nhập thời gian đúng định dạng.' },
        valid: { test: () => ((this.isDisabled() || !this.props.required) && this.isEmpty()) || this.state.value === T.dateToText(this.getVal(), this.#getDateFormat()), message: 'Hãy nhập thời gian hợp lệ' },
        min: { test: () => ((this.isDisabled() || !this.props.required) && this.isEmpty()) || this.getVal() >= this.props.min, message: 'Hãy nhập thời gian sau ' + T.dateToText(new Date(this.props.min), this.#getDateFormat()) },
        max: { test: () => ((this.isDisabled() || !this.props.required) && this.isEmpty()) || this.getVal() <= this.props.max, message: 'Hãy nhập thời gian trước ' + T.dateToText(new Date(this.props.max), this.#getDateFormat()) },
    });

    isEmpty = () => !this.state.value || !/\d/.test(this.state.value);

    disable = isDisable => this.$input().prop('disabled', isDisable === undefined || !!isDisable);

    clear = () => this.setState({ value: '' });

    setVal = timestamp => this.setState({ value: timestamp ? T.dateToText(timestamp, this.#getDateFormat()) : '' }, () => this.props.onChange && this.props.onChange(event));

    getVal = () => {
        if (this.isEmpty()) return '';
        let dateValue = this.state.value;
        if (!dateValue) return '';

        const date = T.formatDate(this.state.value);
        if (date == null || Number.isNaN(date.getTime())) return '';
        return date.getTime();
    }

    focus = () => this.input.current.getInputDOMNode().focus();

    #handleOnChange = event => {
        event.preventDefault();
        this.setState({ value: event.target.value }, () => {
            this.getFormVal();
            this.props.onChange && this.props.onChange(event);
        });
    };

    render = () => this.wrapLabel(
        <InputMask
            ref={this.input} className='form-control' formatChars={{ '2': '[12]', '0': '[09]', '1': '[01]', '3': '[0-3]', '9': '[0-9]', '5': '[0-5]', 'h': '[0-2]' }} value={this.state.value}
            disabled={this.props.disabled} readOnly={this.props.readOnly} mask={DateInput2.#mask[this.props.type] || DateInput.mask.date} placeholder={this.props.placeholder || 'Nhập ' + this.props.label.lowFirstChar()}
            onChange={this.#handleOnChange} onKeyDown={this.keyPressed} onBlur={this.onBlur} />
    );
}

export class TextareaInput extends InputBase {
    static defaultProps = {
        ...InputBase.defaultProps,
        defaultValue: '',
        maxLength: 2000
    }

    state = { value: this.props.defaultValue };

    disable = isDisable => this.$input().prop('disabled', isDisable === undefined || !!isDisable);

    clear = () => this.setVal('');

    setVal = value => this.setState({ value: value || '' }, this.props.onChange && this.props.onChange(this.getVal()));

    getVal = () => this.state.value || '';

    #handleOnChange = event => {
        event.preventDefault();
        this.setState({ value: event.target.value }, () => this.getFormVal());
        this.props.onChange && this.props.onChange(event.target.value);
    };

    render = () => this.wrapLabel(
        <textarea ref={this.input} className='form-control' value={this.state.value}
            disabled={this.props.disabled} readOnly={this.props.readOnly} placeholder={this.props.placeholder || 'Nhập ' + this.props.label.lowFirstChar()} maxLength={this.props.maxLength}
            onKeyDown={this.keyPressed} onBlur={this.onBlur} onChange={this.#handleOnChange} />
    );
}

export class BooleanInput extends InputBase {
    static defaultProps = {
        ...InputBase.defaultProps,
        defaultValue: false,
    }

    isEmpty = () => false;

    getValidityObject = () => ({});

    isEmpty = () => false;

    disable = isDisable => this.$input().prop('disabled', isDisable === undefined || !!isDisable);

    clear = () => this.setVal('');

    setVal = value => {
        this.input.current.checked = value;
        this.props.onChange && this.props.onChange(!!this.getVal());
    }

    getVal = () => this.input.current.checked ? 1 : 0;

    render = () => this.wrapLabel(
        <div className='toggle'>
            <label>
                <input ref={this.input} type='checkbox' disabled={this.props.disabled} onChange={event => this.props.onChange(!!event.target.checked)} defaultChecked={this.props.defaultValue} />
                <div className='button-indecator' />
            </label>
        </div>, { display: 'inline-flex' }
    );
}

export class Select extends InputBase {
    static defaultProps = {
        label: '',
        placeholder: '',
        defaultValue: null,
        disabled: false,
        readOnly: false,
        required: false,
        onEnter: () => { },
        onChange: () => { },
        validity: () => true,
        displayLabel: true,
    }
    static defaultProps = {
        ...InputBase.defaultProps,
        notFoundText: 'Không tìm thấy dữ liệu',
        multiple: false,
        adapter: null,
        filter: {},
        data: [],
    }

    static propTypes = {
        data: PropTypes.arrayOf(
            PropTypes.oneOfType([
                PropTypes.string,
                PropTypes.number,
                PropTypes.exact({
                    value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
                    text: PropTypes.string.isRequired
                })
            ])
        ),
        adapter: PropTypes.oneOfType([
            PropTypes.exact({
                ajax: PropTypes.oneOf([false]),
                tags: PropTypes.oneOf([true]),
                getAll: PropTypes.func.isRequired,
                processResults: PropTypes.func.isRequired,
                condition: PropTypes.object,
            }),
            PropTypes.exact({
                ajax: PropTypes.oneOf([true]),
                tags: PropTypes.oneOf([false]),
                url: PropTypes.string.isRequired,
                data: PropTypes.func.isRequired,
                processResults: PropTypes.func.isRequired,
                getOne: PropTypes.func,
                processResultOne: PropTypes.func,
            }),
        ]),
        label: PropTypes.string.isRequired,
    }

    state = { data: [] };

    getValidityObject = () => ({
        required: { test: () => this.isDisabled() || !this.props.required || !this.isEmpty(), message: 'Hãy chọn giá trị' },
    });

    isEmpty = () => this.props.multiple ?
        (!Array.isArray(this.getVal()) || this.getVal().length === 0) :
        this.getVal() === '';

    componentDidMount() {
        if (this.props.adapter) {
            if (this.props.adapter.ajax) {
                this.$input().select2({
                    tags: this.props.adapter.tags || false,
                    ajax: {
                        url: this.props.adapter.url,
                        data: this.props.adapter.data,
                        processResults: this.props.adapter.processResults,
                    },
                    minimumResultsForSearch: this.props.hideSearchBox ? -1 : 1,
                    dropdownParent: this.props.dropdownParent || $('.modal-body').has(this.input.current)[0] || $('.tile-body').has(this.input.current)[0],
                    placeholder: this.props.placeholder || 'Chọn ' + this.props.label,
                });
            } else {
                this.$input().select2({
                    minimumResultsForSearch: this.props.hideSearchBox ? -1 : 1,
                    tags: this.props.adapter.tags || false,
                    dropdownParent: this.props.dropdownParent || $('.modal-body').has(this.input.current)[0] || $('.tile-body').has(this.input.current)[0],
                    placeholder: this.props.placeholder || 'Chọn ' + this.props.label,
                });
                this.#fetchAll(() => this.setVal(this.props.defaultValue));
            }
        } else {
            this.$input().select2({
                minimumResultsForSearch: this.props.hideSearchBox ? -1 : 1,
                dropdownParent: this.props.dropdownParent || $('.modal-body').has(this.input.current)[0] || $('.tile-body').has(this.input.current)[0],
                placeholder: this.props.placeholder || 'Chọn ' + this.props.label,
            });
            this.setState({ data: this.props.data });
        }
        this.input.current.onchange = this.#handleOnChange;
        this.setVal(this.defaultValue);
    }

    #fetchAll = done => {
        if (this.props.adapter && !this.props.adapter.ajax && this.props.adapter.getAll) {
            const condition = this.props.adapter.condition || {};
            const callback = response => {
                const data = (this.props.adapter.processResults ? this.props.adapter.processResults(response) : response || { results: null }).results;
                this.setState({ data }, () => done && done(data));
            };
            let getAllCall = (this.props.adapter.getAll.length === 1 && this.props.adapter.getAll(callback)) || (this.props.adapter.getAll.length === 2 && this.props.adapter.getAll(condition, callback));
            if (typeof getAllCall === 'function') getAllCall(() => 0);
        }
    }

    componentDidUpdate(prevProps,) {
        if (this.props.adapter) {
            if (!this.props.adapter.ajax) {
                if (prevProps.adapter.condition !== this.props.adapter.condition && prevProps.value !== this.props.value) {
                    this.#fetchAll(() => { this.setVal(this.props.value); });
                } else if (prevProps.adapter.condition !== this.props.adapter.condition) {
                    this.#fetchAll(() => { });
                }
            }
        }

        if (JSON.stringify(prevProps.filter) !== JSON.stringify(this.props.filter)) {
            this.forceUpdate();
        }
        if (prevProps.readOnly !== this.props.readOnly) {
            this.forceUpdate();
        }
        if (prevProps.disabled !== this.props.disabled) {
            this.forceUpdate();
        }
    }

    disable = isDisable => this.$input().prop('disabled', isDisable === undefined || !!isDisable);

    clear = done => {
        this.$input().val('').trigger('change');
        done && done({ value: '', text: '' });
    }

    setVal = (value, done = () => 0) => {
        if (this.props.adapter) {
            if (this.props.adapter.ajax) {
                const setValByID = id => {
                    if (this.props.adapter.getOne) {
                        const a = this.props.adapter.getOne(id, response => {
                            response = this.props.adapter.processResultOne ? this.props.adapter.processResultOne(response) : response;
                            if (response) {
                                const { value, text } = response;
                                if (value && text) {
                                    const option = new Option(text, value, true, true);
                                    Object.keys(response).forEach(key => key !== 'text' && key !== 'value' && option.setAttribute(key, response[key]));
                                    this.$input().append(option).trigger('change');
                                    done(response);
                                } else {
                                    this.clear(done);
                                }
                            } else {
                                this.clear(done);
                            }
                        });
                        if (typeof a === 'function') a();
                    } else {
                        const option = new Option(value, value, true, true);
                        this.$input().append(option).trigger('change');
                        done(option);
                    }


                };
                if (value === null || value === undefined || (value.trim && value.trim() === '')) {
                    this.clear(done);
                } else if (value.constructor === String || value.constructor === Number) {
                    setValByID(value);
                } else if (value.constructor === Array) {
                    // this.$input().val('').trigger('change');
                    value.forEach(item => {
                        const option = new Option(item.text, item.value, true, true);
                        this.$input().append(option);
                    });
                    this.$input().trigger('change');
                    // this.clear(done);
                } else if (value.constructor === ({}).constructor) {
                    let { value: _value, text } = value; // TODO: use const instead
                    text = text.trim();
                    if (_value) {
                        if (text) {
                            const option = new Option(_value + ': ' + text, _value, true, true);
                            Object.keys(value).forEach(key => key !== 'text' && key !== 'value' && option.setAttribute(key, value[key]));
                            this.$input().append(option).trigger('change');
                            done({ ...value, value: _value, text: _value + ': ' + text });
                        } else {
                            setValByID(_value);
                        }
                    } else {
                        this.clear(done);
                    }
                } else {
                    this.clear(done);
                }
            } else {
                if (this.props.multiple) {
                    this.$input().val(value).trigger('change');
                    if (!value) value = [];
                    if (JSON.stringify(value.sort()) !== JSON.stringify(this.$input().val().sort())) {
                        // TODO: implement manual set multiple value
                        this.clear(done);
                    }
                } else {
                    if (value === null || value === undefined || (value.trim && value.trim() === '')) {
                        this.clear(done);
                    } else {
                        this.$input().val(value).trigger('change');
                        if (this.$input().val() != value) {
                            const fetchDone = data => {
                                if (Array.isArray(data)) {
                                    const item = data.find(item => item.value === value);
                                    if (!item) {
                                        this.clear(done);
                                    }
                                    else {
                                        const option = new Option(item.text, value, true, true);
                                        Object.keys(item).forEach(key => key !== 'text' && key !== 'value' && option.setAttribute(key, item[key]));
                                        this.$input().append(option).trigger('change');
                                        done(item);
                                    }
                                } else this.clear(done);
                            };
                            this.#fetchAll(fetchDone);
                        } else {
                            done({ value, text: this.$input().find('option:selected').text() });
                        }
                    }
                }
            }
        } else if (value) {
            this.$input().val(value).trigger('change');
            done({ value, text: this.$input().find('option:selected').text() });
        }
    };
    setOption = ({ value, text }) => {
        this.$input().append(new Option(text, value, true, true)).trigger('change');

    }

    #handleOnChange = () => {
        this.onBlur && this.onBlur();
        this.props.onChange && this.props.onChange(this.getVal());
    }

    getVal = () => this.$input().val();

    focus = () => !this.$input().prop('disabled') && this.$input().select2('open');

    render = () => {
        let optionsData =
            Array.isArray(this.state.data) ?
                typeof this.state.data[0] === 'string' || typeof this.state.data[0] === 'number' ?
                    this.state.data.map(item => ({ value: item, text: item })) :
                    this.state.data :
                [];
        optionsData = T.filter(optionsData, this.props.filter);

        return this.wrapLabel(
            <select className='form-control' ref={this.input}
                required={this.props.required} disabled={this.props.disabled} readOnly={this.props.readOnly} multiple={this.props.multiple}>
                {this.props.multiple ? null : <option style={{ display: 'none' }} />}
                {optionsData.map(item => <option key={item.value} value={item.value}>{item.text}</option>)}
            </select>
        );
    }
}
//#endregion

import React from 'react';
import InputMask from 'react-input-mask';
import Select from './Select';

const dateFormatChars = {
    'q': '[12]',
    'w': '[09]',
    '1': '[01]',
    '3': '[0-3]',
    '9': '[0-9]'
};

export default class DateInput extends React.Component {
    date = React.createRef();
    state = { value: '' };

    //#region Props validation
    placeholder = this.props.placeholder ? this.props.placeholder : 'Hãy nhập giá trị';
    label = this.props.label ? this.props.label : '';
    defaultValue = this.props.defaultValue ? this.props.defaultValue : '';
    //#endregion

    componentDidMount = () => this.setState({ value: this.defaultValue });

    clear = () => this.setState({ value: '' });

    val = value => {
        if (value) this.setVal(value);
        else return this.getVal();
    };

    setVal = value => this.setState({ value: value ? T.dateToText(value, 'dd/mm/yyyy') : '' });

    getVal = () => this.state.value ? T.formatDate(this.state.value.trim()).getTime() : null;

    focus = () => this.date.current.getInputDOMNode().focus();

    onChange = event => this.setState({ value: event.target.value });

    render = () => (
        <label style={{ width: '100%', marginBottom: '0' }}>
            <div style={{ marginBottom: '0.5rem' }}>{this.label}</div>
            <InputMask mask='39/19/qw99' ref={this.date} className='form-control' formatChars={dateFormatChars} value={this.state.value} onChange={this.onChange} placeholder={this.placeholder} disabled={this.props.disabled} />
        </label>
    );
}

export class MonthInput extends React.Component {
    month = React.createRef();
    state = { value: '' };

    //#region Props validation
    placeholder = this.props.placeholder ? this.props.placeholder : 'Hãy nhập giá trị';
    label = this.props.label ? this.props.label : '';
    defaultValue = this.props.defaultValue ? this.props.defaultValue : '';
    //#endregion

    componentDidMount = () => this.setState({ value: this.defaultValue });

    clear = () => this.setState({ value: '' });

    val = value => {
        if (value) this.setVal(value);
        else return this.getVal();
    };

    setVal = value => this.setState({ value: value ? T.dateToText(value, 'dd/mm/yyyy') : '' });

    getVal = () => this.state.value ? T.formatDate(this.state.value.trim()).getTime() : null;

    focus = () => this.date.current.getInputDOMNode().focus();

    onChange = event => this.setState({ value: '01/' + event.target.value });

    render = () => (
        <label style={{ width: '100%', marginBottom: '0' }}>
            <div style={{ marginBottom: '0.5rem' }}>{this.label}</div>
            <InputMask mask='19/qw99' inputRef={this.month} className='form-control' formatChars={dateFormatChars} value={this.state.value.slice(3)} onChange={this.onChange} placeholder={this.placeholder} disabled={this.props.disabled} />
        </label>
    );
}

export class YearInput extends React.Component {
    year = React.createRef();
    state = { value: '' };

    //#region Props validation
    placeholder = this.props.placeholder ? this.props.placeholder : 'Hãy nhập giá trị';
    label = this.props.label ? this.props.label : '';
    defaultValue = this.props.defaultValue ? this.props.defaultValue : '';
    //#endregion

    componentDidMount = () => this.setState({ value: this.defaultValue });

    clear = () => this.setState({ value: '' });

    val = value => {
        if (value) this.setVal(value);
        else return this.getVal();
    };

    setVal = value => this.setState({ value: value ? T.dateToText(value, 'dd/mm/yyyy') : '' });

    getVal = () => this.state.value ? T.formatDate(this.state.value.trim()).getTime() : null;

    focus = () => this.date.current.getInputDOMNode().focus();

    onChange = event => this.setState({ value: '01/01/' + event.target.value });

    render = () => (
        <label style={{ width: '100%', marginBottom: '0' }}>
            <div style={{ marginBottom: '0.5rem' }}>{this.label}</div>
            <InputMask mask='qw99' inputRef={this.year} className='form-control' formatChars={dateFormatChars} value={this.state.value.slice(6)} onChange={this.onChange} placeholder={this.placeholder} disabled={this.props.disabled} />
        </label>
    );
}

export class YearSelect extends React.Component {
    year = React.createRef();

    //#region Props validation
    placeholder = this.props.placeholder ? this.props.placeholder : 'Hãy chọn giá trị';
    label = this.props.label ? this.props.label : '';
    data = this.props.data ? this.props.data : Array.from(Array(2100).keys()).slice(1900);
    defaultValue = this.props.defaultValue ? this.props.defaultValue : '';
    //#endregion

    val = value => this.year.current.val(value);

    setVal = value => this.year.current.setVal(value);

    getVal = () => this.year.current.val();

    focus = () => this.year.current.focus();

    clear = () => this.year.current.clear();

    render = () => (<Select ref={this.year} label={this.props.label} placeholder={this.props.placeholder} data={this.data} defaultValue={this.defaultValue} />)
}
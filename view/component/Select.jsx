import React from 'react';

export default class Select extends React.Component {
    select = React.createRef();
    //#region Props validation
    dropdownParent = this.props.dropdownParent ? this.props.dropdownParent : $('.modal-body').has(this.select.current)[0] || $('.tile-body').has(this.select.current)[0];
    notFoundText = this.props.notFoundText ? this.props.notFoundText : 'Không tìm thấy dữ liệu';
    placeholder = this.props.placeholder ? this.props.placeholder : 'Hãy chọn giá trị';
    label = this.props.label ? this.props.label : '';
    getAll = this.props.getAll && typeof this.props.getAll === 'function' ? this.props.getAll : null;
    condition = this.props.condition ? this.props.condition : {};
    value = this.props.value && typeof this.props.value === 'function' ? this.props.value : item => item.value || item.id || item.ma || item.maCode || '';
    text = this.props.text && typeof this.props.text === 'function' ? this.props.text : item => item.text || item.ten || item.moTa || '';
    data = this.props.data && Array.isArray(this.props.data) ? this.props.data[0] && typeof this.props.data[0] === 'object' && this.props.data[0] !== null ? this.props.data : this.props.data.map(item => ({ value: item, text: item })) : [];
    state = { data: this.data.map(item => <option key={this.value(item)} value={this.value(item)}>{this.text(item)}</option>) };
    defaultValue = this.props.defaultValue;
    //#endregion

    componentDidMount() {
        const dropdownParent = this.props.dropdownParent ? this.props.dropdownParent : $('.modal-body').has(this.select.current)[0] || $('.tile-body').has(this.select.current)[0];
        $(this.select.current).select2({
            dropdownParent,
            placeholder: this.placeholder
        });
        const done = data => this.setState({ data: data.map(item => <option key={this.value(item)} value={this.value(item)}>{this.value(item) + ': ' + this.text(item)}</option>) });
        if (this.getAll) {
            if (this.getAll.length === 1)
                this.getAll(done)(() => { });
            else if (this.getAll.length === 2)
                this.getAll(this.condition, done)(() => { });
        }
        if (this.state.data)
            this.setVal(this.props.defaultValue);
    }

    clear = () => $(this.select.current).val('').trigger('change');

    val = value => {
        if (value) this.setVal(value);
        else return this.getVal();
    }

    setVal = value => {
        $(this.select.current).val(value).trigger('change');
        if ($(this.select.current).val() != value) {
            const done = data => {
                if (Array.isArray(data)) {
                    const item = data.find(item => this.value(item) === value);
                    if (!item) this.clear();
                    else $(this.select.current).append(new Option(value + ': ' + this.text(item), value, true, true)).trigger('change');
                } else this.clear();
            };
            if (this.getAll) {
                if (this.getAll.length === 1)
                    this.getAll(done)(() => { });
                else if (this.getAll.length === 2)
                    this.getAll(this.condition, done)(() => { });
            } else this.clear();
        }
    }

    getVal = () => this.select.current.value

    focus = () => $(this.select.current).select2('open');

    render = () => (
        <label style={{ width: '100%', marginBottom: '0' }}>
            <div style={{ marginBottom: '0.5rem' }}>{this.label}</div>
            <select ref={this.select} disabled={this.props.disabled}>{this.state.data}</select>
        </label>
    );
}
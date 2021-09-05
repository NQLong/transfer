import React from 'react';
import { IMaskInput } from 'react-imask';

export default class SimpleDate extends React.Component {
    state = { value: '' };

    onChange = (event) => {
        this.setState({
            value: event.target.value
        });
    }

    render() {
        return <IMaskInput className={this.props.className}
            mask={Date}
            pattern='d{/}`m{/}`Y'
            radix='/'
            min={new Date(1900, 0, 1)}
            max={new Date(2050, 0, 1)}
            lazy={false}
            autofix={true}
            unmask={true}
            placeholder='dd/mm/yyyy'
        />;
    }
}
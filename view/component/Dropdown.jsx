import React from 'react';

export default class Dropdown extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            items: []
        };
        this.element = React.createRef();
        this.menu = React.createRef();

        this.selectedItem = null;
    }

    select = (e, item) => {
        this.selectedItem = item;
        $(this.element.current).html(item.text ? item.text : item);
        this.props.onSelected && this.props.onSelected(item);
        e.preventDefault();
    }

    getSelectedItem = () => this.selectedItem

    setText = (item) => {
        this.selectedItem = item;
        $(this.element.current).html(item.text ? item.text : item);
    }
    setItems = (items) => {
        this.setState({ items });
    }

    render() {
        const items = this.props.items ? this.props.items : this.state.items,
            className = this.props.readOnly ? 'disabled' : (this.props.className ? this.props.className + ' dropdown-toggle' : 'dropdown-toggle');
        let dropdownItems = items.map((item, index) =>
            <a key={index} className='dropdown-item' href='#' onClick={e => this.select(e, item)}>
                {item.text ? item.text : item}
            </a>);

        return (
            <div className='dropdown' style={{ whiteSpace: 'nowrap', textDecoration: 'none', pointerEvents: 'auto' }}>
                <a ref={this.element} className={className} href='#' data-toggle='dropdown' aria-haspopup='true' aria-expanded='false'>
                    {this.props.text}
                </a>
                <div ref={this.menu} className='dropdown-menu' style={{ maxHeight: '85vh', overflowY: 'auto' }}>
                    {dropdownItems}
                </div>
            </div>
        );
    }
}
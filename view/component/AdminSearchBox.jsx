import React from 'react';

export default class AdminSearchBox extends React.Component {
    state = { searchText: '' };
    searchTextBox = React.createRef();

    getPage = (pageNumber, pageSize, pageCondition) => {
        this.props.setSearching(true);
        this.props.getPage(pageNumber, pageSize, pageCondition, page => {
            if (page) {
                this.searchTextBox.current.value = page.pageCondition ? page.pageCondition : '';
                this.searchTextBox.current.focus();
                this.setState({ searchText: page.pageCondition });
            }
            this.props.setSearching(false);
        });
    }

    search = (e, searchText) => {
        e && e.preventDefault();
        if (searchText != undefined) {
            this.searchTextBox.current.value = searchText;
        } else {
            searchText = this.searchTextBox.current.value;
        }
        this.getPage(null, null, searchText);
    }

    render() {
        return (
            <ul className='app-breadcrumb breadcrumb'>
                <form style={{ position: 'relative', border: '1px solid #ddd', marginRight: 6 }} onSubmit={this.search}>
                    <input ref={this.searchTextBox} className='app-search__input' style={{ width: '30vw' }} type='search' placeholder='Tìm kiếm' />
                    <a href='#' style={{ position: 'absolute', top: 6, right: 9 }} onClick={this.search}>
                        <i className='fa fa-search' />
                    </a>
                </form>
                <a href='#' onClick={e => this.search(e, '')} style={{ visibility: this.state.searchText ? '' : 'hidden', color: 'red', marginRight: 12, marginTop: 6 }}>
                    <i className='fa fa-trash' />
                </a>
            </ul>);
    }
}
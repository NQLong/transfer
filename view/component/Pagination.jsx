import React from 'react';
import Dropdown from './Dropdown';

export const OverlayLoading = (props) =>
    <React.Fragment>
        <div className='overlay' style={{ zIndex: 1000, ...props.style }}>
            <div className='m-loader mr-4'>
                <svg className='m-circular' viewBox='25 25 50 50'>
                    <circle className='path' cx='50' cy='50' r='20' fill='none' strokeWidth='4' strokeMiterlimit='10' />
                </svg>
            </div>
        </div>
        <h4 className='col-12 text-center'>{props.text}</h4>
    </React.Fragment>;

export default class Pagination extends React.Component {
    pageNumberChanged = (e, pageNumber, pageCondition) => {
        e.preventDefault();
        let { done, onSearch } = this.props;
        if (pageCondition == null) pageCondition = {};
        onSearch && onSearch(true);
        this.props.getPage(pageNumber, null, pageCondition, (data) => {
            onSearch && onSearch(false);
            done && done(data);
        });
    }

    pageSizeChanged = (pageSize, pageCondition) => {
        let { done, onSearch } = this.props;
        if (pageCondition == null) pageCondition = {};
        onSearch && onSearch(true);
        this.props.getPage(null, pageSize, pageCondition, (data) => {
            onSearch && onSearch(false);
            done && done(data);
        });
    }

    render() {
        const pageCondition = this.props.pageCondition ? this.props.pageCondition : undefined;
        const pageRange = (Number.isInteger(this.props.pageRange) && this.props.pageRange > 1) ? this.props.pageRange -1 : 6;
        let pageItems = [], firstButton = '', lastButton = '';
        if (this.props.pageTotal > 1) {
            let minPageNumber = Math.max(this.props.pageNumber - Math.floor(pageRange / 2), 1),
                maxPageNumber = Math.min(this.props.pageNumber + Math.ceil(pageRange / 2), this.props.pageTotal);
            if (minPageNumber + pageRange > maxPageNumber) {
                maxPageNumber = Math.min(minPageNumber + pageRange, this.props.pageTotal);
            }
            if (maxPageNumber - pageRange < minPageNumber) {
                minPageNumber = Math.max(1, maxPageNumber - pageRange);
            }
            for (let i = minPageNumber; i <= maxPageNumber; i++) {
                pageItems.push(
                    <li key={i} className={'page-item' + (this.props.pageNumber === i ? ' active' : '')}>
                        <a className='page-link' href='#' onClick={e => this.pageNumberChanged(e, i, pageCondition)}>{i}</a>
                    </li>
                );
            }

            firstButton = this.props.pageNumber === 1 ?
                <li className='page-item disabled'>
                    <a className='page-link' href='#' aria-label='Previous'>
                        <span aria-hidden='true'>&laquo;</span>
                        <span className='sr-only'>Previous</span>
                    </a>
                </li> :
                <li className='page-item'>
                    <a className='page-link' href='#' aria-label='Previous' onClick={e => this.pageNumberChanged(e, 1, pageCondition)}>
                        <span aria-hidden='true'>&laquo;</span>
                        <span className='sr-only'>Previous</span>
                    </a>
                </li>;

            lastButton = this.props.pageNumber === this.props.pageTotal ?
                <li className='page-item disabled'>
                    <a className='page-link' href='#' aria-label='Next'>
                        <span aria-hidden='true'>&raquo;</span>
                        <span className='sr-only'>Next</span>
                    </a>
                </li> :
                <li className='page-item'>
                    <a className='page-link' href='#' aria-label='Next' onClick={e => this.pageNumberChanged(e, this.props.pageTotal, pageCondition)}>
                        <span aria-hidden='true'>&raquo;</span>
                        <span className='sr-only'>Next</span>
                    </a>
                </li>;
        }

        const style = Object.assign({}, { width: '100%', display: 'flex', position: 'fixed', bottom: '10px', pointerEvents: 'none' }, this.props.style ? this.props.style : {});
        return (
            <div className='d-print-none' style={style}>
                {!this.props.fixedSize && <Dropdown className='btn btn-info' text={this.props.pageSize} items={[25, 50, 100, 200, 500]} onSelected={pageSize => this.pageSizeChanged(pageSize, pageCondition)} />}
                <nav style={{ marginLeft: '10px', pointerEvents: 'auto' }}>
                    <ul className='pagination' style={{ marginBottom: 0 }}>
                        {firstButton}
                        {pageItems}
                        {lastButton}
                    </ul>
                </nav>
            </div>
        );
    }
}
import React from 'react';
import { connect } from 'react-redux';
import { getEventInPage, createEvent, updateEvent, swapEvent, deleteEvent } from 'modules/mdTruyenThong/fwEvent/redux';
import { Link } from 'react-router-dom';
import Pagination from 'view/component/Pagination';

class EventPage extends React.Component {
    constructor(props) {
        super(props);
    }
    state = { searchText: '' };
    searchTextBox = React.createRef();


    componentDidMount() {
        this.props.getEventInPage(null, null, {});
        T.ready();
    }

    getPage = (pageNumber, pageSize, pageCondition) => {
        this.props.getEventInPage(pageNumber, pageSize, pageCondition, () => {
        });
    }

    create = (e) => {
        this.props.createEvent(data => this.props.history.push('/user/event/edit/' + data.item.id));
        e.preventDefault();
    }

    swap = (e, item, isMoveUp) => {
        this.props.swapEvent(item.id, isMoveUp);
        e.preventDefault();
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

    changeActive = (item) => this.props.updateEvent(item.id, { active: item.active === 1 ? 0 : 1 })

    changeisInternal = (item) => this.props.updateEvent(item.id, { isInternal: item.isInternal === 1 ? 0 : 1 })

    delete = (e, item) => {
        T.confirm('Sự kiện', 'Bạn có chắc bạn muốn xóa sự kiện này?', 'warning', true, isConfirm =>
            isConfirm && this.props.deleteEvent(item.id));
        e.preventDefault();
    }

    render() {
        const currentPermission = this.props.system && this.props.system.user && this.props.system.user.permissions ? this.props.system.user.permissions : [],
            permissionWrite = currentPermission.contains('website:write');
        const { pageNumber, pageSize, pageTotal, totalItem } = this.props.event && this.props.event.page ?
            this.props.event.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0 };
        let table = 'Không có bài viết!';
        if (this.props.event && this.props.event.page && this.props.event.page.list && this.props.event.page.list.length > 0) {
            table = (
                <table className='table table-hover table-bordered'>
                    <thead>
                        <tr>
                            <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                            <th style={{ width: '80%' }}>Tiêu đề</th>
                            <th style={{ width: '20%', textAlign: 'center' }}>Hình ảnh</th>
                            <th style={{ width: 'auto' }} nowrap='true'>Kích hoạt</th>
                            <th style={{ width: 'auto' }} nowrap='true'>Tin nội bộ</th>
                            <th style={{ width: 'auto', textAlign: 'center' }}>Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {this.props.event.page.list.map((item, index) => (
                            <tr key={index}>
                                <td style={{ textAlign: 'right' }}>{(pageNumber - 1) * pageSize + index + 1}</td>
                                <td>
                                    <Link to={'/user/event/edit/' + item.id} data-id={item.id}>
                                        {T.language.parse(item.title, true).vi}
                                    </Link>
                                </td>
                                <td style={{ width: '20%', textAlign: 'center' }}>
                                    <img src={item.image || '/img/avatar.png'} alt='avatar' style={{ height: '32px' }} />
                                </td>
                                <td className='toggle' style={{ textAlign: 'center' }}>
                                    <label>
                                        <input type='checkbox' checked={item.active === 1 ? true : false} onChange={() => this.changeActive(item, index)} disabled={!permissionWrite} />
                                        <span className='button-indecator' />
                                    </label>
                                </td>
                                <td className='toggle' style={{ textAlign: 'center' }}>
                                    <label>
                                        <input type='checkbox' checked={item.isInternal === 1 ? true : false} onChange={() => this.changeisInternal(item, index)} disabled={!permissionWrite} />
                                        <span className='button-indecator' />
                                    </label>
                                </td>
                                <td className='btn-group'>
                                    <Link to={'/user/event/registration/' + item.id} data-id={item.id} className='btn btn-warning'>
                                        <i className='fa fa-lg fa-list-alt' />
                                    </Link>
                                    <Link to={'/user/event/edit/' + item.id} data-id={item.id} className='btn btn-primary'>
                                        <i className='fa fa-lg fa-edit' />
                                    </Link>
                                    {permissionWrite ?
                                        <a className='btn btn-danger' href='#' onClick={e => this.delete(e, item)}>
                                            <i className='fa fa-lg fa-trash' />
                                        </a> : null}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            );
        }

        return (
            <main className='app-content'>
                <div className='app-title'>
                    <h1><i className='fa fa-star' /> Sự kiện: Danh sách</h1>
                    <form style={{ position: 'relative', border: '1px solid #ddd', marginRight: 6 }} onSubmit={this.search}>
                        <input ref={this.searchTextBox} className='app-search__input' style={{ width: '30vw' }} type='search' placeholder='Tìm kiếm' />
                        <a href='#' style={{ position: 'absolute', top: 6, right: 9 }} onClick={this.search}>
                            <i className='fa fa-search' />
                        </a>
                    </form>
                </div>

                <div className='tile'>
                    {table}
                    <Pagination name='pageEvent'
                        pageNumber={pageNumber} pageSize={pageSize} pageTotal={pageTotal} totalItem={totalItem}
                        getPage={this.props.getEventInPage} />
                    {/* <Link to={'/user/news/unit/draft'} className='btn btn-secondary btn-circle' style={{ position: 'fixed', bottom: '10px' }}>
                        <i className='fa fa-lg fa-reply' />
                    </Link> */}
                    {/* <button onClick={() => {
                        this.props.history.goBack();
                    }} className='btn btn-secondary btn-circle' style={{ position: 'fixed', bottom: '50px' }}>
                        <i className='fa fa-lg fa-reply' />
                    </button> */}
                    {permissionWrite ?
                        <button type='button' className='btn btn-primary btn-circle' style={{ position: 'fixed', right: '10px', bottom: '10px' }}
                            onClick={this.create}>
                            <i className='fa fa-lg fa-plus' />
                        </button> : null}
                </div>
            </main>
        );
    }
}

const mapStateToProps = state => ({ event: state.event, system: state.system });
const mapActionsToProps = { getEventInPage, createEvent, updateEvent, swapEvent, deleteEvent };
export default connect(mapStateToProps, mapActionsToProps)(EventPage);
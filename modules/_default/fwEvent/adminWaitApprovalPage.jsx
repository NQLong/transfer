import React from 'react';
import { connect } from 'react-redux';
import { getDraftEventInPage, createDraftEventDefault, deleteDraftEvent, draftToEvent } from './redux';
import { Link } from 'react-router-dom';
import Pagination from 'view/component/Pagination';

class EventWaitApprovalPage extends React.Component {
    constructor(props) {
        super(props);
    }

    componentDidMount() {
        this.props.getDraftEventInPage();
        T.ready();
    }

    create = (e) => {
        this.props.createDraftEventDefault(data => this.props.history.push('/user/event/draft/edit/' + data.item.id));
        e.preventDefault();
    }

    changeActive = (item) => this.props.draftToEvent(item.id)

    delete = (e, item) => {
        T.confirm('Sự kiện', 'Bạn có chắc bạn muốn xóa mẫu sự kiện này?', 'warning', true, isConfirm =>
            isConfirm && this.props.deleteDraftEvent(item.id));
        e.preventDefault();
    };

    render() {
        const currentPermission = this.props.system && this.props.system.user && this.props.system.user.permissions ? this.props.system.user.permissions : [],
            viewerType = currentPermission.includes('event:write') ? 2 : (currentPermission.includes('event:draft') ? 1 : 0);
        const isAdmin = this.props.system && this.props.system.user && this.props.system.user.roles && this.props.system.user.roles.length ? this.props.system.user.roles[0].name === 'admin' : false;

        const { pageNumber, pageSize, pageTotal, totalItem } = this.props.event && this.props.event.page ?
            this.props.event.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0 };
        let table = 'Không có bài viết!';
        if (this.props.event && this.props.event.draft && this.props.event.draft.list && this.props.event.draft.list.length > 0) {
            table = (
                <table className='table table-hover table-bordered'>
                    <thead>
                        <tr>
                            <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                            <th style={{ width: '80%' }}>Tiêu đề</th>
                            <th style={{ width: '20%', textAlign: 'center' }}>Hình ảnh</th>
                            {viewerType == 2 ? <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>Người soạn</th> : null}
                            {viewerType == 1 ? <th style={{ width: 'auto' }} nowrap='true'>Được duyệt</th> : null}
                            <th style={{ width: 'auto', textAlign: 'center' }}>Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {this.props.event.draft.list.map((item, index) => (
                            <tr key={index}>
                                <td style={{ textAlign: 'right' }}>{(Math.max(pageNumber, 1) - 1) * pageSize + index + 1}</td>
                                <td>
                                    <Link to={'/user/event/draft/edit/' + item.id} data-id={item.id}>
                                        {T.language.parse(item.title, true).vi}
                                    </Link>
                                </td>
                                <td style={{ width: '20%', textAlign: 'center' }}>
                                    <img src={item.image} alt='avatar' style={{ height: '32px' }} />
                                </td>
                                {viewerType == 2 ? (<td style={{ textAlign: 'center' }}>{item.editorName}</td>) : null}
                                {viewerType == 1 ? (
                                    <td className='toggle' style={{ textAlign: 'center' }}>
                                        <label>
                                            <input type='checkbox' checked={item.active} disabled={viewerType != 2} onChange={() => { }} /><span className='button-indecator' />
                                        </label>
                                    </td>
                                ) : null}
                                <td className='btn-group'>
                                    {viewerType == 2 ? (<a href='#' className='btn btn-success' onClick={() => this.changeActive(item, index)} title='Duyệt bản nháp này'> <i className='fa fa-check' /></a>) : null}
                                    <Link to={'/user/event/draft/edit/' + item.id} data-id={item.id} className='btn btn-primary'>
                                        <i className='fa fa-lg fa-edit' />
                                    </Link>
                                    {currentPermission.contains('event:draft') ?
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
                </div>
                <div className='tile'>
                    {table}
                    <Pagination name='pageEvent'
                        pageNumber={pageNumber} pageSize={pageSize} pageTotal={pageTotal} totalItem={totalItem}
                        getPage={this.props.getDraftEventInPage} />
                    {(!currentPermission.contains('event:write') || isAdmin) ?
                        <button type='button' className='btn btn-primary btn-circle' style={{ position: 'fixed', right: '10px', bottom: '10px' }} onClick={this.create}>
                            <i className='fa fa-lg fa-plus' />
                        </button> : null}
                    {/* {currentPermission.contains('event:create') ?
                    <button type='button' className='btn btn-primary btn-circle' style={{ position: 'fixed', right: '10px', bottom: '10px' }}
                    onClick={this.create}>
                    <i className='fa fa-lg fa-plus' />
                </button> : null} */}
                </div>
            </main>
        );
    }
}

const mapStateToProps = state => ({ event: state.event, system: state.system });
const mapActionsToProps = { getDraftEventInPage, createDraftEventDefault, deleteDraftEvent, draftToEvent };
export default connect(mapStateToProps, mapActionsToProps)(EventWaitApprovalPage);

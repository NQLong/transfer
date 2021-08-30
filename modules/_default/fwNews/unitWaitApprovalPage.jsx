import React from 'react';
import { connect } from 'react-redux';
import { createUnitDraftNewsDefault, draftToNews, deleteUnitDraftNews, getUnitDraftNewsInPage, updateUnitDraftNews } from './redux'
import { Link } from 'react-router-dom';
import Pagination from 'view/component/Pagination';

class RejectModal extends React.Component {
    modal = React.createRef();

    show = item => {
        $(this.modal.current).find('.modal-title').html('Phản hồi');
        $('#reject').val(item.rejectionReason);
        $(this.modal.current).data('data-id', item.id).modal('show');
    }

    onlyShow = value => {
        $(this.modal.current).find('.modal-title').html('Phản hồi bị từ chối');
        $('#reject').val(value).prop('disabled', true);
        $('#submit').remove();
        $(this.modal.current).modal('show');
    }

    save = e => {
        e.preventDefault();
        const rejectionReason = $('#reject').val();
        if (rejectionReason) {
            const id = $(this.modal.current).data('data-id'),
                changes = {
                    rejectionReason,
                    status: 'userCreated',
                    isTranslated: 'ready'
                };
            this.props.updateDraftNews(id, changes);
            $(this.modal.current).modal('hide');
        } else {
            T.notify('Bạn cần điền lý do từ chối', 'danger');
        }
    }

    render() {
        return (
            <div className='modal' tabIndex='-1' role='dialog' ref={this.modal}>
                <form className='modal-dialog' role='document'>
                    <div className='modal-content'>
                        <div className='modal-header'>
                            <h5 className='modal-title'></h5>
                            <button type='button' className='close' data-dismiss='modal' aria-label='Close'>
                                <span aria-hidden='true'>&times;</span>
                            </button>
                        </div>
                        <div className='modal-body row'>
                            <div className='form-group col-12 row'>
                                <label className='control-label' style={{ marginLeft: '20px' }}>Lý do từ chối</label>
                                <textarea defaultValue='' className='form-control' placeholder='. . .'
                                    id='reject' style={{ minHeight: '120px', marginBottom: '15px', marginLeft: '20px' }} />
                            </div>
                        </div>
                        <div className='modal-footer'>
                            <button className='btn btn-secondary' data-dismiss='modal'>Đóng</button>
                            <button type='submit' className='btn btn-success' id='submit' onClick={e => this.save(e)}>Lưu</button>
                        </div>
                    </div>
                </form>
            </div>
        );
    }
}

class UnitNewsWaitApprovalPage extends React.Component {
    constructor(props) {
        super(props);
    }

    reject = React.createRef();

    componentDidMount() {
        const currentPermissions = this.props.system && this.props.system.user && this.props.system.user.permissions;
        let condition = { isUnitApproved: 0 };
        if (currentPermissions && currentPermissions.includes('unit:write'))
            condition.status = 'userSendRequest';
        this.props.getUnitDraftNewsInPage(null, null, condition);
        T.ready();
    }
    create = (e) => {
        this.props.createUnitDraftNewsDefault(data => {
            if (data.item) this.props.history.push('/user/news/unit/draft/edit/' + data.item.id);
        });
        e.preventDefault();
    };

    revert = (item) => {
        this.reject.current.show(item);
    }
    showReason = (item) => {
        this.reject.current.onlyShow(item.rejectionReason);
    }

    changeActive(item, index) {
        this.props.updateUnitDraftNews(item.id, { isUnitApproved: 1 });
    }

    changeStatus = (item, index) => {
        T.confirm('Tin tức', 'Bạn có chắc bạn muốn gửi bản viết cho cấp trên?', 'warning', true,
            isConfirm => isConfirm && this.props.updateUnitDraftNews(item.id, { status: 'userSendRequest', rejectionReason: '' }));
    }

    delete(e, item) {
        T.confirm('Tin tức', 'Bạn có chắc bạn muốn xóa bài viết chờ duyệt này?', 'warning', true, isConfirm => isConfirm && this.props.deleteUnitDraftNews(item.id));
        e.preventDefault();
    }

    render() {
        const { pageNumber, pageSize, pageTotal, totalItem, list, pageCondition } = this.props.news && this.props.news.draft ?
            this.props.news.draft : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, list: [], pageCondition: {} };
        let table = 'Không có bản nháp tin tức!';
        const currentPermissions = this.props.system && this.props.system.user && this.props.system.user.permissions ? this.props.system.user.permissions : [],
            viewerType = currentPermissions.includes('unit:write') ? 2 : (currentPermissions.includes('unit:draft') ? 1 : 0);
        const isAdmin = currentPermissions.includes('unit:write') && currentPermissions.includes('news:write')
        if (list && list.length) {
            table = (
                <table className='table table-hover table-bordered'>
                    <thead>
                        <tr>
                            <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                            <th style={{ width: '80%' }}>Tiêu đề</th>
                            <th style={{ width: '20%', textAlign: 'center' }}>Hình ảnh</th>
                            {viewerType == 2 ? <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>Người soạn</th> : null}
                            <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {list.map((item, index) => (
                            <tr key={index}>
                                <td style={{ textAlign: 'right' }}>{(pageNumber - 1) * pageSize + index + 1}</td>
                                <td>
                                    {viewerType ? <Link to={'/user/news/unit/draft/edit/' + item.id} data-id={item.id}>
                                        {T.language.parse(item.title)}
                                    </Link> : T.language.parse(item.title)}
                                </td>
                                <td style={{ width: '20%', textAlign: 'center' }}>
                                    <img src={item.image} alt='avatar' style={{ height: '32px' }} />
                                </td>
                                {viewerType == 2 ? (<td style={{ textAlign: 'center', whiteSpace: 'nowrap' }}>{item.editorName}</td>) : null}
                                <td style={{ textAlign: 'right' }}>
                                    <div className='btn-group'>
                                        {(viewerType == 2 || isAdmin) && (
                                            <>
                                                <a href='#' className='btn btn-success' onClick={() => this.changeActive(item, index)} title='Duyệt bản nháp này'> <i className='fa fa-check' /></a>
                                                <a href='#' className='btn btn-warning' onClick={() => this.revert(item)} title='Từ chối bản nháp này'> <i className='fa fa-undo' /></a>
                                                <Link to={'/user/news/unit/draft/edit/' + item.id} data-id={item.id} className='btn btn-primary'>
                                                    <i className='fa fa-lg fa-edit' />
                                                </Link>

                                            </>
                                        )}
                                        {(viewerType == 1 || isAdmin) &&
                                            <>
                                                {item.rejectionReason ? <a href='#' className='btn btn-warning' onClick={() => this.showReason(item)} title='Lý do bị từ chối'>
                                                    <i className='fa fa-user-times' />
                                                </a> : null}
                                                {item.status == 'userCreated' &&
                                                    <a href='#' className='btn btn-success' onClick={() => this.changeStatus(item, index)} title='Gửi cấp trên'> <i className='fa fa-arrow-up' /></a>}
                                                <Link to={'/user/news/unit/draft/edit/' + item.id} data-id={item.id} className='btn btn-primary'>
                                                    <i className='fa fa-lg fa-edit' />
                                                </Link>
                                                <a className='btn btn-danger' href='#' onClick={e => this.delete(e, item)}>
                                                    <i className='fa fa-lg fa-trash' />
                                                </a>
                                            </>
                                        }
                                    </div>
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
                    <h1><i className='fa fa-file' />Bài viết đơn vị: Chờ duyệt</h1>
                </div>
                <div className='tile'>
                    {table}
                    <RejectModal ref={this.reject} updateDraftNews={this.props.updateUnitDraftNews} />

                    <Pagination name='pageNews'
                        pageNumber={pageNumber} pageSize={pageSize} pageTotal={pageTotal} totalItem={totalItem} pageCondition={pageCondition}
                        getPage={this.props.getUnitDraftNewsInPage} />
                    {!currentPermissions.contains('unit:write') || isAdmin ?
                        <button type='button' className='btn btn-primary btn-circle' style={{ position: 'fixed', right: '10px', bottom: '10px' }}
                            onClick={(e) => this.create(e)}>
                            <i className='fa fa-lg fa-plus' />
                        </button> : null}
                </div>
            </main>
        );
    }
}

const mapStateToProps = state => ({ news: state.news, system: state.system });
const mapActionsToProps = { getUnitDraftNewsInPage, createUnitDraftNewsDefault, draftToNews, deleteUnitDraftNews, updateUnitDraftNews };
export default connect(mapStateToProps, mapActionsToProps)(UnitNewsWaitApprovalPage);
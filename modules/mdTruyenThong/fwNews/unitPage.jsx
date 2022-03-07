import React from 'react';
import { connect } from 'react-redux';
import { createUnitDraftNewsDefault, createUnitDraftNewsDean, draftToNews, deleteUnitDraftNews, getUnitDraftNewsInPage, updateUnitDraftNews } from './redux';
import { Link } from 'react-router-dom';
import Pagination from 'view/component/Pagination';

class RejectModal extends React.Component {
    modal = React.createRef();
    state = { active: false, header: false };

    show = value => {
        $(this.modal.current).find('.modal-title').html('Phản hồi bị từ chối');
        $('#reject').val(value.rejectionReason);
        $(this.modal.current).data('data-id', value.id).modal('show');
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
                                <textarea className='form-control' placeholder='. . .' disabled={true}
                                    id='reject' style={{ minHeight: '120px', marginBottom: '15px', marginLeft: '20px' }} />
                            </div>
                        </div>
                        <div className='modal-footer'>
                            <button className='btn btn-secondary' data-dismiss='modal'>Đóng</button>
                        </div>
                    </div>
                </form>
            </div>
        );
    }
}

class UnitNewsPage extends React.Component {
    constructor(props) {
        super(props);
    }
    reject = React.createRef();

    componentDidMount() {
        this.props.getUnitDraftNewsInPage(null, null, { isUnitApproved: 1, isDraftApproved: 0 });
        T.ready('/user/truyen-thong');
    }
    create = (e) => {
        this.props.createUnitDraftNewsDean(data => this.props.history.push('/user/news/unit/edit/' + data.item.id));
        e.preventDefault();
    };
    showReason = (item) => {
        this.reject.current.show(item);
    }
    revert = (item) => {
        T.confirm('Bài viết đơn vị', 'Bạn có chắc bạn muốn đăng bài viết quay về chờ duyệt?', 'warning', true, isConfirm => isConfirm
            && this.props.updateUnitDraftNews(item.id,
                { isUnitApproved: 0, status: 'userSendRequest' }));

    }
    changeDraftReady(item,) {
        T.confirm('Bài viết đơn vị', 'Bạn có chắc bạn muốn đăng bài viết này lên tin tức cấp trường?', 'warning', true, isConfirm => isConfirm && this.props.updateUnitDraftNews(item.id, { isDraftApproved: 1 }));
    }

    delete(e, item) {
        T.confirm('Bài viết', 'Bạn có chắc bạn muốn xóa bài viết này?', 'warning', true, isConfirm => isConfirm && this.props.deleteUnitDraftNews(item.id));
        e.preventDefault();
    }

    render() {
        const isAdmin = this.props.system && this.props.system.user && this.props.system.user.roles && this.props.system.user.roles[0].name === 'admin';
        const { pageNumber, pageSize, pageTotal, totalItem, list, pageCondition } = this.props.news && this.props.news.draft ?
            this.props.news.draft : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, list: [], pageCondition: {} };
        let table = 'Không có bài viết!';
        const currentPermissions = this.props.system && this.props.system.user && this.props.system.user.permissions ? this.props.system.user.permissions : [],
            permissionWrite = currentPermissions.contains('unit:write');

        if (list && list.length > 0) {
            table = (
                <table className='table table-hover table-bordered'>
                    <thead>
                        <tr>
                            <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                            <th style={{ width: '80%' }}>Tiêu đề</th>
                            <th style={{ width: '20%', textAlign: 'center' }}>Hình ảnh</th>
                            <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>Người soạn</th>
                            {(permissionWrite || isAdmin) && <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>Thao tác</th>}
                        </tr>
                    </thead>
                    <tbody>
                        {list.map((item, index) => (
                            <tr key={index}>
                                <td style={{ textAlign: 'right' }}>{(pageNumber - 1) * pageSize + index + 1}</td>
                                <td>
                                    {permissionWrite || currentPermissions.contains('unit:draft') || isAdmin ?
                                        <Link to={'/user/news/unit/edit/' + item.id} data-id={item.id}>
                                            {T.language.parse(item.title)}
                                        </Link> : T.language.parse(item.title)
                                    }
                                </td>
                                <td style={{ width: '20%', textAlign: 'center' }}>
                                    <img src={item.image} alt='avatar' style={{ height: '32px' }} />
                                </td>
                                <td style={{ textAlign: 'center', whiteSpace: 'nowrap' }}>{item.editorName}</td>
                                {(permissionWrite || isAdmin) &&
                                    <td style={{ textAlign: 'right' }}>
                                        <div className='btn-group'>
                                            {item.rejectionReason ? <a href='#' className='btn btn-warning' onClick={() => this.showReason(item)} title='Lý do bị từ chối'>
                                                <i className='fa fa-user-times' />
                                            </a> : null}
                                            {currentPermissions.contains('unit:draft') &&
                                                <>
                                                    <a href='#' className='btn btn-success' onClick={() => this.changeDraftReady(item, index)} title='Duyệt bản nháp này'>
                                                        <i className='fa fa-check' />
                                                    </a>
                                                    <a href='#' className='btn btn-warning' onClick={() => this.revert(item)} title='Từ chối bản nháp này'> <i className='fa fa-undo' /></a>
                                                    <Link to={'/user/news/unit/edit/' + item.id} data-id={item.id} className='btn btn-primary'>
                                                        <i className='fa fa-lg fa-edit' />
                                                    </Link>
                                                    <a className='btn btn-danger' href='#' onClick={e => this.delete(e, item)}>
                                                        <i className='fa fa-lg fa-trash' />
                                                    </a>
                                                </>
                                            }
                                        </div>
                                    </td>
                                }
                            </tr>
                        ))}
                    </tbody>
                </table>
            );
        }
        return (
            <main className='app-content'>
                <div className='app-title'>
                    <h1><i className='fa fa-file' /> Bài viết đơn vị</h1>
                </div>
                <div className='tile'>
                    {table}
                    <Pagination name='pageNews' pageNumber={pageNumber} pageSize={pageSize} pageTotal={pageTotal} totalItem={totalItem} pageCondition={pageCondition}
                        getPage={this.props.getDraftNewsInPage} />
                    {permissionWrite || isAdmin ?
                        <button type='button' className='btn btn-primary btn-circle' style={{ position: 'fixed', right: '10px', bottom: '10px' }} onClick={(e) => this.create(e)}>
                            <i className='fa fa-lg fa-plus' />
                        </button> : null}
                    <RejectModal ref={this.reject} updateDraftNews={this.props.updateUnitDraftNews} />
                </div>
            </main>
        );
    }
}

const mapStateToProps = state => ({ news: state.news, system: state.system });
const mapActionsToProps = { getUnitDraftNewsInPage, createUnitDraftNewsDefault, createUnitDraftNewsDean, draftToNews, deleteUnitDraftNews, updateUnitDraftNews };
export default connect(mapStateToProps, mapActionsToProps)(UnitNewsPage);
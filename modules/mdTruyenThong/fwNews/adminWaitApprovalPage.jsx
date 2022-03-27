import React from 'react';
import { connect } from 'react-redux';
import { createDraftNewsDefault, draftToNews, deleteDraftNews, getDraftNewsInPage, updateDraftNews } from './redux';
import { Link } from 'react-router-dom';
import Pagination from 'view/component/Pagination';

class RejectModal extends React.Component {
    modal = React.createRef();

    show = id => {
        $(this.modal.current).find('.modal-title').html('Phản hồi');
        $('#reject').val('');
        $(this.modal.current).data('data-id', id).modal('show');
    }

    save = e => {
        e.preventDefault();
        const rejectionReason = $('#reject').val();
        if (rejectionReason) {
            const id = $(this.modal.current).data('data-id'),
                changes = {
                    rejectionReason,
                    isDraftApproved: 0,
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
                            <button type='submit' className='btn btn-success' onClick={e => this.save(e)}>Lưu</button>
                        </div>
                    </div>
                </form>
            </div>
        );
    }
}
class NewsWaitApprovalPage extends React.Component {
    constructor (props) {
        super(props);
    }

    reject = React.createRef();

    componentDidMount() {
        this.props.getDraftNewsInPage(null, null, { isDraftApproved: 1, isTranslated: { $ne: 'in progress' } });
        T.ready('/user/ocer');
    }
    create = (e) => {
        this.props.createDraftNewsDefault(data => this.props.history.push('/user/news/draft/edit/' + data.item.id));
        e.preventDefault();
    };
    revert = (item) => {
        this.reject.current.show(item.id);
    }

    changeActive(item) {
        T.confirm('Bài viết chờ duyệt', 'Bạn có chắc bạn muốn duyệt bài viết này?', 'warning', true,
            isConfirm => isConfirm && this.props.draftToNews(item.id));
    }

    changeTranslated(item) {
        T.confirm('Bài viết chờ duyệt', 'Bạn có chắc bạn muốn dịch bài viết này sang Tiếng Anh?', 'warning', true, isConfirm => isConfirm && this.props.updateDraftNews(item.id, { isTranslated: 'in progress' }));
    }

    delete(e, item) {
        T.confirm('Bài viết', 'Bạn có chắc bạn muốn xóa bài viết này?', 'warning', true, isConfirm => isConfirm && this.props.deleteDraftNews(item.id));
        e.preventDefault();
    }

    render() {
        const { pageNumber, pageSize, pageTotal, totalItem, list, pageCondition } = this.props.news && this.props.news.draft ?
            this.props.news.draft : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, list: [], pageCondition: {} };
        let table = 'Không có bài viết!';
        const currentPermissions = this.props.system && this.props.system.user && this.props.system.user.permissions ? this.props.system.user.permissions : [],
            viewerTranslateType = currentPermissions.includes('news:translate'),
            viewerWriteType = currentPermissions.includes('news:write') || currentPermissions.includes('website:write'),
            viewerDraftType = currentPermissions.includes('news:draft'),
            isAllowedToViewDetail = !viewerTranslateType && (viewerDraftType || viewerWriteType),
            isAdmin = viewerDraftType && viewerTranslateType && viewerWriteType;
        if (list && list.length) {
            table = (
                <table className='table table-hover table-bordered'>
                    <thead>
                        <tr>
                            <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                            <th style={{ width: '80%' }}>Tiêu đề</th>
                            <th style={{ width: '20%', textAlign: 'center' }}>Hình ảnh</th>
                            {(isAdmin || isAllowedToViewDetail) && <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>Người soạn</th>}
                            {(isAdmin || isAllowedToViewDetail) && <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>Đơn vị</th>}
                            {/* {viewerType == 1 ? <th style={{ width: 'auto' }} nowrap='true'>Được duyệt</th> : null} */}
                            {(isAllowedToViewDetail || isAdmin) && <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>Thao tác</th>}
                        </tr>
                    </thead>
                    <tbody>
                        {list.map((item, index) => (
                            <tr key={index}>
                                <td style={{ textAlign: 'right' }}>{(pageNumber - 1) * pageSize + index + 1}</td>
                                <td>
                                    {(isAllowedToViewDetail || isAdmin) ?
                                        <Link to={'/user/news/draft/edit/' + item.id} data-id={item.id}>
                                            {T.language.parse(item.title, true).vi}
                                        </Link> : T.language.parse(item.title, true).vi
                                    }
                                </td>
                                <td style={{ width: '20%', textAlign: 'center' }}>
                                    <img src={item.image} alt='avatar' style={{ height: '32px' }} />
                                </td>
                                {(isAdmin || isAllowedToViewDetail) && <td style={{ textAlign: 'center', whiteSpace: 'nowrap' }}>{item.editorName}</td>}
                                {(isAdmin || isAllowedToViewDetail) && <td style={{ textAlign: 'center', whiteSpace: 'nowrap' }}>{item.donVi}</td>}
                                {/* {viewerType == 1 ? (
                                    <td className='toggle' style={{ textAlign: 'center' }}>
                                        <label>
                                            <input type='checkbox' checked={item.active} disabled={viewerType != 2} onChange={() => { }} /><span className='button-indecator' />
                                        </label>
                                    </td>
                                ) : null} */}
                                {(isAllowedToViewDetail || isAdmin) &&
                                    <td>
                                        <div className='btn-group'>
                                            {viewerWriteType && (<a href='#' className='btn btn-success' onClick={() => this.changeActive(item)} title='Duyệt bản nháp này'> <i className='fa fa-check' /></a>)}
                                            <a href='#' className='btn btn-warning' onClick={() => this.revert(item)} title='Từ chối bản nháp này'> <i className='fa fa-undo' /></a>
                                            {viewerDraftType &&
                                                <>
                                                    <Link to={'/user/news/draft/edit/' + item.id} data-id={item.id} className='btn btn-primary'>
                                                        <i className='fa fa-lg fa-edit' />
                                                    </Link>
                                                    <a className='btn btn-danger' href='#' onClick={e => this.delete(e, item)}>
                                                        <i className='fa fa-lg fa-trash' />
                                                    </a>
                                                    {item.isTranslated === 'done' &&
                                                        <a className='btn btn-warning' href='#' onClick={() => this.changeTranslated(item)}>
                                                            <i className='fa fa-lg fa-language' />
                                                        </a>
                                                    }
                                                    {item.isTranslated === 'ready' &&
                                                        <a className='btn btn-primary' href='#' style={{ backgroundColor: 'purple', borderColor: 'purple' }} onClick={() => this.changeTranslated(item)}>
                                                            <i className='fa fa-lg fa-language' />
                                                        </a>
                                                    }
                                                </>
                                            }
                                        </div>
                                    </td>}
                            </tr>
                        ))}
                    </tbody>
                </table>
            );
        }
        return (
            <main className='app-content'>
                <div className='app-title'>
                    <h1><i className='fa fa-file' /> Bài viết: Chờ duyệt</h1>
                </div>
                <div className='tile'>
                    {table}
                    {/* <button onClick={() => {
                        this.props.history.goBack();
                    }} className='btn btn-secondary btn-circle' style={{ position: 'fixed', bottom: '10px' }}>
                        <i className='fa fa-lg fa-reply' />
                    </button> */}
                    <Pagination name='pageNews'
                        pageNumber={pageNumber} pageSize={pageSize} pageTotal={pageTotal} totalItem={totalItem} pageCondition={pageCondition}
                        getPage={this.props.getDraftNewsInPage} />
                    <RejectModal ref={this.reject} updateDraftNews={this.props.updateDraftNews} />
                    {!currentPermissions.contains('news:write') || isAdmin ?
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
const mapActionsToProps = { getDraftNewsInPage, createDraftNewsDefault, draftToNews, deleteDraftNews, updateDraftNews };
export default connect(mapStateToProps, mapActionsToProps)(NewsWaitApprovalPage);
import React from 'react';
import { connect } from 'react-redux';
import { getFormInPage, createForm, duplicateForm, updateForm, swapForm, deleteForm } from '../redux';
import { Link } from 'react-router-dom';
import Pagination from 'view/component/Pagination';

class CopyModal extends React.Component {
    constructor(props) {
        super(props);

        this.modal = React.createRef();
        this.state = { item: {} };
    }

    componentDidMount() {
        $(document).ready(() => {
            $(this.modal.current).on('hidden.bs.modal', () => {
                this.setState({ item: {} });
            });

            $(this.modal.current).on('shown.bs.modal', () => {
                $('#newFormTitle').focus();
            });
        });
    }

    show = (item) => {
        this.setState({ item });
        $(this.modal.current).modal('show');
    };

    duplicate = (e) => {
        const id = this.state.item.id;
        const title = $('#newFormTitle').val();
        if (!title) {
            T.notify('Tiêu đề bảng câu hỏi bị trống!', 'danger');
            $('#newFormTitle').focus();
        } else {
            this.props.duplicateForm(id, title, data => {
                if (data) {
                    T.notify('Sao chép bảng câu hỏi thành công!', 'success');
                    this.props.getFormInPage();
                }
                $(this.modal.current).modal('hide');
            });
        }
        e.preventDefault();
    };

    render() {
        const item = this.state.item, title = item.title ? item.title.viText() : '';
        return (
            <div className='modal' tabIndex='-1' role='dialog' ref={this.modal}>
                <form className='modal-dialog' role='document' autoComplete='off' onSubmit={this.duplicate}>
                    <div className='modal-content'>
                        <div className='modal-header'>
                            <h5 className='modal-title'>Sao chép bảng câu hỏi: {title}</h5>
                            <button type='button' className='close' data-dismiss='modal' aria-label='Close'>
                                <span aria-hidden='true'>&times;</span>
                            </button>
                        </div>
                        <div className='modal-body'>
                            <div className='form-group'>
                                <label htmlFor='newFormTitle'>Tên bảng câu hỏi mới</label>
                                <input type='text' className='form-control' id='newFormTitle' />
                            </div>
                        </div>
                        <div className='modal-footer'>
                            <button type='button' className='btn btn-secondary' data-dismiss='modal'>Đóng</button>
                            <button type='submit' className='btn btn-primary'>Tạo</button>
                        </div>
                    </div>
                </form>
            </div>
        );
    }
}

class FormPage extends React.Component {
    constructor(props) {
        super(props);
        this.copyModal = React.createRef();
    }

    componentDidMount() {
        this.props.getFormInPage();
        T.ready();
    }

    create = (e) => {
        this.props.createForm(data => this.props.history.push('/user/form/edit/' + data.item.id));
        e.preventDefault();
    };

    changeActive = (item) => {
        this.props.updateForm(item.id, { active: item.active === 1 ? 0 : 1 }, () => T.notify((item.active === 1 ? 'Hủy kích hoạt ' : 'Kích hoạt ') + 'thành công!'));
    };

    changeLock = (item) => {
        this.props.updateForm(item.id, { isLocked: item.isLocked === 1 ? 0 : 1 }, () => T.notify((item.isLocked === 0 ? 'Khóa bảng câu hỏi ' : 'Hủy khóa bảng câu hỏi ') + 'thành công!'));
    };

    swap = (e, item, isMoveUp) => {
        this.props.swapForm(item.id, isMoveUp);
        e.preventDefault();
    };

    delete = (e, item) => {
        T.confirm('Xóa form', `Bạn có chắc bạn muốn xóa form <strong>${item.title.viText()}</strong>?`, 'warning', true, isConfirm =>
            isConfirm && this.props.deleteForm(item.id));
        e.preventDefault();
    };

    render() {
        const currentPermission = this.props.system && this.props.system.user && this.props.system.user.permissions ? this.props.system.user.permissions : [];
        const readOnly = !currentPermission.contains('form:write');
        const hasDelete = currentPermission.contains('form:delete');
        const { pageNumber, pageSize, pageTotal, totalItem, list } = this.props.form && this.props.form.page ?
            this.props.form.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, list: [] };
        const table = list && list.length ? (
            <table className='table table-hover table-bordered'>
                <thead>
                    <tr>
                        <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                        <th style={{ width: '80%' }}>Tiêu đề</th>
                        <th style={{ width: '20%', textAlign: 'center' }}>Hình ảnh</th>
                        <th style={{ width: 'auto' }} nowrap='true'>Kích hoạt</th>
                        <th style={{ width: 'auto' }} nowrap='true'>Khóa bảng câu hỏi</th>
                        <th style={{ width: 'auto', textAlign: 'center' }}>Thao tác</th>
                    </tr>
                </thead>
                <tbody>
                    {list.map((item, index) => (
                        <tr key={index}>
                            <td style={{ textAlign: 'right' }}>{(Math.max(pageNumber - 1, 0)) * pageSize + index + 1}</td>
                            <td>
                                <Link to={'/user/form/edit/' + item.id}>{item.title.viText()}</Link>
                            </td>
                            <td style={{ width: '20%', textAlign: 'center' }}>
                                <img src={item.image ? item.image : '/img/avatar.png'} alt='avatar' style={{ height: '32px' }} />
                            </td>
                            <td className='toggle' style={{ textAlign: 'center' }}>
                                <label>
                                    <input type='checkbox' checked={item.active === 1 ? true : false} onChange={() => this.changeActive(item)} disabled={readOnly} />
                                    <span className='button-indecator' />
                                </label>
                            </td>
                            <td className='toggle' style={{ textAlign: 'center' }}>
                                <label>
                                    <input type='checkbox' checked={item.isLocked === 1 ? true : false} onChange={() => this.changeLock(item)} disabled={readOnly} />
                                    <span className='button-indecator' />
                                </label>
                            </td>
                            <td className='btn-group'>
                                {readOnly ? '' : (
                                    <button className='btn btn-info' onClick={() => this.copyModal.current.show(item)}>
                                        <i className='fa fa-lg fa-copy' />
                                    </button>
                                )}
                                {!readOnly ? [
                                    <a key={0} className='btn btn-success' href='#' onClick={e => this.swap(e, item, true)}>
                                        <i className='fa fa-lg fa-arrow-up' />
                                    </a>,
                                    <a key={1} className='btn btn-success' href='#' onClick={e => this.swap(e, item, false)}>
                                        <i className='fa fa-lg fa-arrow-down' />
                                    </a>
                                ] : null}
                                {/* <Link to={'/user/form/registration/' + item.id} data-id={item.id} className='btn btn-warning'>
                                    <i className='fa fa-lg fa-list-alt' />
                                </Link> */}
                                <Link to={'/user/form/edit/' + item.id} className='btn btn-primary'>
                                    <i className='fa fa-lg fa-edit' />
                                </Link>
                                {hasDelete ?
                                    <a className='btn btn-danger' href='#' onClick={e => this.delete(e, item)}>
                                        <i className='fa fa-lg fa-trash' />
                                    </a> : null
                                }
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        ) : 'Không có bảng câu hỏi!';

        return (
            <main className='app-content'>
                <div className='app-title'>
                    <h1><i className='fa fa-file-text-o' /> Bảng câu hỏi: Danh sách</h1>
                </div>
                <div className='tile'>
                    {table}
                    <Pagination name='pageForm' pageNumber={pageNumber} pageSize={pageSize} pageTotal={pageTotal} totalItem={totalItem} getPage={this.props.getFormInPage} />
                    {!readOnly ?
                        <button type='button' className='btn btn-primary btn-circle' style={{ position: 'fixed', right: '10px', bottom: '10px' }} onClick={this.create}>
                            <i className='fa fa-lg fa-plus' />
                        </button> : null}
                    <CopyModal ref={this.copyModal} duplicateForm={this.props.duplicateForm} getFormInPage={this.props.getFormInPage} />
                </div>
            </main>
        );
    }
}

const mapStateToProps = state => ({ form: state.form, system: state.system });
const mapActionsToProps = { getFormInPage, createForm, updateForm, swapForm, deleteForm, duplicateForm };
export default connect(mapStateToProps, mapActionsToProps)(FormPage);

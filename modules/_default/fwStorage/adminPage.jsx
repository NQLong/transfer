import React from 'react';
import { connect } from 'react-redux';
import Pagination from 'view/component/Pagination';
import FileBox from 'view/component/FileBox';
import T from 'view/js/common.js';
import { getFwStoragePage, updateStorage, deleteStorage } from './redux';
import { getAll } from 'modules/_default/_init/reduxCategory';
import copy from 'copy-to-clipboard';

class FileModal extends React.Component {
    state = { isAdmin: false };
    modal = React.createRef();
    btnSave = React.createRef();
    fileBox = React.createRef();

    componentDidMount() {
        $(document).ready(() => setTimeout(() => {
            $(this.modal.current).on('shown.bs.modal', () => $('#nameDisplay').focus());
        }, 250));
    }

    show = (item) => {
        const { id, nameDisplay, note } = item ?
            item : { id: null, nameDisplay: '', active: false, };
        this.setState({ name, note, id });
        $(this.btnSave.current).data('id', id);
        $('#nameDisplay').val(nameDisplay);
        $('#note').val(note);
        $(this.modal.current).modal('show');
        this.fileBox.current.init();
    }

    save = (e) => {
        e.preventDefault();
        const body = {
            nameDisplay: $('#nameDisplay').val(),
            note: $('#note').val(),
            active: 1
        };
        const value = this.fileBox.current.getFileState();
        if (!body.nameDisplay) {
            T.alert('Vui lòng điền tên hiện thị', 'error', false, 2000);
        } else if (!value && !this.state.id) {
            T.alert('Bạn chưa đính kèm tệp tin, vui lòng kiểm tra lại', 'error', false, 2000);
        } else {
            if (this.state.id) {
                delete body.id;
                this.props.updateStorage(this.state.id, body);
            } else {
                this.fileBox.current.onUploadFile(body);
            }
            $(this.modal.current).modal('hide');
        }
    }

    render() {
        return (
            <div className='modal' tabIndex='-1' role='dialog' ref={this.modal}>
                <form className='modal-dialog' role='document' onSubmit={this.save}>
                    <div className='modal-content'>
                        <div className='modal-header'>
                            <h5 className='modal-title'>Thông tin tệp tin</h5>
                            <button type='button' className='close' data-dismiss='modal' aria-label='Close'>
                                <span aria-hidden='true'>&times;</span>
                            </button>
                        </div>
                        <div className='modal-body'>
                            <div className='form-group'>
                                <label htmlFor='nameDisplay'>Tên hiện thị</label>
                                <input className='form-control' id='nameDisplay' type='text' placeholder='Tên hiện thị' style={{ display: this.state.name == 'admin' ? 'none' : 'block' }} />
                            </div>
                            <div className='form-group'>
                                <label htmlFor='note'>Ghi chú</label>
                                <textarea name='message' id='note' className='form-control' style={{ fontSize: '17px' }} ref={this.message} cols='30' rows='5' placeholder={'Ghi chú'} />
                            </div>
                            <div className='form-group' style={{ display: this.state.id ? 'none' : 'block' }}>
                                <label>Tệp tin tải lên</label>
                                <FileBox ref={this.fileBox} postUrl='/user/upload-file' ajax={false} uploadType='assets' success={this.props.onSuccess} />
                            </div>
                        </div>
                        <div className='modal-footer'>
                            <button type='button' className='btn btn-secondary' data-dismiss='modal'>Đóng</button>
                            {this.state.name != 'admin' || this.state.isAdmin ?
                                <button type='submit' className='btn btn-success' ref={this.btnSave}>Lưu</button> : ''}
                        </div>
                    </div>
                </form>
            </div>
        );
    }
}

class StoragePage extends React.Component {
    constructor(props) {
        super(props);
        this.fileModal = React.createRef();
    }

    componentDidMount() {
        T.ready('/user/storage');
        this.props.getAll('document', data => {
            this.props.getFwStoragePage();
            this.setState({ category: data });
            // data.forEach(item => {
            //     const language = JSON.parse(item.title);
            //     if (language.en == categoryPicker) {
            //         this.pickerType.current.setText(language.vi);
            //     }
            // });
            // consolke.log(data);
        });
    }

    show = (e, item) => {
        e.preventDefault();
        this.fileModal.current.show(item);
    }

    changeActive = (item) => {
        this.props.updateStorage(item.id, { active: item.active ? 0 : 1 });
    }

    onSuccess = ({ error, item }) => {
        if (item) T.alert('Tải lên tệp tin thành công');
        else if (error) T.alert(error, 'error', false, 2000);
        this.props.getFwStoragePage();
    }

    delete = (e, item) => {
        e.preventDefault();
        T.confirm('Xóa vai trò', 'Bạn có chắc bạn muốn xóa vai trò này?', true, isConfirm =>
            isConfirm && this.props.deleteStorage(item.id));
    }

    copyClipboard = (e, item) => {
        e.preventDefault();
        copy(`${T.rootUrl}/static/document/${item.path}`);
    }

    render() {
        const permissions = this.props.system && this.props.system.user && this.props.system.user.permissions ? this.props.system.user.permissions : [],
            hasUpdate = permissions.includes('storage:write');
        const { pageNumber, pageSize, pageTotal, totalItem, list } = this.props.fwStorage && this.props.fwStorage.page ?
            this.props.fwStorage.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, list: null };
        let table = <p>Không có vai trò!</p>;
        if (list && list.length > 0) {
            table = (
                <table className='table table-hover table-bordered'>
                    <thead>
                        <tr>
                            <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                            <th style={{ width: '40%' }}>Tên hiện thị trang chủ</th>
                            <th style={{ width: '30%', textAlign: 'left' }}>Tên tệp tin</th>
                            <th style={{ width: '20%', textAlign: 'left' }} nowrap='true'>Người tạo</th>
                            <th style={{ width: '10%' }} nowrap='true'>Kích hoạt</th>
                            <th style={{ width: 'auto' }} nowrap='true'>Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {list.map((item, index) => (
                            <tr key={index}>
                                <td style={{ textAlign: 'right' }}>{(pageNumber - 1) * pageSize + index + 1}</td>
                                <td>
                                    {hasUpdate ? <a href='#' onClick={e => this.show(e, item)} >{item.nameDisplay}</a> : item.nameDisplay}
                                </td>
                                <td>
                                    {item.path}
                                </td>
                                <th style={{ textAlign: 'left' }}>{item.userUpload}</th>
                                <td className='toggle' style={{ textAlign: 'center' }}>
                                    <label>
                                        <input type='checkbox' checked={item.active} onChange={() => hasUpdate && item.name != 'admin' && this.changeActive(item)} />
                                        <span className='button-indecator' />
                                    </label>
                                </td>
                                <td>
                                    <div className='btn-group'>
                                        <a className='btn btn-warning' href='#' onClick={(e) => this.copyClipboard(e, item)} title='Sao chép địa chỉ'>
                                            <i className='fa fa-lg fa-copy' />
                                        </a>
                                        <a className='btn btn-info' href={'/download/' + item.path} download title='Tải xuống'>
                                            <i className='fa fa-lg fa-download' />
                                        </a>
                                        <a className='btn btn-primary' href='#' onClick={e => this.show(e, item)}>
                                            <i className='fa fa-lg fa-edit' />
                                        </a>
                                        {
                                            permissions.includes('storage:delete') && <a className='btn btn-danger' href='#' onClick={e => this.delete(e, item)}>
                                                <i className='fa fa-lg fa-trash' />
                                            </a>
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
                    <h1><i className='fa fa-user' /> Tài liệu lưu trữ</h1>
                </div>
                <div className='row tile'>{table}</div>
                <Pagination name='pageFwStorage'
                    pageNumber={pageNumber} pageSize={pageSize} pageTotal={pageTotal} totalItem={totalItem} getPage={this.props.getFwStoragePage} />
                <button type='button' className='btn btn-primary btn-circle' style={{ position: 'fixed', right: '10px', bottom: '10px' }} onClick={this.show}>
                    <i className='fa fa-lg fa-plus' />
                </button>
                <FileModal ref={this.fileModal} onSuccess={this.onSuccess} updateStorage={this.props.updateStorage} />
            </main>
        );
    }
}

const mapStateToProps = state => ({ system: state.system, fwStorage: state.fwStorage });
const mapActionsToProps = { getFwStoragePage, updateStorage, deleteStorage, getAll };
export default connect(mapStateToProps, mapActionsToProps)(StoragePage);

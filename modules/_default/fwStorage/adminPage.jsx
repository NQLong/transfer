import React from 'react';
import { connect } from 'react-redux';
import T from 'view/js/common.js';
import { getFwStorageAll, getFwStoragePage, createFwStorage, updateStorage, deleteStorage } from './redux';
import { getAll } from 'modules/_default/_init/reduxCategory';
import Pagination from 'view/component/Pagination';
import { Link } from 'react-router-dom';
import copy from 'copy-to-clipboard';
import { TableCell, FormFileBox, renderTable, AdminPage, AdminModal, FormTextBox, FormRichTextBox, getValue } from 'view/component/AdminPage';

class EditModal extends AdminModal {

    componentDidMount() {
        this.onShown(() => {
            !this.nameDisplay.value() ? this.nameDisplay.focus() : this.note.focus();
        });
    }


    onShow = (item) => {
        let { id, nameDisplay, note, active } = item ?
            item : { id: null, nameDisplay: '', note: '', active: 1 };
        this.setState({ id, active });
        this.nameDisplay.value(nameDisplay);
        this.note.value(note);
        this.fileBox.fileBox.setData('fwStorageFile:' + (id ? id : 'new'));

    };

    onSubmit = (e) => {
        e.preventDefault();
        const changes = {
            nameDisplay: getValue(this.nameDisplay || ''),
            note: getValue(this.note || ''),

        };
        if (this.state.id) {
            if (this.fileBox.fileBox.getFile())
                this.fileBox.fileBox.onUploadFile({ ...changes, active: this.state.active });
            else
                this.props.updateStorage(this.state.id, changes);
        }
        else {
            this.fileBox.fileBox.onUploadFile({ active: 1, ...changes });
        }
        this.hide();
    };

    render = () => {
        return this.renderModal({
            title: this.state.id ? 'Cập nhật file lưu trữ' : 'Tạo mới file lưu trữ',
            size: 'large',
            body:
                <div className='row'>
                    <FormTextBox className='col-12' ref={e => this.nameDisplay = e} label='Tên hiển thị' required />
                    <FormRichTextBox className='col-12' ref={e => this.note = e} label='Ghi chú' rows='5' required />
                    <FormFileBox className='col-12' ref={e => this.fileBox = e} label='Tệp tin tải lên' postUrl='/user/upload' uploadType='fwStorageFile' onSuccess={this.props.onSuccess} required pending userData='fwStorageFile' />

                </div>
        }
        );
    };
}

class StoragePage extends AdminPage {
    componentDidMount() {
        T.ready('/user/storage');
        this.props.getFwStoragePage();
    }

    showModal = (e) => {
        e.preventDefault();
        this.modal.show();
    }

    onSuccess = ({ error, item }) => {
        if (item) T.alert('Tải lên tệp tin thành công');
        else if (error) T.alert(error, 'error', false, 2000);
        this.props.getFwStoragePage();
    }

    delete = (e, item) => {
        e.preventDefault();
        T.confirm('Xóa tài liệu', 'Bạn có chắc bạn muốn xóa tài liệu này?', true, isConfirm =>
            isConfirm && this.props.deleteStorage(item.id));
    }

    copyClipboard = (e, item) => {
        e.preventDefault();
        // copy(`${T.rootUrl}/static/document/${encodeURI(item.nameDisplay)}.${item.path.split('.').pop()}`);
        copy(`${T.rootUrl}/api/storage/download/${item.path}?displayName=${encodeURI(item.nameDisplay)}`);
    }


    render() {
        const { pageNumber, pageSize, pageTotal, totalItem, list } = this.props.fwStorage && this.props.fwStorage.page ?
            this.props.fwStorage.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, list: null };
        const permissions = this.getUserPermission('storage');
        const table = renderTable({
            getDataSource: () => list, stickyHead: false,
            emptyTable: 'Chưa có tài liệu nào!',
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>#</th>
                    <th style={{ width: '40%' }} nowrap='true'>Tên hiện thị trang chủ</th>
                    <th style={{ width: '50%', textAlign: 'left' }} nowrap='true'>Người tạo</th>
                    <th style={{ width: '10%' }} nowrap='true'>Kích hoạt</th>
                    <th style={{ width: 'auto' }} nowrap='true'>Thao tác</th>
                </tr>
            ),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell content={index + 1} />
                    <TableCell content={item.nameDisplay} />
                    {/* <TableCell content = {item.path} /> */}
                    <TableCell content={item.userUpload} />
                    <TableCell type='checkbox' content={item.active} permission={permissions} onChanged={value => this.props.updateStorage(item.id, { active: Number(value) })} />
                    <TableCell type='buttons' onEdit={() => this.modal.show(item)} onDelete={e => this.delete(e, item)} permission={permissions}>
                        <a className='btn btn-warning' href='#' onClick={(e) => this.copyClipboard(e, item)} title='Sao chép địa chỉ'>
                            <i className='fa fa-lg fa-copy' />
                        </a>
                        <a className='btn btn-info' href={`/api/storage/download/${item.path}?displayName=${item.nameDisplay}`} download title='Tải xuống'>
                            <i className='fa fa-lg fa-download' />
                        </a>
                    </TableCell>

                </tr>
            )
        });

        return this.renderPage({
            icon: 'fa fa-user',
            title: 'Tài liệu lưu trữ',
            breadcrumb: [
                <Link key={0} to='/user' >User</Link>,
                'Tài liệu lưu trữ'
            ],
            content:
                <>
                    <div className='tile'>{table}</div>
                    <Pagination style={{ marginLeft: '70px' }} {...{ pageNumber, pageSize, pageTotal, totalItem }}
                        getPage={this.props.getFwStoragePage} />
                    <EditModal ref={e => this.modal = e} readOnly={!permissions.write} updateStorage={this.props.updateStorage} onSuccess={this.onSuccess} />
                </>
            ,
            backRoute: '/user',
            onCreate: permissions && permissions.write ? (e) => this.showModal(e) : null
        });
    }
}

const mapStateToProps = state => ({ system: state.system, fwStorage: state.fwStorage });
const mapActionsToProps = { getFwStorageAll, getFwStoragePage, createFwStorage, updateStorage, deleteStorage, getAll };
export default connect(mapStateToProps, mapActionsToProps)(StoragePage);

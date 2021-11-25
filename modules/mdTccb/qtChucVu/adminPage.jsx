import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { AdminPage, TableCell, renderTable, AdminModal, FormTextBox, } from 'view/component/AdminPage';
import Pagination from 'view/component/Pagination';
import {
    getQtChucVuPage, getQtChucVuAll, updateQtChucVu,
    deleteQtChucVu, createQtChucVu
} from './redux';
import { getDmChucVuAll } from 'modules/mdDanhMuc/dmChucVu/redux';
import { getDmDonViAll } from 'modules/mdDanhMuc/dmDonVi/redux';

class EditModal extends AdminModal {
    donViTable = [];
    chucVuTable = [];
    state = { stt: null };
    componentDidMount() {

        $(document).ready(() => this.onShown(() => {
            this.shcc.focus();
        }));
        this.props.getDonVi(items => {
            if (items) {
                this.donViTable = [];
                items.forEach(item => this.donViTable.push({
                    'id': item.ma,
                    'text': item.ten
                }));
            }
        });
        this.props.getChucVu(items => {
            if (items) {
                this.chucVuTable = [];
                items.forEach(item => this.chucVuTable.push({
                    'id': item.ma,
                    'text': item.ten
                }));
            }
        });
    }

    onShow = (item) => {
        let { stt, shcc, maChucVu, maDonVi, soQd, ngayRaQd, chucVuChinh, maBoMon } = item ? item : {
            shcc: '', maChucVu: '', maDonVi: '', soQd: '', ngayRaQd: '', chucVuChinh: '', maBoMon: '',
        };
        this.setState({ stt, item });
        this.shcc.value(shcc ? shcc : '');
        this.maChucVu.value(maChucVu ? maChucVu : '');
        this.maDonVi.value(maDonVi ? maDonVi : '');
        this.soQd.value(soQd ? soQd : '');
        this.ngayRaQd.value(ngayRaQd ? ngayRaQd : '');
        this.chucVuChinh.value(chucVuChinh ? 1 : 0);
        this.maBoMon.value(maBoMon ? maBoMon : '');
    };

    changeKichHoat = (value, target) => target.value(value ? 1 : 0) || target.value(value);

    onSubmit = (e) => {
        e.preventDefault();
        const changes = {
            shcc: this.shcc.value(),
            maChucVu: this.maChucVu.value(),
            maDonVi: this.maDonVi.value(),
            soQd: this.soQd.value(),
            ngayRaQd: this.ngayRaQd.value(),
            chucVuChinh: this.chucVuChinh.value(),
            maBoMon: this.maBoMon.value(),
        };
        if (changes.shcc == '') {
            T.notify('Số hiệu công chức bị trống');
            this.shcc.focus();
        } else {
            this.state.stt ? this.props.update(this.state.stt, changes, this.hide) : this.props.create(changes, this.hide);
        }
    }

    render = () => {
        const readOnly = this.props.readOnly;
        return this.renderModal({
            title: this.state.stt ? 'Cập nhật quá trình chức vụ' : 'Tạo mới quá trình chức vụ',
            size: 'large',
            body: <div className='row'>
                <FormTextBox type='text' className='col-md-3' ref={e => this.ho = e} label='Họ' readOnly={readOnly} />
                <FormTextBox type='text' className='col-md-3' ref={e => this.ten = e} label='Tên' readOnly={readOnly} />
                <FormTextBox type='text' className='col-md-3' ref={e => this.shcc = e} label='Số hiệu công chức' readOnly={readOnly} />
            </div>
        });
    }
}

class QtChucVu extends AdminPage {
    componentDidMount() {
        T.ready('/user/tccb', () => {
            T.onSearch = (searchText) => this.props.getQtChucVuPage(undefined, undefined, searchText || '');
            T.showSearchBox();
            this.props.getQtChucVuPage();
        });
    }

    showModal = (e) => {
        e.preventDefault();
        this.modal.show();
    }

    delete = (e, item) => {
        T.confirm('Xóa chức vụ', 'Bạn có chắc bạn muốn xóa chức vụ này?', 'warning', true, isConfirm => {
            isConfirm && this.props.deleteQtChucVu(item.stt, error => {
                if (error) T.notify(error.message ? error.message : 'Xoá chức vụ bị lỗi!', 'danger');
                else T.alert('Xoá chức vụ thành công!', 'success', false, 800);
            });
        });
        e.preventDefault();
    }

    render() {
        const currentPermissions = this.props.system && this.props.system.user && this.props.system.user.permissions ? this.props.system.user.permissions : [],
            permission = this.getUserPermission('QtChucVu', ['read', 'write', 'delete']);
        let { pageNumber, pageSize, pageTotal, totalItem, pageCondition, list } = this.props.QtChucVu && this.props.QtChucVu.page ?
            this.props.QtChucVu.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, list };
        let table = 'Không có danh sách!';
        if (list && list.length > 0) {
            table = renderTable({
                getDataSource: () => list, stickyHead: false,
                renderHead: () => (
                    <tr>
                        <th style={{ width: '10%', textAlign: 'center' }}>SHCC</th>
                        <th style={{ width: '15%' }}>Chức vụ</th>
                        <th style={{ width: '10%' }}>Đơn vị</th>
                        <th style={{ width: '10%', textAlign: 'center' }}>Số quyết định</th>
                        <th style={{ width: '10%', textAlign: 'center' }}>Ngày ra quyết định</th>
                        <th style={{ width: '20%' }}>Chức vụ chính</th>
                        <th style={{ width: '15%', textAlign: 'center' }}>Bộ môn</th>

                    </tr>
                ),
                renderRow: (item, index) => (
                    <tr key={index}>
                        <TableCell type='text' content={item.shcc} style={{ textAlign: 'center' }} />
                        <TableCell type='text' content={item.maChucVu} />
                        <TableCell type='text' content={item.maDonVi} />
                        <TableCell type='text' content={item.soQd} />
                        <TableCell type='date' style={{ textAlign: 'center' }} content={item.ngayRaQd} dateFormat='dd/mm/yyyy' />
                        <TableCell type='text' content={item.ghiChu} />
                        <TableCell type='buttons' style={{ textAlign: 'center' }} content={item} permission={permission}
                            onEdit={() => this.modal.show(item)} onDelete={e => this.delete(e, item)} />
                    </tr>
                )
            });
        }

        return this.renderPage({
            icon: 'fa fa-list-alt',
            title: 'Quá trình chức vụ',
            breadcrumb: [
                <Link key={0} to='/user/tccb'>Tổ chức cán bộ</Link>,
                'Quá trình chức vụ'
            ],
            content: <>
                <div className='tile'>{table}</div>
                <Pagination style={{ marginLeft: '70px' }} {...{ pageNumber, pageSize, pageTotal, totalItem, pageCondition }}
                    getPage={this.props.getQtChucVuPage} />
                <EditModal ref={e => this.modal = e} permission={permission}
                    create={this.props.createQtChucVu} update={this.props.updateQtChucVu}
                    getDonVi={this.props.getDmDonViAll} permissions={currentPermissions}
                    getChucVu={this.props.getDmChucVuAll} />
            </>,
            backRoute: '/user/tccb',
            onCreate: permission && permission.write ? (e) => this.showModal(e) : null,
        });
    }
}

const mapStateToProps = state => ({ system: state.system, QtChucVu: state.QtChucVu });
const mapActionsToProps = {
    getQtChucVuAll, getQtChucVuPage, deleteQtChucVu, getDmDonViAll, createQtChucVu,
    updateQtChucVu, getDmChucVuAll
};
export default connect(mapStateToProps, mapActionsToProps)(QtChucVu);
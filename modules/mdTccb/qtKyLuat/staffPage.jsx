import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { AdminPage, TableCell, renderTable, AdminModal, FormSelect, FormTextBox, FormRichTextBox, FormDatePicker } from 'view/component/AdminPage';
import Pagination from 'view/component/Pagination';
import {
    createQtKyLuatUserPage, getQtKyLuatUserPage, deleteQtKyLuatUserPage,
    updateQtKyLuatUserPage,
} from './redux';
import { SelectAdapter_DmKyLuatV2 } from 'modules/mdDanhMuc/dmKhenThuongKyLuat/reduxKyLuat';

class EditModal extends AdminModal {
    state = {
        id: '',
    };

    onShow = (item) => {

        let { id, lyDoHinhThuc, diemThiDua, noiDung, soQuyetDinh, ngayRaQuyetDinh } = item && item.item ? item.item : {
            id: '', lyDoHinhThuc: '', diemThiDua: '', noiDung: '', soQuyetDinh: '', ngayRaQuyetDinh: ''
        };

        this.setState({
            id,
            maCanBo: item.maCanBo
        }, () => {
            this.hinhThucKyLuat.value(lyDoHinhThuc);
            this.diemThiDua.value(diemThiDua || '');
            this.noiDung.value(noiDung || '');
            this.soQuyetDinh.value(soQuyetDinh || '');
            this.ngayRaQuyetDinh.value(ngayRaQuyetDinh || '');
        });
    };

    onSubmit = (e) => {
        e.preventDefault();
        const changes = {
            shcc: this.state.maCanBo,
            lyDoHinhThuc: this.hinhThucKyLuat.value(),
            diemThiDua: this.diemThiDua.value(),
            noiDung: this.noiDung.value(),
            soQuyetDinh: this.soQuyetDinh.value(),
            ngayRaQuyetDinh: Number(this.ngayRaQuyetDinh.value()),
        };
        if (!this.soQuyetDinh.value()) {
            T.notify('Số quyết định trống', 'danger');
            this.soQuyetDinh.focus();
        } else if (!this.ngayRaQuyetDinh.value()) {
            T.notify('Ngày ra quyết định trống', 'danger');
            this.ngayRaQuyetDinh.focus();
        } else if (!this.hinhThucKyLuat.value()) {
            T.notify('Hình thức kỷ luật trống', 'danger');
            this.hinhThucKyLuat.focus();
        } else {
            this.state.id ? this.props.update(this.state.id, changes, this.hide) : this.props.create(changes, this.hide);
        }
    }

    render = () => {
        const readOnly = this.props.readOnly;
        return this.renderModal({
            title: this.state.id ? 'Cập nhật quá trình kỷ luật' : 'Tạo mới quá trình kỷ luật',
            size: 'large',
            body: <div className='row'>
                <FormTextBox className='col-md-4' ref={e => this.soQuyetDinh = e} type='text' label='Số quyết định' readOnly={readOnly} required />
                <FormDatePicker className='col-md-4' type='date-mask' ref={e => this.ngayRaQuyetDinh = e} label='Ngày ra quyết định' readOnly={readOnly} required />
                <FormSelect className='col-md-4' ref={e => this.hinhThucKyLuat = e} label='Hình thức kỷ luật' data={SelectAdapter_DmKyLuatV2} readOnly={readOnly} required />

                <FormRichTextBox className='col-md-12' ref={e => this.noiDung = e} rows={10} readOnly={readOnly} label='Nội dung kỷ luật' placeholder='Nhập nội dung kỷ luật (tối đa 1000 ký tự)' />

                <FormTextBox className='col-md-4' ref={e => this.diemThiDua = e} type='number' label='Điểm thi đua' readOnly={readOnly} />

            </div>
        });
    }
}
class QtKyLuatUserPage extends AdminPage {
    state = { filter: {} };
    componentDidMount() {
        T.ready('/user', () => {
            const { shcc } = this.props.system && this.props.system.user ? this.props.system.user : { shcc: '' };
            this.setState({ filter: { listShcc: shcc, listDv: '', fromYear: null, toYear: null, listHinhThucKyLuat: '' } });
            this.getPage();
        });
    }

    getPage = (pageN, pageS, pageC, done) => {
        this.props.getQtKyLuatUserPage(pageN, pageS, pageC, this.state.filter, done);
    }


    showModal = (e) => {
        e.preventDefault();
        this.modal.show({ item: null, maCanBo: this.state.filter.listShcc });
    }

    delete = (e, item) => {
        T.confirm('Xóa kỷ luật', 'Bạn có chắc bạn muốn xóa kỷ luật này?', 'warning', true, isConfirm => {
            isConfirm && this.props.deleteQtKyLuatUserPage(item.id, error => {
                if (error) T.notify(error.message ? error.message : 'Xoá kỷ luật bị lỗi!', 'danger');
                else T.alert('Xoá kỷ luật thành công!', 'success', false, 800);
            });
        });
        e.preventDefault();
    }

    render() {
        let permission = this.getUserPermission('staff', ['login']);
        if (permission.login == true) {
            permission = {
                write: false,
                delete: false
            };
        }
        const { isStaff, shcc } = this.props.system && this.props.system.user ? this.props.system.user : { isStaff: false, shcc: '' };
        const { firstName, lastName } = isStaff && this.props.system.user || { firstName: '', lastName: '' };
        const name = isStaff ? `${lastName} ${firstName} (${shcc})` : '';
        let { pageNumber, pageSize, pageTotal, totalItem, pageCondition, list } = this.props.qtKyLuat && this.props.qtKyLuat.userPage ? this.props.qtKyLuat.userPage : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, pageCondition: {}, list: [] };
        let table = 'Không có danh sách!';
        if (list && list.length > 0) {
            table = renderTable({
                getDataSource: () => list, stickyHead: true,
                renderHead: () => (
                    <tr>
                        <th style={{ width: 'auto', textAlign: 'right' }}>#</th>
                        <th style={{ width: '50%', whiteSpace: 'nowrap' }}>Hình thức kỷ luật</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Nội dung kỷ luật</th>
                        <th style={{ width: '50%', whiteSpace: 'nowrap' }}>Số quyết định</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Ngày ra quyết định</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Điểm thi đua</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Thao tác</th>
                    </tr>
                ),
                renderRow: (item, index) => (
                    <tr key={index}>
                        <TableCell type='text' style={{ textAlign: 'right' }} content={(pageNumber - 1) * pageSize + index + 1} />
                        <TableCell type='text' style={{ color: 'red' }} content={(<span><b>{item.tenKyLuat || ''}</b></span>)} />
                        <TableCell type='text' contentClassName='multiple-lines-5' content={(item.noiDung || '')} />
                        <TableCell type='text' content={(<b> {item.soQuyetDinh || ''} </b>)} />
                        <TableCell type='date' style={{ color: 'blue' }} dateFormat='dd/mm/yyyy' content={item.ngayRaQuyetDinh} />
                        <TableCell type='text' style={{ textAlign: 'right' }} content={item.diemThiDua} />
                        <TableCell type='buttons' style={{ textAlign: 'center' }} content={item} permission={permission}
                            onEdit={() => this.modal.show({ item, maCanBo: shcc })} onDelete={this.delete} >
                        </TableCell>
                    </tr>
                )
            });
        }

        return this.renderPage({
            icon: 'fa fa-ban',
            title: 'Quá trình kỷ luật',
            subTitle: <span style={{ color: 'blue' }}>Cán bộ: {name}</span>,
            breadcrumb: [
                <Link key={0} to='/user/'>Trang cá nhân</Link>,
                'Kỷ luật'
            ],
            content: <>
                {/* <div className='tile'>
                    <h3 className='tile-title'>
                        Thống kê
                    </h3>
                    <b>{'Số lượng: ' + totalItem.toString()}</b>
                </div> */}
                <div className='tile'>
                    {table}
                </div>
                <Pagination style={{ marginLeft: '70px' }} {...{ pageNumber, pageSize, pageTotal, totalItem, pageCondition }}
                    getPage={this.getPage} />
                <EditModal ref={e => this.modal = e} maCanBo={shcc} readOnly={!permission.write}
                    create={this.props.createQtKyLuatUserPage} update={this.props.updateQtKyLuatUserPage}
                />
            </>,
            backRoute: '/user',
            onCreate: permission && permission.write ? (e) => this.showModal(e) : null,
        });
    }
}

const mapStateToProps = state => ({ system: state.system, qtKyLuat: state.tccb.qtKyLuat });
const mapActionsToProps = {
    createQtKyLuatUserPage, getQtKyLuatUserPage, deleteQtKyLuatUserPage,
    updateQtKyLuatUserPage,
};
export default connect(mapStateToProps, mapActionsToProps)(QtKyLuatUserPage);
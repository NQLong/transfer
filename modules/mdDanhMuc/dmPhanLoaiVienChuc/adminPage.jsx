import React from 'react';
import { connect } from 'react-redux';
import { getDmPhanLoaiVienChucPage, createDmPhanLoaiVienChuc, updateDmPhanLoaiVienChuc, deleteDmPhanLoaiVienChuc } from './redux';
import Pagination from 'view/component/Pagination';
import { Link } from 'react-router-dom';
import { AdminPage, TableCell, renderTable, AdminModal, FormTextBox, FormCheckbox } from 'view/component/AdminPage';

class EditModal extends AdminModal {
    componentDidMount() {
        $(document).ready(() => this.onShown(() => {
            !this.ma.value() ? this.ma.focus() : this.ten.focus();
        }));
    }

    onShow = (item) => {
        let { ma, ten, ghiChu, kichHoat } = item ? item : { ma: '', ten: '', ghiChu: '', kichHoat: 1 };
        this.setState({ ma, item });
        this.ma.value(ma);
        this.ten.value(ten);
        this.ghiChu.value(ghiChu ? ghiChu : '');
        this.kichHoat.value(kichHoat);
    };

    onSubmit = (e) => {
        e.preventDefault();
        const changes = {
            ma: this.ma.value(),
            ten: this.ten.value(),
            ghiChu: this.ghiChu.value(),
            kichHoat: Number(this.kichHoat.value())
        };
        if (!this.state.ma && !this.ma.value()) {
            T.notify('Mã không được trống!', 'danger');
            this.ma.focus();
        } else if (changes.ten == '') {
            T.notify('Tên không được bị trống!', 'danger');
            this.ten.focus();
        } else {
            this.state.ma ? this.props.update(this.state.ma, changes, this.hide) : this.props.create(changes, this.hide);
        }
    };

    changeKichHoat = value => this.kichHoat.value(value ? 1 : 0) || this.kichHoat.value(value);

    render = () => {
        const readOnly = this.props.readOnly;
        return this.renderModal({
            title: this.state.ma ? 'Tạo mới phân loại viên chức' : 'Cập nhật phân loại viên chức',
            size: 'large',
            body: <div className='row'>
                <FormTextBox type='text' className='col-12' ref={e => this.ma = e} label='Mã' readOnly={this.state.ma ? true : readOnly} placeholder='Mã phân loại viên chức' required />
                <FormTextBox type='text' className='col-12' ref={e => this.ten = e} label='Tên' readOnly={readOnly} placeholder='Tên phân loại viên chức' required />
                <FormTextBox type='text' className='col-12' ref={e => this.ghiChu = e} label='Ghi chú' readOnly={readOnly} placeholder='Ghi chú' />
                <FormCheckbox className='col-md-6' ref={e => this.kichHoat = e} label='Kích hoạt' isSwitch={true} readOnly={readOnly} style={{ display: 'inline-flex', margin: 0 }}
                    onChange={value => this.changeKichHoat(value ? 1 : 0)} />
            </div>
        }
        );
    }
}

class dmPhanLoaiVienChucPage extends AdminPage {
    state = { searching: false };

    componentDidMount() {
        T.ready('/user/category', () => {
            T.onSearch = (searchText) => this.props.getDmPhanLoaiVienChucPage(undefined, undefined, searchText || '');
            T.showSearchBox();
            this.props.getDmPhanLoaiVienChucPage();
        });
    }

    showModal = (e) => {
        e.preventDefault();
        this.modal.show();
    }

    delete = (e, item) => {
        T.confirm('Xóa Phân loại viên chức', `Bạn có chắc bạn muốn xóa Phân loại viên chức ${item.ten ? `<b>${item.ten}</b>` : 'này'}?`, 'warning', true, isConfirm => {
            isConfirm && this.props.deleteDmPhanLoaiVienChuc(item.ma, error => {
                if (error) T.notify(error.message ? error.message : `Xoá Phân loại viên chức ${item.ten} bị lỗi!`, 'danger');
                else T.alert(`Xoá Phân loại viên chức ${item.ten} thành công!`, 'success', false, 800);
            });
        });
        e.preventDefault();
    }
    render() {
        const currentPermissions = this.props.system && this.props.system.user && this.props.system.user.permissions ? this.props.system.user.permissions : [],
            permission = this.getUserPermission('dmPhanLoaiVienChuc', ['read', 'write', 'delete']);
        let { pageNumber, pageSize, pageTotal, totalItem, pageCondition, list } = this.props.dmPhanLoaiVienChuc && this.props.dmPhanLoaiVienChuc.page ?
            this.props.dmPhanLoaiVienChuc.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, pageCondition: '', list: [] };

        const table = !(list && list.length > 0) ? 'Không có dữ liệu Phân loại viên chức' :
            renderTable({
                getDataSource: () => list, stickyHead: false,
                renderHead: () => (
                    <tr>
                        <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                        <th style={{ width: 'auto' }}>Mã</th>
                        <th style={{ width: '50%' }}>Tên</th>
                        <th style={{ width: '50%', whiteSpace: 'nowrap' }}>Ghi chú</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Kích hoạt</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Thao tác</th>
                    </tr>),
                renderRow: (item, index) => (
                    <tr key={index}>
                        <TableCell type='number' content={(pageNumber - 1) * pageSize + index + 1} style={{ textAlign: 'right' }} />
                        <TableCell type='link' content={item.ma} onClick={() => this.modal.show(item)} />
                        <TableCell type='text' content={item.ten} />
                        <TableCell type='text' content={item.ghiChu} />
                        <TableCell type='checkbox' content={item.kichHoat}
                            permission={permission} onChanged={value => this.props.updateDmPhanLoaiVienChuc(item.ma, { kichHoat: value ? 1 : 0, })} />
                        <TableCell type='buttons' content={item} permission={permission}
                            onEdit={() => this.modal.show(item)} onDelete={this.delete} />
                    </tr>
                ),
            });


        return this.renderPage({
            icon: 'fa fa-list-alt',
            title: 'Phân loại viên chức',
            breadcrumb: [
                <Link key={0} to='/user/category'>Danh mục</Link>,
                'Phân loại viên chức'
            ],
            content: <>
                <div className='tile'>{table}</div>
                <Pagination style={{ marginLeft: '65px' }} {...{ pageNumber, pageSize, pageTotal, totalItem, pageCondition }} getPage={this.props.getDmPhanLoaiVienChucPage} />
                <EditModal ref={e => this.modal = e} permission={permission}
                    create={this.props.createDmPhanLoaiVienChuc} update={this.props.updateDmPhanLoaiVienChuc} permissions={currentPermissions} />
            </>,
            backRoute: '/user/category',
            onCreate: permission && permission.write ? (e) => this.showModal(e) : null
        });
    }
}

const mapStateToProps = state => ({ system: state.system, dmPhanLoaiVienChuc: state.danhMuc.dmPhanLoaiVienChuc });
const mapActionsToProps = { getDmPhanLoaiVienChucPage, createDmPhanLoaiVienChuc, updateDmPhanLoaiVienChuc, deleteDmPhanLoaiVienChuc };
export default connect(mapStateToProps, mapActionsToProps)(dmPhanLoaiVienChucPage);

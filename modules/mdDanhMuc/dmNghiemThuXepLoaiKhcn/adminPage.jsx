import React from 'react';
import { connect } from 'react-redux';
import { getDmNghiemThuXepLoaiKhcnAll, deleteDmNghiemThuXepLoaiKhcn, createDmNghiemThuXepLoaiKhcn, updateDmNghiemThuXepLoaiKhcn } from './redux';
import { Link } from 'react-router-dom';
import { AdminPage, AdminModal, TableCell, renderTable, FormTextBox, FormCheckbox } from 'view/component/AdminPage';

class EditModal extends AdminModal {
    state = {};

    componentDidMount() {
        $(document).ready(() => this.onShown(() => {
            !this.ma.value() ? this.ma.focus() : this.ten.focus();
        }));
    }

    onShow = (item = {}) => {
        let { ma, ten, kichHoat, ghiChu } = item ? item : { ma: '', ten: '', kichHoat: 1, ghiChu: '' };
        this.ma.value(ma);
        this.ten.value(ten);
        this.ghiChu.value(ghiChu ? ghiChu : '');
        this.kichHoat.value(kichHoat ? 1 : 0);
    };

    changeKichHoat = value => this.kichHoat.value(value ? 1 : 0) || this.kichHoat.value(value);

    getValue = input => {
        const data = input.getVal();
        if (data) return data;
        if (input.required) throw { input };
        return data;
    };
    onSubmit = (e) => {
        e.preventDefault();
        try {
            const data = {
                ma: this.getValue(this.ma),
                ten: this.getValue(this.ten),
                ghiChu: this.getValue(this.ghiChu),
                kichHoat: this.getValue(this.kichHoat)
            };
            this.state.isUpdate ? this.props.update(data.ma, data) : this.props.create(data);
        }
        catch (error) {
            if (error.input) {
                error.input.focus();
                T.notify('<b>' + (error.input.label || 'Dữ liệu') + '</b> bị trống!!', 'danger');
            }
        }
    }

    render = () => {
        const readOnly = this.props.readOnly;
        return (this.renderModal({
            title: this.state.ma ? 'Cập nhật nghiệm thu xếp loại KHCN' : 'Tạo mới nghiệm thu xếp loại KHCN',
            body: <div className='row'>
                <FormTextBox className='col-md-12' ref={this.ma} required label='Mã sở hữu trí tuệ' disabled={readOnly} />
                <FormTextBox type='text' className='col-md-12' ref={this.ten} label='Tên' disabled={readOnly} />
                <FormTextBox type='text' className='col-md-12' ref={this.ghiChu} label='Ghi chú' disabled={readOnly} />
                <FormCheckbox className='col-md-6' ref={e => this.kichHoat = e} label='Kích hoạt' isSwitch={true} readOnly={readOnly} onChange={value => this.changeKichHoat(value ? 1 : 0)} />
            </div>
        }));
    }
}

class DmNghiemThuXepLoaiKhcnPage extends AdminPage {

    componentDidMount() {
        T.ready('/user/category', () => {
            T.onSearch = (searchText) => this.props.getDmNghiemThuXepLoaiKhcnAll(undefined, undefined, searchText || '');
            T.showSearchBox();
            this.props.getDmNghiemThuXepLoaiKhcnAll();
        });
    }

    showModal = (e) => {
        e.preventDefault();
        this.modal.current.show();
    }

    delete = (e, item) => {
        e.preventDefault();
        T.confirm('Xóa nghiệm thu xếp loại KHCN', 'Bạn có chắc bạn muốn xóa danh mục này?', true, isConfirm =>
            isConfirm && this.props.deleteDmNghiemThuXepLoaiKhcn(item.ma));
    }

    render() {
        const currentPermissions = this.props.system && this.props.system.user && this.props.system.user.permissions ? this.props.system.user.permissions : [],
            permission = this.getUserPermission('dmNghiemThuXepLoaiKhcn', ['read', 'write', 'delete']);
        let table = 'Không có danh sách!',
            items = this.props.dmNghiemThuXepLoaiKhcn && this.props.dmNghiemThuXepLoaiKhcn.items ? this.props.dmNghiemThuXepLoaiKhcn.items : [];
        if (items && items.length > 0) {
            items.sort((a, b) => a.ma < b.ma ? -1 : 1);
            table = renderTable({
                getDataSource: () => items, stickyHead: false,
                renderHead: () => (
                    <tr>
                        <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                        <th style={{ width: 'auto' }}>Mã</th>
                        <th style={{ width: '20%' }}>Tên</th>
                        <th style={{ width: '80%' }}>Ghi chú</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Kích hoạt</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Thao tác</th>
                    </tr>),
                renderRow: (item, index) => (
                    <tr key={index}>
                        <TableCell type='text' content={index + 1} />
                        <TableCell type='link' content={item.ma ? item.ma : ''} onClick={() => this.modal.show(item)} />
                        <TableCell type='text' content={item.ten ? item.ten : ''} />
                        <TableCell type='text' content={item.ghiChu} />
                        <TableCell type='checkbox' content={item.kichHoat} permission={permission}
                            onChanged={value => this.props.updateDmNghiemThuXepLoaiKhcn(item.ma, { kichHoat: value ? 1 : 0, })} />
                        <TableCell type='buttons' content={item} permission={permission}
                            onEdit={() => this.modal.show(item)} onDelete={this.delete} />
                    </tr>)
            });
        }

        return this.renderPage({
            icon: 'fa fa-list-alt',
            title: 'Danh mục Nghiệm thu xếp loại KHCN',
            breadcrumb: [
                <Link key={0} to='/user/category'>Danh mục</Link>,
                'Danh mục Nghiệm thu xếp loại KHCN'
            ],
            content: <>
                <div className='tile'>{table}</div>
                <EditModal ref={e => this.modal = e} permission={permission}
                    create={this.props.createDmNghiemThuXepLoaiKhcn} update={this.props.updateDmNghiemThuXepLoaiKhcn} permissions={currentPermissions} />
            </>,
            backRoute: '/user/category',
            onCreate: permission && permission.write ? (e) => this.showModal(e) : null,
        });
    }
}

const mapStateToProps = state => ({ system: state.system, dmNghiemThuXepLoaiKhcn: state.danhMuc.dmNghiemThuXepLoaiKhcn });
const mapActionsToProps = { getDmNghiemThuXepLoaiKhcnAll, deleteDmNghiemThuXepLoaiKhcn, createDmNghiemThuXepLoaiKhcn, updateDmNghiemThuXepLoaiKhcn };
export default connect(mapStateToProps, mapActionsToProps)(DmNghiemThuXepLoaiKhcnPage);
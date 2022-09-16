import React from 'react';
import { connect } from 'react-redux';
import { createDmLoaiDoanhNghiep, getDmLoaiDoanhNghiepAll, updateDmLoaiDoanhNghiep, deleteDmLoaiDoanhNghiep } from './redux';
import { Link } from 'react-router-dom';
import { AdminPage, TableCell, renderTable, AdminModal, FormTextBox, FormCheckbox } from 'view/component/AdminPage';

export class LoaiDoanhNghiepEditModal extends AdminModal {
    componentDidMount() {
        $(document).ready(() => this.onShown(() => {
            this.ten.focus();
        }));
    }

    onShow = (item) => {
        const { id, ten, kichHoat } = item ? item : { id: '', ten: '', kichHoat: 1 };
        this.setState({ id, item });

        this.ten.value(ten);
        this.kichHoat.value(kichHoat);
    }

    changeKichHoat = value => this.kichHoat.value(value ? 1 : 0) || this.kichHoat.value(value);

    onSubmit = (e) => {
        e.preventDefault();
        const changes = {
            ten: this.ten.value(),
            kichHoat: this.kichHoat.value() ? 1 : 0,
        };

        if (!changes.ten) {
            T.notify('Tên không được trống!', 'danger');
            this.ten.focus();
        } else {
            this.state.id ? this.props.update(this.state.id, changes, this.hide) : this.props.create(changes, this.hide);
        }
    }

    render = () => {
        const readOnly = this.props.readOnly;
        return this.renderModal({
            title: this.state.id ? 'Cập nhật loại doanh nghiệp' : 'Tạo mới loại doanh nghiệp',
            body: <div className='row'>
                <FormTextBox type='text' className='col-12' ref={e => this.ten = e} label='Tên' readOnly={readOnly} placeholder='Tên' required />
                <FormCheckbox className='col-md-6' ref={e => this.kichHoat = e} label='Kích hoạt' isSwitch={true} readOnly={readOnly} style={{ display: 'inline-flex', margin: 0 }}
                    onChange={value => this.changeKichHoat(value ? 1 : 0)} />
            </div>
        }

        );
    }
}

class DmLoaiDoanhNghiepPage extends AdminPage {

    componentDidMount() {
        T.ready('/user/category', () => this.props.getDmLoaiDoanhNghiepAll());
    }

    showModal = (e) => {
        e.preventDefault();
        this.modal.show();
    }

    delete = (e, item) => {
        T.confirm('Xóa Loại doanh nghiệp', `Bạn có chắc bạn muốn xóa Loại doanh nghiệp ${item.ten ? `<b>${item.ten}</b>` : 'này'}?`, 'warning', true, isConfirm => {
            isConfirm && this.props.deleteDmLoaiDoanhNghiep(item.id, error => {
                if (error) T.notify(error.message ? error.message : `Xoá Loại doanh nghiệp ${item.ten} bị lỗi!`, 'danger');
                else T.alert(`Xoá Loại doanh nghiệp ${item.ten} thành công!`, 'success', false, 800);
            });
        });
        e.preventDefault();
    }

    render() {
        const currentPermissions = this.props.system && this.props.system.user && this.props.system.user.permissions ? this.props.system.user.permissions : [],
            permission = this.getUserPermission('dmLoaiDoanhNghiep', ['write', 'delete']);

        let items = this.props.dmLoaiDoanhNghiep && this.props.dmLoaiDoanhNghiep.items ? this.props.dmLoaiDoanhNghiep.items : [];

        const table = !(items && items.length > 0) ? 'Không có dữ liệu Loại doanh nghiệp' :
            renderTable({
                getDataSource: () => items, stickyHead: false,
                renderHead: () => (
                    <tr>
                        <th style={{ width: 'auto' }}>Mã</th>
                        <th style={{ width: '100%' }}>Tên doanh nghiệp</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Kích hoạt</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Thao tác</th>
                    </tr>),
                renderRow: (item, index) => (
                    <tr key={index}>
                        <TableCell type='link' content={item.id} style={{ textAlign: 'right' }} onClick={() => this.modal.show(item)} />
                        <TableCell type='text' content={item.ten} />
                        <TableCell type='checkbox' content={item.kichHoat} permission={permission}
                            onChanged={value => this.props.updateDmLoaiDoanhNghiep(item.id, { kichHoat: value ? 1 : 0, })} />
                        <TableCell type='buttons' content={item} permission={permission}
                            onEdit={() => this.modal.show(item)} onDelete={this.delete} />
                    </tr>
                ),
            });


        return this.renderPage({
            icon: 'fa fa-list-alt',
            title: 'Loại doanh nghiệp',
            breadcrumb: [
                <Link key={0} to='/user/category'>Danh mục</Link>,
                'Loại doanh nghiệp'
            ],
            content: <>
                <div className='tile'>{table}</div>
                <LoaiDoanhNghiepEditModal ref={e => this.modal = e} permission={permission}
                    create={this.props.createDmLoaiDoanhNghiep} update={this.props.updateDmLoaiDoanhNghiep} permissions={currentPermissions} />
            </>,
            backRoute: '/user/category',
            onCreate: permission && permission.write ? (e) => this.showModal(e) : null
        });
    }
}

const mapStateToProps = state => ({ system: state.system, dmLoaiDoanhNghiep: state.danhMuc.dmLoaiDoanhNghiep });
const mapActionsToProps = { getDmLoaiDoanhNghiepAll, createDmLoaiDoanhNghiep, updateDmLoaiDoanhNghiep, deleteDmLoaiDoanhNghiep };
export default connect(mapStateToProps, mapActionsToProps)(DmLoaiDoanhNghiepPage);
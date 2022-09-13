import React from 'react';
import { connect } from 'react-redux';
import { createDmLoaiDonVi, getDmLoaiDonViAll, updateDmLoaiDonVi, deleteDmLoaiDonVi } from './redux';
import { Link } from 'react-router-dom';
import { AdminPage, TableCell, renderTable, AdminModal, FormTextBox, FormCheckbox } from 'view/component/AdminPage';

class EditModal extends AdminModal {
    componentDidMount() {
        $(document).ready(() => this.onShown(() => {
            !this.ma.value() ? this.ma.focus() : this.ten.focus();
        }));
    }

    onShow = (item) => {
        const { ma, ten, kichHoat } = item ? item : { ma: '', ten: '', kichHoat: 0 };
        this.setState({ ma, item });

        this.ma.value(ma);
        this.ten.value(ten);
        this.kichHoat.value(kichHoat);
    }

    changeKichHoat = value => this.kichHoat.value(value ? 1 : 0) || this.kichHoat.value(value);

    onSubmit = (e) => {
        e.preventDefault();
        const changes = {
            ma: this.ma.value(),
            ten: this.ten.value(),
            kichHoat: this.kichHoat.value() ? 1 : 0,
        };

        if (!this.state.ma && !this.ma.value()) {
            T.notify('Mã không được trống!', 'danger');
            this.ma.focus();
        } else if (!changes.ten) {
            T.notify('Tên không được trống!', 'danger');
            this.ten.focus();
        } else {
            this.state.ma ? this.props.update(this.state.ma, changes, this.hide) : this.props.create(changes, this.hide);
        }
    }

    render = () => {
        const readOnly = this.props.readOnly;
        return this.renderModal({
            title: this.state.ma ? 'Cập nhật loại đơn vị' : 'Tạo mới loại đơn vị',
            body: <div className='row'>
                <FormTextBox type='text' className='col-12' ref={e => this.ma = e} label='Mã' readOnly={this.state.ma ? true : readOnly} placeholder='Mã' required />
                <FormTextBox type='text' className='col-12' ref={e => this.ten = e} label='Tên' readOnly={readOnly} placeholder='Tên' required />
                <FormCheckbox className='col-md-6' ref={e => this.kichHoat = e} label='Kích hoạt' isSwitch={true} readOnly={readOnly} style={{ display: 'inline-flex', margin: 0 }}
                    onChange={value => this.changeKichHoat(value ? 1 : 0)} />
            </div>
        }

        );
    }
}

class DmLoaiDonViPage extends AdminPage {

    componentDidMount() {
        T.ready('/user/category', () => this.props.getDmLoaiDonViAll());
    }

    showModal = (e) => {
        e.preventDefault();
        this.modal.show();
    }

    delete = (e, item) => {
        T.confirm('Xóa Loại đơn vị', `Bạn có chắc bạn muốn xóa Loại đơn vị ${item.ten ? `<b>${item.ten}</b>` : 'này'}?`, 'warning', true, isConfirm => {
            isConfirm && this.props.deleteDmLoaiDonVi(item.ma, error => {
                if (error) T.notify(error.message ? error.message : `Xoá Loại đơn vị ${item.ten} bị lỗi!`, 'danger');
                else T.alert(`Xoá Loại đơn vị ${item.ten} thành công!`, 'success', false, 800);
            });
        });
        e.preventDefault();
    }

    render() {
        const currentPermissions = this.props.system && this.props.system.user && this.props.system.user.permissions ? this.props.system.user.permissions : [],
            permission = this.getUserPermission('dmLoaiDonVi', ['write', 'delete']);

        let items = this.props.dmLoaiDonVi && this.props.dmLoaiDonVi.items ? this.props.dmLoaiDonVi.items : [];

        const table = !(items && items.length > 0) ? 'Không có dữ liệu Loại đơn vị' :
            renderTable({
                getDataSource: () => items, stickyHead: false,
                renderHead: () => (
                    <tr>
                        <th style={{ width: 'auto' }}>Mã</th>
                        <th style={{ width: '100%' }}>Tên đơn vị</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Kích hoạt</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Thao tác</th>
                    </tr>),
                renderRow: (item, index) => (
                    <tr key={index}>
                        <TableCell type='link' content={item.ma} style={{ textAlign: 'right' }} onClick={() => this.modal.show(item)} />
                        <TableCell type='text' content={item.ten} />
                        <TableCell type='checkbox' content={item.kichHoat} permission={permission}
                            onChanged={value => this.props.updateDmLoaiDonVi(item.ma, { kichHoat: value ? 1 : 0, })} />
                        <TableCell type='buttons' content={item} permission={permission}
                            onEdit={() => this.modal.show(item)} onDelete={this.delete} />
                    </tr>
                ),
            });


        return this.renderPage({
            icon: 'fa fa-list-alt',
            title: 'Loại đơn vị',
            breadcrumb: [
                <Link key={0} to='/user/category'>Danh mục</Link>,
                'Loại đơn vị'
            ],
            content: <>
                <div className='tile'>{table}</div>
                <EditModal ref={e => this.modal = e} permission={permission}
                    create={this.props.createDmLoaiDonVi} update={this.props.updateDmLoaiDonVi} permissions={currentPermissions} />
            </>,
            backRoute: '/user/category',
            onCreate: permission && permission.write ? (e) => this.showModal(e) : null
        });
    }
}

const mapStateToProps = state => ({ system: state.system, dmLoaiDonVi: state.danhMuc.dmLoaiDonVi });
const mapActionsToProps = { getDmLoaiDonViAll, createDmLoaiDonVi, updateDmLoaiDonVi, deleteDmLoaiDonVi };
export default connect(mapStateToProps, mapActionsToProps)(DmLoaiDonViPage);
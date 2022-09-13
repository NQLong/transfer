import React from 'react';
import { connect } from 'react-redux';
import { createDmDoiTuongCanBo, getDmDoiTuongCanBoAll, updateDmDoiTuongCanBo, deleteDmDoiTuongCanBo } from './redux';
import { Link } from 'react-router-dom';
import { AdminPage, TableCell, renderTable, AdminModal, FormTextBox, FormRichTextBox, FormCheckbox } from 'view/component/AdminPage';

class EditModal extends AdminModal {

    componentDidMount() {
        $(document).ready(() => this.onShown(() => {
            !this.ma.value() ? this.ma.focus() : this.ten.focus();
        }));
    }

    onShow = (item) => {
        let { ma, ten, kichHoat, ghiChu } = item ? item : { ma: '', ten: '', kichHoat: 1, ghiChu: '' };

        this.setState({ ma, kichHoat });

        this.ma.value(ma);
        this.ten.value(ten);
        this.kichHoat.value(kichHoat ? 1 : 0);
        this.ghiChu.value(ghiChu ? ghiChu : '');
    }

    onSubmit = (e) => {
        e.preventDefault();
        const changes = {
            ma: this.ma.value(),
            ten: this.ten.value(),
            ghiChu: this.ghiChu.value(),
            kichHoat: this.kichHoat.value() ? 1 : 0
        };

        if (!this.state.ma && !this.ma.value()) {
            T.notify('Mã không được trống!', 'danger');
            this.ma.focus();
        }
        else if (!changes.ten) {
            T.notify('Tên không được trống', 'danger');
            this.ten.focus();
        }
        else {
            this.state.ma ? this.props.update(this.state.ma, changes, this.hide) :
                this.props.create(changes, this.hide);
        }
    }

    changeKichHoat = value => this.kichHoat.value(value ? 1 : 0) || this.kichHoat.value(value);

    render = () => {
        const readOnly = this.props.readOnly;
        return this.renderModal({
            title: this.state.ma ? 'Cập nhật đối tượng cán bộ' : 'Tạo mới đối tượng cán bộ',
            size: 'large',
            body: <div className='row'>
                <FormTextBox type='text' className='col-md-12' ref={e => this.ma = e} label='Mã' readOnly={this.state.ma ? true : readOnly} placeholder='Mã' required />
                <FormTextBox type='text' className='col-md-12' ref={e => this.ten = e} label='Tên' readOnly={readOnly} placeholder='Tên' required />
                <FormRichTextBox className='col-md-12' ref={e => this.ghiChu = e} style={{ minHeight: 40 }} label='Ghi chú' placeholder='Ghi chú' readOnly={readOnly} />
                <FormCheckbox className='col-md-6' ref={e => this.kichHoat = e} label='Kích hoạt' isSwitch={true} readOnly={readOnly} style={{ display: 'inline-flex', margin: 0 }}
                    onChange={value => this.changeKichHoat(value ? 1 : 0)} />
            </div>
        });
    }
}

class dmDoiTuongCanBoAdminPage extends AdminPage {

    componentDidMount() {
        T.ready('/user/category', () => this.props.getDmDoiTuongCanBoAll());
    }

    showModal = (e) => {
        e.preventDefault();
        this.modal.show();
    }

    delete = (e, item) => {
        T.confirm('Xóa thông tin đối tượng cán bộ', `Bạn có chắc bạn muốn xóa đôi tượng cán bộ ${item.ten ? `<b>${item.ten}</b>` : 'này'}?`, 'warning', true, isConfirm => {
            isConfirm && this.props.deleteDmDoiTuongCanBo(item.ma, error => {
                if (error) T.notify(error.message ? error.message : `Xoá đối tượng cán bộ ${item.ten} bị lỗi!`, 'danger');
                else T.alert(`Xoá đối tượng cán bộ ${item.ma} thành công!`, 'success', false, 800);
            });
        });
        e.preventDefault();
    }

    render() {
        const currentPermissions = this.props.system && this.props.system.user && this.props.system.user.permissions ? this.props.system.user.permissions : [],
            permission = this.getUserPermission('dmDoiTuongCanBo', ['read', 'write', 'delete']);
        let table = 'Không có danh sách đối tượng cán bộ!',
            items = this.props.dmDoiTuongCanBo && this.props.dmDoiTuongCanBo.items ? this.props.dmDoiTuongCanBo.items : [];
        if (items && items.length > 0) {
            table = renderTable({
                getDataSource: () => items, stickyHead: false,
                renderHead: () => (
                    <tr>
                        <th style={{ width: 'auto' }}>Mã</th>
                        <th style={{ width: '30%' }}>Tên</th>
                        <th style={{ width: '70%' }}>Ghi chú</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Kích hoạt</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Thao tác</th>
                    </tr>
                ),
                renderRow: (item, index) => (
                    <tr key={index}>
                        <TableCell type="text" content={item.ma ? item.ma : ''} style={{ textAlign: 'right' }} />
                        <TableCell type='link' content={item.ten} onClick={() => this.modal.show(item)} />
                        <TableCell type='text' content={item.ghiChu} />
                        <TableCell type='checkbox' content={item.kichHoat} permission={permission}
                            onChanged={value => this.props.updateDmDoiTuongCanBo(item.ma, { kichHoat: value ? 1 : 0, })} />
                        <TableCell type='buttons' content={item} permission={permission}
                            onEdit={() => this.modal.show(item)} onDelete={this.delete}></TableCell>
                    </tr>
                )
            });
        }

        return this.renderPage({
            icon: 'fa fa-list-alt',
            title: 'Đối tượng cán bộ',
            breadcrumb: [
                <Link key={0} to='/user/category'>Danh mục</Link>,
                'Đối tượng cán bộ'
            ],
            content: <>
                <div className='tile'>{table}</div>
                <EditModal ref={e => this.modal = e} permission={permission}
                    create={this.props.createDmDoiTuongCanBo} update={this.props.updateDmDoiTuongCanBo} permissions={currentPermissions} />
            </>,
            backRoute: '/user/category',
            onCreate: permission && permission.write ? (e) => this.showModal(e) : null
        });
    }
}

const mapStateToProps = state => ({ system: state.system, dmDoiTuongCanBo: state.danhMuc.dmDoiTuongCanBo });
const mapActionsToProps = { getDmDoiTuongCanBoAll, createDmDoiTuongCanBo, updateDmDoiTuongCanBo, deleteDmDoiTuongCanBo };
export default connect(mapStateToProps, mapActionsToProps)(dmDoiTuongCanBoAdminPage);

import React from 'react';
import { connect } from 'react-redux';
import { getDmTangBhxhAll, deleteDmTangBhxh, createDmTangBhxh, updateDmTangBhxh } from './reduxTangBhxh';
import { Link } from 'react-router-dom';
import { AdminPage, TableCell, renderTable, AdminModal, FormTextBox, FormCheckbox } from 'view/component/AdminPage';

class EditModal extends AdminModal {
    onShow = (item) => {
        let { ma, moTa, kichHoat } = item ? item : { ma: '', moTa: '', kichHoat: true };

        this.setState({ ma, moTa });
        this.ma.value(ma);
        this.moTa.value(moTa ? moTa : '');
        this.kichHoat.value(kichHoat ? 1 : 0);
    };

    onSubmit = () => {
        const changes = {
            ma: this.ma.value(),
            moTa: this.moTa.value(),
            kichHoat: this.kichHoat.value() ? 1 : 0,
        };
        if (changes.ma == '') {
            T.notify('Mã không được trống', 'danger');
            this.ma.focus();
        } else if (changes.moTa == '') {
            T.notify('Mô tả không được trống', 'danger');
            this.msoTa.focus();
        }
        else {
            this.state.ma ? this.props.update(this.state.ma, changes, this.hide) :
                this.props.create(changes, this.hide);
        }
    };

    changeKichHoat = value => this.kichHoat.value(value ? 1 : 0) || this.kichHoat.value(value);

    render = () => {
        const readOnly = this.props.readOnly;
        return this.renderModal({
            title: this.state.ma ? 'Cập nhật tăng BHXH' : 'Tạo mới tăng BHXH',
            body: <div className='row'>
                <FormTextBox type='text' className='col-md-12' ref={e => this.ma = e} label='Mã' readOnly={this.state.ma ? true : readOnly} placeholder='Mã' required />
                <FormTextBox type='text' className='col-md-12' ref={e => this.moTa = e} label='Mô tả' placeholder='Mô tả' readOnly={readOnly} required />
                <FormCheckbox className='col-md-6' ref={e => this.kichHoat = e} label='Kích hoạt' isSwitch={true} readOnly={readOnly} style={{ display: 'inline-flex', margin: 0 }}
                    onChange={value => this.changeKichHoat(value ? 1 : 0)} />
            </div>
        });
    }
}

class DmTangBhxhPage extends AdminPage {

    componentDidMount() {
        T.ready('/user/category', () => this.props.getDmTangBhxhAll());
    }

    showModal = (e) => {
        e.preventDefault();
        this.modal.show();
    }

    delete = (e, item) => {
        T.confirm('Xóa thông tin tăng bảo hiểm xã hội', `Bạn có chắc bạn muốn xóa mã ${item.ma ? `<b>${item.ma} : ${item.moTa}</b>` : 'này'}?`, 'warning', true, isConfirm => {
            isConfirm && this.props.deleteDmGiamBhxh(item.ma, error => {
                if (error) T.notify(error.message ? error.message : `Xoá Mã ${item.ma} bị lỗi!`, 'danger');
                else T.alert(`Xoá mã ${item.ma} thành công!`, 'success', false, 800);
            });
        });
        e.preventDefault();
    }
    render() {
        const currentPermissions = this.props.system && this.props.system.user && this.props.system.user.permissions ? this.props.system.user.permissions : [],
            permission = this.getUserPermission('dmTangBhxh', ['read', 'write', 'delete']);
        let items = this.props.dmTangBhxh && this.props.dmTangBhxh.items ? this.props.dmTangBhxh.items : [];
        let table = 'Danh mục chức vụ trống!';
        if (items && items.length > 0) {
            table = renderTable({
                getDataSource: () => items, stickyHead: false,
                renderHead: () => (
                    <tr>
                        <th style={{ width: 'auto' }}>Mã</th>
                        <th style={{ width: '100%' }}>Mô tả</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Kích hoạt</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Thao tác</th>
                    </tr>),
                renderRow: (item, index) => (
                    <tr key={index}>
                        <TableCell type='link' content={item.ma ? item.ma : ''} onClick={() => this.modal.show(item)} />
                        <TableCell type='text' content={item.moTa ? item.moTa : ''} />
                        <TableCell type='checkbox' content={item.kichHoat} permission={permission}
                            onChanged={value => this.props.updateDmTangBhxh(item.ma, { kichHoat: value ? 1 : 0, })} />
                        <TableCell type='buttons' content={item} permission={permission}
                            onEdit={() => this.modal.show(item)} onDelete={this.delete}></TableCell>
                    </tr>
                ),
            });
        }

        return this.renderPage({
            icon: 'fa fa-list-alt',
            title: 'Tăng bảo hiểm xã hội',
            breadcrumb: [
                <Link key={0} to='/user/category'>Danh mục</Link>,
                'Tăng bảo hiểm xã hội'
            ],
            content: <>
                <div className='tile'>{table}</div>
                <EditModal ref={e => this.modal = e} permission={permission}
                    create={this.props.createDmTangBhxh} update={this.props.updateDmTangBhxh} permissions={currentPermissions} />
            </>,
            backRoute: '/user/category',
            onCreate: permission && permission.write ? (e) => this.showModal(e) : null
        });
    }
}

const mapStateToProps = state => ({ system: state.system, dmTangBhxh: state.danhMuc.dmTangBhxh });
const mapActionsToProps = { getDmTangBhxhAll, deleteDmTangBhxh, createDmTangBhxh, updateDmTangBhxh };
export default connect(mapStateToProps, mapActionsToProps)(DmTangBhxhPage);
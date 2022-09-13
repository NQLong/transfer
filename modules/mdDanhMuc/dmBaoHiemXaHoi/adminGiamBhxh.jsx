import React from 'react';
import { connect } from 'react-redux';
import { getDmGiamBhxhAll, deleteDmGiamBhxh, createDmGiamBhxh, updateDmGiamBhxh } from './reduxGiamBhxh';
import { Link } from 'react-router-dom';
import { AdminPage, TableCell, renderTable, AdminModal, FormTextBox, FormCheckbox } from 'view/component/AdminPage';

class EditModal extends AdminModal {

    componentDidMount() {
        $(document).ready(() => this.onShown(() => {
            !this.ma.value() ? this.ma.focus() : this.moTa.focus();
        }));
    }

    onShow = (item) => {
        let { ma, moTa, kichHoat } = item ? item : { ma: '', moTa: '', kichHoat: true };

        this.setState({ ma, moTa });
        this.ma.value(ma);
        this.moTa.value(moTa ? moTa : '');
        this.kichHoat.value(kichHoat ? 1 : 0);
    };

    onSubmit = (e) => {
        e.preventDefault();
        const changes = {
            ma: this.ma.value(),
            moTa: this.moTa.value(),
            kichHoat: this.kichHoat.value() ? 1 : 0,
        };

        if (!this.state.ma && !this.ma.value()) {
            T.notify('Mã không được trống!', 'danger');
            this.ma.focus();
        }
        else if (!changes.moTa) {
            T.notify('Mô tả không được trống', 'danger');
            this.ma.focus();
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
            title: this.state.ma ? 'Cập nhật giảm BHXH' : 'Tạo mới giảm BHXH',
            body: <div className='row'>
                <FormTextBox type='text' className='col-md-12' ref={e => this.ma = e} label='Mã' readOnly={this.state.ma ? true : readOnly} placeholder='Mã' required />
                <FormTextBox type='text' className='col-md-12' ref={e => this.moTa = e} label='Mô tả' placeholder='Mô tả' readOnly={readOnly} required />
                <FormCheckbox className='col-md-6' ref={e => this.kichHoat = e} label='Kích hoạt' isSwitch={true} readOnly={readOnly}
                    onChange={value => this.changeKichHoat(value ? 1 : 0)} />
            </div>
        });
    }
}

class DmGiamBhxhPage extends AdminPage {

    componentDidMount() {
        T.ready('/user/category', () => this.props.getDmGiamBhxhAll());
    }

    showModal = (e) => {
        e.preventDefault();
        this.modal.show();
    }

    delete = (e, item) => {
        T.confirm('Xóa thông tin giảm bảo hiểm xã hội', `Bạn có chắc bạn muốn xóa mã ${item.ma ? `<b>${item.ma} : ${item.moTa}</b>` : 'này'}?`, 'warning', true, isConfirm => {
            isConfirm && this.props.deleteDmGiamBhxh(item.ma, error => {
                if (error) T.notify(error.message ? error.message : `Xoá Mã ${item.ma} bị lỗi!`, 'danger');
                else T.alert(`Xoá mã ${item.ma} thành công!`, 'success', false, 800);
            });
        });
        e.preventDefault();
    }

    render() {
        const currentPermissions = this.props.system && this.props.system.user && this.props.system.user.permissions ? this.props.system.user.permissions : [],
            permission = this.getUserPermission('dmGiamBhxh', ['read', 'write', 'delete']);
        const items = this.props.dmGiamBhxh && this.props.dmGiamBhxh.items ?
            this.props.dmGiamBhxh.items : null;
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
                            onChanged={value => this.props.updateDmGiamBhxh(item.ma, { kichHoat: value ? 1 : 0, })} />
                        <TableCell type='buttons' content={item} permission={permission}
                            onEdit={() => this.modal.show(item)} onDelete={this.delete}></TableCell>
                    </tr>
                ),
            });
        }
        return this.renderPage({
            icon: 'fa fa-list-alt',
            title: 'Danh mục Giảm bảo hiểm xã hội',
            breadcrumb: [
                <Link key={0} to='/user/category'>Danh mục</Link>,
                'Giảm bảo hiểm xã hội'
            ],
            content: <>
                <div className='tile'>{table}</div>
                <EditModal ref={e => this.modal = e} permission={permission}
                    create={this.props.createDmGiamBhxh} update={this.props.updateDmGiamBhxh} permissions={currentPermissions} />
            </>,
            backRoute: '/user/category',
            onCreate: permission && permission.write ? (e) => this.showModal(e) : null
        });
    }
}

const mapStateToProps = state => ({ system: state.system, dmGiamBhxh: state.danhMuc.dmGiamBhxh });
const mapActionsToProps = { getDmGiamBhxhAll, deleteDmGiamBhxh, createDmGiamBhxh, updateDmGiamBhxh };
export default connect(mapStateToProps, mapActionsToProps)(DmGiamBhxhPage);
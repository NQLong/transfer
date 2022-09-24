import React from 'react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import { getDmChucDanhChuyenMonAll, createDmChucDanhChuyenMon, updateDmChucDanhChuyenMon, deleteDmChucDanhChuyenMon } from './redux';
import { AdminModal, AdminPage, FormCheckbox, FormTextBox, renderTable, TableCell } from 'view/component/AdminPage';

class EditModal extends AdminModal {
    state = { kichHoat: true };

    componentDidMount() {
        $(document).ready(() => this.onShown(() => {
            !this.ma.value() ? this.ma.focus() : this.ten.focus();
        }));
    }

    onShow = (item) => {
        let { ma, ten, kichHoat } = item ? item : { ma: '', ten: '', kichHoat: 1 };
        this.setState({ ma, item });
        this.ma.value(ma);
        this.ten.value(ten);
        this.kichHoat.value(kichHoat ? 1 : 0);
    };

    changeKichHoat = value => this.kichHoat.value(value ? 1 : 0) || this.kichHoat.value(value);

    onSubmit = (e) => {
        e.preventDefault();
        const
            changes = {
                ma: this.ma.value(),
                ten: this.ten.value(),
                kichHoat: this.kichHoat.value() ? 1 : 0,
            };
        if (!this.state.ma && changes.ma == '') {
            T.notify('Mã Chức danh không được trống!', 'danger');
            this.ma.focus();
        } else if (changes.ten == '') {
            T.notify('Tên Chức danh bị trống', 'danger');
            this.ten.focus();
        } else {
            this.state.ma ? this.props.update(this.state.ma, changes, this.hide) : this.props.create(changes, this.hide);
        }
    }

    render = () => {
        const readOnly = this.props.readOnly;
        return this.renderModal({
            title: this.state.ma ? 'Cập nhật chức danh chuyên môn' : 'Tạo mới chức danh chuyên môn',
            body: <div className='row'>
                <FormTextBox className='col-md-12' ref={e => this.ma = e} label='Mã' readOnly={this.state.ma ? true : readOnly} required />
                <FormTextBox type='text' className='col-md-12' ref={e => this.ten = e} label='Tên' readOnly={readOnly} required />
                <FormCheckbox className='col-md-6' ref={e => this.kichHoat = e} label='Kích hoạt' isSwitch={true} readOnly={readOnly} onChange={value => this.changeKichHoat(value ? 1 : 0)} />
            </div>
        });
    }
}

class DmChucDanhChuyenMon extends AdminPage {
    componentDidMount() {
        T.ready('/user/category', () => {
            T.onSearch = (searchText) => this.props.getDmChucDanhChuyenMonAll(undefined, undefined, searchText || '');
            T.showSearchBox();
            this.props.getDmChucDanhChuyenMonAll();
        });
    }

    showModal = (e) => {
        e.preventDefault();
        this.modal.show();
    }

    changeActive = item => {
        this.props.updateDmChucDanhChuyenMon(item.ma, { kichHoat: item.kichHoat == 1 ? 0 : 1 });
    }

    delete = (e, item) => {
        e.preventDefault();
        T.confirm('Xóa danh mục chức danh chuyên môn', 'Bạn có chắc bạn muốn xóa chức danh chuyên môn này?', true, isConfirm =>
            isConfirm && this.props.deleteDmChucDanhChuyenMon(item.ma));
    }

    render() {
        const currentPermissions = this.props.system && this.props.system.user && this.props.system.user.permissions ? this.props.system.user.permissions : [],
            permission = this.getUserPermission('dmChucDanhChuyenMon', ['read', 'write', 'delete']);
        let items = this.props.dmChucDanhChuyenMon && this.props.dmChucDanhChuyenMon.items ? this.props.dmChucDanhChuyenMon.items : [];
        const table = renderTable({
            getDataSource: () => items, stickyHead: false,
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                    <th style={{ width: '100%' }}>Tên chức danh</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Kích hoạt</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Thao tác</th>
                </tr>),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell type='number' content={index + 1} />
                    <TableCell type='text' content={item.ten} />
                    <TableCell type='checkbox' content={item.kichHoat} permission={permission}
                        onChanged={() => this.changeActive(item)} />
                    <TableCell type='buttons' content={item} permission={permission}
                        onEdit={() => this.modal.show(item)} onDelete={e => this.delete(e, item)}></TableCell>
                </tr>)
        });

        return this.renderPage({
            icon: 'fa fa-list-alt',
            title: 'Danh mục chức danh chuyên môn',
            breadcrumb: [
                <Link key={0} to='/user/category'>Danh mục</Link>,
                'Danh mục chức danh chuyên môn'
            ],
            content: <>
                <div className='tile'>{table}</div>
                <EditModal ref={e => this.modal = e} permission={permission}
                    create={this.props.createDmChucDanhChuyenMon} update={this.props.updateDmChucDanhChuyenMon} permissions={currentPermissions} />
            </>,
            backRoute: '/user/category',
            onCreate: permission && permission.write ? (e) => this.showModal(e) : null,
        });
    }

}

const mapStateToProps = state => ({ system: state.system, dmChucDanhChuyenMon: state.danhMuc.dmChucDanhChuyenMon });
const mapActionsToProps = {
    getDmChucDanhChuyenMonAll, createDmChucDanhChuyenMon, updateDmChucDanhChuyenMon, deleteDmChucDanhChuyenMon
};
export default connect(mapStateToProps, mapActionsToProps)(DmChucDanhChuyenMon);
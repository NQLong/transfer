import React from 'react';
import { connect } from 'react-redux';
import { getDMTinhThanhPhoPage, createDMTinhThanhPho, updateDMTinhThanhPho, deleteDMTinhThanhPho } from './reduxTinhThanhPho';
import { Link } from 'react-router-dom';
import Pagination from 'view/component/Pagination';
import { AdminPage, AdminModal, TableCell, renderTable, FormTextBox, FormCheckbox } from 'view/component/AdminPage';

export class EditModal extends AdminModal {
    state = { active: true };

    componentDidMount() {
        $(document).ready(() => this.onShown(() => {
            !this.ma.value() ? this.ma.focus() : this.ten.focus();
        }));
    }

    onShow = (item) => {
        let { ma, ten, kichHoat } = item ? item : { ma: null, ten: null, kichHoat: 1 };
        this.ma.value(ma);
        this.ten.value(ten);
        this.setState({ active: kichHoat == 1 });
    };

    changeKichHoat = value => this.kichHoat.value(value ? 1 : 0) || this.kichHoat.value(value);

    onSubmit = (e) => {
        e.preventDefault();
        const
            changes = {
                ma: this.ma.value().trim(),
                ten: this.ten.value().trim(),
                kichHoat: this.state.active ? 1 : 0
            };

        if (changes.ma.length != 2) {
            T.notify('Mã tỉnh không hợp lệ!', 'danger');
            this.ma.focus();
        } else {
            this.state.ma ? this.props.update(this.state.ma, changes, this.hide) : this.props.create(changes, this.hide);
        }
    };

    render = () => {
        const readOnly = this.props.readOnly;
        return this.renderModal({
            title: this.state.ma ? 'Cập nhật tỉnh/thành phố' : 'Tạo mới tỉnh/thành phố',
            body: <div className='row'>
                <FormTextBox className='col-md-12' ref={e => this.ma = e} label='Mã' placeholder='Mã tỉnh/thành phố' maxLength={3} readOnly={this.state.ma ? true : readOnly} required />
                <FormTextBox type='text' className='col-md-12' ref={e => this.ten = e} label='Tên tỉnh/thành phố' readOnly={readOnly} required />
                <FormCheckbox className='col-md-6' ref={e => this.kichHoat = e} label='Kích hoạt' isSwitch={true} readOnly={readOnly} onChange={value => this.changeKichHoat(value ? 1 : 0)} />
            </div>
        });
    }
}

class DMTinhThanhPhoPage extends AdminPage {
    state = { searching: false };

    componentDidMount() {
        T.ready('/user/category', () => {
            T.onSearch = (searchText) => this.props.getDmChucVuPage(undefined, undefined, searchText || '');
            T.showSearchBox();
            this.props.getDMTinhThanhPhoPage();
        });
    }

    edit = (e, item) => {
        e.preventDefault();
        this.modal.show(item);
    };

    delete = (e, item) => {
        e.preventDefault();
        T.confirm('Tỉnh/thành phố', `Bạn có chắc bạn muốn xóa tỉnh/thành phố ${item.ten ? `<b>${item.ten}</b>` : 'này'}?`, 'warning', true, isConfirm =>
            isConfirm && this.props.deleteDMTinhThanhPho(item.ma));
    };

    render() {
        const currentPermissions = this.props.system && this.props.system.user && this.props.system.user.permissions ? this.props.system.user.permissions : [],
            permission = this.getUserPermission('dmChucVu', ['read', 'write', 'delete']);
        let { pageNumber, pageSize, pageTotal, totalItem, pageCondition, list } = this.props.dmTinhThanhPho && this.props.dmTinhThanhPho.page ?
            this.props.dmTinhThanhPho.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, pageCondition: {}, list: [] };
        let table = 'Không có dữ liệu!';
        if (list && list.length > 0) {
            table = renderTable({
                getDataSource: () => list, stickyHead: false,
                renderHead: () => (
                    <tr>
                        <th style={{ width: 'auto' }}>Mã</th>
                        <th style={{ width: '100%' }}>Tên tỉnh/thành phố</th>
                        <th style={{ width: 'auto' }} nowrap='true'>Kích hoạt</th>
                        <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Thao tác</th>
                    </tr>),
                renderRow: (item, index) => (
                    <tr key={index}>
                        <TableCell type='text' content={item.ma} />
                        <TableCell type='link' content={item.ten ? item.ten : ''} onClick={() => this.modal.show(item)} />
                        <TableCell type='checkbox' content={item.kichHoat} permission={permission}
                            onChanged={value => this.props.updateDmChucVu(item.ma, { kichHoat: value ? 1 : 0, })} />
                        <TableCell type='buttons' content={item} permission={permission}
                            onEdit={() => this.modal.show(item)} onDelete={this.delete} />
                    </tr>)
            });
        }

        return this.renderPage({
            icon: 'fa fa-list-alt',
            title: 'Danh mục Tỉnh/Thành phố',
            breadcrumb: [
                <Link key={0} to='/user/category'>Danh mục</Link>,
                'Danh mục Tỉnh/ Thành Phố'
            ],
            content: <>
                <div className='tile'>{table}</div>
                <Pagination style={{ marginLeft: '65px' }} {...{ pageNumber, pageSize, pageTotal, totalItem, pageCondition }} getPage={this.props.getDMTinhThanhPhoPage} />
                <EditModal ref={e => this.modal = e} permission={permission}
                    create={this.props.createDMTinhThanhPho} update={this.props.updateDMTinhThanhPho} permissions={currentPermissions} />
            </>,
            backRoute: '/user/category',
            onCreate: permission && permission.write ? (e) => this.showModal(e) : null,
            onImport: permission && permission.write ? (e) => e.preventDefault() || this.props.history.push('/user/danh-muc/tinh-thanh-pho/upload') : null
        });
    }
}

const mapStateToProps = state => ({ system: state.system, dmTinhThanhPho: state.danhMuc.dmTinhThanhPho });
const mapActionsToProps = { getDMTinhThanhPhoPage, createDMTinhThanhPho, updateDMTinhThanhPho, deleteDMTinhThanhPho };
export default connect(mapStateToProps, mapActionsToProps)(DMTinhThanhPhoPage);

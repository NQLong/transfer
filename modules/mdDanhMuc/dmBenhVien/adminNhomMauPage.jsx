import React from 'react';
import { connect } from 'react-redux';
import { getDmNhomMauAll, createDmNhomMau, updateDmNhomMau, deleteDmNhomMau } from './reduxNhomMau';
import { Link } from 'react-router-dom';
import Pagination from 'view/component/Pagination';
import { AdminPage, AdminModal, renderTable, TableCell, FormTextBox, FormCheckbox } from 'view/component/AdminPage';

class EditModal extends AdminModal {
    state = { kichHoat: true, visible: true }

    componentDidMount() {
        $(document).ready(() => setTimeout(() => {
            !this.ma.value() ? this.ma.focus() : this.ten.focus();
        }));
    }

    onShow = (item) => {
        let { ma, ten, kichHoat } = item ? item : { ma: null, ten: '', kichHoat: true };
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
        if (changes.ma == '') {
            T.notify('Mã nhóm máu bị trống!', 'danger');
            this.ma.focus();
        } else if ($('#dmNhomMauTen').val() == '') {
            T.notify('Tên nhóm máu bị trống!', 'danger');
            this.ten.focus();
        } else if (changes.ma.length != 2) {
            this.setState({ visible: true });
        } else {
            this.state.ma ? this.props.update(this.state.ma, changes, this.hide) : this.props.create(changes, this.hide);
        }
    };

    render = () => {
        const readOnly = this.props.readOnly;
        return this.renderModal({
            title: this.state.ma ? 'Cập nhật nhóm máu' : 'Tạo mới nhóm máu',
            body: <div className='row'>
                <FormTextBox type='text' className='col-md-12' ref={e => this.ma = e} label='Mã Nhóm máu' readOnly={this.state.ma ? true : readOnly} required />
                <FormTextBox type='text' className='col-md-12' ref={e => this.ten = e} label='Tên Nhóm máu' readOnly={readOnly} required />
                <FormCheckbox className='col-md-6' ref={e => this.kichHoat = e} label='Kích hoạt' isSwitch={true} readOnly={readOnly} onChange={value => this.changeKichHoat(value ? 1 : 0)} />
            </div>
        });
    }
}

class dmNhomMauPage extends AdminPage {
    state = { searching: false };

    componentDidMount() {
        T.ready('/user/category', () => {
            T.onSearch = (searchText) => this.props.getDmNhomMauAll(undefined, undefined, searchText || '');
            T.showSearchBox();
            this.props.getDmNhomMauAll();
        });
    }

    showModal = (e) => {
        e.preventDefault();
        this.modal.show();
    };

    delete = (e, item) => {
        e.preventDefault();
        T.confirm('Nhóm máu', 'Bạn có chắc bạn muốn xóa nhóm máu này?', 'warning', true, isConfirm =>
            isConfirm && this.props.deleteDmNhomMau(item.ma));
    };

    changeActive = item => this.props.updateDmNhomMau(item.ma, { kichHoat: Number(!item.kichHoat) });

    render() {
        const currentPermissions = this.props.system && this.props.system.user && this.props.system.user.permissions ? this.props.system.user.permissions : [],
            permissionWrite = currentPermissions.includes('dmNhomMau:write'),
            permissionDelete = currentPermissions.includes('dmNhomMau:delete'),
            permission = this.getUserPermission('dmBenhVien', ['read', 'write', 'delete']);
        let { pageNumber, pageSize, pageTotal, totalItem, pageCondition } = this.props.dmBenhVien && this.props.dmBenhVien.page ?
            this.props.dmBenhVien.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, pageCondition: {} };
        let table = 'Không có dữ liệu!',
            items = this.props.dmNhomMau && this.props.dmNhomMau.items;
        if (items && items.length > 0) {
            table = renderTable({
                getDataSource: () => items, stickyHead: false,
                renderHead: () => (
                    <tr>
                        <th style={{ width: 'auto' }} nowrap='true'>Mã</th>
                        <th style={{ width: '100%' }} nowrap='true'>Tên</th>
                        <th style={{ width: 'auto' }} nowrap='true'>Kích hoạt</th>
                        <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Thao tác</th>
                    </tr>),
                renderRow: (item, index) => (
                    <tr key={index}>
                        <TableCell type='text' content={item.ma}/>
                        <TableCell type='link' content={T.language.parse(item.ten, true).vi} onClick={() => this.modal.show(item)} />
                        <TableCell type='checkbox' content={item.kichHoat} permission={permissionWrite} onChanged={() => permissionWrite && this.changeActive(item)} />
                        <TableCell type='buttons' content={item} permission={permissionDelete} onEdit={this.edit} onDelete={this.delete}></TableCell>
                    </tr>
                )
            });
        }

        return this.renderPage({
            icon: 'fa fa-list-alt',
            title: 'Danh mục Nhóm máu',
            breadcrumb: [
                <Link key={0} to='/user/category'>Danh mục</Link>,
                'Danh mục Nhóm máu'
            ],
            content: <>
                <div className='tile'>{table}</div>
                <Pagination style={{ marginLeft: '65px' }} {...{ pageNumber, pageSize, pageTotal, totalItem, pageCondition }} getPage={this.props.getDmNhomMauAll} />
                <EditModal ref={e => this.modal = e} permission={permission}
                    create={this.props.createDmBenhVien} update={this.props.updateDmNhomMau} permissions={currentPermissions} />
            </>,
            backRoute: '/user/category',
            onCreate: permission && permission.write ? (e) => this.showModal(e) : null,
            onImport: permission && permission.write ? (e) => e.preventDefault() || this.props.history.push('/user/danh-muc/benh-vien/upload') : null
        });
    }
}

const mapStateToProps = state => ({ system: state.system, dmNhomMau: state.dmNhomMau });
const mapActionsToProps = { getDmNhomMauAll, createDmNhomMau, updateDmNhomMau, deleteDmNhomMau };
export default connect(mapStateToProps, mapActionsToProps)(dmNhomMauPage);
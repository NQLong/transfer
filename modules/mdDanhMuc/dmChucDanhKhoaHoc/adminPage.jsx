import React from 'react';
import { connect } from 'react-redux';
import { getDmChucDanhKhoaHocAll, deleteDmChucDanhKhoaHoc, createDmChucDanhKhoaHoc, updateDmChucDanhKhoaHoc } from './redux';
import { Link } from 'react-router-dom';
import Pagination from 'view/component/Pagination';
import { AdminPage, AdminModal, TableCell, renderTable, FormTextBox, FormCheckbox } from 'view/component/AdminPage';

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
            title: this.state.ma ? 'Cập nhật chức danh khoa học' : 'Tạo mới chức danh khoa học',
            body: <div className='row'>
                <FormTextBox className='col-md-12' ref={e => this.ma = e} label='Mã' readOnly={this.state.ma ? true : readOnly} required />
                <FormTextBox type='text' className='col-md-12' ref={e => this.ten = e} label='Tên' readOnly={readOnly} required />
                <FormCheckbox className='col-md-6' ref={e => this.kichHoat = e} label='Kích hoạt' isSwitch={true} readOnly={readOnly} onChange={value => this.changeKichHoat(value ? 1 : 0)} />
            </div>
        });
    }
}

class DmChucDanhPage extends AdminPage {

    componentDidMount() {
        T.ready('/user/category', () => {
            T.onSearch = (searchText) => this.props.getDmChucDanhKhoaHocAll(undefined, undefined, searchText || '');
            T.showSearchBox();
            this.props.getDmChucDanhKhoaHocAll();
        });
    }

    showModal = (e) => {
        e.preventDefault();
        this.modal.show();
    }

    changeActive = item => this.props.updateDmChucDanhKhoaHoc(item.ma, { kichHoat: Number(!item.kichHoat) });

    delete = (e, item) => {
        e.preventDefault();
        T.confirm('Xóa chức danh', 'Bạn có chắc bạn muốn xóa chức danh này?', true, isConfirm =>
            isConfirm && this.props.deleteDmChucDanhKhoaHoc(item.ma));
    }

    render() {
        const currentPermissions = this.props.system && this.props.system.user && this.props.system.user.permissions ? this.props.system.user.permissions : [],
            permission = this.getUserPermission('dmChucVu', ['read', 'write', 'delete']);
        const { pageNumber, pageSize, pageTotal, totalItem, pageCondition, } = this.props.dmChucDanhKhoaHoc && this.props.dmChucDanhKhoaHoc.page ?
            this.props.dmChucDanhKhoaHoc.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, pageCondition: '' };
        let table = 'Không có danh sách!',
            items = this.props.dmChucDanhKhoaHoc && this.props.dmChucDanhKhoaHoc.items ? this.props.dmChucDanhKhoaHoc.items : [];
        if (items.length > 0) {
            table = renderTable({
                getDataSource: () => items, stickyHead: false,
                renderHead: () => (
                    <tr>
                        <th style={{ width: 'auto' }}>Mã</th>
                        <th style={{ width: '100%' }}>Tên</th>
                        <th style={{ width: 'auto' }} nowrap='true'>Kích hoạt</th>
                        <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Thao tác</th>
                    </tr>),
                renderRow: (item, index) => (
                    <tr key={index}>
                        <TableCell type='link' content={item.ma ? item.ma : ''} onClick={() => this.modal.show(item)} />
                        <TableCell type='text' content={item.ten ? item.ten : ''} />
                        <TableCell type='checkbox' content={item.kichHoat} permission={permission}
                            onChanged={value => this.props.updateDmChucDanhKhoaHoc(item.ma, { kichHoat: value ? 1 : 0, })} />
                        <TableCell type='buttons' content={item} permission={permission}
                            onEdit={() => this.modal.show(item)} onDelete={this.delete} />
                    </tr>)
            });
        }

        return this.renderPage({
            icon: 'fa fa-list-alt',
            title: 'Danh mục Chức danh khoa học',
            breadcrumb: [
                <Link key={0} to='/user/category'>Danh mục</Link>,
                'Danh mục Chức danh khoa học'
            ],
            content: <>
                <div className='tile'>{table}</div>
                <Pagination style={{ marginLeft: '65px' }} {...{ pageNumber, pageSize, pageTotal, totalItem, pageCondition }} getPage={this.props.getDmChucDanhKhoaHocAll} />
                <EditModal ref={e => this.modal = e} permission={permission}
                    create={this.props.createDmChucDanhKhoaHoc} update={this.props.updateDmChucDanhKhoaHoc} permissions={currentPermissions} />
            </>,
            backRoute: '/user/category',
            onCreate: permission && permission.write ? (e) => this.showModal(e) : null,
            onImport: permission && permission.write ? (e) => e.preventDefault() || this.props.history.push('/user/danh-muc/chuc-vu/upload') : null
        });
    }
}

const mapStateToProps = state => ({ system: state.system, dmChucDanhKhoaHoc: state.dmChucDanhKhoaHoc });
const mapActionsToProps = { getDmChucDanhKhoaHocAll, deleteDmChucDanhKhoaHoc, createDmChucDanhKhoaHoc, updateDmChucDanhKhoaHoc };
export default connect(mapStateToProps, mapActionsToProps)(DmChucDanhPage);
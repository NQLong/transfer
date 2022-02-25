import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { getDmBenhVienPage, createDmBenhVien, updateDmBenhVien, deleteDmBenhVien } from './reduxBenhVien';
import { getDmTuyenBenhVienAll } from './reduxTuyenBenhVien';
import Pagination from 'view/component/Pagination';
import { AdminPage, TableCell, renderTable, AdminModal, FormTextBox, FormCheckbox } from 'view/component/AdminPage';

class EditModal extends AdminModal {
    state = { kichHoat: true }

    componentDidMount() {
        $(document).ready(() => setTimeout(() => {
            !this.ma.value() ? this.ma.focus() : this.ten.focus();
        }));
    }

    onShow = (item) => {
        let { ma, ten, diaChi, maTuyen, kichHoat } = item ? item : { ma: null, ten: '', diaChi: '', maTuyen: null, kichHoat: true };
        this.setState({ ma, item });
        this.ma.value(ma);
        this.ten.value(ten);
        this.diaChi.value(diaChi);
        this.maTuyen.value(maTuyen);
        this.kichHoat.value(kichHoat ? 1 : 0);
    };

    changeKichHoat = value => this.kichHoat.value(value ? 1 : 0) || this.kichHoat.value(value);

    onSubmit = (e) => {
        e.preventDefault();
        const 
            changes = {
                ma: this.ma.value(),
                ten: this.ten.value(),
                diaChi: this.diaChi.value(),
                maTuyen: this.maTuyen.value(),
                kichHoat: this.kichHoat.value() ? 1 : 0,
            };
        if (changes.ma == '') {
            T.notify('Mã bệnh viện bị trống!', 'danger');
            this.ma.focus();
        } else if (changes.ten == '') {
            T.notify('Tên bệnh viện bị trống!', 'danger');
            this.ten.focus();
        } else if (changes.diaChi == '') {
            T.notify('Địa chỉ bệnh viện bị trống!', 'danger');
            this.diaChi.focus();
        } else if (changes.maTuyen == '') {
            T.notify('Mã tuyến bệnh viện bị trống!', 'danger');
            this.maTuyen.focus();
        } else {
            this.state.ma ? this.props.update(this.state.ma, changes, this.hide) : this.props.create(changes, this.hide);
        }
    };

    render = () => {
        const readOnly = this.props.readOnly;
        return this.renderModal({
            title: this.state.ma ? 'Cập nhật bệnh viện' : 'Tạo mới bệnh viện',
            body: <div className='row'>
                <FormTextBox type='text' className='col-md-12' ref={e => this.ma = e} label='Mã Bệnh Viện' readOnly={this.state.ma ? true : readOnly} required />
                <FormTextBox type='text' className='col-md-12' ref={e => this.ten = e} label='Tên Bệnh Viện' readOnly={readOnly} required />
                <FormTextBox type='text' className='col-md-12' ref={e => this.diaChi = e} label='Địa chỉ Bệnh Viện' readOnly={readOnly} required />
                <FormTextBox type='text' className='col-md-12' ref={e => this.maTuyen = e} label='Mã tuyến Bệnh Viện' readOnly={readOnly} required />
                <FormCheckbox className='col-md-6' ref={e => this.kichHoat = e} label='Kích hoạt' isSwitch={true} readOnly={readOnly} onChange={value => this.changeKichHoat(value ? 1 : 0)} />
            </div>
        });
    }
}

class dmBenhVienPage extends AdminPage {
    state = { searching: false };
    tuyenOptions = [];
    tuyenMapper = []
    
    componentDidMount() {
        T.ready('/user/category', () => {
            T.onSearch = (searchText) => this.props.getDmBenhVienPage(undefined, undefined, searchText || '');
            T.showSearchBox();
            this.props.getDmBenhVienPage();
        });
    }

    showModal = (e) => {
        e.preventDefault();
        this.modal.show();
    };

    delete = (e, item) => {
        e.preventDefault();
        T.confirm('Bệnh viện', 'Bạn có chắc bạn muốn xóa bệnh viện này?', 'warning', true, isConfirm =>
            isConfirm && this.props.deleteDmBenhVien(item.ma));
    };

    changeActive = item => this.props.updateDmBenhVien(item.ma, { kichHoat: Number(!item.kichHoat) });

    render() {
        const currentPermissions = this.props.system && this.props.system.user && this.props.system.user.permissions ? this.props.system.user.permissions : [],
            permissionWrite = currentPermissions.includes('dmBenhVien:write'),
            permission = this.getUserPermission('dmBenhVien', ['read', 'write', 'delete']);
        let { pageNumber, pageSize, pageTotal, totalItem, pageCondition, list } = this.props.dmBenhVien && this.props.dmBenhVien.page ?
            this.props.dmBenhVien.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, pageCondition: {}, list: [] };
        let table = 'Không có dữ liệu!';
        if (list && list.length > 0 && this.tuyenMapper) {
            table = renderTable({
                getDataSource: () => list, stickyHead: false,
                renderHead: () => (
                    <tr>
                        <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                        <th style={{ width: 'auto' }} nowrap='true'>Mã</th>
                        <th style={{ width: '40%' }} nowrap='true'>Tên</th>
                        <th style={{ width: '30%' }} nowrap='true'>Địa chỉ</th>
                        <th style={{ width: '30%' }} nowrap='true'>Tên tuyến</th>
                        <th style={{ width: 'auto' }} nowrap='true'>Kích hoạt</th>
                        <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Thao tác</th>
                    </tr>),
                renderRow: (item, index) => (
                    <tr key={index}>
                        <TableCell type='number' content={(pageNumber - 1) * pageSize + index + 1}/>
                        <TableCell type='text' content={item.ma}/>
                        <TableCell type='link' content={T.language.parse(item.ten, true).vi} onClick={() => this.modal.show(item)}/>
                        <TableCell type='text' content={T.language.parse(item.diaChi, true).vi} style={{ whiteSpace: 'nowrap' }}/>
                        <TableCell type='text' content={T.language.parse(this.tuyenMapper[item.maTuyen] ? this.tuyenMapper[item.maTuyen] : '', true).vi} style={{ whiteSpace: 'nowrap' }}/>
                        <TableCell type='checkbox' content={item.kichHoat} permissions={permissionWrite} onChanged={() => permissionWrite && this.changeActive(item)} />
                        <TableCell type='buttons' content={item} permission={permission} onEdit={() => this.modal.show(item)} onDelete={this.delete}></TableCell>
                    </tr>)
            });
        }
        return this.renderPage({
            icon: 'fa fa-list-alt',
            title: 'Danh mục Bệnh viện',
            breadcrumb: [
                <Link key={0} to='/user/category'>Danh mục</Link>,
                'Danh mục Bệnh viện'
            ],
            content: <>
                <div className='tile'>{table}</div>
                <Pagination style={{ marginLeft: '65px' }} {...{ pageNumber, pageSize, pageTotal, totalItem, pageCondition }} getPage={this.props.getDmBenhVienPage} />
                <EditModal ref={e => this.modal = e} permission={permission}
                    create={this.props.createDmBenhVien} update={this.props.updateDmBenhVien} permissions={currentPermissions} />
            </>,
            backRoute: '/user/category',
            onCreate: permission && permission.write ? (e) => this.showModal(e) : null,
            onImport: permission && permission.write ? (e) => e.preventDefault() || this.props.history.push('/user/danh-muc/benh-vien/upload') : null
        });
    }
}

const mapStateToProps = state => ({ system: state.system, dmBenhVien: state.danhMuc.dmBenhVien, dmBenhVienMaTuyen: state.danhMuc.dmTuyenBenhVien });
const mapActionsToProps = { getDmBenhVienPage, createDmBenhVien, updateDmBenhVien, deleteDmBenhVien, getDmTuyenBenhVienAll };
export default connect(mapStateToProps, mapActionsToProps)(dmBenhVienPage);
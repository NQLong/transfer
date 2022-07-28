import React from 'react';
import { connect } from 'react-redux';
import { getDmSvKhuVucTuyenSinhPage, deleteDmSvKhuVucTuyenSinh, createDmSvKhuVucTuyenSinh, updateDmSvKhuVucTuyenSinh } from './redux';
import { Link } from 'react-router-dom';
import { getValue, AdminPage, TableCell, renderTable, AdminModal, FormCheckbox, FormTextBox } from 'view/component/AdminPage';
import Pagination from 'view/component/Pagination';

class EditModal extends AdminModal {
    componentDidMount() {
        this.onShown(() => {
            !this.ma.value() ? this.ma.focus() : this.ten.focus();
        });
    }

    onShow = (item) => {
        let { ma, ten, moTa, kichHoat } = item ? item : { ma: '', ten: '', moTa: '', kichHoat: true };

        this.setState({ ma });
        this.ma.value(ma);
        this.ten.value(ten);
        this.moTa.value(moTa);
        this.kichHoat.value(kichHoat);
    };

    onSubmit = (e) => {
        e.preventDefault();
        const changes = {
            ma: getValue(this.ma),
            ten: getValue(this.ten),
            moTa: getValue(this.moTa),
            kichHoat: Number(getValue(this.kichHoat)),
        };
        this.state.ma ? this.props.update(this.state.ma, changes, this.hide) : this.props.create(changes, this.hide);
    };

    changeKichHoat = value => this.kichHoat.value(Number(value));

    render = () => {
        const readOnly = this.props.readOnly;
        return this.renderModal({
            title: this.state.ma ? 'Cập nhật khu vực tuyển sinh' : 'Tạo mới khu vực tuyển sinh',
            body: <div className='row'>
                <FormTextBox className='col-12' ref={e => this.ma = e} label='Mã' readOnly={this.state.ma ? true : readOnly} placeholder='Mã' required />
                <FormTextBox className='col-12' ref={e => this.ten = e} label='Tên' readOnly={readOnly} placeholder='Tên' required />
                <FormTextBox className='col-12' ref={e => this.moTa = e} label='Mô tả' readOnly={readOnly} placeholder='Mô tả' required />
                <FormCheckbox className='col-md-6' ref={e => this.kichHoat = e} label='Kích hoạt' isSwitch={true} readOnly={readOnly} style={{ display: 'inline-flex' }}
                    onChange={value => this.changeKichHoat(value)} required />
            </div>
        });
    }
}

class DmSvKhuVucTuyenSinhPage extends AdminPage {
    componentDidMount() {
        let route = T.routeMatcher('/user/:menu/khu-vuc-tuyen-sinh').parse(window.location.pathname);
        this.menu = route.menu == 'danh-muc' ? 'category' : 'dao-tao';
        T.ready(`/user/${this.menu}`);
        T.onSearch = (searchText) => this.props.getDmSvKhuVucTuyenSinhPage(undefined, undefined, searchText || '');
        T.showSearchBox();
        this.props.getDmSvKhuVucTuyenSinhPage();
    }

    showModal = (e) => {
        e.preventDefault();
        this.modal.show();
    }

    delete = (e, item) => {
        T.confirm('Xóa khu vực tuyển sinh ', `Bạn có chắc bạn muốn xóa khu vực tuyển sinh ${item.ten ? `<b>${item.ten}</b>` : 'này'}?`, 'warning', true, isConfirm => {
            isConfirm && this.props.deleteDmSvKhuVucTuyenSinh(item.ma, error => {
                if (error) T.notify(error.message ? error.message : `Xoá khu vực tuyển sinh  ${item.ten} bị lỗi!`, 'danger');
                else T.alert(`Xoá khu vực tuyển sinh  ${item.ten} thành công!`, 'success', false, 800);
            });
        });
        e.preventDefault();
    }

    render() {
        const currentPermissions = this.props.system && this.props.system.user && this.props.system.user.permissions ? this.props.system.user.permissions : [],
            permission = this.getUserPermission('dmSvKhuVucTuyenSinh');

        const { pageNumber, pageSize, pageTotal, totalItem, pageCondition, list } = this.props.dmSvKhuVucTuyenSinh && this.props.dmSvKhuVucTuyenSinh.page ?
            this.props.dmSvKhuVucTuyenSinh.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, list: null };
        const table = renderTable({
            getDataSource: () => list, stickyHead: false,
            emptyTable: 'Không có dữ liệu khu vực tuyển sinh',
            renderHead: () => (
                <tr>
                    <th style={{ width: '10%' }} nowrap='true'>Mã</th>
                    <th style={{ width: '40%' }} nowrap='true'>Tên</th>
                    <th style={{ width: '50%' }} nowrap='true'>Mô tả</th>
                    <th style={{ width: 'auto' }} nowrap='true'>Kích hoạt</th>
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Thao tác</th>
                </tr>),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell type='link' content={item.ma} onClick={() => this.modal.show(item)} />
                    <TableCell content={item.ten} />
                    <TableCell content={item.moTa} />
                    <TableCell type='checkbox' content={item.kichHoat} permission={permission}
                        onChanged={value => this.props.updateDmSvKhuVucTuyenSinh(item.ma, { kichHoat: Number(value) })} />
                    <TableCell type='buttons' content={item} permission={permission}
                        onEdit={() => this.modal.show(item)} onDelete={this.delete} />
                </tr>),

        });

        return this.renderPage({
            icon: this.menu == 'dao-tao' ? 'fa fa-user-circle-o' : 'fa fa-list-alt',
            title: 'Khu vực tuyển sinh',
            breadcrumb: [
                <Link key={0} to={`/user/${this.menu}`}>{this.menu == 'dao-tao' ? 'Đào tạo' : 'Danh mục'}</Link>,
                'Khu vực tuyển sinh'
            ],
            content: <>
                <div className='tile'>{table}</div>
                <Pagination style={{ marginLeft: '70px' }} {...{ pageNumber, pageSize, pageTotal, totalItem, pageCondition }}
                    getPage={this.props.getDmSvKhuVucTuyenSinhPage} />
                <EditModal ref={e => this.modal = e} permission={permission}
                    create={this.props.createDmSvKhuVucTuyenSinh} update={this.props.updateDmSvKhuVucTuyenSinh} permissions={currentPermissions} />
            </>,
            backRoute: `/user/${this.menu}`,
            onCreate: permission && permission.write ? (e) => this.showModal(e) : null
        });
    }
}

const mapStateToProps = state => ({ system: state.system, dmSvKhuVucTuyenSinh: state.danhMuc.dmSvKhuVucTuyenSinh });
const mapActionsToProps = { getDmSvKhuVucTuyenSinhPage, deleteDmSvKhuVucTuyenSinh, createDmSvKhuVucTuyenSinh, updateDmSvKhuVucTuyenSinh };
export default connect(mapStateToProps, mapActionsToProps)(DmSvKhuVucTuyenSinhPage);
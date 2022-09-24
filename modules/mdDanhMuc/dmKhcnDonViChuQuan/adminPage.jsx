import React from 'react';
import { connect } from 'react-redux';
import { getDmKhcnDonViChuQuanPage, createDmKhcnDonViChuQuan, updateDmKhcnDonViChuQuan, deleteDmKhcnDonViChuQuan } from './redux';
import Pagination from 'view/component/Pagination';
import { Link } from 'react-router-dom';
import { AdminPage, TableCell, renderTable, AdminModal, FormTextBox } from 'view/component/AdminPage';

class EditModal extends AdminModal {
    componentDidMount() {
        $(document).ready(() => this.onShown(() => {
            !this.ma.value() ? this.ma.focus() : this.ten.focus();
        }));
    }
    onShow = (item) => {
        let { ma, ten } = item ? item : { ma: '', ten: '' };
        this.setState({ ma, item });
        this.ma.value(ma);
        this.ten.value(ten ? ten : '');
    };


    onSubmit = (e) => {
        e.preventDefault();
        const changes = {
            ma: this.ma.value(),
            ten: this.ten.value()
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
    };

    render = () => {
        const readOnly = this.props.readOnly;
        return this.renderModal({
            title: this.state.ma ? 'Cập nhật KHCN Đơn vị chủ quản' : 'Tạo mới KHCN Đơn vị chủ quản',
            body: <div className='row'>
                <FormTextBox type='text' className='col-sm-12' ref={e => this.ma = e} label='Mã' readOnly={this.state.ma ? true : readOnly} placeholder='Mã' required />
                <FormTextBox type='text' className='col-sm-12' ref={e => this.ten = e} label='Tên' readOnly={readOnly} placeholder='Tên' required />
            </div>
        });
    }
}

class dmKhcnDonViChuQuanAdminPage extends AdminPage {
    state = { searching: false };

    componentDidMount() {
        T.ready('/user/category', () => {
            T.onSearch = (searchText) => this.props.getDmKhcnDonViChuQuanPage(undefined, undefined, searchText || '');
            T.showSearchBox();
            this.props.getDmKhcnDonViChuQuanPage();
        });
    }

    showModal = (e) => {
        e.preventDefault();
        this.modal.show();
    }

    delete = (e, item) => {
        T.confirm('Xóa KHCN Đơn vị chủ quản', `Bạn có chắc bạn muốn xóa KHCN Đơn vị chủ quản ${item.ten ? `<b>${item.ten}</b>` : 'này'}?`, 'warning', true, isConfirm => {
            isConfirm && this.props.deleteDmKhcnDonViChuQuan(item.ma, error => {
                if (error) T.notify(error.message ? error.message : `Xoá KHCN Đơn vị chủ quản ${item.ten} bị lỗi!`, 'danger');
                else T.alert(`Xoá KHCN Đơn vị chủ quản ${item.ten} thành công!`, 'success', false, 800);
            });
        });
        e.preventDefault();
    }
    render() {
        const currentPermissions = this.props.system && this.props.system.user && this.props.system.user.permissions ? this.props.system.user.permissions : [],
            permission = this.getUserPermission('dmKhcnDonViChuQuan', ['read', 'write', 'delete']);

        const { pageNumber, pageSize, pageTotal, totalItem, pageCondition, list } =
            this.props.dmDonViChuQuan && this.props.dmDonViChuQuan.page ?
                this.props.dmDonViChuQuan.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, pageCondition: '', list: [] };
        let table = 'Không có dữ liệu KHCN Đơn vị chủ quản!';
        if (list && list.length > 0) {
            table = renderTable({
                getDataSource: () => list, stickyHead: false,
                renderHead: () => (
                    <tr>
                        <th style={{ width: 'auto' }}>Mã</th>
                        <th style={{ width: '100%' }}>Tên</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Thao tác</th>
                    </tr>),
                renderRow: (item, index) => (
                    <tr key={index}>
                        <TableCell type='link' content={item.ma} onClick={() => this.modal.show(item)} />
                        <TableCell type='text' content={item.ten} />
                        <TableCell type='buttons' content={item} permission={permission}
                            onEdit={() => this.modal.show(item)} onDelete={this.delete} />
                    </tr>
                ),
            });
        }

        return this.renderPage({
            icon: 'fa fa-list-alt',
            title: 'KHCN Đơn vị chủ quản',
            breadcrumb: [
                <Link key={0} to='/user/category'>Danh mục</Link>,
                'KHCN Đơn vị chủ quản'
            ],
            content: <>
                <div className='tile'>{table}</div>
                <Pagination style={{ marginLeft: '65px' }} {...{ pageNumber, pageSize, pageTotal, totalItem, pageCondition }} getPage={this.props.getDmKhcnDonViChuQuanPage} />
                <EditModal ref={e => this.modal = e} permission={permission}
                    create={this.props.createDmKhcnDonViChuQuan} update={this.props.updateDmKhcnDonViChuQuan} permissions={currentPermissions} />
            </>,
            backRoute: '/user/category',
            onCreate: permission && permission.write ? (e) => this.showModal(e) : null
        });
    }
}

const mapStateToProps = state => ({ system: state.system, dmDonViChuQuan: state.danhMuc.dmDonViChuQuan });
const mapActionsToProps = { getDmKhcnDonViChuQuanPage, createDmKhcnDonViChuQuan, updateDmKhcnDonViChuQuan, deleteDmKhcnDonViChuQuan };
export default connect(mapStateToProps, mapActionsToProps)(dmKhcnDonViChuQuanAdminPage);
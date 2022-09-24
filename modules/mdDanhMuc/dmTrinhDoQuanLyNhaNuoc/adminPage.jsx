import React from 'react';
import { connect } from 'react-redux';
import { createDmTrinhDoQuanLyNhaNuoc, deleteDmTrinhDoQuanLyNhaNuoc, updateDmTrinhDoQuanLyNhaNuoc, getDmTrinhDoQuanLyNhaNuocPage } from './redux';
import Pagination from 'view/component/Pagination';
import { Link } from 'react-router-dom';
import { AdminPage, TableCell, renderTable, AdminModal, FormTextBox, FormCheckbox } from 'view/component/AdminPage';

class EditModal extends AdminModal {
    componentDidMount() {
        $(document).ready(() => this.onShown(() => {
            !this.ma.value() ? this.ma.focus() : this.ten.focus();
        }));
    }
    onShow = (item) => {
        let { ma, ten, kichHoat } = item ? item : { ma: '', ten: '', kichHoat: true };

        this.setState({ ma, item });
        this.ma.value(ma);
        this.ten.value(ten);
        this.kichHoat.value(kichHoat);
    };

    onSubmit = (e) => {
        e.preventDefault();
        const changes = {
            ma: this.ma.value(),
            ten: this.ten.value(),
            kichHoat: Number(this.kichHoat.value())
        };
        if (changes.ten == '') {
            T.notify('Tên không được trống trống!', 'danger');
            this.ten.focus();
        } else if (!this.state.ma && !this.ma.value()) {
            T.notify('Mã không được trống trống!', 'danger');
            this.ma.focus();
        } else {
            if (this.state.ma) {
                this.props.update(this.state.ma, changes, this.hide);
            } else this.props.create(changes, this.hide);
        }
    }

    changeKichHoat = value => this.kichHoat.value(value ? 1 : 0) || this.kichHoat.value(value);

    render = () => {
        const readOnly = this.props.readOnly;
        return this.renderModal({
            title: this.state.ma ? 'Tạo mới trình độ' : 'Cập nhật trình độ',
            body: <div className='row'>
                <FormTextBox type='text' className='col-12' ref={e => this.ma = e} label='Mã trình độ' readOnly={this.state.ma ? true : readOnly} placeholder='Mã trình độ đơn vị' required />
                <FormTextBox type='text' className='col-12' ref={e => this.ten = e} label='Tên trình độ' readOnly={readOnly} placeholder='Tên trình độ' required />
                <FormCheckbox className='col-md-6' ref={e => this.kichHoat = e} label='Kích hoạt' isSwitch={true} readOnly={readOnly} style={{ display: 'inline-flex', margin: 0 }}
                    onChange={value => this.changeKichHoat(value ? 1 : 0)} />
            </div>
        }
        );
    }
}

class dmTrinhDoQLNNAdminPage extends AdminPage {
    state = { searching: false };

    componentDidMount() {
        T.ready('/user/category', () => {
            T.onSearch = (searchText) => this.props.getDmTrinhDoQuanLyNhaNuocPage(undefined, undefined, searchText || '');
            T.showSearchBox();
            this.props.getDmTrinhDoQuanLyNhaNuocPage();
        });
    }

    showModal = (e) => {
        e.preventDefault();
        this.modal.show();
    }

    delete = (e, item) => {
        T.confirm('Xóa Trình độ quản lý nhà nước', `Bạn có chắc bạn muốn xóa Trình độ quản lý nhà nước ${item.teb ? `<b>${item.ten}</b>` : 'này'}?`, 'warning', true, isConfirm => {
            isConfirm && this.props.deleteDmTrinhDoQuanLyNhaNuoc(item.ma, error => {
                if (error) T.notify(error.message ? error.message : `Xoá Trình độ quản lý nhà nước ${item.ten} bị lỗi!`, 'danger');
                else T.alert(`Xoá Trình độ quản lý nhà nước ${item.ten} thành công!`, 'success', false, 800);
            });
        });
        e.preventDefault();
    }

    render() {
        const currentPermissions = this.props.system && this.props.system.user && this.props.system.user.permissions ? this.props.system.user.permissions : [],
            permission = this.getUserPermission('dmTrinhDoQuanLyNhaNuoc', ['read', 'write', 'delete']);
        const { pageNumber, pageSize, pageTotal, totalItem, pageCondition, list } = this.props.dmTrinhDoQuanLyNhaNuoc && this.props.dmTrinhDoQuanLyNhaNuoc.page ?
            this.props.dmTrinhDoQuanLyNhaNuoc.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, pageCondition: '', list: [] };
        const table = !(list && list.length > 0) ? 'Không có dữ liệu Trình độ quản lý nhà nước' :
            renderTable({
                getDataSource: () => list, stickyHead: false,
                renderHead: () => (
                    <tr>
                        <th style={{ width: 'auto' }}>Mã</th>
                        <th style={{ width: '100%' }}>Tên</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Kích hoạt</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Thao tác</th>
                    </tr>),
                renderRow: (item, index) => (
                    <tr key={index}>
                        <TableCell type='text' content={item.ma} />
                        <TableCell type='link' content={item.ten} onClick={() => this.modal.show(item)} />
                        <TableCell type='checkbox' content={item.kichHoat} permission={permission}
                            onChanged={value => this.props.updateDmTrinhDoQuanLyNhaNuoc(item.ma, { kichHoat: value ? 1 : 0, })} />
                        <TableCell type='buttons' content={item} permission={permission} onEdit={() => this.modal.show(item)} onDelete={this.delete} />
                    </tr>
                ),
            });

        return this.renderPage({
            icon: 'fa fa-list-alt',
            title: 'Trình độ quản lý nhà nước',
            breadcrumb: [
                <Link key={0} to='/user/category'>Danh mục</Link>,
                'Trình độ quản lý nhà nước'
            ],
            content: <>
                <div className='tile'>{table}</div>
                <Pagination style={{ marginLeft: '65px' }} {...{ pageNumber, pageSize, pageTotal, totalItem, pageCondition }} getPage={this.props.getDmTrinhDoQuanLyNhaNuocPage} />
                <EditModal ref={e => this.modal = e} permission={permission}
                    create={this.props.createDmTrinhDoQuanLyNhaNuoc} update={this.props.updateDmTrinhDoQuanLyNhaNuoc} permissions={currentPermissions} />
            </>,
            backRoute: '/user/category',
            onCreate: permission && permission.write ? (e) => this.showModal(e) : null
        });
    }
}

const mapStateToProps = state => ({ system: state.system, dmTrinhDoQuanLyNhaNuoc: state.danhMuc.dmTrinhDoQuanLyNhaNuoc });
const mapActionsToProps = { createDmTrinhDoQuanLyNhaNuoc, deleteDmTrinhDoQuanLyNhaNuoc, updateDmTrinhDoQuanLyNhaNuoc, getDmTrinhDoQuanLyNhaNuocPage };
export default connect(mapStateToProps, mapActionsToProps)(dmTrinhDoQLNNAdminPage);
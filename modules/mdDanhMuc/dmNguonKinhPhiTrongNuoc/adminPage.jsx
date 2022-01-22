import React from 'react';
import { connect } from 'react-redux';
import { getDmNguonKinhPhiTrongNuocPage, deleteDmNguonKinhPhiTrongNuoc, createDmNguonKinhPhiTrongNuoc, updateDmNguonKinhPhiTrongNuoc } from './redux';
import Pagination from 'view/component/Pagination';
import { Link } from 'react-router-dom';
import { AdminPage, TableCell, renderTable, AdminModal, FormTextBox, FormCheckbox } from 'view/component/AdminPage';

class EditModal extends AdminModal {
    componentDidMount() {
        $(document).ready(() => this.onShown(() => {
            !this.ma.value() ? this.ma.focus() : this.moTa.focus();
        }));
    }

    onShow = (item) => {
        let { ma, moTa, kichHoat } = item ? item : { ma: '', moTa: '', kichHoat: 1 };
        this.setState({ ma, item });
        this.ma.value(ma);
        this.moTa.value(moTa);
        this.kichHoat.value(kichHoat ? 1 : 0);
    };

    onSubmit = () => {
        const changes = {
            ma: this.ma.value(),
            moTa: this.moTa.value(),
            kichHoat: this.kichHoat.value() ? 1 : 0,
        };
        if (!this.state.ma && !this.ma.value()) {
            T.notify('Mã không được trống!', 'danger');
            this.ma.focus();
        } else if (changes.moTa == '') {
            T.notify('Mô tả không được trống!', 'danger');
            this.moTa.focus();
        } else {
            this.state.ma ? this.props.update(this.state.ma, changes, this.hide) : this.props.create(changes, this.hide);
        }
    };

    changeKichHoat = value => this.kichHoat.value(value ? 1 : 0) || this.kichHoat.value(value);

    render = () => {
        const readOnly = this.props.readOnly;
        return this.renderModal({
            title: this.state.ma ? 'Cập nhật kinh phí trong nước' : 'Tạo mới kinh phí trong nước',
            size: 'large',
            body: <div className='row'>
                <FormTextBox type='text' className='col-12' ref={e => this.ma = e} label='Mã ' readOnly={this.state.ma ? true : readOnly} placeholder='Mã' required />
                <FormTextBox type='text' className='col-12' ref={e => this.moTa = e} label='Mô tả' readOnly={readOnly} placeholder='Mô tả' required />
                <FormCheckbox className='col-md-6' ref={e => this.kichHoat = e} label='Kích hoạt' isSwitch={true} readOnly={readOnly} style={{ display: 'inline-flex', margin: 0 }}
                    onChange={value => this.changeKichHoat(value ? 1 : 0)} />

            </div>
        }
        );
    }
}

class DmNguonKinhPhiTrongNuocPage extends AdminPage {
    state = { searching: false };

    componentDidMount() {
        T.ready('/user/category', () => {
            T.onSearch = (searchText) => this.props.getDmNguonKinhPhiTrongNuocPage(undefined, undefined, searchText || '');
            T.showSearchBox();
            this.props.getDmNguonKinhPhiTrongNuocPage();
        });
    }

    showModal = (e) => {
        e.preventDefault();
        this.modal.show();
    }

    delete = (e, item) => {
        T.confirm('Xóa Nguồn kinh phí trong nước', `Bạn có chắc bạn muốn xóa Nguồn kinh phí trong nước ${item.moTa ? `<b>${item.moTa}</b>` : 'này'}?`, 'warning', true, isConfirm => {
            isConfirm && this.props.deleteDmNguonKinhPhiTrongNuoc(item.ma, error => {
                if (error) T.notify(error.message ? error.message : `Xoá Nguồn kinh phí trong nước ${item.moTa} bị lỗi!`, 'danger');
                else T.alert(`Xoá Nguồn kinh phí trong nước ${item.moTa} thành công!`, 'success', false, 800);
            });
        });
        e.preventDefault();
    }

    render() {
        const currentPermissions = this.props.system && this.props.system.user && this.props.system.user.permissions ? this.props.system.user.permissions : [],
            permission = this.getUserPermission('dmNguonKinhPhiTrongNuoc', ['read', 'write', 'delete']);

        let { pageNumber, pageSize, pageTotal, totalItem, pageCondition, list } = this.props.dmNguonKinhPhiTrongNuoc && this.props.dmNguonKinhPhiTrongNuoc.page ?
            this.props.dmNguonKinhPhiTrongNuoc.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, pageCondition: {}, list: [] };

        const table = !(list && list.length > 0) ? 'Không có dữ liệu Nguồn kinh phí trong nước' :
            renderTable({
                getDataSource: () => list, stickyHead: false,
                renderHead: () => (
                    <tr>
                        <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                        <th style={{ width: 'auto' }}>Mã</th>
                        <th style={{ width: '100%' }}>Mô tả</th>
                        <th style={{ width: 'auto' }} nowrap='true'>Kích hoạt</th>
                        <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Thao tác</th>
                    </tr>),
                renderRow: (item, index) => (
                    <tr key={index}>
                        <TableCell type='number' content={index + 1} style={{ textAlign: 'right' }} />
                        <TableCell type='link' content={item.ma} onClick={() => this.modal.show(item)} />
                        <TableCell type='text' content={item.moTa} />
                        <TableCell type='checkbox' content={item.kichHoat} permission={permission}
                            onChanged={value => this.props.updateDmNguonKinhPhiTrongNuoc(item.ma, { kichHoat: value ? 1 : 0, })} />
                        <TableCell type='buttons' content={item} permission={permission}
                            onEdit={() => this.modal.show(item)} onDelete={this.delete} />
                    </tr>
                ),
            });

        return this.renderPage({
            icon: 'fa fa-list-alt',
            title: 'Nguồn kinh phí trong nước',
            breadcrumb: [
                <Link key={0} to='/user/category'>Danh mục</Link>,
                'Nguồn kinh phí trong nước'
            ],
            content: <>
                <div className='tile'>{table}</div>
                <Pagination style={{ marginLeft: '65px' }} {...{ pageNumber, pageSize, pageTotal, totalItem, pageCondition }} getPage={this.props.getDmNguonKinhPhiTrongNuocPage} />
                <EditModal ref={e => this.modal = e} permission={permission}
                    create={this.props.createDmNguonKinhPhiTrongNuoc} update={this.props.updateDmNguonKinhPhiTrongNuoc} permissions={currentPermissions} />
            </>,
            backRoute: '/user/category',
            onCreate: permission && permission.write ? (e) => this.showModal(e) : null
        });
    }
}

const mapStateToProps = state => ({ system: state.system, dmNguonKinhPhiTrongNuoc: state.danhMuc.dmNguonKinhPhiTrongNuoc });
const mapActionsToProps = { getDmNguonKinhPhiTrongNuocPage, deleteDmNguonKinhPhiTrongNuoc, createDmNguonKinhPhiTrongNuoc, updateDmNguonKinhPhiTrongNuoc };
export default connect(mapStateToProps, mapActionsToProps)(DmNguonKinhPhiTrongNuocPage);
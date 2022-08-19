import React from 'react';
import { connect } from 'react-redux';
import { getDmMucDanhGiaAll, updateDmMucDanhGia, createDmMucDanhGia, deleteDmMucDanhGia } from './redux';
import { Link } from 'react-router-dom';
import { AdminPage, AdminModal, TableCell, renderTable, FormTextBox, FormCheckbox } from 'view/component/AdminPage';

class EditModal extends AdminModal {
    state = { active: true };

    componentDidMount() {
        $(document).ready(() => this.onShown(() => {
            !this.ma.value() ? this.ma.focus() : this.ten.focus();
        }));
    }

    onShow = (item) => {
        let { ma, ten, kichHoat } = item ? item : { ma: '', ten: '', kichHoat: true };
        this.ma.value(ma);
        this.ten.value(ten);
        this.kichHoat.value(kichHoat ? 1 : 0);
        this.setState({ item });
    }

    onSubmit = (e) => {
        e.preventDefault();
        const 
            changes = {
                ma: this.ma.value().trim(),
                ten: this.ten.value().trim(),
                kichHoat: Number(this.kichHoat.value()),
            };
        if (changes.ma == '') {
            T.notify('Mã bị trống!', 'danger');
            this.ma.focus();
        } else if (changes.ten == '') {
            T.notify('Tên bị trống!', 'danger');
            this.ten.focus();
        } else {
            this.state.item ? this.props.update(this.state.item.ma, changes) : this.props.create(changes);
            this.hide();
        }
        e.preventDefault();
    }


    render = () => {
        const readOnly = this.props.readOnly;
        return (this.renderModal({
            title: this.state.ma ? 'Cập nhật mức đánh giá' : 'Tạo mới mức đánh giá',
            body: <div className='row'>
                <FormTextBox className='col-md-12' ref={e => this.ma = e} label='Mã mức đánh giá' placeholder='Mã mức đánh giá' readOnly={this.state.ma ? true : readOnly} required />
                <FormTextBox type='text' className='col-md-12' ref={e => this.ten = e} label='Mô tả' readOnly={readOnly} />
                <FormCheckbox className='col-md-6' ref={e => this.kichHoat = e} label='Kích hoạt' isSwitch={true} readOnly={readOnly} />
            </div>
        }));
    }
}

class DmMucDanhGiaPage extends AdminPage {

    componentDidMount() {
        T.ready('/user/category', () => {
            T.onSearch = (searchText) => this.props.getDmMucDanhGiaAll(undefined, undefined, searchText || '');
            T.showSearchBox();
            this.props.getDmMucDanhGiaAll();
        });
    }

    showModal = (e) => {
        e.preventDefault();
        this.modal.show();
    }

    delete = (e, item) => {
        e.preventDefault();
        T.confirm('Xóa mức đánh giá', 'Bạn có chắc bạn muốn xóa mức đánh giá này?', true, isConfirm =>
            isConfirm && this.props.deleteDmMucDanhGia(item.ma));
    }

    render() {
        const currentPermissions = this.props.system && this.props.system.user && this.props.system.user.permissions ? this.props.system.user.permissions : [],
            permission = this.getUserPermission('dmMucDanhGia', ['read', 'write', 'delete']);
        let table = 'Không có mức đánh giá!',
            items = this.props.dmMucDanhGia && this.props.dmMucDanhGia.items ? this.props.dmMucDanhGia.items : [];
        if (items.length > 0) {
            table = renderTable({
                getDataSource: () => items, stickyHead: false,
                renderHead: () => (
                    <tr>
                        <th style={{ width: 'auto' }} nowrap='true'>Mã </th>
                        <th style={{ width: '100%' }}>Mô tả</th>
                        <th style={{ width: 'auto' }} nowrap='true'>Kích hoạt</th>
                        <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Thao tác</th>
                    </tr>),
                renderRow: (item, index) => (
                    <tr key={index}>
                        <TableCell type='link' content={item.ma ? item.ma : ''} onClick={() => this.modal.show(item)} />
                        <TableCell type='text' content={item.ten} />
                        <TableCell type='checkbox' content={item.kichHoat} permission={permission}
                            onChanged={value => this.props.updateDmMucDanhGia(item.ma, { kichHoat: value ? 1 : 0, })} />
                        <TableCell type='buttons' content={item} permission={permission}
                            onEdit={() => this.modal.show(item)} onDelete={this.delete} />
                    </tr>)
            });
        }
        return this.renderPage({
            icon: 'fa fa-list-alt',
            title: 'Danh mục mức đánh giá',
            breadcrumb: [
                <Link key={0} to='/user/category'>Danh mục</Link>,
                'Danh mục mức đánh giá'
            ],
            content: <>
                <div className='tile'>{table}</div>
                <EditModal ref={e => this.modal = e} permission={permission}
                    create={this.props.createDmMucDanhGia} update={this.props.updateDmMucDanhGia} permissions={currentPermissions} />
            </>,
            backRoute: '/user/category',
            onCreate: permission && permission.write ? (e) => this.showModal(e) : null,
        });
    }
}

const mapStateToProps = state => ({ system: state.system, dmMucDanhGia: state.danhMuc.dmMucDanhGia });
const mapActionsToProps = { getDmMucDanhGiaAll, updateDmMucDanhGia, createDmMucDanhGia, deleteDmMucDanhGia };
export default connect(mapStateToProps, mapActionsToProps)(DmMucDanhGiaPage);
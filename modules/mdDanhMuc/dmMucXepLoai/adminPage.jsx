import React from 'react';
import { connect } from 'react-redux';
import { getDmMucXepLoaiAll, updateDmMucXepLoai, createDmMucXepLoai, deleteDmMucXepLoai } from './redux';
import { getDmMucDanhGiaAll, SelectAdapter_DmMucDanhGiaAll } from '../dmMucDanhGia/redux';
import { Link } from 'react-router-dom';
import { AdminPage, AdminModal, TableCell, renderTable, FormTextBox, FormCheckbox, FormSelect } from 'view/component/AdminPage';

class EditModal extends AdminModal {
    state = { active: true };

    componentDidMount() {
        $(document).ready(() => this.onShown(() => {
            !this.ma.value() ? this.ma.focus() : this.ten.focus();
        }));
    }

    onShow = (item) => {
        let { ma, ten, maMucDanhGia, kichHoat } = item ? item : { ma: '', ten: '', maMucDanhGia: '', kichHoat: true };
        this.ma.value(ma);
        this.ten.value(ten);
        this.maMucDanhGia.value(maMucDanhGia);
        this.kichHoat.value(kichHoat ? 1 : 0);
        this.setState({ item });
    }

    onSubmit = (e) => {
        e.preventDefault();
        const
            changes = {
                ma: this.ma.value().trim(),
                ten: this.ten.value().trim(),
                maMucDanhGia: this.maMucDanhGia.value().trim(),
                kichHoat: Number(this.kichHoat.value()),
            };
        if (changes.ma == '') {
            T.notify('Mã bị trống!', 'danger');
            this.ma.focus();
        } else if (changes.ten == '') {
            T.notify('Tên bị trống!', 'danger');
            this.ten.focus();
        } else if (changes.maMucDanhGia == '') {
            T.notify('Mức đánh giá bị trống!', 'danger');
            this.maMucDanhGia.focus();
        } else {
            this.state.item ? this.props.update(this.state.item.ma, changes) : this.props.create(changes);
            this.hide();
        }
        e.preventDefault();
    }


    render = () => {
        const readOnly = this.props.readOnly;
        return (this.renderModal({
            title: this.state.ma ? 'Cập nhật mức xếp loại' : 'Tạo mới mức xếp loại',
            body: <div className='row'>
                <FormTextBox className='col-md-12' ref={e => this.ma = e} label='Mã mức xếp loại' placeholder='Mã mức xếp loại' readOnly={this.state.ma ? true : readOnly} required />
                <FormTextBox type='text' className='col-md-12' ref={e => this.ten = e} label='Mô tả' readOnly={readOnly} />
                <FormSelect ref={e => this.maMucDanhGia = e} label='Mức đánh giá' data={SelectAdapter_DmMucDanhGiaAll} className='col-md-12' />
                <FormCheckbox className='col-md-6' ref={e => this.kichHoat = e} label='Kích hoạt' isSwitch={true} readOnly={readOnly} />
            </div>
        }));
    }
}

class DmMucXepLoaiPage extends AdminPage {
    componentDidMount() {
        T.ready('/user/category', () => {
            T.onSearch = (searchText) => this.props.getDmMucXepLoaiAll(undefined, undefined, searchText || '');
            T.showSearchBox();
            this.props.getDmMucDanhGiaAll(items => {
                this.setState({ mucDanhGiaOptions: items.filter(item => item.kichHoat == 1) });
                this.props.getDmMucXepLoaiAll();
            });
        });
    }

    showModal = (e) => {
        e.preventDefault();
        this.modal.show();
    }

    delete = (e, item) => {
        e.preventDefault();
        T.confirm('Xóa mức xếp loại', 'Bạn có chắc bạn muốn xóa mức xếp loại này?', true, isConfirm =>
            isConfirm && this.props.deleteDmMucXepLoai(item.ma));
    }

    renderMucDanhGia = (maMucDanhGia) => {
        if (this.state.mucDanhGiaOptions && this.state.mucDanhGiaOptions.filter(mucDanhGia => mucDanhGia.ma == maMucDanhGia).length > 0) 
            return this.state.mucDanhGiaOptions.filter(mucDanhGia => mucDanhGia.ma == maMucDanhGia)[0].ten;
        return '';
    } 

    render() {
        const currentPermissions = this.props.system && this.props.system.user && this.props.system.user.permissions ? this.props.system.user.permissions : [],
            permission = this.getUserPermission('dmMucXepLoai', ['read', 'write', 'delete']);
        let table = 'Không có mức xếp loại!',
            items = this.props.dmMucXepLoai && this.props.dmMucXepLoai.items ? this.props.dmMucXepLoai.items : [];
        if (items.length > 0) {
            table = renderTable({
                getDataSource: () => items, stickyHead: false,
                renderHead: () => (
                    <tr>
                        <th style={{ width: 'auto' }} nowrap='true'>Mã </th>
                        <th style={{ width: '30%' }}>Mức xếp loại</th>
                        <th style={{ width: '70%' }}>Mức đánh giá</th>
                        <th style={{ width: 'auto' }} nowrap='true'>Kích hoạt</th>
                        <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Thao tác</th>
                    </tr>),
                renderRow: (item, index) => (
                    <tr key={index}>
                        <TableCell type='link' content={item.ma ? item.ma : ''} onClick={() => this.modal.show(item)} />
                        <TableCell type='text' content={item.ten} />
                        <TableCell type='text' content={this.renderMucDanhGia(item.maMucDanhGia)} />
                        <TableCell type='checkbox' content={item.kichHoat} permission={permission}
                            onChanged={value => this.props.updateDmMucXepLoai(item.ma, { kichHoat: value ? 1 : 0, })} />
                        <TableCell type='buttons' content={item} permission={permission}
                            onEdit={() => this.modal.show(item)} onDelete={this.delete} />
                    </tr>)
            });
        }
        return this.renderPage({
            icon: 'fa fa-list-alt',
            title: 'Danh mục mức xếp loại',
            breadcrumb: [
                <Link key={0} to='/user/category'>Danh mục</Link>,
                'Danh mục mức xếp loại'
            ],
            content: <>
                <div className='tile'>{table}</div>
                <EditModal ref={e => this.modal = e} permission={permission}
                    create={this.props.createDmMucXepLoai} update={this.props.updateDmMucXepLoai} permissions={currentPermissions} />
            </>,
            backRoute: '/user/category',
            onCreate: permission && permission.write ? (e) => this.showModal(e) : null,
        });
    }
}

const mapStateToProps = state => ({ system: state.system, dmMucXepLoai: state.danhMuc.dmMucXepLoai });
const mapActionsToProps = { getDmMucXepLoaiAll, updateDmMucXepLoai, createDmMucXepLoai, deleteDmMucXepLoai, getDmMucDanhGiaAll };
export default connect(mapStateToProps, mapActionsToProps)(DmMucXepLoaiPage);
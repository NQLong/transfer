import React from 'react';
import { connect } from 'react-redux';
import { getDmLuongDiNuocNgoaiPage, createDmLuongDiNuocNgoai, deleteDmLuongDiNuocNgoai, updateDmLuongDiNuocNgoai } from './redux';
import Pagination from 'view/component/Pagination';
import { Link } from 'react-router-dom';
import { AdminPage, TableCell, renderTable, AdminModal, FormTextBox, FormCheckbox, FormRichTextBox } from 'view/component/AdminPage';

class EditModal extends AdminModal {
    componentDidMount() {
        $(document).ready(() => this.onShown(() => {
            !this.ma.value() ? this.ma.focus() : this.ten.focus();
        }));
    }

    onShow = (item) => {
        let { ma, moTa, ghiChu, kichHoat } = item ? item : { ma: '', moTa: '', ghiChu: '', kichHoat: true };

        this.setState({ ma, item });
        this.ma.value(ma);
        this.moTa.value(moTa);
        this.ghiChu.value(ghiChu);
        this.kichHoat.value(kichHoat ? 1 : 0);
    };

    changeKichHoat = value => this.kichHoat.value(value ? 1 : 0) || this.kichHoat.value(value);

    onSubmit = (e) => {
        e.preventDefault();
        const changes = {
            ma: this.ma.value(),
            moTa: this.moTa.value(),
            ghiChu: this.ghiChu.value(),
            kichHoat: this.kichHoat.value() ? 1 : 0
        };
        if (changes.moTa == '') {
            T.notify('Mô tả Lương đi nước ngoài bị trống!', 'danger');
            this.moTa.focus();
        } else if (changes.ghiChu == '') {
            T.notify('Ghi chú Lương đi nước ngoài bị trống!', 'danger');
            this.ghiChu.focus();
        } else if (!this.state.ma && !this.ma.value()) {
            T.notify('Mã Lương đi nước ngoài bị trống!', 'danger');
            this.ma.focus();
        } else this.state.ma ? this.props.update(this.state.ma, changes, this.hide) : this.props.create(changes, this.hide);

    }

    render = () => {
        const readOnly = this.props.readOnly;
        return this.renderModal({
            title: this.state.ma ? 'Tạo mới lương đi nước ngoài' : 'Cập nhật lương đi nước ngoài',
            size: 'large',
            body: <div className='row'>
                <FormTextBox type='text' className='col-12' ref={e => this.ma = e} label='Mã' readOnly={this.state.ma ? true : readOnly} placeholder='Mã đơn vị' required />
                <FormTextBox type='text' className='col-12' ref={e => this.moTa = e} label='Mô tả' readOnly={readOnly} placeholder='Mô tả' required />
                <FormRichTextBox type='text' className='col-12' ref={e => this.ghiChu = e} label='Ghi chú' style={{ minHeight: 40 }} readOnly={readOnly} placeholder='Ghi chú' required />
                <FormCheckbox className='col-md-6' ref={e => this.kichHoat = e} label='Kích hoạt' isSwitch={true} readOnly={readOnly} style={{ display: 'inline-flex', margin: 0 }}
                    onChange={value => this.changeKichHoat(value ? 1 : 0)} />
            </div>
        }
        );
    }
}

class DmLuongDiNuocNgoaiPage extends AdminPage {
    state = { searching: false };

    componentDidMount() {
        T.ready('/user/category', () => {
            T.onSearch = (searchText) => this.props.getDmLuongDiNuocNgoaiPage(undefined, undefined, searchText || '');
            T.showSearchBox();
            this.props.getDmLuongDiNuocNgoaiPage();
        });
    }

    showModal = (e) => {
        e.preventDefault();
        this.modal.show();
    }

    delete = (e, item) => {
        T.confirm('Xóa Lương đi nước ngoài', `Bạn có chắc bạn muốn xóa Lương đi nước ngoài ${item.moTa ? `<b>${item.moTa}</b>` : 'này'}?`, 'warning', true, isConfirm => {
            isConfirm && this.props.deleteDmLuongDiNuocNgoai(item.ma, error => {
                if (error) T.notify(error.message ? error.message : `Xoá Lương đi nước ngoài ${item.moTa} bị lỗi!`, 'danger');
                else T.alert(`Xoá Lương đi nước ngoài ${item.moTa} thành công!`, 'success', false, 800);
            });
        });
        e.preventDefault();
    }

    render() {
        const currentPermissions = this.props.system && this.props.system.user && this.props.system.user.permissions ? this.props.system.user.permissions : [],
            permission = this.getUserPermission('dmLuongDiNuocNgoai', ['read', 'write', 'delete']);
        const { pageNumber, pageSize, pageTotal, totalItem, pageCondition, list } = this.props.dmLuongDiNuocNgoai && this.props.dmLuongDiNuocNgoai.page ?
            this.props.dmLuongDiNuocNgoai.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, pageCondition: '', list: [] };

        const table = !(list && list.length > 0) ? 'Không có dữ liệu Lương đi nước ngoài' :
            renderTable({
                getDataSource: () => list, stickyHead: false,
                renderHead: () => (
                    <tr>
                        <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                        <th style={{ width: 'auto' }}>Mã</th>
                        <th style={{ width: '50%' }}>Mô tả</th>
                        <th style={{ width: '50%' }}>Ghi chú</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Kích hoạt</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Thao tác</th>
                    </tr>),
                renderRow: (item, index) => (
                    <tr key={index}>
                        <TableCell type='number' content={(pageNumber - 1) * pageSize + index + 1} />
                        <TableCell type='link' content={item.ma} onClick={() => this.modal.show(item)} />
                        <TableCell type='text' content={item.moTa} />
                        <TableCell type='text' content={item.ghiChu} />
                        <TableCell type='checkbox' content={item.kichHoat} permission={permission}
                            onChanged={value => this.props.updateDmLuongDiNuocNgoai(item.ma, { kichHoat: value ? 1 : 0, })} />
                        <TableCell type='buttons' content={item} permission={permission}
                            onEdit={() => this.modal.show(item)} onDelete={this.delete} />
                    </tr>
                ),
            });


        return this.renderPage({
            icon: 'fa fa-list-alt',
            title: 'Lương đi nước ngoài',
            breadcrumb: [
                <Link key={0} to='/user/category'>Danh mục</Link>,
                'Lương đi nước ngoài'
            ],
            content: <>
                <div className='tile'>{table}</div>
                <Pagination style={{ marginLeft: '65px' }} {...{ pageNumber, pageSize, pageTotal, totalItem, pageCondition }} getPage={this.props.getDmLuongDiNuocNgoaiPage} />
                <EditModal ref={e => this.modal = e} permission={permission}
                    create={this.props.createDmLuongDiNuocNgoai} update={this.props.updateDmLuongDiNuocNgoai} permissions={currentPermissions} />
            </>,
            backRoute: '/user/category',
            onCreate: permission && permission.write ? (e) => this.showModal(e) : null
        });
    }
}

const mapStateToProps = state => ({ system: state.system, dmLuongDiNuocNgoai: state.danhMuc.dmLuongDiNuocNgoai });
const mapActionsToProps = { getDmLuongDiNuocNgoaiPage, createDmLuongDiNuocNgoai, deleteDmLuongDiNuocNgoai, updateDmLuongDiNuocNgoai };
export default connect(mapStateToProps, mapActionsToProps)(DmLuongDiNuocNgoaiPage);
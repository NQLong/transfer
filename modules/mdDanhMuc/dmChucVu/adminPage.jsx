import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { getDmChucVuPage, createDmChucVu, deleteDmChucVu, updateDmChucVu } from './redux';
import Pagination from 'view/component/Pagination';
import { AdminPage, AdminModal, TableCell, renderTable, FormTextBox, FormCheckbox, FormSelect } from 'view/component/AdminPage';

class EditModal extends AdminModal {
    state = {
        active: true, listChucVu: [
            { id: 1, text: 'Chức vụ Chính quyền' },
            { id: 2, text: 'Chức vụ Hội đồng trường' },
            { id: 3, text: 'Chức vụ Đảng ủy' },
            { id: 4, text: 'Chức vụ Công đoàn' },
            { id: 5, text: 'Chức vụ Hội Cựu Chiến binh' },
            { id: 6, text: 'Chức vụ Đoàn Thanh niên - Hội Sinh viên' },

        ]
    };

    componentDidMount() {
        $(document).ready(() => this.onShown(() => {
            !this.ma.value() ? this.ma.focus() : this.ten.focus();
        }));
    }

    onShow = (item) => {
        let { ma, ten, kichHoat, phuCap, ghiChu, loaiChucVu, isCapTruong } = item ? item : { ma: '', ten: '', kichHoat: 1, phuCap: '', ghiChu: '', loaiChucVu: '', isCapTruong: '' };
        this.setState({ ma, item });
        this.ma.value(ma);
        this.ten.value(ten);
        this.loaiChucVu?.value(loaiChucVu);
        this.phuCap.value(phuCap ? phuCap.toFixed(2) : '');
        this.ghiChu.value(ghiChu ? ghiChu : '');
        this.kichHoat.value(kichHoat ? 1 : 0);
        this.isCapTruong.value(isCapTruong ? 1 : 0);
    };

    changeKichHoat = value => this.kichHoat.value(value ? 1 : 0) || this.kichHoat.value(value);

    onSubmit = (e) => {
        e.preventDefault();
        const
            changes = {
                ma: this.ma.value(),
                ten: this.ten.value(),
                phuCap: this.phuCap.value(),
                ghiChu: this.ghiChu.value(),
                loaiChucVu: this.loaiChucVu.value(),
                kichHoat: this.kichHoat.value() ? 1 : 0,
                isCapTruong: this.isCapTruong.value() ? 1 : 0,
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
        return (this.renderModal({
            title: this.state.ma ? 'Cập nhật chức vụ' : 'Tạo mới chức vụ',
            body: <div className='row'>
                <FormTextBox className='col-md-12' ref={e => this.ma = e} label='Mã' readOnly={this.state.ma ? true : readOnly} required />
                <FormTextBox type='text' className='col-md-12' ref={e => this.ten = e} label='Tên' readOnly={readOnly} required />
                <FormTextBox type='number' className='col-md-12' ref={e => this.phuCap = e} label='Phụ cấp' readOnly={readOnly} step={0.01} />
                <FormSelect className='col-md-12' ref={e => this.loaiChucVu = e} label='Loại chức vụ' minimumResultsForSearch={-1}
                    readOnly={readOnly} data={this.state.listChucVu} required />
                <FormCheckbox className='col-md-6' ref={e => this.isCapTruong = e} label='Chức vụ cấp trường' isSwitch={true} readOnly={readOnly} onChange={value => this.isCapTruong.value(value ? 1 : 0)} />
                <FormCheckbox className='col-md-6' ref={e => this.kichHoat = e} label='Kích hoạt' isSwitch={true} readOnly={readOnly} onChange={value => this.changeKichHoat(value ? 1 : 0)} />
                <FormTextBox type='text' className='col-md-12' ref={e => this.ghiChu = e} label='Ghi chú' readOnly={readOnly} />
            </div>
        }));
    }
}

class DmChucVuPage extends AdminPage {
    loaiChucVuMap = {
        1: 'Chức vụ Chính quyền',
        2: 'Chức vụ Hội đồng trường',
        3: 'Chức vụ Đảng ủy',
        4: 'Chức vụ Công đoàn',
        5: 'Chức vụ Hội Cựu Chiến binh',
        6: 'Chức vụ Đoàn Thanh niên - Hội Sinh viên'
    };

    state = { searching: false };

    componentDidMount() {
        T.ready('/user/category', () => {
            T.onSearch = (searchText) => this.props.getDmChucVuPage(undefined, undefined, searchText || '');
            T.showSearchBox();
            this.props.getDmChucVuPage();
        });
    }

    showModal = (e) => {
        e.preventDefault();
        this.modal.show();
    }

    delete = (e, item) => {
        T.confirm('Xóa chức vụ', `Bạn có chắc bạn muốn xóa Chức vụ ${item.ten ? `<b>${item.ten}</b>` : 'này'}?`, 'warning', true, isConfirm => {
            isConfirm && this.props.deleteDmChucVu(item.ma, error => {
                if (error) T.notify(error.message ? error.message : `Xoá Chức vụ ${item.ten} bị lỗi!`, 'danger');
                else T.alert(`Xoá chức vụ ${item.ten} thành công!`, 'success', false, 800);
            });
        });
        e.preventDefault();
    }

    render() {
        const currentPermissions = this.props.system && this.props.system.user && this.props.system.user.permissions ? this.props.system.user.permissions : [],
            permission = this.getUserPermission('dmChucVu', ['read', 'write', 'delete']);
        const { pageNumber, pageSize, pageTotal, totalItem, pageCondition, list } = this.props.dmChucVu && this.props.dmChucVu.page ?
            this.props.dmChucVu.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, pageCondition: '', list: null };
        let table = 'Danh mục chức vụ trống!';
        if (list && list.length > 0) {
            table = renderTable({
                getDataSource: () => list, stickyHead: false,
                renderHead: () => (
                    <tr>
                        <th style={{ width: 'auto' }}>Mã</th>
                        <th style={{ width: '50%' }}>Tên</th>
                        <th style={{ width: '50%', whiteSpace: 'nowrap' }}>Loại chức vụ</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Phụ cấp</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Cấp chức vụ</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Kích hoạt</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Thao tác</th>
                    </tr>),
                renderRow: (item, index) => (
                    <tr key={index}>
                        <TableCell type='link' content={item.ma ? item.ma : ''} onClick={() => this.modal.show(item)} />
                        <TableCell type='text' content={item.ten ? item.ten : ''} />
                        <TableCell type='text' content={item.loaiChucVu ? this.loaiChucVuMap[item.loaiChucVu] : ''} />
                        <TableCell type='number' content={item.phuCap ? item.phuCap : ''} />
                        <TableCell type='text' content={item.isCapTruong ? 'Cấp trường' : 'Cấp khoa'} />
                        <TableCell type='checkbox' content={item.kichHoat} permission={permission}
                            onChanged={value => this.props.updateDmChucVu(item.ma, { kichHoat: value ? 1 : 0, })} />
                        <TableCell type='buttons' content={item} permission={permission}
                            onEdit={() => this.modal.show(item)} onDelete={this.delete} />
                    </tr>)
            });
        }

        return this.renderPage({
            icon: 'fa fa-list-alt',
            title: 'Danh mục Chức vụ',
            breadcrumb: [
                <Link key={0} to='/user/category'>Danh mục</Link>,
                'Danh mục Chức vụ'
            ],
            content: <>
                <div className='tile'>{table}</div>
                <Pagination style={{ marginLeft: '65px' }} {...{ pageNumber, pageSize, pageTotal, totalItem, pageCondition }} getPage={this.props.getDmChucVuPage} />
                <EditModal ref={e => this.modal = e} permission={permission}
                    create={this.props.createDmChucVu} update={this.props.updateDmChucVu} permissions={currentPermissions} />
            </>,
            backRoute: '/user/category',
            onCreate: permission && permission.write ? (e) => this.showModal(e) : null,
            onImport: permission && permission.write ? (e) => e.preventDefault() || this.props.history.push('/user/danh-muc/chuc-vu/upload') : null
        });
    }
}

const mapStateToProps = state => ({ system: state.system, dmChucVu: state.danhMuc.dmChucVu });
const mapActionsToProps = { getDmChucVuPage, createDmChucVu, deleteDmChucVu, updateDmChucVu };
export default connect(mapStateToProps, mapActionsToProps)(DmChucVuPage);
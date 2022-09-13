import React from 'react';
import { connect } from 'react-redux';
import { getDmTinhTrangDeTaiNckhAll, deleteDmTinhTrangDeTaiNckh, createDmTinhTrangDeTaiNckh, updateDmTinhTrangDeTaiNckh } from './redux';
import { Link } from 'react-router-dom';
import { AdminPage, AdminModal, TableCell, renderTable, FormTextBox, FormCheckbox } from 'view/component/AdminPage';

class EditModal extends AdminModal {
    state = { kichHoat: true };

    componentDidMount() {
        $(document).ready(() => this.onShown(() => {
            !this.ma.value() ? this.ma.focus() : this.ten.focus();
        }));
    }

    onShow = (item) => {
        let { ma, ten, stt, ghiChu, kichHoat } = item ? item : { ma: '', ten: '', stt: null, ghiChu: '', kichHoat: true };
        this.ma.value(ma);
        this.ten.value(ten);
        this.stt.value(stt);
        this.ghiChu.value(ghiChu);
        this.setState({ kichHoat });
    };

    changeKichHoat = value => this.kichHoat.value(value ? 1 : 0) || this.kichHoat.value(value);

    onSubmit = (e) => {
        e.preventDefault();
        const
            changes = {
                ma: this.ma.value(),
                ten: this.ten.value(),
                stt: Number(this.stt.value()),
                ghiChu: this.ghiChu.value(),
                kichHoat: Number(this.state.kichHoat),
            };
        if (changes.ma == '') {
            T.notify('Mã danh mục bị trống!');
            this.ma.focus();
        } else if (changes.ma != this.ma && this.props.dmTinhTrangDeTaiNckh.items.find(item => item.ma == changes.ma)) {
            T.notify('Mã danh mục đã tồn tại!');
            this.ma.focus();
        }
        else {
            this.state.ma ? this.props.update(this.state.ma, changes, this.hide) : this.props.create(changes, this.hide);
        }
    }

    render = () => {
        const readOnly = this.props.readOnly;
        return (this.renderModal({
            title: this.state.ma ? 'Cập nhật tình trạng đề tài NCKH' : 'Tạo mới tình trạng đề tài NCKH',
            body: <div className='row'>
                <FormTextBox className='col-md-12' ref={e => this.ma = e} label='Mã' placeholder='Mã danh mục' maxLength={3} readOnly={this.state.ma ? true : readOnly} required />
                <FormTextBox type='text' className='col-md-12' ref={e => this.ten = e} label='Tên' placeholder='Tên' readOnly={readOnly} />
                <FormTextBox type='text' className='col-md-12' ref={e => this.stt = e} label='Số thứ tự' placeholder='Số thứ tự' readOnly={readOnly} />
                <FormTextBox type='text' className='col-md-12' ref={e => this.ghiChu = e} label='Ghi chú' readOnly={readOnly} />
                <FormCheckbox className='col-md-6' ref={e => this.kichHoat = e} label='Kích hoạt' isSwitch={true} readOnly={readOnly} onChange={value => this.changeKichHoat(value ? 1 : 0)} />
            </div>
        }));
    }
}

class DmTinhTrangDeTaiNckhPage extends AdminPage {

    componentDidMount() {
        T.ready('/user/category', () => {
            T.onSearch = (searchText) => this.props.getDmTinhTrangDeTaiNckhAll(undefined, undefined, searchText || '');
            T.showSearchBox();
            this.props.getDmTinhTrangDeTaiNckhAll();
        });
    }

    showModal = (e) => {
        e.preventDefault();
        this.modal.show();
    }

    delete = (e, item) => {
        e.preventDefault();
        T.confirm('Xóa tình trạng đề tài', 'Bạn có chắc bạn muốn xóa danh mục này?', true, isConfirm =>
            isConfirm && this.props.deleteDmTinhTrangDeTaiNckh(item.ma));
    }

    render() {
        const currentPermissions = this.props.system && this.props.system.user && this.props.system.user.permissions ? this.props.system.user.permissions : [],
            permission = this.getUserPermission('dmTinhTrangDeTaiNckh', ['read', 'write', 'delete']);
        let table = 'Không có danh sách!',
            items = this.props.dmTinhTrangDeTaiNckh && this.props.dmTinhTrangDeTaiNckh.items ? this.props.dmTinhTrangDeTaiNckh.items : [];
        if (items && items.length > 0) {
            table = renderTable({
                getDataSource: () => items, stickyHead: false,
                renderHead: () => (
                    <tr>
                        <th style={{ width: 'auto' }}>Mã</th>
                        <th style={{ width: '30%' }}>Tên</th>
                        <th style={{ width: 'auto' }}>STT</th>
                        <th style={{ width: '70%', whiteSpace: 'nowrap' }}>Ghi chú</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Kích hoạt</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Thao tác</th>
                    </tr>),
                renderRow: (item, index) => (
                    <tr key={index}>
                        <TableCell type='text' content={item.ma ? item.ma : ''} />
                        <TableCell type='link' content={item.ten ? item.ten : ''} onClick={() => this.modal.show(item)} />
                        <TableCell type='text' content={item.stt} />
                        <TableCell type='text' content={item.ghiChu} />
                        <TableCell type='checkbox' content={item.kichHoat} permission={permission}
                            onChanged={value => this.props.updateDmTinhTrangDeTaiNckh(item.ma, { kichHoat: value ? 1 : 0, })} />
                        <TableCell type='buttons' content={item} permission={permission}
                            onEdit={() => this.modal.show(item)} onDelete={this.delete} />
                    </tr>)
            });
        }

        return this.renderPage({
            icon: 'fa fa-list-alt',
            title: 'Danh mục Tình trạng đề tài NCKH',
            breadcrumb: [
                <Link key={0} to='/user/category'>Danh mục</Link>,
                'Danh mục Tình trạng đề tài NCKH'
            ],
            content: <>
                <div className='tile'>{table}</div>
                <EditModal ref={e => this.modal = e} permission={permission}
                    create={this.props.createDmTinhTrangDeTaiNckh} update={this.props.updateDmTinhTrangDeTaiNckh} permissions={currentPermissions} />
            </>,
            backRoute: '/user/category',
            onCreate: permission && permission.write ? (e) => this.showModal(e) : null,
        });
    }
}

const mapStateToProps = state => ({ system: state.system, dmTinhTrangDeTaiNckh: state.danhMuc.dmTinhTrangDeTaiNckh });
const mapActionsToProps = { getDmTinhTrangDeTaiNckhAll, deleteDmTinhTrangDeTaiNckh, createDmTinhTrangDeTaiNckh, updateDmTinhTrangDeTaiNckh };
export default connect(mapStateToProps, mapActionsToProps)(DmTinhTrangDeTaiNckhPage);
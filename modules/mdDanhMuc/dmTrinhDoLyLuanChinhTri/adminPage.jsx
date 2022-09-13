import React from 'react';
import { connect } from 'react-redux';
import { getDmTrinhDoLyLuanChinhTriAll, deleteDmTrinhDoLyLuanChinhTri, createDmTrinhDoLyLuanChinhTri, updateDmTrinhDoLyLuanChinhTri } from './redux';
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
        let { ma, ten, kichHoat } = item ? item : { ma: '', ten: '', kichHoat: true };
        this.ma.value(ma);
        this.ten.value(ten);
        this.setState({ kichHoat });
    };

    changeKichHoat = value => this.kichHoat.value(value ? 1 : 0) || this.kichHoat.value(value);

    onSubmit = (e) => {
        e.preventDefault();
        const
            changes = {
                ma: this.ma.value(),
                ten: this.ten.value(),
                kichHoat: Number(this.state.kichHoat),
            };
        if (changes.ten == '') {
            T.notify('Tên danh mục bị trống');
            this.ten.focus();
        } else {
            this.state.ma ? this.props.update(this.state.ma, changes, this.hide) : this.props.create(changes, this.hide);
        }
    }

    render = () => {
        const readOnly = this.props.readOnly;
        return (this.renderModal({
            title: this.state.ma ? 'Cập nhật Trình độ lý luận chính trị' : 'Tạo mới Trình độ lý luận chính trị',
            body: <div className='row'>
                <FormTextBox className='col-md-12' ref={e => this.ma = e} label='Mã' placeholder='Mã danh mục' maxLength={2} readOnly={this.state.ma ? true : readOnly} required />
                <FormTextBox type='text' className='col-md-12' ref={e => this.ten = e} label='Tên' placeholder='Tên' readOnly={readOnly} required />
                <FormCheckbox className='col-md-6' ref={e => this.kichHoat = e} label='Kích hoạt' isSwitch={true} readOnly={readOnly} onChange={value => this.changeKichHoat(value ? 1 : 0)} />
                <FormTextBox type='text' className='col-md-12' ref={e => this.ghiChu = e} label='Ghi chú' readOnly={readOnly} />
            </div>
        }));
    }
}

class DmTrinhDoLyLuanChinhTriPage extends AdminPage {

    componentDidMount() {
        T.ready('/user/category', () => {
            T.onSearch = (searchText) => this.props.getDmTrinhDoLyLuanChinhTriAll(undefined, undefined, searchText || '');
            T.showSearchBox();
            this.props.getDmTrinhDoLyLuanChinhTriAll();
        });
    }

    showModal = (e) => {
        e.preventDefault();
        this.modal.show();
    }

    changeActive = item => this.props.updateDmTrinhDoLyLuanChinhTri(item.ma, { kichHoat: Number(!item.kichHoat) })

    delete = (e, item) => {
        e.preventDefault();
        T.confirm('Xóa trình độ Lý luận chính trị', 'Bạn có chắc bạn muốn xóa mục đích này?', true, isConfirm =>
            isConfirm && this.props.deleteDmTrinhDoLyLuanChinhTri(item.ma));
    }

    render() {
        const currentPermissions = this.props.system && this.props.system.user && this.props.system.user.permissions ? this.props.system.user.permissions : [],
            permission = this.getUserPermission('dmTrinhDoLyLuanChinhTri', ['read', 'write', 'delete']);
        let table = 'Không có danh sách!',
            items = this.props.dmTrinhDoLyLuanChinhTri && this.props.dmTrinhDoLyLuanChinhTri.items ? this.props.dmTrinhDoLyLuanChinhTri.items : [];
        if (items.length > 0) {
            table = renderTable({
                getDataSource: () => items, stickyHead: false,
                renderHead: () => (
                    <tr>
                        <th style={{ width: 'auto' }}>Mã</th>
                        <th style={{ width: '100%' }}>Tên</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Kích hoạt</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Thao tác</th>
                    </tr>),
                renderRow: (item, index) => (
                    <tr key={index}>
                        <TableCell type='link' content={item.ma ? item.ma : ''} onClick={() => this.modal.show(item)} />
                        <TableCell type='text' content={item.ten ? item.ten : ''} />
                        <TableCell type='checkbox' content={item.kichHoat} permission={permission}
                            onChanged={value => this.props.updateDmChucVu(item.ma, { kichHoat: value ? 1 : 0, })} />
                        <TableCell type='buttons' content={item} permission={permission}
                            onEdit={() => this.modal.show(item)} onDelete={this.delete} />
                    </tr>)
            });
        }

        return this.renderPage({
            icon: 'fa fa-list-alt',
            title: 'Danh mục Trình độ lý luận chính trị',
            breadcrumb: [
                <Link key={0} to='/user/category'>Danh mục</Link>,
                'Danh mục Trình độ lý luận chính trị'
            ],
            content: <>
                <div className='tile'>{table}</div>
                <EditModal ref={e => this.modal = e} permission={permission}
                    create={this.props.createDmTrinhDoLyLuanChinhTri} update={this.props.updateDmTrinhDoLyLuanChinhTri} permissions={currentPermissions} />
            </>,
            backRoute: '/user/category',
            onCreate: permission && permission.write ? (e) => this.showModal(e) : null,
        });
    }
}

const mapStateToProps = state => ({ system: state.system, dmTrinhDoLyLuanChinhTri: state.danhMuc.dmTrinhDoLyLuanChinhTri });
const mapActionsToProps = { getDmTrinhDoLyLuanChinhTriAll, deleteDmTrinhDoLyLuanChinhTri, createDmTrinhDoLyLuanChinhTri, updateDmTrinhDoLyLuanChinhTri };
export default connect(mapStateToProps, mapActionsToProps)(DmTrinhDoLyLuanChinhTriPage);
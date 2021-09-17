import React from 'react';
import { connect } from 'react-redux';
import { getDmGioiTinhAll, createDmGioiTinh, updateDmGioiTinh, deleteDmGioiTinh } from './redux';
import { Link } from 'react-router-dom';
import { AdminPage, AdminModal, TableCell, renderTable, FormTextBox, FormCheckbox } from 'view/component/AdminPage';

class EditModal extends AdminModal {
    state = { kichHoat: true, visible: false }

    componentDidMount() {
        $(document).ready(() => this.onShown(() => {
            !this.ma.value() ? this.ma.focus() : this.ten.focus();
        }));
    }

    onShow = (item) => {
        let { ma, ten, kichHoat } = item ? item : { ma: null, ten: '', kichHoat: true };
        ten = T.language.parse(ten, true);
        this.ma.value(ma);
        this.tenvi.value(ten.vi);
        this.tenen.value(ten.en);
        this.setState({ kichHoat, visible: false });
    };

    changeKichHoat = value => this.kichHoat.value(value ? 1 : 0) || this.kichHoat.value(value);

    onSubmit = (e) => {
        e.preventDefault();
        const
            changes = {
                ma: this.ma.value().trim(),
                ten: JSON.stringify({ vi: this.tenvi.val().trim(), en: this.tenen.val().trim() }),
                kichHoat: Number(this.state.kichHoat),
            };
        if (changes.ma == '') {
            T.notify('Mã giới tính bị trống!', 'danger');
            this.ma.focus();
        } else if (this.tenvi.value() == '') {
            T.notify('Tên giới tính bị trống!', 'danger');
            this.tenvi.focus();
        } else if (this.tenen.val() == '') {
            T.notify('Tên giới tính tiếng Anh bị trống!', 'danger');
            this.tenen.focus();
        } else if (changes.ma.length != 2) {
            this.setState({ visible: true });
        } else {
            this.state.ma ? this.props.update(this.state.ma, changes, this.hide) : this.props.create(changes, this.hide);
        }
    };

    render = () => {
        const readOnly = this.props.readOnly;
        let help = this.state.visible ? <small id='maHelp' className='form-text text-muted'>Mã giới tính chỉ gồm 2 kí tự</small> : null;
        return this.renderModal({
            title: this.state.ma ? 'Cập nhật giới tính' : 'Tạo mới giới tính',
            body: <div className='row'>
                <FormTextBox className='col-md-12' ref={e => this.ma = e} label='Mã giới tính' placeholder='Mã giới tính' readOnly={this.state.ma ? true : readOnly} smallText={help} required />
                <FormTextBox type='text' className='col-md-12' ref={e => this.tenvi = e} label='Tên giới tính' readOnly={readOnly} required />
                <FormTextBox type='text' className='col-md-12' ref={e => this.tenen = e} label='Tên giới tính tiếng Anh' readOnly={readOnly} required />
                <FormCheckbox className='col-md-6' ref={e => this.kichHoat = e} label='Kích hoạt' isSwitch={true} readOnly={readOnly} onChange={value => this.changeKichHoat(value ? 1 : 0)} />
                <FormTextBox type='text' className='col-md-12' ref={e => this.ghiChu = e} label='Ghi chú' readOnly={readOnly} />
            </div>
        });
    }
}

class dmGioiTinhPage extends AdminPage {

    componentDidMount() {
        T.ready('/user/category', () => {
            T.onSearch = (searchText) => this.props.getDmGioiTinhAll(undefined, undefined, searchText || '');
            T.showSearchBox();
            this.props.getDmGioiTinhAll();
        });
    }

    showModal = (e) => {
        e.preventDefault();
        this.modal.show();
    };

    delete = (e, item) => {
        e.preventDefault();
        T.confirm('Giới tính', 'Bạn có chắc bạn muốn xóa giới tính này?', 'warning', true, isConfirm =>
            isConfirm && this.props.deleteDmGioiTinh(item.ma));
    };

    render() {
        const currentPermissions = this.props.system && this.props.system.user && this.props.system.user.permissions ? this.props.system.user.permissions : [],
            permission = this.getUserPermission('dmGioiTinh', ['read', 'write', 'delete']);
        let table = 'Không có dữ liệu!',
            items = this.props.dmGioiTinh && this.props.dmGioiTinh.items;
        if (items && items.length > 0) {
            table = renderTable({
                getDataSource: () => items, stickyHead: false,
                renderHead: () => (
                    <tr>
                        <th style={{ width: 'auto' }}>Mã</th>
                        <th style={{ width: '50%' }}>Tên</th>
                        <th style={{ width: '50%' }} nowrap='true'>Tên tiếng Anh</th>
                        <th style={{ width: 'auto' }} nowrap='true'>Kích hoạt</th>
                        <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Thao tác</th>
                    </tr>),
                renderRow: (item, index) => (
                    <tr key={index}>
                        <TableCell type='link' content={item.ma ? item.ma : ''} onClick={() => this.modal.show(item)} />
                        <TableCell type='text' content={T.language.parse(item.ten, true).vi} />
                        <TableCell type='text' content={T.language.parse(item.ten, true).en} />
                        <TableCell type='checkbox' content={item.kichHoat} permission={permission}
                            onChanged={value => this.props.updateDmGioiTinh(item.ma, { kichHoat: value ? 1 : 0, })} />
                        <TableCell type='buttons' content={item} permission={permission}
                            onEdit={() => this.modal.show(item)} onDelete={this.delete} />
                    </tr>)
            });
        }

        return this.renderPage({
            icon: 'fa fa-list-alt',
            title: 'Danh mục Giới tính',
            breadcrumb: [
                <Link key={0} to='/user/category'>Danh mục</Link>,
                'Danh mục Giới tính'
            ],
            content: <>
                <div className='tile'>{table}</div>
                <EditModal ref={e => this.modal = e} permission={permission}
                    create={this.props.createDmGioiTinh} update={this.props.updateDmGioiTinh} permissions={currentPermissions} />
            </>,
            backRoute: '/user/category',
            onCreate: permission && permission.write ? (e) => this.showModal(e) : null,
            onImport: permission && permission.write ? (e) => e.preventDefault() || this.props.history.push('/user/danh-muc/gioi-tinh/upload') : null
        });
    }
}

const mapStateToProps = state => ({ system: state.system, dmGioiTinh: state.dmGioiTinh });
const mapActionsToProps = { getDmGioiTinhAll, createDmGioiTinh, updateDmGioiTinh, deleteDmGioiTinh };
export default connect(mapStateToProps, mapActionsToProps)(dmGioiTinhPage);
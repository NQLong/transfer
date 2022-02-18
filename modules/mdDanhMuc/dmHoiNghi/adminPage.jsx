import React from 'react';
import { connect } from 'react-redux';
import { getDmHoiNghiAll, deleteDmHoiNghi, createDmHoiNghi, updateDmHoiNghi } from './redux';
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
                ma: this.ma.value().trim(),
                ten: this.ten.value().trim(),
                kichHoat: Number(this.state.kichHoat),
            };
        if (changes.ma == '') {
            T.notify('Mã danh mục bị trống!');
            this.ma.focus();
        } else if (changes.ma != this.ma && this.props.dmHoiNghi.items.find(item => item.ma == changes.ma)) {
            T.notify('Mã danh mục đã tồn tại!');
            this.ma.focus();
        } else {
            this.state.ma ? this.props.update(this.state.ma, changes, this.hide) : this.props.create(changes, this.hide);
        }
    }

    render = () => {
        const readOnly = this.props.readOnly;
        return this.renderModal({
            title: this.state.ma ? 'Cập nhật hội nghị' : 'Tạo mới hội nghị',
            body: <div className='row'>
                <FormTextBox className='col-md-12' ref={e => this.ma = e} label='Mã' placeholder='Mã danh mục' maxLength={2} readOnly={this.state.ma ? true : readOnly} required />
                <FormTextBox type='text' className='col-md-12' ref={e => this.ten = e} label='Tên' placeholder='Tên' readOnly={readOnly} required />
                <FormCheckbox className='col-md-6' ref={e => this.kichHoat = e} label='Kích hoạt' isSwitch={true} readOnly={readOnly} onChange={value => this.changeKichHoat(value ? 1 : 0)} />
            </div>
        });
    }
}

class DmHoiNghiPage extends AdminPage {

    componentDidMount() {
        T.ready('/user/category', () => {
            T.onSearch = (searchText) => this.props.getDmHoiNghiAll(undefined, undefined, searchText || '');
            T.showSearchBox();
            this.props.getDmHoiNghiAll();
        });
    }

    showModal = (e) => {
        e.preventDefault();
        this.modal.show();
    }

    delete = (e, item) => {
        e.preventDefault();
        T.confirm('Xóa hội nghị', 'Bạn có chắc bạn muốn xóa danh mục này?', true, isConfirm =>
            isConfirm && this.props.deleteDmHoiNghi(item.ma));
    }

    render() {
        const currentPermissions = this.props.system && this.props.system.user && this.props.system.user.permissions ? this.props.system.user.permissions : [],
            permission = this.getUserPermission('dmHoiNghi', ['read', 'write', 'delete']);
        let table = 'Không có danh sách!',
            items = this.props.dmHoiNghi && this.props.dmHoiNghi.items ? this.props.dmHoiNghi.items : [];
        if (items && items.length > 0) {
            items.sort((a, b) => a.ma < b.ma ? -1 : 1);
            table = renderTable({
                getDataSource: () => items, stickyHead: false,
                renderHead: () => (
                    <tr>
                        <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                        <th style={{ width: 'auto' }}>Mã</th>
                        <th style={{ width: '100%' }}>Tên</th>
                        <th style={{ width: 'auto' }} nowrap='true'>Kích hoạt</th>
                        <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Thao tác</th>
                    </tr>),
                renderRow: (item, index) => (
                    <tr key={index}>
                        <TableCell type='text' content={index + 1} />
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
                title: 'Danh mục Hội nghị',
                breadcrumb: [
                    <Link key={0} to='/user/category'>Danh mục</Link>,
                    'Danh mục Hội nghị'
                ],
                content: <>
                    <div className='tile'>{table}</div>
                    <EditModal ref={e => this.modal = e} permission={permission}
                        create={this.props.createDmHoiNghi} update={this.props.updateDmHoiNghi} permissions={currentPermissions} />
                </>,
                backRoute: '/user/category',
                onCreate: permission && permission.write ? (e) => this.showModal(e) : null,
                onImport: permission && permission.write ? (e) => e.preventDefault() || this.props.history.push('/user/danh-muc/hoi-nghi/upload') : null
        });
    }
}

const mapStateToProps = state => ({ system: state.system, dmHoiNghi: state.danhMuc.dmHoiNghi });
const mapActionsToProps = { getDmHoiNghiAll, deleteDmHoiNghi, createDmHoiNghi, updateDmHoiNghi };
export default connect(mapStateToProps, mapActionsToProps)(DmHoiNghiPage);
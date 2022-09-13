import React from 'react';
import { connect } from 'react-redux';
import { getDmQuanHeGiaDinhPage, createDmQuanHeGiaDinh, updateDmQuanHeGiaDinh, deleteDmQuanHeGiaDinh } from './redux';
import Pagination from 'view/component/Pagination';
import { Link } from 'react-router-dom';
import { AdminPage, AdminModal, TableCell, renderTable, FormTextBox, FormCheckbox } from 'view/component/AdminPage';

const classifyRelation = {
    0: 'Gia đình',
    1: 'Huyết thống',
    2: 'Gia đình vợ/chồng'
};
class EditModal extends AdminModal {
    state = { kichHoat: true, visible: false };

    componentDidMount() {
        $(document).ready(() => this.onShown(() => {
            !this.ma.value() ? this.ma.focus() : this.ten.focus();
        }));
    }

    onShow = (item) => {
        let { ma, ten, kichHoat } = item ? item : { ma: null, ten: '', kichHoat: 1 };
        this.ma.value(ma);
        this.ten.value(ten);
        this.setState({ kichHoat, visible: false });
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
            T.notify('Mã quan hệ gia đình sách bị trống!', 'danger');
            this.ma.focus();
        } else if (changes.ten == '') {
            T.notify('Tên quan hệ gia đình bị trống!', 'danger');
            this.ten.focus();
        } else if (changes.ma.length != 2) {
            this.setState({ visible: true });
        } else {
            this.state.ma ? this.props.update(this.state.ma, changes, this.hide) : this.props.create(changes, this.hide);
        }
    };

    render() {
        const readOnly = this.props.readOnly;
        // let help = this.state.visible ? <small id='maHelp' className='form-text text-muted'>Mã quan hệ gia đình chỉ gồm 2 kí tự</small> : null;
        return (this.renderModal({
            title: this.state.ma ? 'Cập nhật quan hệ gia đình' : 'Tạo mới quan hệ gia đình',
            body: <div className='row'>
                <FormTextBox className='col-md-12' ref={e => this.ma = e} label='Mã quan hệ gia đình' readOnly={this.state.ma ? true : readOnly} required />
                <FormTextBox type='text' className='col-md-12' ref={e => this.ten = e} label='Tên quan hệ gia đình' readOnly={readOnly} required />
                <FormCheckbox className='col-md-6' ref={e => this.kichHoat = e} label='Kích hoạt' isSwitch={true} readOnly={readOnly} onChange={value => this.changeKichHoat(value ? 1 : 0)} />
            </div>
        }));
    }
}

class DmQuanHeGiaDinhPage extends AdminPage {
    state = { searching: false };

    componentDidMount() {
        T.ready('/user/category', () => {
            T.onSearch = (searchText) => this.props.getDmQuanHeGiaDinhPage(undefined, undefined, searchText || '');
            T.showSearchBox();
            this.props.getDmQuanHeGiaDinhPage();
        });
    }

    edit = (e) => {
        e.preventDefault();
        this.modal.show();
    };

    delete = (e, item) => {
        e.preventDefault();
        T.confirm('Quan hệ gia đình', 'Bạn có chắc bạn muốn xóa quan hệ gia đình này?', 'warning', true, isConfirm =>
            isConfirm && this.props.deleteDmQuanHeGiaDinh(item.ma));
    };

    render() {
        const currentPermissions = this.props.system && this.props.system.user && this.props.system.user.permissions ? this.props.system.user.permissions : [],
            permission = this.getUserPermission('dmQuanHeGiaDinh', ['read', 'write', 'delete']);
        let { pageNumber, pageSize, pageTotal, totalItem, list } = this.props.dmQuanHeGiaDinh && this.props.dmQuanHeGiaDinh.page ?
            this.props.dmQuanHeGiaDinh.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, pageCondition: {}, list: [] };
        let table = 'Không có dữ liệu!';
        if (list && list.length > 0) {
            table = renderTable({
                getDataSource: () => list, stickyHead: false,
                renderHead: () => (
                    <tr>
                        <th style={{ width: 'auto' }}>Mã</th>
                        <th style={{ width: '100%' }}>Tên</th>
                        <th style={{ width: 'auto' }}>Loại</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Kích hoạt</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Thao tác</th>
                    </tr>),
                renderRow: (item, index) => (
                    <tr key={index}>
                        <TableCell type='link' content={item.ma ? item.ma : ''} onClick={() => this.modal.show(item)} />
                        <TableCell type='text' content={item.ten ? item.ten : ''} />
                        <TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={item.loai != null ? classifyRelation[item.loai] : ''} />
                        <TableCell type='checkbox' content={item.kichHoat} permission={permission}
                            onChanged={value => this.props.updateDmQuanHeGiaDinh(item.ma, { kichHoat: value ? 1 : 0, })} />
                        <TableCell type='buttons' content={item} permission={permission}
                            onEdit={() => this.modal.show(item)} onDelete={this.delete} />
                    </tr>)
            });
        }

        return this.renderPage({
            icon: 'fa fa-list-alt',
            title: 'Danh mục Quan hệ gia đình',
            breadcrumb: [
                <Link key={0} to='/user/category'>Danh mục</Link>,
                'Danh mục Quan hệ gia đình'
            ],
            content: <>
                <div className='tile'>{table}</div>
                <Pagination style={{ marginLeft: '65px' }} {...{ pageNumber, pageSize, pageTotal, totalItem }} getPage={this.props.getDmQuanHeGiaDinhPage} />
                <EditModal ref={e => this.modal = e} permission={permission}
                    create={this.props.createDmQuanHeGiaDinh} update={this.props.updateDmQuanHeGiaDinh} permissions={currentPermissions} />
            </>,
            backRoute: '/user/category',
            onCreate: permission && permission.write ? (e) => this.showModal(e) : null,
        });
    }
}

const mapStateToProps = state => ({ system: state.system, dmQuanHeGiaDinh: state.danhMuc.dmQuanHeGiaDinh });
const mapActionsToProps = { getDmQuanHeGiaDinhPage, createDmQuanHeGiaDinh, updateDmQuanHeGiaDinh, deleteDmQuanHeGiaDinh };
export default connect(mapStateToProps, mapActionsToProps)(DmQuanHeGiaDinhPage);
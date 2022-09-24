import React from 'react';
import { connect } from 'react-redux';
import { getDmKhuVucPage, createDmKhuVuc, updateDmKhuVuc, deleteDmKhuVuc } from './redux';
import { getDmChauAll } from 'modules/mdDanhMuc/dmChau/redux';
import Pagination from 'view/component/Pagination';
import { Link } from 'react-router-dom';
import { AdminPage, TableCell, renderTable, AdminModal, FormTextBox, FormCheckbox, FormSelect } from 'view/component/AdminPage';

class EditModal extends AdminModal {
    chauTable = [];
    componentDidMount() {
        $(document).ready(() => this.onShown(() => {
            !this.ma.value() ? this.ma.focus() : this.ten.focus();
        }));
        this.props.getDataSelect(items => {
            if (items) {
                this.chauTable = [];
                items.forEach(item => this.chauTable.push({ 'id': item.ma, 'text': item.ten }));
            }

        });
    }

    onShow = (item) => {
        let { ma, ten, kichHoat, territory, maChau } = item ? item : { ma: '', ten: '', kichHoat: true, territory: '', maChau: '' };
        this.setState({ ma, item });
        this.ma.value(ma);
        this.ten.value(ten);
        this.territory.value(territory ? territory : '');
        this.kichHoat.value(kichHoat ? 1 : 0);
        this.maChau.value(maChau);
    };

    changeKichHoat = value => this.kichHoat.value(value ? 1 : 0) || this.kichHoat.value(value);

    onSubmit = (e) => {
        e.preventDefault();
        const changes = {
            ma: this.ma.value(),
            ten: this.ten.value(),
            territory: this.territory.value(),
            maChau: this.maChau.value(),
            kichHoat: this.kichHoat.value() ? 1 : 0,
        };
        if (!this.state.ma && !this.ma.value()) {
            T.notify('Mã không được trống!', 'danger');
            this.ma.focus();
        } else if (!changes.ten) {
            T.notify('Tên không được trống!', 'danger');
            this.ten.focus();
        } else if (!changes.territory) {
            T.notify('Tên tiếng anh không được trống!', 'danger');
            this.territory.focus();
        }
        else {
            this.state.ma ? this.props.update({ ma: this.state.ma }, changes, this.hide) : this.props.create(changes, this.hide);
        }
    };

    render = () => {
        const readOnly = this.props.readOnly;
        return this.renderModal({
            title: this.ma ? 'Cập nhật khu vực' : 'Tạo mới khu vực',
            size: 'large',
            body: <div className='row'>
                <FormTextBox type='text' className='col-12 col-md-6' ref={e => this.ma = e} label='Mã khu vực' readOnly={this.state.ma ? true : readOnly} placeholder='Mã khu vực' required />
                <FormTextBox type='text' className='col-12 col-md-6' ref={e => this.ten = e} label='Tên khu vực' readOnly={readOnly} placeholder='Tên khu vực' required />
                <FormTextBox type='text' className='col-12 col-md-6' ref={e => this.territory = e} label='Tên tiếng Anh' readOnly={readOnly} placeholder='Tên tiếng Anh' required />
                <FormSelect className='col-12 col-md-6' ref={e => this.maChau = e} data={this.chauTable} label='Châu' required />
                <FormCheckbox className='col-md-6' ref={e => this.kichHoat = e} label='Kích hoạt' isSwitch={true} readOnly={readOnly} style={{ display: 'inline-flex', margin: 0 }}
                    onChange={value => this.changeKichHoat(value ? 1 : 0)} />
            </div>
        }
        );
    }
}

class dmKhuVucAdminPage extends AdminPage {
    state = { searching: true };
    chauMapper = {};

    componentDidMount() {
        this.props.getDmChauAll(items => {
            if (items) {
                this.chauMapper = {};
                items.forEach(item => this.chauMapper[item.ma] = item.ten);
            }
        });
        T.ready('/user/category', () => {
            T.onSearch = (searchText) => this.props.getDmKhuVucPage(undefined, undefined, searchText || '');
            T.showSearchBox();
            this.props.getDmKhuVucPage();
        });
    }

    showModal = (e) => {
        e.preventDefault();
        this.modal.show();
    }

    delete = (e, item) => {
        T.confirm('Xóa Khu vực', `Bạn có chắc bạn muốn xóa Khu vực ${item.ten ? `<b>${item.ten}</b>` : 'này'}?`, 'warning', true, isConfirm => {
            isConfirm && this.props.deleteDmKhuVuc(item.ma, error => {
                if (error) T.notify(error.message ? error.message : `Xoá Khu vực ${item.ten} bị lỗi!`, 'danger');
                else T.alert(`Xoá Khu vực ${item.ten} thành công!`, 'success', false, 800);
            });
        });
        e.preventDefault();
    }

    render() {
        const currentPermissions = this.props.system && this.props.system.user && this.props.system.user.permissions ? this.props.system.user.permissions : [],
            permission = this.getUserPermission('dmKhuVuc', ['read', 'write', 'delete']);
        let { pageNumber, pageSize, pageTotal, totalItem, pageCondition, list } = this.props.dmKhuVuc && this.props.dmKhuVuc.page ?
            this.props.dmKhuVuc.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, pageCondition: '', list: [] };
        let table = 'Không có dữ liệu!';
        if (list && list.length > 0) {
            table = renderTable({
                getDataSource: () => list, stickyHead: false,
                renderHead: () => (
                    <tr>
                        <th style={{ width: 'auto' }}>Mã</th>
                        <th style={{ width: '50%', whiteSpace: 'nowrap' }}>Tên khu vực</th>
                        <th style={{ width: '50%', whiteSpace: 'nowrap' }}>Tên tiếng Anh</th>
                        <th style={{ width: 'auto' }} >Châu</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Kích hoạt</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Thao tác</th>
                    </tr>),
                renderRow: (item, index) => (
                    <tr key={index}>
                        <TableCell type='text' content={item.ma ? item.ma : ''} />
                        <TableCell type='link' content={item.ten ? item.ten : ''} onClick={() => this.modal.show(item)} />
                        <TableCell type='text' content={item.territory ? item.territory : ''} />
                        <TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={this.chauMapper && this.chauMapper[item.maChau] ? this.chauMapper[item.maChau] : ''} />
                        <TableCell type='checkbox' content={item.kichHoat} permission={permission}
                            onChanged={value => this.props.updateDmKhuVuc({ ma: item.ma }, { kichHoat: value ? 1 : 0 })} />
                        <TableCell type='buttons' content={item} permission={permission}
                            onEdit={() => this.modal.show(item)} onDelete={this.delete} />
                    </tr>
                ),
            });
        }

        return this.renderPage({
            icon: 'fa fa-list-alt',
            title: 'Khu vực',
            breadcrumb: [
                <Link key={0} to='/user/category'>Danh mục</Link>,
                'Khu vực'
            ],
            content: <>
                <div className='tile'>{table}</div>
                <Pagination style={{ marginLeft: '65px' }} {...{ pageNumber, pageSize, pageTotal, totalItem, pageCondition }} getPage={this.props.getDmKhuVucPage} />
                <EditModal ref={e => this.modal = e} permission={permission} getDataSelect={this.props.getDmChauAll}
                    create={this.props.createDmKhuVuc} update={this.props.updateDmKhuVuc} permissions={currentPermissions} />
            </>,
            backRoute: '/user/category',
            onCreate: permission && permission.write ? (e) => this.showModal(e) : null
        });
    }
}

const mapStateToProps = state => ({ system: state.system, dmKhuVuc: state.danhMuc.dmKhuVuc, dmChau: state.danhMuc.dmChau });
const mapActionsToProps = { getDmKhuVucPage, createDmKhuVuc, updateDmKhuVuc, deleteDmKhuVuc, getDmChauAll };
export default connect(mapStateToProps, mapActionsToProps)(dmKhuVucAdminPage);

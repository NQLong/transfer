import React from 'react';
import { connect } from 'react-redux';
import { getDmQuanHeChuHoPage, createDmQuanHeChuHo, updateDmQuanHeChuHo, deleteDmQuanHeChuHo } from './redux';
import Pagination from 'view/component/Pagination';
import { Link } from 'react-router-dom';
import { AdminPage, TableCell, renderTable, AdminModal, FormTextBox, FormCheckbox } from 'view/component/AdminPage';

class EditModal extends AdminModal {
    componentDidMount() {
        $(document).ready(() => this.onShown(() => {
            !this.ma.value() ? this.ma.focus() : this.ten.focus();
        }));
    }
    onShow = (item) => {
        let { ma, ten, kichHoat } = item ? item : { ma: '', ten: '', kichHoat: 1 };

        this.setState({ ma, item });

        this.ma.value(ma);
        this.ten.value(ten);
        this.kichHoat.value(kichHoat ? 1 : 0);
    };

    onSubmit = (e) => {
        e.preventDefault();
        const changes = {
            ma: this.ma.value(),
            ten: this.ten.value(),
            kichHoat: this.kichHoat.value() ? 1 : 0,
        };
        if (!this.state.ma && !this.ma.value()) {
            T.notify('Mã không được trống!', 'danger');
            this.ma.focus();
        } else if (changes.ten == '') {
            T.notify('Tên không được bị trống!', 'danger');
            this.ten.focus();
        } else {
            this.state.ma ? this.props.update(this.state.ma, changes, this.hide) : this.props.create(changes, this.hide);
        }
    };

    changeKichHoat = value => this.kichHoat.value(value ? 1 : 0) || this.kichHoat.value(value);

    render = () => {
        const readOnly = this.props.readOnly;
        return this.renderModal({
            title: this.state.ma ? 'Tạo mới quan hệ chủ hộ' : 'Cập nhật quan hệ chủ hộ',
            body: <div className='row'>
                <FormTextBox type='text' className='col-12' ref={e => this.ma = e} label='Mã' readOnly={this.state.ma ? true : readOnly} placeholder='Mã quan hệ chủ hộ' required />
                <FormTextBox type='text' className='col-12' ref={e => this.ten = e} label='Tên' readOnly={readOnly} placeholder='Tên quan hệ chủ hộ' required />
                <FormCheckbox className='col-md-6' ref={e => this.kichHoat = e} label='Kích hoạt' isSwitch={true} readOnly={readOnly} style={{ display: 'inline-flex', margin: 0 }}
                    onChange={value => this.changeKichHoat(value ? 1 : 0)} />
            </div>
        }
        );
    }
}

class dmQuanHeChuHoPage extends AdminPage {
    state = { searching: false };

    componentDidMount() {
        T.ready('/user/category', () => {
            T.onSearch = (searchText) => this.props.getDmQuanHeChuHoPage(undefined, undefined, searchText || '');
            T.showSearchBox();
            this.props.getDmQuanHeChuHoPage();
        });
    }

    showModal = (e) => {
        e.preventDefault();
        this.modal.show();
    }

    delete = (e, item) => {
        T.confirm('Xóa Quan hệ chủ hộ', `Bạn có chắc bạn muốn xóa Quan hệ chủ hộ ${item.ten ? `<b>${item.ten}</b>` : 'này'}?`, 'warning', true, isConfirm => {
            isConfirm && this.props.deleteDmQuanHeChuHo(item.ma, error => {
                if (error) T.notify(error.message ? error.message : `Xoá Quan hệ chủ hộ ${item.ten} bị lỗi!`, 'danger');
                else T.alert(`Xoá Quan hệ chủ hộ ${item.ten} thành công!`, 'success', false, 800);
            });
        });
        e.preventDefault();
    }

    render() {
        const currentPermissions = this.props.system && this.props.system.user && this.props.system.user.permissions ? this.props.system.user.permissions : [],
            permission = this.getUserPermission('dmQuanHeChuHo', ['read', 'write', 'delete']);
        let { pageNumber, pageSize, pageTotal, totalItem, pageCondition, list } = this.props.dmQuanHeChuHo && this.props.dmQuanHeChuHo.page ?
            this.props.dmQuanHeChuHo.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, pageCondition: '', list: [] };

        const table = !(list && list.length > 0) ? 'Không có dữ liệu Quan hệ chủ hộ' :
            renderTable({
                getDataSource: () => list, stickyHead: false,
                renderHead: () => (
                    <tr>
                        <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                        <th style={{ width: 'auto' }}>Mã</th>
                        <th style={{ width: '100%' }}>Tên</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Kích hoạt</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Thao tác</th>
                    </tr>),
                renderRow: (item, index) => (
                    <tr key={index}>
                        <TableCell type='number' content={(pageNumber - 1) * pageSize + index + 1} style={{ textAlign: 'right' }} />
                        <TableCell type='link' content={item.ma} onClick={() => this.modal.show(item)} />
                        <TableCell type='text' content={item.ten} />
                        <TableCell type='checkbox' content={item.kichHoat} permission={permission}
                            onChanged={value => this.props.updateDmQuanHeChuHo(item.ma, { kichHoat: value ? 1 : 0, })} />
                        <TableCell type='buttons' content={item} permission={permission}
                            onEdit={() => this.modal.show(item)} onDelete={this.delete} />
                    </tr>
                ),
            });
        return this.renderPage({
            icon: 'fa fa-list-alt',
            title: 'Quan hệ chủ hộ',
            breadcrumb: [
                <Link key={0} to='/user/category'>Danh mục</Link>,
                'Quan hệ chủ hộ'
            ],
            content: <>
                <div className='tile'>{table}</div>
                <Pagination style={{ marginLeft: '65px' }} {...{ pageNumber, pageSize, pageTotal, totalItem, pageCondition }} getPage={this.props.getDmQuanHeChuHoPage} />
                <EditModal ref={e => this.modal = e} permission={permission}
                    create={this.props.createDmQuanHeChuHo} update={this.props.updateDmQuanHeChuHo} permissions={currentPermissions} />
            </>,
            backRoute: '/user/category',
            onCreate: permission && permission.write ? (e) => this.showModal(e) : null
        });

    }
}

const mapStateToProps = state => ({ system: state.system, dmQuanHeChuHo: state.danhMuc.dmQuanHeChuHo });
const mapActionsToProps = { getDmQuanHeChuHoPage, createDmQuanHeChuHo, updateDmQuanHeChuHo, deleteDmQuanHeChuHo };
export default connect(mapStateToProps, mapActionsToProps)(dmQuanHeChuHoPage);

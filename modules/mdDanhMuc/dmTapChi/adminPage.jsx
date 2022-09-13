import React from 'react';
import { connect } from 'react-redux';
import { getDmTapChiPage, getDmTapChiAll, deleteDmTapChi, createDmTapChi, updateDmTapChi } from './redux';
import { Link } from 'react-router-dom';
import Pagination from 'view/component/Pagination';
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
        this.setState({ ma, item });
        this.ma.value(ma);
        this.ten.value(ten ? ten : '');
        this.kichHoat.value(kichHoat);
    };

    onSubmit = (e) => {
        e.preventDefault();
        const changes = {
            ma: this.ma.value(),
            ten: this.ten.value(),
            kichHoat: this.kichHoat.value() ? 1 : 0
        };
        if (changes.ma == '') {
            T.notify('Mã danh mục bị trống!');
            this.ma.focus();
        } else if (changes.ma != this.state.ma && this.props.dmTapChi.page.list.find(item => item.ma == changes.ma)) {
            T.notify('Mã danh mục đã tồn tại!');
            this.ma.focus();
        } else {
            this.state.ma ? this.props.update(this.state.ma, changes, this.hide) : this.props.create(changes, this.hide);
        }
    }
    changeKichHoat = value => this.kichHoat.value(value ? 1 : 0) || this.kichHoat.value(value);

    render = () => {
        const readOnly = this.props.readOnly;
        return this.renderModal({
            title: this.state.ma ? 'Cập nhật danh mục tạp chí' : 'Tạo mới danh mục tạp chí',
            body: <div className='row'>
                <FormTextBox type='text' className='col-md-6' maxLength={2} ref={e => this.ma = e} label='Mã' readOnly={this.state.ma ? true : readOnly} required />
                <FormTextBox type='text' className='col-md-12' ref={e => this.ten = e} label='Tên tạp chí' readOnly={readOnly} />
                <FormCheckbox className='col-md-6' ref={e => this.kichHoat = e} label='Kích hoạt' isSwitch={true} readOnly={readOnly} style={{ display: 'inline-flex', margin: 0 }} onChange={value => this.changeKichHoat(value ? 1 : 0)} />
            </div>
        });
    }
}

class DmTapChiPage extends AdminPage {
    componentDidMount() {
        T.ready('/user/category', () => {
            T.onSearch = (searchText) => this.props.getDmTapChiPage(undefined, undefined, searchText || '');
            T.showSearchBox();
            this.props.getDmTapChiPage();
        });
    }

    showModal = (e) => {
        e.preventDefault();
        this.modal.show();
    }

    changeActive = item => this.props.updateDmTapChi(item.ma, { kichHoat: Number(!item.kichHoat) })

    delete = (e, item) => {
        e.preventDefault();
        T.confirm('Xóa tạp chí', 'Bạn có chắc bạn muốn xóa danh mục này?', true, isConfirm =>
            isConfirm && this.props.deleteDmTapChi(item.ma));
    }

    render() {
        const currentPermissions = this.props.system && this.props.system.user && this.props.system.user.permissions ? this.props.system.user.permissions : [],
            permission = this.getUserPermission('dmTapChi', ['read', 'write', 'delete']);
        const { pageNumber, pageSize, pageTotal, totalItem, pageCondition, list } = this.props.dmTapChi && this.props.dmTapChi.page ?
            this.props.dmTapChi.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, list: null };
        let table = 'Không có danh sách!';
        if (list && list.length > 0) {
            list.sort((a, b) => a.ma < b.ma ? -1 : 1);
            table = renderTable({
                getDataSource: () => list, stickyHead: false,
                renderHead: () => (
                    <tr>
                        <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                        <th style={{ width: 'auto' }}>Mã</th>
                        <th style={{ width: '100%' }}>Tên</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Kích hoạt</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Thao tác</th>
                    </tr>
                ),
                renderRow: (item, index) => (
                    <tr key={index}>
                        <TableCell type='number' style={{ textAlign: 'right' }} content={index + 1} />
                        <TableCell type='link' content={item.ma ? item.ma : ''} onClick={() => this.modal.show(item)} />
                        <TableCell type='text' content={item.ten ? item.ten : ''} />
                        <TableCell type='checkbox' style={{ textAlign: 'center' }} content={item.kichHoat} permission={permission} onChanged={() => this.changeActive(item)} />
                        <TableCell type='buttons' style={{ textAlign: 'center' }} content={item} permission={permission} onEdit={() => this.modal.show(item)} onDelete={e => this.delete(e, item)} />
                    </tr>
                )
            });
        }
        return this.renderPage({
            icon: 'fa fa-list-alt',
            title: 'Danh mục Tạp chí',
            breadcrumb: [
                <Link key={0} to='/user/category'>Danh mục</Link>,
                'Danh mục Tạp chí'
            ],
            content: <>
                <div className='tile'>{table}</div>
                <Pagination style={{ marginLeft: '70px' }} {...{ pageNumber, pageSize, pageTotal, totalItem, pageCondition }} getPage={this.props.getDmTapChiPage} />
                <EditModal ref={e => this.modal = e} permission={permission} dmTapChi={this.props.dmTapChi} create={this.props.createDmTapChi} update={this.props.updateDmTapChi} permissions={currentPermissions} />
            </>,
            backRoute: '/user/category',
            onCreate: permission && permission.write ? (e) => this.showModal(e) : null
        });
    }
}

const mapStateToProps = state => ({ system: state.system, dmTapChi: state.danhMuc.dmTapChi });
const mapActionsToProps = { getDmTapChiPage, getDmTapChiAll, deleteDmTapChi, createDmTapChi, updateDmTapChi };
export default connect(mapStateToProps, mapActionsToProps)(DmTapChiPage);

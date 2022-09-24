import React from 'react';
import { connect } from 'react-redux';
import { createDmHinhThucKyLuat, getDmHinhThucKyLuatAll, updateDmHinhThucKyLuat, deleteDmHinhThucKyLuat, getDmHinhThucKyLuatPage } from './reduxHinhThucKyLuat';
import { Link } from 'react-router-dom';
import { AdminPage, AdminModal, TableCell, renderTable, FormTextBox, FormCheckbox } from 'view/component/AdminPage';
import Pagination from 'view/component/Pagination';

class EditModal extends AdminModal {
    state = { active: true };

    componentDidMount() {
        $(document).ready(() => this.onShown(() => {
            !this.ma.value() ? this.ma.focus() : this.dienGiai.focus();
        }));
    }

    onShow = (item) => {
        const { ma, dienGiai, kichHoat, ghiChu } = item ? item : { ma: null, dienGiai: '', kichHoat: 0, ghiChu: '' };
        this.setState({ ma, item });
        this.ma.value(ma ? ma : '');
        this.dienGiai.value(dienGiai);
        this.kichHoat.value(kichHoat);
        this.ghiChu.value(ghiChu ? ghiChu : '');
    }

    onSubmit = (e) => {
        e.preventDefault();
        const changes = {
            dienGiai: this.dienGiai.value(),
            ma: this.ma.value(),
            ghiChu: this.ghiChu.value(),
            kichHoat: this.kichHoat.value() ? 1 : 0,
        };

        if (changes.dienGiai == '') {
            T.notify('Tên Hình thức kỷ luật bị trống!', 'danger');
            this.dienGiai.focus();
        } else {
            this.state.ma ? this.props.update(this.state.ma, changes, this.hide) : this.props.create(changes, this.hide);
        }
    }

    changeKichHoat = value => this.kichHoat.value(value ? 1 : 0) || this.kichHoat.value(value);

    render = () => {
        const readOnly = this.props.readOnly;
        return this.renderModal({
            title: this.state.ma ? 'Cập nhật hình thức kỷ luật' : 'Tạo mới hình thức kỷ luật',
            body: <div className='row'>
                <FormTextBox type='number' className='col-md-6' ref={e => this.ma = e} label='Mã hình thức kỷ luật'
                    readOnly={this.state.ma ? true : readOnly} />
                <FormTextBox type='text' className='col-md-12' ref={e => this.dienGiai = e} label='Tên hình thức kỷ luật'
                    readOnly={readOnly} required />
                <FormCheckbox className='col-md-6' ref={e => this.kichHoat = e} label='Kích hoạt' isSwitch={true}
                    readOnly={readOnly} style={{ display: 'inline-flex', margin: 0 }}
                    onChange={value => this.changeKichHoat(value ? 1 : 0)} />
                <FormTextBox type='text' className='col-md-12' ref={e => this.ghiChu = e} label='Ghi chú'
                    rows={3} readOnly={readOnly} />
            </div>
        });
    }
}

class dmHinhThucKyLuatPage extends AdminPage {

    componentDidMount() {
        T.ready('/user/category', () => {
            T.onSearch = (searchText) => this.props.getDmHinhThucKyLuatPage(undefined, undefined, searchText || '');
            T.showSearchBox();
            this.props.getDmHinhThucKyLuatPage();
        });
    }

    showModal = (e) => {
        e.preventDefault();
        this.modal.show();
    }

    changeActive = item => this.props.updateDmHinhThucKyLuat(item.ma, { ma: item.ma, kichHoat: item.kichHoat == '1' ? '0' : '1' });

    delete = (e, item) => {
        e.preventDefault();
        T.confirm('Xóa danh mục Hình thức kỷ luật', 'Bạn có chắc bạn muốn xóa Hình thức kỷ luật này?', true, isConfirm =>
            isConfirm && this.props.deleteDmHinhThucKyLuat(item.ma));
    }

    render() {
        const currentPermissions = this.props.system && this.props.system.user && this.props.system.user.permissions ? this.props.system.user.permissions : [],
            permission = this.getUserPermission('dmHinhThucKyLuat', ['read', 'write', 'delete']);
        const { pageNumber, pageSize, pageTotal, totalItem, pageCondition, list } = this.props.dmHinhThucKyLuat && this.props.dmHinhThucKyLuat.page ?
            this.props.dmHinhThucKyLuat.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, list: null };
        let table = 'Không có danh sách Hình thức kỷ luật!';
        if (list && list.length > 0) {
            table = renderTable({
                getDataSource: () => list, stickyHead: false,
                renderHead: () => (
                    <tr>
                        <th style={{ width: 'auto' }}>Mã</th>
                        <th style={{ width: '100%' }}>Tên</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Kích hoạt</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Thao tác</th>
                    </tr>
                ),
                renderRow: (item, index) => (
                    <tr key={index} >
                        <TableCell type='link' style={{ textAlign: 'right' }} content={item.ma ? item.ma : ''}
                            onClick={() => this.modal.show(item)} />
                        <TableCell type='text' content={item.dienGiai ? item.dienGiai : ''} />
                        <TableCell type='checkbox' style={{ textAlign: 'center' }} content={item.kichHoat} permission={permission}
                            onChanged={() => this.changeActive(item)} />
                        <TableCell type='buttons' style={{ textAlign: 'center' }} content={item} permission={permission}
                            onEdit={() => this.modal.show(item)} onDelete={e => this.delete(e, item)} />
                    </tr>
                )
            });
        }

        return this.renderPage({
            icon: 'fa fa-list-alt',
            title: 'Danh mục Hình thức kỷ luật',
            breadcrumb: [
                <Link key={0} to='/user/category'>Danh mục</Link>,
                'Danh mục Hình thức kỷ luật'
            ],
            content: <>
                <div className='tile'>{table}</div>
                <Pagination style={{ marginLeft: '70px' }} {...{ pageNumber, pageSize, pageTotal, totalItem, pageCondition }}
                    getPage={this.props.getDmHinhThucKyLuatPage} />
                <EditModal ref={e => this.modal = e} permission={permission}
                    create={this.props.createDmHinhThucKyLuat} update={this.props.updateDmHinhThucKyLuat} permissions={currentPermissions} />
            </>,
            backRoute: '/user/category',
            onCreate: permission && permission.write ? (e) => this.showModal(e) : null,
        });
    }
}

const mapStateToProps = state => ({ system: state.system, dmHinhThucKyLuat: state.danhMuc.dmHinhThucKyLuat });
const mapActionsToProps = { getDmHinhThucKyLuatAll, createDmHinhThucKyLuat, updateDmHinhThucKyLuat, deleteDmHinhThucKyLuat, getDmHinhThucKyLuatPage };
export default connect(mapStateToProps, mapActionsToProps)(dmHinhThucKyLuatPage);
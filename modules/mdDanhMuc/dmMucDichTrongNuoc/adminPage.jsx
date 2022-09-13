import React from 'react';
import { connect } from 'react-redux';
import { getDmMucDichTrongNuocPage, getDmMucDichTrongNuocAll, deleteDmMucDichTrongNuoc, createDmMucDichTrongNuoc, updateDmMucDichTrongNuoc } from './redux';
import { Link } from 'react-router-dom';
import { AdminPage, AdminModal, TableCell, renderTable, FormTextBox, FormCheckbox } from 'view/component/AdminPage';
import Pagination from 'view/component/Pagination';

class EditModal extends AdminModal {
    state = { kichHoat: true };

    componentDidMount() {
        $(document).ready(() => this.onShown(() => {
            !this.ma.value() ? this.ma.focus() : this.moTa.focus();
        }));
    }

    onShow = (item) => {
        let { ma, moTa, kichHoat } = item ? item : { ma: '', moTa: '', kichHoat: true };
        this.setState({ ma, item });
        this.ma.value(ma);
        this.moTa.value(moTa);
        this.kichHoat.value(kichHoat);
    };

    onSubmit = (e) => {
        e.preventDefault();
        const changes = {
            ma: this.ma.value(),
            moTa: this.moTa.value(),
            kichHoat: this.kichHoat.value() ? 1 : 0,
        };
        if (changes.ma == '') {
            T.notify('Mã danh mục bị trống');
            this.ma.focus();
        } else if (changes.moTa == '') {
            T.notify('Mô tả danh mục bị trống');
            this.moTa.focus();
        } else {
            this.state.ma ? this.props.update(this.state.ma, changes, this.hide) : this.props.create(changes, this.hide);
        }
    }


    changeKichHoat = value => this.kichHoat.value(value ? 1 : 0) || this.kichHoat.value(value);

    render = () => {
        const readOnly = this.props.readOnly;
        return this.renderModal({
            title: this.state.ma ? 'Cập nhật mục đích đi công tác trong nước' : 'Tạo mới mục đích đi công tác trong nước',
            body: <div className='row'>
                <FormTextBox type='number' className='col-md-6' ref={e => this.ma = e} label='Mã'
                    readOnly={this.state.ma ? true : readOnly} required />
                <FormTextBox type='text' className='col-md-12' ref={e => this.moTa = e} label='Tên mô tả'
                    readOnly={readOnly} required />
                <FormCheckbox className='col-md-6' ref={e => this.kichHoat = e} label='Kích hoạt' isSwitch={true}
                    readOnly={readOnly} style={{ display: 'inline-flex', margin: 0 }}
                    onChange={value => this.changeKichHoat(value ? 1 : 0)} />
            </div>
        });
    }
}

class DmMucDichTrongNuocPage extends AdminPage {
    componentDidMount() {
        T.ready('/user/category', () => {
            T.onSearch = (searchText) => this.props.getDmMucDichTrongNuocPage(undefined, undefined, searchText || '');
            T.showSearchBox();
            this.props.getDmMucDichTrongNuocPage();
        });
    }
    showModal = (e) => {
        e.preventDefault();
        this.modal.show();
    }

    changeActive = item => this.props.updateDmMucDichTrongNuoc(item.ma, { kichHoat: Number(!item.kichHoat) });

    delete = (e, item) => {
        e.preventDefault();
        T.confirm('Xóa mục đích đi công tác trong nước', 'Bạn có chắc bạn muốn xóa Mục đích đi công tác trong nước này?', true, isConfirm =>
            isConfirm && this.props.deleteDmMucDichTrongNuoc(item.ma));
    }

    render() {
        const currentPermissions = this.props.system && this.props.system.user && this.props.system.user.permissions ? this.props.system.user.permissions : [],
            permission = this.getUserPermission('dmMucDichTrongNuoc', ['read', 'write', 'delete']);
        const { pageNumber, pageSize, pageTotal, totalItem, pageCondition, list } = this.props.dmMucDichTrongNuoc && this.props.dmMucDichTrongNuoc.page ?
            this.props.dmMucDichTrongNuoc.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, list: null };
        let table = 'Không có danh sách!';
        if (list && list.length > 0) {
            list.sort((a, b) => (a.ma < b.ma) ? -1 : 1);
            table = renderTable({
                getDataSource: () => list, stickyHead: false,
                renderHead: () => (
                    <tr>
                        <th style={{ width: 'auto' }}>Mã</th>
                        <th style={{ width: '100%' }}>Mô tả</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Kích hoạt</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Thao tác</th>
                    </tr>
                ),
                renderRow: (item, index) => (
                    <tr key={index} >
                        <TableCell type='text' style={{ textAlign: 'center' }} content={item.ma ? item.ma : ''} />
                        <TableCell type='link' content={item.moTa ? item.moTa : ''}
                            onClick={() => this.modal.show(item)} />
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
            title: 'Danh mục Mục đích đi công tác trong nước',
            breadcrumb: [
                <Link key={0} to='/user/category'>Danh mục</Link>,
                'Danh mục Mục đích đi công tác trong nước'
            ],
            content: <>
                <div className='tile'>{table}</div>
                <Pagination style={{ marginLeft: '70px' }} {...{ pageNumber, pageSize, pageTotal, totalItem, pageCondition }}
                    getPage={this.props.getDmMucDichTrongNuocPage} />
                <EditModal ref={e => this.modal = e} permission={permission}
                    create={this.props.createDmMucDichTrongNuoc} update={this.props.updateDmMucDichTrongNuoc} permissions={currentPermissions} />
            </>,
            backRoute: '/user/category',
            onCreate: permission && permission.write ? (e) => this.showModal(e) : null,
        });
    }
}

const mapStateToProps = state => ({ system: state.system, dmMucDichTrongNuoc: state.danhMuc.dmMucDichTrongNuoc });
const mapActionsToProps = { getDmMucDichTrongNuocPage, getDmMucDichTrongNuocAll, deleteDmMucDichTrongNuoc, createDmMucDichTrongNuoc, updateDmMucDichTrongNuoc };
export default connect(mapStateToProps, mapActionsToProps)(DmMucDichTrongNuocPage);

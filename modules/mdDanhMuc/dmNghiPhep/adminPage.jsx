import React from 'react';
import { connect } from 'react-redux';
import {
    getDmNghiPhepPage, createDmNghiPhep,
    getDmNghiPhep, updateDmNghiPhep,
    deleteDmNghiPhep
}
    from './redux';
import { Link } from 'react-router-dom';
import { AdminPage, AdminModal, TableCell, renderTable, FormTextBox } from 'view/component/AdminPage';
import Pagination from 'view/component/Pagination';

class EditModal extends AdminModal {
    state = { active: true };

    componentDidMount() {
        $(document).ready(() => this.onShown(() => {
            !this.ma.value() ? this.ma.focus() : this.ten.focus();
        }));
    }

    onShow = (item) => {
        const { ma, ten, soNgayPhep } = item ? item : { ma: null, ten: '', soNgayPhep: 0 };
        this.setState({ ma, item });
        this.ma.value(ma || '');
        this.ten.value(ten);
        this.soNgayPhep.value(soNgayPhep);
    }

    onSubmit = (e) => {
        const changes = {
            ten: this.ten.value(),
            ma: this.ma.value(),
            soNgayPhep: this.soNgayPhep.value(),
        };

        if (changes.ten == '') {
            T.notify('Tên nghỉ phép bị trống!', 'danger');
            this.ten.focus();
        } else {
            this.state.ma ? this.props.update(this.state.ma, changes, this.hide) : this.props.create(changes, this.hide);
        }
        e.preventDefault();
    }


    render = () => {
        const readOnly = this.props.readOnly;
        return this.renderModal({
            title: this.state.ma ? 'Cập nhật nghỉ phép' : 'Tạo mới nghỉ phép',
            body: <div className='row'>
                <FormTextBox type='text' className='col-md-6' ref={e => this.ma = e} label='Mã nghỉ phép' readOnly={this.state.ma ? true : readOnly} />
                <FormTextBox type='text' className='col-md-12' ref={e => this.ten = e} label='Tên nghỉ phép' readOnly={readOnly} required />
                <FormTextBox type='number' className='col-md-12' ref={e => this.soNgayPhep = e} label='Số ngày phép' readOnly={readOnly} />
            </div>
        });
    }
}

class DmNghiPhepPage extends AdminPage {
    state = { searching: false };
    componentDidMount() {
        T.ready('/user/category', () => {
            T.onSearch = (searchText) => this.props.getDmNghiPhepPage(undefined, undefined, searchText || '');
            T.showSearchBox();
            this.props.getDmNghiPhepPage();
        });
    }

    showModal = (e) => {
        e.preventDefault();
        this.modal.show();
    }

    delete = (e, item) => {
        e.preventDefault();
        T.confirm('Xóa danh mục nghỉ phép', 'Bạn có chắc bạn muốn xóa nghỉ phép này?', true, isConfirm =>
            isConfirm && this.props.deleteDmNghiPhep(item.ma));
    }

    render() {
        const currentPermissions = this.props.system && this.props.system.user && this.props.system.user.permissions ? this.props.system.user.permissions : [],
            permission = this.getUserPermission('dmNghiPhep', ['read', 'write', 'delete']);
        const { pageNumber, pageSize, pageTotal, totalItem, pageCondition, list } = this.props.dmNghiPhep && this.props.dmNghiPhep.page ?
            this.props.dmNghiPhep.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, list: null };
        let table = 'Không có danh sách nghỉ phép!';
        if (list && list.length > 0) {
            table = renderTable({
                getDataSource: () => list, stickyHead: false,
                renderHead: () => (
                    <tr>
                        <th style={{ width: 'auto', textAlign: 'right' }}>#</th>
                        <th style={{ width: 'auto' }}>Mã</th>
                        <th style={{ width: '100%', whiteSpace: 'nowrap' }}>Tên nghỉ phép</th>
                        <th style={{ width: '100%', whiteSpace: 'nowrap' }}>Số ngày phép</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Thao tác</th>
                    </tr>
                ),
                renderRow: (item, index) => (
                    <tr key={index} >
                        <TableCell type='text' style={{ textAlign: 'right' }} content={index + 1} />
                        <TableCell type='link' style={{ whiteSpace: 'nowrap' }} content={item.ma || ''} onClick={() => this.modal.show(item)} />
                        <TableCell type='text' content={item.ten || ''} />
                        <TableCell type='number' content={item.soNgayPhep} />
                        <TableCell type='buttons' style={{ textAlign: 'center' }} content={item} permission={permission}
                            onEdit={() => this.modal.show(item)} onDelete={e => this.delete(e, item)} />
                    </tr>
                )
            });
        }

        return this.renderPage({
            icon: 'fa fa-list-alt',
            title: 'Danh mục nghỉ phép',
            breadcrumb: [
                <Link key={0} to='/user/category'>Danh mục</Link>,
                'Danh mục nghỉ phép'
            ],
            content: <>
                <div className='tile'>{table}</div>
                <Pagination style={{ marginLeft: '70px' }} {...{ pageNumber, pageSize, pageTotal, totalItem, pageCondition }}
                    getPage={this.props.getDmNghiPhepPage} />
                <EditModal ref={e => this.modal = e} permission={permission}
                    create={this.props.createDmNghiPhep} update={this.props.updateDmNghiPhep} permissions={currentPermissions} />
            </>,
            backRoute: '/user/category',
            onCreate: permission && permission.write ? (e) => this.showModal(e) : null,
        });
    }
}

const mapStateToProps = state => ({ system: state.system, dmNghiPhep: state.danhMuc.dmNghiPhep });
const mapActionsToProps = {
    getDmNghiPhepPage, createDmNghiPhep,
    getDmNghiPhep, updateDmNghiPhep,
    deleteDmNghiPhep
};
export default connect(mapStateToProps, mapActionsToProps)(DmNghiPhepPage);
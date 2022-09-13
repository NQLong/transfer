import React from 'react';
import { connect } from 'react-redux';
import { getDmLinhVucKinhDoanhAll, deleteDmLinhVucKinhDoanh, createDmLinhVucKinhDoanh, updateDmLinhVucKinhDoanh, getDmLinhVucKinhDoanhPage } from './redux';
import Pagination from 'view/component/Pagination';
import { Link } from 'react-router-dom';
import { AdminPage, AdminModal, TableCell, renderTable, FormTextBox, FormCheckbox } from 'view/component/AdminPage';

export class EditModal extends AdminModal {
    state = { kichHoat: true };

    componentDidMount() {
        $(document).ready(() => this.onShown(() => {
            !this.ten.value() ? this.ten.focus() : this.moTa.focus();
        }));
    }

    onShow = (item) => {
        let { ma, ten, moTa, kichHoat } = item ? item : { ma: '', ten: '', moTa: '', kichHoat: true };
        this.setState({ ma, item });
        this.ten.value(ten);
        this.moTa.value(moTa ? moTa : '');
        this.kichHoat.value(kichHoat);
    };

    onSubmit = (e) => {
        e.preventDefault();
        const changes = {
            ten: this.ten.value(),
            moTa: this.moTa.value(),
            kichHoat: this.kichHoat.value() ? 1 : 0,
        };
        if (changes.ten == '') {
            T.notify('Tên danh mục bị trống');
            $('#dmLinhVucKinhDoanhTen').focus();
        } else {
            this.state.ma ? this.props.update(this.state.ma, changes, this.hide) : this.props.create(changes, this.hide);
        }
    }

    changeKichHoat = value => this.kichHoat.value(value ? 1 : 0) || this.kichHoat.value(value);

    render = () => {
        const readOnly = this.props.readOnly;
        return this.renderModal({
            title: this.state.ma ? 'Cập nhật lĩnh vực kinh doanh' : 'Tạo mới lĩnh vực kinh doanh',
            body: <div className='row'>
                <FormTextBox type='text' className='col-md-12' ref={e => this.ten = e} label='Tên'
                    readOnly={readOnly} required />
                <FormTextBox type='text' className='col-md-12' ref={e => this.moTa = e} label='Mô tả'
                    readOnly={readOnly} />
                <FormCheckbox className='col-md-6' ref={e => this.kichHoat = e} label='Kích hoạt' isSwitch={true}
                    readOnly={readOnly} style={{ display: 'inline-flex', margin: 0 }}
                    onChange={value => this.changeKichHoat(value ? 1 : 0)} />
            </div>
        });
    }
}

class DmLinhVucKinhDoanhPage extends AdminPage {
    state = { searching: false };

    componentDidMount() {
        T.ready('/user/category', () => {
            T.onSearch = (searchText) => this.props.getDmLinhVucKinhDoanhPage(undefined, undefined, searchText || '');
            T.showSearchBox();
            this.props.getDmLinhVucKinhDoanhPage();
        });
    }

    showModal = (e) => {
        e.preventDefault();
        this.modal.show();
    }

    changeActive = item => this.props.updateDmLinhVucKinhDoanh(item.ma, { kichHoat: Number(!item.kichHoat) });

    delete = (e, item) => {
        e.preventDefault();
        T.confirm('Xóa lĩnh vực kinh doanh', 'Bạn có chắc bạn muốn xóa lĩnh vực kinh doanh này?', true, isConfirm =>
            isConfirm && this.props.deleteDmLinhVucKinhDoanh(item.ma));
    }

    render() {
        const currentPermissions = this.props.system && this.props.system.user && this.props.system.user.permissions ? this.props.system.user.permissions : [],
            permission = this.getUserPermission('dmLinhVucKinhDoanh', ['read', 'write', 'delete']);
        let table = 'Không có danh sách!',
            { pageNumber, pageSize, pageTotal, totalItem, pageCondition, list } = this.props.dmLinhVucKinhDoanh && this.props.dmLinhVucKinhDoanh.page ?
                this.props.dmLinhVucKinhDoanh.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, pageCondition: {}, list: [] };
        if (list && list.length > 0) {
            table = renderTable({
                getDataSource: () => list, stickyHead: false,
                renderHead: () => (
                    <tr>
                        <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                        <th style={{ width: '40%', textAlign: 'center' }}>Tên</th>
                        <th style={{ width: '60%', textAlign: 'center' }}>Mô tả</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Kích hoạt</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Thao tác</th>
                    </tr>
                ),
                renderRow: (item, index) => (
                    <tr key={index} >
                        <TableCell type='number' style={{ textAlign: 'right' }} content={index + 1} />
                        <TableCell type='link' content={item.ten ? item.ten : ''}
                            onClick={() => this.modal.show(item)} />
                        <TableCell type='text' content={item.moTa ? item.moTa : ''} />
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
            title: 'Danh mục Lĩnh vực kinh doanh',
            breadcrumb: [
                <Link key={0} to='/user/category'>Danh mục</Link>,
                'Danh mục Lĩnh vực kinh doanh'
            ],
            content: <>
                <div className='tile'>{table}</div>
                <Pagination style={{ marginLeft: '70px' }} {...{ pageNumber, pageSize, pageTotal, totalItem, pageCondition }}
                    getPage={this.props.getDmLinhVucKinhDoanhPage} />
                <EditModal ref={e => this.modal = e} permission={permission}
                    create={this.props.createDmLinhVucKinhDoanh} update={this.props.updateDmLinhVucKinhDoanh} permissions={currentPermissions} />
            </>,
            backRoute: '/user/category',
            onCreate: permission && permission.write ? (e) => this.showModal(e) : null,
        });
    }
}

const mapStateToProps = state => ({ system: state.system, dmLinhVucKinhDoanh: state.danhMuc.dmLinhVucKinhDoanh });
const mapActionsToProps = { getDmLinhVucKinhDoanhAll, deleteDmLinhVucKinhDoanh, createDmLinhVucKinhDoanh, updateDmLinhVucKinhDoanh, getDmLinhVucKinhDoanhPage };
export default connect(mapStateToProps, mapActionsToProps)(DmLinhVucKinhDoanhPage);
import React from 'react';
import { connect } from 'react-redux';
import { getDmKhenThuongKyHieuPage, createDmKhenThuongKyHieu, 
    getDmKhenThuongKyHieu, updateDmKhenThuongKyHieu, 
    deleteDmKhenThuongKyHieu} 
from './redux';
import { Link } from 'react-router-dom';
import { AdminPage, AdminModal, TableCell, renderTable, FormTextBox} from 'view/component/AdminPage';
import Pagination from 'view/component/Pagination';

class EditModal extends AdminModal {
    state = { active: true };

    componentDidMount() {
        $(document).ready(() => this.onShown(() => {
            !this.ma.value() ? this.ma.focus() : this.ten.focus();
        }));
    }

    onShow = (item) => {
        const { ma, ten } = item ? item : { ma: null, ten: ''};
        this.setState({ma, item});
        this.ma.value(ma ? ma : '');
        this.ten.value(ten);
    }

    onSubmit = (e) => {
        const changes = {
            ten: this.ten.value(),
            ma: this.ma.value(),
        };

        if (changes.ten == '') {
            T.notify('Tên khen thưởng ký hiệu bị trống!', 'danger');
            this.ten.focus();
        } else {
            this.state.ma ? this.props.update(this.state.ma, changes, this.hide) : this.props.create(changes, this.hide);
        }
        e.preventDefault();
    }


    render = () => {
        const readOnly = this.props.readOnly;
        return this.renderModal({
            title: this.state.ma ? 'Cập nhật khen thưởng ký hiệu' : 'Tạo mới khen thưởng ký hiệu',
            body: <div className='row'>
                <FormTextBox type='text' className='col-md-6' ref={e => this.ma = e} label='Mã khen thưởng' 
                    readOnly={this.state.ma ? true : readOnly} />
                <FormTextBox type='text' className='col-md-12' ref={e => this.ten = e} label='Tên khen thưởng' 
                    readOnly={readOnly} required />
            </div>
        });
    }
}

class DmKhenThuongKyHieuPage extends AdminPage {
    state = { searching: false };
    componentDidMount() {
        T.ready('/user/category', () => {
            T.onSearch = (searchText) => this.props.getDmKhenThuongKyHieuPage(undefined, undefined, searchText || '');
            T.showSearchBox();
            this.props.getDmKhenThuongKyHieuPage();
        });
    }

    showModal = (e) => {
        e.preventDefault();
        this.modal.show();
    }

    delete = (e, item) => {
        e.preventDefault();
        T.confirm('Xóa danh mục khen thưởng ký hiệu', 'Bạn có chắc bạn muốn xóa khen thưởng ký hiệu này?', true, isConfirm =>
            isConfirm && this.props.deleteDmKhenThuongKyHieu(item.ma));
    }

    render() {
        const currentPermissions = this.props.system && this.props.system.user && this.props.system.user.permissions ? this.props.system.user.permissions : [],
            permission = this.getUserPermission('dmKhenThuongKyHieu', ['read', 'write', 'delete']);
        const { pageNumber, pageSize, pageTotal, totalItem, pageCondition, list } = this.props.dmKhenThuongKyHieu && this.props.dmKhenThuongKyHieu.page ?
            this.props.dmKhenThuongKyHieu.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, list: null };
        let table = 'Không có danh sách khen thưởng ký hiệu!';
        if (list && list.length > 0) {
            table = renderTable({
                getDataSource: () => list, stickyHead: false,
                renderHead: () => (
                    <tr>
                        <th style={{ width: 'auto', textAlign: 'right' }}>#</th>
                        <th style={{ width: 'auto'}}>Mã</th>
                        <th style={{ width: '100%', whiteSpace: 'nowrap' }}>Tên khen thưởng ký hiệu</th>
                        <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Thao tác</th>
                    </tr>
                ),
                renderRow: (item, index) => (
                    <tr key={index} >
                        <TableCell type='text' style={{textAlign:'right'}} content={index + 1} />
                        <TableCell type='link' style={{ whiteSpace: 'nowrap'}} content={item.ma ? item.ma : ''} 
                            onClick={() => this.modal.show(item)} />
                        <TableCell type='text' content={item.ten ? item.ten : ''} />
                        <TableCell type='buttons' style={{ textAlign: 'center' }} content={item} permission={permission}
                            onEdit={() => this.modal.show(item)} onDelete={e => this.delete(e, item)} />
                    </tr>
                )
            });
        }

        return this.renderPage({
            icon: 'fa fa-list-alt',
            title: 'Danh mục khen thưởng ký hiệu',
            breadcrumb: [
                <Link key={0} to='/user/category'>Danh mục</Link>,
                'Danh mục khen thưởng ký hiệu'
            ],
            content: <>
                <div className='tile'>{table}</div>
                <Pagination style={{ marginLeft: '70px' }} {...{ pageNumber, pageSize, pageTotal, totalItem, pageCondition }} 
                    getPage={this.props.getDmKhenThuongKyHieuPage} />
                <EditModal ref={e => this.modal = e} permission={permission} 
                    create={this.props.createDmKhenThuongKyHieu} update={this.props.updateDmKhenThuongKyHieu} permissions={currentPermissions} />
            </>,
            backRoute: '/user/category',
            onCreate: permission && permission.write ? (e) => this.showModal(e) : null,
        });
    }
}

const mapStateToProps = state => ({ system: state.system, dmKhenThuongKyHieu: state.dmKhenThuongKyHieu });
const mapActionsToProps = {getDmKhenThuongKyHieuPage, createDmKhenThuongKyHieu, 
    getDmKhenThuongKyHieu, updateDmKhenThuongKyHieu, 
    deleteDmKhenThuongKyHieu };
export default connect(mapStateToProps, mapActionsToProps)(DmKhenThuongKyHieuPage);
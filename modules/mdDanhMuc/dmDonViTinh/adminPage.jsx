import React from 'react';
import { connect } from 'react-redux';
import { createDmDonViTinh, getDmDonViTinhPage, updateDmDonViTinh, deleteDmDonViTinh } from './redux';
import Pagination from 'view/component/Pagination';
import { Link } from 'react-router-dom';
import { AdminPage, TableCell, renderTable, AdminModal, FormTextBox } from 'view/component/AdminPage';

class EditModal extends AdminModal {
  componentDidMount() {
    $(document).ready(() => this.onShown(() => {
      !this.ma.value() ? this.ma.focus() : this.ten.focus();
    }));
  }
  onShow = (item) => {
    let { ma, ten } = item ? item : { ma: '', ten: '' };
    this.setState({ ma, item });
    this.ma.value(ma);
    this.ten.value(ten);
  };


  onSubmit = (e) => {
    e.preventDefault();
    const changes = {
      ma: this.ma.value().toUpperCase(),
      ten: this.ten.value(),
    };

    if (!this.state.ma && !this.ma.value()) {
      T.notify('Mã không được trống!', 'danger');
      this.ma.focus();
    } else if (!changes.ten) {
      T.notify('Tên không được trống!', 'danger');
      this.ten.focus();
    } else {
      this.state.ma ? this.props.update(this.state.ma, changes, this.hide) : this.props.create(changes, this.hide);
    }
  };

  render = () => {
    const readOnly = this.props.readOnly;
    return this.renderModal({
      title: this.state.ma ? 'Cập nhật Đơn vị tính' : 'Tạo mới Đơn vị tính',
      body: <div className='row'>
        <FormTextBox type='text' className='col-sm-12' ref={e => this.ma = e} label='Mã' readOnly={this.state.ma ? true : readOnly} placeholder='Mã' required />
        <FormTextBox type='text' className='col-sm-12' ref={e => this.ten = e} label='Tên' readOnly={readOnly} placeholder='Tên' required />
      </div>
    });
  }
}

class dmDonViTinhAdminPage extends AdminPage {
  state = { searching: false };

  componentDidMount() {
    T.ready('/user/category', () => {
      T.onSearch = (searchText) => this.props.getDmDonViTinhPage(undefined, undefined, searchText || '');
      T.showSearchBox();
      this.props.getDmDonViTinhPage();
    });
  }

  showModal = (e) => {
    e.preventDefault();
    this.modal.show();
  }

  delete = (e, item) => {
    T.confirm('Xóa Đơn vị tính', `Bạn có chắc bạn muốn xóa Đơn vị tính ${item.ten ? `<b>${item.ten}</b>` : 'này'}?`, 'warning', true, isConfirm => {
      isConfirm && this.props.deleteDmDonViTinh(item.ma, error => {
        if (error) T.notify(error.message ? error.message : `Xoá Đơn vị tính ${item.ten} bị lỗi!`, 'danger');
        else T.alert(`Xoá Đơn vị tính ${item.ten} thành công!`, 'success', false, 800);
      });
    });
    e.preventDefault();
  }

  render() {
    const currentPermissions = this.props.system && this.props.system.user && this.props.system.user.permissions ? this.props.system.user.permissions : [],
      permission = this.getUserPermission('dmDonViTinh', ['read', 'write', 'delete']);
    const { pageNumber, pageSize, pageTotal, totalItem, pageCondition, list } =
      this.props.dmDonViTinh && this.props.dmDonViTinh.page ?
        this.props.dmDonViTinh.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, pageCondition: [], list: [] };
    let table = 'Không có dữ liệu đơn vị tính!';
    if (list && list.length > 0) {
      table = renderTable({
        getDataSource: () => list, stickyHead: false,
        renderHead: () => (
          <tr>
            <th style={{ width: 'auto' }}>Mã</th>
            <th style={{ width: '100%' }}>Tên</th>
            <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>Thao tác</th>
          </tr>),
        renderRow: (item, index) => (
          <tr key={index}>
            <TableCell type='text' content={item.ma} />
            <TableCell type='link' content={item.ten} onClick={() => this.modal.show(item)} />
            <TableCell type='buttons' content={item} permission={permission}
              onEdit={() => this.modal.show(item)} onDelete={this.delete} />
          </tr>
        ),
      });
    }

    return this.renderPage({
      icon: 'fa fa-list-alt',
      title: 'Đơn vị tính',
      breadcrumb: [
        <Link key={0} to='/user/category'>Danh mục</Link>,
        'Đơn vị tính'
      ],
      content: <>
        <div className='tile'>{table}</div>
        <Pagination style={{ marginLeft: '65px' }} {...{ pageNumber, pageSize, pageTotal, totalItem, pageCondition }} getPage={this.props.getDmDonViTinhPage} />
        <EditModal ref={e => this.modal = e} permission={permission}
          create={this.props.createDmDonViTinh} update={this.props.updateDmDonViTinh} permissions={currentPermissions} />
      </>,
      backRoute: '/user/category',
      onCreate: permission && permission.write ? (e) => this.showModal(e) : null
    });
  }
}

const mapStateToProps = (state) => ({ system: state.system, dmDonViTinh: state.danhMuc.dmDonViTinh });
const mapActionsToProps = { getDmDonViTinhPage, createDmDonViTinh, updateDmDonViTinh, deleteDmDonViTinh };
export default connect(mapStateToProps, mapActionsToProps)(dmDonViTinhAdminPage);

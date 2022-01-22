import React from 'react';
import { connect } from 'react-redux';
import { createDmTaiKhoanKeToan, getDmTaiKhoanKeToanPage, updateDmTaiKhoanKeToan, deleteDmTaiKhoanKeToan } from './redux';
import Pagination from 'view/component/Pagination';
import { Link } from 'react-router-dom';
import { AdminPage, AdminModal, TableCell, renderTable, FormTextBox, FormCheckbox } from 'view/component/AdminPage';

class EditModal extends AdminModal {
  state = { active: true }

  componentDidMount() {
    $(document).ready(() => this.onShown(() => {
      !this.ma.value() ? this.ma.focus() : this.tenTaiKhoan.focus();
    }));
  }

  onShow = (item) => {
    let { ma, tenTaiKhoan, kichHoat } = item ? item : { ma: '', tenTaiKhoan: '', kichHoat: 0 };
    this.ma.value(ma);
    this.tenTaiKhoan.value(tenTaiKhoan);
    this.setState({ active: kichHoat == 1 });
  };

  changeKichHoat = value => this.kichHoat.value(value ? 1 : 0) || this.kichHoat.value(value);

  onSubmit = (e) => {
    e.preventDefault();
    const 
      changes = {
        ma: this.ma.value().trim().toUpperCase(),
        tenTaiKhoan: this.tenTaiKhoan.value().trim(),
        kichHoat: this.state.active ? '1' : '0',
      };

    if (changes.ma == '') {
      T.notify('Mã tài khoản bị trống!', 'danger');
      this.ma.focus();
    } else if (changes.tenTaiKhoanKeToan == '') {
      T.notify('Tên tài khoản bị trống!', 'danger');
      this.ma.focus();
    } else {
      this.state.ma ? this.props.update(this.state.ma, changes, this.hide) : this.props.create(changes, this.hide);
    }
  };

  render() {
    const readOnly = this.props.readOnly;
    return (this.renderModal({
      title: this.state.ma ? 'Cập nhật tài khoản kế toán' : 'Tạo mới tài khoản kế toán',
      body: <div className='row'>
          <FormTextBox className='col-md-12' ref={e => this.ma = e} label='Mã tài khoản' placeholder='Mã tài khoản' readOnly={this.state.ma ? true : readOnly} required />
          <FormTextBox type='text' className='col-md-12' ref={e => this.tenTaiKhoan = e} label='Tên tài khoản' readOnly={readOnly} required />
          <FormCheckbox className='col-md-6' ref={e => this.kichHoat = e} label='Kích hoạt' isSwitch={true} readOnly={readOnly} onChange={value => this.changeKichHoat(value ? 1 : 0)} />
      </div>
    }));
  }
}

class DmTaiKhoankeToanPage extends AdminPage {
  state = { searching: false };

  componentDidMount() {
    T.ready('/user/category', () => {
      T.onSearch = (searchText) => this.props.getDmTaiKhoanKeToanPage(undefined, undefined, searchText || '');
      T.showSearchBox();
      this.props.getDmTaiKhoanKeToanPage();
  });
  }

  showModal = (e) => {
    e.preventDefault();
    this.modal.current.show();
  };

  delete = (e, item) => {
    e.preventDefault();
    T.confirm('Xóa danh mục tài khoản kế toán', 'Bạn có chắc bạn muốn xóa tài khoản này?', true,
      (isConfirm) => isConfirm && this.props.deleteDmTaiKhoanKeToan(item.ma));
  };

  render() {
    const currentPermissions = this.props.system && this.props.system.user && this.props.system.user.permissions ? this.props.system.user.permissions : [],
      permission = this.getUserPermission('dmTaiKhoanKeToan', ['read', 'write', 'delete']);
    const { pageNumber, pageSize, pageTotal, totalItem } =
      this.props.dmTaiKhoanKeToan && this.props.dmTaiKhoanKeToan.page ? this.props.dmTaiKhoanKeToan.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0 };
    let table = 'Không có dữ liệu tài khoản!';
    if (this.props.dmTaiKhoanKeToan && this.props.dmTaiKhoanKeToan.page && this.props.dmTaiKhoanKeToan.page.list && this.props.dmTaiKhoanKeToan.page.list.length > 0) {
      table = renderTable({
        getDataSource: () => this.props.dmTaiKhoanKeToan.page.list, stickyHead: false,
        renderHead: () => (
            <tr>
              <th style={{ width: 'auto' }}>Mã</th>
              <th style={{ width: '40%' }} nowrap='true'>Tên tài khoản</th>
              <th style={{ width: '10%', textAlign: 'center' }}>Kích hoạt</th>
              <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Thao tác</th>
            </tr>),
        renderRow: (item, index) => (
            <tr key={index}>
                <TableCell type='link' content={item.ma ? item.ma : ''} />
                <TableCell type='text' content={item.tenTaiKhoan} onClick={() => this.modal.show(item)} />
                <TableCell type='checkbox' content={item.kichHoat} permission={permission}
                    onChanged={value => this.props.updateDmTaiKhoanKeToan(item.ma, { kichHoat: value ? 1 : 0, })} />
                <TableCell type='buttons' content={item} permission={permission}
                    onEdit={() => this.modal.show(item)} onDelete={this.delete} />
            </tr>)
      });
    }

    return this.renderPage({
      icon: 'fa fa-list-alt',
      title: 'Danh mục Tài Khoản Kế Toán',
      breadcrumb: [
          <Link key={0} to='/user/category'>Danh mục</Link>,
          'Danh mục Tài Khoản Kế Toán'
      ],
      content: <>
          <div className='tile'>{table}</div>
          <Pagination style={{ marginLeft: '65px' }} {...{ pageNumber, pageSize, pageTotal, totalItem }} getPage={this.props.getDmTaiKhoanKeToanPage} />
          <EditModal ref={e => this.modal = e} permission={permission}
              create={this.props.createDmTaiKhoanKeToan} update={this.props.updateDmTaiKhoanKeToan} permissions={currentPermissions} />
      </>,
      backRoute: '/user/category',
      onCreate: permission && permission.write ? (e) => this.showModal(e) : null,
      onImport: permission && permission.write ? (e) => e.preventDefault() || this.props.history.push('/user/danh-muc/tai-khoan-ke-toan/upload') : null
  });
  }
}

const mapStateToProps = (state) => ({ system: state.system, dmTaiKhoanKeToan: state.danhMuc.dmTaiKhoanKeToan });
const mapActionsToProps = { getDmTaiKhoanKeToanPage, createDmTaiKhoanKeToan, updateDmTaiKhoanKeToan, deleteDmTaiKhoanKeToan };
export default connect(mapStateToProps, mapActionsToProps)(DmTaiKhoankeToanPage);

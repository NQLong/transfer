import React from 'react';
import { connect } from 'react-redux';
import { createDmNguonVon, getDmNguonVonPage, updateDmNguonVon, deleteDmNguonVon } from './redux';
import Pagination from 'view/component/Pagination';
import { Link } from 'react-router-dom';
import { AdminPage, AdminModal, TableCell, renderTable, FormTextBox } from 'view/component/AdminPage';

class EditModal extends AdminModal {

  componentDidMount() {
    $(document).ready(() => this.onShown(() => {
      !this.ma.value() ? this.ma.focus() : this.tenNguonVon.focus();
  }));
  }

  onShow = (item) => {
    let { ma, tenNguonVon } = item ? item : { ma: '', tenNguonVon: '' };
    this.ma.value(ma);
    this.ma.value(tenNguonVon);
  };

  changeKichHoat = value => this.kichHoat.value(value ? 1 : 0) || this.kichHoat.value(value);

  onSubmit = (e) => {
    e.preventDefault();
    const 
      changes = {
        ma: this.ma.value().trim().toUpperCase(),
        tenNguonVon: this.tenNguonVon.value().trim(),
      };

    if (changes.ma == '') {
      T.notify('Mã nguồn vốn bị trống!', 'danger');
      this.ma.focus();
    } else if (changes.tenNguonVon == '') {
      T.notify('Tên nguồn vốn bị trống!', 'danger');
      this.tenNguonVon.focus();
    } else {
      this.state.ma ? this.props.update(this.state.ma, changes, this.hide) : this.props.create(changes, this.hide);
    }
  };

  render = () => {
    const readOnly = this.props.readOnly;
    return (this.renderModal({
      title: this.state.ma ? 'Cập nhật nguồn vốn' : 'Tạo mới nguồn vốn',
      body: <div className='row'>
          <FormTextBox className='col-md-12' ref={e => this.ma = e} label='Mã Nguồn Vốn' placeholder='Mã nguồn vốn' readOnly={this.state.ma ? true : readOnly} style={{ textTransform: 'uppercase' }} required />
          <FormTextBox type='text' className='col-md-12' ref={e => this.tenNguonVon = e} label='Tên Nguồn Vốn' readOnly={readOnly} required />
          <FormTextBox type='number' className='col-md-12' ref={e => this.phuCap = e} label='Phụ cấp' readOnly={readOnly} step={0.01} />
      </div>
    }));
  }
}

class DmNguonVonPage extends AdminPage {
  state = { searching: false };

  componentDidMount() {
    T.ready('/user/category', () => {
      T.onSearch = (searchText) => this.props.getDmNguonVonPage(undefined, undefined, searchText || '');
      T.showSearchBox();
      this.props.getDmNguonVonPage();
    });
  }

  showModal = (e) => {
    e.preventDefault();
    this.modal.show();
  };

  delete = (e, item) => {
    e.preventDefault();
    T.confirm('Xóa danh mục nguồn vốn', 'Bạn có chắc bạn muốn xóa nguồn vốn này?', true,
      (isConfirm) => isConfirm && this.props.deleteDmNguonVon(item.ma));
  };

  render() {
    const currentPermissions = this.props.system && this.props.system.user && this.props.system.user.permissions ? this.props.system.user.permissions : [],
    permission = this.getUserPermission('dmChucVu', ['read', 'write', 'delete']);
    const { pageNumber, pageSize, pageTotal, totalItem } = this.props.dmNguonVon && this.props.dmNguonVon.page ? this.props.dmNguonVon.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0 };
    let table = 'Không có dữ liệu nguồn vốn!';
    if (this.props.dmNguonVon && this.props.dmNguonVon.page && this.props.dmNguonVon.page.list && this.props.dmNguonVon.page.list.length > 0) {
      table = renderTable({
        getDataSource: () => this.props.dmNguonVon.page.list, stickyHead: false,
        renderHead: () => (
            <tr>
              <th style={{ width: 'auto' }}>Mã</th>
              <th style={{ width: '40%' }} nowrap='true'>Tên nguồn vốn</th>
              <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Thao tác</th>
            </tr>),
        renderRow: (item, index) => (
            <tr key={index}>
                <TableCell type='text' content={item.ma ? item.ma : ''} />
                <TableCell type='link' content={item.tenNguonVon ? item.tenNguonVon : ''} onClick={() => this.modal.show(item)} />
                <TableCell type='buttons' content={item} permission={permission}
                    onEdit={() => this.modal.show(item)} onDelete={this.delete} />
            </tr>)
      });
    }

    return this.renderPage({
      icon: 'fa fa-list-alt',
      title: 'Danh mục Nguồn Vốn',
      breadcrumb: [
          <Link key={0} to='/user/category'>Danh mục</Link>,
          'Danh mục Nguồn Vốn'
      ],
      content: <>
          <div className='tile'>{table}</div>
          <Pagination style={{ marginLeft: '65px' }} {...{ pageNumber, pageSize, pageTotal, totalItem }} getPage={this.props.getDmNguonVonPage} />
          <EditModal ref={e => this.modal = e} permission={permission}
              create={this.props.createDmNguonVon} update={this.props.updateDmNguonVon} permissions={currentPermissions} />
      </>,
      backRoute: '/user/category',
      onCreate: permission && permission.write ? (e) => this.showModal(e) : null,
    });
  }
}

const mapStateToProps = (state) => ({ system: state.system, dmNguonVon: state.dmNguonVon });
const mapActionsToProps = { getDmNguonVonPage, createDmNguonVon, updateDmNguonVon, deleteDmNguonVon };
export default connect(mapStateToProps, mapActionsToProps)(DmNguonVonPage);

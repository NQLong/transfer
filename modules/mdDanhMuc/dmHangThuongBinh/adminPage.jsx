import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { getDmHangThuongBinhPage, updateDmHangThuongBinh, deleteDmHangThuongBinh, createDmHangThuongBinh } from './redux';
import { AdminPage, TableCell, renderTable, AdminModal, FormCheckbox, FormTextBox, FormRichTextBox } from 'view/component/AdminPage';
import Pagination from 'view/component/Pagination';

class EditModal extends AdminModal {
  componentDidMount() {
    this.ten.focus();
  }
  onShow = (item) => {
    let { ma, moTa, ten, kichHoat } = item ? item : { ma: null, moTa: '', ten: '', kichHoat: true };

    this.setState({ ma });
    this.ma.value(ma || '');
    this.moTa.value(moTa || '');
    this.ten.value(ten || '');
    this.kichHoat.value(kichHoat);
  };

  onSubmit = (e) => {
    e.preventDefault();
    const changes = {
      ma: this.ma.value(),
      ten: this.ten.value(),
      moTa: this.moTa.value(),
      kichHoat: Number(this.kichHoat.value())
    };
    if (!this.ma.value()) {
      T.notify('Mã không được trống!', 'danger');
      this.ma.focus();
    } else if (changes.ten == '') {
      T.notify('Tên không được bị trống!', 'danger');
      this.ten.focus();
    } else {
      this.state.ma ? this.props.update(this.state.ma, changes, this.hide) : this.props.create(changes, this.hide);
    }
  };

  changeKichHoat = value => this.kichHoat.value(value);

  render = () => {
    const readOnly = this.props.readOnly;
    return this.renderModal({
      title: this.state.maNganh ? 'Tạo mới hạng thương binh' : 'Cập nhật hạng thương binh',
      size: 'large',
      body: <div className='row'>
        <FormTextBox type='text' className='col-12' ref={e => this.ma = e} label='Mã' readOnly={this.state.ma ? true : readOnly} placeholder='Mã' required />
        <FormTextBox type='text' className='col-12' ref={e => this.ten = e} label='Tên' readOnly={readOnly} required />
        <FormRichTextBox type='text' className='col-12' ref={e => this.moTa = e} label='Mô tả' readOnly={readOnly} required />
        <FormCheckbox className='col-md-6' ref={e => this.kichHoat = e} label='Kích hoạt' isSwitch={true} readOnly={readOnly} style={{ display: 'inline-flex' }}
          onChange={value => this.changeKichHoat(value ? 1 : 0)} />
      </div>
    }
    );
  }

}
class DmHangThuongBinhAdminPage extends AdminPage {
  componentDidMount() {
    T.clearSearchBox();
    T.onSearch = (searchText) => this.props.getDmHangThuongBinhPage(undefined, undefined, searchText || '');
    T.showSearchBox();
    this.props.getDmHangThuongBinhPage();
  }

  showModal = (e) => {
    e.preventDefault();
    this.modal.show();
  }

  delete = (e, item) => {
    T.confirm('Xóa hạng thương binh', `Bạn có chắc bạn muốn xóa hạng thương binh ${item.ten ? `<b>${item.ten}</b>` : 'này'}?`, 'warning', true, isConfirm => {
      isConfirm && this.props.deleteDmHangThuongBinh(item.ma, error => {
        if (error) T.notify(error.message ? error.message : `Xoá hạng thương binh ${item.ten} bị lỗi!`, 'danger');
        else T.alert(`Xoá hạng thương binh ${item.ten} thành công!`, 'success', false, 800);
      });
    });
    e.preventDefault();
  }

  render() {
    const currentPermissions = this.props.system && this.props.system.user && this.props.system.user.permissions ? this.props.system.user.permissions : [],
      permission = this.getUserPermission('dmHangThuongBinh', ['read', 'write', 'delete']);

    const { pageNumber, pageSize, pageTotal, totalItem, pageCondition, list } = this.props.dmHangThuongBinh && this.props.dmHangThuongBinh.page ?
      this.props.dmHangThuongBinh.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, list: null };
    const table = !(list && list.length > 0) ? 'Không có dữ liệu hạng thương binh' :
      renderTable({
        getDataSource: () => list, stickyHead: false,
        renderHead: () => (
          <tr>
            <th style={{ width: 'auto' }}>#</th>
            <th style={{ width: 'auto' }}>Tên</th>
            <th style={{ width: '100%', whiteSpace: 'nowrap' }}>Mô tả</th>
            <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Kích hoạt</th>
            <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Thao tác</th>
          </tr>),
        renderRow: (item, index) => (
          <tr key={index}>
            <TableCell type='text' style={{ textAlign: 'right' }} content={(pageNumber - 1) * pageSize + index + 1} />
            <TableCell type='link' style={{ whiteSpace: 'nowrap' }} content={item.ten} onClick={() => this.modal.show(item)} />
            <TableCell type='text' content={item.moTa} />
            <TableCell type='checkbox' content={item.kichHoat} permission={permission}
              onChanged={value => this.props.updateDmHangThuongBinh(item.ma, { kichHoat: Number(value) })} />
            <TableCell type='buttons' content={item} permission={permission}
              onEdit={() => this.modal.show(item)} onDelete={this.delete} />
          </tr>
        ),
      });


    return this.renderPage({
      icon: 'fa fa-list-alt',
      title: 'Hạng thương binh',
      breadcrumb: [
        <Link key={0} to='/user/category'>Danh mục</Link>,
        'Hạng thương binh'
      ],
      content: <>
        <div className='tile'>{table}</div>
        <Pagination style={{ marginLeft: '70px' }} {...{ pageNumber, pageSize, pageTotal, totalItem, pageCondition }}
          getPage={this.props.getDmHangThuongBinhPage} />
        <EditModal ref={e => this.modal = e} permission={permission}
          create={this.props.createDmHangThuongBinh} update={this.props.updateDmHangThuongBinh} permissions={currentPermissions} />
      </>,
      backRoute: '/user/category',
      onCreate: permission && permission.write ? (e) => this.showModal(e) : null
    });
  }
}

const mapStateToProps = state => ({ system: state.system, dmHangThuongBinh: state.danhMuc.dmHangThuongBinh });
const mapActionsToProps = { getDmHangThuongBinhPage, updateDmHangThuongBinh, deleteDmHangThuongBinh, createDmHangThuongBinh };
export default connect(mapStateToProps, mapActionsToProps)(DmHangThuongBinhAdminPage);
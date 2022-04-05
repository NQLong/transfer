import React from 'react';
import { connect } from 'react-redux';
import { getDmSvDoiTuongTsPage, deleteDmSvDoiTuongTs, createDmSvDoiTuongTs, updateDmSvDoiTuongTs } from './redux';
import { Link } from 'react-router-dom';
import { AdminPage, TableCell, renderTable, AdminModal, FormCheckbox, FormTextBox, FormRichTextBox } from 'view/component/AdminPage';
import Pagination from 'view/component/Pagination';

class EditModal extends AdminModal {
  componentDidMount() {
    $(document).ready(() => this.onShown(() => {
      !this.ma.value() ? this.ma.focus() : this.ten.focus();
    }));
  }

  onShow = (item) => {
    let { ma, ten, kichHoat } = item ? item : { ma: '', ten: '', kichHoat: true };

    this.setState({ ma, item });
    this.ma.value(ma);
    this.ten.value(ten);
    this.kichHoat.value(kichHoat);
  };

  onSubmit = (e) => {
    e.preventDefault();
    const changes = {
      ma: this.ma.value(),
      ten: this.ten.value(),
      kichHoat: Number(this.kichHoat.value())
    };
    if (!this.state.ma && !this.ma.value()) {
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
      title: this.state.ma ? 'Tạo mới đối tượng tuyển sinh (sinh viên)' : 'Cập nhật đối tượng tuyển sinh (sinh viên)',
      size: 'large',
      body: <div className='row'>
        <FormTextBox className='col-12' ref={e => this.ma = e} label='Mã' readOnly={this.state.ma ? true : readOnly} placeholder='Mã' required />
        <FormRichTextBox className='col-12' ref={e => this.ten = e} label='Tên' readOnly={readOnly} placeholder='Tên' required />
        <FormCheckbox className='col-md-6' ref={e => this.kichHoat = e} label='Kích hoạt' isSwitch={true} readOnly={readOnly} style={{ display: 'inline-flex' }}
          onChange={value => this.changeKichHoat(value ? 1 : 0)} />
      </div>
    }
    );
  }
}

class DmSvDoiTuongTsPage extends AdminPage {
  componentDidMount() {
    T.onSearch = (searchText) => this.props.getDmSvDoiTuongTsPage(undefined, undefined, searchText || '');
    T.showSearchBox();
    this.props.getDmSvDoiTuongTsPage();
  }

  showModal = (e) => {
    e.preventDefault();
    this.modal.show();
  }

  delete = (e, item) => {
    T.confirm('Xóa đối tượng tuyển sinh (sinh viên)', `Bạn có chắc bạn muốn xóa đối tượng tuyển sinh (sinh viên) ${item.ten ? `<b>${item.ten}</b>` : 'này'}?`, 'warning', true, isConfirm => {
      isConfirm && this.props.deleteDmSvDoiTuongTs(item.ma, error => {
        if (error) T.notify(error.message ? error.message : `Xoá đối tượng tuyển sinh (sinh viên) ${item.ten} bị lỗi!`, 'danger');
        else T.alert(`Xoá đối tượng tuyển sinh (sinh viên) ${item.ten} thành công!`, 'success', false, 800);
      });
    });
    e.preventDefault();
  }

  render() {
    const currentPermissions = this.props.system && this.props.system.user && this.props.system.user.permissions ? this.props.system.user.permissions : [],
      permission = this.getUserPermission('dmSvDoiTuongTs', ['read', 'write', 'delete']);

    const { pageNumber, pageSize, pageTotal, totalItem, pageCondition, list } = this.props.dmSvDoiTuongTs && this.props.dmSvDoiTuongTs.page ?
      this.props.dmSvDoiTuongTs.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, list: null };
    const table = !(list && list.length > 0) ? 'Không có dữ liệu đối tượng tuyển sinh (sinh viên)' :
      renderTable({
        getDataSource: () => list, stickyHead: false,
        renderHead: () => (
          <tr>
            <th style={{ width: 'auto' }} nowrap='true'>Mã</th>
            <th style={{ width: '100%' }} nowrap='true'>Tên</th>
            <th style={{ width: 'auto' }} nowrap='true'>Kích hoạt</th>
            <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Thao tác</th>
          </tr>),
        renderRow: (item, index) => (
          <tr key={index}>
            <TableCell type='link' content={item.ma} onClick={() => this.modal.show(item)} />
            <TableCell content={item.ten} />
            <TableCell type='checkbox' content={item.kichHoat} permission={permission}
              onChanged={value => this.props.updateDmSvDoiTuongTs(item.ma, { kichHoat: Number(value) })} />
            <TableCell type='buttons' content={item} permission={permission}
              onEdit={() => this.modal.show(item)} onDelete={this.delete} />
          </tr>
        ),
      });


    return this.renderPage({
      icon: 'fa fa-list-alt',
      title: ' Đối tượng tuyển sinh',
      subTitle: 'Sinh viên',
      breadcrumb: [
        <Link key={0} to='/user/category'>Danh mục</Link>,
        'Đối tượng tuyển sinh (sinh viên)'
      ],
      content: <>
        <div className='tile'>{table}</div>
        <Pagination style={{ marginLeft: '70px' }} {...{ pageNumber, pageSize, pageTotal, totalItem, pageCondition }}
          getPage={this.props.getDmSvDoiTuongTsPage} />
        <EditModal ref={e => this.modal = e} permission={permission}
          create={this.props.createDmSvDoiTuongTs} update={this.props.updateDmSvDoiTuongTs} permissions={currentPermissions} />
      </>,
      backRoute: '/user/category',
      onCreate: permission && permission.write ? (e) => this.showModal(e) : null
    });
  }
}

const mapStateToProps = state => ({ system: state.system, dmSvDoiTuongTs: state.danhMuc.dmSvDoiTuongTs });
const mapActionsToProps = { getDmSvDoiTuongTsPage, deleteDmSvDoiTuongTs, createDmSvDoiTuongTs, updateDmSvDoiTuongTs };
export default connect(mapStateToProps, mapActionsToProps)(DmSvDoiTuongTsPage);
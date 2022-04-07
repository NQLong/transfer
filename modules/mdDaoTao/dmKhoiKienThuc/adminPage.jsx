import React from 'react';
import { connect } from 'react-redux';
import { getDmKhoiKienThucPage, deleteDmKhoiKienThuc, createDmKhoiKienThuc, updateDmKhoiKienThuc, SelectAdapter_DmKhoiKienThucAll } from './redux';
import { Link } from 'react-router-dom';
import { AdminPage, TableCell, renderTable, AdminModal, FormTextBox, FormSelect } from 'view/component/AdminPage';
import Pagination from 'view/component/Pagination';

class EditModal extends AdminModal {
  componentDidMount() {
    $(document).ready(() => this.onShown(() => {
      this.ma.focus();
    }));
  }

  onShow = (item) => {
    let { ma, ten, khoiCha } = item ? item : { ma: '', ten: '', khoiCha: '' };

    this.setState({ ma, item });
    this.ma.value(ma);
    this.ten.value(ten);
    this.khoiCha.value(khoiCha);
  };

  onSubmit = (e) => {
    e.preventDefault();
    const changes = {
      ma: this.ma.value(),
      ten: this.ten.value(),
      khoiCha: this.khoiCha.value(),
    };
    if (changes.ma == '') {
      T.notify('mã không được bị trống!', 'danger');
      this.ma.focus();
    }
    else if (changes.ten == '') {
      T.notify('Tên không được bị trống!', 'danger');
      this.ten.focus();
    } else {
      this.state.item ? this.props.update(this.state.ma, changes, this.hide) : this.props.create(changes, this.hide);
    }
  };

  changeKichHoat = value => this.kichHoat.value(value);

  render = () => {
    const readOnly = this.props.readOnly;
    return this.renderModal({
      title: this.state.item ? 'Tạo mới' : 'Cập nhật khối kiến thức',
      size: 'large',
      body: <div className='row'>
        <FormTextBox type='text' className='col-12' ref={e => this.ma = e} label='Mã' readOnly={this.state.item} required />
        <FormTextBox type='text' className='col-12' ref={e => this.ten = e} label='Tên' readOnly={readOnly} required />
        <FormSelect data={SelectAdapter_DmKhoiKienThucAll} className='col-12' ref={e => this.khoiCha = e} label='Khối cha' readOnly={readOnly} placeholder='Khối cha' />
      </div>
    }
    );
  }
}

class DmKhoiKienThucPage extends AdminPage {
  componentDidMount() {
    T.onSearch = (searchText) => this.props.getDmKhoiKienThucPage(undefined, undefined, searchText || '');
    T.showSearchBox();
    this.props.getDmKhoiKienThucPage();
  }

  showModal = (e) => {
    e.preventDefault();
    this.modal.show();
  }

  delete = (e, item) => {
    T.confirm('Xóa khối kiến thức', `Bạn có chắc bạn muốn xóa khối kiến thức ${item.ten ? `<b>${item.ten}</b>` : 'này'}?`, 'warning', true, isConfirm => {
      isConfirm && this.props.deleteDmKhoiKienThuc(item.ma, error => {
        if (error) T.notify(error.message ? error.message : `Xoá khối kiến thức ${item.ten} bị lỗi!`, 'danger');
        else T.alert(`Xoá khối kiến thức ${item.ten} thành công!`, 'success', false, 800);
      });
    });
    e.preventDefault();
  }

  render() {
    const permission = this.getUserPermission('dmKhoiKienThuc', ['read', 'write', 'delete']);

    const { pageNumber, pageSize, pageTotal, totalItem, pageCondition, list } = this.props.dmKhoiKienThuc && this.props.dmKhoiKienThuc.page ?
      this.props.dmKhoiKienThuc.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, list: null };
    const table = renderTable({
      getDataSource: () => list,
      stickyHead: false,
      emptyTable: 'Không có dữ liệu',
      renderHead: () => (
        <tr>
          <th style={{ width: 'auto' }} nowrap='true'>#</th>
          <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Mã</th>
          <th style={{ width: '50%' }} nowrap='true'>Tên</th>
          <th style={{ width: '50%' }} nowrap='true'>Khối cha</th>
          <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Thao tác</th>
        </tr>),
      renderRow: (item, index) => (
        <tr key={index}>
          <TableCell type='text' style={{ textAlign: 'right' }} content={(pageNumber - 1) * pageSize + index + 1} />
          <TableCell type='link' style={{ textAlign: 'center' }} content={item.ma} onClick={() => this.modal.show(item)} />
          <TableCell content={item.ten} />
          <TableCell content={item.tenKhoiCha || ''} />
          <TableCell type='buttons' content={item} permission={permission}
            onEdit={() => this.modal.show(item)} onDelete={this.delete} />
        </tr>
      ),
    });

    return this.renderPage({
      icon: 'fa fa-crosshairs',
      title: 'Khối kiến thức',
      breadcrumb: [
        <Link key={0} to='/user/pdt'>Đào tạo</Link>,
        'Khối kiến thức'
      ],
      content: <>
        <div className='tile'>{table}</div>
        <Pagination style={{ marginLeft: '70px' }} {...{ pageNumber, pageSize, pageTotal, totalItem, pageCondition }}
          getPage={this.props.getDmKhoiKienThucPage} />
        <EditModal ref={e => this.modal = e} permission={permission} readOnly={!permission.write}
          create={this.props.createDmKhoiKienThuc} update={this.props.updateDmKhoiKienThuc} />
      </>,
      backRoute: '/user/pdt',
      onCreate: permission && permission.write ? (e) => this.showModal(e) : null
    });
  }
}

const mapStateToProps = state => ({ system: state.system, dmKhoiKienThuc: state.danhMuc.dmKhoiKienThuc });
const mapActionsToProps = { getDmKhoiKienThucPage, deleteDmKhoiKienThuc, createDmKhoiKienThuc, updateDmKhoiKienThuc };
export default connect(mapStateToProps, mapActionsToProps)(DmKhoiKienThucPage);
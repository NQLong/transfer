import React from 'react';
import { connect } from 'react-redux';
import { getDtNganhDaoTaoPage, deleteDtNganhDaoTao, createDtNganhDaoTao, updateDtNganhDaoTao } from './redux';
import { Link } from 'react-router-dom';
import { AdminPage, TableCell, renderTable, AdminModal, FormCheckbox, FormTextBox } from 'view/component/AdminPage';
import Pagination from 'view/component/Pagination';

class EditModal extends AdminModal {
  componentDidMount() {
    $(document).ready(() => this.onShown(() => {
      !this.maNganh.value() ? this.maNganh.focus() : this.tenNganh.focus();
    }));
  }

  onShow = (item) => {
    let { maNganh, tenNganh, kichHoat } = item ? item : { maNganh: '', tenNganh: '', kichHoat: true };

    this.setState({ maNganh, item });
    this.maNganh.value(maNganh);
    this.tenNganh.value(tenNganh);
    this.kichHoat.value(kichHoat);
  };

  onSubmit = (e) => {
    e.preventDefault();
    const changes = {
      maNganh: this.maNganh.value(),
      tenNganh: this.tenNganh.value(),
      kichHoat: Number(this.kichHoat.value())
    };
    if (!this.state.maNganh && !this.maNganh.value()) {
      T.notify('Mã không được trống!', 'danger');
      this.maNganh.focus();
    } else if (changes.tenNganh == '') {
      T.notify('Tên không được bị trống!', 'danger');
      this.tenNganh.focus();
    } else {
      this.state.maNganh ? this.props.update(this.state.maNganh, changes, this.hide) : this.props.create(changes, this.hide);
    }
  };

  changeKichHoat = value => this.kichHoat.value(value);

  render = () => {
    const readOnly = this.props.readOnly;
    return this.renderModal({
      title: this.state.maNganh ? 'Cập nhât ngành đào tạo' : 'Tạo mới ngành đào tạo',
      size: 'large',
      body: <div className='row'>
        <FormTextBox type='text' className='col-12' ref={e => this.maNganh = e} label='Mã' readOnly={this.state.maNganh ? true : readOnly} placeholder='Mã' required />
        <FormTextBox type='text' className='col-12' ref={e => this.tenNganh = e} label='Tên ngành' readOnly={readOnly} placeholder='Tên' required />
        <FormCheckbox className='col-md-6' ref={e => this.kichHoat = e} label='Kích hoạt' isSwitch={true} readOnly={readOnly} style={{ display: 'inline-flex' }}
          onChange={value => this.changeKichHoat(value ? 1 : 0)} />
      </div>
    }
    );
  }
}

class DtNganhDaoTaoPage extends AdminPage {
  componentDidMount() {
    T.ready('/user/pdt', () => {
      T.onSearch = (searchText) => this.props.getDtNganhDaoTaoPage(undefined, undefined, searchText || '');
      T.showSearchBox();
      this.props.getDtNganhDaoTaoPage();
    });
  }

  showModal = (e) => {
    e.preventDefault();
    this.modal.show();
  }

  delete = (e, item) => {
    T.confirm('Xóa ngành đào tạo', `Bạn có chắc bạn muốn xóa ngành đào tạo ${item.tenNganh ? `<b>${item.tenNganh}</b>` : 'này'}?`, 'warning', true, isConfirm => {
      isConfirm && this.props.deleteDtNganhDaoTao(item.maNganh, error => {
        if (error) T.notify(error.message ? error.message : `Xoá ngành đào tạo ${item.tenNganh} bị lỗi!`, 'danger');
        else T.alert(`Xoá ngành đào tạo ${item.tenNganh} thành công!`, 'success', false, 800);
      });
    });
    e.preventDefault();
  }

  render() {
    const permission = this.getUserPermission('dtNganhDaoTao', ['read', 'write', 'delete']);

    const { pageNumber, pageSize, pageTotal, totalItem, pageCondition, list } = this.props.dtNganhDaoTao && this.props.dtNganhDaoTao.page ?
      this.props.dtNganhDaoTao.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, list: null };
    const table = !(list && list.length > 0) ? 'Không có dữ liệu ngành đào tạo' :
      renderTable({
        getDataSource: () => list, stickyHead: false,
        renderHead: () => (
          <tr>
            <th style={{ width: 'auto' }} nowrap='true'>#</th>
            <th style={{ width: 'auto' }} nowrap='true'>Mã</th>
            <th style={{ width: '100%' }} nowrap='true'>Tên</th>
            <th style={{ width: 'auto' }} nowrap='true'>Kích hoạt</th>
            <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Thao tác</th>
          </tr>),
        renderRow: (item, index) => (
          <tr key={index}>
            <TableCell type='text' style={{ textAlign: 'right' }} content={(pageNumber - 1) * pageSize + index + 1} />
            <TableCell type='link' content={item.maNganh} onClick={() => this.modal.show(item)} />
            <TableCell type='text' content={item.tenNganh} />
            <TableCell type='checkbox' content={item.kichHoat} permission={permission}
              onChanged={value => this.props.updateDtNganhDaoTao(item.maNganh, { kichHoat: Number(value) })} />
            <TableCell type='buttons' content={item} permission={permission}
              onEdit={() => this.modal.show(item)} onDelete={this.delete} />
          </tr>
        ),
      });


    return this.renderPage({
      icon: 'fa fa-cube',
      title: 'Danh sách Ngành đào tạo',
      breadcrumb: [
        <Link key={0} to='/user/pdt'>Đào tạo</Link>,
        'Danh sách Ngành đào tạo'
      ],
      content: <>
        <div className='tile'>{table}</div>
        <Pagination style={{ marginLeft: '70px' }} {...{ pageNumber, pageSize, pageTotal, totalItem, pageCondition }}
          getPage={this.props.getDtNganhDaoTaoPage} />
        <EditModal ref={e => this.modal = e} permission={permission} readOnly={!permission.write}
          create={this.props.createDtNganhDaoTao} update={this.props.updateDtNganhDaoTao} />
      </>,
      backRoute: '/user/pdt',
      onCreate: permission && permission.write ? (e) => this.showModal(e) : null
    });
  }
}

const mapStateToProps = state => ({ system: state.system, dtNganhDaoTao: state.daoTao.dtNganhDaoTao });
const mapActionsToProps = { getDtNganhDaoTaoPage, deleteDtNganhDaoTao, createDtNganhDaoTao, updateDtNganhDaoTao };
export default connect(mapStateToProps, mapActionsToProps)(DtNganhDaoTaoPage);
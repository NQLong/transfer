import React from 'react';
import { connect } from 'react-redux';
import { getDmSvNganhToHopPage, deleteDmSvNganhToHop, createDmSvNganhToHop, updateDmSvNganhToHop } from './redux';
import { Link } from 'react-router-dom';
import { AdminPage, TableCell, renderTable, AdminModal, FormSelect, FormCheckbox } from 'view/component/AdminPage';
import Pagination from 'view/component/Pagination';
import { SelectAdapter_DmSvNganhDaoTao } from '../dmSvNganhDaoTao/redux';
import { SelectAdapter_DmSvToHopTs } from '../dmSvToHopTs/redux';

class EditModal extends AdminModal {

  onShow = (item) => {
    let { maNganh, maToHop, kichHoat, id } = item ? item : { maNganh: '', maToHop: '', id: null };

    this.setState({ id });
    this.maNganh.value(maNganh);
    this.maToHop.value(maToHop);
    this.kichHoat.value(Number(kichHoat));
  };

  onSubmit = (e) => {
    e.preventDefault();
    const changes = {
      maNganh: this.maNganh.value(),
      maToHop: this.maToHop.value(),
      kichHoat: Number(this.kichHoat.value())
    };
    if (!this.state.maNganh && !this.maNganh.value()) {
      T.notify('Ngành không được trống!', 'danger');
      this.maNganh.focus();
    } else if (changes.maToHop == '') {
      T.notify('Tổ hợp thi không được bị trống!', 'danger');
      this.maToHop.focus();
    } else {
      this.state.id ? this.props.update(this.state.id, changes, this.hide) : this.props.create(changes, this.hide);
    }
  };

  changeKichHoat = value => this.kichHoat.value(value);

  render = () => {
    const readOnly = this.props.readOnly;
    return this.renderModal({
      title: this.state.id ? 'Tạo mới' : 'Cập nhật',
      size: 'large',
      body: <div className='row'>
        <FormSelect className='col-12' ref={e => this.maNganh = e} label='Ngành' readOnly={this.state.id ? true : readOnly} data={SelectAdapter_DmSvNganhDaoTao} required />
        <FormSelect className='col-12' ref={e => this.maToHop = e} label='Tổ hợp' readOnly={readOnly} data={SelectAdapter_DmSvToHopTs} required />
        <FormCheckbox className='col-md-6' ref={e => this.kichHoat = e} label='Kích hoạt' isSwitch={true} readOnly={readOnly} style={{ display: 'inline-flex' }}
          onChange={value => this.changeKichHoat(value ? 1 : 0)} />
      </div>
    }
    );
  }
}

class DmSvNganhToHopPage extends AdminPage {
  componentDidMount() {
    T.onSearch = (searchText) => this.props.getDmSvNganhToHopPage(undefined, undefined, searchText || '');
    T.showSearchBox();
    this.props.getDmSvNganhToHopPage();
  }

  showModal = (e) => {
    e.preventDefault();
    this.modal.show();
  }

  delete = (e, item) => {
    T.confirm('Xóa tổ hợp thi', `Bạn có chắc bạn muốn xóa tổ hợp thi ${item.tenNganh ? `<b>${item.tenNganh}</b>` : 'này'}?`, 'warning', true, isConfirm => {
      isConfirm && this.props.deleteDmSvNganhToHop(item.maNganh, error => {
        if (error) T.notify(error.message ? error.message : `Xoá tổ hợp thi ${item.tenNganh} bị lỗi!`, 'danger');
        else T.alert(`Xoá tổ hợp thi ${item.tenNganh} thành công!`, 'success', false, 800);
      });
    });
    e.preventDefault();
  }

  render() {
    const currentPermissions = this.props.system && this.props.system.user && this.props.system.user.permissions ? this.props.system.user.permissions : [],
      permission = this.getUserPermission('dmSvNganhToHop', ['read', 'write', 'delete']);

    const { pageNumber, pageSize, pageTotal, totalItem, pageCondition, list } = this.props.dmSvNganhToHop && this.props.dmSvNganhToHop.page ?
      this.props.dmSvNganhToHop.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, pageCondition: {}, totalItem: 0, list: null };
    const table = !(list && list.length > 0) ? 'Không có dữ liệu tổ hợp thi' :
      renderTable({
        getDataSource: () => list, stickyHead: false,
        renderHead: () => (
          <tr>
            <th style={{ width: 'auto', textAlign: 'right' }} nowrap='true'>#</th>
            <th style={{ width: 'auto' }} nowrap='true'>Mã</th>
            <th style={{ width: '70%' }} nowrap='true'>Tên Ngành</th>
            <th style={{ width: 'auto' }} nowrap='true'>Tổ hợp thi</th>
            <th style={{ width: '30%' }} nowrap='true'>Danh sách môn thi</th>
            <th style={{ width: 'auto' }} nowrap='true'>Kích hoạt</th>
            <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Thao tác</th>
          </tr>),
        renderRow: (item, index) => (
          <tr key={index}>
            <TableCell style={{ textAlign: 'right' }} content={(pageNumber - 1) * pageSize + index + 1} />
            <TableCell style={{ whiteSpace: 'nowrap' }} content={item.ma} />
            <TableCell type='link' content={item.tenNganh.replace('CLC', 'chất lượng cao')} onClick={() => this.modal.show(item)} />
            <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={item.maToHop} />
            <TableCell styl e={{ whiteSpace: 'nowrap' }} content={`${item.tenMon1 ? item.tenMon1 + ' -' : ''} ${item.tenMon2 ? item.tenMon2 + ' -' : ''} ${item.tenMon3 || ''}`} />
            <TableCell type='checkbox' content={item.kichHoat} permission={permission}
              onChanged={value => this.props.updateDmSvNganhToHop(item.id, { kichHoat: Number(value) })} />
            <TableCell type='buttons' content={item} permission={permission}
              onEdit={() => this.modal.show(item)} onDelete={this.delete} />
          </tr>
        ),
      });


    return this.renderPage({
      icon: 'fa fa-list-alt',
      title: 'Ngành theo tổ hợp thi',
      breadcrumb: [
        <Link key={0} to='/user/category'>Danh mục</Link>,
        'Ngành theo tổ hợp thi'
      ],
      content: <>
        <div className='tile'>{table}</div>
        <Pagination style={{ marginLeft: '70px' }} {...{ pageNumber, pageSize, pageTotal, totalItem, pageCondition }}
          getPage={this.props.getDmSvNganhToHopPage} />
        <EditModal ref={e => this.modal = e} permission={permission}
          create={this.props.createDmSvNganhToHop} update={this.props.updateDmSvNganhToHop} permissions={currentPermissions} />
      </>,
      backRoute: '/user/category',
      onCreate: permission && permission.write ? (e) => this.showModal(e) : null
    });
  }
}

const mapStateToProps = state => ({ system: state.system, dmSvNganhToHop: state.danhMuc.dmSvNganhToHop });
const mapActionsToProps = { getDmSvNganhToHopPage, deleteDmSvNganhToHop, createDmSvNganhToHop, updateDmSvNganhToHop };
export default connect(mapStateToProps, mapActionsToProps)(DmSvNganhToHopPage);
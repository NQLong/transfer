import React from 'react';
import { connect } from 'react-redux';
import { getDmSvLoaiHinhDaoTaoPage, deleteDmSvLoaiHinhDaoTao, createDmSvLoaiHinhDaoTao, updateDmSvLoaiHinhDaoTao } from './redux';
import { Link } from 'react-router-dom';
import { AdminPage, TableCell, renderTable, AdminModal, FormCheckbox, FormTextBox, getValue } from 'view/component/AdminPage';
import Pagination from 'view/component/Pagination';

class EditModal extends AdminModal {
  componentDidMount() {
    this.onShown(() => {
      !this.maLoaiHinh.value() ? this.maLoaiHinh.focus() : this.ten.focus();
    });
  }

  onShow = (item) => {
    let { ma, ten, kichHoat } = item ? item : { ma: '', ten: '', kichHoat: true };

    this.setState({ ma, item });
    this.maLoaiHinh.value(ma);
    this.ten.value(ten);
    this.kichHoat.value(kichHoat);
  };

  onSubmit = (e) => {
    e.preventDefault();
    const changes = {
      ma: getValue(this.maLoaiHinh),
      ten: getValue(this.ten),
      kichHoat: Number(getValue(this.kichHoat))
    };

    this.state.item ? this.props.update(this.state.ma, changes, this.hide) : this.props.create(changes, this.hide);

  };

  changeKichHoat = value => this.kichHoat.value(value ? 1 : 0);

  render = () => {
    const readOnly = this.props.readOnly;
    return this.renderModal({
      title: this.state.ma ? 'Cập nhật loại hình đào tạo' : 'Tạo mới loại hình đào tạo',
      size: 'large',
      body: <div className='row'>
        <FormTextBox className='col-12' ref={e => this.maLoaiHinh = e} label='Mã' readOnly={this.state.ma ? true : readOnly} placeholder='Mã' required />
        <FormTextBox className='col-12' ref={e => this.ten = e} label='Tên' readOnly={readOnly} placeholder='Tên' required />
        <FormCheckbox className='col-md-6' ref={e => this.kichHoat = e} label='Kích hoạt' isSwitch={true} readOnly={readOnly} style={{ display: 'inline-flex' }}
          onChange={value => this.changeKichHoat(value)} required />
      </div>
    }
    );
  }
}

class DmSvLoaiHinhDaoTaoPage extends AdminPage {
  componentDidMount() {
    let route = T.routeMatcher('/user/:menu/loai-hinh-dao-tao').parse(window.location.pathname);
    this.menu = route.menu == 'dao-tao' ? 'dao-tao' : 'category';
    T.ready(`/user/${this.menu}`);
    T.onSearch = (searchText) => this.props.getDmSvLoaiHinhDaoTaoPage(undefined, undefined, searchText || '');
    T.showSearchBox();
    this.props.getDmSvLoaiHinhDaoTaoPage();
  }

  showModal = (e) => {
    e.preventDefault();
    this.modal.show();
  }

  delete = (e, item) => {
    T.confirm('Xóa loại hình đào tạo', `Bạn có chắc bạn muốn xóa loại hình đào tạo ${item.ten ? `<b>${item.ten}</b>` : 'này'}?`, 'warning', true, isConfirm => {
      isConfirm && this.props.deleteDmSvLoaiHinhDaoTao(item.ma);
    });
    e.preventDefault();
  }

  render() {
    const currentPermissions = this.props.system && this.props.system.user && this.props.system.user.permissions ? this.props.system.user.permissions : [],
      permission = this.getUserPermission('dmSvLoaiHinhDaoTao', ['read', 'write', 'delete']);

    const { pageNumber, pageSize, pageTotal, totalItem, pageCondition, list } = this.props.dmSvLoaiHinhDaoTao && this.props.dmSvLoaiHinhDaoTao.page ?
      this.props.dmSvLoaiHinhDaoTao.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, list: null };
    const table = !(list && list.length > 0) ? 'Không có dữ liệu loại hình đào tạo' :
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
            <TableCell style={{ textAlign: 'right' }} content={(pageNumber - 1) * pageSize + index + 1} />
            <TableCell type='link' content={item.ma} onClick={() => this.modal.show(item)} />
            <TableCell content={item.ten} />
            <TableCell type='checkbox' content={item.kichHoat} permission={permission}
              onChanged={value => this.props.updateDmSvLoaiHinhDaoTao(item.ma, { kichHoat: Number(value) })} />
            <TableCell type='buttons' content={item} permission={permission}
              onEdit={() => this.modal.show(item)} onDelete={this.delete} />
          </tr>
        ),
      });


    return this.renderPage({
      icon: this.menu == 'dao-tao' ? 'fa fa-tasks' : 'fa fa-list-alt',
      title: 'Loại hình đào tạo',
      breadcrumb: [
        <Link key={0} to={`/user/${this.menu}`}>{this.menu == 'dao-tao' ? 'Đào tạo' : 'Danh mục'}</Link>,
        'Loại hình đào tạo'
      ],
      content: <>
        <div className='tile'>{table}</div>
        <Pagination style={{ marginLeft: '70px' }} {...{ pageNumber, pageSize, pageTotal, totalItem, pageCondition }}
          getPage={this.props.getDmSvLoaiHinhDaoTaoPage} />
        <EditModal ref={e => this.modal = e} permission={permission}
          create={this.props.createDmSvLoaiHinhDaoTao} update={this.props.updateDmSvLoaiHinhDaoTao} permissions={currentPermissions} />
      </>,
      backRoute: `/user/${this.menu}`,
      onCreate: permission && permission.write ? (e) => this.showModal(e) : null
    });
  }
}

const mapStateToProps = state => ({ system: state.system, dmSvLoaiHinhDaoTao: state.danhMuc.dmSvLoaiHinhDaoTao });
const mapActionsToProps = { getDmSvLoaiHinhDaoTaoPage, deleteDmSvLoaiHinhDaoTao, createDmSvLoaiHinhDaoTao, updateDmSvLoaiHinhDaoTao };
export default connect(mapStateToProps, mapActionsToProps)(DmSvLoaiHinhDaoTaoPage);
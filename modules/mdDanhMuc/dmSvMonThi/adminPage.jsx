import React from 'react';
import { connect } from 'react-redux';
import { getDmSvMonThiPage, deleteDmSvMonThi, createDmSvMonThi, updateDmSvMonThi } from './redux';
import { Link } from 'react-router-dom';
import { AdminPage, TableCell, renderTable, AdminModal, FormCheckbox, FormTextBox, getValue } from 'view/component/AdminPage';
import Pagination from 'view/component/Pagination';

class EditModal extends AdminModal {
  componentDidMount() {
    this.onShown(() => {
      this.ten.focus();
    });
  }

  onShow = (item) => {
    let { id, ten, kichHoat } = item ? item : { id: '', ten: '', kichHoat: true };

    this.setState({ id });
    this.ten.value(ten);
    this.kichHoat.value(kichHoat);
  };

  onSubmit = (e) => {
    e.preventDefault();
    const changes = {
      ten: getValue(this.ten),
      kichHoat: Number(getValue(this.kichHoat))
    };
    this.state.id ? this.props.update(this.state.id, changes, this.hide) : this.props.create(changes, this.hide);

  };

  changeKichHoat = value => this.kichHoat.value(value ? 1 : 0);

  render = () => {
    const readOnly = this.props.readOnly;
    return this.renderModal({
      title: this.state.id ? 'Cập nhật môn thi' : 'Tạo mới môn thi',
      size: 'large',
      body: <div className='row'>
        <FormTextBox type='text' className='col-12' ref={e => this.ten = e} label='Tên' readOnly={readOnly} placeholder='Tên' required />
        <FormCheckbox className='col-md-6' ref={e => this.kichHoat = e} label='Kích hoạt' isSwitch={true} readOnly={readOnly} style={{ display: 'inline-flex' }}
          onChange={value => this.changeKichHoat(value)} required />
      </div>
    });
  }
}

class DmSvMonThiPage extends AdminPage {
  componentDidMount() {
    let route = T.routeMatcher('/user/:menu/mon-thi').parse(window.location.pathname);
    this.menu = route.menu == 'dao-tao' ? 'dao-tao' : 'category';
    T.ready(`/user/${this.menu}`);
    T.onSearch = (searchText) => this.props.getDmSvMonThiPage(undefined, undefined, searchText || '');
    T.showSearchBox();
    this.props.getDmSvMonThiPage();
  }

  showModal = (e) => {
    e.preventDefault();
    this.modal.show();
  }

  delete = (e, item) => {
    T.confirm('Xóa môn thi', `Bạn có chắc bạn muốn xóa môn thi ${item.ten ? `<b>${item.ten}</b>` : 'này'}?`, 'warning', true, isConfirm => {
      isConfirm && this.props.deleteDmSvMonThi(item.id);
    });
    e.preventDefault();
  }

  render() {
    const currentPermissions = this.props.system && this.props.system.user && this.props.system.user.permissions ? this.props.system.user.permissions : [],
      permission = this.getUserPermission('dmSvMonThi');

    const { pageNumber, pageSize, pageTotal, totalItem, pageCondition, list } = this.props.dmSvMonThi && this.props.dmSvMonThi.page ?
      this.props.dmSvMonThi.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, list: null };
    const table = !(list && list.length > 0) ? 'Không có dữ liệu môn thi' :
      renderTable({
        getDataSource: () => list, stickyHead: false,
        renderHead: () => (
          <tr>
            <th style={{ width: 'auto' }}>#</th>
            <th style={{ width: '100%' }}>Tên</th>
            <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Kích hoạt</th>
            <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Thao tác</th>
          </tr>),
        renderRow: (item, index) => (
          <tr key={index}>
            <TableCell type='text' style={{ textAlign: 'right' }} content={(pageNumber - 1) * pageSize + index + 1} />
            <TableCell type='link' content={item.ten} onClick={() => this.modal.show(item)} />
            <TableCell type='checkbox' content={item.kichHoat} permission={permission}
              onChanged={value => this.props.updateDmSvMonThi(item.id, { kichHoat: Number(value) })} />
            <TableCell type='buttons' content={item} permission={permission}
              onEdit={() => this.modal.show(item)} onDelete={this.delete} />
          </tr>
        ),
      });


    return this.renderPage({
      icon: this.menu == 'dao-tao' ? 'fa fa-pencil' : 'fa fa-list-alt',
      title: 'Môn thi',
      breadcrumb: [
        <Link key={0} to={`/user/${this.menu}`}> {this.menu == 'dao-tao' ? 'Đào tạo' : 'Danh mục'} </Link>,
        'Môn thi'
      ],
      content: <>
        <div className='tile'>{table}</div>
        <Pagination style={{ marginLeft: '70px' }} {...{ pageNumber, pageSize, pageTotal, totalItem, pageCondition }}
          getPage={this.props.getDmSvMonThiPage} />
        <EditModal ref={e => this.modal = e} permission={permission}
          create={this.props.createDmSvMonThi} update={this.props.updateDmSvMonThi} permissions={currentPermissions} />
      </>,
      backRoute: `/user/${this.menu}`,
      onCreate: permission && permission.write ? (e) => this.showModal(e) : null
    });
  }
}

const mapStateToProps = state => ({ system: state.system, dmSvMonThi: state.danhMuc.dmSvMonThi });
const mapActionsToProps = { getDmSvMonThiPage, deleteDmSvMonThi, createDmSvMonThi, updateDmSvMonThi };
export default connect(mapStateToProps, mapActionsToProps)(DmSvMonThiPage);
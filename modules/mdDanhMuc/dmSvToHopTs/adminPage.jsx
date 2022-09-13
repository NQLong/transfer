import React from 'react';
import { connect } from 'react-redux';
import { getDmSvToHopTsPage, deleteDmSvToHopTs, createDmSvToHopTs, updateDmSvToHopTs } from './redux';
import { Link } from 'react-router-dom';
import { AdminPage, TableCell, renderTable, AdminModal, FormSelect, FormTextBox, FormRichTextBox, getValue } from 'view/component/AdminPage';
import Pagination from 'view/component/Pagination';
import { SelectAdapter_DmSvMonThi } from '../dmSvMonThi/redux';

class EditModal extends AdminModal {

  onShow = (item) => {
    let { maToHop, mon1, mon2, mon3, ghiChu } = item ? item : { maToHop: '', mon1: '', mon2: '', mon3: '', ghiChu: '' };

    this.setState({ maToHop });
    this.maToHop.value(maToHop);
    this.mon1.value(mon1);
    this.mon2.value(mon2);
    this.mon3.value(mon3);
    this.ghiChu.value(ghiChu);
  };

  onSubmit = (e) => {
    e.preventDefault();
    const changes = {
      maToHop: this.maToHop.value().trim(),
      mon1: Number(getValue(this.mon1)),
      mon2: Number(getValue(this.mon2)),
      mon3: Number(getValue(this.mon3)),
      ghiChu: this.ghiChu.value()
    };
    this.state.maToHop ? this.props.update(changes.maToHop, changes, this.hide) : this.props.create(changes, this.hide);

  };

  changeKichHoat = value => this.kichHoat.value(value);

  render = () => {
    const readOnly = this.props.readOnly;
    return this.renderModal({
      title: this.state.maToHop ? 'Cập nhật tổ hợp thi' : 'Tạo mới tổ hợp thi',
      size: 'large',
      body: <div className='row'>
        <FormTextBox type='text' className='col-12' ref={e => this.maToHop = e} label='Mã tổ hợp' readOnly={readOnly} required />
        <FormSelect className='col-4' ref={e => this.mon1 = e} label='Môn 1' readOnly={readOnly} data={SelectAdapter_DmSvMonThi} required />
        <FormSelect className='col-4' ref={e => this.mon2 = e} label='Môn 2' readOnly={readOnly} data={SelectAdapter_DmSvMonThi} required />
        <FormSelect className='col-4' ref={e => this.mon3 = e} label='Môn 3' readOnly={readOnly} data={SelectAdapter_DmSvMonThi} required />
        <FormRichTextBox className='col-12' ref={e => this.ghiChu = e} label='Ghi chú' readOnly={readOnly} />
      </div>
    });
  }
}

class DmSvToHopTsPage extends AdminPage {
  componentDidMount() {
    let route = T.routeMatcher('/user/:menu/to-hop-thi').parse(window.location.pathname);
    this.menu = route.menu == 'dao-tao' ? 'dao-tao' : 'category';
    T.ready(`/user/${this.menu}`);
    T.onSearch = (searchText) => this.props.getDmSvToHopTsPage(undefined, undefined, searchText || '');
    T.showSearchBox();
    this.props.getDmSvToHopTsPage();
  }

  showModal = (e) => {
    e.preventDefault();
    this.modal.show();
  }

  delete = (e, item) => {
    T.confirm('Xóa tổ hợp thi', `Bạn có chắc bạn muốn xóa tổ hợp thi ${item.maToHop ? `<b>${item.maToHop}</b>` : 'này'}?`, 'warning', true, isConfirm => {
      isConfirm && this.props.deleteDmSvToHopTs(item.maToHop);
    });
    e.preventDefault();
  }

  render() {
    const currentPermissions = this.props.system && this.props.system.user && this.props.system.user.permissions ? this.props.system.user.permissions : [],
      permission = this.getUserPermission('dmSvToHopTs');

    const { pageNumber, pageSize, pageTotal, totalItem, pageCondition, list } = this.props.dmSvToHopTs && this.props.dmSvToHopTs.page ?
      this.props.dmSvToHopTs.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, list: null };
    const table = !(list && list.length > 0) ? 'Không có dữ liệu tổ hợp thi' :
      renderTable({
        getDataSource: () => list, stickyHead: false,
        renderHead: () => (
          <tr>
            <th style={{ width: 'auto' }}>#</th>
            <th style={{ width: '40%', whiteSpace: 'nowrap' }}>Tổ hợp</th>
            <th style={{ width: '20%', whiteSpace: 'nowrap' }}>Môn 1</th>
            <th style={{ width: '20%', whiteSpace: 'nowrap' }}>Môn 2</th>
            <th style={{ width: '20%', whiteSpace: 'nowrap' }}>Môn 3</th>
            <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Ghi chú</th>
            <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Kích hoạt</th>
            <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Thao tác</th>
          </tr>),
        renderRow: (item, index) => (
          <tr key={index}>
            <TableCell type='text' content={index + 1} />
            <TableCell type='link' content={item.maToHop} onClick={() => this.modal.show(item)} />
            <TableCell style={{ whiteSpace: 'nowrap' }} content={item.tenMon1} />
            <TableCell style={{ whiteSpace: 'nowrap' }} content={item.tenMon2} />
            <TableCell style={{ whiteSpace: 'nowrap' }} content={item.tenMon3} />
            <TableCell content={item.ghiChu} />
            <TableCell type='checkbox' content={item.kichHoat} permission={permission}
              onChanged={value => this.props.updateDmSvToHopTs(item.maToHop, { kichHoat: Number(value) })} />
            <TableCell type='buttons' content={item} permission={permission}
              onEdit={() => this.modal.show(item)} onDelete={this.delete} />
          </tr>
        ),
      });


    return this.renderPage({
      icon: this.menu == 'category' ? 'fa fa-list-alt' : 'fa fa-object-group',
      title: 'Ngành theo tổ hợp thi',
      breadcrumb: [
        <Link key={0} to={`/user/${this.menu}`}>{this.menu == 'dao-tao' ? 'Đào tạo' : 'Danh mục'}</Link>,
        'Ngành theo tổ hợp thi'
      ],
      content: <>
        <div className='tile'>{table}</div>
        <Pagination style={{ marginLeft: '70px' }} {...{ pageNumber, pageSize, pageTotal, totalItem, pageCondition }}
          getPage={this.props.getDmSvToHopTsPage} />
        <EditModal ref={e => this.modal = e} permission={permission}
          create={this.props.createDmSvToHopTs} update={this.props.updateDmSvToHopTs} permissions={currentPermissions} />
      </>,
      backRoute: `/user/${this.menu}`,
      onCreate: permission && permission.write ? (e) => this.showModal(e) : null
    });
  }
}

const mapStateToProps = state => ({ system: state.system, dmSvToHopTs: state.danhMuc.dmSvToHopTs });
const mapActionsToProps = { getDmSvToHopTsPage, deleteDmSvToHopTs, createDmSvToHopTs, updateDmSvToHopTs };
export default connect(mapStateToProps, mapActionsToProps)(DmSvToHopTsPage);
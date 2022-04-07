import { SelectAdapter_DmDonViFaculty_V2 } from 'modules/mdDanhMuc/dmDonVi/redux';
import React from 'react';
import { connect } from 'react-redux';
import { AdminModal, AdminPage, FormSelect, FormTextBox, renderTable, TableCell } from 'view/component/AdminPage';
import Pagination from 'view/component/Pagination';
import { getDtDanhSachChuyenNganhPage } from './redux';

class EditModal extends AdminModal {
  render = () => {
    return this.renderModal({
      title: 'Thông tin chuyên ngành',
      body: <div className='row'>
        <FormTextBox ref={e => this.ten = e} className='col-12' required />
        <FormTextBox type='year' ref={e => this.nam = e} className='col-12' required />
      </div>
    });
  }
}
class DtDanhSachChuyenNganhPage extends AdminPage {
  state = { donVi: '' }
  componentDidMount() {
    T.ready('/user/pdt', () => {
      let permission = this.getUserPermission('dtDanhSachChuyenNganh', ['read']);
      this.setState({ donVi: permission.read ? 1 : this.props.system.user.staff.maDonVi }, () => {
        this.donVi?.value(this.state.donVi);
        this.getData(this.state.donVi);
      });
    });
  }

  getData = (donVi) => {
    this.props.getDtDanhSachChuyenNganhPage(undefined, undefined, '', donVi);
    this.setState({ donVi });
  }

  render() {
    let permissionDaoTao = this.getUserPermission('dtDanhSachChuyenNganh'),
      permissionManager = this.getUserPermission('manager');
    const permissionWrite = !permissionDaoTao.write && permissionManager.write;

    const { pageNumber, pageSize, pageTotal, totalItem, pageCondition, list } = this.props.dtDanhSachChuyenNganh && this.props.dtDanhSachChuyenNganh.page ?
      this.props.dtDanhSachChuyenNganh.page : { pageNumber: 1, pageSize: 200, pageTotal: 1, totalItem: 0, list: [] };

    let table = renderTable({
      getDataSource: () => list,
      stickyHead: true,
      emptyTable: 'Chưa có dữ liệu',
      renderHead: () => (<>
        <tr>
          <th style={{ width: 'auto', textAlign: 'right', whiteSpace: 'nowrap' }}>#</th>
          <th style={{ width: '100%', whiteSpace: 'nowrap' }}>Tên chuyên ngành</th>
          <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>Năm học</th>
          <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>Thao tác</th>
        </tr>
      </>),
      renderRow: (item, index) => (
        <tr key={item}>
          <TableCell style={{ textAlign: 'right', whiteSpace: 'nowrap' }} content={(pageNumber - 1) * pageSize + index + 1} />
          <TableCell content={item.ten} />
          <TableCell style={{ textAlign: 'center' }} content={item.namHoc} />
          <TableCell type='buttons' style={{ textAlign: 'center' }} content={item} permission={permissionDaoTao || permissionManager} onEdit={() => this.modal.show(item)} />
        </tr>)
    });
    return this.renderPage({
      title: 'Danh sách chuyên ngành',
      content: <>
        {permissionDaoTao.read &&
          <div className='tile'>
            <div className='tile-title'><h3>Tra cứu</h3></div>
            <div className='row'>
              <FormSelect className='col-8' label='Chọn khoa, bộ môn' placeholder='Danh sách Khoa, bộ môn' ref={e => this.donVi = e} onChange={value => this.getData(value.id)} data={SelectAdapter_DmDonViFaculty_V2} />
              <FormTextBox type='year' className='col-4' label='Nhập năm' ref={e => this.nam = e} />
              <div className='form-group col-12' style={{ justifyContent: 'end', display: 'flex' }}>
                <button className='btn btn-info' type='button' onClick={e => e.preventDefault() || this.changeAdvancedSearch()}>
                  <i className='fa fa-fw fa-lg fa-search-plus' />Tìm kiếm
                </button>
              </div>
            </div>
          </div>}
        <div className='tile'>{table}</div>
        <Pagination style={{ marginLeft: '70px' }} {...{ pageNumber, pageSize, pageTotal, totalItem, pageCondition }}
          getPage={this.props.getDtDanhSachChuyenNganhPage} />
        <EditModal ref={e => this.modal = e} />
      </>,
      backRoute: '/user/pdt',
      onCreate: permissionWrite ? (e) => e.preventDefault() || this.props.history.push('/user/pdt/dang-ky-mo-mon/new') : null
    });
  }
}

const mapStateToProps = state => ({ system: state.system, dtDanhSachChuyenNganh: state.daoTao.dtDanhSachChuyenNganh });
const mapActionsToProps = { getDtDanhSachChuyenNganhPage };
export default connect(mapStateToProps, mapActionsToProps)(DtDanhSachChuyenNganhPage);

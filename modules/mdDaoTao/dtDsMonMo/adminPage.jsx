import React from 'react';
import { connect } from 'react-redux';
import { AdminPage, renderTable } from 'view/component/AdminPage';
import Pagination from 'view/component/Pagination';
import { getDtDsMonMoPage } from './redux';
class DtDsMonMoPage extends AdminPage {
  state = { donVi: '' }
  componentDidMount() {
    T.ready('/user/pdt', () => {
      let permission = this.getUserPermission('dtDsMonMo', ['readAll']);
      this.setState({ donVi: permission.readAll ? 'all' : this.props.system.user.staff.maDonVi }, () => {
        this.props.getDtDsMonMoPage(undefined, undefined, '', this.state.donVi);
      });
    });
  }

  render() {
    let permissionDaoTao = this.getUserPermission('dtDsMonMo'),
      permissionManager = this.getUserPermission('manager');
    const permissionWrite = permissionDaoTao.write || permissionManager.write;

    const { pageNumber, pageSize, pageTotal, totalItem, pageCondition, list } = this.props.dtDsMonMo && this.props.dtDsMonMo.page ?
      this.props.dtDsMonMo.page : { pageNumber: 1, pageSize: 200, pageTotal: 1, totalItem: 0, list: [] };

    let table = renderTable({
      getDataSource: () => list,
      stickyHead: true,
      emptyTable: 'Chưa có dữ liệu',
      renderHead: () => (<>
        <tr>
          <th rowSpan='2' style={{ width: 'auto', textAlign: 'right', verticalAlign: 'middle' }}>#</th>
          <th rowSpan='2' style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap', verticalAlign: 'middle' }}>Mã học kỳ</th>
          <th rowSpan='2' style={{ width: 'auto', textAlign: 'center', verticalAlign: 'middle' }}>Nhóm</th>
          <th rowSpan='2' style={{ width: '50%', verticalAlign: 'middle' }}>Tên học phần</th>
          <th rowSpan='2' style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap', verticalAlign: 'middle' }}>Số tín chỉ</th>
          <th rowSpan='2' style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap', verticalAlign: 'middle' }}>Tổng số tiết</th>
          <th colSpan='6' rowSpan='1' style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Số tiết
          </th>
          <th rowSpan='2' style={{ width: '50%', whiteSpace: 'nowrap', verticalAlign: 'middle' }}>Khoa/Bộ môn</th>
          <th rowSpan='2' style={{ width: 'auto', textAlign: 'center', verticalAlign: 'middle' }} nowrap='true'>Thao tác</th>
        </tr>
        <tr>
          <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>LT</th>
          <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>TH</th>
          <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>TT</th>
          <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>TL</th>
          <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>ĐA</th>
          <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>LA</th>
        </tr>
      </>)
    });
    return this.renderPage({
      title: 'Danh sách môn mở gửi Phòng đào tạo',
      content: <>
        <div className='tile'>{table}</div>
        <Pagination style={{ marginLeft: '70px' }} {...{ pageNumber, pageSize, pageTotal, totalItem, pageCondition }}
          getPage={this.props.getDtDsMonMoPage} />
      </>,
      onCreate: permissionWrite ? (e) => e.preventDefault() || this.props.history.push('/user/pdt/danh-sach-mon-mo/new') : null
    });
  }
}

const mapStateToProps = state => ({ system: state.system, dtDsMonMo: state.daoTao.dtDsMonMo });
const mapActionsToProps = { getDtDsMonMoPage };
export default connect(mapStateToProps, mapActionsToProps)(DtDsMonMoPage);

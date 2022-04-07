import React from 'react';
import { connect } from 'react-redux';
import { AdminPage, renderTable, TableCell } from 'view/component/AdminPage';
import Pagination from 'view/component/Pagination';
import { getDtDangKyMoMonPage } from './redux';
class DtDangKyMoMonPage extends AdminPage {
  state = { donVi: '' }
  componentDidMount() {
    T.ready('/user/pdt', () => {
      let permission = this.getUserPermission('dtDangKyMoMon', ['readAll']);
      this.setState({ donVi: permission.readAll ? 'all' : this.props.system.user.staff.maDonVi }, () => {
        this.props.getDtDangKyMoMonPage(undefined, undefined, '', this.state.donVi);
      });
    });
  }

  render() {
    let permissionDaoTao = this.getUserPermission('dtDangKyMoMon'),
      permissionManager = this.getUserPermission('manager');
    console.log(permissionDaoTao);
    const permissionWrite = permissionDaoTao.write || permissionManager.write;

    const { pageNumber, pageSize, pageTotal, totalItem, pageCondition, list } = this.props.dtDangKyMoMon && this.props.dtDangKyMoMon.page ?
      this.props.dtDangKyMoMon.page : { pageNumber: 1, pageSize: 200, pageTotal: 1, totalItem: 0, list: [] };

    let table = renderTable({
      getDataSource: () => list,
      stickyHead: true,
      emptyTable: 'Chưa có dữ liệu',
      renderHead: () => (<>
        <tr>
          <th style={{ width: 'auto', textAlign: 'right', whiteSpace: 'nowrap' }}>#</th>
          <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Khoa, bộ môn</th>
          <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Học kỳ</th>
          <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>Năm học</th>
          <th style={{ width: '50%', textAlign: 'center', whiteSpace: 'nowrap' }}>Thời gian gửi đăng ký</th>
          <th style={{ width: '50%', textAlign: 'center', whiteSpace: 'nowrap' }}>Ghi chú</th>
          <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>Thao tác</th>
        </tr>
      </>),
      renderRow: (item, index) => (
        <tr key={item}>
          <TableCell style={{ textAlign: 'right', whiteSpace: 'nowrap' }} content={(pageNumber - 1) * pageSize + index + 1} />
          <TableCell contentClassName='multiple-lines-2' content={item.tenKhoaBoMon} />
          <TableCell content={'HK' + item.hocKy} />
          <TableCell style={{ textAlign: 'center' }} content={item.namHoc} />
          <TableCell type='date' style={{ textAlign: 'center' }} content={item.thoiGian} />
          <TableCell contentClassName='multiple-lines-4' content={item.ghiChu} />
          <TableCell type='buttons' style={{ textAlign: 'center' }} content={item} permission={permissionDaoTao || permissionManager} onEdit={`/user/pdt/dang-ky-mo-mon/${item.id}`} />
        </tr>)
    });
    return this.renderPage({
      title: 'Danh sách đợt dăng ký mở môn',
      content: <>
        <div className='tile'>{table}</div>
        <Pagination style={{ marginLeft: '70px' }} {...{ pageNumber, pageSize, pageTotal, totalItem, pageCondition }}
          getPage={this.props.getDtDangKyMoMonPage} />
      </>,
      backRoute: '/user/pdt',
      onCreate: permissionWrite ? (e) => e.preventDefault() || this.props.history.push('/user/pdt/dang-ky-mo-mon/new') : null
    });
  }
}

const mapStateToProps = state => ({ system: state.system, dtDangKyMoMon: state.daoTao.dtDangKyMoMon });
const mapActionsToProps = { getDtDangKyMoMonPage };
export default connect(mapStateToProps, mapActionsToProps)(DtDangKyMoMonPage);

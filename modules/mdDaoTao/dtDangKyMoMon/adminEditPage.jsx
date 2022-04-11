import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { AdminPage, FormTabs, FormTextBox, renderTable, TableCell } from 'view/component/AdminPage';
import { getDsMonMo } from '../dtDsMonMo/redux';
class DtDsMonMoEditPage extends AdminPage {
     state = { isCreate: false }

     componentDidMount() {
          const route = T.routeMatcher('/user/pdt/dang-ky-mo-mon/:khoa/:id').parse(window.location.pathname),
               staff = this.props.system.user.staff;
          if (staff) {
               let donVi = staff.maDonVi;
               if (Number(route.khoa) != donVi) {
                    this.props.history.push('/user/pdt/dang-ky-mo-mon');
                    T.notify('Bạn không có quyền truy cập dữ liệu này!', 'danger');
               }
          }
          this.setState({
               staff,
               donVi: Number(route.khoa),
               id: route.id == 'new' ? null : route.id,
               isCreate: (route.id == 'new')
          }, () => {
               this.props.getDsMonMo(this.state.id, this.state.donVi, (data) => this.setState({
                    dataMonMo: data.filter(item => item.isOpen == 1),
                    dataMonKhongMo: data.filter(item => item.isOpen == null)
               }));
          });
     }

     renderMonHocTable = (data) => renderTable({
          getDataSource: () => data,
          stickyHead: false,
          emptyTable: 'Chưa có dữ liệu',
          renderHead: () => (
               <>
                    <tr>
                         <th rowSpan='2' style={{ width: 'auto', textAlign: 'right', verticalAlign: 'middle' }}>#</th>
                         <th rowSpan='2' style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap', verticalAlign: 'middle' }}>Mã môn</th>
                         <th rowSpan='2' style={{ width: '100%', verticalAlign: 'middle' }}>Tên</th>
                         <th rowSpan='2' style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap', verticalAlign: 'middle' }}>Số tín chỉ</th>
                         <th rowSpan='2' style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap', verticalAlign: 'middle' }}>Tổng số tiết</th>
                         <th colSpan='6' rowSpan='1' style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Số tiết
                         </th>
                         <th rowSpan='2' style={{ width: 'auto', whiteSpace: 'nowrap', verticalAlign: 'middle' }}>Mở</th>
                    </tr>
                    <tr>
                         <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>LT</th>
                         <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>TH</th>
                         <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>TT</th>
                         <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>TL</th>
                         <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>ĐA</th>
                         <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>LA</th>
                    </tr>
               </>
          ),
          renderRow: (item, index) => (
               <tr key={index}>
                    <TableCell style={{ width: 'auto', textAlign: 'right' }} content={index + 1} />
                    <TableCell style={{ width: 'auto', textAlign: 'center' }} content={item.ma} />
                    <TableCell content={item.ten} />
                    {/* <TableCell type='link' content={item.tenMonHoc} onClick={() => this.modal.show(item)} /> */}
                    <TableCell style={{ width: 'auto', textAlign: 'center' }} content={item.soTinChi} />
                    <TableCell style={{ width: 'auto', textAlign: 'center' }} content={item.tongSoTiet} />
                    <TableCell type='number' style={{ textAlign: 'center' }} content={item.soTietLt} />
                    <TableCell type='number' style={{ textAlign: 'center' }} content={item.soTietTh} />
                    <TableCell type='number' style={{ textAlign: 'center' }} content={item.soTietTt} />
                    <TableCell type='number' style={{ textAlign: 'center' }} content={item.soTietTl} />
                    <TableCell type='number' style={{ textAlign: 'center' }} content={item.soTietDa} />
                    <TableCell type='number' style={{ textAlign: 'center' }} content={item.soTietLa} />
                    <TableCell type='checkbox' content={item.isOpen} />
               </tr>
          )
     })
     render() {
          return this.renderPage({
               title: <>Mở môn học: <i>{this.state.isCreate ? 'Đợt đăng ký mới' : 'Chỉnh sửa đợt đã đăng ký'}</i></>,
               icon: 'fa fa-paper-plane-o',
               breadcrumb: [
                    <Link key={0} to='/user/pdt'>Phòng đào tạo</Link>,
                    <Link key={1} to='/user/pdt/dang-ky-mo-mon'>Danh sách các đợt</Link>,
                    this.state.isCreate ? 'Đợt đăng ký mới' : 'Chỉnh sửa đợt đã đăng ký'
               ],
               content: <>
                    <FormTabs ref={e => this.tabs = e}
                         tabs={[
                              {
                                   title: 'Năm 1',
                                   component:
                                        <div className='tile'>
                                             <FormTextBox placeholder='Tên doanh nghiệp' ref={e => this.dnDoanhNghiepViTitle = e} required />
                                        </div>
                              },
                              {
                                   title: 'Năm 2',
                                   component:
                                        <div className='tile'>
                                             <FormTextBox placeholder='Tên doanh nghiệp' ref={e => this.dnDoanhNghiepViTitle = e} required />
                                        </div>
                              },
                              {
                                   title: 'Năm 3',
                                   component:
                                        <div className='tile'>
                                             <FormTextBox placeholder='Tên doanh nghiệp' ref={e => this.dnDoanhNghiepViTitle = e} required />
                                        </div>
                              },
                              {
                                   title: 'Năm 4',
                                   component:
                                        <div className='tile'>
                                             <FormTextBox placeholder='Tên doanh nghiệp' ref={e => this.dnDoanhNghiepViTitle = e} required />
                                        </div>
                              },
                         ]}
                    />
                    <div className='tile' style={{ height: '40vh' }}>
                         <div className='tile-title'>Danh sách môn mở:</div>
                         <div>{this.renderMonHocTable([])}</div>
                    </div>
                    <div className='tile'>
                         <div className='tile-title'>Danh sách môn không mở:</div>
                         <div>{this.renderMonHocTable([])}</div>
                    </div>
               </>,
               backRoute: '/user/pdt/dang-ky-mo-mon'
          });
     }
}
const mapStateToProps = state => ({ system: state.system, dtDsMonMo: state.daoTao.dtDsMonMo });
const mapActionsToProps = {
     getDsMonMo
};
export default connect(mapStateToProps, mapActionsToProps)(DtDsMonMoEditPage);
import React from 'react';
import { connect } from 'react-redux';
import { getDmMonHocPage, createDmMonHoc, updateDmMonHoc, deleteDmMonHoc } from './redux';
import { Link } from 'react-router-dom';
import { getDmDonViAll, SelectAdapter_DmDonViFaculty_V2 } from 'modules/mdDanhMuc/dmDonVi/redux';
import { AdminPage, AdminModal, renderTable, TableCell, FormTextBox, FormCheckbox, FormSelect, FormRichTextBox } from 'view/component/AdminPage';
import Pagination from 'view/component/Pagination';
import { SelectAdapter_DmSvLoaiHinhDaoTao } from 'modules/mdDanhMuc/dmSvLoaiHinhDaoTao/redux';

class EditModal extends AdminModal {
     state = { active: true, ma: '' };

     componentDidMount() {
          $(document).ready(() => this.onShown(() => {
               !this.ma.value() ? this.ma.focus() : this.ten.focus();
          }));
     }

     onShow = (item) => {
          let { ma, ten, soTinChi, tongSoTiet, soTietLt, soTietTh, soTietTt, soTietTl, soTietDa, soTietLa, tinhChatPhong, tenTiengAnh,
               boMon, loaiHinh, chuyenNganh, ghiChu, maCtdt, tenCtdt, kichHoat } = item ? item : { ma: '', ten: '', soTinChi: 0, tongSoTiet: 0, soTietLt: 0, soTietTh: 0, soTietTt: 0, soTietTl: 0, soTietDa: 0, soTietLa: 0, tinhChatPhong: '', tenTiengAnh: '', boMon: 0, loaiHinh: '', chuyenNganh: '', ghiChu: '', maCtdt: '', tenCtdt: '', kichHoat: 1 };

          this.ma.value(ma);
          this.ten.value(ten);
          this.soTinChi.value(soTinChi);
          this.tongSoTiet.value(tongSoTiet);
          this.soTietLt.value(soTietLt);
          this.soTietTh.value(soTietTh);
          this.soTietTt.value(soTietTt);
          this.soTietTl.value(soTietTl);
          this.soTietDa.value(soTietDa);
          this.soTietLa.value(soTietLa);
          this.tinhChatPhong.value(tinhChatPhong || '');
          this.tenTiengAnh.value(tenTiengAnh || '');
          this.boMon.value(boMon || (this.props.khoa != 'all' ? this.props.khoa : ''));
          this.loaiHinh.value(loaiHinh || '');
          this.chuyenNganh.value(chuyenNganh || '');
          this.ghiChu.value(ghiChu || '');
          this.maCtdt.value(maCtdt || '');
          this.tenCtdt.value(tenCtdt || '');
          this.kichHoat.value(kichHoat);
          this.setState({ active: kichHoat == 1, ma: ma });

     };

     changeKichHoat = value => this.kichHoat.value(value ? 1 : 0) || this.kichHoat.value(value);

     onSubmit = (e) => {
          e.preventDefault();
          const
               changes = {
                    ma: this.ma.value(),
                    ten: this.ten.value(),
                    soTinChi: this.soTinChi.value(),
                    tongSoTiet: this.tongSoTiet.value(),
                    soTietLt: this.soTietLt.value(),
                    soTietTh: this.soTietTh.value(),
                    soTietTt: this.soTietTt.value(),
                    soTietTl: this.soTietTl.value(),
                    soTietDa: this.soTietDa.value(),
                    soTietLa: this.soTietLa.value(),
                    tinhChatPhong: this.tinhChatPhong.value(),
                    tenTiengAnh: this.tenTiengAnh.value(),
                    boMon: this.boMon.value(),
                    loaiHinh: this.loaiHinh.value(),
                    chuyenNganh: this.chuyenNganh.value(),
                    ghiChu: this.ghiChu.value(),
                    maCtdt: this.maCtdt.value(),
                    tenCtdt: this.tenCtdt.value(),
                    kichHoat: this.state.active ? '1' : '0',
               };
          if (changes.ma == '') {
               T.notify('Mã môn học bị trống!', 'danger');
               this.ma.focus();
          } else if (changes.ten == '') {
               T.notify('Tên môn học bị trống!', 'danger');
               this.ten.focus();
          } else if (changes.soTinChi <= 0) {
               T.notify('Số tín chỉ phải lớn hơn 0!', 'danger');
               this.tongSoTiet.focus();
          } else if (changes.tongSoTiet <= 0) {
               T.notify('Tổng số tiết phải lớn hơn 0!', 'danger');
               this.tongSoTiet.focus();
          } else {
               this.state.ma ? this.props.update(this.state.ma, changes, this.hide) : this.props.create(changes, this.hide);
          }
     }

     render = () => {
          const readOnly = this.props.readOnly;
          return this.renderModal({
               title: this.state.ma ? 'Cập nhật môn học' : 'Tạo mới môn học',
               size: 'elarge',
               body: <div className='row'>
                    <FormTextBox className='col-12' ref={e => this.ma = e} label='Mã môn học' readOnly={this.state.ma ? true : readOnly} placeholder='Mã môn học' required />
                    <FormTextBox className='col-12' ref={e => this.ten = e} label='Tên môn học' readOnly={readOnly} placeholder='Tên môn học' required />
                    <FormTextBox className='col-12' ref={e => this.tenTiengAnh = e} label='Tên tiếng Anh' readOnly={readOnly} placeholder='Tên tiếng Anh' />
                    <FormTextBox type='number' className='col-6' ref={e => this.soTinChi = e} label='Số tín chỉ' readOnly={readOnly} placeholder='Số tín chỉ' required />
                    <FormTextBox type='number' className='col-6' ref={e => this.tongSoTiet = e} label='Tổng số tiết' readOnly={readOnly} placeholder='Tổng số tiết' required />
                    <FormTextBox type='number' className='col-2' ref={e => this.soTietLt = e} label='Số tiết LT' readOnly={readOnly} placeholder='Số tiết LT' required />
                    <FormTextBox type='number' className='col-2' ref={e => this.soTietTh = e} label='Số tiết TH' readOnly={readOnly} placeholder='Số tiết TH' required />
                    <FormTextBox type='number' className='col-2' ref={e => this.soTietTt = e} label='Số tiết TT' readOnly={readOnly} placeholder='Số tiết TT' required />
                    <FormTextBox type='number' className='col-2' ref={e => this.soTietTl = e} label='Số tiết TL' readOnly={readOnly} placeholder='Số tiết TL' required />
                    <FormTextBox type='number' className='col-2' ref={e => this.soTietDa = e} label='Số tiết DA' readOnly={readOnly} placeholder='Số tiết DA' required />
                    <FormTextBox type='number' className='col-2' ref={e => this.soTietLa = e} label='Số tiết LA' readOnly={readOnly} placeholder='Số tiết LA' required />
                    <FormTextBox className='col-12' ref={e => this.tinhChatPhong = e} label='Tính chất phòng' readOnly={readOnly} placeholder='Tính chất phòng' />
                    <FormSelect className='col-12' ref={e => this.boMon = e} data={SelectAdapter_DmDonViFaculty_V2} label='Khoa/Bộ Môn' readOnly={readOnly || this.props.khoa} required />
                    <FormSelect className='col-6' ref={e => this.loaiHinh = e} label='Loại hình' readOnly={readOnly} data={SelectAdapter_DmSvLoaiHinhDaoTao} placeholder='Loại hình' />
                    <FormTextBox className='col-6' ref={e => this.chuyenNganh = e} label='Chuyên ngành' readOnly={readOnly} placeholder='Chuyên ngành' />
                    <FormTextBox className='col-12' ref={e => this.ghiChu = e} label='Ghi chú' readOnly={readOnly} placeholder='Ghi chú' />
                    <FormRichTextBox rows='5' className='col-6' ref={e => this.maCtdt = e} label='Mã CTĐT' readOnly={readOnly} placeholder='Mã CTĐT' />
                    <FormRichTextBox rows='5' className='col-6' ref={e => this.tenCtdt = e} label='Tên CTĐT' readOnly={readOnly} placeholder='Tên CTĐT' />
                    <FormCheckbox className='col-md-6' ref={e => this.kichHoat = e} label='Kích hoạt' isSwitch={true} readOnly={readOnly} style={{ display: 'inline-flex', margin: 0 }}
                         onChange={value => this.changeKichHoat(value ? 1 : 0)} />
               </div>
          });
     }
}

class DmMonHocPage extends AdminPage {
     donViMapper = {};
     state = { donViFilter: '' }
     componentDidMount() {
          this.props.getDmDonViAll(items => {
               if (items) {
                    this.donViMapper = {};
                    items.forEach(item => this.donViMapper[item.ma] = item.ten);
               }
          });
          T.ready('/user/pdt', () => {
               T.clearSearchBox();
               this.setState({ donViFilter: this.props.system.user.staff?.maDonVi });
               T.onSearch = (searchText) => this.props.getDmMonHocPage(undefined, undefined, {
                    searchTerm: searchText || '',
               });
               T.showSearchBox();
               this.props.getDmMonHocPage(undefined, undefined, {
                    searchTerm: ''
               });
          });
     }

     showModal = (e) => {
          e.preventDefault();
          this.modal.show();
     }

     delete = (e, item) => {
          e.preventDefault();
          T.confirm('Xóa môn học', 'Bạn có chắc bạn muốn xóa môn học này?', true, isConfirm =>
               isConfirm && this.props.deleteDmMonHoc(item.ma));
     }

     render() {
          const permissionDaoTao = this.getUserPermission('dmMonHoc', ['read', 'write', 'delete', 'manage']);
          let permission = {
               write: permissionDaoTao.write || permissionDaoTao.manage,
               delete: permissionDaoTao.delete || permissionDaoTao.manage
          };
          const { pageNumber, pageSize, pageTotal, totalItem, pageCondition, list } = this.props.dmMonHoc && this.props.dmMonHoc.page ?
               this.props.dmMonHoc.page : {
                    pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, pageCondition: {
                         searchTerm: '', donViFilter: this.state.donViFilter
                    }, list: []
               };

          let table = renderTable({
               emptyTable: 'Chưa có dữ liệu môn học',
               getDataSource: () => list, stickyHead: false,
               renderHead: () => (
                    <>
                         <tr>
                              <th rowSpan='2' style={{ width: 'auto', textAlign: 'right', verticalAlign: 'middle' }}>#</th>
                              <th rowSpan='2' style={{ width: 'auto', verticalAlign: 'middle' }}>Mã</th>
                              <th rowSpan='2' style={{ width: 'auto', verticalAlign: 'middle' }}>Tên môn học</th>
                              <th rowSpan='2' style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center', verticalAlign: 'middle' }}>Số tín chỉ</th>
                              <th rowSpan='2' style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center', verticalAlign: 'middle' }}>Tổng số tiết</th>
                              <th colSpan='6' rowSpan='1' style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Số tiết
                              </th>
                              <th rowSpan='2' style={{ width: '100%', whiteSpace: 'nowrap', verticalAlign: 'middle' }}>Khoa/Bộ môn</th>
                              <th rowSpan='2' style={{ width: 'auto', whiteSpace: 'nowrap', verticalAlign: 'middle' }}>Danh sách CTĐT</th>
                              <th rowSpan='2' style={{ width: 'auto', verticalAlign: 'middle' }} nowrap='true'>Kích hoạt</th>
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
                    </>),
               renderRow: (item, index) => (
                    <tr key={index}>
                         <TableCell style={{ textAlign: 'right' }} content={(pageNumber - 1) * pageSize + index + 1} />
                         <TableCell type='link' content={item.ma} onClick={() => this.modal.show(item)} />
                         <TableCell contentClassName='multiple-lines-3' content={item.ten} />
                         <TableCell type='number' style={{ textAlign: 'center' }} content={item.soTinChi} />
                         <TableCell type='number' style={{ textAlign: 'center' }} content={item.tongSoTiet} />
                         <TableCell type='number' style={{ textAlign: 'center' }} content={item.soTietLt} />
                         <TableCell type='number' style={{ textAlign: 'center' }} content={item.soTietTh} />
                         <TableCell type='number' style={{ textAlign: 'center' }} content={item.soTietTt} />
                         <TableCell type='number' style={{ textAlign: 'center' }} content={item.soTietTl} />
                         <TableCell type='number' style={{ textAlign: 'center' }} content={item.soTietDa} />
                         <TableCell type='number' style={{ textAlign: 'center' }} content={item.soTietLa} />
                         <TableCell content={this.donViMapper && this.donViMapper[item.boMon] ? this.donViMapper[item.boMon] : ''} />
                         <TableCell contentClassName='multiple-lines-4' content={item.tenCtdt?.split(',').map((ctdt, index) => <div key={index}>{ctdt} <br /></div>)} />
                         <TableCell type='checkbox' content={item.kichHoat} permission={permission}
                              onChanged={value => this.props.updateDmMonHoc(item.ma, { kichHoat: value ? 1 : 0, })} />
                         <TableCell type='buttons' content={item} permission={permission}
                              onEdit={() => this.modal.show(item)} onDelete={this.delete} />
                    </tr>)
          });

          return this.renderPage({
               icon: 'fa fa-leanpub',
               title: 'Danh sách Môn Học',
               breadcrumb: [
                    <Link key={0} to='/user/pdt'>Đào tạo</Link>,
                    'Danh sách Môn Học'
               ],
               header: permissionDaoTao.read && <FormSelect style={{ width: '300px', marginBottom: '0' }} placeholder='Danh sách khoa/bộ môn' ref={e => this.donVi = e} onChange={value => {
                    T.clearSearchBox();
                    this.setState({ donViFilter: value ? value.id : '' });
                    this.props.getDmMonHocPage(undefined, undefined, {
                         searchTerm: '',
                         donViFilter: value && value.id
                    });
               }} data={SelectAdapter_DmDonViFaculty_V2} allowClear={true} />,
               content: <>
                    <div className='tile'>{table}</div>
                    <Pagination style={{ marginLeft: '70px' }} {...{ pageNumber, pageSize, pageTotal, totalItem, pageCondition }}
                         getPage={this.props.getDmMonHocPage} />
                    <EditModal ref={e => this.modal = e} permission={permission} readOnly={!permission.write}
                         create={this.props.createDmMonHoc} update={this.props.updateDmMonHoc} khoa={this.state.donViFilter} />
               </>,
               backRoute: '/user/pdt',
               onCreate: permission.write ? (e) => this.showModal(e) : null,
          });
     }
}

const mapStateToProps = state => ({ system: state.system, dmMonHoc: state.daoTao.dmMonHoc });
const mapActionsToProps = { getDmDonViAll, getDmMonHocPage, createDmMonHoc, updateDmMonHoc, deleteDmMonHoc };
export default connect(mapStateToProps, mapActionsToProps)(DmMonHocPage);
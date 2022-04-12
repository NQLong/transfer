import React from 'react';
import { connect } from 'react-redux';
import { createMultiDtChuongTrinhDaoTao, getDtChuongTrinhDaoTao, getDtKhungDaoTao } from './redux';
import { Link } from 'react-router-dom';
import { AdminPage, FormRichTextBox, FormSelect, FormTabs, FormTextBox } from 'view/component/AdminPage';
import ComponentKienThuc from './componentKienThuc';
import { SelectAdapter_DtNganhDaoTaoMa } from '../dtNganhDaoTao/redux';
import { SelectAdapter_DmDonViFaculty_V2 } from 'modules/mdDanhMuc/dmDonVi/redux';
import { SelectAdapter_DmSvBacDaoTao } from 'modules/mdDanhMuc/dmSvBacDaoTao/redux';
import { SelectAdapter_DmSvLoaiHinhDaoTao } from 'modules/mdDanhMuc/dmSvLoaiHinhDaoTao/redux';


class DtChuongTrinhDaoTaoDetails extends AdminPage {
     state = {}
     componentDidMount() {
          T.ready('/user/dao-tao', () => {
               const route = T.routeMatcher('/user/dao-tao/chuong-trinh-dao-tao/:ma');
               this.ma = route.parse(window.location.pathname)?.ma;
               if (this.ma !== 'new') {
                    this.props.getDtKhungDaoTao(this.ma, (data) => {
                         this.khoa.value(data.maKhoa);
                         this.namDaoTao.value(data.namDaoTao);
                         this.props.getDtChuongTrinhDaoTao(this.ma, (ctdt) => {
                              //TODO: Group SQL
                              [this.kienThucDaiCuong, this.kienThucCoSoNganh, this.kienThucChuyeNganh, this.kienThucBoTro, this.kienThucLVTN].forEach(e => e.setVal(ctdt, data.maKhoa));
                         });
                    });
               } else {
                    const maKhoa = this.props.system?.user?.maDonVi;
                    this.khoa.value(maKhoa);
                    [this.kienThucDaiCuong, this.kienThucCoSoNganh, this.kienThucChuyeNganh, this.kienThucBoTro, this.kienThucLVTN].forEach(e => e.setVal(null, maKhoa));
               }

          });
     }

     save = () => {
          const kienThucDaiCuong = this.kienThucDaiCuong.getValue() || [];
          const kienThucCoSoNganh = this.kienThucCoSoNganh.getValue() || [];
          const kienThucChuyeNganh = this.kienThucChuyeNganh.getValue() || [];
          const kienThucBoTro = this.kienThucBoTro.getValue() || [];
          const kienThucLVTN = this.kienThucLVTN.getValue() || [];
          const namDaoTao = this.namDaoTao.value();
          const maKhoa = this.khoa.value();
          if (!namDaoTao) {
               T.notify('Năm đào tạo bị trống!', 'danger');
               this.namDaoTao.focus();
          } else {
               const items = [...kienThucDaiCuong, ...kienThucCoSoNganh, ...kienThucChuyeNganh, ...kienThucBoTro, ...kienThucLVTN];
               const data = { items: items, ...{ id: this.ma, namDaoTao, maKhoa } };
               this.props.createMultiDtChuongTrinhDaoTao(data, () => {
                    location.reload();
               });
          }
     }

     render() {
          const isData = this.props.dtChuongTrinhDaoTao ? this.props.dtChuongTrinhDaoTao : null;
          const permission = this.getUserPermission('dtChuongTrinhDaoTao', ['read', 'readAll', 'write', 'delete']);
          const readOnly = !permission.write;

          return this.renderPage({
               icon: 'fa fa-university',
               title: isData ? 'Chỉnh sửa chương trình đào tạo' : 'Tạo mới chương trình đào tạo',
               breadcrumb: [
                    <Link key={0} to='/user/dao-tao'>Đào tạo</Link>,
                    'Chương trình đào tạo'
               ],
               content: <>
                    <div className='tile'>
                         <h3 className='tile-title'>1. Thông tin chung về chương trình đào tạo</h3>
                         <div className='tile-body'>
                              <div className='row'>
                                   <div className='row col-12' style={{ display: 'flex', alignItems: 'end' }}>
                                        <FormSelect ref={e => this.maNganh = e} data={SelectAdapter_DtNganhDaoTaoMa} label='Mã ngành' className='form-group col-md-4' onChange={value => {
                                             this.tenNganhVi.value(value.name);
                                             this.setState({ tenNganhVi: value.name });
                                        }} required />
                                        <div style={{ marginBottom: '0' }} className='form-group col-md-8'>
                                             <FormTabs tabs={[
                                                  {
                                                       title: <>Tên ngành tiếng Việt  <span style={{ color: 'red' }}>*</span></>,
                                                       component: <FormTextBox ref={e => this.tenNganhVi = e} placeholder='Tên tiếng Việt' />
                                                  },
                                                  {
                                                       title: <>Tên ngành tiếng Anh  <span style={{ color: 'red' }}>*</span></>,
                                                       component: <FormTextBox ref={e => this.tenNganhEn = e} placeholder='Tên tiếng Anh' />
                                                  }
                                             ]} />
                                        </div>
                                   </div>
                                   <FormTextBox ref={e => this.namDaoTao = e} label='Năm đào tạo' className='col-md-3' required readOnly={readOnly} />
                                   <FormSelect ref={e => this.trinhDoDaoTao = e} label='Trình độ đào tạo' data={SelectAdapter_DmSvBacDaoTao} className='col-md-3' required readOnly={readOnly} />
                                   <FormSelect ref={e => this.loaiHinhDaoTao = e} label='Loại hình đào tạo' data={SelectAdapter_DmSvLoaiHinhDaoTao} className='col-md-3' required readOnly={readOnly} />
                                   <FormTextBox type='number' suffix=' năm' step={0.5} ref={e => this.thoiGianDaoTao = e} label='Thời gian đào tạo' className='col-md-3' required readOnly={readOnly} />
                                   <div className='form-group col-md-12'>
                                        <label>Tên văn bằng sau khi tốt nghiệp: </label>
                                        <FormTabs tabs={[
                                             {
                                                  title: <>Tiếng Việt  <span style={{ color: 'red' }}>*</span></>,
                                                  component: <FormTextBox ref={e => this.tenVanBangVi = e} placeholder='Tên tiếng Việt' />
                                             },
                                             {
                                                  title: <>Tiếng Anh  <span style={{ color: 'red' }}>*</span></>,
                                                  component: <FormTextBox ref={e => this.tenVanBangEn = e} placeholder='Tên tiếng Anh' />
                                             }
                                        ]} />
                                   </div>
                                   <FormSelect ref={e => this.khoa = e} data={SelectAdapter_DmDonViFaculty_V2} label='Nơi đào tạo' className='col-12' readOnly={true} />
                              </div>
                         </div>
                    </div>

                    <div className='tile'>
                         <h3 className='tile-title'>2. Mục tiêu đào tạo</h3>
                         <div className='tile-body'>
                              <div className='row'>
                                   <h4 className='form-group col-12'>2.1. Mục tiêu chung</h4>
                                   <FormRichTextBox ref={e => this.mucTieuChung = e} placeholder='Xác định mục tiêu của CTĐT về: năng lực kiến thức, năng lực thực hành nghề nghiệp của người tốt nghiệp, …' className='form-group col-12' rows={5} />
                                   <h4 className='form-group col-12'>2.1. Mục tiêu cụ thể</h4>
                                   <p className='form-group col-12'>Sinh viên tốt nghiệp ngành {this.state.tenNganhVi || ''} có các kiến thức, kỹ năng và năng lực nghề nghiệp như sau:</p>

                                   {/*TODO: DT_MUC_TIEU_DAO_DAO*/}
                                   <FormRichTextBox ref={e => this.mucTieuCuThe1 = e} label={<b><i>1. Kiến thức và lập luận ngành</i></b>} placeholder='Về kiến thức và lập luận ngành' className='form-group col-12' />
                                   <FormRichTextBox ref={e => this.mucTieuCuThe2 = e} label={<b><i>2. Kỹ năng, phẩm chất cá nhân và nghề nghiệp</i></b>} placeholder='Về kỹ năng, phẩm chất cá nhân và nghề nghiệp' className='form-group col-12' />
                                   <FormRichTextBox ref={e => this.mucTieuCuThe3 = e} label={<b><i>3. Kỹ năng làm việc nhóm và giao tiếp</i></b>} placeholder='Về kỹ năng làm việc nhóm và giao tiếp' className='form-group col-12' />
                                   <FormRichTextBox ref={e => this.mucTieuCuThe4 = e} label={<b><i>4. Năng lực thực hành nghề nghiệp</i></b>} placeholder='Về năng lực thực hành nghề nghiệp' className='form-group col-12' />
                              </div>
                         </div>
                    </div>

                    <ComponentKienThuc title={'Kiến thức giáo dục đại cương'} khoiKienThucId={1} ref={e => this.kienThucDaiCuong = e} />
                    <ComponentKienThuc title={'Kiến thức cơ sở ngành'} khoiKienThucId={9} ref={e => this.kienThucCoSoNganh = e} />
                    <ComponentKienThuc title={'Kiến thức chuyên ngành'} khoiKienThucId={10} ref={e => this.kienThucChuyeNganh = e} />
                    <ComponentKienThuc title={'Kiến thức bổ trợ'} khoiKienThucId={33} ref={e => this.kienThucBoTro = e} />
                    <ComponentKienThuc title={'Thực tập, khóa luận/luận văn tốt nghiệp'} khoiKienThucId={11} ref={e => this.kienThucLVTN = e} />

               </>,
               backRoute: '/user/dao-tao/chuong-trinh-dao-tao',
               onSave: permission.write ? this.save : null,
          });
     }
}

const mapStateToProps = state => ({ system: state.system, dtChuongTrinhDaoTao: state.daoTao.dtChuongTrinhDaoTao });
const mapActionsToProps = { createMultiDtChuongTrinhDaoTao, getDtChuongTrinhDaoTao, getDtKhungDaoTao };
export default connect(mapStateToProps, mapActionsToProps)(DtChuongTrinhDaoTaoDetails);
import { SelectAdapter_DmBenhVienV2 } from 'modules/mdDanhMuc/dmBenhVien/reduxBenhVien';
import { SelectAdapter_DmDienHopDongV2 } from 'modules/mdDanhMuc/dmDienHopDong/redux';
import { SelectAdapter_DmDonVi } from 'modules/mdDanhMuc/dmDonVi/redux';
import { SelectAdapter_DmLoaiHopDongV2 } from 'modules/mdDanhMuc/dmLoaiHopDong/redux';
import { SelectAdapter_DmNgachCdnnV2 } from 'modules/mdDanhMuc/dmNgachCdnn/redux';
import { SelectAdapter_DmQuocGia } from 'modules/mdDanhMuc/dmQuocGia/redux';
import React from 'react';
import { connect } from 'react-redux';
import { AdminPage, FormCheckbox, FormDatePicker, FormRichTextBox, FormSelect, FormTextBox } from 'view/component/AdminPage';
import ComponentChucVu from '../qtChucVu/componentChucVu';
import { getStaffEdit } from './redux';
class ComponentTTCongTac extends AdminPage {
    state = {};
    chucVu = [];
    shcc = '';
    state = { doiTuongBoiDuong: false, tinhTrangBoiDuong: false, dangONuocNgoai: false, dangNghiTheoCheDo: false, daNghi: false };

    value = (item) => {
        this.chucVu = item.chucVu;
        console.log(item.chucVu);
        this.shcc = item.shcc;
        this.ngheNghiepCu.value(item.ngheNghiepCu ? item.ngheNghiepCu : '');
        this.ngayBatDauCongTac.value(item.ngayBatDauCongTac ? item.ngayBatDauCongTac : '');
        this.ngayBienChe.value(item.ngayBienChe ? item.ngayBienChe : '');
        this.donViTuyenDung.value(item.donViTuyenDung ? item.donViTuyenDung : '');
        this.chucDanh.value(item.chucDanh ? item.chucDanh : '');

        this.componentChucVuDoanThe.value(this.chucVu ? this.chucVu  : [], 0, this.shcc);
        this.componentChucVuChinhQuyen?.value(this.chucVu ? this.chucVu : [], 1, this.shcc);

        this.bacLuong.value(item.bacLuong ? item.bacLuong : '');
        this.heSo.value(item.heSoLuong ? item.heSoLuong : '');
        this.ngayHuong.value(item.ngayHuongLuong ? item.ngayHuongLuong : '');
        this.tiLeVuotKhung.value(item.tyLeVuotKhung ? item.tyLeVuotKhung : '');

        this.soBhxh.value(item.soBhxh ? item.soBhxh : '');
        this.ngayBatDauBhxh.value(item.ngayBatDauBhxh ? item.ngayBatDauBhxh : '');
        this.ngayKetThucBhxh.value(item.ngayKetThucBhxh ? item.ngayKetThucBhxh : '');
        this.soBhyt.value(item.maTheBhyt ? item.maTheBhyt : '');
        this.noiKhamBenhBanDau.value(item.noiKhamChuaBenhBanDau ? item.noiKhamChuaBenhBanDau : '');

        this.doiTuongBoiDuong.value(item.doiTuongBoiDuongKienThucQpan ? item.doiTuongBoiDuongKienThucQpan : 0);
        this.setState({ doiTuongBoiDuong: item.doiTuongBoiDuongKienThucQpan ? item.doiTuongBoiDuongKienThucQpan : 0});
        this.state.doiTuongBoiDuong ? this.loaiDoiTuongBoiDuong.value(item.loaiDoiTuongBoiDuong ? item.loaiDoiTuongBoiDuong : '') : null;
        this.state.doiTuongBoiDuong ? this.tinhTrangBoiDuong.value(item.tinhTrangBoiDuong ? item.tinhTrangBoiDuong : 0) : null;
        this.state.doiTuongBoiDuong && this.setState({ tinhTrangBoiDuong: item.tinhTrangBoiDuong ? item.tinhTrangBoiDuong : 0 });
        this.state.tinhTrangBoiDuong ? this.namBoiDuong.value(item.namBoiDuong ? item.namBoiDuong : '') : null;
        this.state.tinhTrangBoiDuong ? this.khoaBoiDuong.value(item.khoaBoiDuong ? item.khoaBoiDuong : '') : null;


        this.dangONuocNgoai.value(item.dangONuocNgoai ? item.dangONuocNgoai : 0);
    }

    render() {
        

        return (
            <div className='tile'>
                <h3 className='tile-title'>Thông tin công tác</h3>
                <div className='tile-body row'>
                    <FormTextBox className='col-md-6' ref={e => this.ngheNghiepCu = e} label='Nghề nghiệp trước khi tuyển dụng' />
                    <FormDatePicker type='date_mask' className='col-md-6' ref={e => this.ngayBatDauCongTac = e} label='Ngày bắt đầu công tác tại trường' />
                    <FormDatePicker type='date_mask' className='col-md-6' ref={e => this.ngayBienChe = e} label='Ngày vào biên chế' />
                    <FormSelect data={SelectAdapter_DmDonVi} className='col-md-6' ref={e => this.donViTuyenDung = e} label='Đơn vị ban hành Quyết định tuyển dụng' />
                    <FormSelect data={SelectAdapter_DmNgachCdnnV2} className='col-md-4' ref={e => this.chucDanh = e} label='Chức danh nghề nghiệp' />
                    <FormSelect data={SelectAdapter_DmDienHopDongV2} className='col-md-4' ref={e => this.dienHopDong = e} label='Diện hợp đồng' />
                    <FormSelect data={SelectAdapter_DmLoaiHopDongV2} className='col-md-4' ref={e => this.loaiHopDong = e} label='Loại hợp đồng' />

                    <ComponentChucVu ref={e => this.componentChucVuChinhQuyen = e} label='Chức vụ chính quyền' userEdit={false} />
                    <ComponentChucVu ref={e => this.componentChucVuDoanThe = e} label='Chức vụ đoàn thể' userEdit={false} />

                    <FormTextBox ref={e => this.bacLuong = e} className='col-md-3' label='Bậc lương' />
                    <FormTextBox ref={e => this.heSo = e} className='col-md-3' label='Hệ số lương hiện hưởng' />
                    <FormDatePicker ref={e => this.ngayHuong = e} className='col-md-3' label='Ngày hưởng' />
                    <FormTextBox ref={e => this.tiLeVuotKhung = e} className='col-md-3' label='Tỉ lệ vượt khung' />

                    <FormTextBox ref={e => this.phuCapChucVu = e} className='col-md-4' label='Mức phụ cấp chức vụ' />
                    <FormTextBox ref={e => this.tiLePhuCapThamNien = e} className='col-md-4' label='Tỉ lệ phụ cấp thâm niên' />
                    <FormTextBox ref={e => this.tiLePhuCapUuDai = e} className='col-md-4' label='Tỉ lệ phụ cấp ưu đãi' />

                    <FormTextBox ref={e => this.soBhxh = e} className='col-md-4' label='Mã số Bảo hiểm xã hội' />
                    <FormDatePicker ref={e => this.ngayBatDauBhxh = e} className='col-md-4' label='Từ tháng, năm' type='month-mask' />
                    <FormDatePicker ref={e => this.ngayKetThucBhxh = e} className='col-md-4' label='Đến tháng, năm' type='month-mask' />
                    <FormTextBox ref={e => this.soBhyt = e} className='col-md-4' label='Mã thẻ Bảo hiểm y tế' />
                    <FormSelect ref={e => this.noiKhamBenhBanDau = e} className='col-md-8' label='Nơi khám chữa bệnh ban đầu' data={SelectAdapter_DmBenhVienV2} />
                    <div className='form-group col-md-12'></div>
                   
                    <FormCheckbox ref={e => this.doiTuongBoiDuong = e} label='Đối tượng bồi dưỡng kiến thức Quốc phòng và An ninh' onChange={value => this.setState({ doiTuongBoiDuong: value })} className='col-md-12' />
                    {this.state.doiTuongBoiDuong ? <FormSelect ref={e => this.loaiDoiTuongBoiDuong = e} label='Loại đối tượng bồi dưỡng' data={[{ id: 2, text: 'Loại 2' }, { id: 3, text: 'Loại 3' }, { id: 4, text: 'Loại 4' }]} className='col-md-3' /> : null}
                    {this.state.doiTuongBoiDuong ? <FormCheckbox ref={e => this.tinhTrangBoiDuong = e} label='Đã tham gia bồi dưỡng' onChange={value => this.setState({ tinhTrangBoiDuong: value })} className='col-md-3' />  : null}
                    {this.state.tinhTrangBoiDuong ? <FormTextBox type='year' ref={e => this.namBoiDuong = e} label='Năm bồi dưỡng' className='col-md-2' />  : null}
                    {this.state.tinhTrangBoiDuong ? <FormTextBox ref={e => this.khoaBoiDuong = e} label='Khóa bồi dưỡng' placeholder='Ghi rõ khóa mấy, dành cho đối tượng nào' className='col-md-4' />  : null}

                    <div className='form-group col-md-12'></div>
                    <div className='form-group col-md-12'></div>

                    <FormCheckbox ref={e => this.dangONuocNgoai = e} label='Đang ở nước ngoài'  onChange={value => this.setState({ dangONuocNgoai: value })} className='col-md-3' />
                    {this.state.dangONuocNgoai ? <FormSelect ref={e => this.quocGiaDangO = e} label='Quốc gia' className='col-md-3' data={SelectAdapter_DmQuocGia} />: null} 
                    {this.state.dangONuocNgoai ? <FormDatePicker mask='date-mask' ref={e => this.ngayBatDauONuocNgoai = e} label='Từ ngày' className='col-md-3'/> : null} 
                    {this.state.dangONuocNgoai ? <FormDatePicker mask='date-mask' ref={e => this.ngayKetThucONuocNgoai = e} label='Đến ngày' className='col-md-3' />: null} 
                    {this.state.dangONuocNgoai ? <FormRichTextBox ref={e => this.lyDoONuocNgoai = e} label='Lý do/Nội dung' className='col-md-12'/> : <div className='col-md-9'></div>} 

                    <FormCheckbox ref={e => this.dangNghiTheoCheDo = e} label='Đang tạm nghỉ theo chế độ'  onChange={value => this.setState({ dangNghiTheoCheDo: value })} className='col-md-3' />
                    {this.state.dangNghiTheoCheDo ? <FormTextBox ref={e => this.noiNghi = e} label='Nơi nghỉ' className='col-md-3' /> : null} 
                    {this.state.dangNghiTheoCheDo ? <FormDatePicker mask='date-mask' ref={e => this.ngayBatDauNghiTheoCheDo = e} label='Từ ngày' className='col-md-3'/> : null} 
                    {this.state.dangNghiTheoCheDo ? <FormDatePicker mask='date-mask' ref={e => this.ngayKetThucNghiTheoCheDo = e} label='Đến ngày' className='col-md-3' />: null} 
                    {this.state.dangNghiTheoCheDo ? <FormRichTextBox ref={e => this.lyDoNghiTheoCheDo = e} label='Lý do/Nội dung' className='col-md-12'/> : <div className='col-md-9'></div>} 

                    <FormCheckbox ref={e => this.daNghi = e} label='Đã nghỉ việc/Nghỉ hưu/Chuyển công tác'  onChange={value => this.setState({ daNghi: value })} className='col-md-4' />
                    {this.state.daNghi ? <FormDatePicker mask='date-mask' ref={e => this.ngayDaNghi = e} label='Thời điểm nghỉ' placeholder='Từ ngày, tháng, năm ...' className='col-md-4'/> : null} 
                    {this.state.daNghi ? <FormTextBox ref={e => this.soHieuDaNghi = e} label='Số hiệu văn bản' className='col-md-4' /> : null} 
                    {this.state.daNghi ? <FormRichTextBox ref={e => this.noiDungDaNghi = e} label='Nội dung' className='col-md-12'/> : <div className='col-md-9'></div>} 
                </div>
            </div>
        );
    }
}

const mapStateToProps = state => ({ staff: state.staff, system: state.system });
const mapActionsToProps = {
    getStaffEdit
};
export default connect(mapStateToProps, mapActionsToProps, null, { forwardRef: true })(ComponentTTCongTac);

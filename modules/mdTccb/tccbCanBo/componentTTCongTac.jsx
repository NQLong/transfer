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
    shcc = '';
    state = { doiTuongBoiDuong: false, tinhTrangBoiDuong: false, dangONuocNgoai: false, dangNghiTheoCheDo: false, daNghi: false };

    value = (item) => {
        this.setState({
            doiTuongBoiDuong: item.doiTuongBoiDuongKienThucQpan, tinhTrangBoiDuong: item.tinhTrangBoiDuong,
            dangONuocNgoai: item.dangONuocNgoai, dangNghiTheoCheDo: item.dangNghiTheoCheDo, daNghi: item.daNghi
        }, () => {
            this.shcc = item.shcc;
            this.ngheNghiepCu.value(item.ngheNghiepCu ? item.ngheNghiepCu : '');
            this.ngayBatDauCongTac.value(item.ngayBatDauCongTac ? item.ngayBatDauCongTac : '');
            this.ngayBienChe.value(item.ngayBienChe ? item.ngayBienChe : '');
            this.donViTuyenDung.value(item.donViTuyenDung ? item.donViTuyenDung : '');
            this.ngach.value(item.ngach ? item.ngach : '');
            this.dienHopDong.value(item.hopDongCanBo ? item.hopDongCanBo : '');
            this.loaiHopDong.value(item.loaiHopDongCanBo ? item.loaiHopDongCanBo : '');

            this.componentChucVuChinhQuyen.value(1, this.shcc);
            this.componentChucVuDoanThe.value(0, this.shcc);

            this.bacLuong.value(item.bacLuong ? item.bacLuong : '');
            this.heSo.value(item.heSoLuong ? item.heSoLuong : '');
            this.ngayHuong.value(item.ngayHuongLuong ? item.ngayHuongLuong : '');
            this.tiLeVuotKhung.value(item.tyLeVuotKhung ? item.tyLeVuotKhung : '');

            this.phuCapChucVu.value(item.phuCap ? item.phuCap : '');
            this.tiLePhuCapThamNien.value(item.tiLePhuCapThamNien ? item.tiLePhuCapThamNien : '');
            this.tiLePhuCapUuDai.value(item.tiLePhuCapUuDai ? item.tiLePhuCapUuDai : '');

            this.soBhxh.value(item.soBhxh ? item.soBhxh : '');
            this.ngayBatDauBhxh.value(item.ngayBatDauBhxh ? item.ngayBatDauBhxh : '');
            this.ngayKetThucBhxh.value(item.ngayKetThucBhxh ? item.ngayKetThucBhxh : '');
            this.soBhyt.value(item.maTheBhyt ? item.maTheBhyt : '');
            this.noiKhamBenhBanDau.value(item.noiKhamChuaBenhBanDau ? item.noiKhamChuaBenhBanDau : '');

            this.doiTuongBoiDuong.value(item.doiTuongBoiDuongKienThucQpan ? item.doiTuongBoiDuongKienThucQpan : 0);
            this.state.doiTuongBoiDuong ? this.loaiDoiTuongBoiDuong.value(item.loaiDoiTuongBoiDuong ? item.loaiDoiTuongBoiDuong : '') : null;
            this.state.doiTuongBoiDuong ? this.tinhTrangBoiDuong.value(item.tinhTrangBoiDuong ? item.tinhTrangBoiDuong : 0) : null;
            this.state.doiTuongBoiDuong && this.state.tinhTrangBoiDuong ? this.namBoiDuong.value(item.namBoiDuong ? item.namBoiDuong : '') : null;
            this.state.doiTuongBoiDuong && this.state.tinhTrangBoiDuong ? this.khoaBoiDuong.value(item.khoaBoiDuong ? item.khoaBoiDuong : '') : null;


            this.dangONuocNgoai.value(item.dangONuocNgoai ? item.dangONuocNgoai : 0);
            this.state.dangONuocNgoai && this.quocGiaDangO.value(item.quocGiaDangO ? item.quocGiaDangO : '');
            this.state.dangONuocNgoai && this.ngayBatDauONuocNgoai.value(item.ngayBatDauONuocNgoai ? item.ngayBatDauONuocNgoai : '');
            this.state.dangONuocNgoai && this.ngayKetThucONuocNgoai.value(item.ngayKetThucONuocNgoai ? item.ngayKetThucONuocNgoai : '');
            this.state.dangONuocNgoai && this.lyDoONuocNgoai.value(item.lyDoONuocNgoai ? item.lyDoONuocNgoai : '');
            this.daNghi.value(item.daNghi ? item.daNghi : 0);
            this.state.daNghi && this.ngayDaNghi.value(item.ngayNghi ? item.ngayNghi : '');
            this.state.daNghi && this.soHieuDaNghi.value(item.soHieuDaNghi ? item.soHieuDaNghi : '');
            this.state.daNghi && this.noiDungDaNghi.value(item.noiDungDaNghi ? item.noiDungDaNghi : '');
        });

    }
    getValue = (selector) => {
        const data = selector.value();
        const isRequired = selector.props.required;
        if (data || data === 0) return data;
        if (isRequired) throw selector;
        return '';
    };

    getAndValidate = () => {
        try {
            const data = {
                ngheNghiepCu: this.getValue(this.ngheNghiepCu),
                ngayBatDauCongTac: this.getValue(this.ngayBatDauCongTac) ? this.getValue(this.ngayBatDauCongTac).getTime() : '',
                ngayBienChe: this.getValue(this.ngayBienChe) ? this.getValue(this.ngayBienChe).getTime() : '',
                donViTuyenDung: this.getValue(this.donViTuyenDung),
                ngach: this.getValue(this.ngach),
                hopDongCanBo: this.getValue(this.dienHopDong),
                loaiHopDong: this.getValue(this.loaiHopDong),
                bacLuong: this.getValue(this.bacLuong),
                heSoLuong: this.getValue(this.heSo),
                ngayHuongLuong: this.getValue(this.ngayHuong) ? this.getValue(this.ngayHuong).getTime() : '',
                tyLeVuotKhung: this.getValue(this.tiLeVuotKhung),
                phuCapCongViec: this.getValue(this.phuCapChucVu),
                tiLePhuCapThamNien: this.getValue(this.tiLePhuCapThamNien),
                tiLePhuCapUuDai: this.getValue(this.tiLePhuCapUuDai),
                soBhxh: this.getValue(this.soBhxh),
                ngayBatDauBhxh: this.getValue(this.ngayBatDauBhxh) ? this.getValue(this.ngayBatDauBhxh).getTime() : '',
                ngayKetThucBhxh: this.getValue(this.ngayKetThucBhxh) ? this.getValue(this.ngayKetThucBhxh).getTime() : '',
                maTheBhyt: this.getValue(this.soBhyt),
                noiKhamChuaBenhBanDau: this.getValue(this.noiKhamBenhBanDau),
                doiTuongBoiDuongKienThucQpan: Number(this.getValue(this.doiTuongBoiDuong)),
                loaiDoiTuongBoiDuong: this.state.doiTuongBoiDuong ? this.getValue(this.loaiDoiTuongBoiDuong) : '',
                daThamGiaBoiDuong: this.state.doiTuongBoiDuong ? Number(this.getValue(this.tinhTrangBoiDuong)) : 0,
                namBoiDuong: this.state.doiTuongBoiDuong && this.state.tinhTrangBoiDuong ? (this.getValue(this.namBoiDuong) ? this.getValue(this.namBoiDuong).getTime() : '') : '',
                khoaBoiDuong: this.state.doiTuongBoiDuong && this.state.tinhTrangBoiDuong ? (this.getValue(this.khoaBoiDuong) ? this.getValue(this.khoaBoiDuong).getTime() : '') : '',
                dangONuocNgoai: Number(this.getValue(this.dangONuocNgoai)),
                quocGiaDangO: this.state.dangONuocNgoai ? this.getValue(this.quocGiaDangO) : '',
                ngayBatDauONuocNgoai: this.state.dangONuocNgoai ? (this.getValue(this.ngayBatDauONuocNgoai) ? this.getValue(this.ngayBatDauONuocNgoai).getTime() : '') : '',
                ngayKetThucONuocNgoai: this.state.dangONuocNgoai ? (this.getValue(this.ngayKetThucONuocNgoai) ? this.getValue(this.ngayKetThucONuocNgoai).getTime() : '') : '',
                lyDoONuocNgoai: this.state.dangONuocNgoai ? this.getValue(this.lyDoONuocNgoai) : '',
                dangNghiTheoCheDo: Number(this.getValue(this.dangNghiTheoCheDo)),
                noiNgheTheoCheDo: this.state.dangNghiTheoCheDo ? this.getValue(this.noiNghi) : '',
                ngayBatDauNghiTheoCheDo: this.state.dangNghiTheoCheDo ? (this.getValue(this.ngayBatDauNghiTheoCheDo) ? this.getValue(this.ngayBatDauNghiTheoCheDo).getTime() : '') : '',
                ngayKetThucNghiTheoCheDo: this.state.dangNghiTheoCheDo ? (this.getValue(this.ngayKetThucNghiTheoCheDo) ? this.getValue(this.ngayKetThucNghiTheoCheDo).getTime() : '') : '',
                lyDoNghiTheoCheDo: this.state.dangNghiTheoCheDo ? this.getValue(this.lyDoNghiTheoCheDo) : '',
                daNghi: Number(this.getValue(this.daNghi)),
                ngayNghi: this.state.daNghi ? (this.getValue(this.ngayDaNghi) ? this.getValue(this.ngayDaNghi).getTime() : '') : '',
                soHieuDaNghi: this.state.daNghi ? this.getValue(this.soHieuDaNghi) : '',
                noiDungDaNghi: this.state.daNghi ? this.getValue(this.noiDungDaNghi) : ''
            };
            return data;

        }
        catch (selector) {
            selector.focus();
            T.notify('<b>' + (selector.props.label || 'Dữ liệu') + '</b> bị trống!', 'danger');
            return false;
        }
    }

    render() {
        return (
            <div className='tile'>
                <h3 className='tile-title'>Thông tin công tác</h3>
                <div className='tile-body row'>
                    <FormTextBox className='col-md-6' ref={e => this.ngheNghiepCu = e} label='Nghề nghiệp trước khi tuyển dụng' readOnly={this.props.userEdit} />
                    <FormDatePicker type='date-mask' className='col-md-6' ref={e => this.ngayBatDauCongTac = e} label='Ngày bắt đầu công tác tại trường' readOnly={this.props.userEdit} />
                    <FormDatePicker type='date-mask' className='col-md-4' ref={e => this.ngayBienChe = e} label='Ngày vào biên chế' readOnly={this.props.userEdit} />
                    <FormSelect data={SelectAdapter_DmDonVi} className='col-md-8' ref={e => this.donViTuyenDung = e} label='Đơn vị ban hành Quyết định tuyển dụng' readOnly={this.props.userEdit} />
                    <FormSelect data={SelectAdapter_DmNgachCdnnV2} className='col-md-4' ref={e => this.ngach = e} label='Chức danh nghề nghiệp' readOnly={this.props.userEdit} />
                    <FormSelect data={SelectAdapter_DmDienHopDongV2} className='col-md-4' ref={e => this.dienHopDong = e} label='Diện hợp đồng' readOnly={this.props.userEdit} />
                    <FormSelect data={SelectAdapter_DmLoaiHopDongV2} className='col-md-4' ref={e => this.loaiHopDong = e} label='Loại hợp đồng' readOnly={this.props.userEdit} />

                    <ComponentChucVu ref={e => this.componentChucVuChinhQuyen = e} label='Chức vụ chính quyền:' userEdit={this.props.userEdit} />
                    <ComponentChucVu ref={e => this.componentChucVuDoanThe = e} label='Chức vụ đoàn thể:' userEdit={this.props.userEdit} />

                    <FormTextBox ref={e => this.bacLuong = e} className='col-md-3' label='Bậc lương' readOnly={this.props.userEdit} />
                    <FormTextBox ref={e => this.heSo = e} className='col-md-3' label='Hệ số lương hiện hưởng' readOnly={this.props.userEdit} />
                    <FormDatePicker type='date-mask' ref={e => this.ngayHuong = e} className='col-md-3' label='Ngày hưởng' readOnly={this.props.userEdit} />
                    <FormTextBox ref={e => this.tiLeVuotKhung = e} className='col-md-3' label='Tỉ lệ vượt khung' readOnly={this.props.userEdit} />

                    <FormTextBox ref={e => this.phuCapChucVu = e} className='col-md-4' label='Mức phụ cấp chức vụ' readOnly={this.props.userEdit} />
                    <FormTextBox ref={e => this.tiLePhuCapThamNien = e} className='col-md-4' label='Tỉ lệ phụ cấp thâm niên' readOnly={this.props.userEdit} />
                    <FormTextBox ref={e => this.tiLePhuCapUuDai = e} className='col-md-4' label='Tỉ lệ phụ cấp ưu đãi' readOnly={this.props.userEdit} />

                    <FormTextBox ref={e => this.soBhxh = e} className='col-md-4' label='Mã số Bảo hiểm xã hội' />
                    <FormDatePicker ref={e => this.ngayBatDauBhxh = e} className='col-md-4' label='Từ tháng, năm' type='month-mask' />
                    <FormDatePicker ref={e => this.ngayKetThucBhxh = e} className='col-md-4' label='Đến tháng, năm' type='month-mask' />
                    <FormTextBox ref={e => this.soBhyt = e} className='col-md-4' label='Mã thẻ Bảo hiểm y tế' />
                    <FormSelect ref={e => this.noiKhamBenhBanDau = e} className='col-md-8' label='Nơi khám chữa bệnh ban đầu' data={SelectAdapter_DmBenhVienV2} />
                    <div className='form-group col-md-12'></div>

                    <FormCheckbox ref={e => this.doiTuongBoiDuong = e} label='Đối tượng bồi dưỡng kiến thức Quốc phòng và An ninh' onChange={value => this.setState({ doiTuongBoiDuong: value })} className='col-md-12' />
                    {this.state.doiTuongBoiDuong ? <FormSelect ref={e => this.loaiDoiTuongBoiDuong = e} label='Loại đối tượng bồi dưỡng' data={[{ id: 2, text: 'Loại 2' }, { id: 3, text: 'Loại 3' }, { id: 4, text: 'Loại 4' }]} className='col-md-3' /> : null}
                    {this.state.doiTuongBoiDuong ? <FormCheckbox ref={e => this.tinhTrangBoiDuong = e} label='Đã tham gia bồi dưỡng' onChange={value => this.setState({ tinhTrangBoiDuong: value })} className='col-md-3' /> : null}
                    {this.state.tinhTrangBoiDuong ? <FormTextBox type='year' ref={e => this.namBoiDuong = e} label='Năm bồi dưỡng' className='col-md-2' /> : null}
                    {this.state.tinhTrangBoiDuong ? <FormTextBox ref={e => this.khoaBoiDuong = e} label='Khóa bồi dưỡng' placeholder='Ghi rõ khóa mấy, dành cho đối tượng nào' className='col-md-4' /> : null}

                    <div className='form-group col-md-12'></div>
                    <div className='form-group col-md-12'></div>

                    <FormCheckbox ref={e => this.dangONuocNgoai = e} label='Đang ở nước ngoài' onChange={value => this.setState({ dangONuocNgoai: value })} className='col-md-3' readOnly={this.props.userEdit} />
                    {this.state.dangONuocNgoai ? <FormSelect ref={e => this.quocGiaDangO = e} label='Quốc gia' className='col-md-3' data={SelectAdapter_DmQuocGia} readOnly={this.props.userEdit} /> : null}
                    {this.state.dangONuocNgoai ? <FormDatePicker type='date-mask' ref={e => this.ngayBatDauONuocNgoai = e} label='Từ ngày' className='col-md-3' readOnly={this.props.userEdit} /> : null}
                    {this.state.dangONuocNgoai ? <FormDatePicker type='date-mask' ref={e => this.ngayKetThucONuocNgoai = e} label='Đến ngày' className='col-md-3' readOnly={this.props.userEdit} /> : null}
                    {this.state.dangONuocNgoai ? <FormRichTextBox ref={e => this.lyDoONuocNgoai = e} label='Lý do/Nội dung' className='col-md-12' readOnly={this.props.userEdit} /> : <div className='col-md-9'></div>}

                    <FormCheckbox ref={e => this.dangNghiTheoCheDo = e} label='Đang tạm nghỉ theo chế độ' onChange={value => this.setState({ dangNghiTheoCheDo: value })} className='col-md-3' readOnly={this.props.userEdit} />
                    {this.state.dangNghiTheoCheDo ? <FormTextBox ref={e => this.noiNghi = e} label='Nơi nghỉ' className='col-md-3' readOnly={this.props.userEdit} /> : null}
                    {this.state.dangNghiTheoCheDo ? <FormDatePicker type='date-mask' ref={e => this.ngayBatDauNghiTheoCheDo = e} label='Từ ngày' className='col-md-3' readOnly={this.props.userEdit} /> : null}
                    {this.state.dangNghiTheoCheDo ? <FormDatePicker type='date-mask' ref={e => this.ngayKetThucNghiTheoCheDo = e} label='Đến ngày' className='col-md-3' readOnly={this.props.userEdit} /> : null}
                    {this.state.dangNghiTheoCheDo ? <FormRichTextBox ref={e => this.lyDoNghiTheoCheDo = e} label='Lý do/Nội dung' className='col-md-12' readOnly={this.props.userEdit} /> : <div className='col-md-9'></div>}

                    <FormCheckbox ref={e => this.daNghi = e} label='Đã nghỉ việc/Nghỉ hưu/Chuyển công tác' onChange={value => this.setState({ daNghi: value })} readOnly={this.props.userEdit} className='col-md-4' />
                    {this.state.daNghi ? <FormDatePicker type='date-mask' ref={e => this.ngayDaNghi = e} label='Thời điểm nghỉ' placeholder='Từ ngày, tháng, năm ...' className='col-md-4' /> : null}
                    {this.state.daNghi ? <FormTextBox ref={e => this.soHieuDaNghi = e} label='Số hiệu văn bản' className='col-md-4' /> : null}
                    {this.state.daNghi ? <FormRichTextBox ref={e => this.noiDungDaNghi = e} label='Nội dung' className='col-md-12' /> : <div className='col-md-9'></div>}
                </div>
            </div>
        );
    }
}

const mapStateToProps = state => ({ staff: state.tccb.staff, system: state.system });
const mapActionsToProps = {
    getStaffEdit
};
export default connect(mapStateToProps, mapActionsToProps, null, { forwardRef: true })(ComponentTTCongTac);

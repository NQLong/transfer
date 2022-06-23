import { SelectAdapter_DmBenhVienV2 } from 'modules/mdDanhMuc/dmBenhVien/reduxBenhVien';
import { SelectAdapter_DmDienHopDongV2 } from 'modules/mdDanhMuc/dmDienHopDong/redux';
import { SelectAdapter_DmLoaiHopDongV2 } from 'modules/mdDanhMuc/dmLoaiHopDong/redux';
import { SelectAdapter_DmMucDichNuocNgoaiV2 } from 'modules/mdDanhMuc/dmMucDichNuocNgoai/redux';
import { SelectAdapter_DmNgachCdnnV2 } from 'modules/mdDanhMuc/dmNgachCdnn/redux';
import { SelectAdapter_DmQuocGia } from 'modules/mdDanhMuc/dmQuocGia/redux';
import React from 'react';
import { connect } from 'react-redux';
import { AdminPage, FormCheckbox, FormDatePicker, FormRichTextBox, FormSelect, FormTextBox } from 'view/component/AdminPage';
import ComponentChucVu from '../qtChucVu/componentChucVu';
import { getStaffEdit } from './redux';

const typeMapper = {
    'yyyy': 'year',
    'mm/yyyy': 'month-mask',
    'dd/mm/yyyy': 'date-mask'
};
class ComponentTTCongTac extends AdminPage {
    state = { doiTuongBoiDuong: false, tinhTrangBoiDuong: false, dangONuocNgoai: false, dangNghiTheoCheDo: false, daNghi: false };

    value = (item) => {
        this.setState({
            doiTuongBoiDuong: item.doiTuongBoiDuongKienThucQpan, tinhTrangBoiDuong: item.tinhTrangBoiDuong,
            dangONuocNgoai: item.dangONuocNgoai, dangNghiTheoCheDo: item.dangNghiTheoCheDo, daNghi: item.daNghi || item.dataNghiViec
        }, () => {
            this.ngheNghiepCu.value(item.ngheNghiepCu ? item.ngheNghiepCu : '');
            this.ngayBatDauCongTac.value(item.ngayBatDauCongTac ? item.ngayBatDauCongTac : '');
            this.ngayBienChe.value(item.ngayBienChe && item.ngayBienChe != 1 ? item.ngayBienChe : '');
            this.donViTuyenDung.value(item.donViTuyenDung ? item.donViTuyenDung : JSON.parse(this.props.system.schoolName).vi);
            this.ngach.value(item.ngach ? item.ngach : '');
            this.dienHopDong.value(item.hopDongCanBo ? item.hopDongCanBo : '');
            this.loaiHopDong.value(item.loaiHopDongCanBo ? item.loaiHopDongCanBo : '');

            this.bacLuong.value(item.bacLuong ? item.bacLuong : '');
            this.heSo.value(item.heSoLuong ? item.heSoLuong : '');
            this.ngayHuong.value(item.ngayHuongLuong ? item.ngayHuongLuong : '');

            this.tyLeVuotKhung.value(item.tyLeVuotKhung ? item.tyLeVuotKhung : '');
            this.tyLePhuCapUuDai.value(item.tyLePhuCapUuDai ? item.tyLePhuCapUuDai : '');

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

            if (this.state.dangONuocNgoai) {
                this.dangONuocNgoai.value(true);
                let { quocGia, ngayDi, ngayDiType, ngayVe, ngayVeType, mucDich } = item.dangONuocNgoai;
                this.setState({ ngayDiType, ngayVeType }, () => {
                    this.ngayDi.value(ngayDi);
                    this.ngayVe.value(ngayVe);
                    this.mucDich.value(mucDich);
                    this.quocGia.value(quocGia ? quocGia.split(',') : '');
                });
            }

            if (this.state.daNghi) {
                this.daNghi.value(true);
                let { ngayNghi, soQuyetDinh, noiDung } = item.dataNghiViec;
                this.ngayDaNghi.value(ngayNghi);
                this.soHieuDaNghi.value(soQuyetDinh);
                this.noiDungDaNghi.value(noiDung);
            }
        });

    }

    getValue = (selector, date = null) => {
        const data = date ? selector.value().getTime() : selector.value();
        const isRequired = selector.props.required;
        if (data || data === 0) return data;
        if (isRequired && !data) throw selector;
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
                bacLuong: this.getValue(this.bacLuong),
                heSoLuong: this.getValue(this.heSo),
                ngayHuongLuong: this.getValue(this.ngayHuong) ? this.getValue(this.ngayHuong).getTime() : '',
                tyLeVuotKhung: this.getValue(this.tyLeVuotKhung),
                tyLePhuCapUuDai: this.getValue(this.tyLePhuCapUuDai),
                soBhxh: this.getValue(this.soBhxh),
                ngayBatDauBhxh: this.getValue(this.ngayBatDauBhxh) ? this.getValue(this.ngayBatDauBhxh).getTime() : '',
                ngayKetThucBhxh: this.getValue(this.ngayKetThucBhxh) ? this.getValue(this.ngayKetThucBhxh).getTime() : '',
                maTheBhyt: this.getValue(this.soBhyt),
                noiKhamChuaBenhBanDau: this.getValue(this.noiKhamBenhBanDau),
                doiTuongBoiDuongKienThucQpan: Number(this.getValue(this.doiTuongBoiDuong)),
                loaiDoiTuongBoiDuong: this.state.doiTuongBoiDuong ? this.getValue(this.loaiDoiTuongBoiDuong) : '',
                tinhTrangBoiDuong: this.state.doiTuongBoiDuong ? Number(this.getValue(this.tinhTrangBoiDuong)) : 0,
                namBoiDuong: (this.state.doiTuongBoiDuong && this.state.tinhTrangBoiDuong) ? this.getValue(this.namBoiDuong) : null,
                khoaBoiDuong: (this.state.doiTuongBoiDuong && this.state.tinhTrangBoiDuong) ? this.getValue(this.khoaBoiDuong) : '',
            };
            return data;

        }
        catch (selector) {
            if (selector) {
                selector.focus();
                T.notify('<b>' + (selector.props.label || 'Dữ liệu') + '</b> bị trống!', 'danger');
                return false;
            }
        }
    }

    render() {
        const { create = false, readOnly = true, shcc } = this.props;
        return (
            <div className='tile'>
                <h3 className='tile-title'>Thông tin công tác</h3>
                <div className='tile-body row'>
                    <FormTextBox className='col-12' ref={e => this.ngheNghiepCu = e} label='Nghề nghiệp trước khi tuyển dụng' readOnly={readOnly} />
                    <FormDatePicker type='date-mask' className='col-6' ref={e => this.ngayBatDauCongTac = e} label='Ngày bắt đầu công tác tại trường' readOnly={readOnly} />
                    <FormDatePicker type='date-mask' className='col-6' ref={e => this.ngayBienChe = e} label='Ngày vào biên chế' readOnly={readOnly} />
                    <FormTextBox className='col-12' ref={e => this.donViTuyenDung = e} label='Đơn vị ban hành Quyết định tuyển dụng' readOnly={readOnly} />
                    <FormSelect data={SelectAdapter_DmNgachCdnnV2} className='col-md-12' ref={e => this.ngach = e} label='Chức danh nghề nghiệp' readOnly={readOnly} />
                    <FormSelect data={SelectAdapter_DmDienHopDongV2} className='col-md-4' ref={e => this.dienHopDong = e} label='Diện hợp đồng' readOnly />
                    <FormSelect data={SelectAdapter_DmLoaiHopDongV2} className='col-md-8' ref={e => this.loaiHopDong = e} label='Loại hợp đồng' readOnly />
                    <div className='col-md-12 form-group' style={{ display: create ? 'none' : 'block' }}>
                        <ComponentChucVu label='Chức vụ chính quyền:' shcc={shcc} type='CQ' />
                        <ComponentChucVu label='Chức vụ đoàn thể:' shcc={shcc} type='DT' />
                    </div>

                    <FormTextBox ref={e => this.bacLuong = e} className='col-md-3' label='Bậc lương' readOnly={readOnly} />
                    <FormTextBox ref={e => this.heSo = e} className='col-md-3' label='Hệ số' readOnly={readOnly} />
                    <FormDatePicker type='date-mask' ref={e => this.ngayHuong = e} className='col-md-6' label='Ngày hưởng' readOnly={readOnly} />
                    <FormTextBox ref={e => this.tyLeVuotKhung = e} className='col-md-6' label='Phụ cấp thâm niên' readOnly={readOnly} />
                    <FormTextBox ref={e => this.tyLePhuCapUuDai = e} className='col-md-6' label='Phụ cấp ưu đãi' readOnly={readOnly} />

                    <FormTextBox ref={e => this.soBhxh = e} className='col-md-6' label='Mã số Bảo hiểm xã hội' readOnly={readOnly} />
                    <FormDatePicker ref={e => this.ngayBatDauBhxh = e} className='col-md-3' label='Tháng bắt đầu' type='month-mask' readOnly={readOnly} />
                    <FormDatePicker ref={e => this.ngayKetThucBhxh = e} className='col-md-3' label='Tháng kết thúc' type='month-mask' readOnly={readOnly} />
                    <FormTextBox ref={e => this.soBhyt = e} className='col-md-6' label='Mã thẻ Bảo hiểm y tế' />
                    <FormSelect ref={e => this.noiKhamBenhBanDau = e} className='col-md-6' label='Nơi khám chữa bệnh ban đầu' data={SelectAdapter_DmBenhVienV2} />

                    <div className='form-group col-md-12'></div>

                    <FormCheckbox ref={e => this.doiTuongBoiDuong = e} label='Đối tượng bồi dưỡng kiến thức Quốc phòng và An ninh' onChange={value => this.setState({ doiTuongBoiDuong: value })} className='col-md-12' />
                    {this.state.doiTuongBoiDuong ? <FormSelect ref={e => this.loaiDoiTuongBoiDuong = e} label='Loại đối tượng' data={[{ id: 2, text: 'Loại 2' }, { id: 3, text: 'Loại 3' }, { id: 4, text: 'Loại 4' }]} className='col-md-3' required={this.state.doiTuongBoiDuong} /> : null}
                    {this.state.doiTuongBoiDuong ? <FormCheckbox ref={e => this.tinhTrangBoiDuong = e} label='Đã tham gia bồi dưỡng' onChange={value => this.setState({ tinhTrangBoiDuong: value })} className='col-md-3' /> : null}
                    {this.state.tinhTrangBoiDuong ? <FormTextBox type='year' ref={e => this.namBoiDuong = e} label='Năm bồi dưỡng' className='col-md-2' required={this.state.tinhTrangBoiDuong} /> : null}
                    {this.state.tinhTrangBoiDuong ? <FormTextBox ref={e => this.khoaBoiDuong = e} label='Khóa bồi dưỡng' placeholder='Ghi rõ khóa mấy, dành cho đối tượng nào' className='col-md-4' required={this.state.tinhTrangBoiDuong} /> : null}

                    {!create && <>
                        <FormCheckbox ref={e => this.dangONuocNgoai = e} label='Đang ở nước ngoài' onChange={value => this.setState({ dangONuocNgoai: value })} className='col-md-12' readOnly />
                        {this.state.dangONuocNgoai ?
                            <FormSelect ref={e => this.quocGia = e} label='Quốc gia đi' className='col-md-3' data={SelectAdapter_DmQuocGia} multiple={true} readOnly /> : null
                        }
                        {this.state.dangONuocNgoai ?
                            <FormSelect ref={e => this.mucDich = e} label='Mục đích' className='col-md-3' data={SelectAdapter_DmMucDichNuocNgoaiV2} readOnly /> : null
                        }
                        {this.state.dangONuocNgoai ?
                            <FormDatePicker type={typeMapper[this.state.ngayDiType]} ref={e => this.ngayDi = e} label='Ngày đi' className='col-md-3' readOnly /> : null
                        }
                        {this.state.dangONuocNgoai ?
                            <FormDatePicker type={typeMapper[this.state.ngayVeType]} ref={e => this.ngayVe = e} label='Ngày về dự kiến' className='col-md-3' readOnly /> : null
                        }

                        <FormCheckbox ref={e => this.dangNghiTheoCheDo = e} label='Đang tạm nghỉ theo chế độ' onChange={value => this.setState({ dangNghiTheoCheDo: value })} className='col-md-3' readOnly />
                        {this.state.dangNghiTheoCheDo ? <FormTextBox ref={e => this.noiNghi = e} label='Nơi nghỉ' className='col-md-3' readOnly={this.props.userEdit} /> : null}
                        {this.state.dangNghiTheoCheDo ? <FormDatePicker type='date-mask' ref={e => this.ngayBatDauNghiTheoCheDo = e} label='Từ ngày' className='col-md-3' readOnly={this.props.userEdit} /> : null}
                        {this.state.dangNghiTheoCheDo ? <FormDatePicker type='date-mask' ref={e => this.ngayKetThucNghiTheoCheDo = e} label='Đến ngày' className='col-md-3' readOnly={this.props.userEdit} /> : null}
                        {this.state.dangNghiTheoCheDo ? <FormRichTextBox ref={e => this.lyDoNghiTheoCheDo = e} label='Lý do/Nội dung' className='col-md-12' readOnly={this.props.userEdit} /> : <div className='col-md-9'></div>}

                        <FormCheckbox ref={e => this.daNghi = e} label='Đã nghỉ việc/Nghỉ hưu/Chuyển công tác' onChange={value => this.setState({ daNghi: value })} readOnly className='col-md-12' />
                        {this.state.daNghi ? <FormDatePicker type='date-mask' ref={e => this.ngayDaNghi = e} label='Thời điểm nghỉ' readOnly placeholder='Từ ngày, tháng, năm ...' className='col-md-3' /> : null}
                        {this.state.daNghi ? <FormTextBox ref={e => this.soHieuDaNghi = e} label='Số quyết định' readOnly className='col-md-3' /> : null}
                        {this.state.daNghi ? <FormTextBox ref={e => this.noiDungDaNghi = e} label='Nội dung' className='col-md-6' readOnly />
                            : null}
                    </>}
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

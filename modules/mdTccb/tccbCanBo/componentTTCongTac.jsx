import { SelectAdapter_DmBenhVienV2 } from 'modules/mdDanhMuc/dmBenhVien/reduxBenhVien';
import { SelectAdapter_DmDienHopDongV2 } from 'modules/mdDanhMuc/dmDienHopDong/redux';
import { SelectAdapter_DmDonVi } from 'modules/mdDanhMuc/dmDonVi/redux';
import { SelectAdapter_DmLoaiHopDongV2 } from 'modules/mdDanhMuc/dmLoaiHopDong/redux';
import { SelectAdapter_DmMucDichNuocNgoaiV2 } from 'modules/mdDanhMuc/dmMucDichNuocNgoai/redux';
import { SelectAdapter_DmNgachCdnnV2 } from 'modules/mdDanhMuc/dmNgachCdnn/redux';
import { SelectAdapter_DmQuocGia } from 'modules/mdDanhMuc/dmQuocGia/redux';
// import { SelectAdapter_DmQuocGia } from 'modules/mdDanhMuc/dmQuocGia/redux';
import React from 'react';
import { connect } from 'react-redux';
import { AdminPage, FormCheckbox, FormDatePicker, FormRichTextBox, FormSelect, FormTextBox } from 'view/component/AdminPage';
// import Dropdown from 'view/component/Dropdown';
// import { DateInput } from 'view/component/Input';
import ComponentChucVu from '../qtChucVu/componentChucVu';
import { getStaffEdit } from './redux';
// const EnumDateType = Object.freeze({
//     0: { text: '' },
//     1: { text: 'dd/mm/yyyy' },
//     2: { text: 'mm/yyyy' },
//     3: { text: 'yyyy' },
// }),
const typeMapper = {
    'yyyy': 'year',
    'mm/yyyy': 'month-mask',
    'dd/mm/yyyy': 'date-mask'
};
class ComponentTTCongTac extends AdminPage {
    state = {};
    shcc = '';
    state = { doiTuongBoiDuong: false, tinhTrangBoiDuong: false, dangONuocNgoai: false, dangNghiTheoCheDo: false, daNghi: false };

    value = (item) => {
        this.setState({
            doiTuongBoiDuong: item.doiTuongBoiDuongKienThucQpan, tinhTrangBoiDuong: item.tinhTrangBoiDuong,
            dangONuocNgoai: item.dangONuocNgoai, dangNghiTheoCheDo: item.dangNghiTheoCheDo, daNghi: item.daNghi || item.dataNghiViec
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
                tinhTrangBoiDuong: this.state.doiTuongBoiDuong ? Number(this.getValue(this.tinhTrangBoiDuong)) : 0,
                namBoiDuong: (this.state.doiTuongBoiDuong && this.state.tinhTrangBoiDuong) ? this.getValue(this.namBoiDuong) : null,
                khoaBoiDuong: (this.state.doiTuongBoiDuong && this.state.tinhTrangBoiDuong) ? this.getValue(this.khoaBoiDuong) : '',
            };
            return data;

        }
        catch (selector) {
            if (selector) {
                console.log(selector);
                selector.focus();
                T.notify('<b>' + (selector.props.label || 'Dữ liệu') + '</b> bị trống!', 'danger');
                return false;
            }
        }
    }

    render() {
        return (
            <div className='tile'>
                <h3 className='tile-title'>Thông tin công tác</h3>
                <div className='tile-body row'>
                    <FormTextBox className='col-md-6' ref={e => this.ngheNghiepCu = e} label='Nghề nghiệp trước khi tuyển dụng' />
                    <FormDatePicker type='date-mask' className='col-md-6' ref={e => this.ngayBatDauCongTac = e} label='Ngày bắt đầu công tác tại trường' />
                    <FormDatePicker type='date-mask' className='col-md-4' ref={e => this.ngayBienChe = e} label='Ngày vào biên chế' />
                    <FormSelect data={SelectAdapter_DmDonVi} className='col-md-8' ref={e => this.donViTuyenDung = e} label='Đơn vị ban hành Quyết định tuyển dụng' />
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
                    {this.state.doiTuongBoiDuong ? <FormSelect ref={e => this.loaiDoiTuongBoiDuong = e} label='Loại đối tượng' data={[{ id: 2, text: 'Loại 2' }, { id: 3, text: 'Loại 3' }, { id: 4, text: 'Loại 4' }]} className='col-md-3' required={this.state.doiTuongBoiDuong} /> : null}
                    {this.state.doiTuongBoiDuong ? <FormCheckbox ref={e => this.tinhTrangBoiDuong = e} label='Đã tham gia bồi dưỡng' onChange={value => this.setState({ tinhTrangBoiDuong: value })} className='col-md-3' /> : null}
                    {this.state.tinhTrangBoiDuong ? <FormTextBox type='year' ref={e => this.namBoiDuong = e} label='Năm bồi dưỡng' className='col-md-2' required={this.state.tinhTrangBoiDuong} /> : null}
                    {this.state.tinhTrangBoiDuong ? <FormTextBox ref={e => this.khoaBoiDuong = e} label='Khóa bồi dưỡng' placeholder='Ghi rõ khóa mấy, dành cho đối tượng nào' className='col-md-4' required={this.state.tinhTrangBoiDuong} /> : null}

                    <div className='form-group col-md-12'></div>
                    <div className='form-group col-md-12'></div>

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

import React from 'react';
import { connect } from 'react-redux';
import { getDmDonViFaculty, getDmDonVi, getDmDonViAll, SelectAdapter_DmDonVi } from 'modules/mdDanhMuc/dmDonVi/redux';
import moment from 'moment';
import { FormDatePicker, FormSelect, FormTextBox } from 'view/component/AdminPage';
import { SelectAdapter_DmLoaiHopDongV2 } from 'modules/mdDanhMuc/dmLoaiHopDong/redux';
import { SelectAdapter_DmBoMonTheoDonVi } from 'modules/mdDanhMuc/dmBoMon/redux';
import { SelectAdapter_DmNgachCdnnV2, getDmNgachCdnnAll } from 'modules/mdDanhMuc/dmNgachCdnn/redux';
import { SelectAdapter_BacLuong_Filter, getDmNgachLuong } from 'modules/mdDanhMuc/dmNgachLuong/redux';
import { getDmLoaiHopDong } from 'modules/mdDanhMuc/dmLoaiHopDong/redux';

const defaultValue = {
    congViecDuocGiao: 'Theo sự phân công của ',
    thoiGianLamViec: 'Theo quy định của Nhà Trường',
    dungCuLamViec: 'Theo quy định hiện hành',
    phuongTienLamViec: 'Cá nhân tự túc',
    hinhThucTraLuong: 'Được trả 01 lần vào ngày 25 hàng tháng qua hệ thống ATM của ngân hàng (BIDV hoặc VIETCOMBANK).',
    cheDoNghiNgoi: 'Theo quy định của Luật Lao động và quy chế của Nhà trường.',
    boiThuong: 'Theo quy định hiện hành',
    chiuSuPhanCong: 'Chịu sự điều hành, quản lý của '
};

export class ComponentDieuKhoan extends React.Component {

    state = { isThuViec: true, isXacDinhTg: true, tenDonVi: '', maDv: null }
    cdnnMapper = {}
    tenDonViMapper = {}

    componentDidMount() {
        this.props.getDmDonViAll(data => {
            data.forEach(item => this.tenDonViMapper[item.ma] = item.ten);
            let listMaKhoa = data.filter(item => item.maPl == 1).map(item => item.ma);
            this.setState({ listMaKhoa });
        });
        this.props.getDmNgachCdnnAll(data => data.forEach(item => this.cdnnMapper[item.ma] = item.id));
    }

    setVal = (data = null) => {
        if (data) {
            let { ma, loaiHopDong, ngayKyHopDong, batDauLamViec, ketThucHopDong, diaDiemLamViec,
                congViecDuocGiao, maNgach, heSo, bac, phanTramHuong, chiuSuPhanCong, ngayKyHdTiepTheo } = data;
            this.setState({ ma });
            this.props.getDmDonVi(diaDiemLamViec, data => {
                this.setState({ tenDonVi: data.ten, maDv: diaDiemLamViec, ngach: this.cdnnMapper[maNgach] }, () => {
                    this.loaiHopDong.value(loaiHopDong);
                    this.props.getDmLoaiHopDong(loaiHopDong, loaiHD => {
                        if (loaiHD && loaiHD.khongXacDinhTh)
                            this.setState({ isXacDinhTg: false });
                        else {
                            loaiHD && loaiHD.thoiGian && this.setState({ thoiGianHD: data.thoiGian, isXacDinhTg: true });

                        }
                    });
                    this.tuNgay.value(ngayKyHopDong ? ngayKyHopDong : batDauLamViec);
                    this.batDauLamViec.value(batDauLamViec ? batDauLamViec : ngayKyHopDong);
                    this.denNgay.value(ketThucHopDong);
                    this.donVi.value(diaDiemLamViec);
                    this.congViecDuocGiao.value(congViecDuocGiao ? congViecDuocGiao : defaultValue.congViecDuocGiao);
                    this.chucDanh.value(maNgach);
                    this.heSoLuong.value(heSo.toFixed(2));
                    this.bacLuong.value(bac);
                    this.phanTramHuong.value(phanTramHuong ? phanTramHuong : '');
                    this.thoiGianLamViec.value(defaultValue.thoiGianLamViec);
                    this.cheDoNghiNgoi.value(defaultValue.cheDoNghiNgoi);
                    this.dungCuLamViec.value(defaultValue.dungCuLamViec);
                    this.phuongTienLamViec.value(defaultValue.phuongTienLamViec);
                    this.hinhThucTraLuong.value(defaultValue.hinhThucTraLuong);
                    this.chiuSuPhanCong.value(chiuSuPhanCong ? chiuSuPhanCong + ' ' + this.state.tenDonVi.normalizedName() : defaultValue.chiuSuPhanCong + ' ' + this.state.tenDonVi.normalizedName());
                    this.boiThuong.value(defaultValue.boiThuong);
                    this.ngayKyTiepTheo.value(ngayKyHdTiepTheo);
                });
            });
        } else {
            this.congViecDuocGiao.value(defaultValue.congViecDuocGiao);
            this.thoiGianLamViec.value(defaultValue.thoiGianLamViec);
            this.dungCuLamViec.value(defaultValue.dungCuLamViec);
            this.phuongTienLamViec.value(defaultValue.phuongTienLamViec);
            this.hinhThucTraLuong.value(defaultValue.hinhThucTraLuong);
            this.cheDoNghiNgoi.value(defaultValue.cheDoNghiNgoi);
            this.boiThuong.value(defaultValue.boiThuong);
            this.tuNgay.value(new Date().getTime());
            this.batDauLamViec.value(new Date().getTime());
            this.chiuSuPhanCong.value(defaultValue.chiuSuPhanCong);
        }
    }

    handleNgach = (item) => {
        this.setState({ ngach: this.cdnnMapper[item.id] }, () => {
            this.bacLuong.value(null);
        });
    }

    handleBac = (item) => {
        this.props.getDmNgachLuong(item.id, this.state.ngach, data => {
            if (data) {
                if (data.bac != 0)
                    this.heSoLuong.value(data.heSo.toFixed(2));
            }
        });
    }

    handleLoaiHD = (item) => {
        this.props.getDmLoaiHopDong(item.id, data => {
            if (data && data.khongXacDinhTh)
                this.setState({ isXacDinhTg: false });
            else {
                data && data.thoiGian && this.setState({ thoiGianHD: data.thoiGian, isXacDinhTg: true });
                let tuNgayValue = this.tuNgay.value();
                if (tuNgayValue) {
                    const newDate = moment(tuNgayValue).add(parseInt(data.thoiGian), 'M');
                    this.denNgay.value(newDate.valueOf() - 24 * 3600000);
                    this.ngayKyTiepTheo.value(newDate.valueOf());
                }
            }
        });
    }

    handleTuNgay = (value) => {
        if (value && this.state.isXacDinhTg && this.state.thoiGianHD) {
            const newDate = moment(value).add(parseInt(this.state.thoiGianHD), 'M');
            this.denNgay.value(newDate.valueOf() - 24 * 3600000);
            this.ngayKyTiepTheo.value(newDate.valueOf());
        }
        value && this.batDauLamViec.value(value);
    }

    handleDonVi = () => {
        let trachNhiem = this.state.listMaKhoa.includes(this.state.maDv) ? 'Trưởng khoa ' : 'Trưởng/Giám đốc ';
        this.chiuSuPhanCong.value(defaultValue.chiuSuPhanCong + trachNhiem + this.tenDonViMapper[this.state.maDv].normalizedName());
        this.congViecDuocGiao.value(defaultValue.congViecDuocGiao + trachNhiem + this.tenDonViMapper[this.state.maDv].normalizedName());
    }

    validate = (selector) => {
        const data = selector.value();
        const isRequired = selector.props.required;
        if (data || data === 0) return data;
        if (isRequired) throw selector;
        return null;
    };

    getValue = () => {
        try {
            const data = {
                ma: this.state.ma,
                loaiHopDong: this.validate(this.loaiHopDong),
                batDauLamViec: this.validate(this.batDauLamViec).getTime(),
                ketThucHopDong: this.validate(this.denNgay).getTime(),
                diaDiemLamViec: this.validate(this.donVi),
                maNgach: this.validate(this.chucDanh),
                congViecDuocGiao: this.validate(this.congViecDuocGiao),
                chiuSuPhanCong: this.validate(this.chiuSuPhanCong),
                bac: this.validate(this.bacLuong),
                heSo: this.validate(this.heSoLuong),
                phanTramHuong: this.validate(this.phanTramHuong),
                ngayKyHdTiepTheo: this.validate(this.ngayKyTiepTheo).getTime(),
                //new thing
                thoiGianLamViec: this.validate(this.thoiGianLamViec),
                dungCuLamViec: this.validate(this.dungCuLamViec),
                phuongTienLamViec: this.validate(this.phuongTienLamViec),
                hinhThucTraLuong: this.validate(this.hinhThucTraLuong),
                cheDoNghiNgoi: this.validate(this.cheDoNghiNgoi),
                boiThuong: this.validate(this.boiThuong),
                boMon: this.validate(this.maBoMon)
            };
            return data;
        } catch (selector) {
            selector.focus();
            T.notify('<b>' + (selector.props.label || 'Dữ liệu') + '</b> bị trống!', 'danger');
            return false;
        }
    }

    getDonVi = () => {
        return this.donVi.value();
    };

    render() {
        const currentPermission = this.props.system && this.props.system.user && this.props.system.user.permissions ? this.props.system.user.permissions : [];
        let readOnly = !currentPermission.includes('qtHopDongLaoDong:write');
        return (
            <div className='tile'>
                <h3 className='tile-title'>Điều khoản hợp đồng</h3>
                <div className='tile-body row'>
                    <div className='col-12 form-group'>
                        <h4 className='control-label' style={{ fontWeight: 'bold', textAlign: 'left' }}>Điều 1: Thời hạn và công việc hợp đồng </h4>
                    </div>
                    <FormSelect ref={e => this.loaiHopDong = e} data={SelectAdapter_DmLoaiHopDongV2} className='col-xl-12 col-md-12' label='Loại hợp đồng lao động' onChange={this.handleLoaiHD} required readOnly={readOnly} />
                    <FormDatePicker ref={e => this.tuNgay = e} type='date-mask' className='col-xl-3 col-md-6' label='Từ ngày' required readOnly={readOnly} onChange={this.handleTuNgay} />
                    <FormDatePicker ref={e => this.denNgay = e} type='date-mask' className={this.state.isXacDinhTg ? 'col-xl-3 col-md-6' : 'd-none'} label='Đến ngày' required readOnly={readOnly} />
                    <FormDatePicker ref={e => this.batDauLamViec = e} type='date-mask' className='col-xl-3 col-md-6' label='Ngày bắt đầu làm việc' required readOnly={true} />
                    <FormDatePicker ref={e => this.ngayKyTiepTheo = e} type='date-mask' className={this.state.isXacDinhTg ? 'col-xl-3 col-md-6' : 'd-none'} label='Ngày tái ký' required readOnly={readOnly} />
                    <FormSelect ref={e => this.donVi = e} data={SelectAdapter_DmDonVi} className='col-xl-4 col-md-6' label='Địa điểm làm việc' readOnly={readOnly} onChange={value => { 
                        this.setState({ maDv: value.id }, () => this.maBoMon.value(null)); 
                        this.handleDonVi(); 
                        this.props.genNewShcc(value.id, value.preShcc); }} required />
                    <FormSelect ref={e => this.maBoMon = e} data={SelectAdapter_DmBoMonTheoDonVi(this.state.maDv)} label='Bộ môn' readOnly={readOnly} className={!this.state.maDv || !this.state.listMaKhoa.includes(this.state.maDv) ? 'd-none' : 'col-xl-4 col-md-6'} />
                    <FormSelect ref={e => this.chucDanh = e} data={SelectAdapter_DmNgachCdnnV2} onChange={this.handleNgach} className='col-md-4' label='Chức danh chuyên môn' required />
                    <FormTextBox ref={e => this.congViecDuocGiao = e} label='Công việc được giao' readOnly={readOnly} className='col-12' maxLength={200} />
                    <div className='col-12 form-group' />
                    <div className='col-12 form-group'>
                        <h4 className='control-label' style={{ fontWeight: 'bold', textAlign: 'left' }}>Điều 2: Chế độ làm việc</h4>
                    </div>
                    <FormTextBox ref={e => this.thoiGianLamViec = e} label='Thời gian làm việc' className='col-xl-6 col-md-6' />
                    <FormTextBox ref={e => this.dungCuLamViec = e} label='Dụng cụ được cấp phát' className='col-xl-6 col-md-6' />
                    <div className='col-12 form-group' />
                    <div className='col-12 form-group'>
                        <h4 className='control-label' style={{ fontWeight: 'bold', textAlign: 'left' }}>Điều 3: Nghĩa vụ và quyền lợi người lao động</h4>
                    </div>
                    <div className='col-12 form-group'>
                        <h5 className='control-label' style={{ fontWeight: 'bold' }}>1. Quyền lợi: </h5>
                    </div>
                    <FormTextBox ref={e => this.phuongTienLamViec = e} label='Phương tiện đi lại làm việc' className='col-xl-12 col-md-6' />
                    <FormSelect ref={e => this.bacLuong = e} label='Bậc lương' className='col-xl-4 col-md-6' data={this.state.ngach ? SelectAdapter_BacLuong_Filter(this.state.ngach) : []} onChange={this.handleBac} required />
                    <FormTextBox type='number' step={0.01} ref={e => this.heSoLuong = e} label='Hệ số lương' className='col-xl-4 col-md-6' required disable={!this.state.ngach} />
                    <FormTextBox ref={e => this.phanTramHuong = e} label='Phần trăm hưởng' className='col-xl-4 col-md-6' required />
                    <FormTextBox ref={e => this.hinhThucTraLuong = e} label='Hình thức trả lương' className='col-xl-12 col-md-12' required />
                    <FormTextBox ref={e => this.cheDoNghiNgoi = e} label='Chế độ nghỉ ngơi' className='col-12' />
                    <div className='col-12 form-group' />
                    <div className='col-12 form-group'>
                        <h5 className='control-label' style={{ fontWeight: 'bold' }}>2. Nghĩa vụ: </h5>
                    </div>
                    <FormTextBox ref={e => this.chiuSuPhanCong = e} label='Chịu sự điều hành, quản lý của' className='col-xl-6 col-md-6' />
                    <FormTextBox ref={e => this.boiThuong = e} label='Bồi thường vi phạm và vật chất' className='col-xl-6 col-md-6' />
                </div>
            </div>
        );
    }
}
const mapStateToProps = state => ({ staff: state.tccb.qtHopDongLaoDong, system: state.system });
const mapActionsToProps = {
    getDmDonViFaculty, getDmDonVi, getDmNgachCdnnAll, getDmNgachLuong, getDmLoaiHopDong, getDmDonViAll
};
export default connect(mapStateToProps, mapActionsToProps, null, { forwardRef: true })(ComponentDieuKhoan);
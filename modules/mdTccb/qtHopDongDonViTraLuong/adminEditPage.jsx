import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { getStaffAll, getStaff, updateStaff, createStaff, SelectAdapter_FwCanBo } from 'modules/mdTccb/tccbCanBo/redux';
import { SelectAdapter_DmGioiTinhV2 } from 'modules/mdDanhMuc/dmGioiTinh/redux';
import { getDmChucVuAll } from 'modules/mdDanhMuc/dmChucVu/redux';
import { getDmLoaiHopDong, getdmLoaiHopDongAll, SelectAdapter_DmLoaiHopDongV2 } from 'modules/mdDanhMuc/dmLoaiHopDong/redux';
import { getDmDonViAll, SelectAdapter_DmDonVi } from 'modules/mdDanhMuc/dmDonVi/redux';
import { getDmNgachCdnnAll, SelectAdapter_DmNgachCdnnV2 } from 'modules/mdDanhMuc/dmNgachCdnn/redux';
import {
    getQtHopDongDvtlEdit, updateQtHopDongDvtl,
    deleteQtHopDongDvtl, createQtHopDongDvtl, suggestSoHopDong
} from './redux';
import { FormDatePicker, FormSelect, FormTextBox } from 'view/component/AdminPage';
import { SelectAdapter_DmQuocGia } from 'modules/mdDanhMuc/dmQuocGia/redux';
import { ComponentDiaDiem } from 'modules/mdDanhMuc/dmDiaDiem/componentDiaDiem';
import { SelectAdapter_DmTrinhDoV2 } from 'modules/mdDanhMuc/dmTrinhDo/redux';
import { SelectAdapter_DmChucDanhKhoaHocV2 } from 'modules/mdDanhMuc/dmChucDanhKhoaHoc/redux';
import { SelectAdapter_DmDanTocV2 } from 'modules/mdDanhMuc/dmDanToc/redux';
import { SelectAdapter_DmTonGiaoV2 } from 'modules/mdDanhMuc/dmTonGiao/redux';
import Dropdown from 'view/component/Dropdown';
import moment from 'moment';
import { getPreShcc } from '../qtHopDongLaoDong/redux';
import { getDmDonVi } from 'modules/mdDanhMuc/dmDonVi/redux';
import { SelectApdater_DaiDienKy } from 'modules/mdTccb/qtChucVu/redux';
import { getDaiDienKyHopDong } from '../qtHopDongLaoDong/redux';
import { AdminPage } from 'view/component/AdminPage';

const EnumLoaiCanBo = Object.freeze({
    1: { text: 'Cán bộ mới' },
    2: { text: 'Cán bộ cũ' }
});

class QtHopDongDvtlEditPage extends AdminPage {
    constructor(props) {
        super(props);
        this.state = { item: null, canBoCu: false, hdkxdtg: false, thoiGianHd: '', shcc: '', isTaoMoi: true };

        //1. Thông tin bên A
        this.chucVuMapper = {};
        this.donViMapper = {};
    }

    componentDidMount() {
        T.ready('/user/tccb');
        const route = T.routeMatcher('/user/tccb/qua-trinh/hop-dong-dvtl/:id');
        this.id = route.parse(window.location.pathname).id;
        this.urlMa = this.id && this.id != 'new' ? this.id : null;
        this.props.getDmChucVuAll(items => {
            if (items) {
                this.chucVuMapper = {};
                items.forEach(item => {
                    this.chucVuMapper[item.ma] = item.ten;
                });
            }
        });
        this.props.getDmDonViAll(items => {
            if (items) {
                this.donViMapper = {};
                items.forEach(item => {
                    this.donViMapper[item.ma] = item.ten;
                });
            }
        });
        this.props.suggestSoHopDong(data => {
            this.setState({ suggestSoHopDong: data.soHopDongSuggested + '/' + new Date().getFullYear() + '/HĐĐV-XHNV-TCCB' }, () => {
                this.getData();
            });
        });
    }

    getData = () => {
        if (this.urlMa) {
            this.props.getQtHopDongDvtlEdit(this.id, data => {
                if (data.error) {
                    T.notify('Lấy thông tin hợp đồng bị lỗi!', 'danger');
                } else {
                    this.setState(
                        {
                            item: data.item,
                            isTaoMoi: false,
                            canBoCu: true,
                        }, () => {
                            this.setVal(data.item);
                        });
                }
                this.changeCanBo(data.item.shcc);
            });
        }
        else {
            this.setState({ isTaoMoi: true }, () => {
                this.setVal();
            });
        }

    }

    setVal = (data = {}) => {
        const {
            shcc = '', bac = '', batDauLamViec = '', chiuSuPhanCong = '', chucDanhNgheNghiep = '',
            congViecDuocGiao = '', diaDiemLamViec = '', donViTraLuong = '', heSo = '',
            ketThucHopDong = null, loaiHopDong = '',
            ngayKyHopDong = '', ngayTaiKy = '', nguoiKy = '',
            soHopDong = '', phanTramHuong = '', 
        } = data ? data : {};

        this.handleChucVu(data.nguoiKy);

        this.urlMa && this.selectedShcc.value(shcc);
        !this.urlMa && this.typeFilter.setText(EnumLoaiCanBo[1]);
        this.soHopDong.value(soHopDong ? soHopDong : this.state.suggestSoHopDong);

        this.loaiHopDong.value(loaiHopDong ? loaiHopDong : '');
        this.nguoiKy.value(nguoiKy ? nguoiKy : '');
        this.hieuLucHopDong.value(batDauLamViec ? batDauLamViec : '');
        this.batDauLamViec.value(batDauLamViec ? batDauLamViec : '');
        this.ketThucHopDong.value(ketThucHopDong);
        this.ngayKyHopDongTiepTheo.value(ngayTaiKy ? ngayTaiKy : '');
        this.diaDiemLamViec.value(diaDiemLamViec ? diaDiemLamViec : '');
        this.chucDanhNgheNghiep.value(chucDanhNgheNghiep ? chucDanhNgheNghiep : '');
        this.congViecDuocGiao.value(congViecDuocGiao ? congViecDuocGiao : '');
        this.chiuSuPhanCong.value(chiuSuPhanCong ? chiuSuPhanCong : '');
        this.donViChiTra.value(donViTraLuong ? donViTraLuong : '');
        this.bac.value(bac ? bac : '');
        this.heSo.value(heSo ? heSo : '');
        this.ngayKyHopDong.value(ngayKyHopDong ? ngayKyHopDong : '');
        this.phanTramHuong.value(phanTramHuong ? phanTramHuong : '');
    }

    validate = (selector) => {
        const data = selector.value();
        const isRequired = selector.props.required;
        if (data || data === 0 || data != '') return data;
        if (isRequired) {
            throw selector;
        }
        return null;
    };
    
    getVal = () => {
        try {
            const data = {
                shcc: (this.state.canBoCu || !this.state.isTaoMoi) ? this.validate(this.selectedShcc) : this.validate(this.shcc),
                ho: (this.state.canBoCu || !this.state.isTaoMoi) ? this.state.ho : this.validate(this.ho),
                ten: (this.state.canBoCu || !this.state.isTaoMoi) ? this.state.ten : this.validate(this.ten),
                email: this.validate(this.email),
                quocGia: this.validate(this.quocGia),
                danToc: this.validate(this.danToc),
                tonGiao: this.validate(this.tonGiao),
                ngaySinh: this.validate(this.ngaySinh)?.getTime(),
                phai: this.validate(this.gioiTinh),
                hocVanTrinhDo: this.validate(this.hocVanTrinhDo),
                hocVanChuyenNganh: this.validate(this.hocVanChuyenNganh),
                khoaHocChucDanh: this.validate(this.khoaHocChucDanh),
                khoaHocChuyenNganh: this.validate(this.khoaHocChuyenNganh),
                cmnd: this.validate(this.cmnd),
                cmndNgayCap: this.validate(this.cmndNgayCap)?.getTime(),
                cmndNoiCap: this.validate(this.cmndNoiCap),
                dienThoaiCaNhan: this.validate(this.dienThoai),
                maTinhNoiSinh: this.validate(this.noiSinh.dmTinhThanhPho),
                maHuyenNoiSinh: this.validate(this.noiSinh.dmQuanHuyen),
                maXaNoiSinh: this.validate(this.noiSinh.dmPhuongXa),
                thuongTruMaTinh: this.validate(this.thuongTru.dmTinhThanhPho),
                thuongTruMaHuyen: this.validate(this.thuongTru.dmQuanHuyen),
                thuongTruMaXa: this.validate(this.thuongTru.dmPhuongXa),
                thuongTruSoNha: this.validate(this.thuongTru.soNhaDuong),
                hienTaiMaTinh: this.validate(this.hienTai.dmTinhThanhPho),
                hienTaiMaHuyen: this.validate(this.hienTai.dmQuanHuyen),
                hienTaiMaXa: this.validate(this.hienTai.dmPhuongXa),
                hienTaiSoNha: this.validate(this.hienTai.soNhaDuong),
                hocVi: this.validate(this.hocVanTrinhDo),
                chuyenNganh: this.validate(this.hocVanChuyenNganh),
                chucDanh: this.validate(this.khoaHocChucDanh),
                chuyenNganhChucDanh: this.validate(this.khoaHocChuyenNganh),

                soHopDong: this.validate(this.soHopDong),
                nguoiKy: this.validate(this.nguoiKy),
                loaiHopDong: this.validate(this.loaiHopDong),
                batDauLamViec: this.validate(this.batDauLamViec)?.getTime(),
                ketThucHopDong: this.validate(this.ketThucHopDong)?.getTime(),
                ngayTaiKy: this.validate(this.ngayKyHopDongTiepTheo)?.getTime(),
                diaDiemLamViec: this.validate(this.diaDiemLamViec),
                chucDanhNgheNghiep: this.validate(this.chucDanhNgheNghiep),
                congViecDuocGiao: this.validate(this.congViecDuocGiao),
                chiuSuPhanCong: this.validate(this.chiuSuPhanCong),
                donViTraLuong: this.validate(this.donViChiTra),
                ngach: this.validate(this.chucDanhNgheNghiep),
                bac: parseFloat(this.validate(this.bac)),
                heSo: this.validate(this.heSo),
                ngayKyHopDong: this.validate(this.ngayKyHopDong)?.getTime(),
                phanTramHuong: this.validate(this.phanTramHuong),
            };
            return data;
        } catch(selector) {
            T.notify('<b>' + (selector.props.label || 'Dữ liệu') + '</b> bị trống!', 'danger');
            return false;
        }
    }

    checkContractDate = (shcc, hieuLucHopDong) => {
        if (hieuLucHopDong > this.hiredStaff[shcc]) return true;
        return false;
    }

    handleChucVu = (shccDaiDien) => {
        if (shccDaiDien) {
            this.props.getDaiDienKyHopDong(shccDaiDien, item => {
                this.setState({
                    chucVuNguoiKy: (this.chucVuMapper[item.item.chucVu] ? this.chucVuMapper[item.item.chucVu] : '') + ' - ' + (this.donViMapper[item.item.maDonVi] ? this.donViMapper[item.item.maDonVi] : '')
                });
            });
        }
    }

    copyAddress = e => {
        e.preventDefault();
        const dataThuongTru = this.thuongTru.value();
        this.hienTai.value(dataThuongTru.maTinhThanhPho, dataThuongTru.maQuanHuyen, dataThuongTru.maPhuongXa, dataThuongTru.soNhaDuong);
    }

    changeCanBo = (value) => {
        if (value) {
            this.props.getStaff(value, data => {
                let {
                    // maChucVu='',
                    ho = '', ten = '',
                    cmnd = '', cmndNgayCap = '', cmndNoiCap = '',
                    hienTaiMaHuyen = '', hienTaiMaTinh = '', hienTaiMaXa = '', hienTaiSoNha = '',
                    thuongTruMaHuyen = '', thuongTruMaTinh = '', thuongTruMaXa = '', thuongTruSoNha = '',
                    maTinhNoiSinh = '',
                    maHuyenNoiSinh = '',
                    maXaNoiSinh = '',
                    danToc = '', quocGia = '',
                    dienThoaiCaNhan = '',
                    email = '',
                    phai = '', ngaySinh = '',
                    hocVi = '',
                    chuyenNganh = '',
                    chucDanh = '',
                    chuyenNganhChucDanh = '',
                    tonGiao = '',
                } = data.item ? data.item : {};
                this.setState({ ho, ten });
                this.email.value(email ? email : '');
                this.gioiTinh.value(phai ? phai : '');
                this.quocGia.value(quocGia ? quocGia : '');
                this.danToc.value(danToc ? danToc : '');
                this.tonGiao.value(tonGiao ? tonGiao : '');
                this.ngaySinh.value(ngaySinh ? ngaySinh : '');

                this.noiSinh.value(maTinhNoiSinh, maHuyenNoiSinh, maXaNoiSinh);
                this.hienTai.value(hienTaiMaTinh, hienTaiMaHuyen, hienTaiMaXa, hienTaiSoNha);
                this.thuongTru.value(thuongTruMaTinh, thuongTruMaHuyen, thuongTruMaXa, thuongTruSoNha);

                this.hocVanTrinhDo.value(hocVi ? hocVi : '');
                this.hocVanChuyenNganh.value(chuyenNganh ? chuyenNganh : '');
                this.khoaHocChucDanh.value(chucDanh ? chucDanh : '');
                this.khoaHocChuyenNganh.value(chuyenNganhChucDanh ? chuyenNganhChucDanh : '');
                this.cmnd.value(cmnd ? cmnd : '');
                this.cmndNgayCap.value(cmndNgayCap ? cmndNgayCap : '');
                this.cmndNoiCap.value(cmndNoiCap ? cmndNoiCap : '');
                this.dienThoai.value(dienThoaiCaNhan ? dienThoaiCaNhan : '');
            });
        }
    }
    save = () => {
        const data = this.getVal();
        if (!data) {
            return;
        }
        const dcThuongTru = {
            thuongTruSoNha: this.thuongTru.value().soNhaDuong,
            thuongTruMaTinh: this.thuongTru.value().maTinhThanhPho,
            thuongTruMaHuyen: this.thuongTru.value().maQuanHuyen,
            thuongTruMaXa: this.thuongTru.value().maPhuongXa
        };
        const dcHienTai = {
            hienTaiSoNha: this.hienTai.value().soNhaDuong,
            hienTaiMaTinh: this.hienTai.value().maTinhThanhPho,
            hienTaiMaHuyen: this.hienTai.value().maQuanHuyen,
            hienTaiMaXa: this.hienTai.value().maPhuongXa
        };
        const dcNoiSinh = {
            noiSinhMaTinh: this.noiSinh.value().maTinhThanhPho
        };
        Object.assign(data, dcThuongTru, dcHienTai, dcNoiSinh);
        if (this.state.canBoCu) {
            T.confirm3('Cập nhật dữ liệu cán bộ', 'Bạn có muốn <b>Lưu hợp đồng</b> và <b>cập nhật</b> dữ liệu hiện tại bằng dữ liệu mới không?<br>Nếu không rõ, hãy chọn <b>Không cập nhật</b>!', 'warning', 'Không cập nhật', 'Cập nhật', isOverride => {
                if (isOverride !== null) {
                    if (isOverride)
                        T.confirm('Xác nhận', 'Lưu hợp đồng và <b>cập nhật</b> dữ liệu cán bộ?', 'warning', true, isConfirm => {
                            if (isConfirm) {
                                this.state.isTaoMoi ? this.props.createQtHopDongDvtl(data) : this.props.updateQtHopDongDvtl(this.id, data);
                                this.props.updateStaff(data.shcc, data);
                            }
                        });
                    else T.confirm('Xác nhận', 'Lưu hợp đồng và <b> không cập nhật </b> dữ liệu cán bộ?', 'warning', true, isConfirm => {
                        if (isConfirm) this.state.isTaoMoi ? this.props.createQtHopDongDvtl(data) : this.props.updateQtHopDongDvtl(this.id, data);
                    });
                } 
            });
        } else {
            T.confirm('Xác nhận', 'Lưu hợp đồng và <b> thêm dữ liệu cán bộ mới </b>?', 'warning', true, isConfirm => {
                if (isConfirm) {
                    this.props.createStaff(data);
                    this.props.createQtHopDongDvtl(data);
                }
            });
        }
    }

    // downloadWord = e => {
    //     e.preventDefault();
    //     let shcc = '';
    //     shcc = this.selectedShcc.current.getVal();
    //     downloadWord(this.urlMa, data => {
    //         T.FileSaver(new Blob([new Uint8Array(data.data)]), shcc + '_HĐ.docx');
    //     });
    // }

    handleLoaiHd = (value) => {
        this.props.getDmLoaiHopDong(value, data => {
            if (data && data.khongXacDinhTh) {
                this.setState({ hdkxdtg: true });
                $('#ketThucHd').hide();
                $('#kyTiepTheo').hide();

            } else {
                if (data && data.thoiGian) {
                    this.setState({ thoiGianHd: data.thoiGian });
                    $('#kyTiepTheo').show();
                    $('#ketThucHd').show();
                }
            }
        });
    }

    handleTuNgay = () => {
        if (this.ngayKyHopDong.value() && !this.state.hdkxdtg && this.state.thoiGianHd) {
            const newDate = moment(this.ngayKyHopDong.value()).add(parseInt(this.state.thoiGianHd), 'M');
            this.ketThucHopDong.value(newDate.valueOf() - 24 * 3600000);
        }
    }

    genNewShcc = () => {
        let maDonVi = this.diaDiemLamViec.value(),
            maChucDanhNgheNghiep = this.chucDanhNgheNghiep.value();
        if (maDonVi == '' || maDonVi == null || maChucDanhNgheNghiep == '' || maChucDanhNgheNghiep == null) {
            return;
        }
        this.props.getDmDonVi(maDonVi, (item) => {
            let preShcc = item.preShcc;
            this.props.getPreShcc(maDonVi, (data) => {
                preShcc = preShcc + '.' + (['01', '07', '12'].includes(maChucDanhNgheNghiep) ? '0' : '5') + data.preShcc.toString().padStart(3, '0');
                if (this.shcc) this.shcc.value(preShcc);
            });
        });
    };

    handleNgayBatDau = (value) => {
        this.batDauLamViec.value(value);
    }

    render() {
        const currentPermission = this.props.system && this.props.system.user && this.props.system.user.permissions ? this.props.system.user.permissions : [];
        let readOnly = !currentPermission.includes('qtHopDongDvtl:write');
        return (
            <main ref={this.main} className='app-content'>
                <div className='app-title'>
                    {!this.state.isTaoMoi ? (<>
                        <h1><i className='fa fa-pencil' />Chỉnh sửa hợp đồng đơn vị trả lương</h1>
                    </>) : <>
                        <h1><i className='fa fa-pencil' />Tạo mới hợp đồng đơn vị trả lương</h1>
                    </>}
                </div>
                <div className='tile'>
                    <h3 className='tile-title'>Thông tin hợp đồng phía trường</h3>
                    <div className='tile-body row'>
                        <div className='form-group col-xl-4 col-md-4'><FormTextBox ref={e => this.soHopDong = e} label='Số hợp đồng' readOnly={readOnly} required /> </div>
                        <div className='form-group col-xl-4 col-md-4'><FormSelect data={SelectApdater_DaiDienKy} ref={e => this.nguoiKy = e} onChange={value => this.handleChucVu(value.id)} label='Người đại diện ký' readOnly={readOnly} required /></div>
                        <div className='form-group col-md-4'>Chức vụ: <><br /><b>{this.state.chucVuNguoiKy}</b></></div>
                    </div>
                </div>
                <div className='tile'>
                    {this.urlMa ? <h3 className='tile-title'>Thông tin phía người ký</h3> :
                        <>
                            <h3 className='tile-title' style={{ display: 'flex' }}>Thông tin phía người ký là:&nbsp;&nbsp;
                                <Dropdown ref={e => this.typeFilter = e} items={[...Object.keys(EnumLoaiCanBo).map(key => EnumLoaiCanBo[key].text)]} onSelected={item => item == 'Cán bộ mới' ? this.setState({ canBoCu: false }) : this.setState({ canBoCu: true })} />
                            </h3>
                        </>}
                    <div className='tile-body row'>
                        {(this.state.canBoCu || this.urlMa) ?
                            <>
                                <div className='form-group col-xl-5 col-md-6'>
                                    <FormSelect data={SelectAdapter_FwCanBo} label='Chọn cán bộ' ref={e => this.selectedShcc = e} onChange={value => this.changeCanBo(value)} required disabled={this.urlMa ? true : readOnly} />
                                </div>
                                <div className='form-group col-xl-4 col-md-6'><FormDatePicker type='date-mask' ref={e => this.ngaySinh = e} label='Ngày sinh' disabled={readOnly} min={new Date(1900, 1, 1).getTime()} max={Date.nextYear(-10).roundDate().getTime()} required /></div>
                            </> : <>
                                <div className='form-group col-xl-12 col-md-12'><FormTextBox style={{ textTransform: 'uppercase' }} ref={e => this.shcc = e} maxLength={10} label='Mã số cán bộ' required readOnly={true}/> </div>
                                <div className='form-group col-xl-3 col-md-6'><FormTextBox style={{ textTransform: 'uppercase' }} ref={e => this.ho = e} maxLength={100} label='Họ và tên lót' required /> </div>
                                <div className='form-group col-xl-3 col-md-4'><FormTextBox ref={e => this.ten = e} label='Tên' maxLength={20} required /> </div>
                                <div className='form-group col-xl-3 col-md-4'><FormDatePicker type='date-mask' ref={e => this.ngaySinh = e} label='Ngày sinh' min={new Date(1900, 1, 1).getTime()} max={Date.nextYear(-10).roundDate().getTime()} required /> </div>

                            </>
                        }
                        <div className='form-group col-xl-4 col-md-4'><FormTextBox ref={e => this.cmnd = e} label='CMND/CCCD' placeholder='Nhập số CMND/CCCD' required/> </div>
                        <div className='form-group col-xl-4 col-md-4'><FormDatePicker type='date-mask' ref={e => this.cmndNgayCap = e} label='Ngày cấp CMND/CCCD' /> </div>
                        <div className='form-group col-xl-4 col-md-4'><FormTextBox ref={e => this.cmndNoiCap = e} label='Nơi cấp CMND/CCCD' /> </div>
                        <div className='form-group col-xl-2 col-md-4'><FormSelect data={SelectAdapter_DmGioiTinhV2} ref={e => this.gioiTinh = e} label='Giới tính' /> </div>
                        <div className='form-group col-xl-5 col-md-4'><FormTextBox ref={e => this.email = e} label='Email' /> </div>

                        <div className='form-group col-xl-5 col-md-4'><FormTextBox ref={e => this.dienThoai = e} label='Điện thoại' maxLength={10} /> </div>
                        <div className='form-group col-xl-4 col-md-4'><FormSelect data={SelectAdapter_DmQuocGia} ref={e => this.quocGia = e} label='Quốc tịch' required /> </div>
                        <div className='form-group col-xl-4 col-md-4'><FormSelect data={SelectAdapter_DmDanTocV2} ref={e => this.danToc = e} label='Dân tộc' required /> </div>
                        <div className='form-group col-xl-4 col-md-4'><FormSelect data={SelectAdapter_DmTonGiaoV2} ref={e => this.tonGiao = e} label='Tôn giáo' /> </div>

                        <ComponentDiaDiem ref={e => this.noiSinh = e} label='Nơi sinh' className='col-xl-6 col-md-6' onlyTinhThanh={true} />
                        <ComponentDiaDiem ref={e => this.thuongTru = e} label='Địa chỉ thường trú' className='col-md-12' requiredSoNhaDuong={true} />
                        <p className='col-md-12'>
                            Nếu <b>Địa chỉ thường trú</b> là <b>Địa chỉ hiện tại</b> thì&nbsp;<a href='#' onClick={this.copyAddress}>nhấp vào đây</a>.
                        </p>
                        <ComponentDiaDiem ref={e => this.hienTai = e} label='Địa chỉ hiện tại' className='col-md-12' requiredSoNhaDuong={true} />
                        <div className='form-group col-xl-6 col-md-4'><FormSelect data={SelectAdapter_DmTrinhDoV2} ref={e => this.hocVanTrinhDo = e} label='Trình độ học vấn' /> </div>
                        <div className='form-group col-xl-6 col-md-4'><FormTextBox ref={e => this.hocVanChuyenNganh = e} label='Ngành' /> </div>
                        <div className='form-group col-xl-6 col-md-4'><FormSelect data={SelectAdapter_DmChucDanhKhoaHocV2} ref={e => this.khoaHocChucDanh = e} label='Chức danh khoa học' /> </div>
                        <div className='form-group col-xl-6 col-md-4'><FormTextBox ref={e => this.khoaHocChuyenNganh = e} label='Ngành' /> </div>
                    </div>
                </div>
                <div className='tile'>
                    <h3 className='tile-title'>Thời hạn và công việc hợp đồng</h3>
                    <div className='tile-body row'>
                        <div className='form-group col-xl-6 col-md-6'><FormSelect data={SelectAdapter_DmLoaiHopDongV2} ref={e => this.loaiHopDong = e} label='Loại hợp đồng' onChange={this.handleLoaiHd} required /></div>
                        <div className='form-group col-xl-6 col-md-6'><FormDatePicker type='date-mask' ref={e => this.ngayKyHopDong = e} label='Ngày ký hợp đồng' onChange={this.handleTuNgay} required /></div>
                        <div className='form-group col-xl-3 col-md-6'><FormDatePicker type='date-mask' ref={e => this.hieuLucHopDong = e} label='Ngày hiệu lực hợp đồng' required onChange={this.handleNgayBatDau} /></div>
                        <div className='form-group col-xl-3 col-md-6'><FormDatePicker type='date-mask' ref={e => this.batDauLamViec = e} label='Ngày bắt đầu làm việc' required readOnly/></div>
                        <div className='form-group col-xl-3 col-md-6' id='ketThucHd'><FormDatePicker type='date-mask' ref={e => this.ketThucHopDong = e} label='Ngày kết thúc hợp đồng' required /></div>
                        <div className='form-group col-xl-3 col-md-6' id='kyTiepTheo'><FormDatePicker type='date-mask' ref={e => this.ngayKyHopDongTiepTheo = e} label='Ngày ký hợp đồng tiếp theo' /></div>
                        <div className='form-group col-xl-12 col-md-12'><FormSelect data={SelectAdapter_DmDonVi} ref={e => this.diaDiemLamViec = e} label='Địa điểm làm việc' onChange={this.genNewShcc}/></div>
                        <div className='form-group col-xl-4 col-md-4'><FormSelect data={SelectAdapter_DmNgachCdnnV2} ref={e => this.chucDanhNgheNghiep = e} onChange={this.genNewShcc} label='Chức danh nghề nghiệp' /></div>
                        <div className='form-group col-xl-4 col-md-4'><FormTextBox ref={e => this.congViecDuocGiao = e} label='Công việc được giao' /></div>
                        <div className='form-group col-xl-4 col-md-4'><FormTextBox ref={e => this.chiuSuPhanCong = e} label='Chịu sự phân công' /></div>
                        <div className='form-group col-xl-6 col-md-6'><FormSelect data  ={SelectAdapter_DmDonVi} ref={e => this.donViChiTra = e} label='Đơn vị chi trả' /></div>
                        <div className='form-group col-xl-4 col-md-6'><FormTextBox ref={e => this.bac = e} label='Bậc' /></div>
                        <div className='form-group col-xl-4 col-md-6'><FormTextBox ref={e => this.heSo = e} label='Hệ số' /></div>
                        <div className='form-group col-xl-4 col-md-6'><FormTextBox ref={e => this.phanTramHuong = e} label='Phần trăm hưởng' /></div>
                    </div>
                </div>
                <Link to='/user/tccb/qua-trinh/hop-dong-dvtl' className='btn btn-secondary btn-circle' style={{ position: 'fixed', bottom: '10px' }}>
                    <i className='fa fa-lg fa-reply' />
                </Link>
                <button type='button' title='Save' className='btn btn-primary btn-circle' style={{ position: 'fixed', right: '10px', bottom: '10px' }} onClick={this.save}>
                    <i className='fa fa-lg fa-save' />
                </button>
                {this.urlMa ? <button type='button' title='Save and export LL2C Word' className='btn btn-circle' style={{ position: 'fixed', right: '70px', bottom: '10px', color: 'white', backgroundColor: 'rgb(76, 110, 245)' }} onClick={this.downloadWord}>
                    <i className='fa fa-lg fa-file-word-o' />
                </button> : null}
            </main>
        );

    }
}

const mapStateToProps = state => ({ system: state.system, qtHopDongDvtl: state.tccb.qtHopDongDvtl });
const mapActionsToProps = {
    getStaffAll, getStaff, updateStaff, createStaff, getQtHopDongDvtlEdit, updateQtHopDongDvtl,
    deleteQtHopDongDvtl, createQtHopDongDvtl, getdmLoaiHopDongAll,
    getDmDonViAll, getDmNgachCdnnAll, getDmChucVuAll, getDmLoaiHopDong,
    getDmDonVi, getPreShcc, getDaiDienKyHopDong, suggestSoHopDong
};
export default connect(mapStateToProps, mapActionsToProps)(QtHopDongDvtlEditPage);
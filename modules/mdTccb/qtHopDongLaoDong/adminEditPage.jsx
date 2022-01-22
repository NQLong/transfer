import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { SelectAdapter_DmGioiTinh } from 'modules/mdDanhMuc/dmGioiTinh/redux';
import { getDmLoaiHopDong, getdmLoaiHopDongAll, SelectAdapter_DmLoaiHopDong } from 'modules/mdDanhMuc/dmLoaiHopDong/redux';
import {
    getStaff, createStaff, getStaffAll,
    deleteStaff, updateStaff, SelectAdapter_FwCanBo
} from 'modules/mdTccb/tccbCanBo/redux';
import moment from 'moment';
import { getDmDonViAll, SelectAdapter_DmDonViFaculty } from 'modules/mdDanhMuc/dmDonVi/redux';
import { getDmNgachCdnnAll } from 'modules/mdDanhMuc/dmNgachCdnn/redux';
import {
    getQtHopDongLaoDongPage, getQtHopDongLaoDongAll, updateQtHopDongLaoDong, downloadWord,
    deleteQtHopDongLaoDong, createQtHopDongLaoDong, getQtHopDongLaoDongEdit, getTruongPhongTccb
} from './redux';
import TextInput from 'view/component/Input';
import { QTForm } from 'view/component/Form';
import { getDmChucVuAll } from 'modules/mdDanhMuc/dmChucVu/redux';
import { SelectAdapter_DmNgachCdnn } from 'modules/mdDanhMuc/dmNgachCdnn/redux';
import { SelectAdapter_DmQuocGia } from 'modules/mdDanhMuc/dmQuocGia/redux';
import { ComponentDiaDiem } from 'modules/mdDanhMuc/dmDiaDiem/componentDiaDiem';
import { SelectAdapter_DmTrinhDo } from 'modules/mdDanhMuc/dmTrinhDo/redux';
import { SelectAdapter_DmDanToc } from 'modules/mdDanhMuc/dmDanToc/redux';
import { SelectAdapter_DmTonGiao } from 'modules/mdDanhMuc/dmTonGiao/redux';
import Dropdown from 'view/component/Dropdown';
import Loading from 'view/component/Loading';
import { SelectAdapter_DmChucDanhChuyenMon } from 'modules/mdDanhMuc/dmChucDanhChuyenMon/redux';
import { DateInput } from 'view/component/Input';
import { Select } from 'view/component/Input';


const EnumLoaiCanBo = Object.freeze({
    1: { text: 'Cán bộ mới' },
    2: { text: 'Cán bộ cũ' }
});


class QtHopDongLaoDongEditPage extends QTForm {
    constructor(props) {
        super(props);
        this.state = {
            item: null, ma: null, canBoCu: false, ho: null, ten: null, ngaySinh: null, isLoad: true, isKetThucHd: true,
            hdkxdtg: false, thoiGianHd: '', shcc: '',
        };
        this.ho = React.createRef();
        this.ten = React.createRef();
        this.selectedShcc = React.createRef();
        this.shcc = React.createRef();
        this.email = React.createRef();
        this.quocGia = React.createRef();
        this.danToc = React.createRef();
        this.tonGiao = React.createRef();
        this.ngaySinh = React.createRef();
        this.phai = React.createRef();
        // this.chucVuNguoiKy = React.createRef();
        this.hocVanTrinhDo = React.createRef();
        this.hocVanChuyenNganh = React.createRef();
        this.cmnd = React.createRef();
        this.cmndNgayCap = React.createRef();
        this.cmndNoiCap = React.createRef();
        this.dienThoaiCaNhan = React.createRef();
        this.main = React.createRef();
        this.soHopDong = React.createRef();
        this.loaiHopDong = React.createRef();
        this.nguoiKy = React.createRef();
        this.batDauLamViec = React.createRef();
        this.ketThucHopDong = React.createRef();
        this.ngayKyHopDongTiepTheo = React.createRef();
        this.diaDiemLamViec = React.createRef();
        this.chucDanhChuyenMon = React.createRef();
        this.congViecDuocGiao = React.createRef();
        this.chiuSuPhanCong = React.createRef();
        this.ngach = React.createRef();
        this.bac = React.createRef();
        this.heSo = React.createRef();
        this.ngayKyHopDong = React.createRef();
        this.phanTramHuong = React.createRef();
        this.typeFilter = React.createRef();

        this.chucVuMapper = {};
        this.donViMapper = {};
        this.hiredStaff = {};
    }

    componentDidMount() {
        T.ready('/user/tccb/qua-trinh/hop-dong-lao-dong');
        this.soHopDong.current.focus();
        this.props.getTruongPhongTccb(data => {
            if (data) {
                data.truongPhongTccb && data.truongPhongTccb.shcc && this.setState({ truongPhongTccb: data.truongPhongTccb.shcc });
                this.getData();
            }
        });
        this.props.getStaffAll(items => {
            if (items) {
                this.hiredStaff = {};
                items.forEach(item => {
                    this.hiredStaff[item.shcc] = item.hopDongCanBoNgay;
                });
            }
        });
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
    }

    getData = () => {
        const route = T.routeMatcher('/user/tccb/qua-trinh/hop-dong-lao-dong/:ma'),
            ma = route.parse(window.location.pathname).ma;
        this.urlMa = ma && ma != 'new' ? ma : null;
        if (this.urlMa) {
            this.props.getQtHopDongLaoDongEdit(ma, data => {
                if (data.error) {
                    T.notify('Lấy thông tin hợp đồng bị lỗi!', 'danger');
                } else {
                    this.setState(
                        {
                            item: data.item,
                            isLoad: false,
                            isKetThucHd: data && data.item && data.item.loaiHopDong != '07' ? true : false,
                        }, () => {
                            this.setVal(data.item);
                        });
                }
            });
        }
        else {
            this.setState({ isLoad: false });
            this.setVal();
        }

    }

    setVal = (data = {}) => {
        const {
            shcc = '',
            quocGia = '',
            danToc = '',
            tonGiao = '',
            ngaySinh = '',
            email = '',
            phai = '',
            maTinhNoiSinh = '',
            maTinhNguyenQuan = '',
            hienTaiMaTinh = '',
            hienTaiMaHuyen = '',
            hienTaiMaXa = '',
            hienTaiSoNha = '',
            thuongTruMaTinh = '',
            thuongTruMaHuyen = '',
            thuongTruMaXa = '',
            thuongTruSoNha = '',
            trinhDoPhoThong = '',
            chuyenNganh = '',
            cmnd = '',
            cmndNgayCap = '',
            cmndNoiCap = '',
            dienThoaiCaNhan = '' } = data.canBoDuocThue ? data.canBoDuocThue : {};

        const {
            soHopDong = '', loaiHopDong = '',
            batDauLamViec = '', ketThucHopDong = null, ngayKyHopDongTiepTheo = '',
            diaDiemLamViec = '', chucDanhChuyenMon = '',
            congViecDuocGiao = '', chiuSuPhanCong = '', ngach = '', bac = '', heSo = '', ngayKyHopDong = '',
            phanTramHuong = ''
        } = data.qtHopDongLaoDong ? data.qtHopDongLaoDong : {};

        if (data.canBo) {
            this.nguoiKy.current.setVal(data.canBo.shcc);
            this.setState({ chucVuNguoiKy: (this.chucVuMapper[data.canBo.maChucVu] ? this.chucVuMapper[data.canBo.maChucVu] : '') + ' - ' + (this.donViMapper[data.canBo.maDonVi] ? this.donViMapper[data.canBo.maDonVi] : '') });
        }
        else {
            this.nguoiKy.current.setVal(this.state.truongPhongTccb);
            this.setState({ chucVuNguoiKy: this.chucVuMapper['003'] + ' - ' + this.donViMapper['30'] });
        }
        this.urlMa && this.selectedShcc.current.setVal(shcc);
        this.phai.current.setVal(phai);
        this.quocGia.current.setVal(quocGia ? quocGia : '');
        this.danToc.current.setVal(danToc ? danToc : '');
        this.tonGiao.current.setVal(tonGiao ? tonGiao : '');
        this.ngaySinh.current.setVal(ngaySinh ? ngaySinh : '');
        this.noiSinh.value(maTinhNoiSinh);
        this.nguyenQuan.value(maTinhNguyenQuan);
        this.email.current.setVal(email ? email : '');
        this.cuTru.value(hienTaiMaTinh, hienTaiMaHuyen, hienTaiMaXa, hienTaiSoNha);
        this.thuongTru.value(thuongTruMaTinh, thuongTruMaHuyen, thuongTruMaXa, thuongTruSoNha);

        !this.urlMa && this.typeFilter.current.setText(EnumLoaiCanBo[1]);

        this.hocVanTrinhDo.current.setVal(trinhDoPhoThong ? trinhDoPhoThong : '');
        this.hocVanChuyenNganh.current.setVal(chuyenNganh ? chuyenNganh : '');
        this.cmnd.current.setVal(cmnd ? cmnd : '');
        this.cmndNgayCap.current.setVal(cmndNgayCap ? cmndNgayCap : '');
        this.cmndNoiCap.current.setVal(cmndNoiCap ? cmndNoiCap : '');
        this.dienThoaiCaNhan.current.setVal(dienThoaiCaNhan ? dienThoaiCaNhan : '');
        this.soHopDong.current.setVal(soHopDong ? soHopDong : '');
        this.loaiHopDong.current.setVal(loaiHopDong ? loaiHopDong : '');
        this.batDauLamViec.current.setVal(batDauLamViec ? batDauLamViec : '');
        this.ketThucHopDong.current.setVal(ketThucHopDong);
        this.ngayKyHopDongTiepTheo.current.setVal(ngayKyHopDongTiepTheo ? ngayKyHopDongTiepTheo : '');
        this.diaDiemLamViec.current.setVal(diaDiemLamViec ? diaDiemLamViec : '');
        this.chucDanhChuyenMon.current.setVal(chucDanhChuyenMon ? chucDanhChuyenMon : '');
        this.congViecDuocGiao.current.setVal(congViecDuocGiao ? congViecDuocGiao : '');
        this.chiuSuPhanCong.current.setVal(chiuSuPhanCong ? chiuSuPhanCong : '');
        this.ngach.current.setVal(ngach ? ngach : '');
        this.bac.current.setVal(bac ? bac : '');
        this.heSo.current.setVal(heSo ? heSo : '');
        this.ngayKyHopDong.current.setVal(ngayKyHopDong ? ngayKyHopDong : '');

        this.phanTramHuong.current.setVal(phanTramHuong ? phanTramHuong : '');
    }

    getVal = () => ({
        shcc: this.urlMa ? this.selectedShcc.current.getFormVal() : this.shcc.current.getFormVal(),
        quocGia: this.quocGia.current.getFormVal(),
        danToc: this.danToc.current.getFormVal(),
        tonGiao: this.tonGiao.current.getFormVal(),
        phai: this.phai.current.getFormVal(),
        ngaySinh: this.ngaySinh.current.getFormVal(),
        trinhDoPhoThong: this.hocVanTrinhDo.current.getFormVal(),
        chuyenNganh: this.hocVanChuyenNganh.current.getFormVal(),
        cmnd: this.cmnd.current.getFormVal(),
        cmndNgayCap: this.cmndNgayCap.current.getFormVal(),
        cmndNoiCap: this.cmndNoiCap.current.getFormVal(),
        dienThoaiCaNhan: this.dienThoaiCaNhan.current.getFormVal(),
        email: this.email.current.getFormVal(),
        hopDongCanBoNgay: this.batDauLamViec.current.getFormVal(),
        nguoiDuocThue: this.urlMa ? this.selectedShcc.current.getFormVal() : this.shcc.current.getFormVal(),
        soHopDong: this.soHopDong.current.getFormVal(),
        loaiHopDong: this.loaiHopDong.current.getFormVal(),
        nguoiKy: this.nguoiKy.current.getFormVal(),
        batDauLamViec: this.batDauLamViec.current.getFormVal(),
        ketThucHopDong: this.ketThucHopDong.current.getFormVal(),
        ngayKyHopDongTiepTheo: this.ngayKyHopDongTiepTheo.current.getFormVal(),
        diaDiemLamViec: this.diaDiemLamViec.current.getFormVal(),
        chucDanhChuyenMon: this.chucDanhChuyenMon.current.getFormVal(),
        chucDanh: this.chucDanhChuyenMon.current.getFormVal(),
        congViecDuocGiao: this.congViecDuocGiao.current.getFormVal(),
        chiuSuPhanCong: this.chiuSuPhanCong.current.getFormVal(),
        ngach: this.ngach.current.getFormVal(),
        bac: this.bac.current.getFormVal(),
        heSo: this.heSo.current.getFormVal(),
        ngayKyHopDong: this.ngayKyHopDong.current.getFormVal(),
        phanTramHuong: this.phanTramHuong.current.getFormVal(),
    })


    changeCanBo = (value) => {
        if (value) {
            this.props.getStaff(value, data => {
                let {
                    shcc = '',
                    quocGia = '',
                    danToc = '',
                    tonGiao = '',
                    ngaySinh = '',
                    email = '',
                    phai = '',
                    maTinhNoiSinh = '',
                    maTinhNguyenQuan = '',
                    hienTaiMaTinh = '',
                    hienTaiMaHuyen = '',
                    hienTaiMaXa = '',
                    hienTaiSoNha = '',
                    thuongTruMaTinh = '',
                    thuongTruMaHuyen = '',
                    thuongTruMaXa = '',
                    thuongTruSoNha = '',
                    trinhDoPhoThong = '',
                    chuyenNganh = '',
                    cmnd = '',
                    cmndNgayCap = '',
                    cmndNoiCap = '',
                    dienThoaiCaNhan = ''
                } = data.item ? data.item : {};
                this.email.current.setVal(email ? email : '');
                this.phai.current.setVal(phai ? phai : '');
                this.quocGia.current.setVal(quocGia ? quocGia : '');
                this.danToc.current.setVal(danToc ? danToc : '');
                this.tonGiao.current.setVal(tonGiao ? tonGiao : '');
                this.ngaySinh.current.setVal(ngaySinh ? ngaySinh : '');
                this.dienThoaiCaNhan.current.setVal(dienThoaiCaNhan ? dienThoaiCaNhan : '');
                this.noiSinh.value(maTinhNoiSinh);
                this.nguyenQuan.value(maTinhNguyenQuan);
                this.cuTru.value(hienTaiMaTinh, hienTaiMaHuyen, hienTaiMaXa, hienTaiSoNha);
                this.thuongTru.value(thuongTruMaTinh, thuongTruMaHuyen, thuongTruMaXa, thuongTruSoNha);

                this.hocVanTrinhDo.current.setVal(trinhDoPhoThong ? trinhDoPhoThong : '');
                this.hocVanChuyenNganh.current.setVal(chuyenNganh ? chuyenNganh : '');
                this.cmnd.current.setVal(cmnd ? cmnd : '');
                this.cmndNgayCap.current.setVal(cmndNgayCap ? cmndNgayCap : '');
                this.cmndNoiCap.current.setVal(cmndNoiCap ? cmndNoiCap : '');
                this.setState({ shcc: shcc });
            });
        }
    }

    copyAddress = e => {
        e.preventDefault();
        const dataThuongTru = this.thuongTru.value();
        console.log(dataThuongTru);
        this.cuTru.value(dataThuongTru.maTinhThanhPho, dataThuongTru.maQuanHuyen, dataThuongTru.maPhuongXa, dataThuongTru.soNhaDuong);
    }
    autoChucVu = (value) => {
        if (value) {
            this.props.getStaff(value, data => {
                if (data.error) {
                    T.notify('Lấy thông tin cán bộ đại diện ký bị lỗi!', 'danger');
                } else if (data.item) {
                    this.setState({
                        chucVuNguoiKy: (this.chucVuMapper[data.item.maChucVu] ? this.chucVuMapper[data.item.maChucVu] : '') + ' - ' + (this.donViMapper[data.item.maDonVi] ? this.donViMapper[data.item.maDonVi] : '')
                    });
                }
            });
        }
    }

    handleLoaiHd = (value) => {
        this.props.getDmLoaiHopDong(value, data => {
            if (data && data.khongXacDinhTh) {
                this.setState({ isKetThucHd: false, hdkxdtg: true });
                $('#ketThucHd').hide();
                $('#kyTiepTheo').hide();

            } else {
                if (data && data.thoiGian) {
                    this.setState({ thoiGianHd: data.thoiGian, isKetThucHd: true });
                    $('#kyTiepTheo').show();
                    $('#ketThucHd').show();
                }
            }
        });
    }


    newShcc = (value) => {
        this.setState({ shcc: moment(value) });
    }
    handleTuNgay = () => {
        if (this.ngayKyHopDong.current.getVal() && !this.state.hdkxdtg && this.state.thoiGianHd) {
            const new_date = moment(this.ngayKyHopDong.current.getVal()).add(parseInt(this.state.thoiGianHd), 'M');
            this.ketThucHopDong.current.setVal(new_date.valueOf() - 24 * 3600000);
        }
    }

    changeNgach = (value) => {
        this.setState({ idNgach: Number(value) });
    }

    checkSignedDate = (shcc, batDauLamViec) => {
        if (batDauLamViec > this.hiredStaff[shcc]) return true;
        return false;
    }

    save = () => {
        const data = this.getFormVal();
        const dcThuongTru = {
            thuongTruMaTinh: this.thuongTru.value().maTinhThanhPho,
            thuongTruMaHuyen: this.thuongTru.value().maQuanHuyen,
            thuongTruMaXa: this.thuongTru.value().maPhuongXa,
            thuongTruSoNha: this.thuongTru.value().soNhaDuong
        };
        const dcCuTru = {
            hienTaiMaTinh: this.cuTru.value().maTinhThanhPho,
            hienTaiMaHuyen: this.cuTru.value().maQuanHuyen,
            hienTaiMaXa: this.cuTru.value().maPhuongXa,
            hienTaiSoNha: this.cuTru.value().soNhaDuong
        };
        const dcNoiSinh = {
            maTinhNoiSinh: this.noiSinh.value().maTinhThanhPho
        };
        const dcNguyenQuan = {
            maTinhNguyenQuan: this.nguyenQuan.value().maTinhThanhPho
        };
        this.main.current.classList.add('validated');
        if (data.data) {
            if (this.urlMa) {
                this.props.updateQtHopDongLaoDong(this.urlMa, Object.assign(data.data, dcThuongTru, dcCuTru, dcNguyenQuan, dcNoiSinh, { hopDongCanBo: 'LĐ' }), () => {
                    console.log(data.data);
                    this.props.updateStaff(this.state.shcc, Object.assign(data.data, dcThuongTru, dcCuTru, dcNguyenQuan, dcNoiSinh, { hopDongCanBo: 'LĐ' }), () => {
                        this.main.current.classList.remove('validated');
                        this.props.history.push(`/user/tccb/qua-trinh/hop-dong-lao-dong/${this.urlMa}`);
                    });
                });
            } else {
                Object.assign(data.data, {
                    ho: this.ho.current.getVal().trim().toUpperCase(),
                    ten: this.ten.current.getVal().trim().toUpperCase(),
                });
                this.props.createQtHopDongLaoDong(data.data, hopDong => {
                    if (this.hiredStaff[hopDong.item.nguoiDuocThue] != null) {
                        if (this.checkSignedDate(hopDong.item.nguoiDuocThue, hopDong.item.batDauLamViec)) {
                            this.props.updateStaff(hopDong.item.nguoiDuocThue, Object.assign(data.data, dcThuongTru, dcCuTru, dcNguyenQuan, dcNoiSinh));
                        }
                    }
                    else this.props.createStaff(data.data);
                    this.props.history.push(`/user/tccb/qua-trinh/hop-dong-lao-dong/${hopDong.item.ma}`);
                });
            }
        }
    }

    downloadWord = e => {
        e.preventDefault();
        let shcc = '';
        shcc = this.selectedShcc.current.getVal();
        downloadWord(this.urlMa, data => {
            T.FileSaver(new Blob([new Uint8Array(data.data)]), shcc + '_hopdonglaodong.docx');
        });
    }

    render() {
        const currentPermission = this.props.system && this.props.system.user && this.props.system.user.permissions ? this.props.system.user.permissions : [];
        let readOnly = !currentPermission.includes('qtHopDongLaoDong:write');
        return (
            <main ref={this.main} className='app-content'>
                {this.state.isLoad && <Loading />}
                <div className='app-title'>
                    {this.state.item && this.state.item.canBoDuocThue ? (<>
                        <h1><i className='fa fa-file-text-o' /> Hợp đồng lao động {`: ${this.state.item.canBoDuocThue.ho}  ${this.state.item.canBoDuocThue.ten}`}</h1>
                        <p>Số hợp đồng: {this.state.item.qtHopDongLaoDong.soHopDong}</p>
                    </>) : <>
                        <h1><i className='fa fa-file-text-o' /> Tạo mới hợp đồng lao động</h1>
                    </>}
                </div>
                <div className='tile'>
                    <h3 className='tile-title'>Thông tin phía trường</h3>
                    <div className='tile-body row'>
                        <div className='form-group col-xl-4 col-md-6'><TextInput ref={this.soHopDong} label='Số hợp đồng' disabled={readOnly} required /> </div>
                        <div className='form-group col-xl-4 col-md-6'><Select adapter={SelectAdapter_FwCanBo} ref={this.nguoiKy} onChange={value => this.autoChucVu(value)} label='Người đại diện ký' disabled={readOnly} required /></div>
                        <div className='form-group col-md-4'>Chức vụ: <><br /><b>{this.state.chucVuNguoiKy}</b></></div>
                    </div>
                </div>
                <div className='tile'>
                    {this.urlMa ? <h3 className='tile-title'>Thông tin phía người ký</h3> :
                        <>
                            <h3 className='tile-title' style={{ display: 'flex' }}>Thông tin phía người ký là:&nbsp;&nbsp;
                                <Dropdown ref={this.typeFilter} items={[...Object.keys(EnumLoaiCanBo).map(key => EnumLoaiCanBo[key].text)]} onSelected={item => item == 'Cán bộ mới' ? this.setState({ canBoCu: false }) : this.setState({ canBoCu: true })} />
                            </h3>
                        </>}
                    <div className='tile-body row'>
                        {(this.state.canBoCu || this.urlMa) ?
                            <>
                                <div className='form-group col-xl-5 col-md-6'>
                                    <Select adapter={SelectAdapter_FwCanBo} label='Cán bộ' ref={this.selectedShcc} onChange={value => this.changeCanBo(value)} required disabled={this.urlMa ? true : readOnly} />
                                </div>
                                <div className='form-group col-xl-4 col-md-6'><DateInput ref={this.ngaySinh} label='Ngày sinh' disabled={readOnly} min={new Date(1900, 1, 1).getTime()} max={Date.nextYear(-10).roundDate().getTime()} required /></div>
                            </> : <>
                                <div className='form-group col-xl-3 col-md-4'><TextInput disabled={readOnly} ref={this.shcc} onChange={this.newShcc} label='Mã số cán bộ' required /> </div>
                                <div className='form-group col-xl-3 col-md-4'><TextInput disabled={readOnly} style={{ textTransform: 'uppercase' }} ref={this.ho} label='Họ' /> </div>
                                <div className='form-group col-xl-3 col-md-4'><TextInput disabled={readOnly} style={{ textTransform: 'uppercase' }} ref={this.ten} label='Tên' /> </div>
                                <div className='form-group col-xl-3 col-md-6'><DateInput disabled={readOnly} ref={this.ngaySinh} label='Ngày sinh' /> </div>

                            </>
                        }
                        <div className='form-group col-xl-4 col-md-4'><TextInput ref={this.cmnd} label='CMND/CCCD' placeholder='Nhập số CMND/CCCD' disabled={readOnly} /> </div>
                        <div className='form-group col-xl-4 col-md-4'><DateInput ref={this.cmndNgayCap} label='Ngày cấp' disabled={readOnly} /> </div>
                        <div className='form-group col-xl-4 col-md-4'><TextInput ref={this.cmndNoiCap} label='Nơi cấp' disabled={readOnly} /> </div>
                        <div className='form-group col-xl-2 col-md-4'><Select adapter={SelectAdapter_DmGioiTinh} ref={this.phai} label='Giới tính' disabled={readOnly} /> </div>
                        <div className='form-group col-xl-5 col-md-4'><TextInput ref={this.email} label='Email cá nhân' disabled={readOnly} /> </div>
                        <div className='form-group col-xl-5 col-md-4'><TextInput ref={this.dienThoaiCaNhan} label='Điện thoại' disabled={readOnly} /> </div>
                        <div className='form-group col-xl-4 col-md-4'><Select adapter={SelectAdapter_DmQuocGia} ref={this.quocGia} label='Quốc tịch' disabled={readOnly} /> </div>
                        <div className='form-group col-xl-4 col-md-4'><Select adapter={SelectAdapter_DmDanToc} ref={this.danToc} label='Dân tộc' disabled={readOnly} /> </div>
                        <div className='form-group col-xl-4 col-md-4'><Select adapter={SelectAdapter_DmTonGiao} ref={this.tonGiao} label='Tôn giáo' disabled={readOnly} /> </div>

                        <ComponentDiaDiem ref={e => this.noiSinh = e} label='Nơi sinh' className='col-xl-6 col-md-6' onlyTinhThanh={true} />
                        <ComponentDiaDiem ref={e => this.nguyenQuan = e} label='Nguyên quán' className='col-xl-6 col-md-6' onlyTinhThanh={true} />
                        <ComponentDiaDiem ref={e => this.thuongTru = e} label='Địa chỉ thường trú' className='col-md-12' requiredSoNhaDuong={true} />
                        <p className='col-md-12'>
                            Nếu <b>Địa chỉ thường trú</b> là <b>Địa chỉ hiện tại</b> thì&nbsp;<a href='#' onClick={this.copyAddress}>nhấp vào đây</a>.
                        </p>
                        <ComponentDiaDiem ref={e => this.cuTru = e} label='Địa chỉ hiện tại' className='col-md-12' requiredSoNhaDuong={true} />
                        <div className='form-group col-xl-6 col-md-4'><Select adapter={SelectAdapter_DmTrinhDo} disabled={readOnly} ref={this.hocVanTrinhDo} label='Trình độ học vấn' /> </div>
                        <div className='form-group col-xl-6 col-md-4'><TextInput ref={this.hocVanChuyenNganh} label='Ngành' disabled={readOnly} /> </div>
                    </div>
                </div>
                <div className='tile'>
                    <h3 className='tile-title'>Điều khoản hợp đồng</h3>
                    <div className='tile-body row'>
                        <div className='form-group col-xl-6 col-md-6'><Select adapter={SelectAdapter_DmLoaiHopDong} ref={this.loaiHopDong} onChange={this.handleLoaiHd} label='Loại hợp đồng lao động' required disabled={readOnly} /></div>
                        <div className='form-group col-xl-6 col-md-6'></div>
                        <div className='form-group col-xl-3 col-md-6'><DateInput ref={this.ngayKyHopDong} label='Ngày ký hợp đồng' min={new Date(1900, 1, 1).getTime()} max={new Date(new Date().getFullYear() + 1, 1, 1).getTime()} required disabled={readOnly} /></div>
                        <div className='form-group col-xl-3 col-md-6'><DateInput ref={this.batDauLamViec} label='Ngày bắt đầu làm việc' min={new Date(1900, 1, 1).getTime()} max={new Date(new Date().getFullYear() + 1, 1, 1).getTime()} disabled={readOnly} onChange={this.handleTuNgay} required /></div>
                        <div className='form-group col-xl-3 col-md-6' id='ketThucHd'><DateInput ref={this.ketThucHopDong} label='Ngày kết thúc hợp đồng' min={new Date(1900, 1, 1).getTime()} max={new Date(new Date().getFullYear() + 4, 1, 1).getTime()} disabled={readOnly} required={this.state.isKetThucHd} /></div>
                        <div className='form-group col-xl-3 col-md-6' id='kyTiepTheo'><DateInput ref={this.ngayKyHopDongTiepTheo} min={new Date(1900, 1, 1).getTime()} max={new Date(new Date().getFullYear() + 1, 1, 1).getTime()} disabled={readOnly} label='Ngày ký hợp đồng tiếp theo' /></div>
                        <div className='form-group col-xl-12 col-md-12'><Select adapter={SelectAdapter_DmDonViFaculty} ref={this.diaDiemLamViec} disabled={readOnly} label='Địa điểm làm việc' /></div>
                        <div className='form-group col-xl-4 col-md-4'><Select adapter={SelectAdapter_DmChucDanhChuyenMon} ref={this.chucDanhChuyenMon} disabled={readOnly} label='Chức danh chuyên môn' /></div>
                        <div className='form-group col-xl-4 col-md-4'><TextInput ref={this.congViecDuocGiao} label='Công việc được giao' disabled={readOnly} /></div>
                        <div className='form-group col-xl-4 col-md-4'><TextInput ref={this.chiuSuPhanCong} label='Chịu sự phân công' disabled={readOnly} /></div>
                        <div className='form-group col-xl-6 col-md-4'><Select ref={this.ngach} label='Ngạch' adapter={SelectAdapter_DmNgachCdnn} disabled={readOnly} onChange={this.changeNgach} required /></div>

                        <div className='form-group col-xl-3 col-md-6'><TextInput ref={this.bac} label='Bậc' disabled={readOnly} /></div>
                        <div className='form-group col-xl-3 col-md-6'><TextInput ref={this.heSo} label='Hệ số' disabled={readOnly} /></div>
                        <div className='form-group col-xl-12 col-md-4'><TextInput ref={this.phanTramHuong} label='Phần trăm hưởng' disabled={readOnly} /></div>
                    </div>
                </div>
                <Link to='/user/tccb/qua-trinh/hop-dong-lao-dong' className='btn btn-secondary btn-circle' style={{ position: 'fixed', bottom: '10px' }}>
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

const mapStateToProps = state => ({ system: state.system, qtHopDongLaoDong: state.tccb.qtHopDongLaoDong });
const mapActionsToProps = {
    createStaff, deleteStaff, updateStaff, getStaffAll, getDmLoaiHopDong,
    getQtHopDongLaoDongPage, getQtHopDongLaoDongAll, updateQtHopDongLaoDong, getdmLoaiHopDongAll,
    deleteQtHopDongLaoDong, createQtHopDongLaoDong, getStaff, getDmChucVuAll, downloadWord,
    getDmDonViAll, getDmNgachCdnnAll, getQtHopDongLaoDongEdit, getTruongPhongTccb
};
export default connect(mapStateToProps, mapActionsToProps)(QtHopDongLaoDongEditPage);
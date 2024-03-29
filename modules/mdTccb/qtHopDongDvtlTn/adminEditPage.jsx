import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { getStaffAll, getStaff } from 'modules/mdTccb/tccbCanBo/redux';
import { SelectAdapter_DmGioiTinh } from 'modules/mdDanhMuc/dmGioiTinh/redux';
import { getDmChucVuAll } from 'modules/mdDanhMuc/dmChucVu/redux';
import { getDmLoaiHopDong, getdmLoaiHopDongAll, SelectAdapter_DmLoaiHopDong } from 'modules/mdDanhMuc/dmLoaiHopDong/redux';
import {
    getTchcCanBoHopDongDvtlTnEdit, createTchcCanBoHopDongDvtlTn, getTchcCanBoHopDongDvtlTnAll,
    deleteTchcCanBoHopDongDvtlTn, updateTchcCanBoHopDongDvtlTn, SelectAdapter_HiredStaff
} from 'modules/mdTccb/tccbCanBoHopDongDvtlTn/redux';
import { getDmDonViAll, SelectAdapter_DmDonVi } from 'modules/mdDanhMuc/dmDonVi/redux';
import { getDmNgachCdnnAll } from 'modules/mdDanhMuc/dmNgachCdnn/redux';
import {
    getQtHopDongDvtlTnPage, getQtHopDongDvtlTnAll, updateQtHopDongDvtlTn,
    deleteQtHopDongDvtlTn, createQtHopDongDvtlTn, getQtHopDongDvtlTnEdit, downloadWord
} from './redux';
import TextInput, { NumberInput } from 'view/component/Input';
import { QTForm } from 'view/component/Form';
import { SelectAdapter_DmQuocGia } from 'modules/mdDanhMuc/dmQuocGia/redux';
import { ComponentDiaDiem } from 'modules/mdDanhMuc/dmDiaDiem/componentDiaDiem';
import { SelectAdapter_DmTrinhDo } from 'modules/mdDanhMuc/dmTrinhDo/redux';
import { SelectAdapter_DmChucDanhKhoaHoc } from 'modules/mdDanhMuc/dmChucDanhKhoaHoc/redux';
import { SelectAdapter_DmDanToc } from 'modules/mdDanhMuc/dmDanToc/redux';
import { SelectAdapter_DmTonGiao } from 'modules/mdDanhMuc/dmTonGiao/redux';
import Dropdown from 'view/component/Dropdown';
import moment from 'moment';
import { SelectAdapter_DmChucDanhChuyenMon } from 'modules/mdDanhMuc/dmChucDanhChuyenMon/redux';
import { Select } from 'view/component/Input';
import { DateInput } from 'view/component/Input';
import { FormSelect } from 'view/component/AdminPage';
import { getPreShcc } from '../qtHopDongLaoDong/redux';
import { getDmDonVi } from 'modules/mdDanhMuc/dmDonVi/redux';
import { SelectApdater_DaiDienKy } from 'modules/mdTccb/qtChucVu/redux';
import { getDaiDienKyHopDong } from '../qtHopDongLaoDong/redux';

const EnumLoaiCanBo = Object.freeze({
    1: { text: 'Cán bộ mới' },
    2: { text: 'Cán bộ cũ' }
});

class QtHopDongDvtlTnEditPage extends QTForm {
    constructor(props) {
        super(props);
        this.state = { item: null, canBoCu: false, dienHopDong: 'DVTL', hdkxdtg: false, thoiGianHd: '', shcc: '', };

        //1. Thông tin bên A
        this.shcc = React.createRef();
        this.selectedShcc = React.createRef();
        this.ho = React.createRef();
        this.ten = React.createRef();
        this.email = React.createRef();
        this.quocGia = React.createRef();
        this.danToc = React.createRef();
        this.tonGiao = React.createRef();
        this.ngaySinh = React.createRef();
        this.chucVu = React.createRef();
        this.hocVanTrinhDo = React.createRef();
        this.gioiTinh = React.createRef();
        this.hocVanChuyenNganh = React.createRef();
        this.khoaHocChucDanh = React.createRef();
        this.khoaHocChuyenNganh = React.createRef();
        this.cmnd = React.createRef();
        this.cmndNgayCap = React.createRef();
        this.cmndNoiCap = React.createRef();
        this.dienThoai = React.createRef();
        this.main = React.createRef();
        this.soHopDong = React.createRef();
        this.loaiHopDong = React.createRef();
        this.kieuHopDong = React.createRef();
        this.nguoiKy = React.createRef();
        this.batDauLamViec = React.createRef();
        this.ketThucHopDong = React.createRef();
        this.ngayKyHopDongTiepTheo = React.createRef();
        this.diaDiemLamViec = React.createRef();
        this.chucDanhChuyenMon = React.createRef();
        this.congViecDuocGiao = React.createRef();
        this.chiuSuPhanCong = React.createRef();
        this.donViChiTra = React.createRef();
        // this.ngach = React.createRef();
        this.bac = React.createRef();
        this.heSo = React.createRef();
        this.hieuLucHopDong = React.createRef();
        this.ngayKyHopDong = React.createRef();
        this.typeFilter = React.createRef();

        // this.phanTramHuong = React.createRef();
        this.tienLuong = React.createRef();

        this.chucVuMapper = {};
        this.donViMapper = {};
    }
    componentDidMount() {
        T.ready('/user/tccb');
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
        this.getData();
    }

    getData = () => {
        const route = T.routeMatcher('/user/tccb/qua-trinh/hop-dong-dvtl-tn/:ma'),
            ma = route.parse(window.location.pathname).ma;
        this.urlMa = ma && ma != 'new' ? ma : null;
        if (this.urlMa) {
            this.props.getQtHopDongDvtlTnEdit(ma, data => {
                if (data.error) {
                    T.notify('Lấy thông tin hợp đồng bị lỗi!', 'danger');
                } else {
                    this.setState(
                        {
                            dienHopDong: data.item.kieuHopDong,
                            item: data.item,
                            canBoDuyet: data.item.canBo,
                            canBoDuocThue: data.item.canBoDuocThue,
                        }, () => {
                            this.setVal(data.item);
                        });
                }
            });
        }
        else {
            this.setVal();
        }

    }

    setVal = (data = {}) => {
        const {
            shcc = '',
            // maChucVu='',
            cmnd = '', cmndNgayCap = '', cmndNoiCap = '',
            cuTruMaHuyen = '', cuTruMaTinh = '', cuTruMaXa = '', cuTruSoNha = '',
            thuongTruMaHuyen = '', thuongTruMaTinh = '', thuongTruMaXa = '', thuongTruSoNha = '',
            // nguyenQuanMaTinh = '', 
            noiSinhMaTinh = '',
            danToc = '', quocGia = '',
            dienThoai = '',
            email = '',
            gioiTinh = '', ngaySinh = '',
            hocVanChuyenNganh = '',
            hocVanTrinhDo = '',
            khoaHocChucDanh = '',
            khoaHocChuyenNganh = '',
            tonGiao = '',
        } = data.canBoDuocThue ? data.canBoDuocThue : {};

        const {
            bac = '', batDauLamViec = '', chiuSuPhanCong = '', chucDanhChuyenMon = '',
            congViecDuocGiao = '', diaDiemLamViec = '', donViChiTra = '', heSo = '',
            tienLuong = '', hieuLucHopDong = '', ketThucHopDong = null, kieuHopDong = '', loaiHopDong = '',
            ngayKyHopDong = '', ngayKyHdTiepTheo = '', nguoiKy = '',
            soHopDong = ''
        } = data.qtHopDongDvtlTn ? data.qtHopDongDvtlTn : {};

        if (data.canBo) {
            this.nguoiKy.current.setVal(data.canBo.shcc);
            this.setState({ chucVuNguoiKy: this.chucVuMapper[data.canBo.maChucVu] ? this.chucVuMapper[data.canBo.maChucVu] : '' + ' - ' + this.donViMapper[data.canBo.maDonVi] ? this.donViMapper[data.canBo.maDonVi] : '' });
        }
        // else {
        //     this.nguoiKy.current.setVal('001.0068');
        //     this.setState({ chucVuNguoiKy: this.chucVuMapper['006'] + ' - ' + this.donViMapper['68'] });

        // }

        this.urlMa && this.selectedShcc.current.setVal(shcc);
        this.email.current.setVal(email ? email : '');
        this.gioiTinh.current.setVal(gioiTinh ? gioiTinh : '');
        this.quocGia.current.setVal(quocGia ? quocGia : '');
        this.danToc.current.setVal(danToc ? danToc : '');
        this.tonGiao.current.setVal(tonGiao ? tonGiao : '');
        this.ngaySinh.current.setVal(ngaySinh ? ngaySinh : '');

        !this.urlMa && this.typeFilter.current.setText(EnumLoaiCanBo[1]);

        this.noiSinh.value(noiSinhMaTinh);
        this.cuTru.value(cuTruMaTinh, cuTruMaHuyen, cuTruMaXa, cuTruSoNha);
        this.thuongTru.value(thuongTruMaTinh, thuongTruMaHuyen, thuongTruMaXa, thuongTruSoNha);

        this.hocVanTrinhDo.current.setVal(hocVanTrinhDo ? hocVanTrinhDo : '');
        this.hocVanChuyenNganh.current.setVal(hocVanChuyenNganh ? hocVanChuyenNganh : '');
        this.khoaHocChucDanh.current.setVal(khoaHocChucDanh ? khoaHocChucDanh : '');
        this.khoaHocChuyenNganh.current.setVal(khoaHocChuyenNganh ? khoaHocChuyenNganh : '');
        this.cmnd.current.setVal(cmnd ? cmnd : '');
        this.cmndNgayCap.current.setVal(cmndNgayCap ? cmndNgayCap : '');
        this.cmndNoiCap.current.setVal(cmndNoiCap ? cmndNoiCap : '');
        this.dienThoai.current.setVal(dienThoai ? dienThoai : '');
        this.soHopDong.current.setVal(soHopDong ? soHopDong : '');
        // this.chucVu.current.setVal(chucVu ? chucVu : '');
        this.loaiHopDong.current.setVal(loaiHopDong ? loaiHopDong : '');
        this.kieuHopDong.current.value(kieuHopDong ? kieuHopDong : (this.state.dienHopDong ? this.state.dienHopDong : ''));
        this.nguoiKy.current.setVal(nguoiKy ? nguoiKy : '');
        this.batDauLamViec.current.setVal(batDauLamViec ? batDauLamViec : '');
        this.ketThucHopDong.current.setVal(ketThucHopDong);
        this.ngayKyHopDongTiepTheo.current.setVal(ngayKyHdTiepTheo ? ngayKyHdTiepTheo : '');
        this.diaDiemLamViec.current.setVal(diaDiemLamViec ? diaDiemLamViec : '');
        this.chucDanhChuyenMon.current.setVal(chucDanhChuyenMon ? chucDanhChuyenMon : '');
        this.congViecDuocGiao.current.setVal(congViecDuocGiao ? congViecDuocGiao : '');
        this.chiuSuPhanCong.current.setVal(chiuSuPhanCong ? chiuSuPhanCong : '');
        this.state.dienHopDong == 'DVTL' ? this.donViChiTra.current.setVal(donViChiTra ? donViChiTra : '') : null;
        // this.ngach.current.setVal(ngach ? ngach : '');
        this.state.dienHopDong == 'DVTL' ? this.bac.current.setVal(bac ? bac : '') : null;
        this.state.dienHopDong == 'DVTL' ? this.heSo.current.setVal(heSo ? heSo : '') : null;
        this.hieuLucHopDong.current.setVal(hieuLucHopDong ? hieuLucHopDong : '');
        this.ngayKyHopDong.current.setVal(ngayKyHopDong ? ngayKyHopDong : '');

        // this.phanTramHuong.current.setVal(phanTramHuong ? phanTramHuong : '');
        !(this.state.dienHopDong == 'DVTL') ? this.tienLuong.current.setVal(tienLuong ? tienLuong : '') : null;
    }

    getVal = () => ({
        shcc: this.urlMa ? this.selectedShcc.current.getFormVal() : this.shcc.current.getFormVal(),
        email: this.email.current.getFormVal(),
        quocGia: this.quocGia.current.getFormVal(),
        danToc: this.danToc.current.getFormVal(),
        tonGiao: this.tonGiao.current.getFormVal(),
        ngaySinh: this.ngaySinh.current.getFormVal(),
        // chucVu: this.state.chucVuNguoiKy,
        hocVanTrinhDo: this.hocVanTrinhDo.current.getFormVal(),
        hocVanChuyenNganh: this.hocVanChuyenNganh.current.getFormVal(),
        khoaHocChucDanh: this.khoaHocChucDanh.current.getFormVal(),
        khoaHocChuyenNganh: this.khoaHocChuyenNganh.current.getFormVal(),
        cmnd: this.cmnd.current.getFormVal(),
        cmndNgayCap: this.cmndNgayCap.current.getFormVal(),
        cmndNoiCap: this.cmndNoiCap.current.getFormVal(),
        dienThoai: this.dienThoai.current.getFormVal(),
        hopDongCanBo: this.kieuHopDong.current.getFormVal(),
        hopDongCanBoNgay: this.hieuLucHopDong.current.getFormVal(),

        nguoiDuocThue: this.urlMa ? this.selectedShcc.current.getFormVal() : this.shcc.current.getFormVal(),
        soHopDong: this.soHopDong.current.getFormVal(),
        loaiHopDong: this.loaiHopDong.current.getFormVal(),
        kieuHopDong: this.kieuHopDong.current.getFormVal(),
        nguoiKy: this.nguoiKy.current.getFormVal(),
        batDauLamViec: this.batDauLamViec.current.getFormVal(),
        ketThucHopDong: this.ketThucHopDong.current.getFormVal(),
        ngayKyHopDongTiepTheo: this.ngayKyHopDongTiepTheo.current.getFormVal(),
        diaDiemLamViec: this.diaDiemLamViec.current.getFormVal(),
        chucDanhChuyenMon: this.chucDanhChuyenMon.current.getFormVal(),
        congViecDuocGiao: this.congViecDuocGiao.current.getFormVal(),
        chiuSuPhanCong: this.chiuSuPhanCong.current.getFormVal(),
        donViChiTra: !this.state.item || this.state.dienHopDong == 'DVTL' ? this.donViChiTra.current.getFormVal() : String(null),
        // // ngach: Number(this.ngach.current.getFormVal()),
        bac: !this.state.item || this.state.dienHopDong == 'DVTL' ? this.bac.current.getFormVal() : Number(null),
        heSo: !this.state.item || this.state.dienHopDong == 'DVTL' ? this.heSo.current.getFormVal() : Number(null),
        hieuLucHopDong: this.hieuLucHopDong.current.getFormVal(),
        ngayKyHopDong: this.ngayKyHopDong.current.getFormVal(),
        // phanTramHuong: this.phanTramHuong.current.getFormVal(),
        tienLuong: !this.state.item || !(this.state.dienHopDong == 'DVTL') ? this.tienLuong.current.getFormVal() : Number(null),
    })

    checkContractDate = (shcc, hieuLucHopDong) => {
        if (hieuLucHopDong > this.hiredStaff[shcc]) return true;
        return false;
    }

    autoChucVu = (shccDaiDien) => {
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
        this.cuTru.value(dataThuongTru.maTinhThanhPho, dataThuongTru.maQuanHuyen, dataThuongTru.maPhuongXa, dataThuongTru.soNhaDuong);
    }

    handleChangeDienHopDong = (value) => {
        this.setState({ dienHopDong: value.id });
    }

    changeCanBo = (value) => {
        if (value) {
            this.props.getTchcCanBoHopDongDvtlTnEdit(value, data => {
                let {
                    // maChucVu='',
                    cmnd = '', cmndNgayCap = '', cmndNoiCap = '',
                    cuTruMaHuyen = '', cuTruMaTinh = '', cuTruMaXa = '', cuTruSoNha = '',
                    thuongTruMaHuyen = '', thuongTruMaTinh = '', thuongTruMaXa = '', thuongTruSoNha = '',
                    // nguyenQuanMaTinh = '', 
                    noiSinhMaTinh = '',
                    danToc = '', quocGia = '',
                    dienThoai = '',
                    email = '',
                    gioiTinh = '', ngaySinh = '',
                    hocVanChuyenNganh = '',
                    hocVanTrinhDo = '',
                    khoaHocChucDanh = '',
                    khoaHocChuyenNganh = '',
                    tonGiao = '',
                } = data.item ? data.item : {};
                this.email.current.setVal(email ? email : '');
                this.gioiTinh.current.setVal(gioiTinh ? gioiTinh : '');
                this.quocGia.current.setVal(quocGia ? quocGia : '');
                this.danToc.current.setVal(danToc ? danToc : '');
                this.tonGiao.current.setVal(tonGiao ? tonGiao : '');
                this.ngaySinh.current.setVal(ngaySinh ? ngaySinh : '');

                this.noiSinh.value(noiSinhMaTinh);
                this.cuTru.value(cuTruMaTinh, cuTruMaHuyen, cuTruMaXa, cuTruSoNha);
                this.thuongTru.value(thuongTruMaTinh, thuongTruMaHuyen, thuongTruMaXa, thuongTruSoNha);

                this.hocVanTrinhDo.current.setVal(hocVanTrinhDo ? hocVanTrinhDo : '');
                this.hocVanChuyenNganh.current.setVal(hocVanChuyenNganh ? hocVanChuyenNganh : '');
                this.khoaHocChucDanh.current.setVal(khoaHocChucDanh ? khoaHocChucDanh : '');
                this.khoaHocChuyenNganh.current.setVal(khoaHocChuyenNganh ? khoaHocChuyenNganh : '');
                this.cmnd.current.setVal(cmnd ? cmnd : '');
                this.cmndNgayCap.current.setVal(cmndNgayCap ? cmndNgayCap : '');
                this.cmndNoiCap.current.setVal(cmndNoiCap ? cmndNoiCap : '');
                this.dienThoai.current.setVal(dienThoai ? dienThoai : '');
            });
        }
    }
    save = () => {
        const data = this.getFormVal();
        const dcThuongTru = {
            thuongTruSoNha: this.thuongTru.value().soNhaDuong,
            thuongTruMaTinh: this.thuongTru.value().maTinhThanhPho,
            thuongTruMaHuyen: this.thuongTru.value().maQuanHuyen,
            thuongTruMaXa: this.thuongTru.value().maPhuongXa
        };
        const dcCuTru = {
            cuTruSoNha: this.cuTru.value().soNhaDuong,
            cuTruMaTinh: this.cuTru.value().maTinhThanhPho,
            cuTruMaHuyen: this.cuTru.value().maQuanHuyen,
            cuTruMaXa: this.cuTru.value().maPhuongXa
        };
        const dcNoiSinh = {
            noiSinhMaTinh: this.noiSinh.value().maTinhThanhPho
        };
        this.main.current.classList.add('validated');
        if (data.data) {
            if (this.urlMa) {
                this.props.updateQtHopDongDvtlTn(this.urlMa, Object.assign(data.data, dcThuongTru, dcCuTru, dcNoiSinh), () => {
                    this.props.updateTchcCanBoHopDongDvtlTn(data.data.nguoiDuocThue, Object.assign(data.data, dcThuongTru, dcCuTru, dcNoiSinh), () => {
                        this.main.current.classList.remove('validated');
                        this.props.history.push(`/user/tccb/qua-trinh/hop-dong-dvtl-tn/${this.urlMa}`);
                    });
                });
            } else {
                this.props.createQtHopDongDvtlTn(data.data, hopDong => {
                    if (this.hiredStaff[hopDong.item.nguoiDuocThue] != null) {
                        if (this.checkContractDate(hopDong.item.nguoiDuocThue, hopDong.item.hieuLucHopDong)) {
                            this.props.updateTchcCanBoHopDongDvtlTn(hopDong.item.nguoiDuocThue, Object.assign(data.data, dcThuongTru, dcCuTru, dcNoiSinh));
                        }
                    }
                    else this.props.createTchcCanBoHopDongDvtlTn(data.data);
                    this.props.history.push(`/user/tchc/hop-dong-dvtl-tn/${hopDong.item.ma}`);
                });
            }
        }
    }

    downloadWord = e => {
        e.preventDefault();
        let shcc = '';
        shcc = this.selectedShcc.current.getVal();
        downloadWord(this.urlMa, data => {
            T.FileSaver(new Blob([new Uint8Array(data.data)]), shcc + '_HĐ.docx');
        });
    }

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
        if (this.ngayKyHopDong.current.getVal() && !this.state.hdkxdtg && this.state.thoiGianHd) {
            const newDate = moment(this.ngayKyHopDong.current.getVal()).add(parseInt(this.state.thoiGianHd), 'M');
            this.ketThucHopDong.current.setVal(newDate.valueOf() - 24 * 3600000);
        }
    }

    genNewShcc = (maDonVi) => {
        if (maDonVi == '') {
            return;
        }
        this.props.getDmDonVi(maDonVi, (item) => {
            let preShcc = item.preShcc;
            this.props.getPreShcc(maDonVi, (data) => {
                preShcc = preShcc + '.' + data.preShcc.toString().padStart(4, '0');
                if (this.shcc.current) this.shcc.current.setVal(preShcc);
            });
        });
    };

    render() {
        const currentPermission = this.props.system && this.props.system.user && this.props.system.user.permissions ? this.props.system.user.permissions : [];
        let readOnly = !currentPermission.includes('qtHopDongDvtlTn:write');
        return (
            <main ref={this.main} className='app-content'>
                <div className='app-title'>
                    {this.state.item && this.state.item.canBoDuocThue ? (<>
                        <h1><i className='fa fa-pencil' />Hợp đồng cán bộ {`: ${this.state.item.canBoDuocThue.ho}  ${this.state.item.canBoDuocThue.ten}`}</h1>
                        <p>Số hợp đồng: {this.state.item.qtHopDongDvtlTn.soHopDong}</p>
                    </>) : <>
                        <h1><i className='fa fa-pencil' />Tạo mới hợp đồng</h1>
                    </>}
                </div>
                <div className='tile'>
                    <h3 className='tile-title'>Thông tin hợp đồng phía trường</h3>
                    <div className='tile-body row'>
                        <div className='form-group col-xl-6 col-md-6'><TextInput ref={this.soHopDong} label='Số hợp đồng' readOnly={readOnly} required /> </div>
                        <FormSelect className='form-group col-xl-6 col-md-6' data={[{ id: 'DVTL', text: 'Đơn vị trả lương' }, { id: 'TN', text: 'Trách nhiệm' }]} required label='Diện hợp đồng' ref={this.kieuHopDong} onChange={this.handleChangeDienHopDong}/>
                        <div className='form-group col-xl-6 col-md-6'><Select adapter={SelectApdater_DaiDienKy} ref={this.nguoiKy} onChange={this.autoChucVu} label='Người đại diện ký' readOnly={readOnly} required /></div>
                        <div className='form-group col-md-6'>Chức vụ: <><br /><b>{this.state.chucVuNguoiKy}</b></></div>
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
                                    <Select adapter={SelectAdapter_HiredStaff} label='Chọn cán bộ' ref={this.selectedShcc} onChange={value => this.changeCanBo(value)} required disabled={this.urlMa ? true : readOnly} />
                                </div>
                                <div className='form-group col-xl-4 col-md-6'><DateInput ref={this.ngaySinh} label='Ngày sinh' disabled={readOnly} min={new Date(1900, 1, 1).getTime()} max={Date.nextYear(-10).roundDate().getTime()} required /></div>
                            </> : <>
                                <div className='form-group col-xl-3 col-md-4'><TextInput style={{ textTransform: 'uppercase' }} ref={this.shcc} maxLength={10} label='Mã số cán bộ' required /> </div>
                                <div className='form-group col-xl-3 col-md-6'><TextInput style={{ textTransform: 'uppercase' }} ref={this.ho} maxLength={100} label='Họ và tên lót' required /> </div>
                                <div className='form-group col-xl-3 col-md-4'><TextInput ref={this.ten} label='Tên' maxLength={20} required /> </div>
                                <div className='form-group col-xl-3 col-md-4'><DateInput ref={this.ngaySinh} label='Ngày sinh' min={new Date(1900, 1, 1).getTime()} max={Date.nextYear(-10).roundDate().getTime()} required /> </div>

                            </>
                        }
                        <div className='form-group col-xl-4 col-md-4'><TextInput ref={this.cmnd} label='CMND/CCCD' placeholder='Nhập số CMND/CCCD' /> </div>
                        <div className='form-group col-xl-4 col-md-4'><DateInput ref={this.cmndNgayCap} label='Ngày cấp CMND/CCCD' /> </div>
                        <div className='form-group col-xl-4 col-md-4'><TextInput ref={this.cmndNoiCap} label='Nơi cấp CMND/CCCD' /> </div>
                        <div className='form-group col-xl-2 col-md-4'><Select adapter={SelectAdapter_DmGioiTinh} ref={this.gioiTinh} label='Giới tính' /> </div>
                        <div className='form-group col-xl-5 col-md-4'><TextInput ref={this.email} label='Email' /> </div>

                        <div className='form-group col-xl-5 col-md-4'><TextInput ref={this.dienThoai} label='Điện thoại' maxLength={10} /> </div>
                        <div className='form-group col-xl-4 col-md-4'><Select adapter={SelectAdapter_DmQuocGia} ref={this.quocGia} label='Quốc tịch' /> </div>
                        <div className='form-group col-xl-4 col-md-4'><Select adapter={SelectAdapter_DmDanToc} ref={this.danToc} label='Dân tộc' /> </div>
                        <div className='form-group col-xl-4 col-md-4'><Select adapter={SelectAdapter_DmTonGiao} ref={this.tonGiao} label='Tôn giáo' /> </div>

                        <ComponentDiaDiem ref={e => this.noiSinh = e} label='Nơi sinh' className='col-xl-6 col-md-6' onlyTinhThanh={true} />
                        <ComponentDiaDiem ref={e => this.thuongTru = e} label='Địa chỉ thường trú' className='col-md-12' requiredSoNhaDuong={true} />
                        <p className='col-md-12'>
                            Nếu <b>Địa chỉ thường trú</b> là <b>Địa chỉ hiện tại</b> thì&nbsp;<a href='#' onClick={this.copyAddress}>nhấp vào đây</a>.
                        </p>
                        <ComponentDiaDiem ref={e => this.cuTru = e} label='Địa chỉ hiện tại' className='col-md-12' requiredSoNhaDuong={true} />
                        <div className='form-group col-xl-6 col-md-4'><Select adapter={SelectAdapter_DmTrinhDo} ref={this.hocVanTrinhDo} label='Trình độ học vấn' /> </div>
                        <div className='form-group col-xl-6 col-md-4'><TextInput ref={this.hocVanChuyenNganh} label='Ngành' /> </div>
                        <div className='form-group col-xl-6 col-md-4'><Select adapter={SelectAdapter_DmChucDanhKhoaHoc} ref={this.khoaHocChucDanh} label='Chức danh khoa học' /> </div>
                        <div className='form-group col-xl-6 col-md-4'><TextInput ref={this.khoaHocChuyenNganh} label='Ngành' /> </div>
                    </div>
                </div>
                <div className='tile'>
                    <h3 className='tile-title'>Thời hạn và công việc hợp đồng</h3>
                    <div className='tile-body row'>
                        <div className='form-group col-xl-6 col-md-6'><Select adapter={SelectAdapter_DmLoaiHopDong} ref={this.loaiHopDong} label='Loại hợp đồng' onChange={this.handleLoaiHd} required /></div>
                        <div className='form-group col-xl-6 col-md-6'><DateInput ref={this.ngayKyHopDong} label='Ngày ký hợp đồng' onChange={this.handleTuNgay} required /></div>
                        <div className='form-group col-xl-3 col-md-6'><DateInput ref={this.hieuLucHopDong} label='Hiệu lực hợp đồng' required /></div>
                        <div className='form-group col-xl-3 col-md-6'><DateInput ref={this.batDauLamViec} label='Ngày bắt đầu làm việc' required /></div>
                        <div className='form-group col-xl-3 col-md-6' id='ketThucHd'><DateInput ref={this.ketThucHopDong} label='Ngày kết thúc hợp đồng' required /></div>
                        <div className='form-group col-xl-3 col-md-6' id='kyTiepTheo'><DateInput ref={this.ngayKyHopDongTiepTheo} label='Ngày ký hợp đồng tiếp theo' /></div>
                        <div className='form-group col-xl-12 col-md-12'><Select adapter={SelectAdapter_DmDonVi} ref={this.diaDiemLamViec} label='Địa điểm làm việc' onChange={value => this.genNewShcc(value)}/></div>
                        <div className='form-group col-xl-4 col-md-4'><Select adapter={SelectAdapter_DmChucDanhChuyenMon} ref={this.chucDanhChuyenMon} label='Chức danh chuyên môn' /></div>
                        <div className='form-group col-xl-4 col-md-4'><TextInput ref={this.congViecDuocGiao} label='Công việc được giao' /></div>
                        <div className='form-group col-xl-4 col-md-4'><TextInput ref={this.chiuSuPhanCong} label='Chịu sự phân công' /></div>
                        {this.state.dienHopDong == 'DVTL' ? <div className='form-group col-xl-6 col-md-6'><Select adapter={SelectAdapter_DmDonVi} ref={this.donViChiTra} label='Đơn vị chi trả' /></div> : null}
                        {this.state.dienHopDong == 'DVTL' ? <div className='form-group col-xl-6 col-md-6'></div> : null}
                        {this.state.dienHopDong == 'DVTL' ? <div className='form-group col-xl-4 col-md-6'><TextInput ref={this.bac} label='Bậc' /></div> : null}
                        {this.state.dienHopDong == 'DVTL' ? <div className='form-group col-xl-4 col-md-6'><TextInput ref={this.heSo} label='Hệ số' /></div> : null}
                        {!(this.state.dienHopDong == 'DVTL') ? <div className='form-group col-xl-4 col-md-6'><NumberInput ref={this.tienLuong} label='Tiền lương' maxLength={10} /></div> : null}
                    </div>
                </div>
                <Link to='/user/tccb/qua-trinh/hop-dong-dvtl-tn' className='btn btn-secondary btn-circle' style={{ position: 'fixed', bottom: '10px' }}>
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

const mapStateToProps = state => ({ system: state.system, qtHopDongDvtlTn: state.tccb.qtHopDongDvtlTn });
const mapActionsToProps = {
    createTchcCanBoHopDongDvtlTn, deleteTchcCanBoHopDongDvtlTn, updateTchcCanBoHopDongDvtlTn, getTchcCanBoHopDongDvtlTnAll,
    getQtHopDongDvtlTnPage, getQtHopDongDvtlTnAll, updateQtHopDongDvtlTn, getdmLoaiHopDongAll,
    deleteQtHopDongDvtlTn, createQtHopDongDvtlTn, getStaffAll, getStaff, getTchcCanBoHopDongDvtlTnEdit,
    getDmDonViAll, getDmNgachCdnnAll, getQtHopDongDvtlTnEdit, downloadWord, getDmChucVuAll, getDmLoaiHopDong,
    getDmDonVi, getPreShcc, getDaiDienKyHopDong
};
export default connect(mapStateToProps, mapActionsToProps)(QtHopDongDvtlTnEditPage);
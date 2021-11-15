import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { getdmLoaiHopDongAll, SelectAdapter_DmLoaiHopDong } from 'modules/mdDanhMuc/dmLoaiHopDong/redux';
import {
    getStaffEdit, createStaff, getStaffAll,
    deleteStaff, updateStaff, SelectAdapter_FwCanBo
} from 'modules/mdTccb/tccbCanBo/redux';
import { getDmDonViAll, SelectAdapter_DmDonViFaculty } from 'modules/mdDanhMuc/dmDonVi/redux';
import { getDmNgachCdnnAll } from 'modules/mdDanhMuc/dmNgachCdnn/redux';
import {
    getTchcHopDongLaoDongPage, getTchcHopDongLaoDongAll, updateTchcHopDongLaoDong,
    deleteTchcHopDongLaoDong, createTchcHopDongLaoDong, getTchcHopDongLaoDongEdit, downloadWord
} from './redux';
import TextInput, { DateInput, Select } from 'view/component/Input';
import { QTForm } from 'view/component/Form';
import { SelectAdapter_DmChucVu } from 'modules/mdDanhMuc/dmChucVu/redux';
import { SelectAdapter_DmQuocGia } from 'modules/mdDanhMuc/dmQuocGia/redux';
import { ComponentDiaDiem } from 'modules/mdDanhMuc/dmDiaDiem/componentDiaDiem';
import { SelectAdapter_DmTrinhDo } from 'modules/mdDanhMuc/dmTrinhDo/redux';
import { SelectAdapter_DmDanToc } from 'modules/mdDanhMuc/dmDanToc/redux';
import { SelectAdapter_DmTonGiao } from 'modules/mdDanhMuc/dmTonGiao/redux';


class TchcHopDongLaoDongEditPage extends QTForm {
    constructor (props) {
        super(props);
        this.state = { item: null, kieu: '' };
        this.ho = React.createRef();
        this.ten = React.createRef();
        this.shcc = React.createRef();
        this.email = React.createRef();
        this.quocGia = React.createRef();
        this.danToc = React.createRef();
        this.tonGiao = React.createRef();
        this.ngaySinh = React.createRef();
        this.chucVu = React.createRef();
        this.hocVanTrinhDo = React.createRef();
        this.hocVanChuyenNganh = React.createRef();
        this.cmnd = React.createRef();
        this.cmndNgayCap = React.createRef();
        this.cmndNoiCap = React.createRef();
        this.dienThoaiCaNhan = React.createRef();
        this.main = React.createRef();
        this.soHopDong = React.createRef();
        this.loaiHopDong2 = React.createRef();
        this.nguoiKy = React.createRef();
        this.batDauLamViec = React.createRef();
        this.ketThucHopDong = React.createRef();
        this.ngayKyHopDongTiepTheo = React.createRef();
        this.diaDiemLamViec = React.createRef();
        this.chucDanhChuyenMon = React.createRef();
        this.congViecDuocGiao = React.createRef();
        this.chiuSuPhanCong = React.createRef();
        // this.ngach = React.createRef();
        this.bac = React.createRef();
        this.heSo = React.createRef();
        this.ngayKyHopDong = React.createRef();
        // this.phanTramHuong = React.createRef();

        this.hiredStaff = {};
    }
    componentDidMount() {
        T.ready('/user/hopDongLaoDong');
        this.props.getStaffAll(items => {
            if (items) {
                this.hiredStaff = {};
                items.forEach(item => {
                    this.hiredStaff[item.shcc] = item.hopDongCanBoNgay;
                });
            }
        });
        this.getData();
    }

    getData = () => {
        const route = T.routeMatcher('/user/hopDongLaoDong/:ma'),
            ma = route.parse(window.location.pathname).ma;
        this.urlMa = ma && ma != 'new' ? ma : null;
        if (this.urlMa) {
            this.setState({ create: false });
            this.props.getTchcHopDongLaoDongEdit(ma, data => {
                if (data.error) {
                    T.notify('Lấy thông tin hợp đồng bị lỗi!', 'danger');
                } else {
                    this.setState(
                        {
                            item: data.item,
                            nguoiDuocThue: data.item.nguoiDuocThue,
                            nguoiKy: data.item.nguoiKy,
                        }, () => {
                            this.props.getStaffEdit(data.item.nguoiDuocThue, curStaff => {
                                if (curStaff.error) {
                                    T.notify('Lấy thông tin cán bộ bị lỗi!', 'danger');
                                } else {
                                    this.setVal(Object.assign(data.item, curStaff.item));
                                }
                            });
                        });
                }
            });
        }
        else {
            this.setState({ create: true });
            this.setVal();
        }

    }

    setVal = (data = {}) => {
        console.log(data);
        const {
            ho = '',
            ten = '',
            shcc = '',
            quocGia = '',
            danToc = '',
            tonGiao = '',
            ngaySinh = '',
            email = '',
            maTinhNoiSinh = '',
            hienTaiMaTinh = '',
            hienTaiMaHuyen = '',
            hienTaiMaXa = '',
            hienTaiSoNha = '',
            thuongTruMaTinh = '',
            thuongTruMaHuyen = '',
            thuongTruMaXa = '',
            thuongTruSoNha = '',
            hocVanTrinhDo = '',
            hocVanChuyenNganh = '',
            cmnd = '',
            cmndNgayCap = '',
            cmndNoiCap = '',
            dienThoaiCaNhan = '',
            chucVu = '',
            soHopDong = '', loaiHopDong2 = '', nguoiKy
            = '', batDauLamViec = '', ketThucHopDong = '', ngayKyHopDongTiepTheo = '', diaDiemLamViec = '', chucDanhChuyenMon = '',
            congViecDuocGiao = '', chiuSuPhanCong = '', /*ngach = '',*/ bac = '', heSo = '', ngayKyHopDong = '',
            /*phanTramHuong = '',*/
        } = data.constructor === ({}).constructor ? data : {};
        this.ho.current.setVal(ho ? ho : '');
        this.ten.current.setVal(ten ? ten : '');
        this.shcc.current.setVal(shcc ? shcc : '');
        this.quocGia.current.setVal(quocGia ? quocGia : '');
        this.danToc.current.setVal(danToc ? danToc : '');
        this.tonGiao.current.setVal(tonGiao ? tonGiao : '');
        this.ngaySinh.current.setVal(ngaySinh ? ngaySinh : '');
        console.log(maTinhNoiSinh);
        this.noiSinh.value(maTinhNoiSinh);
        this.email.value(email ? email : '');
        this.cuTru.value(hienTaiMaTinh, hienTaiMaHuyen, hienTaiMaXa, hienTaiSoNha);
        this.thuongTru.value(thuongTruMaTinh, thuongTruMaHuyen, thuongTruMaXa, thuongTruSoNha);

        this.hocVanTrinhDo.current.setVal(hocVanTrinhDo ? hocVanTrinhDo : '');
        this.hocVanChuyenNganh.current.setVal(hocVanChuyenNganh ? hocVanChuyenNganh : '');
        this.cmnd.current.setVal(cmnd ? cmnd : '');
        this.cmndNgayCap.current.setVal(cmndNgayCap ? cmndNgayCap : '');
        this.cmndNoiCap.current.setVal(cmndNoiCap ? cmndNoiCap : '');
        this.dienThoaiCaNhan.current.setVal(dienThoaiCaNhan ? dienThoaiCaNhan : '');
        this.soHopDong.current.setVal(soHopDong ? soHopDong : '');
        this.chucVu.current.setVal(chucVu ? chucVu : '');
        this.loaiHopDong2.current.setVal(loaiHopDong2 ? loaiHopDong2 : '');
        this.nguoiKy.current.setVal(nguoiKy ? nguoiKy : '');
        this.batDauLamViec.current.setVal(batDauLamViec ? batDauLamViec : '');
        this.ketThucHopDong.current.setVal(ketThucHopDong ? ketThucHopDong : '');
        this.ngayKyHopDongTiepTheo.current.setVal(ngayKyHopDongTiepTheo ? ngayKyHopDongTiepTheo : '');
        this.diaDiemLamViec.current.setVal(diaDiemLamViec ? diaDiemLamViec : '');
        this.chucDanhChuyenMon.current.setVal(chucDanhChuyenMon ? chucDanhChuyenMon : '');
        this.congViecDuocGiao.current.setVal(congViecDuocGiao ? congViecDuocGiao : '');
        this.chiuSuPhanCong.current.setVal(chiuSuPhanCong ? chiuSuPhanCong : '');
        // this.ngach.current.setVal(ngach ? ngach : '');
        this.bac.current.setVal(bac ? bac : '');
        this.heSo.current.setVal(heSo ? heSo : '');
        this.ngayKyHopDong.current.setVal(ngayKyHopDong ? ngayKyHopDong : '');

        // this.phanTramHuong.current.setVal(phanTramHuong ? phanTramHuong : '');
    }

    getVal = () => ({
        ho: this.ho.current.getFormVal(),
        ten: this.ten.current.getFormVal(),
        shcc: this.shcc.current.getFormVal(),
        quocGia: this.quocGia.current.getFormVal(),
        danToc: this.danToc.current.getFormVal(),
        tonGiao: this.tonGiao.current.getFormVal(),
        ngaySinh: this.ngaySinh.current.getFormVal(),
        chucVu: this.chucVu.current.getFormVal(),
        hocVanTrinhDo: this.hocVanTrinhDo.current.getFormVal(),
        hocVanChuyenNganh: this.hocVanChuyenNganh.current.getFormVal(),
        cmnd: this.cmnd.current.getFormVal(),
        cmndNgayCap: this.cmndNgayCap.current.getFormVal(),
        cmndNoiCap: this.cmndNoiCap.current.getFormVal(),
        dienThoaiCaNhan: this.dienThoaiCaNhan.current.getFormVal(),
        hopDongCanBo: 'LĐ',
        email: this.email.current.getFormVal(),
        hopDongCanBoNgay: this.batDauLamViec.current.getFormVal(),
        nguoiDuocThue: this.shcc.current.getFormVal(),
        soHopDong: this.soHopDong.current.getFormVal(),
        loaiHopDong2: this.loaiHopDong2.current.getFormVal(),
        nguoiKy: this.nguoiKy.current.getFormVal(),
        batDauLamViec: this.batDauLamViec.current.getFormVal(),
        ketThucHopDong: this.ketThucHopDong.current.getFormVal(),
        ngayKyHopDongTiepTheo: this.ngayKyHopDongTiepTheo.current.getFormVal(),
        diaDiemLamViec: this.diaDiemLamViec.current.getFormVal(),
        chucDanhChuyenMon: this.chucDanhChuyenMon.current.getFormVal(),
        congViecDuocGiao: this.congViecDuocGiao.current.getFormVal(),
        chiuSuPhanCong: this.chiuSuPhanCong.current.getFormVal(),
        // // ngach: Number(this.ngach.current.getFormVal()),
        bac: this.bac.current.getFormVal(),
        heSo: this.heSo.current.getFormVal(),
        ngayKyHopDong: this.ngayKyHopDong.current.getFormVal(),
        // phanTramHuong: this.phanTramHuong.current.getFormVal(),
    })

    checkSignedDate = (shcc, batDauLamViec) => {
        if (batDauLamViec > this.hiredStaff[shcc]) return true;
        return false;
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
            hienTaiMaTinh: this.cuTru.value().soNhaDuong,
            hienTaiSoNha: this.cuTru.value().maTinhThanhPho,
            hienTaiMaHuyen: this.cuTru.value().maQuanHuyen,
            hienTaiMaXa: this.cuTru.value().maPhuongXa
        };
        const dcNoiSinh = {
            maTinhNoiSinh: this.noiSinh.value().maTinhThanhPho
        };
        this.main.current.classList.add('validated');
        if (data.data) {
            if (this.urlMa) {
                this.props.updateTchcHopDongLaoDong(this.urlMa, Object.assign(data.data, dcThuongTru, dcCuTru, dcNoiSinh), () => {
                    this.props.updateStaff(data.data.nguoiDuocThue, Object.assign(data.data, dcThuongTru, dcCuTru, dcNoiSinh), () => {
                        this.main.current.classList.remove('validated');
                        this.props.history.push(`/user/hopDongLaoDong/${this.urlMa}`);
                    });
                });
            } else {
                this.props.createTchcHopDongLaoDong(data.data, hopDong => {
                    if (this.hiredStaff[hopDong.item.nguoiDuocThue] != null) {
                        if (this.checkSignedDate(hopDong.item.nguoiDuocThue, hopDong.item.batDauLamViec)) {
                            this.props.updateStaff(hopDong.item.nguoiDuocThue, Object.assign(data.data, dcThuongTru, dcCuTru, dcNoiSinh));
                        }
                    }
                    else this.props.createStaff(data.data);
                    this.props.history.push(`/user/hopDongLaoDong/${hopDong.item.ma}`);
                });
            }
        }
    }

    downloadWord = e => {
        e.preventDefault();
        this.props.downloadWord(this.urlMa, data => {
            T.FileSaver(new Blob([new Uint8Array(data.data)]), this.urlMa + '_2c.docx');
        });
    }

    render() {
        // const currentPermission = this.props.system && this.props.system.user && this.props.system.user.permissions ? this.props.system.user.permissions : [];
        //     permission = this.getUserPermission('hopDongLaoDong');
        // let currentContract = this.props.tchcHopDongLaoDong && this.props.tchcHopDongLaoDong.selectedItem ? this.props.tchcHopDongLaoDong.selectedItem : [];
        // let readOnly = !currentPermission.includes('hopDongLaoDong:write');
        let readOnly = this.state.item ? true : false;
        return (
            <main ref={this.main} className='app-content'>
                <div className='app-title'>
                    <h1><i className='fa fa-list' /> Hợp đồng{this.state.item ? `: ${this.state.item.soHopDong}` : ''}</h1>
                </div>
                <div className='tile'>
                    <h3 className='tile-title'>Thông tin hợp đồng bên trường</h3>
                    <div className='tile-body row'>
                        <div className='form-group col-xl-12 col-md-12'><TextInput ref={this.soHopDong} label='Số hợp đồng' readOnly={readOnly} required /> </div>
                        <div className='form-group col-xl-6 col-md-6'><Select adapter={SelectAdapter_FwCanBo} ref={this.nguoiKy} label='Người đại diện ký' readOnly={readOnly} required /></div>
                        <div className='form-group col-xl-6 col-md-6'><Select adapter={SelectAdapter_DmChucVu} ref={this.chucVu} label='Chức vụ' readOnly={readOnly} required /></div>
                    </div>
                </div>
                <div className='tile'>
                    <h3 className='tile-title'>Thông tin cá nhân bên người ký</h3>
                    <div className='tile-body row'>
                        <div className='form-group col-xl-3 col-md-4'><TextInput ref={this.shcc} label='Số hiệu công chức' required /> </div>
                        <div className='form-group col-xl-3 col-md-4'><TextInput ref={this.ho} label='Họ' /> </div>
                        <div className='form-group col-xl-3 col-md-4'><TextInput ref={this.ten} label='Tên' /> </div>
                        <div className='form-group col-xl-3 col-md-4'><TextInput ref={this.email} label='Email cá nhân' /> </div>
                        <div className='form-group col-xl-4 col-md-4'><TextInput ref={this.cmnd} label='CMND/CCCD' /> </div>
                        <div className='form-group col-xl-4 col-md-4'><DateInput ref={this.cmndNgayCap} label='Ngày cấp' /> </div>
                        <div className='form-group col-xl-4 col-md-4'><TextInput ref={this.cmndNoiCap} label='Nơi cấp' /> </div>
                        <div className='form-group col-xl-3 col-md-4'><TextInput ref={this.dienThoaiCaNhan} label='Điện thoại' /> </div>
                        <div className='form-group col-xl-3 col-md-4'><Select adapter={SelectAdapter_DmQuocGia} ref={this.quocGia} label='Quốc tịch' /> </div>
                        <div className='form-group col-xl-3 col-md-4'><Select adapter={SelectAdapter_DmDanToc} ref={this.danToc} label='Dân tộc' /> </div>
                        <div className='form-group col-xl-3 col-md-4'><Select adapter={SelectAdapter_DmTonGiao} ref={this.tonGiao} label='Tôn giáo' /> </div>

                        <div className='form-group col-xl-6 col-md-6'><DateInput ref={this.ngaySinh} label='Ngày sinh' /> </div>
                        <ComponentDiaDiem ref={e => this.noiSinh = e} label='Nơi sinh' className='col-xl-6 col-md-6' onlyTinhThanh={true} />
                        <ComponentDiaDiem ref={e => this.thuongTru = e} label='Địa chỉ thường trú' className='col-md-12' requiredSoNhaDuong={true} />
                        <p className='col-md-12'>
                            Nếu <b>Địa chỉ thường trú</b> là <b>Địa chỉ hiện tại</b> thì&nbsp;<a href='#' onClick={this.copyAddress}>nhấp vào đây</a>.
                        </p>
                        <ComponentDiaDiem ref={e => this.cuTru = e} label='Địa chỉ hiện tại' className='col-md-12' requiredSoNhaDuong={true} />
                        <div className='form-group col-xl-6 col-md-4'><Select adapter={SelectAdapter_DmTrinhDo} ref={this.hocVanTrinhDo} label='Trình độ học vấn' /> </div>
                        <div className='form-group col-xl-6 col-md-4'><TextInput ref={this.hocVanChuyenNganh} label='Ngành' /> </div>
                    </div>
                </div>
                <div className='tile'>
                    <h3 className='tile-title'>Thời hạn và công việc hợp đồng</h3>
                    <div className='tile-body row'>
                        <div className='form-group col-xl-6 col-md-6'><Select adapter={SelectAdapter_DmLoaiHopDong} ref={this.loaiHopDong2} label='Loại hợp đồng' required /></div>
                        <div className='form-group col-xl-6 col-md-6'><DateInput ref={this.ngayKyHopDong} label='Ngày ký hợp đồng' required /></div>
                        <div className='form-group col-xl-3 col-md-6'><DateInput ref={this.batDauLamViec} label='Ngày bắt đầu làm việc' required /></div>
                        <div className='form-group col-xl-3 col-md-6'><DateInput ref={this.ketThucHopDong} label='Ngày kết thúc hợp đồng' required /></div>
                        <div className='form-group col-xl-3 col-md-6'><DateInput ref={this.ngayKyHopDongTiepTheo} label='Ngày ký hợp đồng tiếp theo' /></div>
                        <div className='form-group col-xl-12 col-md-12'><Select adapter={SelectAdapter_DmDonViFaculty} ref={this.diaDiemLamViec} label='Địa điểm làm việc' /></div>
                        <div className='form-group col-xl-4 col-md-4'><Select adapter={SelectAdapter_DmChucVu} ref={this.chucDanhChuyenMon} label='Chức danh chuyên môn' /></div>
                        <div className='form-group col-xl-4 col-md-4'><TextInput ref={this.congViecDuocGiao} label='Công việc được giao' /></div>
                        <div className='form-group col-xl-4 col-md-4'><TextInput ref={this.chiuSuPhanCong} label='Chịu sự phân công' /></div>
                        <div className='form-group col-xl-3 col-md-6'><TextInput ref={this.bac} label='Bậc' /></div>
                        <div className='form-group col-xl-3 col-md-6'><TextInput ref={this.heSo} label='Hệ số' /></div>
                    </div>
                </div>
                <Link to='/user/hopDongLaoDong' className='btn btn-secondary btn-circle' style={{ position: 'fixed', bottom: '10px' }}>
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

const mapStateToProps = state => ({ system: state.system, tchcHopDongLaoDong: state.tchcHopDongLaoDong });
const mapActionsToProps = {
    createStaff, deleteStaff, updateStaff, getStaffAll,
    getTchcHopDongLaoDongPage, getTchcHopDongLaoDongAll, updateTchcHopDongLaoDong, getdmLoaiHopDongAll,
    deleteTchcHopDongLaoDong, createTchcHopDongLaoDong, getStaffEdit,
    getDmDonViAll, getDmNgachCdnnAll, getTchcHopDongLaoDongEdit, downloadWord
};
export default connect(mapStateToProps, mapActionsToProps)(TchcHopDongLaoDongEditPage);
import React from 'react';
import { connect } from 'react-redux';
import { updateProfile } from '../_init/reduxSystem';
import Dropdown from 'view/component/Dropdown';
import ImageBox from 'view/component/ImageBox';
import { userGetStaff, updateStaffUser, createQuanHeStaffUser, updateQuanHeStaffUser, deleteQuanHeStaffUser } from 'modules/mdTccb/tccbCanBo/redux';
// import { Link } from 'react-router-dom';
// import { SelectAdapter_DmDonVi } from 'modules/mdDanhMuc/dmDonVi/redux';
// import { SelectAdapter_DmChucVu } from 'modules/mdDanhMuc/dmChucVu/redux';
import { SelectAdapter_DmGioiTinh } from 'modules/mdDanhMuc/dmGioiTinh/redux';
import { SelectAdapter_DmTrinhDoLyLuanChinhTri } from 'modules/mdDanhMuc/dmTrinhDoLyLuanChinhTri/redux';
import { SelectAdapter_DmTrinhDoQuanLyNhaNuoc } from 'modules/mdDanhMuc/dmTrinhDoQuanLyNhaNuoc/redux';
import { SelectAdapter_DmNgoaiNgu, getDmNgoaiNguAll } from 'modules/mdDanhMuc/dmNgoaiNgu/redux';
import { createTrinhDoNNStaffUser, updateTrinhDoNNStaffUser, deleteTrinhDoNNStaffUser } from 'modules/_default/trinhDoNgoaiNgu/redux';
import { SelectAdapter_DmTrinhDoTinHoc } from 'modules/mdDanhMuc/dmTrinhDoTinHoc/redux';
import { SelectAdapter_DmDanToc } from 'modules/mdDanhMuc/dmDanToc/redux';
import { SelectAdapter_DmTonGiao } from 'modules/mdDanhMuc/dmTonGiao/redux';
// import { SelectAdapter_DmTinhThanhPho } from 'modules/mdDanhMuc/dmDiaDiem/reduxTinhThanhPho';
// import { SelectAdapter_DmQuanHuyen } from 'modules/mdDanhMuc/dmDiaDiem/reduxQuanHuyen';
// import { SelectAdapter_DmPhuongXa } from 'modules/mdDanhMuc/dmDiaDiem/reduxPhuongXa';
import { SelectAdapter_DmQuanHeGiaDinh, getDmQuanHeGiaDinhAll } from 'modules/mdDanhMuc/dmQuanHeGiaDinh/redux';
import { getDmDonViAll } from 'modules/mdDanhMuc/dmDonVi/redux';
import { getDmChucVuAll } from 'modules/mdDanhMuc/dmChucVu/redux';
import { SelectAdapter_DmNhomMau } from 'modules/mdDanhMuc/dmBenhVien/reduxNhomMau';
import { SelectAdapter_DmQuocGia } from 'modules/mdDanhMuc/dmQuocGia/redux';
import { SelectAdapter_DmChucDanhKhoaHoc } from 'modules/mdDanhMuc/dmChucDanhKhoaHoc/redux';
import { SelectAdapter_DmTrinhDo } from 'modules/mdDanhMuc/dmTrinhDo/redux';
import TextInput, { DateInput, NumberInput, Select, BooleanInput } from 'view/component/Input';
import { QTForm } from 'view/component/Form';

const sexMapper = { '01': 'Nam', '02': 'Nữ' };

class RelationModal extends React.Component {
    modal = React.createRef();
    hoTen = React.createRef();
    namSinh = React.createRef();
    ngheNghiep = React.createRef();
    noiCongTac = React.createRef();
    moiQuanHe = React.createRef();
    diaChi = React.createRef();

    componentDidMount() {
        $(document).ready(() => setTimeout(() => {
            $(this.modal.current).on('shown.bs.modal', () => $(this.hoTen.current).focus());
        }, 250));
    }

    show = (item, type, shcc) => {
        let { hoTen, moiQuanHe, namSinh, ngheNghiep, noiCongTac, diaChi, id } = item ? item : { hoTen: '', moiQuanHe: '', namSinh: '', ngheNghiep: '', noiCongTac: '', diaChi: '', id: null };
        this.hoTen.current.setVal(hoTen);
        this.moiQuanHe.current.setVal(moiQuanHe);
        this.namSinh.current.setVal(namSinh);
        this.ngheNghiep.current.setVal(ngheNghiep);
        this.noiCongTac.current.setVal(noiCongTac);
        this.diaChi.current.setVal(diaChi);
        $(this.modal.current).data('id', id).data('shcc', shcc).data('type', type).modal('show');
    }

    save = (e) => {
        e.preventDefault();
        const id = $(this.modal.current).data('id'),
            shcc = $(this.modal.current).data('shcc'),
            type = $(this.modal.current).data('type'),
            changes = {
                hoTen: this.hoTen.current.getVal(),
                moiQuanHe: this.moiQuanHe.current.getVal(),
                namSinh: this.namSinh.current.getVal(),
                ngheNghiep: this.ngheNghiep.current.getVal(),
                noiCongTac: this.noiCongTac.current.getVal(),
                diaChi: this.diaChi.current.getVal()
            };
        if (id) {
            this.props.update(id, changes, shcc, error => {
                if (error == undefined || error == null) {
                    $(this.modal.current).modal('hide');
                }
            });
        } else {
            changes.shcc = shcc;
            changes.type = type;
            this.props.create(changes, shcc, () => $(this.modal.current).modal('hide'));
        }
    }

    render() {
        return (
            <div className='modal' tabIndex='-1' role='dialog' ref={this.modal}>
                <form className='modal-dialog modal-lg' role='document' onSubmit={this.save}>
                    <div className='modal-content'>
                        <div className='modal-header'>
                            <div className='container-fluid row'>
                                <h5 className='modal-title'>Thông tin người thân</h5>
                            </div>
                            <button type='button' className='close' data-dismiss='modal' aria-label='Close'>
                                <span aria-hidden='true'>&times;</span>
                            </button>
                        </div>
                        <div className='modal-body row'>
                            <div className='form-group col-md-6'><TextInput ref={this.hoTen} label='Họ và tên' required maxLength={250} /></div>
                            <div className='form-group col-md-6'><Select ref={this.moiQuanHe} adapter={SelectAdapter_DmQuanHeGiaDinh} label='Mối quan hệ' required /></div>

                            <div className='form-group col-md-8'><TextInput ref={this.namSinh} label='Năm sinh' max={Date.nextYear().getTime()} required /></div>
                            <div className='form-group col-md-4'><TextInput ref={this.ngheNghiep} label='Nghề nghiệp' maxLength={100} /></div>
                            <div className='form-group col-md-12'><TextInput ref={this.noiCongTac} label='Nơi công tác' maxLength={100} /></div>
                            <div className='form-group col-md-12'><TextInput ref={this.diaChi} label='Địa chỉ hiện tại' maxLength={200} /></div>
                        </div>
                        <div className='modal-footer'>
                            <button type='button' className='btn btn-secondary' data-dismiss='modal'>Đóng</button>
                            <button type='button' className='btn btn-primary' onClick={this.save}>Lưu</button>
                        </div>
                    </div>
                </form>
            </div>
        );
    }
}

class TrinhDoNNModal extends React.Component {
    modal = React.createRef();
    loaiNgonNgu = React.createRef();
    trinhDo = React.createRef();

    show = (item, shcc) => {
        let { loaiNgonNgu, trinhDo, id } = item ? item : { loaiNgonNgu: null, trinhDo: '', id: null };
        this.loaiNgonNgu.current.setVal(loaiNgonNgu);
        this.trinhDo.current.setVal(trinhDo);
        $(this.modal.current).data('id', id).data('shcc', shcc).modal('show');
    }

    save = (e) => {
        e.preventDefault();
        const id = $(this.modal.current).data('id'),
            shcc = $(this.modal.current).data('shcc'),
            changes = {
                loaiNgonNgu: this.loaiNgonNgu.current.getVal(),
                trinhDo: this.trinhDo.current.getVal()
            };
        if (id) {
            this.props.update(id, changes, error => {
                if (error == undefined || error == null) {
                    this.props.getData(shcc);
                    $(this.modal.current).modal('hide');
                }
            });
        } else {
            changes.shcc = shcc;
            this.props.getData(shcc);
            this.props.create(changes, () => $(this.modal.current).modal('hide'));
        }
    }

    render() {
        return (
            <div className='modal' tabIndex='-1' role='dialog' ref={this.modal}>
                <form className='modal-dialog' role='document' onSubmit={this.save}>
                    <div className='modal-content'>
                        <div className='modal-header'>
                            <div className='container-fluid row'>
                                <h5 className='modal-title'>Thông tin người thân</h5>
                            </div>
                            <button type='button' className='close' data-dismiss='modal' aria-label='Close'>
                                <span aria-hidden='true'>&times;</span>
                            </button>
                        </div>
                        <div className='modal-body row'>
                            <div className='form-group col-md-6'><Select ref={this.loaiNgonNgu} adapter={SelectAdapter_DmNgoaiNgu} label='Loại ngôn ngữ' required /></div>
                            <div className='form-group col-md-6'><TextInput ref={this.trinhDo} label='Trình độ' maxLength={100} /></div>
                        </div>
                        <div className='modal-footer'>
                            <button type='button' className='btn btn-secondary' data-dismiss='modal'>Đóng</button>
                            <button type='button' className='btn btn-primary' onClick={this.save}>Lưu</button>
                        </div>
                    </div>
                </form>
            </div>
        );
    }
}

class ProfilePage extends QTForm {
    constructor(props) {
        super(props);
        this.state = { user: null, canBo: null, doanVien: false, dangVien: false, nuocNgoai: false, ngayNhapNgu: NaN };
        this.imageBox = React.createRef();
        this.modalNN = React.createRef();

        this.dienThoai = React.createRef();
        this.phai = React.createRef();

        this.shcc = React.createRef();
        this.ho = React.createRef();
        this.ten = React.createRef();
        this.biDanh = React.createRef();
        this.cmnd = React.createRef();
        this.cmndNgayCap = React.createRef();
        this.cmndNoiCap = React.createRef();
        this.ngaySinh = React.createRef();
        this.email = React.createRef();
        this.emailCaNhan = React.createRef();
        this.dienThoaiCaNhan = React.createRef();
        this.dienThoaiBaoTin = React.createRef();
        this.ngayBatDauCongTac = React.createRef();
        this.ngayVao = React.createRef();
        this.ngayCbgd = React.createRef();
        this.ngayBienChe = React.createRef();
        this.ngayNghi = React.createRef();
        this.ngach = React.createRef();
        this.ngachMoi = React.createRef();
        this.heSoLuong = React.createRef();
        this.bacLuong = React.createRef();
        this.mocNangLuong = React.createRef();
        this.ngayHuongLuong = React.createRef();
        this.tyLeVuotKhung = React.createRef();
        this.phuCapCongViec = React.createRef();
        this.ngayPhuCapCongViec = React.createRef();
        this.maChucVu = React.createRef();
        this.chucVuDang = React.createRef();
        this.chucVuDoanThe = React.createRef();
        this.chucVuKiemNhiem = React.createRef();
        this.maTrinhDoLlct = React.createRef();
        this.maTrinhDoQlnn = React.createRef();
        this.maTrinhDoTinHoc = React.createRef();
        this.hoKhau = React.createRef();
        this.diaChiHienTai = React.createRef();
        this.danToc = React.createRef();
        this.quocGia = React.createRef();
        this.tonGiao = React.createRef();
        this.dangVien = React.createRef();
        this.maDonVi = React.createRef();
        this.phucLoi = React.createRef();
        this.nhaGiaoNhanDan = React.createRef();
        this.nhaGiaoUuTu = React.createRef();
        this.dangONuocNgoai = React.createRef();
        this.lyDoONuocNgoai = React.createRef();
        this.ghiChu = React.createRef();
        this.phai = React.createRef();
        this.modal = React.createRef();
        this.main = React.createRef();
        this.nhomMau = React.createRef();
        this.doanVien = React.createRef();
        this.ngayVaoDoan = React.createRef();
        this.noiVaoDoan = React.createRef();
        this.soTheDang = React.createRef();
        this.ngayVaoDang = React.createRef();
        this.noiDangDb = React.createRef();
        this.ngayVaoDangChinhThuc = React.createRef();
        this.noiDangCt = React.createRef();
        this.ngayNhapNgu = React.createRef();
        this.ngayXuatNgu = React.createRef();
        this.quanHamCaoNhat = React.createRef();
        this.soBhxh = React.createRef();
        this.maTinhNoiSinh = React.createRef();
        this.maHuyenNoiSinh = React.createRef();
        this.maXaNoiSinh = React.createRef();
        this.maTinhNguyenQuan = React.createRef();
        this.maHuyenNguyenQuan = React.createRef();
        this.maXaNguyenQuan = React.createRef();
        this.ngheNghiepCu = React.createRef();
        this.chucVuKhac = React.createRef();
        this.hangThuongBinh = React.createRef();
        this.giaDinhChinhSach = React.createRef();
        this.danhHieu = React.createRef();
        this.soTruong = React.createRef();
        this.sucKhoe = React.createRef();
        this.canNang = React.createRef();
        this.chieuCao = React.createRef();
        this.chucDanh = React.createRef();
        this.hocVi = React.createRef();
        this.trinhDoPhoThong = React.createRef();
        this.chuyenNganh = React.createRef();
        this.namChucDanh = React.createRef();
        this.namHocVi = React.createRef();
        this.noiSinh = React.createRef();
        this.queQuan = React.createRef();

        this.mapperQuanHe = {};
        this.mapperChucVu = {};
        this.mapperDonVi = {};
        this.mapperNgonNgu = {};

    }

    componentDidMount() {
        $('#ngaySinh').datepicker({ autoclose: true, format: 'dd/mm/yyyy' });
        T.ready(() => {
            if (this.props.system && this.props.system.user) {
                const user = this.props.system.user;
                user.image = user.image || '/img/avatar.png';
                this.imageBox.current.setData('profile', user.image);

                this.setState({ user });

                if (user.isStaff) {
                    this.props.getDmQuanHeGiaDinhAll(null, items => items.forEach(item => this.mapperQuanHe[item.ma] = item.ten));
                    this.props.getDmChucVuAll(null, items => items.forEach(item => this.mapperChucVu[item.ma] = item.ten));
                    this.props.getDmDonViAll(items => items.forEach(item => this.mapperDonVi[item.ma] = item.ten));
                    this.props.getDmNgoaiNguAll({ kichHoat: 1 }, items => {
                        items.forEach(item => this.mapperNgonNgu[item.ma] = item.ten);
                    });
                    this.getData(user.shcc);
                } else {
                    let { dienThoai, ngaySinh } = user ? user : { dienThoai: '', ngaySinh: '' };
                    $('#ngaySinh').val(ngaySinh ? T.dateToText(ngaySinh, 'dd/mm/yyyy') : '');
                    $('#dienThoai').val(dienThoai);
                    this.phai.current.setText(user.phai ? sexMapper[user.phai] || '' : '');
                }
                setTimeout(() => {

                }, 250);
            }
        });
    }

    getData = (shcc) => {
        if (shcc) {
            this.props.userGetStaff(shcc, data => {
                if (data.error) {
                    T.notify('Lấy thông tin cán bộ bị lỗi!', 'danger');
                } else {
                    this.setState(
                        {
                            canBo: data.item,
                            doanVien: data.item && data.item.doanVien && !data.item.doanVien == 0,
                            dangVien: data.item && data.item.dangVien && data.item.dangVien == 0 ? false : true,
                            nuocNgoai: data.item && data.item.dangONuocNgoai == 0 ? false : true,
                            phai: data.item && data.item.phai,
                        }, () => {
                            this.setVal(data.item);
                        });
                }
            });
        } else {
            this.setState({ create: true });
            this.setVal();
        }
    };

    setVal = (data = {}) => {
        const {shcc='', ho='', ten='', biDanh='', cmnd = '', cmndNgayCap = '', cmndNoiCap = '', emailCaNhan = '', noiSinh = '', queQuan = '',
            email = '', dienThoaiCaNhan = '', dienThoaiBaoTin = '', ngaySinh = '',
            maTrinhDoLlct = '', maTrinhDoQlnn = '', maTrinhDoTinHoc = '', hoKhau = '', diaChiHienTai = '', danToc = '', tonGiao = '',
            lyDoONuocNgoai = '', dangONuocNgoai = false, dangVien = false, chucDanh = '', trinhDoPhoThong = '', hocVi = '', chuyenNganh = '', namChucDanh = '', namHocVi = '',
            phai = '', nhomMau = '', ngayVaoDang = '', ngayVaoDangChinhThuc = '', ngayNhapNgu = '', ngayXuatNgu = '', quanHamCaoNhat = '', soBhxh = '',
            soTheDang = '', noiDangDb = '', noiDangCt = '', doanVien = false, ngayVaoDoan = '', noiVaoDoan = '', ngheNghiepCu = '', quocGia = null, hangThuongBinh = '', giaDinhChinhSach = '',
            danhHieu = '', soTruong = '', sucKhoe = '', canNang = '', chieuCao = '' } = data.constructor === ({}).constructor ? data : {};
        this.cmnd.current.setVal(cmnd);
        this.shcc.current.setVal(shcc);
        this.ho.current.setVal(ho);
        this.ten.current.setVal(ten);
        this.biDanh.current.setVal(biDanh);
        this.cmndNgayCap.current.setVal(cmndNgayCap);
        this.cmndNoiCap.current.setVal(cmndNoiCap);
        this.ngaySinh.current.setVal(ngaySinh);
        this.dienThoaiCaNhan.current.setVal(dienThoaiCaNhan);
        this.dienThoaiBaoTin.current.setVal(dienThoaiBaoTin);
        this.email.current.setVal(email);
        this.emailCaNhan.current.setVal(emailCaNhan);
        this.ngaySinh.current.setVal(ngaySinh);
        this.doanVien.current.setVal(doanVien);
        this.dangVien.current.setVal(dangVien);

        this.quocGia.current.setVal(quocGia);
        if (this.state.doanVien) {
            this.ngayVaoDoan.current.setVal(ngayVaoDoan);
            this.noiVaoDoan.current.setVal(noiVaoDoan);
        }
        if (this.state.dangVien) {
            this.ngayVaoDang.current.setVal(ngayVaoDang);
            this.ngayVaoDangChinhThuc.current.setVal(ngayVaoDangChinhThuc);
            this.noiDangDb.current.setVal(noiDangDb);
            this.noiDangCt.current.setVal(noiDangCt);
            this.soTheDang.current.setVal(soTheDang);
        }
        this.maTrinhDoLlct.current.setVal(maTrinhDoLlct);
        this.maTrinhDoQlnn.current.setVal(maTrinhDoQlnn);
        this.maTrinhDoTinHoc.current.setVal(maTrinhDoTinHoc);
        this.hoKhau.current.setVal(hoKhau);
        this.diaChiHienTai.current.setVal(diaChiHienTai);
        this.danToc.current.setVal(danToc);
        this.tonGiao.current.setVal(tonGiao);
        this.dangONuocNgoai.current.setVal(dangONuocNgoai);
        if (this.state.nuocNgoai) this.lyDoONuocNgoai.current.setVal(lyDoONuocNgoai);
        this.phai.current.setVal(phai);
        this.nhomMau.current.setVal(nhomMau);
        this.soBhxh.current.setVal(soBhxh);
        this.quanHamCaoNhat.current.setVal(quanHamCaoNhat);
        this.ngayNhapNgu.current.setVal(ngayNhapNgu);
        this.ngayXuatNgu.current.setVal(ngayXuatNgu);
        this.hangThuongBinh.current.setVal(hangThuongBinh);
        this.giaDinhChinhSach.current.setVal(giaDinhChinhSach);
        this.danhHieu.current.setVal(danhHieu);
        this.soTruong.current.setVal(soTruong);
        this.sucKhoe.current.setVal(sucKhoe);
        this.canNang.current.setVal(canNang);
        this.chieuCao.current.setVal(chieuCao);
        this.ngheNghiepCu.current.setVal(ngheNghiepCu);
        this.chucDanh.current.setVal(chucDanh);
        this.hocVi.current.setVal(hocVi);
        this.chuyenNganh.current.setVal(chuyenNganh);
        this.namChucDanh.current.setVal(namChucDanh);
        this.namHocVi.current.setVal(namHocVi);
        this.trinhDoPhoThong.current.setVal(trinhDoPhoThong);
        this.noiSinh.current.setVal(noiSinh);
        this.queQuan.current.setVal(queQuan);
    };

    getVal = () => ({
        shcc: this.shcc.current.getFormVal(),
        ho: this.shcc.current.getFormVal(),
        ten: this.shcc.current.getFormVal(),
        biDanh: this.biDanh.current.getFormVal(),
        cmnd: this.cmnd.current.getFormVal(),
        cmndNgayCap: this.cmndNgayCap.current.getFormVal(),
        cmndNoiCap: this.cmndNoiCap.current.getFormVal(),
        ngaySinh: this.ngaySinh.current.getFormVal(),
        dienThoaiCaNhan: this.dienThoaiCaNhan.current.getFormVal(),
        dienThoaiBaoTin: this.dienThoaiBaoTin.current.getFormVal(),
        email: this.email.current.getFormVal(),
        quocGia: this.quocGia.current.getFormVal(),
        emailCaNhan: this.emailCaNhan.current.getFormVal(),
        doanVien: this.doanVien.current.getFormVal(),
        dangVien: this.dangVien.current.getFormVal(),
        ngayVaoDoan: this.state.doanVien ? this.ngayVaoDoan.current.getFormVal() : {},
        noiVaoDoan: this.state.doanVien ? this.noiVaoDoan.current.getFormVal() : {},
        soTheDang: this.state.dangVien ? this.soTheDang.current.getFormVal() : {},
        ngayVaoDang: this.state.dangVien ? this.ngayVaoDang.current.getFormVal() : {},
        ngayVaoDangChinhThuc: this.state.dangVien ? this.ngayVaoDangChinhThuc.current.getFormVal() : {},
        noiDangDb: this.state.dangVien ? this.noiDangDb.current.getFormVal() : {},
        noiDangCt: this.state.dangVien ? this.noiDangCt.current.getFormVal() : {},
        maTrinhDoLlct: this.maTrinhDoLlct.current.getFormVal(),
        maTrinhDoQlnn: this.maTrinhDoQlnn.current.getFormVal(),
        maTrinhDoTinHoc: this.maTrinhDoTinHoc.current.getFormVal(),
        hoKhau: this.hoKhau.current.getFormVal(),
        diaChiHienTai: this.diaChiHienTai.current.getFormVal(),
        danToc: this.danToc.current.getFormVal(),
        tonGiao: this.tonGiao.current.getFormVal(),
        dangONuocNgoai: this.dangONuocNgoai.current.getFormVal(),
        lyDoONuocNgoai: this.state.nuocNgoai ? this.lyDoONuocNgoai.current.getFormVal() : '',
        phai: this.phai.current.getFormVal(),
        nhomMau: this.nhomMau.current.getFormVal(),
        soBhxh: this.soBhxh.current.getFormVal(),
        quanHamCaoNhat: this.quanHamCaoNhat.current.getFormVal(),
        ngayNhapNgu: this.ngayNhapNgu.current.getFormVal(),
        ngayXuatNgu: this.ngayXuatNgu.current.getFormVal(),
        hangThuongBinh: this.hangThuongBinh.current.getFormVal(),
        giaDinhChinhSach: this.giaDinhChinhSach.current.getFormVal(),
        danhHieu: this.danhHieu.current.getFormVal(),
        soTruong: this.soTruong.current.getFormVal(),
        sucKhoe: this.sucKhoe.current.getFormVal(),
        canNang: this.canNang.current.getFormVal(),
        chieuCao: this.chieuCao.current.getFormVal(),
        ngheNghiepCu: this.ngheNghiepCu.current.getFormVal(),
        chucDanh: this.chucDanh.current.getFormVal(),
        hocVi: this.hocVi.current.getFormVal(),
        chuyenNganh: this.chuyenNganh.current.getFormVal(),
        namChucDanh: this.namChucDanh.current.getFormVal(),
        namHocVi: this.namHocVi.current.getFormVal(),
        trinhDoPhoThong: this.trinhDoPhoThong.current.getFormVal(),
        noiSinh: this.noiSinh.current.getFormVal(),
        queQuan: this.queQuan.current.getFormVal()
    })

    saveCommon = (e) => {
        e.preventDefault();
        const sexObject = { 'Nam': '01', 'Nữ': '02' };
        let phai = this.phai.current.getSelectedItem(),
            ngaySinh = $('#ngaySinh').val() || null,
            changes = { dienThoai: $('#dienThoai').val() };
        if (phai && sexObject[phai]) changes.phai = sexObject[phai];
        if (ngaySinh) changes.ngaySinh = T.formatDate(ngaySinh).getTime();
        this.props.updateProfile(changes);
    }

    save = () => {
        const form = this.getFormVal();
        this.main.current.classList.add('validated');
        form.data && this.props.updateStaffUser(form.data, () => this.main.current.classList.remove('validated'));
    };

    createQuanHe = (e, type) => {
        e.preventDefault();
        this.modal.current.show(null, type, this.state.canBo.shcc);
    }
    editQuanHe = (e, item) => {
        this.modal.current.show(item, null, this.state.canBo.shcc);
        e.preventDefault();
    }
    deleteQuanHe = (e, item) => {
        T.confirm('Xóa thông tin người thân', 'Bạn có chắc bạn muốn xóa mục này?', true, isConfirm =>
            isConfirm && this.props.deleteQuanHeStaffUser(item.id, item.shcc));
        e.preventDefault();
    }

    createTrinhDoNN = (e) => {
        e.preventDefault();
        this.modalNN.current.show(null, this.state.canBo.shcc);
    }

    editTrinhDoNN = (e, item) => {
        this.modalNN.current.show(item, this.state.canBo.shcc);
        e.preventDefault();
    }

    deleteTrinhDoNN = (e, item) => {
        T.confirm('Xóa thông tin trình độ ngoại ngữ', 'Bạn có chắc bạn muốn xóa mục này?', true, isConfirm =>
            isConfirm && this.props.deleteTrinhDoNNStaffUser(item.id, () => this.props.getStaffEdit(this.state.canBo.shcc)));
        e.preventDefault();
    }

    render() {
        const user = this.props.system ? this.props.system.user : {};
        const renderQuanHeTable = (items, emptyListValue) => items && items.length > 0 ? (
            <table className='table table-hover table-bordered' ref={this.table}>
                <thead>
                    <tr>
                        <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                        <th style={{ width: '20%' }}>Họ và tên</th>
                        <th style={{ width: 'auto' }} nowrap='true'>Năm sinh</th>
                        <th style={{ width: '20%' }}>Quan hệ</th>
                        <th style={{ width: '30%' }}>Nghề nghiệp</th>
                        <th style={{ width: '30%' }}>Nơi công tác</th>
                        <th style={{ width: 'auto', textAlign: 'center' }}>Thao tác</th>
                    </tr>
                </thead>
                <tbody>
                    {items.map((item, index) => (
                        <tr key={index}>
                            <td style={{ textAlign: 'right' }}>{index + 1}</td>
                            <td>
                                <a href='#' onClick={e => this.editQuanHe(e, item)}>{item.hoTen}</a>
                            </td>
                            <td style={{ textAlign: 'center' }}>{T.dateToText(item.namSinh, 'yyyy')}</td>
                            <td>{this.mapperQuanHe[item.moiQuanHe]}</td>
                            <td>{item.ngheNghiep}</td>
                            <td>{item.noiCongTac}</td>
                            <td style={{ textAlign: 'center' }}>
                                <div className='btn-group'>
                                    <a className='btn btn-primary' href='#' onClick={e => this.editQuanHe(e, item)}>
                                        <i className='fa fa-lg fa-edit' />
                                    </a>
                                    <a className='btn btn-danger' href='#' onClick={e => this.deleteQuanHe(e, item)}>
                                        <i className='fa fa-lg fa-trash' />
                                    </a>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>) : emptyListValue;
        let currentCanBo = this.props.staff && this.props.staff.userItem ? this.props.staff.userItem : null;
        let tableNN = null, itemsNN = currentCanBo && currentCanBo.trinhDoNN ? currentCanBo.trinhDoNN : [];
        const item = this.state.canBo || {};
        const renderFieldText = (className, label, hasValue, value, noValue = 'Không có thông tin!') =>
            <div className={className}>{label}: <b>{hasValue ? value : noValue}</b></div>;
        // const roundNumber = num => num ? parseFloat(num).toFixed(2) : '';
        if (itemsNN && itemsNN.length > 0) {
            tableNN = (
                <table className='table table-hover table-bordered' ref={this.table}>
                    <thead>
                        <tr>
                            <th style={{ width: '30%' }}>Loại ngôn ngữ</th>
                            <th style={{ width: '70%' }}>Trình độ</th>
                            <th style={{ width: 'auto', textAlign: 'center' }}>Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {itemsNN.map((item, index) => (
                            <tr key={index}>
                                <td>
                                    <a href='#' onClick={e => this.editTrinhDoNN(e, item)}>{this.mapperNgonNgu[item.loaiNgonNgu]}</a>
                                </td>
                                <td>{item.trinhDo}</td>
                                <td style={{ textAlign: 'center' }}>
                                    <div className='btn-group'>
                                        <a className='btn btn-primary' href='#' onClick={e => this.editTrinhDoNN(e, item)}>
                                            <i className='fa fa-lg fa-edit' />
                                        </a>
                                        <a className='btn btn-danger' href='#' onClick={e => this.deleteTrinhDoNN(e, item)}>
                                            <i className='fa fa-lg fa-trash' />
                                        </a>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            );
        }
        return (
            <main ref={this.main} className='app-content'>
                <div className='app-title'>
                    <h1><i className='fa fa-user' /> Thông tin cá nhân</h1>
                </div>
                {user && !user.isStaff ? <div className='tile'>
                    <h3 className='tile-title'>Thông tin cá nhân</h3>
                    <div className='tile-body'>
                        <div className='row'>
                            <div className='col-12 col-lg-8 order-2 order-lg-1' style={{ paddingTop: 10 }}>
                                <div className='form-group'>
                                    <label className='control-label'>
                                        Họ và tên: <span style={{ fontWeight: 'bold' }}>{user ? user.lastName : ''} {user ? user.firstName : ''}</span>
                                    </label>
                                </div>
                                <div className='form-group'>
                                    <label className='control-label'>
                                        Email: <span style={{ fontWeight: 'bold' }}>{user ? user.email : ''}</span>
                                    </label>
                                </div>
                                <div className='form-group' style={{ display: 'inline-flex' }}>
                                    <label className='control-label'>Giới tính:</label>&nbsp;
                                    <Dropdown ref={this.phai} text='' items={T.sexes} />
                                </div>
                                <div className='form-group'>
                                    <label className='control-label' htmlFor='dienThoai'>Số điện thoại</label>
                                    <input className='form-control' type='text' placeholder='Số điện thoại' id='dienThoai' />
                                </div>
                                <div className='form-group'>
                                    <label className='control-label' htmlFor='ngaySinh'>Ngày sinh</label>
                                    <input className='form-control' type='text' autoComplete='off' placeholder='Ngày sinh' id='ngaySinh' />
                                </div>
                            </div>
                            <div className='col-12 col-lg-4 order-1 order-lg-2'>
                                <div className='form-group'>
                                    <label className='control-label'>Hình đại diện</label>
                                    <ImageBox ref={this.imageBox} postUrl='/user/upload' uploadType='ProfileImage' userData='profile' image={this.state.user && this.state.user.image} />
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className='tile-footer' style={{ textAlign: 'right' }}>
                        <button className='btn btn-success' type='button' onClick={this.saveCommon}>
                            <i className='fa fa-lg fa-save' /> Lưu
                        </button>
                    </div>
                </div> :
                    [<div className='tile' key={1}>
                        <h3 className='tile-title'>Thông tin cá nhân</h3>
                        <div className='tile-body row'>
                            <div className='form-group col-md-3'>
                                <label>Hình đại diện</label>
                                <ImageBox ref={this.imageBox} postUrl='/user/upload' uploadType='ProfileImage' userData='profile' image={this.state.user && this.state.user.image} />
                            </div>
                            <div className='form-group col-md-9'>
                                <div className='row'>
                                    <div className='form-group col-md-4'><TextInput ref={this.shcc} label='Mã thẻ cán bộ' required placeholder='Nhập mã thẻ cán bộ' maxLength={10} /></div>
                                    <div className='form-group col-md-4'><TextInput ref={this.ho} label='Họ và tên lót' required maxLength={100} /></div>
                                    <div className='form-group col-md-4'><TextInput ref={this.ten} label='Tên' required maxLength={30} /></div>
                                    <div className='form-group col-md-4'><TextInput ref={this.biDanh} label='Bí danh' maxLength={20} /></div>
                                    <div className='form-group col-md-4'><DateInput ref={this.ngaySinh} label='Ngày sinh' min={new Date(1900, 1, 1).getTime()} max={Date.nextYear(-10).roundDate().getTime()} /></div>
                                    <div className='form-group col-md-4'><Select ref={this.phai} adapter={SelectAdapter_DmGioiTinh} label='Giới tính' required /></div>
                                </div>
                            </div>
                            <div className='form-group col-md-4'><TextInput ref={this.cmnd} label='CMND/CCCD' placeholder='Nhập CMND / CCCD' maxLength={15} /></div>
                            <div className='form-group col-md-4'><DateInput ref={this.cmndNgayCap} label='Ngày cấp' min={new Date(1900, 1, 1).getTime()} max={new Date().getTime()} /></div>
                            <div className='form-group col-md-4'><TextInput ref={this.cmndNoiCap} label='Nơi cấp CMND/CCCD' placeholder='Nhập nơi cấp cmnd' maxLength={200} /></div>
                            
                            <div className='form-group col-md-6'><TextInput ref={this.emailCaNhan} label='Địa chỉ email cá nhân' maxLength={50} /></div>
                            <div className='form-group col-md-6'><TextInput ref={this.email} label='Địa chỉ email trường' maxLength={50} /></div>
                            <div className='form-group col-md-4'><TextInput ref={this.dienThoaiCaNhan} label='Số điện thoại cá nhân' maxLength={20} /></div>
                            <div className='form-group col-md-4'><TextInput ref={this.dienThoaiBaoTin} label='Số điện thoại báo tin' maxLength={20} /></div>
                            <div className='form-group col-md-4'><TextInput ref={this.soBhxh} label='Số BHXH' /></div>       
                            <div className='form-group col-md-6'><TextInput ref={this.hoKhau} label='Hộ khẩu' maxLength={200} /></div>
                            <div className='form-group col-md-6'><TextInput ref={this.diaChiHienTai} label='Địa chỉ hiện tại' maxLength={200} /></div>
                            <div className='form-group col-12'/>
                            <div className='form-group col-md-6'><TextInput ref={this.noiSinh} label='Nơi sinh' maxLength={200} /></div>
                            <div className='form-group col-md-6'><TextInput ref={this.queQuan} label='Quê quán' maxLength={200} /></div>
                            <div className='form-group col-xl-3 col-md-6'><Select ref={this.nhomMau} adapter={SelectAdapter_DmNhomMau} label='Nhóm máu' /></div>
                            <div className='form-group col-xl-3 col-md-6'><Select ref={this.danToc} adapter={SelectAdapter_DmDanToc} label='Dân tộc' required /></div>
                            <div className='form-group col-xl-3 col-md-6'><Select ref={this.quocGia} adapter={SelectAdapter_DmQuocGia} label='Quốc gia' required /></div>
                            <div className='form-group col-xl-3 col-md-6'><Select ref={this.tonGiao} adapter={SelectAdapter_DmTonGiao} label='Tôn giáo' required /></div>

                            <div className='form-group col-12'/>
                            <div className='form-group col-md-4'><TextInput ref={this.sucKhoe} label='Sức khỏe' maxLength={100} /></div>
                            <div className='form-group col-md-4'><NumberInput ref={this.canNang} label='Cân nặng(kg)' min={0} step={0.1} /></div>
                            <div className='form-group col-md-4'><NumberInput ref={this.chieuCao} label='Chiều cao(cm)' min={0} step={1} /></div>
                            <div className='form-group col-md-6'><TextInput ref={this.soTruong} label='Sở trường' maxLength={100} /></div>
                            <div className='form-group col-md-6'><TextInput ref={this.ngheNghiepCu} label='Nghề nghiệp trước khi tuyển dụng' maxLength={100} /></div>
                        </div>
                    </div>,
                    <div className='tile' key={2}>
                        <h3 className='tile-title'>Thông tin công tác</h3>
                        <div className='tile-body row'>
                            {this.state.dangVien && item.chucVuDang ? renderFieldText('form-group col-md-12', 'Chức vụ trong Đảng', item.chucVuDang, item.chucVuDang) : null}
                            {item.maChucVu && this.mapperChucVu[item.maChucVu] ? renderFieldText('form-group col-12', 'Chức vụ chính quyền', true, this.mapperChucVu[item.maChucVu]) : null}
                            {item.chucVuDoanThe ? renderFieldText('form-group col-12', 'Chức vụ Đoàn thể', item.chucVuDoanThe, item.chucVuDoanThe) : null}
                            {item.chucVuKiemNhiem ? renderFieldText('form-group col-12', 'Chức vụ kiêm nhiệm', item.chucVuKiemNhiem, item.chucVuKiemNhiem) : null}
                            {item.chucVuKhac ? renderFieldText('form-group col-12', 'Chức vụ khác', item.chucVuKhac, item.chucVuKhac) : null}
                            <div className='col-12' />
                            {item.maDonVi ? renderFieldText('form-group col-md-6', 'Đơn vị', true, this.mapperDonVi[item.maDonVi]) : null}
                            <div className='col-12' />
                            {renderFieldText('form-group col-md-4', 'Ngày bắt đầu công tác', item.ngayBatDauCongTac, T.dateToText(item.ngayBatDauCongTac, 'dd/mm/yyyy'))}
                            {renderFieldText('form-group col-md-4', 'Ngày biên chế', item.ngayBienChe, T.dateToText(item.ngayBienChe, 'dd/mm/yyyy'))}
                            {item.nhaGiaoNhanDan ? renderFieldText('form-group col-md-3', 'Nhà giáo nhân dân', item.nhaGiaoNhanDan, item.nhaGiaoNhanDan) : null}
                            {item.nhaGiaoUuTu ? renderFieldText('form-group col-md-3', 'Nhà giáo ưu tú', item.nhaGiaoUuTu, item.nhaGiaoUuTu) : null}
                            <div className='col-12' />
                            <div className='form-group col-md-3'><Select ref={this.maTrinhDoLlct} adapter={SelectAdapter_DmTrinhDoLyLuanChinhTri} label='Trình độ lý luận chính trị' /></div>
                            <div className='form-group col-md-3'><Select ref={this.maTrinhDoQlnn} adapter={SelectAdapter_DmTrinhDoQuanLyNhaNuoc} label='Trình độ quản lý nhà nước' /></div>
                            <div className='form-group col-md-3'><Select ref={this.maTrinhDoTinHoc} adapter={SelectAdapter_DmTrinhDoTinHoc} label='Trình độ tin học' /></div>
                            <div className='form-group col-md-3'><BooleanInput ref={this.doanVien} label='Đoàn viên:&nbsp;' onChange={value => this.setState({ doanVien: value })} /></div>
                            <div className='form-group col-md-9' style={{ display: this.state.doanVien ? 'block' : 'none' }}>
                                <div className='row' >
                                    <div className='form-group col-md-4'><DateInput ref={this.ngayVaoDoan} label='Ngày vào Đoàn' required min={new Date(1900, 1, 1).getTime()} max={new Date().getTime()} /></div>
                                    <div className='form-group col-md-8'><TextInput ref={this.noiVaoDoan} label='Nơi vào Đoàn' maxLength={200} required /></div>
                                </div>
                            </div>
                            <div className='col-12' />
                            <div className='form-group col-md-3'><BooleanInput ref={this.dangVien} label='Đảng viên:&nbsp;' onChange={value => this.setState({ dangVien: value })} /></div>
                            <div className='form-group col-md-9' style={{ display: this.state.dangVien ? 'block' : 'none' }}>
                                <div className='row'>
                                    <div className='form-group col-md-4'><DateInput ref={this.ngayVaoDang} label='Ngày vào Đảng (dự bị)' required min={new Date(1900, 1, 1).getTime()} max={new Date().getTime()} /></div>
                                    <div className='form-group col-md-8'><TextInput ref={this.noiDangDb} label='Nơi vào Đảng (dự bị)' maxLength={200} /></div>
                                    <div className='form-group col-md-4'><DateInput ref={this.ngayVaoDangChinhThuc} label='Ngày vào Đảng chính thức' min={new Date(1900, 1, 1).getTime()} max={new Date().getTime()} /></div>
                                    <div className='form-group col-md-8'><TextInput ref={this.noiDangCt} label='Nơi vào Đảng chính thức' maxLength={200} /></div>
                                    <div className='form-group col-md-4'><TextInput ref={this.soTheDang} label='Số thẻ Đảng' maxLength={200} /></div>
                                </div>
                            </div>
                            <div className='col-12' />
                            <div className='form-group col-md-3'>
                                <BooleanInput ref={this.dangONuocNgoai} label='Đang ở nước ngoài:&nbsp;' onChange={value => this.setState({ nuocNgoai: value })} />
                            </div>
                            <div className='form-group col-md-9'>
                                {this.state.nuocNgoai && <TextInput ref={this.lyDoONuocNgoai} label='Lý do ở nước ngoài' maxLength={200} />}
                            </div>
                            <div className='form-group col-md-4'><TextInput ref={this.quanHamCaoNhat} label='Quân hàm cao nhất' /></div>
                            <div className='form-group col-md-4'><DateInput ref={this.ngayNhapNgu} type='year' label='Năm nhập ngũ (yyyy)' /></div>
                            <div className='form-group col-md-4'><DateInput ref={this.ngayXuatNgu} type='year' label='Năm xuất ngũ (yyyy)' /></div>
                            <div className='form-group col-md-4'><TextInput ref={this.hangThuongBinh} label='Hạng thương binn' /></div>
                            <div className='form-group col-md-4'><TextInput ref={this.giaDinhChinhSach} label='Gia đình chính sách' /></div>
                            <div className='form-group col-md-4'><TextInput ref={this.danhHieu} label='Danh hiệu' /></div>
                            {item.phucLoi ? renderFieldText('form-group col-12', 'Phúc lợi', item.phucLoi, item.phucLoi) : null}
                        </div>
                    </div>,
                    <div className='tile' key={3}>
                        <h3 className='tile-title'>Trình độ học vấn</h3>
                        <div className='tile-body row'>
                            <div className='form-group col-xl-4 col-md-6'><Select ref={this.chucDanh} adapter={SelectAdapter_DmChucDanhKhoaHoc} label='Chức danh' /></div>
                            <div className='form-group col-xl-4 col-md-6'><DateInput ref={this.namHocVi} label='Năm công nhận chức danh' type='year' min={Date.getDateInputDefaultMin()} max={new Date().getTime()} /></div>
                            <div className='form-group col-xl-4 col-md-6'><Select ref={this.hocVi} adapter={SelectAdapter_DmTrinhDo} label='Học vị' /></div>
                            <div className='form-group col-xl-4 col-md-6'><DateInput ref={this.namChucDanh} label='Năm công nhận học vị' type='year' min={Date.getDateInputDefaultMin()} max={new Date().getTime()} /></div>
                            <div className='form-group col-xl-4 col-md-6'><TextInput ref={this.chuyenNganh} label='Chuyên ngành' /></div>
                            <div className='form-group col-xl-4 col-md-6'><TextInput ref={this.trinhDoPhoThong} label='Trình độ phổ thông' /></div>
                        </div>
                        <div>
                            <p>Trình độ ngoại ngữ {!itemsNN || itemsNN.length == 0 ? <strong>: Không có thông tin</strong> : ''}</p>
                            <div className='tile-body'>{tableNN}</div>
                            <div className='tile-footer' style={{ textAlign: 'right' }}>
                                <button className='btn btn-info' type='button' onClick={e => this.createTrinhDoNN(e)}>
                                    <i className='fa fa-fw fa-lg fa-plus' />Thêm trình độ ngoại ngữ
                                </button>
                            </div>
                        </div>
                    </div>,
                    <div className='tile' key={4}>
                        <h3 className='tile-title'>Thông tin người thân</h3>
                        <ul className='nav nav-tabs' id='myTab' role='tablist'>
                            <li className='nav-item'>
                                <a className='nav-link active' id='infoQuanHe1' data-toggle='tab' href='#infoQuanHe1Content' role='tab' aria-controls='infoQuanHe1Content' aria-selected='true'>Về bản thân</a>
                            </li>
                            <li className='nav-item'>
                                <a className='nav-link' id='infoQuanHe2' data-toggle='tab' href='#infoQuanHe2Content' role='tab' aria-controls='infoQuanHe2Content' aria-selected='false'>Về bên {item.phai == '01' ? 'vợ' : 'chồng'}</a>
                            </li>
                        </ul>
                        <div className='tab-content' style={{ paddingTop: '10px' }}>
                            <div className='tab-pane fade show active' id='infoQuanHe1Content' role='tabpanel' aria-labelledby='infoQuanHe1'>
                                <p>Gồm: cha, mẹ, {item.phai == '01' ? 'vợ' : 'chồng'}, các con, anh chị em ruột</p>
                                <div className='tile-body'>
                                    {currentCanBo && renderQuanHeTable(currentCanBo.items ? currentCanBo.items.filter(i => i.type == 0) : [], <p>Không có thông tin!</p>)}
                                </div>
                                <div className='tile-footer' style={{ textAlign: 'right' }}>
                                    <button className='btn btn-info' type='button' onClick={e => this.createQuanHe(e, 0)}>
                                        <i className='fa fa-fw fa-lg fa-plus' />Thêm thông tin người thân
                                    </button>
                                </div>
                            </div>
                            <div className='tab-pane fade' id='infoQuanHe2Content' role='tabpanel' aria-labelledby='infoQuanHe2'>
                                <p>Gồm: cha, mẹ, anh chị em ruột</p>
                                <div className='tile-body'>
                                    {currentCanBo && renderQuanHeTable(currentCanBo.items ? currentCanBo.items.filter(i => i.type == 1) : [], <p>Không có thông tin!</p>)}
                                </div>
                                <div className='tile-footer' style={{ textAlign: 'right' }}>
                                    <button className='btn btn-info' type='button' onClick={e => this.createQuanHe(e, 1)}>
                                        <i className='fa fa-fw fa-lg fa-plus' />Thêm thông tin người thân
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>,
                    <button key={5} type='button' title='Save' className='btn btn-primary btn-circle' style={{ position: 'fixed', right: '10px', bottom: '10px' }} onClick={this.save}>
                        <i className='fa fa-lg fa-save' />
                    </button>,
                    <RelationModal key={6} ref={this.modal} create={this.props.createQuanHeStaffUser} update={this.props.updateQuanHeStaffUser} />,
                    <TrinhDoNNModal key={7} ref={this.modalNN} create={this.props.createTrinhDoNNStaffUser} update={this.props.updateTrinhDoNNStaffUser} getData={this.props.userGetStaff} />
                    ]
                }
            </main>
        );
    }
}

const mapStateToProps = state => ({ system: state.system, division: state.division, staff: state.staff });
const mapActionsToProps = {
    updateProfile, userGetStaff, getDmQuanHeGiaDinhAll, getDmDonViAll, getDmChucVuAll, updateStaffUser, createQuanHeStaffUser, updateQuanHeStaffUser, deleteQuanHeStaffUser,
    createTrinhDoNNStaffUser, updateTrinhDoNNStaffUser, deleteTrinhDoNNStaffUser, getDmNgoaiNguAll
};
export default connect(mapStateToProps, mapActionsToProps)(ProfilePage);

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
import { getDmChucVuAll, SelectAdapter_DmChucVu } from 'modules/mdDanhMuc/dmChucVu/redux';
import { SelectAdapter_DmNhomMau } from 'modules/mdDanhMuc/dmBenhVien/reduxNhomMau';
import { SelectAdapter_DmQuocGia } from 'modules/mdDanhMuc/dmQuocGia/redux';
import { SelectAdapter_DmChucDanhKhoaHoc } from 'modules/mdDanhMuc/dmChucDanhKhoaHoc/redux';
import { SelectAdapter_DmTrinhDo } from 'modules/mdDanhMuc/dmTrinhDo/redux';
import { SelectAdapter_DmDonVi } from 'modules/mdDanhMuc/dmDonVi/redux';
import TextInput, { DateInput, NumberInput, Select, BooleanInput } from 'view/component/Input';
import { QTForm } from 'view/component/Form';
import { ComponentDiaDiem } from 'modules/mdDanhMuc/dmDiaDiem/componentDiaDiem';

const genderMapper = { '01': 'Nam', '02': 'Nữ' };

class RelationModal extends React.Component {

    componentDidMount() {
        $(document).ready(() => setTimeout(() => {
            $(this.modal).on('shown.bs.modal', () => $(this.hoTen).focus());
        }, 250));
    }

    show = (item, type, shcc) => {
        let { hoTen, moiQuanHe, namSinh, ngheNghiep, noiCongTac, diaChi, id } = item ? item : { hoTen: '', moiQuanHe: '', namSinh: '', ngheNghiep: '', noiCongTac: '', diaChi: '', id: null };
        this.hoTen.setVal(hoTen);
        this.moiQuanHe.setVal(moiQuanHe);
        this.namSinh.setVal(namSinh);
        this.ngheNghiep.setVal(ngheNghiep);
        this.noiCongTac.setVal(noiCongTac);
        this.diaChi.setVal(diaChi);
        $(this.modal).data('id', id).data('shcc', shcc).data('type', type).modal('show');
    }

    save = (e) => {
        e.preventDefault();
        const id = $(this.modal).data('id'),
            shcc = $(this.modal).data('shcc'),
            type = $(this.modal).data('type'),
            changes = {
                hoTen: this.hoTen.getVal(),
                moiQuanHe: this.moiQuanHe.getVal(),
                namSinh: this.namSinh.getVal(),
                ngheNghiep: this.ngheNghiep.getVal(),
                noiCongTac: this.noiCongTac.getVal(),
                diaChi: this.diaChi.getVal()
            };
        if (id) {
            this.props.update(id, changes, shcc, error => {
                if (error == undefined || error == null) {
                    $(this.modal).modal('hide');
                }
            });
        } else {
            changes.shcc = shcc;
            changes.type = type;
            this.props.create(changes, shcc, () => $(this.modal).modal('hide'));
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
                            <div className='form-group col-md-6'><TextInput ref={e => this.hoTen = e} label='Họ và tên' required maxLength={250} /></div>
                            <div className='form-group col-md-6'><Select ref={e => this.moiQuanHe = e} adapter={SelectAdapter_DmQuanHeGiaDinh} label='Mối quan hệ' required /></div>
                            <div className='form-group col-md-8'><TextInput ref={e => this.namSinh = e} label='Năm sinh' max={Date.nextYear().getTime()} required /></div>
                            <div className='form-group col-md-4'><TextInput ref={e => this.ngheNghiep = e} label='Nghề nghiệp' maxLength={100} /></div>
                            <div className='form-group col-md-12'><TextInput ref={e => this.noiCongTac = e} label='Nơi công tác' maxLength={100} /></div>
                            <div className='form-group col-md-12'><TextInput ref={e => this.diaChi = e} label='Địa chỉ hiện tại' maxLength={200} /></div>
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

    show = (item, shcc) => {
        let { loaiNgonNgu, trinhDo, id } = item ? item : { loaiNgonNgu: null, trinhDo: '', id: null };
        this.loaiNgonNgu.setVal(loaiNgonNgu);
        this.trinhDo.setVal(trinhDo);
        $(this.modal).data('id', id).data('shcc', shcc).modal('show');
    }

    save = (e) => {
        e.preventDefault();
        const id = $(this.modal).data('id'),
            shcc = $(this.modal).data('shcc'),
            changes = {
                loaiNgonNgu: this.loaiNgonNgu.getVal(),
                trinhDo: this.trinhDo.getVal()
            };
        if (id) {
            this.props.update(id, changes, error => {
                if (error == undefined || error == null) {
                    this.props.getData(shcc);
                    $(this.modal).modal('hide');
                }
            });
        } else {
            changes.shcc = shcc;
            this.props.getData(shcc);
            this.props.create(changes, () => $(this.modal).modal('hide'));
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
                            <div className='form-group col-md-6'><Select ref={e => this.loaiNgonNgu = e} adapter={SelectAdapter_DmNgoaiNgu} label='Loại ngôn ngữ' required /></div>
                            <div className='form-group col-md-6'><TextInput ref={e => this.trinhDo = e} label='Trình độ' maxLength={100} /></div>
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
                this.imageBox.setData('profile', user.image);
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
                    this.phai.setText(user.phai ? genderMapper[user.phai] || '01' : '01');
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
        const { shcc = '', ho = '', ten = '', biDanh = '', cmnd = '', cmndNgayCap = '', cmndNoiCap = '', emailCaNhan = '',
            email = '', dienThoaiCaNhan = '', dienThoaiBaoTin = '', ngaySinh = '',
            thuongTruSoNha = '', thuongTruMaXa = '', thuongTruMaHuyen = '', thuongTruMaTinh = '',
            maXaNoiSinh = '', maHuyenNoiSinh = '', maTinhNoiSinh = '',
            maXaNguyenQuan = '', maHuyenNguyenQuan = '', maTinhNguyenQuan = '',
            hienTaiSoNha = '', hienTaiMaXa = '', hienTaiMaHuyen = '', hienTaiMaTinh = '',
            maTrinhDoLlct = '', maTrinhDoQlnn = '', maTrinhDoTinHoc = '', danToc = '', tonGiao = '',
            lyDoONuocNgoai = '', dangONuocNgoai = false, dangVien = false, chucDanh = '', trinhDoPhoThong = '', hocVi = '', chuyenNganh = '', namChucDanh = '', namHocVi = '',
            phai = '', nhomMau = '', ngayVaoDang = '', ngayVaoDangChinhThuc = '', ngayNhapNgu = '', ngayXuatNgu = '', quanHamCaoNhat = '', soBhxh = '',
            soTheDang = '', noiDangDb = '', noiDangCt = '', doanVien = false, ngayVaoDoan = '', noiVaoDoan = '', ngheNghiepCu = '', quocGia = null, hangThuongBinh = '', giaDinhChinhSach = '',
            danhHieu = '', soTruong = '', sucKhoe = '', canNang = '', chieuCao = '' } = data.constructor === ({}).constructor ? data : {};
        if (this.state.canBo) {
            this.cmnd.setVal(cmnd);
            this.shcc.setVal(shcc);
            this.ho.setVal(ho);
            this.ten.setVal(ten);
            this.biDanh.setVal(biDanh);
            this.cmndNgayCap.setVal(cmndNgayCap);
            this.cmndNoiCap.setVal(cmndNoiCap);
            this.ngaySinh.setVal(ngaySinh);
            this.dienThoaiCaNhan.setVal(dienThoaiCaNhan);
            this.dienThoaiBaoTin.setVal(dienThoaiBaoTin);
            this.email.setVal(email);
            this.emailCaNhan.setVal(emailCaNhan);
            this.ngaySinh.setVal(ngaySinh);
            this.doanVien.setVal(doanVien);
            this.dangVien.setVal(dangVien);
            this.quocGia.setVal(quocGia);

            this.maTrinhDoLlct.setVal(maTrinhDoLlct);
            this.maTrinhDoQlnn.setVal(maTrinhDoQlnn);
            this.maTrinhDoTinHoc.setVal(maTrinhDoTinHoc);
            this.danToc.setVal(danToc);
            this.tonGiao.setVal(tonGiao);

            this.thuongTru.value(thuongTruMaTinh, thuongTruMaHuyen, thuongTruMaXa, thuongTruSoNha);
            this.hienTai.value(hienTaiMaTinh, hienTaiMaHuyen, hienTaiMaXa, hienTaiSoNha);
            this.nguyenQuan.value(maTinhNguyenQuan, maHuyenNguyenQuan, maXaNguyenQuan);
            this.noiSinh.value(maTinhNoiSinh, maHuyenNoiSinh, maXaNoiSinh);

            this.dangONuocNgoai.setVal(dangONuocNgoai);
            this.phai.setVal(phai);
            this.nhomMau.setVal(nhomMau);
            this.soBhxh.setVal(soBhxh);
            this.quanHamCaoNhat.setVal(quanHamCaoNhat);
            this.ngayNhapNgu.setVal(ngayNhapNgu);
            this.ngayXuatNgu.setVal(ngayXuatNgu);
            this.hangThuongBinh.setVal(hangThuongBinh);
            this.giaDinhChinhSach.setVal(giaDinhChinhSach);
            this.danhHieu.setVal(danhHieu);
            this.soTruong.setVal(soTruong);
            this.sucKhoe.setVal(sucKhoe);
            this.canNang.setVal(canNang);
            this.chieuCao.setVal(chieuCao);
            this.ngheNghiepCu.setVal(ngheNghiepCu);
            this.chucDanh.setVal(chucDanh);
            this.hocVi.setVal(hocVi);
            this.chuyenNganh.setVal(chuyenNganh);
            this.namChucDanh.setVal(namChucDanh);
            this.namHocVi.setVal(namHocVi);
            this.trinhDoPhoThong.setVal(trinhDoPhoThong);
        }

        if (this.state.doanVien) {
            this.ngayVaoDoan.setVal(ngayVaoDoan);
            this.noiVaoDoan.setVal(noiVaoDoan);
        }
        if (this.state.dangVien && this.state.canBo) {
            console.log(this.state.dangVien);
            this.ngayVaoDang.setVal(ngayVaoDang);
            this.ngayVaoDangChinhThuc.setVal(ngayVaoDangChinhThuc);
            this.noiDangDb.setVal(noiDangDb);
            this.noiDangCt.setVal(noiDangCt);
            this.soTheDang.setVal(soTheDang);
        }

        if (this.state.nuocNgoai && this.state.canBo) this.lyDoONuocNgoai.setVal(lyDoONuocNgoai);

    };

    getVal = () => ({
        shcc: this.shcc.getFormVal(),
        ho: this.shcc.getFormVal(),
        ten: this.shcc.getFormVal(),
        biDanh: this.biDanh.getFormVal(),
        cmnd: this.cmnd.getFormVal(),
        cmndNgayCap: this.cmndNgayCap.getFormVal(),
        cmndNoiCap: this.cmndNoiCap.getFormVal(),
        ngaySinh: this.ngaySinh.getFormVal(),
        dienThoaiCaNhan: this.dienThoaiCaNhan.getFormVal(),
        dienThoaiBaoTin: this.dienThoaiBaoTin.getFormVal(),
        email: this.email.getFormVal(),
        quocGia: this.quocGia.getFormVal(),
        emailCaNhan: this.emailCaNhan.getFormVal(),
        doanVien: this.doanVien.getFormVal(),
        dangVien: this.dangVien.getFormVal(),
        ngayVaoDoan: this.state.doanVien ? this.ngayVaoDoan.getFormVal() : {},
        noiVaoDoan: this.state.doanVien ? this.noiVaoDoan.getFormVal() : {},
        soTheDang: this.state.dangVien ? this.soTheDang.getFormVal() : {},
        ngayVaoDang: this.state.dangVien ? this.ngayVaoDang.getFormVal() : {},
        ngayVaoDangChinhThuc: this.state.dangVien ? this.ngayVaoDangChinhThuc.getFormVal() : {},
        noiDangDb: this.state.dangVien ? this.noiDangDb.getFormVal() : {},
        noiDangCt: this.state.dangVien ? this.noiDangCt.getFormVal() : {},
        maTrinhDoLlct: this.maTrinhDoLlct.getFormVal(),
        maTrinhDoQlnn: this.maTrinhDoQlnn.getFormVal(),
        maTrinhDoTinHoc: this.maTrinhDoTinHoc.getFormVal(),
        danToc: this.danToc.getFormVal(),
        tonGiao: this.tonGiao.getFormVal(),
        dangONuocNgoai: this.dangONuocNgoai.getFormVal(),
        lyDoONuocNgoai: this.state.nuocNgoai ? this.lyDoONuocNgoai.getFormVal() : '',
        phai: this.phai.getFormVal(),
        nhomMau: this.nhomMau.getFormVal(),
        soBhxh: this.soBhxh.getFormVal(),
        quanHamCaoNhat: this.quanHamCaoNhat.getFormVal(),
        ngayNhapNgu: this.ngayNhapNgu.getFormVal(),
        ngayXuatNgu: this.ngayXuatNgu.getFormVal(),
        hangThuongBinh: this.hangThuongBinh.getFormVal(),
        giaDinhChinhSach: this.giaDinhChinhSach.getFormVal(),
        danhHieu: this.danhHieu.getFormVal(),
        soTruong: this.soTruong.getFormVal(),
        sucKhoe: this.sucKhoe.getFormVal(),
        canNang: this.canNang.getFormVal(),
        chieuCao: this.chieuCao.getFormVal(),
        ngheNghiepCu: this.ngheNghiepCu.getFormVal(),
        chucDanh: this.chucDanh.getFormVal(),
        hocVi: this.hocVi.getFormVal(),
        chuyenNganh: this.chuyenNganh.getFormVal(),
        namChucDanh: this.namChucDanh.getFormVal(),
        namHocVi: this.namHocVi.getFormVal(),
        trinhDoPhoThong: this.trinhDoPhoThong.getFormVal(),
    })

    saveCommon = (e) => {
        e.preventDefault();
        const sexObject = { 'Nam': '01', 'Nữ': '02' };
        let phai = this.phai.getSelectedItem(),
            ngaySinh = $('#ngaySinh').val() || null,
            changes = { dienThoai: $('#dienThoai').val() };
        if (phai && sexObject[phai]) changes.phai = sexObject[phai];
        if (ngaySinh) changes.ngaySinh = T.formatDate(ngaySinh).getTime();
        this.props.updateProfile(changes);
    }

    save = () => {
        const form = this.getFormVal();
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
        const dcNguyenQuan = {
            maXaNguyenQuan: this.nguyenQuan.value().maPhuongXa,
            maHuyenNguyenQuan: this.nguyenQuan.value().maQuanHuyen,
            maTinhNguyenQuan: this.nguyenQuan.value().maTinhThanhPho
        };
        const dcNoiSinh = {
            maXaNoiSinh: this.noiSinh.value().maPhuongXa,
            maHuyenNoiSinh: this.noiSinh.value().maQuanHuyen,
            maTinhNoiSinh: this.noiSinh.value().maTinhThanhPho
        };
        this.main.classList.add('validated');
        form.data && this.props.updateStaffUser(Object.assign(form.data, dcThuongTru, dcHienTai, dcNguyenQuan, dcNoiSinh), () => this.main.classList.remove('validated'));
    };

    createQuanHe = (e, type) => {
        e.preventDefault();
        this.modal.show(null, type, this.state.canBo.shcc);
    }
    editQuanHe = (e, item) => {
        this.modal.show(item, null, this.state.canBo.shcc);
        e.preventDefault();
    }
    deleteQuanHe = (e, item) => {
        T.confirm('Xóa thông tin người thân', 'Bạn có chắc bạn muốn xóa mục này?', true, isConfirm =>
            isConfirm && this.props.deleteQuanHeStaffUser(item.id, item.shcc));
        e.preventDefault();
    }

    createTrinhDoNN = (e) => {
        e.preventDefault();
        this.modalNN.show(null, this.state.canBo.shcc);
    }

    editTrinhDoNN = (e, item) => {
        this.modalNN.show(item, this.state.canBo.shcc);
        e.preventDefault();
    }

    deleteTrinhDoNN = (e, item) => {
        T.confirm('Xóa thông tin trình độ ngoại ngữ', 'Bạn có chắc bạn muốn xóa mục này?', true, isConfirm =>
            isConfirm && this.props.deleteTrinhDoNNStaffUser(item.id, () => this.props.getStaffEdit(this.state.canBo.shcc)));
        e.preventDefault();
    }
    copyAddress = e => {
        e.preventDefault();
        const dataThuongTru = this.thuongTru.value();
        this.hienTai.value(dataThuongTru.maTinhThanhPho, dataThuongTru.maQuanHuyen, dataThuongTru.maPhuongXa, dataThuongTru.soNhaDuong);
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
            <main ref={e => this.main = e} className='app-content'>
                <div className='app-title'>
                    <h1><i className='fa fa-user' /> Thông tin cá nhân</h1>
                </div>
                {!this.state.canBo ? <div className='tile' >
                    <h3 className='tile-title'>Thông tin cá nhân</h3>
                    <div className='tile-body' >
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
                                    <Dropdown ref={e => this.phai = e} text='' items={T.sexes} />
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
                                    <ImageBox ref={e => this.imageBox = e} postUrl='/user/upload' uploadType='ProfileImage' userData='profile' image={this.state.user && this.state.user.image} />
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
                                <ImageBox ref={e => this.imageBox = e} postUrl='/user/upload' uploadType='ProfileImage' userData='profile' image={this.state.user && this.state.user.image} />
                            </div>
                            <div className='form-group col-md-9'>
                                <div className='row'>
                                    <div className='form-group col-md-4'><TextInput ref={e => this.shcc = e} label='Mã thẻ cán bộ' readOnly placeholder='Nhập mã thẻ cán bộ' maxLength={10} re /></div>
                                    <div className='form-group col-md-4'><TextInput ref={e => this.ho = e} label='Họ và tên lót' required maxLength={100} /></div>
                                    <div className='form-group col-md-4'><TextInput ref={e => this.ten = e} label='Tên' required maxLength={30} /></div>
                                    <div className='form-group col-md-4'><TextInput ref={e => this.biDanh = e} label='Bí danh' maxLength={20} /></div>
                                    <div className='form-group col-md-4'><DateInput ref={e => this.ngaySinh = e} label='Ngày sinh' min={new Date(1900, 1, 1).getTime()} max={Date.nextYear(-10).roundDate().getTime()} /></div>
                                    <div className='form-group col-md-4'><Select ref={e => this.phai = e} adapter={SelectAdapter_DmGioiTinh} label='Giới tính' required /></div>
                                </div>
                            </div>
                            <div className='form-group col-md-4'><TextInput ref={e => this.cmnd = e} label='CMND/CCCD' placeholder='Nhập CMND / CCCD' maxLength={15} /></div>
                            <div className='form-group col-md-4'><DateInput ref={e => this.cmndNgayCap = e} label='Ngày cấp' min={new Date(1900, 1, 1).getTime()} max={new Date().getTime()} /></div>
                            <div className='form-group col-md-4'><TextInput ref={e => this.cmndNoiCap = e} label='Nơi cấp CMND/CCCD' placeholder='Nhập nơi cấp cmnd' maxLength={200} /></div>
                            <div className='form-group col-md-6'><TextInput ref={e => this.emailCaNhan = e} label='Địa chỉ email cá nhân' maxLength={50} /></div>
                            <div className='form-group col-md-6'><TextInput ref={e => this.email = e} label='Địa chỉ email trường' maxLength={50} /></div>
                            <div className='form-group col-md-4'><TextInput ref={e => this.dienThoaiCaNhan = e} label='Số điện thoại cá nhân' maxLength={20} /></div>
                            <div className='form-group col-md-4'><TextInput ref={e => this.dienThoaiBaoTin = e} label='Số điện thoại báo tin' maxLength={20} /></div>
                            <div className='form-group col-md-4'><TextInput ref={e => this.soBhxh = e} label='Số BHXH' /></div>
                            <div className='form-group col-xl-3 col-md-6'><Select ref={e => this.nhomMau = e} adapter={SelectAdapter_DmNhomMau} label='Nhóm máu' /></div>
                            <div className='form-group col-xl-3 col-md-6'><Select ref={e => this.danToc = e} adapter={SelectAdapter_DmDanToc} label='Dân tộc' required /></div>
                            <div className='form-group col-xl-3 col-md-6'><Select ref={e => this.quocGia = e} adapter={SelectAdapter_DmQuocGia} label='Quốc gia' required /></div>
                            <div className='form-group col-xl-3 col-md-6'><Select ref={e => this.tonGiao = e} adapter={SelectAdapter_DmTonGiao} label='Tôn giáo' required /></div>
                            <div className='form-group col-12' />
                            <ComponentDiaDiem ref={e => this.nguyenQuan = e} label='Nguyên quán' className='col-md-12' />
                            <ComponentDiaDiem ref={e => this.noiSinh = e} label='Nơi sinh' className='col-md-12' />
                            <ComponentDiaDiem ref={e => this.thuongTru = e} label='Địa chỉ thường trú' className='col-md-12' requiredSoNhaDuong={true} />
                            <p className='col-md-12'>
                                Nếu <b>Địa chỉ thường trú</b> là <b>Địa chỉ hiện tại</b> thì&nbsp;<a href='#' onClick={this.copyAddress}>nhấp vào đây</a>.
                            </p>
                            <ComponentDiaDiem ref={e => this.hienTai = e} label='Địa chỉ hiện tại' className='col-md-12' requiredSoNhaDuong={true} />
                            <div className='form-group col-md-4'><TextInput ref={e => this.sucKhoe = e} label='Sức khỏe' maxLength={100} /></div>
                            <div className='form-group col-md-4'><NumberInput ref={e => this.canNang = e} label='Cân nặng(kg)' min={0} step={0.1} /></div>
                            <div className='form-group col-md-4'><NumberInput ref={e => this.chieuCao = e} label='Chiều cao(cm)' min={0} step={1} /></div>
                            <div className='form-group col-md-6'><TextInput ref={e => this.soTruong = e} label='Sở trường' maxLength={100} /></div>
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
                            <div className='form-group col-md-4'><DateInput ref={e => this.ngayBatDauCongTac = e} label='Ngày bắt đầu công tác' min={new Date(1900, 1, 1).getTime()} max={new Date().getTime()} /></div>
                            <div className='form-group col-md-4'><DateInput ref={e => this.ngayBienChe = e} label='Ngày biên chế' min={new Date(1900, 1, 1).getTime()} max={new Date().getTime()} /></div>
                            <div className='form-group col-md-4'><TextInput ref={e => this.ngheNghiepCu = e} label='Nghế nghiệp trước khi tuyển dụng' maxLength={200} /></div>
                            {item.nhaGiaoNhanDan ? renderFieldText('form-group col-md-3', 'Nhà giáo nhân dân', item.nhaGiaoNhanDan, item.nhaGiaoNhanDan) : null}
                            {item.nhaGiaoUuTu ? renderFieldText('form-group col-md-3', 'Nhà giáo ưu tú', item.nhaGiaoUuTu, item.nhaGiaoUuTu) : null}
                            <div className='form-group col-md-6'><Select ref={e => this.maDonVi = e} adapter={SelectAdapter_DmDonVi} label='Đơn vị công tác' /> </div>
                            <div className='form-group col-md-3'><Select ref={e => this.maTrinhDoLlct = e} adapter={SelectAdapter_DmTrinhDoLyLuanChinhTri} label='Trình độ lý luận chính trị' /></div>
                            <div className='form-group col-md-3'><Select ref={e => this.maTrinhDoQlnn = e} adapter={SelectAdapter_DmTrinhDoQuanLyNhaNuoc} label='Trình độ quản lý nhà nước' /></div>
                            <div className='col-12' />
                            <div className='form-group col-md-3'><Select ref={e => this.maTrinhDoTinHoc = e} adapter={SelectAdapter_DmTrinhDoTinHoc} label='Trình độ tin học' /></div>
                            <div className='form-group col-md-4'><Select ref={e => this.maChucVu = e} adapter={SelectAdapter_DmChucVu} label='Chức vụ chính quyền' /></div>
                            <div className='form-group col-md-3'><TextInput ref={e => this.chucVuDoanThe = e} label='Chức vụ đoàn thể' maxLength={200} /></div>
                            <div className='col-12' />
                            <div className='form-group col-md-4'><TextInput ref={e => this.chucVuKiemNhiem = e} label='Chức vụ kiêm nhiệm' maxLength={200} /></div>
                            <div className='form-group col-md-4'><TextInput ref={e => this.chucVuKhac = e} label='Chức vụ khác' maxLength={200} /></div>
                            <div className='col-12' />
                            <div className='form-group col-md-12'><BooleanInput ref={e => this.doanVien = e} label='Đoàn viên:&nbsp;' onChange={value => this.setState({ doanVien: value })} /></div>
                            <div className='form-group col-md-12' style={{ display: this.state.doanVien ? 'block' : 'none' }}>
                                <div className='row' >
                                    <div className='form-group col-md-4'><DateInput ref={e => this.ngayVaoDoan = e} label='Ngày vào Đoàn' required min={new Date(1900, 1, 1).getTime()} max={new Date().getTime()} /></div>
                                    <div className='form-group col-md-8'><TextInput ref={e => this.noiVaoDoan = e} label='Nơi vào Đoàn' maxLength={200} required /></div>
                                </div>
                            </div>
                            <div className='col-12' />
                            <div className='form-group col-md-12'><BooleanInput ref={e => this.dangVien = e} label='Đảng viên:&nbsp;' onChange={value => this.setState({ dangVien: value })} /></div>
                            <div className='form-group col-md-12' style={{ display: this.state.dangVien ? 'block' : 'none' }}>
                                <div className='row'>
                                    <div className='form-group col-md-4'><DateInput ref={e => this.ngayVaoDang = e} label='Ngày vào Đảng (dự bị)' required min={new Date(1900, 1, 1).getTime()} max={new Date().getTime()} /></div>
                                    <div className='form-group col-md-8'><TextInput ref={e => this.noiDangDb = e} label='Nơi vào Đảng (dự bị)' maxLength={200} /></div>
                                    <div className='form-group col-md-4'><DateInput ref={e => this.ngayVaoDangChinhThuc = e} label='Ngày vào Đảng chính thức' min={new Date(1900, 1, 1).getTime()} max={new Date().getTime()} /></div>
                                    <div className='form-group col-md-8'><TextInput ref={e => this.noiDangCt = e} label='Nơi vào Đảng chính thức' maxLength={200} /></div>
                                    <div className='form-group col-md-6'><TextInput ref={e => this.soTheDang = e} label='Số thẻ Đảng' maxLength={200} /></div>
                                    <div className='form-group col-md-6'><TextInput ref={e => this.chucVuDang = e} label='Chức vụ Đảng' maxLength={200} /></div>
                                </div>
                            </div>
                            <div className='col-12' />
                            <div className='form-group col-md-12'>
                                <BooleanInput ref={e => this.dangONuocNgoai = e} label='Đang ở nước ngoài:&nbsp;' onChange={value => this.setState({ nuocNgoai: value })} />
                            </div>
                            <div className='form-group col-md-12'>
                                {this.state.nuocNgoai && <TextInput ref={e => this.lyDoONuocNgoai = e} label='Lý do ở nước ngoài' maxLength={200} />}
                            </div>
                            <div className='form-group col-md-4'><TextInput ref={e => this.quanHamCaoNhat = e} label='Quân hàm cao nhất' /></div>
                            <div className='form-group col-md-4'><DateInput ref={e => this.ngayNhapNgu = e} type='year' label='Năm nhập ngũ (yyyy)' /></div>
                            <div className='form-group col-md-4'><DateInput ref={e => this.ngayXuatNgu = e} type='year' label='Năm xuất ngũ (yyyy)' /></div>
                            <div className='form-group col-md-4'><TextInput ref={e => this.hangThuongBinh = e} label='Hạng thương binn' /></div>
                            <div className='form-group col-md-4'><TextInput ref={e => this.giaDinhChinhSach = e} label='Gia đình chính sách' /></div>
                            <div className='form-group col-md-4'><TextInput ref={e => this.danhHieu = e} label='Danh hiệu' /></div>
                            {item.phucLoi ? renderFieldText('form-group col-12', 'Phúc lợi', item.phucLoi, item.phucLoi) : null}
                        </div>
                    </div>,
                    <div className='tile' key={3}>
                        <h3 className='tile-title'>Trình độ học vấn</h3>
                        <div className='tile-body row'>
                            <div className='form-group col-xl-4 col-md-6'><Select ref={e => this.chucDanh = e} adapter={SelectAdapter_DmChucDanhKhoaHoc} label='Chức danh' /></div>
                            <div className='form-group col-xl-4 col-md-6'><DateInput ref={e => this.namHocVi = e} label='Năm công nhận chức danh' type='year' min={Date.getDateInputDefaultMin()} max={new Date().getTime()} /></div>
                            <div className='form-group col-xl-4 col-md-6'><Select ref={e => this.hocVi = e} adapter={SelectAdapter_DmTrinhDo} label='Học vị' /></div>
                            <div className='form-group col-xl-4 col-md-6'><DateInput ref={e => this.namChucDanh = e} label='Năm công nhận học vị' type='year' min={Date.getDateInputDefaultMin()} max={new Date().getTime()} /></div>
                            <div className='form-group col-xl-4 col-md-6'><TextInput ref={e => this.chuyenNganh = e} label='Chuyên ngành' /></div>
                            <div className='form-group col-xl-4 col-md-6'><TextInput ref={e => this.trinhDoPhoThong = e} label='Trình độ phổ thông' /></div>
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
                    <RelationModal key={6} ref={e => this.modal = e} create={this.props.createQuanHeStaffUser} update={this.props.updateQuanHeStaffUser} />,
                    <TrinhDoNNModal key={7} ref={e => this.modalNN = e} create={this.props.createTrinhDoNNStaffUser} update={this.props.updateTrinhDoNNStaffUser} getData={this.props.userGetStaff} />
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

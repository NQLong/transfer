import React from 'react';
import { connect } from 'react-redux';
import { updateProfile } from '../_init/reduxSystem';
// import Dropdown from 'view/component/Dropdown';
import ImageBox from 'view/component/ImageBox';
import { userGetStaff, updateStaffUser, createQuanHeStaffUser, updateQuanHeStaffUser, deleteQuanHeStaffUser } from 'modules/mdTccb/tccbCanBo/redux';
import { SelectAdapter_DmGioiTinh } from 'modules/mdDanhMuc/dmGioiTinh/redux';
import { SelectAdapter_DmTrinhDoLyLuanChinhTri } from 'modules/mdDanhMuc/dmTrinhDoLyLuanChinhTri/redux';
import { SelectAdapter_DmTrinhDoQuanLyNhaNuoc } from 'modules/mdDanhMuc/dmTrinhDoQuanLyNhaNuoc/redux';
import { SelectAdapter_DmNgoaiNgu, getDmNgoaiNguAll } from 'modules/mdDanhMuc/dmNgoaiNgu/redux';
import { createTrinhDoNNStaffUser, updateTrinhDoNNStaffUser, deleteTrinhDoNNStaffUser } from 'modules/mdTccb/trinhDoNgoaiNgu/redux';
import { SelectAdapter_DmTrinhDoTinHoc } from 'modules/mdDanhMuc/dmTrinhDoTinHoc/redux';
import { SelectAdapter_DmDanToc } from 'modules/mdDanhMuc/dmDanToc/redux';
import { SelectAdapter_DmTonGiao } from 'modules/mdDanhMuc/dmTonGiao/redux';
// import { SelectAdapter_DmTinhThanhPho } from 'modules/mdDanhMuc/dmDiaDiem/reduxTinhThanhPho';
// import { SelectAdapter_DmQuanHuyen } from 'modules/mdDanhMuc/dmDiaDiem/reduxQuanHuyen';
// import { SelectAdapter_DmPhuongXa } from 'modules/mdDanhMuc/dmDiaDiem/reduxPhuongXa';
import { SelectAdapter_DmQuanHeGiaDinh, getDmQuanHeGiaDinhAll } from 'modules/mdDanhMuc/dmQuanHeGiaDinh/redux';
import { getDmDonViAll, SelectAdapter_DmDonVi } from 'modules/mdDanhMuc/dmDonVi/redux';
import { getDmBoMonAll } from 'modules/mdDanhMuc/dmBoMon/redux';

import { getDmChucVuAll } from 'modules/mdDanhMuc/dmChucVu/redux';
import { SelectAdapter_DmNhomMau } from 'modules/mdDanhMuc/dmBenhVien/reduxNhomMau';
import { SelectAdapter_DmQuocGia } from 'modules/mdDanhMuc/dmQuocGia/redux';
// import { SelectAdapter_DmChucDanhKhoaHoc } from 'modules/mdDanhMuc/dmChucDanhKhoaHoc/redux';
import { SelectAdapter_DmTrinhDo } from 'modules/mdDanhMuc/dmTrinhDo/redux';
import TextInput, {NumberInput, BooleanInput, TextareaInput } from 'view/component/Input';
import {Select} from 'view/component/Input';
import { DateInput } from 'view/component/Input';
import { QTForm } from 'view/component/Form';
import { ComponentDiaDiem } from 'modules/mdDanhMuc/dmDiaDiem/componentDiaDiem';
import { TableCell, renderTable, AdminModal, FormSelect, FormRichTextBox, FormCheckbox, FormTextBox } from 'view/component/AdminPage';
// import { createQTHTCTStaffUser, updateQTHTCTStaffUser, deleteQTHTCTStaffUser } from 'modules/mdTccb/qtHocTapCongTac/redux.jsx';
import { createQtDaoTaoStaffUser, updateQtDaoTaoStaffUser, deleteQtDaoTaoStaffUser } from 'modules/mdTccb/qtDaoTao/redux.jsx';
import { createQtNuocNgoaiStaffUser, updateQtNuocNgoaiStaffUser, deleteQtNuocNgoaiStaffUser } from 'modules/mdTccb/qtNuocNgoai/redux.jsx';
import { createQtKhenThuongStaffUser, updateQtKhenThuongStaffUser, deleteQtKhenThuongStaffUser } from 'modules/mdTccb/qtKhenThuong/redux.jsx';
import { createQtKyLuatStaffUser, updateQtKyLuatStaffUser, deleteQtKyLuatStaffUser } from 'modules/mdTccb/qtKyLuat/redux.jsx';
import { createQtNckhStaffUser, updateQtNckhStaffUser, deleteQtNckhStaffUser } from 'modules/mdTccb/qtNghienCuuKhoaHoc/redux.jsx';
import { createQtHuongDanLVStaffUser, updateQtHuongDanLVStaffUser, deleteQtHuongDanLVStaffUser } from 'modules/mdTccb/qtHuongDanLuanVan/redux.jsx';
import { createSachGTStaffUser, updateSachGTStaffUser, deleteSachGTStaffUser } from 'modules/mdTccb/sachGiaoTrinh/redux.jsx';
import { createQtBaiVietKhoaHocStaffUser, updateQtBaiVietKhoaHocStaffUser, deleteQtBaiVietKhoaHocStaffUser } from 'modules/mdTccb/qtBaiVietKhoaHoc/redux.jsx';
import { createQtKyYeuStaffUser, updateQtKyYeuStaffUser, deleteQtKyYeuStaffUser } from 'modules/mdTccb/qtKyYeu/redux.jsx';
import { createQtGiaiThuongStaffUser, updateQtGiaiThuongStaffUser, deleteQtGiaiThuongStaffUser } from 'modules/mdTccb/qtGiaiThuong/redux.jsx';
import { createQtBangPhatMinhStaffUser, updateQtBangPhatMinhStaffUser, deleteQtBangPhatMinhStaffUser } from 'modules/mdTccb/qtBangPhatMinh/redux.jsx';
import { createQtUngDungThuongMaiStaffUser, updateQtUngDungThuongMaiStaffUser, deleteQtUngDungThuongMaiStaffUser } from 'modules/mdTccb/qtUngDungThuongMai/redux.jsx';
import { createQtLamViecNgoaiStaffUser, updateQtLamViecNgoaiStaffUser, deleteQtLamViecNgoaiStaffUser } from 'modules/mdTccb/qtLamViecNgoai/redux.jsx';
import Loading from 'view/component/Loading';
import { SelectAdapter_DmBenhVien } from 'modules/mdDanhMuc/dmBenhVien/reduxBenhVien';
import { SelectAdapter_DmNgachCdnn } from 'modules/mdDanhMuc/dmNgachCdnn/redux';
import { SelectAdapter_DmDienHopDong } from 'modules/mdDanhMuc/dmDienHopDong/redux';
import { SelectAdapter_DmLoaiHopDong } from 'modules/mdDanhMuc/dmLoaiHopDong/redux';

const dateType = [
    { id: 'yyyy', text: 'yyyy' },
    { id: 'mm/yyyy', text: 'mm/yyyy' },
    { id: 'dd/mm/yyyy', text: 'dd/mm/yyyy' }
], typeMapper = {
    'yyyy': 'year',
    'mm/yyyy': 'month',
    'dd/mm/yyyy': 'date'
}, quocTeList = [
    { id: 0, text: 'Trong nước' },
    { id: 1, text: 'Quốc tế' },
    { id: 2, text: 'Trong và ngoài nước' }
];

class RelationModal extends AdminModal {
    state = {
        id: null,
        email: '',
        type: null
    }

    onShow = (item, type, email) => {
        let { id, hoTen, moiQuanHe, namSinh, ngheNghiep, noiCongTac, diaChi, queQuan } = item ? item : { id: null, hoTen: '', moiQuanHe: '', namSinh: '', ngheNghiep: '', noiCongTac: '', diaChi: '', queQuan: '' };
        this.setState({ email, id, type });
        setTimeout(() => {
            this.hoTen.value(hoTen ? hoTen : '');
            this.moiQuanHe.setVal(moiQuanHe ? moiQuanHe : null);
            this.namSinh.setVal(namSinh ? namSinh : null);
            this.ngheNghiep.value(ngheNghiep ? ngheNghiep : '');
            this.noiCongTac.value(noiCongTac ? noiCongTac : '');
            this.diaChi.value(diaChi ? diaChi : '');
            this.queQuan.value(queQuan ? queQuan : '');
        }, 500);
    }

    onSubmit = () => {
        const id = this.state.id,
            email = this.state.email,
            type = this.state.type,
            changes = {
                hoTen: this.hoTen.value(),
                moiQuanHe: this.moiQuanHe.getVal(),
                namSinh: this.namSinh.getVal(),
                ngheNghiep: this.ngheNghiep.value(),
                noiCongTac: this.noiCongTac.value(),
                diaChi: this.diaChi.value(),
                queQuan: this.queQuan.value()
            };
        if (id) {
            this.props.update(id, changes, email, error => {
                if (error == undefined || error == null) {
                    this.hide();
                }
            });
        } else {
            changes.email = email;
            changes.type = type;
            this.props.create(changes, email, () => {
                this.hide();
            });
        }
    }

    render = () => this.renderModal({
        title: 'Thông tin quan hệ gia đình',
        size: 'large',
        body: <div className='row'>
            <FormTextBox className='col-md-6' ref={e => this.hoTen = e} label='Họ tên' />
            <div className='col-md-6'><Select ref={e => this.moiQuanHe = e} adapter={SelectAdapter_DmQuanHeGiaDinh} label='Mối quan hệ' /></div>
            <FormTextBox className='col-md-8' ref={e => this.ngheNghiep = e} label='Nghề nghiệp' />
            <div className='col-md-4'><DateInput ref={e => this.namSinh = e} label='Năm sinh (yyyy)' type='year' /></div>
            <FormTextBox className='col-md-12' ref={e => this.noiCongTac = e} label='Nơi công tác' />
            <FormTextBox className='col-md-12' ref={e => this.queQuan = e} label='Nguyên quán' />
            <FormTextBox className='col-md-12' ref={e => this.diaChi = e} label='Địa chỉ hiện tại' />
        </div>,
    });
}

class TrinhDoNNModal extends AdminModal {
    state = {
        id: null,
        email: '',
    }

    onShow = (item, email) => {
        let { id, loaiNgonNgu, trinhDo } = item ? item : { id: null, loaiNgonNgu: null, trinhDo: '' };
        this.setState({ email, id });
        setTimeout(() => {
            this.loaiNgonNgu.setVal(loaiNgonNgu);
            this.trinhDo.value(trinhDo);
        }, 500);
    }

    onSubmit = () => {
        const id = this.state.id,
            email = this.state.email,
            changes = {
                loaiNgonNgu: this.loaiNgonNgu.getVal(),
                trinhDo: this.trinhDo.value()
            };
        if (id) {
            this.props.update(id, changes, error => {
                if (error == undefined || error == null) {
                    this.props.getData(email);
                    this.hide();
                }
            });
        } else {
            changes.email = email;
            this.props.create(changes, () => {
                this.props.getData(email);
                this.hide();
            });
        }
    }

    render = () => this.renderModal({
        title: 'Thông tin ngoại ngữ',
        size: 'large',
        body: <div className='row'>
            <div className='col-md-6'><Select ref={e => this.loaiNgonNgu = e} adapter={SelectAdapter_DmNgoaiNgu} label='Loại ngôn ngữ' required /></div>
            <FormTextBox className='col-md-6' ref={e => this.trinhDo = e} label='Trình độ' />
        </div>,
    });
}

// class HocTapCongTacModal extends AdminModal {
//     state = {
//         id: null,
//         email: '',
//         batDau: '',
//         ketThuc: '',
//         batDauType: 'dd/mm/yyyy',
//         ketThucType: 'dd/mm/yyyy',
//         toDay: false,
//     }

//     onShow = (item, email) => {
//         this.batDau.clear();
//         this.ketThuc.clear();
//         let { id, batDauType, ketThucType, batDau, ketThuc, noiDung } = item ? item : { id: null, batDauType: 'dd/mm/yyyy', ketThucType: 'dd/mm/yyyy', batDau: null, ketThuc: null, noiDung: '' };
//         this.setState({ batDauType: batDauType ? batDauType : 'dd/mm/yyyy', ketThucType: ketThuc && ketThuc != -1 ? ketThucType : 'dd/mm/yyyy', email, id, batDau, ketThuc, toDay: ketThuc == -1 ? true : false });
//         setTimeout(() => {
//             this.batDauType.value(batDauType ? batDauType : 'dd/mm/yyyy');
//             if (ketThuc && ketThuc != -1) this.ketThucType.value(ketThucType); else this.ketThucType.value('dd/mm/yyyy');
//             this.batDau.setVal(batDau);
//             if (ketThuc && ketThuc != -1) this.ketThuc.setVal(ketThuc);
//             this.toDay.value(this.state.toDay);
//             this.noiDung.value(noiDung);
//         }, 500);
//     }

//     onSubmit = () => {
//         const id = this.state.id,
//             email = this.state.email,
//             changes = {
//                 batDau: this.batDau.getVal(),
//                 ketThuc: this.state.toDay ? -1 : this.ketThuc.getVal(),
//                 batDauType: this.state.batDauType,
//                 ketThucType: this.state.ketThucType,
//                 noiDung: this.noiDung.value()
//             };
//         if (id) {
//             this.props.update(id, changes, error => {
//                 if (error == undefined || error == null) {
//                     this.props.getData(email);
//                     this.hide();
//                 }
//             });
//         } else {
//             changes.email = email;
//             this.props.create(changes, () => {
//                 this.props.getData(email);
//                 this.hide();
//             });
//         }
//     }

//     changeType = (isBatDau, type) => {
//         if (isBatDau) {
//             this.setState({ batDauType: type });
//             this.batDau.setVal(this.state.batDau);
//         } else {
//             this.setState({ ketThucType: type });
//             if (this.state.ketThuc && this.state.ketThuc != -1) this.ketThuc.setVal(this.state.ketThuc);
//         }
//     }

//     changeToDay = (value) => {
//         this.setState({ toDay: value });
//         if (value) {
//             this.ketThuc.clear();
//         }
//     }

//     render = () => this.renderModal({
//         title: 'Thông tin học tập công tác',
//         size: 'large',
//         body: <div className='row'>
//             <div className='form-group col-md-6'><DateInput ref={e => this.batDau = e} label='Bắt đầu' type={this.state.batDauType ? typeMapper[this.state.batDauType] : null} /></div>
//             <FormSelect className='col-md-6' ref={e => this.batDauType = e} label='Loại thời gian bắt đầu' data={dateType} onChange={data => this.changeType(true, data.id)} />
//             <div className='form-group col-md-6'><DateInput ref={e => this.ketThuc = e} label='Kết thúc' type={this.state.ketThucType ? typeMapper[this.state.ketThucType] : null} /></div>
//             <FormSelect className='col-md-6' ref={e => this.ketThucType = e} label='Loại thời gian kết thúc' data={dateType} onChange={data => this.changeType(false, data.id)} />
//             <FormCheckbox className='col-12' label='Vẫn đang tiếp diễn' ref={e => this.toDay = e} onChange={value => this.changeToDay(value)} />
//             <FormRichTextBox className='col-12' ref={e => this.noiDung = e} label='Nội dung' />
//         </div>,
//     });
// }

// class ToChucKhacModal extends AdminModal {
//     state = {
//         id: null,
//         email: '',
//         ngayThamGia: '',
//         ngayThamGiaType: 'dd/mm/yyyy',
//     }

//     onShow = (item, email) => {
//         this.ngayThamGia.clear();
//         let { id, tenToChuc, ngayThamGiaType, ngayThamGia, moTa } = item ? item : { id: null, tenToChuc: '', ngayThamGiaType: 'dd/mm/yyyy', ketThucType: 'dd/mm/yyyy', ngayThamGia: null, ketThuc: null, moTa: '' };
//         this.setState({ ngayThamGiaType: ngayThamGiaType ? ngayThamGiaType : 'dd/mm/yyyy', email, id, ngayThamGia });
//         setTimeout(() => {
//             this.ngayThamGiaType.value(ngayThamGiaType ? ngayThamGiaType : 'dd/mm/yyyy');
//             if (ketThuc && ketThuc != -1) this.ketThucType.value(ketThucType); else this.ketThucType.value('dd/mm/yyyy');
//             this.ngayThamGia.setVal(ngayThamGia);
//             this.tenToChuc.value(tenToChuc);
//             this.moTa.value(moTa);
//         }, 500);
//     }

//     onSubmit = () => {
//         const id = this.state.id,
//             email = this.state.email,
//             changes = {
//                 tenToChuc: this.tenToChuc.value(),
//                 ngayThamGia: this.ngayThamGia.getVal(),
//                 ngayThamGiaType: this.state.ngayThamGiaType,
//                 moTa: this.moTa.value()
//             };
//         if (id) {
//             this.props.update(id, changes, error => {
//                 if (error == undefined || error == null) {
//                     this.props.getData(email);
//                     this.hide();
//                 }
//             });
//         } else {
//             changes.email = email;
//             this.props.create(changes, () => {
//                 this.props.getData(email);
//                 this.hide();
//             });
//         }
//     }

//     changeType = (isBatDau, type) => {
//         if (isBatDau) {
//             this.setState({ ngayThamGiaType: type });
//             this.ngayThamGia.setVal(this.state.ngayThamGia);
//         } else {
//             this.setState({ ketThucType: type });
//             if (this.state.ketThuc && this.state.ketThuc != -1) this.ketThuc.setVal(this.state.ketThuc);
//         }
//     }

//     changeToDay = (value) => {
//         this.setState({ toDay: value });
//         if (value) {
//             this.ketThuc.clear();
//         }
//     }

//     render = () => this.renderModal({
//         title: 'Tổ chức Chính trị - Xã hội nghề nghiệp tham gia khác',
//         size: 'large',
//         body: <div className='row'>
//             <FormTextBox className='col-md-12' ref={e => this.tenToChuc = e} lable='Tên tổ chức' required />
//             <div className='form-group col-md-6'><DateInput ref={e => this.ngayThamGia = e} label='Bắt đầu' type={this.state.ngayThamGiaType ? typeMapper[this.state.ngayThamGiaType] : null} /></div>
//             <FormSelect className='col-md-6' ref={e => this.ngayThamGiaType = e} label='Loại thời gian bắt đầu' data={dateType} onChange={data => this.changeType(true, data.id)} />
//             <FormRichTextBox className='col-12' ref={e => this.moTa = e} label='Mô tả nội dung công việc tham gia tổ chức' />
//         </div>,
//     });
// }

class DaoTaoModal extends AdminModal {
    state = {
        id: null,
        email: '',
        batDau: '',
        ketThuc: '',
        batDauType: 'dd/mm/yyyy',
        ketThucType: 'dd/mm/yyyy',
        toDay: false,
    }

    onShow = (item, email) => {
        this.batDau.clear();
        this.ketThuc.clear();
        let { id, batDauType, ketThucType, batDau, ketThuc, tenTruong, chuyenNganh, hinhThuc, thoiGian, loaiBangCap } = item ? item : { id: null, batDauType: 'dd/mm/yyyy', ketThucType: 'dd/mm/yyyy', batDau: null, ketThuc: null, tenTruong: '', chuyenNganh: '', hinhThuc: '', thoiGian: null, loaiBangCap: '' };
        this.setState({ batDauType: batDauType ? batDauType : 'dd/mm/yyyy', ketThucType: ketThuc && ketThuc != -1 ? ketThucType : 'dd/mm/yyyy', email, id, batDau, ketThuc, toDay: ketThuc == -1 ? true : false });
        setTimeout(() => {
            this.batDauType.value(batDauType ? batDauType : 'dd/mm/yyyy');
            if (ketThuc && ketThuc != -1) this.ketThucType.value(ketThucType); else this.ketThucType.value('dd/mm/yyyy');
            this.batDau.setVal(batDau);
            if (ketThuc && ketThuc != -1) this.ketThuc.setVal(ketThuc);
            this.toDay.value(this.state.toDay);
            this.tenTruong.value(tenTruong);
            this.chuyenNganh.value(chuyenNganh);
            this.hinhThuc.value(hinhThuc);
            this.thoiGian.value(thoiGian);
            this.loaiBangCap.value(loaiBangCap);
        }, 500);
    }

    onSubmit = () => {
        const id = this.state.id,
            email = this.state.email,
            changes = {
                batDau: this.batDau.getVal(),
                ketThuc: this.state.toDay ? -1 : this.ketThuc.getVal(),
                batDauType: this.state.batDauType,
                ketThucType: this.state.ketThucType,
                tenTruong: this.tenTruong.value(),
                chuyenNganh: this.chuyenNganh.value(),
                hinhThuc: this.hinhThuc.value(),
                thoiGian: this.thoiGian.value(),
                loaiBangCap: this.loaiBangCap.value()
            };
        if (id) {
            this.props.update(id, changes, error => {
                if (error == undefined || error == null) {
                    this.props.getData(email);
                    this.hide();
                }
            });
        } else {
            changes.email = email;
            this.props.create(changes, () => {
                this.props.getData(email);
                this.hide();
            });
        }
    }

    changeType = (isBatDau, type) => {
        if (isBatDau) {
            this.setState({ batDauType: type });
            this.batDau.setVal(this.state.batDau);
        } else {
            this.setState({ ketThucType: type });
            if (this.state.ketThuc && this.state.ketThuc != -1) this.ketThuc.setVal(this.state.ketThuc);
        }
    }

    changeToDay = (value) => {
        this.setState({ toDay: value });
        if (value) {
            this.ketThuc.clear();
        }
    }

    render = () => this.renderModal({
        title: 'Thông tin đào tạo',
        size: 'large',
        body: <div className='row'>
            <FormTextBox className='col-12' ref={e => this.tenTruong = e} label={'Tên trường'} type='text' />
            <FormTextBox className='col-md-6' ref={e => this.chuyenNganh = e} label={'Chuyên ngành'} type='text' />
            <FormTextBox className='col-md-6' ref={e => this.hinhThuc = e} label={'Hình thức'} type='text' />
            <FormTextBox className='col-md-6' ref={e => this.loaiBangCap = e} label={'Loại bằng cấp'} type='text' />
            <FormTextBox className='col-md-6' ref={e => this.thoiGian = e} label={'Thời gian học (tháng)'} type='number' />
            <div className='form-group col-md-6'><DateInput ref={e => this.batDau = e} label='Bắt đầu' type={this.state.batDauType ? typeMapper[this.state.batDauType] : null} /></div>
            <FormSelect className='col-md-6' ref={e => this.batDauType = e} label='Loại thời gian bắt đầu' data={dateType} onChange={data => this.changeType(true, data.id)} />
            <div className='form-group col-md-6'><DateInput ref={e => this.ketThuc = e} label='Kết thúc' type={this.state.ketThucType ? typeMapper[this.state.ketThucType] : null} /></div>
            <FormSelect className='col-md-6' ref={e => this.ketThucType = e} label='Loại thời gian kết thúc' data={dateType} onChange={data => this.changeType(false, data.id)} />
            <FormCheckbox className='col-6' label='Vẫn đang tiếp diễn' ref={e => this.toDay = e} onChange={value => this.changeToDay(value)} />
        </div>,
    });
}

class NuocNgoaiModal extends AdminModal {
    state = {
        id: null,
        email: '',
        batDau: '',
        ketThuc: '',
        batDauType: 'dd/mm/yyyy',
        ketThucType: 'dd/mm/yyyy',
        toDay: false,
    }

    onShow = (item, email) => {
        this.batDau.clear();
        this.ketThuc.clear();
        let { id, batDauType, ketThucType, batDau, ketThuc, noiDung, quocGia } = item ? item : { id: null, batDauType: 'dd/mm/yyyy', ketThucType: 'dd/mm/yyyy', batDau: null, ketThuc: null, noiDung: '', quocGia: '' };
        this.setState({ batDauType: batDauType ? batDauType : 'dd/mm/yyyy', ketThucType: ketThuc && ketThuc != -1 ? ketThucType : 'dd/mm/yyyy', email, id, batDau, ketThuc, toDay: ketThuc == -1 ? true : false });
        setTimeout(() => {
            this.batDauType.value(batDauType ? batDauType : 'dd/mm/yyyy');
            if (ketThuc && ketThuc != -1) this.ketThucType.value(ketThucType); else this.ketThucType.value('dd/mm/yyyy');
            this.batDau.setVal(batDau);
            if (ketThuc && ketThuc != -1) this.ketThuc.setVal(ketThuc);
            this.toDay.value(this.state.toDay);
            this.noiDung.value(noiDung);
            this.quocGia.value(quocGia);
        }, 500);
    }

    onSubmit = () => {
        const id = this.state.id,
            email = this.state.email,
            changes = {
                batDau: this.batDau.getVal(),
                ketThuc: this.state.toDay ? -1 : this.ketThuc.getVal(),
                batDauType: this.state.batDauType,
                ketThucType: this.state.ketThucType,
                noiDung: this.noiDung.value(),
                quocGia: this.quocGia.value()
            };
        if (id) {
            this.props.update(id, changes, error => {
                if (error == undefined || error == null) {
                    this.props.getData(email);
                    this.hide();
                }
            });
        } else {
            changes.email = email;
            this.props.create(changes, () => {
                this.props.getData(email);
                this.hide();
            });
        }
    }

    changeType = (isBatDau, type) => {
        if (isBatDau) {
            this.setState({ batDauType: type });
            this.batDau.setVal(this.state.batDau);
        } else {
            this.setState({ ketThucType: type });
            if (this.state.ketThuc && this.state.ketThuc != -1) this.ketThuc.setVal(this.state.ketThuc);
        }
    }

    changeToDay = (value) => {
        this.setState({ toDay: value });
        if (value) {
            this.ketThuc.clear();
        }
    }

    render = () => this.renderModal({
        title: 'Thông tin đi nước ngoài',
        size: 'large',
        body: <div className='row'>
            <div className='form-group col-md-6'><DateInput ref={e => this.batDau = e} label='Bắt đầu' type={this.state.batDauType ? typeMapper[this.state.batDauType] : null} /></div>
            <FormSelect className='col-md-6' ref={e => this.batDauType = e} label='Loại thời gian bắt đầu' data={dateType} onChange={data => this.changeType(true, data.id)} />
            <div className='form-group col-md-6'><DateInput ref={e => this.ketThuc = e} label='Kết thúc' type={this.state.ketThucType ? typeMapper[this.state.ketThucType] : null} /></div>
            <FormSelect className='col-md-6' ref={e => this.ketThucType = e} label='Loại thời gian kết thúc' data={dateType} onChange={data => this.changeType(false, data.id)} />
            <FormCheckbox className='col-12' label='Vẫn đang tiếp diễn' ref={e => this.toDay = e} onChange={value => this.changeToDay(value)} />
            <FormTextBox className='col-12' ref={e => this.quocGia = e} label='Nơi đến' />
            <FormRichTextBox className='col-12' ref={e => this.noiDung = e} label='Nội dung' />
        </div>,
    });
}

class KhenThuongModal extends AdminModal {
    state = {
        id: null,
        email: '',
        batDau: '',
        ketThuc: '',
        batDauType: 'dd/mm/yyyy',
        ketThucType: 'dd/mm/yyyy',
        toDay: false,
    }

    onShow = (item, email) => {
        this.batDau.clear();
        this.ketThuc.clear();
        let { id, batDauType, ketThucType, batDau, ketThuc, noiDung, capQuyetDinh } = item ? item : { id: null, batDauType: 'dd/mm/yyyy', ketThucType: 'dd/mm/yyyy', batDau: null, ketThuc: null, noiDung: '', capQuyetDinh: '' };
        this.setState({ batDauType: batDauType ? batDauType : 'dd/mm/yyyy', ketThucType: ketThuc && ketThuc != -1 ? ketThucType : 'dd/mm/yyyy', email, id, batDau, ketThuc, toDay: ketThuc == -1 ? true : false });
        setTimeout(() => {
            this.batDauType.value(batDauType ? batDauType : 'dd/mm/yyyy');
            if (ketThuc && ketThuc != -1) this.ketThucType.value(ketThucType); else this.ketThucType.value('dd/mm/yyyy');
            this.batDau.setVal(batDau);
            if (ketThuc && ketThuc != -1) this.ketThuc.setVal(ketThuc);
            this.toDay.value(this.state.toDay);
            this.noiDung.value(noiDung);
            this.capQuyetDinh.value(capQuyetDinh);
        }, 500);
    }

    onSubmit = () => {
        const id = this.state.id,
            email = this.state.email,
            changes = {
                batDau: this.batDau.getVal(),
                ketThuc: this.state.toDay ? -1 : this.ketThuc.getVal(),
                batDauType: this.state.batDauType,
                ketThucType: this.state.ketThucType,
                noiDung: this.noiDung.value(),
                capQuyetDinh: this.capQuyetDinh.value()
            };
        if (id) {
            this.props.update(id, changes, error => {
                if (error == undefined || error == null) {
                    this.props.getData(email);
                    this.hide();
                }
            });
        } else {
            changes.email = email;
            this.props.create(changes, () => {
                this.props.getData(email);
                this.hide();
            });
        }
    }

    changeType = (isBatDau, type) => {
        if (isBatDau) {
            this.setState({ batDauType: type });
            this.batDau.setVal(this.state.batDau);
        } else {
            this.setState({ ketThucType: type });
            if (this.state.ketThuc && this.state.ketThuc != -1) this.ketThuc.setVal(this.state.ketThuc);
        }
    }

    changeToDay = (value) => {
        this.setState({ toDay: value });
        if (value) {
            this.ketThuc.clear();
        }
    }

    render = () => this.renderModal({
        title: 'Thông tin khen thưởng',
        size: 'large',
        body: <div className='row'>
            <div className='form-group col-md-6'><DateInput ref={e => this.batDau = e} label='Bắt đầu' type={this.state.batDauType ? typeMapper[this.state.batDauType] : null} /></div>
            <FormSelect className='col-md-6' ref={e => this.batDauType = e} label='Loại thời gian bắt đầu' data={dateType} onChange={data => this.changeType(true, data.id)} />
            <div className='form-group col-md-6'><DateInput ref={e => this.ketThuc = e} label='Kết thúc' type={this.state.ketThucType ? typeMapper[this.state.ketThucType] : null} /></div>
            <FormSelect className='col-md-6' ref={e => this.ketThucType = e} label='Loại thời gian kết thúc' data={dateType} onChange={data => this.changeType(false, data.id)} />
            <FormCheckbox className='col-12' label='Vẫn đang tiếp diễn' ref={e => this.toDay = e} onChange={value => this.changeToDay(value)} />
            <FormTextBox className='col-12' ref={e => this.capQuyetDinh = e} label='Cấp quyết định' />
            <FormRichTextBox className='col-12' ref={e => this.noiDung = e} label='Nội dung' />
        </div>,
    });
}

class KyLuatModal extends AdminModal {
    state = {
        id: null,
        email: '',
        batDau: '',
        ketThuc: '',
        batDauType: 'dd/mm/yyyy',
        ketThucType: 'dd/mm/yyyy',
        toDay: false,
    }

    onShow = (item, email) => {
        this.batDau.clear();
        this.ketThuc.clear();
        let { id, batDauType, ketThucType, batDau, ketThuc, lyDoHinhThuc, capQuyetDinh } = item ? item : { id: null, batDauType: 'dd/mm/yyyy', ketThucType: 'dd/mm/yyyy', batDau: null, ketThuc: null, lyDoHinhThuc: '', capQuyetDinh: '' };
        this.setState({ batDauType: batDauType ? batDauType : 'dd/mm/yyyy', ketThucType: ketThuc && ketThuc != -1 ? ketThucType : 'dd/mm/yyyy', email, id, batDau, ketThuc, toDay: ketThuc == -1 ? true : false });
        setTimeout(() => {
            this.batDauType.value(batDauType ? batDauType : 'dd/mm/yyyy');
            if (ketThuc && ketThuc != -1) this.ketThucType.value(ketThucType); else this.ketThucType.value('dd/mm/yyyy');
            this.batDau.setVal(batDau);
            if (ketThuc && ketThuc != -1) this.ketThuc.setVal(ketThuc);
            this.toDay.value(this.state.toDay);
            this.lyDoHinhThuc.value(lyDoHinhThuc);
            this.capQuyetDinh.value(capQuyetDinh);
        }, 500);
    }

    onSubmit = () => {
        const id = this.state.id,
            email = this.state.email,
            changes = {
                batDau: this.batDau.getVal(),
                ketThuc: this.state.toDay ? -1 : this.ketThuc.getVal(),
                batDauType: this.state.batDauType,
                ketThucType: this.state.ketThucType,
                lyDoHinhThuc: this.lyDoHinhThuc.value(),
                capQuyetDinh: this.capQuyetDinh.value()
            };
        if (id) {
            this.props.update(id, changes, error => {
                if (error == undefined || error == null) {
                    this.props.getData(email);
                    this.hide();
                }
            });
        } else {
            changes.email = email;
            this.props.create(changes, () => {
                this.props.getData(email);
                this.hide();
            });
        }
    }

    changeType = (isBatDau, type) => {
        if (isBatDau) {
            this.setState({ batDauType: type });
            this.batDau.setVal(this.state.batDau);
        } else {
            this.setState({ ketThucType: type });
            if (this.state.ketThuc && this.state.ketThuc != -1) this.ketThuc.setVal(this.state.ketThuc);
        }
    }

    changeToDay = (value) => {
        this.setState({ toDay: value });
        if (value) {
            this.ketThuc.clear();
        }
    }

    render = () => this.renderModal({
        title: 'Thông tin kỷ luật',
        size: 'large',
        body: <div className='row'>
            <div className='form-group col-md-6'><DateInput ref={e => this.batDau = e} label='Bắt đầu' type={this.state.batDauType ? typeMapper[this.state.batDauType] : null} /></div>
            <FormSelect className='col-md-6' ref={e => this.batDauType = e} label='Loại thời gian bắt đầu' data={dateType} onChange={data => this.changeType(true, data.id)} />
            <div className='form-group col-md-6'><DateInput ref={e => this.ketThuc = e} label='Kết thúc' type={this.state.ketThucType ? typeMapper[this.state.ketThucType] : null} /></div>
            <FormSelect className='col-md-6' ref={e => this.ketThucType = e} label='Loại thời gian kết thúc' data={dateType} onChange={data => this.changeType(false, data.id)} />
            <FormCheckbox className='col-12' label='Vẫn đang tiếp diễn' ref={e => this.toDay = e} onChange={value => this.changeToDay(value)} />
            <FormTextBox className='col-12' ref={e => this.lyDoHinhThuc = e} label='Lý do, hình thức kỷ luật' />
            <FormTextBox className='col-12' ref={e => this.capQuyetDinh = e} label='Cấp quyết định' />
        </div>,
    });
}

class NckhModal extends AdminModal {
    state = {
        id: null,
        email: '',
        batDau: '',
        ketThuc: '',
        batDauType: 'dd/mm/yyyy',
        ketThucType: 'dd/mm/yyyy',
        toDay: false,
    }

    onShow = (item, email) => {
        this.batDau.clear();
        this.ketThuc.clear();
        let { id, batDauType, ketThucType, batDau, ketThuc, tenDeTai, maSoCapQuanLy, kinhPhi, vaiTro, ngayNghiemThu, ketQua, ngayNghiemThuType, thoiGian } = item ? item :
            { id: null, batDauType: 'dd/mm/yyyy', ketThucType: 'dd/mm/yyyy', batDau: null, ketThuc: null, tenDeTai: '', maSoCapQuanLy: '', kinhPhi: '', vaiTro: '', ngayNghiemThu: null, ketQua: '', ngayNghiemThuType: 'dd/mm/yyyy', thoiGian: null };
        this.setState({ batDauType: batDauType ? batDauType : 'dd/mm/yyyy', ketThucType: ketThuc && ketThuc != -1 ? ketThucType : 'dd/mm/yyyy', ngayNghiemThuType: ngayNghiemThuType ? ngayNghiemThuType : 'dd/mm/yyyy', email, id, batDau, ketThuc, ngayNghiemThu, toDay: ketThuc == -1 ? true : false });
        setTimeout(() => {
            this.batDauType.value(batDauType ? batDauType : 'dd/mm/yyyy');
            if (ketThuc && ketThuc != -1) this.ketThucType.value(ketThucType); else this.ketThucType.value('dd/mm/yyyy');
            this.batDau.setVal(batDau);
            if (ketThuc && ketThuc != -1) this.ketThuc.setVal(ketThuc);
            this.toDay.value(this.state.toDay);
            this.tenDeTai.value(tenDeTai);
            this.maSoCapQuanLy.value(maSoCapQuanLy);
            this.kinhPhi.value(kinhPhi);
            this.thoiGian.value(thoiGian);
            this.vaiTro.value(vaiTro);
            this.ngayNghiemThuType.value(ngayNghiemThuType ? ngayNghiemThuType : 'dd/mm/yyyy');
            this.ngayNghiemThu.setVal(ngayNghiemThu);
            this.ketQua.value(ketQua);
        }, 500);
    }

    onSubmit = () => {
        const id = this.state.id,
            email = this.state.email,
            changes = {
                batDau: this.batDau.getVal(),
                ketThuc: this.state.toDay ? -1 : this.ketThuc.getVal(),
                batDauType: this.state.batDauType,
                ketThucType: this.state.ketThucType,
                tenDeTai: this.tenDeTai.value(),
                maSoCapQuanLy: this.maSoCapQuanLy.value(),
                kinhPhi: this.kinhPhi.value(),
                thoiGian: this.thoiGian.value(),
                vaiTro: this.vaiTro.value(),
                ketQua: this.ketQua.value(),
                ngayNghiemThu: this.ngayNghiemThu.getVal(),
                ngayNghiemThuType: this.state.ngayNghiemThuType,
            };
        if (id) {
            this.props.update(id, changes, error => {
                if (error == undefined || error == null) {
                    this.props.getData(email);
                    this.hide();
                }
            });
        } else {
            changes.email = email;
            this.props.create(changes, () => {
                this.props.getData(email);
                this.hide();
            });
        }
    }

    changeType = (feild, type) => {
        if (feild == 1) {
            this.setState({ batDauType: type });
            this.batDau.setVal(this.state.batDau);
        } else if (feild == 2) {
            this.setState({ ketThucType: type });
            if (this.state.ketThuc && this.state.ketThuc != -1) this.ketThuc.setVal(this.state.ketThuc);
        } else {
            this.setState({ ngayNghiemThuType: type });
            this.ngayNghiemThu.setVal(this.state.ngayNghiemThu);
        }
    }

    changeToDay = (value) => {
        this.setState({ toDay: value });
        if (value) {
            this.ketThuc.clear();
        }
    }

    render = () => this.renderModal({
        title: 'Thông tin nghiên cứu khoa học',
        size: 'large',
        body: <div className='row'>
            <FormTextBox className='col-12' ref={e => this.tenDeTai = e} label={'Tên đề tài'} type='text' />
            <FormTextBox className='col-md-6' ref={e => this.maSoCapQuanLy = e} label={'Mã số và cấp quản lý'} type='text' />
            <FormTextBox className='col-md-6' ref={e => this.thoiGian = e} label={'Thời gian thực hiện (tháng)'} type='number' />
            <div className='form-group col-md-6'><DateInput ref={e => this.batDau = e} label='Bắt đầu' type={this.state.batDauType ? typeMapper[this.state.batDauType] : null} /></div>
            <FormSelect className='col-md-6' ref={e => this.batDauType = e} label='Loại thời gian bắt đầu' data={dateType} onChange={data => this.changeType(1, data.id)} />
            <div className='form-group col-md-6'><DateInput ref={e => this.ketThuc = e} label='Kết thúc' type={this.state.ketThucType ? typeMapper[this.state.ketThucType] : null} /></div>
            <FormSelect className='col-md-6' ref={e => this.ketThucType = e} label='Loại thời gian kết thúc' data={dateType} onChange={data => this.changeType(2, data.id)} />
            <FormCheckbox className='col-12' label='Vẫn đang tiếp diễn' ref={e => this.toDay = e} onChange={value => this.changeToDay(value)} />
            <FormTextBox className='col-md-6' ref={e => this.kinhPhi = e} label={'Kinh phí'} type='text' />
            <FormTextBox className='col-md-6' ref={e => this.vaiTro = e} label={'Vai trò'} type='text' />
            <div className='form-group col-md-6'><DateInput ref={e => this.ngayNghiemThu = e} label='Ngày nghiệm thu' type={this.state.ngayNghiemThuType ? typeMapper[this.state.ngayNghiemThuType] : null} /></div>
            <FormSelect className='col-md-6' ref={e => this.ngayNghiemThuType = e} label='Loại thời gian nghiệm thu' data={dateType} onChange={data => this.changeType(3, data.id)} />
            <FormTextBox className='col-md-12' ref={e => this.ketQua = e} label={'Kết quả'} type='text' />

        </div>,
    });
}

class HuongDanLvModal extends AdminModal {
    state = {
        id: null,
        email: ''
    }

    onShow = (item, email) => {
        let { id, hoTen, tenLuanVan, namTotNghiep, sanPham, bacDaoTao } = item ? item : { id: null, hoTen: '', tenLuanVan: '', namTotNghiep: '', sanPham: '', bacDaoTao: '' };
        this.setState({ email, id });
        setTimeout(() => {
            this.hoTen.value(hoTen);
            this.tenLuanVan.value(tenLuanVan);
            this.namTotNghiep.setVal(new Date(namTotNghiep.toString()));
            this.sanPham.value(sanPham);
            this.bacDaoTao.value(bacDaoTao);
        }, 500);
    }

    onSubmit = () => {
        const id = this.state.id,
            email = this.state.email,
            changes = {
                hoTen: this.hoTen.value(),
                tenLuanVan: this.tenLuanVan.value(),
                namTotNghiep: new Date(this.namTotNghiep.getVal()).getFullYear(),
                sanPham: this.sanPham.value(),
                bacDaoTao: this.bacDaoTao.value()
            };
        if (id) {
            this.props.update(id, changes, error => {
                if (error == undefined || error == null) {
                    this.props.getData(email);
                    this.hide();
                }
            });
        } else {
            changes.email = email;
            this.props.create(changes, () => {
                this.props.getData(email);
                this.hide();
            });
        }
    }

    render = () => this.renderModal({
        title: 'Thông tin hướng dẫn luận văn',
        size: 'large',
        body: <div className='row'>
            <FormTextBox className='col-12' ref={e => this.hoTen = e} label={'Họ tên sinh viên'} type='text' />
            <FormTextBox className='col-12' ref={e => this.tenLuanVan = e} label={'Tên luận văn'} type='text' />
            <div className='form-group col-md-6'><DateInput ref={e => this.namTotNghiep = e} label='Năm tốt nghiệp' type='year' /></div>
            <FormTextBox className='col-md-6' ref={e => this.sanPham = e} label={'Sản phẩm'} type='text' />
            <FormTextBox className='col-md-6' ref={e => this.bacDaoTao = e} label={'Bậc đào tạo'} type='text' />
        </div>,
    });
}

class SachGTModal extends AdminModal {
    state = {
        id: null,
        email: ''
    }

    onShow = (item, email) => {
        let { id, ten, theLoai, nhaSanXuat, namSanXuat, chuBien, sanPham, butDanh, quocTe } = item ? item : { id: null, ten: '', theLoai: '', nhaSanXuat: '', namSanXuat: null, chuBien: '', sanPham: '', butDanh: '', quocTe: 0 };
        this.setState({ email, id });
        setTimeout(() => {
            this.ten.value(ten);
            this.theLoai.value(theLoai ? theLoai : '');
            if (namSanXuat) this.namSanXuat.setVal(new Date(namSanXuat.toString()));
            this.nhaSanXuat.value(nhaSanXuat ? nhaSanXuat : '');
            this.chuBien.value(chuBien ? chuBien : '');
            this.sanPham.value(sanPham ? sanPham : '');
            this.butDanh.value(butDanh ? butDanh : '');
            this.quocTe.value(quocTe);
        }, 500);
    }

    onSubmit = () => {
        const id = this.state.id,
            email = this.state.email,
            changes = {
                ten: this.ten.value(),
                theLoai: this.theLoai.value(),
                namSanXuat: this.namSanXuat.getVal() ? new Date(this.namSanXuat.getVal()).getFullYear() : null,
                nhaSanXuat: this.nhaSanXuat.value(),
                chuBien: this.chuBien.value(),
                sanPham: this.sanPham.value(),
                butDanh: this.butDanh.value(),
                quocTe: this.quocTe.value()
            };
        if (id) {
            this.props.update(id, changes, error => {
                if (error == undefined || error == null) {
                    this.props.getData(email);
                    this.hide();
                }
            });
        } else {
            changes.email = email;
            this.props.create(changes, () => {
                this.props.getData(email);
                this.hide();
            });
        }
    }

    render = () => this.renderModal({
        title: 'Thông tin sách, giáo trình',
        size: 'large',
        body: <div className='row'>
            <FormTextBox className='col-12' ref={e => this.ten = e} label={'Tên sách, giáo trình'} type='text' />
            <FormTextBox className='col-6' ref={e => this.theLoai = e} label={'Thể loại'} type='text' />
            <FormTextBox className='col-6' ref={e => this.nhaSanXuat = e} label={'Nhà sản xuất, số hiệu ISBN'} type='text' />
            <div className='form-group col-md-6'><DateInput ref={e => this.namSanXuat = e} label='Năm xuất bản' type='year' /></div>
            <FormTextBox className='col-md-6' ref={e => this.chuBien = e} label={'Chủ biên, đồng chủ biên'} type='text' />
            <FormTextBox className='col-md-6' ref={e => this.sanPham = e} label={'Sản phẩm'} type='text' />
            <FormTextBox className='col-md-6' ref={e => this.butDanh = e} label={'Bút danh'} type='text' />
            <FormSelect className='col-md-6' ref={e => this.quocTe = e} label='Quốc tế' data={quocTeList} />
        </div>,
    });
}

class BaiVietKhoaHocModal extends AdminModal {
    state = {
        id: null,
        email: ''
    }

    onShow = (item, email) => {
        let { id, tenTacGia, namXuatBan, tenBaiViet, tenTapChi, soHieuIssn, sanPham, diemIf, quocTe } = item ? item : { id: null, tenTacGia: '', namXuatBan: null, tenBaiViet: '', tenTapChi: '', soHieuIssn: '', sanPham: '', diemIf: '', quocTe: 0 };
        this.setState({ email, id });
        setTimeout(() => {
            this.tenTacGia.value(tenTacGia ? tenTacGia : '');
            this.tenBaiViet.value(tenBaiViet);
            this.namXuatBan.setVal(namXuatBan ? new Date(namXuatBan.toString()) : null);
            this.tenTapChi.value(tenTapChi ? tenTapChi : '');
            this.soHieuIssn.value(soHieuIssn ? soHieuIssn : '');
            this.sanPham.value(sanPham ? sanPham : '');
            this.diemIf.value(diemIf ? diemIf : '');
            this.quocTe.value(quocTe);
        }, 500);
    }

    onSubmit = () => {
        const id = this.state.id,
            email = this.state.email,
            changes = {
                tenTacGia: this.tenTacGia.value(),
                tenBaiViet: this.tenBaiViet.value(),
                namXuatBan: this.namXuatBan.getVal() ? new Date(this.namXuatBan.getVal()).getFullYear() : null,
                tenTapChi: this.tenTapChi.value(),
                soHieuIssn: this.soHieuIssn.value(),
                sanPham: this.sanPham.value(),
                diemIf: this.diemIf.value(),
                quocTe: this.quocTe.value()
            };
        if (id) {
            this.props.update(id, changes, error => {
                if (error == undefined || error == null) {
                    this.props.getData(email);
                    this.hide();
                }
            });
        } else {
            changes.email = email;
            this.props.create(changes, () => {
                this.props.getData(email);
                this.hide();
            });
        }
    }

    render = () => this.renderModal({
        title: 'Thông tin bài viết khoa học',
        size: 'large',
        body: <div className='row'>
            <FormTextBox className='col-12' ref={e => this.tenBaiViet = e} label={'Tên bài viết'} type='text' />
            <FormTextBox className='col-6' ref={e => this.tenTacGia = e} label={'Tên tác giả'} type='text' />
            <div className='form-group col-md-6'><DateInput ref={e => this.namXuatBan = e} label='Năm xuất bản' type='year' /></div>
            <FormTextBox className='col-12' ref={e => this.tenTapChi = e} label={'Tên tạp chí'} type='text' />
            <FormTextBox className='col-md-6' ref={e => this.soHieuIssn = e} label={'Số hiệu ISSN'} type='text' />
            <FormTextBox className='col-md-6' ref={e => this.sanPham = e} label={'Sản phẩm'} type='text' />
            <FormTextBox className='col-md-6' ref={e => this.diemIf = e} label={'Điểm IF'} type='text' />
            <FormSelect className='col-md-6' ref={e => this.quocTe = e} label='Quốc tế' data={quocTeList} />
        </div>
    });
}

class KyYeuModal extends AdminModal {
    state = {
        id: null,
        email: ''
    }

    onShow = (item, email) => {
        let { id, tenTacGia, tenBaiViet, tenHoiNghi, noiToChuc, thoiGian, sanPham, soHieuIsbn, quocTe } = item ? item : { id: null, tenTacGia: '', tenBaiViet: '', tenHoiNghi: '', noiToChuc: '', thoiGian: null, sanPham: '', soHieuIsbn: '', quocTe: 0 };
        this.setState({ email, id });
        setTimeout(() => {
            this.tenTacGia.value(tenTacGia ? tenTacGia : '');
            this.tenBaiViet.value(tenBaiViet);
            this.thoiGian.setVal(thoiGian ? new Date(thoiGian.toString()) : null);
            this.tenHoiNghi.value(tenHoiNghi ? tenHoiNghi : '');
            this.soHieuIsbn.value(soHieuIsbn ? soHieuIsbn : '');
            this.sanPham.value(sanPham ? sanPham : '');
            this.noiToChuc.value(noiToChuc ? noiToChuc : '');
            this.quocTe.value(quocTe);
        }, 500);
    }

    onSubmit = () => {
        const id = this.state.id,
            email = this.state.email,
            changes = {
                tenTacGia: this.tenTacGia.value(),
                tenBaiViet: this.tenBaiViet.value(),
                thoiGian: this.thoiGian.getVal() ? new Date(this.thoiGian.getVal()).getFullYear() : null,
                tenHoiNghi: this.tenHoiNghi.value(),
                soHieuIsbn: this.soHieuIsbn.value(),
                sanPham: this.sanPham.value(),
                noiToChuc: this.noiToChuc.value(),
                quocTe: this.quocTe.value()
            };
        if (id) {
            this.props.update(id, changes, error => {
                if (error == undefined || error == null) {
                    this.props.getData(email);
                    this.hide();
                }
            });
        } else {
            changes.email = email;
            this.props.create(changes, () => {
                this.props.getData(email);
                this.hide();
            });
        }
    }

    render = () => this.renderModal({
        title: 'Thông tin kỷ yếu hội nghị, hội thảo',
        size: 'large',
        body: <div className='row'>
            <FormTextBox className='col-6' ref={e => this.tenTacGia = e} label={'Tên tác giả'} type='text' />
            <FormTextBox className='col-12' ref={e => this.tenBaiViet = e} label={'Tên bài viết'} type='text' />
            <FormTextBox className='col-12' ref={e => this.tenHoiNghi = e} label={'Tên hội nghị'} type='text' />
            <div className='form-group col-md-6'><DateInput ref={e => this.thoiGian = e} label='Thời gian' type='year' /></div>
            <FormTextBox className='col-md-6' ref={e => this.noiToChuc = e} label={'Nơi tổ chức'} type='text' />
            <FormTextBox className='col-md-6' ref={e => this.soHieuIsbn = e} label={'Số hiệu ISBN'} type='text' />
            <FormTextBox className='col-md-6' ref={e => this.sanPham = e} label={'Sản phẩm'} type='text' />
            <FormSelect className='col-md-6' ref={e => this.quocTe = e} label='Quốc tế' data={quocTeList} />
        </div>
    });
}

class GiaiThuongModal extends AdminModal {
    state = {
        id: null,
        email: ''
    }

    onShow = (item, email) => {
        let { id, tenGiaiThuong, noiDung, noiCap, namCap } = item ? item : { id: null, tenGiaiThuong: '', noiDung: '', noiCap: '', namCap: null };
        this.setState({ email, id });
        setTimeout(() => {
            this.tenGiaiThuong.value(tenGiaiThuong ? tenGiaiThuong : '');
            this.noiDung.value(noiDung);
            this.namCap.setVal(namCap ? new Date(namCap.toString()) : null);
            this.noiCap.value(noiCap ? noiCap : '');
        }, 500);
    }

    onSubmit = () => {
        const id = this.state.id,
            email = this.state.email,
            changes = {
                tenGiaiThuong: this.tenGiaiThuong.value(),
                noiDung: this.noiDung.value(),
                namCap: this.namCap.getVal() ? new Date(this.namCap.getVal()).getFullYear() : null,
                noiCap: this.noiCap.value()
            };
        if (id) {
            this.props.update(id, changes, error => {
                if (error == undefined || error == null) {
                    this.props.getData(email);
                    this.hide();
                }
            });
        } else {
            changes.email = email;
            this.props.create(changes, () => {
                this.props.getData(email);
                this.hide();
            });
        }
    }

    render = () => this.renderModal({
        title: 'Thông tin giải thưởng',
        size: 'large',
        body: <div className='row'>
            <FormTextBox className='col-12' ref={e => this.tenGiaiThuong = e} label={'Tên giải thưởng'} type='text' />
            <FormRichTextBox className='col-12' ref={e => this.noiDung = e} label='Nội dung' />
            <div className='form-group col-md-6'><DateInput ref={e => this.namCap = e} label='Năm cấp' type='year' /></div>
            <FormTextBox className='col-md-6' ref={e => this.noiCap = e} label={'Nơi cấp'} type='text' />
        </div>
    });
}

class BangPhatMinhModal extends AdminModal {
    state = {
        id: null,
        email: ''
    }

    onShow = (item, email) => {
        let { id, tenBang, soHieu, namCap, noiCap, tacGia, sanPham, loaiBang } = item ? item : { id: null, tenBang: '', soHieu: '', namCap: null, noiCap: '', tacGia: '', sanPham: '', loaiBang: '' };
        this.setState({ email, id });
        setTimeout(() => {
            this.tenBang.value(tenBang ? tenBang : '');
            this.soHieu.value(soHieu);
            this.namCap.setVal(namCap ? new Date(namCap.toString()) : null);
            this.noiCap.value(noiCap ? noiCap : '');
            this.tacGia.value(tacGia ? tacGia : '');
            this.sanPham.value(sanPham ? sanPham : '');
            this.loaiBang.value(loaiBang ? loaiBang : '');
        }, 500);
    }

    onSubmit = () => {
        const id = this.state.id,
            email = this.state.email,
            changes = {
                tenBang: this.tenBang.value(),
                soHieu: this.soHieu.value(),
                namCap: this.namCap.getVal() ? new Date(this.namCap.getVal()).getFullYear() : null,
                noiCap: this.noiCap.value(),
                tacGia: this.tacGia.value(),
                sanPham: this.sanPham.value(),
                loaiBang: this.loaiBang.value()
            };
        if (id) {
            this.props.update(id, changes, error => {
                if (error == undefined || error == null) {
                    this.props.getData(email);
                    this.hide();
                }
            });
        } else {
            changes.email = email;
            this.props.create(changes, () => {
                this.props.getData(email);
                this.hide();
            });
        }
    }

    render = () => this.renderModal({
        title: 'Thông tin bằng phát minh, sáng chế (patent), giải pháp hữu ích',
        size: 'large',
        body: <div className='row'>
            <FormTextBox className='col-12' ref={e => this.tenBang = e} label={'Tên bằng'} type='text' />
            <FormTextBox className='col-md-6' ref={e => this.soHieu = e} label={'Số hiệu'} type='text' />
            {/* <FormRichTextBox className='col-12' ref={e => this.noiDung = e} label='Nội dung' /> */}
            <div className='form-group col-md-6'><DateInput ref={e => this.namCap = e} label='Năm cấp' type='year' /></div>
            <FormTextBox className='col-md-6' ref={e => this.noiCap = e} label={'Nơi cấp'} type='text' />
            <FormTextBox className='col-md-6' ref={e => this.tacGia = e} label={'Tác giả'} type='text' />
            <FormTextBox className='col-md-6' ref={e => this.sanPham = e} label={'Sản phẩm'} type='text' />
            <FormTextBox className='col-md-6' ref={e => this.loaiBang = e} label={'Loại bằng'} type='text' />
        </div>
    });
}

class UngDungModal extends AdminModal {
    state = {
        id: null,
        email: ''
    }

    onShow = (item, email) => {
        let { id, tenCongNghe, hinhThuc, namChuyenGiao, sanPham } = item ? item : { id: null, tenCongNghe: '', hinhThuc: '', namChuyenGiao: null, sanPham: '' };
        this.setState({ email, id });
        setTimeout(() => {
            this.tenCongNghe.value(tenCongNghe ? tenCongNghe : '');
            this.hinhThuc.value(hinhThuc);
            this.namChuyenGiao.setVal(namChuyenGiao ? new Date(namChuyenGiao.toString()) : null);
            this.sanPham.value(sanPham ? sanPham : '');
        }, 500);
    }

    onSubmit = () => {
        const id = this.state.id,
            email = this.state.email,
            changes = {
                tenCongNghe: this.tenCongNghe.value(),
                hinhThuc: this.hinhThuc.value(),
                namChuyenGiao: this.namChuyenGiao.getVal() ? new Date(this.namChuyenGiao.getVal()).getFullYear() : null,
                sanPham: this.sanPham.value()
            };
        if (id) {
            this.props.update(id, changes, error => {
                if (error == undefined || error == null) {
                    this.props.getData(email);
                    this.hide();
                }
            });
        } else {
            changes.email = email;
            this.props.create(changes, () => {
                this.props.getData(email);
                this.hide();
            });
        }
    }

    render = () => this.renderModal({
        title: 'Thông tin ứng dụng thực tiễn và thương mại hóa kết quả nghiên cứu',
        size: 'large',
        body: <div className='row'>
            <FormTextBox className='col-12' ref={e => this.tenCongNghe = e} label='Tên công nghệ, giải pháp hữu ích' type='text' />
            <FormTextBox className='col-6' ref={e => this.hinhThuc = e} label='Hình thức, quy mô, địa chỉ áp dụng' />
            <div className='form-group col-md-6'><DateInput ref={e => this.namChuyenGiao = e} label='Năm chuyển giao' type='year' /></div>
            <FormTextBox className='col-md-6' ref={e => this.sanPham = e} label='Sản phẩm' type='text' />
        </div>
    });
}

class LamViecNgoaiModal extends AdminModal {
    state = {
        id: null,
        email: '',
        batDau: '',
        ketThuc: '',
        batDauType: 'dd/mm/yyyy',
        ketThucType: 'dd/mm/yyyy',
        toDay: false,
    }

    onShow = (item, email) => {
        this.batDau.clear();
        this.ketThuc.clear();
        let { id, batDauType, ketThucType, batDau, ketThuc, noiDung, noiLamViec } = item ? item : { id: null, batDauType: 'dd/mm/yyyy', ketThucType: 'dd/mm/yyyy', batDau: null, ketThuc: null, noiDung: '', noiLamViec: '' };
        this.setState({ batDauType: batDauType ? batDauType : 'dd/mm/yyyy', ketThucType: ketThuc && ketThuc != -1 ? ketThucType : 'dd/mm/yyyy', email, id, batDau, ketThuc, toDay: ketThuc == -1 ? true : false });
        setTimeout(() => {
            this.batDauType.value(batDauType ? batDauType : 'dd/mm/yyyy');
            if (ketThuc && ketThuc != -1) this.ketThucType.value(ketThucType); else this.ketThucType.value('dd/mm/yyyy');
            this.batDau.setVal(batDau);
            if (ketThuc && ketThuc != -1) this.ketThuc.setVal(ketThuc);
            this.toDay.value(this.state.toDay);
            this.noiDung.value(noiDung);
            this.noiLamViec.value(noiLamViec);
        }, 500);
    }

    onSubmit = () => {
        const id = this.state.id,
            email = this.state.email,
            changes = {
                batDau: this.batDau.getVal(),
                ketThuc: this.state.toDay ? -1 : this.ketThuc.getVal(),
                batDauType: this.state.batDauType,
                ketThucType: this.state.ketThucType,
                noiDung: this.noiDung.value(),
                noiLamViec: this.noiDung.value(),
            };
        if (id) {
            this.props.update(id, changes, error => {
                if (error == undefined || error == null) {
                    this.props.getData(email);
                    this.hide();
                }
            });
        } else {
            changes.email = email;
            this.props.create(changes, () => {
                this.props.getData(email);
                this.hide();
            });
        }
    }

    changeType = (isBatDau, type) => {
        if (isBatDau) {
            this.setState({ batDauType: type });
            this.batDau.setVal(this.state.batDau);
        } else {
            this.setState({ ketThucType: type });
            if (this.state.ketThuc && this.state.ketThuc != -1) this.ketThuc.setVal(this.state.ketThuc);
        }
    }

    changeToDay = (value) => {
        this.setState({ toDay: value });
        if (value) {
            this.ketThuc.clear();
        }
    }

    render = () => this.renderModal({
        title: 'Thông tin tham gia làm việc tại Trường Đại học, Viện, Trung tâm nghiên cứu theo lời mời',
        size: 'large',
        body: <div className='row'>
            <div className='form-group col-md-6'><DateInput ref={e => this.batDau = e} label='Bắt đầu' type={this.state.batDauType ? typeMapper[this.state.batDauType] : null} /></div>
            <FormSelect className='col-md-6' ref={e => this.batDauType = e} label='Loại thời gian bắt đầu' data={dateType} onChange={data => this.changeType(true, data.id)} />
            <div className='form-group col-md-6'><DateInput ref={e => this.ketThuc = e} label='Kết thúc' type={this.state.ketThucType ? typeMapper[this.state.ketThucType] : null} /></div>
            <FormSelect className='col-md-6' ref={e => this.ketThucType = e} label='Loại thời gian kết thúc' data={dateType} onChange={data => this.changeType(false, data.id)} />
            <FormCheckbox className='col-6' label='Vẫn đang tiếp diễn' ref={e => this.toDay = e} onChange={value => this.changeToDay(value)} />
            <FormTextBox className='col-6' ref={e => this.noiLamViec = e} label='Nơi làm việc' />
            <FormRichTextBox className='col-12' ref={e => this.noiDung = e} label='Nội dung' />
        </div>,
    });
}

class ProfilePage extends QTForm {
    constructor(props) {
        super(props);
        this.state = {
            user: null, canBo: null, isLoad: true, doanVien: false,
            doiTuongBoiDuongKienThucQpan: false, tinhTrangBoiDuong: false,
            phai: '02', dangVien: false, congDoan: false, nuocNgoai: false, nghiThaiSan: false, nghiKhongLuong: false,
            ngayNhapNgu: NaN
        };
        this.imageBox = React.createRef();
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
        // this.ngayBatDauCongTacDonVi = React.createRef();
        this.ngayVao = React.createRef();
        this.ngayCbgd = React.createRef();
        this.ngayBienChe = React.createRef();
        this.donViTuyenDung = React.createRef();
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
        this.hopDongCanBo = React.createRef();
        this.loaiHopDong = React.createRef();
        // this.chucVuDang = React.createRef();
        this.chucVuDoanThe = React.createRef();
        this.chucVuKiemNhiem = React.createRef();
        this.maTrinhDoLlct = React.createRef();
        this.maTrinhDoQlnn = React.createRef();
        this.maTrinhDoTinHoc = React.createRef();
        this.danToc = React.createRef();
        this.quocGia = React.createRef();
        this.tonGiao = React.createRef();
        this.dangVien = React.createRef();
        this.maDonVi = React.createRef();
        this.phucLoi = React.createRef();
        this.nhaGiaoNhanDan = React.createRef();
        this.nhaGiaoUuTu = React.createRef();
        this.dangONuocNgoai = React.createRef();
        this.doiTuongBoiDuongKienThucQpan = React.createRef();
        this.tinhTrangBoiDuong = React.createRef();
        this.namBoiDuong = React.createRef();
        this.khoaBoiDuong = React.createRef();
        this.lyDoONuocNgoai = React.createRef();
        this.ngayBatDauONuocNgoai = React.createRef();
        this.ngayKetThucONuocNgoai = React.createRef();
        this.dangNghiThaiSan = React.createRef();
        this.dangNghiKhongHuongLuong = React.createRef();
        this.lyDoNghiKhongHuongLuong = React.createRef();
        this.ngayBatDauNghiKhongHuongLuong = React.createRef();
        this.ngayKetThucNghiKhongHuongLuong = React.createRef();
        this.dangNghiThaiSan = React.createRef();
        this.ngayBatDauNghiThaiSan = React.createRef();
        this.ngayKetThucNghiThaiSan = React.createRef();
        this.ghiChu = React.createRef();
        this.phai = React.createRef();
        this.modal = React.createRef();
        this.main = React.createRef();
        this.nhomMau = React.createRef();
        this.doanVien = React.createRef();
        this.congDoan = React.createRef();
        this.ngayVaoDoan = React.createRef();
        this.noiVaoDoan = React.createRef();
        this.ngayVaoCongDoan = React.createRef();
        this.noiVaoCongDoan = React.createRef();
        // this.soTheDang = React.createRef();
        this.ngayVaoDang = React.createRef();
        this.noiDangDb = React.createRef();
        this.ngayVaoDangChinhThuc = React.createRef();
        this.noiDangCt = React.createRef();
        this.ngayNhapNgu = React.createRef();
        this.ngayXuatNgu = React.createRef();
        this.quanHamCaoNhat = React.createRef();
        this.soBhxh = React.createRef();
        this.maTheBhyt = React.createRef();
        this.ngayBatDauBhxh = React.createRef();
        this.ngayKetThucBhxh = React.createRef();
        this.ngheNghiepCu = React.createRef();
        this.chucVuKhac = React.createRef();
        this.hangThuongBinh = React.createRef();
        this.giaDinhChinhSach = React.createRef();
        this.danhHieu = React.createRef();
        this.soTruong = React.createRef();
        this.tuNhanXet = React.createRef();
        this.sucKhoe = React.createRef();
        this.canNang = React.createRef();
        this.chieuCao = React.createRef();
        this.chucDanh = React.createRef();
        this.hocVi = React.createRef();
        this.trinhDoPhoThong = React.createRef();
        this.noiTotNghiep = React.createRef();
        this.namTotNghiep = React.createRef();
        this.chuyenNganh = React.createRef();
        this.namChucDanh = React.createRef();
        this.namHocVi = React.createRef();

        this.modalNN = React.createRef();
        this.modalHocTapCongTac = React.createRef();

        this.mapperQuanHe = {};
        this.mapperChucVu = {};
        this.mapperDonVi = {};
        this.mapperBoMon = {};
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
                this.getData(user.email, user);

                this.props.getDmQuanHeGiaDinhAll(null, items => items.forEach(item => this.mapperQuanHe[item.ma] = item.ten));
                this.props.getDmChucVuAll(items => items.forEach(item => this.mapperChucVu[item.ma] = item.ten));
                this.props.getDmDonViAll(items => items.forEach(item => this.mapperDonVi[item.ma] = item.ten));
                this.props.getDmBoMonAll(items => items.forEach(item => this.mapperBoMon[item.ma] = item.ten));
                this.props.getDmNgoaiNguAll({ kichHoat: 1 }, items => {
                    items.forEach(item => this.mapperNgonNgu[item.ma] = item.ten);
                });
            }
        });
    }

    getData = (email, user) => {
        this.props.userGetStaff(email, data => {
            if (data.error) {
                T.notify('Lấy thông tin cán bộ bị lỗi!', 'danger');
            } else if (data.item) {
                this.setState(
                    {
                        canBo: data.item,
                        isLoad: false,
                        doanVien: data.item && data.item.doanVien && !data.item.doanVien == 0,
                        congDoan: data.item && data.item.congDoan && !data.item.congDoan == 0,
                        doiTuongBoiDuongKienThucQpan: data.item && data.item.doiTuongBoiDuongKienThucQpan && !data.item.doiTuongBoiDuongKienThucQpan == 0,
                        dangVien: data.item && data.item.dangVien && data.item.dangVien == 0 ? false : true,
                        nuocNgoai: data.item && data.item.dangONuocNgoai == 0 ? false : true,
                        nghiThaiSan: data.item && data.item.dangNghiThaiSan == 0 ? false : true,
                        nghiKhongLuong: data.item && data.item.dangNghiKhongHuongLuong == 0 ? false : true,
                        phai: data.item && data.item.phai,
                    }, () => {
                        this.setVal(data.item);
                    });
            }
            else {
                this.setState({ isLoad: false });
                let { dienThoai, ngaySinh } = user ? user : { dienThoai: '', ngaySinh: '' };
                $('#ngaySinh').val(ngaySinh ? T.dateToText(ngaySinh, 'dd/mm/yyyy') : '');
                $('#dienThoai').val(dienThoai);
                this.phai.current.setVal(user.phai ? user.phai : '01');
            }
        });

    };

    setVal = (data = {}) => {
        const { shcc = '', ho = '', ten = '', biDanh = '', cmnd = '', cmndNgayCap = '', cmndNoiCap = '', emailCaNhan = '', email = '', dienThoaiCaNhan = '', dienThoaiBaoTin = '', ngaySinh = '',
            // ngayBatDauCongTacDonVi = '', 
            ngayBatDauCongTac = '', ngayBienChe = '', donViTuyenDung = '',
            thuongTruSoNha = '', thuongTruMaXa = '', thuongTruMaHuyen = '', thuongTruMaTinh = '',
            maXaNoiSinh = '', maHuyenNoiSinh = '', maTinhNoiSinh = '',
            // maXaNguyenQuan = '', maHuyenNguyenQuan = '', maTinhNguyenQuan = '', 
            noiTotNghiep = '', namTotNghiep = '', hopDongCanBo = '', loaiHopDong = '',
            hienTaiSoNha = '', hienTaiMaXa = '', hienTaiMaHuyen = '', hienTaiMaTinh = '',
            ngayHuongLuong = '', tyLeVuotKhung = '',
            /*maChucVu = '', chucVuDang = '', chucVuDoanThe = '', chucVuKiemNhiem = '',*/
            maTrinhDoLlct = '', maTrinhDoQlnn = '', maTrinhDoTinHoc = '', danToc = '', tonGiao = '', chucDanh = '', trinhDoPhoThong = '', hocVi = '', chuyenNganh = '', namChucDanh = '', namHocVi = '',
            maDonVi = '', lyDoONuocNgoai = '', ngayBatDauONuocNgoai = '', ngayKetThucONuocNgoai = '', dangONuocNgoai = false,
            doiTuongBoiDuongKienThucQpan = false, tinhTrangBoiDuong = false, namBoiDuong = '', khoaBoiDuong = '',
            lyDoNghiKhongHuongLuong = '', ngayBatDauNghiKhongHuongLuong = '', ngayKetThucNghiKhongHuongLuong = '', dangNghiKhongHuongLuong = false,
            ngayBatDauNghiThaiSan = '', ngayKetThucNghiThaiSan = '', dangNghiThaiSan = false,
            dangVien = false, phai = '', nhomMau = '', ngayVaoDang = '', ngayVaoDangChinhThuc = '', ngayNhapNgu = '', ngayXuatNgu = '', quanHamCaoNhat = '',
            soBhxh = '', ngayKetThucBhxh = '', ngayBatDauBhxh = '', maTheBhyt = '',
            /*soTheDang = '',*/ noiDangDb = '', noiDangCt = '',
            doanVien = false, congDoan = false, ngayVaoCongDoan = '', noiVaoCongDoan = '',
            ngayVaoDoan = '', noiVaoDoan = '', ngheNghiepCu = '', bacLuong = '', heSoLuong = '',
            /*chucVuKhac = '',*/
            quocGia = null, hangThuongBinh = '', giaDinhChinhSach = '', danhHieu = '', soTruong = '', tuNhanXet = '', sucKhoe = '', canNang = '', chieuCao = '' } = data.constructor === ({}).constructor ? data : {};

        this.shcc.current.setVal(shcc);
        this.phai.current.setVal(phai);
        this.ho.current.setVal(ho);
        this.ten.current.setVal(ten);
        this.biDanh.current.setVal(biDanh);
        this.cmnd.current.setVal(cmnd);
        this.cmndNgayCap.current.setVal(cmndNgayCap);
        this.cmndNoiCap.current.setVal(cmndNoiCap);
        this.ngaySinh.current.setVal(ngaySinh);
        this.emailCaNhan.current.setVal(emailCaNhan);
        this.email.current.setVal(email);
        this.dienThoaiCaNhan.current.setVal(dienThoaiCaNhan);
        this.dienThoaiBaoTin.current.setVal(dienThoaiBaoTin);
        this.ngaySinh.current.setVal(ngaySinh);
        this.ngayBatDauCongTac.current.setVal(ngayBatDauCongTac);
        // this.ngayBatDauCongTacDonVi.current.setVal(ngayBatDauCongTacDonVi);
        this.hopDongCanBo.current.setVal(hopDongCanBo);
        this.loaiHopDong.current.setVal(loaiHopDong);

        // this.ngayVao.current.setVal(ngayVao);
        // this.ngayCbgd.current.setVal(ngayCbgd);
        this.ngayBienChe.current.setVal(ngayBienChe);
        this.donViTuyenDung.current.setVal(donViTuyenDung);
        // this.ngayNghi.current.setVal(ngayNghi);
        // this.ngach.current.setVal(ngach);
        // this.ngachMoi.current.setVal(ngachMoi);
        this.heSoLuong.current.setVal(heSoLuong && Number(heSoLuong) ? Number(heSoLuong).toFixed(2) : 0);
        this.bacLuong.current.setVal(bacLuong);
        // this.mocNangLuong.current.setVal(mocNangLuong);
        this.ngayHuongLuong.current.setVal(ngayHuongLuong);
        this.tyLeVuotKhung.current.setVal(tyLeVuotKhung);
        // this.phuCapCongViec.current.setVal(phuCapCongViec);
        // this.ngayPhuCapCongViec.current.setVal(ngayPhuCapCongViec);
        // this.maChucVu.current.setVal(maChucVu);
        this.doanVien.current.setVal(doanVien);
        if (this.state.doanVien) {
            this.ngayVaoDoan.current.setVal(ngayVaoDoan);
            this.noiVaoDoan.current.setVal(noiVaoDoan);
        }
        this.congDoan.current.setVal(congDoan);
        if (this.state.congDoan) {
            this.ngayVaoCongDoan.current.setVal(ngayVaoCongDoan);
            this.noiVaoCongDoan.current.setVal(noiVaoCongDoan);
        }
        this.dangVien.current.setVal(dangVien);
        if (this.state.dangVien) {
            // this.chucVuDang.current.setVal(chucVuDang);
            this.ngayVaoDang.current.setVal(ngayVaoDang);
            this.ngayVaoDangChinhThuc.current.setVal(ngayVaoDangChinhThuc);
            this.noiDangDb.current.setVal(noiDangDb);
            this.noiDangCt.current.setVal(noiDangCt);
            // this.soTheDang.current.setVal(soTheDang);
        }
        // this.chucVuDoanThe.current.setVal(chucVuDoanThe);
        // this.chucVuKiemNhiem.current.setVal(chucVuKiemNhiem);
        // this.chucVuKhac.current.setVal(chucVuKhac);
        this.maTrinhDoLlct.current.setVal(maTrinhDoLlct);
        this.maTrinhDoQlnn.current.setVal(maTrinhDoQlnn);
        this.maTrinhDoTinHoc.current.setVal(maTrinhDoTinHoc);
        this.danToc.current.setVal(danToc);
        this.quocGia.current.setVal(quocGia);
        this.tonGiao.current.setVal(tonGiao);
        this.ngheNghiepCu.current.setVal(ngheNghiepCu);
        this.maDonVi.current.setVal(maDonVi);
        // this.phucLoi.current.setVal(phucLoi);
        // this.nhaGiaoNhanDan.current.setVal(nhaGiaoNhanDan);
        // this.nhaGiaoUuTu.current.setVal(nhaGiaoUuTu);

        this.doiTuongBoiDuongKienThucQpan.current.setVal(doiTuongBoiDuongKienThucQpan);
        if (this.state.doiTuongBoiDuongKienThucQpan) {
            this.tinhTrangBoiDuong.current.setVal(tinhTrangBoiDuong);
            if (this.state.tinhTrangBoiDuong) {
                this.namBoiDuong.current.setVal(namBoiDuong);
                this.khoaBoiDuong.current.setVal(khoaBoiDuong);
            }
        }
        this.dangONuocNgoai.current.setVal(dangONuocNgoai);
        if (this.state.nuocNgoai) {
            this.lyDoONuocNgoai.current.setVal(lyDoONuocNgoai);
            this.ngayBatDauONuocNgoai.current.setVal(ngayBatDauONuocNgoai);
            this.ngayKetThucONuocNgoai.current.setVal(ngayKetThucONuocNgoai);
        }
        this.dangNghiKhongHuongLuong.current.setVal(dangNghiKhongHuongLuong);
        if (this.state.nuocNgoai) {
            this.lyDoNghiKhongHuongLuong.current.setVal(lyDoNghiKhongHuongLuong);
            this.ngayBatDauNghiKhongHuongLuong.current.setVal(ngayBatDauNghiKhongHuongLuong);
            this.ngayKetThucNghiKhongHuongLuong.current.setVal(ngayKetThucNghiKhongHuongLuong);
        }
        if (this.state.phai == '02') {
            this.dangNghiThaiSan.current.setVal(dangNghiThaiSan);
            if (this.state.nghiThaiSan) {
                this.ngayBatDauNghiThaiSan.current.setVal(ngayBatDauNghiThaiSan);
                this.ngayKetThucNghiThaiSan.current.setVal(ngayKetThucNghiThaiSan);
            }
        }
        // this.ghiChu.current.setVal(ghiChu);

        this.nhomMau.current.setVal(nhomMau);
        this.ngayNhapNgu.current.setVal(ngayNhapNgu);
        this.ngayXuatNgu.current.setVal(ngayXuatNgu);
        this.quanHamCaoNhat.current.setVal(quanHamCaoNhat);
        this.hangThuongBinh.current.setVal(hangThuongBinh);
        this.giaDinhChinhSach.current.setVal(giaDinhChinhSach);
        this.danhHieu.current.setVal(danhHieu);
        this.soBhxh.current.setVal(soBhxh);
        this.maTheBhyt.current.setVal(maTheBhyt);
        this.ngayBatDauBhxh.current.setVal(ngayBatDauBhxh);
        this.ngayKetThucBhxh.current.setVal(ngayKetThucBhxh);
        this.thuongTru.value(thuongTruMaTinh, thuongTruMaHuyen, thuongTruMaXa, thuongTruSoNha);
        this.hienTai.value(hienTaiMaTinh, hienTaiMaHuyen, hienTaiMaXa, hienTaiSoNha);
        // this.nguyenQuan.value(maTinhNguyenQuan, maHuyenNguyenQuan, maXaNguyenQuan);
        this.noiSinh.value(maTinhNoiSinh, maHuyenNoiSinh, maXaNoiSinh);

        this.soTruong.current.setVal(soTruong);
        this.tuNhanXet.current.setVal(tuNhanXet);
        this.sucKhoe.current.setVal(sucKhoe);
        this.canNang.current.setVal(canNang);
        this.chieuCao.current.setVal(chieuCao);
        this.chucDanh.current.setVal(chucDanh);
        this.hocVi.current.setVal(hocVi);
        this.chuyenNganh.current.setVal(chuyenNganh);
        this.namChucDanh.current.setVal(namChucDanh);
        this.namHocVi.current.setVal(namHocVi);
        this.trinhDoPhoThong.current.setVal(trinhDoPhoThong);
        this.noiTotNghiep.current.setVal(noiTotNghiep);
        this.namTotNghiep.current.setVal(namTotNghiep);

    }

    getVal = () => ({
        shcc: this.shcc.current.getFormVal(),
        ho: this.ho.current.getFormVal(),
        ten: this.ten.current.getFormVal(),
        biDanh: this.biDanh.current.getFormVal(),
        cmnd: this.cmnd.current.getFormVal(),
        cmndNgayCap: this.cmndNgayCap.current.getFormVal(),
        cmndNoiCap: this.cmndNoiCap.current.getFormVal(),
        ngaySinh: this.ngaySinh.current.getFormVal(),
        email: this.email.current.getFormVal(),
        hopDongCanBo: this.hopDongCanBo.current.getFormVal(),
        loaiHopDong: this.loaiHopDong.current.getFormVal(),
        emailCaNhan: this.emailCaNhan.current.getFormVal(),
        dienThoaiCaNhan: this.dienThoaiCaNhan.current.getFormVal(),
        dienThoaiBaoTin: this.dienThoaiBaoTin.current.getFormVal(),
        ngayBatDauCongTac: this.ngayBatDauCongTac.current.isEmpty() ? {} : this.ngayBatDauCongTac.current.getFormVal(),
        // ngayBatDauCongTacDonVi: this.ngayBatDauCongTacDonVi.current.isEmpty() ? {} : this.ngayBatDauCongTacDonVi.current.getFormVal(),
        // ngayVao: this.ngayVao.current.isEmpty() ? {} : this.ngayVao.current.getFormVal(),
        // ngayCbgd: this.ngayCbgd.current.isEmpty() ? {} : this.ngayCbgd.current.getFormVal(),
        ngayBienChe: this.ngayBienChe.current.isEmpty() ? {} : this.ngayBienChe.current.getFormVal(),
        donViTuyenDung: this.donViTuyenDung.current.getFormVal(),
        // ngayNghi: this.ngayNghi.current.isEmpty() ? {} : this.ngayNghi.current.getFormVal(),
        // ngach: this.ngach.current.getFormVal(),
        // ngachMoi: this.ngachMoi.current.getFormVal(),
        heSoLuong: this.heSoLuong.current.getFormVal(),
        bacLuong: this.bacLuong.current.getFormVal(),
        // mocNangLuong: this.mocNangLuong.current.isEmpty() ? {} : this.mocNangLuong.current.getFormVal(),
        ngayHuongLuong: this.ngayHuongLuong.current.isEmpty() ? {} : this.ngayHuongLuong.current.getFormVal(),
        tyLeVuotKhung: this.tyLeVuotKhung.current.getFormVal(),
        // phuCapCongViec: this.phuCapCongViec.current.getFormVal(),
        // ngayPhuCapCongViec: this.ngayPhuCapCongViec.current.isEmpty() ? {} : this.ngayPhuCapCongViec.current.getFormVal(),
        // maChucVu: this.maChucVu.current.getFormVal(),
        // chucVuDang: this.state.dangVien ? this.chucVuDang.current.getFormVal() : {},
        doanVien: this.doanVien.current.getFormVal(),
        ngayVaoDoan: this.state.doanVien ? this.ngayVaoDoan.current.getFormVal() : {},
        congDoan: this.congDoan.current.getFormVal(),
        ngayVaoCongDoan: this.state.congDoan ? this.ngayVaoCongDoan.current.getFormVal() : {},
        noiVaoCongDoan: this.state.congDoan ? this.noiVaoCongDoan.current.getFormVal() : {},
        noiVaoDoan: this.state.doanVien ? this.noiVaoDoan.current.getFormVal() : {},
        // soTheDang: this.state.dangVien ? this.soTheDang.current.getFormVal() : {},
        ngayVaoDang: this.state.dangVien ? this.ngayVaoDang.current.getFormVal() : {},
        ngayVaoDangChinhThuc: this.state.dangVien ? this.ngayVaoDangChinhThuc.current.getFormVal() : {},
        noiDangDb: this.state.dangVien ? this.noiDangDb.current.getFormVal() : {},
        noiDangCt: this.state.dangVien ? this.noiDangCt.current.getFormVal() : {},
        // chucVuDoanThe: this.chucVuDoanThe.current.getFormVal(),
        // chucVuKiemNhiem: this.chucVuKiemNhiem.current.getFormVal(),
        // chucVuKhac: this.chucVuKhac.current.getFormVal(),
        maTrinhDoLlct: this.maTrinhDoLlct.current.getFormVal(),
        maTrinhDoQlnn: this.maTrinhDoQlnn.current.getFormVal(),
        maTrinhDoTinHoc: this.maTrinhDoTinHoc.current.getFormVal(),
        danToc: this.danToc.current.getFormVal(),
        quocGia: this.quocGia.current.getFormVal(),
        tonGiao: this.tonGiao.current.getFormVal(),
        dangVien: this.dangVien.current.getFormVal(),
        maDonVi: this.maDonVi.current.getFormVal(),
        // phucLoi: this.phucLoi.current.getFormVal(),
        // nhaGiaoNhanDan: this.nhaGiaoNhanDan.current.getFormVal(),
        // nhaGiaoUuTu: this.nhaGiaoUuTu.current.getFormVal(),
        doiTuongBoiDuongKienThucQpan: this.doiTuongBoiDuongKienThucQpan.current.getFormVal(),
        tinhTrangBoiDuong: this.state.doiTuongBoiDuongKienThucQpan ? this.tinhTrangBoiDuong.current.getFormVal() : 0,
        namBoiDuong: this.state.tinhTrangBoiDuong && this.state.doiTuongBoiDuongKienThucQpan ? this.namBoiDuong.current.getFormVal() : {},
        khoaBoiDuong: this.state.tinhTrangBoiDuong && this.state.doiTuongBoiDuongKienThucQpan ? this.khoaBoiDuong.current.getFormVal() : {},

        dangONuocNgoai: this.dangONuocNgoai.current.getFormVal(),
        lyDoONuocNgoai: this.state.nuocNgoai ? this.lyDoONuocNgoai.current.getFormVal() : {},
        ngayBatDauONuocNgoai: this.state.nuocNgoai ? this.ngayBatDauONuocNgoai.current.getFormVal() : {},
        ngayKetThucONuocNgoai: this.state.nuocNgoai ? this.ngayKetThucONuocNgoai.current.getFormVal() : {},

        dangNghiKhongHuongLuong: this.dangNghiKhongHuongLuong.current.getFormVal(),
        lyDoNghiKhongHuongLuong: this.state.nghiKhongLuong ? this.lyDoNghiKhongHuongLuong.current.getFormVal() : {},
        ngayBatDauNghiKhongHuongLuong: this.state.nghiKhongLuong ? this.ngayBatDauNghiKhongHuongLuong.current.getFormVal() : {},
        ngayKetThucNghiKhongHuongLuong: this.state.nghiKhongLuong ? this.ngayKetThucNghiKhongHuongLuong.current.getFormVal() : {},

        dangNghiThaiSan: this.state.nghiThaiSan == '02' ? this.dangNghiThaiSan.current.getFormVal() : {},
        ngayBatDauNghiThaiSan: this.state.nghiThaiSan == '02' ? this.ngayBatDauNghiThaiSan.current.getFormVal() : {},
        ngayKetThucNghiThaiSan: this.state.nghiThaiSan == '02' ? this.ngayKetThucNghiThaiSan.current.getFormVal() : {},
        // ghiChu: this.ghiChu.current.getFormVal(),
        phai: this.phai.current.getFormVal(),
        nhomMau: this.nhomMau.current.getFormVal(),
        ngayNhapNgu: this.ngayNhapNgu.current.getFormVal(),
        ngayXuatNgu: this.ngayXuatNgu.current.getFormVal(),
        quanHamCaoNhat: this.quanHamCaoNhat.current.getFormVal(),
        hangThuongBinh: this.hangThuongBinh.current.getFormVal(),
        giaDinhChinhSach: this.giaDinhChinhSach.current.getFormVal(),
        danhHieu: this.danhHieu.current.getFormVal(),
        soBhxh: this.soBhxh.current.getFormVal(),
        maTheBhyt: this.maTheBhyt.current.getFormVal(),
        ngayKetThucBhxh: this.ngayKetThucBhxh.current.getFormVal(),
        ngayBatDauBhxh: this.ngayBatDauBhxh.current.getFormVal(),
        soTruong: this.soTruong.current.getFormVal(),
        tuNhanXet: this.tuNhanXet.current.getFormVal(),
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
        noiTotNghiep: this.noiTotNghiep.current.getFormVal(),
        namTotNghiep: this.namTotNghiep.current.getFormVal(),
    })

    saveCommon = (e) => {
        e.preventDefault();
        let phai = this.phai.current.getVal(),
            ngaySinh = $('#ngaySinh').val() || null,
            changes = { dienThoai: $('#dienThoai').val() };
        if (phai) changes.phai = phai;
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
        // const dcNguyenQuan = {
        //     maXaNguyenQuan: this.nguyenQuan.value().maPhuongXa,
        //     maHuyenNguyenQuan: this.nguyenQuan.value().maQuanHuyen,
        //     maTinhNguyenQuan: this.nguyenQuan.value().maTinhThanhPho
        // };
        const dcNoiSinh = {
            maXaNoiSinh: this.noiSinh.value().maPhuongXa,
            maHuyenNoiSinh: this.noiSinh.value().maQuanHuyen,
            maTinhNoiSinh: this.noiSinh.value().maTinhThanhPho
        };
        this.main.current.classList.add('validated');
        form.data && this.props.updateStaffUser(Object.assign(form.data, dcThuongTru, dcHienTai, /*dcNguyenQuan,*/ dcNoiSinh), this.state.canBo.email, () => this.main.current.classList.remove('validated'));
    };

    create = (e, modal) => {
        e.preventDefault();
        modal.show(null, this.state.canBo.email);
    }

    createRelation = (e, type) => {
        e.preventDefault();
        this.modal.show(null, type, this.state.canBo.email);
    }

    editQuanHe = (e, item) => {
        this.modal.show(item, null, this.state.canBo.email);
        e.preventDefault();
    }

    deleteQuanHe = (e, item) => {
        T.confirm('Xóa thông tin người thân', 'Bạn có chắc bạn muốn xóa mục này?', true, isConfirm =>
            isConfirm && this.props.deleteQuanHeStaffUser(item.id, this.state.canBo.email));
        e.preventDefault();
    }

    editTrinhDoNN = (e, item) => {
        this.modalNN.show(item, this.state.canBo.email);
        e.preventDefault();
    }

    deleteTrinhDoNN = (e, item) => {
        T.confirm('Xóa thông tin trình độ ngoại ngữ', 'Bạn có chắc bạn muốn xóa mục này?', true, isConfirm =>
            isConfirm && this.props.deleteTrinhDoNNStaffUser(item.id, () => this.props.userGetStaff(this.state.canBo.email)));
        e.preventDefault();
    }

    createHocTapCongTac = (e) => {
        e.preventDefault();
        this.modalHocTapCongTac.current.show(null, this.state.canBo.email);
    }

    editHocTapCongTac = (e, item) => {
        e.preventDefault();
        this.modalHocTapCongTac.show(item, this.state.canBo.email);
    }

    deleteHocTapCongTac = (e, item) => {
        T.confirm('Xóa thông tin quá trình học tập công tác', 'Bạn có chắc bạn muốn xóa quá trình này?', true, isConfirm =>
            isConfirm && this.props.deleteQTHTCTStaffUser(item.id, () => this.props.userGetStaff(this.state.canBo.email)));
        e.preventDefault();
    }

    createDaoTao = (e) => {
        e.preventDefault();
        this.modalDaoTao.show(null, this.state.canBo.email);
    }

    editDaoTao = (e, item) => {
        e.preventDefault();
        this.modalDaoTao.show(item, this.state.canBo.email);
    }

    deleteDaoTao = (e, item) => {
        T.confirm('Xóa thông tin quá trình đào tạo', 'Bạn có chắc bạn muốn xóa quá trình này?', true, isConfirm =>
            isConfirm && this.props.deleteQtDaoTaoStaffUser(item.id, () => this.props.userGetStaff(this.state.canBo.email)));
        e.preventDefault();
    }

    createNuocNgoai = (e) => {
        e.preventDefault();
        this.modalNuocNgoai.show(null, this.state.canBo.email);
    }

    editNuocNgoai = (e, item) => {
        e.preventDefault();
        this.modalNuocNgoai.show(item, this.state.canBo.email);
    }

    deleteNuocNgoai = (e, item) => {
        T.confirm('Xóa thông tin quá trình nước ngoài', 'Bạn có chắc bạn muốn xóa quá trình này?', true, isConfirm =>
            isConfirm && this.props.deleteQtNuocNgoaiStaffUser(item.id, () => this.props.userGetStaff(this.state.canBo.email)));
        e.preventDefault();
    }

    createKhenThuong = (e) => {
        e.preventDefault();
        this.modalKhenThuong.show(null, this.state.canBo.email);
    }

    editKhenThuong = (e, item) => {
        e.preventDefault();
        this.modalKhenThuong.show(item, this.state.canBo.email);
    }

    deleteKhenThuong = (e, item) => {
        T.confirm('Xóa thông tin quá trình khen thưởng', 'Bạn có chắc bạn muốn xóa quá trình này?', true, isConfirm =>
            isConfirm && this.props.deleteQtKhenThuongStaffUser(item.id, () => this.props.userGetStaff(this.state.canBo.email)));
        e.preventDefault();
    }

    createKyLuat = (e) => {
        e.preventDefault();
        this.modalKyLuat.show(null, this.state.canBo.email);
    }

    editKyLuat = (e, item) => {
        e.preventDefault();
        this.modalKyLuat.show(item, this.state.canBo.email);
    }

    deleteKyLuat = (e, item) => {
        T.confirm('Xóa thông tin quá trình kỷ luật', 'Bạn có chắc bạn muốn xóa quá trình này?', true, isConfirm =>
            isConfirm && this.props.deleteQtKyLuatStaffUser(item.id, () => this.props.userGetStaff(this.state.canBo.email)));
        e.preventDefault();
    }

    createNckh = (e) => {
        e.preventDefault();
        this.modalNckh.show(null, this.state.canBo.email);
    }

    editNckh = (e, item) => {
        e.preventDefault();
        this.modalNckh.show(item, this.state.canBo.email);
    }

    deleteNckh = (e, item) => {
        T.confirm('Xóa thông tin quá trình nghiên cứu khoa học', 'Bạn có chắc bạn muốn xóa quá trình này?', true, isConfirm =>
            isConfirm && this.props.deleteQtNckhStaffUser(item.id, () => this.props.userGetStaff(this.state.canBo.email)));
        e.preventDefault();
    }

    createHuongDanLuanVan = (e) => {
        e.preventDefault();
        this.modalHuongDanLv.show(null, this.state.canBo.email);
    }

    editHuongDanLuanVan = (e, item) => {
        e.preventDefault();
        this.modalHuongDanLv.show(item, this.state.canBo.email);
    }

    deleteHuongDanLuanVan = (e, item) => {
        T.confirm('Xóa thông tin quá trình hướng dẫn luận văn', 'Bạn có chắc bạn muốn xóa quá trình này?', true, isConfirm =>
            isConfirm && this.props.deleteQtHuongDanLVStaffUser(item.id, () => this.props.userGetStaff(this.state.canBo.email)));
        e.preventDefault();
    }

    createSachGT = (e) => {
        e.preventDefault();
        this.modalSachGT.show(null, this.state.canBo.email);
    }

    editSachGT = (e, item) => {
        e.preventDefault();
        this.modalSachGT.show(item, this.state.canBo.email);
    }

    deleteSachGT = (e, item) => {
        T.confirm('Xóa thông tin sách, giáo trình', 'Bạn có chắc bạn muốn xóa sách, giáo trình này?', true, isConfirm =>
            isConfirm && this.props.deleteSachGTStaffUser(item.id, () => this.props.userGetStaff(this.state.canBo.email)));
        e.preventDefault();
    }

    createBaiVietKhoaHoc = (e) => {
        e.preventDefault();
        this.modalBaiVietKhoaHoc.show(null, this.state.canBo.email);
    }

    editBaiVietKhoaHoc = (e, item) => {
        e.preventDefault();
        this.modalBaiVietKhoaHoc.show(item, this.state.canBo.email);
    }

    deleteBaiVietKhoaHoc = (e, item) => {
        T.confirm('Xóa thông tin bài viết khoa học', 'Bạn có chắc bạn muốn xóa bài viết này?', true, isConfirm =>
            isConfirm && this.props.deleteQtBaiVietKhoaHocStaffUser(item.id, () => this.props.userGetStaff(this.state.canBo.email)));
        e.preventDefault();
    }

    createKyYeu = (e) => {
        e.preventDefault();
        this.modalKyYeu.show(null, this.state.canBo.email);
    }

    editKyYeu = (e, item) => {
        e.preventDefault();
        this.modalKyYeu.show(item, this.state.canBo.email);
    }

    deleteKyYeu = (e, item) => {
        T.confirm('Xóa thông tin kỷ yếu hội nghị, hội thảo', 'Bạn có chắc bạn muốn xóa kỷ yếu này?', true, isConfirm =>
            isConfirm && this.props.deleteQtKyYeuStaffUser(item.id, () => this.props.userGetStaff(this.state.canBo.email)));
        e.preventDefault();
    }

    createGiaiThuong = (e) => {
        e.preventDefault();
        this.modalGiaiThuong.show(null, this.state.canBo.email);
    }

    editGiaiThuong = (e, item) => {
        e.preventDefault();
        this.modalGiaiThuong.show(item, this.state.canBo.email);
    }

    deleteGiaiThuong = (e, item) => {
        T.confirm('Xóa thông tin giải thưởng', 'Bạn có chắc bạn muốn xóa giải thưởng này?', true, isConfirm =>
            isConfirm && this.props.deleteQtGiaiThuongStaffUser(item.id, () => this.props.userGetStaff(this.state.canBo.email)));
        e.preventDefault();
    }

    createBangPhatMinh = (e) => {
        e.preventDefault();
        this.modalBangPhatMinh.show(null, this.state.canBo.email);
    }

    editBangPhatMinh = (e, item) => {
        e.preventDefault();
        this.modalBangPhatMinh.show(item, this.state.canBo.email);
    }

    deleteBangPhatMinh = (e, item) => {
        T.confirm('Xóa thông tin bằng phát minh, sáng chế, giải pháp hữu ích', 'Bạn có chắc bạn muốn xóa bằng phát minh, sáng chế, giải pháp hữu ích này?', true, isConfirm =>
            isConfirm && this.props.deleteQtBangPhatMinhStaffUser(item.id, () => this.props.userGetStaff(this.state.canBo.email)));
        e.preventDefault();
    }

    createUngDung = (e) => {
        e.preventDefault();
        this.modalUngDung.show(null, this.state.canBo.email);
    }

    editUngDung = (e, item) => {
        e.preventDefault();
        this.modalUngDung.show(item, this.state.canBo.email);
    }

    deleteUngDung = (e, item) => {
        T.confirm('Xóa thông tin ứng dụng thực tiễn và thương mại hóa kết quả nghiên cứu', 'Bạn có chắc bạn muốn xóa ứng dụng này?', true, isConfirm =>
            isConfirm && this.props.deleteQtUngDungThuongMaiStaffUser(item.id, () => this.props.userGetStaff(this.state.canBo.email)));
        e.preventDefault();
    }

    createLamViecNgoai = (e) => {
        e.preventDefault();
        this.modalLamViecNgoai.show(null, this.state.canBo.email);
    }

    editLamViecNgoai = (e, item) => {
        e.preventDefault();
        this.modalLamViecNgoai.show(item, this.state.canBo.email);
    }

    deleteLamViecNgoai = (e, item) => {
        T.confirm('Xóa thông tin tham gia làm việc tại Trường Đại học, Viện, Trung tâm nghiên cứu theo lời mời', 'Bạn có chắc bạn muốn xóa làm việc ngoài trường này?', true, isConfirm =>
            isConfirm && this.props.deleteQtLamViecNgoaiStaffUser(item.id, () => this.props.userGetStaff(this.state.canBo.email)));
        e.preventDefault();
    }

    downloadWord = e => {
        e.preventDefault();
        this.props.downloadWord(this.urlSHCC, data => {
            T.FileSaver(new Blob([new Uint8Array(data.data)]), this.urlSHCC + '_2c.docx');
        });
    }

    downloadWordLlkh = e => {
        e.preventDefault();
        this.props.downloadWordLlkh(this.urlSHCC, data => {
            T.FileSaver(new Blob([new Uint8Array(data.data)]), (this.state.hoTen ? this.state.hoTen + '_' : '') + this.urlSHCC + '_LLKH.docx');
        });
    }

    copyAddress = e => {
        e.preventDefault();
        const dataThuongTru = this.thuongTru.value();
        this.hienTai.value(dataThuongTru.maTinhThanhPho, dataThuongTru.maQuanHuyen, dataThuongTru.maPhuongXa, dataThuongTru.soNhaDuong);
    }

    render() {
        const user = this.props.system ? this.props.system.user : {},
            currentPermission = user && user.permissions ? user.permissions : [],
            permission = this.getUserPermission('staff');

        if (this.state.canBo) {
            permission.read = true;
            permission.write = true;
            permission.delete = true;
        }
        let readOnly = !currentPermission.includes('staff:login');

        let currentCanBo = this.props.staff && this.props.staff.userItem ? this.props.staff.userItem : [],
            items = currentCanBo.items ? currentCanBo.items.filter(i => i.type == 0) : [],
            itemsInLaw = currentCanBo.items ? currentCanBo.items.filter(i => i.type == 1) : [],
            itemOwn = currentCanBo.items ? currentCanBo.items.filter(i => i.type == 2) : [],
            cacToChucCTXHNN = currentCanBo.cacToChucCTXHNN ? currentCanBo.cacToChucCTXHNN : [],
            itemsNN = currentCanBo.trinhDoNN ? currentCanBo.trinhDoNN : [],
            hocTapCongTac = currentCanBo.hocTapCongTac ? currentCanBo.hocTapCongTac : [],
            chucVu = currentCanBo.chucVu ? currentCanBo.chucVu : [],
            qtDaoTao = currentCanBo.daoTao ? currentCanBo.daoTao : [],
            nuocNgoai = currentCanBo.nuocNgoai ? currentCanBo.nuocNgoai : [],
            khenThuong = currentCanBo.khenThuong ? currentCanBo.khenThuong : [],
            kyLuat = currentCanBo.kyLuat ? currentCanBo.kyLuat : [],
            nghienCuuKhoaHoc = currentCanBo.nghienCuuKhoaHoc ? currentCanBo.nghienCuuKhoaHoc : [],
            huongDanLuanVan = currentCanBo.huongDanLuanVan ? currentCanBo.huongDanLuanVan : [],
            sachGT = currentCanBo.sachGiaoTrinh ? currentCanBo.sachGiaoTrinh : [],
            baiVietKhoaHoc = currentCanBo.baiVietKhoaHoc ? currentCanBo.baiVietKhoaHoc : [],
            kyYeu = currentCanBo.kyYeu ? currentCanBo.kyYeu : [],
            giaiThuong = currentCanBo.giaiThuong ? currentCanBo.giaiThuong : [],
            bangPhatMinh = currentCanBo.bangPhatMinh ? currentCanBo.bangPhatMinh : [],
            ungDungThuongMai = currentCanBo.ungDungThuongMai ? currentCanBo.ungDungThuongMai : [],
            lamViecNgoai = currentCanBo.lamViecNgoai ? currentCanBo.lamViecNgoai : [];
        // const item = this.state.canBo || {};

        // const renderFieldText = (className, label, hasValue, value, noValue = 'Không có thông tin!') =>
        //     <div className={className}>{label}: <b>{hasValue ? value : noValue}</b></div>;


        const chucVuShow = (data) => {
            let text = data.map((item) => {
                return <div key={item.stt.toString()} className='form-group col-md-12'><b>{this.mapperChucVu[item.maChucVu]}</b><>{item.maDonVi ? 
                    ((item.maChucVu != '001' && item.maChucVu != '002') ? ' - ' + this.mapperDonVi[item.maDonVi] : '') : ' - ' + this.mapperBoMon[item.maBoMon]}</> {item.chucVuChinh ? '(Chức vụ chính)' : ''}</div>;
            });
            return text;
        };
        // const tableChucVu = renderTable({
        //     getDataSource: () => chucVu, stickyHead: false,
        //     renderRow: (item, index) => (
        //         <tr key={index}>
        //             <TableCell type='text' content={(
        //                 <>
        //                     <span>{this.mapperChucVu[item.maChucVu]}</span><br />
        //                     <span>{item.maDonVi ? 'Đơn vị: ' + this.mapperDonVi[item.maDonVi] : 'Bộ môn/Phòng: ' + this.mapperBoMon[item.maBoMon]}</span>
        //                 </>
        //             )} />
        //             <TableCell type='text' content={item.chucVuChinh ? 'Chức vụ chính' : 'Chức vụ kiêm nhiệm'} />
        //             <TableCell type='text' content={(
        //                 <>
        //                     <span>Số: {item.soQd}</span><br />
        //                     <span>Ngày: <span style={{ color: 'blue' }}>{item.ngayRaQd ? new Date(item.ngayRaQd).ddmmyyyy() : ''}</span></span>
        //                 </>
        //             )}
        //             />
        //         </tr>)
        // });
        const table = renderTable({
            getDataSource: () => items, stickyHead: false,
            renderHead: () => (
                <tr>
                    <th style={{ width: '30%' }}>Họ và tên</th>
                    <th style={{ width: '20%' }}>Năm sinh</th>
                    <th style={{ width: '10%' }}>Quan hệ</th>
                    <th style={{ width: '20%' }}>Nghề nghiệp</th>
                    <th style={{ width: '20%' }}>Nơi công tác</th>
                    <th style={{ width: 'auto', textAlign: 'center' }}>Thao tác</th>
                </tr>),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell type='link' content={item.hoTen} onClick={e => this.editQuanHe(e, item)} />
                    <TableCell type='text' content={T.dateToText(item.namSinh, 'yyyy')} />
                    <TableCell type='text' content={this.mapperQuanHe[item.moiQuanHe]} />
                    <TableCell type='text' content={item.ngheNghiep} />
                    <TableCell type='text' content={item.noiCongTac} />
                    <TableCell type='buttons' content={item} permission={permission} onEdit={this.editQuanHe} onDelete={this.deleteQuanHe}></TableCell>
                </tr>)
        });

        const tableInLaw = renderTable({
            getDataSource: () => itemsInLaw, stickyHead: false,
            renderHead: () => (
                <tr>
                    <th style={{ width: '30%' }}>Họ và tên</th>
                    <th style={{ width: '20%' }}>Năm sinh</th>
                    <th style={{ width: '10%' }}>Quan hệ</th>
                    <th style={{ width: '20%' }}>Nghề nghiệp</th>
                    <th style={{ width: '20%' }}>Nơi công tác</th>
                    <th style={{ width: 'auto', textAlign: 'center' }}>Thao tác</th>
                </tr>),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell type='link' content={item.hoTen} onClick={e => this.editQuanHe(e, item)} />
                    <TableCell type='text' content={T.dateToText(item.namSinh, 'yyyy')} />
                    <TableCell type='text' content={this.mapperQuanHe[item.moiQuanHe]} />
                    <TableCell type='text' content={item.ngheNghiep} />
                    <TableCell type='text' content={item.noiCongTac} />
                    <TableCell type='buttons' content={item} permission={permission} onEdit={this.editQuanHe} onDelete={this.deleteQuanHe}></TableCell>
                </tr>)
        });

        const tableOwn = renderTable({
            getDataSource: () => itemOwn, stickyHead: false,
            renderHead: () => (
                <tr>
                    <th style={{ width: '30%' }}>Họ và tên</th>
                    <th style={{ width: '20%' }}>Năm sinh</th>
                    <th style={{ width: '10%' }}>Quan hệ</th>
                    <th style={{ width: '20%' }}>Nghề nghiệp</th>
                    <th style={{ width: '20%' }}>Nơi công tác</th>
                    <th style={{ width: 'auto', textAlign: 'center' }}>Thao tác</th>
                </tr>),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell type='link' content={item.hoTen} onClick={e => this.editQuanHe(e, item)} />
                    <TableCell type='text' content={T.dateToText(item.namSinh, 'yyyy')} />
                    <TableCell type='text' content={this.mapperQuanHe[item.moiQuanHe]} />
                    <TableCell type='text' content={item.ngheNghiep} />
                    <TableCell type='text' content={item.noiCongTac} />
                    <TableCell type='buttons' content={item} permission={permission} onEdit={this.editQuanHe} onDelete={this.deleteQuanHe}></TableCell>
                </tr>)
        });

        const tableNN = renderTable({
            getDataSource: () => itemsNN, stickyHead: false,
            renderHead: () => (
                <tr>
                    <th style={{ width: '30%' }}>Loại ngôn ngữ</th>
                    <th style={{ width: '70%' }}>Trình độ</th>
                    <th style={{ width: 'auto', textAlign: 'center' }}>Thao tác</th>
                </tr>),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell type='link' content={this.mapperNgonNgu[item.loaiNgonNgu]} onClick={e => this.editTrinhDoNN(e, item)} />
                    <TableCell type='text' content={item.trinhDo} />
                    <TableCell type='buttons' content={item} permission={permission} onEdit={this.editTrinhDoNN} onDelete={this.deleteTrinhDoNN}></TableCell>
                </tr>)
        });

        const tableToChucKhac = renderTable({
            getDataSource: () => cacToChucCTXHNN, stickyHead: false,
            renderHead: () => (
                <tr>
                    <th style={{ width: '50%' }}>Tên tổ chức</th>
                    <th style={{ width: '10%' }}>Ngày tham gia</th>
                    <th style={{ width: '40%' }}>Mô tả nội dung công việc tham gia tổ chức</th>
                    <th style={{ width: 'auto', textAlign: 'center' }}>Thao tác</th>
                </tr>),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell type='link' content={item.tenToChuc} onClick={e => this.editTrinhDoNN(e, item)} />
                    <TableCell type='date' content={item.ngayThamGia} dateFormat='dd/mm/yyyy' />
                    <TableCell type='text' content={item.moTa} />
                    <TableCell type='buttons' content={item} permission={permission} onEdit={this.editTrinhDoNN} onDelete={this.deleteTrinhDoNN}></TableCell>
                </tr>)
        });

        const tableHocTapCongTac = renderTable({
            getDataSource: () => hocTapCongTac, stickyHead: false,
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Thời gian</th>
                    <th style={{ width: '100%', whiteSpace: 'nowrap' }}>Nội dung</th>
                    <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>Thao tác</th>
                </tr>),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell type='number' content={index + 1} />
                    <TableCell type='link' content={`${T.dateToText(item.batDau, item.batDauType ? item.batDauType : 'dd/mm/yyyy')} ${item.ketThuc ? '-' : ''} ${item.ketThuc ? (item.ketThuc == -1 ? 'đến nay' : T.dateToText(item.ketThuc, item.ketThucType ? item.ketThucType : 'dd/mm/yyyy')) : ''}`} style={{ whiteSpace: 'nowrap' }} onClick={e => this.editHocTapCongTac(e, item)} />
                    <TableCell type='text' content={item.noiDung} />
                    <TableCell type='buttons' content={item} permission={permission} onEdit={this.editHocTapCongTac} onDelete={this.deleteHocTapCongTac}></TableCell>
                </tr>)
        });

        const tableDaoTao = renderTable({
            getDataSource: () => qtDaoTao, stickyHead: false,
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                    <th style={{ width: '50%', whiteSpace: 'nowrap' }}>Tên trường</th>
                    <th style={{ width: '50%', whiteSpace: 'nowrap' }}>Chuyên ngành</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Thời gian học</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Hình thức học</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Văn bằng, chứng chỉ</th>
                    <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>Thao tác</th>
                </tr>),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell type='number' content={index + 1} />
                    <TableCell type='link' content={item.tenTruong} onClick={e => this.editDaoTao(e, item)} />
                    <TableCell type='text' content={item.chuyenNganh} />
                    <TableCell type='text' content={item.thoiGian ? item.thoiGian + ' tháng' : `${item.batDau ? T.dateToText(item.batDau, item.batDauType ? item.batDauType : 'dd/mm/yyyy') : ''} ${item.ketThuc ? '-' : ''} ${item.ketThuc ? (item.ketThuc == -1 ? 'đến nay' : T.dateToText(item.ketThuc, item.ketThucType ? item.ketThucType : 'dd/mm/yyyy')) : ''}`} style={{ whiteSpace: 'nowrap' }} />
                    <TableCell type='text' content={item.hinhThuc} />
                    <TableCell type='text' content={item.loaiBangCap} />
                    <TableCell type='buttons' content={item} permission={permission} onEdit={this.editDaoTao} onDelete={this.deleteDaoTao}></TableCell>
                </tr>)
        });

        const tableNuocNgoai = renderTable({
            getDataSource: () => nuocNgoai, stickyHead: false,
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Thời gian</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Quốc gia</th>
                    <th style={{ width: '100%', whiteSpace: 'nowrap' }}>Nội dung</th>
                    <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>Thao tác</th>
                </tr>),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell type='number' content={index + 1} />
                    <TableCell type='link' content={`${T.dateToText(item.batDau, item.batDauType ? item.batDauType : 'dd/mm/yyyy')} ${item.ketThuc ? '-' : ''} ${item.ketThuc ? (item.ketThuc == -1 ? 'đến nay' : T.dateToText(item.ketThuc, item.ketThucType ? item.ketThucType : 'dd/mm/yyyy')) : ''}`} style={{ whiteSpace: 'nowrap' }} onClick={e => this.editNuocNgoai(e, item)} />
                    <TableCell type='text' content={item.quocGia} style={{ whiteSpace: 'nowrap' }} />
                    <TableCell type='text' content={item.noiDung} />
                    <TableCell type='buttons' content={item} permission={permission} onEdit={this.editNuocNgoai} onDelete={this.deleteNuocNgoai}></TableCell>
                </tr>)
        });

        const tableKhenThuong = renderTable({
            getDataSource: () => khenThuong, stickyHead: false,
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Thời gian</th>
                    <th style={{ width: '50%', whiteSpace: 'nowrap' }}>Nội dung</th>
                    <th style={{ width: '50%', whiteSpace: 'nowrap' }}>Cấp quyết định</th>
                    {/* <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>Thao tác</th> */}
                </tr>),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell type='number' content={index + 1} />
                    <TableCell type='text' content={`${T.dateToText(item.batDau, item.batDauType ? item.batDauType : 'dd/mm/yyyy')} ${item.ketThuc ? '-' : ''} ${item.ketThuc ? (item.ketThuc == -1 ? 'đến nay' : T.dateToText(item.ketThuc, item.ketThucType ? item.ketThucType : 'dd/mm/yyyy')) : ''}`} style={{ whiteSpace: 'nowrap' }} onClick={e => this.editKhenThuong(e, item)} />
                    <TableCell type='text' content={item.noiDung} />
                    <TableCell type='text' content={item.capQuyetDinh} />
                    {/* <TableCell type='buttons' content={item} permission={permission} onEdit={this.editKhenThuong} onDelete={this.deleteKhenThuong}></TableCell> */}
                </tr>)
        });

        const tableKyLuat = renderTable({
            getDataSource: () => kyLuat, stickyHead: false,
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Thời gian</th>
                    <th style={{ width: '50%', whiteSpace: 'nowrap' }}>Lý do, hình thức kỷ luật</th>
                    <th style={{ width: '50%', whiteSpace: 'nowrap' }}>Cấp quyết định</th>
                    {/* <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>Thao tác</th> */}
                </tr>),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell type='number' content={index + 1} />
                    <TableCell type='text' content={`${T.dateToText(item.batDau, item.batDauType ? item.batDauType : 'dd/mm/yyyy')} ${item.ketThuc ? '-' : ''} ${item.ketThuc ? (item.ketThuc == -1 ? 'đến nay' : T.dateToText(item.ketThuc, item.ketThucType ? item.ketThucType : 'dd/mm/yyyy')) : ''}`} style={{ whiteSpace: 'nowrap' }} onClick={e => this.editKyLuat(e, item)} />
                    <TableCell type='text' content={item.lyDoHinhThuc} />
                    <TableCell type='text' content={item.capQuyetDinh} />
                    {/* <TableCell type='buttons' content={item} permission={permission} onEdit={this.editKyLuat} onDelete={this.deleteKyLuat}></TableCell> */}
                </tr>)
        });

        const tableNghienCuuKhoaHoc = renderTable({
            getDataSource: () => nghienCuuKhoaHoc, stickyHead: false,
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                    <th style={{ width: '100%' }}>Tên đề tài</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Thời gian thực hiện</th>
                    <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>Thao tác</th>
                </tr>),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell type='number' content={index + 1} />
                    <TableCell type='link' content={item.tenDeTai} onClick={e => this.editNckh(e, item)} />
                    <TableCell type='text' content={`${T.dateToText(item.batDau, item.batDauType ? item.batDauType : 'dd/mm/yyyy')} ${item.ketThuc ? '-' : ''} ${item.ketThuc ? (item.ketThuc == -1 ? 'đến nay' : T.dateToText(item.ketThuc, item.ketThucType ? item.ketThucType : 'dd/mm/yyyy')) : ''}`} style={{ whiteSpace: 'nowrap' }} />
                    <TableCell type='buttons' content={item} permission={permission} onEdit={this.editNckh} onDelete={this.deleteNckh}></TableCell>
                </tr>)
        });

        const tableHuongDanLuanVan = renderTable({
            getDataSource: () => huongDanLuanVan, stickyHead: false,
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                    <th style={{ width: '30%' }}>Họ tên sinh viên</th>
                    <th style={{ width: '70%', }}>Tên luận văn</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Năm tốt nghiệp</th>
                    <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>Thao tác</th>
                </tr>),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell type='number' content={index + 1} />
                    <TableCell type='link' content={item.hoTen} onClick={e => this.editNckh(e, item)} />
                    <TableCell type='text' content={item.tenLuanVan} />
                    <TableCell type='text' content={item.namTotNghiep} />
                    <TableCell type='buttons' content={item} permission={permission} onEdit={this.editHuongDanLuanVan} onDelete={this.deleteHuongDanLuanVan}></TableCell>
                </tr>)
        });

        const tableSachGT = renderTable({
            getDataSource: () => sachGT, stickyHead: false,
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                    <th style={{ width: '70%' }}>Tên sách, giáo trình</th>
                    <th style={{ width: '30%', }}>Thể loại</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Năm xuất bản</th>
                    <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>Thao tác</th>
                </tr>),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell type='number' content={index + 1} />
                    <TableCell type='link' content={item.ten} onClick={e => this.editSachGT(e, item)} />
                    <TableCell type='text' content={item.theLoai} />
                    <TableCell type='text' content={item.namSanXuat} />
                    <TableCell type='buttons' content={item} permission={permission} onEdit={this.editSachGT} onDelete={this.deleteSachGT}></TableCell>
                </tr>)
        });

        const tableBaiVietKhoaHoc = renderTable({
            getDataSource: () => baiVietKhoaHoc, stickyHead: false,
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                    <th style={{ width: '50%' }}>Tên bài viết</th>
                    <th style={{ width: '50%', }}>Tên tạp chí</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Năm xuất bản</th>
                    <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>Thao tác</th>
                </tr>),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell type='number' content={index + 1} />
                    <TableCell type='link' content={item.tenBaiViet} onClick={e => this.editBaiVietKhoaHoc(e, item)} />
                    <TableCell type='text' content={item.tenTapChi} />
                    <TableCell type='text' content={item.namXuatBan} />
                    <TableCell type='buttons' content={item} permission={permission} onEdit={this.editBaiVietKhoaHoc} onDelete={this.deleteBaiVietKhoaHoc}></TableCell>
                </tr>)
        });

        const tableKyYeu = renderTable({
            getDataSource: () => kyYeu, stickyHead: false,
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                    <th style={{ width: '50%' }}>Tên tác giả</th>
                    <th style={{ width: '50%', }}>Tên bài viết</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Năm tổ chức</th>
                    <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>Thao tác</th>
                </tr>),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell type='number' content={index + 1} />
                    <TableCell type='link' content={item.tenTacGia} onClick={e => this.editKyYeu(e, item)} />
                    <TableCell type='text' content={item.tenBaiViet} />
                    <TableCell type='text' content={item.thoiGian} />
                    <TableCell type='buttons' content={item} permission={permission} onEdit={this.editKyYeu} onDelete={this.deleteKyYeu}></TableCell>
                </tr>)
        });

        const tableGiaiThuong = renderTable({
            getDataSource: () => giaiThuong, stickyHead: false,
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                    <th style={{ width: '50%' }}>Tên giải thưởng</th>
                    <th style={{ width: '50%', }}>Nội dung</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Năm cấp</th>
                    <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>Thao tác</th>
                </tr>),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell type='number' content={index + 1} />
                    <TableCell type='link' content={item.tenGiaiThuong} onClick={e => this.editGiaiThuong(e, item)} />
                    <TableCell type='text' content={item.noiDung} />
                    <TableCell type='text' content={item.namCap} />
                    <TableCell type='buttons' content={item} permission={permission} onEdit={this.editGiaiThuong} onDelete={this.deleteGiaiThuong}></TableCell>
                </tr>)
        });

        const tableBangPhatMinh = renderTable({
            getDataSource: () => bangPhatMinh, stickyHead: false,
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                    <th style={{ width: '50%' }}>Tên bằng</th>
                    <th style={{ width: '50%', }}>Số hiệu</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Năm cấp</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Loại bằng</th>
                    <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>Thao tác</th>
                </tr>),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell type='number' content={index + 1} />
                    <TableCell type='link' content={item.tenBang} onClick={e => this.editBangPhatMinh(e, item)} />
                    <TableCell type='text' content={item.soHieu} />
                    <TableCell type='text' content={item.namCap} />
                    <TableCell type='text' content={item.loaiBang} />
                    <TableCell type='buttons' content={item} permission={permission} onEdit={this.editBangPhatMinh} onDelete={this.deleteBangPhatMinh}></TableCell>
                </tr>)
        });

        const tableUngDung = renderTable({
            getDataSource: () => ungDungThuongMai, stickyHead: false,
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                    <th style={{ width: '70%' }}>Tên công nghệ, giải pháp hữu ích</th>
                    <th style={{ width: '30%', }}>Hình thức, quy mô, địa chỉ áp dụng</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Năm chuyển giao</th>
                    <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>Thao tác</th>
                </tr>),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell type='number' content={index + 1} />
                    <TableCell type='link' content={item.tenCongNghe} onClick={e => this.editUngDung(e, item)} />
                    <TableCell type='text' content={item.hinhThuc} />
                    <TableCell type='text' content={item.namChuyenGiao} />
                    <TableCell type='buttons' content={item} permission={permission} onEdit={this.editUngDung} onDelete={this.deleteUngDung}></TableCell>
                </tr>)
        });

        const tableLamViecNgoai = renderTable({
            getDataSource: () => lamViecNgoai, stickyHead: false,
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Thời gian</th>
                    <th style={{ width: '40%', whiteSpace: 'nowrap' }}>Nơi làm việc</th>
                    <th style={{ width: '60%', whiteSpace: 'nowrap' }}>Nội dung</th>
                    <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>Thao tác</th>
                </tr>),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell type='number' content={index + 1} />
                    <TableCell type='link' content={`${T.dateToText(item.batDau, item.batDauType ? item.batDauType : 'dd/mm/yyyy')} ${item.ketThuc ? '-' : ''} ${item.ketThuc ? (item.ketThuc == -1 ? 'đến nay' : T.dateToText(item.ketThuc, item.ketThucType ? item.ketThucType : 'dd/mm/yyyy')) : ''}`} style={{ whiteSpace: 'nowrap' }} onClick={e => this.editLamViecNgoai(e, item)} />
                    <TableCell type='text' content={item.noiLamViec} />
                    <TableCell type='text' content={item.noiDung} />
                    <TableCell type='buttons' content={item} permission={permission} onEdit={this.editLamViecNgoai} onDelete={this.deleteLamViecNgoai}></TableCell>
                </tr>)
        });

        const voChongText = this.state.phai ? (this.state.phai == '01' ? 'Vợ' : 'Chồng') : '';
        return (
            <main ref={this.main} className='app-content'>
                {this.state.isLoad && <Loading />}

                <div className='app-title'>
                    <h1><i className='fa fa-user' /> Trang thông tin cá nhân</h1>
                </div>
                {!this.state.canBo ? <div className='tile' >
                    <h3 className='tile-title'>THÔNG TIN CÁ NHÂN</h3>
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
                                <Select className='form-group col-md-4' ref={this.phai} adapter={SelectAdapter_DmGioiTinh} label='Giới tính' />

                                {/* </div> */}
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


                </div>
                    :
                    <div>
                        <div className='tile'>
                            <h3 className='tile-title'>Thông tin cá nhân</h3>
                            <div className='tile-body row'>
                                <div className='form-group col-md-3'>
                                    <label className='control-label'>Hình đại diện</label>
                                    <ImageBox ref={e => this.imageBox = e} postUrl='/user/upload' uploadType='ProfileImage' userData='profile' image={this.state.user && this.state.user.image} />
                                </div>
                                <div className='form-group col-md-9'>
                                    <div className='row'>
                                        <div className='form-group col-md-3'><TextInput ref={this.shcc} label='Mã thẻ cán bộ' placeholder='Mã thẻ cán bộ' disabled={!readOnly} maxLength={10} /></div>
                                        <div className='form-group col-md-9'><Select placeholder='Chọn đơn vị công tác' ref={this.maDonVi} adapter={SelectAdapter_DmDonVi} label='Đơn vị công tác' disabled={!readOnly} /></div>
                                        <div className='form-group col-md-4'><TextInput placeholder='Nhập họ và tên lót' ref={this.ho} label='Họ và tên lót' disabled={!readOnly} required maxLength={100} /></div>
                                        <div className='form-group col-md-4'><TextInput placeholder='Nhập tên' ref={this.ten} label='Tên' disabled={!readOnly} required maxLength={30} /></div>
                                        <div className='form-group col-md-4'><TextInput placeholder='Nhập tên gọi khác hay bí danh' ref={this.biDanh} label='Bí danh' maxLength={20} /></div>
                                    </div>
                                </div>

                                <div className='form-group col-md-3'><Select placeholder='Chọn giới tính' ref={this.phai} adapter={SelectAdapter_DmGioiTinh} label='Giới tính' disabled={!readOnly} /></div>
                                <div className='form-group col-md-3'><DateInput placeholder='Nhập ngày tháng năm sinh' ref={this.ngaySinh} label='Ngày tháng năm sinh' min={new Date(1900, 1, 1).getTime()} max={Date.nextYear(-10).roundDate().getTime()} /></div>
                                <div className='form-group col-md-3'><TextInput placeholder='Nhập số điện thoại cá nhân' ref={this.dienThoaiCaNhan} label='Số điện thoại cá nhân' disabled={readOnly} maxLength={20} /></div>
                                <div className='form-group col-md-3'> <TextInput ref={this.dienThoaiBaoTin} label='Số điện thoại khi cần báo tin' placeholder={'Trong trường hợp không liên lạc được với VC & NLĐ'} disabled={readOnly} maxLength={20} />
                                </div>

                                <ComponentDiaDiem ref={e => this.noiSinh = e} label='Nơi sinh' className='col-md-12' />
                                {/* <ComponentDiaDiem ref={e => this.nguyenQuan = e} label='Nguyên quán' className='col-md-12' /> */}
                                <ComponentDiaDiem ref={e => this.thuongTru = e} label='Địa chỉ thường trú' className='col-md-12' requiredSoNhaDuong={true} />
                                <p className='col-md-12'>
                                    Nếu <b>Địa chỉ thường trú</b> là <b>Địa chỉ hiện tại</b> thì&nbsp;<a href='#' onClick={this.copyAddress}>nhấp vào đây</a>.
                                </p>
                                <ComponentDiaDiem ref={e => this.hienTai = e} label='Nơi ở hiện tại' className='col-md-12' requiredSoNhaDuong={true} />

                                <div className='form-group col-md-4'><TextInput placeholder='Nhập số CMND / CCCD' ref={this.cmnd} label='Số CMND / CCCD' disabled={readOnly} maxLength={15} /></div>
                                <div className='form-group col-md-4'><DateInput ref={this.cmndNgayCap} label='Ngày cấp CMND/ CCCD' disabled={readOnly} min={new Date(1900, 1, 1).getTime()} max={new Date().getTime()} /></div>
                                <div className='form-group col-md-4'>
                                    <TextInput ref={this.cmndNoiCap} label='Nơi cấp CMND / CCCD' disabled={readOnly} maxLength={200} />
                                </div>

                                <div className='form-group col-md-6'><TextInput ref={this.emailCaNhan} label='Địa chỉ email cá nhân' placeholder='Nhập địa chỉ email cá nhân' disabled={readOnly} maxLength={50} /></div>
                                <div className='form-group col-md-6'><TextInput ref={this.email} label='Địa chỉ email trường' placeholder='Nhập địa chỉ email trường' disabled={!readOnly} maxLength={50} /></div>

                                <div className='form-group col-md-4'><Select ref={this.quocGia} adapter={SelectAdapter_DmQuocGia} label='Quốc tịch' placeholder='Chọn quốc tịch' /></div>
                                <div className='form-group col-md-4'><Select ref={this.danToc} adapter={SelectAdapter_DmDanToc} label='Dân tộc' placeholder='Chọn dân tộc' /></div>
                                <div className='form-group col-md-4'><Select ref={this.tonGiao} adapter={SelectAdapter_DmTonGiao} label='Tôn giáo' placeholder='Chọn tôn giáo' /></div>

                                <div className='form-group col-md-3'><TextInput ref={this.sucKhoe} label='Tình trang sức khỏe' placeholder='Nhập tình trạng sức khỏe' disabled={readOnly} maxLength={100} /></div>
                                <div className='form-group col-md-3'><NumberInput ref={this.chieuCao} label='Chiều cao (cm)' placeholder='Nhập chiều cao' disabled={readOnly} min={0} step={1} /></div>
                                <div className='form-group col-md-3'><NumberInput ref={this.canNang} label='Cân nặng (kg)' placeholder='Nhập cân nặng' disabled={readOnly} min={0} step={0.1} /></div>
                                <div className='form-group col-md-3'><Select ref={this.nhomMau} adapter={SelectAdapter_DmNhomMau} label='Nhóm máu' placeholder='Chọn nhóm máu' disabled={readOnly} /></div>

                                <div className='form-group col-md-6'><TextareaInput ref={this.soTruong} label='Sở trường / Năng khiếu / Ưu điểm' placeholder='Trong công tác/nghiên cứu/hoạt động nghệ thuật…' disabled={readOnly} maxLength={100} /></div>
                                <div className='form-group col-md-6'><TextareaInput ref={this.tuNhanXet} label='Tự nhận xét' placeholder='Khuyết điểm / Hạn chế' disabled={readOnly} maxLength={100} /></div>

                                <div className='form-group col-md-12'>
                                    <BooleanInput ref={this.doanVien} label='Đoàn viên đoàn TNCS HCM:   &nbsp;' disabled={readOnly} onChange={value => this.setState({ doanVien: value })} />
                                </div>
                                {this.state.doanVien &&
                                    <>
                                        <div className='form-group col-md-4'><DateInput ref={this.ngayVaoDoan} label='Ngày vào Đoàn' disabled={readOnly} min={new Date(1900, 1, 1).getTime()} max={new Date().getTime()} /></div>
                                        <div className='form-group col-md-8'><TextInput ref={this.noiVaoDoan} label='Nơi vào Đoàn' disabled={readOnly} maxLength={200} /></div>
                                    </>}

                                <div className='form-group col-md-12'>
                                    <BooleanInput ref={this.dangVien} label='Đảng viên Đảng CSVN:  &nbsp;' disabled={readOnly} onChange={value => this.setState({ dangVien: value })} />
                                </div>
                                {this.state.dangVien &&
                                    <>
                                        {/* {this.state.dangVien && item.chucVuDang ? renderFieldText('form-group col-md-4', 'Chức vụ trong Đảng', item.chucVuDang, item.chucVuDang) : null}
                                        <div className='form-group col-md-4'><TextInput ref={this.soTheDang} label='Số thẻ Đảng' required={this.state.dangVien} disabled={readOnly} maxLength={200} /></div> */}
                                        <div className='form-group col-md-3'><DateInput ref={this.ngayVaoDang} label='Ngày vào Đảng (Dự bị)' disabled={readOnly} min={new Date(1900, 1, 1).getTime()} max={new Date().getTime()} /></div>
                                        <div className='form-group col-md-3'><TextInput ref={this.noiDangDb} label='Nơi vào Đảng (Dự bị)' disabled={readOnly} maxLength={200} /></div>
                                        <div className='form-group col-md-3'><DateInput ref={this.ngayVaoDangChinhThuc} label='Ngày vào Đảng chính thức' disabled={readOnly} min={new Date(1900, 1, 1).getTime()} max={new Date().getTime()} /></div>
                                        <div className='form-group col-md-3'><TextInput ref={this.noiDangCt} label='Nơi vào Đảng chính thức' disabled={readOnly} maxLength={200} /></div>
                                    </>}

                                <div className='form-group col-md-12'>
                                    <BooleanInput ref={this.congDoan} label='Công đoàn viên:   &nbsp;' disabled={readOnly} onChange={value => this.setState({ congDoan: value })} />
                                </div>
                                {this.state.congDoan &&
                                    <>
                                        <div className='form-group col-md-4'><DateInput ref={this.ngayVaoCongDoan} label='Ngày kết nạp Công đoàn' disabled={readOnly} min={new Date(1900, 1, 1).getTime()} max={new Date().getTime()} /></div>
                                        <div className='form-group col-md-8'><DateInput ref={this.noiVaoCongDoan} label='Nơi kết nạp Công đoàn viên' disabled={readOnly} min={new Date(1900, 1, 1).getTime()} max={new Date().getTime()} /></div>
                                    </>}

                                <div className='form-group col-md-12'>
                                    <p>Tổ chức Chính trị - Xã hội nghề nghiệp khác:</p>
                                    <div className='tile-body'>{tableToChucKhac}</div>
                                    <div className='tile-footer' style={{ textAlign: 'right' }}>
                                        <button className='btn btn-info' type='button' onClick={e => this.create(e, this.modalNN)}>
                                            <i className='fa fa-fw fa-lg fa-plus' />Thêm tổ chức tham gia
                                        </button>
                                    </div>
                                </div>

                                <div className='form-group col-md-4'><DateInput ref={this.ngayNhapNgu} label='Thời gian nhập ngũ' placeholder='Nhập thời gian nhập ngũ' disabled={readOnly} min={Date.getDateInputDefaultMin()} max={new Date().getTime()} onChange={value => this.setState({ ngayNhapNgu: value })} /></div>
                                <div className='form-group col-md-4'><DateInput ref={this.ngayXuatNgu} label='Thời gian xuất ngũ' disabled={readOnly} min={this.state.ngayNhapNgu === '' ? Date.getDateInputDefaultMin() : new Date(this.state.ngayNhapNgu).getTime()} max={new Date().getTime()} /></div>
                                <div className='form-group col-md-4'><TextInput ref={this.quanHamCaoNhat} label='Quân hàm / Cấp bậc cao nhất' disabled={readOnly} /></div>
                                <div className='form-group col-md-4'><TextInput ref={this.hangThuongBinh} label='Hạng thương binh' disabled={readOnly} /></div>
                                <div className='form-group col-md-4'><TextInput placeholder='Nhập gia đình chính sách' ref={this.giaDinhChinhSach} label='Gia đình chính sách' disabled={readOnly} /></div>
                                <div className='form-group col-md-4'><TextInput placeholder='Nhập danh hiệu cao nhất được phong tặng cao nhẩt' ref={this.danhHieu} label='Danh hiệu được phong tặng cao nhất' disabled={readOnly} /></div>
                            </div>


                        </div>
                        <div className='tile'>
                            <h3 className='tile-title'>Thông tin người thân</h3>
                            <ul className='nav nav-tabs' id='myTab' role='tablist'>
                                <li className='nav-item'>
                                    <a className='nav-link active' id='infoQuanHe0' data-toggle='tab' href='#infoQuanHe0Content' role='tab' aria-controls='infoQuanHe0Content' aria-selected='true'>Về gia đình</a>
                                </li>
                                <li className='nav-item'>
                                    <a className='nav-link' id='infoQuanHe1' data-toggle='tab' href='#infoQuanHe1Content' role='tab' aria-controls='infoQuanHe1Content' aria-selected='false'>Về bản thân</a>
                                </li>
                                <li className='nav-item'>
                                    <a className='nav-link' id='infoQuanHe2' data-toggle='tab' href='#infoQuanHe2Content' role='tab' aria-controls='infoQuanHe2Content' aria-selected='false'>Về bên {voChongText == 'Vợ' ? 'vợ' : 'chồng'}</a>
                                </li>
                            </ul>
                            <div className='tab-content' style={{ paddingTop: '10px' }}>
                                <div className='tab-pane fade show active' id='infoQuanHe0Content' role='tabpanel' aria-labelledby='infoQuanHe0'>
                                    <p>{voChongText}, các con</p>
                                    <div className='tile-body'>{tableOwn}</div>
                                    <div className='tile-footer' style={{ textAlign: 'right' }}>
                                        <button className='btn btn-info' type='button' onClick={e => this.createRelation(e, 2)}>
                                            <i className='fa fa-fw fa-lg fa-plus' />Thêm thông tin người thân
                                        </button>
                                    </div>
                                </div>
                                <div className='tab-pane fade' id='infoQuanHe1Content' role='tabpanel' aria-labelledby='infoQuanHe1'>
                                    <p>Cha, mẹ, anh chị em ruột</p>
                                    <div className='tile-body'>{table}</div>
                                    <div className='tile-footer' style={{ textAlign: 'right' }}>
                                        <button className='btn btn-info' type='button' onClick={e => this.createRelation(e, 0)}>
                                            <i className='fa fa-fw fa-lg fa-plus' />Thêm thông tin người thân
                                        </button>
                                    </div>
                                </div>
                                <div className='tab-pane fade' id='infoQuanHe2Content' role='tabpanel' aria-labelledby='infoQuanHe2'>
                                    <p>Cha, mẹ, anh chị em ruột</p>
                                    <div className='tile-body'>{tableInLaw}</div>
                                    <div className='tile-footer' style={{ textAlign: 'right' }}>
                                        <button className='btn btn-info' type='button' onClick={e => this.createRelation(e, 1)}>
                                            <i className='fa fa-fw fa-lg fa-plus' />Thêm thông tin người thân
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className='tile'>
                            <h3 className='tile-title'>Thông tin công tác</h3>
                            <div className='tile-body row'>
                                <div className='form-group col-md-6'><TextInput ref={this.ngheNghiepCu} label='Nghề nghiệp trước khi tuyển dụng' disabled={readOnly} maxLength={100} /></div>
                                <div className='form-group col-md-6'><DateInput placeholder='Ngày, tháng, năm ký hợp đồng lao động lần đầu với Trường' ref={this.ngayBatDauCongTac} label='Ngày bắt đầu làm việc tại Trường' disabled={readOnly} min={new Date(1900, 1, 1).getTime()} max={Date.getDateInputDefaultMax()} /></div>

                                <div className='form-group col-md-6'><DateInput placeholder='Ngày, tháng, năm quyết định tuyển dụng, bổ nhiệm ngạch, chức danh' ref={this.ngayBienChe} label='Ngày vào biên chế / tuyển dụng' disabled={readOnly} min={new Date(1900, 1, 1).getTime()} max={new Date().getTime()} /></div>
                                <div className='form-group col-md-6'><Select placeholder='Chọn cơ quan, đơn vị ban hành Quyết định tuyển dụng' adapter={SelectAdapter_DmDonVi} ref={this.donViTuyenDung} label='Cơ quan, đơn vị ban hành Quyết định tuyển dụng' disabled={readOnly} /></div>
                                <div className='form-group col-md-4'><Select ref={this.chucDanh} adapter={SelectAdapter_DmNgachCdnn} label='Chức danh nghề nghiệp' disabled={readOnly} /></div>
                                <div className='form-group col-md-4'><Select ref={this.hopDongCanBo} adapter={SelectAdapter_DmDienHopDong} label='Diện hợp đồng' disabled={readOnly} /></div>
                                <div className='form-group col-md-4'><Select ref={this.loaiHopDong} adapter={SelectAdapter_DmLoaiHopDong} label='Loại hợp đồng' disabled={readOnly} /></div>
                                <div className='form-group col-md-12'>
                                    <div className='tile-body'>
                                        <p>Chức vụ:</p>
                                        {chucVuShow(chucVu)}
                                    </div>
                                </div>
                                <div className='col-md-3 form-group'><NumberInput ref={this.heSoLuong} label='Hệ số lương' disabled={!readOnly} min={0} max={1000} step={0.01} /></div>
                                <div className='col-md-3 form-group'><NumberInput ref={this.bacLuong} label='Bậc lương' disabled={!readOnly} min={0} max={1000} /></div>
                                <div className='col-md-3 form-group'><DateInput ref={this.ngayHuongLuong} label='Ngày hưởng lương' disabled={!readOnly} min={new Date(1900, 1, 1).getTime()} max={Date.getDateInputDefaultMax()} /></div>
                                <div className='col-md-3 form-group'><NumberInput ref={this.tyLeVuotKhung} label='Tỉ lệ vượt khung' disabled={!readOnly} min={0} max={100} /></div>

                                <div className='form-group col-md-4'><TextInput ref={this.soBhxh} label='Số Bảo hiểm xã hội' /></div>
                                <div className='col-md-4 form-group'><DateInput ref={this.ngayBatDauBhxh} label='Ngày bắt đầu BHXH' disabled={readOnly} min={new Date(1900, 1, 1).getTime()} /></div>
                                <div className='col-md-4 form-group'><DateInput ref={this.ngayKetThucBhxh} label='Ngày kết thúc BHXH' disabled={readOnly} min={new Date(1900, 1, 1).getTime()} /></div>

                                <div className='form-group col-md-4'><TextInput ref={this.maTheBhyt} label='Mã thẻ Bảo hiểm y tế' /></div>
                                <div className='form-group col-md-4'><Select adapter={SelectAdapter_DmBenhVien} ref={this.noiKhamChuaBenhBanDau} label='Nơi khám chữa bệnh ban đầu' /></div>
                                <div className='form-group col-md-4'><NumberInput ref={this.quyenLoiKhamChuaBenh} label='Quyền lợi khám chữa bệnh (%)' /></div>
                                <div className='form-group col-md-6'><BooleanInput ref={this.doiTuongBoiDuongKienThucQpan} label='Đối tượng bồi dưỡng kiến thức Quốc phòng - An ninh:   &nbsp;'
                                    disabled={readOnly} onChange={value => this.setState({ doiTuongBoiDuongKienThucQpan: value })} /></div>
                                {
                                    this.state.doiTuongBoiDuongKienThucQpan && <>
                                        <div className='form-group col-md-6'><BooleanInput ref={this.tinhTrangBoiDuong} label='Đã tham gia bồi dưỡng:   &nbsp;'
                                            disabled={readOnly} onChange={value => this.setState({ tinhTrangBoiDuong: value })} /></div>
                                        {
                                            this.state.tinhTrangBoiDuong && <>
                                                <div className='form-group col-md-6'><TextInput ref={this.namBoiDuong} label='Năm bồi dưỡng' /></div>
                                                <div className='form-group col-md-6'><TextInput ref={this.khoaBoiDuong} label='Khóa bồi dưỡng' /></div>
                                            </>
                                        }
                                    </>
                                }
                                <div className='form-group col-md-12'>
                                    <BooleanInput ref={this.dangONuocNgoai} label='Đang ở nước ngoài:   &nbsp;' disabled={readOnly} onChange={value => this.setState({ nuocNgoai: value })} />
                                </div>
                                {this.state.nuocNgoai && <>
                                    <div className='form-group col-md-4'><Select ref={this.quocGiaDangO} label='Quốc gia' adapter={SelectAdapter_DmQuocGia} disabled={readOnly} /></div>
                                    <div className='form-group col-md-4'><DateInput ref={this.ngayBatDauONuocNgoai} label='Ngày bắt đầu' disabled={readOnly} min={new Date(1900, 1, 1).getTime()} /></div>
                                    <div className='form-group col-md-4'><DateInput ref={this.ngayKetThucONuocNgoai} label='Ngày kết thúc' disabled={readOnly} min={new Date(1900, 1, 1).getTime()} /></div>
                                    <div className='form-group col-md-12'><TextareaInput ref={this.lyDoONuocNgoai} label='Lý do ở nước ngoài' disabled={readOnly} maxLength={200} /></div>
                                </>}
                                {this.state.phai == '02' && <>
                                    <div className='form-group col-md-12'>
                                        <BooleanInput ref={this.dangNghiThaiSan} label='Đang nghỉ thai sản:   &nbsp;' disabled={readOnly} onChange={value => this.setState({ nghiThaiSan: value })} />
                                    </div>
                                    {this.state.nghiThaiSan && <>
                                        <div className='form-group col-md-6'><DateInput ref={this.ngayBatDauNghiThaiSan} label='Ngày bắt đầu nghỉ' disabled={readOnly} min={new Date(1900, 1, 1).getTime()} /></div>
                                        <div className='form-group col-md-6'><DateInput ref={this.ngayKetThucNghiThaiSan} label='Ngày kết thúc nghỉ' disabled={readOnly} min={new Date(1900, 1, 1).getTime()} /></div>
                                    </>}
                                </>}
                                <div className='form-group col-md-12'>
                                    <BooleanInput ref={this.dangNghiKhongHuongLuong} label='Đang nghỉ không hưởng lương:   &nbsp;' disabled={readOnly} onChange={value => this.setState({ nghiKhongLuong: value })} />
                                </div>
                                {this.state.nghiKhongLuong && <>
                                    <div className='form-group col-md-6'><DateInput ref={this.ngayBatDauNghiKhongHuongLuong} label='Ngày bắt đầu nghỉ' disabled={readOnly} min={new Date(1900, 1, 1).getTime()} /></div>
                                    <div className='form-group col-md-6'><DateInput ref={this.ngayKetThucNghiKhongHuongLuong} label='Ngày kết thúc nghỉ' disabled={readOnly} min={new Date(1900, 1, 1).getTime()} /></div>
                                    <div className='form-group col-md-12'><TextareaInput ref={this.lyDoNghiKhongHuongLuong} label='Lý do nghỉ' disabled={readOnly} maxLength={200} /></div>
                                </>}

                            </div>
                        </div>

                        <div className='tile'>
                            <h3 className='tile-title'>Quá trình công tác</h3>
                        </div>

                        <div className='tile'>
                            <h3 className='tile-title'>TRÌNH ĐỘ HỌC VẤN</h3>
                            <div className='tile-body row'>
                                <div className='form-group col-xl-4 col-md-6'><TextInput ref={this.trinhDoPhoThong} label='Trình độ văn hóa (12/12)' disabled={readOnly} /></div>
                                <div className='form-group col-xl-4 col-md-6'><TextInput ref={this.noiTotNghiep} label='Nơi tốt nghiệp' disabled={readOnly} /></div>
                                <div className='form-group col-xl-4 col-md-6'><DateInput ref={this.namTotNghiep} label='Năm tốt nghiệp' disabled={readOnly} type='year' max={new Date().getTime()} /></div>
                                <div className='form-group col-md-4'><DateInput ref={this.namChucDanh} label='Năm công nhận chức danh' disabled={readOnly} type='year' max={new Date().getTime()} /></div>
                                <div className='form-group col-md-4'><Select ref={this.hocVi} adapter={SelectAdapter_DmTrinhDo} label='Trình độ chuyên môn cao nhất' disabled={readOnly} /></div>
                                <div className='form-group col-md-4'><DateInput ref={this.namHocVi} label='Năm công nhận trình độ chuyên môn cao nhất' disabled={readOnly} type='year' max={new Date().getTime()} /></div>
                                <div className='form-group col-md-4'><TextInput ref={this.chuyenNganh} label='Chuyên ngành' disabled={readOnly} /></div>
                                <div className='form-group col-md-4'><Select ref={this.maTrinhDoLlct} adapter={SelectAdapter_DmTrinhDoLyLuanChinhTri} label='Trình độ lý luận chính trị' /></div>
                                <div className='form-group col-md-4'><Select ref={this.maTrinhDoQlnn} adapter={SelectAdapter_DmTrinhDoQuanLyNhaNuoc} label='Trình độ quản lý nhà nước' /></div>
                                <div className='form-group col-md-4'><Select ref={this.maTrinhDoTinHoc} adapter={SelectAdapter_DmTrinhDoTinHoc} label='Trình độ tin học' /></div>

                            </div>
                            <div>
                                <h4>Trình độ ngoại ngữ {!itemsNN || itemsNN.length == 0 ? <strong>: Không có thông tin</strong> : ''}</h4>
                                <div className='tile-body'>{tableNN}</div>
                                <div className='tile-footer' style={{ textAlign: 'right' }}>
                                    <button className='btn btn-info' type='button' onClick={e => this.create(e, this.modalNN)}>
                                        <i className='fa fa-fw fa-lg fa-plus' />Thêm trình độ ngoại ngữ
                                    </button>
                                </div>
                            </div>
                        </div>
                        <div className='tile'>
                            <h3 className='tile-title'>Quá trình học tập công tác</h3>
                            <div className='tile-body'>
                                {tableHocTapCongTac}
                            </div>
                            <div className='tile-footer' style={{ textAlign: 'right' }}>
                                <button className='btn btn-info' type='button' onClick={e => this.create(e, this.modalHocTapCongTac)}>
                                    <i className='fa fa-fw fa-lg fa-plus' />Thêm quá trình
                                </button>
                            </div>
                        </div>
                        <div className='tile'>
                            <h3 className='tile-title'>Quá trình đào tạo</h3>
                            <div className='tile-body'>
                                {tableDaoTao}
                            </div>
                            <div className='tile-footer' style={{ textAlign: 'right' }}>
                                <button className='btn btn-info' type='button' onClick={e => this.create(e, this.modalDaoTao)}>
                                    <i className='fa fa-fw fa-lg fa-plus' />Thêm quá trình
                                </button>
                            </div>
                        </div>
                        <div className='tile'>
                            <h3 className='tile-title'>Quá trình đi nước ngoài</h3>
                            <div className='tile-body'>
                                {tableNuocNgoai}
                            </div>
                            <div className='tile-footer' style={{ textAlign: 'right' }}>
                                <button className='btn btn-info' type='button' onClick={e => this.create(e, this.modalNuocNgoai)}>
                                    <i className='fa fa-fw fa-lg fa-plus' />Thêm quá trình
                                </button>
                            </div>
                        </div>
                        <div className='tile'>
                            <h3 className='tile-title'>Quá trình khen thưởng</h3>
                            <div className='tile-body'>
                                {tableKhenThuong}
                            </div>
                            <div className='tile-footer' style={{ textAlign: 'right' }}>
                                {/* <button className='btn btn-info' type='button' onClick={e => this.create(e, this.modalKhenThuong)}>
                                    <i className='fa fa-fw fa-lg fa-plus' />Thêm quá trình
                                </button> */}
                            </div>
                        </div>
                        <div className='tile'>
                            <h3 className='tile-title'>Quá trình kỷ luật</h3>
                            <div className='tile-body'>
                                {tableKyLuat}
                            </div>
                            <div className='tile-footer' style={{ textAlign: 'right' }}>
                                {/* <button className='btn btn-info' type='button' onClick={e => this.create(e, this.modalKyLuat)}>
                                    <i className='fa fa-fw fa-lg fa-plus' />Thêm quá trình
                                </button> */}
                            </div>
                        </div>
                        <div className='tile'>
                            <h3 className='tile-title'>Quá trình nghiên cứu khoa học</h3>
                            <div className='tile-body'>
                                {tableNghienCuuKhoaHoc}
                            </div>
                            <div className='tile-footer' style={{ textAlign: 'right' }}>
                                <button className='btn btn-info' type='button' onClick={e => this.create(e, this.modalNckh)}>
                                    <i className='fa fa-fw fa-lg fa-plus' />Thêm quá trình
                                </button>
                            </div>
                        </div>
                        <div className='tile'>
                            <h3 className='tile-title'>Quá trình hướng dẫn luận văn</h3>
                            <div className='tile-body'>
                                {tableHuongDanLuanVan}
                            </div>
                            <div className='tile-footer' style={{ textAlign: 'right' }}>
                                <button className='btn btn-info' type='button' onClick={e => this.create(e, this.modalHuongDanLv)}>
                                    <i className='fa fa-fw fa-lg fa-plus' />Thêm quá trình
                                </button>
                            </div>
                        </div>
                        <div className='tile'>
                            <h3 className='tile-title'>Sách, giáo trình</h3>
                            <div className='tile-body'>
                                {tableSachGT}
                            </div>
                            <div className='tile-footer' style={{ textAlign: 'right' }}>
                                <button className='btn btn-info' type='button' onClick={e => this.create(e, this.modalSachGT)}>
                                    <i className='fa fa-fw fa-lg fa-plus' />Thêm sách, giáo trình
                                </button>
                            </div>
                        </div>
                        <div className='tile'>
                            <h3 className='tile-title'>Bài viết khoa học</h3>
                            <div className='tile-body'>
                                {tableBaiVietKhoaHoc}
                            </div>
                            <div className='tile-footer' style={{ textAlign: 'right' }}>
                                <button className='btn btn-info' type='button' onClick={e => this.create(e, this.modalBaiVietKhoaHoc)}>
                                    <i className='fa fa-fw fa-lg fa-plus' />Thêm bài viết
                                </button>
                            </div>
                        </div>
                        <div className='tile'>
                            <h3 className='tile-title'>Kỷ yếu hội nghị, hội thảo</h3>
                            <div className='tile-body'>
                                {tableKyYeu}
                            </div>
                            <div className='tile-footer' style={{ textAlign: 'right' }}>
                                <button className='btn btn-info' type='button' onClick={e => this.create(e, this.modalKyYeu)}>
                                    <i className='fa fa-fw fa-lg fa-plus' />Thêm kỷ yếu
                                </button>
                            </div>
                        </div>
                        <div className='tile'>
                            <h3 className='tile-title'>Giải thưởng đã đạt được</h3>
                            <div className='tile-body'>
                                {tableGiaiThuong}
                            </div>
                            <div className='tile-footer' style={{ textAlign: 'right' }}>
                                <button className='btn btn-info' type='button' onClick={e => this.createGiaiThuong(e)}>
                                    <i className='fa fa-fw fa-lg fa-plus' />Thêm giải thưởng
                                </button>
                            </div>
                        </div>
                        <div className='tile'>
                            <h3 className='tile-title'>Bằng phát minh, sáng chế (patent), giải pháp hữu ích</h3>
                            <div className='tile-body'>
                                {tableBangPhatMinh}
                            </div>
                            <div className='tile-footer' style={{ textAlign: 'right' }}>
                                <button className='btn btn-info' type='button' onClick={e => this.createBangPhatMinh(e)}>
                                    <i className='fa fa-fw fa-lg fa-plus' />Thêm bằng phát minh
                                </button>
                            </div>
                        </div>
                        <div className='tile'>
                            <h3 className='tile-title'>Ứng dụng thực tiễn và thương mại hóa kết quả nghiên cứu</h3>
                            <div className='tile-body'>
                                {tableUngDung}
                            </div>
                            <div className='tile-footer' style={{ textAlign: 'right' }}>
                                <button className='btn btn-info' type='button' onClick={e => this.createUngDung(e)}>
                                    <i className='fa fa-fw fa-lg fa-plus' />Thêm ứng dụng
                                </button>
                            </div>
                        </div>
                        <div className='tile'>
                            <h3 className='tile-title'>Tham gia làm việc tại Trường Đại học, Viện, Trung tâm nghiên cứu theo lời mời</h3>
                            <div className='tile-body'>
                                {tableLamViecNgoai}
                            </div>
                            <div className='tile-footer' style={{ textAlign: 'right' }}>
                                <button className='btn btn-info' type='button' onClick={e => this.createLamViecNgoai(e)}>
                                    <i className='fa fa-fw fa-lg fa-plus' />Thêm thông tin
                                </button>
                            </div>
                        </div>
                        {/* <div className='tile'>
                    <h3 className='tile-title'>Thông tin lương và mốc thời gian</h3>
                    <div className='tile-body row'>
                        <div className='col-lg-4 col-md-6 form-group'><DateInput ref={this.ngayBatDauCongTac} label='Ngày bắt đầu công tác' disabled={readOnly} min={new Date(1900, 1, 1).getTime()} max={Date.getDateInputDefaultMax()} /></div>
                        <div className='col-lg-4 col-md-6 form-group'><DateInput ref={this.ngayVao} label='Ngày vào' disabled={readOnly} min={new Date(1900, 1, 1).getTime()} max={new Date().getTime()} onChange={value => this.setState({ ngayVao: value })} /></div>
                        <div className='col-lg-4 col-md-6 form-group'><DateInput ref={this.ngayNghi} label='Ngày nghỉ' disabled={readOnly} min={this.state.ngayVao === '' ? Date.getDateInputDefaultMin() : new Date(this.state.ngayVao).getTime()} max={new Date().getTime()} /></div>

                        <div className='col-lg-4 col-md-6 form-group'><DateInput ref={this.ngayCbgd} label='Ngày cán bộ giảng dạy' disabled={readOnly} min={new Date(1900, 1, 1).getTime()} max={Date.getDateInputDefaultMax()} /></div>
                        <div className='col-lg-4 col-md-6 form-group'><DateInput ref={this.ngayBienChe} label='Ngày biên chế' disabled={readOnly} min={new Date(1900, 1, 1).getTime()} max={new Date().getTime()} /></div>
                        
                        <div className='col-lg-3 col-md-6 form-group'><NumberInput ref={this.heSoLuong} label='Hệ số lương' disabled={readOnly} min={0} max={1000} step={0.01} /></div>
                        <div className='col-lg-3 col-md-6 form-group'><NumberInput ref={this.bacLuong} label='Bậc lương' disabled={readOnly} min={0} max={1000} /></div>
                        <div className='col-lg-3 col-md-6 form-group'><DateInput ref={this.mocNangLuong} label='Mốc nâng lương' disabled={readOnly} /></div>

                        <div className='col-lg-3 col-6 form-group'><NumberInput ref={this.phuCapCongViec} label='Phụ cấp công việc' disabled={readOnly} min={0} max={1000} /></div>
                        <div className='col-lg-3 col-6 form-group'><DateInput ref={this.ngayPhuCapCongViec} label='Ngày phụ cấp công việc' disabled={readOnly} min={new Date(1900, 1, 1).getTime()} max={new Date().getTime()} /></div>
                    </div>
                </div> */}
                        {
                            readOnly ? null :
                                <button type='button' title='Save' className='btn btn-primary btn-circle' style={{ position: 'fixed', right: '10px', bottom: '10px' }} onClick={this.save}>
                                    <i className='fa fa-lg fa-save' />
                                </button>
                        }
                        <RelationModal ref={e => this.modal = e} create={this.props.createQuanHeStaffUser} update={this.props.updateQuanHeStaffUser} getData={this.props.userGetStaff} />,
                        <TrinhDoNNModal ref={e => this.modalNN = e} create={this.props.createTrinhDoNNStaffUser} update={this.props.updateTrinhDoNNStaffUser} getData={this.props.userGetStaff} />,
                        {/* <HocTapCongTacModal ref={e => this.modalHocTapCongTac = e} create={this.props.createQTHTCTStaffUser} update={this.props.updateQTHTCTStaffUser} getData={this.props.userGetStaff} />, */}
                        <DaoTaoModal ref={e => this.modalDaoTao = e} create={this.props.createQtDaoTaoStaffUser} update={this.props.updateQtDaoTaoStaffUser} getData={this.props.userGetStaff} />,
                        <NuocNgoaiModal ref={e => this.modalNuocNgoai = e} create={this.props.createQtNuocNgoaiStaffUser} update={this.props.updateQtNuocNgoaiStaffUser} getData={this.props.userGetStaff} />,
                        <KhenThuongModal ref={e => this.modalKhenThuong = e} create={this.props.createQtKhenThuongStaffUser} update={this.props.updateQtKhenThuongStaffUser} getData={this.props.userGetStaff} />,
                        <KyLuatModal ref={e => this.modalKyLuat = e} create={this.props.createQtKyLuatStaffUser} update={this.props.updateQtKyLuatStaffUser} getData={this.props.userGetStaff} />,
                        <NckhModal ref={e => this.modalNckh = e} create={this.props.createQtNckhStaffUser} update={this.props.updateQtNckhStaffUser} getData={this.props.userGetStaff} />,
                        <HuongDanLvModal ref={e => this.modalHuongDanLv = e} create={this.props.createQtHuongDanLVStaffUser} update={this.props.updateQtHuongDanLVStaffUser} getData={this.props.userGetStaff} />,
                        <SachGTModal ref={e => this.modalSachGT = e} create={this.props.createSachGTStaffUser} update={this.props.updateSachGTStaffUser} getData={this.props.userGetStaff} />,
                        <BaiVietKhoaHocModal ref={e => this.modalBaiVietKhoaHoc = e} create={this.props.createQtBaiVietKhoaHocStaffUser} update={this.props.updateQtBaiVietKhoaHocStaffUser} getData={this.props.userGetStaff} />,
                        <KyYeuModal ref={e => this.modalKyYeu = e} create={this.props.createQtKyYeuStaffUser} update={this.props.updateQtKyYeuStaffUser} getData={this.props.userGetStaff} />,
                        <GiaiThuongModal ref={e => this.modalGiaiThuong = e} create={this.props.createQtGiaiThuongStaffUser} update={this.props.updateQtGiaiThuongStaffUser} getData={this.props.userGetStaff} />,
                        <BangPhatMinhModal ref={e => this.modalBangPhatMinh = e} create={this.props.createQtBangPhatMinhStaffUser} update={this.props.updateQtBangPhatMinhStaffUser} getData={this.props.userGetStaff} />,
                        <UngDungModal ref={e => this.modalUngDung = e} create={this.props.createQtUngDungThuongMaiStaffUser} update={this.props.updateQtUngDungThuongMaiStaffUser} getData={this.props.userGetStaff} />,
                        <LamViecNgoaiModal ref={e => this.modalLamViecNgoai = e} create={this.props.createQtLamViecNgoaiStaffUser} update={this.props.updateQtLamViecNgoaiStaffUser} getData={this.props.userGetStaff} />
                    </div>
                }
            </main>
        );
    }
}

const mapStateToProps = state => ({ system: state.system, division: state.division, staff: state.staff });
const mapActionsToProps = {
    updateProfile, userGetStaff, getDmQuanHeGiaDinhAll, getDmBoMonAll, getDmDonViAll, getDmChucVuAll, updateStaffUser, createQuanHeStaffUser, updateQuanHeStaffUser, deleteQuanHeStaffUser,
    createTrinhDoNNStaffUser, updateTrinhDoNNStaffUser, deleteTrinhDoNNStaffUser, getDmNgoaiNguAll,
    createQtDaoTaoStaffUser, updateQtDaoTaoStaffUser, deleteQtDaoTaoStaffUser, createQtNuocNgoaiStaffUser, updateQtNuocNgoaiStaffUser, deleteQtNuocNgoaiStaffUser,
    createQtKhenThuongStaffUser, updateQtKhenThuongStaffUser, deleteQtKhenThuongStaffUser, createQtKyLuatStaffUser, updateQtKyLuatStaffUser, deleteQtKyLuatStaffUser,
    createQtNckhStaffUser, updateQtNckhStaffUser, deleteQtNckhStaffUser, createQtHuongDanLVStaffUser, updateQtHuongDanLVStaffUser, deleteQtHuongDanLVStaffUser,
    createSachGTStaffUser, updateSachGTStaffUser, deleteSachGTStaffUser, createQtBaiVietKhoaHocStaffUser, updateQtBaiVietKhoaHocStaffUser, deleteQtBaiVietKhoaHocStaffUser,
    createQtKyYeuStaffUser, updateQtKyYeuStaffUser, deleteQtKyYeuStaffUser, createQtGiaiThuongStaffUser, updateQtGiaiThuongStaffUser, deleteQtGiaiThuongStaffUser,
    createQtBangPhatMinhStaffUser, updateQtBangPhatMinhStaffUser, deleteQtBangPhatMinhStaffUser, createQtUngDungThuongMaiStaffUser, updateQtUngDungThuongMaiStaffUser, deleteQtUngDungThuongMaiStaffUser,
    createQtLamViecNgoaiStaffUser, updateQtLamViecNgoaiStaffUser, deleteQtLamViecNgoaiStaffUser
};
export default connect(mapStateToProps, mapActionsToProps)(ProfilePage);
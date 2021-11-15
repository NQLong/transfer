import React from 'react';
import { connect } from 'react-redux';
import { getStaffEdit, createStaff, updateStaff, deleteStaff, createQuanHeCanBo, updateQuanHeCanBo, deleteQuanHeCanBo, downloadWord, downloadWordLlkh } from './redux';
import { Link } from 'react-router-dom';
import { SelectAdapter_DmDonVi } from 'modules/mdDanhMuc/dmDonVi/redux';
import { SelectAdapter_DmChucVu } from 'modules/mdDanhMuc/dmChucVu/redux';
import { SelectAdapter_DmGioiTinh } from 'modules/mdDanhMuc/dmGioiTinh/redux';
import { SelectAdapter_DmTrinhDoLyLuanChinhTri } from 'modules/mdDanhMuc/dmTrinhDoLyLuanChinhTri/redux';
import { SelectAdapter_DmTrinhDoQuanLyNhaNuoc } from 'modules/mdDanhMuc/dmTrinhDoQuanLyNhaNuoc/redux';
import { SelectAdapter_DmTrinhDoTinHoc } from 'modules/mdDanhMuc/dmTrinhDoTinHoc/redux';
import { SelectAdapter_DmDanToc } from 'modules/mdDanhMuc/dmDanToc/redux';
import { SelectAdapter_DmTonGiao } from 'modules/mdDanhMuc/dmTonGiao/redux';
// import { SelectAdapter_DmTinhThanhPho } from 'modules/mdDanhMuc/dmDiaDiem/reduxTinhThanhPho';
// import { SelectAdapter_DmQuanHuyen } from 'modules/mdDanhMuc/dmDiaDiem/reduxQuanHuyen';
// import { SelectAdapter_DmPhuongXa } from 'modules/mdDanhMuc/dmDiaDiem/reduxPhuongXa';
import { SelectAdapter_DmQuanHeGiaDinh, getDmQuanHeGiaDinhAll } from 'modules/mdDanhMuc/dmQuanHeGiaDinh/redux';
import { SelectAdapter_DmNhomMau } from 'modules/mdDanhMuc/dmBenhVien/reduxNhomMau';
import { SelectAdapter_DmQuocGia } from 'modules/mdDanhMuc/dmQuocGia/redux';
import { SelectAdapter_DmTrinhDo } from 'modules/mdDanhMuc/dmTrinhDo/redux';
import { SelectAdapter_DmChucDanhKhoaHoc } from 'modules/mdDanhMuc/dmChucDanhKhoaHoc/redux';
import { SelectAdapter_DmNgoaiNgu, getDmNgoaiNguAll } from 'modules/mdDanhMuc/dmNgoaiNgu/redux';
import { createTrinhDoNNStaff, updateTrinhDoNNStaff, deleteTrinhDoNNStaff } from 'modules/_default/trinhDoNgoaiNgu/redux';
import TextInput, { DateInput, NumberInput, Select, BooleanInput } from 'view/component/Input';
import { createQTHTCTStaff, updateQTHTCTStaff, deleteQTHTCTStaff } from 'modules/_default/qtHocTapCongTac/redux.jsx';
import { createQtDaoTaoStaff, updateQtDaoTaoStaff, deleteQtDaoTaoStaff } from 'modules/_default/qtDaoTao/redux.jsx';
import { createQtNuocNgoaiStaff, updateQtNuocNgoaiStaff, deleteQtNuocNgoaiStaff } from 'modules/_default/qtNuocNgoai/redux.jsx';
import { createQtKhenThuongStaff, updateQtKhenThuongStaff, deleteQtKhenThuongStaff } from 'modules/_default/qtKhenThuong/redux.jsx';
import { createQtKyLuatStaff, updateQtKyLuatStaff, deleteQtKyLuatStaff } from 'modules/_default/qtKyLuat/redux.jsx';
import { createQtNckhStaff, updateQtNckhStaff, deleteQtNckhStaff } from 'modules/_default/qtNghienCuuKhoaHoc/redux.jsx';
import { createQtHuongDanLVStaff, updateQtHuongDanLVStaff, deleteQtHuongDanLVStaff } from 'modules/_default/qtHuongDanLuanVan/redux.jsx';
import { createSachGTStaff, updateSachGTStaff, deleteSachGTStaff } from 'modules/_default/sachGiaoTrinh/redux.jsx';
import { createQtBaiVietKhoaHocStaff, updateQtBaiVietKhoaHocStaff, deleteQtBaiVietKhoaHocStaff } from 'modules/_default/qtBaiVietKhoaHoc/redux.jsx';
import { createQtKyYeuStaff, updateQtKyYeuStaff, deleteQtKyYeuStaff } from 'modules/_default/qtKyYeu/redux.jsx';
import { createQtGiaiThuongStaff, updateQtGiaiThuongStaff, deleteQtGiaiThuongStaff } from 'modules/_default/qtGiaiThuong/redux.jsx';
import { createQtBangPhatMinhStaff, updateQtBangPhatMinhStaff, deleteQtBangPhatMinhStaff } from 'modules/_default/qtBangPhatMinh/redux.jsx';
import { createQtUngDungThuongMaiStaff, updateQtUngDungThuongMaiStaff, deleteQtUngDungThuongMaiStaff } from 'modules/_default/qtUngDungThuongMai/redux.jsx';
import { createQtLamViecNgoaiStaff, updateQtLamViecNgoaiStaff, deleteQtLamViecNgoaiStaff } from 'modules/_default/qtLamViecNgoai/redux.jsx';
import { TableCell, renderTable, AdminModal, FormSelect, FormRichTextBox, FormCheckbox, FormTextBox } from 'view/component/AdminPage';
import { QTForm } from 'view/component/Form';
import { ComponentDiaDiem } from 'modules/mdDanhMuc/dmDiaDiem/componentDiaDiem';

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
        shcc: '',
        type: null
    }

    onShow = (item, type, shcc) => {
        let { id, hoTen, moiQuanHe, namSinh, ngheNghiep, noiCongTac, diaChi, queQuan } = item ? item : { id: null, hoTen: '', moiQuanHe: '', namSinh: '', ngheNghiep: '', noiCongTac: '', diaChi: '', queQuan: '' };
        this.setState({ shcc, id, type });
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
            shcc = this.state.shcc,
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
            this.props.update(id, changes, error => {
                if (error == undefined || error == null) {
                    this.props.getData(shcc);
                    this.hide();
                }
            });
        } else {
            changes.shcc = shcc;
            changes.type = type;
            this.props.create(changes, () => {
                this.props.getData(shcc);
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
        shcc: '',
    }

    onShow = (item, shcc) => {
        let { id, loaiNgonNgu, trinhDo } = item ? item : { id: null, loaiNgonNgu: null, trinhDo: '' };
        this.setState({ shcc, id });
        setTimeout(() => {
            this.loaiNgonNgu.setVal(loaiNgonNgu);
            this.trinhDo.value(trinhDo);
        }, 500);
    }

    onSubmit = () => {
        const id = this.state.id,
            shcc = this.state.shcc,
            changes = {
                loaiNgonNgu: this.loaiNgonNgu.getVal(),
                trinhDo: this.trinhDo.value()
            };
        if (id) {
            this.props.update(id, changes, error => {
                if (error == undefined || error == null) {
                    this.props.getData(shcc);
                    this.hide();
                }
            });
        } else {
            changes.shcc = shcc;
            this.props.create(changes, () => {
                this.props.getData(shcc);
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

class HocTapCongTacModal extends AdminModal {
    state = {
        id: null,
        shcc: '',
        batDau: '',
        ketThuc: '',
        batDauType: 'dd/mm/yyyy',
        ketThucType: 'dd/mm/yyyy',
        toDay: false,
    }

    onShow = (item, shcc) => {
        this.batDau.clear();
        this.ketThuc.clear();
        let { id, batDauType, ketThucType, batDau, ketThuc, noiDung } = item ? item : { id: null, batDauType: 'dd/mm/yyyy', ketThucType: 'dd/mm/yyyy', batDau: null, ketThuc: null, noiDung: '' };
        this.setState({ batDauType: batDauType ? batDauType : 'dd/mm/yyyy', ketThucType: ketThuc && ketThuc != -1 ? ketThucType : 'dd/mm/yyyy', shcc, id, batDau, ketThuc, toDay: ketThuc == -1 ? true : false });
        setTimeout(() => {
            this.batDauType.value(batDauType ? batDauType : 'dd/mm/yyyy');
            if (ketThuc && ketThuc != -1) this.ketThucType.value(ketThucType); else this.ketThucType.value('dd/mm/yyyy');
            this.batDau.setVal(batDau);
            if (ketThuc && ketThuc != -1) this.ketThuc.setVal(ketThuc);
            this.toDay.value(this.state.toDay);
            this.noiDung.value(noiDung);
        }, 500);
    }

    onSubmit = () => {
        const id = this.state.id,
            shcc = this.state.shcc,
            changes = {
                batDau: this.batDau.getVal(),
                ketThuc: this.state.toDay ? -1 : this.ketThuc.getVal(),
                batDauType: this.state.batDauType,
                ketThucType: this.state.ketThucType,
                noiDung: this.noiDung.value()
            };
        if (id) {
            this.props.update(id, changes, error => {
                if (error == undefined || error == null) {
                    this.props.getData(shcc);
                    this.hide();
                }
            });
        } else {
            changes.shcc = shcc;
            this.props.create(changes, () => {
                this.props.getData(shcc);
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
        title: 'Thông tin học tập công tác',
        size: 'large',
        body: <div className='row'>
            <div className='form-group col-md-6'><DateInput ref={e => this.batDau = e} label='Bắt đầu' type={this.state.batDauType ? typeMapper[this.state.batDauType] : null} /></div>
            <FormSelect className='col-md-6' ref={e => this.batDauType = e} label='Loại thời gian bắt đầu' data={dateType} onChange={data => this.changeType(true, data.id)} />
            <div className='form-group col-md-6'><DateInput ref={e => this.ketThuc = e} label='Kết thúc' type={this.state.ketThucType ? typeMapper[this.state.ketThucType] : null} /></div>
            <FormSelect className='col-md-6' ref={e => this.ketThucType = e} label='Loại thời gian kết thúc' data={dateType} onChange={data => this.changeType(false, data.id)} />
            <FormCheckbox className='col-12' label='Vẫn đang tiếp diễn' ref={e => this.toDay = e} onChange={value => this.changeToDay(value)} />
            <FormRichTextBox className='col-12' ref={e => this.noiDung = e} label='Nội dung' />
        </div>,
    });
}

class DaoTaoModal extends AdminModal {
    state = {
        id: null,
        shcc: '',
        batDau: '',
        ketThuc: '',
        batDauType: 'dd/mm/yyyy',
        ketThucType: 'dd/mm/yyyy',
        toDay: false,
    }

    onShow = (item, shcc) => {
        this.batDau.clear();
        this.ketThuc.clear();
        let { id, batDauType, ketThucType, batDau, ketThuc, tenTruong, chuyenNganh, hinhThuc, thoiGian, loaiBangCap } = item ? item : { id: null, batDauType: 'dd/mm/yyyy', ketThucType: 'dd/mm/yyyy', batDau: null, ketThuc: null, tenTruong: '', chuyenNganh: '', hinhThuc: '', thoiGian: null, loaiBangCap: '' };
        this.setState({ batDauType: batDauType ? batDauType : 'dd/mm/yyyy', ketThucType: ketThuc && ketThuc != -1 ? ketThucType : 'dd/mm/yyyy', shcc, id, batDau, ketThuc, toDay: ketThuc == -1 ? true : false });
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
            shcc = this.state.shcc,
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
                    this.props.getData(shcc);
                    this.hide();
                }
            });
        } else {
            changes.shcc = shcc;
            this.props.create(changes, () => {
                this.props.getData(shcc);
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
        shcc: '',
        batDau: '',
        ketThuc: '',
        batDauType: 'dd/mm/yyyy',
        ketThucType: 'dd/mm/yyyy',
        toDay: false,
    }

    onShow = (item, shcc) => {
        this.batDau.clear();
        this.ketThuc.clear();
        let { id, batDauType, ketThucType, batDau, ketThuc, noiDung, quocGia } = item ? item : { id: null, batDauType: 'dd/mm/yyyy', ketThucType: 'dd/mm/yyyy', batDau: null, ketThuc: null, noiDung: '', quocGia: '' };
        this.setState({ batDauType: batDauType ? batDauType : 'dd/mm/yyyy', ketThucType: ketThuc && ketThuc != -1 ? ketThucType : 'dd/mm/yyyy', shcc, id, batDau, ketThuc, toDay: ketThuc == -1 ? true : false });
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
            shcc = this.state.shcc,
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
                    this.props.getData(shcc);
                    this.hide();
                }
            });
        } else {
            changes.shcc = shcc;
            this.props.create(changes, () => {
                this.props.getData(shcc);
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
        shcc: '',
        batDau: '',
        ketThuc: '',
        batDauType: 'dd/mm/yyyy',
        ketThucType: 'dd/mm/yyyy',
        toDay: false,
    }

    onShow = (item, shcc) => {
        this.batDau.clear();
        this.ketThuc.clear();
        let { id, batDauType, ketThucType, batDau, ketThuc, noiDung, capQuyetDinh } = item ? item : { id: null, batDauType: 'dd/mm/yyyy', ketThucType: 'dd/mm/yyyy', batDau: null, ketThuc: null, noiDung: '', capQuyetDinh: '' };
        this.setState({ batDauType: batDauType ? batDauType : 'dd/mm/yyyy', ketThucType: ketThuc && ketThuc != -1 ? ketThucType : 'dd/mm/yyyy', shcc, id, batDau, ketThuc, toDay: ketThuc == -1 ? true : false });
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
            shcc = this.state.shcc,
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
                    this.props.getData(shcc);
                    this.hide();
                }
            });
        } else {
            changes.shcc = shcc;
            this.props.create(changes, () => {
                this.props.getData(shcc);
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
        shcc: '',
        batDau: '',
        ketThuc: '',
        batDauType: 'dd/mm/yyyy',
        ketThucType: 'dd/mm/yyyy',
        toDay: false,
    }

    onShow = (item, shcc) => {
        this.batDau.clear();
        this.ketThuc.clear();
        let { id, batDauType, ketThucType, batDau, ketThuc, lyDoHinhThuc, capQuyetDinh } = item ? item : { id: null, batDauType: 'dd/mm/yyyy', ketThucType: 'dd/mm/yyyy', batDau: null, ketThuc: null, lyDoHinhThuc: '', capQuyetDinh: '' };
        this.setState({ batDauType: batDauType ? batDauType : 'dd/mm/yyyy', ketThucType: ketThuc && ketThuc != -1 ? ketThucType : 'dd/mm/yyyy', shcc, id, batDau, ketThuc, toDay: ketThuc == -1 ? true : false });
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
            shcc = this.state.shcc,
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
                    this.props.getData(shcc);
                    this.hide();
                }
            });
        } else {
            changes.shcc = shcc;
            this.props.create(changes, () => {
                this.props.getData(shcc);
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
        shcc: '',
        batDau: '',
        ketThuc: '',
        batDauType: 'dd/mm/yyyy',
        ketThucType: 'dd/mm/yyyy',
        toDay: false,
    }

    onShow = (item, shcc) => {
        this.batDau.clear();
        this.ketThuc.clear();
        let { id, batDauType, ketThucType, batDau, ketThuc, tenDeTai, maSoCapQuanLy, kinhPhi, vaiTro, ngayNghiemThu, ketQua, ngayNghiemThuType, thoiGian } = item ? item :
            { id: null, batDauType: 'dd/mm/yyyy', ketThucType: 'dd/mm/yyyy', batDau: null, ketThuc: null, tenDeTai: '', maSoCapQuanLy: '', kinhPhi: '', vaiTro: '', ngayNghiemThu: null, ketQua: '', ngayNghiemThuType: 'dd/mm/yyyy', thoiGian: null };
        this.setState({ batDauType: batDauType ? batDauType : 'dd/mm/yyyy', ketThucType: ketThuc && ketThuc != -1 ? ketThucType : 'dd/mm/yyyy', ngayNghiemThuType: ngayNghiemThuType ? ngayNghiemThuType : 'dd/mm/yyyy', shcc, id, batDau, ketThuc, ngayNghiemThu, toDay: ketThuc == -1 ? true : false });
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
            shcc = this.state.shcc,
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
                    this.props.getData(shcc);
                    this.hide();
                }
            });
        } else {
            changes.shcc = shcc;
            this.props.create(changes, () => {
                this.props.getData(shcc);
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
        shcc: ''
    }

    onShow = (item, shcc) => {
        let { id, hoTen, tenLuanVan, namTotNghiep, sanPham, bacDaoTao } = item ? item : { id: null, hoTen: '', tenLuanVan: '', namTotNghiep: '', sanPham: '', bacDaoTao: '' };
        this.setState({ shcc, id });
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
            shcc = this.state.shcc,
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
                    this.props.getData(shcc);
                    this.hide();
                }
            });
        } else {
            changes.shcc = shcc;
            this.props.create(changes, () => {
                this.props.getData(shcc);
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
        shcc: ''
    }

    onShow = (item, shcc) => {
        let { id, ten, theLoai, nhaSanXuat, namSanXuat, chuBien, sanPham, butDanh, quocTe } = item ? item : { id: null, ten: '', theLoai: '', nhaSanXuat: '', namSanXuat: null, chuBien: '', sanPham: '', butDanh: '', quocTe: 0 };
        this.setState({ shcc, id });
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
            shcc = this.state.shcc,
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
                    this.props.getData(shcc);
                    this.hide();
                }
            });
        } else {
            changes.shcc = shcc;
            this.props.create(changes, () => {
                this.props.getData(shcc);
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
        shcc: ''
    }

    onShow = (item, shcc) => {
        let { id, tenTacGia, namXuatBan, tenBaiViet, tenTapChi, soHieuIssn, sanPham, diemIf, quocTe } = item ? item : { id: null, tenTacGia: '', namXuatBan: null, tenBaiViet: '', tenTapChi: '', soHieuIssn: '', sanPham: '', diemIf: '', quocTe: 0 };
        this.setState({ shcc, id });
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
            shcc = this.state.shcc,
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
                    this.props.getData(shcc);
                    this.hide();
                }
            });
        } else {
            changes.shcc = shcc;
            this.props.create(changes, () => {
                this.props.getData(shcc);
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
        shcc: ''
    }

    onShow = (item, shcc) => {
        let { id, tenTacGia, tenBaiViet, tenHoiNghi, noiToChuc, thoiGian, sanPham, soHieuIsbn, quocTe } = item ? item : { id: null, tenTacGia: '', tenBaiViet: '', tenHoiNghi: '', noiToChuc: '', thoiGian: null, sanPham: '', soHieuIsbn: '', quocTe: 0 };
        this.setState({ shcc, id });
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
            shcc = this.state.shcc,
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
                    this.props.getData(shcc);
                    this.hide();
                }
            });
        } else {
            changes.shcc = shcc;
            this.props.create(changes, () => {
                this.props.getData(shcc);
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
        shcc: ''
    }

    onShow = (item, shcc) => {
        let { id, tenGiaiThuong, noiDung, noiCap, namCap } = item ? item : { id: null, tenGiaiThuong: '', noiDung: '', noiCap: '', namCap: null };
        this.setState({ shcc, id });
        setTimeout(() => {
            this.tenGiaiThuong.value(tenGiaiThuong ? tenGiaiThuong : '');
            this.noiDung.value(noiDung);
            this.namCap.setVal(namCap ? new Date(namCap.toString()) : null);
            this.noiCap.value(noiCap ? noiCap : '');
        }, 500);
    }

    onSubmit = () => {
        const id = this.state.id,
            shcc = this.state.shcc,
            changes = {
                tenGiaiThuong: this.tenGiaiThuong.value(),
                noiDung: this.noiDung.value(),
                namCap: this.namCap.getVal() ? new Date(this.namCap.getVal()).getFullYear() : null,
                noiCap: this.noiCap.value()
            };
        if (id) {
            this.props.update(id, changes, error => {
                if (error == undefined || error == null) {
                    this.props.getData(shcc);
                    this.hide();
                }
            });
        } else {
            changes.shcc = shcc;
            this.props.create(changes, () => {
                this.props.getData(shcc);
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
        shcc: ''
    }

    onShow = (item, shcc) => {
        let { id, tenBang, soHieu, namCap, noiCap, tacGia, sanPham, loaiBang } = item ? item : { id: null, tenBang: '', soHieu: '', namCap: null, noiCap: '', tacGia: '', sanPham: '', loaiBang: '' };
        this.setState({ shcc, id });
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
            shcc = this.state.shcc,
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
                    this.props.getData(shcc);
                    this.hide();
                }
            });
        } else {
            changes.shcc = shcc;
            this.props.create(changes, () => {
                this.props.getData(shcc);
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
        shcc: ''
    }

    onShow = (item, shcc) => {
        let { id, tenCongNghe, hinhThuc, namChuyenGiao, sanPham } = item ? item : { id: null, tenCongNghe: '', hinhThuc: '', namChuyenGiao: null, sanPham: '' };
        this.setState({ shcc, id });
        setTimeout(() => {
            this.tenCongNghe.value(tenCongNghe ? tenCongNghe : '');
            this.hinhThuc.value(hinhThuc);
            this.namChuyenGiao.setVal(namChuyenGiao ? new Date(namChuyenGiao.toString()) : null);
            this.sanPham.value(sanPham ? sanPham : '');
        }, 500);
    }

    onSubmit = () => {
        const id = this.state.id,
            shcc = this.state.shcc,
            changes = {
                tenCongNghe: this.tenCongNghe.value(),
                hinhThuc: this.hinhThuc.value(),
                namChuyenGiao: this.namChuyenGiao.getVal() ? new Date(this.namChuyenGiao.getVal()).getFullYear() : null,
                sanPham: this.sanPham.value()
            };
        if (id) {
            this.props.update(id, changes, error => {
                if (error == undefined || error == null) {
                    this.props.getData(shcc);
                    this.hide();
                }
            });
        } else {
            changes.shcc = shcc;
            this.props.create(changes, () => {
                this.props.getData(shcc);
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
        shcc: '',
        batDau: '',
        ketThuc: '',
        batDauType: 'dd/mm/yyyy',
        ketThucType: 'dd/mm/yyyy',
        toDay: false,
    }

    onShow = (item, shcc) => {
        this.batDau.clear();
        this.ketThuc.clear();
        let { id, batDauType, ketThucType, batDau, ketThuc, noiDung, noiLamViec } = item ? item : { id: null, batDauType: 'dd/mm/yyyy', ketThucType: 'dd/mm/yyyy', batDau: null, ketThuc: null, noiDung: '', noiLamViec: '' };
        this.setState({ batDauType: batDauType ? batDauType : 'dd/mm/yyyy', ketThucType: ketThuc && ketThuc != -1 ? ketThucType : 'dd/mm/yyyy', shcc, id, batDau, ketThuc, toDay: ketThuc == -1 ? true : false });
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
            shcc = this.state.shcc,
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
                    this.props.getData(shcc);
                    this.hide();
                }
            });
        } else {
            changes.shcc = shcc;
            this.props.create(changes, () => {
                this.props.getData(shcc);
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

class CanBoEditPage extends QTForm {
    constructor(props) {
        super(props);
        this.state = { item: null, doanVien: false, dangVien: false, nuocNgoai: false, ngayNhapNgu: NaN };
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

        this.modalNN = React.createRef();
        this.modalHocTapCongTac = React.createRef();

        this.mapperQuanHe = {};
        this.mapperNgonNgu = {};
    }

    componentDidMount() {
        T.ready('/user/tccb');
        this.getData();
        this.props.getDmQuanHeGiaDinhAll(null, items => {
            items.forEach(item => this.mapperQuanHe[item.ma] = item.ten);
        });
        this.props.getDmNgoaiNguAll({ kichHoat: 1 }, items => {
            items.forEach(item => this.mapperNgonNgu[item.ma] = item.ten);
        });
        this.shcc.current.focus();
    }

    getData = () => {
        const route = T.routeMatcher('/user/staff/:shcc'),
            shcc = route.parse(window.location.pathname).shcc;
        this.urlSHCC = shcc && shcc != 'new' ? shcc : null;
        console.log(this.urlSHCC);
        if (this.urlSHCC) {
            this.setState({ create: false });
            this.props.getStaffEdit(shcc, data => {
                if (data.error) {
                    T.notify('Lấy thông tin cán bộ bị lỗi!', 'danger');
                } else {
                    this.setState(
                        {
                            item: data.item,
                            doanVien: !data.item.doanVien == 0,
                            dangVien: data.item.dangVien == 0 ? false : true,
                            nuocNgoai: data.item.dangONuocNgoai == 0 ? false : true,
                            phai: data.item.phai,
                            hoTen: data.item.ho + ' ' + data.item.ten
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
        const { shcc = '', ho = '', ten = '', biDanh = '', cmnd = '', cmndNgayCap = '', cmndNoiCap = '', emailCaNhan = '', email = '', dienThoaiCaNhan = '', dienThoaiBaoTin = '', ngaySinh = '', ngayBatDauCongTac = '', ngayBienChe = '',
            thuongTruSoNha = '', thuongTruMaXa = '', thuongTruMaHuyen = '', thuongTruMaTinh = '',
            maXaNoiSinh = '', maHuyenNoiSinh = '', maTinhNoiSinh = '',
            maXaNguyenQuan = '', maHuyenNguyenQuan = '', maTinhNguyenQuan = '',
            hienTaiSoNha = '', hienTaiMaXa = '', hienTaiMaHuyen = '', hienTaiMaTinh = '',
            maChucVu = '', chucVuDang = '', chucVuDoanThe = '', chucVuKiemNhiem = '', maTrinhDoLlct = '', maTrinhDoQlnn = '', maTrinhDoTinHoc = '', danToc = '', tonGiao = '', chucDanh = '', trinhDoPhoThong = '', hocVi = '', chuyenNganh = '', namChucDanh = '', namHocVi = '',
            maDonVi = '', lyDoONuocNgoai = '', dangONuocNgoai = false, dangVien = false, phai = '', nhomMau = '', ngayVaoDang = '', ngayVaoDangChinhThuc = '', ngayNhapNgu = '', ngayXuatNgu = '', quanHamCaoNhat = '', soBhxh = '',
            soTheDang = '', noiDangDb = '', noiDangCt = '', doanVien = false, ngayVaoDoan = '', noiVaoDoan = '', ngheNghiepCu = '', chucVuKhac = '', quocGia = null, hangThuongBinh = '', giaDinhChinhSach = '', danhHieu = '', soTruong = '', sucKhoe = '', canNang = '', chieuCao = '' } = data.constructor === ({}).constructor ? data : {};
        this.shcc.current.setVal(shcc);
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
        // this.ngayVao.current.setVal(ngayVao);
        // this.ngayCbgd.current.setVal(ngayCbgd);
        this.ngayBienChe.current.setVal(ngayBienChe);
        // this.ngayNghi.current.setVal(ngayNghi);
        // this.ngach.current.setVal(ngach);
        // this.ngachMoi.current.setVal(ngachMoi);
        // this.heSoLuong.current.setVal(heSoLuong && Number(heSoLuong) ? Number(heSoLuong).toFixed(2) : 0);
        // this.bacLuong.current.setVal(bacLuong);
        // this.mocNangLuong.current.setVal(mocNangLuong);
        // this.ngayHuongLuong.current.setVal(ngayHuongLuong);
        // this.tyLeVuotKhung.current.setVal(tyLeVuotKhung);
        // this.phuCapCongViec.current.setVal(phuCapCongViec);
        // this.ngayPhuCapCongViec.current.setVal(ngayPhuCapCongViec);
        this.maChucVu.current.setVal(maChucVu);
        this.doanVien.current.setVal(doanVien);
        if (this.state.doanVien) {
            this.ngayVaoDoan.current.setVal(ngayVaoDoan);
            this.noiVaoDoan.current.setVal(noiVaoDoan);
        }
        this.dangVien.current.setVal(dangVien);
        if (this.state.dangVien) {
            this.chucVuDang.current.setVal(chucVuDang);
            this.ngayVaoDang.current.setVal(ngayVaoDang);
            this.ngayVaoDangChinhThuc.current.setVal(ngayVaoDangChinhThuc);
            this.noiDangDb.current.setVal(noiDangDb);
            this.noiDangCt.current.setVal(noiDangCt);
            this.soTheDang.current.setVal(soTheDang);
        }
        this.chucVuDoanThe.current.setVal(chucVuDoanThe);
        this.chucVuKiemNhiem.current.setVal(chucVuKiemNhiem);
        this.chucVuKhac.current.setVal(chucVuKhac);
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
        this.dangONuocNgoai.current.setVal(dangONuocNgoai);
        if (this.state.nuocNgoai) {
            this.lyDoONuocNgoai.current.setVal(lyDoONuocNgoai);
        }
        // this.ghiChu.current.setVal(ghiChu);

        this.phai.current.setVal(phai);
        this.nhomMau.current.setVal(nhomMau);
        this.ngayNhapNgu.current.setVal(ngayNhapNgu);
        this.ngayXuatNgu.current.setVal(ngayXuatNgu);
        this.quanHamCaoNhat.current.setVal(quanHamCaoNhat);
        this.hangThuongBinh.current.setVal(hangThuongBinh);
        this.giaDinhChinhSach.current.setVal(giaDinhChinhSach);
        this.danhHieu.current.setVal(danhHieu);
        this.soBhxh.current.setVal(soBhxh);

        this.thuongTru.value(thuongTruMaTinh, thuongTruMaHuyen, thuongTruMaXa, thuongTruSoNha);
        this.hienTai.value(hienTaiMaTinh, hienTaiMaHuyen, hienTaiMaXa, hienTaiSoNha);
        this.nguyenQuan.value(maTinhNguyenQuan, maHuyenNguyenQuan, maXaNguyenQuan);
        this.noiSinh.value(maTinhNoiSinh, maHuyenNoiSinh, maXaNoiSinh);

        this.soTruong.current.setVal(soTruong);
        this.sucKhoe.current.setVal(sucKhoe);
        this.canNang.current.setVal(canNang);
        this.chieuCao.current.setVal(chieuCao);
        this.chucDanh.current.setVal(chucDanh);
        this.hocVi.current.setVal(hocVi);
        this.chuyenNganh.current.setVal(chuyenNganh);
        this.namChucDanh.current.setVal(namChucDanh);
        this.namHocVi.current.setVal(namHocVi);
        this.trinhDoPhoThong.current.setVal(trinhDoPhoThong);
    };

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
        emailCaNhan: this.emailCaNhan.current.getFormVal(),
        dienThoaiCaNhan: this.dienThoaiCaNhan.current.getFormVal(),
        dienThoaiBaoTin: this.dienThoaiBaoTin.current.getFormVal(),
        ngayBatDauCongTac: this.ngayBatDauCongTac.current.isEmpty() ? {} : this.ngayBatDauCongTac.current.getFormVal(),
        // ngayVao: this.ngayVao.current.isEmpty() ? {} : this.ngayVao.current.getFormVal(),
        // ngayCbgd: this.ngayCbgd.current.isEmpty() ? {} : this.ngayCbgd.current.getFormVal(),
        ngayBienChe: this.ngayBienChe.current.isEmpty() ? {} : this.ngayBienChe.current.getFormVal(),
        // ngayNghi: this.ngayNghi.current.isEmpty() ? {} : this.ngayNghi.current.getFormVal(),
        // ngach: this.ngach.current.getFormVal(),
        // ngachMoi: this.ngachMoi.current.getFormVal(),
        // heSoLuong: this.heSoLuong.current.getFormVal(),
        // bacLuong: this.bacLuong.current.getFormVal(),
        // mocNangLuong: this.mocNangLuong.current.isEmpty() ? {} : this.mocNangLuong.current.getFormVal(),
        // ngayHuongLuong: this.ngayHuongLuong.current.isEmpty() ? {} : this.ngayHuongLuong.current.getFormVal(),
        // tyLeVuotKhung: this.tyLeVuotKhung.current.getFormVal(),
        // phuCapCongViec: this.phuCapCongViec.current.getFormVal(),
        // ngayPhuCapCongViec: this.ngayPhuCapCongViec.current.isEmpty() ? {} : this.ngayPhuCapCongViec.current.getFormVal(),
        maChucVu: this.maChucVu.current.getFormVal(),
        chucVuDang: this.state.dangVien ? this.chucVuDang.current.getFormVal() : {},
        doanVien: this.doanVien.current.getFormVal(),
        ngayVaoDoan: this.state.doanVien ? this.ngayVaoDoan.current.getFormVal() : {},
        noiVaoDoan: this.state.doanVien ? this.noiVaoDoan.current.getFormVal() : {},
        soTheDang: this.state.dangVien ? this.soTheDang.current.getFormVal() : {},
        ngayVaoDang: this.state.dangVien ? this.ngayVaoDang.current.getFormVal() : {},
        ngayVaoDangChinhThuc: this.state.dangVien ? this.ngayVaoDangChinhThuc.current.getFormVal() : {},
        noiDangDb: this.state.dangVien ? this.noiDangDb.current.getFormVal() : {},
        noiDangCt: this.state.dangVien ? this.noiDangCt.current.getFormVal() : {},
        chucVuDoanThe: this.chucVuDoanThe.current.getFormVal(),
        chucVuKiemNhiem: this.chucVuKiemNhiem.current.getFormVal(),
        chucVuKhac: this.chucVuKhac.current.getFormVal(),
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
        dangONuocNgoai: this.dangONuocNgoai.current.getFormVal(),
        lyDoONuocNgoai: this.state.nuocNgoai ? this.lyDoONuocNgoai.current.getFormVal() : {},
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
    })

    save = () => {
        const data = this.getFormVal();
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
        this.main.current.classList.add('validated');
        if (data.data) {
            if (this.urlSHCC) {
                this.props.updateStaff(this.urlSHCC, Object.assign(data.data, dcThuongTru, dcHienTai, dcNguyenQuan, dcNoiSinh), () => {
                    this.main.current.classList.remove('validated');
                    this.props.history.push(`/user/staff/${data.data.shcc}`);
                });
            } else {
                this.props.createStaff(Object.assign(data.data, dcThuongTru, dcHienTai, dcNguyenQuan, dcNoiSinh), data => {
                    this.props.history.push(`/user/staff/${data.item.shcc}`);
                });
            }
        }
    };

    create = (e, modal) => {
        e.preventDefault();
        modal.show(null, this.state.item.shcc);
    }

    createRelation = (e, type) => {
        e.preventDefault();
        this.modal.show(null, type, this.state.item.shcc);
    }

    editQuanHe = (e, item) => {
        this.modal.show(item, null, this.state.item.shcc);
        e.preventDefault();
    }

    deleteQuanHe = (e, item) => {
        T.confirm('Xóa thông tin người thân', 'Bạn có chắc bạn muốn xóa mục này?', true, isConfirm =>
            isConfirm && this.props.deleteQuanHeCanBo(item.id, item.shcc));
        e.preventDefault();
    }

    editTrinhDoNN = (e, item) => {
        this.modalNN.show(item, this.state.item.shcc);
        e.preventDefault();
    }

    deleteTrinhDoNN = (e, item) => {
        T.confirm('Xóa thông tin trình độ ngoại ngữ', 'Bạn có chắc bạn muốn xóa mục này?', true, isConfirm =>
            isConfirm && this.props.deleteTrinhDoNNStaff(item.id, () => this.props.getStaffEdit(this.state.item.shcc)));
        e.preventDefault();
    }

    createHocTapCongTac = (e) => {
        e.preventDefault();
        this.modalHocTapCongTac.current.show(null, this.state.item.shcc);
    }

    editHocTapCongTac = (e, item) => {
        e.preventDefault();
        this.modalHocTapCongTac.show(item, this.state.item.shcc);
    }

    deleteHocTapCongTac = (e, item) => {
        T.confirm('Xóa thông tin quá trình học tập công tác', 'Bạn có chắc bạn muốn xóa quá trình này?', true, isConfirm =>
            isConfirm && this.props.deleteQTHTCTStaff(item.id, () => this.props.getStaffEdit(this.state.item.shcc)));
        e.preventDefault();
    }

    createDaoTao = (e) => {
        e.preventDefault();
        this.modalDaoTao.show(null, this.state.item.shcc);
    }

    editDaoTao = (e, item) => {
        e.preventDefault();
        this.modalDaoTao.show(item, this.state.item.shcc);
    }

    deleteDaoTao = (e, item) => {
        T.confirm('Xóa thông tin quá trình đào tạo', 'Bạn có chắc bạn muốn xóa quá trình này?', true, isConfirm =>
            isConfirm && this.props.deleteQtDaoTaoStaff(item.id, () => this.props.getStaffEdit(this.state.item.shcc)));
        e.preventDefault();
    }

    createNuocNgoai = (e) => {
        e.preventDefault();
        this.modalNuocNgoai.show(null, this.state.item.shcc);
    }

    editNuocNgoai = (e, item) => {
        e.preventDefault();
        this.modalNuocNgoai.show(item, this.state.item.shcc);
    }

    deleteNuocNgoai = (e, item) => {
        T.confirm('Xóa thông tin quá trình nước ngoài', 'Bạn có chắc bạn muốn xóa quá trình này?', true, isConfirm =>
            isConfirm && this.props.deleteQtNuocNgoaiStaff(item.id, () => this.props.getStaffEdit(this.state.item.shcc)));
        e.preventDefault();
    }

    createKhenThuong = (e) => {
        e.preventDefault();
        this.modalKhenThuong.show(null, this.state.item.shcc);
    }

    editKhenThuong = (e, item) => {
        e.preventDefault();
        this.modalKhenThuong.show(item, this.state.item.shcc);
    }

    deleteKhenThuong = (e, item) => {
        T.confirm('Xóa thông tin quá trình khen thưởng', 'Bạn có chắc bạn muốn xóa quá trình này?', true, isConfirm =>
            isConfirm && this.props.deleteQtKhenThuongStaff(item.id, () => this.props.getStaffEdit(this.state.item.shcc)));
        e.preventDefault();
    }

    createKyLuat = (e) => {
        e.preventDefault();
        this.modalKyLuat.show(null, this.state.item.shcc);
    }

    editKyLuat = (e, item) => {
        e.preventDefault();
        this.modalKyLuat.show(item, this.state.item.shcc);
    }

    deleteKyLuat = (e, item) => {
        T.confirm('Xóa thông tin quá trình kỷ luật', 'Bạn có chắc bạn muốn xóa quá trình này?', true, isConfirm =>
            isConfirm && this.props.deleteQtKyLuatStaff(item.id, () => this.props.getStaffEdit(this.state.item.shcc)));
        e.preventDefault();
    }

    createNckh = (e) => {
        e.preventDefault();
        this.modalNckh.show(null, this.state.item.shcc);
    }

    editNckh = (e, item) => {
        e.preventDefault();
        this.modalNckh.show(item, this.state.item.shcc);
    }

    deleteNckh = (e, item) => {
        T.confirm('Xóa thông tin quá trình nghiên cứu khoa học', 'Bạn có chắc bạn muốn xóa quá trình này?', true, isConfirm =>
            isConfirm && this.props.deleteQtNckhStaff(item.id, () => this.props.getStaffEdit(this.state.item.shcc)));
        e.preventDefault();
    }

    createHuongDanLuanVan = (e) => {
        e.preventDefault();
        this.modalHuongDanLv.show(null, this.state.item.shcc);
    }

    editHuongDanLuanVan = (e, item) => {
        e.preventDefault();
        this.modalHuongDanLv.show(item, this.state.item.shcc);
    }

    deleteHuongDanLuanVan = (e, item) => {
        T.confirm('Xóa thông tin quá trình hướng dẫn luận văn', 'Bạn có chắc bạn muốn xóa quá trình này?', true, isConfirm =>
            isConfirm && this.props.deleteQtHuongDanLVStaff(item.id, () => this.props.getStaffEdit(this.state.item.shcc)));
        e.preventDefault();
    }

    createSachGT = (e) => {
        e.preventDefault();
        this.modalSachGT.show(null, this.state.item.shcc);
    }

    editSachGT = (e, item) => {
        e.preventDefault();
        this.modalSachGT.show(item, this.state.item.shcc);
    }

    deleteSachGT = (e, item) => {
        T.confirm('Xóa thông tin sách, giáo trình', 'Bạn có chắc bạn muốn xóa sách, giáo trình này?', true, isConfirm =>
            isConfirm && this.props.deleteSachGTStaff(item.id, () => this.props.getStaffEdit(this.state.item.shcc)));
        e.preventDefault();
    }

    createBaiVietKhoaHoc = (e) => {
        e.preventDefault();
        this.modalBaiVietKhoaHoc.show(null, this.state.item.shcc);
    }

    editBaiVietKhoaHoc = (e, item) => {
        e.preventDefault();
        this.modalBaiVietKhoaHoc.show(item, this.state.item.shcc);
    }

    deleteBaiVietKhoaHoc = (e, item) => {
        T.confirm('Xóa thông tin bài viết khoa học', 'Bạn có chắc bạn muốn xóa bài viết này?', true, isConfirm =>
            isConfirm && this.props.deleteQtBaiVietKhoaHocStaff(item.id, () => this.props.getStaffEdit(this.state.item.shcc)));
        e.preventDefault();
    }

    createKyYeu = (e) => {
        e.preventDefault();
        this.modalKyYeu.show(null, this.state.item.shcc);
    }

    editKyYeu = (e, item) => {
        e.preventDefault();
        this.modalKyYeu.show(item, this.state.item.shcc);
    }

    deleteKyYeu = (e, item) => {
        T.confirm('Xóa thông tin kỷ yếu hội nghị, hội thảo', 'Bạn có chắc bạn muốn xóa kỷ yếu này?', true, isConfirm =>
            isConfirm && this.props.deleteQtKyYeuStaff(item.id, () => this.props.getStaffEdit(this.state.item.shcc)));
        e.preventDefault();
    }

    createGiaiThuong = (e) => {
        e.preventDefault();
        this.modalGiaiThuong.show(null, this.state.item.shcc);
    }

    editGiaiThuong = (e, item) => {
        e.preventDefault();
        this.modalGiaiThuong.show(item, this.state.item.shcc);
    }

    deleteGiaiThuong = (e, item) => {
        T.confirm('Xóa thông tin giải thưởng', 'Bạn có chắc bạn muốn xóa giải thưởng này?', true, isConfirm =>
            isConfirm && this.props.deleteQtGiaiThuongStaff(item.id, () => this.props.getStaffEdit(this.state.item.shcc)));
        e.preventDefault();
    }

    createBangPhatMinh = (e) => {
        e.preventDefault();
        this.modalBangPhatMinh.show(null, this.state.item.shcc);
    }

    editBangPhatMinh = (e, item) => {
        e.preventDefault();
        this.modalBangPhatMinh.show(item, this.state.item.shcc);
    }

    deleteBangPhatMinh = (e, item) => {
        T.confirm('Xóa thông tin bằng phát minh, sáng chế, giải pháp hữu ích', 'Bạn có chắc bạn muốn xóa bằng phát minh, sáng chế, giải pháp hữu ích này?', true, isConfirm =>
            isConfirm && this.props.deleteQtBangPhatMinhStaff(item.id, () => this.props.getStaffEdit(this.state.item.shcc)));
        e.preventDefault();
    }

    createUngDung = (e) => {
        e.preventDefault();
        this.modalUngDung.show(null, this.state.item.shcc);
    }

    editUngDung = (e, item) => {
        e.preventDefault();
        this.modalUngDung.show(item, this.state.item.shcc);
    }

    deleteUngDung = (e, item) => {
        T.confirm('Xóa thông tin ứng dụng thực tiễn và thương mại hóa kết quả nghiên cứu', 'Bạn có chắc bạn muốn xóa ứng dụng này?', true, isConfirm =>
            isConfirm && this.props.deleteQtUngDungThuongMaiStaff(item.id, () => this.props.getStaffEdit(this.state.item.shcc)));
        e.preventDefault();
    }

    createLamViecNgoai = (e) => {
        e.preventDefault();
        this.modalLamViecNgoai.show(null, this.state.item.shcc);
    }

    editLamViecNgoai = (e, item) => {
        e.preventDefault();
        this.modalLamViecNgoai.show(item, this.state.item.shcc);
    }

    deleteLamViecNgoai = (e, item) => {
        T.confirm('Xóa thông tin tham gia làm việc tại Trường Đại học, Viện, Trung tâm nghiên cứu theo lời mời', 'Bạn có chắc bạn muốn xóa làm việc ngoài trường này?', true, isConfirm =>
            isConfirm && this.props.deleteQtLamViecNgoaiStaff(item.id, () => this.props.getStaffEdit(this.state.item.shcc)));
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
        const currentPermission = this.props.system && this.props.system.user && this.props.system.user.permissions ? this.props.system.user.permissions : [],
            permission = this.getUserPermission('staff');
        let readOnly = !currentPermission.includes('staff:write');
        let currentCanBo = this.props.staff && this.props.staff.selectedItem ? this.props.staff.selectedItem : [],
            items = currentCanBo.items ? currentCanBo.items.filter(i => i.type == 0) : [],
            itemsInLaw = currentCanBo.items ? currentCanBo.items.filter(i => i.type == 1) : [],
            itemsNN = currentCanBo.trinhDoNN ? currentCanBo.trinhDoNN : [],
            hocTapCongTac = currentCanBo.hocTapCongTac ? currentCanBo.hocTapCongTac : [],
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
                    <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>Thao tác</th>
                </tr>),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell type='number' content={index + 1} />
                    <TableCell type='link' content={`${T.dateToText(item.batDau, item.batDauType ? item.batDauType : 'dd/mm/yyyy')} ${item.ketThuc ? '-' : ''} ${item.ketThuc ? (item.ketThuc == -1 ? 'đến nay' : T.dateToText(item.ketThuc, item.ketThucType ? item.ketThucType : 'dd/mm/yyyy')) : ''}`} style={{ whiteSpace: 'nowrap' }} onClick={e => this.editKhenThuong(e, item)} />
                    <TableCell type='text' content={item.noiDung} />
                    <TableCell type='text' content={item.capQuyetDinh} />
                    <TableCell type='buttons' content={item} permission={permission} onEdit={this.editKhenThuong} onDelete={this.deleteKhenThuong}></TableCell>
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
                    <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>Thao tác</th>
                </tr>),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell type='number' content={index + 1} />
                    <TableCell type='link' content={`${T.dateToText(item.batDau, item.batDauType ? item.batDauType : 'dd/mm/yyyy')} ${item.ketThuc ? '-' : ''} ${item.ketThuc ? (item.ketThuc == -1 ? 'đến nay' : T.dateToText(item.ketThuc, item.ketThucType ? item.ketThucType : 'dd/mm/yyyy')) : ''}`} style={{ whiteSpace: 'nowrap' }} onClick={e => this.editKyLuat(e, item)} />
                    <TableCell type='text' content={item.lyDoHinhThuc} />
                    <TableCell type='text' content={item.capQuyetDinh} />
                    <TableCell type='buttons' content={item} permission={permission} onEdit={this.editKyLuat} onDelete={this.deleteKyLuat}></TableCell>
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

        const voChongText = this.state.phai ? (this.state.phai == '01' ? 'vợ' : 'chồng') : '';
        return (
            <main ref={this.main} className='app-content'>
                <div className='app-title'>
                    <h1><i className='fa fa-user' /> Thông tin cá nhân{this.state.item ? `: ${this.state.item.ho} ${this.state.item.ten} (${this.state.item.shcc})` : ''}</h1>
                </div>
                <div className='tile'>
                    <h3 className='tile-title'>Thông tin cá nhân</h3>
                    <div className='tile-body row'>
                        <div className='form-group col-xl-3 col-md-5'><TextInput ref={this.shcc} label='Mã thẻ cán bộ' disabled={readOnly} required placeholder='Nhập mã thẻ cán bộ' maxLength={10} /></div>
                        <div className='form-group col-xl-3 col-md-5'><TextInput ref={this.ho} label='Họ và tên lót' disabled={readOnly} required maxLength={100} /></div>
                        <div className='form-group col-xl-3 col-md-5'><TextInput ref={this.ten} label='Tên' disabled={readOnly} required maxLength={30} /></div>
                        <div className='form-group col-xl-3 col-md-5'><TextInput ref={this.biDanh} label='Bí danh' disabled={readOnly} maxLength={20} /></div>
                        <div className='form-group col-xl-4 col-md-6'><DateInput ref={this.ngaySinh} label='Ngày sinh' disabled={readOnly} min={new Date(1900, 1, 1).getTime()} max={Date.nextYear(-10).roundDate().getTime()} /></div>
                        <div className='form-group col-xl-4 col-md-6'><TextInput ref={this.dienThoaiCaNhan} label='Số điện thoại cá nhân' disabled={readOnly} maxLength={20} /></div>
                        <div className='form-group col-xl-4 col-md-6'><TextInput ref={this.dienThoaiBaoTin} label='Số điện thoại báo tin' disabled={readOnly} maxLength={20} /></div>
                        <div className='form-group col-xl-4 col-md-6'><TextInput ref={this.cmnd} label='CMND / CCCD' placeholder='Nhập CMND / CCCD' disabled={readOnly} maxLength={15} /></div>
                        <div className='form-group col-xl-4 col-md-6'><DateInput ref={this.cmndNgayCap} label='Ngày cấp' disabled={readOnly} min={new Date(1900, 1, 1).getTime()} max={new Date().getTime()} /></div>
                        <div className='form-group col-xl-4 col-md-6'><TextInput ref={this.cmndNoiCap} label='Nơi cấp CMND / CCCD' placeholder='Nhập nơi cấp cmnd' disabled={readOnly} maxLength={200} /></div>
                        <div className='form-group col-xl-6 col-md-6'><TextInput ref={this.emailCaNhan} label='Địa chỉ email cá nhân' disabled={readOnly} maxLength={50} /></div>
                        <div className='form-group col-xl-6 col-md-6'><TextInput ref={this.email} label='Địa chỉ email trường' disabled={readOnly} maxLength={50} /></div>
                        <div className='form-group col-xl-4 col-md-6'><Select ref={this.phai} adapter={SelectAdapter_DmGioiTinh} label='Giới tính' disabled={readOnly} /></div>
                        <div className='form-group col-xl-4 col-md-6'><Select ref={this.nhomMau} adapter={SelectAdapter_DmNhomMau} label='Nhóm máu' disabled={readOnly} /></div>
                        <div className='form-group col-xl-4 col-md-6'><Select ref={this.danToc} adapter={SelectAdapter_DmDanToc} label='Dân tộc' /></div>
                        <div className='form-group col-xl-4 col-md-6'><Select ref={this.quocGia} adapter={SelectAdapter_DmQuocGia} label='Quốc gia' /></div>
                        <div className='form-group col-xl-4 col-md-6'><Select ref={this.tonGiao} adapter={SelectAdapter_DmTonGiao} label='Tôn giáo' /></div>
                        <div className='form-group col-xl-4 col-md-6'><TextInput ref={this.soBhxh} label='Số BHXH' /></div>
                        <div className='form-group col-12' />
                        <ComponentDiaDiem ref={e => this.nguyenQuan = e} label='Nguyên quán' className='col-md-12' />
                        <ComponentDiaDiem ref={e => this.noiSinh = e} label='Nơi sinh' className='col-md-12' />
                        <ComponentDiaDiem ref={e => this.thuongTru = e} label='Địa chỉ thường trú' className='col-md-12' requiredSoNhaDuong={true} />
                        <p className='col-md-12'>
                            Nếu <b>Địa chỉ thường trú</b> là <b>Địa chỉ hiện tại</b> thì&nbsp;<a href='#' onClick={this.copyAddress}>nhấp vào đây</a>.
                        </p>
                        <ComponentDiaDiem ref={e => this.hienTai = e} label='Địa chỉ hiện tại' className='col-md-12' requiredSoNhaDuong={true} />
                        <div className='form-group col-xl-3 col-md-6'><TextInput ref={this.soTruong} label='Sở trường' disabled={readOnly} maxLength={100} /></div>
                        <div className='form-group col-xl-3 col-md-6'><TextInput ref={this.sucKhoe} label='Sức khỏe' disabled={readOnly} maxLength={100} /></div>
                        <div className='form-group col-xl-3 col-md-6'><NumberInput ref={this.canNang} label='Cân nặng(kg)' disabled={readOnly} min={0} step={0.1} /></div>
                        <div className='form-group col-xl-3 col-md-6'><NumberInput ref={this.chieuCao} label='Chiều cao(cm)' disabled={readOnly} min={0} step={1} /></div>
                    </div>
                </div>

                <div className='tile'>
                    <h3 className='tile-title'>Thông tin công tác</h3>
                    <div className='tile-body row'>
                        <div className='form-group col-md-6 col-lg-4'><DateInput ref={this.ngayBatDauCongTac} label='Ngày bắt đầu công tác' disabled={readOnly} min={new Date(1900, 1, 1).getTime()} max={Date.getDateInputDefaultMax()} /></div>
                        <div className='form-group col-md-6 col-lg-4'><DateInput ref={this.ngayBienChe} label='Ngày biên chế' disabled={readOnly} min={new Date(1900, 1, 1).getTime()} max={new Date().getTime()} /></div>
                        <div className='form-group col-md-6 col-lg-4'><TextInput ref={this.ngheNghiepCu} label='Nghề nghiệp trước khi tuyển dụng' disabled={readOnly} maxLength={100} /></div>
                        <div className='form-group col-md-6'><Select ref={this.maDonVi} adapter={SelectAdapter_DmDonVi} label='Đơn vị công tác' disabled={readOnly} required /></div>
                        <div className='form-group col-xl-3 col-md-6'><Select ref={this.maTrinhDoLlct} adapter={SelectAdapter_DmTrinhDoLyLuanChinhTri} label='Trình độ lý luận chính trị' /></div>
                        <div className='form-group col-xl-3 col-md-6'><Select ref={this.maTrinhDoQlnn} adapter={SelectAdapter_DmTrinhDoQuanLyNhaNuoc} label='Trình độ quản lý nhà nước' /></div>
                        <div className='form-group col-xl-3 col-md-6'><Select ref={this.maTrinhDoTinHoc} adapter={SelectAdapter_DmTrinhDoTinHoc} label='Trình độ tin học' /></div>
                        <div className='form-group col-xl-4 col-md-12'><Select ref={this.maChucVu} adapter={SelectAdapter_DmChucVu} label='Chức vụ chính quyền' /></div>
                        <div className='form-group col-xl-4 col-md-6'><TextInput ref={this.chucVuDoanThe} label='Chức vụ đoàn thể' disabled={readOnly} maxLength={200} /></div>
                        <div className='form-group col-xl-4 col-md-6'><TextInput ref={this.chucVuKiemNhiem} label='Chức vụ kiêm nhiệm' disabled={readOnly} maxLength={200} /></div>
                        <div className='form-group col-xl-4 col-md-6'><TextInput ref={this.chucVuKhac} label='Chức vụ khác' disabled={readOnly} maxLength={200} /></div>

                        <div className='form-group col-md-12'>
                            <BooleanInput ref={this.doanVien} label='Đoàn viên:&nbsp;' disabled={readOnly} onChange={value => this.setState({ doanVien: value })} />
                        </div>
                        {this.state.doanVien &&
                            <>
                                <div className='form-group col-md-4'><DateInput ref={this.ngayVaoDoan} label='Ngày vào Đoàn' disabled={readOnly} min={new Date(1900, 1, 1).getTime()} max={new Date().getTime()} /></div>
                                <div className='form-group col-md-8'><TextInput ref={this.noiVaoDoan} label='Nơi vào Đoàn' disabled={readOnly} maxLength={200} /></div>
                            </>}

                        <div className='form-group col-md-12'>
                            <BooleanInput ref={this.dangVien} label='Đảng viên:&nbsp;' disabled={readOnly} onChange={value => this.setState({ dangVien: value })} />
                        </div>
                        {this.state.dangVien &&
                            <>
                                <div className='form-group col-md-4'><DateInput ref={this.ngayVaoDang} label='Ngày vào Đảng (Dự bị)' disabled={readOnly} min={new Date(1900, 1, 1).getTime()} max={new Date().getTime()} /></div>
                                <div className='form-group col-md-8'><TextInput ref={this.noiDangDb} label='Nơi vào Đảng (Dự bị)' disabled={readOnly} maxLength={200} /></div>
                                <div className='form-group col-md-4'><DateInput ref={this.ngayVaoDangChinhThuc} label='Ngày vào Đảng chính thức' disabled={readOnly} min={new Date(1900, 1, 1).getTime()} max={new Date().getTime()} /></div>
                                <div className='form-group col-md-8'><TextInput ref={this.noiDangCt} label='Nơi vào Đảng chính thức' disabled={readOnly} maxLength={200} /></div>
                                <div className='form-group col-md-6'><TextInput ref={this.soTheDang} label='Số thẻ Đảng' disabled={readOnly} maxLength={200} /></div>
                                <div className='form-group col-md-6'><TextInput ref={this.chucVuDang} label='Chức vụ Đảng' disabled={readOnly} maxLength={200} /></div>
                            </>}
                        <div className='form-group col-md-12'>
                            <BooleanInput ref={this.dangONuocNgoai} label='Đang ở nước ngoài:&nbsp;' disabled={readOnly} onChange={value => this.setState({ nuocNgoai: value })} />
                        </div>
                        <div className='form-group col-md-12'>
                            {this.state.nuocNgoai && <TextInput ref={this.lyDoONuocNgoai} label='Lý do ở nước ngoài' disabled={readOnly} maxLength={200} />}
                        </div>

                        {/* <div className='form-group col-md-6'><TextInput ref={this.phucLoi} label='Phúc lợi' disabled={readOnly} maxLength={200} /></div>
                        <div className='form-group col-md-6'><TextInput ref={this.ghiChu} label='Ghi chú' disabled={readOnly} maxLength={1000} /></div> */}
                        <div className='form-group col-md-4'><DateInput ref={this.ngayNhapNgu} label='Ngày nhập ngũ' disabled={readOnly} min={Date.getDateInputDefaultMin()} max={new Date().getTime()} onChange={value => this.setState({ ngayNhapNgu: value })} /></div>
                        <div className='form-group col-md-4'><DateInput ref={this.ngayXuatNgu} label='Ngày xuất ngũ' disabled={readOnly} min={this.state.ngayNhapNgu === '' ? Date.getDateInputDefaultMin() : new Date(this.state.ngayNhapNgu).getTime()} max={new Date().getTime()} /></div>
                        <div className='form-group col-md-4'><TextInput ref={this.quanHamCaoNhat} label='Quân hàm cao nhất' disabled={readOnly} /></div>
                        <div className='form-group col-md-4'><TextInput ref={this.hangThuongBinh} label='Hạng thương binh' disabled={readOnly} /></div>
                        <div className='form-group col-md-4'><TextInput ref={this.giaDinhChinhSach} label='Gia đình chính sách' disabled={readOnly} /></div>
                        <div className='form-group col-md-4'><TextInput ref={this.danhHieu} label='Danh hiệu' disabled={readOnly} /></div>

                    </div>
                </div>

                <div className='tile'>
                    <h3 className='tile-title'>Trình độ học vấn</h3>
                    <div className='tile-body row'>
                        <div className='form-group col-xl-4 col-md-6'><Select ref={this.chucDanh} adapter={SelectAdapter_DmChucDanhKhoaHoc} label='Chức danh' disabled={readOnly} /></div>
                        <div className='form-group col-xl-4 col-md-6'><DateInput ref={this.namChucDanh} label='Năm công nhận chức danh' disabled={readOnly} type='year' max={new Date().getTime()} /></div>
                        <div className='form-group col-xl-4 col-md-6'><Select ref={this.hocVi} adapter={SelectAdapter_DmTrinhDo} label='Học vị' disabled={readOnly} /></div>
                        <div className='form-group col-xl-4 col-md-6'><DateInput ref={this.namHocVi} label='Năm công nhận học vị' disabled={readOnly} type='year' max={new Date().getTime()} /></div>
                        <div className='form-group col-xl-4 col-md-6'><TextInput ref={this.chuyenNganh} label='Chuyên ngành' disabled={readOnly} /></div>
                        <div className='form-group col-xl-4 col-md-6'><TextInput ref={this.trinhDoPhoThong} label='Trình độ phổ thông' disabled={readOnly} /></div>
                    </div>
                    <div>
                        <p>Trình độ ngoại ngữ {!itemsNN || itemsNN.length == 0 ? <strong>: Không có thông tin</strong> : ''}</p>
                        <div className='tile-body'>{tableNN}</div>
                        <div className='tile-footer' style={{ textAlign: 'right' }}>
                            <button className='btn btn-info' type='button' onClick={e => this.create(e, this.modalNN)}>
                                <i className='fa fa-fw fa-lg fa-plus' />Thêm trình độ ngoại ngữ
                            </button>
                        </div>
                    </div>
                </div>

                {!this.state.create ? (
                    <div className='tile'>
                        <h3 className='tile-title'>Thông tin người thân</h3>
                        <ul className='nav nav-tabs' id='myTab' role='tablist'>
                            <li className='nav-item'>
                                <a className='nav-link active' id='infoQuanHe1' data-toggle='tab' href='#infoQuanHe1Content' role='tab' aria-controls='infoQuanHe1Content' aria-selected='true'>Về bản thân</a>
                            </li>
                            <li className='nav-item'>
                                <a className='nav-link' id='infoQuanHe2' data-toggle='tab' href='#infoQuanHe2Content' role='tab' aria-controls='infoQuanHe2Content' aria-selected='false'>Về bên {voChongText}</a>
                            </li>
                        </ul>
                        <div className='tab-content' style={{ paddingTop: '10px' }}>
                            <div className='tab-pane fade show active' id='infoQuanHe1Content' role='tabpanel' aria-labelledby='infoQuanHe1'>
                                <p>Cha, mẹ, {voChongText}, các con, anh chị em ruột</p>
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
                    </div>) : null}

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
                        <button className='btn btn-info' type='button' onClick={e => this.create(e, this.modalKhenThuong)}>
                            <i className='fa fa-fw fa-lg fa-plus' />Thêm quá trình
                        </button>
                    </div>
                </div>
                <div className='tile'>
                    <h3 className='tile-title'>Quá trình kỷ luật</h3>
                    <div className='tile-body'>
                        {tableKyLuat}
                    </div>
                    <div className='tile-footer' style={{ textAlign: 'right' }}>
                        <button className='btn btn-info' type='button' onClick={e => this.create(e, this.modalKyLuat)}>
                            <i className='fa fa-fw fa-lg fa-plus' />Thêm quá trình
                        </button>
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
                        <div className='col-lg-4 col-md-6 form-group'><DateInput ref={this.ngayHuongLuong} label='Ngày hưởng lương' disabled={readOnly} min={new Date(1900, 1, 1).getTime()} max={Date.getDateInputDefaultMax()} /></div>

                        <div className='col-lg-3 col-md-6 form-group'><NumberInput ref={this.heSoLuong} label='Hệ số lương' disabled={readOnly} min={0} max={1000} step={0.01} /></div>
                        <div className='col-lg-3 col-md-6 form-group'><NumberInput ref={this.bacLuong} label='Bậc lương' disabled={readOnly} min={0} max={1000} /></div>
                        <div className='col-lg-3 col-md-6 form-group'><DateInput ref={this.mocNangLuong} label='Mốc nâng lương' disabled={readOnly} /></div>
                        <div className='col-lg-3 col-md-6 form-group'><NumberInput ref={this.tyLeVuotKhung} label='Tỉ lệ vượt khung' disabled={readOnly} min={0} max={100} /></div>

                        <div className='col-lg-3 col-6 form-group'><NumberInput ref={this.phuCapCongViec} label='Phụ cấp công việc' disabled={readOnly} min={0} max={1000} /></div>
                        <div className='col-lg-3 col-6 form-group'><DateInput ref={this.ngayPhuCapCongViec} label='Ngày phụ cấp công việc' disabled={readOnly} min={new Date(1900, 1, 1).getTime()} max={new Date().getTime()} /></div>
                    </div>
                </div> */}
                <Link to='/user/staff' className='btn btn-secondary btn-circle' style={{ position: 'fixed', bottom: '10px' }}>
                    <i className='fa fa-lg fa-reply' />
                </Link>
                {readOnly ? null :
                    <button type='button' title='Save' className='btn btn-primary btn-circle' style={{ position: 'fixed', right: '10px', bottom: '10px' }} onClick={this.save}>
                        <i className='fa fa-lg fa-save' />
                    </button>}
                {this.urlSHCC ? <button type='button' title='Save and export LL2C Word' className='btn btn-circle' style={{ position: 'fixed', right: '70px', bottom: '10px', color: 'white', backgroundColor: 'rgb(76, 110, 245)' }} onClick={this.downloadWord}>
                    <i className='fa fa-lg fa-file-word-o' />
                </button> : null}
                {this.urlSHCC ? <button type='button' title='Save and export LLKH Word' className='btn btn-circle' style={{ position: 'fixed', right: '130px', bottom: '10px', color: 'white', backgroundColor: 'rgb(76, 110, 245)' }} onClick={this.downloadWordLlkh}>
                    <i className='fa fa-lg fa-file-text-o' />
                </button> : null}
                <RelationModal ref={e => this.modal = e} create={this.props.createQuanHeCanBo} update={this.props.updateQuanHeCanBo} getData={this.props.getStaffEdit} />
                <TrinhDoNNModal ref={e => this.modalNN = e} create={this.props.createTrinhDoNNStaff} update={this.props.updateTrinhDoNNStaff} getData={this.props.getStaffEdit} />
                <HocTapCongTacModal ref={e => this.modalHocTapCongTac = e} create={this.props.createQTHTCTStaff} update={this.props.updateQTHTCTStaff} getData={this.props.getStaffEdit} />
                <DaoTaoModal ref={e => this.modalDaoTao = e} create={this.props.createQtDaoTaoStaff} update={this.props.updateQtDaoTaoStaff} getData={this.props.getStaffEdit} />
                <NuocNgoaiModal ref={e => this.modalNuocNgoai = e} create={this.props.createQtNuocNgoaiStaff} update={this.props.updateQtNuocNgoaiStaff} getData={this.props.getStaffEdit} />
                <KhenThuongModal ref={e => this.modalKhenThuong = e} create={this.props.createQtKhenThuongStaff} update={this.props.updateQtKhenThuongStaff} getData={this.props.getStaffEdit} />
                <KyLuatModal ref={e => this.modalKyLuat = e} create={this.props.createQtKyLuatStaff} update={this.props.updateQtKyLuatStaff} getData={this.props.getStaffEdit} />
                <NckhModal ref={e => this.modalNckh = e} create={this.props.createQtNckhStaff} update={this.props.updateQtNckhStaff} getData={this.props.getStaffEdit} />
                <HuongDanLvModal ref={e => this.modalHuongDanLv = e} create={this.props.createQtHuongDanLVStaff} update={this.props.updateQtHuongDanLVStaff} getData={this.props.getStaffEdit} />
                <SachGTModal ref={e => this.modalSachGT = e} create={this.props.createSachGTStaff} update={this.props.updateSachGTStaff} getData={this.props.getStaffEdit} />
                <BaiVietKhoaHocModal ref={e => this.modalBaiVietKhoaHoc = e} create={this.props.createQtBaiVietKhoaHocStaff} update={this.props.updateQtBaiVietKhoaHocStaff} getData={this.props.getStaffEdit} />
                <KyYeuModal ref={e => this.modalKyYeu = e} create={this.props.createQtKyYeuStaff} update={this.props.updateQtKyYeuStaff} getData={this.props.getStaffEdit} />
                <GiaiThuongModal ref={e => this.modalGiaiThuong = e} create={this.props.createQtGiaiThuongStaff} update={this.props.updateQtGiaiThuongStaff} getData={this.props.getStaffEdit} />
                <BangPhatMinhModal ref={e => this.modalBangPhatMinh = e} create={this.props.createQtBangPhatMinhStaff} update={this.props.updateQtBangPhatMinhStaff} getData={this.props.getStaffEdit} />
                <UngDungModal ref={e => this.modalUngDung = e} create={this.props.createQtUngDungThuongMaiStaff} update={this.props.updateQtUngDungThuongMaiStaff} getData={this.props.getStaffEdit} />
                <LamViecNgoaiModal ref={e => this.modalLamViecNgoai = e} create={this.props.createQtLamViecNgoaiStaff} update={this.props.updateQtLamViecNgoaiStaff} getData={this.props.getStaffEdit} />
            </main>
        );
    }
}

const mapStateToProps = state => ({ staff: state.staff, system: state.system });
const mapActionsToProps = {
    getStaffEdit, createStaff, updateStaff, deleteStaff, getDmQuanHeGiaDinhAll, createQuanHeCanBo, updateQuanHeCanBo, deleteQuanHeCanBo, getDmNgoaiNguAll,
    createTrinhDoNNStaff, updateTrinhDoNNStaff, deleteTrinhDoNNStaff, downloadWord, downloadWordLlkh, createQTHTCTStaff, updateQTHTCTStaff, deleteQTHTCTStaff,
    createQtDaoTaoStaff, updateQtDaoTaoStaff, deleteQtDaoTaoStaff, createQtNuocNgoaiStaff, updateQtNuocNgoaiStaff, deleteQtNuocNgoaiStaff,
    createQtKhenThuongStaff, updateQtKhenThuongStaff, deleteQtKhenThuongStaff, createQtKyLuatStaff, updateQtKyLuatStaff, deleteQtKyLuatStaff,
    createQtNckhStaff, updateQtNckhStaff, deleteQtNckhStaff, createQtHuongDanLVStaff, updateQtHuongDanLVStaff, deleteQtHuongDanLVStaff,
    createSachGTStaff, updateSachGTStaff, deleteSachGTStaff, createQtBaiVietKhoaHocStaff, updateQtBaiVietKhoaHocStaff, deleteQtBaiVietKhoaHocStaff,
    createQtKyYeuStaff, updateQtKyYeuStaff, deleteQtKyYeuStaff, createQtGiaiThuongStaff, updateQtGiaiThuongStaff, deleteQtGiaiThuongStaff,
    createQtBangPhatMinhStaff, updateQtBangPhatMinhStaff, deleteQtBangPhatMinhStaff, createQtUngDungThuongMaiStaff, updateQtUngDungThuongMaiStaff, deleteQtUngDungThuongMaiStaff,
    createQtLamViecNgoaiStaff, updateQtLamViecNgoaiStaff, deleteQtLamViecNgoaiStaff
};
export default connect(mapStateToProps, mapActionsToProps)(CanBoEditPage);
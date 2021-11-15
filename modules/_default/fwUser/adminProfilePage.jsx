import React from 'react';
import { connect } from 'react-redux';
import { updateProfile } from '../_init/reduxSystem';
// import Dropdown from 'view/component/Dropdown';
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
// import { SelectAdapter_DmDonVi } from 'modules/mdDanhMuc/dmDonVi/redux';
import TextInput, { DateInput, NumberInput, Select, BooleanInput } from 'view/component/Input';
import { QTForm } from 'view/component/Form';
import { ComponentDiaDiem } from 'modules/mdDanhMuc/dmDiaDiem/componentDiaDiem';
import { TableCell, renderTable, AdminModal, FormSelect, FormRichTextBox, FormCheckbox, FormTextBox } from 'view/component/AdminPage';
import { createQTHTCTStaffUser, updateQTHTCTStaffUser, deleteQTHTCTStaffUser } from 'modules/_default/qtHocTapCongTac/redux.jsx';
import { createQtDaoTaoStaffUser, updateQtDaoTaoStaffUser, deleteQtDaoTaoStaffUser } from 'modules/_default/qtDaoTao/redux.jsx';
import { createQtNuocNgoaiStaffUser, updateQtNuocNgoaiStaffUser, deleteQtNuocNgoaiStaffUser } from 'modules/_default/qtNuocNgoai/redux.jsx';
import { createQtKhenThuongStaffUser, updateQtKhenThuongStaffUser, deleteQtKhenThuongStaffUser } from 'modules/_default/qtKhenThuong/redux.jsx';
import { createQtKyLuatStaffUser, updateQtKyLuatStaffUser, deleteQtKyLuatStaffUser } from 'modules/_default/qtKyLuat/redux.jsx';
import { createQtNckhStaffUser, updateQtNckhStaffUser, deleteQtNckhStaffUser } from 'modules/_default/qtNghienCuuKhoaHoc/redux.jsx';
import { createQtHuongDanLVStaffUser, updateQtHuongDanLVStaffUser, deleteQtHuongDanLVStaffUser } from 'modules/_default/qtHuongDanLuanVan/redux.jsx';
import { createSachGTStaffUser, updateSachGTStaffUser, deleteSachGTStaffUser } from 'modules/_default/sachGiaoTrinh/redux.jsx';
import { createQtBaiVietKhoaHocStaffUser, updateQtBaiVietKhoaHocStaffUser, deleteQtBaiVietKhoaHocStaffUser } from 'modules/_default/qtBaiVietKhoaHoc/redux.jsx';
import { createQtKyYeuStaffUser, updateQtKyYeuStaffUser, deleteQtKyYeuStaffUser } from 'modules/_default/qtKyYeu/redux.jsx';
import { createQtGiaiThuongStaffUser, updateQtGiaiThuongStaffUser, deleteQtGiaiThuongStaffUser } from 'modules/_default/qtGiaiThuong/redux.jsx';
import { createQtBangPhatMinhStaffUser, updateQtBangPhatMinhStaffUser, deleteQtBangPhatMinhStaffUser } from 'modules/_default/qtBangPhatMinh/redux.jsx';
import { createQtUngDungThuongMaiStaffUser, updateQtUngDungThuongMaiStaffUser, deleteQtUngDungThuongMaiStaffUser } from 'modules/_default/qtUngDungThuongMai/redux.jsx';
import { createQtLamViecNgoaiStaffUser, updateQtLamViecNgoaiStaffUser, deleteQtLamViecNgoaiStaffUser } from 'modules/_default/qtLamViecNgoai/redux.jsx';

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
// sexMapper = { '01': 'Nam', '02': 'Nữ' };

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
                this.getData(user.email);
                let { dienThoai, ngaySinh } = user ? user : { dienThoai: '', ngaySinh: '' };
                $('#ngaySinh').val(ngaySinh ? T.dateToText(ngaySinh, 'dd/mm/yyyy') : '');
                $('#dienThoai').val(dienThoai);
                this.phai.setVal(user.phai ? user.phai : '01');
            }
        });
    }

    getData = (email) => {

        if (email) {
            this.props.userGetStaff(email, data => {
                if (data.error) {
                    T.notify('Lấy thông tin cán bộ bị lỗi!', 'danger');
                } else if (data.item) {
                    this.props.getDmQuanHeGiaDinhAll(null, items => items.forEach(item => this.mapperQuanHe[item.ma] = item.ten));
                    this.props.getDmChucVuAll(null, items => items.forEach(item => this.mapperChucVu[item.ma] = item.ten));
                    this.props.getDmDonViAll(items => items.forEach(item => this.mapperDonVi[item.ma] = item.ten));
                    this.props.getDmNgoaiNguAll({ kichHoat: 1 }, items => {
                        items.forEach(item => this.mapperNgonNgu[item.ma] = item.ten);
                    });
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
        let phai = this.phai.val(),
            ngaySinh = $('#ngaySinh').val() || null,
            changes = { dienThoai: $('#dienThoai').val() };
        if (phai) changes.phai = phai;
        if (ngaySinh) changes.ngaySinh = T.formatDate(ngaySinh).getTime();
        console.log(this.phai.val(), changes);
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

    create = (e, modal) => {
        e.preventDefault();
        modal.show(null, this.state.canBo.shcc);
    }

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
            isConfirm && this.props.deleteTrinhDoNNStaffUser(item.id, () => this.props.userGetStaff(this.state.canBo.shcc)));
        e.preventDefault();
    }

    createHocTapCongTac = (e) => {
        e.preventDefault();
        this.modalHocTapCongTac.current.show(null, this.state.canBo.shcc);
    }

    editHocTapCongTac = (e, item) => {
        e.preventDefault();
        this.modalHocTapCongTac.show(item, this.state.canBo.shcc);
    }

    deleteHocTapCongTac = (e, item) => {
        T.confirm('Xóa thông tin quá trình học tập công tác', 'Bạn có chắc bạn muốn xóa quá trình này?', true, isConfirm =>
            isConfirm && this.props.deleteQTHTCTStaffUser(item.id, () => this.props.userGetStaff(this.state.canBo.shcc)));
        e.preventDefault();
    }

    createDaoTao = (e) => {
        e.preventDefault();
        this.modalDaoTao.show(null, this.state.canBo.shcc);
    }

    editDaoTao = (e, item) => {
        e.preventDefault();
        this.modalDaoTao.show(item, this.state.canBo.shcc);
    }

    deleteDaoTao = (e, item) => {
        T.confirm('Xóa thông tin quá trình đào tạo', 'Bạn có chắc bạn muốn xóa quá trình này?', true, isConfirm =>
            isConfirm && this.props.deleteQtDaoTaoStaffUser(item.id, () => this.props.userGetStaff(this.state.canBo.shcc)));
        e.preventDefault();
    }

    createNuocNgoai = (e) => {
        e.preventDefault();
        this.modalNuocNgoai.show(null, this.state.canBo.shcc);
    }

    editNuocNgoai = (e, item) => {
        e.preventDefault();
        this.modalNuocNgoai.show(item, this.state.canBo.shcc);
    }

    deleteNuocNgoai = (e, item) => {
        T.confirm('Xóa thông tin quá trình nước ngoài', 'Bạn có chắc bạn muốn xóa quá trình này?', true, isConfirm =>
            isConfirm && this.props.deleteQtNuocNgoaiStaffUser(item.id, () => this.props.userGetStaff(this.state.canBo.shcc)));
        e.preventDefault();
    }

    createKhenThuong = (e) => {
        e.preventDefault();
        this.modalKhenThuong.show(null, this.state.canBo.shcc);
    }

    editKhenThuong = (e, item) => {
        e.preventDefault();
        this.modalKhenThuong.show(item, this.state.canBo.shcc);
    }

    deleteKhenThuong = (e, item) => {
        T.confirm('Xóa thông tin quá trình khen thưởng', 'Bạn có chắc bạn muốn xóa quá trình này?', true, isConfirm =>
            isConfirm && this.props.deleteQtKhenThuongStaffUser(item.id, () => this.props.userGetStaff(this.state.canBo.shcc)));
        e.preventDefault();
    }

    createKyLuat = (e) => {
        e.preventDefault();
        this.modalKyLuat.show(null, this.state.canBo.shcc);
    }

    editKyLuat = (e, item) => {
        e.preventDefault();
        this.modalKyLuat.show(item, this.state.canBo.shcc);
    }

    deleteKyLuat = (e, item) => {
        T.confirm('Xóa thông tin quá trình kỷ luật', 'Bạn có chắc bạn muốn xóa quá trình này?', true, isConfirm =>
            isConfirm && this.props.deleteQtKyLuatStaffUser(item.id, () => this.props.userGetStaff(this.state.canBo.shcc)));
        e.preventDefault();
    }

    createNckh = (e) => {
        e.preventDefault();
        this.modalNckh.show(null, this.state.canBo.shcc);
    }

    editNckh = (e, item) => {
        e.preventDefault();
        this.modalNckh.show(item, this.state.canBo.shcc);
    }

    deleteNckh = (e, item) => {
        T.confirm('Xóa thông tin quá trình nghiên cứu khoa học', 'Bạn có chắc bạn muốn xóa quá trình này?', true, isConfirm =>
            isConfirm && this.props.deleteQtNckhStaffUser(item.id, () => this.props.userGetStaff(this.state.canBo.shcc)));
        e.preventDefault();
    }

    createHuongDanLuanVan = (e) => {
        e.preventDefault();
        this.modalHuongDanLv.show(null, this.state.canBo.shcc);
    }

    editHuongDanLuanVan = (e, item) => {
        e.preventDefault();
        this.modalHuongDanLv.show(item, this.state.canBo.shcc);
    }

    deleteHuongDanLuanVan = (e, item) => {
        T.confirm('Xóa thông tin quá trình hướng dẫn luận văn', 'Bạn có chắc bạn muốn xóa quá trình này?', true, isConfirm =>
            isConfirm && this.props.deleteQtHuongDanLVStaffUser(item.id, () => this.props.userGetStaff(this.state.canBo.shcc)));
        e.preventDefault();
    }

    createSachGT = (e) => {
        e.preventDefault();
        this.modalSachGT.show(null, this.state.canBo.shcc);
    }

    editSachGT = (e, item) => {
        e.preventDefault();
        this.modalSachGT.show(item, this.state.canBo.shcc);
    }

    deleteSachGT = (e, item) => {
        T.confirm('Xóa thông tin sách, giáo trình', 'Bạn có chắc bạn muốn xóa sách, giáo trình này?', true, isConfirm =>
            isConfirm && this.props.deleteSachGTStaffUser(item.id, () => this.props.userGetStaff(this.state.canBo.shcc)));
        e.preventDefault();
    }

    createBaiVietKhoaHoc = (e) => {
        e.preventDefault();
        this.modalBaiVietKhoaHoc.show(null, this.state.canBo.shcc);
    }

    editBaiVietKhoaHoc = (e, item) => {
        e.preventDefault();
        this.modalBaiVietKhoaHoc.show(item, this.state.canBo.shcc);
    }

    deleteBaiVietKhoaHoc = (e, item) => {
        T.confirm('Xóa thông tin bài viết khoa học', 'Bạn có chắc bạn muốn xóa bài viết này?', true, isConfirm =>
            isConfirm && this.props.deleteQtBaiVietKhoaHocStaffUser(item.id, () => this.props.userGetStaff(this.state.canBo.shcc)));
        e.preventDefault();
    }

    createKyYeu = (e) => {
        e.preventDefault();
        this.modalKyYeu.show(null, this.state.canBo.shcc);
    }

    editKyYeu = (e, item) => {
        e.preventDefault();
        this.modalKyYeu.show(item, this.state.canBo.shcc);
    }

    deleteKyYeu = (e, item) => {
        T.confirm('Xóa thông tin kỷ yếu hội nghị, hội thảo', 'Bạn có chắc bạn muốn xóa kỷ yếu này?', true, isConfirm =>
            isConfirm && this.props.deleteQtKyYeuStaffUser(item.id, () => this.props.userGetStaff(this.state.canBo.shcc)));
        e.preventDefault();
    }

    createGiaiThuong = (e) => {
        e.preventDefault();
        this.modalGiaiThuong.show(null, this.state.canBo.shcc);
    }

    editGiaiThuong = (e, item) => {
        e.preventDefault();
        this.modalGiaiThuong.show(item, this.state.canBo.shcc);
    }

    deleteGiaiThuong = (e, item) => {
        T.confirm('Xóa thông tin giải thưởng', 'Bạn có chắc bạn muốn xóa giải thưởng này?', true, isConfirm =>
            isConfirm && this.props.deleteQtGiaiThuongStaffUser(item.id, () => this.props.userGetStaff(this.state.canBo.shcc)));
        e.preventDefault();
    }

    createBangPhatMinh = (e) => {
        e.preventDefault();
        this.modalBangPhatMinh.show(null, this.state.canBo.shcc);
    }

    editBangPhatMinh = (e, item) => {
        e.preventDefault();
        this.modalBangPhatMinh.show(item, this.state.canBo.shcc);
    }

    deleteBangPhatMinh = (e, item) => {
        T.confirm('Xóa thông tin bằng phát minh, sáng chế, giải pháp hữu ích', 'Bạn có chắc bạn muốn xóa bằng phát minh, sáng chế, giải pháp hữu ích này?', true, isConfirm =>
            isConfirm && this.props.deleteQtBangPhatMinhStaffUser(item.id, () => this.props.userGetStaff(this.state.canBo.shcc)));
        e.preventDefault();
    }

    createUngDung = (e) => {
        e.preventDefault();
        this.modalUngDung.show(null, this.state.canBo.shcc);
    }

    editUngDung = (e, item) => {
        e.preventDefault();
        this.modalUngDung.show(item, this.state.canBo.shcc);
    }

    deleteUngDung = (e, item) => {
        T.confirm('Xóa thông tin ứng dụng thực tiễn và thương mại hóa kết quả nghiên cứu', 'Bạn có chắc bạn muốn xóa ứng dụng này?', true, isConfirm =>
            isConfirm && this.props.deleteQtUngDungThuongMaiStaffUser(item.id, () => this.props.userGetStaff(this.state.canBo.shcc)));
        e.preventDefault();
    }

    createLamViecNgoai = (e) => {
        e.preventDefault();
        this.modalLamViecNgoai.show(null, this.state.canBo.shcc);
    }

    editLamViecNgoai = (e, item) => {
        e.preventDefault();
        this.modalLamViecNgoai.show(item, this.state.canBo.shcc);
    }

    deleteLamViecNgoai = (e, item) => {
        T.confirm('Xóa thông tin tham gia làm việc tại Trường Đại học, Viện, Trung tâm nghiên cứu theo lời mời', 'Bạn có chắc bạn muốn xóa làm việc ngoài trường này?', true, isConfirm =>
            isConfirm && this.props.deleteQtLamViecNgoaiStaffUser(item.id, () => this.props.userGetStaff(this.state.canBo.shcc)));
        e.preventDefault();
    }

    copyAddress = e => {
        e.preventDefault();
        const dataThuongTru = this.thuongTru.value();
        this.hienTai.value(dataThuongTru.maTinhThanhPho, dataThuongTru.maQuanHuyen, dataThuongTru.maPhuongXa, dataThuongTru.soNhaDuong);
    }

    render() {
        const user = this.props.system ? this.props.system.user : {},
            currentPermission = user && user.permissions ? user.permissions : [],
            permissionDelete = currentPermission.includes('staff:login');
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
        let currentCanBo = this.props.staff && this.props.staff.userItem ? this.props.staff.userItem : null,
            tableNN = null, itemsNN = currentCanBo && currentCanBo.trinhDoNN ? currentCanBo.trinhDoNN : [],
            hocTapCongTac = currentCanBo && currentCanBo.hocTapCongTac ? currentCanBo.hocTapCongTac : [],
            qtDaoTao = currentCanBo && currentCanBo.daoTao ? currentCanBo.daoTao : [],
            nuocNgoai = currentCanBo && currentCanBo.nuocNgoai ? currentCanBo.nuocNgoai : [],
            khenThuong = currentCanBo && currentCanBo.khenThuong ? currentCanBo.khenThuong : [],
            kyLuat = currentCanBo && currentCanBo.kyLuat ? currentCanBo.kyLuat : [],
            nghienCuuKhoaHoc = currentCanBo && currentCanBo.nghienCuuKhoaHoc ? currentCanBo.nghienCuuKhoaHoc : [],
            huongDanLuanVan = currentCanBo && currentCanBo.huongDanLuanVan ? currentCanBo.huongDanLuanVan : [],
            sachGT = currentCanBo && currentCanBo.sachGiaoTrinh ? currentCanBo.sachGiaoTrinh : [],
            baiVietKhoaHoc = currentCanBo && currentCanBo.baiVietKhoaHoc ? currentCanBo.baiVietKhoaHoc : [],
            kyYeu = currentCanBo && currentCanBo.kyYeu ? currentCanBo.kyYeu : [],
            giaiThuong = currentCanBo && currentCanBo.giaiThuong ? currentCanBo.giaiThuong : [],
            bangPhatMinh = currentCanBo && currentCanBo.bangPhatMinh ? currentCanBo.bangPhatMinh : [],
            ungDungThuongMai = currentCanBo && currentCanBo.ungDungThuongMai ? currentCanBo.ungDungThuongMai : [],
            lamViecNgoai = currentCanBo && currentCanBo.lamViecNgoai ? currentCanBo.lamViecNgoai : [];
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
                    <TableCell type='buttons' content={item} permissionDelete={permissionDelete} onEdit={this.editHocTapCongTac} onDelete={this.deleteHocTapCongTac}></TableCell>
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
                    <TableCell type='buttons' content={item} permissionDelete={permissionDelete} onEdit={this.editDaoTao} onDelete={this.deleteDaoTao}></TableCell>
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
                    <TableCell type='buttons' content={item} permissionDelete={permissionDelete} onEdit={this.editNuocNgoai} onDelete={this.deleteNuocNgoai}></TableCell>
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
                    <TableCell type='buttons' content={item} permissionDelete={permissionDelete} onEdit={this.editKhenThuong} onDelete={this.deleteKhenThuong}></TableCell>
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
                    <TableCell type='buttons' content={item} permissionDelete={permissionDelete} onEdit={this.editKyLuat} onDelete={this.deleteKyLuat}></TableCell>
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
                    <TableCell type='buttons' content={item} permissionDelete={permissionDelete} onEdit={this.editNckh} onDelete={this.deleteNckh}></TableCell>
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
                    <TableCell type='buttons' content={item} permissionDelete={permissionDelete} onEdit={this.editHuongDanLuanVan} onDelete={this.deleteHuongDanLuanVan}></TableCell>
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
                    <TableCell type='buttons' content={item} permissionDelete={permissionDelete} onEdit={this.editSachGT} onDelete={this.deleteSachGT}></TableCell>
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
                    <TableCell type='buttons' content={item} permissionDelete={permissionDelete} onEdit={this.editBaiVietKhoaHoc} onDelete={this.deleteBaiVietKhoaHoc}></TableCell>
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
                    <TableCell type='buttons' content={item} permissionDelete={permissionDelete} onEdit={this.editKyYeu} onDelete={this.deleteKyYeu}></TableCell>
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
                    <TableCell type='buttons' content={item} permissionDelete={permissionDelete} onEdit={this.editGiaiThuong} onDelete={this.deleteGiaiThuong}></TableCell>
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
                    <TableCell type='buttons' content={item} permissionDelete={permissionDelete} onEdit={this.editBangPhatMinh} onDelete={this.deleteBangPhatMinh}></TableCell>
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
                    <TableCell type='buttons' content={item} permissionDelete={permissionDelete} onEdit={this.editUngDung} onDelete={this.deleteUngDung}></TableCell>
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
                    <TableCell type='buttons' content={item} permissionDelete={permissionDelete} onEdit={this.editLamViecNgoai} onDelete={this.deleteLamViecNgoai}></TableCell>
                </tr>)
        });
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
                                <Select className='form-group col-md-4' ref={e => this.phai = e} adapter={SelectAdapter_DmGioiTinh} label='Giới tính' />

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
                            <div className='form-group col-md-6'><TextInput ref={e => this.email = e} label='Địa chỉ email trường' maxLength={50} readOnly={true} /></div>
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
                            <div className='form-group col-md-4'><DateInput ref={e => this.ngayBienChe = e} label='Ngày vào biên chế/ tuyển dụng' min={new Date(1900, 1, 1).getTime()} max={new Date().getTime()} /></div>
                            <div className='form-group col-md-4'><TextInput ref={e => this.ngheNghiepCu = e} label='Nghề nghiệp trước khi tuyển dụng' maxLength={200} /></div>
                            {item.nhaGiaoNhanDan ? renderFieldText('form-group col-md-3', 'Nhà giáo nhân dân', item.nhaGiaoNhanDan, item.nhaGiaoNhanDan) : null}
                            {item.nhaGiaoUuTu ? renderFieldText('form-group col-md-3', 'Nhà giáo ưu tú', item.nhaGiaoUuTu, item.nhaGiaoUuTu) : null}
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
                    <div key={5} className='tile'>
                        <h3 className='tile-title'>Quá trình học tập công tác</h3>
                        <div className='tile-body'>
                            {tableHocTapCongTac}
                        </div>
                        <div className='tile-footer' style={{ textAlign: 'right' }}>
                            <button className='btn btn-info' type='button' onClick={e => this.create(e, this.modalHocTapCongTac)}>
                                <i className='fa fa-fw fa-lg fa-plus' />Thêm quá trình
                            </button>
                        </div>
                    </div>,
                    <div key={6} className='tile'>
                        <h3 className='tile-title'>Quá trình đào tạo</h3>
                        <div className='tile-body'>
                            {tableDaoTao}
                        </div>
                        <div className='tile-footer' style={{ textAlign: 'right' }}>
                            <button className='btn btn-info' type='button' onClick={e => this.create(e, this.modalDaoTao)}>
                                <i className='fa fa-fw fa-lg fa-plus' />Thêm quá trình
                            </button>
                        </div>
                    </div>,
                    <div key={7} className='tile'>
                        <h3 className='tile-title'>Quá trình đi nước ngoài</h3>
                        <div className='tile-body'>
                            {tableNuocNgoai}
                        </div>
                        <div className='tile-footer' style={{ textAlign: 'right' }}>
                            <button className='btn btn-info' type='button' onClick={e => this.create(e, this.modalNuocNgoai)}>
                                <i className='fa fa-fw fa-lg fa-plus' />Thêm quá trình
                            </button>
                        </div>
                    </div>,
                    <div key={8} className='tile'>
                        <h3 className='tile-title'>Quá trình khen thưởng</h3>
                        <div className='tile-body'>
                            {tableKhenThuong}
                        </div>
                        <div className='tile-footer' style={{ textAlign: 'right' }}>
                            <button className='btn btn-info' type='button' onClick={e => this.create(e, this.modalKhenThuong)}>
                                <i className='fa fa-fw fa-lg fa-plus' />Thêm quá trình
                            </button>
                        </div>
                    </div>,
                    <div key={9} className='tile'>
                        <h3 className='tile-title'>Quá trình kỷ luật</h3>
                        <div className='tile-body'>
                            {tableKyLuat}
                        </div>
                        <div className='tile-footer' style={{ textAlign: 'right' }}>
                            <button className='btn btn-info' type='button' onClick={e => this.create(e, this.modalKyLuat)}>
                                <i className='fa fa-fw fa-lg fa-plus' />Thêm quá trình
                            </button>
                        </div>
                    </div>,
                    <div key={10} className='tile'>
                        <h3 className='tile-title'>Quá trình nghiên cứu khoa học</h3>
                        <div className='tile-body'>
                            {tableNghienCuuKhoaHoc}
                        </div>
                        <div className='tile-footer' style={{ textAlign: 'right' }}>
                            <button className='btn btn-info' type='button' onClick={e => this.create(e, this.modalNckh)}>
                                <i className='fa fa-fw fa-lg fa-plus' />Thêm quá trình
                            </button>
                        </div>
                    </div>,
                    <div key={11} className='tile'>
                        <h3 className='tile-title'>Quá trình hướng dẫn luận văn</h3>
                        <div className='tile-body'>
                            {tableHuongDanLuanVan}
                        </div>
                        <div className='tile-footer' style={{ textAlign: 'right' }}>
                            <button className='btn btn-info' type='button' onClick={e => this.create(e, this.modalHuongDanLv)}>
                                <i className='fa fa-fw fa-lg fa-plus' />Thêm quá trình
                            </button>
                        </div>
                    </div>,
                    <div key={12} className='tile'>
                        <h3 className='tile-title'>Sách, giáo trình</h3>
                        <div className='tile-body'>
                            {tableSachGT}
                        </div>
                        <div className='tile-footer' style={{ textAlign: 'right' }}>
                            <button className='btn btn-info' type='button' onClick={e => this.create(e, this.modalSachGT)}>
                                <i className='fa fa-fw fa-lg fa-plus' />Thêm sách, giáo trình
                            </button>
                        </div>
                    </div>,
                    <div key={13} className='tile'>
                        <h3 className='tile-title'>Bài viết khoa học</h3>
                        <div className='tile-body'>
                            {tableBaiVietKhoaHoc}
                        </div>
                        <div className='tile-footer' style={{ textAlign: 'right' }}>
                            <button className='btn btn-info' type='button' onClick={e => this.create(e, this.modalBaiVietKhoaHoc)}>
                                <i className='fa fa-fw fa-lg fa-plus' />Thêm bài viết
                            </button>
                        </div>
                    </div>,
                    <div key={14} className='tile'>
                        <h3 className='tile-title'>Kỷ yếu hội nghị, hội thảo</h3>
                        <div className='tile-body'>
                            {tableKyYeu}
                        </div>
                        <div className='tile-footer' style={{ textAlign: 'right' }}>
                            <button className='btn btn-info' type='button' onClick={e => this.create(e, this.modalKyYeu)}>
                                <i className='fa fa-fw fa-lg fa-plus' />Thêm kỷ yếu
                            </button>
                        </div>
                    </div>,
                    <div key={15} className='tile'>
                        <h3 className='tile-title'>Giải thưởng đã đạt được</h3>
                        <div className='tile-body'>
                            {tableGiaiThuong}
                        </div>
                        <div className='tile-footer' style={{ textAlign: 'right' }}>
                            <button className='btn btn-info' type='button' onClick={e => this.createGiaiThuong(e)}>
                                <i className='fa fa-fw fa-lg fa-plus' />Thêm giải thưởng
                            </button>
                        </div>
                    </div>,
                    <div key={16} className='tile'>
                        <h3 className='tile-title'>Bằng phát minh, sáng chế (patent), giải pháp hữu ích</h3>
                        <div className='tile-body'>
                            {tableBangPhatMinh}
                        </div>
                        <div className='tile-footer' style={{ textAlign: 'right' }}>
                            <button className='btn btn-info' type='button' onClick={e => this.createBangPhatMinh(e)}>
                                <i className='fa fa-fw fa-lg fa-plus' />Thêm bằng phát minh
                            </button>
                        </div>
                    </div>,
                    <div key={17} className='tile'>
                        <h3 className='tile-title'>Ứng dụng thực tiễn và thương mại hóa kết quả nghiên cứu</h3>
                        <div className='tile-body'>
                            {tableUngDung}
                        </div>
                        <div className='tile-footer' style={{ textAlign: 'right' }}>
                            <button className='btn btn-info' type='button' onClick={e => this.createUngDung(e)}>
                                <i className='fa fa-fw fa-lg fa-plus' />Thêm ứng dụng
                            </button>
                        </div>
                    </div>,
                    <div key={18} className='tile'>
                        <h3 className='tile-title'>Tham gia làm việc tại Trường Đại học, Viện, Trung tâm nghiên cứu theo lời mời</h3>
                        <div className='tile-body'>
                            {tableLamViecNgoai}
                        </div>
                        <div className='tile-footer' style={{ textAlign: 'right' }}>
                            <button className='btn btn-info' type='button' onClick={e => this.createLamViecNgoai(e)}>
                                <i className='fa fa-fw fa-lg fa-plus' />Thêm thông tin
                            </button>
                        </div>
                    </div>,
                    <button key={19} type='button' title='Save' className='btn btn-primary btn-circle' style={{ position: 'fixed', right: '10px', bottom: '10px' }} onClick={this.save}>
                        <i className='fa fa-lg fa-save' />
                    </button>,
                    <RelationModal key={20} ref={this.modal} create={this.props.createQuanHeStaffUser} update={this.props.updateQuanHeStaffUser} />,
                    <TrinhDoNNModal key={21} ref={this.modalNN} create={this.props.createTrinhDoNNStaffUser} update={this.props.updateTrinhDoNNStaffUser} getData={this.props.userGetStaff} />,
                    <HocTapCongTacModal key={22} ref={e => this.modalHocTapCongTac = e} create={this.props.createQTHTCTStaffUser} update={this.props.updateQTHTCTStaffUser} getData={this.props.userGetStaff} />,
                    <DaoTaoModal key={23} ref={e => this.modalDaoTao = e} create={this.props.createQtDaoTaoStaffUser} update={this.props.updateQtDaoTaoStaffUser} getData={this.props.userGetStaff} />,
                    <NuocNgoaiModal key={24} ref={e => this.modalNuocNgoai = e} create={this.props.createQtNuocNgoaiStaffUser} update={this.props.updateQtNuocNgoaiStaffUser} getData={this.props.userGetStaff} />,
                    <KhenThuongModal key={25} ref={e => this.modalKhenThuong = e} create={this.props.createQtKhenThuongStaffUser} update={this.props.updateQtKhenThuongStaffUser} getData={this.props.userGetStaff} />,
                    <KyLuatModal key={26} ref={e => this.modalKyLuat = e} create={this.props.createQtKyLuatStaffUser} update={this.props.updateQtKyLuatStaffUser} getData={this.props.userGetStaff} />,
                    <NckhModal key={27} ref={e => this.modalNckh = e} create={this.props.createQtNckhStaffUser} update={this.props.updateQtNckhStaffUser} getData={this.props.userGetStaff} />,
                    <HuongDanLvModal key={28} ref={e => this.modalHuongDanLv = e} create={this.props.createQtHuongDanLVStaffUser} update={this.props.updateQtHuongDanLVStaffUser} getData={this.props.userGetStaff} />,
                    <SachGTModal key={29} ref={e => this.modalSachGT = e} create={this.props.createSachGTStaffUser} update={this.props.updateSachGTStaffUser} getData={this.props.userGetStaff} />,
                    <BaiVietKhoaHocModal key={30} ref={e => this.modalBaiVietKhoaHoc = e} create={this.props.createQtBaiVietKhoaHocStaffUser} update={this.props.updateQtBaiVietKhoaHocStaffUser} getData={this.props.userGetStaff} />,
                    <KyYeuModal key={31} ref={e => this.modalKyYeu = e} create={this.props.createQtKyYeuStaffUser} update={this.props.updateQtKyYeuStaffUser} getData={this.props.userGetStaff} />,
                    <GiaiThuongModal key={32} ref={e => this.modalGiaiThuong = e} create={this.props.createQtGiaiThuongStaffUser} update={this.props.updateQtGiaiThuongStaffUser} getData={this.props.userGetStaff} />,
                    <BangPhatMinhModal key={33} ref={e => this.modalBangPhatMinh = e} create={this.props.createQtBangPhatMinhStaffUser} update={this.props.updateQtBangPhatMinhStaffUser} getData={this.props.userGetStaff} />,
                    <UngDungModal key={34} ref={e => this.modalUngDung = e} create={this.props.createQtUngDungThuongMaiStaffUser} update={this.props.updateQtUngDungThuongMaiStaffUser} getData={this.props.userGetStaff} />,
                    <LamViecNgoaiModal key={35} ref={e => this.modalLamViecNgoai = e} create={this.props.createQtLamViecNgoaiStaffUser} update={this.props.updateQtLamViecNgoaiStaffUser} getData={this.props.userGetStaff} />
                    ]
                }
            </main>
        );
    }
}

const mapStateToProps = state => ({ system: state.system, division: state.division, staff: state.staff });
const mapActionsToProps = {
    updateProfile, userGetStaff, getDmQuanHeGiaDinhAll, getDmDonViAll, getDmChucVuAll, updateStaffUser, createQuanHeStaffUser, updateQuanHeStaffUser, deleteQuanHeStaffUser,
    createTrinhDoNNStaffUser, updateTrinhDoNNStaffUser, deleteTrinhDoNNStaffUser, getDmNgoaiNguAll, createQTHTCTStaffUser, updateQTHTCTStaffUser, deleteQTHTCTStaffUser,
    createQtDaoTaoStaffUser, updateQtDaoTaoStaffUser, deleteQtDaoTaoStaffUser, createQtNuocNgoaiStaffUser, updateQtNuocNgoaiStaffUser, deleteQtNuocNgoaiStaffUser,
    createQtKhenThuongStaffUser, updateQtKhenThuongStaffUser, deleteQtKhenThuongStaffUser, createQtKyLuatStaffUser, updateQtKyLuatStaffUser, deleteQtKyLuatStaffUser,
    createQtNckhStaffUser, updateQtNckhStaffUser, deleteQtNckhStaffUser, createQtHuongDanLVStaffUser, updateQtHuongDanLVStaffUser, deleteQtHuongDanLVStaffUser,
    createSachGTStaffUser, updateSachGTStaffUser, deleteSachGTStaffUser, createQtBaiVietKhoaHocStaffUser, updateQtBaiVietKhoaHocStaffUser, deleteQtBaiVietKhoaHocStaffUser,
    createQtKyYeuStaffUser, updateQtKyYeuStaffUser, deleteQtKyYeuStaffUser, createQtGiaiThuongStaffUser, updateQtGiaiThuongStaffUser, deleteQtGiaiThuongStaffUser,
    createQtBangPhatMinhStaffUser, updateQtBangPhatMinhStaffUser, deleteQtBangPhatMinhStaffUser, createQtUngDungThuongMaiStaffUser, updateQtUngDungThuongMaiStaffUser, deleteQtUngDungThuongMaiStaffUser,
    createQtLamViecNgoaiStaffUser, updateQtLamViecNgoaiStaffUser, deleteQtLamViecNgoaiStaffUser
};
export default connect(mapStateToProps, mapActionsToProps)(ProfilePage);
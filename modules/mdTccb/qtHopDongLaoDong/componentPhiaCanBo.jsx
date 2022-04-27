import { SelectAdapter_DmDanTocV2 } from 'modules/mdDanhMuc/dmDanToc/redux';
import { ComponentDiaDiem } from 'modules/mdDanhMuc/dmDiaDiem/componentDiaDiem';
import { SelectAdapter_DmGioiTinhV2 } from 'modules/mdDanhMuc/dmGioiTinh/redux';
import { SelectAdapter_DmQuocGia } from 'modules/mdDanhMuc/dmQuocGia/redux';
import { SelectAdapter_DmTrinhDoV2 } from 'modules/mdDanhMuc/dmTrinhDo/redux';
import React from 'react';
import { connect } from 'react-redux';
import { FormDatePicker, FormSelect, FormTextBox } from 'view/component/AdminPage';
import Dropdown from 'view/component/Dropdown';
import { SelectAdapter_FwCanBo, getStaffEdit, getStaffByEmail } from '../tccbCanBo/redux';
import { getTruongPhongTccb, suggestSoHopDong, getDaiDienKyHopDong } from './redux';
const EnumLoaiCanBo = Object.freeze({
    1: { text: 'Cán bộ mới' },
    2: { text: 'Cán bộ cũ' }
});

export class ComponentPhiaCanBo extends React.Component {

    state = { isTaoMoi: true, isCanBoCu: false }

    componentDidMount() {
        this.typeFilter.setText(EnumLoaiCanBo[1]);
    }

    handleHo = (e) => {
        this.ho.value(e.target.value.toUpperCase());
    }

    handleTen = (e) => {
        this.ten.value(e.target.value.toUpperCase());
    }

    handleCanBoChange = (item) => {
        this.props.onCanBoChange(item.id);
    }


    getValue = () => ({
        soHopDong: this.soHopDong.value(),
        ngayKyHopDong: Number(this.ngayKy.value()),
        nguooiKy: this.daiDien.value()
    })

    setShcc = (preShcc) => {
        if (this.newSHCC) this.newSHCC.value(preShcc);
    }

    setVal = (data = null) => {
        if (data) {
            if (data.isTaoMoi)
                this.setState({ isCanBoCu: true });
            else
                this.setState({ isTaoMoi: false, isCanBoCu: true });
            this.canBo.value(data.shcc ? data.shcc : '');
            this.ngaySinh.value(data.ngaySinh);
            this.gioiTinh.value(data.phai ? data.phai : '');
            data.cmnd && this.cmnd.value(data.cmnd ? data.cmnd : '');
            data.cmndNgayCap && this.cmndNgayCap.value(data.cmndNgayCap);
            data.cmndNoiCap && this.cmndNoiCap.value(data.cmndNoiCap);
            this.quocTich.value(data.quocGia ? data.quocGia : '');
            this.danToc.value(data.danToc ? data.danToc : '');
            data.emailCaNhan && this.emailCaNhan.value(data.emailCaNhan ? data.emailCaNhan : '');
            this.email.value(data.email ? data.email : '');
            this.dienThoai.value(data.dienThoaiCaNhan ? data.dienThoaiCaNhan : '');

            this.noiSinh.value(data.maTinhNoiSinh, data.maHuyenNoiSinh, data.maXaNoiSinh);
            this.nguyenQuan.value(data.maTinhNguyenQuan, data.maHuyenNoiSinh, data.maXaNguyenQuan);
            this.cuTru.value(data.hienTaiMaTinh, data.hienTaiMaHuyen, data.hienTaiMaXa, data.hienTaiSoNha);
            this.thuongTru.value(data.thuongTruMaTinh, data.thuongTruMaHuyen, data.thuongTruMaXa, data.thuongTruSoNha);

            this.hocVi.value(data.hocVi ? data.hocVi : '');
            this.hocViChuyenNganh.value(data.chuyenNganh ? data.chuyenNganh : '');

        }
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

    handleNewShcc = (value) => {
        let curShcc = value.currentTarget.value;
        if (curShcc && curShcc != '' && curShcc.length == 8) {
            this.props.getStaffEdit(curShcc, data => {
                if (data.item && !data.error) {
                    T.confirm('Cảnh báo', `Mã số <b>${data.item.shcc}</b> đã tồn tại trong dữ liệu cán bộ: <br/><br/> <b>${(data.item.ho + ' ' + data.item.ten).normalizedName()}</b> <br/> ${data.item.tenDonVi.normalizedName()
                        }. <br/><br/> Vui lòng nhập mã số khác!`, 'warning', true, isConfirm => {
                            isConfirm && this.newSHCC.value('');
                        });
                }
            });
        }
    }

    copyAddress = e => {
        e.preventDefault();
        const dataThuongTru = this.thuongTru.value();
        this.cuTru.value(dataThuongTru.maTinhThanhPho, dataThuongTru.maQuanHuyen, dataThuongTru.maPhuongXa, dataThuongTru.soNhaDuong);
    }

    checkNewEmail = () => {
        let newEmail = this.email.value();
        console.log(newEmail);
        this.props.getStaffByEmail(newEmail, (item) => {
            if (item) {
                T.notify(`Email ${newEmail} đã được sử dụng, vui lòng nhập email khác!`, 'danger');
                this.email.focus();
            }
        });
    }

    getValue = () => {
        try {
            const data = {
                shcc: (this.state.isCanBoCu) ? this.validate(this.canBo) : this.validate(this.newSHCC),
                isTaoMoi: !this.state.isCanBoCu,
                ngaySinh: this.validate(this.ngaySinh)?.getTime(),
                phai: this.validate(this.gioiTinh),
                cmnd: this.validate(this.cmnd),
                cmndNgayCap: this.validate(this.cmndNgayCap)?.getTime(),
                cmndNoiCap: this.validate(this.cmndNoiCap),
                quocGia: this.validate(this.quocTich),
                danToc: this.validate(this.danToc),
                emailCaNhan: this.validate(this.emailCaNhan),
                email: this.validate(this.email),
                dienThoaiCaNhan: this.validate(this.dienThoai),
                thuongTruMaTinh: this.thuongTru.value().maTinhThanhPho,
                thuongTruMaHuyen: this.thuongTru.value().maQuanHuyen,
                thuongTruMaXa: this.thuongTru.value().maPhuongXa,
                thuongTruSoNha: this.thuongTru.value().soNhaDuong,
                hienTaiMaTinh: this.cuTru.value().maTinhThanhPho,
                hienTaiMaHuyen: this.cuTru.value().maQuanHuyen,
                hienTaiMaXa: this.cuTru.value().maPhuongXa,
                hienTaiSoNha: this.cuTru.value().soNhaDuong,
                maTinhNoiSinh: this.noiSinh.value().maTinhThanhPho,
                maHuyenNoiSinh: this.noiSinh.value().maQuanHuyen,
                maXaNoiSinh: this.noiSinh.value().maPhuongXa,
                maTinhNguyenQuan: this.nguyenQuan.value().maTinhThanhPho,
                maHuyenNguyenQuan: this.nguyenQuan.value().maQuanHuyen,
                maXaNguyenQuan: this.nguyenQuan.value().maPhuongXa,
                hocVi: this.validate(this.hocVi),
                chuyenNganh: this.validate(this.hocViChuyenNganh)
            };
            if ((!this.state.isCanBoCu && this.state.isTaoMoi)) {
                data.ho = this.validate(this.ho);
                data.ten = this.validate(this.ten);
            }
            return data;
        } catch (selector) {
            selector.focus();
            T.notify('<b>' + (selector.props.label || 'Dữ liệu') + '</b> bị trống!', 'danger');
            return false;
        }
    }
    render() {
        const currentPermission = this.props.system && this.props.system.user && this.props.system.user.permissions ? this.props.system.user.permissions : [];
        let readOnly = !currentPermission.includes('qtHopDongLaoDong:write');
        return (<>
            <div className="tile">
                {
                    !this.state.isTaoMoi ?
                        <h3 className="tile-title">Thông tin phía cán bộ</h3> :
                        <>
                            <h3 className="tile-title" style={{ display: 'flex' }}>Thông tin phía&nbsp;&nbsp;
                                <Dropdown ref={e => this.typeFilter = e} items={[...Object.keys(EnumLoaiCanBo).map(key => EnumLoaiCanBo[key].text)]} onSelected={item => item == 'Cán bộ mới' ? this.setState({ isCanBoCu: false }) : this.setState({ isCanBoCu: true })} />
                            </h3>
                        </>
                }
                <div className="tile-body row">
                    {(this.state.isCanBoCu || !this.state.isTaoMoi) ?
                        <>
                            <FormSelect ref={e => this.canBo = e} data={SelectAdapter_FwCanBo} className='col-xl-5 col-md-6' label='Cán bộ' onChange={this.handleCanBoChange} readOnly={!this.state.isTaoMoi ? readOnly : readOnly} required />
                            <FormDatePicker ref={e => this.ngaySinh = e} type='date-mask' className='col-xl-4 col-md-6' label='Ngày sinh' required />
                        </> :
                        <>
                            <FormTextBox ref={e => this.newSHCC = e} label='Mã thẻ cán bộ mới' className='col-xl-3 col-md-6' required maxLength={10} onChange={this.handleNewShcc} />
                            <FormTextBox ref={e => this.ho = e} label='Họ và tên lót' style={{ textTransform: 'uppercase' }} className='col-xl-3 col-md-6' onChange={this.handleHo} readOnly={readOnly} required maxLength={100} />
                            <FormTextBox ref={e => this.ten = e} label='Tên' style={{ textTransform: 'uppercase' }} className='col-xl-3 col-md-6' onChange={this.handleTen} readOnly={readOnly} required maxLength={100} />
                            <FormDatePicker ref={e => this.ngaySinh = e} type='date-mask' className='col-xl-3 col-md-6' label='Ngày sinh' required readOnly={readOnly} />
                        </>
                    }
                    <FormSelect ref={e => this.gioiTinh = e} label='Giới tính' data={SelectAdapter_DmGioiTinhV2} className='col-xl-3 col-md-6'required />
                    <FormTextBox ref={e => this.cmnd = e} className='col-md-3' label='CMND/CCCD' required />
                    <FormDatePicker ref={e => this.cmndNgayCap = e} type='date-mask' className='col-md-3' label='Ngày cấp' />
                    <FormTextBox ref={e => this.cmndNoiCap = e} className='col-md-6' label='Nơi cấp' />
                    <FormSelect ref={e => this.quocTich = e} data={SelectAdapter_DmQuocGia} className='col-md-6' label='Quốc tịch' required readOnly={readOnly} />
                    <FormSelect ref={e => this.danToc = e} data={SelectAdapter_DmDanTocV2} className='col-md-6' label='Dân tộc' required readOnly={readOnly} />
                    <FormTextBox ref={e => this.emailCaNhan = e} label='Email cá nhân' className='col-md-4' readOnly={readOnly} />
                    <FormTextBox ref={e => this.email = e} label='Email trường' className='col-md-4' onChange={this.checkNewEmail} readOnly={readOnly} />
                    <FormTextBox type='phone' ref={e => this.dienThoai = e} label='Số diện thoại cá nhân' className='col-md-4' readOnly={readOnly} />
                    <ComponentDiaDiem ref={e => this.noiSinh = e} label='Nơi sinh' className='col-xl-6 col-md-6' />
                    <ComponentDiaDiem ref={e => this.nguyenQuan = e} label='Nguyên quán' className='col-xl-6 col-md-6' />
                    <ComponentDiaDiem ref={e => this.thuongTru = e} label='Địa chỉ thường trú' className='col-md-12' requiredSoNhaDuong={true} />
                    <p className='col-md-12'>
                        Nếu <b>Địa chỉ thường trú</b> là <b>Địa chỉ hiện tại</b> thì&nbsp;<a href='#' onClick={this.copyAddress}>nhấp vào đây</a>.
                    </p>
                    <ComponentDiaDiem ref={e => this.cuTru = e} label='Địa chỉ hiện tại' className='col-md-12' requiredSoNhaDuong={true} />
                    <FormSelect ref={e => this.hocVi = e} data={SelectAdapter_DmTrinhDoV2} label='Trình độ học vị' className='col-md-6' required />
                    <FormTextBox ref={e => this.hocViChuyenNganh = e} label='Chuyên ngành' className='col-md-6' />
                </div>
            </div>
        </>);
    }
}

const mapStateToProps = state => ({ staff: state.tccb.qtHopDongLaoDong, system: state.system });
const mapActionsToProps = {
    getTruongPhongTccb, suggestSoHopDong, getDaiDienKyHopDong, getStaffEdit, getStaffByEmail
};
export default connect(mapStateToProps, mapActionsToProps, null, { forwardRef: true })(ComponentPhiaCanBo);
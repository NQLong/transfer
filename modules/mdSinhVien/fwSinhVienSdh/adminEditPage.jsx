import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { AdminPage, FormTextBox, FormSelect, FormDatePicker } from 'view/component/AdminPage';
import { getSvSdhAdmin, updateSvSdhAdmin } from './redux';
import { SelectAdapter_DmQuocGia } from 'modules/mdDanhMuc/dmQuocGia/redux';
import { SelectAdapter_DmDanTocV2 } from 'modules/mdDanhMuc/dmDanToc/redux';
import { ComponentDiaDiem } from 'modules/mdDanhMuc/dmDiaDiem/componentDiaDiem';
import { SelectAdapter_DmTonGiaoV2 } from 'modules/mdDanhMuc/dmTonGiao/redux';
import { SelectAdapter_DmGioiTinhV2 } from 'modules/mdDanhMuc/dmGioiTinh/redux';
import { SelectAdapter_DmTinhTrangSinhVienV2 } from 'modules/mdDanhMuc/dmTinhTrangSinhVien/redux';
import T from 'view/js/common';
import { SelectAdapter_DmKhoaSdh } from 'modules/mdDanhMuc/dmKhoaSauDaiHoc/redux';
import { SelectAdapter_DmNganhSdh } from 'modules/mdDanhMuc/dmNganhSauDaiHoc/redux';
import { SelectAdapter_DmSvLoaiHinhDaoTao } from 'modules/mdDanhMuc/dmSvLoaiHinhDaoTao/redux';
import { SelectAdapter_DmHocSdhVer2 } from 'modules/mdDanhMuc/dmHocSdh/redux';
import { SelectAdapter_FwCanBo } from 'modules/mdTccb/tccbCanBo/redux';

class SinhVienPage extends AdminPage {
    state = { data: {}, lastModified: null, image: '', mssv: '', khoa: '' }

    componentDidMount() {
        T.ready('/user/students', () => {
            let route = T.routeMatcher('/user/sv-sdh/item/:mssv'),
                mssv = route.parse(window.location.pathname).mssv;
            this.setState({ isNew: mssv === 'new' }, () => {
                this.setState({ mssv });
                !this.state.isNew && this.props.getSvSdhAdmin(mssv, data => {
                    if (!data) {
                        T.notify('Lấy thông tin sinh viên bị lỗi!', 'danger');
                    } else {
                        this.setState({ data, khoa: data.maKhoa ? data.maKhoa : '' });
                        this.setVal(data);
                    }
                });
            });

        });
    }

    setVal = (data = {}) => {
        this.mssv.value(data.ma ? data.ma : '');
        this.ho.value(data.ho ? data.ho : '');
        this.ten.value(data.ten ? data.ten : '');
        this.ngaySinh.value(data.ngaySinh ? data.ngaySinh : '');
        this.nienKhoa.value(data.nienKhoa ? data.nienKhoa : '');
        this.danToc.value(data.danToc ? data.danToc : '');
        this.namTuyenSinh.value(data.namTuyenSinh || '');
        this.dienThoaiCaNhan.value(data.sdtCaNhan ? data.sdtCaNhan : '');
        this.dienThoaiLienLac.value(data.sdtLienHe ? data.sdtLienHe : '');
        this.emailCaNhan.value(data.email ? data.email : '');
        this.gioiTinh.value(data.gioiTinh ? ('0' + String(data.gioiTinh)) : '');
        this.khoa.value(data.maKhoa ? Number(data.maKhoa) : '');
        this.nganh.value(data.maNganh ? Number(data.maNganh) : '');
        this.thuongTru.value(data.thuongTruMaTinh, data.thuongTruMaHuyen, data.thuongTruMaXa, data.thuongTruSoNha);
        this.tenCha.value(data.hoTenCha ? data.hoTenCha : '');
        this.ngaySinhCha.value(data.namSinhCha ? data.namSinhCha : '');
        this.ngheNghiepCha.value(data.ngheNghiepCha ? data.ngheNghiepCha : '');
        this.tenMe.value(data.hoTenMe ? data.hoTenMe : '');
        this.ngaySinhMe.value(data.namSinhMe ? data.namSinhMe : '');
        this.ngheNghiepMe.value(data.ngheNghiepMe ? data.ngheNghiepMe : '');
        this.heDaoTao.value(data.heDaoTao ? data.heDaoTao : '');
        this.bacDaoTao.value(data.bacDaoTao ? data.bacDaoTao : '');
        this.tinhTrang.value(data.tinhTrang ? data.tinhTrang : '');
        this.tonGiao.value(data.tonGiao ? data.tonGiao : '');
        this.quocTich.value(data.quocTich ? data.quocTich : '');
        this.sdtCha.value(data.sdtCha ? data.sdtCha : '');
        this.sdtMe.value(data.sdtMe ? data.sdtMe : '');
        // this.hoTenNguoiLienLac.value(data.hoTenNguoiLienLac ? data.hoTenNguoiLienLac : '');
        this.sdtNguoiLienLac.value(data.sdtNguoiLienLac ? data.sdtNguoiLienLac : '');
        this.chuongTrinhDaoTao.value(data.chuongTrinhDaoTao ? data.chuongTrinhDaoTao : '');
        this.coQuan.value(data.coQuan ? data.coQuan : '');
        this.tenDeTai.value(data.tenDeTai ? data.tenDeTai : '');
        this.gvhd.value(data.gvhd ? JSON.parse(data.gvhd) : []);
    };

    getAndValidate = () => {
        try {
            const { maTinhThanhPho: thuongTruMaTinh, maQuanHuyen: thuongTruMaHuyen, maPhuongXa: thuongTruMaXa, soNhaDuong: thuongTruSoNha } = this.thuongTru.value();
            const { maTinhThanhPho: hienTaiMaTinh, maQuanHuyen: hienTaiMaHuyen, maPhuongXa: hienTaiMaXa, soNhaDuong: hienTaiSoNha } = this.hienTai.value();
            const emailTruong = this.getValue(this.emailTruong);
            const emailCaNhan = this.getValue(this.emailCaNhan);

            if (emailTruong && !T.validateEmail(emailTruong)) {
                this.emailTruong.focus();
                T.notify('Email trường không hợp lệ', 'danger');
                return false;
            }

            else if (emailCaNhan && !T.validateEmail(emailCaNhan)) {
                this.emailCaNhan.focus();
                T.notify('Email cá nhân không hợp lệ', 'danger');
                return false;
            }

            else {
                const data = {
                    mssv: this.getValue(this.mssv),
                    ho: this.getValue(this.ho),
                    ten: this.getValue(this.ten),
                    cmnd: this.getValue(this.cmnd),
                    cmndNgayCap: this.getValue(this.cmndNgayCap, 'date'),
                    cmndNoiCap: this.getValue(this.cmndNoiCap),
                    namTuyenSinh: this.getValue(this.namTuyenSinh, 'number'),
                    ngaySinh: this.getValue(this.ngaySinh, 'date'),
                    danToc: this.getValue(this.danToc),
                    nienKhoa: this.getValue(this.nienKhoa),
                    dienThoaiCaNhan: this.getValue(this.dienThoaiCaNhan),
                    dienThoaiKhac: this.getValue(this.dienThoaiKhac),
                    dienThoaiLienLac: this.getValue(this.dienThoaiLienLac),
                    emailCaNhan, emailTruong,
                    ngayNhapHoc: this.getValue(this.ngayNhapHoc, 'date'),
                    gioiTinh: this.getValue(this.gioiTinh),
                    khoa: this.getValue(this.khoa),
                    maKhoa: this.getValue(this.maKhoa),
                    maNganh: this.getValue(this.maNganh),
                    tenCha: this.getValue(this.tenCha),
                    ngaySinhCha: this.getValue(this.ngaySinhCha) ? this.getValue(this.ngaySinhCha).getTime() : '',
                    ngheNghiepCha: this.getValue(this.ngheNghiepCha),
                    tenMe: this.getValue(this.tenMe),
                    ngaySinhMe: this.getValue(this.ngaySinhMe) ? this.getValue(this.ngaySinhMe).getTime() : '',
                    ngheNghiepMe: this.getValue(this.ngheNghiepMe),
                    heDaoTao: this.getValue(this.heDaoTao),
                    bacDaoTao: this.getValue(this.bacDaoTao),
                    chuongTrinhDaoTao: this.getValue(this.chuongTrinhDaoTao),
                    tinhTrang: this.getValue(this.tinhTrang),
                    tonGiao: this.getValue(this.tonGiao),
                    quocGia: this.getValue(this.quocTich),
                    sdtCha: this.getValue(this.sdtCha),
                    sdtMe: this.getValue(this.sdtMe),
                    // hoTenNguoiLienLac: this.getValue(this.hoTenNguoiLienLac),
                    sdtNguoiLienLac: this.getValue(this.sdtNguoiLienLac),
                    thuongTruMaHuyen, thuongTruMaTinh, thuongTruMaXa, thuongTruSoNha,
                    hienTaiMaHuyen, hienTaiMaTinh, hienTaiMaXa, hienTaiSoNha,
                    coQuan: this.coQuan.value(),
                    tenDeTai: this.tenDeTai.value(),
                    gvhd: JSON.stringify(this.gvhd.value())
                };
                return data;
            }
        }

        catch (selector) {
            selector.focus();
            T.notify('<b>' + (selector.props.label || 'Dữ liệu') + '</b> bị trống!', 'danger');
            return false;
        }
    };

    copyAddress = e => {
        e.preventDefault();
        const dataThuongTru = this.thuongTru.value();
        this.hienTai.value(dataThuongTru.maTinhThanhPho, dataThuongTru.maQuanHuyen, dataThuongTru.maPhuongXa, dataThuongTru.soNhaDuong);
    };

    imageChanged = (data) => {
        if (data.error) {
            T.notify(data.error, 'danger');
        }
    };

    getValue = (selector, type = null) => {
        const data = selector.value();
        const isRequired = selector.props.required;
        if (data || data === 0) {
            if (type && type === 'date') return data.getTime();
            else if (type && type === 'number') return Number(data);
            return data;
        }
        if (isRequired) throw selector;
        return '';
    };

    save = () => {
        const studentData = this.getAndValidate();
        if (studentData) {
            this.state.isNew ? this.props.createStudentAdmin(studentData) : this.props.updateStudentAdmin(this.state.mssv, studentData);
        }
    };

    render() {
        let item = this.props.system && this.props.system.user ? this.props.system.user.student : null;
        let permission = this.getUserPermission('student', ['read', 'write', 'delete']),
            readOnly = !permission.write;
        return this.renderPage({
            icon: 'fa fa-user-circle-o',
            title: 'Lý lịch cá nhân sinh viên',
            subTitle: <i style={{ color: 'blue' }}>{item ? item.ho + ' ' + item.ten : ''}</i>,
            breadcrumb: [
                <Link key={0} to='/user/students'>Sinh viên</Link>,
                <Link key={1} to='/user/students/lists'>Danh sách</Link>,
                'Lý lịch cá nhân sinh viên'
            ],
            content: <>
                <div className='tile'>
                    <h3 className='tile-title'>Thông tin cơ bản</h3>
                    <div className='tile-body'>
                        <div className='row'>
                            <FormTextBox ref={e => this.mssv = e} label='Mã số sinh viên' className='form-group col-md-3' readOnly={readOnly} />
                            <FormTextBox ref={e => this.ho = e} label='Họ và tên lót' className='form-group col-md-4' readOnly={readOnly} />
                            <FormTextBox ref={e => this.ten = e} label='Tên' className='form-group col-md-3' readOnly={readOnly} />
                            <FormSelect ref={e => this.gioiTinh = e} label='Giới tính' className='form-group col-md-2' readOnly={readOnly} data={SelectAdapter_DmGioiTinhV2} />
                            <FormSelect ref={e => this.khoa = e} label='Khoa' className='form-group col-md-3' readOnly={readOnly} data={SelectAdapter_DmKhoaSdh} onChange={value => this.setState({ khoa: value.id})}/>
                            <FormSelect ref={e => this.nganh = e} label='Ngành' className='form-group col-md-4' readOnly={readOnly} data={SelectAdapter_DmNganhSdh(this.state.khoa)} />
                            <FormTextBox type='year' ref={e => this.namTuyenSinh = e} label='Năm tuyển sinh' className='col-md-2' readOnly={readOnly} />
                            <FormTextBox ref={e => this.nienKhoa = e} label='Niên khóa' className='form-group col-md-3' readOnly={readOnly} />
                            <FormSelect ref={e => this.bacDaoTao = e} label='Bậc đào tạo' className='form-group col-md-4' readOnly={readOnly} data={SelectAdapter_DmHocSdhVer2} />
                            <FormSelect ref={e => this.heDaoTao = e} label='Hệ đào tạo' className='form-group col-md-4' readOnly={readOnly} data={SelectAdapter_DmSvLoaiHinhDaoTao} />
                            <FormTextBox ref={e => this.chuongTrinhDaoTao = e} label='Chương trình đào tạo' className='form-group col-md-4' readOnly={readOnly} />
                            <FormSelect ref={e => this.tinhTrang = e} label='Tình trạng' className='form-group col-md-3' readOnly={readOnly} data={SelectAdapter_DmTinhTrangSinhVienV2} />
                            <FormDatePicker ref={e => this.ngaySinh = e} label='Ngày sinh' type='date-mask' className='form-group col-md-3' required />
                            <FormSelect ref={e => this.quocTich = e} label='Quốc tịch' className='form-group col-md-3' data={SelectAdapter_DmQuocGia} />
                            <FormSelect ref={e => this.danToc = e} label='Dân tộc' className='form-group col-md-3' data={SelectAdapter_DmDanTocV2} />
                            <FormSelect ref={e => this.tonGiao = e} label='Tôn giáo' className='form-group col-md-3' data={SelectAdapter_DmTonGiaoV2} />
                            <ComponentDiaDiem ref={e => this.thuongTru = e} label='Thường trú' className='form-group col-md-12' requiredSoNhaDuong={true} />
                            <p className='form-group col-md-12'>
                                Nếu <b>Địa chỉ thường trú</b> là <b>Địa chỉ hiện tại</b> thì&nbsp;<a href='#' onClick={this.copyAddress}>nhấp vào đây</a>.
                            </p>
                            <ComponentDiaDiem ref={e => this.hienTai = e} label='Nơi ở hiện tại' className='form-group col-md-12' requiredSoNhaDuong={true} />
                            {/* <FormTextBox ref={e => this.cmnd = e} label='CMND/CCCD' className='col-md-4' readOnly={readOnly} />
                            <FormDatePicker type='date-mask' ref={e => this.cmndNgayCap = e} label='Ngày cấp' className='col-md-4' readOnly={readOnly} />
                            <FormTextBox ref={e => this.cmndNoiCap = e} label='Nơi cấp' className='col-md-4' readOnly={readOnly} /> */}
                            <FormTextBox ref={e => this.dienThoaiCaNhan = e} label='Điện thoại cá nhân' className='form-group col-md-4' maxLength={10} />
                            <FormTextBox ref={e => this.dienThoaiLienLac = e} label='Điện thoại liên lạc' className='form-group col-md-4' maxLength={10} />
                            <FormTextBox ref={e => this.emailCaNhan = e} label='Email' className='form-group col-md-6' />
                            <FormTextBox ref={e => this.tenCha = e} label='Họ tên cha' className='form-group col-md-3' />
                            <FormTextBox ref={e => this.sdtCha = e} label='Số điện thoại cha' className='form-group col-md-3' />
                            <FormDatePicker ref={e => this.ngaySinhCha = e} label='Ngày sinh cha' type='date-mask' className='form-group col-md-3' />
                            <FormTextBox ref={e => this.ngheNghiepCha = e} label='Nghề nghiệp cha' className='form-group col-md-3' />
                            <FormTextBox ref={e => this.tenMe = e} label='Họ tên mẹ' className='form-group col-md-3' />
                            <FormTextBox ref={e => this.sdtMe = e} label='Số điện thoại mẹ' className='form-group col-md-3' />
                            <FormDatePicker ref={e => this.ngaySinhMe = e} label='Ngày sinh mẹ' type='date-mask' className='form-group col-md-3' />
                            <FormTextBox ref={e => this.ngheNghiepMe = e} label='Nghề  nghiệp mẹ' className='form-group col-md-3' />
                            {/* <FormTextBox ref={e => this.hoTenNguoiLienLac = e} label='Họ tên người liên lạc' className='form-group col-md-4' /> */}
                            <FormTextBox ref={e => this.sdtNguoiLienLac = e} label='Số  điện thoại người liên lạc' className='form-group col-md-4' />
                            <FormTextBox ref={e => this.coQuan = e} label='Tên cơ quan' className='form-group col-md-4' />
                            <FormTextBox ref={e => this.tenDeTai = e} label='Tên đề tài' className='form-group col-md-4' />
                            <FormSelect ref={e => this.gvhd = e} label='Giảng viên hướng dẫn' className='form-group col-md-4' multiple data={SelectAdapter_FwCanBo} />

                        </div>
                    </div>
                </div>
            </>,
            backRoute: '/user/sv-sdh/list',
            onSave: this.save,
        });
    }
}

const mapStateToProps = state => ({ system: state.system, svSdh: state.svSdh });
const mapActionsToProps = {
    getSvSdhAdmin, updateSvSdhAdmin 
};
export default connect(mapStateToProps, mapActionsToProps)(SinhVienPage);
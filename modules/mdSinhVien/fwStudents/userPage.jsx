import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { AdminPage, FormTextBox, FormSelect, FormImageBox, FormDatePicker, FormCheckbox } from 'view/component/AdminPage';
import { getSinhVienEditUser, updateStudentUser, downloadWord } from './redux';
import { SelectAdapter_DmQuocGia } from 'modules/mdDanhMuc/dmQuocGia/redux';
import { SelectAdapter_DmDanTocV2 } from 'modules/mdDanhMuc/dmDanToc/redux';
import { ComponentDiaDiem } from 'modules/mdDanhMuc/dmDiaDiem/componentDiaDiem';
import { SelectAdapter_DmTonGiaoV2 } from 'modules/mdDanhMuc/dmTonGiao/redux';
import { SelectAdapter_DmGioiTinhV2 } from 'modules/mdDanhMuc/dmGioiTinh/redux';
// import { SelectAdapter_DmLoaiSinhVienV2 } from 'modules/mdDanhMuc/dmLoaiSinhVien/redux';
// import { SelectAdapter_DmTinhTrangSinhVienV2 } from 'modules/mdDanhMuc/dmTinhTrangSinhVien/redux';
import { updateSystemState } from 'modules/_default/_init/reduxSystem';
import T from 'view/js/common';
import { SelectAdapter_DtNganhDaoTaoStudent } from 'modules/mdDaoTao/dtNganhDaoTao/redux';
import { ajaxSelectTinhThanhPho } from 'modules/mdDanhMuc/dmDiaDiem/reduxTinhThanhPho';
import { SelectAdapter_DmSvDoiTuongTs } from 'modules/mdDanhMuc/dmSvDoiTuongTs/redux';
import { SelectAdapter_DmPhuongThucTuyenSinh } from 'modules/mdDanhMuc/dmPhuongThucTuyenSinh/redux';
// import { SelectAdapter_DmSvLoaiHinhDaoTao } from 'modules/mdDanhMuc/dmSvLoaiHinhDaoTao/redux';

class SinhVienPage extends AdminPage {
    state = { item: null, lastModified: null, image: '' }

    componentDidMount() {
        T.ready('/user', () => {
            this.props.getSinhVienEditUser(data => {
                if (data.error) {
                    T.notify('Lấy thông tin sinh viên bị lỗi!', 'danger');
                } else {
                    this.setState({ item: data.item, daNhapHoc: data.item.ngayNhapHoc && data.item.ngayNhapHoc != -1 });
                    this.setVal(data.item);
                }
            });
        });
    }

    setVal = (data = {}) => {
        this.mssv.value(data.mssv ? data.mssv : '');
        this.ho.value(data.ho ? data.ho : '');
        this.ten.value(data.ten ? data.ten : '');
        this.ngaySinh.value(data.ngaySinh ? data.ngaySinh : '');
        // this.nienKhoa.value(data.nienKhoa ? data.nienKhoa : '');
        this.danToc.value(data.danToc ? data.danToc : '');
        this.cmnd.value(data.cmnd || '');
        this.cmndNgayCap.value(data.cmndNgayCap);
        this.cmndNoiCap.value(data.cmndNoiCap || '');
        // this.namTuyenSinh.value(data.namTuyenSinh || '');
        this.dienThoaiCaNhan.value(data.dienThoaiCaNhan ? data.dienThoaiCaNhan : '');
        // this.dienThoaiKhac.value(data.dienThoaiKhac ? data.dienThoaiKhac : '');
        // this.dienThoaiLienLac.value(data.dienThoaiLienLac ? data.dienThoaiLienLac : '');
        // this.emailTruong.value(data.emailTruong ? data.emailTruong : '');
        this.emailCaNhan.value(data.emailCaNhan ? data.emailCaNhan : '');
        this.gioiTinh.value(data.gioiTinh ? ('0' + String(data.gioiTinh)) : '');
        this.noiSinhMaTinh.value(data.noiSinhMaTinh);
        // this.khoa.value(data.khoa ? data.khoa : '');
        // this.maKhoa.value(data.maKhoa ? data.maKhoa : '');
        this.doiTuongTuyenSinh.value(data.doiTuongTuyenSinh);
        this.khuVucTuyenSinh.value(data.khuVucTuyenSinh);
        this.phuongThucTuyenSinh.value(data.phuongThucTuyenSinh);
        this.diemThi.value(data.diemThi || '');
        this.doiTuongChinhSach.value(data.doiTuongChinhSach);
        this.maNganh.value(data.maNganh ? data.maNganh : '');
        this.thuongTru.value(data.thuongTruMaTinh, data.thuongTruMaHuyen, data.thuongTruMaXa, data.thuongTruSoNha);
        this.thuongTruCha.value(data.thuongTruMaTinhCha, data.thuongTruMaHuyenCha, data.thuongTruMaXaCha, data.thuongTruSoNhaCha);
        this.thuongTruMe.value(data.thuongTruMaTinhMe, data.thuongTruMaHuyenMe, data.thuongTruMaXaMe, data.thuongTruSoNhaMe);

        this.tenCha.value(data.tenCha ? data.tenCha : '');
        this.ngaySinhCha.value(data.ngaySinhCha ? data.ngaySinhCha : '');
        this.ngheNghiepCha.value(data.ngheNghiepCha ? data.ngheNghiepCha : '');
        this.tenMe.value(data.tenMe ? data.tenMe : '');
        this.ngaySinhMe.value(data.ngaySinhMe ? data.ngaySinhMe : '');
        this.ngheNghiepMe.value(data.ngheNghiepMe ? data.ngheNghiepMe : '');
        this.thuongTruNguoiLienLac.value(data.lienLacMaTinh, data.lienLacMaHuyen, data.lienLacMaXa, data.lienLacSoNha);
        // this.loaiHinhDaoTao.value(data.loaiHinhDaoTao ? data.loaiHinhDaoTao : '');
        // this.loaiSinhVien.value(data.loaiSinhVien ? data.loaiSinhVien : '');
        // this.tinhTrang.value(data.tinhTrang ? data.tinhTrang : '');
        this.tonGiao.value(data.tonGiao ? data.tonGiao : '');
        // this.lop.value(data.lop ? data.lop : '');
        this.quocTich.value(data.quocGia ? data.quocGia : '');
        this.imageBox.setData('SinhVienImage:' + data.mssv, data.image ? data.image : '/img/avatar.png');
        this.sdtCha.value(data.sdtCha ? data.sdtCha : '');
        this.sdtMe.value(data.sdtMe ? data.sdtMe : '');
        this.hoTenNguoiLienLac.value(data.hoTenNguoiLienLac ? data.hoTenNguoiLienLac : '');
        this.sdtNguoiLienLac.value(data.sdtNguoiLienLac ? data.sdtNguoiLienLac : '');
        data.ngayVaoDang && this.setState({ isDangVien: true }, () => {
            this.ngayVaoDang.value(data.ngayVaoDang);
        });
        data.ngayVaoDoan && this.setState({ isDoanVien: true }, () => {
            this.ngayVaoDoan.value(data.ngayVaoDoan);
        });
    };

    getAndValidate = () => {
        try {
            const { maTinhThanhPho: thuongTruMaTinh, maQuanHuyen: thuongTruMaHuyen, maPhuongXa: thuongTruMaXa, soNhaDuong: thuongTruSoNha } = this.thuongTru.value(),
                { maTinhThanhPho: thuongTruMaTinhCha, maQuanHuyen: thuongTruMaHuyenCha, maPhuongXa: thuongTruMaXaCha, soNhaDuong: thuongTruSoNhaCha } = this.thuongTruCha.value(),
                { maTinhThanhPho: thuongTruMaTinhMe, maQuanHuyen: thuongTruMaHuyenMe, maPhuongXa: thuongTruMaXaMe, soNhaDuong: thuongTruSoNhaMe } = this.thuongTruMe.value(),
                { maTinhThanhPho: lienLacMaTinh, maQuanHuyen: lienLacMaHuyen, maPhuongXa: lienLacMaXa, soNhaDuong: lienLacSoNha } = this.thuongTruNguoiLienLac.value();

            const emailCaNhan = this.getValue(this.emailCaNhan);
            if (emailCaNhan && !T.validateEmail(emailCaNhan)) {
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
                    noiSinhMaTinh: this.getValue(this.noiSinhMaTinh),
                    // namTuyenSinh: this.getValue(this.namTuyenSinh, 'number'),
                    ngaySinh: this.getValue(this.ngaySinh, 'date'),
                    danToc: this.getValue(this.danToc),
                    dienThoaiCaNhan: this.getValue(this.dienThoaiCaNhan),
                    // dienThoaiKhac: this.getValue(this.dienThoaiKhac),
                    // dienThoaiLienLac: this.getValue(this.dienThoaiLienLac),
                    emailCaNhan,
                    gioiTinh: this.getValue(this.gioiTinh),
                    // khoa: this.getValue(this.khoa),
                    // maKhoa: this.getValue(this.maKhoa),
                    maNganh: this.getValue(this.maNganh),
                    doiTuongTuyenSinh: this.getValue(this.doiTuongTuyenSinh),
                    khuVucTuyenSinh: this.getValue(this.khuVucTuyenSinh),
                    phuongThucTuyenSinh: this.getValue(this.phuongThucTuyenSinh),
                    diemThi: Number(this.getValue(this.diemThi)).toFixed(2),
                    doiTuongChinhSach: this.getValue(this.doiTuongChinhSach),
                    tenCha: this.getValue(this.tenCha),
                    ngaySinhCha: this.getValue(this.ngaySinhCha, 'date'),
                    ngheNghiepCha: this.getValue(this.ngheNghiepCha),
                    tenMe: this.getValue(this.tenMe),
                    ngaySinhMe: this.getValue(this.ngaySinhMe, 'date'),
                    ngheNghiepMe: this.getValue(this.ngheNghiepMe),
                    tonGiao: this.getValue(this.tonGiao),
                    quocGia: this.getValue(this.quocTich),
                    thuongTruMaHuyen, thuongTruMaTinh, thuongTruMaXa, thuongTruSoNha,
                    lienLacMaHuyen, lienLacMaTinh, lienLacMaXa, lienLacSoNha,
                    thuongTruMaHuyenCha, thuongTruMaTinhCha, thuongTruMaXaCha, thuongTruSoNhaCha,
                    thuongTruMaHuyenMe, thuongTruMaTinhMe, thuongTruMaXaMe, thuongTruSoNhaMe,
                    sdtCha: this.getValue(this.sdtCha),
                    sdtMe: this.getValue(this.sdtMe),
                    hoTenNguoiLienLac: this.getValue(this.hoTenNguoiLienLac),
                    sdtNguoiLienLac: this.getValue(this.sdtNguoiLienLac),
                    ngayVaoDang: this.state.isDangVien ? this.getValue(this.ngayVaoDang, 'date') : '',
                    ngayVaoDoan: this.state.isDoanVien ? this.getValue(this.ngayVaoDoan, 'date') : '',
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
        this.lienLac.value(dataThuongTru.maTinhThanhPho, dataThuongTru.maQuanHuyen, dataThuongTru.maPhuongXa, dataThuongTru.soNhaDuong);
    };

    copyAddressCha = e => {
        e.preventDefault();
        const dataThuongTru = this.thuongTru.value();
        this.thuongTruCha.value(dataThuongTru.maTinhThanhPho, dataThuongTru.maQuanHuyen, dataThuongTru.maPhuongXa, dataThuongTru.soNhaDuong);
    };

    copyAddressMe = e => {
        e.preventDefault();
        const dataThuongTru = this.thuongTruCha.value();
        this.thuongTruMe.value(dataThuongTru.maTinhThanhPho, dataThuongTru.maQuanHuyen, dataThuongTru.maPhuongXa, dataThuongTru.soNhaDuong);
    };

    imageChanged = (data) => {
        if (data && data.image) {
            const user = Object.assign({}, this.props.system.user, { image: data.image });
            this.props.updateSystemState({ user });
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
    }

    save = () => {
        const studentData = this.getAndValidate();
        if (studentData) {
            this.props.updateStudentUser({ ...studentData, lastModified: new Date().getTime() }, () => this.setState({ lastModified: new Date().getTime() }));
        }
    };

    downloadWord = (e) => {
        e.preventDefault();
        T.confirm('XÁC NHẬN', 'Sinh viên cam đoan những lời khai trên là đúng sự thật. Nếu có gì sai tôi xin chịu trách nhiệm theo Quy chế hiện hành của Bộ GD&DT, ĐHQG-HCM và Nhà trường', 'info', true, isConfirm => {
            if (isConfirm) {
                T.download('/api/students-download-syll');
                this.props.updateStudentUser({ ngayNhapHoc: -1, lastModified: new Date().getTime() }, () => this.setState({ lastModified: new Date().getTime(), daNhapHoc: true }));
            }
        });
    }


    render() {
        let item = this.props.system && this.props.system.user ? this.props.system.user.student : null;
        let daNhapHoc = this.state.daNhapHoc,
            readOnly = daNhapHoc || this.state.edit;
        return this.renderPage({
            icon: 'fa fa-user-circle-o',
            title: 'Lý lịch cá nhân sinh viên',
            subTitle: <i style={{ color: 'blue' }}>{item ? item.ho + ' ' + item.ten : ''}</i>,
            breadcrumb: [
                <Link key={0} to='/user/'>Trang cá nhân</Link>,
                'Lý lịch cá nhân sinh viên'
            ],
            content: <>
                <div className='tile'>
                    <h3 className='tile-title'>Thông tin cơ bản</h3>
                    <div className='tile-body'>
                        <div className='row'>
                            <FormImageBox
                                ref={e => this.imageBox = e}
                                style={{ display: 'block' }}
                                label='Hình đại diện'
                                postUrl='/user/upload'
                                uploadType='SinhVienImage'
                                onSuccess={this.imageChanged}
                                className='col-md-3 rounded-circle' isProfile={true}
                            />
                            <div className='form-group col-md-9'>
                                <div className='row'>
                                    <FormTextBox ref={e => this.ho = e} label='Họ và tên lót' className='form-group col-md-6' readOnly onChange={e => this.ho.value(e.target.value.toUpperCase())} required />
                                    <FormTextBox ref={e => this.ten = e} label='Tên' className='form-group col-md-3' readOnly onChange={e => this.ten.value(e.target.value.toUpperCase())} required />
                                    <FormSelect ref={e => this.gioiTinh = e} label='Giới tính' className='form-group col-md-3' data={SelectAdapter_DmGioiTinhV2} readOnly={readOnly} required />
                                    <FormTextBox ref={e => this.mssv = e} label='Mã số sinh viên' className='form-group col-md-6' readOnly required />
                                    <FormSelect ref={e => this.maNganh = e} label='Ngành' className='form-group col-md-6' data={SelectAdapter_DtNganhDaoTaoStudent} readOnly required />
                                    <FormDatePicker ref={e => this.ngaySinh = e} label='Ngày sinh' type='date-mask' className='form-group col-md-5' required readOnly />
                                    <FormSelect className='col-md-7' ref={e => this.noiSinhMaTinh = e} data={ajaxSelectTinhThanhPho} readOnly={readOnly} label='Nơi sinh' required />
                                    {/* <FormSelect ref={e => this.khoa = e} label='Khoa' className='form-group col-md-5' data={SelectAdapter_DmDonViFaculty_V2} readOnly={readOnly} /> */}

                                    {/* <FormTextBox type='year' ref={e => this.namTuyenSinh = e} label='Năm tuyển sinh' className='col-md-12' readOnly /> */}

                                    {/* <FormTextBox ref={e => this.nienKhoa = e} label='Niên khóa' className='form-group col-md-3' readOnly />
                                    <FormTextBox ref={e => this.maKhoa = e} label='Mã khóa' className='form-group col-md-3' readOnly />
                                     <FormTextBox ref={e => this.lop = e} label='Lớp' className='form-group col-md-3' readOnly />
                                    <FormSelect ref={e => this.loaiHinhDaoTao = e} label='Loại hình đào tạo' className='form-group col-md-4' data={SelectAdapter_DmSvLoaiHinhDaoTao} readOnly />
                                    <FormSelect ref={e => this.loaiSinhVien = e} label='Loại sinh viên' className='form-group col-md-4' data={SelectAdapter_DmLoaiSinhVienV2} readOnly />
                                    <FormSelect ref={e => this.tinhTrang = e} label='Tình trạng' className='form-group col-md-4' data={SelectAdapter_DmTinhTrangSinhVienV2} readOnly /> */}
                                </div>
                            </div>
                            <ComponentDiaDiem ref={e => this.thuongTru = e} label='Thường trú' className='form-group col-md-12' requiredSoNhaDuong={true} readOnly={readOnly} />

                            <FormTextBox ref={e => this.cmnd = e} label='CMND/CCCD' className='col-md-4' required readOnly={readOnly} />
                            <FormDatePicker type='date-mask' ref={e => this.cmndNgayCap = e} label='Ngày cấp' className='col-md-4' required readOnly={readOnly} />
                            <FormTextBox ref={e => this.cmndNoiCap = e} label='Nơi cấp' className='col-md-4' required readOnly={readOnly} />
                            <FormSelect ref={e => this.quocTich = e} label='Quốc tịch' className='form-group col-md-4' data={SelectAdapter_DmQuocGia} required readOnly={readOnly} />
                            <FormSelect ref={e => this.danToc = e} label='Dân tộc' className='form-group col-md-4' data={SelectAdapter_DmDanTocV2} required readOnly={readOnly} />
                            <FormSelect ref={e => this.tonGiao = e} label='Tôn giáo' className='form-group col-md-4' data={SelectAdapter_DmTonGiaoV2} required readOnly={readOnly} />
                            <FormTextBox ref={e => this.dienThoaiCaNhan = e} label='Điện thoại cá nhân' className='form-group col-md-6' type='phone' required readOnly={readOnly} />
                            <FormTextBox ref={e => this.emailCaNhan = e} label='Email cá nhân' className='form-group col-md-6' required readOnly={readOnly} />
                            <FormSelect ref={e => this.doiTuongTuyenSinh = e} label='Đối tượng tuyển sinh' className='col-md-6' data={SelectAdapter_DmSvDoiTuongTs} required readOnly />
                            <FormSelect ref={e => this.khuVucTuyenSinh = e} label='Khu vực tuyển sinh' className='col-md-6' data={['KV1', 'KV2', 'KV2-NT', 'KV3']} readOnly required />
                            <FormSelect ref={e => this.phuongThucTuyenSinh = e} label='Phương thức tuyển sinh' className='col-md-6' data={SelectAdapter_DmPhuongThucTuyenSinh} readOnly required />
                            <FormTextBox ref={e => this.diemThi = e} label='Điểm thi (THPT/ĐGNL)' className='col-md-6' type='number' readOnly />
                            <FormTextBox ref={e => this.doiTuongChinhSach = e} label='Đối tượng chính sách' placeholder='Ghi rõ đối tượng chính sách, nếu không thuộc diện này thì ghi là Không' className='col-md-12' readOnly required />
                            <FormTextBox ref={e => this.tenCha = e} label='Họ và tên cha' className='form-group col-md-6' required readOnly={readOnly} />
                            <FormTextBox ref={e => this.sdtCha = e} label='Số điện thoại' className='form-group col-md-6' type='phone' required readOnly={readOnly} />
                            <FormDatePicker ref={e => this.ngaySinhCha = e} label='Ngày sinh' type='date-mask' className='form-group col-md-6' required readOnly={readOnly} />
                            <FormTextBox ref={e => this.ngheNghiepCha = e} label='Nghề nghiệp' className='form-group col-md-6' required readOnly={readOnly} />
                            <ComponentDiaDiem ref={e => this.thuongTruCha = e} label={<span>Địa chỉ thường trú {!readOnly && <a href='#' onClick={this.copyAddressCha}>(Giống địa chỉ thường trú của <b>sinh viên</b>)</a>}</span>} className='form-group col-md-12' requiredSoNhaDuong={true} readOnly={readOnly} />
                            <FormTextBox ref={e => this.tenMe = e} label='Họ và tên mẹ' className='form-group col-md-6' required readOnly={readOnly} />
                            <FormTextBox ref={e => this.sdtMe = e} label='Số điện thoại' className='form-group col-md-6' required readOnly={readOnly} />
                            <FormDatePicker ref={e => this.ngaySinhMe = e} label='Ngày sinh' type='date-mask' className='form-group col-md-6' required readOnly={readOnly} />
                            <FormTextBox ref={e => this.ngheNghiepMe = e} label='Nghề nghiệp' className='form-group col-md-6' readOnly={readOnly} />
                            <ComponentDiaDiem ref={e => this.thuongTruMe = e} label={<span>Địa chỉ thường trú {!readOnly && <a href='#' onClick={this.copyAddressMe}>(Giống địa chỉ thường trú của <b>cha</b>)</a>}</span>} className='form-group col-md-12' requiredSoNhaDuong={true} readOnly={readOnly} />
                            <FormCheckbox label='Đảng viên' className={this.state.isDangVien ? 'col-md-3' : 'col-md-12'} onChange={value => this.setState({ isDangVien: value })} ref={e => this.isDangVien = e} readOnly={readOnly} />
                            <FormDatePicker label='Ngày vào đảng' className='col-md-9' style={{ display: this.state.isDangVien ? 'block' : 'none' }} required={this.state.isDangVien} ref={e => this.ngayVaoDang = e} readOnly={readOnly} />
                            <FormCheckbox label='Đoàn viên' className={this.state.isDoanVien ? 'col-md-3' : 'col-md-12'} onChange={value => this.setState({ isDoanVien: value })} ref={e => this.isDoanVien = e} readOnly={readOnly} />
                            <FormDatePicker label='Ngày vào đoàn' className='col-md-9' style={{ display: this.state.isDoanVien ? 'block' : 'none' }} required={this.state.isDoanVien} ref={e => this.ngayVaoDoan = e} readOnly={readOnly} />
                            <FormTextBox ref={e => this.hoTenNguoiLienLac = e} label='Họ và tên người liên lạc' className='form-group col-md-6' required readOnly={readOnly} />
                            <FormTextBox ref={e => this.sdtNguoiLienLac = e} label='Số điện thoại' className='form-group col-md-6' type='phone' required readOnly={readOnly} />
                            <ComponentDiaDiem ref={e => this.thuongTruNguoiLienLac = e} label='Địa chỉ liên lạc' className='form-group col-md-12' requiredSoNhaDuong={true} readOnly={readOnly} />
                        </div>
                    </div>
                </div>
            </>,
            backRoute: '/user',
            buttons: [
                !readOnly && {
                    icon: 'fa-save', className: 'btn-success', onClick: this.save
                },
                !this.state.daNhapHoc && {
                    icon: 'fa-file-word-o', className: 'btn-primary', onClick: this.downloadWord
                }
            ]
        });
    }
}

const mapStateToProps = state => ({ system: state.system, sinhVien: state.sinhVien });
const mapActionsToProps = {
    getSinhVienEditUser, updateStudentUser, updateSystemState, downloadWord
};
export default connect(mapStateToProps, mapActionsToProps)(SinhVienPage);
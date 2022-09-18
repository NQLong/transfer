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
import { getSvSettingKeys } from '../svSetting/redux';
import { updateSystemState } from 'modules/_default/_init/reduxSystem';
import T from 'view/js/common';
import { SelectAdapter_DtNganhDaoTaoStudent } from 'modules/mdDaoTao/dtNganhDaoTao/redux';
import { ajaxSelectTinhThanhPho } from 'modules/mdDanhMuc/dmDiaDiem/reduxTinhThanhPho';
import { SelectAdapter_DmSvDoiTuongTs } from 'modules/mdDanhMuc/dmSvDoiTuongTs/redux';
import { SelectAdapter_DmPhuongThucTuyenSinh } from 'modules/mdDanhMuc/dmPhuongThucTuyenSinh/redux';
import { getSvBaoHiemYTe } from '../svBaoHiemYTe/redux';
import BaoHiemYTeModal from 'modules/mdKeHoachTaiChinh/tcHocPhi/BaoHiemYTeModal';
import InfoModal from '../svBaoHiemYTe/InfoModal';
class SinhVienPage extends AdminPage {
    state = { item: null, lastModified: null, image: '' }

    componentDidMount() {
        T.ready('/user', () => {
            this.props.getSinhVienEditUser(data => {
                if (data.error) {
                    T.notify('Lấy thông tin sinh viên bị lỗi!', 'danger');
                } else {
                    let user = this.props.system.user;
                    let { canEdit, namTuyenSinh, chuaDongHocPhi } = data.item;
                    let isTanSinhVien = user.isStudent && namTuyenSinh == new Date().getFullYear();
                    this.setState({ isTanSinhVien, chuaDongHocPhi, ngayNhapHoc: data.item.ngayNhapHoc, canEdit });
                    this.props.getSvBaoHiemYTe(item => {
                        if (item && !item.thoiGianHoanThanh) {
                            this.infoBhytModal.show(item);
                        }
                        this.setState({ daDangKyBhyt: !!item });
                        this.setVal(data.item);
                    });
                }
            });
        });
    }

    setVal = (data = {}) => {
        this.anhThe.setData('CardImage', `/api/student/get-anh-the?t=${new Date().getTime()}`);
        this.mssv.value(data.mssv ? data.mssv : '');
        this.ho.value(data.ho ? data.ho : '');
        this.ten.value(data.ten ? data.ten : '');
        this.ngaySinh.value(data.ngaySinh ? data.ngaySinh : '');
        this.danToc.value(data.danToc ? data.danToc : '');
        this.cmnd.value(data.cmnd || '');
        this.cmndNgayCap.value(data.cmndNgayCap);
        this.cmndNoiCap.value(data.cmndNoiCap || '');
        this.dienThoaiCaNhan.value(data.dienThoaiCaNhan ? data.dienThoaiCaNhan : '');
        this.emailCaNhan.value(data.emailCaNhan ? data.emailCaNhan : '');
        this.gioiTinh.value(data.gioiTinh ? ('0' + String(data.gioiTinh)) : '');
        this.noiSinhMaTinh.value(data.noiSinhMaTinh);
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
        this.tonGiao.value(data.tonGiao ? data.tonGiao : '');
        this.quocTich.value(data.quocGia ? data.quocGia : '');
        // this.imageBox.setData('SinhVienImage:' + data.mssv, data.image ? data.image : '/img/avatar.png');
        this.sdtCha.value(data.sdtCha ? data.sdtCha : '');
        this.sdtMe.value(data.sdtMe ? data.sdtMe : '');
        this.hoTenNguoiLienLac.value(data.hoTenNguoiLienLac ? data.hoTenNguoiLienLac : '');
        this.sdtNguoiLienLac.value(data.sdtNguoiLienLac ? data.sdtNguoiLienLac : '');
        data.ngayVaoDang && this.setState({ isDangVien: true }, () => {
            this.isDangVien.value();
            this.ngayVaoDang.value(data.ngayVaoDang);
        });
        data.ngayVaoDoan && this.setState({ isDoanVien: true }, () => {
            this.isDoanVien.value();
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
                    danToc: this.getValue(this.danToc),
                    dienThoaiCaNhan: this.getValue(this.dienThoaiCaNhan),
                    emailCaNhan,
                    gioiTinh: this.getValue(this.gioiTinh),
                    maNganh: this.getValue(this.maNganh),
                    doiTuongTuyenSinh: this.getValue(this.doiTuongTuyenSinh),
                    khuVucTuyenSinh: this.getValue(this.khuVucTuyenSinh),
                    phuongThucTuyenSinh: this.getValue(this.phuongThucTuyenSinh),
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

    getData = (done) => {
        const studentData = this.getAndValidate();
        if (studentData) {
            this.props.updateStudentUser({ ...studentData, lastModified: new Date().getTime() }, done);
        }
    }

    save = () => {
        // const goToHocPhi = () => T.confirm('LƯU Ý', 'Bạn phải thanh toán học phí để được xác nhận sơ yếu lý lịch. Đến trang Học phí?', 'warning', true, isConfirm => {
        //     if (isConfirm) {
        //         this.props.history.push('/user/hoc-phi');
        //     }
        // });
        T.confirm('CẢNH BÁO', 'Bạn có chắc chắn muốn lưu thay đổi thông tin cá nhân?', 'warning', true, isConfirm => {
            if (isConfirm) {
                if (this.state.daDangKyBhyt) {
                    this.getData(() => {
                        T.notify('Cập nhật thông tin sinh viên thành công!', 'success');
                        // this.state.isTanSinhVien && this.state.chuaDongHocPhi && goToHocPhi();
                    });
                } else {
                    this.baoHiemModal.show(() => this.getData(() => {
                        T.notify('Cập nhật thông tin sinh viên thành công!', 'success');
                        // this.state.isTanSinhVien && this.state.chuaDongHocPhi && goToHocPhi();
                    }));
                }
            }
        });
    };

    downloadWord = (e) => {
        e.preventDefault();
        const saveThongTin = () => this.props.updateStudentUser({ ngayNhapHoc: -1, canEdit: 0, lastModified: new Date().getTime() }, () => {
            this.setState({ ngayNhapHoc: -1, canEdit: 0 }, () => {
                setTimeout(() => this.state.isTanSinhVien && this.state.chuaDongHocPhi && T.alert('Bạn đã hoàn tất cập nhật lý lịch sinh viên', 'success', false, 2000),
                    2000);
            });
        });
        const studentData = this.getAndValidate();
        if (studentData) {
            this.props.updateStudentUser({ ...studentData, lastModified: new Date().getTime() }, () => {
                if (!this.state.daDangKyBhyt) {
                    T.notify('Đăng ký tham gia BHYT trước khi hoàn tất cập nhật', 'danger');
                    this.baoHiemModal.show();
                } else {
                    T.confirmLoading('LƯU Ý',
                        '<div>Vui lòng đảm bảo bạn ĐÃ HOÀN THIỆN thông tin cá nhân trước khi tạo file sơ yếu lý lịch!<br/> Bạn sẽ không thể thay đổi thông tin cá nhân sau khi chọn \"Đồng ý\"</div>', 'info',
                        {
                            loadingText: 'Hệ thống đang gửi sơ yếu lý lịch đến email sinh viên',
                            successText: 'Vui lòng kiểm tra email sinh viên (kể cả ở mục spam, thư rác)!',
                            failText: 'Hệ thống sẽ tự động tải về sơ yếu lý lịch sau vài giây!'
                        }, () => new Promise((resolve) => this.props.downloadWord(result => resolve(result))), this.downloadSyll, saveThongTin);
                }
            });
        }

    }

    downloadSyll = () => {
        T.alert('Vui lòng chờ trong giấy lát', 'info', false);
        T.download('/api/students-download-syll');
    }

    render() {
        let item = this.props.system && this.props.system.user ? this.props.system.user.student : null;
        let { ngayNhapHoc, canEdit } = this.state;
        let readOnly = !canEdit;
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
                            {/* <FormImageBox
                                ref={e => this.imageBox = e}
                                style={{ display: 'block' }}
                                label='Hình đại diện'
                                postUrl='/user/upload'
                                uploadType='SinhVienImage'
                                onSuccess={this.imageChanged}
                                readOnly={readOnly}
                                className='col-md-3 rounded-circle' isProfile={true}
                            /> */}
                            <div className='form-group col-md-12'>
                                <div className='row'>
                                    <FormTextBox ref={e => this.ho = e} label='Họ và tên lót' className='form-group col-md-6' readOnly onChange={e => this.ho.value(e.target.value.toUpperCase())} required />
                                    <FormTextBox ref={e => this.ten = e} label='Tên' className='form-group col-md-3' readOnly onChange={e => this.ten.value(e.target.value.toUpperCase())} required />
                                    <FormTextBox ref={e => this.mssv = e} label='Mã số sinh viên' className='form-group col-md-3' readOnly required />
                                    <FormSelect ref={e => this.maNganh = e} label='Ngành' className='form-group col-md-6' data={SelectAdapter_DtNganhDaoTaoStudent} readOnly required />
                                    <FormDatePicker ref={e => this.ngaySinh = e} label='Ngày sinh' type='date-mask' className='form-group col-md-6' required readOnly />
                                    <FormSelect ref={e => this.gioiTinh = e} label='Giới tính' className='form-group col-md-3' data={SelectAdapter_DmGioiTinhV2} readOnly={readOnly} required />
                                    <FormSelect className='col-md-9' ref={e => this.noiSinhMaTinh = e} data={ajaxSelectTinhThanhPho} readOnly={readOnly} label='Nơi sinh' required />
                                </div>
                            </div>
                            <ComponentDiaDiem ref={e => this.thuongTru = e} label='Thường trú' className='form-group col-md-12' requiredSoNhaDuong={true} readOnly={readOnly} />

                            <FormTextBox ref={e => this.cmnd = e} label='CCCD/Mã định danh' className='col-md-4' required readOnly={readOnly} />
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
                            <FormTextBox ref={e => this.diemThi = e} label='Điểm thi (THPT/ĐGNL)' className='col-md-6' readOnly />
                            <FormTextBox ref={e => this.doiTuongChinhSach = e} label='Đối tượng chính sách' placeholder='Ghi rõ đối tượng chính sách, nếu không thuộc diện này thì ghi là Không' className='col-md-12' readOnly={readOnly} required />
                            <FormTextBox ref={e => this.tenCha = e} label='Họ và tên cha' className='form-group col-md-6' readOnly={readOnly} />
                            <FormTextBox ref={e => this.sdtCha = e} label='Số điện thoại' className='form-group col-md-6' type='phone' readOnly={readOnly} />
                            <FormDatePicker ref={e => this.ngaySinhCha = e} label='Ngày sinh' type='date-mask' className='form-group col-md-6' readOnly={readOnly} />
                            <FormTextBox ref={e => this.ngheNghiepCha = e} label='Nghề nghiệp' className='form-group col-md-6' readOnly={readOnly} />
                            <ComponentDiaDiem ref={e => this.thuongTruCha = e} label={<span>Địa chỉ thường trú {!readOnly && <a href='#' onClick={this.copyAddressCha}>(Giống địa chỉ thường trú của <b>sinh viên</b>)</a>}</span>} className='form-group col-md-12' requiredSoNhaDuong={true} readOnly={readOnly} />
                            <FormTextBox ref={e => this.tenMe = e} label='Họ và tên mẹ' className='form-group col-md-6' readOnly={readOnly} />
                            <FormTextBox ref={e => this.sdtMe = e} label='Số điện thoại' className='form-group col-md-6' readOnly={readOnly} />
                            <FormDatePicker ref={e => this.ngaySinhMe = e} label='Ngày sinh' type='date-mask' className='form-group col-md-6' readOnly={readOnly} />
                            <FormTextBox ref={e => this.ngheNghiepMe = e} label='Nghề nghiệp' className='form-group col-md-6' readOnly={readOnly} />
                            <ComponentDiaDiem ref={e => this.thuongTruMe = e} label={<span>Địa chỉ thường trú {!readOnly && <a href='#' onClick={this.copyAddressMe}>(Giống địa chỉ thường trú của <b>cha</b>)</a>}</span>} className='form-group col-md-12' requiredSoNhaDuong={true} readOnly={readOnly} />
                            <FormCheckbox label='Đảng viên' className={this.state.isDangVien ? 'col-md-3' : 'col-md-12'} onChange={value => this.setState({ isDangVien: value })} ref={e => this.isDangVien = e} readOnly={readOnly} />
                            <FormDatePicker label='Ngày vào đảng' className='col-md-9' style={{ display: this.state.isDangVien ? 'block' : 'none' }} required={this.state.isDangVien} type='date-mask' ref={e => this.ngayVaoDang = e} readOnly={readOnly} />
                            <FormCheckbox label='Đoàn viên' className={this.state.isDoanVien ? 'col-md-3' : 'col-md-12'} onChange={value => this.setState({ isDoanVien: value })} ref={e => this.isDoanVien = e} readOnly={readOnly} />
                            <FormDatePicker label='Ngày vào đoàn' type='date-mask' className='col-md-9' style={{ display: this.state.isDoanVien ? 'block' : 'none' }} required={this.state.isDoanVien} ref={e => this.ngayVaoDoan = e} readOnly={readOnly} />
                            <FormTextBox ref={e => this.hoTenNguoiLienLac = e} label='Họ và tên người liên lạc' className='form-group col-md-6' required readOnly={readOnly} />
                            <FormTextBox ref={e => this.sdtNguoiLienLac = e} label='Số điện thoại' className='form-group col-md-6' type='phone' required readOnly={readOnly} />
                            <ComponentDiaDiem ref={e => this.thuongTruNguoiLienLac = e} label='Địa chỉ liên lạc' className='form-group col-md-12' requiredSoNhaDuong={true} readOnly={readOnly} />
                        </div>
                    </div>
                </div>
                <div className='tile'>
                    <h4 className='tile-title'>Ảnh thẻ sinh viên</h4>
                    <div className='tile-body'>
                        <div className='d-flex justify-content-evently align-items-center' style={{ gap: 10 }}>
                            <FormImageBox ref={e => this.anhThe = e}
                                uploadType='CardImage'
                                readOnly={readOnly}
                                boxUploadStye={{ width: '150px' }}
                                height='200px'
                            />
                            <ul style={{}}>
                                <li>Vui lòng tải lên ảnh <b className='text-danger'>đúng kích thước (3 x 4cm hay 113,386 x 151,181px)</b>.</li>
                                <li>Độ lớn của file ảnh <b className='text-danger'>không quá 1MB</b>. Giảm kích thước file ảnh tại <a href='https://www.iloveimg.com/compress-image' target='_blank' rel='noreferrer'>đây</a></li>
                                <li>Ảnh phải có nền 1 màu (trắng hoặc xanh), chi tiết rõ nét, nghiêm túc.</li>
                                <li>Đây là ảnh phục vụ cho công tác in thẻ sinh viên, đề nghị sinh viên chịu trách nhiệm với ảnh thẻ mình đã tải lên.</li>
                            </ul>
                        </div>
                    </div>
                </div>
                <div className='tile'>
                    <h4 className='tile-title'>Hướng dẫn thao tác</h4>
                    <div className='tile-body'>
                        <ul className='col-md-12'>
                            <li>Để <b>cập nhật và lưu thay đổi thông tin lý lịch</b>, sinh viên nhấp và biểu tượng:<div className='btn btn-circle btn-success' style={{ scale: '80%' }}><i className='fa fa-lg fa-save' /></div></li>

                            <li>Để lưu và nhận tệp tin <b className='text-primary'>Sơ yếu lí lịch</b> và <b className='text-primary'>Biên nhận nhập học</b>, sinh viên nhấp vào biểu tượng:<div className='btn btn-circle btn-danger' style={{ scale: '80%' }}><i className='fa fa-lg fa-file-pdf-o' /></div>. Sau đó, tệp tin sẽ được gửi đến email <i>{this.props.system?.user?.email || ''}</i>, đồng thời hệ thống ghi nhận <b>hoàn thành cập nhật hồ sơ</b></li>

                            <li>Trong trường hợp sinh viên không nhận được email, vui lòng nhấp vào biểu tượng<div className='btn btn-circle btn-info' style={{ scale: '80%' }}><i className='fa fa-lg fa-arrow-down' /></div> để tải về tệp tin <b className='text-primary'>Sơ yếu lí lịch</b> và <b className='text-primary'>Biên nhận nhập học</b></li>
                        </ul>
                    </div>
                </div>
                <BaoHiemYTeModal ref={e => this.baoHiemModal = e} />
                <InfoModal ref={e => this.infoBhytModal = e} />
            </>,
            backRoute: '/user',
            buttons: [
                canEdit && {
                    icon: 'fa-save', className: 'btn-success', onClick: this.save, tooltip: 'Lưu thay đổi thông tin của bạn'
                },
                canEdit && {
                    icon: 'fa-file-pdf-o', className: 'btn-danger', onClick: this.downloadWord, tooltip: 'Xuất Sơ yếu lý lịch của bạn'
                },
                (ngayNhapHoc == -1 && !canEdit) && {
                    icon: 'fa-arrow-down', className: 'btn-info', onClick: this.downloadSyll, tooltip: 'Tải Sơ yếu lý lịch của bạn'
                }
            ]
        });
    }
}

const mapStateToProps = state => ({ system: state.system, sinhVien: state.sinhVien });
const mapActionsToProps = {
    getSinhVienEditUser, updateStudentUser, updateSystemState, downloadWord, getSvSettingKeys, getSvBaoHiemYTe
};
export default connect(mapStateToProps, mapActionsToProps)(SinhVienPage);
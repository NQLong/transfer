import React from 'react';
import { connect } from 'react-redux';
import { updateSystemState } from 'modules/_default/_init/reduxSystem';
import { SelectAdapter_DmDonVi } from 'modules/mdDanhMuc/dmDonVi/redux';
import { FormImageBox, FormTextBox, FormSelect, FormDatePicker, FormRichTextBox, FormCheckbox, AdminPage } from 'view/component/AdminPage';
import { SelectAdapter_DmGioiTinhV2 } from 'modules/mdDanhMuc/dmGioiTinh/redux';
import { ComponentDiaDiem } from 'modules/mdDanhMuc/dmDiaDiem/componentDiaDiem';
import { SelectAdapter_DmQuocGia } from 'modules/mdDanhMuc/dmQuocGia/redux';
import { SelectAdapter_DmDanTocV2 } from 'modules/mdDanhMuc/dmDanToc/redux';
import { SelectAdapter_DmTonGiaoV2 } from 'modules/mdDanhMuc/dmTonGiao/redux';
import { SelectAdapter_DmNhomMauV2 } from 'modules/mdDanhMuc/dmBenhVien/reduxNhomMau';
import ComponentToChucKhac from '../tccbToChucKhac/componentToChucKhac';
import { getStaffEdit } from './redux';
import { SelectAdapter_DmHangThuongBinh } from 'modules/mdDanhMuc/dmHangThuongBinh/redux';

class ComponentCaNhan extends AdminPage {
    state = { image: '', dangVien: 0, doanVien: 0, congDoan: 0 };
    // shcc = ''; email = '';
    componentDidMount() {
        this.props.shcc && this.props.getStaffEdit(this.props.shcc, item => this.value(item.item));
    }
    handleHo = (e) => {
        this.ho.value(e.target.value.toUpperCase());
    }

    handleTen = (e) => {
        this.ten.value(e.target.value.toUpperCase());
    }

    value = (item) => {
        this.setState({ dangVien: item.dangVien, doanVien: item.doanVien, congDoan: item.congDoan, emailTruong: item.email, noiSinhNuocNgoai: item.noiSinhNuocNgoai }, () => {
            this.shcc = item.shcc;
            this.imageBox.setData('CanBoImage:' + item.email, item.image ? item.image : '/img/avatar.png');
            this.donVi.value(item.maDonVi);
            this.maTheCanBo.value(item.shcc);
            this.ho.value(item.ho ? item.ho : '');
            this.ten.value(item.ten ? item.ten : '');
            this.hoTen.value(item.ho + ' ' + item.ten);
            this.biDanh.value(item.biDanh ? item.biDanh : '');
            this.phai.value(item.phai);
            this.ngaySinh.value(item.ngaySinh ? item.ngaySinh : '');
            this.state.noiSinhNuocNgoai ? this.noiSinhNuocNgoai.value(item.noiSinhNuocNgoai) : this.noiSinh.value(item.maTinhNoiSinh, item.maHuyenNoiSinh, item.maXaNoiSinh);
            this.nguyenQuan.value(item.maTinhNguyenQuan, item.maHuyenNguyenQuan, item.maXaNguyenQuan);
            this.thuongTru.value(item.thuongTruMaTinh, item.thuongTruMaHuyen, item.thuongTruMaXa, item.thuongTruSoNha);
            this.hienTai.value(item.hienTaiMaTinh, item.hienTaiMaHuyen, item.hienTaiMaXa, item.hienTaiSoNha);
            this.cmnd.value(item.cmnd ? item.cmnd : '');
            this.cmndNgayCap.value(item.cmndNgayCap ? item.cmndNgayCap : '');
            this.cmndNoiCap.value(item.cmndNoiCap ? item.cmndNoiCap : '');
            this.soDienThoaiBaoTin.value(item.dienThoaiBaoTin ? item.dienThoaiBaoTin : '');
            this.soDienThoaiCaNhan.value(item.dienThoaiCaNhan ? item.dienThoaiCaNhan : '');
            this.emailCaNhan.value(item.emailCaNhan ? item.emailCaNhan : '');
            this.emailTruong.value(item.email ? item.email : '');
            this.quocTich.value(item.quocGia);
            this.danToc.value(item.danToc);
            this.tonGiao.value(item.tonGiao);
            this.tinhTrangSucKhoe.value(item.sucKhoe ? item.sucKhoe : '');
            this.chieuCao.value(item.chieuCao ? item.chieuCao : '');
            this.canNang.value(item.canNang ? item.canNang : '');
            this.nhomMau.value(item.nhomMau ? item.nhomMau : '');

            this.soTruong.value(item.soTruong ? item.soTruong : '');
            this.tuNhanXet.value(item.tuNhanXet ? item.tuNhanXet : '');

            this.doanVien.value(item.doanVien);
            this.state.doanVien && this.ngayVaoDoan.value(item.ngayVaoDoan ? item.ngayVaoDoan : '');
            this.state.doanVien && this.noiVaoDoan.value(item.noiVaoDoan ? item.noiVaoDoan : '');

            this.dangVien.value(item.dangVien);
            this.state.dangVien && this.ngayVaoDang.value(item.ngayVaoDang ? item.ngayVaoDang : '');
            this.state.dangVien && this.ngayVaoDangCT.value(item.ngayVaoDangChinhThuc ? item.ngayVaoDangChinhThuc : '');
            this.state.dangVien && this.noiVaoDang.value(item.noiDangDb ? item.noiDangDb : '');
            this.state.dangVien && this.noiVaoDangCT.value(item.noiDangCt ? item.noiDangCt : '');

            this.congDoan.value(item.congDoan);
            this.state.congDoan && this.ngayVaoCongDoan.value(item.ngayVaoCongDoan ? item.ngayVaoCongDoan : '');
            this.state.congDoan && this.noiVaoCongDoan.value(item.noiVaoCongDoan ? item.noiVaoCongDoan : '');

            this.namNhapNgu.value(item.ngayNhapNgu ? item.ngayNhapNgu : '');
            this.namXuatNgu.value(item.namXuatNgu ? item.namXuatNgu : '');
            this.capBacCaoNhat.value(item.quanHamCaoNhat ? item.quanHamCaoNhat : '');
            this.hangThuongBinh.value(item.hangThuongBinh ? item.hangThuongBinh : '');
            this.giaDinhChinhSach.value(item.giaDinhChinhSach ? item.giaDinhChinhSach : '');
            this.danhHieuPhongTangCaoNhat.value(item.danhHieu ? item.danhHieu : '');

        });

    }

    imageChanged = (data) => {
        if (data && data.image) {
            T.notify('Cập nhật ảnh đại diện thành công!', 'success');
            const user = Object.assign({}, this.props.system.user, { image: data.image });
            this.props.readOnly && this.props.updateSystemState({ user });
        }
    };

    copyAddress = e => {
        e.preventDefault();
        const dataThuongTru = this.thuongTru.value();
        this.hienTai.value(dataThuongTru.maTinhThanhPho, dataThuongTru.maQuanHuyen, dataThuongTru.maPhuongXa, dataThuongTru.soNhaDuong);
    }

    getValue = (selector) => {
        const data = selector.value();
        const isRequired = selector.props.required;
        if (data || data === 0) return data;
        if (isRequired) throw selector;
        return '';
    };

    handleNewShcc = () => {
        let curShcc = this.maTheCanBo.value();
        if (curShcc && curShcc != '' && curShcc.length == 8 && curShcc != this.shcc) {
            this.props.getStaffEdit(curShcc, data => {
                if (data.item && !data.error) {
                    T.confirm('Cảnh báo', `Mã số <b>${data.item.shcc}</b> đã tồn tại trong dữ liệu cán bộ: <br/><br/> <b>${(data.item.ho + ' ' + data.item.ten).normalizedName()}</b> <br/> ${data.item.tenDonVi.normalizedName()
                        }. <br/><br/> Vui lòng nhập mã số khác!`, 'warning', true, isConfirm => {
                            isConfirm && this.shcc.value('');
                        });
                }
            });
        }
    }

    handleEmailHCMUSSH = () => {
        let curEmail = this.emailTruong.value();
        if (curEmail && curEmail != '' && T.validateEmail(curEmail) && curEmail != this.state.emailTruong) {
            this.props.getStaffEdit({ email: curEmail }, data => {
                if (data.item && !data.error) {
                    T.confirm('Cảnh báo', `Email <b>${data.item.email}</b> đã tồn tại trong dữ liệu cán bộ: <br/><br/> <b>${(data.item.ho + ' ' + data.item.ten).normalizedName()}</b> <br/> ${data.item.tenDonVi.normalizedName()
                        }. <br/><br/> Vui lòng nhập email khác!`, 'warning', true, isConfirm => {
                            isConfirm && this.emailTruong.value('');
                        });
                }
            });
        }
    }

    getAndValidate = () => {
        try {
            const { maTinhThanhPho: maTinhNguyenQuan, maQuanHuyen: maHuyenNguyenQuan, maPhuongXa: maXaNguyenQuan } = this.nguyenQuan.value();
            const { maTinhThanhPho: maTinhNoiSinh, maQuanHuyen: maHuyenNoiSinh, maPhuongXa: maXaNoiSinh } = this.noiSinh.value();
            const { maTinhThanhPho: thuongTruMaTinh, maQuanHuyen: thuongTruMaHuyen, maPhuongXa: thuongTruMaXa, soNhaDuong: thuongTruSoNha } = this.thuongTru.value();
            const { maTinhThanhPho: hienTaiMaTinh, maQuanHuyen: hienTaiMaHuyen, maPhuongXa: hienTaiMaXa, soNhaDuong: hienTaiSoNha } = this.hienTai.value();
            const emailTruong = this.getValue(this.emailTruong);
            if (emailTruong && !T.validateEmail(emailTruong)) {
                this.emailTruong.focus();
                T.notify('Email không hợp lệ', 'danger');
                return false;
            }
            else {
                const data = {
                    shcc: this.getValue(this.maTheCanBo),
                    ho: this.getValue(this.ho),
                    ten: this.getValue(this.ten),
                    biDanh: this.getValue(this.biDanh),
                    phai: this.getValue(this.phai),
                    maDonVi: this.getValue(this.donVi),
                    ngaySinh: this.getValue(this.ngaySinh) ? this.getValue(this.ngaySinh).getTime() : '',
                    maTinhNguyenQuan, maHuyenNguyenQuan, maXaNguyenQuan,
                    maTinhNoiSinh, maHuyenNoiSinh, maXaNoiSinh,
                    thuongTruMaTinh, thuongTruMaHuyen, thuongTruMaXa, thuongTruSoNha,
                    hienTaiMaTinh, hienTaiMaHuyen, hienTaiMaXa, hienTaiSoNha,
                    cmnd: this.getValue(this.cmnd),
                    cmndNgayCap: this.getValue(this.cmndNgayCap) ? this.getValue(this.cmndNgayCap).getTime() : '',
                    cmndNoiCap: this.getValue(this.cmndNoiCap),
                    dienThoaiCaNhan: this.getValue(this.soDienThoaiCaNhan),
                    dienThoaiBaoTin: this.getValue(this.soDienThoaiBaoTin),
                    email: emailTruong,
                    noiSinhNuocNgoai: this.getValue(this.noiSinhNuocNgoai),
                    emailCaNhan: this.getValue(this.emailCaNhan),
                    quocGia: this.getValue(this.quocTich),
                    danToc: this.getValue(this.danToc),
                    tonGiao: this.getValue(this.tonGiao),
                    sucKhoe: this.getValue(this.tinhTrangSucKhoe),
                    chieuCao: this.getValue(this.chieuCao),
                    canNang: this.getValue(this.canNang),
                    nhomMau: this.getValue(this.nhomMau),
                    soTruong: this.getValue(this.soTruong),
                    tuNhanXet: this.getValue(this.tuNhanXet),
                    doanVien: Number(this.getValue(this.doanVien)),
                    ngayVaoDoan: this.state.doanVien && this.getValue(this.ngayVaoDoan) ? this.getValue(this.ngayVaoDoan).getTime() : '',
                    noiVaoDoan: this.state.doanVien ? this.getValue(this.noiVaoDoan) : '',
                    dangVien: Number(this.dangVien.value()),
                    ngayVaoDangChinhThuc: this.state.dangVien && this.getValue(this.ngayVaoDangCT) ? this.getValue(this.ngayVaoDangCT).getTime() : '',
                    ngayVaoDang: this.state.dangVien && this.getValue(this.ngayVaoDang) ? this.getValue(this.ngayVaoDang).getTime() : '',
                    noiDangCt: this.state.dangVien ? this.getValue(this.noiVaoDangCT) : '',
                    noiDangDb: this.state.dangVien ? this.getValue(this.noiVaoDang) : '',
                    congDoan: Number(this.congDoan.value()),
                    ngayVaoCongDoan: this.state.congDoan && this.getValue(this.ngayVaoCongDoan) ? this.getValue(this.ngayVaoCongDoan).getTime() : '',
                    noiVaoCongDoan: this.state.congDoan ? this.getValue(this.noiVaoCongDoan) : '',
                    ngayNhapNgu: this.getValue(this.namNhapNgu) ? this.getValue(this.namNhapNgu).getTime() : '',
                    ngayXuatNgu: this.getValue(this.namXuatNgu) ? this.getValue(this.namXuatNgu).getTime() : '',
                    quanHamCaoNhat: this.getValue(this.capBacCaoNhat),
                    hangThuongBinh: this.getValue(this.hangThuongBinh),
                    giaDinhChinhSach: this.getValue(this.giaDinhChinhSach),
                    danhHieu: this.getValue(this.danhHieuPhongTangCaoNhat)
                };

                return data;
            }

        } catch (selector) {
            selector.focus();
            T.notify('<b>' + (selector.props.label || 'Dữ liệu') + '</b> bị trống!', 'danger');
            return false;
        }
    }

    render = () => {
        let readOnly = this.props.readOnly, create = this.props.create;
        const permission = this.getUserPermission('staff');
        const readOnlyByTccb = this.props.readOnlyByTccb;
        if (permission.write && permission.read) readOnly = false;
        return (
            <div className='tile'>
                <h3 className='tile-title'>Thông tin cá nhân</h3>
                <div className='tile-body row'>
                    <div style={{ display: 'flex', flex: 'wrap', alignItems: 'center' }}>
                        <FormImageBox ref={e => this.imageBox = e} description='Nhấp hoặc kéo thả để thay đổi ảnh cá nhân'
                            postUrl='/user/upload' uploadType='CanBoImage' onSuccess={this.imageChanged} className='col-md-3 rounded-circle' isProfile={true} readOnly={readOnly} />
                        <div className='col-md-9'>
                            <div className='row'>
                                <FormTextBox ref={e => this.ho = e} label='Họ và tên lót' style={{ textTransform: 'uppercase', display: (readOnly || readOnlyByTccb) ? 'none' : 'block' }} className='col-md-4' onChange={this.handleHo} required maxLength={100} readOnly={readOnly || readOnlyByTccb} />
                                <FormTextBox ref={e => this.ten = e} label='Tên' style={{ textTransform: 'uppercase', display: (readOnly || readOnlyByTccb) ? 'none' : 'block' }} className='col-md-4' onChange={this.handleTen} required maxLength={100} readOnly={readOnly || readOnlyByTccb} />
                                <FormTextBox ref={e => this.hoTen = e} label='Họ và tên' style={{ display: (readOnly || readOnlyByTccb) ? 'block' : 'none' }} className='col-md-8' readOnly={readOnly || readOnlyByTccb} />
                                <FormTextBox ref={e => this.biDanh = e} label='Bí danh' className='col-md-4' maxLength={30} readOnly={readOnly} />

                                <FormSelect ref={e => this.donVi = e} label='Đơn vị công tác' className='form-group col-md-8' required data={SelectAdapter_DmDonVi} readOnly={readOnly || readOnlyByTccb} />
                                <FormTextBox ref={e => this.maTheCanBo = e} label='Mã thẻ' className='form-group col-md-4' readOnly={readOnly || readOnlyByTccb} required maxLength={10} onChange={this.handleNewShcc} />

                                <FormDatePicker ref={e => this.ngaySinh = e} type='date-mask' className='col-md-8' label='Ngày sinh' required readOnly={readOnly} />
                                <FormSelect ref={e => this.phai = e} label='Giới tính' className='col-md-4' required data={SelectAdapter_DmGioiTinhV2} readOnly={readOnly} />

                            </div>
                        </div>
                    </div>
                    <ComponentDiaDiem ref={e => this.noiSinh = e} label={<span>Nơi sinh <a href='#' onClick={e => e.preventDefault() || this.setState({ noiSinhNuocNgoai: true })}>(Nơi sinh ở nước ngoài)</a></span>} className='col-md-12' style={{ display: this.state.noiSinhNuocNgoai ? 'none' : 'block' }} />
                    <FormSelect className='col-md-4' data={SelectAdapter_DmQuocGia} ref={e => this.noiSinhNuocNgoai = e} label={<span>Nơi sinh nước ngoài <a href='#' onClick={e => e.preventDefault() || this.setState({ noiSinhNuocNgoai: false })}>(Nơi sinh ở Việt Nam)</a></span>} style={{ display: !this.state.noiSinhNuocNgoai ? 'none' : 'block' }} placeholder='Nơi sinh nước ngoài' />
                    <ComponentDiaDiem ref={e => this.nguyenQuan = e} label='Nguyên quán' className='col-md-12' />
                    <ComponentDiaDiem ref={e => this.thuongTru = e} label='Địa chỉ thường trú' className='form-group col-12' requiredSoNhaDuong={true} />
                    <ComponentDiaDiem ref={e => this.hienTai = e} label={<span>Nơi ở hiện tại (<a href='#' onClick={e => this.copyAddress(e)}>Nhấn vào đây nếu giống <b>thường trú</b></a>)</span>} className='form-group col-12' requiredSoNhaDuong={true} />

                    <FormTextBox ref={e => this.cmnd = e} label='CMND/CCCD/Số định danh' className='form-group col-md-4' readOnly={readOnly} />
                    <FormDatePicker ref={e => this.cmndNgayCap = e} type='date-mask' label='Ngày cấp' className='form-group col-md-4' readOnly={readOnly} />
                    <FormTextBox ref={e => this.cmndNoiCap = e} label='Nơi cấp' className='form-group col-md-4' readOnly={readOnly} />
                    <div className='form-group col-12' />
                    <FormTextBox ref={e => this.emailCaNhan = e} label='Email cá nhân (khác email trường)' className='form-group col-md-6' readOnly={readOnly} />
                    <FormTextBox ref={e => this.emailTruong = e} label='Email trường' className='form-group col-md-6' onChange={this.handleEmailHCMUSSH} readOnly={readOnly} />
                    <FormTextBox type='phone' ref={e => this.soDienThoaiCaNhan = e} label='SĐT cá nhân' className='col-md-6' readOnly={readOnly} />
                    <FormTextBox type='phone' ref={e => this.soDienThoaiBaoTin = e} label='SĐT báo tin' className='col-md-6' readOnly={readOnly} />

                    <div className='form-group col-md-12'></div>

                    <FormSelect ref={e => this.quocTich = e} label='Quốc tịch' className='form-group col-md-4' data={SelectAdapter_DmQuocGia} readOnly={readOnly} />
                    <FormSelect ref={e => this.danToc = e} label='Dân tộc' className='form-group col-md-4' data={SelectAdapter_DmDanTocV2} readOnly={readOnly} />
                    <FormSelect ref={e => this.tonGiao = e} label='Tôn giáo' className='form-group col-md-4' data={SelectAdapter_DmTonGiaoV2} readOnly={readOnly} />

                    <FormTextBox type='number' step={1} ref={e => this.chieuCao = e} label='Chiều cao (cm)' className='form-group col-md-3' suffix=' cm' readOnly={readOnly} />
                    <FormTextBox type='number' step={0.1} ref={e => this.canNang = e} label='Cân nặng (kg)' className='form-group col-md-3' suffix=' kg' readOnly={readOnly} />
                    <FormSelect ref={e => this.nhomMau = e} label='Nhóm máu' className='form-group col-md-3' data={SelectAdapter_DmNhomMauV2} readOnly={readOnly} />

                    <FormTextBox ref={e => this.tinhTrangSucKhoe = e} label='Tình trạng sức khỏe' className='form-group col-md-3' readOnly={readOnly} />
                    <FormRichTextBox ref={e => this.soTruong = e} label='Sở trường' className='form-group col-md-6' readOnly={readOnly} />
                    <FormRichTextBox ref={e => this.tuNhanXet = e} label='Tự nhận xét' className='form-group col-md-6' readOnly={readOnly} />

                    <FormCheckbox ref={e => this.dangVien = e} label='Đảng viên' onChange={value => this.setState({ dangVien: value })} className='col-md-12' readOnly={readOnly} />
                    {this.state.dangVien ? <FormDatePicker ref={e => this.ngayVaoDang = e} type='date-mask' label='Ngày vào Đảng (dự bị)' className='form-group col-md-4' readOnly={readOnly} /> : null}
                    {this.state.dangVien ? <FormTextBox ref={e => this.noiVaoDang = e} label='Nơi vào Đảng (dự bị)' className='form-group col-md-8' readOnly={readOnly} /> : null}

                    {this.state.dangVien ? <FormDatePicker ref={e => this.ngayVaoDangCT = e} type='date-mask' label='Ngày vào Đảng (chính thức)' className='form-group col-md-4' readOnly={readOnly} /> : null}
                    {this.state.dangVien ? <FormTextBox ref={e => this.noiVaoDangCT = e} label='Nơi vào Đảng (chính thức)' className='form-group col-md-8' readOnly={readOnly} /> : null}

                    <FormCheckbox ref={e => this.doanVien = e} label='Đoàn viên' onChange={value => this.setState({ doanVien: value })} className='col-sm-12' readOnly={readOnly} />
                    {this.state.doanVien ? <FormDatePicker ref={e => this.ngayVaoDoan = e} type='date-mask' label='Ngày vào Đoàn' className='col-sm-4' readOnly={readOnly} /> : null}
                    {this.state.doanVien ? <FormTextBox ref={e => this.noiVaoDoan = e} label='Nơi vào Đoàn' className='col-sm-8' readOnly={readOnly} /> : null}

                    <FormCheckbox ref={e => this.congDoan = e} label='Công đoàn viên' onChange={value => this.setState({ congDoan: value })} className='col-md-12' readOnly={readOnly} />
                    {this.state.congDoan ? <FormDatePicker ref={e => this.ngayVaoCongDoan = e} type='date-mask' label='Ngày vào Công đoàn' className='form-group col-md-4' readOnly={readOnly} /> : null}
                    {this.state.congDoan ? <FormTextBox ref={e => this.noiVaoCongDoan = e} label='Nơi vào Công đoàn' className='form-group col-md-8' readOnly={readOnly} /> : null}

                    {!create && <div className='form-group col-md-12'>
                        <ComponentToChucKhac label='Tổ chức chính trị - xã hội, nghề nghiệp khác' shcc={this.props.shcc} readOnly={readOnly} />
                    </div>}

                    <div className='form-group col-md-12' />

                    <FormTextBox className='form-group col-md-3' type='year' ref={e => this.namNhapNgu = e} label='Năm nhập ngũ' readOnly={readOnly} />
                    <FormTextBox className='form-group col-md-3' type='year' ref={e => this.namXuatNgu = e} label='Năm xuất ngũ' readOnly={readOnly} />
                    <FormTextBox className='form-group col-md-3' ref={e => this.capBacCaoNhat = e} label='Quân hàm/Cấp bậc cao nhất' readOnly={readOnly} />
                    <FormSelect className='form-group col-md-3' data={SelectAdapter_DmHangThuongBinh} ref={e => this.hangThuongBinh = e} label='Hạng thương binh' readOnly={readOnly} />

                    <FormTextBox className='form-group col-md-6' ref={e => this.giaDinhChinhSach = e} label='Gia đình chính sách' readOnly={readOnly} />
                    <FormTextBox className='form-group col-md-6' ref={e => this.danhHieuPhongTangCaoNhat = e} label='Danh hiệu được phong tặng cao nhất' readOnly={readOnly} />
                </div>
            </div >
        );
    }
}

const mapStateToProps = state => ({ staff: state.tccb.staff, system: state.system });
const mapActionsToProps = { updateSystemState, getStaffEdit };
export default connect(mapStateToProps, mapActionsToProps, null, { forwardRef: true })(ComponentCaNhan);
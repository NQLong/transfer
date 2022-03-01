import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { AdminPage, FormTextBox, FormSelect } from 'view/component/AdminPage';
import { getSinhVienEditUser } from './redux';
import { SelectAdapter_DmQuocGia } from 'modules/mdDanhMuc/dmQuocGia/redux';
import { SelectAdapter_DmDanTocV2 } from 'modules/mdDanhMuc/dmDanToc/redux';
import { ComponentDiaDiem } from 'modules/mdDanhMuc/dmDiaDiem/componentDiaDiem';
import { SelectAdapter_DmTonGiaoV2 } from 'modules/mdDanhMuc/dmTonGiao/redux';

class SinhVienPage extends AdminPage {

    componentDidMount() {
        T.ready('/user', () => {
            this.props.getSinhVienEditUser(data => {
                if (data.error) {
                    T.notify('Lấy thông tin sinh viên bị lỗi!', 'danger');
                } else {
                    this.setState({ item: data.item });
                    this.setVal(data.item);
                }
            });
        });
    }

    setVal = (data = {}) => {
        this.mssv.value(data.mssv ? data.mssv : '');
        this.ho.value(data.ho ? data.ho : '');
        this.ten.value(data.ten ? data.ten : '');
        this.danToc.value(data.danToc ? data.danToc : '');
        this.dienThoaiCaNhan.value(data.dienThoaiCaNhan ? data.dienThoaiCaNhan : '');
        this.dienThoaiKhac.value(data.dienThoaiKhac ? data.dienThoaiKhac : '');
        this.dienThoaiLienLac.value(data.dienThoaiLienLac ? data.dienThoaiLienLac : '');
        this.emailTruong.value(data.emailTruong ? data.emailTruong : '');
        this.emailCaNhan.value(data.emailCaNhan ? data.emailCaNhan : '');
        this.gioiTinh.value(data.gioiTinh ? data.gioiTinh : '');
        this.khoa.value(data.khoa ? data.khoa : '');
        this.maKhoa.value(data.maKhoa ? data.maKhoa : '');
        this.maNganh.value(data.maNganh ? data.maNganh : '');
        this.thuongTru.value(data.thuongTruMaHuyen, data.thuongTruMaTinh, data.thuongTruMaXa, data.thuongTruSoNha);
        this.tenCha.value(data.tenCha ? data.tenCha : '');
        this.ngaySinhCha.value(data.ngaySinhCha ? data.ngaySinhCha : '');
        this.ngheNghiepCha.value(data.ngheNghiepCha ? data.ngaySinhCha : '');
        this.tenMe.value(data.tenMe ? data.tenMe : '');
        this.ngaySinhMe.value(data.ngaySinhMe ? data.ngaySinhMe : '');
        this.ngheNghiepMe.value(data.ngheNghiepMe ? data.ngaySinhMe : '');
        this.lienLac.value(data.lienLacMaHuyen, data.lienLacMaTinh, data.lienLacMaXa, data.lienLacSoNha);
        this.loaiHinhDaoTao.value(data.loaiHinhDaoTao ? data.loaiHinhDaoTao : '');
        this.loaiSinhVien.value(data.loaiSinhVien ? data.loaiSinhVien : '');
        this.tinhTrang.value(data.tinhTrang ? data.tinhTrang : '');
        this.tonGiao.value(data.tonGiao ? data.tonGiao : '');
        this.lop.value(data.lop ? data.lop : '');
        this.quocTich.value(data.quocGia ? data.quocGia : '');
    }

    render() {
        let item = this.props.system && this.props.system.user ? this.props.system.user.student : null;
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
                            <FormTextBox ref={e => this.mssv = e} label='Mã số sinh viên' className='form-group col-md-4' readOnly />
                            <FormTextBox ref={e => this.ho = e} label='Họ và tên lót' className='form-group col-md-4' readOnly />
                            <FormTextBox ref={e => this.ten = e} label='Tên' className='form-group col-md-4' readOnly />
                            <FormTextBox ref={e => this.gioiTinh = e} label='Giới tính' className='form-group col-md-4' readOnly />
                            <FormTextBox ref={e => this.khoa = e} label='Khoa' className='form-group col-md-4' readOnly />
                            <FormTextBox ref={e => this.maKhoa= e} label='Mã khoa' className='form-group col-md-4' readOnly />
                            <FormTextBox ref={e => this.maNganh = e} label='Mã ngành' className='form-group col-md-4' readOnly />
                            <FormTextBox ref={e => this.lop = e} label='Lớp' className='form-group col-md-4' readOnly />
                            <FormTextBox ref={e => this.loaiHinhDaoTao = e} label='Loại hình đào tạo' className='form-group col-md-4' readOnly />
                            <FormTextBox ref={e => this.loaiSinhVien = e} label='Loại sinh viên' className='form-group col-md-4' readOnly />
                            <FormTextBox ref={e => this.tinhTrang = e} label='Tình trạng' className='form-group col-md-4' readOnly />
                            <div className="form-group col-md-4"></div>
                            <FormTextBox ref={e => this.ngaySinh = e} label='Ngày sinh' className='form-group col-md-4' required />
                            <FormSelect ref={e => this.quocTich = e} label='Quốc tịch' className='form-group col-md-4' data={SelectAdapter_DmQuocGia} />
                            <FormSelect ref={e => this.danToc = e} label='Dân tộc' className='form-group col-md-4' data={SelectAdapter_DmDanTocV2} />
                            <FormSelect ref={e => this.tonGiao = e} label='Tôn giáo' className='form-group col-md-4' data={SelectAdapter_DmTonGiaoV2} />
                            <ComponentDiaDiem ref={e => this.thuongTru = e} label='Thường trú' className='form-group col-md-12' requiredSoNhaDuong={true} />
                            <ComponentDiaDiem ref={e => this.lienLac = e} label='Nơi ở hiện tại' className='form-group col-md-12' requiredSoNhaDuong={true} />
                            <FormTextBox ref={e => this.dienThoaiCaNhan = e} label='Điện thoại cá nhân' className='form-group col-md-4' />
                            <FormTextBox ref={e => this.dienThoaiLienLac = e} label='Điện thoại liên lạc' className='form-group col-md-4' />
                            <FormTextBox ref={e => this.dienThoaiKhac = e} label='Điện thoại khác' className='form-group col-md-4' />
                            <FormTextBox ref={e => this.emailCaNhan = e} label='Email cá nhân' className='form-group col-md-6' />
                            <FormTextBox ref={e => this.emailTruong = e} label='Email trường' className='form-group col-md-6' />
                            <FormTextBox ref={e => this.tenCha = e} label='Họ tên cha' className='form-group col-md-4' />
                            <FormTextBox ref={e => this.ngaySinhCha = e} label='Ngày sinh cha' className='form-group col-md-4' />
                            <FormTextBox ref={e => this.ngheNghiepCha = e} label='Nghề  nghiệp cha' className='form-group col-md-4' />
                            <FormTextBox ref={e => this.tenMe = e} label='Họ tên mẹ' className='form-group col-md-4' />
                            <FormTextBox ref={e => this.ngaySinhMe = e} label='Ngày sinh mẹ' className='form-group col-md-4' />
                            <FormTextBox ref={e => this.ngheNghiepMe = e} label='Nghề  nghiệp mẹ' className='form-group col-md-4' />
                        </div>
                    </div>
                </div>
            </>,
            backRoute: '/user',
            onSave: this.save,
        });
    }
}

const mapStateToProps = state => ({ system: state.system, sinhVien: state.sinhVien });
const mapActionsToProps = {
    getSinhVienEditUser
};
export default connect(mapStateToProps, mapActionsToProps)(SinhVienPage);
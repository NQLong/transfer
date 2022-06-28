import { SelectAdapter_DmDanTocV2 } from 'modules/mdDanhMuc/dmDanToc/redux';
import { ComponentDiaDiem } from 'modules/mdDanhMuc/dmDiaDiem/componentDiaDiem';
import { SelectAdapter_DmDonVi } from 'modules/mdDanhMuc/dmDonVi/redux';
import { SelectAdapter_DmGioiTinhV2 } from 'modules/mdDanhMuc/dmGioiTinh/redux';
import { SelectAdapter_DmQuocGia } from 'modules/mdDanhMuc/dmQuocGia/redux';
import { SelectAdapter_DmTonGiaoV2 } from 'modules/mdDanhMuc/dmTonGiao/redux';
import React from 'react';
import { AdminModal, FormCheckbox, FormDatePicker, FormRichTextBox, FormSelect, FormTextBox, getValue } from 'view/component/AdminPage';
export class SupportModal extends AdminModal {
    onShow = (data) => {
        //For Staff: data = { item: {} }
        //For TCCB Staff: data = { data: {} }
        let item = data.item || data.data || null;

        let { ho, ten, phai, biDanh, maDonVi, ngaySinh, quocGia, tonGiao, email, maTinhNoiSinh, maHuyenNoiSinh, maXaNoiSinh, maTinhNguyenQuan, maHuyenNguyenQuan, maXaNguyenQuan, ngheNghiepCu, ngayBatDauCongTac, ngayBienChe, donViTuyenDung, soBhxh, ngayBatDauBhxh, ngayKetThucBhxh, thongTinKhac, bacLuong, heSoLuong, tyLePhuCapThamNien, tyLePhuCapUuDai, ngayHuongLuong } = item;
        data.data && this.setState({ item, qtId: data.qtId, type: data.type, oldData: data.oldData });
        console.log(ngayHuongLuong);
        data.item && this.setState({ shcc: item.shcc, dataBanDau: item });
        this.ho.value(ho);
        this.ten.value(ten);
        this.phai.value(phai);
        this.maDonVi.value(maDonVi);
        this.biDanh.value(biDanh || '');
        this.ngaySinh.value(Number(ngaySinh));
        this.quocTich.value(quocGia);
        this.tonGiao.value(tonGiao);
        this.emailTruong.value(email);
        this.noiSinh.value(maTinhNoiSinh, maHuyenNoiSinh, maXaNoiSinh);
        this.nguyenQuan.value(maTinhNguyenQuan, maHuyenNguyenQuan, maXaNguyenQuan);

        this.ngheNghiepCu.value(ngheNghiepCu || '');
        this.ngayBatDauCongTac.value(Number(ngayBatDauCongTac) || '');
        this.ngayBienChe.value(ngayBienChe && ngayBienChe != 1 ? ngayBienChe : '');
        this.donViTuyenDung.value(donViTuyenDung ? donViTuyenDung : JSON.parse(this.props.system.schoolName).vi);

        this.soBhxh.value(soBhxh || '');
        this.ngayBatDauBhxh.value(Number(ngayBatDauBhxh) || '');
        this.ngayKetThucBhxh.value(Number(ngayKetThucBhxh) || '');
        this.thongTinKhac.value(thongTinKhac || '');
        this.bacLuong.value(bacLuong || '');
        this.heSoLuong.value(heSoLuong || '');
        this.ngayHuongLuong.value(Number(ngayHuongLuong) || '');
        this.tyLePhuCapThamNien.value(tyLePhuCapThamNien);
        this.tyLePhuCapUuDai.value(tyLePhuCapUuDai);
    }

    onSubmit = (e) => {
        e.preventDefault();
        try {
            const { maTinhThanhPho: maTinhNguyenQuan, maQuanHuyen: maHuyenNguyenQuan, maPhuongXa: maXaNguyenQuan } = this.nguyenQuan.value();
            const { maTinhThanhPho: maTinhNoiSinh, maQuanHuyen: maHuyenNoiSinh, maPhuongXa: maXaNoiSinh } = this.noiSinh.value();
            let data = {
                ho: getValue(this.ho).toUpperCase(),
                ten: getValue(this.ten).toUpperCase(),
                biDanh: getValue(this.biDanh),
                maDonVi: getValue(this.maDonVi),
                ngaySinh: getValue(this.ngaySinh).getTime(),
                phai: getValue(this.phai),
                quocGia: getValue(this.quocTich),
                danToc: getValue(this.danToc),
                tonGiao: getValue(this.tonGiao),
                email: getValue(this.emailTruong),
                maTinhNguyenQuan, maHuyenNguyenQuan, maXaNguyenQuan,
                maTinhNoiSinh, maHuyenNoiSinh, maXaNoiSinh,
                ngheNghiepCu: getValue(this.ngheNghiepCu),
                ngayBatDauCongTac: getValue(this.ngayBatDauCongTac) ? getValue(this.ngayBatDauCongTac).getTime() : '',
                ngayBienChe: getValue(this.ngayBienChe) ? getValue(this.ngayBienChe).getTime() : '',
                donViTuyenDung: getValue(this.donViTuyenDung),
                soBhxh: getValue(this.soBhxh),
                ngayBatDauBhxh: getValue(this.ngayBatDauBhxh) ? getValue(this.ngayBatDauBhxh).getTime() : '',
                ngayKetThucBhxh: getValue(this.ngayKetThucBhxh) ? getValue(this.ngayKetThucBhxh).getTime() : '',
                bacLuong: getValue(this.bacLuong),
                heSoLuong: getValue(this.heSoLuong),
                ngayHuongLuong: getValue(this.ngayHuongLuong) ? getValue(this.ngayHuongLuong).getTime() : '',
                tyLePhuCapThamNien: getValue(this.tyLePhuCapThamNien),
                tyLePhuCapUuDai: getValue(this.tyLePhuCapUuDai),
                thongTinKhac: getValue(this.thongTinKhac),
            };
            if (Object.keys(data).every(key =>
                (this.state.dataBanDau[key] || '').toString() == (data[key] || '').toString()
            )) throw ('Không có thay đổi nào');
            let dataSupport = {
                qt: 'canBo',
                qtId: this.state.shcc,
                type: 'update'
            };
            this.props.create(this.state.dataBanDau, data, dataSupport, this.hide);
        } catch (error) {
            T.notify(error, 'warning');
        }

    }

    onChangeViewMode = (value) => {
        if (value) {
            this.onShow({ item: this.state.oldData });
            // this.props.getStaffEdit(this.state.qtId, data => {
            //     this.onShow({ item: data.item });
            // });
        } else this.onShow({ data: this.state.item, qtId: this.state.qtId, oldData: this.state.oldData });
    }

    render = () => {
        let readOnly = this.props.readOnly || this.props.isSupport;
        return this.renderModal({
            title: 'Chỉnh sửa thông tin',
            buttons: this.props.isSupport && this.state.type == 'update' && <FormCheckbox ref={e => this.origindata = e} label='Xem dữ liệu ban đầu&nbsp;' onChange={value => this.onChangeViewMode(value)} isSwitch={true} />,
            size: 'elarge',
            submitText: 'Gửi yêu cầu chỉnh sửa',
            body: <div className='row'>
                <FormTextBox ref={e => this.ho = e} label='Họ và tên lót' className='col-md-6' readOnly={readOnly} />
                <FormTextBox ref={e => this.ten = e} label='Tên' className='col-md-3' readOnly={readOnly} />
                <FormTextBox ref={e => this.biDanh = e} label='Bí danh' className='col-md-3' readOnly={readOnly} />
                <FormSelect ref={e => this.maDonVi = e} label='Đơn vị công tác' className='col-md-6' data={SelectAdapter_DmDonVi} readOnly={readOnly} />
                <FormDatePicker type='date-mask' ref={e => this.ngaySinh = e} label='Ngày sinh' className='col-md-3' readOnly={readOnly} />
                <FormSelect ref={e => this.phai = e} label='Giới tính' className='col-md-3' readOnly={readOnly} data={SelectAdapter_DmGioiTinhV2} />
                <FormSelect ref={e => this.quocTich = e} label='Quốc tịch' className='col-md-4' data={SelectAdapter_DmQuocGia} readOnly={readOnly} />
                <FormSelect ref={e => this.danToc = e} label='Dân tộc' className='col-md-4' data={SelectAdapter_DmDanTocV2} readOnly={readOnly} />
                <FormSelect ref={e => this.tonGiao = e} label='Tôn giáo' className='col-md-4' data={SelectAdapter_DmTonGiaoV2} readOnly={readOnly} />

                <FormTextBox ref={e => this.emailTruong = e} label='Email trường' className='col-md-12' readOnly={readOnly} />
                <ComponentDiaDiem ref={e => this.noiSinh = e} label='Nơi sinh' className='col-md-12' readOnly={readOnly} />
                <ComponentDiaDiem ref={e => this.nguyenQuan = e} label='Nguyên quán' className='col-md-12' readOnly={readOnly} />

                <FormTextBox className='col-12' ref={e => this.ngheNghiepCu = e} label='Nghề nghiệp trước khi tuyển dụng' readOnly={readOnly} />
                <FormDatePicker type='date-mask' className='col-6' ref={e => this.ngayBatDauCongTac = e} label='Ngày bắt đầu công tác tại trường' readOnly={readOnly} />
                <FormDatePicker type='date-mask' className='col-6' ref={e => this.ngayBienChe = e} label='Ngày vào biên chế' readOnly={readOnly} />
                <FormTextBox className='col-12' ref={e => this.donViTuyenDung = e} label='Đơn vị ban hành Quyết định tuyển dụng' readOnly={readOnly} />

                <FormTextBox ref={e => this.bacLuong = e} className='col-md-4' label='Bậc lương' readOnly={readOnly} />
                <FormTextBox ref={e => this.heSoLuong = e} className='col-md-4' label='Hệ số lương' readOnly={readOnly} />
                <FormDatePicker type='date-mask' ref={e => this.ngayHuongLuong = e} className='col-md-4' label='Ngày hưởng lương' readOnly={readOnly} />
                <FormTextBox ref={e => this.tyLePhuCapThamNien = e} className='col-md-6' label='Phụ cấp thâm niên' readOnly={readOnly} />
                <FormTextBox ref={e => this.tyLePhuCapUuDai = e} className='col-md-6' label='Phụ cấp ưu đãi' readOnly={readOnly} />
                <FormTextBox ref={e => this.soBhxh = e} className='col-md-6' label='Mã số Bảo hiểm xã hội' readOnly={readOnly} />
                <FormDatePicker ref={e => this.ngayBatDauBhxh = e} className='col-md-3' label='Tháng bắt đầu' type='month-mask' readOnly={readOnly} />
                <FormDatePicker ref={e => this.ngayKetThucBhxh = e} className='col-md-3' label='Tháng kết thúc' type='month-mask' readOnly={readOnly} />

                <FormRichTextBox ref={e => this.thongTinKhac = e} className='col-md-12' label='Yêu cầu hỗ trợ thông tin khác' placeholder='Ghi rõ vấn đề cán bộ gặp phải' readOnly={readOnly} />

            </div>
        });
    }
}


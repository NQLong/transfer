
import React from 'react';
import { AdminModal, FormDatePicker, FormRichTextBox, FormTextBox, getValue } from 'view/component/AdminPage';
import T from 'view/js/common';
export class SupportModal extends AdminModal {
    onShow = (data) => {
        //For Staff: data = { item: {} }
        //For TCCB Staff: data = { data: {} }
        let item = data.item || data.data || null;

        let { ho, ten, ngheNghiepCu, ngayBatDauCongTac, ngayBienChe, donViTuyenDung, soBhxh, ngayBatDauBhxh, ngayKetThucBhxh, thongTinKhac, bacLuong, heSoLuong, tyLePhuCapThamNien, tyLePhuCapUuDai, ngayHuongLuong } = item;

        data.data && this.setState({ item, qtId: data.qtId, type: data.type, oldData: data.oldData }, () => {
            const oldData = data.oldData;
            const contentText = (col, toFixed = null) => !toFixed ? <span>
                <i style={{ textDecoration: 'line-through', color: 'gray' }}>{item[col] || ''} </i>&nbsp;
                {oldData[col] || ''}
            </span> : <span>
                <i style={{ textDecoration: 'line-through', color: 'gray' }}>{item[col] ? Number(item[col]).toFixed(toFixed) : ''} </i>&nbsp;
                {oldData[col] ? Number(oldData[col]).toFixed(toFixed) : ''}
            </span>,
                contentDate = (col, format = 'dd/mm/yyyy') => <span>
                    <i style={{ textDecoration: 'line-through', color: 'gray' }}>{item[col] && item[col] != '' ? T.dateToText(Number(item[col]), 'dd/mm/yyyy') : ''}</i>&nbsp;
                    {oldData[col] && oldData[col] ? T.dateToText(Number(oldData[col]), format) : ''}
                </span>;
            this.ho.value(contentText('ho'));
            this.ten.value(contentText('ten'));
            this.ngheNghiepCu.value(contentText('ngheNghiepCu'));
            this.ngayBatDauCongTac.value(contentDate('ngayBatDauCongTac'));
            this.ngayBienChe.value(ngayBienChe && ngayBienChe != 1 ? contentDate('ngayBienChe') : '');
            this.donViTuyenDung.value(contentText('donViTuyenDung'));

            this.soBhxh.value(contentText('soBhxh'));
            this.ngayBatDauBhxh.value(contentDate('ngayBatDauBhxh', 'mm/yyyy'));
            this.ngayKetThucBhxh.value(contentDate('ngayKetThucBhxh', 'mm/yyyy'));
            this.thongTinKhac.value(thongTinKhac);
            this.bacLuong.value(contentText('bacLuong'));
            this.heSoLuong.value(contentText('heSoLuong', 2));
            this.ngayHuongLuong.value(contentDate('ngayHuongLuong'));
            this.tyLePhuCapThamNien.value(tyLePhuCapThamNien);
            this.tyLePhuCapUuDai.value(tyLePhuCapUuDai);
        });
        data.item && this.setState({ shcc: item.shcc, dataBanDau: item }, () => {
            this.ho.value(ho);
            this.ten.value(ten);
            this.ngheNghiepCu.value(ngheNghiepCu || '');
            this.ngayBatDauCongTac.value(Number(ngayBatDauCongTac) || '');
            this.ngayBienChe.value(ngayBienChe && ngayBienChe != 1 ? Number(ngayBienChe) : '');
            this.donViTuyenDung.value(donViTuyenDung ? donViTuyenDung : 'Trường Đại học Khoa học Xã hội và Nhân văn, ĐHQG TPHCM');

            this.soBhxh.value(soBhxh || '');
            this.ngayBatDauBhxh.value(ngayBatDauBhxh ? Number(ngayBatDauBhxh) : '');
            this.ngayKetThucBhxh.value(ngayKetThucBhxh ? Number(ngayKetThucBhxh) : '');
            this.thongTinKhac.value(thongTinKhac || '');
            this.bacLuong.value(bacLuong || '');
            this.heSoLuong.value(heSoLuong ? Number(heSoLuong).toFixed(2) : '');
            this.ngayHuongLuong.value(ngayHuongLuong ? Number(ngayHuongLuong) : '');
            this.tyLePhuCapThamNien.value(tyLePhuCapThamNien);
            this.tyLePhuCapUuDai.value(tyLePhuCapUuDai);
        });
    }

    onSubmit = (e) => {
        e.preventDefault();
        try {
            let data = {
                ho: getValue(this.ho).toUpperCase(),
                ten: getValue(this.ten).toUpperCase(),
                biDanh: getValue(this.biDanh),
                maDonVi: getValue(this.maDonVi),
                ngaySinh: getValue(this.ngaySinh).getTime(),
                phai: getValue(this.phai),
                email: getValue(this.emailTruong),
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
        } else this.onShow({ data: this.state.item, qtId: this.state.qtId, oldData: this.state.oldData, type: this.state.type });
    }

    render = () => {
        let readOnly = this.props.readOnly || this.props.isSupport;
        let isSupport = this.props.isSupport && this.state.type == 'update';
        return this.renderModal({
            title: 'Chỉnh sửa thông tin',
            // buttons: isSupport && <FormCheckbox ref={e => this.origindata = e} label='Xem dữ liệu ban đầu&nbsp;' onChange={value => this.onChangeViewMode(value)} isSwitch={true} />,
            size: 'large',
            submitText: 'Gửi yêu cầu chỉnh sửa',
            body: <div className='row'>
                <FormTextBox ref={e => this.ho = e} label='Họ và tên lót' className='col-md-12' readOnly={readOnly} />
                <FormTextBox ref={e => this.ten = e} label='Tên' className='col-md-12' readOnly={readOnly} />
                <FormTextBox className='col-12' ref={e => this.ngheNghiepCu = e} label='Nghề nghiệp trước khi tuyển dụng' readOnly={readOnly} />
                {isSupport ? <FormTextBox className='col-12' ref={e => this.ngayBatDauCongTac = e} label='Ngày bắt đầu công tác tại trường' readOnly={readOnly} /> : <FormDatePicker type='date-mask' className='col-12' ref={e => this.ngayBatDauCongTac = e} label='Ngày bắt đầu công tác tại trường' readOnly={readOnly} />}
                {isSupport ? <FormTextBox className='col-12' ref={e => this.ngayBienChe = e} label='Ngày vào biên chế' readOnly={readOnly} /> : <FormDatePicker type='date-mask' className='col-12' ref={e => this.ngayBienChe = e} label='Ngày vào biên chế' readOnly={readOnly} />}
                <FormTextBox className='col-12' ref={e => this.donViTuyenDung = e} label='Đơn vị ban hành Quyết định tuyển dụng' readOnly={readOnly} />

                <FormTextBox ref={e => this.bacLuong = e} className='col-md-12' label='Bậc lương' readOnly={readOnly} />
                <FormTextBox ref={e => this.heSoLuong = e} className='col-md-12' label='Hệ số lương' readOnly={readOnly} />

                {isSupport ? <FormTextBox className='col-12' ref={e => this.ngayHuongLuong = e} label='Ngày hưởng lương' readOnly={readOnly} /> : <FormDatePicker type='date-mask' ref={e => this.ngayHuongLuong = e} className='col-md-12' label='Ngày hưởng lương' readOnly={readOnly} />}

                <FormTextBox ref={e => this.tyLePhuCapThamNien = e} className='col-md-12' label='Phụ cấp thâm niên (%)' readOnly={readOnly} />
                <FormTextBox ref={e => this.tyLePhuCapUuDai = e} className='col-md-12' label='Phụ cấp ưu đãi (%)' readOnly={readOnly} />
                <FormTextBox ref={e => this.soBhxh = e} className='col-md-12' label='Mã số Bảo hiểm xã hội' readOnly={readOnly} />

                {isSupport ? <FormTextBox className='col-12' ref={e => this.ngayBatDauBhxh = e} label='Tháng bắt đầu' readOnly={readOnly} /> : <FormDatePicker ref={e => this.ngayBatDauBhxh = e} className='col-md-12' label='Tháng bắt đầu' type='month-mask' readOnly={readOnly} />}
                {isSupport ? <FormTextBox className='col-12' ref={e => this.ngayKetThucBhxh = e} label='Tháng kết thúc' readOnly={readOnly} /> : <FormDatePicker ref={e => this.ngayKetThucBhxh = e} className='col-md-12' label='Tháng kết thúc' type='month-mask' readOnly={readOnly} />}

                <FormRichTextBox ref={e => this.thongTinKhac = e} className='col-md-12' label='Yêu cầu hỗ trợ thông tin khác' placeholder='Ghi rõ vấn đề cán bộ gặp phải' readOnly={readOnly} />

            </div>
        });
    }
}


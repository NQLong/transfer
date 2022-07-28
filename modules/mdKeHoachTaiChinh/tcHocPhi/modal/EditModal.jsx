import React from 'react';
import { AdminModal, FormTextBox } from 'view/component/AdminPage';

export class EditModal extends AdminModal {
    state = { mssv: '', namHoc: '', hocKy: '', hocPhi: '' };

    componentDidMount() {
    }

    onShow = (item) => {
        const { mssv, hocPhi, namHoc, hocKy, hoTenSinhVien } = item ? item : {
            mssv: '', hocPhi: '', namHoc: '', hocKy: '', hoTenSinhVien: ''
        };

        this.setState({ mssv: mssv, namHoc: namHoc, hocKy: hocKy, hocPhi: hocPhi }, () => {
            this.mssv.value(mssv || '');
            this.hocPhi.value(hocPhi || 0);
            this.namHoc.value(namHoc || 0);
            this.hocKy.value(hocKy || 0);
            this.hoTenSinhVien.value(hoTenSinhVien || 0);
        });
    };

    onSubmit = (e) => {
        e.preventDefault();
        const { mssv, namHoc, hocKy, hocPhi } = this.state;
        if (!this.hocPhi.value()) {
            T.notify('Học phí trống', 'danger');
            this.hocPhi.focus();
        } else {
            const changes = {
                hocPhi: this.hocPhi.value(),
            };
            if (changes.hocPhi == hocPhi) return;
            this.props.update({ mssv, namHoc, hocKy }, changes, this.hide);
        }
    }

    render = () => {
        const readOnly = this.props.readOnly;
        return this.renderModal({
            title: 'Cập nhật dữ liệu học phí',
            size: 'large',
            body: <div className='row'>
                <FormTextBox className='col-md-12' ref={e => this.namHoc = e} type='year' label='Năm học' readOnly={true} />
                <FormTextBox className='col-md-12' ref={e => this.hocKy = e} type='number' label='Học kỳ' readOnly={true} />
                <FormTextBox className='col-md-6' ref={e => this.mssv = e} type='text' label='MSSV' readOnly={true} />
                <FormTextBox className='col-md-6' ref={e => this.hoTenSinhVien = e} type='text' label='Họ và tên' readOnly={true} />
                <FormTextBox className='col-md-12' ref={e => this.hocPhi = e} type='number' label='Học phí (VNĐ)' readOnly={readOnly} />
            </div>
        });
    }
}
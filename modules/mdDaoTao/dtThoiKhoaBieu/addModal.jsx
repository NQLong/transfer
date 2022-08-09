import { SelectAdapter_DmDonViFaculty_V2 } from 'modules/mdDanhMuc/dmDonVi/redux';
import { SelectAdapter_DmSvBacDaoTao } from 'modules/mdDanhMuc/dmSvBacDaoTao/redux';
import { SelectAdapter_DmSvLoaiHinhDaoTaoFilter } from 'modules/mdDanhMuc/dmSvLoaiHinhDaoTao/redux';
import React from 'react';
import { connect } from 'react-redux';
import { AdminModal, FormCheckbox, FormSelect, FormTextBox } from 'view/component/AdminPage';
import { SelectAdapter_DmMonHocAll } from '../dmMonHoc/redux';
import { SelectAdapter_DtCauTrucKhungDaoTao } from '../dtCauTrucKhungDaoTao/redux';
import { SelectAdapter_DtNganhDaoTaoFilter } from '../dtNganhDaoTao/redux';

class AddingModal extends AdminModal {
    state = { khoaDangKy: '33' }
    onShow = () => {
        this.bacDaoTao.value('DH');
        this.khoaDangKy.value('33');
        this.soLop.value(1);
        this.soTiet.value(1);
        this.soBuoi.value(1);
        this.soLuongDuKien.value(50);
    }

    onSubmit = (e) => {
        e.preventDefault();
        const data = {
            maMonHoc: this.maMonHoc.value(),
            soTietBuoi: this.soTiet.value(),
            soLop: this.soLop.value(),
            soBuoiTuan: this.soBuoi.value(),
            khoaDangKy: this.khoaDangKy.value(),
            maNganh: this.maNganh.value(),
            soLuongDuKien: this.soLuongDuKien.value(),
            loaiMonHoc: Number(this.loaiMonHoc.value())
        }, settings = {
            bacDaoTao: this.bacDaoTao.value(),
            loaiHinhDaoTao: this.loaiHinhDaoTao.value()
        };

        if (!data.maMonHoc) {
            T.notify('Môn học bị trống', 'danger');
            this.maMonHoc.focus();
        } else if (!data.soTietBuoi || data.soTietBuoi <= 0 || data.soTietBuoi >= 6) {
            T.notify('Số tiết không hợp lệ', 'danger');
            this.soTiet.focus();
        } else if (!data.soLop || data.soLop <= 0) {
            T.notify('Số lớp không hợp lệ', 'danger');
            this.soLop.focus();
        } else if (!data.soBuoiTuan || data.soBuoiTuan <= 0) {
            T.notify('Số buổi không hợp lệ', 'danger');
            this.soBuoi.focus();
        } else if (!data.khoaDangKy) {
            T.notify('Khoa đăng ký bị trống', 'danger');
            this.khoaDangKy.focus();
        } else if (!data.soLuongDuKien || data.soLuongDuKien <= 0) {
            T.notify('Số lượng dự kiến không hợp lệ', 'danger');
            this.soLuongDuKien.focus();
        } else {
            this.props.create([data], settings, () => {
                this.maMonHoc.focus();
            });
        }
    }

    handleDonVi = (value) => {
        this.setState({ khoaDangKy: value.id });
    }

    render = () => {
        return this.renderModal({
            title: 'Mở môn học',
            size: 'large',
            submitText: 'Mở môn học',
            body: <div className='row'>
                <FormSelect ref={e => this.bacDaoTao = e} data={SelectAdapter_DmSvBacDaoTao} className='col-md-6' label='Bậc đào tạo' readOnly />
                <FormSelect ref={e => this.loaiHinhDaoTao = e} data={SelectAdapter_DmSvLoaiHinhDaoTaoFilter} className='col-md-6' label='Hệ đào tạo' />
                <FormSelect data={SelectAdapter_DtCauTrucKhungDaoTao} ref={e => this.nam = e} className='col-md-6' label='Năm' />
                <FormSelect ref={e => this.hocKy = e} data={[1, 2, 3]} label='Học kỳ' className='col-md-6' />
                <FormSelect ref={e => this.khoaDangKy = e} data={SelectAdapter_DmDonViFaculty_V2} className='col-md-6' label='Khoa mở' onChange={this.handleDonVi} />
                <FormSelect ref={e => this.maNganh = e} data={SelectAdapter_DtNganhDaoTaoFilter(this.state.khoaDangKy || null)} className='col-md-6' label='Chuyên ngành' />
                <FormSelect ref={e => this.maMonHoc = e} data={SelectAdapter_DmMonHocAll()} className='col-md-10' placeholder='Môn học' label='Môn học' />
                <FormCheckbox ref={e => this.loaiMonHoc = e} label='Tự chọn' style={{ marginBottom: '0' }} className='col-md-2' />
                <FormTextBox type='number' ref={e => this.soLop = e} className='col-md-3' label='Số lớp' min={1} />
                <FormTextBox type='number' ref={e => this.soTiet = e} className='col-md-3' label='Số tiết /buổi' min={1} max={5} />
                <FormTextBox type='number' ref={e => this.soBuoi = e} className='col-md-3' label='Số buổi /tuần' min={1} max={3} />
                <FormTextBox type='number' ref={e => this.soLuongDuKien = e} className='col-md-3' label='Số lượng SV dự kiến /lớp' />
            </div>
        });
    }
}

const mapStateToProps = state => ({ system: state.system });
const mapActionsToProps = {
};
export default connect(mapStateToProps, mapActionsToProps, null, { forwardRef: true })(AddingModal);
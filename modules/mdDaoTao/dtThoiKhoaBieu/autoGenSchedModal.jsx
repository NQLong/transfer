import { SelectAdapter_DmPhong } from 'modules/mdDanhMuc/dmPhong/redux';
import { SelectAdapter_DmSvBacDaoTao } from 'modules/mdDanhMuc/dmSvBacDaoTao/redux';
import { SelectAdapter_DmSvLoaiHinhDaoTaoFilter } from 'modules/mdDanhMuc/dmSvLoaiHinhDaoTao/redux';
import React from 'react';
import { connect } from 'react-redux';
import { AdminModal, FormDatePicker, FormSelect, getValue } from 'view/component/AdminPage';
import { initSchedule } from './redux';
class AutoGenModal extends AdminModal {
    onShow = () => {
        this.bacDaoTao.value('DH');
    }

    onSubmit = () => {
        try {
            let now = Date.now();
            let data = {
                bacDaoTao: getValue(this.bacDaoTao),
                loaiHinhDaoTao: getValue(this.loaiHinhDaoTao),
                ngayBatDau: getValue(this.ngayBatDau).getTime(),
                listPhongKhongSuDung: getValue(this.listPhongKhongSuDung),
            };
            if (data.ngayBatDau < now) T.notify('Ngày bắt đầu không hợp lệ', 'danger');
            else this.setState({ isLoading: true }, () => {
                this.props.initSchedule(data, (result) => {
                    result && this.setState({ isLoading: false });
                    if (result.error) T.notify(result.error, 'danger');
                    else T.notify(result.success, 'success');
                    this.hide();
                });
            });

        }
        catch (form) {
            T.notify(`${form.props.label} bị trống`, 'danger');
            form.focus();
        }

    }
    render = () => {
        return this.renderModal({
            title: 'Cấu hình sinh thời khoá biểu',
            isLoading: this.state.isLoading,
            body: <div className='row'>
                <FormSelect ref={e => this.bacDaoTao = e} className='col-md-6' label='Bậc' data={SelectAdapter_DmSvBacDaoTao} required />
                <FormSelect ref={e => this.loaiHinhDaoTao = e} className='col-md-6' label='Hệ' data={SelectAdapter_DmSvLoaiHinhDaoTaoFilter} required />
                <FormDatePicker type='date-mask' ref={e => this.ngayBatDau = e} label='Nhập ngày bắt đầu' className='col-md-12' required />
                <FormSelect ref={e => this.listPhongKhongSuDung = e} data={SelectAdapter_DmPhong} label='Chọn các phòng không sử dụng' className='col-md-12' multiple={true} />
            </div>
        });
    }
}

const mapStateToProps = state => ({ system: state.system });
const mapActionsToProps = {
    initSchedule
};
export default connect(mapStateToProps, mapActionsToProps, null, { forwardRef: true })(AutoGenModal);
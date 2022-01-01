import { SelectAdapter_DmGioiTinhV2 } from 'modules/mdDanhMuc/dmGioiTinh/redux';
import React from 'react';
import { connect } from 'react-redux';
import { AdminPage, FormDatePicker, FormImageBox, FormSelect, FormTextBox } from 'view/component/AdminPage';
import { updateSystemState } from 'modules/_default/_init/reduxSystem';
import { updateProfile } from '../_init/reduxSystem';

class ProfileCommon extends AdminPage {

    value(item) {
        this.imageBox.setData('user:' + item.email, item.image ? item.image : '/img/avatar.png');
        this.hoTen.value(item.lastName + ' ' + item.firstName);
        this.email.value(item.email ? item.email : '');
        this.phai.value(item.phai);
        this.dienThoai.value(item.dienThoai ? item.dienThoai : '');
        this.ngaySinh.value(item.ngaySinh ? item.ngaySinh : '');
    }

    saveCommon = (e) => {
        e.preventDefault();
        const changes = {
            phai: this.phai.value(),
            ngaySinh: this.ngaySinh.value().getTime(),
            dienThoai: this.dienThoai.value()
        };
        this.props.updateProfile(changes);
    }

    imageChanged = (data) => {
        if (data && data.image) {
            const user = Object.assign({}, this.props.system.user, { image: data.image });
            this.props.updateSystemState({ user });
        }
    };

    render() {
        return (
            <div className='tile' >
                <h3 className='tile-title'>THÔNG TIN CÁ NHÂN</h3>
                <div className='tile-body' >
                    <div className='row'><div className='col-12 col-lg-8 order-2 order-lg-1' style={{ paddingTop: 10 }}>
                        <FormTextBox ref={e => this.hoTen = e} label='Họ và tên' className='form-group' readOnly />
                        <FormTextBox ref={e => this.email = e} label='Email' className='form-group' readOnly />
                        <FormSelect ref={e => this.phai = e} label='Giới tính' data={SelectAdapter_DmGioiTinhV2} className='form-group' />
                        <FormTextBox ref={e => this.dienThoai = e} label='Điện thoại' className='form-group' />
                        <FormDatePicker type='date-mask' ref={e => this.ngaySinh = e} label='Ngày sinh' className='form-group' />
                    </div>
                        <div className='col-12 col-lg-4 order-1 order-lg-2'>
                            <FormImageBox ref={e => this.imageBox = e} label='Hình đại diện'
                                postUrl='/user/upload' uploadType='UserImage' userData='user' success={this.imageChanged} />
                        </div>

                    </div>
                </div>
                <div className='tile-footer' style={{ textAlign: 'right' }}>
                    <button className='btn btn-success' type='button' onClick={this.saveCommon}>
                        <i className='fa fa-lg fa-save' /> Lưu
                    </button>
                </div>
            </div>
        );
    }
}
const mapStateToProps = state => ({ system: state.system });
const mapActionsToProps = {
    updateProfile, updateSystemState
};
export default connect(mapStateToProps, mapActionsToProps, null, { forwardRef: true })(ProfileCommon);

import { SelectAdapter_DmDienHopDongV2 } from 'modules/mdDanhMuc/dmDienHopDong/redux';
import { SelectAdapter_DmDonVi } from 'modules/mdDanhMuc/dmDonVi/redux';
import {  SelectAdapter_DmLoaiHopDongV2 } from 'modules/mdDanhMuc/dmLoaiHopDong/redux';
import {  SelectAdapter_DmNgachCdnnV2 } from 'modules/mdDanhMuc/dmNgachCdnn/redux';
import React from 'react';
import { connect } from 'react-redux';
import { AdminPage, FormDatePicker, FormSelect, FormTextBox } from 'view/component/AdminPage';

class ComponentTTCongTac extends AdminPage {
    value(item) {
        console.log(item);
        this.ngheNghiepCu.value(item.ngheNghiepCu ? item.ngheNghiepCu : '');
        this.ngayBatDauCongTac.value(item.ngayBatDauCongTac ? item.ngayBatDauCongTac : '');
        this.ngayBienChe.value(item.ngayBienChe ? item.ngayBienChe : '');
        this.donViTuyenDung.value(item.donViTuyenDung ? item.donViTuyenDung : '');
        this.chucDanh.value(item.chucDanh ? item.chucDanh : '');
    }

    render() {

        return (
            <div className='tile'>
                <h3 className='tile-title'>Thông tin công tác</h3>
                <div className='tile-body row'>
                    <FormTextBox className='col-md-6' ref={e => this.ngheNghiepCu = e} label='Nghề nghiệp trước khi tuyển dụng'/>
                    <FormDatePicker type='date_mask' className='col-md-6' ref={e => this.ngayBatDauCongTac = e} label='Ngày bắt đầu công tác tại trường'/>
                    <FormDatePicker type='date_mask' className='col-md-6' ref={e => this.ngayBienChe = e} label='Ngày vào biên chế'/>
                    <FormSelect data={SelectAdapter_DmDonVi} className='col-md-6' ref={e => this.donViTuyenDung = e} label='Đơn vị ban hành Quyết định tuyển dụng' />
                    <FormSelect data={SelectAdapter_DmNgachCdnnV2} className='col-md-4' ref={e => this.chucDanh = e} label='Chức danh nghề nghiệp' />
                    <FormSelect data={SelectAdapter_DmDienHopDongV2} className='col-md-4' ref={e => this.dienHopDong = e} label='Diện hợp đồng' />
                    <FormSelect data={SelectAdapter_DmLoaiHopDongV2} className='col-md-4' ref={e => this.loaiHopDong = e} label='Loại hợp đồng' />
                </div>
            </div>
        );
    }
}

const mapStateToProps = state => ({ staff: state.staff, system: state.system });
const mapActionsToProps = {

};
export default connect(mapStateToProps, mapActionsToProps, null, { forwardRef: true })(ComponentTTCongTac);

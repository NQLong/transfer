import { SelectAdapter_DmTrinhDoLyLuanChinhTriV2 } from 'modules/mdDanhMuc/dmTrinhDoLyLuanChinhTri/redux';
import { SelectAdapter_DmTrinhDoQuanLyNhaNuocV2 } from 'modules/mdDanhMuc/dmTrinhDoQuanLyNhaNuoc/redux';
import { SelectAdapter_DmTrinhDoTinHocV2 } from 'modules/mdDanhMuc/dmTrinhDoTinHoc/redux';
import React from 'react';
import { connect } from 'react-redux';
import { AdminPage, FormRichTextBox, FormSelect, FormTextBox } from 'view/component/AdminPage';
import ComponentNN from '../trinhDoNgoaiNgu/componentNgoaiNgu';
import { getStaffEdit } from './redux';

class ComponentTrinhDo extends AdminPage {
    shcc = '';
    value = (item) => {
        console.log(item);
        this.shcc = item.shcc;
        this.trinhDoPhoThong.value(item.trinhDoPhoThong ? item.trinhDoPhoThong : '');
        this.ngoaiNgu.value(item.shcc);
    }

    getValue = (selector) => {
        console.log(selector.props.label);
        const data = selector.value();
        const isRequired = selector.props.required;
        if (data || data === 0) return data;
        if (isRequired) throw selector;
        return '';
    };

    getAndValidate = () => {
        try {
            const data = {
                trinhDoPhoThong: this.getValue(this.trinhDoPhoThong),
                maTrinhDoTinHoc: this.getValue(this.trinhDoTinHoc),
                chungChiTinHoc: this.getValue(this.chungChiTinHoc),
                maTrinhDoLlct: this.getValue(this.lyLuanChinhTri),
                chungChiLlct: this.getValue(this.chungChiLyLuanChinhTri),
                namCapLlct: this.getValue(this.namCapCcLyLuan) ? this.getValue(this.namCapCcLyLuan).getTime() : '',
                noiCapLlct: this.getValue(this.noiCapCcLyLuan),
                maTrinhDoQlnn: this.getValue(this.quanLyNnaNuoc),
                chungChiQlnn: this.getValue(this.chungChiQuanLyNhaNuoc),
                namCapQlnn: this.getValue(this.namCapQlnn) ? this.getValue(this.namCapQlnn) : '',
                noiCapQlnn: this.getValue(this.noiCapQlnn),
                hocTapHienTai: this.getValue(this.hocTapHienTai),
                coSoHocTapHienTai: this.getValue(this.coSoHocTapHienTai),
                thoiGianHocTapHienTai: this.getValue(this.thoiGianHocTapHienTai) ? this.getValue(this.thoiGianHocTapHienTai) : ''
            };
            return data;
        }
        catch (selector) {
            selector.focus();
            T.notify('<b>' + (selector.props.label || 'Dữ liệu') + '</b> bị trống!', 'danger');
            return false;
        }
    }
    render() {
        return (
            <div className='tile'>
                <h3 className='tile-title'>Thông tin về trình độ</h3>
                <div className='tile-body row'>
                    <FormTextBox ref={e => this.trinhDoPhoThong = e} label='Trình độ giáo dục phổ thông' className='col-md-6' />
                    <ComponentNN ref={e => this.ngoaiNgu = e} label='Trình độ ngoại ngữ' />
                    <FormSelect ref={e => this.trinhDoTinHoc = e} label='Trình độ tin học' data={SelectAdapter_DmTrinhDoTinHocV2} className='col-md-6' />
                    <FormTextBox ref={e => this.chungChiTinHoc = e} label='Văn bằng/Chứng chỉ' className='col-md-6' />

                    <FormSelect ref={e => this.lyLuanChinhTri = e} label='Trình độ lý luận chính trị' data={SelectAdapter_DmTrinhDoLyLuanChinhTriV2} className='col-md-3'/>
                    <FormTextBox ref={e => this.chungChiLyLuanChinhTri = e} label='Văn bằng/Chứng chỉ' className='col-md-3' />
                    <FormTextBox type='year' ref={e => this.namCapCcLyLuan = e} label='Năm cấp (yyyy)' className='col-md-3'/>
                    <FormTextBox ref={e => this.noiCapCcLyLuan = e} label='Nơi cấp' className='col-md-3' />

                    <FormSelect ref={e => this.quanLyNnaNuoc = e} label='Trình độ quản lý nhà nước' data={SelectAdapter_DmTrinhDoQuanLyNhaNuocV2} className='col-md-3'/>
                    <FormTextBox ref={e => this.chungChiQuanLyNhaNuoc = e} label='Văn bằng/Chứng chỉ' className='col-md-3' />
                    <FormTextBox type='year' ref={e => this.namCapQlnn = e} label='Năm cấp (yyyy)' className='col-md-3'/>
                    <FormTextBox ref={e => this.noiCapQlnn = e} label='Nơi cấp' className='col-md-3' />

                    <FormRichTextBox ref={e => this.hocTapHienTai = e} label='Tình hình học tập, bồi dưỡng hiện tại' className='col-md-6'/>
                    <FormTextBox ref={e => this.coSoHocTapHienTai = e} label='Tên cơ sở dào tạo' className='col-md-3'/>
                    <FormTextBox ref={e => this.thoiGianHocTapHienTai = e} label='Thời gian dào tạo' className='col-md-3'/>
                </div>
            </div>
        );
    }
}

const mapStateToProps = state => ({ staff: state.staff, system: state.system });
const mapActionsToProps = {
    getStaffEdit
};
export default connect(mapStateToProps, mapActionsToProps, null, { forwardRef: true })(ComponentTrinhDo);
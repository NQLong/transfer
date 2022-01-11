import { SelectAdapter_DmTrinhDoLyLuanChinhTriV2 } from 'modules/mdDanhMuc/dmTrinhDoLyLuanChinhTri/redux';
import { SelectAdapter_DmTrinhDoQuanLyNhaNuocV2 } from 'modules/mdDanhMuc/dmTrinhDoQuanLyNhaNuoc/redux';
import { SelectAdapter_DmTrinhDoTinHocV2 } from 'modules/mdDanhMuc/dmTrinhDoTinHoc/redux';
import React from 'react';
import { connect } from 'react-redux';
import { AdminPage, FormCheckbox, FormSelect, FormTextBox } from 'view/component/AdminPage';
import ComponentNN from '../trinhDoNgoaiNgu/componentNgoaiNgu';
import { getStaffEdit, userGetStaff } from './redux';
import HocViDetail from '../qtDaoTao/hocViDetail';

class ComponentTrinhDo extends AdminPage {
    shcc = ''; email = '';
    state = { thacSi: false, batDauThacSiType: 'mm/yyyy', ketThucThacSiType: 'mm/yyyy', shcc: '', email: '' };

    value = (item) => {
        console.log(item);
        // this.shcc = item.shcc;
        // this.email = item.email;
        this.setState({tienSi: item.tienSi, thacSi: item.thacSi, cuNhan: item.cuNhan, shcc: item.shcc, email: item.email});
        this.thacSi.value(item.thacSi ? item.thacSi : 0);
        this.tienSi.value(item.tienSi ? item.tienSi : 0);
        this.cuNhan.value(item.cuNhan ? item.cuNhan : 0);
        this.state.tienSi && this.hocViTienSi.value(this.state.shcc, this.state.email, item.daoTao.filter(i => i.loaiBangCap === 'Tiến sĩ'));
        this.state.cuNhan && this.hocViCuNhan.value(this.state.shcc, this.state.email, item.daoTao.filter(i => i.loaiBangCap === 'Cử nhân'));
        this.state.thacSi && this.hocViThacSi.value(this.state.shcc, this.state.email, item.daoTao.filter(i => i.loaiBangCap === 'Thạc sĩ'));
    
        this.trinhDoPhoThong.value(item.trinhDoPhoThong ? item.trinhDoPhoThong : '');
        this.ngoaiNgu.value(item.shcc, item.email);

        this.trinhDoTinHoc.value(item.maTrinhDoTinHoc);
        this.chungChiTinHoc.value(item.chungChiTinHoc ? item.chungChiTinHoc : '');

        this.chungChiLyLuanChinhTri.value(item.chungChiLlct ? item.chungChiLlct : '');
        this.lyLuanChinhTri.value(item.maTrinhDoLlct);
        this.namCapCcLyLuan.value(item.namCapLlct ? item.namCapLlct : '');
        this.noiCapCcLyLuan.value(item.noiCapLlct ? item.noiCapLlct : '');

        this.quanLyNnaNuoc.value(item.maTrinhDoQlnn ? item.maTrinhDoQlnn : '');
        this.namCapQlnn.value(item.namCapQlnn ? item.namCapQlnn : '');
        this.chungChiQuanLyNhaNuoc.value(item.chungChiQlnn ? item.chungChiQlnn : '');
        this.noiCapQlnn.value(item.noiCapQlnn ? item.noiCapQlnn : '');

        this.hocTapHienTai.value(item.hocTapHienTai ? item.hocTapHienTai : '');
        this.coSoHocTapHienTai.value(item.coSoHocTapHienTai ? item.coSoHocTapHienTai : '');
        this.thoiGianHocTapHienTai.value(item.thoiGianHocTapHienTai ? item.thoiGianHocTapHienTai : '');

    }

    getValue = (selector) => {
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
                cuNhan: this.getValue(this.cuNhan) ? 1 : 0,
                tienSi: this.getValue(this.tienSi) ? 1 : 0,
                thacSi: this.getValue(this.thacSi) ? 1 : 0,
                maTrinhDoTinHoc: this.getValue(this.trinhDoTinHoc),
                chungChiTinHoc: this.getValue(this.chungChiTinHoc),
                maTrinhDoLlct: this.getValue(this.lyLuanChinhTri),
                chungChiLlct: this.getValue(this.chungChiLyLuanChinhTri),
                namCapLlct: this.getValue(this.namCapCcLyLuan) ? this.getValue(this.namCapCcLyLuan) : '',
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
                    <FormTextBox ref={e => this.trinhDoPhoThong = e} label='Trình độ giáo dục phổ thông' placeholder='Nhập trình độ phổ thông (Ví dụ: 12/12)' className='form-group col-md-4' />
                    <ComponentNN ref={e => this.ngoaiNgu = e} label='Trình độ ngoại ngữ' userEdit={this.props.userEdit} />

                    <FormCheckbox ref={e => this.cuNhan = e} label='Cử nhân' onChange={value => this.setState({ cuNhan: value })} className='form-group col-md-2'/>
                    {this.state.cuNhan ? <HocViDetail ref={e => this.hocViCuNhan = e} tenHocVi='Cử nhân' shcc={this.state.shcc} email={this.state.email} tccb={this.props.tccb}/> : <div className='form-group col-md-10'/>}
                    <FormCheckbox ref={e => this.thacSi = e} label='Thạc sĩ' onChange={value => this.setState({ thacSi: value })} className='form-group col-md-2' />
                    {this.state.thacSi ? <HocViDetail ref={e => this.hocViThacSi = e} tenHocVi='Thạc sĩ' shcc={this.state.shcc} email={this.state.email} tccb={this.props.tccb}/> : <div className='form-group col-md-10'/>}
                    <FormCheckbox ref={e => this.tienSi = e} label='Tiến sĩ' onChange={value => this.setState({ tienSi: value })} className='form-group col-md  -2' />
                    {this.state.tienSi ? <HocViDetail ref={e => this.hocViTienSi = e} tenHocVi='Tiến sĩ' shcc={this.state.shcc} email={this.state.email} tccb={this.props.tccb}/> : <div className='form-group col-md-10'/>}

                    <FormSelect ref={e => this.chucDanh = e} label='Chức danh' data={[{ id: '01', text: 'Phó giáo sư' }, { id: '02', text: 'Giáo sư' }]} className='form-group col-md-3' />
                    <FormTextBox ref={e => this.chuyenNganh = e} label='Chuyên ngành chức danh' className='form-group col-md-3' />
                    <FormTextBox type='year' ref={e => this.namChucDanh = e} label='Năm công nhận chức danh' className='form-group col-md-3' />
                    <FormTextBox ref={e => this.coSoChucDanh = e} label='Cơ sở giáo dục công nhận' className='form-group col-md-3' />
                    <div className='form-group col-md-12'/>

                    <FormSelect ref={e => this.trinhDoTinHoc = e} label='Trình độ tin học' data={SelectAdapter_DmTrinhDoTinHocV2} className='form-group col-md-3' />
                    <FormTextBox ref={e => this.chungChiTinHoc = e} label='Chứng chỉ tin học' className='form-group col-md-3' /> <div className='form-group col-md-6'/>
                    <div className='form-group col-md-12'/>

                    <FormSelect ref={e => this.lyLuanChinhTri = e} label='Trình độ lý luận chính trị' data={SelectAdapter_DmTrinhDoLyLuanChinhTriV2} className='form-group col-md-3' />
                    <FormTextBox ref={e => this.chungChiLyLuanChinhTri = e} label='Chứng chỉ LLCT' className='form-group col-md-3' />
                    <FormTextBox type='year' ref={e => this.namCapCcLyLuan = e} label='Năm cấp chứng chỉ LLCT' className='form-group col-md-3' />
                    <FormTextBox ref={e => this.noiCapCcLyLuan = e} label='Nơi cấp chứng chỉ LLCT' className='form-group col-md-3' />
                    <div className='form-group col-md-12'/>

                    <FormSelect ref={e => this.quanLyNnaNuoc = e} label='Trình độ quản lý nhà nước' data={SelectAdapter_DmTrinhDoQuanLyNhaNuocV2} className='form-group col-md-3' />
                    <FormTextBox ref={e => this.chungChiQuanLyNhaNuoc = e} label='Chứng chỉ QLNN' className='form-group col-md-3' />
                    <FormTextBox type='year' ref={e => this.namCapQlnn = e} label='Năm cấp chứng chỉ QLNN' className='form-group col-md-3' />
                    <FormTextBox ref={e => this.noiCapQlnn = e} label='Nơi cấp chứng chỉ QLNN' className='form-group col-md-3' />
                    <div className='form-group col-md-12'/>

                    <FormTextBox ref={e => this.hocTapHienTai = e} label='Tình hình học tập, bồi dưỡng hiện tại' className='form-group col-md-4' />
                    <FormTextBox ref={e => this.coSoHocTapHienTai = e} label='Tên cơ sở đào tạo' className='form-group col-md-4' />
                    <FormTextBox ref={e => this.thoiGianHocTapHienTai = e} label='Thời gian đào tạo' className='form-group col-md-4' />
                </div>
            </div>
        );
    }
}

const mapStateToProps = state => ({ staff: state.staff, system: state.system });
const mapActionsToProps = {
    getStaffEdit, userGetStaff
};
export default connect(mapStateToProps, mapActionsToProps, null, { forwardRef: true })(ComponentTrinhDo);
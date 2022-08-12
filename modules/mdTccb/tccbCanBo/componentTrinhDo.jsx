import React from 'react';
import { connect } from 'react-redux';
import { AdminPage, FormCheckbox, FormSelect, FormTextBox } from 'view/component/AdminPage';
import { getStaffEdit, userGetStaff } from './redux';
import DaoTaoDetail from '../qtDaoTao/daoTaoDetail';
import { createQtDaoTaoStaff, updateQtDaoTaoStaff, deleteQtDaoTaoStaff } from '../qtDaoTao/redux.jsx';
import { SelectAdapter_DmQuocGia } from 'modules/mdDanhMuc/dmQuocGia/redux';
class ComponentTrinhDo extends AdminPage {
    state = { shcc: '', email: '' };

    value = (item) => {
        item && this.setState({
            tienSi: (item.tienSi || item.daoTaoBoiDuong.some(i => i.tenTrinhDo == 'Tiến sĩ')) ? 1 : 0,
            thacSi: (item.thacSi || item.daoTaoBoiDuong.some(i => i.tenTrinhDo == 'Thạc sĩ')) ? 1 : 0,
            cuNhan: (item.cuNhan || item.daoTaoBoiDuong.some(i => i.tenTrinhDo == 'Cử nhân')) ? 1 : 0,
            shcc: item.shcc, email: item.email,
            tinHoc: item.tinHoc, llct: item.llct, qlnn: item.qlnn, dataDaoTaoCurrent: item.daoTaoCurrent ? item.daoTaoCurrent : []
        }, () => {
            this.thacSi.value(this.state.thacSi);
            this.tienSi.value(this.state.tienSi);
            this.cuNhan.value(this.state.cuNhan);

            this.trinhDoPhoThong.value(item.trinhDoPhoThong ? item.trinhDoPhoThong : '');

            this.chucDanh.value(item.chucDanh ? item.chucDanh : '');
            this.namChucDanh.value(item.namChucDanh ? item.namChucDanh : '');
            this.coSoChucDanh.value(item.coSoChucDanh ? item.coSoChucDanh : '');
            this.chuyenNganhChucDanh.value(item.chuyenNganhChucDanh ? item.chuyenNganhChucDanh : '');
            this.chuyenNganh.value(item.chuyenNganh ? item.chuyenNganh : '');
            this.hocViNoiTotNghiep.value(item.hocViNoiTotNghiep || '');
        });
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
            let hocVi = this.state.tienSi ? '02' : (this.state.thacSi ? '03' : (this.state.cuNhan ? '04' : ''));
            const data = {
                trinhDoPhoThong: this.getValue(this.trinhDoPhoThong),
                cuNhan: this.getValue(this.cuNhan) ? 1 : 0,
                tienSi: this.getValue(this.tienSi) ? 1 : 0,
                thacSi: this.getValue(this.thacSi) ? 1 : 0,
                chucDanh: this.getValue(this.chucDanh),
                hocVi,
                namChucDanh: this.getValue(this.namChucDanh),
                coSoChucDanh: this.getValue(this.coSoChucDanh),
                chuyenNganhChucDanh: this.getValue(this.chuyenNganhChucDanh),
            };
            return data;
        }
        catch (selector) {
            selector.focus();
            T.notify('<b>' + (selector.props.label || 'Dữ liệu') + '</b> bị trống!', 'danger');
            return false;
        }
    }
    render = () => {
        const permission = { ...this.props.permission };
        let readOnly = true;
        const canEdit = this.props.canEdit;
        if (permission.write) readOnly = false;
        return (
            <div className='tile'>
                <h3 className='tile-title'>Thông tin về trình độ</h3>
                <div className='tile-body row'>
                    <FormTextBox ref={e => this.trinhDoPhoThong = e} label='Trình độ giáo dục phổ thông' placeholder='Nhập trình độ phổ thông (Ví dụ: 12/12)' className='form-group col-md-4' readOnly={readOnly} />
                    <div className='form-group col-md-8' />

                    <FormCheckbox ref={e => this.cuNhan = e} label='Cử nhân' onChange={value => this.setState({ cuNhan: Number(value) })} className='form-group col-md-12' readOnly={readOnly} />
                    <DaoTaoDetail hocVi='Cử nhân' shcc={this.props.shcc} style={{ display: this.state.cuNhan ? 'block' : 'none' }} permission={permission} canEdit={canEdit} />

                    <FormCheckbox ref={e => this.thacSi = e} label='Thạc sĩ' onChange={value => this.setState({ thacSi: value })} className='form-group col-md-12' readOnly={readOnly} />
                    <DaoTaoDetail hocVi='Thạc sĩ' shcc={this.props.shcc} style={{ display: this.state.thacSi ? 'block' : 'none' }} permission={permission} canEdit={canEdit} />

                    <FormCheckbox ref={e => this.tienSi = e} label='Tiến sĩ' onChange={value => this.setState({ tienSi: value })} className='form-group col-md-12' readOnly={readOnly} />
                    <DaoTaoDetail hocVi='Tiến sĩ' shcc={this.props.shcc} style={{ display: this.state.tienSi ? 'block' : 'none' }} permission={permission} />

                    <FormTextBox ref={e => this.chuyenNganh = e} label='Chuyên ngành (Học vị)' className='form-group col-md-6' readOnly={readOnly} />
                    <FormSelect ref={e => this.hocViNoiTotNghiep = e} label='Quốc gia tốt nghiệp (Học vị)' className='form-group col-md-6' data={SelectAdapter_DmQuocGia} readOnly={readOnly} />

                    <FormSelect ref={e => this.chucDanh = e} label='Chức danh' data={[{ id: '02', text: 'Phó giáo sư' }, { id: '01', text: 'Giáo sư' }]} className='form-group col-md-3' allowClear readOnly={readOnly} />
                    <FormTextBox ref={e => this.chuyenNganhChucDanh = e} label='Chuyên ngành (chức danh)' className='form-group col-md-3' readOnly={readOnly} />
                    <FormTextBox type='year' ref={e => this.namChucDanh = e} label='Năm công nhận (chức danh)' className='form-group col-md-3' readOnly={readOnly} />
                    <FormTextBox ref={e => this.coSoChucDanh = e} label='Cơ sở giáo dục công nhận' className='form-group col-md-3' readOnly={readOnly} />
                    <div className='form-group col-md-12' />
                    <label className='form-group col-md-12'>Ngoại ngữ: </label>
                    <DaoTaoDetail chungChi='Ngoại ngữ' shcc={this.props.shcc} readOnly={readOnly} permission={permission} />

                    <label className='form-group col-md-12'>Tin học:</label>
                    <DaoTaoDetail chungChi='Tin học' shcc={this.props.shcc} readOnly={readOnly} permission={permission} />

                    <label className='form-group col-md-12'>Lý luận chính trị:</label>
                    <DaoTaoDetail chungChi='Lý luận chính trị' shcc={this.props.shcc} canEdit={true} readOnly={readOnly} permission={permission} />

                    <label className='form-group col-md-12'>Quản lý nhà nước:</label>
                    <DaoTaoDetail chungChi='Quản lý nhà nước' shcc={this.props.shcc} canEdit={true} readOnly={readOnly} permission={permission} />

                    <label className='form-group col-md-12'>Tình hình đào tạo, bồi dưỡng hiện tại:</label>
                    <DaoTaoDetail chungChi='Hiện tại' shcc={this.props.shcc} canEdit={true} readOnly={readOnly} permission={permission} />
                </div>
            </div>
        );
    }
}

const mapStateToProps = state => ({ staff: state.tccb.staff, system: state.system });
const mapActionsToProps = {
    getStaffEdit, userGetStaff, createQtDaoTaoStaff, updateQtDaoTaoStaff, deleteQtDaoTaoStaff
};
export default connect(mapStateToProps, mapActionsToProps, null, { forwardRef: true })(ComponentTrinhDo);
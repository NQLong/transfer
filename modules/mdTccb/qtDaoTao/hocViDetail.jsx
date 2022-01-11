import React from 'react';
import { connect } from 'react-redux';
import { AdminModal, AdminPage, FormSelect, FormTextBox } from 'view/component/AdminPage';
import Dropdown from 'view/component/Dropdown';
import { DateInput } from 'view/component/Input';
import { getStaffEdit, SelectAdapter_FwCanBo, userGetStaff } from '../tccbCanBo/redux';
import { createQtDaoTao, createQtDaoTaoStaffUser } from './redux';

const EnumDateType = Object.freeze({
    0: { text: '' },
    1: { text: 'dd/mm/yyyy' },
    2: { text: 'mm/yyyy' },
    3: { text: 'yyyy' },
}), typeMapper = {
    'yyyy': 'year',
    'mm/yyyy': 'month',
    'dd/mm/yyyy': 'date'
};
class EditModal extends AdminModal {
    state = { shcc: '', email: '' };
    componentDidMount() {
    }

    onShow = (item) => {
        this.setState({ item, shcc: item.shcc, email: item.email, batDauType: 'dd/mm/yyyy', ketThucType: 'dd/mm/yyyy' });
        this.shcc.value(item.shcc);
        this.loaiBangCap.value(this.props.hocVi);
        this.batDauType.setText({ text: 'dd/mm/yyyy' });
        this.ketThucType.setText({ text: 'dd/mm/yyyy' });
    };


    onSubmit = (e) => {
        e.preventDefault();
        const changes = {
            shcc: this.state.shcc,
            email: this.state.email,
            tenTruong: this.tenTruong.value(),
            chuyenNganh: this.chuyenNganh.value(),
            batDauType: this.state.batDauType,
            batDau: this.batDau.getVal(),
            ketThucType: this.state.ketThucType,
            ketThuc: this.ketThuc.getVal(),
            hinhThuc: this.hinhThuc.value(),
            loaiBangCap: this.loaiBangCap.value(),
            thoiGian: this.thoiGian.value(),
        };
        if (changes.shcc == '') {
            T.notify('Mã số cán bộ bị trống');
            this.shcc.focus();
        } else {
            this.props.create(changes, () => {
                this.props.value(this.state.shcc, this.state.email, [changes]);
                this.hide();
            });
        }
    }

    render = () => {
        const readOnly = this.props.readOnly;
        return this.renderModal({
            title: 'Thêm quá trình đào tạo ' + this.props.hocVi,
            size: 'large',
            body: <div className='row'>
                <FormSelect type='text' className='col-md-6' ref={e => this.shcc = e} data={SelectAdapter_FwCanBo} label='Cán bộ' readOnly />
                <FormTextBox type='text' className='col-md-6' ref={e => this.loaiBangCap = e} label='Loại bằng cấp' readOnly />
                <FormTextBox className='col-md-12' ref={e => this.tenTruong = e} label={'Tên cơ sở đào tạo và cấp bằng ' + this.props.hocVi} placeholder='Nhập rõ tên, quốc gia' readOnly={readOnly} />
                <FormTextBox className='col-md-12' ref={e => this.chuyenNganh = e} label='Chuyên ngành' readOnly={readOnly} />
                <div className='form-group col-md-6'><DateInput ref={e => this.batDau = e} placeholder='Thời gian bắt đầu'
                    label={
                        <div style={{ display: 'flex' }}>Thời gian bắt đầu (định dạng:&nbsp; <Dropdown ref={e => this.batDauType = e}
                            items={[...Object.keys(EnumDateType).map(key => EnumDateType[key].text)]}
                            onSelected={item => this.setState({ batDauType: item })} readOnly={readOnly} />)&nbsp;<span style={{ color: 'red' }}> *</span></div>
                    }
                    type={this.state.batDauType ? typeMapper[this.state.batDauType] : null} readOnly={readOnly} /></div>
                <div className='form-group col-md-6'><DateInput ref={e => this.ketThuc = e} placeholder='Thời gian kết thúc'
                    label={
                        <div style={{ display: 'flex' }}>Thời gian kết thúc (định dạng:&nbsp; <Dropdown ref={e => this.ketThucType = e}
                            items={[...Object.keys(EnumDateType).map(key => EnumDateType[key].text)]}
                            onSelected={item => this.setState({ ketThucType: item })} readOnly={readOnly} />)</div>
                    }
                    type={this.state.ketThucType ? typeMapper[this.state.ketThucType] : null} readOnly={readOnly} /></div>
                <FormTextBox type='text' className='col-md-6' ref={e => this.hinhThuc = e} label='Hình thức' readOnly={readOnly} />
                <FormTextBox type='year' className='col-md-6' ref={e => this.thoiGian = e} label='Năm hoàn thành' readOnly={readOnly} />
            </div>
        });
    }
}

class HocViDetail extends AdminPage {
    state = { shcc: '', email: '' };

    value = (shcc, email) => {
        this.setState({ shcc, email });
    }
    render = () => {
        let dataDaoTao = this.props.tccb ? this.props.staff?.selectedItem?.daoTao?.filter(i => i.loaiBangCap === this.props.tenHocVi) :
            this.props.staff?.userItem?.daoTao?.filter(i => i.loaiBangCap === this.props.tenHocVi);
        const renderHocVi = (items) => {
            return (
                <>
                    <div className='form-group col-md-10' />
                    <span className='form-group col-md-3'>Thời gian: {<b>{T.dateToText(items[0].batDau, items[0].batDauType)} - {T.dateToText(items[0].ketThuc, items[0].ketThucType)}</b>}</span>
                    <span className='form-group col-md-3'>Chuyên ngành: {<b>{items[0].chuyenNganh}</b>}</span>
                    <span className='form-group col-md-3'>Năm hoàn thành: {<b>{items[0].thoiGian}</b>}</span>
                    <span className='form-group col-md-3'>Cơ sở công nhận: {<b>{items[0].tenTruong}</b>}</span>

                </>
            );
        };
        return (
            (dataDaoTao && dataDaoTao.length > 0) ? renderHocVi(dataDaoTao) : (
                <div className='form-group col-md-10'>
                    <a href='#' onClick={e => {
                        e.preventDefault();
                        this.modal.show({ item: null, shcc: this.props.shcc, email: this.props.email });
                    }}>Thêm quá trình đào tạo {this.props.tenHocVi}</a>
                    <EditModal ref={e => this.modal = e} hocVi={this.props.tenHocVi} value={this.value}
                        create={this.props.tccb ? this.props.createQtDaoTao: this.props.createQtDaoTaoStaffUser } />
                </div>
            )
        );
    }
}

const mapStateToProps = state => ({ staff: state.staff, system: state.system });
const mapActionsToProps = {
    getStaffEdit, userGetStaff, createQtDaoTao, createQtDaoTaoStaffUser
};
export default connect(mapStateToProps, mapActionsToProps, null, { forwardRef: true })(HocViDetail);
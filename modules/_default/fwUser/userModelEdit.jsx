import { SelectAdapter_DmDonVi } from 'modules/mdDanhMuc/dmDonVi/redux';
import React from 'react';
import { FormCheckbox, FormImageBox, FormSelect, FormTextBox } from 'view/component/AdminPage';
import { SelectAdapter_Roles } from '../fwRole/redux';

export class ModalContent extends React.Component {
    state = { isStaff: 0, isStudent: 0, active: 0 }
    setVal = (data = {}) => {
        this.setState({ data, email, isStaff, isStudent, image, active });
        let { email, firstName, lastName, shcc, studentId, isStaff, isStudent, image, active, roles, maDonVi } = data ? data : { email: '', firstName: '', lastName: '', shcc: '', studentId: '', isStaff: 1, isStudent: 0, image, active: 1, roles: [], maDonVi: 0 };


        this.setState({
            active: active == 1 || active == '1',
            isStaff: isStaff == 1 || isStaff == '1',
            isStudent: isStudent == 1 || isStudent == '1'
        }, () => {
            this.email.value(email);
            this.firstName.value(firstName);
            this.lastName.value(lastName);
            this.active.value(this.state.active);
            this.isStaff.value(this.state.isStaff);
            this.isStudent.value(this.state.isStudent);
            this.img.setData('UserImage:' + email, image);
            if (this.state.isStaff) {
                $('#shcc').show();
                this.shcc.value(shcc ? shcc : '');
            } else {
                $('#shcc').hide();
            }
            if (this.state.isStudent) {
                $('#mssv').show();
                this.mssv.value(studentId ? studentId : '');
            } else $('#mssv').hide();
            this.roles.value(roles);
            this.donVi.value(maDonVi);
        });
    }

    getValid = (selector) => {
        const data = selector.value();
        const isRequired = selector.props.required;
        if (data || data === 0) return data;
        if (isRequired) throw selector;
        return '';
    }

    getValue = () => {
        try {
            const email = this.getValid(this.email);
            if (email && !T.validateEmail(email)) {
                this.email.focus();
                T.notify('Email không hợp lệ', 'danger');
                return false;
            } else {
                const data = {
                    firstName: this.getValid(this.firstName),
                    lastName: this.getValid(this.lastName),
                    active: this.state.active ? 1 : 0,
                    email: email,
                    isStaff: this.state.isStaff ? 1 : 0,
                    isStudent: this.state.isStudent ? 1 : 0,
                    shcc: this.state.isStaff ? this.getValid(this.shcc) : '',
                    studentId: this.state.isStudent ? this.getValid(this.mssv) : '',
                    maDonVi: this.getValid(this.donVi),
                    roles: this.getValid(this.roles),
                };
                return data;
            }
        }
        catch (selector) {
            selector.focus();
            T.notify('<b>' + (selector.props.label || 'Dữ liệu') + '</b> bị trống!', 'danger');
            return false;
        }
    }

    render() {
        return (
            <div className='row'>
                <div className='col-md-8'>
                    <div className='row'>
                        <FormTextBox readOnly={this.props.readOnly} ref={e => this.email = e} className='col-md-12' label='Email người dùng' required />
                        <FormTextBox readOnly={this.props.readOnly} ref={e => this.lastName = e} className='col-md-8' label='Họ và tên lót' required />
                        <FormTextBox readOnly={this.props.readOnly} ref={e => this.firstName = e} className='col-md-4' label='Tên' required />
                    </div>
                </div>
                <FormImageBox readOnly={this.props.readOnly} ref={e => this.img = e} postUrl='/user/upload' className='col-md-4 form-group' uploadType='UserImage' onSuccess={data => data.error == null && this.props.changeUser(Object.assign(this.state.data, { image: data.image }))} />
                <FormCheckbox readOnly={this.props.readOnly} isSwitch ref={e => this.active = e} onChange={value => this.setState({ active: value })} label='Kích hoạt' className='col-md-12 form-group' />
                <div className='col-sm-6'>
                    <div className='row'>
                        <FormCheckbox readOnly={this.props.readOnly} isSwitch ref={e => this.isStaff = e} className='col-12' label='Là cán bộ' onChange={value => { value ? $('#shcc').show() : $('#shcc').hide(); this.setState({ isStaff: value }); }} />
                        <div className='col-md-12' id='shcc'><FormTextBox readOnly={this.props.readOnly} placeholder='Mã thẻ cán bộ' ref={e => this.shcc = e} required={this.state.isStaff} /></div>
                    </div>
                </div>
                <div className='col-sm-6'>
                    <div className='row'>
                        <FormCheckbox readOnly={this.props.readOnly} isSwitch ref={e => this.isStudent = e} className='col-12' label='Là sinh viên' onChange={value => { value ? $('#mssv').show() : $('#mssv').hide(); this.setState({ isStudent: value }); }} />
                        <div className='col-md-12' id='mssv'><FormTextBox readOnly={this.props.readOnly} placeholder='Mã số sinh viên' ref={e => this.mssv = e} required={this.state.isStudent} /></div>
                    </div>
                </div>
                <FormSelect readOnly={this.props.readOnly} className='col-md-12' ref={e => this.donVi = e} data={SelectAdapter_DmDonVi} label='Đơn vị' />
                <FormSelect readOnly={this.props.readOnly} className='col-md-12 form-group' multiple={true} ref={e => this.roles = e} data={SelectAdapter_Roles} label='Vai trò' minimumResultsForSearch={-1} allowClear />
            </div>
        );
    }
}
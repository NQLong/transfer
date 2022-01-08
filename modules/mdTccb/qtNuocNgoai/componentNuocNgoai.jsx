import React from 'react';
import { connect } from 'react-redux';
import { AdminModal, AdminPage, FormDatePicker, FormRichTextBox, FormSelect, FormTextBox, renderTable, TableCell } from 'view/component/AdminPage';
import Dropdown from 'view/component/Dropdown';
import { DateInput } from 'view/component/Input';
import { SelectAdapter_FwCanBo } from '../tccbCanBo/redux';
import { createQtNuocNgoaiStaff, createQtNuocNgoaiStaffUser, updateQtNuocNgoaiStaff, updateQtNuocNgoaiStaffUser, deleteQtNuocNgoaiStaff, deleteQtNuocNgoaiStaffUser } from './redux';

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
    state = {
        id: null,
        batDau: '',
        ketThuc: '',
        batDauType: 'dd/mm/yyyy',
        ketThucType: 'dd/mm/yyyy',
    };

    onShow = (item) => {
        let { id, quocGia, noiDung, batDau, batDauType, ketThuc, ketThucType, tenCoSo, kinhPhi, troLaiCongTac } = item && item.item ? item.item : {
            id: '', quocGia: '', noiDung: '', tenCoSo: '', batDau: null, batDauType: '', ketThuc: null, ketThucType: '', kinhPhi: null, troLaiCongTac: ''
        };

        this.setState({
            id, batDauType: batDauType ? batDauType : 'dd/mm/yyyy',
            ketThucType: ketThucType ? ketThucType : 'dd/mm/yyyy',
            shcc: item.shcc, item, batDau, ketThuc, email: item.email
        });

        setTimeout(() => {
            this.maCanBo.value(item.shcc);
            this.kinhPhi.value(kinhPhi);
            this.tenCoSo.value(tenCoSo ? tenCoSo : '');
            this.troLaiCongTac.value(troLaiCongTac);
            this.batDauType.setText({ text: batDauType ? batDauType : 'dd/mm/yyyy' });
            this.ketThucType.setText({ text: ketThucType ? ketThucType : 'dd/mm/yyyy' });
            this.batDau.setVal(batDau);
            this.ketThuc.setVal(ketThuc);
            this.quocGia.value(quocGia);
            this.noiDung.value(noiDung);
        }, 500);
    };

    onSubmit = (e) => {
        e.preventDefault();
        const changes = {
            shcc: this.state.shcc,
            email: this.state.email,
            tenCoSo: this.tenCoSo.value(),
            kinhPhi: this.kinhPhi.value(),
            troLaiCongTac: Number(this.troLaiCongTac.value()),
            batDauType: this.state.batDauType,
            batDau: this.batDau.getVal(),
            ketThucType: this.state.ketThucType,
            ketThuc: this.ketThuc.getVal(),
            quocGia: this.quocGia.value(),
            noiDung: this.noiDung.value()
        };
        if (!changes.noiDung) {
            T.notify('Nội dung đi nước ngoài trống', 'danger');
            this.noiDung.focus();
        } else if (changes.noiDung.length > 200) {
            T.notify('Nội dung đi nước ngoài dài quá 200 ký tự', 'danger');
            this.noiDung.focus();
        } else if (!changes.quocGia) {
            T.notify('Quốc gia đi nước ngoài trống', 'danger');
            this.quocGia.focus();
        } else if (!changes.batDau) {
            T.notify('Thời gian bắt đầu bị trống!', 'danger');
            this.batDau.focus();
        } else if (!changes.tenCoSo) {
            T.notify('Cơ sở bị trống!', 'danger');
            this.tenCoSo.focus();
        }
        else {
            this.state.id ? this.props.update(this.state.id, changes, this.hide, true) : this.props.create(changes, this.hide, true);
        }
    }

    render = () => {
        const readOnly = this.props.readOnly;
        return this.renderModal({
            title: this.state.id ? 'Cập nhật quá trình đi nước ngoài' : 'Tạo mới quá trình đi nước ngoài',
            size: 'large',
            body: <div className='row'>
                <FormSelect className='col-md-12' ref={e => this.maCanBo = e} label='Cán bộ' data={SelectAdapter_FwCanBo} readOnly />
                <FormRichTextBox className='col-md-12' ref={e => this.noiDung = e} rows={2} readOnly={readOnly} label='Nội dung' placeholder='Nhập nội dung đi nước ngoài (tối đa 200 ký tự)' required maxLength={200} />
                <FormTextBox className='col-md-12' ref={e => this.quocGia = e} label='Quốc gia' required />
                <FormTextBox className='col-md-12' ref={e => this.tenCoSo = e} label='Tên cơ sở đào tạo/làm việc' required />

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

                <FormTextBox className='col-md-6' ref={e => this.kinhPhi = e} type='number' label='Kinh phí' readOnly={readOnly} />
                <FormDatePicker className='col-md-6' ref={e => this.troLaiCongTac = e} type='date-mask' label='Ngày tiếp nhận trở lại công tác' readOnly={readOnly} />
            </div>
        });
    }
}
class ComponentNuocNgoai extends AdminPage {
    state = { shcc: '', email: '' };
    value = (shcc, email) => {
        this.setState({ shcc, email });
    }

    showModal = (e, item, shcc, email) => {
        e.preventDefault();
        this.modal.show({ item: item, shcc: shcc, email: email });
    }

    deleteNuocNgoai = (e, item) => {
        T.confirm('Xóa thông tin quá trình nước ngoài', 'Bạn có chắc bạn muốn xóa quá trình này?', true, isConfirm =>
            isConfirm && (this.props.userEdit ? this.props.deleteQtNuocNgoaiStaffUser(item.id, this.state.email): this.props.deleteQtNuocNgoaiStaff(item.id, true, this.state.shcc)));
        e.preventDefault();
    }

    render = () => {
        let dataNuocNgoai = !this.props.userEdit ? this.props.staff?.selectedItem?.nuocNgoai : this.props.staff?.userItem?.nuocNgoai;
        const permission = {
            write: true,
            read: true,
            delete: !this.props.userEdit
        };

        const renderNuocNgoaiTable = (items) => (
            renderTable({
                getDataSource: () => items, stickyHead: false,
                renderHead: () => (
                    <tr>
                        <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Thời gian</th>
                        <th style={{ width: '100%' }}>Nội dung</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Tên cơ sở đào tạo/làm việc & Quốc gia</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Kinh phí</th>
                        <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>Ngày trở lại công tác</th>
                        <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>Thao tác</th>
                    </tr>),
                renderRow: (item, index) => (
                    <tr key={index}>
                        <TableCell type='number' content={index + 1} />
                        <TableCell type='link' content={<>
                            <span>Từ: <b>{T.dateToText(item.batDau, item.batDauType ? item.batDauType : 'dd/mm/yyyy')}</b></span><br />
                            {item.ketThuc ? <span>Đến: <b>{T.dateToText(item.ketThuc, item.ketThucType ? item.ketThucType : 'dd/mm/yyyy')}</b></span> : null}
                        </>}
                            style={{ whiteSpace: 'nowrap' }}
                            onClick={() => this.modal.show({ item: item, shcc: this.state.shcc, email: this.state.email })} />
                        <TableCell type='text' content={item.noiDung} style={{ whiteSpace: 'nowrap' }}/>
                        <TableCell type='text' content={
                            <>
                                <span>Tên cơ sở: {item.tenCoSo}</span><br />
                                <span>Quốc gia: {item.quocGia}</span>
                            </>
                            } style={{ whiteSpace: 'nowrap' }} />
                        <TableCell type='text' content={item.kinhPhi} />
                        <TableCell type='text' style={{ textAlign: 'center' }} content={item.troLaiCongTac ? `${T.dateToText(item.troLaiCongTac, 'dd/mm/yyyy')}` : null} />
                        <TableCell type='buttons' content={item} permission={permission} onEdit={() => this.modal.show({ item: item, shcc: this.state.shcc, email: this.state.email })} onDelete={this.deleteNuocNgoai}></TableCell>
                    </tr>)
            })
        );

        return (
            <div className='tile'>
                <h3 className='tile-title'>Quá trình đi nước ngoài</h3>
                <div className='tile-body'>
                    {
                        dataNuocNgoai && renderNuocNgoaiTable(dataNuocNgoai)
                    }
                    {
                        <div className='tile-footer' style={{ textAlign: 'right' }}>
                            <button className='btn btn-info' type='button' onClick={e => this.showModal(e, null, this.state.shcc, this.state.email)}>
                                <i className='fa fa-fw fa-lg fa-plus' />Thêm quá trình đi nước ngoài
                            </button>
                        </div>
                    }
                    <EditModal ref={e => this.modal = e} permission={permission} readOnly={false}
                        create={this.props.userEdit ? this.props.createQtNuocNgoaiStaffUser : this.props.createQtNuocNgoaiStaff} 
                        update={this.props.userEdit ? this.props.updateQtNuocNgoaiStaffUser : this.props.updateQtNuocNgoaiStaff}
                    />
                </div>
            </div>
        );

    }
}

const mapStateToProps = state => ({ system: state.system, staff: state.staff });
const mapActionsToProps = {
    createQtNuocNgoaiStaff, createQtNuocNgoaiStaffUser, updateQtNuocNgoaiStaff, updateQtNuocNgoaiStaffUser, deleteQtNuocNgoaiStaff, deleteQtNuocNgoaiStaffUser
};
export default connect(mapStateToProps, mapActionsToProps, null, { forwardRef: true })(ComponentNuocNgoai);
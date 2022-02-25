import { SelectAdapter_DmKyLuatV2 } from 'modules/mdDanhMuc/dmKhenThuongKyLuat/reduxKyLuat';
import React from 'react';
import { connect } from 'react-redux';
import { AdminModal, AdminPage, FormRichTextBox, FormSelect, FormTextBox, renderTable, TableCell } from 'view/component/AdminPage';
import Dropdown from 'view/component/Dropdown';
import { DateInput } from 'view/component/Input';
import { SelectAdapter_FwCanBo } from '../tccbCanBo/redux';
import {
    createQtKyLuatStaff, createQtKyLuatStaffUser, updateQtKyLuatStaff, 
    updateQtKyLuatStaffUser, deleteQtKyLuatStaff, deleteQtKyLuatStaffUser
} from './redux';
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
    componentDidMount() {
    }

    onShow = (item) => {
        let { id, lyDoHinhThuc, noiDung, capQuyetDinh, batDau, batDauType, ketThuc, ketThucType, diemThiDua } = item && item.item ? item.item : {
            id: '', lyDoHinhThuc: '', noiDung: '', capQuyetDinh: '', batDau: '', batDauType: '', ketThuc: '', ketThucType: '', diemThiDua: ''
        };

        this.setState({
            id, batDauType: batDauType ? batDauType : 'dd/mm/yyyy',
            ketThucType: ketThucType ? ketThucType : 'dd/mm/yyyy',
            shcc: item.shcc, item, batDau, ketThuc, email: item.email
        });

        setTimeout(() => {
            this.maCanBo.value(this.state.shcc);
            this.hinhThucKyLuat.value(lyDoHinhThuc);
            this.capQuyetDinh.value(capQuyetDinh ? capQuyetDinh : '');
            this.batDauType.setText({ text: batDauType ? batDauType : 'dd/mm/yyyy' });
            this.ketThucType.setText({ text: ketThucType ? ketThucType : 'dd/mm/yyyy' });
            this.batDau.setVal(batDau);
            this.ketThuc.setVal(ketThuc);
            this.diemThiDua.value(diemThiDua);
            this.noiDung.value(noiDung ? noiDung : '');
        }, 500);
    };

    onSubmit = (e) => {
        e.preventDefault();
        const changes = {
            shcc: this.state.shcc,
            email: this.state.email,
            lyDoHinhThuc: this.hinhThucKyLuat.value(),
            capQuyetDinh: this.capQuyetDinh.value(),
            batDauType: this.state.batDauType,
            batDau: this.batDau.getVal(),
            ketThucType: this.state.ketThucType,
            ketThuc: this.ketThuc.getVal(),
            diemThiDua: this.diemThiDua.value(),
            noiDung: this.noiDung.value()
        };
        if (!changes.noiDung) {
            T.notify('Nội dung kỷ luật trống', 'danger');
            this.noiDung.focus();
        } else if (changes.noiDung.length > 100) {
            T.notify('Nội dung kỷ luật dài quá 100 ký tự', 'danger');
            this.noiDung.focus();
        } else if (!changes.lyDoHinhThuc) {
            T.notify('Hình thức kỷ luật trống', 'danger');
            this.lyDoHinhThuc.focus();
        } else if (!changes.batDau) {
            T.notify('Thời gian bắt đầu trống!', 'danger');
            this.batDau.focus();
        } else if (!changes.capQuyetDinh) {
            T.notify('Cấp quyết định trống!', 'danger');
            this.capQuyetDinh.focus();
        }
        else {
            this.state.id ? this.props.update(this.state.id, changes, this.hide, true) : this.props.create(changes, this.hide, true);
        }
    }
    render = () => {
        const readOnly = this.props.readOnly;
        return this.renderModal({
            title: this.state.id ? 'Cập nhật quá trình kỷ luật' : 'Tạo mới quá trình kỷ luật',
            size: 'large',
            body: <div className='row'>
                <FormSelect className='col-md-12' ref={e => this.maCanBo = e} label='Mã số cán bộ' data={SelectAdapter_FwCanBo} readOnly />
                <FormRichTextBox className='col-md-12' ref={e => this.noiDung = e} rows={2} readOnly={readOnly} label='Nội dung kỷ luật' placeholder='Nhập nội dung kỷ luật (tối đa 100 ký tự)' required maxLength={100} />
                <FormSelect className='col-md-12' ref={e => this.hinhThucKyLuat = e} label='Hình thức kỷ luật' data={SelectAdapter_DmKyLuatV2} readOnly={readOnly} />

                <FormTextBox className='col-md-12' ref={e => this.capQuyetDinh = e} type='text' label='Cấp quyết định' readOnly={readOnly} required />

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

                <FormTextBox className='col-md-4' ref={e => this.diemThiDua = e} type='number' label='Điểm thi đua' readOnly={readOnly} />

            </div>
        });
    }
}
class ComponentKyLuat extends AdminPage {
    state = { shcc: '', email: '' };
    value = (shcc, email) => {
        this.setState({ shcc, email });
    }

    showModal = (e, item, shcc, email) => {
        e.preventDefault();
        this.modal.show({ item: item, shcc: shcc, email: email });
    }

    deleteKyLuat = (e, item) => {
        T.confirm('Xóa thông tin quá trình quá trình kỷ luật', 'Bạn có chắc bạn muốn xóa quá trình này?', true, isConfirm =>
            isConfirm && (this.props.userEdit ? this.props.deleteQtKyLuatStaffUser(item.id, this.state.email): this.props.deleteQtKyLuatStaff(item.id, true, this.state.shcc)));
        e.preventDefault();
    }

    render = () => {
        let dataKyLuat = !this.props.userEdit ? this.props.staff?.selectedItem?.kyLuat : this.props.staff?.userItem?.kyLuat;
        const permission = {
            write: true,
            read: true,
            delete: !this.props.userEdit
        };
        const renderKyLuat = (items) => {
            return renderTable({
                getDataSource: () => items, stickyHead: false,
                renderHead: () => (
                    <tr>
                        <th style={{ width: 'auto', textAlign: 'right' }}>#</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Cán bộ</th>
                        <th style={{ width: '50%', whiteSpace: 'nowrap' }}>Nội dung kỷ luật</th>
                        <th style={{ width: '50%', whiteSpace: 'nowrap' }}>Hình thức kỷ luật</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Cấp quyết định</th>
                        <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>Thao tác</th>
                    </tr>
                ),
                renderRow: (item, index) => (
                    <tr key={index}>
                        <TableCell type='text' style={{ textAlign: 'right' }} content={index + 1} />
                        <TableCell type='link' onClick={() => this.modal.show({ item: item, shcc: this.state.shcc, email: this.state.email })} style={{ whiteSpace: 'nowrap' }} content={(
                            <>
                                <span>{item.hoCanBo + ' ' + item.tenCanBo}</span><br />
                                {item.maCanBo}
                            </>
                        )}
                        />
                        <TableCell type='text' content={(
                            <>
                                {item.noiDung ? item.noiDung : ''}
                            </>
                        )}
                        />
                        <TableCell type='text' content={(
                            <>
                                <span style={{ whiteSpace: 'nowrap' }}>{item.tenKyLuat}</span><br />
                                <span style={{ whiteSpace: 'nowrap' }}>Thời gian bắt đầu: <span style={{ color: 'blue' }}>{item.batDau ? T.dateToText(item.batDau, item.batDauType) : ''}</span></span><br />
                                <span style={{ whiteSpace: 'nowrap' }}>Thời gian kết thúc: <span style={{ color: 'blue' }}>{item.ketThuc ? T.dateToText(item.ketThuc, item.ketThucType) : ''}</span></span>
                            </>
                        )}
                        />
                        <TableCell type='text' content={(
                            <>
                                {item.capQuyetDinh ? item.capQuyetDinh : ''}
                            </>
                        )}
                        />
                        <TableCell type='buttons' style={{ textAlign: 'center' }} content={item} permission={permission}
                            onEdit={() => this.modal.show({ item: item, shcc: this.state.shcc, email: this.state.email })} onDelete={this.delete} >
                        </TableCell>
                    </tr>
                )
            });
        };

        return (
            <div className='tile'>
                <h3 className='tile-title'>Thông tin kỷ luật</h3>
                <div className='tile-body'>
                    {
                        dataKyLuat && renderKyLuat(dataKyLuat)
                    }
                    {
                       !this.props.userEdit ? <div className='tile-footer' style={{ textAlign: 'right' }}>
                            <button className='btn btn-info' type='button' onClick={e => this.showModal(e, null, this.state.shcc, this.state.email)}>
                                <i className='fa fa-fw fa-lg fa-plus' />Thêm thông tin kỷ luật
                            </button>
                        </div> : null
                    }
                    <EditModal ref={e => this.modal = e} permission={permission} readOnly={false}
                        create={this.props.userEdit ? this.props.createQtKyLuatStaffUser : this.props.createQtKyLuatStaff} 
                        update={this.props.userEdit ? this.props.updateQtKyLuatStaffUser : this.props.updateQtKyLuatStaff}
                    />
                </div>
            </div>
        );
    }
}
const mapStateToProps = state => ({ system: state.system, staff: state.tccb.staff });
const mapActionsToProps = {
    createQtKyLuatStaff, createQtKyLuatStaffUser, updateQtKyLuatStaff, 
    updateQtKyLuatStaffUser, deleteQtKyLuatStaff, deleteQtKyLuatStaffUser
};
export default connect(mapStateToProps, mapActionsToProps, null, { forwardRef: true })(ComponentKyLuat);
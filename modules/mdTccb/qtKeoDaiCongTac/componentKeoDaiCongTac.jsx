import React from 'react';
import { connect } from 'react-redux';
import { AdminPage, TableCell, renderTable, AdminModal, FormSelect, FormTextBox } from 'view/component/AdminPage';
import Dropdown from 'view/component/Dropdown';
import { DateInput } from 'view/component/Input';
import {
    createQtKeoDaiCongTacStaff, createQtKeoDaiCongTacStaffUser, updateQtKeoDaiCongTacStaff, 
    updateQtKeoDaiCongTacStaffUser, deleteQtKeoDaiCongTacStaff, deleteQtKeoDaiCongTacStaffUser
} from './redux';
import { SelectAdapter_FwCanBo } from 'modules/mdTccb/tccbCanBo/redux';

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
        let { id, batDau, batDauType, ketThuc, ketThucType, soHieuVanBan } = item && item.item ? item.item : {
                id: '', batDau: '', batDauType: '', ketThuc: '', ketThucType: '', soHieuVanBan : ''
        };
        this.setState({
            id, batDauType: batDauType ? batDauType : 'dd/mm/yyyy',
            ketThucType: ketThucType ? ketThucType : 'dd/mm/yyyy',
            shcc: item.shcc, item, batDau, ketThuc, email: item.email
        });

        setTimeout(() => {
            this.shcc.value(item.shcc);
            this.batDau.setVal(batDau);
            this.ketThuc.setVal(ketThuc);
            this.batDauType.setText({ text: batDauType ? batDauType : 'dd/mm/yyyy' });
            this.ketThucType.setText({ text: ketThucType ? ketThucType : 'dd/mm/yyyy' });
            this.soHieuVanBan.value(soHieuVanBan ? soHieuVanBan : '');
        }, 500);
    }

    onSubmit = () => {
        const changes = {
            shcc: this.state.shcc,
            email: this.state.email,
            batDauType: this.state.batDauType,
            batDau: this.batDau.getVal(),
            ketThucType: this.state.ketThucType,
            ketThuc: this.ketThuc.getVal(),
            soHieuVanBan: this.soHieuVanBan.value(),
        };
        if (!changes.shcc) {
            T.notify('Chưa chọn cán bộ', 'danger');
            this.shcc.focus();
        } else if (!changes.soHieuVanBan) {
            T.notify('Số hiệu văn bản trống', 'danger');
            this.soHieuVanBan.focus();
        } else if (!changes.batDau) {
            T.notify('Ngày bắt đầu trống', 'danger');
            this.batDau.focus();
        } else {
            this.state.id ? this.props.update(this.state.id, changes, this.hide, true) : this.props.create(changes, this.hide, true);
        }
    }

    render = () => {
        const readOnly = this.props.readOnly;
        return this.renderModal({
            title: this.state.id ? 'Cập nhật thông tin kéo dài công tác' : 'Tạo mới thông tin kéo dài công tác',
            size: 'large',
            body: <div className='row'>
                <FormSelect className='col-md-12' ref={e => this.shcc = e} data={SelectAdapter_FwCanBo} label='Cán bộ' readOnly />
                <FormTextBox className='col-md-12' ref={e => this.soHieuVanBan = e} label='Số hiệu văn bản' readOnly={readOnly} required />
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
            </div>,
        });
    }
}

class ComponentKeoDaiCongTac extends AdminPage {
    state = { shcc: '', email: '' };
    value = (shcc, email) => {
        this.setState({ shcc, email });
    }

    showModal = (e, item, shcc, email) => {
        e.preventDefault();
        this.modal.show({ item: item, shcc: shcc, email: email });
    }

    deleteKeoDaiCongTac = (e, item) => {
        T.confirm('Xóa thông tin quá trình kéo dài công tác', 'Bạn có chắc bạn muốn xóa quá trình này?', true, isConfirm =>
            isConfirm && (this.props.userEdit ? this.props.deleteQtKeoDaiCongTacStaffUser(item.id, this.state.email): this.props.deleteQtKeoDaiCongTacStaff(item.id, true, this.state.shcc)));
        e.preventDefault();
    }

    render() {
        let dataKeoDaiCongTac = !this.props.userEdit ? this.props.staff?.selectedItem?.keoDaiCongTac : this.props.staff?.userItem?.keoDaiCongTac;
        const permission = {
            write: true,
            read: true,
            delete: !this.props.userEdit
        };

        const renderKeoDaiCongTacTable = (items) => {
            return renderTable({
                getDataSource: () => items, stickyHead: false,
                renderHead: () => (
                    <tr>
                        <th style={{ width: 'auto', textAlign: 'right' }}>#</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Thời gian</th>
                        <th style={{ width: '100%', whiteSpace: 'nowrap', textAlign: 'center' }}>Số hiệu văn bản</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Thao tác</th>
                    </tr>
                ),
                renderRow: (item, index) => (
                    <tr key={index}>
                        <TableCell type='text' style={{ textAlign: 'right' }} content={index + 1} />
                        <TableCell type='text' content={(
                            <>
                                {item.batDau ? <span style={{ whiteSpace: 'nowrap' }}>Bắt đầu: <span style={{ color: 'blue' }}>{item.batDau ? T.dateToText(item.batDau, item.batDauType ? item.batDauType : 'dd/mm/yyyy') : ''}</span><br/></span> : null}
                                {item.ketThuc ? <span style={{ whiteSpace: 'nowrap' }}>Kết thúc: <span style={{ color: 'blue' }}>{item.ketThuc ? T.dateToText(item.ketThuc, item.ketThucType ? item.ketThucType : 'dd/mm/yyyy') : ''}</span><br/></span> : null}
                            </>
                        )}
                        />
                        <TableCell type='text' style={{  whiteSpace: 'nowrap' }} content={item.soHieuVanBan}/>                
                        <TableCell type='buttons' style={{ textAlign: 'center' }} content={item} permission={permission}
                            onEdit={() => this.modal.show({ item: item, shcc: this.state.shcc, email: this.state.email })} onDelete={this.deleteKeoDaiCongTac} >
                        </TableCell>
                    </tr>
                )
            });
        };
        return (
            <div className='tile'>
                <h3 className='tile-title'>Quá trình kéo dài công tác</h3>
                <div className='tile-body'>
                    {
                        dataKeoDaiCongTac && renderKeoDaiCongTacTable(dataKeoDaiCongTac)
                    }
                    {
                       !this.props.userEdit ? <div className='tile-footer' style={{ textAlign: 'right' }}>
                            <button className='btn btn-info' type='button' onClick={e => this.showModal(e, null, this.state.shcc, this.state.email)}>
                                <i className='fa fa-fw fa-lg fa-plus' />Thêm quá trình kéo dài công tác
                            </button>
                        </div> : null
                    }
                    <EditModal ref={e => this.modal = e} permission={permission} readOnly={false}
                        create={this.props.userEdit ? this.props.createQtKeoDaiCongTacStaffUser : this.props.createQtKeoDaiCongTacStaff} 
                        update={this.props.userEdit ? this.props.updateQtKeoDaiCongTacStaffUser : this.props.updateQtKeoDaiCongTacStaff}
                    />
                </div>
            </div>
        );
    }
}

const mapStateToProps = state => ({ system: state.system, staff: state.staff });
const mapActionsToProps = {
    createQtKeoDaiCongTacStaff, createQtKeoDaiCongTacStaffUser, updateQtKeoDaiCongTacStaff, 
    updateQtKeoDaiCongTacStaffUser, deleteQtKeoDaiCongTacStaff, deleteQtKeoDaiCongTacStaffUser
};
export default connect(mapStateToProps, mapActionsToProps, null, { forwardRef: true })(ComponentKeoDaiCongTac);
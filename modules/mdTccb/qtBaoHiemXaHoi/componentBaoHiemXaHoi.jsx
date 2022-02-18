import React from 'react';
import { connect } from 'react-redux';
import { AdminPage, TableCell, renderTable, AdminModal, FormSelect, FormTextBox } from 'view/component/AdminPage';
import Dropdown from 'view/component/Dropdown';
import { DateInput } from 'view/component/Input';
import {
    createQtBaoHiemXaHoiStaff, createQtBaoHiemXaHoiStaffUser, updateQtBaoHiemXaHoiStaff, 
    updateQtBaoHiemXaHoiStaffUser, deleteQtBaoHiemXaHoiStaff, deleteQtBaoHiemXaHoiStaffUser
} from './redux';
import { SelectAdapter_FwCanBo } from 'modules/mdTccb/tccbCanBo/redux';
import { SelectAdapter_DmChucVuV1 } from 'modules/mdDanhMuc/dmChucVu/redux';

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
        let { id, batDau, batDauType, ketThuc, ketThucType, chucVu, mucDong, phuCapChucVu, phuCapThamNienVuotKhung, phuCapThamNienNghe, tyLeDong } = item && item.item ? item.item : {
                id: '', batDau: '', batDauType: '', ketThuc: '', ketThucType: '', chucVu: '', mucDong: '', phuCapChucVu: '', 
                phuCapThamNienVuotKhung: '', phuCapThamNienNghe: '', tyLeDong: ''
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
            this.chucVu.value(chucVu ? chucVu : '');
            this.mucDong.value(mucDong ? mucDong : '');
            this.phuCapChucVu.value(phuCapChucVu ? phuCapChucVu : '');
            this.phuCapThamNienVuotKhung.value(phuCapThamNienVuotKhung ? phuCapThamNienVuotKhung : '');
            this.phuCapThamNienNghe.value(phuCapThamNienNghe ? phuCapThamNienNghe : '');
            this.tyLeDong.value(tyLeDong ? tyLeDong : '');
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
            chucVu: this.chucVu.value(),
            mucDong: this.mucDong.value(),
            phuCapChucVu: this.phuCapChucVu.value(),
            phuCapThamNienVuotKhung: this.phuCapThamNienVuotKhung.value(),
            phuCapThamNienNghe: this.phuCapThamNienNghe.value(),
            tyLeDong: this.tyLeDong.value(),
        };
        if (!changes.shcc) {
            T.notify('Chưa chọn cán bộ', 'danger');
            this.shcc.focus();
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
            title: this.state.id ? 'Cập nhật thông tin bảo hiểm xã hội' : 'Tạo mới thông tin bảo hiểm xã hội',
            size: 'large',
            body: <div className='row'>
                <FormSelect className='col-md-12' ref={e => this.shcc = e} data={SelectAdapter_FwCanBo} label='Cán bộ' readOnly />
                <FormSelect className='col-md-6' ref={e => this.chucVu = e} label='Chức vụ' data={SelectAdapter_DmChucVuV1} readOnly={readOnly} />
                <FormTextBox className='col-md-3' type='number' ref={e => this.mucDong = e} label='Mức đóng' readOnly={readOnly} />
                <FormTextBox className='col-md-3' type='number' ref={e => this.tyLeDong = e} label='Tỷ lệ đóng' readOnly={readOnly} />
                <FormTextBox className='col-md-4' type='number' ref={e => this.phuCapChucVu = e} label='Phụ cấp chức vụ' readOnly={readOnly} />
                <FormTextBox className='col-md-4' type='number' ref={e => this.phuCapThamNienVuotKhung = e} label='Phụ cấp thâm niên vượt khung' readOnly={readOnly} />
                <FormTextBox className='col-md-4' type='number' ref={e => this.phuCapThamNienNghe = e} label='Phụ cấp thâm niên nghề' readOnly={readOnly} />
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

class ComponentBaoHiemXaHoi extends AdminPage {
    state = { shcc: '', email: '' };
    value = (shcc, email) => {
        this.setState({ shcc, email });
    }

    showModal = (e, item, shcc, email) => {
        e.preventDefault();
        this.modal.show({ item: item, shcc: shcc, email: email });
    }

    deleteBaoHiemXaHoi = (e, item) => {
        T.confirm('Xóa thông tin quá trình bảo hiểm xã hội', 'Bạn có chắc bạn muốn xóa quá trình này?', true, isConfirm =>
            isConfirm && (this.props.userEdit ? this.props.deleteQtBaoHiemXaHoiStaffUser(item.id, this.state.email): this.props.deleteQtBaoHiemXaHoiStaff(item.id, true, this.state.shcc)));
        e.preventDefault();
    }

    render() {
        let dataBaoHiemXaHoi = !this.props.userEdit ? this.props.staff?.selectedItem?.baoHiemXaHoi : this.props.staff?.userItem?.baoHiemXaHoi;
        const permission = {
            write: true,
            read: true,
            delete: !this.props.userEdit
        };

        const renderBaoHiemXaHoiTable = (items) => {
            return renderTable({
                getDataSource: () => items, stickyHead: false,
                renderHead: () => (
                    <tr>
                        <th style={{ width: 'auto', textAlign: 'right' }}>#</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Thời gian</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Chức vụ</th>
                        <th style={{ width: '50%', whiteSpace: 'nowrap', textAlign: 'center' }}>Thông tin tham gia</th>
                        <th style={{ width: '50%', whiteSpace: 'nowrap', textAlign: 'center' }}>Thông tin phụ cấp</th>
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
                        <TableCell type='text' style={{  whiteSpace: 'nowrap' }} content={item.tenChucVu}/>
                        <TableCell type='text' style={{  whiteSpace: 'nowrap' }} content={(
                            <>
                                <span><i>Mức đóng: </i></span> <span>{item.mucDong}</span> <br/>
                                <span><i>Tỷ lệ đóng: </i></span><span>{item.tyLeDong}</span> <br/>
                            </>
                        )}
                        />
                        <TableCell type='text' style={{  whiteSpace: 'nowrap' }} content={(
                            <>
                                <span><i>Phụ cấp chức vụ: </i></span> <span>{item.phuCapChucVu}</span> <br/>
                                <span><i>Phụ cấp thâm niên vượt khung: </i></span> <span>{item.phuCapThamNienVuotKhung}</span> <br/>
                                <span><i>Phụ cấp thâm niên nghề: </i></span> <span>{item.phuCapThamNienNghe}</span> <br/>
                            </>
                        )}
                        />                   
                         <TableCell type='buttons' style={{ textAlign: 'center' }} content={item} permission={permission}
                            onEdit={() => this.modal.show({ item: item, shcc: this.state.shcc, email: this.state.email })} onDelete={this.deleteBaoHiemXaHoi} >
                        </TableCell>
                    </tr>
                )
            });
        };
        return (
            <div className='tile'>
                <h3 className='tile-title'>Quá trình bảo hiểm xã hội</h3>
                <div className='tile-body'>
                    {
                        dataBaoHiemXaHoi && renderBaoHiemXaHoiTable(dataBaoHiemXaHoi)
                    }
                    {
                       !this.props.userEdit ? <div className='tile-footer' style={{ textAlign: 'right' }}>
                            <button className='btn btn-info' type='button' onClick={e => this.showModal(e, null, this.state.shcc, this.state.email)}>
                                <i className='fa fa-fw fa-lg fa-plus' />Thêm quá trình bảo hiểm xã hội
                            </button>
                        </div> : null
                    }
                    <EditModal ref={e => this.modal = e} permission={permission} readOnly={false}
                        create={this.props.userEdit ? this.props.createQtBaoHiemXaHoiStaffUser : this.props.createQtBaoHiemXaHoiStaff} 
                        update={this.props.userEdit ? this.props.updateQtBaoHiemXaHoiStaffUser : this.props.updateQtBaoHiemXaHoiStaff}
                    />
                </div>
            </div>
        );
    }
}

const mapStateToProps = state => ({ system: state.system, staff: state.tccb.staff });
const mapActionsToProps = {
    createQtBaoHiemXaHoiStaff, createQtBaoHiemXaHoiStaffUser, updateQtBaoHiemXaHoiStaff, 
    updateQtBaoHiemXaHoiStaffUser, deleteQtBaoHiemXaHoiStaff, deleteQtBaoHiemXaHoiStaffUser
};
export default connect(mapStateToProps, mapActionsToProps, null, { forwardRef: true })(ComponentBaoHiemXaHoi);
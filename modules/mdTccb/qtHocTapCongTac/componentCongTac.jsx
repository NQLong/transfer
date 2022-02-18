import React from 'react';
import { connect } from 'react-redux';
import { AdminModal, AdminPage, FormCheckbox, FormRichTextBox, FormSelect, renderTable, TableCell } from 'view/component/AdminPage';
import { getStaffEdit, SelectAdapter_FwCanBo, userGetStaff } from 'modules/mdTccb/tccbCanBo/redux';
import { createQtHocTapCongTacStaffUser, createQtHocTapCongTacStaff, updateQtHocTapCongTacStaffUser, updateQtHocTapCongTacStaff, deleteQtHocTapCongTacStaffUser, deleteQtHocTapCongTacStaff } from './redux';
import FileBox from 'view/component/FileBox';
import { DateInput } from 'view/component/Input';
import Dropdown from 'view/component/Dropdown';

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
    state = { id: '', shcc: '', email: '' };
    componentDidMount() {
    }

    onShow = (item) => {
        let { id, noiDung, batDau, batDauType, ketThuc, ketThucType } = item && item.item ? item.item : {
            id: '', noiDung: '', batDau: null, batDauType: '', ketThuc: null, ketThucType: '', kinhPhi: null
        };

        this.setState({
            id, batDauType: batDauType ? batDauType : 'dd/mm/yyyy',
            ketThucType: ketThucType ? ketThucType : 'dd/mm/yyyy',
            batDau, ketThuc, item: item.item, shcc: item.shcc, email: item.email
        }, () => {
            this.maCanBo.value(this.state.shcc);
            this.batDauType.setText({ text: batDauType ? batDauType : 'dd/mm/yyyy' });
            this.state.ketThuc != -1 && this.ketThucType.setText({ text: ketThucType ? ketThucType : 'dd/mm/yyyy' });
            this.state.ketThuc == -1 ? this.denNay.value(true) : this.denNay.value(false);
            this.batDau.setVal(batDau ? batDau : '');
            this.state.ketThuc != -1 && this.ketThuc.setVal(ketThuc ? ketThuc: '');
            this.noiDung.value(noiDung ? noiDung : '');
        });
    };

    onSubmit = (e) => {
        e.preventDefault();
        const changes = {
            shcc: this.state.shcc,
            email: this.state.email,
            batDauType: this.state.batDauType,
            batDau: this.batDau.getVal(),
            ketThucType: !this.state.denNay ? this.state.ketThucType : '',
            ketThuc: !this.state.denNay ? this.ketThuc.getVal() : -1,
            noiDung: this.noiDung.value()
        };
        if (!changes.batDau) {
            T.notify('Thời gian bắt đầu bị trống', 'danger');
            this.batDau.focus();
        } else if (!changes.noiDung) {
            T.notify('Nội dung bị trống', 'danger');
            this.noiDung.focus();
        }
        else {
            this.state.id ? this.props.update(this.state.id, changes, this.hide, true) : this.props.create(changes, this.hide, true);
        }
    }

    handleKetThuc = (value) => {
        value ? $('#ketThucDate').hide() : $('#ketThucDate').show();
        this.setState({ denNay: true });
    }

    render = () => {
        return this.renderModal({
            title: this.state.id ? 'Cập nhật quá trình học tập, công tác' : 'Tạo mới quá trình học tập, công tác',
            size: 'large',
            body: <div className='row'>
                <FormSelect className='col-md-12' ref={e => this.maCanBo = e} label='Cán bộ' data={SelectAdapter_FwCanBo} readOnly required />
                <FormRichTextBox className='col-md-12' ref={e => this.noiDung = e} rows={2} label='Nội dung' placeholder='Nhập nội dung (tên cơ sở, đơn vị; chức vụ (nếu có); chức danh nghề nghiệp (nếu có))' required maxLength={200} />

                <div className='form-group col-md-6'><DateInput ref={e => this.batDau = e} placeholder='Thời gian bắt đầu'
                    label={
                        <div style={{ display: 'flex' }}>Thời gian bắt đầu (định dạng:&nbsp; <Dropdown ref={e => this.batDauType = e}
                            items={[...Object.keys(EnumDateType).map(key => EnumDateType[key].text)]}
                            onSelected={item => this.setState({ batDauType: item })} />)&nbsp;<span style={{ color: 'red' }}> *</span></div>
                    }
                    type={this.state.batDauType ? typeMapper[this.state.batDauType] : null} /></div>
                <FormCheckbox ref={e => this.denNay = e} label='Đến nay' onChange={this.handleKetThuc} className='form-group col-md-3'/>
                <div className='form-group col-md-6' id='ketThucDate'><DateInput ref={e => this.ketThuc = e} placeholder='Thời gian kết thúc'
                    label={
                        <div style={{ display: 'flex' }}>Thời gian kết thúc (định dạng:&nbsp; <Dropdown ref={e => this.ketThucType = e}
                            items={[...Object.keys(EnumDateType).map(key => EnumDateType[key].text)]}
                            onSelected={item => this.setState({ ketThucType: item })} />)</div>
                    }
                    type={this.state.ketThucType ? typeMapper[this.state.ketThucType] : null} /></div>
            </div>
        });
    }
}

class UploadData extends AdminModal {
    state = { message: '', displayState: 'import', qtHTCTData: [] };

    downloadSample = e => {
        e.preventDefault();
        T.download('/api/qua-trinh/hoc-tap-cong-tac/download-template');
    }

    onSuccess = (response) => {
        if (response.error) {
            T.notify(response.error, 'danger');
        } else
            this.setState({
                qtHTCTData: response.items,
                message: <p className='text-center' style={{ color: 'blue' }}>{response.items.length} hàng được tải lên thành công</p>,
                displayState: 'data'
            });
    };

    onError = () => {
        T.notify('Quá trình upload dữ liệu bị lỗi!', 'danger');
    }

    onSubmit = () => {
        this.state.qtHTCTData.forEach(i => {
            this.props.create(Object.assign(i,
                {
                    shcc: this.props.shcc,
                    email: this.props.email,
                    batDau: (new Date(i.batDau)).getTime(),
                    ketThuc: (new Date(i.ketThuc)).getTime()
                }), () => {
                    this.setState({ message: '', displayState: 'import', qtHTCTData: [] });
                    this.hide();
                }, true);
        });
    }

    render = () => {
        const { qtHTCTData, displayState } = this.state;
        const renderData =
            renderTable({
                getDataSource: () => qtHTCTData, stickyHead: false,
                renderHead: () => (
                    <tr>
                        <th style={{ width: 'auto', textAlign: 'right' }}>#</th>
                        <th style={{ width: '100%', whiteSpace: 'nowrap' }}>Nội dung</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Thời gian</th>
                    </tr>
                ),
                renderRow: (item, index) => (
                    <tr key={index}>
                        <TableCell type='text' style={{ textAlign: 'right' }} content={index + 1} />
                        <TableCell type='text' content={(
                            <>
                                <span><i>{item.noiDung ? item.noiDung : ''}</i></span>
                            </>
                        )}
                        />
                        <TableCell type='text' style={{ textAlign: 'center' }} content={
                            <>
                                <span style={{ whiteSpace: 'nowrap' }}>Bắt đầu: <span style={{ color: 'blue' }}>{item.batDau ? T.dateToText(item.batDau, item.batDauType ? item.batDauType : 'dd/mm/yyyy') : ''}</span></span><br />
                                <span style={{ whiteSpace: 'nowrap' }}>Đến { item.ketThuc == -1 ? 'nay' : <span style={{ color: 'blue' }}>{item.ketThuc ? ': ' + T.dateToText(item.ketThuc, item.ketThucType ? item.ketThucType : 'dd/mm/yyyy') : ''}</span>} </span> 
                            </>
                        }>
                        </TableCell>
                    </tr>
                )
            });

        return this.renderModal({
            title: 'Upload dữ liệu học tập, công tác',
            size: 'large',
            body: <div className='row'>
                <div className='col-md-12'>
                    <FileBox postUrl='/user/upload' uploadType='HTCTDataFile' userData='HTCTDataFile' accept='.csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel'
                        style={{ margin: '0 auto', display: displayState == 'import' ? 'block' : 'none' }}
                        success={this.onSuccess} error={this.onError} />
                    {this.state.message}
                    <div style={{ display: displayState == 'import' ? 'none' : 'block' }}>{renderData}</div>
                </div>
            </div>,
            isShowSubmit: displayState == 'data',
            buttons:
                displayState != 'import' ? <button type='button' className='btn btn-warning' onClick={e => { e.preventDefault(); this.setState({ message: '', displayState: 'import', qtHDLVData: [] }); }}>
                    <i className='fa fa-fw fa-lg fa-refresh' />Upload lại
                </button> : <button type='button' className='btn btn-success' onClick={e => { e.preventDefault(); this.downloadSample(e); }}>
                    <i className='fa fa-fw fa-lg fa-file-excel-o' />Tải file excel mẫu
                </button>
        });
    }

}

class ComponentCongTac extends AdminPage {
    state = { shcc: '', email: '' };
    value = (shcc, email) => {
        this.setState({ shcc: shcc, email: email });
    }

    showModal = (e, item, shcc, email) => {
        e.preventDefault();
        this.modal.show({ item: item, shcc: shcc, email: email });
    }

    showModalUpload = (e) => {
        e.preventDefault();
        this.modalUpload.show();
    }

    delete = (e, item) => {
        T.confirm('Xóa thông tin quá trình công tác', 'Bạn có chắc bạn muốn xóa quá trình này?', true, isConfirm =>
            isConfirm && (this.props.userEdit ? this.props.deleteQtHocTapCongTacStaffUser(item.id, this.state.email) : this.props.deleteQtHocTapCongTacStaff(item.id, this.state.shcc, true)));
        e.preventDefault();
    }

    render = () => {
        let dataCT = !this.props.userEdit ? this.props.staff?.selectedItem?.hocTapCongTac : this.props.staff?.userItem?.hocTapCongTac;
        const permission = {
            write: true,
            read: true,
            delete: true
        };

        const renderCT = (items) => (
            renderTable({
                getDataSource: () => items, stickyHead: false,
                renderHead: () => (
                    <tr>
                        <th style={{ width: 'auto', textAlign: 'right' }}>#</th>
                        <th style={{ width: '70%', whiteSpace: 'nowrap' }}>Nội dung</th>
                        <th style={{ width: '30%', whiteSpace: 'nowrap' }}>Thời gian</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Thao tác</th>
                    </tr>
                ),
                renderRow: (item, index) => (
                    <tr key={index}>
                        <TableCell type='text' style={{ textAlign: 'right' }} content={index + 1} />
                        <TableCell type='link' content={(
                            <>
                                <span><i>{item.noiDung ? item.noiDung : ''}</i></span>
                            </>
                        )} onClick={() => this.modal.show({ item, shcc: this.state.shcc, email: this.state.email })}
                        />
                        <TableCell type='text' content={(
                            <>
                                <span style={{ whiteSpace: 'nowrap' }}>Từ: <span style={{ color: 'blue' }}>{item.batDau ? T.dateToText(item.batDau, item.batDauType ? item.batDauType : 'dd/mm/yyyy') : ''}</span></span><br />
                                <span style={{ whiteSpace: 'nowrap' }}>Đến { item.ketThuc == -1 ? 'nay' : <span style={{ color: 'blue' }}>{item.ketThuc ? ': ' + T.dateToText(item.ketThuc, item.ketThucType ? item.ketThucType : 'dd/mm/yyyy') : ''}</span>} </span> 
                            </>
                        )}
                        />
                        <TableCell type='buttons' style={{ textAlign: 'center' }} content={item} permission={permission}
                            onEdit={() => this.modal.show({ item, shcc: this.state.shcc, email: this.state.email })} onDelete={this.delete} >
                        </TableCell>
                    </tr>
                )
            })
        );

        return (
            <div className='tile'>
                <h3 className='tile-title'>Quá trình công tác</h3>
                <div className='tile-body'>
                    {
                        dataCT && renderCT(dataCT)
                    }
                    {<div className='tile-footer' style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <button className='btn btn-success' type='button' onClick={e => this.showModalUpload(e)}>
                            <i className='fa fa-fw fa-lg fa-upload' />Upload dữ liệu
                        </button>
                        <button className='btn btn-info' type='button' onClick={e => this.showModal(e, null, this.state.shcc, this.state.email)}>
                            <i className='fa fa-fw fa-lg fa-plus' />Thêm thông tin công tác
                        </button>
                    </div>
                    }
                    <EditModal ref={e => this.modal = e} userEdit={this.props.userEdit}
                        create={this.props.userEdit ? this.props.createQtHocTapCongTacStaffUser : this.props.createQtHocTapCongTacStaff}
                        update={this.props.userEdit ? this.props.updateQtHocTapCongTacStaffUser : this.props.updateQtHocTapCongTacStaff}
                    />
                    <UploadData ref={e => this.modalUpload = e}
                        shcc={this.state.shcc} email={this.state.email} userEdit={this.props.userEdit}
                        create={this.props.userEdit ? this.props.createQtHocTapCongTacStaffUser : this.props.createQtHocTapCongTacStaff}
                        renderTable={renderCT} />
                </div>
            </div>
        );
    }
}


const mapStateToProps = state => ({ staff: state.tccb.staff, system: state.system });
const mapActionsToProps = {
    getStaffEdit, userGetStaff, createQtHocTapCongTacStaffUser, createQtHocTapCongTacStaff, updateQtHocTapCongTacStaffUser, updateQtHocTapCongTacStaff, deleteQtHocTapCongTacStaffUser, deleteQtHocTapCongTacStaff
};
export default connect(mapStateToProps, mapActionsToProps, null, { forwardRef: true })(ComponentCongTac);
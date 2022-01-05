import React from 'react';
import { connect } from 'react-redux';
import { AdminModal, AdminPage, FormCheckbox, FormDatePicker, FormSelect, FormTextBox, renderTable, TableCell } from 'view/component/AdminPage';
import { getDmChucVuAll, SelectAdapter_DmChucVuV0 } from 'modules/mdDanhMuc/dmChucVu/redux';
import { getDmDonViAll } from 'modules/mdDanhMuc/dmDonVi/redux';
import { getDmBoMonAll } from 'modules/mdDanhMuc/dmBoMon/redux';
import { getStaffEdit } from 'modules/mdTccb/tccbCanBo/redux';
import { getQtChucVuAll, createQtChucVu, updateQtChucVu, deleteQtChucVu } from 'modules/mdTccb/qtChucVu/redux';
import { SelectAdapter_DmChucVuV2 } from 'modules/mdDanhMuc/dmChucVu/redux';
import { SelectAdapter_DmDonVi } from 'modules/mdDanhMuc/dmDonVi/redux';
import { SelectAdapter_DmBoMon } from 'modules/mdDanhMuc/dmBoMon/redux';
import { SelectAdapter_FwCanBo } from 'modules/mdTccb/tccbCanBo/redux';
import { getChucVuByShcc } from './redux';
class EditModal extends AdminModal {
    state = { shcc: null, stt: '' };
    componentDidMount() {

    }

    onShow = (item) => {
        let { stt, shcc, maChucVu, maDonVi, soQuyetDinh, ngayRaQuyetDinh, ngayRaQd, soQd, chucVuChinh, maBoMon } = item && item.item ? item.item : {
            stt: '',
            shcc: '', maChucVu: '', maDonVi: '', soQuyetDinh: '', ngayRaQuyetDinh: '', chucVuChinh: '', maBoMon: '',
            ngayRaQd: '', soQd: ''
        };
        this.shcc.value(shcc ? shcc : (item.shcc != '' ? item.shcc : ''));
        this.maChucVu.value(maChucVu ? maChucVu : '');
        this.props.type == 1 && this.maDonVi.value(maDonVi ? maDonVi : '');
        this.soQuyetDinh.value(soQd ? soQd : (soQuyetDinh ? soQuyetDinh : ''));
        this.ngayRaQuyetDinh.value(ngayRaQd ? ngayRaQd : (ngayRaQuyetDinh ? ngayRaQuyetDinh : ''));
        this.props.type == 1 && this.chucVuChinh.value(chucVuChinh ? 1 : 0);
        this.props.type == 1 && this.maBoMon.value(maBoMon ? maBoMon : '');
        this.setState({ shcc: item.shcc, stt, item, chucVuChinh });

    };

    changeKichHoat = (value, target) => target.value(value ? 1 : 0) || target.value(value);

    checkChucVu = (changes) => {
        if (changes.chucVuChinh == this.state.chucVuChinh) {
            this.state.stt ? this.props.update(true, this.state.stt, changes, this.hide) : this.props.create(true, changes, this.hide);
            return;
        }
        T.confirm('Thông tin chức vụ chính', 'Đây sẽ là chức vụ chính của cán bộ', 'warning', true, isConfirm => {
            isConfirm && this.props.getQtChucVuAll(changes.shcc, data => {
                if (data) {
                    data.forEach(item => {
                        if (item.chucVuChinh && item.stt != this.state.stt) {
                            this.props.update(true, item.stt, { chucVuChinh: 0 });
                        }
                    });
                }
                if (this.state.stt) {
                    this.props.update(true, this.state.stt, changes, this.hide);
                } else {
                    this.props.create(true, changes, this.hide);
                }
            });
        });
    }

    onSubmit = () => {
        const changes = {
            shcc: this.shcc.value(),
            maChucVu: this.maChucVu.value(),
            maDonVi: this.props.type ? this.maDonVi.value() : '',
            soQd: this.soQuyetDinh.value(),
            ngayRaQd: Number(this.ngayRaQuyetDinh.value()),
            chucVuChinh: this.props.type ? this.chucVuChinh.value() : 0,
            maBoMon: this.props.type ? this.maBoMon.value() : '',
        };
        if (!changes.maChucVu) {
            T.notify('Chức vụ bị trống!', 'danger');
            this.maChucVu.focus();
        }
        else if (!changes.soQd) {
            T.notify('Số quyết định bị trống!', 'danger');
            this.soQuyetDinh.focus();
        }
        else if (!changes.ngayRaQd) {
            T.notify('Ngày ra quyết định bị trống!', 'danger');
            this.ngayRaQuyetDinh.focus();
        } else {
            if (!changes.chucVuChinh) {
                if (this.state.stt) {
                    this.props.update(true, this.state.stt, changes, this.hide);
                } else {
                    this.props.create(true, changes, this.hide);
                }
            } else
                this.checkChucVu(changes);
        }
    }

    checkChucVuSwitch = () => {
        if (this.state.chucVuChinh) {
            return true;
        }
        return false;
    }

    render = () => {
        const readOnly = this.props.readOnly;
        return this.renderModal({
            title: this.state.stt ? 'Cập nhật quá trình chức vụ' : 'Tạo mới quá trình chức vụ',
            size: 'large',
            body: <div className='row'>
                <FormSelect className='col-md-12' ref={e => this.shcc = e} label='Cán bộ' data={SelectAdapter_FwCanBo} readOnly={true} />
                <FormSelect className={this.props.type ? 'col-md-4' : 'col-md-12'} ref={e => this.maChucVu = e} label='Chức vụ' data={this.props.type == 1 ? SelectAdapter_DmChucVuV2 : SelectAdapter_DmChucVuV0} readOnly={readOnly} required />
                {this.props.type ? <FormSelect className='col-md-4' ref={e => this.maDonVi = e} label='Đơn vị của chức vụ' data={SelectAdapter_DmDonVi} readOnly={readOnly} /> : null}
                {this.props.type ? <FormSelect className='col-md-4' ref={e => this.maBoMon = e} label='Bộ môn của chức vụ' data={SelectAdapter_DmBoMon} readOnly={readOnly} /> : null}
                {this.props.type ? <FormCheckbox className='col-md-12' ref={e => this.chucVuChinh = e} label='Chức vụ chính' isSwitch={true} readOnly={this.checkChucVuSwitch()} /> : null}
                <FormTextBox type='text' className='col-md-6' ref={e => this.soQuyetDinh = e} label='Số quyết định' readOnly={readOnly} required />
                <FormDatePicker type='date-mask' className='col-md-6' ref={e => this.ngayRaQuyetDinh = e} label='Ngày ra quyết định' readOnly={readOnly} required />
                {this.state.stt ? <FormCheckbox className='col-md-12' ref={e => this.thoiChucVu = e} label='Thôi giữ chức vụ' isSwitch={true} readOnly={readOnly} /> : null}
            </div>
        });
    }
}

class ComponentChucVu extends AdminPage {
    state = { type: '', shcc: '', data: [] }
    loaiChucVuMap = {
        0: 'Chức vụ đoàn thể',
        1: 'Chức vụ chính quyền',
        2: 'Chức vụ Hội đồng trường',
        3: 'Chức vụ Đảng ủy',
        4: 'Chức vụ Công đoàn',
        5: 'Chức vụ Hội Cựu Chiến binh',
        6: 'Chức vụ Đoàn Thanh niên - Hội Sinh viên'
    };

    value = (type, shcc) => {
        this.setState({ type: type ? true : false, shcc }, () =>
            this.setState({ data: this.props.userEdit ? this.props.staff?.userItem?.chucVu.filter(i => i.lcv == this.state.type) : [] })
        );
    }

    showModal = (e, shcc) => {
        e.preventDefault();
        this.modal.show({ item: null, shcc: shcc });
    }

    delete = (e, item) => {
        T.confirm('Xóa chức vụ', 'Bạn có chắc bạn muốn xóa chức vụ này?', 'warning', true, isConfirm => {
            isConfirm && this.props.deleteQtChucVu(true, item.stt, this.state.shcc, error => {
                if (error) T.notify(error.message ? error.message : 'Xoá chức vụ bị lỗi!', 'danger');
                else {
                    T.alert('Xoá chức vụ thành công!', 'success', false, 800);
                }
            });
        });
        e.preventDefault();
    }

    render() {
        let dataChucVu = !this.props.userEdit ? this.props.staff?.selectedItem?.chucVu.filter(i => i.lcv == this.state.type) : [];
        const permission = this.getUserPermission('staff', ['read', 'write', 'delete']);
        let display = ((this.state.data || dataChucVu) && (this.state.data.length > 0 || dataChucVu.length > 0)) ? true : false;
        const renderTableChucVu = (items) => (
            renderTable({
                getDataSource: () => items, stickyHead: false,
                renderHead: () => (
                    <tr>
                        <th style={{ width: 'auto', textAlign: 'right' }}>#</th>
                        <th style={{ width: '70%', textAlign: 'center', whiteSpace: 'nowrap' }}>Chức vụ</th>
                        <th style={{ width: '30%', textAlign: 'center', whiteSpace: 'nowrap' }}>Quyết định bổ nhiệm</th>
                        {this.state.type == 1 && <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Chức vụ chính</th>}
                        <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>Thao tác</th>

                    </tr>
                ),
                renderRow: (item, index) => (
                    <tr key={index}>
                        <TableCell type='text' content={index + 1} />
                        <TableCell type='text' content={(
                            this.state.type == 1 ? <>
                                <span>{item.tenChucVu}</span><br />
                                <span>{item.maDonVi ? 'Đơn vị: ' + item.tenDonVi : 'Bộ môn/Phòng: ' + item.tenBoMon}</span>
                            </> :
                                <>
                                    <span>{item.tenChucVu}</span><br />
                                    <span>{this.loaiChucVuMap[item.loaiChucVu]}</span>
                                </>

                        )} />
                        <TableCell type='text' content={(
                            <>
                                <span>Số: {item.soQuyetDinh}</span><br />
                                <span>Ngày: <span style={{ color: 'blue' }}>{item.ngayRaQuyetDinh ? new Date(item.ngayRaQuyetDinh).ddmmyyyy() : ''}</span></span>
                            </>
                        )}
                        />
                        {this.state.type == 1 && <TableCell type='checkbox' content={item.chucVuChinh} />}

                        <TableCell type='buttons' content={item} permission={permission} permissionDelete={true}
                            onEdit={() => this.modal.show({ item: item, shcc: this.state.shcc })}
                            onDelete={e => this.delete(e, item)}></TableCell>
                    </tr>)
            })
        );

        return (
            (display || !this.props.userEdit) ? 
            <div className='col-md-12 form-group'>
                <div>{this.props.label}
                    <div className='tile-body'>
                        {
                            this.props.userEdit ?
                                (this.state.data && renderTableChucVu(this.state.data))
                                :
                                (dataChucVu && renderTableChucVu(dataChucVu))
                        }
                        {
                            !this.props.userEdit ? <div className='tile-footer' style={{ textAlign: 'right' }}>
                                <button className='btn btn-info' type='button' onClick={e => this.showModal(e, this.state.shcc)}>
                                    <i className='fa fa-fw fa-lg fa-plus' />Thêm {this.loaiChucVuMap[this.state.type ? 1 : 0]}
                                </button>
                            </div> : null
                        }
                        <EditModal ref={e => this.modal = e} type={this.state.type ? 1 : 0} readOnly={this.props.userEdit}
                            getQtChucVuAll={this.props.getQtChucVuAll} getData={this.props.getStaffEdit}
                            create={this.props.createQtChucVu} update={this.props.updateQtChucVu}
                        />
                    </div>
                </div>
            </div> : null
        );

    }
}

const mapStateToProps = state => ({ staff: state.staff, system: state.system });
const mapActionsToProps = {
    getDmChucVuAll, getDmDonViAll, getDmBoMonAll, getQtChucVuAll,
    createQtChucVu, updateQtChucVu, deleteQtChucVu, getStaffEdit, getChucVuByShcc
};
export default connect(mapStateToProps, mapActionsToProps, null, { forwardRef: true })(ComponentChucVu);
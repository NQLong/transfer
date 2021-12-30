import React from 'react';
import { connect } from 'react-redux';
import { AdminModal, AdminPage, FormCheckbox, FormDatePicker, FormSelect, FormTextBox, renderTable, TableCell } from 'view/component/AdminPage';
import { getDmChucVuAll } from 'modules/mdDanhMuc/dmChucVu/redux';
import { getDmDonViAll } from 'modules/mdDanhMuc/dmDonVi/redux';
import { getDmBoMonAll } from 'modules/mdDanhMuc/dmBoMon/redux';
import { getStaffEdit } from 'modules/mdTccb/tccbCanBo/redux';
import { getQtChucVuAll, createQtChucVu, updateQtChucVu, deleteQtChucVu } from 'modules/mdTccb/qtChucVu/redux';
import { SelectAdapter_DmChucVuV2 } from 'modules/mdDanhMuc/dmChucVu/redux';
import { SelectAdapter_DmDonVi } from 'modules/mdDanhMuc/dmDonVi/redux';
import { SelectAdapter_DmBoMon } from 'modules/mdDanhMuc/dmBoMon/redux';
import { SelectAdapter_FwCanBo } from 'modules/mdTccb/tccbCanBo/redux';
class EditModal extends AdminModal {
    state = { shcc: null, stt: '' };
    componentDidMount() {

    }

    onShow = (item) => {
        let { stt, shcc, maChucVu, maDonVi, soQuyetDinh, ngayRaQuyetDinh, ngayRaQd, soQd, chucVuChinh, maBoMon } = item ? item : {
            stt: '',
            shcc: '', maChucVu: '', maDonVi: '', soQuyetDinh: '', ngayRaQuyetDinh: '', chucVuChinh: '', maBoMon: '',
            ngayRaQd: '', soQd: ''
        };
        this.setState({ shcc, stt, item, chucVuChinh });
        this.shcc.value(shcc ? shcc : '');
        this.maChucVu.value(maChucVu ? maChucVu : '');
        this.maDonVi.value(maDonVi ? maDonVi : '');
        this.soQuyetDinh.value(soQd ? soQd : (soQuyetDinh ? soQuyetDinh : ''));
        this.ngayRaQuyetDinh.value(ngayRaQd ? ngayRaQd : (ngayRaQuyetDinh ? ngayRaQuyetDinh : ''));
        this.chucVuChinh.value(chucVuChinh ? 1 : 0);
        this.maBoMon.value(maBoMon ? maBoMon : '');
    };

    changeKichHoat = (value, target) => target.value(value ? 1 : 0) || target.value(value);

    checkChucVu = (changes) => {
        if (changes.chucVuChinh == this.state.chucVuChinh) {
            this.state.stt ? this.props.update(true, this.state.stt, changes, this.hide) : this.props.create(changes, this.hide);
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
                    this.props.getData(changes.shcc);
                } else {
                    this.props.create(changes, this.hide);
                    this.props.getData(changes.shcc);
                }
            });
        });
    }

    onSubmit = (e) => {
        e.preventDefault();
        const changes = {
            shcc: this.shcc.value(),
            maChucVu: this.maChucVu.value(),
            maDonVi: this.maDonVi.value(),
            soQd: this.soQuyetDinh.value(),
            ngayRaQd: Number(this.ngayRaQuyetDinh.value()),
            chucVuChinh: this.chucVuChinh.value(),
            maBoMon: this.maBoMon.value(),
        };
        if (changes.shcc == '') {
            T.notify('Mã số cán bộ bị trống');
            this.shcc.focus();
        } else {
            if (!changes.chucVuChinh) {
                if (this.state.stt) {
                    this.props.update(true, this.state.stt, changes, error=> {
                        if (error == undefined || error == null) {
                            this.props.getData(changes.shcc);
                            this.hide();
                        }
                    });
                } else {
                    this.props.getData && this.props.getData(changes.shcc);
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
            title: this.state.shcc ? 'Cập nhật quá trình chức vụ' : 'Tạo mới quá trình chức vụ',
            size: 'large',
            body: <div className='row'>
                <FormSelect className='col-md-12' ref={e => this.shcc = e} label='Mã số cán bộ' data={SelectAdapter_FwCanBo} readOnly={readOnly} />
                <FormSelect className='col-md-4' ref={e => this.maChucVu = e} label='Chức vụ' data={SelectAdapter_DmChucVuV2} readOnly={readOnly} />
                <FormSelect className='col-md-4' ref={e => this.maDonVi = e} label='Đơn vị' data={SelectAdapter_DmDonVi} readOnly={readOnly} />
                <FormSelect className='col-md-4' ref={e => this.maBoMon = e} label='Bộ môn' data={SelectAdapter_DmBoMon} readOnly={readOnly} />
                <FormCheckbox className='col-md-12' ref={e => this.chucVuChinh = e} label='Chức vụ chính' isSwitch={true} readOnly={this.checkChucVuSwitch()} />
                <FormTextBox type='text' className='col-md-6' ref={e => this.soQuyetDinh = e} label='Số quyết định' readOnly={readOnly} />
                <FormDatePicker className='col-md-6' ref={e => this.ngayRaQuyetDinh = e} label='Ngày ra quyết định' readOnly={readOnly} />
                <FormCheckbox className='col-md-12' ref={e => this.thoiChucVu = e} label='Thôi giữ chức vụ' isSwitch={true} readOnly={readOnly} />
            </div>
        });
    }
}

class ComponentChucVu extends AdminPage {
    data = [];
    mapperChucVu = {}; mapperDonVi = {}; mapperBoMon = {}; mapperChucVu1 = {};
    type = ''; shcc = '';
    loaiChucVuMap = {
        0: 'Chức vụ đoàn thể',
        1: 'Chức vụ chính quyền',
        2: 'Chức vụ Hội đồng trường',
        3: 'Chức vụ Đảng ủy',
        4: 'Chức vụ Công đoàn',
        5: 'Chức vụ Hội Cựu Chiến binh',
        6: 'Chức vụ Đoàn Thanh niên - Hội Sinh viên'
    };

    componentDidMount() {
        this.props.getDmChucVuAll(items => items.forEach(i => this.mapperChucVu[i.ma] = i.loaiChucVu));
        this.props.getDmChucVuAll(items => items.forEach(i => this.mapperChucVu1[i.ma] = i.ten));
        this.props.getDmDonViAll(items => items.forEach(i => this.mapperDonVi[i.ma] = i.ten));
        this.props.getDmBoMonAll(items => items.forEach(i => this.mapperBoMon[i.ma] = i.ten));

    }
    value = (item, type, shcc) =>{
        this.data = item;
        this.type = type;
        this.shcc = shcc;
    }

    showModal = (e, shcc) => {
        e.preventDefault();
        this.modal.show({ shcc: shcc });
    }

    delete = (e, item) => {
        T.confirm('Xóa chức vụ', 'Bạn có chắc bạn muốn xóa chức vụ này?', 'warning', true, isConfirm => {
            isConfirm && this.props.deleteQtChucVu(item.stt, error => {
                if (error) T.notify(error.message ? error.message : 'Xoá chức vụ bị lỗi!', 'danger');
                else {
                    T.alert('Xoá chức vụ thành công!', 'success', false, 800);

                }
            });
        });
        this.props.getData(this.shcc);
        e.preventDefault();
    }

    render() {
        const permission = this.getUserPermission('staff', ['read', 'write', 'delete']);
        const renderTableChucVu = (items) => (
            renderTable({
                getDataSource: () => items, stickyHead: false,
                renderHead: () => (
                    <tr>
                        <th style={{ width: 'auto', textAlign: 'right' }}>#</th>
                        <th style={{ width: '70%', textAlign: 'center' }}>Chức vụ</th>
                        <th style={{ width: '30%', textAlign: 'center' }}>Quyết định bổ nhiệm</th>
                        {this.type == 1 && <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Chức vụ chính</th>}
                        <th style={{ width: 'auto', textAlign: 'center' }}>Thao tác</th>

                    </tr>
                ),
                renderRow: (item, index) => (
                    <tr key={index}>
                        <TableCell type='text' content={index + 1} />
                        <TableCell type='text' content={(
                            this.type == 1 ? <>
                                <span>{this.mapperChucVu1[item.maChucVu]}</span><br />
                                <span>{item.maDonVi ? 'Đơn vị: ' + this.mapperDonVi[item.maDonVi] : 'Bộ môn/Phòng: ' + this.mapperBoMon[item.maBoMon]}</span>
                            </> :
                                <>
                                    <span>{this.mapperChucVu1[item.maChucVu]}</span><br />
                                    <span>{this.loaiChucVuMap[this.mapperChucVu[item.maChucVu]]}</span>
                                </>

                        )} />
                        <TableCell type='text' content={(
                            <>
                                <span>Số: {item.soQd}</span><br />
                                <span>Ngày: <span style={{ color: 'blue' }}>{item.ngayRaQd ? new Date(item.ngayRaQd).ddmmyyyy() : ''}</span></span>
                            </>
                        )}
                        />
                        {this.type == 1 && <TableCell type='checkbox' content={item.chucVuChinh} />}

                        <TableCell type='buttons' content={item} permission={permission} permissionDelete={true}
                            onEdit={() => this.modal.show(item)}
                            onDelete={e => this.delete(e, item)}></TableCell>
                    </tr>)
            })
        );

        return (
            <div className='col-md-12 form-group'>
                <p>{this.props.label}</p>
                <div className='tile-body'>{renderTableChucVu(this.data && this.type == 1 ? this.data.filter(i => this.mapperChucVu[i.maChucVu] == this.type) : this.data.filter(i => this.mapperChucVu[i.maChucVu] != 1))}</div>
                <div className='tile-footer' style={{ textAlign: 'right' }}>
                    <button className='btn btn-info' type='button' onClick={e => this.showModal(e, this.shcc)}>
                        <i className='fa fa-fw fa-lg fa-plus' />Thêm {this.loaiChucVuMap[this.type]}
                    </button>
                </div>
                <EditModal ref={e => this.modal = e}
                    getQtChucVuAll={this.props.getQtChucVuAll} getData={this.props.getStaffEdit}
                    create={this.props.createQtChucVu} update={this.props.updateQtChucVu}
                />
            </div>


        );

    }
}

const mapStateToProps = state => ({ staff: state.staff, system: state.system });
const mapActionsToProps = {
    getDmChucVuAll, getDmDonViAll, getDmBoMonAll, getQtChucVuAll, createQtChucVu, updateQtChucVu, deleteQtChucVu, getStaffEdit
};
export default connect(mapStateToProps, mapActionsToProps, null, { forwardRef: true })(ComponentChucVu);

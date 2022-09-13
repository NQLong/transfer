import React from 'react';
import { connect } from 'react-redux';
import { createAssignRole, getRolesList, getAssignRole, updateAssignRole, deleteAssignRole } from './redux';
import { AdminModal, FormDatePicker, FormSelect, renderTable, TableCell, getValue } from 'view/component/AdminPage';

class AssignRoleModal extends AdminModal {
    state = { items: [], ngayBatDau: new Date().getTime(), ngayKetThuc: '', rolesList: [], updateRolesList: [], nguoiDuocGan: '', nguoiGan: {}, disableButton: false, tenCanBo: '' }

    componentDidMount() {
        // getRolesList(this.props.nhomRole, roles => this.setState({ rolesList: roles }));
    }

    insert = (e) => {
        e.preventDefault();
        try {
            this.setState({ disableButton: true });
            const newData = {
                nguoiGan: this.props.nguoiGan.shcc,
                emailNguoiDuocGan: this.state.nguoiDuocGan.email,
                nguoiDuocGan: this.state.nguoiDuocGan.shcc,
                tenRole: getValue(this.select),
                ngayBatDau: this.state.ngayBatDau,
                nhomRole: this.state.rolesList.find(item => item.id == getValue(this.select)).nhomRole
            };
            if (this.ngayKetThuc.value()) newData.ngayKetThuc = this.ngayKetThuc.value().getTime();
            if (newData.tenRole == '') {
                T.notify('Quyền gán bị trống', 'danger');
            } else if (newData.ngayKetThuc && newData.ngayKetThuc < newData.ngayBatDau) {
                T.notify('Ngày kết thúc không được trước ngày cập nhật', 'danger');
            } else {
                createAssignRole(newData, (data) => {
                    if (data.error == null) {
                        this.onShow(this.state.nguoiDuocGan);
                    }
                });
            }
        } catch (input) {
            if (input && input.props) {
                T.notify((input.props.label || 'Dữ liệu') + ' bị trống!', 'danger');
                input.focus();
            }
            this.setState({ disableButton: false });
        }
    }

    onShow = (nguoiDuocGan) => {
        getRolesList(this.props.nhomRole, roles => this.setState({ rolesList: roles }, () => {
            getAssignRole(nguoiDuocGan.shcc, this.props.nhomRole, items => {
                let list = items.map(item => item.tenRole);
                let diff = this.state.rolesList.filter(role => !list.includes(role.id));
                this.setState({ items, updateRolesList: diff, nguoiDuocGan, disableButton: false, tenCanBo: nguoiDuocGan.lastName + ' ' + nguoiDuocGan.firstName }, () => {
                    this.select.value(null);
                });
            });
        }));

    };

    delete = (e, item) => {
        e.preventDefault();
        T.confirm('Xóa thông tin gán quyền', 'Bạn có chắc bạn muốn xóa thông tin gán quyền này?', true, isConfirm => {
            isConfirm && this.props.deleteAssignRole(item, () => this.onShow(this.state.nguoiDuocGan));
        });
    };

    render = () => {
        const { tenCanBo, rolesList, updateRolesList, disableButton } = this.state;
        const permissions = this.props.system && this.props.system.user && this.props.system.user.permissions ? this.props.system.user.permissions : [];
        const writable = permissions.includes('fwAssignRole:write');
        const table = renderTable({
            getDataSource: () => this.state.items,
            emptyTable: 'Chưa có phân quyền',
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto' }}>#</th>
                    <th style={{ width: '35%' }}>Quyền</th>
                    <th style={{ width: '35%' }}>Ngày kết thúc</th>
                    <th style={{ width: '30%', whiteSpace: 'nowrap' }}>Người gán</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Thao tác</th>
                </tr>
            ), renderRow: (item, index) => {
                const tenRole = rolesList.find(role => role.id == item.tenRole);
                return <tr key={index}>
                    <TableCell type='number' content={index + 1} />
                    <TableCell content={tenRole ? tenRole.text : ''} />
                    <TableCell type='date' content={item.ngayKetThuc} dateFormat='dd/mm/yyyy' />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.tenNguoiGan + ' ' + item.nguoiGan} />
                    <TableCell type='buttons' style={{ textAlign: 'center' }} permission={{ delete: writable }} onDelete={this.delete} content={item} />
                </tr>;
            }
        });

        return this.renderModal({
            title: 'Cập nhật quyền của ' + tenCanBo,
            size: 'large',
            body: <>
                <div className='row'>
                    <FormSelect ref={e => this.select = e} className='col-md-6' data={updateRolesList} label='Quyền gán' placeholder='Lựa chọn quyền' readOnly={!writable} required />
                    <FormDatePicker ref={e => this.ngayKetThuc = e} className='col-md-5' label='Ngày kết thúc' type='date-mask' readOnly={!writable} />
                    <div className='form-group col-md-1 d-flex align-items-end justify-content-end' style={{ paddingLeft: 0 }}>
                        <button type='button' disabled={disableButton} className='btn btn-success' data-toggle='tooltip' title='Thêm quyền' onClick={this.insert}>
                            <i className='fa fa-lg fa-plus' />
                        </button>
                    </div>
                </div>
                {table}
            </>
        });
    }
}

const mapStateToProps = state => ({ system: state.system, assignRole: state.framework.assignRole });
const mapActionsToProps = { getRolesList, updateAssignRole, deleteAssignRole };
export default connect(mapStateToProps, mapActionsToProps, null, { forwardRef: true })(AssignRoleModal);

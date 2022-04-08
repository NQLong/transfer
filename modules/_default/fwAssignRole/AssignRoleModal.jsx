import React from 'react';
import { connect } from 'react-redux';
import { createAssignRole, getRolesList, getAssignRole, updateAssignRole, deleteAssignRole } from './redux';
import { AdminModal, renderTable } from 'view/component/AdminPage';
import { DateInput } from 'view/component/Input';

class AssignRoleModal extends AdminModal {
    state = { items: [], ngayBatDau: new Date(), ngayKetThuc: '', rolesList: [], updateRolesList: [], nguoiDuocGan: '', nguoiGan: {}, disableButton: false }
    modal = React.createRef();
    select = React.createRef();
    ngayKetThuc = React.createRef();

    componentDidMount() {
        this.props.getRolesList(this.props.nhomRole, roles => this.setState({ rolesList: roles.items }));
    }

    insert = (e) => {
        e.preventDefault();
        this.setState({ disableButton: true });
        const newData = {
            item: {
                nguoiGan: this.props.nguoiGan.shcc,
                nguoiDuocGan: this.state.nguoiDuocGan.shcc,
                tenRole: this.select.current.value,
                ngayBatDau: Number(this.state.ngayBatDau),
                ngayKetThuc: this.ngayKetThuc.current.val(),
                roleGroup: this.props.donVi,
            }
        };
        if (newData.item.tenRole == '') {
            T.notify('Quyền gán bị trống', 'danger');
        } else if (newData.item.ngayKetThuc && newData.item.ngayKetThuc < newData.item.ngayBatDau) {
            T.notify('Ngày kết thúc không được trước ngày cập nhật', 'danger');
        } else {
            this.props.createAssignRole(newData, (data) => {
                if (data.error == null || data.error == undefined) {
                    this.show(this.state.nguoiDuocGan);
                }
            });
        }
    }

    show = (nguoiDuocGan) => {
        this.props.getAssignRole(nguoiDuocGan.shcc, this.props.donVi, items => {
            let list = items.map(item => item.tenRole);
            let diff = this.state.rolesList.filter(role => !list.includes(role.id));
            this.setState({ items, updateRolesList: diff, nguoiDuocGan: nguoiDuocGan, disableButton: false }, () => {
                $(this.select.current).empty();
                $(this.select.current).select2({ data: this.state.updateRolesList, placeholder: 'Lựa chọn quyền' }).val();
                $(this.modal.current).find('.modal-title').html(nguoiDuocGan.hoTen || `${nguoiDuocGan.ho.toLowerCase()} ${nguoiDuocGan.ten.toLowerCase()}`);
                $(this.modal.current).modal('show');
            });
        });
    };

    delete = (e, item) => {
        e.preventDefault();
        T.confirm('Xóa thông tin gán quyền', 'Bạn có chắc bạn muốn xóa thông tin gán quyền này?', true, isConfirm =>
            isConfirm && this.props.deleteAssignRole(item, () => this.show(this.state.nguoiDuocGan)));
    };

    render = () => {
        let table = null;
        if (this.state.items && this.state.items.length) {
            table = (
                <table id='tableItem' className='table table-bordered'>
                    <thead>
                        <tr>
                            <th style={{ width: 'auto' }}>#</th>
                            <th style={{ width: '35%' }}>Quyền</th>
                            <th style={{ width: '35%' }}>Ngày kết thúc</th>
                            <th style={{ width: '30%', whiteSpace: 'nowrap' }}>Người gán</th>
                            <th style={{ width: 'auto' }} nowrap='true'>Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {this.state.items.map((item, index) => (
                            <tr key={index}>
                                <td style={{ textAlign: 'center' }}>{index + 1}</td>
                                <td>{this.state.rolesList.find(role => role.id == item.tenRole) ? this.state.rolesList.find(role => role.id == item.tenRole).text : ''}</td>
                                <td>{item.ngayKetThuc ? new Date(item.ngayKetThuc).ddmmyyyy() : ''}</td>
                                <td style={{ whiteSpace: 'nowrap' }}>
                                    {item.nguoiGan.ho}&nbsp;{item.nguoiGan.ten}<br />
                                    <span style={{ color: 'blue' }}>{item.nguoiGan.shcc ? item.nguoiGan.shcc : ''}<br /></span>
                                </td>

                                <td style={{ textAlign: 'center' }}>
                                    <div className='btn-group'>
                                        <a className='btn btn-danger' href='#' data-toggle='tooltip' title='Xóa' onClick={e => this.delete(e, item)}>
                                            <i className='fa fa-trash-o fa-lg' />
                                        </a>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            );
        }

        return (
            <div className='modal' role='dialog' ref={this.modal}>
                <form className='modal-dialog modal-lg' role='document'>
                    <div className='modal-content'>
                        <div className='modal-header'>
                            <h5>Cập nhật quyền của <span className='modal-title text-capitalize'></span></h5>
                            <button type='button' className='close' data-dismiss='modal' aria-label='Close'>
                                <span aria-hidden='true'>×</span>
                            </button>
                        </div>

                        <div className='modal-body'>
                            <div className='row'>
                                <div className='form-group col-md-6'>
                                    <label htmlFor='fwAssignRoleTenRole'><b>Quyền gán:</b></label>
                                    <select ref={this.select} className='select2-input' multiple={false} placeholder='Lựa chọn quyền' style={{ 'width': '100%' }}>
                                        <optgroup label='Lựa chọn quyền' />
                                    </select>
                                </div>
                                <div className='form-group col-md-5' style={{ fontWeight: 'bold' }}>
                                    <DateInput ref={this.ngayKetThuc} label='Ngày kết thúc:' placeholder='Ngày kết thúc' />
                                </div>
                                <div className='form-group col-md-1 d-flex align-items-end justify-content-end' style={{ paddingLeft: 0 }}>
                                    <button type='button' disabled={this.state.disableButton} className='btn btn-success' data-toggle='tooltip' title='Thêm quyền' onClick={this.insert}>
                                        <i className='fa fa-lg fa-plus' />
                                    </button>
                                </div>
                            </div>
                            {table}
                        </div>
                        <div className='modal-footer'>
                            <button type='button' className='btn btn-secondary' data-dismiss='modal'>Đóng</button>
                        </div>
                    </div>
                </form >
            </div >
        );
    }
}

const mapStateToProps = state => ({ system: state.system, assignRole: state.framework.assignRole });
const mapActionsToProps = { createAssignRole, getRolesList, getAssignRole, updateAssignRole, deleteAssignRole };
export default connect(mapStateToProps, mapActionsToProps, null, { forwardRef: true })(AssignRoleModal);

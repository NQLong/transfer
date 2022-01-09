import React from 'react';
import { connect } from 'react-redux';
import { getStaffEdit, userGetStaff } from 'modules/mdTccb/tccbCanBo/redux';
import { AdminModal, AdminPage, FormDatePicker, FormRichTextBox, FormTextBox, renderTable, TableCell } from 'view/component/AdminPage';
import {
    createToChucKhacStaff, updateToChucKhacStaff, deleteToChucKhacStaff,
    createToChucKhacStaffUser, updateToChucKhacStaffUser, deleteToChucKhacStaffUser
} from './redux';

class ToChucKhacModal extends AdminModal {
    onShow = (item) => {
        let { ma, tenToChuc, ngayThamGia, moTa } = item && item.item ? item.item : {
            ma: null, tenToChuc: '', ngayThamGia: null, moTa: ''
        };
        this.setState({ ma, email: item.email, item, shcc: item.shcc });
        this.tenToChuc.value(tenToChuc ? tenToChuc : '');
        this.ngayThamGia.value(ngayThamGia ? ngayThamGia : null);
        this.moTa.value(moTa ? moTa : '');
    }

    onSubmit = () => {
        const changes = {
            shcc: this.state.shcc,
            email: this.state.email,
            tenToChuc: this.tenToChuc.value(),
            ngayThamGia: Number(this.ngayThamGia.value()),
            moTa: this.moTa.value(),
        };
        if (this.state.ma) {
            this.props.update(this.state.ma, changes, this.hide);
        } else {
            this.props.create(changes, this.hide);
        }
    }

    render = () => this.renderModal({
        title: 'Thông tin tổ chức chính trị - xã hội, nghề nghiệp khác',
        size: 'large',
        body: <div className='row'>
            <FormTextBox className='col-md-6' ref={e => this.tenToChuc = e} label='Tên tổ chức' required />
            <FormDatePicker type='date-mask' className='col-md-6' ref={e => this.ngayThamGia = e} label='Ngày tham gia' />
            <FormRichTextBox className='col-md-12' ref={e => this.moTa = e} label='Mô tả' placeholder='Mô tả nội dung công việc tham gia tổ chức' />
        </div>,
    });
}


class ComponentToChucKhac extends AdminPage {
    shcc = '';
    email = '';

    value = (shcc, email) => {
        this.shcc = shcc;
        this.email = email;
    }

    showModal = (e, item) => {
        e.preventDefault();
        this.modal.show({ item: item, shcc: this.shcc, email: this.email });
    }

    deleteToChucKhac = (e, item) => {
        T.confirm('Xóa thông tin tổ chức tham gia', 'Bạn có chắc bạn muốn xóa mục này?', true, isConfirm =>
            isConfirm && (this.props.userEdit ? this.props.deleteToChucKhacStaffUser(item.ma, () => this.props.userGetStaff(this.email)) : this.props.deleteToChucKhacStaff(item.ma, () => this.props.getStaffEdit(this.shcc))));
        e.preventDefault();
    }

    render() {
        const dataToChucKhac = this.props.userEdit ? this.props.staff?.userItem?.toChucKhac : this.props.staff?.selectedItem?.toChucKhac;
        let permission = {
            write: true,
            read: true,
            delete: true
        };

        const renderTableToChucKhac = (items) => (
            renderTable({
                getDataSource: () => items, stickyHead: false,
                renderHead: () => (
                    <tr>
                        <th style={{ width: '50%' }}>Tên tổ chức</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Ngày tham gia</th>
                        <th style={{ width: '50%' }}>Mô tả nội dung công việc tham gia tổ chức</th>
                        <th style={{ width: 'auto', textAlign: 'center' }}>Thao tác</th>
                    </tr>),
                renderRow: (item, index) => (
                    <tr key={index}>
                        <TableCell type='link' content={item.tenToChuc} onClick={e => this.showModal(e, item)} />
                        <TableCell type='date' style={{ textAlign: 'center' }} content={item.ngayThamGia} dateFormat='dd/mm/yyyy' />
                        <TableCell type='text' content={item.moTa} />
                        <TableCell type='buttons' content={item} permission={permission} onEdit={e => this.showModal(e, item)} onDelete={this.deleteToChucKhac}></TableCell>
                    </tr>)
            })
        );
        return (
            <div>{this.props.label}
                <div className='tile-body'>{dataToChucKhac ? renderTableToChucKhac(dataToChucKhac) : renderTableToChucKhac([])}</div>
                <div className='tile-footer' style={{ textAlign: 'right' }}>
                    <button className='btn btn-info' type='button' onClick={e => this.showModal(e, null)}>
                        <i className='fa fa-fw fa-lg fa-plus' />Thêm tổ chức chính trị - xã hội, nghề nghiệp khác
                    </button>
                </div>
                <ToChucKhacModal ref={e => this.modal = e} shcc={this.shcc} email={this.email}
                    create={this.props.userEdit ? this.props.createToChucKhacStaffUser : this.props.createToChucKhacStaff}
                    update={this.props.userEdit ? this.props.updateToChucKhacStaffUser : this.props.updateToChucKhacStaff} />
            </div>
        );
    }
}
const mapStateToProps = state => ({ staff: state.staff, system: state.system });
const mapActionsToProps = {
    getStaffEdit, userGetStaff, createToChucKhacStaff, updateToChucKhacStaff, deleteToChucKhacStaff, createToChucKhacStaffUser, updateToChucKhacStaffUser, deleteToChucKhacStaffUser
};
export default connect(mapStateToProps, mapActionsToProps, null, { forwardRef: true })(ComponentToChucKhac);
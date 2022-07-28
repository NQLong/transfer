import React from 'react';
import { connect } from 'react-redux';
import { AdminModal, AdminPage, FormDatePicker, FormRichTextBox, FormTextBox, renderTable, TableCell } from 'view/component/AdminPage';
import {
    createToChucKhacStaff, updateToChucKhacStaff, deleteToChucKhacStaff
} from './redux';

class ToChucKhacModal extends AdminModal {
    onShow = (item) => {
        let { ma, tenToChuc, ngayThamGia, moTa } = item && item.item ? item.item : {
            ma: null, tenToChuc: '', ngayThamGia: null, moTa: ''
        };
        this.setState({ ma, item });
        this.tenToChuc.value(tenToChuc ? tenToChuc : '');
        this.ngayThamGia.value(ngayThamGia ? ngayThamGia : null);
        this.moTa.value(moTa ? moTa : '');
    }

    onSubmit = () => {
        const changes = {
            shcc: this.props.shcc,
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

    showModal = (e, item) => {
        e.preventDefault();
        this.modal.show({ item: item, shcc: this.shcc, email: this.email });
    }

    deleteToChucKhac = (e, item) => {
        e.preventDefault();
        T.confirm('Xóa thông tin tổ chức tham gia', 'Bạn có chắc bạn muốn xóa mục này?', true, isConfirm =>
            isConfirm && this.props.deleteToChucKhacStaff(item.ma, item.shcc)
        );
    }

    render() {
        const dataToChucKhac = this.props.staff?.dataStaff?.toChucKhac || [],
            readOnly = this.props.readOnly;
        let isCanBo = this.getUserPermission('staff', ['login']).login, permission = {
            write: isCanBo || readOnly, read: isCanBo || readOnly, delete: isCanBo || readOnly
        };

        const renderTableToChucKhac = (items) => (
            renderTable({
                emptyTable: 'Không tham gia tổ chức nào',
                getDataSource: () => items, stickyHead: false,
                header: 'thead-light',
                renderHead: () => (
                    <tr>
                        <th style={{ width: 'auto' }}>#</th>
                        <th style={{ width: '50%' }}>Tên tổ chức</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Ngày tham gia</th>
                        <th style={{ width: '50%' }}>Mô tả nội dung công việc tham gia tổ chức</th>
                        <th style={{ width: 'auto', textAlign: 'center' }}>Thao tác</th>
                    </tr>),
                renderRow: (item, index) => (
                    <tr key={index}>
                        <TableCell content={index + 1} />
                        <TableCell type='link' content={item.tenToChuc} onClick={e => this.showModal(e, item)} />
                        <TableCell type='date' style={{ textAlign: 'center' }} content={item.ngayThamGia} dateFormat='dd/mm/yyyy' />
                        <TableCell type='text' content={item.moTa} />
                        <TableCell type='buttons' content={item} permission={permission} onEdit={e => this.showModal(e, item)} onDelete={this.deleteToChucKhac}></TableCell>
                    </tr>)
            })
        );
        return (
            <div style={{ marginTop: '1rem' }}>{this.props.label}
                <div style={{ marginTop: '1rem' }} className='tile-body'>{renderTableToChucKhac(dataToChucKhac)}</div>
                {!readOnly && <div className='tile-footer' style={{ textAlign: 'right' }}>
                    <button className='btn btn-info' type='button' onClick={e => this.showModal(e, null)}>
                        <i className='fa fa-fw fa-lg fa-plus' />Thêm
                    </button>
                </div>}
                <ToChucKhacModal ref={e => this.modal = e} shcc={this.props.shcc}
                    create={this.props.createToChucKhacStaff}
                    update={this.props.updateToChucKhacStaff} readOnly={readOnly} />
            </div>
        );
    }
}
const mapStateToProps = state => ({ staff: state.tccb.staff, system: state.system });
const mapActionsToProps = {
    createToChucKhacStaff, updateToChucKhacStaff, deleteToChucKhacStaff
};
export default connect(mapStateToProps, mapActionsToProps)(ComponentToChucKhac);
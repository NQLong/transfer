import React from 'react';
import { connect } from 'react-redux';
import { AdminModal, AdminPage, FormRichTextBox, FormTextBox, renderTable, TableCell } from 'view/component/AdminPage';
import { DateInput } from 'view/component/Input';
import T from 'view/js/common';
import { createQtHuongDanLVStaffUser, createQtHuongDanLVStaff, updateQtHuongDanLVStaff, updateQtHuongDanLVStaffUser, deleteQtHuongDanLVStaff, deleteQtHuongDanLVStaffUser } from './redux';

class EditModal extends AdminModal {
    state = {
        id: null,
        shcc: '', email: ''
    }

    onShow = (item) => {
        let { id, hoTen, tenLuanVan, namTotNghiep, sanPham, bacDaoTao } = item && item.item ? item.item : { id: null, hoTen: '', tenLuanVan: '', namTotNghiep: '', sanPham: '', bacDaoTao: '' };
        this.setState({ shcc: item.shcc, id, email: item.email });
        setTimeout(() => {
            this.hoTen.value(hoTen);
            this.tenLuanVan.value(tenLuanVan);
            this.namTotNghiep.setVal(new Date(namTotNghiep.toString()));
            this.sanPham.value(sanPham);
            this.bacDaoTao.value(bacDaoTao);
        }, 500);
    }

    onSubmit = () => {
        const changes = {
            shcc: this.state.shcc,
            email: this.state.email,
            hoTen: this.hoTen.value(),
            tenLuanVan: this.tenLuanVan.value(),
            namTotNghiep: new Date(this.namTotNghiep.getVal()).getFullYear(),
            sanPham: this.sanPham.value(),
            bacDaoTao: this.bacDaoTao.value()
        };
        if (!changes.hoTen) {
            T.notify('Họ tên đối tượng hướng dẫn bị trống!', 'danger');
            this.hoTen.focus();
        } else if (!changes.tenLuanVan) {
            T.notify('Tên luận văn, luận án bị trống!', 'danger');
            this.tenLuanVan.focus();
        } else if (!changes.namTotNghiep) {
            T.notify('Năm tốt nghiệp bị trống!', 'danger');
            this.namTotNghiep.focus();
        } else if (!changes.bacDaoTao) {
            T.notify('Bậc đào tạo bị trống!', 'danger');
            this.bacDaoTao.focus();
        } else this.state.id ? this.props.update(this.state.id, changes, this.hide, true) : this.props.create(changes, this.hide, true);
    }

    render = () => this.renderModal({
        title: 'Thông tin hướng dẫn luận văn',
        size: 'large',
        body: <div className='row'>
            <FormRichTextBox className='col-12' ref={e => this.hoTen = e} label={'Họ tên sinh viên, học viên cao học, nghiên cứu sinh'} required />
            <FormTextBox className='col-12' ref={e => this.tenLuanVan = e} label={'Tên luận văn, luận án'} type='text' required />
            <div className='form-group col-md-6'><DateInput ref={e => this.namTotNghiep = e} label='Năm tốt nghiệp' type='year' required /></div>
            <FormTextBox className='col-md-6' ref={e => this.bacDaoTao = e} label={'Bậc đào tạo'} type='text' required />
            <FormTextBox className='col-md-6' ref={e => this.sanPham = e} label={'Sản phẩm'} type='text' />
        </div>,
    });
}
class ComponentHDLV extends AdminPage {
    state = { shcc: '', email: '' };
    value = (shcc, email) => {
        this.setState({ shcc, email });
    }

    showModal = (e, item, shcc, email) => {
        e.preventDefault();
        this.modal.show({ item: item, shcc: shcc, email: email });
    }

    deleteHuongDanLuanVan = (e, item) => {
        T.confirm('Xóa thông tin quá trình hướng dẫn luận văn', 'Bạn có chắc bạn muốn xóa quá trình này?', true, isConfirm =>
            isConfirm && (this.props.userEdit ? this.props.deleteQtHuongDanLVStaffUser(item.id, this.state.email) : this.props.deleteQtHuongDanLVStaff(item.id, true, this.state.shcc)));
        e.preventDefault();
    }


    render = () => {
        let dataHDLV = !this.props.userEdit ? this.props.staff?.selectedItem?.huongDanLuanVan : this.props.staff?.userItem?.huongDanLuanVan;
        const permission = {
            write: true,
            read: true,
            delete: true
        };

        const renderTableHDLV = (items) => (
            renderTable({
                getDataSource: () => items, stickyHead: false,
                renderHead: () => (
                    <tr>
                        <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                        <th style={{ width: '30%' }}>Họ tên sinh viên</th>
                        <th style={{ width: '70%', }}>Tên luận văn, luận án</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Năm tốt nghiệp</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Bậc đào tạo</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Sản phẩm</th>
                        <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>Thao tác</th>
                    </tr>),
                renderRow: (item, index) => (
                    <tr key={index}>
                        <TableCell type='number' style={{ textAlign: 'right' }} content={index + 1} />
                        <TableCell type='link' style={{ whiteSpace: 'nowrap' }} content={item.hoTen} onClick={() => this.modal.show({ item, shcc: this.state.shcc, email: this.state.email })} />
                        <TableCell type='text' content={item.tenLuanVan} />
                        <TableCell type='text' content={item.namTotNghiep} style={{ textAlign: 'center' }} />
                        <TableCell type='text' content={item.bacDaoTao} />
                        <TableCell type='text' content={item.sanPham} />
                        <TableCell type='buttons' content={item} permission={permission} onEdit={() => this.modal.show({ item, shcc: this.state.shcc, email: this.state.email })}
                            onDelete={this.deleteHuongDanLuanVan}></TableCell>
                    </tr>)
            })
        );

        return (
            <div className='tile'>
                <h3 className='tile-title'>Hướng dẫn sinh viên, học viên cao học, nghiên cứu sinh</h3>
                <div className='tile-body'>
                    {
                        dataHDLV && renderTableHDLV(dataHDLV)
                    }
                    {
                        <div className='tile-footer' style={{ textAlign: 'right' }}>
                            <button className='btn btn-info' type='button' onClick={e => this.showModal(e, null, this.state.shcc, this.state.email)}>
                                <i className='fa fa-fw fa-lg fa-plus' />Thêm thông tin hướng dẫn
                            </button>
                        </div>
                    }
                    <EditModal ref={e => this.modal = e} permission={permission} readOnly={false}
                        create={this.props.userEdit ? this.props.createQtHuongDanLVStaffUser : this.props.createQtHuongDanLVStaff}
                        update={this.props.userEdit ? this.props.updateQtHuongDanLVStaff : this.props.updateQtHuongDanLVStaffUser}
                    />
                </div>
            </div>
        );

    }
}
const mapStateToProps = state => ({ system: state.system, staff: state.staff });
const mapActionsToProps = {
    createQtHuongDanLVStaffUser, createQtHuongDanLVStaff, updateQtHuongDanLVStaff, updateQtHuongDanLVStaffUser, deleteQtHuongDanLVStaff, deleteQtHuongDanLVStaffUser
};
export default connect(mapStateToProps, mapActionsToProps, null, { forwardRef: true })(ComponentHDLV);
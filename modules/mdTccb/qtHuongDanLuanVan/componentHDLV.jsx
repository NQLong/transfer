import React from 'react';
import { connect } from 'react-redux';
import { AdminModal, AdminPage, FormRichTextBox, FormTextBox, renderTable, TableCell } from 'view/component/AdminPage';
import FileBox from 'view/component/FileBox';
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
            this.hoTen.value(hoTen ? hoTen : '');
            this.tenLuanVan.value(tenLuanVan ? tenLuanVan : '');
            this.namTotNghiep.setVal(new Date(namTotNghiep.toString()));
            this.sanPham.value(sanPham ? sanPham : '');
            this.bacDaoTao.value(bacDaoTao ? bacDaoTao : '');
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

class UploadData extends AdminModal {
    state = { message: '', displayState: 'import', qtHDLVData: [] };

    downloadSample = e => {
        e.preventDefault();
        T.download('/api/qua-trinh/hdlv/download-template');
    }

    onSuccess = (response) => {
        if (response.error) {
            T.notify(response.error, 'danger');
        } else
            this.setState({
                qtHDLVData: response.items,
                message: <p className='text-center' style={{ color: 'blue' }}>{response.items.length} hàng được tải lên thành công</p>,
                displayState: 'data'
            });
    };

    onError = () => {
        T.notify('Quá trình upload dữ liệu bị lỗi!', 'danger');
    }

    onSubmit = () => {
        this.state.qtHDLVData.forEach(i => {
            this.props.create(Object.assign(i,
                {
                    shcc: this.props.shcc,
                    email: this.props.email,
                    namTotNghiep: parseInt(i.namTotNghiep)
                }), () => {
                    this.setState({ message: '', displayState: 'import', qtHDLVData: [] });
                    this.hide();
                }, true);
        });
    }

    render = () => {
        const { qtHDLVData, displayState } = this.state;

        const renderData =
            renderTable({
                getDataSource: () => qtHDLVData, stickyHead: true,
                renderHead: () => (
                    <tr>
                        <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                        <th style={{ width: '30%' }}>Họ tên sinh viên</th>
                        <th style={{ width: '70%', }}>Tên luận văn, luận án</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Năm tốt nghiệp</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Bậc đào tạo</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Sản phẩm</th>
                    </tr>),
                renderRow: (item, index) => (
                    <tr key={index}>
                        <TableCell type='number' style={{ textAlign: 'right' }} content={index + 1} />
                        <TableCell type='link' style={{ whiteSpace: 'nowrap' }} content={item.hoTen} onClick={() => this.modal.show({ item, shcc: this.state.shcc, email: this.state.email })} />
                        <TableCell type='text' content={item.tenLuanVan} />
                        <TableCell type='text' content={item.namTotNghiep} style={{ textAlign: 'center' }} />
                        <TableCell type='text' content={item.bacDaoTao} />
                        <TableCell type='text' content={item.sanPham} style={{ whiteSpace: 'nowrap' }} />
                    </tr>)
            });

        return this.renderModal({
            title: 'Upload dữ liệu hướng dẫn luận văn',
            size: 'large',
            body: <div className='row'>
                <div className='col-md-12'>
                    <FileBox postUrl='/user/upload' uploadType='HDLVDataFile' userData='HDLVDataFile' accept='.csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel'
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

class ComponentHDLV extends AdminPage {
    state = { shcc: '', email: '' };
    value = (shcc, email) => {
        this.setState({ shcc, email });
    }

    showModal = (e, item, shcc, email) => {
        e.preventDefault();
        this.modal.show({ item: item, shcc: shcc, email: email });
    }

    showModalUpload = (e) => {
        e.preventDefault();
        this.modalUpload.show();
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
                        <TableCell type='text' content={item.sanPham} style={{ whiteSpace: 'nowrap' }} />
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
                        <div className='tile-footer' style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <button className='btn btn-success' type='button' onClick={e => this.showModalUpload(e)}>
                                <i className='fa fa-fw fa-lg fa-upload' />Upload dữ liệu
                            </button>
                            <button className='btn btn-info' type='button' onClick={e => this.showModal(e, null, this.state.shcc, this.state.email)}>
                                <i className='fa fa-fw fa-lg fa-plus' />Thêm thông tin hướng dẫn
                            </button>
                        </div>
                    }
                    <EditModal ref={e => this.modal = e} permission={permission} readOnly={false}
                        create={this.props.userEdit ? this.props.createQtHuongDanLVStaffUser : this.props.createQtHuongDanLVStaff}
                        update={this.props.userEdit ? this.props.updateQtHuongDanLVStaffUser : this.props.updateQtHuongDanLVStaff}
                    />
                    <UploadData ref={e => this.modalUpload = e}
                        shcc={this.state.shcc} email={this.state.email} userEdit={this.props.userEdit}
                        create={this.props.userEdit ? this.props.createQtHuongDanLVStaffUser : this.props.createQtHuongDanLVStaff}
                        renderTable={renderTableHDLV} />
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
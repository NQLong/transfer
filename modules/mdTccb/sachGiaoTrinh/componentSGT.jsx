import React from 'react';
import { connect } from 'react-redux';
import { AdminModal, AdminPage, FormSelect, FormTextBox, renderTable, TableCell } from 'view/component/AdminPage';
import FileBox from 'view/component/FileBox';
import { DateInput } from 'view/component/Input';
import { createSachGTStaff, createSachGTStaffUser, updateSachGTStaff, updateSachGTStaffUser, deleteSachGTStaff, deleteSachGTStaffUser } from './redux';

const quocTeList = [
    { id: 0, text: 'Xuât bản trong nước' },
    { id: 1, text: 'Xuất bản quốc tế' },
    { id: 2, text: 'Xuất bản trong và ngoài nước' }
];
class EditModal extends AdminModal {
    state = {
        id: null,
        shcc: '', email: ''
    }

    onShow = (item) => {
        let { id, ten, theLoai, nhaSanXuat, namSanXuat, chuBien, sanPham, butDanh, quocTe } = item && item.item ? item.item : {
            id: null, ten: '', theLoai: '', nhaSanXuat: '', namSanXuat: null, chuBien: '', sanPham: '', butDanh: '', quocTe: 0
        };
        this.setState({ shcc: item.shcc, id, email: item.email });
        setTimeout(() => {
            this.ten.value(ten);
            this.theLoai.value(theLoai ? theLoai : '');
            if (namSanXuat) this.namSanXuat.setVal(new Date(namSanXuat.toString()));
            this.nhaSanXuat.value(nhaSanXuat ? nhaSanXuat : '');
            this.chuBien.value(chuBien ? chuBien : '');
            this.sanPham.value(sanPham ? sanPham : '');
            this.butDanh.value(butDanh ? butDanh : '');
            this.quocTe.value(quocTe);
        }, 500);
    }

    onSubmit = () => {
        const changes = {
            shcc: this.state.shcc,
            email: this.state.email,
            ten: this.ten.value(),
            theLoai: this.theLoai.value(),
            namSanXuat: this.namSanXuat.getVal() ? new Date(this.namSanXuat.getVal()).getFullYear() : null,
            nhaSanXuat: this.nhaSanXuat.value(),
            chuBien: this.chuBien.value(),
            sanPham: this.sanPham.value(),
            butDanh: this.butDanh.value(),
            quocTe: this.quocTe.value()
        };
        if (!changes.ten) {
            T.notify('Tên bị trống!', 'danger');
            this.ten.focus();
        } else if (!changes.nhaSanXuat) {
            T.notify('Nhà sản xuất bị trống!', 'danger');
            this.nhaSanXuat.focus();
        } else if (!changes.theLoai) {
            T.notify('Thể loại bị trống!', 'danger');
            this.theLoai.focus();
        } else if (!changes.namSanXuat) {
            T.notify('Năm xuất bản bị trống!', 'danger');
            this.theLoai.focus();
        } else if (!changes.quocTe) {
            T.notify('Phạm vi xuất bản bị trống!', 'danger');
            this.quocTe.focus();
        } else this.state.id ? this.props.update(this.state.id, changes, this.hide, true) : this.props.create(changes, this.hide, true);
    }

    render = () => this.renderModal({
        title: 'Thông tin sách, giáo trình',
        size: 'large',
        body: <div className='row'>
            <FormTextBox className='col-12' ref={e => this.ten = e} label={'Tên sách, giáo trình'} type='text' required />
            <FormTextBox className='col-6' ref={e => this.theLoai = e} label={'Thể loại'} type='text' required />
            <FormTextBox className='col-6' ref={e => this.nhaSanXuat = e} label={'Nhà sản xuất, số hiệu ISBN'} type='text' required />
            <div className='form-group col-md-6'><DateInput ref={e => this.namSanXuat = e} label='Năm xuất bản' type='year' required /></div>
            <FormTextBox className='col-md-6' ref={e => this.chuBien = e} label={'Chủ biên, đồng chủ biên'} type='text' />
            <FormTextBox className='col-md-6' ref={e => this.sanPham = e} label={'Sản phẩm'} type='text' />
            <FormTextBox className='col-md-6' ref={e => this.butDanh = e} label={'Bút danh'} type='text' />
            <FormSelect className='col-md-6' ref={e => this.quocTe = e} label='Phạm vi xuất bản' data={quocTeList} required />
        </div>,
    });
}
class UploadData extends AdminModal {
    state = { message: '', displayState: 'import', sgtData: [] };

    downloadSample = e => {
        e.preventDefault();
        T.download('/api/user/sach-giao-trinh/download-template');
    }

    onSuccess = (response) => {
        if (response.error) {
            T.notify(response.error, 'danger');
        } else
            this.setState({
                sgtData: response.items,
                message: <p className='text-center' style={{ color: 'blue' }}>{response.items.length} hàng được tải lên thành công, vui lòng bấm <b>Lưu</b> để chỉnh sửa</p>,
                displayState: 'data'
            });
    };

    onError = () => {
        T.notify('Quá trình upload dữ liệu bị lỗi!', 'danger');
    }

    onSubmit = () => {
        this.state.sgtData.forEach(i => {
            this.props.create(Object.assign(i,
                {
                    shcc: this.props.shcc,
                    email: this.props.email,
                    namSanXuat: parseInt(i.namSanXuat)
                }), () => {
                    this.setState({ message: '', displayState: 'import', sgtData: [] });
                    this.hide();
                }, true);
        });
    }

    render = () => {
        const { sgtData, displayState } = this.state;

        const renderData =
            renderTable({
                getDataSource: () => sgtData, stickyHead: true,
                renderHead: () => (
                    <tr>
                        <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                        <th style={{ width: '70%', whiteSpace: 'nowrap' }}>Tên sách, giáo trình</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Thể loại</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Nhà xuất bản, số hiệu ISBN</th>
                        <th style={{ width: '30%', whiteSpace: 'nowrap' }}>Xuất bản</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Chủ biên</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Sản phẩm</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Bút danh</th>
                    </tr>),
                renderRow: (item, index) => (
                    <tr key={index}>
                          <TableCell type='number' style={{ textAlign: 'right' }} content={index + 1} />
                        <TableCell type='link' content={item.ten} onClick={() => this.modal.show({ email: this.state.email, item: item, shcc: this.state.shcc })} />
                        <TableCell type='text' content={item.theLoai} style={{ whiteSpace: 'nowrap' }} />
                        <TableCell type='text' content={item.nhaSanXuat} style={{ whiteSpace: 'nowrap' }} />
                        <TableCell type='text' content={
                            <>
                                <span><b>{item.quocTe != null ? quocTeList[item.quocTe].text : null}</b></span><br />
                                <span>Năm: <b>{item.namSanXuat}</b></span>
                            </>
                        } style={{ whiteSpace: 'nowrap' }} />
                        <TableCell type='text' content={item.chuBien} style={{ whiteSpace: 'nowrap' }} />
                        <TableCell type='text' content={item.sanPham} style={{ whiteSpace: 'nowrap' }} />
                        <TableCell type='text' content={item.butDanh} style={{ whiteSpace: 'nowrap' }} />
                    </tr>)
            });

        return this.renderModal({
            title: 'Upload dữ liệu sách, giáo trình',
            size: 'large',
            body: <div className='row'>
                <div className='col-md-12'>
                    <FileBox postUrl='/user/upload' uploadType='SGTDataFile' userData='SGTDataFile' accept='.csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel'
                        style={{ margin: '0 auto', display: displayState == 'import' ? 'block' : 'none' }}
                        success={this.onSuccess} error={this.onError} />
                    {this.state.message}
                    <div style={{ display: displayState == 'import' ? 'none' : 'block' }}>{renderData}</div>
                    <a href='download-mau-du-lieu-nckh' onClick={e => this.downloadSample(e)} className='text-success mt-3 text-center' style={{ display: 'block', width: '100%' }}>Tải file mẫu</a>
                </div>
            </div>,
            buttons:
                <button type='button' className='btn btn-success' onClick={e => { e.preventDefault(); this.setState({ message: '', displayState: 'import', sgtData: [] }); }}>
                    <i className='fa fa-fw fa-lg fa-refresh' />Tải lại
                </button>
        });
    }

}

class ComponentSGT extends AdminPage {
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

    deleteSachGT = (e, item) => {
        T.confirm('Xóa thông tin sách, giáo trình này', 'Bạn có chắc bạn muốn xóa thông tin này?', true, isConfirm =>
            isConfirm && (this.props.userEdit ? this.props.deleteSachGTStaffUser(item.id, this.state.email) : this.props.deleteSachGTStaff(item.id, true, this.state.shcc)));
        e.preventDefault();
    }

    render = () => {
        let dataSGT = !this.props.userEdit ? this.props.staff?.selectedItem?.sachGiaoTrinh : this.props.staff?.userItem?.sachGiaoTrinh;
        const permission = {
            write: true,
            read: true,
            delete: true
        };

        const renderTableSGT = (items) => (
            renderTable({
                getDataSource: () => items, stickyHead: false,
                renderHead: () => (
                    <tr>
                        <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                        <th style={{ width: '70%' }}>Tên sách, giáo trình</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Thể loại</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Nhà xuất bản, số hiệu ISBN</th>
                        <th style={{ width: '30%', whiteSpace: 'nowrap' }}>Xuất bản</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Chủ biên</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Sản phẩm</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Bút danh</th>
                        <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>Thao tác</th>
                    </tr>),
                renderRow: (item, index) => (
                    <tr key={index}>
                        <TableCell type='number' style={{ textAlign: 'right' }} content={index + 1} />
                        <TableCell type='link' content={item.ten} onClick={() => this.modal.show({ email: this.state.email, item: item, shcc: this.state.shcc })} />
                        <TableCell type='text' content={item.theLoai} style={{ whiteSpace: 'nowrap' }} />
                        <TableCell type='text' content={item.nhaSanXuat} style={{ whiteSpace: 'nowrap' }} />
                        <TableCell type='text' content={
                            <>
                                <span><b>{item.quocTe != null ? quocTeList[item.quocTe].text : null}</b></span><br />
                                <span>Năm: <b>{item.namSanXuat}</b></span>
                            </>
                        } style={{ whiteSpace: 'nowrap' }} />
                        <TableCell type='text' content={item.chuBien} style={{ whiteSpace: 'nowrap' }} />
                        <TableCell type='text' content={item.sanPham} style={{ whiteSpace: 'nowrap' }} />
                        <TableCell type='text' content={item.butDanh} style={{ whiteSpace: 'nowrap' }} />
                        <TableCell type='buttons' content={item} permission={permission}
                            onEdit={() => this.modal.show({ email: this.state.email, item: item, shcc: this.state.shcc })} onDelete={this.deleteSachGT}></TableCell>
                    </tr>)
            })
        );
        return (
            <div className='tile'>
                <h3 className='tile-title'>Thông tin sách, giáo trình</h3>
                <div className='tile-body'>
                    {
                        dataSGT && renderTableSGT(dataSGT)
                    }
                    {<div className='tile-footer' style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <button className='btn btn-success' type='button' onClick={e => this.showModalUpload(e)}>
                            <i className='fa fa-fw fa-lg fa-upload' />Upload dữ liệu
                        </button>
                        <button className='btn btn-info' type='button' onClick={e => this.showModal(e, null, this.state.shcc, this.state.email)}>
                            <i className='fa fa-fw fa-lg fa-plus' />Thêm thông tin sách, giáo trình
                        </button>
                    </div>
                    }
                    <EditModal ref={e => this.modal = e} permission={permission} readOnly={false}
                        create={this.props.userEdit ? this.props.createSachGTStaffUser : this.props.createSachGTStaff}
                        update={this.props.userEdit ? this.props.updateSachGTStaffUser : this.props.updateSachGTStaff}
                    />
                    <UploadData ref={e => this.modalUpload = e}
                        shcc={this.state.shcc} email={this.state.email} userEdit={this.props.userEdit}
                        create={this.props.userEdit ? this.props.createSachGTStaffUser : this.props.createSachGTStaff}
                        renderTable={renderTableSGT} />
                </div>
            </div>
        );

    }
}
const mapStateToProps = state => ({ system: state.system, staff: state.staff });
const mapActionsToProps = {
    createSachGTStaff, createSachGTStaffUser, updateSachGTStaff, updateSachGTStaffUser, deleteSachGTStaff, deleteSachGTStaffUser
};
export default connect(mapStateToProps, mapActionsToProps, null, { forwardRef: true })(ComponentSGT);
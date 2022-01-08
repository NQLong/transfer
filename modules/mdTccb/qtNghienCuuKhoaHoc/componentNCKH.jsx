import React from 'react';
import { connect } from 'react-redux';
import { AdminModal, AdminPage, FormTextBox, renderTable, TableCell } from 'view/component/AdminPage';
import Dropdown from 'view/component/Dropdown';
import { DateInput } from 'view/component/Input';
import { createQtNckhStaff, createQtNckhStaffUser, updateQtNckhStaff, updateQtNckhStaffUser, deleteQtNckhStaff, deleteQtNckhStaffUser } from './redux';

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
class NckhModal extends AdminModal {
    state = {
        id: null,
        shcc: '',
        email: '',
        batDau: '',
        ketThuc: '',
        batDauType: 'dd/mm/yyyy',
        ketThucType: 'dd/mm/yyyy',
    }

    onShow = (item) => {
        let { id, batDauType, ketThucType, batDau, ketThuc, tenDeTai, maSoCapQuanLy, kinhPhi, vaiTro, ngayNghiemThu, ketQua, ngayNghiemThuType, thoiGian }
            = item && item.item ? item.item :
                {
                    id: null, batDauType: 'dd/mm/yyyy', ketThucType: 'dd/mm/yyyy', batDau: null, ketThuc: null, tenDeTai: '',
                    maSoCapQuanLy: '', kinhPhi: '', vaiTro: '', ngayNghiemThu: null, ketQua: '', ngayNghiemThuType: 'dd/mm/yyyy', thoiGian: null
                };
        this.setState({
            email: item.email,
            batDauType: batDauType ? batDauType : 'dd/mm/yyyy',
            ketThucType: ketThuc ? ketThucType : 'dd/mm/yyyy',
            ngayNghiemThuType: ngayNghiemThuType ? ngayNghiemThuType : 'dd/mm/yyyy',
            shcc: item.shcc, id, batDau, ketThuc, ngayNghiemThu
        });
        setTimeout(() => {
            this.batDauType.setText({ text: batDauType ? batDauType : 'dd/mm/yyyy' });
            this.ketThucType.setText({ text: ketThucType ? ketThucType : 'dd/mm/yyyy' });
            this.ngayNghiemThuType.setText({ text: ngayNghiemThuType ? ngayNghiemThuType : 'dd/mm/yyyy' });
            this.batDau.setVal(batDau ? batDau : '');
            this.ketThuc.setVal(ketThuc ? ketThuc : '');
            this.tenDeTai.value(tenDeTai);
            this.maSoCapQuanLy.value(maSoCapQuanLy ? maSoCapQuanLy : '');
            this.kinhPhi.value(kinhPhi ? kinhPhi : '');
            this.thoiGian.value(thoiGian);
            this.vaiTro.value(vaiTro ? vaiTro : '');
            this.ngayNghiemThu.setVal(ngayNghiemThu ? ngayNghiemThu : '');
            this.ketQua.value(ketQua ? ketQua : '');
        }, 500);
    }

    onSubmit = () => {
        const changes = {
            email: this.state.email,
            shcc: this.state.shcc,
            batDau: this.batDau.getVal(),
            ketThuc: this.ketThuc.getVal(),
            batDauType: this.state.batDauType,
            ketThucType: this.state.ketThucType,
            tenDeTai: this.tenDeTai.value(),
            maSoCapQuanLy: this.maSoCapQuanLy.value(),
            kinhPhi: this.kinhPhi.value(),
            thoiGian: this.thoiGian.value(),
            vaiTro: this.vaiTro.value(),
            ketQua: this.ketQua.value(),
            ngayNghiemThu: this.ngayNghiemThu.getVal(),
            ngayNghiemThuType: this.state.ngayNghiemThuType,
        };
        if (!changes.tenDeTai) {
            T.notify('Tên đề tài bị trống!', 'danger');
            this.tenDeTai.focus();
        } else if (!changes.maSoCapQuanLy) {
            T.notify('Mã số và cấp quản lý bị trống!', 'danger');
            this.maSoCapQuanLy.focus();
        }
        else if (!changes.batDau) {
            T.notify('Thời gian bắt đầu bị trống!', 'danger');
            this.batDau.focus();
        }
        else if (!changes.vaiTro) {
            T.notify('Vai trò bị trống!', 'danger');
            this.vaiTro.focus();
        }
        else if (this.state.id) {
            this.props.update(this.state.id, changes, this.hide);
        } else {
            this.props.create(changes, this.hide);
        }
    }

    render = () => this.renderModal({
        title: 'Thông tin nghiên cứu khoa học',
        size: 'large',
        body: <div className='row'>
            <FormTextBox className='col-12' ref={e => this.tenDeTai = e} label={'Tên đề tài'} type='text' required />
            <FormTextBox className='col-md-4' ref={e => this.maSoCapQuanLy = e} label={'Mã số và cấp quản lý'} type='text' required />
            <FormTextBox className='col-md-4' ref={e => this.thoiGian = e} label={'Thời gian thực hiện (tháng)'} type='number' />
            <FormTextBox className='col-md-4' ref={e => this.kinhPhi = e} label={'Kinh phí'} type='text' />
            <div className='form-group col-md-6'><DateInput ref={e => this.batDau = e} placeholder='Thời gian bắt đầu'
                label={
                    <div style={{ display: 'flex' }}>Thời gian bắt đầu (định dạng:&nbsp; <Dropdown ref={e => this.batDauType = e}
                        items={[...Object.keys(EnumDateType).map(key => EnumDateType[key].text)]}
                        onSelected={item => this.setState({ batDauType: item })} />)&nbsp;<span style={{ color: 'red' }}> *</span></div>
                }
                type={this.state.batDauType ? typeMapper[this.state.batDauType] : null} /></div>
            <div className='form-group col-md-6'><DateInput ref={e => this.ketThuc = e} placeholder='Thời gian kết thúc'
                label={
                    <div style={{ display: 'flex' }}>Thời gian kết thúc (định dạng:&nbsp; <Dropdown ref={e => this.ketThucType = e}
                        items={[...Object.keys(EnumDateType).map(key => EnumDateType[key].text)]}
                        onSelected={item => this.setState({ ketThucType: item })} />)</div>
                }
                type={this.state.ketThucType ? typeMapper[this.state.ketThucType] : null} /></div>
            <FormTextBox className='col-md-6' ref={e => this.vaiTro = e} label={'Vai trò'} type='text' required />
            <div className='form-group col-md-6'><DateInput ref={e => this.ngayNghiemThu = e} placeholder='Thời gian kết thúc'
                label={
                    <div style={{ display: 'flex' }}>Thời gian nghiệm thu (định dạng:&nbsp; <Dropdown ref={e => this.ngayNghiemThuType = e}
                        items={[...Object.keys(EnumDateType).map(key => EnumDateType[key].text)]}
                        onSelected={item => this.setState({ ngayNghiemThuType: item })} />)</div>
                }
                type={this.state.ngayNghiemThuType ? typeMapper[this.state.ngayNghiemThuType] : null} /></div>
            <FormTextBox className='col-md-12' ref={e => this.ketQua = e} label={'Kết quả'} type='text' />

        </div>,
    });
}

class ComponentNCKH extends AdminPage {
    state = { shcc: '', email: '' };
    value = (shcc, email) => {
        this.setState({ shcc: shcc, email: email });
    }

    showModal = (e, item, shcc, email) => {
        e.preventDefault();
        this.modal.show({ item: item, shcc: shcc, email: email });
    }

    deleteNckh = (e, item) => {
        T.confirm('Xóa thông tin quá trình nghiên cứu khoa học', 'Bạn có chắc bạn muốn xóa quá trình này?', true, isConfirm =>
            isConfirm && (this.props.userEdit ? this.props.deleteQtNckhStaffUser(item.id, this.state.email) : this.props.deleteQtNckhStaff(item.id, this.state.shcc)));
        e.preventDefault();
    }

    render = () => {
        let dataNCKH = !this.props.userEdit ? this.props.staff?.selectedItem?.nghienCuuKhoaHoc : this.props.staff?.userItem?.nghienCuuKhoaHoc;
        const permission = {
            write: true,
            read: true,
            delete: true
        };

        const renderTableNCKH = (items) => (
            renderTable({
                getDataSource: () => items, stickyHead: false,
                renderHead: () => (
                    <tr>
                        <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                        <th style={{ width: '100%' }}>Tên đề tài</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Mã số và cấp quản lý</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Thời gian</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Kinh phí</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Vai trò</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Kết quả</th>
                        <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>Thao tác</th>
                    </tr>),
                renderRow: (item, index) => (
                    <tr key={index}>
                        <TableCell type='number' style={{ textAlign: 'right' }} content={index + 1} />
                        <TableCell type='link' content={item.tenDeTai} onClick={() => this.modal.show({ email: this.state.email, item: item, shcc: this.state.shcc })} />
                        <TableCell type='text' content={item.maSoCapQuanLy} />
                        <TableCell type='text' content={(
                            <>
                                <span>Bắt đầu: <b>{T.dateToText(item.batDau, item.batDauType ? item.batDauType : 'dd/mm/yyyy')}</b></span> <br />
                                {item.ketThuc && <span>Kết thúc: <b>{T.dateToText(item.ketThuc, item.ketThucType ? item.ketThucType : 'dd/mm/yyyy')}</b></span>}<br/>
                                {item.ngayNghiemThu && <span>Nghiệm thu: <b>{T.dateToText(item.ngayNghiemThu, item.ngayNghiemThuType ? item.ngayNghiemThuType : 'dd/mm/yyyy')}</b></span>}
                            </>
                        )} style={{ whiteSpace: 'nowrap' }}/>
                        <TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={item.kinhPhi} />
                        <TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={item.vaiTro} />
                        <TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={item.ketQua} />
                        <TableCell type='buttons' content={item} permission={permission}
                            onEdit={() => this.modal.show({ email: this.state.email, item: item, shcc: this.state.shcc })}
                            onDelete={this.deleteNckh}></TableCell>
                    </tr>)
            })
        );

        return (
            <div className='tile'>
                <h3 className='tile-title'>Thông tin nghiên cứu khoa học</h3>
                <div className='tile-body'>
                    {
                        dataNCKH && renderTableNCKH(dataNCKH)
                    }
                    {<div className='tile-footer' style={{ textAlign: 'right' }}>
                        <button className='btn btn-info' type='button' onClick={e => this.showModal(e, null, this.state.shcc, this.state.email)}>
                            <i className='fa fa-fw fa-lg fa-plus' />Thêm thông tin nghiên cứu khoa học
                        </button>
                    </div>
                    }
                    <NckhModal ref={e => this.modal = e} userEdit={this.props.userEdit}
                        create={this.props.userEdit ? this.props.createQtNckhStaffUser : this.props.createQtNckhStaff}
                        update={this.props.userEdit ? this.props.updateQtNckhStaffUser : this.props.updateQtNckhStaff}
                    />
                </div>
            </div>
        );
    }
}

const mapStateToProps = state => ({ system: state.system, staff: state.staff });
const mapActionsToProps = {
    createQtNckhStaff, createQtNckhStaffUser, updateQtNckhStaff, updateQtNckhStaffUser, deleteQtNckhStaff, deleteQtNckhStaffUser,
};
export default connect(mapStateToProps, mapActionsToProps, null, { forwardRef: true })(ComponentNCKH);
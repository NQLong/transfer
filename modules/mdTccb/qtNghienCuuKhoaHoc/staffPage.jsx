import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { AdminPage, TableCell, renderTable, AdminModal, FormTextBox } from 'view/component/AdminPage';
import {
    getQtNghienCuuKhoaHocPage, createQtNckhStaffUser, updateQtNckhStaffUser, deleteQtNckhStaffUser, getQtNckhUserAll
}
    from './redux';

import { DateInput } from 'view/component/Input';
import Dropdown from 'view/component/Dropdown';

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
            this.props.update(this.state.id, changes, this.hide, true);
        } else {
            this.props.create(changes, this.hide, true);
        }
    }

    render = () => {
        const readOnly = this.props.readOnly ? true : false;
        return this.renderModal({
            title: 'Thông tin nghiên cứu khoa học',
            size: 'large',
            body: <div className='row'>
                <FormTextBox className='col-12' ref={e => this.tenDeTai = e} label={'Tên đề tài'} type='text' readOnly={readOnly} required />
                <FormTextBox className='col-md-4' ref={e => this.maSoCapQuanLy = e} label={'Mã số và cấp quản lý'} type='text' readOnly={readOnly} required />
                <FormTextBox className='col-md-4' ref={e => this.thoiGian = e} label={'Thời gian thực hiện (tháng)'} type='number' readOnly={readOnly} />
                <FormTextBox className='col-md-4' ref={e => this.kinhPhi = e} label={'Kinh phí'} type='text' readOnly={readOnly} />
                <div className='form-group col-md-6'><DateInput ref={e => this.batDau = e} placeholder='Thời gian bắt đầu'
                    label={
                        <div style={{ display: 'flex' }}>Thời gian bắt đầu (định dạng:&nbsp; <Dropdown readOnly={readOnly} ref={e => this.batDauType = e}
                            items={[...Object.keys(EnumDateType).map(key => EnumDateType[key].text)]}
                            onSelected={item => this.setState({ batDauType: item })} />)&nbsp;<span style={{ color: 'red' }}> *</span></div>
                    }
                    type={this.state.batDauType ? typeMapper[this.state.batDauType] : null} readOnly={readOnly} /></div>
                <div className='form-group col-md-6'><DateInput ref={e => this.ketThuc = e} placeholder='Thời gian kết thúc'
                    label={
                        <div style={{ display: 'flex' }}>Thời gian kết thúc (định dạng:&nbsp; <Dropdown readOnly={readOnly} ref={e => this.ketThucType = e}
                            items={[...Object.keys(EnumDateType).map(key => EnumDateType[key].text)]}
                            onSelected={item => this.setState({ ketThucType: item })} />)</div>
                    }
                    type={this.state.ketThucType ? typeMapper[this.state.ketThucType] : null} readOnly={readOnly} /></div>
                <FormTextBox className='col-md-6' ref={e => this.vaiTro = e} label={'Vai trò'} type='text' required readOnly={readOnly} />
                <div className='form-group col-md-6'><DateInput ref={e => this.ngayNghiemThu = e} placeholder='Thời gian kết thúc'
                    label={
                        <div style={{ display: 'flex' }}>Thời gian nghiệm thu (định dạng:&nbsp; <Dropdown readOnly={readOnly} ref={e => this.ngayNghiemThuType = e}
                            items={[...Object.keys(EnumDateType).map(key => EnumDateType[key].text)]}
                            onSelected={item => this.setState({ ngayNghiemThuType: item })} />)</div>
                    }
                    type={this.state.ngayNghiemThuType ? typeMapper[this.state.ngayNghiemThuType] : null} readOnly={readOnly} /></div>
                <FormTextBox className='col-md-12' ref={e => this.ketQua = e} label={'Kết quả'} type='text' readOnly={readOnly} />

            </div>,
        });
    }
}
class QtNghienCuuKhoaHocStaffUserPage extends AdminPage {
    componentDidMount() {
        this.props.getQtNckhUserAll();
        T.ready();
    }

    showModal = (e, shcc) => {
        e.preventDefault();
        this.modal.show({ item: null, shcc });
    }

    delete = (e, item) => {
        T.confirm('Xóa nghiên cứu khoa học', 'Bạn có chắc bạn muốn xóa nghiên cứu khoa học này?', 'warning', true, isConfirm => {
            isConfirm && this.props.deleteQtNckhStaffUser(item.id, item.shcc, error => {
                if (error) T.notify(error.message ? error.message : 'Xoá nghiên cứu khoa học bị lỗi!', 'danger');
                else T.alert('Xoá nghiên cứu khoa học thành công!', 'success', false, 800);
            });
        });
        e.preventDefault();
    }

    render() {
        const permission = {
            write: true,
            delete: true
        };
        const { isStaff, shcc } = this.props.system && this.props.system.user ? this.props.system.user : { isStaff: false, shcc: '' };
        const { firstName, lastName } = isStaff && this.props.system.user || { firstName: '', lastName: '' };
        const name = isStaff ? `${lastName} ${firstName} (${shcc})` : '';
        let list = this.props.qtNghienCuuKhoaHoc && this.props.qtNghienCuuKhoaHoc.items ? this.props.qtNghienCuuKhoaHoc.items : [];

        let table = renderTable({
            getDataSource: () => list, stickyHead: false,
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', textAlign: 'right' }}>#</th>
                    <th style={{ width: '100%', whiteSpace: 'nowrap' }}>Tên đề tài, dự án</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Mã số và cấp quản lý</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Thời gian thực hiện</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Kinh phí</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Kết quả</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Thao tác</th>
                </tr>
            ),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell type='text' style={{ textAlign: 'right' }} content={index + 1} />
                    <TableCell type='text' content={
                        <>
                            <span><i style={{ textAlign: 'justify', textTransform: 'uppercase' }}>{item.tenDeTai}</i></span><br />
                            {item.vaiTro ? <span style={{ whiteSpace: 'nowrap' }}>Vai trò: <span style={{ color: 'blue' }}>{item.vaiTro}</span></span> : null}
                        </>
                    } />
                    <TableCell type='text' content={item.maSoCapQuanLy} />
                    <TableCell type='text' content={(
                        <>
                            {item.batDau ? <span style={{ whiteSpace: 'nowrap' }}>Bắt đầu: <span style={{ color: 'blue' }}>{item.batDau ? T.dateToText(item.batDau, item.batDauType ? item.batDauType : 'dd/mm/yyyy') : ''}</span><br /></span> : null}
                            {item.ketThuc ? <span style={{ whiteSpace: 'nowrap' }}>Kết thúc: <span style={{ color: 'blue' }}>{item.ketThuc ? T.dateToText(item.ketThuc, item.ketThucType ? item.ketThucType : 'dd/mm/yyyy') : ''}</span><br /></span> : null}
                            {item.ngayNghiemThu ? <span style={{ whiteSpace: 'nowrap' }}>Nghiệm thu: <span style={{ color: 'blue' }}>{item.ngayNghiemThu ? T.dateToText(item.ngayNghiemThu, item.ngayNghiemThuType ? item.ngayNghiemThuType : 'dd/mm/yyyy') : ''}</span></span> : null}
                        </>
                    )}
                    />
                    <TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={item.kinhPhi} />
                    <TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={item.ketQua} />
                    <TableCell type='buttons' style={{ textAlign: 'center' }} content={item} permission={permission}
                        onEdit={() => this.modal.show({ item, shcc })} onDelete={this.delete} >
                    </TableCell>
                </tr>
            )
        });

        return this.renderPage({
            icon: 'fa fa-wpexplorer',
            title: 'Thông tin nghiên cứu khoa học',
            subTitle: <span style={{ color: 'blue' }}>Cán bộ: {name}</span>,
            breadcrumb: [
                <Link key={0} to='/user'>Trang cá nhân</Link>,
                'Nghiên cứu khoa học'
            ],
            content: <>
                <div className='tile'>
                    {table}
                </div>
                <NckhModal ref={e => this.modal = e} permission={permission}
                    shcc={shcc} readOnly={!permission.write}
                    create={this.props.createQtNckhStaffUser}
                    update={this.props.updateQtNckhStaffUser}
                />
            </>,
            backRoute: '/user',
            onCreate: permission && permission.write ? (e) => this.showModal(e, shcc) : null,
        });
    }
}

const mapStateToProps = state => ({ system: state.system, qtNghienCuuKhoaHoc: state.tccb.qtNghienCuuKhoaHoc });
const mapActionsToProps = {
    getQtNghienCuuKhoaHocPage, createQtNckhStaffUser, updateQtNckhStaffUser, deleteQtNckhStaffUser, getQtNckhUserAll
};
export default connect(mapStateToProps, mapActionsToProps)(QtNghienCuuKhoaHocStaffUserPage);
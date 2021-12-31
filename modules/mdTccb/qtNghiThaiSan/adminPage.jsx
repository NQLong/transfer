import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { AdminPage, TableCell, renderTable, AdminModal, FormTextBox, FormCheckbox, FormSelect, FormRichTextBox, FormDatePicker } from 'view/component/AdminPage';
import Pagination from 'view/component/Pagination';
import {
    getQtNghiThaiSanPage, getQtNghiThaiSanAll, updateQtNghiThaiSan,
    deleteQtNghiThaiSan, createQtNghiThaiSan, getQtNghiThaiSanGroupPage
} from './redux';
import { getDmChucVuAll } from 'modules/mdDanhMuc/dmChucVu/redux';
import { getDmDonViAll } from 'modules/mdDanhMuc/dmDonVi/redux';
import { getStaffAll, SelectAdapter_FwCanBo } from 'modules/mdTccb/tccbCanBo/redux';

class EditModal extends AdminModal {
    state = { stt: null };
    componentDidMount() {
    }

    onShow = (item) => {
        let { daNopHoSoThaiSan, ghiChu, hoSoThaiSanDuocDuyet, shcc, soBhxh,
            soThangDuocNghi, stt, thoiGianBaoTangBenBhxh, thoiGianBatDauNghi, thoiGianDiLamLai,
            thoiGianKetThucNghi } = item ? item : {
                chucVu: '', daNopHoSoThaiSan: '', donVi: '', ghiChu: '', ho: '', hoSoThaiDuocDuyet: '', shcc: '', soBhxh: '',
                soThangDuocNghi: '', stt: '', ten: '', thoiGianBaoTangBenBhxh: '', thoiGianBatDauNghi: '', thoiGianDiLamLai: '',
                thoiGianKetThucNghi: ''
            };
        this.setState({ stt, item });
        this.daNopHoSoThaiSan.value(daNopHoSoThaiSan ? 1 : 0);
        this.ghiChu.value(ghiChu ? ghiChu : '');
        this.hoSoThaiSanDuocDuyet.value(hoSoThaiSanDuocDuyet ? hoSoThaiSanDuocDuyet : '');
        this.shcc.value(shcc ? shcc : '');
        this.soBhxh.value(soBhxh ? soBhxh : '');
        this.soThangDuocNghi.value(soThangDuocNghi ? soThangDuocNghi : '');
        this.thoiGianBaoTangBenBhxh.value(thoiGianBaoTangBenBhxh ? thoiGianBaoTangBenBhxh : '');
        this.thoiGianBatDauNghi.value(thoiGianBatDauNghi ? thoiGianBatDauNghi : '');
        this.thoiGianDiLamLai.value(thoiGianDiLamLai ? thoiGianDiLamLai : '');
        this.thoiGianKetThucNghi.value(thoiGianKetThucNghi ? thoiGianKetThucNghi : '');
    };

    changeKichHoat = (value, target) => target.value(value ? 1 : 0) || target.value(value);

    onSubmit = (e) => {
        e.preventDefault();
        const changes = {
            daNopHoSoThaiSan: this.daNopHoSoThaiSan.value(),
            ghiChu: this.ghiChu.value(),
            hoSoThaiSanDuocDuyet: this.hoSoThaiSanDuocDuyet.value(),
            shcc: this.shcc.value(),
            soBhxh: this.soBhxh.value(),
            soThangDuocNghi: Number(this.soThangDuocNghi.value()),
            thoiGianBaoTangBenBhxh: Number(this.thoiGianBaoTangBenBhxh.value()),
            thoiGianBatDauNghi:  Number(this.thoiGianBatDauNghi.value()),
            thoiGianDiLamLai:  Number(this.thoiGianDiLamLai.value()),
            thoiGianKetThucNghi:  Number(this.thoiGianKetThucNghi.value()),
        };
        if (changes.shcc == '') {
            T.notify('Mã số cán bộ bị trống');
            this.shcc.focus();
        } else {
            this.state.stt ? this.props.update(this.state.stt, changes, this.hide) : this.props.create(changes, this.hide);
        }
    }

    render = () => {
        const readOnly = this.props.readOnly;
        return this.renderModal({
            title: this.state.stt ? 'Cập nhật nghỉ thai sản' : 'Tạo mới nghỉ thai sản',
            size: 'large',
            body: <div className='row'>
                <FormSelect type='text' className='col-md-6' ref={e => this.shcc = e} data={SelectAdapter_FwCanBo} label='Mã thẻ cán bộ' readOnly={readOnly} />
                <FormCheckbox className='col-md-12' ref={e => this.daNopHoSoThaiSan = e} label='Đã nộp hồ sơ' isSwitch={true} readOnly={readOnly} style={{ display: 'inline-flex', margin: 0 }}
                    onChange={value => this.changeKichHoat(value ? 1 : 0, this.daNopHoSoThaiSan)} />
                <FormTextBox className='col-md-6' ref={e => this.hoSoThaiSanDuocDuyet = e} label='Đã duyệt hồ sơ' readOnly={readOnly} />
                <FormTextBox type='text' className='col-md-6' ref={e => this.soBhxh = e} label='Bảo hiểm xã hội' readOnly={readOnly} />
                <FormDatePicker className='col-md-3' ref={e => this.thoiGianBatDauNghi = e} label='Thời gian bắt đầu nghỉ' readOnly={readOnly} />
                <FormDatePicker className='col-md-3' ref={e => this.thoiGianKetThucNghi = e} label='Thời gian kết thúc nghỉ' readOnly={readOnly} />
                <FormTextBox type='text' className='col-md-3' ref={e => this.soThangDuocNghi = e} label='Số tháng được nghỉ' readOnly={readOnly} />
                <FormDatePicker className='col-md-3' ref={e => this.thoiGianDiLamLai = e} label='Thời gian đi làm lại' readOnly={readOnly} />
                <FormRichTextBox type='text' className='col-md-12' ref={e => this.thoiGianBaoTangBenBhxh = e} label='Thời gian báo BHXH' readOnly={readOnly} />
                <FormRichTextBox type='text' className='col-md-12' ref={e => this.ghiChu = e} label='Ghi chú' readOnly={readOnly} />
            </div>
        });
    }
}

class QtNghiThaiSan extends AdminPage {
    checked = false;

    componentDidMount() {
        T.ready('/user/tccb', () => {
            T.onSearch = (searchText) => {
                if (this.checked) this.props.getQtNghiThaiSanGroupPage(undefined, undefined, searchText || ''); 
                else this.props.getQtNghiThaiSanPage(undefined, undefined, searchText || '');
            };
            T.showSearchBox();
            this.props.getQtNghiThaiSanPage(undefined, undefined, '');
        });
    }

    showModal = (e) => {
        e.preventDefault();
        this.modal.show();
    }

    groupPage = () => {
        this.checked = !this.checked;
        this.props.getQtNghiThaiSanGroupPage(undefined, undefined, '');
    }

    delete = (e, item) => {
        T.confirm('Xóa quá trình nghỉ thai sản', 'Bạn có chắc bạn muốn xóa quá trình nghỉ thai sản này', 'warning', true, isConfirm => {
            isConfirm && this.props.deleteQtNghiThaiSan(item.stt, error => {
                if (error) T.notify(error.message ? error.message : `Xoá quá trình nghỉ thai sản ${item.ten} bị lỗi!`, 'danger');
                else T.alert(`Xoá quá trình nghỉ thai sản ${item.ten} thành công!`, 'success', false, 800);
            });
        });
        e.preventDefault();
    }

    render() {
        const currentPermissions = this.props.system && this.props.system.user && this.props.system.user.permissions ? this.props.system.user.permissions : [],
            permission = this.getUserPermission('qtNghiThaiSan', ['read', 'write', 'delete']);
        let { pageNumber, pageSize, pageTotal, totalItem, pageCondition, list } = this.checked ?
        (this.props.qtNghiThaiSan && this.props.qtNghiThaiSan.page_gr ?
            this.props.qtNghiThaiSan.page_gr : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, pageCondition: {}, list })
        : (this.props.qtNghiThaiSan && this.props.qtNghiThaiSan.page ? this.props.qtNghiThaiSan.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, pageCondition: {}, list: [] });

        let table = 'Không có danh sách!';
        if (list && list.length > 0) {
            table = renderTable({
                getDataSource: () => list, stickyHead: false,
                renderHead: () => (
                    <tr>
                        <th style={{ width: 'auto', textAlign: 'right' }}>#</th>
                        <th style={{ width: '30%', textAlign: 'center' }}>Cán bộ</th>
                        <th style={{ width: '15%', textAlign: 'center' }}>Thời gian nghỉ</th>
                        <th style={{ width: '15%', textAlign: 'center' }}>Thời gian đi làm lại</th>
                        <th style={{ width: '20%', textAlign: 'center' }}>Thời gian báo tăng bên BHXH</th>
                        <th style={{ width: '20%', textAlign: 'center' }}>Ghi chú</th>
                        <th style={{ width: 'auto', textAlign: 'center' }}>Thao tác</th>
                    </tr>
                ),
                renderRow: (item, index) => (
                    <tr key={index}>
                        <TableCell type='text' style={{ textAlign: 'right' }} content={index + 1} />
                        <TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={(
                            <>
                                <span>{item.ho + ' ' + item.ten}</span><br />
                                <a href='#' onClick={() => this.modal.show(item)}>{item.shcc}</a>
                            </>
                        )}
                        />
                        <TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={(
                            <>
                                <span style={{ whiteSpace: 'nowrap' }}>Từ: <span style={{ color: 'blue' }}>{item.thoiGianBatDauNghi ? new Date(item.thoiGianBatDauNghi).ddmmyyyy() : ''}</span></span><br />
                                <span style={{ whiteSpace: 'nowrap' }}>Đến: <span style={{ color: 'blue' }}>{item.thoiGianKetThucNghi ? new Date(item.thoiGianKetThucNghi).ddmmyyyy() : ''}</span></span><br />
                            </>
                        )}
                        />
                        <TableCell type='text' style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={<span style={{ color: 'blue' }}>{item.thoiGianDiLamLai ? new Date(item.thoiGianDiLamLai).ddmmyyyy() : ''}</span>} />
                        <TableCell type='text' content={item.ghiChu} />
                        <TableCell type='text' content={item.thoiGianBaoTangBenBhxh} />
                        {
                            !this.checked && <TableCell type='buttons' style={{ textAlign: 'center' }} content={item} permission={permission}
                                onEdit={() => this.modal.show(item)} onDelete={e => this.delete(e, item)} > </TableCell>
                        }
                        {
                            this.checked &&
                            <TableCell type='buttons' style={{ textAlign: 'center', width: '45px' }} content={item} permission={permission}>
                                <Link className='btn btn-success' to={`/user/tccb/qua-trinh/nghi-thai-san/group/${item.shcc}`} >
                                    <i className='fa fa-lg fa-compress' />
                                </Link>
                            </TableCell>
                        }
                    </tr>
                )
            });
        }

        return this.renderPage({
            icon: 'fa fa-bed',
            title: ' Nghỉ Thai Sản',
            breadcrumb: [
                <Link key={0} to='/user/tccb'>Tổ chức cán bộ</Link>,
                'Nghỉ thai sản'
            ],
            content: <>
                <div className='tile'>
                    <FormCheckbox label='Hiển thị theo cán bộ' onChange={this.groupPage} />
                    {table}
                </div>
                <Pagination style={{ marginLeft: '70px' }} {...{ pageNumber, pageSize, pageTotal, totalItem, pageCondition }}
                    getPage={this.checked ?  this.props.getQtNghiThaiSanGroupPage : this.props.getQtNghiThaiSanPage} />
                <EditModal ref={e => this.modal = e} permission={permission}
                    create={this.props.createQtNghiThaiSan} update={this.props.updateQtNghiThaiSan}
                    getDonVi={this.props.getDmDonViAll} permissions={currentPermissions}
                    getChucVu={this.props.getDmChucVuAll}
                    getStaff={this.props.getStaffAll} />
            </>,
            backRoute: '/user/tccb',
            onCreate: permission && permission.write ? (e) => this.showModal(e) : null,
        });
    }
}

const mapStateToProps = state => ({ system: state.system, qtNghiThaiSan: state.qtNghiThaiSan });
const mapActionsToProps = {
    getQtNghiThaiSanAll, getQtNghiThaiSanPage, deleteQtNghiThaiSan, getDmDonViAll, createQtNghiThaiSan,
    updateQtNghiThaiSan, getDmChucVuAll, getStaffAll, getQtNghiThaiSanGroupPage
};
export default connect(mapStateToProps, mapActionsToProps)(QtNghiThaiSan);
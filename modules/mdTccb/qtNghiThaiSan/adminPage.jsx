import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { AdminPage, TableCell, renderTable, AdminModal, FormTextBox, FormCheckbox, FormSelect, FormRichTextBox, FormDatePicker } from 'view/component/AdminPage';
import Pagination from 'view/component/Pagination';
import {
    getQtNghiThaiSanPage, getQtNghiThaiSanAll, updateQtNghiThaiSan,
    deleteQtNghiThaiSan, createQtNghiThaiSan
} from './redux';
import { getDmChucVuAll } from 'modules/mdDanhMuc/dmChucVu/redux';
import { getDmDonViAll } from 'modules/mdDanhMuc/dmDonVi/redux';

class EditModal extends AdminModal {
    donViTable = [];
    chucVuTable = [];
    state = { stt: null };
    componentDidMount() {

        $(document).ready(() => this.onShown(() => {
            this.shcc.focus();
        }));
        this.props.getDonVi(items => {
            if (items) {
                this.donViTable = [];
                items.forEach(item => this.donViTable.push({
                    'id': item.ma,
                    'text': item.ten
                }));
            }
        });
        this.props.getChucVu(items => {
            if (items) {
                this.chucVuTable = [];
                items.forEach(item => this.chucVuTable.push({
                    'id': item.ma,
                    'text': item.ten
                }));
            }
        });
    }

    onShow = (item) => {
        let { tenChucVu, daNopHoSoThaiSan, tenDonVi, ghiChu, ho, hoSoThaiDuocDuyet, shcc, soBhxh,
            soThanhDuocNghi, stt, ten, thoiGianBaoTangBenBhxh, thoiGianBatDauNghi, thoiGianDiLamLai,
            thoiGianKetThucNghi } = item ? item : {
                chucVu: '', daNopHoSoThaiSan: '', donVi: '', ghiChu: '', ho: '', hoSoThaiDuocDuyet: '', shcc: '', soBhxh: '',
                soThanhDuocNghi: '', stt: '', ten: '', thoiGianBaoTangBenBhxh: '', thoiGianBatDauNghi: '', thoiGianDiLamLai: '',
                thoiGianKetThucNghi: ''
            };
        this.setState({ stt, item });
        this.ho.value(ho ? ho : '');
        this.ten.value(ten ? ten : '');
        this.tenChucVu.value(tenChucVu ? tenChucVu : '');
        this.daNopHoSoThaiSan.value(daNopHoSoThaiSan ? 1 : 0);
        this.tenDonVi.value(tenDonVi ? tenDonVi : '');
        this.ghiChu.value(ghiChu ? ghiChu : '');
        this.hoSoThaiDuocDuyet.value(hoSoThaiDuocDuyet ? 1 : 0);
        this.shcc.value(shcc ? shcc : '');
        this.soBhxh.value(soBhxh ? soBhxh : '');
        this.soThanhDuocNghi.value(soThanhDuocNghi ? soThanhDuocNghi : '');
        this.thoiGianBaoTangBenBhxh.value(thoiGianBaoTangBenBhxh ? thoiGianBaoTangBenBhxh : '');
        this.thoiGianBatDauNghi.value(thoiGianBatDauNghi ? thoiGianBatDauNghi : '');
        this.thoiGianDiLamLai.value(thoiGianDiLamLai ? thoiGianDiLamLai : '');
        this.thoiGianKetThucNghi.value(thoiGianKetThucNghi ? thoiGianKetThucNghi : '');
    };

    changeKichHoat = (value, target) => target.value(value ? 1 : 0) || target.value(value);

    onSubmit = (e) => {
        e.preventDefault();
        const changes = {
            ho: this.ho.value(),
            ten: this.ten.value(),
            tenChucVu: this.tenChucVu.value(),
            daNopHoSoThaiSan: this.daNopHoSoThaiSan.value(),
            tenDonVi: this.tenDonVi.value(),
            ghiChu: this.ghiChu.value(),
            hoSoThaiDuocDuyet: this.hoSoThaiDuocDuyet.value(),
            shcc: this.shcc.value(),
            soBhxh: this.soBhxh.value(),
            soThanhDuocNghi: this.soThanhDuocNghi.value(),
            thoiGianBaoTangBenBhxh: this.thoiGianBaoTangBenBhxh.value(),
            thoiGianBatDauNghi: this.thoiGianBatDauNghi.value(),
            thoiGianDiLamLai: this.thoiGianDiLamLai.value(),
            thoiGianKetThucNghi: this.thoiGianKetThucNghi.value(),
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
                <FormCheckbox className='col-md-6' ref={e => this.daNopHoSoThaiSan = e} label='Đã nộp hồ sơ' isSwitch={true} readOnly={readOnly} style={{ display: 'inline-flex', margin: 0 }}
                    onChange={value => this.changeKichHoat(value ? 1 : 0, this.daNopHoSoThaiSan)} />
                <FormCheckbox className='col-md-6' ref={e => this.hoSoThaiDuocDuyet = e} label='Đã duyệt hồ sơ' isSwitch={true} readOnly={readOnly} style={{ display: 'inline-flex', margin: 0 }}
                    onChange={value => this.changeKichHoat(value ? 1 : 0, this.hoSoThaiDuocDuyet)} />
                <FormTextBox type='text' className='col-md-3' ref={e => this.ho = e} label='Họ' readOnly={readOnly} />
                <FormTextBox type='text' className='col-md-3' ref={e => this.ten = e} label='Tên' readOnly={readOnly} />
                <FormTextBox type='text' className='col-md-3' ref={e => this.shcc = e} label='Mã số cán bộ' readOnly={readOnly} />
                <FormTextBox type='text' className='col-md-3' ref={e => this.soBhxh = e} label='Bảo hiểm xã hội' readOnly={readOnly} />
                <FormSelect type='text' className='col-md-6' ref={e => this.tenChucVu = e} data={this.chucVuTable} label='Chức vụ' readOnly={readOnly} />
                <FormSelect type='text' className='col-md-6' ref={e => this.tenDonVi = e} data={this.donViTable} label='Đơn vị' readOnly={readOnly} />
                <FormDatePicker className='col-md-3' ref={e => this.thoiGianBatDauNghi = e} label='Thời gian bắt đầu nghỉ' readOnly={readOnly} />
                <FormDatePicker className='col-md-3' ref={e => this.thoiGianKetThucNghi = e} label='Thời gian kết thúc nghỉ' readOnly={readOnly} />
                <FormTextBox type='text' className='col-md-3' ref={e => this.soThanhDuocNghi = e} label='Số tháng được nghỉ' readOnly={readOnly} />
                <FormDatePicker className='col-md-3' ref={e => this.thoiGianDiLamLai = e} label='Thời gian đi làm lại' readOnly={readOnly} />
                <FormRichTextBox type='text' className='col-md-12' ref={e => this.thoiGianBaoTangBenBhxh = e} label='Thời gian báo BHXH' readOnly={readOnly} />
                <FormRichTextBox type='text' className='col-md-12' ref={e => this.ghiChu = e} label='Ghi chú' readOnly={readOnly} />
            </div>
        });
    }
}

class QtNghiThaiSan extends AdminPage {
    componentDidMount() {
        T.ready('/user/tccb', () => {
            T.onSearch = (searchText) => this.props.getQtNghiThaiSanPage(undefined, undefined, searchText || '');
            T.showSearchBox();
            this.props.getQtNghiThaiSanPage();
        });
    }

    showModal = (e) => {
        e.preventDefault();
        this.modal.show();
    }

    delete = (e, item) => {
        T.confirm('Xóa hợp đồng', `Bạn có chắc bạn muốn xóa hợp đồng ${item.soHopDong ? `<b>${item.soHopDong}</b>` : 'này'}?`, 'warning', true, isConfirm => {
            isConfirm && this.props.deleteQtNghiThaiSan(item.stt, error => {
                if (error) T.notify(error.message ? error.message : `Xoá hợp đồng ${item.ten} bị lỗi!`, 'danger');
                else T.alert(`Xoá hợp đồng ${item.ten} thành công!`, 'success', false, 800);
            });
        });
        e.preventDefault();
    }

    render() {
        const currentPermissions = this.props.system && this.props.system.user && this.props.system.user.permissions ? this.props.system.user.permissions : [],
            permission = this.getUserPermission('qtNghiThaiSan', ['read', 'write', 'delete']);
        let { pageNumber, pageSize, pageTotal, totalItem, pageCondition, list } = this.props.qtNghiThaiSan && this.props.qtNghiThaiSan.page ?
            this.props.qtNghiThaiSan.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, list };
        let table = 'Không có danh sách!';
        if (list && list.length > 0) {
            table = renderTable({
                getDataSource: () => list, stickyHead: false,
                renderHead: () => (
                    <tr>
                        <th style={{ width: 'auto', textAlign: 'right' }}>#</th>
                        <th style={{ width: '35%', textAlign: 'center' }}>Cán bộ</th>
                        <th style={{ width: '15%', textAlign: 'center' }}>Chức vụ</th>
                        <th style={{ width: '15%', textAlign: 'center' }}>Đơn vị</th>
                        <th style={{ width: '10%', textAlign: 'center' }}>Thời gian nghỉ</th>
                        <th style={{ width: '20%', textAlign: 'center' }}>Ghi chú</th>
                        <th style={{ width: 'auto', textAlign: 'center' }}>Thao tác</th>
                    </tr>
                ),
                renderRow: (item, index) => (
                    <tr key={index}>
                        <TableCell type='text' style={{textAlign:'right'}} content={index + 1} />
                        <TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={(
                            <>
                                <span>{item.ho + ' ' + item.ten}</span><br />
                                <a href='#' onClick={() => this.modal.show(item)}>{item.shcc}</a>
                            </>
                        )}
                        />
                        <TableCell type='text' style={{textAlign:'left'}} content={item.tenChucVu} />
                        <TableCell type='text' style={{textAlign:'left'}} content={item.tenDonVi} />
                        <TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={(
                            <>
                                <span style={{ whiteSpace: 'nowrap' }}>Từ ngày: <span style={{ color: 'blue' }}>{item.thoiGianBatDauNghi ? new Date(item.thoiGianBatDauNghi).ddmmyyyy() : ''}</span></span><br />
                                <span style={{ whiteSpace: 'nowrap' }}>Tới ngày: <span style={{ color: 'blue' }}>{item.thoiGianKetThucNghi ? new Date(item.thoiGianKetThucNghi).ddmmyyyy() : ''}</span></span><br />
                                <span style={{ whiteSpace: 'nowrap' }}>Đi làm lại: <span style={{ color: 'blue' }}>{item.thoiGianDiLamLai ? new Date(item.thoiGianDiLamLai).ddmmyyyy() : ''}</span></span><br />
                            </>
                        )}
                        />
                        <TableCell type='text' content={item.ghiChu} />
                        <TableCell type='buttons' style={{ textAlign: 'center' }} content={item} permission={permission}
                            onEdit={() => this.modal.show(item)} onDelete={e => this.delete(e, item)} />
                    </tr>
                )
            });
        }

        return this.renderPage({
            icon: 'fa fa-list-alt',
            title: 'Nghỉ thai sản',
            breadcrumb: [
                <Link key={0} to='/user/tccb'>Tổ chức cán bộ</Link>,
                'Nghỉ thai sản'
            ],
            content: <>
                <div className='tile'>{table}</div>
                <Pagination style={{ marginLeft: '70px' }} {...{ pageNumber, pageSize, pageTotal, totalItem, pageCondition }}
                    getPage={this.props.getQtNghiThaiSanPage} />
                <EditModal ref={e => this.modal = e} permission={permission}
                    create={this.props.createQtNghiThaiSan} update={this.props.updateQtNghiThaiSan}
                    getDonVi={this.props.getDmDonViAll} permissions={currentPermissions}
                    getChucVu={this.props.getDmChucVuAll} />
            </>,
            backRoute: '/user/tccb',
            onCreate: permission && permission.write ? (e) => this.showModal(e) : null,
        });
    }
}

const mapStateToProps = state => ({ system: state.system, qtNghiThaiSan: state.qtNghiThaiSan });
const mapActionsToProps = {
    getQtNghiThaiSanAll, getQtNghiThaiSanPage, deleteQtNghiThaiSan, getDmDonViAll, createQtNghiThaiSan,
    updateQtNghiThaiSan, getDmChucVuAll
};
export default connect(mapStateToProps, mapActionsToProps)(QtNghiThaiSan);
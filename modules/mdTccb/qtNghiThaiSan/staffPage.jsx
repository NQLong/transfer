import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { AdminPage, TableCell, renderTable, AdminModal, FormRichTextBox, FormDatePicker, FormTextBox, FormCheckbox } from 'view/component/AdminPage';
import Pagination from 'view/component/Pagination';
import {
    updateQtNghiThaiSanUserPage, deleteQtNghiThaiSanUserPage,
    createQtNghiThaiSanUserPage, getQtNghiThaiSanUserPage,
} from './redux';

class EditModal extends AdminModal {
    state = {
        stt: null,
        batDau: '',
        ketThuc: '',
    };

    onShow = (item) => {
        let { daNopHoSoThaiSan, ghiChu, hoSoThaiSanDuocDuyet, soBhxh,
            soThangDuocNghi, stt, thoiGianBaoTangBenBhxh, thoiGianBatDauNghi, thoiGianDiLamLai,
            thoiGianKetThucNghi } = item && item.item ? item.item : {
                chucVu: '', daNopHoSoThaiSan: '', donVi: '', ghiChu: '', ho: '', hoSoThaiDuocDuyet: '', shcc: '', soBhxh: '',
                soThangDuocNghi: '', stt: '', ten: '', thoiGianBaoTangBenBhxh: '', thoiGianBatDauNghi: '', thoiGianDiLamLai: '',
                thoiGianKetThucNghi: ''
            };
        this.setState({ stt, item, thoiGianBatDauNghi, thoiGianKetThucNghi, shcc: item.shcc });

        setTimeout(() => {
            this.daNopHoSoThaiSan.value(daNopHoSoThaiSan ? 1 : 0);
            this.ghiChu.value(ghiChu ? ghiChu : '');
            this.hoSoThaiSanDuocDuyet.value(hoSoThaiSanDuocDuyet ? hoSoThaiSanDuocDuyet : '');
            this.soBhxh.value(soBhxh ? soBhxh : '');
            this.soThangDuocNghi.value(soThangDuocNghi ? soThangDuocNghi : '');
            this.thoiGianBaoTangBenBhxh.value(thoiGianBaoTangBenBhxh ? thoiGianBaoTangBenBhxh : '');
            this.thoiGianBatDauNghi.value(thoiGianBatDauNghi ? thoiGianBatDauNghi : '');
            this.thoiGianDiLamLai.value(thoiGianDiLamLai ? thoiGianDiLamLai : '');
            this.thoiGianKetThucNghi.value(thoiGianKetThucNghi ? thoiGianKetThucNghi : '');
        }, 500);
    };

    changeKichHoat = (value, target) => target.value(value ? 1 : 0) || target.value(value);
    onSubmit = (e) => {
        e.preventDefault();
        const changes = {
            daNopHoSoThaiSan: this.daNopHoSoThaiSan.value(),
            ghiChu: this.ghiChu.value(),
            hoSoThaiSanDuocDuyet: this.hoSoThaiSanDuocDuyet.value(),
            shcc: this.state.shcc,
            soBhxh: this.soBhxh.value(),
            soThangDuocNghi: Number(this.soThangDuocNghi.value()),
            thoiGianBaoTangBenBhxh: this.thoiGianBaoTangBenBhxh.value(),
            thoiGianBatDauNghi: this.thoiGianBatDauNghi.value() ? Number(this.thoiGianBatDauNghi.value()) : null,
            thoiGianDiLamLai: this.thoiGianDiLamLai.value() ? Number(this.thoiGianDiLamLai.value()) : null,
            thoiGianKetThucNghi: this.thoiGianKetThucNghi.value() ? Number(this.thoiGianKetThucNghi.value()) : null,
        };
        if (!changes.shcc) {
            T.notify('Mã số cán bộ bị trống');
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
                <FormCheckbox className='col-md-12' ref={e => this.daNopHoSoThaiSan = e} label='Đã nộp hồ sơ' isSwitch={true} readOnly={readOnly} style={{ display: 'inline-flex', margin: 0 }}
                    onChange={value => this.changeKichHoat(value ? 1 : 0, this.daNopHoSoThaiSan)} />
                <FormTextBox className='col-md-6' ref={e => this.hoSoThaiSanDuocDuyet = e} label='Đã duyệt hồ sơ' readOnly={readOnly} />
                <FormTextBox type='text' className='col-md-6' ref={e => this.soBhxh = e} label='Bảo hiểm xã hội' readOnly={readOnly} />
                <FormDatePicker className='col-md-3' ref={e => this.thoiGianBatDauNghi = e} label='Thời gian bắt đầu nghỉ' readOnly={readOnly} />
                <FormDatePicker className='col-md-3' ref={e => this.thoiGianKetThucNghi = e} label='Thời gian kết thúc nghỉ' readOnly={readOnly} />
                <FormTextBox type='text' className='col-md-3' ref={e => this.soThangDuocNghi = e} label='Số tháng được nghỉ' readOnly={readOnly} />
                <FormDatePicker className='col-md-3' ref={e => this.thoiGianDiLamLai = e} label='Thời gian đi làm lại' readOnly={readOnly} />
                <FormRichTextBox type='text' className='col-md-12' ref={e => this.thoiGianBaoTangBenBhxh = e} label='Thời gian báo Bhxh' readOnly={readOnly} />
                <FormRichTextBox type='text' className='col-md-12' ref={e => this.ghiChu = e} label='Ghi chú' readOnly={readOnly} />
            </div>
        });
    }
}

class QtNghiThaiSanUserPage extends AdminPage {
    state = { filter: {} };

    componentDidMount() {
        T.ready('/user', () => {
            const { shcc } = this.props.system && this.props.system.user ? this.props.system.user : { shcc: '' };
            this.setState({ filter: { list_shcc: shcc, list_dv: '', fromYear: null, toYear: null } });
            this.getPage();
        });
    }

    getPage = (pageN, pageS, pageC, done) => {
        this.props.getQtNghiThaiSanUserPage(pageN, pageS, pageC, this.state.filter, done);
    }

    showModal = (e) => {
        e.preventDefault();
        this.modal.show({ item: null, shcc: this.state.filter.list_shcc });
    }

    delete = (e, item) => {
        T.confirm('Xóa thông tin nghỉ thai sản', 'Bạn có chắc bạn muốn xóa thông tin nghỉ thai sản này?', 'warning', true, isConfirm => {
            isConfirm && this.props.deleteQtNghiThaiSanUserPage(item.stt, error => {
                if (error) T.notify(error.message ? error.message : 'Xoá thông tin nghỉ thai sản bị lỗi!', 'danger');
                else T.alert('Xoá thông tin nghỉ thai sản thành công!', 'success', false, 800);
            });
        });
        e.preventDefault();
    }

    render() {
        let permission = this.getUserPermission('staff', ['login']);
        if (permission.login == true) {
            permission = {
                write: true,
                delete: true
            };
        }
        const { isStaff, shcc } = this.props.system && this.props.system.user ? this.props.system.user : { isStaff: false, shcc: '' };
        const { firstName, lastName } = isStaff && this.props.system.user || { firstName: '', lastName: '' };
        const name = isStaff ? `${lastName} ${firstName} (${shcc})` : '';
        let { pageNumber, pageSize, pageTotal, totalItem, pageCondition, list } = this.props.qtNghiThaiSan && this.props.qtNghiThaiSan.user_page ? this.props.qtNghiThaiSan.user_page : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, pageCondition: {}, list: [] };
        let table = 'Không có danh sách!';
        if (list && list.length > 0) {
            table = renderTable({
                getDataSource: () => list, stickyHead: false,
                renderHead: () => (
                    <tr>
                        <th style={{ width: 'auto', textAlign: 'right' }}>#</th>
                        <th style={{ width: '20%', textAlign: 'center' }}>Thời gian nghỉ</th>
                        <th style={{ width: '20%', textAlign: 'center' }}>Thời gian đi làm lại</th>
                        <th style={{ width: '30%', textAlign: 'center' }}>Thời gian báo tăng bên Bhxh</th>
                        <th style={{ width: '30%', textAlign: 'center' }}>Ghi chú</th>
                        <th style={{ width: 'auto', textAlign: 'center' }}>Thao tác</th>
                    </tr>
                ),
                renderRow: (item, index) => (
                    <tr key={index}>
                        <TableCell type='text' style={{ textAlign: 'right' }} content={(pageNumber - 1) * pageSize + index + 1} />
                        <TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={(
                            <>
                                <span style={{ whiteSpace: 'nowrap' }}>Từ: <span style={{ color: 'blue' }}>{item.thoiGianBatDauNghi ? new Date(item.thoiGianBatDauNghi).ddmmyyyy() : ''}</span></span><br />
                                <span style={{ whiteSpace: 'nowrap' }}>Đến: <span style={{ color: 'blue' }}>{item.thoiGianKetThucNghi ? new Date(item.thoiGianKetThucNghi).ddmmyyyy() : ''}</span></span><br />
                            </>
                        )}
                        />
                        <TableCell type='text' style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={<span style={{ color: 'blue' }}>{item.thoiGianDiLamLai ? new Date(item.thoiGianDiLamLai).ddmmyyyy() : ''}</span>} />
                        <TableCell type='text' content={item.thoiGianBaoTangBenBhxh} />
                        <TableCell type='text' content={item.ghiChu} />
                        <TableCell type='buttons' style={{ textAlign: 'center' }} content={item} permission={permission}
                            onEdit={() => this.modal.show({ item, shcc })} onDelete={e => this.delete(e, item)} />
                    </tr>
                )
            });
        }

        return this.renderPage({
            icon: 'fa fa-bed',
            title: 'Quá trình nghỉ thai sản',
            subTitle: <span style={{ color: 'blue' }}>Cán bộ: {name}</span>,
            breadcrumb: [
                <Link key={0} to='/user/'>Trang cá nhân</Link>,
                'Nghỉ thai sản'
            ],
            content: <>
                <div className='tile'>
                    {table}
                </div>
                <Pagination style={{ marginLeft: '70px' }} {...{ pageNumber, pageSize, pageTotal, totalItem, pageCondition }}
                    getPage={this.getPage} />
                <EditModal ref={e => this.modal = e} shcc={this.shcc} readOnly={!permission.write}
                    create={this.props.createQtNghiThaiSanUserPage} update={this.props.updateQtNghiThaiSanUserPage}
                />
            </>,
            backRoute: '/user',
            onCreate: permission && permission.write ? (e) => this.showModal(e) : null,
        });
    }
}

const mapStateToProps = state => ({ system: state.system, qtNghiThaiSan: state.tccb.qtNghiThaiSan });
const mapActionsToProps = {
    updateQtNghiThaiSanUserPage, deleteQtNghiThaiSanUserPage,
    createQtNghiThaiSanUserPage, getQtNghiThaiSanUserPage,
};
export default connect(mapStateToProps, mapActionsToProps)(QtNghiThaiSanUserPage);

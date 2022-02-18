import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { AdminPage, TableCell, renderTable, AdminModal, FormTextBox, FormCheckbox, FormSelect, FormRichTextBox, FormDatePicker } from 'view/component/AdminPage';
import Pagination from 'view/component/Pagination';
import {
    getQtNghiThaiSanPage, updateQtNghiThaiSanGroupPageMa,
    deleteQtNghiThaiSanGroupPageMa, createQtNghiThaiSanGroupPageMa
} from './redux';

import { SelectAdapter_FwCanBo } from 'modules/mdTccb/tccbCanBo/redux';

const timeList = [
    { id: 0, text: 'Không' },
    { id: 1, text: 'Theo ngày bắt đầu nghỉ - ngày kết thúc nghỉ' },
    { id: 2, text: 'Theo ngày bắt đầu đi làm lại' }
];

class EditModal extends AdminModal {
    state = { 
        stt: null,
        batDau: '',
        ketThuc: '',
    };

    onShow = (item) => {
        let { daNopHoSoThaiSan, ghiChu, hoSoThaiSanDuocDuyet, shcc, soBhxh,
            soThangDuocNghi, stt, thoiGianBaoTangBenBhxh, thoiGianBatDauNghi, thoiGianDiLamLai,
            thoiGianKetThucNghi } = item ? item : {
                chucVu: '', daNopHoSoThaiSan: '', donVi: '', ghiChu: '', ho: '', hoSoThaiDuocDuyet: '', shcc: '', soBhxh: '',
                soThangDuocNghi: '', stt: '', ten: '', thoiGianBaoTangBenBhxh: '', thoiGianBatDauNghi: '', thoiGianDiLamLai: '',
                thoiGianKetThucNghi: ''
            };
        this.setState({ stt, item, thoiGianBatDauNghi, thoiGianKetThucNghi });
        
        setTimeout(() => {
            this.daNopHoSoThaiSan.value(daNopHoSoThaiSan ? 1 : 0);
            this.ghiChu.value(ghiChu ? ghiChu : '');
            this.hoSoThaiSanDuocDuyet.value(hoSoThaiSanDuocDuyet ? hoSoThaiSanDuocDuyet : '');
            this.shcc.value(shcc ? shcc : this.props.shcc);
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
            shcc: this.shcc.value(),
            soBhxh: this.soBhxh.value(),
            soThangDuocNghi: Number(this.soThangDuocNghi.value()),
            thoiGianBaoTangBenBhxh: this.thoiGianBaoTangBenBhxh.value(),
            thoiGianBatDauNghi: this.thoiGianBatDauNghi.value() ? Number(this.thoiGianBatDauNghi.value()): null,
            thoiGianDiLamLai: this.thoiGianDiLamLai.value() ? Number(this.thoiGianDiLamLai.value()) : null,
            thoiGianKetThucNghi: this.thoiGianKetThucNghi.value() ? Number(this.thoiGianKetThucNghi.value()) : null,
        };
        if (!changes.shcc) {
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
                <FormSelect className='col-md-6' ref={e => this.shcc = e} data={SelectAdapter_FwCanBo} label='Mã thẻ cán bộ' readOnly={true} />
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

class QtNghiThaiSanGroupPage extends AdminPage {
    state = { filter: {} };

    componentDidMount() {
        T.ready('/user/tccb', () => {
            const route = T.routeMatcher('/user/tccb/qua-trinh/nghi-thai-san/group/:shcc'),
                params = route.parse(window.location.pathname);
            this.shcc = params.shcc;
            this.setState({filter: {list_shcc: params.shcc, list_dv: '', timeType: 0}});
            T.onSearch = (searchText) => this.props.getQtNghiThaiSanPage(undefined, undefined, searchText || '');
            T.showSearchBox(() => {
                this.timeType?.value(0);
                this.fromYear?.value('');
                this.toYear?.value('');
                setTimeout(() => this.changeAdvancedSearch(), 50);
            });
            this.props.getQtNghiThaiSanPage(undefined, undefined, undefined, this.state.filter, () => {
                T.updatePage('pageQtNghiThaiSan', undefined, undefined, undefined, this.state.filter);
            });
        });
    }

    changeAdvancedSearch = (isInitial = false) => {
        let { pageNumber, pageSize } = this.props && this.props.qtNghiThaiSan && this.props.qtNghiThaiSan.page ? this.props.qtNghiThaiSan.page : { pageNumber: 1, pageSize: 50 };
        const timeType = this.timeType?.value() || 0;
        const fromYear = this.fromYear?.value() == '' ? null : this.fromYear?.value().getTime();
        const toYear = this.toYear?.value() == '' ? null : this.toYear?.value().getTime();
        const list_dv = this.state.filter.list_dv;
        const list_shcc = this.state.filter.list_shcc;
        const pageFilter = isInitial ? null : { list_dv, fromYear, toYear, list_shcc, timeType };
        this.setState({ filter: pageFilter }, () => {
            this.getPage(pageNumber, pageSize, '', (page) => {
                if (isInitial) {
                    const filter = page.filter || {};
                    this.setState({ filter: !$.isEmptyObject(filter) ? filter : pageFilter });
                    this.fromYear?.value(filter.fromYear || '');
                    this.toYear?.value(filter.toYear || '');
                    if (!$.isEmptyObject(filter) && filter && (filter.fromYear || filter.toYear || filter.timeType )) this.showAdvanceSearch();
                }
            });
        });
    }
    
    getPage = (pageN, pageS, pageC, done) => {
        this.props.getQtNghiThaiSanPage(pageN, pageS, pageC, this.state.filter, done);
    }
    
    showModal = (e) => {
        e.preventDefault();
        this.modal.show();
    }

    delete = (e, item) => {
        T.confirm('Xóa thông tin nghỉ thai sản', 'Bạn có chắc bạn muốn xóa thông tin nghhỉ thai sản này?', 'warning', true, isConfirm => {
            isConfirm && this.props.deleteQtNghiThaiSanGroupPageMa(item.stt, error => {
                if (error) T.notify(error.message ? error.message : 'Xoá hợp thông tin nghỉ thai sản bị lỗi!', 'danger');
                else T.alert('Xoá thông tin nghỉ thai sản thành công!', 'success', false, 800);
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
                        <th style={{ width: '30%', textAlign: 'center' }}>Cán bộ</th>
                        <th style={{ width: '15%', textAlign: 'center' }}>Thời gian nghỉ</th>
                        <th style={{ width: '15%', textAlign: 'center' }}>Thời gian đi làm lại</th>
                        <th style={{ width: '20%', textAlign: 'center' }}>Thời gian báo tăng bên Bhxh</th>
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
                        <TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={(
                            <>
                                <span style={{ whiteSpace: 'nowrap' }}>Từ: <span style={{ color: 'blue' }}>{item.thoiGianBatDauNghi ? new Date(item.thoiGianBatDauNghi).ddmmyyyy() : ''}</span></span><br />
                                <span style={{ whiteSpace: 'nowrap' }}>Đến: <span style={{ color: 'blue' }}>{item.thoiGianKetThucNghi ? new Date(item.thoiGianKetThucNghi).ddmmyyyy() : ''}</span></span><br />
                            </>
                        )}
                        />
                        <TableCell type='text' style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content= {<span style={{ color: 'blue'}}>{item.thoiGianDiLamLai ? new Date(item.thoiGianDiLamLai).ddmmyyyy() : ''}</span>}/>
                        <TableCell type='text' content={item.thoiGianBaoTangBenBhxh} />
                        <TableCell type='text' content={item.ghiChu} />
                        <TableCell type='buttons' style={{ textAlign: 'center' }} content={item} permission={permission}
                            onEdit={() => this.modal.show(item)} onDelete={e => this.delete(e, item)} />
                    </tr>
                )
            });
        }

        return this.renderPage({
            icon: 'fa fa-bed',
            title: 'Quá trình nghỉ thai sản - Cán bộ',
            breadcrumb: [
                <Link key={0} to='/user/tccb'>Tổ chức cán bộ</Link>,
                <Link key={1} to='/user/tccb/qua-trinh/nghi-thai-san'>Nghỉ thai sản</Link>,
                'Nghỉ thai sản - Cán bộ'
            ],
            advanceSearch: <>
                <div className='row'>
                <FormSelect className='col-12 col-md-4' ref={e => this.timeType = e} label='Chọn loại thời gian' data={timeList} onChange={() => this.changeAdvancedSearch()} />
                    {this.timeType && this.timeType.value() && this.timeType.value() != 0 && <FormDatePicker type='month-mask' ref={e => this.fromYear = e} className='col-12 col-md-4' label='Từ thời gian' onChange={() => this.changeAdvancedSearch()} /> }
                    {this.timeType && this.timeType.value() && this.timeType.value() != 0 && <FormDatePicker type='month-mask' ref={e => this.toYear = e} className='col-12 col-md-4' label='Đến thời gian' onChange={() => this.changeAdvancedSearch()} /> }
                </div>
            </>,
            content: <>
                <div className='tile'>{table}</div>
                <Pagination style={{ marginLeft: '70px' }} {...{ pageNumber, pageSize, pageTotal, totalItem, pageCondition }}
                    getPage={this.props.getQtNghiThaiSanPage} />
                <EditModal ref={e => this.modal = e} permission={permission}
                    create={this.props.createQtNghiThaiSanGroupPageMa} update={this.props.updateQtNghiThaiSanGroupPageMa}
                    permissions={currentPermissions} shcc={this.shcc}
                /> 
            </>,
            backRoute: '/user/tccb/qua-trinh/nghi-thai-san',
            onCreate: permission && permission.write ? (e) => this.showModal(e) : null,
        });
    }
}

const mapStateToProps = state => ({ system: state.system, qtNghiThaiSan: state.tccb.qtNghiThaiSan });
const mapActionsToProps = {
    deleteQtNghiThaiSanGroupPageMa, createQtNghiThaiSanGroupPageMa,
    updateQtNghiThaiSanGroupPageMa, getQtNghiThaiSanPage
};
export default connect(mapStateToProps, mapActionsToProps)(QtNghiThaiSanGroupPage);
import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { AdminPage, TableCell, renderTable, AdminModal, FormTextBox, FormCheckbox, FormSelect, FormRichTextBox, FormDatePicker } from 'view/component/AdminPage';
import Pagination from 'view/component/Pagination';
import {
    updateQtNghiThaiSanStaff, deleteQtNghiThaiSanStaff, createQtNghiThaiSanStaff,
    getQtNghiThaiSanGroupPage, getQtNghiThaiSanPage
} from './redux';

import { SelectAdapter_DmDonVi } from 'modules/mdDanhMuc/dmDonVi/redux';
import { SelectAdapter_FwCanBo } from 'modules/mdTccb/tccbCanBo/redux';

const timeList = [
    { id: 0, text: 'Không' },
    { id: 1, text: 'Theo ngày bắt đầu nghỉ - ngày kết thúc nghỉ' },
    { id: 2, text: 'Theo ngày bắt đầu đi làm lại' }
];

class EditModal extends AdminModal {
    state = {
        stt: null,
        thoiGianBatDauNghi: '',
        thoiGianKetThucNghi: '',
    };
    componentDidMount() {
    }
    multiple = false;
    onShow = (item, multiple = true) => {
        this.multiple = multiple;
        let { daNopHoSoThaiSan, ghiChu, hoSoThaiSanDuocDuyet, shcc, soBhxh,
            soThangDuocNghi, stt, thoiGianBaoTangBenBhxh, thoiGianBatDauNghi, thoiGianDiLamLai,
            thoiGianKetThucNghi } = item ? item : {
                chucVu: '', daNopHoSoThaiSan: '', donVi: '', ghiChu: '', ho: '', hoSoThaiDuocDuyet: '', shcc: '', soBhxh: '',
                soThangDuocNghi: '', stt: '', ten: '', thoiGianBaoTangBenBhxh: '', thoiGianBatDauNghi: '', thoiGianDiLamLai: '',
                thoiGianKetThucNghi: ''
            };
        this.setState({ stt, item, thoiGianKetThucNghi, thoiGianBatDauNghi });
        setTimeout(() => {
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
        }, 500);
    };

    changeKichHoat = (value, target) => target.value(value ? 1 : 0) || target.value(value);

    onSubmit = (e) => {
        e.preventDefault();
        let list_ma = this.shcc.value();
        if (!Array.isArray(list_ma)) {
            list_ma = [list_ma];
        }
        if (list_ma.length == 0) {
            T.notify('Danh sách cán bộ trống', 'danger');
            this.shcc.focus();
        } else {
            list_ma.forEach((ma, index) => {
                const changes = {
                    daNopHoSoThaiSan: this.daNopHoSoThaiSan.value(),
                    ghiChu: this.ghiChu.value(),
                    hoSoThaiSanDuocDuyet: this.hoSoThaiSanDuocDuyet.value(),
                    shcc: ma,
                    soBhxh: this.soBhxh.value(),
                    soThangDuocNghi: this.soThangDuocNghi.value(),
                    thoiGianBaoTangBenBhxh: this.thoiGianBaoTangBenBhxh.value(),
                    thoiGianBatDauNghi: this.thoiGianBatDauNghi.value() ? Number(this.thoiGianBatDauNghi.value()) : null,
                    thoiGianDiLamLai: this.thoiGianDiLamLai.value() ? Number(this.thoiGianDiLamLai.value()) : null,
                    thoiGianKetThucNghi: this.thoiGianKetThucNghi.value() ? Number(this.thoiGianKetThucNghi.value()) : null,
                };
                if (index == list_ma.length - 1) {
                    this.state.stt ? this.props.update(this.state.stt, changes, this.hide, false) : this.props.create(changes, this.hide);
                    this.setState({
                        stt: ''
                    });
                    this.shcc.reset();
                }
                else {
                    this.state.stt ? this.props.update(this.state.stt, changes, this.hide, false) : this.props.create(changes, this.hide);
                }
            });
        }
    }

    render = () => {
        const readOnly = this.props.readOnly;
        return this.renderModal({
            title: this.state.stt ? 'Cập nhật nghỉ thai sản' : 'Tạo mới nghỉ thai sản',
            size: 'large',
            body: <div className='row'>
                <FormSelect type='text' className='col-md-12' multiple={this.multiple} ref={e => this.shcc = e} data={SelectAdapter_FwCanBo} label='Cán bộ' readOnly={this.state.stt ? true : false} />
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

class QtNghiThaiSan extends AdminPage {
    checked = parseInt(T.cookie('hienThiTheoCanBo')) == 1 ? true : false;
    state = { filter: {} };

    componentDidMount() {
        T.ready('/user/tccb', () => {
            T.onSearch = (searchText) => this.getPage(undefined, undefined, searchText || '');
            T.showSearchBox(() => {
                this.timeType?.value(0);
                this.fromYear?.value('');
                this.toYear?.value('');
                this.maDonVi?.value('');
                this.mulCanBo?.value('');
                setTimeout(() => this.changeAdvancedSearch(), 50);
            });
            if (this.checked) {
                this.hienThiTheoCanBo.value(true);
                this.props.getQtNghiThaiSanGroupPage();
            } else {
                this.props.getQtNghiThaiSanPage();
            }
            this.changeAdvancedSearch(true);
        });
    }

    showModal = (e) => {
        e.preventDefault();
        this.modal.show();
    }

    changeAdvancedSearch = (isInitial = false) => {
        let { pageNumber, pageSize } = this.props && this.props.qtNghiThaiSan && this.props.qtNghiThaiSan.page ? this.props.qtNghiThaiSan.page : { pageNumber: 1, pageSize: 50 };
        const timeType = this.timeType?.value() || 0;
        const fromYear = this.fromYear?.value() == '' ? null : this.fromYear?.value().getTime();
        const toYear = this.toYear?.value() == '' ? null : this.toYear?.value().getTime();
        const list_dv = this.maDonVi?.value().toString() || '';
        const list_shcc = this.mulCanBo?.value().toString() || '';
        const pageFilter = isInitial ? null : { list_dv, fromYear, toYear, list_shcc, timeType };
        this.setState({ filter: pageFilter }, () => {
            this.getPage(pageNumber, pageSize, '', (page) => {
                if (isInitial) {
                    const filter = page.filter || {};
                    this.setState({ filter: !$.isEmptyObject(filter) ? filter : pageFilter });
                    this.fromYear?.value(filter.fromYear || '');
                    this.toYear?.value(filter.toYear || '');
                    this.maDonVi?.value(filter.list_dv);
                    this.mulCanBo?.value(filter.list_shcc);
                    this.timeType?.value(filter.timeType);
                    if (!$.isEmptyObject(filter) && filter && (filter.fromYear || filter.toYear || filter.list_shcc || filter.list_dv || filter.timeType)) this.showAdvanceSearch();
                }
            });
        });
    }

    getPage = (pageN, pageS, pageC, done) => {
        if (this.checked) this.props.getQtNghiThaiSanGroupPage(pageN, pageS, pageC, this.state.filter, done);
        else this.props.getQtNghiThaiSanPage(pageN, pageS, pageC, this.state.filter, done);
    }

    groupPage = () => {
        this.checked = !this.checked;
        T.cookie('hienThiTheoCanBo', this.checked ? 1 : 0);
        this.getPage();
    }

    list = (batDauList, ketThucList, soQt) => {
        if (soQt == 0) return [];
        let batDaus = batDauList.split('??');
        let ketThucs = ketThucList.split('??');
        let results = [];
        for (let i = 0; i < soQt; i++) {
            batDaus[i] = batDaus[i].trim();
            ketThucs[i] = ketThucs[i].trim();
        }
        for (let i = 0; i < soQt; i++) {
            results.push(<p style={{ textTransform: 'uppercase' }}>{i + 1}. Bắt đầu: <span style={{ color: 'blue' }}>{batDaus[i] ? T.dateToText(Number(batDaus[i]), 'dd/mm/yyyy') : ''}</span> -
                Kết thúc: <span style={{ color: 'blue' }}>{ketThucs[i] ? T.dateToText(Number(ketThucs[i]), 'dd/mm/yyyy') : ''}</span></p>);
        }
        return results;
    }

    delete = (e, item) => {
        T.confirm('Xóa quá trình nghỉ thai sản', 'Bạn có chắc bạn muốn xóa quá trình nghỉ thai sản này', 'warning', true, isConfirm => {
            isConfirm && this.props.deleteQtNghiThaiSanStaff(item.stt, false, null, error => {
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
                this.props.qtNghiThaiSan.page_gr : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, list })
            : (this.props.qtNghiThaiSan && this.props.qtNghiThaiSan.page ? this.props.qtNghiThaiSan.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, pageCondition: {}, list: [] });

        let table = 'Không có danh sách!';
        if (list && list.length > 0) {
            table = renderTable({
                getDataSource: () => list, stickyHead: false,
                renderHead: () => (
                    <tr>
                        <th style={{ width: 'auto', textAlign: 'right' }}>#</th>
                        <th style={{ width: '30%', textAlign: 'center' }}>Cán bộ</th>
                        {!this.checked && <th style={{ width: '15%', textAlign: 'center' }}>Thời gian nghỉ</th>}
                        {!this.checked && <th style={{ width: '15%', textAlign: 'center' }}>Thời gian đi làm lại</th>}
                        {!this.checked && <th style={{ width: '20%', textAlign: 'center' }}>Thời gian báo tăng bên Bhxh</th>}
                        {!this.checked && <th style={{ width: '20%', textAlign: 'center' }}>Ghi chú</th>}
                        {this.checked && <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Số lần nghỉ</th>}
                        {this.checked && <th style={{ width: '70%', whiteSpace: 'nowrap', textAlign: 'center' }}>Danh sách thời gian nghỉ</th>}
                        <th style={{ width: 'auto', textAlign: 'center' }}>Thao tác</th>
                    </tr>
                ),
                renderRow: (item, index) => (
                    <tr key={index}>
                        <TableCell type='text' style={{ textAlign: 'right' }} content={(pageNumber - 1) * pageSize + index + 1} />
                        <TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={(
                            <>
                                <span>{item.ho + ' ' + item.ten}</span><br />
                                <a href='#' onClick={() => this.modal.show(item, false)}>{item.shcc}</a>
                            </>
                        )}
                        />
                        {!this.checked && <TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={(
                            <>
                                <span style={{ whiteSpace: 'nowrap' }}>Từ: <span style={{ color: 'blue' }}>{item.thoiGianBatDauNghi ? new Date(item.thoiGianBatDauNghi).ddmmyyyy() : ''}</span></span><br />
                                <span style={{ whiteSpace: 'nowrap' }}>Đến: <span style={{ color: 'blue' }}>{item.thoiGianKetThucNghi ? new Date(item.thoiGianKetThucNghi).ddmmyyyy() : ''}</span></span><br />
                            </>
                        )}
                        />}
                        {!this.checked && <TableCell type='text' style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={<span style={{ color: 'blue' }}>{item.thoiGianDiLamLai ? new Date(item.thoiGianDiLamLai).ddmmyyyy() : ''}</span>} />}
                        {!this.checked && <TableCell type='text' content={item.thoiGianBaoTangBenBhxh} />}
                        {!this.checked && <TableCell type='text' content={item.ghiChu} />}
                        {this.checked && <TableCell type='text' content={item.soLanNghi} />}
                        {this.checked && <TableCell type='text' content={this.list(item.danhSachBatDauNghi, item.danhSachKetThucNghi, item.soLanNghi)} />}
                        {
                            !this.checked && <TableCell type='buttons' style={{ textAlign: 'center' }} content={item} permission={permission}
                                onEdit={() => this.modal.show(item, false)} onDelete={e => this.delete(e, item)} > </TableCell>
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
            title: 'Nghỉ thai sản',
            breadcrumb: [
                <Link key={0} to='/user/tccb'>Tổ chức cán bộ</Link>,
                'Nghỉ thai sản'
            ],
            advanceSearch: <>
                <div className='row'>
                    <FormSelect className='col-12 col-md-4' ref={e => this.timeType = e} label='Chọn loại thời gian' data={timeList} onChange={() => this.changeAdvancedSearch()} />
                    {this.timeType && this.timeType.value() && this.timeType.value() != 0 && <FormDatePicker type='month-mask' ref={e => this.fromYear = e} className='col-12 col-md-4' label='Từ thời gian' onChange={() => this.changeAdvancedSearch()} />}
                    {this.timeType && this.timeType.value() && this.timeType.value() != 0 && <FormDatePicker type='month-mask' ref={e => this.toYear = e} className='col-12 col-md-4' label='Đến thời gian' onChange={() => this.changeAdvancedSearch()} />}
                    <FormSelect className='col-12 col-md-6' multiple={true} ref={e => this.maDonVi = e} label='Đơn vị' data={SelectAdapter_DmDonVi} onChange={() => this.changeAdvancedSearch()} allowClear={true} minimumResultsForSearch={-1} />
                    <FormSelect className='col-12 col-md-12' multiple={true} ref={e => this.mulCanBo = e} label='Cán bộ' data={SelectAdapter_FwCanBo} onChange={() => this.changeAdvancedSearch()} allowClear={true} minimumResultsForSearch={-1} />
                </div>
            </>,
            content: <>
                <div className='tile'>
                    <FormCheckbox label='Hiển thị theo cán bộ' ref={e => this.hienThiTheoCanBo = e} onChange={this.groupPage} />
                    {table}
                </div>
                <Pagination style={{ marginLeft: '70px' }} {...{ pageNumber, pageSize, pageTotal, totalItem, pageCondition }}
                    getPage={this.getPage} />
                <EditModal ref={e => this.modal = e} permission={permission}
                    permissions={currentPermissions}
                    create={this.props.createQtNghiThaiSanStaff} update={this.props.updateQtNghiThaiSanStaff} />
            </>,
            backRoute: '/user/tccb',
            onCreate: permission && permission.write && !this.checked ? (e) => this.showModal(e) : null,
        });
    }
}

const mapStateToProps = state => ({ system: state.system, qtNghiThaiSan: state.tccb.qtNghiThaiSan });
const mapActionsToProps = {
    createQtNghiThaiSanStaff, updateQtNghiThaiSanStaff, deleteQtNghiThaiSanStaff,
    getQtNghiThaiSanGroupPage, getQtNghiThaiSanPage,
};
export default connect(mapStateToProps, mapActionsToProps)(QtNghiThaiSan);
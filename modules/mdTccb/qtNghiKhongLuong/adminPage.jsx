import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { AdminModal, AdminPage, FormDatePicker, FormRichTextBox, FormSelect, FormTextBox, renderTable, TableCell, FormCheckbox } from 'view/component/AdminPage';
import Pagination from 'view/component/Pagination';
import Dropdown from 'view/component/Dropdown';
import { DateInput } from 'view/component/Input';
import { SelectAdapter_FwCanBo } from '../tccbCanBo/redux';
import {
    getQtNghiKhongLuongPage, deleteQtNghiKhongLuongStaff, createQtNghiKhongLuongStaff,
    updateQtNghiKhongLuongStaff, getQtNghiKhongLuongGroupPage
}
    from './redux';
import { SelectAdapter_DmDonVi } from 'modules/mdDanhMuc/dmDonVi/redux';

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

const timeList = [
    { id: 0, text: 'Không' },
    { id: 1, text: 'Theo thời gian nghỉ' },
    { id: 2, text: 'Theo ngày đi làm' },
    { id: 3, text: 'Theo ngày trở lại công tác' }
];

class EditModal extends AdminModal {
    state = {
        id: null,
        batDau: '',
        ketThuc: '',
        batDauType: 'dd/mm/yyyy',
        ketThucType: 'dd/mm/yyyy',
    };
    multiple = false;

    onShow = (item, multiple = true) => {
        this.multiple = multiple;
        let { id, shcc, soVanBan, batDau, batDauType, ketThuc, ketThucType, thoiGianDiLam, soThongBao, tongThoiGian, thoiGianTroLaiCongTac, ghiChu, thongBaoSo,
        thamGiaBHXH, thoiGianBaoGiam, thoiGianBaoTang } = item ? item : {
            id: '', shcc: '', soVanBan : '', batDau: '', batDauType: '', ketThuc: '', ketThucType: '', thoiGianDiLam: '', soThongBao: '', tongThoiGian: '', thoiGianTroLaiCongTac: '', ghiChu: '', thongBaoSo: '',
            thamGiaBHXH: '', thoiGianBaoGiam: '', thoiGianBaoTang: ''
        };

        this.setState({
            id, batDauType: batDauType ? batDauType : 'dd/mm/yyyy',
            ketThucType: ketThucType ? ketThucType : 'dd/mm/yyyy',
            batDau, ketThuc
        }, () => {
            this.maCanBo.value(shcc);
            this.soVanBan.value(soVanBan ? soVanBan : '');
            this.thoiGianDiLam.value(thoiGianDiLam ? thoiGianDiLam : '');
            this.soThongBao.value(soThongBao ? soThongBao : '');
            this.tongThoiGian.value(tongThoiGian ? tongThoiGian : '');
            this.thoiGianTroLaiCongTac.value(thoiGianTroLaiCongTac ? thoiGianTroLaiCongTac : '');
            this.ghiChu.value(ghiChu ? ghiChu : '');
            this.thongBaoSo.value(thongBaoSo ? thongBaoSo : '');
            this.thamGiaBHXH.value(thamGiaBHXH ? thamGiaBHXH : 0);
            this.thoiGianBaoGiam.value(thoiGianBaoGiam ? thoiGianBaoGiam : '');
            this.thoiGianBaoTang.value(thoiGianBaoTang ? thoiGianBaoTang : '');
            this.batDauType.setText({ text: batDauType ? batDauType : 'dd/mm/yyyy' });
            this.state.ketThuc != -1 && this.ketThucType.setText({ text: ketThucType ? ketThucType : 'dd/mm/yyyy' });
            if (this.state.ketThuc == -1) {
                this.setState({ denNay: true });
                this.denNayCheck.value(true);
                $('#ketThucDate').hide();
            } else {
                this.setState({ denNay: false });
                this.denNayCheck.value(false);
                $('#ketThucDate').show();
            }
            this.batDau.setVal(batDau ? batDau : '');
            this.state.ketThuc != -1 && this.ketThuc.setVal(ketThuc ? ketThuc : '');
        });
    };

    onSubmit = (e) => {
        e.preventDefault();
        let list_ma = this.maCanBo.value();
        if (!Array.isArray(list_ma)) {
            list_ma = [list_ma];
        }
        if (list_ma.length == 0) {
            T.notify('Danh sách cán bộ trống', 'danger');
            this.maCanBo.focus();
        } else if (!this.batDau.getVal()) {
            T.notify('Ngày bắt đầu nghỉ không lương trống', 'danger');
            this.batDau.focus();
        } else if (!this.state.denNay && !this.ketThuc.getVal()) {
            T.notify('Ngày kết thúc nghỉ không lương trống', 'danger');
            this.ketThuc.focus();
        } else if (!this.state.denNay && this.batDau.getVal() > this.ketThuc.getVal()) {
            T.notify('Ngày bắt đầu lớn hơn ngày kết thúc', 'danger');
            this.batDau.focus();
        } else {
            list_ma.forEach((ma, index) => {
                const changes = {
                    shcc: ma,
                    batDauType: this.state.batDauType,
                    batDau: this.batDau.getVal(),
                    ketThucType: !this.state.denNay ? this.state.ketThucType : '',
                    ketThuc: !this.state.denNay ? this.ketThuc.getVal() : -1,
                    soVanBan: this.soVanBan.value(),
                    thoiGianDiLam: this.thoiGianDiLam.value() ? Number(this.thoiGianDiLam.value()) : null,
                    soThongBao: this.soThongBao.value(),
                    tongThoiGian: this.tongThoiGian.value(),
                    thoiGianTroLaiCongTac: this.thoiGianTroLaiCongTac.value() ? Number(this.thoiGianTroLaiCongTac.value()) : null,
                    thongBaoSo: this.thongBaoSo.value(),
                    thamGiaBHXH: this.thamGiaBHXH.value(),
                    thoiGianBaoGiam: this.thoiGianBaoGiam.value(),
                    thoiGianBaoTang: this.thoiGianBaoTang.value(),
                    ghiChu: this.ghiChu.value(),
                };
                if (index == list_ma.length - 1) {
                    this.state.id ? this.props.update(this.state.id, changes, this.hide) : this.props.create(changes, this.hide);
                    this.setState({
                        id: ''
                    });
                    this.maCanBo.reset();
                }
                else {
                    this.state.id ? this.props.update(this.state.id, changes, null) : this.props.create(changes, null);
                }
            });
        }
    }

    handleKetThuc = (value) => {
        value ? $('#ketThucDate').hide() : $('#ketThucDate').show();
        this.setState({ denNay: value });
        if (!value) {
            this.ketThucType?.setText({ text: this.state.ketThucType ? this.state.ketThucType : 'dd/mm/yyyy' });
        } else {
            this.ketThucType?.setText({ text: '' });
        }
    }

    render = () => {
        const readOnly = this.props.readOnly;
        return this.renderModal({
            title: this.state.id ? 'Cập nhật quá trình nghỉ không lương' : 'Tạo mới quá trình nghỉ không lương',
            size: 'large',
            body: <div className='row'>
                <FormSelect className='col-md-12' multiple={this.multiple} ref={e => this.maCanBo = e} label='Cán bộ' data={SelectAdapter_FwCanBo} readOnly={this.state.id ? true : false} required />
                <FormTextBox className='col-md-4' ref={e => this.soVanBan = e} readOnly={readOnly} label='Số văn bản' />
                <FormTextBox className='col-md-4' ref={e => this.soThongBao = e} label='Số thông báo' />
                <FormTextBox className='col-md-4' ref={e => this.thongBaoSo = e} label='Thông báo số' />
                <FormCheckbox ref={e => this.thamGiaBHXH = e} label='Tham gia BHXH' className='col-md-12' />
                <div className='form-group col-md-6'><DateInput ref={e => this.batDau = e} placeholder='Thời gian bắt đầu'
                    label={
                        <div style={{ display: 'flex' }}>Thời gian bắt đầu (định dạng:&nbsp; <Dropdown ref={e => this.batDauType = e}
                            items={[...Object.keys(EnumDateType).map(key => EnumDateType[key].text)]}
                            onSelected={item => this.setState({ batDauType: item })} readOnly={readOnly} />)&nbsp;<span style={{ color: 'red' }}> *</span></div>
                    }
                    type={this.state.batDauType ? typeMapper[this.state.batDauType] : null} readOnly={readOnly} /></div>
                <FormCheckbox ref={e => this.denNayCheck = e} label='Đến nay' onChange={this.handleKetThuc} className='form-group col-md-3' />
                <div className='form-group col-md-6' id='ketThucDate'><DateInput ref={e => this.ketThuc = e} placeholder='Thời gian kết thúc'
                    label={
                        <div style={{ display: 'flex' }}>Thời gian kết thúc (định dạng:&nbsp; <Dropdown ref={e => this.ketThucType = e}
                            items={[...Object.keys(EnumDateType).map(key => EnumDateType[key].text)]}
                            onSelected={item => this.setState({ ketThucType: item })} readOnly={readOnly} />)&nbsp;<span style={{ color: 'red' }}> *</span></div>
                    }
                    type={this.state.ketThucType ? typeMapper[this.state.ketThucType] : null} /></div>
                <span className='col-md-12'></span>
                <FormDatePicker className='col-md-4' ref={e => this.thoiGianDiLam = e} label='Thời gian đi làm' type='date-mask' readOnly={readOnly}/>
                <FormDatePicker className='col-md-4' ref={e => this.thoiGianTroLaiCongTac = e} label='Thời gian trở lại công tác' type='date-mask' readOnly={readOnly}/>
                <FormTextBox className='col-md-4' ref={e => this.tongThoiGian = e} label='Tổng thời gian' />
                <FormTextBox className='col-md-6' ref={e => this.thoiGianBaoGiam = e} label='Thời gian báo giảm' />
                <FormTextBox className='col-md-6' ref={e => this.thoiGianBaoTang = e} label='Thời gian báo tăng' />
                <FormRichTextBox className='col-md-12' ref={e => this.ghiChu = e} rows={2} readOnly={readOnly} label='Ghi chú' placeholder='Ghi chú (tối đa 200 ký tự)' maxLength={200} />
            </div>
        });
    }
}

class QtNghiKhongLuong extends AdminPage {
    checked = parseInt(T.cookie('hienThiTheoCanBo')) == 1 ? true : false;
    state = { filter: {} };

    componentDidMount() {
        T.ready('/user/tccb', () => {
            T.clearSearchBox();
            T.onSearch = (searchText) => this.getPage(undefined, undefined, searchText || '');
            T.showSearchBox(() => {
                this.fromYear?.value('');
                this.toYear?.value('');
                this.maDonVi?.value('');
                this.mulCanBo?.value('');
                this.tinhTrang?.value('');
                this.timeType?.value('');
                setTimeout(() => this.changeAdvancedSearch(), 50);
            });
            this.getPage();
            this.changeAdvancedSearch(true);
        });
    }

    showModal = (e) => {
        e.preventDefault();
        this.modal.show();
    }

    changeAdvancedSearch = (isInitial = false) => {
        let { pageNumber, pageSize } = this.props && this.props.qtNghiKhongLuong && this.props.qtNghiKhongLuong.page ? this.props.qtNghiKhongLuong.page : { pageNumber: 1, pageSize: 50 };
        const fromYear = this.fromYear?.value() == '' ? null : this.fromYear?.value().getTime();
        const toYear = this.toYear?.value() == '' ? null : this.toYear?.value().getTime();
        const list_dv = this.maDonVi?.value().toString() || '';
        const list_shcc = this.mulCanBo?.value().toString() || '';
        const tinhTrang = this.tinhTrang?.value() == '' ? null : this.tinhTrang?.value();
        const timeType = this.timeType?.value() == '' ? 0 : this.timeType?.value();
        const pageFilter = isInitial ? null : { list_dv, fromYear, toYear, list_shcc, tinhTrang, timeType };
        this.setState({ filter: pageFilter }, () => {
            this.getPage(pageNumber, pageSize, '', (page) => {
                if (isInitial) {
                    const filter = page.filter || {};
                    this.setState({ filter: !$.isEmptyObject(filter) ? filter : pageFilter });
                    this.fromYear?.value(filter.fromYear || '');
                    this.toYear?.value(filter.toYear || '');
                    this.maDonVi?.value(filter.list_dv);
                    this.mulCanBo?.value(filter.list_shcc);
                    this.tinhTrang?.value(filter.tinhTrang);
                    this.timeType?.value(filter.timeType);
                    if (!$.isEmptyObject(filter) && filter && (filter.fromYear || filter.toYear || filter.list_shcc || filter.list_dv || filter.tinhTrang || filter.timeType)) this.showAdvanceSearch();
                }
            });
        });
    }

    getPage = (pageN, pageS, pageC, done) => {
        this.props.getQtNghiKhongLuongPage(pageN, pageS, pageC, this.state.filter, done);
    }

    groupPage = () => {
        this.checked = !this.checked;
        T.cookie('hienThiTheoCanBo', this.checked ? 1 : 0);
        this.getPage();
    }

    list = (text, i, j) => {
        if (!text) return [];
        let items = text.split('??').map(str => <p key={i--} >{j - i}. {str}</p>);
        return items;
    }

    delete = (e, item) => {
        T.confirm('Xóa quá trình nghỉ không lương', 'Bạn có chắc bạn muốn xóa quá trình nghỉ không lương này?', 'warning', true, isConfirm => {
            isConfirm && this.props.deleteQtNghiKhongLuongStaff(item.id, error => {
                if (error) T.notify(error.message ? error.message : 'Xoá quá trình nghỉ không lương bị lỗi!', 'danger');
                else T.alert('Xoá quá trình nghỉ không lương thành công!', 'success', false, 800);
            });
        });
        e.preventDefault();
    }

    render() {
        const currentPermissions = this.props.system && this.props.system.user && this.props.system.user.permissions ? this.props.system.user.permissions : [],
            permission = this.getUserPermission('qtNghiKhongLuong', ['read', 'write', 'delete']);
        let { pageNumber, pageSize, pageTotal, totalItem, pageCondition, list } = this.checked ? (
            this.props.qtNghiKhongLuong && this.props.qtNghiKhongLuong.page_gr ?
                this.props.qtNghiKhongLuong.page_gr : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, list })
            : (this.props.qtNghiKhongLuong && this.props.qtNghiKhongLuong.page ? this.props.qtNghiKhongLuong.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, pageCondition: {}, list: [] });
        let table = 'Không có danh sách!';
        if (list && list.length > 0) {
            table = renderTable({
                getDataSource: () => list, stickyHead: false,
                renderHead: () => (
                    <tr>
                        <th style={{ width: 'auto', textAlign: 'right' }}>#</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Cán bộ</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Thời gian</th>
                        <th style={{ width: '100%', whiteSpace: 'nowrap' }}>Thông tin nghỉ</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Thời gian đi làm</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Tổng thời gian</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Tham gia BHXH</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Tình trạng</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Thao tác</th>
                    </tr>
                ),
                renderRow: (item, index) => (
                    <tr key={index}>
                        <TableCell type='text' style={{ textAlign: 'right' }} content={(pageNumber - 1) * pageSize + index + 1} />
                        <TableCell type='link' onClick={() => this.modal.show(item, false)} style={{ whiteSpace: 'nowrap' }} content={(
                            <>
                                <span>{(item.hoCanBo ? item.hoCanBo : (item.ho ? item.ho : '')) + ' ' + (item.tenCanBo ? item.tenCanBo : (item.ten ? item.ten : ''))}</span><br />
                                {item.shcc}
                            </>
                        )}
                        />
                        <TableCell type='text' content={(
                            <>
                                {item.batDau ? <span style={{ whiteSpace: 'nowrap' }}>Bắt đầu: <span style={{ color: 'blue' }}>{item.batDau ? T.dateToText(item.batDau, item.batDauType ? item.batDauType : 'dd/mm/yyyy') : ''}</span><br /></span> : null}
                                {item.ketThuc && item.ketThuc != -1 ? <span style={{ whiteSpace: 'nowrap' }}>Kết thúc: <span style={{ color: 'blue' }}>{item.ketThuc && item.ketThuc != -1 ? T.dateToText(item.ketThuc, item.ketThucType ? item.ketThucType : 'dd/mm/yyyy') : ''}</span><br /></span> : null}
                            </>
                        )}
                        />
                        <TableCell type='text' content={(
                            <>
                                <span style={{ color: 'blue' }}>Số văn bản: </span>{item.soVanBan}<br/>
                                <span style={{ color: 'blue' }}>Thông báo số: </span>{item.thongBaoSo}<br/>
                                <span style={{ color: 'blue' }}>Số thông báo: </span>{item.soThongBao}
                            </>
                        )}
                        />
                        <TableCell type='text' content={(
                            <>
                                <span style={{ color: 'blue' }}>{item.batDau ? T.dateToText(item.batDau, 'dd/mm/yyyy') : ''}</span>
                            </>
                        )}
                        />
                        <TableCell type='text' content={(
                            <>
                                <span>{item.tongThoiGian}</span>
                            </>
                        )}
                        />
                        <TableCell type='checkbox' content={(
                            <>
                                <span>{item.thamGiaBHXH}</span>
                            </>
                        )}
                        />
                        <TableCell type='text' content={(
                            <>
                                <span>{(item.ketThuc == -1 || item.ketThuc >= item.today) ? <span style={{ color: 'red', whiteSpace: 'nowrap' }}>Đang nghỉ</span> : <span style={{ color: 'red', whiteSpace: 'nowrap' }}>Đã kết thúc nghỉ</span>}</span>
                            </>
                        )}></TableCell>
                        <TableCell type='buttons' style={{ textAlign: 'center' }} content={item} permission={permission}
                                onEdit={() => this.modal.show(item, false)} onDelete={this.delete} >
                            </TableCell>
                    </tr>
                )
            });
        }

        return this.renderPage({
            icon: 'fa fa-window-close',
            title: ' Quá trình nghỉ không lương',
            breadcrumb: [
                <Link key={0} to='/user/tccb'>Tổ chức cán bộ</Link>,
                'Quá trình nghỉ không lương'
            ],
            advanceSearch: <>
                <div className='row'>
                <FormSelect className='col-12 col-md-4' ref={e => this.timeType = e} label='Chọn loại thời gian' data={timeList} onChange={() => this.changeAdvancedSearch()} />
                    {this.timeType && this.timeType.value() && this.timeType.value() != 0 && <FormDatePicker type='month-mask' ref={e => this.fromYear = e} className='col-12 col-md-4' label='Từ thời gian' onChange={() => this.changeAdvancedSearch()} />}
                    {this.timeType && this.timeType.value() && this.timeType.value() != 0 && <FormDatePicker type='month-mask' ref={e => this.toYear = e} className='col-12 col-md-4' label='Đến thời gian' onChange={() => this.changeAdvancedSearch()} />}
                    <FormSelect className='col-12 col-md-4' ref={e => this.tinhTrang = e} label='Tình trạng'
                        data={[
                            { id: 1, text: 'Đã kết thúc nghỉ' }, { id: 2, text: 'Đang nghỉ' }
                        ]} onChange={() => this.changeAdvancedSearch()} allowClear={true} minimumResultsForSearch={-1} />
                    <FormSelect className='col-12 col-md-6' multiple={true} ref={e => this.maDonVi = e} label='Đơn vị' data={SelectAdapter_DmDonVi} onChange={() => this.changeAdvancedSearch()} allowClear={true} minimumResultsForSearch={-1} />
                    <FormSelect className='col-12 col-md-6' multiple={true} ref={e => this.mulCanBo = e} label='Cán bộ' data={SelectAdapter_FwCanBo} onChange={() => this.changeAdvancedSearch()} allowClear={true} minimumResultsForSearch={-1} />
                </div>
            </>,
            content: <>
                <div className='tile'>
                    {table}
                </div>
                <Pagination style={{ marginLeft: '70px' }} {...{ pageNumber, pageSize, pageTotal, totalItem, pageCondition }}
                    getPage={this.getPage} />
                <EditModal ref={e => this.modal = e} permission={permission}
                    create={this.props.createQtNghiKhongLuongStaff} update={this.props.updateQtNghiKhongLuongStaff}
                    permissions={currentPermissions}
                />
            </>,
            backRoute: '/user/tccb',
            onCreate: permission && permission.write && !this.checked ? (e) => this.showModal(e) : null,
        });
    }
}

const mapStateToProps = state => ({ system: state.system, qtNghiKhongLuong: state.tccb.qtNghiKhongLuong });
const mapActionsToProps = {
    getQtNghiKhongLuongPage, deleteQtNghiKhongLuongStaff, createQtNghiKhongLuongStaff,
    updateQtNghiKhongLuongStaff, getQtNghiKhongLuongGroupPage,
};
export default connect(mapStateToProps, mapActionsToProps)(QtNghiKhongLuong);
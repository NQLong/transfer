import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { AdminPage, TableCell, renderTable, AdminModal, FormTextBox, FormDatePicker, FormCheckbox, FormSelect } from 'view/component/AdminPage';
import Pagination from 'view/component/Pagination';
import {
    getQtChucVuPage, updateQtChucVuStaff,
    deleteQtChucVuStaff, createQtChucVuStaff, getQtChucVuGroupPage,
    getQtChucVuAll,
} from './redux';
import { SelectAdapter_DmChucVuV2, getDmChucVu } from 'modules/mdDanhMuc/dmChucVu/redux';
import { SelectAdapter_DmDonVi } from 'modules/mdDanhMuc/dmDonVi/redux';
import { SelectAdapter_DmBoMonTheoDonVi } from 'modules/mdDanhMuc/dmBoMon/redux';
import { SelectAdapter_FwCanBo } from 'modules/mdTccb/tccbCanBo/redux';
import { SelectAdapter_DmNgachCdnnV2 } from 'modules/mdDanhMuc/dmNgachCdnn/redux';

const timeList = [
    { id: 0, text: 'Không' },
    { id: 1, text: 'Theo ngày ra quyết định bổ nhiệm' },
    { id: 2, text: 'Theo ngày thôi chức vụ' },
    { id: 3, text: 'Theo ngày ra quyết định thôi chức vụ' }
];

export class EditModal extends AdminModal {
    state = { shcc: null, stt: '', chucVuChinh: 0, thoiChucVu: 0, donVi: 0, capChucVu: 0 };
    componentDidMount() {
        
    }

    onShow = (item) => {
        let { stt, shcc, maChucVu, maDonVi, soQuyetDinh, ngayRaQuyetDinh, ngayRaQd, soQd, chucVuChinh, maBoMon, thoiChucVu, soQdThoiChucVu, ngayRaQdThoiChucVu, ngayThoiChucVu, capChucVu } = item ? item : {
            stt: '',
            shcc: '', maChucVu: '', maDonVi: '', soQuyetDinh: '', ngayRaQuyetDinh: '', chucVuChinh: 0, maBoMon: '',
            ngayRaQd: '', soQd: '', thoiChucVu: 0, ngayRaQdThoiChucVu: '', ngayThoiChucVu: '', soQdThoiChucVu: '', capChucVu: 0
        };
        this.setState({ shcc, stt, item, chucVuChinh, thoiChucVu: thoiChucVu ? 1 : 0, capChucVu: capChucVu }, () => {
            this.shcc.value(shcc ? shcc : '');
            this.maChucVu.value(maChucVu ? maChucVu : '');
            this.maDonVi.value(maDonVi ? maDonVi : '');
            this.soQuyetDinh.value(soQd ? soQd : (soQuyetDinh ? soQuyetDinh : ''));
            this.ngayRaQuyetDinh.value(ngayRaQd ? ngayRaQd : (ngayRaQuyetDinh ? ngayRaQuyetDinh : ''));
            this.chucVuChinh.value(chucVuChinh ? 1 : 0);
            this.maBoMon.value(maBoMon ? maBoMon : '');
            this.thoiChucVu.value(thoiChucVu ? 1 : 0);
            this.state.thoiChucVu ? this.soQdThoiChucVu.value(soQdThoiChucVu ? soQdThoiChucVu : '') : $('#soQdThoiChucVu').hide();
            this.state.thoiChucVu ? this.ngayRaQdThoiChucVu.value(ngayRaQdThoiChucVu ? ngayRaQdThoiChucVu : '') : $('#ngayRaQdThoiChucVu').hide();
            this.state.thoiChucVu ? this.ngayThoiChucVu.value(ngayThoiChucVu ? ngayThoiChucVu : '') : $('#ngayThoiChucVu').hide();
        });
    };

    changeKichHoat = (value, target) => target.value(value ? 1 : 0) || target.value(value);

    checkChucVu = (changes) => {
        if (changes.chucVuChinh == this.state.chucVuChinh) {
            this.state.stt ? this.props.update(this.state.stt, changes, this.hide, false) : this.props.create(changes, this.hide);
            return;
        }
        T.confirm('Thông tin chức vụ chính', 'Đây sẽ là chức vụ chính của cán bộ', 'warning', true, isConfirm => {
            isConfirm && this.props.getQtChucVuAll(changes.shcc, data => {
                if (data) {
                    data.rows.forEach(item => {
                        if (item.chucVuChinh && item.stt != this.state.stt) {
                            this.props.update(item.stt, { chucVuChinh: 0 });
                        }
                    });
                }
                if (this.state.stt) {
                    this.props.update(this.state.stt, changes, this.hide, false);
                } else {
                    this.props.create(changes, this.hide, false);
                }
            });
        });
    }

    onSubmit = (e) => {
        e.preventDefault();
        const changes = {
            shcc: this.shcc.value(),
            maChucVu: this.maChucVu.value(),
            maDonVi: this.maDonVi.value(),
            soQd: this.soQuyetDinh.value(),
            ngayRaQd: Number(this.ngayRaQuyetDinh.value()),
            chucVuChinh: this.chucVuChinh.value() ? 1 : 0,
            maBoMon: this.maBoMon.value(),
            thoiChucVu: this.thoiChucVu.value() ? 1 : 0,
            soQdThoiChucVu: this.soQdThoiChucVu.value(),
            ngayRaQdThoiChucVu: Number(this.ngayRaQdThoiChucVu.value()),
            ngayThoiChucVu: Number(this.ngayThoiChucVu.value()),
        };
        if (changes.shcc == '') {
            T.notify('Mã số cán bộ bị trống');
            this.shcc.focus();
        } else {
            if (!changes.chucVuChinh) {
                if (this.state.stt) {
                    this.props.update(this.state.stt, changes, this.hide);
                } else {
                    this.props.create(changes, this.hide);
                }
            } else
                this.checkChucVu(changes);
        }
    }

    handleDonVi = (data) => {
        data && this.setState({ donVi: data.id }, () => {
            this.maBoMon.value('');
        });
    }

    checkChucVuSwitch = () => {
        if (this.state.chucVuChinh) {
            return true;
        }
        return false;
    }

    handleThoiChucVu = (value) => {
        value ? $('#soQdThoiChucVu').show() : $('#soQdThoiChucVu').hide();
        value ? $('#ngayRaQdThoiChucVu').show() : $('#ngayRaQdThoiChucVu').hide();
        value ? $('#ngayThoiChucVu').show() : $('#ngayThoiChucVu').hide();
        this.setState({ thoiChucVu: value });
    }

    handleChucVu = (data) => {
        data && this.props.getDmChucVu(data.id, (item) => {
            this.setState({ capChucVu: item.isCapTruong });
        });
    }

    render = () => {
        const readOnly = this.props.readOnly;
        return this.renderModal({
            title: this.state.shcc ? 'Cập nhật quá trình chức vụ' : 'Tạo mới quá trình chức vụ',
            size: 'large',
            body: <div className='row'>
                <FormSelect className='col-md-6' ref={e => this.shcc = e} label='Cán bộ' data={SelectAdapter_FwCanBo} allowClear={true} readOnly={readOnly} />
                <FormSelect className='col-md-6' ref={e => this.maChucVu = e} label='Chức vụ' data={SelectAdapter_DmChucVuV2} onChange={this.handleChucVu} allowClear={true} readOnly={readOnly} />
                <FormSelect className='col-md-12' ref={e => this.maDonVi = e} label='Đơn vị của chức vụ' data={SelectAdapter_DmDonVi} onChange={this.handleDonVi} allowClear={true} readOnly={readOnly} />
                <FormSelect className='col-md-12' ref={e => this.maBoMon = e} style={{ display: this.state.capChucVu ? 'none' : '' }} label='Bộ môn của chức vụ' data={SelectAdapter_DmBoMonTheoDonVi(this.state.donVi)} allowClear={true} readOnly={readOnly} />
                <FormCheckbox className='col-md-12' ref={e => this.chucVuChinh = e} label='Chức vụ chính' readOnly={this.checkChucVuSwitch()} />
                <FormTextBox type='text' className='col-md-6' ref={e => this.soQuyetDinh = e} label='Số quyết định bổ nhiệm' readOnly={readOnly} />
                <FormDatePicker type='date-mask' className='col-md-6' ref={e => this.ngayRaQuyetDinh = e} label='Ngày ra quyết định bổ nhiệm' readOnly={readOnly} />
                <FormCheckbox className='col-md-12' ref={e => this.thoiChucVu = e} onChange={this.handleThoiChucVu} label='Thôi giữ chức vụ' readOnly={readOnly} />
                <div className='col-md-4' id='soQdThoiChucVu'><FormTextBox type='text' ref={e => this.soQdThoiChucVu = e} label='Số quyết định thôi chức vụ' readOnly={readOnly} /> </div>
                <div className='col-md-4' id='ngayThoiChucVu'> <FormDatePicker type='date-mask' ref={e => this.ngayThoiChucVu = e} label='Ngày ra thôi chức vụ' readOnly={readOnly} /> </div>
                <div className='col-md-4' id='ngayRaQdThoiChucVu'> <FormDatePicker type='date-mask' ref={e => this.ngayRaQdThoiChucVu = e} label='Ngày ra quyết định thôi chức vụ' readOnly={readOnly} /> </div>
            </div>
        });
    }
}

class QtChucVu extends AdminPage {
    checked = parseInt(T.cookie('hienThiTheoCanBo')) == 1 ? true : false;
    state = { filter: {}, timeType: 0 };

    componentDidMount() {
        T.clearSearchBox();
        T.ready('/user/tccb', () => {
            T.onSearch = (searchText) => this.getPage(undefined, undefined, searchText || '');
            T.showSearchBox(() => {

            });
            if (this.checked) {
                this.hienThiTheoCanBo.value(true);
            }
            this.changeAdvancedSearch(false, true);
        });
    }

    changeAdvancedSearch = (isInitial = false, isReset = false) => {
        let { pageNumber, pageSize } = this.props && this.props.qtChucVu && this.props.qtChucVu.page ? this.props.qtChucVu.page : { pageNumber: 1, pageSize: 50 };
        const timeType = this.timeType?.value() || 0;
        const fromYear = this.fromYear?.value() == '' ? null : this.fromYear?.value().getTime();
        const toYear = this.toYear?.value() == '' ? null : this.toYear?.value().getTime();
        const listDonVi = this.maDonVi?.value().toString() || '';
        const listShcc = this.mulCanBo?.value().toString() || '';
        const listChucVu = this.mulMaChucVu?.value().toString() || '';
        const gioiTinh = this.gioiTinh?.value() == '' ? null : this.gioiTinh?.value();
        const listChucDanh = this.mulMaChucDanh?.value().toString() || '';
        const fromAge = this.fromAge?.value();
        const toAge = this.toAge?.value();
        const filterCookie = T.storage('pageQtChucVu').F;
        const pageFilter = (isInitial || isReset) ? filterCookie : { listDonVi, fromYear, toYear, listShcc, timeType, listChucVu, gioiTinh, listChucDanh, fromAge, toAge };
        this.setState({ filter: isReset ? {} : pageFilter }, () => {
            this.getPage(pageNumber, pageSize, '', (page) => {
                if (isInitial) {
                    const filter = page.filter || {};
                    this.setState({ filter: !$.isEmptyObject(filter) ? filter : pageFilter });
                    this.fromYear?.value(filter.fromYear || filterCookie.fromYear || '');
                    this.toYear?.value(filter.toYear || filterCookie.toYear || '');
                    this.maDonVi?.value(filter.listDonVi || filterCookie.listDonVi);
                    this.mulCanBo?.value(filter.listShcc || filterCookie.listShcc);
                    this.timeType?.value(filter.timeType || filterCookie.timeType);
                    this.mulMaChucVu?.value(filter.listChucVu || filterCookie.listChucVu);
                    this.gioiTinh?.value(filter.gioiTinh || filterCookie.gioiTinh);
                    this.mulMaChucDanh?.value(filter.listChucDanh || filterCookie.listChucDanh);
                    this.fromAge?.value(filter.fromAge || filterCookie.fromAge);
                    this.toAge?.value(filter.toAge || filterCookie.toAge);
                    Object.values(filterCookie).some(item => item  && item != '' && item != 0) && typeof(filterCookie) !== 'string' && this.showAdvanceSearch();

                } else if (isReset) {
                        this.fromYear?.value('');
                        this.toYear?.value('');
                        this.maDonVi.value('');
                        this.mulCanBo.value('');
                        this.timeType.value('');
                        this.mulMaChucVu.value('');
                        this.gioiTinh.value('');
                        this.mulMaChucDanh.value('');
                        this.fromAge.value('');
                        this.toAge.value('');
                        this.hideAdvanceSearch();
                        
                }
                else{
                    this.hideAdvanceSearch();
                }
            });
        });
    }

    getPage = (pageN, pageS, pageC, done) => {
        if (this.checked) this.props.getQtChucVuGroupPage(pageN, pageS, pageC, this.state.filter, done);
        else this.props.getQtChucVuPage(pageN, pageS, pageC, this.state.filter, done);
    }

    groupPage = () => {
        this.checked = !this.checked;
        T.cookie('hienThiTheoCanBo', this.checked ? 1 : 0);
        this.getPage();
    }

    showModal = (e) => {
        e.preventDefault();
        this.modal.show();
    }

    list = (dsChucVu, dsDonVi, dsBomon) => {
        if (!dsChucVu) return '';
        let dsChucVuSplitted = dsChucVu.split('??');
        let dsDonViSplitted = dsDonVi.split('??');
        let dsBomonSplitted = dsBomon.split('??');
        const danhSach = [];
        for (let i = 0; i < dsChucVuSplitted.length; i++) {
            dsDonViSplitted[i] = dsDonViSplitted[i].trim();
            dsBomonSplitted[i] = dsBomonSplitted[i].trim();
            danhSach.push(<span key={i}>- {dsChucVuSplitted[i]}: {dsBomonSplitted[i] ? dsBomonSplitted[i] : (dsDonViSplitted[i] ? dsDonViSplitted[i] : '')}{i != dsChucVuSplitted.length - 1 ? <br /> : ''}</span>);
        }
        return danhSach;
    }

    delete = (e, item) => {
        T.confirm('Xóa chức vụ', 'Bạn có chắc bạn muốn xóa chức vụ này?', 'warning', true, isConfirm => {
            isConfirm && this.props.deleteQtChucVuStaff({ stt: item.stt, shcc: item.shcc }, false, null, error => {
                if (error) T.notify(error.message ? error.message : 'Xoá chức vụ bị lỗi!', 'danger');
                else T.alert('Xoá chức vụ thành công!', 'success', false, 800);
            });
        });
        e.preventDefault();
    }

    checkTimeType = (value) => {
        this.setState({ timeType: value });
    }

    render() {
        const permission = this.getUserPermission('qtChucVu', ['read', 'write', 'delete']);
        let { pageNumber, pageSize, pageTotal, totalItem, pageCondition, list } = this.checked ?
            (this.props.qtChucVu && this.props.qtChucVu.pageGr ?
                this.props.qtChucVu.pageGr : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, pageCondition: {}, list })
            : (this.props.qtChucVu && this.props.qtChucVu.page ? this.props.qtChucVu.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, pageCondition: {}, list: [] });
        let fullTable = renderTable({
            getDataSource: () => list, stickyHead: true,
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', textAlign: 'right' }}>#</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Cán bộ</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Ngày sinh</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Chức danh<br />nghề nghiệp</th>
                    <th style={{ width: '40%', whiteSpace: 'nowrap' }}>Chức vụ</th>
                    <th style={{ width: '60%', whiteSpace: 'nowrap' }}>Đơn vị</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Quyết định<br />bổ nhiệm</th>
                    <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>Thao tác</th>
                </tr>
            ),
            renderRow: (item, index) => (
                <tr key={index} style={{ backgroundColor: item.chucVuChinh ? '#d4f2dc' : '' }}>
                    <TableCell type='text' style={{ textAlign: 'right' }} content={(pageNumber - 1) * pageSize + index + 1} />
                    <TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={(
                        <>
                            <span>{item.ho + ' ' + item.ten}</span><br />
                            <a href='#' onClick={() => this.modal.show(item)}>{item.shcc}</a>
                        </>
                    )}
                    />
                    <TableCell type='text' content={item.ngayRaQuyetDinh ? new Date(item.ngaySinh).ddmmyyyy() : ''} />
                    <TableCell type='text' style={{ textAlign: 'center' }} content={item.chucDanhNgheNghiep} />
                    <TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={<b>{item.tenChucVu}</b>} />
                    <TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={<>{item.tenBoMon ? <>{item.tenBoMon}<br /> </> : ''}  {item.tenDonVi}</>} />
                    <TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={(
                        <>
                            <span>Số: {item.soQuyetDinh}</span><br />
                            <span>Ngày: <span style={{ color: 'blue' }}>{item.ngayRaQuyetDinh ? new Date(item.ngayRaQuyetDinh).ddmmyyyy() : ''}</span></span>
                        </>
                    )}
                    />
                    <TableCell type='buttons' style={{ textAlign: 'center' }} content={item} permission={permission}
                        onEdit={() => this.modal.show(item)} onDelete={this.delete} >
                    </TableCell>
                </tr>
            )
        });

        let groupTable = renderTable({
            getDataSource: () => list, stickyHead: true,
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', textAlign: 'right' }}>#</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Cán bộ</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Số chức vụ</th>
                    <th style={{ width: '100%', whiteSpace: 'nowrap' }}>Chi tiết chức vụ</th>
                    <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>Thao tác</th>
                </tr>
            ),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell type='text' style={{ textAlign: 'right' }} content={(pageNumber - 1) * pageSize + index + 1} />
                    <TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={(
                        <>
                            <span>{item.ho + ' ' + item.ten}</span><br />
                            <a href='#' onClick={() => this.modal.show(item)}>{item.shcc}</a>
                        </>
                    )}
                    />
                    <TableCell type='text' content={item.soChucVu} style={{ textAlign: 'right' }} />
                    <TableCell type='text' content={this.list(item.danhSachChucVu, item.danhSachDonVi, item.danhSachBoMon)} />
                    <TableCell type='buttons' style={{ textAlign: 'center' }} content={item} permission={permission}>
                        <Link className='btn btn-success' to={`/user/tccb/qua-trinh/chuc-vu/group/${item.shcc}`} >
                            <i className='fa fa-lg fa-compress' />
                        </Link>
                    </TableCell>
                </tr>
            )
        });

        return this.renderPage({
            icon: 'fa fa-black-tie',
            title: ' Quá trình chức vụ',
            breadcrumb: [
                <Link key={0} to='/user/tccb'>Tổ chức cán bộ</Link>,
                'Quá trình chức vụ'
            ],
            advanceSearch: <>
                <div className='row'>
                    <FormSelect className='col-lg-4 col-md-12' ref={e => this.timeType = e} label='Chọn loại thời gian' data={timeList} onChange={value => { this.checkTimeType(value); }} />
                    {this.state.timeType != 0 && <FormDatePicker type='date-mask' ref={e => this.fromYear = e} className='col-12 col-md-4' label='Từ' />}
                    {(this.state.timeType != 0) ? <FormDatePicker type='date-mask' ref={e => this.toYear = e} className='col-12 col-md-4' label='Đến' /> : <div className='col-lg-9' />}
                    <FormSelect className='col-12 col-md-4' multiple={true} ref={e => this.maDonVi = e} label='Theo đơn vị' data={SelectAdapter_DmDonVi} allowClear={true} minimumResultsForSearch={-1} placeHolder='Có thể chọn nhiều đơn vị' />
                    <FormSelect className='col-12 col-md-4' multiple={true} ref={e => this.mulCanBo = e} label='Theo cán bộ cụ thể' data={SelectAdapter_FwCanBo} allowClear={true} minimumResultsForSearch={-1} />
                    <FormSelect ref={e => this.gioiTinh = e} label='Theo giới tính' className='col-12 col-md-4' data={[
                        { id: '01', text: 'Nam' },
                        { id: '02', text: 'Nữ' },
                    ]} allowClear={true} minimumResultsForSearch={-1} />
                    <FormSelect className='col-md-3' multiple={true} ref={e => this.mulMaChucVu = e} label='Theo chức vụ' data={SelectAdapter_DmChucVuV2} allowClear={true} minimumResultsForSearch={-1} />
                    <FormSelect className='col-md-3' multiple={true} ref={e => this.mulMaChucDanh = e} label='Theo chức danh nghề nghiệp' data={SelectAdapter_DmNgachCdnnV2} allowClear={true} minimumResultsForSearch={-1} />
                    <FormTextBox type='number' className='col-md-3' ref={e => this.fromAge = e} label='Từ độ tuổi' />
                    <FormTextBox type='number' className='col-md-3' ref={e => this.toAge = e} label='Tới độ tuổi' />
                    <div className='col-12'>
                        <div className='row justify-content-between'>
                            <div className='form-group col-md-12' style={{ textAlign: 'right' }}>
                                <button className='btn btn-danger' style={{ marginRight: '10px' }} type='button' onClick={e => e.preventDefault() || this.changeAdvancedSearch(null, true)}>
                                    <i className='fa fa-fw fa-lg fa-times' />Xóa bộ lọc
                                </button>
                                <button className='btn btn-info' type='button' onClick={e => e.preventDefault() || this.changeAdvancedSearch()}>
                                    <i className='fa fa-fw fa-lg fa-search-plus' />Tìm kiếm
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </>,
            content: <>
                <div className='tile'>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <FormCheckbox label='Hiển thị theo cán bộ' ref={e => this.hienThiTheoCanBo = e} onChange={this.groupPage} />
                        <div style={{ marginBottom: '10px' }}>Tìm thấy: <b>{totalItem}</b> kết quả.</div>
                    </div>

                    {this.checked ? groupTable : fullTable}
                </div>
                <Pagination style={{ marginLeft: '70px' }} {...{ pageNumber, pageSize, pageTotal, totalItem, pageCondition }}
                    getPage={this.getPage} />
                <EditModal ref={e => this.modal = e} permission={permission} getQtChucVuAll={this.props.getQtChucVuAll}
                    create={this.props.createQtChucVuStaff} update={this.props.updateQtChucVuStaff} getDmChucVu={this.props.getDmChucVu}
                />
            </>,
            backRoute: '/user/tccb',
            onCreate: permission && permission.write && !this.checked ? (e) => this.showModal(e) : null,
            onExport: !this.checked ? (e) => {
                e.preventDefault();
                const { listDv, fromYear, toYear, listShcc, timeType, listCv, gioiTinh } = (this.state.filter && this.state.filter != '%%%%%%%%') ? this.state.filter : { fromYear: null, toYear: null, listShcc: null, listDv: null, timeType: 0, listCv: null, gioiTinh: null };

                T.download(T.url(`/api/qua-trinh/chuc-vu/download-excel/${listShcc ? listShcc : null}/${listDv ? listDv : null}/${fromYear ? fromYear : null}/${toYear ? toYear : null}/${timeType}/${listCv ? listCv : null}/${gioiTinh ? gioiTinh : null}`), 'chucvu.xlsx');
            } : null
        });
    }
}

const mapStateToProps = state => ({ system: state.system, qtChucVu: state.tccb.qtChucVu });
const mapActionsToProps = {
    getQtChucVuPage, deleteQtChucVuStaff, createQtChucVuStaff,
    updateQtChucVuStaff, getQtChucVuGroupPage, getQtChucVuAll, getDmChucVu
};
export default connect(mapStateToProps, mapActionsToProps)(QtChucVu);
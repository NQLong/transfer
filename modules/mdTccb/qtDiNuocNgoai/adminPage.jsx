import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { AdminModal, AdminPage, FormDatePicker, FormRichTextBox, FormSelect, FormTextBox, renderTable, TableCell, FormCheckbox } from 'view/component/AdminPage';
import Pagination from 'view/component/Pagination';
import Dropdown from 'view/component/Dropdown';
import { DateInput } from 'view/component/Input';
import { SelectAdapter_FwCanBo } from '../tccbCanBo/redux';
import {
    getQtDiNuocNgoaiPage, deleteQtDiNuocNgoai, createQtDiNuocNgoai,
    updateQtDiNuocNgoai, getQtDiNuocNgoaiGroupPage
}
    from './redux';
import { SelectAdapter_DmDonVi } from 'modules/mdDanhMuc/dmDonVi/redux';
import { SelectAdapter_DmQuocGia } from 'modules/mdDanhMuc/dmQuocGia/redux';
import { SelectAdapter_DmMucDichNuocNgoaiV2 } from 'modules/mdDanhMuc/dmMucDichNuocNgoai/redux';

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
    { id: 1, text: 'Theo ngày đi' },
    { id: 2, text: 'Theo ngày về' },
    { id: 3, text: 'Theo ngày quyết định đi nước ngoài' },
    { id: 4, text: 'Theo ngày quyết định tiếp nhận' },
];
class EditModal extends AdminModal {
    state = {
        id: null,
        ngayDi: '',
        ngayVe: null,
        dangDienRa: true,
        ngayDiType: 'dd/mm/yyyy',
        ngayVeType: 'dd/mm/yyyy',
        tiepNhan: false,
        daTiepNhan: false,
    };
    // Table name: QT_DI_NUOC_NGOAI { id, shcc, quocGia, ngayDi, ngayDiType, ngayVe, ngayVeType, mucDich, noiDung, chiPhi, ghiChu, soQuyetDinh, ngayQuyetDinh, loaiChiPhi, soQdTiepNhan, ngayQdTiepNhan, noiDungTiepNhan, ngayVeNuoc }

    onShow = (item) => {
        let { id, shcc, quocGia, ngayDi, ngayDiType, ngayVe, ngayVeType, mucDich, noiDung, chiPhi, ghiChu, soQuyetDinh, ngayQuyetDinh, today, soQdTiepNhan, ngayQdTiepNhan, noiDungTiepNhan, ngayVeNuoc } = item ? item : {
            id: '', shcc: '', quocGia: '', ngayDi: null, ngayDiType: '', ngayVe: null, ngayVeType: '', mucDich: '', noiDung: '', chiPhi: null, ghiChu: '', soQuyetDinh: '', ngayQuyetDinh: null, today: new Date().getTime(), soQdTiepNhan: '', ngayQdTiepNhan: null, noiDungTiepNhan: '', ngayVeNuoc: null,
        };

        this.setState({
            id, ngayDiType: ngayDiType ? ngayDiType : 'dd/mm/yyyy',
            ngayVeType: ngayVeType ? ngayVeType : 'dd/mm/yyyy',
            ngayDi, ngayVe,
            dangDienRa: ngayVe ? (ngayVe == -1 || ngayVe >= today) : true,
            tiepNhan: soQdTiepNhan ? true : false,
            daTiepNhan: soQdTiepNhan ? true : false,
        }, () => {
            this.shcc.value(shcc);
            if (quocGia) {
                quocGia = quocGia.split(',');
                this.quocGia.value(quocGia);
            } else this.quocGia.value('');
            this.mucDich.value(mucDich);
            this.noiDung.value(noiDung || '');
            this.chiPhi.value(chiPhi || '');
            this.ghiChu.value(ghiChu || '');
            this.soQuyetDinh.value(soQuyetDinh || '');
            this.ngayQuyetDinh.value(ngayQuyetDinh || '');

            this.ngayDiType.setText({ text: ngayDiType ? ngayDiType : 'dd/mm/yyyy' });
            this.ngayDi.setVal(ngayDi || '');
            this.denNayCheck.value(this.state.dangDienRa);
            this.ngayVeType.setText({ text: ngayVeType ? ngayVeType : 'dd/mm/yyyy' });
            if (this.state.ngayVe) {
                this.state.ngayVe != -1 && this.ngayVe.setVal(ngayVe);
            } else this.ngayVe.setVal(null);
            if (this.state.tiepNhan) {
                this.tiepNhanCheck.value(true);
                $('#tiepNhan').show();
            } else {
                $('#tiepNhan').hide();
                this.tiepNhanCheck.value(false);
            }
            this.soQdTiepNhan.value(soQdTiepNhan || '');
            this.ngayQdTiepNhan.value(ngayQdTiepNhan || '');
            this.noiDungTiepNhan.value(noiDungTiepNhan || '');
            this.ngayVeNuoc.value(ngayVeNuoc || '');
        });
    };

    onSubmit = (e) => {
        e.preventDefault();
        let listMa = this.shcc.value();
        if (!Array.isArray(listMa)) {
            listMa = [listMa];
        }
        if (listMa.length == 0) {
            T.notify('Danh sách cán bộ trống', 'danger');
            this.shcc.focus();
        } else if (!this.noiDung.value()) {
            T.notify('Nội dung đi nước ngoài trống', 'danger');
            this.noiDung.focus();
        } else if (!this.quocGia.value().length) {
            T.notify('Danh sách quốc gia trống', 'danger');
            this.quocGia.focus();
        } else if (!this.ngayDi.getVal()) {
            T.notify('Ngày đi nước ngoài trống', 'danger');
            this.ngayDi.focus();
        } else if (!this.ngayVe.getVal()) {
            T.notify('Ngày về nước trống', 'danger');
            this.ngayVe.focus();
        } else if (this.ngayDi.getVal() > this.ngayVe.getVal()) {
            T.notify('Ngày đi lớn hơn ngày về', 'danger');
            this.ngayDi.focus();
        } else if (this.state.tiepNhan && !this.soQdTiepNhan.value()) {
            T.notify('Số quyết định tiếp nhận trống', 'danger');
            this.soQdTiepNhan.focus();
        } else {
            listMa.forEach((ma, index) => {
                const changes = {
                    shcc: ma,
                    quocGia: this.quocGia.value().toString(),
                    mucDich: this.mucDich.value(),
                    noiDung: this.noiDung.value(),
                    chiPhi: this.chiPhi.value(),
                    ghiChu: this.ghiChu.value(),
                    soQuyetDinh: this.soQuyetDinh.value(),
                    ngayQuyetDinh: this.ngayQuyetDinh.value() ? Number(this.ngayQuyetDinh.value()) : '',

                    ngayDiType: this.state.ngayDiType,
                    ngayDi: this.ngayDi.getVal(),
                    ngayVeType: this.state.ngayVeType,
                    ngayVe: this.ngayVe.getVal(),

                    soQdTiepNhan: this.state.tiepNhan ? this.soQdTiepNhan.value() : null,
                    ngayQdTiepNhan: this.state.tiepNhan ? Number(this.ngayQdTiepNhan.value()) : null,
                    noiDungTiepNhan: this.state.tiepNhan ? this.noiDungTiepNhan.value() : null,
                    ngayVeNuoc: this.state.tiepNhan ? this.ngayVeNuoc.value() : null,
                };
                if (index == listMa.length - 1) {
                    this.state.id ? this.props.update(this.state.id, changes, this.hide) : this.props.create(changes, this.hide);
                    this.setState({
                        id: ''
                    });
                    this.shcc.reset();
                    this.quocGia.reset();
                }
                else {
                    this.state.id ? this.props.update(this.state.id, changes, null) : this.props.create(changes, null);
                }
            });
        }
    }

    handleNgayVe = (value) => {
        this.setState({ dangDienRa: value });
    }

    handleTiepNhan = (value) => {
        this.tiepNhanCheck.value(value);
        if (value) {
            this.setState({ tiepNhan: true }, () => {
                $('#tiepNhan').show();
            });
        } else {
            this.setState({ tiepNhan: false }, () => {
                $('#tiepNhan').hide();
            });
        }
    }

    render = () => {
        const readOnly = this.props.readOnly;
        return this.renderModal({
            title: this.state.id ? 'Cập nhật quá trình đi nước ngoài' : 'Tạo mới quá trình đi nước ngoài',
            size: 'elarge',
            body: <div className='row'>
                <FormSelect className='col-md-12' multiple={this.state.id ? false : true} ref={e => this.shcc = e} label='Cán bộ' data={SelectAdapter_FwCanBo} readOnly={readOnly} required />
                <FormTextBox className='col-md-3' ref={e => this.soQuyetDinh = e} type='text' label='Số quyết định' readOnly={readOnly} />
                <FormDatePicker className='col-md-3' ref={e => this.ngayQuyetDinh = e} type='date-mask' label='Ngày quyết định' readOnly={readOnly} />
                <FormSelect className='col-md-6' ref={e => this.mucDich = e} label='Mục đích' data={SelectAdapter_DmMucDichNuocNgoaiV2} readOnly={readOnly} />
                <FormRichTextBox className='col-md-12' ref={e => this.noiDung = e} rows={2} label='Nội dung' placeholder='Nhập nội dung đi nước ngoài (tối đa 1000 ký tự)' required readOnly={readOnly} />
                <FormSelect className='col-md-12' multiple={true} ref={e => this.quocGia = e} label='Quốc gia' data={SelectAdapter_DmQuocGia} required readOnly={readOnly} />
                <FormTextBox className='col-md-8' ref={e => this.chiPhi = e} rows={2} type='text' label='Chi phí' readOnly={readOnly} placeholder='Nhập chi phí (tối đa 500 ký tự)'/>
                <FormTextBox className='col-md-4' ref={e => this.ghiChu = e} type='text' label='Ghi chú' readOnly={readOnly} />

                <div className='form-group col-md-5'><DateInput ref={e => this.ngayDi = e} placeholder='Ngày đi'
                    label={
                        <div style={{ display: 'flex' }}>Ngày đi (&nbsp; <Dropdown ref={e => this.ngayDiType = e}
                            items={[...Object.keys(EnumDateType).map(key => EnumDateType[key].text)]}
                            onSelected={item => this.setState({ ngayDiType: item })} readOnly={readOnly} />)&nbsp;<span style={{ color: 'red' }}> *</span></div>
                    }
                    type={this.state.ngayDiType ? typeMapper[this.state.ngayDiType] : null} readOnly={readOnly} /></div>
                <FormCheckbox ref={e => this.denNayCheck = e} label='Đang diễn ra' onChange={this.handleNgayVe} className='form-group col-md-2' readOnly={readOnly} />
                <div className='form-group col-md-5' id='ketThucDate'><DateInput ref={e => this.ngayVe = e} placeholder='Ngày về'
                    label={
                        <div style={{ display: 'flex' }}>{this.state.dangDienRa ? 'Ngày về dự kiến' : 'Ngày về'} (&nbsp; <Dropdown ref={e => this.ngayVeType = e}
                            items={[...Object.keys(EnumDateType).map(key => EnumDateType[key].text)]}
                            onSelected={item => this.setState({ ngayVeType: item })} readOnly={readOnly} />)&nbsp;<span style={{ color: 'red' }}> *</span></div>
                    }
                    type={this.state.ngayVeType ? typeMapper[this.state.ngayVeType] : null} readOnly={readOnly} /></div>
                <FormCheckbox label={this.state.daTiepNhan ? 'Đã tiếp nhận' : this.state.tiepNhan ? 'Đang nhập dữ liệu tiếp nhận' : 'Bấm vào đây nếu muốn tạo mới tiếp nhận'} onChange={this.handleTiepNhan} className='form-group col-md-6' ref={e => this.tiepNhanCheck = e} readOnly={readOnly} />
                <div className='row form-group col-12' id='tiepNhan'>
                    <FormTextBox className='col-md-4' ref={e => this.soQdTiepNhan = e} type='text' label='Số quyết định tiếp nhận' readOnly={readOnly} required />
                    <FormDatePicker className='col-md-4' ref={e => this.ngayQdTiepNhan = e} type='date-mask' label='Ngày quyết định tiếp nhận' readOnly={readOnly} />
                    <FormDatePicker className='col-md-4' ref={e => this.ngayVeNuoc = e} type='date-mask' label='Ngày về nước' readOnly={readOnly} />
                    <FormRichTextBox className='col-md-12' ref={e => this.noiDungTiepNhan = e} rows={3} readOnly={readOnly} label='Nội dung tiếp nhận' placeholder='Nhập nội dung tiếp nhận về nước (tối đa 1000 ký tự)' />
                </div>
            </div>
        });
    }
}

class QtDiNuocNgoai extends AdminPage {
    checked = parseInt(T.cookie('hienThiTheoCanBo')) == 1 ? true : false;
    state = { filter: {}, visibleTime: false};

    componentDidMount() {
        T.ready('/user/tccb', () => {
            T.clearSearchBox();
            T.onSearch = (searchText) => this.getPage(undefined, undefined, searchText || '');
            T.showSearchBox(() => {
                // const pageFilter = isInitial ? null : { listDv, fromYear, toYear, listShcc, tinhTrang, timeType, loaiHocVi, mucDich };
                let filterCookie = T.getCookiePage('pageQtDiNuocNgoai', 'F'), {
                    timeType = '', fromYear = '', toYear = '', listDv = '', listShcc = '', tinhTrang = '', loaiHocVi = '', mucDich = '',
                } = filterCookie;
                this.timeType.value(timeType);
                this.fromYear?.value(fromYear);
                this.toYear?.value(toYear);
                this.maDonVi.value(listDv);
                this.mulCanBo.value(listShcc);
                this.tinhTrang.value(tinhTrang);
                this.loaiHocVi.value(loaiHocVi);
                this.mucDich.value(mucDich);
                setTimeout(() => this.changeAdvancedSearch(), 50);
            });
            if (this.checked) {
                this.hienThiTheoCanBo.value(true);
            }
            this.getPage();
            this.changeAdvancedSearch(true);
        });
    }

    showModal = (e) => {
        e.preventDefault();
        this.modal.show();
    }

    changeAdvancedSearch = (isInitial = false, isReset = false) => {
        let { pageNumber, pageSize, pageCondition } = this.props && this.props.qtDiNuocNgoai && this.props.qtDiNuocNgoai.page ? this.props.qtDiNuocNgoai.page : { pageNumber: 1, pageSize: 50, pageCondition: {} };

        if (pageCondition && (typeof pageCondition == 'string')) T.setTextSearchBox(pageCondition);

        const timeType = this.timeType.value() || '';
        let fromYear = null;
        if (this.fromYear?.value()) {
            fromYear = this.fromYear?.value();
            fromYear.setHours(0, 0, 0, 0);
            fromYear = fromYear.getTime();
        }
        let toYear = null;
        if (this.toYear?.value()) {
            toYear = this.toYear?.value();
            toYear.setHours(23, 59, 59, 999);
            toYear = toYear.getTime();
        }
        const listDv = this.maDonVi.value().toString() || '';
        const listShcc = this.mulCanBo.value().toString() || '';
        const tinhTrang = this.tinhTrang.value() == '' ? null : this.tinhTrang.value();
        const loaiHocVi = this.loaiHocVi.value().toString() || '';
        const mucDich = this.mucDich.value().toString() || '';
        const pageFilter = (isInitial || isReset) ? {} : { listDv, fromYear, toYear, listShcc, tinhTrang, timeType, loaiHocVi, mucDich };
        this.setState({ filter: pageFilter }, () => {
            this.getPage(pageNumber, pageSize, pageCondition, (page) => {
                if (isInitial) {
                    const filter = page.filter || {};
                    const filterCookie = T.getCookiePage('pageQtDiNuocNgoai', 'F');
                    this.setState({ filter: !$.isEmptyObject(filter) ? filter : pageFilter });

                    this.fromYear?.value(filter.fromYear || filterCookie.fromYear || '');
                    this.toYear?.value(filter.toYear || filterCookie.toYear || '');
                    this.maDonVi.value(filter.listDv || filterCookie.listDv || '');
                    this.mulCanBo.value(filter.listShcc || filterCookie.listShcc || '');
                    this.timeType.value(filter.timeType || filterCookie.timeType || '');
                    this.tinhTrang.value(filter.tinhTrang || filterCookie.tinhTrang || '');
                    this.loaiHocVi.value(filter.loaiHocVi || filterCookie.loaiHocVi || '');
                    this.mucDich.value(filter.mucDich || filterCookie.mucDich || '');
                    if (this.fromYear?.value() || this.toYear?.value() || this.mulCanBo.value() || this.maDonVi.value() || this.timeType.value() || this.tinhTrang.value() || this.loaiHocVi.value() || this.mucDich.value()) this.showAdvanceSearch();
                } else if (isReset) {
                    this.fromYear?.value('');
                    this.toYear?.value('');
                    this.maDonVi.value('');
                    this.mulCanBo.value('');
                    this.timeType.value('');
                    this.tinhTrang.value('');
                    this.loaiHocVi.value('');
                    this.mucDich.value('');
                }
            });
        });
    }

    getPage = (pageN, pageS, pageC, done) => {
        if (this.checked) this.props.getQtDiNuocNgoaiGroupPage(pageN, pageS, pageC, this.state.filter, done);
        else this.props.getQtDiNuocNgoaiPage(pageN, pageS, pageC, this.state.filter, done);
    }

    groupPage = () => {
        this.checked = !this.checked;
        T.cookie('hienThiTheoCanBo', this.checked ? 1 : 0);
        this.getPage();
    }

    list = (danhSachMucDich, ngayDiList, ngayVeList, ngayDiTypeList, ngayVeTypeList, soQt) => {
        if (soQt == 0) return [];
        let ngayDis = ngayDiList.split('??');
        let ngayVes = ngayVeList.split('??');
        let ngayDiTypes = ngayDiTypeList.split('??');
        let ngayVeTypes = ngayVeTypeList.split('??');
        let danhSachMucDichs = danhSachMucDich.split('??');
        let results = [];
        for (let i = 0; i < soQt; i++) {
            ngayDis[i] = ngayDis[i].trim();
            ngayVes[i] = ngayVes[i].trim();
            danhSachMucDichs[i] = danhSachMucDichs[i].trim();
        }
        for (let i = 0; i < soQt; i++) {
            let s = danhSachMucDichs[i];
            s += ' (' + (ngayDis[i] ? T.dateToText(Number(ngayDis[i]), ngayDiTypes[i] ? ngayDiTypes[i] : 'dd/mm/yyyy') : '') + ' - ';
            s += ngayVes[i] ? (ngayVes[i] != '-1' ? T.dateToText(Number(ngayVes[i]), ngayVeTypes[i] ? ngayVeTypes[i] : 'dd/mm/yyyy') : 'Đến nay') : '';
            s += ')';
            results.push(<div key={results.length}> <span>
                Lần {i+1}. {s}
            </span></div>);
        }
        return results;
    }

    delete = (e, item) => {
        T.confirm('Xóa quá trình đi nước ngoài', 'Bạn có chắc bạn muốn xóa quá trình đi nước ngoài này?', 'warning', true, isConfirm => {
            isConfirm && this.props.deleteQtDiNuocNgoai(item.id, error => {
                if (error) T.notify(error.message ? error.message : 'Xoá quá trình đi nước ngoài bị lỗi!', 'danger');
                else T.alert('Xoá quá trình đi nước ngoài thành công!', 'success', false, 800);
            });
        });
        e.preventDefault();
    }

    handleTime = (value) => {
        value ? this.setState({ visibleTime: true }) : this.setState({ visibleTime: false });
    }
    render() {
        const permission = this.getUserPermission('qtDiNuocNgoai');
        let { pageNumber, pageSize, pageTotal, totalItem, pageCondition, list } = this.checked ? (
            this.props.qtDiNuocNgoai && this.props.qtDiNuocNgoai.pageGr ?
                this.props.qtDiNuocNgoai.pageGr : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, list })
            : (this.props.qtDiNuocNgoai && this.props.qtDiNuocNgoai.page ? this.props.qtDiNuocNgoai.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, pageCondition: {}, list: [] });
        let table = 'Không có danh sách!';
        if (list && list.length > 0) {
            table = renderTable({
                getDataSource: () => list, stickyHead: true,
                renderHead: () => (
                    <tr>
                        <th style={{ width: 'auto', textAlign: 'right' }}>#</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Cán bộ</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Học vị</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Chức danh nghề nghiệp</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Chức vụ<br/>Đơn vị công tác</th>
                        {!this.checked && <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Ngày quyết định</th>}
                        {!this.checked && <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Số quyết định</th>}
                        {!this.checked && <th style={{ width: '50%', whiteSpace: 'nowrap' }}>Nơi đến</th>}
                        {!this.checked && <th style={{ width: '50%', whiteSpace: 'nowrap' }}>Mục đích</th>}
                        {!this.checked && <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Nội dung</th>}
                        {!this.checked && <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Thời gian</th>}
                        {!this.checked && <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Tình trạng</th>}
                        {this.checked && <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Số quá trình</th>}
                        {this.checked && <th style={{ width: '100%', whiteSpace: 'nowrap' }}>Danh sách</th>}
                        <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Thao tác</th>
                    </tr>
                ),
                renderRow: (item, index) => (
                    <tr key={index}>
                        <TableCell type='text' style={{ textAlign: 'right' }} content={(pageNumber - 1) * pageSize + index + 1} />
                        <TableCell type='link' onClick={() => this.modal.show(item)} style={{ whiteSpace: 'nowrap' }} content={(
                            <>
                                <span>{(item.hoCanBo ? item.hoCanBo.normalizedName() : ' ') + ' ' + (item.tenCanBo ? item.tenCanBo.normalizedName() : ' ')}</span><br />
                                {item.shcc}
                            </>
                        )} />
                        <TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={item.tenHocVi || ''} />
                        <TableCell type='text' content={item.tenChucDanhNgheNghiep || ''} />
                        <TableCell type='text' content={(
                            <>
                                <span> {item.tenChucVu || ''}<br /> </span>
                                {(item.tenDonVi || '').normalizedName()}
                            </>
                        )} />
                        {!this.checked && <TableCell type='text' style={{color: 'blue'}} content={(item.ngayQuyetDinh ? T.dateToText(item.ngayQuyetDinh, 'dd/mm/yyyy') : '')} />}
                        {!this.checked && <TableCell type='text' content={(<b> {item.soQuyetDinh || ''} </b>)} />}
                        {!this.checked && <TableCell type='text' style={{color: 'blue'}} content={(item.danhSachQuocGia || '')} />}
                        {!this.checked && <TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={(<b>{item.tenMucDich || ''}</b>)} />}
                        {!this.checked && <TableCell type='text' contentClassName='multiple-lines-5' content={(item.noiDung || '')} />}
                        {!this.checked && <TableCell type='text' content={(
                            <>
                                {item.ngayDi ? <span style={{ whiteSpace: 'nowrap' }}>Ngày đi: <span style={{ color: 'blue' }}>{item.ngayDi ? T.dateToText(item.ngayDi, item.ngayDiType ? item.ngayDiType : 'dd/mm/yyyy') : ''}</span><br /></span> : null}
                                {item.ngayVe && item.ngayVe != -1 ? <span style={{ whiteSpace: 'nowrap' }}>Ngày về: <span style={{ color: 'blue' }}>{item.ngayVe && item.ngayVe != -1 ? T.dateToText(item.ngayVe, item.ngayVeType ? item.ngayVeType : 'dd/mm/yyyy') : ''}</span><br /></span> : null}
                            </>
                        )}
                        />}
                        {this.checked && <TableCell type='text' content={item.soQuaTrinh} />}
                        {this.checked && <TableCell type='text' content={this.list(item.danhSachMucDich, item.danhSachNgayDi, item.danhSachNgayVe, item.danhSachNgayDiType, item.danhSachNgayVeType, item.soQuaTrinh)} />}
                        {!this.checked && <TableCell type='text' content={(
                            <>
                                <span>{item.ngayVe >= item.today ? <span style={{ whiteSpace: 'nowrap' }}><i>Đang ở<br/>nước ngoài</i></span> : item.soQdTiepNhan ? <span style={{ color: 'blue', whiteSpace: 'nowrap' }}> Đã tiếp nhận<br/>về nước</span>: <span style={{ color: 'red', whiteSpace: 'nowrap' }}> Hết hạn và<br/>chưa tiếp nhận </span>} </span>
                            </>
                        )}></TableCell>}
                        {
                            !this.checked && <TableCell type='buttons' style={{ textAlign: 'center' }} content={item} permission={permission}
                                onEdit={() => this.modal.show(item)} onDelete={this.delete} >
                            </TableCell>
                        }
                        {
                            this.checked && <TableCell type='buttons' style={{ textAlign: 'center' }} content={item} permission={permission}>
                                <Link className='btn btn-success' to={`/user/tccb/qua-trinh/di-nuoc-ngoai/group/${item.shcc}`} >
                                    <i className='fa fa-lg fa-compress' />
                                </Link>
                            </TableCell>
                        }
                    </tr>
                )
            });
        }

        return this.renderPage({
            icon: 'fa fa-fighter-jet',
            title: ' Quá trình đi nước ngoài',
            breadcrumb: [
                <Link key={0} to='/user/tccb'>Tổ chức cán bộ</Link>,
                'Quá trình đi nước ngoài'
            ],
            advanceSearch: <>
                <div className='row'>
                <FormSelect className='col-12 col-md-4' ref={e => this.timeType = e} label='Chọn loại thời gian' data={timeList} allowClear={true} onChange={this.handleTime} />
                    {this.state.visibleTime && 
                        <>
                            <FormDatePicker type='date-mask' ref={e => this.fromYear = e} className='col-12 col-md-2' label='Từ thời gian' />
                            <FormDatePicker type='date-mask' ref={e => this.toYear = e} className='col-12 col-md-2' label='Đến thời gian' />
                        </>}
                    <FormSelect ref={e => this.loaiHocVi = e} label='Loại học vị' className='col-12 col-md-4' data={[
                        { id: '04', text: 'Cử nhân' },
                        { id: '03', text: 'Thạc sĩ' },
                        { id: '02', text: 'Tiến sĩ' },
                    ]} multiple={true} allowClear={true} minimumResultsForSearch={-1} />
                    <FormSelect className='col-12 col-md-4' ref={e => this.tinhTrang = e} label='Tình trạng'
                        data={[
                            { id: 1, text: 'Đã tiếp nhận về nước' },
                            { id: 2, text: 'Hết hạn và chưa tiếp nhận' },
                            { id: 3, text: 'Đang ở nước ngoài' },
                        ]} allowClear={true} minimumResultsForSearch={-1} />
                    <FormSelect className='col-12 col-md-6' multiple={true} ref={e => this.maDonVi = e} label='Đơn vị' data={SelectAdapter_DmDonVi} allowClear={true} minimumResultsForSearch={-1} />
                    <FormSelect className='col-12 col-md-6' multiple={true} ref={e => this.mulCanBo = e} label='Cán bộ' data={SelectAdapter_FwCanBo} allowClear={true} minimumResultsForSearch={-1} />
                    <FormSelect className='col-12 col-md-6' multiple={true} ref={e => this.mucDich = e} label='Mục đích' data={SelectAdapter_DmMucDichNuocNgoaiV2} allowClear={true} minimumResultsForSearch={-1} />
                    <div className='form-group col-12' style={{ justifyContent: 'end', display: 'flex' }}>
                        <button className='btn btn-danger' style={{ marginRight: '10px' }} type='button' onClick={e => e.preventDefault() || this.changeAdvancedSearch(null, true)}>
                            <i className='fa fa-fw fa-lg fa-times' />Xóa bộ lọc
                        </button>
                        <button className='btn btn-info' type='button' onClick={e => e.preventDefault() || this.changeAdvancedSearch()}>
                            <i className='fa fa-fw fa-lg fa-search-plus' />Tìm kiếm
                        </button>
                    </div>
                </div>
            </>,
            content: <>
                {!this.checked && <div className='tile'>
                    <h3 className='tile-title'>
                        Thống kê
                    </h3>
                    <b>{'Số lượng: ' + totalItem.toString()}</b>
                </div>}
                <div className='tile'>
                    <FormCheckbox label='Hiển thị theo cán bộ' ref={e => this.hienThiTheoCanBo = e} onChange={this.groupPage} />
                    {table}
                </div>
                <Pagination style={{ marginLeft: '70px' }} {...{ pageNumber, pageSize, pageTotal, totalItem, pageCondition }}
                    getPage={this.getPage} />
                <EditModal ref={e => this.modal = e} readOnly={!permission.write}
                    create={this.props.createQtDiNuocNgoai} update={this.props.updateQtDiNuocNgoai}
                />
            </>,
            backRoute: '/user/tccb',
            onCreate: permission && permission.write && !this.checked ? (e) => this.showModal(e) : null,
            onExport: !this.checked ? (e) => {
                e.preventDefault();
                const filter = T.stringify(this.state.filter);

                this.state.filter && this.state.filter.timeType == 4 ? T.download(T.url(`/api/qua-trinh/tiep-nhan-ve-nuoc/download-excel/${filter}`), 'DANH SACH VE NUOC.xlsx') : T.download(T.url(`/api/qua-trinh/di-nuoc-ngoai/download-excel/${filter}`), 'dinuocngoai.xlsx');
            } : null
        });
    }
}

const mapStateToProps = state => ({ system: state.system, qtDiNuocNgoai: state.tccb.qtDiNuocNgoai });
const mapActionsToProps = {
    getQtDiNuocNgoaiPage, deleteQtDiNuocNgoai, createQtDiNuocNgoai,
    updateQtDiNuocNgoai, getQtDiNuocNgoaiGroupPage,
};
export default connect(mapStateToProps, mapActionsToProps)(QtDiNuocNgoai);
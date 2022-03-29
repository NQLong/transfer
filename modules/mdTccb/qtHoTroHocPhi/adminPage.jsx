import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { AdminModal, AdminPage, FormDatePicker, FormRichTextBox, FormSelect, FormTextBox, renderTable, TableCell, FormCheckbox } from 'view/component/AdminPage';
import Pagination from 'view/component/Pagination';
import Dropdown from 'view/component/Dropdown';
import { DateInput } from 'view/component/Input';
import { SelectAdapter_FwCanBo } from '../tccbCanBo/redux';
import { getQtHoTroHocPhiPage, deleteQtHoTroHocPhi, createQtHoTroHocPhi, updateQtHoTroHocPhi, getQtHoTroHocPhiGroupPage } from './redux';
import { SelectAdapter_DmDonVi } from 'modules/mdDanhMuc/dmDonVi/redux';
import { SelectAdapter_DmHoTroHocPhiCoSo } from 'modules/mdDanhMuc/dmHoTroHocPhiCoSo/redux';

const EnumDateType = {
    0: { text: '' },
    1: { text: 'dd/mm/yyyy' },
    2: { text: 'mm/yyyy' },
    3: { text: 'yyyy' }
}, typeMapper = {
    'yyyy': 'year',
    'mm/yyyy': 'month',
    'dd/mm/yyyy': 'date'
};

const timeList = [
    { id: 0, text: 'Không' },
    { id: 1, text: 'Theo ngày bắt đầu' },
    { id: 2, text: 'Theo ngày làm đơn' }
];

class EditModal extends AdminModal {
    state = {
        id: null,
        batDau: '',
        ketThuc: '',
        batDauType: 'dd/mm/yyyy',
        ketThucType: 'dd/mm/yyyy'
    };

    onShow = (item) => {
        let { id, ngayLamDon, shcc, noiDung, coSoDaoTao, batDau, batDauType, ketThuc, ketThucType, hocKyHoTro, soTien, hoSo, ghiChu } = item ? item : {
            id: '', ngayLamDon: null, shcc: '', noiDung: '', coSoDaoTao: '', batDau: null, batDauType: '', ketThucType: '', hocKyHoTro: '', soTien: '', hoSo: '', ghiChu: ''
        };

        this.setState({
            id, batDauType: batDauType ? batDauType : 'dd/mm/yyyy',
            ketThucType: ketThucType ? ketThucType : 'dd/mm/yyyy',
            batDau, ketThuc
        }, () => {
            this.shcc.value(shcc);
            this.ngayLamDon.value(ngayLamDon ? ngayLamDon : '');
            this.noiDung.value(noiDung ? noiDung : '');
            this.coSoDaoTao.value(coSoDaoTao);
            this.hocKyHoTro.value(hocKyHoTro ? hocKyHoTro : '');
            this.soTien.value(soTien ? soTien : '');
            this.hoSo.value(hoSo ? hoSo : '');
            this.ghiChu.value(ghiChu ? ghiChu : '');

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
        let listMa = this.shcc.value();
        if (!Array.isArray(listMa)) {
            listMa = [listMa];
        }
        if (listMa.length == 0) {
            T.notify('Danh sách cán bộ trống', 'danger');
            this.shcc.focus();
        } else if (!this.ngayLamDon.value()) {
            T.notify('Ngày làm đơn trống', 'danger');
            this.ngayLamDon.focus();
        } else if (!this.coSoDaoTao.value()) {
            T.notify('Cơ sở đào tạo trống', 'danger');
            this.coSoDaoTao.focus();
        } else if (!this.batDau.getVal()) {
            T.notify('Bắt đầu trống', 'danger');
            this.batDau.focus();
        } else if (!this.state.denNay && !this.ketThuc.getVal()) {
            T.notify('Kết thúc trống', 'danger');
            this.ketThuc.focus();
        } else if (!this.state.denNay && this.batDau.getVal() > this.ketThuc.getVal()) {
            T.notify('Bắt đầu lớn hơn kết thúc', 'danger');
            this.batDau.focus();
        } else {
            listMa.forEach((ma, index) => {
                const changes = {
                    shcc: ma,
                    ngayLamDon: this.ngayLamDon.value() ? Number(this.ngayLamDon.value()) : '',
                    noiDung: this.noiDung.value(),
                    coSoDaoTao: this.coSoDaoTao.value(),
                    hocKyHoTro: this.hocKyHoTro.value(),
                    soTien: this.soTien.value(),
                    hoSo: this.hoSo.value(),
                    ghiChu: this.ghiChu.value(),

                    batDauType: this.state.batDauType,
                    batDau: this.batDau.getVal(),
                    ketThucType: !this.state.denNay ? this.state.ketThucType : '',
                    ketThuc: !this.state.denNay ? this.ketThuc.getVal() : -1
                };
                if (index == listMa.length - 1) {
                    this.state.id ? this.props.update(this.state.id, changes, this.hide) : this.props.create(changes, this.hide);
                    this.setState({
                        id: ''
                    });
                    this.shcc.reset();
                    this.noiDen.reset();
                } else {
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
            title: this.state.id ? 'Cập nhật quá trình hỗ trợ học phí' : 'Tạo mới quá trình hỗ trợ học phí',
            size: 'large',
            body: <div className='row'>
                <FormSelect className='col-md-12' multiple ref={e => this.shcc = e} label='Cán bộ' data={SelectAdapter_FwCanBo} readOnly={!!this.state.id} required />
                <FormDatePicker className='col-md-4' ref={e => this.ngayLamDon = e} type='date-mask' label='Ngày quyết định' readOnly={readOnly} required />
                <FormSelect className='col-md-8' ref={e => this.coSoDaoTao = e} label='Cơ sở đào tạo' data={SelectAdapter_DmHoTroHocPhiCoSo} required readOnly={readOnly} />
                <FormRichTextBox className='col-md-12' ref={e => this.noiDung = e} rows={2} readOnly={readOnly} label='Nội dung xin hỗ trợ' placeholder='Nhập nội dung xin hỗ trợ học phí (tối đa 100 ký tự)' maxLength={100} />
                <FormTextBox className='col-md-6' ref={e => this.hocKyHoTro = e} type='text' label='Học kỳ hỗ trợ' readOnly={readOnly} />
                <FormTextBox className='col-md-6' ref={e => this.soTien = e} type='number' label='Số tiền' readOnly={readOnly} />
                <FormTextBox className='col-md-12' ref={e => this.hoSo = e} type='text' label='Hồ sơ đi kèm' readOnly={readOnly} />

                <div className='form-group col-md-6'><DateInput ref={e => this.batDau = e} placeholder='Bắt đầu' label={
                    <div style={{ display: 'flex' }}>Bắt đầu (định dạng:&nbsp; <Dropdown ref={e => this.batDauType = e} items={[...Object.keys(EnumDateType).map(key => EnumDateType[key].text)]} onSelected={item => this.setState({ batDauType: item })} readOnly={readOnly} />)&nbsp;<span style={{ color: 'red' }}> *</span></div>
                } type={this.state.batDauType ? typeMapper[this.state.batDauType] : null} readOnly={readOnly} /></div>
                <FormCheckbox ref={e => this.denNayCheck = e} label='Đến nay' onChange={this.handleKetThuc} className='form-group col-md-3' />
                <div className='form-group col-md-6' id='ketThucDate'><DateInput ref={e => this.ketThuc = e} placeholder='Kết thúc' label={
                    <div style={{ display: 'flex' }}>Kết thúc (định dạng:&nbsp; <Dropdown ref={e => this.ketThucType = e} items={[...Object.keys(EnumDateType).map(key => EnumDateType[key].text)]} onSelected={item => this.setState({ ketThucType: item })} readOnly={readOnly} />)&nbsp;<span style={{ color: 'red' }}> *</span></div>
                } type={this.state.ketThucType ? typeMapper[this.state.ketThucType] : null} readOnly={readOnly} /></div>

                <FormRichTextBox className='col-md-12' ref={e => this.ghiChu = e} rows={2} readOnly={readOnly} label='Ghi chú' placeholder='Nhập ghi chú (tối đa 100 ký tự)' maxLength={100} />
            </div>
        });
    }
}

class QtHoTroHocPhi extends AdminPage {
    checked = parseInt(T.cookie('hienThiTheoCanBo')) == 1;
    state = { filter: {} };

    componentDidMount() {
        T.ready('/user/tccb', () => {
            T.clearSearchBox();
            T.onSearch = (searchText) => this.getPage(undefined, undefined, searchText || '');
            T.showSearchBox(() => {
                this.timeType?.value(0);
                this.fromYear?.value('');
                this.toYear?.value('');
                this.maDonVi?.value('');
                this.mulCanBo?.value('');
                this.tinhTrang?.value('');
                this.loaiHocVi?.value('');
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

    changeAdvancedSearch = (isInitial = false) => {
        let { pageNumber, pageSize } = this.props && this.props.qtHoTroHocPhi && this.props.qtHoTroHocPhi.page ? this.props.qtHoTroHocPhi.page : { pageNumber: 1, pageSize: 50 };
        const timeType = this.timeType?.value() || 0;
        const fromYear = this.fromYear?.value() == '' ? null : this.fromYear?.value().getTime();
        const toYear = this.toYear?.value() == '' ? null : this.toYear?.value().getTime();
        const listDv = this.maDonVi?.value().toString() || '';
        const listShcc = this.mulCanBo.value().toString() || '';
        const tinhTrang = this.tinhTrang?.value() == '' ? null : this.tinhTrang?.value();
        const loaiHocVi = this.loaiHocVi?.value() == '' ? '' : this.loaiHocVi?.value().toString();
        const pageFilter = isInitial ? null : { listDv, fromYear, toYear, listShcc, tinhTrang, timeType, loaiHocVi };
        this.setState({ filter: pageFilter }, () => {
            this.getPage(pageNumber, pageSize, '', (page) => {
                if (isInitial) {
                    const filter = page.filter || {};
                    this.setState({ filter: !$.isEmptyObject(filter) ? filter : pageFilter });
                    this.fromYear?.value(filter.fromYear || '');
                    this.toYear?.value(filter.toYear || '');
                    this.maDonVi?.value(filter.listDv);
                    this.mulCanBo.value(filter.listShcc);
                    this.timeType?.value(filter.timeType);
                    this.tinhTrang?.value(filter.tinhTrang);
                    this.loaiHocVi?.value(filter.loaiHocVi);
                    if (!$.isEmptyObject(filter) && filter && (filter.fromYear || filter.toYear || filter.listShcc || filter.listDv || filter.timeType || filter.tinhTrang || filter.loaiHocVi)) this.showAdvanceSearch();
                }
            });
        });
    }

    getPage = (pageN, pageS, pageC, done) => {
        if (this.checked) this.props.getQtHoTroHocPhiGroupPage(pageN, pageS, pageC, this.state.filter, done);
        else this.props.getQtHoTroHocPhiPage(pageN, pageS, pageC, this.state.filter, done);
    }

    groupPage = () => {
        this.checked = !this.checked;
        T.cookie('hienThiTheoCanBo', this.checked ? 1 : 0);
        this.getPage();
    }

    list = (danhSachNoiDung, batDauList, ketThucList, batDauTypeList, ketThucTypeList, soQt) => {
        if (soQt == 0) return [];
        let batDaus = batDauList.split('??');
        let ketThucs = ketThucList.split('??');
        let batDauTypes = batDauTypeList.split('??');
        let ketThucTypes = ketThucTypeList.split('??');
        let danhSachNoiDungs = danhSachNoiDung.split('??');
        let results = [];
        for (let i = 0; i < soQt; i++) {
            batDaus[i] = batDaus[i].trim();
            ketThucs[i] = ketThucs[i].trim();
            danhSachNoiDungs[i] = danhSachNoiDungs[i].trim();
        }
        let choose = (soQt > 15 ? 15 : soQt);
        for (let i = 0; i < choose; i++) {
            let s = danhSachNoiDungs[i];
            s += ' (' + (batDaus[i] ? T.dateToText(Number(batDaus[i]), batDauTypes[i] ? batDauTypes[i] : 'dd/mm/yyyy') : '') + ' - ';
            s += ketThucs[i] ? (ketThucs[i] != '-1' ? T.dateToText(Number(ketThucs[i]), ketThucTypes[i] ? ketThucTypes[i] : 'dd/mm/yyyy') : 'Đến nay') : '';
            s += ')';
            results.push(<div key={results.length}><span>Lần {i + 1}. {s}</span></div>);
        }

        if (soQt > 15) {
            let i = soQt - 1;
            results.push(<div key={results.length}><span>........................</span></div>);
            let s = danhSachNoiDungs[i];
            s += ' (' + (batDaus[i] ? T.dateToText(Number(batDaus[i]), batDauTypes[i] ? batDauTypes[i] : 'dd/mm/yyyy') : '') + ' - ';
            s += ketThucs[i] ? (ketThucs[i] != '-1' ? T.dateToText(Number(ketThucs[i]), ketThucTypes[i] ? ketThucTypes[i] : 'dd/mm/yyyy') : 'Đến nay') : '';
            s += ')';
            results.push(<div key={results.length}><span>Lần {i + 1}. {s}</span></div>);
        }

        return results;
    }

    delete = (e, item) => {
        e.preventDefault();
        T.confirm('Xóa quá trình hỗ trợ học phí', 'Bạn có chắc bạn muốn xóa quá trình hỗ trợ học phí này?', 'warning', true, isConfirm => {
            isConfirm && this.props.deleteQtHoTroHocPhi(item.id, error => {
                if (error) T.notify(error.message ? error.message : 'Xoá quá trình hỗ trợ học phí bị lỗi!', 'danger');
                else T.alert('Xoá quá trình hỗ trợ học phí thành công!', 'success', false, 800);
            });
        });
    }

    render() {
        const currentPermissions = this.props.system && this.props.system.user && this.props.system.user.permissions ? this.props.system.user.permissions : [],
            permission = this.getUserPermission('qtHoTroHocPhi', ['read', 'write', 'delete']);
        let { pageNumber, pageSize, pageTotal, totalItem, pageCondition, list } = this.checked ? (
                this.props.qtHoTroHocPhi && this.props.qtHoTroHocPhi.pageGr ?
                    this.props.qtHoTroHocPhi.pageGr : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, list })
            : (this.props.qtHoTroHocPhi && this.props.qtHoTroHocPhi.page ? this.props.qtHoTroHocPhi.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, pageCondition: {}, list: [] });
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
                        <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Chức vụ<br />Đơn vị công tác</th>
                        {!this.checked && <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Ngày làm đơn</th>}
                        {!this.checked && <th style={{ width: '100%', whiteSpace: 'nowrap' }}>Nội dung hỗ trợ</th>}
                        {!this.checked && <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Cơ sở đào tạo</th>}
                        {!this.checked && <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Thời gian/Khóa học</th>}
                        {!this.checked && <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Học kỳ hỗ trợ</th>}
                        {!this.checked && <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Số tiền hỗ trợ</th>}
                        {!this.checked && <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Tình trạng</th>}
                        {this.checked && <th style={{ width: 'auto', whiteSpace: 'nowrap' }}> Số quá trình </th>}
                        {this.checked && <th style={{ width: '100%', whiteSpace: 'nowrap' }}>Danh sách</th>}
                        <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Thao tác</th>
                    </tr>
                ),
                renderRow: (item, index) => (
                    <tr key={index}>
                        <TableCell type='text' style={{ textAlign: 'right' }} content={(pageNumber - 1) * pageSize + index + 1} />
                        <TableCell type='link' onClick={() => this.modal.show(item, false)} style={{ whiteSpace: 'nowrap' }} content={(
                            <>
                                <span>{(item.hoCanBo ? item.hoCanBo.normalizedName() : ' ') + ' ' + (item.tenCanBo ? item.tenCanBo.normalizedName() : ' ')}</span><br />
                                {item.shcc}
                            </>
                        )} />
                        <TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={item.tenHocVi || ''} />
                        <TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={item.tenChucDanhNgheNghiep || ''} />
                        <TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={(
                            <>
                                <span> {item.tenChucVu || ''}<br /> </span>
                                {(item.tenDonVi || '').normalizedName()}
                            </>
                        )} />
                        {!this.checked && <TableCell type='date' dateFormat='dd/mm/yyyy' content={item.ngayLamDon} />}
                        {!this.checked && <TableCell type='text' content={(
                            <>
                                <i> {item.noiDung ? item.noiDung : ''}</i>
                            </>
                        )} />}
                        {!this.checked && <TableCell type='text' content={(
                            <>
                                <b> {item.tenCoSoDaoTao ? item.tenCoSoDaoTao : ''}</b>
                            </>
                        )} />}
                        {!this.checked && <TableCell type='text' content={(
                            <>
                                {item.batDau ? <span style={{ whiteSpace: 'nowrap' }}>Bắt đầu: <span style={{ color: 'blue' }}>{item.batDau ? T.dateToText(item.batDau, item.batDauType ? item.batDauType : 'dd/mm/yyyy') : ''}</span><br /></span> : null}
                                {item.ketThuc && item.ketThuc != -1 ? <span style={{ whiteSpace: 'nowrap' }}>Kết thúc: <span style={{ color: 'blue' }}>{item.ketThuc && item.ketThuc != -1 ? T.dateToText(item.ketThuc, item.ketThucType ? item.ketThucType : 'dd/mm/yyyy') : ''}</span></span> : null}
                            </>
                        )} />}
                        {!this.checked && <TableCell type='text' content={(
                            <>
                                <b> {item.hocKyHoTro ? item.hocKyHoTro : ''} </b>
                            </>
                        )} />}
                        {!this.checked && <TableCell type='text' content={(
                            <>
                                <b>{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.soTien)}</b>
                            </>
                        )} />}
                        {!this.checked && <TableCell type='text' content={
                            (item.ketThuc == -1 || item.ketThuc >= item.today) ?
                                <span style={{ color: 'red', whiteSpace: 'nowrap' }}>Đang diễn ra</span> :
                                <span style={{ color: 'red', whiteSpace: 'nowrap' }}>Đã kết thúc</span>
                        } />}
                        {this.checked && <TableCell type='text' content={item.soQuaTrinh} />}
                        {this.checked && <TableCell type='text' content={this.list(item.danhSachNoiDung, item.danhSachBatDau, item.danhSachKetThuc, item.danhSachBatDauType, item.danhSachKetThucType, item.soQuaTrinh)} />}
                        {!this.checked && <TableCell type='buttons' style={{ textAlign: 'center' }} content={item} permission={permission} onEdit={() => this.modal.show(item)} onDelete={this.delete} />}
                        {
                            this.checked && <TableCell type='buttons' style={{ textAlign: 'center' }} content={item} permission={permission}>
                                <Link className='btn btn-success' to={`/user/tccb/qua-trinh/ho-tro-hoc-phi/group/${item.shcc}`}>
                                    <i className='fa fa-lg fa-compress' />
                                </Link>
                            </TableCell>
                        }
                    </tr>
                )
            });
        }

        return this.renderPage({
            icon: 'fa fa-usd',
            title: ' Quá trình hỗ trợ học phí',
            breadcrumb: [
                <Link key={0} to='/user/tccb'>Tổ chức cán bộ</Link>,
                'Quá trình hỗ trợ học phí'
            ],
            advanceSearch: <>
                <div className='row'>
                    <FormSelect className='col-12 col-md-4' ref={e => this.timeType = e} label='Chọn loại thời gian' data={timeList} onChange={() => this.changeAdvancedSearch()} minimumResultsForSearch={-1} allowClear={true} />
                    {(this.timeType && this.timeType.value() >= 1) &&
                    <>
                        <FormDatePicker type='month-mask' ref={e => this.fromYear = e} className='col-12 col-md-2' label='Từ thời gian' onChange={() => this.changeAdvancedSearch()} />
                        <FormDatePicker type='month-mask' ref={e => this.toYear = e} className='col-12 col-md-2' label='Đến thời gian' onChange={() => this.changeAdvancedSearch()} />
                    </>}
                    <FormSelect ref={e => this.loaiHocVi = e} label='Loại học vị' className='col-12 col-md-4' data={[
                        { id: '04', text: 'Cử nhân' },
                        { id: '03', text: 'Thạc sĩ' },
                        { id: '02', text: 'Tiến sĩ' }
                    ]} onChange={() => this.changeAdvancedSearch()} multiple={true} allowClear={true} minimumResultsForSearch={-1} />
                    <FormSelect className='col-12 col-md-4' ref={e => this.tinhTrang = e} label='Tình trạng' data={[
                        { id: 1, text: 'Đã kết thúc' }, { id: 2, text: 'Đang diễn ra' }
                    ]} onChange={() => this.changeAdvancedSearch()} allowClear={true} minimumResultsForSearch={-1} />
                    <FormSelect className='col-12 col-md-6' multiple={true} ref={e => this.maDonVi = e} label='Đơn vị' data={SelectAdapter_DmDonVi} onChange={() => this.changeAdvancedSearch()} allowClear={true} minimumResultsForSearch={-1} />
                    <FormSelect className='col-12 col-md-6' multiple={true} ref={e => this.mulCanBo = e} label='Cán bộ' data={SelectAdapter_FwCanBo} onChange={() => this.changeAdvancedSearch()} allowClear={true} minimumResultsForSearch={-1} />
                </div>
            </>,
            content: <>
                <div className='tile'>
                    <FormCheckbox label='Hiển thị theo cán bộ' ref={e => this.hienThiTheoCanBo = e} onChange={this.groupPage} />
                    {table}
                </div>
                <Pagination style={{ marginLeft: '70px' }} {...{ pageNumber, pageSize, pageTotal, totalItem, pageCondition }} getPage={this.getPage} />
                <EditModal ref={e => this.modal = e} permission={permission} create={this.props.createQtHoTroHocPhi} update={this.props.updateQtHoTroHocPhi} permissions={currentPermissions} />
            </>,
            backRoute: '/user/tccb',
            onCreate: permission && permission.write && !this.checked ? (e) => this.showModal(e) : null,
            onExport: !this.checked ? (e) => {
                e.preventDefault();
                const { fromYear, toYear, listShcc, listDv, timeType, tinhTrang, loaiHocVi } = (this.state.filter && this.state.filter != '%%%%%%%%') ? this.state.filter : { fromYear: null, toYear: null, listShcc: null, listDv: null, timeType: 0, tinhTrang: null, loaiHocVi: null };
                T.download(T.url(`/api/qua-trinh/ho-tro-hoc-phi/download-excel/${listShcc ? listShcc : null}/${listDv ? listDv : null}/${fromYear ? fromYear : null}/${toYear ? toYear : null}/${timeType}/${tinhTrang ? tinhTrang : null}/${loaiHocVi ? loaiHocVi : null}`), 'hotrohocphi.xlsx');
            } : null
        });
    }
}

const mapStateToProps = state => ({ system: state.system, qtHoTroHocPhi: state.tccb.qtHoTroHocPhi });
const mapActionsToProps = { getQtHoTroHocPhiPage, deleteQtHoTroHocPhi, createQtHoTroHocPhi, updateQtHoTroHocPhi, getQtHoTroHocPhiGroupPage };
export default connect(mapStateToProps, mapActionsToProps)(QtHoTroHocPhi);
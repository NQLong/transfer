import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { AdminModal, AdminPage, FormDatePicker, FormRichTextBox, FormSelect, FormTextBox, renderTable, TableCell, FormCheckbox } from 'view/component/AdminPage';
import Pagination from 'view/component/Pagination';
import Dropdown from 'view/component/Dropdown';
import { DateInput } from 'view/component/Input';
import { SelectAdapter_FwCanBo } from '../tccbCanBo/redux';
import {
    getQtCongTacTrongNuocPage, deleteQtCongTacTrongNuoc, createQtCongTacTrongNuoc,
    updateQtCongTacTrongNuoc, getQtCongTacTrongNuocGroupPage
}
    from './redux';
import { SelectAdapter_DmDonVi } from 'modules/mdDanhMuc/dmDonVi/redux';
import { SelectAdapter_DmTinhThanhPhoV2 } from 'modules/mdDanhMuc/dmDiaDiem/reduxTinhThanhPho';
import { SelectAdapter_DmMucDichTrongNuoc } from 'modules/mdDanhMuc/dmMucDichTrongNuoc/redux';

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
    { id: 1, text: 'Theo ngày đi' },
    { id: 2, text: 'Theo ngày quyết định' }
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
        let { id, shcc, noiDen, batDau, batDauType, ketThuc, ketThucType, vietTat, lyDo, kinhPhi, ghiChu, soCv, ngayQuyetDinh } = item ? item : {
            id: '', shcc: '', noiDen: '', batDau: null, batDauType: '', ketThuc: null, ketThucType: '', vietTat: '', lyDo: '', kinhPhi: null, ghiChu: '', soCv: '', ngayQuyetDinh: null,
        };

        this.setState({
            id, batDauType: batDauType ? batDauType : 'dd/mm/yyyy',
            ketThucType: ketThucType ? ketThucType : 'dd/mm/yyyy',
            batDau, ketThuc
        }, () => {
            this.shcc.value(shcc);
            if (noiDen) {
                noiDen = noiDen.split(',');
                this.noiDen.value(noiDen);
            } else this.noiDen.value('');
            this.vietTat.value(vietTat);
            this.lyDo.value(lyDo ? lyDo : '');
            this.kinhPhi.value(kinhPhi ? kinhPhi : '');
            this.ghiChu.value(ghiChu ? ghiChu : '');
            this.soCv.value(soCv ? soCv : '');
            this.ngayQuyetDinh.value(ngayQuyetDinh ? ngayQuyetDinh : '');

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
        } else if (!this.lyDo.value()) {
            T.notify('Nội dung công tác trong nước trống', 'danger');
            this.lyDo.focus();
        } else if (!this.noiDen.value().length) {
            T.notify('Danh sách tỉnh thành trống', 'danger');
            this.noiDen.focus();
        } else if (!this.batDau.getVal()) {
            T.notify('Ngày đi trống', 'danger');
            this.batDau.focus();
        } else if (!this.state.denNay && !this.ketThuc.getVal()) {
            T.notify('Ngày về trống', 'danger');
            this.ketThuc.focus();
        } else if (!this.state.denNay && this.batDau.getVal() > this.ketThuc.getVal()) {
            T.notify('Ngày đi lớn hơn ngày về', 'danger');
            this.batDau.focus();
        } else {
            listMa.forEach((ma, index) => {
                const changes = {
                    shcc: ma,
                    noiDen: this.noiDen.value().toString(),
                    vietTat: this.vietTat.value(),
                    lyDo: this.lyDo.value(),
                    kinhPhi: this.kinhPhi.value(),
                    ghiChu: this.ghiChu.value(),
                    soCv: this.soCv.value(),
                    ngayQuyetDinh: this.ngayQuyetDinh.value() ? Number(this.ngayQuyetDinh.value()) : '',

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
            title: this.state.id ? 'Cập nhật quá trình công tác trong nước' : 'Tạo mới quá trình công tác trong nước',
            size: 'large',
            body: <div className='row'>
                <FormSelect className='col-md-12' multiple={this.multiple} ref={e => this.shcc = e} label='Cán bộ' data={SelectAdapter_FwCanBo} readOnly={this.state.id ? true : false} required />
                <FormTextBox className='col-md-3' ref={e => this.soCv = e} type='text' label='Số quyết định' readOnly={readOnly} />
                <FormDatePicker className='col-md-3' ref={e => this.ngayQuyetDinh = e} type='date-mask' label='Ngày quyết định' readOnly={readOnly} />
                <FormSelect className='col-md-6' ref={e => this.vietTat = e} label='Mục đích' data={SelectAdapter_DmMucDichTrongNuoc} />
                <FormRichTextBox className='col-md-12' ref={e => this.lyDo = e} rows={2} readOnly={readOnly} label='Nội dung' placeholder='Nhập nội dung công tác trong nước (tối đa 500 ký tự)' required maxLength={500} />
                <FormSelect className='col-md-12' multiple={true} ref={e => this.noiDen = e} label='Nơi đến' data={SelectAdapter_DmTinhThanhPhoV2} required />
                <FormRichTextBox className='col-md-12' ref={e => this.kinhPhi = e} rows={2} type='text' label='Kinh phí' readOnly={readOnly} placeholder='Nhập kinh phí (tối đa 200 ký tự)' maxLength={200}/>

                <div className='form-group col-md-6'><DateInput ref={e => this.batDau = e} placeholder='Ngày đi'
                    label={
                        <div style={{ display: 'flex' }}>Ngày đi (định dạng:&nbsp; <Dropdown ref={e => this.batDauType = e}
                            items={[...Object.keys(EnumDateType).map(key => EnumDateType[key].text)]}
                            onSelected={item => this.setState({ batDauType: item })} readOnly={readOnly} />)&nbsp;<span style={{ color: 'red' }}> *</span></div>
                    }
                    type={this.state.batDauType ? typeMapper[this.state.batDauType] : null} readOnly={readOnly} /></div>
                <FormCheckbox ref={e => this.denNayCheck = e} label='Đến nay' onChange={this.handleKetThuc} className='form-group col-md-3' />
                <div className='form-group col-md-6' id='ketThucDate'><DateInput ref={e => this.ketThuc = e} placeholder='Ngày về'
                    label={
                        <div style={{ display: 'flex' }}>Ngày về (định dạng:&nbsp; <Dropdown ref={e => this.ketThucType = e}
                            items={[...Object.keys(EnumDateType).map(key => EnumDateType[key].text)]}
                            onSelected={item => this.setState({ ketThucType: item })} readOnly={readOnly} />)&nbsp;<span style={{ color: 'red' }}> *</span></div>
                    }
                    type={this.state.ketThucType ? typeMapper[this.state.ketThucType] : null} /></div>

                <FormTextBox className='col-md-12' ref={e => this.ghiChu = e} type='text' label='Ghi chú' readOnly={readOnly} />
            </div>
        });
    }
}

class QtCongTacTrongNuoc extends AdminPage {
    checked = parseInt(T.cookie('hienThiTheoCanBo')) == 1 ? true : false;
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
                this.mucDich?.value('');
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
        let { pageNumber, pageSize } = this.props && this.props.qtCongTacTrongNuoc && this.props.qtCongTacTrongNuoc.page ? this.props.qtCongTacTrongNuoc.page : { pageNumber: 1, pageSize: 50 };
        const timeType = this.timeType?.value() || 0;
        const fromYear = this.fromYear?.value() == '' ? null : this.fromYear?.value().getTime();
        const toYear = this.toYear?.value() == '' ? null : this.toYear?.value().getTime();
        const listDv = this.maDonVi?.value().toString() || '';
        const listShcc = this.mulCanBo?.value().toString() || '';
        const tinhTrang = this.tinhTrang?.value() == '' ? null : this.tinhTrang?.value();
        const loaiHocVi = this.loaiHocVi?.value() == '' ? '' : this.loaiHocVi?.value().toString();
        const mucDich = this.mucDich?.value() == '' ? '' : this.mucDich?.value().toString();
        const pageFilter = isInitial ? null : { listDv, fromYear, toYear, listShcc, tinhTrang, timeType, loaiHocVi, mucDich };
        this.setState({ filter: pageFilter }, () => {
            this.getPage(pageNumber, pageSize, '', (page) => {
                if (isInitial) {
                    const filter = page.filter || {};
                    this.setState({ filter: !$.isEmptyObject(filter) ? filter : pageFilter });
                    this.fromYear?.value(filter.fromYear || '');
                    this.toYear?.value(filter.toYear || '');
                    this.maDonVi?.value(filter.listDv);
                    this.mulCanBo?.value(filter.listShcc);
                    this.timeType?.value(filter.timeType);
                    this.tinhTrang?.value(filter.tinhTrang);
                    this.loaiHocVi?.value(filter.loaiHocVi);
                    this.mucDich?.value(filter.mucDich);
                    if (!$.isEmptyObject(filter) && filter && (filter.fromYear || filter.toYear || filter.listShcc || filter.listDv || filter.timeType || filter.tinhTrang || filter.loaiHocVi || filter.mucDich )) this.showAdvanceSearch();
                }
            });
        });
    }

    getPage = (pageN, pageS, pageC, done) => {
        if (this.checked) this.props.getQtCongTacTrongNuocGroupPage(pageN, pageS, pageC, this.state.filter, done);
        else this.props.getQtCongTacTrongNuocPage(pageN, pageS, pageC, this.state.filter, done);
    }

    groupPage = () => {
        this.checked = !this.checked;
        T.cookie('hienThiTheoCanBo', this.checked ? 1 : 0);
        this.getPage();
    }

    list = (danhSachMucDich, batDauList, ketThucList, batDauTypeList, ketThucTypeList, soQt) => {
        if (soQt == 0) return [];
        let batDaus = batDauList.split('??');
        let ketThucs = ketThucList.split('??');
        let batDauTypes = batDauTypeList.split('??');
        let ketThucTypes = ketThucTypeList.split('??');
        let danhSachMucDichs = danhSachMucDich.split('??');
        let results = [];
        for (let i = 0; i < soQt; i++) {
            batDaus[i] = batDaus[i].trim();
            ketThucs[i] = ketThucs[i].trim();
            danhSachMucDichs[i] = danhSachMucDichs[i].trim();
        }
        let choose = (soQt > 15 ? 15 : soQt);
        for (let i = 0; i < choose; i++) {
            let s = danhSachMucDichs[i];
            s += ' (' + (batDaus[i] ? T.dateToText(Number(batDaus[i]), batDauTypes[i] ? batDauTypes[i] : 'dd/mm/yyyy') : '') + ' - ';
            s += ketThucs[i] ? (ketThucs[i] != '-1' ? T.dateToText(Number(ketThucs[i]), ketThucTypes[i] ? ketThucTypes[i] : 'dd/mm/yyyy') : 'Đến nay') : '';
            s += ')';
            results.push(<p style={{ textTransform: 'uppercase' }}> <span>
                Lần {i+1}. {s}
            </span></p>);
        }
        if (soQt > 15) {
            let i = soQt - 1;
            results.push(<p style={{ textTransform: 'uppercase' }}> <span>
                ........................
            </span></p>);
            let s = danhSachMucDichs[i];
            s += ' (' + (batDaus[i] ? T.dateToText(Number(batDaus[i]), batDauTypes[i] ? batDauTypes[i] : 'dd/mm/yyyy') : '') + ' - ';
            s += ketThucs[i] ? (ketThucs[i] != '-1' ? T.dateToText(Number(ketThucs[i]), ketThucTypes[i] ? ketThucTypes[i] : 'dd/mm/yyyy') : 'Đến nay') : '';
            s += ')';
            results.push(<p style={{ textTransform: 'uppercase' }}> <span>
                Lần {i + 1}. {s}
            </span></p>);
        }
        return results;
    }

    delete = (e, item) => {
        T.confirm('Xóa quá trình công tác trong nước', 'Bạn có chắc bạn muốn xóa quá trình công tác trong nước này?', 'warning', true, isConfirm => {
            isConfirm && this.props.deleteQtCongTacTrongNuoc(item.id, error => {
                if (error) T.notify(error.message ? error.message : 'Xoá quá trình công tác trong nước bị lỗi!', 'danger');
                else T.alert('Xoá quá trình công tác trong nước thành công!', 'success', false, 800);
            });
        });
        e.preventDefault();
    }

    render() {
        const currentPermissions = this.props.system && this.props.system.user && this.props.system.user.permissions ? this.props.system.user.permissions : [],
            permission = this.getUserPermission('qtCongTacTrongNuoc', ['read', 'write', 'delete']);
        let { pageNumber, pageSize, pageTotal, totalItem, pageCondition, list } = this.checked ? (
            this.props.qtCongTacTrongNuoc && this.props.qtCongTacTrongNuoc.pageGr ?
                this.props.qtCongTacTrongNuoc.pageGr : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, list })
            : (this.props.qtCongTacTrongNuoc && this.props.qtCongTacTrongNuoc.page ? this.props.qtCongTacTrongNuoc.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, pageCondition: {}, list: [] });
        let table = 'Không có danh sách!';
        if (list && list.length > 0) {
            table = renderTable({
                getDataSource: () => list, stickyHead: false,
                renderHead: () => (
                    <tr>
                        <th style={{ width: 'auto', textAlign: 'right' }}>#</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Cán bộ</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Học vị</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Chức danh nghề nghiệp</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Chức vụ<br/>Đơn vị công tác</th>
                        {!this.checked && <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Số công văn</th>}
                        {!this.checked && <th style={{ width: '50%', whiteSpace: 'nowrap' }}>Thông tin chuyến đi</th>}
                        {!this.checked && <th style={{ width: '50%', whiteSpace: 'nowrap' }}>Nội dung</th>}
                        {this.checked && <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Số quá trình</th>}
                        {this.checked && <th style={{ width: '100%', whiteSpace: 'nowrap' }}>Danh sách</th>}
                        {!this.checked && <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Tình trạng</th>}
                        <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Thao tác</th>
                    </tr>
                ),
                renderRow: (item, index) => (
                    <tr key={index}>
                        <TableCell type='text' style={{ textAlign: 'right' }} content={(pageNumber - 1) * pageSize + index + 1} />
                        <TableCell type='link' onClick={() => this.modal.show(item, false)} style={{ whiteSpace: 'nowrap' }} content={(
                            <>
                                <span>{(item.hoCanBo ? item.hoCanBo.normalizedName() : ' ') + ' ' + (item.tenCanBo ? item.tenCanBo.normalizedName() : ' ')}</span><br />
                                {item.shcc} <br/>
                            </>
                        )}
                        />
                        <TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={(
                            <>
                                {item.tenHocVi ? item.tenHocVi : ''}
                            </>
                        )}
                        />
                        <TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={(
                            <>
                                {item.tenChucDanhNgheNghiep ? item.tenChucDanhNgheNghiep : ''}
                            </>
                        )}
                        />
                        <TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={(
                            <>
                                <span> { item.tenChucVu ? item.tenChucVu : '' } <br/> </span>
                                {item.tenDonVi ? item.tenDonVi.normalizedName() : ''}
                            </>
                        )}
                        />
                        {!this.checked && <TableCell type='text' content={(
                            <>
                                <b> {item.soCv ? item.soCv : ''} </b> <br/><br/>
                                {item.ngayQuyetDinh ? <span style={{ whiteSpace: 'nowrap' }}>Ngày quyết định: <span style={{ color: 'blue' }}>{item.ngayQuyetDinh ? T.dateToText(item.ngayQuyetDinh, 'dd/mm/yyyy') : ''}</span><br /></span> : null}
                            </>
                        )}
                        />}
                        {!this.checked && <TableCell type='text' content={(
                            <>
                                <span>Nơi đến: <span>{item.danhSachTinh ? item.danhSachTinh : ''}</span></span> <br/> <br/>
                                <span>Mục đích: <span><b>{item.tenMucDich ? item.tenMucDich : ''}</b></span></span> <br/> <br/>
                                {item.batDau ? <span style={{ whiteSpace: 'nowrap' }}>Ngày đi: <span style={{ color: 'blue' }}>{item.batDau ? T.dateToText(item.batDau, item.batDauType ? item.batDauType : 'dd/mm/yyyy') : ''}</span><br /></span> : null}
                                {item.ketThuc && item.ketThuc != -1 ? <span style={{ whiteSpace: 'nowrap' }}>Ngày về: <span style={{ color: 'blue' }}>{item.ketThuc && item.ketThuc != -1 ? T.dateToText(item.ketThuc, item.ketThucType ? item.ketThucType : 'dd/mm/yyyy') : ''}</span><br /></span> : null}
                            </>
                        )}
                        />}
                        {!this.checked && <TableCell type='text' content={(
                            <>
                                {item.lyDo ? item.lyDo : ''}
                            </>
                        )}
                        />}
                        {this.checked && <TableCell type='text' content={item.soQuaTrinh} />}
                        {this.checked && <TableCell type='text' content={this.list(item.danhSachMucDich, item.danhSachBatDau, item.danhSachKetThuc, item.danhSachBatDauType, item.danhSachKetThucType, item.soQuaTrinh)} />}
                        {!this.checked && <TableCell type='text' content={(
                            <>
                                <span>{(item.ketThuc == -1 || item.ketThuc >= item.today) ? <span style={{ color: 'red', whiteSpace: 'nowrap' }}>Đang diễn ra</span> : <span style={{ color: 'red', whiteSpace: 'nowrap' }}>Đã kết thúc</span>}</span>
                            </>
                        )}></TableCell>}
                        {
                            !this.checked && <TableCell type='buttons' style={{ textAlign: 'center' }} content={item} permission={permission}
                                onEdit={() => this.modal.show(item, false)} onDelete={this.delete} >
                            </TableCell>
                        }
                        {
                            this.checked && <TableCell type='buttons' style={{ textAlign: 'center' }} content={item} permission={permission}>
                                <Link className='btn btn-success' to={`/user/tccb/qua-trinh/cong-tac-trong-nuoc/group/${item.shcc}`} >
                                    <i className='fa fa-lg fa-compress' />
                                </Link>
                            </TableCell>
                        }
                    </tr>
                )
            });
        }

        return this.renderPage({
            icon: 'fa fa-pencil-square-o',
            title: ' Quá trình công tác trong nước',
            breadcrumb: [
                <Link key={0} to='/user/tccb'>Tổ chức cán bộ</Link>,
                'Quá trình công tác trong nước'
            ],
            advanceSearch: <>
                <div className='row'>
                    <FormSelect className='col-12 col-md-4' ref={e => this.timeType = e} label='Chọn loại thời gian' data={timeList} onChange={() => this.changeAdvancedSearch()} />
                    {(this.timeType && this.timeType.value() >= 1) &&
                        <>
                            <FormDatePicker type='month-mask' ref={e => this.fromYear = e} className='col-12 col-md-2' label='Từ thời gian' onChange={() => this.changeAdvancedSearch()} />
                            <FormDatePicker type='month-mask' ref={e => this.toYear = e} className='col-12 col-md-2' label='Đến thời gian' onChange={() => this.changeAdvancedSearch()} />
                        </>}
                    <FormSelect ref={e => this.loaiHocVi = e} label='Loại học vị' className='col-12 col-md-4' data={[
                        { id: '04', text: 'Cử nhân' },
                        { id: '03', text: 'Thạc sĩ' },
                        { id: '02', text: 'Tiến sĩ' },
                    ]} onChange={() => this.changeAdvancedSearch()} multiple={true} allowClear={true} minimumResultsForSearch={-1} />
                    <FormSelect className='col-12 col-md-4' ref={e => this.tinhTrang = e} label='Tình trạng'
                        data={[
                            { id: 1, text: 'Đã kết thúc' }, { id: 2, text: 'Đang diễn ra' }
                        ]} onChange={() => this.changeAdvancedSearch()} allowClear={true} minimumResultsForSearch={-1} />
                    <FormSelect className='col-12 col-md-6' multiple={true} ref={e => this.maDonVi = e} label='Đơn vị' data={SelectAdapter_DmDonVi} onChange={() => this.changeAdvancedSearch()} allowClear={true} minimumResultsForSearch={-1} />
                    <FormSelect className='col-12 col-md-6' multiple={true} ref={e => this.mulCanBo = e} label='Cán bộ' data={SelectAdapter_FwCanBo} onChange={() => this.changeAdvancedSearch()} allowClear={true} minimumResultsForSearch={-1} />
                    <FormSelect className='col-12 col-md-6' multiple={true} ref={e => this.mucDich = e} label='Mục đích' data={SelectAdapter_DmMucDichTrongNuoc} onChange={() => this.changeAdvancedSearch()} allowClear={true} minimumResultsForSearch={-1} />
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
                    create={this.props.createQtCongTacTrongNuoc} update={this.props.updateQtCongTacTrongNuoc}
                    permissions={currentPermissions}
                />
            </>,
            backRoute: '/user/tccb',
            onCreate: permission && permission.write && !this.checked ? (e) => this.showModal(e) : null,
            onExport: !this.checked ? (e) => {
                e.preventDefault();
                const { fromYear, toYear, listShcc, listDv, timeType, tinhTrang, loaiHocVi, mucDich } = (this.state.filter && this.state.filter != '%%%%%%%%') ? this.state.filter : { fromYear: null, toYear: null, listShcc: null, listDv: null, timeType: 0, tinhTrang: null, loaiHocVi: null, mucDich: null };

                T.download(T.url(`/api/qua-trinh/cong-tac-trong-nuoc/download-excel/${listShcc ? listShcc : null}/${listDv ? listDv : null}/${fromYear ? fromYear : null}/${toYear ? toYear : null}/${timeType}/${tinhTrang ? tinhTrang : null}/${loaiHocVi ? loaiHocVi : null}/${mucDich ? mucDich : null}`), 'congtactrongnuoc.xlsx');
            } : null
        });
    }
}

const mapStateToProps = state => ({ system: state.system, qtCongTacTrongNuoc: state.tccb.qtCongTacTrongNuoc });
const mapActionsToProps = {
    getQtCongTacTrongNuocPage, deleteQtCongTacTrongNuoc, createQtCongTacTrongNuoc,
    updateQtCongTacTrongNuoc, getQtCongTacTrongNuocGroupPage,
};
export default connect(mapStateToProps, mapActionsToProps)(QtCongTacTrongNuoc);
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
    { id: 0, text: 'Không' },
    { id: 1, text: 'Theo ngày đi' },
    { id: 2, text: 'Theo ngày quyết định' }
];
class EditModal extends AdminModal {
    state = {
        id: null,
        ngayDi: '',
        ngayVe: '',
        ngayDiType: 'dd/mm/yyyy',
        ngayVeType: 'dd/mm/yyyy',
    };
    multiple = false;

    onShow = (item, multiple = true) => {
        this.multiple = multiple;
        let { id, shcc, quocGia, ngayDi, ngayDiType, ngayVe, ngayVeType, mucDich, noiDung, chiPhi, ghiChu, soQuyetDinh, ngayQuyetDinh } = item ? item : {
            id: '', shcc: '', quocGia: '', ngayDi: null, ngayDiType: '', ngayVe: null, ngayVeType: '', mucDich: '', noiDung: '', chiPhi: null, ghiChu: '', soQuyetDinh: '', ngayQuyetDinh: null,
        };

        this.setState({
            id, ngayDiType: ngayDiType ? ngayDiType : 'dd/mm/yyyy',
            ngayVeType: ngayVeType ? ngayVeType : 'dd/mm/yyyy',
            ngayDi, ngayVe
        }, () => {
            this.shcc.value(shcc);
            if (quocGia) {
                quocGia = quocGia.split(',');
                this.quocGia.value(quocGia);
            }
            this.mucDich.value(mucDich);
            this.noiDung.value(noiDung ? noiDung : '');
            this.chiPhi.value(chiPhi ? chiPhi : '');
            this.ghiChu.value(ghiChu ? ghiChu : '');
            this.soQuyetDinh.value(soQuyetDinh ? soQuyetDinh : '');
            this.ngayQuyetDinh.value(ngayQuyetDinh ? ngayQuyetDinh : '');

            this.ngayDiType.setText({ text: ngayDiType ? ngayDiType : 'dd/mm/yyyy' });
            this.state.ngayVe != -1 && this.ngayVeType.setText({ text: ngayVeType ? ngayVeType : 'dd/mm/yyyy' });
            if (this.state.ngayVe == -1) {
                this.setState({ denNay: true });
                this.denNayCheck.value(true);
                $('#ketThucDate').hide();
            } else {
                this.setState({ denNay: false });
                this.denNayCheck.value(false);
                $('#ketThucDate').show();
            }
            this.ngayDi.setVal(ngayDi ? ngayDi : '');
            this.state.ngayVe != -1 && this.ngayVe.setVal(ngayVe ? ngayVe : '');
        });
    };

    onSubmit = (e) => {
        e.preventDefault();
        let list_ma = this.shcc.value();
        if (!Array.isArray(list_ma)) {
            list_ma = [list_ma];
        }
        if (list_ma.length == 0) {
            T.notify('Danh sách cán bộ trống', 'danger');
            this.shcc.focus();
        } else if (!this.noiDung.value()) {
            T.notify('Nội dung đi nước ngoài trống', 'danger');
            this.noiDung.focus();
        } else if (!this.quocGia.value()) {
            T.notify('Danh sách quốc gia trống', 'danger');
            this.quocGia.focus();
        } else if (!this.ngayDi.getVal()) {
            T.notify('Ngày đi nước ngoài trống', 'danger');
            this.ngayDi.focus();
        } else if (!this.state.denNay && !this.ngayVe.getVal()) {
            T.notify('Ngày về nước trống', 'danger');
            this.ngayVe.focus();
        } else if (!this.state.denNay && this.ngayDi.getVal() > this.ngayVe.getVal()) {
            T.notify('Ngày đi lớn hơn ngày về', 'danger');
            this.ngayDi.focus();
        } else {
            list_ma.forEach((ma, index) => {
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
                    ngayVeType: !this.state.denNay ? this.state.ngayVeType : '',
                    ngayVe: !this.state.denNay ? this.ngayVe.getVal() : -1
                };
                if (index == list_ma.length - 1) {
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
        value ? $('#ketThucDate').hide() : $('#ketThucDate').show();
        this.setState({ denNay: value });
        if (!value) {
            this.ngayVeType?.setText({ text: this.state.ngayVeType ? this.state.ngayVeType : 'dd/mm/yyyy' });
        } else {
            this.ngayVeType?.setText({ text: '' });
        }
    }

    render = () => {
        const readOnly = this.props.readOnly;
        return this.renderModal({
            title: this.state.id ? 'Cập nhật quá trình đi nước ngoài' : 'Tạo mới quá trình đi nước ngoài',
            size: 'large',
            body: <div className='row'>
                <FormSelect className='col-md-12' multiple={this.multiple} ref={e => this.shcc = e} label='Cán bộ' data={SelectAdapter_FwCanBo} readOnly={this.state.id ? true : false} required />
                <FormTextBox className='col-md-3' ref={e => this.soQuyetDinh = e} type='text' label='Số quyết định' readOnly={readOnly} />
                <FormDatePicker className='col-md-3' ref={e => this.ngayQuyetDinh = e} type='date-mask' label='Ngày quyết định' readOnly={readOnly} />
                <FormSelect className='col-md-6' ref={e => this.mucDich = e} label='Mục đích' data={SelectAdapter_DmMucDichNuocNgoaiV2} />
                <FormRichTextBox className='col-md-12' ref={e => this.noiDung = e} rows={2} readOnly={readOnly} label='Nội dung' placeholder='Nhập nội dung đi nước ngoài (tối đa 1000 ký tự)' required maxLength={1000} />
                <FormSelect className='col-md-12' multiple={true} ref={e => this.quocGia = e} label='Quốc gia' data={SelectAdapter_DmQuocGia} required />
                <FormRichTextBox className='col-md-12' ref={e => this.chiPhi = e} rows={2} type='text' label='Chi phí' readOnly={readOnly} placeholder='Nhập chi phí (tối đa 500 ký tự)' maxLength={500}/>

                <div className='form-group col-md-6'><DateInput ref={e => this.ngayDi = e} placeholder='Ngày đi'
                    label={
                        <div style={{ display: 'flex' }}>Ngày đi (định dạng:&nbsp; <Dropdown ref={e => this.ngayDiType = e}
                            items={[...Object.keys(EnumDateType).map(key => EnumDateType[key].text)]}
                            onSelected={item => this.setState({ ngayDiType: item })} readOnly={readOnly} />)&nbsp;<span style={{ color: 'red' }}> *</span></div>
                    }
                    type={this.state.ngayDiType ? typeMapper[this.state.ngayDiType] : null} readOnly={readOnly} /></div>
                <FormCheckbox ref={e => this.denNayCheck = e} label='Đến nay' onChange={this.handleNgayVe} className='form-group col-md-3' />
                <div className='form-group col-md-6' id='ketThucDate'><DateInput ref={e => this.ngayVe = e} placeholder='Ngày về'
                    label={
                        <div style={{ display: 'flex' }}>Ngày về (định dạng:&nbsp; <Dropdown ref={e => this.ngayVeType = e}
                            items={[...Object.keys(EnumDateType).map(key => EnumDateType[key].text)]}
                            onSelected={item => this.setState({ ngayVeType: item })} readOnly={readOnly} />)&nbsp;<span style={{ color: 'red' }}> *</span></div>
                    }
                    type={this.state.ngayVeType ? typeMapper[this.state.ngayVeType] : null} /></div>

                <FormTextBox className='col-md-12' ref={e => this.ghiChu = e} type='text' label='Ghi chú' readOnly={readOnly} />
            </div>
        });
    }
}

class QtDiNuocNgoai extends AdminPage {
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
        let { pageNumber, pageSize } = this.props && this.props.qtDiNuocNgoai && this.props.qtDiNuocNgoai.page ? this.props.qtDiNuocNgoai.page : { pageNumber: 1, pageSize: 50 };
        const timeType = this.timeType?.value() || 0;
        const fromYear = this.fromYear?.value() == '' ? null : this.fromYear?.value().getTime();
        const toYear = this.toYear?.value() == '' ? null : this.toYear?.value().getTime();
        const list_dv = this.maDonVi?.value().toString() || '';
        const list_shcc = this.mulCanBo?.value().toString() || '';
        const tinhTrang = this.tinhTrang?.value() == '' ? null : this.tinhTrang?.value();
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
                    this.timeType?.value(filter.timeType);
                    this.tinhTrang?.value(filter.tinhTrang);
                    if (!$.isEmptyObject(filter) && filter && (filter.fromYear || filter.toYear || filter.list_shcc || filter.list_dv || filter.timeType || filter.tinhTrang)) this.showAdvanceSearch();
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
            results.push(<p style={{ textTransform: 'uppercase' }}> <span>
                Lần {i+1}. {s}
            </span></p>);
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

    render() {
        const currentPermissions = this.props.system && this.props.system.user && this.props.system.user.permissions ? this.props.system.user.permissions : [],
            permission = this.getUserPermission('qtDiNuocNgoai', ['read', 'write', 'delete']);
        let { pageNumber, pageSize, pageTotal, totalItem, pageCondition, list } = this.checked ? (
            this.props.qtDiNuocNgoai && this.props.qtDiNuocNgoai.page_gr ?
                this.props.qtDiNuocNgoai.page_gr : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, list })
            : (this.props.qtDiNuocNgoai && this.props.qtDiNuocNgoai.page ? this.props.qtDiNuocNgoai.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, pageCondition: {}, list: [] });
        let table = 'Không có danh sách!';
        if (list && list.length > 0) {
            table = renderTable({
                getDataSource: () => list, stickyHead: false,
                renderHead: () => (
                    <tr>
                        <th style={{ width: 'auto', textAlign: 'right' }}>#</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Cán bộ</th>
                        {!this.checked && <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Số quyết định</th>}
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
                                <span>{(item.hoCanBo ? item.hoCanBo : ' ') + ' ' + (item.tenCanBo ? item.tenCanBo : ' ')}</span><br />
                                {item.shcc}
                            </>
                        )}
                        />
                        {!this.checked && <TableCell type='text' content={(
                            <>
                                <b> {item.soQuyetDinh ? item.soQuyetDinh : ''} </b> <br/><br/>
                                {item.ngayQuyetDinh ? <span style={{ whiteSpace: 'nowrap' }}>Ngày quyết định: <span style={{ color: 'blue' }}>{item.ngayQuyetDinh ? T.dateToText(item.ngayQuyetDinh, 'dd/mm/yyyy') : ''}</span><br /></span> : null}
                            </>
                        )}
                        />}
                        {!this.checked && <TableCell type='text' content={(
                            <>
                                <span>Nơi đến: <span>{item.danhSachQuocGia ? item.danhSachQuocGia : ''}</span></span> <br/> <br/>
                                <span>Mục đích: <span><b>{item.tenMucDich ? item.tenMucDich : ''}</b></span></span> <br/> <br/>
                                {item.ngayDi ? <span style={{ whiteSpace: 'nowrap' }}>Ngày đi: <span style={{ color: 'blue' }}>{item.ngayDi ? T.dateToText(item.ngayDi, item.ngayDiType ? item.ngayDiType : 'dd/mm/yyyy') : ''}</span><br /></span> : null}
                                {item.ngayVe && item.ngayVe != -1 ? <span style={{ whiteSpace: 'nowrap' }}>Ngày về: <span style={{ color: 'blue' }}>{item.ngayVe && item.ngayVe != -1 ? T.dateToText(item.ngayVe, item.ngayVeType ? item.ngayVeType : 'dd/mm/yyyy') : ''}</span><br /></span> : null}
                            </>
                        )}
                        />}
                        {!this.checked && <TableCell type='text' content={(
                            <>
                                {item.noiDung ? item.noiDung : ''}
                            </>
                        )}
                        />}
                        {this.checked && <TableCell type='text' content={item.soQuaTrinh} />}
                        {this.checked && <TableCell type='text' content={this.list(item.danhSachMucDich, item.danhSachNgayDi, item.danhSachNgayVe, item.danhSachNgayDiType, item.danhSachNgayVeType, item.soQuaTrinh)} />}
                        {!this.checked && <TableCell type='text' content={(
                            <>
                                <span>{(item.ngayVe == -1 || item.ngayVe >= item.today) ? <span style={{ color: 'red', whiteSpace: 'nowrap' }}>Đang diễn ra</span> : <span style={{ color: 'red', whiteSpace: 'nowrap' }}>Đã kết thúc</span>}</span>
                            </>
                        )}></TableCell>}
                        {
                            !this.checked && <TableCell type='buttons' style={{ textAlign: 'center' }} content={item} permission={permission}
                                onEdit={() => this.modal.show(item, false)} onDelete={this.delete} >
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
                    <FormSelect className='col-12 col-md-4' ref={e => this.timeType = e} label='Chọn loại thời gian' data={timeList} onChange={() => this.changeAdvancedSearch()} />
                    {(this.timeType && this.timeType.value() >= 1) &&
                        <>
                            <FormDatePicker type='month-mask' ref={e => this.fromYear = e} className='col-12 col-md-2' label='Từ thời gian' onChange={() => this.changeAdvancedSearch()} />
                            <FormDatePicker type='month-mask' ref={e => this.toYear = e} className='col-12 col-md-2' label='Đến thời gian' onChange={() => this.changeAdvancedSearch()} />
                        </>}
                    <FormSelect className='col-12 col-md-4' ref={e => this.tinhTrang = e} label='Tình trạng'
                        data={[
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
                <Pagination style={{ marginLeft: '70px' }} {...{ pageNumber, pageSize, pageTotal, totalItem, pageCondition }}
                    getPage={this.getPage} />
                <EditModal ref={e => this.modal = e} permission={permission}
                    create={this.props.createQtDiNuocNgoai} update={this.props.updateQtDiNuocNgoai}
                    permissions={currentPermissions}
                />
            </>,
            backRoute: '/user/tccb',
            onCreate: permission && permission.write && !this.checked ? (e) => this.showModal(e) : null,
        });
    }
}

const mapStateToProps = state => ({ system: state.system, qtDiNuocNgoai: state.tccb.qtDiNuocNgoai });
const mapActionsToProps = {
    getQtDiNuocNgoaiPage, deleteQtDiNuocNgoai, createQtDiNuocNgoai,
    updateQtDiNuocNgoai, getQtDiNuocNgoaiGroupPage,
};
export default connect(mapStateToProps, mapActionsToProps)(QtDiNuocNgoai);
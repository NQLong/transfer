import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { AdminPage, TableCell, renderTable, AdminModal, FormCheckbox, FormSelect, FormRichTextBox, FormDatePicker } from 'view/component/AdminPage';
import Pagination from 'view/component/Pagination';
import {
    updateQtNghiThaiSan, deleteQtNghiThaiSan, createQtNghiThaiSan,
    getQtNghiThaiSanGroupPage, getQtNghiThaiSanPage
} from './redux';
import { SelectAdapter_DmDonVi } from 'modules/mdDanhMuc/dmDonVi/redux';
import { SelectAdapter_FwCanBoFemale } from 'modules/mdTccb/tccbCanBo/redux';
import { DateInput } from 'view/component/Input';
import Dropdown from 'view/component/Dropdown';

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
    { id: 1, text: 'Theo ngày bắt đầu nghỉ' },
    { id: 2, text: 'Theo ngày trở lại công tác' }
];

class EditModal extends AdminModal {
    state = {
        id: '',
        batDau: '',
        ketThuc: '',
        batDauType: 'dd/mm/yyyy',
        ketThucType: 'dd/mm/yyyy',
    };
    multiple = false;
    onShow = (item, multiple = true) => {
        this.multiple = multiple;
        let { id, shcc, batDau, batDauType, ketThuc, ketThucType, noiDung, troLaiCongTac } = item ? item : {
                id: '', shcc: '', batDau: null, batDauType: '', ketThuc: null, ketThucType: '', noiDung: '', troLaiCongTac: null
            };
        this.setState({
            id, batDauType: batDauType ? batDauType : 'dd/mm/yyyy',
            ketThucType: ketThucType ? ketThucType : 'dd/mm/yyyy',
            batDau, ketThuc
        }, () => {
            this.shcc.value(shcc);
            this.noiDung.value(noiDung ? noiDung : '');
            this.troLaiCongTac.value(troLaiCongTac ? troLaiCongTac : '');

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
        let list_ma = this.shcc.value();
        if (!Array.isArray(list_ma)) {
            list_ma = [list_ma];
        }
        if (list_ma.length == 0) {
            T.notify('Cán bộ nữ bị trống', 'danger');
            this.shcc.focus();
        } else if (!this.batDau.getVal()) {
            T.notify('Ngày bắt đầu kéo dài công tác trống', 'danger');
            this.batDau.focus();
        } else if (!this.state.denNay && !this.ketThuc.getVal()) {
            T.notify('Ngày kết thúc kéo dài công tác trống', 'danger');
            this.ketThuc.focus();
        } else if (!this.state.denNay && this.batDau.getVal() > this.ketThuc.getVal()) {
            T.notify('Ngày bắt đầu lớn hơn ngày kết thúc', 'danger');
            this.batDau.focus();
        } else {
            list_ma.forEach((ma, index) => {
                const changes = {
                    shcc: ma,
                    noiDung: this.noiDung.value(),
                    troLaiCongTac: this.troLaiCongTac.value() ? Number(this.troLaiCongTac.value()) : '',
                    batDauType: this.state.batDauType,
                    batDau: this.batDau.getVal(),
                    ketThucType: !this.state.denNay ? this.state.ketThucType : '',
                    ketThuc: !this.state.denNay ? this.ketThuc.getVal() : -1,
                };
                if (index == list_ma.length - 1) {
                    this.state.id ? this.props.update(this.state.id, changes, this.hide, false) : this.props.create(changes, this.hide, false);
                    this.setState({
                        id: ''
                    });
                    this.shcc.reset();
                }
                else {
                    this.state.id ? this.props.update(this.state.id, changes, null, false) : this.props.create(changes, null, false);
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
            title: this.state.id ? 'Cập nhật nghỉ thai sản' : 'Tạo mới nghỉ thai sản',
            size: 'large',
            body: <div className='row'>
                <FormSelect className='col-md-12' multiple={this.multiple} ref={e => this.shcc = e} label='Cán bộ nữ' data={SelectAdapter_FwCanBoFemale} readOnly={this.state.id ? true : false} required />

                <FormRichTextBox className='col-md-12' ref={e => this.noiDung = e} rows={2} readOnly={readOnly} label='Nội dung' placeholder='Nhập nội dung nghỉ thai sản (tối đa 200 ký tự)' maxLength={200} />

                <div className='form-group col-md-6'><DateInput ref={e => this.batDau = e} placeholder='Thời gian bắt đầu'
                    label={
                        <div style={{ display: 'flex' }}>Thời gian bắt đầu (&nbsp; <Dropdown ref={e => this.batDauType = e}
                            items={[...Object.keys(EnumDateType).map(key => EnumDateType[key].text)]}
                            onSelected={item => this.setState({ batDauType: item })} readOnly={readOnly} />)&nbsp;<span style={{ color: 'red' }}> *</span></div>
                    }
                    type={this.state.batDauType ? typeMapper[this.state.batDauType] : null} readOnly={readOnly} /></div>
                <FormCheckbox ref={e => this.denNayCheck = e} label='Đến nay' onChange={this.handleKetThuc} className='form-group col-md-3' />
                <div className='form-group col-md-6' id='ketThucDate'><DateInput ref={e => this.ketThuc = e} placeholder='Thời gian kết thúc'
                    label={
                        <div style={{ display: 'flex' }}>Thời gian kết thúc (&nbsp; <Dropdown ref={e => this.ketThucType = e}
                            items={[...Object.keys(EnumDateType).map(key => EnumDateType[key].text)]}
                            onSelected={item => this.setState({ ketThucType: item })} readOnly={readOnly} />)&nbsp;<span style={{ color: 'red' }}> *</span></div>
                    }
                    type={this.state.ketThucType ? typeMapper[this.state.ketThucType] : null} readOnly={readOnly} /></div>
                <FormDatePicker className='col-md-6' type='date-mask' ref={e => this.troLaiCongTac = e} label='Ngày trở lại công tác' readOnly={readOnly} />
            </div>
        });
    }
}

class QtNghiThaiSan extends AdminPage {
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
        let { pageNumber, pageSize } = this.props && this.props.qtNghiThaiSan && this.props.qtNghiThaiSan.page ? this.props.qtNghiThaiSan.page : { pageNumber: 1, pageSize: 50 };
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
                    this.tinhTrang?.value(filter.tinhTrang);
                    this.timeType?.value(filter.timeType);
                    if (!$.isEmptyObject(filter) && filter && (filter.fromYear || filter.toYear || filter.list_shcc || filter.list_dv || filter.tinhTrang || filter.timeType)) this.showAdvanceSearch();
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
            results.push(<div> <span>
                {i+1}. {s}
            </span></div>);
        }
        if (soQt > 15) {
            let i = soQt - 1;
            results.push(<div> <span>
                ........................
            </span></div>);
            let s = danhSachNoiDungs[i];
            s += ' (' + (batDaus[i] ? T.dateToText(Number(batDaus[i]), batDauTypes[i] ? batDauTypes[i] : 'dd/mm/yyyy') : '') + ' - ';
            s += ketThucs[i] ? (ketThucs[i] != '-1' ? T.dateToText(Number(ketThucs[i]), ketThucTypes[i] ? ketThucTypes[i] : 'dd/mm/yyyy') : 'Đến nay') : '';
            s += ')';
            results.push(<div> <span>
                {i + 1}. {s}
            </span></div>);
        }
        return results;
    }

    delete = (e, item) => {
        T.confirm('Xóa nghỉ thai sản', 'Bạn có chắc bạn muốn xóa nghỉ thai sản này?', 'warning', true, isConfirm => {
            isConfirm && this.props.deleteQtNghiThaiSan(item.id, error => {
                if (error) T.notify(error.message ? error.message : 'Xoá nghỉ thai sản bị lỗi!', 'danger');
                else T.alert('Xoá nghỉ thai sản thành công!', 'success', false, 800);
            });
        });
        e.preventDefault();
    }

    render() {
        const currentPermissions = this.props.system && this.props.system.user && this.props.system.user.permissions ? this.props.system.user.permissions : [],
            permission = this.getUserPermission('qtNghiThaiSan', ['read', 'write', 'delete']);
        let { pageNumber, pageSize, pageTotal, totalItem, pageCondition, list } = this.checked ? (
            this.props.qtNghiThaiSan && this.props.qtNghiThaiSan.page_gr ?
                this.props.qtNghiThaiSan.page_gr : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, list })
            : (this.props.qtNghiThaiSan && this.props.qtNghiThaiSan.page ? this.props.qtNghiThaiSan.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, pageCondition: {}, list: [] });
        let table = 'Không có danh sách!';
        if (list && list.length > 0) {
            table = renderTable({
                getDataSource: () => list, stickyHead: true,
                renderHead: () => (
                    <tr>
                        <th style={{ width: 'auto', textAlign: 'right' }}>#</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Cán bộ nữ</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Học vị</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Chức danh nghề nghiệp</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Chức vụ<br/>Đơn vị công tác</th>
                        {!this.checked && <th style={{ width: '100%', whiteSpace: 'nowrap', textAlign: 'center' }}>Nội dung</th>}
                        {!this.checked && <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Thời gian trở lại công tác</th>}
                        {!this.checked && <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Tình trạng</th>}
                        {this.checked && <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Số lần nghỉ</th>}
                        {this.checked && <th style={{ width: '100%', whiteSpace: 'nowrap', textAlign: 'center' }}>Danh sách</th>}
                        <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Thao tác</th>
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
                                {item.noiDung ? <span><i>{item.noiDung}</i> <br /> <br /></span> : null}
                                {item.batDau ? <span style={{ whiteSpace: 'nowrap' }}>Bắt đầu: <span style={{ color: 'blue' }}>{item.batDau ? T.dateToText(item.batDau, item.batDauType ? item.batDauType : 'dd/mm/yyyy') : ''}</span><br /></span> : null}
                                {item.ketThuc && item.ketThuc != -1 ? <span style={{ whiteSpace: 'nowrap' }}>Kết thúc: <span style={{ color: 'blue' }}>{item.ketThuc && item.ketThuc != -1 ? T.dateToText(item.ketThuc, item.ketThucType ? item.ketThucType : 'dd/mm/yyyy') : ''}</span><br /></span> : null}
                            </>
                        )}
                        />}
                        {!this.checked && <TableCell type='text' style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={<span style={{ color: 'blue' }}>{item.troLaiCongTac ? T.dateToText(item.troLaiCongTac, 'dd/mm/yyyy') : ''}</span>} />}
                        {!this.checked && <TableCell type='text' content={(
                            <>
                                <span>{(item.ketThuc == -1 || item.ketThuc >= item.today) ? <span style={{ color: 'red', whiteSpace: 'nowrap' }}>Đang diễn ra</span> : <span style={{ color: 'red', whiteSpace: 'nowrap' }}>Đã kết thúc</span>}</span>
                            </>
                        )}></TableCell>}
                        {this.checked && <TableCell type='text' content={item.soLanNghi} />}
                        {this.checked && <TableCell type='text' content={this.list(item.danhSachNoiDung, item.danhSachBatDau, item.danhSachKetThuc, item.danhSachBatDauType, item.danhSachKetThucType, item.soLanNghi)} />}
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
                    <FormSelect className='col-12 col-md-4' ref={e => this.timeType = e} label='Chọn loại thời gian' data={timeList} onChange={() => this.changeAdvancedSearch()} allowClear={true} minimumResultsForSearch={-1} />
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
                    <FormSelect className='col-12 col-md-6' multiple={true} ref={e => this.mulCanBo = e} label='Cán bộ nữ' data={SelectAdapter_FwCanBoFemale} onChange={() => this.changeAdvancedSearch()} allowClear={true} minimumResultsForSearch={-1} />
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
                    create={this.props.createQtNghiThaiSan} update={this.props.updateQtNghiThaiSan} />
            </>,
            backRoute: '/user/tccb',
            onCreate: permission && permission.write && !this.checked ? (e) => this.showModal(e) : null,
            onExport: !this.checked ? (e) => {
                e.preventDefault();
                const { fromYear, toYear, list_shcc, list_dv, timeType, tinhTrang } = (this.state.filter && this.state.filter != '%%%%%%%%') ? this.state.filter : { fromYear: null, toYear: null, list_shcc: null, list_dv: null, timeType: 0, tinhTrang: null };

                T.download(T.url(`/api/qua-trinh/nghi-thai-san/download-excel/${list_shcc ? list_shcc : null}/${list_dv ? list_dv : null}/${fromYear ? fromYear : null}/${toYear ? toYear : null}/${timeType}/${tinhTrang ? tinhTrang : null}`), 'nghithaisan.xlsx');
            } : null
        });
    }
}

const mapStateToProps = state => ({ system: state.system, qtNghiThaiSan: state.tccb.qtNghiThaiSan });
const mapActionsToProps = {
    createQtNghiThaiSan, updateQtNghiThaiSan, deleteQtNghiThaiSan,
    getQtNghiThaiSanGroupPage, getQtNghiThaiSanPage,
};
export default connect(mapStateToProps, mapActionsToProps)(QtNghiThaiSan);
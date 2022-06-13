import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { AdminPage, TableCell, renderTable, AdminModal, FormCheckbox, FormSelect, FormDatePicker } from 'view/component/AdminPage';
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
    { id: 0, text: 'Theo ngày bắt đầu' },
    { id: 1, text: 'Theo ngày kết thúc' },
];

class EditModal extends AdminModal {
    state = {
        id: '',
        batDau: '',
        ketThuc: '',
        batDauType: 'dd/mm/yyyy',
        ketThucType: 'dd/mm/yyyy',
    };
    onShow = (item) => {
        let { id, shcc, batDau, batDauType, ketThuc, ketThucType } = item ? item : {
                id: '', shcc: '', batDau: null, batDauType: '', ketThuc: null, ketThucType: ''
            };
        this.setState({
            id, batDauType: batDauType ? batDauType : 'dd/mm/yyyy',
            ketThucType: ketThucType ? ketThucType : 'dd/mm/yyyy',
            batDau, ketThuc
        }, () => {
            this.shcc.value(shcc);
            this.batDauType.setText({ text: batDauType ? batDauType : 'dd/mm/yyyy' });
            this.ketThucType.setText({ text: ketThucType ? ketThucType : 'dd/mm/yyyy' });
            this.batDau.setVal(batDau ? batDau : '');
            this.ketThuc.setVal(ketThuc ? ketThuc : '');
        });
    };

    onSubmit = (e) => {
        e.preventDefault();
        const changes = {
            shcc: this.shcc.value(),
            batDauType: this.state.batDauType,
            batDau: this.batDau.getVal(),
            ketThucType: this.state.ketThucType,
            ketThuc: this.ketThuc.getVal(),
        };
        if (!changes.shcc) {
            T.notify('Mã số cán bộ bị trống');
            this.shcc.focus();
        } else if (!this.batDau.getVal()) {
            T.notify('Ngày bắt đầu trống', 'danger');
            this.batDau.focus();
        } else if (!this.ketThuc.getVal()) {
            T.notify('Ngày kết thúc trống', 'danger');
            this.ketThuc.focus();
        } else if (this.batDau.getVal() > this.ketThuc.getVal()) {
            T.notify('Ngày bắt đầu lớn hơn ngày kết thúc', 'danger');
            this.batDau.focus();
        } else {
            this.state.id ? this.props.update(this.state.id, changes, this.hide) : this.props.create(changes, this.hide);
        }
    }

    render = () => {
        const readOnly = this.props.readOnly;
        return this.renderModal({
            title: this.state.id ? 'Cập nhật nghỉ thai sản' : 'Tạo mới nghỉ thai sản',
            size: 'large',
            body: <div className='row'>
                <FormSelect className='col-md-12' ref={e => this.shcc = e} label='Cán bộ nữ' data={SelectAdapter_FwCanBoFemale} readOnly={this.state.id ? true : false} required />

                <div className='form-group col-md-6'><DateInput ref={e => this.batDau = e} placeholder='Thời gian bắt đầu'
                    label={
                        <div style={{ display: 'flex' }}>Thời gian bắt đầu (&nbsp; <Dropdown ref={e => this.batDauType = e}
                            items={[...Object.keys(EnumDateType).map(key => EnumDateType[key].text)]}
                            onSelected={item => this.setState({ batDauType: item })} readOnly={readOnly} />)&nbsp;<span style={{ color: 'red' }}> *</span></div>
                    }
                    type={this.state.batDauType ? typeMapper[this.state.batDauType] : null} readOnly={readOnly} /></div>
                <div className='form-group col-md-6' id='ketThucDate'><DateInput ref={e => this.ketThuc = e} placeholder='Thời gian kết thúc'
                    label={
                        <div style={{ display: 'flex' }}>Thời gian kết thúc (&nbsp; <Dropdown ref={e => this.ketThucType = e}
                            items={[...Object.keys(EnumDateType).map(key => EnumDateType[key].text)]}
                            onSelected={item => this.setState({ ketThucType: item })} readOnly={readOnly} />)&nbsp;<span style={{ color: 'red' }}> *</span></div>
                    }
                    type={this.state.ketThucType ? typeMapper[this.state.ketThucType] : null} readOnly={readOnly} /></div>
            </div>
        });
    }
}

class QtNghiThaiSan extends AdminPage {
    checked = parseInt(T.cookie('hienThiTheoCanBo')) == 1 ? true : false;
    state = { filter: {}, visibleTime: false };
    componentDidMount() {
        T.ready('/user/tccb', () => {
            T.clearSearchBox();
            T.onSearch = (searchText) => this.getPage(undefined, undefined, searchText || '');
            T.showSearchBox(() => {
                this.timeType.value('');
                this.fromYear?.value('');
                this.toYear?.value('');
                this.maDonVi.value('');
                this.mulCanBo.value('');
                this.tinhTrang.value('');
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
        let { pageNumber, pageSize, pageCondition } = this.props && this.props.qtNghiThaiSan && this.props.qtNghiThaiSan.page ? this.props.qtNghiThaiSan.page : { pageNumber: 1, pageSize: 50, pageCondition: {} };

        if (pageCondition && (typeof pageCondition == 'string')) T.setTextSearchBox(pageCondition);

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
        const timeType = this.timeType.value() || '';
        const listDv = this.maDonVi.value().toString() || '';
        const listShcc = this.mulCanBo.value().toString() || '';
        const tinhTrang = this.tinhTrang.value() == '' ? null : this.tinhTrang.value();
        const pageFilter = (isInitial || isReset) ? {} : { listDv, fromYear, toYear, listShcc, tinhTrang, timeType };
        this.setState({ filter: pageFilter }, () => {
            this.getPage(pageNumber, pageSize, pageCondition, (page) => {
                if (isInitial) {
                    const filter = page.filter || {};
                    this.setState({ filter: !$.isEmptyObject(filter) ? filter : pageFilter });
                    this.fromYear?.value(filter.fromYear || '');
                    this.toYear?.value(filter.toYear || '');
                    this.maDonVi.value(filter.listDv);
                    this.mulCanBo.value(filter.listShcc);
                    this.tinhTrang.value(filter.tinhTrang);
                    this.timeType.value(filter.timeType);
                    if (!$.isEmptyObject(filter) && filter && (filter.fromYear || filter.toYear || filter.listShcc || filter.listDv || filter.tinhTrang || filter.timeType)) this.showAdvanceSearch();
                } else if (isReset) {
                    this.timeType.value('');
                    this.fromYear?.value('');
                    this.toYear?.value('');
                    this.tinhTrang.value('');
                    this.maDonVi.value('');
                    this.mulCanBo.value('');
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
            results.push(<div key={results.length}> <span>
                {i+1}. {s}
            </span></div>);
        }
        if (soQt > 15) {
            let i = soQt - 1;
            results.push(<div key={results.length}> <span>
                ........................
            </span></div>);
            let s = danhSachNoiDungs[i];
            s += ' (' + (batDaus[i] ? T.dateToText(Number(batDaus[i]), batDauTypes[i] ? batDauTypes[i] : 'dd/mm/yyyy') : '') + ' - ';
            s += ketThucs[i] ? (ketThucs[i] != '-1' ? T.dateToText(Number(ketThucs[i]), ketThucTypes[i] ? ketThucTypes[i] : 'dd/mm/yyyy') : 'Đến nay') : '';
            s += ')';
            results.push(<div key={results.length}> <span>
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
    
    handleTime = (value) => {
        value ? this.setState({ visibleTime: true }) : this.setState({ visibleTime: false });
    }

    render() {
        const currentPermissions = this.props.system && this.props.system.user && this.props.system.user.permissions ? this.props.system.user.permissions : [],
            permission = this.getUserPermission('qtNghiThaiSan', ['read', 'write', 'delete']);
        let { pageNumber, pageSize, pageTotal, totalItem, pageCondition, list } = this.checked ? (
            this.props.qtNghiThaiSan && this.props.qtNghiThaiSan.pageGr ?
                this.props.qtNghiThaiSan.pageGr : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, list })
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
                        {!this.checked && <th style={{ width: '100%', whiteSpace: 'nowrap', textAlign: 'center' }}>Thời gian nghỉ</th>}
                        {!this.checked && <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Tình trạng</th>}
                        {this.checked && <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Số lần nghỉ</th>}
                        {this.checked && <th style={{ width: '100%', whiteSpace: 'nowrap', textAlign: 'center' }}>Danh sách</th>}
                        <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Thao tác</th>
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
                        <TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={item.tenChucDanhNgheNghiep || ''} />
                        <TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={(
                            <>
                                <span> {item.tenChucVu || ''}<br /> </span>
                                {(item.tenDonVi || '')}
                            </>
                        )} />
                        {!this.checked && <TableCell type='text' content={(
                            <>
                                {item.batDau ? <span style={{ whiteSpace: 'nowrap' }}>Bắt đầu: <span style={{ color: 'blue' }}>{item.batDau ? T.dateToText(item.batDau, item.batDauType ? item.batDauType : 'dd/mm/yyyy') : ''}</span><br /></span> : null}
                                {item.ketThuc && item.ketThuc != -1 ? <span style={{ whiteSpace: 'nowrap' }}>Kết thúc: <span style={{ color: 'blue' }}>{item.ketThuc && item.ketThuc != -1 ? T.dateToText(item.ketThuc, item.ketThucType ? item.ketThucType : 'dd/mm/yyyy') : ''}</span><br /></span> : null}
                            </>
                        )}
                        />}
                        {!this.checked && <TableCell type='text' content={(
                            <>
                                <span>{item.batDau > item.today ? <span style={{ whiteSpace: 'nowrap' }}><i>Chưa diễn ra</i></span> : item.ketThuc >= item.today ? <span style={{ color: 'blue', whiteSpace: 'nowrap' }}>Đang diễn ra</span> : <span style={{ color: 'red', whiteSpace: 'nowrap' }}>Đã kết thúc</span>}</span>
                            </>
                        )}></TableCell>}
                        {this.checked && <TableCell type='text' content={item.soLanNghi} />}
                        {this.checked && <TableCell type='text' content={this.list(item.danhSachNoiDung, item.danhSachBatDau, item.danhSachKetThuc, item.danhSachBatDauType, item.danhSachKetThucType, item.soLanNghi)} />}
                        {
                            !this.checked && <TableCell type='buttons' style={{ textAlign: 'center' }} content={item} permission={permission}
                                onEdit={() => this.modal.show(item)} onDelete={e => this.delete(e, item)} > </TableCell>
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
                    <FormSelect className='col-12 col-md-4' ref={e => this.timeType = e} label='Chọn loại thời gian' data={timeList} allowClear={true} onChange={this.handleTime} />
                    {this.state.visibleTime ?
                        <>
                            <FormDatePicker type='date-mask' ref={e => this.fromYear = e} className='col-12 col-md-4' label='Từ thời gian' />
                            <FormDatePicker type='date-mask' ref={e => this.toYear = e} className='col-12 col-md-4' label='Đến thời gian' />
                        </> : <div className='form-group col-8' />}
                    <FormSelect className='col-12 col-md-2' ref={e => this.tinhTrang = e} label='Tình trạng'
                        data={[
                            { id: 1, text: 'Đã kết thúc' }, { id: 2, text: 'Đang diễn ra' }, { id: 3, text: 'Chưa diễn ra'}
                        ]} allowClear={true} minimumResultsForSearch={-1} />
                    <FormSelect className='col-12 col-md-5' multiple={true} ref={e => this.maDonVi = e} label='Đơn vị' data={SelectAdapter_DmDonVi} allowClear={true} minimumResultsForSearch={-1} />
                    <FormSelect className='col-12 col-md-5' multiple={true} ref={e => this.mulCanBo = e} label='Cán bộ nữ' data={SelectAdapter_FwCanBoFemale} allowClear={true} minimumResultsForSearch={-1} />
                    <div className='form-group col-12' style={{ justifyContent: 'end', display: 'flex', marginTop: '10px' }}>
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
                const { fromYear, toYear, listShcc, listDv, timeType, tinhTrang } = (this.state.filter && this.state.filter != '%%%%%%%%') ? this.state.filter : { fromYear: null, toYear: null, listShcc: null, listDv: null, timeType: 0, tinhTrang: null };

                T.download(T.url(`/api/qua-trinh/nghi-thai-san/download-excel/${listShcc ? listShcc : null}/${listDv ? listDv : null}/${fromYear ? fromYear : null}/${toYear ? toYear : null}/${timeType ? timeType : null}/${tinhTrang ? tinhTrang : null}`), 'nghithaisan.xlsx');
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
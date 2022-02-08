import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { AdminPage, TableCell, renderTable, AdminModal, FormTextBox, FormSelect, FormDatePicker, FormCheckbox } from 'view/component/AdminPage';
import Pagination from 'view/component/Pagination';
import Dropdown from 'view/component/Dropdown';
import { DateInput } from 'view/component/Input';
import {
    getQtBaoHiemXaHoiPage, getQtBaoHiemXaHoiGroupPage, updateQtBaoHiemXaHoiStaff,
    createQtBaoHiemXaHoiStaff, deleteQtBaoHiemXaHoiStaff
} from './redux';
import { SelectAdapter_FwCanBo } from 'modules/mdTccb/tccbCanBo/redux';
import { SelectAdapter_DmDonVi} from 'modules/mdDanhMuc/dmDonVi/redux';
import { SelectAdapter_DmChucVuV1} from 'modules/mdDanhMuc/dmChucVu/redux';

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

class EditModal extends AdminModal {
    state = {
        id: null,
        batDau: '',
        ketThuc: '',
        batDauType: 'dd/mm/yyyy',
        ketThucType: 'dd/mm/yyyy',
    };

    multiple = false;
    componentDidMount() {
    }

    onShow = (item, multiple = true) => {
        this.multiple = multiple;
        let { id, shcc, batDau, batDauType, ketThuc, ketThucType, chucVu, mucDong, phuCapChucVu, phuCapThamNienVuotKhung, phuCapThamNienNghe, tyLeDong } = item ? item : {
            id: '', shcc: '', batDau: '', batDauType: '', ketThuc: '', ketThucType: '', chucVu: '', mucDong: '', phuCapChucVu: '',  phuCapThamNienVuotKhung: '', phuCapThamNienNghe: '', tyLeDong: ''
        };
        this.setState({
            id, batDauType: batDauType ? batDauType : 'dd/mm/yyyy',
            ketThucType: ketThucType ? ketThucType : 'dd/mm/yyyy',
            batDau, ketThuc
        });

        setTimeout(() => {
            this.shcc.value(shcc);
            this.batDau.setVal(batDau);
            this.ketThuc.setVal(ketThuc);
            this.batDauType.setText({ text: batDauType ? batDauType : 'dd/mm/yyyy' });
            this.ketThucType.setText({ text: ketThucType ? ketThucType : 'dd/mm/yyyy' });
            this.chucVu.value(chucVu ? chucVu : '');
            this.mucDong.value(mucDong ? mucDong : '');
            this.phuCapChucVu.value(phuCapChucVu ? phuCapChucVu : '');
            this.phuCapThamNienVuotKhung.value(phuCapThamNienVuotKhung ? phuCapThamNienVuotKhung : '');
            this.phuCapThamNienNghe.value(phuCapThamNienNghe ? phuCapThamNienNghe : '');
            this.tyLeDong.value(tyLeDong ? tyLeDong : '');
        }, 500);
    }

    onSubmit = (e) => {
        e.preventDefault();
        let list_ma = this.shcc.value();
        if (!Array.isArray(list_ma)) {
            list_ma = [list_ma];
        }
        if (list_ma.length == 0) {
            T.notify('Cán bộ bị trống', 'danger');
            this.shcc.focus();
        } else if (!this.batDau.getVal()) {
            T.notify('Ngày bắt đầu trống', 'danger');
            this.batDau.focus();
        } else {
            list_ma.forEach((ma, index) => {
                const changes = {
                    shcc: ma,
                    batDauType: this.state.batDauType,
                    batDau: this.batDau.getVal(),
                    ketThucType: this.state.ketThucType,
                    ketThuc: this.ketThuc.getVal(),
                    chucVu: this.chucVu.value(),
                    mucDong: this.mucDong.value(),
                    phuCapChucVu: this.phuCapChucVu.value(),
                    phuCapThamNienVuotKhung: this.phuCapThamNienVuotKhung.value(),
                    phuCapThamNienNghe: this.phuCapThamNienNghe.value(),
                    tyLeDong: this.tyLeDong.value(),
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

    render = () => {
        const readOnly = this.props.readOnly;
        const canEdit = this.state.id ? false : true;
        return this.renderModal({
            title: this.state.id ? 'Cập nhật thông tin bảo hiểm xã hội' : 'Tạo mới thông tin bảo hiểm xã hội',
            size: 'large',
            body: <div className='row'>
                <FormSelect className='col-md-12' multiple={this.multiple} ref={e => this.shcc = e} data={SelectAdapter_FwCanBo} label='Cán bộ' readOnly={!canEdit} required />
                <FormSelect className='col-md-6' ref={e => this.chucVu = e} label='Chức vụ' data={SelectAdapter_DmChucVuV1} readOnly={readOnly} />
                <FormTextBox className='col-md-3' type='number' ref={e => this.mucDong = e} label='Mức đóng' readOnly={readOnly} />
                <FormTextBox className='col-md-3' type='number' ref={e => this.tyLeDong = e} label='Tỷ lệ đóng' readOnly={readOnly} />
                <FormTextBox className='col-md-4' type='number' ref={e => this.phuCapChucVu = e} label='Phụ cấp chức vụ' readOnly={readOnly} />
                <FormTextBox className='col-md-4' type='number' ref={e => this.phuCapThamNienVuotKhung = e} label='Phụ cấp thâm niên vượt khung' readOnly={readOnly} />
                <FormTextBox className='col-md-4' type='number' ref={e => this.phuCapThamNienNghe = e} label='Phụ cấp thâm niên nghề' readOnly={readOnly} />
                <div className='form-group col-md-6'><DateInput ref={e => this.batDau = e} placeholder='Thời gian bắt đầu'
                    label={
                        <div style={{ display: 'flex' }}>Thời gian bắt đầu (định dạng:&nbsp; <Dropdown ref={e => this.batDauType = e}
                            items={[...Object.keys(EnumDateType).map(key => EnumDateType[key].text)]}
                            onSelected={item => this.setState({ batDauType: item })} readOnly={readOnly} />)&nbsp;<span style={{ color: 'red' }}> *</span></div>
                    }
                    type={this.state.batDauType ? typeMapper[this.state.batDauType] : null} readOnly={readOnly} /></div>
                <div className='form-group col-md-6'><DateInput ref={e => this.ketThuc = e} placeholder='Thời gian kết thúc'
                    label={
                        <div style={{ display: 'flex' }}>Thời gian kết thúc (định dạng:&nbsp; <Dropdown ref={e => this.ketThucType = e}
                            items={[...Object.keys(EnumDateType).map(key => EnumDateType[key].text)]}
                            onSelected={item => this.setState({ ketThucType: item })} readOnly={readOnly} />)</div>
                    }
                    type={this.state.ketThucType ? typeMapper[this.state.ketThucType] : null} readOnly={readOnly} /></div>
            </div>,
        });
    }
}

class QtBaoHiemXaHoi extends AdminPage {
    checked = parseInt(T.cookie('hienThiTheoCanBo')) == 1 ? true : false;
    state = { filter: {} };

    componentDidMount() {
        T.ready('/user/tccb', () => {
            T.onSearch = (searchText) => this.getPage(undefined, undefined, searchText || '');
            T.showSearchBox(() => {
                this.fromYear?.value('');
                this.toYear?.value('');
                this.maDonVi?.value('');
                this.mulCanBo?.value('');
                setTimeout(() => this.changeAdvancedSearch(), 50);
            });
            if (this.checked) {
                this.hienThiTheoCanBo.value(true);
                this.props.getQtBaoHiemXaHoiGroupPage();
            } else {
                this.props.getQtBaoHiemXaHoiPage();
            }
            this.changeAdvancedSearch(true);
        });
    }

    showModal = (e) => {
        e.preventDefault();
        this.modal.show();
    }

    changeAdvancedSearch = (isInitial = false) => {
        let { pageNumber, pageSize } = this.props && this.props.qtBaoHiemXaHoi && this.props.qtBaoHiemXaHoi.page ? this.props.qtBaoHiemXaHoi.page : { pageNumber: 1, pageSize: 50 };
        const fromYear = this.fromYear?.value() == '' ? null : this.fromYear?.value().getTime();
        const toYear = this.toYear?.value() == '' ? null : this.toYear?.value().getTime();
        const list_dv = this.maDonVi?.value().toString() || '';
        const list_shcc = this.mulCanBo?.value().toString() || '';
        const pageFilter = isInitial ? null : { list_dv, fromYear, toYear, list_shcc };
        this.setState({ filter: pageFilter }, () => {
            this.getPage(pageNumber, pageSize, '', (page) => {
                if (isInitial) {
                    const filter = page.filter || {};
                    this.setState({ filter: !$.isEmptyObject(filter) ? filter : pageFilter });
                    this.fromYear?.value(filter.fromYear || '');
                    this.toYear?.value(filter.toYear || '');
                    this.maDonVi?.value(filter.list_dv);
                    this.mulCanBo?.value(filter.list_shcc);
                    if (!$.isEmptyObject(filter) && filter && (filter.fromYear || filter.toYear || filter.list_shcc || filter.list_dv)) this.showAdvanceSearch();
                }
            });
        });
    }

    getPage = (pageN, pageS, pageC, done) => {
        if (this.checked) this.props.getQtBaoHiemXaHoiGroupPage(pageN, pageS, pageC, this.state.filter, done);
        else this.props.getQtBaoHiemXaHoiPage(pageN, pageS, pageC, this.state.filter, done);
    }
    
    groupPage = () => {
        this.checked = !this.checked;
        T.cookie('hienThiTheoCanBo', this.checked ? 1 : 0);
        this.getPage();
    }

    list = (batDauList, ketThucList, batDauTypeList, ketThucTypeList, soQt) => {
        if (soQt == 0) return [];
        let batDaus = batDauList.split('??');
        let ketThucs = ketThucList.split('??');
        let batDauTypes = batDauTypeList.split('??');
        let ketThucTypes = ketThucTypeList.split('??');
        let results = [];
        for (let i = 0; i < soQt; i++) {
            batDaus[i] = batDaus[i].trim();
            ketThucs[i] = ketThucs[i].trim();
        }
        for (let i = 0; i < soQt; i++) {
            results.push(<p style={{ textTransform: 'uppercase' }}>{i+1}. Bắt đầu: <span style={{ color: 'blue' }}>{batDaus[i] ? T.dateToText(Number(batDaus[i]), batDauTypes[i] ? batDauTypes[i] : 'dd/mm/yyyy') : ''}</span> -
                                                                        Kết thúc: <span style={{ color: 'blue' }}>{ketThucs[i] ? T.dateToText(Number(ketThucs[i]), ketThucTypes[i] ? ketThucTypes[i] : 'dd/mm/yyyy') : ''}</span></p>);
        }
        return results;
    }

    delete = (e, item) => {
        T.confirm('Xóa quá trình bảo hiểm xã hội', 'Bạn có chắc bạn muốn xóa quá trình bảo hiểm xã hội này', 'warning', true, isConfirm => {
            isConfirm && this.props.deleteQtBaoHiemXaHoiStaff(item.id, false, null, error => {
                if (error) T.notify(error.message ? error.message : `Xoá quá trình bảo hiểm xã hội ${item.ten} bị lỗi!`, 'danger');
                else T.alert(`Xoá quá trình bảo hiểm xã hội ${item.ten} thành công!`, 'success', false, 800);
            });
        });
        e.preventDefault();
    }

    render() {
        const currentPermissions = this.props.system && this.props.system.user && this.props.system.user.permissions ? this.props.system.user.permissions : [],
            permission = this.getUserPermission('qtBaoHiemXaHoi', ['read', 'write', 'delete']);
        let { pageNumber, pageSize, pageTotal, totalItem, pageCondition, list } = this.checked ? (
            this.props.qtBaoHiemXaHoi && this.props.qtBaoHiemXaHoi.page_gr ?
                this.props.qtBaoHiemXaHoi.page_gr : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, list })
            : (this.props.qtBaoHiemXaHoi && this.props.qtBaoHiemXaHoi.page ? this.props.qtBaoHiemXaHoi.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, pageCondition: {}, list: [] });
        let table = 'Không có danh sách!';
        if (list && list.length > 0) {
            table = renderTable({
                getDataSource: () => list, stickyHead: false,
                renderHead: () => (
                    <tr>
                        <th style={{ width: 'auto', textAlign: 'right' }}>#</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Cán bộ</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Chức vụ</th>
                        {!this.checked && <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Thời gian</th> }
                        {!this.checked && <th style={{ width: '50%', whiteSpace: 'nowrap', textAlign: 'center' }}>Thông tin tham gia</th> }
                        {!this.checked && <th style={{ width: '50%', whiteSpace: 'nowrap', textAlign: 'center' }}>Thông tin phụ cấp</th> }
                        {this.checked && <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Số quá trình</th> }
                        {this.checked && <th style={{ width: '100%', whiteSpace: 'nowrap' }}>Danh sách thời gian</th> }
                        <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Thao tác</th>
                    </tr>
                ),
                renderRow: (item, index) => (
                    <tr key={index}>
                        <TableCell type='text' style={{ textAlign: 'right' }} content={index + 1} />
                        <TableCell type='link' onClick={() => this.modal.show(item, false)} style={{ whiteSpace: 'nowrap' }} content={(
                            <>
                                <span>{(item.hoCanBo ? item.hoCanBo : ' ') + ' ' + (item.tenCanBo ? item.tenCanBo : ' ')}</span><br />
                                {item.shcc}
                            </>
                        )}
                        />
                        <TableCell type='text' style={{  whiteSpace: 'nowrap' }} content={item.tenChucVu}/>
                        {!this.checked && <TableCell type='text' content={(
                            <>
                                {item.batDau ? <span style={{ whiteSpace: 'nowrap' }}>Bắt đầu: <span style={{ color: 'blue' }}>{item.batDau ? T.dateToText(item.batDau, item.batDauType ? item.batDauType : 'dd/mm/yyyy') : ''}</span><br/></span> : null}
                                {item.ketThuc ? <span style={{ whiteSpace: 'nowrap' }}>Kết thúc: <span style={{ color: 'blue' }}>{item.ketThuc ? T.dateToText(item.ketThuc, item.ketThucType ? item.ketThucType : 'dd/mm/yyyy') : ''}</span><br/></span> : null}
                            </>
                        )}
                        />}
                        {!this.checked && <TableCell type='text' style={{  whiteSpace: 'nowrap' }} content={(
                            <>
                                <span><i>Mức đóng: </i></span> <span>{item.mucDong}</span> <br/>
                                <span><i>Tỷ lệ đóng: </i></span><span>{item.tyLeDong}</span> <br/>
                            </>
                        )}
                        />}
                        {!this.checked && <TableCell type='text' style={{  whiteSpace: 'nowrap' }} content={(
                            <>
                                <span><i>Phụ cấp chức vụ: </i></span> <span>{item.phuCapChucVu}</span> <br/>
                                <span><i>Phụ cấp thâm niên vượt khung: </i></span> <span>{item.phuCapThamNienVuotKhung}</span> <br/>
                                <span><i>Phụ cấp thâm niên nghề: </i></span> <span>{item.phuCapThamNienNghe}</span> <br/>
                            </>
                        )}
                        />}
                        {this.checked && <TableCell type='text' content={item.soQuaTrinh} />}
                        {this.checked && <TableCell type='text' content={this.list(item.danhSachBatDau, item.danhSachKetThuc, item.danhSachBatDauType, item.danhSachKetThucType, item.soQuaTrinh)} />}
                        {
                            !this.checked && <TableCell type='buttons' style={{ textAlign: 'center' }} content={item} permission={permission}
                                onEdit={() => this.modal.show(item, false)} onDelete={e => this.delete(e, item)} > </TableCell>
                        }
                        {
                            this.checked &&
                            <TableCell type='buttons' style={{ textAlign: 'center', width: '45px' }} content={item} permission={permission}>
                                <Link className='btn btn-success' to={`/user/tccb/qua-trinh/bao-hiem-xa-hoi/group/${item.shcc}`} >
                                    <i className='fa fa-lg fa-compress' />
                                </Link>
                            </TableCell>
                        }
                    </tr>
                )
            });
        }

        return this.renderPage({
            icon: 'fa fa-gift',
            title: 'Quá trình bảo hiểm xã hội',
            breadcrumb: [
                <Link key={0} to='/user/tccb'>Tổ chức cán bộ</Link>,
                'Quá trình bảo hiểm xã hội'
            ],
            advanceSearch: <>
                <div className='row'>
                    <FormDatePicker type='month-mask' ref={e => this.fromYear = e} className='col-12 col-md-3' label='Từ thời gian' onChange={() => this.changeAdvancedSearch()} />
                    <FormDatePicker type='month-mask' ref={e => this.toYear = e} className='col-12 col-md-3' label='Đến thời gian' onChange={() => this.changeAdvancedSearch()} />
                    <FormSelect className='col-12 col-md-6' multiple={true} ref={e => this.maDonVi = e} label='Đơn vị' data={SelectAdapter_DmDonVi} onChange={() => this.changeAdvancedSearch()} allowClear={true} minimumResultsForSearch={-1}/>
                    <FormSelect className='col-12 col-md-12' multiple={true} ref={e => this.mulCanBo = e} label='Cán bộ' data={SelectAdapter_FwCanBo} onChange={() => this.changeAdvancedSearch()} allowClear={true} minimumResultsForSearch={-1}/>
                </div>
            </>,
            content: <>
                <div className='tile'>
                <FormCheckbox label='Hiển thị theo cán bộ' ref={e => this.hienThiTheoCanBo = e} onChange={this.groupPage} />
                    {table}
                </div>
                <Pagination style={{ marginLeft: '70px' }} {...{ pageNumber, pageSize, pageTotal, totalItem, pageCondition }}
                    getPage={this.checked ? this.props.getQtBaoHiemXaHoiGroupPage : this.props.getQtBaoHiemXaHoiPage} />
                <EditModal ref={e => this.modal = e} permission={permission}
                    create={this.props.createQtBaoHiemXaHoiStaff} update={this.props.updateQtBaoHiemXaHoiStaff}
                     permissions={currentPermissions}
                    />
            </>,
            backRoute: '/user/tccb',
            onCreate: permission && permission.write && !this.checked ? (e) => this.showModal(e) : null,
        });
    }
}

const mapStateToProps = state => ({ system: state.system, qtBaoHiemXaHoi: state.tccb.qtBaoHiemXaHoi });
const mapActionsToProps = {
    getQtBaoHiemXaHoiPage, getQtBaoHiemXaHoiGroupPage, updateQtBaoHiemXaHoiStaff,
    createQtBaoHiemXaHoiStaff, deleteQtBaoHiemXaHoiStaff,
};
export default connect(mapStateToProps, mapActionsToProps)(QtBaoHiemXaHoi);
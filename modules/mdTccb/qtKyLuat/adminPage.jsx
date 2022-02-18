import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { AdminPage, TableCell, renderTable, AdminModal, FormSelect, FormTextBox, FormCheckbox, FormDatePicker, FormRichTextBox } from 'view/component/AdminPage';
import Pagination from 'view/component/Pagination';
import {
    getQtKyLuatPage, updateQtKyLuatStaff,
    deleteQtKyLuatStaff, createQtKyLuatStaff, getQtKyLuatGroupPage,
} from './redux';
import { DateInput } from 'view/component/Input';
import { SelectAdapter_FwCanBo } from 'modules/mdTccb/tccbCanBo/redux';
import { SelectAdapter_DmDonVi } from 'modules/mdDanhMuc/dmDonVi/redux';
import { SelectAdapter_DmKyLuatV2 } from 'modules/mdDanhMuc/dmKhenThuongKyLuat/reduxKyLuat';
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

        let { id, maCanBo, lyDoHinhThuc, capQuyetDinh, batDau, batDauType, ketThuc, ketThucType, diemThiDua, noiDung } = item ? item : {
            id: '', maCanBo: '', lyDoHinhThuc: '', capQuyetDinh: '', batDau: '', batDauType: '', ketThuc: '', ketThucType: '', diemThiDua: '', noiDung: ''
        };
        
        this.setState({
            id, batDauType: batDauType ? batDauType : 'dd/mm/yyyy',
            ketThucType: ketThucType ? ketThucType : 'dd/mm/yyyy',
            batDau, ketThuc
        });


        setTimeout(() => {
            this.maCanBo.value(maCanBo);
            this.hinhThucKyLuat.value(lyDoHinhThuc);
            this.capQuyetDinh.value(capQuyetDinh ? capQuyetDinh : '');
            this.batDauType.setText({ text: batDauType ? batDauType : 'dd/mm/yyyy' });
            this.ketThucType.setText({ text: ketThucType ? ketThucType : 'dd/mm/yyyy' });
            this.batDau.setVal(batDau);
            this.ketThuc.setVal(ketThuc);
            this.diemThiDua.value(diemThiDua);
            this.noiDung.value(noiDung ? noiDung : '');
        }, 500);
    };

    changeKichHoat = (value, target) => target.value(value ? 1 : 0) || target.value(value);

    onSubmit = (e) => {
        e.preventDefault();
        let list_ma = this.maCanBo.value();
        if (!Array.isArray(list_ma)) {
            list_ma = [list_ma];
        }
        if (list_ma.length == 0) {
            T.notify('Cán bộ bị trống', 'danger');
            this.maCanBo.focus();
        } else if (!this.noiDung.value()) {
            T.notify('Nội dung kỷ luật trống', 'danger');
            this.noiDung.focus();
        } else if (this.noiDung.value().length > 100) {
            T.notify('Nội dung kỷ luật dài quá 100 ký tự', 'danger');
            this.noiDung.focus();
        } else if (!this.hinhThucKyLuat.value()) {
            T.notify('Hình thức kỷ luật trống', 'danger');
            this.hinhThucKyLuat.focus();
        } else if (!this.capQuyetDinh.value()) {
            T.notify('Cấp quyết định trống', 'danger');
            this.capQuyetDinh.focus();
        } else if (!this.batDau.getVal()) {
            T.notify('Ngày bắt đầu trống', 'danger');
            this.batDau.focus();
        } else {
            list_ma.forEach((ma, index) => {
                const changes = {
                    shcc: ma,
                    lyDoHinhThuc: this.hinhThucKyLuat.value(),
                    capQuyetDinh: this.capQuyetDinh.value(),
                    batDauType: this.state.batDauType,
                    batDau: this.batDau.getVal(),
                    ketThucType: this.state.ketThucType,
                    ketThuc: this.ketThuc.getVal(),
                    diemThiDua: this.diemThiDua.value(),
                    noiDung: this.noiDung.value()
                };
                if (index == list_ma.length - 1) {
                    this.state.id ? this.props.update(this.state.id, changes, this.hide, false) : this.props.create(changes, this.hide, false);
                    this.setState({
                        id: ''
                    });
                    this.maCanBo.reset();
                }
                else {
                    this.state.id ? this.props.update(this.state.id, changes, null, false) : this.props.create(changes, null, false);
                }
            });
        }
    }

    render = () => {
        const readOnly = this.props.readOnly;
        return this.renderModal({
            title: this.state.id ? 'Cập nhật quá trình kỷ luật' : 'Tạo mới quá trình kỷ luật',
            size: 'large',
            body: <div className='row'>
                <FormSelect className='col-md-12' multiple={this.multiple} ref={e => this.maCanBo = e} label='Cán bộ' data={SelectAdapter_FwCanBo} readOnly={this.state.id ? true : false} required />

                <FormRichTextBox className='col-md-12' ref={e => this.noiDung = e} rows={2} readOnly={readOnly} label='Nội dung kỷ luật' placeholder='Nhập nội dung kỷ luật (tối đa 100 ký tự)' required maxLength={100} />

                <FormSelect className='col-md-12' ref={e => this.hinhThucKyLuat = e} label='Hình thức kỷ luật' data={SelectAdapter_DmKyLuatV2} readOnly={readOnly} required />

                <FormTextBox className='col-md-12' ref={e => this.capQuyetDinh = e} type='text' label='Cấp quyết định' readOnly={readOnly} required />

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
                <FormTextBox className='col-md-4' ref={e => this.diemThiDua = e} type='number' label='Điểm thi đua' readOnly={readOnly} />

            </div>
        });
    }
}

class QtKyLuat extends AdminPage {
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
        let { pageNumber, pageSize } = this.props && this.props.qtKyLuat && this.props.qtKyLuat.page ? this.props.qtKyLuat.page : { pageNumber: 1, pageSize: 50 };
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
        if (this.checked) this.props.getQtKyLuatGroupPage(pageN, pageS, pageC, this.state.filter, done);
        else this.props.getQtKyLuatPage(pageN, pageS, pageC, this.state.filter, done);
    }

    groupPage = () => {
        this.checked = !this.checked;
        T.cookie('hienThiTheoCanBo', this.checked ? 1 : 0);
        this.getPage();
    }

    list = (text, i, j) => {
        if (!text) return [];
        let deTais = text.split('??').map(str => <p key={i--} style={{ textTransform: 'uppercase' }}>{j - i}. {str}</p>);
        return deTais;
    }

    delete = (e, item) => {
        T.confirm('Xóa kỷ luật', 'Bạn có chắc bạn muốn xóa kỷ luật này?', 'warning', true, isConfirm => {
            isConfirm && this.props.deleteQtKyLuatStaff(item.id, error => {
                if (error) T.notify(error.message ? error.message : 'Xoá kỷ luật bị lỗi!', 'danger');
                else T.alert('Xoá kỷ luật thành công!', 'success', false, 800);
            });
        });
        e.preventDefault();
    }

    render() {
        const currentPermissions = this.props.system && this.props.system.user && this.props.system.user.permissions ? this.props.system.user.permissions : [],
            permission = this.getUserPermission('qtKyLuat', ['read', 'write', 'delete']);
        let { pageNumber, pageSize, pageTotal, totalItem, pageCondition, list } = this.checked ? (
            this.props.qtKyLuat && this.props.qtKyLuat.page_gr ?
                this.props.qtKyLuat.page_gr : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, list })
            : (this.props.qtKyLuat && this.props.qtKyLuat.page ? this.props.qtKyLuat.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, pageCondition: {}, list: [] });
        if (this.checked && list && list.length > 0) {
            let list_filter = [];
            list.forEach(item => {
                if (item.soKyLuat > 0) {
                    list_filter.push(item);
                }
            });
            list = list_filter;
        }
        let table = 'Không có danh sách!';
        if (list && list.length > 0) {
            table = renderTable({
                getDataSource: () => list, stickyHead: false,
                renderHead: () => (
                    <tr>
                        <th style={{ width: 'auto', textAlign: 'right' }}>#</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Cán bộ</th>
                        {!this.checked && <th style={{ width: '50%', whiteSpace: 'nowrap' }}>Nội dung kỷ luật</th> }
                        {!this.checked && <th style={{ width: '50%', whiteSpace: 'nowrap' }}>Hình thức kỷ luật</th> }
                        {this.checked && <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Số lần bị kỷ luật</th> }
                        {this.checked && <th style={{ width: '100%', whiteSpace: 'nowrap' }}>Danh sách hình thức kỷ luật</th> }
                        {!this.checked && <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Cấp quyết định</th> }
                        {!this.checked && <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Điểm thi đua</th> }
                        <th style={{ width: 'auto', textAlign: 'center' }}>Thao tác</th>
                    </tr>
                ),
                renderRow: (item, index) => (
                    <tr key={index}>
                        <TableCell type='text' style={{ textAlign: 'right' }} content={index + 1} />
                        <TableCell type='link' onClick={() => this.modal.show(item, false)} style={{ whiteSpace: 'nowrap' }} content={(
                            <>
                                <span>{(item.hoCanBo ? item.hoCanBo : ' ') + ' ' + (item.tenCanBo ? item.tenCanBo : ' ')}</span><br />
                                {item.maCanBo}
                            </>
                        )}
                        />
                        {!this.checked && <TableCell type='text' content={(
                            <>
                                {item.noiDung ? item.noiDung : ''}
                            </>
                        )}
                        />}
                        {!this.checked && <TableCell type='text' content={(
                            <>
                                <span style={{ whiteSpace: 'nowrap' }}>{item.tenKyLuat}</span><br /> <br/>
                                <span style={{ whiteSpace: 'nowrap' }}>Thời gian bắt đầu: <span style={{ color: 'blue' }}>{item.batDau ? T.dateToText(item.batDau, item.batDauType) : ''}</span></span><br />
                                <span style={{ whiteSpace: 'nowrap' }}>Thời gian kết thúc: <span style={{ color: 'blue' }}>{item.ketThuc ? T.dateToText(item.ketThuc, item.ketThucType) : ''}</span></span>
                            </>
                        )}
                        />}
                        {this.checked && <TableCell type='text' style={{ textAlign: 'left' }} content={item.soKyLuat} />}
                        {this.checked && <TableCell type='text' content={this.list(item.danhSachKyLuat, item.soKyLuat, item.soKyLuat)} /> }
                        {!this.checked && <TableCell type='text' content={(
                            <>
                                {item.capQuyetDinh ? item.capQuyetDinh : ''}
                            </>
                        )}
                        />}
                        {!this.checked && <TableCell type='text' style={{ textAlign: 'right' }} content={item.diemThiDua} />}
                        {
                            !this.checked && <TableCell type='buttons' style={{ textAlign: 'center' }} content={item} permission={permission}
                                onEdit={() => this.modal.show(item, false)} onDelete={this.delete} >
                            </TableCell>
                        }
                        {
                            this.checked && <TableCell type='buttons' style={{ textAlign: 'center' }} content={item} permission={permission}>
                                <Link className='btn btn-success' to={`/user/tccb/qua-trinh/ky-luat/group/${item.maCanBo}`} >
                                    <i className='fa fa-lg fa-compress' />
                                </Link>
                            </TableCell>
                        }
                    </tr>
                )
            });
        }

        return this.renderPage({
            icon: 'fa fa-ban',
            title: 'Quá trình kỷ luật',
            breadcrumb: [
                <Link key={0} to='/user/tccb'>Tổ chức cán bộ</Link>,
                'Quá trình kỷ luật'
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
                    getPage={this.getPage} />
                <EditModal ref={e => this.modal = e} permission={permission}
                    permissions={currentPermissions}
                    create={this.props.createQtKyLuatStaff} update={this.props.updateQtKyLuatStaff}
                />
            </>,
            backRoute: '/user/tccb',
            onCreate: permission && permission.write && !this.checked ? (e) => this.showModal(e) : null,
        });
    }
}

const mapStateToProps = state => ({ system: state.system, qtKyLuat: state.tccb.qtKyLuat });
const mapActionsToProps = {
    getQtKyLuatPage, updateQtKyLuatStaff,
    deleteQtKyLuatStaff, createQtKyLuatStaff, getQtKyLuatGroupPage,
};
export default connect(mapStateToProps, mapActionsToProps)(QtKyLuat);
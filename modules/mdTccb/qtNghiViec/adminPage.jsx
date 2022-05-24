import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { AdminPage, TableCell, renderTable, AdminModal, FormSelect, FormTextBox, FormRichTextBox, FormDatePicker } from 'view/component/AdminPage';
import Pagination from 'view/component/Pagination';
import {
    createQtNghiViecStaff, updateQtNghiViecStaff, deleteQtNghiViecStaff, getQtNghiViecPage,
} from './redux';
import { SelectAdapter_DmDonVi } from 'modules/mdDanhMuc/dmDonVi/redux';
import { SelectAdapter_FwCanBo } from 'modules/mdTccb/tccbCanBo/redux';
import { SelectAdapter_DmNghiViec } from 'modules/mdDanhMuc/dmNghiViec/redux';

export class NghiViecModal extends AdminModal {
    onShow = (item) => {
        let { ma, shcc, lyDoNghi, noiDung, ghiChu, ngayNghi, soQuyetDinh, hoCanBo, hoTen } = item ? item : {
            ma: '', shcc: '', lyDoNghi: null, noiDung: '', ngayNghi: null, soQuyetDinh: ''
        };
        this.setState({ ma, item, shcc, hoCanBo }, () => {
            this.state.ma && (!this.state.shcc || !this.state.hoCanBo) ? this.hoTen.value(hoTen) : this.shcc.value(shcc);
            this.lyDoNghi.value(lyDoNghi);
            this.noiDung.value(noiDung ? noiDung : '');
            this.ghiChu.value(ghiChu ? ghiChu : '');
            this.ngayNghi.value(ngayNghi ? ngayNghi : '');
            this.soQuyetDinh.value(soQuyetDinh ? soQuyetDinh : '');
        });
    }

    onSubmit = (e) => {
        e.preventDefault();
        let listShcc = this.state.ma && (!this.state.shcc || !this.state.hoCanBo) ? null : this.shcc.value();
        const changes = {
            listShcc,
            hoTen: this.state.ma && (!this.state.shcc || !this.state.hoCanBo) ? this.hoTen.value() : this.shcc.data().text,
            lyDoNghi: this.lyDoNghi.value(),
            noiDung: this.noiDung.value(),
            ngayNghi: Number(this.ngayNghi.value()),
            ghiChu: this.ghiChu.value(),
            soQuyetDinh: this.soQuyetDinh.value(),
        };
        if (this.state.shcc && listShcc.length == 0) {
            T.notify('Cán bộ trống', 'danger');
            this.shcc.focus();
        } else if (!this.soQuyetDinh.value()) {
            T.notify('Số quyết định bị trống', 'danger');
            this.soQuyetDinh.focus();
        } else if (!this.ngayNghi.value()) {
            T.notify('Ngày nghỉ bị trống', 'danger');
            this.ngayNghi.focus();
        } else if (!this.lyDoNghi.value()) {
            T.notify('Chưa chọn lý do nghỉ', 'danger');
            this.lyDoNghi.focus();
        } else {
            if (this.state.ma) {
                if (Array.isArray(listShcc) && listShcc.length > 1) {
                    T.notify('Không thể cập nhật cho nhiều cán bộ');
                    this.shcc.focus();
                } else {
                    changes.shcc = this.state.shcc ? changes.listShcc[0] : '';
                    this.props.update(this.state.ma, changes, () => {
                        this.hide();
                        this.props.getStaffPage && this.props.getStaffPage();
                    });
                }
            } else {
                this.props.create(changes, () => {
                    this.hide();
                    this.props.getStaffPage && this.props.getStaffPage();
                });
            }
        }
    }

    render = () => {
        const readOnly = this.state.ma ? true : this.props.readOnly;
        return this.renderModal({
            title: this.state.ma ? 'Cập nhật thông tin nghỉ việc' : 'Tạo mới thông tin nghỉ việc',
            size: 'large',
            body: <div className='row'>
                {readOnly && (!this.state.shcc || !this.state.hoCanBo) ? <FormTextBox className='col-md-12' ref={e => this.hoTen = e} label='Cán bộ' required /> : <FormSelect className='col-md-12' ref={e => this.shcc = e} label='Cán bộ' data={SelectAdapter_FwCanBo} required multiple allowClear />}
                <FormTextBox className='col-md-12' ref={e => this.soQuyetDinh = e} label='Số quyết định' type='text' required />
                <FormDatePicker className='col-md-6' ref={e => this.ngayNghi = e} label='Ngày nghỉ' type='date-mask' required />
                <FormSelect className='col-md-6' ref={e => this.lyDoNghi = e} label='Lý do nghỉ' data={SelectAdapter_DmNghiViec} required />
                <FormRichTextBox className='col-md-12' ref={e => this.noiDung = e} label={'Nội dung'} />
                <FormRichTextBox className='col-md-12' ref={e => this.ghiChu = e} label={'Ghi chú'} />
            </div>,
        });
    }
}

class QtNghiViec extends AdminPage {
    checked = parseInt(T.cookie('hienThiTheoCanBo')) == 1 ? true : false;
    state = { filter: {} };

    componentDidMount() {
        T.clearSearchBox();
        T.ready('/user/tccb', () => {
            T.onSearch = (searchText) => this.getPage(undefined, undefined, searchText || '');
            T.showSearchBox(() => {
                this.fromYear?.value('');
                this.toYear?.value('');
                this.maDonVi?.value('');
                this.mulCanBo?.value('');
            });
            this.changeAdvancedSearch(true);
        });
    }

    showModal = (e) => {
        e.preventDefault();
        this.modal.show();
    }

    changeAdvancedSearch = (isInitial = false, isReset = false) => {
        let { pageNumber, pageSize } = this.props && this.props.qtNghiViec && this.props.qtNghiViec.page ? this.props.qtNghiViec.page : { pageNumber: 1, pageSize: 50 };
        const fromYear = this.fromYear?.value() == '' ? null : this.fromYear?.value().getTime();
        const toYear = this.toYear?.value() == '' ? null : this.toYear?.value().getTime();
        const listDonVi = this.maDonVi?.value().toString() || '';
        const listShcc = this.mulCanBo?.value().toString() || '';
        const listLyDo = this.lyDoNghi.value();
        const filterCookie = T.storage('pageQtNghiViec').F;
        const pageFilter = isInitial ? filterCookie : { listDonVi, fromYear, toYear, listShcc, listLyDo };
        this.setState({ filter: isReset ? {} : pageFilter }, () => {
            this.getPage(pageNumber, pageSize, '', () => {
                if (isInitial) {
                    const filter = this.state.filter || {};
                    this.setState({ filter: !$.isEmptyObject(filter) ? filter : pageFilter });
                    this.fromYear?.value(filter.fromYear || '');
                    this.toYear?.value(filter.toYear || '');
                    this.maDonVi?.value(filter.listDonVi);
                    this.mulCanBo?.value(filter.listShcc);
                    this.lyDoNghi?.value(filter.listLyDo);
                    Object.values(filterCookie).some(item => !item.includes('%') && item && item != '' && item != 0) && this.showAdvanceSearch();
                } else {
                    this.hideAdvanceSearch();
                    if (isReset) {
                        this.fromYear?.value('');
                        this.toYear?.value('');
                        this.maDonVi?.value('');
                        this.mulCanBo?.value('');
                        this.lyDoNghi?.value('');
                    }
                }
            });
        });
    }

    getPage = (pageN, pageS, pageC, done) => {
        this.props.getQtNghiViecPage(pageN, pageS, pageC, this.state.filter, done);
    }

    groupPage = () => {
        this.checked = !this.checked;
        T.cookie('hienThiTheoCanBo', this.checked ? 1 : 0);
        this.getPage();
    }

    list = (text, i, j) => {
        if (!text) return '';
        let danhSach = text.split('??').map(str => <div key={i--}>{j - i}. {str}</div>);
        return danhSach;
    }

    delete = (e, item) => {
        T.confirm('Xóa thông tin nghỉ việc', 'Bạn có chắc bạn muốn xóa thông tin nghỉ việc này?', 'warning', true, isConfirm => {
            isConfirm && this.props.deleteQtNghiViecStaff(item.ma, false, null, error => {
                if (error) T.notify(error.message ? error.message : 'Xoá thông tin nghỉ việc bị lỗi!', 'danger');
                else T.alert('Xoá thông tin nghỉ việc thành công!', 'success', false, 800);
            });
        });
        e.preventDefault();
    }

    render() {
        const currentPermissions = this.props.system && this.props.system.user && this.props.system.user.permissions ? this.props.system.user.permissions : [],
            permission = this.getUserPermission('qtNghiViec', ['read', 'write', 'delete']);
        let { pageNumber, pageSize, pageTotal, totalItem, pageCondition, list } = this.props.qtNghiViec && this.props.qtNghiViec.page ? this.props.qtNghiViec.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, pageCondition: '', list: null };
        let table = renderTable({
            emptyTable: 'Chưa có dữ liệu',
            getDataSource: () => list, stickyHead: true,
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', textAlign: 'right' }}>#</th>
                    <th style={{ width: '20%', whiteSpace: 'nowrap' }}>Cán bộ</th>
                    <th style={{ width: '20%', whiteSpace: 'nowrap' }}>Học vị</th>
                    <th style={{ width: '20%', whiteSpace: 'nowrap' }}>Chức danh nghề nghiệp</th>
                    <th style={{ width: '20%', whiteSpace: 'nowrap' }}>Chức vụ<br />Đơn vị công tác</th>
                    <th style={{ width: '20%', whiteSpace: 'nowrap' }}>Quyết định nghỉ</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Ngày nghỉ</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Nội dung</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Thao tác</th>
                </tr>
            ),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell type='text' style={{ textAlign: 'right' }} content={(pageNumber - 1) * pageSize + index + 1} />
                    <TableCell type='link' onClick={() => this.modal.show(item)} style={{ whiteSpace: 'nowrap' }} content={(
                        <>
                            <span>{item.hoCanBo ? (item.hoCanBo + ' ' + item.tenCanBo)?.normalizedName() : (item.hoTen?.normalizedName() || '')}</span><br />
                            {item.shcc}
                        </>
                    )} />
                    <TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={item.tenHocVi || ''} />
                    <TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={item.tenChucDanhNgheNghiep || ''} />
                    <TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={(
                        <>
                            <span> {item.tenChucVu ? item.tenChucVu + <br /> : ''}</span>
                            {(item.tenDonVi || '').normalizedName()}
                        </>
                    )} />
                    <TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={(
                        <>
                            <span><i>{item.soQuyetDinh}</i></span><br />
                            <span>Lý do: <span style={{ color: 'blue' }}>{item.tenLyDo || ''}</span></span>
                        </>
                    )}
                    />
                    <TableCell type='text' content={(<span>{item.ngayNghi ? T.dateToText(item.ngayNghi, 'dd/mm/yyyy') : ''}</span>)} />
                    <TableCell type='text' contentClassName='multiple-lines-4' content={(
                        <>
                            <span><i>{item.noiDung}</i></span><br />
                            {item.ghiChu ? '(' + item.ghiChu + ')' : null}
                        </>
                    )}
                    />
                    <TableCell type='buttons' style={{ textAlign: 'center' }} content={item} permission={permission}
                        onEdit={() => this.modal.show(item)} onDelete={this.delete} >
                    </TableCell>


                </tr>
            )
        });

        return this.renderPage({
            icon: 'fa fa-user-times',
            title: 'Cán bộ Nghỉ việc',
            breadcrumb: [
                <Link key={0} to='/user/tccb'>Tổ chức cán bộ</Link>,
                'Cán bộ Nghỉ việc'
            ],
            advanceSearch: <>
                <div className='row'>
                    <FormDatePicker type='date-mask' ref={e => this.fromYear = e} className='col-12 col-md-6' label='Từ thời gian' />
                    <FormDatePicker type='date-mask' ref={e => this.toYear = e} className='col-12 col-md-6' label='Đến thời gian' />
                    <FormSelect className='col-12 col-md-6' multiple={true} ref={e => this.maDonVi = e} label='Đơn vị' data={SelectAdapter_DmDonVi} allowClear={true} minimumResultsForSearch={-1} />
                    <FormSelect className='col-md-6' ref={e => this.lyDoNghi = e} label='Lý do nghỉ' data={SelectAdapter_DmNghiViec} allowClear={true} />
                    <FormSelect className='col-12 col-md-12' multiple={true} ref={e => this.mulCanBo = e} label='Cán bộ' data={SelectAdapter_FwCanBo} allowClear={true} minimumResultsForSearch={-1} />
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
                    {table}
                </div>
                <Pagination style={{ marginLeft: '70px' }} {...{ pageNumber, pageSize, pageTotal, totalItem, pageCondition }}
                    getPage={this.getPage} />
                <NghiViecModal ref={e => this.modal = e} permission={permission}
                    permissions={currentPermissions}
                    create={this.props.createQtNghiViecStaff} update={this.props.updateQtNghiViecStaff}
                />
            </>,
            backRoute: '/user/tccb',
            onImport: !this.checked ? (e) => e.preventDefault() || this.props.history.push('/user/tccb/qua-trinh/nghi-viec/create-list') : '',
            onCreate: (e) => this.showModal(e),
            onExport: (e) => {
                e.preventDefault();
                let filter = T.stringify(this.state.filter);
                if (filter.includes('%')) filter = '{}';

                T.download(T.url(`/api/qua-trinh/nghi-viec/download-excel/${filter}`), 'NGHIVIEC.xlsx');
            }
        });
    }
}

const mapStateToProps = state => ({ system: state.system, qtNghiViec: state.tccb.qtNghiViec });
const mapActionsToProps = {
    createQtNghiViecStaff, updateQtNghiViecStaff, deleteQtNghiViecStaff, getQtNghiViecPage,
};
export default connect(mapStateToProps, mapActionsToProps)(QtNghiViec);
import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { AdminPage, TableCell, renderTable, AdminModal, FormSelect, FormTextBox, FormDatePicker, FormRichTextBox } from 'view/component/AdminPage';
import Pagination from 'view/component/Pagination';
import {
    createQtKyLuatGroupPageMa, getQtKyLuatGroupPageMa, deleteQtKyLuatGroupPageMa,
    updateQtKyLuatGroupPageMa,
} from './redux';
import { SelectAdapter_FwCanBo } from 'modules/mdTccb/tccbCanBo/redux';
import { SelectAdapter_DmKyLuatV2 } from 'modules/mdDanhMuc/dmKhenThuongKyLuat/reduxKyLuat';

class EditModal extends AdminModal {
    state = {
        id: '',
        batDau: '',
        ketThuc: '',
        batDauType: 'dd/mm/yyyy',
        ketThucType: 'dd/mm/yyyy',
    };

    onShow = (item) => {
        let { id, maCanBo, lyDoHinhThuc, diemThiDua, noiDung, soQuyetDinh, ngayRaQuyetDinh} = item ? item : {
            id: '', maCanBo: '', lyDoHinhThuc: '', diemThiDua: '', noiDung: '', soQuyetDinh: '', ngayRaQuyetDinh: ''
        };

        this.setState({
            id,
        }, () => {
            this.maCanBo.value(maCanBo ? maCanBo : this.props.maCanBo);
            this.hinhThucKyLuat.value(lyDoHinhThuc);
            this.diemThiDua.value(diemThiDua || '');
            this.noiDung.value(noiDung || '');
            this.soQuyetDinh.value(soQuyetDinh || '');
            this.ngayRaQuyetDinh.value(ngayRaQuyetDinh || '');
        });
    };

    onSubmit = (e) => {
        e.preventDefault();
        const changes = {
            shcc: this.maCanBo.value(),
            lyDoHinhThuc: this.hinhThucKyLuat.value(),
            diemThiDua: this.diemThiDua.value(),
            noiDung: this.noiDung.value(),
            soQuyetDinh: this.soQuyetDinh.value(),
            ngayRaQuyetDinh: Number(this.ngayRaQuyetDinh.value()),
        };
        if (!this.soQuyetDinh.value()) {
            T.notify('Số quyết định trống', 'danger');
            this.soQuyetDinh.focus();
        } else if (!this.ngayRaQuyetDinh.value()) {
            T.notify('Ngày ra quyết định trống', 'danger');
            this.ngayRaQuyetDinh.focus();
        } else if (!this.hinhThucKyLuat.value()) {
            T.notify('Hình thức kỷ luật trống', 'danger');
            this.hinhThucKyLuat.focus();
        } else {
            this.state.id ? this.props.update(this.state.id, changes, this.hide) : this.props.create(changes, this.hide);
        }
    }

    render = () => {
        const readOnly = this.props.readOnly;
        return this.renderModal({
            title: this.state.id ? 'Cập nhật quá trình kỷ luật' : 'Tạo mới quá trình kỷ luật',
            size: 'large',
            body: <div className='row'>
                <FormSelect className='col-md-12' multiple={this.multiple} ref={e => this.maCanBo = e} label='Cán bộ' data={SelectAdapter_FwCanBo} readOnly={true} required />

                <FormTextBox className='col-md-4' ref={e => this.soQuyetDinh = e} type='text' label='Số quyết định' readOnly={readOnly} required />
                <FormDatePicker className='col-md-4' type='date-mask'  ref={e => this.ngayRaQuyetDinh = e} label='Ngày ra quyết định' readOnly={readOnly} required />
                <FormSelect className='col-md-4' ref={e => this.hinhThucKyLuat = e} label='Hình thức kỷ luật' data={SelectAdapter_DmKyLuatV2} readOnly={readOnly} required />

                <FormRichTextBox className='col-md-12' ref={e => this.noiDung = e} rows={10} readOnly={readOnly} label='Nội dung kỷ luật' placeholder='Nhập nội dung kỷ luật (tối đa 1000 ký tự)' />

                <FormTextBox className='col-md-4' ref={e => this.diemThiDua = e} type='number' label='Điểm thi đua' readOnly={readOnly} />
            </div>
        });
    }
}
class QtKyLuatGroupPage extends AdminPage {
    state = { filter: {} };
    componentDidMount() {
        T.ready('/user/tccb', () => {
            T.clearSearchBox();
            const route = T.routeMatcher('/user/tccb/qua-trinh/ky-luat/group/:shcc'),
                params = route.parse(window.location.pathname);
            this.shcc = params.shcc;
            this.setState({ filter: { listShcc: params.shcc, listDv: ''} });
            T.onSearch = (searchText) => this.getPage(undefined, undefined, searchText || '');

            T.showSearchBox(() => {
                let filterCookie = T.getCookiePage('groupPageMaQtKyLuat', 'F'), {
                    fromYear = '', toYear = '', listHinhThucKyLuat = ''
                } = filterCookie;
                this.fromYear.value(fromYear);
                this.toYear.value(toYear);
                this.hinhThucKyLuat.value(listHinhThucKyLuat);
                setTimeout(() => this.changeAdvancedSearch(), 50);
            });
            this.getPage();
        });
    }

    changeAdvancedSearch = (isInitial = false, isReset = false) => {
        let { pageNumber, pageSize, pageCondition } = this.props && this.props.qtKyLuat && this.props.qtKyLuat.pageMa ? this.props.qtKyLuat.pageMa : { pageNumber: 1, pageSize: 50, pageCondition: {} };

        if (pageCondition && (typeof pageCondition == 'string')) T.setTextSearchBox(pageCondition);

        let fromYear = null;
        if (this.fromYear.value()) {
            fromYear = this.fromYear.value();
            fromYear.setHours(0, 0, 0, 0);
            fromYear = fromYear.getTime();
        }
        let toYear = null;
        if (this.toYear.value()) {
            toYear = this.toYear.value();
            toYear.setHours(23, 59, 59, 999);
            toYear = toYear.getTime();
        }
        const listDv = this.state.filter.listDv;
        const listShcc = this.state.filter.listShcc;
        const listHinhThucKyLuat = this.hinhThucKyLuat.value().toString() || '';
        const pageFilter = (isInitial || isReset) ? { listShcc, listDv } : { listDv, fromYear, toYear, listShcc, listHinhThucKyLuat };
        this.setState({ filter: pageFilter }, () => {
            this.getPage(pageNumber, pageSize, pageCondition, (page) => {
                if (isInitial) {
                    const filter = page.filter || { listShcc, listDv };
                    const filterCookie = T.getCookiePage('groupPageMaQtKyLuat', 'F');
                    this.setState({ filter: !$.isEmptyObject(filter) ? filter : pageFilter });

                    this.fromYear.value(filter.fromYear || filterCookie.fromYear || '');
                    this.toYear.value(filter.toYear || filterCookie.toYear || '');
                    this.hinhThucKyLuat.value(filter.listHinhThucKyLuat || filterCookie.listHinhThucKyLuat || '');
                    if (this.fromYear.value() || this.toYear.value() || this.listHinhThucKyLuat.value()) this.showAdvanceSearch();
                } else if (isReset) {
                    this.fromYear.value('');
                    this.toYear.value('');
                    this.hinhThucKyLuat.value('');
                }
            });
        });
    }

    getPage = (pageN, pageS, pageC, done) => {
        this.props.getQtKyLuatGroupPageMa(pageN, pageS, pageC, this.state.filter, done);
    }

    showModal = (e) => {
        e.preventDefault();
        this.modal.show();
    }

    delete = (e, item) => {
        T.confirm('Xóa kỷ luật', 'Bạn có chắc bạn muốn xóa kỷ luật này?', 'warning', true, isConfirm => {
            isConfirm && this.props.deleteQtKyLuatGroupPageMa(item.id, error => {
                if (error) T.notify(error.message ? error.message : 'Xoá kỷ luật bị lỗi!', 'danger');
                else T.alert('Xoá kỷ luật thành công!', 'success', false, 800);
            });
        });
        e.preventDefault();
    }

    render() {
        const currentPermissions = this.props.system && this.props.system.user && this.props.system.user.permissions ? this.props.system.user.permissions : [],
            permission = this.getUserPermission('qtKyLuat', ['read', 'write', 'delete']);
        let { pageNumber, pageSize, pageTotal, totalItem, pageCondition, list } = this.props.qtKyLuat && this.props.qtKyLuat.pageMa ? this.props.qtKyLuat.pageMa : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, pageCondition: {}, list: [] };
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
                        <th style={{ width: '50%', whiteSpace: 'nowrap' }}>Hình thức kỷ luật</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Nội dung kỷ luật</th>
                        <th style={{ width: '50%', whiteSpace: 'nowrap' }}>Số quyết định</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Ngày ra quyết định</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Điểm thi đua</th>
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
                        <TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={item.tenChucDanhNgheNghiep || ''} />
                        <TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={(
                            <>
                                <span> {item.tenChucVu || ''}<br /> </span>
                                {(item.tenDonVi || '').normalizedName()}
                            </>
                        )} />
                        <TableCell type='text' style={{ color: 'red' }} content={(<span><b>{item.tenKyLuat || ''}</b></span>)} />
                        <TableCell type='text' contentClassName='multiple-lines-5' content={(item.noiDung || '')} />
                        <TableCell type='text' content={(<b> {item.soQuyetDinh || ''} </b>)} />
                        <TableCell type='date' style={{color: 'blue'}} dateFormat='dd/mm/yyyy' content={item.ngayRaQuyetDinh} />
                        <TableCell type='text' style={{ textAlign: 'right' }} content={item.diemThiDua} />
                        <TableCell type='buttons' style={{ textAlign: 'center' }} content={item} permission={permission}
                            onEdit={() => this.modal.show(item)} onDelete={this.delete} >
                        </TableCell>
                    </tr>
                )
            });
        }

        return this.renderPage({
            icon: 'fa fa-list-alt',
            title: 'Quá trình kỷ luật - Cán bộ',
            breadcrumb: [
                <Link key={0} to='/user/tccb'>Tổ chức cán bộ</Link>,
                <Link key={0} to='/user/tccb/qua-trinh/ky-luat'>Quá trình kỷ luật</Link>,
                'Quá trình kỷ luật - Cán bộ'
            ],
            advanceSearch: <>
                <div className='row'>
                    <FormDatePicker type='date-mask' ref={e => this.fromYear = e} className='col-12 col-md-3' label='Từ thời gian' />
                    <FormDatePicker type='date-mask' ref={e => this.toYear = e} className='col-12 col-md-3' label='Đến thời gian' />
                    <FormSelect className='col-12 col-md-6' multiple={true} ref={e => this.hinhThucKyLuat = e} label='Hình thức kỷ luật' data={SelectAdapter_DmKyLuatV2} allowClear={true} minimumResultsForSearch={-1} />
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
                <div className='tile'>
                    <h3 className='tile-title'>
                        Thống kê
                    </h3>
                    <b>{'Số lượng: ' + totalItem.toString()}</b>
                </div>
                <div className='tile'>
                    {table}
                </div>
                <Pagination style={{ marginLeft: '70px' }} {...{ pageNumber, pageSize, pageTotal, totalItem, pageCondition }}
                    getPage={this.getPage} />
                <EditModal ref={e => this.modal = e} permission={permission}
                    permissions={currentPermissions} maCanBo={this.shcc}
                    create={this.props.createQtKyLuatGroupPageMa} update={this.props.updateQtKyLuatGroupPageMa}
                />
            </>,
            backRoute: '/user/tccb/qua-trinh/ky-luat/',
            onCreate: permission && permission.write ? (e) => this.showModal(e) : null,
            onExport: (e) => {
                e.preventDefault();
                const filter = T.stringify(this.state.filter);

                T.download(T.url(`/api/qua-trinh/ky-luat/download-excel/${filter}`), 'kyluat.xlsx');
            }
        });
    }
}

const mapStateToProps = state => ({ system: state.system, qtKyLuat: state.tccb.qtKyLuat });
const mapActionsToProps = {
    createQtKyLuatGroupPageMa, getQtKyLuatGroupPageMa, deleteQtKyLuatGroupPageMa,
    updateQtKyLuatGroupPageMa,
};
export default connect(mapStateToProps, mapActionsToProps)(QtKyLuatGroupPage);
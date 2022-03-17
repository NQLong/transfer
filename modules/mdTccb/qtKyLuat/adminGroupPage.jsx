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
        let { id, maCanBo, lyDoHinhThuc, capQuyetDinh, diemThiDua, noiDung, soQuyetDinh, ngayRaQuyetDinh} = item ? item : {
            id: '', maCanBo: '', lyDoHinhThuc: '', capQuyetDinh: '', diemThiDua: '', noiDung: '', soQuyetDinh: '', ngayRaQuyetDinh: ''
        };

        this.setState({
            id,
        }, () => {
            this.maCanBo.value(maCanBo ? maCanBo : this.props.maCanBo);
            this.hinhThucKyLuat.value(lyDoHinhThuc);
            this.capQuyetDinh.value(capQuyetDinh || '');
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
            capQuyetDinh: this.capQuyetDinh.value(),
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

                <FormRichTextBox className='col-md-12' ref={e => this.noiDung = e} rows={2} readOnly={readOnly} label='Nội dung kỷ luật' placeholder='Nhập nội dung kỷ luật (tối đa 100 ký tự)' maxLength={100} />

                <FormTextBox className='col-md-12' ref={e => this.capQuyetDinh = e} type='text' label='Cấp quyết định' readOnly={readOnly} />

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
                this.fromYear.value('');
                this.toYear.value('');
                setTimeout(() => this.changeAdvancedSearch(), 50);
            });
            this.getPage();
        });
    }

    changeAdvancedSearch = (isInitial = false) => {
        let { pageNumber, pageSize } = this.props && this.props.qtKyLuat && this.props.qtKyLuat.pageMa ? this.props.qtKyLuat.pageMa : { pageNumber: 1, pageSize: 50 };
        const fromYear = this.fromYear.value() == '' ? null : this.fromYear.value().getTime();
        const toYear = this.toYear.value() == '' ? null : this.toYear.value().getTime();
        const listDv = this.state.filter.listDv;
        const listShcc = this.state.filter.listShcc;
        const pageFilter = isInitial ? null : { listDv, fromYear, toYear, listShcc };
        this.setState({ filter: pageFilter }, () => {
            this.getPage(pageNumber, pageSize, (page) => {
                if (isInitial) {
                    const filter = page.filter || {};
                    this.setState({ filter: !$.isEmptyObject(filter) ? filter : pageFilter });
                    this.fromYear.value(filter.fromYear || '');
                    this.toYear.value(filter.toYear || '');
                    if (!$.isEmptyObject(filter) && filter && (filter.fromYear || filter.toYear)) this.showAdvanceSearch();
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
                        <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Số quyết định</th>
                        <th style={{ width: '50%', whiteSpace: 'nowrap' }}>Nội dung kỷ luật</th>
                        <th style={{ width: '50%', whiteSpace: 'nowrap' }}>Hình thức kỷ luật</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Cấp quyết định</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Điểm thi đua</th>
                        <th style={{ width: 'auto', textAlign: 'center' }}>Thao tác</th>
                    </tr>
                ),
                renderRow: (item, index) => (
                    <tr key={index}>
                        <TableCell type='text' style={{ textAlign: 'right' }} content={(pageNumber - 1) * pageSize + index + 1} />
                        <TableCell type='link' onClick={() => this.modal.show(item)} style={{ whiteSpace: 'nowrap' }} content={(
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
                        <TableCell type='text' content={(
                            <>
                                <b> {item.soQuyetDinh ? item.soQuyetDinh : ''} </b> <br/>
                                {item.ngayRaQuyetDinh ? <span style={{ whiteSpace: 'nowrap' }}>Ngày ra quyết định: <span style={{ color: 'blue' }}>{item.ngayRaQuyetDinh ? T.dateToText(item.ngayRaQuyetDinh, 'dd/mm/yyyy') : ''}</span><br /></span> : null}
                            </>
                        )}
                        />
                        <TableCell type='text' content={(
                            <>
                                {item.noiDung ? item.noiDung : ''}
                            </>
                        )}
                        />
                        <TableCell type='text' style={{ color: 'red' }} content={(
                            <>
                                <span><b>{item.tenKyLuat ? item.tenKyLuat : ''}</b></span>
                            </>
                        )}
                        />
                        <TableCell type='text' content={(
                            <>
                                {item.capQuyetDinh ? item.capQuyetDinh : ''}
                            </>
                        )}
                        />
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
                    <FormDatePicker type='month-mask' ref={e => this.fromYear = e} className='col-12 col-md-4' label='Từ thời gian' onChange={() => this.changeAdvancedSearch()} />
                    <FormDatePicker type='month-mask' ref={e => this.toYear = e} className='col-12 col-md-4' label='Đến thời gian' onChange={() => this.changeAdvancedSearch()} />
                </div>
            </>,
            content: <>
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
                const { fromYear, toYear, listShcc, listDv } = (this.state.filter && this.state.filter != '%%%%%%%%') ? this.state.filter : { fromYear: null, toYear: null, listShcc: null, listDv: null };

                T.download(T.url(`/api/qua-trinh/ky-luat/download-excel/${listShcc ? listShcc : null}/${listDv ? listDv : null}/${fromYear ? fromYear : null}/${toYear ? toYear : null}`), 'kyluat.xlsx');
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
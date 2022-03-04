import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { AdminPage, TableCell, renderTable, AdminModal, FormSelect, FormTextBox, FormCheckbox, FormRichTextBox, FormDatePicker } from 'view/component/AdminPage';
import Pagination from 'view/component/Pagination';
import {
    createQtNghiViecStaff, updateQtNghiViecStaff, deleteQtNghiViecStaff,
    getQtNghiViecGroupPage, getQtNghiViecPage,
} from './redux';
import { SelectAdapter_DmDonVi } from 'modules/mdDanhMuc/dmDonVi/redux';
import { SelectAdapter_FwCanBo } from 'modules/mdTccb/tccbCanBo/redux';

class EditModal extends AdminModal {
    state = {
        ma: null,
    }

    componentDidMount() {
    }
    multiple = false;
    onShow = (item, multiple = true) => {
        this.multiple = multiple;
        let { ma, shcc, dienNghi, noiDung, ghiChu, ngayNghi, soQuyetDinh } = item ? item : {
            ma: '', shcc: '', dienNghi: null, noiDung: '', ngayNghi: null, soQuyetDinh: ''
        };
        this.setState({ ma, item });
        setTimeout(() => {
            this.shcc.value(shcc);
            this.dienNghi.value(dienNghi);
            this.noiDung.value(noiDung ? noiDung : '');
            this.ghiChu.value(ghiChu ? ghiChu : '');
            this.ngayNghi.value(ngayNghi ? ngayNghi : '');
            this.soQuyetDinh.value(soQuyetDinh ? soQuyetDinh : '');
        }, 500);
    }

    onSubmit = (e) => {
        e.preventDefault();
        let list_ma = this.shcc.value();
        if (!Array.isArray(list_ma)) {
            list_ma = [list_ma];
        }
        if (list_ma.length == 0) {
            T.notify('Danh sách cán bộ trống', 'danger');
            this.shcc.focus();
        } else if (!this.soQuyetDinh.value()) {
            T.notify('Số quyết định bị trống', 'danger');
            this.soQuyetDinh.focus();
        } else if (!this.ngayNghi.value()) {
            T.notify('Ngày nghỉ bị trống', 'danger');
            this.ngayNghi.focus();
        } else if (!this.dienNghi.value()) {
            T.notify('Chưa chọn diện nghỉ', 'danger');
            this.dienNghi.focus();
        } else {
            list_ma.forEach((ma, index) => {
                const changes = {
                    shcc: ma,
                    dienNghi: this.dienNghi.value(),
                    noiDung: this.noiDung.value(),
                    ngayNghi: Number(this.ngayNghi.value()),
                    ghiChu: this.ghiChu.value(),
                    soQuyetDinh: this.soQuyetDinh.value(),
                };
                if (index == list_ma.length - 1) {
                    this.state.ma ? this.props.update(this.state.ma, changes, this.hide, false) : this.props.create(changes, this.hide, false);
                    this.setState({
                        ma: ''
                    });
                    this.shcc.reset();
                }
                else {
                    this.state.ma ? this.props.update(this.state.ma, changes, null, false) : this.props.create(changes, null, false);
                }
            });
        }
    }

    render = () => {
        const readOnly = this.state.ma ? true : this.props.readOnly;
        return this.renderModal({
            title: this.state.ma ? 'Cập nhật thông tin nghỉ việc' : 'Tạo mới thông tin nghỉ việc',
            size: 'large',
            body: <div className='row'>
                <FormSelect className='col-md-12' ref={e => this.shcc = e} label='Cán bộ' data={SelectAdapter_FwCanBo} readOnly={readOnly} required />
                <FormTextBox className='col-md-12' ref={e => this.soQuyetDinh = e} label='Số quyết định' type='text' required />
                <FormDatePicker className='col-md-6' ref={e => this.ngayNghi = e} label='Ngày nghỉ' type='date-mask' required />
                <FormSelect className='col-md-6' ref={e => this.dienNghi = e} label={'Diện nghỉ'} data={[{ id: 1, text: 'Biên chế' }, { id: 2, text: 'Hợp đồng' }]} required />
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
                this.props.getQtNghiViecGroupPage();
            } else {
                this.props.getQtNghiViecPage();
            }
            this.changeAdvancedSearch(true);
        });
    }

    showModal = (e) => {
        e.preventDefault();
        this.modal.show();
    }

    changeAdvancedSearch = (isInitial = false) => {
        let { pageNumber, pageSize } = this.props && this.props.qtNghiViec && this.props.qtNghiViec.page ? this.props.qtNghiViec.page : { pageNumber: 1, pageSize: 50 };
        const fromYear = this.fromYear?.value() == '' ? null : this.fromYear?.value().getTime();
        const toYear = this.toYear?.value() == '' ? null : this.toYear?.value().getTime();
        const list_dv = this.maDonVi?.value().toString() || '';
        const list_shcc = this.mulCanBo?.value().toString() || '';
        const dienNghi = this.dienNghi.value();
        const pageFilter = isInitial ? null : { list_dv, fromYear, toYear, list_shcc, dienNghi };
        this.setState({ filter: pageFilter }, () => {
            this.getPage(pageNumber, pageSize, '', (page) => {
                if (isInitial) {
                    const filter = page.filter || {};
                    this.setState({ filter: !$.isEmptyObject(filter) ? filter : pageFilter });
                    this.fromYear?.value(filter.fromYear || '');
                    this.toYear?.value(filter.toYear || '');
                    this.maDonVi?.value(filter.list_dv);
                    this.mulCanBo?.value(filter.list_shcc);
                    this.dienNghi?.value(filter.dienNghi);
                    if (!$.isEmptyObject(filter) && filter && (filter.fromYear || filter.toYear || filter.list_shcc || filter.list_dv || filter.dienNghi)) this.showAdvanceSearch();
                }
            });
        });
    }

    getPage = (pageN, pageS, pageC, done) => {
        if (this.checked) this.props.getQtNghiViecGroupPage(pageN, pageS, pageC, this.state.filter, done);
        else this.props.getQtNghiViecPage(pageN, pageS, pageC, this.state.filter, done);
    }

    groupPage = () => {
        this.checked = !this.checked;
        T.cookie('hienThiTheoCanBo', this.checked ? 1 : 0);
        this.getPage();
    }

    list = (text, i, j) => {
        if (!text) return '';
        let danhSach = text.split('??').map(str => <p key={i--} style={{ textTransform: 'uppercase' }}>{j - i}. {str}</p>);
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
        let { pageNumber, pageSize, pageTotal, totalItem, pageCondition, list } = this.checked ? (
            this.props.qtNghiViec && this.props.qtNghiViec.page_gr ?
                this.props.qtNghiViec.page_gr : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, list })
            : (this.props.qtNghiViec && this.props.qtNghiViec.page ? this.props.qtNghiViec.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, pageCondition: {}, list: [] });
        let table = 'Không có danh sách!';
        if (list && list.length > 0) {
            table = renderTable({
                getDataSource: () => list, stickyHead: false,
                renderHead: () => (
                    <tr>
                        <th style={{ width: 'auto', textAlign: 'right' }}>#</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Cán bộ</th>
                        {!this.checked && <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Quyết định nghỉ</th>}
                        {!this.checked && <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Ngày nghỉ</th>}
                        {!this.checked && <th style={{ width: '100%', whiteSpace: 'nowrap' }}>Nội dung</th>}
                        {this.checked && <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Số lần nghỉ</th>}
                        {this.checked && <th style={{ width: '100%', whiteSpace: 'nowrap' }}>Danh sách nội dung nghỉ</th>}
                        <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Thao tác</th>
                    </tr>
                ),
                renderRow: (item, index) => (
                    <tr key={index}>
                        <TableCell type='text' style={{ textAlign: 'right' }} content={(pageNumber - 1) * pageSize + index + 1} />
                        <TableCell type='link' onClick={() => this.modal.show(item)} style={{ whiteSpace: 'nowrap' }} content={(
                            item.shcc ?
                                <>
                                    <span>{(item.hoCanBo ? item.hoCanBo : ' ') + ' ' + (item.tenCanBo ? item.tenCanBo : ' ')}</span><br />
                                    {item.shcc}
                                </> :
                                <span>{item.hoTen ? item.hoTen : ''}</span>
                        )}
                        />
                        {!this.checked && <TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={(
                            <>
                                <span><i>{item.soQuyetDinh}</i></span><br />
                                <span>Diện nghỉ: <span style={{ color: 'blue' }}>{item.dienNghi == 1 ? 'Biên chế' : 'Hợp đồng'}</span></span>
                            </>
                        )}
                        />}
                        {!this.checked && <TableCell type='text' content={(
                            <>
                                <span>{item.ngayNghi ? T.dateToText(item.ngayNghi, 'dd/mm/yyyy') : ''}</span>
                            </>
                        )}
                        />}
                        {!this.checked && <TableCell type='text' content={(
                            <>
                                <span><i>{item.noiDung}</i></span><br />
                                {item.ghiChu ? '(' + item.ghiChu + ')' : null}
                            </>
                        )}
                        />}
                        {this.checked && <TableCell type='text' content={item.soLanNghi} />}
                        {this.checked && <TableCell type='text' content={this.list(item.danhSachNghiViec, item.soLanNghi, item.soLanNghi)} />}
                        {
                            !this.checked && <TableCell type='buttons' style={{ textAlign: 'center' }} content={item} permission={permission}
                                onEdit={() => this.modal.show(item)} onDelete={this.delete} >
                            </TableCell>
                        }
                        {
                            this.checked && <TableCell type='buttons' style={{ textAlign: 'center' }} content={item} permission={permission}>
                                <Link className='btn btn-success' to={`/user/tccb/qua-trinh/nghi-viec/group/${item.shcc}`} >
                                    <i className='fa fa-lg fa-compress' />
                                </Link>
                            </TableCell>
                        }
                    </tr>
                )
            });
        }

        return this.renderPage({
            icon: 'fa fa-user-times',
            title: 'Cán bộ Nghỉ việc',
            breadcrumb: [
                <Link key={0} to='/user/tccb'>Tổ chức cán bộ</Link>,
                'Cán bộ Nghỉ việc'
            ],
            advanceSearch: <>
                <div className='row'>
                    <FormDatePicker type='month-mask' ref={e => this.fromYear = e} className='col-12 col-md-6' label='Từ thời gian' onChange={() => this.changeAdvancedSearch()} />
                    <FormDatePicker type='month-mask' ref={e => this.toYear = e} className='col-12 col-md-6' label='Đến thời gian' onChange={() => this.changeAdvancedSearch()} />
                    <FormSelect className='col-12 col-md-6' multiple={true} ref={e => this.maDonVi = e} label='Đơn vị' data={SelectAdapter_DmDonVi} onChange={() => this.changeAdvancedSearch()} allowClear={true} minimumResultsForSearch={-1} />
                    <FormSelect className='col-md-6' ref={e => this.dienNghi = e} label={'Diện nghỉ'} data={[{ id: 1, text: 'Biên chế' }, { id: 2, text: 'Hợp đồng' }]} onChange={() => this.changeAdvancedSearch()} allowClear={true} />
                    <FormSelect className='col-12 col-md-12' multiple={true} ref={e => this.mulCanBo = e} label='Cán bộ' data={SelectAdapter_FwCanBo} onChange={() => this.changeAdvancedSearch()} allowClear={true} minimumResultsForSearch={-1} />
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
                    create={this.props.createQtNghiViecStaff} update={this.props.updateQtNghiViecStaff}
                />
            </>,
            backRoute: '/user/tccb',
            onCreate: permission && permission.write && !this.checked ? (e) => this.showModal(e) : null,
        });
    }
}

const mapStateToProps = state => ({ system: state.system, qtNghiViec: state.tccb.qtNghiViec });
const mapActionsToProps = {
    createQtNghiViecStaff, updateQtNghiViecStaff, deleteQtNghiViecStaff,
    getQtNghiViecGroupPage, getQtNghiViecPage,
};
export default connect(mapStateToProps, mapActionsToProps)(QtNghiViec);
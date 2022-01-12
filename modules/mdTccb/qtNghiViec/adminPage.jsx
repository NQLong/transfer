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

    onShow = (item) => {
        let { ma, shcc, dienNghi, noiDung, ghiChu, ngayNghi, soQuyetDinh } = item ? item : {
            ma: null, shcc: '', dienNghi: null, noiDung: '', ngayNghi: null, soQuyetDinh: ''
        };
        this.setState({ ma });
        setTimeout(() => {
            this.maCanBo.value(shcc);
            this.dienNghi.value(dienNghi);
            this.noiDung.value(noiDung ? noiDung : '');
            this.ghiChu.value(ghiChu ? ghiChu : '');
            this.ngayNghi.value(ngayNghi ? ngayNghi : '');
            this.soQuyetDinh.value(soQuyetDinh ? soQuyetDinh : '');
        }, 500);
    }

    onSubmit = () => {
        const changes = {
            shcc: this.maCanBo.value(),
            dienNghi: this.dienNghi.value(),
            noiDung: this.noiDung.value(),
            ngayNghi: Number(this.ngayNghi.value()),
            ghiChu: this.ghiChu.value(),
            soQuyetDinh: this.soQuyetDinh.value()
        };
        if (!changes.shcc) {
            T.notify('Chưa chọn cán bộ', 'danger');
            this.maCanBo.focus();
        } else if (!changes.dienNghi) {
            T.notify('Chưa chọn diện nghỉ', 'danger');
            this.dienNghi.focus();
        } else if (!changes.soQuyetDinh) {
            T.notify('Số quyết định bị trống', 'danger');
            this.soQuyetDinh.focus();
        } else if (!changes.ngayNghi) {
            T.notify('Ngày nghỉ bị trống', 'danger');
            this.ngayNghi.focus();
        }
        else {
            this.state.ma ? this.props.update(this.state.ma, changes, this.hide, false) : this.props.create(changes, this.hide, false);
        }
    }

    render = () => {
        const readOnly = this.state.ma ? true : this.props.readOnly;
        return this.renderModal({
            title: this.state.ma ? 'Cập nhật thông tin nghỉ việc' : 'Tạo mới thông tin nghỉ việc',
            size: 'large',
            body: <div className='row'>
                <FormSelect className='col-md-12' ref={e => this.maCanBo = e} label='Cán bộ' data={SelectAdapter_FwCanBo} readOnly={readOnly} required />
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
    checked = false;
    curState = [];
    searchText = '';
    componentDidMount() {
        T.ready('/user/tccb', () => {
            T.onSearch = (searchText) => {
                this.searchText = searchText;
                if (this.checked) this.props.getQtNghiViecGroupPage(undefined, undefined, this.curState, this.searchText || '');
                else this.props.getQtNghiViecPage(undefined, undefined, this.curState, this.searchText || '');
            };
            T.showSearchBox(() => {
                this.loaiDoiTuong?.value('');
                setTimeout(() => this.changeAdvancedSearch(), 50);
                setTimeout(() => this.showAdvanceSearch(), 1000);
            });
            this.changeAdvancedSearch();
        });
    }

    showModal = (e) => {
        e.preventDefault();
        this.modal.show();
    }

    changeAdvancedSearch = () => {
        let { pageNumber, pageSize } = this.props && this.props.qtNghiViec && this.props.qtNghiViec.page ? this.props.qtNghiViec.page : { pageNumber: 1, pageSize: 50 };
        const loaiDoiTuong = this.loaiDoiTuong?.value() || [];
        this.curState = loaiDoiTuong;
        if (this.checked) this.props.getQtNghiViecGroupPage(pageNumber, pageSize, this.curState, this.searchText || '');
        else this.props.getQtNghiViecPage(pageNumber, pageSize, this.curState, this.searchText || '');
    }

    groupPage = () => {
        let { pageNumber, pageSize } = this.props && this.props.qtNghiViec && this.props.qtNghiViec.page ? this.props.qtNghiViec.page : { pageNumber: 1, pageSize: 50 };
        this.checked = !this.checked;
        if (this.checked) this.props.getQtNghiViecGroupPage(pageNumber, pageSize, this.curState, this.searchText || '');
        else this.props.getQtNghiViecPage(pageNumber, pageSize, this.curState, this.searchText || '');
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
                        <th style={{ width: '50%', whiteSpace: 'nowrap' }}>Cán bộ</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Quyết định nghỉ</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Ngày nghỉ</th>
                        <th style={{ width: '50%', whiteSpace: 'nowrap' }}>Nội dung</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Thao tác</th>
                    </tr>
                ),
                renderRow: (item, index) => (
                    <tr key={index}>
                        <TableCell type='text' style={{ textAlign: 'right' }} content={index + 1} />
                        <TableCell type='link' onClick={() => this.modal.show(item)} style={{ whiteSpace: 'nowrap' }} content={(
                            item.shcc ?
                                <>
                                    <span>{(item.hoCanBo ? item.hoCanBo : ' ') + ' ' + (item.tenCanBo ? item.tenCanBo : ' ')}</span><br />
                                    {item.shcc}
                                </> :
                                <span>{item.hoTen ? item.hoTen : ''}</span>
                        )}
                        />
                        <TableCell type='text' content={(
                            <>
                                <span><i>{item.soQuyetDinh}</i></span><br />
                                <span>Diện nghỉ: <span style={{ color: 'blue' }}>{item.dienNghi == 1 ? 'Biên chế' : 'Hợp đồng'}</span></span>
                            </>
                        )}
                        />
                        <TableCell type='text' content={(
                            <>
                                <span>{item.ngayNghi ? T.dateToText(item.ngayNghi, 'dd/mm/yyyy') : ''}</span>
                            </>
                        )}
                        />
                        <TableCell type='text' content={(
                            <>
                                <span><i>{item.noiDung}</i></span>
                            </>
                        )}
                        />
                        {
                            !this.checked && <TableCell type='buttons' style={{ textAlign: 'center' }} content={item} permission={permission}
                                onEdit={() => this.modal.show(item)} onDelete={this.delete} >
                            </TableCell>
                        }
                        {
                            this.checked && <TableCell type='buttons' style={{ textAlign: 'center' }} content={item} permission={permission}>
                                <Link className='btn btn-success' to={`/user/tccb/qua-trinh/nghi-viec/group/-1/${item.shcc}`} >
                                    <i className='fa fa-lg fa-compress' />
                                </Link>
                            </TableCell>
                        }
                    </tr>
                )
            });
        }

        return this.renderPage({
            icon: 'fa fa-sign-out',
            title: 'Quá trình nghỉ việc',
            breadcrumb: [
                <Link key={0} to='/user/tccb'>Tổ chức cán bộ</Link>,
                'Quá trình nghỉ việc'
            ],
            advanceSearch: <>
                <FormSelect className='col-12 col-md-12' multiple={true} ref={e => this.loaiDoiTuong = e} label='Chọn loại đơn vị (có thể chọn nhiều loại)' data={SelectAdapter_DmDonVi} onChange={() => this.changeAdvancedSearch()} allowClear={true} />
            </>,
            content: <>
                <div className='tile'>
                    <FormCheckbox label='Hiển thị theo cán bộ' onChange={this.groupPage} />
                    {table}
                </div>
                <Pagination style={{ marginLeft: '70px' }} {...{ pageNumber, pageSize, pageTotal, totalItem, pageCondition }}
                    getPage={this.checked ? this.props.getQtNghiViecGroupPage : this.props.getQtNghiViecPage} />
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

const mapStateToProps = state => ({ system: state.system, qtNghiViec: state.qtNghiViec });
const mapActionsToProps = {
    createQtNghiViecStaff, updateQtNghiViecStaff, deleteQtNghiViecStaff,
    getQtNghiViecGroupPage, getQtNghiViecPage,
};
export default connect(mapStateToProps, mapActionsToProps)(QtNghiViec);
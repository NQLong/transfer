import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { AdminPage, TableCell, renderTable, AdminModal, FormSelect, FormTextBox, FormDatePicker, FormRichTextBox } from 'view/component/AdminPage';
import Pagination from 'view/component/Pagination';
import {
    updateQtNghiViecGroupPageMa, deleteQtNghiViecGroupPageMa,
    getQtNghiViecGroupPageMa, getQtNghiViecPage,
} from './redux';
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

class QtNghiViecGroupPage extends AdminPage {
    ma = ''; loaiDoiTuong = '-1';
    componentDidMount() {
        T.ready('/user/tccb', () => {
            const route = T.routeMatcher('/user/tccb/qua-trinh/nghi-viec/:loaiDoiTuong/:ma'),
                params = route.parse(window.location.pathname);
            this.loaiDoiTuong = params.loaiDoiTuong;
            this.ma = params.ma;
            T.onSearch = (searchText) => this.props.getQtNghiViecPage(undefined, undefined, this.loaiDoiTuong, searchText || '');
            T.showSearchBox();
            this.props.getQtNghiViecGroupPageMa(undefined, undefined, this.loaiDoiTuong, this.ma);
        });
    }

    showModal = (e) => {
        e.preventDefault();
        this.modal.show();
    }

    delete = (e, item) => {
        T.confirm('Xóa thông tin nghỉ việc', 'Bạn có chắc bạn muốn xóa thông tin nghỉ việc này?', 'warning', true, isConfirm => {
            isConfirm && this.props.deleteQtNghiViecGroupPageMa(item.ma, item.shcc, error => {
                if (error) T.notify(error.message ? error.message : 'Xoá thông tin nghỉ việc bị lỗi!', 'danger');
                else T.alert('Xoá thông tin nghỉ việc thành công!', 'success', false, 800);
            });
        });
        e.preventDefault();
    }

    render() {
        const currentPermissions = this.props.system && this.props.system.user && this.props.system.user.permissions ? this.props.system.user.permissions : [],
            permission = this.getUserPermission('qtNghiViec', ['read', 'write', 'delete']);
        let { pageNumber, pageSize, pageTotal, totalItem, pageCondition, list } = this.props.qtNghiViec && this.props.qtNghiViec.page ? this.props.qtNghiViec.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, pageCondition: {}, list: [] };
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
                        <TableCell type='link' onClick={() => this.modal.show(item, false)} style={{ whiteSpace: 'nowrap' }} content={(
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
                                <span>{item.ngayNghi ? T.dateToText(item.ngayNghi, 'dd/mm/yyyy') : ''}</span>
                            </>
                        )}
                        />
                        <TableCell type='text' content={(
                            <>
                                <span><i>{item.noiDung}</i></span><br/>
                                {item.ghiChu ? '(' + item.ghiChu + ')' : null}
                            </>
                        )}
                        />
                        <TableCell type='buttons' style={{ textAlign: 'center' }} content={item} permission={permission}
                            onEdit={() => this.modal.show(item, false)} onDelete={this.delete} >
                        </TableCell>

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
            content: <>
                <div className='tile'>
                    {table}
                </div>
                <Pagination style={{ marginLeft: '70px' }} {...{ pageNumber, pageSize, pageTotal, totalItem, pageCondition }}
                    getPage={this.props.getQtNghiViecPage} />
                <EditModal ref={e => this.modal = e} permission={permission}
                    permissions={currentPermissions}
                    update={this.props.updateQtNghiViecGroupPageMa}
                />
            </>,
            backRoute: '/user/tccb/qua-trinh/nghi-viec',
        });
    }
}

const mapStateToProps = state => ({ system: state.system, qtNghiViec: state.tccb.qtNghiViec });
const mapActionsToProps = {
    updateQtNghiViecGroupPageMa, deleteQtNghiViecGroupPageMa,
    getQtNghiViecGroupPageMa, getQtNghiViecPage,
};
export default connect(mapStateToProps, mapActionsToProps)(QtNghiViecGroupPage);
import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { AdminPage, TableCell, renderTable, AdminModal, FormSelect, FormTextBox, FormDatePicker, FormRichTextBox } from 'view/component/AdminPage';
import Pagination from 'view/component/Pagination';
import {
    updateQtNghiViecGroupPageMa, deleteQtNghiViecGroupPageMa,
    getQtNghiViecPage, createQtNghiViecGroupPageMa
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
        this.setState({ ma, item });
        setTimeout(() => {
            this.shcc.value(shcc ? shcc : this.props.shcc);
            this.dienNghi.value(dienNghi);
            this.noiDung.value(noiDung ? noiDung : '');
            this.ghiChu.value(ghiChu ? ghiChu : '');
            this.ngayNghi.value(ngayNghi ? ngayNghi : '');
            this.soQuyetDinh.value(soQuyetDinh ? soQuyetDinh : '');
        }, 500);
    }

    onSubmit = (e) => {
        e.preventDefault();
        const changes = {
            shcc: this.shcc.value(),
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
            this.state.ma ? this.props.update(this.state.ma, changes, this.hide) : this.props.create(changes, this.hide);
        }
    }

    render = () => {
        const readOnly = this.props.readOnly;
        return this.renderModal({
            title: this.state.ma ? 'Cập nhật thông tin nghỉ việc' : 'Tạo mới thông tin nghỉ việc',
            size: 'large',
            body: <div className='row'>
                <FormSelect className='col-md-12' ref={e => this.shcc = e} label='Cán bộ' data={SelectAdapter_FwCanBo} readOnly={true} />
                <FormTextBox className='col-md-12' ref={e => this.soQuyetDinh = e} label='Số quyết định' type='text' required readOnly={readOnly}/>
                <FormDatePicker className='col-md-6' ref={e => this.ngayNghi = e} label='Ngày nghỉ' type='date-mask' required readOnly={readOnly}/>
                <FormSelect className='col-md-6' ref={e => this.dienNghi = e} label={'Diện nghỉ'} data={[{ id: 1, text: 'Biên chế' }, { id: 2, text: 'Hợp đồng' }]} required readOnly={readOnly}/>
                <FormRichTextBox className='col-md-12' ref={e => this.noiDung = e} label={'Nội dung'} readOnly={readOnly}/>
                <FormRichTextBox className='col-md-12' ref={e => this.ghiChu = e} label={'Ghi chú'} readOnly={readOnly}/>
            </div>,
        });
    }
}

class QtNghiViecGroupPage extends AdminPage {
    state = { filter: {} };

    componentDidMount() {
        T.ready('/user/tccb', () => {
            const route = T.routeMatcher('/user/tccb/qua-trinh/nghi-viec/group/:ma'),
                params = route.parse(window.location.pathname);
            this.ma = params.ma;
            this.setState({filter: {list_shcc: params.ma, list_dv: '' }});
            T.onSearch = (searchText) => this.props.getPage(undefined, undefined, searchText || '');
            T.showSearchBox(() => {
                this.fromYear?.value('');
                this.toYear?.value('');
                setTimeout(() => this.changeAdvancedSearch(), 50);
            });
            this.props.getQtNghiViecPage(undefined, undefined, undefined, this.state.filter, () => {
                T.updatePage('pageQtNghiViec', undefined, undefined, undefined, this.state.filter);
            });
        });
    }

    changeAdvancedSearch = (isInitial = false) => {
        let { pageNumber, pageSize } = this.props && this.props.qtNghiViec && this.props.qtNghiViec.page ? this.props.qtNghiViec.page : { pageNumber: 1, pageSize: 50 };
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
                    if (!$.isEmptyObject(filter) && filter && (filter.fromYear || filter.toYear || filter.list_shcc || filter.list_dv )) this.showAdvanceSearch();
                }
            });
        });
    }

    getPage = (pageN, pageS, pageC, done) => {
        this.props.getQtNghiViecPage(pageN, pageS, pageC, this.state.filter, done);
    }

    showModal = (e) => {
        e.preventDefault();
        this.modal.show();
    }

    delete = (e, item) => {
        T.confirm('Xóa thông tin nghỉ việc', 'Bạn có chắc bạn muốn xóa thông tin nghỉ việc này?', 'warning', true, isConfirm => {
            isConfirm && this.props.deleteQtNghiViecGroupPageMa(item.ma, error => {
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
                        <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Cán bộ</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Quyết định nghỉ</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Ngày nghỉ</th>
                        <th style={{ width: '100%', whiteSpace: 'nowrap' }}>Nội dung</th>
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
                        <TableCell type='text' style={{  whiteSpace: 'nowrap' }} content={(
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
            title: 'Quá trình nghỉ việc - Cán bộ',
            breadcrumb: [
                <Link key={0} to='/user/tccb'>Tổ chức cán bộ</Link>,
                <Link key={0} to='/user/tccb/qua-trinh/hdlv'>Quá trình lương</Link>,
                'Quá trình lương - Cán bộ'
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
                    permissions={currentPermissions} shcc={this.ma}
                    update={this.props.updateQtNghiViecGroupPageMa} create={this.props.createQtNghiViecGroupPageMa}
                />
            </>,
            backRoute: '/user/tccb/qua-trinh/nghi-viec',
            onCreate: permission && permission.write ? (e) => this.showModal(e) : null,
        });
    }
}

const mapStateToProps = state => ({ system: state.system, qtNghiViec: state.tccb.qtNghiViec });
const mapActionsToProps = {
    updateQtNghiViecGroupPageMa, deleteQtNghiViecGroupPageMa,
    createQtNghiViecGroupPageMa, getQtNghiViecPage,
};
export default connect(mapStateToProps, mapActionsToProps)(QtNghiViecGroupPage);
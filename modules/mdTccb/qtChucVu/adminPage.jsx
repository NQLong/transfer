import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { AdminPage, TableCell, renderTable, AdminModal, FormTextBox, FormDatePicker, FormCheckbox, FormSelect } from 'view/component/AdminPage';
import Pagination from 'view/component/Pagination';
import {
    getQtChucVuPage, getQtChucVuAll, updateQtChucVu,
    deleteQtChucVu, createQtChucVu, getChucVuByShcc, getQtChucVuGroupPage
} from './redux';
import { SelectAdapter_DmChucVuV2, getDmChucVuAll} from 'modules/mdDanhMuc/dmChucVu/redux';
import { SelectAdapter_DmDonVi } from 'modules/mdDanhMuc/dmDonVi/redux';
import { SelectAdapter_DmBoMon } from 'modules/mdDanhMuc/dmBoMon/redux';
import { SelectAdapter_FwCanBo } from 'modules/mdTccb/tccbCanBo/redux';

export class EditModal extends AdminModal {
    state = { shcc: null, stt: '' };
    componentDidMount() {

    }

    onShow = (item) => {
        let { stt, shcc, maChucVu, maDonVi, soQuyetDinh, ngayRaQuyetDinh, ngayRaQd, soQd, chucVuChinh, maBoMon } = item ? item : {
            stt: '',
            shcc: '', maChucVu: '', maDonVi: '', soQuyetDinh: '', ngayRaQuyetDinh: '', chucVuChinh: '', maBoMon: '',
            ngayRaQd: '', soQd: ''
        };
        this.setState({ shcc, stt, item, chucVuChinh });
        this.shcc.value(shcc ? shcc : '');
        this.maChucVu.value(maChucVu ? maChucVu : '');
        this.maDonVi.value(maDonVi ? maDonVi : '');
        this.soQuyetDinh.value(soQd ? soQd : (soQuyetDinh ? soQuyetDinh : ''));
        this.ngayRaQuyetDinh.value(ngayRaQd ? ngayRaQd : (ngayRaQuyetDinh ? ngayRaQuyetDinh : ''));
        this.chucVuChinh.value(chucVuChinh ? 1 : 0);
        this.maBoMon.value(maBoMon ? maBoMon : '');
    };

    changeKichHoat = (value, target) => target.value(value ? 1 : 0) || target.value(value);

    checkChucVu = (changes) => {
        if (changes.chucVuChinh == this.state.chucVuChinh) {
            this.state.stt ? this.props.update(false, this.state.stt, changes, this.hide) : this.props.create(false, changes, this.hide);
            return;
        }
        T.confirm('Thông tin chức vụ chính', 'Đây sẽ là chức vụ chính của cán bộ', 'warning', true, isConfirm => {
            isConfirm && this.props.getQtChucVuAll(changes.shcc, data => {
                if (data) {
                    data.forEach(item => {
                        if (item.chucVuChinh && item.stt != this.state.stt) {
                            this.props.update(false, item.stt, { chucVuChinh: 0 });
                        }
                    });
                }
                if (this.state.stt) {
                    this.props.update(false, this.state.stt, changes, this.hide);
                } else {
                    this.props.create(false, changes, this.hide);
                }
            });
        });
    }

    onSubmit = (e) => {
        e.preventDefault();
        const changes = {
            shcc: this.shcc.value(),
            maChucVu: this.maChucVu.value(),
            maDonVi: this.maDonVi.value(),
            soQd: this.soQuyetDinh.value(),
            ngayRaQd: Number(this.ngayRaQuyetDinh.value()),
            chucVuChinh: this.chucVuChinh.value(),
            maBoMon: this.maBoMon.value(),
        };
        if (changes.shcc == '') {
            T.notify('Mã số cán bộ bị trống');
            this.shcc.focus();
        } else {
            if (!changes.chucVuChinh) {
                if (this.state.stt) {
                    this.props.update(false, this.state.stt, changes, this.hide);
                } else {
                    this.props.create(false, changes, this.hide);
                }
            } else
                this.checkChucVu(changes);
        }
    }

    checkChucVuSwitch = () => {
        if (this.state.chucVuChinh) {
            return true;
        }
        return false;
    }

    render = () => {
        const readOnly = this.props.readOnly;
        return this.renderModal({
            title: this.state.shcc ? 'Cập nhật quá trình chức vụ' : 'Tạo mới quá trình chức vụ',
            size: 'large',
            body: <div className='row'>
                <FormSelect className='col-md-12' ref={e => this.shcc = e} label='Cán bộ' data={SelectAdapter_FwCanBo} readOnly={readOnly} />
                <FormSelect className='col-md-4' ref={e => this.maChucVu = e} label='Chức vụ' data={SelectAdapter_DmChucVuV2} readOnly={readOnly} />
                <FormSelect className='col-md-4' ref={e => this.maDonVi = e} label='Đơn vị' data={SelectAdapter_DmDonVi} readOnly={readOnly} />
                <FormSelect className='col-md-4' ref={e => this.maBoMon = e} label='Bộ môn' data={SelectAdapter_DmBoMon} readOnly={readOnly} />
                <FormCheckbox className='col-md-12' ref={e => this.chucVuChinh = e} label='Chức vụ chính' readOnly={this.checkChucVuSwitch()} />
                <FormTextBox type='text' className='col-md-6' ref={e => this.soQuyetDinh = e} label='Số quyết định' readOnly={readOnly} />
                <FormDatePicker type='date-mask' className='col-md-6' ref={e => this.ngayRaQuyetDinh = e} label='Ngày ra quyết định' readOnly={readOnly} />
                <FormCheckbox className='col-md-12' ref={e => this.thoiChucVu = e} label='Thôi giữ chức vụ' readOnly={readOnly} />
            </div>
        });
    }
}

class QtChucVu extends AdminPage {
    checked = false;
    curState = [];
    stateTable = [];
    searchText = '';
    componentDidMount() {
        T.ready('/user/tccb', () => {
            this.props.getDmChucVuAll(items => {
                if (items) {
                    this.stateTable = [];
                    items.forEach(item => item.loaiChucVu == 1 && this.stateTable.push({
                        'id': item.ma,
                        'text': item.ten
                    }));
                }
            });
            T.onSearch = (searchText) => {
                this.searchText = searchText;
                if (this.checked) this.props.getQtChucVuGroupPage(undefined, undefined, this.curState, this.searchText || '');
                else this.props.getQtChucVuPage(undefined, undefined, this.curState, this.searchText || '');
            };
            T.showSearchBox(() => {
                this.loaiDoiTuong?.value('');
                setTimeout(() => this.changeAdvancedSearch(), 50);
                setTimeout(() => this.showAdvanceSearch(), 1000);
            });
            this.changeAdvancedSearch();
            // T.showSearchBox();
        });
    }

    changeAdvancedSearch = () => {
        let { pageNumber, pageSize } = this.props && this.props.qtChucVu && this.props.qtChucVu.page ? this.props.qtChucVu.page : { pageNumber: 1, pageSize: 50};

        const loaiDoiTuong = this.loaiDoiTuong?.value() || [];
        this.curState = loaiDoiTuong;
        if (this.checked) this.props.getQtChucVuGroupPage(pageNumber, pageSize, this.curState, this.searchText || '');
        else this.props.getQtChucVuPage(pageNumber, pageSize, this.curState, this.searchText || '');
    }

    groupPage = () => {
        let { pageNumber, pageSize } = this.props && this.props.qtChucVu && this.props.qtChucVu.page ? this.props.qtChucVu.page : { pageNumber: 1, pageSize: 50};
        this.checked = !this.checked;
        if (this.checked) this.props.getQtChucVuGroupPage(pageNumber, pageSize, this.curState, this.searchText || '');
        else this.props.getQtChucVuPage(pageNumber, pageSize, this.curState, this.searchText || '');
    }
    showModal = (e) => {
        e.preventDefault();
        this.modal.show();
    }

    delete = (e, item) => {
        T.confirm('Xóa chức vụ', 'Bạn có chắc bạn muốn xóa chức vụ này?', 'warning', true, isConfirm => {
            isConfirm && this.props.deleteQtChucVu(false, item.stt, null, error => {
                if (error) T.notify(error.message ? error.message : 'Xoá chức vụ bị lỗi!', 'danger');
                else T.alert('Xoá chức vụ thành công!', 'success', false, 800);
            });
        });
        e.preventDefault();
    }

    render() {
        const permission = this.getUserPermission('qtChucVu', ['read', 'write', 'delete']);
        let { pageNumber, pageSize, pageTotal, totalItem, pageCondition, list } = this.checked ?
            (this.props.qtChucVu && this.props.qtChucVu.page_gr ?
                this.props.qtChucVu.page_gr : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, pageCondition: {}, list })
            : (this.props.qtChucVu && this.props.qtChucVu.page ? this.props.qtChucVu.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, pageCondition: {}, list: [] });
        let loaiDoiTuong = this.curState;
        let table = 'Không có danh sách!';
        if (list && list.length > 0) {
            table = renderTable({
                getDataSource: () => list, stickyHead: false,
                renderHead: () => (
                    <tr>
                        <th style={{ width: 'auto', textAlign: 'right' }}>#</th>
                        <th style={{ width: '50%', whiteSpace: 'nowrap' }}>Cán bộ</th>
                        <th style={{ width: '50%', whiteSpace: 'nowrap' }}>Chức vụ</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Quyết định</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Chức vụ chính</th>
                        <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>Thao tác</th>
                    </tr>
                ),
                renderRow: (item, index) => (
                    <tr key={index}>
                        <TableCell type='text' style={{ textAlign: 'right' }} content={index + 1} />
                        <TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={(
                            <>
                                <span>{item.ho + ' ' + item.ten}</span><br />
                                <a href='#' onClick={() => this.modal.show(item)}>{item.shcc}</a>
                            </>
                        )}
                        />
                        <TableCell type='text' content={(
                            <>
                                <span>{item.tenChucVu}</span><br />
                                <span>{!item.tenBoMon ? (item.tenDonVi ? 'Đơn vị: ' + item.tenDonVi.toUpperCase() : '') : (item.tenBoMon ? item.tenBoMon.toUpperCase() : '')}</span><br/>
                                <span>Hệ số phụ cấp: {item.phuCap}</span>
                            </>
                        )}
                        />
                        <TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={(
                            <>
                                <span>Số: {item.soQuyetDinh}</span><br />
                                <span>Ngày: <span style={{ color: 'blue' }}>{item.ngayRaQuyetDinh ? new Date(item.ngayRaQuyetDinh).ddmmyyyy() : ''}</span></span>
                            </>
                        )}
                        />
                        <TableCell type='checkbox' content={item.chucVuChinh} />
                        {
                            !this.checked && <TableCell type='buttons' style={{ textAlign: 'center' }} content={item} permission={permission}
                                onEdit={() => this.modal.show(item)} onDelete={this.delete} >
                            </TableCell>
                        }
                        {
                            this.checked && <TableCell type='buttons' style={{ textAlign: 'center' }} content={item} permission={permission}>
                                <Link className='btn btn-success' to={`/user/tccb/qua-trinh/chuc-vu/group_cv/-1/${item.shcc}`} >
                                    <i className='fa fa-lg fa-compress' />
                                </Link>
                            </TableCell>
                        }
                    </tr>
                )
            });
        }

        return this.renderPage({
            icon: 'fa fa-black-tie',
            title: ' Quá trình chức vụ',
            breadcrumb: [
                <Link key={0} to='/user/tccb'>Tổ chức cán bộ</Link>,
                'Quá trình chức vụ'
            ],
            advanceSearch: <>
                <FormSelect className='col-12 col-md-12' multiple = {true} ref={e => this.loaiDoiTuong = e} label='Chọn loại chức vụ (có thể chọn nhiều loại)' data={this.stateTable} onChange={() => this.changeAdvancedSearch()} allowClear={true} />
            </>,
            content: <>
                <div className='tile'>
                    <FormCheckbox label='Hiển thị theo cán bộ' onChange={this.groupPage} />
                    {table}
                </div>
                <Pagination style={{ marginLeft: '70px' }} {...{ pageNumber, pageSize, pageTotal, totalItem, pageCondition, loaiDoiTuong }}
                    getPage={this.checked ? this.props.getQtChucVuGroupPage : this.props.getQtChucVuPage} />
                <EditModal ref={e => this.modal = e}
                    getQtChucVuAll={this.props.getQtChucVuAll}
                    create={this.props.createQtChucVu} update={this.props.updateQtChucVu}
                />
            </>,
            backRoute: '/user/tccb',
            onCreate: permission && permission.write && !this.checked ? (e) => this.showModal(e) : null,
        });
    }
}

const mapStateToProps = state => ({ system: state.system, qtChucVu: state.tccb.qtChucVu });
const mapActionsToProps = {
    getQtChucVuAll, getQtChucVuPage, deleteQtChucVu, createQtChucVu,
    updateQtChucVu, getChucVuByShcc, getQtChucVuGroupPage, getDmChucVuAll,
};
export default connect(mapStateToProps, mapActionsToProps)(QtChucVu);
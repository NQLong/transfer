import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { AdminPage, TableCell, renderTable, AdminModal, FormTextBox, FormDatePicker, FormCheckbox, FormSelect } from 'view/component/AdminPage';
import Pagination from 'view/component/Pagination';
import {
    getQtChucVuGroupPageMa, getQtChucVuAll, updateQtChucVuGroupPageMa,
    deleteQtChucVuGroupPageMa, createQtChucVuGroupPageMa,
} from './redux';
import { SelectAdapter_DmChucVuV2, getDmChucVu } from 'modules/mdDanhMuc/dmChucVu/redux';
import { SelectAdapter_DmDonVi } from 'modules/mdDanhMuc/dmDonVi/redux';
import { SelectAdapter_DmBoMonTheoDonVi } from 'modules/mdDanhMuc/dmBoMon/redux';
import { SelectAdapter_FwCanBo } from 'modules/mdTccb/tccbCanBo/redux';

const timeList = [
    { id: 0, text: 'Không' },
    { id: 1, text: 'Theo ngày ra quyết định bổ nhiệm' },
    { id: 2, text: 'Theo ngày thôi chức vụ' },
    { id: 3, text: 'Theo ngày ra quyết định thôi chức vụ' }
];

export class EditModal extends AdminModal {
    state = { shcc: null, stt: '', chucVuChinh: 0, thoiChucVu: 0, donVi: 0, capChucVu: 1 };
    componentDidMount() {

    }

    onShow = (item, maCanBo) => {
        let { stt, shcc, maChucVu, maDonVi, soQuyetDinh, ngayRaQuyetDinh, ngayRaQd, soQd, chucVuChinh, maBoMon, thoiChucVu, soQdThoiChucVu, ngayRaQdThoiChucVu, ngayThoiChucVu, capChucVu } = item ? item : {
            stt: '',
            shcc: '', maChucVu: '', maDonVi: '', soQuyetDinh: '', ngayRaQuyetDinh: '', chucVuChinh: '', maBoMon: '',
            ngayRaQd: '', soQd: '', thoiChucVu: '', ngayRaQdThoiChucVu: '', ngayThoiChucVu: '', soQdThoiChucVu: '', capChucVu: 0,
        };
        this.setState({ shcc, stt, item, chucVuChinh, thoiChucVu: thoiChucVu ? 1 : 0, maCanBo, capChucVu: capChucVu }, () => {
            this.shcc.value(shcc ? shcc : (maCanBo ? maCanBo : ''));
            this.maChucVu.value(maChucVu ? maChucVu : '');
            this.maDonVi.value(maDonVi ? maDonVi : '');
            this.soQuyetDinh.value(soQd ? soQd : (soQuyetDinh ? soQuyetDinh : ''));
            this.ngayRaQuyetDinh.value(ngayRaQd ? ngayRaQd : (ngayRaQuyetDinh ? ngayRaQuyetDinh : ''));
            this.chucVuChinh.value(chucVuChinh ? 1 : 0);
            this.maBoMon.value(maBoMon ? maBoMon : '');
            this.thoiChucVu.value(thoiChucVu ? 1 : 0);
            this.state.thoiChucVu ? this.soQdThoiChucVu.value(soQdThoiChucVu ? soQdThoiChucVu : '') : $('#soQdThoiChucVu').hide();
            this.state.thoiChucVu ? this.ngayRaQdThoiChucVu.value(ngayRaQdThoiChucVu ? ngayRaQdThoiChucVu : '') : $('#ngayRaQdThoiChucVu').hide();
            this.state.thoiChucVu ? this.ngayThoiChucVu.value(ngayThoiChucVu ? ngayThoiChucVu : '') : $('#ngayThoiChucVu').hide();
        });
    };

    changeKichHoat = (value, target) => target.value(value ? 1 : 0) || target.value(value);

    checkChucVu = (changes) => {
        if (changes.chucVuChinh == this.state.chucVuChinh) {
            this.state.stt ? this.props.update(this.state.stt, changes, this.hide, false) : this.props.create(false, changes, this.hide);
            return;
        }
        T.confirm('Thông tin chức vụ chính', 'Đây sẽ là chức vụ chính của cán bộ', 'warning', true, isConfirm => {
            isConfirm && this.props.getQtChucVuAll(changes.shcc, data => {
                if (data) {
                    data.rows.forEach(item => {
                        if (item.chucVuChinh && item.stt != this.state.stt) {
                            this.props.update(item.stt, { chucVuChinh: 0 });
                        }
                    });
                }
                if (this.state.stt) {
                    this.props.update(this.state.stt, changes, this.hide, false);
                } else {
                    this.props.create(changes, this.hide, false);
                }
            });
        });
    }

    onSubmit = (e) => {
        e.preventDefault();
        const changes = {
            shcc: this.state.maCanBo,
            maChucVu: this.maChucVu.value(),
            maDonVi: this.maDonVi.value(),
            soQd: this.soQuyetDinh.value(),
            ngayRaQd: Number(this.ngayRaQuyetDinh.value()),
            chucVuChinh: this.chucVuChinh.value() ? 1 : 0,
            maBoMon: this.maBoMon.value(),
            thoiChucVu: this.thoiChucVu.value() ? 1 : 0,
            soQdThoiChucVu: this.soQdThoiChucVu.value(),
            ngayRaQdThoiChucVu: Number(this.ngayRaQdThoiChucVu.value()),
            ngayThoiChucVu: Number(this.ngayThoiChucVu.value()),
        };
        if (changes.shcc == '') {
            T.notify('Mã số cán bộ bị trống');
            this.shcc.focus();
        } else {
            if (!changes.chucVuChinh) {
                if (this.state.stt) {
                    this.props.update(this.state.stt, changes, this.hide);
                } else {
                    this.props.create(changes, this.hide);
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

    handleDonVi = (data) => {
        data && this.setState({ donVi: data.id }, () => {
            this.maBoMon.value('');
        });
    }

    handleThoiChucVu = (value) => {
        value ? $('#soQdThoiChucVu').show() : $('#soQdThoiChucVu').hide();
        value ? $('#ngayRaQdThoiChucVu').show() : $('#ngayRaQdThoiChucVu').hide();
        value ? $('#ngayThoiChucVu').show() : $('#ngayThoiChucVu').hide();
        this.setState({ thoiChucVu: value });
    }

    handleChucVu = (data) => {
        data && this.props.getDmChucVu(data.id, (item) => {
            this.setState({ capChucVu: item.isCapTruong }, () => {
                this.maDonVi.value('');
                this.maBoMon.value('');
            });
        });
    }

    render = () => {
        const readOnly = this.props.readOnly;
        return this.renderModal({
            title: this.state.shcc ? 'Cập nhật quá trình chức vụ' : 'Tạo mới quá trình chức vụ',
            size: 'large',
            body: <div className='row'>
                <FormSelect className='col-md-12' ref={e => this.shcc = e} label='Cán bộ' data={SelectAdapter_FwCanBo} allowClear={true} readOnly={true} />
                <FormSelect className='col-md-12' ref={e => this.maChucVu = e} label='Chức vụ' data={SelectAdapter_DmChucVuV2} onChange={this.handleChucVu} allowClear={true} readOnly={readOnly} />
                <FormSelect className='col-md-12' ref={e => this.maDonVi = e} label='Đơn vị của chức vụ' data={SelectAdapter_DmDonVi} onChange={this.handleDonVi} allowClear={true} readOnly={readOnly} />
                <FormSelect className='col-md-12' ref={e => this.maBoMon = e} style={{ display: this.state.capChucVu ? 'none' : '' }} label='Bộ môn của chức vụ' data={SelectAdapter_DmBoMonTheoDonVi(this.state.donVi)} allowClear={true} readOnly={readOnly} />
                <FormCheckbox className='col-md-12' ref={e => this.chucVuChinh = e} label='Chức vụ chính' readOnly={this.checkChucVuSwitch()} />
                <FormTextBox type='text' className='col-md-6' ref={e => this.soQuyetDinh = e} label='Số quyết định bổ nhiệm' readOnly={readOnly} />
                <FormDatePicker type='date-mask' className='col-md-6' ref={e => this.ngayRaQuyetDinh = e} label='Ngày ra quyết định bổ nhiệm' readOnly={readOnly} />
                <FormCheckbox className='col-md-12' ref={e => this.thoiChucVu = e} onChange={this.handleThoiChucVu} label='Thôi giữ chức vụ' readOnly={readOnly} />
                <div className='col-md-4' id='soQdThoiChucVu'><FormTextBox type='text' ref={e => this.soQdThoiChucVu = e} label='Số quyết định thôi chức vụ' readOnly={readOnly} /> </div>
                <div className='col-md-4' id='ngayThoiChucVu'> <FormDatePicker type='date-mask' ref={e => this.ngayThoiChucVu = e} label='Ngày thôi chức vụ' readOnly={readOnly} /> </div>
                <div className='col-md-4' id='ngayRaQdThoiChucVu'> <FormDatePicker type='date-mask' ref={e => this.ngayRaQdThoiChucVu = e} label='Ngày ra quyết định thôi chức vụ' readOnly={readOnly} /> </div>
            </div>
        });
    }
}

class QtChucVuGroup extends AdminPage {
    state = { filter: {}, ma: '' };
    searchText = '';
    componentDidMount() {
        T.ready('/user/tccb', () => {
            const route = T.routeMatcher('/user/tccb/qua-trinh/chuc-vu/group/:ma'),
                params = route.parse(window.location.pathname);
            this.setState({ filter: { listShcc: params.ma, listDv: '', timeType: 0, gioiTinh: null }, ma: params.ma });
            T.onSearch = (searchText) => this.getPage(undefined, undefined, searchText || '');

            T.showSearchBox(() => {
                this.timeType?.value(0);
                this.fromYear?.value('');
                this.toYear?.value('');
                setTimeout(() => this.changeAdvancedSearch(), 50);
            });
            this.getPage();
        });
    }

    changeAdvancedSearch = (isInitial = false) => {
        let { pageNumber, pageSize } = this.props && this.props.qtChucVu && this.props.qtChucVu.pageMa ? this.props.qtChucVu.pageMa : { pageNumber: 1, pageSize: 50 };
        const timeType = this.timeType?.value() || 0;
        const fromYear = this.fromYear?.value() == '' ? null : this.fromYear?.value().getTime();
        const toYear = this.toYear?.value() == '' ? null : this.toYear?.value().getTime();
        const listDv = this.state.filter.listDv;
        const listShcc = this.state.filter.listShcc;
        const listCv = this.mulMaChucVu?.value().toString() || '';
        const pageFilter = isInitial ? null : { listDv, fromYear, toYear, listShcc, timeType, listCv };
        this.setState({ filter: pageFilter }, () => {
            this.getPage(pageNumber, pageSize, '', (page) => {
                if (isInitial) {
                    const filter = page.filter || {};
                    this.setState({ filter: !$.isEmptyObject(filter) ? filter : pageFilter });
                    this.fromYear?.value(filter.fromYear || '');
                    this.toYear?.value(filter.toYear || '');
                    this.timeType?.value(filter.timeType);
                    this.mulMaChucVu?.value(filter.listCv);
                    if (!$.isEmptyObject(filter) && filter && (filter.fromYear || filter.toYear || filter.timeType || filter.listCv)) this.showAdvanceSearch();
                }
            });
        });
    }

    getPage = (pageN, pageS, pageC, done) => {
        this.props.getQtChucVuGroupPageMa(pageN, pageS, pageC, this.state.filter, done);
    }

    showModal = (e) => {
        e.preventDefault();
        this.modal.show(null, this.state.ma);
    }

    delete = (e, item) => {
        T.confirm('Xóa chức vụ', 'Bạn có chắc bạn muốn xóa chức vụ này?', 'warning', true, isConfirm => {
            isConfirm && this.props.deleteQtChucVuGroupPageMa(item.stt, null, error => {
                if (error) T.notify(error.message ? error.message : 'Xoá chức vụ bị lỗi!', 'danger');
                else T.alert('Xoá chức vụ thành công!', 'success', false, 800);
            });
        });
        e.preventDefault();
    }

    render() {
        const currentPermissions = this.props.system && this.props.system.user && this.props.system.user.permissions ? this.props.system.user.permissions : [],
            permission = this.getUserPermission('qtChucVu', ['read', 'write', 'delete']);
        let { pageNumber, pageSize, pageTotal, totalItem, pageCondition, list } = this.props.qtChucVu && this.props.qtChucVu.pageMa ?
            this.props.qtChucVu.pageMa : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, list };
        let table = 'Không có danh sách!';
        if (list && list.length > 0) {
            table = renderTable({
                getDataSource: () => list, stickyHead: false,
                renderHead: () => (
                    <tr>
                        <th style={{ width: 'auto', textAlign: 'right' }}>#</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Cán bộ</th>
                        <th style={{ width: '100%', whiteSpace: 'nowrap' }}>Chức vụ</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Quyết định bổ nhiệm</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Chức vụ chính</th>
                        <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>Thao tác</th>
                    </tr>
                ),
                renderRow: (item, index) => (
                    <tr key={index}>
                        <TableCell type='text' style={{ textAlign: 'right' }} content={(pageNumber - 1) * pageSize + index + 1} />
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
                                {!item.tenDonVi ? (item.tenDonVi ? item.tenDonVi.toUpperCase() : '') : (item.tenDonVi ? item.tenDonVi.toUpperCase() : '')}<br />
                                {!item.tenBoMon ? (item.tenBoMon ? item.tenBoMon.toUpperCase() : '') : (item.tenBoMon ? item.tenBoMon.toUpperCase() : '')}
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
                        <TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={(
                            <>
                                <span>Số: {item.soQdThoiChucVu}</span><br />
                                <span>Ngày: <span style={{ color: 'blue' }}>{item.ngayRaQdThoiChucVu ? new Date(item.ngayRaQdThoiChucVu).ddmmyyyy() : ''}</span></span>
                            </>
                        )}
                        />
                        <TableCell type='buttons' style={{ textAlign: 'center' }} content={item} permission={permission}
                            onEdit={() => this.modal.show(item, this.state.ma)} onDelete={this.delete} >
                        </TableCell>

                    </tr>
                )
            });
        }

        return this.renderPage({
            icon: 'fa fa-black-tie',
            title: 'Quá trình chức vụ',
            breadcrumb: [
                <Link key={0} to='/user/tccb'>Tổ chức cán bộ</Link>,
                'Quá trình chức vụ'
            ],
            advanceSearch: <>
                <div className='row'>
                    <FormSelect className='col-12 col-md-6' ref={e => this.timeType = e} label='Chọn loại thời gian' data={timeList} onChange={() => this.changeAdvancedSearch()} />
                    {this.timeType && this.timeType.value() && this.timeType.value() != 0 && <FormDatePicker type='month-mask' ref={e => this.fromYear = e} className='col-12 col-md-4' label='Từ thời gian' onChange={() => this.changeAdvancedSearch()} />}
                    {this.timeType && this.timeType.value() && this.timeType.value() != 0 && <FormDatePicker type='month-mask' ref={e => this.toYear = e} className='col-12 col-md-4' label='Đến thời gian' onChange={() => this.changeAdvancedSearch()} />}
                    <FormSelect className='col-md-6' multiple={true} ref={e => this.mulMaChucVu = e} label='Chức vụ' data={SelectAdapter_DmChucVuV2} onChange={() => this.changeAdvancedSearch()} allowClear={true} minimumResultsForSearch={-1} />
                </div>
            </>,
            content: <>
                <div className='tile'>
                    {table}</div>
                <Pagination style={{ marginLeft: '70px' }} {...{ pageNumber, pageSize, pageTotal, totalItem, pageCondition }}
                    getPage={this.getPage} />
                <EditModal ref={e => this.modal = e} permission={currentPermissions}
                    getQtChucVuAll={this.props.getQtChucVuAll}
                    create={this.props.createQtChucVuGroupPageMa} update={this.props.updateQtChucVuGroupPageMa} getDmChucVu={this.props.getDmChucVu}
                />
            </>,
            backRoute: '/user/tccb/qua-trinh/chuc-vu',
            onCreate: permission && permission.write ? (e) => this.showModal(e) : null,
            onExport: (e) => {
                e.preventDefault();
                const { listDv, fromYear, toYear, listShcc, timeType, listCv, gioiTinh } = (this.state.filter && this.state.filter != '%%%%%%%%') ? this.state.filter : { fromYear: null, toYear: null, listShcc: null, listDv: null, timeType: 0, listCv: null, gioiTinh: null };

                T.download(T.url(`/api/qua-trinh/chuc-vu/download-excel/${listShcc ? listShcc : null}/${listDv ? listDv : null}/${fromYear ? fromYear : null}/${toYear ? toYear : null}/${timeType}/${listCv ? listCv : null}/${gioiTinh ? gioiTinh : null}`), 'chucvu.xlsx');
            }
        });
    }
}

const mapStateToProps = state => ({ system: state.system, qtChucVu: state.tccb.qtChucVu });
const mapActionsToProps = {
    getQtChucVuAll, getQtChucVuGroupPageMa, deleteQtChucVuGroupPageMa, createQtChucVuGroupPageMa,
    updateQtChucVuGroupPageMa, getDmChucVu
};
export default connect(mapStateToProps, mapActionsToProps)(QtChucVuGroup);
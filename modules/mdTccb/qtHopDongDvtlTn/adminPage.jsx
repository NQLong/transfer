import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { AdminPage, TableCell, renderTable, AdminModal, FormTextBox, FormDatePicker, FormCheckbox, FormSelect } from 'view/component/AdminPage';
import Pagination from 'view/component/Pagination';
import {
    getQtHopDongDvtlTnPage, getQtHopDongDvtlTnAll, updateQtHopDongDvtlTn,
    deleteQtHopDongDvtlTn, createQtHopDongDvtlTn
} from './redux';
import { getDmChucVuAll } from 'modules/mdDanhMuc/dmChucVu/redux';
import { getDmDonViAll } from 'modules/mdDanhMuc/dmDonVi/redux';
import { getDmBoMonAll } from 'modules/mdDanhMuc/dmBoMon/redux';
import { getStaffAll } from 'modules/mdTccb/tccbCanBo/redux';

class EditModal extends AdminModal {
    donViTable = [];
    chucVuTable = [];
    state = { shcc: null };
    componentDidMount() {

        this.props.getDonVi(items => {
            if (items) {
                this.donViTable = [];
                items.forEach(item => this.donViTable.push({
                    'id': item.ma,
                    'text': item.ten
                }));
            }
        });
        this.props.getChucVu(items => {
            if (items) {
                this.chucVuTable = [];
                items.forEach(item => this.chucVuTable.push({
                    'id': item.ma,
                    'text': item.ten
                }));
            }
        });
        this.props.getBoMon(items => {
            if (items) {
                this.boMonTable = [];
                items.forEach(item => this.boMonTable.push({
                    'id': item.ma,
                    'text': item.ten
                }));
            }
        });
        this.props.getStaff(items => {
            if (items) {
                this.staffTable = [];
                items.forEach(item => this.staffTable.push({
                    'id': item.shcc,
                    'text': item.shcc + ' - ' + item.ho + ' ' + item.ten
                }));
            }
        });
    }

    onShow = (item) => {
        let { shcc, maChucVu, maDonVi, soQuyetDinh, ngayRaQuyetDinh, chucVuChinh, maBoMon } = item ? item : {
            shcc: '', maChucVu: '', maDonVi: '', soQuyetDinh: '', ngayRaQuyetDinh: '', chucVuChinh: '', maBoMon: '',
        };
        this.setState({ shcc, item });
        this.shcc.value(shcc ? shcc : '');
        this.maChucVu.value(maChucVu ? maChucVu : '');
        this.maDonVi.value(maDonVi ? maDonVi : '');
        this.soQuyetDinh.value(soQuyetDinh ? soQuyetDinh : '');
        this.ngayRaQuyetDinh.value(ngayRaQuyetDinh ? ngayRaQuyetDinh : '');
        this.chucVuChinh.value(chucVuChinh ? 1 : 0);
        this.maBoMon.value(maBoMon ? maBoMon : '');
    };

    changeKichHoat = (value, target) => target.value(value ? 1 : 0) || target.value(value);

    onSubmit = (e) => {
        e.preventDefault();
        const changes = {
            shcc: this.shcc.value(),
            chucVu: this.maChucVu.value(),
            donVi: this.maDonVi.value(),
            soQd: this.soQuyetDinh.value(),
            ngayRaQd: this.ngayRaQuyetDinh.value(),
            chucVuChinh: this.chucVuChinh.value(),
            boMon: this.maBoMon.value(),
        };
        if (changes.shcc == '') {
            T.notify('Mã số cán bộ bị trống');
            this.shcc.focus();
        } else {
            this.state.shcc ? this.props.update(changes, this.hide) : this.props.create(changes, this.hide);
        }
    }

    render = () => {
        const readOnly = this.props.readOnly;
        return this.renderModal({
            title: this.state.shcc ? 'Cập nhật quá trình chức vụ' : 'Tạo mới quá trình chức vụ',
            size: 'large',
            body: <div className='row'>
                <FormSelect className='col-md-12' ref={e => this.shcc = e} label='Mã số cán bộ' data={this.staffTable} readOnly={readOnly} />
                <FormSelect className='col-md-4' ref={e => this.maChucVu = e} label='Chức vụ' data={this.chucVuTable} readOnly={readOnly} />
                <FormSelect className='col-md-4' ref={e => this.maDonVi = e} label='Đơn vị' data={this.donViTable} readOnly={readOnly} />
                <FormSelect className='col-md-4' ref={e => this.maBoMon = e} label='Bộ môn' data={this.boMonTable} readOnly={readOnly} />
                <FormCheckbox className='col-md-12' ref={e => this.chucVuChinh = e} label='Chức vụ chính' isSwitch={true} readOnly={readOnly} />
                <FormTextBox type='text' className='col-md-6' ref={e => this.soQuyetDinh = e} label='Số quyết định' readOnly={readOnly} />
                <FormDatePicker className='col-md-6' ref={e => this.ngayRaQuyetDinh = e} label='Ngày ra quyết định' readOnly={readOnly} />
            </div>
        });
    }
}

class QtHopDongDvtlTn extends AdminPage {
    componentDidMount() {
        T.ready('/user/tccb', () => {
            T.onSearch = (searchText) => this.props.getQtHopDongDvtlTnPage(undefined, undefined, searchText || '');
            T.showSearchBox();
            this.props.getQtHopDongDvtlTnPage();
        });
    }

    showModal = (e) => {
        e.preventDefault();
        this.modal.show();
    }

    delete = (e, item) => {
        T.confirm('Xóa chức vụ', 'Bạn có chắc bạn muốn xóa chức vụ này?', 'warning', true, isConfirm => {
            isConfirm && this.props.deleteQtHopDongDvtlTn(item.stt, error => {
                if (error) T.notify(error.message ? error.message : 'Xoá chức vụ bị lỗi!', 'danger');
                else T.alert('Xoá chức vụ thành công!', 'success', false, 800);
            });
        });
        e.preventDefault();
    }

    render() {
        const currentPermissions = this.props.system && this.props.system.user && this.props.system.user.permissions ? this.props.system.user.permissions : [],
            permission = this.getUserPermission('qtHopDongDvtlTn', ['read', 'write', 'delete']);
        let { pageNumber, pageSize, pageTotal, totalItem, pageCondition, list } = this.props.qtHopDongDvtlTn && this.props.qtHopDongDvtlTn.page ?
            this.props.qtHopDongDvtlTn.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, list };
        let table = 'Không có danh sách!';
        if (list && list.length > 0) {
            table = renderTable({
                getDataSource: () => list, stickyHead: false,
                renderHead: () => (
                    <tr>
                        <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Cán bộ</th>
                        <th style={{ width: '45%', whiteSpace: 'nowrap' }}>Số hợp đồng</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Diện hợp đồng</th>
                        <th style={{ width: '15%', whiteSpace: 'nowrap' }}>Thời gian</th>
                        <th style={{ width: '25%', whiteSpace: 'nowrap' }}>Cán bộ duyệt hồ sơ</th>
                        <th style={{ width: 'auto', textAlign: 'center' }}>Thao tác</th>

                    </tr>
                ),
                renderRow: (item, index) => (
                    <tr key={index}>
                        <TableCell type='text' content={index + 1} />
                        <TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={(
                            <>
                                <span>{item.ho + ' ' + item.ten}</span><br />
                                <span>Mã số cán bộ: {item.shcc}</span>
                            </>
                        )}
                        />
                        <TableCell type='text' content={(
                            <>
                                <span><Link to={'/user/tccb/qua-trinh/hop-dong-dvtl-tn/' + item.ma}>{item.soHopDong}</Link></span><br />
                                <span>Ngày ký: <span style={{ color: 'blue' }}>{item.ngayKyHopDong ? new Date(item.ngayKyHopDong).ddmmyyyy() : ''}</span></span>
                            </>
                        )}
                        />
                        <TableCell type='text' content={item.dienHopDong} />
                        <TableCell type='text' content={(
                            <>
                                <span style={{ whiteSpace: 'nowrap' }}>Từ ngày: <span style={{ color: 'blue' }}>{item.hieuLucHopDong ? new Date(item.hieuLucHopDong).ddmmyyyy() : ''}</span></span><br />
                                <span style={{ whiteSpace: 'nowrap' }}>Đến ngày: <span style={{ color: 'blue' }}>{item.ketThucHopDong ? new Date(item.ketThucHopDong).ddmmyyyy() : ''}</span></span>
                            </>
                        )}
                        />
                        <TableCell style={{ whiteSpace: 'nowrap' }} type='text' content={(
                            <>
                                <span>{item.hoNguoiKy + ' ' + item.tenNguoiKy}<br /></span>
                                <Link to={'/user/staff/' + item.shccNguoiKy}>{item.shccNguoiKy}</Link>
                            </>
                        )} />
                        <TableCell type='buttons' content={item} onEdit={`/user/tccb/qua-trinh/hop-dong-dvtl-tn/${item.ma}`} onDelete={this.delete} permission={permission} >
                            <a href="#" className="btn btn-primary" style={{ width: '45px' }} onClick={e => e.preventDefault() || this.hopDongDownloadWord(item)}>
                                <i className='fa fa-lg fa-file-word-o' />
                            </a>
                        </TableCell>
                    </tr>
                )
            });
        }

        return this.renderPage({
            icon: 'fa fa-list-alt',
            title: 'Hợp đồng Đơn vị trả lương - trách nhiệm',
            breadcrumb: [
                <Link key={0} to='/user/tccb'>Tổ chức cán bộ</Link>,
                'Hợp đồng Đơn vị trả lương - trách nhiệm'
            ],
            content: <>
                <div className='tile'>{table}</div>
                <Pagination style={{ marginLeft: '70px' }} {...{ pageNumber, pageSize, pageTotal, totalItem, pageCondition }}
                    getPage={this.props.getQtHopDongDvtlTnPage} />
                <EditModal ref={e => this.modal = e} permission={permission}
                    create={this.props.createQtHopDongDvtlTn} update={this.props.updateQtHopDongDvtlTn}
                    getDonVi={this.props.getDmDonViAll} permissions={currentPermissions}
                    getChucVu={this.props.getDmChucVuAll}
                    getBoMon={this.props.getDmBoMonAll}
                    getStaff={this.props.getStaffAll} />
            </>,
            backRoute: '/user/tccb',
            onCreate: permission.write ? (e) => e.preventDefault() || this.props.history.push('/user/tccb/qua-trinh/hop-dong-dvtl-tn/new') : null
            ,
        });
    }
}

const mapStateToProps = state => ({ system: state.system, qtHopDongDvtlTn: state.qtHopDongDvtlTn });
const mapActionsToProps = {
    getQtHopDongDvtlTnAll, getQtHopDongDvtlTnPage, deleteQtHopDongDvtlTn, getDmDonViAll, createQtHopDongDvtlTn,
    updateQtHopDongDvtlTn, getDmChucVuAll, getDmBoMonAll, getStaffAll,
};
export default connect(mapStateToProps, mapActionsToProps)(QtHopDongDvtlTn);
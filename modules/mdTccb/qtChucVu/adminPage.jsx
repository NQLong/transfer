import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { AdminPage, TableCell, renderTable, AdminModal, FormTextBox, FormDatePicker, FormCheckbox, FormSelect } from 'view/component/AdminPage';
import Pagination from 'view/component/Pagination';
import {
    getQtChucVuPage, getQtChucVuAll, updateQtChucVu,
    deleteQtChucVu, createQtChucVu
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
        let { shcc, chucVu, donVi, soQd, ngayRaQd, chucVuChinh, boMon } = item ? item : {
            shcc: '', chucVu: '', donVi: '', soQd: '', ngayRaQd: '', chucVuChinh: '', boMon: '',
        };
        this.setState({ shcc, item });
        this.shcc.value(shcc ? shcc : '');
        this.chucVu.value(chucVu ? chucVu : '');
        this.donVi.value(donVi ? donVi : '');
        this.soQd.value(soQd ? soQd : '');
        this.ngayRaQd.value(ngayRaQd ? ngayRaQd : '');
        this.chucVuChinh.value(chucVuChinh ? 1 : 0);
        this.boMon.value(boMon ? boMon : '');
    };

    changeKichHoat = (value, target) => target.value(value ? 1 : 0) || target.value(value);

    onSubmit = (e) => {
        e.preventDefault();
        const changes = {
            shcc: this.shcc.value(),
            chucVu: this.chucVu.value(),
            donVi: this.donVi.value(),
            soQd: this.soQd.value(),
            ngayRaQd: this.ngayRaQd.value(),
            chucVuChinh: this.chucVuChinh.value(),
            boMon: this.boMon.value(),
        };
        if (changes.shcc == '') {
            T.notify('Số hiệu công chức bị trống');
            this.shcc.focus();
        } else {
            this.state.shcc ? this.props.update(this.state.shcc, changes, this.hide) : this.props.create(changes, this.hide);
        }
    }

    render = () => {
        const readOnly = this.props.readOnly;
        return this.renderModal({
            title: this.state.shcc ? 'Cập nhật quá trình chức vụ' : 'Tạo mới quá trình chức vụ',
            size: 'large',
            body: <div className='row'>
                <FormSelect className='col-md-12' ref={e => this.shcc = e} label='Số hiệu công chức' data={this.staffTable} readOnly={readOnly} />
                <FormSelect className='col-md-4' ref={e => this.chucVu = e} label='Chức vụ' data={this.chucVuTable} readOnly={readOnly} /> 
                <FormSelect className='col-md-4' ref={e => this.donVi = e} label='Đơn vị' data={this.donViTable} readOnly={readOnly} /> 
                <FormSelect className='col-md-4' ref={e => this.boMon = e} label='Bộ môn' data={this.boMonTable} readOnly={readOnly} />
                <FormCheckbox className='col-md-12' ref={e => this.chucVuChinh = e} label='Chức vụ chính' isSwitch={true} readOnly={readOnly} />
                <FormTextBox type='text' className='col-md-6' ref={e => this.soQd = e} label='Số quyết định' readOnly={readOnly} />
                <FormDatePicker className='col-md-6' ref={e => this.ngayRaQd = e} label='Ngày ra quyết định' readOnly={readOnly} />
            </div>
        });
    }
}

class QtChucVu extends AdminPage {
    componentDidMount() {
        T.ready('/user/tccb', () => {
            T.onSearch = (searchText) => this.props.getQtChucVuPage(undefined, undefined, searchText || '');
            T.showSearchBox();
            this.props.getQtChucVuPage();
        });
    }

    showModal = (e) => {
        e.preventDefault();
        this.modal.show();
    }

    delete = (e, item) => {
        T.confirm('Xóa chức vụ', 'Bạn có chắc bạn muốn xóa chức vụ này?', 'warning', true, isConfirm => {
            isConfirm && this.props.deleteQtChucVu(item.stt, error => {
                if (error) T.notify(error.message ? error.message : 'Xoá chức vụ bị lỗi!', 'danger');
                else T.alert('Xoá chức vụ thành công!', 'success', false, 800);
            });
        });
        e.preventDefault();
    }

    render() {
        const currentPermissions = this.props.system && this.props.system.user && this.props.system.user.permissions ? this.props.system.user.permissions : [],
            permission = this.getUserPermission('qtChucVu', ['read', 'write', 'delete']);
        let { pageNumber, pageSize, pageTotal, totalItem, pageCondition, list } = this.props.qtChucVu && this.props.qtChucVu.page ?
            this.props.qtChucVu.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, list };
        let table = 'Không có danh sách!';
        if (list && list.length > 0) {
            table = renderTable({
                getDataSource: () => list, stickyHead: false,
                renderHead: () => (
                    <tr>
                        <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Cán bộ</th>
                        <th style={{ width: '25%', whiteSpace: 'nowrap' }}>Chức vụ</th>
                        <th style={{ width: '15%', whiteSpace: 'nowrap' }}>Quyết định</th>
                        <th style={{ width: '5%', textAlign: 'center' }}>Chức vụ chính</th>
                        <th style={{ width: 'auto', textAlign: 'center' }}>Thao tác</th>

                    </tr>
                ),
                renderRow: (item, index) => (
                    <tr key={index}>
                        <TableCell type='text' content={index + 1} />
                        <TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={(
                            <>
                                <span>{item.ho + ' ' + item.ten}</span><br />
                                {item.shcc}
                            </>
                        )}
                        />
                        <TableCell type='text' content={(
                            <>
                                <span>{item.tenChucVu}</span><br />
                                {item.tenDonVi ? item.tenDonVi : item.tenBoMon}
                            </>
                        )}
                        />
                        <TableCell type='text' content={(
                            <>
                                <span>Số: {item.soQuyetDinh}</span><br />
                                <span>Ngày: <span style={{ color: 'blue' }}>{item.ngayRaQuyetDinh ? new Date(item.ngayRaQuyetDinh).ddmmyyyy() : ''}</span></span>
                            </>
                        )}
                        />
                        <TableCell type='checkbox' content={item.chucVuChinh} permission={permission}
                            onChanged={value => this.props.updateQtChucVu({ stt: item.stt }, { chucVuChinh: value ? 1 : 0 })}/>
                        <TableCell type='buttons' style={{ textAlign: 'center' }} content={item} permission={permission}
                            onEdit={() => this.modal.show(item)} onDelete={e => this.delete(e, item)} />
                    </tr>
                )
            });
        }

        return this.renderPage({
            icon: 'fa fa-list-alt',
            title: 'Quá trình chức vụ',
            breadcrumb: [
                <Link key={0} to='/user/tccb'>Tổ chức cán bộ</Link>,
                'Quá trình chức vụ'
            ],
            content: <>
                <div className='tile'>{table}</div>
                <Pagination style={{ marginLeft: '70px' }} {...{ pageNumber, pageSize, pageTotal, totalItem, pageCondition }}
                    getPage={this.props.getQtChucVuPage} />
                <EditModal ref={e => this.modal = e} permission={permission}
                    create={this.props.createQtChucVu} update={this.props.updateQtChucVu}
                    getDonVi={this.props.getDmDonViAll} permissions={currentPermissions}
                    getChucVu={this.props.getDmChucVuAll}
                    getBoMon={this.props.getDmBoMonAll}
                    getStaff={this.props.getStaffAll} />
            </>,
            backRoute: '/user/tccb',
            onCreate: permission && permission.write ? (e) => this.showModal(e) : null,
        });
    }
}

const mapStateToProps = state => ({ system: state.system, qtChucVu: state.qtChucVu });
const mapActionsToProps = {
    getQtChucVuAll, getQtChucVuPage, deleteQtChucVu, getDmDonViAll, createQtChucVu,
    updateQtChucVu, getDmChucVuAll, getDmBoMonAll, getStaffAll,
};
export default connect(mapStateToProps, mapActionsToProps)(QtChucVu);
import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { AdminPage, TableCell, renderTable, AdminModal, FormSelect, FormTextBox} from 'view/component/AdminPage';
import Pagination from 'view/component/Pagination';
import {
    getQtKhenThuongCaNhanPage, getQtKhenThuongCaNhanAll, updateQtKhenThuongCaNhan,
    deleteQtKhenThuongCaNhan, createQtKhenThuongCaNhan
} from './redux';
import { getStaffAll } from 'modules/mdTccb/tccbCanBo/redux';
import { getDmKhenThuongKyHieuAll } from 'modules/mdDanhMuc/dmKhenThuongKyHieu/redux';
import { getDmKhenThuongChuThichAll } from 'modules/mdDanhMuc/dmKhenThuongChuThich/redux';

class EditModal extends AdminModal {
    state = { shcc: null, id: '' };
    componentDidMount() {
        this.props.getThanhTich(items => {
            if (items) {
                this.thanhTichTable = [];
                items.forEach(item => this.thanhTichTable.push({
                    'id': item.ma,
                    'text': item.ten
                }));
            }
        });
        this.props.getChuThich(items => {
            if (items) {
                this.chuThichTable = [];
                items.forEach(item => this.chuThichTable.push({
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
        let {id, shcc, namDatDuoc, maThanhTich, maChuThich} = item ? item : {
            id : '', shcc: '', namDatDuoc: '', maThanhTich: '', maChuThich: '',
        };
        this.setState({ id, shcc, item });
        this.shcc.value(shcc ? shcc : '');
        this.namDatDuoc.value(namDatDuoc ? '20'+namDatDuoc : '');
        this.maThanhTich.value(maThanhTich ? maThanhTich : '');
        this.maChuThich.value(maChuThich ? maChuThich : '');
    };

    changeKichHoat = (value, target) => target.value(value ? 1 : 0) || target.value(value);

    onSubmit = (e) => {
        e.preventDefault();
        const changes = {
            shcc: this.shcc.value(),
            namDatDuoc: this.namDatDuoc.value().slice(-2), 
            thanhTich: this.maThanhTich.value(),
            chuThich: this.maChuThich.value(),
        };
        if (changes.shcc == '') {
            T.notify('Mã số cán bộ bị trống');
            this.shcc.focus();
        } else {
            this.state.id ? this.props.update(this.state.id, changes, this.hide) : this.props.create(changes, this.hide);
        }
    }

    render = () => {
        const readOnly = this.props.readOnly;
        return this.renderModal({
            title: this.state.shcc ? 'Cập nhật quá trình khen thưởng cá nhân' : 'Tạo mới quá trình khen thưởng cá nhân',
            size: 'large',
            body: <div className='row'>
                <FormSelect className='col-md-12' ref={e => this.shcc = e} label='Mã số cán bộ' data={this.staffTable} readOnly={readOnly} />
                <FormTextBox className='col-md-4' ref={e => this.namDatDuoc = e} label='Năm đạt được (yyyy)' type='year' readOnly={readOnly} />
                <FormSelect className='col-md-4' ref={e => this.maThanhTich = e} label='Thành tích' data={this.thanhTichTable} readOnly={readOnly} /> 
                <FormSelect className='col-md-4' ref={e => this.maChuThich = e} label='Chú thích' data={this.chuThichTable} readOnly={readOnly} />
            </div>
        });
    }
}

class QtKhenThuongCaNhan extends AdminPage {
    componentDidMount() {
        T.ready('/user/tccb', () => {
            T.onSearch = (searchText) => this.props.getQtKhenThuongCaNhanPage(undefined, undefined, searchText || '');
            T.showSearchBox();
            this.props.getQtKhenThuongCaNhanPage();
        });
    }

    showModal = (e) => {
        e.preventDefault();
        this.modal.show();
    }

    delete = (e, item) => {
        T.confirm('Xóa chức vụ', 'Bạn có chắc bạn muốn xóa khen thưởng này?', 'warning', true, isConfirm => {
            isConfirm && this.props.deleteQtKhenThuongCaNhan(item.id, error => {
                if (error) T.notify(error.message ? error.message : 'Xoá khen thưởng bị lỗi!', 'danger');
                else T.alert('Xoá khen thưởng thành công!', 'success', false, 800);
            });
        });
        e.preventDefault();
    }

    render() {
        const currentPermissions = this.props.system && this.props.system.user && this.props.system.user.permissions ? this.props.system.user.permissions : [],
            permission = this.getUserPermission('qtKhenThuongCaNhan', ['read', 'write', 'delete']);
        let { pageNumber, pageSize, pageTotal, totalItem, pageCondition, list } = this.props.qtKhenThuongCaNhan && this.props.qtKhenThuongCaNhan.page ?
            this.props.qtKhenThuongCaNhan.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, list };
        let table = 'Không có danh sách!';
        if (list && list.length > 0) {
            table = renderTable({
                getDataSource: () => list, stickyHead: false,
                renderHead: () => (
                    <tr>
                        <th style={{ width: 'auto', textAlign: 'right' }}>#</th>
                        <th style={{ width: '50%', whiteSpace: 'nowrap' }}>Cán bộ</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Năm đạt được</th>
                        <th style={{ width: '50%', whiteSpace: 'nowrap' }}>Thành tích</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Chú thích</th>
                        <th style={{ width: 'auto', textAlign: 'center' }}>Thao tác</th>
                    </tr>
                ),
                renderRow: (item, index) => (
                    <tr key={index}>
                        <TableCell type='text' style={{textAlign:'right'}} content={index + 1} />
                        <TableCell type='link' onClick = {() => this.modal.show(item)} style={{ whiteSpace: 'nowrap' }} content={(
                            <>
                                <span>{item.ho + ' ' + item.ten}</span><br />
                                {item.shcc}
                            </>
                        )}
                        />
                        <TableCell type='text' content={(
                            <>
                                20{item.namDatDuoc}
                            </>
                        )}
                        />
                        <TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={(
                            <>
                                {item.tenThanhTich}
                            </>
                        )}
                        />
                        <TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={(
                            <>
                                {item.tenChuThich}
                            </>
                        )}
                        />
                        <TableCell type='buttons' style={{ textAlign: 'center' }} content={item} permission={permission}
                            onEdit={() => this.modal.show(item)} onDelete={this.delete} />
                    </tr>
                )
            });
        }

        return this.renderPage({
            icon: 'fa fa-list-alt',
            title: 'Quá trình khen thưởng cá nhân',
            breadcrumb: [
                <Link key={0} to='/user/tccb'>Tổ chức cán bộ</Link>,
                'Quá trình khen thưởng cá nhân'
            ],
            content: <>
                <div className='tile'>{table}</div>
                <Pagination style={{ marginLeft: '70px' }} {...{ pageNumber, pageSize, pageTotal, totalItem, pageCondition }}
                    getPage={this.props.getQtKhenThuongCaNhanPage} />
                <EditModal ref={e => this.modal = e} permission={permission}
                    create={this.props.createQtKhenThuongCaNhan} update={this.props.updateQtKhenThuongCaNhan}
                    getThanhTich={this.props.getDmKhenThuongKyHieuAll} permissions={currentPermissions}
                    getChuThich={this.props.getDmKhenThuongChuThichAll}
                    getStaff={this.props.getStaffAll} />
            </>,
            backRoute: '/user/tccb',
            onCreate: permission && permission.write ? (e) => this.showModal(e) : null,
        });
    }
}

const mapStateToProps = state => ({ system: state.system, qtKhenThuongCaNhan: state.qtKhenThuongCaNhan });
const mapActionsToProps = {
    getQtKhenThuongCaNhanAll, getQtKhenThuongCaNhanPage, deleteQtKhenThuongCaNhan, createQtKhenThuongCaNhan,
    updateQtKhenThuongCaNhan, getStaffAll, getDmKhenThuongKyHieuAll, getDmKhenThuongChuThichAll, 
};
export default connect(mapStateToProps, mapActionsToProps)(QtKhenThuongCaNhan);

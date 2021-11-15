import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { AdminPage, TableCell, renderTable } from 'view/component/AdminPage';
import Pagination from 'view/component/Pagination';
import { getStaffAll } from 'modules/mdTccb/tccbCanBo/redux';
import { getdmLoaiHopDongAll } from 'modules/mdDanhMuc/dmLoaiHopDong/redux';
import {
    getTchcCanBoHopDongDvtlTnAll, updateTchcCanBoHopDongDvtlTn,
    deleteTchcCanBoHopDongDvtlTn
} from 'modules/mdTccb/tchcCanBoHopDongDvtlTn/redux';
import { getDmDonViAll } from 'modules/mdDanhMuc/dmDonVi/redux';
import { getDmNgachCdnnAll } from 'modules/mdDanhMuc/dmNgachCdnn/redux';
import {
    getTchcHopDongDvtlTnPage, getTchcHopDongDvtlTnAll, updateTchcHopDongDvtlTn,
    deleteTchcHopDongDvtlTn, createTchcHopDongDvtlTn
} from './redux';

class TchcHopDongDvtlTn extends AdminPage {
    typeContract = {};
    hiredStaff = {};

    componentDidMount() {
        this.props.getTchcCanBoHopDongDvtlTnAll(items => {
            if (items) {
                this.hiredStaff = {};
                items.forEach(item => {
                    this.hiredStaff[item.shcc] = item.ho + ' ' + item.ten;
                });
            }
        });
        this.props.getdmLoaiHopDongAll(items => {
            if (items) {
                this.typeContract = {};
                items.forEach(item => {
                    if (item.kichHoat) {
                        this.typeContract[item.ma] = item.ten;
                    }
                });
            }
        });

        T.ready('/user/tccb', () => {
            T.onSearch = (searchText) => this.props.getTchcHopDongDvtlTnPage(undefined, undefined, searchText || '');
            T.showSearchBox();
            this.props.getTchcHopDongDvtlTnPage();
        });
    }

    check = (nguoiDuocThue, ma, hieuLucHopDongDelete) => {
        let max_hieuLucHopDong = 0, max_ma = 0, max_kieuHopDong = '';
        this.props.getTchcHopDongDvtlTnAll(items => {
            items.forEach(item => {
                if (item.nguoiDuocThue == nguoiDuocThue && item.ma != ma) {
                    if (item.hieuLucHopDong > max_hieuLucHopDong) {
                        max_hieuLucHopDong = item.hieuLucHopDong;
                        max_ma = item.ma;
                        max_kieuHopDong = item.kieuHopDong;
                    }
                }
            });
            if (max_ma) {
                if (max_hieuLucHopDong < hieuLucHopDongDelete) {
                    this.props.updateTchcCanBoHopDongDvtlTn(nguoiDuocThue, {
                        'hopDongCanBoNgay': max_hieuLucHopDong,
                        'hopDongCanBo': max_kieuHopDong
                    }, error => {
                        if (error) T.notify(error.message ? error.message : `Cập nhân cán bộ hợp đồng ${nguoiDuocThue} bị lỗi!`, 'danger');
                        else T.alert(`Cập nhật cán bộ hợp đồng ${nguoiDuocThue} thành công!`, 'success', false, 800);
                    });
                }
            } else {
                T.confirm('Xóa cán bộ hợp đồng', `Cán bộ ${nguoiDuocThue} không còn hợp đồng. Bạn có chắc bạn muốn xóa cán bộ này?`, 'warning', true, isConfirm => {
                    isConfirm && this.props.deleteTchcCanBoHopDongDvtlTn(nguoiDuocThue, error => {
                        if (error) T.notify(error.message ? error.message : `Xoá cán bộ hợp đồng ${nguoiDuocThue} bị lỗi!`, 'danger');
                        else T.alert(`Xoá cán bộ hợp đồng ${nguoiDuocThue} thành công!`, 'success', false, 800);
                    });
                });
            }
        });

    }

    delete = (e, item) => {
        T.confirm('Xóa hợp đồng', `Bạn có chắc bạn muốn xóa hợp đồng ${item.soHopDong ? `<b>${item.soHopDong}</b>` : 'này'}?`, 'warning', true, isConfirm => {
            isConfirm && this.props.deleteTchcHopDongDvtlTn(item.ma, error => {
                this.check(item.nguoiDuocThue, item.ma, item.hieuLucHopDong);
                if (error) T.notify(error.message ? error.message : `Xoá hợp đồng ${item.ten} bị lỗi!`, 'danger');
                else T.alert(`Xoá hợp đồng ${item.ten} thành công!`, 'success', false, 800);
            });
        });
        e.preventDefault();
    }

    render() {
        const currentPermissions = this.props.system && this.props.system.user && this.props.system.user.permissions ? this.props.system.user.permissions : [],
            permission = this.getUserPermission('tchcHopDongDvtlTn', ['read', 'write', 'delete']),
            permissionWrite = currentPermissions.includes('tchcHopDongDvtlTn:write');
        let { pageNumber, pageSize, pageTotal, totalItem, pageCondition, list } = this.props.tchcHopDongDvtlTn && this.props.tchcHopDongDvtlTn.page ?
            this.props.tchcHopDongDvtlTn.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, list };
        let table = 'Không có danh sách!';
        if (list && list.length > 0) {
            table = renderTable({
                getDataSource: () => list, stickyHead: false,
                renderHead: () => (
                    <tr>
                        <th style={{ width: '25%', textAlign: 'center' }}>Số hợp đồng</th>
                        <th style={{ width: '25%' }}>Tên người được thuê</th>
                        <th style={{ width: 'auto' }}>Kiểu hợp đồng</th>
                        <th style={{ width: 'auto' }}>Loại hợp đồng</th>
                        <th style={{ width: 'auto' }} >Ngày ký</th>
                        <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Thao tác</th>

                    </tr>
                ),
                renderRow: (item, index) => (
                    <tr key={index}>
                        <TableCell type='link' content={item.soHopDong} style={{ textAlign: 'center' }} url={`/user/hopDongDvtlTn/${item.ma}`} />
                        <TableCell type='text' content={this.hiredStaff && this.hiredStaff[item.nguoiDuocThue] ? this.hiredStaff[item.nguoiDuocThue] : ''} />
                        <TableCell type='text' content={item.kieuHopDong == 'DVTL' ? 'Đơn vị trả lương' : 'Trách nhiệm'} style={{ textAlign: 'center' }} />
                        <TableCell type='text' content={this.typeContract && this.typeContract[item.loaiHopDong] ? this.typeContract[item.loaiHopDong] : ''} />
                        <TableCell type='date' content={item.ngayKyHopDong} style={{ textAlign: 'center' }} dateFormat='dd/mm/yyyy' />
                        <TableCell type='buttons' style={{ textAlign: 'center' }} content={item} permission={permission}
                            onDelete={e => this.delete(e, item)} />
                    </tr>
                )
            });
        }

        return this.renderPage({
            icon: 'fa fa-list-alt',
            title: 'Hợp đồng Đơn vị trả lương - Trách nhiệm',
            breadcrumb: [
                <Link key={0} to='/user/tccb'>Tổ chức cán bộ</Link>,
                'Hợp đồng Đơn vị trả lương - Trách nhiệm'
            ],
            content: <>
                <div className='tile'>{table}</div>
                <Pagination style={{ marginLeft: '70px' }} {...{ pageNumber, pageSize, pageTotal, totalItem, pageCondition }}
                    getPage={this.props.getTchcHopDongDvtlTnPage} />
                {permissionWrite && (
                    <Link to='/user/hopDongDvtlTn/new' className='btn btn-primary btn-circle' style={{ position: 'fixed', right: '10px', bottom: '10px' }}>
                        <i className='fa fa-lg fa-plus' />
                    </Link>)}
            </>,
            backRoute: '/user/tccb',
            // onCreate: permission && permission.write ? (e) => this.showModal(e) : null,
        });
    }
}

const mapStateToProps = state => ({ system: state.system, tchcHopDongDvtlTn: state.tchcHopDongDvtlTn });
const mapActionsToProps = {
    getTchcHopDongDvtlTnPage, getTchcHopDongDvtlTnAll, updateTchcHopDongDvtlTn, getdmLoaiHopDongAll,
    deleteTchcHopDongDvtlTn, createTchcHopDongDvtlTn, getStaffAll, getTchcCanBoHopDongDvtlTnAll,
    getDmDonViAll, getDmNgachCdnnAll, updateTchcCanBoHopDongDvtlTn, deleteTchcCanBoHopDongDvtlTn
};
export default connect(mapStateToProps, mapActionsToProps)(TchcHopDongDvtlTn);
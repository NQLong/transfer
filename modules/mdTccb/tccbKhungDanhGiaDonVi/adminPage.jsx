import React from 'react';
import { connect } from 'react-redux';
import { getTccbKhungDanhGiaDonViPage, deleteTccbKhungDanhGiaDonVi } from './redux';
import { getDmDonViAll } from '../../mdDanhMuc/dmDonVi/redux';
import { Link } from 'react-router-dom';
import { AdminPage, renderTable, TableCell } from 'view/component/AdminPage';
import Pagination from 'view/component/Pagination';
import { Tooltip } from '@mui/material';

class TccbKhungDanhGiaDonViPage extends AdminPage {
    donViOptions = [];
    state = { donViFilter: '' }
    componentDidMount() {
        T.ready('/user/danh-gia', () => {
            T.clearSearchBox();
            T.showSearchBox();
            this.props.getDmDonViAll(items => {
                this.donViOptions = items;
                this.props.getTccbKhungDanhGiaDonViPage(undefined, undefined, { searchTerm: '' });
            });
            this.props.getTccbKhungDanhGiaDonViPage(undefined, undefined, { searchTerm: '' });
        });
    }

    delete = (e, item) => {
        e.preventDefault();
        T.confirm('Xóa khung đánh giá đơn vị', 'Bạn có chắc bạn muốn xóa khung đánh giá đơn vị này?', true, isConfirm =>
            isConfirm && this.props.deleteTccbKhungDanhGiaDonVi(item.id));
    }

    render() {
        const permission = this.getUserPermission('tccbKhungDanhGiaDonVi');
        const newPermission = (maDonVi) => {
            if (permission.write) return permission;
            const maDonViCuaUser = String(this.props.system?.user?.maDonVi) || '';
            return {
                read: permission.read,
                write: maDonVi && maDonViCuaUser && this.getCurrentPermissions().includes('tccbKhungDanhGiaDonVi:canBo:write') && maDonViCuaUser == maDonVi,
                delete: permission.delete,
            };
        };
        const { pageNumber, pageSize, pageTotal, totalItem, list } = this.props.tccbKhungDanhGiaDonVi && this.props.tccbKhungDanhGiaDonVi.page ?
            this.props.tccbKhungDanhGiaDonVi.page : {
                pageNumber: 1, pageSize: 200, pageTotal: 1, totalItem: 0, list: []
            };
        let table = renderTable({
            emptyTable: 'Không có dữ liệu cấu trúc khung đánh giá đơn vị',
            getDataSource: () => list,
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', textAlign: 'right', verticalAlign: 'middle' }}>STT</th>
                    <th style={{ width: '35%', textAlign: 'center', whiteSpace: 'nowrap' }}>Năm đánh giá</th>
                    <th style={{ width: '35%', textAlign: 'center', whiteSpace: 'nowrap' }}>Đơn vị</th>
                    <th style={{ width: '30%', textAlign: 'center', verticalAlign: 'middle' }} nowrap='true'>Thao tác</th>
                </tr>
            ),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell style={{ textAlign: 'right' }} content={index + 1} />
                    <TableCell type='link' url={`/user/danh-gia/cau-truc-khung-danh-gia-don-vi/${item.id}`} style={{ textAlign: 'center' }} content={item.nam} />
                    <TableCell style={{ textAlign: 'left' }} content={this.donViOptions.findIndex(donVi => donVi.ma == item.maDonVi) != -1 ? 
                        this.donViOptions[this.donViOptions.findIndex(donVi => donVi.ma == item.maDonVi)].ten : ''} />
                    <TableCell style={{ textAlign: 'center' }} type='buttons' content={item} permission={newPermission(item.maDonVi)}
                        onEdit={newPermission(item.maDonVi).write ? (e) => e.preventDefault() || this.props.history.push(`/user/danh-gia/cau-truc-khung-danh-gia-don-vi/${item.id}`) : null}
                        onDelete={this.delete}
                    >
                        <Tooltip title='Sao chép' arrow>
                            <a className='btn btn-info' href='#' onClick={e => e.preventDefault() || permission.write ? this.props.history.push(`/user/danh-gia/cau-truc-khung-danh-gia-don-vi/new?id=${item.id}`) : T.notify('Vui lòng liên hệ người quản lý!', 'danger')}>
                                <i className='fa fa-lg fa-clone ' />
                            </a>
                        </Tooltip>
                    </TableCell>
                </tr>
            )
        });

        return this.renderPage({
            icon: 'fa fa-university',
            title: 'Cấu trúc khung đánh giá đơn vị',
            breadcrumb: [
                <Link key={0} to='/user/danh-gia'>Đánh giá</Link>,
                'Cấu trúc khung đánh giá đơn vị'
            ],
            content: <>
                <div className='tile'>{table}</div>
                <Pagination style={{ marginLeft: '70px' }} {...{ pageNumber, pageSize, pageTotal, totalItem }}
                    getPage={this.props.getTccbKhungDanhGiaDonViPage} />
            </>,
            backRoute: '/user/danh-gia',
            onCreate: permission.write ? (e) => e.preventDefault() || this.props.history.push('/user/danh-gia/cau-truc-khung-danh-gia-don-vi/new') : null
        });
    }
}

const mapStateToProps = state => ({ system: state.system, tccbKhungDanhGiaDonVi: state.danhGia.tccbKhungDanhGiaDonVi });
const mapActionsToProps = { getTccbKhungDanhGiaDonViPage, deleteTccbKhungDanhGiaDonVi, getDmDonViAll };
export default connect(mapStateToProps, mapActionsToProps)(TccbKhungDanhGiaDonViPage);
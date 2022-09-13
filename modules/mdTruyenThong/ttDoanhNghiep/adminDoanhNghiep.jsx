import React from 'react';
import { connect } from 'react-redux';
import { deleteDnDoanhNghiep, createDnDoanhNghiep, updateDnDoanhNghiep, getDnDoanhNghiepPage, getDnDoanhNghiep, approveDnDoanhNghiep } from './reduxDoanhNghiep';
import Pagination from 'view/component/Pagination';
import { Link } from 'react-router-dom';
import { renderTable, TableCell, AdminPage } from 'view/component/AdminPage';
class DoanhNghiepAdminPage extends AdminPage {
    state = { linhVucKinhDoanh: [], quocGia: [] }

    componentDidMount() {
        T.ready('/user/truyen-thong', () => {
            T.onSearch = (searchText) => this.props.getDnDoanhNghiepPage(undefined, undefined, searchText || '');
            T.showSearchBox();
            this.props.getDnDoanhNghiepPage(undefined, undefined, undefined, page => {
                T.setTextSearchBox(page.pageCondition || '');
            });
        });
    }

    changeActive = item => this.props.updateDnDoanhNghiep(item.id, { kichHoat: Number(!item.kichHoat) });

    changeActiveTrangTruong = item => this.props.updateDnDoanhNghiep(item.id, { kichHoatTrangTruong: Number(!item.kichHoatTrangTruong) });

    delete = (e, item) => {
        e.preventDefault();
        T.confirm('Xóa doanh nghiệp', 'Bạn có muốn xóa doanh nghiệp này không?', true, isConfirm => isConfirm && this.props.deleteDnDoanhNghiep(item.id));
    }

    render() {
        const permission = this.getUserPermission('dnDoanhNghiep', ['read', 'write', 'delete', 'manage']);
        if (permission.manage) permission.write = true;
        let { pageNumber, pageSize, pageTotal, totalItem, pageCondition, list } = this.props.dnDoanhNghiep && this.props.dnDoanhNghiep.page ?
            this.props.dnDoanhNghiep.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, pageCondition: {}, list: [] };
        const table = renderTable({
            getDataSource: () => list,
            emptyTable: 'Không có doanh nghiệp!',
            stickyHead: true,
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', textAlign: 'right' }}>#</th>
                    <th style={{ width: '70%' }}>Tên doanh nghiệp</th>
                    {permission.read && <th style={{ width: '30%' }}>Đơn vị phụ trách</th>}
                    <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Quốc gia</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Hình ảnh</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Kích hoạt</th>
                    {permission.read && <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Hiển thị website trường</th>}
                    <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Thao tác</th>
                </tr>
            ),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell style={{ textAlign: 'right' }} content={(pageNumber - 1) * pageSize + index + 1} />
                    <TableCell type='link' url={'/user/truyen-thong/doanh-nghiep/edit/' + item.id} style={{ color: item.confirm == 0 ? 'red' : '' }} content={(item.tenDayDu || '').viText()} />
                    {permission.read && <TableCell content={item.tenDonViPhuTrach} />}
                    <TableCell style={{ textAlign: 'center', whiteSpace: 'nowrap' }} content={item.tenQuocGia} />
                    <TableCell type='image' content={item.image || '/img/hcmussh.png'} />
                    <TableCell type='checkbox' content={item.kichHoat} permission={permission} onChanged={() => this.changeActive(item)} />
                    {permission.read && <TableCell type='checkbox' content={item.kichHoatTrangTruong} permission={permission} onChanged={() => this.changeActiveTrangTruong(item)} />}
                    <TableCell content={item} type='buttons' style={{ textAlign: 'center' }} permission={permission} onEdit={'/user/truyen-thong/doanh-nghiep/edit/' + item.id} onDelete={this.delete} />
                </tr>
            ),
        });

        return this.renderPage({
            icon: 'fa fa-university',
            title: 'Doanh nghiệp',
            breadcrumb: [
                <Link to='/user/truyen-thong' key={0}>Truyền thông & QHDN</Link>,
                'Doanh Nghiệp'
            ],
            content:
                <>
                    <div className='tile'>{table}</div>
                    <Pagination style={{ marginLeft: '70px' }} pageNumber={pageNumber} pageSize={pageSize} pageTotal={pageTotal} totalItem={totalItem} pageCondition={pageCondition} getPage={this.props.getDnDoanhNghiepPage} />
                </>,
            backRoute: '/user/truyen-thong',
            onCreate: permission.write ? (e) => e.preventDefault() || this.props.history.push('/user/truyen-thong/doanh-nghiep/edit/new') : null,
        });
    }
}

const mapStateToProps = state => ({ system: state.system, dnDoanhNghiep: state.doiNgoai.doanhNghiep });
const mapActionsToProps = { deleteDnDoanhNghiep, createDnDoanhNghiep, updateDnDoanhNghiep, getDnDoanhNghiepPage, getDnDoanhNghiep, approveDnDoanhNghiep };
export default connect(mapStateToProps, mapActionsToProps)(DoanhNghiepAdminPage);

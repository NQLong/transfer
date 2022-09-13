import React from 'react';
import { connect } from 'react-redux';
import { createDmDonVi, getDmDonViPage, updateDmDonVi, deleteDmDonVi } from 'modules/mdDanhMuc/dmDonVi/redux';
import { getDmLoaiDonViAll } from 'modules/mdDanhMuc/dmLoaiDonVi/redux';
import Pagination from 'view/component/Pagination';
import { Link } from 'react-router-dom';
import { AdminPage, TableCell, renderTable } from 'view/component/AdminPage';

class DmDonViPage extends AdminPage {
    componentDidMount() {
        T.ready('/user/category', () => {
            T.onSearch = (searchText) => this.props.getDmDonViPage(undefined, undefined, searchText || '');
            T.showSearchBox();
            this.props.getDmDonViPage();
        });
    }


    changeActive = item => this.props.updateDmDonVi(item.ma, { ma: item.ma, kichHoat: item.kichHoat ? 0 : 1 });

    delete = (e, item) => {
        e.preventDefault();
        T.confirm('Xóa danh mục đơn vị', 'Bạn có chắc bạn muốn xóa đơn vị này?', true, isConfirm =>
            isConfirm && this.props.deleteDmDonVi(item.ma));
    }

    render() {
        let { pageNumber, pageSize, pageTotal, totalItem, pageCondition, list } = this.props.danhSachDonVi && this.props.danhSachDonVi.page ?
            this.props.danhSachDonVi.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, list: null };
        list = list?.filter(item => item.kichHoat == 1 && item.maPl != '' && item.ma != 64 && item.ma != 61);
        let table = renderTable({
            emptyTable: 'Không có dữ liệu',
            getDataSource: () => list, stickyHead: false,
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto' }}>STT</th>
                    <th style={{ width: '50%', whiteSpace: 'nowrap' }}>Tên đơn vị</th>
                    <th style={{ width: '50%', whiteSpace: 'nowrap' }}>Tên tiếng Anh</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Phân loại</th>
                </tr>
            ),
            renderRow: (item, index) => {
                if (item.maPl == 1) {
                    let khoaBoMon = [16, 18].includes(item.ma) ? 'Bộ môn' : 'Khoa';
                    item.ten = khoaBoMon + ' ' + item.ten;
                }
                return (
                    <tr key={index}>
                        <TableCell style={{ textAlign: 'right' }} content={(pageNumber - 1) * pageSize + index + 1} />
                        <TableCell content={item.ten ? item.ten : ''} />
                        <TableCell content={item.tenTiengAnh ? item.tenTiengAnh : ''} />
                        <TableCell style={{ whiteSpace: 'nowrap' }} content={item.tenLoaiDonVi ? item.tenLoaiDonVi.normalizedName() : ''} />
                    </tr>
                );
            }
        });

        return this.renderPage({
            icon: 'fa fa-list-alt',
            title: 'Danh sách đơn vị',
            breadcrumb: [
                <Link key={0} to='/user/tccb'>Tổ chức cán bộ</Link>,
                'Danh sách đơn vị'
            ],
            content: <>
                <div className='tile'>{table}</div>
                <Pagination style={{ marginLeft: '70px' }} {...{ pageNumber, pageSize, pageTotal, totalItem, pageCondition }}
                    getPage={this.props.getDmDonViPage} />
            </>,
            backRoute: '/user/tccb',
        });
    }
}

const mapStateToProps = state => ({ system: state.system, danhSachDonVi: state.tccb.danhSachDonVi });
const mapActionsToProps = { getDmDonViPage, createDmDonVi, updateDmDonVi, deleteDmDonVi, getDmLoaiDonViAll };
export default connect(mapStateToProps, mapActionsToProps)(DmDonViPage);
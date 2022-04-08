import React from 'react';
import { connect } from 'react-redux';
import { getDtChuongTrinhDaoTaoPage, createDtChuongTrinhDaoTao, updateDtChuongTrinhDaoTao, deleteDtChuongTrinhDaoTao } from './redux';
import { Link } from 'react-router-dom';
import { AdminPage, renderTable, TableCell } from 'view/component/AdminPage';
import Pagination from 'view/component/Pagination';


class DtChuongTrinhDaoTaoPage extends AdminPage {
    componentDidMount() {
        T.ready('/user/pdt', () => {
            T.onSearch = (searchText) => this.props.getDtChuongTrinhDaoTaoPage(undefined, undefined, searchText || '');
            T.showSearchBox();
            this.props.getDtChuongTrinhDaoTaoPage();
        });
    }

    showModal = (e) => {
        e.preventDefault();
        this.modal.show();
    }

    changeActive = item => this.props.updateDtChuongTrinhDaoTao(item.id, { kichHoat: item.kichHoat == '1' ? '0' : '1' });

    delete = (e, item) => {
        e.preventDefault();
        T.confirm('Xóa chương trình đào tạo', 'Bạn có chắc bạn muốn xóa chương trình đào tạo này?', true, isConfirm =>
            isConfirm && this.props.deleteDtChuongTrinhDaoTao(item.id));
    }

    render() {
        const permission = this.getUserPermission('dtChuongTrinhDaoTao', ['read', 'write', 'delete']);
        const { pageNumber, pageSize, pageTotal, totalItem, pageCondition, list } = this.props.dtChuongTrinhDaoTao && this.props.dtChuongTrinhDaoTao.page ?
            this.props.dtChuongTrinhDaoTao.page : { pageNumber: 1, pageSize: 200, pageTotal: 1, totalItem: 0, list: [] };

        let table = renderTable({
            emptyTable: 'Không có dữ liệu chương trình đào tạo',
            getDataSource: () => list, stickyHead: false,
            renderHead: () => (
                <>
                    <tr>
                        <th rowSpan='2' style={{ width: 'auto', textAlign: 'right', verticalAlign: 'middle' }}>#</th>
                        <th rowSpan='2' style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap', verticalAlign: 'middle' }}>Mã học kỳ</th>
                        <th rowSpan='2' style={{ width: 'auto', textAlign: 'center', verticalAlign: 'middle' }}>Nhóm</th>
                        <th rowSpan='2' style={{ width: '50%', verticalAlign: 'middle' }}>Tên chương trình đào tạo</th>
                        <th rowSpan='2' style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap', verticalAlign: 'middle' }}>Số tín chỉ</th>
                        <th rowSpan='2' style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap', verticalAlign: 'middle' }}>Tổng số tiết</th>
                        <th colSpan='6' rowSpan='1' style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Số tiết
                        </th>
                        <th rowSpan='2' style={{ width: '50%', whiteSpace: 'nowrap', verticalAlign: 'middle' }}>Khoa/Bộ môn</th>
                        <th rowSpan='2' style={{ width: 'auto', textAlign: 'center', verticalAlign: 'middle' }} nowrap='true'>Thao tác</th>
                    </tr>
                    <tr>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>LT</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>TH</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>TT</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>TL</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>ĐA</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>LA</th>
                    </tr>
                </>),
            renderRow: (
                item, index) => (
                <tr key={index}>
                    <TableCell style={{ width: 'auto', textAlign: 'right' }} content={index + 1} />
                    <TableCell style={{ width: 'auto', textAlign: 'center' }} content={item.maHocKy} />
                    <TableCell style={{ width: 'auto', textAlign: 'center' }} content={'0' + item.nhom} />
                    <TableCell type='link' content={item.tenMonHoc} onClick={() => this.modal.show(item)} />
                    <TableCell style={{ width: 'auto', textAlign: 'center' }} content={item.soTinChi} />
                    <TableCell style={{ width: 'auto', textAlign: 'center' }} content={item.tongSoTiet} />
                    <TableCell type='number' style={{ textAlign: 'center' }} content={item.soTietLt} />
                    <TableCell type='number' style={{ textAlign: 'center' }} content={item.soTietTh} />
                    <TableCell type='number' style={{ textAlign: 'center' }} content={item.soTietTt} />
                    <TableCell type='number' style={{ textAlign: 'center' }} content={item.soTietTl} />
                    <TableCell type='number' style={{ textAlign: 'center' }} content={item.soTietDa} />
                    <TableCell type='number' style={{ textAlign: 'center' }} content={item.soTietLa} />
                    <TableCell style={{}} content={item.tenKhoaBoMon} />
                    <TableCell type='buttons' content={item} permission={permission}
                    />
                </tr>)
        });

        return this.renderPage({
            icon: 'fa fa-university',
            title: 'Chương trình đào tạo',
            breadcrumb: [
                <Link key={0} to='/user/pdt'>Đào tạo</Link>,
                'Chương trình đào tạo'
            ],
            content: <>
                <div className='tile'>{table}</div>
                <Pagination style={{ marginLeft: '70px' }} {...{ pageNumber, pageSize, pageTotal, totalItem, pageCondition }}
                    getPage={this.props.getDtChuongTrinhDaoTaoPage} />
            </>,
            backRoute: '/user/pdt',
            onCreate: permission.write ? (e) => e.preventDefault() || this.props.history.push('/user/pdt/chuong-trinh-dao-tao/new') : null
        });
    }
}

const mapStateToProps = state => ({ system: state.system, dtChuongTrinhDaoTao: state.daoTao.dtChuongTrinhDaoTao });
const mapActionsToProps = {  getDtChuongTrinhDaoTaoPage, createDtChuongTrinhDaoTao, updateDtChuongTrinhDaoTao, deleteDtChuongTrinhDaoTao };
export default connect(mapStateToProps, mapActionsToProps)(DtChuongTrinhDaoTaoPage);
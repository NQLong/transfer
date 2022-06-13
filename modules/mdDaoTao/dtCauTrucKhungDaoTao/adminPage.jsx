import React from 'react';
import { connect } from 'react-redux';
import { getDtCauTrucKhungDaoTaoPage } from './redux';
import { getDmDonViAll } from 'modules/mdDanhMuc/dmDonVi/redux';
import { Link } from 'react-router-dom';
import { AdminPage, renderTable, TableCell } from 'view/component/AdminPage';
import Pagination from 'view/component/Pagination';
import { Tooltip } from '@mui/material';


class DtCauTrucKhungDaoTaoPage extends AdminPage {
    state = { donViFilter: '' }
    componentDidMount() {
        T.ready('/user/dao-tao', () => {
            T.clearSearchBox();
            this.setState({ donViFilter: this.props.system.user.staff?.maDonVi });
            T.onSearch = (searchText) => this.props.getDtCauTrucKhungDaoTaoPage(undefined, undefined, {
                searchTerm: searchText || '',
            });
            T.showSearchBox();
            this.props.getDtCauTrucKhungDaoTaoPage(undefined, undefined, { searchTerm: '' });

        });
    }

    delete = (e, item) => {
        e.preventDefault();
        T.confirm('Xóa cấu trúc khung đào tạo', 'Bạn có chắc bạn muốn xóa cấu trúc khung đào tạo này?', true, isConfirm =>
            isConfirm && this.props.deleteDtCauTrucKhungDaoTao(item.id));
    }

    render() {
        const permission = this.getUserPermission('dtCauTrucKhungDaoTao');
        const { pageNumber, pageSize, pageTotal, totalItem, pageCondition, list } = this.props.dtCauTrucKhungDaoTao && this.props.dtCauTrucKhungDaoTao.page ?
            this.props.dtCauTrucKhungDaoTao.page : {
                pageNumber: 1, pageSize: 200, pageTotal: 1, totalItem: 0, list: [], pageCondition: {
                    searchTerm: '', donViFilter: this.state.donViFilter
                }
            };

        let table = renderTable({
            emptyTable: 'Không có dữ liệu cấu trúc khung đào tạo',
            getDataSource: () => list,
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', textAlign: 'right', verticalAlign: 'middle' }}>STT</th>
                    <th style={{ width: '100%', textAlign: 'center', whiteSpace: 'nowrap' }}>Năm đào tạo</th>
                    <th style={{ width: '100%', textAlign: 'center', whiteSpace: 'nowrap' }}>Bắt đầu đăng ký</th>
                    <th style={{ width: '100%', textAlign: 'center', whiteSpace: 'nowrap' }}>Kết thúc đăng ký</th>
                    <th style={{ width: 'auto', textAlign: 'center', verticalAlign: 'middle' }} nowrap='true'>Thao tác</th>
                </tr>
            ),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell style={{ textAlign: 'right' }} content={index + 1} />
                    <TableCell style={{ textAlign: 'center' }} content={item.namDaoTao} />
                    <TableCell type='date' dateFormat='dd/mm/yyyy' style={{ textAlign: 'center' }} content={item.batDauDangKy} />
                    <TableCell type='date' dateFormat='dd/mm/yyyy' style={{ textAlign: 'center' }} content={item.ketThucDangKy} />
                    <TableCell style={{ textAlign: 'center' }} type='buttons' content={item} permission={permission}
                        onEdit={permission.write ? (e) => e.preventDefault() || this.props.history.push(`/user/dao-tao/cau-truc-khung-dao-tao/${item.id}`) : null}
                    >
                        <Tooltip title='Sao chép' arrow>
                            <a className='btn btn-info' href='#' onClick={e => e.preventDefault() || this.props.history.push(`/user/dao-tao/cau-truc-khung-dao-tao/new?id=${item.id}`)}>
                                <i className='fa fa-lg fa-clone ' />
                            </a>
                        </Tooltip>
                    </TableCell>
                </tr>
            )
        });

        return this.renderPage({
            icon: 'fa fa-university',
            title: 'Cấu trúc khung CT Đào tạo',
            breadcrumb: [
                <Link key={0} to='/user/dao-tao'>Đào tạo</Link>,
                'Cấu trúc khung CT Đào tạo'
            ],
            // header: permissionDaoTao.read && <FormSelect style={{ width: '300px', marginBottom: '0' }} placeholder='Danh sách khoa/bộ môn' ref={e => this.donVi = e} onChange={value => {
            //     T.clearSearchBox();
            //     this.setState({ donViFilter: value ? value.id : '' });
            //     this.props.getDtCauTrucKhungDaoTaoPage(undefined, undefined, {
            //         searchTerm: '',
            //         donViFilter: value && value.id
            //     });
            // }} data={SelectAdapter_DmDonViFaculty_V2} allowClear={true} />,
            content: <>
                <div className='tile'>{table}</div>
                <Pagination style={{ marginLeft: '70px' }} {...{ pageNumber, pageSize, pageTotal, totalItem, pageCondition }}
                    getPage={this.props.getDtCauTrucKhungDaoTaoPage} />
            </>,
            backRoute: '/user/dao-tao',
            onCreate: permission.write ? (e) => e.preventDefault() || this.props.history.push('/user/dao-tao/cau-truc-khung-dao-tao/new') : null
        });
    }
}

const mapStateToProps = state => ({ system: state.system, dtCauTrucKhungDaoTao: state.daoTao.dtCauTrucKhungDaoTao });
const mapActionsToProps = { getDtCauTrucKhungDaoTaoPage, getDmDonViAll };
export default connect(mapStateToProps, mapActionsToProps)(DtCauTrucKhungDaoTaoPage);
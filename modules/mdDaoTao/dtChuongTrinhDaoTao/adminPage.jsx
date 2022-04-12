import React from 'react';
import { connect } from 'react-redux';
import { getDtChuongTrinhDaoTaoPage } from './redux';
import { getDmDonViAll, SelectAdapter_DmDonViFaculty_V2 } from 'modules/mdDanhMuc/dmDonVi/redux';
import { Link } from 'react-router-dom';
import { AdminPage, FormSelect, renderTable, TableCell } from 'view/component/AdminPage';
import Pagination from 'view/component/Pagination';


class DtChuongTrinhDaoTaoPage extends AdminPage {
    state = { donViFilter: '' }
    componentDidMount() {
        T.ready('/user/dao-tao', () => {
            T.clearSearchBox();
            this.setState({ donViFilter: this.props.system.user.staff?.maDonVi });
            T.onSearch = (searchText) => this.props.getDtChuongTrinhDaoTaoPage(undefined, undefined, {
                searchTerm: searchText || '',
            });
            T.showSearchBox();
            this.props.getDtChuongTrinhDaoTaoPage(undefined, undefined, { searchTerm: '' });

        });
    }

    changeActive = item => this.props.updateDtChuongTrinhDaoTao(item.id, { kichHoat: item.kichHoat == '1' ? '0' : '1' });

    delete = (e, item) => {
        e.preventDefault();
        T.confirm('Xóa chương trình đào tạo', 'Bạn có chắc bạn muốn xóa chương trình đào tạo này?', true, isConfirm =>
            isConfirm && this.props.deleteDtChuongTrinhDaoTao(item.id));
    }

    render() {
        const permissionDaoTao = this.getUserPermission('dtChuongTrinhDaoTao', ['read', 'write', 'delete', 'manage']);
        let permission = {
            write: permissionDaoTao.write || permissionDaoTao.manage,
            delete: permissionDaoTao.delete || permissionDaoTao.manage
        };
        const { pageNumber, pageSize, pageTotal, totalItem, pageCondition, list } = this.props.dtChuongTrinhDaoTao && this.props.dtChuongTrinhDaoTao.page ?
            this.props.dtChuongTrinhDaoTao.page : {
                pageNumber: 1, pageSize: 200, pageTotal: 1, totalItem: 0, list: [], pageCondition: {
                    searchTerm: '', donViFilter: this.state.donViFilter
                }
            };

        let table = renderTable({
            emptyTable: 'Không có dữ liệu chương trình đào tạo',
            getDataSource: () => list,
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', textAlign: 'right', verticalAlign: 'middle' }}>#</th>
                    <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap', verticalAlign: 'middle' }}>Năm đào tạo</th>
                    <th style={{ width: '100%', whiteSpace: 'nowrap', verticalAlign: 'middle' }}>Khoa/Bộ môn</th>
                    <th style={{ width: 'auto', textAlign: 'center', verticalAlign: 'middle' }} nowrap='true'>Thao tác</th>
                </tr>
            ),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell style={{ width: 'auto', textAlign: 'right' }} content={index + 1} />
                    <TableCell style={{ width: 'auto', textAlign: 'center' }} content={item.namDaoTao} />
                    <TableCell content={item.ten} />
                    <TableCell type='buttons' content={item} permission={permission} onEdit={permission.write ? (e) => e.preventDefault() || this.props.history.push(`/user/dao-tao/chuong-trinh-dao-tao/${item.id}`) : null} />
                </tr>
            )
        });

        return this.renderPage({
            icon: 'fa fa-university',
            title: 'Chương trình đào tạo',
            breadcrumb: [
                <Link key={0} to='/user/dao-tao'>Đào tạo</Link>,
                'Chương trình đào tạo'
            ],
            header: permissionDaoTao.read && <FormSelect style={{ width: '300px', marginBottom: '0' }} placeholder='Danh sách khoa/bộ môn' ref={e => this.donVi = e} onChange={value => {
                T.clearSearchBox();
                this.setState({ donViFilter: value ? value.id : '' });
                this.props.getDtChuongTrinhDaoTaoPage(undefined, undefined, {
                    searchTerm: '',
                    donViFilter: value && value.id
                });
            }} data={SelectAdapter_DmDonViFaculty_V2} allowClear={true} />,
            content: <>
                <div className='tile'>{table}</div>
                <Pagination style={{ marginLeft: '70px' }} {...{ pageNumber, pageSize, pageTotal, totalItem, pageCondition }}
                    getPage={this.props.getDtChuongTrinhDaoTaoPage} />
            </>,
            backRoute: '/user/dao-tao',
            onCreate: permission.write ? (e) => e.preventDefault() || this.props.history.push('/user/dao-tao/chuong-trinh-dao-tao/new') : null
        });
    }
}

const mapStateToProps = state => ({ system: state.system, dtChuongTrinhDaoTao: state.daoTao.dtChuongTrinhDaoTao });
const mapActionsToProps = { getDtChuongTrinhDaoTaoPage, getDmDonViAll };
export default connect(mapStateToProps, mapActionsToProps)(DtChuongTrinhDaoTaoPage);
import { SelectAdapter_DmDonViFaculty_V2 } from 'modules/mdDanhMuc/dmDonVi/redux';
import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { AdminPage, FormSelect, renderTable, TableCell } from 'view/component/AdminPage';
import Pagination from 'view/component/Pagination';
import { getDtDangKyMoMonPage } from './redux';
class DtDangKyMoMonPage extends AdminPage {
    state = { donViFilter: '' }
    componentDidMount() {
        T.ready('/user/dao-tao', () => {
            T.clearSearchBox();
            this.setState({ donViFilter: this.props.system.user.staff?.maDonVi });
            T.onSearch = (searchText) => this.props.getDmMonHocPage(undefined, undefined, {
                searchTerm: searchText || '',
            });
            T.showSearchBox();
            this.props.getDtDangKyMoMonPage(undefined, undefined, {
                searchTerm: '',
            });
        });
    }

    render() {
        let permissionDaoTao = this.getUserPermission('dtDangKyMoMon', ['read', 'write', 'delete', 'manage']);
        let permission = {
            write: permissionDaoTao.write || permissionDaoTao.manage,
            delete: permissionDaoTao.delete || permissionDaoTao.manage
        };
        const { pageNumber, pageSize, pageTotal, totalItem, pageCondition, list } = this.props.dtDangKyMoMon && this.props.dtDangKyMoMon.page ?
            this.props.dtDangKyMoMon.page : {
                pageNumber: 1, pageSize: 50, pageTotal: 1, pageCondition: {
                    searchTerm: '', donViFilter: this.state.donViFilter
                }, totalItem: 0, list: []
            };

        let table = renderTable({
            getDataSource: () => list,
            stickyHead: false,
            emptyTable: 'Chưa có dữ liệu',
            renderHead: () => (<>
                <tr>
                    <th style={{ width: 'auto', textAlign: 'right', whiteSpace: 'nowrap' }}>#</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Khoa, bộ môn</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Học kỳ</th>
                    <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>Năm học</th>
                    <th style={{ width: '50%', textAlign: 'center', whiteSpace: 'nowrap' }}>Thời gian gửi đăng ký</th>
                    <th style={{ width: '50%', textAlign: 'center', whiteSpace: 'nowrap' }}>Ghi chú</th>
                    <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>Thao tác</th>
                </tr>
            </>),
            renderRow: (item, index) => (
                <tr key={item}>
                    <TableCell style={{ textAlign: 'right', whiteSpace: 'nowrap' }} content={(pageNumber - 1) * pageSize + index + 1} />
                    <TableCell contentClassName='multiple-lines-4' content={item.tenKhoaBoMon} />
                    <TableCell content={'HK' + item.hocKy} />
                    <TableCell style={{ textAlign: 'center' }} content={item.namHoc} />
                    <TableCell type='date' style={{ textAlign: 'center' }} content={item.thoiGian} />
                    <TableCell contentClassName='multiple-lines-4' content={item.ghiChu} />
                    <TableCell type='buttons' style={{ textAlign: 'center' }} content={item} permission={permission}
                        onEdit={() => this.props.history.push(`/user/dao-tao/dang-ky-mo-mon/${item.id}`)} //TODO: Đăng ký mở môn theo CTDT
                    />
                </tr>)
        });
        return this.renderPage({
            title: 'Danh sách các đợt mở môn học trong học kỳ',
            icon: 'fa fa-paper-plane-o',
            breadcrumb: [
                <Link key={0} to='/user/dao-tao'>Đào tạo</Link>,
                'Danh sách đợt mở môn học'
            ],
            header: permissionDaoTao.read && <FormSelect style={{ width: '300px', marginBottom: '0' }} placeholder='Danh sách khoa/bộ môn' ref={e => this.donVi = e} onChange={value => {
                T.clearSearchBox();
                this.setState({ donViFilter: value ? value.id : '' });
                this.props.getDtDangKyMoMonPage(undefined, undefined, {
                    searchTerm: '',
                    donViFilter: value && value.id
                });
            }} data={SelectAdapter_DmDonViFaculty_V2} allowClear={true} />,
            content: <>
                <div className='tile'>{table}</div>
                <Pagination style={{ marginLeft: '70px' }} {...{ pageNumber, pageSize, pageTotal, totalItem, pageCondition }}
                    getPage={this.props.getDtDangKyMoMonPage} />
            </>,
            backRoute: '/user/dao-tao',
            onCreate: permission.write ? ((e) => e.preventDefault() || this.props.history.push('/user/dao-tao/dang-ky-mo-mon/new')) : null,
            //TODO: Đăng ký mở môn theo CTDT

        });
    }
}

const mapStateToProps = state => ({ system: state.system, dtDangKyMoMon: state.daoTao.dtDangKyMoMon });
const mapActionsToProps = { getDtDangKyMoMonPage };
export default connect(mapStateToProps, mapActionsToProps)(DtDangKyMoMonPage);

import React from 'react';
import { connect } from 'react-redux';
import { PageName, getStaffPage, deleteStaff } from './redux';
import Pagination, { OverlayLoading } from 'view/component/Pagination';
import { Link } from 'react-router-dom';
import { AdminPage, TableCell, renderTable, FormSelect } from 'view/component/AdminPage';
import { SelectAdapter_DmDonVi } from 'modules/mdDanhMuc/dmDonVi/redux';

class StaffPage extends AdminPage {
    state = { searching: false, filter: {} };

    componentDidMount() {
        T.ready('/user/tccb', () => {
            T.onSearch = (searchText) => this.getPage(undefined, undefined, searchText || '');
            // T.showSearchBox();
            T.showSearchBox(() => {
                this.maDonVi?.value('');
                setTimeout(() => this.changeAdvancedSearch(), 50);
                setTimeout(() => this.showAdvanceSearch(), 1000);
            });

            this.changeAdvancedSearch(true);
        });
    }

    changeAdvancedSearch = (isInitial = false) => {
        let { pageNumber, pageSize, pageCondition } = this.props && this.props.staff && this.props.staff.page ? this.props.staff.page : { pageNumber: 1, pageSize: 50, pageCondition: '' };

        const maDonVi = this.maDonVi?.value() || '';
        const pageFilter = isInitial ? null : { maDonVi };
        this.setState({ filter: pageFilter });
        this.getPage(pageNumber, pageSize, pageCondition, (page) => {
            if (isInitial) {
                // Initial
                const filter = page.filter || {};
                this.setState({ filter: !$.isEmptyObject(filter) ? filter : pageFilter });
                T.setTextSearchBox(pageCondition || '');
                this.maDonVi?.value(filter.maDonVi);
                if (!$.isEmptyObject(filter) && filter && (filter.maDonVi)) this.showAdvanceSearch();
            }
        });
    }

    getPage = (pageN, pageS, pageC, done) => {
        this.props.getStaffPage(pageN, pageS, pageC, this.state.filter, done);
    }

    delete = (e, item) => {
        e.preventDefault();
        T.confirm('Cán bộ', 'Bạn có chắc bạn muốn xóa cán bộ này?', 'warning', true, isConfirm =>
            isConfirm && this.props.deleteStaff(item.shcc));
    };

    changeActive = item => this.props.updateStaff(item.shcc, { kichHoat: item.kichHoat == 1 ? 0 : 1 });

    create = (e) => {
        e.preventDefault();
        this.props.history.push('/user/staff/new');
    };

    render() {
        const currentPermissions = this.props.system && this.props.system.user && this.props.system.user.permissions ? this.props.system.user.permissions : [],
            permissionWrite = currentPermissions.includes('staff:write');
        const permission = this.getUserPermission('staff');
        let { pageNumber, pageSize, pageTotal, totalItem, pageCondition, list } = this.props.staff && this.props.staff.page ?
            this.props.staff.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, pageCondition: {}, list: [] };
        const table = renderTable({
            getDataSource: () => list, stickyHead: false,
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Mã số thẻ</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Họ & Tên</th>
                    <th style={{ width: '100%', whiteSpace: 'nowrap' }}>Email</th>
                    <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>Thao tác</th>
                </tr>),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell type='number' content={(pageNumber - 1) * pageSize + index + 1} />
                    <TableCell type='link' content={item.shcc} url={`/user/staff/${item.shcc}`} style={{ textAlign: 'center' }} />
                    <TableCell type='text' content={`${item.ho} ${item.ten}`} style={{ whiteSpace: 'nowrap' }} />
                    <TableCell type='text' content={item.email} />
                    <TableCell type='buttons' content={item} permission={permission} onEdit={`/user/staff/${item.shcc}`} onDelete={this.delete}></TableCell>
                </tr>)
        });

        return this.renderPage({
            icon: 'fa fa-users',
            title: 'Cán bộ',
            breadcrumb: [
                <Link key={0} to='/user/tccb'>Tổ chức cán bộ</Link>,
                'Cán bộ'
            ],
            advanceSearch: <>
                <div className='row'>
                    <FormSelect ref={e => this.maDonVi = e} className='col-12 col-md-12' label='Đơn vị' data={SelectAdapter_DmDonVi} onChange={() => this.changeAdvancedSearch()} multiple={false} allowClear={true} />
                </div>
            </>,
            content: <>
                <div className='tile'>
                    {!this.state.searching ? table : <OverlayLoading text='Đang tải..' />}
                    <Pagination style={{ marginLeft: '70px' }} name={PageName} pageNumber={pageNumber} pageSize={pageSize} pageTotal={pageTotal} totalItem={totalItem} pageCondition={pageCondition}
                        getPage={this.getPage} />
                    {permissionWrite && (
                        <Link to='/user/staff/item/upload' className='btn btn-success btn-circle' style={{ position: 'fixed', right: '70px', bottom: '10px' }} >
                            <i className='fa fa-lg fa-cloud-upload' />
                        </Link>)}
                </div>
            </>,
            backRoute: '/user/tccb',
            onCreate: permission ? e => this.create(e) : null
        });
    }
}

const mapStateToProps = state => ({ system: state.system, staff: state.staff });
const mapActionsToProps = { getStaffPage, deleteStaff };
export default connect(mapStateToProps, mapActionsToProps)(StaffPage);
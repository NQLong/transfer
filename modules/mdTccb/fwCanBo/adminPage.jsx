import React from 'react';
import { connect } from 'react-redux';
import { PageName, getStaffPage, deleteStaff } from './redux';
import Pagination, { OverlayLoading } from 'view/component/Pagination';
import AdminSearchBox from 'view/component/AdminSearchBox';
import { Link } from 'react-router-dom';
import { AdminPage, TableCell, renderTable } from 'view/component/AdminPage';

class StaffPage extends AdminPage {
    state = { searching: false };
    searchBox = React.createRef();

    componentDidMount() {
        T.ready(() => this.searchBox.current.getPage());
    }

    delete = (e, item) => {
        e.preventDefault();
        T.confirm('Cán bộ', 'Bạn có chắc bạn muốn xóa cán bộ này?', 'warning', true, isConfirm =>
            isConfirm && this.props.deleteStaff(item.shcc));
    };

    changeActive = item => this.props.updateStaff(item.shcc, { kichHoat: item.kichHoat == 1 ? 0 : 1 });

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
                    <TableCell type='text' content={`${item.ho} ${item.ten}`} style={{ whiteSpace: 'nowrap' }}/>
                    <TableCell type='text' content={item.email} />
                    <TableCell type='buttons' content={item} permission={permission} onEdit={`/user/staff/${item.shcc}`} onDelete={this.delete}></TableCell>
                </tr>)
        });
        

        return (
            <main className='app-content'>
                <div className='app-title'>
                    <h1><i className='fa fa-users' /> Cán bộ</h1>
                    <AdminSearchBox ref={this.searchBox} getPage={this.props.getStaffPage} setSearching={value => this.setState({ searching: value })} />
                </div>
                <div className='tile'>
                    {!this.state.searching ? table : <OverlayLoading text='Đang tải..' />}
                    <Pagination name={PageName} pageNumber={pageNumber} pageSize={pageSize} pageTotal={pageTotal} totalItem={totalItem} pageCondition={pageCondition}
                        getPage={this.searchBox.current && this.searchBox.current.getPage} />
                    {permissionWrite && (
                        <Link to='/user/staff/new' className='btn btn-primary btn-circle' style={{ position: 'fixed', right: '10px', bottom: '10px' }}>
                            <i className='fa fa-lg fa-plus' />
                        </Link>)}
                    {permissionWrite && (
                        <Link to='/user/staff/item/upload' className='btn btn-success btn-circle' style={{ position: 'fixed', right: '70px', bottom: '10px' }} >
                            <i className='fa fa-lg fa-cloud-upload' />
                        </Link>)}
                </div>
            </main>
        );
    }
}

const mapStateToProps = state => ({ system: state.system, staff: state.staff });
const mapActionsToProps = { getStaffPage, deleteStaff };
export default connect(mapStateToProps, mapActionsToProps)(StaffPage);
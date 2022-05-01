import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { AdminPage, TableCell, renderTable, FormSelect } from 'view/component/AdminPage';
import { getNhanSuDonVi } from './redux';
import { getDmDonVi, SelectAdapter_DmDonViFilter } from 'modules/mdDanhMuc/dmDonVi/redux';
import { getDmChucVu } from 'modules/mdDanhMuc/dmChucVu/redux';
import AssignRoleModal from 'modules/_default/fwAssignRole/AssignRoleModal';

const CRUD = {
    'C': 'Tạo',
    'R': 'Đọc',
    'U': 'Cập nhật',
    'D': 'Xóa'
};

class CanBoTheoDonVi extends AdminPage {
    state = { tenDonVi: '', listStaffAll: [], listNhanSu: [], listDonViQuanLy: [], shcc: null };

    defaultCRUDRowStyle = (log) => ({
        whiteSpace: 'nowrap',
        textAlign: 'center',
        backgroundColor: log ? '#90EE90' : '#FFCCCC'
    })

    componentDidMount() {
        T.ready('/user', () => {
            let listDonViQuanLy = this.props.system && this.props.system.user.staff && this.props.system.user.staff.donViQuanLy ? this.props.system.user.staff.donViQuanLy : [];
            this.getData(listDonViQuanLy.filter(item => item.isManager).map(item => item.maDonVi));
        });
    }

    getData = (listDonVi, maDonVi = listDonVi[0]) => {
        this.setState({ listDonVi, maDonVi });
        this.props.getNhanSuDonVi(listDonVi, items => {
            this.setState({
                listDonViQuanLy: listDonVi,
                listNhanSuAll: items.filter(item => !item.ngayNghi).groupBy('maDonVi')
            }, () => {
                this.setData(this.state.listNhanSuAll, maDonVi);
            });
        });
    }

    setData = (data, maDonVi) => {
        this.donVi.value(maDonVi);
        this.setState({ listNhanSu: data[maDonVi] });
    }

    normalHeader = () => (
        <tr>
            <th style={{ width: 'auto', textAlign: 'right' }}>#</th>
            <th style={{ width: '30%', whiteSpace: 'nowrap' }}>Họ và tên</th>
            <th style={{ width: '70%', whiteSpace: 'nowrap' }}>Email</th>
            <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Số điện thoại</th>
            <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Thao tác</th>
        </tr>
    );

    tccbHeader = () => (
        <>
            <tr>
                <th rowSpan={2} style={{ width: 'auto', textAlign: 'right' }}>#</th>
                <th rowSpan={2} style={{ width: '30%', whiteSpace: 'nowrap' }}>Họ và tên</th>
                <th rowSpan={2} style={{ width: '70%', whiteSpace: 'nowrap' }}>Email</th>
                <th rowSpan={2} style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Số điện thoại</th>
                <th colSpan={3} style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Thao tác hệ thống Tổ chức cán bộ</th>
                <th rowSpan={2} style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Thao tác</th>
            </tr>
            <tr>
                <th rowSpan={1} style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Thao tác</th>
                <th rowSpan={1} style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Quá trình</th>
                <th rowSpan={1} style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Thời điểm</th>
            </tr>
        </>
    );

    normalRows = (item, index) => {
        item.lastName = item.ho;
        item.firstName = item.ten;
        return <tr key={index}>
            <TableCell type='text' style={{ textAlign: 'right' }} content={index + 1} />
            <TableCell type='link' style={{ whiteSpace: 'nowrap' }} onClick={e => e.preventDefault() || this.assignRolesModal.show(item)} content={item.ho + ' ' + item.ten} />

            <TableCell type='text' style={{ whiteSpace: 'nowrap', fontStyle: 'italic' }} content={item.email} />
            <TableCell type='text' style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={item.dienThoaiCaNhan} />
            <TableCell type='buttons'>
                <a href='#' className='btn btn-sm btn-success' onClick={(e) => e.preventDefault() || this.assignRolesModal && this.assignRolesModal.show(item)} > <i className='fa fa-lg fa-plus' />&nbsp;Gán quyền</a>
            </TableCell >
        </tr >;
    }

    tccbRows = (item, index) => {
        item.lastName = item.ho;
        item.firstName = item.ten;
        return <tr key={index}>
            <TableCell type='text' style={{ textAlign: 'right' }} content={index + 1} />
            <TableCell type='link' style={{ whiteSpace: 'nowrap' }} onClick={e => e.preventDefault() || this.assignRolesModal.show(item)} content={item.ho + ' ' + item.ten} />
            <TableCell type='text' style={{ whiteSpace: 'nowrap', fontStyle: 'italic' }} content={item.email} />
            <TableCell type='text' style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={item.dienThoaiCaNhan} />
            <TableCell type='text' style={this.defaultCRUDRowStyle(item.tccbLog)} content={CRUD[item.tccbLog?.thaoTac] || ''} />
            <TableCell type='text' style={this.defaultCRUDRowStyle(item.tccbLog)} content={item.tccbLog?.quaTrinh || ''} />
            <TableCell type='date' dateFormat='HH:MM:ss dd/mm/yy' style={this.defaultCRUDRowStyle(item.tccbLog)} content={item.tccbLog?.ngay || null} />
            <TableCell type='buttons'>
                <a href='#' className='btn btn-sm btn-success' onClick={(e) => e.preventDefault() || this.assignRolesModal && this.assignRolesModal.show(item)}> <i className='fa fa-lg fa-plus' />&nbsp;Gán quyền</a>
            </TableCell>
        </tr>;
    }

    render() {
        const assignRolePermissions = this.getUserPermission('fwAssignRole', ['read', 'write']),
            daoTaoPermission = this.getCurrentPermissions().includes('faculty:login'),
            managerPermission = this.getUserPermission('manager', ['write']),
            congVanPermission = this.getUserPermission('hcth', ['manage']);
        let nhomRoles = ['ttDoanhNghiep'];
        daoTaoPermission && nhomRoles.push('daoTao');
        congVanPermission.manage && nhomRoles.push('quanLyCongVanDen', 'duyetCongVanDi');
        managerPermission.write && nhomRoles.push('quanLyCongVanPhong');
        const nguoiGan = this.props.system && this.props.system.user ? this.props.system.user : {};
        let table = renderTable({
            emptyTable: 'Đơn vị chưa có cán bộ',
            getDataSource: () => this.state.listNhanSu,
            stickyHead: false,
            renderHead: () => this.state.maDonVi ? (this.state.maDonVi == '30' ? this.tccbHeader() : this.normalHeader()) : this.normalHeader(),
            renderRow: (item, index) =>
                this.state.maDonVi ? ((this.state.maDonVi == '30') ? this.tccbRows(item, index) : this.normalRows(item, index)) : this.normalRows(item, index)
        });
        return this.renderPage({
            icon: 'fa fa-user-circle-o',
            header: <FormSelect style={{ width: '300px', marginBottom: '0' }} placeholder='Danh sách đơn vị quản lý' ref={e => this.donVi = e} onChange={value => this.getData(this.state.listDonVi, value.id)} data={SelectAdapter_DmDonViFilter(this.state.listDonViQuanLy)} minimumResultsForSearch={-1} />,
            title: 'Danh sách nhân sự thuộc đơn vị quản lý',
            breadcrumb: [
                <Link key={0} to='/user'>Trang cá nhân</Link>,
                'Danh sách nhân sự'
            ],
            content: <>
                <div className='tile'>{table}</div>
                {assignRolePermissions.read && <AssignRoleModal ref={e => this.assignRolesModal = e} nhomRole={nhomRoles} nguoiGan={nguoiGan} />}
            </>,
            backRoute: '/user'
        });
    }
}

const mapStateToProps = state => ({ system: state.system, canBoTheoDonVi: state.tccb.canBoTheoDonVi });
const mapActionsToProps = {
    getNhanSuDonVi, getDmDonVi, getDmChucVu
};
export default connect(mapStateToProps, mapActionsToProps)(CanBoTheoDonVi);
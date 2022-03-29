import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { AdminPage, TableCell, renderTable, FormSelect } from 'view/component/AdminPage';
import { getNhanSuDonVi } from './redux';
import { getStaffAll } from 'modules/mdTccb/tccbCanBo/redux';
import { getDmDonVi, SelectAdapter_DmDonViFilter } from 'modules/mdDanhMuc/dmDonVi/redux';
import { getDmChucVu } from 'modules/mdDanhMuc/dmChucVu/redux';
class CanBoTheoDonVi extends AdminPage {
    state = { tenDonVi: '', listStaffAll: [], listNhanSu: [], listDonViQuanLy: [], shcc: null };

    componentDidMount() {
        T.ready('/user', () => {
            let listDonViQuanLy = this.props.system.user.staff.donViQuanLy, shcc = this.props.system.user.staff.shcc;
            const { maDonVi = null } = this.props.system.user.staff.donViQuanLy[0];
            this.props.getNhanSuDonVi(maDonVi, items => {
                this.setState({ listDonViQuanLy: listDonViQuanLy.filter(item => item.isManager).map(item => item.maDonVi), shcc, listStaffAll: items.filter(item => !item.ngayNghi).groupBy('maDonVi') }, () => {
                    this.setData(this.state.listStaffAll, maDonVi);
                });
            });
        });
    }

    setData = (data, maDonVi) => {
        this.donVi.value(maDonVi);
        this.setState({ listNhanSu: data[maDonVi] });
    }

    render() {
        let table = renderTable({
            emptyTable: 'Đơn vị chưa có cán bộ',
            getDataSource: () => this.state.listNhanSu
            , stickyHead: false,
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', textAlign: 'right' }}>#</th>
                    <th style={{ width: '30%', whiteSpace: 'nowrap' }}>Họ và tên</th>
                    <th style={{ width: '70%', whiteSpace: 'nowrap' }}>Email</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Số điện thoại</th>
                    {/* Gán quyền xử lý công việc */}
                </tr>
            ),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell type='text' style={{ textAlign: 'right' }} content={index + 1} />
                    <TableCell type='link' style={{ whiteSpace: 'nowrap' }} content={
                        (item.ho + ' ' + item.ten)
                    } url={`tccb/staff/${item.shcc}`} />
                    <TableCell type='text' style={{ whiteSpace: 'nowrap', fontStyle: 'italic' }} content={item.email} />
                    <TableCell type='text' style={{ whiteSpace: 'nowrap', textAlign: 'left' }} content={item.dienThoaiCaNhan} />
                </tr>
            )
        });

        return this.renderPage({
            icon: 'fa fa-user-circle-o',
            header: <FormSelect style={{ width: '300px', marginBottom: '0' }} placeholder='Danh sách đơn vị quản lý' ref={e => this.donVi = e} onChange={value => this.setData(this.state.listStaffAll, value.id)} data={SelectAdapter_DmDonViFilter(this.state.listDonViQuanLy)
            } />,
            title: 'Danh sách nhân sự thuộc đơn vị quản lý',
            breadcrumb: [
                <Link key={0} to='/user'>Trang cá nhân</Link>,
                'Danh sách nhân sự'
            ],
            content: <>
                <div className='tile'>
                    {table}
                </div>
            </>,
            backRoute: '/user',
        });
    }
}

const mapStateToProps = state => ({ system: state.system, canBoTheoDonVi: state.tccb.canBoTheoDonVi });
const mapActionsToProps = {
    getNhanSuDonVi, getDmDonVi, getStaffAll, getDmChucVu
};
export default connect(mapStateToProps, mapActionsToProps)(CanBoTheoDonVi);
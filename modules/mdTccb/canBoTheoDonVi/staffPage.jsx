import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { AdminPage, TableCell, renderTable } from 'view/component/AdminPage';
import { getCanBoTheoDonViAll } from './redux';
import { getStaff } from 'modules/mdTccb/tccbCanBo/redux';
import { getDmDonVi } from 'modules/mdDanhMuc/dmDonVi/redux';
class CanBoTheoDonVi extends AdminPage {
    state = { tenDonVi: '' };

    componentDidMount() {
        T.ready('/user', () => {
            const { maDonVi } = this.props.system && this.props.system.user ? this.props.system.user.staff : { maDonVi: null };
            if (maDonVi) {
                this.props.getDmDonVi(maDonVi, donVi => this.setState({ tenDonVi: donVi.ten }));
                this.props.getCanBoTheoDonViAll(maDonVi);
            } else T.notify('Bạn không thuộc đơn vị nào', 'warning');
        });
    }

    render() {
        let list = this.props.canBoTheoDonVi ? this.props.canBoTheoDonVi.items : [];
        let table = renderTable({
            emptyTable: 'Đơn vị chưa có cán bộ',
            getDataSource: () => list, stickyHead: false,
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', textAlign: 'right' }}>#</th>
                    <th style={{ width: '30%', whiteSpace: 'nowrap' }}>Họ và tên</th>
                    <th style={{ width: '70%', whiteSpace: 'nowrap' }}>Email</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Số điện thoại</th>
                </tr>
            ),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell type='text' style={{ textAlign: 'right' }} content={index + 1} />
                    <TableCell type='link' style={{ whiteSpace: 'nowrap' }} content={(item.ho + ' ' + item.ten).normalizedName()} url={`tccb/staff/${item.shcc}`} />
                    <TableCell type='text' style={{ whiteSpace: 'nowrap', fontStyle: 'italic' }} content={item.email} />
                    <TableCell type='text' style={{ whiteSpace: 'nowrap', textAlign: 'left' }} content={item.dienThoaiCaNhan} />
                </tr>
            )
        });

        return this.renderPage({
            icon: 'fa fa-user-circle-o',
            title: 'Danh sách cán bộ thuộc đơn vị',
            subTitle: <span style={{ color: 'blue' }}>Đơn vị: {this.state.tenDonVi}</span>,
            breadcrumb: [
                <Link key={0} to='/user'>Trang cá nhân</Link>,
                'Danh sách cán bộ thuộc đơn vị'
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
    getCanBoTheoDonViAll, getStaff, getDmDonVi
};
export default connect(mapStateToProps, mapActionsToProps)(CanBoTheoDonVi);
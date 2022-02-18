import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { AdminPage, TableCell, renderTable } from 'view/component/AdminPage';
import { getCanBoTheoDonViAll } from './redux';
import { getStaff } from 'modules/mdTccb/tccbCanBo/redux';

class CanBoTheoDonVi extends AdminPage {
    state = {};

    componentDidMount() {
        T.ready('/user', () => {
            const { shcc } = this.props.system && this.props.system.user ? this.props.system.user : { shcc: '' };
            this.props.getStaff(shcc, (data) => {
                console.log(data);
                if (data.error) {
                    T.notify('Lấy thông tin cán bộ bị lỗi', 'warning');
                } else {
                    this.props.getCanBoTheoDonViAll(data.item.maDonVi);
                }
            });
        });
    }

    render() {
        let permission = this.getUserPermission('staff', ['login']);
        if (permission.login == true) {
            permission = {
                read: true
            };
        }
        const { isStaff, shcc } = this.props.system && this.props.system.user ? this.props.system.user : { isStaff: false, shcc: '' };
        const { firstName, lastName } = isStaff && this.props.system.user || { firstName: '', lastName: '' };
        const name = isStaff ? `${lastName} ${firstName} (${shcc})` : '';
        let list  = this.props.canBoTheoDonVi ? this.props.canBoTheoDonVi.items : [];
        console.log(list);
        let table = 'Không có danh sách!';
        if (list && list.length > 0) {
            table = renderTable({
                getDataSource: () => list, stickyHead: false,
                renderHead: () => (
                    <tr>
                        <th style={{ width: 'auto', textAlign: 'right' }}>#</th>
                        <th style={{ width: '100%', whiteSpace: 'nowrap' }}>Họ và tên</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Email</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Số điện thoại</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Số CMND/CCCD</th>
                    </tr>
                ),
                renderRow: (item, index) => (
                    <tr key={index}>
                        <TableCell type='text' style={{ textAlign: 'right' }} content={index + 1} />
                        <TableCell type='text' style={{whiteSpace: 'nowrap' }} content={item.ho + ' ' + item.ten} />
                        <TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={item.email} />
                        <TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={item.dienThoaiCaNhan} />
                        <TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={item.cmnd} />
                    </tr>
                )
            });
        }

        return this.renderPage({
            icon: 'fa fa-podcast',
            title: 'Cán bộ thuộc đơn vị',
            subTitle: <span style={{ color: 'blue' }}>Cán bộ: {name}</span>,
            breadcrumb: [
                <Link key={0} to='/user'>Trang cá nhân</Link>,
                'Thông tin cán bộ thuộc đơn vị'
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
    getCanBoTheoDonViAll, getStaff
};
export default connect(mapStateToProps, mapActionsToProps)(CanBoTheoDonVi);
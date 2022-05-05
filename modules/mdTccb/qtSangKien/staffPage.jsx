import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { AdminPage, renderTable, TableCell } from 'view/component/AdminPage';
import Pagination from 'view/component/Pagination';
import {
    getQtSangKienUserPage, deleteQtSangKienUserPage, createQtSangKienUserPage,
    updateQtSangKienUserPage
} from './redux';

class QtSangKien extends AdminPage {
    state = { filter: {} };

    componentDidMount() {
        T.ready('/user', () => {
            const { shcc } = this.props.system && this.props.system.user ? this.props.system.user : { shcc: '' };
            this.setState({ filter: { listShcc: shcc } });
            this.getPage();
        });
    }

    getPage = (pageN, pageS, pageC, done) => {
        this.props.getQtSangKienUserPage(pageN, pageS, pageC, this.state.filter, done);
    }

    groupPage = () => {
        this.getPage();
    }

    render() {
        let permission = this.getUserPermission('staff', ['login']);
        if (permission.login == true) {
            permission = {
                write: true,
                delete: true
            };
        }
        const { shcc, firstName, lastName } = this.props.system && this.props.system.user ? this.props.system.user : { shcc: '', firstName: '', lastName: '' };
        const name = `${lastName} ${firstName} (${shcc})`;
        let { pageNumber, pageSize, pageTotal, totalItem, pageCondition, list } = this.props.qtSangKien && this.props.qtSangKien.userPage ? this.props.qtSangKien.userPage : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, pageCondition: {}, list: [] };
        let table  = renderTable({
            emptyTable: 'Không có dữ liệu về sáng kiến',
                getDataSource: () => list, stickyHead: true,
                renderHead: () => (
                    <tr>
                        <th style={{ width: 'auto', textAlign: 'right' }}>#</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Mã số</th>
                        <th style={{ width: '100%', whiteSpace: 'nowrap' }}>Tên sáng kiến</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Số quyết định</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Cấp ảnh hưởng</th>
                    </tr>
                ),
                renderRow: (item, index) => (
                    <tr key={index}>
                        <TableCell type='text' style={{ textAlign: 'right' }} content={(pageNumber - 1) * pageSize + index + 1} />
                        <TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={(<b>{item.maSo || ''}</b>)} />  
                        <TableCell type='text' content={(<span style={{ padding: '10px' }}>{item.tenSangKien || ''}</span>)} />
                        <TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={(item.soQuyetDinh || '')} />
                        <TableCell type='text' content={(item.capAnhHuong == 1 ? 'Cấp bộ' : (item.capAnhHuong == 2 ? 'Cấp cơ sở': ''))} />
                    </tr>
                )
            });

        return this.renderPage({
            icon: 'fa fa-lightbulb-o',
            title: 'Danh sách sáng kiến',
            subTitle: <span style={{ color: 'blue' }}>Cán bộ: {name}</span>,
            breadcrumb: [
                <Link key={0} to='/user/tccb'>Tổ chức cán bộ</Link>,
                'Danh sách sáng kiến'
            ],
            content: <>
                <div className='tile'>
                    {table}
                </div>
                <Pagination style={{ marginLeft: '70px' }} {...{ pageNumber, pageSize, pageTotal, totalItem, pageCondition }}
                    getPage={this.getPage} />
            </>,
            backRoute: '/user',
        });
    }
} 

const mapStateToProps = state => ({ system: state.system, qtSangKien: state.tccb.qtSangKien });
const mapActionsToProps = {
    getQtSangKienUserPage, deleteQtSangKienUserPage, createQtSangKienUserPage,
    updateQtSangKienUserPage,
};
export default connect(mapStateToProps, mapActionsToProps)(QtSangKien);
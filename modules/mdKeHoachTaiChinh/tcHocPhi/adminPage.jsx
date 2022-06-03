import React from 'react';
import { connect } from 'react-redux';
import { AdminPage, renderTable, TableCell } from 'view/component/AdminPage';
import Pagination from 'view/component/Pagination';
import { getTcHocPhiPage } from './redux';
class TcHocPhiAdminPage extends AdminPage {
    componentDidMount() {
        T.ready('/user/finance/hoc-phi', () => {
            this.props.getTcHocPhiPage();
        });
    }
    render() {
        let permission = this.getUserPermission('tcHocPhi');
        let { pageNumber, pageSize, pageTotal, totalItem, pageCondition, list } = this.props.tcHocPhi && this.props.tcHocPhi.page ? this.props.tcHocPhi.page : {
            pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, list: null
        };

        let table = renderTable({
            getDataSource: () => list,
            stickyHead: true,
            header: 'thead-light',
            emptyTable: 'Chưa có dữ liệu học phí học kỳ hiện tại',
            renderHead: () => (<tr>
                <th style={{ width: 'auto', textAlign: 'right' }}>#</th>
                <th style={{ width: 'auto', textAlign: 'center' }}>Học kỳ</th>
                <th style={{ width: '80%', whiteSpace: 'nowrap' }}>Sinh viên</th>
                <th style={{ width: '10%', whiteSpace: 'nowrap' }}>Học phí (vnđ)</th>
                <th style={{ width: '10%', whiteSpace: 'nowrap' }}>Công nợ (vnđ)</th>
                <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Thao tác</th>
            </tr>),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell style={{ textAlign: 'right' }} content={(pageNumber - 1) * pageSize + index + 1} />
                    <TableCell style={{ textAlign: 'center', whiteSpace: 'nowrap' }} content={`${item.namHoc} - HK${item.hocKy}`} />
                    <TableCell type='link' style={{ whiteSpace: 'nowrap' }} content={<>{item.hoTenSinhVien} <br /> {item.mssv} </>} url={`/user/finance/hoc-phi/${item.mssv}`} />
                    <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'right' }} content={(item.hocPhi?.toString() || '').numberWithCommas()} />
                    <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'right' }} content={(item.congNo?.toString() || '').numberWithCommas()} />
                    <TableCell type='buttons' style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={item} permission={permission}
                        onEdit={`/user/finance/hoc-phi/${item.mssv}`} /> {/*TODO: AdminEditPage */}
                </tr>
            ),
        });
        return this.renderPage({
            title: 'Học phí',
            icon: 'fa fa-money',
            breadcrumb: ['Học phí'],
            content: <div className='tile'>
                {table}
                <Pagination {...{ pageNumber, pageSize, pageTotal, totalItem, pageCondition }}
                    getPage={this.props.getTcHocPhiPage} />
            </div>
        });
    }
}

const mapStateToProps = state => ({ system: state.system, tcHocPhi: state.finance.tcHocPhi });
const mapActionsToProps = {
    getTcHocPhiPage
};
export default connect(mapStateToProps, mapActionsToProps)(TcHocPhiAdminPage);
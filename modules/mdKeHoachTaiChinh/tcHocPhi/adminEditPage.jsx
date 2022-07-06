
import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { AdminPage, renderTable, TableCell } from 'view/component/AdminPage';
import { getTcHocPhiTransactionByMssv } from './redux';

class TcHocPhiTransactionEditPage extends AdminPage {
    mssv = null;
    state = { data: null, sinhVien: null, namHoc: '', hocKy: '' }
    componentDidMount() {
        T.ready('/user/finance/hoc-phi', () => {
            const route = T.routeMatcher('/user/finance/hoc-phi/:mssv');
            this.mssv = route.parse(window.location.pathname)?.mssv;
            this.props.getTcHocPhiTransactionByMssv(this.mssv, this.initData);
        });
    }

    initData = (result) => {
        this.setState({ data: result.items, sinhVien: result.sinhVien, namHoc: result.namHoc, hocKy: result.hocKy });
    }

    renderTransaction = (data) => {
        return renderTable({
            getDataSource: () => data,
            stickyHead: true, emptyTable: 'Sinh viên chưa có giao dịch nào',
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', textAlign: 'right' }}>STT</th>
                    <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>Ngân hàng</th>
                    <th style={{ width: '30%', textAlign: 'right' }}>Mã hoá đơn</th>
                    <th style={{ width: '30%', textAlign: 'right' }}>Thời gian giao dịch</th>
                    <th style={{ width: '40%', textAlign: 'right' }}>Số tiền</th>
                </tr>
            ),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell style={{ textAlign: 'right' }} content={index + 1} />
                    <TableCell style={{ textAlign: 'right' }} content={item.bank} />
                    <TableCell style={{ textAlign: 'right' }} content={item.billId} />
                    <TableCell type='date' dateFormat='dd/mm/yyyy' style={{ textAlign: 'right' }} content={parseInt(item.transDate)} />
                    <TableCell type='number' style={{ textAlign: 'right' }} content={(item.amount || '')} />
                </tr>
            )
        });
    }

    render() {
        let { data, sinhVien, namHoc, hocKy } = this.state;
        return this.renderPage({
            title: 'Lịch sử giao dịch',
            subTitle: sinhVien ? `${sinhVien.mssv}: ${sinhVien.ho} ${sinhVien.ten}` : '',
            header: `Năm: ${namHoc} - HK${hocKy}`,
            breadcrumb: [
                <Link key={0} to='/user/finance/hoc-phi'>Học phí</Link>,
                'Lịch sử giao dịch'
            ],
            icon: 'fa fa-map',
            content: <>
                <div className='tile'>
                    {this.renderTransaction(data || [])}
                </div>
            </>,
            backRoute: '/user/finance/hoc-phi'
        });
    }
}
const mapStateToProps = state => ({ system: state.system });
const mapActionsToProps = { getTcHocPhiTransactionByMssv };
export default connect(mapStateToProps, mapActionsToProps)(TcHocPhiTransactionEditPage);
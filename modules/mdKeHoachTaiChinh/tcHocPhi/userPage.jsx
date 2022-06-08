import React from 'react';
import { connect } from 'react-redux';
import { AdminPage, FormSelect, renderTable, TableCell } from 'view/component/AdminPage';
import Pagination from 'view/component/Pagination';
import T from 'view/js/common';
import { getTcHocPhiPage } from './redux';

const yearDatas = () => {
    return Array.from({ length: 15 }, (_, i) => i + new Date().getFullYear() - 10);
};

const termDatas = [{ id: 1, text: 'HK1' }, { id: 2, text: 'HK2' }, { id: 3, text: 'HK3' }];


class UserPage extends AdminPage {

    componentDidMount() {
        T.ready('/user', () => {
            this.props.getTcHocPhiPage(undefined, undefined, '', (data) => {
                const { settings: { namHoc, hocKy } } = data;
                this.year.value(namHoc);
                this.term.value(hocKy);
            });
        });
    }

    render() {
        const { pageNumber, pageSize, pageTotal, totalItem, pageCondition, list } = this.props.tcHocPhi && this.props.tcHocPhi.page ? this.props.tcHocPhi.page : {
            pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, list: null
        };
        let table = renderTable({
            emptyTable: 'Không có dữ liệu học phí',
            stickyHead: true,
            header: 'thead-light',
            getDataSource: () => list,
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', textAlign: 'right' }}>#</th>
                    <th style={{ width: 'auto', textAlign: 'center' }}>Học kỳ</th>
                    <th style={{ width: '20%', whiteSpace: 'nowrap' }}>MSSV</th>
                    <th style={{ width: '60%', whiteSpace: 'nowrap' }}>Họ và tên</th>
                    <th style={{ width: '10%', whiteSpace: 'nowrap' }}>Học phí (vnđ)</th>
                    <th style={{ width: '10%', whiteSpace: 'nowrap' }}>Công nợ (vnđ)</th>
                </tr>
            ),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell style={{ textAlign: 'right' }} content={(pageNumber - 1) * pageSize + index + 1} />
                    <TableCell style={{ textAlign: 'center', whiteSpace: 'nowrap' }} content={`${item.namHoc} - HK${item.hocKy}`} />
                    <TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={item.mssv} url={`/user/finance/hoc-phi/${item.mssv}`} />
                    <TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={item.hoTenSinhVien} url={`/user/finance/hoc-phi/${item.mssv}`} />
                    <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'right' }} content={(item.hocPhi?.toString() || '').numberWithCommas()} />
                    <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'right' }} content={(item.congNo?.toString() || '').numberWithCommas()} />
                </tr>
            )
        });
        return this.renderPage({
            title: 'Học phí',
            icon: 'fa fa-money',
            header: <><FormSelect ref={e => this.year = e} style={{ width: '100px', marginBottom: '0', marginRight: 10 }} placeholder='Năm học' data={yearDatas()} onChange={
                value => this.props.getTcHocPhiPage(undefined, undefined, {
                    searchTerm: '',
                    settings: { namHoc: value && value.id, hocKy: this.term.value() }
                })
            } /><FormSelect ref={e => this.term = e} style={{ width: '100px', marginBottom: '0' }} placeholder='Học kỳ' data={termDatas} onChange={
                value => this.props.getTcHocPhiPage(undefined, undefined, {
                    searchTerm: '',
                    settings: { namHoc: this.year.value(), hocKy: value && value.id }
                })
            } /></>,
            breadcrumb: ['Học phí'],
            backRoute: '/user',
            content: <div className='tile'>
                {table}
                <Pagination getPage={this.props.getTcHocPhiPage} {...{ pageNumber, pageSize, pageTotal, totalItem, pageCondition }} style={{ marginLeft: '70px' }} />
            </div>
        });
    }
}

const mapStateToProps = state => ({ system: state.system, tcHocPhi: state.finance.tcHocPhi });
const mapActionsToProps = {
    getTcHocPhiPage
};
export default connect(mapStateToProps, mapActionsToProps)(UserPage);
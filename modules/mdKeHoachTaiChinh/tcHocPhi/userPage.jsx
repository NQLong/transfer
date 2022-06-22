import { Tooltip } from '@mui/material';
import React from 'react';
import { connect } from 'react-redux';
import { AdminModal, AdminPage, FormSelect, renderTable, TableCell } from 'view/component/AdminPage';
import Pagination from 'view/component/Pagination';
import T from 'view/js/common';
import { getTcHocPhiPage, getTcHocPhiHuongDan, vnPayGoToTransaction } from './redux';

const yearDatas = () => {
    return Array.from({ length: 15 }, (_, i) => i + new Date().getFullYear() - 10);
};

const termDatas = [{ id: 1, text: 'HK1' }, { id: 2, text: 'HK2' }, { id: 3, text: 'HK3' }];

class ThanhToanModal extends AdminModal {
    render = () => {
        return this.renderModal({
            title: 'Phương thức thanh toán',
            body: <div className='row' >
                <Tooltip title='Thanh toán qua VNPAY' arrow>
                    <button className='btn btn-warning' style={{ width: '90%', margin: 'auto' }} onClick={e => {
                        e.preventDefault();
                        this.props.vnPayGoToTransaction(link => {
                            window.location.href = link;
                        });
                    }}>
                        <img src='/img/logo/vnpay.svg' alt='VNPAY' style={{ maxWidth: 80, marginRight: 20 }} /> Thanh toán thông qua VNPAY
                    </button>

                </Tooltip>
            </div>
        });
    }
}
class Modal extends AdminModal {
    state = { hocPhiHuongDan: null }

    componentDidMount() {
    }

    onShow = (hocPhiHuongDan) => {
        this.setState({ hocPhiHuongDan });
    };

    render = () => {
        const { hocPhiHuongDan } = this.state;
        return this.renderModal({
            title: 'Hướng dẫn đóng học phí',
            size: 'large',
            body: <div className='row'>
                <span style={{ margin: 16 }} dangerouslySetInnerHTML={{ __html: hocPhiHuongDan }} />
            </div>
        });
    }
}
class UserPage extends AdminPage {
    state = { hocPhiHuongDan: null, isSuccess: false }

    componentDidMount() {
        const query = new URLSearchParams(this.props.location.search);
        if (query) {
            const vnp_TransactionStatus = query.get('vnp_TransactionStatus');
            if (vnp_TransactionStatus && vnp_TransactionStatus == '00') {
                T.alert('Thanh toán thành công', 'success', false, 2000);
                // window.location = '/user/hoc-phi';
                //TODO: Email SMS
            }
        }

        T.ready('/user', () => {
            this.props.getTcHocPhiPage(undefined, undefined, '', (data) => {
                const { settings: { namHoc, hocKy } } = data;
                this.year.value(namHoc);
                this.term.value(hocKy);
            });
            this.props.getTcHocPhiHuongDan();
        });
    }

    render() {
        const { pageNumber, pageSize, pageTotal, totalItem, pageCondition, list } = this.props.tcHocPhi && this.props.tcHocPhi.page ? this.props.tcHocPhi.page : {
            pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, list: null
        };
        const hocPhiHuongDan = this.props.tcHocPhi?.hocPhiHuongDan;
        let table = renderTable({
            emptyTable: 'Không có dữ liệu học phí',
            stickyHead: true,
            header: 'thead-light',
            style: { marginTop: 16 },
            getDataSource: () => list,
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', textAlign: 'right' }}>#</th>
                    <th style={{ width: 'auto', textAlign: 'center' }}>Học kỳ</th>
                    <th style={{ width: '20%', whiteSpace: 'nowrap' }}>MSSV</th>
                    <th style={{ width: '60%', whiteSpace: 'nowrap' }}>Họ và tên</th>
                    <th style={{ width: '10%', whiteSpace: 'nowrap' }}>Học phí (vnđ)</th>
                    <th style={{ width: '10%', whiteSpace: 'nowrap' }}>Công nợ (vnđ)</th>
                    <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>Thao tác</th>
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
                    <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={
                        item.congNo ? <Tooltip title='Thanh toán' arrow>
                            <button className='btn btn-success' onClick={e => e.preventDefault() || this.thanhToanModal.show()}>
                                <i className='fa fa-lg fa-usd ' />
                            </button>
                        </Tooltip> : null
                    } />

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
                <a style={{ marginBottom: '20px' }} href='#' onClick={() => { this.modal.show(hocPhiHuongDan); }} >*Hướng dẫn đóng học phí</a><br />
                {table}
                <Pagination getPage={this.props.getTcHocPhiPage} {...{ pageNumber, pageSize, pageTotal, totalItem, pageCondition }} style={{ marginLeft: '70px' }} />
                <Modal ref={e => this.modal = e} />
                <ThanhToanModal ref={e => this.thanhToanModal = e} vnPayGoToTransaction={this.props.vnPayGoToTransaction} />
            </div>
        });
    }
}

const mapStateToProps = state => ({ system: state.system, tcHocPhi: state.finance.tcHocPhi });
const mapActionsToProps = {
    getTcHocPhiPage, getTcHocPhiHuongDan, vnPayGoToTransaction
};
export default connect(mapStateToProps, mapActionsToProps)(UserPage);
import { Tooltip } from '@mui/material';

import React from 'react';
import { connect } from 'react-redux';
import { AdminModal, AdminPage, loadSpinner, renderTable, TableCell } from 'view/component/AdminPage';

import T from 'view/js/common';
import { getTcHocPhiPage, getTcHocPhiHuongDan, vnPayGoToTransaction, getHocPhi } from './redux';
class ThanhToanModal extends AdminModal {
    render = () => {
        let styleButton = { width: '90%', margin: 'auto', marginBottom: '20px', height: '50px', display: 'inline-flex', alignItems: 'center' },
            styleLogo = { maxWidth: 100, marginRight: 30, marginLeft: 20 };
        return this.renderModal({
            title: 'Phương thức thanh toán',
            body: <div className='row' >
                <Tooltip title='Thanh toán qua Agribank' arrow placement='top'>
                    <button className='btn' style={styleButton} onClick={e => {
                        e.preventDefault();
                        this.props.vnPayGoToTransaction('agribank', link => {
                            window.location.href = link;
                        });
                    }}>
                        <img src={`/img/logo/agribank.png?t=${new Date().getTime()}`} alt='Agribank' style={styleLogo} /><span>Thanh toán qua AGRIBANK</span>
                    </button>
                </Tooltip>

                <Tooltip title='Thanh toán qua Vietcombank' arrow placement='top'>
                    <button className='btn' style={styleButton} onClick={e => {
                        e.preventDefault();
                    }}>
                        <img src={`/img/logo/vcb.png?t=${new Date().getTime()}`} alt='Vietcombank' style={styleLogo} />Thanh toán qua Vietcombank
                    </button>
                </Tooltip>
                <Tooltip title='Thanh toán qua BIDV' arrow placement='top'>
                    <button className='btn' style={styleButton} onClick={e => {
                        e.preventDefault();
                    }}>
                        <img src={`/img/logo/logo_bidv.png?t=${new Date().getTime()}`} alt='BIDV' style={styleLogo} /> Thanh toán qua BIDV
                    </button>
                </Tooltip>

                <Tooltip title='Thanh toán qua VNPAY' arrow placement='top'>
                    <button className='btn' style={styleButton} onClick={e => {
                        e.preventDefault();
                        this.props.vnPayGoToTransaction('vnpay', link => {
                            window.location.href = link;
                        });
                    }}>
                        <img src={`/img/logo/vnpay.png?t=${new Date().getTime()}`} alt='VNPAY' style={styleLogo} /> Thanh toán qua VNPAY
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
            if (vnp_TransactionStatus) {
                vnp_TransactionStatus == '00' ? T.alert('Thanh toán thành công', 'success', false) : T.alert('Thanh toán thất bại', 'error', false);
                window.history.pushState('', '', '/user/hoc-phi');
            }
        }

        T.ready('/user', () => {
            // this.props.getTcHocPhiPage(undefined, undefined, '', (data) => {
            //     const { settings: { namHoc, hocKy } } = data;
            //     this.year.value(namHoc);
            //     this.term.value(hocKy);
            //     this.setState({ namHoc, hocKy });
            // });
            this.props.getHocPhi();
            this.props.getTcHocPhiHuongDan();
        });
    }

    render() {
        const user = this.props.system.user,
            tcHocPhi = this.props.tcHocPhi || {},
            { hocPhi, hocPhiDetail } = tcHocPhi.data || {};
        const hocPhiHuongDan = this.props.tcHocPhi?.hocPhiHuongDan;
        const style = (width = 'auto', textAlign = 'left') => ({ width, textAlign, whiteSpace: 'nowrap', backgroundColor: '#1b489f', color: '#fff' });
        let table = renderTable({
            emptyTable: 'Không có dữ liệu học phí',
            header: 'thead-light',
            getDataSource: () => hocPhiDetail,
            renderHead: () => (
                <tr>
                    <th style={style()}>STT</th>
                    {/* <th style={style('10%', 'right')}>Chọn thanh toán</th> */}
                    <th style={style('70%')}>Môn học</th>
                    <th style={style('10%', 'right')}>Số tín chỉ</th>
                    <th style={style('20%', 'right')}>Thành tiền</th>

                </tr>
            ),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell style={{ textAlign: 'right' }} content={index + 1} />
                    {/* {item.active ? <TableCell type='checkbox' content={item.active || ''} /> : <TableCell content='Đã thanh toán' style={{ textAlign: 'center' }} />} */}
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={`${item.maMonHoc} - ${item.tenMonHoc}`} />
                    <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'right' }} content={item.soTinChi} />
                    <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'right' }} content={`${(item.soTien?.toString() || '').numberWithCommas()} vnđ`} />
                </tr>
            )
        });
        return this.renderPage({
            title: 'Học phí',
            subTitle: <a style={{ marginBottom: '20px' }} href='#' onClick={() => { this.modal.show(hocPhiHuongDan); }} >*Hướng dẫn đóng học phí</a>,
            icon: 'fa fa-money',
            breadcrumb: ['Học phí'],
            backRoute: '/user',
            content: hocPhi ? <div className='tile'>
                <img src='/img/header.jpg' style={{ maxWidth: '100%', marginRight: 20 }} ></img>
                <div style={{ textAlign: 'center' }}>
                    <b style={{ fontSize: '20px' }}>{user ? `${user.data.ho} ${user.data.ten}` : ''}</b><br />
                    <span style={{ fontSize: '18px' }}>{user ? user.data.mssv : ''}</span><br />
                    <span style={{ fontSize: '18px' }}>{user ? 'K. ' + user.data.tenKhoa : ''}</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                    <span style={{ fontSize: '18px' }}>Học phí học kỳ {hocPhi.hocKy || ''}, năm học {hocPhi.namHoc ? `${hocPhi.namHoc} - ${Number(hocPhi.namHoc) + 1}` : ''} </span>
                    <Tooltip title='Thanh toán' placement='top' arrow>
                        <button className='btn btn-success' onClick={e => e.preventDefault() || this.thanhToanModal.show()}>
                            Thanh toán
                        </button>
                    </Tooltip>
                </div>

                <div className='tile-footer' style={{ marginBottom: '0' }} />
                {table}
                <div className='tile-footer' style={{ textAlign: 'right' }}>
                    <p>Tổng học phí: <b>{hocPhi.hocPhi.toString().numberWithCommas()} vnđ </b></p>
                    <p>Đã đóng: <b>{(hocPhi.hocPhi - hocPhi.congNo).toString().numberWithCommas()} vnđ </b></p>

                </div>

                <Modal ref={e => this.modal = e} />
                <ThanhToanModal ref={e => this.thanhToanModal = e} vnPayGoToTransaction={this.props.vnPayGoToTransaction} />
            </div> : loadSpinner()
        });
    }
}

const mapStateToProps = state => ({ system: state.system, tcHocPhi: state.finance.tcHocPhi });
const mapActionsToProps = {
    getTcHocPhiPage, getTcHocPhiHuongDan, vnPayGoToTransaction, getHocPhi
};
export default connect(mapStateToProps, mapActionsToProps)(UserPage);
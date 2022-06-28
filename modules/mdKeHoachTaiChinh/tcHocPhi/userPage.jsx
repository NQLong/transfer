import { Tooltip } from '@mui/material';

import React from 'react';
import { connect } from 'react-redux';
import { AdminModal, AdminPage, loadSpinner, renderTable, TableCell } from 'view/component/AdminPage';

import T from 'view/js/common';
import { getTcHocPhiPage, getTcHocPhiHuongDan, vnPayGoToTransaction, getHocPhi } from './redux';
class ThanhToanModal extends AdminModal {
    render = () => {
        return this.renderModal({
            title: 'Phương thức thanh toán',
            body: <div className='row' >
                <Tooltip title='Thanh toán bằng Agribank (thông qua VNPAY)' arrow placement='top'>
                    <button className='btn' style={{ width: '90%', margin: 'auto', marginBottom: '20px' }} onClick={e => {
                        e.preventDefault();
                        this.props.vnPayGoToTransaction('agribank', link => {
                            window.location.href = link;
                        });
                    }}>
                        <img src='/img/logo/agribank.svg' alt='Agribank' style={{ maxWidth: 80, marginRight: 20 }} /> Thanh toán bằng AGRIBANK
                    </button>
                </Tooltip>
                <Tooltip title='Thanh toán bằng VNPAY' arrow>
                    <button className='btn' style={{ width: '90%', margin: 'auto' }} onClick={e => {
                        e.preventDefault();
                        this.props.vnPayGoToTransaction('vnpay', link => {
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
                <div style={{ textAlign: 'left' }}>
                    <b style={{ fontSize: '18px' }}>{user ? `${user.data.ho} ${user.data.ten}` : ''}</b><br />
                    MSSV: <span>{user ? user.data.mssv : ''}</span><br />
                    Khoa/Bộ môn: <span>{user ? user.data.tenKhoa : ''}</span>
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
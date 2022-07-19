import { Tooltip } from '@mui/material';

import React from 'react';
import { connect } from 'react-redux';
import { AdminModal, AdminPage, loadSpinner, renderTable, TableCell } from 'view/component/AdminPage';
import { getTcHocPhiPage, getTcHocPhiHuongDan, vnPayGoToTransaction, getHocPhi, getAllHocPhiStudent } from './redux';
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
                        this.props.vnPayGoToTransaction('vnpay-agri', link => {
                            window.location.href = link;
                        });
                    }}>
                        <img src={`/img/logo/agribank.png?t=${new Date().getTime()}`} alt='Agribank' style={styleLogo} /><span>Thanh toán qua AGRIBANK</span>
                    </button>
                </Tooltip>

                <Tooltip title='Thanh toán qua Vietcombank' arrow placement='top'>
                    <button className='btn' style={styleButton} onClick={e => {
                        e.preventDefault();
                        this.props.vnPayGoToTransaction('vnpay-vcb', link => {
                            window.location.href = link;
                        });
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
                        this.props.vnPayGoToTransaction('vcb', link => {
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

        T.ready('/user/hoc-phi', () => {
            this.props.getHocPhi();
            this.props.getAllHocPhiStudent();
            this.props.getTcHocPhiHuongDan();
        });
    }
    renderTableHocPhi = (data) => {
        const style = (width = 'auto', textAlign = 'left') => ({ width, textAlign, whiteSpace: 'nowrap', backgroundColor: '#1b489f', color: '#fff' });
        return renderTable({
            emptyTable: 'Không có dữ liệu học phí',
            header: 'thead-light',
            getDataSource: () => data,
            renderHead: () => (
                <tr>
                    <th style={style()}>STT</th>
                    <th style={style('100%')}>Loại phí</th>
                    <th style={style('auto', 'right')}>Tổng thu</th>

                </tr>
            ),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell style={{ textAlign: 'right' }} content={index + 1} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.tenLoaiPhi} />
                    <TableCell type='number' style={{ whiteSpace: 'nowrap', textAlign: 'right' }} content={item.soTien || ''} />
                </tr>
            )
        });
    }

    renderSection = (namHoc, hocPhiTrongNam) => {
        const { dataDetailTrongNam, dataTrongNam } = hocPhiTrongNam;
        const dataHocKy = dataTrongNam.groupBy('hocKy');
        return (
            <div className='tile' key={namHoc}>
                <div className='tile-title'>Năm {namHoc} - {Number(namHoc) + 1}</div>
                {Object.keys(dataHocKy).sort((a, b) => Number(b) - Number(a)).map(hocKy => {
                    let current = dataHocKy[hocKy][0];
                    return (<div key={`${namHoc}_${hocKy}`} style={{ marginBottom: '40px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }} >
                            <i style={{ fontSize: '16px' }}>Học kỳ {hocKy}</i>
                            {current.congNo ? <b>Còn nợ: {T.numberDisplay(current.congNo)} VNĐ</b> : <b>Đã thanh toán đủ.</b>
                            }
                        </div>
                        {/* <Tooltip title='Thanh toán' placement='top' arrow>
                            <button className='btn btn-success' onClick={e => e.preventDefault() || this.thanhToanModal.show()}>
                                Thanh toán
                            </button>
                        </Tooltip> */}
                        <div className='tile-footer' style={{ padding: '0', marginBottom: '10px', marginTop: '0' }} />
                        {this.renderTableHocPhi(dataDetailTrongNam.filter(item => item.hocKy == hocKy))}
                        <div className='tile-footer' style={{ marginTop: '0', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }} >
                            <div>
                                <div>Miễn giảm: <b>{current.mienGiam || 'Không'}</b> </div>
                                <div>Thời gian đóng:  <b>Từ {current.fromTime || ''} đến {current.fromTime || ''}</b> </div>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <div>Tổng học phí: <b>{T.numberDisplay(Number(current.hocPhi))} VNĐ </b></div>
                                <div>Đã đóng: <b>{T.numberDisplay(Number(current.hocPhi) - Number(current.congNo))} VNĐ </b></div>
                            </div>

                        </div>
                        <Modal ref={e => this.modal = e} />
                        <ThanhToanModal ref={e => this.thanhToanModal = e} vnPayGoToTransaction={this.props.vnPayGoToTransaction} />
                    </div>);
                }
                )}
            </div>
        );
    }
    render() {
        const user = this.props.system.user,
            tcHocPhi = this.props.tcHocPhi || {},
            { hocPhiAll, hocPhiDetailAll } = tcHocPhi.dataAll || {};
        const hocPhiHuongDan = this.props.tcHocPhi?.hocPhiHuongDan;

        return this.renderPage({
            title: 'Học phí',
            subTitle: <a style={{ marginBottom: '20px' }} href='#' onClick={() => { this.modal.show(hocPhiHuongDan); }} >*Hướng dẫn đóng học phí</a>,
            icon: 'fa fa-money',
            breadcrumb: ['Học phí'],
            backRoute: '/user',
            content: user && hocPhiAll ? <>
                <img src='/img/header.jpg' style={{ maxWidth: '100%', marginRight: 20 }} ></img>
                {Object.keys(hocPhiAll).sort((a, b) => Number(b) - Number(a)).map(namHoc => this.renderSection(namHoc, {
                    dataTrongNam: hocPhiAll[namHoc],
                    dataDetailTrongNam: hocPhiDetailAll[namHoc]
                }))}
            </> : loadSpinner()
        });
    }
}

const mapStateToProps = state => ({ system: state.system, tcHocPhi: state.finance.tcHocPhi });
const mapActionsToProps = {
    getTcHocPhiPage, getTcHocPhiHuongDan, vnPayGoToTransaction, getHocPhi, getAllHocPhiStudent
};
export default connect(mapStateToProps, mapActionsToProps)(UserPage);
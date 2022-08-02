import { Tooltip } from '@mui/material';

import React from 'react';
import { connect } from 'react-redux';
import { AdminModal, AdminPage, loadSpinner, renderTable, TableCell } from 'view/component/AdminPage';
import { getTcHocPhiPage, getTcHocPhiHuongDan, vnPayGoToTransaction, getHocPhi, getAllHocPhiStudent } from './redux';

class ButtonBank extends React.Component {
    render = () => {
        let styleLogo = { width: '60%', height: '80%', margin: '15%' };
        const { title, onClick, imgSrc } = this.props;
        return (
            <div className='form-group col-md-4'>
                <Tooltip title={title} arrow placement='top'>
                    <button className='btn' onClick={e => e.preventDefault() || onClick()}>
                        <div className='row' style={{ justifyContent: 'center' }}>
                            <img src={`${imgSrc}?t=${new Date().getTime()}`} style={styleLogo} />
                            <h5>{title}</h5>
                        </div>
                    </button>
                </Tooltip>
            </div>
        );
    }
}
class ThanhToanModal extends AdminModal {
    render = () => {
        return this.renderModal({
            title: 'Phương thức thanh toán',
            size: 'large',
            buttons: (this.state.vcb || this.state.agri) && <button type='btn' className='btn btn-warning' onClick={e => e.preventDefault() || this.setState({ vcb: false, agri: false })}>
                <i className='fa fa-fw fa-lg fa-undo' />Quay lại
            </button>,
            body: <div>
                <section className='row' style={{ display: this.state.vcb || this.state.agri ? 'none' : '' }}>
                    <ButtonBank title='Qua BIDV' imgSrc='/img/logo/logo_bidv.png' />
                    <ButtonBank title='Qua VCB-VNPAY' imgSrc='/img/logo/vcb.png' onClick={() => this.setState({ vcb: true })} />
                    <ButtonBank title='Qua Agribank-VNPAY' imgSrc='/img/logo/agribank.png' onClick={() => this.setState({ agri: true })} />
                </section>
                <section className='row' style={{ display: this.state.vcb ? '' : 'none', justifyContent: 'center' }}>
                    <ButtonBank title='Bằng tài khoản VCB' imgSrc='/img/logo/vcb.png' onClick={() => this.props.vnPayGoToTransaction('vnpay-vcb', link => {
                        window.location.href = link;
                    })} />
                    <ButtonBank title='Tài khoản khác VCB' imgSrc='/img/logo/vnpay.png' onClick={() => this.props.vnPayGoToTransaction('vcb', link => {
                        window.location.href = link;
                    })} />
                </section>

                {/* <section className='row' style={{ display: this.state.agri ? '' : 'none', justifyContent: 'center' }}>
                    <ButtonBank title='Bằng tài khoản Agribank' imgSrc='/img/logo/agribank.png' onClick={() => this.props.vnPayGoToTransaction('vnpay-agri', link => {
                        window.location.href = link;
                    })} />
                    <ButtonBank title='Tài khoản khác Agribank' imgSrc='/img/logo/vnpay.png' onClick={() => this.props.vnPayGoToTransaction('agri', link => {
                        window.location.href = link;
                    })} />
                </section> */}
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
                            {
                                current.congNo ?
                                    (this.props.system.user.studentId == '12345' ? <Tooltip title='Thanh toán' placement='top' arrow>
                                        <button className='btn btn-success' onClick={e => e.preventDefault() || this.thanhToanModal.show()}>
                                            Thanh toán
                                        </button>
                                    </Tooltip> : <b>Còn nợ: {T.numberDisplay(current.congNo)} VNĐ</b>) : <b>Đã thanh toán đủ.</b>
                            }
                        </div>
                        <div className='tile-footer' style={{ padding: '0', marginBottom: '10px', marginTop: '0' }} />
                        {this.renderTableHocPhi(dataDetailTrongNam.filter(item => item.hocKy == hocKy))}
                        <div className='tile-footer' style={{ marginTop: '0', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }} >
                            <div>
                                <div>Miễn giảm: <b>{current.mienGiam || 'Không'}</b> </div>
                                {/* <div>Thời gian đóng:  <b>Từ {current.fromTime || ''} đến {current.fromTime || ''}</b> </div> */}
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
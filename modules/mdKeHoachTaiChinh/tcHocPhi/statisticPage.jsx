import React from 'react';
import { AdminPage } from 'view/component/AdminPage';
import { getStatisticTcHocPhi } from './redux';
import { ChartArea } from 'modules/mdTccb/dashboardTCCB/adminPage';
import { NumberIcon } from './adminPage';
import { DefaultColors } from 'view/component/Chart';
// import { DefaultColors } from 'view/component/Chart';

export default class StatisticModal extends AdminPage {
    componentDidMount() {
        T.ready('/user/finance/statistic', () => {
            getStatisticTcHocPhi(this.props.filter || {}, (result) => this.setState(result));
        });
    }
    render() {
        let { totalStudents = 0, totalTransactions = 0, amountByBank = {}, amountByEduLevel = {}, amountByEduMethod = {}, totalCurrentMoney = 0,
            amountPaid = 0, amountNotPaid = 0, amountByDepartment = {}, totalByDate = {} } = this.state?.statistic || {},
            { hocPhiNamHoc, hocPhiHocKy } = this.state?.settings || {};
        return this.renderPage({
            title: 'Thống kê',
            icon: 'fa fa-table',
            breadcrumb: ['Thống kê'],
            content: <div className='row'>
                <div className='col-lg-4'>
                    <NumberIcon type='primary' icon='fa-users' title='Tổng học viên thu' value={totalStudents || 0} />
                </div>
                <div className='col-lg-4'>
                    <NumberIcon type='primary' icon='fa-exchange' title='Tổng giao dịch' value={totalTransactions || 0} className='form-group col-lg-3' />
                </div>
                <div className='col-lg-4'>
                    <NumberIcon type='primary' icon='fa-money' title='Tổng thu' value={totalCurrentMoney || 0} className='form-group col-lg-3' />
                </div>
                <div className='col-lg-4'>
                    <div className='tile'>
                        <h5 className='tile-title'>Số liệu {hocPhiNamHoc || ''} {hocPhiNamHoc ? ' - ' + (parseInt(hocPhiNamHoc) + 1) : ''}, HK{hocPhiHocKy || ''}</h5>
                        <p>Tổng học viên: <b>{totalStudents}</b></p>
                        <p>Đã thanh toán đủ: <b>{amountPaid}</b></p>
                        <p>Chưa thanh toán: <b>{amountNotPaid}</b></p>
                        <p>Các ngân hàng thanh toán: <b>{Object.keys(amountByBank).join(', ')}</b></p>
                        <p>Các bậc đào tạo: <b>{Object.keys(amountByEduLevel).join(', ')}</b></p>
                        <p>Các hệ đào tạo: <b>{Object.keys(amountByEduMethod).join(', ')}</b></p>

                        <div className='d-flex justify-content-center' style={{ gap: 10 }}>
                            <button className='btn btn-primary' onClick={e => e.preventDefault() || this.props.history.push('/user/finance/hoc-phi')}><i className='fa fa-lg fa-child' />Trang học viên</button>
                            <button className='btn btn-success' onClick={e => e.preventDefault() || this.props.history.push('/user/finance/danh-sach-giao-dich')}><i className='fa fa-lg fa-money' />Trang giao dịch</button>
                        </div>
                    </div>
                </div>
                <ChartArea className='col-lg-4' title='Tổng quan' chartType='doughnut' data={{
                    labels: ['Chưa đóng', 'Đã đóng'],
                    datas: {
                        'Số lượng': [amountNotPaid, amountPaid]
                    }
                }} aspectRatio={1} hideMinimize />
                <ChartArea className='col-lg-4' title='Ngân hàng' chartType='pie' data={{
                    labels: Object.keys(amountByBank),
                    datas: {
                        'Số lượng': Object.keys(amountByBank).map(item => amountByBank[item])
                    },
                }} aspectRatio={1} hideMinimize />

                <ChartArea className='col-lg-6' title='Bậc đào tạo' chartType='bar' data={{
                    labels: Object.keys(amountByEduLevel),
                    datas: {
                        'Số lượng': Object.keys(amountByEduLevel).map(item => amountByEduLevel[item])
                    }
                }} aspectRatio={2} hideMinimize />

                <ChartArea className='col-lg-6' title='Hệ đào tạo' chartType='bar' data={{
                    labels: Object.keys(amountByEduMethod),
                    datas: {
                        'Số lượng': Object.keys(amountByEduMethod).map(item => amountByEduMethod[item])
                    }
                }} aspectRatio={2} hideMinimize />

                <ChartArea className='col-lg-12' title='Ngành học' chartType='bar' data={{
                    labels: Object.keys(amountByDepartment),
                    datas: {
                        'Học viên': Object.keys(amountByDepartment).map(item => amountByDepartment[item])
                    },
                }} aspectRatio={3} hideMinimize />

                <ChartArea className='col-lg-12' title='Số giao dịch theo ngày' chartType='line' data={{
                    labels: Object.keys(totalByDate).sort(),
                    datas: {
                        'Số giao dịch': Object.keys(totalByDate).sort().map(item => totalByDate[item])
                    },
                    colors: DefaultColors.orange
                }} aspectRatio={3} hideMinimize />

            </div>
        });
    }
}


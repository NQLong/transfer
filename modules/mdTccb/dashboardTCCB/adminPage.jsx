import React from 'react';
import { connect } from 'react-redux';
import CountUp from 'view/js/countUp';
import { getTotalGender } from './redux';
import { getStaffAll } from 'modules/mdTccb/tccbCanBo/redux';
import { AdminPage } from 'view/component/AdminPage';
import { AdminChart, DefaultColors } from 'view/component/Chart';
import { Link } from 'react-router-dom';

class DashboardIcon extends React.Component {
    componentDidMount() {
        setTimeout(() => {
            const endValue = this.props.value ? parseInt(this.props.value) : 0;
            new CountUp(this.valueElement, 0, endValue, 0, 2, { separator: '.', decimal: ',' }).start();
        }, 100);
    }

    componentDidUpdate(prevProps) {
        if (prevProps.value !== this.props.value)
            setTimeout(() => {
                const endValue = this.props.value ? parseInt(this.props.value) : 0;
                new CountUp(this.valueElement, prevProps.value, endValue, 0, 2, { separator: '.', decimal: ',' }).start();
            }, 100);
    }

    render() {
        let isShow = true;
        if (this.props.isShowValue != undefined) {
            if (this.props.isShowValue == false) isShow = false;
        }
        const content = (
            <div className={'widget-small coloured-icon ' + this.props.type}>
                <i className={'icon fa fa-3x ' + this.props.icon} />
                <div className='info'>
                    <h4>
                        {this.props.title}
                    </h4>
                    {isShow && <p style={{ fontWeight: 'bold' }} ref={e => this.valueElement = e} />}
                </div>
            </div>
        );
        return this.props.link ? <Link to={this.props.link} style={{ textDecoration: 'none' }}>{content}</Link> : content;
    }
}

class Dashboard extends AdminPage {
    state = {
        totalStaff: 0,
        listStaffFaculty: {
            labels: null,
            datasets: null
        },
        listDiNuocNgoai: {
            labels: null,
            datasets: null
        },
        listCongTacTrongNuoc: {
            labels: null,
            datasets: null
        },
    };

    componentDidMount() {
        T.ready('/user/tccb', () => {
            this.props.getTotalGender(data => {
                let { listStaffFaculty, listDiNuocNgoai, listCongTacTrongNuoc } = data ? data : { listStaffFaculty, listDiNuocNgoai, listCongTacTrongNuoc };
                let dataStaffFaculty = {
                    labels: [],
                    datasets: [
                        { data: [], label: 'Số lượng', backgroundColor: DefaultColors.info }
                    ]
                };
                let dataDiNuocNgoai = {
                    labels: [],
                    datasets: [
                        { data: [], label: 'Số lượng', backgroundColor: Object.values(DefaultColors) }
                    ]
                };
                let dataCongTacTrongNuoc = {
                    labels: [],
                    datasets: [
                        { data: [], label: 'Số lượng', backgroundColor: Object.values(DefaultColors) }
                    ]
                };
                this.setState({ listStaffFaculty, listDiNuocNgoai, listCongTacTrongNuoc }, () => {
                    listStaffFaculty.length && this.state.listStaffFaculty.forEach(faculty => {
                        dataStaffFaculty.labels.push(faculty.tenDonVi);
                        dataStaffFaculty.datasets[0].data.push(faculty.numOfStaff);
                    });
                    listDiNuocNgoai.length && this.state.listDiNuocNgoai.forEach(item => {
                        dataDiNuocNgoai.labels.push(item.tenMucDich);
                        dataDiNuocNgoai.datasets[0].data.push(item.numOfStaff || 0);
                    });
                    listCongTacTrongNuoc.length && this.state.listCongTacTrongNuoc.forEach((item) => {
                        dataCongTacTrongNuoc.labels.push(item.tenMucDich);
                        dataCongTacTrongNuoc.datasets[0].data.push(item.numOfStaff);
                    });
                    this.setState({ listStaffFaculty: dataStaffFaculty, listDiNuocNgoai: dataDiNuocNgoai, listCongTacTrongNuoc: dataCongTacTrongNuoc });
                });

            });
        });
    }

    render() {
        let { totalMale, totalFemale, totalStaff, totalFaculty, totalPB,
            totalMalePhD, totalFemalePhD, totalKhoa,
            totalMaleMaster, totalFemaleMaster,
            totalMaleBachelor, totalFemaleBachelor
        } = this.props.dashboardTccb && this.props.dashboardTccb.page ? this.props.dashboardTccb.page :
                {
                    totalMale: 0, totalFemale: 0, totalStaff: 0, totalFaculty: 0, totalPB: 0,
                    totalMalePhD: 0, totalFemalePhD: 0, totalKhoa: 0,
                    totalMaleMaster: 0, totalFemaleMaster: 0,
                    totalMaleBachelor: 0, totalFemaleBachelor: 0
                };
        let dataGender = {
            datasets: [
                {
                    data: [totalMale, totalFemale],
                    backgroundColor: [DefaultColors.red, DefaultColors.blue]
                }
            ],
            labels: ['Nam', 'Nữ']
        },
            dataLevelByGender = {
                labels: ['Tiến sĩ', 'Thạc sĩ', 'Cử nhân'],
                datasets: [
                    {
                        label: 'Nam',
                        data: [totalMalePhD, totalMaleMaster, totalMaleBachelor],
                        note: 'Số lượng',
                        backgroundColor: DefaultColors.red,
                    },
                    {
                        label: 'Nữ',
                        data: [totalFemalePhD, totalFemaleMaster, totalFemaleBachelor],
                        note: 'Số lượng',
                        backgroundColor: DefaultColors.blue,
                    },
                ],
                yTitle: 'Số lượng cán bộ',
                xTitle: 'Trình độ'
            };


        return this.renderPage({
            icon: 'fa fa-bar-chart',
            title: 'Dashboard Phòng Tổ chức cán bộ',
            content: <div className='row'>
                <div className='col-md-6 col-lg-3'>
                    <DashboardIcon type='primary' icon='fa-users' title='Cán bộ' value={totalStaff} link='/user/tccb/staff' />
                </div>
                <div className='col-md-6 col-lg-3'>
                    <DashboardIcon type='warning' icon='fa-modx' title='Đơn vị' value={totalFaculty} link='/user/danh-muc/don-vi' />
                </div>
                <div className='col-md-6 col-lg-3'>
                    <DashboardIcon type='info' icon='fa-tags' title='Khoa - Bộ môn' value={totalKhoa} link='/user/danh-muc/don-vi' />
                </div>
                <div className='col-md-6 col-lg-3'>
                    <DashboardIcon type='danger' icon='fa-sticky-note' title='Phòng ban' value={totalPB} link='/user/danh-muc/don-vi' />
                </div>
                <div className='col-lg-6'>
                    <div className='tile'>
                        <div className='tile-title'>Giới tính</div>
                        <AdminChart type='doughnut' data={dataGender} />
                    </div>
                </div>
                <div className='col-lg-6'>
                    <div className='tile'>
                        <div className='tile-title'>Trình độ học vị
                        </div>
                        <AdminChart data={dataLevelByGender} type='bar' />
                    </div>
                </div>
                <div className='col-lg-12'>
                    <div className='tile'>
                        <div className='tile-title'>Nhân sự các khoa, bộ môn</div>
                        <AdminChart data={this.state.listStaffFaculty} type='bar' />
                    </div>
                </div>
                <div className='col-lg-6'>
                    <div className='tile'>
                        <div className='tile-title'>Cán bộ đang công tác trong nước</div>
                        <AdminChart type='doughnut' data={this.state.listCongTacTrongNuoc} />
                    </div>
                </div>
                <div className='col-lg-6'>
                    <div className='tile'>
                        <div className='tile-title'>Cán bộ đang ở nước ngoài</div>
                        <AdminChart type='doughnut' data={this.state.listDiNuocNgoai} />
                    </div>
                </div>
            </div>,
            backRoute: '/user/tccb',
        });
    }
}

const mapStateToProps = state => ({ system: state.system, dashboardTccb: state.tccb.dashboardTccb });
const mapActionsToProps = {
    getStaffAll, getTotalGender
};
export default connect(mapStateToProps, mapActionsToProps)(Dashboard);
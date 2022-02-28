import React from 'react';
import { connect } from 'react-redux';
import CountUp from 'view/js/countUp';
import { getTotalGender } from './redux';
import { getStaffAll } from 'modules/mdTccb/tccbCanBo/redux';
import { AdminPage } from 'view/component/AdminPage';
import { BarChart, DefaultColors, DoughnutChart } from 'view/component/Chart';
import { Link } from 'react-router-dom';

class DashboardIcon extends React.Component {
    valueElement = React.createRef();
    componentDidMount() {
        setTimeout(() => {
            const endValue = this.props.value ? parseInt(this.props.value) : 0;
            new CountUp(this.valueElement.current, 0, endValue, 0, 2, { separator: '.', decimal: ',' }).start();
        }, 100);
    }

    componentDidUpdate(prevProps) {
        if (prevProps.value !== this.props.value)
            setTimeout(() => {
                const endValue = this.props.value ? parseInt(this.props.value) : 0;
                new CountUp(this.valueElement.current, prevProps.value, endValue, 0, 2, { separator: '.', decimal: ',' }).start();
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
                    <h4>{this.props.title}</h4>
                    {isShow && <p style={{ fontWeight: 'bold' }} ref={this.valueElement} />}
                </div>
            </div>
        );
        return this.props.link ? <Link to={this.props.link} style={{ textDecoration: 'none' }}>{content}</Link> : content;
    }
}

class Dashboard extends AdminPage {
    state = {
        totalStaff: 0
    };

    componentDidMount() {
        T.ready('/user/tccb', () => {
            this.props.getTotalGender(data => {
                let { totalStaff } = data ? data : { totalStaff };
                this.setState({ totalStaff });

            });
        });
    }

    render() {
        let { totalMale, totalFemale, totalStaff, totalFaculty,
            totalMalePhD, totalFemalePhD,
            totalMaleMaster, totalFemaleMaster,
            totalMaleBachelor, totalFemaleBachelor
        } = this.props.dashboardTccb && this.props.dashboardTccb.page ? this.props.dashboardTccb.page :
                {
                    totalMale: 0, totalFemale: 0, totalStaff: 0, totalFaculty: 0,
                    totalMalePhD: 0, totalFemalePhD: 0,
                    totalMaleMaster: 0, totalFemaleMaster: 0,
                    totalMaleBachelor: 0, totalFemaleBachelor: 0
                };
        let dataGender = [{ value: totalMale, title: 'Nam' }, { value: totalFemale, title: 'Nữ' }],
            dataLevelByGender = {
                data: {
                    labels: ['Tiến sĩ', 'Thạc sĩ', 'Cử nhân'],
                    datasets: [
                        {
                            label: 'Nữ',
                            data: [totalFemalePhD, totalFemaleMaster, totalFemaleBachelor],
                            note: 'Số lượng',
                            backgroundColor: DefaultColors.red,
                        },
                        {
                            label: 'Nam',
                            data: [totalMalePhD, totalMaleMaster, totalMaleBachelor],
                            note: 'Số lượng',
                            backgroundColor: DefaultColors.blue,
                        },
                    ]
                },
                yTitle: 'Số lượng cán bộ',
                xTitle: 'Trình độ'
            };
        return this.renderPage({
            title: 'Dashboard Phòng Tổ chức cán bộ',
            content: <div className='row'>
                <div className='col-md-6 col-lg-3'>
                    <DashboardIcon type='primary' icon='fa-users' title='CÁN BỘ' value={totalStaff} link='/user/tccb/staff' />
                </div>
                <div className='col-md-6 col-lg-3'>
                    <DashboardIcon type='warning' icon='fa-users' title='Đơn vị' value={totalFaculty} link='/user/danh-muc/don-vi' />
                </div>
                <div className='col-lg-6'>
                    <div className='tile'>
                        <h3 className='tile-title'>Giới tính</h3>
                        <DoughnutChart data={dataGender} />
                    </div>
                </div>
                <div className='col-lg-6'>
                    <div className='tile'>
                        <h3 className='tile-title'>Trình độ học vị</h3>
                        <BarChart data={dataLevelByGender} />
                    </div>
                </div>
            </div>
        });
    }
}

const mapStateToProps = state => ({ system: state.system, dashboardTccb: state.tccb.dashboardTccb });
const mapActionsToProps = {
    getStaffAll, getTotalGender
};
export default connect(mapStateToProps, mapActionsToProps)(Dashboard);
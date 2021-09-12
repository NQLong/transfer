import React from 'react';
import { connect } from 'react-redux';
import CountUp from 'view/js/countUp';
import { Link } from 'react-router-dom';

class DashboardIcon extends React.Component {
    constructor(props) {
        super(props);
        this.valueElement = React.createRef();
    }

    componentDidMount() {
        setTimeout(() => {
            const endValue = this.props.value ? parseInt(this.props.value) : 0;
            new CountUp(this.valueElement.current, 0, endValue, 0, 2, { separator: '.', decimal: ',' }).start();
        }, 100);
    }

    render() {
        const content = (
            <div className={'widget-small coloured-icon ' + this.props.type}>
                <i className={'icon fa fa-3x ' + this.props.icon} />
                <div className='info'>
                    <h4>{this.props.title}</h4>
                    <p style={{ fontWeight: 'bold' }} ref={this.valueElement} />
                </div>
            </div>
        );
        return this.props.link ? <Link to={this.props.link} style={{ textDecoration: 'none' }}>{content}</Link> : content;
    }
}

class DashboardPage extends React.Component {
    componentDidMount() {
        T.ready();
    }

    render() {
        const { numberOfUser, numberOfNews, numberOfEvent, todayViews, allViews } = this.props.system ?
            this.props.system : { numberOfUser: 0, numberOfNews: 0, numberOfEvent: 0, numberOfJob: 0, todayViews: 0, allViews: 0 };
        return (
            <main className='app-content'>
                <div className='app-title'>
                    <div>
                        <h1><i className='fa fa-dashboard' /> Dashboard</h1>
                        <p>Trường Đại học Khoa học Xã hội và Nhân văn</p>
                    </div>
                    <ul className='app-breadcrumb breadcrumb'>
                        <li className='breadcrumb-item'>
                            <i className='fa fa-home fa-lg' />
                        </li>
                        <li className='breadcrumb-item'>Dashboard</li>
                    </ul>
                </div>

                <div className='row'>
                    <div className='col-md-6 col-lg-4'>
                        <DashboardIcon type='primary' icon='fa-users' title='Người dùng' value={numberOfUser} link='/user/member' />
                    </div>
                    <div className='col-md-6 col-lg-4'>
                        <DashboardIcon type='info' icon='fa-file' title='Tin tức' value={numberOfNews} link='/user/news/list' />
                    </div>
                    <div className='col-md-6 col-lg-4'>
                        <DashboardIcon type='danger' icon='fa-star' title='Sự kiện' value={numberOfEvent} link='/user/event/list' />
                    </div>
                    <div className='col-md-6 col-lg-4'>
                        <DashboardIcon type='info' icon='fa-calculator' title='Tổng lượt truy cập trang' value={allViews} link='/user/event/list' />
                    </div>
                    <div className='col-md-6 col-lg-4'>
                        <DashboardIcon type='info' icon='fa-calculator' title='Lượt truy cập hôm nay' value={todayViews} link='/user/event/list' />
                    </div>
                    {/* <div className='col-md-6 col-lg-3'>
                        <DashboardIcon type='warning' icon='fa-pagelines' title='Job' value={numberOfJob} link='/user/job/list' />
                    </div> */}
                </div>

                {/* <div className='row'>
                    <div className='col-md-6'>
                        <div className='tile'>
                            <h3 className='tile-title'>Chart</h3>
                            <div className='embed-responsive embed-responsive-16by9'>
                                <canvas className='embed-responsive-item' id='lineChartDemo' />
                            </div>
                        </div>
                    </div>
                    <div className='col-md-6'>
                        <div className='tile'>
                            <h3 className='tile-title'>Pie</h3>
                            <div className='embed-responsive embed-responsive-16by9'>
                                <canvas className='embed-responsive-item' id='pieChartDemo' />
                            </div>
                        </div>
                    </div>
                </div> */}
            </main>
        );
    }
}

const mapStateToProps = state => ({ system: state.system });
const mapActionsToProps = {};
export default connect(mapStateToProps, mapActionsToProps)(DashboardPage);
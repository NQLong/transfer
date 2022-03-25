import React from 'react';
import { connect } from 'react-redux';
import CountUp from 'view/js/countUp';
import { getTotalGender } from './redux';
import { getStaffAll } from 'modules/mdTccb/tccbCanBo/redux';
import { AdminPage } from 'view/component/AdminPage';
import { AdminChart, DefaultColors } from 'view/component/Chart';
import { Link } from 'react-router-dom';
import { getDmNgachCdnnAll } from 'modules/mdDanhMuc/dmNgachCdnn/redux';
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
    state = {}
    ngachMapper = {}
    componentDidMount() {
        T.ready('/user/tccb', () => {
            this.props.getDmNgachCdnnAll(data => {
                data.forEach(item => this.ngachMapper[item.ma] = item.ten);
            });
            this.props.getTotalGender(data => {
                let { listStaffFaculty = [], listDiNuocNgoai = [], listCongTacTrongNuoc = [], listCanBo = [], allDonVi = [] } = data;
                this.setState({
                    listStaffFaculty: this.setUp(listStaffFaculty, 'tenDonVi', DefaultColors.info),
                    listStaffGender: this.setUp(listCanBo, 'gioiTinh'),
                    listDiNuocNgoai: this.setUp(listDiNuocNgoai, 'tenMucDich', DefaultColors.yellow),
                    listCongTacTrongNuoc: this.setUp(listCongTacTrongNuoc, 'tenMucDich'),
                    listNgach: this.setUp(listCanBo, 'ngach', DefaultColors.green, this.ngachMapper,),
                    listDonVi: allDonVi.groupBy('maPl'),
                    allDonVi,
                    listHocHam: this.setUp(listCanBo, 'chucDanh', null, { '01': 'Giáo sư', '02': 'Phó giáo sư' }),
                    listBienChe: this.setUp(listCanBo, 'namBienChe', DefaultColors.orange)
                });
            });
        });
    }

    setUp = (data = [], keyGroup, colors, mapper) => {
        let dataGroupBy = data.groupBy(keyGroup);
        delete dataGroupBy[null];
        return {
            labels: Object.keys(dataGroupBy).map(item => {
                if (mapper) return mapper[item] || 'Chưa xác định';
                else return item.normalizedName();
            }),
            datas: {
                'Số lượng': Object.values(dataGroupBy).map(item => {
                    if (item[0] && item[0].numOfStaff) return item[0].numOfStaff;
                    else {
                        return item.length;
                    }
                })
            },
            colors: colors
        };
    }
    render() {
        let { totalStaff,
            totalMalePhD, totalFemalePhD,
            totalMaleMaster, totalFemaleMaster,
            totalMaleBachelor, totalFemaleBachelor
        } = this.props.dashboardTccb && this.props.dashboardTccb.page ? this.props.dashboardTccb.page :
                {
                    totalMalePhD: 0, totalFemalePhD: 0,
                    totalMaleMaster: 0, totalFemaleMaster: 0,
                    totalMaleBachelor: 0, totalFemaleBachelor: 0
                };
        let dataLevelByGender = {
            labels: ['Tiến sĩ', 'Thạc sĩ', 'Cử nhân'],
            datas: {
                'Nam': [totalMalePhD, totalMaleMaster, totalMaleBachelor],
                'Nữ': [totalFemalePhD, totalFemaleMaster, totalFemaleBachelor],
            },
            colors: {
                'Nam': DefaultColors.red,
                'Nữ': DefaultColors.blue
            }
        };


        return this.renderPage({
            icon: 'fa fa-bar-chart',
            title: 'Dashboard Phòng Tổ chức cán bộ',
            content: <div className='row'>
                <div className='col-md-6 col-lg-4'>
                    <DashboardIcon type='primary' icon='fa-users' title='Cán bộ' value={totalStaff} link='/user/tccb/staff' />
                </div>
                <div className='col-md-6 col-lg-4'>
                    <DashboardIcon type='warning' icon='fa-modx' title='Đơn vị' value={this.state.allDonVi?.length || 0} link='/user/danh-muc/don-vi' />
                </div>
                <div className='col-md-6 col-lg-4'>
                    <DashboardIcon type='danger' icon='fa-tags' title='Khoa - Bộ môn' value={this.state.listDonVi ? this.state.listDonVi[1].length : 0} link='/user/danh-muc/don-vi' />
                </div>
                <div className='col-md-6 col-lg-4'>
                    <DashboardIcon type='info' icon='fa-sticky-note' title='Phòng ban' value={this.state.listDonVi ? this.state.listDonVi[2].length : 0} link='/user/danh-muc/don-vi' />
                </div>
                <div className='col-md-6 col-lg-4'>
                    <DashboardIcon type='info' icon='fa-building' title='Trung tâm - công ty' value={this.state.listDonVi ? this.state.listDonVi[3].length : 0} link='/user/danh-muc/don-vi' />
                </div>
                <div className='col-md-6 col-lg-4'>
                    <DashboardIcon type='info' icon='fa-fire' title='Đoàn thể' value={this.state.listDonVi ? this.state.listDonVi[4].length : 0} link='/user/danh-muc/don-vi' />
                </div>
                <div className='col-lg-6'>
                    <div className='tile'>
                        <div className='tile-title'>Giới tính</div>
                        <AdminChart type='doughnut' data={this.state.listStaffGender || {}} />
                    </div>
                </div>
                <div className='col-lg-6'>
                    <div className='tile'>
                        <div className='tile-title'>Trình độ học vị
                        </div>
                        <AdminChart data={dataLevelByGender || {}} type='bar' />
                    </div>
                </div>
                <div className='col-lg-12'>
                    <div className='tile'>
                        <div className='tile-title'>Nhân sự các khoa, bộ môn</div>
                        <AdminChart data={this.state.listStaffFaculty || {}} type='bar' />
                    </div>
                </div>
                <div className='col-lg-6'>
                    <div className='tile'>
                        <div className='tile-title'>Cán bộ đang công tác trong nước</div>
                        <AdminChart type='doughnut' data={this.state.listCongTacTrongNuoc || {}} />
                    </div>
                </div>
                <div className='col-lg-6'>
                    <div className='tile'>
                        <div className='tile-title'>Cán bộ đang ở nước ngoài</div>
                        <AdminChart type='bar' data={this.state.listDiNuocNgoai || {}} />
                    </div>
                </div>
                <div className='col-lg-6'>
                    <div className='tile'>
                        <div className='tile-title'>Chức danh nghề nghiệp</div>
                        <AdminChart type='bar' data={this.state.listNgach || {}} />
                    </div>
                </div>
                <div className='col-lg-6'>
                    <div className='tile'>
                        <div className='tile-title'>Học hàm</div>
                        <AdminChart type='pie' data={this.state.listHocHam || {}} />
                    </div>
                </div>
                <div className='col-lg-12'>
                    <div className='tile'>
                        <div className='tile-title'>Cán bộ vào biên chế theo từng năm</div>
                        <AdminChart type='line' data={this.state.listBienChe || {}} />
                    </div>
                </div>
            </div>,
            backRoute: '/user/tccb',
        });
    }
}

const mapStateToProps = state => ({ system: state.system, dashboardTccb: state.tccb.dashboardTccb });
const mapActionsToProps = {
    getStaffAll, getTotalGender, getDmNgachCdnnAll
};
export default connect(mapStateToProps, mapActionsToProps)(Dashboard);
import React from 'react';
import { connect } from 'react-redux';
import CountUp from 'view/js/countUp';
import { getDashboardData } from './redux';
import { AdminPage, FormSelect, loadSpinner } from 'view/component/AdminPage';
import { AdminChart, DefaultColors } from 'view/component/Chart';
import { Link } from 'react-router-dom';
import { Tooltip } from '@mui/material';
import { SelectAdapter_DmDonVi } from 'modules/mdDanhMuc/dmDonVi/redux';
import { SelectAdapter_DmNgachCdnnV3 } from 'modules/mdDanhMuc/dmNgachCdnn/redux';

const thisDate = new Date().getDate(),
    thisMonthIndex = new Date().getMonth(),
    thisYear = new Date().getFullYear();

const listHocVi = ['Cử nhân', 'Thạc sĩ', 'Tiến sĩ'];
const listThoiGian = [
    { id: new Date(thisYear, thisMonthIndex - 1, thisDate).getTime(), text: 'Trong 1 tháng' },
    { id: new Date(thisYear, thisMonthIndex - 3, thisDate).getTime(), text: 'Trong 3 tháng' },
    { id: new Date(thisYear, thisMonthIndex - 6, thisDate).getTime(), text: 'Trong 6 tháng' },
    { id: new Date(thisYear - 1, thisMonthIndex, thisDate).getTime(), text: 'Trong 1 năm' },
    { id: new Date(thisYear - 2, thisMonthIndex, thisDate).getTime(), text: 'Trong 2 năm' },
    { id: new Date(thisYear - 3, thisMonthIndex, thisDate).getTime(), text: 'Trong 3 năm' },
    { id: new Date(thisYear - 5, thisMonthIndex, thisDate).getTime(), text: 'Trong 5 năm' },
    { id: new Date(thisYear - 10, thisMonthIndex, thisDate).getTime(), text: 'Trong 10 năm' },
    { id: new Date(thisYear - 15, thisMonthIndex, thisDate).getTime(), text: 'Trong 15 năm' },
    { id: new Date(thisYear - 20, thisMonthIndex, thisDate).getTime(), text: 'Trong 20 năm' },
];
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

class ChartArea extends React.Component {
    state = {}
    render() {
        let { className, title, chartType, data, aspectRatio = null, renderFilter = null } = this.props;
        return (
            <div className={className}>
                <div className='tile'>
                    <h5 className='tile-title' style={{ position: 'relative' }}>{title.toUpperCase()}</h5>
                    <span style={{ position: 'absolute', top: '20px', right: '20px' }}>
                        <Tooltip title={this.state[title] ? 'Hiện' : 'Ẩn'} arrow>
                            <button className='btn btn-white' onClick={e => e.preventDefault() || this.setState({ [title]: !this.state[title] })} ><i className='fa fa-lg fa-minus' /></button>
                        </Tooltip>
                    </span>
                    {renderFilter}
                    <div style={{ display: this.state[title] ? 'none' : 'block' }} >
                        <AdminChart type={chartType} data={data} aspectRatio={aspectRatio} />
                    </div>
                </div>
            </div>
        );
    }
}
class Dashboard extends AdminPage {
    state = { isLoading: true }
    componentDidMount() {
        T.ready('/user/tccb', () => {
            this.initData(null);
        });
    }

    initData = (value) => {
        this.props.getDashboardData(value, data => {
            let { nhanSuDonVi = [], qtDiNuocNgoai = [], qtCongTacTrongNuoc = [], nhanSuCongTac = [], listDonVi = [] } = data;
            this.handleTrinhDoHocVi(nhanSuCongTac);
            this.setState({
                tongCB: nhanSuCongTac.length,
                soLuongDonVi: listDonVi.length,
                nhanSuCongTac,
                fromTime: value,
                nhanSuKhoaBM: this.setUp(nhanSuDonVi.filter(item => item.maPL == 1).map(item => {
                    item.tenDonVi = item.tenDonVi.getFirstLetters();
                    return item;
                }), 'tenDonVi', DefaultColors.navy),

                nhanSuPhongBan: this.setUp(nhanSuDonVi.filter(item => item.maPL == 2).map(item => {
                    item.tenDonVi = item.tenDonVi.getFirstLetters();
                    return item;
                }), 'tenDonVi', DefaultColors.lightGreen),

                nhanSuTrungTam: this.setUp(nhanSuDonVi.filter(item => item.maPL == 3).map(item => {
                    item.tenDonVi = item.tenDonVi.getFirstLetters();
                    return item;
                }), 'tenDonVi', DefaultColors.maroon),

                nhanSuDoanThe: this.setUp(nhanSuDonVi.filter(item => item.maPL == 4).map(item => {
                    item.tenDonVi = item.tenDonVi.getFirstLetters();
                    return item;
                }), 'tenDonVi', [DefaultColors.blue, DefaultColors.orange]),

                listStaffGender: this.setUp(nhanSuCongTac, 'gioiTinh', [DefaultColors.green, DefaultColors.yellow]),
                listDiNuocNgoai: this.setUp(qtDiNuocNgoai, 'tenMucDich', DefaultColors.navy),
                listCongTacTrongNuoc: this.setUp(qtCongTacTrongNuoc, 'tenMucDich', DefaultColors.yellow),
                listNgach: this.setUp(nhanSuCongTac, 'tenNgach', DefaultColors.maroon),
                listDonVi: listDonVi.groupBy('maPl'),
                listHocHam: this.setUp(nhanSuCongTac, 'chucDanh', [DefaultColors.blue, DefaultColors.red], { '01': 'Giáo sư', '02': 'Phó giáo sư' }),
                listNhanSuTuyenDung: this.setUp(nhanSuCongTac.map(item => {
                    item.namCongTac = new Date(item.ngayCongTac)?.getFullYear() || null;
                    return item;
                }), 'namCongTac', DefaultColors.orange),
            }, () => this.setState({ isLoading: false }));
        });
    }

    handleTrinhDoHocVi = (nhanSuCongTac, value = null) => {
        let listHocViNam = listHocVi.map(hocVi => nhanSuCongTac.filter(item => item.hocVi == hocVi && item.gioiTinh == 'Nam' && (value ? value.id.includes(item.ngach) : true)).length),
            listHocViNu = listHocVi.map(hocVi => nhanSuCongTac.filter(item => item.hocVi == hocVi && item.gioiTinh == 'Nữ' && (value ? value.id.includes(item.ngach) : true)).length);
        this.setState({
            dataLevelByGender: {
                labels: listHocVi,
                datas: {
                    'Nam': listHocViNam,
                    'Nữ': listHocViNu,
                },
                colors: {
                    'Nam': DefaultColors.yellow,
                    'Nữ': DefaultColors.info
                }
            }
        });
    }

    setUp = (data = [], keyGroup, colors, mapper) => {
        let dataGroupBy = data.groupBy(keyGroup);
        delete dataGroupBy[null];
        return {
            labels: Object.keys(dataGroupBy).map(item => {
                if (mapper) return mapper[item] || 'Chưa xác định';
                else return item;
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


    handleGiaiDoan = (giaiDoan) => {
        if (!giaiDoan) {
            T.notify('Vui lòng nhập mốc thời gian', 'warning');
            this.giaiDoan.focus();
        } else this.initData(giaiDoan.getTime());
    }

    render() {
        let { nhanSuCongTac = [], tongCB = 0, soLuongDonVi = 0, listDonVi = [], listStaffGender
            = {}, listHocHam = {}, dataLevelByGender = {}, nhanSuKhoaBM = {}, nhanSuPhongBan = {}, nhanSuTrungTam = {}, nhanSuDoanThe = {}, listCongTacTrongNuoc = {}, listDiNuocNgoai = {}, listNgach = {}, listNhanSuTuyenDung = {}, fromTime = null } = this.state;
        return this.renderPage({
            icon: 'fa fa-bar-chart',
            title: 'Dashboard Phòng Tổ chức cán bộ',
            subTitle: `${fromTime ? ('Từ ' + T.dateToText(Number(fromTime), 'dd/mm/yyyy') + ' đến') : ''} ${new Date().ddmmyyyy()}`,
            content: this.state.isLoading ? loadSpinner() : <div className='row'>
                <div className='col-md-6 col-lg-4'>
                    <DashboardIcon type='primary' icon='fa-users' title='Cán bộ' value={tongCB} link='/user/tccb/staff' />
                </div>
                <div className='col-md-6 col-lg-4'>
                    <DashboardIcon type='warning' icon='fa-modx' title='Đơn vị' value={soLuongDonVi} link='/user/danh-muc/don-vi' />
                </div>
                <div className='col-md-6 col-lg-4'>
                    <DashboardIcon type='danger' icon='fa-tags' title='Khoa - Bộ môn' value={listDonVi[1]?.length || 0} link='/user/danh-muc/don-vi' />
                </div>
                <div className='col-md-6 col-lg-4'>
                    <DashboardIcon type='info' icon='fa-sticky-note' title='Phòng ban' value={listDonVi[2]?.length || 0} link='/user/danh-muc/don-vi' />
                </div>
                <div className='col-md-6 col-lg-4'>
                    <DashboardIcon type='info' icon='fa-building' title='Trung tâm - công ty' value={listDonVi[3]?.length || 0} link='/user/danh-muc/don-vi' />
                </div>
                <div className='col-md-6 col-lg-4'>
                    <DashboardIcon type='info' icon='fa-fire' title='Đoàn thể' value={listDonVi[4]?.length || 0} link='/user/danh-muc/don-vi' />
                </div>

                <ChartArea className='col-lg-6' title='Giới tính' chartType='doughnut' data={listStaffGender} aspectRatio={2} />

                <ChartArea className='col-lg-6' title='Chức danh khoa học' chartType='doughnut' data={listHocHam} aspectRatio={2} />

                <ChartArea className='col-lg-12' title='Trình độ học vị' chartType='bar' data={dataLevelByGender} aspectRatio={3}
                    renderFilter={
                        <FormSelect data={SelectAdapter_DmNgachCdnnV3} ref={e => this.hocViTheoNgach = e} style={{ position: 'absolute', top: '20px', right: '100px', width: '250px' }} allowClear placeholder='Chọn ngạch CDNN' onChange={value => this.handleTrinhDoHocVi(nhanSuCongTac, value)} />
                    } />

                <ChartArea className='col-lg-6' title='Nhân sự Khoa, bộ môn' chartType='bar' data={nhanSuKhoaBM} aspectRatio={1.5} />
                <ChartArea className='col-lg-6' title='Nhân sự phòng, ban' chartType='bar' data={nhanSuPhongBan} aspectRatio={1.5} />
                <ChartArea className='col-lg-6' title='Nhân sự trung tâm, công ty' chartType='line' data={nhanSuTrungTam} aspectRatio={2} />
                <ChartArea className='col-lg-6' title='Nhân sự đoàn thể' chartType='doughnut' data={nhanSuDoanThe} aspectRatio={2} />

                <ChartArea className='col-lg-6' title='Công tác trong nước' chartType='bar' data={listCongTacTrongNuoc} aspectRatio={2} />

                <ChartArea className='col-lg-6' title='Đi nước ngoài' chartType='bar' data={listDiNuocNgoai} aspectRatio={2} />

                <ChartArea className='col-lg-12' title='Chức danh nghề nghiệp' chartType='bar' data={listNgach} aspectRatio={3}
                    renderFilter={
                        <FormSelect data={SelectAdapter_DmDonVi} ref={e => this.ngachTheoDonVi = e} style={{ position: 'absolute', top: '20px', right: '100px', width: '250px' }} allowClear placeholder='Chọn đơn vị' onChange={value => this.setState({
                            listNgach: this.setUp(nhanSuCongTac.filter(item => value ? item.donVi == value.id : true), 'tenNgach', DefaultColors.maroon)
                        })} />
                    } />

                <ChartArea className='col-lg-12' title='Số cán bộ bắt đầu công tác theo các năm' chartType='line' data={listNhanSuTuyenDung} aspectRatio={3} />
            </div>,
            backRoute: '/user/tccb',
            breadcrumb: [
                <Link key={0} to='/user/tccb'>Tổ chức cán bộ</Link>,
                'Dashboard'
            ],
            header: <FormSelect data={listThoiGian} ref={e => this.giaiDoan = e} placeholder='Giai đoạn' style={{ marginRight: '40', width: '300px', marginBottom: '0' }} onChange={value => this.initData(value?.id || null)} allowClear />
        });
    }
}

const mapStateToProps = state => ({ system: state.system, dashboardTccb: state.tccb.dashboardTccb });
const mapActionsToProps = {
    getDashboardData
};
export default connect(mapStateToProps, mapActionsToProps)(Dashboard);
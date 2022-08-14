import React from 'react';
import { connect } from 'react-redux';
import CountUp from 'view/js/countUp';
import { getDashboardData } from './redux';
import { AdminPage, FormSelect, loadSpinner } from 'view/component/AdminPage';
import { AdminChart, DefaultColors } from 'view/component/Chart';
import { Link } from 'react-router-dom';
import { Tooltip } from '@mui/material';
import { SelectAdapter_DmDonVi } from 'modules/mdDanhMuc/dmDonVi/redux';

const thisDate = new Date().getDate(),
    thisMonthIndex = new Date().getMonth(),
    thisYear = new Date().getFullYear();

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

export class ChartArea extends React.Component {
    state = {}
    render() {
        let { className, title, chartType, data, aspectRatio = null, renderFilter = null } = this.props;
        return (
            <div className={className}>
                <div className='tile'>
                    <h5 className='tile-title' style={{ position: 'relative' }}>{title}</h5>
                    <span style={{ position: 'absolute', top: '20px', right: '20px' }}>
                        {!this.props.hideMinimize && <Tooltip title={this.state[title] ? 'Hiện' : 'Ẩn'} arrow>
                            <button className='btn btn-white' onClick={e => e.preventDefault() || this.setState({ [title]: !this.state[title] })} ><i className='fa fa-lg fa-minus' /></button>
                        </Tooltip>}
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
    state = { isLoading: true, xetDonVi: null };
    componentDidMount() {
        T.ready('/user/hcth', () => {
            this.initData(null);
        });
    }

    initData = (value) => {
        this.props.getDashboardData(value, data => {
            let { hcthCongVanDen = [], hcthCongVanDi = [], vanBanDenNam = [], vanBanDiNam = [], soLieu = [] } = data;

            this.setState({
                soLieu,
                vanBanDen: hcthCongVanDen[0].tongVanBanDen,
                vanBanDi: hcthCongVanDi[0].tongVanBanDi,
                fromTime: value,
                listVanBanDen: this.setUp(vanBanDenNam.map(item => {
                    item.namNhan = new Date(item.NGAY_NHAN)?.getFullYear() || null;
                    return item;
                }), 'namNhan', DefaultColors.orange),
                listVanBanDi: this.setUp(vanBanDiNam.map(item => {
                    item.namKy = new Date(item.NGAY_TAO)?.getFullYear() || null;
                    return item;
                }), 'namKy', DefaultColors.orange),
                listDonViNhan: this.state.xetDonVi ? this.handleCongVan(soLieu, this.state.xetDonVi) : this.setUp(soLieu.map(item => {
                    item.tenVt = item.tenDonVi.getFirstLetters();
                    return item;
                }), 'tenVt', DefaultColors.navy),
            }, () => this.setState({ isLoading: false }));
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
                    if (item[0] && item[0].numOfDocument) return item[0].numOfDocument;
                    else {
                        return item.length;
                    }
                })
            },
            colors: colors
        };
    }

    handleCongVan = (soLieu, value = null) => {
        if (value) {
            let listCv = soLieu.find(item => (value.id == item.maDonVi));

            this.setState({
                listDonViNhan: {
                    labels: [value.text],
                    datas: {
                        'Den': listCv && listCv.numOfDen != 0 ? [listCv.numOfDen] : [0],
                        'Di': listCv && listCv.numOfDi != 0 ? [listCv.numOfDi] : [0],
                    },
                    colors: {
                        'Den': DefaultColors.yellow,
                        'Di': DefaultColors.info
                    }

                },
                xetDonVi: value
            });
        } else {
            this.setState({
                listDonViNhan: this.setUp(soLieu.map(item => {
                    item.tenVt = item.tenDonVi.getFirstLetters();
                    return item;
                }), 'tenVt', DefaultColors.navy),
                xetDonVi: null
            });
        }
    }

    render() {
        let { vanBanDen = 0, vanBanDi = 0, fromTime = null,
            listVanBanDi = {}, listVanBanDen = {}, listDonViNhan = {}, soLieu = {}
        } = this.state;
        return this.renderPage({
            icon: 'fa fa-bar-chart',
            title: 'Dashboard Phòng HCTH',
            subTitle: `${fromTime ? ('Từ ' + T.dateToText(Number(fromTime), 'dd/mm/yyyy') + ' đến') : ''} ${new Date().ddmmyyyy()}`,
            content: this.state.isLoading ? loadSpinner() : <div className="row">
                <div className="col-md-6 col-lg-6">
                    <DashboardIcon type='primary' icon='fa-caret-square-o-left' title='Văn bản đến' value={vanBanDen} link='/user/hcth/van-ban-den' />
                </div>
                <div className="col-md-6 col-lg-6">
                    <DashboardIcon type='primary' icon='fa-caret-square-o-right' title='Văn bản đi' value={vanBanDi} link='/user/hcth/van-ban-di' />
                </div>
                <ChartArea className='col-lg-12' title='Đơn vị nhận' chartType='bar' data={listDonViNhan} aspectRatio={3}
                    renderFilter={
                        <FormSelect data={SelectAdapter_DmDonVi} ref={e => this.donVi = e} style={{ position: 'absolute', top: '20px', right: '100px', width: '200px' }} allowClear={true} placeholder='Chọn đơn vị' onChange={value => this.handleCongVan(soLieu, value)} />
                    }
                />
                <ChartArea className='col-lg-12' title='Số văn bản đến theo các năm' chartType='line' aspectRatio={4.5} data={listVanBanDen} />
                <ChartArea className='col-lg-12' title='Số văn bản đi theo các năm' chartType='line' aspectRatio={4.5} data={listVanBanDi} />
            </div>,
            backRoute: '/user/hcth',
            breadcrumb: [
                <Link key={0} to='/user/hcth'>HCTH</Link>,
                'Dashboard'
            ],
            header:
                <>
                    {<FormSelect data={listThoiGian} ref={e => this.giaiDoan = e} placeholder='Giai đoạn' style={{ marginRight: '40', width: '250px', marginBottom: '0' }} allowClear onChange={value => {
                        this.initData(value?.id || null);
                    }} />}
                </>
        });
    }
}



const mapStateToProps = state => ({ system: state.system, dashboardHcth: state.hcth.dashboardHcth });

const mapActionsToProps = {
    getDashboardData
};

export default connect(mapStateToProps, mapActionsToProps)(Dashboard);

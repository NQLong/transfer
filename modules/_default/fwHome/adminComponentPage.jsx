import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import CarouselPage from './adminCarouselView';
import VideoPage from './adminVideoView';
import ContentPage from './adminContentView';
import FeaturePage from './adminFeatureView';

class ComponentPage extends React.Component {
    componentDidMount() {
        T.ready('/user/truyen-thong', () => {
            let tabIndex = parseInt(T.cookie('componentPageTab')),
                navTabs = $('#componentPage ul.nav.nav-tabs');
            if (isNaN(tabIndex) || tabIndex < 0 || tabIndex >= navTabs.children().length) tabIndex = 0;
            navTabs.find('li:nth-child(' + (tabIndex + 1) + ') a').tab('show');
            $('#componentPage').fadeIn();

            $('a[data-toggle=\'tab\']').on('shown.bs.tab', e => {
                T.cookie('componentPageTab', $(e.target).parent().index());
            });
        });
    }

    render() {
        return (
            <main className='app-content' id='componentPage' style={{ display: 'none' }}>
                <div className='app-title'>
                    <div>
                        <h1><i className='fa fa-cogs' /> Thành phần giao diện</h1>
                        <p></p>
                    </div>
                    <ul className='app-breadcrumb breadcrumb'>
                        <Link to='/user'><i className='fa fa-home fa-lg' /></Link>
                        &nbsp;/&nbsp;Thành phần giao diện
                    </ul>
                </div>
                <ul className='nav nav-tabs'>
                    <li className='nav-item'><a className='nav-link active show' data-toggle='tab' href='#menuContent'>Bài viết</a></li>
                    <li className='nav-item'><a className='nav-link' data-toggle='tab' href='#menuCarousel'>Tập hình ảnh</a></li>
                    <li className='nav-item'><a className='nav-link' data-toggle='tab' href='#menuVideo'>Video</a></li>
                    {/* <li className='nav-item'><a className='nav-link' data-toggle='tab' href='#menuStatistic'>Thống kê</a></li> */}
                    {/* <li className='nav-item'><a className='nav-link' data-toggle='tab' href='#menuSlogan'>Slogan</a></li> */}
                    {/* <li className='nav-item'><a className='nav-link' data-toggle='tab' href='#menuLogo'>Logo</a></li> */}
                    <li className='nav-item'><a className='nav-link' data-toggle='tab' href='#menuTestimony'>Icon</a></li>
                    {/* <li className='nav-item'><a className='nav-link' data-toggle='tab' href='#menuStaffGroup'>Nhóm nhân viên</a></li> */}
                </ul>
                <div className='tab-content tile'>
                    <div className='tab-pane fade active show' id='menuContent'><ContentPage goUrl={url => this.props.history.push(url)} /></div>
                    <div className='tab-pane fade' id='menuCarousel'><CarouselPage goUrl={url => this.props.history.push(url)} /></div>
                    <div className='tab-pane fade' id='menuVideo'><VideoPage /></div>
                    {/* <div className='tab-pane fade' id='menuStatistic'><StatisticPage /></div> */}
                    {/* <div className='tab-pane fade' id='menuSlogan'><SloganPage /></div> */}
                    {/* <div className='tab-pane fade' id='menuLogo'><LogoPage /></div> */}
                    <div className='tab-pane fade' id='menuTestimony'><FeaturePage /></div>
                    {/* <div className='tab-pane fade' id='menuStaffGroup'><StaffGroupPage /></div> */}
                </div>
                <button onClick={() => {
                    this.props.history.goBack();
                }} className='btn btn-secondary btn-circle' style={{ position: 'fixed', bottom: '10px' }}>
                    <i className='fa fa-lg fa-reply' />
                </button>
            </main>
        );
    }
}

const mapStateToProps = state => ({ carousel: state.carousel });
const mapActionsToProps = {};
export default connect(mapStateToProps, mapActionsToProps)(ComponentPage);
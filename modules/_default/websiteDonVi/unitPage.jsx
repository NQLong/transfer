import React from 'react';
import { connect } from 'react-redux';
import { getWebsiteHinhDonVi } from './reduxWebsiteHinh';
import { getThongTinGioiThieu } from './reduxWebsiteGioiThieu';

const inComing = ['bounceIn', 'bounceInDown', 'bounceInLeft', 'bounceInRight', 'bounceInUp', 'fadeIn', 'fadeInDownBig', 'fadeInLeft', 'fadeInUp', 'fadeInUpBig', 'rotateIn', 'rotateInDownLeft', 'rotateInDownRight', 'rotateInUpLeft', 'rotateInUpRightIn', 'fadeInLeftBig', 'fadeInRight', 'fadeInRightBig'];
const outGoing = ['bounceOut', 'bounceOutDown', 'bounceOutLeft', 'bounceOutRight', 'bounceOutUp', 'fadeOut', 'fadeOutDown', 'fadeOutDownBig', 'fadeOutLeft', 'fadeOutLeftBig', 'fadeOutRight', 'fadeOutRightBig', 'fadeOutUp', 'fadeOutUpBig', 'rotateOutDownLeft', 'rotateOutDownRight', 'rotateOutUpLeft', 'rotateOutUpRight', 'flipOutY', 'rotateOut', 'slideOutDown'];

class UnitPage extends React.Component {
    state = {
        hoverItem: 0, leftAlbumIndex: 0, listImage: 0,
        photoIndex: 0, renderImageSlide: 0,
        isOpen: false, lengthImageGt: 0,
    }
    componentDidMount() {
        this.props.getWebsiteHinhDonVi(this.props.website.maDonVi, result => {
            this.getImage();
        });
        this.props.getThongTinGioiThieu(this.props.website.maDonVi, result => {
            this.getImageGioiThieu();
        });
    }

    componentWillUpdate(nextProps, nextState) {
        if ($('#carousel-gt').hasClass('owl-loaded') && (nextState.hoverItem != this.state.hoverItem)) {
            $('#carousel-gt').removeClass('owl-loaded owl-drag owl-hidden');
            $('#carousel-gt').find('.owl-nav').remove();
            $('#carousel-gt').find('.owl-dots').remove();
            $('#carousel-gt').find('.owl-stage-outer').children().unwrap();
            $('#carousel-gt').find('.owl-stage').children().unwrap();
            $('#carousel-gt').find('.owl-item').children().unwrap();
            $('#carousel-gt').removeData();
        }
    }
    componentDidUpdate(prevProps, prevState) {
        let checkLength = prevProps.dvWebsiteGioiThieu && prevProps.dvWebsiteGioiThieu.homeDv.length ? prevProps.dvWebsiteGioiThieu.homeDv[this.state.hoverItem].hinhAnh.length : 0;
        if (prevState.hoverItem != this.state.hoverItem && checkLength != 0) {
            $('#carousel-gt').owlCarousel({
                margin: 0,
                nav: true,
                dots: false,
                navText: ["<div class='next-button' style=' position: absolute; left: 10px'><div style='width: 0px; margin: 7px;border-top: 8px solid transparent; border-right: 10px solid #283889; border-bottom: 8px solid transparent'></div></div>"
                    , "<div class='next-button' style=' position: absolute; right: 10px'><div style='width: 0px; margin: 7px;margin-left: 10px;border-top: 8px solid transparent; border-left: 10px solid #283889; border-bottom: 8px solid transparent'></div></div>"],
                responsive: {
                    0: { items: 1 },
                    400: { item: 2 },
                    600: { items: 3 },
                    1000: { items: 4 }
                }
            });
        }
    }

    getImage() {
        const getRandomAnimationEntrance = () => inComing[Math.floor(Math.random() * inComing.length)];
        const getRandomAnimationExit = () => outGoing[Math.floor(Math.random() * outGoing.length)];
        $('.js-fullheight').css('height', $(window).height());
        $(window).resize(function () {
            $('.js-fullheight').css('height', $(window).height());
        });
        $('.carousel-testimony').owlCarousel({
            autoplay: true, loop: true,
            animateOut: getRandomAnimationEntrance(),
            animateIn: getRandomAnimationExit(),
            items: 1,
            margin: 0,
            stagePadding: 0,
            smartSpeed: 2000,
            responsive: {
                0: { items: 1 },
                600: { items: 1 },
                1000: { items: 1 }
            },
            onChange: () => {
                let settings = $('.carousel-testimony').data('owl.carousel');
                if (settings) {
                    settings.settings.animateIn = getRandomAnimationEntrance();
                    settings.settings.animateOut = getRandomAnimationExit();
                }
            }
        });
        T.ftcoAnimate();
    }
    getImageGioiThieu() {
        $(document).ready(function () {
            $('#carousel-gt').owlCarousel({
                margin: 0,
                nav: true,
                dots: false,
                navText: ["<div class='next-button' style=' position: absolute; left: 10px'><div style='width: 0px; margin: 7px;border-top: 8px solid transparent; border-right: 10px solid #283889; border-bottom: 8px solid transparent'></div></div>"
                    , "<div class='next-button' style=' position: absolute; right: 10px'><div style='width: 0px; margin: 7px;margin-left: 10px;border-top: 8px solid transparent; border-left: 10px solid #283889; border-bottom: 8px solid transparent'></div></div>"],
                responsive: {
                    0: { items: 1 },
                    400: { item: 2 },
                    600: { items: 3 },
                    1000: { items: 4 }
                }
            });
        });
    }

    render() {
        const { photoIndex, isOpen } = this.state;
        let listImage = this.props.dvWebsiteGioiThieu && this.props.dvWebsiteGioiThieu.homeDv.length ? this.props.dvWebsiteGioiThieu.homeDv[this.state.hoverItem].hinhAnh.map(item => item.image) : [];
        return (
            <div>
                <div className='first-component' >
                    <div className='carousel-testimony owl-carousel custom-carousel' style={{ paddingBottom: 3 }}>
                        {this.props.dvWebsiteHinh && this.props.dvWebsiteHinh.homeDv ? this.props.dvWebsiteHinh.homeDv.map((item, index) => (
                            <div key={index} className='item'>
                                <div className='hero-wrap' style={{ backgroundImage: `url('${item.image}')` }}>
                                    <div className='overlay' />
                                    <div className='container'>
                                        <div className='row no-gutters slider-text js-fullheight align-items-center justify-content-center'
                                            data-scrollax-parent='true'>
                                            <div className='col-md-12 ftco-animate owl-caption fixed-bottom text-center'>
                                                <a href={item.link}><h2 className='mb-3 bread' style={{ color: 'white' }}>{T.language.parse(item.tieuDe)}</h2></a>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )) : ''}
                    </div>
                </div>
                <div className='container-fluid' style={{ paddingTop: 15, paddingBottom: 60 }}>
                    <div className='row' >
                        <div className='col-12 col-3' style={{ minWidth: 300, maxWidth: 300, paddingTop: 10, marginLeft: 30 }}>
                            <div className='row'>
                                {this.props.dvWebsiteGioiThieu && this.props.dvWebsiteGioiThieu.homeDv.map((item, index) => {
                                    if (item.trongSo == 1) {
                                        return <div className='col-6 colKhoa' key={index} style={{ height: 140 }} >
                                            <div className={this.state.hoverItem != index ? 'boxKhoa' : 'boxKhoa boxKhoa-active'} style={{}} onClick={() => { this.setState({ hoverItem: index }) }}>
                                                <div style={{ width: '100%' }}>
                                                    {T.language.parse(item.ten)}
                                                </div>
                                            </div>
                                        </div>;
                                    } else {
                                        return <div className='col-12 colKhoa' key={index} style={{ height: 140 }}>
                                            <div className={this.state.hoverItem != index ? 'boxKhoa' : 'boxKhoa boxKhoa-active'} style={{}} onClick={() => { this.setState({ hoverItem: index }) }}>
                                                <div style={{ width: '100%', fontWeight: 'bold' }}>
                                                    {T.language.parse(item.ten)}
                                                </div>
                                            </div>
                                        </div>;
                                    }
                                })}
                            </div>
                        </div>

                        <div className='col-12 col-9' style={{ margin: 10, marginLeft: 20, display: 'flex', flex: 1, flexDirection: 'column', justifyContent: 'space-between' }}>
                            <div className='row'>
                                <div className='row col-12' id='renderImageSlide' style={{ textAlign: 'justify' }}>
                                    {this.props.dvWebsiteGioiThieu ?
                                        <p dangerouslySetInnerHTML={{
                                            __html: T.language.parse(this.props.dvWebsiteGioiThieu.homeDv.length ?
                                                this.props.dvWebsiteGioiThieu.homeDv[this.state.hoverItem].noiDung : '')
                                        }} />
                                        : ''}
                                </div>
                                <div className='col-12' style={{ textAlign: 'center', justifyContent: 'center', alignItems: 'center', paddingBottom: 5 }}>
                                    <div id='carousel-gt' className='carousel-testimony1 owl-carousel owl-theme' style={{ paddingBottom: 3, minWidth: 225, maxWidth: 950 }}>
                                        {this.props.dvWebsiteGioiThieu && this.props.dvWebsiteGioiThieu.homeDv.length ? this.props.dvWebsiteGioiThieu.homeDv[this.state.hoverItem].hinhAnh.map((item, index) => (
                                            <div key={index} className='item'>
                                                <img src={item.image} resizemode='strich'
                                                    onClick={() => this.setState({ isOpen: true, photoIndex: index })}
                                                    style={{ paddingLeft: 5, height: 150, width: 225, maxWidth: 225, cursor: 'pointer' }} />
                                            </div>
                                        )) : ''}

                                    </div>
                                    {/* <div style={{ whiteSpace: 'nowrap' }}>
                                        {isOpen && (
                                            <Lightbox
                                                mainSrc={listImage[photoIndex]}
                                                nextSrc={listImage[(photoIndex + 1) % listImage.length]}
                                                prevSrc={listImage[(photoIndex + listImage.length - 1) % listImage.length]}
                                                onCloseRequest={() => this.setState({ isOpen: false })}
                                                onMovePrevRequest={() =>
                                                    this.setState({
                                                        photoIndex: (photoIndex + listImage.length - 1) % listImage.length,
                                                    })
                                                }
                                                onMoveNextRequest={() =>
                                                    this.setState({
                                                        photoIndex: (photoIndex + 1) % listImage.length,
                                                    })
                                                }
                                            />
                                        )}
                                    </div> */}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {this.props.website && this.props.website.maDonVi &&
                    <div style={{ margin: '0 10px' }}>
                        {/* <SectionLeader maDonVi={this.props.website.maDonVi} /> */}
                        {/* <SectionNews level={0} maDonVi={this.props.website.maDonVi} linkAllNew={'/cse/news'} /> */}
                        {/* <SectionEvent divisionId={this.props.website.maDonVi} linkAllEvent={'/cse/events'} /> */}
                    </div>
                }
            </div>
        )
    }
}

const mapStateToProps = state => ({ system: state.system, dvWebsiteHinh: state.dvWebsiteHinh, dvWebsiteGioiThieu: state.dvWebsiteGioiThieu });
const mapActionsToProps = { getWebsiteHinhDonVi, getThongTinGioiThieu };
export default connect(mapStateToProps, mapActionsToProps)(UnitPage);
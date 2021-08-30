import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { homeGetCarousel } from './redux/reduxCarousel';

const inComing = ['bounceIn', 'bounceInDown', 'bounceInLeft', 'bounceInRight', 'bounceInUp', 'fadeIn', 'fadeInDownBig', 'fadeInLeft', 'fadeInUp', 'fadeInUpBig', 'rotateIn', 'rotateInDownLeft', 'rotateInDownRight', 'rotateInUpLeft', 'rotateInUpRightIn', 'fadeInLeftBig', 'fadeInRight', 'fadeInRightBig'];
const outGoing = ['bounceOut', 'bounceOutDown', 'bounceOutLeft', 'bounceOutRight', 'bounceOutUp', 'fadeOut', 'fadeOutDown', 'fadeOutDownBig', 'fadeOutLeft', 'fadeOutLeftBig', 'fadeOutRight', 'fadeOutRightBig', 'fadeOutUp', 'fadeOutUpBig', 'rotateOutDownLeft', 'rotateOutDownRight', 'rotateOutUpLeft', 'rotateOutUpRight', 'flipOutY', 'rotateOut', 'slideOutDown'];

class SectionCarousel extends React.Component {
    state = {};

    componentDidMount() {
        this.props.homeGetCarousel(this.props.viewId, carousel => this.setState(carousel));
    }

    componentDidUpdate() {
        const getRandomAnimationEntrance = () => inComing[Math.floor(Math.random() * inComing.length)];

        const getRandomAnimationExit = () => outGoing[Math.floor(Math.random() * outGoing.length)];

        $(document).ready(() => {
            setTimeout(() => {
                // $('.js-fullheight').css('height', $(window).height());
                // $(window).resize(function () {
                //     $('.js-fullheight').css('height', $(window).height());
                // });
                $('.carousel-testimony').owlCarousel({
                    autoplay: true, loop: true,
                    animateOut: getRandomAnimationEntrance(),
                    animateIn: getRandomAnimationExit(),
                    autoHeight: true,
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
            }, 250);
        })
    }

    render() {
        return (
            <div className='carousel-testimony owl-carousel custom-carousel'>
                {this.state.items ? this.state.items.map((item, index) => (
                    <div key={index} className='item'>
                        {item.link && item.link.includes('http') ?
                            <a target='_blank' href={item.link}>
                                <img src={item.image} alt='' />
                            </a> :
                            <Link to={item.link}>
                                <img src={item.image} alt='' />
                            </Link>}
                        {/* <div className='hero-wrap' style={{ backgroundImage: `url('${item.image}')` }}>
                            <div className='overlay' />
                            <div className='container'>
                                <div className='row no-gutters slider-text js-fullheight align-items-center justify-content-center'
                                    data-scrollax-parent='true'>
                                    <div className='col-md-12 ftco-animate owl-caption fixed-bottom text-center'>
                                        <p><a href={item.link}><h1 className='mb-3 bread'>{T.language.parse(item.title)}</h1></a></p>
                                        <p className='mb-3 bread description'>
                                            {T.language.parse(item.description)}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div> */}
                    </div>
                )) : ''}
            </div>
        )
    }
}

const mapStateToProps = state => ({ system: state.system });
const mapActionsToProps = { homeGetCarousel };
export default connect(mapStateToProps, mapActionsToProps)(SectionCarousel);

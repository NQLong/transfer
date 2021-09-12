/* eslint-disable react/jsx-no-duplicate-props */
import React from 'react';
import { connect } from 'react-redux';
import { homeGetCarousel } from './redux/reduxCarousel';

const texts = {
    vi: {
        title: 'THƯ VIỆN HÌNH ẢNH',
        viewAll: 'Xem tất cả'
    },
    en: {
        title: 'GALLERY',
        viewAll: 'View All'
    }
};

class SectionGallery extends React.Component {
    state = { items: [], title: 'THƯ VIỆN HÌNH ẢNH' };

    componentDidMount() {
        this.props.homeGetCarousel(this.props.item.viewId, gallery => {
            gallery.title = 'THƯ VIỆN HÌNH ẢNH';
            if (this.props.item && this.props.item.detail && JSON.parse(this.props.item.detail).valueTitleCom) {
                gallery.title = JSON.parse(this.props.item.detail).valueTitleCom;
            }
            gallery && this.setState(gallery);
        });
    }

    componentDidUpdate() {
        const done = (callback) => {
            const elements = $('.image-popup');
            if (elements.length) {
                const items = this.state.items.map(item => ({ src: item.image }));
                $('.image-popup').magnificPopup({
                    type: 'image',
                    items,
                    closeOnContentClick: true,
                    closeBtnInside: false,
                    fixedContentPos: true,
                    mainClass: 'mfp-no-margins mfp-with-zoom', // class to remove default margin from left and right side
                    gallery: {
                        enabled: true,
                        navigateByImgClick: true,
                        preload: [0, 1] // Will preload 0 - before current, and 1 after the current image
                    },
                    image: {
                        verticalFit: true
                    },
                    // zoom: {
                    //     enabled: true,
                    //     duration: 300 // don't foget to change the duration also in CSS
                    // }
                });
                callback && callback();
            } else {
                setTimeout(() => done(callback), 300);
            }
        };
        done(T.ftcoAnimate);
    }
    render() {
        const language = T.language(texts);
        return (
            <section data-aos='fade-up' className='h-100'>
                <div className='row' className='p-3 h-100'>
                    <div className='col-12 homeBorderLeft'>
                        <h3 className='homeTitle' style={{ color: '#0139A6', margin: 0 }}>
                            <strong>{this.state.title}</strong>
                        </h3>
                    </div>
                    <div className='row d-flex text-center gallery-image image-popup' style={{ overflow: 'hidden', borderRadius: '5px' }}>
                        {this.state.items.slice(0, 4).map((item, index) =>
                            <div className='col-lg-6 col-12' style={{ padding: '5px' }} key={index}>
                                <img src={item.image} alt='' style={{ width: '100%', height: '100%', borderRadius: '3%' }} />
                            </div>
                        )}
                    </div>
                    <div className='col-12 d-flex justify-content-center' style={{ paddingTop: 5 }}>
                        <a href='#' className='btn btn-lg btn-outline-dark px-5 viewAll image-popup' style={{ borderRadius: 0 }}>{language.viewAll}</a>
                    </div>
                </div>
            </section>
        );
    }
}

const mapStateToProps = state => ({ system: state.system });
const mapActionsToProps = { homeGetCarousel };
export default connect(mapStateToProps, mapActionsToProps)(SectionGallery);

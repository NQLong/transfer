import React from 'react';
import { connect } from 'react-redux';
import { getVideo } from './redux/reduxVideo';

class SectionVideo extends React.Component {
    state = { title: 'VIDEO' };

    componentDidMount() {
        if (this.props.item.viewId) {
            this.props.getVideo(this.props.item.viewId, item => {
                delete item.title;
                if (this.props.item && this.props.item.detail && JSON.parse(this.props.item.detail).valueTitleCom) {
                    item.title = JSON.parse(this.props.item.detail).valueTitleCom;
                }
                item && this.setState(item);
            });
        }

        const done = (callback) => {
            const elements = $('.popup-youtube, .popup-vimeo, .popup-gmaps');
            if (elements.length > 0) {
                $('.popup-youtube, .popup-vimeo, .popup-gmaps').magnificPopup({
                    disableOn: 700,
                    type: 'iframe',
                    mainClass: 'mfp-fade',
                    removalDelay: 160,
                    preloader: false,
                    fixedContentPos: false
                });
                callback && callback();
            } else {
                setTimeout(() => done(callback), 300);
            }
        };
        done(T.ftcoAnimate);
    }

    componentDidUpdate() {
        setTimeout(T.ftcoAnimate, 250);
    }

    render() {
        const videoUrl = this.state.link ? this.state.link : '',
            imageUrl = this.state.image ? this.state.image : '',
            width = $(window).width();

        return (
            <section data-aos='fade-up' className='h-100'>
                <div className='row' className='p-3 h-100'>
                    <div className='col-12 homeBorderLeft'>
                        <h3 className='homeTitle' style={{ color: '#0139A6', margin: 0 }}><strong>{this.state.title}</strong></h3>
                    </div>
                    <div className='col-12 p-0 popup-vimeo gallery-image' href={videoUrl}
                        style={{ backgroundImage: `url(${imageUrl})`, backgroundSize: 'contain', backgroundPosition: 'center', backgroundRepeat: 'no-repeat', position: 'relative', cursor: 'pointer', borderRadius: '5px', }}>
                        <a href={videoUrl} className='d-flex align-items-center justify-content-center' style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', borderRadius: '50%', backgroundColor: '#C2352B', width: width > 500 ? 90 : 40, height: width > 500 ? 90 : 40 }}>
                            <span className='fa fa-play' style={{ color: 'white', fontSize: width > 500 ? '40px' : '19px', paddingLeft: 5 }} />
                        </a>
                    </div>
                </div>
            </section>
        );
    }
}

const mapStateToProps = state => ({ video: state.video });
const mapActionsToProps = { getVideo };
export default connect(mapStateToProps, mapActionsToProps)(SectionVideo);
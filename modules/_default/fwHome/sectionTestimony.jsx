import React from 'react';
import { connect } from 'react-redux';
import { getTestimonyByUser } from './redux/reduxTestimony';

class SectionFeature extends React.Component {
    state = {};

    componentDidMount() {
        if (this.props.testimonyId) {
            this.props.getTestimonyByUser(this.props.testimonyId, testimony => testimony && this.setState({ testimony }));
        }
    }

    componentDidUpdate() {
        setTimeout(() => {
            $('.carousel-testimony').owlCarousel({
                items: 3,
                margin: 0,
                loop: true,
                nav: false,
                navText: [`<i class='fa fa-angle-left'/>`, `<i class='fa fa-angle-right'/>`],
                dots: true,
                autoplay: true,
                autoplayTimeout: 6000,
                smartSpeed: 1000,
                center: true,
                responsive: { 0: { items: 1 }, 576: { items: 2 }, 992: { items: 3 } }
            });

            var i = 0;
            $('.ftco-animate').waypoint(function (direction) {
                if (direction === 'down' && !$(this.element).hasClass('ftco-animated')) {
                    i++;
                    $(this.element).addClass('item-animate');
                    setTimeout(function () {
                        $('body .ftco-animate.item-animate').each(function (k) {
                            const el = $(this);
                            setTimeout(function () {
                                var effect = el.data('animate-effect');
                                if (effect === 'fadeIn') {
                                    el.addClass('fadeIn ftco-animated');
                                } else if (effect === 'fadeInLeft') {
                                    el.addClass('fadeInLeft ftco-animated');
                                } else if (effect === 'fadeInRight') {
                                    el.addClass('fadeInRight ftco-animated');
                                } else {
                                    el.addClass('fadeInUp ftco-animated');
                                }
                                el.removeClass('item-animate');
                            }, k * 50, 'easeInOutExpo');
                        });
                    }, 100);
                }
            }, { offset: '95%' });
        }, 250);
    }

    render() {

        const testimony = {
            title: {
                vi: 'TỰ HÀO LÀ SINH VIÊN NHÂN VĂN',
                en: 'PROUD TO BE STUDENT OF HCMUSSH'
            },
            image: '/img/img13.png',
            list: [
                {
                    title: {
                        vi: 'Trường ĐH KHXH&NV là trường công lập, có lịch sử hơn 60 năm hình thành và phát triển',
                        en: 'Trường ĐH KHXH&NV là trường công lập, có lịch sử hơn 60 năm hình thành và phát triển',
                    },
                    image: '/img/icon.png'
                },
                {
                    title: {
                        vi: 'Trường có quan hệ hợp tác và nghiên cứu với hơn 250 đối tác quốc tế',
                        en: 'Trường có quan hệ hợp tác và nghiên cứu với hơn 250 đối tác quốc tế',
                    },
                    image: '/img/icon.png'
                },
                {
                    title: {
                        vi: 'Dẫn đầu cả nước về số lượng sinh viên, học viên người nước ngoài',
                        en: 'Dẫn đầu cả nước về số lượng sinh viên, học viên người nước ngoài',
                    },
                    image: '/img/icon.png'
                },
                {
                    title: {
                        vi: 'Là trường thành viên của ĐHQG-HCM - hệ thống đại học đa ngành, đa lĩnh vực, chất lượng cao của cả nước',
                        en: 'Là trường thành viên của ĐHQG-HCM - hệ thống đại học đa ngành, đa lĩnh vực, chất lượng cao của cả nước',
                    },
                    image: '/img/icon.png'
                },
                {
                    title: {
                        vi: 'Là trường đại học đào tạo khối ngành khoa học xã hội và nhân văn lớn nhất phía Nam',
                        en: 'Là trường đại học đào tạo khối ngành khoa học xã hội và nhân văn lớn nhất phía Nam',
                    },
                    image: '/img/icon.png'
                },
                {
                    title: {
                        vi: 'Tiên phong khai mở những ngành đạo tạo mới, đáp ứng nhu cầu xã hội',
                        en: 'Tiên phong khai mở những ngành đạo tạo mới, đáp ứng nhu cầu xã hội',
                    },
                    image: '/img/img15.png'
                },
            ]
        }
        return (
            <section style={{ backgroundImage: `url(${testimony.image})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
                <div className='row p-3' style={{ backgroundColor: `rgba(48, 53, 145, 0.9)` }}>
                    <div className='col-12 text-center pt-3'><h3 className='homeTitle' style={{ color: 'white' }}><b>{T.language(testimony.title)}</b></h3></div>
                    {testimony.list.map((item, index) => (
                        <div key={index} className='col-lg-4 col-12 d-flex align-items-center py-3 py-lg-4'>
                            <img className='d-flex' src={item.image} alt={T.language(item.title)} height='100vw' />
                            <h6 className='d-flex text-justify pl-2 m-0 homeBody' style={{ color: 'white' }}><b>{T.language(item.title)}</b></h6>
                        </div>
                    ))}
                </div>
            </section>
        );
    }
}

const mapStateToProps = state => ({ testimony: state.testimony });
const mapActionsToProps = { getTestimonyByUser };
export default connect(mapStateToProps, mapActionsToProps)(SectionFeature);
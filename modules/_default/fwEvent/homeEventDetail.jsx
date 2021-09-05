import React from 'react';
import { connect } from 'react-redux';
import { getEventByUser } from './redux';
import SectionSideBar from 'view/component/SectionSideBar';
import { Link } from 'react-router-dom';

const texts = {
    vi: {
        eventTime: 'Thời gian diễn ra: ',
        registrationTime: 'Thời gian đăng ký: ',
        location: 'Địa điểm: ',
        unlimited: 'Không giới hạn',
        register: 'Đăng ký'
    }, en: {
        eventTime: 'Event time: ',
        registrationTime: 'Registration time: ',
        location: 'Location: ',
        unlimited: 'Unlimited',
        register: 'Register'
    }
};

class EventDetail extends React.Component {
    state = { language: '' };

    componentDidMount() {
        let url = window.location.pathname,
            isLink = url.startsWith('/su-kien/'),
            params = T.routeMatcher(isLink ? '/su-kien/:link' : '/event/item/:id').parse(url);
        this.setState({ id: params.id, link: params.link });
    }

    componentDidUpdate() {
        if (this.state.language != T.language()) {
            this.props.getEventByUser(this.state.id, this.state.link);
            this.setState({ language: T.language() });
        }

        setTimeout(() => {
            T.ftcoAnimate();
            $('html, body').stop().animate({ scrollTop: 0 }, 500, 'swing');
        }, 250);
    }

    render() {
        const language = T.language(texts);
        const width = $(window).width();
        const item = this.props.event && this.props.event.userEvent ? this.props.event.userEvent : null;
        if (item == null) {
            return <p>...</p>;
        } else {
            let categories = !item.categories ? [] : item.categories.map((categoryItem, index) => {
                return (<a key={index} href='#' className='tag-cloud-link'>{T.language.parse(categoryItem.text)}</a>);
            });
            let content = T.language.parse(item.content)
                .replaceAll('<strong>', '<b style="font-weight: bold;color:black;">')
                .replaceAll('</strong>', '</b>');

            return (
                <section className='ftco-section ftco-degree-bg'>
                    <div className='container-fluid'>
                        <div className='row'>
                            <div className='col-md-8 ftco-animate'>
                                <h2 className='mb-3' style={{ fontSize: width < 500 ? '25px' : '30px' }}>
                                    {item.isTranslate == 1 ? T.language.parse(item.title) : T.language.parse(item.title, true)[item.language]}
                                </h2>
                                <div className='row' style={{ justifyContent: 'flex-end', paddingBottom: 10 }}>
                                    <a href='#' onClick={() => { window.open(`http://www.facebook.com/sharer.php?u=${window.location.href}`); }}>
                                        <img src="https://vnuhcm.edu.vn/img/facebook.png" alt="Facebook" style={{ height: 18, width: 18 }} />
                                    </a>
                                    <a href='#' style={{ paddingLeft: 15 }}
                                        onClick={() => { window.open(`http://twitter.com/share?url=${window.location.href}`); }}>
                                        <img src="https://vnuhcm.edu.vn/img/tiwtter.png" alt="Twitter" style={{ height: 18, width: 18 }} />
                                    </a>
                                    <a href='#' style={{ paddingLeft: 15 }}
                                        onClick={() => { window.open(`https://plus.google.com/share?url=${window.location.href}`); }}>
                                        <img src="https://vnuhcm.edu.vn/img/google-plus.png" alt="Google plus" style={{ height: 18, width: 18 }} />
                                    </a>
                                </div>
                                <p>{item.abstract ? item.abstract.getText() : ''}</p>
                                {item.displayCover && item.image ? <p className='text-center'>
                                    <img src={item.image} className='img-fluid' style={{ width: item.image.includes('?t=') ? '100%' : '50%' }}
                                        alt={item.isTranslate == 1 ? T.language.parse(item.title) : T.language.parse(item.title, true)[item.language]} />
                                </p> : null}
                                <p dangerouslySetInnerHTML={{ __html: content }} />
                                <div className='tag-widget post-tag-container mb-5 mt-5'>
                                    <div className='tagcloud'>
                                        {categories}
                                    </div>
                                </div>
                                <div className='row'>
                                    <div className='col-12 col-md'>
                                        {item.location ? <p>{language.location}{item.location.getText()}</p> : null}
                                    </div>
                                </div>
                            </div>
                            <div className='col-md-4 sidebar ftco-animate'>
                                <SectionSideBar />
                            </div>

                        </div>
                    </div>
                </section>
            );
        }
    }
}

const mapStateToProps = state => ({ event: state.event });
const mapActionsToProps = { getEventByUser };
export default connect(mapStateToProps, mapActionsToProps)(EventDetail);
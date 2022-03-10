import React from 'react';
import { connect } from 'react-redux';
import { getEventInPageByCategory } from './redux';
import { Link } from 'react-router-dom';

const texts = {
    vi: {
        eventTime: 'Thời gian diễn ra: ',
        registrationTime: 'Thời gian đăng ký: ',
        location: 'Địa điểm: ',
        unlimited: 'Không giới hạn',
        register: 'Đăng ký',
        noEvent: ' ',
        title: 'DANH SÁCH SỰ KIỆN'
    }, en: {
        eventTime: 'Event time: ',
        registrationTime: 'Registration time: ',
        location: 'Location: ',
        unlimited: 'Unlimited',
        register: 'Register',
        noEvent: 'No event at the moment',
        title: 'LIST OF EVENTS'
    }
};

class EventListView extends React.Component {
    constructor(props) {
        super(props);
        this.state = {};
        this.loading = false;
    }

    componentDidMount() {
        if (this.props.item && this.props.item.view) {
            this.props.getEventInPageByCategory(1, 30, this.props.item.view.id,
                (data) => {
                    this.setState(data.page);
                });
        }
    }
    componentDidUpdate() {
        setTimeout(() => {
            T.ftcoAnimate();
            $('html, body').stop().animate({ scrollTop: 0 }, 500, 'swing');
        }, 250);
    }


    render() {
        const language = T.language(texts);
        const page = this.state.list;
        if (page == null) {
            return <p>{language.noEvent}</p>;
        } else {
            const width = $(window).width();
            let { list } = this.state;
            return (
                <section className='ftco-section ftco-degree-bg' style={width < 600 ? { paddingTop: 15 } : {}}>
                    <div className='container-fluid'>
                        <div className='row'>
                            <div className='col-md-11 col-12 ftco-animate'>
                                <h3 style={{ display: 'inline' }}><b>{language.title}</b></h3>
                                {list && list.map((item, index) => {
                                    const link = item.link ? '/su-kien/' + item.link : '/event/item/' + item.id;
                                    return (
                                        <div className='d-flex mb-5' key={index} >
                                            <Link to={link} className='mr-4 blog-img flex-shrink-0' style={{ width: '30%', minWidth: 110, maxWidth: 300 }} >
                                                <img src={item.image} style={{ width: '100%', paddingTop: 10 }} />
                                            </Link>
                                            <div className='d-flex flex-column justify-content-between w-100' style={{ width: '70%' }}>
                                                <div className='text mb-2'>
                                                    <Link to={link}><h4 className='heading text-justify homeHeading'><b>{T.language.parse(item.title)}</b></h4></Link>
                                                </div>
                                                {width > 1000 &&
                                                    <div className='text'>
                                                        <h6 className='homeBody text-justify'>{T.language.parse(item.abstract)}</h6>
                                                    </div>}
                                                <div className='d-flex justify-content-between'>
                                                    <a href='#'>
                                                        <span className='icon-calendar' />&nbsp; {T.dateToText(item.startPost)}
                                                    </a>
                                                    <div>{width > 1000 ? item.location : ''}</div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </section>
            );
        }
    }
}

const mapStateToProps = state => ({ event: state.event });
const mapActionsToProps = { getEventInPageByCategory };
export default connect(mapStateToProps, mapActionsToProps)(EventListView);
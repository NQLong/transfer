import React from 'react';
import { connect } from 'react-redux';
import { getEventWithQuestionByUser, getEventByUser } from './redux';
import { getQuestionInPageByUser } from '../fwForm/reduxQuestion';
import { Link } from 'react-router-dom';
// import HomeRegistrationForm from '../fwQuestionAndAnswer/homeRegistrationForm';
import HomeRegistrationForm from '../fwForm/home/homeRegistrationForm';

const texts = {
    vi: {
        homeTitle: 'Trang chủ',
        eventTitle: 'Sự kiện',
        register: 'Đăng ký sự kiện',
    },
    en: {
        homeTitle: 'Home',
        eventTitle: 'Event',
        register: 'Register event',
    }
};

class EventRegistration extends React.Component {
    constructor(props) {
        super(props);
        this.state = { language: '' };

        this.valueList = [];
        for (let i = 0; i < 50; i++) {
            this.valueList[i] = React.createRef();
        }

        this.state = { itemId: null };
    }

    componentDidMount() {
        let url = window.location.pathname,
            isLink = url.startsWith('/su-kien/'),
            params = T.routeMatcher(isLink ? '/su-kien/dangky/:link' : '/event/registration/item/:id').parse(url);
        this.props.getEventByUser(params.id, params.link);
    }

    componentDidUpdate() {
        setTimeout(() => {
            T.ftcoAnimate();
            $('.js-fullheight').css('height', $(window).height());
            $(window).resize(function () {
                $('.js-fullheight').css('height', $(window).height());
            });
        }, 250);
    }

    render() {
        const language = T.language(texts);
        const item = this.props.event && this.props.event.userEvent ? this.props.event.userEvent : null;
        if (item == null) {
            return <p>...</p>;
        } else {
            return (
                <div>
                    <div className='hero-wrap js-fullheight'
                        style={{
                            backgroundImage: `url(${item.image || '/img/avatar.png'})`,
                            backgroundAttachment: 'fixed',
                        }}>
                        {/* <div className='overlay' /> */}
                        <div className='container'>
                            <div className='row no-gutters slider-text js-fullheight align-items-center justify-content-center' data-scrollax-parent='true'>
                                <div className='col-md-8 ftco-animate text-center' style={{ background: `rgba(0,0,0,0.5)`, paddingTop: '15px' }}>
                                    <p className='breadcrumbs'><span className='mr-2'><Link to='/'>{language.homeTitle}</Link></span></p>
                                    <h1 className='mb-3 bread'>{item.title.getText()}</h1>
                                    <p>{language.register}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <section className='ftco-section ftco-degree-bg'>
                        <div className='container d-flex justify-content-center'>
                            <div style={{ minWidth: '60%' }}>
                                <HomeRegistrationForm className='row' formId={item.form} eventId={item.id} formInfo={{ startRegister: item.startRegister, stopRegister: item.stopRegister }} />
                            </div>
                        </div>
                    </section>
                </div>
            );
        }
    }
}

const mapStateToProps = state => {
    return ({ event: state.event, system: state.system, question: state.reduxQuestion, form: state.form })
};
const mapActionsToProps = { getEventWithQuestionByUser, getEventByUser, getQuestionInPageByUser };
export default connect(mapStateToProps, mapActionsToProps)(EventRegistration);
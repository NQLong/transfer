import React from 'react';
import { connect } from 'react-redux';
import { getEventInPageByUser, getEventInPageByCategory } from './redux';
import { Link } from 'react-router-dom';

const texts = {
    vi: {
        noEventsTitle: <h3> </h3>,
        eventsTitle: 'SỰ KIỆN',
        register: 'Đăng ký',
        view: 'Lượt xem',
        viewAll: 'Xem tất cả'
    },
    en: {
        noEventsTitle: <h3>No events!</h3>,
        eventsTitle: 'EVENTS',
        register: 'Register',
        view: 'View',
        viewAll: 'View All'
    }
};

class SectionEvent extends React.Component {
    state = {
        list: [], typeView: 1, title: 'SỰ KIỆN',
    }
    componentDidMount() {
        if (this.props.item && this.props.item.view) {
            this.props.getEventInPageByCategory(1, 6, this.props.item.view.id, data => {
                data.page.title = 'SỰ KIỆN';
                if (this.props.item.detail && JSON.parse(this.props.item.detail).valueTitleCom) {
                    data.page.title = JSON.parse(this.props.item.detail).valueTitleCom;
                }
                if (this.props.item.detail && JSON.parse(this.props.item.detail).viewTypeDisplay == 'Template 2')
                    data.page.typeView = 2;
                this.setState(data.page);
            });
        } else
            this.props.getEventInPageByUser(1, 6, data => {
                this.setState(data.page);
            });
    }

    componentDidUpdate() {
        setTimeout(T.ftcoAnimate, 250);
    }

    render() {
        const language = T.language(texts),
            eventList = this.state.list,
            detail = this.props.item && this.props.item.detail ? JSON.parse(this.props.item.detail) : {};
        let events = <span className='text-center w-100'>{this.state.title}</span>;
        if (eventList.length !== 0 && this.state.typeView == 1) {
            events = (
                <div className='col-12 row px-0 py-3 d-flex justify-content-start'>
                    <div className='col-lg-6 col-12 px-0 py-2'>
                        {eventList.slice(0, 3).map((item, index) => {
                            const link = item.link ? '/su-kien/' + item.link : '/event/item/' + item.id;
                            return (<div key={index} className='d-flex py-1 py-lg-3 px-0 row'>
                                <div className='col-4 col-lg-3' style={{ paddingRight: 0 }}>
                                    <div className='card border-light shadow' style={{ background: '#fafafa' }}>
                                        <div className='card-body px-0 py-1' >
                                            <h2 className='text-center mb-0 homeHeading' style={{ color: '#0139A6' }}><b>{(new Date(item.startEvent)).getDate()}</b></h2>
                                            <h5 className='card-text text-center homeHeading' style={{ color: '#0139A6' }}>{'THÁNG ' + (parseInt(new Date(item.startEvent).getMonth()) + 1)}</h5>
                                        </div>
                                    </div>
                                </div>
                                <div className='col-8 col-lg-9 text-justify'>
                                    <Link to={link}><h5 className='mb-0 homeBody' style={{ color: '#626262' }}><b>{item.isTranslate == 1 ? T.language.parse(item.title) : T.language.parse(item.title, true).vi}</b></h5></Link>
                                    <h5 className='mb-0 homeBody' style={{ color: '#626262' }}> {item.location}</h5>
                                </div>
                            </div>)
                        })}
                    </div>
                    <div className='col-lg-6 col-12 px-0 py-2'>
                        {eventList.slice(3, 6).map((item, index) => {
                            const link = item.link ? '/su-kien/' + item.link : '/event/item/' + item.id;
                            return (<div key={index} className='d-flex py-1 py-lg-3 px-0 row'>
                                <div className='col-4 col-lg-3' style={{ paddingRight: 0 }}>
                                    <div className='card border-light shadow' style={{ background: '#fafafa' }}>
                                        <div className='card-body px-0 py-1' >
                                            <h2 className='text-center mb-0 homeHeading' style={{ color: '#0139A6' }}><b>{(new Date(item.startEvent)).getDate()}</b></h2>
                                            <h5 className='card-text text-center homeHeading' style={{ color: '#0139A6' }}>{'THÁNG ' + (parseInt(new Date(item.startEvent).getMonth()) + 1)}</h5>
                                        </div>
                                    </div>
                                </div>
                                <div className='col-8 col-lg-9 text-justify'>
                                    <Link to={link}><h5 className='mb-0 homeBody' style={{ color: '#626262' }}><b>{item.isTranslate == 1 ? T.language.parse(item.title) : T.language.parse(item.title, true).vi}</b></h5></Link>
                                    <h5 className='mb-0 homeBody' style={{ color: '#626262' }}> {item.location}</h5>
                                </div>
                            </div>)
                        })}
                    </div>
                    <div className='col-12 d-flex justify-content-center'>
                        <Link to={detail.linkSeeAll} className='btn btn-lg btn-outline-dark px-5 viewAll' style={{ borderRadius: 0 }}>{language.viewAll}</Link>
                    </div>
                </div>
            )
        } else if (eventList.length !== 0 && this.state.typeView == 2) {
            events = (<div className='col-12 row px-0 py-3 d-flex justify-content-start'>
                <div className='col-12 px-0 py-2'>
                    {eventList.slice(0, 3).map((item, index) => {
                        const link = item.link ? '/su-kien/' + item.link : '/event/item/' + item.id;
                        return (<div key={index} className='d-flex py-1 py-lg-3 px-0 row'>
                            <div className='col-4 col-lg-3' style={{ paddingRight: 0 }}>
                                <div className='card border-light shadow' style={{ background: '#fafafa' }}>
                                    <div className='card-body px-0 py-1' >
                                        <h2 className='text-center mb-0 homeHeading' style={{ color: '#0139A6' }}><b>{(new Date(item.startEvent)).getDate()}</b></h2>
                                        <h5 className='card-text text-center homeHeading' style={{ color: '#0139A6' }}>{'THÁNG ' + (parseInt(new Date(item.startEvent).getMonth()) + 1)}</h5>
                                    </div>
                                </div>
                            </div>
                            <div className='col-8 col-lg-9 text-justify'>
                                <Link to={link}><h5 className='mb-0 homeBody' style={{ color: '#626262' }}><b>{item.isTranslate == 1 ? T.language.parse(item.title) : T.language.parse(item.title, true).vi}</b></h5></Link>
                                <h5 className='mb-0 homeBody' style={{ color: '#626262' }}> {item.location}</h5>
                            </div>
                        </div>)
                    })}
                </div>
                <div className='col-12 d-flex justify-content-center'>
                    <Link to={detail.linkSeeAll} className='btn btn-lg btn-outline-dark px-5 viewAll' style={{ borderRadius: 0 }}>{language.viewAll}</Link>
                </div>
            </div>)
        }

        return (
            <section className='p-3' data-aos='fade-up'>
                <div className='row mb-3'>
                    <div className='col-12 homeBorderLeft'>
                        <h3 className='text-left homeTitle' style={{ color: '#0139A6', margin: 0 }}><strong>{this.state.title}</strong></h3>
                    </div>
                </div>
                {events}
            </section>
        );
    }
}

const mapStateToProps = state => ({ event: state.event, system: state.system });
const mapActionsToProps = { getEventInPageByUser, getEventInPageByCategory };
export default connect(mapStateToProps, mapActionsToProps)(SectionEvent);
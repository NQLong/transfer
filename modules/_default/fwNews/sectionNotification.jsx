import React from 'react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import { getNewsByNotification } from './redux';

class SectionNotification extends React.Component {
    componentDidMount() {
        this.props.getNewsByNotification();
    }
    render() {
        const text = {
            vi: {
                noNewsTitle: <h3> </h3>,
                newsTitle: 'THÔNG BÁO',
                view: 'Lượt xem',
                viewAll: 'Xem tất cả'
            },
            en: {
                noNewsTitle: <h3>No latest notification!</h3>,
                newsTitle: 'NOTIFICATION',
                view: 'View',
                viewAll: 'View All'
            }
        };
        const language = T.language(text),
            detail = this.props.item && this.props.item.detail ? JSON.parse(this.props.item.detail) : {};

        let notification = <span className='text-center w-100'>{language.noNewsTitle}</span>;

        const notificationList = this.props.news && this.props.news.notification && this.props.news.notification.list ? this.props.news.notification.list : [];

        if (notificationList.length !== 0) {
            notification = (
                <>
                    <div className='col-12 row py-3'>
                        {notificationList.slice(0, 9).map((item, index) => {
                            const link = item.link ? '/tin-tuc/' + item.link : '/news/item/' + item.id;
                            return (
                                <div key={index} className='col-12 px-0 pb-2 mb-3 text-justify' style={(index !== notificationList.length - 1) ? { borderBottom: 'dashed 1px #dacaba' } : {}}>
                                    <Link to={link}><h6 className='homeBody' style={{ color: '#676767' }}><b>{item.isTranslate == 1 ? T.language.parse(item.title) : T.language.parse(item.title, true)[item.language]}</b></h6></Link>
                                </div>
                            );
                        })}
                    </div>
                    <div className='col-12 d-flex justify-content-center'>
                        {/* <a href='/thong-bao' className='btn btn-lg btn-outline-dark px-5 viewAll' style={{ borderRadius: 0 }}>{language.viewAll}</a> */}
                        <Link to={detail.linkSeeAll} className='btn btn-lg btn-outline-dark px-5 viewAll' style={{ borderRadius: 0 }}>{language.viewAll}</Link>
                    </div>
                </>
            );
        }

        return (
            <section data-aos='fade-up' className='row p-3'>
                <div className='col-12 homeBorderLeft'>
                    <h3 className='homeTitle' style={{ color: '#0139A6', margin: 0 }}><strong>{language.newsTitle}</strong></h3>
                </div>
                {notification}
            </section>);
    }
}

const mapStateToProps = state => ({ news: state.news, system: state.system });
const mapActionsToProps = { getNewsByNotification };
export default connect(mapStateToProps, mapActionsToProps)(SectionNotification);
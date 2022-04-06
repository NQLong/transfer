import React from 'react';
import { connect } from 'react-redux';
import { getEventFeed } from 'modules/mdTruyenThong/fwEvent/redux';
import { getNewsFeed, getNewsFeedByCategory } from 'modules/mdTruyenThong/fwNews/redux';
import { getNews } from 'modules/mdTruyenThong/fwNews/redux';
let texts = {
    vi: {
        homeTitle: 'Trang chủ',
        eventTitle: 'Sự kiện',
        register: 'Đăng ký',
        category: 'Danh mục',
        recentEvent: 'Sự kiện mới',
        recentNews: 'Tin tức mới',
        locationANumber: 'Địa điểm và số lượng đăng kí',
        location: 'Địa điểm',
        number: 'Số lượng đăng kí',
        registerTime: 'Thời gian đăng kí',
        eventTime: 'Thời gian bắt đầu',
        updateLater: 'Cập nhật sau',
        unlimited: 'Không giới hạn',
        forever: 'Không kết thúc',
    },
    en: {
        homeTitle: 'Home',
        eventTitle: 'Event',
        register: 'Register',
        category: 'Category',
        recentEvent: 'Recent Events',
        recentNews: 'Recent News',
        locationANumber: 'Location and number of registers',
        location: 'Location',
        number: 'Number of registers',
        registerTime: 'Register time',
        eventTime: 'Event time',
        updateLater: 'Update later',
        unlimited: 'Unlimited',
        forever: 'Forever',
    }
};

class SectionSideBar extends React.Component {
    state = {
        recentNews: {
            vi: { recentNews: 'Tin tức mới' },
            en: { recentNews: 'Recent News' },
        }
    }
    componentDidMount() {
        let url = window.location.pathname,
            route = T.routeMatcher(
                url.startsWith('/tin-tuc/') ? '/tin-tuc/:link'
                    : (url.startsWith('/news/item/') ? '/news/item/:id'
                        : (url.startsWith('/news-en/item/') ? '/news-en/item/:id'
                            : '/article/:link')));
        const newsId = this.props.newsId ? this.props.newsId
            : route.parse(window.location.pathname) ?
                route.parse(window.location.pathname).newsId : null,
            maDonVi = this.props.maDonVi ? this.props.maDonVi : 0;
        if (newsId) this.getData(newsId, maDonVi); else
            this.props.getEventFeed();
    }
    componentDidUpdate(prevProps) {
        if (prevProps.newsId != this.props.newsId) {
            this.getData(this.props.newsId);
        }
    }
    getData = (newsId, maDonVi) => {
        this.props.getNews(newsId, data => {
            if (data.error) {
                T.notify('Lấy tin tức bị lỗi!', 'danger');
                this.props.history.push('/user/news/list');
            } else if (data.item && data.item.categories && data.item.categories.length && data.categories) {
                let categories = data.item.categories;
                if (categories[0] == 1) {
                    this.setState({
                        recentNews: {
                            vi: { recentNews: 'Thông báo mới' },
                            en: { recentNews: 'Lastest News' },
                        }
                    });
                    this.props.getNewsFeedByCategory(1);
                } else if (categories[0] == 2) {
                    this.setState({
                        recentNews: {
                            vi: { recentNews: 'Tin tuyển sinh mới' },
                            en: { recentNews: 'Lastest News' },
                        }
                    }); this.props.getNewsFeedByCategory(2);
                } else {
                    this.props.getNewsFeedByCategory(categories[0]);
                }
            } else {
                this.props.getNewsFeed(maDonVi);
            }
        });
    }

    render() {
        const language = T.language(texts);
        const temp = T.language(this.state.recentNews);
        const recentEvents = (this.props.event && this.props.event.newsFeed ? this.props.event.newsFeed : []).map((item, index) => {
            const link = item.link ? '/su-kien/' + item.link : '/event/item/' + item.id;
            return (
                <div key={index} className='block-21 mb-4 d-flex'>
                    <a href={link} className='blog-img' style={{ backgroundImage: `url('${item.image}')` }} />
                    <div className='text ml-9'>
                        <h3 className='heading' style={{ paddingLeft: 10 }}><a href={link}>{T.language.parse(item.title)}</a></h3>
                        {/* <div className='meta'>
                            <div><a href='#'>
                                <span className='icon-calendar' />&nbsp; {T.dateToText(item.createdDate)}
                            </a></div>
                        </div> */}
                    </div>
                </div>
            );
        });
        const recentNews = (this.props.news && this.props.news.newsFeed ? this.props.news.newsFeed : []).map((item, index) => {
            return (
                <div key={index} className='block-21 mb-4 d-flex'>
                    <a href={T.linkNewsDetail(item)} className='blog-img' style={{ backgroundImage: `url('${item.image}')` }} />
                    <div className='text'>
                        <h3 className='heading text-justify'>
                            <a href={T.linkNewsDetail(item)}
                                style={{ display: '-webkit-box', WebkitLineClamp: 4, WebkitBoxOrient: 'vertical', overflow: 'hidden', paddingLeft: 10 }}>{T.language.parse(item.title)}</a></h3>
                    </div>
                </div>
            );
        });
        return (
            <React.Fragment>
                {this.props.newsId ? <div className='sidebar-box ftco-animate'>
                    <h3>{temp.recentNews}</h3>
                    {recentNews}
                </div> :
                    <div className='sidebar-box ftco-animate'>
                        <h3>{language.recentEvent}</h3>
                        {recentEvents}
                    </div>
                }

            </React.Fragment>
        );
    }
}

const mapStateToProps = state => ({ event: state.event, news: state.news });
const mapActionsToProps = { getEventFeed, getNewsFeed, getNews, getNewsFeedByCategory };
export default connect(mapStateToProps, mapActionsToProps)(SectionSideBar);
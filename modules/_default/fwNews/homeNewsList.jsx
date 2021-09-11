import React from 'react';
import { connect } from 'react-redux';
import { getNewsByUser, getNewsInPageByUser, getNewsByCategory } from './redux';
import { Link } from 'react-router-dom';

const texts = {
    vi: {
        'news': 'TIN TỨC MỚI',
        'admission': 'THÔNG TIN TUYỂN SINH',
        'notification': 'THÔNG BÁO MỚI',
        'noNews': 'KHÔNG CÓ BÀI VIẾT!'
    },
    en: {
        'news': 'LASTEST NEWS',
        'admission': 'ADMISSION NEWS',
        'notification': 'LAST NOTIFICATION',
        'noNews': 'THERE IS NO NEWS!'
    }
};

class NewsDetail extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            title: ''
        };
    }

    componentDidMount() {
        let url = window.location.pathname,
            params = T.routeMatcher('/news/list/:category').parse(url),
            category = '';
        this.setState({ title: params.category });
        if (params.category === 'notification') {
            category = 1;
        } else if (params.category === 'admission') {
            category = 2;
        } else {
            category = 3;
        }

        this.props.getNewsByCategory(null, null, category);
    }

    componentDidUpdate() {

        setTimeout(() => {
            T.ftcoAnimate();
            $('html, body').stop().animate({ scrollTop: 0 }, 500, 'swing');
        }, 250);
    }

    render() {
        const language = T.language(texts);
        const width = $(window).width();
        let { list } = this.props.news && this.props.news.userPage ?
            this.props.news.userPage : { list: [] };
        let newsList = <p>Không có bài viết</p>;
        if (list.length > 0) {
            newsList = list.map((item, index) => {
                if (item.active && !item.isInternal) {
                    const link = item.link ? '/tin-tuc/' + item.link : '/news/item/' + item.id;
                    return (
                        <div className='d-flex mb-5' key={index}>
                            <Link to={link} className='mr-4 blog-img flex-shrink-0' style={{ width: '30%', minWidth: 110, maxWidth: 300 }} >
                                <img src={item.image} style={{ width: '100%', paddingTop: 10 }} />
                            </Link>
                            <div className='d-flex flex-column justify-content-between' style={{ width: '70%' }}>
                                <div className='text mb-2'>
                                    <Link to={link}><p className='heading text-justify homeHeading'
                                        style={{ color: 'black', fontSize: width > 900 ? '1.7vw' : 18 }}><b>{item.isTranslate == 1 ? T.language.parse(item.title) : T.language.parse(item.title, true)[item.language]}</b></p></Link>
                                </div>
                                {width > 1000 &&
                                    <div className='text'>
                                        <h6 className='homeBody text-justify'>{item.isTranslate == 1 ? T.language.parse(item.abstract) : T.language.parse(item.abstract, true)[item.language]}</h6>
                                    </div>}
                                <div>
                                    <a href='#'>
                                        <span className='icon-calendar' />&nbsp; {T.dateToText(item.startPost)}
                                    </a>
                                </div>
                            </div>
                        </div>
                    );
                }
            });
        }
        return (
            <section className='ftco-section ftco-degree-bg' style={width < 600 ? { paddingTop: 15 } : {}}>
                <div className='container-fluid' >
                    <div className='row'>
                        <div className='col-md-11 col-12 ftco-animate'>
                            <h1 className='heading mb-5' style={{ fontSize: '1.5rem' }}><b>{language[this.state.title]}</b></h1>
                            {newsList}
                            <div style={{ transform: 'translate(0px, 3rem)' }}>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        );
    }
}

const mapStateToProps = state => ({ news: state.news });
const mapActionsToProps = { getNewsByUser, getNewsInPageByUser, getNewsByCategory };
export default connect(mapStateToProps, mapActionsToProps)(NewsDetail);
import React from 'react';
import { connect } from 'react-redux';
import { getNewsByUser } from './redux';
import SectionSideBar from 'view/component/SectionSideBar';

const texts = {
    vi: {
        attachments: 'Tệp tin đính kèm:',
    },
    en: {
        attachments: 'Attachment files:',
    }
}

class NewsDetail extends React.Component {
    constructor (props) {
        super(props);
        this.state = { language: '' };
    }

    componentDidMount() {
        let url = window.location.pathname,
            params = T.routeMatcher(
                url.startsWith('/tin-tuc/') ? '/tin-tuc/:link'
                    : (url.startsWith('/news/item/') ? '/news/item/:id'
                        : (url.startsWith('/news-en/item/') ? '/news-en/item/:id'
                            : '/article/:link'))).parse(url);
        this.setState({
            id: params.id, link: params.link,
            type: url.startsWith('/tin-tuc/') || url.startsWith('/news/item/') ? 'vi' : 'en'
        });
    }

    componentDidUpdate() {
        if (this.state.language != T.language()) {
            this.props.getNewsByUser(this.state.id, this.state.link, this.state.type);
            this.setState({ language: T.language() });
        }

        setTimeout(() => {
            T.ftcoAnimate();
            $('html, body').stop().animate({ scrollTop: 0 }, 500, 'swing');
        }, 250);
    }

    render() {
        const language = T.language(texts);
        const item = this.props.news && this.props.news.userNews ? this.props.news.userNews : null;
        const width = $(window).width();
        if (item == null) {
            return <p>...</p>;
        } else {
            let categories = !item.categories ? [] : item.categories.map((categorieItem, index) =>
                <a key={index} href='#' className='tag-cloud-link'>{T.language.parse(categorieItem.text)}</a>);
            let attachments = item.listAttachment ? item.listAttachment.map((item, index) =>
                <div key={index}>
                    <a href={'/api/storage/download/' + item.path} download>{item.nameDisplay} </a>
                </div>
            ) : null;
            let content = T.language.parse(item.content)
                .replaceAll('<strong>', '<b style="font-weight: bold;">')
                .replaceAll('</strong>', '</b>');
            return (
                <section className='ftco-section ftco-degree-bg'>
                    <div className='container-fluid'>
                        <div className='row'>
                            <div className='col-md-8 ftco-animate'>
                                <h2 className='mb-3' style={{ fontSize: width < 500 ? '25px' : '30px' }}>
                                    {T.language.parse(item.title)}
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
                                {item.displayCover && item.image ?
                                    <p style={{ display: 'block', textAlign: 'center' }}>
                                        <img src={item.image}
                                            style={{ width: '100%' }} className='img-fluid'
                                            alt={item.isTranslate == 1 ? T.language.parse(item.title) : T.language.parse(item.title, true)[item.language]} />
                                    </p> : null}
                                <p className='homeContent'
                                    dangerouslySetInnerHTML={{
                                        __html: content
                                    }} />
                                {attachments &&
                                    <div>
                                        {language.attachments}
                                        {attachments}
                                    </div>}
                                {width < 500 ? <div style={{ width: '100%', }}>
                                    <img src='https://i.giphy.com/media/Y3alJyRof3xcddXkew/giphy.webp' style={{ width: '100%', height: '100%', }} />
                                </div> : null}

                                <div className='tag-widget post-tag-container mb-5 mt-5'>
                                    <div className='tagcloud'>
                                        {categories}
                                    </div>
                                </div>
                            </div>
                            {item.id && <div className='col-md-4 sidebar ftco-animate'>
                                <SectionSideBar newsId={item.id} maDonVi={item.maDonVi} />
                            </div>}
                        </div>
                    </div>
                </section>
            );
        }
    }
}

const mapStateToProps = state => ({ news: state.news });
const mapActionsToProps = { getNewsByUser };
export default connect(mapStateToProps, mapActionsToProps)(NewsDetail);
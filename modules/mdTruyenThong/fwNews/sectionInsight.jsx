import React from 'react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import { getNewsByCategory } from './redux';
const text = {
    vi: {
        noNewsTitle: <h3> </h3>,
        newsTitle: 'THÔNG BÁO',
        view: 'Lượt xem',
        viewAll: 'Xem tất cả'
    },
    en: {
        noNewsTitle: <h3>No latest news!</h3>,
        newsTitle: 'news',
        view: 'View',
        viewAll: 'View All'
    }
};
class SectionInsight extends React.Component {
    state = {
        list: [], category: { vi: ' ', en: ' ' }, linkSeeAll: ''
    }
    componentDidMount() {
        if (this.props.item && this.props.item.viewId) {
            let category = { vi: ' ', en: ' ' }, linkSeeAll;
            if (this.props.item && this.props.item.detail) {
                const detail = JSON.parse(this.props.item.detail);
                category.vi = detail.valueTitleCom;
                category.en = detail.valueTitleCom;
                linkSeeAll = detail.linkSeeAll;
            }
            this.props.getNewsByCategory(1, 5, this.props.item.viewId, data => {
                if (data.list) this.setState({ ...data, category, linkSeeAll });
            });
        }
    }
    render() {
        const language = T.language(this.state.category),
            width = $(window).width();
        let news = <span className='text-center w-100'>{language.noNewsTitle}</span>;
        const newsList = this.state.list,
            viewAll = T.language(text).viewAll;
        if (newsList.length == 5) {
            news = (
                <>
                    <div className='col-12 row px-0 py-3 d-flex justify-content-start'>
                        <div className='col-lg-4 col-12 px-0 py-2'>
                            <Link to={newsList[0].link ? '/tin-tuc/' + newsList[0].link : '/news/item/' + newsList[0].id}
                                className='block-20'
                                style={{ backgroundImage: `url(${newsList[0].image})`, backgroundSize: 'cover', borderRadius: '5px', height: width > 991 ? '21vw' : null }} />
                        </div>
                        <div className='col-lg-4 col-12 pt-3 pt-lg-0' style={{ borderRight: width > 990 ? '1px solid grey' : 0 }}>
                            <Link to={newsList[0].link ? '/tin-tuc/' + newsList[0].link : '/news/item/' + newsList[0].id}
                                style={{ fontWeight: 'bold', fontSize: width > 991 ? '1.3vw' : '4vw', color: '#4d4d4d' }}>{T.language.parse(newsList[0].title)}
                            </Link>
                            <div style={{ paddingTop: 13, fontSize: width > 991 ? '1.15vw' : '3.15vw' }}> {T.language.parse(newsList[0].abstract)}</div>
                        </div>
                        {width > 991 ? <div className='col-lg-4 col-12 pt-3 pt-lg-0'>
                            <Link to={newsList[1].link ? '/tin-tuc/' + newsList[1].link : '/news/item/' + newsList[1].id}
                                style={{ fontWeight: 'bold', fontSize: '1.3vw', color: '#4d4d4d' }}>{T.language.parse(newsList[1].title)}
                            </Link>
                            <div style={{ paddingTop: 13, fontSize: '1.14vw' }}> {T.language.parse(newsList[1].abstract)}</div>
                        </div> : null}

                    </div>
                    {width > 992 ?
                        <>
                            <div style={{ height: 1, width: '100%', backgroundColor: 'grey' }} />
                            <div className='col-12 row px-0 py-3 d-flex justify-content-start'>
                                {newsList.slice(2, 5).map((item, key) => {
                                    const link = item.link ? '/tin-tuc/' + item.link : '/news/item/' + item.id;
                                    return (<div key={key} className='col-lg-4 col-12 pt-3 pt-lg-0 d-flex'>
                                        <div style={{ paddingTop: 2 }}>
                                            <i className='icon fa fa-circle' />
                                        </div>
                                        <Link to={link}
                                            style={{ fontWeight: 'bold', fontSize: '1.3vw', paddingLeft: 10, color: '#4d4d4d' }} >
                                            {T.language.parse(item.title)}
                                        </Link>
                                    </div>);
                                })}
                            </div>
                        </>
                        : <div className='col-12 row px-0 pb-3 d-flex justify-content-start'>
                            {newsList.slice(1, 5).map((item, key) => {
                                const link = item.link ? '/tin-tuc/' + item.link : '/news/item/' + item.id;
                                return (<div key={key} className='col-lg-4 col-12 pt-2 d-flex text-justify'>
                                    <Link to={link}
                                        style={{ fontWeight: 'bold', fontSize: '4vw', color: '#4d4d4d', lineHeight: 1.2 }} >
                                        {T.language.parse(item.title)}
                                        <span style={{ fontStyle: 'italic' }}>
                                            {`  ${T.dateToText(item.startPost).slice(0, 10)}`}
                                        </span>
                                    </Link>
                                </div>);
                            })}
                        </div>}
                    <div className='col-12 d-flex justify-content-center'>
                        <Link to={this.state.linkSeeAll} className='btn btn-lg btn-outline-dark px-5 viewAll' style={{ borderRadius: 0 }}>{viewAll}</Link>
                    </div>
                </>
            );
        }
        return (
            <section data-aos='fade-up' className='row p-3'>
                {!!language && <div className='col-12 homeBorderLeft'>
                    <h3 className='homeTitle' style={{ color: '#0139A6', margin: 0 }}><strong>{language}</strong></h3>
                </div>}

                {news}
            </section>);
    }
}

const mapStateToProps = state => ({ system: state.system });
const mapActionsToProps = { getNewsByCategory };
export default connect(mapStateToProps, mapActionsToProps)(SectionInsight);
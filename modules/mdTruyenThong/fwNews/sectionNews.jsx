import React from 'react';
import { connect } from 'react-redux';
import { getNewsByNews, getNewsByCategory } from './redux';
import { Link } from 'react-router-dom';

class SectionNews extends React.Component {
    state = {
        list: [], category: { vi: ' ', en: ' ' }
    }

    componentDidMount() {
        if (this.props.item && this.props.item.viewId) {
            this.props.getNewsByCategory(1, 5, this.props.item.viewId, data => {
                let category = { vi: ' ', en: ' ' };
                if (this.props.item && this.props.item.detail) {
                    category.vi = JSON.parse(this.props.item.detail).valueTitleCom;
                    category.en = JSON.parse(this.props.item.detail).valueTitleCom;
                }
                if (data.list) this.setState({ ...data, category });
            });
        } else
            this.props.getNewsByNews();
    }

    componentDidUpdate() {
        setTimeout(T.ftcoAnimate, 250);
    }

    render() {
        const category = T.language(this.state.category);
        const newsList = this.state.list, detail = this.props.item && this.props.item.detail ? JSON.parse(this.props.item.detail) : {};
        let languageText = this.props.system && this.props.system.languageText || {};
        const newLanguage = T.language(languageText);
        let news = <span className='text-center w-100'><h3>{newLanguage.khongTinTuc}</h3></span>;

        if (newsList.length !== 0) {
            news = (
                <div className='container-fluid'>
                    <div className='row d-flex'>
                        <div className='col-lg-6 col-12'>
                            <Link to={T.linkNewsDetail(newsList[0])} className='block-20 block-50' style={{ backgroundImage: `url(${newsList[0].image})`, backgroundSize: 'cover', borderRadius: '5px' }}/>
                            <div className='text py-4 d-block w-100 text-justify'>
                                <Link to={T.linkNewsDetail(newsList[0])}><h4 className='homeHeading' style={{ color: '#626262' }}><b>{T.language.parse(newsList[0].title || '')}</b></h4></Link>
                                <h6 className='homeBody' style={{ color: '#626262', fontWeight: 'normal' }}>{T.language.parse(newsList[0].abstract || '')}</h6>
                            </div>
                        </div>
                        <div className='col-lg-6 col-12 row'>
                            {newsList.slice(1).map((item, index) => {
                                if (index < 4) return (
                                    <div className='col-lg-6 col-12' key={index}>
                                        <Link to={T.linkNewsDetail(item)} className='block-20' style={{ backgroundImage: `url(${item.image})`, backgroundSize: 'cover', borderRadius: '5px' }}/>
                                        <div className='text py-3 d-block w-100 text-justify'>
                                            <Link to={T.linkNewsDetail(item)}>
                                                <h6 className='homeBody' style={{ color: '#626262' }}><b>{T.language.parse(item.title || '')}</b></h6>
                                            </Link>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                        <div className='col-12 d-flex justify-content-center'>
                            <Link to={`${detail.linkSeeAll}?${T.language.getLanguage()}`} className='btn btn-lg btn-outline-dark px-5 viewAll' style={{ borderRadius: 0 }}>{newLanguage.xemTatCa}</Link>
                        </div>
                    </div>
                </div>
            );
        }

        return (
            <section className='row bg-light py-3' data-aos='fade-up'>
                <div className='col-12 justify-content-start mb-3'>
                    <div className='heading-section'>
                        <h3 className='text-center homeTitle' style={{ color: '#0139A6', paddingTop: 10 }}><strong>{category.toUpperCase()}</strong></h3>
                    </div>
                </div>
                {news}
            </section>
        );
    }
}

const mapStateToProps = state => ({ news: state.news, system: state.system });
const mapActionsToProps = { getNewsByNews, getNewsByCategory };
export default connect(mapStateToProps, mapActionsToProps)(SectionNews);
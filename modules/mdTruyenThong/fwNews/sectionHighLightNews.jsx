import React from 'react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import { getNewsByCategory } from './redux';

class SectionHighLightNews extends React.Component {
    state = { list: [], category: { vi: ' ', en: ' ' }, linkSeeAll: '' }

    componentDidMount() {
        if (this.props.item && this.props.item.viewId) {
            let category = { vi: ' ', en: ' ' }, linkSeeAll;
            if (this.props.item && this.props.item.detail) {
                const detail = JSON.parse(this.props.item.detail);
                category.vi = detail.valueTitleCom;
                category.en = detail.valueTitleCom;
                linkSeeAll = detail.linkSeeAll;
            }
            this.props.getNewsByCategory(1, 6, this.props.item.viewId, data => {
                if (data.list) this.setState({ ...data, category, linkSeeAll });
            });
        }
    }
    render() {
        const title = T.language(this.state.category);
        const notificationList = this.state.list;
        let languageText = this.props.system && this.props.system.languageText || {};
        const newLanguage = T.language(languageText);
        let notification = <span className='text-center w-100'>{languageText.khongTinTuc}</span>;
        if (notificationList.length !== 0) {
            notification = (
                <>
                    <div className='col-12 row py-3'>
                        {notificationList.slice(0, 6).map((item, index) => {
                            const link = T.linkNewsDetail(item);
                            return (
                                <div key={index} className='col-12 px-0 pb-2 mb-3 text-justify'>
                                    <Link to={link}>
                                        <h6 className='homeBody' style={{ color: '#676767', }}>
                                            <b>{item.isTranslate == 1 ? T.language.parse(item.title) : T.language.parse(item.title, true)[item.language]}</b>
                                            <span style={{ fontStyle: 'italic' }}>
                                                {`  ${T.dateToText(item.startPost).slice(0, 10)}`}
                                            </span>
                                        </h6>
                                    </Link>
                                </div>
                            );
                        })}
                    </div>
                    <div className='col-12 d-flex justify-content-center'>
                        <Link to={`${this.state.linkSeeAll}?${T.language.getLanguage()}`} className='btn btn-lg btn-outline-dark px-5 viewAll' style={{ borderRadius: 0 }}>{newLanguage.xemTatCa}</Link>
                    </div>
                </>
            );
        }
        return (
            <section data-aos='fade-up' className='row p-3'>
                <div className='col-12 homeBorderLeft'>
                    <h3 className='homeTitle' style={{ color: '#0139A6', margin: 0 }}><strong>{title}</strong></h3>
                </div>
                {notification}
            </section>);
    }
}

const mapStateToProps = state => ({ news: state.news, system: state.system });
const mapActionsToProps = { getNewsByCategory };
export default connect(mapStateToProps, mapActionsToProps)(SectionHighLightNews);
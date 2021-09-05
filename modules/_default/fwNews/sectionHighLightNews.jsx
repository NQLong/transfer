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
        noNewsTitle: <h3>No latest notification!</h3>,
        newsTitle: 'NOTIFICATION',
        view: 'View',
        viewAll: 'View All'
    }
};
class SectionHighLightNews extends React.Component {
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
            this.props.getNewsByCategory(1, 6, this.props.item.viewId, data => {
                if (data.list) this.setState({ ...data, category, linkSeeAll });
            });
        }
    }
    render() {
        const language = T.language(this.state.category);
        let notification = <span className='text-center w-100'>{language.noNewsTitle}</span>;
        const notificationList = this.state.list,
            viewAll = T.language(text).viewAll;
        if (notificationList.length !== 0) {
            notification = (
                <>
                    <div className='col-12 row py-3'>
                        {notificationList.slice(0, 6).map((item, index) => {
                            const link = item.link ? '/tin-tuc/' + item.link : '/news/item/' + item.id;
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
                        <Link to={this.state.linkSeeAll} className='btn btn-lg btn-outline-dark px-5 viewAll' style={{ borderRadius: 0 }}>{viewAll}</Link>
                    </div>
                </>
            );
        }
        return (
            <section data-aos='fade-up' className='row p-3'>
                <div className='col-12 homeBorderLeft'>
                    <h3 className='homeTitle' style={{ color: '#0139A6', margin: 0 }}><strong>{language}</strong></h3>
                </div>
                {notification}
            </section>);
    }
}

const mapStateToProps = state => ({ news: state.news, system: state.system });
const mapActionsToProps = { getNewsByCategory };
export default connect(mapStateToProps, mapActionsToProps)(SectionHighLightNews);
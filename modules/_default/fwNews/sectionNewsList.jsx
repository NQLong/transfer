import React from 'react';
import { connect } from 'react-redux';
import { getNewsInPageByUser, getNewsByCategory } from './redux';
import { Link } from 'react-router-dom';
import inView from 'in-view';

const linkFormat = '/tin-tuc/',
    idFormat = '/news/item/';



class NewsListView extends React.Component {
    state = { view: 'grid', list: [], category: { vi: ' ', en: ' ' } };
    loading = false;

    componentDidMount() {
        let category = { vi: ' ', en: ' ' }, view = 'grid';
        if (this.props.item && this.props.item.viewId) {
            if (this.props.item && this.props.item.detail) {
                const detail = JSON.parse(this.props.item.detail);
                if (detail.viewTypeDisplay == 'Template 2') view = 'list';
                category.vi = detail.valueTitleCom;
                category.en = detail.valueTitleCom;
            }

            this.props.getNewsByCategory(1, 20, this.props.item.viewId, data => {
                if (data.list) this.setState({ ...data, category, view });
            });
        }
    }

    componentDidUpdate() {
        setTimeout(T.ftcoAnimate, 250);
    }

    ready = () => {
        inView('.listViewLoading').on('enter', () => {
            if (!this.loading && this.state.pageNumber < this.state.pageTotal) {
                this.loading = true;
                this.props.getNewsByCategory(this.state.pageNumber + 1, 20, this.props.item.viewId, data => {
                    if (data.list) {
                        this.loading = false;
                        data.list = [...this.state.list, ...data.list];
                        this.setState({ ...data, pageNumber: data.pageNumber, pageTotal: data.pageTotal });
                    }
                });
            }
        });
    }

    changeView = (view) => {
        $('.view-btn').removeClass('active');
        if (view == 'grid') {
            $('.view-btn').eq(1).addClass('active');
        } else {
            $('.view-btn').eq(0).addClass('active');
        }
        this.setState({ view });
    }

    render() {
        const language = T.language(this.state.category),
            { list } = this.state;
        let newsGridView = [], newsListView = [];
        if (list) {
            newsGridView = list.map((item, index) => {
                const link = item.link ? linkFormat + item.link : idFormat + item.id;
                return (
                    <div key={index} className='col-12 col-sm-6 col-md-4 col-lg-3 d-sm-flex ftco-animate'>
                        <div className='blog-entry align-self-stretch' style={{ width: '100%' }}>
                            <Link to={link} className='block-20'
                                style={{ backgroundImage: `url('${item.image}')` }}>
                            </Link>
                            <div className='text p-4 d-block'>
                                <Link to={link}>
                                    <h3 className='heading'>{item.isTranslate == 1 ? T.language.parse(item.title) : T.language.parse(item.title, true)[item.language]}</h3>
                                </Link>
                                <span className='tag' style={{ color: '#626262', textAlign: 'justify', display: 'inline-block' }}>{item.isTranslate == 1 ? T.language.parse(item.abstract) : T.language.parse(item.abstract, true)[item.language]}</span>
                                <div className='meta mb-3'>
                                    <div>
                                        <a href='#' style={{ color: '#626262' }}>{new Date(item.startPost).getText()}</a>
                                    </div>
                                    {/* <br />
                                    <div style={{ color: '#626262' }}>
                                        Lượt xem: {item.views} <i className='fa fa-eye' />
                                    </div> */}
                                </div>
                            </div>
                        </div>
                    </div>
                );
            });
            newsListView = list.map((item, index) => {
                const link = item.link ? linkFormat + item.link : idFormat + item.id;
                return (
                    <div className='col-12 d-flex mb-5 ftco-animate' key={index}>
                        <Link to={link} className='mr-4 blog-img flex-shrink-0' style={{ backgroundImage: `url('${item.image}')`, width: '15vw', height: '11.2vw' }} />
                        <div className='d-flex flex-column justify-content-between'>
                            <div className='text mb-2'>
                                <Link to={link}><h4 className='heading text-justify homeHeading'><b>{item.isTranslate == 1 ? T.language.parse(item.title) : T.language.parse(item.title, true)[item.language]}</b></h4></Link>
                            </div>
                            <div className='text'>
                                <h6 className='homeBody text-justify'>{item.isTranslate == 1 ? T.language.parse(item.abstract) : T.language.parse(item.abstract, true)[item.language]}</h6>
                            </div>
                            <div>
                                <a href='#'>
                                    <span className='icon-calendar' />&nbsp; {T.dateToText(item.startPost)}
                                </a>
                            </div>
                        </div>
                    </div>
                );
            });
        }

        if (this.state.pageNumber < this.state.pageTotal) {
            newsGridView.push(
                <div key={newsGridView.length} style={{ width: '100%', textAlign: 'center' }}>
                    <img className='listViewLoading' src='/img/loading.gif' style={{ width: '48px', height: 'auto' }} onLoad={this.ready} />
                </div>
            );
            newsListView.push(
                <div key={newsListView.length} style={{ width: '100%', textAlign: 'center' }}>
                    <img className='listViewLoading' src='/img/loading.gif' style={{ width: '48px', height: 'auto' }} onLoad={this.ready} />
                </div>
            );
        }

        return <section className='row d-flex justify-content-center' style={{ paddingTop: 30 }}>
            <div className='col-12' style={{ paddingBottom: '2rem' }}>
                <h3 style={{ display: 'inline' }}><b>{language.toUpperCase()}</b></h3>
                <div className='btn-group view-btn-group' style={{ marginBottom: '20px', right: '15px', position: 'absolute' }}>
                    <button className='view-btn btn btn-primary' onClick={() => this.changeView('list')}>
                        <i className='fa fa-list'></i>
                    </button>
                    <button className='view-btn btn btn-primary active' onClick={() => this.changeView('grid')}>
                        <i className='fa fa-th-large'></i>
                    </button>
                </div>
            </div>
            {this.state.view == 'grid' ? newsGridView : newsListView}
        </section>;
    }
}

const mapStateToProps = state => ({ news: state.news, system: state.system });
const mapActionsToProps = { getNewsInPageByUser, getNewsByCategory };
export default connect(mapStateToProps, mapActionsToProps)(NewsListView);
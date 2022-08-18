import React from 'react';
import { connect } from 'react-redux';
import { getNewsByCategory } from './redux';
import { Link } from 'react-router-dom';

class SectionAdmission extends React.Component {
    state = { list: [], category: '' }

    componentDidMount() {
        if (this.props.item && this.props.item.viewId) {
            let category = '';
            if (this.props.item && this.props.item.detail) {
                category = JSON.parse(this.props.item.detail).valueTitleCom;
            }
            this.props.getNewsByCategory(1, 12, this.props.item.viewId, data => {
                if (data.list) this.setState({ ...data, category });
            });
        }
    }

    componentDidUpdate() {
        setTimeout(T.ftcoAnimate, 250);
    }

    render() {
        const category = this.state.category,
            detail = this.props.item && this.props.item.detail ? JSON.parse(this.props.item.detail) : {},
            admissionList = this.state.list;
        let languageText = this.props.system && this.props.system.languageText || {};
        const newLanguage = T.language(languageText);
        let admission = <span className='text-center w-100'>{newLanguage.khongTuyenSinh}</span>;

        if (admissionList.length) {
            const firstLink = T.linkNewsDetail(admissionList[0]);
            admission = (
                <div className='col-12 row px-0 py-3 d-flex justify-content-start'>
                    <div className='col-lg-6 col-12 px-0 py-2'>
                        <Link to={firstLink} className='block-20 block-50' style={{ backgroundImage: `url(${admissionList[0].image})`, backgroundSize: 'cover', borderRadius: '5px' }} />
                        <div className='text py-4 d-block w-100 text-justify'>
                            <Link to={firstLink}><h4 className='homeHeading' style={{ color: '#626262' }}><b>{T.language.parse(admissionList[0].title || '')}</b></h4></Link>
                            <h6 className='homeBody' style={{ color: '#626262' }}>{T.language.parse(admissionList[0].abstract || '')}</h6>
                        </div>
                    </div>
                    <div className='col-lg-6 col-12 pt-3 pt-lg-0'>
                        {admissionList.slice(1).map((item, index) => {
                            const link = T.linkNewsDetail(item);
                            return (<div key={index} className='col-12 row ml-0 ml-lg-3 px-0 pb-2 mb-3 text-justify' style={(index !== admissionList.slice(1).length - 1) ? { borderBottom: 'dashed 1px #dacaba' } : {}}>
                                <div className='col-1 p-1 d-flex justify-content-center align-items-center homeIndex' style={{ color: '#676767' }}><i className='fa fa-circle' /></div>
                                <Link className='col-11 d-flex align-items-center' to={link}><h6 className='homeBody' style={{ color: '#676767', margin: 0 }}><b>{T.language.parse(item.title || '')}</b></h6></Link>
                            </div>);
                        })}
                        <div className='d-flex justify-content-center'>
                            <Link to={detail.linkSeeAll} className='btn btn-lg btn-outline-dark px-5 viewAll' style={{ borderRadius: 0 }}>{newLanguage.xemTatCa}</Link>
                        </div>
                    </div>
                </div>
            );
        }
        return (
            <section className='row bg-light p-3' data-aos='fade-up'>
                <div className='col-12 homeBorderLeft'>
                    <h3 className='homeTitle' style={{ color: '#0139A6', margin: 0 }}><strong>{category.toUpperCase()}</strong></h3>
                </div>
                {admission}
            </section>
        );
    }
}

const mapStateToProps = state => ({ news: state.news, system: state.system });
const mapActionsToProps = { getNewsByCategory };
export default connect(mapStateToProps, mapActionsToProps)(SectionAdmission);
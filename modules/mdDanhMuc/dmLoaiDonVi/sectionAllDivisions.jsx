import React from 'react';
import { connect } from 'react-redux';
import { getDonViById } from './redux';
import { Link } from 'react-router-dom';
import T from 'view/js/common.js';

const styleString = '1px solid #b3b3b3', borderStyle = {
    borderTop: styleString,
    borderRight: styleString,
    borderBottom: styleString,
    padding: '15px 0',
    borderTopRightRadius: '5px',
    borderBottomRightRadius: '5px'
};
class SectionAllDivision extends React.Component {
    state = { division: [] };
    loading = false;


    componentDidMount() {
        function sortComparer(a, b) {
            return a.ten.localeCompare(b.ten);
        }

        this.props.getDonViById(this.props.viewId, division => {
            const test = division.sort(sortComparer);
            // console.log(test);
            this.setState({ division: test });
        });
    }


    componentDidUpdate() {
        setTimeout(T.ftcoAnimate, 250);
    }

    render() {
        const elements = [];
        (this.state.division ? this.state.division : []).forEach((item, index) => {
            let duongDan = item.duongDan ? item.duongDan.toLowerCase().trim() : '/',
                isExternalLink = duongDan.startsWith('http://') || duongDan.startsWith('https://'),
                ten = T.language.current() == 'vi' ? item.ten : item.tenTiengAnh,
                image = T.language.current() == 'vi' && item.maPl == 2 ? item.imageDisplay :
                    T.language.current() == 'en' && item.maPl == 2 ? item.imageDisplayTa :
                        item.image ? item.image : '/img/avatar.png';
            if (item.maPl == 2) {
                elements.push(
                    <div key={index} className='col-12 col-md-3 d-flex ftco-animate' style={{ paddingTop: '20px' }}>
                        <div className='align-items-center' style={{ minHeight: '180px', padding: 0, }}>
                            {isExternalLink ? <a href={item.duongDan} target='_blank' rel="noreferrer">
                                <img style={{ width: '100%', padding: '10px' }} src={image} />
                            </a> :
                                <Link to={item.duongDan ? item.duongDan : '/division/item/' + item.ma} id={'duongDan' + item.id}>
                                    <img style={{ width: '100%', padding: '10px' }} src={image} />
                                </Link>
                            }
                        </div>
                    </div>
                );
            } else {
                elements.push(
                    <div key={index} className='col-12 col-md-3 d-flex ftco-animate' style={{ paddingTop: '20px' }}>
                        <div className='col-md-7 d-flex align-items-center' style={{ minHeight: '180px', borderTop: styleString, borderLeft: styleString, borderBottom: styleString, padding: 0, borderTopLeftRadius: '5px', borderBottomLeftRadius: '5px' }}>
                            {isExternalLink ? <a href={item.duongDan} target='_blank' rel="noreferrer">
                                <img style={{ width: '100%', padding: '10px' }} src={item.image ? item.image : '/img/avatar.png'} />
                            </a> :
                                <Link to={item.duongDan ? item.duongDan : '/division/item/' + item.ma} id={'duongDan' + item.id}>
                                    <img style={{ width: '100%', padding: '10px' }} src={item.image ? item.image : '/img/avatar.png'} />
                                </Link>
                            }
                        </div>
                        <div className='col-md-5 d-flex align-items-center' style={borderStyle}>
                            {isExternalLink ? <a href={item.duongDan} target='_blank' className='mb-1' htmlFor={`link${index}MenuCheck`} rel="noreferrer">
                                <h5 className='mb-1' >{ten}</h5>
                            </a> :
                                <Link to={item.duongDan ? item.duongDan : '/division/item/' + item.ma}>
                                    <h5 className='mb-1' >{ten}</h5>
                                </Link>}
                            <p>{item.ghiChu}</p>
                        </div>
                    </div>
                );
            }

        });
        return (
            <section className='ftco-section'>
                <div className='col-12 heading-section ftco-animate text-center'>
                </div>
                <div className='row'>
                    {elements}
                </div>
            </section>
        );
    }
}

const mapStateToProps = state => ({ content: state.content, system: state.system });
const mapActionsToProps = { getDonViById };
export default connect(mapStateToProps, mapActionsToProps)(SectionAllDivision);
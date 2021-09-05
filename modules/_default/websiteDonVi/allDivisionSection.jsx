import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';

class AllDivisionSection extends React.Component {
    state = {};
    loading = false;

    componentDidUpdate() {
        setTimeout(T.ftcoAnimate, 250);
        $('html, body').animate({ scrollTop: 0 }, 'slow');
    }

    render() {
        const items = this.props.dmDonVi && this.props.dmDonVi.userItems ? this.props.dmDonVi.userItems : [];
        return <section className='row d-flex justify-content-center'>
            {items.length ? items.map((item, index) => {
                const title = T.language({ vi: item.ten, en: item.tenTiengAnh }) + (item.tenVietTat ? ' (' + item.tenVietTat + ')' : ''),
                    image = item.image ? item.image : '/img/hcmussh.png';
                return (
                    <div key={index} className='col-12 col-sm-6 col-md-6 col-lg-4 col-xl-4 ftco-animate' style={{ marginBottom: '30px' }}>
                        <div className='blog-entry align-self-stretch '>
                            <div className='row' style={{ minHeight: '160px' }}>
                                <div className='col-5 d-flex' style={{ margin: 'auto' }}>
                                    {item.link ? item.external ? <Link to={item.link} ><img style={{ width: '100%', padding: '5px' }} src={image} alt={title} /></Link> :
                                        <a href={item.link} target='_blank' rel="noreferrer" ><img style={{ width: '100%', padding: '5px' }} src={image} alt={title} /></a> :
                                        <img style={{ width: '100%', padding: '5px' }} src={image} alt={title} />}
                                </div>
                                <div className='col-7'>
                                    <div className='text d-block'>
                                        <h3 className='heading mt-3'>{item.external ? <Link to={item.link} style={{ wordBreak: 'break-word', fontSize: '18px' }}>{title}</Link> : <a href={item.link} style={{ wordBreak: 'break-word', fontSize: '18px' }} target='_blank' rel="noreferrer">{title}</a>}</h3>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            }) : 'Không có đơn vị'}
        </section>;
    }
}

const mapStateToProps = state => ({ system: state.system, dmDonVi: state.dmDonVi });
const mapActionsToProps = {};
export default connect(mapStateToProps, mapActionsToProps)(AllDivisionSection);
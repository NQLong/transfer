import React from 'react';
import { connect } from 'react-redux';
import { getWebsiteGioiThieuAll, getWebsiteGioiThieu } from './reduxWebsiteGioiThieu';
import { getDvWebsite } from './redux';

class GioiThieuSection extends React.Component {
    constructor(props) {
        super(props);
        this.state = {};
    }

    componentDidMount() {
        this.setState({ shortname: this.props.shortname });
        this.props.getDvWebsite(this.props.shortname, item => {
            this.setState({ maDonVi: item.maDonVi });
            this.props.getWebsiteGioiThieuAll(item.maDonVi, items => {
                this.setState({ gioiThieu: items });
            });
        });
    }

    render() {
        const gioiThieu = this.state.gioiThieu ? this.state.gioiThieu : [];
        let title_list = [];
        let content_list = [];
        gioiThieu.map((item, index) => {
            title_list.push(<li key={index} className={(item.trongSo == 1 ? 'col-5' : 'col-10') + ' text-center border gtkhoa-cate gtkhoa-cate-1'} role='presentation'><button href={'#' + index} aria-controls='first' role='tab'
                data-toggle='tab' className={index == 0 ? 'active' : ''}>{T.language.parse(item.ten)}</button></li>);
            content_list.push(
                <div key={index} className={index == 0 ? 'tab-pane fade in active show' : 'tab-pane fade'} id={index} role='tabpanel'>
                    <div dangerouslySetInnerHTML={{ __html: T.language.parse(item.noiDung) }} className='row' />
                    <div div className='row mt-auto' >
                        <div className='col'>
                            <div id='ProjeCarousel' className='carousel slide' data-ride='carousel'>
                                <div className='carousel-inner d-flex justify-content-center'>
                                    <div className='carousel-item active'>
                                        <div className='col-md-4 float-left nopadding p-1'>
                                            <div className='card'>
                                                <img className='card-img-top' src='http://via.placeholder.com/350x350' alt='Card image cap' />
                                            </div>
                                        </div>
                                        <div className='col-md-4 float-left nopadding p-1'>
                                            <div className='card'>
                                                <img className='card-img-top' src='http://via.placeholder.com/350x350' alt='Card image cap' />
                                            </div>
                                        </div>
                                        <div className='col-md-4 float-left nopadding p-1'>
                                            <div className='card'>
                                                <img className='card-img-top' src='http://via.placeholder.com/350x350' alt='Card image cap' />
                                            </div>
                                        </div>
                                    </div>
                                    <div className='carousel-item'>
                                        <div className='col-md-4 float-left nopadding p-1'>
                                            <div className='card'>
                                                <img className='card-img-top' src='http://via.placeholder.com/350x350' alt='Card image cap' />
                                            </div>
                                        </div>
                                        <div className='col-md-4 float-left nopadding p-1' >
                                            <div className='card'>
                                                <img className='card-img-top' src='http://via.placeholder.com/350x350' alt='Card image cap' />
                                            </div>
                                        </div>
                                        <div className='col-md-4 float-left nopadding p-1'>
                                            <div className='card'>
                                                <img className='card-img-top' src='http://via.placeholder.com/350x350' alt='Card image cap' />
                                            </div>
                                        </div>

                                    </div>
                                    <a className='introFaculty carousel-control-prev' href='#ProjeCarousel' role='button' data-slide='prev'>
                                        <span className='fa fa-chevron-circle-left' aria-hidden='true' style={{ color: 'gray' }} />

                                    </a>
                                    <a className='introFaculty carousel-control-next' href='#ProjeCarousel' role='button' data-slide='next'>
                                        <span className='fa fa-chevron-circle-right' aria-hidden='true' style={{ color: 'gray' }} />
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            );
        });

        return (
            <section id='intro-faculty' className='row' style={{ height: '1000px' }}>
                <div className='container'>
                    <div className='row gtkhoa-container'>
                        <div className='col-4'>
                            <ul className='row flex justify-content-center nav' role='tablist'>{title_list}</ul>
                        </div>
                        <div className='slide col-8 gtkhoa-image tab-main'>
                            <div className='tab-content pt-2'>{content_list}</div>
                        </div>
                    </div>
                </div>
            </section>
        );
    }
}

const mapStateToProps = state => ({ system: state.system, dvWebsiteGioiThieu: state.dvWebsiteGioiThieu });
const mapActionsToProps = { getWebsiteGioiThieuAll, getWebsiteGioiThieu, getDvWebsite };
export default connect(mapStateToProps, mapActionsToProps)(GioiThieuSection);
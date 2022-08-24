import React from 'react';
import { connect } from 'react-redux';
import { getTccbDanhGiaNam } from './redux';
import { Link } from 'react-router-dom';
import { AdminPage } from 'view/component/AdminPage';
import ComponentDGCB from './componentDGCB';
import ComponentDGDV from './componentDGDV';
import T from 'view/js/common';

class TccbKhungDanhGiaCanBoDetails extends AdminPage {

    componentDidMount() {
        T.ready('/user/tccb', () => {
            const route = T.routeMatcher('/user/tccb/danh-gia/:nam');
            this.nam = Number(route.parse(window.location.pathname)?.nam);
            this.setState({ nam: this.nam });
        });
    }

    render() {
        const nam = this.state?.nam || '';
        return this.renderPage({
            icon: 'fa fa-university',
            title: `Đánh giá năm: ${nam}`,
            breadcrumb: [
                <Link key={0} to='/user/tccb/danh-gia'>Đánh giá</Link>,
                'Thông tin đánh giá năm',
            ],
            content: <>
                {nam && <div>
                    <div id="accordion-1" className='mt-2'>
                        <div className="card">
                            <div className="card-header" id="headingOne">
                                <h5 className="mb-0">
                                    <button className="btn btn-link collapsed" data-toggle="collapse" data-target="#collapseOne-1" aria-expanded="true" aria-controls="collapseOne-1">
                                        Mức đánh giá cán bộ
                                    </button>
                                </h5>
                            </div>
                            <div id="collapseOne-1" className="collapse" aria-labelledby="headingOne" data-parent="#accordion-1">
                                <div className="card-body">
                                    <ComponentDGCB nam={nam} />
                                </div>
                            </div>
                        </div>
                    </div>
                    <div id="accordion-2" className='mt-2'>
                        <div className="card">
                            <div className="card-header" id="headingOne">
                                <h5 className="mb-0">
                                    <button className="btn btn-link collapsed" data-toggle="collapse" data-target="#collapseOne-2" aria-expanded="true" aria-controls="collapseOne-2">
                                        Đánh giá đơn vị
                                    </button>
                                </h5>
                            </div>
                            <div id="collapseOne-2" className="collapse" aria-labelledby="headingOne" data-parent="#accordion-2">
                                <div className="card-body">
                                    <ComponentDGDV nam={nam} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                }
            </>,
            backRoute: '/user/tccb/danh-gia',
        });
    }
}

const mapStateToProps = state => ({ system: state.system, tccbDanhGiaNam: state.tccb.tccbDanhGiaNam });
const mapActionsToProps = { getTccbDanhGiaNam };
export default connect(mapStateToProps, mapActionsToProps)(TccbKhungDanhGiaCanBoDetails);
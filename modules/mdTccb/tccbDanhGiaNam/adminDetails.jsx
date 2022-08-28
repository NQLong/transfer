import React from 'react';
import { connect } from 'react-redux';
import { getTccbDanhGiaNam } from './redux';
import { Link } from 'react-router-dom';
import { AdminPage } from 'view/component/AdminPage';
import ComponentDiemThuong from '../tccbDiemThuong/componentDiemThuong';
import ComponentDiemTru from '../tccbDiemTru/componentDiemTru';
import ComponentDGCB from './componentDGCB';
import ComponentDGDV from './componentDGDV';
import ComponentTLD from '../tccbTyLeDiem/componentTLD';
import ComponentDMCV from '../tccbDinhMucCongViecGvVaNcv/componentDMCV';
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
        const listComponent = nam ? [
            {
                title: 'Mức đánh giá cán bộ',
                component: <ComponentDGCB nam={nam} />,
            },
            {
                title: 'Điểm thưởng',
                component: <ComponentDiemThuong nam={nam} />,
            },
            {
                title: 'Điểm trừ',
                component: <ComponentDiemTru nam={nam} />,
            },
            {
                title: 'Tỷ lệ điểm',
                component: <ComponentTLD nam={nam} />
            },
            {
                title: 'Định mức công việc cho giảng viên và nghiên cứu viên',
                component: <ComponentDMCV nam={nam} />
            },
            {
                title: 'Khung đánh giá đơn vị',
                component: <ComponentDGDV nam={nam} />,
            },
        ] : [];
        return this.renderPage({
            icon: 'fa fa-university',
            title: `Đánh giá năm: ${nam}`,
            breadcrumb: [
                <Link key={0} to='/user/tccb/danh-gia'>Đánh giá</Link>,
                'Thông tin đánh giá năm',
            ],
            content: <>
                {nam && <div>
                    {
                        listComponent.map((item, index) => (<>
                            <div id={`accordion-${index}`} className='mt-2'>
                                <div className="card">
                                    <div className="card-header" id={`heading-${index}`}>
                                        <h5 className="mb-0">
                                            <button className="btn btn-link collapsed" data-toggle="collapse" data-target={`#collapseOne-${index}`} aria-expanded="true" aria-controls={`collapseOne-${index}`}>
                                                {item.title}
                                            </button>
                                        </h5>
                                    </div>
                                    <div id={`collapseOne-${index}`} className="collapse" aria-labelledby={`heading-${index}`} data-parent={`#accordion-${index}`}>
                                        <div className="card-body">
                                            {item.component}
                                        </div>
                                    </div>
                                </div>
                            </div></>
                        ))
                    }
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
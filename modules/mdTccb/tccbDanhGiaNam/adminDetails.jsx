import React from 'react';
import { connect } from 'react-redux';
import { getTccbDanhGiaNam  } from './redux';
import { Link } from 'react-router-dom';
import { AdminPage } from 'view/component/AdminPage';
import ComponentDGCB from './componentDGCB';
import T from 'view/js/common';

class TccbKhungDanhGiaCanBoDetails extends AdminPage {

    componentDidMount() {
        T.ready('/user/danh-gia', () => {
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
                { nam && (<ComponentDGCB nam={nam} />)}
            </>,
            backRoute: '/user/tccb/danh-gia',
        });
    }
}

const mapStateToProps = state => ({ system: state.system, tccbDanhGiaNam: state.danhGia.tccbDanhGiaNam });
const mapActionsToProps = { getTccbDanhGiaNam };
export default connect(mapStateToProps, mapActionsToProps)(TccbKhungDanhGiaCanBoDetails);
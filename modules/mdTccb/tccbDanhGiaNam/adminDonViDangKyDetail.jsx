import React from 'react';
import { connect } from 'react-redux';
import { getDmDonVi } from 'modules/mdDanhMuc/dmDonVi/redux';
import { getTccbThongTinDangKyDonVi } from './reduxThongTinDonVi';
import { AdminPage, renderTable, TableCell } from 'view/component/AdminPage';
import { Link } from 'react-router-dom';
import T from 'view/js/common';

class TccbThongTinDangKyDonViDetails extends AdminPage {
    componentDidMount() {
        T.ready('/user/tccb', () => {
            const route = T.routeMatcher('/user/tccb/danh-gia/:nam/don-vi/:ma');
            this.nam = parseInt(route.parse(window.location.pathname)?.nam);
            this.maDonVi = route.parse(window.location.pathname)?.ma;
            this.props.getDmDonVi(this.maDonVi, item => {
                this.donVi = item?.ten;
                this.setState({ nam: this.nam, donVi: this.donVi });
                this.load(this.nam, this.maDonVi);
            });
        });
    }

    load = (nam, maDonVi, done) => {
        this.props.getTccbThongTinDangKyDonVi(nam, maDonVi, (items) => {
            this.setState({ items });
            done && done();
        });
    }

    render() {
        const list = this.state?.items || [];
        const nam = this.state?.nam, donVi = this.state?.donVi;
        let table = renderTable({
            emptyTable: 'Không có dữ liệu đăng ký',
            getDataSource: () => list,
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', textAlign: 'right', verticalAlign: 'middle' }}>#</th>
                    <th style={{ width: '30%', textAlign: 'center', whiteSpace: 'nowrap' }}>Nhiệm vụ</th>
                    <th style={{ width: '60%', textAlign: 'center', whiteSpace: 'nowrap' }}>Đăng ký KPI</th>
                    <th style={{ width: '10%', textAlign: 'center' }}>Diễn giải</th>
                </tr>
            ),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell style={{ textAlign: 'center' }} content={index + 1} />
                    <TableCell style={{ textAlign: 'left' }} content={item.noiDung} />
                    <TableCell style={{ textAlign: 'left' }} content={<p dangerouslySetInnerHTML={{ __html: item.dangKyKpi }} />} />
                    <TableCell style={{ textAlign: 'left', whiteSpace: 'pre-wrap' }} content={item.dienGiai} />
                </tr>
            )
        });

        return this.renderPage({
            icon: 'fa fa-pencil',
            title: `Thông tin đăng ký năm: ${nam}, Đơn vị: ${donVi}`,
            breadcrumb: [
                <Link key={0} to='/user/tccb/'>Tổ chức cán bộ</Link>,
                <Link key={1} to='/user/tccb/danh-gia/'>Đánh giá</Link>,
                <Link key={2} to={`/user/tccb/danh-gia/${this.nam}/don-vi`}>Danh sách đơn vị</Link>,
                'Thông tin đăng ký'
            ],
            content: <>
                <div className='tile'>{table}</div>
            </>,
            backRoute: `/user/tccb/danh-gia/${this.nam}/don-vi`,
        });
    }
}

const mapStateToProps = state => ({ system: state.system });
const mapActionsToProps = { getDmDonVi, getTccbThongTinDangKyDonVi };
export default connect(mapStateToProps, mapActionsToProps)(TccbThongTinDangKyDonViDetails);
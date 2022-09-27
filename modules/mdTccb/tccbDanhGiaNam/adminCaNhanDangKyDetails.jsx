import React from 'react';
import { connect } from 'react-redux';
import { getTccbThongTinCaNhanPage } from './reduxThongTinCaNhan';
import Pagination from 'view/component/Pagination';
import { Link } from 'react-router-dom';
import { AdminPage, TableCell, renderTable } from 'view/component/AdminPage';

class TccbCaNhanDangKyDetailsPage extends AdminPage {
    state = { nam: '' }
    componentDidMount() {
        T.ready('/user/tccb', () => {
            const route = T.routeMatcher('/user/tccb/danh-gia-ca-nhan/:nam');
            const nam = parseInt(route.parse(window.location.pathname)?.nam);
            this.setState({ nam });
            T.onSearch = (searchText) => this.props.getTccbThongTinCaNhanPage(undefined, undefined, searchText || '');
            T.showSearchBox();
            this.props.getTccbThongTinCaNhanPage();
        });
    }

    render() {
        const nam = this.state.nam || '';
        const { pageNumber, pageSize, pageTotal, totalItem, pageCondition, list } = this.props.tccbThongTinCaNhan && this.props.tccbThongTinCaNhan.page ?
            this.props.tccbThongTinCaNhan.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, list: null };
        let table = 'Không có danh sách cán bộ!';
        if (list && list.length > 0) {
            table = renderTable({
                getDataSource: () => list, stickyHead: false,
                renderHead: () => (
                    <tr>
                        <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }} >#</th>
                        <th style={{ width: '30%', textAlign: 'center' }}>Cán bộ</th>
                        <th style={{ width: '70%', textAlign: 'center' }}>Nhóm đăng ký</th>
                    </tr>
                ),
                renderRow: (item, index) => (
                    <tr key={index}>
                        <TableCell type='text' style={{ textAlign: 'right' }} content={index + 1} />
                        <TableCell type='text' content={<>
                            <span>{`${item.ho} ${item.ten}`}<br /></span>
                            {item.shcc}
                        </>} style={{ whiteSpace: 'nowrap' }} />
                        <TableCell type='text' style={{ textAlign: 'left' }} content={item.tenNhomDangKy || 'Chưa đăng ký'} />
                    </tr>
                )
            });
        }

        return this.renderPage({
            icon: 'fa fa-list-alt',
            title: `Thông tin đăng ký năm ${nam}`,
            breadcrumb: [
                <Link key={0} to='/user/tccb/'>Tổ chức cán bộ</Link>,
                <Link key={1} to='/user/tccb/danh-gia/'>Đánh giá</Link>,
                `Thông tin đăng ký năm ${nam}`
            ],
            content: <>
                <div className='tile'>{table}</div>
                <Pagination style={{ marginLeft: '70px' }} {...{ pageNumber, pageSize, pageTotal, totalItem, pageCondition }}
                    getPage={this.props.getTccbThongTinCaNhanPage} />
            </>,
            backRoute: '/user/tccb/danh-gia',
        });
    }
}

const mapStateToProps = state => ({ system: state.system, tccbThongTinCaNhan: state.tccb.tccbThongTinCaNhan });
const mapActionsToProps = { getTccbThongTinCaNhanPage };
export default connect(mapStateToProps, mapActionsToProps)(TccbCaNhanDangKyDetailsPage);
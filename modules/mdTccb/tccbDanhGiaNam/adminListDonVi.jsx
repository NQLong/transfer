import React from 'react';
import { connect } from 'react-redux';
import { getTccbThongTinDonViPage } from './reduxThongTinDonVi';
import Pagination from 'view/component/Pagination';
import { Link } from 'react-router-dom';
import { AdminPage, TableCell, renderTable } from 'view/component/AdminPage';
import { Tooltip } from '@mui/material';

class DmDonViPage extends AdminPage {
    componentDidMount() {
        T.ready('/user/tccb', () => {
            const route = T.routeMatcher('/user/tccb/danh-gia/:nam/don-vi');
            this.nam = parseInt(route.parse(window.location.pathname)?.nam);
            this.setState({ nam: this.nam });
            T.onSearch = (searchText) => this.props.getTccbThongTinDonViPage(undefined, undefined, searchText || '');
            T.showSearchBox();
            this.props.getTccbThongTinDonViPage();
        });
    }

    render() {
        const nam = this.state?.nam || '';
        const { pageNumber, pageSize, pageTotal, totalItem, pageCondition, list } = this.props.tccbThongTinDonVi && this.props.tccbThongTinDonVi.page ?
            this.props.tccbThongTinDonVi.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, list: null };
        let table = 'Không có danh sách đơn vị!';
        if (list && list.length > 0) {
            table = renderTable({
                getDataSource: () => list, stickyHead: false,
                renderHead: () => (
                    <tr>
                        <th style={{ width: 'auto' }}>Mã</th>
                        <th style={{ width: '50%', whiteSpace: 'nowrap' }}>Tên đơn vị</th>
                        <th style={{ width: '50%', whiteSpace: 'nowrap' }}>Tên tiếng Anh</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Mã PL</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Thông tin</th>
                    </tr>
                ),
                renderRow: (item, index) => (
                    <tr key={index}>
                        <TableCell type='text' style={{ textAlign: 'right' }} content={item.ma ? item.ma : ''} />
                        <TableCell type='link' content={item.ten ? item.ten : ''} onClick={() => this.props.history.push(`/user/tccb/danh-gia/${nam}/don-vi/${item.ma}`)} />
                        <TableCell type='link' content={item.tenTiengAnh ? item.tenTiengAnh : ''} onClick={() => this.props.history.push(`/user/tccb/danh-gia/${nam}/don-vi/${item.ma}`)} />
                        <TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={item.tenLoaiDonVi ? item.tenLoaiDonVi.normalizedName() : ''} />
                        <TableCell type='buttons' style={{ textAlign: 'center' }}>
                            <Tooltip title='Thông tin' arrow>
                                <a className='btn btn-info' href='#' onClick={() => this.props.history.push(`/user/tccb/danh-gia/${nam}/don-vi/${item.ma}`)}>
                                    <i className='fa fa-lg fa-info ' />
                                </a>
                            </Tooltip>
                        </TableCell>
                    </tr>
                )
            });
        }

        return this.renderPage({
            icon: 'fa fa-list-alt',
            title: 'Danh sách đơn vị',
            breadcrumb: [
                <Link key={0} to='/user/tccb/'>Tổ chức cán bộ</Link>,
                <Link key={1} to='/user/tccb/danh-gia/'>Đánh giá</Link>,
                'Danh sách đơn vị'
            ],
            content: <>
                <div className='tile'>{table}</div>
                <Pagination style={{ marginLeft: '70px' }} {...{ pageNumber, pageSize, pageTotal, totalItem, pageCondition }}
                    getPage={this.props.getTccbThongTinDonViPage} />
            </>,
            backRoute: '/user/tccb/danh-gia',
        });
    }
}

const mapStateToProps = state => ({ system: state.system, tccbThongTinDonVi: state.tccb.tccbThongTinDonVi });
const mapActionsToProps = { getTccbThongTinDonViPage };
export default connect(mapStateToProps, mapActionsToProps)(DmDonViPage);
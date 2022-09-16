import React from 'react';
import { connect } from 'react-redux';
import { getTccbDanhGiaPDDVPage, updateTccbDanhGiaPDDV } from './redux';
import Pagination from 'view/component/Pagination';
import { Link } from 'react-router-dom';
import { AdminPage, TableCell, renderTable } from 'view/component/AdminPage';
import { Tooltip } from '@mui/material';
import T from 'view/js/common';


class TccbDanhGiaPheDuyetDonViDetails extends AdminPage {
    state = { nam: '' }

    componentDidMount() {
        T.ready('/user/tccb', () => {
            const route = T.routeMatcher('/user/tccb/danh-gia/phe-duyet-don-vi/:nam');
            const nam = parseInt(route.parse(window.location.pathname)?.nam);
            this.setState({ nam });
            T.onSearch = (searchText) => this.props.getTccbDanhGiaPDDVPage(undefined, undefined, searchText || '');
            T.showSearchBox();
            this.props.getTccbDanhGiaPDDVPage();
        });
    }

    render() {
        const permission = this.getUserPermission('tccbDanhGiaPDDV');
        const nam = this.state.nam || '';
        const { pageNumber, pageSize, pageTotal, totalItem, pageCondition, list } = this.props.tccbDanhGiaPheDuyetDonVi && this.props.tccbDanhGiaPheDuyetDonVi.page ?
            this.props.tccbDanhGiaPheDuyetDonVi.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, list: null };
        let table = 'Không có dữ liệu phê duyệt!';
        if (list && list.length > 0) {
            table = renderTable({
                getDataSource: () => list, stickyHead: false,
                renderHead: () => (
                    <tr>
                        <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>#</th>
                        <th style={{ width: '20%', textAlign: 'center' }}>Cán bộ</th>
                        <th style={{ width: '40%', textAlign: 'center' }}>Nhóm đăng ký</th>
                        <th style={{ width: '40%', textAlign: 'center' }}>Trạng thái phê duyệt</th>
                        <th style={{ width: 'auto', textAlign: 'center' }}>Thao tác</th>
                    </tr>
                ),
                renderRow: (item, index) => (
                    <tr key={index}>
                        <TableCell type='text' style={{ textAlign: 'center' }} content={index + 1} />
                        <TableCell type='text' content={<>
                            <span>{`${item.ho} ${item.ten}`}<br /></span>
                            {item.shcc}
                        </>} style={{ whiteSpace: 'nowrap' }} />
                        <TableCell type='text' style={{ textAlign: 'left' }} content={item.tenNhomDangKy || 'Chưa đăng ký'} />
                        <TableCell type='text' style={{ textAlign: 'left' }} content={item.approvedDonVi || 'Chưa phê duyệt'} />
                        <TableCell type='buttons' style={{ textAlign: 'center' }} content={item} permission={permission}>
                            <Tooltip title='Đồng ý' arrow>
                                <button className='btn btn-success' onClick={() => item.id ? this.props.updateTccbDanhGiaPDDV(item.id, 'Đồng ý') : T.notify('Cá nhân chưa đăng ký!', 'danger')}>
                                    <i className='fa fa-lg fa-check' />
                                </button>
                            </Tooltip>
                            <Tooltip title='Không đồng ý' arrow>
                                <button className='btn btn-danger' onClick={() => item.id ? this.props.updateTccbDanhGiaPDDV(item.id, 'Không đồng ý') : T.notify('Cá nhân chưa đăng ký!', 'danger')}>
                                    <i className='fa fa-lg fa-times' />
                                </button>
                            </Tooltip>
                        </TableCell>
                    </tr>
                )
            });
        }

        return this.renderPage({
            icon: 'fa fa-list-alt',
            title: `Thông tin đăng ký năm ${nam}`,
            breadcrumb: [
                <Link key={0} to='/user/tccb/'>Tổ chức cán bộ</Link>,
                <Link key={1} to='/user/tccb/danh-gia-phe-duyet-don-vi/'>Phê duyệt đơn vị</Link>,
                `Thông tin phê duyệt năm ${nam}`
            ],
            content: <>
                <div className='tile'>{table}</div>
                <Pagination style={{ marginLeft: '70px' }} {...{ pageNumber, pageSize, pageTotal, totalItem, pageCondition }}
                    getPage={this.props.getTccbDanhGiaPDDVPage} />
            </>,
            backRoute: '/user/tccb/danh-gia-phe-duyet-don-vi/',
        });
    }
}

const mapStateToProps = state => ({ system: state.system, tccbDanhGiaPheDuyetDonVi: state.tccb.tccbDanhGiaPheDuyetDonVi });
const mapActionsToProps = { getTccbDanhGiaPDDVPage, updateTccbDanhGiaPDDV };
export default connect(mapStateToProps, mapActionsToProps)(TccbDanhGiaPheDuyetDonViDetails);
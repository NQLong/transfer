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

    showStatus = (status, alternativeText) => {
        if (status == 'Đồng ý') {
            return <span style={{ color: 'green' }}>{status}</span>;
        }
        if (status == 'Không đồng ý') {
            return <span style={{ color: 'red' }}>{status}</span>;
        }
        return <span dangerouslySetInnerHTML={{ __html: status || alternativeText }} />;
    }

    componentDidMount() {
        T.ready('/user/tccb', () => {
            const route = T.routeMatcher('/user/tccb/danh-gia-phe-duyet-don-vi/:nam');
            const nam = parseInt(route.parse(window.location.pathname)?.nam);
            this.setState({ nam });
            T.onSearch = (searchText) => this.props.getTccbDanhGiaPDDVPage(undefined, undefined, searchText || '');
            T.showSearchBox();
            this.props.getTccbDanhGiaPDDVPage();
        });
    }

    approvedDonViAction = (e, item, status) => {
        e.preventDefault();
        T.confirm(`${status} phê duyệt`, `Bạn có chắc bạn muốn ${status} mục này`, true, isConfirm =>
            isConfirm && this.props.updateTccbDanhGiaPDDV(item.id, status));
    }

    render() {
        const nam = this.state.nam || '';
        const { pageNumber, pageSize, pageTotal, totalItem, pageCondition, list } = this.props.tccbDanhGiaPheDuyetDonVi && this.props.tccbDanhGiaPheDuyetDonVi.page ?
            this.props.tccbDanhGiaPheDuyetDonVi.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, list: null };
        let table = 'Không có dữ liệu phê duyệt!';
        if (list && list.length > 0) {
            table = renderTable({
                getDataSource: () => list, stickyHead: false,
                renderHead: () => (
                    <tr>
                        <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>#</th>
                        <th style={{ width: '20%', textAlign: 'center' }}>Cán bộ</th>
                        <th style={{ width: '40%', textAlign: 'center' }}>Cá nhân đăng ký</th>
                        <th style={{ width: '40%', textAlign: 'center' }}>Đơn vị phê duyệt</th>
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
                        <TableCell type='text' style={{ textAlign: 'left' }} content={this.showStatus(item.approvedDonVi, 'Chưa phê duyệt')} />
                        <TableCell type='buttons' style={{ textAlign: 'center' }}>
                            {
                                item.approvedTruong != 'Đồng ý' && <><Tooltip title='Đồng ý' arrow>
                                    <button className='btn btn-success' onClick={e => item.id ? this.approvedDonViAction(e, item, 'Đồng ý') : T.notify('Cá nhân chưa đăng ký!', 'danger')}>
                                        <i className='fa fa-lg fa-check' />
                                    </button>
                                </Tooltip>
                                    <Tooltip title='Không đồng ý' arrow>
                                        <button className='btn btn-danger' onClick={e => item.id ? this.approvedDonViAction(e, item, 'Không đồng ý') : T.notify('Cá nhân chưa đăng ký!', 'danger')}>
                                            <i className='fa fa-lg fa-times' />
                                        </button>
                                    </Tooltip></>
                            }
                        </TableCell>
                    </tr>
                )
            });
        }

        return this.renderPage({
            icon: 'fa fa-list-alt',
            title: `Thông tin đăng ký năm ${nam}`,
            breadcrumb: [
                <Link key={0} to='/user/tccb'>Tổ chức cán bộ</Link>,
                <Link key={1} to='/user/tccb/danh-gia-phe-duyet-don-vi'>Đơn vị phê duyệt</Link>,
                `Thông tin phê duyệt năm ${nam}`
            ],
            content: <>
                <div className='tile'>{table}</div>
                <Pagination style={{ marginLeft: '70px' }} {...{ pageNumber, pageSize, pageTotal, totalItem, pageCondition }}
                    getPage={this.props.getTccbDanhGiaPDDVPage} />
            </>,
            backRoute: '/user/tccb/danh-gia-phe-duyet-don-vi',
        });
    }
}

const mapStateToProps = state => ({ system: state.system, tccbDanhGiaPheDuyetDonVi: state.tccb.tccbDanhGiaPheDuyetDonVi });
const mapActionsToProps = { getTccbDanhGiaPDDVPage, updateTccbDanhGiaPDDV };
export default connect(mapStateToProps, mapActionsToProps)(TccbDanhGiaPheDuyetDonViDetails);
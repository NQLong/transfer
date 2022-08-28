import React from 'react';
import { connect } from 'react-redux';
import { getTccbDonViDangKyNhiemVuDanhGiaNamAll } from './redux';
import { Link } from 'react-router-dom';
import { AdminPage, renderTable, TableCell } from 'view/component/AdminPage';
import { Tooltip } from '@mui/material';

class TccbDonViDangKyNhiemVuPage extends AdminPage {

    componentDidMount() {
        T.ready('/user/tccb', () => {
            this.props.getTccbDonViDangKyNhiemVuDanhGiaNamAll(items => this.setState({ items }));
        });
    }

    render() {
        const permission = this.getUserPermission('tccbDonViDangKyNhiemVu');
        const list = this.state?.items || [];
        let table = renderTable({
            emptyTable: 'Không có dữ liệu đăng ký',
            getDataSource: () => list,
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', textAlign: 'right', verticalAlign: 'middle' }}>#</th>
                    <th style={{ width: '50%', textAlign: 'center', whiteSpace: 'nowrap' }}>Năm đánh giá</th>
                    <th style={{ width: '50%', textAlign: 'center', whiteSpace: 'nowrap' }}>Thời hạn đăng ký của đơn vị</th>
                    <th style={{ width: 'auto', textAlign: 'center', verticalAlign: 'middle' }} nowrap='true'>Thao tác</th>
                </tr>
            ),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell style={{ textAlign: 'center' }} content={index + 1} />
                    <TableCell type='link' url={`/user/tccb/danh-gia/${item.nam}`} style={{ textAlign: 'center' }} content={item.nam} />
                    <TableCell style={{ textAlign: 'center' }} content={`${T.dateToText(item.donViBatDauDangKy, 'dd/mm/yyyy HH:MM')} - ${T.dateToText(item.donViKetThucDangKy, 'dd/mm/yyyy HH:MM')}`} />
                    <TableCell style={{ textAlign: 'center' }} type='buttons' content={item} permission={permission}>
                        {
                            (new Date().getTime() >= item.donViBatDauDangKy && new Date().getTime() <= item.donViKetThucDangKy) ?
                                <Tooltip title='Đăng ký nhiệm vụ' arrow>
                                    <a className='btn btn-info' href='#' onClick={() => this.props.history.push(`/user/tccb/don-vi-dang-ky-nhiem-vu/${item.nam}`)}>
                                        <i className='fa fa-lg fa-edit' />
                                    </a>
                                </Tooltip> :
                                <Tooltip title='Xem thông tin đăng ký' arrow>
                                    <a className='btn btn-warning' href='#' onClick={() => this.props.history.push(`/user/tccb/don-vi-dang-ky-nhiem-vu/${item.nam}`)}>
                                        <i className='fa fa-lg fa-info' />
                                    </a>
                                </Tooltip>
                        }
                    </TableCell>
                </tr>
            )
        });

        return this.renderPage({
            icon: 'fa fa-pencil',
            title: 'Đơn vị đăng ký nhiệm vụ',
            breadcrumb: [
                <Link key={0} to='/user/tccb/'>Tổ chức cán bộ</Link>,
                'Đơn vị đăng ký nhiệm vụ'
            ],
            content: <div className='tile'>{table}</div>,
            backRoute: '/user/tccb',
        });
    }
}

const mapStateToProps = state => ({ system: state.system });
const mapActionsToProps = { getTccbDonViDangKyNhiemVuDanhGiaNamAll };
export default connect(mapStateToProps, mapActionsToProps)(TccbDonViDangKyNhiemVuPage);
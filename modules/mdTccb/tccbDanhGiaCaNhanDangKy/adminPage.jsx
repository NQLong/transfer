import React from 'react';
import { connect } from 'react-redux';
import { getTccbCaNhanDangKyDanhGiaNamAll } from './redux';
import { Link } from 'react-router-dom';
import { AdminPage, renderTable, TableCell } from 'view/component/AdminPage';
import { Tooltip } from '@mui/material';

class TccbCaNhanDangKyPage extends AdminPage {

    componentDidMount() {
        T.ready('/user/tccb', () => {
            this.props.getTccbCaNhanDangKyDanhGiaNamAll(items => this.setState({ items }));
        });
    }

    render() {
        const list = this.state?.items || [];
        let table = renderTable({
            emptyTable: 'Không có dữ liệu đăng ký',
            getDataSource: () => list,
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', textAlign: 'right', verticalAlign: 'middle' }}>#</th>
                    <th style={{ width: '50%', textAlign: 'center', whiteSpace: 'nowrap' }}>Năm đánh giá</th>
                    <th style={{ width: '50%', textAlign: 'center', whiteSpace: 'nowrap' }}>Thời hạn đăng ký</th>
                    <th style={{ width: 'auto', textAlign: 'center', verticalAlign: 'middle' }} nowrap='true'>Thao tác</th>
                </tr>
            ),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell style={{ textAlign: 'center' }} content={index + 1} />
                    <TableCell type='link' url={`/user/tccb/ca-nhan-dang-ky/${item.nam}`} style={{ textAlign: 'center' }} content={item.nam} />
                    <TableCell style={{ textAlign: 'center', color: `${Date.now() >= item.nldBatDauDangKy && Date.now() <= item.nldKetThucDangKy && 'green'}` }} content={`${T.dateToText(item.nldBatDauDangKy, 'dd/mm/yyyy HH:MM')} - ${T.dateToText(item.nldKetThucDangKy, 'dd/mm/yyyy HH:MM')}`} />
                    <TableCell style={{ textAlign: 'center' }} type='buttons' content={item}>
                        {
                            (Date.now() >= item.nldBatDauDangKy && Date.now() <= item.nldKetThucDangKy) ?
                                <Tooltip title='Đăng ký' arrow>
                                    <button className='btn btn-info' onClick={() => this.props.history.push(`/user/tccb/ca-nhan-dang-ky/${item.nam}`)}>
                                        <i className='fa fa-lg fa-edit' />
                                    </button>
                                </Tooltip> :
                                <Tooltip title='Xem thông tin đăng ký' arrow>
                                    <button className='btn btn-warning' onClick={() => this.props.history.push(`/user/tccb/ca-nhan-dang-ky/${item.nam}`)}>
                                        <i className='fa fa-lg fa-info' />
                                    </button>
                                </Tooltip>
                        }
                    </TableCell>
                </tr>
            )
        });

        return this.renderPage({
            icon: 'fa fa-pencil',
            title: 'Cá nhân đăng ký',
            breadcrumb: [
                <Link key={0} to='/user/tccb/'>Tổ chức cán bộ</Link>,
                'Cá nhân đăng ký'
            ],
            content: <div className='tile'>{table}</div>,
            backRoute: '/user/tccb',
        });
    }
}

const mapStateToProps = state => ({ system: state.system });
const mapActionsToProps = { getTccbCaNhanDangKyDanhGiaNamAll };
export default connect(mapStateToProps, mapActionsToProps)(TccbCaNhanDangKyPage);
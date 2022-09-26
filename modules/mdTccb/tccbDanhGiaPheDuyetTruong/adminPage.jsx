import React from 'react';
import { connect } from 'react-redux';
import { getTccbDanhGiaPheDuyetTruongAllNam } from './redux';
import { Link } from 'react-router-dom';
import { AdminPage, renderTable, TableCell } from 'view/component/AdminPage';
import { Tooltip } from '@mui/material';

class TccbDanhGiaPheDuyetTruongPage extends AdminPage {

    componentDidMount() {
        T.ready('/user/tccb', () => {
            this.props.getTccbDanhGiaPheDuyetTruongAllNam(items => this.setState({ items }));
        });
    }

    render() {
        const list = this.state?.items || [];
        let table = renderTable({
            emptyTable: 'Không có dữ liệu phê duyệt',
            getDataSource: () => list,
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', textAlign: 'right', verticalAlign: 'middle' }}>#</th>
                    <th style={{ width: '50%', textAlign: 'center', whiteSpace: 'nowrap' }}>Năm</th>
                    <th style={{ width: '50%', textAlign: 'center', whiteSpace: 'nowrap' }}>Thời hạn phê duyệt của trường</th>
                    <th style={{ width: 'auto', textAlign: 'center', verticalAlign: 'middle' }} nowrap='true'>Thao tác</th>
                </tr>
            ),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell style={{ textAlign: 'center' }} content={index + 1} />
                    <TableCell type='link' url={`/user/tccb/danh-gia-phe-duyet-truong/${item.nam}`} style={{ textAlign: 'center' }} content={item.nam} />
                    <TableCell style={{ textAlign: 'center', color: `${Date.now() >= item.truongBatDauPheDuyet && Date.now() <= item.truongKetThucPheDuyet && 'green'}` }} content={`${T.dateToText(item.truongBatDauPheDuyet, 'dd/mm/yyyy HH:MM')} - ${T.dateToText(item.truongKetThucPheDuyet, 'dd/mm/yyyy HH:MM')}`} />
                    <TableCell style={{ textAlign: 'center' }} type='buttons'>
                        {
                            (Date.now() >= item.truongBatDauPheDuyet && Date.now() <= item.truongKetThucPheDuyet) ?
                                <Tooltip title='Phê duyệt' arrow>
                                    <button className='btn btn-success' onClick={() => this.props.history.push(`/user/tccb/danh-gia-phe-duyet-truong/${item.nam}`)}>
                                        <i className='fa fa-lg fa-info' />
                                    </button>
                                </Tooltip> :
                                <Tooltip title='Xem danh sách phê duyệt' arrow>
                                    <button className='btn btn-info' onClick={() => this.props.history.push(`/user/tccb/danh-gia-phe-duyet-truong/${item.nam}`)}>
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
            title: 'Trường phê duyệt',
            breadcrumb: [
                <Link key={0} to='/user/tccb'>Tổ chức cán bộ</Link>,
                'Trường phê duyệt'
            ],
            content: <div className='tile'>{table}</div>,
            backRoute: '/user/tccb',
        });
    }
}

const mapStateToProps = state => ({ system: state.system });
const mapActionsToProps = { getTccbDanhGiaPheDuyetTruongAllNam };
export default connect(mapStateToProps, mapActionsToProps)(TccbDanhGiaPheDuyetTruongPage);
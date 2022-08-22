import React from 'react';
import { connect } from 'react-redux';
import { getTccbKhungDanhGiaCanBoPage, deleteTccbKhungDanhGiaCanBoAll } from './redux';
import { Link } from 'react-router-dom';
import { AdminPage, renderTable, TableCell } from 'view/component/AdminPage';
import { Tooltip } from '@mui/material';


class TccbKhungDanhGiaCanBoPage extends AdminPage {
    componentDidMount() {
        T.ready('/user/danh-gia', () => {
            T.clearSearchBox();
            T.showSearchBox();
            this.props.getTccbKhungDanhGiaCanBoPage(undefined, undefined, { searchTerm: '' });
        });
    }

    delete = (e, item) => {
        e.preventDefault();
        T.confirm('Xóa khung đánh giá cán bộ', 'Bạn có chắc bạn muốn xóa khung đánh giá cán bộ này?', true, isConfirm =>
            isConfirm && this.props.deleteTccbKhungDanhGiaCanBoAll(item));
    }

    render() {
        const permission = this.getUserPermission('tccbKhungDanhGiaCanBo');
        const { list } = this.props.tccbKhungDanhGiaCanBo && this.props.tccbKhungDanhGiaCanBo.page ?
            this.props.tccbKhungDanhGiaCanBo.page : {
                list: []
            };
        const namList = [...new Set(list.map(item => item.nam))];
        let table = renderTable({
            emptyTable: 'Không có dữ liệu khung đánh giá cán bộ',
            getDataSource: () => namList,
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', textAlign: 'right', verticalAlign: 'middle' }}>STT</th>
                    <th style={{ width: '100%', textAlign: 'center', whiteSpace: 'nowrap' }}>Năm đánh giá</th>
                    <th style={{ width: 'auto', textAlign: 'center', verticalAlign: 'middle' }} nowrap='true'>Thao tác</th>
                </tr>
            ),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell style={{ textAlign: 'right' }} content={index + 1} />
                    <TableCell type='link' url={`/user/danh-gia/cau-truc-khung-danh-gia-can-bo/${item}`} style={{ textAlign: 'center' }} content={item} />
                    <TableCell style={{ textAlign: 'center' }} type='buttons' content={item} permission={permission}
                        onEdit={permission.write ? (e) => e.preventDefault() || this.props.history.push(`/user/danh-gia/cau-truc-khung-danh-gia-can-bo/${item}`) : null}
                        onDelete={this.delete}
                    >
                        <Tooltip title='Sao chép' arrow>
                            <a className='btn btn-info' href='#' onClick={e => e.preventDefault() || permission.write ? this.props.history.push(`/user/danh-gia/cau-truc-khung-danh-gia-can-bo/new?id=${item}`) : T.notify('Vui lòng liên hệ người quản lý!', 'danger')}>
                                <i className='fa fa-lg fa-clone ' />
                            </a>
                        </Tooltip>
                    </TableCell>
                </tr>
            )
        });

        return this.renderPage({
            icon: 'fa fa-university',
            title: 'Khung đánh giá cán bộ',
            breadcrumb: [
                <Link key={0} to='/user/danh-gia'>Đánh giá</Link>,
                'Khung đánh giá cán bộ'
            ],
            content: <>
                <div className='tile'>{table}</div>
            </>,
            backRoute: '/user/danh-gia',
            onCreate: permission.write ? (e) => e.preventDefault() || this.props.history.push('/user/danh-gia/cau-truc-khung-danh-gia-can-bo/new') : null
        });
    }
}

const mapStateToProps = state => ({ system: state.system, tccbKhungDanhGiaCanBo: state.danhGia.tccbKhungDanhGiaCanBo });
const mapActionsToProps = { getTccbKhungDanhGiaCanBoPage, deleteTccbKhungDanhGiaCanBoAll };
export default connect(mapStateToProps, mapActionsToProps)(TccbKhungDanhGiaCanBoPage);
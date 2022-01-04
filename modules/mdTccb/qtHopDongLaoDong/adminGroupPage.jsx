import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { AdminPage, TableCell, renderTable } from 'view/component/AdminPage';
import Pagination from 'view/component/Pagination';
import {
    getQtHopDongLaoDongPage, getQtHopDongLaoDongAll, updateQtHopDongLaoDong,
    deleteQtHopDongLaoDong, createQtHopDongLaoDong, getQtHopDongLaoDongShccPage, downloadWord
} from './redux';

class QtHopDongLaoDongGroupPage extends AdminPage {

    componentDidMount() {
        T.ready('/user/tccb', () => {
            const route = T.routeMatcher('/user/tccb/qua-trinh/hop-dong-lao-dong/group/:shcc'),
                shcc = route.parse(window.location.pathname);
            T.onSearch = (searchText) => this.props.getQtHopDongLaoDongPage(undefined, undefined, searchText || '');
            T.showSearchBox();
            this.props.getQtHopDongLaoDongPage(undefined, undefined, shcc.shcc);
        });
    }

    downloadWord = item => {
        downloadWord(parseInt(item.ma), data => {
            T.FileSaver(new Blob([new Uint8Array(data.data)]), item.shcc + '_hopdong.docx');
        });
    }

    delete = (e, item) => {
        T.confirm('Xóa hợp đồng', 'Bạn có chắc bạn muốn xóa hợp đồng này?', 'warning', true, isConfirm => {
            isConfirm && this.props.deleteQtHopDongLaoDong(item.stt, error => {
                if (error) T.notify(error.message ? error.message : 'Xoá hợp đồng bị lỗi!', 'danger');
                else T.alert('Xoá hợp đồng thành công!', 'success', false, 800);
            });
        });
        e.preventDefault();
    }

    render() {
        const permission = this.getUserPermission('qtHopDongLaoDong', ['read', 'write', 'delete']);
        let { pageNumber, pageSize, pageTotal, totalItem, pageCondition, list } =
            this.props.qtHopDongLaoDong && this.props.qtHopDongLaoDong.page ?
                this.props.qtHopDongLaoDong.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, pageCondition: {}, list: [] };

        let table = renderTable({
            getDataSource: () => list, stickyHead: true,
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                    <th style={{ width: '30%', whiteSpace: 'nowrap' }}>Cán bộ</th>
                    <th style={{ width: '70%', whiteSpace: 'nowrap' }}>Số hợp đồng</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Thời gian</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Cán bộ duyệt hồ sơ</th>
                    <th style={{ width: 'auto', textAlign: 'center' }}>Thao tác</th>

                </tr>
            ),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell type='text' content={index + 1} />
                    <TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={(
                        <>
                            <a href={'/user/tccb/qua-trinh/hop-dong-lao-dong/' + item.ma}>
                                <span>{item.hoBenA + ' ' + item.tenBenA}</span><br />
                                <span>Mã thẻ cán bộ: {item.shcc}</span></a>
                        </>
                    )}
                    />
                    <TableCell type='text' content={(
                        <>
                            <span>Số: {item.soHopDong}</span><br />
                            <span>Ngày ký: <span style={{ color: 'blue' }}>{item.ngayKyHopDong ? new Date(item.ngayKyHopDong).ddmmyyyy() : ''}</span></span>
                        </>
                    )}
                    />
                    <TableCell type='text' content={(
                        item.loaiHopDong != '07' ?
                            <>
                                <span style={{ whiteSpace: 'nowrap' }}>{item.tenLoaiHopDong.replace('Hợp đồng lao động', 'HĐLĐ')}</span><br />
                                <span style={{ whiteSpace: 'nowrap' }}>Từ ngày: <span style={{ color: 'blue' }}>{item.batDauLamViec ? new Date(item.batDauLamViec).ddmmyyyy() : ''}</span></span><br />
                                <span style={{ whiteSpace: 'nowrap' }}>Đến ngày: <span style={{ color: 'blue' }}>{item.ketThucHopDong ? new Date(item.ketThucHopDong).ddmmyyyy() : ''}</span></span>
                            </> :
                            <>
                                <span>{item.tenLoaiHopDong.replace('Hợp đồng lao động', 'HĐLĐ')}</span><br />
                            </>
                    )}
                    />
                    <TableCell style={{ whiteSpace: 'nowrap' }} type='text' content={(
                        <>
                            <span>{item.hoNguoiKy + ' ' + item.tenNguoiKy}<br /></span>
                            <Link to={'/user/staff/' + item.shccNguoiKy}>{item.shccNguoiKy}</Link>
                        </>
                    )} />
                    <TableCell type='buttons' content={item} onEdit={`/user/tccb/qua-trinh/hop-dong-lao-dong/${item.ma}`} onDelete={this.delete} permission={permission} >
                        <a href="#" className="btn btn-primary" style={{ width: '45px' }} onClick={e => e.preventDefault() || this.downloadWord(item)}>
                            <i className='fa fa-lg fa-file-word-o' />
                        </a>
                    </TableCell>
                </tr>
            )
        });


        return this.renderPage({
            icon: 'fa fa-file-text-o',
            title: 'Hợp đồng Lao động cán bộ',
            breadcrumb: [
                <Link key={0} to='/user/tccb'>Tổ chức cán bộ</Link>,
                <Link key={1} to='/user/tccb/qua-trinh/ky-hop-dong'>Hợp đồng Lao dộng</Link>,
                'Hợp đồng Lao động cán bộ'
            ],
            content: <>
                <div className='tile'>
                    {table}
                </div>
                <Pagination style={{ marginLeft: '70px' }}
                    {...{ pageNumber, pageSize, pageTotal, totalItem, pageCondition }}
                    getPage={this.props.getQtHopDongLaoDongPage} />
            </>,
            backRoute: '/user/tccb/qua-trinh/hop-dong-lao-dong',
            onCreate: permission.write ? (e) => e.preventDefault() || this.props.history.push('/user/tccb/qua-trinh/hop-dong-lao-dong/new') : null
            ,
        });
    }
}

const mapStateToProps = state => ({ system: state.system, qtHopDongLaoDong: state.qtHopDongLaoDong });
const mapActionsToProps = {
    getQtHopDongLaoDongAll, getQtHopDongLaoDongPage, deleteQtHopDongLaoDong, createQtHopDongLaoDong,
    updateQtHopDongLaoDong, getQtHopDongLaoDongShccPage, downloadWord
};
export default connect(mapStateToProps, mapActionsToProps)(QtHopDongLaoDongGroupPage);
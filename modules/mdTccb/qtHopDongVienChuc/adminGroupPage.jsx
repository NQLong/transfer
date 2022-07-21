import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { AdminPage, TableCell, renderTable } from 'view/component/AdminPage';
import Pagination from 'view/component/Pagination';
import {
    getQtHopDongVienChucPage, getQtHopDongVienChucAll, updateQtHopDongVienChuc,
    deleteQtHopDongVienChuc, createQtHopDongVienChuc, downloadWord
} from './redux';

class QtHopDongVienChucGroupPage extends AdminPage {

    componentDidMount() {
        T.ready('/user/tccb', () => {
            const route = T.routeMatcher('/user/tccb/qua-trinh/hop-dong-lam-viec/group/:shcc'),
                shcc = route.parse(window.location.pathname);
            T.onSearch = (searchText) => {
                this.props.getQtHopDongVienChucPage(undefined, undefined, searchText || '', shcc.shcc);
            };
            T.showSearchBox();
            this.setState({ shcc: shcc.shcc });
            this.props.getQtHopDongVienChucPage(undefined, undefined, shcc.shcc, () => {
                T.updatePage('pageQtHopDongVienChuc', undefined, undefined, '');
            });
        });
    }

    downloadWord = item => {
        downloadWord(parseInt(item.ma), data => {
            T.FileSaver(new Blob([new Uint8Array(data.data)]), item.shcc + '_hopdong.docx');
        });
    }

    delete = (e, item) => {
        T.confirm('Xóa hợp đồng', 'Bạn có chắc bạn muốn xóa hợp đồng này?', 'warning', true, isConfirm => {
            isConfirm && this.props.deleteQtHopDongVienChuc(item.stt, error => {
                if (error) T.notify(error.message ? error.message : 'Xoá hợp đồng bị lỗi!', 'danger');
                else T.alert('Xoá hợp đồng thành công!', 'success', false, 800);
            });
        });
        e.preventDefault();
    }

    render() {
        const permission = this.getUserPermission('qtHopDongVienChuc', ['read', 'write', 'delete']);
        let { pageNumber, pageSize, pageTotal, totalItem, pageCondition, list } =
            this.props.qtHopDongVienChuc && this.props.qtHopDongVienChuc.page ?
                this.props.qtHopDongVienChuc.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, pageCondition: {}, list: [] };

        let table = renderTable({
            getDataSource: () => list, stickyHead: true,
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                    <th style={{ width: '50%', whiteSpace: 'nowrap' }}>Cán bộ</th>
                    <th style={{ width: '50%', whiteSpace: 'nowrap' }}>Số quyết định</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Thời gian</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Cán bộ ký quyết định</th>
                    <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>Thao tác</th>
                </tr>
            ),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell type='text' content={(pageNumber - 1) * pageSize + index + 1} />
                    <TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={(
                        <>
                            <a href={permission.write ? '/user/tccb/qua-trinh/hop-dong-lam-viec/' + item.ma : ''}>
                                <span>{(item.hoBenB ? item.hoBenB : '') + ' ' + (item.tenBenB ? item.tenBenB : '')}</span><br />
                                <span>{item.shcc}</span></a>
                        </>
                    )}
                    />
                    <TableCell type='text' content={(
                        <>
                            <span style={{ whiteSpace: 'nowrap' }}>Số QĐ: {item.soQuyetDinh}</span><br />
                            <span>Ngày ký QĐ: <span style={{ color: 'blue' }}>{item.ngayKyQuyetDinh ? new Date(item.ngayKyQuyetDinh).ddmmyyyy() : ''}</span></span>
                        </>
                    )}
                    />
                    <TableCell type='text' content={(
                        item.loaiHopDong != '09' ?
                            <>
                                <span style={{ whiteSpace: 'nowrap' }}>{item.tenLoaiHopDong.replace('Hợp đồng làm việc có thời hạn', 'Hợp đồng')}</span><br />
                                <span style={{ whiteSpace: 'nowrap' }}>Từ ngày: <span style={{ color: 'blue' }}>{item.hieuLucHopDong ? new Date(item.hieuLucHopDong).ddmmyyyy() : ''}</span></span><br />
                                <span style={{ whiteSpace: 'nowrap' }}>Đến ngày: <span style={{ color: 'blue' }}>{item.ketThucHopDong ? new Date(item.ketThucHopDong).ddmmyyyy() : ''}</span></span>
                            </> :
                            <>
                                <span>{item.tenLoaiHopDong.replace('Hợp đồng làm việc', 'Hợp đồng')}</span><br />
                            </>
                    )}
                    />
                    <TableCell style={{ whiteSpace: 'nowrap' }} type='text' content={(
                        <>
                            <span>{(item.hoNguoiKy ? item.hoNguoiKy : '') + ' ' + (item.tenNguoiKy ? item.tenNguoiKy : '')}<br /></span>
                            {item.shccNguoiKy ? <Link to={'/user/tccb/staff/' + item.shccNguoiKy}>{item.shccNguoiKy}</Link> : null}
                        </>
                    )} />
                    <TableCell type='buttons' content={item} onEdit={permission.write ? `/user/tccb/qua-trinh/hop-dong-lam-viec/${item.ma}` : ''} onDelete={this.delete} permission={permission} >
                        {/* <a href="#" className="btn btn-primary" style={{ width: '45px' }} onClick={e => e.preventDefault() || this.downloadWord(item)}>
                            <i className='fa fa-lg fa-file-word-o' />
                        </a> */}
                    </TableCell>
                </tr>
            )
        });


        return this.renderPage({
            icon: 'fa fa-id-badge',
            title: 'Hợp đồng cán bộ',
            breadcrumb: [
                <Link key={0} to='/user/tccb'>Tổ chức cán bộ</Link>,
                <Link key={1} to='/user/tccb/qua-trinh/ky-hop-dong'>Hợp đồng làm việc</Link>,
                'Hợp đồng cán bộ'
            ],
            content: <>
                <div className='tile'>
                    {table}
                </div>
                <Pagination style={{ marginLeft: '70px' }}
                    {...{ pageNumber, pageSize, pageTotal, totalItem, pageCondition }}
                    getPage={this.props.getQtHopDongVienChucPage} />
            </>,
            backRoute: '/user/tccb/qua-trinh/hop-dong-lam-viec',
            onCreate: permission.write ? (e) => e.preventDefault() || this.props.history.push('/user/tccb/qua-trinh/hop-dong-lam-viec/new') : null
            ,
        });
    }
}

const mapStateToProps = state => ({ system: state.system, qtHopDongVienChuc: state.tccb.qtHopDongVienChuc });
const mapActionsToProps = {
    getQtHopDongVienChucAll, getQtHopDongVienChucPage, deleteQtHopDongVienChuc, createQtHopDongVienChuc,
    updateQtHopDongVienChuc, downloadWord
};
export default connect(mapStateToProps, mapActionsToProps)(QtHopDongVienChucGroupPage);
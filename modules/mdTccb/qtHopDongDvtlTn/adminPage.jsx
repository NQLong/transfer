import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { AdminPage, TableCell, renderTable} from 'view/component/AdminPage';
import Pagination from 'view/component/Pagination';
import {
    getQtHopDongDvtlTnPage, getQtHopDongDvtlTnAll, updateQtHopDongDvtlTn,
    deleteQtHopDongDvtlTn, createQtHopDongDvtlTn, downloadWord
} from './redux';
import { getDmChucVuAll } from 'modules/mdDanhMuc/dmChucVu/redux';
import { getDmDonViAll } from 'modules/mdDanhMuc/dmDonVi/redux';
import { getDmBoMonAll } from 'modules/mdDanhMuc/dmBoMon/redux';
import { getStaffAll } from 'modules/mdTccb/tccbCanBo/redux';


class QtHopDongDvtlTn extends AdminPage {
    componentDidMount() {
        T.ready('/user/tccb', () => {
            T.onSearch = (searchText) => this.props.getQtHopDongDvtlTnPage(undefined, undefined, searchText || '');
            T.showSearchBox();
            this.props.getQtHopDongDvtlTnPage();
        });
    }

    showModal = (e) => {
        e.preventDefault();
        this.modal.show();
    }

    downloadWord = (item) => {
        downloadWord(item.ma, data => {
            T.FileSaver(new Blob([new Uint8Array(data.data)]), item.shcc + '_hopdong.docx');
        });
    }

    delete = (e, item) => {
        T.confirm('Xóa hợp đồng', 'Bạn có chắc bạn muốn xóa hợp đồng này?', 'warning', true, isConfirm => {
            isConfirm && this.props.deleteQtHopDongDvtlTn(item.ma, error => {
                if (error) T.notify(error.message ? error.message : 'Xoá hợp đồng bị lỗi!', 'danger');
                else T.alert('Xoá hợp đồng thành công!', 'success', false, 800);
            });
        });
        e.preventDefault();
    }

    render() {
        const permission = this.getUserPermission('qtHopDongDvtlTn', ['read', 'write', 'delete']);
        let { pageNumber, pageSize, pageTotal, totalItem, pageCondition, list } = this.props.qtHopDongDvtlTn && this.props.qtHopDongDvtlTn.page ?
            this.props.qtHopDongDvtlTn.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, list };
        let table = 'Không có danh sách!';
        if (list && list.length > 0) {
            table = renderTable({
                getDataSource: () => list, stickyHead: false,
                renderHead: () => (
                    <tr>
                        <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                        <th style={{ width: '50%', whiteSpace: 'nowrap' }}>Cán bộ</th>
                        <th style={{ width: '50%', whiteSpace: 'nowrap' }}>Số hợp đồng</th>
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
                                <a href={'/user/tccb/qua-trinh/hop-dong-dvtl-tn/' + item.ma} >
                                    <span>{item.ho + ' ' + item.ten}</span><br />
                                    <span>{item.shcc}</span>
                                </a>
                            </>
                        )}
                        />
                        <TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={(
                            <>
                                <span>Số: {item.soHopDong}</span><br />
                                <span>{item.dienHopDong}</span><br />
                                <span>Ngày ký: <span style={{ color: 'blue' }}>{item.ngayKyHopDong ? new Date(item.ngayKyHopDong).ddmmyyyy() : ''}</span></span>
                            </>
                        )}
                        />
                        <TableCell type='text' content={(
                            <>
                                <span style={{ whiteSpace: 'nowrap' }}>Từ ngày: <span style={{ color: 'blue' }}>{item.hieuLucHopDong ? new Date(item.hieuLucHopDong).ddmmyyyy() : ''}</span></span><br />
                                <span style={{ whiteSpace: 'nowrap' }}>Đến ngày: <span style={{ color: 'blue' }}>{item.ketThucHopDong ? new Date(item.ketThucHopDong).ddmmyyyy() : ''}</span></span>
                            </>
                        )}
                        />
                        <TableCell style={{ whiteSpace: 'nowrap' }} type='text' content={(
                            <>
                                <span>{item.hoNguoiKy + ' ' + item.tenNguoiKy}<br /></span>
                                <Link to={'/user/tccb/staff/' + item.shccNguoiKy}>{item.shccNguoiKy}</Link>
                            </>
                        )} />
                        <TableCell type='buttons' content={item} onEdit={`/user/tccb/qua-trinh/hop-dong-dvtl-tn/${item.ma}`} onDelete={this.delete} permission={permission} >
                            <a href="#" className="btn btn-primary" style={{ width: '45px' }} onClick={e => e.preventDefault() || this.downloadWord(item)}>
                                <i className='fa fa-lg fa-file-word-o' />
                            </a>
                        </TableCell>
                    </tr>
                )
            });
        }

        return this.renderPage({
            icon: 'fa fa-pencil',
            title: 'Hợp đồng Đơn vị trả lương - Trách nhiệm',
            breadcrumb: [
                <Link key={0} to='/user/tccb'>Tổ chức cán bộ</Link>,
                'Hợp đồng Đơn vị trả lương - Trách nhiệm'
            ],
            content: <>
                <div className='tile'>{table}</div>
                <Pagination style={{ marginLeft: '70px' }} {...{ pageNumber, pageSize, pageTotal, totalItem, pageCondition }}
                    getPage={this.props.getQtHopDongDvtlTnPage} />
            </>,
            backRoute: '/user/tccb',
            onCreate: permission.write ? (e) => e.preventDefault() || this.props.history.push('/user/tccb/qua-trinh/hop-dong-dvtl-tn/new') : null
            ,
        });
    }
}

const mapStateToProps = state => ({ system: state.system, qtHopDongDvtlTn: state.qtHopDongDvtlTn });
const mapActionsToProps = {
    getQtHopDongDvtlTnAll, getQtHopDongDvtlTnPage, deleteQtHopDongDvtlTn, getDmDonViAll, createQtHopDongDvtlTn,
    updateQtHopDongDvtlTn, getDmChucVuAll, getDmBoMonAll, getStaffAll
};
export default connect(mapStateToProps, mapActionsToProps)(QtHopDongDvtlTn);
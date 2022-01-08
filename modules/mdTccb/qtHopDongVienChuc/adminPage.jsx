import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { AdminPage, TableCell, renderTable, FormCheckbox, FormSelect } from 'view/component/AdminPage';
import Pagination from 'view/component/Pagination';
import {
    getQtHopDongVienChucPage, getQtHopDongVienChucAll, updateQtHopDongVienChuc,
    deleteQtHopDongVienChuc, createQtHopDongVienChuc, getQtHopDongVienChucGroupPage, downloadWord
} from './redux';
import { getDmDonViAll } from 'modules/mdDanhMuc/dmDonVi/redux';

class QtHopDongVienChucPage extends AdminPage {
    checked = false;
    curState = [];
    stateTable = [];
    searchText = '';

    componentDidMount() {
        T.ready('/user/tccb', () => {
            this.props.getDmDonViAll(items => {
                if (items) {
                    this.stateTable = [];
                    items.forEach(item => this.stateTable.push({
                        'id': item.ma,
                        'text': item.ten
                    }));
                }
            });
            T.onSearch = (searchText) => {
                this.searchText = searchText;
                if (this.checked) this.props.getQtHopDongVienChucGroupPage(undefined, undefined, this.curState, this.searchText || '');
                else this.props.getQtHopDongVienChucPage(undefined, undefined, this.curState, this.searchText || '');
            };
            // T.showSearchBox();
            // this.props.getQtHopDongVienChucPage(undefined, undefined, '');
            T.showSearchBox(() => {
                this.maDonVi?.value('');
                setTimeout(() => this.changeAdvancedSearch(), 50);
                setTimeout(() => this.showAdvanceSearch(), 1000);
            });
            this.changeAdvancedSearch();
        });
    }

    changeAdvancedSearch = () => {
        let { pageNumber, pageSize } = this.props && this.props.qtHopDongVienChuc && this.props.qtHopDongVienChuc.page ? this.props.qtHopDongVienChuc.page : { pageNumber: 1, pageSize: 50};

        const maDonVi  = this.maDonVi?.value() || [];
        this.curState = maDonVi;
        if (this.checked) this.props.getQtHopDongVienChucGroupPage(pageNumber, pageSize, this.curState, this.searchText || '');
        else this.props.getQtHopDongVienChucPage(pageNumber, pageSize, this.curState, this.searchText || '');
    }

    groupPage = () => {
        let { pageNumber, pageSize } = this.props && this.props.qtHopDongVienChuc && this.props.qtHopDongVienChuc.page ? this.props.qtHopDongVienChuc.page : { pageNumber: 1, pageSize: 50};
        this.checked = !this.checked;
        if (this.checked) this.props.getQtHopDongVienChucGroupPage(pageNumber, pageSize, this.curState, this.searchText || '');
        else this.props.getQtHopDongVienChucPage(pageNumber, pageSize, this.curState, this.searchText || '');
    }

    downloadWord = (item) => {
        downloadWord(item.ma, data => {
            T.FileSaver(new Blob([new Uint8Array(data.data)]), item.shcc + '_hopdong.docx');
        });
    }

    download = (e) => {
        e.preventDefault();
        T.download(T.url('/api/tccb/qua-trinh/hop-dong-vien-chuc/download-excel'), 'HDLD.xlsx');
    }

    delete = (e, item) => {
        T.confirm('Xóa hợp đồng', 'Bạn có chắc bạn muốn xóa hợp đồng này?', 'warning', true, isConfirm => {
            isConfirm && this.props.deleteQtHopDongVienChuc(item.ma, error => {
                if (error) T.notify(error.message ? error.message : 'Xoá hợp đồng bị lỗi!', 'danger');
                else T.alert('Xoá hợp đồng thành công!', 'success', false, 800);
            });
        });
        e.preventDefault();
    }

    render() {
        const permission = this.getUserPermission('qtHopDongVienChuc', ['read', 'write', 'delete']);
        let { pageNumber, pageSize, pageTotal, totalItem, pageCondition, list } = this.checked ?
            (this.props.qtHopDongVienChuc && this.props.qtHopDongVienChuc.page_gr ?
                this.props.qtHopDongVienChuc.page_gr : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, pageCondition: {}, list })
            : (this.props.qtHopDongVienChuc && this.props.qtHopDongVienChuc.page ? this.props.qtHopDongVienChuc.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, pageCondition: {}, list: [] });
        // let maDonVi = this.curState;        
        let table = 'Không có danh sách!';
        if (list && list.length > 0) {
            table = renderTable({
                getDataSource: () => list, stickyHead: true,
                renderHead: () => (
                    <tr>
                        <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                        <th style={{ width: '50%', whiteSpace: 'nowrap' }}>Cán bộ</th>
                        <th style={{ width: '50%', whiteSpace: 'nowrap' }}>Số quyết định</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Thời gian</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Cán bộ ký quyết định</th>
                        <th style={{ width: 'auto', textAlign: 'center',  whiteSpace: 'nowrap' }}>Thao tác</th>
                    </tr>
                ),
                renderRow: (item, index) => (
                    <tr key={index}>
                        <TableCell type='text' content={index + 1} />
                        <TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={(
                            <>
                                <a href={'/user/tccb/qua-trinh/hop-dong-vien-chuc/' + item.ma}>
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
                        {
                            !this.checked && <TableCell type='buttons' style={{ textAlign: 'center' }} content={item} permission={permission}
                                onEdit={`/user/tccb/qua-trinh/hop-dong-vien-chuc/${item.ma}`} onDelete={this.delete} >
                                {/* <a href="#" className="btn btn-primary" style={{ width: '45px' }} onClick={e => e.preventDefault() || this.downloadWord(item)}>
                                    <i className='fa fa-lg fa-file-word-o' />
                                </a> */}
                            </TableCell>
                        }
                        {
                            this.checked &&
                            <TableCell type='buttons' style={{ textAlign: 'center', width: '45px' }} content={item} permission={permission} >
                                <Link className='btn btn-success' to={'/user/tccb/qua-trinh/hop-dong-vien-chuc/group/' + item.shcc} >
                                    <i className='fa fa-lg fa-compress' />
                                </Link>
                            </TableCell>
                        }
                    </tr>
                )
            });
        }

        return this.renderPage({
            icon: 'fa fa-id-badge',
            title: 'Hợp đồng viên chức',
            breadcrumb: [
                <Link key={0} to='/user/tccb'>Tổ chức cán bộ</Link>,
                'Hợp đồng viên chức'
            ],
            advanceSearch: <>
                <FormSelect className='col-12 col-md-12' multiple = {true} ref={e => this.maDonVi = e} label='Chọn đơn vị (có thể chọn nhiều đơn vị)' data={this.stateTable} onChange={() => this.changeAdvancedSearch()} allowClear={true} />
            </>,
            content: <>
                <div className='tile'>
                    <FormCheckbox label='Hiển thị theo cán bộ' onChange={this.groupPage} />
                    {table}
                </div>
                <Pagination style={{ marginLeft: '70px' }} {...{ pageNumber, pageSize, pageTotal, totalItem, pageCondition }}
                    getPage={this.checked ? this.props.getQtHopDongVienChucGroupPage : this.props.getQtHopDongVienChucPage} />
                {/* {permission.read &&
                    <button className='btn btn-success btn-circle' style={{ position: 'fixed', right: '70px', bottom: '10px' }} onClick={this.download} >
                        <i className='fa fa-lg fa-print' />
                    </button>
                } */}
            </>,
            backRoute: '/user/tccb',
            onCreate: permission.write ? (e) => e.preventDefault() || this.props.history.push('/user/tccb/qua-trinh/hop-dong-vien-chuc/new') : null
            ,
        });
    }
}

const mapStateToProps = state => ({ system: state.system, qtHopDongVienChuc: state.qtHopDongVienChuc });
const mapActionsToProps = {
    getQtHopDongVienChucAll, getQtHopDongVienChucPage, deleteQtHopDongVienChuc, createQtHopDongVienChuc,
    updateQtHopDongVienChuc, getQtHopDongVienChucGroupPage, getDmDonViAll
};
export default connect(mapStateToProps, mapActionsToProps)(QtHopDongVienChucPage);
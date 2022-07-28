import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { AdminPage, TableCell, renderTable, FormDatePicker } from 'view/component/AdminPage';
import Pagination from 'view/component/Pagination';
import {
    updateQtHopDongLaoDong,
    deleteQtHopDongLaoDong, createQtHopDongLaoDong, getQtHopDongLaoDongGroupPageMa, downloadWord
} from './redux';

class QtHopDongLaoDongGroupPage extends AdminPage {
    state = { filter: {} };

    componentDidMount() {
        T.ready('/user/tccb', () => {
            T.clearSearchBox();
            const route = T.routeMatcher('/user/tccb/qua-trinh/hop-dong-lao-dong/group/:shcc'),
                params = route.parse(window.location.pathname);
            this.shcc = params.shcc;
            this.setState({ filter: { listShcc: params.shcc, listDv: '' } });
            T.onSearch = (searchText) => this.getPage(undefined, undefined, searchText || '');

            T.showSearchBox(() => {
                this.fromYear?.value('');
                this.toYear?.value('');
                this.xuatBanRange.value('');
                setTimeout(() => this.changeAdvancedSearch(), 50);
            });
            this.getPage();
        });
    }

    changeAdvancedSearch = (isInitial = false) => {
        let { pageNumber, pageSize } = this.props && this.props.qtHopDongLaoDong && this.props.qtHopDongLaoDong.pageMa ? this.props.qtHopDongLaoDong.pageMa : { pageNumber: 1, pageSize: 50 };
        const fromYear = this.fromYear?.value() == '' ? null : this.fromYear?.value().getTime();
        const toYear = this.toYear?.value() == '' ? null : this.toYear?.value().getTime();
        const listDv = this.state.filter.listDv;
        const listShcc = this.state.filter.listShcc;
        const pageFilter = isInitial ? null : { listDv, fromYear, toYear, listShcc };
        this.setState({ filter: pageFilter }, () => {
            this.getPage(pageNumber, pageSize, '', (page) => {
                if (isInitial) {
                    const filter = page.filter || {};
                    this.setState({ filter: !$.isEmptyObject(filter) ? filter : pageFilter });
                    this.fromYear?.value(filter.fromYear || '');
                    this.toYear?.value(filter.toYear || '');
                    if (!$.isEmptyObject(filter) && filter && (filter.fromYear || filter.toYear)) this.showAdvanceSearch();
                }
            });
        });
    }

    getPage = (pageN, pageS, pageC, done) => {
        this.props.getQtHopDongLaoDongGroupPageMa(pageN, pageS, pageC, this.state.filter, done);
    }

    showModal = (e) => {
        e.preventDefault();
        this.modal.show();
    }

    delete = (e, item) => {
        T.confirm('Xóa thông tin hợp đồng lao động này', 'Bạn có chắc bạn muốn xóa thông tin hợp đồng lao động này này?', 'warning', true, isConfirm => {
            isConfirm && this.props.deleteQtBaiVietKhoaHocGroupPageMa(item.id, error => {
                if (error) T.notify(error.message ? error.message : 'Xoá thông tin hợp đồng lao động này bị lỗi!', 'danger');
                else T.alert('Xoá thông tin hợp đồng lao động này thành công!', 'success', false, 800);
            });
        });
        e.preventDefault();
    }

    downloadWord = (item) => {
        downloadWord(item.ma, data => {
            T.FileSaver(new Blob([new Uint8Array(data.data)]), item.shcc + '_hopdong.docx');
        });
    }

    download = (e) => {
        e.preventDefault();
        T.download(T.url('/api/tccb/qua-trinh/hop-dong-lao-dong/download-excel'), 'HDLD.xlsx');
    }
    render() {
        const permission = this.getUserPermission('qtHopDongLaoDong', ['read', 'write', 'delete', 'export']);
        let { pageNumber, pageSize, pageTotal, totalItem, pageCondition, list } = this.props.qtHopDongLaoDong && this.props.qtHopDongLaoDong.pageMa ? this.props.qtHopDongLaoDong.pageMa : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, pageCondition: {}, list: [] };
        let table = 'Không có danh sách!';
        if (list && list.length > 0) {
            table = renderTable({
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
                        <TableCell type='text' content={(pageNumber - 1) * pageSize + index + 1} />
                        <TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={(
                            <>
                                <span>{item.hoBenA + ' ' + item.tenBenA}</span><br />
                                <span>Mã thẻ cán bộ: {item.shcc}</span>
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
                                <Link to={'/user/tccb/staff/' + item.shccNguoiKy}>{item.shccNguoiKy}</Link>
                            </>
                        )} />
                        <TableCell type='buttons' content={item} onEdit={`/user/tccb/qua-trinh/hop-dong-lao-dong/${item.ma}`} onDelete={this.delete} permission={permission} >
                            {permission.export && <a href="#" className="btn btn-primary" style={{ width: '45px' }} onClick={e => e.preventDefault() || this.downloadWord(item)}>
                                <i className='fa fa-lg fa-file-word-o' />
                            </a>}
                        </TableCell>
                    </tr>
                )
            });
        }
        return this.renderPage({
            icon: 'fa fa-briefcase',
            title: 'Hợp đồng Lao động cán bộ',
            breadcrumb: [
                <Link key={0} to='/user/tccb'>Tổ chức cán bộ</Link>,
                <Link key={1} to='/user/tccb/qua-trinh/ky-hop-dong'>Hợp đồng Lao dộng</Link>,
                'Hợp đồng Lao động cán bộ'
            ],
            advanceSearch: <>
                <div className='row'>
                    <FormDatePicker type='date-mask' ref={e => this.fromYear = e} className='col-12 col-md-3' label='Từ thời gian' onChange={() => this.changeAdvancedSearch()} />
                    <FormDatePicker type='date-mask' ref={e => this.toYear = e} className='col-12 col-md-3' label='Đến thời gian' onChange={() => this.changeAdvancedSearch()} />
                </div>
            </>,
            content: <>
                <div className='tile'>
                    {table}
                </div>
                <Pagination style={{ marginLeft: '70px' }}
                    {...{ pageNumber, pageSize, pageTotal, totalItem, pageCondition }}
                    getPage={this.getPage} />
            </>,
            backRoute: '/user/tccb/qua-trinh/hop-dong-lao-dong',
            onCreate: permission.write ? (e) => e.preventDefault() || this.props.history.push('/user/tccb/qua-trinh/hop-dong-lao-dong/new') : null
            ,
        });
    }
}

const mapStateToProps = state => ({ system: state.system, qtHopDongLaoDong: state.tccb.qtHopDongLaoDong });
const mapActionsToProps = {
    deleteQtHopDongLaoDong, createQtHopDongLaoDong,
    updateQtHopDongLaoDong, getQtHopDongLaoDongGroupPageMa, downloadWord
};
export default connect(mapStateToProps, mapActionsToProps)(QtHopDongLaoDongGroupPage);
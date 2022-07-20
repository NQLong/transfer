import React from 'react';
import { connect } from 'react-redux';
import { AdminPage, FormDatePicker, FormSelect, renderTable, TableCell } from 'view/component/AdminPage';
import Pagination from 'view/component/Pagination';
import { getTongGiaoDichPage } from './redux';

/**
 * TODO
 * filter time
 * export psc
 * filter hoc ky
 * filter nam hoc
 * sort theo thoi gian
 * 
 */

const yearDatas = () => {
    return Array.from({ length: 15 }, (_, i) => i + new Date().getFullYear() - 10);
};

const termDatas = [{ id: 1, text: 'HK1' }, { id: 2, text: 'HK2' }, { id: 3, text: 'HK3' }];

class DanhSachGiaoDich extends AdminPage {
    state = {
        filter: {},
    }
    componentDidMount() {
        T.ready('/user/finance/danh-sach-giao-dich', () => {
            T.onSearch = (searchText) => this.getPage(undefined, undefined, searchText || '', page => this.setFilter(page));
            T.showSearchBox(() => {
                this.tuNgay?.value('');
                this.denNgay?.value('');
            });
            this.changeAdvancedSearch(true);
        });
    }

    setFilter = (page, isInitial = false) => {
        const { settings: { namHoc, hocKy } } = page;
        if (isInitial) {
            this.year.value(namHoc);
            this.term.value(hocKy);
        } else {
            this.year.value(namHoc);
            this.term.value(hocKy);
        }
    }

    changeAdvancedSearch = (isInitial = false, isReset = false) => {
        let { pageNumber, pageSize, pageCondition } = this.props && this.props.tcGiaoDich && this.props.tcGiaoDich.page ? this.props.tcGiaoDich.page : { pageNumber: 1, pageSize: 50, pageCondition: '' };
        this.setState({}, () => this.getPage(pageNumber, pageSize, pageCondition));
        if (pageCondition && (typeof pageCondition == 'string')) {
            T.setTextSearchBox(pageCondition);
        }
        let
            namHoc = this.year.value(),
            hocKy = this.term.value(),
            { tuNgay, denNgay } = this.getTimeFilter();

        const pageFilter = (isInitial || isReset) ? { namHoc, hocKy } : { namHoc, hocKy, tuNgay, denNgay };
        this.setState({ filter: pageFilter }, () => {
            this.getPage(pageNumber, pageSize, pageCondition, (page) => {
                this.setFilter(page, isInitial);
            });
        });
    }

    getPage = (pageN, pageS, pageC, done) => {
        this.props.getTongGiaoDichPage(pageN, pageS, pageC, this.state.filter, done);
    }

    onDownloadPsc = (e) => {
        e.preventDefault();
        T.download(`/api/finance/danh-sach-giao-dich/download-psc?filter=${T.stringify({ ...this.state.filter, ...this.getTimeFilter() })}`, 'HOC_PHI.xlsx');
    }

    onClearSearch = (e) => {
        e.preventDefault();
        this.tuNgay.value('');
        this.denNgay.value('');
        this.changeAdvancedSearch();
    }

    getTimeFilter = () => {
        let tuNgay = this.tuNgay.value() || null,
            denNgay = this.denNgay.value() || null;
        if (tuNgay) {
            tuNgay.setHours(0, 0, 0, 0);
            tuNgay = tuNgay.getTime();
        }
        if (denNgay) {
            denNgay.setHours(23, 59, 59, 999);
            denNgay = denNgay.getTime();
        }
        return { tuNgay, denNgay };
    }

    render() {
        let { pageNumber, pageSize, pageTotal, totalItem, pageCondition, list } = this.props.tcGiaoDich && this.props.tcGiaoDich.page ? this.props.tcGiaoDich.page : {
            pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, list: null
        };
        let table = renderTable({
            getDataSource: () => list,
            stickyHead: true,
            header: 'thead-light',
            emptyTable: 'Chưa có dữ liệu giao dịch học kỳ hiện tại',
            renderHead: () => (<tr>
                <th style={{ width: 'auto', textAlign: 'right' }}>#</th>
                <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Học kỳ</th>
                <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>MSSV</th>
                <th style={{ width: '100%', whiteSpace: 'nowrap' }}>Họ tên</th>
                <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Khoản đóng (VNĐ)</th>
                <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Ngân hàng</th>
                <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Thời gian đóng</th>
                <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Khoa</th>
                <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Ngành</th>
                <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Bậc</th>
                <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Hệ</th>
                <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Trạng thái</th>
            </tr>),
            renderRow: (item, index) => (<tr key={index}>
                <TableCell style={{ textAlign: 'right' }} content={item.R} />
                <TableCell style={{ whiteSpace: 'nowrap' }} content={`${item.namHoc} - HK0${item.hocKy}`} />
                <TableCell style={{ whiteSpace: 'nowrap' }} content={item.mssv} />
                <TableCell style={{ whiteSpace: 'nowrap' }} content={`${item.ho || ''} ${item.ten || ''}`.toUpperCase().trim()} />
                <TableCell style={{ whiteSpace: 'nowrap' }} type='number' content={item.khoanDong} />
                <TableCell style={{ whiteSpace: 'nowrap' }} content={item.nganHang} />
                <TableCell style={{ whiteSpace: 'nowrap' }} content={item.ngayDong ? T.dateToText(new Date(parseInt(item.ngayDong)), 'HH:MM, dd/mm/yyyy') : ''} />
                <TableCell style={{ whiteSpace: 'nowrap' }} content={item.tenKhoa} />
                <TableCell style={{ whiteSpace: 'nowrap' }} content={`${item.maNganh}: ${item.tenNganh}`} />
                <TableCell style={{ whiteSpace: 'nowrap' }} content={item.tenBacDaoTao} />
                <TableCell style={{ whiteSpace: 'nowrap' }} content={item.tenLoaiHinhDaoTao} />
                <TableCell style={{ whiteSpace: 'nowrap' }} content={
                    item.trangThai ? <div style={{ color: 'green' }}><i className='fa fa-lg fa-check-square-o' /> Thành công</div> : <div style={{ color: 'red' }}><i className='fa fa-lg fa-times' /> Thất bại</div>
                } />
            </tr>),

        });
        return this.renderPage({
            title: 'Danh sách giao dịch',
            icon: 'fa fa-money',
            header: <>
                <FormSelect ref={e => this.year = e} style={{ width: '100px', marginBottom: '0', marginRight: 10 }} placeholder='Năm học' data={yearDatas()} onChange={() => this.changeAdvancedSearch()} />
                <FormSelect ref={e => this.term = e} style={{ width: '100px', marginBottom: '0' }} placeholder='Học kỳ' data={termDatas} onChange={() => this.changeAdvancedSearch()} />
            </>,
            advanceSearch: <div className='row'>
                <FormDatePicker type='date-mask' className='col-md-6' ref={e => this.tuNgay = e} label='Từ ngày' allowClear />
                <FormDatePicker type='date-mask' className='col-md-6' ref={e => this.denNgay = e} label='Đến ngày' allowClear />
                <div className='col-md-12 d-flex justify-content-end' style={{ gap: 10 }}>
                    <button className='btn btn-danger' onClick={this.onClearSearch}><i className='fa fa-lg fa-times' />Xóa tìm kiếm</button>
                    <button className='btn btn-success' onClick={e => e.preventDefault() || this.changeAdvancedSearch()}><i className='fa fa-lg fa-search' />Tìm kiếm</button>
                </div>
            </div>,
            breadcrumb: ['Danh sách giao dịch'],
            content:
                <div className='row'>
                    <div className='col-md-12'>
                        <div className='tile'>
                            {table}
                            <Pagination {...{ pageNumber, pageSize, pageTotal, totalItem, pageCondition }}
                                getPage={this.props.getTcHocPhiPage} />
                        </div>
                    </div>
                </div>,
            buttons: [{ className: 'btn-danger', icon: 'fa-table', onClick: this.onDownloadPsc }]
        });
    }
}

const mapStateToProps = state => ({ system: state.system, tcGiaoDich: state.finance.tcGiaoDich });
const mapActionsToProps = { getTongGiaoDichPage };
export default connect(mapStateToProps, mapActionsToProps)(DanhSachGiaoDich);
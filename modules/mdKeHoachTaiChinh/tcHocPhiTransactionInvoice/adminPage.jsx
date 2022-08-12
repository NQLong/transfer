import React from 'react';
import { connect } from 'react-redux';
import { AdminModal, AdminPage, FormSelect, FormTextBox, renderTable, TableCell } from 'view/component/AdminPage';
import Pagination from 'view/component/Pagination';
import T from 'view/js/common';
import { getInvoicePage, sendInvoiceMail, cancelInvoice } from './redux';
import { SelectAdapter_DmSvBacDaoTao } from 'modules/mdDanhMuc/dmSvBacDaoTao/redux';
import { SelectAdapter_DmSvLoaiHinhDaoTao } from 'modules/mdDanhMuc/dmSvLoaiHinhDaoTao/redux';
import { SelectAdapter_DmDonViFaculty_V2 } from 'modules/mdDanhMuc/dmDonVi/redux';
import { SelectAdapter_DtNganhDaoTao } from 'modules/mdDaoTao/dtNganhDaoTao/redux';
import { Tooltip } from '@mui/material';


const yearDatas = () => {
    return Array.from({ length: 15 }, (_, i) => i + new Date().getFullYear() - 10);
};

const termDatas = [{ id: 1, text: 'HK1' }, { id: 2, text: 'HK2' }, { id: 3, text: 'HK3' }];

class CancelModal extends AdminModal {

    state = { isLoading: false, id: null }

    onShow = (id) => {
        this.setState({ isLoading: false, id });
        this.lyDoHuy.value('');
    }

    onSubmit = () => {
        const lyDo = this.lyDoHuy.value();
        if (!lyDo) {
            T.notify('Vui lòng nhập lý do hủy hóa đơn', 'danger');
            this.lyDoHuy.focus();
        } else {
            this.setState({ isLoading: true }, () => {
                this.props.cancel(this.state.id, lyDo, () => {
                    this.hide();
                });
            }, () => this.setState({ isLoading: false }));
        }
    }

    render = () => {
        return this.renderModal({
            title: 'Hủy hóa đơn',
            size: 'large',
            body: <div className='rows'>
                <FormTextBox className='col-md-12' label='Lý do hủy' required ref={e => this.lyDoHuy = e} />
            </div>,
            isLoading: this.state.isLoading,
        });
    }
}


class DanhSachHoaDon extends AdminPage {
    state = {
        filter: {},
    }

    componentDidMount() {
        T.ready('/user/finance/invoice', () => {
            T.onSearch = (searchText) => this.getPage(undefined, undefined, searchText || '', page => this.setFilter(page));
            T.showSearchBox(true);
        });
        this.changeAdvancedSearch(true);
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
        if (pageCondition && (typeof pageCondition == 'string')) {
            T.setTextSearchBox(pageCondition);
        }
        let
            namHoc = this.year.value(),
            hocKy = this.term.value(),
            listBacDaoTao = this.bacDaoTao.value().toString(),
            listLoaiHinhDaoTao = this.loaiHinhDaoTao.value().toString(),
            listNganh = this.nganh.value().toString(),
            listKhoa = this.khoa.value().toString(),
            nganHang = this.nganHang?.value().toString();

        const pageFilter = (isInitial || isReset) ? { namHoc, hocKy } : { namHoc, hocKy, listBacDaoTao, listLoaiHinhDaoTao, listNganh, listKhoa, nganHang };
        this.setState({ filter: pageFilter }, () => {
            this.getPage(pageNumber, pageSize, pageCondition, (page) => {
                this.setFilter(page, isInitial);
            });
        });
    }

    getPage = (pageN, pageS, pageC, done) => {
        this.props.getInvoicePage(pageN, pageS, pageC, this.state.filter, done);
    }

    onClearSearch = (e) => {
        e.preventDefault();
        ['tuNgay', 'denNgay', 'bacDaoTao', 'loaiHinhDaoTao', 'khoa', 'nganh', 'nganHang'].forEach(key => this[key]?.value(''));
        this.changeAdvancedSearch();
    }

    onSendMail = (e, item) => {
        e.preventDefault();
        this.props.sendInvoiceMail(item.id);
    }

    onCancelInvoicie = (e, item) => {
        e.preventDefault();
        this.cancelModal.show(item.id);
    }

    render() {
        let { pageNumber, pageSize, pageTotal, totalItem, pageCondition, list } = this.props.tcInvoice && this.props.tcInvoice.page ? this.props.tcInvoice.page : {
            pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, list: null
        };
        const permission = this.getUserPermission('tcInvoice', ['export']);
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
                <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Số hóa đơn</th>
                <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Khoa</th>
                <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Ngành</th>
                <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Bậc</th>
                <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Hệ</th>
                <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Đã hủy</th>
                <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Thao tác</th>
            </tr>),
            renderRow: (item, index) => (<tr key={index}>
                <TableCell style={{ textAlign: 'right' }} content={item.R} />
                <TableCell style={{ whiteSpace: 'nowrap' }} content={`${item.namHoc} - HK0${item.hocKy}`} />
                <TableCell style={{ whiteSpace: 'nowrap' }} content={item.mssv} />
                <TableCell style={{ whiteSpace: 'nowrap' }} content={`${item.ho || ''} ${item.ten || ''}`.toUpperCase().trim()} />
                <TableCell style={{ whiteSpace: 'nowrap' }} content={item.invoiceNumber} />
                <TableCell style={{ whiteSpace: 'nowrap' }} content={item.tenKhoa} />
                <TableCell style={{ whiteSpace: 'nowrap' }} content={`${item.maNganh}: ${item.tenNganh}`} />
                <TableCell style={{ whiteSpace: 'nowrap' }} content={item.tenBacDaoTao} />
                <TableCell style={{ whiteSpace: 'nowrap' }} content={item.tenLoaiHinhDaoTao} />
                <TableCell style={{ whiteSpace: 'nowrap' }} type='checkbox' content={!item.lyDoHuy?.length} />
                <TableCell style={{ whiteSpace: 'nowrap' }} type='buttons' >
                    <Tooltip title='Xem hóa đơn' arrow>
                        <a className='btn btn-info' target='_blank' rel='noopener noreferrer' href={`/api/finance/invoice/view/${item.id}`}>
                            <i className='fa fa-lg fa-eye' />
                        </a>
                    </Tooltip>
                    <Tooltip title='Mail hóa đơn' arrow>
                        <button className='btn btn-success' onClick={(e) => this.onSendMail(e, item)} >
                            <i className='fa fa-lg fa-envelope' />
                        </button>
                    </Tooltip>
                    {!item.lyDoHuy && <Tooltip title='Hủy hóa đơn' arrow>
                        <button className='btn btn-danger' onClick={(e) => this.onCancelInvoicie(e, item)} >
                            <i className='fa fa-lg fa-times' />
                        </button>
                    </Tooltip>}
                </TableCell>
            </tr>),
        });
        return this.renderPage({
            title: 'Danh sách hóa đơn',
            icon: 'fa fa-money',
            header: <>
                <FormSelect ref={e => this.year = e} style={{ width: '100px', marginBottom: '0', marginRight: 10 }} placeholder='Năm học' data={yearDatas()} onChange={() => this.changeAdvancedSearch()} />
                <FormSelect ref={e => this.term = e} style={{ width: '100px', marginBottom: '0' }} placeholder='Học kỳ' data={termDatas} onChange={() => this.changeAdvancedSearch()} />
            </>,
            advanceSearch: <div className='row'>
                <FormSelect ref={e => this.nganHang = e} label='Ngân hàng' data={this.props.tcGiaoDich?.nganHang || []} className='col-md-4' allowClear multiple />
                <FormSelect ref={e => this.bacDaoTao = e} label='Bậc đào tạo' data={SelectAdapter_DmSvBacDaoTao} className='col-md-4' allowClear multiple />
                <FormSelect ref={e => this.loaiHinhDaoTao = e} label='Hệ đào tạo' data={SelectAdapter_DmSvLoaiHinhDaoTao} className='col-md-4' allowClear multiple />
                <FormSelect ref={e => this.khoa = e} label='Khoa' data={SelectAdapter_DmDonViFaculty_V2} className='col-md-6' allowClear multiple />
                <FormSelect ref={e => this.nganh = e} label='Ngành' data={SelectAdapter_DtNganhDaoTao} className='col-md-6' allowClear multiple />
                {/* <FormDatePicker className='col-md-6' ref={e => this.tuNgay = e} label='Từ ngày' allowClear />
                <FormDatePicker className='col-md-6' ref={e => this.denNgay = e} label='Đến ngày' allowClear /> */}
                <div className='col-md-12 d-flex justify-content-end' style={{ gap: 10 }}>
                    <button className='btn btn-danger' onClick={this.onClearSearch}><i className='fa fa-lg fa-times' />Xóa tìm kiếm</button>
                    <button className='btn btn-success' onClick={e => e.preventDefault() || this.changeAdvancedSearch()}><i className='fa fa-lg fa-search' />Tìm kiếm</button>
                </div>
            </div>,
            breadcrumb: ['Danh sách hóa đơn'],
            content: (<div className='row'>
                <div className='col-md-12'>
                    <div className='tile'>
                        {table}
                        <CancelModal ref={e => this.cancelModal = e} cancel={this.props.cancelInvoice} />
                        <Pagination {...{ pageNumber, pageSize, pageTotal, totalItem, pageCondition }}
                            getPage={this.getPage} />
                    </div>
                </div>
            </div>),
            onExport: permission.export ? (e) => e.preventDefault() || T.download(`/api/finance/invoice/download-excel?filter=${T.stringify({ ...this.state.filter, ...{ namHoc: this.year.value(), hocKy: this.term.value() } })}`, 'DANHSACHGIAODICH.xlsx') : null,
        });
    }
}

const mapStateToProps = state => ({ system: state.system, tcInvoice: state.finance.tcInvoice });
const mapActionsToProps = { getInvoicePage, sendInvoiceMail, cancelInvoice };
export default connect(mapStateToProps, mapActionsToProps)(DanhSachHoaDon);

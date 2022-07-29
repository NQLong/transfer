import { Tooltip } from '@mui/material';
import React from 'react';
import { connect } from 'react-redux';
import { AdminPage, FormSelect, renderTable, TableCell, FormDatePicker } from 'view/component/AdminPage';
import Pagination from 'view/component/Pagination';
import T from 'view/js/common';
import { getTcHocPhiPage, updateHocPhi, getHocPhi, createMultipleHocPhi } from './redux';
import CountUp from 'view/js/countUp';
import { Link } from 'react-router-dom';
import { SelectAdapter_DmSvBacDaoTao } from 'modules/mdDanhMuc/dmSvBacDaoTao/redux';
import { SelectAdapter_DmSvLoaiHinhDaoTao } from 'modules/mdDanhMuc/dmSvLoaiHinhDaoTao/redux';
import { SelectAdapter_DmDonViFaculty_V2 } from 'modules/mdDanhMuc/dmDonVi/redux';
import { SelectAdapter_DtNganhDaoTao } from 'modules/mdDaoTao/dtNganhDaoTao/redux';
import { EditModal } from './modal/EditModal';
import Detail from './modal/DetailModal';

export class NumberIcon extends React.Component {
    componentDidMount() {
        setTimeout(() => {
            const endValue = this.props.value ? parseInt(this.props.value) : 0;
            new CountUp(this.valueElement, 0, endValue, 0, 2, { separator: '.', decimal: ',' }).start();
        }, 100);
    }

    componentDidUpdate(prevProps) {
        if (prevProps.value !== this.props.value)
            setTimeout(() => {
                const endValue = this.props.value ? parseInt(this.props.value) : 0;
                new CountUp(this.valueElement, prevProps.value, endValue, 0, 2, { separator: '.', decimal: ',' }).start();
            }, 100);
    }

    render() {
        let isShow = true;
        if (this.props.isShowValue != undefined) {
            if (this.props.isShowValue == false) isShow = false;
        }
        const content = (
            <div className={'widget-small coloured-icon ' + this.props.type}>
                <i className={'icon fa fa-3x ' + this.props.icon} />
                <div className='info'>
                    <h4>
                        {this.props.title}
                    </h4>
                    {isShow && <p style={{ fontWeight: 'bold' }} ref={e => this.valueElement = e} />}
                </div>
            </div>
        );
        return this.props.link ? <Link to={this.props.link} style={{ textDecoration: 'none' }}>{content}</Link> : content;
    }
}

const yearDatas = () => {
    return Array.from({ length: 15 }, (_, i) => i + new Date().getFullYear() - 10);
};

const termDatas = [{ id: 1, text: 'HK1' }, { id: 2, text: 'HK2' }, { id: 3, text: 'HK3' }];
class TcHocPhiAdminPage extends AdminPage {
    state = {
        filter: {},
        totalCurrent: 0,
        totalPaid: 0
    }
    componentDidMount() {
        T.ready('/user/finance/hoc-phi', () => {
            T.onSearch = (searchText) => this.getPage(undefined, undefined, searchText || '');
            T.showSearchBox(() => {
                let filterCookie = T.getCookiePage('pageTcHocPhi', 'F'),
                    { daDong = '', listBacDaoTao = '', listLoaiHinhDaoTao = '', listNganh = '', listKhoa = '' } = filterCookie;
                this.daDong.value(daDong);
                this.bacDaoTao.value(listBacDaoTao);
                this.loaiHinhDaoTao.value(listLoaiHinhDaoTao);
                this.nganh.value(listNganh);
                this.khoa.value(listKhoa);
                setTimeout(() => this.changeAdvancedSearch(), 50);
            });
            this.changeAdvancedSearch(true);
        });
    }

    changeAdvancedSearch = (isInitial = false, isReset = false) => {
        let { pageNumber, pageSize, pageCondition } = this.props && this.props.tcHocPhi && this.props.tcHocPhi.page ? this.props.tcHocPhi.page : { pageNumber: 1, pageSize: 50, pageCondition: '' };
        // if (pageCondition && (typeof pageCondition == 'string')) {
        //     T.setTextSearchBox(pageCondition);
        // }
        const daDong = this.daDong.value(),
            listBacDaoTao = this.bacDaoTao.value().toString(),
            listLoaiHinhDaoTao = this.loaiHinhDaoTao.value().toString(),
            listNganh = this.nganh.value().toString(),
            listKhoa = this.khoa.value().toString(),
            namHoc = this.year.value(),
            hocKy = this.term.value(),
            { tuNgay, denNgay } = this.getTimeFilter();
        const pageFilter = (isInitial || isReset) ? {} : { daDong, listBacDaoTao, listLoaiHinhDaoTao, listNganh, listKhoa, namHoc, hocKy, tuNgay, denNgay };
        this.setState({ filter: pageFilter }, () => {
            this.getPage(pageNumber, pageSize, pageCondition, (page) => {
                if (isInitial) {
                    const { settings: { namHoc, hocKy, totalPaid, totalCurrent } } = page;
                    this.year.value(namHoc);
                    this.term.value(hocKy);
                    this.setState({ totalCurrent, totalPaid });
                    const filter = page.filter || {};
                    const filterCookie = T.getCookiePage('pageTcHocPhi', 'F');
                    let { daDong, listBacDaoTao, listLoaiHinhDaoTao, listNganh, listKhoa } = filter;
                    this.setState({ filter: !$.isEmptyObject(filter) ? filter : pageFilter });

                    this.daDong.value(daDong || filterCookie.daDong || '');
                    this.bacDaoTao.value(listBacDaoTao || filterCookie.listBacDaoTao || '');
                    this.loaiHinhDaoTao.value(listLoaiHinhDaoTao || filterCookie.listLoaiHinhDaoTao || '');
                    this.nganh.value(listNganh || filterCookie.listNganh || '');
                    this.khoa.value(listKhoa || filterCookie.listKhoa || '');
                } else if (isReset) {
                    ['daDong', 'bacDaoTao', 'loaiHinhDaoTao', 'nganh', 'khoa'].forEach(e => this[e].value(''));
                    this.hideAdvanceSearch();
                }
            });
        });
    }

    sendEmailNhacNho = () => {

    }

    getPage = (pageN, pageS, pageC, done) => {
        this.props.getTcHocPhiPage(pageN, pageS, pageC, this.state.filter, done);
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

    onDownloadPsc = (e) => {
        e.preventDefault();
        T.download(`/api/finance/hoc-phi/download-psc?filter=${T.stringify(this.state.filter)}`, 'HOC_PHI.xlsx');
    }

    render() {
        let permission = this.getUserPermission('tcHocPhi', ['read', 'write', 'delete', 'manage', 'export']);
        let { pageNumber, pageSize, pageTotal, totalItem, pageCondition, list } = this.props.tcHocPhi && this.props.tcHocPhi.page ? this.props.tcHocPhi.page : {
            pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, list: null
        };
        let table = renderTable({
            getDataSource: () => list,
            stickyHead: true,
            header: 'thead-light',
            emptyTable: 'Chưa có dữ liệu học phí học kỳ hiện tại',
            renderHead: () => (<tr>
                <th style={{ width: 'auto', textAlign: 'right' }}>#</th>
                <th style={{ width: 'auto', textAlign: 'center' }}>Học kỳ</th>
                <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>MSSV</th>
                <th style={{ width: '100%', whiteSpace: 'nowrap' }}>Họ và tên</th>
                <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'right' }}>Điện thoại</th>
                <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Email cá nhân</th>
                <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Học phí (VNĐ)</th>
                <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Công nợ (VNĐ)</th>
                <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Thời gian đóng</th>
                <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Khoa/Bộ môn</th>
                <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Ngành</th>
                <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Bậc</th>
                <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Hệ</th>
                <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Thao tác</th>
            </tr>),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell style={{ textAlign: 'right' }} content={(pageNumber - 1) * pageSize + index + 1} />
                    <TableCell style={{ textAlign: 'center', whiteSpace: 'nowrap' }} content={`${item.namHoc} - HK${item.hocKy}`} />
                    <TableCell type='link' style={{ whiteSpace: 'nowrap' }} content={item.mssv} url={`/user/finance/hoc-phi/${item.mssv}`} />
                    <TableCell type='link' style={{ whiteSpace: 'nowrap' }} content={item.hoTenSinhVien} url={`/user/finance/hoc-phi/${item.mssv}`} />
                    <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'right' }} cotent={item.soDienThoai} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} cotent={item.emailCaNhan} />
                    <TableCell type='number' style={{ whiteSpace: 'nowrap', textAlign: 'right' }} content={item.hocPhi} />
                    <TableCell type='number' style={{ whiteSpace: 'nowrap', textAlign: 'right' }} content={item.congNo} />
                    <TableCell type={item.lastTransaction ? 'date' : 'text'} dateFormat='HH:MM:ss dd/mm/yyyy' style={{ whiteSpace: 'nowrap' }} content={item.lastTransaction ? Number(item.lastTransaction) : ''} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.tenKhoa} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={`${item.maNganh}: ${item.tenNganh}`} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.tenBacDaoTao} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.tenLoaiHinhDaoTao} />

                    <TableCell type='buttons' style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={item} permission={permission}
                        onEdit={() => this.modal.show(item)}>
                        <Tooltip title='Chi tiết' arrow>
                            <button className='btn btn-success' onClick={e => e.preventDefault() || this.detailModal.show(item)}>
                                <i className='fa fa-lg fa-eye' />
                            </button>
                        </Tooltip>
                    </TableCell>
                </tr>
            ),
        });
        return this.renderPage({
            title: 'Học phí',
            icon: 'fa fa-money',
            header: <><FormSelect ref={e => this.year = e} style={{ width: '100px', marginBottom: '0', marginRight: 10 }} placeholder='Năm học' data={yearDatas()} onChange={
                () => this.changeAdvancedSearch()
            } /><FormSelect ref={e => this.term = e} style={{ width: '100px', marginBottom: '0' }} placeholder='Học kỳ' data={termDatas} onChange={
                () => this.changeAdvancedSearch()
            } /></>,
            advanceSearch: <div className='row'>
                <FormSelect ref={e => this.daDong = e} label='Tình trạng' data={[{ id: 0, text: 'Chưa đóng' }, { id: 1, text: 'Đã đóng' }]} className='col-md-4' allowClear />
                <FormSelect ref={e => this.bacDaoTao = e} label='Bậc đào tạo' data={SelectAdapter_DmSvBacDaoTao} className='col-md-4' allowClear multiple />
                <FormSelect ref={e => this.loaiHinhDaoTao = e} label='Hệ đào tạo' data={SelectAdapter_DmSvLoaiHinhDaoTao} className='col-md-4' allowClear multiple />
                <FormSelect ref={e => this.khoa = e} label='Khoa' data={SelectAdapter_DmDonViFaculty_V2} className='col-md-6' allowClear multiple />
                <FormSelect ref={e => this.nganh = e} label='Ngành' data={SelectAdapter_DtNganhDaoTao} className='col-md-6' allowClear multiple />
                <FormDatePicker className='col-md-6' ref={e => this.tuNgay = e} label='Từ ngày' allowClear />
                <FormDatePicker className='col-md-6' ref={e => this.denNgay = e} label='Đến ngày' allowClear />
                <div className='col-md-12 d-flex justify-content-end' style={{ gap: 10 }}>
                    <span>Tìm thấy <b>{totalItem}</b> kết quả</span>
                    <button className='btn btn-danger' onClick={e => e.preventDefault() || this.changeAdvancedSearch(false, true)}><i className='fa fa-lg fa-times' />Xóa tìm kiếm</button>
                    <button className='btn btn-success' onClick={e => e.preventDefault() || this.changeAdvancedSearch()}><i className='fa fa-lg fa-search' />Tìm kiếm</button>
                </div>
            </div>,
            breadcrumb: ['Học phí'],
            content:
                <div className='row'>
                    <div className='col-md-6'>
                        <NumberIcon type='primary' icon='fa-users' title='Tổng số sinh viên đóng học phí' value={this.state.totalCurrent || 0} />
                    </div>
                    <div className='col-md-6'>
                        <NumberIcon type='info' icon='fa-users' title='Số sinh viên đã đóng đủ' value={this.state.totalPaid || 0} />
                    </div>
                    <div className='col-md-12'>
                        <div className='tile'>
                            {table}
                            <Pagination {...{ pageNumber, pageSize, pageTotal, totalItem, pageCondition }}
                                getPage={this.getPage} />
                            <EditModal ref={e => this.modal = e} permission={permission} update={this.props.updateHocPhi} readOnly={!permission.readOnly} />
                            <Detail ref={e => this.detailModal = e} getHocPhi={this.props.getHocPhi} create={this.props.createMultipleHocPhi} readOnly={!permission.write} />
                        </div>
                    </div>
                </div>,
            onImport: permission.write ? (e) => e.preventDefault() || this.props.history.push('/user/finance/import-hoc-phi') : null,
            onExport: permission.export ? (e) => e.preventDefault() || T.download(`/api/finance/hoc-phi/download-excel?filter=${T.stringify(this.state.filter)}`, 'HOC_PHI.xlsx') : null,
            buttons: [
                permission.manage && { type: 'primary', icon: 'fa-table', tooltip: 'Thống kê', onClick: e => e.preventDefault() || (permission.manage && this.props.history.push('/user/finance/statistic')) },
                // { type: 'danger', icon: 'fa-reply-all', tooltip: 'Gửi mail nhắc nhở', onClick: this.sendEmailNhacNho }
            ]
        });
    }
}

const mapStateToProps = state => ({ system: state.system, tcHocPhi: state.finance.tcHocPhi });
const mapActionsToProps = {
    getTcHocPhiPage, updateHocPhi, getHocPhi, createMultipleHocPhi
};
export default connect(mapStateToProps, mapActionsToProps)(TcHocPhiAdminPage);
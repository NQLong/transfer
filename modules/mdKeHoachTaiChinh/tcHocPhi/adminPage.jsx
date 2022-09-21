import { Tooltip } from '@mui/material';
import { SelectAdapter_DmDonViFaculty_V2 } from 'modules/mdDanhMuc/dmDonVi/redux';
import { SelectAdapter_DmSvBacDaoTao } from 'modules/mdDanhMuc/dmSvBacDaoTao/redux';
import { SelectAdapter_DmSvLoaiHinhDaoTao } from 'modules/mdDanhMuc/dmSvLoaiHinhDaoTao/redux';
import { SelectAdapter_DtNganhDaoTao } from 'modules/mdDaoTao/dtNganhDaoTao/redux';
import { SelectAdapter_FwNamTuyenSinh } from 'modules/mdSinhVien/fwStudents/redux';
import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { AdminPage, FormDatePicker, FormSelect, renderTable, TableCell, AdminModal, FormTextBox } from 'view/component/AdminPage';
import Pagination from 'view/component/Pagination';
import T from 'view/js/common';
import CountUp from 'view/js/countUp';
import Detail from './modal/DetailModal';
import { EditModal } from './modal/EditModal';
import { createInvoice, createInvoiceList, createMultipleHocPhi, getHocPhi, getTcHocPhiPage, updateHocPhi, getPendingListInvoiceLength } from './redux';
import { getMssvBaoHiemYTe, createMssvBaoHiemYTe, createSvBaoHiemYTe } from 'modules/mdSinhVien/svBaoHiemYTe/redux';
import TachMssvModal from './tachMssvModal';
import { AdminBhytModal } from './adminBHYTpage';
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

class InvoiceModal extends AdminModal {
    state = { isSubmitting: false }
    onSubmit = () => {
        const data = {
            ...getTimeFilter(this.tuNgay.value() || null, this.denNgay.value() || null),
            namHoc: this.namHoc.value(),
            hocKy: this.hocKy.value(),
        };
        if (!data.namHoc) {
            T.notify('Vui lòng chọn năm học', 'danger');
            this.namHoc.focus();
        }
        else if (!data.hocKy) {
            T.notify('Vui lòng chọn học kỳ', 'danger');
            this.hocKy.focus();
        } else {
            this.setState({ isSubmitting: true }, () => {
                this.props.onCreate(data, () => {
                    this.setState({ isSubmitting: false });
                });
            });
        }
    }

    onShow = (data) => {
        this.tuNgay.value(data.tuNgay || '');
        this.namHoc.value(data.namHoc || '');
        this.denNgay.value(data.denNgay || '');
        this.hocKy.value(data.hocKy || '');
        this.onChangeValue();
    }

    onChangeValue = () => {
        const data = {
            ...getTimeFilter(this.tuNgay.value() || null, this.denNgay.value() || null),
            namHoc: this.namHoc.value(),
            hocKy: this.hocKy.value(),
        };
        if (data.namHoc && data.hocKy) {
            this.props.getPendingListInvoiceLength(data, (invoicesLength) => {
                this.setState({ invoicesLength }, () => {
                    this.invoicesLength?.value(invoicesLength.toString());
                });
            });
        }
    }

    render = () => {
        return this.renderModal({
            title: 'Xuất hóa đơn',
            size: 'large',
            isLoading: this.state.isSubmitting,
            body: <div className='row'>
                <FormSelect disabled={this.state.isSubmitting} className='col-md-6' ref={e => this.namHoc = e} data={yearDatas()} label='Năm học' onChange={this.onChangeValue} />
                <FormSelect disabled={this.state.isSubmitting} className='col-md-6' ref={e => this.hocKy = e} data={termDatas} label='Học kỳ' onChange={this.onChangeValue} />
                <FormDatePicker disabled={this.state.isSubmitting} className='col-md-6' ref={e => this.tuNgay = e} label='Từ ngày' onChange={this.onChangeValue} />
                <FormDatePicker disabled={this.state.isSubmitting} className='col-md-6' ref={e => this.denNgay = e} label='Đến ngày' onChange={this.onChangeValue} />
                <FormTextBox readOnly className='col-md-12' style={Number.isInteger(this.state.invoicesLength) ? {} : { display: 'none' }} label='Số hóa đơn sẽ được tạo' ref={e => this.invoicesLength = e} />
            </div>
        });
    }
}

class InvoiceResultModal extends AdminModal {
    onShow = (data) => {
        this.tongHoaDon.value(data.totalInvoice.toString());
        this.thanhCong.value(`${data.success}/${data.totalInvoice}` || '');
    }

    render = () => {
        return this.renderModal({
            title: 'Kết quả xuất hóa đơn',
            size: 'large',
            body: <div className='row'>
                <FormTextBox readOnly ref={e => this.tongHoaDon = e} className='col-md-12' label='Tổng số hóa đơn' />
                <FormTextBox readOnly ref={e => this.thanhCong = e} className='col-md-12' label='Hóa đơn tạo thành công' />
            </div>
        });
    }
}

const getTimeFilter = (tuNgay, denNgay) => {
    if (tuNgay) {
        tuNgay.setHours(0, 0, 0, 0);
        tuNgay = tuNgay.getTime();
    }
    if (denNgay) {
        denNgay.setHours(23, 59, 59, 999);
        denNgay = denNgay.getTime();
    }
    return { tuNgay, denNgay };
};

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
            namTuyenSinh = this.namTuyenSinh.value(),
            { tuNgay, denNgay } = getTimeFilter(this.tuNgay.value() || null, this.denNgay.value() || null);
        const pageFilter = (isInitial || isReset) ? {} : { namTuyenSinh, daDong, listBacDaoTao, listLoaiHinhDaoTao, listNganh, listKhoa, namHoc, hocKy, tuNgay, denNgay };
        this.setState({ filter: pageFilter }, () => {
            this.getPage(pageNumber, pageSize, pageCondition, (page) => {
                const { settings: { namHoc, hocKy, totalPaid, totalCurrent } } = page;
                if (isInitial) {
                    this.year.value(namHoc);
                    this.term.value(hocKy);
                    const filter = page.filter || {};
                    const filterCookie = T.getCookiePage('pageTcHocPhi', 'F');
                    let { daDong, listBacDaoTao, listLoaiHinhDaoTao, listNganh, listKhoa } = filter;
                    this.setState({ filter: !$.isEmptyObject(filter) ? filter : pageFilter });
                    this.namTuyenSinh.value(namTuyenSinh || filterCookie.namTuyenSinh);
                    this.daDong.value(daDong || filterCookie.daDong || '');
                    this.bacDaoTao.value(listBacDaoTao || filterCookie.listBacDaoTao || '');
                    this.loaiHinhDaoTao.value(listLoaiHinhDaoTao || filterCookie.listLoaiHinhDaoTao || '');
                    this.nganh.value(listNganh || filterCookie.listNganh || '');
                    this.khoa.value(listKhoa || filterCookie.listKhoa || '');
                } else if (isReset) {
                    ['daDong', 'bacDaoTao', 'loaiHinhDaoTao', 'nganh', 'khoa'].forEach(e => this[e].value(''));
                    this.hideAdvanceSearch();
                }
                this.setState({ totalCurrent, totalPaid });
            });
        });
    }

    sendEmailNhacNho = () => {

    }

    getPage = (pageN, pageS, pageC, done) => {
        this.props.getTcHocPhiPage(pageN, pageS, pageC, this.state.filter, done);
    }

    onDownloadPsc = (e) => {
        e.preventDefault();
        T.download(`/api/finance/hoc-phi/download-psc?filter=${T.stringify(this.state.filter)}`, 'HOC_PHI.xlsx');
    }

    onCreateInvocie = (e, item) => {
        e.preventDefault();
        if (item.congNo) {
            T.notify('Không thể tạo hóa đơn cho sinh viên còn công nợ', 'danger');
            return;
        }
        e.target.setAttribute('disabled', true);
        T.confirm('Xuất hóa đơn', `Xuất hóa đơn cho sinh viên ${`${item.ho} ${item.ten}`.trim().normalizedName()}`, true, isCofirm => isCofirm && this.props.createInvoice(item.mssv, item.hocKy, item.namHoc, () => this.getPage(), () => e.target.setAttribute('disabled', false)));
    }

    onCreateInvoiceList = (data, done) => {
        this.props.createInvoiceList(data, (result) => {
            done();
            this.invoiceModal.hide();
            setTimeout(() => this.resultModal.show(result || {}), 500);
        }, done);
    }

    render() {
        let invoicePermission = this.getUserPermission('tcInvoice');
        let permission = this.getUserPermission('tcHocPhi', ['read', 'write', 'delete', 'manage', 'export']);
        let { pageNumber, pageSize, pageTotal, totalItem, pageCondition, list } = this.props.tcHocPhi && this.props.tcHocPhi.page ? this.props.tcHocPhi.page : {
            pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, list: null
        };
        const buttons = [];

        invoicePermission.write && buttons.push({
            className: 'btn-info', icon: 'fa-print', tooltip: 'Xuất hóa đơn', onClick: (e) => {
                e.preventDefault();
                this.invoiceModal.show({
                    tuNgay: this.tuNgay?.value(),
                    denNgay: this.denNgay?.value(),
                    hocKy: this.term.value(),
                    namHoc: this.year.value(),
                });
            }
        }, {
            className: 'btn-primary', icon: 'fa-scissors', tooltip: 'Tách MSSV', onClick: (e) => {
                e.preventDefault();
                this.tachMssvModal.show();
            }
        }, {
            className: 'btn-secondary', icon: 'fa-cog', tooltip: 'Chọn BHYT', onClick: (e) => {
                e.preventDefault();
                this.props.history.push('/user/finance/bhyt');
            }
        });

        permission.manage && buttons.push({ type: 'primary', icon: 'fa-table', tooltip: 'Thống kê', onClick: e => e.preventDefault() || (permission.manage && this.props.history.push('/user/finance/statistic')) });


        let table = renderTable({
            getDataSource: () => list,
            stickyHead: true,
            header: 'thead-light',
            className: 'table-fix-col',
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
                        <Tooltip title='Bảo hiểm y tế' arrow>
                            <button className='btn btn-secondary' onClick={e => {
                                e.preventDefault();
                                this.props.getMssvBaoHiemYTe({ mssv: item.mssv }, (bhyt) => {
                                    if (!bhyt) {
                                        T.confirm('Sinh viên chưa chọn bảo hiểm y tế', `Xác nhận đăng ký bảo hiểm y tế cho sinh viên ${item.mssv}!`, 'warning', true, isConfirm => {
                                            if (isConfirm)
                                                this.adminCreateBhytModal.show(item.mssv);
                                        });
                                    } else {
                                        this.adminBhytModal.initBhyt(bhyt.dienDong);
                                        this.adminBhytModal.show(item.mssv);
                                    }
                                });
                            }}>
                                <i className='fa fa-lg fa-cog' />
                            </button>
                        </Tooltip>

                        {item.invoiceId ? <Tooltip title='Xem hóa đơn' arrow>
                            <a className='btn btn-warning' target='_blank' rel='noopener noreferrer' href={`/api/finance/invoice/view/${item.invoiceId}`}>
                                <i className='fa fa-lg fa-credit-card' />
                            </a>
                        </Tooltip> :
                            <button title='Tạo hóa đơn' className='btn btn-info' onClick={e => this.onCreateInvocie(e, item)}>
                                <i className='fa fa-lg fa-print' />
                            </button>
                        }
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
                <FormSelect ref={e => this.namTuyenSinh = e} label='Năm tuyển sinh' data={SelectAdapter_FwNamTuyenSinh} className='col-md-4' allowClear />
                <FormSelect ref={e => this.khoa = e} label='Khoa' data={SelectAdapter_DmDonViFaculty_V2} className='col-md-4' allowClear multiple />
                <FormSelect ref={e => this.nganh = e} label='Ngành' data={SelectAdapter_DtNganhDaoTao} className='col-md-4' allowClear multiple />
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
                        <NumberIcon type='primary' icon='fa-users' title='Tổng số sinh viên đóng học phí' value={totalItem || 0} />
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
                    <InvoiceModal ref={e => this.invoiceModal = e} onCreate={this.onCreateInvoiceList} permissions={invoicePermission} getPendingListInvoiceLength={this.props.getPendingListInvoiceLength} />
                    <InvoiceResultModal ref={e => this.resultModal = e} />
                    <AdminBhytModal ref={e => this.adminBhytModal = e} createSvBaoHiemYTe={this.props.createMssvBaoHiemYTe} />
                    <AdminBhytModal ref={e => this.adminCreateBhytModal = e} createSvBaoHiemYTe={this.props.createSvBaoHiemYTe} />

                    <TachMssvModal ref={e => this.tachMssvModal = e} />
                </div>,
            onImport: permission.write ? (e) => e.preventDefault() || this.props.history.push('/user/finance/import-hoc-phi') : null,
            onExport: permission.export ? (e) => e.preventDefault() || T.download(`/api/finance/hoc-phi/download-excel?filter=${T.stringify(this.state.filter)}`, 'HOC_PHI.xlsx') : null,
            buttons: buttons,
        });
    }
}

const mapStateToProps = state => ({ system: state.system, tcHocPhi: state.finance.tcHocPhi });
const mapActionsToProps = {
    getMssvBaoHiemYTe, getTcHocPhiPage, updateHocPhi, getHocPhi, createMultipleHocPhi, createInvoice, createInvoiceList, getPendingListInvoiceLength, createMssvBaoHiemYTe, createSvBaoHiemYTe
};
export default connect(mapStateToProps, mapActionsToProps)(TcHocPhiAdminPage);
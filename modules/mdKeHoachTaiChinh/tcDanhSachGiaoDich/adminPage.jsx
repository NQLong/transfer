import React from 'react';
import { connect } from 'react-redux';
import { AdminPage, FormDatePicker, FormSelect, FormTextBox, renderTable, TableCell, AdminModal } from 'view/component/AdminPage';
import Pagination from 'view/component/Pagination';
import { getTongGiaoDichPage, getListNganHang, createGiaoDich } from './redux';
import { getStudentHocPhi } from '../tcHocPhi/redux';
import { SelectAdapter_DmSvBacDaoTao } from 'modules/mdDanhMuc/dmSvBacDaoTao/redux';
import { SelectAdapter_DmSvLoaiHinhDaoTao } from 'modules/mdDanhMuc/dmSvLoaiHinhDaoTao/redux';
import { SelectAdapter_DmDonViFaculty_V2 } from 'modules/mdDanhMuc/dmDonVi/redux';
import { SelectAdapter_DtNganhDaoTao } from 'modules/mdDaoTao/dtNganhDaoTao/redux';
import { SelectAdapter_FwStudent } from 'modules/mdSinhVien/fwStudents/redux';

const yearDatas = () => {
    return Array.from({ length: 15 }, (_, i) => i + new Date().getFullYear() - 10);
};

const termDatas = [{ id: 1, text: 'HK1' }, { id: 2, text: 'HK2' }, { id: 3, text: 'HK3' }];

class EditModal extends AdminModal {

    onChangeQuery = () => {
        const mssv = this.sinhVien.value();
        const hocKy = this.hocKy.value();
        const namHoc = this.namHoc.value();
        if (mssv && hocKy && namHoc) {
            this.props.get(mssv, namHoc, hocKy, (hocPhi) => {
                this.soTien.value(hocPhi.congNo);
                this.setAmountText(hocPhi.congNo);
            });
        }
    }


    setAmountText = (value) => {
        if (Number.isInteger(value))
            this.thanhChu?.value(T.numberToVnText(value.toString()) + ' đồng');
    }

    onShow = () => {
        this.soTien?.value('');
        this.thanhChu?.value('');
        this.sinhVien?.value('');
    }

    onSubmit = () => {
        const data = {
            soTien: this.soTien.value(),
            hocKy: this.hocKy.value(),
            namHoc: this.namHoc.value(),
            sinhVien: this.sinhVien.value()
        };
        if (!data.namHoc) {
            T.notify('Năm học trống ', 'danger');
            this.namHoc.focus();
        }
        else if (!data.hocKy) {
            T.notify('Học kỳ trống ', 'danger');
            this.hocKy.focus();
        }
        else if (!data.sinhVien) {
            T.notify('Sinh viên trống ', 'danger');
            this.sinhVien.focus();
        }
        else if (!data.soTien) {
            T.notify('Số tiền trống', 'danger');
            this.soTien.focus();
        }
        else {
            this.props.create(data, () => this.hide());
        }
    }

    render = () => {
        return this.renderModal({
            title: 'Thêm giao dịch',
            size: 'large',
            body: <div className='row'>
                <FormSelect required data={yearDatas()} label='Năm học' className='col-md-4' ref={e => this.namHoc = e} onChange={this.onChangeQuery} />
                <FormSelect required data={termDatas} label='Học kỳ' className='col-md-4' ref={e => this.hocKy = e} onChange={this.onChangeQuery} />
                <FormSelect required data={SelectAdapter_FwStudent} label='Sinh viên' className='col-md-4' ref={e => this.sinhVien = e} onChange={this.onChangeQuery} />
                <FormTextBox readOnly label='Số tiền' readOnlyEmptyText='Chưa có dữ liệu học phí' className='col-md-12' ref={e => this.soTien = e} />
                <FormTextBox readOnly label='Thành chữ' className='col-md-12' ref={e => this.thanhChu = e} readOnlyEmptyText='Chưa có dữ liệu học phí' />
            </div>
        });
    }
}

class AdminEditModal extends AdminModal {

    onChangeQuery = () => {
        const mssv = this.sinhVien.value();
        const hocKy = this.hocKy.value();
        const namHoc = this.namHoc.value();
        if (mssv && hocKy && namHoc) {
            this.props.get(mssv, namHoc, hocKy, (hocPhi) => {
                this.soTien.value(hocPhi.congNo);
                this.setAmountText(hocPhi.congNo);
            });
        }
    }


    setAmountText = (value) => {
        if (Number.isInteger(value))
            this.thanhChu?.value(T.numberToVnText(value.toString()) + ' đồng');
    }

    onShow = () => {
        this.soTien?.value('');
        this.thanhChu?.value('');
        this.sinhVien?.value('');
    }

    onSubmit = () => {
        const data = {
            soTien: this.soTien.value(),
            hocKy: this.hocKy.value(),
            namHoc: this.namHoc.value(),
            sinhVien: this.sinhVien.value()
        };
        if (!data.namHoc) {
            T.notify('Năm học trống ', 'danger');
            this.namHoc.focus();
        }
        else if (!data.hocKy) {
            T.notify('Học kỳ trống ', 'danger');
            this.hocKy.focus();
        }
        else if (!data.sinhVien) {
            T.notify('Sinh viên trống ', 'danger');
            this.sinhVien.focus();
        }
        else if (!data.soTien) {
            T.notify('Số tiền trống', 'danger');
            this.soTien.focus();
        }
        else {
            this.props.create(data, () => this.hide());
        }
    }

    render = () => {
        return this.renderModal({
            title: 'Thêm giao dịch',
            size: 'large',
            body: <div className='row'>
                <FormSelect required data={yearDatas()} label='Năm học' className='col-md-4' ref={e => this.namHoc = e} onChange={this.onChangeQuery} />
                <FormSelect required data={termDatas} label='Học kỳ' className='col-md-4' ref={e => this.hocKy = e} onChange={this.onChangeQuery} />
                <FormSelect required data={SelectAdapter_FwStudent} label='Sinh viên' className='col-md-4' ref={e => this.sinhVien = e} onChange={this.onChangeQuery} />
                <FormTextBox label='Số tiền' readOnlyEmptyText='Chưa có dữ liệu học phí' className='col-md-12' ref={e => this.soTien = e} type='number' onChange={() => this.setAmountText(this.soTien.value())}/>
                <FormTextBox disabled label='Thành chữ' className='col-md-12' ref={e => this.thanhChu = e} readOnlyEmptyText='Chưa có dữ liệu học phí' />
            </div>
        });
    }
}

class DanhSachGiaoDich extends AdminPage {
    state = {
        filter: {},
    }

    componentDidMount() {
        T.ready('/user/finance/danh-sach-giao-dich', () => {
            T.onSearch = (searchText) => this.getPage(undefined, undefined, searchText || '', page => this.setFilter(page));
            T.showSearchBox(true);
            this.props.getListNganHang();
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
            nganHang = this.nganHang?.value().toString(),
            { tuNgay, denNgay } = this.getTimeFilter();

        const pageFilter = (isInitial || isReset) ? { namHoc, hocKy } : { namHoc, hocKy, tuNgay, denNgay, listBacDaoTao, listLoaiHinhDaoTao, listNganh, listKhoa, nganHang };
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
        ['tuNgay', 'denNgay', 'bacDaoTao', 'loaiHinhDaoTao', 'khoa', 'nganh', 'nganHang'].forEach(key => this[key]?.value(''));
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
        // const developer = this.getUserPermission('developer', ['login']);
        let permission = this.getUserPermission('tcGiaoDich', ['read', 'export', 'write', 'check']);
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
                <FormSelect ref={e => this.nganHang = e} label='Ngân hàng' data={this.props.tcGiaoDich?.nganHang || []} className='col-md-4' allowClear multiple />
                <FormSelect ref={e => this.bacDaoTao = e} label='Bậc đào tạo' data={SelectAdapter_DmSvBacDaoTao} className='col-md-4' allowClear multiple />
                <FormSelect ref={e => this.loaiHinhDaoTao = e} label='Hệ đào tạo' data={SelectAdapter_DmSvLoaiHinhDaoTao} className='col-md-4' allowClear multiple />
                <FormSelect ref={e => this.khoa = e} label='Khoa' data={SelectAdapter_DmDonViFaculty_V2} className='col-md-6' allowClear multiple />
                <FormSelect ref={e => this.nganh = e} label='Ngành' data={SelectAdapter_DtNganhDaoTao} className='col-md-6' allowClear multiple />
                <FormDatePicker className='col-md-6' ref={e => this.tuNgay = e} label='Từ ngày' allowClear />
                <FormDatePicker className='col-md-6' ref={e => this.denNgay = e} label='Đến ngày' allowClear />
                <div className='col-md-12 d-flex justify-content-end' style={{ gap: 10 }}>
                    <button className='btn btn-danger' onClick={this.onClearSearch}><i className='fa fa-lg fa-times' />Xóa tìm kiếm</button>
                    <button className='btn btn-success' onClick={e => e.preventDefault() || this.changeAdvancedSearch()}><i className='fa fa-lg fa-search' />Tìm kiếm</button>
                </div>
            </div>,
            breadcrumb: ['Danh sách giao dịch'],
            content: (<div className='row'>
                <div className='col-md-12'>
                    <div className='tile'>
                        {table}
                        <Pagination {...{ pageNumber, pageSize, pageTotal, totalItem, pageCondition }}
                            getPage={this.getPage} />
                    </div>
                </div>
                <AdminEditModal ref={e => this.adminModal = e} create={this.props.createGiaoDich} get={this.props.getStudentHocPhi} />
                <EditModal ref={e => this.modal = e} create={this.props.createGiaoDich} get={this.props.getStudentHocPhi} />
            </div>),
            onCreate: permission.check ? () => this.adminModal.show() : null,
            onExport: permission.export ? e => this.onDownloadPsc(e) : null,
        });
    }
}

const mapStateToProps = state => ({ system: state.system, tcGiaoDich: state.finance.tcGiaoDich });
const mapActionsToProps = { getTongGiaoDichPage, getListNganHang, createGiaoDich, getStudentHocPhi };
export default connect(mapStateToProps, mapActionsToProps)(DanhSachGiaoDich);

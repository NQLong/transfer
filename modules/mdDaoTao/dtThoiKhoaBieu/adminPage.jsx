import React from 'react';
import { connect } from 'react-redux';
import { getDtThoiKhoaBieuPage, createDtThoiKhoaBieu, updateDtThoiKhoaBieu, updateDtThoiKhoaBieuCondition, deleteDtThoiKhoaBieu, initSchedule } from './redux';
import { Link } from 'react-router-dom';
import { getDmDonViAll, SelectAdapter_DmDonVi, SelectAdapter_DmDonViFaculty_V2 } from 'modules/mdDanhMuc/dmDonVi/redux';
import { createDtThoiGianPhanCong } from '../dtThoiGianPhanCong/redux';
import { SelectAdapter_DmMonHocAll } from '../dmMonHoc/redux';
import { getDmPhongAll, SelectAdapter_DmPhong } from 'modules/mdDanhMuc/dmPhong/redux';
import { AdminModal, AdminPage, CirclePageButton, FormCheckbox, FormDatePicker, FormSelect, FormTextBox, renderTable, TableCell } from 'view/component/AdminPage';
import Pagination from 'view/component/Pagination';
import { Tooltip } from '@mui/material';
import T from 'view/js/common';
import { SelectAdapter_FwCanBoGiangVien } from 'modules/mdTccb/tccbCanBo/redux';
import { SelectAdapter_DtNganhDaoTaoFilter } from '../dtNganhDaoTao/redux';
import { SelectAdapter_DtCauTrucKhungDaoTao } from '../dtCauTrucKhungDaoTao/redux';
import { SelectAdapter_NamDaoTaoFilter } from '../dtChuongTrinhDaoTao/redux';
import { SelectAdapter_DmSvLoaiHinhDaoTaoFilter } from 'modules/mdDanhMuc/dmSvLoaiHinhDaoTao/redux';
import { SelectAdapter_DmSvBacDaoTao } from 'modules/mdDanhMuc/dmSvBacDaoTao/redux';

const dataThu = [2, 3, 4, 5, 6, 7], dataTiet = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

class ThoiGianPhanCongGiangDay extends AdminModal {
    onSubmit = (e) => {
        e && e.preventDefault();
        const data = {
            donVi: this.donVi.value(),
            batDau: this.batDau.value().setHours(0, 0, 0, 0),
            ketThuc: this.ketThuc.value().setHours(23, 59, 59, 999)
        };
        if (!data.donVi) {
            T.notify('Đơn vị trống', 'danger');
            this.donVi.focus();
        } else if (!data.batDau) {
            T.notify('Ngày mở trống', 'danger');
            this.batDau.focus();
        } else if (!data.ketThuc) {
            T.notify('Ngày đóng trống', 'danger');
            this.ketThuc.focus();
        } else {
            this.props.create(data, this.hide);
            location.reload();
        }
    }
    render = () => {
        return this.renderModal({
            title: 'Thời gian các đơn vị phân công giảng dạy',
            size: 'large',
            body: <div className='row'>
                <FormSelect className='col-md-12' ref={e => this.donVi = e} label='Đơn vị' data={SelectAdapter_DmDonViFaculty_V2} />
                <FormDatePicker type='date-mask' ref={e => this.batDau = e} label='Từ ngày' className='col-md-6' />
                <FormDatePicker type='date-mask' ref={e => this.ketThuc = e} label='Đến ngày' className='col-md-6' />
            </div>
        });
    }
}
class AddingModal extends AdminModal {
    onShow = () => {
        this.bacDaoTao.value('DH');
        this.soLop.value(1);
        this.soTiet.value(1);
        this.soBuoi.value(1);
        this.soLuongDuKien.value(50);
    }

    onSubmit = (e) => {
        e.preventDefault();
        const data = {
            maMonHoc: this.maMonHoc.value(),
            soTietBuoi: this.soTiet.value(),
            soLop: this.soLop.value(),
            soBuoiTuan: this.soBuoi.value(),
            khoaDangKy: this.khoaDangKy.value(),
            maNganh: this.maNganh.value(),
            soLuongDuKien: this.soLuongDuKien.value(),
            loaiMonHoc: Number(this.loaiMonHoc.value()),
            bacDaoTao: this.bacDaoTao.value(),
            loaiHinhDaoTao: this.loaiHinhDaoTao.value()
        };

        if (!data.maMonHoc) {
            T.notify('Môn học bị trống', 'danger');
            this.maMonHoc.focus();
        } else if (!data.soTietBuoi || data.soTietBuoi <= 0) {
            T.notify('Số tiết không hợp lệ', 'danger');
            this.soTiet.focus();
        } else if (!data.soLop || data.soLop <= 0) {
            T.notify('Số lớp không hợp lệ', 'danger');
            this.soLop.focus();
        } else if (!data.soBuoiTuan || data.soBuoiTuan <= 0) {
            T.notify('Số buổi không hợp lệ', 'danger');
            this.soBuoi.focus();
        } else if (!data.khoaDangKy) {
            T.notify('Khoa đăng ký bị trống', 'danger');
            this.khoaDangKy.focus();
        } else if (!data.maNganh) {
            T.notify('Mã ngành bị trống', 'danger');
            this.maNganh.focus();
        } else if (!data.soLuongDuKien || data.soLuongDuKien <= 0) {
            T.notify('Số lượng dự kiến không hợp lệ', 'danger');
            this.soLuongDuKien.focus();
        } else this.props.create([data], () => {
            this.props.initData();
            this.hide();
        });
    }

    handleDonVi = (value) => {
        this.setState({ khoaDangKy: value.id });
    }

    render = () => {
        return this.renderModal({
            title: 'Mở môn học',
            size: 'large',
            submitText: 'Mở môn học',
            body: <div className='row'>
                <FormSelect ref={e => this.bacDaoTao = e} data={SelectAdapter_DmSvBacDaoTao} className='col-md-6' label='Bậc đào tạo' />
                <FormSelect ref={e => this.loaiHinhDaoTao = e} data={SelectAdapter_DmSvLoaiHinhDaoTaoFilter} className='col-md-6' label='Hệ đào tạo' />
                <FormSelect data={SelectAdapter_DtCauTrucKhungDaoTao} ref={e => this.nam = e} className='col-md-6' label='Năm' />
                <FormSelect ref={e => this.hocKy = e} data={[1, 2, 3]} label='Học kỳ' className='col-md-6' />
                <FormSelect ref={e => this.khoaDangKy = e} data={SelectAdapter_DmDonViFaculty_V2} className='col-md-6' label='Khoa mở' onChange={this.handleDonVi} />
                <FormSelect ref={e => this.maNganh = e} data={SelectAdapter_DtNganhDaoTaoFilter(this.state.khoaDangKy || null)} className='col-md-6' label='Chuyên ngành' />
                <FormSelect ref={e => this.maMonHoc = e} data={SelectAdapter_DmMonHocAll()} className='col-md-10' placeholder='Môn học' label='Môn học' />
                <FormCheckbox ref={e => this.loaiMonHoc = e} label='Tự chọn' style={{ marginBottom: '0' }} className='col-md-2' />
                <FormTextBox type='number' ref={e => this.soLop = e} className='col-md-3' label='Số lớp' />
                <FormTextBox type='number' ref={e => this.soTiet = e} className='col-md-3' label='Số tiết /buổi' />
                <FormTextBox type='number' ref={e => this.soBuoi = e} className='col-md-3' label='Số buổi /tuần' />
                <FormTextBox type='number' ref={e => this.soLuongDuKien = e} className='col-md-3' label='Số lượng SV dự kiến /lớp' />
            </div>
        });
    }
}
class AdjustModal extends AdminModal {
    onShow = (item) => {
        let { id, giangVien, maMonHoc, tenMonHoc, nhom, tenKhoaBoMon, phong, thu, tietBatDau, soTiet } = item;
        this.setState({ id, soTiet });
        this.giangVien.value(giangVien);
        this.monHoc.value(maMonHoc + ': ' + T.parse(tenMonHoc, { vi: '' }).vi);
        this.nhom.value(nhom);
        this.khoa.value(tenKhoaBoMon);
        this.phong.value(phong);
        this.thu.value(thu);
        this.tietBatDau.value(tietBatDau);
    }
    onSubmit = (e) => {
        e.preventDefault();
        let data = {
            phong: this.phong.value(),
            thu: this.thu.value(),
            tietBatDau: this.tietBatDau.value(),
            soTiet: this.state.soTiet,
            giangVien: this.giangVien.value()
        };
        if (!data.phong) {
            T.notify('Vui lòng chọn phòng', 'danger');
            this.phong.focus();
        } else if (!data.thu) {
            T.notify('Vui lòng chọn thứ', 'danger');
            this.thu.focus();
        } else if (!data.tietBatDau) {
            T.notify('Vui lòng chọn tiết bắt đầu', 'danger');
            this.tietBatDau.focus();
        } else {
            this.props.update(this.state.id, data, (result) => {
                if (result.item) {
                    this.hide();
                    this.props.initData();
                }
            });
        }
    }

    render = () => {
        let quanLyKhoa = this.props.quanLyKhoa;
        return this.renderModal({
            title: 'Điều chỉnh',
            size: 'large',
            body: <div className='row'>
                <FormTextBox ref={e => this.monHoc = e} className='form-group col-md-12' readOnly label='Môn' />
                <FormTextBox ref={e => this.nhom = e} className='form-group col-md-4' readOnly label='Lớp' />
                <FormTextBox ref={e => this.khoa = e} className='form-group col-md-8' readOnly label='Khoa, bộ môn' />
                <FormSelect ref={e => this.phong = e} className='col-md-4' label='Phòng' data={SelectAdapter_DmPhong} readOnly={quanLyKhoa} />
                <FormSelect ref={e => this.thu = e} className='form-group col-md-4' label='Thứ' data={dataThu} readOnly={quanLyKhoa} />
                <FormSelect ref={e => this.tietBatDau = e} className='form-group col-md-4' label='Tiết bắt đầu' data={dataTiet} readOnly={quanLyKhoa} />
                <FormSelect ref={e => this.giangVien = e} className='form-group col-md-12' data={SelectAdapter_FwCanBoGiangVien} label='Chọn giảng viên' readOnly={!quanLyKhoa} />
            </div>
        });
    }
}
class DtThoiKhoaBieuPage extends AdminPage {
    soTiet = {}
    thu = {}
    tietBatDau = {}
    phong = {}
    soLuongDuKien = {}
    sucChua = {}
    check = {}
    loaiMonHoc = {}
    state = { page: null, isEdit: {}, sucChua: {}, filter: {}, idNamDaoTao: '', hocKy: '' }
    componentDidMount() {
        T.ready('/user/dao-tao', () => {
            T.onSearch = (searchText) => this.initData(searchText || '');
            T.showSearchBox(() => { });
            this.setState({ idNamDaoTao: '', hocKy: '' });
        });
        this.initData();
    }

    initData = (searchText = '', filter = this.state.filter) => {
        this.props.getDtThoiKhoaBieuPage(undefined, undefined, searchText, page => {
            let { maKhoaBoMon = null, maNganh = null } = filter;
            const { idNamDaoTao: nam = null, hocKy = null } = this.state;
            page.list = page.list.filter(item => {
                return (!maNganh || item.maNganh == maNganh)
                    && (!maKhoaBoMon || item.maKhoaBoMon == maKhoaBoMon)
                    && (!nam || item.nam == nam)
                    && (!hocKy || item.hocKy == hocKy);
            });
            this.setState({
                page,
                thoiGianPhanCong: page.thoiGianPhanCong,
                listYear: Object.keys(page.list.groupBy('nam')).sort().filter((value, index, list) => !index || value != list[index - 1]),
                listHocKy: Object.keys(page.list.groupBy('hocKy')).sort().filter((value, index, list) => !index || value != list[index - 1]),
            }, () => {
                let { pageNumber, pageSize, list } = page;
                list.forEach((item, index) => {
                    let indexOfItem = (pageNumber - 1) * pageSize + index + 1;
                    this.soTiet[indexOfItem].value(item.soTiet);
                    this.thu[indexOfItem].value(item.thu);
                    this.tietBatDau[indexOfItem].value(item.tietBatDau);
                    this.phong[indexOfItem].value(item.phong || '');
                    this.soLuongDuKien[indexOfItem].value(item.soLuongDuKien);
                    this.sucChua[indexOfItem] = item.sucChua;
                    this.check[indexOfItem].value(item.isMo);
                    this.loaiMonHoc[indexOfItem].value(item.loaiMonHoc);
                    if (index == list.length - 1) this.setState({ sucChua: this.sucChua });
                });
            });
        });
    };


    delete = (item) => {
        T.confirm('Xóa môn học', `Bạn sẽ xóa môn ${item.maMonHoc} - Lớp ${item.nhom}`, 'warning', 'true', isConfirm => {
            if (isConfirm) {
                this.props.deleteDtThoiKhoaBieu(item.id, this.initData());
            }
        });
    }

    taoThoiKhoaBieu = () => {
        let content = {
            element: 'input',
            attributes: {
                type: 'date',
            },
        };
        T.confirmLoading('Tạo thời khóa biểu', 'Xác nhận tạo thời khóa biểu tự động?', 'Tạo thời khóa biểu thành công', 'Tạo thời khóa biểu thất bại', 'info', 'Tạo', content, (ngayBatDau) =>
            new Promise(resolve => {
                this.props.initSchedule(ngayBatDau, (result) => {
                    result.success && setTimeout(() => location.reload(), 2000);
                    resolve(result);
                });
            }));
    }

    updateSoTiet = (index, item) => {
        if (this.thu[index].value() || this.tietBatDau[index].value() || this.soTiet[index].value() || this.soLuongDuKien[index].value())
            this.props.updateDtThoiKhoaBieu(item.id, {
                soTiet: this.soTiet[index].value(),
                tietBatDau: this.tietBatDau[index].value(),
                thu: this.thu[index].value(),
                sucChua: this.state.sucChua[index],
                soLuongDuKien: this.soLuongDuKien[index].value()
            }, (data) => {
                let item = data.item;
                this.tietBatDau[index].value(item.tietBatDau);
                this.thu[index].value(item.thu);
                // this.soTiet[index].value(item.soTiet);
                // location.reload();
            });
    };

    handleCheck = (value, item) => {
        this.props.updateDtThoiKhoaBieuCondition(item, { isMo: Number(value) }, data => data.item && this.initData());
    }

    handleCheckLoaiMonHoc = (value, item) => {
        this.props.updateDtThoiKhoaBieu(item.id, { loaiMonHoc: Number(value) }, data => data.item && this.initData());
    }

    renderThoiGianPhanCong = (data) => {
        return renderTable({
            emptyTable: 'Chưa có thời gian phân công',
            getDataSource: () => data,
            header: 'thead-light',
            stickyHead: false,
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', textAlign: 'right' }}>#</th>
                    <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>Học kỳ</th>
                    <th style={{ width: '100%', whiteSpace: 'nowrap' }}>Khoa/Bộ môn</th>
                    <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>Bắt đầu</th>
                    <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>Kết thúc</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Đã phân công</th>
                </tr>
            ),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell style={{ textAlign: 'right' }} content={index + 1} />
                    <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={<>{item.namDaoTao} <br /> {'HK' + item.hocKy}</>} />
                    <TableCell content={item.tenDonVi} />
                    <TableCell type='date' dateFormat='dd/mm/yyyy' style={{ whiteSpace: 'nowrap' }} content={item.batDau} />
                    <TableCell type='date' dateFormat='dd/mm/yyyy' style={{ whiteSpace: 'nowrap' }} content={item.ketThuc} />
                    <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={`${item.daPhanCong}/${item.tongSoLop}`} />
                </tr>
            )
        });
    }

    render() {
        const permission = this.getUserPermission('dtThoiKhoaBieu', ['read', 'write', 'delete', 'manage']);
        const { pageNumber, pageSize, pageTotal, totalItem, pageCondition } = this.state.page ? this.state.page : { pageNumber: 1, pageSize: 1, pageTotal: 1, totalItem: 1, pageCondition: '' };
        let table = renderTable({
            emptyTable: 'Không có dữ liệu thời khóa biểu',
            getDataSource: () => this.state.page ? this.state.page.list : null, stickyHead: false,
            header: 'thead-light',
            renderHead: () => (
                <>
                    <tr>
                        <th rowSpan='2' style={{ width: 'auto', textAlign: 'right', verticalAlign: 'middle' }}>#</th>
                        <th rowSpan='2' style={{ width: 'auto', textAlign: 'right', verticalAlign: 'middle' }}>Mở</th>
                        <th rowSpan='2' style={{ width: 'auto', textAlign: 'center', verticalAlign: 'middle' }}>Học kỳ</th>
                        <th rowSpan='2' style={{ width: 'auto', textAlign: 'center', verticalAlign: 'middle' }}>Ngành</th>
                        <th rowSpan='2' style={{ width: '25%', textAlign: 'center', verticalAlign: 'middle' }}>Mã</th>
                        <th rowSpan='2' style={{ width: '50%', verticalAlign: 'middle' }}>Môn học</th>
                        <th rowSpan='2' style={{ width: 'auto', verticalAlign: 'middle' }}>Tự chọn</th>
                        <th rowSpan='2' style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap', verticalAlign: 'middle' }}>Lớp</th>
                        <th rowSpan='2' style={{ width: '25%', whiteSpace: 'nowrap', verticalAlign: 'middle' }}>Phòng</th>
                        <th colSpan='6' rowSpan='1' style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Thời gian</th>
                        <th rowSpan='2' style={{ width: 'auto', verticalAlign: 'middle' }}>SLDK</th>
                        <th rowSpan='2' style={{ width: 'auto', verticalAlign: 'middle', whiteSpace: 'nowrap' }}>Khoa <br />Bộ môn</th>
                        <th rowSpan='2' style={{ width: 'auto', verticalAlign: 'middle' }}>Giảng viên</th>
                        <th rowSpan='2' style={{ width: 'auto', textAlign: 'center', verticalAlign: 'middle' }} nowrap='true'>Thao tác</th>
                    </tr>
                    <tr>
                        <th style={{ width: 'auto', textAlign: 'center' }}>Tổng tiết</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Thứ</th>
                        <th style={{ width: 'auto', textAlign: 'center' }}>Tiết bắt đầu</th>
                        <th style={{ width: 'auto', textAlign: 'center' }}>Số tiết</th>
                        <th style={{ width: 'auto', textAlign: 'center' }}>Ngày bắt đầu</th>
                        <th style={{ width: 'auto', textAlign: 'center' }}>Ngày kết thúc</th>
                    </tr>
                </>),
            renderRow: (item, index) => {
                let indexOfItem = (pageNumber - 1) * pageSize + index + 1;
                return (
                    <tr key={index}>
                        <TableCell style={{ width: 'auto', textAlign: 'right' }} content={indexOfItem} />
                        <TableCell style={{ width: 'auto', textAlign: 'right' }} content={
                            <FormCheckbox ref={e => this.check[indexOfItem] = e} onChange={value => this.handleCheck(value, item)} readOnly={!!item.phong} />
                        } />
                        <TableCell style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }} content={<>{item.namDaoTao} <br /> {'HK' + item.hocKy}</>} />
                        <TableCell style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }} content={<>{item.maNganh} <br /> {item.tenNganh?.getFirstLetters()}</>} />
                        <TableCell style={{ width: 'auto', textAlign: 'center' }} content={item.maMonHoc} />
                        <TableCell style={{}} contentClassName='multiple-lines-4' content={<>
                            <span style={{ color: 'blue' }}>{T.parse(item.tenMonHoc, { vi: '' }).vi}</span> <br />
                            <i> {item.tenKhoaBoMon}</i>
                        </>} />
                        <TableCell style={{ width: 'auto', textAlign: 'center' }} content={
                            <FormCheckbox ref={e => this.loaiMonHoc[indexOfItem] = e} onChange={value => this.handleCheckLoaiMonHoc(value, item)} readOnly={!!item.phong} />
                        } />
                        <TableCell style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }} content={`${item.nhom}${item.buoi > 1 ? ` (${item.buoi})` : ''} `} />
                        <TableCell style={{ width: 'auto', whiteSpace: 'nowrap' }} content={
                            <>
                                <FormSelect ref={e => this.phong[indexOfItem] = e} style={{ marginBottom: '0', width: '120px' }} readOnly={true} data={SelectAdapter_DmPhong} placeholder='Phòng' onChange={value => this.setState({
                                    sucChua: {
                                        ...this.state.sucChua,
                                        [indexOfItem]: value.sucChua
                                    }
                                })} />
                                <div>{this.state.sucChua[indexOfItem]}</div>
                            </>
                        }
                        // onClick={e => {
                        //     e.preventDefault();
                        //     if (e.type == 'click') this.setState({
                        //         isEdit: { ...this.state.isEdit, [indexOfItem]: !item.phong }
                        //     }, () => this.phong[indexOfItem].focus());
                        // }}
                        />
                        <TableCell style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }} content={item.tongTiet} />
                        <TableCell style={{ width: 'auto', textAlign: 'center' }} content={
                            <FormSelect ref={e => this.thu[indexOfItem] = e} style={{ width: '70px', marginBottom: '0' }} readOnly={!this.state.isEdit[indexOfItem]} data={dataThu} minimumResultsForSearch={-1} placeholder='Thứ' />
                        }
                            onClick={e => {
                                e.preventDefault();
                                if (e.type == 'click') this.setState({
                                    isEdit: { ...this.state.isEdit, [indexOfItem]: !item.phong }
                                }, () => this.thu[indexOfItem].focus());
                            }}
                        />
                        <TableCell style={{ textAlign: 'center' }} content={
                            <FormSelect ref={e => this.tietBatDau[indexOfItem] = e} style={{ width: '70px', marginBottom: '0' }} readOnly={!this.state.isEdit[indexOfItem]} data={dataTiet} minimumResultsForSearch={-1} placeholder='Tiết BĐ' />
                        }
                            onClick={e => {
                                e.preventDefault();
                                if (e.type == 'click') this.setState({
                                    isEdit: { ...this.state.isEdit, [indexOfItem]: !item.phong }
                                }, () => this.tietBatDau[indexOfItem].focus());
                            }}
                        />
                        <TableCell style={{ textAlign: 'center' }} content={
                            <FormTextBox type='number' ref={e => this.soTiet[indexOfItem] = e} style={{ width: '50px', marginBottom: '0' }} readOnly={!this.state.isEdit[indexOfItem]}
                            />
                        }
                            onClick={e => {
                                e.preventDefault();
                                if (e.type == 'click') this.setState({
                                    isEdit: { ...this.state.isEdit, [indexOfItem]: !item.phong }
                                }, () => this.soTiet[indexOfItem].focus());
                            }}
                        />
                        <TableCell type='date' dateFormat='dd/mm/yyyy' content={item.ngayBatDau} />
                        <TableCell type='date' dateFormat='dd/mm/yyyy' content={item.ngayKetThuc} />
                        <TableCell content={
                            <FormTextBox type='number' ref={e => this.soLuongDuKien[indexOfItem] = e} style={{ width: '70px', marginBottom: '0' }} readOnly={!this.state.isEdit[indexOfItem]}
                                onKeyPress={e => e.key == 'Enter' && this.setState({ isEdit: { ...this.state.isEdit, [indexOfItem]: false } }, () => {
                                    this.updateSoTiet(indexOfItem, item);
                                })}
                            />
                        } onClick={e => {
                            e.preventDefault();
                            if (e.type == 'click') this.setState({
                                isEdit: { ...this.state.isEdit, [indexOfItem]: !item.phong }
                            }, () => this.soLuongDuKien[indexOfItem].focus());
                        }} />
                        <TableCell style={{}} content={item.tenKhoaDangKy?.getFirstLetters().toUpperCase()} />
                        <TableCell style={{ whiteSpace: 'nowrap' }} content={`${item.trinhDo || ''} ${(item.hoGiangVien || '').normalizedName()} ${(item.tenGiangVien || '').normalizedName()}`} />
                        <TableCell type='buttons' style={{ textAlign: 'center' }} content={item} permission={permission}
                        >
                            {!item.phong && <>
                                {!this.state.isEdit[indexOfItem] && <Tooltip title='Điều chỉnh' arrow>
                                    <button className='btn btn-primary' onClick={e => e.preventDefault() || this.setState({ isEdit: { ...this.state.isEdit, [indexOfItem]: true } })}>
                                        <i className='fa fa-lg fa-edit' />
                                    </button>
                                </Tooltip>}
                                {this.state.isEdit[indexOfItem] && <Tooltip title='Lưu' arrow>
                                    <button className='btn btn-success' onClick={e => {
                                        e.preventDefault();
                                        this.setState({ isEdit: { ...this.state.isEdit, [indexOfItem]: false } }, () => {
                                            this.updateSoTiet(indexOfItem, item);
                                        });
                                    }}>
                                        <i className='fa fa-lg fa-check' />
                                    </button>
                                </Tooltip>}</>}
                            {item.phong && <Tooltip title='Điều chỉnh' arrow>
                                <button className='btn btn-info' onClick={e => e.preventDefault() || this.modal.show(item)}>
                                    <i className='fa fa-lg fa-cog' />
                                </button>
                            </Tooltip>}
                            {item.phong && <Tooltip title='Xóa' arrow>
                                <button className='btn btn-danger' onClick={e => e.preventDefault() || this.delete(item)}>
                                    <i className='fa fa-lg fa-trash' />
                                </button>
                            </Tooltip>}
                        </TableCell>
                    </tr>);
            }
        });

        return this.renderPage({
            icon: 'fa fa-calendar',
            title: 'Thời khoá biểu',
            breadcrumb: [
                <Link key={0} to='/user/dao-tao'>Đào tạo</Link>,
                'Thời khoá biểu'
            ],
            header: permission.read && <><FormSelect style={{ width: '150px', marginBottom: '0', marginRight: '10px' }} placeholder='Năm học' onChange={value => {
                T.clearSearchBox();
                console.log(value);
                this.setState({ idNamDaoTao: value ? value.id : '' }, () => {
                    this.initData();
                });
            }} data={SelectAdapter_NamDaoTaoFilter} allowClear={true} />
                <FormSelect style={{ width: '100px', marginBottom: '0' }} placeholder='Học kỳ' onChange={value => {
                    T.clearSearchBox();
                    console.log(value);
                    this.setState({ hocKy: value ? value.id : '' }, () => {
                        this.initData();
                    });
                }} data={[1, 2, 3]} allowClear={true} /></>,
            content: <>
                {this.state.thoiGianPhanCong && this.state.thoiGianPhanCong.length ? <div className='tile'>{this.renderThoiGianPhanCong(this.state.thoiGianPhanCong)}</div> : null}
                <div className='tile'>{table}</div>
                <Pagination style={{ marginLeft: '70px' }} {...{ pageNumber, pageSize, pageTotal, totalItem, pageCondition }}
                    getPage={this.props.getDtThoiKhoaBieuPage} done={(page) => {
                        this.setState({ page }, () => {
                            let { pageNumber, pageSize, list } = page;
                            list.forEach((item, index) => {
                                let indexOfItem = (pageNumber - 1) * pageSize + index + 1;
                                this.soTiet[indexOfItem].value(item.soTiet);
                                this.thu[indexOfItem].value(item.thu);
                                this.tietBatDau[indexOfItem].value(item.tietBatDau);
                                this.phong[indexOfItem].value(item.phong);
                            });
                        });
                    }}
                />
                <AdjustModal ref={e => this.modal = e} quanLyKhoa={permission.manage}
                    update={this.props.updateDtThoiKhoaBieuCondition}
                    initData={this.initData}
                />
                <ThoiGianPhanCongGiangDay ref={e => this.thoiGianModal = e} create={this.props.createDtThoiGianPhanCong} />
                <AddingModal ref={e => this.addingModal = e} create={this.props.createDtThoiKhoaBieu} initData={this.initData} />
                {permission.write && <CirclePageButton type='custom' customClassName='btn-danger' customIcon='fa fa-lg fa-calendar' tooltip='Tạo thời khóa biểu cho danh sách hiện tại' onClick={e => e.preventDefault()
                    || this.taoThoiKhoaBieu()} style={{ marginRight: '60px' }} />}
                {permission.write && <CirclePageButton type='custom' customClassName='btn-warning' customIcon='fa-thumb-tack' tooltip='Tạo thời gian phân công giảng dạy' onClick={e => e.preventDefault()
                    || this.thoiGianModal.show()} style={{ marginRight: '120px' }} />}
            </>,
            backRoute: '/user/dao-tao',
            advanceSearch: <div className='row'>
                <FormSelect ref={e => this.namFilter = e} className='col-md-2' label='Chọn năm' data={this.state.listYear || []} onChange={value => this.setState({ filter: { ...this.state.filter, nam: value.id } })} />
                <FormSelect ref={e => this.hocKyFilter = e} className='col-md-2' label='Chọn học kỳ' data={this.state.listHocKy || []} onChange={value => this.setState({ filter: { ...this.state.filter, hocKy: value.id } })} />
                <FormSelect ref={e => this.khoaFilter = e} className='col-md-4' label='Chọn khoa' data={SelectAdapter_DmDonVi} onChange={value => this.setState({ filter: { ...this.state.filter, maKhoaBoMon: value.id } })} />
                <FormSelect ref={e => this.nganhFilter = e} className='col-md-4' label='Chọn ngành' data={SelectAdapter_DtNganhDaoTaoFilter(this.state.filter.maKhoaBoMon)} onChange={value => this.setState({ filter: { ...this.state.filter, maNganh: value.id } })} />
                <div style={{ display: 'flex', justifyContent: 'end' }} className='form-group col-md-12'>
                    <button className='btn btn-secondary' onClick={
                        e => e.preventDefault() || this.setState({ filter: {} }, () => {
                            this.initData('', this.state.filter);
                            this.namFilter.value('');
                            this.hocKyFilter.value('');
                            this.khoaFilter.value('');
                            this.nganhFilter.value('');
                        })} style={{ marginRight: '15px' }}>
                        <i className='fa fa-lg fa-times' /> Reset
                    </button>
                    <button className='btn btn-success' onClick={e => e.preventDefault() || this.initData('', this.state.filter)}>
                        <i className='fa fa-lg fa-search-plus' /> Tìm
                    </button>
                </div>
            </div>,
            onCreate: permission.write ? (e) => e.preventDefault() || this.addingModal.show() : null
        });
    }
}

const mapStateToProps = state => ({ system: state.system, dtThoiKhoaBieu: state.daoTao.dtThoiKhoaBieu });
const mapActionsToProps = { getDmPhongAll, getDmDonViAll, getDtThoiKhoaBieuPage, createDtThoiKhoaBieu, updateDtThoiKhoaBieu, updateDtThoiKhoaBieuCondition, deleteDtThoiKhoaBieu, initSchedule, createDtThoiGianPhanCong };
export default connect(mapStateToProps, mapActionsToProps)(DtThoiKhoaBieuPage);
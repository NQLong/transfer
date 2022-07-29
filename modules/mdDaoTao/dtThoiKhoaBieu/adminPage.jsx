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
import { SelectAdapter_DmSvLoaiHinhDaoTaoFilter } from 'modules/mdDanhMuc/dmSvLoaiHinhDaoTao/redux';
import { SelectAdapter_DmSvBacDaoTao } from 'modules/mdDanhMuc/dmSvBacDaoTao/redux';
import AutoGenSchedModal from './autoGenSchedModal';

const dataThu = [2, 3, 4, 5, 6, 7], dataTiet = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    dataHocKy = [{ id: 1, text: 'HK1' }, { id: 2, text: 'HK2' }, { id: 3, text: 'HK3' }];

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
    state = { khoaDangKy: '33' }
    onShow = () => {
        this.bacDaoTao.value('DH');
        this.khoaDangKy.value('33');
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
            loaiMonHoc: Number(this.loaiMonHoc.value())
        }, settings = {
            bacDaoTao: this.bacDaoTao.value(),
            loaiHinhDaoTao: this.loaiHinhDaoTao.value()
        };

        if (!data.maMonHoc) {
            T.notify('Môn học bị trống', 'danger');
            this.maMonHoc.focus();
        } else if (!data.soTietBuoi || data.soTietBuoi <= 0 || data.soTietBuoi >= 6) {
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
        } else if (!data.soLuongDuKien || data.soLuongDuKien <= 0) {
            T.notify('Số lượng dự kiến không hợp lệ', 'danger');
            this.soLuongDuKien.focus();
        } else {
            this.props.create([data], settings, () => {
                this.maMonHoc.focus();
            });
        }
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
                <FormTextBox type='number' ref={e => this.soLop = e} className='col-md-3' label='Số lớp' min={1} />
                <FormTextBox type='number' ref={e => this.soTiet = e} className='col-md-3' label='Số tiết /buổi' min={1} max={5} />
                <FormTextBox type='number' ref={e => this.soBuoi = e} className='col-md-3' label='Số buổi /tuần' min={1} max={3} />
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
    check = {}
    state = { page: null, isEdit: {}, sucChua: {}, filter: {}, idNamDaoTao: '', hocKy: '' }
    componentDidMount() {
        T.ready('/user/dao-tao', () => {
            T.onSearch = (searchText) => this.getPage(undefined, undefined, searchText || '');
            T.showSearchBox(true);
            this.setState({ idNamDaoTao: '', hocKy: '' });
        });
        this.changeAdvancedSearch(true);
    }

    changeAdvancedSearch = (isInitial = false) => {
        let { pageNumber, pageSize, pageCondition } = this.props && this.props.dtThoiKhoaBieu && this.props.dtThoiKhoaBieu.page ? this.props.dtThoiKhoaBieu.page : { pageNumber: 1, pageSize: 50, pageCondition: '' };
        const idNamDaoTao = this.namFilter.value(),
            hocKy = this.hocKyFilter.value(),
            donVi = this.khoaFilter.value(),
            bacDaoTaoFilter = this.bacDaoTaoFilter.value(),
            thuFilter = this.thuFilter.value(),
            phongFilter = this.phongFilter.value(),
            giangVienFilter = this.giangVienFilter.value(),
            monHocFilter = this.monHocFilter.value(),
            loaiHinhDaoTaoFilter = this.loaiHinhDaoTaoFilter.value();
        const pageFilter = (isInitial) ? {} : { idNamDaoTao, hocKy, donVi, bacDaoTaoFilter, loaiHinhDaoTaoFilter, thuFilter, phongFilter, giangVienFilter, monHocFilter };
        this.setState({ filter: pageFilter }, () => {
            this.getPage(pageNumber, pageSize, pageCondition, () => {
                if (isInitial) {
                    ['namFilter', 'hocKyFilter', 'khoaFilter', 'bacDaoTaoFilter', 'loaiHinhDaoTaoFilter', 'phongFilter', 'thuFilter', 'giangVienFilter', 'monHocFilter'].forEach(e => this[e].value(''));
                    this.hideAdvanceSearch();
                }
            });
        });
    }

    getPage = (pageN, pageS, pageC, done) => {
        this.props.getDtThoiKhoaBieuPage(pageN, pageS, pageC, this.state.filter, done);
    }

    delete = (item) => {
        T.confirm('Xóa môn học', `Bạn sẽ xóa môn ${item.maMonHoc} - Lớp ${item.nhom}`, 'warning', 'true', isConfirm => {
            if (isConfirm) {
                this.props.deleteDtThoiKhoaBieu(item.id);
            }
        });
    }

    handleCheck = (value, item) => {
        this.props.updateDtThoiKhoaBieuCondition(item, { isMo: Number(value) });
    }

    handleCheckLoaiMonHoc = (value, item) => {
        this.props.updateDtThoiKhoaBieu(item.id, { loaiMonHoc: Number(value) });
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

    elementEdit = () => (
        <>
            <TableCell style={{ whiteSpace: 'nowrap' }} content={
                <FormSelect ref={e => this.phong = e} style={{ marginBottom: '0', width: '120px' }} data={SelectAdapter_DmPhong} placeholder='Phòng' />
            } />
            <TableCell style={{ textAlign: 'center' }} content={
                <FormSelect ref={e => this.thu = e} style={{ width: '70px', marginBottom: '0' }} data={dataThu} minimumResultsForSearch={-1} placeholder='Thứ' />
            } />
            <TableCell style={{ textAlign: 'center' }} content={
                <FormSelect ref={e => this.tietBatDau = e} style={{ width: '70px', marginBottom: '0' }} data={dataTiet} minimumResultsForSearch={-1} placeholder='Tiết BĐ' />
            } />
            <TableCell style={{ textAlign: 'center' }} content={
                <FormTextBox type='number' ref={e => this.soTiet = e} style={{ width: '50px', marginBottom: '0' }} />
            } />
            <TableCell content={
                <FormTextBox type='number' ref={e => this.soLuongDuKien = e} style={{ width: '70px', marginBottom: '0' }} />
            } />

        </>
    );

    handleUpdate = (item) => {
        let curData = {
            phong: this.phong.value(),
            thu: this.thu.value(),
            tietBatDau: this.tietBatDau.value(),
            soTietBuoi: this.soTiet.value(),
            soLuongDuKien: this.soLuongDuKien.value()
        };
        this.props.updateDtThoiKhoaBieu(item.id, curData, () => {
            T.notify('Thay đổi thành công!', 'success');
            this.setState({ editId: null });
        });
    }

    handleEdit = (item) => {
        this.setState({ editId: item.id }, () => {
            this.phong.value(item.phong);
            this.thu.value(item.thu);
            this.tietBatDau.value(item.tietBatDau);
            this.soTiet.value(item.soTiet);
            this.soLuongDuKien.value(item.soLuongDuKien);
        });
    }

    render() {
        const permission = this.getUserPermission('dtThoiKhoaBieu', ['read', 'write', 'delete', 'manage', 'export']);
        const { pageNumber, pageSize, pageTotal, totalItem, pageCondition, list } = this.props.dtThoiKhoaBieu?.page || { pageNumber: 1, pageSize: 1, pageTotal: 1, totalItem: 1, pageCondition: '', list: [] };
        let table = renderTable({
            emptyTable: 'Không có dữ liệu thời khóa biểu',
            getDataSource: () => list, stickyHead: true,
            header: 'thead-light',
            renderHead: () => (
                <>
                    <tr>
                        <th style={{ width: 'auto', textAlign: 'right' }}>#</th>
                        <th style={{ width: 'auto' }}>Mở</th>
                        <th style={{ width: '25%', textAlign: 'center' }}>Mã</th>
                        <th style={{ width: '50%', }}>Môn học</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Tự chọn</th>
                        <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>Lớp</th>
                        <th style={{ width: 'auto', textAlign: 'center' }}>Tổng tiết</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Phòng</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Thứ</th>
                        <th style={{ width: 'auto', textAlign: 'center' }}>Tiết bắt đầu</th>
                        <th style={{ width: 'auto', textAlign: 'center' }}>Số tiết</th>
                        <th style={{ width: 'auto' }}>SLDK</th>
                        <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Thao tác</th>
                        <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>Ngày bắt đầu</th>
                        <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>Ngày kết thúc</th>
                        <th style={{ width: '25%', whiteSpace: 'nowrap' }}>Khoa <br />Bộ môn</th>
                        <th style={{ width: 'auto', textAlign: 'center' }}>Ngành</th>
                        <th style={{ width: 'auto' }}>Giảng viên</th>
                    </tr>
                </>),
            renderRow: (item, index) => {
                let indexOfItem = (pageNumber - 1) * pageSize + index + 1;
                return (
                    <tr key={index} >
                        <TableCell style={{ textAlign: 'right' }} content={indexOfItem} />
                        <TableCell type='checkbox' style={{ textAlign: 'center' }} content={item.isMo} onChanged={value => this.handleCheck(value, item)} permission={permission} />
                        <TableCell style={{ width: 'auto', textAlign: 'center' }} content={item.maMonHoc} />
                        <TableCell style={{ whiteSpace: 'nowrap' }} content={<>
                            <span style={{ color: 'blue' }}>{T.parse(item.tenMonHoc, { vi: '' }).vi}</span> <br />
                            <i> {item.tenKhoaBoMon}</i>
                        </>} />
                        <TableCell type='checkbox' onChanged={value => this.handleCheckLoaiMonHoc(value, item)} content={item.loaiMonHoc} permission={permission} />
                        <TableCell style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }} content={`${item.nhom}${item.buoi > 1 ? ` (${item.buoi})` : ''} `} />
                        <TableCell style={{ textAlign: 'center', whiteSpace: 'nowrap' }} content={item.tongTiet} />
                        {
                            this.state.editId == item.id ? this.elementEdit() : <>
                                <TableCell content={item.phong} />
                                <TableCell content={item.thu} />
                                <TableCell content={item.tietBatDau} />
                                <TableCell content={item.soTiet} />
                                <TableCell content={item.soLuongDuKien} />
                            </>
                        }
                        <TableCell type='buttons' style={{ textAlign: 'center' }} content={item} permission={permission}>
                            {(permission.write || permission.manage) && !item.phong && <>
                                {this.state.editId != item.id && <Tooltip title='Điều chỉnh' arrow>
                                    <button className='btn btn-primary' onClick={e => e.preventDefault() || this.handleEdit(item)}>
                                        <i className='fa fa-lg fa-edit' />
                                    </button>
                                </Tooltip>}
                                {this.state.editId == item.id && <Tooltip title='Lưu' arrow>
                                    <button className='btn btn-success' onClick={e => {
                                        e.preventDefault();
                                        this.handleUpdate(item);
                                    }}>
                                        <i className='fa fa-lg fa-check' />
                                    </button>
                                </Tooltip>}</>}
                            {(permission.write || permission.manage) && item.phong && <Tooltip title='Điều chỉnh' arrow>
                                <button className='btn btn-info' onClick={e => e.preventDefault() || this.modal.show(item)}>
                                    <i className='fa fa-lg fa-cog' />
                                </button>
                            </Tooltip>}
                            {(permission.write || permission.manage) && item.phong && <Tooltip title='Xóa' arrow>
                                <button className='btn btn-danger' onClick={e => e.preventDefault() || this.delete(item)}>
                                    <i className='fa fa-lg fa-trash' />
                                </button>
                            </Tooltip>}
                        </TableCell>
                        <TableCell type='date' dateFormat='dd/mm/yyyy' content={item.ngayBatDau} />
                        <TableCell type='date' dateFormat='dd/mm/yyyy' content={item.ngayKetThuc} />
                        <TableCell content={item.tenKhoaDangKy?.getFirstLetters().toUpperCase()} />
                        <TableCell style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }} content={<>{item.maNganh} <br /> {item.tenNganh?.getFirstLetters()}</>} />
                        <TableCell style={{ whiteSpace: 'nowrap' }} content={`${item.trinhDo || ''} ${(item.hoGiangVien || '').normalizedName()} ${(item.tenGiangVien || '').normalizedName()}`} />
                    </tr >);
            }
        });

        return this.renderPage({
            icon: 'fa fa-calendar',
            title: 'Thời khoá biểu',
            breadcrumb: [
                <Link key={0} to='/user/dao-tao'>Đào tạo</Link>,
                'Thời khoá biểu'
            ],
            content: <>
                {this.state.thoiGianPhanCong && this.state.thoiGianPhanCong.length ? <div className='tile'>{this.renderThoiGianPhanCong(this.state.thoiGianPhanCong)}</div> : null}
                <div className='tile'>{table}</div>
                <Pagination style={{ marginLeft: '70px' }} {...{ pageNumber, pageSize, pageTotal, totalItem, pageCondition }}
                    getPage={this.props.getDtThoiKhoaBieuPage} />
                <AdjustModal ref={e => this.modal = e} quanLyKhoa={permission.manage}
                    update={this.props.updateDtThoiKhoaBieuCondition}
                />
                <AutoGenSchedModal ref={e => this.autoGen = e} permission={permission} />
                <ThoiGianPhanCongGiangDay ref={e => this.thoiGianModal = e} create={this.props.createDtThoiGianPhanCong} />
                <AddingModal ref={e => this.addingModal = e} create={this.props.createDtThoiKhoaBieu} />
                {permission.write && <CirclePageButton type='custom' customClassName='btn-danger' customIcon='fa fa-lg fa-calendar' tooltip='Tạo thời khóa biểu cho danh sách hiện tại' onClick={e => e.preventDefault()
                    || this.autoGen.show()} style={{ marginRight: '180px' }} />}
                {permission.write && <CirclePageButton type='custom' customClassName='btn-warning' customIcon='fa-thumb-tack' tooltip='Tạo thời gian phân công giảng dạy' onClick={e => e.preventDefault()
                    || this.thoiGianModal.show()} style={{ marginRight: '120px' }} />}
            </>,
            backRoute: '/user/dao-tao',
            advanceSearch: <div className='row'>
                <FormSelect ref={e => this.namFilter = e} className='col-md-2' placeholder='Năm đào tạo' data={SelectAdapter_DtCauTrucKhungDaoTao} onChange={value => this.setState({ filter: { ...this.state.filter, idNamDaoTao: value?.id } })} allowClear />
                <FormSelect ref={e => this.hocKyFilter = e} className='col-md-2' placeholder='Học kỳ' data={dataHocKy} onChange={value => this.setState({ filter: { ...this.state.filter, hocKy: value?.id } })} allowClear />
                <FormSelect ref={e => this.bacDaoTaoFilter = e} className='col-md-2' placeholder='Bậc' data={SelectAdapter_DmSvBacDaoTao} onChange={value => this.setState({ filter: { ...this.state.filter, bacDaoTaoFilter: value?.id } })} allowClear />
                <FormSelect ref={e => this.loaiHinhDaoTaoFilter = e} className='col-md-2' placeholder='Hệ' data={SelectAdapter_DmSvLoaiHinhDaoTaoFilter} onChange={value => this.setState({ filter: { ...this.state.filter, loaiHinhDaoTaoFilter: value?.id } })} allowClear />

                <FormSelect ref={e => this.phongFilter = e} className='col-md-2' placeholder='Phòng' data={SelectAdapter_DmPhong} onChange={value => this.setState({ filter: { ...this.state.filter, phongFilter: value?.id } })} allowClear />
                <FormSelect ref={e => this.thuFilter = e} className='col-md-2' placeholder='Thứ' data={dataThu} onChange={value => this.setState({ filter: { ...this.state.filter, thuFilter: value?.id } })} allowClear />
                <FormSelect ref={e => this.khoaFilter = e} className='col-md-4' placeholder='Khoa/Bộ môn' data={SelectAdapter_DmDonVi} onChange={value => this.setState({ filter: { ...this.state.filter, donVi: value?.id } })} allowClear />
                <FormSelect ref={e => this.giangVienFilter = e} className='col-md-4' data={SelectAdapter_FwCanBoGiangVien} placeholder='Giảng viên' onChange={value => this.setState({ filter: { ...this.state.filter, giangVienFilter: value?.id } })} allowClear />
                <FormSelect ref={e => this.monHocFilter = e} data={SelectAdapter_DmMonHocAll()} className='col-md-4' placeholder='Môn học' onChange={value => this.setState({ filter: { ...this.state.filter, monHocFilter: value?.id } })} allowClear />
                <div style={{ display: 'flex', justifyContent: 'end' }} className='form-group col-md-12'>
                    <button className='btn btn-secondary' onClick={
                        e => e.preventDefault() || this.changeAdvancedSearch(true)} style={{ marginRight: '15px' }}>
                        <i className='fa fa-lg fa-times' /> Reset
                    </button>
                    <button className='btn btn-success' onClick={e => e.preventDefault() || this.changeAdvancedSearch()}>
                        <i className='fa fa-lg fa-search-plus' /> Tìm
                    </button>
                </div>
            </div>,
            onCreate: permission.write ? (e) => e.preventDefault() || this.addingModal.show() : null,
            onExport: permission.export ? (e) => e.preventDefault() || T.download(`/api/dao-tao/thoi-khoa-bieu/download-excel?filter=${T.stringify(this.state.filter)}`, 'THOIKHOABIEU.xlsx') : null,
        });
    }
}

const mapStateToProps = state => ({ system: state.system, dtThoiKhoaBieu: state.daoTao.dtThoiKhoaBieu });
const mapActionsToProps = { getDmPhongAll, getDmDonViAll, getDtThoiKhoaBieuPage, createDtThoiKhoaBieu, updateDtThoiKhoaBieu, updateDtThoiKhoaBieuCondition, deleteDtThoiKhoaBieu, initSchedule, createDtThoiGianPhanCong };
export default connect(mapStateToProps, mapActionsToProps)(DtThoiKhoaBieuPage);
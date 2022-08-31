import React from 'react';
import { connect } from 'react-redux';
import { getDtThoiKhoaBieuPage, createDtThoiKhoaBieu, updateDtThoiKhoaBieu, updateDtThoiKhoaBieuCondition, deleteDtThoiKhoaBieu, initSchedule } from './redux';
import { Link } from 'react-router-dom';
import { getDmDonViAll, SelectAdapter_DmDonVi, SelectAdapter_DmDonViFaculty_V2 } from 'modules/mdDanhMuc/dmDonVi/redux';
import { createDtThoiGianPhanCong } from '../dtThoiGianPhanCong/redux';
import { SelectAdapter_DmMonHocAll } from '../dmMonHoc/redux';
import { getDmPhongAll, SelectAdapter_DmPhong } from 'modules/mdDanhMuc/dmPhong/redux';
import { AdminModal, AdminPage, FormDatePicker, FormSelect, FormTextBox, renderTable, TableCell } from 'view/component/AdminPage';
import Pagination from 'view/component/Pagination';
import { Tooltip } from '@mui/material';
import T from 'view/js/common';
import { SelectAdapter_FwCanBoGiangVien } from 'modules/mdTccb/tccbCanBo/redux';
import { SelectAdapter_DtCauTrucKhungDaoTao } from '../dtCauTrucKhungDaoTao/redux';
import { SelectAdapter_DmSvLoaiHinhDaoTaoFilter } from 'modules/mdDanhMuc/dmSvLoaiHinhDaoTao/redux';
import AutoGenSchedModal from './autoGenSchedModal';
import AddingModal from './addModal';
import { getDtNganhDaoTaoAll } from '../dtNganhDaoTao/redux';
import { SelectAdapter_DtDanhSachChuyenNganh } from '../dtDanhSachChuyenNganh/redux';
import { getDmCaHocAll } from 'modules/mdDanhMuc/dmCaHoc/redux';
const dataThu = [2, 3, 4, 5, 6, 7],
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
class AdjustModal extends AdminModal {
    onShow = (item) => {
        let { id, maMonHoc, tenMonHoc, nhom, tenKhoaBoMon, phong, thu, tietBatDau, soTiet, listGiangVien, listTroGiang } = item;
        this.setState({ id, soTiet });
        this.monHoc.value(maMonHoc + ': ' + T.parse(tenMonHoc, { vi: '' }).vi);
        this.nhom.value(nhom);
        this.khoa.value(tenKhoaBoMon);
        this.phong.value(phong);
        this.thu.value(thu);
        this.tietBatDau.value(tietBatDau);
        this.giangVien.value(listGiangVien?.split(',').map(item => item.split('_')[0]));
        this.troGiang.value(listTroGiang?.split(',').map(item => item.split('_')[0]));
    }
    onSubmit = (e) => {
        e.preventDefault();
        let data = {
            phong: this.phong.value(),
            thu: this.thu.value(),
            tietBatDau: this.tietBatDau.value(),
            soTiet: this.state.soTiet
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
            let giangVien = this.giangVien.value(), gvData = this.giangVien.data(),
                troGiang = this.troGiang.value(), tgData = this.troGiang.data(),
                duplicateGv = [];
            gvData.filter(v => troGiang.includes(v.id)).forEach(item => !duplicateGv.includes(item.text) && duplicateGv.push(item.text));
            tgData.filter(v => giangVien.includes(v.id)).forEach(item => !duplicateGv.includes(item.text) && duplicateGv.push(item.text));

            if (duplicateGv.length > 0) {
                T.confirm('Trùng giảng viên và trợ giảng', 'Giảng viên <b>' + duplicateGv.join(', ') + '</b> này có vừa là giảng viên vừa là trợ giảng. Bạn có muốn tiếp tục cập nhật thông tin?', 'warning', 'true', isConfirm => {
                    if (isConfirm) {
                        data.giangVien = this.giangVien.value();
                        data.troGiang = this.troGiang.value();

                        this.props.update(this.state.id, data, (result) => {
                            if (result.item) {
                                this.hide();
                            }
                        });
                    }
                });
            }

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
                <FormSelect ref={e => this.tietBatDau = e} className='form-group col-md-4' label='Tiết bắt đầu' data={this.props.dataTiet} readOnly={quanLyKhoa} />
                <FormSelect ref={e => this.giangVien = e} className='form-group col-md-12' data={SelectAdapter_FwCanBoGiangVien} label='Chọn giảng viên' multiple={true} readOnly={!quanLyKhoa} />
                <FormSelect ref={e => this.troGiang = e} className='form-group col-md-12' data={SelectAdapter_FwCanBoGiangVien} label='Chọn trợ giảng' multiple={true} readOnly={!quanLyKhoa} />
            </div>
        });
    }
}
class DtThoiKhoaBieuPage extends AdminPage {
    check = {}
    state = { page: null, isEdit: {}, sucChua: {}, filter: {}, idNamDaoTao: '', hocKy: '' }
    componentDidMount() {
        this.props.getDmCaHocAll(items => {
            items = [...new Set(items.map(item => parseInt(item.ten)))];
            this.setState({ dataTiet: items });
        });
        getDtNganhDaoTaoAll(items => {
            let dataNganh = items.map(item => ({ id: item.maNganh, text: `${item.maNganh}: ${item.tenNganh}` }));
            this.setState({ dataNganh });
        });
        T.ready('/user/dao-tao', () => {
            T.onSearch = (searchText) => this.getPage(undefined, undefined, searchText || '');
            T.showSearchBox(true);
            this.setState({ idNamDaoTao: '', hocKy: '', dataKhoaSinhVien: Array.from({ length: 4 }, (_, i) => new Date().getFullYear() - i) }, () => { this.khoaSinhVienFilter.value(''); this.changeAdvancedSearch(true); });
        });
    }

    changeAdvancedSearch = (isInitial = false) => {
        let { pageNumber, pageSize, pageCondition } = this.props && this.props.dtThoiKhoaBieu && this.props.dtThoiKhoaBieu.page ? this.props.dtThoiKhoaBieu.page : { pageNumber: 1, pageSize: 50, pageCondition: '' };
        const cookie = T.updatePage('pageDtThoiKhoaBieu');
        let { filter } = cookie;
        if (!filter || (typeof filter == 'string' && filter.includes('%'))) filter = {};
        if (isInitial) {
            this.showAdvanceSearch();
            ['namFilter', 'hocKyFilter', 'khoaFilter', 'loaiHinhDaoTaoFilter', 'phongFilter', 'thuFilter', 'monHocFilter', 'khoaSinhVienFilter'].forEach(e => {
                if (filter[e]) {
                    this[e].value(filter[e]);
                }
            });
            this.setState({ filter }, () => this.getPage(pageNumber, pageSize, pageCondition));
        } else {
            // ['namFilter', 'hocKyFilter', 'khoaFilter', 'loaiHinhDaoTaoFilter', 'phongFilter', 'thuFilter', 'monHocFilter', 'khoaSinhVienFilter'].forEach(e => filter[e] = this[e].value());
            this.getPage(pageNumber, pageSize, pageCondition, page => {
                T.notify(`Tìm thấy ${page.totalItem} kết quả`, 'info');
                this.hideAdvanceSearch();
            });
        }
    }

    resetAdvancedSearch = () => {
        ['namFilter', 'hocKyFilter', 'khoaFilter', 'loaiHinhDaoTaoFilter', 'phongFilter', 'thuFilter', 'monHocFilter', 'khoaSinhVienFilter'].forEach(e => this[e].value(''));
        this.setState({ filter: {} }, () => {
            this.getPage(1, 50, '', () => {
                this.hideAdvanceSearch();
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
                <FormSelect ref={e => this.phong = e} style={{ marginBottom: '0' }} data={SelectAdapter_DmPhong} placeholder='Phòng' />
            } />
            <TableCell style={{ textAlign: 'center' }} content={
                <FormSelect ref={e => this.thu = e} style={{ marginBottom: '0' }} data={dataThu} minimumResultsForSearch={-1} placeholder='Thứ' />
            } />
            <TableCell style={{ textAlign: 'center' }} content={
                <FormSelect ref={e => this.tietBatDau = e} style={{ marginBottom: '0' }} data={this.state.dataTiet} minimumResultsForSearch={-1} placeholder='Tiết BĐ' />
            } />
            <TableCell style={{ textAlign: 'center' }} content={
                <FormTextBox type='number' ref={e => this.soTiet = e} style={{ width: '70px', marginBottom: '0', textAlign: 'right' }} min={1} max={5} />
            } />
            <TableCell content={
                <FormTextBox type='number' ref={e => this.soLuongDuKien = e} style={{ marginBottom: '0', width: '70px', }} />
            } />

            <TableCell content={
                <>
                    <FormSelect ref={e => this.maNganh = e} style={{ marginBottom: '0', width: '400px' }} data={this.state.dataNganh} multiple placeholder='Ngành' />
                    <FormSelect ref={e => this.chuyenNganh = e} style={{ marginBottom: '0', width: '400px' }} data={SelectAdapter_DtDanhSachChuyenNganh()} multiple placeholder='Chuyên ngành' />
                </>
            } />

        </>
    );

    handleUpdate = (item) => {
        let curData = {
            phong: this.phong.value(),
            thu: this.thu.value(),
            tietBatDau: this.tietBatDau.value(),
            soTietBuoi: this.soTiet.value(),
            soLuongDuKien: this.soLuongDuKien.value(),
            maNganh: this.maNganh.value(),
            chuyenNganh: this.chuyenNganh.value()
        };
        this.props.updateDtThoiKhoaBieuCondition(item.id, curData, () => {
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
            this.maNganh.value(item.maNganh ? item.maNganh.split(',') : '');
            this.chuyenNganh.value(item.maChuyenNganh ? item.maChuyenNganh.split(',') : '');
        });
    }

    handleAutoGen = (e) => {
        e?.preventDefault();
        T.confirm('Lưu ý', 'Hãy chắc chắn rằng bạn đã chọn mở các môn theo đúng đợt', 'warning', true, isConfirm => isConfirm && this.props.history.push('/user/dao-tao/thoi-khoa-bieu/auto-generate'));
    }
    render() {
        const permission = this.getUserPermission('dtThoiKhoaBieu', ['read', 'write', 'delete', 'manage', 'export']);
        const { pageNumber, pageSize, pageTotal, totalItem, pageCondition, list } = this.props.dtThoiKhoaBieu?.page || { pageNumber: 1, pageSize: 1, pageTotal: 1, totalItem: 1, pageCondition: '', list: [] };
        let table = renderTable({
            emptyTable: 'Không có dữ liệu thời khóa biểu',
            getDataSource: () => list, stickyHead: true,
            header: 'thead-light',
            className: 'table-fix-col',
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', textAlign: 'right' }}>#</th>
                    <th style={{ width: 'auto' }}>Mở</th>
                    <th style={{ width: '25%', textAlign: 'center' }}>Mã</th>
                    <th style={{ width: '50%', }}>Môn học</th>
                    <th style={{ width: 'auto' }}>Tự chọn</th>
                    <th style={{ width: 'auto', textAlign: 'center' }}>Tổng tiết</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Phòng</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Thứ</th>
                    <th style={{ width: 'auto', textAlign: 'center' }}>Tiết bắt đầu</th>
                    <th style={{ width: 'auto', textAlign: 'center' }}>Số tiết</th>
                    <th style={{ width: 'auto' }}>SLDK</th>
                    <th style={{ width: 'auto' }}>Ngành<br />Chuyên ngành</th>
                    <th style={{ width: 'auto', textAlign: 'center' }}>Ngày bắt đầu</th>
                    <th style={{ width: 'auto', textAlign: 'center' }}>Ngày kết thúc</th>
                    <th style={{ width: '25%', whiteSpace: 'nowrap' }}>Khoa <br />Bộ môn</th>
                    <th style={{ width: 'auto' }}>Giảng viên</th>
                    <th style={{ width: 'auto' }}>Trợ giảng</th>
                    <th style={{ width: 'auto', textAlign: 'center' }}>Bậc</th>
                    <th style={{ width: 'auto', textAlign: 'center' }}>Hệ</th>
                    <th style={{ width: 'auto', textAlign: 'right' }}>Khoá SV</th>
                    <th style={{ width: 'auto', textAlign: 'center' }}>Năm học</th>
                    <th style={{ width: 'auto', textAlign: 'right' }}>Học kỳ</th>
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Thao tác</th>
                </tr>),
            renderRow: (item, index) => {
                let indexOfItem = (pageNumber - 1) * pageSize + index + 1;
                let official = item.ngayBatDau && item.ngayKetThuc;
                return (
                    <tr key={index} >
                        <TableCell style={{ textAlign: 'right' }} content={indexOfItem} />
                        {official ? <TableCell type='text' style={{ textAlign: 'center' }} content={'x'} /> :
                            <TableCell type='checkbox' style={{ textAlign: 'center' }} content={item.isMo} onChanged={value => this.handleCheck(value, item)} permission={permission} />}

                        <TableCell style={{ width: 'auto', textAlign: 'center' }} content={`${item.maMonHoc}_${item.nhom}`} />
                        <TableCell style={{ whiteSpace: 'nowrap' }} content={
                            <Tooltip title={item.tenKhoaBoMon} arrow placement='right-end'>
                                <span style={{ color: 'blue' }}>{T.parse(item.tenMonHoc, { vi: '' }).vi}</span>
                            </Tooltip>
                        } />
                        {official ? <TableCell style={{ textAlign: 'center' }} content={item.loaiMonHoc ? 'x' : ''} />
                            : <TableCell type='checkbox' onChanged={value => this.handleCheckLoaiMonHoc(value, item)} content={item.loaiMonHoc} permission={permission} />}

                        <TableCell style={{ textAlign: 'center', whiteSpace: 'nowrap' }} content={item.tongTiet} />
                        {
                            this.state.editId == item.id ? this.elementEdit() : <>
                                <TableCell style={{ width: 'auto', whiteSpace: 'nowrap' }} content={
                                    <Tooltip title={item.sucChua || ''} arrow ><span>{item.phong}</span></Tooltip>} />
                                <TableCell type='number' content={item.thu} />
                                <TableCell type='number' content={item.tietBatDau} />
                                <TableCell type='number' content={item.soTiet} />
                                <TableCell type='number' content={item.soLuongDuKien} />
                                <TableCell style={{ width: 'auto', whiteSpace: 'nowrap' }} content={<>{
                                    item.tenNganh?.split('&&').map((nganh, i) => <span key={i}><Tooltip title={nganh.split('%')[0]} arrow><span>{nganh.split('%')[1]}</span></Tooltip>{(i + 1) % 3 == 0 ? <br /> : (i < item.tenNganh?.split('&&').length - 1 ? ', ' : '.')}</span>)}
                                    {item.tenChuyenNganh && <br />}
                                    {item.tenChuyenNganh?.split('&&').map((nganh, i) => <span key={i}><Tooltip title={`${nganh.split('%')[0]}_${nganh.split('%')[1].getFirstLetters()}`} arrow><span>{nganh.split('%')[1]}</span></Tooltip>{(i + 1) % 3 == 0 ? <br /> : (i < item.tenChuyenNganh?.split('&&').length - 1 ? ', ' : '.')}</span>)}
                                </>} />
                            </>
                        }
                        <TableCell type='date' dateFormat='dd/mm/yyyy' style={{ textAlign: 'center' }} content={item.ngayBatDau} />
                        <TableCell type='date' dateFormat='dd/mm/yyyy' style={{ textAlign: 'center' }} content={item.ngayKetThuc} />
                        <TableCell style={{ textAlign: 'center' }} content={item.tenKhoaDangKy?.getFirstLetters().toUpperCase()} />
                        <TableCell style={{ whiteSpace: 'pre' }} content={item.listGiangVien?.split(',').map(gvItem => gvItem.split('_')[1]).join('\n')} />
                        <TableCell style={{ whiteSpace: 'pre' }} content={item.listTroGiang?.split(',').map(tgItem => tgItem.split('_')[1]).join('\n')} />
                        <TableCell style={{ textAlign: 'center' }} content={item.bacDaoTao} />
                        <TableCell style={{ textAlign: 'center' }} content={item.loaiHinhDaoTao} />
                        <TableCell style={{ textAlign: 'right' }} content={item.khoaSinhVien} />
                        <TableCell style={{ textAlign: 'center', whiteSpace: 'nowrap' }} content={item.namDaoTao} />
                        <TableCell type='number' content={item.hocKy} />
                        <TableCell type='buttons' style={{ textAlign: 'center' }} content={item} permission={permission}>
                            {/* {(permission.write || permission.manage) && !item.phong && <>
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
                                </Tooltip>}</>} */}
                            {(permission.write || permission.manage) && (item.phong && item.thu && item.tietBatDau) && <Tooltip title='Điều chỉnh' arrow>
                                <button className='btn btn-info' onClick={e => e.preventDefault() || this.modal.show(item)}>
                                    <i className='fa fa-lg fa-cog' />
                                </button>
                            </Tooltip>}
                            {(permission.write || permission.manage) && <Tooltip title='Xóa' arrow>
                                <button className='btn btn-danger' onClick={e => e.preventDefault() || this.delete(item)}>
                                    <i className='fa fa-lg fa-trash' />
                                </button>
                            </Tooltip>}
                        </TableCell>
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
                {/* {this.state.thoiGianPhanCong && this.state.thoiGianPhanCong.length ? <div className='tile'>{this.renderThoiGianPhanCong(this.state.thoiGianPhanCong)}</div> : null} */}
                <div className='tile'>{table}</div>
                <Pagination style={{ marginLeft: '70px' }} {...{ pageNumber, pageSize, pageTotal, totalItem, pageCondition }}
                    getPage={this.props.getDtThoiKhoaBieuPage} />
                <AdjustModal ref={e => this.modal = e} quanLyKhoa={permission.manage}
                    update={this.props.updateDtThoiKhoaBieuCondition} dataTiet={this.state.dataTiet}
                />
                <AutoGenSchedModal ref={e => this.autoGen = e} permission={permission} filter={this.state.filter} />
                <ThoiGianPhanCongGiangDay ref={e => this.thoiGianModal = e} create={this.props.createDtThoiGianPhanCong} />
                <AddingModal ref={e => this.addingModal = e} create={this.props.createDtThoiKhoaBieu} disabledClickOutside filter={this.state.filter} />
            </>,
            backRoute: '/user/dao-tao',
            advanceSearch: <div className='row'>
                <FormSelect ref={e => this.namFilter = e} className='col-md-2' placeholder='Năm đào tạo' data={SelectAdapter_DtCauTrucKhungDaoTao} onChange={value => this.setState({ filter: { ...this.state.filter, idNamDaoTao: value?.id } })} allowClear />
                <FormSelect ref={e => this.khoaSinhVienFilter = e} className='col-md-2' placeholder='Khoá' data={this.state.dataKhoaSinhVien || []} onChange={value => this.setState({ filter: { ...this.state.filter, khoaSinhVienFilter: value?.id } })} allowClear />
                <FormSelect ref={e => this.hocKyFilter = e} className='col-md-2' placeholder='Học kỳ' data={dataHocKy} onChange={value => this.setState({ filter: { ...this.state.filter, hocKy: value?.id } })} allowClear />
                {/* <FormSelect ref={e => this.bacDaoTaoFilter = e} className='col-md-2' placeholder='Bậc' data={SelectAdapter_DmSvBacDaoTao} onChange={value => this.setState({ filter: { ...this.state.filter, bacDaoTaoFilter: value?.id } })} allowClear /> */}
                <FormSelect ref={e => this.loaiHinhDaoTaoFilter = e} className='col-md-2' placeholder='Hệ' data={SelectAdapter_DmSvLoaiHinhDaoTaoFilter} onChange={value => this.setState({ filter: { ...this.state.filter, loaiHinhDaoTaoFilter: value?.id } })} allowClear />

                <FormSelect ref={e => this.phongFilter = e} className='col-md-2' placeholder='Phòng' data={SelectAdapter_DmPhong} onChange={value => this.setState({ filter: { ...this.state.filter, phongFilter: value?.id } })} allowClear />
                <FormSelect ref={e => this.thuFilter = e} className='col-md-2' placeholder='Thứ' data={dataThu} onChange={value => this.setState({ filter: { ...this.state.filter, thuFilter: value?.id } })} allowClear />
                <FormSelect ref={e => this.khoaFilter = e} className='col-md-4' placeholder='Khoa/Bộ môn' data={SelectAdapter_DmDonVi} onChange={value => this.setState({ filter: { ...this.state.filter, donVi: value?.id } })} allowClear />

                <FormSelect ref={e => this.monHocFilter = e} data={SelectAdapter_DmMonHocAll()} className='col-md-4' placeholder='Môn học' onChange={value => this.setState({ filter: { ...this.state.filter, monHocFilter: value?.id } })} allowClear />
                <div style={{ display: 'flex', justifyContent: 'end' }} className='form-group col-md-12'>
                    <button className='btn btn-secondary' onClick={
                        e => e.preventDefault() || this.resetAdvancedSearch()} style={{ marginRight: '15px' }}>
                        <i className='fa fa-lg fa-times' /> Reset
                    </button>
                    <button className='btn btn-success' onClick={e => e.preventDefault() || this.changeAdvancedSearch()}>
                        <i className='fa fa-lg fa-search-plus' /> Tìm
                    </button>
                </div>
            </div>,
            onCreate: permission.write ? (e) => e.preventDefault() || this.addingModal.show() : null,
            onExport: permission.export ? (e) => e.preventDefault() || T.download(`/api/dao-tao/thoi-khoa-bieu/download-excel?filter=${T.stringify(this.state.filter)}`, 'THOI_KHOA_BIEU.xlsx') : null,
            buttons: permission.write && [
                { className: 'btn-warning', icon: 'fa-calendar', tooltip: 'Xếp thời khoá biểu', onClick: this.handleAutoGen }
            ]
        });
    }
}

const mapStateToProps = state => ({ system: state.system, dtThoiKhoaBieu: state.daoTao.dtThoiKhoaBieu });
const mapActionsToProps = { getDmPhongAll, getDmDonViAll, getDtThoiKhoaBieuPage, createDtThoiKhoaBieu, updateDtThoiKhoaBieu, updateDtThoiKhoaBieuCondition, deleteDtThoiKhoaBieu, initSchedule, createDtThoiGianPhanCong, getDmCaHocAll };
export default connect(mapStateToProps, mapActionsToProps)(DtThoiKhoaBieuPage);
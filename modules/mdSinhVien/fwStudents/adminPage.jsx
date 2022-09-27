import { SelectAdapter_DmDanTocV2 } from 'modules/mdDanhMuc/dmDanToc/redux';
import { ajaxSelectTinhThanhPho } from 'modules/mdDanhMuc/dmDiaDiem/reduxTinhThanhPho';
import { SelectAdapter_DmDonViFaculty_V2 } from 'modules/mdDanhMuc/dmDonVi/redux';
import { SelectAdapter_DmGioiTinhV2 } from 'modules/mdDanhMuc/dmGioiTinh/redux';
import { SelectAdapter_DmSvLoaiHinhDaoTao } from 'modules/mdDanhMuc/dmSvLoaiHinhDaoTao/redux';
import { SelectAdapter_DmLoaiSinhVienV2 } from 'modules/mdDanhMuc/dmLoaiSinhVien/redux';
import { SelectAdapter_DmQuocGia } from 'modules/mdDanhMuc/dmQuocGia/redux';
import { SelectAdapter_DmTinhTrangSinhVienV2 } from 'modules/mdDanhMuc/dmTinhTrangSinhVien/redux';
import { SelectAdapter_DmTonGiaoV2 } from 'modules/mdDanhMuc/dmTonGiao/redux';
import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { AdminModal, AdminPage, FormCheckbox, FormDatePicker, FormSelect, FormTextBox, getValue, renderDataTable, TableCell, TableHead } from 'view/component/AdminPage';
import Pagination from 'view/component/Pagination';
import { getStudentsPage, loginStudentForTest, adminDownloadSyll, updateStudentAdmin } from './redux';
import { Tooltip } from '@mui/material';
import T from 'view/js/common';
import { AdminBhytModal } from 'modules/mdKeHoachTaiChinh/tcHocPhi/adminBHYTpage';
import { getMssvBaoHiemYTe, createMssvBaoHiemYTe } from '../svBaoHiemYTe/redux';

export class LoginToTestModal extends AdminModal {

    onSubmit = (e) => {
        e && e.preventDefault();
        const data = {
            email: getValue(this.email),
            pass: getValue(this.password)
        };
        this.props.loginStudentForTest(data);
    }
    render = () => {
        return this.renderModal({
            title: 'Đăng nhập tài khoản Test',
            body: <div className='row'>
                <FormTextBox type='email' ref={e => this.email = e} label='Email test' className='col-md-12' />
                <FormTextBox type='password' ref={e => this.password = e} label='Mật khẩu' className='col-md-12' />
            </div>
        });
    }
}
class AdminStudentsPage extends AdminPage {
    defaultSortTerm = 'ten_ASC'
    state = { filter: {}, sortTerm: 'ten_ASC' };
    componentDidMount() {
        T.ready('/user/students', () => {
            T.clearSearchBox();
            T.onSearch = (searchText) => this.getStudentsPage(undefined, undefined, searchText || '');
            T.showSearchBox(() => this.changeAdvancedSearch());
            this.changeAdvancedSearch();
        });
    }

    changeAdvancedSearch = (isReset = false) => {
        let { pageNumber, pageSize, pageCondition } = this.props.sinhVien && this.props.sinhVien.page ? this.props.sinhVien.page : { pageNumber: 1, pageSize: 50, pageCondition: '' };
        this.getStudentsPage(pageNumber, pageSize, pageCondition, page => page && this.hideAdvanceSearch());
        const filter = T.updatePage('pageStudentsAdmin').filter;
        Object.keys(this).forEach(key => {
            if (filter[key]) {
                if (['toNhapHoc', 'fromNhapHoc'].includes(key)) this[key].value(filter[key]);
                else this[key].value(filter[key].toString().split(','));
            }

        });
        if (isReset) {
            Object.keys(this).forEach(key => {
                if (this[key].value && this[key].value()) this[key].value('');
            });
        }
    }

    getStudentsPage = (pageNumber, pageSize, pageCondition, done) => this.props.getStudentsPage(pageNumber, pageSize, pageCondition, this.state.filter, this.state?.sortTerm || this.defaultSortTerm, done);

    delete = (item) => {
        T.confirm('Xóa sinh viên', 'Xóa sinh viên này?', 'warning', true, isConfirm => {
            isConfirm && this.props.deleteSinhVienAdmin(item.mssv, false, null, error => {
                if (error) T.notify(error.message ? error.message : 'Xoá sinh viên lỗi!', 'danger');
                else T.alert('Xoá sinh viên thành công!', 'success', false, 800);
            });
        });
    }

    downloadExcel = () => {
        T.handleDownload(`/api/students/download-excel?filter=${T.stringify(this.state.filter)}`, 'STUDENTS_DATA.xlsx');
    }

    downloadImage = () => {
        T.handleDownload('/api/students/download-image-card', 'ANH_THE.zip');
    }

    render() {
        let permission = this.getUserPermission('student', ['read', 'write', 'delete', 'export']);
        let developer = this.getUserPermission('developer', ['login']);
        let { pageNumber, pageSize, pageTotal, totalItem, pageCondition, list } = this.props.sinhVien && this.props.sinhVien.page ?
            this.props.sinhVien.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, pageCondition: {}, list: null };

        let table = renderDataTable({
            emptyTable: 'Không có dữ liệu sinh viên',
            stickyHead: true,
            header: 'thead-light',
            className: this.state.quickAction ? 'table-fix-col' : '',
            data: list,
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', textAlign: 'right' }}>#</th>
                    <TableHead style={{ width: 'auto' }} content='MSSV' keyCol='mssv' onClick={sortTerm => this.setState({ sortTerm }, () => this.getStudentsPage(pageNumber, pageSize, pageCondition))} />
                    <TableHead content='Họ và tên lót' keyCol='ho' onClick={sortTerm => this.setState({ sortTerm }, () => this.getStudentsPage(pageNumber, pageSize, pageCondition))} />
                    {/* <th style={{ width: '50%', whiteSpace: 'nowrap' }}>Họ và tên lót</th> */}
                    <TableHead content='Tên' keyCol='ten' onClick={sortTerm => this.setState({ sortTerm }, () => this.getStudentsPage(pageNumber, pageSize, pageCondition))} />
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Giới tính</th>
                    <TableHead content='Ngày sinh' keyCol='ngaySinh' onClick={sortTerm => this.setState({ sortTerm }, () => this.getStudentsPage(pageNumber, pageSize, pageCondition))} />
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Nơi sinh</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Khoa</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Mã ngành</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Tên ngành</th>
                    <TableHead content='Khoá sinh viên' keyCol='namTuyenSinh' onClick={sortTerm => this.setState({ sortTerm }, () => this.getStudentsPage(pageNumber, pageSize, pageCondition))} />
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Hệ</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Email cá nhân</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Email sinh viên</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>SĐT cá nhân</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Dân tộc</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Tôn giáo</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Quốc tịch</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Thường trú</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Họ tên liên lạc</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Địa chỉ liên lạc</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>SĐT liên lạc</th>
                    <TableHead content='Ngày nhập học' keyCol='ngayNhapHoc' onClick={sortTerm => this.setState({ sortTerm }, () => this.getStudentsPage(pageNumber, pageSize, pageCondition))} />
                    <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>Tình trạng</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Thao tác</th>
                </tr>
            ),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell type='number' content={(pageNumber - 1) * pageSize + index + 1} />
                    <TableCell type='link' url={`/user/students/profile/${item.mssv}`} style={{ whiteSpace: 'nowrap' }} content={item.mssv} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.ho || ''} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.ten || ''} />
                    <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={item.gioiTinh ? (item.gioiTinh == 1 ? 'Nam' : 'Nữ') : ''} />
                    <TableCell type='date' dateFormat='dd/mm/yyyy' style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={item.ngaySinh} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.tinhNoiSinh} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.tenKhoa || ''} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.maNganh || ''} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.tenNganh || ''} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.namTuyenSinh || ''} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.loaiHinhDaoTao || ''} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.emailCaNhan || ''} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.emailTruong || ''} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.dienThoaiCaNhan || ''} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.danToc || ''} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.tonGiao || ''} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.quocTich || ''} />
                    <TableCell type='text' contentClassName='multiple-lines-5' content={(item.soNhaThuongTru ? item.soNhaThuongTru + ', ' : '')
                        + (item.xaThuongTru ? item.xaThuongTru + ', ' : '')
                        + (item.huyenThuongTru ? item.huyenThuongTru + ', ' : '')
                        + (item.tinhThuongTru ? item.tinhThuongTru : '')} />
                    <TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={item.hoTenNguoiLienLac || ''} />
                    <TableCell type='text' contentClassName='multiple-lines-5' content={(item.soNhaLienLac ? item.soNhaLienLac + ', ' : '')
                        + (item.xaLienLac ? item.xaLienLac + ', ' : '')
                        + (item.huyenLienLac ? item.huyenLienLac + ', ' : '')
                        + (item.tinhLienLac ? item.tinhLienLac : '')} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.sdtNguoiLienLac || ''} />
                    <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={item.ngayNhapHoc ? (item.ngayNhapHoc == -1 ? 'Đang chờ nhập học'
                        : (item.ngayNhapHoc.toString().length > 10 ? T.dateToText(new Date(item.ngayNhapHoc), 'dd/mm/yyyy') : '')) : ''} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.tinhTrang || ''} />
                    <TableCell type='buttons' style={{ textAlign: 'center' }} content={item} permission={permission}
                        onDelete={this.delete}>
                        <Tooltip title={item.canEdit ? 'Khoá edit' : 'Cho phép edit'}>
                            <button className={item.canEdit ? 'btn btn-secondary' : 'btn btn-success'} type='button' onClick={e => e.preventDefault() ||
                                this.props.updateStudentAdmin(item.mssv, { canEdit: Number(!item.canEdit) })
                            }>
                                <i className={item.canEdit ? 'fa fa-lg fa-times' : 'fa fa-lg fa-check'} />
                            </button>
                        </Tooltip>
                        <Tooltip title='Tải SYLL'>
                            <button style={{ display: parseInt(item.namTuyenSinh) >= new Date().getFullYear() ? '' : 'none' }} className='btn btn-warning' type='button' onClick={e => e.preventDefault() ||
                                this.props.adminDownloadSyll(item.mssv, item.namTuyenSinh)
                            }>
                                <i className='fa fa-lg fa-arrow-down' />
                            </button>
                        </Tooltip>
                        {developer.login && <Tooltip title='BHYT'>
                            <button className='btn btn-secondary' type='button' onClick={e => {
                                e.preventDefault();
                                this.props.getMssvBaoHiemYTe({ mssv: item.mssv }, (bhyt) => {
                                    if (!bhyt) return T.notify('Sinh viên chưa đăng ký bảo hiểm y tế');
                                    this.bhytModal.initBhyt(bhyt.dienDong);
                                    this.bhytModal.show(item.mssv);
                                });
                            }}>
                                <i className='fa fa-lg fa-cog' />
                            </button>
                        </Tooltip>}
                    </TableCell>
                </tr>
            )
        });

        return this.renderPage({
            title: 'Danh sách sinh viên',
            icon: 'fa fa-users',
            breadcrumb: [<Link key={0} to='/user/students'>Sinh viên</Link>,
                'Danh sách sinh viên'
            ],
            advanceSearch: <>
                <div className='row'>
                    <FormSelect multiple ref={e => this.listFaculty = e} data={SelectAdapter_DmDonViFaculty_V2} label='Lọc theo khoa' className='col-md-4' allowClear onChange={value => {
                        let currentFilter = Object.assign({}, this.state.filter),
                            currentListFaculty = currentFilter.listFaculty?.split(',') || [];
                        if (value.selected) {
                            currentListFaculty.push(value.id);
                        } else currentListFaculty = currentListFaculty.filter(item => item != value.id);
                        this.setState({ filter: { ...currentFilter, listFaculty: currentListFaculty.toString() } });
                    }} />
                    <FormSelect multiple ref={e => this.listLoaiSinhVien = e} data={SelectAdapter_DmLoaiSinhVienV2} label='Lọc theo loại SV' className='col-md-4' allowClear onChange={value => {
                        let currentFilter = Object.assign({}, this.state.filter),
                            currentListLoaiSinhVien = currentFilter.listLoaiSinhVien?.split(',') || [];
                        if (value.selected) {
                            currentListLoaiSinhVien.push(value.id);
                        } else currentListLoaiSinhVien = currentListLoaiSinhVien.filter(item => item != value.id);
                        this.setState({ filter: { ...currentFilter, listLoaiSinhVien: currentListLoaiSinhVien.toString() } });
                    }} />
                    <FormSelect multiple ref={e => this.listTinhTrangSinhVien = e} data={SelectAdapter_DmTinhTrangSinhVienV2} label='Lọc theo tình trạng SV' className='col-md-4' allowClear onChange={value => {
                        let currentFilter = Object.assign({}, this.state.filter),
                            currentListTinhTrangSinhVien = currentFilter.listTinhTrangSinhVien?.split(',') || [];
                        if (value.selected) {
                            currentListTinhTrangSinhVien.push(value.id);
                        } else currentListTinhTrangSinhVien = currentListTinhTrangSinhVien.filter(item => item != value.id);
                        this.setState({ filter: { ...currentFilter, listTinhTrangSinhVien: currentListTinhTrangSinhVien.toString() } });
                    }} />
                    <FormSelect ref={e => this.gender = e} data={SelectAdapter_DmGioiTinhV2} label='Lọc theo giới tính' className='col-md-3' allowClear onChange={value => {
                        if (value) {
                            this.setState({ filter: { ...this.state.filter, gender: value.id } });
                        } else this.setState({ filter: { ...this.state.filter, gender: null } });
                    }} />
                    <FormSelect multiple ref={e => this.listNationality = e} data={SelectAdapter_DmQuocGia} label='Lọc theo quốc tịch' className='col-md-3' allowClear onChange={value => {
                        let currentFilter = Object.assign({}, this.state.filter),
                            currentListNationality = currentFilter.listNationality?.split(',') || [];
                        if (value.selected) {
                            currentListNationality.push(value.id);
                        } else currentListNationality = currentListNationality.filter(item => item != value.id);
                        this.setState({
                            filter: { ...currentFilter, listNationality: currentListNationality.toString() }
                        });
                    }} />
                    <FormSelect multiple ref={e => this.listEthnic = e} data={SelectAdapter_DmDanTocV2} label='Lọc theo dân tộc' className='col-md-3' allowClear onChange={value => {
                        let currentFilter = Object.assign({}, this.state.filter),
                            currentListEthnic = currentFilter.listEthnic?.split(',') || [];
                        if (value.selected) {
                            currentListEthnic.push(value.id);
                        } else currentListEthnic = currentListEthnic.filter(item => item != value.id);
                        this.setState({
                            filter: { ...currentFilter, listEthnic: currentListEthnic.toString() }
                        });
                    }} />
                    <FormSelect multiple ref={e => this.listReligion = e} data={SelectAdapter_DmTonGiaoV2} label='Lọc theo tôn giáo' className='col-md-3' allowClear onChange={value => {
                        let currentFilter = Object.assign({}, this.state.filter),
                            currentListReligion = currentFilter.listReligion?.split(',') || [];
                        if (value.selected) {
                            currentListReligion.push(value.id);
                        } else currentListReligion = currentListReligion.filter(item => item != value.id);
                        this.setState({
                            filter: { ...currentFilter, listReligion: currentListReligion.toString() }
                        });
                    }} />
                    <FormSelect multiple ref={e => this.listFromCity = e} data={ajaxSelectTinhThanhPho} label='Lọc theo tỉnh/thành thường trú' className='col-md-4' allowClear onChange={value => {
                        let currentFilter = Object.assign({}, this.state.filter),
                            currentListFromCity = currentFilter.listFromCity?.split(',') || [];
                        if (value.selected) {
                            currentListFromCity.push(value.id);
                        } else currentListFromCity = currentListFromCity.filter(item => item != value.id);
                        this.setState({
                            filter: { ...currentFilter, listFromCity: currentListFromCity.toString() }
                        });
                    }} />
                    <FormSelect multiple ref={e => this.listLoaiHinhDaoTao = e} data={SelectAdapter_DmSvLoaiHinhDaoTao} label='Lọc theo loại hình đào tạo' className='col-md-4' allowClear onChange={value => {
                        let currentFilter = Object.assign({}, this.state.filter),
                            currentListLoaiHinhDaoTao = currentFilter.listLoaiHinhDaoTao?.split(',') || [];
                        if (value.selected) {
                            currentListLoaiHinhDaoTao.push(value.id);
                        } else currentListLoaiHinhDaoTao = currentListLoaiHinhDaoTao.filter(item => item != value.id);
                        this.setState({
                            filter: { ...currentFilter, listLoaiHinhDaoTao: currentListLoaiHinhDaoTao.toString() }
                        });
                    }} />

                    <FormSelect multiple ref={e => this.listKhoaSinhVien = e} data={[2022, 2021, 2020, 2019, 2018]} label='Lọc theo khoá SV' className='col-md-4' allowClear onChange={value => {
                        let currentFilter = Object.assign({}, this.state.filter),
                            current = currentFilter.listKhoaSinhVien?.split(',') || [];
                        if (value.selected) {
                            current.push(value.id);
                        } else current = current.filter(item => item != value.id);
                        this.setState({
                            filter: { ...currentFilter, listKhoaSinhVien: current.toString() }
                        });
                    }} />
                    <FormDatePicker type='date-mask' ref={e => this.fromNhapHoc = e} label='Ngày nhập học (từ)' onChange={fromNhapHoc => {
                        if (fromNhapHoc && !isNaN(fromNhapHoc.getTime())) this.setState({
                            filter: { ...this.state.filter, fromNhapHoc: fromNhapHoc.setHours(0, 0, 0, 0) }
                        }); else this.setState({
                            filter: { ...this.state.filter, fromNhapHoc: '' }
                        });
                    }} className='col-md-4' />
                    <FormDatePicker type='date-mask' ref={e => this.toNhapHoc = e} label='Ngày nhập học (đến)' className='col-md-4' onChange={toNhapHoc => {
                        if (toNhapHoc && !isNaN(toNhapHoc.getTime())) this.setState({
                            filter: { ...this.state.filter, toNhapHoc: toNhapHoc.setHours(23, 59, 59, 99) }
                        }); else this.setState({
                            filter: { ...this.state.filter, toNhapHoc: '' }
                        });
                    }} />
                </div>
                <div style={{ textAlign: 'right' }}>
                    <button className='btn btn-secondary' onClick={e => e.preventDefault() || this.setState({ filter: {} }, () => this.changeAdvancedSearch(true))} style={{ marginRight: '15px' }}>
                        <i className='fa fa-lg fa-times' />Reset
                    </button>
                    <button className='btn btn-info' onClick={e => e.preventDefault() || this.changeAdvancedSearch()}>
                        <i className='fa fa-lg fa-search-plus' />Tìm kiếm
                    </button>
                </div>
            </>,
            content: <>
                <div className='tile'>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignContent: 'center', marginBottom: '10px' }}>
                        <FormCheckbox label='Thao tác nhanh' onChange={value => this.setState({ quickAction: value })} style={{ marginBottom: '0' }} />
                        <Pagination style={{ position: '', bottom: '', width: '' }} {...{ pageNumber, pageSize, pageTotal, totalItem, pageCondition }}
                            getPage={this.getStudentsPage} pageRange={3} />
                    </div>
                    {table}
                </div>
                <AdminBhytModal ref={e => this.bhytModal = e} createSvBaoHiemYTe={this.props.createMssvBaoHiemYTe} />
                <LoginToTestModal ref={e => this.loginModal = e} loginStudentForTest={this.props.loginStudentForTest} />
            </>
            ,
            backRoute: '/user/students',
            collapse: [
                { icon: 'fa-print', name: 'Export', permission: permission.export, onClick: this.downloadExcel, type: 'success' },
                { icon: 'fa-upload', name: 'Import', permission: developer.login, onClick: () => this.props.history.push('/user/students/import'), type: 'danger' },
                { icon: 'fa-picture-o', name: 'Tải ảnh thẻ', permission: permission.export, onClick: this.downloadImage, type: 'info', wait: this.state.waitForDownload }
            ]
        });
    }
}
const mapStateToProps = state => ({ system: state.system, sinhVien: state.sinhVien.dataSinhVien });
const mapActionsToProps = {
    getStudentsPage, loginStudentForTest, adminDownloadSyll, updateStudentAdmin, getMssvBaoHiemYTe, createMssvBaoHiemYTe
};
export default connect(mapStateToProps, mapActionsToProps)(AdminStudentsPage);
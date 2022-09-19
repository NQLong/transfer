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
import { AdminModal, AdminPage, FormSelect, FormTextBox, getValue, renderTable, TableCell } from 'view/component/AdminPage';
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
    state = { filter: {} };
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
        console.log(filter);
        Object.keys(this).forEach(key => {
            filter[key] && this[key].value(filter[key]);
        });
        if (isReset) {
            Object.keys(this).forEach(key => {
                if (this[key].value && this[key].value()) this[key].value('');
            });
        }
    }

    getStudentsPage = (pageNumber, pageSize, pageCondition, done) => this.props.getStudentsPage(pageNumber, pageSize, pageCondition, this.state.filter, done);

    delete = (item) => {
        T.confirm('Xóa sinh viên', 'Xóa sinh viên này?', 'warning', true, isConfirm => {
            isConfirm && this.props.deleteSinhVienAdmin(item.mssv, false, null, error => {
                if (error) T.notify(error.message ? error.message : 'Xoá sinh viên lỗi!', 'danger');
                else T.alert('Xoá sinh viên thành công!', 'success', false, 800);
            });
        });
    }

    render() {
        let permission = this.getUserPermission('student', ['read', 'write', 'delete']);
        let developer = this.getUserPermission('developer', ['login']);
        let { pageNumber, pageSize, pageTotal, totalItem, pageCondition, list } = this.props.sinhVien && this.props.sinhVien.page ?
            this.props.sinhVien.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, pageCondition: {}, list: [] };

        let table = renderTable({
            emptyTable: 'Không có dữ liệu sinh viên',
            stickyHead: true,
            header: 'thead-light',
            className: 'table-fix-col',
            getDataSource: () => list,
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', textAlign: 'right' }}>#</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>MSSV</th>
                    <th style={{ width: '50%', whiteSpace: 'nowrap' }}>Họ và tên lót</th>
                    <th style={{ width: '50%', whiteSpace: 'nowrap' }}>Tên</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Giới tính</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Ngày sinh</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Nơi sinh</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Khoa</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Mã ngành</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Tên ngành</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Khoá</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Hệ</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Email cá nhân</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Email sinh viên</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>SĐT cá nhân</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Dân tộc</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Tôn giáo</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Quốc tịch</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Thường trú</th>
                    {/* <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Họ tên cha</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Địa chỉ cha</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>SĐT cha</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Họ tên mẹ</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Địa chỉ mẹ</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>SĐT mẹ</th> */}
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Họ tên liên lạc</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Địa chỉ liên lạc</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>SĐT liên lạc</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Ngày nhập học</th>
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
                        : (item.ngayNhapHoc.toString().length == 20 ? T.dateToText(new Date(item.ngayNhapHoc), 'dd/mm/yyyy') : '')) : ''} />
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

                    <FormSelect multiple ref={e => this.listKhoaSinhVien = e} data={[2022, 2021, 2020, 2019, 2018]} label='Lọc theo khoá' className='col-md-4' allowClear onChange={value => {
                        let currentFilter = Object.assign({}, this.state.filter),
                            current = currentFilter.listKhoaSinhVien?.split(',') || [];
                        if (value.selected) {
                            current.push(value.id);
                        } else current = current.filter(item => item != value.id);
                        this.setState({
                            filter: { ...currentFilter, listKhoaSinhVien: current.toString() }
                        });
                    }} />
                </div>
                <div style={{ textAlign: 'right' }}>
                    <button className='btn btn-secondary' onClick={e => e.preventDefault() || this.setState({ filter: {} }, () => this.changeAdvancedSearch(true))} style={{ marginRight: '20px' }}>
                        <i className='fa fa-lg fa-times' />Reset
                    </button>
                    <button className='btn btn-info' onClick={e => e.preventDefault() || this.changeAdvancedSearch()}>
                        <i className='fa fa-lg fa-search-plus' />Tìm kiếm
                    </button>
                </div>
            </>,
            content: <>
                <div className='tile'>
                    {list && list.length ? <i><b>{T.numberDisplay(pageSize)}</b>/{T.numberDisplay(totalItem)} sinh viên</i> : ''}
                    {table}
                </div>
                <Pagination style={{ marginLeft: '70px' }} {...{ pageNumber, pageSize, pageTotal, totalItem, pageCondition }}
                    getPage={this.getStudentsPage} />
                <AdminBhytModal ref={e => this.bhytModal = e} createSvBaoHiemYTe={this.props.createMssvBaoHiemYTe} />
                <LoginToTestModal ref={e => this.loginModal = e} loginStudentForTest={this.props.loginStudentForTest} />
            </>
            ,
            backRoute: '/user/students',
            onCreate: (e) => {
                if (permission.write) {
                    e.preventDefault();
                    this.props.history.push('/user/students/new');
                } else {
                    T.confirm('Cảnh báo', 'Bạn không có quyền thêm mới sinh viên. Liên hệ người có quyền để thao tác', 'warning', true);
                }
            },
            buttons: [
                permission.write ? { className: 'btn btn-danger', icon: 'fa-code-fork', tooltip: 'Xem giao diện sinh viên Test', onClick: e => e.preventDefault() || this.loginModal.show() } : null,
                developer.login && { className: 'btn btn-success', icon: 'fa-upload', tooltip: 'Import dữ liệu sinh viên', onClick: e => e.preventDefault() || this.props.history.push('/user/students/import') }
            ]
        });
    }
}
const mapStateToProps = state => ({ system: state.system, sinhVien: state.sinhVien.dataSinhVien });
const mapActionsToProps = {
    getStudentsPage, loginStudentForTest, adminDownloadSyll, updateStudentAdmin, getMssvBaoHiemYTe, createMssvBaoHiemYTe
};
export default connect(mapStateToProps, mapActionsToProps)(AdminStudentsPage);
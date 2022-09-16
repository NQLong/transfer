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
            T.onSearch = (searchText) => this.props.getStudentsPage(undefined, undefined, searchText || '', this.state.filter);
            T.showSearchBox(() => this.changeAdvancedSearch());
            this.changeAdvancedSearch();
        });
    }

    changeAdvancedSearch = (isReset = false) => {
        let { pageNumber, pageSize, pageCondition } = this.props.sinhVien && this.props.sinhVien.page ? this.props.sinhVien.page : { pageNumber: 1, pageSize: 50, pageCondition: '' };
        this.props.getStudentsPage(pageNumber, pageSize, pageCondition, this.state.filter, (page) => page && this.hideAdvanceSearch());
        if (isReset) {
            Object.keys(this).forEach(key => {
                if (this[key].value && this[key].value()) this[key].value('');
            });
        }
    }

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
                    <th style={{ width: 'auto', textAlign: 'right' }}>STT</th>
                    <th style={{ width: '50%', whiteSpace: 'nowrap' }}>Sinh viên</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Phái</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Dân tộc<br />Quốc tịch</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Tôn giáo</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Thường trú</th>
                    <th style={{ width: '50%', whiteSpace: 'nowrap' }}>Khoa</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Năm TS</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Ngày nhập học</th>
                    <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>Tình trạng</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Thao tác</th>
                </tr>
            ),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell type='text' style={{ textAlign: 'right' }} content={(pageNumber - 1) * pageSize + index + 1} />
                    <TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={(
                        <a href={`/user/students/item/${item.mssv}`} >
                            <span>
                                {item.ho + ' ' + item.ten} <br />
                                {item.mssv}
                            </span>
                        </a>
                    )} />
                    <TableCell type='text' style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={item.gioiTinh ? (item.gioiTinh === 1 ? 'Nam' : 'Nữ') : ''} />
                    <TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={<>
                        <span><b>Dân tộc: </b>{item.danToc}<br /></span>
                        <span><b>Quốc tịch: </b>{item.quocTich}</span>
                    </>} />
                    <TableCell type='text' content={item.tonGiao ? item.tonGiao : ''} />

                    <TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={item.tinhThanhThuongTru ? item.tinhThanhThuongTru : ''} />
                    <TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={item.tenKhoa ? item.tenKhoa : ''} />
                    <TableCell type='text' style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={
                        item.namTuyenSinh ? <b>{item.namTuyenSinh}</b> : ''
                    } />
                    <TableCell type='text' style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={item.ngayNhapHoc ? item.ngayNhapHoc == -1 ? 'Đang chờ nhập học' : T.dateToText(item.ngayNhapHoc, 'dd/mm/yyyy') : ''} />
                    <TableCell type='text' style={{ textAlign: 'center', color: 'red' }} content={item.tinhTrangSinhVien ? item.tinhTrangSinhVien : ''} />
                    <TableCell type='buttons' style={{ textAlign: 'center' }} content={item} permission={permission}
                        // onEdit={`/user/students/item/${item.mssv}`}
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
                    {/*listFaculty, listFromCity, listEthnic, listNationality, listReligion, listLoaiHinhDaoTao, listLoaiSinhVien, listTinhTrangSinhVien, gender*/}
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
                    <FormSelect multiple ref={e => this.listFromCity = e} data={ajaxSelectTinhThanhPho} label='Lọc theo tỉnh/thành thường trú' className='col-md-6' allowClear onChange={value => {
                        let currentFilter = Object.assign({}, this.state.filter),
                            currentListFromCity = currentFilter.listFromCity?.split(',') || [];
                        if (value.selected) {
                            currentListFromCity.push(value.id);
                        } else currentListFromCity = currentListFromCity.filter(item => item != value.id);
                        this.setState({
                            filter: { ...currentFilter, listFromCity: currentListFromCity.toString() }
                        });
                    }} />
                    <FormSelect multiple ref={e => this.listLoaiHinhDaoTao = e} data={SelectAdapter_DmSvLoaiHinhDaoTao} label='Lọc theo loại hình đào tạo' className='col-md-6' allowClear onChange={value => {
                        let currentFilter = Object.assign({}, this.state.filter),
                            currentListLoaiHinhDaoTao = currentFilter.listLoaiHinhDaoTao?.split(',') || [];
                        if (value.selected) {
                            currentListLoaiHinhDaoTao.push(value.id);
                        } else currentListLoaiHinhDaoTao = currentListLoaiHinhDaoTao.filter(item => item != value.id);
                        this.setState({
                            filter: { ...currentFilter, listLoaiHinhDaoTao: currentListLoaiHinhDaoTao.toString() }
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
                    {table}
                </div>
                <Pagination style={{ marginLeft: '70px' }} {...{ pageNumber, pageSize, pageTotal, totalItem, pageCondition }}
                    getPage={this.props.getStudentsPage} />
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
    getStudentsPage, loginStudentForTest, adminDownloadSyll, updateStudentAdmin
};
export default connect(mapStateToProps, mapActionsToProps)(AdminStudentsPage);
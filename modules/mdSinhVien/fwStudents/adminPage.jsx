import { SelectAdapter_DmDanTocV2 } from 'modules/mdDanhMuc/dmDanToc/redux';
import { ajaxSelectTinhThanhPho } from 'modules/mdDanhMuc/dmDiaDiem/reduxTinhThanhPho';
import { SelectAdapter_DmDonViFaculty_V2 } from 'modules/mdDanhMuc/dmDonVi/redux';
import { SelectAdapter_DmGioiTinhV2 } from 'modules/mdDanhMuc/dmGioiTinh/redux';
import { SelectAdapter_DmLoaiHinhDaoTaoV2 } from 'modules/mdDanhMuc/dmLoaiHinhDaoTao/redux';
import { SelectAdapter_DmLoaiSinhVienV2 } from 'modules/mdDanhMuc/dmLoaiSinhVien/redux';
import { SelectAdapter_DmTonGiaoV2 } from 'modules/mdDanhMuc/dmTonGiao/redux';
import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { AdminPage, FormSelect, renderTable, TableCell } from 'view/component/AdminPage';
import Pagination from 'view/component/Pagination';
import { getStudentsPage } from './redux';
class AdminStudentsPage extends AdminPage {
    state = { filter: {} };
    componentDidMount() {
        T.ready('/user/students', () => {
            T.clearSearchBox();
            T.onSearch = (searchText) => this.props.getStudentsPage(undefined, undefined, searchText || '', this.state.filter);
            T.showSearchBox(() => {
                this.listFaculty?.value('');
                this.listFromCity?.value('');
                this.listEthnic?.value('');
                this.listNationality?.value('');
                this.listReligion?.value('');
                this.listLoaiHinhDaoTao?.value('');
                this.listLoaiSinhVien?.value('');
                this.listTinhTrangSinhVien?.value('');
                setTimeout(() => this.changeAdvancedSearch(), 50);
            });
            this.props.getStudentsPage(undefined, undefined, '', this.state.filter);
            this.changeAdvancedSearch(true);
        });
    }

    changeAdvancedSearch = (isInitial = false) => {
        //listFaculty, listFromCity, listEthnic, listNationality, listReligion, listLoaiHinhDaoTao, listLoaiSinhVien, listTinhTrangSinhVien, gender
        let { pageNumber, pageSize } = this.props && this.props.sinhVien && this.props.sinhVien.page ? this.props.sinhVien.page : { pageNumber: 1, pageSize: 50 };
        const listFaculty = this.listFaculty.value().toString() || '';
        const listFromCity = this.listFromCity.value().toString() || '';
        const listEthnic = this.listEthnic.value().toString() || '';
        const listNationality = this.listNationality.value().toString() || '';
        const listReligion = this.listReligion.value().toString() || '';
        const listLoaiHinhDaoTao = this.listLoaiHinhDaoTao.value().toString() || '';
        const listLoaiSinhVien = this.listLoaiSinhVien.value().toString() || '';
        const listTinhTrangSinhVien = this.listTinhTrangSinhVien.value().toString() || '';
        const gender = this.gender?.value() == '' ? null : this.gender.value();
        const pageFilter = isInitial ? null : { listFaculty, listFromCity, listEthnic, listNationality, listReligion, listLoaiHinhDaoTao, listLoaiSinhVien, listTinhTrangSinhVien, gender };
        this.setState({ filter: pageFilter }, () => {
            this.props.getStudentsPage(pageNumber, pageSize, '', this.state.filter, (page) => {
                if (isInitial) {
                    const filter = page.filter || {};
                    let { listFaculty, listFromCity, listEthnic, listNationality, listReligion, listLoaiHinhDaoTao, listLoaiSinhVien, listTinhTrangSinhVien, gender } = filter;
                    this.setState({ filter: !$.isEmptyObject(filter) ? filter : pageFilter });
                    this.listFaculty?.value(filter.listFaculty || '');
                    this.listFromCity?.value(filter.listFromCity || '');
                    this.listEthnic?.value(filter.listEthnic || '');
                    this.listNationality?.value(filter.listNationality || '');
                    this.listReligion?.value(filter.listReligion || '');
                    this.listLoaiHinhDaoTao?.value(filter.listLoaiHinhDaoTao || '');
                    this.listLoaiSinhVien?.value(filter.listLoaiSinhVien || '');
                    this.listTinhTrangSinhVien?.value(filter.listTinhTrangSinhVien || '');
                    this.gender?.value(filter.gender || '');

                    if (!$.isEmptyObject(filter) && filter && ({ listFaculty, listFromCity, listEthnic, listNationality, listReligion, listLoaiHinhDaoTao, listLoaiSinhVien, listTinhTrangSinhVien, gender })) this.showAdvanceSearch();
                }
            });
        });
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

        let { pageNumber, pageSize, pageTotal, totalItem, pageCondition, list } = this.props.sinhVien && this.props.sinhVien.page ?
            this.props.sinhVien.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, pageCondition: {}, list };

        let table = renderTable({
            emptyTable: 'Không có dữ liệu sinh viên',
            stickyHead: true,
            getDataSource: () => list,
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', textAlign: 'right' }}>STT</th>
                    <th style={{ width: '50%', whiteSpace: 'nowrap' }}>Sinh viên</th>
                    <th style={{ width: '50%', whiteSpace: 'nowrap' }}>Khoa</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Mã ngành</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Lớp</th>
                    <th style={{ width: 'auto', textAlign: 'center' }}>Loại hình đào tạo</th>
                    <th style={{ width: 'auto', textAlign: 'center' }}>Tình trạng</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Thao tác</th>
                </tr>
            ),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell type='text' style={{ textAlign: 'right' }} content={(pageNumber - 1) * pageSize + index + 1} />
                    <TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={(
                        <span>
                            {item.ho + ' ' + item.ten} <br />
                            {item.mssv}
                        </span>
                    )} />
                    <TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={item.khoa ? item.khoa.normalizedName() : ''} />
                    <TableCell type='text' style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={item.maNganh ? item.maNganh : ''} />
                    <TableCell type='text' style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={item.lop ? item.lop : ''} />
                    <TableCell type='text' style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={item.loaiHinhDaoTao ? item.loaiHinhDaoTao : ''} />
                    <TableCell type='text' style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={item.tinhTrangSinhVien ? item.tinhTrangSinhVien : ''} />
                    <TableCell type='buttons' style={{ textAlign: 'center' }} content={item} permission={permission}
                        onEdit={`/user/students/${item.mssv}`} onDelete={this.delete} />
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
                    <FormSelect multiple ref={e => this.listFaculty = e} data={SelectAdapter_DmDonViFaculty_V2} label='Lọc theo khoa' className='col-md-4' minimumResultsForSearch={-1} allowClear onChange={() => this.changeAdvancedSearch()} />
                    <FormSelect multiple ref={e => this.listLoaiSinhVien = e} data={SelectAdapter_DmLoaiSinhVienV2} label='Lọc theo loại SV' className='col-md-4' minimumResultsForSearch={-1} allowClear onChange={() => this.changeAdvancedSearch()} />
                    <FormSelect multiple ref={e => this.listTinhTrangSinhVien = e} data={SelectAdapter_DmDonViFaculty_V2} label='Lọc theo tình trạng SV' className='col-md-4' minimumResultsForSearch={-1} allowClear onChange={() => this.changeAdvancedSearch()} />
                    <FormSelect ref={e => this.gender = e} data={SelectAdapter_DmGioiTinhV2} label='Lọc theo giới tính' className='col-md-3' minimumResultsForSearch={-1} allowClear onChange={() => this.changeAdvancedSearch()} />
                    <FormSelect multiple ref={e => this.listNationality = e} data={SelectAdapter_DmGioiTinhV2} label='Lọc theo quốc tịch' className='col-md-3' minimumResultsForSearch={-1} allowClear onChange={() => this.changeAdvancedSearch()} />
                    <FormSelect multiple ref={e => this.listEthnic = e} data={SelectAdapter_DmDanTocV2} label='Lọc theo dân tộc' className='col-md-3' minimumResultsForSearch={-1} allowClear onChange={() => this.changeAdvancedSearch()} />
                    <FormSelect multiple ref={e => this.listReligion = e} data={SelectAdapter_DmTonGiaoV2} label='Lọc theo tôn giáo' className='col-md-3' minimumResultsForSearch={-1} allowClear onChange={() => this.changeAdvancedSearch()} />
                    <FormSelect multiple ref={e => this.listFromCity = e} data={ajaxSelectTinhThanhPho} label='Lọc theo tỉnh/thành thường trú' className='col-md-6' minimumResultsForSearch={-1} allowClear onChange={() => this.changeAdvancedSearch()} />
                    <FormSelect multiple ref={e => this.listLoaiHinhDaoTao = e} data={SelectAdapter_DmLoaiHinhDaoTaoV2} label='Lọc theo loại hình đào tạo' className='col-md-6' minimumResultsForSearch={-1} allowClear onChange={() => this.changeAdvancedSearch()} />
                </div>
            </>,
            content: <>
                <div className='tile'>
                    {table}
                </div>
                <Pagination style={{ marginLeft: '70px' }} {...{ pageNumber, pageSize, pageTotal, totalItem, pageCondition }}
                    getPage={this.props.getStudentsPage} />
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
            }


        });
    }
}
const mapStateToProps = state => ({ system: state.system, sinhVien: state.sinhVien });
const mapActionsToProps = {
    getStudentsPage
};
export default connect(mapStateToProps, mapActionsToProps)(AdminStudentsPage);
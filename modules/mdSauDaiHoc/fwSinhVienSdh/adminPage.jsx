import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { AdminPage, renderTable, TableCell, FormSelect, FormCheckbox } from 'view/component/AdminPage';
import Pagination from 'view/component/Pagination';
import { getSvSdhPage, deleteSvSdhAdmin } from './redux';
import { SelectAdapter_DmDanTocV2 } from 'modules/mdDanhMuc/dmDanToc/redux';
import { SelectAdapter_DmGioiTinhV2 } from 'modules/mdDanhMuc/dmGioiTinh/redux';
import { SelectAdapter_DmQuocGia } from 'modules/mdDanhMuc/dmQuocGia/redux';
import { SelectAdapter_DmTinhTrangSinhVienV2 } from 'modules/mdDanhMuc/dmTinhTrangSinhVien/redux';
import { SelectAdapter_DmKhoaSdh } from 'modules/mdDanhMuc/dmKhoaSauDaiHoc/redux';
import { SelectAdapter_DmNganhSdh } from 'modules/mdSauDaiHoc/dmNganhSauDaiHoc/redux';

class AdminSvSdhPage extends AdminPage {
    defaultSortTerm = 'ten_ASC'
    state = { filter: {}, sortTerm: 'ten_ASC' };
    componentDidMount() {
        T.ready('/user/sau-dai-hoc', () => {
            T.clearSearchBox();
            T.onSearch = (searchText) => this.getStudentsPage(undefined, undefined, searchText || '');
            T.showSearchBox(() => {
                this.listFaculty?.value('');
                this.listNganh?.value('');
                this.listEthnic?.value('');
                this.listNationality?.value('');
                this.listLoaiHinhDaoTao?.value('');
                this.listLoaiSinhVien?.value('');
                this.listTinhTrangSinhVien?.value('');
                setTimeout(() => this.changeAdvancedSearch(), 50);
            });
            this.changeAdvancedSearch(true);
        });
    }

    changeAdvancedSearch = (isInitial = false) => {
        let { pageNumber, pageSize, pageCondition } = this.props && this.props.sinhVien && this.props.sinhVien.page ? this.props.sinhVien.page : { pageNumber: 1, pageSize: 50 };
        this.getStudentsPage(pageNumber, pageSize, pageCondition, page => page && this.hideAdvanceSearch());
        const listFaculty = this.listFaculty.value().toString() || '';
        const listNganh = this.listNganh.value().toString() || '';
        const listEthnic = this.listEthnic.value().toString() || '';
        const listNationality = this.listNationality.value().toString() || '';
        const listTinhTrangSinhVien = this.listTinhTrangSinhVien.value().toString() || '';
        const gender = this.gender?.value() == '' ? null : this.gender.value();
        const pageFilter = isInitial ? null : { listFaculty, listNganh, listEthnic, listNationality, listTinhTrangSinhVien, gender };

        this.setState({ filter: pageFilter }, () => {
            this.getStudentsPage(pageNumber, pageSize, this.state.filter, (page) => {
                if (isInitial) {
                    const filter = page.filter || {};
                    let { listFaculty, listFromCity, listEthnic, listNationality, listReligion, listTinhTrangSinhVien, gender } = filter;
                    this.setState({ filter: !$.isEmptyObject(filter) ? filter : pageFilter });
                    this.listFaculty?.value(filter.listFaculty || '');
                    this.listEthnic?.value(filter.listEthnic || '');
                    this.listNganh?.value(filter.listNganh || '');
                    this.listNationality?.value(filter.listNationality || '');
                    this.listTinhTrangSinhVien?.value(filter.listTinhTrangSinhVien || '');
                    this.gender?.value(filter.gender || '');

                    if (!$.isEmptyObject(filter) && filter && ({ listFaculty, listNganh, listFromCity, listEthnic, listNationality, listReligion, listTinhTrangSinhVien, gender })) this.showAdvanceSearch();
                }
            });
        });
    }

    delete = (item) => {
        T.confirm('Xóa sinh viên sau đại học', 'Xóa sinh viên này?', 'warning', true, isConfirm => {
            isConfirm && this.props.deleteSvSdhAdmin(item.ma, false, null, error => {
                if (error) T.notify(error.message ? error.message : 'Xoá sinh viên lỗi!', 'danger');
                else T.alert('Xoá sinh viên thành công!', 'success', false, 800);
            });
        });
    }

    getStudentsPage = (pageNumber, pageSize, pageCondition, done) => this.props.getSvSdhPage(pageNumber, pageSize, pageCondition, this.state.filter, this.state?.sortTerm || this.defaultSortTerm, done);


    render() {
        let permission = this.getUserPermission('svSdh', ['read', 'write', 'delete', 'export', 'import']);

        let { pageNumber, pageSize, pageTotal, totalItem, pageCondition, list } = this.props.svSdh && this.props.svSdh.page ?
            this.props.svSdh.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, pageCondition: {}, list };
        let table = renderTable({
            emptyTable: 'Không có dữ liệu sinh viên sau đại học',
            stickyHead: true,
            header: 'thead-light',
            className: this.state.quickAction ? 'table-fix-col' : '',
            getDataSource: () => list,
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', textAlign: 'right' }}>STT</th>
                    <th style={{ width: '50%', whiteSpace: 'center' }}>MSHV</th>

                    <th style={{ width: '50%', whiteSpace: 'center' }}>Họ và chữ lót</th>
                    <th style={{ width: '50%', whiteSpace: 'center' }}>Tên</th>

                    <th style={{ width: 'auto', whiteSpace: 'center' }}>Ngày sinh</th>
                    <th style={{ width: 'auto', whiteSpace: 'center', minWidth: '100px' }}>Tôn giáo</th>

                    <th style={{ width: 'auto', whiteSpace: 'center' }}>Nơi sinh</th>
                    <th style={{ width: 'auto', whiteSpace: 'center' }}>Hiện tại số nhà</th>

                    <th style={{ width: '50%', whiteSpace: 'center' }}>Email</th>
                    <th style={{ width: '50%', whiteSpace: 'center' }}>Sđt cá nhân</th>
                    <th style={{ width: '50%', whiteSpace: 'center' }}>Sđt liên hệ</th>

                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Phái</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Dân tộc</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Quốc tịch</th>
                    <th style={{ width: '50%', whiteSpace: 'center' }}>Khoa</th>
                    <th style={{ width: 'auto', whiteSpace: 'center', minWidth: '100px' }}>Mã ngành</th>

                    <th style={{ width: '50%', whiteSpace: 'center' }}>Ngành</th>
                    <th style={{ width: '50%', whiteSpace: 'center' }}>Chương trình đào tạo</th>
                    <th style={{ width: 'auto', whiteSpace: 'center' }}>Đề tài</th>

                    <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Năm TS</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Cơ quan</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Tình trạng</th>

                    <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Thao tác</th>
                </tr>
            ),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell type='text' style={{ textAlign: 'right' }} content={(pageNumber - 1) * pageSize + index + 1} />
                    <TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={(
                        <a href={`/user/sv-sdh/item/${item.mssv}`} >
                            <span>
                                {item.mssv}
                            </span>
                        </a>
                    )} />
                    <TableCell type='text' style={{ whiteSpace: 'nowrap', textTransform: 'uppercase' }} content={item.ho} />
                    <TableCell type='text' style={{ whiteSpace: 'nowrap', textTransform: 'uppercase' }} content={item.ten} />

                    <TableCell type='date' dateFormat='dd/mm/yyyy' style={{ whiteSpace: 'nowrap' }} content={item.ngaySinh} />
                    <TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={item.tonGiao ? item.tonGiao : 'Không'} />
                    <TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={item.noiSinh} />
                    <TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={item.hienTaiSoNha} />

                    <TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={item.emailCaNhan} />
                    <TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={item.sdtCaNhan} />
                    <TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={item.sdtLienHe} />
                    <TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={item.gioiTinh ? (item.gioiTinh === 1 ? 'Nam' : 'Nữ') : ''} />
                    <TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={item.danToc} />
                    <TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={item.quocTich} />


                    <TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={item.tenKhoa ? item.tenKhoa : ''} />
                    <TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={item.maNganh || ''} />
                    <TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={item.tenNganh || ''} />

                    <TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={item.chuongTrinhDaoTao || ''} />
                    <TableCell type='text' contentClassName='multiple-lines-2' content={item.tenDeTai || ''} />

                    <TableCell type='text' style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={
                        item.namTuyenSinh ? <b>{item.namTuyenSinh}</b> : ''
                    } />
                    <TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={item.coQuan || ''} />
                    <TableCell type='text' style={{ textAlign: 'center', color: 'red' }} content={item.tinhTrangSinhVien ? item.tinhTrangSinhVien : ''} />

                    <TableCell type='buttons' style={{ textAlign: 'center' }} content={item} permission={permission}
                        onEdit={`/user/sv-sdh/item/${item.mssv}`} onDelete={this.delete} />
                </tr>
            )
        });
        return this.renderPage({
            title: 'Danh sách sinh viên sau đại học',
            icon: 'fa fa-users',
            breadcrumb: [<Link key={0} to='/user/students'>Sinh viên</Link>,
                'Danh sách sinh viên SĐH'
            ],
            advanceSearch: <>
                <div className='row'>
                    {/*listFaculty, listFromCity, listEthnic, listNationality, listReligion,  listTinhTrangSinhVien, gender*/}
                    <FormSelect multiple ref={e => this.listFaculty = e} data={SelectAdapter_DmKhoaSdh} label='Lọc theo khoa' className='col-md-4' minimumResultsForSearch={-1} allowClear onChange={value => {
                        let currentFilter = Object.assign({}, this.state.filter),
                            currentListFaculty = currentFilter.listFaculty?.split(',') || [];
                        if (value.selected) {
                            currentListFaculty.push(value.id);
                        } else currentListFaculty = currentListFaculty.filter(item => item != value.id);
                        this.setState({ filter: { ...currentFilter, listFaculty: currentListFaculty.toString() } });
                    }} />
                    <FormSelect multiple ref={e => this.listNganh = e} data={SelectAdapter_DmNganhSdh()} label='Lọc theo ngành' className='col-md-4' minimumResultsForSearch={-1} allowClear onChange={value => {
                        let currentFilter = Object.assign({}, this.state.filter),
                            currentListNganh = currentFilter.listNganh?.split(',') || [];
                        if (value.selected) {
                            currentListNganh.push(value.id);
                        } else currentListNganh = currentListNganh.filter(item => item != value.id);
                        this.setState({ filter: { ...currentFilter, listNganh: currentListNganh.toString() } });
                    }} />
                    <FormSelect multiple ref={e => this.listTinhTrangSinhVien = e} data={SelectAdapter_DmTinhTrangSinhVienV2} label='Lọc theo tình trạng SV' className='col-md-4' minimumResultsForSearch={-1} allowClear onChange={value => {
                        let currentFilter = Object.assign({}, this.state.filter),
                            currentListTinhTrangSinhVien = currentFilter.listTinhTrangSinhVien?.split(',') || [];
                        if (value.selected) {
                            currentListTinhTrangSinhVien.push(value.id);
                        } else currentListTinhTrangSinhVien = currentListTinhTrangSinhVien.filter(item => item != value.id);
                        this.setState({ filter: { ...currentFilter, listTinhTrangSinhVien: currentListTinhTrangSinhVien.toString() } });
                    }} />
                    <FormSelect ref={e => this.gender = e} data={SelectAdapter_DmGioiTinhV2} label='Lọc theo giới tính' className='col-md-3' minimumResultsForSearch={-1} allowClear onChange={value => {
                        if (value) {
                            this.setState({ filter: { ...this.state.filter, gender: value.id } });
                        } else this.setState({ filter: { ...this.state.filter, gender: null } });
                    }} />
                    <FormSelect multiple ref={e => this.listNationality = e} data={SelectAdapter_DmQuocGia} label='Lọc theo quốc tịch' className='col-md-3' minimumResultsForSearch={-1} allowClear onChange={value => {
                        let currentFilter = Object.assign({}, this.state.filter),
                            currentListNationality = currentFilter.listNationality?.split(',') || [];
                        if (value.selected) {
                            currentListNationality.push(value.id);
                        } else currentListNationality = currentListNationality.filter(item => item != value.id);
                        this.setState({ filter: { ...currentFilter, listNationality: currentListNationality.toString() } });
                    }} />
                    <FormSelect multiple ref={e => this.listEthnic = e} data={SelectAdapter_DmDanTocV2} label='Lọc theo dân tộc' className='col-md-3' minimumResultsForSearch={-1} allowClear onChange={value => {
                        let currentFilter = Object.assign({}, this.state.filter),
                            currentListEthnic = currentFilter.listEthnic?.split(',') || [];
                        if (value.selected) {
                            currentListEthnic.push(value.id);
                        } else currentListEthnic = currentListEthnic.filter(item => item != value.id);
                        this.setState({ filter: { ...currentFilter, listEthnic: currentListEthnic.toString() } });
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
                            getPage={this.props.getSvSdhPage} pageRange={3} />
                    </div>
                    {table}
                </div>

            </>
            ,
            backRoute: '/user/sau-dai-hoc',
            collapse: [
                { icon: 'fa-print', name: 'Export', permission: permission.export, onClick: () => T.download(`/api/sv-sdh/download-excel?filter=${T.stringify(this.state.filter)}`, 'HOC_VIEN_SDH.xlsx'), type: 'success' },
                { icon: 'fa-upload', name: 'Import', permission: permission.import, onClick: () => this.props.history.push('/user/sv-sdh/upload'), type: 'danger' },

            ],

        });
    }
}
const mapStateToProps = state => ({ system: state.system, svSdh: state.sdh.svSdh });
const mapActionsToProps = {
    getSvSdhPage, deleteSvSdhAdmin
};
export default connect(mapStateToProps, mapActionsToProps)(AdminSvSdhPage);
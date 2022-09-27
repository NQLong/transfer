import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { AdminPage, renderTable, TableCell, FormSelect } from 'view/component/AdminPage';
import Pagination from 'view/component/Pagination';
import { getSvSdhPage, deleteSvSdhAdmin } from './redux';
import { SelectAdapter_DmDanTocV2 } from 'modules/mdDanhMuc/dmDanToc/redux';
import { ajaxSelectTinhThanhPho } from 'modules/mdDanhMuc/dmDiaDiem/reduxTinhThanhPho';
import { SelectAdapter_DmDonViFaculty_V2 } from 'modules/mdDanhMuc/dmDonVi/redux';
import { SelectAdapter_DmGioiTinhV2 } from 'modules/mdDanhMuc/dmGioiTinh/redux';
import { SelectAdapter_DmQuocGia } from 'modules/mdDanhMuc/dmQuocGia/redux';
import { SelectAdapter_DmTinhTrangSinhVienV2 } from 'modules/mdDanhMuc/dmTinhTrangSinhVien/redux';
import { SelectAdapter_DmTonGiaoV2 } from 'modules/mdDanhMuc/dmTonGiao/redux';

class AdminSvSdhPage extends AdminPage {

    state = { filter: {} };
    componentDidMount() {
        T.ready('/user/sau-dai-hoc', () => {
            T.clearSearchBox();
            T.onSearch = (searchText) => this.props.getSvSdhPage(undefined, undefined, searchText || '', this.state.filter);
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
            this.props.getSvSdhPage(undefined, undefined, '', this.state.filter);
            this.changeAdvancedSearch(true);
        });
    }

    changeAdvancedSearch = (isInitial = false) => {
        let { pageNumber, pageSize } = this.props && this.props.sinhVien && this.props.sinhVien.page ? this.props.sinhVien.page : { pageNumber: 1, pageSize: 500 };
        const listFaculty = this.listFaculty.value().toString() || '';
        const listFromCity = this.listFromCity.value().toString() || '';
        const listEthnic = this.listEthnic.value().toString() || '';
        const listNationality = this.listNationality.value().toString() || '';
        const listReligion = this.listReligion.value().toString() || '';
        const listTinhTrangSinhVien = this.listTinhTrangSinhVien.value().toString() || '';
        const gender = this.gender?.value() == '' ? null : this.gender.value();
        const pageFilter = isInitial ? null : { listFaculty, listFromCity, listEthnic, listNationality, listReligion, listTinhTrangSinhVien, gender };
        this.setState({ filter: pageFilter }, () => {
            this.props.getSvSdhPage(pageNumber, pageSize, '', this.state.filter, (page) => {
                if (isInitial) {
                    this.showAdvanceSearch();
                    const filter = page.filter || {};
                    let { listFaculty, listFromCity, listEthnic, listNationality, listReligion, listTinhTrangSinhVien, gender } = filter;
                    this.setState({ filter: !$.isEmptyObject(filter) ? filter : pageFilter });
                    this.listFaculty?.value(filter.listFaculty || '');
                    this.listFromCity?.value(filter.listFromCity || '');
                    this.listEthnic?.value(filter.listEthnic || '');
                    this.listNationality?.value(filter.listNationality || '');
                    this.listReligion?.value(filter.listReligion || '');
                    this.listTinhTrangSinhVien?.value(filter.listTinhTrangSinhVien || '');
                    this.gender?.value(filter.gender || '');

                    if (!$.isEmptyObject(filter) && filter && ({ listFaculty, listFromCity, listEthnic, listNationality, listReligion, listTinhTrangSinhVien, gender })) this.showAdvanceSearch();
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

    render() {
        let permission = this.getUserPermission('svSdh', ['read', 'write', 'delete', 'export']);

        let { pageNumber, pageSize, pageTotal, totalItem, pageCondition, list } = this.props.svSdh && this.props.svSdh.page ?
            this.props.svSdh.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, pageCondition: {}, list };

        let table = renderTable({
            emptyTable: 'Không có dữ liệu sinh viên sau đại học',
            stickyHead: true,
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
                    <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>Tình trạng</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Thao tác</th>
                </tr>
            ),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell type='text' style={{ textAlign: 'right' }} content={(pageNumber - 1) * pageSize + index + 1} />
                    <TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={(
                        <a href={`/user/sv-sdh/item/${item.mssv}`} >
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
                    <FormSelect multiple ref={e => this.listFaculty = e} data={SelectAdapter_DmDonViFaculty_V2} label='Lọc theo khoa' className='col-md-4' minimumResultsForSearch={-1} allowClear onChange={() => this.changeAdvancedSearch()} />
                    <FormSelect multiple ref={e => this.listTinhTrangSinhVien = e} data={SelectAdapter_DmTinhTrangSinhVienV2} label='Lọc theo tình trạng SV' className='col-md-4' minimumResultsForSearch={-1} allowClear onChange={() => this.changeAdvancedSearch()} />
                    <FormSelect ref={e => this.gender = e} data={SelectAdapter_DmGioiTinhV2} label='Lọc theo giới tính' className='col-md-3' minimumResultsForSearch={-1} allowClear onChange={() => this.changeAdvancedSearch()} />
                    <FormSelect multiple ref={e => this.listNationality = e} data={SelectAdapter_DmQuocGia} label='Lọc theo quốc tịch' className='col-md-3' minimumResultsForSearch={-1} allowClear onChange={() => this.changeAdvancedSearch()} />
                    <FormSelect multiple ref={e => this.listEthnic = e} data={SelectAdapter_DmDanTocV2} label='Lọc theo dân tộc' className='col-md-3' minimumResultsForSearch={-1} allowClear onChange={() => this.changeAdvancedSearch()} />
                    <FormSelect multiple ref={e => this.listReligion = e} data={SelectAdapter_DmTonGiaoV2} label='Lọc theo tôn giáo' className='col-md-3' minimumResultsForSearch={-1} allowClear onChange={() => this.changeAdvancedSearch()} />
                    <FormSelect multiple ref={e => this.listFromCity = e} data={ajaxSelectTinhThanhPho} label='Lọc theo tỉnh/thành thường trú' className='col-md-6' minimumResultsForSearch={-1} allowClear onChange={() => this.changeAdvancedSearch()} />
                </div>
            </>,
            content: <>
                <div className='tile'>
                    {table}
                </div>
                <Pagination style={{ marginLeft: '70px' }} {...{ pageNumber, pageSize, pageTotal, totalItem, pageCondition }}
                    getPage={this.props.getSvSdhPage} />
            </>
            ,
            backRoute: '/user/sau-dai-hoc',
            onCreate: (e) => {
                if (permission.write) {
                    e.preventDefault();
                    this.props.history.push('/user/sv-sdh/new');
                } else {
                    T.confirm('Cảnh báo', 'Bạn không có quyền thêm mới sinh viên. Liên hệ người có quyền để thao tác', 'warning', true);
                }
            },
            onImport: permission && permission.write ? (e) => e.preventDefault() || this.props.history.push('/user/sv-sdh/upload') : null,
            onExport: permission.export ? (e) => e.preventDefault() || T.download(`/api/sv-sdh/download-excel?filter=${T.stringify(this.state.filter)}`, 'HOC_VIEN_SDH.xlsx') : null,

            
        });
    }
}
const mapStateToProps = state => ({ system: state.system, svSdh: state.sdh.svSdh });
const mapActionsToProps = {
    getSvSdhPage, deleteSvSdhAdmin
};
export default connect(mapStateToProps, mapActionsToProps)(AdminSvSdhPage);
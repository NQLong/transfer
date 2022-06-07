import { SelectAdapter_DmDonViFaculty_V2 } from 'modules/mdDanhMuc/dmDonVi/redux';
import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { AdminModal, AdminPage, FormSelect, FormTextBox, renderTable, TableCell } from 'view/component/AdminPage';
import Pagination from 'view/component/Pagination';
import { SelectAdapter_DtNganhDaoTao } from '../dtNganhDaoTao/redux';
import { getDtDanhSachChuyenNganhPage, updateDtDanhSachChuyenNganh, createDtDanhSachChuyenNganh, deleteDtDanhSachChuyenNganh } from './redux';
import { SelectAdapter_DtCauTrucKhungDaoTao } from '../dtCauTrucKhungDaoTao/redux';
class EditModal extends AdminModal {
    onShow = (item) => {
        let { ten = '', namHoc = '', khoa = null, id = null, nganh = '' } = item ? item : {};
        this.setState({ id });
        this.ten.value(ten);
        this.namHoc.value(namHoc);
        this.khoa.value(khoa || (this.props.khoa != 'all' ? this.props.khoa : ''));
        this.nganh.value(nganh);
    }
    onSubmit = (e) => {
        e.preventDefault();
        const changes = {
            ten: this.ten.value(),
            namHoc: this.namHoc.value(),
            khoa: this.khoa.value(),
            nganh: this.nganh.value()
        };
        if (!changes.ten) {
            T.notify('Tên không được trống!', 'danger');
            this.ten.focus();
        } else if (!changes.namHoc) {
            T.notify('Năm không được trống!', 'danger');
            this.namHoc.focus();
        } else if (!changes.khoa) {
            T.notify('Khoa không được trống!', 'danger');
            this.khoa.focus();
        } else if (!changes.nganh) {
            T.notify('Ngành không được trống!', 'danger');
            this.nganh.focus();
        } else {
            this.state.id ? this.props.update(this.state.id, changes, this.hide) : this.props.create(changes, this.hide);
        }
    }
    render = () => {
        let readOnly = this.props.readOnly, readOnlyKhoa = this.props.readOnlyKhoa;
        return this.renderModal({
            readOnly: readOnly,
            title: 'Thông tin chuyên ngành',
            size: 'large',
            body: <div className='row'>
                <FormTextBox ref={e => this.ten = e} className='col-12' required label='Tên chuyên ngành' readOnly={readOnly} />
                <FormSelect type='year' ref={e => this.namHoc = e} className='col-12' required label='Năm' readOnly={readOnly} data={SelectAdapter_DtCauTrucKhungDaoTao} />
                <FormSelect ref={e => this.khoa = e} className='col-12' required label='Khoa/Bộ môn' data={SelectAdapter_DmDonViFaculty_V2} readOnly={readOnlyKhoa} />
                <FormSelect ref={e => this.nganh = e} className='col-12' required label='Ngành' data={SelectAdapter_DtNganhDaoTao} readOnly={readOnly} />
            </div>
        });
    }
}

class DtDanhSachChuyenNganhPage extends AdminPage {
    state = { filter: {} }

    componentDidMount() {
        T.ready('/user/dao-tao', () => {
            T.onSearch = (searchText) => this.getPage(undefined, undefined, searchText || '');
            T.showSearchBox();

            this.getPage();
        });
    }

    getPage = (pageS, pageN, pageC) => {
        this.props.getDtDanhSachChuyenNganhPage(pageS, pageN, pageC, this.state.filter);
    }

    delete = (e, item) => {
        e.preventDefault();
        T.confirm('Xóa chuyên ngành', 'Bạn có chắc bạn muốn xóa chuyên ngành này?', true, isConfirm =>
            isConfirm && this.props.deleteDtDanhSachChuyenNganh(item.id));
    }

    render() {
        let permissionDaoTao = this.getUserPermission('dtDanhSachChuyenNganh', ['read', 'write', 'delete']);
        let permissionCTDT = this.getUserPermission('dtChuongTrinhDaoTao', ['manage']);
        let permission = {
            read: permissionDaoTao.read || permissionCTDT.manage,
            write: permissionDaoTao.write || permissionCTDT.manage,
            delete: permissionDaoTao.delete || permissionCTDT.manage
        };
        const { pageNumber, pageSize, pageTotal, totalItem, pageCondition, list } = this.props.dtDanhSachChuyenNganh && this.props.dtDanhSachChuyenNganh.page ?
            this.props.dtDanhSachChuyenNganh.page : {
                pageNumber: 1, pageSize: 200, pageTotal: 1, pageCondition: '', totalItem: 0, list: null
            };

        let table = renderTable({
            getDataSource: () => list,
            stickyHead: true,
            emptyTable: 'Chưa có dữ liệu',
            renderHead: () => (<>
                <tr>
                    <th style={{ width: 'auto', textAlign: 'right', whiteSpace: 'nowrap' }}>#</th>
                    <th style={{ width: '100%', whiteSpace: 'nowrap' }}>Tên chuyên ngành</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Ngành</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Khoa, bộ môn</th>
                    <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>Năm đào tạo</th>
                    <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>Thao tác</th>
                </tr>
            </>),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell style={{ textAlign: 'right', whiteSpace: 'nowrap' }} content={(pageNumber - 1) * pageSize + index + 1} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.ten} />
                    <TableCell content={`${item.nganh} - ${item.tenNganh}`} style={{ whiteSpace: 'nowrap' }} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.tenKhoa} />
                    <TableCell style={{ textAlign: 'center', whiteSpace: 'nowrap' }} content={item.namDaoTao} />
                    <TableCell type='buttons' style={{ textAlign: 'center', whiteSpace: 'nowrap' }} content={item} permission={permission} onEdit={() => this.modal.show(item)} onDelete={this.delete} />
                </tr>)
        });
        return this.renderPage({
            title: 'Danh sách chuyên ngành',
            subTitle: 'Của các Khoa/Bộ môn',
            icon: 'fa fa-sitemap',
            breadcrumb: [
                <Link key={0} to='/user/dao-tao'>Đào tạo</Link>,
                'Danh sách chuyên ngành'
            ],
            content: <>
                {permissionDaoTao.read &&
                    <div className='tile'>
                        <div className='tile-title'><h3>Tra cứu</h3></div>
                        <div className='row'>
                            <FormSelect className='col-8' label='Chọn khoa, bộ môn' placeholder='Danh sách Khoa, bộ môn' ref={e => this.donVi = e} onChange={value => this.setState({ filter: { ...this.state.filter, donVi: value?.id || '' } })} data={SelectAdapter_DmDonViFaculty_V2} allowClear={true} />
                            <FormSelect type='year' className='col-4' label='Nhập năm' ref={e => this.nam = e} onChange={value => this.setState({ filter: { ...this.state.filter, nam: value?.id || '' } })} data={SelectAdapter_DtCauTrucKhungDaoTao} />
                            <div className='form-group col-12' style={{ justifyContent: 'end', display: 'flex' }}>
                                <button className='btn btn-danger' style={{ marginRight: '10px' }} type='button' onClick={e => {
                                    e.preventDefault();
                                    this.getPage();
                                    T.notify('Đã xóa bộ lọc', 'info');
                                }}>
                                    <i className='fa fa-fw fa-lg fa-times' />Xóa bộ lọc
                                </button>
                                <button className='btn btn-info' type='button' onClick={e => e.preventDefault() || this.getPage()}>
                                    <i className='fa fa-fw fa-lg fa-search-plus' />Tìm kiếm
                                </button>
                            </div>
                        </div>
                    </div>}
                <div className='tile'>{table}</div>
                <Pagination style={{ marginLeft: '70px' }} {...{ pageNumber, pageSize, pageTotal, totalItem, pageCondition }} getPage={this.props.getDtDanhSachChuyenNganhPage} />
                <EditModal ref={e => this.modal = e} readOnly={!permission.write} readOnlyKhoa={!permissionDaoTao.write} update={this.props.updateDtDanhSachChuyenNganh} create={this.props.createDtDanhSachChuyenNganh} khoa={this.state.donVi} />
            </>,
            backRoute: '/user/dao-tao',
            onCreate: permission.write ? (e) => e.preventDefault() || this.modal.show() : null
        });
    }
}

const mapStateToProps = state => ({ system: state.system, dtDanhSachChuyenNganh: state.daoTao.dtDanhSachChuyenNganh });
const mapActionsToProps = { getDtDanhSachChuyenNganhPage, updateDtDanhSachChuyenNganh, createDtDanhSachChuyenNganh, deleteDtDanhSachChuyenNganh };
export default connect(mapStateToProps, mapActionsToProps)(DtDanhSachChuyenNganhPage);

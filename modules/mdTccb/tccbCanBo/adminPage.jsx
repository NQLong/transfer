import React from 'react';
import { connect } from 'react-redux';
import { PageName, getStaffPage, deleteStaff } from './redux';
import Pagination, { OverlayLoading } from 'view/component/Pagination';
import { Link } from 'react-router-dom';
import { AdminPage, TableCell, renderTable, FormSelect, } from 'view/component/AdminPage';
import { getDmDonViAll, SelectAdapter_DmDonVi } from 'modules/mdDanhMuc/dmDonVi/redux';
import { SelectAdapter_DmGioiTinhV2 } from 'modules/mdDanhMuc/dmGioiTinh/redux';
import { SelectAdapter_DmNgachCdnnV2 } from 'modules/mdDanhMuc/dmNgachCdnn/redux';
import { SelectAdapter_DmTrinhDoV2 } from 'modules/mdDanhMuc/dmTrinhDo/redux';
import { SelectAdapter_DmChucDanhKhoaHoc } from 'modules/mdDanhMuc/dmChucDanhKhoaHoc/redux';
import T from 'view/js/common';

class StaffPage extends AdminPage {
    state = { filter: {} };
    componentDidMount() {
        T.ready('/user/tccb', () => {
            T.clearSearchBox();
            T.onSearch = (searchText) => this.getPage(undefined, undefined, searchText || '');
            T.showSearchBox(() => {
                this.listDonVi.value('');
                this.gender.value('');
                this.listNgach.value('');
                this.listHocVi.value('');
                this.listChucDanh.value('');
                this.isBienChe.value('');
                setTimeout(() => this.changeAdvancedSearch(), 50);
            });
            this.getPage();
            this.changeAdvancedSearch(true);
        });
    }

    changeAdvancedSearch = (isInitial = false) => {
        //listDonVi, gender, listNgach, listHocVi, listChucDanh, isBienChe
        let { pageNumber, pageSize } = this.props && this.props.staff && this.props.staff.page ? this.props.staff.page : { pageNumber: 1, pageSize: 50 };

        const listDonVi = this.listDonVi.value().toString() || '',
            listChucDanh = this.listChucDanh.value().toString() || '',
            listNgach = this.listNgach.value().toString() || '',
            gender = this.gender.value() == '' ? null : this.gender.value(),
            listHocVi = this.listHocVi.value().toString() || '',
            isBienChe = this.isBienChe.value() == '' ? null : this.isBienChe.value();
        const pageFilter = isInitial ? null : { listDonVi, gender, listNgach, listHocVi, listChucDanh, isBienChe };
        this.setState({ filter: pageFilter }, () => {
            this.getPage(pageNumber, pageSize, '', (page) => {
                if (isInitial) {
                    // Initial
                    const filter = page.filter || {};
                    let { listDonVi, gender, listNgach, listHocVi, listChucDanh, isBienChe } = filter ? filter : {
                        listDonVi: '', gender: '', listNgach: '', listHocVi: '', listChucDanh: '', isBienChe: ''
                    };
                    this.setState({ filter: !$.isEmptyObject(filter) ? filter : pageFilter });
                    this.listDonVi.value(listDonVi);
                    this.gender.value(gender);
                    this.listNgach.value(listNgach);
                    this.listHocVi.value(listHocVi);
                    this.listChucDanh.value(listChucDanh);
                    this.isBienChe.value(isBienChe);

                    if (!$.isEmptyObject(filter) && filter && ({ listDonVi, gender, listNgach, listHocVi, listChucDanh, isBienChe })) this.showAdvanceSearch();
                }
            });
        });

    }

    getPage = (pageN, pageS, pageC, done) => {
        this.props.getStaffPage(pageN, pageS, pageC, this.state.filter, done);
    }

    delete = (e, item) => {
        e.preventDefault();
        T.confirm('Cán bộ', 'Bạn có chắc bạn muốn xóa cán bộ này?', 'warning', true, isConfirm =>
            isConfirm && this.props.deleteStaff(item.shcc));
    };

    create = (e) => {
        e.preventDefault();
        this.props.history.push('/user/tccb/staff/new');
    };

    render() {
        const permission = this.getUserPermission('staff');
        let { pageNumber, pageSize, pageTotal, totalItem, pageCondition, list } = this.props.staff && this.props.staff.page ?
            this.props.staff.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, pageCondition: {}, list: [] };
        const table = renderTable({
            getDataSource: () => list, stickyHead: false,
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Cán bộ</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Phái</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Ngày sinh</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Học vị <br /> Học hàm</th>
                    <th style={{ width: 'auto', textAlign: 'center' }}>Chức danh nghề nghiệp</th>
                    <th style={{ width: '50%', whiteSpace: 'nowrap' }}>Đơn vị</th>
                    <th style={{ width: '50%', whiteSpace: 'nowrap' }}>Email</th>
                    <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>Thao tác</th>
                </tr>),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell type='number' content={(pageNumber - 1) * pageSize + index + 1} />
                    <TableCell type='link' content={<>
                        <span>{`${item.ho} ${item.ten}`}<br /></span>
                        {item.shcc}
                    </>} url={`/user/tccb/staff/${item.shcc}`} style={{ whiteSpace: 'nowrap' }} />
                    <TableCell type='text' content={item.phai ? (item.phai == '01' ? 'Nam' : 'Nữ') : ''} style={{ whiteSpace: 'nowrap' }} />
                    <TableCell type='text' content={item.ngaySinh ? T.dateToText(item.ngaySinh, 'dd/mm/yyyy') : ''} style={{ whiteSpace: 'nowrap' }} />
                    <TableCell type='text' content={<>
                        <span>{item.hocVi && item.hocVi}<br /></span>
                        {item.hocHam && item.hocHam}
                    </>} style={{ whiteSpace: 'nowrap' }} />
                    <TableCell type='text' content={item.ngach} style={{ whiteSpace: 'nowrap' }} />
                    <TableCell type='text' content={<>
                        {item.chucVuChinh && <span style={{ color: 'red' }}>{item.chucVuChinh && item.chucVuChinh}<br /></span>}
                        {item.tenDonVi && item.tenDonVi.normalizedName()}
                    </>} style={{ whiteSpace: 'nowrap' }} />
                    <TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={
                        <>
                            <span>{item.email}</span>
                        </>} />
                    <TableCell type='buttons' content={item} permission={permission} onEdit={`/user/tccb/staff/${item.shcc}`} onDelete={this.delete}></TableCell>
                </tr>)
        });

        return this.renderPage({
            icon: 'fa fa-users',
            title: 'Cán bộ',
            breadcrumb: [
                <Link key={0} to='/user/tccb'>Tổ chức cán bộ</Link>,
                'Cán bộ'
            ],
            advanceSearch: <>
                <div className='row'>
                    <FormSelect ref={e => this.listDonVi = e} className='col-md-6' label='Lọc theo đơn vị' data={SelectAdapter_DmDonVi} onChange={() => this.changeAdvancedSearch()} minimumResultsForSearch={-1} multiple={true} allowClear={true} />
                    <FormSelect ref={e => this.gender = e} data={SelectAdapter_DmGioiTinhV2} label='Lọc theo giới tính' className='col-md-3' minimumResultsForSearch={-1} allowClear onChange={() => this.changeAdvancedSearch()} />
                    <FormSelect ref={e => this.isBienChe = e} data={
                        [{ id: 0, text: 'Biên chế' }, { id: 1, text: 'Hợp đồng' }]
                    } className='col-md-3' minimumResultsForSearch={-1} allowClear onChange={() => this.changeAdvancedSearch()} label='Lọc theo loại CB' />
                    <FormSelect className='col-md-4' ref={e => this.listNgach = e} data={SelectAdapter_DmNgachCdnnV2} onChange={() => this.changeAdvancedSearch()} minimumResultsForSearch={-1} multiple={true} allowClear={true} label='Lọc theo chức danh nghề nghiệp' />
                    <FormSelect className='col-md-4' ref={e => this.listHocVi = e} data={SelectAdapter_DmTrinhDoV2} onChange={() => this.changeAdvancedSearch()} minimumResultsForSearch={-1} multiple={true} allowClear={true} label='Lọc theo học vị' />
                    <FormSelect className='col-md-4' ref={e => this.listChucDanh = e} data={SelectAdapter_DmChucDanhKhoaHoc} onChange={() => this.changeAdvancedSearch()} minimumResultsForSearch={-1} multiple={true} allowClear={true} label='Lọc theo học hàm' />
                </div>
            </>,
            content: <>
                <div className='tile'>
                    {!this.state.searching ? table : <OverlayLoading text='Đang tải..' />}
                    <Pagination style={{ marginLeft: '70px' }} name={PageName} pageNumber={pageNumber} pageSize={pageSize} pageTotal={pageTotal} totalItem={totalItem} pageCondition={pageCondition}
                        getPage={this.getPage} />
                </div>
            </>,
            backRoute: '/user/tccb',
            onCreate: permission ? e => this.create(e) : null
        });
    }
}

const mapStateToProps = state => ({ system: state.system, staff: state.tccb.staff });
const mapActionsToProps = { getStaffPage, deleteStaff, getDmDonViAll };
export default connect(mapStateToProps, mapActionsToProps)(StaffPage);
import React from 'react';
import { connect } from 'react-redux';
import { PageName, getStaffPage, deleteStaff } from './redux';
import Pagination, { OverlayLoading } from 'view/component/Pagination';
import { Link } from 'react-router-dom';
import { AdminPage, TableCell, renderTable, FormSelect, FormDatePicker } from 'view/component/AdminPage';
import { getDmDonViAll, SelectAdapter_DmDonVi } from 'modules/mdDanhMuc/dmDonVi/redux';
import { SelectAdapter_DmGioiTinhV2 } from 'modules/mdDanhMuc/dmGioiTinh/redux';
import { SelectAdapter_DmNgachCdnnV2 } from 'modules/mdDanhMuc/dmNgachCdnn/redux';
import { SelectAdapter_DmTrinhDoV2 } from 'modules/mdDanhMuc/dmTrinhDo/redux';
import { SelectAdapter_DmChucDanhKhoaHoc } from 'modules/mdDanhMuc/dmChucDanhKhoaHoc/redux';
import { SelectAdapter_DmDanTocV2 } from 'modules/mdDanhMuc/dmDanToc/redux';
import { SelectAdapter_DmTonGiaoV2 } from 'modules/mdDanhMuc/dmTonGiao/redux';
import T from 'view/js/common';

class StaffPage extends AdminPage {
    state = { filter: {} };
    componentDidMount() {
        T.ready('/user/tccb', () => {
            T.clearSearchBox();
            T.onSearch = (searchText) => this.getPage(undefined, undefined, searchText || '');
            T.showSearchBox(() => {
                let filterCookie = T.getCookiePage(PageName, 'F'),
                    { listDonVi = '', gender = '', listNgach = '', listHocVi = '', listChucDanh = '', isBienChe = '', fromYear = '', toYear = ''} = filterCookie;
                this.listDonVi.value(listDonVi);
                this.gender.value(gender);
                this.listNgach.value(listNgach);
                this.listHocVi.value(listHocVi);
                this.listChucDanh.value(listChucDanh);
                this.isBienChe.value(isBienChe);
                this.fromYear.value(fromYear);
                this.toYear.value(toYear);
                setTimeout(() => this.changeAdvancedSearch(), 50);
            });
            this.changeAdvancedSearch(true);
        });
    }

    changeAdvancedSearch = (isInitial = false, isReset = false) => {
        //listDonVi, gender, listNgach, listHocVi, listChucDanh, isBienChe, fromYear, toYear, listDanToc, listTonGiao
        let { pageNumber, pageSize, pageCondition } = this.props && this.props.staff && this.props.staff.page ? this.props.staff.page : { pageNumber: 1, pageSize: 50, pageCondition: {} };

        if (pageCondition && (typeof pageCondition == 'string')) T.setTextSearchBox(pageCondition);

        const listDonVi = this.listDonVi.value().toString() || '',
            listChucDanh = this.listChucDanh.value().toString() || '',
            listNgach = this.listNgach.value().toString() || '',
            gender = this.gender.value() == '' ? null : this.gender.value(),
            listHocVi = this.listHocVi.value().toString() || '',
            isBienChe = this.isBienChe.value() == '' ? null : this.isBienChe.value(),
            fromYear = this.fromYear.value() == '' ? null : this.fromYear.value().getTime(),
            toYear = this.toYear.value() == '' ? null : this.toYear.value().getTime() + 43200000,
            listDanToc = this.listDanToc.value().toString() || '',
            listTonGiao = this.listTonGiao.value().toString() || '';
        const pageFilter = isInitial ? null : { listDonVi, gender, listNgach, listHocVi, listChucDanh, isBienChe, fromYear, toYear, listDanToc, listTonGiao };
        this.setState({ filter: isReset ? {} : pageFilter }, () => {
            this.getPage(pageNumber, pageSize, pageCondition, (page) => {
                if (isInitial) {
                    // Initial
                    const filter = page.filter || {};
                    const filterCookie = T.getCookiePage(PageName, 'F');
                    let { listDonVi, gender, listNgach, listHocVi, listChucDanh, isBienChe, fromYear, toYear, listDanToc, listTonGiao } = filter;
                    this.setState({ filter: !$.isEmptyObject(filter) ? filter : pageFilter });

                    this.listDonVi.value(listDonVi || filterCookie.listDonVi || '');
                    this.gender.value(gender || filterCookie.gender || '');
                    this.listNgach.value(listNgach || filterCookie.listNgach || '');
                    this.listHocVi.value(listHocVi || filterCookie.listHocVi || '');
                    this.listChucDanh.value(listChucDanh || filterCookie.listChucDanh || '');
                    this.isBienChe.value(isBienChe || filterCookie.listChucDanh || '');
                    this.fromYear.value(fromYear || filterCookie.fromYear || '');
                    this.toYear.value(toYear || filterCookie.toYear || '');
                    this.listDanToc.value(listDanToc || filter.listDanToc || '');
                    this.listTonGiao.value(listTonGiao || filter.listTonGiao || '');
                    if (this.listDonVi.value() || this.gender.value() || this.listNgach.value() ||
                        this.listHocVi.value() || this.listChucDanh.value() || this.isBienChe.value() || this.fromYear.value() || this.toYear.value()
                        || this.listDanToc.value() || this.listTonGiao.value()) this.showAdvanceSearch();
                } else if (isReset) {
                    this.listDonVi.value('');
                    this.gender.value('');
                    this.listNgach.value('');
                    this.listHocVi.value('');
                    this.listChucDanh.value('');
                    this.isBienChe.value('');
                    this.fromYear.value('');
                    this.toYear.value('');
                    this.listDanToc.value('');
                    this.listTonGiao.value('');
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
        const permission = this.getUserPermission('staff', ['read', 'write', 'delete']);
        let { pageNumber, pageSize, pageTotal, totalItem, pageCondition, list } = this.props.staff && this.props.staff.page ?
            this.props.staff.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, pageCondition: {}, list: [] };
        const table = renderTable({
            getDataSource: () => list, stickyHead: true,
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Cán bộ</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Phái</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Ngày sinh</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Quê quán</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Dân tộc</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Tôn giáo</th>
                    <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>Học hàm<br />Trình độ chuyên môn</th>
                    <th style={{ width: 'auto', textAlign: 'center' }}>Chuyên ngành</th>
                    <th style={{ width: 'auto', textAlign: 'center' }}>Chức danh nghề nghiệp</th>
                    <th style={{ width: '50%', whiteSpace: 'nowrap' }}>Đơn vị</th>
                    <th style={{ width: '50%', whiteSpace: 'nowrap' }}>Email</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Ngày bắt đầu<br/>công tác</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>CMND</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Hệ số lương</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Loại cán bộ</th>
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
                    <TableCell type='text' content={item.queQuan} style={{ whiteSpace: 'nowrap' }} />
                    <TableCell type='text' content={item.tenDanToc} style={{ whiteSpace: 'nowrap' }} />
                    <TableCell type='text' content={item.tenTonGiao} style={{ whiteSpace: 'nowrap' }} />
                    <TableCell type='text' content={<>
                        {item.hocHam && <span> {item.hocHam}<br /></span>}
                        {item.hocVi && item.hocVi}
                    </>} style={{ whiteSpace: 'nowrap', textAlign: 'center' }} />
                    <TableCell type='text' content={item.chuyenNganh} style={{ whiteSpace: 'nowrap' }} />
                    <TableCell type='text' content={item.ngach + (item.ngach == 'Chuyên viên' && item.ghiChu && item.ghiChu.includes('CVPV') ? ' (CVPVĐT & NCKH)' : '')} style={{ whiteSpace: 'nowrap' }} />
                    <TableCell type='text' content={<>
                        {item.chucVuChinh && <span style={{ color: 'red' }}>{item.chucVuChinh}<br /></span>}
                        {item.tenDonVi && item.tenDonVi.normalizedName()}
                    </>} style={{ whiteSpace: 'nowrap' }} />
                    <TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={item.email} />
                    <TableCell type='date' style={{color: 'blue'}} dateFormat='dd/mm/yyyy' content={item.ngayRaQuyetDinh} />
                    <TableCell type='text' content={item.cmnd} style={{ whiteSpace: 'nowrap', textAlign: 'center' }} />
                    <TableCell type='number' content={item.heSoLuong?.toFixed(2)} style={{ whiteSpace: 'nowrap', textAlign: 'center' }} />
                    <TableCell type='text' content={
                        <>
                            <span>{item.loaiCanBo + (item.loaiCanBo == 'Hợp đồng' && item.ghiChu && item.ghiChu.includes('HĐTN') ? ' (Trách nhiệm)' : '')}<br /></span>
                            <small style={{ color: 'blue' }}>{item.ngayBienChe ? T.dateToText(item.ngayBienChe, 'dd/mm/yyyy') : ''}</small>
                        </>} style={{ whiteSpace: 'nowrap', textAlign: 'center' }} />
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
                    <FormSelect ref={e => this.listDonVi = e} className='col-md-6' label='Lọc theo đơn vị' data={SelectAdapter_DmDonVi} minimumResultsForSearch={-1} multiple={true} allowClear={true} />
                    <FormSelect ref={e => this.gender = e} data={SelectAdapter_DmGioiTinhV2} label='Lọc theo giới tính' className='col-md-3' minimumResultsForSearch={-1} allowClear />
                    <FormSelect ref={e => this.isBienChe = e} data={
                        [{ id: 0, text: 'Biên chế' }, { id: 1, text: 'Hợp đồng' }]
                    } className='col-md-3' minimumResultsForSearch={-1} allowClear label='Lọc theo loại CB' />
                    <FormSelect className='col-md-4' ref={e => this.listNgach = e} data={SelectAdapter_DmNgachCdnnV2} minimumResultsForSearch={-1} multiple={true} allowClear={true} label='Lọc theo chức danh nghề nghiệp' />
                    <FormSelect className='col-md-4' ref={e => this.listHocVi = e} data={SelectAdapter_DmTrinhDoV2} minimumResultsForSearch={-1} multiple={true} allowClear={true} label='Lọc theo học vị' />
                    <FormSelect className='col-md-4' ref={e => this.listChucDanh = e} data={SelectAdapter_DmChucDanhKhoaHoc} minimumResultsForSearch={-1} multiple={true} allowClear={true} label='Lọc theo học hàm' />
                    <FormDatePicker type='date-mask' ref={e => this.fromYear = e} className='col-12 col-md-2' label='Từ thời gian (bắt đầu công tác)' onChange={() => this.changeAdvancedSearch()} />
                    <FormDatePicker type='date-mask' ref={e => this.toYear = e} className='col-12 col-md-2' label='Đến thời gian (bắt đầu công tác)' onChange={() => this.changeAdvancedSearch()} />
                    <FormSelect className='col-md-4' ref={e => this.listDanToc = e} data={SelectAdapter_DmDanTocV2} minimumResultsForSearch={-1} multiple={true} allowClear={true} label='Lọc theo dân tộc' />
                    <FormSelect className='col-md-4' ref={e => this.listTonGiao = e} data={SelectAdapter_DmTonGiaoV2} minimumResultsForSearch={-1} multiple={true} allowClear={true} label='Lọc theo tôn giáo' />
                    <div className='form-group col-12' style={{ justifyContent: 'end', display: 'flex' }}>
                        <button className='btn btn-danger' style={{ marginRight: '10px' }} type='button' onClick={e => e.preventDefault() || this.changeAdvancedSearch(null, true)}>
                            <i className='fa fa-fw fa-lg fa-times' />Xóa bộ lọc
                        </button>
                        <button className='btn btn-info' type='button' onClick={e => e.preventDefault() || this.changeAdvancedSearch()}>
                            <i className='fa fa-fw fa-lg fa-search-plus' />Tìm kiếm
                        </button>
                    </div>
                </div>
            </>,
            content: <>
                <div className='tile'>
                    <div className='tile-title'>Thống kê</div>
                    <div className='row col-sm-12'>Tổng cán bộ: &nbsp;{<b>{totalItem}</b>}</div>
                    {/* <div className='row col-sm-12'>Cán bộ nam: &nbsp;{<b>{list.groupBy('phai')['01']?.length}</b>}</div> */}
                </div>
                <div className='tile'>
                    {!this.state.searching ? table : <OverlayLoading text='Đang tải..' />}
                    <Pagination style={{ marginLeft: '70px' }} name={PageName} pageNumber={pageNumber} pageSize={pageSize} pageTotal={pageTotal} totalItem={totalItem} pageCondition={pageCondition}
                        getPage={this.getPage} />
                </div>
            </>,
            backRoute: '/user/tccb',
            onCreate: permission ? e => this.create(e) : null,
            // onExport: (e) => {
            //     e.preventDefault();
            //     const filter = JSON.stringify(this.state.filter || {});

            //     T.download(T.url(`/api/staff/download-excel/${filter}`), 'Danh sach can bo.xlsx');
            // }
        });
    }
}

const mapStateToProps = state => ({ system: state.system, staff: state.tccb.staff });
const mapActionsToProps = { getStaffPage, deleteStaff, getDmDonViAll };
export default connect(mapStateToProps, mapActionsToProps)(StaffPage);
import React from 'react';
import { connect } from 'react-redux';
import {
    AdminPage,
    FormDatePicker,
    renderTable,
    FormSelect,
    TableCell,
    TableHeader
} from 'view/component/AdminPage';
import { Link } from 'react-router-dom';
import {
    getHcthCongVanDenAll,
    getHcthCongVanDenPage,
    createHcthCongVanDen,
    updateHcthCongVanDen,
    deleteHcthCongVanDen,
    getHcthCongVanDenSearchPage
} from './redux';
import { SelectAdapter_DmDonViGuiCongVan } from 'modules/mdDanhMuc/dmDonViGuiCv/redux';
import { SelectAdapter_DmDonVi } from 'modules/mdDanhMuc/dmDonVi/redux';
import { SelectAdapter_FwCanBo } from 'modules/mdTccb/tccbCanBo/redux';
import Pagination from 'view/component/Pagination';

const timeList = [
    { id: 1, text: 'Theo ngày công văn' },
    { id: 2, text: 'Theo ngày nhận' },
    { id: 3, text: 'Theo ngày hết hạn' },
];


const
    start = new Date().getFullYear(),
    end = 1900,
    yearSelector = [...Array(start - end + 1).keys()].map(i => ({
        id: start - i,
        text: start - i
    }));


class HcthCongVanDenStaffPage extends AdminPage {

    state = { filter: {}, sortBy: '', sortType: '' };

    componentDidMount() {
        T.ready('/user/hcth', () => {
            T.clearSearchBox();
            T.onSearch = (searchText) => this.getPage(undefined, undefined, searchText || '');
            T.showSearchBox(() => {
                this.congVanYear?.value(0);
                this.maDonViGuiCV?.value('');
                this.donViNhanCongVan?.value('');
                this.canBoNhanCongVan?.value('');
                this.timeType?.value('');
                this.fromTime?.value('');
                this.toTime?.value('');
                setTimeout(() => this.changeAdvancedSearch(), 50);
            });
            this.getPage();
            this.changeAdvancedSearch(true);
        });
    }

    changeAdvancedSearch = (isInitial = false) => {
        let { pageNumber, pageSize } = this.props && this.props.hcthCongVanDen && this.props.hcthCongVanDen.page ? this.props.hcthCongVanDen.page : { pageNumber: 1, pageSize: 50 };
        let donViGuiCongVan = this.donViGuiCongVan?.value() || null;
        let donViNhanCongVan = this.donViNhanCongVan?.value().toString() || null;
        let canBoNhanCongVan = this.canBoNhanCongVan?.value() || null;
        let timeType = this.timeType?.value() || null;
        let fromTime = this.fromTime?.value() ? Number(this.fromTime.value()) : null;
        let toTime = this.toTime?.value() ? Number(this.toTime.value()) : null;
        let congVanYear = this.congVanYear?.value() || null;

        const pageFilter = isInitial ? {} : { donViGuiCongVan, donViNhanCongVan, canBoNhanCongVan, timeType, fromTime, toTime, congVanYear };
        this.setState({ filter: pageFilter }, () => {
            this.getPage(pageNumber, pageSize, '', (page) => {
                if (isInitial) {
                    const filter = page.filter || {};
                    this.setState({ filter: !$.isEmptyObject(filter) ? filter : pageFilter });
                    this.donViGuiCongVan?.value(filter.donViGuiCongVan || '');
                    this.donViNhanCongVan?.value(filter.donViNhanCongVan || '');
                    this.canBoNhanCongVan?.value(filter.canBoNhanCongVan || '');
                    this.timeType?.value(filter.timeType || '');
                    this.fromTime?.value(filter.fromTime || '');
                    this.toTime?.value(filter.toTime || '');
                    this.congVanYear?.value(filter.congVanYear || '');
                    if (!$.isEmptyObject(filter) && filter && (filter.donViGuiCongVan || filter.donViNhanCongVan || filter.canBoNhanCongVan || filter.timeType || filter.fromTime || filter.toTime)) this.showAdvanceSearch();
                }
            });
        });
    };

    getPage = (pageN, pageS, pageC, done) => {
        this.props.getHcthCongVanDenSearchPage(pageN, pageS, pageC, { ...this.state.filter, sortBy: this.state.sortBy, sortType: this.state.sortType }, done);
    }



    showModal = (e) => {
        e.preventDefault();
        this.modal.show();
    }

    onDelete = (e, item) => {
        e.preventDefault();
        T.confirm('Xóa công văn đến', 'Bạn có chắc bạn muốn xóa công văn này?', true,
            isConfirm => isConfirm && this.props.deleteHcthCongVanDen(item.id));
    }

    onSort = (value, type) => {
        this.setState({ sortBy: type && value, sortType: type }, () => this.changeAdvancedSearch());
    }

    render() {
        const currentPermissions = this.props.system && this.props.system.user && this.props.system.user.permissions ? this.props.system.user.permissions : [],
            permission = this.getUserPermission('hcthCongVanDen', ['read', 'write', 'delete']);
        let { pageNumber, pageSize, pageTotal, totalItem, pageCondition, list } = this.props.hcthCongVanDen && this.props.hcthCongVanDen.page ? this.props.hcthCongVanDen.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, pageCondition: {}, list: [] };
        let table = renderTable({
            getDataSource: () => list,
            emptyTable: 'Không dữ liệu công văn đến',
            stickyHead: false,
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap', }}>Số CV</th>
                    <TableHeader style={{ width: '10%', whiteSpace: 'nowrap' }} sort isSorted={this.state.sortBy == 'ngayNhan'} onSort={(type) => this.onSort('ngayNhan', type)}>Ngày nhận</TableHeader>
                    <TableHeader style={{ width: '10%', whiteSpace: 'nowrap' }} sort isSorted={this.state.sortBy == 'ngayHetHan'} onSort={(type) => this.onSort('ngayHetHan', type)}>Hết hạn</TableHeader>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Đơn vị gửi</th>
                    <th style={{ width: '80%', whiteSpace: 'nowrap' }}>Trích yếu</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Đơn vị, người nhận</th>
                    <TableHeader style={{ width: 'auto', whiteSpace: 'nowrap' }} sort isSorted={this.state.sortBy == 'tinhTrang'} onSort={(type) => this.onSort('tinhTrang', type)}>Tình trạng</TableHeader>
                    <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>Thao tác</th>
                </tr>),
            renderRow: (item, index) => {
                let danhSachCanBoNhan = item.danhSachCanBoNhan?.split(';');
                let danhSachDonViNhan = item.danhSachDonViNhan?.split(';');
                return (
                    <tr key={index}>
                        <TableCell type='text' style={{ textAlign: 'right' }} content={(pageNumber - 1) * pageSize + index + 1} />
                        <TableCell type='text' content={
                            <>
                                <Link to={`/user/hcth/cong-van-den/${item.id}`}>{item.soCongVan || 'Chưa có số công văn'}</Link>
                                {item.ngayCongVan ? <span style={{ whiteSpace: 'nowrap' }}><br />{'Ngày CV: ' + T.dateToText(item.ngayCongVan, 'dd/mm/yyyy')}</span> : null}
                            </>
                        } />
                        <TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={
                            item.ngayNhan ? (<>
                                <span style={{ color: 'blue' }}> {T.dateToText(item.ngayNhan, 'dd/mm/yyyy')}</span>
                            </>) : null
                        } />
                        <TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={
                            item.ngayHetHan ? (<>
                                <span style={{ color: 'red' }}> {T.dateToText(item.ngayHetHan, 'dd/mm/yyyy')}</span>
                            </>) : null
                        } />
                        <TableCell type='text' contentClassName='multiple-lines' content={item.tenDonViGuiCV} />
                        <TableCell type='text' content={item.trichYeu} />
                        <TableCell type='text' contentClassName='multiple-lines' style={{ whiteSpace: 'nowrap' }} content={
                            <>
                                <span>{danhSachCanBoNhan && danhSachCanBoNhan.length > 0 ? danhSachCanBoNhan.map((item, index) => (
                                    <span key={index}>
                                        <b style={{ color: 'blue' }}>{item.normalizedName()}</b>
                                        <br />
                                    </span>
                                )) : null}
                                </span>
                                <span>{danhSachDonViNhan && danhSachDonViNhan.length > 0 ? danhSachDonViNhan.map((item, index) => (
                                    <span key={index}>
                                        <b>{item?.normalizedName()}</b>
                                        <br />
                                    </span>
                                )) : null
                                }</span>
                            </>
                        } />

                        <TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={
                            item.hasChiDao ?
                                (<span style={{ color: 'blue' }}>Đã chỉ đạo</span>) :
                                (<span style={{ color: 'red' }}>Chưa chỉ đạo</span>)
                        } />
                        <TableCell type='buttons' style={{ textAlign: 'center' }} content={item} permission={permission} onEdit={() => this.props.history.push(`/user/hcth/cong-van-den/${item.id}`)} onDelete={(e) => this.onDelete(e, item)} permissions={currentPermissions} />
                    </tr>);
            }
        });
        return this.renderPage({
            icon: 'fa fa-caret-square-o-left',
            title: 'Công văn đến',
            breadcrumb: [
                <Link key={0} to='/user/hcth'>Hành chính tổng hợp</Link>,
                'Công văn đến'
            ],
            header: <FormSelect style={{ width: '300px', marginBottom: '0' }} allowClear={true} ref={e => this.congVanYear = e} placeholder='Năm' onChange={() => this.changeAdvancedSearch()} data={yearSelector} />,
            advanceSearch: <>
                <div className='row'>
                    <div className='col-12 col-md-12 row'>

                        <FormSelect allowClear={true} className='col-md-3' ref={e => this.timeType = e} label='Theo thời gian' data={timeList} onChange={() => this.changeAdvancedSearch()} />
                        {this.timeType?.value() && (<>
                            <FormDatePicker type='date' className='col-md-3' ref={e => this.fromTime = e} label='Từ ngày' onChange={() => this.changeAdvancedSearch()} />
                            <FormDatePicker type='date' className='col-md-3' ref={e => this.toTime = e} label='Đến ngày' onChange={() => this.changeAdvancedSearch()} />
                        </>)}
                    </div>
                    <FormSelect allowClear={true} className='col-md-4' ref={e => this.donViGuiCongVan = e} label='Đơn vị gửi công văn' data={SelectAdapter_DmDonViGuiCongVan} onChange={() => this.changeAdvancedSearch()} />
                    <FormSelect multiple={true} allowClear={true} className='col-md-4' ref={e => this.donViNhanCongVan = e} label='Đơn vị nhận công văn' data={SelectAdapter_DmDonVi} onChange={() => this.changeAdvancedSearch()} />
                    <FormSelect allowClear={true} className='col-md-4' ref={e => this.canBoNhanCongVan = e} label='Cán bộ nhận công văn' data={SelectAdapter_FwCanBo} onChange={() => this.changeAdvancedSearch()} />
                </div>
            </>,
            content: <div className='tile'>
                {/* <FormTextBox type='year' ref={e => this.congVanYear = e} label='Năm' onChange={() => this.changeAdvancedSearch()} /> */}
                {table}
                <Pagination style={{ marginLeft: '70px' }} {...{ pageNumber, pageSize, pageTotal, totalItem, pageCondition }}
                    getPage={this.getPage} />
            </div>,

            onCreate: permission && permission.write ? () => this.props.history.push('/user/hcth/cong-van-den/new') : null,
            backRoute: '/user/hcth',
        });
    }
}


const mapStateToProps = state => ({ system: state.system, hcthCongVanDen: state.hcth.hcthCongVanDen });
const mapActionsToProps = { getHcthCongVanDenAll, getHcthCongVanDenPage, createHcthCongVanDen, updateHcthCongVanDen, deleteHcthCongVanDen, getHcthCongVanDenSearchPage };
export default connect(mapStateToProps, mapActionsToProps)(HcthCongVanDenStaffPage);

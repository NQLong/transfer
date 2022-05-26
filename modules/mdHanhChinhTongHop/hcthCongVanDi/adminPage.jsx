import React from 'react';
import { connect } from 'react-redux';
import {
    getHcthCongVanDiPage,
    getHcthCongVanDiAll,
    createHcthCongVanDi,
    updateHcthCongVanDi,
    deleteHcthCongVanDi,
    getHcthCongVanDiSearchPage
} from './redux';
import Pagination from 'view/component/Pagination';
import { Link } from 'react-router-dom';
import {
    AdminPage,
    renderTable,
    FormSelect,
    TableCell,
} from 'view/component/AdminPage';
import { SelectAdapter_DmDonVi } from 'modules/mdDanhMuc/dmDonVi/redux';
import { SelectAdapter_FwCanBo } from 'modules/mdTccb/tccbCanBo/redux';
import {
    SelectAdapter_DmDonViGuiCongVan
} from 'modules/mdDanhMuc/dmDonViGuiCv/redux';
const { loaiCongVan } = require('../constant');

const listTrangThai = {
    '1': {
        status: 'Mới',
        color: 'red'
    },
    '2': {
        status: 'Chờ kiểm tra',
        color: 'blue'
    },
    '3': {
        status: 'Chờ duyệt',
        color: 'blue'
    },
    '4': {
        status: 'Trả lại',
        color: 'red'
    },
    '5': {
        status: 'Đã gửi',
        color: 'green'
    },
    '7': {
        status: 'Đã duyệt',
        color: 'green'
    }
};

const selectCongVan = [
    { id: 1, text: 'Công văn đơn vị' },
    { id: 2, text: 'Công văn trường' }
];

class HcthCongVanDi extends AdminPage {
    state = { filter: {} };

    componentDidMount() {
        T.ready(this.getSiteSetting().readyUrl, () => {
            T.clearSearchBox();
            T.onSearch = (searchText) => this.getPage(undefined, undefined, searchText || '');
            T.showSearchBox(() => {
                this.maDonViGui?.value('');
                this.maDonViNhan?.value('');
                this.maCanBoNhan?.value('');
                this.donViNhanNgoai?.value('');
                this.status?.value('');
                setTimeout(() => this.changeAdvancedSearch(), 50);
            });
            this.changeAdvancedSearch(true);
        });
    }

    getSiteSetting = () => {
        const pathName = window.location.pathname;
        if (pathName.startsWith('/user/hcth'))
            return {
                readyUrl: '/user/hcth',
                breadcrumb: [
                    <Link key={0} to='/user/hcth'>Hành chính tổng hợp</Link>,
                    'Danh sách công văn các phòng',
                ],
                backRoute: '/user/hcth',
                baseUrl: '/user/hcth/cong-van-cac-phong',
            };
        else
            return {
                readyUrl: '/user',
                breadcrumb: [
                    <Link key={0} to='/user/'>Trang cá nhân</Link>,
                    'Danh sách công văn các phòng',
                ],
                backRoute: '/user',
                baseUrl: '/user/cong-van-cac-phong',
            };
    }

    changeAdvancedSearch = (isInitial = false) => {
        let { pageNumber, pageSize } = this.props && this.props.hcthCongVanDi && this.props.hcthCongVanDi.page ? this.props.hcthCongVanDi.page : { pageNumber: 1, pageSize: 50 };
        let donViGui = this.donViGui?.value() || null;
        let donViNhan = this.donViNhan?.value() || null;
        let canBoNhan = this.canBoNhan?.value() || null;
        let loaiCongVan = this.loaiCongVan?.value() || null;
        //let congVanLaySo = this.congVanLaySo?.value() || null;
        let donViNhanNgoai = this.donViNhanNgoai?.value() || null;
        let status = this.status?.value() || null;

        let permissions = this.props.system?.user?.permissions;
        let hcthStaff = permissions.includes('hcth:login') ? { loaiCongVan: 2 } : {};

        const pageFilter = isInitial ? hcthStaff : { donViGui, donViNhan, canBoNhan, loaiCongVan, donViNhanNgoai, status };
        this.setState({ filter: pageFilter }, () => {
            this.getPage(pageNumber, pageSize, '', (page) => {
                if (isInitial) {
                    const filter = page.filter || {};
                    this.setState({ filter: !$.isEmptyObject(filter) ? filter : pageFilter });
                    this.donViGui?.value(filter.donViGui || '');
                    this.donViNhan?.value(filter.donViNhan || '');
                    this.canBoNhan?.value(filter.canBoNhan || '');
                    this.loaiCongVan?.value(filter.loaiCongVan || '');
                    this.status?.value(filter.status || '');
                    this.donViNhanNgoai?.value(filter.donViNhanNgoai || '');
                    if (!$.isEmptyObject(filter) && filter && (filter.donViGui || filter.donViNhan || filter.canBoNhan || filter.donViNhanNgoai)) this.showAdvanceSearch();
                }
            });
        });
    };

    getPage = (pageN, pageS, pageC, done) => {
        this.props.getHcthCongVanDiSearchPage(pageN, pageS, pageC, this.state.filter, done);
    }

    onDelete = (e, item) => {
        e.preventDefault();
        T.confirm('Xóa công văn', 'Bạn có chắc chắn muốn xóa công văn này?', true,
            isConfirm => isConfirm && this.props.deleteHcthCongVanDi(item.id));
    }

    render() {
        const currentPermissions = this.props.system && this.props.system.user && this.props.system.user.permissions ? this.props.system.user.permissions : [],
            permission = this.getUserPermission('hcthCongVanDi', ['read', 'write', 'delete']),
            hcthManagePermission = this.getUserPermission('hcthCongVanDi', ['manage']),
            unitManagePermission = this.getUserPermission('donViCongVanDi', ['manage']),
            { baseUrl, breadcrumb, backRoute } = this.getSiteSetting();
        let { pageNumber, pageSize, pageTotal, totalItem, pageCondition, list } = this.props.hcthCongVanDi && this.props.hcthCongVanDi.page ?
            this.props.hcthCongVanDi.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, pageCondition: {}, list: null };

        const selectStatus = Object.keys(listTrangThai).map(item =>
        ({
            id: item,
            text: listTrangThai[item].status
        }));
        // Chỉ trưởng phòng mới có quyền thêm công văn
        let table = renderTable({
            emptyTable: 'Chưa có dữ liệu công văn các phòng',
            getDataSource: () => list,
            stickyHead: false,
            header: 'thead-light',
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', textAlign: 'center', verticalAlign: 'middle' }}>#</th>
                    <th style={{ width: 'auto', verticalAlign: 'middle', whiteSpace: 'nowrap' }}>Số công văn</th>
                    <th style={{ width: 'auto', verticalAlign: 'middle', whiteSpace: 'nowrap' }}>Loại công văn</th>
                    <th style={{ width: 'auto', verticalAlign: 'middle', whiteSpace: 'nowrap' }}>Loại văn bản</th>
                    <th style={{ width: '100%', verticalAlign: 'middle' }}>Trích yếu</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap', verticalAlign: 'middle' }}>Thời gian</th>
                    <th style={{ width: 'auto', verticalAlign: 'middle' }}>Đơn vị gửi</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap', verticalAlign: 'middle' }}>Đơn vị, người nhận</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap', verticalAlign: 'middle' }}>Trạng thái</th>
                    <th style={{ width: 'auto', textAlign: 'center', verticalAlign: 'middle' }}>Thao tác</th>
                </tr>),
            renderRow: (item, index) => {
                let danhSachDonViNhan = item.danhSachDonViNhan?.split(';'),
                    danhSachCanBoNhan = item.danhSachCanBoNhan?.split(';'),
                    danhSachDonViNhanNgoai = item.danhSachDonViNhanNgoai?.split(';'),
                    loaiCongVanItem = item.loaiCongVan && loaiCongVan[item.loaiCongVan];
                return (
                    <tr key={index}>
                        <TableCell type='text' style={{ textAlign: 'center' }} content={(pageNumber - 1) * pageSize + index + 1} />
                        <TableCell type='link' style={{ whiteSpace: 'nowrap' }} onClick={() => this.props.history.push(`${baseUrl}/${item.id}`)} content={item.soCongVan ? item.soCongVan : 'Chưa có số công văn'} />
                        <TableCell type='text' style={{ whiteSpace: 'nowrap', color: loaiCongVanItem ? loaiCongVanItem.color : 'blue' }} content={loaiCongVanItem?.text} />
                        <TableCell type='text' style={{ whiteSpace: 'nowrap', color: 'blue' }} content={item.tenLoaiVanBan} />
                        <TableCell type='text' contentClassName='multiple-lines' contentStyle={{ width: '100%', minWidth: '250px' }} content={item.trichYeu || ''} />
                        <TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={
                            <>
                                {
                                    item.ngayGui ? (<>
                                        <span>Ngày gửi:</span><span style={{ color: 'blue' }}> {T.dateToText(item.ngayGui, 'dd/mm/yyyy')}</span>
                                    </>) : null
                                }
                                {item.ngayKy && item.ngayKy ? <br /> : null}
                                {
                                    item.ngayKy ? (<>
                                        <span>Ngày ký:</span><span style={{ color: 'red' }}> {T.dateToText(item.ngayKy, 'dd/mm/yyyy')}</span>
                                    </>) : null
                                }
                            </>
                        } />
                        <TableCell type='text' contentClassName='multiple-lines' content={item.tenDonViGui ? item.tenDonViGui.normalizedName() : ''} />
                        <TableCell type='text' style={{}} contentStyle={{ width: '12rem' }} content={
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
                                <span>{danhSachDonViNhanNgoai && danhSachDonViNhanNgoai.length > 0 ? danhSachDonViNhanNgoai.map((item, index) => (
                                    <span key={index}>
                                        <b>{item?.normalizedName()}</b>
                                        <br />
                                    </span>
                                )) : null
                                }</span>
                            </>
                        } />
                        <TableCell type='text' style={{ whiteSpace: 'nowrap', color: item.trangThai ? listTrangThai[item.trangThai].color : '' }} content={item.trangThai ? listTrangThai[item.trangThai].status : ''}></TableCell>
                        <TableCell type='buttons' style={{ textAlign: 'center' }} content={item} permission={{ ...permission, delete: permission.delete && item.trangThai == '1' }}
                            onEdit={`${baseUrl}/${item.id}`}
                            onDelete={(e) => this.onDelete(e, item)} permissions={currentPermissions} />
                    </tr>

                );
            }
        });

        return this.renderPage({
            icon: 'fa fa-caret-square-o-left',
            title: 'Công văn các phòng',
            breadcrumb: breadcrumb,
            onCreate: ((unitManagePermission && unitManagePermission.manage) || (hcthManagePermission && hcthManagePermission.manage)) ? () => (window.location.pathname.startsWith('/user/hcth') ? this.props.history.push('/user/hcth/cong-van-cac-phong/new') : this.props.history.push('/user/cong-van-cac-phong/new')) : null,
            header: <>
                <FormSelect style={{ width: '200px', marginBottom: '0', marginRight: '8px' }} ref={e => this.loaiCongVan = e} placeholder="Loại công văn" data={selectCongVan} allowClear={true} onChange={() => this.changeAdvancedSearch()} />
                <FormSelect style={{ width: '200px', marginBottom: '0' }} allowClear={true} ref={e => this.donViGui = e} placeholder="Đơn vị gửi" data={SelectAdapter_DmDonVi} onChange={() => this.changeAdvancedSearch()} />
            </>,
            content: <>
                <div className="tile" style={{ overflowX: 'auto' }}>
                    {table}
                </div>
                <Pagination style={{ marginLeft: '70px' }} {...{ pageNumber, pageSize, pageTotal, totalItem, pageCondition }}
                    getPage={this.getPage} />
            </>,
            backRoute: backRoute,
            advanceSearch: <>
                <div className="row">
                    <FormSelect allowClear={true} className='col-md-4' ref={e => this.donViNhan = e} label='Đơn vị nhận' data={SelectAdapter_DmDonVi} onChange={() => this.changeAdvancedSearch()} />
                    <FormSelect allowClear={true} className='col-md-4' ref={e => this.canBoNhan = e} label='Cán bộ nhận' data={SelectAdapter_FwCanBo} onChange={() => this.changeAdvancedSearch()} />
                    <FormSelect allowClear={true} className='col-md-4' ref={e => this.donViNhanNgoai = e} label='Đơn vị nhận bên ngoài' data={SelectAdapter_DmDonViGuiCongVan} onChange={() => this.changeAdvancedSearch()} />
                    <FormSelect allowClear={true} className='col-md-4' ref={e => this.status = e} label='Trạng thái' data={selectStatus} onChange={() => this.changeAdvancedSearch()} />
                </div>
            </>

        });
    }
}


const mapStateToProps = state => ({ system: state.system, hcthCongVanDi: state.hcth.hcthCongVanDi });
const mapActionsToProps = {
    getHcthCongVanDiAll,
    getHcthCongVanDiPage,
    createHcthCongVanDi,
    updateHcthCongVanDi,
    deleteHcthCongVanDi,
    getHcthCongVanDiSearchPage
};
export default connect(mapStateToProps, mapActionsToProps)(HcthCongVanDi);

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


const listTrangThai = {
    '1': {
        status: 'Mới',
        color: '#a86e18'
    },
    '2': {
        status: 'Chờ duyệt',
        color: '#9aa115'
    },
    '3': {
        status: 'Đã duyệt',
        color: '#438238'
    },
    '4': {
        status: 'Trả lại',
        color: '#911717'
    },
    '5': {
        status: 'Đã gửi',
        color: '#165e91F'
    },
    '6': {
        status: 'Đã đọc',
        color: '#114d78'
    }
};

const selectCongVan = [
    {id: 1, text: 'Nội bộ'},
    {id: 2, text: 'Ra ngoài'}
];
class HcthCongVanDi extends AdminPage {
    state = { filter: {} };

    componentDidMount() {
        T.ready('/user/hcth', () => {
            T.clearSearchBox();
            T.onSearch = (searchText) => this.getPage(undefined, undefined, searchText || '');
            T.showSearchBox(() => {
                this.loaiCongVan?.value('');
                this.maDonViGui?.value('');
                this.maDonViNhan?.value('');
                this.maCanBoNhan?.value('');
                this.donViNhanNgoai?.value('');
                setTimeout(() => this.changeAdvancedSearch(), 50);
            });
            this.getPage();
            this.changeAdvancedSearch(true);
        });
    }

    changeAdvancedSearch = (isInitial = false) => {
        let { pageNumber, pageSize } = this.props && this.props.hcthCongVanDi && this.props.hcthCongVanDi.page ? this.props.hcthCongVanDi.page : { pageNumber: 1, pageSize: 50 };
        let donViGui = this.donViGui?.value() || null;
        let donViNhan = this.donViNhan?.value() || null;
        let canBoNhan = this.canBoNhan?.value() || null;
        let loaiCongVan = this.loaiCongVan?.value() || null;
        let donViNhanNgoai = this.donViNhanNgoai?.value() || null;
        // let trangThai = this.trangThai?.value() || null;


        const pageFilter = isInitial ? {} : { donViGui, donViNhan, canBoNhan, loaiCongVan, donViNhanNgoai };
        this.setState({ filter: pageFilter }, () => {
            this.getPage(pageNumber, pageSize, '', (page) => {
                if (isInitial) {
                    const filter = page.filter || {};
                    this.setState({ filter: !$.isEmptyObject(filter) ? filter : pageFilter });
                    this.donViGui?.value(filter.donViGui || '');
                    this.donViNhan?.value(filter.donViNhan || '');
                    this.canBoNhan?.value(filter.canBoNhan || '');
                    this.loaiCongVan?.value(filter.loaiCongVan || '');
                    this.donViNhanNgoai?.value(filter.donViNhanNgoai || '');
                    if (!$.isEmptyObject(filter) && filter && (filter.donViGui || filter.donViNhan || filter.canBoNhan || filter.loaiCongVan || filter.donViNhanNgoai)) this.showAdvanceSearch();
                }
            });
        });
    };

    getPage = (pageN, pageS, pageC, done) => {
        this.props.getHcthCongVanDiSearchPage(pageN, pageS, pageC, this.state.filter, done);
    }

    onDelete = (e, item) => {
        e.preventDefault();
        T.confirm('Xóa công văn', 'Bạn có chắc bạn muốn xóa công văn này?', true,
            isConfirm => isConfirm && this.props.deleteHcthCongVanDi(item.id));

    }

    getSoCongVan = (soDi, donVi, loai) => {
        return soDi + '/' + loai + '-XHNV-' + donVi;
    }
    render() {
        const currentPermissions = this.props.system && this.props.system.user && this.props.system.user.permissions ? this.props.system.user.permissions : [],
            permission = this.getUserPermission('hcthCongVanDi', ['read', 'write', 'delete']);
        let { pageNumber, pageSize, pageTotal, totalItem, pageCondition, list } = this.props.hcthCongVanDi && this.props.hcthCongVanDi.page ?
            this.props.hcthCongVanDi.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, pageCondition: {}, list: [] };
    
        // Chỉ trưởng phòng mới có quyền thêm công văn
        let listDonViQuanLy = this.props.system && this.props.system.user.staff && this.props.system.user.staff.donViQuanLy ? this.props.system.user.staff.donViQuanLy : [];
        let dsQuanLy = listDonViQuanLy.map(item => item.maDonVi).toString();
        // console.log(dsQuanLy);
        let table = renderTable({
            emptyTable: 'Chưa có dữ liệu công văn các phòng',
            getDataSource: () => list, stickyHead: false,
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', textAlign: 'center', verticalAlign: 'middle'}}>#</th>
                    <th style={{ width: 'auto', verticalAlign: 'middle', whiteSpace: 'nowrap'}}>Số công văn</th>
                    <th style={{ width: '100%', verticalAlign: 'middle' }}>Trích yếu</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap', verticalAlign: 'middle' }}>Thời gian</th>
                    <th style={{ width: 'auto', verticalAlign: 'middle' }}>Đơn vị gửi</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap', verticalAlign: 'middle' }}>Đơn vị, nguời nhận</th>
                    {/* <th style={{ width: 'auto', verticalAlign: 'middle' }}>Tình trạng</th> */}
                    <th style={{ width: 'auto', whiteSpace: 'nowrap', verticalAlign: 'middle' }}>Trạng thái</th>
                    <th style={{ width: 'auto', textAlign: 'center', verticalAlign: 'middle' }}>Thao tác</th>
                </tr>),
            renderRow: (item, index) => {
                let danhSachDonViNhan = item.danhSachDonViNhan?.split(';');
                let danhSachCanBoNhan = item.danhSachCanBoNhan?.split(';');
                let danhSachDonViNhanNgoai = item.danhSachDonViNhanNgoai?.split(';');
                return (
                    <tr key={index}>
                        <TableCell type='text' style={{ textAlign: 'center' }} content={(pageNumber - 1) * pageSize + index + 1} />
                        <TableCell type='text' style={{ whiteSpace: 'nowrap', fontWeight: 'bold'}} content={item.soDi && item.tenVietTatDonViGui ? this.getSoCongVan(item.soDi, item.tenVietTatDonViGui, item.tenVietTatLoaiCongVanDi) : ''} />
                        <TableCell type='link' content={item.trichYeu || ''} onClick={() => this.props.history.push(`/user/hcth/cong-van-cac-phong/${item.id}`)} />
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
                        <TableCell type='text' style={{}} contentStyle={{ width: '10rem' }} content={
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
                        <TableCell type='text' style={{ whiteSpace: 'nowrap', color: item.trangThai ? listTrangThai[item.trangThai].color : '' }} content={item.trangThai? listTrangThai[item.trangThai].status : ''}></TableCell>
                        <TableCell type='buttons' style={{ textAlign: 'center' }} content={item} permission={permission} 
                        onEdit={() => this.props.history.push({ pathname: `/user/hcth/cong-van-cac-phong/${item.id}`, state: { soCongVan: this.getSoCongVan(item.soDi, item.tenVietTatDonViGui, item.tenVietTatLoaiCongVanDi) }})} 
                        onDelete={(e) => this.onDelete(e, item)} permissions={currentPermissions} />
                    </tr>

                );
            }
        });

        return this.renderPage({
            icon: 'fa fa-caret-square-o-left',
            title: 'Công văn giữa các phòng',
            breadcrumb: [
                <Link key={0} to='/user/hcth'>Hành chính tổng hơp</Link>,
                'Công văn giữa các phòng'
            ],
            onCreate: (permission && permission.write) || (dsQuanLy.length >= 1) ? () => this.props.history.push('/user/hcth/cong-van-cac-phong/new') : null,
            header: <>
                <FormSelect style={{ width: '150px', marginBottom: '0', marginRight: '16px' }} allowClear={true} ref={e => this.loaiCongVan = e} placeholder="Loại công văn" data={selectCongVan} onChange={() => this.changeAdvancedSearch()} />
                <FormSelect style={{ width: '300px', marginBottom: '0' }} allowClear={true} ref={e => this.donViGui = e} placeholder="Đơn vị gửi" data={SelectAdapter_DmDonVi} onChange={() => this.changeAdvancedSearch()} />
            </>,
            content: <>
                <div className="tile">
                    {table}
                </div>
                <Pagination style={{ marginLeft: '70px' }} {...{ pageNumber, pageSize, pageTotal, totalItem, pageCondition }}
                    getPage={this.getPage} />
            </>,
            backRoute: '/user/hcth',
            advanceSearch: <>
                <div className="row">
                    <FormSelect allowClear={true} className='col-md-4' ref={e => this.donViNhan = e} label='Đơn vị nhận' data={SelectAdapter_DmDonVi} onChange={() => this.changeAdvancedSearch()} />
                    <FormSelect allowClear={true} className='col-md-4' ref={e => this.canBoNhan = e} label='Cán bộ nhận' data={SelectAdapter_FwCanBo} onChange={() => this.changeAdvancedSearch()} />
                    <FormSelect allowClear={true} className='col-md-4' ref={e => this.donViNhanNgoai = e} label='Đơn vị nhận bên ngoài' data={SelectAdapter_DmDonViGuiCongVan} onChange={() => this.changeAdvancedSearch()} />
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
